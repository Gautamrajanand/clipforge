# ClipForge Partner Resources

Complete integration resources for building with ClipForge.

## 📚 Documentation

### Getting Started
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute quick start guide
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Comprehensive integration guide
- **[EXAMPLES.md](./EXAMPLES.md)** - Real-world code examples

### Sample Applications
- **[node/](./node/)** - Complete Node.js example
- **[python/](./python/)** - Complete Python example

---

## 🚀 Quick Start

### Node.js

```bash
cd node
npm install
CLIPFORGE_API_KEY=your-key node quickstart.js /path/to/video.mp4
```

### Python

```bash
cd python
pip install -r requirements.txt
CLIPFORGE_API_KEY=your-key python quickstart.py /path/to/video.mp4
```

---

## 📖 Complete Workflow

The quickstart scripts demonstrate the complete ClipForge workflow:

```
1. Create Project
   ↓
2. Get Presigned Upload URL
   ↓
3. Upload Video to S3
   ↓
4. Start Highlight Detection
   ↓
5. Poll for Ranked Clips
   ↓
6. Create Export
   ↓
7. Register Webhook
   ↓
8. Poll for Export Completion
   ↓
9. Receive Webhook Notification
   ↓
10. Download MP4 + SRT Artifacts
```

---

## 🔑 Authentication

### API Key (Recommended for Server-to-Server)

```bash
curl -H "X-Api-Key: your-api-key" https://api.clipforge.dev/v1/projects
```

**Get API Key**:
1. Log in to ClipForge dashboard
2. Settings → API Keys
3. Create new key

### JWT (For User-Facing Apps)

```bash
curl -H "Authorization: Bearer {jwt_token}" https://api.clipforge.dev/v1/projects
```

---

## 📋 API Endpoints

### Projects
- `POST /v1/projects` - Create project
- `GET /v1/projects` - List projects
- `GET /v1/projects/:id` - Get project
- `POST /v1/projects/:id/detect` - Start detection

### Uploads
- `POST /v1/uploads/sign` - Get presigned URL

### Clips
- `GET /v1/projects/:id/clips` - List clips
- `GET /v1/clips/:id` - Get clip

### Exports
- `POST /v1/clips/:id/export` - Create export
- `GET /v1/exports/:id` - Get export status

### Webhooks
- `POST /v1/webhooks/endpoints` - Register webhook
- `GET /v1/webhooks/endpoints` - List webhooks
- `DELETE /v1/webhooks/endpoints/:id` - Delete webhook

### Analytics
- `GET /v1/analytics/projects/:id` - Project analytics
- `GET /v1/analytics/org` - Organization analytics

### Usage
- `GET /v1/usage` - Get usage metrics

---

## 🔔 Webhook Events

### export.ready
Fired when export is completed and ready for download.

```json
{
  "event": "export.ready",
  "timestamp": "2024-11-04T18:00:00Z",
  "data": {
    "exportId": "exp_123",
    "status": "COMPLETED",
    "artifacts": {
      "mp4_url": "https://s3.example.com/exp_123.mp4",
      "srt_url": "https://s3.example.com/exp_123.srt",
      "thumbnail_url": "https://s3.example.com/exp_123_thumb.jpg"
    }
  }
}
```

### export.failed
Fired when export fails.

```json
{
  "event": "export.failed",
  "timestamp": "2024-11-04T18:00:00Z",
  "data": {
    "exportId": "exp_123",
    "status": "FAILED",
    "reason": "Render pipeline error"
  }
}
```

---

## 🔐 Webhook Signature Verification

All webhooks are signed with HMAC-SHA256. Verify the signature:

### Node.js

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(secret, payload, signature) {
  const json = JSON.stringify(payload);
  const expected = crypto
    .createHmac('sha256', secret)
    .update(json)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

// In webhook handler
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-signature'];
  
  if (!verifyWebhookSignature(webhookSecret, req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
  res.json({ ok: true });
});
```

### Python

```python
import hmac
import hashlib
import json

def verify_webhook_signature(secret, payload, signature):
    json_str = json.dumps(payload, separators=(',', ':'), sort_keys=True)
    expected = hmac.new(
        secret.encode(),
        json_str.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected, signature)

# In webhook handler
@app.route('/webhook', methods=['POST'])
def webhook_handler():
    signature = request.headers.get('X-Signature')
    payload = request.get_json()
    
    if not verify_webhook_signature(webhook_secret, payload, signature):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Process webhook
    return jsonify({'ok': True})
```

---

## 📊 Response Examples

### Create Project
```json
{
  "id": "proj_abc123",
  "title": "My Video",
  "status": "CREATED",
  "createdAt": "2024-11-04T18:00:00Z"
}
```

### Get Presigned Upload URL
```json
{
  "uploadUrl": "https://s3.example.com/upload?...",
  "downloadUrl": "https://s3.example.com/video.mp4",
  "key": "uploads/video.mp4"
}
```

### List Clips
```json
[
  {
    "id": "clip_123",
    "projectId": "proj_abc123",
    "tStart": 10.5,
    "tEnd": 65.5,
    "duration": 55.0,
    "score": 0.92,
    "reason": "Strong hook • Emotional",
    "features": {
      "hookPhrase": 0.95,
      "novelty": 0.88,
      "emotion": 0.90
    }
  }
]
```

### Create Export
```json
{
  "id": "exp_xyz789",
  "clipId": "clip_123",
  "status": "PENDING",
  "format": "MP4",
  "aspectRatio": "9:16",
  "template": "default",
  "createdAt": "2024-11-04T18:00:00Z"
}
```

### Get Usage
```json
{
  "minutesProcessed": 125,
  "minutesLimit": 1000,
  "exportsCount": 42,
  "exportsLimit": 500,
  "resetDate": "2024-12-04T00:00:00Z"
}
```

---

## ⚠️ Error Handling

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 400 | Bad Request | Check request parameters |
| 401 | Unauthorized | Verify API key |
| 404 | Not Found | Check resource ID |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Retry with backoff |

### Retry Strategy

Implement exponential backoff for transient errors:

```javascript
async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

---

## 🎯 Best Practices

### 1. Store API Keys Securely
```bash
# Use environment variables
CLIPFORGE_API_KEY=sk_live_xxx

# Or use secrets manager
aws secretsmanager get-secret-value --secret-id clipforge-api-key
```

### 2. Implement Idempotency
```javascript
const response = await client.post('/v1/clips/:id/export', data, {
  headers: {
    'Idempotency-Key': crypto.randomUUID(),
  },
});
```

### 3. Monitor Usage
```javascript
const usage = await client.get('/v1/usage');
if (usage.minutesProcessed > usage.minutesLimit * 0.8) {
  console.warn('Approaching usage limit');
}
```

### 4. Handle Timeouts
```javascript
const timeout = 60000; // 60 seconds
const response = await Promise.race([
  client.get('/v1/projects/:id/clips'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeout)
  ),
]);
```

### 5. Log Important Events
```javascript
logger.info('Export started', { exportId, clipId });
logger.error('Export failed', { exportId, reason });
```

---

## 🧪 Testing

### Test API Key
```bash
curl -H "X-Api-Key: your-key" https://api.clipforge.dev/v1/projects
```

### Test Webhook Signature
```bash
# Generate test signature
echo -n '{"event":"test"}' | openssl dgst -sha256 -hmac "webhook-secret" -hex
```

---

## 📞 Support

- **API Documentation**: https://api.clipforge.dev/docs
- **GitHub Issues**: https://github.com/clipforge/clipforge/issues
- **Email**: support@clipforge.dev
- **Slack**: https://clipforge.slack.com

---

## 📚 Additional Resources

### SDKs
- **TypeScript SDK**: `@clipforge/sdk-ts`
- **Python SDK**: `clipforge-sdk`

### Guides
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute quick start
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Complete integration guide
- [EXAMPLES.md](./EXAMPLES.md) - Real-world examples

### Sample Apps
- [Node.js Example](./node/) - Complete Node.js implementation
- [Python Example](./python/) - Complete Python implementation

---

## 🎉 Getting Started

1. **Get API Key** - Create in ClipForge dashboard
2. **Choose Language** - Node.js or Python
3. **Run Quickstart** - Follow quickstart guide
4. **Integrate** - Use integration guide for your app
5. **Deploy** - Follow deployment best practices

---

**Happy building with ClipForge! 🚀**
