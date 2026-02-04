# Render Environment Variables - REQUIRED

## Critical Missing Variables

The production API on Render is missing these **required** environment variables for Clerk authentication to work:

### Clerk Authentication (REQUIRED)
```bash
CLERK_SECRET_KEY=sk_test_HDxBd9tzinwO6dNNFbVdETXaFRGEzh8V13LuluC8wu
CLERK_PUBLISHABLE_KEY=pk_test_dW5iaWFzZWQtbW9zcXVpdG8tNjMuY2xlcmsuYWNjb3VudHMuZGV2JA
```

**Why needed:** The `ClerkAuthGuard` uses `@clerk/clerk-sdk-node` which requires `CLERK_SECRET_KEY` to verify JWT tokens and fetch user data from Clerk API.

**Without these:** All authenticated API endpoints return 401 Unauthorized, breaking:
- Credits loading
- Projects loading
- All user-specific functionality

## How to Add to Render

1. Go to https://dashboard.render.com
2. Select your `clipforge-api` service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add both variables above
6. Click **Save Changes** (this will trigger a redeploy)

## All Required Environment Variables for Render

```bash
# Database (already configured)
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require

# Redis (already configured)
REDIS_URL=redis://default:...@...upstash.io:6379

# Storage (already configured)
S3_ENDPOINT=https://...r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=clipforge
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# Clerk Authentication (MISSING - ADD THESE)
CLERK_SECRET_KEY=sk_test_HDxBd9tzinwO6dNNFbVdETXaFRGEzh8V13LuluC8wu
CLERK_PUBLISHABLE_KEY=pk_test_dW5iaWFzZWQtbW9zcXVpdG8tNjMuY2xlcmsuYWNjb3VudHMuZGV2JA

# ML Worker (already configured)
ML_WORKER_URL=http://ml-workers:8000

# API Configuration
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0

# OpenAI (for AI titles/descriptions)
OPENAI_API_KEY=...

# Email (Resend)
RESEND_API_KEY=...

# Stripe (for payments)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Razorpay (for India payments)
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

## Priority: Add Clerk Variables NOW

The two Clerk variables are **critical** and must be added immediately for the production app to work.

After adding them:
1. Render will auto-redeploy (takes ~5 minutes)
2. Test https://clipforge-seven.vercel.app/dashboard
3. Credits and projects should load correctly
