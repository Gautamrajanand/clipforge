# Beta User Setup Guide
**How to give free PRO access to beta testers**

---

## 🎁 GIVING FREE PRO ACCESS

### Option 1: Admin Panel (Recommended)
```bash
1. Go to: https://app.clipforge.ai/admin
2. Search for user by email
3. Click "Adjust Credits"
4. Set tier to "PRO"
5. Set credits to 300 (or unlimited: 999999)
6. Set expiry to "Never" or specific date
```

### Option 2: Direct Database Update
```sql
-- Update user to PRO tier with unlimited credits
UPDATE "User"
SET 
  "tier" = 'PRO',
  "credits" = 999999,
  "creditsAllocation" = 300,
  "creditsResetDate" = NOW() + INTERVAL '1 year'
WHERE "email" = 'beta-user@example.com';
```

### Option 3: API Endpoint (For Bulk)
```bash
# Create a beta user script
curl -X POST https://api.clipforge.ai/v1/admin/users/grant-beta-access \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "beta-user@example.com",
    "tier": "PRO",
    "credits": 999999,
    "duration": "3 months"
  }'
```

---

## 📋 BETA USER CHECKLIST

### Before Inviting Users
- [ ] Production environment deployed
- [ ] Sentry error tracking active
- [ ] Admin panel accessible
- [ ] Test account created and working
- [ ] Onboarding flow tested

### For Each Beta User
- [ ] Send invite email with instructions
- [ ] Grant PRO access (300 credits or unlimited)
- [ ] Add to beta users list (track in spreadsheet)
- [ ] Send welcome message on Intercom
- [ ] Schedule follow-up in 1 week

### During Beta
- [ ] Monitor Sentry for errors
- [ ] Check usage patterns daily
- [ ] Respond to feedback within 24h
- [ ] Ship bug fixes within 48h
- [ ] Weekly check-in with active users

---

## 📧 BETA INVITE EMAIL TEMPLATE

```
Subject: You're invited to ClipForge Private Beta! 🎉

Hi [Name],

You're one of the first people to get access to ClipForge - our AI-powered video editing platform that turns long videos into viral clips in minutes.

**What you get (FREE during beta):**
✅ PRO tier access (worth $79/month)
✅ 300 credits/month (= 300 minutes of video)
✅ All features unlocked:
   - AI Clips (automatic viral moment detection)
   - AI Reframe (landscape → vertical)
   - AI Subtitles (18 caption styles)
   - No watermarks
   - 4K exports
   - Priority support

**Get Started:**
1. Sign up: https://app.clipforge.ai/sign-up
2. Use this email: [their-email]
3. Upload your first video
4. Let the AI work its magic ✨

**We need your help:**
- Try all the features
- Break things (we'll fix them!)
- Share honest feedback
- Tell us what's missing

**Questions?** Reply to this email or chat with us in-app (Intercom widget).

Looking forward to seeing what you create!

Best,
[Your Name]
ClipForge Team

P.S. You're beta user #[X]. Your feedback will shape the product! 🚀
```

---

## 📊 BETA USER TRACKING

### Spreadsheet Template
```
| Name | Email | Invited | Signed Up | First Clip | Active | Feedback | NPS |
|------|-------|---------|-----------|------------|--------|----------|-----|
| John | john@example.com | 2025-01-01 | 2025-01-01 | Yes | Yes | "Love it!" | 10 |
```

### Key Metrics to Track
- **Activation Rate:** % who create first clip
- **Retention:** % active after 7 days
- **Engagement:** Avg clips created per user
- **NPS:** Net Promoter Score (0-10)
- **Top Features:** Most used features
- **Pain Points:** Most reported issues

---

## 🎯 BETA SUCCESS CRITERIA

### Week 1 (10 users)
- ✅ 80%+ activation (create first clip)
- ✅ <5% error rate
- ✅ Positive feedback from 8/10 users
- ✅ No critical bugs

### Week 2-3 (20-30 users)
- ✅ 50%+ D7 retention
- ✅ <2% error rate
- ✅ NPS >40
- ✅ 3+ feature requests validated

### Week 4 (Ready for Payments)
- ✅ 30+ active users
- ✅ <1% error rate
- ✅ NPS >50
- ✅ Clear value proposition
- ✅ Users asking "when can I pay?"

---

## 💡 TIPS FOR BETA SUCCESS

### Do's ✅
- **Respond fast:** Reply to feedback within 24h
- **Ship fast:** Fix bugs within 48h
- **Over-communicate:** Weekly updates to beta users
- **Show appreciation:** Thank users for feedback
- **Be transparent:** Share roadmap, challenges

### Don'ts ❌
- **Don't ignore feedback:** Every comment matters
- **Don't over-promise:** Be realistic about timelines
- **Don't go silent:** Keep users in the loop
- **Don't rush payments:** Validate first, monetize later
- **Don't forget to celebrate:** Share wins with beta users

---

## 🚀 TRANSITION TO PAID

### When to Switch to Stripe Live Mode
**Signals you're ready:**
1. 20+ active beta users
2. NPS >50
3. Users asking "when can I pay?"
4. <1% error rate
5. Clear pricing validated
6. Confident in value proposition

### How to Transition
```
Week 1: Announce paid plans coming
Week 2: Offer beta users 50% lifetime discount
Week 3: Switch Stripe to live mode
Week 4: Start accepting payments
```

### Beta User Rewards
**Lifetime Discount:** 50% off forever
- STARTER: $29 → $15/month
- PRO: $79 → $40/month
- BUSINESS: $99 → $50/month

**Why:** Beta users took a risk on you. Reward them.

---

## 📞 NEED HELP?

If you need to:
- Grant beta access to a user
- Check user activity
- Adjust credits/tier
- Troubleshoot issues

Use the admin panel: https://app.clipforge.ai/admin

Or run SQL queries directly on Supabase dashboard.
