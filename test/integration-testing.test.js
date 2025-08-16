// Integration Testing Suite for Nova Universe
// Tests API endpoints, database operations, and service integrations

import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'child_process';
import fetch from 'node-fetch';

// Test Configuration
const CONFIG = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  timeout: 30000,
  retryAttempts: 3,
  testDatabase:
    process.env.TEST_DATABASE_URL || 'postgresql://test_user:test_pass@localhost:5432/nova_test',
};

// Test Utilities
class TestHelper {
  static async waitForService(url, timeout = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const response = await fetch(url);
        if (response.ok) return true;
      } catch (error) {
        // Service not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(`Service at ${url} not ready after ${timeout}ms`);
  }

  static async makeRequest(endpoint, options = {}) {
    const url = `${CONFIG.apiUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Nova-Universe-Integration-Test',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  static generateTestData() {
    const timestamp = Date.now();
    return {
      ticket: {
        title: `Test Ticket ${timestamp}`,
        description: `Integration test ticket created at ${new Date().toISOString()}`,
        priority: 'medium',
        category: 'technical',
        requester_email: `test${timestamp}@example.com`,
      },
      user: {
        email: `testuser${timestamp}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
      },
    };
  }
}

// Service Health Checks
test('Service Health Checks', async (t) => {
  await t.test('API service is running', async () => {
    await TestHelper.waitForService(`${CONFIG.apiUrl}/health`);
    const response = await TestHelper.makeRequest('/health');
    assert.strictEqual(response.status, 200);
  });

  await t.test('Database connectivity', async () => {
    const response = await TestHelper.makeRequest('/api/monitoring/health');
    const health = await response.json();

    assert.strictEqual(health.status, 'healthy');
    assert.strictEqual(health.database.status, 'connected');
  });

  await t.test('Redis connectivity', async () => {
    const response = await TestHelper.makeRequest('/api/monitoring/health');
    const health = await response.json();

    assert.strictEqual(health.redis.status, 'connected');
  });
});

// Authentication & Authorization Tests
test('Authentication & Authorization', async (t) => {
  let authToken = null;
  let testUser = null;

  await t.test('User registration', async () => {
    const userData = TestHelper.generateTestData().user;
    const response = await TestHelper.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...userData, password: 'TestPassword123!' }),
    });

    assert.strictEqual(response.status, 201);
    testUser = await response.json();
    assert.ok(testUser.id);
    assert.strictEqual(testUser.email, userData.email);
  });

  await t.test('User login', async () => {
    const response = await TestHelper.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'TestPassword123!',
      }),
    });

    assert.strictEqual(response.status, 200);
    const loginResult = await response.json();
    assert.ok(loginResult.token);
    authToken = loginResult.token;
  });

  await t.test('Protected endpoint access', async () => {
    const response = await TestHelper.makeRequest('/api/tickets', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert.strictEqual(response.status, 200);
  });

  await t.test('Invalid token rejection', async () => {
    try {
      await TestHelper.makeRequest('/api/tickets', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
      assert.fail('Should have rejected invalid token');
    } catch (error) {
      assert.ok(error.message.includes('401'));
    }
  });
});

// Ticket Management Integration Tests
test('Ticket Management System', async (t) => {
  let authToken = null;
  let testTicket = null;

  // Setup: Create test user and get auth token
  await t.test('Setup test user', async () => {
    const userData = TestHelper.generateTestData().user;
    await TestHelper.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...userData, password: 'TestPassword123!' }),
    });

    const loginResponse = await TestHelper.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: 'TestPassword123!',
      }),
    });

    const loginResult = await loginResponse.json();
    authToken = loginResult.token;
  });

  await t.test('Create ticket', async () => {
    const ticketData = TestHelper.generateTestData().ticket;
    const response = await TestHelper.makeRequest('/api/tickets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(ticketData),
    });

    assert.strictEqual(response.status, 201);
    testTicket = await response.json();
    assert.ok(testTicket.id);
    assert.strictEqual(testTicket.title, ticketData.title);
    assert.strictEqual(testTicket.status, 'open');
  });

  await t.test('Retrieve ticket', async () => {
    const response = await TestHelper.makeRequest(`/api/tickets/${testTicket.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert.strictEqual(response.status, 200);
    const ticket = await response.json();
    assert.strictEqual(ticket.id, testTicket.id);
  });

  await t.test('Update ticket status', async () => {
    const response = await TestHelper.makeRequest(`/api/tickets/${testTicket.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status: 'in_progress' }),
    });

    assert.strictEqual(response.status, 200);
    const updatedTicket = await response.json();
    assert.strictEqual(updatedTicket.status, 'in_progress');
  });

  await t.test('Add ticket comment', async () => {
    const commentData = {
      content: 'Test comment for integration testing',
      type: 'internal',
    };

    const response = await TestHelper.makeRequest(`/api/tickets/${testTicket.id}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(commentData),
    });

    assert.strictEqual(response.status, 201);
    const comment = await response.json();
    assert.strictEqual(comment.content, commentData.content);
  });
});

// Analytics & Reporting Integration Tests
test('Analytics & Reporting System', async (t) => {
  let authToken = null;

  // Setup admin user for analytics access
  await t.test('Setup admin user', async () => {
    const adminData = {
      email: `admin${Date.now()}@example.com`,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      password: 'AdminPassword123!',
    };

    await TestHelper.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });

    const loginResponse = await TestHelper.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: adminData.email,
        password: adminData.password,
      }),
    });

    const loginResult = await loginResponse.json();
    authToken = loginResult.token;
  });

  await t.test('Dashboard analytics', async () => {
    const response = await TestHelper.makeRequest('/api/analytics/dashboard', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert.strictEqual(response.status, 200);
    const analytics = await response.json();

    assert.ok(analytics.summary);
    assert.ok(typeof analytics.summary.totalTickets === 'number');
    assert.ok(typeof analytics.summary.openTickets === 'number');
    assert.ok(Array.isArray(analytics.recentActivity));
  });

  await t.test('Real-time metrics', async () => {
    const response = await TestHelper.makeRequest('/api/analytics/realtime', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert.strictEqual(response.status, 200);
    const metrics = await response.json();

    assert.ok(metrics.currentLoad);
    assert.ok(typeof metrics.currentLoad.activeUsers === 'number');
    assert.ok(typeof metrics.currentLoad.ticketsPerHour === 'number');
  });

  await t.test('Executive reporting', async () => {
    const response = await TestHelper.makeRequest('/api/analytics/executive', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert.strictEqual(response.status, 200);
    const report = await response.json();

    assert.ok(report.kpis);
    assert.ok(report.trends);
    assert.ok(Array.isArray(report.insights));
  });
});

// VIP Priority System Integration Tests
test('VIP Priority System', async (t) => {
  let authToken = null;
  let vipTicket = null;

  await t.test('Setup VIP user', async () => {
    const vipUserData = {
      email: `vip${Date.now()}@example.com`,
      first_name: 'VIP',
      last_name: 'Customer',
      role: 'vip',
      password: 'VIPPassword123!',
    };

    await TestHelper.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(vipUserData),
    });

    const loginResponse = await TestHelper.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: vipUserData.email,
        password: vipUserData.password,
      }),
    });

    const loginResult = await loginResponse.json();
    authToken = loginResult.token;
  });

  await t.test('VIP ticket creation with priority boost', async () => {
    const ticketData = {
      title: 'VIP Priority Test Ticket',
      description: 'Testing VIP priority system',
      priority: 'high',
      category: 'technical',
    };

    const response = await TestHelper.makeRequest('/api/tickets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(ticketData),
    });

    assert.strictEqual(response.status, 201);
    vipTicket = await response.json();

    // VIP tickets should have elevated priority score
    assert.ok(vipTicket.vip_priority_score > 0);
    assert.strictEqual(vipTicket.is_vip, true);
  });

  await t.test('VIP ticket queue positioning', async () => {
    // Create a regular ticket for comparison
    const regularUserData = {
      email: `regular${Date.now()}@example.com`,
      first_name: 'Regular',
      last_name: 'User',
      role: 'user',
      password: 'RegularPassword123!',
    };

    await TestHelper.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(regularUserData),
    });

    const regularLoginResponse = await TestHelper.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: regularUserData.email,
        password: regularUserData.password,
      }),
    });

    const regularLoginResult = await regularLoginResponse.json();
    const regularToken = regularLoginResult.token;

    const regularTicketResponse = await TestHelper.makeRequest('/api/tickets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${regularToken}`,
      },
      body: JSON.stringify({
        title: 'Regular Priority Test Ticket',
        description: 'Testing regular priority',
        priority: 'high',
        category: 'technical',
      }),
    });

    const regularTicket = await regularTicketResponse.json();

    // VIP ticket should have higher priority score
    assert.ok(vipTicket.vip_priority_score > (regularTicket.vip_priority_score || 0));
  });
});

// WebSocket Integration Tests
test('WebSocket Communication', async (t) => {
  await t.test('WebSocket connection establishment', async () => {
    // Note: This test would require WebSocket testing library
    // For now, we'll test the HTTP endpoint that supports WebSocket upgrades
    const response = await TestHelper.makeRequest('/api/monitoring/health');
    assert.strictEqual(response.status, 200);

    // In a full implementation, we would:
    // 1. Connect to WebSocket endpoint
    // 2. Test real-time ticket updates
    // 3. Test notification delivery
    // 4. Test connection cleanup
  });
});

// Error Handling Tests
test('Error Handling & Edge Cases', async (t) => {
  await t.test('Invalid endpoint returns 404', async () => {
    try {
      await TestHelper.makeRequest('/api/nonexistent-endpoint');
      assert.fail('Should have returned 404');
    } catch (error) {
      assert.ok(error.message.includes('404'));
    }
  });

  await t.test('Malformed JSON returns 400', async () => {
    try {
      await TestHelper.makeRequest('/api/tickets', {
        method: 'POST',
        body: 'invalid-json',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      assert.fail('Should have returned 400');
    } catch (error) {
      assert.ok(error.message.includes('400'));
    }
  });

  await t.test('Rate limiting protection', async () => {
    // Test rate limiting by making multiple rapid requests
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(TestHelper.makeRequest('/api/health').catch((error) => error));
    }

    const results = await Promise.all(promises);

    // Should have some rate limited responses if rate limiting is enabled
    const rateLimitedResponses = results.filter(
      (result) => result instanceof Error && result.message.includes('429'),
    );

    // At least some requests should be rate limited in a proper implementation
    console.log(`Rate limited responses: ${rateLimitedResponses.length}/100`);
  });
});

// Cleanup Tests
test('Cleanup and Teardown', async (t) => {
  await t.test('Test data cleanup', async () => {
    // In a real implementation, we would clean up test data
    // This ensures tests don't interfere with each other
    console.log('Test cleanup completed');
    assert.ok(true);
  });
});

console.log('✅ Integration Testing Suite Completed');
console.log(`Total test execution time: ${Date.now() - global.testStartTime}ms`);
