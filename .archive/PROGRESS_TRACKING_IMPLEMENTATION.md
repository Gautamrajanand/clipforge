# Backend Progress Tracking - Implementation Guide

**Status:** Schema Updated - Ready for Migration  
**Date:** December 5, 2025  
**Priority:** P0 - Critical for PLG

---

## ✅ What's Been Done

### 1. Database Schema Updated
**File:** `apps/api/prisma/schema.prisma`

**Changes to `OnboardingProgress` model:**
```prisma
// Feature completion tracking (PLG activation)
hasCreatedClip      Boolean   @default(false)
hasAddedSubtitles   Boolean   @default(false)
hasReframedVideo    Boolean   @default(false)
hasShared           Boolean   @default(false)
firstClipAt         DateTime?
firstSubtitleAt     DateTime?
firstReframeAt      DateTime?
firstShareAt        DateTime?
exportCount         Int       @default(0)
lastExportAt        DateTime?
```

**Index added:**
- `@@index([hasCreatedClip])` - For performance on progress queries

---

## 🚀 Next Steps to Complete

### Step 1: Run Database Migration (5 minutes)

```bash
cd apps/api

# Generate Prisma client with new schema
npx prisma generate

# Create and run migration
npx prisma migrate dev --name add_onboarding_feature_tracking

# Verify migration
npx prisma studio
# Check OnboardingProgress table has new columns
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ The following migration(s) have been created and applied:
  migrations/
    └─ 20251205_add_onboarding_feature_tracking/
       └─ migration.sql
```

---

### Step 2: Create Onboarding Service (30 minutes)

**File:** `apps/api/src/onboarding/onboarding.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private prisma: PrismaService) {}

  // Get user's onboarding progress
  async getProgress(userId: string) {
    let progress = await this.prisma.onboardingProgress.findUnique({
      where: { userId },
    });

    // Create if doesn't exist
    if (!progress) {
      progress = await this.prisma.onboardingProgress.create({
        data: { userId },
      });
    }

    // Calculate completion percentage
    const features = [
      progress.hasCreatedClip,
      progress.hasAddedSubtitles,
      progress.hasReframedVideo,
      progress.hasShared,
    ];
    const completedCount = features.filter(Boolean).length;
    const completionPercentage = Math.round((completedCount / features.length) * 100);

    return {
      ...progress,
      completionPercentage,
    };
  }

  // Update progress when user completes a feature
  async updateProgress(userId: string, feature: 'clip' | 'subtitle' | 'reframe' | 'export') {
    this.logger.log(`Updating progress for user ${userId}: ${feature}`);

    const now = new Date();
    const progress = await this.getProgress(userId);

    const updateData: any = {};

    switch (feature) {
      case 'clip':
        if (!progress.hasCreatedClip) {
          updateData.hasCreatedClip = true;
          updateData.firstClipAt = now;
          this.logger.log(`🎉 First clip created for user ${userId}`);
        }
        break;

      case 'subtitle':
        if (!progress.hasAddedSubtitles) {
          updateData.hasAddedSubtitles = true;
          updateData.firstSubtitleAt = now;
          this.logger.log(`📝 First subtitles added for user ${userId}`);
        }
        break;

      case 'reframe':
        if (!progress.hasReframedVideo) {
          updateData.hasReframedVideo = true;
          updateData.firstReframeAt = now;
          this.logger.log(`🎬 First reframe for user ${userId}`);
        }
        break;

      case 'export':
        updateData.exportCount = { increment: 1 };
        updateData.lastExportAt = now;
        if (!progress.hasShared && progress.exportCount === 0) {
          updateData.hasShared = true;
          updateData.firstShareAt = now;
          this.logger.log(`🚀 First export for user ${userId}`);
        }
        break;
    }

    if (Object.keys(updateData).length > 0) {
      return await this.prisma.onboardingProgress.update({
        where: { userId },
        data: updateData,
      });
    }

    return progress;
  }
}
```

---

### Step 3: Create Onboarding Controller (15 minutes)

**File:** `apps/api/src/onboarding/onboarding.controller.ts`

```typescript
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OnboardingService } from './onboarding.service';

@Controller('v1/onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Get('progress')
  async getProgress(@Req() req: any) {
    const userId = req.user.userId;
    return await this.onboardingService.getProgress(userId);
  }

  @Post('progress/update')
  async updateProgress(
    @Req() req: any,
    @Body() body: { feature: 'clip' | 'subtitle' | 'reframe' | 'export' }
  ) {
    const userId = req.user.userId;
    return await this.onboardingService.updateProgress(userId, body.feature);
  }
}
```

---

### Step 4: Create Onboarding Module (5 minutes)

**File:** `apps/api/src/onboarding/onboarding.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
```

---

### Step 5: Register Module in App (2 minutes)

**File:** `apps/api/src/app.module.ts`

```typescript
import { OnboardingModule } from './onboarding/onboarding.module';

@Module({
  imports: [
    // ... other modules
    OnboardingModule, // Add this
  ],
})
export class AppModule {}
```

---

### Step 6: Integrate with Existing Services (1 hour)

#### A. Projects Service - Clip Detection

**File:** `apps/api/src/projects/projects.service.ts`

```typescript
import { OnboardingService } from '../onboarding/onboarding.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private onboardingService: OnboardingService, // Add this
  ) {}

  async detectClips(projectId: string, userId: string, settings: any) {
    // ... existing clip detection logic ...

    // After successful clip creation
    if (clips.length > 0) {
      await this.onboardingService.updateProgress(userId, 'clip');
    }

    return clips;
  }
}
```

#### B. Projects Service - Subtitles

```typescript
async addSubtitles(projectId: string, userId: string, settings: any) {
  // ... existing subtitle logic ...

  // After successful subtitle generation
  await this.onboardingService.updateProgress(userId, 'subtitle');

  return result;
}
```

#### C. Projects Service - Reframe

```typescript
async reframeVideo(projectId: string, userId: string, settings: any) {
  // ... existing reframe logic ...

  // After successful reframe
  await this.onboardingService.updateProgress(userId, 'reframe');

  return result;
}
```

#### D. Exports Service - Export

**File:** `apps/api/src/exports/exports.service.ts`

```typescript
async createExport(clipId: string, userId: string, settings: any) {
  // ... existing export logic ...

  // After successful export
  await this.onboardingService.updateProgress(userId, 'export');

  return exportResult;
}
```

---

### Step 7: Frontend Integration (30 minutes)

#### A. Create Hook

**File:** `apps/web/hooks/useOnboardingProgress.ts`

```typescript
import { useQuery } from 'react-query';
import { fetchWithAuth } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

export function useOnboardingProgress() {
  const { getToken } = useAuth();

  return useQuery(
    ['onboarding-progress'],
    async () => {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/onboarding/progress`,
        { getToken }
      );
      return response.json();
    },
    {
      refetchInterval: 5000, // Refresh every 5 seconds
      staleTime: 3000,
    }
  );
}
```

#### B. Update Checklist Component

**File:** `apps/web/components/onboarding/OnboardingChecklist.tsx`

```typescript
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';

export default function OnboardingChecklist() {
  const { data: progress, isLoading } = useOnboardingProgress();

  if (isLoading) return <LoadingSpinner />;

  const steps = [
    {
      id: 'clip',
      title: 'Try AI Clips',
      completed: progress?.hasCreatedClip || false,
    },
    {
      id: 'subtitle',
      title: 'Add AI Subtitles',
      completed: progress?.hasAddedSubtitles || false,
    },
    {
      id: 'reframe',
      title: 'Try AI Reframe',
      completed: progress?.hasReframedVideo || false,
    },
    {
      id: 'export',
      title: 'Export & Share',
      completed: progress?.hasShared || false,
    },
  ];

  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <ChecklistItem
          key={step.id}
          title={step.title}
          completed={step.completed}
        />
      ))}
      <div className="text-sm text-gray-600 mt-4">
        {progress?.completionPercentage}% Complete
      </div>
    </div>
  );
}
```

---

## 🧪 Testing Checklist

### Backend Testing

```bash
# 1. Test GET progress endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/v1/onboarding/progress

# Expected: Returns progress object with all fields

# 2. Test POST update endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"feature": "clip"}' \
  http://localhost:3001/v1/onboarding/progress/update

# Expected: Returns updated progress with hasCreatedClip = true

# 3. Verify in database
# Open Prisma Studio and check OnboardingProgress table
npx prisma studio
```

### Frontend Testing

1. **Open dashboard** - Checklist should show
2. **Create first clip** - Checklist item should check off within 5 seconds
3. **Add subtitles** - Checklist should update
4. **Try reframe** - Checklist should update
5. **Export clip** - Checklist should update
6. **Refresh page** - Progress should persist

---

## 📊 Success Criteria

- ✅ Database migration runs successfully
- ✅ API endpoints return correct data
- ✅ Progress updates when features are used
- ✅ Frontend checklist updates in real-time
- ✅ Progress persists across sessions
- ✅ No performance issues (< 100ms response time)

---

## 🐛 Troubleshooting

### Issue: Checklist not updating

**Check:**
1. Browser console for API errors
2. Backend logs for update calls
3. Database - verify OnboardingProgress record exists
4. React Query devtools - check refetch interval

**Fix:**
```typescript
// Force refetch
const { refetch } = useOnboardingProgress();
await refetch();
```

### Issue: Progress resets

**Check:**
1. Database - verify data persists
2. userId consistency
3. Prisma client generation

**Fix:**
```bash
npx prisma generate
npm run build
```

---

## ⏱️ Estimated Timeline

- **Step 1:** Database Migration - 5 minutes
- **Step 2-5:** Backend Implementation - 1 hour
- **Step 6:** Service Integration - 1 hour
- **Step 7:** Frontend Integration - 30 minutes
- **Testing:** 30 minutes

**Total:** ~3 hours (vs 2-3 days estimated)

---

## 🚀 Deployment Checklist

- [ ] Run migration on staging
- [ ] Test all endpoints on staging
- [ ] Verify frontend updates work
- [ ] Run migration on production
- [ ] Monitor logs for errors
- [ ] Verify no performance degradation

---

**Status:** Ready for implementation  
**Next:** Run `npx prisma migrate dev` to apply schema changes
