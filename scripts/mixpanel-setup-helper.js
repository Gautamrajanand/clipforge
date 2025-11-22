#!/usr/bin/env node

/**
 * Mixpanel Setup Helper - Interactive Guide
 * 
 * Since Mixpanel doesn't support creating funnels via API,
 * this script provides an interactive guide with exact steps.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function printHeader(text) {
  console.log('\n' + '='.repeat(60));
  console.log(text);
  console.log('='.repeat(60) + '\n');
}

function printStep(number, text) {
  console.log(`\n${number}. ${text}`);
}

async function main() {
  console.clear();
  console.log('🎯 Mixpanel Setup Helper - Interactive Guide\n');
  console.log('I\'ll walk you through setting up Mixpanel step-by-step.');
  console.log('Just follow along and press ENTER after each step.\n');

  await ask('Press ENTER to start...');

  // Step 1: Open Mixpanel
  printHeader('STEP 1: Open Mixpanel Dashboard');
  console.log('1. Open this URL in your browser:');
  console.log('   👉 https://mixpanel.com/project/3933289\n');
  console.log('2. Make sure you\'re logged in');
  await ask('\nPress ENTER when you\'re on the dashboard...');

  // Step 2: Create Funnel 1
  printHeader('FUNNEL 1: Signup to First Clip');
  console.log('1. Click "Funnels" in the left sidebar');
  console.log('2. Click "+ Create Funnel" button (top right)');
  await ask('\nPress ENTER when you see the funnel builder...');

  console.log('\n3. In the "Name" field, type:');
  console.log('   👉 Signup to First Clip\n');
  
  console.log('4. Add these steps (click "+ Add Step" for each):');
  console.log('   Step 1: user_signed_up');
  console.log('   Step 2: dashboard_viewed');
  console.log('   Step 3: video_uploaded');
  console.log('   Step 4: project_created');
  console.log('   Step 5: clips_detected');
  console.log('   Step 6: clip_exported\n');
  
  console.log('5. Set "Conversion window" to: 24 hours');
  console.log('6. Click "Save" (top right)');
  await ask('\nPress ENTER when funnel is saved...');

  console.log('\n✅ Funnel 1 created!\n');

  // Step 3: Create Funnel 2
  printHeader('FUNNEL 2: Free to Paid Conversion');
  console.log('1. Click "+ Create Funnel" again');
  await ask('\nPress ENTER when you see the funnel builder...');

  console.log('\n2. Name: Free to Paid Conversion\n');
  
  console.log('3. Add these steps:');
  console.log('   Step 1: upgrade_prompt_shown');
  console.log('   Step 2: upgrade_prompt_clicked');
  console.log('   Step 3: pricing_viewed');
  console.log('   Step 4: checkout_initiated');
  console.log('   Step 5: checkout_completed\n');
  
  console.log('4. Set "Conversion window" to: 7 days');
  console.log('5. Click "Add Filter" below the steps');
  console.log('6. Filter: currentTier = FREE');
  console.log('7. Click "Save"');
  await ask('\nPress ENTER when funnel is saved...');

  console.log('\n✅ Funnel 2 created!\n');

  // Step 4: Create Funnel 3
  printHeader('FUNNEL 3: First to Second Export');
  console.log('1. Click "+ Create Funnel" again');
  await ask('\nPress ENTER when you see the funnel builder...');

  console.log('\n2. Name: First to Second Export\n');
  
  console.log('3. Add these steps:');
  console.log('   Step 1: clip_export_success');
  console.log('   Step 2: dashboard_viewed');
  console.log('   Step 3: project_created');
  console.log('   Step 4: clip_export_success\n');
  
  console.log('4. Set "Conversion window" to: 7 days');
  console.log('5. Click "Save"');
  await ask('\nPress ENTER when funnel is saved...');

  console.log('\n✅ All 3 funnels created!\n');

  // Step 5: Retention Reports
  printHeader('RETENTION REPORTS');
  console.log('Now let\'s create retention reports...\n');
  console.log('1. Click "Retention" in the left sidebar');
  console.log('2. Click "+ Create Report"');
  await ask('\nPress ENTER when you see the retention builder...');

  console.log('\n📊 D1 Retention:');
  console.log('   Name: D1 Retention');
  console.log('   First event: user_signed_up');
  console.log('   Return event: dashboard_viewed');
  console.log('   Time period: 1 day');
  console.log('   Click "Save"\n');
  await ask('Press ENTER when saved...');

  console.log('\n📊 D7 Retention:');
  console.log('   Click "+ Create Report" again');
  console.log('   Name: D7 Retention');
  console.log('   First event: user_signed_up');
  console.log('   Return event: clip_exported');
  console.log('   Time period: 7 days');
  console.log('   Click "Save"\n');
  await ask('Press ENTER when saved...');

  console.log('\n📊 D30 Retention:');
  console.log('   Click "+ Create Report" again');
  console.log('   Name: D30 Retention');
  console.log('   First event: user_signed_up');
  console.log('   Return event: dashboard_viewed');
  console.log('   Time period: 30 days');
  console.log('   Click "Save"\n');
  await ask('Press ENTER when saved...');

  console.log('\n✅ All retention reports created!\n');

  // Step 6: Verify
  printHeader('VERIFICATION');
  console.log('Let\'s verify everything is set up correctly:\n');
  console.log('1. Go to "Funnels" - you should see 3 funnels');
  console.log('2. Go to "Retention" - you should see 3 reports');
  console.log('3. Go to "Live View" - you should see events streaming\n');
  await ask('Press ENTER to finish...');

  // Done!
  printHeader('🎉 SETUP COMPLETE!');
  console.log('Your Mixpanel is now fully configured!\n');
  console.log('What you have:');
  console.log('  ✅ 3 Conversion Funnels');
  console.log('  ✅ 3 Retention Reports');
  console.log('  ✅ Events tracking from your app\n');
  console.log('Next steps:');
  console.log('  1. Wait for data to accumulate (24-48 hours)');
  console.log('  2. Check funnel conversion rates');
  console.log('  3. Analyze retention trends');
  console.log('  4. Set up alerts for key metrics\n');
  console.log('Need help? Check MIXPANEL_SETUP_GUIDE.md\n');

  rl.close();
}

main().catch(console.error);
