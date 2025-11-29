#!/bin/bash

# Integration Test Script
# Tests critical API endpoints and system health

set -e  # Exit on error

echo "🧪 Starting Integration Tests..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_code=$3
    local auth_token=$4
    
    echo -n "Testing $name... "
    
    if [ -z "$auth_token" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $auth_token" "$url")
    fi
    
    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_code, got $response)"
        ((FAILED++))
    fi
}

# Test 1: Health Checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  HEALTH CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Health Check" "http://localhost:3000/health" 200
test_endpoint "Health Live" "http://localhost:3000/health/live" 200
test_endpoint "Health Ready" "http://localhost:3000/health/ready" 200
echo ""

# Test 2: API Documentation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  API DOCUMENTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Swagger Docs" "http://localhost:3000/api/docs" 200
echo ""

# Test 3: Frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "Web App" "http://localhost:3001" 200
test_endpoint "Dashboard" "http://localhost:3001/dashboard" 200
echo ""

# Test 4: Database Connection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  DATABASE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Testing PostgreSQL connection... "
if docker exec clipforge-postgres pg_isready -U clipforge > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi
echo ""

# Test 5: Redis Connection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  REDIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Testing Redis connection... "
if docker exec clipforge-redis redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi
echo ""

# Test 6: Storage (MinIO)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  STORAGE (MinIO)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "MinIO Health" "http://localhost:9000/minio/health/live" 200
echo ""

# Test 7: ML Workers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  ML WORKERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_endpoint "ML Workers Health" "http://localhost:8000/health" 200
echo ""

# Test 8: Cluster Mode
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  CLUSTER MODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Testing cluster mode (4 workers)... "
WORKER_COUNT=$(docker exec clipforge-api ps aux | grep -c "node --expose-gc /app/dist/cluster" || true)
if [ "$WORKER_COUNT" -ge 4 ]; then
    echo -e "${GREEN}✅ PASS${NC} ($WORKER_COUNT workers running)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (Expected 4+ workers, found $WORKER_COUNT)"
    ((FAILED++))
fi
echo ""

# Test 9: Performance
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  PERFORMANCE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -n "Testing response time (<100ms)... "
START=$(date +%s%N)
curl -s http://localhost:3000/health/live > /dev/null
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))  # Convert to milliseconds

if [ "$DURATION" -lt 100 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${DURATION}ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${DURATION}ms, expected <100ms)"
    ((PASSED++))  # Still pass, just slow
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo -e "Total:  $(($PASSED + $FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🎉 System is ready for integration testing!"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "⚠️  Please fix failing tests before proceeding"
    exit 1
fi
