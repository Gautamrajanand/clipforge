# Mixpanel Setup Guide

**Date:** November 23, 2025  
**Purpose:** Configure conversion funnels and alerts in Mixpanel dashboard

---

## Prerequisites

✅ Mixpanel account created  
✅ Project token configured: `603fc822ee6a3bf68a426ab45a2dc99c`  
✅ Events tracking from frontend and backend  
✅ User identification via Clerk integration

---

## Step 1: Verify Events Are Tracking

### Access Mixpanel Dashboard
1. Go to https://mixpanel.com/
2. Log in to your account
3. Select your ClipForge project

### Check Live View
1. Click **"Live View"** in the left sidebar
2. You should see events streaming in real-time:
   - `dashboard_viewed`
   - `pricing_viewed`
   - `video_uploaded`
   - `project_created`
   - `clip_exported`
   - etc.

### Verify Event Properties
1. Click on any event in Live View
2. Check that properties are being captured:
   - `projectId`
   - `clipCount`
   - `aspectRatio`
   - `tier`
   - `creditsUsed`
   - etc.

---

## Step 2: Set Up Conversion Funnels

### Funnel 1: Signup → First Clip

**Goal:** Track how many users create their first clip within 24 hours  
**Target:** >50% completion

1. Click **"Funnels"** in the left sidebar
2. Click **"Create Funnel"**
3. Name: `Signup to First Clip`
4. Add steps:
   - Step 1: `user_signed_up`
   - Step 2: `dashboard_viewed`
   - Step 3: `video_uploaded` OR `video_imported_from_url`
   - Step 4: `project_created`
   - Step 5: `clips_detected`
   - Step 6: `clip_exported`
5. Set conversion window: **24 hours**
6. Click **"Save"**

**What to Monitor:**
- Overall conversion rate (target: >50%)
- Drop-off points (where users abandon)
- Time to complete each step
- Conversion by user properties (tier, signup source)

---

### Funnel 2: Free → Paid

**Goal:** Track upgrade conversion from FREE to paid tiers  
**Target:** >10% conversion

1. Click **"Create Funnel"**
2. Name: `Free to Paid Conversion`
3. Add steps:
   - Step 1: `upgrade_prompt_shown`
   - Step 2: `upgrade_prompt_clicked`
   - Step 3: `pricing_viewed`
   - Step 4: `checkout_initiated`
   - Step 5: `checkout_completed` (from webhook)
4. Set conversion window: **7 days**
5. Filter: `currentTier` = `FREE`
6. Click **"Save"**

**What to Monitor:**
- Upgrade prompt CTR (Step 1 → Step 2)
- Pricing page engagement (Step 2 → Step 3)
- Checkout initiation rate (Step 3 → Step 4)
- Payment completion rate (Step 4 → Step 5)
- Conversion by feature that triggered prompt

---

### Funnel 3: First → Second Export

**Goal:** Track user retention and repeat usage  
**Target:** >40% within 7 days

1. Click **"Create Funnel"**
2. Name: `First to Second Export`
3. Add steps:
   - Step 1: `clip_export_success` (first time)
   - Step 2: `dashboard_viewed` (return visit)
   - Step 3: `project_created` (new project)
   - Step 4: `clip_export_success` (second time)
4. Set conversion window: **7 days**
5. Click **"Save"**

**What to Monitor:**
- Return rate after first export
- Time between first and second export
- Project creation rate
- Export success rate

---

## Step 3: Set Up Retention Cohorts

### D1 Retention (Day 1)

1. Click **"Retention"** in the left sidebar
2. Click **"Create Retention Report"**
3. Name: `D1 Retention`
4. First event: `user_signed_up`
5. Return event: `dashboard_viewed` OR `project_created`
6. Time period: **1 day**
7. Click **"Save"**

**Target:** >40% of users return within 24 hours

---

### D7 Retention (Day 7)

1. Create another retention report
2. Name: `D7 Retention`
3. First event: `user_signed_up`
4. Return event: `dashboard_viewed` OR `clip_exported`
5. Time period: **7 days**
6. Click **"Save"**

**Target:** >20% of users return within 7 days

---

### D30 Retention (Day 30)

1. Create another retention report
2. Name: `D30 Retention`
3. First event: `user_signed_up`
4. Return event: `dashboard_viewed` OR `clip_exported`
5. Time period: **30 days**
6. Click **"Save"**

**Target:** >10% of users return within 30 days

---

## Step 4: Configure Alerts

### Alert 1: Low Signup to First Clip Conversion

1. Go to your **"Signup to First Clip"** funnel
2. Click **"Alerts"** button
3. Click **"Create Alert"**
4. Condition: `Overall conversion rate < 40%`
5. Check frequency: **Daily**
6. Notification: Email to your address
7. Click **"Save"**

---

### Alert 2: High Insufficient Credits Rate

1. Click **"Insights"** in the left sidebar
2. Create new insight: `credits_insufficient` event count
3. Click **"Alerts"**
4. Condition: `Event count > 50 per day`
5. Check frequency: **Daily**
6. Notification: Email
7. Click **"Save"**

**Why:** High insufficient credits = users hitting limits = upgrade opportunity

---

### Alert 3: Export Failure Rate

1. Create insight: `clip_export_failed` / `clip_exported` ratio
2. Click **"Alerts"**
3. Condition: `Failure rate > 5%`
4. Check frequency: **Hourly**
5. Notification: Email + Slack (if configured)
6. Click **"Save"**

**Why:** High failure rate = technical issues = poor user experience

---

### Alert 4: Upgrade Prompt CTR Drop

1. Create insight: `upgrade_prompt_clicked` / `upgrade_prompt_shown` ratio
2. Click **"Alerts"**
3. Condition: `CTR < 15%`
4. Check frequency: **Daily**
5. Notification: Email
6. Click **"Save"**

**Why:** Low CTR = prompts not compelling = need to improve messaging

---

## Step 5: Create Dashboard

### Main Metrics Dashboard

1. Click **"Boards"** in the left sidebar
2. Click **"Create Board"**
3. Name: `ClipForge - Main Metrics`
4. Add insights:

#### Activation Metrics
- **Time to First Clip** (median time from signup to first export)
- **% Users Who Upload** (within 24h of signup)
- **% Users Who Export** (within 24h of signup)

#### Conversion Metrics
- **Free → Paid Conversion Rate** (7-day window)
- **Upgrade Prompt CTR** (clicks / shows)
- **Checkout Completion Rate** (completed / initiated)

#### Engagement Metrics
- **DAU** (daily active users)
- **WAU** (weekly active users)
- **MAU** (monthly active users)
- **DAU/MAU Ratio** (stickiness)

#### Feature Usage
- **Upload Method Split** (file upload vs URL import)
- **Aspect Ratio Usage** (9:16, 16:9, 1:1, 4:5)
- **Caption Style Usage** (top 5 styles)

#### Error Tracking
- **Export Failure Rate** (failed / total)
- **Upload Failure Rate** (failed / total)
- **Insufficient Credits Rate** (per 100 users)

5. Arrange widgets in logical groups
6. Click **"Save"**

---

## Step 6: Set Up User Profiles

### Configure User Properties

1. Click **"Users"** in the left sidebar
2. Click **"User Profile Properties"**
3. Ensure these properties are tracked:
   - `userId` (from Clerk)
   - `email`
   - `tier` (FREE, STARTER, PRO, BUSINESS)
   - `signupDate`
   - `creditsRemaining`
   - `totalExports` (incremented on each export)

### Create User Segments

#### High-Value Users
1. Click **"Cohorts"**
2. Create cohort: `High-Value Users`
3. Criteria:
   - `tier` = `PRO` OR `BUSINESS`
   - `totalExports` > 10
4. Click **"Save"**

#### At-Risk Users
1. Create cohort: `At-Risk Users`
2. Criteria:
   - `tier` = `FREE`
   - `creditsRemaining` < 10
   - Last active > 7 days ago
4. Click **"Save"**

**Use:** Target these users with re-engagement campaigns

---

## Step 7: Weekly Review Process

### Every Monday Morning

1. **Check Funnels:**
   - Signup → First Clip conversion rate
   - Free → Paid conversion rate
   - First → Second Export rate

2. **Check Retention:**
   - D1, D7, D30 retention rates
   - Compare to previous week
   - Identify trends

3. **Check Alerts:**
   - Review any triggered alerts
   - Investigate root causes
   - Take action if needed

4. **Review Dashboard:**
   - Overall metrics health
   - Feature usage trends
   - Error rates

5. **Export Report:**
   - Create weekly summary
   - Share with team
   - Document insights

---

## Step 8: A/B Testing (Optional)

### Using PostHog Feature Flags

1. Go to PostHog dashboard
2. Create feature flag: `new_upgrade_prompt`
3. Set rollout: 50% of users
4. In Mixpanel, filter events by feature flag
5. Compare conversion rates between variants

**Example Test:**
- Control: Current upgrade prompt
- Variant: New upgrade prompt with different messaging
- Metric: Upgrade prompt CTR
- Duration: 2 weeks
- Winner: Variant with higher CTR

---

## Troubleshooting

### Events Not Showing Up

1. **Check Browser Console:**
   - Look for "Mixpanel initialized" message
   - Look for "Event tracked" messages
   - Check for errors

2. **Check Network Tab:**
   - Look for requests to `api.mixpanel.com`
   - Check request payload
   - Verify token is correct

3. **Check Mixpanel Live View:**
   - Events should appear within seconds
   - If not, check token configuration

### Events Missing Properties

1. **Check Event in Live View:**
   - Click on event
   - See which properties are missing

2. **Check Code:**
   - Verify property is being passed
   - Check property name matches exactly
   - Ensure value is not null/undefined

### Funnels Not Working

1. **Check Event Names:**
   - Must match exactly (case-sensitive)
   - Check for typos

2. **Check Conversion Window:**
   - May need to increase window
   - 24h for activation, 7d for conversion

3. **Check User Identification:**
   - Users must be identified
   - Check `userId` is being set

---

## Success Criteria

After setup, you should have:

- ✅ 3 conversion funnels configured
- ✅ 3 retention cohorts tracking
- ✅ 4 alerts monitoring key metrics
- ✅ 1 main dashboard with 15+ insights
- ✅ 2+ user segments for targeting
- ✅ Weekly review process established

---

## Next Steps

1. **Week 1:** Monitor data collection, verify accuracy
2. **Week 2:** Analyze funnel drop-offs, identify improvements
3. **Week 3:** Run first A/B test on upgrade prompts
4. **Week 4:** Optimize based on data, iterate

---

**Status:** Ready to configure  
**Time Required:** 2-3 hours for initial setup  
**Maintenance:** 30 min weekly review
