import http from 'k6/http';
import { check, sleep } from 'k6';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

/**
 * Load Test: Video Upload & Processing
 * 
 * Critical path test - simulates real user flow:
 * 1. Upload video
 * 2. Poll for processing status
 * 3. Generate AI clips
 * 
 * Stages:
 * 1. Ramp up to 10 users over 1 minute (slow start)
 * 2. Stay at 10 users for 2 minutes
 * 3. Ramp up to 25 users over 1 minute
 * 4. Stay at 25 users for 2 minutes
 * 5. Ramp up to 50 users over 1 minute (stress test)
 * 6. Stay at 50 users for 1 minute
 * 7. Ramp down to 0 over 30s
 */

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up slowly
    { duration: '2m', target: 10 },   // Sustain 10 users
    { duration: '1m', target: 25 },   // Ramp up to 25
    { duration: '2m', target: 25 },   // Sustain 25 users
    { duration: '1m', target: 50 },   // Stress test with 50
    { duration: '1m', target: 50 },   // Sustain stress
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],     // 95% of requests < 5s
    http_req_failed: ['rate<0.05'],        // Error rate < 5%
    'upload_duration': ['p(95)<10000'],    // 95% of uploads < 10s
    'processing_duration': ['p(95)<30000'], // 95% of processing < 30s
  },
};

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'your-test-token-here';

// Sample video URL (small test video)
const TEST_VIDEO_URL = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';

export default function () {
  const headers = {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
  };

  // Step 1: Create project
  const projectPayload = JSON.stringify({
    name: `Load Test Project ${__VU}-${__ITER}`,
    sourceUrl: TEST_VIDEO_URL,
  });

  const createProjectRes = http.post(
    `${BASE_URL}/v1/projects`,
    projectPayload,
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );

  const projectCreated = check(createProjectRes, {
    'project created (201)': (r) => r.status === 201,
    'project has ID': (r) => r.json('id') !== undefined,
  });

  if (!projectCreated) {
    console.error(`Failed to create project: ${createProjectRes.status}`);
    return;
  }

  const projectId = createProjectRes.json('id');
  console.log(`✅ Created project: ${projectId}`);

  sleep(2); // Wait for video download/processing

  // Step 2: Poll for project status
  let processingComplete = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!processingComplete && attempts < maxAttempts) {
    const statusRes = http.get(`${BASE_URL}/v1/projects/${projectId}`, {
      headers,
    });

    check(statusRes, {
      'status check successful': (r) => r.status === 200,
    });

    const status = statusRes.json('status');
    if (status === 'COMPLETED' || status === 'READY') {
      processingComplete = true;
      console.log(`✅ Project ${projectId} processing complete`);
    } else if (status === 'FAILED') {
      console.error(`❌ Project ${projectId} failed`);
      return;
    }

    attempts++;
    sleep(3); // Poll every 3 seconds
  }

  if (!processingComplete) {
    console.warn(`⚠️ Project ${projectId} still processing after ${maxAttempts} attempts`);
    return;
  }

  // Step 3: Generate AI clips (if processing complete)
  const clipsPayload = JSON.stringify({
    numClips: 3,
    clipLength: 30,
  });

  const generateClipsRes = http.post(
    `${BASE_URL}/v1/projects/${projectId}/clips/generate`,
    clipsPayload,
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    }
  );

  check(generateClipsRes, {
    'clips generated successfully': (r) => r.status === 200 || r.status === 201,
    'clips response has data': (r) => r.json('clips') !== undefined,
  });

  console.log(`✅ Generated clips for project ${projectId}`);

  sleep(5); // Wait before next iteration
}

export function setup() {
  console.log('🚀 Starting Video Upload & Processing Load Test');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Auth: ${AUTH_TOKEN ? 'Configured' : '⚠️ Missing'}`);
  console.log('');
  console.log('Test Flow:');
  console.log('1. Create project with video URL');
  console.log('2. Poll for processing completion');
  console.log('3. Generate AI clips');
  console.log('');
  console.log('Expected Load:');
  console.log('- 10 concurrent users (2 min)');
  console.log('- 25 concurrent users (2 min)');
  console.log('- 50 concurrent users (1 min stress test)');
  console.log('');
}

export function teardown(data) {
  console.log('');
  console.log('✅ Video Upload & Processing Load Test Complete!');
  console.log('Check metrics above for performance analysis');
}
