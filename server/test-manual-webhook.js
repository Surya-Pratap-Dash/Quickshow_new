#!/usr/bin/env node

/**
 * MANUAL WEBHOOK TEST
 * Send a fake Clerk webhook to see if it's processed by Inngest
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function sendFakeClerkWebhook() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 MANUAL CLERK WEBHOOK TEST');
  console.log('='.repeat(80) + '\n');

  // Simulate a Clerk user.created webhook
  const clerkWebhook = {
    data: {
      id: `user_test_${Date.now()}`,
      first_name: 'Test',
      last_name: 'User',
      email_addresses: [
        {
          email_address: `test-${Date.now()}@example.com`,
          id: `email_${Date.now()}`
        }
      ],
      image_url: null,
      password_enabled: false,
      primary_email_address_id: `email_${Date.now()}`,
      primary_phone_number_id: null,
      primary_web3_wallet_id: null,
      profile_image_url: null,
      public_metadata: {},
      unsafe_metadata: {},
      username: null,
      mfa_enabled: false,
      verification_metadata: [],
      created_at: Date.now(),
      updated_at: Date.now(),
      deleted_at: null
    },
    object: 'event',
    type: 'user.created',
    timestamp: Date.now()
  };

  try {
    console.log('📤 Sending fake Clerk webhook to Inngest endpoint...');
    console.log(`   Endpoint: POST /api/inngest`);
    console.log(`   User ID: ${clerkWebhook.data.id}`);
    console.log(`   Email: ${clerkWebhook.data.email_addresses[0].email_address}`);
    console.log(`   Name: ${clerkWebhook.data.first_name} ${clerkWebhook.data.last_name}\n`);

    const response = await axios.post(`${BASE_URL}/api/inngest`, clerkWebhook, {
      headers: {
        'Content-Type': 'application/json',
        'svix-id': `msg_${Date.now()}`,
        'svix-timestamp': Date.now().toString(),
        'svix-signature': 'test_signature'
      }
    });

    console.log('✅ Webhook sent successfully!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);

    // Wait a bit for processing
    await new Promise(r => setTimeout(r, 2000));

    // Check if user was created
    console.log('📊 Checking if user was created in database...\n');
    try {
      const users = await axios.get(`${BASE_URL}/api/test/all-users`);
      console.log(`✅ Total users in database: ${users.data.count}`);
      
      // Find our test user
      const testUser = users.data.users.find(u => u.id === clerkWebhook.data.id);
      if (testUser) {
        console.log('✅ TEST USER FOUND IN DATABASE!');
        console.log(`   ID: ${testUser.id}`);
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Name: ${testUser.name}`);
        console.log(`   Created: ${new Date(testUser.createdAt).toLocaleString()}`);
        console.log('\n🎉 SUCCESS! Webhook processing works!\n');
      } else {
        console.log('❌ Test user NOT found in database');
        console.log('   This means the webhook was NOT processed by Inngest functions');
        console.log('\nPossible reasons:');
        console.log('  1. Inngest functions are not being registered');
        console.log('  2. Inngest dev is not connected to Express server');
        console.log('  3. The webhook event type is not matching the function trigger\n');
      }
    } catch (err) {
      console.log('❌ Failed to check database');
      console.log(`   Error: ${err.message}\n`);
    }

  } catch (error) {
    console.log('❌ Failed to send webhook');
    console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
    if (error.response?.data) {
      console.log('   Response:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('='.repeat(80) + '\n');
}

sendFakeClerkWebhook().catch(console.error);
