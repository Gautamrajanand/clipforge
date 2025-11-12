# Phase 1 Deployment Guide

**Target:** Deploy BullMQ job queue system to production  
**Risk Level:** Low (self-contained, easy rollback)  
**Estimated Time:** 2-3 hours  
**Downtime Required:** None (rolling deployment)

---

## 🎯 PRE-DEPLOYMENT CHECKLIST

### 1. **Environment Variables** ✅
Ensure these are set in production:

```bash
# Required for BullMQ
REDIS_URL=redis://your-redis-host:6379

# Required for database pooling
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10

# Existing variables (verify)
S3_ENDPOINT=https://your-s3-endpoint
ASSEMBLYAI_API_KEY=your-key
OPENAI_API_KEY=your-key
```

### 2. **Redis Instance** ✅
- [ ] Redis 6.0+ running and accessible
- [ ] Persistence enabled (AOF or RDB)
- [ ] Memory: At least 512MB allocated
- [ ] Network: Accessible from API containers
- [ ] Test connection: `redis-cli -h HOST -p PORT ping`

### 3. **Database** ✅
- [ ] Connection pooling configured
- [ ] Max connections increased (recommend 100+)
- [ ] Verify with: `SHOW max_connections;`

### 4. **Docker Images** ✅
- [ ] Build latest API image with BullMQ
- [ ] Tag with version: `clipforge-api:v0.4.0-phase1`
- [ ] Push to registry

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Build Production Image

```bash
# Build with no cache to ensure fresh dependencies
docker build --no-cache -f Dockerfile.api -t clipforge-api:v0.4.0-phase1 apps/api

# Test locally first
docker run -e REDIS_URL=redis://localhost:6379 \
           -e DATABASE_URL=postgresql://... \
           -p 3000:3000 \
           clipforge-api:v0.4.0-phase1

# Verify health
curl http://localhost:3000/health
curl http://localhost:3000/health/ready
```

### Step 2: Database Migration (if needed)

```bash
# No schema changes in Phase 1, but verify Prisma is up to date
docker exec -it clipforge-api npx prisma migrate status

# If needed:
docker exec -it clipforge-api npx prisma migrate deploy
```

### Step 3: Deploy to Production

#### Option A: Docker Compose (Simple)

```bash
# Update docker-compose.yml with new image
docker-compose pull api
docker-compose up -d api

# Wait for health check
sleep 30
curl https://your-domain.com/health/ready
```

#### Option B: Kubernetes (Recommended)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: clipforge-api
spec:
  replicas: 2  # Start with 2 for redundancy
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0  # Zero downtime
  template:
    spec:
      containers:
      - name: api
        image: clipforge-api:v0.4.0-phase1
        env:
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: clipforge-secrets
              key: redis-url
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: clipforge-secrets
              key: database-url
        
        # Health checks
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

Deploy:
```bash
kubectl apply -f deployment.yaml

# Watch rollout
kubectl rollout status deployment/clipforge-api

# Verify pods
kubectl get pods -l app=clipforge-api
```

### Step 4: Verify Deployment

```bash
# 1. Check health
curl https://your-domain.com/health
# Expected: {"status":"ok",...}

# 2. Check readiness
curl https://your-domain.com/health/ready
# Expected: {"status":"ok",...}

# 3. Test video import (use a short test video)
# Import via UI and monitor logs

# 4. Check queue metrics (requires auth token)
curl -H "Authorization: Bearer $TOKEN" \
     https://your-domain.com/v1/queues/metrics
# Expected: Queue statistics

# 5. Monitor logs
kubectl logs -f deployment/clipforge-api
# or
docker logs -f clipforge-api
```

---

## 📊 POST-DEPLOYMENT MONITORING

### First Hour (Critical)

Monitor these metrics every 5 minutes:

```bash
# 1. Queue health
curl -H "Authorization: Bearer $TOKEN" \
     https://your-domain.com/v1/queues/metrics | jq '.queues[] | {queue, waiting, active, failed}'

# 2. System health
curl https://your-domain.com/health | jq '{status, database, redis, storage}'

# 3. Error rate
kubectl logs deployment/clipforge-api | grep ERROR | tail -20

# 4. Response times
# Check your APM/monitoring tool
```

**Red Flags:**
- ❌ Waiting jobs > 100
- ❌ Failed jobs > 10%
- ❌ Health status: "degraded"
- ❌ Response time > 1000ms
- ❌ Memory usage > 80%

### First Day

Monitor these metrics every hour:

1. **Queue Metrics:**
   - Average job duration
   - Success rate (should be > 95%)
   - Retry rate (should be < 10%)
   - Queue depth trends

2. **System Metrics:**
   - CPU usage (should be < 70%)
   - Memory usage (should be < 80%)
   - Database connections (should be < 15/20)
   - Redis memory (should be < 80%)

3. **Business Metrics:**
   - Videos processed per hour
   - Average processing time
   - User-reported errors
   - Import success rate

---

## 🔥 ROLLBACK PLAN

If anything goes wrong:

### Quick Rollback (< 5 minutes)

#### Docker Compose:
```bash
# Revert to previous image
docker-compose down api
docker tag clipforge-api:v0.3.0 clipforge-api:latest
docker-compose up -d api
```

#### Kubernetes:
```bash
# Rollback to previous revision
kubectl rollout undo deployment/clipforge-api

# Or rollback to specific revision
kubectl rollout history deployment/clipforge-api
kubectl rollout undo deployment/clipforge-api --to-revision=2
```

### Verify Rollback:
```bash
curl https://your-domain.com/health
# Should return 200 OK

# Check if old version is running
kubectl describe pod -l app=clipforge-api | grep Image
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Cannot find module 'bullmq'"

**Cause:** Dependencies not installed in container  
**Fix:**
```bash
# Rebuild with no cache
docker build --no-cache -f Dockerfile.api -t clipforge-api:v0.4.0-phase1 apps/api
```

### Issue: "Connection refused to Redis"

**Cause:** Wrong REDIS_URL or Redis not accessible  
**Fix:**
```bash
# Verify Redis is running
redis-cli -h YOUR_REDIS_HOST -p 6379 ping

# Check environment variable
kubectl exec deployment/clipforge-api -- env | grep REDIS_URL

# Test connection from pod
kubectl exec -it deployment/clipforge-api -- sh
nc -zv redis 6379
```

### Issue: "Database connection pool exhausted"

**Cause:** Connection limit too low  
**Fix:**
```bash
# Update DATABASE_URL with higher limit
DATABASE_URL=postgresql://...?connection_limit=50&pool_timeout=10

# Restart deployment
kubectl rollout restart deployment/clipforge-api
```

### Issue: "Jobs stuck in waiting state"

**Cause:** Workers not processing jobs  
**Fix:**
```bash
# Check if workers are running
kubectl logs deployment/clipforge-api | grep "Processing.*job"

# Check queue metrics
curl -H "Authorization: Bearer $TOKEN" \
     https://your-domain.com/v1/queues/metrics

# Restart workers
kubectl rollout restart deployment/clipforge-api
```

---

## 📈 SUCCESS CRITERIA

After 24 hours, verify:

- ✅ **Uptime:** > 99.9%
- ✅ **Success Rate:** > 95%
- ✅ **Response Time:** < 500ms (p95)
- ✅ **Queue Depth:** < 50 waiting jobs
- ✅ **Failed Jobs:** < 5%
- ✅ **User Complaints:** 0
- ✅ **Rollbacks:** 0

If all criteria met: **Phase 1 deployment is successful!** 🎉

---

## 🎯 NEXT STEPS AFTER SUCCESSFUL DEPLOYMENT

1. **Monitor for 1 week**
   - Gather real-world metrics
   - Identify bottlenecks
   - Collect user feedback

2. **Optimize Based on Data**
   - Adjust queue concurrency
   - Fine-tune retry logic
   - Optimize database queries

3. **Plan Phase 2**
   - Review Phase 1 learnings
   - Update Phase 2 requirements
   - Schedule Phase 2 deployment

---

## 📞 SUPPORT

**During Deployment:**
- Monitor Slack channel: #clipforge-deployments
- On-call engineer: [Your contact]
- Escalation: [Manager contact]

**Post-Deployment:**
- Create incident report if issues
- Document lessons learned
- Update runbook

---

## ✅ DEPLOYMENT CHECKLIST

Pre-Deployment:
- [ ] Redis instance ready
- [ ] Database pooling configured
- [ ] Environment variables set
- [ ] Docker image built and tested
- [ ] Rollback plan reviewed
- [ ] Team notified

Deployment:
- [ ] Deploy to staging first
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Test video import
- [ ] Monitor for 1 hour

Post-Deployment:
- [ ] All metrics green
- [ ] No errors in logs
- [ ] Users can import videos
- [ ] Queue processing normally
- [ ] Document any issues
- [ ] Update team

---

**Good luck with the deployment! 🚀**

**Remember:** If anything feels wrong, rollback immediately. Better safe than sorry!
