# ML Worker Environment Variables - Copy/Paste Instructions

## How to Get All Values at Once

1. **Open Render Dashboard:** https://dashboard.render.com
2. **Click on `clipforge-api` service**
3. **Go to "Environment" tab**
4. **You'll see all your production values there**

---

## Copy These 7 Values from clipforge-api

Open `clipforge-api` → Environment tab, then copy the VALUES for:

### 1. DATABASE_URL
```
Key: DATABASE_URL
Value: <copy the entire postgresql://... URL>
```
**Look for:** Starts with `postgresql://`

### 2. REDIS_URL
```
Key: REDIS_URL
Value: <copy the entire redis://... URL>
```
**Look for:** Starts with `redis://` or `rediss://`

### 3. S3_ENDPOINT
```
Key: S3_ENDPOINT
Value: <copy the entire https://... URL>
```
**Look for:** Cloudflare R2 URL, starts with `https://`

### 4. S3_ACCESS_KEY_ID
```
Key: S3_ACCESS_KEY_ID
Value: <copy the access key>
```
**Look for:** Long alphanumeric string

### 5. S3_SECRET_ACCESS_KEY
```
Key: S3_SECRET_ACCESS_KEY
Value: <copy the secret key>
```
**Look for:** Long alphanumeric string (will be hidden, click eye icon to reveal)

### 6. OPENAI_API_KEY
```
Key: OPENAI_API_KEY
Value: <copy the key>
```
**Look for:** Starts with `sk-proj-`

### 7. ASSEMBLYAI_API_KEY
```
Key: ASSEMBLYAI_API_KEY
Value: <copy the key>
```
**Look for:** Long alphanumeric string

---

## Then Add These 7 New Variables (Copy Exactly)

### 8. S3_REGION
```
Key: S3_REGION
Value: auto
```

### 9. S3_BUCKET
```
Key: S3_BUCKET
Value: clipforge
```

### 10. ASR_PROVIDER
```
Key: ASR_PROVIDER
Value: whisper
```

### 11. ML_WORKER_PORT
```
Key: ML_WORKER_PORT
Value: 8000
```

### 12. ML_WORKER_HOST
```
Key: ML_WORKER_HOST
Value: 0.0.0.0
```

### 13. WHISPER_MODEL_SIZE
```
Key: WHISPER_MODEL_SIZE
Value: base
```

### 14. WHISPER_DEVICE
```
Key: WHISPER_DEVICE
Value: cpu
```

---

## Quick Checklist

- [ ] Changed Language to "Python 3" (not Docker)
- [ ] Added Build Command: `pip install -r workers/requirements.txt`
- [ ] Added Start Command: `cd workers && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Selected Instance Type: Starter ($7/month)
- [ ] Added all 14 environment variables
- [ ] Clicked "Create Web Service"

---

## Screenshot Guide

If you want, take a screenshot of your `clipforge-api` Environment tab and share it with me. I can then give you the exact copy/paste values (with sensitive parts masked).

Alternatively, just copy each value one by one from the API service - it only takes 2-3 minutes.
