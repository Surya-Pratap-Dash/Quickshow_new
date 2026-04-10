#!/usr/bin/env node

/**
 * TEST CLERK WEBHOOK HANDLER
 * Send a fake Clerk webhook to the new handler endpoint
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testClerkWebhookHandler() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST CLERK WEBHOOK HANDLER');
  console.log('='.repeat(80) + '\n');

  // Simulate a Clerk user.created webhook
  const clerkWebhook = {
    data: {
      id: `user_test_${Date.now()}`,
      first_name: 'TestUser',
      last_name: 'SignUp',
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
    console.log('📤 Sending Clerk webhook to handler...');
    console.log(`   Endpoint: POST /api/webhooks/clerk`);
    console.log(`   User ID: ${clerkWebhook.data.id}`);
    console.log(`   Email: ${clerkWebhook.data.email_addresses[0].email_address}`);
    console.log(`   Name: ${clerkWebhook.data.first_name} ${clerkWebhook.data.last_name}\n`);

    const response = await axios.post(`${BASE_URL}/api/webhooks/clerk`, clerkWebhook);

    console.log('✅ Webhook handler responded!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Message: ${response.data.message}`);
    console.log(`   Inngest Event: ${response.data.inngestEvent}\n`);

    // Wait for processing
    console.log('⏳ Waiting for Inngest processing (2 seconds)...\n');
    await new Promise(r => setTimeout(r, 2000));

    // Check if user was created
    console.log('📊 Verifying user creation in database...\n');
    try {
      const users = await axios.get(`${BASE_URL}/api/test/all-users`);
      console.log(`✅ Database query successful`);
      console.log(`   Total users: ${users.data.count}`);
      
      // Find our test user
      const testUser = users.data.users.find(u => u.id === clerkWebhook.data.id);
      if (testUser) {
        console.log('\n🎉 SUCCESS! User was created in database!');
        console.log(`   ID: ${testUser.id}`);
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Name: ${testUser.name}`);
        console.log(`   Created: ${new Date(testUser.createdAt).toLocaleString()}`);
        console.log('\n✅ Clerk webhook → Inngest → Database sync is WORKING!\n');
      } else {
        console.log('❌ User NOT found in database!');
        console.log('   The webhook was sent but the function did not execute');
        console.log('   Check the inngest dev terminal for errors\n');
      }
    } catch (err) {
      console.log('❌ Failed to query database');
      console.log(`   Error: ${err.message}\n`);
    }

  } catch (error) {
    console.log('❌ Webhook handler call failed');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error || error.message}\n`);
    if (error.response?.data) {
      console.log('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('='.repeat(80) + '\n');
  console.log('📝 To enable this handler in Clerk:');
  console.log('   1. Go to https://dashboard.clerk.com');
  console.log('   2. Click on "Webhooks" in left sidebar');
  console.log('   3. Create or edit a webhook endpoint');
  console.log('   4. Set endpoint URL to: http://localhost:8290/api/webhooks/clerk');
  console.log('   5. Select events: user.created, user.updated, user.deleted');
  console.log('   6. Save and test\n');
}

testClerkWebhookHandler().catch(console.error);
