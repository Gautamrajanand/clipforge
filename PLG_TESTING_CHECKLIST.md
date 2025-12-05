# PLG Growth Functionality - Systematic Testing Guide

**Date:** December 5, 2025 (Updated)  
**Status:** ✅ Onboarding Flow Complete - Ready for Testing  
**Purpose:** Test all PLG features end-to-end to ensure growth engine is working

---

## 🎉 Recent Updates (Dec 5, 2025 - Evening)

### ✅ Completed Features
- **Onboarding Survey** - 3-step user profiling (role, goal, platforms)
- **Welcome Modal** - Feature overview with CTAs
- **Onboarding Checklist** - 5-step guided journey
- **Trial Banner** - Prominent 7-day trial display
- **Dashboard Spacing** - Optimized layout and visual hierarchy
- **Analytics Tracking** - Full event tracking for all onboarding actions
- **Success Celebration** - Confetti animation on first clip creation (aha moment)
- **Expired Project Blocking** - 48-hour expiration for FREE tier with blur + upgrade modal
- **Navigation Performance** - Fixed blinking/flashing with optimized renders (60-70% improvement)

### 🐛 Known Issues to Test
- ⚠️ Credits not updating when tier changes (FREE → PRO)
- ⚠️ Checklist progress not auto-updating (backend tracking pending)

See `PLG_ONBOARDING_COMPLETE.md` and `PLG_IMPLEMENTATION_PROGRESS.md` for detailed documentation.

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
   - Navigate to `/sign-up` ✅
   - Create new account (use test email) ✅
   - Check redirect to dashboard ✅

2. [ ] **Onboarding Survey** (NEW)
   - Verify survey appears after 500ms delay ✅
   - **Step 1:** Select role (4 options) ✅
   - **Step 2:** Select goal (4 options) ✅
   - **Step 3:** Select platforms (multi-select, 6 options) ✅
   - Verify progress bar updates (1/3, 2/3, 3/3) ✅
   - Test "Back" button navigation ✅
   - Test "Skip for now" option ✅
   - Verify "Next" button only enabled when selection made ✅
   - Check smooth animations between steps ✅

3. [ ] **Welcome Modal**
   - Verify modal appears after survey completion/skip ✅
   - Check modal shows: ✅
     - Welcome message - pop up came after survey completion ✅
     - 3 key features (Upload, AI Magic, Free Trial) - I didnt read the information but main subtitle implroved
     - Credit information (150 credits) ✅
     - "Try with Sample Video" button - now this is not present which is good
     - "Upload My Own Video" button - same as above, only one CTA
   - Test both CTA buttons - not applicable anymore
   - Verify modal can be closed - ✅ it did close

3. [ ] **Onboarding Checklist**
   - Check checklist appears on dashboard ✅
   - Verify 5 steps are visible:
     - [ ] Upload your first video - this has been removed
     - [ ] Create AI clips ✅
     - [ ] Add captions ✅
     - [ ] Reframe video ✅
     - [ ] Export and share ✅
   - Test step completion tracking - dont think this has happened yet

4. [ ] **Multi-Step Onboarding**
   - If implemented, test step-by-step guide - dont know what this means
   - Verify tooltips and highlights - not yet - can provide option under help and support in drop down 
   - Test skip/next functionality 

**Expected Results:**
- ✅ Smooth signup flow - ✅ yes but i thinkk i can see a pop up blinking when i click different pages or options, maybe just in my head
- ✅ Welcome modal shows once - ✅ yes, logged out and in and i did not see it again
- ✅ Checklist visible and interactive - not interactive, does not update on completing tasks
- ✅ Progress tracked correctly - yes but only mentioned clips, should just mention services used instead as this will not make sense if users dont use clips.
- ✅ Intercom working - no blank

####################################################

**Analytics Events to Check:**
- `user_signed_up`
- `onboarding_started`
- `onboarding_step_completed`

---

## 2️⃣ TRIAL EXPERIENCE & EXPIRED PROJECTS ⭐ NEW

### Test: FREE Tier Trial Banner
**Goal:** Verify trial messaging and upgrade prompts  ✅ 

#### Steps:
1. [ ] **Trial Banner Display**
   - Check banner appears at top of dashboard ✅
   - Verify countdown shows correct days left ✅
   - Test "Upgrade Now" button
   - Verify banner styling matches design

2. [ ] **Trial Limitations**
   - Check credit allocation (60 credits for FREE)
   - Verify project expiry (48 hours)
   - Test watermark on exports
   - Check feature gating (if any)

3. [ ] **Expired Project Blocking** ⭐ NEW
   - Create a project (or use existing)
   - Wait 48 hours OR manually set `createdAt` in DB to 3 days ago
   - Check dashboard shows:
     - ✅ Blurred thumbnail
     - ✅ Red "Expired" badge
     - ✅ Subtle dark overlay (no text)
   - Click on expired project card
   - Verify:
     - ✅ Navigation blocked (doesn't go to project page)
     - ✅ ExpiredProjectModal appears
     - ✅ Modal shows project title and expiration date
     - ✅ "Upgrade to Keep Your Projects" CTA visible
     - ✅ Can close modal and return to dashboard
   - Try accessing expired project via direct URL (`/project/[id]`)
   - Verify:
     - ✅ Video player blurred
     - ✅ Timeline hidden
     - ✅ Clips section hidden
     - ✅ Upgrade modal appears

4. [ ] **Premium User - No Expiration**
   - Upgrade to STARTER/PRO/BUSINESS tier
   - Verify old projects (>48h) are NOT expired
   - Check no expiry badge shown
   - Confirm full access to all projects

5. [ ] **Upgrade Prompts**
   - Test contextual upgrade messages
   - Verify upgrade CTA placement
   - Check pricing page link works

**Expected Results:**
- ✅ Trial banner visible and accurate
- ✅ 48-hour expiration enforced for FREE tier
- ✅ Expired projects blocked with clear upgrade path
- ✅ Premium users unaffected by expiration
- ✅ Upgrade prompts clear and compelling

**Analytics Events:**
- `trial_banner_viewed`
- `upgrade_clicked`
- `pricing_page_viewed`
- `upgrade_prompt_shown` (expired project modal)
- `upgrade_prompt_clicked`

**Database Check:**
```sql
-- Manually expire a project for testing
UPDATE projects 
SET "createdAt" = NOW() - INTERVAL '3 days'
WHERE id = 'your-project-id';
```

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

## 6️⃣ SUCCESS CELEBRATION (AHA MOMENT) ⭐ NEW

### Test: First Clip Creation Celebration
**Goal:** Verify confetti animation triggers on first clip

#### Steps:
1. [ ] **Create New Account**
   - Sign up with fresh account
   - Complete onboarding
   - Upload first video

2. [ ] **Generate First Clip**
   - Click "Detect Highlights" or "Create AI Clips"
   - Wait for clip generation to complete
   - Verify celebration triggers:
     - ✅ Confetti animation appears
     - ✅ Success modal shows:
       - Title: "Your First AI Clip! 🎉"
       - Message: "You just created your first viral clip..."
     - ✅ Modal auto-dismisses after 5 seconds
     - ✅ Can manually close modal

3. [ ] **Subsequent Clips**
   - Create more clips in same or different project
   - Verify:
     - ✅ No celebration (only first time)
     - ✅ Regular toast notification instead
     - ✅ "Clips detected successfully!" message

4. [ ] **Analytics Tracking**
   - Open browser console
   - Check for analytics events:
     - ✅ `AHA_MOMENT` event fired
     - ✅ `FIRST_CLIP_CREATED` event fired
     - ✅ Events include projectId and clipCount
   - Verify in PostHog/Mixpanel dashboard

**Expected Results:**
- ✅ Celebration only on first clip
- ✅ Smooth animation and UX
- ✅ Analytics tracked correctly
- ✅ Subsequent clips show normal feedback

**Console Check:**
```
🎉 First clip created - Aha moment!
Analytics: AHA_MOMENT tracked
```

**Known Limitation:**
- Checklist won't auto-update yet (backend tracking pending)
- User must manually refresh to see checklist progress

---

## 7️⃣ REFERRAL PROGRAM

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

## 8️⃣ DYNAMIC POPUPS

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

## 9️⃣ ADMIN PLG DASHBOARD

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

## 🔟 SOCIAL SHARING

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

## 1️⃣1️⃣ UPGRADE FLOW

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

3. [ ] **Post-Upgrade Verification** ⭐ CRITICAL
   - **Tier Update:**
     - Check database: `SELECT tier FROM organizations WHERE id = 'org_xxx'`
     - Verify dashboard shows new tier
     - Confirm trial banner removed/updated
   
   - **Credits Update:** ⚠️ KNOWN ISSUE
     - FREE (60) → STARTER (150) → Should show 150
     - FREE (60) → PRO (300) → Should show 300
     - Check: `/credits` page
     - Check: Sidebar credits widget
     - **If not updating:** Check webhook logs
   
   - **Feature Unlocking:**
     - Watermark removed from exports
     - Project expiration removed
     - New features accessible
     - Billing portal accessible
   
   - **Database Verification:**
     ```sql
     SELECT 
       tier,
       credits,
       monthly_credits_allocation,
       stripe_customer_id,
       stripe_subscription_id
     FROM organizations 
     WHERE id = 'org_xxx';
     ```

4. [ ] **Admin Manual Upgrade Test** ⭐ NEW
   - Go to `/admin/users`
   - Find test user
   - Change tier from FREE to PRO
   - **Expected:**
     - ✅ Tier updates immediately
     - ✅ Credits should update to 300
     - ⚠️ **KNOWN BUG:** Credits may not update
   - **Workaround:** Manually update credits in database
   - **Fix Needed:** Backend webhook/admin update logic

**Expected Results:**
- ✅ Pricing clear and compelling
- ✅ Checkout smooth and secure
- ✅ Upgrade reflected immediately
- ⚠️ Credits update (may need manual fix)
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
- [ ] Success celebration not triggering (check console for errors)
- [ ] Expired projects still accessible (check tier and createdAt)
- [ ] Blur effect not showing on expired projects

### Backend
- [ ] API errors (500s)
- [ ] Database connection issues
- [ ] Missing endpoints (404s)
- [ ] Slow queries
- [ ] Memory leaks
- [ ] **Credits not updating on tier change** ⚠️ CRITICAL

### Credits Not Updating Issue
**Symptom:** User upgraded from FREE to PRO, but credits still show 60 instead of 300

**Root Cause:** Admin panel update doesn't trigger credit allocation update

**Temporary Fix:**
```sql
-- Manual credit update
UPDATE organizations 
SET 
  credits = 300,
  monthly_credits_allocation = 300
WHERE id = 'org_xxx';
```

**Proper Fix Needed:**
1. Admin panel should call credit update service
2. Webhook should handle tier changes
3. Credit allocation should auto-update on tier change

**Files to Check:**
- `apps/api/src/admin/admin.service.ts` - Admin update logic
- `apps/api/src/credits/credits.service.ts` - Credit allocation
- `apps/api/src/payments/payments.service.ts` - Webhook handler

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
