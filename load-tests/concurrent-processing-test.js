import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Load Test: Concurrent Video Processing
 * 
 * Stress test for video processing pipeline:
 * - Tests memory usage under load
 * - Tests worker queue capacity
 * - Tests database connection pooling
 * - Tests FFmpeg concurrent processing
 * 
 * This is the CRITICAL test for finding bottlenecks
 * 
 * Stages:
 * 1. Ramp up to 50 users over 2 minutes
 * 2. Stay at 50 users for 3 minutes (sustained load)
 * 3. Spike to 100 users for 1 minute (stress test)
 * 4. Drop to 25 users for 2 minutes (recovery)
 * 5. Ramp down to 0 over 1 minute
 */

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Gradual ramp up
    { duration: '3m', target: 50 },   // Sustained load
    { duration: '1m', target: 100 },  // Spike test
    { duration: '2m', target: 25 },   // Recovery test
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'],    // 95% < 10s
    http_req_failed: ['rate<0.10'],        // Error rate < 10%
    'processing_queue_time': ['p(95)<60000'], // Queue time < 60s
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'your-test-token-here';

// Multiple test videos of different sizes
const TEST_VIDEOS = [
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_2MB.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_5MB.mp4',
];

export default function () {
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Randomly select a test video
  const videoUrl = TEST_VIDEOS[Math.floor(Math.random() * TEST_VIDEOS.length)];

  // Create project
  const projectPayload = JSON.stringify({
    name: `Concurrent Test ${__VU}-${__ITER}`,
    sourceUrl: videoUrl,
  });

  const startTime = Date.now();

  const createRes = http.post(
    `${BASE_URL}/v1/projects`,
    projectPayload,
    { headers }
  );

  const created = check(createRes, {
    'project created': (r) => r.status === 201,
    'has project ID': (r) => r.json('id') !== undefined,
  });

  if (!created) {
    console.error(`❌ VU ${__VU}: Failed to create project - ${createRes.status}`);
    return;
  }

  const projectId = createRes.json('id');
  const queueTime = Date.now() - startTime;

  console.log(`VU ${__VU}: Project ${projectId} created (queue: ${queueTime}ms)`);

  // Wait for processing (simulate real user behavior)
  sleep(5);

  // Check status
  const statusRes = http.get(`${BASE_URL}/v1/projects/${projectId}`, { headers });

  check(statusRes, {
    'status check successful': (r) => r.status === 200,
  });

  const status = statusRes.json('status');
  console.log(`VU ${__VU}: Project ${projectId} status: ${status}`);

  // Generate clips if ready
  if (status === 'COMPLETED' || status === 'READY') {
    const clipsPayload = JSON.stringify({
      numClips: 2,
      clipLength: 15,
    });

    const clipsRes = http.post(
      `${BASE_URL}/v1/projects/${projectId}/clips/generate`,
      clipsPayload,
      { headers }
    );

    check(clipsRes, {
      'clips generated': (r) => r.status === 200 || r.status === 201,
    });

    console.log(`VU ${__VU}: Generated clips for ${projectId}`);
  }

  // Random wait to simulate real user behavior
  sleep(Math.random() * 3 + 2); // 2-5 seconds
}

export function setup() {
  console.log('🚀 Starting Concurrent Processing Stress Test');
  console.log(`Target: ${BASE_URL}`);
  console.log('');
  console.log('Load Profile:');
  console.log('- 50 concurrent users (3 min sustained)');
  console.log('- 100 concurrent users (1 min spike)');
  console.log('- 25 concurrent users (2 min recovery)');
  console.log('');
  console.log('Monitoring:');
  console.log('- Memory usage (watch for leaks)');
  console.log('- Database connections (watch for exhaustion)');
  console.log('- Worker queue depth (watch for backlog)');
  console.log('- FFmpeg processes (watch for zombies)');
  console.log('');
}

export function teardown(data) {
  console.log('');
  console.log('✅ Concurrent Processing Test Complete!');
  console.log('');
  console.log('Next Steps:');
  console.log('1. Check API logs for errors');
  console.log('2. Check memory usage (docker stats)');
  console.log('3. Check database connections (pg_stat_activity)');
  console.log('4. Check worker queue depth');
  console.log('5. Look for memory leaks or zombie processes');
}
