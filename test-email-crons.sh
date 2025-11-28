#!/bin/bash

# Test Email Cron Jobs
# This script helps verify that all scheduled email cron jobs are working

echo "🧪 Testing ClipForge Email System Cron Jobs"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if API is running
echo "1️⃣  Checking if API is running..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ API is running${NC}"
else
    echo -e "${RED}❌ API is not running. Start it with: docker-compose up -d api${NC}"
    exit 1
fi

echo ""
echo "2️⃣  Checking ScheduleModule initialization..."
if docker-compose logs api --tail=500 | grep -q "ScheduleModule dependencies initialized"; then
    echo -e "${GREEN}✅ ScheduleModule is initialized${NC}"
else
    echo -e "${RED}❌ ScheduleModule not found in logs${NC}"
fi

echo ""
echo "3️⃣  Checking for cron job registrations..."
echo -e "${YELLOW}Looking for @Cron decorators in email-scheduler.service.ts...${NC}"

# Check if cron decorators are uncommented
if grep -q "^  @Cron" apps/api/src/email/email-scheduler.service.ts; then
    echo -e "${GREEN}✅ Cron decorators are enabled${NC}"
    echo ""
    echo "Found cron jobs:"
    grep -n "@Cron" apps/api/src/email/email-scheduler.service.ts | sed 's/^/   /'
else
    echo -e "${RED}❌ Cron decorators are commented out${NC}"
fi

echo ""
echo "4️⃣  Checking Node version (should be 20+)..."
NODE_VERSION=$(docker-compose exec -T api node --version)
echo "   Node version: $NODE_VERSION"
if [[ $NODE_VERSION == v20* ]] || [[ $NODE_VERSION == v21* ]] || [[ $NODE_VERSION == v22* ]]; then
    echo -e "${GREEN}✅ Node 20+ detected (crypto.randomUUID() available)${NC}"
else
    echo -e "${RED}❌ Node version is too old. Upgrade to Node 20+${NC}"
fi

echo ""
echo "5️⃣  Checking for recent cron job executions..."
echo -e "${YELLOW}Looking for cron job logs from the last 24 hours...${NC}"

# Check for any cron job execution logs
if docker-compose logs api --since=24h | grep -q "Running.*email job"; then
    echo -e "${GREEN}✅ Found cron job executions:${NC}"
    docker-compose logs api --since=24h | grep "Running.*email job" | tail -5 | sed 's/^/   /'
else
    echo -e "${YELLOW}⚠️  No cron job executions found in last 24 hours${NC}"
    echo "   This is normal if:"
    echo "   - API was just restarted"
    echo "   - It's not 9 AM yet (most jobs run at 9 AM)"
    echo "   - No users match the criteria (e.g., signed up 1 day ago)"
fi

echo ""
echo "6️⃣  Testing email sending capability..."
echo -e "${YELLOW}Checking if Resend is configured...${NC}"

if docker-compose exec -T api printenv | grep -q "RESEND_API_KEY=re_"; then
    echo -e "${GREEN}✅ Resend API key is configured${NC}"
    FROM_EMAIL=$(docker-compose exec -T api printenv | grep "FROM_EMAIL" | cut -d'=' -f2)
    echo "   FROM_EMAIL: $FROM_EMAIL"
else
    echo -e "${RED}❌ Resend API key not configured${NC}"
fi

echo ""
echo "7️⃣  Summary of Scheduled Emails:"
echo "   ┌─────────────────────────────────────────────────────────┐"
echo "   │ Email Type              │ Schedule    │ Trigger         │"
echo "   ├─────────────────────────────────────────────────────────┤"
echo "   │ Onboarding Day 1        │ Daily 9 AM  │ 24h after signup│"
echo "   │ Onboarding Day 3        │ Daily 9 AM  │ 72h after signup│"
echo "   │ Trial Expiry            │ Daily 9 AM  │ 3 days before   │"
echo "   │ Weekly Summary          │ Mon 9 AM    │ Weekly stats    │"
echo "   │ Inactivity Re-engagement│ Daily 9 AM  │ 7 days inactive │"
echo "   └─────────────────────────────────────────────────────────┘"

echo ""
echo "📋 How to Verify Cron Jobs are Working:"
echo ""
echo "   Option 1: Wait for 9 AM (cron jobs will run automatically)"
echo "   - Check logs: docker-compose logs api --follow | grep 'email job'"
echo ""
echo "   Option 2: Create test data"
echo "   - Sign up a new user to test onboarding emails (24h/72h later)"
echo "   - Set a user's lastActivityAt to 7 days ago for inactivity test"
echo ""
echo "   Option 3: Check logs tomorrow morning"
echo "   - docker-compose logs api --since=24h | grep 'Running.*email job'"
echo ""
echo "   Option 4: Manually trigger (for testing)"
echo "   - Add a test endpoint to call the cron methods directly"
echo ""

echo "✅ Email system check complete!"
echo ""
echo "Current time: $(date)"
echo "Next cron run: Tomorrow at 9:00 AM (or Monday 9 AM for weekly summary)"
