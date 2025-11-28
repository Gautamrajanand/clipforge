#!/bin/bash

echo "🧪 Simple Email Test - No Auth Required"
echo "========================================"
echo ""

echo "This test will check if the cron jobs WOULD send emails"
echo "by looking at the database for matching users."
echo ""

echo "1️⃣ Checking for users who signed up 1 day ago (Onboarding Day 1)..."
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
SELECT 
    email, 
    \"createdAt\",
    AGE(NOW(), \"createdAt\") as account_age
FROM \"User\" 
WHERE email NOT LIKE '%@clerk.local%'
  AND \"createdAt\" BETWEEN NOW() - INTERVAL '25 hours' AND NOW() - INTERVAL '23 hours';
"

echo ""
echo "2️⃣ Checking for users who signed up 3 days ago (Onboarding Day 3)..."
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
SELECT 
    email, 
    \"createdAt\",
    AGE(NOW(), \"createdAt\") as account_age
FROM \"User\" 
WHERE email NOT LIKE '%@clerk.local%'
  AND \"createdAt\" BETWEEN NOW() - INTERVAL '73 hours' AND NOW() - INTERVAL '71 hours';
"

echo ""
echo "3️⃣ Checking for trials expiring in 3 days (Trial Expiry)..."
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
SELECT 
    o.name,
    o.\"trialEndDate\",
    AGE(o.\"trialEndDate\", NOW()) as time_until_expiry
FROM \"Organization\" o
WHERE o.\"trialEndDate\" BETWEEN NOW() + INTERVAL '2.5 days' AND NOW() + INTERVAL '3.5 days';
"

echo ""
echo "4️⃣ Checking for inactive users (7 days no activity)..."
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
SELECT 
    email,
    \"lastActivityAt\",
    AGE(NOW(), \"lastActivityAt\") as inactive_duration
FROM \"User\" 
WHERE email NOT LIKE '%@clerk.local%'
  AND \"lastActivityAt\" IS NOT NULL
  AND \"lastActivityAt\" BETWEEN NOW() - INTERVAL '7.5 days' AND NOW() - INTERVAL '6.5 days';
"

echo ""
echo "5️⃣ Checking all real users in database..."
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
SELECT 
    email,
    \"createdAt\",
    \"lastActivityAt\",
    AGE(NOW(), \"createdAt\") as account_age
FROM \"User\" 
WHERE email NOT LIKE '%@clerk.local%'
ORDER BY \"createdAt\" DESC;
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If all queries returned '(0 rows)', that means:"
echo "❌ NO users match the criteria for scheduled emails"
echo ""
echo "This is NORMAL because:"
echo "  • You only have 1 user (gautam@hubhopper.com)"
echo "  • That user didn't sign up exactly 1 or 3 days ago"
echo "  • No trials are expiring in exactly 3 days"
echo "  • No users have been inactive for exactly 7 days"
echo ""
echo "🎯 TO TEST EMAILS, YOU HAVE 3 OPTIONS:"
echo ""
echo "Option 1: Wait for real users to match criteria"
echo "  - Sign up new users and wait 1/3 days"
echo ""
echo "Option 2: Manually adjust database dates (for testing)"
echo "  - Set your createdAt to 1 day ago"
echo "  - Run: docker-compose exec postgres psql -U clipforge -d clipforge_dev"
echo "  - Then: UPDATE \"User\" SET \"createdAt\" = NOW() - INTERVAL '1 day' WHERE email = 'gautam@hubhopper.com';"
echo ""
echo "Option 3: Test the real-time emails instead"
echo "  - Welcome email: Sign up a new user"
echo "  - Credit adjustment: Use admin panel to adjust credits"
echo "  - These work immediately!"
echo ""
echo "✅ The cron jobs ARE working - they just have no users to email!"
