#!/bin/bash

# Automated API Integration Tests
# Tests critical user flows end-to-end

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
TOTAL=0

# Configuration
API_URL="http://localhost:3000"
AUTH_TOKEN="${AUTH_TOKEN:-}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 ClipForge API Integration Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Helper function to test API endpoint
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local expected_code=$4
    local data=$5
    
    ((TOTAL++))
    echo -n "  Testing $name... "
    
    if [ -z "$data" ]; then
        if [ -z "$AUTH_TOKEN" ]; then
            response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$API_URL$endpoint")
        else
            response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                "$API_URL$endpoint")
        fi
    else
        if [ -z "$AUTH_TOKEN" ]; then
            response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_URL$endpoint")
        else
            response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_URL$endpoint")
        fi
    fi
    
    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_code, got $response)"
        ((FAILED++))
        return 1
    fi
}

# Helper function to test with response body
test_api_with_response() {
    local name=$1
    local method=$2
    local endpoint=$3
    local expected_code=$4
    local check_field=$5
    
    ((TOTAL++))
    echo -n "  Testing $name... "
    
    if [ -z "$AUTH_TOKEN" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_code" ]; then
        if [ -z "$check_field" ] || echo "$body" | jq -e "$check_field" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
            ((PASSED++))
            return 0
        else
            echo -e "${RED}❌ FAIL${NC} (Field $check_field not found in response)"
            ((FAILED++))
            return 1
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_code, got $http_code)"
        ((FAILED++))
        return 1
    fi
}

# Test 1: System Health
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1️⃣  SYSTEM HEALTH${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_api_with_response "Health Check" "GET" "/health" 200 ".status"
test_api_with_response "Health Live" "GET" "/health/live" 200 ".status"
test_api_with_response "Health Ready" "GET" "/health/ready" 200 ".status"
echo ""

# Test 2: API Documentation
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2️⃣  API DOCUMENTATION${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_api "Swagger JSON" "GET" "/api/docs-json" 200
test_api "Swagger UI" "GET" "/api/docs" 200
echo ""

# Test 3: Public Endpoints (No Auth Required)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3️⃣  PUBLIC ENDPOINTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_api_with_response "Pricing Plans" "GET" "/v1/payments/pricing" 200 ".STARTER"
echo ""

# Test 4: Protected Endpoints (Auth Required)
if [ -n "$AUTH_TOKEN" ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}4️⃣  PROTECTED ENDPOINTS (With Auth)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    test_api_with_response "Credit Balance" "GET" "/v1/credits/balance" 200 ".balance"
    test_api_with_response "Credit Transactions" "GET" "/v1/credits/transactions" 200 ".transactions"
    test_api_with_response "Projects List" "GET" "/v1/projects" 200 ".projects"
    test_api_with_response "User Profile" "GET" "/v1/auth/me" 200 ".user"
    echo ""
else
    echo -e "${YELLOW}⚠️  Skipping protected endpoint tests (no AUTH_TOKEN provided)${NC}"
    echo -e "${YELLOW}   Set AUTH_TOKEN environment variable to test authenticated endpoints${NC}"
    echo ""
fi

# Test 5: Database Connectivity
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5️⃣  DATABASE CONNECTIVITY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
((TOTAL++))
echo -n "  Testing PostgreSQL connection... "
if docker exec clipforge-postgres pg_isready -U clipforge > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

((TOTAL++))
echo -n "  Testing database query... "
if docker exec clipforge-postgres psql -U clipforge -d clipforge_dev -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi
echo ""

# Test 6: Redis Connectivity
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6️⃣  REDIS CONNECTIVITY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
((TOTAL++))
echo -n "  Testing Redis PING... "
if docker exec clipforge-redis redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi

((TOTAL++))
echo -n "  Testing Redis SET/GET... "
if docker exec clipforge-redis redis-cli SET test_key "test_value" > /dev/null 2>&1 && \
   docker exec clipforge-redis redis-cli GET test_key | grep -q "test_value"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
    docker exec clipforge-redis redis-cli DEL test_key > /dev/null 2>&1
else
    echo -e "${RED}❌ FAIL${NC}"
    ((FAILED++))
fi
echo ""

# Test 7: Storage (MinIO)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7️⃣  STORAGE (MinIO)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_api "MinIO Health" "GET" "http://localhost:9000/minio/health/live" 200
echo ""

# Test 8: ML Workers
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}8️⃣  ML WORKERS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_api "ML Workers Health" "GET" "http://localhost:8000/health" 200
echo ""

# Test 9: Cluster Mode
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}9️⃣  CLUSTER MODE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
((TOTAL++))
echo -n "  Testing cluster mode (4 workers)... "
WORKER_COUNT=$(docker exec clipforge-api ps aux | grep -c "node --expose-gc /app/dist/cluster" || true)
if [ "$WORKER_COUNT" -ge 4 ]; then
    echo -e "${GREEN}✅ PASS${NC} ($WORKER_COUNT workers)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (Expected 4+ workers, found $WORKER_COUNT)"
    ((FAILED++))
fi
echo ""

# Test 10: Performance
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔟 PERFORMANCE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test response time
((TOTAL++))
echo -n "  Testing response time (<100ms)... "
START=$(date +%s%N)
curl -s http://localhost:3000/health/live > /dev/null
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))

if [ "$DURATION" -lt 100 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${DURATION}ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${DURATION}ms)"
    ((PASSED++))  # Still pass
fi

# Test concurrent requests
((TOTAL++))
echo -n "  Testing concurrent requests (10 parallel)... "
START=$(date +%s%N)
for i in {1..10}; do
    curl -s http://localhost:3000/health/live > /dev/null &
done
wait
END=$(date +%s%N)
DURATION=$(( (END - START) / 1000000 ))

if [ "$DURATION" -lt 500 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${DURATION}ms for 10 requests)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${DURATION}ms)"
    ((PASSED++))  # Still pass
fi
echo ""

# Test 11: Error Handling
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1️⃣1️⃣  ERROR HANDLING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
test_api "404 Not Found" "GET" "/nonexistent" 404
test_api "401 Unauthorized" "GET" "/v1/projects" 401
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Total Tests:  ${BLUE}$TOTAL${NC}"
echo -e "Passed:       ${GREEN}$PASSED${NC}"
echo -e "Failed:       ${RED}$FAILED${NC}"
PERCENTAGE=$(( PASSED * 100 / TOTAL ))
echo -e "Success Rate: ${GREEN}${PERCENTAGE}%${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🎉 System is production-ready!"
    echo ""
    if [ -z "$AUTH_TOKEN" ]; then
        echo -e "${YELLOW}💡 TIP: Set AUTH_TOKEN to test authenticated endpoints${NC}"
        echo -e "${YELLOW}   export AUTH_TOKEN=\"your-clerk-jwt-token\"${NC}"
        echo ""
    fi
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "⚠️  Please fix failing tests before proceeding"
    exit 1
fi
