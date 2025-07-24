// scripts/cleanup-migrations.js
// Removes empty/obsolete migration files from nova-api/migrations

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '../nova-api/migrations');

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

files.forEach(file => {
  const fullPath = path.join(migrationsDir, file);
  const content = fs.readFileSync(fullPath, 'utf8').trim();
  if (!content || content.length < 10) {
    fs.unlinkSync(fullPath);
    console.log(`Deleted empty migration: ${file}`);
  }
});
