# ClipForge Partner Examples

Real-world examples for common integration patterns.

## Table of Contents

1. [Batch Processing](#batch-processing)
2. [Webhook Handling](#webhook-handling)
3. [Error Recovery](#error-recovery)
4. [Usage Monitoring](#usage-monitoring)
5. [Multi-Tenant](#multi-tenant)
6. [Database Integration](#database-integration)

---

## Batch Processing

Process multiple videos in parallel with rate limiting.

### Node.js

```javascript
const pLimit = require('p-limit');

async function processBatch(videoFiles, concurrency = 3) {
  const limit = pLimit(concurrency);
  
  const tasks = videoFiles.map(file =>
    limit(() => processVideo(file))
  );

  const results = await Promise.all(tasks);
  return results;
}

async function processVideo(videoPath) {
  try {
    // Create project
    const project = await client.post('/v1/projects', {
      title: path.basename(videoPath),
      sourceUrl: `file://${videoPath}`,
    });

    // Upload
    const upload = await client.post('/v1/uploads/sign', {
      filename: path.basename(videoPath),
      mimeType: 'video/mp4',
      size: fs.statSync(videoPath).size,
    });

    const videoBuffer = fs.readFileSync(videoPath);
    await axios.put(upload.data.uploadUrl, videoBuffer, {
      headers: { 'Content-Type': 'video/mp4' },
    });

    // Detect
    await client.post(`/v1/projects/${project.data.id}/detect`, {
      numClips: 6,
    });

    // Poll for clips
    let clips = [];
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const response = await client.get(`/v1/projects/${project.data.id}/clips`);
      clips = response.data;
      if (clips.length > 0) break;
    }

    return {
      videoPath,
      projectId: project.data.id,
      clipsCount: clips.length,
      status: 'SUCCESS',
    };
  } catch (error) {
    return {
      videoPath,
      status: 'FAILED',
      error: error.message,
    };
  }
}

// Usage
const videos = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4',
];

const results = await processBatch(videos, 2);
console.log(results);
```

### Python

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

def process_batch(video_files, concurrency=3):
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [
            executor.submit(process_video, video_file)
            for video_file in video_files
        ]
        results = [f.result() for f in futures]
    return results

def process_video(video_path):
    try:
        # Create project
        project = client.post('/v1/projects', {
            'title': os.path.basename(video_path),
            'sourceUrl': f'file://{video_path}',
        })

        # Upload
        upload = client.post('/v1/uploads/sign', {
            'filename': os.path.basename(video_path),
            'mimeType': 'video/mp4',
            'size': os.path.getsize(video_path),
        })

        with open(video_path, 'rb') as f:
            client.put(upload['uploadUrl'], f.read(), {'Content-Type': 'video/mp4'})

        # Detect
        client.post(f'/v1/projects/{project["id"]}/detect', {
            'numClips': 6,
        })

        # Poll for clips
        clips = []
        for i in range(30):
            time.sleep(2)
            clips = client.get(f'/v1/projects/{project["id"]}/clips')
            if clips:
                break

        return {
            'videoPath': video_path,
            'projectId': project['id'],
            'clipsCount': len(clips),
            'status': 'SUCCESS',
        }
    except Exception as e:
        return {
            'videoPath': video_path,
            'status': 'FAILED',
            'error': str(e),
        }

# Usage
videos = [
    '/videos/video1.mp4',
    '/videos/video2.mp4',
    '/videos/video3.mp4',
]

results = process_batch(videos, concurrency=2)
print(results)
```

---

## Webhook Handling

Robust webhook handling with persistence and retries.

### Node.js

```javascript
const express = require('express');
const crypto = require('crypto');
const db = require('./database');

const app = express();
app.use(express.json());

// Webhook queue for processing
const webhookQueue = [];
let processing = false;

app.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const payload = req.body;

    // Verify signature
    const json = JSON.stringify(payload);
    const expected = crypto
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(json)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Store webhook in database
    const webhook = await db.webhooks.create({
      event: payload.event,
      data: payload.data,
      timestamp: new Date(),
      processed: false,
    });

    // Add to queue
    webhookQueue.push(webhook);

    // Process asynchronously
    processWebhookQueue();

    // Return immediately
    res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function processWebhookQueue() {
  if (processing) return;
  processing = true;

  while (webhookQueue.length > 0) {
    const webhook = webhookQueue.shift();

    try {
      await processWebhook(webhook);
      await db.webhooks.update(webhook.id, { processed: true });
    } catch (error) {
      console.error(`Failed to process webhook ${webhook.id}:`, error);
      // Re-queue for retry
      webhookQueue.push(webhook);
      break;
    }
  }

  processing = false;
}

async function processWebhook(webhook) {
  const { event, data } = webhook;

  switch (event) {
    case 'export.ready':
      await handleExportReady(data);
      break;
    case 'export.failed':
      await handleExportFailed(data);
      break;
    default:
      console.warn(`Unknown event: ${event}`);
  }
}

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
    completed_at: new Date(),
  });

  // Notify user
  const exportRecord = await db.exports.findById(exportId);
  await sendNotification(exportRecord.userId, {
    title: 'Export Ready',
    message: 'Your video export is ready for download',
    exportId,
  });
}

async function handleExportFailed(data) {
  const { exportId, reason } = data;

  await db.exports.update(exportId, {
    status: 'FAILED',
    error: reason,
    completed_at: new Date(),
  });

  const exportRecord = await db.exports.findById(exportId);
  await sendNotification(exportRecord.userId, {
    title: 'Export Failed',
    message: `Export failed: ${reason}`,
    exportId,
  });
}

async function downloadFile(url) {
  const response = await axios.get(url, { responseType: 'stream' });
  const fileName = `/exports/${Date.now()}_${path.basename(url)}`;
  const writer = fs.createWriteStream(fileName);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(fileName));
    writer.on('error', reject);
  });
}

async function sendNotification(userId, notification) {
  // Send email, push notification, etc.
  console.log(`Notification for user ${userId}:`, notification);
}

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

---

## Error Recovery

Implement robust error handling and recovery.

### Node.js

```javascript
class ClipForgeWorkflow {
  constructor(client, db) {
    this.client = client;
    this.db = db;
  }

  async processVideo(videoPath, userId) {
    const workflowId = crypto.randomUUID();
    
    try {
      // Create workflow record
      const workflow = await this.db.workflows.create({
        id: workflowId,
        userId,
        videoPath,
        status: 'STARTED',
        startedAt: new Date(),
      });

      // Step 1: Create project
      const project = await this.retryWithBackoff(
        () => this.client.post('/v1/projects', {
          title: path.basename(videoPath),
          sourceUrl: `file://${videoPath}`,
        }),
        { maxRetries: 3, initialDelay: 1000 }
      );

      await this.db.workflows.update(workflowId, {
        projectId: project.data.id,
        status: 'PROJECT_CREATED',
      });

      // Step 2: Upload
      const upload = await this.retryWithBackoff(
        () => this.client.post('/v1/uploads/sign', {
          filename: path.basename(videoPath),
          mimeType: 'video/mp4',
          size: fs.statSync(videoPath).size,
        }),
        { maxRetries: 3, initialDelay: 1000 }
      );

      const videoBuffer = fs.readFileSync(videoPath);
      await this.retryWithBackoff(
        () => axios.put(upload.data.uploadUrl, videoBuffer, {
          headers: { 'Content-Type': 'video/mp4' },
          timeout: 300000,
        }),
        { maxRetries: 2, initialDelay: 2000 }
      );

      await this.db.workflows.update(workflowId, {
        status: 'UPLOADED',
      });

      // Step 3: Detect
      await this.retryWithBackoff(
        () => this.client.post(`/v1/projects/${project.data.id}/detect`, {
          numClips: 6,
        }),
        { maxRetries: 3, initialDelay: 1000 }
      );

      await this.db.workflows.update(workflowId, {
        status: 'DETECTION_STARTED',
      });

      // Step 4: Poll for clips
      const clips = await this.pollWithTimeout(
        () => this.client.get(`/v1/projects/${project.data.id}/clips`),
        { timeout: 60000, interval: 2000 }
      );

      await this.db.workflows.update(workflowId, {
        clipsCount: clips.length,
        status: 'CLIPS_DETECTED',
      });

      // Step 5: Create export
      const exportJob = await this.retryWithBackoff(
        () => this.client.post(`/v1/clips/${clips[0].id}/export`, {
          format: 'MP4',
          aspectRatio: '9:16',
          template: 'default',
        }),
        { maxRetries: 3, initialDelay: 1000 }
      );

      await this.db.workflows.update(workflowId, {
        exportId: exportJob.data.id,
        status: 'EXPORT_STARTED',
      });

      return {
        workflowId,
        projectId: project.data.id,
        exportId: exportJob.data.id,
        clipsCount: clips.length,
        status: 'SUCCESS',
      };
    } catch (error) {
      console.error(`Workflow ${workflowId} failed:`, error);

      await this.db.workflows.update(workflowId, {
        status: 'FAILED',
        error: error.message,
        failedAt: new Date(),
      });

      throw error;
    }
  }

  async retryWithBackoff(fn, options = {}) {
    const { maxRetries = 3, initialDelay = 1000 } = options;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries - 1) throw error;

        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  async pollWithTimeout(fn, options = {}) {
    const { timeout = 60000, interval = 2000 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await fn();
        if (result && result.length > 0) {
          return result;
        }
      } catch (error) {
        console.warn('Poll error:', error.message);
      }

      await new Promise(r => setTimeout(r, interval));
    }

    throw new Error(`Polling timeout after ${timeout}ms`);
  }
}

// Usage
const workflow = new ClipForgeWorkflow(client, db);
const result = await workflow.processVideo('/videos/sample.mp4', userId);
```

---

## Usage Monitoring

Track and monitor API usage.

### Node.js

```javascript
class UsageMonitor {
  constructor(client, db) {
    this.client = client;
    this.db = db;
  }

  async checkUsage(userId) {
    const usage = await this.client.get('/v1/usage');

    // Store in database
    await this.db.usageLogs.create({
      userId,
      minutesProcessed: usage.minutesProcessed,
      minutesLimit: usage.minutesLimit,
      exportsCount: usage.exportsCount,
      exportsLimit: usage.exportsLimit,
      timestamp: new Date(),
    });

    // Check if approaching limit
    const minutesPercentage = (usage.minutesProcessed / usage.minutesLimit) * 100;
    const exportsPercentage = (usage.exportsCount / usage.exportsLimit) * 100;

    if (minutesPercentage > 80) {
      await this.alertUser(userId, {
        type: 'USAGE_WARNING',
        message: `You've used ${minutesPercentage.toFixed(0)}% of your monthly minutes`,
        percentage: minutesPercentage,
      });
    }

    if (minutesPercentage > 100) {
      await this.alertUser(userId, {
        type: 'USAGE_EXCEEDED',
        message: 'You have exceeded your monthly usage limit',
      });
    }

    return usage;
  }

  async getUsageStats(userId, days = 30) {
    const logs = await this.db.usageLogs.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    });

    const totalMinutes = logs.reduce((sum, log) => sum + log.minutesProcessed, 0);
    const totalExports = logs.reduce((sum, log) => sum + log.exportsCount, 0);
    const avgDaily = totalMinutes / days;

    return {
      totalMinutes,
      totalExports,
      avgDaily,
      logs,
    };
  }

  async alertUser(userId, alert) {
    // Send email, push notification, etc.
    console.log(`Alert for user ${userId}:`, alert);
  }
}

// Usage
const monitor = new UsageMonitor(client, db);
const usage = await monitor.checkUsage(userId);
const stats = await monitor.getUsageStats(userId, 30);
```

---

## Multi-Tenant

Handle multiple organizations with proper isolation.

### Node.js

```javascript
class MultiTenantWorkflow {
  constructor(client, db) {
    this.client = client;
    this.db = db;
  }

  async processVideoForOrg(orgId, videoPath) {
    // Verify org exists
    const org = await this.db.organizations.findById(orgId);
    if (!org) throw new Error('Organization not found');

    // Get org's API key
    const apiKey = org.apiKey;
    const orgClient = axios.create({
      baseURL: 'https://api.clipforge.dev',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Create project
    const project = await orgClient.post('/v1/projects', {
      title: path.basename(videoPath),
      sourceUrl: `file://${videoPath}`,
    });

    // Store project with org reference
    await this.db.projects.create({
      id: project.data.id,
      orgId,
      title: project.data.title,
      createdAt: new Date(),
    });

    return project.data;
  }

  async getOrgAnalytics(orgId) {
    // Get org's API key
    const org = await this.db.organizations.findById(orgId);
    const orgClient = axios.create({
      baseURL: 'https://api.clipforge.dev',
      headers: {
        'X-Api-Key': org.apiKey,
        'Content-Type': 'application/json',
      },
    });

    // Get analytics
    const analytics = await orgClient.get('/v1/analytics/org?days=30');

    // Store analytics
    await this.db.analytics.create({
      orgId,
      data: analytics.data,
      timestamp: new Date(),
    });

    return analytics.data;
  }
}

// Usage
const workflow = new MultiTenantWorkflow(client, db);
const project = await workflow.processVideoForOrg(orgId, '/videos/sample.mp4');
const analytics = await workflow.getOrgAnalytics(orgId);
```

---

## Database Integration

Store workflow state in database for persistence.

### Node.js with MongoDB

```javascript
const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  id: String,
  userId: String,
  videoPath: String,
  projectId: String,
  exportId: String,
  status: {
    type: String,
    enum: ['STARTED', 'PROJECT_CREATED', 'UPLOADED', 'DETECTION_STARTED', 'CLIPS_DETECTED', 'EXPORT_STARTED', 'COMPLETED', 'FAILED'],
  },
  clipsCount: Number,
  error: String,
  startedAt: Date,
  completedAt: Date,
  metadata: mongoose.Schema.Types.Mixed,
});

const Workflow = mongoose.model('Workflow', workflowSchema);

class WorkflowService {
  async createWorkflow(userId, videoPath) {
    const workflow = new Workflow({
      id: crypto.randomUUID(),
      userId,
      videoPath,
      status: 'STARTED',
      startedAt: new Date(),
    });

    await workflow.save();
    return workflow;
  }

  async updateWorkflow(workflowId, updates) {
    return await Workflow.findOneAndUpdate(
      { id: workflowId },
      updates,
      { new: true }
    );
  }

  async getWorkflow(workflowId) {
    return await Workflow.findOne({ id: workflowId });
  }

  async getUserWorkflows(userId) {
    return await Workflow.find({ userId }).sort({ startedAt: -1 });
  }
}

// Usage
const service = new WorkflowService();
const workflow = await service.createWorkflow(userId, '/videos/sample.mp4');
await service.updateWorkflow(workflow.id, { status: 'PROJECT_CREATED', projectId });
const completed = await service.getWorkflow(workflow.id);
```

---

## Support

For more examples and help:
- API Docs: https://api.clipforge.dev/docs
- GitHub: https://github.com/clipforge/clipforge
- Email: support@clipforge.dev
