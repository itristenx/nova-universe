#!/usr/bin/env node

/**
 * Nova Universe Base URL Configuration Validator
 *
 * This script validates that all base URLs are properly configured
 * as environment variables and tests the fallback chains.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file if it exists
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    });
  }
} catch {
  console.log('No .env file found, using existing environment variables');
}

console.log('🔍 Nova Universe Base URL Configuration Validator\n');

// Define expected environment variables and their fallbacks
const urlConfigs = {
  'Email Templates': {
    primary: 'WEB_BASE_URL',
    fallbacks: ['BASE_URL', 'PUBLIC_URL'],
    defaultValue: 'http://localhost:3000',
    testFunction: () => {
      return (
        process.env.WEB_BASE_URL ||
        process.env.BASE_URL ||
        process.env.PUBLIC_URL ||
        'http://localhost:3000'
      );
    },
  },
  'Email Delays': {
    primary: 'PORTAL_BASE_URL',
    fallbacks: ['WEB_BASE_URL', 'BASE_URL'],
    defaultValue: 'http://localhost:3000',
    testFunction: () => {
      return (
        process.env.PORTAL_BASE_URL ||
        process.env.WEB_BASE_URL ||
        process.env.BASE_URL ||
        'http://localhost:3000'
      );
    },
  },
  'API Documentation': {
    primary: 'API_BASE_URL',
    fallbacks: ['BASE_URL'],
    defaultValue: 'http://localhost:3000',
    testFunction: () => {
      const PORT = Number(process.env.API_PORT || process.env.PORT || 3000);
      return process.env.NODE_ENV === 'production'
        ? process.env.API_BASE_URL || process.env.BASE_URL || 'https://api.nova-universe.com'
        : process.env.API_BASE_URL || process.env.BASE_URL || `http://localhost:${PORT}`;
    },
  },
  'SSO Callbacks': {
    primary: 'API_BASE_URL',
    fallbacks: ['BASE_URL', 'PUBLIC_URL'],
    defaultValue: 'http://localhost:3000',
    testFunction: () => {
      return (
        process.env.API_BASE_URL ||
        process.env.BASE_URL ||
        process.env.PUBLIC_URL ||
        'http://localhost:3000'
      );
    },
  },
  'Frontend API': {
    primary: 'VITE_API_URL',
    fallbacks: ['VITE_API_BASE_URL'],
    defaultValue: 'http://localhost:3001',
    testFunction: () => {
      return process.env.VITE_API_URL || process.env.VITE_API_BASE_URL || 'http://localhost:3001';
    },
  },
};

// Validate each configuration
let allValid = true;
const results = {};

console.log('📋 Configuration Results:\n');

Object.entries(urlConfigs).forEach(([name, config]) => {
  const resolvedUrl = config.testFunction();
  const primarySet = Boolean(process.env[config.primary]);
  const fallbacksSet = config.fallbacks.filter((fb) => Boolean(process.env[fb]));

  results[name] = {
    resolvedUrl,
    primarySet,
    fallbacksSet,
    usingDefault: resolvedUrl === config.defaultValue,
  };

  const status = resolvedUrl !== config.defaultValue ? '✅' : '⚠️';
  console.log(`${status} ${name}:`);
  console.log(`   Resolved URL: ${resolvedUrl}`);
  console.log(`   Primary (${config.primary}): ${primarySet ? '✅ Set' : '❌ Not Set'}`);

  if (fallbacksSet.length > 0) {
    console.log(`   Fallbacks: ${fallbacksSet.join(', ')} ✅`);
  } else {
    console.log(`   Fallbacks: ${config.fallbacks.join(', ')} ❌ None Set`);
  }

  if (results[name].usingDefault) {
    console.log(`   📝 Using default value - consider setting environment variables`);
    allValid = false;
  }

  console.log('');
});

// Summary
console.log('📊 Summary:\n');

const configuredServices = Object.values(results).filter((r) => !r.usingDefault).length;
const totalServices = Object.keys(results).length;

console.log(`✅ Configured Services: ${configuredServices}/${totalServices}`);
console.log(`⚠️  Using Defaults: ${totalServices - configuredServices}/${totalServices}`);

if (allValid) {
  console.log('\n🎉 All base URLs are properly configured!');
} else {
  console.log('\n📝 Recommendations:');
  console.log('   1. Set BASE_URL for your main domain');
  console.log('   2. Set API_BASE_URL if using separate API domain');
  console.log('   3. Set WEB_BASE_URL for customer-facing interfaces');
  console.log('   4. Set PORTAL_BASE_URL for customer portal');
  console.log('   5. Configure VITE_* variables for frontend builds');
}

// Check for required environment variables
console.log('\n🔧 Environment Variable Status:\n');

const requiredVars = ['BASE_URL', 'PUBLIC_URL', 'API_URL', 'WEB_BASE_URL', 'PORTAL_BASE_URL'];

const optionalVars = [
  'API_BASE_URL',
  'VITE_API_URL',
  'VITE_API_BASE_URL',
  'VITE_BASE_URL',
  'VITE_WS_URL',
];

requiredVars.forEach((varName) => {
  const isSet = Boolean(process.env[varName]);
  console.log(`${isSet ? '✅' : '❌'} ${varName}: ${isSet ? process.env[varName] : 'Not Set'}`);
});

console.log('\nOptional (but recommended):');
optionalVars.forEach((varName) => {
  const isSet = Boolean(process.env[varName]);
  console.log(`${isSet ? '✅' : '⚪'} ${varName}: ${isSet ? process.env[varName] : 'Not Set'}`);
});

process.exit(allValid ? 0 : 1);
