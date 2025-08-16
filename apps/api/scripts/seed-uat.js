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

  // Users
  const users = [
    { name: 'UAT Admin', email: 'uat-admin@novauniverse.com', password: 'Admin123!', roleId: 1 },
    { name: 'UAT Agent', email: 'uat-agent@novauniverse.com', password: 'Agent123!', roleId: 2 },
    { name: 'UAT User', email: 'uat-user@novauniverse.com', password: 'User123!', roleId: 3 },
  ];

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
        `INSERT INTO user_roles (user_id, role_id, created_at)
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
