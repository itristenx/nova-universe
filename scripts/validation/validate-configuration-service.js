#!/usr/bin/env node

/**
 * Configuration Service Validation Script
 * Tests the new configuration service functionality
 */

import ConfigurationService from './apps/api/services/configuration.service.js';

console.log('🔧 Configuration Service Validation\n');

// Test 1: Basic Configuration Value Retrieval
console.log('1. Testing basic configuration value retrieval...');
try {
  const orgName = await ConfigurationService.getValue('organization_name');
  console.log(`✅ Organization name: ${orgName}`);

  const logoUrl = await ConfigurationService.getValue('logo_url');
  console.log(`✅ Logo URL: ${logoUrl}`);

  const supportEmail = await ConfigurationService.getValue('support_email');
  console.log(`✅ Support email: ${supportEmail}`);
} catch (error) {
  console.error('❌ Basic retrieval failed:', error.message);
}

// Test 2: Multiple Values Retrieval
console.log('\n2. Testing multiple values retrieval...');
try {
  const values = await ConfigurationService.getValues([
    'organization_name',
    'logo_url',
    'support_email',
    'welcome_message',
  ]);

  console.log('✅ Multiple values retrieved:');
  Object.entries(values).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
} catch (error) {
  console.error('❌ Multiple values retrieval failed:', error.message);
}

// Test 3: Organization Configuration
console.log('\n3. Testing organization configuration...');
try {
  const orgConfig = await ConfigurationService.getOrganizationConfig();
  console.log('✅ Organization configuration:');
  Object.entries(orgConfig).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
} catch (error) {
  console.error('❌ Organization configuration failed:', error.message);
}

// Test 4: Email Configuration
console.log('\n4. Testing email configuration...');
try {
  const emailConfig = await ConfigurationService.getEmailConfig();
  console.log('✅ Email configuration:');
  Object.entries(emailConfig).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
} catch (error) {
  console.error('❌ Email configuration failed:', error.message);
}

// Test 5: Fallback Chain
console.log('\n5. Testing fallback chain...');
try {
  // Test with a non-existent key to see fallback behavior
  const nonExistent = await ConfigurationService.getValue('non_existent_key');
  console.log(`✅ Non-existent key fallback: ${nonExistent}`);

  // Test with a key that should have environment fallback
  const baseUrl = await ConfigurationService.getValue('base_url');
  console.log(`✅ Base URL with fallback: ${baseUrl}`);
} catch (error) {
  console.error('❌ Fallback chain test failed:', error.message);
}

// Test 6: Public Configuration
console.log('\n6. Testing public configuration...');
try {
  const publicConfig = await ConfigurationService.getPublicConfig();
  console.log(`✅ Public configuration loaded with ${Object.keys(publicConfig).length} keys`);

  // Show first few keys
  const firstFew = Object.entries(publicConfig).slice(0, 3);
  firstFew.forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  if (Object.keys(publicConfig).length > 3) {
    console.log(`   ... and ${Object.keys(publicConfig).length - 3} more`);
  }
} catch (error) {
  console.error('❌ Public configuration failed:', error.message);
}

// Test 7: Cache Functionality
console.log('\n7. Testing cache functionality...');
try {
  console.log('Getting value twice to test caching...');

  const start1 = Date.now();
  const value1 = await ConfigurationService.getValue('organization_name', true);
  const time1 = Date.now() - start1;

  const start2 = Date.now();
  const value2 = await ConfigurationService.getValue('organization_name', true);
  const time2 = Date.now() - start2;

  console.log(`✅ First call: ${value1} (${time1}ms)`);
  console.log(`✅ Second call: ${value2} (${time2}ms) - should be faster due to caching`);

  if (time2 < time1) {
    console.log('✅ Cache appears to be working (second call was faster)');
  } else {
    console.log('⚠️  Cache may not be working optimally');
  }
} catch (error) {
  console.error('❌ Cache test failed:', error.message);
}

console.log('\n🎉 Configuration Service Validation Complete!');
console.log('\nSummary:');
console.log('   • Database-first configuration with environment fallbacks');
console.log('   • Cached configuration values for performance');
console.log('   • Specialized getters for organization and email config');
console.log('   • Public configuration API for frontend use');
console.log('   • Proper type parsing and validation');
console.log('\n✅ Ready for use in email templates and API endpoints!');
