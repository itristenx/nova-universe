#!/usr/bin/env node

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import db from './db.js';

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

// First, try to update existing user
db.run(
  'UPDATE users SET name = ?, passwordHash = ? WHERE email = ?',
  [name, passwordHash, email],
  function(err) {
    if (err) {
      console.error('Error updating user:', err);
      process.exit(1);
    }
    
    if (this.changes > 0) {
      console.log(`✅ Updated existing user: ${email}`);
      assignAdminRole();
    } else {
      // User doesn't exist, create new one
      db.run(
        'INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)',
        [name, email, passwordHash],
        function(err) {
          if (err) {
            console.error('Error creating user:', err);
            process.exit(1);
          }
          console.log(`✅ Created new admin user: ${email}`);
          assignAdminRole(this.lastID);
        }
      );
    }
  }
);

function assignAdminRole(userId = null) {
  if (userId) {
    // New user, assign role directly
    db.run(
      'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, 1)',
      [userId],
      (err) => {
        if (err) {
          console.error('Error assigning admin role:', err);
        } else {
          console.log('✅ Admin role assigned');
        }
        console.log(`🔑 Login credentials: ${email} / ${password}`);
        process.exit(0);
      }
    );
  } else {
    // Existing user, get their ID first
    db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
      if (err) {
        console.error('Error finding user:', err);
        process.exit(1);
      }
      if (row) {
        db.run(
          'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, 1)',
          [row.id],
          (err) => {
            if (err) {
              console.error('Error assigning admin role:', err);
            } else {
              console.log('✅ Admin role verified');
            }
            console.log(`🔑 Login credentials: ${email} / ${password}`);
            process.exit(0);
          }
        );
      }
    });
  }
}
