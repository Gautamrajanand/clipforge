# Scale-First Principles - ClipForge

**Last Updated:** November 12, 2025  
**Status:** 🔴 **MISSION CRITICAL - ALWAYS FOLLOW**

---

## 🎯 **CORE PRINCIPLE**

> **"Build for 100,000 users from Day 1, even if you only have 100."**

Every line of code, every architectural decision, every feature MUST be built with massive scale in mind. This is NON-NEGOTIABLE.

---

## 📜 **THE 7 COMMANDMENTS OF SCALE**

### 1. **THOU SHALT USE JOB QUEUES**

❌ **NEVER DO THIS:**
```typescript
// Fire-and-forget async - WRONG!
this.processVideo(videoId).catch(err => console.error(err));
```

✅ **ALWAYS DO THIS:**
```typescript
// Use job queue - RIGHT!
await videoQueue.add('process-video', { videoId }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
```

**Why:** Jobs can be retried, monitored, and scaled independently.

---

### 2. **THOU SHALT KEEP SERVICES STATELESS**

❌ **NEVER DO THIS:**
```typescript
// In-memory state - WRONG!
class VideoService {
  private processingVideos = new Map();
}
```

✅ **ALWAYS DO THIS:**
```typescript
// Use database/Redis for state - RIGHT!
await redis.set(`processing:${videoId}`, JSON.stringify(state));
```

**Why:** Stateless services can be horizontally scaled without data loss.

---

### 3. **THOU SHALT CACHE AGGRESSIVELY**

❌ **NEVER DO THIS:**
```typescript
// Query database every time - WRONG!
const project = await prisma.project.findUnique({ where: { id } });
```

✅ **ALWAYS DO THIS:**
```typescript
// Cache with TTL - RIGHT!
let project = await redis.get(`project:${id}`);
if (!project) {
  project = await prisma.project.findUnique({ where: { id } });
  await redis.setex(`project:${id}`, 300, JSON.stringify(project));
}
```

**Why:** Reduces database load by 90%+, improves response times.

---

### 4. **THOU SHALT USE CONNECTION POOLING**

❌ **NEVER DO THIS:**
```typescript
// Unlimited connections - WRONG!
DATABASE_URL=postgresql://user:pass@host:5432/db
```

✅ **ALWAYS DO THIS:**
```typescript
// Limited connection pool - RIGHT!
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
```

**Why:** Prevents database connection exhaustion and crashes.

---

### 5. **THOU SHALT SERVE MEDIA VIA CDN**

❌ **NEVER DO THIS:**
```typescript
// Serve directly from storage - WRONG!
const videoUrl = `${minioUrl}/${key}`;
```

✅ **ALWAYS DO THIS:**
```typescript
// Serve via CDN - RIGHT!
const videoUrl = `${cdnUrl}/${key}`;
```

**Why:** Reduces bandwidth costs by 80%+, improves loading times globally.

---

### 6. **THOU SHALT MONITOR EVERYTHING**

❌ **NEVER DO THIS:**
```typescript
// Just console.log - WRONG!
console.log('Processing video:', videoId);
```

✅ **ALWAYS DO THIS:**
```typescript
// Structured logging + metrics - RIGHT!
logger.info('Processing video', { videoId, userId, duration });
metrics.increment('video.processing.started');
```

**Why:** Can't fix what you can't see. Monitoring is critical for production.

---

### 7. **THOU SHALT DESIGN FOR FAILURE**

❌ **NEVER DO THIS:**
```typescript
// Assume success - WRONG!
await externalApi.call();
```

✅ **ALWAYS DO THIS:**
```typescript
// Retry with exponential backoff - RIGHT!
await retry(
  () => externalApi.call(),
  { retries: 3, factor: 2, minTimeout: 1000 }
);
```

**Why:** Networks fail, services crash, disks fill. Always have a fallback.

---

## 🚫 **FORBIDDEN PATTERNS**

### ❌ Fire-and-Forget Async
```typescript
// NEVER DO THIS
this.longRunningTask().catch(err => console.error(err));
```

### ❌ In-Memory State
```typescript
// NEVER DO THIS
const cache = new Map();
```

### ❌ Synchronous Processing
```typescript
// NEVER DO THIS
app.post('/upload', async (req, res) => {
  await processVideo(req.file); // Blocks request
  res.send('Done');
});
```

### ❌ Unbounded Queries
```typescript
// NEVER DO THIS
const allProjects = await prisma.project.findMany(); // No limit!
```

### ❌ Direct Database Access in Loops
```typescript
// NEVER DO THIS
for (const id of ids) {
  await prisma.project.findUnique({ where: { id } }); // N+1 query!
}
```

---

## ✅ **REQUIRED PATTERNS**

### ✅ Job Queue for Long Operations
```typescript
// Video import
await videoQueue.add('import-video', { url, projectId });

// Transcription
await transcriptionQueue.add('transcribe', { projectId });

// Clip detection
await clipQueue.add('detect-clips', { projectId });
```

### ✅ Caching Layer
```typescript
// Cache project data (5 min)
await redis.setex(`project:${id}`, 300, JSON.stringify(project));

// Cache clip data (10 min)
await redis.setex(`clips:${projectId}`, 600, JSON.stringify(clips));

// Cache transcript (30 min)
await redis.setex(`transcript:${projectId}`, 1800, JSON.stringify(transcript));
```

### ✅ Pagination
```typescript
// Always paginate
const projects = await prisma.project.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' }
});
```

### ✅ Batch Operations
```typescript
// Batch database queries
const projects = await prisma.project.findMany({
  where: { id: { in: ids } }
});
```

### ✅ Health Checks
```typescript
@Get('/health')
async health() {
  return {
    status: 'ok',
    database: await this.checkDatabase(),
    redis: await this.checkRedis(),
    storage: await this.checkStorage(),
    timestamp: new Date().toISOString()
  };
}
```

---

## 📊 **PERFORMANCE TARGETS**

### API Response Times
- **List endpoints:** < 100ms (p95)
- **Detail endpoints:** < 200ms (p95)
- **Create endpoints:** < 500ms (p95)
- **Health checks:** < 50ms (p95)

### Database Queries
- **Simple queries:** < 10ms
- **Complex queries:** < 100ms
- **Aggregations:** < 500ms
- **No query > 1 second**

### Job Processing
- **Video import:** < 3 minutes
- **Transcription:** < 2 minutes
- **Clip detection:** < 1 minute
- **Export:** < 30 seconds

### Resource Limits
- **API memory:** < 512MB per instance
- **Worker memory:** < 2GB per instance
- **Database connections:** < 20 per instance
- **Redis connections:** < 10 per instance

---

## 🏗️ **ARCHITECTURE REQUIREMENTS**

### Required Components (Phase 1 - CRITICAL)
- ✅ **BullMQ** - Job queue system
- ✅ **Redis** - Caching + rate limiting + job queue
- ✅ **PostgreSQL** - Primary database with connection pooling
- ✅ **MinIO/S3** - Object storage
- ✅ **Prometheus** - Metrics collection
- ✅ **Grafana** - Metrics visualization

### Required Components (Phase 2 - HIGH)
- ✅ **Nginx/Traefik** - Load balancer
- ✅ **PostgreSQL Replica** - Read replica for queries
- ✅ **Redis Cluster** - Distributed caching
- ✅ **Sentry** - Error tracking

### Required Components (Phase 3 - MEDIUM)
- ✅ **CloudFront/Cloudflare** - CDN for video delivery
- ✅ **ELK Stack** - Log aggregation
- ✅ **Kubernetes** - Container orchestration

---

## 🔍 **CODE REVIEW CHECKLIST**

Before merging ANY code, verify:

### Scalability
- [ ] Uses job queue for long operations (>5 seconds)
- [ ] Services are stateless (no in-memory state)
- [ ] Implements caching where appropriate
- [ ] Uses connection pooling
- [ ] Paginates list endpoints
- [ ] Batches database operations

### Performance
- [ ] No N+1 queries
- [ ] Database queries have indexes
- [ ] API responses < 500ms
- [ ] No blocking operations in request handlers

### Reliability
- [ ] Implements retry logic for external calls
- [ ] Has error handling and logging
- [ ] Validates input data
- [ ] Has health check endpoints

### Monitoring
- [ ] Logs important events
- [ ] Emits metrics for key operations
- [ ] Includes tracing context
- [ ] Has alerting for failures

---

## 📈 **CAPACITY PLANNING**

### Current Capacity (MVP)
- **Users:** ~100 concurrent
- **API Instances:** 1
- **Worker Instances:** 1
- **Database:** Single instance
- **Cost:** ~$100/month

### Target Capacity (Phase 1)
- **Users:** ~500 concurrent
- **API Instances:** 1 (with job queue)
- **Worker Instances:** 3
- **Database:** Single instance + pooling
- **Cost:** ~$150/month

### Target Capacity (Phase 2)
- **Users:** ~10,000 concurrent
- **API Instances:** 3 (load balanced)
- **Worker Instances:** 5-10 (auto-scaled)
- **Database:** Primary + replica
- **Cost:** ~$700/month

### Target Capacity (Phase 3)
- **Users:** ~100,000 concurrent
- **API Instances:** 10+ (auto-scaled)
- **Worker Instances:** 20+ (auto-scaled)
- **Database:** Cluster (3+ nodes)
- **Cost:** ~$3,280/month

---

## 🚨 **PRODUCTION READINESS CHECKLIST**

Before launching to production, MUST have:

### Infrastructure
- [ ] BullMQ job queue system
- [ ] Redis caching layer
- [ ] Database connection pooling
- [ ] Health check endpoints
- [ ] Load balancer (Nginx/Traefik)
- [ ] CDN for video delivery

### Monitoring
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] Sentry error tracking
- [ ] Log aggregation (ELK/Loki)
- [ ] Alerting (PagerDuty/Opsgenie)

### Performance
- [ ] API response times < 500ms (p95)
- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] Load testing completed (1000+ concurrent users)

### Reliability
- [ ] Retry logic for external calls
- [ ] Circuit breakers for dependencies
- [ ] Graceful degradation
- [ ] Backup and recovery procedures

### Security
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] HTTPS enforced

---

## 📚 **REFERENCE DOCUMENTS**

- **SCALABILITY_AUDIT.md** - Detailed gap analysis and roadmap
- **ARCHITECTURE.md** - System architecture documentation
- **API_DOCUMENTATION.md** - API endpoints and usage
- **COMPLETE_PRODUCT_ROADMAP.md** - Product development roadmap

---

## 🎓 **LEARNING RESOURCES**

### Books
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "Building Microservices" by Sam Newman
- "Site Reliability Engineering" by Google

### Articles
- [The Twelve-Factor App](https://12factor.net/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Scaling to 100k Users](https://alexpareto.com/scalability/systems/2020/02/03/scaling-100k.html)

---

## ✅ **QUICK REFERENCE**

### When Adding a New Feature
1. Will this run for >5 seconds? → Use job queue
2. Will this be called frequently? → Add caching
3. Does this query the database? → Add pagination + indexes
4. Does this call external API? → Add retry logic
5. Can this fail? → Add error handling + logging

### When Reviewing Code
1. Check for fire-and-forget async → Reject
2. Check for in-memory state → Reject
3. Check for N+1 queries → Reject
4. Check for missing error handling → Reject
5. Check for missing logging → Reject

### When Deploying
1. Run load tests → Verify performance
2. Check metrics → Verify no regressions
3. Monitor errors → Verify no new issues
4. Check resource usage → Verify within limits
5. Have rollback plan → Be ready to revert

---

**Remember: Scale is not optional. It's a requirement.**

**Build for 100,000 users today, even if you only have 100.**

---

**Last Updated:** November 12, 2025  
**Next Review:** December 12, 2025  
**Owner:** Engineering Team
