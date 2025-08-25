#!/usr/bin/env node

import db from './db.js';
import bcrypt from 'bcryptjs';

async function checkAdminPassword() {
  try {
    console.log('🔍 Checking admin user password...\n');

    // Get admin user details
    const userResult = await db.query(
      `
      SELECT id, name, email, password_hash, "is_default", "tenant_id" 
      FROM users 
      WHERE email = $1
    `,
      ['admin@example.com'],
    );

    if (userResult.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }

    const adminUser = userResult.rows[0];
    console.log('Admin user found:');
    console.log('  ID:', adminUser.id);
    console.log('  Name:', adminUser.name);
    console.log('  Email:', adminUser.email);
    console.log('  Is Default:', adminUser.is_default);
    console.log('  Tenant ID:', adminUser.tenant_id);
    console.log(
      '  Password Hash:',
      adminUser.password_hash ? `${adminUser.password_hash.substring(0, 20)}...` : 'NULL',
    );

    if (!adminUser.password_hash) {
      console.log('\n❌ Admin user has no password hash!');
      console.log('This is why login is failing.');
      return;
    }

    // Test password verification with correct password
    console.log('\n🧪 Testing password verification...');
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, adminUser.password_hash);

    if (isValid) {
      console.log('✅ Password "admin123" is valid!');
    } else {
      console.log('❌ Password "admin123" is NOT valid');
      console.log('The password hash might be incorrect or corrupted.');
    }

    // Also test the old password to confirm it's not working
    const oldPasswordValid = await bcrypt.compare('admin', adminUser.password_hash);
    console.log(
      'Old password "admin" verification:',
      oldPasswordValid ? '✅ Valid' : '❌ Invalid (expected)',
    );

    // Check if we can create a new hash
    console.log('\n🔐 Testing hash creation...');
    const newHash = bcrypt.hashSync(testPassword, 12);
    console.log('New hash created:', newHash.substring(0, 20) + '...');

    // Verify the new hash
    const newHashValid = await bcrypt.compare(testPassword, newHash);
    console.log('New hash verification:', newHashValid ? '✅ Valid' : '❌ Invalid');
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    process.exit(0);
  }
}

checkAdminPassword();
