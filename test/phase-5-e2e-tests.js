#!/usr/bin/env node

/**
 * Phase 5: End-to-End Testing Script
 * Tests all 9 integrated frontend pages
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3003';
// const API_URL = 'http://localhost:3000'; // Reserved for future API tests

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

function recordTest(name, status, details = '') {
  results.total++;
  results.tests.push({ name, status, details });
  
  if (status === 'passed') {
    results.passed++;
    success(`${name}: PASSED ${details}`);
  } else if (status === 'failed') {
    results.failed++;
    error(`${name}: FAILED ${details}`);
  } else if (status === 'skipped') {
    results.skipped++;
    warning(`${name}: SKIPPED ${details}`);
  }
}

async function testPage(browser, pageName, pageUrl, checks) {
  info(`\nTesting ${pageName}...`);
  
  const page = await browser.newPage();
  
  try {
    // Navigate to page
    await page.goto(`${BASE_URL}${pageUrl}`, { waitUntil: 'networkidle', timeout: 30000 });
    recordTest(`${pageName} - Page Load`, 'passed');
    
    // Run checks
    for (const check of checks) {
      try {
        await check.fn(page);
        recordTest(`${pageName} - ${check.name}`, 'passed');
      } catch (err) {
        recordTest(`${pageName} - ${check.name}`, 'failed', `- ${err.message}`);
      }
    }
  } catch (err) {
    recordTest(`${pageName} - Page Load`, 'failed', `- ${err.message}`);
  } finally {
    await page.close();
  }
}

async function runTests() {
  log('\n' + '='.repeat(80), 'blue');
  log('🧪 Phase 5: End-to-End Testing Suite', 'blue');
  log('Testing all 9 integrated frontend pages', 'blue');
  log('='.repeat(80) + '\n', 'blue');
  
  const browser = await chromium.launch({ headless: true });
  
  try {
    // ========================================================================
    // PHASE 2: Week 1 Pages
    // ========================================================================
    
    info('📚 Testing Week 1 Pages (Phase 2)...');
    
    // 1. Knowledge Base Page
    await testPage(browser, 'Knowledge Base', '/admin/knowledge', [
      {
        name: 'Popular articles section exists',
        fn: async (page) => {
          await page.waitForSelector('text=Popular Articles', { timeout: 10000 });
        }
      },
      {
        name: 'Search functionality exists',
        fn: async (page) => {
          await page.waitForSelector('[placeholder*="Search"], [placeholder*="search"]', { timeout: 5000 });
        }
      }
    ]);
    
    // 2. Service Catalog Page
    await testPage(browser, 'Service Catalog', '/admin/services', [
      {
        name: 'Services list exists',
        fn: async (page) => {
          await page.waitForSelector('text=Services, text=Service Catalog', { timeout: 10000 });
        }
      },
      {
        name: 'Featured services section exists',
        fn: async (page) => {
          await page.waitForSelector('text=Featured, text=Popular', { timeout: 5000 });
        }
      }
    ]);
    
    // 3. Agent Portal Page
    await testPage(browser, 'Agent Portal', '/admin/agent', [
      {
        name: 'Queue section exists',
        fn: async (page) => {
          await page.waitForSelector('text=Queue, text=My Queue', { timeout: 10000 });
        }
      },
      {
        name: 'Stats dashboard exists',
        fn: async (page) => {
          await page.waitForSelector('text=Stats, text=Statistics', { timeout: 5000 });
        }
      }
    ]);
    
    // 4. Directory Page
    await testPage(browser, 'Directory', '/admin/directory', [
      {
        name: 'User directory exists',
        fn: async (page) => {
          await page.waitForSelector('text=Users, text=Directory', { timeout: 10000 });
        }
      },
      {
        name: 'Search functionality exists',
        fn: async (page) => {
          await page.waitForSelector('[placeholder*="Search"], input[type="search"]', { timeout: 5000 });
        }
      }
    ]);
    
    // ========================================================================
    // PHASE 3: Week 2 Pages
    // ========================================================================
    
    info('\n🔧 Testing Week 2 Pages (Phase 3)...');
    
    // 5. Webhook Configuration Page
    await testPage(browser, 'Webhook Configuration', '/admin/webhooks', [
      {
        name: 'Webhooks list exists',
        fn: async (page) => {
          await page.waitForSelector('text=Webhooks, text=Webhook', { timeout: 10000 });
        }
      },
      {
        name: 'Create webhook button exists',
        fn: async (page) => {
          await page.waitForSelector('button:has-text("Create"), button:has-text("Add"), button:has-text("New")', { timeout: 5000 });
        }
      },
      {
        name: 'Stats cards exist',
        fn: async (page) => {
          await page.waitForSelector('text=Total, text=Active', { timeout: 5000 });
        }
      }
    ]);
    
    // 6. Alert Management Page
    await testPage(browser, 'Alert Management', '/admin/alerts', [
      {
        name: 'Alerts list exists',
        fn: async (page) => {
          await page.waitForSelector('text=Alerts, text=Alert', { timeout: 10000 });
        }
      },
      {
        name: 'Alert rules section exists',
        fn: async (page) => {
          await page.waitForSelector('text=Rules, text=Alert Rules', { timeout: 5000 });
        }
      },
      {
        name: 'Stats dashboard exists',
        fn: async (page) => {
          await page.waitForSelector('text=Total, text=Active', { timeout: 5000 });
        }
      }
    ]);
    
    // ========================================================================
    // PHASE 4: Week 3 Pages
    // ========================================================================
    
    info('\n🚀 Testing Week 3 Pages (Phase 4)...');
    
    // 7. Change Management Page
    await testPage(browser, 'Change Management', '/admin/changes', [
      {
        name: 'Changes list exists',
        fn: async (page) => {
          await page.waitForSelector('text=Changes, text=Change', { timeout: 10000 });
        }
      },
      {
        name: 'Create change button exists',
        fn: async (page) => {
          await page.waitForSelector('button:has-text("Create"), button:has-text("New Change")', { timeout: 5000 });
        }
      },
      {
        name: 'Stats cards exist',
        fn: async (page) => {
          await page.waitForSelector('text=Total, text=New', { timeout: 5000 });
        }
      },
      {
        name: 'View toggle exists (List/Calendar)',
        fn: async (page) => {
          await page.waitForSelector('text=List, text=Calendar', { timeout: 5000 });
        }
      },
      {
        name: 'Filter panel exists',
        fn: async (page) => {
          await page.waitForSelector('select, [role="combobox"]', { timeout: 5000 });
        }
      }
    ]);
    
    // 8. Workflow Builder Page
    await testPage(browser, 'Workflow Builder', '/admin/workflows', [
      {
        name: 'Workflows list exists',
        fn: async (page) => {
          await page.waitForSelector('text=Workflows, text=Workflow', { timeout: 10000 });
        }
      },
      {
        name: 'Create workflow button exists',
        fn: async (page) => {
          await page.waitForSelector('button:has-text("Create"), button:has-text("New Workflow")', { timeout: 5000 });
        }
      },
      {
        name: 'Tab navigation exists',
        fn: async (page) => {
          await page.waitForSelector('text=Templates, text=Executions, text=Analytics', { timeout: 5000 });
        }
      },
      {
        name: 'System status exists',
        fn: async (page) => {
          await page.waitForSelector('text=System, text=Status, text=Health', { timeout: 5000 });
        }
      }
    ]);
    
    // 9. Approval Queue Page
    await testPage(browser, 'Approval Queue', '/admin/approvals', [
      {
        name: 'Approvals list exists',
        fn: async (page) => {
          await page.waitForSelector('text=Approvals, text=Approval, text=Queue', { timeout: 10000 });
        }
      },
      {
        name: 'Stats cards exist',
        fn: async (page) => {
          await page.waitForSelector('text=Pending, text=Total', { timeout: 5000 });
        }
      },
      {
        name: 'Filter buttons exist',
        fn: async (page) => {
          await page.waitForSelector('button:has-text("All"), button:has-text("High")', { timeout: 5000 });
        }
      },
      {
        name: 'Auto-refresh indicator exists',
        fn: async (page) => {
          await page.waitForSelector('text=Auto-refresh, text=Refresh, svg', { timeout: 5000 });
        }
      }
    ]);
    
  } catch (err) {
    error(`\n❌ Test suite error: ${err.message}`);
  } finally {
    await browser.close();
  }
  
  // ========================================================================
  // Print Summary
  // ========================================================================
  
  log('\n' + '='.repeat(80), 'blue');
  log('📊 Test Results Summary', 'blue');
  log('='.repeat(80) + '\n', 'blue');
  
  log(`Total Tests:  ${results.total}`, 'cyan');
  log(`✅ Passed:     ${results.passed}`, 'green');
  log(`❌ Failed:     ${results.failed}`, 'red');
  log(`⚠️  Skipped:    ${results.skipped}`, 'yellow');
  log(`\nSuccess Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 'cyan');
  
  if (results.failed > 0) {
    log('\n' + '='.repeat(80), 'red');
    log('Failed Tests:', 'red');
    log('='.repeat(80) + '\n', 'red');
    
    results.tests
      .filter(t => t.status === 'failed')
      .forEach(t => {
        error(`${t.name} ${t.details}`);
      });
  }
  
  log('\n' + '='.repeat(80), 'blue');
  
  // Exit with error code if tests failed
  if (results.failed > 0) {
    process.exit(1);
  } else {
    success('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch((err) => {
  error(`\n❌ Fatal error: ${err.message}`);
  process.exit(1);
});
