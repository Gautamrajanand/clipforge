#!/bin/bash

# ClipForge Load Testing Suite
# Runs all 5 load tests with authentication

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 ClipForge Load Testing Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if AUTH_TOKEN is set
if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}❌ ERROR: AUTH_TOKEN not set${NC}"
    echo ""
    echo "Please set your auth token:"
    echo "export AUTH_TOKEN=\"your_token_here\""
    exit 1
fi

echo -e "${GREEN}✅ AUTH_TOKEN detected (${#AUTH_TOKEN} characters)${NC}"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}❌ ERROR: k6 not installed${NC}"
    echo ""
    echo "Install k6:"
    echo "brew install k6"
    exit 1
fi

echo -e "${GREEN}✅ k6 installed${NC}"
echo ""

# Create results directory
RESULTS_DIR="load-test-results-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RESULTS_DIR"

echo -e "${BLUE}📁 Results will be saved to: $RESULTS_DIR${NC}"
echo ""

# Test 1: Health Check
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test 1/5: Health Check (5 minutes)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

k6 run --out json="$RESULTS_DIR/health-check.json" \
    -e AUTH_TOKEN="$AUTH_TOKEN" \
    load-tests/health-check-test.js

echo ""
echo -e "${GREEN}✅ Health check complete${NC}"
echo ""
sleep 5

# Test 2: Credits API
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test 2/5: Credits API (10 minutes)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

k6 run --out json="$RESULTS_DIR/credits-api.json" \
    -e AUTH_TOKEN="$AUTH_TOKEN" \
    load-tests/credits-api-test.js

echo ""
echo -e "${GREEN}✅ Credits API test complete${NC}"
echo ""
sleep 5

# Test 3: Database Stress
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test 3/5: Database Stress (15 minutes)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

k6 run --out json="$RESULTS_DIR/database-stress.json" \
    -e AUTH_TOKEN="$AUTH_TOKEN" \
    load-tests/database-stress-test.js

echo ""
echo -e "${GREEN}✅ Database stress test complete${NC}"
echo ""
sleep 5

# Test 4: Video Upload
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test 4/5: Video Upload (20 minutes)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

k6 run --out json="$RESULTS_DIR/video-upload.json" \
    -e AUTH_TOKEN="$AUTH_TOKEN" \
    load-tests/video-upload-test.js

echo ""
echo -e "${GREEN}✅ Video upload test complete${NC}"
echo ""
sleep 5

# Test 5: Concurrent Processing
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test 5/5: Concurrent Processing (20 minutes)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

k6 run --out json="$RESULTS_DIR/concurrent-processing.json" \
    -e AUTH_TOKEN="$AUTH_TOKEN" \
    load-tests/concurrent-processing-test.js

echo ""
echo -e "${GREEN}✅ Concurrent processing test complete${NC}"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🎉 All Tests Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Results saved to: $RESULTS_DIR${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review test results in $RESULTS_DIR"
echo "2. Analyze performance metrics"
echo "3. Identify bottlenecks"
echo "4. Document issues for Day 2 optimization"
echo ""
echo -e "${BLUE}========================================${NC}"
