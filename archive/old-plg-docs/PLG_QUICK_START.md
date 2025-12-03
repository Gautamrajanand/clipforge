# PLG Features - Quick Start Guide

## 🚀 Quick Access URLs

### User Pages:
- **Dashboard**: http://localhost:3001/dashboard
- **Referrals**: http://localhost:3001/dashboard/referrals

### Admin Pages:
- **PLG Overview**: http://localhost:3001/admin/plg
- **Referrals Admin**: http://localhost:3001/admin/plg/referrals
- **Onboarding Admin**: http://localhost:3001/admin/plg/onboarding
- **NPS & Feedback**: http://localhost:3001/admin/plg/nps ⭐ NEW!

---

## ⚡ Quick Test Commands

### Check API Status:
```bash
curl http://localhost:3000/health
```

### Test NPS Submission:
```bash
# Get your token from browser DevTools → Application → Cookies
curl -X POST http://localhost:3000/v1/nps/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"score": 9, "feedback": "Love it!", "context": "dashboard"}'
```

### Check NPS Status:
```bash
curl http://localhost:3000/v1/nps/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### View Database:
```bash
# Connect to database
docker exec -it clipforge-postgres psql -U clipforge -d clipforge_dev

# View NPS responses
SELECT * FROM "NPSResponse" ORDER BY "createdAt" DESC LIMIT 10;

# View feedback
SELECT * FROM "Feedback" ORDER BY "createdAt" DESC LIMIT 10;

# Calculate NPS Score
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

---

## 🎯 What to Test First

### 1. NPS Widget (2 minutes)
1. Go to http://localhost:3001/dashboard
2. Wait 5 seconds
3. NPS modal should appear
4. Click a score (0-10)
5. Add feedback (optional)
6. Submit
7. Verify success message

### 2. Admin NPS Dashboard (2 minutes)
1. Go to http://localhost:3001/admin/plg/nps
2. Verify NPS score is displayed
3. Check Promoters/Passives/Detractors counts
4. View recent responses table
5. Check feedback list

### 3. Referral System (5 minutes)
1. Go to http://localhost:3001/dashboard/referrals
2. Copy your referral link
3. Open incognito window
4. Sign up using referral link
5. Verify both users get +30 credits

### 4. Upgrade Nudges (2 minutes)
1. Set your credits to 10 (< 20% of 60)
2. Reload dashboard
3. Upgrade modal should appear
4. Test dismiss functionality

---

## 🐛 Troubleshooting

### API Not Responding:
```bash
docker restart clipforge-api
docker logs clipforge-api --tail 50
```

### Database Issues:
```bash
docker exec clipforge-api npx prisma generate
docker restart clipforge-api
```

### Frontend Issues:
```bash
docker restart clipforge-web
docker logs clipforge-web --tail 50
```

### Check All Containers:
```bash
docker-compose ps
```

---

## 📊 Key Features Summary

| Feature | Status | URL |
|---------|--------|-----|
| Referral Program | ✅ Ready | `/dashboard/referrals` |
| Onboarding Tracking | ✅ Ready | `/admin/plg/onboarding` |
| NPS & Feedback | ✅ Ready | `/admin/plg/nps` |
| Upgrade Nudges | ✅ Ready | Integrated in dashboard |
| Social Proof | ✅ Built | Not yet integrated |
| Admin Dashboard | ✅ Ready | `/admin/plg` |

---

## 💡 Pro Tips

1. **NPS Timing**: Currently shows after 5 seconds for testing. Change to 7 days for production.

2. **Referral Testing**: Use incognito windows to test referral flow without creating multiple accounts.

3. **Admin Access**: You're already set as admin. To add more admins:
   ```sql
   UPDATE "User" SET "isAdmin" = true WHERE email = 'admin@example.com';
   ```

4. **Database Queries**: Use `\dt` to list all tables, `\d "TableName"` to describe a table.

5. **API Logs**: Add `console.log()` in services for debugging, then check `docker logs clipforge-api`.

---

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ NPS modal appears on dashboard
- ✅ NPS submission shows success message
- ✅ Admin NPS dashboard shows your submission
- ✅ Referral code is generated and shareable
- ✅ Upgrade nudges trigger based on conditions
- ✅ All admin dashboards load without errors

---

**Need Help?** Check `PLG_COMPLETE_TESTING_GUIDE.md` for detailed instructions!
