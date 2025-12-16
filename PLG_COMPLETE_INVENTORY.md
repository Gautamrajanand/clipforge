# Complete PLG Element Inventory - Cross-Reference
**Date:** December 16, 2025  
**Purpose:** Ensure PLG_TIMING_AUDIT.md covers EVERY PLG element

---

## ✅ Modals & Popups (14 total)

### Covered in Audit ✅
1. **Onboarding Survey** - First visit, no projects
2. **Welcome Modal** - After survey completion
3. **Upgrade Modal (Generic)** - Multiple triggers
4. **Export Upgrade Modal** - Before export (3rd+)
5. **NPS Widget** - After 14 days + 3 projects

### MISSING from Audit ❌ - NEED TO ADD
6. **Upload Modal** - When user clicks upload
   - Timing: On demand, no restrictions
   - Should NOT show upgrade nudges on first use
   
7. **Reframe Modal** - When user clicks AI Reframe
   - Timing: On demand, after upload complete
   - Should show credit cost preview
   
8. **Subtitles Modal** - When user clicks AI Subtitles
   - Timing: On demand, after upload complete
   - Should show credit cost preview
   
9. **Clip Settings Modal** - When editing clip
   - Timing: On demand, no restrictions
   
10. **Caption Preview Modal** - When previewing captions
    - Timing: On demand, no restrictions
    
11. **Share Modal** - When sharing clip
    - Timing: After export complete
    - Should NOT interrupt workflow
    
12. **Expired Project Modal** - When accessing expired project
    - Timing: When user tries to access expired project
    - Should show upgrade CTA
    
13. **Dynamic Popup** - Generic popup system
    - Timing: Various triggers
    - Should respect modal queue
    
14. **Schedule Post Modal** - When scheduling social posts
    - Timing: On demand, after export

---

## ✅ Banners & Nudges (7 total)

### Covered in Audit ✅
1. **Trial Banner** - During trial period
2. **Low Credits Nudge** - < 20% credits
3. **Watermark Upgrade Nudge** - After watermarked export
4. **Project Expiry Nudge** - 24h before expiry
5. **Upgrade Banner (Generic)** - Various contexts

### MISSING from Audit ❌ - NEED TO ADD
6. **Celebration Toast** - After successful actions
   - Timing: After first export, first clip, milestones
   - Should be brief (3-5 seconds)
   - Should NOT stack
   
7. **Success Celebration** - Major milestones
   - Timing: After completing onboarding checklist
   - Should be dismissible

---

## ✅ Onboarding Elements (5 total)

### Covered in Audit ✅
1. **Onboarding Tour (Intro.js)** - First login
2. **Onboarding Survey** - First visit
3. **Welcome Modal** - After survey
4. **Progress Checklist** - Dashboard

### MISSING from Audit ❌ - NEED TO ADD
5. **Multi-Step Onboarding** - Alternative onboarding flow
   - Timing: If user skips survey
   - Should guide through first project creation

---

## ✅ Email Notifications (12 total)

### Covered in Audit ✅
1. **Welcome Email** - Immediate after signup
2. **Onboarding Day 1** - 24h after signup
3. **Onboarding Day 3** - 72h after signup
4. **Onboarding Day 5** - 5 days after signup
5. **Onboarding Day 7** - 7 days after signup
6. **Onboarding Day 14** - 14 days after signup
7. **Credits Low** - < 20% credits
8. **Trial Expiry** - 3 days before trial ends
9. **Processing Complete** - When processing done
10. **Payment Failed** - When payment fails

### MISSING from Audit ❌ - NEED TO ADD
11. **Processing Started** - When processing begins
    - Timing: Immediate when job starts
    - Should NOT send for quick jobs (< 1 min)
    
12. **Weekly Summary** - Weekly digest
    - Timing: Every Monday 9 AM
    - Should include stats, tips, upgrade CTA
    
13. **Inactivity Re-engagement** - User inactive
    - Timing: After 7 days of inactivity
    - Should remind of credits, projects
    
14. **Credit Adjustment** - Admin changes credits
    - Timing: Immediate when admin adjusts
    - Should explain reason
    
15. **Upgrade After Exports** - Power user prompt
    - Timing: After 5+ exports in a week
    - Should show usage stats
    
16. **Monthly Usage Report** - Monthly stats
    - Timing: First day of month
    - Should show previous month stats
    
17. **Feature Announcement** - New features
    - Timing: When new feature launches
    - Should be opt-in via email preferences

---

## ✅ In-App Notifications (3 total)

### MISSING from Audit ❌ - NEED TO ADD
1. **Credits Widget** - Sidebar credits display
   - Timing: Always visible
   - Should show low credits warning
   - Should link to credits page
   
2. **Processing Status** - Real-time updates
   - Timing: During video processing
   - Should show progress percentage
   - Should NOT be intrusive
   
3. **Toast Notifications** - Brief messages
   - Timing: After actions (save, delete, etc.)
   - Should auto-dismiss after 3-5 seconds
   - Should NOT stack

---

## ✅ Upgrade Triggers (8 total)

### Covered in Audit ✅
1. **Credits Depleted** - 0 credits
2. **Credits Low** - < 20% credits
3. **Feature Locked** - Trying locked feature
4. **Export Limit** - After 3rd export
5. **Watermark** - After watermarked export

### MISSING from Audit ❌ - NEED TO ADD
6. **Project Expiry** - Project about to expire
   - Timing: 24h before expiry
   - Should show in project page
   
7. **Quality Upgrade** - Trying higher quality
   - Timing: When FREE user selects 4K
   - Should show quality comparison
   
8. **API Access** - Trying to use API
   - Timing: When non-BUSINESS user accesses API docs
   - Should show API key management page

---

## ✅ Analytics & Tracking (5 total)

### MISSING from Audit ❌ - NEED TO ADD
1. **Mixpanel Events** - User actions
   - All modal shows/dismisses
   - All button clicks
   - All conversions
   
2. **Page Views** - Navigation tracking
   - All page visits
   - Time on page
   - Exit pages
   
3. **Conversion Funnels** - User journey
   - Signup → First project
   - First project → First export
   - FREE → Paid
   
4. **Email Analytics** - Email performance
   - Opens, clicks, conversions
   - Unsubscribe rates
   - Bounce rates
   
5. **A/B Tests** - Experimentation
   - Different upgrade modal copy
   - Different email timing
   - Different pricing displays

---

## ✅ Social Proof Elements (4 total)

### MISSING from Audit ❌ - NEED TO ADD
1. **User Counter** - "X users created Y clips today"
   - Timing: Homepage, pricing page
   - Should update in real-time
   
2. **Testimonials** - User reviews
   - Timing: Pricing page, homepage
   - Should be authentic
   
3. **Case Studies** - Success stories
   - Timing: Blog, email campaigns
   - Should show results
   
4. **Trust Badges** - Security, payments
   - Timing: Checkout, pricing page
   - Should show Stripe, SSL, etc.

---

## ✅ Referral & Viral Elements (3 total)

### MISSING from Audit ❌ - NEED TO ADD
1. **Referral Program** - Give/get credits
   - Timing: After successful export
   - Should show referral link
   - Should track referrals
   
2. **Watermark** - FREE tier branding
   - Timing: All FREE exports
   - Should include UTM tracking
   - Should link to signup
   
3. **Social Share Buttons** - Share clips
   - Timing: After export complete
   - Should pre-fill captions
   - Should track shares

---

## 🚨 CRITICAL ADDITIONS NEEDED TO AUDIT

### 1. Modal Queue System
**Current:** Multiple modals can show at once  
**Needed:** Queue system to show one at a time  
**Priority:** CRITICAL

### 2. Processing State Detection
**Current:** Modals can interrupt processing  
**Needed:** Block all non-critical modals during processing  
**Priority:** CRITICAL

### 3. Dismissal Persistence
**Current:** Some nudges reappear immediately  
**Needed:** localStorage tracking with cooldowns  
**Priority:** HIGH

### 4. Mobile Detection
**Current:** Tour shows on mobile (cramped)  
**Needed:** Skip tour on mobile devices  
**Priority:** HIGH

### 5. Email Flood Prevention
**Current:** Multiple emails can send same day  
**Needed:** Daily email limit (max 2 per day)  
**Priority:** HIGH

### 6. Context-Aware Timing
**Current:** Modals show regardless of context  
**Needed:** Check user state before showing  
**Priority:** HIGH

---

## 📋 Updated Audit Requirements

### Add These Sections to PLG_TIMING_AUDIT.md:

1. **Upload/Reframe/Subtitles Modals**
   - On-demand timing
   - Credit cost preview rules
   - No upgrade nudges on first use

2. **Celebration Toasts**
   - After successful actions
   - 3-5 second duration
   - No stacking

3. **Processing Started Email**
   - Only for jobs > 1 minute
   - Immediate send

4. **Weekly/Monthly Emails**
   - Weekly: Monday 9 AM
   - Monthly: 1st of month
   - Respect email preferences

5. **Credits Widget**
   - Always visible
   - Low credits warning
   - Links to credits page

6. **Referral Program**
   - After successful export
   - Show referral link
   - Track conversions

7. **Social Share**
   - After export complete
   - Pre-filled captions
   - Track shares

8. **Modal Queue System**
   - Implementation details
   - Priority rules
   - Timing between modals

9. **Email Flood Prevention**
   - Max 2 emails per day
   - Priority system
   - User preferences

10. **Analytics Tracking**
    - All events to track
    - Conversion funnels
    - A/B test setup

---

## ✅ Action Items

- [ ] Update PLG_TIMING_AUDIT.md with all missing elements
- [ ] Add modal queue system documentation
- [ ] Add processing state detection rules
- [ ] Add dismissal persistence rules
- [ ] Add mobile detection rules
- [ ] Add email flood prevention rules
- [ ] Add analytics tracking requirements
- [ ] Add referral program timing
- [ ] Add social proof element timing
- [ ] Add celebration toast timing
- [ ] Add all email types (17 total)
- [ ] Add credits widget rules
- [ ] Add processing status rules
- [ ] Add toast notification rules

---

## 📊 Summary

**Total PLG Elements:** 61  
**Covered in Current Audit:** 12  
**Missing from Audit:** 49  
**Completion:** 20%

**CRITICAL:** Audit needs major expansion to cover all PLG elements!

---

**Next Step:** Update PLG_TIMING_AUDIT.md to include ALL 61 elements with proper timing rules, triggers, and test cases.
