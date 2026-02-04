# Analytics Dashboard Specification

**Priority:** P2  
**Purpose:** Real-time PLG metrics monitoring for product and growth teams  
**Estimated Effort:** 3-5 days

---

## 📊 Overview

Build an admin analytics dashboard to monitor PLG funnel performance, user behavior, and conversion metrics in real-time.

**Access:** `/admin/analytics` (admin-only)

---

## 🎯 Key Metrics to Track

### 1. Acquisition Metrics

#### Signups
- **Total signups** (all-time, this month, this week, today)
- **Signup rate** (signups per day/week/month)
- **Signup source** breakdown (organic, referral, paid, etc.)
- **Signup conversion rate** (visitors → signups)

#### Traffic
- **Unique visitors** (daily, weekly, monthly)
- **Page views** (landing page, pricing, features)
- **Bounce rate** by page
- **Time on site** average

---

### 2. Activation Metrics (Most Important for PLG)

#### Onboarding Funnel
```
Signup → Survey → Welcome Modal → First Upload → First Clip → First Export
```

**Metrics:**
- **Survey completion rate** (% who complete vs skip)
- **Time to first upload** (median, p50, p90, p99)
- **Time to first clip** (aha moment timing)
- **Time to first export** (activation complete)
- **Drop-off rate** at each step

#### Feature Adoption
- **AI Clips usage** (% of users, clips per user)
- **AI Subtitles usage** (% of users, subtitle projects)
- **AI Reframe usage** (% of users, reframe projects)
- **Feature combination** (users using 2+, 3+ features)

#### Checklist Completion
- **Checklist completion rate** (% who complete all steps)
- **Average steps completed** (mean, median)
- **Time to complete checklist**
- **Most/least completed steps**

---

### 3. Engagement Metrics

#### Daily/Weekly/Monthly Active Users
- **DAU** (Daily Active Users)
- **WAU** (Weekly Active Users)
- **MAU** (Monthly Active Users)
- **DAU/MAU ratio** (stickiness)
- **WAU/MAU ratio**

#### Session Metrics
- **Average session duration**
- **Sessions per user** (daily, weekly)
- **Pages per session**
- **Return rate** (% who come back)

#### Feature Usage
- **Projects created** per user
- **Clips generated** per user
- **Exports completed** per user
- **Credits used** per user

---

### 4. Retention Metrics

#### Cohort Retention
- **Day 1 retention** (% who return next day)
- **Day 7 retention** (% who return after 1 week)
- **Day 30 retention** (% who return after 1 month)
- **Cohort analysis** (retention by signup month)

#### Churn
- **Churn rate** (% who don't return)
- **Churn by tier** (FREE vs paid)
- **Churn reasons** (if collected)
- **Time to churn** (days from signup)

---

### 5. Conversion Metrics (Revenue)

#### Trial to Paid
- **Trial conversion rate** (% who upgrade)
- **Time to conversion** (days from signup)
- **Conversion by feature usage** (correlation)
- **Conversion by onboarding completion**

#### Upgrade Flow
- **Pricing page views**
- **Checkout initiated** (% who start checkout)
- **Checkout completed** (% who finish)
- **Checkout abandonment rate**
- **Average order value**

#### Revenue
- **MRR** (Monthly Recurring Revenue)
- **ARR** (Annual Recurring Revenue)
- **Revenue per user** (ARPU)
- **Lifetime value** (LTV)
- **LTV/CAC ratio**

---

### 6. Product Metrics

#### Credits System
- **Average credits used** per user
- **Credits exhaustion rate** (% who run out)
- **Credits at upgrade** (how many left when upgrading)
- **Credit top-up rate** (% who buy more)

#### Project Metrics
- **Projects per user** (mean, median)
- **Project completion rate** (% with exports)
- **Project expiration rate** (FREE tier)
- **Average clips per project**

#### Export Metrics
- **Exports per user**
- **Export success rate** (% that complete)
- **Export formats** (MP4, etc.)
- **Export quality** (720p, 1080p, 4K)

---

### 7. Support Metrics

#### Intercom
- **Support conversations** (total, per user)
- **Response time** (median, p90)
- **Resolution time** (median, p90)
- **CSAT score** (customer satisfaction)

#### NPS
- **NPS score** (overall)
- **NPS by tier** (FREE vs paid)
- **NPS trend** (over time)
- **Promoters/Passives/Detractors** breakdown

---

## 🎨 Dashboard Layout

### Page 1: Overview (Default View)

```
┌─────────────────────────────────────────────────────────┐
│  Analytics Dashboard                    [Date Range ▼]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ Signups  │  │   DAU    │  │   MRR    │  │   NPS    ││
│  │   247    │  │   1,234  │  │  $12.5K  │  │    42    ││
│  │  +12%    │  │   +8%    │  │  +15%    │  │   +5     ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                          │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Activation Funnel                                   ││
│  │ Signup ─→ Survey ─→ Upload ─→ Clip ─→ Export       ││
│  │  100%     85%       72%       58%      45%          ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────┐│
│  │ Signups Over Time    │  │ Feature Adoption         ││
│  │ [Line Chart]         │  │ [Bar Chart]              ││
│  └──────────────────────┘  └──────────────────────────┘│
│                                                          │
│  ┌──────────────────────┐  ┌──────────────────────────┐│
│  │ Retention Cohorts    │  │ Revenue Trend            ││
│  │ [Heatmap]            │  │ [Area Chart]             ││
│  └──────────────────────┘  └──────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### Page 2: Acquisition

- Traffic sources breakdown
- Signup funnel
- Landing page performance
- Referral tracking
- Campaign performance

---

### Page 3: Activation

- Onboarding funnel (detailed)
- Time to aha moment distribution
- Feature adoption rates
- Checklist completion
- Drop-off analysis

---

### Page 4: Engagement

- DAU/WAU/MAU charts
- Session analytics
- Feature usage heatmap
- User segments
- Power users list

---

### Page 5: Retention

- Cohort retention table
- Churn analysis
- User lifecycle stages
- Re-engagement campaigns
- Win-back opportunities

---

### Page 6: Revenue

- MRR/ARR trends
- Conversion funnel
- Pricing tier distribution
- Upgrade flow analysis
- LTV/CAC metrics

---

## 🛠️ Technical Implementation

### Data Sources

1. **PostHog** (primary analytics)
   - User events
   - Funnels
   - Cohorts
   - Session recordings

2. **Mixpanel** (secondary analytics)
   - User profiles
   - Event tracking
   - A/B test results

3. **Database** (ClipForge DB)
   - User data
   - Project data
   - Credits data
   - Subscription data

4. **Stripe** (payment data)
   - Revenue
   - Subscriptions
   - Invoices
   - Customers

5. **Intercom** (support data)
   - Conversations
   - CSAT scores
   - Response times

---

### API Endpoints Needed

```typescript
// Overview metrics
GET /api/admin/analytics/overview
Response: {
  signups: { total, change, trend },
  dau: { total, change, trend },
  mrr: { total, change, trend },
  nps: { score, change, trend }
}

// Activation funnel
GET /api/admin/analytics/funnel
Response: {
  steps: [
    { name: 'Signup', count: 1000, rate: 100 },
    { name: 'Survey', count: 850, rate: 85 },
    { name: 'Upload', count: 720, rate: 72 },
    { name: 'Clip', count: 580, rate: 58 },
    { name: 'Export', count: 450, rate: 45 }
  ]
}

// Retention cohorts
GET /api/admin/analytics/retention
Response: {
  cohorts: [
    { month: '2025-01', d1: 60, d7: 45, d30: 30 },
    { month: '2025-02', d1: 65, d7: 48, d30: 32 },
    // ...
  ]
}

// Revenue metrics
GET /api/admin/analytics/revenue
Response: {
  mrr: 12500,
  arr: 150000,
  arpu: 25,
  ltv: 300,
  cac: 50,
  ltvCacRatio: 6
}
```

---

### Frontend Components

```typescript
// components/admin/analytics/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
}

// components/admin/analytics/FunnelChart.tsx
interface FunnelChartProps {
  steps: Array<{
    name: string;
    count: number;
    rate: number;
  }>;
}

// components/admin/analytics/RetentionHeatmap.tsx
interface RetentionHeatmapProps {
  cohorts: Array<{
    month: string;
    d1: number;
    d7: number;
    d30: number;
  }>;
}

// components/admin/analytics/RevenueChart.tsx
interface RevenueChartProps {
  data: Array<{
    date: string;
    mrr: number;
    arr: number;
  }>;
}
```

---

### Database Queries

```sql
-- Daily Active Users
SELECT COUNT(DISTINCT user_id) as dau
FROM events
WHERE DATE(created_at) = CURRENT_DATE;

-- Activation Funnel
WITH funnel AS (
  SELECT 
    user_id,
    MAX(CASE WHEN event = 'user_signed_up' THEN 1 ELSE 0 END) as signed_up,
    MAX(CASE WHEN event = 'survey_completed' THEN 1 ELSE 0 END) as completed_survey,
    MAX(CASE WHEN event = 'video_uploaded' THEN 1 ELSE 0 END) as uploaded_video,
    MAX(CASE WHEN event = 'clip_created' THEN 1 ELSE 0 END) as created_clip,
    MAX(CASE WHEN event = 'clip_exported' THEN 1 ELSE 0 END) as exported_clip
  FROM events
  WHERE created_at >= NOW() - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT 
  SUM(signed_up) as signups,
  SUM(completed_survey) as surveys,
  SUM(uploaded_video) as uploads,
  SUM(created_clip) as clips,
  SUM(exported_clip) as exports
FROM funnel;

-- Cohort Retention
WITH cohorts AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', created_at) as cohort_month
  FROM users
),
activity AS (
  SELECT 
    user_id,
    DATE(created_at) as activity_date
  FROM events
  GROUP BY user_id, DATE(created_at)
)
SELECT 
  c.cohort_month,
  COUNT(DISTINCT c.user_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN a.activity_date = c.cohort_month + INTERVAL '1 day' THEN c.user_id END) as d1_retention,
  COUNT(DISTINCT CASE WHEN a.activity_date = c.cohort_month + INTERVAL '7 days' THEN c.user_id END) as d7_retention,
  COUNT(DISTINCT CASE WHEN a.activity_date = c.cohort_month + INTERVAL '30 days' THEN c.user_id END) as d30_retention
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id
GROUP BY c.cohort_month
ORDER BY c.cohort_month DESC;
```

---

## 📊 Chart Libraries

**Recommended:** Recharts (React-friendly, customizable)

```bash
npm install recharts
```

**Alternative:** Chart.js, Victory, Nivo

---

## 🎨 UI/UX Considerations

### Design Principles
- **Clean and minimal** - Focus on data, not decoration
- **Scannable** - Key metrics at a glance
- **Interactive** - Click to drill down
- **Responsive** - Works on mobile/tablet
- **Fast** - Load in < 2 seconds

### Color Scheme
- **Positive trends:** Green (#10B981)
- **Negative trends:** Red (#EF4444)
- **Neutral:** Gray (#6B7280)
- **Primary:** Blue (#3B82F6)

### Date Range Selector
- Today
- Yesterday
- Last 7 days
- Last 30 days
- Last 90 days
- Custom range

---

## ✅ Success Criteria

Dashboard is successful when:
- ✅ All key metrics visible on one page
- ✅ Data refreshes in real-time (or near real-time)
- ✅ Drill-down functionality works
- ✅ Export to CSV/PDF available
- ✅ Mobile responsive
- ✅ Loads in < 2 seconds
- ✅ No data inconsistencies
- ✅ Admin-only access enforced

---

## 🚀 Implementation Phases

### Phase 1: Core Metrics (Week 1)
- [ ] Overview page with key metrics
- [ ] Activation funnel chart
- [ ] Basic API endpoints
- [ ] Database queries

### Phase 2: Detailed Views (Week 2)
- [ ] Acquisition page
- [ ] Engagement page
- [ ] Retention cohorts
- [ ] Revenue charts

### Phase 3: Advanced Features (Week 3)
- [ ] Real-time updates
- [ ] Export functionality
- [ ] Drill-down views
- [ ] User segments

### Phase 4: Polish (Week 4)
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Error handling
- [ ] Documentation

---

## 📚 Resources

- [PostHog Analytics](https://posthog.com/docs/product-analytics)
- [Mixpanel Reports](https://docs.mixpanel.com/docs/reports)
- [Recharts Documentation](https://recharts.org/en-US/)
- [PLG Metrics Guide](https://openviewpartners.com/product-led-growth-metrics/)

---

**Status:** Specification complete  
**Next Steps:** Review with team, prioritize features, start Phase 1  
**Owner:** Analytics/Engineering team  
**Timeline:** 3-4 weeks for full implementation
