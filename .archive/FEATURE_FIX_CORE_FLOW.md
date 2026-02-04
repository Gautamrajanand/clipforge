# 🔧 Feature: Fix Core Flow

**Branch:** `feature/fix-core-flow`  
**Status:** In Progress  
**Mode:** SAFETY MODE - NON-DESTRUCTIVE  
**Created:** November 6, 2025

---

## 🎯 **OBJECTIVE**

Fix and enhance core video processing flow with aspect ratio processing, caption styles, transcription proxy, clip boundarying, in-page playback, and usage counters.

---

## 🛡️ **SAFETY CONSTRAINTS**

### **Branch Protection:**
- ✅ Work ONLY on: `feature/fix-core-flow`
- ❌ NO merges to main without review
- ✅ Single PR delivery
- ✅ Rollback steps included

### **Stack Preservation:**
- ✅ Keep: Next.js 14 + Tailwind + Clerk (web)
- ✅ Keep: NestJS + Prisma + Postgres (API)
- ✅ Keep: Redis, MinIO
- ✅ Keep: Python workers (FFmpeg/VAD)
- ✅ Keep: AssemblyAI primary, Whisper fallback

### **Code Safety:**
- ❌ NO file/service renames
- ❌ NO file/service removals
- ✅ ONLY additive changes
- ✅ All behind feature flags

### **Database Safety:**
- ✅ Migrations must be additive only
- ❌ NO drops or renames
- ✅ New columns must be nullable
- ✅ Use backfills for existing data

### **Testing:**
- ✅ All new code has unit tests
- ✅ Integration tests for critical paths
- ✅ Keep existing tests green
- ✅ No test deletions

### **Environment:**
- ✅ Local/dev only
- ❌ NO prod config changes
- ✅ Feature flags for all new features

---

## 🚩 **FEATURE FLAGS**

### **Configuration:**

```env
# .env.local
FF_ASPECT_RATIO=true
FF_CAPTION_STYLES=true
FF_INPAGE_PLAYBACK=true
```

### **Implementation:**

```typescript
// apps/api/src/config/feature-flags.ts
export const FeatureFlags = {
  ASPECT_RATIO: process.env.FF_ASPECT_RATIO === 'true',
  CAPTION_STYLES: process.env.FF_CAPTION_STYLES === 'true',
  INPAGE_PLAYBACK: process.env.FF_INPAGE_PLAYBACK === 'true',
};
```

---

## 📋 **IMPLEMENTATION STEPS**

### **Step 1: Aspect Ratio Video Processing** 🎬
**Priority:** HIGH  
**Effort:** 3 hours  
**Feature Flag:** `FF_ASPECT_RATIO`

**Goal:** Actually crop/resize videos to selected aspect ratios

**Tasks:**
1. ✅ Add FFmpeg service to API
2. ✅ Create video processing queue (Redis)
3. ✅ Implement aspect ratio conversion:
   - 9:16 (Vertical)
   - 16:9 (Landscape)
   - 1:1 (Square)
   - 4:5 (Portrait)
4. ✅ Add processing status tracking
5. ✅ Update export endpoint to process video
6. ✅ Add tests

**Database Changes:**
```sql
-- Additive migration
ALTER TABLE "Export" ADD COLUMN "processingStatus" VARCHAR;
ALTER TABLE "Export" ADD COLUMN "processedUrl" VARCHAR;
ALTER TABLE "Export" ADD COLUMN "processingError" TEXT;
```

**API Endpoints:**
```typescript
POST /v1/exports/:id/process
GET /v1/exports/:id/status
```

**Files to Create:**
- `apps/api/src/video/video-processing.service.ts`
- `apps/api/src/video/ffmpeg.service.ts`
- `apps/api/src/video/video-processing.queue.ts`

**Files to Modify:**
- `apps/api/src/exports/exports.service.ts`
- `apps/api/src/exports/exports.controller.ts`

---

### **Step 2: Caption Styles** 🎨
**Priority:** HIGH  
**Effort:** 4 hours  
**Feature Flag:** `FF_CAPTION_STYLES`

**Goal:** Add visual caption styles and burn into video

**Tasks:**
1. ✅ Create caption styles database schema
2. ✅ Implement SRT/VTT generation from transcript
3. ✅ Add FFmpeg caption rendering
4. ✅ Create 10+ caption style presets
5. ✅ Add caption customization UI
6. ✅ Add tests

**Database Changes:**
```sql
-- Additive migration
CREATE TABLE "CaptionStyle" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "fontFamily" VARCHAR,
  "fontSize" INTEGER,
  "fontColor" VARCHAR,
  "backgroundColor" VARCHAR,
  "position" VARCHAR,
  "animation" VARCHAR,
  "outline" BOOLEAN,
  "shadow" BOOLEAN,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

ALTER TABLE "Export" ADD COLUMN "captionStyleId" VARCHAR;
ALTER TABLE "Export" ADD COLUMN "captionsEnabled" BOOLEAN DEFAULT false;
```

**API Endpoints:**
```typescript
GET /v1/caption-styles
POST /v1/exports/:id/captions
GET /v1/exports/:id/captions/preview
```

**Files to Create:**
- `apps/api/src/captions/captions.service.ts`
- `apps/api/src/captions/caption-styles.ts`
- `apps/api/src/captions/srt-generator.ts`
- `apps/web/components/captions/CaptionStylePicker.tsx`

---

### **Step 3: Transcription Proxy** 🎙️
**Priority:** MEDIUM  
**Effort:** 2 hours  
**Feature Flag:** None (infrastructure)

**Goal:** Proxy MinIO URLs so AssemblyAI can access them

**Tasks:**
1. ✅ Create proxy endpoint for video files
2. ✅ Add authentication/authorization
3. ✅ Add expiring tokens
4. ✅ Update transcription service to use proxy
5. ✅ Add tests

**API Endpoints:**
```typescript
GET /v1/proxy/video/:token
```

**Files to Create:**
- `apps/api/src/proxy/proxy.controller.ts`
- `apps/api/src/proxy/proxy.service.ts`
- `apps/api/src/proxy/token.service.ts`

**Files to Modify:**
- `apps/api/src/transcription/transcription.service.ts`

---

### **Step 4: Clip Boundarying** 📊
**Priority:** MEDIUM  
**Effort:** 2 hours  
**Feature Flag:** None (improvement)

**Goal:** Ensure clips don't overlap and respect video boundaries

**Tasks:**
1. ✅ Add video duration validation
2. ✅ Implement clip overlap detection
3. ✅ Add boundary checking logic
4. ✅ Adjust clip times to fit within video
5. ✅ Add tests

**Database Changes:**
```sql
-- Additive migration
ALTER TABLE "Project" ADD COLUMN "videoDuration" FLOAT;
ALTER TABLE "Moment" ADD COLUMN "isValid" BOOLEAN DEFAULT true;
ALTER TABLE "Moment" ADD COLUMN "validationError" TEXT;
```

**Files to Modify:**
- `apps/api/src/projects/projects.service.ts`
- `apps/api/src/moments/moments.service.ts` (create if needed)

---

### **Step 5: In-Page Video Playback** 📺
**Priority:** HIGH  
**Effort:** 2 hours  
**Feature Flag:** `FF_INPAGE_PLAYBACK`

**Goal:** Play clips directly on project page without download

**Tasks:**
1. ✅ Add video player component
2. ✅ Implement streaming from MinIO
3. ✅ Add playback controls
4. ✅ Add clip preview
5. ✅ Add tests

**Files to Create:**
- `apps/web/components/video/VideoPlayer.tsx`
- `apps/web/components/video/ClipPreview.tsx`

**Files to Modify:**
- `apps/web/app/project/[id]/page.tsx`
- `apps/api/src/storage/storage.controller.ts`

**API Endpoints:**
```typescript
GET /v1/clips/:id/stream
GET /v1/clips/:id/thumbnail
```

---

### **Step 6: Usage Counters** 📈
**Priority:** MEDIUM  
**Effort:** 2 hours  
**Feature Flag:** None (infrastructure)

**Goal:** Track usage for future billing/limits

**Tasks:**
1. ✅ Create usage tracking service
2. ✅ Track key metrics:
   - Projects created
   - Clips generated
   - Videos processed
   - Exports created
   - API calls
3. ✅ Add usage dashboard
4. ✅ Add tests

**Database Changes:**
```sql
-- Additive migration
CREATE TABLE "UsageMetric" (
  "id" VARCHAR PRIMARY KEY,
  "orgId" VARCHAR NOT NULL,
  "userId" VARCHAR,
  "metricType" VARCHAR NOT NULL,
  "value" INTEGER NOT NULL,
  "metadata" JSON,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX "idx_usage_org_type" ON "UsageMetric"("orgId", "metricType");
CREATE INDEX "idx_usage_created" ON "UsageMetric"("createdAt");
```

**API Endpoints:**
```typescript
GET /v1/usage/current
GET /v1/usage/history
```

**Files to Create:**
- `apps/api/src/usage/usage.service.ts`
- `apps/api/src/usage/usage.controller.ts`
- `apps/web/components/usage/UsageDashboard.tsx`

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests:**
- ✅ FFmpeg service
- ✅ Caption generation
- ✅ Proxy token service
- ✅ Boundarying logic
- ✅ Usage tracking

### **Integration Tests:**
- ✅ Video processing pipeline
- ✅ Caption rendering
- ✅ Transcription proxy
- ✅ Clip validation
- ✅ Video streaming

### **E2E Tests:**
- ✅ Upload → Process → Export with aspect ratio
- ✅ Upload → Generate captions → Export
- ✅ Upload → Transcribe via proxy
- ✅ Upload → Validate clips
- ✅ Upload → Play in-page

---

## 📦 **DELIVERABLES**

### **Code:**
- ✅ All features behind feature flags
- ✅ All tests passing
- ✅ No existing tests broken
- ✅ Code reviewed

### **Database:**
- ✅ Migrations are additive
- ✅ Rollback scripts provided
- ✅ Data backfill scripts (if needed)

### **Documentation:**
- ✅ Feature flag documentation
- ✅ API endpoint documentation
- ✅ Rollback procedure
- ✅ Testing guide

### **PR:**
- ✅ Single PR with all changes
- ✅ Detailed description
- ✅ Rollback steps
- ✅ Testing instructions
- ✅ Screenshots/videos

---

## 🔄 **ROLLBACK PLAN**

### **If Issues Found:**

**Option 1: Disable Feature Flags**
```env
FF_ASPECT_RATIO=false
FF_CAPTION_STYLES=false
FF_INPAGE_PLAYBACK=false
```

**Option 2: Revert Branch**
```bash
git revert <commit-hash>
git push origin feature/fix-core-flow
```

**Option 3: Database Rollback**
```sql
-- Rollback migrations (if needed)
-- Scripts provided in migration files
```

### **Rollback Steps:**
1. Disable feature flags in `.env.local`
2. Restart API service
3. Verify core functionality works
4. If needed, revert commits
5. If needed, rollback database migrations

---

## 📊 **PROGRESS TRACKING**

### **Step 1: Aspect Ratio Processing**
- [ ] FFmpeg service created
- [ ] Processing queue implemented
- [ ] Aspect ratio conversion working
- [ ] Tests written
- [ ] Feature flag integrated

### **Step 2: Caption Styles**
- [ ] Database schema created
- [ ] SRT/VTT generation working
- [ ] FFmpeg rendering working
- [ ] UI component created
- [ ] Tests written

### **Step 3: Transcription Proxy**
- [ ] Proxy endpoint created
- [ ] Token service implemented
- [ ] Transcription service updated
- [ ] Tests written

### **Step 4: Clip Boundarying**
- [ ] Validation logic implemented
- [ ] Overlap detection working
- [ ] Boundary checking working
- [ ] Tests written

### **Step 5: In-Page Playback**
- [ ] Video player component created
- [ ] Streaming endpoint working
- [ ] UI integrated
- [ ] Tests written

### **Step 6: Usage Counters**
- [ ] Usage tracking service created
- [ ] Metrics being tracked
- [ ] Dashboard created
- [ ] Tests written

---

## 🎯 **SUCCESS CRITERIA**

### **Functional:**
- ✅ Videos are cropped to selected aspect ratios
- ✅ Captions are burned into videos
- ✅ Transcription works via proxy
- ✅ Clips don't overlap or exceed video bounds
- ✅ Videos play in-page
- ✅ Usage is tracked

### **Technical:**
- ✅ All features behind feature flags
- ✅ All tests passing (100% of existing + new)
- ✅ No breaking changes
- ✅ Database migrations are additive
- ✅ Code is reviewed

### **Safety:**
- ✅ Rollback plan tested
- ✅ No prod impact
- ✅ Local/dev only
- ✅ Can be disabled instantly

---

## 📝 **NOTES**

- All work is additive and non-destructive
- Feature flags allow instant disable
- Database migrations can be rolled back
- Existing functionality is preserved
- Tests ensure no regressions

---

**Status:** Ready to implement  
**Next:** Start with Step 1 (Aspect Ratio Processing)
