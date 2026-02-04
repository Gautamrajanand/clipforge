# 🎯 Free Tier + Pro Tiering Implementation Plan

**Goal**: Production-ready free tier with credit system, project expiration, and upgrade paths  
**Timeline**: 4-6 weeks  
**Status**: Ready to implement

---

## 📊 Overview

### What We're Building

1. **Credit System** - Usage tracking, monthly refresh, transaction history
2. **Free Tier** - 60 credits/month, 48h expiration, watermarks
3. **Pro Tiers** - Starter ($9), Pro ($9.5), Business (custom)
4. **Dashboard** - Grid layout with pagination (like Opus Clip)
5. **Sidebar Navigation** - Calendar, Analytics, Social, Brand Kit, Subscription
6. **Pricing Page** - Three-tier pricing with feature comparison
7. **Expiration System** - Auto-expire free projects after 48h
8. **Upgrade Flows** - Seamless upgrade from free to paid

---

## 🏗️ Phase Breakdown

### **PHASE 1: Backend Foundation** (Week 1-2)
- Database schema for credits, transactions, subscriptions
- Credit calculation service
- Credit management (deduct, add, refresh)
- Project expiration logic
- API endpoints for credits

### **PHASE 2: Free Tier Features** (Week 2-3)
- Dashboard grid with pagination
- Credit balance display
- Upload with credit estimation
- Project expiration warnings
- Watermark on free exports

### **PHASE 3: Pro Tier Features** (Week 3-4)
- Pricing page
- Subscription management
- Stripe integration
- Remove watermark for paid users
- Social account connections
- Brand kit management

### **PHASE 4: UI/UX Polish** (Week 4-5)
- Sidebar navigation (Opus Clip style)
- Empty states
- Loading states
- Error handling
- Responsive design

### **PHASE 5: Testing & Launch** (Week 5-6)
- End-to-end testing
- Credit system testing
- Expiration testing
- Payment testing
- Production deployment

---

## 📋 Detailed Implementation

### PHASE 1: Backend Foundation

#### 1.1 Database Schema
**File**: `prisma/schema.prisma`

**New Models**:
- `CreditTransaction` - Track all credit movements
- `BrandTemplate` - Store brand assets
- `SocialAccount` - Connected social media accounts

**Updated Models**:
- `User` - Add credit fields, plan type, subscription
- `Project` - Add expiration, credit cost

**New Enums**:
- `PlanType`: FREE, STARTER, PRO, BUSINESS
- `SubscriptionStatus`: ACTIVE, INACTIVE, PAST_DUE, CANCELED
- `TransactionType`: MONTHLY_REFRESH, PURCHASE, USAGE, REFUND
- `SocialPlatform`: YOUTUBE, TIKTOK, INSTAGRAM, FACEBOOK, TWITTER, LINKEDIN

#### 1.2 Credit Costs Configuration
**File**: `apps/api/src/credits/credits.config.ts`

**Pricing Structure**:
- Base: 1 credit/min (minimum 5)
- AI Subtitles: +2 credits/min
- AI Reframe: +1 credit/min
- Remove Watermark: +10 credits (one-time)
- Export Full Video: +2 credits

**Plan Allocations**:
- FREE: 60 credits/month
- STARTER: 150 credits/month
- PRO: 300 credits/month (3600/year)
- BUSINESS: Custom

#### 1.3 Services to Create
1. `CreditsCalculatorService` - Calculate costs
2. `CreditsService` - Manage balances
3. `ProjectExpirationService` - Handle expiration
4. `SubscriptionService` - Stripe integration

#### 1.4 API Endpoints
- `GET /v1/credits/balance` - Get current balance
- `GET /v1/credits/history` - Transaction history
- `POST /v1/credits/estimate` - Estimate project cost
- `GET /v1/pricing` - Get pricing tiers
- `POST /v1/subscription/create` - Create subscription
- `POST /v1/subscription/cancel` - Cancel subscription

---

### PHASE 2: Free Tier Features

#### 2.1 Dashboard Grid
**File**: `apps/web/app/dashboard/page.tsx`

**Features**:
- 4-column grid (responsive: 1/2/3/4 cols)
- Pagination (12 items per page)
- Project cards with thumbnails
- Status badges (READY, TRANSCRIBING, etc.)
- Expiration countdown
- Credit cost display

#### 2.2 Credit Balance Component
**File**: `apps/web/components/CreditBalance.tsx`

**Display**:
- Current balance (e.g., "42 credits")
- Next refresh date
- "Add credits" button for free users
- Dropdown with transaction history

#### 2.3 Upload with Cost Estimation
**File**: `apps/web/components/UploadModal.tsx`

**Features**:
- Show estimated cost before upload
- Feature checkboxes (AI Subtitles, AI Reframe)
- Real-time cost calculation
- Insufficient credits warning
- Upgrade prompt if needed

#### 2.4 Expiration Warnings
**File**: `apps/web/components/ExpirationWarning.tsx`

**Warnings**:
- < 24h: Red banner "Expires in Xh"
- < 12h: Email notification
- Expired: "Upgrade to restore" message

#### 2.5 Watermark System
**File**: `apps/api/src/video/watermark.service.ts`

**Implementation**:
- Add "Made with ClipForge" watermark for free users
- Position: Bottom-right corner
- Opacity: 70%
- Remove for paid plans

---

### PHASE 3: Pro Tier Features

#### 3.1 Pricing Page
**File**: `apps/web/app/pricing/page.tsx`

**Layout** (Opus Clip style):
- Three cards: Starter, Pro, Business
- Monthly/Yearly toggle (save 50%)
- Feature comparison table
- "Start Free Trial" buttons
- "Contact us" for Business

**Features to Highlight**:
- FREE: 60 credits, watermark, 48h expiration
- STARTER: 150 credits, no watermark, no expiration
- PRO: 300 credits, team features, social scheduler
- BUSINESS: Custom credits, API access, dedicated support

#### 3.2 Subscription Management
**File**: `apps/web/app/subscription/page.tsx`

**Features**:
- Current plan display
- Usage stats (credits used this month)
- Billing history
- Upgrade/downgrade options
- Cancel subscription

#### 3.3 Stripe Integration
**File**: `apps/api/src/subscription/stripe.service.ts`

**Webhooks**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Actions**:
- Create customer
- Create subscription
- Update plan
- Cancel subscription
- Handle failed payments

#### 3.4 Social Account Connections
**File**: `apps/web/app/social/page.tsx`

**Platforms** (Pro only):
- YouTube (OAuth)
- TikTok (OAuth)
- Instagram (Meta API)
- Facebook (Meta API)
- Twitter/X (OAuth 2.0)
- LinkedIn (OAuth)

**Features**:
- Connect/disconnect accounts
- Auto-post clips
- Schedule posts
- View analytics

#### 3.5 Brand Kit
**File**: `apps/web/app/brand-kit/page.tsx`

**Assets** (Podcastle style):
- Logo upload (4 variants)
- Color palette (2 colors for free, unlimited for pro)
- Font upload (1 for free, unlimited for pro)
- Intro/outro videos
- Background images
- Audio assets

---

### PHASE 4: UI/UX Polish

#### 4.1 Sidebar Navigation
**File**: `apps/web/components/Sidebar.tsx`

**Structure** (Opus Clip style):
```
Create
  - Home
  - Projects
  - Recordings (Pro)
  - Recording planner (Pro)
  - Brand Kit (Pro)

Post
  - Calendar
  - Analytics (Pro)
  - Social accounts (Pro)

[Bottom]
  - Subscription
  - Learning center
  - Help center
```

**Behavior**:
- Free users see "Pro" badge
- Clicking Pro items → Pricing page
- Active state highlighting
- Collapsible on mobile

#### 4.2 Empty States
**Components**:
- No projects: "Upload your first video"
- No clips: "Generate clips to get started"
- No social accounts: "Connect your accounts"
- No brand assets: "Build your brand kit"

#### 4.3 Loading States
**Components**:
- Skeleton loaders for grids
- Progress bars for uploads
- Spinners for processing
- Shimmer effects

#### 4.4 Error Handling
**Scenarios**:
- Insufficient credits → Upgrade prompt
- Upload failed → Retry button
- Processing failed → Support link
- Payment failed → Update payment method

---

### PHASE 5: Testing & Launch

#### 5.1 Testing Checklist

**Credit System**:
- [ ] Credits deducted correctly
- [ ] Monthly refresh works
- [ ] Transaction history accurate
- [ ] Insufficient credits handled

**Expiration**:
- [ ] Free projects expire after 48h
- [ ] Paid projects never expire
- [ ] Warnings sent at 12h
- [ ] Files cleaned up after 7 days

**Payments**:
- [ ] Stripe checkout works
- [ ] Webhooks processed
- [ ] Plan upgrades/downgrades
- [ ] Cancellations handled

**Features**:
- [ ] Watermark on free exports
- [ ] No watermark on paid exports
- [ ] Social connections (Pro)
- [ ] Brand kit (Pro)

#### 5.2 Deployment

**Steps**:
1. Run migrations on production DB
2. Deploy API with new endpoints
3. Deploy web with new UI
4. Set up Stripe webhooks
5. Configure cron jobs
6. Monitor for errors

**Cron Jobs**:
- Monthly credit refresh (1st of month)
- Mark expired projects (hourly)
- Send expiration warnings (daily)
- Cleanup expired files (daily)

---

## 🎯 Success Metrics

### Week 2
- [ ] Credit system working
- [ ] Projects expire correctly
- [ ] Dashboard grid functional

### Week 4
- [ ] Pricing page live
- [ ] Stripe integration working
- [ ] Pro features gated

### Week 6
- [ ] All features tested
- [ ] Production deployed
- [ ] First paying customer

---

## 📚 Files to Create/Modify

### Backend (API)
**New Files**:
- `src/credits/credits.config.ts`
- `src/credits/credits-calculator.service.ts`
- `src/credits/credits.service.ts`
- `src/credits/credits.controller.ts`
- `src/credits/credits.module.ts`
- `src/projects/project-expiration.service.ts`
- `src/subscription/stripe.service.ts`
- `src/subscription/subscription.controller.ts`
- `src/subscription/subscription.module.ts`
- `src/video/watermark.service.ts`

**Modified Files**:
- `prisma/schema.prisma`
- `src/projects/projects.service.ts`
- `src/projects/projects.controller.ts`

### Frontend (Web)
**New Files**:
- `app/dashboard/page.tsx`
- `app/pricing/page.tsx`
- `app/subscription/page.tsx`
- `app/social/page.tsx`
- `app/brand-kit/page.tsx`
- `components/Sidebar.tsx`
- `components/CreditBalance.tsx`
- `components/ProjectCard.tsx`
- `components/Pagination.tsx`
- `components/ExpirationWarning.tsx`
- `components/UpgradePrompt.tsx`
- `components/PricingCard.tsx`

**Modified Files**:
- `app/project/[id]/page.tsx`
- `components/UploadModal.tsx`

---

## 🚀 Next Steps

1. **Review this plan** - Confirm approach
2. **Start Phase 1** - Database schema + credit system
3. **Iterate weekly** - Ship working features each week
4. **Test continuously** - Don't wait until the end
5. **Launch incrementally** - Free tier first, then Pro features

Ready to start implementation?
