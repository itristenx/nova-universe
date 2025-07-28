#!/usr/bin/env node

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const email = process.argv[2] || process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin';
const name = process.argv[4] || process.env.ADMIN_NAME || 'Admin';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node create-admin.js [email] [password] [name]

Creates or updates an admin user in the CueIT database.

Arguments:
  email     Email address (default: admin@example.com)
  password  Password (default: admin)
  name      Display name (default: Admin)

Examples:
  node create-admin.js
  node create-admin.js admin@company.com mypassword "System Admin"
  
Environment variables:
  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME can also be used as defaults.
`);
  process.exit(0);
}

console.log(`Creating/updating admin user: ${email}`);

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Invalid email format');
  process.exit(1);
}

// Validate password strength
if (password.length < 6) {
  console.error('❌ Password must be at least 6 characters long');
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(password, 12); // Increase salt rounds for better security

(async () => {
  try {
    // Try to update existing admin (isDefault = true)
    const updateRes = await db.query(
      'UPDATE users SET "passwordHash" = $1 WHERE email = $2 AND "isDefault" = true',
      [passwordHash, email]
    );
    if (updateRes.rowCount > 0) {
      console.log(`✅ Updated existing admin user: ${email}`);
      await assignAdminRole();
      return;
    }
    // If not found, insert new admin
    const userId = uuidv4();
    const now = new Date().toISOString();
    await db.query(
      'INSERT INTO users (id, name, email, "passwordHash", "isDefault", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, true, $5, $6)',
      [userId, name, email, passwordHash, now, now]
    );
    console.log(`✅ Created new admin user: ${email}`);
    await assignAdminRole(userId);
  } catch (err) {
    console.error('❌ Error creating/updating admin user:', err);
    process.exit(1);
  }
})();

async function assignAdminRole(userId = null) {
  try {
    let id = userId;
    if (!id) {
      const res = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (!res.rows.length) throw new Error('User not found');
      id = res.rows[0].id;
    }
    await db.query('INSERT INTO user_roles ("userId", "roleId") VALUES ($1, 1) ON CONFLICT DO NOTHING', [id]);
    console.log('✅ Admin role assigned');
    console.log(`🔑 Login credentials: ${email} / ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error assigning admin role:', err);
    process.exit(1);
  }
}
