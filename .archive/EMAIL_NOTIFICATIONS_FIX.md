# Email Notifications Fix - Complete Implementation

## Problem
Email notifications were not being sent when AI Clips projects reached READY status because:
- The Python ML workers update project status directly in the database
- The NestJS API email code was never being called for AI Clips
- Only Reframe and Subtitles emails were working (processed by NestJS)

## Solution
Implemented a callback system where ML workers notify the API to send emails:

### 1. Python ML Worker Changes (`workers/routers/ranker.py`)
- Added HTTP callback to API after clips are detected
- Calls `POST /v1/projects/:id/notify-ready` with clip count
- Non-blocking (errors don't fail clip detection)

### 2. NestJS API Changes

#### New Public Endpoint (`projects.controller.ts`)
- Created `ProjectsInternalController` (no auth required)
- Endpoint: `POST /v1/projects/:id/notify-ready`
- Receives notifications from ML workers

#### New Service Method (`projects.service.ts`)
- `sendProjectReadyEmail(projectId, clipCount)`
- Fetches project and owner email
- Sends `sendClipsReadyEmail` notification
- Robust error handling

#### Module Registration (`projects.module.ts`)
- Registered `ProjectsInternalController`
- Made endpoint accessible without authentication

## Email Flow

### AI Clips
1. ML worker detects clips
2. Saves to database → status = READY
3. Calls API: `POST /v1/projects/:id/notify-ready`
4. API sends email to project owner

### Reframe
1. Reframe processor completes
2. Updates status to READY
3. Sends email directly (existing code)

### Subtitles
1. Subtitle export completes
2. Updates status to READY
3. Sends email directly (existing code)

## Testing
After restart, create a new AI Clips project and verify:
1. Project processes successfully
2. Clips are detected
3. Email is sent when status reaches READY
4. Check logs for: `📧 Notified API to send clips ready email`

## Files Modified
- `workers/routers/ranker.py` - Added API callback
- `apps/api/src/projects/projects.controller.ts` - Added internal controller
- `apps/api/src/projects/projects.service.ts` - Added email method
- `apps/api/src/projects/projects.module.ts` - Registered controller

## No Destabilization Risk
- Backend-only changes
- ML worker callback is non-blocking (errors logged, not thrown)
- API endpoint has error handling
- No frontend changes
- Existing Reframe/Subtitles emails unchanged
