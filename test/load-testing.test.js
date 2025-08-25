// Load Testing Suite for Nova Universe
// Tests system behavior under various load conditions, stress testing, and capacity planning

import test from 'node:test';
import assert from 'node:assert';
import { performance } from 'perf_hooks';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { EventEmitter } from 'events';
import fetch from 'node-fetch';
import { registerCleanupHandlers, performCleanup, registerResource } from './test-cleanup.js';

// Register cleanup handlers immediately
registerCleanupHandlers();

// Load Test Configuration
const LOAD_CONFIG = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  scenarios: {
    smoke: { users: 5, duration: 30000, rampUp: 5000 },
    light: { users: 25, duration: 60000, rampUp: 10000 },
    normal: { users: 100, duration: 300000, rampUp: 30000 },
    peak: { users: 500, duration: 600000, rampUp: 60000 },
    stress: { users: 1000, duration: 300000, rampUp: 30000 },
    spike: { users: 2000, duration: 60000, rampUp: 5000 },
    endurance: { users: 200, duration: 1800000, rampUp: 60000 }, // 30 minutes
  },
  thresholds: {
    avgResponseTime: 2000, // 2 seconds
    p95ResponseTime: 5000, // 5 seconds
    p99ResponseTime: 10000, // 10 seconds
    errorRate: 0.05, // 5%
    throughput: 50, // requests per second minimum
  },
};

// Load Testing Engine
class LoadTestEngine extends EventEmitter {
  constructor() {
    super();
    this.workers = [];
    this.isShuttingDown = false;
    this.results = {
      requests: [],
      errors: [],
      metrics: {
        totalRequests: 0,
        totalErrors: 0,
        startTime: 0,
        endTime: 0,
        responseTimes: [],
        throughput: 0,
        concurrentUsers: 0,
      },
    };

    // Handle graceful shutdown
    this.cleanup = this.cleanup.bind(this);
    process.on('SIGINT', this.cleanup);
    process.on('SIGTERM', this.cleanup);
    process.on('exit', this.cleanup);
  }

  async cleanup() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log('🧹 Cleaning up load test workers...');
    await this.stopLoadTest();
  }

  async runLoadTest(scenario, testName) {
    console.log(`🚀 Starting load test: ${testName}`);
    console.log(
      `   Users: ${scenario.users}, Duration: ${scenario.duration}ms, Ramp-up: ${scenario.rampUp}ms`,
    );

    this.results.metrics.startTime = performance.now();

    const workers = [];
    const workerCount = Math.min(scenario.users, 50); // Max 50 workers
    const usersPerWorker = Math.ceil(scenario.users / workerCount);

    // Create worker threads for load generation
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(__filename, {
        workerData: {
          workerId: i,
          usersPerWorker:
            i < workerCount - 1 ? usersPerWorker : scenario.users - i * usersPerWorker,
          duration: scenario.duration,
          rampUp: scenario.rampUp,
          apiUrl: LOAD_CONFIG.apiUrl,
        },
      });

      // Register worker for cleanup
      registerResource('workers', worker);

      worker.on('message', (data) => {
        this.handleWorkerMessage(data);
      });

      worker.on('error', (error) => {
        console.error(`Worker ${i} error:`, error);
      });

      workers.push(worker);
    }

    this.workers = workers;

    // Wait for test completion
    return new Promise((resolve) => {
      setTimeout(
        () => {
          this.stopLoadTest();
          resolve(this.generateReport(testName));
        },
        scenario.duration + scenario.rampUp + 5000,
      ); // Extra buffer
    });
  }

  handleWorkerMessage(data) {
    switch (data.type) {
      case 'request':
        this.results.requests.push(data.payload);
        this.results.metrics.totalRequests++;
        this.results.metrics.responseTimes.push(data.payload.duration);
        break;
      case 'error':
        this.results.errors.push(data.payload);
        this.results.metrics.totalErrors++;
        break;
      case 'metric':
        // Update real-time metrics
        this.emit('metric', data.payload);
        break;
    }
  }

  async stopLoadTest() {
    if (this.isShuttingDown) return;

    this.results.metrics.endTime = performance.now();

    // Gracefully terminate all workers
    const terminationPromises = this.workers.map((worker) => {
      return new Promise((resolve) => {
        // Set a timeout for graceful termination
        const timeout = setTimeout(() => {
          worker.terminate();
          resolve();
        }, 5000);

        worker.once('exit', () => {
          clearTimeout(timeout);
          resolve();
        });

        // Try graceful shutdown first
        worker.postMessage({ type: 'shutdown' });
      });
    });

    await Promise.all(terminationPromises);
    this.workers = [];
    console.log('✅ All load test workers terminated gracefully');
  }

  generateReport(testName) {
    const duration = (this.results.metrics.endTime - this.results.metrics.startTime) / 1000;
    const responseTimes = this.results.metrics.responseTimes.sort((a, b) => a - b);

    const report = {
      testName,
      summary: {
        totalRequests: this.results.metrics.totalRequests,
        totalErrors: this.results.metrics.totalErrors,
        duration: duration,
        throughput: this.results.metrics.totalRequests / duration,
        errorRate: this.results.metrics.totalErrors / this.results.metrics.totalRequests || 0,
      },
      responseTime: {
        min: Math.min(...responseTimes) || 0,
        max: Math.max(...responseTimes) || 0,
        avg: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
        p50: this.calculatePercentile(responseTimes, 50),
        p95: this.calculatePercentile(responseTimes, 95),
        p99: this.calculatePercentile(responseTimes, 99),
      },
      errors: this.results.errors,
      passed: this.evaluateThresholds(),
    };

    return report;
  }

  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[index];
  }

  evaluateThresholds() {
    const responseTimes = this.results.metrics.responseTimes;
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;
    const p95ResponseTime = this.calculatePercentile(
      responseTimes.sort((a, b) => a - b),
      95,
    );
    const p99ResponseTime = this.calculatePercentile(
      responseTimes.sort((a, b) => a - b),
      99,
    );
    const errorRate = this.results.metrics.totalErrors / this.results.metrics.totalRequests || 0;
    const duration = (this.results.metrics.endTime - this.results.metrics.startTime) / 1000;
    const throughput = this.results.metrics.totalRequests / duration;

    return {
      avgResponseTime: avgResponseTime <= LOAD_CONFIG.thresholds.avgResponseTime,
      p95ResponseTime: p95ResponseTime <= LOAD_CONFIG.thresholds.p95ResponseTime,
      p99ResponseTime: p99ResponseTime <= LOAD_CONFIG.thresholds.p99ResponseTime,
      errorRate: errorRate <= LOAD_CONFIG.thresholds.errorRate,
      throughput: throughput >= LOAD_CONFIG.thresholds.throughput,
    };
  }
}

// Worker thread implementation for load generation
if (!isMainThread) {
  class LoadWorker {
    constructor(workerId, usersPerWorker, duration, rampUp, apiUrl) {
      this.workerId = workerId;
      this.usersPerWorker = usersPerWorker;
      this.duration = duration;
      this.rampUp = rampUp;
      this.apiUrl = apiUrl;
      this.activeUsers = 0;
      this.isRunning = false;
      this.timeouts = new Set();
      this.intervals = new Set();

      // Handle shutdown messages from parent
      parentPort.on('message', (message) => {
        if (message.type === 'shutdown') {
          this.stop();
        }
      });
    }

    async start() {
      this.isRunning = true;
      const userDelayMs = this.rampUp / this.usersPerWorker;

      // Start users gradually during ramp-up period
      for (let i = 0; i < this.usersPerWorker && this.isRunning; i++) {
        const timeoutId = setTimeout(() => {
          if (this.isRunning) {
            this.simulateUser();
          }
        }, i * userDelayMs);
        this.timeouts.add(timeoutId);
      }

      // Stop after test duration
      const stopTimeoutId = setTimeout(() => {
        this.stop();
      }, this.duration + this.rampUp);
      this.timeouts.add(stopTimeoutId);
    }

    stop() {
      this.isRunning = false;

      // Clear all timeouts and intervals
      for (const timeoutId of this.timeouts) {
        clearTimeout(timeoutId);
      }
      for (const intervalId of this.intervals) {
        clearInterval(intervalId);
      }

      this.timeouts.clear();
      this.intervals.clear();

      // Send final message and exit
      parentPort.postMessage({
        type: 'worker-stopped',
        payload: { workerId: this.workerId, activeUsers: this.activeUsers },
      });

      // Graceful exit
      process.exit(0);
    }

    async simulateUser() {
      this.activeUsers++;
      const endTime = Date.now() + this.duration;

      const endpoints = [
        { path: '/health', weight: 10 },
        { path: '/api/monitoring/health', weight: 15 },
        { path: '/api/tickets', weight: 30 },
        { path: '/api/analytics/dashboard', weight: 20 },
        { path: '/api/analytics/realtime', weight: 15 },
        { path: '/api/monitoring/performance', weight: 10 },
      ];

      while (Date.now() < endTime && this.isRunning) {
        try {
          const endpoint = this.selectEndpoint(endpoints);
          await this.makeRequest(endpoint);

          // Simulate user think time
          await this.sleep(Math.random() * 2000 + 500); // 500-2500ms think time
        } catch (error) {
          parentPort.postMessage({
            type: 'error',
            payload: {
              workerId: this.workerId,
              error: error.message,
              timestamp: Date.now(),
            },
          });
        }
      }

      this.activeUsers--;
    }

    selectEndpoint(endpoints) {
      const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
      let random = Math.random() * totalWeight;

      for (const endpoint of endpoints) {
        random -= endpoint.weight;
        if (random <= 0) {
          return endpoint.path;
        }
      }

      return endpoints[0].path; // Fallback
    }

    async makeRequest(endpoint) {
      const start = performance.now();

      try {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
          timeout: 30000,
          headers: {
            'User-Agent': `LoadTest-Worker-${this.workerId}`,
          },
        });

        const duration = performance.now() - start;

        parentPort.postMessage({
          type: 'request',
          payload: {
            workerId: this.workerId,
            endpoint,
            status: response.status,
            duration,
            timestamp: Date.now(),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        const duration = performance.now() - start;

        parentPort.postMessage({
          type: 'error',
          payload: {
            workerId: this.workerId,
            endpoint,
            error: error.message,
            duration,
            timestamp: Date.now(),
          },
        });
      }
    }

    sleep(ms) {
      return new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, ms);
        this.timeouts.add(timeoutId);
      });
    }

    // This method is replaced by the enhanced stop() method above
    // stop() {
    //   this.isRunning = false;
    // }
  }

  // Start worker
  const { workerId, usersPerWorker, duration, rampUp, apiUrl } = workerData;
  const worker = new LoadWorker(workerId, usersPerWorker, duration, rampUp, apiUrl);
  worker.start();
}

// Load Testing Suite
test('Load Testing Suite', async (t) => {
  const loadTester = new LoadTestEngine();

  await t.test('Smoke Test - Basic Functionality', async () => {
    console.log('💨 Running smoke test to verify basic functionality...');

    const report = await loadTester.runLoadTest(LOAD_CONFIG.scenarios.smoke, 'Smoke Test');

    console.log('📊 Smoke Test Results:');
    console.log(`   Requests: ${report.summary.totalRequests}`);
    console.log(
      `   Errors: ${report.summary.totalErrors} (${(report.summary.errorRate * 100).toFixed(2)}%)`,
    );
    console.log(`   Avg Response Time: ${report.responseTime.avg.toFixed(2)}ms`);
    console.log(`   Throughput: ${report.summary.throughput.toFixed(2)} req/s`);

    // Basic functionality assertions
    assert.ok(report.summary.totalRequests > 0, 'Should complete at least some requests');
    assert.ok(report.summary.errorRate < 0.1, 'Error rate should be under 10% for smoke test');
    assert.ok(report.responseTime.avg < 10000, 'Average response time should be under 10 seconds');

    console.log('  ✅ Smoke test passed - basic functionality verified');
  });

  await t.test('Light Load Test - Normal Usage', async () => {
    console.log('🌤️ Running light load test for normal usage patterns...');

    const report = await loadTester.runLoadTest(LOAD_CONFIG.scenarios.light, 'Light Load Test');

    console.log('📊 Light Load Test Results:');
    console.log(`   Requests: ${report.summary.totalRequests}`);
    console.log(
      `   Errors: ${report.summary.totalErrors} (${(report.summary.errorRate * 100).toFixed(2)}%)`,
    );
    console.log(`   Avg Response Time: ${report.responseTime.avg.toFixed(2)}ms`);
    console.log(`   95th Percentile: ${report.responseTime.p95.toFixed(2)}ms`);
    console.log(`   Throughput: ${report.summary.throughput.toFixed(2)} req/s`);

    // Light load assertions
    assert.ok(
      report.summary.errorRate < LOAD_CONFIG.thresholds.errorRate,
      `Error rate ${(report.summary.errorRate * 100).toFixed(2)}% exceeds threshold`,
    );
    assert.ok(
      report.responseTime.avg < LOAD_CONFIG.thresholds.avgResponseTime,
      `Average response time ${report.responseTime.avg.toFixed(2)}ms exceeds threshold`,
    );
    assert.ok(
      report.summary.throughput > LOAD_CONFIG.thresholds.throughput / 2,
      `Throughput ${report.summary.throughput.toFixed(2)} req/s below minimum`,
    );

    console.log('  ✅ Light load test passed - system handles normal usage well');
  });

  await t.test('Normal Load Test - Expected Production Load', async () => {
    console.log('☀️ Running normal load test for expected production load...');

    const report = await loadTester.runLoadTest(LOAD_CONFIG.scenarios.normal, 'Normal Load Test');

    console.log('📊 Normal Load Test Results:');
    console.log(`   Requests: ${report.summary.totalRequests}`);
    console.log(
      `   Errors: ${report.summary.totalErrors} (${(report.summary.errorRate * 100).toFixed(2)}%)`,
    );
    console.log(`   Response Times:`);
    console.log(`     Min: ${report.responseTime.min.toFixed(2)}ms`);
    console.log(`     Avg: ${report.responseTime.avg.toFixed(2)}ms`);
    console.log(`     Max: ${report.responseTime.max.toFixed(2)}ms`);
    console.log(`     95th: ${report.responseTime.p95.toFixed(2)}ms`);
    console.log(`     99th: ${report.responseTime.p99.toFixed(2)}ms`);
    console.log(`   Throughput: ${report.summary.throughput.toFixed(2)} req/s`);

    // Normal load assertions with threshold validation
    const thresholds = report.passed;
    console.log('🎯 Threshold Validation:');
    console.log(`   Avg Response Time: ${thresholds.avgResponseTime ? '✅' : '❌'}`);
    console.log(`   95th Percentile: ${thresholds.p95ResponseTime ? '✅' : '❌'}`);
    console.log(`   99th Percentile: ${thresholds.p99ResponseTime ? '✅' : '❌'}`);
    console.log(`   Error Rate: ${thresholds.errorRate ? '✅' : '❌'}`);
    console.log(`   Throughput: ${thresholds.throughput ? '✅' : '❌'}`);

    assert.ok(
      report.summary.errorRate < LOAD_CONFIG.thresholds.errorRate,
      `Error rate ${(report.summary.errorRate * 100).toFixed(2)}% exceeds threshold`,
    );
    assert.ok(
      report.responseTime.p95 < LOAD_CONFIG.thresholds.p95ResponseTime,
      `95th percentile ${report.responseTime.p95.toFixed(2)}ms exceeds threshold`,
    );

    console.log('  ✅ Normal load test passed - system meets production requirements');
  });

  await t.test('Peak Load Test - High Traffic Periods', async () => {
    console.log('🔥 Running peak load test for high traffic periods...');

    const report = await loadTester.runLoadTest(LOAD_CONFIG.scenarios.peak, 'Peak Load Test');

    console.log('📊 Peak Load Test Results:');
    console.log(`   Requests: ${report.summary.totalRequests}`);
    console.log(
      `   Errors: ${report.summary.totalErrors} (${(report.summary.errorRate * 100).toFixed(2)}%)`,
    );
    console.log(`   Avg Response Time: ${report.responseTime.avg.toFixed(2)}ms`);
    console.log(`   95th Percentile: ${report.responseTime.p95.toFixed(2)}ms`);
    console.log(`   99th Percentile: ${report.responseTime.p99.toFixed(2)}ms`);
    console.log(`   Throughput: ${report.summary.throughput.toFixed(2)} req/s`);

    // Peak load allows for higher error rates and response times
    assert.ok(
      report.summary.errorRate < 0.15,
      `Peak load error rate ${(report.summary.errorRate * 100).toFixed(2)}% exceeds 15% limit`,
    );
    assert.ok(
      report.responseTime.p99 < 20000,
      `99th percentile ${report.responseTime.p99.toFixed(2)}ms exceeds 20s limit`,
    );

    console.log('  ✅ Peak load test completed - system behavior under high load assessed');
  });

  await t.test('Stress Test - Breaking Point Analysis', async () => {
    console.log('⚡ Running stress test to find system breaking point...');

    const report = await loadTester.runLoadTest(LOAD_CONFIG.scenarios.stress, 'Stress Test');

    console.log('📊 Stress Test Results:');
    console.log(`   Requests: ${report.summary.totalRequests}`);
    console.log(
      `   Errors: ${report.summary.totalErrors} (${(report.summary.errorRate * 100).toFixed(2)}%)`,
    );
    console.log(`   Avg Response Time: ${report.responseTime.avg.toFixed(2)}ms`);
    console.log(`   95th Percentile: ${report.responseTime.p95.toFixed(2)}ms`);
    console.log(`   99th Percentile: ${report.responseTime.p99.toFixed(2)}ms`);
    console.log(`   Throughput: ${report.summary.throughput.toFixed(2)} req/s`);

    // Stress test evaluation
    if (report.summary.errorRate > 0.3) {
      console.log('  ⚠️  System reached breaking point - high error rate detected');
    }

    if (report.responseTime.p95 > 15000) {
      console.log('  ⚠️  System showing stress - high response times detected');
    }

    // Basic assertions for stress test
    assert.ok(report.summary.totalRequests > 0, 'Should complete some requests even under stress');
    assert.ok(report.summary.errorRate < 0.8, 'Should not fail completely under stress');

    console.log('  ✅ Stress test completed - system limits identified');
  });

  await t.test('Spike Test - Sudden Load Increase', async () => {
    console.log('📈 Running spike test for sudden load increases...');

    const report = await loadTester.runLoadTest(LOAD_CONFIG.scenarios.spike, 'Spike Test');

    console.log('📊 Spike Test Results:');
    console.log(`   Requests: ${report.summary.totalRequests}`);
    console.log(
      `   Errors: ${report.summary.totalErrors} (${(report.summary.errorRate * 100).toFixed(2)}%)`,
    );
    console.log(`   Avg Response Time: ${report.responseTime.avg.toFixed(2)}ms`);
    console.log(`   Max Response Time: ${report.responseTime.max.toFixed(2)}ms`);
    console.log(`   Throughput: ${report.summary.throughput.toFixed(2)} req/s`);

    // Spike test allows for temporary degradation
    assert.ok(
      report.summary.errorRate < 0.3,
      `Spike test error rate ${(report.summary.errorRate * 100).toFixed(2)}% exceeds 30% limit`,
    );

    // System should recover (this would be better measured with time-series data)
    if (report.summary.errorRate < 0.1) {
      console.log('  ✅ System handled spike well with minimal errors');
    } else {
      console.log('  ⚠️  System experienced degradation during spike');
    }

    console.log('  ✅ Spike test completed - system spike response assessed');
  });

  // Only run endurance test if specifically requested (due to long duration)
  if (process.env.RUN_ENDURANCE_TEST === 'true') {
    await t.test('Endurance Test - Long Duration Stability', async () => {
      console.log('🏃 Running endurance test for long-term stability...');
      console.log('⏰ This test runs for 30 minutes...');

      const report = await loadTester.runLoadTest(
        LOAD_CONFIG.scenarios.endurance,
        'Endurance Test',
      );

      console.log('📊 Endurance Test Results:');
      console.log(`   Duration: ${(report.summary.duration / 60).toFixed(2)} minutes`);
      console.log(`   Total Requests: ${report.summary.totalRequests}`);
      console.log(
        `   Total Errors: ${report.summary.totalErrors} (${(report.summary.errorRate * 100).toFixed(2)}%)`,
      );
      console.log(`   Avg Response Time: ${report.responseTime.avg.toFixed(2)}ms`);
      console.log(`   Throughput: ${report.summary.throughput.toFixed(2)} req/s`);

      // Endurance test should maintain stable performance
      assert.ok(
        report.summary.errorRate < 0.1,
        `Endurance test error rate ${(report.summary.errorRate * 100).toFixed(2)}% exceeds 10% limit`,
      );
      assert.ok(
        report.responseTime.avg < LOAD_CONFIG.thresholds.avgResponseTime * 2,
        `Average response time degraded too much during endurance test`,
      );

      console.log('  ✅ Endurance test completed - long-term stability verified');
    });
  } else {
    console.log('ℹ️  Skipping endurance test (set RUN_ENDURANCE_TEST=true to enable)');
  }
});

// Capacity Planning Tests
test('Capacity Planning Analysis', async (t) => {
  await t.test('Scalability Analysis', async () => {
    console.log('📊 Running scalability analysis...');

    const loadTester = new LoadTestEngine();
    const userLevels = [10, 25, 50, 100, 200, 300];
    const results = [];

    for (const userCount of userLevels) {
      console.log(`  Testing ${userCount} concurrent users...`);

      const scenario = {
        users: userCount,
        duration: 60000, // 1 minute tests
        rampUp: 10000, // 10 second ramp-up
      };

      const report = await loadTester.runLoadTest(
        scenario,
        `Scalability Test - ${userCount} users`,
      );

      results.push({
        users: userCount,
        throughput: report.summary.throughput,
        avgResponseTime: report.responseTime.avg,
        errorRate: report.summary.errorRate,
        p95ResponseTime: report.responseTime.p95,
      });

      console.log(
        `    Throughput: ${report.summary.throughput.toFixed(2)} req/s, Avg RT: ${report.responseTime.avg.toFixed(2)}ms`,
      );

      // Stop if system becomes unstable
      if (report.summary.errorRate > 0.2) {
        console.log(`    ⚠️  System becomes unstable at ${userCount} users`);
        break;
      }
    }

    // Analyze scalability patterns
    const maxThroughput = Math.max(...results.map((r) => r.throughput));
    const optimalPoint = results.filter((r) => r.errorRate < 0.05).pop();

    console.log('📈 Scalability Analysis Results:');
    console.log(`   Maximum Throughput: ${maxThroughput.toFixed(2)} req/s`);
    if (optimalPoint) {
      console.log(
        `   Optimal Load: ${optimalPoint.users} users (${optimalPoint.throughput.toFixed(2)} req/s)`,
      );
    }

    assert.ok(results.length > 0, 'Should complete scalability analysis');
    assert.ok(maxThroughput > 0, 'Should achieve some throughput');

    console.log('  ✅ Scalability analysis completed');
  });

  await t.test('Resource Utilization Monitoring', async () => {
    console.log('📈 Monitoring resource utilization during load...');

    const loadTester = new LoadTestEngine();
    const baselineMemory = process.memoryUsage().heapUsed;
    const memoryReadings = [];

    // Monitor memory during load test
    const memoryMonitor = setInterval(() => {
      const currentMemory = process.memoryUsage().heapUsed;
      memoryReadings.push({
        timestamp: Date.now(),
        memory: currentMemory,
        diff: currentMemory - baselineMemory,
      });
    }, 5000);

    // Run moderate load test
    const report = await loadTester.runLoadTest(
      LOAD_CONFIG.scenarios.normal,
      'Resource Monitoring Test',
    );

    clearInterval(memoryMonitor);

    const peakMemory = Math.max(...memoryReadings.map((r) => r.memory));
    const memoryIncrease = peakMemory - baselineMemory;

    console.log('💾 Resource Utilization Results:');
    console.log(`   Baseline Memory: ${(baselineMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Peak Memory: ${(peakMemory / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Memory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Memory Growth: ${((memoryIncrease / baselineMemory) * 100).toFixed(2)}%`);

    // Memory growth should be reasonable
    assert.ok(
      memoryIncrease / baselineMemory < 5,
      'Memory growth should be under 500% of baseline',
    );

    console.log('  ✅ Resource utilization monitoring completed');
  });
});

console.log('✅ Load Testing Suite Completed');
console.log('🎯 System performance under various load conditions analyzed');

// Final cleanup and exit
process.nextTick(async () => {
  await performCleanup();
  console.log('🎯 Load tests finished - exiting gracefully');
  process.exit(0);
});
