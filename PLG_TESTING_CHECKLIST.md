# PLG Growth Functionality - Systematic Testing Guide

**Date:** December 5, 2025 (Updated)  
**Status:** ✅ Onboarding Flow Complete - Ready for Testing  
**Purpose:** Test all PLG features end-to-end to ensure growth engine is working

---

## 🎉 Recent Updates (Dec 5, 2025)

### ✅ Completed Features
- **Onboarding Survey** - 3-step user profiling (role, goal, platforms)
- **Welcome Modal** - Feature overview with CTAs
- **Onboarding Checklist** - 5-step guided journey
- **Trial Banner** - Prominent 7-day trial display
- **Dashboard Spacing** - Optimized layout and visual hierarchy
- **Analytics Tracking** - Full event tracking for all onboarding actions

See `PLG_ONBOARDING_COMPLETE.md` for detailed documentation.

---

## Pre-Testing Setup

### ✅ Prerequisites
- [x] Backend API running on `localhost:3001`
- [x] Frontend running on `localhost:3000`
- [x] Database accessible (PostgreSQL)
- [x] Clerk authentication configured
- [ ] Clear browser session storage for fresh test
- [ ] Test user account ready (or create new one)

### ✅ Environment Check
```bash
# Check all services
docker-compose ps

# Expected services:
# - postgres (port 5432)
# - redis (port 6379)
# - minio (port 9000)
# - api (port 3000)
# - web (port 3001)
# - ml-worker (port 8000)
```

---

## 1️⃣ ONBOARDING FLOW ✅ COMPLETE

### Test: New User Onboarding
**Goal:** Verify smooth first-time user experience  
**Status:** ✅ Ready for Testing

#### Steps:
1. [ ] **Sign Up**
   - Navigate to `/sign-up`
   - Create new account (use test email)
   - Check redirect to dashboard

2. [ ] **Onboarding Survey** (NEW)
   - Verify survey appears after 500ms delay
   - **Step 1:** Select role (4 options)
   - **Step 2:** Select goal (4 options)
   - **Step 3:** Select platforms (multi-select, 6 options)
   - Verify progress bar updates (1/3, 2/3, 3/3)
   - Test "Back" button navigation
   - Test "Skip for now" option
   - Verify "Next" button only enabled when selection made
   - Check smooth animations between steps

3. [ ] **Welcome Modal**
   - Verify modal appears after survey completion/skip
   - Check modal shows:
     - Welcome message
     - 3 key features (Upload, AI Magic, Free Trial)
     - Credit information (150 credits)
     - "Try with Sample Video" button
     - "Upload My Own Video" button
   - Test both CTA buttons
   - Verify modal can be closed

3. [ ] **Onboarding Checklist**
   - Check checklist appears on dashboard
   - Verify 5 steps are visible:
     - [ ] Upload your first video
     - [ ] Create AI clips
     - [ ] Add captions
     - [ ] Reframe video
     - [ ] Export and share
   - Test step completion tracking

4. [ ] **Multi-Step Onboarding**
   - If implemented, test step-by-step guide
   - Verify tooltips and highlights
   - Test skip/next functionality

**Expected Results:**
- ✅ Smooth signup flow
- ✅ Welcome modal shows once
- ✅ Checklist visible and interactive
- ✅ Progress tracked correctly

**Analytics Events to Check:**
- `user_signed_up`
- `onboarding_started`
- `onboarding_step_completed`

---

## 2️⃣ TRIAL EXPERIENCE

### Test: FREE Tier Trial Banner
**Goal:** Verify trial messaging and upgrade prompts

#### Steps:
1. [ ] **Trial Banner Display**
   - Check banner appears at top of dashboard
   - Verify countdown shows correct days left
   - Test "Upgrade Now" button
   - Verify banner styling matches design

2. [ ] **Trial Limitations**
   - Check credit allocation (60 credits for FREE)
   - Verify project expiry (48 hours)
   - Test watermark on exports
   - Check feature gating (if any)

3. [ ] **Upgrade Prompts**
   - Test contextual upgrade messages
   - Verify upgrade CTA placement
   - Check pricing page link works

**Expected Results:**
- ✅ Trial banner visible and accurate
- ✅ Limitations enforced correctly
- ✅ Upgrade prompts clear and compelling

**Analytics Events:**
- `trial_banner_viewed`
- `upgrade_clicked`
- `pricing_page_viewed`

---

## 3️⃣ ANALYTICS INTEGRATION

### Test: PostHog & Mixpanel Tracking
**Goal:** Verify all user actions are tracked

#### Steps:
1. [ ] **PostHog Integration**
   - Open browser console
   - Check for PostHog initialization log
   - Perform actions (upload, create clips, etc.)
   - Verify events logged in console
   - Check PostHog dashboard for events

2. [ ] **Mixpanel Integration**
   - Check Mixpanel initialization log
   - Verify user identification
   - Test event tracking
   - Check Mixpanel dashboard

3. [ ] **Key Events to Test:**
   - [ ] Page views (`$pageview`)
   - [ ] User signup (`user_signed_up`)
   - [ ] Video upload (`video_uploaded`)
   - [ ] Clips created (`clips_created`)
   - [ ] Export completed (`export_completed`)
   - [ ] Upgrade clicked (`upgrade_clicked`)

**Expected Results:**
- ✅ Both analytics platforms initialized
- ✅ Events tracked in real-time
- ✅ User properties set correctly
- ✅ No tracking errors in console

**Check Console for:**
```
[PostHog.js] send "$pageview"
MIXPANEL REQUEST: [...]
✅ Mixpanel initialized
✅ PostHog initialized
```

---

## 4️⃣ INTERCOM INTEGRATION

### Test: Customer Support Widget
**Goal:** Verify Intercom messenger works

#### Steps:
1. [ ] **Widget Initialization**
   - Check Intercom widget appears (bottom-right)
   - Verify user data passed correctly
   - Test widget open/close

2. [ ] **User Identification**
   - Check console for Intercom boot log
   - Verify user email and name passed
   - Test custom attributes (tier, credits, etc.)

3. [ ] **Messaging**
   - Send test message
   - Verify message appears in Intercom dashboard
   - Test reply functionality

**Expected Results:**
- ✅ Widget visible and functional
- ✅ User identified correctly
- ✅ Messages sent/received successfully

**Check Console for:**
```
Intercom: Successfully booted with settings
```

---

## 5️⃣ NPS SURVEY

### Test: Net Promoter Score Widget
**Goal:** Verify NPS survey appears at right time

#### Steps:
1. [ ] **Survey Trigger**
   - Complete onboarding steps
   - Wait for trigger condition (e.g., 3 exports)
   - Verify NPS widget appears

2. [ ] **Survey Flow**
   - Test rating selection (0-10)
   - Provide feedback text
   - Submit survey
   - Verify thank you message

3. [ ] **Data Persistence**
   - Check database for NPS response
   - Verify survey doesn't show again
   - Test admin NPS dashboard

**Expected Results:**
- ✅ Survey appears at right time
- ✅ Smooth submission flow
- ✅ Data saved correctly
- ✅ No duplicate surveys

**Analytics Events:**
- `nps_survey_shown`
- `nps_survey_submitted`

---

## 6️⃣ REFERRAL PROGRAM

### Test: Referral System
**Goal:** Verify referral tracking and rewards

#### Steps:
1. [ ] **Referral Page**
   - Navigate to `/referrals`
   - Check referral link generation
   - Verify unique referral code

2. [ ] **Referral Tracking**
   - Copy referral link
   - Open in incognito/different browser
   - Sign up using referral link
   - Verify referral tracked

3. [ ] **Rewards**
   - Check referrer gets reward (credits/month)
   - Verify referee gets bonus
   - Test reward notification

**Expected Results:**
- ✅ Referral link works
- ✅ Tracking accurate
- ✅ Rewards granted correctly

**Database Check:**
```sql
SELECT * FROM "Referral" ORDER BY "createdAt" DESC LIMIT 10;
```

---

## 7️⃣ DYNAMIC POPUPS

### Test: Contextual Messaging
**Goal:** Verify popups appear at right moments

#### Steps:
1. [ ] **Low Credits Warning**
   - Use credits until < 10 remaining
   - Verify popup appears
   - Test "Upgrade" CTA

2. [ ] **Feature Discovery**
   - Complete first upload
   - Check for "Try AI Clips" popup
   - Test popup timing and dismissal

3. [ ] **Milestone Celebrations**
   - Complete first export
   - Verify celebration toast
   - Check confetti animation (if implemented)

**Expected Results:**
- ✅ Popups contextual and timely
- ✅ CTAs clear and functional
- ✅ Easy to dismiss

---

## 8️⃣ ADMIN PLG DASHBOARD

### Test: Admin Monitoring Tools
**Goal:** Verify admin can monitor PLG metrics

#### Steps:
1. [ ] **Access Admin Panel**
   - Navigate to `/admin`
   - Verify admin-only access
   - Check navigation menu

2. [ ] **PLG Metrics Dashboard**
   - Go to `/admin/plg`
   - Check key metrics display:
     - [ ] Total users
     - [ ] Active trials
     - [ ] Conversion rate
     - [ ] NPS score
     - [ ] Referral stats

3. [ ] **NPS Dashboard**
   - Navigate to `/admin/plg/nps`
   - Verify NPS responses listed
   - Check filtering and sorting

4. [ ] **Content Management**
   - Go to `/admin/plg/content`
   - Test popup content editing
   - Verify changes save

5. [ ] **Documentation**
   - Check `/admin/plg/documentation`
   - Verify PLG user journey diagram
   - Test table of contents navigation

**Expected Results:**
- ✅ Admin access controlled
- ✅ Metrics accurate and real-time
- ✅ Content management functional
- ✅ Documentation complete

---

## 9️⃣ SOCIAL SHARING

### Test: Viral Growth Features
**Goal:** Verify social sharing drives growth

#### Steps:
1. [ ] **Share Modal**
   - Complete export
   - Click "Share" button
   - Verify share modal appears

2. [ ] **Social Platforms**
   - Test Twitter share
   - Test LinkedIn share
   - Test Facebook share
   - Verify attribution links

3. [ ] **Watermark (FREE Tier)**
   - Export video as FREE user
   - Verify "Made with ClipForge" watermark
   - Check watermark placement and style

**Expected Results:**
- ✅ Share modal functional
- ✅ Social links work correctly
- ✅ Watermark visible on FREE exports
- ✅ Attribution tracked

**Analytics Events:**
- `share_clicked`
- `social_share_completed`

---

## 🔟 UPGRADE FLOW

### Test: Conversion Funnel
**Goal:** Verify smooth upgrade to paid tier

#### Steps:
1. [ ] **Pricing Page**
   - Navigate to `/pricing`
   - Verify all tiers displayed
   - Check feature comparison
   - Test "Upgrade" buttons

2. [ ] **Checkout Flow**
   - Click "Upgrade to STARTER"
   - Verify Stripe checkout opens
   - Test payment form (use test card)
   - Complete purchase

3. [ ] **Post-Upgrade**
   - Verify tier updated in database
   - Check credits increased
   - Confirm watermark removed
   - Test new features unlocked

**Expected Results:**
- ✅ Pricing clear and compelling
- ✅ Checkout smooth and secure
- ✅ Upgrade reflected immediately
- ✅ Features unlocked correctly

**Test Cards (Stripe):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## 📊 ANALYTICS VERIFICATION

### PostHog Dashboard Check
1. Log into PostHog
2. Check recent events
3. Verify user properties
4. Test funnels and cohorts

### Mixpanel Dashboard Check
1. Log into Mixpanel
2. Check event stream
3. Verify user profiles
4. Test segmentation

### Intercom Dashboard Check
1. Log into Intercom
2. Check user list
3. Verify messages
4. Test automation rules

---

## 🐛 COMMON ISSUES TO WATCH FOR

### Frontend
- [ ] Console errors
- [ ] Failed API calls
- [ ] Missing analytics events
- [ ] UI glitches
- [ ] Slow loading

### Backend
- [ ] API errors (500s)
- [ ] Database connection issues
- [ ] Missing endpoints (404s)
- [ ] Slow queries
- [ ] Memory leaks

### Analytics
- [ ] Events not firing
- [ ] Duplicate events
- [ ] Wrong user properties
- [ ] Missing page views

---

## ✅ SUCCESS CRITERIA

### Must Pass:
- ✅ All onboarding steps work
- ✅ Analytics track correctly
- ✅ Trial experience smooth
- ✅ Upgrade flow functional
- ✅ Admin dashboard accessible

### Nice to Have:
- ✅ NPS survey appears
- ✅ Referrals tracked
- ✅ Popups contextual
- ✅ Social sharing works

---

## 📝 TESTING NOTES

### Issues Found:
```
[Date] [Issue] [Severity] [Status]
Example: Dec 3 - Project loading stuck - CRITICAL - FIXED
```

### Performance Observations:
```
- Page load times
- API response times
- Analytics latency
```

### User Experience Notes:
```
- Friction points
- Confusing UI
- Missing features
```

---

## 🚀 NEXT STEPS AFTER TESTING

1. **Fix Critical Issues**
   - Any blocking bugs
   - Analytics failures
   - Broken flows

2. **Optimize Performance**
   - Slow API calls
   - Large bundle sizes
   - Database queries

3. **Enhance UX**
   - Improve messaging
   - Add animations
   - Polish UI

4. **Launch Preparation**
   - Final QA pass
   - Load testing
   - Security audit

---

## 📞 SUPPORT

If you encounter issues:
1. Check console logs
2. Review API responses
3. Verify database state
4. Test in incognito mode
5. Clear cache and cookies

**Ready to start testing!** 🎯
