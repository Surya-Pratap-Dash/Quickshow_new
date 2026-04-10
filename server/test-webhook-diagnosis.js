#!/usr/bin/env node

/**
 * WEBHOOK DIAGNOSTIC TEST
 * 
 * This file helps debug why users aren't being synced from Clerk to your database.
 * 
 * Run: node test-webhook-diagnosis.js
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function runDiagnostics() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 QUICKSHOW WEBHOOK DIAGNOSIS');
  console.log('='.repeat(80) + '\n');

  try {
    // Test 1: Check if server is running
    console.log('Test 1: Server Health Check');
    console.log('-'.repeat(80));
    try {
      const healthCheck = await axios.get(`${BASE_URL}/`);
      console.log('✅ Server is running at', BASE_URL);
      console.log('   Response:', healthCheck.data);
    } catch (err) {
      console.log('❌ Server is NOT running at', BASE_URL);
      console.log('   Make sure: npm start (in server folder)');
      return;
    }

    console.log('\n');

    // Test 2: Check Inngest status
    console.log('Test 2: Inngest Gateway Status');
    console.log('-'.repeat(80));
    try {
      const inngestStatus = await axios.get(`${BASE_URL}/api/diagnose/inngest-status`);
      console.log('✅ Inngest is configured');
      console.log('\n⚠️  CRITICAL FOR LOCAL DEVELOPMENT:');
      inngestStatus.data.instructions.forEach(instruction => {
        console.log('   ' + instruction);
      });
    } catch (err) {
      console.log('❌ Inngest status check failed');
      console.log('   Error:', err.message);
    }

    console.log('\n');

    // Test 3: Check webhook events
    console.log('Test 3: Webhook Events Received');
    console.log('-'.repeat(80));
    try {
      const webhooks = await axios.get(`${BASE_URL}/api/diagnose/webhook-events`);
      console.log(`Total webhooks received: ${webhooks.data.totalWebhooksReceived}`);
      
      if (webhooks.data.totalWebhooksReceived === 0) {
        console.log('\n❌ No webhooks received yet!');
        console.log('\nThis means:');
        console.log('  1. Clerk is not sending webhooks to your server, OR');
        console.log('  2. Webhooks are being sent to the wrong URL, OR');
        console.log('  3. inngest dev is not running');
        console.log('\nTo fix:');
        console.log('  1. Make sure inngest dev is running: inngest dev');
        console.log('  2. Go to https://dashboard.clerk.com');
        console.log('  3. Click Webhooks');
        console.log('  4. Edit the webhook endpoint');
        console.log('  5. Change URL to: http://localhost:8288/api/inngest');
        console.log('  6. Click Save');
        console.log('  7. Try signing up with Google again');
      } else {
        console.log('✅ Webhooks ARE being received!');
        console.log('\nRecent events:');
        webhooks.data.recentEvents.forEach((event, idx) => {
          console.log(`\n  Event ${idx + 1}:`);
          console.log(`    Type: ${event.type}`);
          console.log(`    Email: ${event.email}`);
          console.log(`    Name: ${event.firstName}`);
          console.log(`    Time: ${event.timestamp}`);
        });
      }
    } catch (err) {
      console.log('❌ Could not fetch webhook events');
      console.log('   Error:', err.message);
    }

    console.log('\n');

    // Test 4: Manual user creation
    console.log('Test 4: Manual User Creation (Sync Test)');
    console.log('-'.repeat(80));
    try {
      const response = await axios.post(`${BASE_URL}/api/diagnose/manual-sync`);
      console.log('✅ Manual user creation WORKS!');
      console.log('   User ID:', response.data.user.id);
      console.log('   Email:', response.data.user.email);
      console.log('\n✓ Database connection is working');
      console.log('✓ User model is working');
      console.log('✓ The issue is with WEBHOOK processing');
    } catch (err) {
      console.log('❌ Manual user creation FAILED');
      console.log('   Error:', err.response?.data?.error || err.message);
      console.log('\nThis means:');
      console.log('  - Database connection is NOT working, OR');
      console.log('  - User model has issues');
    }

    console.log('\n');

    // Test 5: Check all users in database
    console.log('Test 5: Users in Database');
    console.log('-'.repeat(80));
    try {
      const users = await axios.get(`${BASE_URL}/api/test/all-users`);
      console.log(`✅ Database query successful`);
      console.log(`Total users: ${users.data.count}`);
      
      if (users.data.count > 0) {
        console.log('\nUsers in database:');
        users.data.users.forEach((user, idx) => {
          console.log(`\n  ${idx + 1}. ${user.name}`);
          console.log(`     Email: ${user.email}`);
          console.log(`     ID: ${user.id}`);
          console.log(`     Admin: ${user.isAdmin}`);
          console.log(`     Created: ${new Date(user.createdAt).toLocaleString()}`);
        });
      } else {
        console.log('\n⚠️  No users in database yet');
        console.log('   Expected: Users should appear when you sign up with Google');
      }
    } catch (err) {
      console.log('❌ Database query failed');
      console.log('   Error:', err.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 DIAGNOSIS COMPLETE');
  console.log('='.repeat(80) + '\n');

  console.log('SUMMARY OF CHECKS:');
  console.log('1. ✓ Server running (npm start)');
  console.log('2. ✓ Inngest dev running (inngest dev)');
  console.log('3. ✓ Webhook URL configured in Clerk (→ http://localhost:8288/api/inngest)');
  console.log('4. ✓ Database connected (Aiven MySQL)');
  console.log('5. ✓ Manual user creation works');
  console.log('6. ✓ Sign up with Google creates webhook event');
  console.log('7. ✓ Webhook event syncs user to database\n');

  console.log('If all checks pass, sign up with Google and you should see:');
  console.log('  - Logs in Terminal 1 (inngest dev)');
  console.log('  - Logs in Terminal 2 (npm start)');
  console.log('  - User appears in "All Users" endpoint\n');
}

runDiagnostics().catch(console.error);
