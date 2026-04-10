#!/usr/bin/env node

/**
 * WEBHOOK HISTORY & SIGNUP TRACKING
 * View all webhook events received and recently created users
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function showWebhookHistory() {
  console.log('\n' + '='.repeat(100));
  console.log('📊 WEBHOOK HISTORY & USER SIGNUPS');
  console.log('='.repeat(100) + '\n');

  try {
    // Get webhook history and recent users
    const response = await axios.get(`${BASE_URL}/api/debug/webhook-history`);
    const { webhookHistory, recentlyCreatedUsers, totalWebhooksReceived } = response.data;

    console.log(`📨 WEBHOOKS RECEIVED: ${totalWebhooksReceived}`);
    console.log('-'.repeat(100));
    
    if (webhookHistory.length === 0) {
      console.log('❌ No webhooks received yet');
    } else {
      console.log('\nRecent Webhooks:\n');
      webhookHistory.slice(-10).reverse().forEach((webhook, idx) => {
        console.log(`${idx + 1}. ${webhook.timestamp}`);
        console.log(`   Event Type: ${webhook.type}`);
        console.log(`   User: ${webhook.firstName} ${webhook.lastName || ''} (${webhook.email})`);
        console.log(`   User ID: ${webhook.userId}`);
        console.log(`   Status: ${webhook.status}`);
        console.log(`   Inngest Event ID: ${webhook.inngestEventId || 'pending'}`);
        console.log();
      });
    }

    console.log('\n👥 RECENTLY CREATED USERS: ' + recentlyCreatedUsers.length);
    console.log('-'.repeat(100));
    
    if (recentlyCreatedUsers.length === 0) {
      console.log('❌ No users created yet');
    } else {
      recentlyCreatedUsers.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
        console.log();
      });
    }

  } catch (error) {
    console.log('❌ Error fetching webhook history:', error.message);
  }

  // Show recent signups in last 5 minutes
  try {
    const recentResponse = await axios.get(`${BASE_URL}/api/debug/recent-signups?minutes=5`);
    const { recentSignups, totalFound } = recentResponse.data;

    console.log('\n🚀 SIGNUPS IN LAST 5 MINUTES: ' + totalFound);
    console.log('-'.repeat(100));
    
    if (totalFound === 0) {
      console.log('❌ No signups in last 5 minutes');
    } else {
      recentSignups.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.name} (${user.email})`);
        console.log(`   Signed up: ${user.signupTime}`);
        console.log();
      });
    }
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Show server status
  try {
    const statusResponse = await axios.get(`${BASE_URL}/api/debug/status`);
    const { webhooks, database, services } = statusResponse.data;

    console.log('\n📡 SERVER STATUS');
    console.log('-'.repeat(100));
    console.log(`Express Server: ${services.express ? '✅ Running' : '❌ Down'}`);
    console.log(`Database: ${services.database ? '✅ Connected' : '❌ Down'}`);
    console.log(`Inngest: ${services.inngest ? '✅ Connected' : '❌ Down'}`);
    console.log(`Total Users: ${database.totalUsers}`);
    console.log(`Webhooks Received: ${webhooks.totalReceived}`);
    
    if (webhooks.lastWebhook) {
      console.log(`\nLast Webhook:`);
      console.log(`  Type: ${webhooks.lastWebhook.type}`);
      console.log(`  Email: ${webhooks.lastWebhook.email}`);
      console.log(`  Time: ${webhooks.lastWebhook.timestamp}`);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n' + '='.repeat(100));
  console.log('✅ Monitoring Complete');
  console.log('='.repeat(100) + '\n');
}

// Auto-refresh every 10 seconds if argument provided
const autoRefresh = process.argv[2] === '--watch';

showWebhookHistory().then(() => {
  if (autoRefresh) {
    console.log('🔄 Auto-refreshing every 10 seconds (Ctrl+C to stop)...\n');
    setInterval(() => {
      console.clear();
      showWebhookHistory();
    }, 10000);
  }
}).catch(console.error);
