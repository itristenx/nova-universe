#!/usr/bin/env node

/**
 * Configuration Analysis Script
 * Analyzes .env.example to categorize variables for UI configuration vs environment-only
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Analyzing Configuration Variables for UI Management\n');

// Read the .env.example file
const envPath = '/Users/tneibarger/nova-universe/.env.example';
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const variables = [];
const lines = envContent.split('\n');

for (const line of lines) {
  if (line.trim() && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    variables.push({ key: key.trim(), value: value.trim() });
  }
}

console.log(`📊 Total Variables Found: ${variables.length}\n`);

// Categorize variables
const categories = {
  UI_CONFIGURABLE: {
    description: 'Settings that should be configurable via admin UI',
    variables: [],
  },
  ENVIRONMENT_ONLY: {
    description: 'Sensitive/system settings that must remain as environment variables',
    variables: [],
  },
  FEATURE_FLAGS: {
    description: 'Feature toggles that could be UI configurable',
    variables: [],
  },
  HYBRID: {
    description: 'Could be either UI or environment depending on security requirements',
    variables: [],
  },
};

// UI Configurable patterns (safe for admin UI)
const uiConfigurablePatterns = [
  /^ORGANIZATION_/,
  /^LOGO_/,
  /^FAVICON_/,
  /^PRIMARY_COLOR/,
  /^SECONDARY_COLOR/,
  /^WELCOME_/,
  /^HELP_/,
  /^STATUS_.*_MSG/,
  /^COMPANY_/,
  /^FROM_NAME/,
  /^SUPPORT_EMAIL/,
  /^EMAIL_TRACKING_/,
  /^MIN_PIN_/,
  /^MAX_PIN_/,
  /^RATE_LIMIT_/,
  /^BACKUP_RETENTION_/,
  /^HEALTH_CHECK_/,
  /^LOG_LEVEL/,
  /^UPLOAD_MAX_/,
  /^UPLOAD_ALLOWED_/,
];

// Environment only patterns (sensitive/system)
const environmentOnlyPatterns = [
  /PASSWORD/,
  /SECRET/,
  /KEY/,
  /TOKEN/,
  /API_KEY/,
  /CLIENT_SECRET/,
  /DATABASE_URL/,
  /DB_PASSWORD/,
  /^POSTGRES_PASSWORD/,
  /^MONGO_PASSWORD/,
  /^REDIS_PASSWORD/,
  /^JWT_SECRET/,
  /^SESSION_SECRET/,
  /^SMTP_PASS/,
  /^ASSET_ENCRYPTION_KEY/,
  /SSL_CERT/,
  /SSL_KEY/,
  /^AWS_SECRET_/,
  /^AWS_ACCESS_KEY/,
];

// Feature flag patterns
const featureFlagPatterns = [
  /_ENABLED$/,
  /^ENABLE_/,
  /^DEBUG/,
  /^CLI_MODE/,
  /^TEST_/,
  /^CLUSTER_/,
  /^LOCAL_AI_/,
  /^AI_.*_ENABLED/,
  /^ML_.*_ENABLED/,
  /^COSMO_.*_ENABLED/,
  /^EMAIL_.*_ENABLED/,
];

// Categorize each variable
for (const variable of variables) {
  const { key } = variable;

  // Check environment only first (security priority)
  if (environmentOnlyPatterns.some((pattern) => pattern.test(key))) {
    categories.ENVIRONMENT_ONLY.variables.push(variable);
  }
  // Check feature flags
  else if (featureFlagPatterns.some((pattern) => pattern.test(key))) {
    categories.FEATURE_FLAGS.variables.push(variable);
  }
  // Check UI configurable
  else if (uiConfigurablePatterns.some((pattern) => pattern.test(key))) {
    categories.UI_CONFIGURABLE.variables.push(variable);
  }
  // Hybrid category for everything else
  else {
    categories.HYBRID.variables.push(variable);
  }
}

// Display results
for (const [categoryName, category] of Object.entries(categories)) {
  console.log(`🏷️  ${categoryName.replace('_', ' ')} (${category.variables.length} variables)`);
  console.log(`   ${category.description}\n`);

  if (category.variables.length > 0) {
    category.variables.slice(0, 10).forEach((variable) => {
      console.log(`   • ${variable.key}=${variable.value}`);
    });

    if (category.variables.length > 10) {
      console.log(`   ... and ${category.variables.length - 10} more\n`);
    } else {
      console.log('');
    }
  }
}

// Generate configuration schema for UI
console.log('🎨 Recommended UI Configuration Schema:\n');

const uiConfigSchema = {
  organization: {
    name: 'Organization Settings',
    description: 'Basic organization information and branding',
    fields: categories.UI_CONFIGURABLE.variables.filter(
      (v) =>
        v.key.startsWith('ORGANIZATION_') ||
        v.key.startsWith('COMPANY_') ||
        v.key.startsWith('LOGO_') ||
        v.key.startsWith('FAVICON_'),
    ),
  },
  branding: {
    name: 'Visual Branding',
    description: 'Colors, themes, and visual elements',
    fields: categories.UI_CONFIGURABLE.variables.filter(
      (v) => v.key.includes('COLOR') || v.key.includes('THEME'),
    ),
  },
  messages: {
    name: 'User Messages',
    description: 'Welcome messages and status text',
    fields: categories.UI_CONFIGURABLE.variables.filter(
      (v) =>
        v.key.startsWith('WELCOME_') || v.key.startsWith('HELP_') || v.key.startsWith('STATUS_'),
    ),
  },
  security: {
    name: 'Security Settings',
    description: 'Rate limits and password policies',
    fields: categories.UI_CONFIGURABLE.variables.filter(
      (v) =>
        v.key.startsWith('RATE_LIMIT_') ||
        v.key.startsWith('MIN_PIN_') ||
        v.key.startsWith('MAX_PIN_'),
    ),
  },
  features: {
    name: 'Feature Toggles',
    description: 'Enable/disable application features',
    fields: categories.FEATURE_FLAGS.variables.filter(
      (v) => !environmentOnlyPatterns.some((pattern) => pattern.test(v.key)),
    ),
  },
  email: {
    name: 'Email Settings',
    description: 'Email configuration and templates',
    fields: categories.UI_CONFIGURABLE.variables.filter(
      (v) =>
        v.key.startsWith('FROM_') ||
        v.key.startsWith('SUPPORT_') ||
        v.key.startsWith('EMAIL_TRACKING_'),
    ),
  },
};

for (const [sectionKey, section] of Object.entries(uiConfigSchema)) {
  if (section.fields.length > 0) {
    console.log(`📁 ${section.name}`);
    console.log(`   ${section.description}`);
    section.fields.forEach((field) => {
      console.log(`   • ${field.key} = ${field.value}`);
    });
    console.log('');
  }
}

console.log('🔒 Security Recommendations:');
console.log('   • Keep all passwords, secrets, and API keys as environment variables only');
console.log('   • Database URLs and connection strings should remain environment-only');
console.log('   • Feature flags can be UI configurable for admin users');
console.log('   • Branding and organization settings are perfect for UI configuration');
console.log('   • Rate limits and security policies can be UI configurable with proper validation');

console.log('\n✅ Analysis Complete!');
