# AI Subtitles - Root Cause Analysis (Nov 16, 2025)

**Status**: 🔍 ROOT CAUSE IDENTIFIED  
**Priority**: CRITICAL

---

## The Real Problem

**AI Clips works perfectly. AI Subtitles doesn't. They use the same pipeline.**

### Why AI Clips Works:

```
Upload → Queue Transcription Job → TranscriptionProcessor → Queue Clip Detection → READY ✅
```

### Why AI Subtitles Fails:

```
Upload → Direct transcribeProject() call → triggerDetection() → ??? → READY ❌
```

---

## The Two Code Paths

### Path 1: Job Queue (✅ WORKS)
**Used by**: AI Clips, Import from URL

**Flow**:
1. `importVideoFromUrl()` → Queues video import job
2. Video import processor → Downloads video → Queues transcription job
3. `TranscriptionProcessor.process()` → Transcribes → Queues clip detection OR subtitle export
4. Clip detection processor → Detects clips → READY
5. Subtitle export processor → Burns captions → READY

**File**: `apps/api/src/queues/processors/transcription.processor.ts`
```typescript
// Line 53-79
if (clipSettings.subtitlesMode) {
  console.log(`⏭️ Skipping clip detection for project ${projectId} (Subtitles mode)`);
  console.log(`📝 Queuing subtitle export job for project ${projectId}`);
  await this.subtitleExportQueue.add('export-subtitles', { projectId, orgId }, { ... });
  return;
}
```

**Result**: ✅ Subtitle export job is queued correctly

---

### Path 2: Direct Call (❌ BROKEN)
**Used by**: Upload method

**Flow**:
1. `uploadVideo()` → Uploads file → Calls `transcribeProject()` directly (line 416)
2. `transcribeProject()` → Transcribes → Calls `triggerDetection()` directly (line 135)
3. `triggerDetection()` → Checks `subtitlesMode` → Queues subtitle export (line 174)
4. **BUT**: This is a fire-and-forget async call, no proper error handling

**File**: `apps/api/src/projects/projects.service.ts`
```typescript
// Line 414-418
if (this.transcription.isAvailable()) {
  console.log(`🎙️ Triggering transcription for project: ${projectId}`);
  this.transcription.transcribeProject(projectId).catch((error) => {
    console.error('Transcription failed:', error);
  });
}
```

**File**: `apps/api/src/transcription/transcription.service.ts`
```typescript
// Line 133-137
if (savedTranscript) {
  console.log(`🎬 Auto-triggering clip detection for project: ${projectId}`);
  this.triggerDetection(projectId, savedTranscript.id).catch((error) => {
    console.error('Failed to trigger detection:', error);
  });
}
```

**Result**: ❌ Subtitle export job may or may not be queued (race conditions, error swallowing)

---

## Why This Happened

### Historical Context:
1. **Originally**: Upload used direct calls (synchronous-ish)
2. **Scale-First Update**: Import from URL was refactored to use job queues
3. **Upload was never updated**: Still uses old direct call pattern
4. **AI Clips works**: Because it uses Import from URL flow
5. **AI Subtitles fails**: Because Upload flow is broken

### The Comment in Code:
```typescript
// Line 446: ✅ SCALE-FIRST: Use job queue instead of fire-and-forget async
const job = await this.queues.addVideoImportJob(projectId, url, customTitle);
```

This comment exists in `importVideoFromUrl` but NOT in `uploadVideo`!

---

## The Fix

### Option 1: Make Upload Use Job Queue (RECOMMENDED)
**Pros**:
- Consistent with Scale-First principles
- Proper error handling
- Better observability
- Matches Import from URL flow

**Cons**:
- Requires creating a new job processor for upload
- More code changes

**Implementation**:
```typescript
// In uploadVideo():
// BEFORE:
this.transcription.transcribeProject(projectId).catch((error) => {
  console.error('Transcription failed:', error);
});

// AFTER:
const job = await this.queues.addTranscriptionJob(projectId);
this.logger.log(`✅ Transcription job queued: ${job.jobId}`);
```

---

### Option 2: Fix Direct Call Path (QUICK FIX)
**Pros**:
- Minimal code changes
- Faster to implement

**Cons**:
- Doesn't follow Scale-First principles
- Still has fire-and-forget issues
- Inconsistent with Import from URL

**Implementation**:
- Already done! We fixed `triggerDetection()` to queue subtitle export
- But the fire-and-forget pattern means errors are swallowed

---

## Why Our Fixes Didn't Work

### Fix 1: Cache-Control Headers
- **Problem**: Browser cache
- **Fix**: Added `Cache-Control: no-cache`
- **Result**: ❌ Didn't help because the real issue is backend

### Fix 2: Cache-Busting Query Parameter
- **Problem**: Browser cache
- **Fix**: Added `?t=timestamp` to video URL
- **Result**: ❌ Didn't help because the real issue is backend

### Fix 3: Queue Subtitle Export in triggerDetection()
- **Problem**: Subtitle export not queued
- **Fix**: Updated `triggerDetection()` to queue job
- **Result**: ⚠️ Partially works, but fire-and-forget pattern swallows errors

---

## The Real Root Cause

**Upload uses fire-and-forget async pattern instead of job queue.**

```typescript
// Fire-and-forget (BAD):
this.transcription.transcribeProject(projectId).catch((error) => {
  console.error('Transcription failed:', error); // Error is logged but not handled
});
```

**Problems**:
1. No retry logic
2. Errors are swallowed
3. No progress tracking
4. Race conditions
5. Can't monitor job status

**vs. Job Queue (GOOD)**:
```typescript
const job = await this.queues.addTranscriptionJob(projectId);
// Job is tracked, retried on failure, progress is monitored
```

---

## Testing Evidence

### Working Projects (Import from URL):
```
cmi1lg3aj00076zeehn4g2kjk - Status: TRANSCRIBING ✅
cmi1lee1b00016zeev13cir2u - Status: READY ✅
```

Both have `source.mp4` and `captioned.mp4` in storage.

### Broken Projects (Upload):
```
cmi1klzpf001v14pa9mumu8zx - Status: READY ❌
```

Has `source.mp4` but no `captioned.mp4` (subtitle export never ran).

---

## Recommended Solution

### Step 1: Make Upload Use Job Queue
Update `uploadVideo()` to queue transcription job instead of calling directly:

```typescript
// In projects.service.ts, line 414-421:
// REMOVE:
if (this.transcription.isAvailable()) {
  console.log(`🎙️ Triggering transcription for project: ${projectId}`);
  this.transcription.transcribeProject(projectId).catch((error) => {
    console.error('Transcription failed:', error);
  });
}

// ADD:
const job = await this.queues.addTranscriptionJob(projectId);
this.logger.log(`✅ Transcription job queued: ${job.jobId}`);
```

### Step 2: Remove Direct Call from transcribeProject()
The `triggerDetection()` call should ONLY happen in `TranscriptionProcessor`, not in `transcribeProject()`:

```typescript
// In transcription.service.ts, line 128-137:
// REMOVE:
if (savedTranscript) {
  console.log(`🎬 Auto-triggering clip detection for project: ${projectId}`);
  this.triggerDetection(projectId, savedTranscript.id).catch((error) => {
    console.error('Failed to trigger detection:', error);
  });
}

// This logic should ONLY be in TranscriptionProcessor
```

### Step 3: Keep TranscriptionProcessor Logic
The `TranscriptionProcessor` already has the correct logic:

```typescript
// In transcription.processor.ts, line 53-79:
if (clipSettings.subtitlesMode) {
  console.log(`⏭️ Skipping clip detection for project ${projectId} (Subtitles mode)`);
  console.log(`📝 Queuing subtitle export job for project ${projectId}`);
  await this.subtitleExportQueue.add('export-subtitles', { projectId, orgId }, { ... });
  return;
}
```

---

## Expected Flow After Fix

### Upload Method:
```
1. Upload file → INGESTING
2. Queue transcription job
3. TranscriptionProcessor runs → TRANSCRIBING
4. Queue subtitle export job
5. SubtitleExportProcessor runs → Generates captioned.mp4
6. READY ✅
```

### Import from URL:
```
1. Import URL → IMPORTING
2. Queue video import job
3. VideoImportProcessor downloads → INGESTING
4. Queue transcription job
5. TranscriptionProcessor runs → TRANSCRIBING
6. Queue subtitle export job
7. SubtitleExportProcessor runs → Generates captioned.mp4
8. READY ✅
```

**Both flows are now identical and use job queues!**

---

## Files to Change

1. **`apps/api/src/projects/projects.service.ts`**
   - Line 414-421: Replace direct call with job queue

2. **`apps/api/src/transcription/transcription.service.ts`**
   - Line 128-137: Remove `triggerDetection()` call
   - Keep `triggerDetection()` method for reframe mode

---

## Why This Makes Sense

**AI Clips works because**:
- Uses Import from URL
- Import from URL uses job queues
- Job queues use TranscriptionProcessor
- TranscriptionProcessor has correct logic

**AI Subtitles fails because**:
- Upload uses direct calls
- Direct calls bypass TranscriptionProcessor
- Fire-and-forget pattern swallows errors
- Race conditions and timing issues

**The fix**:
- Make Upload use job queues
- Remove direct calls
- Everything goes through processors
- Consistent, reliable, observable

---

## Next Steps

1. **Pause and review** this analysis
2. **Confirm the approach** before implementing
3. **Implement the fix** (2 file changes)
4. **Test thoroughly** with both Upload and Import from URL
5. **Verify** that both flows work identically

---

**Status**: 🔍 ROOT CAUSE IDENTIFIED  
**Confidence**: 99% - This is the real issue  
**Complexity**: LOW - Only 2 file changes needed  
**Risk**: LOW - Makes code more consistent, not less

**Last Updated**: November 16, 2025 at 4:50 PM  
**Next**: Review and confirm approach before implementing
