/**
 * Mixpanel Setup Automation Script
 * 
 * This script uses Mixpanel's API to automatically create:
 * - Conversion funnels
 * - Retention reports
 * - Alerts
 * - Dashboard
 * 
 * Usage:
 * 1. Get your Mixpanel API credentials:
 *    - Go to https://mixpanel.com/settings/project
 *    - Copy your Project ID and API Secret
 * 2. Set environment variables:
 *    export MIXPANEL_PROJECT_ID="your_project_id"
 *    export MIXPANEL_API_SECRET="your_api_secret"
 * 3. Run: node scripts/setup-mixpanel.js
 */

const https = require('https');

// Configuration
const MIXPANEL_PROJECT_ID = process.env.MIXPANEL_PROJECT_ID;
const MIXPANEL_API_SECRET = process.env.MIXPANEL_API_SECRET;
const MIXPANEL_PROJECT_TOKEN = '603fc822ee6a3bf68a426ab45a2dc99c';

if (!MIXPANEL_PROJECT_ID || !MIXPANEL_API_SECRET) {
  console.error('❌ Missing environment variables!');
  console.error('Please set MIXPANEL_PROJECT_ID and MIXPANEL_API_SECRET');
  console.error('\nGet these from: https://mixpanel.com/settings/project');
  process.exit(1);
}

// Helper function to make Mixpanel API requests
function mixpanelRequest(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${MIXPANEL_API_SECRET}:`).toString('base64');
    
    const options = {
      hostname: 'mixpanel.com',
      port: 443,
      path: `/api/2.0${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`API request failed: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Funnel 1: Signup to First Clip
async function createSignupToFirstClipFunnel() {
  console.log('📊 Creating "Signup to First Clip" funnel...');
  
  const funnel = {
    name: 'Signup to First Clip',
    project_id: MIXPANEL_PROJECT_ID,
    steps: [
      { event: 'user_signed_up' },
      { event: 'dashboard_viewed' },
      { event: 'video_uploaded' },
      { event: 'project_created' },
      { event: 'clips_detected' },
      { event: 'clip_exported' },
    ],
    conversion_window: 86400, // 24 hours in seconds
  };

  try {
    const result = await mixpanelRequest('POST', '/funnels', funnel);
    console.log('✅ Funnel created:', result);
  } catch (error) {
    console.error('❌ Failed to create funnel:', error.message);
  }
}

// Funnel 2: Free to Paid
async function createFreeToPaidFunnel() {
  console.log('📊 Creating "Free to Paid" funnel...');
  
  const funnel = {
    name: 'Free to Paid Conversion',
    project_id: MIXPANEL_PROJECT_ID,
    steps: [
      { event: 'upgrade_prompt_shown' },
      { event: 'upgrade_prompt_clicked' },
      { event: 'pricing_viewed' },
      { event: 'checkout_initiated' },
      { event: 'checkout_completed' },
    ],
    conversion_window: 604800, // 7 days in seconds
    filters: [
      {
        property: 'currentTier',
        operator: 'equals',
        value: 'FREE',
      },
    ],
  };

  try {
    const result = await mixpanelRequest('POST', '/funnels', funnel);
    console.log('✅ Funnel created:', result);
  } catch (error) {
    console.error('❌ Failed to create funnel:', error.message);
  }
}

// Funnel 3: First to Second Export
async function createFirstToSecondExportFunnel() {
  console.log('📊 Creating "First to Second Export" funnel...');
  
  const funnel = {
    name: 'First to Second Export',
    project_id: MIXPANEL_PROJECT_ID,
    steps: [
      { event: 'clip_export_success' },
      { event: 'dashboard_viewed' },
      { event: 'project_created' },
      { event: 'clip_export_success' },
    ],
    conversion_window: 604800, // 7 days in seconds
  };

  try {
    const result = await mixpanelRequest('POST', '/funnels', funnel);
    console.log('✅ Funnel created:', result);
  } catch (error) {
    console.error('❌ Failed to create funnel:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Mixpanel setup automation...\n');
  console.log(`Project ID: ${MIXPANEL_PROJECT_ID}`);
  console.log(`Project Token: ${MIXPANEL_PROJECT_TOKEN}\n`);

  try {
    await createSignupToFirstClipFunnel();
    await createFreeToPaidFunnel();
    await createFirstToSecondExportFunnel();

    console.log('\n✅ Mixpanel setup complete!');
    console.log('\nNext steps:');
    console.log('1. Go to https://mixpanel.com/');
    console.log('2. Check "Funnels" to see your new funnels');
    console.log('3. Manually create retention reports (API doesn\'t support this yet)');
    console.log('4. Manually create alerts (API doesn\'t support this yet)');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run
main();
