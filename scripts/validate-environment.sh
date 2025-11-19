#!/bin/bash
# ClipForge Environment Validation Script
# Ensures all services are running correctly before development/deployment

set -e

echo "🔍 ClipForge Environment Validation"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to check Docker service
check_service() {
    local service_name=$1
    if docker ps | grep -q "$service_name"; then
        echo -e "${GREEN}✅ $service_name is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name is NOT running${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    local var_name=$1
    local expected_value=$2
    local actual_value=$(docker exec clipforge-api printenv $var_name 2>/dev/null || echo "")
    
    if [ -z "$actual_value" ]; then
        echo -e "${RED}❌ $var_name is NOT set${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    elif [ -n "$expected_value" ] && [ "$actual_value" != "$expected_value" ]; then
        echo -e "${YELLOW}⚠️  $var_name = $actual_value (expected: $expected_value)${NC}"
        return 0
    else
        echo -e "${GREEN}✅ $var_name = $actual_value${NC}"
        return 0
    fi
}

# Function to check HTTP endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $name is responding (HTTP $status)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is NOT responding (HTTP $status, expected $expected_status)${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

echo "1️⃣  Checking Docker Services..."
echo "--------------------------------"
check_service "clipforge-api"
check_service "clipforge-postgres"
check_service "clipforge-redis"
check_service "clipforge-minio"
check_service "clipforge-ml-workers"
echo ""

echo "2️⃣  Checking Environment Variables..."
echo "--------------------------------------"
check_env_var "DATABASE_URL" "postgresql://clipforge:clipforge@postgres:5432/clipforge_dev"
check_env_var "REDIS_URL" "redis://redis:6379"
check_env_var "S3_ENDPOINT" "http://minio:9000"
check_env_var "ML_WORKER_URL" "http://ml-workers:8000"
check_env_var "FF_ASPECT_RATIO" "true"
check_env_var "JWT_SECRET"
check_env_var "OPENAI_API_KEY"
echo ""

echo "3️⃣  Checking Service Health..."
echo "-------------------------------"
check_endpoint "API Health" "http://localhost:3000/health" "200"
check_endpoint "MinIO" "http://localhost:9000/minio/health/live" "200"
echo ""

echo "4️⃣  Checking Database Connection..."
echo "------------------------------------"
if docker exec clipforge-postgres pg_isready -U clipforge > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is accepting connections${NC}"
else
    echo -e "${RED}❌ PostgreSQL is NOT accepting connections${NC}"
    FAILURES=$((FAILURES + 1))
fi
echo ""

echo "5️⃣  Checking Redis Connection..."
echo "---------------------------------"
if docker exec clipforge-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is responding${NC}"
else
    echo -e "${RED}❌ Redis is NOT responding${NC}"
    FAILURES=$((FAILURES + 1))
fi
echo ""

echo "6️⃣  Checking Docker Network..."
echo "-------------------------------"
if docker network inspect clipforge-network > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker network exists${NC}"
else
    echo -e "${YELLOW}⚠️  clipforge-network not found (this is OK if services are running)${NC}"
fi
echo ""

# Summary
echo "===================================="
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Environment is healthy.${NC}"
    echo ""
    echo "You can now:"
    echo "  - Access Web UI: http://localhost:3001"
    echo "  - Access API: http://localhost:3000"
    echo "  - Access MinIO Console: http://localhost:9001"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $FAILURES check(s) failed!${NC}"
    echo ""
    echo "To fix:"
    echo "  1. Start all services: docker-compose up -d"
    echo "  2. Check logs: docker-compose logs -f"
    echo "  3. Verify docker-compose.yml configuration"
    echo ""
    exit 1
fi
