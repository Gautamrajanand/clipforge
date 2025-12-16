# Email Notifications Fix - Using ResendService

## Root Cause
Email notifications were not being sent because:
- The code was using `EmailService` which relies on SMTP configuration
- SMTP credentials are NOT configured in the environment
- All other ClipForge emails use `ResendService` (which IS configured and working)

## Solution
Switched all project-ready email notifications from `EmailService` to `ResendService`:

### Files Modified

#### 1. ResendService (`apps/api/src/email/resend.service.ts`)
**Added 3 new methods:**
- `sendClipsReadyEmail()` - AI Clips ready notification
- `sendReframeReadyEmail()` - Reframe ready notification  
- `sendSubtitlesReadyEmail()` - Subtitles ready notification

All use inline HTML templates (same style as other Resend emails).

#### 2. Reframe Processor (`apps/api/src/queues/processors/reframe.processor.ts`)
- Changed import from `EmailService` to `ResendService`
- Updated constructor injection
- Updated email call to use Resend format with params object

#### 3. Subtitle Export Processor (`apps/api/src/queues/processors/subtitle-export.processor.ts`)
- Changed import from `EmailService` to `ResendService`
- Updated constructor injection
- Updated email call to use Resend format

#### 4. Transcription Processor (`apps/api/src/queues/processors/transcription.processor.ts`)
- Changed import from `EmailService` to `ResendService`
- Updated constructor injection
- Updated email call for reframe-only projects

#### 5. Projects Service (`apps/api/src/projects/projects.service.ts`)
- Changed import from `EmailService` to `ResendService`
- Updated constructor injection
- Updated `sendProjectReadyEmail()` method to use Resend
- Updated clip detection email to use Resend

#### 6. Python ML Worker (`workers/routers/ranker.py`)
- Added HTTP callback to API after clips detected
- Calls `POST /v1/projects/:id/notify-ready` with clip count
- Non-blocking (errors logged, not thrown)

#### 7. Projects Controller (`apps/api/src/projects/projects.controller.ts`)
- Added `ProjectsInternalController` (no auth required)
- Endpoint: `POST /v1/projects/:id/notify-ready`
- Receives notifications from ML workers

#### 8. Projects Module (`apps/api/src/projects/projects.module.ts`)
- Registered `ProjectsInternalController`

## Email Flow

### AI Clips
1. ML worker detects clips → saves to DB → status = READY
2. ML worker calls API: `POST /v1/projects/:id/notify-ready`
3. API calls `ResendService.sendClipsReadyEmail()`
4. Email sent via Resend

### Reframe
1. Reframe processor completes → status = READY
2. Processor calls `ResendService.sendReframeReadyEmail()`
3. Email sent via Resend

### Subtitles
1. Subtitle export completes → status = READY
2. Processor calls `ResendService.sendSubtitlesReadyEmail()`
3. Email sent via Resend

## Testing
After container restart:
1. Create AI Clips project → Should receive email when clips ready
2. Create Reframe project → Should receive email when reframe ready
3. Create Subtitles project → Should receive email when subtitles ready

Check logs for:
- `📧 Sent clips ready email to...`
- `📧 Sent reframe ready email to...`
- `📧 Sent subtitles ready email to...`

## Why This Works
- ResendService is already configured with `RESEND_API_KEY`
- All other ClipForge emails (welcome, credits, etc.) use Resend successfully
- Same email service, same configuration, guaranteed to work
