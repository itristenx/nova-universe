#!/usr/bin/env node

/**
 * Test Graceful Exit Validation Script
 * Validates that all test files exit gracefully without hanging processes
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const TEST_TIMEOUT = 30000; // 30 seconds max per test
const TEST_DIR = './test';

// List of test files to validate
const TEST_FILES = [
  'simple.test.js',
  'integration-testing.test.js',
  'performance-testing.test.js',
  'load-testing.test.js',
  'security-testing.test.js',
  'user-acceptance-testing.test.js',
];

class TestValidator {
  constructor() {
    this.results = [];
    this.activeProcesses = new Set();
  }

  async validateTestFile(testFile) {
    console.log(`🧪 Validating ${testFile}...`);

    return new Promise((resolve) => {
      const startTime = Date.now();
      const testPath = path.join(TEST_DIR, testFile);

      const child = spawn('node', ['--test', testPath], {
        env: {
          ...process.env,
          NODE_OPTIONS: '--experimental-vm-modules',
          TEST_API_URL: 'http://localhost:3000',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.activeProcesses.add(child);

      let output = '';
      let error = '';
      let timedOut = false;

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      // Timeout handler
      const timeout = setTimeout(() => {
        timedOut = true;
        console.log(`   ⏱️  ${testFile} timed out - attempting graceful termination`);

        // Try SIGTERM first
        child.kill('SIGTERM');

        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (!child.killed) {
            console.log(`   🔥 Force killing ${testFile}`);
            child.kill('SIGKILL');
          }
        }, 5000);
      }, TEST_TIMEOUT);

      child.on('close', (code, signal) => {
        clearTimeout(timeout);
        this.activeProcesses.delete(child);

        const duration = Date.now() - startTime;
        const result = {
          file: testFile,
          exitCode: code,
          signal: signal,
          duration: duration,
          timedOut: timedOut,
          output: output,
          error: error,
          graceful: !timedOut && (code === 0 || code === 1), // 0 = success, 1 = test failure (but graceful)
        };

        if (result.graceful) {
          console.log(`   ✅ ${testFile} exited gracefully (${duration}ms, code: ${code})`);
        } else if (timedOut) {
          console.log(`   ❌ ${testFile} hung and required forced termination`);
        } else {
          console.log(`   ⚠️  ${testFile} exited unexpectedly (code: ${code}, signal: ${signal})`);
        }

        this.results.push(result);
        resolve(result);
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        this.activeProcesses.delete(child);

        const result = {
          file: testFile,
          error: err.message,
          duration: Date.now() - startTime,
          graceful: false,
          timedOut: false,
        };

        console.log(`   ❌ ${testFile} failed to start: ${err.message}`);
        this.results.push(result);
        resolve(result);
      });
    });
  }

  async validateAllTests() {
    console.log('🧪 Starting Test Graceful Exit Validation');
    console.log('=' * 60);

    for (const testFile of TEST_FILES) {
      const testPath = path.join(TEST_DIR, testFile);

      try {
        await fs.access(testPath);
        await this.validateTestFile(testFile);
      } catch (error) {
        console.log(`   ⏭️  Skipping ${testFile} (file not found)`);
        this.results.push({
          file: testFile,
          skipped: true,
          reason: 'File not found',
        });
      }
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 GRACEFUL EXIT VALIDATION REPORT');
    console.log('='.repeat(60));

    const totalTests = this.results.length;
    const gracefulTests = this.results.filter((r) => r.graceful).length;
    const timedOutTests = this.results.filter((r) => r.timedOut).length;
    const skippedTests = this.results.filter((r) => r.skipped).length;
    const errorTests = this.results.filter((r) => r.error && !r.timedOut).length;

    console.log(`\n📈 Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Graceful Exits: ${gracefulTests} ✅`);
    console.log(`   Timed Out: ${timedOutTests} ❌`);
    console.log(`   Errors: ${errorTests} ⚠️`);
    console.log(`   Skipped: ${skippedTests} ⏭️`);

    const successRate = totalTests > 0 ? (gracefulTests / (totalTests - skippedTests)) * 100 : 0;
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);

    console.log(`\n📋 Detailed Results:`);
    for (const result of this.results) {
      if (result.skipped) {
        console.log(`   ⏭️  ${result.file} - Skipped (${result.reason})`);
      } else if (result.graceful) {
        console.log(`   ✅ ${result.file} - Graceful (${result.duration}ms)`);
      } else if (result.timedOut) {
        console.log(`   ❌ ${result.file} - Hung and required forced termination`);
      } else if (result.error) {
        console.log(`   ⚠️  ${result.file} - Error: ${result.error}`);
      } else {
        console.log(`   ⚠️  ${result.file} - Unexpected exit (code: ${result.exitCode})`);
      }
    }

    console.log(`\n🎯 Assessment:`);
    if (successRate >= 95) {
      console.log('   🌟 EXCELLENT - All tests exit gracefully');
    } else if (successRate >= 80) {
      console.log('   👍 GOOD - Most tests exit gracefully');
    } else if (successRate >= 60) {
      console.log('   ⚠️  NEEDS IMPROVEMENT - Some tests hang');
    } else {
      console.log('   ❌ POOR - Many tests hanging or failing to exit');
    }

    if (timedOutTests > 0) {
      console.log('\n🔧 Recommendations:');
      console.log('   • Review hanging tests for unclosed resources');
      console.log('   • Ensure proper cleanup of timeouts, intervals, and connections');
      console.log('   • Add explicit process.exit() calls if necessary');
      console.log('   • Check for unhandled promises or event listeners');
    }

    console.log('\n' + '='.repeat(60));

    return successRate;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up validation processes...');

    const cleanupPromises = Array.from(this.activeProcesses).map((process) => {
      return new Promise((resolve) => {
        if (process.killed) {
          resolve();
          return;
        }

        const timeout = setTimeout(() => {
          process.kill('SIGKILL');
          resolve();
        }, 3000);

        process.once('close', () => {
          clearTimeout(timeout);
          resolve();
        });

        process.kill('SIGTERM');
      });
    });

    await Promise.all(cleanupPromises);
    this.activeProcesses.clear();
    console.log('✅ Validation cleanup completed');
  }
}

// Main execution
async function main() {
  const validator = new TestValidator();

  // Handle cleanup on exit
  process.on('SIGINT', async () => {
    await validator.cleanup();
    process.exit(130);
  });

  process.on('SIGTERM', async () => {
    await validator.cleanup();
    process.exit(143);
  });

  try {
    const successRate = await validator.validateAllTests();
    await validator.cleanup();

    // Exit with appropriate code
    process.exit(successRate >= 80 ? 0 : 1);
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    await validator.cleanup();
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TestValidator };
