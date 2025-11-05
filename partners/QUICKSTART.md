# ClipForge Partner Quickstart

Complete guide to integrate ClipForge into your application. Includes runnable scripts for Node.js and Python.

## Overview

This quickstart demonstrates the complete ClipForge workflow:

1. **Create Project** - Initialize a new video project
2. **Upload File** - Upload video via presigned S3 URL
3. **Detect Highlights** - Run AI highlight detection
4. **Poll Clips** - Retrieve ranked clips
5. **Export Clip** - Render clip to MP4+SRT
6. **Handle Webhook** - Receive completion notification and download artifacts

## Prerequisites

- ClipForge API running (http://localhost:3000)
- API Key or JWT token
- Node.js 18+ or Python 3.10+
- Video file to process (MP4 recommended)

## Quick Start

### Node.js

```bash
cd partners/node
npm install
CLIPFORGE_API_KEY=your-api-key node quickstart.js path/to/video.mp4
```

### Python

```bash
cd partners/python
pip install -r requirements.txt
CLIPFORGE_API_KEY=your-api-key python quickstart.py path/to/video.mp4
```

## Workflow Details

### 1. Create Project

```bash
POST /v1/projects
{
  "title": "My Video",
  "sourceUrl": "https://example.com/video.mp4"
}
```

Returns: `{ id: "project-123", status: "CREATED" }`

### 2. Get Presigned Upload URL

```bash
POST /v1/uploads/sign
{
  "filename": "video.mp4",
  "mimeType": "video/mp4",
  "size": 104857600
}
```

Returns: `{ uploadUrl, downloadUrl, key }`

### 3. Upload File

Use the presigned URL to upload directly to S3:

```bash
PUT {uploadUrl}
Content-Type: video/mp4
[binary video data]
```

### 4. Start Detection

```bash
POST /v1/projects/{projectId}/detect
{
  "numClips": 6
}
```

### 5. Poll for Clips

```bash
GET /v1/projects/{projectId}/clips
```

Poll every 2 seconds until clips are returned.

### 6. Create Export

```bash
POST /v1/clips/{clipId}/export
{
  "format": "MP4",
  "aspectRatio": "9:16",
  "template": "default"
}
```

Returns: `{ id: "export-123", status: "PENDING" }`

### 7. Register Webhook

```bash
POST /v1/webhooks/endpoints
{
  "url": "https://your-domain.com/webhook",
  "events": ["export.ready"]
}
```

Returns webhook secret for signature verification.

### 8. Handle Webhook

Receive POST request with:

```json
{
  "event": "export.ready",
  "timestamp": "2024-11-04T18:00:00Z",
  "data": {
    "exportId": "export-123",
    "status": "COMPLETED",
    "artifacts": {
      "mp4_url": "https://s3.example.com/export-123.mp4",
      "srt_url": "https://s3.example.com/export-123.srt",
      "thumbnail_url": "https://s3.example.com/export-123_thumb.jpg"
    }
  }
}
```

Verify signature with webhook secret:

```javascript
const signature = req.headers['x-signature'];
const isValid = verifyWebhookSignature(webhookSecret, payload, signature);
```

## Environment Variables

```bash
CLIPFORGE_API_URL=http://localhost:3000
CLIPFORGE_API_KEY=your-api-key
WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_URL=https://your-domain.com/webhook
```

## Error Handling

### Rate Limits

If you receive 429 (Too Many Requests):

```
Retry-After: 60
```

Wait the specified seconds before retrying.

### Polling Timeout

If clips aren't detected after 60 seconds, check:

1. Video file is valid
2. ASR provider is configured
3. Check API logs for errors

### Webhook Delivery

Webhooks retry with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 1 second
- Attempt 3: 2 seconds
- Attempt 4: 4 seconds
- Attempt 5: 8 seconds

## Troubleshooting

### 401 Unauthorized

- Check API key is correct
- Verify API key hasn't expired
- Check Authorization header format: `X-Api-Key: {key}`

### 404 Not Found

- Verify project/clip/export IDs are correct
- Check project belongs to your organization

### 500 Internal Server Error

- Check API logs
- Verify all required environment variables are set
- Retry with exponential backoff

## Next Steps

1. Customize the scripts for your use case
2. Implement error handling and retries
3. Store export artifacts in your database
4. Integrate with your UI
5. Monitor usage and analytics

## Support

- API Docs: http://localhost:3000/api/docs
- GitHub: https://github.com/clipforge/clipforge
- Email: support@clipforge.dev
