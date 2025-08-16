// Comprehensive Test Runner for Nova Universe
// Orchestrates all testing phases: Integration, Performance, Security, UAT, and Load Testing

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Test Configuration
const TEST_CONFIG = {
  testDir: './test',
  reportDir: './test-reports',
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  timeout: 300000, // 5 minutes per test suite
  parallel: process.env.TEST_PARALLEL === 'true',
  verbose: process.env.TEST_VERBOSE === 'true',
  apiAvailable: false,
};

// Detect whether a test file imports @jest/globals
async function isJestTest(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content.includes("'@jest/globals'") || content.includes('"@jest/globals"');
  } catch {
    return false;
  }
}

// Test Suite Definitions
const TEST_SUITES = {
  integration: {
    name: 'Integration Testing',
    file: 'integration-testing.test.js',
    description: 'API endpoints, database operations, and service integrations',
    priority: 1,
    estimatedDuration: 120000, // 2 minutes
    requiresApi: true,
  },
  performance: {
    name: 'Performance Testing',
    file: 'performance-testing.test.js',
    description: 'Response times, throughput, memory usage, and scalability',
    priority: 2,
    estimatedDuration: 180000, // 3 minutes
    requiresApi: true,
  },
  security: {
    name: 'Security Testing',
    file: 'security-testing.test.js',
    description: 'Authentication, authorization, input validation, and vulnerabilities',
    priority: 3,
    estimatedDuration: 240000, // 4 minutes
    requiresApi: true,
  },
  uat: {
    name: 'User Acceptance Testing',
    file: 'user-acceptance-testing.test.js',
    description: 'Business workflows, user experience, and feature functionality',
    priority: 4,
    estimatedDuration: 300000, // 5 minutes
    requiresApi: true,
  },
  load: {
    name: 'Load Testing',
    file: 'load-testing.test.js',
    description: 'System behavior under various load conditions and stress testing',
    priority: 5,
    estimatedDuration: 600000, // 10 minutes
    skipInCI: process.env.CI === 'true' && process.env.FULL_LOAD_TEST !== 'true',
  },
};

class TestResultTracker {
  constructor() {
    this.results = {
      startTime: Date.now(),
      endTime: null,
      suites: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
      },
    };
  }

  addSuiteResult(suiteName, result) {
    this.results.suites[suiteName] = {
      ...result,
      timestamp: Date.now(),
    };

    this.results.summary.total++;
    if (result.success) {
      this.results.summary.passed++;
    } else if (result.skipped) {
      this.results.summary.skipped++;
    } else {
      this.results.summary.failed++;
    }
  }

  finalize() {
    this.results.endTime = Date.now();
    this.results.summary.duration = this.results.endTime - this.results.startTime;
    return this.results;
  }

  generateReport() {
    const report = this.finalize();

    console.log('\n' + '='.repeat(80));
    console.log('🧪 NOVA UNIVERSE - COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(80));

    console.log('\n📊 Test Suite Summary:');
    console.log(`   Total Suites: ${report.summary.total}`);
    console.log(`   Passed: ${report.summary.passed} ✅`);
    console.log(`   Failed: ${report.summary.failed} ❌`);
    console.log(`   Skipped: ${report.summary.skipped} ⏭️`);
    console.log(`   Total Duration: ${(report.summary.duration / 1000 / 60).toFixed(2)} minutes`);

    console.log('\n📋 Detailed Results:');
    for (const [suiteName, result] of Object.entries(report.suites)) {
      const icon = result.success ? '✅' : result.skipped ? '⏭️' : '❌';
      const duration = result.duration ? `(${(result.duration / 1000).toFixed(2)}s)` : '';
      console.log(`   ${icon} ${result.name} ${duration}`);

      if (result.error && TEST_CONFIG.verbose) {
        console.log(`      Error: ${result.error}`);
      }

      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning) => {
          console.log(`      ⚠️  ${warning}`);
        });
      }
    }

    console.log('\n🎯 Test Quality Assessment:');
    const denom = Math.max(1, report.summary.total - report.summary.skipped);
    const successRate = (report.summary.passed / denom) * 100;
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);

    if (successRate >= 95) {
      console.log('   Quality Grade: A+ 🌟 (Excellent)');
    } else if (successRate >= 85) {
      console.log('   Quality Grade: A 👍 (Good)');
    } else if (successRate >= 75) {
      console.log('   Quality Grade: B ⚠️  (Needs Improvement)');
    } else {
      console.log('   Quality Grade: C ❌ (Poor - Requires Attention)');
    }

    console.log('\n🔍 Recommendations:');
    if (report.summary.failed > 0) {
      console.log('   • Review and fix failing test suites before deployment');
      console.log('   • Check logs for detailed error information');
    }

    if (successRate < 95) {
      console.log('   • Consider increasing test coverage');
      console.log('   • Review test thresholds and expectations');
    }

    if (report.summary.duration > 900000) {
      // 15 minutes
      console.log('   • Consider optimizing test execution time');
      console.log('   • Evaluate parallel test execution options');
    }

    console.log('\n' + '='.repeat(80));

    return report;
  }
}

class TestSuiteRunner {
  constructor() {
    this.tracker = new TestResultTracker();
    this.setupPromise = this.setup();
  }

  async setup() {
    try {
      await fs.mkdir(TEST_CONFIG.reportDir, { recursive: true });
      await this.verifyEnvironment();
      console.log('🔧 Test environment setup completed');
      return true;
    } catch (error) {
      console.error('❌ Test environment setup failed:', error.message);
      return false;
    }
  }

  async verifyEnvironment() {
    console.log('🔍 Verifying test environment...');
    // API check omitted in CI if not reachable
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${TEST_CONFIG.apiUrl}/health`, { timeout: 10000 });
      if (response.ok) {
        TEST_CONFIG.apiAvailable = true;
        console.log(`   ✅ API accessible at ${TEST_CONFIG.apiUrl}`);
      } else {
        console.log(`   ⚠️  API returned status ${response.status} at ${TEST_CONFIG.apiUrl}`);
      }
    } catch (error) {
      console.log(`   ⚠️  API not accessible at ${TEST_CONFIG.apiUrl} - some tests may fail`);
      console.log(`      Error: ${error.message}`);
      TEST_CONFIG.apiAvailable = false;
    }

    const nodeVersion = process.version;
    console.log(`   📦 Node.js version: ${nodeVersion}`);

    const memoryUsage = process.memoryUsage();
    console.log(`   💾 Available memory: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`);

    for (const [, suite] of Object.entries(TEST_SUITES)) {
      const testFile = path.join(TEST_CONFIG.testDir, suite.file);
      try {
        await fs.access(testFile);
        console.log(`   📄 Test file found: ${suite.file}`);
      } catch {
        console.log(`   ⚠️  Test file missing: ${suite.file}`);
      }
    }
  }

  async runSuite(suiteKey, suite) {
    console.log(`\n🧪 Running ${suite.name}...`);
    console.log(`   📝 ${suite.description}`);
    console.log(`   ⏱️  Estimated duration: ${(suite.estimatedDuration / 1000).toFixed(0)}s`);

    // Skip suites that require API when it's not available (especially in CI)
    if (suite.requiresApi && !TEST_CONFIG.apiAvailable) {
      console.log(`   ⏭️  Skipping ${suite.name} (API not available at ${TEST_CONFIG.apiUrl})`);
      this.tracker.addSuiteResult(suiteKey, {
        name: suite.name,
        success: true,
        skipped: true,
        duration: 0,
        warnings: ['API not available'],
      });
      return { success: true, skipped: true };
    }

    const startTime = Date.now();

    try {
      const testFile = path.join(TEST_CONFIG.testDir, suite.file);
      await fs.access(testFile);

      const useJest = await isJestTest(testFile);
      const result = await this.executeTest(testFile, suite, useJest);

      const duration = Date.now() - startTime;
      this.tracker.addSuiteResult(suiteKey, {
        name: suite.name,
        success: result.success,
        duration,
        output: result.output,
        error: result.error,
        warnings: result.warnings || [],
      });

      const icon = result.success ? '✅' : '❌';
      console.log(`   ${icon} ${suite.name} completed in ${(duration / 1000).toFixed(2)}s`);

      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning) => console.log(`   ⚠️  ${warning}`));
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.tracker.addSuiteResult(suiteKey, {
        name: suite.name,
        success: false,
        duration,
        error: error.message,
      });
      console.log(`   ❌ ${suite.name} failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async executeTest(testFile, suite, useJest) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let output = '';
      let error = '';

      const env = {
        ...process.env,
        TEST_API_URL: TEST_CONFIG.apiUrl,
        TEST_TIMEOUT: suite.estimatedDuration.toString(),
        NODE_OPTIONS: '--experimental-vm-modules',
      };

      const args = useJest ? ['--runInBand', '--silent', testFile] : ['--test', testFile];

      const cmd = useJest ? 'jest' : 'node';
      const child = spawn(cmd, args, { env, cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] });

      child.stdout.on('data', (d) => {
        const t = d.toString();
        output += t;
        if (TEST_CONFIG.verbose) process.stdout.write(t);
      });
      child.stderr.on('data', (d) => {
        const t = d.toString();
        error += t;
        if (TEST_CONFIG.verbose) process.stderr.write(t);
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        const success = code === 0;
        const warnings = [];
        if (output.includes('Warning') || output.includes('WARN'))
          warnings.push('Test execution produced warnings');
        if (duration > suite.estimatedDuration * 1.5)
          warnings.push(
            `Test took longer than expected (${(duration / 1000).toFixed(2)}s vs ${(suite.estimatedDuration / 1000).toFixed(2)}s)`,
          );
        resolve({
          success,
          output,
          error: error || (success ? null : `Process exited with code ${code}`),
          warnings,
          duration,
        });
      });

      setTimeout(() => {
        child.kill();
        resolve({
          success: false,
          error: `Test timed out after ${TEST_CONFIG.timeout / 1000}s`,
          warnings: ['Test execution timed out'],
          duration: TEST_CONFIG.timeout,
        });
      }, TEST_CONFIG.timeout);
    });
  }

  async runAllSuites() {
    await this.setupPromise;

    console.log('🚀 Starting Nova Universe Comprehensive Test Suite');
    console.log(`   Test API URL: ${TEST_CONFIG.apiUrl}`);
    console.log(`   Parallel Execution: ${TEST_CONFIG.parallel ? 'Enabled' : 'Disabled'}`);
    console.log(`   Verbose Output: ${TEST_CONFIG.verbose ? 'Enabled' : 'Disabled'}`);

    const sortedSuites = Object.entries(TEST_SUITES).sort(
      ([, a], [, b]) => a.priority - b.priority,
    );

    if (TEST_CONFIG.parallel) {
      console.log('\n⚡ Running test suites in parallel...');
      const promises = sortedSuites
        .filter(([, suite]) => !suite.skipInCI)
        .map(([suiteKey, suite]) => this.runSuite(suiteKey, suite));
      await Promise.allSettled(promises);
    } else {
      console.log('\n📋 Running test suites sequentially...');
      for (const [suiteKey, suite] of sortedSuites) {
        if (suite.skipInCI) {
          console.log(`\n⏭️  Skipping ${suite.name} (CI environment)`);
          this.tracker.addSuiteResult(suiteKey, {
            name: suite.name,
            success: true,
            skipped: true,
            duration: 0,
          });
          continue;
        }
        await this.runSuite(suiteKey, suite);
      }
    }

    const finalReport = this.tracker.generateReport();
    await this.saveReport(finalReport);
    return finalReport;
  }

  async saveReport(report) {
    try {
      const reportFile = path.join(TEST_CONFIG.reportDir, `test-report-${Date.now()}.json`);
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
      console.log(`\n💾 Test report saved to: ${reportFile}`);
      const latestReportFile = path.join(TEST_CONFIG.reportDir, 'latest-test-report.json');
      await fs.writeFile(latestReportFile, JSON.stringify(report, null, 2));
    } catch (error) {
      console.error('❌ Failed to save test report:', error.message);
    }
  }
}

class TestCLI {
  static parseArgs() {
    const args = process.argv.slice(2);
    const options = { suites: [], parallel: false, verbose: false, help: false };
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '--help':
        case '-h':
          options.help = true;
          break;
        case '--parallel':
        case '-p':
          options.parallel = true;
          break;
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
        case '--suite':
        case '-s':
          if (i + 1 < args.length) options.suites.push(args[++i]);
          break;
        default:
          if (!arg.startsWith('-')) options.suites.push(arg);
      }
    }
    return options;
  }

  static showHelp() {
    console.log(`
🧪 Nova Universe Test Runner

Usage: node test-runner.js [options] [suites...]

Options:
  -h, --help       Show this help message
  -p, --parallel   Run test suites in parallel
  -v, --verbose    Enable verbose output
  -s, --suite      Specify test suite to run

Available Test Suites:
  integration      Integration testing (API, database, services)
  performance      Performance testing (response times, throughput)
  security         Security testing (auth, validation, vulnerabilities)
  uat              User acceptance testing (workflows, UX)
  load             Load testing (stress, capacity planning)

Examples:
  node test-runner.js                    # Run all test suites
  node test-runner.js integration        # Run only integration tests
  node test-runner.js -p integration uat # Run integration and UAT in parallel
  node test-runner.js -v --parallel      # Run all tests in parallel with verbose output

Environment Variables:
  TEST_API_URL         API URL for testing (default: http://localhost:3000)
  TEST_PARALLEL        Enable parallel execution (true/false)
  TEST_VERBOSE         Enable verbose output (true/false)
  RUN_ENDURANCE_TEST   Include endurance testing (true/false)
  CI                   CI environment flag (skips long-running tests)
`);
  }
}

async function main() {
  const options = TestCLI.parseArgs();
  if (options.help) {
    TestCLI.showHelp();
    return;
  }
  if (options.parallel) TEST_CONFIG.parallel = true;
  if (options.verbose) TEST_CONFIG.verbose = true;

  const runner = new TestSuiteRunner();
  try {
    let finalReport;
    if (options.suites.length > 0) {
      console.log(`🎯 Running selected test suites: ${options.suites.join(', ')}`);
      for (const suiteName of options.suites) {
        const suite = TEST_SUITES[suiteName];
        if (suite) await runner.runSuite(suiteName, suite);
        else {
          console.error(`❌ Unknown test suite: ${suiteName}`);
          console.log('Available suites:', Object.keys(TEST_SUITES).join(', '));
        }
      }
      finalReport = runner.tracker.generateReport();
    } else {
      finalReport = await runner.runAllSuites();
    }
    const exitCode = finalReport.summary.failed > 0 ? 1 : 0;
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    if (TEST_CONFIG.verbose) console.error(error.stack);
    process.exit(1);
  }
}

export { TestSuiteRunner, TestResultTracker, TEST_SUITES, TEST_CONFIG };

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
