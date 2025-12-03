# PLG Growth Engine - Complete Testing Guide

## 🎉 Status: READY FOR TESTING

All PLG features have been implemented and are ready for comprehensive testing!

---

## ✅ What's Been Completed

### 1. **Referral Program** ✅
- **Backend**: Full API with referral tracking, rewards, leaderboard
- **Frontend**: User referral dashboard at `/dashboard/referrals`
- **Admin**: Referral management at `/admin/plg/referrals`
- **Features**:
  - Unique referral codes per user
  - +30 credits for referrer
  - +30 credits for referred user
  - Social sharing (Twitter, LinkedIn, Email, Copy link)
  - Leaderboard
  - Recent referrals tracking

### 2. **Onboarding System** ✅
- **Backend**: Progress tracking API
- **Database**: OnboardingProgress table
- **Admin**: Analytics at `/admin/plg/onboarding`
- **Steps**: WELCOME → UPLOAD_VIDEO → VIEW_CLIPS → CUSTOMIZE_CLIP → EXPORT_CLIP → SHARE_REFERRAL → COMPLETED

### 3. **NPS & Feedback System** ✅ (NEW - Free Alternative)
- **Backend**: Custom NPS API (no Delighted needed!)
- **Frontend**: NPS modal widget (shows after 5 seconds for testing)
- **Admin**: NPS dashboard at `/admin/plg/nps`
- **Features**:
  - 0-10 NPS scoring
  - Automatic categorization (Detractor/Passive/Promoter)
  - Optional feedback text
  - NPS score calculation
  - Feedback management system
  - Resolve/unresolve feedback

### 4. **Upgrade Nudges** ✅
- **Component**: Smart upgrade modals
- **Hook**: `useUpgradeTriggers` with intelligent timing
- **Triggers**:
  - Credits low (< 20%)
  - Credits depleted (0)
  - Feature locked
  - Export limit reached
  - Quality upgrade prompt
- **Features**:
  - Frequency limiting (don't spam users)
  - Priority-based showing
  - Contextual messaging
  - Easy dismissal

### 5. **Social Proof Components** ✅
- **Created** (not yet integrated into pages):
  - `TestimonialsSection` - Customer testimonials with ratings
  - `UsageCounter` - Animated stats (creators, clips, hours saved)
  - `TrustBadges` - Security, GDPR, uptime badges
  - `CompanyLogos` - Featured companies
  - `CaseStudyCard` - Detailed success stories

### 6. **Admin PLG Dashboard** ✅
- **Main Dashboard**: `/admin/plg`
- **Referrals**: `/admin/plg/referrals`
- **Onboarding**: `/admin/plg/onboarding`
- **NPS & Feedback**: `/admin/plg/nps` (NEW!)

---

## 🧪 Testing Instructions

### Prerequisites
1. **API must be running**: `docker-compose up -d` (currently rebuilding)
2. **You must be an admin**: Already set up ✅
3. **Frontend running**: `http://localhost:3001`

### Test 1: Referral Program

#### As a User:
1. Go to `http://localhost:3001/dashboard/referrals`
2. **Verify**:
   - You see your unique referral code
   - Social share buttons work
   - Copy link button works
   - Stats show 0 referrals initially

#### Test Referral Flow:
1. Copy your referral link
2. Open an incognito window
3. Sign up using the referral link
4. **Verify**:
   - New user gets +30 credits
   - You (referrer) get +30 credits
   - Referral appears in your dashboard
   - Status shows as PENDING or COMPLETED

#### As Admin:
1. Go to `http://localhost:3001/admin/plg/referrals`
2. **Verify**:
   - See referral overview stats
   - Recent referrals table shows data
   - Top referrers leaderboard
   - Search functionality works

---

### Test 2: NPS & Feedback System (NEW!)

#### As a User:
1. Go to `http://localhost:3001/dashboard`
2. **Wait 5 seconds** - NPS modal should appear
3. **Test NPS Survey**:
   - Click a score (0-10)
   - Enter optional feedback
   - Submit
   - **Verify**: Success message appears
4. **Refresh page** - NPS should NOT appear again (one-time)

#### Submit Feedback:
1. Create a feedback submission endpoint test:
```bash
curl -X POST http://localhost:3000/v1/nps/feedback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "FEATURE_REQUEST",
    "message": "Would love to see batch export feature!",
    "rating": 5,
    "page": "/dashboard"
  }'
```

#### As Admin:
1. Go to `http://localhost:3001/admin/plg/nps`
2. **Verify NPS Dashboard**:
   - NPS Score displayed (calculated correctly)
   - Promoters/Passives/Detractors counts
   - Recent NPS responses table
   - User feedback list
3. **Test Feedback Management**:
   - Filter by: All / Unresolved / Resolved
   - Click "Mark Resolved" on feedback
   - **Verify**: Status changes to Resolved

---

### Test 3: Upgrade Nudges

#### Trigger Conditions:
1. **Credits Low**: Set your credits to < 12 (20% of 60)
2. **Credits Depleted**: Set credits to 0
3. **Feature Locked**: Try accessing a PRO feature on FREE tier

#### Test Modal:
1. Trigger any condition above
2. **Verify**:
   - Modal appears with appropriate message
   - Can dismiss modal
   - Modal doesn't reappear immediately (frequency limiting)
   - "Upgrade" button links to `/pricing`

---

### Test 4: Onboarding Analytics

#### As Admin:
1. Go to `http://localhost:3001/admin/plg/onboarding`
2. **Verify**:
   - Step completion rates displayed
   - Drop-off analysis
   - Recommendations shown
   - Visual progress bars

---

### Test 5: Admin PLG Dashboard

1. Go to `http://localhost:3001/admin/plg`
2. **Verify**:
   - Referral stats card
   - Onboarding stats card
   - Links to detailed pages work
   - NPS & Feedback card shows "View Dashboard →" link

---

## 🔧 Manual Database Testing

### Check NPS Data:
```sql
-- View all NPS responses
SELECT * FROM "NPSResponse" ORDER BY "createdAt" DESC;

-- Calculate NPS Score
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN category = 'PROMOTER' THEN 1 ELSE 0 END) as promoters,
  SUM(CASE WHEN category = 'DETRACTOR' THEN 1 ELSE 0 END) as detractors,
  ROUND(
    (SUM(CASE WHEN category = 'PROMOTER' THEN 1 ELSE 0 END)::float - 
     SUM(CASE WHEN category = 'DETRACTOR' THEN 1 ELSE 0 END)::float) / 
    COUNT(*)::float * 100
  ) as nps_score
FROM "NPSResponse";
```

### Check Feedback:
```sql
-- View all feedback
SELECT * FROM "Feedback" ORDER BY "createdAt" DESC;

-- Count by type
SELECT type, COUNT(*) FROM "Feedback" GROUP BY type;

-- Unresolved feedback
SELECT * FROM "Feedback" WHERE resolved = false;
```

### Check Referrals:
```sql
-- View all referrals
SELECT * FROM "Referral" ORDER BY "createdAt" DESC;

-- Referral stats
SELECT 
  status,
  COUNT(*) as count,
  SUM("referrerReward") as total_rewards
FROM "Referral"
GROUP BY status;
```

---

## 🐛 Troubleshooting

### API Not Responding
```bash
# Check API status
docker ps | grep clipforge-api

# Check API logs
docker logs clipforge-api --tail 50

# Restart API
docker restart clipforge-api
```

### Database Issues
```bash
# Check Prisma client
docker exec clipforge-api npx prisma generate

# Check migrations
docker exec clipforge-postgres psql -U clipforge -d clipforge_dev -c "\dt"
```

### Frontend Issues
```bash
# Check web container
docker logs clipforge-web --tail 50

# Restart web
docker restart clipforge-web
```

---

## 📊 Success Metrics to Track

### Referral Program:
- **Referral Rate**: % of users who share referral link
- **Conversion Rate**: % of referred users who sign up
- **Viral Coefficient**: referrals per user × conversion rate
- **Target**: K > 1.2 (viral growth)

### NPS:
- **NPS Score**: (% Promoters) - (% Detractors)
- **Target**: NPS > 50 (excellent)
- **Response Rate**: % of users who complete survey
- **Target**: > 30%

### Onboarding:
- **Completion Rate**: % who complete all steps
- **Target**: > 50%
- **Time to First Export**: Average time
- **Target**: < 10 minutes

### Upgrade Nudges:
- **Show Rate**: How often nudges are shown
- **Dismiss Rate**: % who dismiss
- **Conversion Rate**: % who upgrade after seeing nudge
- **Target**: > 5% conversion

---

## 🚀 What's NOT Included (Future Work)

### Intercom Integration
- Requires: `NEXT_PUBLIC_INTERCOM_APP_ID`
- Cost: $74/month (Basic plan)
- Alternative: Use Crisp (free tier available)

### Social Proof Integration
- Components are built but not integrated into pages
- Need to add to:
  - Homepage
  - Pricing page
  - Landing pages

### Advanced Analytics
- PostHog (feature flags, A/B testing)
- Hotjar (heatmaps, recordings)
- Google Analytics 4

---

## ✅ Testing Checklist

- [ ] Referral code generation works
- [ ] Referral rewards credited correctly
- [ ] Social sharing buttons functional
- [ ] NPS modal appears and submits
- [ ] NPS score calculated correctly
- [ ] Feedback submission works
- [ ] Feedback can be resolved
- [ ] Upgrade nudges trigger correctly
- [ ] Admin dashboards load data
- [ ] All navigation links work
- [ ] No console errors
- [ ] Mobile responsive

---

## 🎯 Next Steps After Testing

1. **If everything works**:
   - Adjust NPS timing (currently 5s for testing → 7 days for production)
   - Configure upgrade nudge frequency
   - Add social proof to homepage
   - Set up analytics integrations

2. **If issues found**:
   - Document bugs
   - Check API logs
   - Verify database schema
   - Test individual endpoints

3. **Production Readiness**:
   - Switch to production Clerk keys
   - Configure email sending (Resend)
   - Set up monitoring (Sentry)
   - Enable rate limiting

---

## 📞 Support

If you encounter issues:
1. Check Docker containers are running
2. Check API logs for errors
3. Verify database tables exist
4. Test API endpoints directly with curl
5. Check browser console for frontend errors

**All PLG features are now complete and ready for your testing!** 🚀
