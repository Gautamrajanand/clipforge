# ClipForge Scalability Plan

## Current Status (Nov 16, 2025)

### Architecture State
- **Phase**: MVP / Early Testing
- **Capacity**: 1-10 concurrent users
- **Status**: Stable for testing, NOT production-ready

### Known Limitations
1. ❌ Subtitle export is synchronous (10-15 min blocking)
2. ❌ High memory usage during video processing (5-6GB per job)
3. ❌ No horizontal scaling support
4. ❌ No CDN for video delivery
5. ✅ Job queue exists but not used for subtitle export
6. ✅ Caching implemented (prevents regeneration)

---

## Scaling Milestones

### Milestone 1: 0-10 Users (CURRENT)
**Status**: ✅ READY
- Single API instance
- Synchronous processing acceptable
- Manual monitoring
- **Action Required**: None - focus on product validation

### Milestone 2: 10-50 Users (NEXT)
**Status**: 🔄 NEEDS IMPLEMENTATION
**Timeline**: Before public beta launch
**Critical Changes**:
1. Move subtitle export to job queue
2. Add progress polling to frontend
3. Separate worker processes
4. Add basic monitoring (health checks)
5. Increase Docker memory limits

**Estimated Effort**: 1-2 days

### Milestone 3: 50-500 Users (GROWTH)
**Status**: 📋 PLANNED
**Timeline**: Q1 2026
**Critical Changes**:
1. Horizontal scaling (multiple API instances)
2. CDN for video delivery (CloudFlare/CloudFront)
3. Redis caching layer
4. Database read replicas
5. Auto-scaling workers
6. Monitoring & alerting (Prometheus/Grafana)

**Estimated Effort**: 1-2 weeks

### Milestone 4: 500-5000 Users (SCALE)
**Status**: 📋 PLANNED
**Timeline**: Q2 2026
**Critical Changes**:
1. Kubernetes orchestration
2. Multi-region deployment
3. Advanced caching strategies
4. Database sharding
5. Rate limiting & DDoS protection
6. Cost optimization

**Estimated Effort**: 3-4 weeks

---

## Technical Debt Tracking

### High Priority (Before Beta Launch)
- [ ] Async subtitle export with job queue
- [ ] Worker process separation
- [ ] Health check endpoints
- [ ] Memory limit configuration
- [ ] Error monitoring (Sentry)

### Medium Priority (Before 100 Users)
- [ ] CDN integration
- [ ] Redis caching layer
- [ ] Database connection pooling
- [ ] API rate limiting
- [ ] Load balancer setup

### Low Priority (Before 1000 Users)
- [ ] Kubernetes migration
- [ ] Multi-region deployment
- [ ] Advanced monitoring
- [ ] Auto-scaling policies
- [ ] Cost optimization

---

## Memory Usage Analysis

### Current Observations
- **Idle API**: ~200MB
- **Active Processing**: 5-6GB (single video)
- **Container Limit**: 7.65GB
- **Safety Margin**: 1.5GB (20%)

### Scaling Calculations
| Concurrent Jobs | Memory Needed | Recommendation |
|----------------|---------------|----------------|
| 1 job          | 6GB          | ✅ Current setup OK |
| 2 jobs         | 12GB         | ❌ Need worker separation |
| 5 jobs         | 30GB         | ❌ Need multiple workers |
| 10 jobs        | 60GB         | ❌ Need horizontal scaling |

### Solution: Worker Separation
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   API       │────▶│  Redis Queue │────▶│  Worker 1   │ (8GB)
│  (Stateless)│     │   (BullMQ)   │     │  Worker 2   │ (8GB)
│   (2GB)     │     │              │     │  Worker 3   │ (8GB)
└─────────────┘     └──────────────┘     └─────────────┘
```

---

## Decision Framework

### When to Scale?
**Trigger Points**:
1. 🔴 Memory usage >85% consistently
2. 🔴 API response time >5 seconds
3. 🔴 Job queue backlog >10 minutes
4. 🔴 Error rate >5%
5. 🔴 User complaints about slowness

**Current Status**: 🟡 Yellow (high memory but functional)

### What NOT to Do
- ❌ Don't optimize for 1000 users when you have 0
- ❌ Don't refactor working code during testing phase
- ❌ Don't add complexity before validating product-market fit
- ❌ Don't over-engineer infrastructure

### What TO Do
- ✅ Monitor metrics (memory, CPU, response time)
- ✅ Document technical debt
- ✅ Plan scaling milestones
- ✅ Test with realistic load
- ✅ Scale incrementally based on actual usage

---

## Monitoring Setup (TODO)

### Essential Metrics
```typescript
// Health check endpoint
GET /health
{
  status: 'healthy',
  memory: { used: '5.6GB', limit: '7.6GB', percentage: 74 },
  cpu: { usage: 45 },
  queue: { waiting: 3, active: 1, completed: 156 },
  uptime: 3600
}
```

### Alerts to Configure
1. Memory >85% for 5 minutes
2. CPU >90% for 5 minutes
3. Queue backlog >20 jobs
4. API response time >10 seconds
5. Error rate >5%

---

## Cost Projections

### Current (0-10 Users)
- **Infrastructure**: $50/month (single server)
- **Storage**: $10/month (MinIO/S3)
- **Total**: $60/month

### Growth (50-500 Users)
- **Infrastructure**: $200-500/month (multiple workers)
- **CDN**: $50-100/month
- **Storage**: $50-200/month
- **Monitoring**: $50/month
- **Total**: $350-850/month

### Scale (500-5000 Users)
- **Infrastructure**: $1000-2000/month
- **CDN**: $200-500/month
- **Storage**: $500-1000/month
- **Monitoring**: $100/month
- **Total**: $1800-3600/month

**Revenue Target**: $200K MRR by Q4 2026
**Infrastructure Cost**: <2% of revenue (healthy margin)

---

## Action Items

### Immediate (This Week)
- [x] Add caching for captioned videos
- [x] Document scalability plan
- [ ] Test with 2-3 concurrent users
- [ ] Monitor memory usage patterns

### Short-term (Before Beta)
- [ ] Implement async subtitle export
- [ ] Add health check endpoints
- [ ] Set up basic monitoring
- [ ] Load test with 10 concurrent users

### Long-term (Before Launch)
- [ ] Worker separation
- [ ] CDN integration
- [ ] Horizontal scaling
- [ ] Auto-scaling policies

---

## References
- Scalability Memory: See system memories for principles
- PLG Strategy: See PLG_STRATEGY.md
- Current Status: See CURRENT_STATUS.md
- Architecture: See ARCHITECTURE.md

---

**Last Updated**: Nov 16, 2025
**Next Review**: When we hit 10 active users
