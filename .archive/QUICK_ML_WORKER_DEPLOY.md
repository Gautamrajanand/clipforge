# Quick ML Worker Deployment - Copy & Paste Guide

## What You Need to Do (10 minutes total)

I'll guide you through each step. Just follow along and copy/paste the values.

---

## Step 1: Create Service (2 minutes)

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select your repo: **Gautamrajanand/clipforge**
4. Click **"Connect"**

---

## Step 2: Basic Configuration (1 minute)

Copy and paste these exact values:

**Name:**
```
clipforge-ml-worker
```

**Region:**
```
Oregon (US West)
```

**Branch:**
```
main
```

**Root Directory:**
```
(leave blank)
```

**Environment:**
```
Python 3
```

**Build Command:**
```
pip install -r workers/requirements.txt
```

**Start Command:**
```
cd workers && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Instance Type:**
```
Starter ($7/month)
```

---

## Step 3: Environment Variables (5 minutes)

Click **"Advanced"** → **"Add Environment Variable"**

### Get These from Your API Service

1. Open a new tab: https://dashboard.render.com
2. Click on **"clipforge-api"** service
3. Go to **"Environment"** tab
4. Copy the VALUES (not the keys) for these variables:

**Copy these 7 values from API:**

| Key | Copy from API service |
|-----|----------------------|
| `DATABASE_URL` | Copy the full postgresql://... URL |
| `REDIS_URL` | Copy the full redis://... URL |
| `S3_ENDPOINT` | Copy the https://...r2.cloudflarestorage.com URL |
| `S3_ACCESS_KEY_ID` | Copy the access key |
| `S3_SECRET_ACCESS_KEY` | Copy the secret key |
| `OPENAI_API_KEY` | Copy the sk-proj-... key |
| `ASSEMBLYAI_API_KEY` | Copy the API key |

### Add These New Variables

Add these 6 new variables (type them exactly):

```
S3_REGION=auto
S3_BUCKET=clipforge
ASR_PROVIDER=whisper
ML_WORKER_PORT=8000
ML_WORKER_HOST=0.0.0.0
WHISPER_MODEL_SIZE=base
WHISPER_DEVICE=cpu
```

---

## Step 4: Deploy (2 minutes)

1. Click **"Create Web Service"**
2. Wait for deployment (watch the logs)
3. When you see "Live" status, **COPY THE URL**
   - It will look like: `https://clipforge-ml-worker.onrender.com`

---

## Step 5: Update API Service (2 minutes)

1. Go back to **"clipforge-api"** service
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add:
   ```
   Key: ML_WORKER_URL
   Value: https://clipforge-ml-worker.onrender.com
   ```
   (Use the URL you copied in Step 4)
5. Click **"Save Changes"**
6. Click **"Manual Deploy"** → **"Deploy latest commit"**
7. Wait 2-3 minutes for API to restart

---

## Step 6: Test (2 minutes)

1. Go to: https://clipforge-seven.vercel.app/dashboard
2. Try **AI Subtitles**:
   - Click "AI Subtitles"
   - Upload a short video (1-2 min)
   - Watch it process: Upload → Transcribe → Generate Subtitles
3. Should complete successfully!

---

## Troubleshooting

**ML Worker won't start?**
- Check logs for errors
- Verify all environment variables are set
- Make sure Python 3 is selected

**Still not working?**
- Verify `ML_WORKER_URL` is correct in API service
- Make sure API was redeployed after adding the URL
- Check both API and ML Worker logs

**Slow processing?**
- Upgrade ML Worker to Standard plan ($25/month)
- Or change `WHISPER_MODEL_SIZE=tiny` for faster (but less accurate) transcription

---

## What Gets Fixed

Once deployed, these features will work:
- ✅ AI Clips (clip detection)
- ✅ AI Subtitles (transcription)
- ✅ AI Reframe (aspect ratio conversion)
- ✅ All video processing

---

## Summary

Total time: ~10 minutes
Total cost: $7/month (Starter) or $25/month (Standard - recommended)

You're deploying a Python FastAPI service that handles all AI/ML processing for your videos.
