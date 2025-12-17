#!/bin/bash

# PLG Systems Testing Script
# Tests all 5 critical PLG systems

echo "🧪 ClipForge PLG Systems Test Suite"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Modal Queue System
echo "Test 1: Modal Queue System"
echo "-------------------------"

if [ -f "apps/web/contexts/ModalQueueContext.tsx" ]; then
    pass "ModalQueueContext exists"
else
    fail "ModalQueueContext missing"
fi

if [ -f "apps/web/lib/modalQueue.ts" ]; then
    pass "modalQueue library exists"
else
    fail "modalQueue library missing"
fi

echo ""

# Test 2: Processing State Detection
echo "Test 2: Processing State Detection"
echo "----------------------------------"

if grep -q "isProcessing" apps/web/app/dashboard/page.tsx; then
    pass "Processing state detection implemented"
else
    fail "Processing state detection missing"
fi

echo ""

# Test 3: Dismissal Persistence
echo "Test 3: Dismissal Persistence"
echo "-----------------------------"

if grep -q "localStorage" apps/web/lib/modalQueue.ts 2>/dev/null || grep -q "dismissedModals" apps/web -r; then
    pass "Dismissal persistence implemented"
else
    warn "Dismissal persistence may not be implemented"
fi

echo ""

# Test 4: Mobile Detection
echo "Test 4: Mobile Detection"
echo "-----------------------"

if grep -q "useMediaQuery\|isMobile\|window.innerWidth" apps/web -r; then
    pass "Mobile detection implemented"
else
    warn "Mobile detection may not be implemented"
fi

echo ""

# Test 5: Email Flood Prevention
echo "Test 5: Email Flood Prevention"
echo "------------------------------"

if [ -f "apps/api/src/email/email-flood-prevention.service.ts" ]; then
    pass "Email flood prevention service exists"
else
    fail "Email flood prevention service missing"
fi

if grep -q "EmailLog" apps/api/prisma/schema.prisma; then
    pass "EmailLog table defined in schema"
else
    fail "EmailLog table missing from schema"
fi

echo ""

# Test 6: Database Tables
echo "Test 6: Database Tables"
echo "----------------------"

echo "Checking EmailLog table..."
docker exec clipforge-postgres psql -U postgres -d clipforge_dev -c "\d \"EmailLog\"" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    pass "EmailLog table exists in database"
else
    fail "EmailLog table missing from database"
fi

echo ""

# Test 7: API Endpoints
echo "Test 7: API Endpoints"
echo "--------------------"

# Check if API is running
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    pass "API is running"
else
    fail "API is not responding"
fi

echo ""

# Test 8: Frontend Build
echo "Test 8: Frontend Build"
echo "---------------------"

if [ -d "apps/web/.next" ]; then
    pass "Frontend build exists"
else
    warn "Frontend not built (run: cd apps/web && npm run build)"
fi

echo ""

# Test 9: Email Service
echo "Test 9: Email Service"
echo "--------------------"

if [ -f "apps/api/src/email/email.service.ts" ]; then
    pass "Email service exists"
else
    fail "Email service missing"
fi

if grep -q "RESEND_API_KEY" apps/api/.env 2>/dev/null; then
    pass "Resend API key configured"
else
    warn "Resend API key not found in .env"
fi

echo ""

# Test 10: PLG Content
echo "Test 10: PLG Content"
echo "-------------------"

if [ -f "apps/web/app/blog/page.tsx" ]; then
    pass "Blog page exists"
else
    fail "Blog page missing"
fi

if ls apps/web/app/for/*.tsx > /dev/null 2>&1; then
    pass "Landing pages exist"
else
    fail "Landing pages missing"
fi

echo ""

# Summary
echo "=================================="
echo "Test Summary"
echo "=================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All PLG systems verified!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some PLG systems need attention${NC}"
    exit 1
fi
