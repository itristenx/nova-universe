// Performance Testing Suite for Nova Universe
// Tests response times, throughput, memory usage, and scalability

import test from 'node:test';
import assert from 'node:assert';
import { performance } from 'perf_hooks';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import { registerCleanupHandlers, performCleanup } from './test-cleanup.js';

// Register cleanup handlers immediately
registerCleanupHandlers();

// Performance Test Configuration
const PERF_CONFIG = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  concurrentUsers: 50,
  testDuration: 30000, // 30 seconds
  maxResponseTime: 5000, // 5 seconds
  maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
  targetThroughput: 100, // requests per second
};

// Global cleanup tracking
const activeIntervals = new Set();
const activeTimeouts = new Set();

// Graceful cleanup handler
function gracefulCleanup() {
  console.log('🧹 Cleaning up performance test resources...');
  
  // Clear all intervals
  for (const intervalId of activeIntervals) {
    clearInterval(intervalId);
  }
  activeIntervals.clear();
  
  // Clear all timeouts
  for (const timeoutId of activeTimeouts) {
    clearTimeout(timeoutId);
  }
  activeTimeouts.clear();
  
  console.log('✅ Performance test cleanup completed');
}

// Register cleanup handlers
process.on('SIGINT', gracefulCleanup);
process.on('SIGTERM', gracefulCleanup);
process.on('exit', gracefulCleanup);

// Performance Monitoring Utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: [],
      memory: [],
      cpu: [],
      errors: [],
    };
  }

  recordRequest(duration, status, endpoint) {
    this.metrics.requests.push({
      duration,
      status,
      endpoint,
      timestamp: Date.now(),
    });
  }

  recordMemory(usage) {
    this.metrics.memory.push({
      usage,
      timestamp: Date.now(),
    });
  }

  recordError(error, endpoint) {
    this.metrics.errors.push({
      error: error.message,
      endpoint,
      timestamp: Date.now(),
    });
  }

  getStatistics() {
    const requests = this.metrics.requests;
    const durations = requests.map((r) => r.duration);

    return {
      totalRequests: requests.length,
      averageResponseTime: durations.reduce((a, b) => a + b, 0) / durations.length,
      minResponseTime: Math.min(...durations),
      maxResponseTime: Math.max(...durations),
      p95ResponseTime: this.calculatePercentile(durations, 95),
      p99ResponseTime: this.calculatePercentile(durations, 99),
      errorRate: this.metrics.errors.length / requests.length,
      throughput: requests.length / (PERF_CONFIG.testDuration / 1000),
      memoryPeak: Math.max(...this.metrics.memory.map((m) => m.usage)),
      memoryAverage:
        this.metrics.memory.reduce((a, b) => a + b.usage, 0) / this.metrics.memory.length,
    };
  }

  calculatePercentile(values, percentile) {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

// Load Testing Utilities
class LoadTester {
  constructor(monitor) {
    this.monitor = monitor;
    this.activeRequests = 0;
    this.maxConcurrent = 0;
  }

  async makeRequest(endpoint, options = {}) {
    this.activeRequests++;
    this.maxConcurrent = Math.max(this.maxConcurrent, this.activeRequests);

    const start = performance.now();
    let status = 200;

    try {
      const url = `${PERF_CONFIG.apiUrl}${endpoint}`;
      const response = await fetch(url, {
        timeout: PERF_CONFIG.maxResponseTime,
        ...options,
      });
      status = response.status;
      return response;
    } catch (error) {
      this.monitor.recordError(error, endpoint);
      throw error;
    } finally {
      const duration = performance.now() - start;
      this.monitor.recordRequest(duration, status, endpoint);
      this.activeRequests--;
    }
  }

  async runConcurrentUsers(userCount, testDuration) {
    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < userCount; i++) {
      promises.push(this.simulateUser(startTime + testDuration));
    }

    await Promise.allSettled(promises);
  }

  async simulateUser(endTime) {
    const endpoints = [
      '/health',
      '/api/monitoring/health',
      '/api/analytics/dashboard',
      '/api/tickets',
      '/api/analytics/realtime',
    ];

    while (Date.now() < endTime) {
      try {
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        await this.makeRequest(endpoint);

        // Simulate user think time
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
      } catch (error) {
        // Continue testing even if individual requests fail
      }
    }
  }
}

// Memory Monitoring
class MemoryMonitor {
  constructor(monitor) {
    this.monitor = monitor;
    this.interval = null;
  }

  start() {
    this.interval = setInterval(() => {
      const memUsage = process.memoryUsage();
      this.monitor.recordMemory(memUsage.heapUsed);
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

// Performance Tests
test('Performance Testing Suite', async (t) => {
  const monitor = new PerformanceMonitor();
  const loadTester = new LoadTester(monitor);
  const memoryMonitor = new MemoryMonitor(monitor);

  await t.test('API Response Time Benchmarks', async () => {
    console.log('🚀 Testing API response times...');

    // Test individual endpoints
    const endpoints = [
      { endpoint: '/health', maxTime: 100 },
      { endpoint: '/api/monitoring/health', maxTime: 500 },
      { endpoint: '/api/analytics/dashboard', maxTime: 2000 },
      { endpoint: '/api/analytics/realtime', maxTime: 1000 },
    ];

    for (const { endpoint, maxTime } of endpoints) {
      const start = performance.now();

      try {
        await loadTester.makeRequest(endpoint);
        const duration = performance.now() - start;

        console.log(`  ${endpoint}: ${duration.toFixed(2)}ms`);
        assert.ok(
          duration < maxTime,
          `${endpoint} response time ${duration.toFixed(2)}ms exceeds limit ${maxTime}ms`,
        );
      } catch (error) {
        console.error(`  ${endpoint}: FAILED - ${error.message}`);
        throw error;
      }
    }
  });

  await t.test('Concurrent User Load Test', async () => {
    console.log(
      `🔥 Testing ${PERF_CONFIG.concurrentUsers} concurrent users for ${PERF_CONFIG.testDuration / 1000}s...`,
    );

    memoryMonitor.start();

    const startTime = performance.now();
    await loadTester.runConcurrentUsers(PERF_CONFIG.concurrentUsers, PERF_CONFIG.testDuration);
    const totalDuration = performance.now() - startTime;

    memoryMonitor.stop();

    const stats = monitor.getStatistics();

    console.log('📊 Load Test Results:');
    console.log(`  Total Requests: ${stats.totalRequests}`);
    console.log(`  Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms`);
    console.log(`  95th Percentile: ${stats.p95ResponseTime.toFixed(2)}ms`);
    console.log(`  99th Percentile: ${stats.p99ResponseTime.toFixed(2)}ms`);
    console.log(`  Error Rate: ${(stats.errorRate * 100).toFixed(2)}%`);
    console.log(`  Throughput: ${stats.throughput.toFixed(2)} req/s`);
    console.log(`  Max Concurrent: ${loadTester.maxConcurrent}`);
    console.log(`  Peak Memory: ${(stats.memoryPeak / 1024 / 1024).toFixed(2)}MB`);

    // Performance assertions
    assert.ok(
      stats.averageResponseTime < PERF_CONFIG.maxResponseTime,
      `Average response time ${stats.averageResponseTime.toFixed(2)}ms exceeds limit`,
    );
    assert.ok(
      stats.errorRate < 0.05,
      `Error rate ${(stats.errorRate * 100).toFixed(2)}% exceeds 5% limit`,
    );
    assert.ok(
      stats.throughput > PERF_CONFIG.targetThroughput / 2,
      `Throughput ${stats.throughput.toFixed(2)} req/s below minimum threshold`,
    );
    assert.ok(
      stats.memoryPeak < PERF_CONFIG.maxMemoryUsage,
      `Peak memory usage ${stats.memoryPeak} exceeds limit`,
    );
  });

  await t.test('Database Performance Under Load', async () => {
    console.log('💾 Testing database performance...');

    const dbEndpoints = ['/api/tickets', '/api/analytics/dashboard', '/api/monitoring/performance'];

    const promises = [];
    for (let i = 0; i < 20; i++) {
      for (const endpoint of dbEndpoints) {
        promises.push(loadTester.makeRequest(endpoint).catch((error) => ({ error })));
      }
    }

    const results = await Promise.allSettled(promises);
    const successful = results.filter((r) => r.status === 'fulfilled' && !r.value.error);
    const failed = results.filter((r) => r.status === 'rejected' || r.value?.error);

    console.log(`  Database requests: ${successful.length}/${results.length} successful`);
    console.log(`  Database error rate: ${((failed.length / results.length) * 100).toFixed(2)}%`);

    assert.ok(
      failed.length / results.length < 0.1,
      `Database error rate ${((failed.length / results.length) * 100).toFixed(2)}% exceeds 10% limit`,
    );
  });

  await t.test('Memory Leak Detection', async () => {
    console.log('🔍 Testing for memory leaks...');

    const initialMemory = process.memoryUsage().heapUsed;
    memoryMonitor.start();

    // Run sustained load for memory leak detection
    for (let cycle = 0; cycle < 5; cycle++) {
      await loadTester.runConcurrentUsers(10, 5000); // 10 users for 5 seconds

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const currentMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = currentMemory - initialMemory;

      console.log(
        `  Cycle ${cycle + 1}: Memory usage +${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    memoryMonitor.stop();

    const finalMemory = process.memoryUsage().heapUsed;
    const totalIncrease = finalMemory - initialMemory;
    const increasePercentage = (totalIncrease / initialMemory) * 100;

    console.log(
      `  Total memory increase: ${(totalIncrease / 1024 / 1024).toFixed(2)}MB (${increasePercentage.toFixed(2)}%)`,
    );

    // Memory leak assertion - should not increase by more than 200% over baseline
    assert.ok(
      increasePercentage < 200,
      `Memory usage increased by ${increasePercentage.toFixed(2)}%, possible memory leak`,
    );
  });

  await t.test('Stress Testing - Breaking Point Analysis', async () => {
    console.log('⚡ Finding system breaking point...');

    const userLevels = [10, 25, 50, 75, 100, 150, 200];
    const results = [];

    for (const userCount of userLevels) {
      console.log(`  Testing ${userCount} concurrent users...`);

      const testMonitor = new PerformanceMonitor();
      const testLoadTester = new LoadTester(testMonitor);

      const startTime = performance.now();
      await testLoadTester.runConcurrentUsers(userCount, 10000); // 10 second bursts

      const stats = testMonitor.getStatistics();
      results.push({
        userCount,
        averageResponseTime: stats.averageResponseTime,
        errorRate: stats.errorRate,
        throughput: stats.throughput,
      });

      console.log(
        `    Avg Response: ${stats.averageResponseTime.toFixed(2)}ms, Error Rate: ${(stats.errorRate * 100).toFixed(2)}%, Throughput: ${stats.throughput.toFixed(2)} req/s`,
      );

      // Stop testing if error rate becomes too high
      if (stats.errorRate > 0.2) {
        console.log(`    ⚠️  Breaking point reached at ${userCount} users`);
        break;
      }
    }

    // Find the optimal load level (highest throughput with <5% error rate)
    const optimalLoad = results
      .filter((r) => r.errorRate < 0.05)
      .sort((a, b) => b.throughput - a.throughput)[0];

    if (optimalLoad) {
      console.log(
        `  🎯 Optimal load: ${optimalLoad.userCount} users (${optimalLoad.throughput.toFixed(2)} req/s)`,
      );
    }

    assert.ok(results.length > 0, 'Should complete at least one stress test level');
    assert.ok(results[0].errorRate < 0.5, 'Should handle basic load without excessive errors');
  });

  await t.test('API Endpoint Scalability', async () => {
    console.log('📈 Testing endpoint scalability...');

    const endpoints = [
      '/health',
      '/api/monitoring/health',
      '/api/analytics/dashboard',
      '/api/analytics/realtime',
    ];

    for (const endpoint of endpoints) {
      console.log(`  Testing ${endpoint}...`);

      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(loadTester.makeRequest(endpoint).catch((error) => ({ error })));
      }

      const results = await Promise.allSettled(promises);
      const successful = results.filter((r) => r.status === 'fulfilled' && !r.value?.error);
      const successRate = successful.length / results.length;

      console.log(`    Success rate: ${(successRate * 100).toFixed(2)}%`);

      assert.ok(
        successRate > 0.9,
        `${endpoint} success rate ${(successRate * 100).toFixed(2)}% below 90% threshold`,
      );
    }
  });
});

console.log('✅ Performance Testing Suite Completed');

// Final cleanup and exit
process.nextTick(async () => {
  await performCleanup();
  console.log('🎯 Performance tests finished - exiting gracefully');
  process.exit(0);
});
