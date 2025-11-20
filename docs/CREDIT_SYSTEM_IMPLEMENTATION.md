# Credit System Implementation - Week 1

**Date**: November 20, 2025  
**Status**: Day 1 Complete ✅  
**Goal**: Opus Clip parity for billing and metering

---

## Day 1: Database Schema ✅ COMPLETE

### What Was Built

#### 1. **Organization Model Extensions**
```typescript
credits: number              // Default 60 (FREE tier)
creditsResetDate: DateTime   // Monthly renewal tracking
creditsUsedThisMonth: number // Analytics tracking

// Stripe Integration
stripeCustomerId: string?
stripeSubscriptionId: string?
stripePriceId: string?
stripeCurrentPeriodEnd: DateTime?

// Trial System
trialStartDate: DateTime?
trialEndDate: DateTime?
trialUsed: boolean           // Default false
```

#### 2. **Project Model Extensions**
```typescript
creditsUsed: number?         // Credits deducted for this project
expiresAt: DateTime?         // Free tier: 2 days, Paid: never
```

#### 3. **CreditTransaction Model** (NEW)
Complete audit trail for all credit changes:
```typescript
{
  id: string
  orgId: string
  amount: number              // Negative = deduction, Positive = addition
  balanceBefore: number       // Credits before transaction
  balanceAfter: number        // Credits after transaction
  type: CreditTransactionType
  projectId: string?          // If related to a project
  videoDuration: number?      // Video duration in minutes
  description: string?        // Human-readable description
  metadata: Json?             // Additional context
  createdAt: DateTime
}
```

#### 4. **Credit Transaction Types**
```typescript
enum CreditTransactionType {
  // Deductions
  DEDUCTION_CLIPS     // AI Clips processing
  DEDUCTION_REFRAME   // AI Reframe processing
  DEDUCTION_CAPTIONS  // AI Captions processing
  
  // Additions
  ADDITION_PURCHASE   // Credits purchased
  ADDITION_RENEWAL    // Monthly renewal
  ADDITION_TRIAL      // Trial credits
  ADDITION_REFUND     // Refund for failed processing
  ADDITION_MANUAL     // Admin manual addition
}
```

#### 5. **Tier System Updated**
```typescript
enum Tier {
  FREE       // 60 credits/month
  STARTER    // 150 credits/month ($29/mo) - NEW
  PRO        // 300 credits/month ($79/mo)
  BUSINESS   // Custom
  ENTERPRISE // Custom + API access
}
```

---

## Database Migration

**Migration**: `20251120145940_add_credit_system`

**Applied**: ✅ Successfully  
**Prisma Client**: ✅ Regenerated  
**Docker**: ✅ No disruption to running services

### Verification
```sql
-- Organization table now has:
- credits (default 60)
- creditsResetDate
- creditsUsedThisMonth
- Stripe fields (customerId, subscriptionId, etc.)
- Trial fields (trialStartDate, trialEndDate, trialUsed)

-- Project table now has:
- creditsUsed
- expiresAt

-- CreditTransaction table created with full audit trail
```

---

## Credit Allocation by Tier

| Tier       | Credits/Month | Price    | API Access | Project Expiration |
|------------|---------------|----------|------------|--------------------|
| FREE       | 60            | $0       | ❌         | 2 days             |
| STARTER    | 150           | $29/mo   | ❌         | Never              |
| PRO        | 300           | $79/mo   | Limited    | Never              |
| BUSINESS   | Custom        | Custom   | ✅         | Never              |
| ENTERPRISE | Custom        | Custom   | ✅ Full    | Never              |

---

## Credit Deduction Rules (Opus Clip Parity)

### Calculation Logic
```typescript
// 1 credit = 1 minute of video processing
// Rounding rules:
- Videos < 1 minute: Round UP to 1 credit
- Videos with partial minutes: Round DOWN to nearest whole minute

Examples:
- 0.5 minutes → 1 credit
- 4.5 minutes → 4 credits
- 10.2 minutes → 10 credits
```

### Processing Types
```typescript
AI Clips:    1 credit per minute of source video
AI Reframe:  1 credit per minute of source video
AI Captions: 1 credit per minute of source video
```

---

## Day 2: Credit Deduction Logic ✅ COMPLETE

### What Was Built

#### 1. **CreditsService** (`apps/api/src/credits/credits.service.ts`)
Complete credit management service with:

**Core Methods:**
- `calculateCredits(durationSeconds)` - Opus Clip rounding rules
- `hasSufficientCredits(orgId, credits)` - Check balance
- `getBalance(orgId)` - Get current balance
- `deductCredits(orgId, amount, type, projectId, duration)` - Deduct with audit trail
- `addCredits(orgId, amount, type, description)` - Add credits (purchase/renewal/refund)
- `refundCredits(projectId, reason)` - Auto-refund for failed processing
- `getTransactionHistory(orgId, limit, offset)` - Credit history
- `needsRenewal(orgId)` - Check if renewal needed
- `renewCredits(orgId)` - Monthly renewal

**Features:**
- ✅ Full audit trail for every credit change
- ✅ Atomic transactions (all-or-nothing)
- ✅ Detailed logging
- ✅ Error handling with user-friendly messages
- ✅ Metadata tracking (tier, timestamp, etc.)

#### 2. **Integration with ProjectsService**
Modified `uploadVideo()` method to:
- Calculate credits needed based on video duration
- Check if organization has sufficient credits
- Deduct credits before processing
- Set project expiration (Free: 2 days, Paid: never)
- Return `creditsUsed` and `expiresAt` in response
- Detect processing type (CLIPS/REFRAME/CAPTIONS)

**Code Example:**
```typescript
// Calculate credits (Opus rules)
const creditsNeeded = this.credits.calculateCredits(metadata.duration);

// Check balance
const hasSufficientCredits = await this.credits.hasSufficientCredits(orgId, creditsNeeded);
if (!hasSufficientCredits) {
  throw new BadRequestException('Insufficient credits...');
}

// Deduct credits
await this.credits.deductCredits(
  orgId,
  creditsNeeded,
  processingType,
  projectId,
  metadata.duration / 60
);

// Set expiration (Free tier only)
const expiresAt = org?.tier === 'FREE' 
  ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  : null;
```

#### 3. **Module Integration**
- Created `CreditsModule`
- Imported into `AppModule` (global)
- Imported into `ProjectsModule`
- Injected into `ProjectsService`

### Testing

**Manual Test:**
1. Upload a video
2. Check credits deducted correctly
3. Verify audit trail in database
4. Test insufficient credits error
5. Verify project expiration set

**Database Verification:**
```sql
-- Check organization credits
SELECT id, name, tier, credits, creditsUsedThisMonth FROM "Organization";

-- Check credit transactions
SELECT * FROM "CreditTransaction" ORDER BY "createdAt" DESC LIMIT 10;

-- Check project expiration
SELECT id, title, "creditsUsed", "expiresAt" FROM "Project" ORDER BY "createdAt" DESC LIMIT 5;
```

### What Works

✅ **Credit Calculation**: Opus Clip rounding rules implemented  
✅ **Insufficient Credits**: Blocks upload with clear error message  
✅ **Credit Deduction**: Atomic transaction with audit trail  
✅ **Project Expiration**: Free tier projects expire in 2 days  
✅ **Processing Type Detection**: CLIPS/REFRAME/CAPTIONS  
✅ **Refund System**: Ready for failed processing  
✅ **API Stability**: No breaking changes, Docker services stable  

---

## Day 3 Summary: Credit Renewal & History ✅

**Date**: November 20, 2025  
**Status**: ✅ COMPLETE  
**Commits**: `b2bb4e0`, `bd82129`, `3ebe5d8`

### What We Built

#### 1. **CreditsCronService** (`apps/api/src/credits/credits-cron.service.ts`)
Automated background jobs for credit management:

**Cron Jobs:**
- `handleCreditRenewal()` - Runs daily at 2 AM
  - Checks all organizations for renewal eligibility (30+ days)
  - Renews credits based on tier allocation
  - Creates ADDITION_RENEWAL transaction
  - Logs success/failure for each org
  
- `handleExpiredProjects()` - Runs daily at 3 AM
  - Finds Free tier projects with `expiresAt <= now`
  - Deletes expired projects (cascade deletes assets, etc.)
  - Logs deletion details
  
- `handleLowCreditWarnings()` - Runs daily at 10 AM
  - Finds orgs with ≤10 credits remaining
  - Logs warning for each user in org
  - Ready for email integration (TODO)

**Manual Triggers:**
- `manualRenewal(orgId)` - For testing
- `manualCleanup()` - For testing

#### 2. **Credits API Endpoints** (`apps/api/src/credits/credits.controller.ts`)

**GET /v1/credits/balance**
Returns:
```json
{
  "balance": 52,
  "usedThisMonth": 8,
  "allocation": 60,
  "resetDate": "2025-12-20T00:00:00.000Z",
  "tier": "FREE"
}
```

**GET /v1/credits/history?limit=20&offset=0**
Returns:
```json
{
  "transactions": [
    {
      "id": "...",
      "amount": -4,
      "balanceBefore": 56,
      "balanceAfter": 52,
      "type": "DEDUCTION_CLIPS",
      "description": "Video processing: My Video",
      "videoDuration": 4.60,
      "createdAt": "2025-11-20T11:30:37.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 5,
    "hasMore": false
  }
}
```

#### 3. **Credit History UI Page** (`apps/web/app/credits/page.tsx`)

**Layout:**
- Header with back button and "Upgrade Plan" CTA
- 3 metric cards (Balance, Allocation, Next Reset)
- Transaction history table with pagination
- Empty state for no transactions
- Loading states

**Features:**
- ✅ Real-time data from API
- ✅ Color-coded transactions (red/green)
- ✅ Transaction type icons (up/down arrows)
- ✅ Video duration display
- ✅ Pagination (20 per page)
- ✅ Responsive design
- ✅ Hover states and transitions

#### 4. **Sidebar Integration**
- Made credit widget clickable → `/credits`
- Changed button text to "View Details"
- Added hover state

### Technical Details

**Dependencies:**
- Installed `@nestjs/schedule` for cron jobs
- Added `ScheduleModule.forRoot()` to CreditsModule
- All cron jobs have explicit names (avoids crypto.randomUUID issue)

**Authentication:**
- Uses `AuthGuard('jwt')` from Passport
- Credits page uses localStorage token (like dashboard)

**Database:**
- Fixed missing `CreditTransactionType` enum (migration `20251120165758`)
- All enum values working correctly

### Testing

**Manual Testing:**
1. ✅ Upload video → credits deducted → transaction created
2. ✅ Navigate to `/credits` → see balance and history
3. ✅ Click sidebar credit widget → navigate to credits page
4. ✅ API endpoints return correct data
5. ✅ Cron jobs registered (check logs)

**Cron Job Testing:**
```bash
# Check cron jobs are registered
docker logs clipforge-api | grep -i "cron"

# Manual trigger (in code):
await creditsCronService.manualRenewal(orgId);
await creditsCronService.manualCleanup();
```

### What's Working

✅ **Credit Renewal**: Automated monthly renewal  
✅ **Project Expiration**: Free tier cleanup  
✅ **Low Credit Warnings**: Detection ready  
✅ **Credit History API**: Full pagination support  
✅ **Credit History UI**: Beautiful, responsive page  
✅ **Sidebar Navigation**: Clickable credit widget  
✅ **Real-time Data**: Live balance and transactions  

### Known Limitations

⚠️ **Email Notifications**: Cron logs warnings but doesn't send emails (EmailService TODO)  
⚠️ **Manual Testing**: Cron jobs need time-based testing (wait for scheduled runs)  

---

## Next Steps

### Day 2: Credit Deduction Logic ✅ COMPLETE
- [x] Create `CreditService` with deduction methods
- [x] Implement rounding logic (Opus rules)
- [x] Add insufficient credits check
- [x] Integrate with project creation (uploadVideo)
- [x] Add credit balance checks to API endpoints
- [x] Test credit deduction flow
- [x] Add project expiration logic (Free: 2 days)
- [x] Add refund system for failed processing

### Day 3: Credit Renewal & History ✅ COMPLETE
- [x] Create monthly renewal cron job
- [x] Build credit history page (like Opus)
- [x] Add credit balance display in UI
- [x] Add credit API endpoints (balance, history)
- [x] Expired project cleanup cron
- [x] Low credit warnings cron
- [ ] Email notifications for low credits (pending EmailService)

### Day 4: API Authentication
- [ ] API key generation
- [ ] Rate limiting by tier
- [ ] Usage tracking

---

## Architecture Notes

### Why This Design?

1. **Audit Trail**: Every credit change is logged in `CreditTransaction`
2. **Balance Tracking**: `balanceBefore` and `balanceAfter` for reconciliation
3. **Flexible Metadata**: JSON field for future extensibility
4. **Stripe Ready**: Fields prepared for Stripe integration
5. **Trial System**: Built-in 7-day trial support
6. **Project Expiration**: Free tier projects auto-expire after 2 days

### Database Integrity

- ✅ Foreign key constraints (CASCADE on delete)
- ✅ Indexes on frequently queried fields
- ✅ Unique constraints on Stripe IDs
- ✅ Default values for all required fields

---

## Testing Checklist

### Database Schema ✅
- [x] Migration applied successfully
- [x] Prisma client regenerated
- [x] All indexes created
- [x] Foreign keys working
- [x] Default values correct

### Next Testing (Day 2)
- [ ] Credit deduction works correctly
- [ ] Rounding logic matches Opus
- [ ] Insufficient credits handled gracefully
- [ ] Transaction audit trail accurate
- [ ] Balance calculations correct

---

## Commit

**Hash**: `70f3256`  
**Message**: `feat: Add credit system database schema`

---

**Day 1 Status**: ✅ COMPLETE  
**Timeline**: On track  
**Next**: Day 2 - Credit deduction logic

---

**Last Updated**: November 20, 2025, 2:50 PM IST
