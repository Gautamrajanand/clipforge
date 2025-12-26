# Deploy ML Worker to Render - Step by Step Guide

## Overview
The ML Worker is a Python FastAPI service that handles:
- Video clip detection (finding viral moments)
- Whisper transcription (speech-to-text)
- Video analysis and processing

## Prerequisites
- Render account
- GitHub repo connected to Render
- Same credentials as your API service (Database, Redis, S3)

---

## Step 1: Create New Web Service on Render

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Click "New +"** → Select **"Web Service"**
3. **Connect Repository:**
   - Select your GitHub repo: `Gautamrajanand/clipforge`
   - Click "Connect"

---

## Step 2: Configure Service Settings

### Basic Settings
```
Name: clipforge-ml-worker
Region: Oregon (US West)
Branch: main
Root Directory: (leave blank)
Environment: Python 3
```

### Build & Deploy Settings
```
Build Command: pip install -r workers/requirements.txt
Start Command: cd workers && python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Instance Type
```
Plan: Starter ($7/month) - 512MB RAM
```
**Note:** For production with heavy usage, consider upgrading to Standard ($25/month) with 2GB RAM.

---

## Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

### Required Variables (Copy from your API service)

```bash
# Database
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require

# Redis
REDIS_URL=redis://default:...@...upstash.io:6379

# Storage (Cloudflare R2)
S3_ENDPOINT=https://...r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=clipforge
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# ML Configuration
ASR_PROVIDER=whisper
ML_WORKER_PORT=8000
ML_WORKER_HOST=0.0.0.0
WHISPER_MODEL_SIZE=base
WHISPER_DEVICE=cpu

# OpenAI (for AI features)
OPENAI_API_KEY=sk-proj-...

# AssemblyAI (backup transcription)
ASSEMBLYAI_API_KEY=16e3cbc95572499088bcb6086efd08be
```

### How to Get Values from API Service
1. Go to your `clipforge-api` service on Render
2. Click **Environment** tab
3. Copy the values for:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `S3_ENDPOINT`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `OPENAI_API_KEY`

---

## Step 4: Deploy

1. **Click "Create Web Service"**
2. **Wait for deployment** (~5-10 minutes)
   - Render will install Python dependencies
   - Build the service
   - Start the FastAPI server
3. **Check logs** for any errors
4. **Verify deployment:** Service should show "Live" status

---

## Step 5: Update API Service with ML Worker URL

Once the ML worker is deployed and shows "Live":

1. **Copy the ML Worker URL:**
   - It will be something like: `https://clipforge-ml-worker.onrender.com`

2. **Go to your API service** (`clipforge-api`)

3. **Add/Update Environment Variable:**
   ```
   Key: ML_WORKER_URL
   Value: https://clipforge-ml-worker.onrender.com
   ```

4. **Save and Redeploy API:**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for API to restart (~2-3 minutes)

---

## Step 6: Test Clip Detection

1. **Go to production dashboard:** https://clipforge-seven.vercel.app/dashboard
2. **Upload a video** (keep it short for testing, ~1-2 minutes)
3. **Watch the progress:**
   - Upload ✓
   - Transcribe ✓
   - Detect Clips ✓ (should now work!)
4. **Check ML Worker logs** on Render for processing activity

---

## Troubleshooting

### ML Worker won't start
- Check logs for Python dependency errors
- Verify `workers/requirements.txt` exists in repo
- Ensure Python 3.10 is specified

### Clip detection still failing
- Verify `ML_WORKER_URL` is set correctly in API service
- Check ML Worker logs for incoming requests
- Ensure API service was redeployed after adding `ML_WORKER_URL`

### Out of memory errors
- Upgrade to Standard plan (2GB RAM)
- Consider using `WHISPER_MODEL_SIZE=tiny` for lower memory usage

### Slow processing
- Upgrade instance type for more CPU
- Consider using AssemblyAI instead: `ASR_PROVIDER=assemblyai`

---

## Cost Breakdown

**ML Worker Service:**
- Starter: $7/month (512MB RAM) - Good for testing
- Standard: $25/month (2GB RAM) - Recommended for production

**Total Production Cost:**
- API: $7-25/month (Render)
- ML Worker: $7-25/month (Render)
- Frontend: Free (Vercel)
- Database: Free tier (Neon)
- Redis: Free tier (Upstash)
- Storage: Pay-as-you-go (Cloudflare R2)

**Estimated Total:** $14-50/month depending on instance sizes

---

## Production Checklist

- [ ] ML Worker deployed and showing "Live"
- [ ] All environment variables configured
- [ ] `ML_WORKER_URL` added to API service
- [ ] API service redeployed
- [ ] Test video upload completes successfully
- [ ] Clip detection works (reaches "Detect Clips" step)
- [ ] Check logs for any errors
- [ ] Monitor performance and upgrade if needed

---

## Next Steps After Deployment

1. **Monitor logs** for the first few video uploads
2. **Check performance** - if slow, upgrade instance
3. **Set up alerts** in Render for service downtime
4. **Consider GPU instance** for faster Whisper transcription (if needed)
5. **Implement caching** for frequently accessed clips

---

## Support

If you encounter issues:
1. Check Render logs for both API and ML Worker
2. Verify all environment variables match between services
3. Test ML Worker health endpoint: `https://clipforge-ml-worker.onrender.com/health`
4. Check API can reach ML Worker: Look for connection errors in API logs
