# 🔧 Fix 6 Core Issues - Implementation Plan

**Ground Truth:** CHATGPT_CONTEXT.md (Nov 6, 2025)  
**Mode:** SAFETY MODE - Fix only, no rebuilds  
**Branch:** feature/fix-core-flow

---

## 🎯 **6 ISSUES TO FIX**

Based on CHATGPT_CONTEXT.md "NOT WORKING / KNOWN ISSUES" section:

### **Issue 1: Aspect Ratio Processing** ⚠️
**Current State:** Metadata saved (aspectRatio field exists in DB)  
**Problem:** Video not actually cropped/resized  
**What Works:** Settings UI, database storage, clip generation  
**What's Missing:** FFmpeg processing to apply aspect ratio  
**Fix:** Add FFmpeg service to process exports

### **Issue 2: AssemblyAI Transcription Proxy** ⚠️
**Current State:** Using mock transcripts  
**Problem:** AssemblyAI can't access MinIO (internal network)  
**What Works:** Transcription service, database storage  
**What's Missing:** Proxy endpoint to expose videos  
**Fix:** Create proxy controller for temporary video access

### **Issue 3: Clip Boundarying** ⚠️
**Current State:** Clips generated without validation  
**Problem:** May overlap or exceed video duration  
**What Works:** Clip detection, time calculation  
**What's Missing:** Boundary validation logic  
**Fix:** Add validation in clip generation

### **Issue 4: In-Page Playback** ⚠️
**Current State:** Download-only  
**Problem:** No video player on project page  
**What Works:** Video storage, clip metadata  
**What's Missing:** Video player component, streaming endpoint  
**Fix:** Add video player + streaming API

### **Issue 5: Caption Styles** ⚠️
**Current State:** Not implemented  
**Problem:** No captions feature  
**What Works:** Transcript with word timestamps  
**What's Missing:** SRT generation, FFmpeg rendering, UI  
**Fix:** Add caption generation and rendering

### **Issue 6: Usage Counters** ⚠️
**Current State:** No tracking  
**Problem:** Can't track usage for billing  
**What Works:** All features generate events  
**What's Missing:** Usage tracking service  
**Fix:** Add usage metrics collection

---

## 📋 **IMPLEMENTATION APPROACH**

### **Principle: Wire Missing Pieces Only**

✅ **DO:**
- Add new services/controllers
- Add new database columns (nullable)
- Add new API endpoints
- Add new UI components
- Wire existing features together

❌ **DON'T:**
- Modify existing working features
- Rename files/services
- Drop database columns
- Change existing APIs
- Rebuild completed components

---

## 🔧 **FIX 1: ASPECT RATIO PROCESSING**

### **What Exists (Don't Touch):**
- ✅ `Moment.aspectRatio` column in database
- ✅ `ClipSettingsDto` with aspectRatio field
- ✅ UI for selecting aspect ratio
- ✅ Settings saved to database

### **What to Add:**
1. **FFmpeg Service** (`apps/api/src/video/ffmpeg.service.ts`)
   - Crop/resize video to aspect ratio
   - Use existing aspectRatio from Moment

2. **Processing Queue** (use existing Redis)
   - Queue video processing jobs
   - Track processing status

3. **Export Processing** (modify `apps/api/src/exports/exports.service.ts`)
   - Add processing step before download
   - Apply aspect ratio from Moment.aspectRatio

### **Database Changes (Additive):**
```sql
ALTER TABLE "Export" ADD COLUMN "processingStatus" VARCHAR;
ALTER TABLE "Export" ADD COLUMN "processedUrl" VARCHAR;
```

### **API Endpoints (New):**
```typescript
POST /v1/exports/:id/process  // Trigger processing
GET /v1/exports/:id/status    // Check status
```

### **Feature Flag:**
```env
FF_ASPECT_RATIO=true
```

---

## 🔧 **FIX 2: TRANSCRIPTION PROXY**

### **What Exists (Don't Touch):**
- ✅ `TranscriptionService` with AssemblyAI integration
- ✅ Video storage in MinIO
- ✅ Transcript database model

### **What to Add:**
1. **Proxy Controller** (`apps/api/src/proxy/proxy.controller.ts`)
   - Generate temporary signed URLs
   - Proxy video requests to MinIO

2. **Token Service** (`apps/api/src/proxy/token.service.ts`)
   - Create expiring tokens (1 hour)
   - Validate tokens

3. **Update Transcription** (modify `apps/api/src/transcription/transcription.service.ts`)
   - Use proxy URL instead of MinIO URL
   - Pass to AssemblyAI

### **Database Changes:**
None (use existing tables)

### **API Endpoints (New):**
```typescript
GET /v1/proxy/video/:token  // Proxy video access
```

### **Feature Flag:**
None (infrastructure fix)

---

## 🔧 **FIX 3: CLIP BOUNDARYING**

### **What Exists (Don't Touch):**
- ✅ Clip detection logic in `projects.service.ts`
- ✅ `Moment` model with tStart, tEnd, duration

### **What to Add:**
1. **Validation Logic** (add to `apps/api/src/projects/projects.service.ts`)
   - Check clip doesn't exceed video duration
   - Check clips don't overlap
   - Adjust times if needed

2. **Video Duration** (add to Project model)
   - Store video duration on upload
   - Use for validation

### **Database Changes (Additive):**
```sql
ALTER TABLE "Project" ADD COLUMN "videoDuration" FLOAT;
ALTER TABLE "Moment" ADD COLUMN "isValid" BOOLEAN DEFAULT true;
```

### **API Changes:**
Modify existing `detect()` method to add validation

### **Feature Flag:**
None (improvement to existing feature)

---

## 🔧 **FIX 4: IN-PAGE PLAYBACK**

### **What Exists (Don't Touch):**
- ✅ Video storage in MinIO
- ✅ Project page UI
- ✅ Clip metadata

### **What to Add:**
1. **Video Player Component** (`apps/web/components/video/VideoPlayer.tsx`)
   - HTML5 video player
   - Playback controls

2. **Streaming Endpoint** (`apps/api/src/storage/storage.controller.ts`)
   - Stream video from MinIO
   - Support range requests

3. **UI Integration** (modify `apps/web/app/project/[id]/page.tsx`)
   - Add video player to clip cards
   - Replace download-only with play option

### **Database Changes:**
None (use existing data)

### **API Endpoints (New):**
```typescript
GET /v1/clips/:id/stream      // Stream video
GET /v1/clips/:id/thumbnail   // Get thumbnail
```

### **Feature Flag:**
```env
FF_INPAGE_PLAYBACK=true
```

---

## 🔧 **FIX 5: CAPTION STYLES**

### **What Exists (Don't Touch):**
- ✅ Transcript with word-level timestamps
- ✅ Export functionality

### **What to Add:**
1. **Caption Styles** (`apps/api/src/captions/caption-styles.ts`)
   - Define 10+ preset styles
   - Style configuration

2. **SRT Generator** (`apps/api/src/captions/srt-generator.ts`)
   - Convert transcript to SRT/VTT
   - Use word timestamps

3. **Caption Service** (`apps/api/src/captions/captions.service.ts`)
   - Generate captions
   - Render with FFmpeg

4. **UI Component** (`apps/web/components/captions/CaptionStylePicker.tsx`)
   - Style selection
   - Preview

### **Database Changes (Additive):**
```sql
CREATE TABLE "CaptionStyle" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "fontFamily" VARCHAR,
  "fontSize" INTEGER,
  "fontColor" VARCHAR,
  "backgroundColor" VARCHAR,
  "position" VARCHAR,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

ALTER TABLE "Export" ADD COLUMN "captionStyleId" VARCHAR;
ALTER TABLE "Export" ADD COLUMN "captionsEnabled" BOOLEAN DEFAULT false;
```

### **API Endpoints (New):**
```typescript
GET /v1/caption-styles           // List styles
POST /v1/exports/:id/captions    // Add captions
```

### **Feature Flag:**
```env
FF_CAPTION_STYLES=true
```

---

## 🔧 **FIX 6: USAGE COUNTERS**

### **What Exists (Don't Touch):**
- ✅ All features that generate usage
- ✅ Organization/User models

### **What to Add:**
1. **Usage Service** (`apps/api/src/usage/usage.service.ts`)
   - Track metrics
   - Aggregate usage

2. **Usage Interceptor** (add to existing controllers)
   - Auto-track on API calls
   - Increment counters

3. **Dashboard Component** (`apps/web/components/usage/UsageDashboard.tsx`)
   - Display usage
   - Show limits

### **Database Changes (Additive):**
```sql
CREATE TABLE "UsageMetric" (
  "id" VARCHAR PRIMARY KEY,
  "orgId" VARCHAR NOT NULL,
  "metricType" VARCHAR NOT NULL,
  "value" INTEGER NOT NULL,
  "metadata" JSON,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "idx_usage_org" ON "UsageMetric"("orgId", "metricType");
```

### **API Endpoints (New):**
```typescript
GET /v1/usage/current   // Current usage
GET /v1/usage/history   // Usage history
```

### **Feature Flag:**
None (infrastructure)

---

## 📊 **IMPLEMENTATION ORDER**

### **Phase 1: Infrastructure (1 hour)**
1. Fix 2: Transcription Proxy (30 min)
2. Fix 3: Clip Boundarying (30 min)

### **Phase 2: Video Features (2 hours)**
3. Fix 1: Aspect Ratio Processing (1 hour)
4. Fix 4: In-Page Playback (1 hour)

### **Phase 3: Advanced Features (2 hours)**
5. Fix 5: Caption Styles (1.5 hours)
6. Fix 6: Usage Counters (30 min)

**Total Time:** ~5 hours

---

## 🧪 **TESTING STRATEGY**

### **For Each Fix:**
1. Unit test the new service
2. Integration test the API endpoint
3. Manual test the UI (if applicable)
4. Verify existing features still work

### **Regression Testing:**
- ✅ Upload still works
- ✅ Clip detection still works
- ✅ Export still works
- ✅ Project management still works

---

## 🔄 **ROLLBACK PLAN**

### **Per Fix:**
Each fix is behind a feature flag or isolated service.

**Rollback Steps:**
1. Disable feature flag
2. Revert specific commits
3. Rollback database migration (if needed)

### **Database Rollback:**
All migrations are additive (nullable columns).
Can rollback without data loss.

---

## ✅ **SUCCESS CRITERIA**

### **Fix 1: Aspect Ratio**
- ✅ Videos are cropped to selected aspect ratio
- ✅ Existing clips still work
- ✅ Export with aspect ratio works

### **Fix 2: Transcription Proxy**
- ✅ AssemblyAI can access videos
- ✅ Transcription works end-to-end
- ✅ Existing mock transcripts still work

### **Fix 3: Clip Boundarying**
- ✅ Clips don't exceed video duration
- ✅ No overlapping clips
- ✅ Existing clips still valid

### **Fix 4: In-Page Playback**
- ✅ Videos play on project page
- ✅ Download still works
- ✅ Existing UI still works

### **Fix 5: Caption Styles**
- ✅ Captions generated from transcript
- ✅ Styles applied to video
- ✅ Export with captions works

### **Fix 6: Usage Counters**
- ✅ Usage tracked for all actions
- ✅ Dashboard shows usage
- ✅ No impact on performance

---

**Ready to implement. Starting with Fix 2 (Transcription Proxy) as it's the quickest win.**
