#!/bin/bash

echo "🎯 Complete Email Testing Suite"
echo "================================"
echo ""
echo "This script will help you test ALL 9 email types."
echo ""
echo "Your email: gautam@hubhopper.com"
echo ""

PS3="Choose an email to test: "
options=(
    "1. Onboarding Day 1 (set account to 1 day old)"
    "2. Onboarding Day 3 (set account to 3 days old)"
    "3. Trial Expiry (set trial to expire in 3 days)"
    "4. Weekly Summary (trigger manually)"
    "5. Inactivity (set last activity to 7 days ago)"
    "6. Credit Adjustment (use admin panel)"
    "7. Welcome Email (sign up new user)"
    "8. Credit Low Warning (reduce credits below 20%)"
    "9. Test ALL scheduled emails at once"
    "10. Reset to normal (undo test data)"
    "Quit"
)

select opt in "${options[@]}"
do
    case $opt in
        "1. Onboarding Day 1 (set account to 1 day old)")
            echo ""
            echo "Setting your account creation to 1 day ago..."
            docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
            UPDATE \"User\" SET \"createdAt\" = NOW() - INTERVAL '1 day' 
            WHERE email = 'gautam@hubhopper.com';
            "
            echo "✅ Done! Wait for 9 AM or run: ./trigger-emails-now.sh"
            break
            ;;
        "2. Onboarding Day 3 (set account to 3 days old)")
            echo ""
            echo "Setting your account creation to 3 days ago..."
            docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
            UPDATE \"User\" SET \"createdAt\" = NOW() - INTERVAL '3 days' 
            WHERE email = 'gautam@hubhopper.com';
            "
            echo "✅ Done! Wait for 9 AM or run: ./trigger-emails-now.sh"
            break
            ;;
        "3. Trial Expiry (set trial to expire in 3 days)")
            echo ""
            echo "Setting your trial to expire in 3 days..."
            docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
            UPDATE \"Organization\" o
            SET \"trialEndDate\" = NOW() + INTERVAL '3 days'
            FROM \"Membership\" m
            JOIN \"User\" u ON m.\"userId\" = u.id
            WHERE o.id = m.\"orgId\" AND u.email = 'gautam@hubhopper.com';
            "
            echo "✅ Done! Wait for 9 AM or run: ./trigger-emails-now.sh"
            break
            ;;
        "4. Weekly Summary (trigger manually)")
            echo ""
            echo "Weekly Summary runs every Monday at 9 AM."
            echo "To test now, run: ./trigger-emails-now.sh"
            echo "And select the weekly-summary option."
            break
            ;;
        "5. Inactivity (set last activity to 7 days ago)")
            echo ""
            echo "⚠️  Note: User table doesn't have lastActivityAt field yet."
            echo "This email will work when you add activity tracking."
            echo ""
            echo "For now, you can test the other emails!"
            break
            ;;
        "6. Credit Adjustment (use admin panel)")
            echo ""
            echo "✅ This one is EASY!"
            echo ""
            echo "Steps:"
            echo "1. Go to http://localhost:3001/admin"
            echo "2. Find your organization"
            echo "3. Click 'Adjust Credits'"
            echo "4. Add or remove credits"
            echo "5. Check spam folder immediately!"
            echo ""
            echo "This email works RIGHT NOW - no waiting!"
            break
            ;;
        "7. Welcome Email (sign up new user)")
            echo ""
            echo "Steps:"
            echo "1. Go to http://localhost:3001/sign-up"
            echo "2. Sign up with a NEW email (not gautam@hubhopper.com)"
            echo "3. Check that email's inbox/spam"
            echo ""
            echo "Welcome email is sent immediately on signup!"
            break
            ;;
        "8. Credit Low Warning (reduce credits below 20%)")
            echo ""
            echo "Setting your credits to 25 (below 20% of 150)..."
            docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
            UPDATE \"Organization\" o
            SET credits = 25
            FROM \"Membership\" m
            JOIN \"User\" u ON m.\"userId\" = u.id
            WHERE o.id = m.\"orgId\" AND u.email = 'gautam@hubhopper.com';
            "
            echo ""
            echo "✅ Done! Now create a clip to trigger the check."
            echo "   The system checks credit levels after each action."
            break
            ;;
        "9. Test ALL scheduled emails at once")
            echo ""
            echo "Setting up test data for multiple emails..."
            docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
            UPDATE \"User\" SET \"createdAt\" = NOW() - INTERVAL '1 day' 
            WHERE email = 'gautam@hubhopper.com';
            
            UPDATE \"Organization\" o
            SET \"trialEndDate\" = NOW() + INTERVAL '3 days'
            FROM \"Membership\" m
            JOIN \"User\" u ON m.\"userId\" = u.id
            WHERE o.id = m.\"orgId\" AND u.email = 'gautam@hubhopper.com';
            "
            echo ""
            echo "✅ Done! Your account is now set up for:"
            echo "   • Onboarding Day 1 email"
            echo "   • Trial Expiry email"
            echo ""
            echo "Wait for 9 AM or run: ./trigger-emails-now.sh"
            break
            ;;
        "10. Reset to normal (undo test data)")
            echo ""
            echo "Resetting your account to normal state..."
            docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
            UPDATE \"User\" SET \"createdAt\" = NOW() 
            WHERE email = 'gautam@hubhopper.com';
            
            UPDATE \"Organization\" o
            SET \"trialEndDate\" = NOW() + INTERVAL '7 days',
                credits = 150
            FROM \"Membership\" m
            JOIN \"User\" u ON m.\"userId\" = u.id
            WHERE o.id = m.\"orgId\" AND u.email = 'gautam@hubhopper.com';
            "
            echo "✅ Done! Account reset to normal."
            break
            ;;
        "Quit")
            echo "Goodbye!"
            break
            ;;
        *) 
            echo "Invalid option $REPLY"
            ;;
    esac
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Current Account State:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose exec -T postgres psql -U clipforge -d clipforge_dev -c "
SELECT 
    u.email,
    u.\"createdAt\",
    AGE(NOW(), u.\"createdAt\") as account_age,
    o.credits,
    o.\"trialEndDate\",
    CASE 
        WHEN o.\"trialEndDate\" > NOW() THEN AGE(o.\"trialEndDate\", NOW())
        ELSE NULL
    END as trial_expires_in
FROM \"User\" u
JOIN \"Membership\" m ON u.id = m.\"userId\"
JOIN \"Organization\" o ON m.\"orgId\" = o.id
WHERE u.email = 'gautam@hubhopper.com';
"
echo ""
echo "✅ Testing setup complete!"
