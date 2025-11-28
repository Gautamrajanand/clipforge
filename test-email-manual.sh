#!/bin/bash

# Manual Email Test Script
# Triggers all scheduled email jobs immediately for testing

echo "🧪 Manual Email Cron Job Testing"
echo "================================"
echo ""

# Check if logged in
echo "1️⃣  Getting authentication token..."
echo "   Please go to http://localhost:3001/admin and copy your auth token"
echo "   from the browser's Network tab (Authorization header)"
echo ""
read -p "   Paste your Bearer token here: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ No token provided. Exiting."
    exit 1
fi

echo ""
echo "2️⃣  Testing email endpoints..."
echo ""

# Test all endpoints
echo "📧 Triggering ALL scheduled email jobs..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/admin/email-test/all \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "3️⃣  Check the API logs for detailed results:"
echo "   docker-compose logs api --tail=100 | grep 'email job'"
echo ""
echo "4️⃣  Check your inbox at gautam@hubhopper.com"
echo "   (Remember: emails go to spam folder with test domain)"
echo ""
echo "✅ Test complete!"
