#!/bin/bash

echo "🚀 Triggering Email Cron Jobs Manually"
echo "======================================"
echo ""

# Get Clerk session token from browser
echo "📋 Step 1: Getting your auth token..."
echo ""
echo "Please follow these steps:"
echo "1. Keep the admin dashboard open in your browser (localhost:3001/admin)"
echo "2. Press F12 to open DevTools"
echo "3. Go to the 'Network' tab"
echo "4. Refresh the page (Cmd+R or Ctrl+R)"
echo "5. Click on any request (like 'dashboard' or 'analytics')"
echo "6. Look for 'Request Headers' section"
echo "7. Find 'authorization: Bearer ...' and copy ONLY the token part (after 'Bearer ')"
echo ""
read -p "Paste your token here: " TOKEN

if [ -z "$TOKEN" ]; then
    echo ""
    echo "❌ No token provided. Let me show you exactly where to find it..."
    echo ""
    echo "In DevTools Network tab, you'll see something like:"
    echo "  authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
    echo ""
    echo "Copy everything AFTER 'Bearer ' (the long string)"
    exit 1
fi

echo ""
echo "✅ Token received!"
echo ""
echo "🔥 Triggering ALL email cron jobs now..."
echo ""

# Call the API
RESPONSE=$(curl -s -X POST http://localhost:3000/admin/email-test/all \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Check if successful
if echo "$RESPONSE" | grep -q "success"; then
    echo "✅ SUCCESS! Email jobs triggered!"
    echo ""
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "📊 Now checking logs..."
    echo ""
    docker-compose logs api --tail=50 | grep -i "email job\|email sent" | tail -20
    echo ""
    echo "✅ DONE! Check your email at gautam@hubhopper.com"
    echo "   (Look in SPAM folder - using test domain)"
else
    echo "❌ Error occurred:"
    echo "$RESPONSE"
    echo ""
    echo "💡 Possible issues:"
    echo "   - Token might be expired (refresh the page and get a new one)"
    echo "   - Make sure you copied the FULL token"
    echo "   - Make sure you're logged in as admin"
fi

echo ""
echo "📧 To check if emails were sent:"
echo "   docker-compose logs api --tail=100 | grep 'email'"
