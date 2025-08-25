#!/usr/bin/env node
import 'dotenv/config';
import db from '../db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding UAT data...');
  // Ensure roles exist (db initialization covers this, but re-assert minimal)
  await db.query(
    "INSERT INTO roles (id, name) VALUES (1,'superadmin') ON CONFLICT (id) DO NOTHING",
  );
  await db.query("INSERT INTO roles (id, name) VALUES (2,'admin') ON CONFLICT (id) DO NOTHING");
  await db.query("INSERT INTO roles (id, name) VALUES (3,'user') ON CONFLICT (id) DO NOTHING");

  // Generate secure passwords for UAT
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Users with cryptographically secure passwords
  const adminPassword = process.env.UAT_ADMIN_PASSWORD || generateSecurePassword();
  const agentPassword = process.env.UAT_AGENT_PASSWORD || generateSecurePassword();
  const userPassword = process.env.UAT_USER_PASSWORD || generateSecurePassword();

  const users = [
    { name: 'UAT Admin', email: 'uat-admin@novauniverse.com', password: adminPassword, roleId: 1 },
    { name: 'UAT Agent', email: 'uat-agent@novauniverse.com', password: agentPassword, roleId: 2 },
    { name: 'UAT User', email: 'uat-user@novauniverse.com', password: userPassword, roleId: 3 },
  ];

  console.log('\n🔐 Generated UAT Credentials:');
  console.log(`Admin: uat-admin@novauniverse.com / ${adminPassword}`);
  console.log(`Agent: uat-agent@novauniverse.com / ${agentPassword}`);
  console.log(`User: uat-user@novauniverse.com / ${userPassword}`);
  console.log('⚠️  Store these credentials securely!\n');

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    const res = await db.query(
      `INSERT INTO users (name, email, password_hash, disabled, created_at, updated_at)
       VALUES ($1,$2,$3,false,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
       ON CONFLICT (email) DO NOTHING RETURNING id`,
      [u.name, u.email, hash],
    );
    const userId = res.rows?.[0]?.id;
    if (userId) {
      await db.query(
        `INSERT INTO user_roles (user_id, role_id, assigned_at)
         VALUES ($1,$2,CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING`,
        [userId, u.roleId],
      );
    }
  }

  // Minimal config defaults
  await db.query(
    `INSERT INTO config (key, value) VALUES ('organizationName','Nova Universe UAT')
     ON CONFLICT (key) DO NOTHING`,
  );

  console.log('UAT seed complete');
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
