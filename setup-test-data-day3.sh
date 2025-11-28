#!/bin/bash

echo "🧪 Setting Up Test Data for Day 3 Onboarding Email"
echo "==================================================="
echo ""
echo "This will set your account creation date to 3 days ago"
echo "to trigger the Onboarding Day 3 email."
echo ""
read -p "Continue? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🔧 Setting account creation to 3 days ago..."
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
UPDATE \"User\" 
SET \"createdAt\" = NOW() - INTERVAL '3 days'
WHERE email = 'gautam@hubhopper.com';
"

echo ""
echo "✅ Done! Your account now shows as created 3 days ago."
echo ""
echo "📊 Current state:"
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
SELECT 
    email,
    \"createdAt\",
    AGE(NOW(), \"createdAt\") as account_age
FROM \"User\" 
WHERE email = 'gautam@hubhopper.com';
"

echo ""
echo "🎯 The Onboarding Day 3 email will be sent at next 9 AM!"
echo "   OR trigger manually with: ./trigger-emails-now.sh"
