# Credit Investigation - 157/150 Credits

**Date:** November 23, 2025  
**Issue:** User has 157 credits but allocation is 150

---

## 🔍 **Investigation Steps:**

### **1. Check Credit Transactions**
Query the database to see all credit transactions for this organization:

```sql
SELECT 
  id,
  amount,
  type,
  description,
  "balanceBefore",
  "balanceAfter",
  "createdAt"
FROM "CreditTransaction"
WHERE "orgId" = 'YOUR_ORG_ID'
ORDER BY "createdAt" DESC
LIMIT 20;
```

### **2. Possible Causes:**

#### **A. Duplicate Subscription Webhook**
- Stripe webhook called twice for same subscription
- Would show 2x `ADDITION_PURCHASE` transactions
- **Fix:** Add idempotency key to webhook handler

#### **B. Manual Credit Addition**
- Admin manually added credits via database
- Would show `ADDITION_MANUAL` transaction
- **Expected behavior** if admin granted bonus credits

#### **C. Credit Rollover (Intentional)**
- User had unused credits from previous month
- New month added 150 credits on top of existing 7
- **Question:** Should we allow rollover or reset to allocation?

#### **D. Race Condition**
- Multiple simultaneous subscription activations
- Unlikely but possible with concurrent webhooks
- **Fix:** Use database transaction with locking

---

## 🎯 **Recommended Solution:**

### **Option 1: Cap at Allocation (Strict)**
```typescript
// In payments.service.ts - handleSubscriptionUpdated()
const currentCredits = org.credits;
const newBalance = Math.min(
  currentCredits + creditsToAdd,
  tierCredits[tier] // Cap at tier allocation
);

await this.prisma.organization.update({
  where: { id: org.id },
  data: {
    tier: tier as any,
    credits: newBalance, // Use capped value
    // ...
  },
});
```

**Pros:**
- Simple and predictable
- Prevents credit hoarding
- Encourages regular usage

**Cons:**
- Wastes unused credits
- Users lose credits if they don't use them

---

### **Option 2: Allow Rollover with Cap (Generous)**
```typescript
// Allow rollover but cap at 2x allocation
const maxCredits = tierCredits[tier] * 2;
const newBalance = Math.min(
  org.credits + creditsToAdd,
  maxCredits
);

await this.prisma.organization.update({
  where: { id: org.id },
  data: {
    tier: tier as any,
    credits: newBalance,
    // ...
  },
});
```

**Pros:**
- User-friendly
- Rewards consistent subscribers
- Reduces churn (users don't lose credits)

**Cons:**
- More complex to explain
- Could lead to large credit balances

---

### **Option 3: Reset to Allocation (Opus Clip Style)**
```typescript
// Reset to tier allocation on renewal
await this.prisma.organization.update({
  where: { id: org.id },
  data: {
    tier: tier as any,
    credits: tierCredits[tier], // Reset to allocation
    // ...
  },
});
```

**Pros:**
- Simplest logic
- Easy to understand
- Matches Opus Clip behavior

**Cons:**
- Users lose unused credits
- Could feel punishing

---

## 📊 **Opus Clip Behavior:**

Need to verify, but likely:
- **Monthly reset** to tier allocation
- **No rollover** of unused credits
- **Clear communication** about credit expiry

---

## ✅ **Recommended Implementation:**

**Use Option 2: Rollover with 2x Cap**

Reasoning:
1. **User-friendly** - Rewards loyal customers
2. **Competitive advantage** - Better than Opus Clip
3. **Prevents abuse** - 2x cap limits hoarding
4. **Marketing angle** - "Unused credits roll over!"

### **Code Changes:**

```typescript
// apps/api/src/payments/payments.service.ts

private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // ... existing code ...

  // Calculate credits with rollover cap
  const tierCredits = {
    STARTER: 150,
    PRO: 300,
    BUSINESS: 1000,
  };
  const creditsToAdd = tierCredits[tier as keyof typeof tierCredits] || 300;
  const maxCredits = creditsToAdd * 2; // Allow 2x rollover
  
  const currentCredits = org.credits;
  const newBalance = Math.min(
    currentCredits + creditsToAdd,
    maxCredits
  );

  // Log if credits were capped
  if (currentCredits + creditsToAdd > maxCredits) {
    this.logger.warn(
      `Credits capped for org ${org.id}: ` +
      `${currentCredits} + ${creditsToAdd} = ${currentCredits + creditsToAdd} ` +
      `→ capped at ${maxCredits}`
    );
  }

  await this.prisma.organization.update({
    where: { id: org.id },
    data: {
      tier: tier as any,
      stripeSubscriptionId: subscription.id,
      stripeCurrentPeriodEnd: currentPeriodEnd,
      credits: newBalance, // Use capped value
    },
  });

  // Log transaction with actual amount added
  const actualCreditsAdded = newBalance - currentCredits;
  await this.prisma.creditTransaction.create({
    data: {
      orgId: org.id,
      amount: actualCreditsAdded,
      balanceBefore: currentCredits,
      balanceAfter: newBalance,
      type: 'ADDITION_PURCHASE',
      description: `${tier} subscription renewed - ${actualCreditsAdded} credits added (${creditsToAdd - actualCreditsAdded} capped)`,
    },
  });

  // ...
}
```

---

## 📝 **User Communication:**

Add to subscription page:
```
✨ Unused credits roll over!
Your unused credits carry over to the next month, up to 2x your monthly allocation.

STARTER: Up to 300 credits (150/month + 150 rollover)
PRO: Up to 600 credits (300/month + 300 rollover)
BUSINESS: Up to 2000 credits (1000/month + 1000 rollover)
```

---

## 🧪 **Testing:**

1. **Test rollover:**
   - User has 100 credits
   - Subscription renews (150 credits)
   - New balance: 250 credits ✅

2. **Test cap:**
   - User has 200 credits
   - Subscription renews (150 credits)
   - New balance: 300 credits (capped at 2x150) ✅

3. **Test fresh subscription:**
   - User has 0 credits
   - Subscription activates (150 credits)
   - New balance: 150 credits ✅

---

**Decision Needed:** Which option do you prefer?
- Option 1: Strict cap at allocation
- Option 2: Rollover with 2x cap (Recommended)
- Option 3: Reset to allocation (Opus Clip style)
