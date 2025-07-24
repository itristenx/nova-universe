// scripts/migrate.js
// Minimal SQLite migration runner for Nova Universe API

import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../nova-api/database.sqlite');
const migrationsDir = path.resolve(__dirname, '../nova-api/migrations');

const db = new sqlite3.Database(dbPath);

function runMigrations() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS migrations (filename TEXT PRIMARY KEY, applied_at TEXT)`);
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    files.forEach(file => {
      db.get('SELECT 1 FROM migrations WHERE filename = ?', [file], (err, row) => {
        if (err) throw err;
        if (!row) {
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          db.exec(sql, (err2) => {
            if (err2) throw err2;
            db.run('INSERT INTO migrations (filename, applied_at) VALUES (?, ?)', [file, new Date().toISOString()]);
            console.log(`Applied migration: ${file}`);
          });
        } else {
          console.log(`Already applied: ${file}`);
        }
      });
    });
  });
}

runMigrations();
