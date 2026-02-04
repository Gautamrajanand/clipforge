# Email Notification Flow - Visual Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLIPFORGE EMAIL NOTIFICATION SYSTEM                   │
│                         ResendService (Resend API)                       │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   User       │
                              │   Uploads    │
                              │   Video      │
                              └──────┬───────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
            ┌───────▼────────┐              ┌────────▼────────┐
            │  AI Clips      │              │  AI Reframe     │
            │  Mode          │              │  Mode           │
            └───────┬────────┘              └────────┬────────┘
                    │                                │
                    │                                │
        ┌───────────▼──────────┐          ┌─────────▼─────────┐
        │  ML Worker           │          │  Reframe          │
        │  (Python FastAPI)    │          │  Processor        │
        │                      │          │  (BullMQ)         │
        │  1. Detect clips     │          │                   │
        │  2. Save to DB       │          │  1. Process video │
        │  3. Status = READY   │          │  2. Status = READY│
        └───────────┬──────────┘          └─────────┬─────────┘
                    │                                │
                    │ HTTP Callback                  │ Direct call
                    │                                │
        ┌───────────▼──────────┐          ┌─────────▼─────────┐
        │  POST /v1/projects/  │          │  ResendService    │
        │  :id/notify-ready    │          │  .sendReframe     │
        │                      │          │  ReadyEmail()     │
        │  (No Auth Required)  │          └─────────┬─────────┘
        └───────────┬──────────┘                    │
                    │                                │
        ┌───────────▼──────────┐                    │
        │  ProjectsService     │                    │
        │  .sendProjectReady   │                    │
        │  Email()             │                    │
        └───────────┬──────────┘                    │
                    │                                │
        ┌───────────▼──────────┐                    │
        │  ResendService       │◄───────────────────┘
        │  .sendClipsReady     │
        │  Email()             │
        └───────────┬──────────┘
                    │
                    │ Resend API
                    │
        ┌───────────▼──────────┐
        │  📧 Email Sent       │
        │                      │
        │  ✨ Your AI Clips    │
        │     Are Ready!       │
        │                      │
        │  🎯 Your Reframed    │
        │     Video Is Ready!  │
        │                      │
        │  📝 Your Subtitles   │
        │     Are Ready!       │
        └──────────────────────┘
```

## Detailed Flow Diagrams

### 1. AI Clips Email Flow

```
┌─────────────┐
│ User Upload │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Video Import    │
│ (BullMQ Job)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Transcription   │
│ (AssemblyAI)    │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────────┐
│ ML Worker: Clip Detection       │
│                                  │
│ 1. Analyze transcript            │
│ 2. Score segments                │
│ 3. Generate AI titles            │
│ 4. Save clips to DB              │
│ 5. Update status = READY         │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ HTTP Callback to API             │
│                                  │
│ POST /v1/projects/:id/notify-   │
│      ready                       │
│                                  │
│ Body: { clipCount: 5 }           │
│                                  │
│ Headers: None (no auth)          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ ProjectsInternalController       │
│                                  │
│ @Post(':id/notify-ready')        │
│ @Public() // No auth guard       │
│                                  │
│ async notifyProjectReady()       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ ProjectsService                  │
│                                  │
│ async sendProjectReadyEmail()    │
│                                  │
│ 1. Fetch project with org        │
│ 2. Get owner membership          │
│ 3. Extract user email            │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ ResendService                    │
│                                  │
│ async sendClipsReadyEmail({      │
│   to: 'user@email.com',          │
│   userName: 'John',              │
│   projectTitle: 'My Video',      │
│   projectId: 'abc123',           │
│   clipCount: 5                   │
│ })                               │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Resend API                       │
│                                  │
│ POST https://api.resend.com/     │
│      emails                      │
│                                  │
│ Authorization: Bearer API_KEY    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ 📧 Email Delivered               │
│                                  │
│ Subject: ✨ Your AI Clips Are    │
│          Ready!                  │
│                                  │
│ Body: Inline HTML template       │
│       - ClipForge branding       │
│       - Project title            │
│       - Clip count               │
│       - View clips button        │
└──────────────────────────────────┘
```

### 2. AI Reframe Email Flow

```
┌─────────────┐
│ User Upload │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Video Import    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Transcription   │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Reframe Processor (BullMQ)       │
│                                  │
│ 1. Load video from storage       │
│ 2. Apply aspect ratio conversion │
│ 3. Smart crop / Pad blur         │
│ 4. Save reframed video           │
│ 5. Update status = READY         │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Email Notification (Same Job)    │
│                                  │
│ try {                            │
│   membership = findOwner()       │
│   if (membership.user.email) {   │
│     resend.sendReframeReadyEmail │
│   }                              │
│ } catch { log warning }          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ ResendService                    │
│                                  │
│ async sendReframeReadyEmail({    │
│   to: 'user@email.com',          │
│   userName: 'John',              │
│   projectTitle: 'My Video',      │
│   projectId: 'abc123',           │
│   aspectRatio: '9:16'            │
│ })                               │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Resend API → 📧 Email Delivered  │
│                                  │
│ Subject: 🎯 Your Reframed Video  │
│          Is Ready!               │
└──────────────────────────────────┘

⚠️  KNOWN ISSUE: Duplicate emails sent
    (To be investigated and fixed)
```

### 3. AI Subtitles Email Flow

```
┌─────────────┐
│ User Upload │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Video Import    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Transcription   │
└──────┬──────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Subtitle Export Processor        │
│                                  │
│ 1. Load video + transcript       │
│ 2. Generate caption frames       │
│ 3. Overlay on video (FFmpeg)     │
│ 4. Save captioned video          │
│ 5. Update status = READY         │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Email Notification (Same Job)    │
│                                  │
│ resend.sendSubtitlesReadyEmail() │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Resend API → 📧 Email Delivered  │
│                                  │
│ Subject: 📝 Your Subtitles Are   │
│          Ready!                  │
└──────────────────────────────────┘
```

## Code Architecture

### ResendService Methods

```typescript
// apps/api/src/email/resend.service.ts

class ResendService {
  
  async sendClipsReadyEmail(params: {
    to: string;
    userName: string;
    projectTitle: string;
    projectId: string;
    clipCount: number;
  }): Promise<void> {
    const html = this.createClipsReadyTemplate(params);
    await this.resend.emails.send({
      from: 'ClipForge <notifications@clipforge.ai>',
      to: params.to,
      subject: '✨ Your AI Clips Are Ready!',
      html,
    });
  }

  async sendReframeReadyEmail(params: {
    to: string;
    userName: string;
    projectTitle: string;
    projectId: string;
    aspectRatio: string;
  }): Promise<void> {
    const html = this.createReframeReadyTemplate(params);
    await this.resend.emails.send({
      from: 'ClipForge <notifications@clipforge.ai>',
      to: params.to,
      subject: '🎯 Your Reframed Video Is Ready!',
      html,
    });
  }

  async sendSubtitlesReadyEmail(params: {
    to: string;
    userName: string;
    projectTitle: string;
    projectId: string;
  }): Promise<void> {
    const html = this.createSubtitlesReadyTemplate(params);
    await this.resend.emails.send({
      from: 'ClipForge <notifications@clipforge.ai>',
      to: params.to,
      subject: '📝 Your Subtitles Are Ready!',
      html,
    });
  }
}
```

### Internal API Controller

```typescript
// apps/api/src/projects/projects.controller.ts

@Controller('v1/projects/internal')
export class ProjectsInternalController {
  
  @Post(':id/notify-ready')
  @Public() // No authentication required
  async notifyProjectReady(
    @Param('id') projectId: string,
    @Body() body: { clipCount?: number },
  ) {
    return this.projectsService.sendProjectReadyEmail(
      projectId,
      body.clipCount,
    );
  }
}
```

### ML Worker Callback

```python
# workers/routers/ranker.py

async def ranker_worker(data: dict):
    # ... clip detection logic ...
    
    # Save clips to database
    await save_clips_to_db(clips)
    
    # Update project status
    await update_project_status(project_id, 'READY')
    
    # Notify API (non-blocking)
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                f'http://clipforge-api:3001/v1/projects/{project_id}/notify-ready',
                json={'clipCount': len(clips)},
                timeout=5.0
            )
    except Exception as e:
        logger.warning(f'Failed to notify API: {e}')
        # Don't fail the job if notification fails
```

## Email Templates

All templates use inline HTML with ClipForge branding:

- **Colors:** Purple gradient (#8B5CF6 → #6366F1)
- **Font:** System fonts (sans-serif)
- **CTA Button:** Purple with hover effect
- **Layout:** Centered, responsive, mobile-friendly
- **Logo:** ClipForge text logo (no image dependencies)

## Configuration

```bash
# .env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# No SMTP configuration needed!
```

## Testing

```bash
# Monitor email logs
docker logs -f clipforge-api | grep -E "(Sent.*email|📧)"

# Expected output:
# 📧 Sent clips ready email to user@email.com
# 📧 Sent reframe ready email to user@email.com
# 📧 Sent subtitles ready email to user@email.com
```

## Known Issues

### AI Reframe Duplicate Emails

**Issue:** Multiple "Reframe Ready" emails sent for same project  
**Priority:** Low (emails work, just duplicates)  
**Investigation needed:**
- Check if reframe processor runs multiple times
- Check if email sending is called in multiple places
- Add deduplication logic if needed

**Temporary workaround:** None needed (emails still work)

---

**Status:** ✅ Email notifications fully functional  
**Last Updated:** December 16, 2025
