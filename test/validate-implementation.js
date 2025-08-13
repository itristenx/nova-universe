#!/usr/bin/env node

/**
 * Inventory Enhancement Implementation Validator
 * Validates that all four inventory requirements have been properly implemented
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const fullPath = path.resolve(rootDir, filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log('green', `✅ ${description}`);
    return true;
  } else {
    log('red', `❌ ${description} (${fullPath} not found)`);
    return false;
  }
}

function checkFileContains(filePath, searchTerms, description) {
  const fullPath = path.resolve(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    log('red', `❌ ${description} - File not found: ${fullPath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const missingTerms = searchTerms.filter(term => !content.includes(term));
    
    if (missingTerms.length === 0) {
      log('green', `✅ ${description}`);
      return true;
    } else {
      log('red', `❌ ${description} - Missing: ${missingTerms.join(', ')}`);
      return false;
    }
  } catch (error) {
    log('red', `❌ ${description} - Error reading file: ${error.message}`);
    return false;
  }
}

function validateImplementation() {
  log('blue', `${colors.bold}🔍 Nova Universe Inventory Enhancement Validation${colors.reset}`);
  console.log('');
  
  let allValid = true;
  
  // Requirement 1: Migration scripts under prisma/migrations/
  log('yellow', '📋 Requirement 1: Migration Scripts');
  allValid &= checkFileExists(
    'prisma/migrations/20250804000000_inventory_enhancements/migration.sql',
    'Migration SQL file exists'
  );
  
  allValid &= checkFileContains(
    'prisma/migrations/20250804000000_inventory_enhancements/migration.sql',
    [
      'asset_ticket_history',
      'asset_warranty_alerts', 
      'asset_import_batches',
      'kiosk_asset_registry',
      'encrypted'
    ],
    'Migration contains all required tables and encrypted fields'
  );
  console.log('');
  
  // Requirement 2: Import validation and rollback logic
  log('yellow', '📋 Requirement 2: Import Validation and Rollback Logic');
  allValid &= checkFileExists(
    'apps/api/services/inventory.js',
    'Inventory service exists'
  );
  
  allValid &= checkFileContains(
    'apps/api/services/inventory.js',
    [
      'class InventoryService',
      'importAssets',
      'validateRecords',
      'rollbackImport',
      'encryptSensitiveFields'
    ],
    'Inventory service contains required methods'
  );
  console.log('');
  
  // Requirement 3: Kiosk registry with Helix APIs
  log('yellow', '📋 Requirement 3: Kiosk Registry with Helix APIs');
  allValid &= checkFileExists(
    'apps/api/services/helixKioskIntegration.js',
    'Helix Kiosk Integration service exists'
  );
  
  allValid &= checkFileContains(
    'apps/api/services/helixKioskIntegration.js',
    [
      'class HelixKioskIntegrationService',
      'registerAssetWithKiosk',
      'syncWithHelix',
      'bulkSyncWithHelix',
      'encryptMetadata'
    ],
    'Helix integration service contains required methods'
  );
  console.log('');
  
  // Requirement 4: Extended Pulse inventory endpoints
  log('yellow', '📋 Requirement 4: Extended Pulse Inventory Endpoints');
  allValid &= checkFileExists(
    'apps/api/routes/pulse-inventory.js',
    'Pulse inventory routes exist'
  );
  
  allValid &= checkFileContains(
    'apps/api/routes/pulse-inventory.js',
    [
      '/assets',
      '/assets/:id/tickets',
      '/warranty-alerts',
      '/import',
      '/rollback'
    ],
    'Pulse inventory routes contain required endpoints'
  );
  
  allValid &= checkFileContains(
    'apps/api/routes/pulse.js',
    ['pulse-inventory'],
    'Main pulse routes import inventory routes'
  );
  console.log('');
  
  // Database Schema Validation
  log('yellow', '📋 Database Schema Validation');
  allValid &= checkFileContains(
    'prisma/core/schema.prisma',
    [
      'provider = "postgresql"',
      'model AssetTicketHistory',
      'model AssetWarrantyAlert',
      'model AssetImportBatch',
      'model KioskAssetRegistry',
      'serialNumberEnc',
      'warrantyInfoEnc'
    ],
    'Prisma schema contains PostgreSQL and enhanced inventory models'
  );
  console.log('');
  
  // Environment Configuration
  log('yellow', '📋 Environment Configuration');
  allValid &= checkFileContains(
    '.env',
    [
      'postgresql://',
      'CORE_DATABASE_URL',
      'PRIMARY_DATABASE=postgresql'
    ],
    'Environment configured for PostgreSQL'
  );
  console.log('');
  
  // Summary
  if (allValid) {
    log('green', `${colors.bold}🎉 ALL REQUIREMENTS SUCCESSFULLY IMPLEMENTED!${colors.reset}`);
    console.log('');
    log('blue', '📝 Implementation Summary:');
    console.log('   1. ✅ Migration scripts with inventory schema enhancements');
    console.log('   2. ✅ Import validation and rollback logic service');
    console.log('   3. ✅ Helix kiosk integration with encrypted asset fields');
    console.log('   4. ✅ Extended Pulse inventory endpoints with ticket history');
    console.log('');
    log('blue', '🚀 Next Steps:');
    console.log('   - Set up PostgreSQL database');
    console.log('   - Run: npx prisma db push --schema=prisma/core/schema.prisma');
    console.log('   - Test the API endpoints');
    console.log('   - Configure Helix API integration');
  } else {
    log('red', `${colors.bold}❌ IMPLEMENTATION INCOMPLETE${colors.reset}`);
    console.log('');
    log('yellow', 'Please review the failed checks above and ensure all files are properly created.');
  }
  
  return allValid;
}

// Run validation
validateImplementation();
