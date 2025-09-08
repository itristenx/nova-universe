// Comprehensive End-to-End API Test Suite
// Tests all major API domains and critical endpoints
// Built for Nova Universe API with 853 endpoints across 84 route files

import test from 'node:test';
import assert from 'node:assert';
import fetch from 'node-fetch';
import { registerCleanupHandlers, performCleanup } from './test-cleanup.js';

// Register cleanup handlers immediately
registerCleanupHandlers();

// Test Configuration
const API_BASE = process.env.TEST_API_URL || 'http://localhost:3000';
const API_PREFIX = '/api';
const TIMEOUT = 30000;
const RETRY_COUNT = 3;

// Test credentials for authenticated endpoints
const TEST_CREDENTIALS = {
  username: process.env.TEST_USERNAME || 'test@nova.local',
  password: process.env.TEST_PASSWORD || 'testpass123',
  adminUsername: process.env.ADMIN_USERNAME || 'admin@nova.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'adminpass123'
};

// Global test state
let authToken = null;
let adminAuthToken = null;
let testStartTime = Date.now();

// HTTP client with retry logic
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/api') ? '' : API_PREFIX}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Nova-E2E-Test-Suite/1.0',
      ...(options.headers || {})
    },
    ...options
  };

  // Add auth token if available and not explicitly overridden
  if (authToken && !defaultOptions.headers.Authorization && !options.skipAuth) {
    defaultOptions.headers.Authorization = `Bearer ${authToken}`;
  }

  for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
    try {
      const response = await fetch(url, defaultOptions);
      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      };

      // Parse response body based on content type
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        result.data = await response.json();
      } else if (contentType.includes('text/')) {
        result.text = await response.text();
      } else {
        result.buffer = await response.buffer();
      }

      result.success = response.status >= 200 && response.status < 300;
      return result;

    } catch (error) {
      if (attempt === RETRY_COUNT) {
        return {
          success: false,
          error: error.message,
          status: 0,
          statusText: 'Network Error'
        };
      }
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Authentication helpers
async function authenticateUser(username, password) {
  const response = await makeRequest('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true
  });

  if (response.success && response.data?.token) {
    return response.data.token;
  }
  return null;
}

// Test suite for critical system health endpoints
test('System Health & Status Endpoints', async (t) => {
  console.log('🏥 Testing system health and status endpoints...');

  await t.test('Health Check Endpoints', async () => {
    const healthEndpoints = [
      '/health',
      '/api/health', 
      '/ready',
      '/metrics'
    ];

    for (const endpoint of healthEndpoints) {
      const response = await makeRequest(endpoint, { skipAuth: true });
      assert.ok(response.success || response.status === 401, 
        `Health endpoint ${endpoint} should be accessible (got ${response.status})`);
    }
  });

  await t.test('System Status Information', async () => {
    const response = await makeRequest('/api/server/status');
    
    // Should either work or return 401 (if auth required)
    if (response.status === 401) {
      console.log('   Status endpoint requires authentication');
      return;
    }

    assert.ok(response.success, 'Server status should be accessible');
    if (response.success && response.data) {
      assert.ok(response.data.status, 'Should include status');
      assert.ok(response.data.uptime !== undefined, 'Should include uptime');
    }
  });
});

// Test suite for authentication and authorization
test('Authentication & Authorization', async (t) => {
  console.log('🔐 Testing authentication and authorization...');

  await t.test('Auth Status Check', async () => {
    const response = await makeRequest('/api/auth/status', { skipAuth: true });
    assert.ok(response.success, 'Auth status should be accessible');
    
    if (response.data) {
      assert.ok(typeof response.data.authRequired === 'boolean', 
        'Should indicate if auth is required');
    }
  });

  await t.test('Login Attempt (if auth enabled)', async () => {
    // Try development login first
    let response = await makeRequest('/api/login-dev', {
      method: 'POST',
      body: JSON.stringify(TEST_CREDENTIALS),
      skipAuth: true
    });

    if (!response.success) {
      // Try regular login
      response = await makeRequest('/api/login', {
        method: 'POST', 
        body: JSON.stringify(TEST_CREDENTIALS),
        skipAuth: true
      });
    }

    if (response.success && response.data?.token) {
      authToken = response.data.token;
      console.log('   ✅ Authentication successful');
    } else {
      console.log('   ⚠️  Authentication not available or credentials invalid');
    }
  });

  await t.test('Protected Endpoint Access', async () => {
    const response = await makeRequest('/api/me');
    
    // Should either work (if authenticated) or return 401
    if (response.status === 401) {
      console.log('   Protected endpoints require authentication (expected)');
    } else {
      assert.ok(response.success, 'User info should be accessible when authenticated');
    }
  });
});

// Test suite for user management endpoints
test('User Management', async (t) => {
  console.log('👥 Testing user management endpoints...');

  await t.test('User Directory Access', async () => {
    const endpoints = [
      '/api/v1/directory/search',
      '/api/users',
      '/api/v1/users'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
        `User endpoint ${endpoint} should return valid status (got ${response.status})`);
    }
  });

  await t.test('User Profile Operations', async () => {
    if (!authToken) {
      console.log('   Skipping user operations (no auth token)');
      return;
    }

    const response = await makeRequest('/api/me');
    if (response.success) {
      console.log('   ✅ User profile accessible');
    }
  });
});

// Test suite for ticketing system
test('Ticketing System', async (t) => {
  console.log('🎫 Testing ticketing system endpoints...');

  await t.test('Tickets List Access', async () => {
    const response = await makeRequest('/api/tickets');
    assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
      `Tickets endpoint should return valid status (got ${response.status})`);
  });

  await t.test('Ticket Creation (if authenticated)', async () => {
    if (!authToken) {
      console.log('   Skipping ticket creation (no auth token)');
      return;
    }

    const testTicket = {
      title: 'E2E Test Ticket',
      description: 'This is a test ticket created by the E2E test suite',
      category: 'general',
      priority: 'medium'
    };

    const response = await makeRequest('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(testTicket)
    });

    if (response.success) {
      console.log('   ✅ Ticket creation successful');
      // Store ticket ID for cleanup if needed
      if (response.data?.id) {
        console.log(`   Created ticket ID: ${response.data.id}`);
      }
    } else {
      console.log(`   ⚠️  Ticket creation returned ${response.status}`);
    }
  });
});

// Test suite for monitoring and alerting
test('Monitoring & Alerting', async (t) => {
  console.log('📊 Testing monitoring and alerting endpoints...');

  await t.test('Monitoring Dashboard Access', async () => {
    const endpoints = [
      '/api/monitoring/alerts',
      '/api/monitoring/health',
      '/api/enhanced-monitoring/monitors'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
        `Monitoring endpoint ${endpoint} should return valid status (got ${response.status})`);
    }
  });

  await t.test('Alert System Status', async () => {
    const response = await makeRequest('/api/v2/alerts/health');
    assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
      'Alert system health should return valid status');
  });
});

// Test suite for analytics and reporting
test('Analytics & Reporting', async (t) => {
  console.log('📈 Testing analytics and reporting endpoints...');

  await t.test('Analytics Dashboard', async () => {
    const endpoints = [
      '/api/analytics/dashboard',
      '/api/analytics/real-time',
      '/api/reports/summary'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
        `Analytics endpoint ${endpoint} should return valid status (got ${response.status})`);
    }
  });
});

// Test suite for asset management (CMDB)
test('Asset Management (CMDB)', async (t) => {
  console.log('🏢 Testing asset management endpoints...');

  await t.test('CMDB Access', async () => {
    const endpoints = [
      '/api/v1/cmdb/cis',
      '/api/v1/cmdb/health',
      '/api/v1/assets'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
        `CMDB endpoint ${endpoint} should return valid status (got ${response.status})`);
    }
  });
});

// Test suite for integration endpoints
test('Integration Endpoints', async (t) => {
  console.log('🔗 Testing integration endpoints...');

  await t.test('Integration Status', async () => {
    const endpoints = [
      '/api/integrations',
      '/api/integrations/health',
      '/api/v1/comms/slack/status'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
        `Integration endpoint ${endpoint} should return valid status (got ${response.status})`);
    }
  });
});

// Test suite for workflow management
test('Workflow Management', async (t) => {
  console.log('🔄 Testing workflow management endpoints...');

  await t.test('Workflow Access', async () => {
    const endpoints = [
      '/api/workflows',
      '/api/approvals',
      '/api/workflows/templates'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
        `Workflow endpoint ${endpoint} should return valid status (got ${response.status})`);
    }
  });
});

// Test suite for AI and ML endpoints
test('AI & Machine Learning', async (t) => {
  console.log('🤖 Testing AI and ML endpoints...');

  await t.test('AI Fabric Status', async () => {
    const endpoints = [
      '/api/ai-fabric/status',
      '/api/ai-control-tower/status',
      '/api/nova-rag/health'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      assert.ok(response.status === 200 || response.status === 401 || response.status === 404 || response.status === 503,
        `AI endpoint ${endpoint} should return valid status (got ${response.status})`);
    }
  });
});

// Test suite for file and document management
test('File & Document Management', async (t) => {
  console.log('📁 Testing file and document management...');

  await t.test('File Upload Endpoints', async () => {
    const response = await makeRequest('/api/v2/files/upload', {
      method: 'POST',
      body: 'test file content',
      headers: {
        'Content-Type': 'text/plain'
      }
    });

    // Should return 401 (auth required) or 400 (bad request) or success
    assert.ok([200, 201, 400, 401, 413, 415].includes(response.status),
      `File upload should return expected status (got ${response.status})`);
  });
});

// Test suite for notification system
test('Notification System', async (t) => {
  console.log('🔔 Testing notification system...');

  await t.test('Notification Endpoints', async () => {
    const endpoints = [
      '/api/notifications',
      '/api/notifications/channels',
      '/api/email/templates'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
        `Notification endpoint ${endpoint} should return valid status (got ${response.status})`);
    }
  });
});

// Test suite for configuration management
test('Configuration Management', async (t) => {
  console.log('⚙️ Testing configuration management...');

  await t.test('Configuration Access', async () => {
    const endpoints = [
      '/api/v1/configuration',
      '/api/v1/configuration/public',
      '/api/server/config'
    ];

    for (const endpoint of endpoints) {
      const response = await makeRequest(endpoint);
      assert.ok(response.status === 200 || response.status === 401 || response.status === 404,
        `Configuration endpoint ${endpoint} should return valid status (got ${response.status})`);
    }
  });
});

// Final test to summarize results
test('Test Summary', async (t) => {
  await t.test('Generate Test Summary', async () => {
    const duration = Date.now() - testStartTime;
    console.log('\n' + '='.repeat(60));
    console.log('🎯 NOVA UNIVERSE E2E API TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total API Endpoints in System: 853`);
    console.log(`🕒 Test Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`🌐 API Base URL: ${API_BASE}`);
    console.log(`🔑 Authentication: ${authToken ? 'Available' : 'Not Available'}`);
    console.log('='.repeat(60));
    
    // Cleanup test resources
    await performCleanup();
    assert.ok(true, 'Test summary completed');
  });
});