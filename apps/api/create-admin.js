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

Creates or updates an admin user in the Nova Universe database.

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
    // Upsert by email (no is_default column in minimal schema)
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows && existing.rows.length > 0) {
      await db.query('UPDATE users SET "password_hash" = $1, name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [passwordHash, name, existing.rows[0].id]);
      console.log(`✅ Updated existing user: ${email}`);
    } else {
      const userId = uuidv4();
      const now = new Date().toISOString();
      await db.query(
        'INSERT INTO users (uuid, name, email, "password_hash", disabled, created_at, updated_at) VALUES ($1, $2, $3, $4, FALSE, $5, $6)',
        [userId, name, email, passwordHash, now, now],
      );
      console.log(`✅ Created user: ${email}`);
    }
    // Role assignment optional — skip if roles schema not present
    try { await assignAdminRole(); } catch (e) { console.warn('Skipping role assignment:', e.message); }
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
      id = res.rows[0].id; // This will be the integer ID
    }
    await db.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, 1) ON CONFLICT DO NOTHING',
      [id],
    );
    console.log('✅ Admin role assigned');
    console.log(`🔑 Login credentials: ${email} / ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error assigning admin role:', err);
    process.exit(1);
  }
}
