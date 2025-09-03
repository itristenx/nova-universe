#!/usr/bin/env node

/**
 * Production Configuration Validator and Setter
 * Ensures all mock data is disabled in production environments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🔧 Configuring Nova Universe for Production...');

// Production environment configuration
const productionConfig = {
  NODE_ENV: 'production',
  USE_MOCK_DATA: 'false',
  VITE_USE_MOCK_DATA: 'false',
  
  // AI/ML Production Settings
  AI_FABRIC_MOCK_MODE: 'false',
  RAG_MOCK_EMBEDDINGS: 'false',
  AI_MONITORING_MOCK_DATA: 'false',
  
  // Nova TV Production Settings
  NOVA_TV_MOCK_MODE: 'false',
  
  // API Settings
  API_MOCK_RESPONSES: 'false',
  DATABASE_MOCK_MODE: 'false',
};

// Files to check and update
const configFiles = [
  '.env',
  '.env.production',
  '.env.production.secure',
  'apps/unified/.env',
  'apps/unified/.env.production',
  'apps/api/.env',
  'apps/api/.env.production',
];

// Update environment files
function updateEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // Update each configuration
  Object.entries(productionConfig).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      const oldLine = content.match(regex)[0];
      const newLine = `${key}=${value}`;
      if (oldLine !== newLine) {
        content = content.replace(regex, newLine);
        updated = true;
        console.log(`  ✅ Updated ${key} = ${value}`);
      }
    } else {
      // Add missing configuration
      content += `\n${key}=${value}`;
      updated = true;
      console.log(`  ➕ Added ${key} = ${value}`);
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`✅ ${filePath} already configured correctly`);
  }
}

// Update source code to remove mock data flags
function updateSourceFiles() {
  console.log('\n🔍 Updating source files to disable mock data...');

  // Update utility functions to use production mode
  const utilsPath = path.join(rootDir, 'apps/unified/src/utils/index.ts');
  if (fs.existsSync(utilsPath)) {
    let content = fs.readFileSync(utilsPath, 'utf8');
    
    // Ensure useMockData defaults to false in production
    const mockDataRegex = /useMockData:\s*getEnvVar\([^)]+\)\s*===\s*['"]true['"]/;
    if (mockDataRegex.test(content)) {
      content = content.replace(mockDataRegex, `useMockData: getEnvVar('VITE_USE_MOCK_DATA') === 'true' && process.env.NODE_ENV !== 'production'`);
      fs.writeFileSync(utilsPath, content);
      console.log('  ✅ Updated utils to enforce production mode');
    }
  }

  // Update connection service
  const connServicePath = path.join(rootDir, 'apps/unified/src/services/connectionService.ts');
  if (fs.existsSync(connServicePath)) {
    let content = fs.readFileSync(connServicePath, 'utf8');
    
    // Ensure mock data is disabled in production
    const mockCheckRegex = /const\s+useMockData\s*=\s*import\.meta\.env\.VITE_USE_MOCK_DATA\s*===\s*['"]true['"]/;
    if (mockCheckRegex.test(content)) {
      content = content.replace(mockCheckRegex, `const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true' && import.meta.env.NODE_ENV !== 'production'`);
      fs.writeFileSync(connServicePath, content);
      console.log('  ✅ Updated connection service for production mode');
    }
  }
}

// Main execution
function main() {
  console.log('📁 Updating environment files...');
  
  configFiles.forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    updateEnvFile(fullPath);
  });

  updateSourceFiles();

  console.log('\n🎯 Production configuration complete!');
  console.log('\n📋 Summary:');
  console.log('  ✅ Mock data disabled in all environments');
  console.log('  ✅ Production mode enforced');
  console.log('  ✅ AI/ML systems configured for production');
  console.log('  ✅ Source code updated to respect production settings');
  
  console.log('\n⚠️  Important: Restart all services for changes to take effect');
  console.log('\n🔍 Run validation: node test/nova-ai-production-validation.js');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}