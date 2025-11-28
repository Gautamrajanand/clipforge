# ClipForge Load Testing Suite

Comprehensive load testing infrastructure to ensure ClipForge can handle production traffic.

## 🎯 Goals

- **Verify 100 concurrent users** can use the platform simultaneously
- **Identify bottlenecks** before they become production issues
- **Validate scalability** of video processing pipeline
- **Test database** connection pooling and query performance
- **Monitor memory** usage and detect leaks
- **Ensure API** response times meet SLA targets

## 📊 Test Suite

### 1. Health Check Test (`health-check-test.js`)
**Duration:** ~1 minute  
**Purpose:** Quick smoke test to verify API is responding

- Tests: `/health` endpoint
- Load: 10 → 50 users
- Thresholds: 95% < 100ms, <1% errors

### 2. Credits API Test (`credits-api-test.js`)
**Duration:** ~4 minutes  
**Purpose:** Test most frequently called endpoints with caching

- Tests: `/v1/credits/balance`, `/v1/payments/pricing`
- Load: 50 → 100 users
- Thresholds: 95% < 200ms, <1% errors
- Focus: Redis caching effectiveness

### 3. Database Stress Test (`database-stress-test.js`)
**Duration:** ~5 minutes  
**Purpose:** Stress test database connection pool

- Tests: Multiple read-heavy endpoints
- Load: 100 → 200 users (spike test)
- Thresholds: 95% < 1s, <5% errors
- Focus: Connection pool exhaustion, slow queries

### 4. Video Upload Test (`video-upload-test.js`)
**Duration:** ~10 minutes  
**Purpose:** Test critical user flow end-to-end

- Tests: Project creation → Processing → Clip generation
- Load: 10 → 25 → 50 users
- Thresholds: 95% < 10s upload, 95% < 30s processing
- Focus: Video processing pipeline, worker queues

### 5. Concurrent Processing Test (`concurrent-processing-test.js`)
**Duration:** ~9 minutes  
**Purpose:** Stress test video processing under heavy load

- Tests: Multiple concurrent video uploads
- Load: 50 → 100 users (spike test)
- Thresholds: 95% < 10s, <10% errors
- Focus: Memory usage, FFmpeg processes, worker capacity

## 🚀 Quick Start

### Prerequisites

1. **Install k6:**
   ```bash
   # macOS
   brew install k6
   
   # Linux
   sudo apt-get install k6
   
   # Windows
   choco install k6
   ```

2. **Start ClipForge:**
   ```bash
   docker-compose up -d
   ```

3. **Get Auth Token:**
   - Login to http://localhost:3001
   - Open DevTools → Application → Cookies
   - Copy `__session` cookie value
   
   ```bash
   export AUTH_TOKEN="your-clerk-token-here"
   ```

### Run All Tests

```bash
cd load-tests
./run-all-tests.sh
```

### Run Individual Test

```bash
k6 run \
  -e API_URL=http://localhost:3000 \
  -e AUTH_TOKEN="your-token" \
  ./health-check-test.js
```

### Monitor System (Separate Terminal)

```bash
cd load-tests
./monitor-system.sh
```

## 📈 Interpreting Results

### Key Metrics

1. **http_req_duration (p95)**
   - Target: <5s for most endpoints
   - Critical: <10s for video processing
   - If higher: Optimize slow endpoints

2. **http_req_failed**
   - Target: <5% error rate
   - Critical: <10% error rate
   - If higher: Fix errors before launch

3. **Memory Usage**
   - Should be stable (no continuous growth)
   - Spikes are OK, but should return to baseline
   - If growing: Memory leak - investigate

4. **Database Connections**
   - Should not exhaust pool (default: 10)
   - Active connections should be < pool size
   - If exhausted: Increase pool or optimize queries

5. **Worker Queue Depth**
   - Should process jobs faster than they arrive
   - Queue should not grow unbounded
   - If growing: Add more workers or optimize processing

### Success Criteria

✅ **PASS** if:
- 95% of requests < 5s
- Error rate < 5%
- Memory usage stable
- No database connection exhaustion
- No worker queue backlog

⚠️ **WARNING** if:
- 95% of requests 5-10s
- Error rate 5-10%
- Memory usage growing slowly
- Database connections near limit
- Worker queue growing slowly

❌ **FAIL** if:
- 95% of requests > 10s
- Error rate > 10%
- Memory leaks detected
- Database connections exhausted
- Worker queue backlog growing

## 🔍 Troubleshooting

### High Response Times

1. Check API logs: `docker-compose logs api`
2. Check slow queries: See monitor script
3. Check worker queue: `docker-compose logs workers`
4. Profile code: Add timing logs

### High Error Rates

1. Check API logs for stack traces
2. Check database errors
3. Check worker errors
4. Verify auth tokens are valid

### Memory Leaks

1. Monitor memory over time: `docker stats`
2. Check for unclosed connections
3. Check for large objects in memory
4. Profile with Node.js heap snapshots

### Database Issues

1. Check connection pool size
2. Add indexes for slow queries
3. Optimize N+1 queries
4. Consider read replicas

### Worker Queue Backlog

1. Add more worker instances
2. Optimize video processing
3. Implement job priorities
4. Add queue monitoring

## 📊 Results Analysis

Results are saved to `./load-test-results/` with timestamp.

### View Results

```bash
# Summary
k6 inspect ./load-test-results/20251129_030000_health-check.json

# Detailed metrics
cat ./load-test-results/20251129_030000_health-check.json | jq '.metrics'
```

### Key Files

- `system-monitor-*.log` - System resource logs
- `*_health-check.json` - Health check results
- `*_credits-api.json` - Credits API results
- `*_database-stress.json` - Database stress results
- `*_video-upload.json` - Video upload results
- `*_concurrent-processing.json` - Concurrent processing results

## 🎯 Performance Targets

### API Endpoints

| Endpoint | p95 Target | p99 Target |
|----------|-----------|-----------|
| `/health` | <100ms | <200ms |
| `/v1/credits/balance` | <200ms | <500ms |
| `/v1/projects` | <500ms | <1s |
| `/v1/projects/:id` | <500ms | <1s |
| `/v1/projects` (POST) | <5s | <10s |
| `/v1/projects/:id/clips/generate` | <30s | <60s |

### System Resources

| Resource | Target | Critical |
|----------|--------|----------|
| API Memory | <512MB | <1GB |
| Worker Memory | <1GB | <2GB |
| Database Connections | <8/10 | <10/10 |
| CPU Usage | <70% | <90% |
| Disk I/O | <80% | <95% |

## 🚨 Pre-Launch Checklist

Before launching to production, ensure:

- [ ] All load tests pass with 100 concurrent users
- [ ] Error rate < 5% under load
- [ ] Memory usage stable (no leaks)
- [ ] Database queries optimized (all < 1s)
- [ ] Worker queue processes jobs faster than arrival rate
- [ ] API response times meet SLA targets
- [ ] System recovers gracefully from spike traffic
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery tested
- [ ] Rollback plan documented

## 📚 Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [Load Testing Best Practices](https://k6.io/docs/testing-guides/test-types/)
- [Performance Optimization Guide](../docs/PERFORMANCE_OPTIMIZATION.md)
- [Scalability Plan](../SCALABILITY_PLAN.md)

## 🤝 Contributing

Found a performance issue? Create an issue with:
- Load test results
- System monitor logs
- Steps to reproduce
- Expected vs actual behavior

---

**Last Updated:** November 29, 2025  
**Version:** 1.0.0  
**Status:** Ready for Testing
