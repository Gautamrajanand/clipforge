# Emergency Rollback Instructions

## If Async Subtitle Export Breaks

**Current Stable State**: Tag `pre-async-subtitle-export` (commit 8efcc27)

### Quick Rollback (2 minutes)
```bash
# Stop all services
docker-compose down

# Rollback code
git reset --hard pre-async-subtitle-export

# Restart services
docker-compose up -d

# Clear Redis queue (if needed)
docker exec clipforge-redis redis-cli FLUSHALL
```

### Verify Rollback
```bash
# Check API is running
curl http://localhost:3000/health

# Check services
docker ps

# Check logs
docker logs clipforge-api --tail 20
```

### What Was Changed
- Subtitle export moved to async job queue
- Download endpoint modified to check for cached file
- Frontend updated to poll for completion

### If Rollback Needed
**Symptoms**:
- Subtitle export not working
- Download button broken
- Jobs stuck in queue
- API errors

**Action**: Run the quick rollback above

---

**Created**: Nov 16, 2025 4:14 AM
**Commit**: 8efcc27
