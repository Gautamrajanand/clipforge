# ML Worker Deployment for Production

## Current Issue
Production API on Render cannot process clip detection because the ML worker service isn't deployed.

## Immediate Fix: Add ML_WORKER_URL to Render

The ML worker needs to be deployed as a separate service on Render. However, as a temporary workaround, you can:

### Option A: Deploy ML Worker on Render

1. **Create new Web Service on Render:**
   - Name: `clipforge-ml-worker`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `/` (or wherever Dockerfile.workers points to)

2. **Set Environment Variables:**
   ```bash
   DATABASE_URL=<same as API>
   REDIS_URL=<same as API>
   S3_ENDPOINT=<same as API>
   S3_REGION=auto
   S3_BUCKET=clipforge
   S3_ACCESS_KEY_ID=<same as API>
   S3_SECRET_ACCESS_KEY=<same as API>
   ASR_PROVIDER=whisper
   ML_WORKER_PORT=8000
   ML_WORKER_HOST=0.0.0.0
   OPENAI_API_KEY=<your key>
   WHISPER_MODEL_SIZE=base
   WHISPER_DEVICE=cpu
   ```

3. **Update API's ML_WORKER_URL:**
   - Go to clipforge-api service on Render
   - Add environment variable:
     ```
     ML_WORKER_URL=https://clipforge-ml-worker.onrender.com
     ```
   - Redeploy API

### Option B: Use AssemblyAI (Temporary)

AssemblyAI can handle transcription but NOT clip detection. The clip detection logic is in the ML worker.

**This won't work for clip detection** - you MUST deploy the ML worker.

## Why ML Worker is Needed

The ML worker (`/ml-workers` directory) provides:
1. **Clip Detection** - Analyzes transcripts to find viral moments
2. **Whisper Transcription** - Local speech-to-text
3. **Video Analysis** - Processes video segments

Without it, videos get stuck at "Detect Clips" step.

## Deployment Priority

**CRITICAL:** Deploy ML worker to Render immediately to enable clip detection in production.

The ML worker is a Python FastAPI service that needs:
- GPU support (optional but recommended for faster processing)
- At least 2GB RAM
- Access to same S3/database/Redis as API

## Cost Consideration

Render charges for each service. The ML worker will be a separate paid service (~$7-25/month depending on instance size).

Alternative: Use a GPU provider like RunPod or Modal for the ML worker and connect it via URL.
