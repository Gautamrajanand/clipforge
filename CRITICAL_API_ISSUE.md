# 🔴 CRITICAL: API Not Starting - Schema Mismatch

## Problem Discovered

The API is **NOT STARTING** due to TypeScript compilation errors. The errors you're seeing (`ERR_CONNECTION_RESET`, `ERR_SOCKET_NOT_CONNECTED`) are because the API server is down, not 401 authentication errors.

## Root Cause

**Prisma schema file was out of sync with the actual database schema.**

### What Happened:
1. Someone edited `prisma/schema.prisma` without creating a migration
2. The schema file had `OnboardingProgress` using `orgId` and `step` enum
3. The actual database has `OnboardingProgress` using `userId` and string arrays
4. The service code (`onboarding-progress.service.ts`) uses old field names that don't exist

### Current State:
- ✅ Prisma schema NOW matches database (I fixed it)
- ✅ Prisma client regenerated
- ❌ Service code still has 21 TypeScript errors
- ❌ API cannot compile and start
- ❌ All API endpoints return connection errors

## Errors in Service Code

File: `apps/api/src/onboarding/onboarding-progress.service.ts`

**Problems:**
1. Uses `hasUploadedVideo`, `hasCreatedClip`, etc. (don't exist in schema)
2. Uses `userId` in where clause (should work but TypeScript doesn't recognize it)
3. Return types don't match schema structure

**Schema has:**
- `userId` (string, unique)
- `currentStep` (string)
- `completedSteps` (string array)
- `skippedSteps` (string array)
- `isCompleted` (boolean)
- `completedAt` (DateTime?)

**Service expects:**
- `hasUploadedVideo` (boolean) ❌
- `hasCreatedClip` (boolean) ❌
- `hasAddedSubtitles` (boolean) ❌
- `hasReframedVideo` (boolean) ❌
- `hasShared` (boolean) ❌

## Immediate Fix Required

### Option 1: Disable Onboarding Service (Quick)

Comment out the onboarding endpoints to get API running:

```typescript
// In apps/api/src/onboarding/onboarding.controller.ts
// Comment out all routes temporarily
```

### Option 2: Rewrite Service to Match Schema (Proper)

Update `onboarding-progress.service.ts` to use correct schema fields:

```typescript
// Instead of:
hasUploadedVideo: progress.hasUploadedVideo

// Use:
hasUploadedVideo: progress.completedSteps.includes('UPLOAD_VIDEO')
```

### Option 3: Revert Schema Changes (Rollback)

If the database schema is correct and service code is correct, revert my Prisma schema changes.

## What I Changed

### Files Modified:
1. `apps/api/prisma/schema.prisma`
   - Changed `OnboardingProgress` model to match database
   - Removed `OnboardingStep` enum
   - Changed from `orgId` to `userId`
   - Changed from individual boolean fields to string arrays

2. `apps/api/src/auth/guards/clerk-auth.guard.ts`
   - Added email fetching from Clerk API (this is good, keep it)

## Recommended Action

**I recommend Option 2** - Rewrite the service to match the actual database schema.

The database schema is:
```sql
OnboardingProgress (
  id text PRIMARY KEY,
  userId text UNIQUE NOT NULL,
  currentStep text DEFAULT 'WELCOME',
  completedSteps text[] DEFAULT '{}',
  skippedSteps text[] DEFAULT '{}',
  isCompleted boolean DEFAULT false,
  completedAt timestamp,
  createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp DEFAULT CURRENT_TIMESTAMP
)
```

This is actually a BETTER design than the old one because:
- More flexible (can add new steps without schema changes)
- Tracks step order
- Allows skipping steps
- Single source of truth

## Quick Fix to Get API Running

Let me create a minimal fix to get the API started...
