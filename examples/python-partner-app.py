#!/usr/bin/env python3
"""
ClipForge Partner App - Python Example

Complete workflow: upload → detect → export → handle webhook
"""

import os
import sys
import time
import hmac
import hashlib
import json
from typing import Optional
from flask import Flask, request, jsonify

# Add SDK to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'sdks', 'python'))

from clipforge import ClipForgeClient

# Configuration
API_URL = os.getenv('CLIPFORGE_API_URL', 'http://localhost:3000')
API_KEY = os.getenv('CLIPFORGE_API_KEY', 'your-api-key')
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'your-webhook-secret')
WEBHOOK_URL = os.getenv('WEBHOOK_URL', 'http://localhost:5000/webhook')

# Initialize client
client = ClipForgeClient(api_url=API_URL, api_key=API_KEY)

# Initialize Flask for webhook handling
app = Flask(__name__)


def run_workflow():
    """Run complete ClipForge workflow"""
    try:
        print('🚀 Starting ClipForge Partner App workflow...\n')

        # Step 1: Create project
        print('1️⃣  Creating project...')
        project = client.create_project(
            title='My Awesome Video',
            source_url='https://example.com/video.mp4'
        )
        project_id = project.id
        print(f'✅ Project created: {project_id}\n')

        # Step 2: Start highlight detection
        print('2️⃣  Starting highlight detection...')
        client.detect_highlights(project_id, num_clips=6)
        print('✅ Detection started (async job)\n')

        # Step 3: Poll for clips
        print('3️⃣  Polling for clips...')
        clips = []
        attempts = 0
        while not clips and attempts < 30:
            time.sleep(2)  # Wait 2 seconds
            clips = client.list_clips(project_id)
            attempts += 1
            print(f'   Attempt {attempts}: {len(clips)} clips found')

        if not clips:
            print('❌ No clips detected after 60 seconds')
            return

        print(f'✅ Found {len(clips)} clips\n')

        # Step 4: Create export for first clip
        print('4️⃣  Creating export...')
        first_clip = clips[0]
        export = client.create_export(
            clip_id=first_clip.id,
            format='MP4',
            aspect_ratio='9:16',
            template='default'
        )
        export_id = export.id
        print(f'✅ Export created: {export_id}\n')

        # Step 5: Register webhook
        print('5️⃣  Registering webhook...')
        webhook = client.register_webhook(
            url=WEBHOOK_URL,
            events=['export.ready', 'job.failed']
        )
        print(f'✅ Webhook registered: {webhook.id}\n')

        # Step 6: Poll for export completion
        print('6️⃣  Polling for export completion...')
        export_status = 'PENDING'
        attempts = 0
        while export_status != 'COMPLETED' and attempts < 60:
            time.sleep(2)
            export = client.get_export(export_id)
            export_status = export.status
            attempts += 1
            print(f'   Attempt {attempts}: Status = {export_status}')

        if export_status == 'COMPLETED':
            print(f'✅ Export completed!\n')
            print('📦 Artifacts:')
            if export.artifacts:
                print(f'   MP4: {export.artifacts.mp4_url}')
                print(f'   SRT: {export.artifacts.srt_url}')
                print(f'   Thumbnail: {export.artifacts.thumbnail_url}\n')
        else:
            print(f'❌ Export failed or timed out: {export_status}')

        # Step 7: Get usage
        print('7️⃣  Getting usage...')
        usage = client.get_usage()
        print(f'✅ Usage:')
        print(f'   Minutes processed: {usage.minutesProcessed}')
        print(f'   Exports: {usage.exportsCount}\n')

        print('🎉 Workflow complete!')

    except Exception as e:
        print(f'❌ Error: {str(e)}')
        sys.exit(1)


@app.route('/webhook', methods=['POST'])
def webhook_handler():
    """Handle webhook events"""
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
        print(f'   Data: {json.dumps(payload.get("data"), indent=2)}')

        return jsonify({'ok': True})

    except Exception as e:
        print(f'Webhook error: {str(e)}')
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Start webhook server in background
    import threading

    print(f'🔔 Webhook server listening on {WEBHOOK_URL}\n')
    
    webhook_thread = threading.Thread(
        target=lambda: app.run(host='localhost', port=5000, debug=False),
        daemon=True
    )
    webhook_thread.start()

    # Give server time to start
    time.sleep(1)

    # Run workflow
    run_workflow()

    # Keep server running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print('\n👋 Shutting down...')
