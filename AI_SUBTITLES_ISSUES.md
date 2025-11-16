# AI Subtitles Issues - Nov 16, 2025

## Summary

**Backend is working correctly.** Issues are in the **frontend**:

1. ✅ **Backend**: Subtitle export completes successfully
2. ✅ **Backend**: Captioned video uploaded to storage
3. ✅ **Backend**: Preview streams original source video (no captions)
4. ❌ **Frontend**: Not detecting completed subtitle export
5. ❌ **Frontend**: Showing captions in preview for Import from URL

---

## Issue 1: Export Button Shows Error (Upload Method)

### What's Happening:
- User uploads video
- Clicks "Generate Subtitles"
- Subtitle export completes successfully (backend logs confirm)
- User clicks "Export with Captions"
- Frontend shows: "Failed to export video with captions. Please try again."

### Root Cause:
**Frontend is not detecting that subtitle export is complete.**

### Backend Evidence:
```
[Nest] 31  - 11/16/2025, 7:23:02 AM     LOG [TranscriptionService] ✅ Uploaded captioned video: projects/cmi1dqrmx0017yplyyq78kh72/captioned.mp4
[Nest] 31  - 11/16/2025, 7:23:02 AM     LOG [SubtitleExportProcessor] ✅ Subtitle export complete for project cmi1dqrmx0017yplyyq78kh72
```

### Database Evidence:
```
Project Status: READY
Source URL: projects/cmi1dqrmx0017yplyyq78kh72/source.mp4
Clip Settings: {
  "subtitlesMode": true,
  "captionStyle": "highlight",
  ...
}
```

### Fix Required:
**Frontend needs to:**
1. Poll for subtitle export completion
2. Check project status = READY
3. Enable "Export with Captions" button
4. Call `/v1/projects/:id/download-captioned` endpoint

---

## Issue 2: Preview Shows Captions (Import from URL Method)

### What's Happening:
- User imports video from URL
- During transcription, preview shows captions burned in
- This is WRONG - preview should show original video
- Captions should only appear in final export

### Root Cause:
**Frontend is displaying the wrong video source during Import from URL flow.**

### Expected Behavior:
```
Preview Video Source: /v1/projects/:id/stream (original video, no captions)
Export Video Source: /v1/projects/:id/download-captioned (with captions)
```

### Current Behavior (Import from URL):
```
Preview Video Source: ??? (showing captions - WRONG)
```

### Backend Evidence:
```
[Nest] 31  - 11/16/2025, 7:23:04 AM     LOG [ProjectsService] Streaming video: projects/cmi1dqrmx0017yplyyq78kh72/source.mp4 (reframe: false)
```

Backend is correctly streaming `source.mp4` (no captions), but frontend is showing captions.

### Fix Required:
**Frontend needs to:**
1. Always use `/v1/projects/:id/stream` for preview
2. Never show captioned video in preview
3. Only show captions after user clicks "Export with Captions"

---

## Issue 3: Import from URL Taking Too Long

### What's Happening:
- Import from URL takes much longer than Upload
- User reports it's "taking forever"

### Root Cause:
**Need to investigate if frontend is triggering subtitle generation during import.**

### Expected Flow:
```
1. Import from URL → Download video → Upload to storage
2. User clicks "Generate Subtitles" → Transcription → Subtitle Export
3. User clicks "Export with Captions" → Download captioned video
```

### Current Flow (suspected):
```
1. Import from URL → Download video → Upload to storage → AUTO-GENERATE CAPTIONS???
2. User clicks "Generate Subtitles" → Already has captions???
3. User clicks "Export with Captions" → Error (trying to caption already-captioned video)
```

### Fix Required:
**Frontend needs to:**
1. NOT auto-trigger subtitle generation during import
2. Wait for user to explicitly click "Generate Subtitles"
3. Match the Upload flow exactly

---

## Correct Flow (Both Upload and Import from URL)

### Step 1: Import/Upload
```
User Action: Upload file OR Import from URL
Backend: Download → Upload to storage → Status = PENDING
Frontend: Show preview of source.mp4 (no captions)
```

### Step 2: Generate Subtitles
```
User Action: Click "Generate Subtitles" button
Backend: Queue transcription → Queue subtitle export → Status = TRANSCRIBING
Frontend: Show "AI Subtitles Processing" modal with progress
```

### Step 3: Processing (Background)
```
Backend: 
  - Transcription (2-5 min)
  - Subtitle Export (10-15 min)
  - Status = READY
Frontend: Poll for status, update progress bar
```

### Step 4: Export
```
User Action: Click "Export with Captions" button
Backend: Stream captioned.mp4 (pre-generated)
Frontend: Download starts immediately
```

---

## Frontend Code to Fix

### 1. Fix Export Button State

**File**: `apps/web/app/project/[id]/page.tsx` (or similar)

**Current** (suspected):
```typescript
const handleExport = async () => {
  // Trying to generate captions on-the-fly
  const response = await fetch(`/v1/projects/${id}/download-captioned`);
  // Error: captioned.mp4 doesn't exist yet
};
```

**Should Be**:
```typescript
const [isSubtitleReady, setIsSubtitleReady] = useState(false);

// Poll for subtitle completion
useEffect(() => {
  if (project.status === 'TRANSCRIBING') {
    const interval = setInterval(async () => {
      const response = await fetch(`/v1/projects/${id}`);
      const data = await response.json();
      if (data.status === 'READY') {
        setIsSubtitleReady(true);
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }
}, [project.status]);

const handleExport = async () => {
  if (!isSubtitleReady) {
    alert('Subtitles are still processing. Please wait.');
    return;
  }
  // Download pre-generated captioned video
  window.location.href = `/v1/projects/${id}/download-captioned`;
};
```

### 2. Fix Preview Video Source

**File**: `apps/web/components/VideoPlayer.tsx` (or similar)

**Current** (suspected):
```typescript
// For Import from URL, showing captioned video
const videoSrc = importMethod === 'url' 
  ? `/v1/projects/${id}/download-captioned`  // WRONG
  : `/v1/projects/${id}/stream`;
```

**Should Be**:
```typescript
// ALWAYS show original source video in preview
const videoSrc = `/v1/projects/${id}/stream`;
```

### 3. Fix Import from URL Flow

**File**: `apps/web/app/import/page.tsx` (or similar)

**Current** (suspected):
```typescript
const handleImportFromUrl = async (url: string) => {
  const response = await fetch('/v1/projects/import', {
    method: 'POST',
    body: JSON.stringify({ url, autoGenerateSubtitles: true }), // WRONG
  });
};
```

**Should Be**:
```typescript
const handleImportFromUrl = async (url: string) => {
  const response = await fetch('/v1/projects/import', {
    method: 'POST',
    body: JSON.stringify({ url }), // No auto-generation
  });
  // User must explicitly click "Generate Subtitles" later
};
```

---

## Testing Checklist

### Upload Method
- [ ] Upload video
- [ ] Preview shows original video (no captions)
- [ ] Click "Generate Subtitles"
- [ ] Modal shows "AI Subtitles Processing"
- [ ] Wait 10-15 minutes
- [ ] Status changes to READY
- [ ] "Export with Captions" button enabled
- [ ] Click "Export with Captions"
- [ ] Download starts immediately
- [ ] Downloaded video has captions

### Import from URL Method
- [ ] Import from URL
- [ ] Preview shows original video (no captions) ← **CRITICAL**
- [ ] Click "Generate Subtitles"
- [ ] Modal shows "AI Subtitles Processing"
- [ ] Wait 10-15 minutes
- [ ] Status changes to READY
- [ ] "Export with Captions" button enabled
- [ ] Click "Export with Captions"
- [ ] Download starts immediately
- [ ] Downloaded video has captions

---

## API Endpoints Reference

### Preview (Original Video)
```
GET /v1/projects/:id/stream
Returns: source.mp4 (no captions)
Use: Video player preview
```

### Export (Captioned Video)
```
GET /v1/projects/:id/download-captioned
Returns: captioned.mp4 (with captions)
Use: Download button
Requires: Project status = READY
```

### Generate Subtitles
```
POST /v1/projects/:id/generate-subtitles
Body: { captionStyle, primaryColor, fontSize, position }
Returns: { success: true, message: 'Subtitle generation started' }
Effect: Queues background job, status = TRANSCRIBING
```

### Check Status
```
GET /v1/projects/:id
Returns: { id, status, sourceUrl, clipSettings, ... }
Use: Poll for completion (status = READY)
```

---

## Summary

**Backend**: ✅ Working correctly  
**Frontend**: ❌ Needs fixes

**3 Frontend Fixes Required:**
1. Poll for subtitle completion before enabling export
2. Always show source.mp4 in preview (never captioned.mp4)
3. Don't auto-trigger subtitle generation during import

**Estimated Fix Time**: 30 minutes  
**Impact**: Critical - blocks AI Subtitles feature

---

**Next Steps:**
1. Locate frontend files (VideoPlayer, ProjectPage, ImportPage)
2. Apply fixes above
3. Test both Upload and Import from URL flows
4. Verify preview never shows captions
5. Verify export works after processing completes
