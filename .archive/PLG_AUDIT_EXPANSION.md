# PLG Timing Audit - Additional Elements (49 items)
**To be appended to PLG_TIMING_AUDIT.md**

---

## 📋 Additional Modals & Popups (9 items)

### 13. Upload Modal

**Current Implementation:**
- Shows when user clicks "Upload Video"
- Allows file upload or URL import

**Timing Rules:**
- ✅ **SHOW:** On demand when user clicks upload
- ✅ **SHOW:** Anytime user wants to upload
- ❌ **NEVER:** Show upgrade nudge on first use
- ❌ **NEVER:** Block upload for FREE users
- ❌ **NEVER:** Show during processing

**Test Cases:**
- [ ] Opens on upload button click
- [ ] Shows credit cost preview
- [ ] Does NOT show upgrade nudge on first upload
- [ ] Allows file selection
- [ ] Allows URL input
- [ ] Validates file size (< 5GB)
- [ ] Shows progress during upload
- [ ] Can be cancelled

---

### 14. AI Reframe Modal

**Current Implementation:**
- Shows when user clicks "AI Reframe"
- Allows aspect ratio and framing selection

**Timing Rules:**
- ✅ **SHOW:** After video upload complete
- ✅ **SHOW:** When user clicks AI Reframe button
- ✅ **SHOW:** Credit cost preview
- ❌ **NEVER:** Before video uploaded
- ❌ **NEVER:** During processing
- ❌ **NEVER:** If insufficient credits (show upgrade modal instead)

**Test Cases:**
- [ ] Opens after upload complete
- [ ] Shows aspect ratio options (9:16, 1:1, 16:9, 4:5)
- [ ] Shows framing mode options
- [ ] Shows credit cost preview
- [ ] Blocks if insufficient credits
- [ ] Starts processing on confirm
- [ ] Can be cancelled

---

### 15. AI Subtitles Modal

**Current Implementation:**
- Shows when user clicks "AI Subtitles"
- Allows language and style selection

**Timing Rules:**
- ✅ **SHOW:** After video upload complete
- ✅ **SHOW:** When user clicks AI Subtitles button
- ✅ **SHOW:** Credit cost preview
- ❌ **NEVER:** Before video uploaded
- ❌ **NEVER:** During processing
- ❌ **NEVER:** If insufficient credits

**Test Cases:**
- [ ] Opens after upload complete
- [ ] Shows language options
- [ ] Shows caption style options (14+ styles)
- [ ] Shows credit cost preview
- [ ] Blocks if insufficient credits
- [ ] Starts processing on confirm
- [ ] Can be cancelled

---

### 16. Clip Settings Modal

**Current Implementation:**
- Shows when editing clip properties
- Allows caption, duration, aspect ratio changes

**Timing Rules:**
- ✅ **SHOW:** When user clicks edit on clip
- ✅ **SHOW:** After clips generated
- ❌ **NEVER:** Before clips exist
- ❌ **NEVER:** During export

**Test Cases:**
- [ ] Opens on clip edit click
- [ ] Shows all clip properties
- [ ] Allows caption editing
- [ ] Allows duration trimming
- [ ] Allows aspect ratio change
- [ ] Saves changes immediately
- [ ] Can be cancelled

---

### 17. Caption Preview Modal

**Current Implementation:**
- Shows caption preview with video
- Allows real-time caption editing

**Timing Rules:**
- ✅ **SHOW:** When user clicks caption preview
- ✅ **SHOW:** After captions generated
- ❌ **NEVER:** Before captions exist
- ❌ **NEVER:** During processing

**Test Cases:**
- [ ] Opens on preview click
- [ ] Shows video with captions
- [ ] Allows caption editing
- [ ] Shows style changes in real-time
- [ ] Can be closed
- [ ] Saves changes on close

---

### 18. Share Modal

**Current Implementation:**
- Shows sharing options
- Allows social media sharing

**Timing Rules:**
- ✅ **SHOW:** After export complete
- ✅ **SHOW:** When user clicks share button
- ❌ **NEVER:** Before export complete
- ❌ **NEVER:** During processing
- ❌ **NEVER:** If export failed

**Test Cases:**
- [ ] Opens after export complete
- [ ] Shows social media options
- [ ] Pre-fills captions
- [ ] Generates share links
- [ ] Tracks shares (analytics)
- [ ] Can be dismissed

---

### 19. Expired Project Modal

**Current Implementation:**
- Shows when accessing expired project
- Prompts upgrade to restore

**Timing Rules:**
- ✅ **SHOW:** When user tries to access expired project (FREE tier, 48h)
- ✅ **SHOW:** Clear explanation of expiry
- ✅ **SHOW:** Upgrade CTA
- ❌ **NEVER:** For STARTER+ tiers (90d/forever)
- ❌ **NEVER:** If project not expired

**Test Cases:**
- [ ] Shows when accessing expired project
- [ ] Explains 48h expiry for FREE
- [ ] Shows upgrade options
- [ ] Links to pricing page
- [ ] Does NOT show for paid tiers
- [ ] Can be dismissed (returns to dashboard)

---

### 20. Dynamic Popup

**Current Implementation:**
- Generic popup system for various messages
- Context-aware content

**Timing Rules:**
- ✅ **SHOW:** Based on specific triggers
- ✅ **SHOW:** Respects modal queue
- ❌ **NEVER:** Stack with other modals
- ❌ **NEVER:** During processing
- ❌ **NEVER:** During onboarding

**Test Cases:**
- [ ] Shows for configured triggers
- [ ] Does NOT stack with other modals
- [ ] Can be dismissed
- [ ] Respects cooldown periods
- [ ] Tracks analytics

---

### 21. Schedule Post Modal

**Current Implementation:**
- Allows scheduling social media posts
- Calendar integration

**Timing Rules:**
- ✅ **SHOW:** After export complete
- ✅ **SHOW:** When user clicks schedule button
- ❌ **NEVER:** Before export complete
- ❌ **NEVER:** For FREE tier (locked feature)

**Test Cases:**
- [ ] Opens after export complete
- [ ] Shows calendar picker
- [ ] Shows social platform options
- [ ] Locks for FREE tier (shows upgrade)
- [ ] Saves scheduled posts
- [ ] Can be cancelled

---

## 🎉 Celebration Elements (2 items)

### 22. Celebration Toast

**Current Implementation:**
- Brief success message
- Auto-dismisses after 3-5 seconds

**Timing Rules:**
- ✅ **SHOW:** After successful actions
  - First export complete
  - First clip generated
  - Milestone achieved (10 clips, 100 clips)
- ✅ **SHOW:** 3-5 second duration
- ❌ **NEVER:** Stack multiple toasts
- ❌ **NEVER:** During processing
- ❌ **NEVER:** Block any workflows

**Test Cases:**
- [ ] Shows after first export
- [ ] Shows after first clip
- [ ] Shows after milestones
- [ ] Auto-dismisses after 5 seconds
- [ ] Does NOT stack
- [ ] Does NOT block workflows
- [ ] Can be manually dismissed

---

### 23. Success Celebration

**Current Implementation:**
- Full-screen celebration animation
- Shows after major milestones

**Timing Rules:**
- ✅ **SHOW:** After completing onboarding checklist
- ✅ **SHOW:** After first successful export
- ✅ **SHOW:** After 10th project
- ❌ **NEVER:** More than once per milestone
- ❌ **NEVER:** During workflows
- ❌ **NEVER:** If user is in hurry (can skip)

**Test Cases:**
- [ ] Shows after checklist complete
- [ ] Shows after first export
- [ ] Shows after 10th project
- [ ] Can be skipped
- [ ] Does NOT repeat
- [ ] Does NOT block workflows

---

## 🎓 Additional Onboarding (1 item)

### 24. Multi-Step Onboarding

**Current Implementation:**
- Alternative to survey
- Step-by-step project creation

**Timing Rules:**
- ✅ **SHOW:** If user skips onboarding survey
- ✅ **SHOW:** Guides through first project
- ❌ **NEVER:** If user completed survey
- ❌ **NEVER:** If user has projects
- ❌ **NEVER:** For returning users

**Test Cases:**
- [ ] Shows if survey skipped
- [ ] Guides through upload
- [ ] Guides through AI Clips
- [ ] Guides through export
- [ ] Can be skipped at any step
- [ ] Does NOT show for returning users

---

## 📧 Additional Emails (7 items)

### 25. Processing Started Email

**Timing:** Immediate when processing begins (for jobs > 1 minute)

**Rules:**
- ✅ **SEND:** When video processing starts
- ✅ **SEND:** Only for jobs estimated > 1 minute
- ❌ **NEVER:** For quick jobs (< 1 min)
- ❌ **NEVER:** Send duplicate

**Test Cases:**
- [ ] Sends when processing starts
- [ ] Only for long jobs (> 1 min)
- [ ] Includes estimated time
- [ ] Includes project link
- [ ] Does NOT send duplicate
- [ ] Does NOT send for quick jobs

---

### 26. Weekly Summary Email

**Timing:** Every Monday 9 AM user's timezone

**Rules:**
- ✅ **SEND:** Every Monday 9 AM
- ✅ **SEND:** Only if user active in past week
- ✅ **SEND:** Includes stats, tips, upgrade CTA
- ❌ **NEVER:** If user unsubscribed from weekly emails
- ❌ **NEVER:** If user inactive (no projects in 30 days)

**Test Cases:**
- [ ] Sends every Monday 9 AM
- [ ] Includes weekly stats
- [ ] Includes tips
- [ ] Includes upgrade CTA for FREE
- [ ] Respects email preferences
- [ ] Does NOT send if inactive

---

### 27. Inactivity Re-engagement Email

**Timing:** 7 days after last activity

**Rules:**
- ✅ **SEND:** After 7 days of inactivity
- ✅ **SEND:** Reminds of credits, projects
- ✅ **SEND:** Includes tips to get started
- ❌ **NEVER:** If user logged in recently
- ❌ **NEVER:** If user unsubscribed
- ❌ **NEVER:** More than once per month

**Test Cases:**
- [ ] Sends after 7 days inactive
- [ ] Includes credit balance
- [ ] Includes project reminders
- [ ] Includes tips
- [ ] Does NOT send if user active
- [ ] Does NOT send more than once/month

---

### 28. Credit Adjustment Email

**Timing:** Immediate when admin adjusts credits

**Rules:**
- ✅ **SEND:** When admin adjusts credits
- ✅ **SEND:** Includes reason for adjustment
- ✅ **SEND:** Shows new balance
- ❌ **NEVER:** Send without reason
- ❌ **NEVER:** Send duplicate

**Test Cases:**
- [ ] Sends when admin adjusts
- [ ] Includes adjustment amount
- [ ] Includes reason
- [ ] Shows new balance
- [ ] Does NOT send duplicate

---

### 29. Upgrade After Exports Email

**Timing:** After 5+ exports in a week

**Rules:**
- ✅ **SEND:** After user exports 5+ clips in a week
- ✅ **SEND:** Shows usage stats
- ✅ **SEND:** Includes upgrade CTA
- ❌ **NEVER:** For paid tiers
- ❌ **NEVER:** More than once per month
- ❌ **NEVER:** If user just upgraded

**Test Cases:**
- [ ] Sends after 5 exports in week
- [ ] Shows export count
- [ ] Shows upgrade benefits
- [ ] Does NOT send for paid tiers
- [ ] Does NOT send if recently upgraded

---

### 30. Monthly Usage Report Email

**Timing:** 1st day of month

**Rules:**
- ✅ **SEND:** First day of each month
- ✅ **SEND:** Shows previous month stats
- ✅ **SEND:** Includes tips and upgrade CTA
- ❌ **NEVER:** If user has no activity
- ❌ **NEVER:** If user unsubscribed

**Test Cases:**
- [ ] Sends on 1st of month
- [ ] Shows previous month stats
- [ ] Includes projects, clips, minutes
- [ ] Includes tips
- [ ] Respects email preferences

---

### 31. Feature Announcement Email

**Timing:** When new feature launches

**Rules:**
- ✅ **SEND:** When major feature launches
- ✅ **SEND:** Explains benefits
- ✅ **SEND:** Includes CTA to try feature
- ❌ **NEVER:** For minor updates
- ❌ **NEVER:** If user opted out
- ❌ **NEVER:** More than once per feature

**Test Cases:**
- [ ] Sends on feature launch
- [ ] Explains feature benefits
- [ ] Includes try it CTA
- [ ] Respects email preferences
- [ ] Does NOT send for minor updates

---

## 🔔 In-App Notifications (3 items)

### 32. Credits Widget (Sidebar)

**Current Implementation:**
- Always visible in sidebar
- Shows credit balance and reset date

**Timing Rules:**
- ✅ **SHOW:** Always visible in dashboard
- ✅ **SHOW:** Low credits warning (< 20%)
- ✅ **SHOW:** Links to credits page
- ❌ **NEVER:** Hide for any tier
- ❌ **NEVER:** Show incorrect balance

**Test Cases:**
- [ ] Always visible in sidebar
- [ ] Shows correct balance
- [ ] Shows reset date
- [ ] Shows low credits warning
- [ ] Links to credits page
- [ ] Updates in real-time

---

### 33. Processing Status

**Current Implementation:**
- Real-time processing updates
- Progress percentage

**Timing Rules:**
- ✅ **SHOW:** During video processing
- ✅ **SHOW:** Progress percentage
- ✅ **SHOW:** Estimated time remaining
- ❌ **NEVER:** Block other actions
- ❌ **NEVER:** Show incorrect progress

**Test Cases:**
- [ ] Shows during processing
- [ ] Shows progress percentage
- [ ] Shows estimated time
- [ ] Updates in real-time
- [ ] Does NOT block workflows
- [ ] Clears when complete

---

### 34. Toast Notifications

**Current Implementation:**
- Brief success/error messages
- Auto-dismiss after 3-5 seconds

**Timing Rules:**
- ✅ **SHOW:** After actions (save, delete, copy, etc.)
- ✅ **SHOW:** 3-5 second duration
- ✅ **SHOW:** Can be manually dismissed
- ❌ **NEVER:** Stack more than 3 toasts
- ❌ **NEVER:** Block workflows
- ❌ **NEVER:** Show for every minor action

**Test Cases:**
- [ ] Shows after actions
- [ ] Auto-dismisses after 5 seconds
- [ ] Can be manually dismissed
- [ ] Does NOT stack excessively
- [ ] Does NOT block workflows
- [ ] Shows appropriate icon (success/error/info)

---

## 🚀 Additional Upgrade Triggers (3 items)

### 35. Project Expiry Trigger

**Timing:** 24 hours before project expires (FREE tier)

**Rules:**
- ✅ **SHOW:** 24h before expiry
- ✅ **SHOW:** Urgent styling at 6h
- ✅ **SHOW:** Upgrade CTA
- ❌ **NEVER:** For STARTER+ tiers
- ❌ **NEVER:** After project expired

**Test Cases:**
- [ ] Shows 24h before expiry
- [ ] Shows urgent styling at 6h
- [ ] Shows upgrade CTA
- [ ] Does NOT show for paid tiers
- [ ] Can be dismissed

---

### 36. Quality Upgrade Trigger

**Timing:** When FREE user tries to select 4K quality

**Rules:**
- ✅ **SHOW:** When FREE user selects 4K
- ✅ **SHOW:** Quality comparison
- ✅ **SHOW:** Upgrade CTA
- ❌ **NEVER:** For paid tiers
- ❌ **NEVER:** Block 1080p export

**Test Cases:**
- [ ] Shows when FREE selects 4K
- [ ] Shows quality comparison
- [ ] Shows upgrade benefits
- [ ] Does NOT block 1080p
- [ ] Can be dismissed

---

### 37. API Access Trigger

**Timing:** When non-BUSINESS user tries to access API

**Rules:**
- ✅ **SHOW:** When non-BUSINESS accesses API docs
- ✅ **SHOW:** API benefits
- ✅ **SHOW:** Upgrade to BUSINESS CTA
- ❌ **NEVER:** For BUSINESS tier
- ❌ **NEVER:** Block API docs viewing

**Test Cases:**
- [ ] Shows when non-BUSINESS accesses API
- [ ] Shows API benefits
- [ ] Shows upgrade CTA
- [ ] Does NOT block docs viewing
- [ ] Can be dismissed

---

## 📊 Analytics & Tracking (5 items)

### 38. Mixpanel Events

**Implementation:**
- Track all user actions
- Track all modal interactions
- Track all conversions

**Events to Track:**
- `modal_shown`, `modal_dismissed`, `modal_completed`
- `button_clicked`, `link_clicked`
- `video_uploaded`, `processing_started`, `processing_complete`
- `clip_generated`, `export_started`, `export_complete`
- `upgrade_clicked`, `payment_complete`
- `email_sent`, `email_opened`, `email_clicked`

**Test Cases:**
- [ ] All events tracked
- [ ] Events include context
- [ ] Events include user properties
- [ ] Events sent in real-time
- [ ] No PII in events

---

### 39. Page Views

**Implementation:**
- Track all page navigations
- Track time on page
- Track exit pages

**Test Cases:**
- [ ] All page views tracked
- [ ] Time on page calculated
- [ ] Exit pages identified
- [ ] Referrer tracked
- [ ] UTM parameters captured

---

### 40. Conversion Funnels

**Implementation:**
- Signup → First project
- First project → First export
- FREE → Paid
- Trial → Paid

**Test Cases:**
- [ ] All funnels defined
- [ ] Drop-off points identified
- [ ] Conversion rates calculated
- [ ] A/B tests tracked

---

### 41. Email Analytics

**Implementation:**
- Track opens, clicks, conversions
- Track unsubscribe rates
- Track bounce rates

**Test Cases:**
- [ ] Open rates tracked
- [ ] Click rates tracked
- [ ] Conversion rates tracked
- [ ] Unsubscribe rates tracked
- [ ] Bounce rates tracked

---

### 42. A/B Tests

**Implementation:**
- Different upgrade modal copy
- Different email timing
- Different pricing displays

**Test Cases:**
- [ ] Tests defined
- [ ] Variants tracked
- [ ] Results measured
- [ ] Winners implemented

---

## 🌟 Social Proof Elements (4 items)

### 43. User Counter

**Implementation:**
- "X users created Y clips today"
- Real-time updates

**Timing Rules:**
- ✅ **SHOW:** Homepage, pricing page
- ✅ **SHOW:** Updates every 5 minutes
- ❌ **NEVER:** Show fake numbers
- ❌ **NEVER:** Show on dashboard (distracting)

**Test Cases:**
- [ ] Shows on homepage
- [ ] Shows on pricing page
- [ ] Updates in real-time
- [ ] Shows accurate numbers
- [ ] Does NOT show on dashboard

---

### 44. Testimonials

**Implementation:**
- User reviews and quotes
- Photos and names

**Timing Rules:**
- ✅ **SHOW:** Pricing page, homepage
- ✅ **SHOW:** Authentic testimonials only
- ❌ **NEVER:** Show fake testimonials
- ❌ **NEVER:** Show without permission

**Test Cases:**
- [ ] Shows on pricing page
- [ ] Shows on homepage
- [ ] All testimonials authentic
- [ ] All have user permission
- [ ] Includes photos/names

---

### 45. Case Studies

**Implementation:**
- Success stories with results
- Before/after examples

**Timing Rules:**
- ✅ **SHOW:** Blog, email campaigns
- ✅ **SHOW:** Detailed results
- ❌ **NEVER:** Show without permission
- ❌ **NEVER:** Exaggerate results

**Test Cases:**
- [ ] Shows in blog
- [ ] Shows in emails
- [ ] Includes real results
- [ ] Has user permission
- [ ] Includes before/after

---

### 46. Trust Badges

**Implementation:**
- Security badges (SSL, Stripe)
- Payment logos
- Certifications

**Timing Rules:**
- ✅ **SHOW:** Checkout, pricing page
- ✅ **SHOW:** Footer of all pages
- ❌ **NEVER:** Show fake badges
- ❌ **NEVER:** Show expired certifications

**Test Cases:**
- [ ] Shows on checkout
- [ ] Shows on pricing
- [ ] Shows in footer
- [ ] All badges authentic
- [ ] All certifications current

---

## 🔗 Referral & Viral Elements (3 items)

### 47. Referral Program

**Implementation:**
- Give 30 credits, get 30 credits
- Unique referral links

**Timing Rules:**
- ✅ **SHOW:** After successful export
- ✅ **SHOW:** In dashboard sidebar
- ✅ **SHOW:** In email signature
- ❌ **NEVER:** Before user sees value
- ❌ **NEVER:** Spam user with referral prompts

**Test Cases:**
- [ ] Shows after first export
- [ ] Shows in dashboard
- [ ] Generates unique link
- [ ] Tracks referrals
- [ ] Credits both parties
- [ ] Does NOT spam user

---

### 48. Watermark (FREE Tier)

**Implementation:**
- "Made with ClipForge" on exports
- UTM tracking on links

**Timing Rules:**
- ✅ **SHOW:** All FREE tier exports
- ✅ **SHOW:** Clickable link to signup
- ✅ **SHOW:** UTM parameters for tracking
- ❌ **NEVER:** On paid tier exports
- ❌ **NEVER:** Removable by FREE users

**Test Cases:**
- [ ] Shows on all FREE exports
- [ ] Links to signup page
- [ ] Includes UTM tracking
- [ ] Does NOT show on paid exports
- [ ] Cannot be removed by FREE users
- [ ] Tracks conversions

---

### 49. Social Share Buttons

**Implementation:**
- Share to Twitter, LinkedIn, Facebook
- Pre-filled captions

**Timing Rules:**
- ✅ **SHOW:** After export complete
- ✅ **SHOW:** In share modal
- ✅ **SHOW:** Pre-filled with clip title
- ❌ **NEVER:** Before export complete
- ❌ **NEVER:** Without user permission

**Test Cases:**
- [ ] Shows after export
- [ ] Shows all platforms
- [ ] Pre-fills captions
- [ ] Tracks shares
- [ ] Opens in new window
- [ ] Does NOT auto-post

---

## 🔧 Critical Systems to Implement

### Modal Queue System

**Purpose:** Prevent multiple modals showing at once

**Implementation:**
```typescript
class ModalQueue {
  private queue: Modal[] = [];
  private current: Modal | null = null;
  
  enqueue(modal: Modal, priority: number) {
    // Add to queue with priority
    // Show if no current modal
  }
  
  dequeue() {
    // Remove current modal
    // Show next in queue
  }
  
  clear() {
    // Clear all queued modals
  }
}
```

**Rules:**
- Only 1 modal visible at a time
- Queue by priority (critical > onboarding > upgrade > info)
- Minimum 2 seconds between modals
- Clear queue on navigation

---

### Processing State Detection

**Purpose:** Block modals during critical workflows

**Implementation:**
```typescript
const isProcessing = () => {
  return (
    uploadInProgress ||
    videoProcessing ||
    exportInProgress ||
    paymentProcessing
  );
};

const canShowModal = (modal: Modal) => {
  if (isProcessing() && !modal.isCritical) {
    return false;
  }
  return true;
};
```

**Rules:**
- Block all non-critical modals during processing
- Allow critical modals (errors, payment issues)
- Queue non-critical modals for after processing

---

### Dismissal Persistence

**Purpose:** Remember user dismissals, respect cooldowns

**Implementation:**
```typescript
const dismissModal = (modalId: string, cooldown: number) => {
  const dismissalKey = `modal_dismissed_${modalId}_${userId}`;
  const dismissalTime = Date.now();
  localStorage.setItem(dismissalKey, dismissalTime.toString());
};

const canShowModal = (modalId: string, cooldown: number) => {
  const dismissalKey = `modal_dismissed_${modalId}_${userId}`;
  const dismissalTime = localStorage.getItem(dismissalKey);
  
  if (!dismissalTime) return true;
  
  const elapsed = Date.now() - parseInt(dismissalTime);
  return elapsed > cooldown;
};
```

**Rules:**
- Store dismissal timestamp in localStorage
- Respect cooldown periods (24h for upgrade nudges)
- Clear on user action (e.g., upgrade clears all upgrade nudges)

---

### Mobile Detection

**Purpose:** Skip tour and adjust UI for mobile

**Implementation:**
```typescript
const isMobile = () => {
  return window.innerWidth < 768 || 
         /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

const shouldShowTour = () => {
  if (isMobile()) return false;
  if (hasSeenTour()) return false;
  if (hasProjects()) return false;
  return true;
};
```

**Rules:**
- Skip onboarding tour on mobile (too cramped)
- Adjust modal sizes for mobile
- Use bottom sheets instead of center modals on mobile

---

### Email Flood Prevention

**Purpose:** Limit emails per day, respect preferences

**Implementation:**
```typescript
const canSendEmail = async (userId: string, emailType: string) => {
  // Check email preferences
  const prefs = await getEmailPreferences(userId);
  if (!prefs[emailType]) return false;
  
  // Check daily limit
  const today = new Date().toDateString();
  const sentToday = await getEmailsSentToday(userId, today);
  if (sentToday.length >= 2) return false; // Max 2/day
  
  // Check cooldown for this email type
  const lastSent = await getLastEmailSent(userId, emailType);
  if (lastSent && Date.now() - lastSent < 24 * 60 * 60 * 1000) {
    return false; // 24h cooldown
  }
  
  return true;
};
```

**Rules:**
- Max 2 emails per day per user
- Respect email preferences
- 24h cooldown per email type
- Transactional emails exempt from limits

---

## ✅ Complete Implementation Checklist

### Code Changes (20 items)
- [ ] Implement modal queue system
- [ ] Implement processing state detection
- [ ] Implement dismissal persistence (localStorage)
- [ ] Implement mobile detection
- [ ] Implement email flood prevention
- [ ] Add proper delays between modals (2s minimum)
- [ ] Add export count tracking
- [ ] Add project count tracking for NPS
- [ ] Add 24h cooldown for upgrade nudges
- [ ] Add celebration toast system
- [ ] Add credits widget to sidebar
- [ ] Add processing status indicator
- [ ] Add toast notification system
- [ ] Add referral link generation
- [ ] Add watermark with UTM tracking
- [ ] Add social share buttons
- [ ] Add user counter (real-time)
- [ ] Add testimonials display
- [ ] Add trust badges
- [ ] Add all Mixpanel events

### Configuration Changes (15 items)
- [ ] Set low credits threshold to 20%
- [ ] Set upgrade modal to 3rd+ export
- [ ] Set NPS to 14 days + 3 projects
- [ ] Set email spacing (24h, 72h, 5d, 7d, 14d)
- [ ] Set trial expiry email to 3 days before
- [ ] Set watermark nudge cooldown to 24h
- [ ] Set project expiry warning to 24h
- [ ] Set celebration toast duration to 5s
- [ ] Set max emails per day to 2
- [ ] Set modal queue priorities
- [ ] Set processing state checks
- [ ] Set mobile breakpoint to 768px
- [ ] Set referral credit amount to 30
- [ ] Set weekly email to Monday 9 AM
- [ ] Set monthly email to 1st of month

### Testing Required (25 items)
- [ ] Test modal queue (no stacking)
- [ ] Test processing state (no interruptions)
- [ ] Test dismissal persistence (cooldowns work)
- [ ] Test mobile detection (tour skipped)
- [ ] Test email flood prevention (max 2/day)
- [ ] Test all 6 user scenarios
- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on desktop, tablet, mobile
- [ ] Test with real user accounts
- [ ] Test all email timing
- [ ] Test all modal timing
- [ ] Test all upgrade triggers
- [ ] Test celebration toasts
- [ ] Test credits widget
- [ ] Test processing status
- [ ] Test toast notifications
- [ ] Test referral program
- [ ] Test watermark tracking
- [ ] Test social sharing
- [ ] Test user counter
- [ ] Test testimonials
- [ ] Test trust badges
- [ ] Test all Mixpanel events
- [ ] Test conversion funnels
- [ ] Test A/B tests

---

## 📊 Updated Success Metrics

### User Experience
- **Modal abandonment rate** < 30%
- **Dismissal rate** < 50%
- **Completion rate** > 60%
- **Time to first value** < 5 minutes
- **User complaints about popups** = 0
- **Mobile bounce rate** < 40%
- **Toast dismissal rate** < 20%

### Conversion
- **Free → Paid conversion** > 10%
- **Trial → Paid conversion** > 30%
- **Upgrade modal CTR** > 5%
- **Email open rate** > 25%
- **Email click rate** > 10%
- **Referral conversion** > 5%
- **Watermark CTR** > 2%
- **Social share rate** > 3%

### Engagement
- **Daily active users** growth > 5%/week
- **Weekly active users** growth > 10%/week
- **Average session duration** > 10 minutes
- **Pages per session** > 5
- **Return visitor rate** > 40%

---

## 🎯 Final Sign-Off (Updated)

- [ ] All 61 PLG elements documented
- [ ] All timing rules defined
- [ ] All triggers verified
- [ ] Modal queue system implemented
- [ ] Processing state detection implemented
- [ ] Dismissal persistence implemented
- [ ] Mobile detection implemented
- [ ] Email flood prevention implemented
- [ ] All test scenarios passed
- [ ] No modal stacking issues
- [ ] No interruptions during workflows
- [ ] Email spacing correct
- [ ] Analytics tracking complete
- [ ] Referral program working
- [ ] Watermark tracking working
- [ ] Social sharing working
- [ ] **COMPLETE PLG TIMING AUDIT DONE**

**Audited By:** _____________  
**Date:** _____________  
**Status:** ✅ Pass / ⚠️ Issues Found / ❌ Fail  
**Coverage:** 61/61 elements (100%)
