#!/bin/bash

# System Monitoring Script for Load Tests
# Run this in a separate terminal while load tests are running

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         ClipForge System Monitor                            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Log file
LOG_DIR="./load-test-results"
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/system-monitor-${TIMESTAMP}.log"

echo -e "${GREEN}📊 Monitoring system resources...${NC}"
echo -e "${YELLOW}Log file: ${LOG_FILE}${NC}"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check container stats
check_containers() {
    log "=== Container Stats ==="
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Function to check database connections
check_db_connections() {
    log "=== Database Connections ==="
    docker-compose exec -T db psql -U clipforge -d clipforge -c "
        SELECT 
            count(*) as total_connections,
            count(*) FILTER (WHERE state = 'active') as active,
            count(*) FILTER (WHERE state = 'idle') as idle,
            count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
        FROM pg_stat_activity
        WHERE datname = 'clipforge';
    " 2>/dev/null | tee -a "$LOG_FILE" || echo "Could not connect to database" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Function to check slow queries
check_slow_queries() {
    log "=== Slow Queries (>1s) ==="
    docker-compose exec -T db psql -U clipforge -d clipforge -c "
        SELECT 
            pid,
            now() - pg_stat_activity.query_start AS duration,
            state,
            substring(query, 1, 100) as query
        FROM pg_stat_activity
        WHERE (now() - pg_stat_activity.query_start) > interval '1 second'
        AND state != 'idle'
        ORDER BY duration DESC
        LIMIT 5;
    " 2>/dev/null | tee -a "$LOG_FILE" || echo "Could not check slow queries" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Function to check API health
check_api_health() {
    log "=== API Health ==="
    local response=$(curl -s http://localhost:3000/health 2>/dev/null || echo "API not responding")
    echo "$response" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Function to check Redis stats
check_redis() {
    log "=== Redis Stats ==="
    docker-compose exec -T redis redis-cli INFO stats 2>/dev/null | grep -E "total_commands_processed|instantaneous_ops_per_sec|keyspace_hits|keyspace_misses" | tee -a "$LOG_FILE" || echo "Could not connect to Redis" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Function to check disk space
check_disk() {
    log "=== Disk Usage ==="
    df -h | grep -E "Filesystem|/dev/" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Function to check API logs for errors
check_api_errors() {
    log "=== Recent API Errors (last 10) ==="
    docker-compose logs --tail=100 api 2>/dev/null | grep -i "error\|exception\|failed" | tail -10 | tee -a "$LOG_FILE" || echo "No recent errors" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
}

# Main monitoring loop
log "Starting system monitoring..."
echo ""

while true; do
    clear
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}ClipForge System Monitor - $(date '+%H:%M:%S')${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    check_containers
    check_api_health
    check_db_connections
    check_slow_queries
    check_redis
    check_disk
    check_api_errors
    
    echo -e "${YELLOW}Refreshing in 5 seconds... (Ctrl+C to stop)${NC}"
    echo -e "${YELLOW}Log: ${LOG_FILE}${NC}"
    
    sleep 5
done
