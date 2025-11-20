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

## Next Steps

### Day 2: Credit Deduction Logic (Tomorrow)
- [ ] Create `CreditService` with deduction methods
- [ ] Implement rounding logic (Opus rules)
- [ ] Add insufficient credits check
- [ ] Integrate with project creation
- [ ] Add credit balance checks to API endpoints
- [ ] Test credit deduction flow

### Day 3: Credit Renewal & History
- [ ] Create monthly renewal cron job
- [ ] Build credit history page (like Opus)
- [ ] Add credit balance display in UI
- [ ] Email notifications for low credits

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
