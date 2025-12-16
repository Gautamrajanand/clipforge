# PLG Timing & Trigger Audit
**Date:** December 16, 2025  
**Priority:** CRITICAL - Bad timing = Bad UX = Lost conversions  
**Purpose:** Ensure all PLG elements appear at the right time, right place, right context

---

## 🎯 Core Principle

**PLG elements must be:**
- **Timely** - Appear when user needs them, not randomly
- **Contextual** - Relevant to current user action
- **Non-intrusive** - Don't block critical workflows
- **Value-driven** - Show benefit before asking
- **Dismissible** - User can close and continue
- **Persistent** - Important ones reappear appropriately

---

## 🚨 Critical UX Issues to Avoid

### ❌ BAD TIMING EXAMPLES
1. **Upgrade modal on first visit** - User hasn't seen value yet
2. **Multiple popups at once** - Overwhelming and confusing
3. **Popup during video upload** - Blocks critical workflow
4. **Email preferences on signup** - Too early, user hasn't received emails
5. **Low credits warning with 50 credits left** - Premature anxiety
6. **Onboarding tour after user already explored** - Annoying
7. **Trial expiry warning on day 1** - Creates negative first impression
8. **NPS survey before first success** - User has no opinion yet
9. **Referral prompt before user loves product** - Won't share
10. **Watermark nudge before first export** - Doesn't make sense

### ✅ GOOD TIMING EXAMPLES
1. **Onboarding tour on first login** - Guides new users
2. **Low credits warning at 20%** - Gives time to upgrade
3. **Upgrade nudge after 5th export** - User sees value
4. **Trial expiry 3 days before** - Reasonable notice
5. **NPS survey after 2 weeks** - User has formed opinion
6. **Referral prompt after successful export** - User is happy
7. **Watermark nudge after seeing watermarked export** - Contextual
8. **Email preferences after 3rd email** - User knows what they're getting
9. **Project expiry warning 6 hours before** - Urgent but fair
10. **Feature announcement after user masters basics** - Ready for more

---

## 📋 PLG Element Inventory & Timing Rules

### 1. Onboarding Tour (Intro.js)

**Current Implementation:**
- Shows on first login
- 5-step tour
- Stored in localStorage

**Timing Rules:**
- ✅ **SHOW:** First login only
- ✅ **SHOW:** User clicks "Restart Tour" button
- ❌ **NEVER:** If user has created a project
- ❌ **NEVER:** If user dismissed it before
- ❌ **NEVER:** On mobile (too cramped)

**Test Cases:**
- [ ] Shows immediately on first login (after 1s delay)
- [ ] Does NOT show on second login
- [ ] Does NOT show if localStorage has `onboarding_tour_seen_${userId}=true`
- [ ] Can be restarted from dashboard
- [ ] Does NOT block any critical actions
- [ ] Can be skipped/dismissed
- [ ] Does NOT show on mobile devices

---

### 2. Welcome Modal

**Current Implementation:**
- Shows after onboarding survey
- One-time only

**Timing Rules:**
- ✅ **SHOW:** After onboarding survey completed
- ✅ **SHOW:** Only if user is new (no projects)
- ❌ **NEVER:** On subsequent visits
- ❌ **NEVER:** If user skipped survey

**Test Cases:**
- [ ] Shows after survey completion
- [ ] Does NOT show on second visit
- [ ] Does NOT show if user has projects
- [ ] Can be dismissed
- [ ] Does NOT block dashboard access

---

### 3. Onboarding Survey

**Current Implementation:**
- Shows on first visit if no projects
- Asks role, goal, platforms

**Timing Rules:**
- ✅ **SHOW:** First visit to dashboard
- ✅ **SHOW:** Only if projectCount === 0
- ✅ **SHOW:** Only if not completed before
- ❌ **NEVER:** If user is admin
- ❌ **NEVER:** If user has projects
- ❌ **NEVER:** On subsequent visits

**Test Cases:**
- [ ] Shows on first dashboard visit (500ms delay)
- [ ] Does NOT show if user has projects
- [ ] Does NOT show if completed before
- [ ] Does NOT show for admin users
- [ ] Can be skipped
- [ ] Saves responses to localStorage
- [ ] Triggers welcome modal after completion

---

### 4. Progress Checklist

**Current Implementation:**
- Shows in dashboard
- Tracks 5 milestones

**Timing Rules:**
- ✅ **SHOW:** Always visible in dashboard
- ✅ **SHOW:** Until all items completed
- ✅ **SHOW:** Can be dismissed
- ❌ **NEVER:** After user dismisses it
- ❌ **NEVER:** After all items complete (optional)

**Test Cases:**
- [ ] Visible in dashboard by default
- [ ] Updates in real-time as user completes items
- [ ] Can be dismissed (X button)
- [ ] Does NOT reappear after dismissal
- [ ] Shows completion celebration when done
- [ ] Restart tour button works

---

### 5. Low Credits Nudge

**Current Implementation:**
- Banner in dashboard
- Shows when credits < 20%

**Timing Rules:**
- ✅ **SHOW:** When credits < 20% of allocation
- ✅ **SHOW:** Only for FREE and STARTER tiers
- ✅ **SHOW:** Can be dismissed
- ❌ **NEVER:** For PRO/BUSINESS tiers
- ❌ **NEVER:** If user just upgraded
- ❌ **NEVER:** More than once per session

**Test Cases:**
- [ ] Shows when credits drop below 20%
- [ ] Does NOT show for PRO/BUSINESS
- [ ] Can be dismissed
- [ ] Does NOT reappear in same session
- [ ] Links to pricing page
- [ ] Shows current credit count
- [ ] Calculates percentage correctly

---

### 6. Watermark Upgrade Nudge

**Current Implementation:**
- Floating bottom-right popup
- Shows after export with watermark

**Timing Rules:**
- ✅ **SHOW:** After user exports with watermark (FREE tier)
- ✅ **SHOW:** Only once per session
- ✅ **SHOW:** Can be dismissed
- ❌ **NEVER:** Before first export
- ❌ **NEVER:** For paid tiers
- ❌ **NEVER:** During upload/processing
- ❌ **NEVER:** If user dismissed in last 24h

**Test Cases:**
- [ ] Shows after first watermarked export
- [ ] Does NOT show before export
- [ ] Does NOT show for paid tiers
- [ ] Can be dismissed
- [ ] Does NOT reappear for 24 hours after dismissal
- [ ] Does NOT block any workflows
- [ ] Links to pricing page
- [ ] Shows clear benefits

---

### 7. Project Expiry Nudge

**Current Implementation:**
- Banner in project page
- Shows 24h before expiry

**Timing Rules:**
- ✅ **SHOW:** When project expires in < 24 hours
- ✅ **SHOW:** Only for FREE tier (48h expiry)
- ✅ **SHOW:** More urgent styling if < 6 hours
- ❌ **NEVER:** For STARTER+ tiers (90d/forever)
- ❌ **NEVER:** If project already expired
- ❌ **NEVER:** If user just upgraded

**Test Cases:**
- [ ] Shows 24 hours before expiry
- [ ] Shows urgent styling 6 hours before
- [ ] Does NOT show for paid tiers
- [ ] Can be dismissed
- [ ] Links to pricing page
- [ ] Shows exact time remaining
- [ ] Does NOT show after upgrade

---

### 8. Export Upgrade Modal

**Current Implementation:**
- Full-screen modal
- Shows before export (FREE tier)

**Timing Rules:**
- ✅ **SHOW:** When FREE user clicks export
- ✅ **SHOW:** After 3rd export (not first)
- ✅ **SHOW:** Can be dismissed to export anyway
- ❌ **NEVER:** On first export (let them try)
- ❌ **NEVER:** For paid tiers
- ❌ **NEVER:** During processing
- ❌ **NEVER:** More than once per day

**Test Cases:**
- [ ] Does NOT show on first export
- [ ] Does NOT show on second export
- [ ] Shows on 3rd+ export for FREE users
- [ ] Does NOT show for paid tiers
- [ ] Can be dismissed
- [ ] "Export Anyway" button works
- [ ] Shows clear comparison
- [ ] Does NOT block export completely

---

### 9. Upgrade Modal (Generic)

**Current Implementation:**
- Context-aware modal
- Multiple triggers

**Timing Rules:**
- ✅ **SHOW:** When user hits feature limit
- ✅ **SHOW:** When credits depleted
- ✅ **SHOW:** When trying locked feature
- ❌ **NEVER:** On first visit
- ❌ **NEVER:** During onboarding
- ❌ **NEVER:** Multiple times in same session
- ❌ **NEVER:** If user just saw another upgrade prompt

**Test Cases:**
- [ ] Shows when credits depleted
- [ ] Shows when trying locked feature
- [ ] Does NOT show on first visit
- [ ] Does NOT show during onboarding
- [ ] Can be dismissed
- [ ] Shows context-specific messaging
- [ ] Links to pricing page
- [ ] Does NOT stack with other modals

---

### 10. Trial Banner

**Current Implementation:**
- Top banner
- Shows during trial period

**Timing Rules:**
- ✅ **SHOW:** During 7-day trial period
- ✅ **SHOW:** Shows days remaining
- ✅ **SHOW:** More urgent in last 2 days
- ❌ **NEVER:** After trial expired
- ❌ **NEVER:** If user upgraded
- ❌ **NEVER:** For users without trial

**Test Cases:**
- [ ] Shows during trial period
- [ ] Shows correct days remaining
- [ ] Shows urgent styling in last 2 days
- [ ] Does NOT show after trial ends
- [ ] Does NOT show after upgrade
- [ ] Can be dismissed
- [ ] Links to pricing page

---

### 11. NPS Widget

**Current Implementation:**
- Popup survey
- Shows after 2 weeks

**Timing Rules:**
- ✅ **SHOW:** After 14 days of signup
- ✅ **SHOW:** Only if user has created 3+ projects
- ✅ **SHOW:** Only once (unless dismissed)
- ❌ **NEVER:** Before 2 weeks
- ❌ **NEVER:** If user has < 3 projects
- ❌ **NEVER:** During onboarding
- ❌ **NEVER:** During critical workflows
- ❌ **NEVER:** If user already responded

**Test Cases:**
- [ ] Does NOT show before 14 days
- [ ] Does NOT show if < 3 projects
- [ ] Shows after 14 days + 3 projects
- [ ] Can be dismissed
- [ ] Does NOT show during upload/processing
- [ ] Does NOT show if already responded
- [ ] Saves response
- [ ] Does NOT reappear after response

---

### 12. Email Notifications

#### Welcome Email
**Timing:** Immediate after signup
- [ ] Sends within 1 minute of signup
- [ ] Does NOT send duplicate
- [ ] Includes correct user name
- [ ] Links work

#### Onboarding Day 1
**Timing:** 24 hours after signup
- [ ] Sends exactly 24h after signup
- [ ] Does NOT send if user already active
- [ ] Includes helpful tips
- [ ] Can unsubscribe

#### Onboarding Day 3
**Timing:** 72 hours after signup
- [ ] Sends exactly 72h after signup
- [ ] Does NOT send if user already created project
- [ ] Includes case studies
- [ ] Can unsubscribe

#### Onboarding Day 5
**Timing:** 5 days after signup
- [ ] Sends on day 5
- [ ] Shows user's progress stats
- [ ] Includes tips
- [ ] Can unsubscribe

#### Onboarding Day 7
**Timing:** 7 days after signup
- [ ] Sends on day 7
- [ ] Shows usage summary
- [ ] Includes upgrade CTA if FREE
- [ ] Can unsubscribe

#### Onboarding Day 14
**Timing:** 14 days after signup
- [ ] Sends on day 14
- [ ] Shows milestone achievements
- [ ] Includes advanced tips
- [ ] Can unsubscribe

#### Credits Low
**Timing:** When credits < 20%
- [ ] Sends when credits drop below 20%
- [ ] Does NOT send multiple times
- [ ] Includes upgrade CTA
- [ ] Shows exact credit count

#### Trial Expiry
**Timing:** 3 days before trial ends
- [ ] Sends exactly 3 days before
- [ ] Does NOT send if already upgraded
- [ ] Includes upgrade CTA
- [ ] Shows trial end date

#### Processing Complete
**Timing:** Immediate when processing done
- [ ] Sends within 1 minute of completion
- [ ] Includes project link
- [ ] Shows result count
- [ ] Does NOT send duplicate

#### Payment Failed
**Timing:** Immediate when payment fails
- [ ] Sends within 1 minute of failure
- [ ] Includes reason
- [ ] Links to billing page
- [ ] Shows retry date

---

## 🔄 Modal Stacking & Priority Rules

**Priority Order (highest to lowest):**
1. **Critical Errors** - Payment failed, processing error
2. **Onboarding** - Survey, welcome, tour (first-time only)
3. **Trial Expiry** - Last 2 days
4. **Feature Locked** - User trying to use locked feature
5. **Credits Depleted** - User has 0 credits
6. **Low Credits** - User has < 20% credits
7. **Upgrade Nudges** - After exports, watermark
8. **NPS Survey** - After 2 weeks
9. **Feature Announcements** - New features

**Stacking Rules:**
- ❌ **NEVER show 2+ modals at once**
- ❌ **NEVER show modal during upload/processing**
- ❌ **NEVER show modal during onboarding tour**
- ✅ **Queue modals** - Show one at a time
- ✅ **Respect dismissal** - Don't reshow immediately
- ✅ **Context wins** - Show most relevant to current action

---

## 🧪 Testing Scenarios

### Scenario 1: Brand New User
**Expected Flow:**
1. Sign up → Welcome email (immediate)
2. First login → Onboarding survey (500ms delay)
3. Complete survey → Welcome modal
4. Dismiss modal → Onboarding tour starts (1s delay)
5. Complete/skip tour → Dashboard with progress checklist
6. **NO OTHER POPUPS** for first session

**Test:**
- [ ] Only these elements appear
- [ ] In this exact order
- [ ] With correct delays
- [ ] No duplicate or stacked modals

### Scenario 2: User Creating First Project
**Expected Flow:**
1. Click upload → Upload modal (no upgrade nudge)
2. Upload video → Processing starts
3. **NO POPUPS** during processing
4. Processing complete → Email notification
5. View project → **NO POPUPS**
6. Click export → Export modal (no upgrade nudge on first export)
7. Export complete → Download works
8. **NO UPGRADE NUDGES** yet (first export)

**Test:**
- [ ] No interruptions during workflow
- [ ] No upgrade nudges on first export
- [ ] Email arrives on completion
- [ ] Export works smoothly

### Scenario 3: FREE User, 3rd Export
**Expected Flow:**
1. Click export → Export upgrade modal appears
2. Can dismiss → Export proceeds with watermark
3. Export complete → Watermark upgrade nudge (bottom-right)
4. Can dismiss → Nudge disappears
5. **NO MORE NUDGES** for 24 hours

**Test:**
- [ ] Upgrade modal shows on 3rd export
- [ ] Can be dismissed
- [ ] Watermark nudge shows after export
- [ ] Does NOT reappear for 24h

### Scenario 4: User Running Low on Credits
**Expected Flow:**
1. Credits drop to 15 (< 20%) → Low credits banner appears
2. Can dismiss → Banner disappears
3. Credits drop to 5 → Low credits email sent
4. Credits hit 0 → Upgrade modal on next action
5. **NO DUPLICATE NOTIFICATIONS**

**Test:**
- [ ] Banner shows at 20% threshold
- [ ] Email sends at low credits
- [ ] Modal shows at 0 credits
- [ ] No duplicate notifications

### Scenario 5: Trial User, Last 2 Days
**Expected Flow:**
1. 5 days into trial → Normal usage
2. 6 days into trial → Trial banner shows "1 day left"
3. 7 days into trial → Trial expiry email sent
4. Trial expires → Downgrade to FREE
5. Next login → **NO TRIAL BANNER**

**Test:**
- [ ] Banner shows correct days remaining
- [ ] Email sends 3 days before (day 4)
- [ ] Banner urgent styling in last 2 days
- [ ] Banner disappears after expiry

### Scenario 6: User After 2 Weeks
**Expected Flow:**
1. 14 days after signup → NPS survey appears
2. User completes survey → Thank you message
3. Survey disappears → **NEVER SHOWS AGAIN**

**Test:**
- [ ] Survey shows after 14 days
- [ ] Only if 3+ projects created
- [ ] Does NOT show during workflows
- [ ] Does NOT reappear after completion

---

## 🚨 Critical Issues to Fix

### Issue 1: Multiple Modals Stacking
**Problem:** User sees onboarding survey + welcome modal + tour at once  
**Fix:** Queue modals, show one at a time with delays  
**Priority:** CRITICAL

### Issue 2: Upgrade Nudge on First Export
**Problem:** User sees upgrade modal before experiencing value  
**Fix:** Only show after 3rd export  
**Priority:** HIGH

### Issue 3: NPS Survey Too Early
**Problem:** Survey shows before user has formed opinion  
**Fix:** Require 14 days + 3 projects  
**Priority:** HIGH

### Issue 4: Low Credits Warning Too Early
**Problem:** Warning shows at 50% credits  
**Fix:** Only show at 20% threshold  
**Priority:** MEDIUM

### Issue 5: Popups During Processing
**Problem:** Modals appear while video processing  
**Fix:** Block all non-critical modals during processing  
**Priority:** CRITICAL

### Issue 6: Email Flood
**Problem:** User gets 3 emails in first day  
**Fix:** Space out onboarding emails properly  
**Priority:** HIGH

---

## ✅ Implementation Checklist

### Code Changes Needed
- [ ] Add modal queue system (show one at a time)
- [ ] Add processing state check (block modals during processing)
- [ ] Add export count tracking (for upgrade modal)
- [ ] Add dismissal timestamps (localStorage)
- [ ] Add 24h cooldown for upgrade nudges
- [ ] Add project count check for NPS
- [ ] Add proper delays between modals
- [ ] Add mobile detection (skip tour on mobile)

### Configuration Changes
- [ ] Set low credits threshold to 20%
- [ ] Set upgrade modal to show after 3rd export
- [ ] Set NPS survey to 14 days + 3 projects
- [ ] Set email spacing (24h, 72h, 5d, 7d, 14d)
- [ ] Set trial expiry email to 3 days before
- [ ] Set watermark nudge cooldown to 24h

### Testing Required
- [ ] Test all scenarios above
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Test with real user accounts
- [ ] Test timing with actual delays
- [ ] Test dismissal persistence
- [ ] Test email delivery timing

---

## 📊 Success Metrics

### User Experience
- **Modal abandonment rate** < 30%
- **Dismissal rate** < 50%
- **Completion rate** > 60%
- **Time to first value** < 5 minutes
- **User complaints about popups** = 0

### Conversion
- **Free → Paid conversion** > 10%
- **Trial → Paid conversion** > 30%
- **Upgrade modal CTR** > 5%
- **Email open rate** > 25%
- **Email click rate** > 10%

---

## 🔍 Monitoring & Analytics

### Track These Events
- `modal_shown` - Which modal, when, why
- `modal_dismissed` - Which modal, how long shown
- `modal_completed` - Which modal, action taken
- `email_sent` - Which email, when
- `email_opened` - Which email, when
- `email_clicked` - Which email, which link
- `upgrade_nudge_shown` - Which nudge, context
- `upgrade_nudge_clicked` - Which nudge, converted?

### Alert On
- Multiple modals shown in < 5 seconds
- Modal shown during processing
- Email sent more than once
- Upgrade nudge shown on first export
- NPS survey shown before 14 days

---

## ✍️ Sign-Off

- [ ] All timing rules documented
- [ ] All triggers verified
- [ ] All test scenarios passed
- [ ] No modal stacking issues
- [ ] No interruptions during workflows
- [ ] Email spacing correct
- [ ] Dismissal persistence works
- [ ] Mobile experience tested
- [ ] Analytics tracking implemented
- [ ] **PLG TIMING AUDIT COMPLETE**

**Audited By:** _____________  
**Date:** _____________  
**Status:** ✅ Pass / ⚠️ Issues Found / ❌ Fail
