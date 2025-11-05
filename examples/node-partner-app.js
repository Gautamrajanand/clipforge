/**
 * ClipForge Partner App - Node.js Example
 * 
 * Complete workflow: upload → detect → export → handle webhook
 */

const axios = require('axios');
const crypto = require('crypto');
const express = require('express');
const fs = require('fs');

const API_URL = process.env.CLIPFORGE_API_URL || 'http://localhost:3000';
const API_KEY = process.env.CLIPFORGE_API_KEY || 'your-api-key';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';

// Initialize Express for webhook handling
const app = express();
app.use(express.json());

// API client
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json',
  },
});

/**
 * Main workflow
 */
async function runWorkflow() {
  try {
    console.log('🚀 Starting ClipForge Partner App workflow...\n');

    // Step 1: Create project
    console.log('1️⃣  Creating project...');
    const projectRes = await client.post('/v1/projects', {
      title: 'My Awesome Video',
      sourceUrl: 'https://example.com/video.mp4',
    });
    const projectId = projectRes.data.id;
    console.log(`✅ Project created: ${projectId}\n`);

    // Step 2: Get presigned upload URL
    console.log('2️⃣  Getting presigned upload URL...');
    const uploadRes = await client.post('/v1/uploads/sign', {
      filename: 'video.mp4',
      mimeType: 'video/mp4',
      size: 104857600,
    });
    console.log(`✅ Upload URL: ${uploadRes.data.uploadUrl}\n`);

    // Step 3: Start highlight detection
    console.log('3️⃣  Starting highlight detection...');
    await client.post(`/v1/projects/${projectId}/detect`, {
      numClips: 6,
    });
    console.log('✅ Detection started (async job)\n');

    // Step 4: Poll for clips
    console.log('4️⃣  Polling for clips...');
    let clips = [];
    let attempts = 0;
    while (clips.length === 0 && attempts < 30) {
      await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
      const clipsRes = await client.get(`/v1/projects/${projectId}/clips`);
      clips = clipsRes.data;
      attempts++;
      console.log(`   Attempt ${attempts}: ${clips.length} clips found`);
    }

    if (clips.length === 0) {
      console.log('❌ No clips detected after 60 seconds');
      return;
    }

    console.log(`✅ Found ${clips.length} clips\n`);

    // Step 5: Create export for first clip
    console.log('5️⃣  Creating export...');
    const firstClip = clips[0];
    const exportRes = await client.post(
      `/v1/clips/${firstClip.id}/export`,
      {
        format: 'MP4',
        aspectRatio: '9:16',
        template: 'default',
      }
    );
    const exportId = exportRes.data.id;
    console.log(`✅ Export created: ${exportId}\n`);

    // Step 6: Register webhook
    console.log('6️⃣  Registering webhook...');
    const webhookRes = await client.post('/v1/webhooks/endpoints', {
      url: 'http://localhost:3001/webhook',
      events: ['export.ready', 'job.failed'],
    });
    console.log(`✅ Webhook registered: ${webhookRes.data.id}\n`);

    // Step 7: Poll for export completion
    console.log('7️⃣  Polling for export completion...');
    let exportStatus = 'PENDING';
    attempts = 0;
    while (exportStatus !== 'COMPLETED' && attempts < 60) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await client.get(`/v1/exports/${exportId}`);
      exportStatus = statusRes.data.status;
      attempts++;
      console.log(`   Attempt ${attempts}: Status = ${exportStatus}`);
    }

    if (exportStatus === 'COMPLETED') {
      console.log(`✅ Export completed!\n`);
      console.log('📦 Artifacts:');
      console.log(`   MP4: ${exportRes.data.artifacts?.mp4_url}`);
      console.log(`   SRT: ${exportRes.data.artifacts?.srt_url}`);
      console.log(`   Thumbnail: ${exportRes.data.artifacts?.thumbnail_url}\n`);
    } else {
      console.log(`❌ Export failed or timed out: ${exportStatus}`);
    }

    // Step 8: Get usage
    console.log('8️⃣  Getting usage...');
    const usageRes = await client.get('/v1/usage');
    console.log(`✅ Usage:`);
    console.log(`   Minutes processed: ${usageRes.data.minutesProcessed}`);
    console.log(`   Exports: ${usageRes.data.exportsCount}\n`);

    console.log('🎉 Workflow complete!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Webhook handler
 */
app.post('/webhook', (req, res) => {
  try {
    const signature = req.headers['x-signature'];
    const payload = req.body;

    // Verify signature
    const json = JSON.stringify(payload);
    const expected = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(json)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log(`\n📨 Webhook received: ${payload.event}`);
    console.log(`   Data: ${JSON.stringify(payload.data, null, 2)}`);

    res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start webhook server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔔 Webhook server listening on port ${PORT}\n`);
});

// Run workflow
runWorkflow();
