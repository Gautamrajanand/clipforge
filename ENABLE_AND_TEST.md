# 🚀 Enable Features & Test End-to-End

**Goal:** Get playback working and test all features!

---

## 📋 Quick Setup (5 Minutes)

### **Step 1: Update Environment Variables**

Edit your `.env` file (or create from `.env.example`):

```bash
# Copy example if you don't have .env yet
cp .env.example .env

# Then edit .env and update these lines:
```

**Add/Update these variables:**

```env
################################################################################
# FEATURE FLAGS - ENABLE ALL! 🚀
################################################################################
FF_ASPECT_RATIO=true
FF_CAPTION_STYLES=true
FF_INPAGE_PLAYBACK=true

################################################################################
# REQUIRED FOR TRANSCRIPTION
################################################################################
# Option 1: Use AssemblyAI (Recommended - Better quality)
ASR_PROVIDER=assemblyai
ASSEMBLYAI_API_KEY=your-assemblyai-key-here
ASSEMBLYAI_WEBHOOK_SECRET=your-webhook-secret-here

# Option 2: Use Whisper (Local - Free but slower)
# ASR_PROVIDER=whisper
# WHISPER_MODEL_SIZE=base
# WHISPER_DEVICE=cpu

################################################################################
# JWT SECRET (Required for proxy URLs)
################################################################################
JWT_SECRET=your-super-secret-jwt-key-change-in-prod

################################################################################
# API URLs (For worker to call back)
################################################################################
API_BASE_URL=http://localhost:3000
ML_WORKER_URL=http://localhost:8000
```

---

### **Step 2: Apply Database Migrations**

```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

Expected output:
```
✓ Applied 4 migrations
✓ Generated Prisma Client
```

---

### **Step 3: Start All Services**

Open 3 terminal windows:

#### **Terminal 1: API Server**
```bash
cd apps/api
npm run dev
```

Wait for: `🚀 Server ready on http://localhost:3000`

#### **Terminal 2: ML Worker**
```bash
cd workers
python main.py
```

Wait for: `✓ Worker started on http://localhost:8000`

#### **Terminal 3: Web App**
```bash
cd apps/web
npm run dev
```

Wait for: `✓ Ready on http://localhost:3001`

---

## 🧪 Test End-to-End Flow

### **Test 1: Upload Video**

1. Go to: http://localhost:3001/dashboard
2. Click "+ Create" or "New Project"
3. Enter project name: "Test Video"
4. Upload a video file (MP4, MOV, etc.)
5. Wait for upload to complete

**Expected:** ✅ Video appears in project list

---

### **Test 2: Transcription**

1. Open the project
2. Check browser console (F12)
3. Look for transcription logs

**Expected:**
```
✓ Transcription started
✓ Proxy URL generated
✓ AssemblyAI job submitted
✓ Webhook received
✓ Transcript saved
```

**Check database:**
```bash
cd apps/api
npx prisma studio
```

Navigate to `Transcript` table:
- ✅ `status` should be "COMPLETED"
- ✅ `data` should have words array
- ✅ `language` should be detected

---

### **Test 3: Clip Detection**

1. On project page, adjust settings:
   - Clip Length: 45 seconds
   - Number of Clips: 5
2. Click "Detect Highlights" button
3. Wait for processing

**Expected:**
```
✓ Detection started
✓ ML worker analyzing video
✓ 5 clips detected
✓ Clips appear in grid
```

---

### **Test 4: Clip Selection**

1. See clips in grid
2. Click checkboxes to select clips
3. Notice border highlight on selected clips
4. Check export button shows count

**Expected:**
- ✅ Checkboxes work
- ✅ Visual feedback on selection
- ✅ Export button shows "(3)" if 3 selected

---

### **Test 5: Export with All Features**

1. Select 1-2 clips
2. Click "Export" button
3. Wait for export to complete

**Expected (with flags ON):**
```
✓ Aspect ratio processing (9:16 crop/pad)
✓ Caption generation (ASS with styles)
✓ Boundary detection (no mid-word cuts)
✓ Proxy video generation (720p)
✓ Thumbnail generation (first frame)
✓ URLs saved to database
```

**Check database:**
```sql
SELECT id, title, proxyUrl, thumbnailUrl, aspectRatio
FROM "Moment"
WHERE proxyUrl IS NOT NULL;
```

Should see:
- ✅ `proxyUrl`: `http://localhost:9000/clipforge/...`
- ✅ `thumbnailUrl`: `http://localhost:9000/clipforge/...`
- ✅ `aspectRatio`: "9:16"

---

### **Test 6: In-Page Playback** 🎬

1. Refresh project page
2. See clips with thumbnails (not "No thumbnail")
3. Click Play button on any clip
4. Video player modal should open
5. Video should start playing

**Expected:**
- ✅ Thumbnails visible
- ✅ Play button opens modal
- ✅ Video plays instantly
- ✅ Keyboard controls work (Space, Esc)
- ✅ Volume control works
- ✅ Fullscreen works

---

### **Test 7: Caption Styles**

1. Export a clip
2. Check the exported video
3. Captions should be styled (not basic SRT)

**Expected:**
- ✅ Styled captions (Karaoke, Deep Diver, etc.)
- ✅ Keyword painting (important words highlighted)
- ✅ Progressive highlight (karaoke effect)
- ✅ Proper font (Indic/Hinglish support)

---

### **Test 8: Natural Boundaries**

1. Export a clip
2. Watch the beginning and end
3. Should not cut mid-word

**Expected:**
- ✅ Starts on sentence boundary
- ✅ Ends on sentence boundary
- ✅ Pre-roll (0.7s before first word)
- ✅ Post-roll (0.7s after last word)
- ✅ No abrupt cuts

---

## 🐛 Troubleshooting

### **Problem: Transcription not starting**

**Check:**
```bash
# API logs
tail -f apps/api/logs/*.log | grep -i transcript

# Worker logs
tail -f workers/logs/*.log | grep -i transcript
```

**Fix:**
- Verify `ASSEMBLYAI_API_KEY` is set
- Check API can reach worker
- Verify webhook URL is accessible

---

### **Problem: Clips have no thumbnails**

**Check:**
```bash
# Database
npx prisma studio
# Look at Moment table, check proxyUrl field
```

**Fix:**
- Verify `FF_INPAGE_PLAYBACK=true`
- Re-export clips
- Check worker logs for errors

---

### **Problem: Play button doesn't work**

**Check:**
```bash
# Browser console (F12)
# Look for errors
```

**Fix:**
- Verify clips have `proxyUrl`
- Check VideoPlayer component loaded
- Verify no JavaScript errors

---

### **Problem: Video won't play**

**Check:**
```bash
# Test proxy URL directly
curl http://localhost:9000/clipforge/[proxy-path]
```

**Fix:**
- Verify MinIO is running
- Check S3 credentials
- Verify file was uploaded

---

## 📊 Success Checklist

After testing, you should have:

- [x] Video uploaded
- [x] Transcription completed
- [x] Clips detected
- [x] Clips exported
- [x] Proxy videos generated
- [x] Thumbnails generated
- [x] Play button works
- [x] Video plays instantly
- [x] Captions styled
- [x] Natural boundaries

---

## 🎯 What Each Feature Does

### **FF_ASPECT_RATIO=true**
- Crops/pads video to target aspect ratio
- Smart content-aware cropping
- Supports 9:16, 16:9, 1:1, 4:5

### **FF_CAPTION_STYLES=true**
- 10 professional caption presets
- Keyword painting
- Karaoke effects
- Indic/Hinglish fonts

### **FF_INPAGE_PLAYBACK=true**
- Generates 720p proxy videos
- Creates thumbnails
- Enables instant playback
- No export required to preview

---

## 🚀 Performance Expectations

### **Transcription:**
- AssemblyAI: ~1-2 minutes for 10-min video
- Whisper: ~5-10 minutes for 10-min video

### **Clip Detection:**
- ~30 seconds for 10-min video
- Depends on ML model

### **Export (per clip):**
- Aspect ratio: ~15-20 seconds
- Captions: ~5-10 seconds
- Proxy video: ~10-15 seconds
- **Total: ~30-45 seconds per clip**

---

## 💡 Tips

### **Speed Up Testing:**
- Use shorter videos (1-2 minutes)
- Reduce clip count (2-3 clips)
- Use AssemblyAI (faster than Whisper)

### **Debug Mode:**
```env
DEBUG_MODE=true
LOG_LEVEL=debug
```

### **Check Logs:**
```bash
# API
tail -f apps/api/logs/*.log

# Worker
tail -f workers/logs/*.log

# Web
# Browser console (F12)
```

---

## 🎉 When Everything Works

You should see:

1. **Dashboard:** List of projects
2. **Project Page:** 
   - Source video playing
   - Clip settings controls
   - Grid of clips with thumbnails
   - Checkboxes for selection
   - Export button with count
3. **Click Play:**
   - Modal opens instantly
   - Video starts playing
   - Smooth playback
   - Keyboard controls work
4. **Exported Clips:**
   - Correct aspect ratio
   - Styled captions
   - Natural start/end
   - High quality

---

## 🚀 Ready to Test?

1. Update `.env` with flags ON
2. Restart all services
3. Upload a test video
4. Follow the test steps above
5. Report any issues!

---

**Let me know when you're ready and I'll help you debug any issues!** 🎬
