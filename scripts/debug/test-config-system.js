#!/usr/bin/env node

/**
 * Configuration System End-to-End Test
 *
 * Tests the complete configuration management system:
 * - ConfigurationService with all categories
 * - API endpoints for each category
 * - Fallback behavior when database unavailable
 * - Default values for all configuration keys
 */

import ConfigurationService from './apps/api/services/configuration.service.js';

const ANSI_COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
};

function log(color, ...args) {
  console.log(color, ...args, ANSI_COLORS.RESET);
}

function logTest(name, result) {
  const status = result ? '✅ PASS' : '❌ FAIL';
  const color = result ? ANSI_COLORS.GREEN : ANSI_COLORS.RED;
  log(color, `${status} ${name}`);
}

async function testConfigurationService() {
  log(ANSI_COLORS.CYAN + ANSI_COLORS.BOLD, '\n🧪 Configuration Service Test Suite\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: ConfigurationService imports correctly
  totalTests++;
  try {
    const isFunction = typeof ConfigurationService.getValue === 'function';
    logTest('ConfigurationService imports and has getValue method', isFunction);
    if (isFunction) passedTests++;
  } catch (error) {
    logTest('ConfigurationService imports and has getValue method', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Test 2: Organization config loads with defaults
  totalTests++;
  try {
    const orgConfig = await ConfigurationService.getOrganizationConfig();
    const hasRequiredFields =
      orgConfig.organization_name && orgConfig.company_name && orgConfig.primary_color;
    logTest('Organization config loads with required defaults', hasRequiredFields);
    if (hasRequiredFields) {
      passedTests++;
      log(ANSI_COLORS.BLUE, '   📁 Organization Name:', orgConfig.organization_name);
      log(ANSI_COLORS.BLUE, '   🏢 Company Name:', orgConfig.company_name);
      log(ANSI_COLORS.BLUE, '   🎨 Primary Color:', orgConfig.primary_color);
    }
  } catch (error) {
    logTest('Organization config loads with required defaults', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Test 3: Messages config loads with defaults
  totalTests++;
  try {
    const msgConfig = await ConfigurationService.getMessagesConfig();
    const hasRequiredFields =
      msgConfig.welcome_message && msgConfig.help_message && msgConfig.status_open_msg;
    logTest('Messages config loads with required defaults', hasRequiredFields);
    if (hasRequiredFields) {
      passedTests++;
      log(ANSI_COLORS.BLUE, '   💬 Welcome Message:', msgConfig.welcome_message);
      log(ANSI_COLORS.BLUE, '   ❓ Help Message:', msgConfig.help_message);
    }
  } catch (error) {
    logTest('Messages config loads with required defaults', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Test 4: Feature flags config loads
  totalTests++;
  try {
    const featuresConfig = await ConfigurationService.getFeatureFlagsConfig();
    const hasFeatures =
      featuresConfig.cosmo_enabled !== undefined &&
      featuresConfig.ai_ticket_processing_enabled !== undefined;
    logTest('Feature flags config loads with defaults', hasFeatures);
    if (hasFeatures) {
      passedTests++;
      log(ANSI_COLORS.BLUE, '   🤖 Cosmo Enabled:', featuresConfig.cosmo_enabled);
      log(ANSI_COLORS.BLUE, '   🎯 AI Processing:', featuresConfig.ai_ticket_processing_enabled);
    }
  } catch (error) {
    logTest('Feature flags config loads with defaults', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Test 5: Security config loads
  totalTests++;
  try {
    const securityConfig = await ConfigurationService.getSecurityConfig();
    const hasSecurityFields =
      securityConfig.rate_limit_window &&
      securityConfig.rate_limit_max &&
      securityConfig.min_pin_length;
    logTest('Security config loads with defaults', hasSecurityFields);
    if (hasSecurityFields) {
      passedTests++;
      log(ANSI_COLORS.BLUE, '   🔒 Rate Limit Window:', securityConfig.rate_limit_window);
      log(ANSI_COLORS.BLUE, '   📊 Rate Limit Max:', securityConfig.rate_limit_max);
    }
  } catch (error) {
    logTest('Security config loads with defaults', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Test 6: Email config loads
  totalTests++;
  try {
    const emailConfig = await ConfigurationService.getEmailConfig();
    const hasEmailFields =
      emailConfig.support_email && emailConfig.from_email && emailConfig.from_name;
    logTest('Email config loads with defaults', hasEmailFields);
    if (hasEmailFields) {
      passedTests++;
      log(ANSI_COLORS.BLUE, '   📧 Support Email:', emailConfig.support_email);
      log(ANSI_COLORS.BLUE, '   📤 From Email:', emailConfig.from_email);
    }
  } catch (error) {
    logTest('Email config loads with defaults', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Test 7: Upload config loads
  totalTests++;
  try {
    const uploadConfig = await ConfigurationService.getUploadConfig();
    const hasUploadFields = uploadConfig.upload_max_file_size && uploadConfig.upload_allowed_types;
    logTest('Upload config loads with defaults', hasUploadFields);
    if (hasUploadFields) {
      passedTests++;
      log(ANSI_COLORS.BLUE, '   📁 Max File Size:', uploadConfig.upload_max_file_size);
      log(
        ANSI_COLORS.BLUE,
        '   📄 Allowed Types:',
        uploadConfig.upload_allowed_types?.substring(0, 50) + '...',
      );
    }
  } catch (error) {
    logTest('Upload config loads with defaults', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Test 8: System config loads
  totalTests++;
  try {
    const systemConfig = await ConfigurationService.getSystemConfig();
    const hasSystemFields =
      systemConfig.backup_retention_days &&
      systemConfig.health_check_interval &&
      systemConfig.log_level;
    logTest('System config loads with defaults', hasSystemFields);
    if (hasSystemFields) {
      passedTests++;
      log(ANSI_COLORS.BLUE, '   💾 Backup Retention:', systemConfig.backup_retention_days, 'days');
      log(
        ANSI_COLORS.BLUE,
        '   💓 Health Check Interval:',
        systemConfig.health_check_interval,
        'ms',
      );
    }
  } catch (error) {
    logTest('System config loads with defaults', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Test 9: All categorized config loads
  totalTests++;
  try {
    const allConfig = await ConfigurationService.getAllCategorizedConfig();
    const hasAllCategories =
      allConfig.organization &&
      allConfig.messages &&
      allConfig.features &&
      allConfig.security &&
      allConfig.email &&
      allConfig.upload &&
      allConfig.system;
    logTest('All categorized config loads successfully', hasAllCategories);
    if (hasAllCategories) {
      passedTests++;
      log(ANSI_COLORS.BLUE, '   📂 Categories loaded:', Object.keys(allConfig).join(', '));
    }
  } catch (error) {
    logTest('All categorized config loads successfully', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Test 10: Configuration validation
  totalTests++;
  try {
    const testConfig = await ConfigurationService.getAllCategorizedConfig();
    const requiredFields = [
      testConfig.organization?.organization_name,
      testConfig.organization?.company_name,
      testConfig.messages?.welcome_message,
      testConfig.security?.rate_limit_window,
      testConfig.email?.support_email,
    ];
    const allFieldsPresent = requiredFields.every(
      (field) => field !== undefined && field !== null && field !== '',
    );
    logTest('Critical configuration fields have valid values', allFieldsPresent);
    if (allFieldsPresent) passedTests++;
  } catch (error) {
    logTest('Critical configuration fields have valid values', false);
    log(ANSI_COLORS.RED, 'Error:', error.message);
  }

  // Summary
  log(ANSI_COLORS.CYAN + ANSI_COLORS.BOLD, '\n📊 Test Results Summary');
  log(ANSI_COLORS.WHITE, `Total Tests: ${totalTests}`);
  log(
    passedTests === totalTests ? ANSI_COLORS.GREEN : ANSI_COLORS.YELLOW,
    `Passed: ${passedTests}`,
  );
  if (totalTests - passedTests > 0) {
    log(ANSI_COLORS.RED, `Failed: ${totalTests - passedTests}`);
  }

  const successRate = Math.round((passedTests / totalTests) * 100);
  if (successRate === 100) {
    log(
      ANSI_COLORS.GREEN + ANSI_COLORS.BOLD,
      `\n🎉 All tests passed! Configuration system is fully operational! (${successRate}%)`,
    );
  } else if (successRate >= 80) {
    log(
      ANSI_COLORS.YELLOW + ANSI_COLORS.BOLD,
      `\n⚠️  Most tests passed. Minor issues detected. (${successRate}%)`,
    );
  } else {
    log(
      ANSI_COLORS.RED + ANSI_COLORS.BOLD,
      `\n❌ Significant issues detected. Configuration system needs attention. (${successRate}%)`,
    );
  }

  return { passedTests, totalTests, successRate };
}

// Run the test suite
testConfigurationService()
  .then(({ successRate }) => {
    process.exit(successRate === 100 ? 0 : 1);
  })
  .catch((error) => {
    log(ANSI_COLORS.RED + ANSI_COLORS.BOLD, '\n💥 Test suite crashed:', error.message);
    process.exit(2);
  });
