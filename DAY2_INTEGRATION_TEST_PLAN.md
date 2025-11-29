# Day 2: Integration Testing Plan

**Date:** November 29, 2025  
**Goal:** Verify all critical user flows work end-to-end  
**Duration:** 4 hours (Morning)

---

## 🎯 **Objective**

Test the complete user journey from signup to creating their first clip, ensuring all systems (auth, credits, payments, AI features, emails) work together seamlessly.

---

## ✅ **Critical User Flows to Test**

### **Flow 1: New User Onboarding (FREE Tier)**
**Goal:** User signs up and creates their first clip

**Steps:**
1. ✅ User visits app (http://localhost:3001)
2. ✅ User signs up with Clerk
3. ✅ User is redirected to dashboard
4. ✅ User sees 60 FREE credits
5. ✅ User sees 7-day STARTER trial banner
6. ✅ Welcome email sent immediately
7. ✅ User uploads a video (or imports from URL)
8. ✅ Credits deducted (1 credit per minute)
9. ✅ Video transcribed successfully
10. ✅ User generates AI Clips
11. ✅ Clips appear in grid
12. ✅ User can preview clips
13. ✅ User can export clips (with watermark)
14. ✅ Onboarding Day 1 email sent (24 hours later)

**Expected Results:**
- ✅ All steps complete without errors
- ✅ Credits deducted correctly
- ✅ Emails sent at right times
- ✅ Watermark appears on FREE exports
- ✅ Trial activated automatically

---

### **Flow 2: Trial Activation (STARTER Tier)**
**Goal:** User's trial activates on first project

**Steps:**
1. ✅ User creates first project (from Flow 1)
2. ✅ Trial automatically activates (7 days STARTER)
3. ✅ User sees trial countdown in UI
4. ✅ Credits increase to 150 (STARTER tier)
5. ✅ User can export without watermark
6. ✅ Trial expiry email sent (3 days before end)

**Expected Results:**
- ✅ Trial activates automatically
- ✅ Credits updated correctly
- ✅ No watermark on exports
- ✅ Trial countdown visible

---

### **Flow 3: Payment & Subscription (STARTER Plan)**
**Goal:** User upgrades from FREE to STARTER

**Steps:**
1. ✅ User clicks "Upgrade" button
2. ✅ Stripe checkout opens
3. ✅ User enters test card (4242 4242 4242 4242)
4. ✅ Payment succeeds
5. ✅ Webhook received and processed
6. ✅ User tier updated to STARTER
7. ✅ Credits set to 150/month
8. ✅ Subscription active in database
9. ✅ User can export without watermark
10. ✅ Billing page shows active subscription

**Expected Results:**
- ✅ Payment flow smooth
- ✅ Webhook processed correctly
- ✅ Tier updated in database
- ✅ Credits allocated correctly
- ✅ No watermark on exports

---

### **Flow 4: Credit System**
**Goal:** Credits deduct correctly for all operations

**Operations to Test:**
1. ✅ Video upload (1 credit/min)
2. ✅ URL import (1.5 credits/min)
3. ✅ AI Clips (0 credits - included)
4. ✅ AI Reframe (0.5 credits/min)
5. ✅ AI Subtitles (0.5 credits/min)
6. ✅ Export (0.5 credits/min)

**Steps:**
1. ✅ Start with known credit balance
2. ✅ Perform each operation
3. ✅ Verify credit deduction
4. ✅ Check transaction log
5. ✅ Verify insufficient credits blocking

**Expected Results:**
- ✅ All deductions accurate
- ✅ Transaction log complete
- ✅ Insufficient credits prevents operations
- ✅ Cost preview shows correct amounts

---

### **Flow 5: AI Features**
**Goal:** All AI features work end-to-end

#### **5a. AI Clips**
1. ✅ Upload video
2. ✅ Transcription completes
3. ✅ Click "AI Clips"
4. ✅ Clips detected and generated
5. ✅ Virality scores shown
6. ✅ Clips appear in grid
7. ✅ Preview works
8. ✅ Export works

#### **5b. AI Reframe**
1. ✅ Select video
2. ✅ Click "AI Reframe"
3. ✅ Choose aspect ratio (9:16, 1:1, 4:5)
4. ✅ Reframe processes
5. ✅ Preview shows reframed video
6. ✅ Export works

#### **5c. AI Subtitles**
1. ✅ Select video
2. ✅ Click "AI Subtitles"
3. ✅ Choose caption style
4. ✅ Subtitles process
5. ✅ Preview shows captions overlay
6. ✅ Export shows burned-in captions
7. ✅ Download works

**Expected Results:**
- ✅ All features work without errors
- ✅ Processing completes successfully
- ✅ Previews show correctly
- ✅ Exports have correct output

---

### **Flow 6: Email System**
**Goal:** All automated emails send correctly

**Emails to Verify:**
1. ✅ Welcome email (immediate on signup)
2. ✅ Onboarding Day 1 (24 hours after signup)
3. ✅ Onboarding Day 3 (72 hours after signup)
4. ✅ Trial expiry (3 days before trial ends)
5. ✅ Weekly summary (Mondays 10 AM)
6. ✅ Inactivity (14 days no activity)

**Verification Method:**
- Check email logs in Resend dashboard
- Verify cron jobs are scheduled
- Test manual trigger via admin endpoint

**Expected Results:**
- ✅ All emails send at correct times
- ✅ Email content renders correctly
- ✅ CTAs work (links clickable)
- ✅ Unsubscribe works

---

### **Flow 7: Admin Panel**
**Goal:** Admin can manage users and credits

**Steps:**
1. ✅ Admin logs in
2. ✅ Access /admin dashboard
3. ✅ View user list
4. ✅ Search for user
5. ✅ View user details
6. ✅ Adjust credits manually
7. ✅ View transaction history
8. ✅ View system stats

**Expected Results:**
- ✅ Admin panel accessible
- ✅ All data displays correctly
- ✅ Credit adjustments work
- ✅ Stats accurate

---

### **Flow 8: Error Handling**
**Goal:** System handles errors gracefully

**Scenarios to Test:**
1. ✅ Invalid video file upload
2. ✅ Insufficient credits
3. ✅ Processing failure (refund credits)
4. ✅ Network timeout
5. ✅ Invalid payment card
6. ✅ Webhook failure

**Expected Results:**
- ✅ Clear error messages
- ✅ Credits refunded on failure
- ✅ No data corruption
- ✅ User can retry

---

## 🧪 **Testing Methodology**

### **1. Manual Testing (Primary)**
- Use real browser (Chrome)
- Follow user flows step-by-step
- Document any issues
- Take screenshots of key steps

### **2. API Testing (Secondary)**
- Use Postman or curl
- Test critical endpoints
- Verify response codes
- Check data integrity

### **3. Database Verification**
- Check Prisma Studio
- Verify data consistency
- Check transaction logs
- Verify credit balances

---

## 📋 **Test Checklist**

### **Authentication & Onboarding**
- [ ] User signup works
- [ ] User login works
- [ ] Dashboard loads
- [ ] Credits initialized (60 FREE)
- [ ] Welcome email sent

### **Trial System**
- [ ] Trial activates on first project
- [ ] Trial countdown shows
- [ ] Credits update to 150
- [ ] Trial expiry email sent

### **Credit System**
- [ ] Upload deducts credits
- [ ] URL import deducts 1.5x
- [ ] AI features deduct correctly
- [ ] Export deducts credits
- [ ] Insufficient credits blocks
- [ ] Transaction log accurate

### **Payment System**
- [ ] Stripe checkout opens
- [ ] Test payment succeeds
- [ ] Webhook processed
- [ ] Tier updated
- [ ] Subscription active
- [ ] Billing page shows subscription

### **AI Features**
- [ ] AI Clips works
- [ ] AI Reframe works
- [ ] AI Subtitles works
- [ ] All previews work
- [ ] All exports work

### **Email System**
- [ ] Welcome email sent
- [ ] Onboarding emails scheduled
- [ ] Trial expiry email works
- [ ] Weekly summary works
- [ ] Cron jobs running

### **Admin Panel**
- [ ] Admin login works
- [ ] User list shows
- [ ] Credit adjustment works
- [ ] Stats accurate

### **Error Handling**
- [ ] Invalid uploads rejected
- [ ] Insufficient credits blocked
- [ ] Processing failures refund
- [ ] Error messages clear

---

## 🐛 **Bug Tracking**

### **Critical Bugs (Block Launch)**
- None found yet

### **High Priority Bugs**
- None found yet

### **Medium Priority Bugs**
- None found yet

### **Low Priority Bugs**
- None found yet

---

## ✅ **Success Criteria**

**Integration testing is complete when:**
1. ✅ All 8 critical flows work end-to-end
2. ✅ All checklist items pass
3. ✅ No critical or high-priority bugs
4. ✅ All systems integrate correctly
5. ✅ User experience is smooth

---

## 📊 **Testing Progress**

**Status:** Not Started  
**Start Time:** TBD  
**End Time:** TBD  
**Duration:** 4 hours (estimated)

**Flows Tested:** 0/8  
**Checklist Items:** 0/40  
**Bugs Found:** 0  
**Bugs Fixed:** 0

---

## 🚀 **Next Steps After Testing**

1. Fix any critical bugs found
2. Document any issues
3. Update user documentation
4. Proceed to Stripe Live Mode
5. Final security audit

---

**Let's start testing!** 🧪
