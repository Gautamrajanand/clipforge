#!/usr/bin/env node

/**
 * ClipForge Partner Quickstart - Node.js
 * 
 * Complete workflow: create project → upload → detect → export → webhook
 * 
 * Usage:
 *   CLIPFORGE_API_KEY=your-key node quickstart.js /path/to/video.mp4
 */

const axios = require('axios');
const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.CLIPFORGE_API_URL || 'http://localhost:3000';
const API_KEY = process.env.CLIPFORGE_API_KEY;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'webhook-secret';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3002/webhook';

if (!API_KEY) {
  console.error('❌ Error: CLIPFORGE_API_KEY environment variable not set');
  process.exit(1);
}

// API client
const client = axios.create({
  baseURL: API_URL,
  headers: {
    'X-Api-Key': API_KEY,
    'Content-Type': 'application/json',
  },
});

// Webhook server
const app = express();
app.use(express.json());

let webhookReceived = false;
let webhookData = null;

/**
 * Main workflow
 */
async function runWorkflow(videoPath) {
  try {
    console.log('🚀 Starting ClipForge Partner Quickstart\n');

    // Validate video file
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    const fileStats = fs.statSync(videoPath);
    const fileSize = fileStats.size;
    const fileName = path.basename(videoPath);

    console.log(`📹 Video: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)\n`);

    // Step 1: Create project
    console.log('1️⃣  Creating project...');
    const projectRes = await client.post('/v1/projects', {
      title: `Partner Quickstart - ${fileName}`,
      sourceUrl: `file://${videoPath}`,
    });
    const projectId = projectRes.data.id;
    console.log(`✅ Project created: ${projectId}\n`);

    // Step 2: Get presigned upload URL
    console.log('2️⃣  Getting presigned upload URL...');
    const uploadRes = await client.post('/v1/uploads/sign', {
      filename: fileName,
      mimeType: 'video/mp4',
      size: fileSize,
    });
    const { uploadUrl, downloadUrl, key } = uploadRes.data;
    console.log(`✅ Upload URL generated\n`);

    // Step 3: Upload file to S3
    console.log('3️⃣  Uploading video to S3...');
    const videoBuffer = fs.readFileSync(videoPath);
    await axios.put(uploadUrl, videoBuffer, {
      headers: { 'Content-Type': 'video/mp4' },
    });
    console.log(`✅ Video uploaded (${(fileSize / 1024 / 1024).toFixed(2)} MB)\n`);

    // Step 4: Start highlight detection
    console.log('4️⃣  Starting highlight detection...');
    await client.post(`/v1/projects/${projectId}/detect`, {
      numClips: 6,
    });
    console.log('✅ Detection started (async job)\n');

    // Step 5: Poll for clips
    console.log('5️⃣  Polling for clips...');
    let clips = [];
    let attempts = 0;
    const maxAttempts = 30; // 60 seconds with 2s intervals

    while (clips.length === 0 && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
      const clipsRes = await client.get(`/v1/projects/${projectId}/clips`);
      clips = clipsRes.data;
      attempts++;
      process.stdout.write(`\r   Attempt ${attempts}/${maxAttempts}: ${clips.length} clips found`);
    }

    if (clips.length === 0) {
      throw new Error('No clips detected after 60 seconds');
    }

    console.log(`\n✅ Found ${clips.length} clips\n`);

    // Display top 3 clips
    console.log('📊 Top Clips:');
    clips.slice(0, 3).forEach((clip, idx) => {
      console.log(`   ${idx + 1}. Score: ${(clip.score * 100).toFixed(0)}% | ${clip.reason}`);
      console.log(`      ${clip.tStart.toFixed(1)}s - ${clip.tEnd.toFixed(1)}s (${clip.duration.toFixed(1)}s)`);
    });
    console.log();

    // Step 6: Create export for first clip
    console.log('6️⃣  Creating export...');
    const firstClip = clips[0];
    const exportRes = await client.post(`/v1/clips/${firstClip.id}/export`, {
      format: 'MP4',
      aspectRatio: '9:16',
      template: 'default',
    });
    const exportId = exportRes.data.id;
    console.log(`✅ Export created: ${exportId}\n`);

    // Step 7: Register webhook
    console.log('7️⃣  Registering webhook...');
    const webhookRes = await client.post('/v1/webhooks/endpoints', {
      url: WEBHOOK_URL,
      events: ['export.ready'],
    });
    const webhookId = webhookRes.data.id;
    console.log(`✅ Webhook registered: ${webhookId}\n`);

    // Step 8: Start webhook server
    console.log('8️⃣  Starting webhook server...');
    const server = app.listen(3002, () => {
      console.log('✅ Webhook server listening on http://localhost:3002\n');
    });

    // Step 9: Poll for export completion
    console.log('9️⃣  Polling for export completion...');
    let exportStatus = 'PENDING';
    attempts = 0;
    const maxExportAttempts = 120; // 4 minutes with 2s intervals

    while (exportStatus !== 'COMPLETED' && attempts < maxExportAttempts) {
      await new Promise(r => setTimeout(r, 2000));
      const statusRes = await client.get(`/v1/exports/${exportId}`);
      exportStatus = statusRes.data.status;
      attempts++;
      process.stdout.write(`\r   Attempt ${attempts}/${maxExportAttempts}: Status = ${exportStatus}`);
    }

    console.log();

    if (exportStatus === 'COMPLETED') {
      console.log(`✅ Export completed!\n`);

      // Wait for webhook (max 10 seconds)
      console.log('🔔 Waiting for webhook...');
      let webhookAttempts = 0;
      while (!webhookReceived && webhookAttempts < 5) {
        await new Promise(r => setTimeout(r, 2000));
        webhookAttempts++;
      }

      if (webhookReceived && webhookData) {
        console.log(`✅ Webhook received!\n`);
        console.log('📦 Artifacts:');
        console.log(`   MP4: ${webhookData.artifacts.mp4_url}`);
        console.log(`   SRT: ${webhookData.artifacts.srt_url}`);
        console.log(`   Thumbnail: ${webhookData.artifacts.thumbnail_url}\n`);

        // Download artifacts
        console.log('⬇️  Downloading artifacts...');
        const outputDir = './exports';
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const mp4Path = path.join(outputDir, `${exportId}.mp4`);
        const srtPath = path.join(outputDir, `${exportId}.srt`);

        await downloadFile(webhookData.artifacts.mp4_url, mp4Path);
        await downloadFile(webhookData.artifacts.srt_url, srtPath);

        console.log(`✅ Downloaded to ${outputDir}/\n`);
      } else {
        console.log('⚠️  Webhook not received (may arrive later)\n');
      }
    } else {
      throw new Error(`Export failed or timed out: ${exportStatus}`);
    }

    // Step 10: Get usage
    console.log('🔟 Getting usage...');
    const usageRes = await client.get('/v1/usage');
    console.log(`✅ Usage:`);
    console.log(`   Minutes processed: ${usageRes.data.minutesProcessed}`);
    console.log(`   Exports: ${usageRes.data.exportsCount}\n`);

    console.log('🎉 Workflow complete!\n');

    // Keep server running for a bit to receive webhooks
    setTimeout(() => {
      server.close();
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
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
    webhookReceived = true;
    webhookData = payload.data;

    res.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Download file from URL
 */
async function downloadFile(url, filePath) {
  const response = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Run workflow
const videoPath = process.argv[2];
if (!videoPath) {
  console.error('Usage: node quickstart.js /path/to/video.mp4');
  process.exit(1);
}

runWorkflow(videoPath);
