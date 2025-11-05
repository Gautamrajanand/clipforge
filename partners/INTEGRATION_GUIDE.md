# ClipForge Partner Integration Guide

Complete guide for integrating ClipForge into your application.

## Table of Contents

1. [Authentication](#authentication)
2. [API Client Setup](#api-client-setup)
3. [Complete Workflow](#complete-workflow)
4. [Error Handling](#error-handling)
5. [Webhook Integration](#webhook-integration)
6. [Rate Limiting](#rate-limiting)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Authentication

### API Key Authentication

The simplest authentication method for server-to-server communication.

```bash
curl -H "X-Api-Key: your-api-key" https://api.clipforge.dev/v1/projects
```

**Generate API Key**:
1. Log in to ClipForge dashboard
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Copy and store securely

### JWT Authentication

For user-facing applications.

```bash
curl -H "Authorization: Bearer {jwt_token}" https://api.clipforge.dev/v1/projects
```

**Get JWT Token**:
```bash
POST /v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}
```

---

## API Client Setup

### Node.js

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.clipforge.dev',
  headers: {
    'X-Api-Key': process.env.CLIPFORGE_API_KEY,
    'Content-Type': 'application/json',
  },
});

// Make requests
const projects = await client.get('/v1/projects');
```

### Python

```python
import requests

session = requests.Session()
session.headers.update({
    'X-Api-Key': os.getenv('CLIPFORGE_API_KEY'),
    'Content-Type': 'application/json',
})

# Make requests
response = session.get('https://api.clipforge.dev/v1/projects')
projects = response.json()
```

### TypeScript SDK

```typescript
import { ClipForgeClient } from '@clipforge/sdk-ts';

const client = new ClipForgeClient({
  apiKey: process.env.CLIPFORGE_API_KEY,
  baseUrl: 'https://api.clipforge.dev',
});

const projects = await client.projects.list();
```

### Python SDK

```python
from clipforge import ClipForgeClient

client = ClipForgeClient(
    api_key=os.getenv('CLIPFORGE_API_KEY'),
    base_url='https://api.clipforge.dev',
)

projects = client.projects.list()
```

---

## Complete Workflow

### Step 1: Create Project

```javascript
const project = await client.post('/v1/projects', {
  title: 'My Video',
  sourceUrl: 'https://example.com/video.mp4',
});

const projectId = project.data.id;
```

### Step 2: Get Presigned Upload URL

```javascript
const upload = await client.post('/v1/uploads/sign', {
  filename: 'video.mp4',
  mimeType: 'video/mp4',
  size: 104857600,
});

const { uploadUrl, downloadUrl } = upload.data;
```

### Step 3: Upload Video

```javascript
const fs = require('fs');
const videoBuffer = fs.readFileSync('video.mp4');

await axios.put(uploadUrl, videoBuffer, {
  headers: { 'Content-Type': 'video/mp4' },
});
```

### Step 4: Start Detection

```javascript
await client.post(`/v1/projects/${projectId}/detect`, {
  numClips: 6,
});
```

### Step 5: Poll for Clips

```javascript
let clips = [];
let attempts = 0;

while (clips.length === 0 && attempts < 30) {
  await new Promise(r => setTimeout(r, 2000));
  const response = await client.get(`/v1/projects/${projectId}/clips`);
  clips = response.data;
  attempts++;
}

if (clips.length === 0) {
  throw new Error('Detection timeout');
}
```

### Step 6: Create Export

```javascript
const clip = clips[0];
const exportJob = await client.post(`/v1/clips/${clip.id}/export`, {
  format: 'MP4',
  aspectRatio: '9:16',
  template: 'default',
});

const exportId = exportJob.data.id;
```

### Step 7: Register Webhook

```javascript
const webhook = await client.post('/v1/webhooks/endpoints', {
  url: 'https://your-domain.com/webhook',
  events: ['export.ready'],
});

const webhookSecret = webhook.data.secret;
```

### Step 8: Poll for Export Completion

```javascript
let exportStatus = 'PENDING';
let attempts = 0;

while (exportStatus !== 'COMPLETED' && attempts < 120) {
  await new Promise(r => setTimeout(r, 2000));
  const response = await client.get(`/v1/exports/${exportId}`);
  exportStatus = response.data.status;
  attempts++;
}

if (exportStatus !== 'COMPLETED') {
  throw new Error('Export timeout');
}
```

### Step 9: Download Artifacts

Receive webhook notification with artifacts:

```javascript
{
  "event": "export.ready",
  "data": {
    "exportId": "exp_123",
    "artifacts": {
      "mp4_url": "https://s3.example.com/exp_123.mp4",
      "srt_url": "https://s3.example.com/exp_123.srt",
      "thumbnail_url": "https://s3.example.com/exp_123_thumb.jpg"
    }
  }
}
```

---

## Error Handling

### Retry Strategy

Implement exponential backoff for transient errors:

```javascript
async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Usage
const projects = await retryRequest(() => client.get('/v1/projects'));
```

### Handle Rate Limits

```javascript
async function handleRateLimit(error) {
  if (error.response?.status === 429) {
    const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
    console.log(`Rate limited. Retrying after ${retryAfter}s`);
    await new Promise(r => setTimeout(r, retryAfter * 1000));
    // Retry request
  }
}
```

### Handle Common Errors

```javascript
try {
  await client.get(`/v1/projects/${projectId}`);
} catch (error) {
  if (error.response?.status === 401) {
    console.error('Unauthorized - check API key');
  } else if (error.response?.status === 404) {
    console.error('Project not found');
  } else if (error.response?.status === 429) {
    console.error('Rate limited');
  } else if (error.response?.status === 500) {
    console.error('Server error - retry later');
  }
}
```

---

## Webhook Integration

### Verify Webhook Signature

Always verify webhook signatures to ensure authenticity:

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

### Handle Webhook Events

```javascript
app.post('/webhook', async (req, res) => {
  const { event, data } = req.body;

  switch (event) {
    case 'export.ready':
      await handleExportReady(data);
      break;
    case 'export.failed':
      await handleExportFailed(data);
      break;
    case 'detection.complete':
      await handleDetectionComplete(data);
      break;
    default:
      console.warn(`Unknown event: ${event}`);
  }

  res.json({ ok: true });
});

async function handleExportReady(data) {
  const { exportId, artifacts } = data;
  
  // Download artifacts
  const mp4 = await downloadFile(artifacts.mp4_url);
  const srt = await downloadFile(artifacts.srt_url);
  
  // Store in database
  await db.exports.update(exportId, {
    status: 'COMPLETED',
    mp4_path: mp4,
    srt_path: srt,
  });
}
```

### Webhook Retry Logic

Webhooks are retried with exponential backoff:

```
Attempt 1: Immediate
Attempt 2: 1 second
Attempt 3: 2 seconds
Attempt 4: 4 seconds
Attempt 5: 8 seconds
```

Ensure your webhook endpoint:
- Returns 2xx status code for success
- Returns 5xx for transient errors (will retry)
- Returns 4xx for permanent errors (won't retry)
- Responds within 30 seconds

---

## Rate Limiting

### Check Rate Limits

```javascript
const response = await client.get('/v1/projects');
console.log(response.headers['x-ratelimit-limit']);      // 100
console.log(response.headers['x-ratelimit-remaining']);  // 95
console.log(response.headers['x-ratelimit-reset']);      // 1699108800
```

### Implement Rate Limit Handling

```javascript
class RateLimitedClient {
  constructor(client) {
    this.client = client;
    this.queue = [];
    this.processing = false;
  }

  async request(method, url, data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ method, url, data, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const { method, url, data, resolve, reject } = this.queue.shift();

      try {
        const response = await this.client[method](url, data);
        resolve(response);

        // Check if rate limited
        const remaining = response.headers['x-ratelimit-remaining'];
        if (remaining < 10) {
          const reset = response.headers['x-ratelimit-reset'];
          const delay = reset * 1000 - Date.now();
          await new Promise(r => setTimeout(r, Math.max(delay, 0)));
        }
      } catch (error) {
        reject(error);
      }
    }

    this.processing = false;
  }
}
```

---

## Best Practices

### 1. Store API Keys Securely

```bash
# ❌ Don't hardcode
const API_KEY = 'sk_live_xxx';

# ✅ Use environment variables
const API_KEY = process.env.CLIPFORGE_API_KEY;

# ✅ Use secrets manager
const API_KEY = await secretsManager.getSecret('clipforge-api-key');
```

### 2. Implement Idempotency

```javascript
const idempotencyKey = crypto.randomUUID();

const export = await client.post(`/v1/clips/${clipId}/export`, 
  {
    format: 'MP4',
    aspectRatio: '9:16',
    template: 'default',
  },
  {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  }
);
```

### 3. Monitor Usage

```javascript
const usage = await client.get('/v1/usage');
console.log(`Minutes used: ${usage.minutesProcessed}/${usage.minutesLimit}`);
console.log(`Exports: ${usage.exportsCount}/${usage.exportsLimit}`);

if (usage.minutesProcessed > usage.minutesLimit * 0.8) {
  console.warn('Approaching usage limit');
}
```

### 4. Log Important Events

```javascript
logger.info('Project created', { projectId, title });
logger.info('Detection started', { projectId });
logger.info('Export completed', { exportId, duration: '55s' });
logger.error('Export failed', { exportId, reason });
```

### 5. Handle Timeouts

```javascript
const timeout = 60000; // 60 seconds

const response = await Promise.race([
  client.get(`/v1/projects/${projectId}/clips`),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), timeout)
  ),
]);
```

---

## Troubleshooting

### API Key Issues

```bash
# Test API key
curl -H "X-Api-Key: your-key" https://api.clipforge.dev/v1/projects

# If 401: Key is invalid or expired
# If 200: Key is valid
```

### Webhook Not Receiving

1. Check webhook URL is publicly accessible
2. Verify webhook secret is correct
3. Check firewall allows inbound requests
4. Monitor webhook delivery logs

### Upload Fails

```javascript
try {
  await axios.put(uploadUrl, videoBuffer, {
    headers: { 'Content-Type': 'video/mp4' },
    timeout: 300000, // 5 minutes
  });
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    console.error('Upload timeout');
  } else if (error.response?.status === 403) {
    console.error('Presigned URL expired');
  }
}
```

### Detection Timeout

```javascript
// Increase polling timeout
const maxAttempts = 60; // 2 minutes instead of 1
let attempts = 0;

while (clips.length === 0 && attempts < maxAttempts) {
  await new Promise(r => setTimeout(r, 2000));
  const response = await client.get(`/v1/projects/${projectId}/clips`);
  clips = response.data;
  attempts++;
}
```

---

## Support

- **API Documentation**: https://api.clipforge.dev/docs
- **GitHub Issues**: https://github.com/clipforge/clipforge/issues
- **Email Support**: support@clipforge.dev
- **Slack Community**: https://clipforge.slack.com
