# Analytics Metrics Guide

## Overview
This document explains all SaaS metrics tracked in the ClipForge analytics dashboard and how they're calculated.

## Key Performance Indicators (KPIs)

### 1. MRR (Monthly Recurring Revenue)

**Definition**: Total predictable revenue generated per month from all active subscriptions.

**Formula**:
```
MRR = Σ (Active Paid Subscriptions × Monthly Price)
```

**Example**:
- 5 STARTER customers × $29 = $145
- 3 PRO customers × $79 = $237
- 1 BUSINESS customer × $99 = $99
- **Total MRR = $481**

**Why It Matters**:
- Primary revenue metric for SaaS businesses
- Predictable, recurring nature enables forecasting
- Key indicator for investors and stakeholders

**Target**: 
- Growth rate > 10% month-over-month
- Churn-adjusted MRR growth > 5%

---

### 2. ARR (Annual Recurring Revenue)

**Definition**: MRR multiplied by 12, representing annual revenue run rate.

**Formula**:
```
ARR = MRR × 12
```

**Example**:
- MRR = $481
- **ARR = $5,772**

**Why It Matters**:
- Used for annual planning and budgeting
- Key metric for Series A+ funding rounds
- Easier to communicate to non-technical stakeholders

---

### 3. Churn Rate

**Definition**: Percentage of customers who cancel or downgrade in a given period.

**Formula**:
```
Monthly Churn Rate = (Customers Lost / Total Customers at Start) × 100
```

**Example**:
- Started month with 100 customers
- Lost 5 customers
- **Churn Rate = 5%**

**Why It Matters**:
- Direct impact on growth and profitability
- High churn (>5%) indicates product/market fit issues
- Costs 5-25x more to acquire new customers than retain existing

**Benchmarks**:
- Excellent: < 2%
- Good: 2-5%
- Acceptable: 5-7%
- Poor: > 7%

**Types**:
- **Customer Churn**: Number of customers lost
- **Revenue Churn**: MRR lost from churned customers
- **Net Churn**: Includes expansion revenue (can be negative!)

---

### 4. LTV (Customer Lifetime Value)

**Definition**: Total revenue expected from a customer over their entire relationship.

**Formula**:
```
LTV = ARPU / Monthly Churn Rate
```

**Example**:
- ARPU = $54/month
- Monthly Churn = 3%
- **LTV = $54 / 0.03 = $1,800**

**Why It Matters**:
- Determines how much you can spend on acquisition
- Rule of thumb: LTV should be 3x CAC
- Higher LTV = more sustainable business

**Improvement Strategies**:
- Reduce churn (biggest impact)
- Increase ARPU through upsells
- Improve onboarding and engagement
- Add annual plans (reduces churn)

---

### 5. ARPU (Average Revenue Per User)

**Definition**: Average monthly revenue generated per paying customer.

**Formula**:
```
ARPU = Total MRR / Number of Paid Customers
```

**Example**:
- Total MRR = $481
- Paid Customers = 9
- **ARPU = $53.44**

**Why It Matters**:
- Indicates pricing effectiveness
- Helps segment customers by value
- Key input for LTV calculation

**Improvement Strategies**:
- Introduce higher-tier plans
- Add-on features and services
- Usage-based pricing
- Annual discounts (increases upfront revenue)

---

### 6. CAC (Customer Acquisition Cost)

**Definition**: Total cost to acquire a new customer.

**Formula**:
```
CAC = (Sales + Marketing Costs) / New Customers Acquired
```

**Example**:
- Monthly marketing spend = $5,000
- New customers = 50
- **CAC = $100**

**Why It Matters**:
- Must be < LTV/3 for sustainable growth
- Indicates marketing efficiency
- Key metric for scaling decisions

**Benchmarks**:
- LTV:CAC ratio should be > 3:1
- CAC payback period < 12 months

---

### 7. Growth Rate

**Definition**: Percentage increase in key metrics over time.

**Formula**:
```
Growth Rate = ((Current - Previous) / Previous) × 100
```

**Example**:
- Last month MRR = $400
- This month MRR = $481
- **Growth Rate = 20.25%**

**Why It Matters**:
- Indicates business momentum
- Required for venture funding
- Helps forecast future revenue

**Benchmarks**:
- Early stage: 10-20% monthly
- Growth stage: 5-10% monthly
- Mature: 2-5% monthly

---

### 8. Retention Rate

**Definition**: Percentage of customers who remain active over time.

**Formula**:
```
Retention Rate = (Customers at End - New Customers) / Customers at Start × 100
```

**Example**:
- Started with 100 customers
- Ended with 105 customers
- Added 10 new customers
- **Retention Rate = 95%**

**Why It Matters**:
- Inverse of churn
- Easier to understand (higher is better)
- Key indicator of product stickiness

**Cohort Analysis**:
- Track retention by signup month
- Identify patterns and trends
- Measure impact of product changes

---

## Advanced Metrics

### Net Revenue Retention (NRR)

**Formula**:
```
NRR = (Starting MRR + Expansion - Churn - Contraction) / Starting MRR × 100
```

**Target**: > 100% (indicates expansion revenue exceeds churn)

### Quick Ratio

**Formula**:
```
Quick Ratio = (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
```

**Target**: > 4 (indicates healthy growth)

### Magic Number

**Formula**:
```
Magic Number = Net New ARR / Sales & Marketing Spend
```

**Target**: > 0.75 (indicates efficient growth)

---

## Dashboard Metrics Explained

### Revenue Trend Chart
- **X-axis**: Date (last 7/30/90 days)
- **Y-axis**: Revenue ($)
- **Shows**: Daily cumulative revenue
- **Use**: Identify growth trends and seasonality

### User Growth Chart
- **Lines**: Total Users (green), Paid Customers (amber)
- **Shows**: User acquisition over time
- **Use**: Track conversion from free to paid

### Revenue by Tier (Pie Chart)
- **Segments**: Each paid tier
- **Shows**: Revenue distribution
- **Use**: Identify most valuable tiers

### Customers by Tier (Bar Chart)
- **Bars**: Customer count per tier
- **Shows**: Customer distribution
- **Use**: Identify popular tiers

### Cohort Retention Table
- **Rows**: Signup month
- **Columns**: Total signups, retained, retention %
- **Use**: Track long-term retention trends

---

## Metric Relationships

```
LTV = ARPU / Churn Rate
MRR Growth = New MRR + Expansion MRR - Churned MRR - Contraction MRR
ARR = MRR × 12
Retention Rate = 100% - Churn Rate
```

---

## Action Items by Metric

### If MRR is Flat
- Increase marketing spend
- Improve conversion rates
- Launch new features
- Reduce churn

### If Churn is High
- Improve onboarding
- Add customer success team
- Survey churned customers
- Fix product issues

### If LTV is Low
- Reduce churn (biggest impact)
- Increase prices
- Add upsell opportunities
- Improve product value

### If ARPU is Low
- Introduce higher tiers
- Add premium features
- Implement usage-based pricing
- Bundle services

---

## Reporting Best Practices

1. **Review metrics daily** - Catch issues early
2. **Track trends, not absolutes** - Look for patterns
3. **Segment by cohort** - Understand customer behavior
4. **Set targets** - Know what "good" looks like
5. **Share with team** - Align everyone on goals
6. **Act on insights** - Metrics without action are useless

---

## Data Sources

All metrics are calculated from:
- **User table**: User accounts and admin status
- **Organization table**: Tier, credits, creation date
- **CreditTransaction table**: Credit adjustments and usage
- **Membership table**: User-organization relationships

---

## Refresh Schedule

- **Real-time**: User counts, organization counts
- **On-demand**: All metrics recalculated on page load
- **Historical**: Time series data cached for performance

---

## Troubleshooting

### Metrics Don't Match Expectations
1. Check database for data integrity
2. Verify tier pricing in analytics service
3. Review calculation logic in `AnalyticsService`
4. Check for timezone issues in date filtering

### Charts Not Displaying
1. Ensure recharts is installed
2. Check browser console for errors
3. Verify API endpoints are responding
4. Confirm data format matches chart expectations

---

## Future Enhancements

- [ ] Predictive analytics (forecasting)
- [ ] Anomaly detection (alerts)
- [ ] Custom metric builder
- [ ] Automated reporting (email/Slack)
- [ ] Benchmarking against industry
- [ ] Revenue waterfall charts
- [ ] Funnel analysis
- [ ] Customer segmentation
