#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEnv(name, fallback) {
  return process.env[name] || fallback;
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: node apply-sql.js <file1.sql> <file2.sql> ...');
    process.exit(1);
  }

  const host = getEnv('CORE_DB_HOST', getEnv('POSTGRES_HOST', getEnv('PGHOST', 'localhost')));
  const port = Number(getEnv('CORE_DB_PORT', getEnv('POSTGRES_PORT', getEnv('PGPORT', '5432'))));
  const database = getEnv('CORE_DB_NAME', getEnv('POSTGRES_DB', getEnv('PGDATABASE', 'nova_universe')));
  const user = getEnv('CORE_DB_USER', getEnv('POSTGRES_USER', getEnv('PGUSER', 'nova_admin')));
  const password = getEnv('CORE_DB_PASSWORD', getEnv('POSTGRES_PASSWORD', getEnv('PGPASSWORD', 'nova_password')));

  const pool = new Pool({ host, port, database, user, password, ssl: false });

  console.log(`Connecting to postgres://${user}@${host}:${port}/${database} ...`);
  const client = await pool.connect().catch((err) => {
    console.error('Failed to connect to Postgres:', err.message);
    console.error('Ensure Postgres is running and credentials are correct.');
    process.exit(2);
  });

  try {
    for (const filePath of files) {
      const abs = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
      console.log(`\n>>> Applying ${abs}`);
      const sql = fs.readFileSync(abs, 'utf8');
      // Run in a transaction per file
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`✓ Applied ${abs}`);
    }
    console.log('\nAll SQL files applied successfully.');
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('Migration failed:', err.message);
    process.exit(3);
  } finally {
    client.release();
    await pool.end();
  }
}

main();