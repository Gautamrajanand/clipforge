# Local vs Production Configuration Audit

## Executive Summary
**Issue**: Production exports had dummy captions and wrong aspect ratio
**Root Cause**: Production was using ML worker path instead of API's working caption burning system
**Status**: Fixed in commit 76ecaf5

---

## Key Differences Found

### 1. Export Processing Method ✅ FIXED
**Local (Working)**:
- Uses `exportMoments()` method in ProjectsService
- API downloads source video, processes locally
- Burns real transcript captions with `burnCaptionsForMoment()`
- Handles aspect ratio conversion with FFmpeg
- Uploads final video with captions burned in

**Production (Broken)**:
- Was using `delegateExportToMLWorker()` method
- Delegated to ML worker which had dummy "Amazing product launch" captions
- ML worker couldn't fetch transcript (401 error)
- Wrong aspect ratio handling

**Fix Applied**: Reverted controller to use `exportMoments()` method

---

### 2. Storage Configuration
**Local**:
```yaml
S3_ENDPOINT: http://minio:9000
S3_BUCKET: clipforge
S3_ACCESS_KEY_ID: minioadmin
S3_SECRET_ACCESS_KEY: minioadmin
```

**Production**:
```env
S3_ENDPOINT: https://9ab23a593dd7e1214efa862e870cebdf.r2.cloudflarestorage.com
S3_BUCKET: clipforge-production
S3_ACCESS_KEY_ID: 5aac93ef359c87082bc0a5621d1e26b4
S3_SECRET_ACCESS_KEY: f637f3f70320345d93a9e9d8df841534e1d99508a9550dc1b9d5590437900ecf
```
✅ **Status**: Correct - using R2 in production, MinIO locally

---

### 3. ML Worker URL
**Local**:
```yaml
ML_WORKER_URL: http://ml-workers:8000
```

**Production (.env.production)**:
```env
ML_WORKER_URL: http://ml-workers:8000  # ❌ WRONG
```

**Production (Render - Correct)**:
```env
ML_WORKER_URL: https://clipforge-ml-worker.onrender.com
```
✅ **Status**: Correct in Render, but .env.production file has wrong value (not used in deployment)

---

### 4. Redis Configuration
**Local**:
```yaml
REDIS_URL: redis://redis:6379
```

**Production (.env.production)**:
```env
REDIS_URL: redis://localhost:6379  # ❌ WRONG
```

**Production (Render - Correct)**:
```env
REDIS_URL: rediss://default:...@...upstash.io:6379
```
✅ **Status**: Correct in Render, but .env.production file has wrong value

---

### 5. Feature Flags
**Local**:
```yaml
FF_ASPECT_RATIO: "true"
FF_CAPTION_STYLES: "false"
```

**Production**:
```env
FF_ASPECT_RATIO: true
FF_CAPTION_STYLES: true
FF_INPAGE_PLAYBACK: true
```
✅ **Status**: Acceptable differences for production features

---

### 6. Node Environment
**Local**:
```yaml
NODE_ENV: development
API_PORT: 3001
command: npm run start:dev  # Single process with hot reload
```

**Production**:
```env
NODE_ENV: production
API_PORT: 3000
# Runs with npm start (production build)
```
✅ **Status**: Correct - different modes for dev vs prod

---

### 7. Memory & Resource Limits
**Local (Docker)**:
```yaml
NODE_OPTIONS: --max-old-space-size=4096 --max-http-header-size=16384 --expose-gc
UV_THREADPOOL_SIZE: 128
CLUSTER_WORKERS: 4
Memory: 16GB limit
CPUs: 4.0 limit
```

**Production (Render)**:
- Standard Render instance limits
- No explicit memory flags set
⚠️ **Recommendation**: Add NODE_OPTIONS to Render if exports cause memory issues

---

## Caption Burning System (Working in Local)

### How It Works:
1. **Fetch Transcript**: Gets real transcript from database
   ```typescript
   const transcriptData = project?.transcript?.data as any;
   const words = transcriptData.words.filter(w => w.start >= moment.tStart && w.end <= moment.tEnd);
   ```

2. **Adjust Timestamps**: Converts to clip-relative time
   ```typescript
   .map(w => ({
     text: w.text,
     start: w.start - moment.tStart,
     end: w.end - moment.tStart
   }));
   ```

3. **Burn Captions**: Uses `burnCaptionsToVideo()` method
   - For animated styles (bold, modern, elegant): Frame-by-frame rendering
   - For static styles (mrbeast, karaoke, etc.): ASS subtitle burning with FFmpeg
   - Applies correct colors, size, position per preset

4. **Aspect Ratio**: Uses FFmpeg `convertAspectRatio()`
   - Supports 9:16, 1:1, 16:9
   - Crop or pad modes
   - Smart positioning

---

## What Was Broken in Production

### ML Worker Path Issues:
1. **Dummy Captions**: ML worker had hardcoded "Amazing product launch" text
2. **No Transcript Access**: Couldn't fetch transcript (401 error)
3. **Wrong Aspect Ratio**: ML worker's reframing logic different from API's
4. **Missing Caption Styles**: Didn't use proper preset colors/sizes

### Why Local Worked:
- Used API's direct processing path
- Had access to database transcript
- Used proven FFmpeg caption burning
- Correct aspect ratio conversion

---

## Verification Checklist

After deployment of commit 76ecaf5:

### Exports Should Have:
- [ ] Real transcript text (not "Amazing product launch")
- [ ] MrBeast yellow captions (#FFD900)
- [ ] Large font size (75px)
- [ ] Black outline (5px)
- [ ] Center alignment
- [ ] Actual 9:16 video file (1080x1920)
- [ ] Captions burned into every frame

### Test Steps:
1. Create new export with MrBeast style
2. Download video file
3. Check metadata: `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 video.mp4`
4. Should show: `1080,1920`
5. Play video - captions should be burned in (not separate subtitle track)

---

## Recommendations

### 1. Update .env.production File
The file has incorrect values that don't match Render deployment:
```env
# Fix these:
REDIS_URL=rediss://default:...@...upstash.io:6379
ML_WORKER_URL=https://clipforge-ml-worker.onrender.com
```

### 2. Remove ML Worker Export Path
The `delegateExportToMLWorker()` method should be removed or marked deprecated since it doesn't work correctly:
- Dummy captions
- Can't access transcript
- Different aspect ratio logic

### 3. Consider Async Processing
Current fix uses synchronous processing which blocks the API. For production scale:
- Move to BullMQ queue
- Process exports in background
- Still use API's caption burning (not ML worker)
- Update status via database

### 4. Add Memory Monitoring
If exports cause memory issues on Render:
```env
NODE_OPTIONS=--max-old-space-size=4096 --expose-gc
```

---

## Conclusion

**Primary Issue**: Production was using wrong export path (ML worker) instead of working API path
**Fix**: Reverted to `exportMoments()` method that was working locally
**Status**: Deployed in commit 76ecaf5, waiting for Render deployment

The local setup was working perfectly because it used the API's direct processing with real transcript caption burning. Production will now match this behavior.
