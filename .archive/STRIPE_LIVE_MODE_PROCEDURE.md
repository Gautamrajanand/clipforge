# Stripe Live Mode Switch Procedure

**Critical:** This procedure switches from test mode to live mode for real payments.  
**Date:** December 17, 2025  
**Estimated Time:** 30-45 minutes

---

## ⚠️ Pre-Switch Checklist

### 1. Stripe Account Verification
- [ ] Business details completed in Stripe Dashboard
- [ ] Bank account connected for payouts
- [ ] Identity verification completed
- [ ] Tax information submitted
- [ ] Business address verified
- [ ] Phone number verified

### 2. Test Mode Verification
- [ ] All test payments working correctly
- [ ] Webhooks receiving events successfully
- [ ] Subscription creation working
- [ ] Subscription cancellation working
- [ ] Invoice generation working
- [ ] Refunds working (if applicable)

### 3. Live Mode Products Created
- [ ] STARTER plan created ($29/month)
- [ ] PRO plan created ($79/month)
- [ ] BUSINESS plan created ($99/month)
- [ ] Price IDs documented

---

## 🔑 Step 1: Obtain Live API Keys

### 1.1 Get Live Keys from Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Toggle from "Test mode" to "Live mode" (top right)
3. Navigate to **Developers > API keys**
4. Copy the following keys:
   - **Publishable key:** `pk_live_...`
   - **Secret key:** `sk_live_...` (click "Reveal live key token")

### 1.2 Get Live Webhook Secret
1. Navigate to **Developers > Webhooks**
2. Click on your webhook endpoint
3. Click "Reveal" next to "Signing secret"
4. Copy the webhook secret: `whsec_...`

---

## 📝 Step 2: Update Environment Variables

### 2.1 Backend (.env for API)
```bash
# OLD (Test Mode)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."

# NEW (Live Mode)
STRIPE_SECRET_KEY="sk_live_51QVlqH62BJnrL0SqhxPWQECxBXzYqELKLpNKlkxmQYTVDvqPPJJXXXXXXXXXXXX"
STRIPE_PUBLISHABLE_KEY="pk_live_51QVlqH62BJnrL0SqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
STRIPE_WEBHOOK_SECRET="whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### 2.2 Frontend (.env.local for Web)
```bash
# OLD (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# NEW (Live Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_51QVlqH62BJnrL0SqXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

### 2.3 Update Price IDs
Get live price IDs from Stripe Dashboard:

```bash
# In .env (API)
STRIPE_PRICE_STARTER="price_XXXXXXXXXXXXXXXXXX"  # Live STARTER price ID
STRIPE_PRICE_PRO="price_XXXXXXXXXXXXXXXXXX"      # Live PRO price ID
STRIPE_PRICE_BUSINESS="price_XXXXXXXXXXXXXXXXXX" # Live BUSINESS price ID
```

---

## 🔄 Step 3: Update Webhook Endpoint

### 3.1 Update Webhook URL in Stripe
1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click on your webhook endpoint
3. Update the endpoint URL to production:
   - **OLD:** `https://test-api.clipforge.ai/webhooks/stripe`
   - **NEW:** `https://api.clipforge.ai/webhooks/stripe`

### 3.2 Verify Webhook Events
Ensure the following events are selected:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

---

## 🚀 Step 4: Deploy Changes

### 4.1 Rebuild API with New Keys
```bash
# Stop API
docker-compose stop api

# Update .env with live keys
nano apps/api/.env

# Rebuild API
docker-compose build --no-cache api

# Start API
docker-compose up -d api

# Verify API is running
curl https://api.clipforge.ai/health
```

### 4.2 Rebuild Web with New Keys
```bash
# Stop Web
docker-compose stop web

# Update .env.local with live keys
nano apps/web/.env.local

# Rebuild Web
docker-compose build --no-cache web

# Start Web
docker-compose up -d web

# Verify Web is running
curl https://clipforge.ai
```

---

## ✅ Step 5: Test Live Mode

### 5.1 Test Subscription Creation
1. Go to https://clipforge.ai/pricing
2. Click "Upgrade to Starter"
3. Use a **REAL credit card** (will be charged)
4. Complete checkout
5. Verify:
   - [ ] Payment successful
   - [ ] Subscription created in Stripe Dashboard
   - [ ] User tier updated in database
   - [ ] Credits added to account
   - [ ] Welcome email sent

### 5.2 Test Webhook Delivery
1. Check API logs for webhook events:
```bash
docker logs clipforge-api --tail 100 | grep "webhook"
```

2. Verify in Stripe Dashboard:
   - Go to **Developers > Webhooks**
   - Click on webhook endpoint
   - Check "Recent deliveries"
   - All events should show "Success" (200 status)

### 5.3 Test Subscription Cancellation
1. Go to https://clipforge.ai/dashboard/billing
2. Click "Manage Billing"
3. Cancel subscription
4. Verify:
   - [ ] Cancellation successful
   - [ ] Subscription marked as "canceled" in Stripe
   - [ ] User retains access until period end
   - [ ] Cancellation email sent

---

## 🔍 Step 6: Verify Database Updates

### 6.1 Check Organization Record
```sql
-- Connect to database
docker exec -it clipforge-postgres psql -U postgres -d clipforge_prod

-- Check organization
SELECT 
  id, 
  name, 
  tier, 
  credits,
  "stripeCustomerId",
  "stripeSubscriptionId",
  "subscriptionStatus",
  "currentPeriodEnd"
FROM "Organization"
WHERE "stripeCustomerId" IS NOT NULL
ORDER BY "createdAt" DESC
LIMIT 5;
```

### 6.2 Check Credit Transactions
```sql
-- Check credit transactions
SELECT 
  id,
  "organizationId",
  amount,
  type,
  description,
  "createdAt"
FROM "CreditTransaction"
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## 🚨 Rollback Procedure

If issues occur, immediately rollback to test mode:

### 1. Stop Services
```bash
docker-compose stop api web
```

### 2. Revert Environment Variables
```bash
# Restore test mode keys in .env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Rebuild and Restart
```bash
docker-compose build --no-cache api web
docker-compose up -d api web
```

### 4. Refund Any Test Charges
1. Go to Stripe Dashboard
2. Find the test payment
3. Issue full refund
4. Contact customer to explain

---

## 📊 Post-Switch Monitoring

### Monitor for 24 Hours
- [ ] Check error logs every hour
- [ ] Monitor webhook delivery success rate (should be >99%)
- [ ] Monitor payment success rate (should be >95%)
- [ ] Check customer support emails
- [ ] Verify all subscriptions are active

### Key Metrics
```bash
# Check webhook success rate
# Go to Stripe Dashboard > Developers > Webhooks
# Should see >99% success rate

# Check payment success rate
# Go to Stripe Dashboard > Payments
# Should see >95% success rate

# Check API errors
docker logs clipforge-api --tail 1000 | grep -i "error\|stripe"
```

---

## 🎯 Success Criteria

- [x] Live API keys configured
- [x] Webhook endpoint updated
- [x] Test payment successful
- [x] Subscription created correctly
- [x] Database updated correctly
- [x] Webhooks delivering successfully
- [x] No errors in logs
- [x] Customer received confirmation email

---

## 📞 Support Contacts

**Stripe Support:**
- Email: support@stripe.com
- Phone: +1 (888) 926-2289
- Dashboard: https://dashboard.stripe.com

**Internal Team:**
- Engineering: engineering@clipforge.ai
- Support: support@clipforge.ai

---

## 📝 Notes

### Common Issues

**Issue 1: Webhook Not Receiving Events**
- **Solution:** Check webhook URL is correct and accessible
- **Verify:** `curl -X POST https://api.clipforge.ai/webhooks/stripe`

**Issue 2: Payment Fails with "Invalid API Key"**
- **Solution:** Ensure live keys are used, not test keys
- **Verify:** Check `.env` file has `sk_live_` not `sk_test_`

**Issue 3: Subscription Not Created in Database**
- **Solution:** Check webhook is processing `checkout.session.completed`
- **Verify:** Check API logs for webhook processing

**Issue 4: Customer Charged but No Access**
- **Solution:** Manually update database and grant access
- **SQL:**
```sql
UPDATE "Organization"
SET tier = 'STARTER', credits = 150
WHERE "stripeCustomerId" = 'cus_...';
```

---

## ✅ Completion Checklist

- [ ] Live API keys obtained and documented
- [ ] Environment variables updated (API + Web)
- [ ] Services rebuilt and restarted
- [ ] Webhook endpoint updated in Stripe
- [ ] Test payment completed successfully
- [ ] Database verified
- [ ] Webhooks delivering successfully
- [ ] No errors in logs
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Documentation updated

**Switched By:** _________________  
**Date:** _________________  
**Time:** _________________  
**Status:** ⬜ SUCCESS  ⬜ FAILED  ⬜ ROLLED BACK

**Notes:**
_______________________________________
_______________________________________
_______________________________________
