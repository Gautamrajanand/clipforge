# 📊 Analytics Enhancement Guide - Data-Driven PLG

**Goal:** Track every user action, measure PLG metrics, optimize conversion

---

## 🎯 Analytics Stack

### 1. Mixpanel (Already Integrated ✅)
**Purpose:** Event tracking, funnels, cohorts  
**Status:** Configured and working

### 2. PostHog (NEW - Recommended)
**Purpose:** Product analytics, feature flags, A/B testing, session replay  
**Why:** Open-source, privacy-friendly, powerful

### 3. Google Analytics 4 (NEW)
**Purpose:** Traffic analysis, SEO tracking  
**Why:** Industry standard, free

### 4. Hotjar (NEW)
**Purpose:** Heatmaps, session recordings, feedback  
**Why:** Understand user behavior visually

---

## 🚀 PostHog Setup (Recommended First)

### Installation

```bash
cd apps/web
npm install posthog-js
```

### Configuration

```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') posthog.debug();
      },
    });
  }
};

export default posthog;
```

### Provider Component

```typescript
// components/PostHogProvider.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog } from '@/lib/posthog';
import posthog from 'posthog-js';

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        '$current_url': url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

---

## 📈 Key Events to Track

### Activation Events

```typescript
// User signed up
posthog.capture('user_signed_up', {
  tier: 'FREE',
  referral_code: referralCode || null,
  signup_source: 'organic',
});

// First project created
posthog.capture('first_project_created', {
  video_duration: durationMinutes,
  upload_method: 'direct' | 'url',
});

// First clips viewed
posthog.capture('first_clips_viewed', {
  clip_count: clips.length,
  time_to_view: timeInSeconds,
});

// First export completed
posthog.capture('first_export_completed', {
  aspect_ratio: '9:16',
  caption_style: 'modern',
  time_to_export: timeInSeconds,
});
```

### Engagement Events

```typescript
// Video uploaded
posthog.capture('video_uploaded', {
  duration_minutes: duration,
  file_size_mb: fileSize,
  upload_method: method,
});

// Clips detected
posthog.capture('clips_detected', {
  clip_count: count,
  detection_time: timeInSeconds,
});

// Clip customized
posthog.capture('clip_customized', {
  aspect_ratio: ratio,
  caption_style: style,
  caption_color: color,
});

// Export started
posthog.capture('export_started', {
  clip_count: count,
  aspect_ratio: ratio,
  burn_captions: boolean,
});

// Export completed
posthog.capture('export_completed', {
  clip_count: count,
  processing_time: timeInSeconds,
  success: true,
});
```

### Conversion Events

```typescript
// Viewed pricing
posthog.capture('viewed_pricing', {
  current_tier: tier,
  credits_remaining: credits,
  trigger: 'navigation' | 'upgrade_modal' | 'banner',
});

// Started checkout
posthog.capture('checkout_started', {
  plan: 'STARTER' | 'PRO',
  price: 29 | 79,
  billing_cycle: 'monthly',
});

// Completed purchase
posthog.capture('purchase_completed', {
  plan: plan,
  price: price,
  payment_method: 'stripe' | 'razorpay',
});

// Upgrade modal shown
posthog.capture('upgrade_modal_shown', {
  trigger: 'credits_low' | 'credits_depleted' | 'feature_locked',
  credits_remaining: credits,
});

// Upgrade modal dismissed
posthog.capture('upgrade_modal_dismissed', {
  trigger: trigger,
  time_shown: seconds,
});
```

### Retention Events

```typescript
// User returned
posthog.capture('user_returned', {
  days_since_signup: days,
  days_since_last_visit: days,
  total_exports: count,
});

// Credits renewed
posthog.capture('credits_renewed', {
  tier: tier,
  credits_added: amount,
});

// Referral made
posthog.capture('referral_made', {
  referral_code: code,
  referred_user_id: userId,
});

// Referral completed
posthog.capture('referral_completed', {
  referral_code: code,
  credits_earned: 30,
});
```

### Churn Events

```typescript
// Cancellation started
posthog.capture('cancellation_started', {
  tier: tier,
  days_subscribed: days,
  total_exports: count,
});

// Cancellation completed
posthog.capture('cancellation_completed', {
  tier: tier,
  reason: reason,
  feedback: feedback,
});

// Reactivation
posthog.capture('subscription_reactivated', {
  tier: tier,
  days_since_cancel: days,
});
```

---

## 🎨 Feature Flags

Use PostHog feature flags for gradual rollouts:

```typescript
// Check if feature is enabled
const showNewOnboarding = posthog.isFeatureEnabled('new-onboarding-flow');

if (showNewOnboarding) {
  // Show new onboarding
} else {
  // Show old onboarding
}

// Track which variant user saw
posthog.capture('onboarding_shown', {
  variant: showNewOnboarding ? 'new' : 'old',
});
```

**Features to Flag:**
- New onboarding flow
- Upgrade modal variants
- Pricing page changes
- Caption style additions
- UI redesigns

---

## 🔬 A/B Tests

Test everything that impacts conversion:

### Test 1: Upgrade Modal Copy
```typescript
const modalVariant = posthog.getFeatureFlag('upgrade-modal-copy');

const copyVariants = {
  control: "You're running low on credits!",
  variant_a: "Don't let your momentum stop!",
  variant_b: "Keep creating viral clips!",
};

const title = copyVariants[modalVariant] || copyVariants.control;
```

### Test 2: Pricing Page Layout
```typescript
const pricingLayout = posthog.getFeatureFlag('pricing-layout');

// Track which layout converts better
posthog.capture('pricing_viewed', {
  layout: pricingLayout,
});
```

### Test 3: Onboarding Steps
```typescript
const onboardingSteps = posthog.getFeatureFlag('onboarding-steps');

// 3 steps vs 5 steps vs 7 steps
// Track completion rate for each
```

---

## 📊 Funnels to Track

### Activation Funnel
1. User signed up
2. First project created
3. First clips viewed
4. First export completed

**Target:** >50% completion

### Conversion Funnel
1. Viewed pricing
2. Started checkout
3. Completed purchase

**Target:** >10% conversion

### Retention Funnel
1. Day 1 return
2. Day 7 return
3. Day 30 return

**Target:** D1 >40%, D7 >20%, D30 >10%

---

## 🎯 Cohort Analysis

### By Signup Source
- Organic
- Referral
- Product Hunt
- Social media
- Paid ads

**Compare:** Activation rate, LTV, churn rate

### By First Action
- Uploaded video immediately
- Explored features first
- Watched tutorial
- Read docs

**Compare:** Which leads to best retention?

### By Tier
- FREE users
- STARTER users
- PRO users

**Compare:** Engagement, feature usage, satisfaction

---

## 📈 Dashboards to Create

### 1. PLG Health Dashboard
- Daily signups
- Activation rate (7-day)
- Conversion rate (FREE → PAID)
- Churn rate
- NPS score
- Viral coefficient (K-factor)

### 2. Product Usage Dashboard
- Daily active users (DAU)
- Weekly active users (WAU)
- Monthly active users (MAU)
- DAU/MAU ratio (stickiness)
- Feature adoption rates
- Average exports per user

### 3. Revenue Dashboard
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
- LTV:CAC ratio

### 4. Conversion Dashboard
- Upgrade modal impressions
- Upgrade modal conversions
- Pricing page views
- Checkout starts
- Checkout completions
- Conversion rate by trigger

---

## 🔍 Session Replay

Use PostHog session replay to watch user sessions:

```typescript
// Enable session replay
posthog.startSessionRecording();

// Tag important sessions
if (userCompletedPurchase) {
  posthog.capture('$session_tag', {
    tag: 'converted_user',
  });
}
```

**Watch for:**
- Where users get stuck
- Confusing UI elements
- Bugs and errors
- Unexpected behavior

---

## 🎨 Heatmaps (Hotjar)

### Setup Hotjar

```html
<!-- Add to layout.tsx -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

**Track:**
- Homepage heatmap
- Pricing page heatmap
- Dashboard heatmap
- Export flow heatmap

---

## 📊 Google Analytics 4

### Setup GA4

```typescript
// lib/gtag.ts
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url: string) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }: any) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

**Track:**
- Page views
- Traffic sources
- User demographics
- Device types
- Geographic data

---

## 🎯 Success Metrics

### Week 1 Goals
- 100+ events tracked per day
- All funnels configured
- First A/B test running
- Session replay enabled

### Month 1 Goals
- 10,000+ events tracked
- 5+ funnels analyzed
- 3+ A/B tests completed
- Clear insights on conversion

### Quarter 1 Goals
- Data-driven product decisions
- 20%+ improvement in activation
- 15%+ improvement in conversion
- 10%+ improvement in retention

---

## 💰 Cost Estimate

**PostHog:**
- Free: 1M events/month
- Paid: $0.00031 per event after 1M
- Estimated: $0-50/month

**Hotjar:**
- Free: 35 daily sessions
- Plus: $39/month (100 daily sessions)
- Estimated: $39/month

**Google Analytics:**
- Free: Unlimited

**Total: $39-89/month**

**ROI:** If analytics improves conversion by just 1%, it pays for itself 10x over.

---

## 🚀 Implementation Priority

### Phase 1 (Week 1) - CRITICAL
1. PostHog setup
2. Core events (signup, export, upgrade)
3. Activation funnel
4. Conversion funnel

### Phase 2 (Week 2) - HIGH
1. Feature flags
2. A/B tests
3. Session replay
4. Cohort analysis

### Phase 3 (Week 3) - MEDIUM
1. Hotjar heatmaps
2. GA4 setup
3. Advanced funnels
4. Custom dashboards

### Phase 4 (Week 4) - NICE-TO-HAVE
1. Advanced cohorts
2. Predictive analytics
3. Custom reports
4. Data exports

---

**Status:** Ready to implement! Start with PostHog for maximum impact 🚀
