# Mixpanel Quick Setup - 15 Minutes ⚡

**I'll walk you through this step-by-step. Just follow along!**

---

## Option 1: Automated Setup (Recommended) 🤖

### Step 1: Get Your API Credentials

1. Go to: https://mixpanel.com/settings/project
2. Log in if needed
3. Look for **"Project Settings"**
4. Copy these two values:
   - **Project ID** (looks like: `2891234`)
   - **API Secret** (looks like: `abc123def456...`)

### Step 2: Run the Setup Script

```bash
# Set your credentials
export MIXPANEL_PROJECT_ID="YOUR_PROJECT_ID_HERE"
export MIXPANEL_API_SECRET="YOUR_API_SECRET_HERE"

# Run the script
cd /Users/gautamrajanand/CascadeProjects/windsurf-project
node scripts/setup-mixpanel.js
```

**Done!** The script will create all 3 funnels automatically.

---

## Option 2: Manual Setup (If API doesn't work) 👆

### Part 1: Create Funnels (10 minutes)

#### Funnel 1: Signup to First Clip

1. Go to: https://mixpanel.com/
2. Click **"Funnels"** in left sidebar
3. Click **"+ Create Funnel"** button (top right)
4. Name: `Signup to First Clip`
5. Add steps (click "+ Add Step" for each):
   ```
   Step 1: user_signed_up
   Step 2: dashboard_viewed
   Step 3: video_uploaded
   Step 4: project_created
   Step 5: clips_detected
   Step 6: clip_exported
   ```
6. Set **"Conversion window"**: `24 hours`
7. Click **"Save"** (top right)

**✅ Done! Funnel 1 created.**

---

#### Funnel 2: Free to Paid

1. Click **"+ Create Funnel"** again
2. Name: `Free to Paid Conversion`
3. Add steps:
   ```
   Step 1: upgrade_prompt_shown
   Step 2: upgrade_prompt_clicked
   Step 3: pricing_viewed
   Step 4: checkout_initiated
   Step 5: checkout_completed
   ```
4. Set **"Conversion window"**: `7 days`
5. Click **"Add Filter"** (below steps)
6. Filter: `currentTier` = `FREE`
7. Click **"Save"**

**✅ Done! Funnel 2 created.**

---

#### Funnel 3: First to Second Export

1. Click **"+ Create Funnel"** again
2. Name: `First to Second Export`
3. Add steps:
   ```
   Step 1: clip_export_success
   Step 2: dashboard_viewed
   Step 3: project_created
   Step 4: clip_export_success
   ```
4. Set **"Conversion window"**: `7 days`
5. Click **"Save"**

**✅ Done! All 3 funnels created!**

---

### Part 2: Create Retention Reports (3 minutes)

#### D1 Retention

1. Click **"Retention"** in left sidebar
2. Click **"+ Create Report"**
3. Name: `D1 Retention`
4. **First event**: Select `user_signed_up`
5. **Return event**: Select `dashboard_viewed`
6. **Time period**: Select `1 day`
7. Click **"Save"**

**✅ D1 Retention created!**

---

#### D7 Retention

1. Click **"+ Create Report"** again
2. Name: `D7 Retention`
3. **First event**: `user_signed_up`
4. **Return event**: `clip_exported`
5. **Time period**: `7 days`
6. Click **"Save"**

**✅ D7 Retention created!**

---

#### D30 Retention

1. Click **"+ Create Report"** again
2. Name: `D30 Retention`
3. **First event**: `user_signed_up`
4. **Return event**: `dashboard_viewed`
5. **Time period**: `30 days`
6. Click **"Save"**

**✅ All retention reports created!**

---

### Part 3: Create Alerts (2 minutes)

#### Alert 1: Low Conversion

1. Go to your **"Signup to First Clip"** funnel
2. Click **"⋯"** (three dots, top right)
3. Click **"Create Alert"**
4. Condition: `Overall conversion rate` < `40%`
5. Check frequency: `Daily`
6. Email: Your email
7. Click **"Save"**

**✅ Alert created!**

---

#### Alert 2: High Insufficient Credits

1. Click **"Insights"** in left sidebar
2. Click **"+ New"**
3. Select event: `credits_insufficient`
4. Metric: `Total` (count)
5. Click **"⋯"** → **"Create Alert"**
6. Condition: `Count` > `50` per day
7. Check frequency: `Daily`
8. Click **"Save"**

**✅ Alert created!**

---

## Verification Checklist ✅

After setup, verify:

- [ ] Go to **"Funnels"** - See 3 funnels
- [ ] Go to **"Retention"** - See 3 retention reports
- [ ] Go to **"Alerts"** - See 2 alerts
- [ ] Go to **"Live View"** - See events streaming in

---

## What You'll See Immediately

### In Live View:
- Events streaming in real-time
- User properties being set
- Event properties being captured

### In Funnels:
- Conversion rates (may be 0% initially if no data yet)
- Drop-off points
- Time to convert

### In Retention:
- Cohort analysis
- Return rates
- Retention curves

---

## Troubleshooting

### "I don't see any events in Live View"

1. Open your ClipForge app: http://localhost:3001
2. Open browser console (F12)
3. Look for: `✅ Mixpanel initialized`
4. Navigate around (dashboard, pricing, etc.)
5. Look for: `📊 Event tracked: ...`
6. Go back to Mixpanel Live View
7. Events should appear within 5-10 seconds

### "I can't find the Funnels section"

1. Make sure you're in the right project
2. Look in the left sidebar
3. If not there, click **"Reports"** → **"Funnels"**

### "The API script failed"

1. Check your API credentials are correct
2. Make sure you have the right permissions
3. Try the manual setup instead (works 100% of the time)

---

## Next Steps

### After Setup (Week 1):
- Monitor data collection
- Verify events are tracking correctly
- Check funnel conversion rates

### After 1 Week:
- Analyze funnel drop-offs
- Identify improvement opportunities
- Run first A/B test

### After 1 Month:
- Review retention trends
- Optimize based on data
- Set up additional alerts

---

## Need Help?

If you get stuck:

1. **Check the detailed guide**: `MIXPANEL_SETUP_GUIDE.md`
2. **Mixpanel docs**: https://docs.mixpanel.com/
3. **Mixpanel support**: support@mixpanel.com

---

**Estimated Time:**
- Automated: 2 minutes
- Manual: 15 minutes

**Difficulty:** Easy (just follow the steps!)

**Status:** Ready to go! 🚀
