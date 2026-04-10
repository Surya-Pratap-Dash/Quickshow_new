#!/usr/bin/env node

/**
 * ADD ADMIN USER
 * Create a new admin user in the database
 */

import { sequelize } from "./config/db.js";
import User from "./models/User.js";

async function addAdminUser() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('👑 ADDING ADMIN USER');
    console.log('='.repeat(80) + '\n');

    const email = 'suryadashpratap.dash008@gmail.com';
    const adminId = `admin_${Date.now()}`;

    console.log(`📧 Email: ${email}`);
    console.log(`👤 User ID: ${adminId}`);
    console.log(`🔐 Role: ADMIN`);
    console.log('\n⏳ Connecting to database...\n');

    // Authenticate database
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Admin: ${existingUser.isAdmin}`);
      
      if (!existingUser.isAdmin) {
        console.log('\n🔄 Upgrading to admin...');
        existingUser.isAdmin = true;
        await existingUser.save();
        console.log('✅ User upgraded to admin!\n');
      } else {
        console.log('   Already an admin!\n');
      }
      return;
    }

    // Create new admin user
    console.log('✅ User does not exist, creating new admin user...\n');

    const adminUser = await User.create({
      id: adminId,
      email: email,
      name: 'Admin User',
      image: null,
      isAdmin: true
    });

    console.log('✅ ADMIN USER CREATED SUCCESSFULLY!\n');
    console.log('User Details:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Admin: ${adminUser.isAdmin}`);
    console.log(`   Created: ${adminUser.createdAt.toLocaleString()}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ Admin user added successfully!');
    console.log('='.repeat(80) + '\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR creating admin user:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.original) {
      console.error(`   Details: ${error.original.message}`);
    }
    console.error('\n' + '='.repeat(80) + '\n');
    process.exit(1);
  }
}

addAdminUser();
