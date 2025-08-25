#!/usr/bin/env node

/**
 * Unified UI Validation Script
 * Validates that all components of the Nova Unified ITSM Platform are properly implemented
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Nova Unified UI Validation Starting...\n');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function checkError(message) {
  log(`❌ ${message}`, 'red');
}

function checkWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function checkInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

let passed = 0;
let failed = 0;
let warnings = 0;

// Test 1: Check if all required page files exist
log('\n📁 Checking Page Files:', 'bold');

const requiredPages = [
  'src/pages/dashboard/DashboardPage.tsx',
  'src/pages/knowledge/KnowledgeBasePage.tsx',
  'src/pages/ai/AIAssistantPage.tsx',
  'src/pages/monitoring/MonitoringPage.tsx',
  'src/pages/learning/LearningPage.tsx',
  'src/pages/tickets/TicketsPage.tsx',
  'src/pages/assets/AssetsPage.tsx',
  'src/pages/spaces/SpacesPage.tsx',
  'src/pages/admin/AdminPage.tsx',
];

requiredPages.forEach((page) => {
  const fullPath = join(__dirname, page);
  if (existsSync(fullPath)) {
    checkSuccess(`${page}`);
    passed++;
  } else {
    checkError(`Missing: ${page}`);
    failed++;
  }
});

// Test 2: Check component files
log('\n🧩 Checking Component Files:', 'bold');

const requiredComponents = [
  'src/components/layout/Sidebar.tsx',
  'src/components/layout/AppLayout.tsx',
  'src/components/common/AuthGuard.tsx',
  'src/components/dashboard/DashboardStats.tsx',
  'src/components/dashboard/QuickActions.tsx',
];

requiredComponents.forEach((component) => {
  const fullPath = join(__dirname, component);
  if (existsSync(fullPath)) {
    checkSuccess(`${component}`);
    passed++;
  } else {
    checkError(`Missing: ${component}`);
    failed++;
  }
});

// Test 3: Check App.tsx routes
log('\n🛣️  Checking Routes in App.tsx:', 'bold');

const appTsxPath = join(__dirname, 'src/App.tsx');
if (existsSync(appTsxPath)) {
  const appContent = readFileSync(appTsxPath, 'utf8');

  const requiredRoutes = [
    '/dashboard',
    '/knowledge',
    '/ai',
    '/monitoring',
    '/learning',
    '/tickets',
    '/assets',
    '/spaces',
    '/admin',
  ];

  requiredRoutes.forEach((route) => {
    if (appContent.includes(`path="${route}"`)) {
      checkSuccess(`Route: ${route}`);
      passed++;
    } else {
      checkError(`Missing route: ${route}`);
      failed++;
    }
  });
} else {
  checkError('App.tsx not found');
  failed++;
}

// Test 4: Check TypeScript compilation
log('\n🔧 Checking TypeScript Compilation:', 'bold');

try {
  execSync('npx tsc --noEmit --skipLibCheck', {
    cwd: __dirname,
    stdio: 'pipe',
  });
  checkSuccess('TypeScript compilation successful');
  passed++;
} catch (error) {
  checkError('TypeScript compilation failed');
  checkInfo('Error: ' + error.message);
  failed++;
}

// Test 5: Check package.json dependencies
log('\n📦 Checking Dependencies:', 'bold');

const packageJsonPath = join(__dirname, 'package.json');
if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'zustand',
    'tailwindcss',
    '@heroicons/react',
    'lucide-react',
  ];

  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  requiredDeps.forEach((dep) => {
    if (allDeps[dep]) {
      checkSuccess(`Dependency: ${dep}`);
      passed++;
    } else {
      checkWarning(`Missing dependency: ${dep}`);
      warnings++;
    }
  });
} else {
  checkError('package.json not found');
  failed++;
}

// Test 6: Check role-based access control implementation
log('\n🔐 Checking Role-Based Access Control:', 'bold');

const sidebarPath = join(__dirname, 'src/components/layout/Sidebar.tsx');
if (existsSync(sidebarPath)) {
  const sidebarContent = readFileSync(sidebarPath, 'utf8');

  if (sidebarContent.includes('role') && sidebarContent.includes('filter')) {
    checkSuccess('Role-based navigation filtering implemented');
    passed++;
  } else {
    checkWarning('Role-based navigation filtering may not be implemented');
    warnings++;
  }

  if (
    sidebarContent.includes('admin') &&
    sidebarContent.includes('agent') &&
    sidebarContent.includes('user')
  ) {
    checkSuccess('All user roles supported');
    passed++;
  } else {
    checkWarning('Not all user roles may be supported');
    warnings++;
  }
} else {
  checkError('Sidebar.tsx not found for RBAC check');
  failed++;
}

// Test 7: Check Apple design principles implementation
log('\n🎨 Checking Apple Design Principles:', 'bold');

const tailwindConfigPath = join(__dirname, 'tailwind.config.js');
if (existsSync(tailwindConfigPath)) {
  const tailwindContent = readFileSync(tailwindConfigPath, 'utf8');

  if (tailwindContent.includes('nova-')) {
    checkSuccess('Nova color palette implemented');
    passed++;
  } else {
    checkWarning('Nova color palette may not be fully implemented');
    warnings++;
  }
} else {
  checkWarning('tailwind.config.js not found for design check');
  warnings++;
}

// Final Summary
log('\n📊 Validation Summary:', 'bold');
log(`✅ Passed: ${passed}`, 'green');
log(`❌ Failed: ${failed}`, 'red');
log(`⚠️  Warnings: ${warnings}`, 'yellow');

const total = passed + failed + warnings;
const successRate = Math.round((passed / total) * 100);

log(
  `\n🎯 Success Rate: ${successRate}%`,
  successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red',
);

if (failed === 0) {
  log('\n🎉 All critical tests passed! Nova Unified UI is ready for deployment.', 'green');
} else {
  log(`\n🚨 ${failed} critical issues found. Please address before deployment.`, 'red');
}

if (warnings > 0) {
  log(`\nℹ️  ${warnings} warnings found. Consider addressing for optimal experience.`, 'yellow');
}

process.exit(failed > 0 ? 1 : 0);
