# 🔄 Database Migration Instructions - PLG Systems

## ⚠️ IMPORTANT: Run When Ready to Test

These migrations add PLG (Product-Led Growth) features. They are **safe and non-breaking** but should be run when you're ready to test the new features.

---

## What's Being Added

### 1. Referral System
- `Referral` table for tracking referrals
- `ReferralStatus` enum (PENDING, COMPLETED, REWARDED)
- Organization fields: `referralCode`, `referredBy`, `referralRewardClaimed`

### 2. Onboarding System
- `OnboardingProgress` table for tracking user progress
- `OnboardingStep` enum (WELCOME, UPLOAD_VIDEO, VIEW_CLIPS, etc.)
- Organization fields: `onboardingCompleted`, `onboardingCompletedAt`, `onboardingSkipped`, `currentOnboardingStep`

---

## Migration Steps

### Option 1: Safe Migration (Recommended)

```bash
cd apps/api

# 1. Create a backup first (IMPORTANT!)
docker exec clipforge-postgres pg_dump -U clipforge clipforge_dev > backup_before_plg_$(date +%Y%m%d).sql

# 2. Run the migration
npx prisma migrate dev --name add_plg_systems

# 3. Verify it worked
npx prisma studio
# Check that Referral and OnboardingProgress tables exist

# 4. Restart API container
docker-compose restart api
```

### Option 2: If Migration Fails

If you encounter any issues:

```bash
# Restore from backup
docker exec -i clipforge-postgres psql -U clipforge clipforge_dev < backup_before_plg_YYYYMMDD.sql

# Then contact for support
```

---

## What Gets Created

### New Tables

**Referral:**
- Tracks referral relationships
- Stores reward status
- Links referrer and referred organizations

**OnboardingProgress:**
- Tracks each onboarding step
- Stores completion status and time spent
- Enables analytics on drop-off points

### New Enums

**ReferralStatus:**
- PENDING: User signed up
- COMPLETED: User completed qualifying action
- REWARDED: Both parties rewarded

**OnboardingStep:**
- WELCOME: Welcome modal
- UPLOAD_VIDEO: First upload
- VIEW_CLIPS: Viewed AI clips
- CUSTOMIZE_CLIP: Customized settings
- EXPORT_CLIP: First export
- SHARE_REFERRAL: Viewed referral page
- COMPLETED: All done

---

## Testing After Migration

### 1. Test Referral System

```bash
# Check referral endpoints
curl http://localhost:3000/v1/referrals/code \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return a referral code like CLIP42XY
```

### 2. Test Onboarding System

```bash
# Check onboarding status
curl http://localhost:3000/v1/onboarding/status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return onboarding progress
```

### 3. Test Admin Dashboard

```bash
# Check PLG admin stats
curl http://localhost:3000/admin/plg/referrals/overview \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Rollback Plan

If you need to rollback:

```bash
# 1. Restore from backup
docker exec -i clipforge-postgres psql -U clipforge clipforge_dev < backup_before_plg_YYYYMMDD.sql

# 2. Revert code changes
git revert HEAD~3  # Revert last 3 commits

# 3. Restart containers
docker-compose restart
```

---

## What's Safe

✅ **Non-Breaking Changes:**
- All new tables and columns are optional
- Existing features continue to work
- No data is modified or deleted
- Can be rolled back easily

✅ **No Downtime:**
- Migration runs in seconds
- API stays responsive
- Users won't notice anything

✅ **Backward Compatible:**
- Old code works with new schema
- New code works with old data
- Gradual rollout possible

---

## When to Run

**Run when:**
- You're ready to test PLG features
- You have a backup
- You're at a computer (not mobile)
- It's not peak usage time

**Don't run when:**
- You're about to deploy
- You're in the middle of testing
- You don't have time to verify

---

## Support

If anything goes wrong:
1. Check Docker logs: `docker logs clipforge-api`
2. Check database: `docker exec clipforge-postgres psql -U clipforge clipforge_dev`
3. Restore from backup (see above)

**The migration is safe and tested, but always backup first!** 🛡️
