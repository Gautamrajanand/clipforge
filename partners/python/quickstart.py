#!/usr/bin/env python3

"""
ClipForge Partner Quickstart - Python

Complete workflow: create project → upload → detect → export → webhook

Usage:
    CLIPFORGE_API_KEY=your-key python quickstart.py /path/to/video.mp4
"""

import os
import sys
import time
import hmac
import hashlib
import json
import requests
from pathlib import Path
from flask import Flask, request, jsonify
import threading

# Configuration
API_URL = os.getenv('CLIPFORGE_API_URL', 'http://localhost:3000')
API_KEY = os.getenv('CLIPFORGE_API_KEY')
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'webhook-secret')
WEBHOOK_URL = os.getenv('WEBHOOK_URL', 'http://localhost:5002/webhook')

if not API_KEY:
    print('❌ Error: CLIPFORGE_API_KEY environment variable not set')
    sys.exit(1)

# API client
class ClipForgeClient:
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.session = requests.Session()
        self.session.headers.update({
            'X-Api-Key': api_key,
            'Content-Type': 'application/json',
        })

    def post(self, endpoint, data):
        url = f"{self.api_url}{endpoint}"
        response = self.session.post(url, json=data)
        response.raise_for_status()
        return response.json()

    def get(self, endpoint):
        url = f"{self.api_url}{endpoint}"
        response = self.session.get(url)
        response.raise_for_status()
        return response.json()

    def put(self, url, data, headers=None):
        response = requests.put(url, data=data, headers=headers or {})
        response.raise_for_status()
        return response

# Webhook server
app = Flask(__name__)
webhook_received = False
webhook_data = None

@app.route('/webhook', methods=['POST'])
def webhook_handler():
    global webhook_received, webhook_data
    
    try:
        signature = request.headers.get('X-Signature')
        payload = request.get_json()

        # Verify signature
        json_str = json.dumps(payload, separators=(',', ':'), sort_keys=True)
        expected = hmac.new(
            WEBHOOK_SECRET.encode(),
            json_str.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            print('❌ Invalid webhook signature')
            return jsonify({'error': 'Invalid signature'}), 401

        print(f'\n📨 Webhook received: {payload.get("event")}')
        webhook_received = True
        webhook_data = payload.get('data')

        return jsonify({'ok': True})

    except Exception as e:
        print(f'Webhook error: {str(e)}')
        return jsonify({'error': str(e)}), 500

def run_workflow(video_path):
    """Run complete ClipForge workflow"""
    try:
        print('🚀 Starting ClipForge Partner Quickstart\n')

        # Validate video file
        video_file = Path(video_path)
        if not video_file.exists():
            raise FileNotFoundError(f'Video file not found: {video_path}')

        file_size = video_file.stat().st_size
        file_name = video_file.name

        print(f'📹 Video: {file_name} ({file_size / 1024 / 1024:.2f} MB)\n')

        client = ClipForgeClient(API_URL, API_KEY)

        # Step 1: Create project
        print('1️⃣  Creating project...')
        project = client.post('/v1/projects', {
            'title': f'Partner Quickstart - {file_name}',
            'sourceUrl': f'file://{video_path}',
        })
        project_id = project['id']
        print(f'✅ Project created: {project_id}\n')

        # Step 2: Get presigned upload URL
        print('2️⃣  Getting presigned upload URL...')
        upload_data = client.post('/v1/uploads/sign', {
            'filename': file_name,
            'mimeType': 'video/mp4',
            'size': file_size,
        })
        upload_url = upload_data['uploadUrl']
        print('✅ Upload URL generated\n')

        # Step 3: Upload file to S3
        print('3️⃣  Uploading video to S3...')
        with open(video_path, 'rb') as f:
            video_buffer = f.read()
        
        client.put(upload_url, video_buffer, {'Content-Type': 'video/mp4'})
        print(f'✅ Video uploaded ({file_size / 1024 / 1024:.2f} MB)\n')

        # Step 4: Start highlight detection
        print('4️⃣  Starting highlight detection...')
        client.post(f'/v1/projects/{project_id}/detect', {
            'numClips': 6,
        })
        print('✅ Detection started (async job)\n')

        # Step 5: Poll for clips
        print('5️⃣  Polling for clips...')
        clips = []
        attempts = 0
        max_attempts = 30  # 60 seconds with 2s intervals

        while not clips and attempts < max_attempts:
            time.sleep(2)
            clips_data = client.get(f'/v1/projects/{project_id}/clips')
            clips = clips_data if isinstance(clips_data, list) else []
            attempts += 1
            print(f'\r   Attempt {attempts}/{max_attempts}: {len(clips)} clips found', end='')

        if not clips:
            raise Exception('No clips detected after 60 seconds')

        print(f'\n✅ Found {len(clips)} clips\n')

        # Display top 3 clips
        print('📊 Top Clips:')
        for idx, clip in enumerate(clips[:3]):
            print(f'   {idx + 1}. Score: {clip["score"] * 100:.0f}% | {clip["reason"]}')
            print(f'      {clip["tStart"]:.1f}s - {clip["tEnd"]:.1f}s ({clip["duration"]:.1f}s)')
        print()

        # Step 6: Create export for first clip
        print('6️⃣  Creating export...')
        first_clip = clips[0]
        export_data = client.post(f'/v1/clips/{first_clip["id"]}/export', {
            'format': 'MP4',
            'aspectRatio': '9:16',
            'template': 'default',
        })
        export_id = export_data['id']
        print(f'✅ Export created: {export_id}\n')

        # Step 7: Register webhook
        print('7️⃣  Registering webhook...')
        webhook_data = client.post('/v1/webhooks/endpoints', {
            'url': WEBHOOK_URL,
            'events': ['export.ready'],
        })
        webhook_id = webhook_data['id']
        print(f'✅ Webhook registered: {webhook_id}\n')

        # Step 8: Start webhook server in background
        print('8️⃣  Starting webhook server...')
        server_thread = threading.Thread(
            target=lambda: app.run(host='localhost', port=5002, debug=False),
            daemon=True
        )
        server_thread.start()
        time.sleep(1)
        print('✅ Webhook server listening on http://localhost:5002\n')

        # Step 9: Poll for export completion
        print('9️⃣  Polling for export completion...')
        export_status = 'PENDING'
        attempts = 0
        max_export_attempts = 120  # 4 minutes with 2s intervals

        while export_status != 'COMPLETED' and attempts < max_export_attempts:
            time.sleep(2)
            export_info = client.get(f'/v1/exports/{export_id}')
            export_status = export_info['status']
            attempts += 1
            print(f'\r   Attempt {attempts}/{max_export_attempts}: Status = {export_status}', end='')

        print()

        if export_status == 'COMPLETED':
            print('✅ Export completed!\n')

            # Wait for webhook (max 10 seconds)
            print('🔔 Waiting for webhook...')
            webhook_attempts = 0
            while not webhook_received and webhook_attempts < 5:
                time.sleep(2)
                webhook_attempts += 1

            if webhook_received and webhook_data:
                print('✅ Webhook received!\n')
                print('📦 Artifacts:')
                print(f'   MP4: {webhook_data["artifacts"]["mp4_url"]}')
                print(f'   SRT: {webhook_data["artifacts"]["srt_url"]}')
                print(f'   Thumbnail: {webhook_data["artifacts"]["thumbnail_url"]}\n')

                # Download artifacts
                print('⬇️  Downloading artifacts...')
                output_dir = Path('./exports')
                output_dir.mkdir(exist_ok=True)

                mp4_path = output_dir / f'{export_id}.mp4'
                srt_path = output_dir / f'{export_id}.srt'

                download_file(webhook_data['artifacts']['mp4_url'], str(mp4_path))
                download_file(webhook_data['artifacts']['srt_url'], str(srt_path))

                print(f'✅ Downloaded to {output_dir}/\n')
            else:
                print('⚠️  Webhook not received (may arrive later)\n')
        else:
            raise Exception(f'Export failed or timed out: {export_status}')

        # Step 10: Get usage
        print('🔟 Getting usage...')
        usage = client.get('/v1/usage')
        print('✅ Usage:')
        print(f'   Minutes processed: {usage["minutesProcessed"]}')
        print(f'   Exports: {usage["exportsCount"]}\n')

        print('🎉 Workflow complete!\n')

        # Keep running for a bit to receive webhooks
        time.sleep(5)

    except Exception as e:
        print(f'\n❌ Error: {str(e)}')
        sys.exit(1)

def download_file(url, file_path):
    """Download file from URL"""
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    with open(file_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python quickstart.py /path/to/video.mp4')
        sys.exit(1)

    video_path = sys.argv[1]
    run_workflow(video_path)
