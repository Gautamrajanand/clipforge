#!/bin/bash

# Load Testing Suite Runner
# Runs all load tests in sequence with monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
AUTH_TOKEN="${AUTH_TOKEN:-}"
RESULTS_DIR="./load-test-results"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         ClipForge Load Testing Suite                        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ k6 is not installed${NC}"
    echo ""
    echo "Install k6:"
    echo "  macOS:   brew install k6"
    echo "  Linux:   sudo apt-get install k6"
    echo "  Windows: choco install k6"
    echo ""
    echo "Or download from: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if API is running
echo -e "${YELLOW}🔍 Checking if API is running...${NC}"
if ! curl -s -f -o /dev/null "${API_URL}/health" 2>/dev/null; then
    echo -e "${RED}❌ API is not running at ${API_URL}${NC}"
    echo ""
    echo "Start the API first:"
    echo "  docker-compose up -d"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ API is running${NC}"
echo ""

# Check auth token
if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No AUTH_TOKEN provided${NC}"
    echo "Some tests may fail without authentication"
    echo ""
    echo "Set AUTH_TOKEN:"
    echo "  export AUTH_TOKEN='your-clerk-token-here'"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create results directory
mkdir -p "$RESULTS_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Starting Load Tests - ${TIMESTAMP}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to run a test
run_test() {
    local test_name=$1
    local test_file=$2
    local duration=$3
    
    echo -e "${YELLOW}▶ Running: ${test_name}${NC}"
    echo -e "${YELLOW}  Duration: ~${duration}${NC}"
    echo -e "${YELLOW}  File: ${test_file}${NC}"
    echo ""
    
    local result_file="${RESULTS_DIR}/${TIMESTAMP}_${test_name}.json"
    
    if k6 run \
        --out json="${result_file}" \
        -e API_URL="${API_URL}" \
        -e AUTH_TOKEN="${AUTH_TOKEN}" \
        "${test_file}"; then
        echo -e "${GREEN}✅ ${test_name} - PASSED${NC}"
    else
        echo -e "${RED}❌ ${test_name} - FAILED${NC}"
        echo -e "${RED}   Check logs: ${result_file}${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}─────────────────────────────────────────────────────────────${NC}"
    echo ""
    
    # Wait between tests
    sleep 10
}

# Test 1: Health Check (Quick smoke test)
run_test "health-check" "./health-check-test.js" "1 min"

# Test 2: Credits API (Caching test)
run_test "credits-api" "./credits-api-test.js" "4 min"

# Test 3: Database Stress (Connection pool test)
run_test "database-stress" "./database-stress-test.js" "5 min"

# Test 4: Video Upload (Critical path test)
echo -e "${YELLOW}⚠️  Video Upload Test - This will take ~10 minutes${NC}"
echo -e "${YELLOW}   This test uploads and processes videos${NC}"
echo ""
read -p "Run video upload test? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    run_test "video-upload" "./video-upload-test.js" "10 min"
else
    echo -e "${YELLOW}⏭️  Skipped video upload test${NC}"
    echo ""
fi

# Test 5: Concurrent Processing (Stress test)
echo -e "${YELLOW}⚠️  Concurrent Processing Test - This is a STRESS test${NC}"
echo -e "${YELLOW}   This will push your system to its limits${NC}"
echo ""
read -p "Run concurrent processing stress test? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    run_test "concurrent-processing" "./concurrent-processing-test.js" "9 min"
else
    echo -e "${YELLOW}⏭️  Skipped concurrent processing test${NC}"
    echo ""
fi

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Load Testing Complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Results saved to: ${RESULTS_DIR}/${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review test results in ${RESULTS_DIR}/"
echo "2. Check API logs: docker-compose logs api"
echo "3. Check database performance: docker-compose exec db psql -U clipforge -c 'SELECT * FROM pg_stat_activity;'"
echo "4. Check memory usage: docker stats"
echo "5. Look for bottlenecks and optimize"
echo ""
echo -e "${YELLOW}Key Metrics to Check:${NC}"
echo "- http_req_duration (p95 < 5s for most endpoints)"
echo "- http_req_failed (< 5% error rate)"
echo "- Memory usage (should be stable, no leaks)"
echo "- Database connections (should not exhaust pool)"
echo "- Worker queue depth (should not grow unbounded)"
echo ""
