import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Load Test: Health Check from INSIDE Docker Network
 * 
 * This test runs INSIDE the Docker network to avoid localhost bridge limits
 * Uses internal hostname: http://api:3000
 */

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up to 50 users
    { duration: '30s', target: 50 },  // Stay at 50 users
    { duration: '10s', target: 100 }, // Ramp up to 100 users
    { duration: '30s', target: 100 }, // Stay at 100 users
    { duration: '10s', target: 200 }, // Ramp up to 200 users
    { duration: '30s', target: 200 }, // Stay at 200 users
    { duration: '10s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% of requests should be below 100ms
    http_req_failed: ['rate<0.01'],   // Error rate should be below 1%
  },
};

// Use internal Docker hostname
const BASE_URL = 'http://api:3000';

export default function () {
  const res = http.get(`${BASE_URL}/health/live`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 100ms': (r) => r.timings.duration < 100,
    'has status field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'ok';
      } catch {
        return false;
      }
    },
  });

  sleep(0.5); // Wait 500ms between requests
}

export function setup() {
  console.log('🚀 Starting INTERNAL network health check...');
  console.log(`Target: ${BASE_URL}/health/live`);
  console.log('Running from INSIDE Docker network (no localhost bridge)');
}

export function teardown(data) {
  console.log('✅ Internal network health check complete!');
}
