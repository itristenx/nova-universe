#!/usr/bin/env node

/**
 * Configuration Database Seeding Script
 * Populates the Config table with predefined configuration definitions
 */

import { PrismaClient } from '../prisma/generated/core/index.js';

const prisma = new PrismaClient();

// Configuration definitions that match our UI component
const CONFIG_DEFINITIONS = [
  // Branding configurations
  {
    key: 'ORGANIZATION_NAME',
    value: null,
    valueType: 'string',
    description: 'The name of your organization displayed throughout the application',
    isPublic: true,
    category: 'branding',
    subcategory: 'identity',
    isUIEditable: true,
    isRequired: false,
    defaultValue: 'Nova Universe',
    validationRules: {
      minLength: 1,
      maxLength: 100,
      pattern: '^[a-zA-Z0-9\\s&.-]+$',
    },
    displayOrder: 1,
    helpText:
      "Enter your organization's full name. This will appear in headers, emails, and branding.",
    isAdvanced: false,
  },
  {
    key: 'LOGO_URL',
    value: null,
    valueType: 'string',
    description: "URL or path to your organization's logo",
    isPublic: true,
    category: 'branding',
    subcategory: 'assets',
    isUIEditable: true,
    isRequired: false,
    defaultValue: '/assets/logo.png',
    validationRules: {
      pattern: '^(https?://|/)',
    },
    displayOrder: 2,
    helpText: 'Provide a URL to your logo image. Recommended size: 200x50px',
    isAdvanced: false,
  },
  {
    key: 'PRIMARY_COLOR',
    value: null,
    valueType: 'string',
    description: 'Primary color for your brand (hex format)',
    isPublic: true,
    category: 'branding',
    subcategory: 'colors',
    isUIEditable: true,
    isRequired: false,
    defaultValue: '#3b82f6',
    validationRules: {
      pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    },
    displayOrder: 3,
    helpText: 'Enter a hex color code for your primary brand color',
    isAdvanced: false,
  },

  // Security configurations
  {
    key: 'MIN_PIN_LENGTH',
    value: null,
    valueType: 'number',
    description: 'Minimum required length for user PINs',
    isPublic: false,
    category: 'security',
    subcategory: 'authentication',
    isUIEditable: true,
    isRequired: false,
    defaultValue: '4',
    validationRules: {
      min: 3,
      max: 10,
    },
    displayOrder: 1,
    helpText: 'Set the minimum number of digits required for user PINs',
    isAdvanced: false,
  },
  {
    key: 'RATE_LIMIT_WINDOW',
    value: null,
    valueType: 'number',
    description: 'Time window for rate limiting in minutes',
    isPublic: false,
    category: 'security',
    subcategory: 'rate-limiting',
    isUIEditable: true,
    isRequired: false,
    defaultValue: '15',
    validationRules: {
      min: 1,
      max: 60,
    },
    displayOrder: 2,
    helpText: 'Time window in minutes for tracking rate limits',
    isAdvanced: true,
  },

  // Feature toggles
  {
    key: 'COSMO_ENABLED',
    value: null,
    valueType: 'boolean',
    description: 'Enable or disable the Cosmo AI assistant feature',
    isPublic: true,
    category: 'features',
    subcategory: 'ai',
    isUIEditable: true,
    isRequired: false,
    defaultValue: 'true',
    validationRules: null,
    displayOrder: 1,
    helpText: 'Toggle the AI assistant feature for users',
    isAdvanced: false,
  },
  {
    key: 'AI_TICKET_PROCESSING_ENABLED',
    value: null,
    valueType: 'boolean',
    description: 'Enable automatic AI processing of support tickets',
    isPublic: false,
    category: 'features',
    subcategory: 'ai',
    isUIEditable: true,
    isRequired: false,
    defaultValue: 'false',
    validationRules: null,
    displayOrder: 2,
    helpText: 'Enable AI to automatically categorize and process tickets',
    isAdvanced: false,
  },

  // Integration settings
  {
    key: 'DIRECTORY_PROVIDER',
    value: null,
    valueType: 'string',
    description: 'Type of directory service provider',
    isPublic: false,
    category: 'integrations',
    subcategory: 'authentication',
    isUIEditable: true,
    isRequired: false,
    defaultValue: 'local',
    validationRules: {
      enum: ['local', 'ldap', 'azure-ad', 'okta', 'google'],
    },
    displayOrder: 1,
    helpText: "Select your organization's directory service provider",
    isAdvanced: false,
  },

  // Communications
  {
    key: 'FROM_EMAIL',
    value: null,
    valueType: 'string',
    description: 'Default email address for system notifications',
    isPublic: false,
    category: 'communications',
    subcategory: 'email',
    isUIEditable: true,
    isRequired: false,
    defaultValue: 'noreply@example.com',
    validationRules: {
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
    displayOrder: 1,
    helpText: 'Email address used as the sender for system notifications',
    isAdvanced: false,
  },

  // AI configurations
  {
    key: 'COSMO_PERSONALITY',
    value: null,
    valueType: 'string',
    description: 'Personality style for the AI assistant',
    isPublic: true,
    category: 'ai',
    subcategory: 'behavior',
    isUIEditable: true,
    isRequired: false,
    defaultValue: 'professional',
    validationRules: {
      enum: ['professional', 'friendly', 'casual', 'technical'],
    },
    displayOrder: 1,
    helpText: 'Choose the personality style for AI interactions',
    isAdvanced: false,
  },
];

async function seedConfigurations() {
  console.log('🌱 Starting configuration seeding...');

  try {
    for (const config of CONFIG_DEFINITIONS) {
      console.log(`Processing configuration: ${config.key}`);

      // Use upsert to either create or update existing configurations
      const result = await prisma.config.upsert({
        where: { key: config.key },
        update: {
          // Only update metadata, preserve existing values
          description: config.description,
          valueType: config.valueType,
          isPublic: config.isPublic,
          category: config.category,
          subcategory: config.subcategory,
          isUIEditable: config.isUIEditable,
          isRequired: config.isRequired,
          defaultValue: config.defaultValue,
          validationRules: config.validationRules,
          displayOrder: config.displayOrder,
          helpText: config.helpText,
          isAdvanced: config.isAdvanced,
          updatedAt: new Date(),
        },
        create: {
          key: config.key,
          value: config.value,
          valueType: config.valueType,
          description: config.description,
          isPublic: config.isPublic,
          category: config.category,
          subcategory: config.subcategory,
          isUIEditable: config.isUIEditable,
          isRequired: config.isRequired,
          defaultValue: config.defaultValue,
          validationRules: config.validationRules,
          displayOrder: config.displayOrder,
          helpText: config.helpText,
          isAdvanced: config.isAdvanced,
        },
      });

      console.log(`✅ ${config.key}: ${result ? 'created/updated' : 'skipped'}`);
    }

    console.log('\n🎉 Configuration seeding completed successfully!');
    console.log(`📊 Processed ${CONFIG_DEFINITIONS.length} configuration definitions`);

    // Display summary by category
    const categories = [...new Set(CONFIG_DEFINITIONS.map((c) => c.category))];
    console.log('\n📋 Summary by category:');
    for (const category of categories) {
      const count = CONFIG_DEFINITIONS.filter((c) => c.category === category).length;
      console.log(`  - ${category}: ${count} configurations`);
    }
  } catch (error) {
    console.error('❌ Error during configuration seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedConfigurations();
}

export { seedConfigurations, CONFIG_DEFINITIONS };
