# Post-Mortem: 2-Day Instability (Nov 17-19, 2025)

**Date**: November 19, 2025  
**Status**: RESOLVED  
**Impact**: AI Reframe and AI Clips aspect ratio conversion broken  
**Duration**: ~2 days  

---

## Executive Summary

Between Nov 17-19, 2025, the application experienced instability where AI Reframe and AI Clips aspect ratio conversion stopped working. The root cause was **running services locally instead of in Docker**, which led to missing environment variables and configuration drift.

---

## Timeline of Events

### Nov 16, 2025 - STABLE STATE
- ✅ All features working perfectly
- ✅ All services running in Docker
- ✅ Milestone documented: `MILESTONE_ALL_FEATURES_WORKING.md`

### Nov 17-19, 2025 - INSTABILITY PERIOD
- ❌ AI Reframe: Videos not changing aspect ratio
- ❌ AI Clips: Export not applying aspect ratio conversion
- ❌ AI Clips: Stuck at "Detect Clips" step
- Multiple debugging sessions attempting to fix frontend, backend logic

### Nov 19, 2025 - ROOT CAUSE IDENTIFIED
- **Discovery**: API running locally via `./start-api.sh`, not in Docker
- **Discovery**: `FF_ASPECT_RATIO` feature flag not set locally
- **Discovery**: `ML_WORKER_URL` not configured for Docker API

---

## Root Causes

### 1. **Local API Instead of Docker API**

**What Happened**:
- During debugging, API was started locally using `./start-api.sh`
- Local API used `.env` file which was incomplete
- Docker API configuration in `docker-compose.yml` was ignored

**Impact**:
- Missing `FF_ASPECT_RATIO=true` → Aspect ratio conversion disabled
- Missing `ML_WORKER_URL` → Clip detection failing
- Configuration drift between local and Docker environments

**Evidence**:
```bash
# Local API process
ps aux | grep "nest start"
# → Running on host machine, not in Docker

# Docker API not running
docker ps | grep api
# → No clipforge-api container
```

### 2. **Feature Flag Not Set**

**What Happened**:
- `FF_ASPECT_RATIO` feature flag controls aspect ratio conversion
- In `ffmpeg.service.ts`, if flag is false, it just copies the file without conversion
- Local `.env` didn't have `FF_ASPECT_RATIO=true`
- Docker `docker-compose.yml` had it, but wasn't being used

**Impact**:
- `convertAspectRatio()` function skipped all processing
- Videos remained in original aspect ratio (16:9)
- Both AI Reframe and AI Clips affected

**Code**:
```typescript
// apps/api/src/video/ffmpeg.service.ts:34
if (!FeatureFlags.ASPECT_RATIO) {
  this.logger.warn('Aspect ratio processing disabled by feature flag');
  await fs.copyFile(inputPath, outputPath); // ← Just copies, no conversion!
  return;
}
```

### 3. **ML Worker URL Not Configured**

**What Happened**:
- Docker API needed `ML_WORKER_URL=http://ml-workers:8000`
- Environment variable was missing from `docker-compose.yml`
- API defaulted to `http://ml-workers:8000` in code, but Docker networking failed

**Impact**:
- AI Clips stuck at "Detect Clips" step
- Error: `ECONNREFUSED 127.0.0.1:8000`
- Clip detection never completed

---

## Why This Happened

### Contributing Factors:

1. **No Environment Validation**
   - No startup checks to verify required environment variables
   - No warnings if critical config is missing

2. **Dual Deployment Modes**
   - Application can run locally OR in Docker
   - No clear indication which mode is active
   - Easy to accidentally switch modes during debugging

3. **Incomplete Documentation**
   - No runbook for "which services should be running"
   - No health check script to verify correct setup

4. **Silent Failures**
   - Feature flags silently disable features without clear errors
   - Missing environment variables fall back to defaults
   - Errors caught and swallowed in async operations

5. **Configuration Drift**
   - Local `.env` and `docker-compose.yml` can diverge
   - No single source of truth for configuration

---

## Solutions Implemented

### Immediate Fixes:

1. ✅ **Migrated to Docker API**
   ```bash
   pkill -f "nest start"  # Stop local API
   docker-compose up -d api  # Start Docker API
   ```

2. ✅ **Added ML_WORKER_URL to docker-compose.yml**
   ```yaml
   api:
     environment:
       ML_WORKER_URL: http://ml-workers:8000
   ```

3. ✅ **Verified Feature Flags**
   ```yaml
   api:
     environment:
       FF_ASPECT_RATIO: "true"
   ```

4. ✅ **Documented Docker Setup**
   - All services now in Docker
   - Clear service dependencies
   - Health checks enabled

---

## Prevention Measures

### 1. **Startup Validation Script**

Create `scripts/validate-environment.sh`:
```bash
#!/bin/bash
# Validate that all required services are running correctly

echo "🔍 Validating ClipForge Environment..."

# Check Docker services
required_services=("clipforge-api" "clipforge-postgres" "clipforge-redis" "clipforge-minio" "clipforge-ml-workers")
for service in "${required_services[@]}"; do
  if ! docker ps | grep -q "$service"; then
    echo "❌ $service not running"
    exit 1
  fi
done

# Check environment variables
required_vars=("FF_ASPECT_RATIO" "ML_WORKER_URL")
for var in "${required_vars[@]}"; do
  if ! docker exec clipforge-api printenv | grep -q "$var"; then
    echo "❌ $var not set in API"
    exit 1
  fi
done

# Check API health
if ! curl -sf http://localhost:3000/health > /dev/null; then
  echo "❌ API health check failed"
  exit 1
fi

echo "✅ All checks passed!"
```

### 2. **Environment Variable Validation in Code**

Add to `apps/api/src/main.ts`:
```typescript
function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'REDIS_URL',
    'S3_ENDPOINT',
    'ML_WORKER_URL',
    'FF_ASPECT_RATIO',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('💡 Make sure you are running in Docker: docker-compose up -d');
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
}

async function bootstrap() {
  validateEnvironment(); // ← Add this
  // ... rest of bootstrap
}
```

### 3. **Docker-Only Development**

Update `README.md` to enforce Docker:
```markdown
## Development Setup

⚠️ **IMPORTANT**: Always run services in Docker to avoid configuration drift.

### Start All Services
```bash
docker-compose up -d
```

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f api
```

### DO NOT run services locally
- ❌ `npm run start:dev` in apps/api
- ❌ `./start-api.sh`
- ✅ Always use `docker-compose up -d api`
```

### 4. **Health Check Dashboard**

Create `scripts/health-check.sh`:
```bash
#!/bin/bash
echo "🏥 ClipForge Health Check"
echo "========================"
echo ""
echo "Docker Services:"
docker-compose ps
echo ""
echo "API Health:"
curl -s http://localhost:3000/health | jq .
echo ""
echo "ML Worker Health:"
curl -s http://localhost:8000/v1/ranker/health 2>/dev/null || echo "❌ ML Worker not responding"
echo ""
echo "Environment Variables:"
docker exec clipforge-api printenv | grep -E "FF_|ML_WORKER" | sort
```

### 5. **Pre-commit Hook**

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Ensure Docker services are running before committing

if ! docker ps | grep -q "clipforge-api"; then
  echo "⚠️  WARNING: Docker API not running"
  echo "Run: docker-compose up -d"
  exit 1
fi
```

### 6. **Configuration Sync Check**

Create `scripts/check-config-drift.sh`:
```bash
#!/bin/bash
# Check if local .env and docker-compose.yml are in sync

echo "🔍 Checking for configuration drift..."

# Extract env vars from docker-compose.yml
docker_vars=$(grep -A50 "api:" docker-compose.yml | grep ":" | grep -v "^#" | awk '{print $1}' | sort)

# Compare with .env
for var in $docker_vars; do
  if ! grep -q "$var" apps/api/.env 2>/dev/null; then
    echo "⚠️  $var in docker-compose.yml but not in .env"
  fi
done
```

---

## Lessons Learned

### What Went Wrong:
1. **Assumed local and Docker were equivalent** - They're not
2. **No validation of environment** - Silent failures
3. **Debugging led to mode switching** - Lost track of which mode was active
4. **Feature flags without visibility** - Hard to debug when disabled

### What Went Right:
1. **Docker configuration was correct** - Just needed to use it
2. **Code was working** - Environment was the issue
3. **Systematic debugging** - Eventually found root cause
4. **Good version control** - Could reference stable commit

### Key Takeaway:
> **"Configuration is code. Treat environment setup with the same rigor as application code."**

---

## Action Items

### Immediate (Done):
- [x] Migrate to Docker API
- [x] Add ML_WORKER_URL to docker-compose.yml
- [x] Verify all feature flags
- [x] Document this post-mortem

### Short Term (This Week):
- [ ] Implement startup validation script
- [ ] Add environment variable validation in code
- [ ] Create health check dashboard
- [ ] Update README with Docker-only policy
- [ ] Add pre-commit hook

### Long Term (Next Sprint):
- [ ] Implement configuration management system
- [ ] Add monitoring/alerting for service health
- [ ] Create automated integration tests
- [ ] Build admin dashboard showing service status
- [ ] Document all environment variables in one place

---

## Conclusion

The 2-day instability was caused by **running services locally instead of in Docker**, leading to missing environment variables and feature flags. The fix was simple: use Docker as intended. 

To prevent recurrence:
1. **Enforce Docker-only development**
2. **Validate environment on startup**
3. **Monitor service health continuously**
4. **Document configuration clearly**

**Status**: All features now working. Docker is the single source of truth.

---

**Reviewed By**: Development Team  
**Date**: November 19, 2025  
**Next Review**: December 1, 2025
