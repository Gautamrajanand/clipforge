# Email Notifications Implementation

## Overview
Implemented email notifications that are sent when a project's status transitions to `READY`. This ensures users are notified when their video processing is complete, even if they've closed the browser or navigated away.

## Implementation Date
December 15, 2025

## Changes Made

### 1. Queue Processors Updated

#### `transcription.processor.ts`
- Added `EmailService` injection
- Sends `sendReframeReadyEmail()` when reframe-only mode projects reach READY status
- Uses Membership relation to get user email (OWNER role)
- Graceful error handling (logs warning but doesn't fail the job)

#### `reframe.processor.ts`
- Added `EmailService` injection
- Sends `sendReframeReadyEmail()` when reframe job completes
- Includes aspect ratio in email
- Graceful error handling

#### `subtitle-export.processor.ts`
- Added `EmailService` injection
- Sends `sendSubtitlesReadyEmail()` when subtitle export completes
- Graceful error handling

### 2. ProjectsService Updated

#### `projects.service.ts`
- Uncommented `EmailService` import and injection
- Added email notification in `callMLWorkerDetection()` method
- Sends `sendClipsReadyEmail()` when AI Clips detection completes
- Includes clip count in email
- Uses Membership relation to get user email (OWNER role)
- Graceful error handling

### 3. Module Updates

#### `queues.module.ts`
- Added `EmailModule` import
- Added `EmailModule` to imports array

#### `projects.module.ts`
- Uncommented `EmailModule` import
- Added `EmailModule` to imports array

## Email Types Sent

### 1. Clips Ready Email
**Trigger:** AI Clips detection completes (normal flow)
**Method:** `sendClipsReadyEmail(email, name, projectTitle, projectId, clipCount)`
**Template:** Celebration icon 🎉, clip count, project link

### 2. Reframe Ready Email
**Trigger:** Reframe job completes OR reframe-only mode after transcription
**Method:** `sendReframeReadyEmail(email, name, projectTitle, projectId, aspectRatio)`
**Template:** Reframe icon 📐, aspect ratio, project link

### 3. Subtitles Ready Email
**Trigger:** Subtitle export completes
**Method:** `sendSubtitlesReadyEmail(email, name, projectTitle, projectId)`
**Template:** Sparkles icon ✨, project link

## User Lookup Logic

All email notifications use the same pattern to find the user:

```typescript
const membership = await this.prisma.membership.findFirst({
  where: { orgId: project.orgId, role: 'OWNER' },
  include: { user: true },
});

if (membership?.user?.email) {
  await this.email.sendXXXEmail(
    membership.user.email,
    membership.user.name || 'there',
    project.title,
    projectId,
    // ... additional params
  );
}
```

This ensures:
- Only the organization owner receives emails
- Graceful handling if no owner is found
- Fallback to "there" if user has no name

## Error Handling

All email sending is wrapped in try-catch blocks:
- Errors are logged with `logger.warn()` or `logger.error()`
- Email failures do NOT fail the main job/operation
- Users still get their processed content even if email fails

## SMTP Configuration

Email sending requires SMTP credentials in environment variables:
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - From email address (default: noreply@clipforge.ai)
- `APP_URL` - Application URL for project links (default: http://localhost:3001)

If SMTP is not configured, emails are skipped with a warning log.

## Testing

To test email notifications:

1. **Configure SMTP** in `.env`:
   ```
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-password
   SMTP_FROM=ClipForge <noreply@clipforge.ai>
   APP_URL=http://localhost:3001
   ```

2. **Start a project** (upload or URL import)

3. **Close the browser** or navigate away

4. **Wait for processing** to complete

5. **Check email** for notification with project link

6. **Click link** to verify it goes to the correct project

## Benefits

1. **User Retention:** Users are notified when processing completes, even if they've left
2. **Better UX:** No need to keep the tab open or keep checking
3. **Re-engagement:** Email brings users back to the app
4. **Professional:** Industry-standard behavior (Opus Clip, Descript, etc. all do this)

## Related Files

- `/apps/api/src/email/email.service.ts` - Email service with all templates
- `/apps/api/src/queues/processors/transcription.processor.ts` - Transcription processor
- `/apps/api/src/queues/processors/reframe.processor.ts` - Reframe processor
- `/apps/api/src/queues/processors/subtitle-export.processor.ts` - Subtitle export processor
- `/apps/api/src/projects/projects.service.ts` - Projects service (AI Clips flow)
- `/apps/api/src/queues/queues.module.ts` - Queues module
- `/apps/api/src/projects/projects.module.ts` - Projects module

## Next Steps

1. **Test with real SMTP** credentials
2. **Verify email delivery** for all three flows (clips, reframe, subtitles)
3. **Monitor email logs** for any failures
4. **Consider adding** email preferences (allow users to opt out)
5. **Track email metrics** (open rate, click rate) for optimization
