# Analytics Setup - Week 2 Day 8

**Date:** November 22, 2025  
**Status:** In Progress

---

## Analytics Stack

### **1. Mixpanel** 🎯 **Primary - Event Tracking**
- **Purpose:** User behavior, funnels, cohorts
- **Use Cases:**
  - Track user actions (upload, export, upgrade)
  - Conversion funnels (signup → first clip → export)
  - User retention (D1, D7, D30)
  - Feature adoption
  - A/B testing results

### **2. Google Analytics 4 (GA4)** 📈 **Secondary - Traffic**
- **Purpose:** Website traffic, acquisition
- **Use Cases:**
  - Traffic sources (organic, paid, referral)
  - Page views and sessions
  - Bounce rate and engagement
  - SEO performance
  - Marketing campaign tracking

### **3. PostHog** 🔬 **Tertiary - Product Analytics**
- **Purpose:** Feature flags, session replay, heatmaps
- **Use Cases:**
  - Session recordings (debug UX issues)
  - Feature flags (gradual rollouts)
  - Heatmaps (click tracking)
  - Funnel analysis
  - Self-hosted option (privacy)

---

## Key Events to Track

### **Authentication Events**
```typescript
- user_signed_up
- user_signed_in
- user_signed_out
```

### **Project Events**
```typescript
- project_created
- video_uploaded
- video_imported_from_url
- clips_detected
- clip_selected
- clip_exported
- project_deleted
```

### **Credit Events**
```typescript
- credits_deducted
- credits_added
- credits_insufficient
- credits_renewed
```

### **Payment Events**
```typescript
- checkout_initiated
- checkout_completed
- checkout_failed
- subscription_created
- subscription_upgraded
- subscription_downgraded
- subscription_canceled
```

### **Feature Usage Events**
```typescript
- ai_clips_used
- ai_subtitles_used
- ai_reframe_used
- caption_style_changed
- export_settings_changed
```

### **Engagement Events**
```typescript
- dashboard_viewed
- pricing_viewed
- help_clicked
- upgrade_prompt_shown
- upgrade_prompt_clicked
```

---

## Event Properties

### **User Properties** (Set Once)
```typescript
{
  userId: string,
  email: string,
  tier: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS',
  signupDate: Date,
  signupSource: string, // UTM parameters
}
```

### **Event Properties** (Per Event)
```typescript
{
  // Common
  timestamp: Date,
  sessionId: string,
  
  // Project specific
  projectId: string,
  projectType: 'CLIPS' | 'SUBTITLES' | 'REFRAME',
  videoDuration: number,
  
  // Credits specific
  creditsUsed: number,
  creditsRemaining: number,
  
  // Payment specific
  plan: string,
  amount: number,
  currency: string,
}
```

---

## Implementation Plan

### **Phase 1: Mixpanel Setup** ✅
1. Create Mixpanel account
2. Install `mixpanel-browser` package
3. Create analytics utility wrapper
4. Add to frontend layout
5. Track critical events

### **Phase 2: GA4 Setup** ✅
1. Create GA4 property
2. Install `react-ga4` package
3. Add GA4 script to `_document.tsx`
4. Track page views
5. Track custom events

### **Phase 3: PostHog Setup** 📅
1. Create PostHog account (or self-host)
2. Install `posthog-js` package
3. Initialize in frontend
4. Enable session recording
5. Set up feature flags

### **Phase 4: Backend Analytics** 📅
1. Create analytics service
2. Track server-side events
3. Send to Mixpanel/PostHog
4. Log critical actions

---

## Conversion Funnels

### **Signup to First Clip**
```
1. User signs up
2. User views dashboard
3. User clicks "AI Clips"
4. User uploads video
5. Clips detected
6. User exports first clip
```

**Target:** >50% completion within 24h

### **Free to Paid**
```
1. User hits credit limit
2. Upgrade prompt shown
3. User clicks upgrade
4. User views pricing
5. User clicks checkout
6. Payment completed
```

**Target:** >10% conversion

### **First Export to Second Export**
```
1. User exports first clip
2. User returns to dashboard
3. User creates new project
4. User exports second clip
```

**Target:** >40% within 7 days

---

## Retention Cohorts

### **Day 1 Retention**
- Users who return within 24h of signup
- **Target:** >40%

### **Day 7 Retention**
- Users who return within 7 days of signup
- **Target:** >20%

### **Day 30 Retention**
- Users who return within 30 days of signup
- **Target:** >10%

---

## Key Metrics Dashboard

### **Acquisition Metrics**
- Daily signups
- Signup source breakdown
- Cost per acquisition (CPA)
- Viral coefficient (K-factor)

### **Activation Metrics**
- % users who upload video (D1)
- % users who export clip (D1)
- Time to first clip
- Time to first export

### **Engagement Metrics**
- Daily active users (DAU)
- Weekly active users (WAU)
- Monthly active users (MAU)
- DAU/MAU ratio (stickiness)

### **Revenue Metrics**
- Monthly recurring revenue (MRR)
- Average revenue per user (ARPU)
- Lifetime value (LTV)
- Churn rate
- LTV:CAC ratio

### **Product Metrics**
- Clips generated per user
- Exports per user
- Credits used per user
- Feature adoption rates

---

## Analytics Tools Comparison

| Feature | Mixpanel | GA4 | PostHog |
|---------|----------|-----|---------|
| **Event Tracking** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Funnels** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cohorts** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Session Replay** | ❌ | ❌ | ⭐⭐⭐⭐⭐ |
| **Feature Flags** | ❌ | ❌ | ⭐⭐⭐⭐⭐ |
| **Heatmaps** | ❌ | ❌ | ⭐⭐⭐⭐ |
| **Free Tier** | 100K events/mo | Unlimited | 1M events/mo |
| **Privacy** | Cloud only | Cloud only | Self-hostable |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Privacy & Compliance

### **GDPR Compliance**
- ✅ Cookie consent banner
- ✅ Privacy policy page
- ✅ User data export
- ✅ User data deletion
- ✅ Opt-out mechanism

### **Data Retention**
- User events: 2 years
- Session recordings: 30 days
- Personal data: Until account deletion

### **Anonymization**
- Hash email addresses
- Remove PII from event properties
- Aggregate data for reporting

---

## Environment Variables

```bash
# Mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token

# Google Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Success Criteria

- ✅ Mixpanel tracking all critical events
- ✅ GA4 tracking page views and conversions
- ✅ PostHog session recording enabled
- ✅ Conversion funnels configured
- ✅ Retention cohorts set up
- ✅ Real-time dashboard accessible
- ✅ Privacy compliance implemented

---

## Next Steps

1. ✅ Create analytics utility wrapper
2. ✅ Install Mixpanel and GA4
3. ✅ Add tracking to critical flows
4. 📅 Set up PostHog (optional)
5. 📅 Create analytics dashboard
6. 📅 Configure alerts for key metrics

---

**Status:** Ready to implement
**Priority:** High (needed for launch)
