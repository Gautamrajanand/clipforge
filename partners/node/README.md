# ClipForge Partner Quickstart - Node.js

Complete Node.js example demonstrating the full ClipForge workflow.

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
npm install
```

## Usage

### Basic Usage

```bash
CLIPFORGE_API_KEY=your-api-key node quickstart.js /path/to/video.mp4
```

### Environment Variables

```bash
# Required
CLIPFORGE_API_KEY=your-api-key

# Optional
CLIPFORGE_API_URL=http://localhost:3000
WEBHOOK_SECRET=webhook-secret
WEBHOOK_URL=http://localhost:3002/webhook
```

## Workflow Steps

### 1. Create Project
```javascript
const projectRes = await client.post('/v1/projects', {
  title: 'My Video',
  sourceUrl: 'file:///path/to/video.mp4',
});
const projectId = projectRes.data.id;
```

### 2. Get Presigned Upload URL
```javascript
const uploadRes = await client.post('/v1/uploads/sign', {
  filename: 'video.mp4',
  mimeType: 'video/mp4',
  size: fileSize,
});
const { uploadUrl } = uploadRes.data;
```

### 3. Upload Video
```javascript
const videoBuffer = fs.readFileSync(videoPath);
await axios.put(uploadUrl, videoBuffer, {
  headers: { 'Content-Type': 'video/mp4' },
});
```

### 4. Start Detection
```javascript
await client.post(`/v1/projects/${projectId}/detect`, {
  numClips: 6,
});
```

### 5. Poll for Clips
```javascript
let clips = [];
while (clips.length === 0) {
  await new Promise(r => setTimeout(r, 2000));
  const clipsRes = await client.get(`/v1/projects/${projectId}/clips`);
  clips = clipsRes.data;
}
```

### 6. Create Export
```javascript
const exportRes = await client.post(`/v1/clips/${clips[0].id}/export`, {
  format: 'MP4',
  aspectRatio: '9:16',
  template: 'default',
});
const exportId = exportRes.data.id;
```

### 7. Register Webhook
```javascript
const webhookRes = await client.post('/v1/webhooks/endpoints', {
  url: 'http://localhost:3002/webhook',
  events: ['export.ready'],
});
```

### 8. Handle Webhook
```javascript
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = req.body;

  // Verify HMAC signature
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Handle export.ready event
  console.log('Export ready:', payload.data.artifacts);
  res.json({ ok: true });
});
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
✅ Webhook server listening on http://localhost:3002

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
```javascript
await client.post(`/v1/projects/${projectId}/detect`, {
  numClips: 12,  // Get 12 clips instead of 6
});
```

### Change Export Format
```javascript
await client.post(`/v1/clips/${clipId}/export`, {
  format: 'MP4',
  aspectRatio: '1:1',  // Square format
  template: 'bold',    // Different template
});
```

### Customize Polling Intervals
```javascript
// Change from 2 seconds to 5 seconds
await new Promise(r => setTimeout(r, 5000));
```

## Troubleshooting

### 401 Unauthorized
- Check `CLIPFORGE_API_KEY` is correct
- Verify API key hasn't expired

### 404 Not Found
- Verify project/clip/export IDs are correct
- Check IDs belong to your organization

### Webhook Not Received
- Ensure webhook server is running on port 3002
- Check firewall allows localhost:3002
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
