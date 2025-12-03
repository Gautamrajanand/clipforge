# 🚀 PLG Implementation Roadmap - World-Class Standard

**Mission**: Transform ClipForge into a self-selling product  
**Timeline**: 3 weeks to world-class PLG  
**Standard**: Podcastle-level UX, Slack-level onboarding, Calendly-level conversion

---

## 📅 **WEEK 1: FIX CRITICAL ISSUES**

### **Day 1-2: Fix Backend Infrastructure** ⚡

#### **1. Fix Clerk User Sync** (2 hours)
**Problem**: Users syncing with @clerk.local emails instead of real emails  
**Impact**: Admin access broken, user management impossible

**Files to Fix**:
- `apps/api/src/auth/clerk-sync.service.ts`

**Changes**:
```typescript
// Current: Using Clerk's internal email
email: clerkUser.emailAddresses[0]?.emailAddress

// Fix: Use primary email, fallback to first email
email: clerkUser.primaryEmailAddress?.emailAddress || 
       clerkUser.emailAddresses[0]?.emailAddress
```

**Test**: Sign out, sign in, check database has real email

---

#### **2. Fix Admin Dashboard Endpoint** (1 hour)
**Problem**: `/admin/dashboard` returns 404  
**Impact**: Can't see admin stats

**Files to Create/Fix**:
- `apps/api/src/admin/admin.controller.ts`

**Add Endpoint**:
```typescript
@Get('dashboard')
@UseGuards(ClerkAuthGuard, AdminGuard)
async getDashboardStats() {
  return {
    users: {
      total: await this.prisma.user.count(),
      active: await this.prisma.user.count({ 
        where: { lastActiveAt: { gte: new Date(Date.now() - 30*24*60*60*1000) } }
      }),
      paid: await this.prisma.organization.count({ where: { tier: { not: 'FREE' } } })
    },
    projects: {
      total: await this.prisma.project.count(),
      byStatus: await this.prisma.project.groupBy({ by: ['status'], _count: true })
    },
    revenue: {
      total: await this.calculateRevenue(),
      currency: 'USD'
    }
  };
}
```

---

#### **3. Fix Credits Calculation** (1 hour)
**Problem**: Showing 150/60 instead of 60/60  
**Impact**: Confusing UX, wrong limits

**Files to Fix**:
- `apps/api/src/credits/credits.service.ts`

**Investigation Needed**:
- Check Organization credits calculation
- Verify credit allocation logic
- Fix credit balance endpoint

---

#### **4. Fix Onboarding Content Endpoint** (1 hour)
**Problem**: `/v1/plg/content/onboarding` returns 404  
**Impact**: Onboarding modal doesn't show

**Files to Fix**:
- `apps/api/src/plg-content/plg-content.controller.ts`

**Add Route**:
```typescript
@Get('onboarding')
@Public()
async getOnboardingContent() {
  return this.plgContent.getOnboardingSteps();
}
```

---

#### **5. Fix Popup Trigger Logic** (2 hours)
**Problem**: Popups showing illogically (low credits when have 150)  
**Impact**: Annoying user experience

**Files to Fix**:
- `apps/web/app/dashboard/page.tsx`
- `apps/web/components/popups/DynamicPopup.tsx`

**Fix Logic**:
```typescript
// Current: if (data.balance < 10)
// Fix: Check against allocation, not hardcoded value
if (data.balance < data.allocation * 0.2) {
  setShowLowCreditsWarning(true);
}
```

---

### **Day 3-4: Fix Admin Panel** ⚡

#### **6. Fix NPS Overview Endpoint** (1 hour)
**Problem**: `/admin/plg/nps/overview` returns 404

**Files to Fix**:
- `apps/api/src/plg/nps/nps.controller.ts`

**Add Endpoint**:
```typescript
@Get('overview')
@UseGuards(ClerkAuthGuard, AdminGuard)
async getNPSOverview() {
  const responses = await this.prisma.npsResponse.findMany();
  const promoters = responses.filter(r => r.score >= 9).length;
  const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
  const detractors = responses.filter(r => r.score <= 6).length;
  
  return {
    npsScore: ((promoters - detractors) / responses.length) * 100,
    total: responses.length,
    promoters,
    passives,
    detractors
  };
}
```

---

#### **7. Fix Referral Overview Endpoint** (1 hour)
**Problem**: `/admin/plg/referrals/overview` returns 404

**Files to Fix**:
- `apps/api/src/plg/referrals/referrals.controller.ts`

---

#### **8. Fix Analytics Endpoints** (2 hours)
**Problem**: `/admin/analytics` and `/admin/analytics/timeseries` return 404

**Files to Fix**:
- `apps/api/src/admin/analytics.controller.ts`

---

### **Day 5: Testing & Validation** ✅

- Test all fixed endpoints
- Verify admin panel loads
- Check user sync works
- Validate credits display
- Test onboarding flow

---

## 📅 **WEEK 2: CORE PLG FEATURES**

### **Day 1-2: Onboarding Checklist** 🎯

#### **9. Create Onboarding Checklist Component** (4 hours)

**Files to Create**:
- `apps/web/components/onboarding/OnboardingChecklist.tsx`

**Features**:
```typescript
interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: () => void;
  icon: React.ReactNode;
}

const items = [
  { id: 'profile', title: 'Complete your profile', ... },
  { id: 'upload', title: 'Upload your first video', ... },
  { id: 'clip', title: 'Create your first clip', ... },
  { id: 'export', title: 'Export your first clip', ... },
  { id: 'invite', title: 'Invite a team member', ... }
];
```

**Design**: Collapsible widget in sidebar, shows progress (3/5 complete)

---

#### **10. Track Checklist Progress** (2 hours)

**Files to Create**:
- `apps/api/src/onboarding/onboarding.service.ts`

**API Endpoints**:
- `GET /v1/onboarding/progress` - Get user's progress
- `POST /v1/onboarding/progress` - Update progress

**Database**:
- Use existing `OnboardingProgress` table

---

### **Day 3: Empty State Improvements** 🎨

#### **11. Create Beautiful Empty States** (4 hours)

**Files to Fix**:
- `apps/web/app/dashboard/page.tsx`

**Add**:
- Illustration (use Undraw or similar)
- Clear CTA: "Upload Your First Video"
- Value proposition: "Create viral clips in minutes"
- Quick start guide: "1. Upload → 2. AI Clips → 3. Export"

**Design Reference**: Podcastle's empty states

---

#### **12. Add Contextual Tooltips** (3 hours)

**Library**: Add `react-joyride` or `intro.js`

**Tooltips for**:
- Upload button
- AI Clips feature
- Export options
- Credits display
- Upgrade button

---

### **Day 4-5: Upgrade Value Proposition** 💎

#### **13. Create Upgrade Modal** (4 hours)

**Files to Fix**:
- `apps/web/components/upgrade-nudges/UpgradeModal.tsx`

**Must Include**:
- Clear headline: "Unlock Unlimited Clips"
- Feature comparison table (FREE vs PRO)
- Social proof: "Join 10,000+ creators"
- Testimonials (3-4 quotes)
- Pricing: Monthly vs Annual (show savings)
- Money-back guarantee badge
- CTA: "Start 14-Day Free Trial"

**Design**: Podcastle-style, beautiful, persuasive

---

#### **14. Add Pricing Page** (3 hours)

**Files to Create**:
- `apps/web/app/pricing/page.tsx`

**Sections**:
- Hero: "Plans for Every Creator"
- Pricing cards: FREE, STARTER, PRO, ENTERPRISE
- Feature comparison table
- FAQ section
- CTA: "Start Free Trial"

---

### **Day 5: Social Proof** ⭐

#### **15. Add Testimonials Component** (2 hours)

**Files to Create**:
- `apps/web/components/social-proof/Testimonials.tsx`

**Content**:
- 6-8 customer testimonials
- Photos, names, titles
- Rotating carousel
- Star ratings

---

#### **16. Add Trust Badges** (1 hour)

**Files to Create**:
- `apps/web/components/social-proof/TrustBadges.tsx`

**Include**:
- "10,000+ Creators"
- "1M+ Clips Created"
- "4.8★ Rating"
- "Featured on Product Hunt"

---

## 📅 **WEEK 3: POLISH & OPTIMIZATION**

### **Day 1-2: Referral System UI** 🎁

#### **17. Create Referral Dashboard** (6 hours)

**Files to Create**:
- `apps/web/app/dashboard/referrals/page.tsx`
- `apps/web/components/referrals/ReferralWidget.tsx`

**Features**:
- Referral link (copy button)
- Share buttons (Twitter, LinkedIn, Email)
- Referral stats (invited, signed up, converted)
- Reward tracker (credits earned)
- Leaderboard (top referrers)

**Design**: Gamified, fun, engaging

---

#### **18. Add Referral Sidebar Widget** (2 hours)

**Files to Fix**:
- `apps/web/components/layout/Sidebar.tsx`

**Widget**:
- Compact referral link
- "Invite Friends, Get 50 Credits"
- Quick share buttons

---

### **Day 3: Email Campaigns** 📧

#### **19. Set Up Email Infrastructure** (4 hours)

**Tools**: Resend or SendGrid

**Files to Create**:
- `apps/api/src/email/email.service.ts`
- `apps/api/src/email/templates/`

**Templates**:
- Welcome email
- Onboarding day 1, 2, 3, 7
- First clip celebration
- Re-engagement (inactive users)
- Trial ending reminder
- Upgrade nudge

---

#### **20. Create Email Scheduler** (3 hours)

**Files to Create**:
- `apps/api/src/email/email-scheduler.service.ts`

**Use**: Bull queue or similar for scheduling

---

### **Day 4: Design Polish** 🎨

#### **21. Improve Dashboard Design** (4 hours)

**Changes**:
- Add whitespace
- Improve color scheme
- Add micro-interactions
- Smooth animations
- Better typography
- Consistent spacing

**Reference**: Podcastle dashboard

---

#### **22. Add Loading Skeletons** (2 hours)

**Replace**: Spinners with skeleton screens

**Files to Fix**:
- All pages with loading states

**Library**: `react-loading-skeleton`

---

#### **23. Improve Error States** (2 hours)

**Replace**: Technical errors with friendly messages

**Examples**:
- "404 Not Found" → "Oops! We couldn't find that page"
- "500 Server Error" → "Something went wrong. We're on it!"

---

### **Day 5: Analytics & Testing** 📊

#### **24. Implement Key Event Tracking** (4 hours)

**Events to Track**:
- Onboarding started
- Onboarding completed
- Onboarding step completed
- First video uploaded
- First clip created
- First export
- Upgrade clicked
- Upgrade completed
- Referral link shared
- Referral signup

**Files to Fix**:
- All components with user actions

---

#### **25. Set Up A/B Testing** (3 hours)

**Tool**: PostHog feature flags or similar

**Tests to Run**:
- Onboarding flow variants
- Upgrade modal copy
- Pricing display
- CTA button text

---

#### **26. Create Analytics Dashboard** (4 hours)

**Files to Create**:
- `apps/web/app/admin/analytics/page.tsx`

**Charts**:
- User growth (line chart)
- Activation funnel (funnel chart)
- Feature adoption (bar chart)
- Retention cohorts (cohort table)
- Revenue (line chart)

**Library**: Recharts or Chart.js

---

## 📊 **IMPLEMENTATION CHECKLIST**

### **Week 1: Critical Fixes** (40 hours)
- [ ] Fix Clerk user sync
- [ ] Fix admin dashboard endpoint
- [ ] Fix credits calculation
- [ ] Fix onboarding content endpoint
- [ ] Fix popup trigger logic
- [ ] Fix NPS overview endpoint
- [ ] Fix referral overview endpoint
- [ ] Fix analytics endpoints
- [ ] Testing & validation

### **Week 2: Core Features** (40 hours)
- [ ] Create onboarding checklist
- [ ] Track checklist progress
- [ ] Beautiful empty states
- [ ] Contextual tooltips
- [ ] Upgrade modal
- [ ] Pricing page
- [ ] Testimonials component
- [ ] Trust badges

### **Week 3: Polish** (40 hours)
- [ ] Referral dashboard
- [ ] Referral sidebar widget
- [ ] Email infrastructure
- [ ] Email scheduler
- [ ] Dashboard design polish
- [ ] Loading skeletons
- [ ] Error states
- [ ] Event tracking
- [ ] A/B testing setup
- [ ] Analytics dashboard

---

## 🎯 **SUCCESS METRICS**

### **After Week 1**:
- ✅ All critical bugs fixed
- ✅ Admin panel fully functional
- ✅ Onboarding showing correctly
- ✅ Credits displaying accurately

### **After Week 2**:
- ✅ 60%+ onboarding completion
- ✅ < 5 min time to first clip
- ✅ 40%+ activation rate

### **After Week 3**:
- ✅ 15%+ trial-to-paid conversion
- ✅ 80%+ monthly retention
- ✅ NPS > 50
- ✅ Viral coefficient > 0.5

---

## 🚀 **STARTING NOW**

I'll begin with **Week 1, Day 1** - fixing the critical backend issues.

**Next up**: Fix Clerk user sync to use real emails.
