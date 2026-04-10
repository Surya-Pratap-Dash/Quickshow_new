#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function test() {
  console.log('Testing server endpoints...\n');

  try {
    console.log('1. Testing root endpoint...');
    const root = await axios.get(`${BASE_URL}`);
    console.log(`   ✓ Server responds: ${root.data}\n`);
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
    return;
  }

  try {
    console.log('2. Testing /api/diagnose/inngest-status...');
    const inngest = await axios.get(`${BASE_URL}/api/diagnose/inngest-status`);
    console.log(`   ✓ Response: ${inngest.data.message}\n`);
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}\n`);
  }

  try {
    console.log('3. Testing /api/webhooks/clerk (POST)...');
    const webhook = await axios.post(`${BASE_URL}/api/webhooks/clerk`, {
      type: 'user.created',
      data: {
        id: 'user_test_123',
        first_name: 'Test',
        last_name: 'User',
        email_addresses: [{ email_address: 'test@example.com' }]
      }
    });
    console.log(`   ✓ Response: ${webhook.data.message}\n`);
  } catch (err) {
    console.log(`   ✗ Error: ${err.message}`);
    if (err.response?.status === 404) {
      console.log(`       Endpoint not found! Checking server routes...\n`);
    }
  }
}

test();
