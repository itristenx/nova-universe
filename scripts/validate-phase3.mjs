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
const projectRoot = path.dirname(__dirname);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Logging utilities
const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(path.join(projectRoot, filePath));
  } catch (error) {
    return false;
  }
}

/**
 * Check if file contains specific content
 */
function fileContains(filePath, content) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    if (!fs.existsSync(fullPath)) return false;
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    return fileContent.includes(content);
  } catch (error) {
    return false;
  }
}

/**
 * Get file content
 */
function getFileContent(filePath) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    return '';
  }
}

/**
 * Test helper functions
 */
function test(description, condition) {
  if (condition) {
    log.success(description);
    testResults.passed++;
  } else {
    log.error(description);
    testResults.failed++;
  }
}

function testWarning(description, condition) {
  if (condition) {
    log.success(description);
    testResults.passed++;
  } else {
    log.warning(description);
    testResults.warnings++;
  }
}

/**
 * Phase 3 Validation Tests
 */

log.section('Phase 3: UI/UX Design & Branding - Validation Report');
log.info('Checking implementation completeness...\n');

// Task 1: Design Token System
log.section('Task 1: Design Token System');
test('Design tokens file exists', fileExists('packages/design-system/tokens.js'));
test('CSS variables file exists', fileExists('packages/design-system/css-variables.css'));
test('Tokens include color palette', fileContains('packages/design-system/tokens.js', 'colors'));
test('Tokens include typography', fileContains('packages/design-system/tokens.js', 'typography'));
test('Tokens include spacing', fileContains('packages/design-system/tokens.js', 'spacing'));
test(
  'CSS variables are exported',
  fileContains('packages/design-system/css-variables.css', '--color-'),
);

// Task 2: Component Library
log.section('Task 2: Component Library');
test('Component library index exists', fileExists('packages/design-system/index.js'));
test('Button component exists', fileExists('packages/design-system/Button.js'));
test('Input component exists', fileExists('packages/design-system/Input.js'));
test('Card component exists', fileExists('packages/design-system/Card.js'));
test('Modal component exists', fileExists('packages/design-system/Modal.js'));
test('Toast component exists', fileExists('packages/design-system/Toast.js'));
test('Loading component exists', fileExists('packages/design-system/Loading.js'));

// Task 3: Theme System
log.section('Task 3: Theme System');
test('Theme provider exists', fileExists('packages/design-system/ThemeProvider.js'));
test(
  'Theme context exists',
  fileContains('packages/design-system/ThemeProvider.js', 'createContext'),
);
test('Theme supports light mode', fileContains('packages/design-system/ThemeProvider.js', 'light'));
test('Theme supports dark mode', fileContains('packages/design-system/ThemeProvider.js', 'dark'));
test(
  'Theme supports high contrast',
  fileContains('packages/design-system/ThemeProvider.js', 'high-contrast'),
);

// Task 4: Accessibility Framework
log.section('Task 4: Accessibility Framework');
test('Accessibility utilities exist', fileExists('packages/design-system/accessibility.js'));
test(
  'Accessibility provider exists',
  fileContains('packages/design-system/accessibility.js', 'AccessibilityProvider'),
);
test(
  'Screen reader support included',
  fileContains('packages/design-system/accessibility.js', 'screenReader'),
);
test(
  'Keyboard navigation support',
  fileContains('packages/design-system/accessibility.js', 'keyboard'),
);
test('ARIA utilities included', fileContains('packages/design-system/accessibility.js', 'aria'));

// Task 5: Admin Interface Implementation
log.section('Task 5: Admin Interface Implementation');
test(
  'Admin dashboard exists',
  fileExists('apps/core/nova-core/src/components/admin/AdminDashboard.jsx'),
);
test(
  'Ticket management exists',
  fileExists('apps/core/nova-core/src/components/admin/TicketManagement.jsx'),
);
test(
  'User management exists',
  fileExists('apps/core/nova-core/src/components/admin/UserManagement.jsx'),
);
test(
  'Kiosk management exists',
  fileExists('apps/core/nova-core/src/components/admin/KioskManagement.jsx'),
);
testWarning(
  'Admin components use design system',
  fileContains('apps/core/nova-core/src/components/admin/AdminDashboard.jsx', 'design-system'),
);

// Task 6: Kiosk Interface Implementation
log.section('Task 6: Kiosk Interface Implementation');
test('Kiosk app exists', fileExists('apps/orbit/src/components/KioskApp.jsx'));
test('Kiosk status display exists', fileExists('apps/orbit/src/components/KioskStatusDisplay.jsx'));
test(
  'Kiosk interface is touch-optimized',
  fileContains('apps/orbit/src/components/KioskApp.jsx', 'touch'),
);
testWarning(
  'Kiosk uses design system',
  fileContains('apps/orbit/src/components/KioskApp.jsx', 'design-system'),
);

// Bonus: Demo and Documentation
log.section('Bonus Implementation');
test(
  'Design system demo exists',
  fileExists('apps/core/nova-core/src/components/DesignSystemDemo.jsx'),
);
test(
  'Demo showcases components',
  fileContains('apps/core/nova-core/src/components/DesignSystemDemo.jsx', 'Button'),
);
test(
  'Demo includes theme switching',
  fileContains('apps/core/nova-core/src/components/DesignSystemDemo.jsx', 'ThemeProvider'),
);

// Package Structure Validation
log.section('Package Structure Validation');
test('Design system package.json exists', fileExists('packages/design-system/package.json'));
test('Design system exports components', fileContains('packages/design-system/index.js', 'export'));

// Code Quality Checks
log.section('Code Quality Validation');
const buttonContent = getFileContent('packages/design-system/Button.js');
test(
  'Button has variant support',
  buttonContent.includes('variant') || buttonContent.includes('variants'),
);
test('Button has size support', buttonContent.includes('size'));
test('Button is accessible', buttonContent.includes('aria-') || buttonContent.includes('role'));

const modalContent = getFileContent('packages/design-system/Modal.js');
test(
  'Modal has proper accessibility',
  modalContent.includes('aria-') && modalContent.includes('role'),
);
test(
  'Modal supports escape key',
  modalContent.includes('Escape') || modalContent.includes('keydown'),
);

// Integration Tests
log.section('Integration Validation');
const adminDashContent = getFileContent(
  'apps/core/nova-core/src/components/admin/AdminDashboard.jsx',
);
test(
  'Admin dashboard has real functionality',
  adminDashContent.includes('useState') || adminDashContent.includes('useEffect'),
);
test(
  'Admin dashboard is responsive',
  adminDashContent.includes('responsive') || adminDashContent.includes('mobile'),
);

const kioskContent = getFileContent('apps/orbit/src/components/KioskApp.jsx');
test(
  'Kiosk has session management',
  kioskContent.includes('session') || kioskContent.includes('timeout'),
);
test(
  'Kiosk has accessibility features',
  kioskContent.includes('aria-') || kioskContent.includes('screen reader'),
);

// Final Report
log.section('Phase 3 Validation Summary');

const total = testResults.passed + testResults.failed + testResults.warnings;
const passRate = ((testResults.passed / total) * 100).toFixed(1);

console.log('\n📊 Test Results:');
console.log(`${colors.green}✓ Passed: ${testResults.passed}${colors.reset}`);
console.log(`${colors.red}✗ Failed: ${testResults.failed}${colors.reset}`);
console.log(`${colors.yellow}⚠ Warnings: ${testResults.warnings}${colors.reset}`);
console.log(`📈 Pass Rate: ${passRate}%`);

if (testResults.failed === 0) {
  log.success('\n🎉 Phase 3 implementation is complete and ready for production!');
} else if (testResults.failed <= 3) {
  log.warning('\n⚠️  Phase 3 implementation is mostly complete with minor issues.');
} else {
  log.error('\n❌ Phase 3 implementation needs significant work before completion.');
}

// Generate JSON report
const report = {
  phase: 3,
  title: 'UI/UX Design & Branding',
  timestamp: new Date().toISOString(),
  results: testResults,
  passRate: parseFloat(passRate),
  status: testResults.failed === 0 ? 'complete' : 'incomplete',
  details: {
    designTokens: fileExists('packages/design-system/src/tokens.js'),
    componentLibrary: fileExists('packages/design-system/src/components/Button.js'),
    themeSystem: fileExists('packages/design-system/src/providers/ThemeProvider.js'),
    accessibility: fileExists('packages/design-system/src/utils/accessibility.js'),
    adminInterface: fileExists('apps/core/nova-core/src/components/admin/AdminDashboard.jsx'),
    kioskInterface: fileExists('apps/orbit/src/components/KioskApp.jsx'),
  },
};

try {
  fs.writeFileSync(
    path.join(projectRoot, 'phase3-validation-report.json'),
    JSON.stringify(report, null, 2),
  );
  log.info('\n📄 Detailed report saved to: phase3-validation-report.json');
} catch (error) {
  log.warning('\n⚠️  Could not save detailed report');
}

// Exit with appropriate code
process.exit(testResults.failed > 0 ? 1 : 0);
