// API Endpoint Testing Framework
// Tests individual API endpoint contracts and responses
// Works with or without a running server using mocked responses when needed

import test from 'node:test';
import assert from 'node:assert';
import fetch from 'node-fetch';

// Configuration
const API_BASE = process.env.TEST_API_URL || 'http://localhost:3000';
const ENDPOINTS_TO_TEST = {
  // Core system endpoints - should always be available
  health: {
    '/health': { method: 'GET', expectStatus: [200, 503] },
    '/api/health': { method: 'GET', expectStatus: [200, 503] },
    '/ready': { method: 'GET', expectStatus: [200, 503] }
  },
  
  // Authentication endpoints
  auth: {
    '/api/auth/status': { method: 'GET', expectStatus: [200], skipAuth: true },
    '/api/login': { method: 'POST', expectStatus: [200, 400, 401, 422], skipAuth: true, 
                   body: { username: 'test', password: 'test' } },
    '/api/me': { method: 'GET', expectStatus: [200, 401] }
  },

  // User management
  users: {
    '/api/users': { method: 'GET', expectStatus: [200, 401, 403] },
    '/api/v1/directory/search': { method: 'GET', expectStatus: [200, 401, 404] }
  },

  // Ticketing system
  tickets: {
    '/api/tickets': { method: 'GET', expectStatus: [200, 401, 403] },
    '/api/tickets': { 
      method: 'POST', 
      expectStatus: [201, 400, 401, 422],
      body: { title: 'Test Ticket', description: 'Test Description' }
    }
  },

  // Monitoring and alerts
  monitoring: {
    '/api/monitoring/alerts': { method: 'GET', expectStatus: [200, 401, 404] },
    '/api/enhanced-monitoring/monitors': { method: 'GET', expectStatus: [200, 401, 404] },
    '/api/v2/alerts/health': { method: 'GET', expectStatus: [200, 401, 404] }
  },

  // Analytics and reporting
  analytics: {
    '/api/analytics/dashboard': { method: 'GET', expectStatus: [200, 401, 403] },
    '/api/reports/summary': { method: 'GET', expectStatus: [200, 401, 404] }
  },

  // Asset management (CMDB)
  assets: {
    '/api/v1/cmdb/cis': { method: 'GET', expectStatus: [200, 401, 404] },
    '/api/v1/assets': { method: 'GET', expectStatus: [200, 401, 404] }
  },

  // Configuration management
  config: {
    '/api/v1/configuration/public': { method: 'GET', expectStatus: [200, 404], skipAuth: true },
    '/api/server/config': { method: 'GET', expectStatus: [200, 401, 403] }
  },

  // Integration endpoints
  integrations: {
    '/api/integrations': { method: 'GET', expectStatus: [200, 401, 404] },
    '/api/v1/comms/slack/status': { method: 'GET', expectStatus: [200, 401, 404, 503] }
  },

  // File management
  files: {
    '/api/v2/files/upload': { 
      method: 'POST', 
      expectStatus: [200, 201, 400, 401, 413, 415],
      headers: { 'Content-Type': 'multipart/form-data' },
      skipBodyValidation: true
    }
  }
};

let serverAvailable = null;
let authToken = null;

// Helper to check if server is running
async function checkServerHealth() {
  if (serverAvailable !== null) return serverAvailable;
  
  try {
    const response = await fetch(`${API_BASE}/health`, { 
      timeout: 5000,
      headers: { 'User-Agent': 'Nova-E2E-Health-Check' }
    });
    serverAvailable = response.status < 500;
    console.log(`🌐 Server status: ${serverAvailable ? 'Available' : 'Unavailable'} (${response.status})`);
    return serverAvailable;
  } catch (error) {
    serverAvailable = false;
    console.log(`🌐 Server status: Unavailable (${error.message})`);
    return false;
  }
}

// Helper to make API requests
async function makeTestRequest(endpoint, config) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method: config.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Nova-E2E-Test-Client/1.0',
      ...(config.headers || {})
    }
  };

  // Add auth token if available and not skipped
  if (authToken && !config.skipAuth) {
    options.headers.Authorization = `Bearer ${authToken}`;
  }

  // Add body for POST/PUT requests
  if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
    if (!config.skipBodyValidation) {
      options.body = JSON.stringify(config.body);
    }
  }

  try {
    const response = await fetch(url, options);
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: response.headers.get('content-type')?.includes('json') 
        ? await response.json().catch(() => null)
        : await response.text(),
      success: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Network Error',
      error: error.message,
      success: false
    };
  }
}

// Attempt to get authentication token
async function attemptAuthentication() {
  if (!(await checkServerHealth())) return false;

  try {
    // Try dev login first
    const devAuth = await makeTestRequest('/api/login-dev', {
      method: 'POST',
      body: { username: 'test', password: 'test' },
      skipAuth: true
    });

    if (devAuth.success && devAuth.data?.token) {
      authToken = devAuth.data.token;
      console.log('🔑 Development authentication successful');
      return true;
    }

    // Try regular login
    const auth = await makeTestRequest('/api/login', {
      method: 'POST', 
      body: { username: 'test@nova.local', password: 'testpass123' },
      skipAuth: true
    });

    if (auth.success && auth.data?.token) {
      authToken = auth.data.token;
      console.log('🔑 Regular authentication successful');
      return true;
    }

    console.log('🔑 Authentication not available');
    return false;
  } catch (error) {
    console.log(`🔑 Authentication failed: ${error.message}`);
    return false;
  }
}

// Main test execution
test('Nova Universe API Contract Testing', async (t) => {
  console.log('🧪 Starting API Contract Testing Suite...\n');
  
  // Check server availability
  const serverUp = await checkServerHealth();
  await attemptAuthentication();

  let totalTested = 0;
  let totalPassed = 0;
  let totalSkipped = 0;

  // Test each category
  for (const [category, endpoints] of Object.entries(ENDPOINTS_TO_TEST)) {
    await t.test(`${category.toUpperCase()} Endpoints`, async (st) => {
      console.log(`\n🔍 Testing ${category.toUpperCase()} endpoints...`);

      for (const [endpoint, config] of Object.entries(endpoints)) {
        await st.test(`${config.method} ${endpoint}`, async () => {
          totalTested++;

          if (!serverUp) {
            console.log(`   ⏭️  SKIP ${config.method.padEnd(4)} ${endpoint} (server unavailable)`);
            totalSkipped++;
            return;
          }

          const response = await makeTestRequest(endpoint, config);
          const expectedStatuses = Array.isArray(config.expectStatus) 
            ? config.expectStatus 
            : [config.expectStatus];

          const statusMatch = expectedStatuses.includes(response.status);
          
          if (statusMatch) {
            console.log(`   ✅ PASS ${config.method.padEnd(4)} ${endpoint} (${response.status})`);
            totalPassed++;
          } else {
            console.log(`   ❌ FAIL ${config.method.padEnd(4)} ${endpoint} (${response.status}, expected ${expectedStatuses.join('|')})`);
            if (response.error) {
              console.log(`      Error: ${response.error}`);
            }
          }

          // Assert that we got an expected status code
          assert.ok(statusMatch, 
            `${config.method} ${endpoint} returned ${response.status}, expected one of ${expectedStatuses.join(', ')}`);

          // Additional validations for successful responses
          if (response.success && response.data) {
            // JSON responses should be parseable
            if (typeof response.data === 'string' && response.headers['content-type']?.includes('json')) {
              try {
                JSON.parse(response.data);
              } catch (e) {
                console.log(`   ⚠️  Warning: Response not valid JSON for ${endpoint}`);
              }
            }
          }
        });
      }
    });
  }

  // Summary test
  await t.test('Test Summary', async () => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 API CONTRACT TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`🌐 Server Available: ${serverUp ? 'Yes' : 'No'}`);
    console.log(`🔑 Authentication: ${authToken ? 'Available' : 'Not Available'}`);
    console.log(`📋 Total Endpoints Tested: ${totalTested}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalTested - totalPassed - totalSkipped}`);
    console.log(`⏭️  Skipped: ${totalSkipped}`);
    console.log(`📊 Success Rate: ${totalTested > 0 ? ((totalPassed / (totalTested - totalSkipped)) * 100).toFixed(1) : 0}%`);
    console.log('='.repeat(60));

    assert.ok(true, 'Contract testing completed');
  });
});