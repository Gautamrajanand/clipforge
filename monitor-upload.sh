#!/bin/bash

# Monitor Upload Script
# Monitors API memory usage and temp files during upload

echo "🔍 Upload Monitor Started"
echo "=========================="
echo ""
echo "Monitoring:"
echo "- API Memory Usage"
echo "- Temp Files in /tmp/clipforge-uploads/"
echo "- API Logs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

while true; do
    clear
    echo "🔍 Upload Monitor - $(date '+%H:%M:%S')"
    echo "=========================================="
    echo ""
    
    # Memory Usage
    echo "📊 Memory Usage:"
    docker stats clipforge-api --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.CPUPerc}}"
    echo ""
    
    # Temp Files
    echo "📁 Temp Files:"
    TEMP_COUNT=$(docker exec clipforge-api find /tmp/clipforge-uploads -type f 2>/dev/null | wc -l)
    if [ "$TEMP_COUNT" -gt 0 ]; then
        echo "Files in /tmp/clipforge-uploads/: $TEMP_COUNT"
        docker exec clipforge-api ls -lh /tmp/clipforge-uploads/ 2>/dev/null | tail -10
    else
        echo "No temp files (clean)"
    fi
    echo ""
    
    # Recent API Logs
    echo "📝 Recent API Logs (last 5 lines):"
    docker logs clipforge-api --tail 5 2>&1 | grep -E "(uploadVideo|Upload|MinIO|Cleanup)" || echo "No recent upload activity"
    echo ""
    
    echo "Refreshing in 2 seconds... (Ctrl+C to stop)"
    sleep 2
done
