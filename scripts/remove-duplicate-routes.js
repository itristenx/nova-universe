#!/usr/bin/env node

/**
 * Script to remove unused duplicate route files
 * Based on API inventory audit findings
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES_DIR = path.join(__dirname, '../apps/api/routes');

// Files identified as unused duplicates from the audit
const UNUSED_DUPLICATE_FILES = [
  'app-switcher-enhanced.js',
  'app-switcher-old.js',
  'customer-activity-clean.js',
];

// Files to check but not remove (may be used elsewhere)
const FILES_TO_REVIEW = [
  'nova-tv.js', // Check if nova-tv-prisma.js replaced this
];

console.log('🔍 Checking for unused duplicate route files...\n');

let removedCount = 0;
let skippedCount = 0;

// Remove unused duplicates
for (const file of UNUSED_DUPLICATE_FILES) {
  const filePath = path.join(ROUTES_DIR, file);
  
  if (fs.existsSync(filePath)) {
    try {
      // Create a backup first
      const backupPath = filePath + '.backup';
      fs.copyFileSync(filePath, backupPath);
      console.log(`  📦 Created backup: ${file}.backup`);
      
      // Remove the file
      fs.unlinkSync(filePath);
      console.log(`  ✅ Removed: ${file}`);
      removedCount++;
    } catch (error) {
      console.error(`  ❌ Error removing ${file}:`, error.message);
      skippedCount++;
    }
  } else {
    console.log(`  ⏭️  Already removed or not found: ${file}`);
    skippedCount++;
  }
}

console.log('\n📋 Files marked for manual review:\n');

for (const file of FILES_TO_REVIEW) {
  const filePath = path.join(ROUTES_DIR, file);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lineCount = content.split('\n').length;
    
    console.log(`  ⚠️  ${file}:`);
    console.log(`     Lines: ${lineCount}`);
    console.log(`     Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`     Last modified: ${stats.mtime.toISOString()}`);
  }
}

console.log('\n📊 Summary:');
console.log(`  Removed: ${removedCount} files`);
console.log(`  Skipped: ${skippedCount} files`);
console.log(`  For review: ${FILES_TO_REVIEW.length} files`);

console.log('\n✅ Cleanup complete!');
console.log('\n💡 Next steps:');
console.log('  1. Review files marked for manual review');
console.log('  2. Run tests to ensure nothing broke');
console.log('  3. Commit changes if tests pass');
console.log('  4. Backups are in routes/*.backup if rollback needed');
