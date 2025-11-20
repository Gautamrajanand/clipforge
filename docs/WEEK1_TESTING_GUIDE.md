# Week 1 Testing Guide
## Monetization Core + API Foundation

This guide walks you through testing all Week 1 features to verify everything works correctly.

---

## 🚀 Prerequisites

### 1. Start All Services
```bash
cd /Users/gautamrajanand/CascadeProjects/windsurf-project
docker-compose up -d
```

### 2. Verify Services Running
```bash
docker ps
# Should see: postgres, redis, api, web, worker
```

### 3. Check API Health
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

---

## ✅ Test 1: Credit System

### A. Check Credit Balance (UI)
1. Open browser: `http://localhost:3001`
2. Login with your test account
3. Look at sidebar - should see credit balance widget
4. Click on credit widget → redirects to `/credits` page
5. Verify you see:
   - Current balance card
   - Credits per month card
   - Next reset date card
   - Transaction history table

### B. Check Credit Balance (API)
```bash
# Get your JWT token from localStorage in browser console:
# localStorage.getItem('token')

TOKEN="your-jwt-token-here"

curl http://localhost:3000/v1/credits/balance \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "balance": 60,
#   "creditsPerMonth": 60,
#   "nextReset": "2025-12-20T..."
# }
```

### C. Test Credit Deduction
1. Go to dashboard: `http://localhost:3001/dashboard`
2. Click "New Project"
3. Upload a video (any length)
4. Watch the upload process
5. Check logs for credit calculation:
```bash
docker logs clipforge-api --tail 50 | grep -i credit
# Should see: "Calculated X credits for Y seconds"
```
6. After upload completes, check credits page
7. Verify transaction appears in history with:
   - Type: "VIDEO_UPLOAD"
   - Amount: negative (deducted)
   - Balance before/after

### D. Test Insufficient Credits
1. Find your organization ID:
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT id, credits FROM \"Organization\";"
```

2. Manually set credits to 0:
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "UPDATE \"Organization\" SET credits = 0 WHERE id = 'your-org-id';"
```

3. Try to upload a video
4. Should see error: "Insufficient credits"
5. Reset credits back:
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "UPDATE \"Organization\" SET credits = 60 WHERE id = 'your-org-id';"
```

### E. Test Credit History Pagination
```bash
curl "http://localhost:3000/v1/credits/history?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Should return paginated transactions
```

---

## ✅ Test 2: Credit Renewal Cron

### A. Check Cron Jobs Registered
```bash
docker logs clipforge-api | grep -i "cron"
# Should see:
# - "Scheduling monthly credit renewal"
# - "Scheduling expired project cleanup"
# - "Scheduling low credit warnings"
```

### B. Manually Trigger Credit Renewal
1. Set reset date to past:
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "UPDATE \"Organization\" SET \"creditsResetDate\" = NOW() - INTERVAL '31 days' WHERE id = 'your-org-id';"
```

2. Wait for cron to run (runs daily at 2 AM) OR restart API to trigger check:
```bash
docker-compose restart api
sleep 10
docker logs clipforge-api --tail 30 | grep -i "renewal"
```

3. Check if credits were renewed:
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT credits, \"creditsResetDate\" FROM \"Organization\" WHERE id = 'your-org-id';"
```

### C. Test Expired Project Cleanup
1. Create a test project and set expiration to past:
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "UPDATE \"Project\" SET \"expiresAt\" = NOW() - INTERVAL '1 day' WHERE id = 'some-project-id';"
```

2. Wait for cron or restart API
3. Check logs:
```bash
docker logs clipforge-api | grep -i "expired"
# Should see: "Deleted X expired projects"
```

---

## ✅ Test 3: API Keys

### A. Create API Key (UI)
1. Go to: `http://localhost:3001/api-keys`
2. Click "Create API Key"
3. Enter name (optional): "Test Key"
4. Click "Create Key"
5. **IMPORTANT**: Copy the key immediately (starts with `cf_`)
6. Verify key appears in list with:
   - Name
   - Rate limit (10 req/min for FREE tier)
   - Quota (60 min/month)
   - Created date

### B. Create API Key (API)
```bash
curl -X POST http://localhost:3000/v1/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "API Test Key"}'

# Response includes the actual key (only shown once!)
# {
#   "id": "...",
#   "key": "cf_abc123...",
#   "name": "API Test Key",
#   "rateLimit": 10
# }
```

### C. Test API Key Authentication
```bash
# Use the API key you just created
API_KEY="cf_abc123..."

# This should work (using API key instead of JWT)
curl http://localhost:3000/v1/projects \
  -H "Authorization: Bearer $API_KEY"

# Should return your projects
```

### D. Test Rate Limiting
```bash
# Run this script to hit rate limit (10 req/min for FREE tier)
for i in {1..15}; do
  echo "Request $i:"
  curl -s http://localhost:3000/v1/projects \
    -H "Authorization: Bearer $API_KEY" \
    -I | grep -E "HTTP|X-RateLimit"
  sleep 1
done

# First 10 requests: HTTP 200
# After 10: HTTP 429 Too Many Requests
# Headers should show:
# X-RateLimit-Limit: 10
# X-RateLimit-Remaining: 0
# X-RateLimit-Reset: <timestamp>
```

### E. Test API Key Revocation
1. Go to `/api-keys` page
2. Click trash icon on a key
3. Confirm deletion
4. Try using that API key:
```bash
curl http://localhost:3000/v1/projects \
  -H "Authorization: Bearer $API_KEY"

# Should return: 401 Unauthorized
```

### F. Check API Key Stats
```bash
curl http://localhost:3000/v1/api-keys/stats \
  -H "Authorization: Bearer $TOKEN"

# Returns usage statistics for all your keys
```

---

## ✅ Test 4: Tier-Based Limits

### A. Verify FREE Tier Limits
```bash
# Check your current tier
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT tier, credits FROM \"Organization\" WHERE id = 'your-org-id';"

# FREE tier should have:
# - 60 credits per month
# - 1 API key max
# - 10 requests per minute
# - Projects expire after 2 days
```

### B. Test API Key Limit
1. Try creating 2nd API key (should fail for FREE tier)
2. Check error message: "Maximum API keys reached for your plan"

### C. Upgrade to PRO (Manual Test)
```bash
# Manually upgrade to PRO tier
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "UPDATE \"Organization\" SET tier = 'PRO', credits = 1000 WHERE id = 'your-org-id';"
```

1. Refresh `/api-keys` page
2. Should now show: "X / 10 keys" (can create up to 10)
3. Create a new API key
4. Test rate limit - should be 100 req/min now

### D. Test Watermark (FREE vs PRO)
**FREE Tier:**
1. Make sure you're on FREE tier
2. Upload a video and create clips
3. Export a clip
4. Download and check video - should have "Made with ClipForge" watermark

**PRO Tier:**
1. Upgrade to PRO (see above)
2. Upload a video and create clips
3. Export a clip
4. Download and check video - should have NO watermark

---

## ✅ Test 5: Payment Integration

### A. Check Pricing API
```bash
curl http://localhost:3000/v1/payments/pricing

# Should return pricing for all tiers in both USD and INR
```

### B. Test Billing Page (UI)
1. Go to: `http://localhost:3001/billing`
2. Verify you see:
   - Gateway selector (Global USD / India INR)
   - Interval toggle (Monthly / Yearly)
   - 3 pricing cards (STARTER / PRO / BUSINESS)
3. Toggle between gateways - prices should update
4. Toggle between monthly/yearly - prices should update

### C. Test Checkout Flow (Requires Stripe/Razorpay Setup)
**Note:** This requires actual Stripe/Razorpay API keys

1. Add test keys to `.env`:
```bash
# In apps/api/.env
STRIPE_SECRET_KEY="sk_test_..."
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

2. Restart API:
```bash
docker-compose restart api
```

3. Go to `/billing` page
4. Click "Get Started" on any plan
5. Should redirect to Stripe/Razorpay checkout
6. Use test card:
   - Stripe: `4242 4242 4242 4242`
   - Razorpay: `4111 1111 1111 1111`
7. Complete payment
8. Should redirect back to app
9. Check tier updated:
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT tier, \"stripeSubscriptionId\" FROM \"Organization\" WHERE id = 'your-org-id';"
```

### D. Test Webhooks (Advanced)
1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
stripe login
```

2. Forward webhooks:
```bash
stripe listen --forward-to localhost:3000/v1/payments/webhooks/stripe
```

3. Trigger test webhook:
```bash
stripe trigger checkout.session.completed
```

4. Check API logs:
```bash
docker logs clipforge-api --tail 20 | grep -i webhook
# Should see: "Stripe webhook: checkout.session.completed"
```

---

## ✅ Test 6: Database Integrity

### A. Check All Tables Exist
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "\dt"

# Should see tables:
# - Organization (with tier, credits, stripeCustomerId)
# - CreditTransaction
# - ApiKey
# - Project (with expiresAt, creditsUsed)
```

### B. Verify Credit Transactions
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT type, amount, \"balanceBefore\", \"balanceAfter\", description FROM \"CreditTransaction\" ORDER BY \"createdAt\" DESC LIMIT 5;"

# Should show recent transactions with proper balance tracking
```

### C. Check API Keys
```bash
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT name, \"rateLimit\", \"quotaMinutes\", \"lastUsedAt\" FROM \"ApiKey\";"

# Should show your API keys (keyHash is bcrypt encrypted)
```

---

## 🐛 Common Issues & Fixes

### Issue 1: API Not Starting
```bash
# Check logs
docker logs clipforge-api

# Common fixes:
docker-compose down
docker-compose up -d
```

### Issue 2: Database Connection Error
```bash
# Restart postgres
docker-compose restart postgres
sleep 5
docker-compose restart api
```

### Issue 3: Credits Not Deducting
```bash
# Check if CreditsService is loaded
docker logs clipforge-api | grep -i "CreditsService"

# Check if credits module is imported
docker logs clipforge-api | grep -i "CreditsModule"
```

### Issue 4: API Keys Not Working
```bash
# Verify ApiKeysModule is loaded
docker logs clipforge-api | grep -i "ApiKeysModule"

# Check if guards are registered
docker logs clipforge-api | grep -i "ApiKeyAuthGuard"
```

### Issue 5: Rate Limiting Not Working
```bash
# Check if RateLimitGuard is loaded
docker logs clipforge-api | grep -i "RateLimitGuard"

# Note: In-memory rate limiting only works on single instance
# For production, needs Redis
```

---

## 📊 Verification Checklist

Use this checklist to verify all features:

### Credit System
- [ ] Can view credit balance in sidebar
- [ ] Can view credit history page
- [ ] Credits deduct on video upload
- [ ] Insufficient credits blocks upload
- [ ] Transaction history shows all operations
- [ ] Pagination works on history page

### Credit Renewal
- [ ] Cron jobs registered on startup
- [ ] Monthly renewal works (test manually)
- [ ] Expired projects get deleted
- [ ] Low credit warnings logged

### API Keys
- [ ] Can create API key via UI
- [ ] Can create API key via API
- [ ] API key works for authentication
- [ ] Rate limiting enforces limits
- [ ] Can revoke API keys
- [ ] Tier limits enforced (1 key for FREE)

### Tier System
- [ ] FREE tier has correct limits
- [ ] PRO tier has correct limits
- [ ] Watermark shows on FREE tier
- [ ] Watermark removed on PRO tier
- [ ] Project expiration works (2 days for FREE)

### Payments
- [ ] Pricing API returns correct data
- [ ] Billing page displays correctly
- [ ] Gateway selector works
- [ ] Interval toggle works
- [ ] Checkout redirects to Stripe/Razorpay (with keys)
- [ ] Webhooks process correctly (with keys)

---

## 🎯 Quick Smoke Test (5 minutes)

Run this quick test to verify everything works:

```bash
# 1. Check services
docker ps | grep clipforge

# 2. Check API health
curl http://localhost:3000/health

# 3. Get JWT token from browser localStorage
# Open http://localhost:3001 → Login → Console:
# localStorage.getItem('token')

# 4. Test credit balance
curl http://localhost:3000/v1/credits/balance \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Test API key creation
curl -X POST http://localhost:3000/v1/api-keys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Smoke Test"}'

# 6. Test pricing API
curl http://localhost:3000/v1/payments/pricing

# 7. Open UI pages
# http://localhost:3001/credits
# http://localhost:3001/api-keys
# http://localhost:3001/billing
```

If all 7 steps work → **Week 1 is fully functional!** ✅

---

## 📞 Need Help?

- Check API logs: `docker logs clipforge-api --tail 100`
- Check database: `docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev`
- Restart services: `docker-compose restart`
- Full reset: `docker-compose down && docker-compose up -d`

---

**Last Updated:** November 20, 2025
