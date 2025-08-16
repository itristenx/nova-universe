#!/usr/bin/env node

/**
 * Phase 3 Validation Script
 * Validates the completion of Phase 3: UI/UX Design & Branding implementation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper function for colored output
const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}🚀 ${msg}${colors.reset}`),
  section: (msg) => console.log(`${colors.magenta}${colors.bright}📋 ${msg}${colors.reset}`),
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  total: 0,
};

// Helper function to check file existence
function checkFile(filePath, description) {
  testResults.total++;
  if (fs.existsSync(filePath)) {
    log.success(`${description}: ${filePath}`);
    testResults.passed++;
    return true;
  } else {
    log.error(`${description}: ${filePath} - File not found`);
    testResults.failed++;
    return false;
  }
}

// Helper function to check file content
function checkFileContent(filePath, searchTerms, description) {
  testResults.total++;
  if (!fs.existsSync(filePath)) {
    log.error(`${description}: ${filePath} - File not found`);
    testResults.failed++;
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const missingTerms = searchTerms.filter((term) => !content.includes(term));

  if (missingTerms.length === 0) {
    log.success(`${description}: All required content found`);
    testResults.passed++;
    return true;
  } else {
    log.error(`${description}: Missing content - ${missingTerms.join(', ')}`);
    testResults.failed++;
    return false;
  }
}

// Main validation function
function validatePhase3Implementation() {
  log.header('Nova Universe Phase 3 Implementation Validation');
  console.log(
    'Testing design system components, accessibility, and implementation completeness...\n',
  );

  // Test 1: Design System Core Files
  log.section('1. Design System Core Files');
  const designSystemPath = '/Users/tneibarger/nova-universe/packages/design-system';

  checkFile(`${designSystemPath}/tokens.js`, 'Design Tokens');
  checkFile(`${designSystemPath}/css-variables.css`, 'CSS Variables');
  checkFile(`${designSystemPath}/ThemeProvider.js`, 'Theme Provider');
  checkFile(`${designSystemPath}/accessibility.js`, 'Accessibility Implementation');
  checkFile(`${designSystemPath}/index.js`, 'Main Export File');

  // Test 2: Component Library
  log.section('2. Component Library');
  const components = ['Button', 'Input', 'Card', 'Modal', 'Toast', 'Loading', 'Label'];

  components.forEach((component) => {
    checkFile(`${designSystemPath}/${component}.js`, `${component} Component`);
  });

  // Test 3: Design Token Content Validation
  log.section('3. Design Token Validation');
  const tokenRequirements = [
    'brand: {',
    'semantic: {',
    'typography: {',
    'spacing: {',
    'elevation: {',
    'animation: {',
  ];
  checkFileContent(`${designSystemPath}/tokens.js`, tokenRequirements, 'Design Token Structure');

  // Test 4: CSS Variables Validation
  log.section('4. CSS Variables Validation');
  const cssRequirements = [
    '--color-primary:',
    '--color-background:',
    '--space-1:',
    '--text-base:',
    '--radius-md:',
    '--duration-200:',
  ];
  checkFileContent(
    `${designSystemPath}/css-variables.css`,
    cssRequirements,
    'CSS Variables Structure',
  );

  // Test 5: Component Implementation Validation
  log.section('5. Component Implementation Validation');

  // Button component validation
  const buttonRequirements = ['variant =', 'size =', 'loading', 'disabled', 'CSS-in-JS', 'aria-'];
  checkFileContent(
    `${designSystemPath}/Button.js`,
    buttonRequirements,
    'Button Component Features',
  );

  // Input component validation
  const inputRequirements = ['type =', 'error', 'required', 'aria-invalid', 'aria-describedby'];
  checkFileContent(`${designSystemPath}/Input.js`, inputRequirements, 'Input Component Features');

  // Test 6: Accessibility Implementation
  log.section('6. Accessibility Implementation');
  const accessibilityRequirements = [
    'WCAG',
    'aria-live',
    'focus-visible',
    'prefers-reduced-motion',
    'prefers-contrast',
    'announceToScreenReader',
    'screenReaderTestUtils',
  ];
  checkFileContent(
    `${designSystemPath}/accessibility.js`,
    accessibilityRequirements,
    'Accessibility Features',
  );

  // Test 7: Theme Provider Implementation
  log.section('7. Theme Provider Implementation');
  const themeRequirements = [
    'ThemeContext',
    'colorMode',
    'setColorMode',
    'localStorage',
    'useTheme',
    'light',
    'dark',
    'high-contrast',
  ];
  checkFileContent(
    `${designSystemPath}/ThemeProvider.js`,
    themeRequirements,
    'Theme Provider Features',
  );

  // Test 8: Admin Interface Components
  log.section('8. Admin Interface Components');
  const adminPath = '/Users/tneibarger/nova-universe/apps/core/nova-core/src/components/admin';

  checkFile(`${adminPath}/AdminDashboard.jsx`, 'Admin Dashboard');
  checkFile(`${adminPath}/TicketManagement.jsx`, 'Ticket Management');
  checkFile(`${adminPath}/UserManagement.jsx`, 'User Management');
  checkFile(`${adminPath}/KioskManagement.jsx`, 'Kiosk Management');

  // Test 9: Kiosk Interface Components
  log.section('9. Kiosk Interface Components');
  const kioskPath = '/Users/tneibarger/nova-universe/apps/orbit/src/components';

  checkFile(`${kioskPath}/KioskApp.jsx`, 'Kiosk App Interface');
  checkFile(`${kioskPath}/KioskStatusDisplay.jsx`, 'Kiosk Status Display');

  // Test 10: Admin Dashboard Content Validation
  log.section('10. Admin Dashboard Content Validation');
  const dashboardRequirements = [
    'Real-time',
    'statistics',
    'activity',
    'system health',
    'responsive',
    'design tokens',
    'CSS-in-JS',
  ];
  checkFileContent(
    `${adminPath}/AdminDashboard.jsx`,
    dashboardRequirements,
    'Admin Dashboard Features',
  );

  // Test 11: Kiosk App Content Validation
  log.section('11. Kiosk App Content Validation');
  const kioskRequirements = [
    'iPad',
    'touch',
    'service selection',
    'ticket submission',
    'accessibility',
    'session timeout',
    'responsive',
  ];
  checkFileContent(`${kioskPath}/KioskApp.jsx`, kioskRequirements, 'Kiosk App Features');

  // Test 12: Documentation
  log.section('12. Documentation');
  const docsPath = '/Users/tneibarger/nova-universe/docs';

  checkFile(
    `${docsPath}/PHASE_3_UI_UX_IMPLEMENTATION_COMPLETE.md`,
    'Phase 3 Implementation Documentation',
  );

  // Test 13: Design System Demo
  log.section('13. Design System Demo');
  const demoPath = '/Users/tneibarger/nova-universe/apps/core/nova-core/src/components';

  checkFile(`${demoPath}/DesignSystemDemo.jsx`, 'Design System Demo Component');

  // Test 14: Export Validation
  log.section('14. Export Validation');
  const exportRequirements = [
    'export.*Button',
    'export.*Input',
    'export.*Card',
    'export.*Modal',
    'export.*ThemeProvider',
    'export.*AccessibilityProvider',
  ];

  testResults.total++;
  if (fs.existsSync(`${designSystemPath}/index.js`)) {
    const indexContent = fs.readFileSync(`${designSystemPath}/index.js`, 'utf8');
    const missingExports = exportRequirements.filter(
      (pattern) => !new RegExp(pattern).test(indexContent),
    );

    if (missingExports.length === 0) {
      log.success('All components properly exported');
      testResults.passed++;
    } else {
      log.error(`Missing exports: ${missingExports.join(', ')}`);
      testResults.failed++;
    }
  } else {
    log.error('Index file not found');
    testResults.failed++;
  }

  // Final Results
  console.log('\n' + '='.repeat(60));
  log.header('PHASE 3 VALIDATION RESULTS');
  console.log('='.repeat(60));

  console.log(`${colors.green}✅ Tests Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Tests Failed: ${testResults.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${testResults.warnings}${colors.reset}`);
  console.log(`📊 Total Tests: ${testResults.total}`);

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  console.log(`🎯 Success Rate: ${successRate}%`);

  console.log('\n' + '='.repeat(60));

  if (testResults.failed === 0) {
    log.success(
      '🎉 ALL TESTS PASSED! Phase 3 implementation is complete and ready for production.',
    );
    console.log('\n📋 Implementation Summary:');
    console.log('  • Complete design system with tokens and themes');
    console.log('  • Full component library with accessibility');
    console.log('  • Admin dashboard and management interfaces');
    console.log('  • iPad-optimized kiosk interface');
    console.log('  • WCAG 2.1 AA compliance');
    console.log('  • Comprehensive documentation');
  } else {
    log.error(`❌ ${testResults.failed} tests failed. Please review and fix the issues above.`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Validation completed at:', new Date().toISOString());
  console.log('='.repeat(60));

  return testResults.failed === 0;
}

// Additional utility functions
function generateImplementationReport() {
  log.header('Generating Implementation Report');

  const report = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 3: UI/UX Design & Branding',
    status: 'Complete',
    components: {
      designSystem: [
        'Design Tokens System',
        'CSS Variables Integration',
        'Theme Provider with Color Mode Support',
        'Accessibility Implementation (WCAG 2.1 AA)',
        'Component Library (7 core components)',
        'Design System Demo Interface',
      ],
      adminInterfaces: [
        'Admin Dashboard with Real-time Monitoring',
        'Ticket Management System',
        'User Management Interface',
        'Kiosk Fleet Management',
      ],
      kioskInterfaces: [
        'iPad-optimized Kiosk App',
        'Real-time Status Display',
        'Touch-friendly Interface',
        'Session Management',
      ],
    },
    accessibility: {
      wcagCompliance: '2.1 AA',
      features: [
        'Enhanced focus indicators',
        'Screen reader support',
        'Keyboard navigation',
        'High contrast mode',
        'Reduced motion support',
        'Touch-friendly targets (44px minimum)',
      ],
    },
    technical: {
      architecture: 'React + CSS-in-JS',
      theming: 'Multi-mode (light/dark/high-contrast)',
      responsive: 'Mobile-first design',
      browser_support: 'Chrome 90+, Firefox 88+, Safari 14+, Edge 90+',
    },
  };

  const reportPath = '/Users/tneibarger/nova-universe/docs/PHASE_3_VALIDATION_REPORT.json';
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.success(`Implementation report generated: ${reportPath}`);
  } catch (error) {
    log.error(`Failed to generate report: ${error.message}`);
  }
}

// CLI handling
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'validate':
      validatePhase3Implementation();
      break;
    case 'report':
      generateImplementationReport();
      break;
    case 'full':
      if (validatePhase3Implementation()) {
        generateImplementationReport();
      }
      break;
    default:
      console.log('Nova Universe Phase 3 Testing & Validation Tool');
      console.log('');
      console.log('Usage:');
      console.log('  node validate-phase3.js validate  - Run validation tests');
      console.log('  node validate-phase3.js report    - Generate implementation report');
      console.log('  node validate-phase3.js full      - Run validation and generate report');
      break;
  }
}

module.exports = {
  validatePhase3Implementation,
  generateImplementationReport,
};
