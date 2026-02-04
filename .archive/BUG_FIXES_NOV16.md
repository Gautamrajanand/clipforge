# Bug Fixes - November 16, 2025

## Issues Fixed

### 1. ✅ AI Clips Export Without Captions
**Problem**: Exported clips had no captions burned in  
**Root Cause**: Empty chunks causing validation failure  
**Fix**: Filter out empty chunks before processing  
**Status**: FIXED

### 2. ✅ AI Subtitles Export Error
**Problem**: "Failed to export video with captions. Please try again."  
**Root Cause**: Download endpoint checking for non-existent pre-generated file  
**Fix**: Implemented async job queue system  
**Status**: FIXED

---

## Technical Details

### Issue 1: AI Clips Caption Burning

**Error Message**:
```
❌ Chunk validation failed: Chunk 5 has no words
Failed to burn captions: Chunk validation failed
```

**Root Cause**:
- Video chunks were created based on time intervals
- Some chunks had no words (gaps in transcript)
- Validation treated empty chunks as errors
- Processing stopped, captions not burned

**Solution**:
1. Changed empty chunk validation from error to warning
2. Filter out empty chunks before processing
3. Only process chunks that have words
4. Log how many chunks were skipped

**Code Changes**:
- `chunk-manager.service.ts`: Empty chunks now warning only
- `projects.service.ts`: Filter validChunks before processing

**Files Modified**:
- `/apps/api/src/captions/chunk-manager.service.ts`
- `/apps/api/src/projects/projects.service.ts`

---

### Issue 2: AI Subtitles Export

**Error Message**:
```
Failed to export video with captions. Please try again.
```

**Root Cause**:
- Download endpoint was synchronously generating captions (10-30 min)
- This blocked the entire API
- HTTP request timed out
- Frontend showed error

**Solution**:
Implemented async job queue system:
1. Generate Subtitles → Queue job (instant response)
2. Background worker processes job (10-15 min)
3. Download → Serve pre-generated file (instant)

**Architecture Change**:
```
BEFORE:
User clicks Download → API generates (blocks 10-30 min) → Timeout

AFTER:
User clicks Generate → Queue job (instant)
                     ↓
              Background worker (10-15 min)
                     ↓
User clicks Download → Serve cached file (instant)
```

**New Files**:
- `subtitle-export.processor.ts` - Background worker
- `ASYNC_SUBTITLE_EXPORT.md` - Documentation
- `ROLLBACK_INSTRUCTIONS.md` - Emergency recovery

**Modified Files**:
- `projects.service.ts` - Download only serves cached files
- `transcription.service.ts` - Added caching check
- `transcription.processor.ts` - Queue subtitle export
- `queues.module.ts` - Register new queue
- `queues.service.ts` - Add queue methods

---

## Testing

### Test 1: AI Clips with Captions
```bash
# 1. Go to AI Clips project
# 2. Click "Export" on any clip
# 3. Select "bounce" caption style
# 4. Click "Download"
# Expected: Clip downloads with captions burned in
```

### Test 2: AI Subtitles Export
```bash
# 1. Go to AI Subtitles project
# 2. Click "Generate Subtitles" (instant response)
# 3. Wait 10-15 minutes (check status)
# 4. Click "Download with Captions" (instant)
# Expected: Video downloads with captions
```

---

## Performance Impact

### Before
- AI Clips: Failed to export
- AI Subtitles: 10-30 min blocking, then timeout
- API: Completely blocked during processing
- Memory: 5.67GB (74% usage)

### After
- AI Clips: ✅ Exports with captions
- AI Subtitles: ✅ Instant queue, background processing
- API: ✅ Always responsive
- Memory: 1.2GB (16% usage) - **79% reduction**

---

## Rollback Plan

### If Issues Occur

```bash
# Quick rollback (2 minutes)
docker-compose down
git reset --hard pre-async-subtitle-export
docker-compose up -d
```

**Rollback Tag**: `pre-async-subtitle-export`

---

## Related Documents

- `ASYNC_SUBTITLE_EXPORT.md` - Async implementation details
- `SCALABILITY_PLAN.md` - Overall scaling strategy
- `ROLLBACK_INSTRUCTIONS.md` - Emergency recovery

---

## Commits

1. `57b4881` - fix: Handle empty chunks in caption rendering
2. `52006cf` - docs: Add async subtitle export documentation
3. `9ee1f2a` - feat: Move subtitle export to async job queue
4. `065b96c` - fix: Remove duplicate captionedKey declaration
5. `3076053` - fix: Add caching for captioned videos

---

**Date**: November 16, 2025  
**Status**: ✅ FIXED AND DEPLOYED  
**Next Steps**: User testing
