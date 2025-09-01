#!/usr/bin/env node

/**
 * Comprehensive UI Test Runner for Nova Universe
 * Runs all UI tests with proper setup, reporting, and cleanup
 */

const { execSync } = require('child_process');
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

class UITestRunner {
  constructor() {
    this.config = this.loadConfig();
    this.testSuites = this.getTestSuites();
  }

  loadConfig() {
    return {
      baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',
      apiURL: process.env.TEST_API_URL || 'http://localhost:3000',
      databaseURL: process.env.TEST_DATABASE_URL || 'postgresql://nova_admin:nova_password@localhost:5432/nova_universe_test',
      testUser: {
        email: process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        password: process.env.TEST_USER_PASSWORD || 'TestUser123!',
      },
      testAdmin: {
        email: process.env.TEST_ADMIN_EMAIL || 'admin@nova.com',
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
      },
      timeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
      retries: parseInt(process.env.TEST_RETRIES || '2'),
      workers: parseInt(process.env.TEST_WORKERS || '1'),
    };
  }

  getTestSuites() {
    return [
      {
        name: 'authentication',
        pattern: 'tests/auth/**/*.spec.ts',
        description: 'Authentication and authorization tests',
        tags: ['auth', 'security'],
      },
      {
        name: 'database',
        pattern: 'tests/database/**/*.spec.ts',
        description: 'Database connectivity and integration tests',
        tags: ['database', 'integration'],
        timeout: 60000,
      },
      {
        name: 'api-health',
        pattern: 'tests/api/comprehensive-api-health.spec.ts',
        description: 'Comprehensive API health and integration tests',
        tags: ['api', 'health', 'integration'],
      },
      {
        name: 'api-integration',
        pattern: 'tests/api/api-integration.spec.ts',
        description: 'API integration tests',
        tags: ['api', 'integration'],
      },
      {
        name: 'dashboard',
        pattern: 'tests/dashboard/**/*.spec.ts',
        description: 'Dashboard and navigation tests',
        tags: ['ui', 'dashboard'],
      },
      {
        name: 'tickets',
        pattern: 'tests/tickets/**/*.spec.ts',
        description: 'Ticket management tests',
        tags: ['tickets', 'crud'],
      },
      {
        name: 'workflows',
        pattern: 'tests/workflows/**/*.spec.ts',
        description: 'End-to-end user workflow tests',
        tags: ['e2e', 'workflows'],
        timeout: 120000,
      },
      {
        name: 'accessibility',
        pattern: 'tests/accessibility/**/*.spec.ts',
        description: 'Accessibility compliance tests (WCAG 2.1)',
        tags: ['accessibility', 'a11y'],
        timeout: 90000,
      },
      {
        name: 'performance',
        pattern: 'tests/performance/**/*.spec.ts',
        description: 'Performance and load tests',
        tags: ['performance', 'load'],
        timeout: 180000,
      },
      {
        name: 'mobile',
        pattern: 'tests/mobile/**/*.spec.ts',
        description: 'Mobile and responsive design tests',
        tags: ['mobile', 'responsive'],
        timeout: 120000,
      },
      {
        name: 'security',
        pattern: 'tests/security/**/*.spec.ts',
        description: 'Security testing and vulnerability assessment',
        tags: ['security'],
        timeout: 120000,
      },
    ];
  }

  async runTests(options = {}) {
    console.log('🚀 Starting Nova Universe UI Test Suite');
    console.log('==========================================');

    // Setup environment
    if (!options.skipSetup) {
      await this.setupTestEnvironment();
    }

    // Determine which tests to run
    const suitesToRun = this.determineSuitesToRun(options.suites, options.tags);
    
    console.log(`📋 Running ${suitesToRun.length} test suite(s):`);
    suitesToRun.forEach(suite => {
      console.log(`  • ${suite.name}: ${suite.description}`);
    });
    console.log('');

    // Create test results directory
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!existsSync(resultsDir)) {
      mkdirSync(resultsDir, { recursive: true });
    }

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    const suiteResults = [];

    // Run each test suite
    for (const suite of suitesToRun) {
      console.log(`🧪 Running ${suite.name} tests...`);
      
      const result = await this.runTestSuite(suite, {
        headed: options.headed,
        debug: options.debug,
        workers: options.workers || this.config.workers,
        retries: options.retries || this.config.retries,
        timeout: options.timeout || suite.timeout || this.config.timeout,
      });

      suiteResults.push(result);
      totalTests += result.total;
      passedTests += result.passed;
      failedTests += result.failed;

      console.log(`  ${result.passed}/${result.total} tests passed\n`);
    }

    // Generate comprehensive report
    if (options.generateReport !== false) {
      await this.generateReport(suiteResults, {
        totalTests,
        passedTests,
        failedTests,
      });
    }

    // Print summary
    this.printSummary(suiteResults, { totalTests, passedTests, failedTests });

    // Cleanup
    await this.cleanup();

    // Exit with appropriate code
    process.exit(failedTests > 0 ? 1 : 0);
  }

  determineSuitesToRun(suites, tags) {
    let filteredSuites = this.testSuites;

    // Filter by specific suites
    if (suites && suites.length > 0) {
      filteredSuites = filteredSuites.filter(suite =>
        suites.includes(suite.name)
      );
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filteredSuites = filteredSuites.filter(suite =>
        tags.some(tag => suite.tags.includes(tag))
      );
    }

    return filteredSuites;
  }

  async setupTestEnvironment() {
    console.log('🔧 Setting up test environment...');

    // Helper for fetch with timeout
    async function fetchWithTimeout(url, timeoutMs) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        return response;
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }
    }

    // Check if UI server is running
    try {
      const response = await fetchWithTimeout(this.config.baseURL, 5000);
      if (!response.ok) {
        throw new Error(`UI server not responding: ${response.status}`);
      }
      console.log('  ✅ UI server is running');
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('  ⚠️ UI server check timed out');
      } else {
        console.log('  ⚠️ UI server is not running');
      }
      console.log('  Please ensure the UI server is running at:', this.config.baseURL);
    }

    // Check API server
    try {
      const response = await fetchWithTimeout(`${this.config.apiURL}/health`, 5000);
      if (!response.ok) {
        throw new Error(`API server not responding: ${response.status}`);
      }
      console.log('  ✅ API server is running');
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('  ⚠️ API server check timed out');
      } else {
        console.log('  ⚠️ API server is not running');
      }
      console.log('  Some tests may be skipped');
    }

    // Install Playwright browsers if needed
    try {
      const playwrightTimeout = parseInt(process.env.PLAYWRIGHT_INSTALL_TIMEOUT || '300000');
      execSync('npx playwright install --with-deps', { 
        stdio: 'pipe',
        timeout: playwrightTimeout
      });
      console.log(`  ✅ Playwright browsers are ready (timeout: ${playwrightTimeout} ms)`);
    } catch (error) {
      console.log('  ⚠️ Could not install Playwright browsers');
    }

    // Create test environment file
    this.createTestEnvFile();

    console.log('✅ Test environment setup complete\n');
  }

  createTestEnvFile() {
    const envContent = `
# Test Environment Configuration
TEST_BASE_URL=${this.config.baseURL}
TEST_API_URL=${this.config.apiURL}
TEST_DATABASE_URL=${this.config.databaseURL}
TEST_USER_EMAIL=${this.config.testUser.email}
TEST_USER_PASSWORD=${this.config.testUser.password}
TEST_ADMIN_EMAIL=${this.config.testAdmin.email}
TEST_ADMIN_PASSWORD=${this.config.testAdmin.password}
TEST_TIMEOUT=${this.config.timeout}
TEST_RETRIES=${this.config.retries}
TEST_WORKERS=${this.config.workers}
`.trim();

    writeFileSync('.env.test.local', envContent);
  }

  async runTestSuite(suite, options) {
    const startTime = Date.now();
    
    try {
      const command = this.buildPlaywrightCommand(suite, options);
      
      console.log(`  Running: ${command}`);
      
      const output = execSync(command, {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: options.timeout + 30000, // Add buffer
        env: {
          ...process.env,
          ...this.getTestEnvironmentVariables(),
        },
      });

      const result = this.parseTestOutput(output);
      
      return {
        name: suite.name,
        passed: result.passed,
        failed: result.failed,
        total: result.total,
        duration: Date.now() - startTime,
        errors: result.errors,
      };
    } catch (error) {
      console.error(`❌ Test suite ${suite.name} failed:`, error.message);
      
      return {
        name: suite.name,
        passed: 0,
        failed: 1,
        total: 1,
        duration: Date.now() - startTime,
        errors: [error.message],
      };
    }
  }

  buildPlaywrightCommand(suite, options) {
    const baseCommand = 'npx playwright test';
    const args = [
      `"${suite.pattern}"`,
      `--workers=${options.workers}`,
      `--retries=${options.retries}`,
      `--timeout=${options.timeout}`,
      '--reporter=json',
      `--output-dir=test-results/${suite.name}`,
    ];

    if (options.headed) {
      args.push('--headed');
    }

    if (options.debug) {
      args.push('--debug');
    }

    return `${baseCommand} ${args.join(' ')}`;
  }

  getTestEnvironmentVariables() {
    return {
      TEST_BASE_URL: this.config.baseURL,
      TEST_API_URL: this.config.apiURL,
      TEST_DATABASE_URL: this.config.databaseURL,
      TEST_USER_EMAIL: this.config.testUser.email,
      TEST_USER_PASSWORD: this.config.testUser.password,
      TEST_ADMIN_EMAIL: this.config.testAdmin.email,
      TEST_ADMIN_PASSWORD: this.config.testAdmin.password,
    };
  }

  parseTestOutput(output) {
    try {
      // Try to parse JSON output
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        const passed = result.stats?.passed || 0;
        const failed = result.stats?.failed || 0;
        const total = passed + failed;
        
        const errors = result.errors || [];
        
        return { passed, failed, total, errors };
      }
    } catch (parseError) {
      console.log('Could not parse test output as JSON, using fallback parsing');
    }

    // Fallback text parsing
    const passedMatch = output.match(/(\d+) passed/);
    const failedMatch = output.match(/(\d+) failed/);
    
    const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
    const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
    const total = passed + failed;
    
    const errors = [];
    const errorMatches = output.match(/Error: .+/g);
    if (errorMatches) {
      errors.push(...errorMatches);
    }

    return { passed, failed, total, errors };
  }

  async generateReport(suiteResults, summary) {
    console.log('📊 Generating comprehensive test report...');

    const reportData = {
      timestamp: new Date().toISOString(),
      config: this.config,
      summary,
      suites: suiteResults,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };

    // Generate JSON report
    const jsonReport = JSON.stringify(reportData, null, 2);
    writeFileSync('test-results/comprehensive-report.json', jsonReport);

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(reportData);
    writeFileSync('test-results/comprehensive-report.html', htmlReport);

    // Generate markdown summary
    const markdownReport = this.generateMarkdownReport(reportData);
    writeFileSync('test-results/test-summary.md', markdownReport);

    console.log('  ✅ Reports generated in test-results/');
  }

  generateHTMLReport(data) {
    const passRate = (data.summary.passedTests / data.summary.totalTests * 100).toFixed(1);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Nova Universe UI Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }
        .suite { margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .tag { background: #007cba; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Nova Universe UI Test Report</h1>
        <p>Generated: ${data.timestamp}</p>
        <p>Pass Rate: <strong>${passRate}%</strong></p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <p>${data.summary.totalTests}</p>
        </div>
        <div class="metric">
            <h3 class="passed">Passed</h3>
            <p>${data.summary.passedTests}</p>
        </div>
        <div class="metric">
            <h3 class="failed">Failed</h3>
            <p>${data.summary.failedTests}</p>
        </div>
    </div>

    <h2>Test Suites</h2>
    ${data.suites.map((suite) => `
        <div class="suite">
            <h3>${suite.name}</h3>
            <p>Duration: ${(suite.duration / 1000).toFixed(1)}s</p>
            <p>
                <span class="passed">${suite.passed} passed</span> | 
                <span class="failed">${suite.failed} failed</span> | 
                ${suite.total} total
            </p>
            ${suite.errors.length > 0 ? `
                <details>
                    <summary>Errors (${suite.errors.length})</summary>
                    <ul>
                        ${suite.errors.map((error) => `<li>${error}</li>`).join('')}
                    </ul>
                </details>
            ` : ''}
        </div>
    `).join('')}

    <h2>Configuration</h2>
    <pre>${JSON.stringify(data.config, null, 2)}</pre>
</body>
</html>
    `.trim();
  }

  generateMarkdownReport(data) {
    const passRate = (data.summary.passedTests / data.summary.totalTests * 100).toFixed(1);
    
    return `
# 🧪 Nova Universe UI Test Report

**Generated:** ${data.timestamp}  
**Pass Rate:** ${passRate}%

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | ${data.summary.totalTests} |
| Passed | ${data.summary.passedTests} ✅ |
| Failed | ${data.summary.failedTests} ❌ |

## Test Suites

${data.suites.map((suite) => `
### ${suite.name}

- **Duration:** ${(suite.duration / 1000).toFixed(1)}s
- **Results:** ${suite.passed} passed, ${suite.failed} failed, ${suite.total} total

${suite.errors.length > 0 ? `
**Errors:**
${suite.errors.map((error) => `- ${error}`).join('\n')}
` : '✅ No errors'}
`).join('')}

## Configuration

\`\`\`json
${JSON.stringify(data.config, null, 2)}
\`\`\`
    `.trim();
  }

  printSummary(suiteResults, summary) {
    console.log('\n==========================================');
    console.log('🏁 TEST EXECUTION COMPLETE');
    console.log('==========================================');
    console.log(`📊 Total Tests: ${summary.totalTests}`);
    console.log(`✅ Passed: ${summary.passedTests}`);
    console.log(`❌ Failed: ${summary.failedTests}`);
    console.log(`📈 Pass Rate: ${(summary.passedTests / summary.totalTests * 100).toFixed(1)}%`);
    console.log('');

    if (summary.failedTests > 0) {
      console.log('❌ FAILED TEST SUITES:');
      suiteResults
        .filter(suite => suite.failed > 0)
        .forEach(suite => {
          console.log(`  • ${suite.name}: ${suite.failed} failed`);
        });
      console.log('');
    }

    console.log('📁 Test reports available in: test-results/');
    console.log('==========================================\n');
  }

  async cleanup() {
    console.log('🧹 Cleaning up test environment...');
    
    // Remove temporary files
    try {
      execSync('rm -f .env.test.local', { stdio: 'pipe' });
    } catch (error) {
      // Ignore cleanup errors
    }

    console.log('✅ Cleanup complete');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new UITestRunner();

  // Parse command line arguments
  const options = {
    suites: [],
    tags: [],
    headed: false,
    debug: false,
    generateReport: true,
    skipSetup: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--suites':
        if (nextArg) {
          options.suites = nextArg.split(',');
          i++;
        }
        break;
      case '--tags':
        if (nextArg) {
          options.tags = nextArg.split(',');
          i++;
        }
        break;
      case '--headed':
        options.headed = true;
        break;
      case '--debug':
        options.debug = true;
        break;
      case '--no-report':
        options.generateReport = false;
        break;
      case '--skip-setup':
        options.skipSetup = true;
        break;
      case '--workers':
        if (nextArg) {
          options.workers = parseInt(nextArg);
          i++;
        }
        break;
      case '--retries':
        if (nextArg) {
          options.retries = parseInt(nextArg);
          i++;
        }
        break;
      case '--timeout':
        if (nextArg) {
          options.timeout = parseInt(nextArg);
          i++;
        }
        break;
      case '--help':
        console.log(`
🧪 Nova Universe UI Test Runner

Usage: node ui-test-runner.js [options]

Options:
  --suites <list>     Comma-separated list of test suites to run
  --tags <list>       Comma-separated list of tags to filter tests
  --headed           Run tests in headed mode (visible browser)
  --debug            Run tests in debug mode
  --no-report        Skip generating test reports
  --skip-setup       Skip test environment setup
  --workers <n>      Number of parallel workers (default: 1)
  --retries <n>      Number of retries for failed tests (default: 2)
  --timeout <ms>     Test timeout in milliseconds (default: 30000)
  --help             Show this help message

Examples:
  node ui-test-runner.js                              # Run all tests
  node ui-test-runner.js --suites auth,dashboard     # Run specific suites
  node ui-test-runner.js --tags e2e,integration      # Run tests with specific tags
  node ui-test-runner.js --headed --debug            # Run in debug mode
  node ui-test-runner.js --workers 4 --retries 1    # Parallel execution

Available Test Suites:
  authentication  - Authentication and authorization tests
  database        - Database connectivity and integration tests  
  api-health      - Comprehensive API health and integration tests
  api-integration - API integration tests
  dashboard       - Dashboard and navigation tests
  tickets         - Ticket management tests
  workflows       - End-to-end user workflow tests
  accessibility   - Accessibility compliance tests
  performance     - Performance and load tests
  mobile          - Mobile and responsive design tests
  security        - Security testing

Available Tags:
  auth, security, database, integration, api, health, ui, dashboard,
  tickets, crud, e2e, workflows, accessibility, a11y, performance,
  load, mobile, responsive
        `);
        process.exit(0);
        break;
    }
  }

  try {
    await runner.runTests(options);
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = UITestRunner;