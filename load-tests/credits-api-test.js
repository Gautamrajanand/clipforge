import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Load Test: Credits API Endpoint
 * 
 * Tests the most frequently called endpoint with caching
 * 
 * Stages:
 * 1. Ramp up to 50 users over 30s
 * 2. Stay at 50 users for 1 minute
 * 3. Ramp up to 100 users over 30s
 * 4. Stay at 100 users for 1 minute
 * 5. Ramp down to 0 over 30s
 */

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    http_req_failed: ['rate<0.01'],   // Error rate should be below 1%
  },
};

// Test configuration
const BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

export default function () {
  // Test 1: Get credit balance (most frequent call)
  const balanceRes = http.get(`${BASE_URL}/v1/credits/balance`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  });

  check(balanceRes, {
    'balance status is 200': (r) => r.status === 200,
    'balance response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1); // Wait 1 second between requests

  // Test 2: Get pricing (cached data)
  const pricingRes = http.get(`${BASE_URL}/v1/payments/pricing`);

  check(pricingRes, {
    'pricing status is 200': (r) => r.status === 200,
    'pricing response time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}

/**
 * Setup function - runs once before the test
 */
export function setup() {
  console.log('🚀 Starting load test...');
  console.log(`Target: ${BASE_URL}`);
  console.log('Test: Credits API with caching');
}

/**
 * Teardown function - runs once after the test
 */
export function teardown(data) {
  console.log('✅ Load test complete!');
}
