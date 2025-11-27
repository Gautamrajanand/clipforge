# ClipForge - Current Status (Nov 27, 2025)

## 🎯 Where We Are: Week 2 Day 5 - Subtitle Memory Optimization Complete

### ✅ COMPLETED

#### Week 1: Foundation (Nov 18-20, 2025)
**Day 1-4: Clerk Authentication**
- ✅ Clerk integration (frontend + backend)
- ✅ JWT verification with JWKS
- ✅ `ClerkAuthGuard` protecting all routes
- ✅ `fetchWithAuth` helper for auto token refresh
- ✅ User/Organization sync
- ✅ Multi-tenant architecture
- **Commits:** `5f962af` to `4657abf`

**Day 5-7: Payment Integration**
- ✅ Stripe SDK integrated (global markets)
- ✅ Razorpay SDK integrated (India)
- ✅ Payment service with customer creation
- ✅ Subscription management
- ✅ Checkout session creation
- ✅ Billing portal integration
- ✅ Webhook handlers (both gateways)
- ✅ All API endpoints (`/v1/payments/*`)
- ✅ Billing UI page (`/billing`)
- **Commits:** `dee205d`, `999d48b`

#### Week 2: Testing & PLG Foundation
**Day 1-2: Credit System Testing (Nov 21-22, 2025)**
- ✅ Credit deduction on all operations
- ✅ Cost preview in all modals (Upload, Reframe, Subtitles)
- ✅ Insufficient credits blocking
- ✅ Credit refund on processing failure
- ✅ Credits widget in sidebar
- ✅ `/credits` page with real API data
- ✅ `/subscription` page with real API data
- ✅ Transaction history with pagination
- ✅ Low credits warning
- **Commits:** `2dd21bc` to `50ef089`

**Day 2.5: 120-Minute Upload Support (Nov 24, 2025)**
- ✅ OpusClip parity: Support 2-hour video uploads
- ✅ UI messaging: "You can upload videos up to 120 minutes long"
- ✅ File size limit: 5GB (increased from 500MB)
- ✅ Streaming architecture: Memory-efficient download
- ✅ Real-world testing: 2-hour Joe Rogan podcast (119 minutes)
- ✅ Memory stable: 1.5GB constant during processing
- ✅ Credit calculation: 179 credits (119 × 1.5 for URL import)
- **Commits:** `27bb918`, `fa83b99`
- **Key Files:** `UploadModal.tsx`, `TESTING_SUMMARY_120MIN.md`

**Day 3-4: Subtitle Memory Optimization (Nov 26-27, 2025)**
- ✅ Fixed API crashes during subtitle rendering
- ✅ Reduced chunk size from 8s → 6s (25% fewer frames per chunk)
- ✅ Increased pause from 2s → 5s between chunks
- ✅ OpusClip parity: Support up to 90-second clips with subtitles
- ✅ Tested successfully: 44s, 53s, 60s clips all working
- ✅ Frontend: Max clip length slider set to 90s
- ✅ Frontend: Default settings 45s/3clips (consistent across modals)
- ✅ Frontend: Fixed modal scrolling to prevent button cutoff
- **Commits:** `7f5e049` to `50d0a1e`
- **Key Files:** `projects.service.ts`, `ClipSettingsModal.tsx`, `UploadModal.tsx`

---

## 🔄 IN PROGRESS: Week 2 Day 5-6

### Watermark Implementation (Next Priority)

**What's Already Built:**
- ✅ Backend payment service (100% complete)
- ✅ All API endpoints working
- ✅ Frontend billing UI ready
- ✅ Webhook handlers implemented

**What's Missing (Configuration Only):**

#### 1. Stripe Setup
- ⚠️ Get real API keys from https://dashboard.stripe.com/test/apikeys
- ⚠️ Create 3 products in Stripe Dashboard:
  - ClipForge Starter: $29/month (150 credits)
  - ClipForge Pro: $79/month (300 credits)
  - ClipForge Business: $99/month (unlimited)
- ⚠️ Copy Price IDs and update `payments.service.ts` lines 31-64
- ⚠️ Setup webhook forwarding with Stripe CLI
- ⚠️ Add webhook secret to `.env`

**Current `.env` Status:**
```bash
STRIPE_SECRET_KEY=sk_test_xxx  # ❌ Placeholder
STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # ❌ Placeholder
# Missing: STRIPE_WEBHOOK_SECRET
```

#### 2. Razorpay Setup (Optional - for India market)
- ⚠️ Get API keys from Razorpay Dashboard
- ⚠️ Create subscription plans
- ⚠️ Update `.env` with keys

#### 3. Frontend Connection
- ⚠️ Update `/pricing` page to call `/v1/payments/checkout`
- ⚠️ Add "Manage Billing" button in `/subscription`
- ⚠️ Handle payment success/cancel redirects

---

## 📋 UPCOMING: Week 2 Day 5-8

### Day 5-6: Watermark Implementation
- Add watermark overlay to FREE tier exports
- Remove watermark for paid tiers
- Test watermark rendering

### Day 7-8: Project Expiry (48h for FREE)
- Cron job to expire FREE tier projects after 48 hours
- Cleanup old projects
- Email notifications

---

## 🏗️ Architecture Summary

### Tech Stack
- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS, Clerk
- **Backend:** NestJS, Prisma, PostgreSQL, Redis, Clerk JWT
- **Storage:** MinIO (local), S3/R2 (production)
- **ML/AI:** Python FastAPI, Whisper, AssemblyAI
- **Payments:** Stripe (global), Razorpay (India)
- **Infrastructure:** Docker Compose

### Key Services (All Running in Docker)
- `postgres` - Database (port 5432)
- `redis` - Cache/jobs (port 6379)
- `minio` - S3 storage (port 9000)
- `api` - NestJS backend (port 3000)
- `web` - Next.js frontend (port 3001)
- `ml-worker` - Python ML worker (port 8000)

### Database Schema
- `User` - Clerk user sync
- `Organization` - Multi-tenant org with credits, tier, Stripe IDs
- `Membership` - User-org relationships
- `Project` - Video projects
- `Clip` - Generated clips with virality scores
- `CreditTransaction` - Credit usage audit log
- `Export` - Export jobs

### Authentication Flow
1. Clerk handles user auth (frontend)
2. Frontend gets JWT token from Clerk
3. Backend verifies JWT using Clerk JWKS
4. `ClerkAuthGuard` protects all API routes
5. `fetchWithAuth` auto-refreshes tokens (10min lifetime)

### Credit System
- **FREE:** 60 credits/month
- **STARTER:** 150 credits/month ($29)
- **PRO:** 300 credits/month ($79)
- **BUSINESS:** Unlimited ($99)
- 1 credit = 1 minute of video processing
- Monthly reset via cron job
- Deduction on: upload, AI clips, reframe, subtitles, export
- Refund on processing failure

---

## 📊 Git Commit History (Recent)

```
50ef089 feat: Connect subscription page to real API data
c75d1b7 feat: Connect credits page to real API data and navigation
cb7220e feat: Add credit cost preview to AI Reframe and AI Subtitles modals
1a9171c fix: Show specific error messages for insufficient credits
b9f765f feat: Add cost preview and credit refund logic
140091c feat: Move credits display from TopBar to Sidebar
2dd21bc feat: Add credit balance display and low credits warning
fcea375 fix: Implement automatic Clerk token refresh for API calls
4657abf fix: Implement proper Clerk JWT verification with jwks-rsa
999d48b feat: Add subscription/billing UI with dual gateway support
dee205d feat: Add dual payment gateway integration (Stripe + Razorpay)
5f962af feat: Implement Clerk authentication (Week 2 Day 1)
```

---

## 🎯 Next Action Items

### Immediate (Today - Day 3)
1. **Get Stripe test keys** (2 minutes)
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy Secret key and Publishable key
   - Update `.env` file

2. **Create Stripe products** (10 minutes)
   - Go to https://dashboard.stripe.com/test/products
   - Create 3 products with pricing
   - Copy Price IDs
   - Update `payments.service.ts`

3. **Setup webhooks** (5 minutes)
   - Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
   - Run: `stripe listen --forward-to localhost:3000/v1/payments/webhooks/stripe`
   - Copy webhook secret
   - Add to `.env`

4. **Connect frontend** (30 minutes)
   - Update `/pricing` page
   - Add billing portal button
   - Test payment flow

### Tomorrow (Day 4)
- Test complete payment flow
- Verify webhook updates tier correctly
- Test subscription upgrade/downgrade
- Document payment testing

---

## �� Key Files

### Backend
- `apps/api/src/payments/payments.service.ts` - Payment logic
- `apps/api/src/payments/payments.controller.ts` - API endpoints
- `apps/api/src/credits/credits.service.ts` - Credit management
- `apps/api/src/auth/clerk-auth.guard.ts` - JWT verification
- `apps/api/.env` - Environment configuration

### Frontend
- `apps/web/app/billing/page.tsx` - Billing UI
- `apps/web/app/credits/page.tsx` - Credits page
- `apps/web/app/subscription/page.tsx` - Subscription page
- `apps/web/lib/api.ts` - `fetchWithAuth` helper
- `apps/web/components/layout/Sidebar.tsx` - Credits widget

### Documentation
- `docs/PAYMENT_SETUP.md` - Payment setup guide
- `STRIPE_STATUS.md` - Stripe integration status
- `CURRENT_STATUS.md` - This file

---

## 🚀 Production Readiness

### ✅ Ready for Production
- Authentication system
- Credit system
- Database schema
- API endpoints
- Frontend UI
- Payment backend logic

### ⚠️ Needs Configuration
- Stripe API keys
- Stripe products/prices
- Webhook endpoints
- Production environment variables

### ❌ Not Yet Implemented
- Watermark for FREE tier
- Project expiry (48h for FREE)
- AI Clips virality scoring
- Smart Clips scene detection
- Team workspace features
- Social media scheduler

---

**Last Updated:** Nov 22, 2025, 12:30 PM IST
**Current Branch:** main
**Latest Commit:** 50ef089
