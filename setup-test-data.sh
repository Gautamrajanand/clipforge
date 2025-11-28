#!/bin/bash

echo "🧪 Setting Up Test Data for Email Testing"
echo "=========================================="
echo ""
echo "This will modify your gautam@hubhopper.com account to match"
echo "the criteria for ALL scheduled emails."
echo ""
read -p "Continue? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "📝 Current state of your account:"
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
SELECT 
    u.email,
    u.\"createdAt\",
    AGE(NOW(), u.\"createdAt\") as account_age,
    o.name as org_name,
    o.\"trialEndDate\",
    o.credits
FROM \"User\" u
JOIN \"Membership\" m ON u.id = m.\"userId\"
JOIN \"Organization\" o ON m.\"orgId\" = o.id
WHERE u.email = 'gautam@hubhopper.com';
"

echo ""
echo "🔧 Modifying data to trigger ALL email types..."
echo ""

# 1. Set createdAt to 1 day ago (for Onboarding Day 1)
echo "1️⃣ Setting account creation to 1 day ago (Onboarding Day 1)..."
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
UPDATE \"User\" 
SET \"createdAt\" = NOW() - INTERVAL '1 day'
WHERE email = 'gautam@hubhopper.com';
"

# 2. Set trial to expire in 3 days (for Trial Expiry)
echo "2️⃣ Setting trial to expire in 3 days (Trial Expiry)..."
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
UPDATE \"Organization\" o
SET \"trialEndDate\" = NOW() + INTERVAL '3 days'
FROM \"Membership\" m
JOIN \"User\" u ON m.\"userId\" = u.id
WHERE o.id = m.\"orgId\" 
  AND u.email = 'gautam@hubhopper.com';
"

echo ""
echo "✅ Test data setup complete!"
echo ""
echo "📊 Updated state:"
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
SELECT 
    u.email,
    u.\"createdAt\",
    AGE(NOW(), u.\"createdAt\") as account_age,
    o.name as org_name,
    o.\"trialEndDate\",
    AGE(o.\"trialEndDate\", NOW()) as trial_expires_in,
    o.credits
FROM \"User\" u
JOIN \"Membership\" m ON u.id = m.\"userId\"
JOIN \"Organization\" o ON m.\"orgId\" = o.id
WHERE u.email = 'gautam@hubhopper.com';
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 WHAT WILL HAPPEN NOW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Onboarding Day 1 Email - Will send at next 9 AM"
echo "   (Your account now shows as created 1 day ago)"
echo ""
echo "✅ Trial Expiry Email - Will send at next 9 AM"
echo "   (Your trial now expires in 3 days)"
echo ""
echo "⏳ Onboarding Day 3 Email - Not yet"
echo "   (Need to wait 2 more days OR run this script again in 2 days)"
echo ""
echo "⏳ Weekly Summary - Will send next Monday at 9 AM"
echo "   (Runs every Monday for all active users)"
echo ""
echo "⏳ Inactivity Email - Not applicable"
echo "   (You're actively using the system)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option 1: Wait for 9 AM tomorrow"
echo "  - Cron jobs will run automatically"
echo "  - You'll receive 2 emails (Day 1 + Trial Expiry)"
echo "  - Check logs: docker-compose logs api --since=1h | grep 'email job'"
echo ""
echo "Option 2: Manually trigger NOW (requires auth token)"
echo "  - Run: ./trigger-emails-now.sh"
echo "  - Get token from browser DevTools"
echo "  - Emails sent immediately"
echo ""
echo "Option 3: Test Day 3 email"
echo "  - Wait 2 more days"
echo "  - OR run: ./setup-test-data-day3.sh (I'll create this next)"
echo ""
echo "✅ Your account is now ready for email testing!"
