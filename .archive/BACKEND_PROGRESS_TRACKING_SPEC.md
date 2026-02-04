# Backend Progress Tracking Specification

## Overview
Implement backend tracking for onboarding checklist progress to enable real-time UI updates when users complete features.

**Priority:** P0 - Critical for PLG flow  
**Estimated Effort:** 2-3 days  
**Dependencies:** None

---

## Database Schema Changes

### 1. Update `user_onboarding` Table

```sql
-- Add feature tracking columns
ALTER TABLE user_onboarding 
ADD COLUMN IF NOT EXISTS has_created_clip BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_added_subtitles BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_reframed_video BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_shared BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS first_clip_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS first_subtitle_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS first_reframe_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS first_share_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS export_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_export_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_has_created_clip ON user_onboarding(has_created_clip);
```

### 2. Migration Script

```typescript
// migrations/YYYYMMDD_add_onboarding_progress.ts
export async function up(prisma: PrismaClient) {
  await prisma.$executeRaw`
    ALTER TABLE user_onboarding 
    ADD COLUMN IF NOT EXISTS has_created_clip BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_added_subtitles BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_reframed_video BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS has_shared BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS first_clip_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS first_subtitle_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS first_reframe_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS first_share_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS export_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_export_at TIMESTAMP;
  `;
  
  console.log('✅ Onboarding progress columns added');
}

export async function down(prisma: PrismaClient) {
  await prisma.$executeRaw`
    ALTER TABLE user_onboarding 
    DROP COLUMN IF EXISTS has_created_clip,
    DROP COLUMN IF EXISTS has_added_subtitles,
    DROP COLUMN IF EXISTS has_reframed_video,
    DROP COLUMN IF EXISTS has_shared,
    DROP COLUMN IF EXISTS first_clip_at,
    DROP COLUMN IF EXISTS first_subtitle_at,
    DROP COLUMN IF EXISTS first_reframe_at,
    DROP COLUMN IF EXISTS first_share_at,
    DROP COLUMN IF EXISTS export_count,
    DROP COLUMN IF EXISTS last_export_at;
  `;
}
```

---

## API Endpoints

### 1. GET `/v1/onboarding/progress`

**Purpose:** Fetch current user's onboarding progress  
**Auth:** Required (JWT)  
**Rate Limit:** 100 req/min

**Response:**
```typescript
{
  "userId": "user_xxx",
  "hasCreatedClip": boolean,
  "hasAddedSubtitles": boolean,
  "hasReframedVideo": boolean,
  "hasShared": boolean,
  "firstClipAt": "2025-12-05T10:30:00Z" | null,
  "firstSubtitleAt": "2025-12-05T11:00:00Z" | null,
  "firstReframeAt": "2025-12-05T11:30:00Z" | null,
  "firstShareAt": "2025-12-05T12:00:00Z" | null,
  "exportCount": number,
  "lastExportAt": "2025-12-05T12:30:00Z" | null,
  "completionPercentage": number // 0-100
}
```

**Implementation:**
```typescript
// src/onboarding/onboarding.controller.ts
@Get('progress')
@UseGuards(JwtAuthGuard)
async getProgress(@Request() req) {
  const userId = req.user.id;
  const progress = await this.onboardingService.getProgress(userId);
  return progress;
}

// src/onboarding/onboarding.service.ts
async getProgress(userId: string) {
  const onboarding = await this.prisma.userOnboarding.findUnique({
    where: { userId },
    select: {
      hasCreatedClip: true,
      hasAddedSubtitles: true,
      hasReframedVideo: true,
      hasShared: true,
      firstClipAt: true,
      firstSubtitleAt: true,
      firstReframeAt: true,
      firstShareAt: true,
      exportCount: true,
      lastExportAt: true,
    },
  });

  if (!onboarding) {
    // Create default onboarding record
    return this.createDefaultOnboarding(userId);
  }

  // Calculate completion percentage
  const completed = [
    onboarding.hasCreatedClip,
    onboarding.hasAddedSubtitles,
    onboarding.hasReframedVideo,
    onboarding.hasShared,
  ].filter(Boolean).length;
  
  const completionPercentage = Math.round((completed / 4) * 100);

  return {
    userId,
    ...onboarding,
    completionPercentage,
  };
}
```

---

### 2. POST `/v1/onboarding/progress/update`

**Purpose:** Update progress when user completes a feature  
**Auth:** Required (JWT)  
**Rate Limit:** 50 req/min

**Request Body:**
```typescript
{
  "action": "created_clip" | "added_subtitles" | "reframed_video" | "shared_content",
  "projectId": string,
  "metadata"?: {
    clipCount?: number,
    language?: string,
    aspectRatio?: string,
    platform?: string
  }
}
```

**Response:**
```typescript
{
  "success": true,
  "progress": {
    "hasCreatedClip": true,
    "hasAddedSubtitles": false,
    "hasReframedVideo": false,
    "hasShared": false,
    "completionPercentage": 25
  },
  "isFirstTime": boolean // true if this was the first time completing this action
}
```

**Implementation:**
```typescript
// src/onboarding/onboarding.controller.ts
@Post('progress/update')
@UseGuards(JwtAuthGuard)
async updateProgress(
  @Request() req,
  @Body() body: UpdateProgressDto
) {
  const userId = req.user.id;
  const result = await this.onboardingService.updateProgress(
    userId,
    body.action,
    body.projectId,
    body.metadata
  );
  return result;
}

// src/onboarding/onboarding.service.ts
async updateProgress(
  userId: string,
  action: string,
  projectId: string,
  metadata?: any
) {
  const onboarding = await this.prisma.userOnboarding.findUnique({
    where: { userId },
  });

  if (!onboarding) {
    await this.createDefaultOnboarding(userId);
  }

  let updateData: any = {};
  let isFirstTime = false;

  switch (action) {
    case 'created_clip':
      if (!onboarding?.hasCreatedClip) {
        updateData = {
          hasCreatedClip: true,
          firstClipAt: new Date(),
        };
        isFirstTime = true;
      }
      break;

    case 'added_subtitles':
      if (!onboarding?.hasAddedSubtitles) {
        updateData = {
          hasAddedSubtitles: true,
          firstSubtitleAt: new Date(),
        };
        isFirstTime = true;
      }
      break;

    case 'reframed_video':
      if (!onboarding?.hasReframedVideo) {
        updateData = {
          hasReframedVideo: true,
          firstReframeAt: new Date(),
        };
        isFirstTime = true;
      }
      break;

    case 'shared_content':
      if (!onboarding?.hasShared) {
        updateData = {
          hasShared: true,
          firstShareAt: new Date(),
        };
        isFirstTime = true;
      }
      // Always increment export count
      updateData.exportCount = { increment: 1 };
      updateData.lastExportAt = new Date();
      break;
  }

  const updated = await this.prisma.userOnboarding.update({
    where: { userId },
    data: updateData,
  });

  // Track analytics event
  if (isFirstTime) {
    await this.analyticsService.track(userId, `first_${action}`, {
      projectId,
      ...metadata,
    });
  }

  const progress = await this.getProgress(userId);

  return {
    success: true,
    progress,
    isFirstTime,
  };
}
```

---

## Integration Points

### 1. AI Clips Detection
**File:** `src/projects/projects.service.ts`  
**Method:** `detectClips()`

```typescript
async detectClips(projectId: string, userId: string, settings: any) {
  // ... existing clip detection logic ...
  
  const clips = await this.mlService.detectClips(videoPath, settings);
  
  // Save clips to database
  await this.saveClips(projectId, clips);
  
  // ✅ Update onboarding progress
  if (clips.length > 0) {
    await this.onboardingService.updateProgress(
      userId,
      'created_clip',
      projectId,
      { clipCount: clips.length }
    );
  }
  
  return clips;
}
```

### 2. AI Subtitles Generation
**File:** `src/subtitles/subtitles.service.ts`  
**Method:** `generateSubtitles()`

```typescript
async generateSubtitles(projectId: string, userId: string, language: string) {
  // ... existing subtitle generation logic ...
  
  const subtitles = await this.mlService.generateSubtitles(videoPath, language);
  
  // Save subtitles
  await this.saveSubtitles(projectId, subtitles);
  
  // ✅ Update onboarding progress
  await this.onboardingService.updateProgress(
    userId,
    'added_subtitles',
    projectId,
    { language }
  );
  
  return subtitles;
}
```

### 3. AI Reframe
**File:** `src/reframe/reframe.service.ts`  
**Method:** `reframeVideo()`

```typescript
async reframeVideo(projectId: string, userId: string, aspectRatio: string) {
  // ... existing reframe logic ...
  
  const reframedVideo = await this.mlService.reframe(videoPath, aspectRatio);
  
  // Save reframed video
  await this.saveReframedVideo(projectId, reframedVideo);
  
  // ✅ Update onboarding progress
  await this.onboardingService.updateProgress(
    userId,
    'reframed_video',
    projectId,
    { aspectRatio }
  );
  
  return reframedVideo;
}
```

### 4. Export/Share
**File:** `src/exports/exports.service.ts`  
**Method:** `exportClip()`

```typescript
async exportClip(clipId: string, userId: string, options: ExportOptions) {
  // ... existing export logic ...
  
  const exportedFile = await this.processExport(clipId, options);
  
  // Save export record
  const exportRecord = await this.saveExport(clipId, exportedFile);
  
  // ✅ Update onboarding progress
  await this.onboardingService.updateProgress(
    userId,
    'shared_content',
    exportRecord.projectId,
    { 
      platform: options.platform,
      format: options.format 
    }
  );
  
  return exportRecord;
}
```

---

## Frontend Integration

### Update Checklist Component

```typescript
// components/onboarding/OnboardingChecklist.tsx

const fetchProgress = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/v1/onboarding/progress`, {
      getToken: getClerkToken,
    });
    if (response.ok) {
      const data = await response.json();
      setProgress(data);
    }
  } catch (error) {
    console.error('Failed to fetch onboarding progress:', error);
  }
};

// Refresh progress every 30 seconds
useEffect(() => {
  fetchProgress();
  const interval = setInterval(fetchProgress, 30000);
  return () => clearInterval(interval);
}, []);

// Also refresh after user navigates back to dashboard
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchProgress();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

---

## Testing

### Unit Tests

```typescript
// src/onboarding/onboarding.service.spec.ts
describe('OnboardingService', () => {
  describe('updateProgress', () => {
    it('should mark clip as created on first clip', async () => {
      const result = await service.updateProgress(
        'user_123',
        'created_clip',
        'project_456'
      );
      
      expect(result.isFirstTime).toBe(true);
      expect(result.progress.hasCreatedClip).toBe(true);
      expect(result.progress.firstClipAt).toBeDefined();
    });

    it('should not update firstClipAt on subsequent clips', async () => {
      // Create first clip
      await service.updateProgress('user_123', 'created_clip', 'project_1');
      
      const firstTime = await service.getProgress('user_123');
      
      // Create second clip
      await service.updateProgress('user_123', 'created_clip', 'project_2');
      
      const secondTime = await service.getProgress('user_123');
      
      expect(firstTime.firstClipAt).toEqual(secondTime.firstClipAt);
    });

    it('should calculate completion percentage correctly', async () => {
      await service.updateProgress('user_123', 'created_clip', 'project_1');
      await service.updateProgress('user_123', 'added_subtitles', 'project_1');
      
      const progress = await service.getProgress('user_123');
      
      expect(progress.completionPercentage).toBe(50); // 2 out of 4
    });
  });
});
```

### Integration Tests

```typescript
// test/onboarding.e2e-spec.ts
describe('Onboarding Progress (e2e)', () => {
  it('should update progress when clip is created', async () => {
    // Create project
    const project = await createTestProject();
    
    // Detect clips
    await request(app.getHttpServer())
      .post(`/v1/projects/${project.id}/detect`)
      .set('Authorization', `Bearer ${token}`)
      .send({ clipLength: 30, clipCount: 5 })
      .expect(200);
    
    // Check progress
    const response = await request(app.getHttpServer())
      .get('/v1/onboarding/progress')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.hasCreatedClip).toBe(true);
    expect(response.body.firstClipAt).toBeDefined();
  });
});
```

---

## Deployment Checklist

- [ ] Run database migration
- [ ] Deploy backend changes
- [ ] Verify API endpoints work
- [ ] Test frontend integration
- [ ] Monitor error logs
- [ ] Check analytics events
- [ ] Verify checklist updates in real-time

---

## Monitoring & Alerts

### Metrics to Track

1. **Progress Update Rate**
   - Track how many users complete each step
   - Monitor time between steps
   - Identify drop-off points

2. **API Performance**
   - `/v1/onboarding/progress` response time
   - `/v1/onboarding/progress/update` success rate
   - Error rates

3. **Database Performance**
   - Query execution time
   - Index usage
   - Lock contention

### Alerts

```yaml
# alerts.yml
- name: OnboardingProgressUpdateFailure
  condition: error_rate > 5%
  severity: high
  notification: slack, pagerduty

- name: OnboardingProgressSlowQuery
  condition: p95_latency > 500ms
  severity: medium
  notification: slack
```

---

## Rollback Plan

If issues occur:

1. **Disable progress tracking:**
   ```typescript
   // Add feature flag
   if (!featureFlags.onboardingProgressTracking) {
     return; // Skip tracking
   }
   ```

2. **Revert database migration:**
   ```bash
   npm run migration:down
   ```

3. **Frontend fallback:**
   - Checklist shows all items as incomplete
   - No real-time updates
   - User can still use features

---

## Success Criteria

✅ **Functional:**
- Checklist updates when user completes features
- Progress persists across sessions
- No duplicate tracking

✅ **Performance:**
- Progress API responds < 200ms (p95)
- Update API responds < 300ms (p95)
- No database bottlenecks

✅ **User Experience:**
- Checklist feels responsive
- Progress is accurate
- No false positives

---

## Timeline

**Day 1:**
- Database migration
- API endpoints implementation
- Unit tests

**Day 2:**
- Integration with existing services
- Frontend updates
- Integration tests

**Day 3:**
- Deployment
- Monitoring setup
- Bug fixes

---

## Owner

**Backend Team**  
**Point of Contact:** Backend Lead  
**Review Required:** Yes (before deployment)
