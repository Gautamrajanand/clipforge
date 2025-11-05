# ClipForge Partner Quickstart - Python

Complete Python example demonstrating the full ClipForge workflow.

## Features

- ✅ Create project
- ✅ Upload video via presigned S3 URL
- ✅ Start highlight detection
- ✅ Poll for ranked clips
- ✅ Create export
- ✅ Register webhook
- ✅ Handle webhook with HMAC verification
- ✅ Download MP4 + SRT artifacts

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

```bash
CLIPFORGE_API_KEY=your-api-key python quickstart.py /path/to/video.mp4
```

### Environment Variables

```bash
# Required
CLIPFORGE_API_KEY=your-api-key

# Optional
CLIPFORGE_API_URL=http://localhost:3000
WEBHOOK_SECRET=webhook-secret
WEBHOOK_URL=http://localhost:5002/webhook
```

## Workflow Steps

### 1. Create Project
```python
client = ClipForgeClient(API_URL, API_KEY)
project = client.post('/v1/projects', {
    'title': 'My Video',
    'sourceUrl': 'file:///path/to/video.mp4',
})
project_id = project['id']
```

### 2. Get Presigned Upload URL
```python
upload_data = client.post('/v1/uploads/sign', {
    'filename': 'video.mp4',
    'mimeType': 'video/mp4',
    'size': file_size,
})
upload_url = upload_data['uploadUrl']
```

### 3. Upload Video
```python
with open(video_path, 'rb') as f:
    video_buffer = f.read()

client.put(upload_url, video_buffer, {'Content-Type': 'video/mp4'})
```

### 4. Start Detection
```python
client.post(f'/v1/projects/{project_id}/detect', {
    'numClips': 6,
})
```

### 5. Poll for Clips
```python
clips = []
while not clips:
    time.sleep(2)
    clips_data = client.get(f'/v1/projects/{project_id}/clips')
    clips = clips_data if isinstance(clips_data, list) else []
```

### 6. Create Export
```python
export_data = client.post(f'/v1/clips/{clips[0]["id"]}/export', {
    'format': 'MP4',
    'aspectRatio': '9:16',
    'template': 'default',
})
export_id = export_data['id']
```

### 7. Register Webhook
```python
webhook_data = client.post('/v1/webhooks/endpoints', {
    'url': 'http://localhost:5002/webhook',
    'events': ['export.ready'],
})
```

### 8. Handle Webhook
```python
@app.route('/webhook', methods=['POST'])
def webhook_handler():
    signature = request.headers.get('X-Signature')
    payload = request.get_json()

    # Verify HMAC signature
    json_str = json.dumps(payload, separators=(',', ':'), sort_keys=True)
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        json_str.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        return jsonify({'error': 'Invalid signature'}), 401

    # Handle export.ready event
    print('Export ready:', payload['data']['artifacts'])
    return jsonify({'ok': True})
```

## Output

The script will:

1. Display project creation status
2. Show upload progress
3. Display detection status
4. List top 3 ranked clips with scores
5. Show export progress
6. Display webhook receipt
7. Download artifacts to `./exports/` directory

Example output:

```
🚀 Starting ClipForge Partner Quickstart

📹 Video: sample.mp4 (50.25 MB)

1️⃣  Creating project...
✅ Project created: proj_abc123

2️⃣  Getting presigned upload URL...
✅ Upload URL generated

3️⃣  Uploading video to S3...
✅ Video uploaded (50.25 MB)

4️⃣  Starting highlight detection...
✅ Detection started (async job)

5️⃣  Polling for clips...
   Attempt 15/30: 6 clips found
✅ Found 6 clips

📊 Top Clips:
   1. Score: 92% | Strong hook • Emotional
      10.5s - 65.5s (55.0s)
   2. Score: 87% | Well-structured
      120.0s - 175.0s (55.0s)
   3. Score: 81% | Novel content
      200.0s - 255.0s (55.0s)

6️⃣  Creating export...
✅ Export created: exp_xyz789

7️⃣  Registering webhook...
✅ Webhook registered: wh_123456

8️⃣  Starting webhook server...
✅ Webhook server listening on http://localhost:5002

9️⃣  Polling for export completion...
   Attempt 45/120: Status = COMPLETED
✅ Export completed!

🔔 Waiting for webhook...
📨 Webhook received: export.ready

📦 Artifacts:
   MP4: https://s3.example.com/exp_xyz789.mp4
   SRT: https://s3.example.com/exp_xyz789.srt
   Thumbnail: https://s3.example.com/exp_xyz789_thumb.jpg

⬇️  Downloading artifacts...
✅ Downloaded to ./exports/

🔟 Getting usage...
✅ Usage:
   Minutes processed: 1.25
   Exports: 1

🎉 Workflow complete!
```

## Error Handling

The script handles common errors:

- **Missing API Key**: Exits with error message
- **File Not Found**: Throws error if video file doesn't exist
- **Upload Failure**: Catches and reports S3 upload errors
- **Detection Timeout**: Exits if no clips detected after 60 seconds
- **Export Timeout**: Exits if export doesn't complete after 4 minutes
- **Invalid Webhook Signature**: Rejects webhook with 401 error

## Customization

### Change Clip Count
```python
client.post(f'/v1/projects/{project_id}/detect', {
    'numClips': 12,  # Get 12 clips instead of 6
})
```

### Change Export Format
```python
client.post(f'/v1/clips/{clip_id}/export', {
    'format': 'MP4',
    'aspectRatio': '1:1',  # Square format
    'template': 'bold',    # Different template
})
```

### Customize Polling Intervals
```python
# Change from 2 seconds to 5 seconds
time.sleep(5)
```

## Troubleshooting

### 401 Unauthorized
- Check `CLIPFORGE_API_KEY` is correct
- Verify API key hasn't expired

### 404 Not Found
- Verify project/clip/export IDs are correct
- Check IDs belong to your organization

### Webhook Not Received
- Ensure webhook server is running on port 5002
- Check firewall allows localhost:5002
- Verify webhook URL is correct

### Upload Fails
- Check video file exists and is readable
- Verify S3 credentials are correct
- Check file size doesn't exceed quota

## Next Steps

1. Integrate into your application
2. Add error handling and retries
3. Store export artifacts in your database
4. Build UI to display results
5. Monitor usage and analytics

## Support

- API Docs: http://localhost:3000/api/docs
- GitHub: https://github.com/clipforge/clipforge
- Email: support@clipforge.dev
