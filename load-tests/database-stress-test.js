import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Load Test: Database Connection Pool Stress Test
 * 
 * Tests database under heavy load:
 * - Connection pool exhaustion
 * - Query performance degradation
 * - Transaction deadlocks
 * - Slow queries under load
 * 
 * Stages:
 * 1. Ramp up to 100 users over 1 minute
 * 2. Stay at 100 users for 2 minutes
 * 3. Spike to 200 users for 30 seconds (extreme stress)
 * 4. Drop to 50 users for 1 minute (recovery)
 * 5. Ramp down to 0 over 30s
 */

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp up
    { duration: '2m', target: 100 },   // Sustained load
    { duration: '30s', target: 200 },  // Extreme spike
    { duration: '1m', target: 50 },    // Recovery
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],     // 95% < 1s
    http_req_failed: ['rate<0.05'],        // Error rate < 5%
    'db_query_duration': ['p(95)<500'],    // Query time < 500ms
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'your-test-token-here';

export default function () {
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
  };

  // Test 1: Get credit balance (frequent query)
  const balanceRes = http.get(`${BASE_URL}/v1/credits/balance`, { headers });
  
  check(balanceRes, {
    'balance query successful': (r) => r.status === 200,
    'balance query fast': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // Test 2: Get projects list (complex query with joins)
  const projectsRes = http.get(`${BASE_URL}/v1/projects?limit=10`, { headers });
  
  check(projectsRes, {
    'projects query successful': (r) => r.status === 200,
    'projects query fast': (r) => r.timings.duration < 1000,
  });

  sleep(0.5);

  // Test 3: Get credit transactions (paginated query)
  const transactionsRes = http.get(
    `${BASE_URL}/v1/credits/transactions?page=1&limit=20`,
    { headers }
  );
  
  check(transactionsRes, {
    'transactions query successful': (r) => r.status === 200,
    'transactions query fast': (r) => r.timings.duration < 1000,
  });

  sleep(0.5);

  // Test 4: Get organization details (multiple joins)
  const orgRes = http.get(`${BASE_URL}/v1/organizations/current`, { headers });
  
  check(orgRes, {
    'org query successful': (r) => r.status === 200,
    'org query fast': (r) => r.timings.duration < 500,
  });

  sleep(0.5);

  // Test 5: Get pricing (should be cached)
  const pricingRes = http.get(`${BASE_URL}/v1/payments/pricing`);
  
  check(pricingRes, {
    'pricing query successful': (r) => r.status === 200,
    'pricing query very fast': (r) => r.timings.duration < 100,
  });

  sleep(1);
}

export function setup() {
  console.log('🚀 Starting Database Stress Test');
  console.log(`Target: ${BASE_URL}`);
  console.log('');
  console.log('Load Profile:');
  console.log('- 100 concurrent users (2 min)');
  console.log('- 200 concurrent users (30s spike)');
  console.log('');
  console.log('Testing:');
  console.log('- Connection pool capacity');
  console.log('- Query performance under load');
  console.log('- Cache effectiveness');
  console.log('- Transaction handling');
  console.log('');
  console.log('Monitor:');
  console.log('- Database CPU usage');
  console.log('- Connection count (pg_stat_activity)');
  console.log('- Slow query log');
  console.log('- Lock waits');
  console.log('');
}

export function teardown(data) {
  console.log('');
  console.log('✅ Database Stress Test Complete!');
  console.log('');
  console.log('Check:');
  console.log('1. Database connection pool size (may need increase)');
  console.log('2. Slow queries (add indexes if needed)');
  console.log('3. Cache hit rate (Redis)');
  console.log('4. Connection leaks');
}
