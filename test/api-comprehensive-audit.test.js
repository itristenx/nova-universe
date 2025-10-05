// Comprehensive API Endpoint Audit and Testing Suite
// Tests all API endpoints for completeness, security, and compliance with industry standards

import test from 'node:test';
import assert from 'node:assert';

// Test Configuration
const API_CONFIG = {
  baseUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  timeout: 30000,
};

// Utility class for making API requests
class APITester {
  static async makeRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Nova-API-Audit-Test',
      },
      timeout: API_CONFIG.timeout,
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const contentType = response.headers.get('content-type');
      let body;
      
      if (contentType && contentType.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }

      return {
        status: response.status,
        headers: response.headers,
        body,
        ok: response.ok,
      };
    } catch (error) {
      return {
        status: 0,
        error: error.message,
        ok: false,
      };
    }
  }

  static extractSecurityHeaders(headers) {
    return {
      'x-content-type-options': headers.get('x-content-type-options'),
      'x-frame-options': headers.get('x-frame-options'),
      'x-xss-protection': headers.get('x-xss-protection'),
      'strict-transport-security': headers.get('strict-transport-security'),
      'content-security-policy': headers.get('content-security-policy'),
      'x-powered-by': headers.get('x-powered-by'), // Should NOT be present
    };
  }
}

// Define all API endpoints to test based on the Master_Doc.txt and actual implementation
const API_ENDPOINTS = {
  // Core Health and Status
  health: [
    { path: '/health', method: 'GET', auth: false, description: 'Health check endpoint' },
    { path: '/api/health', method: 'GET', auth: false, description: 'API health check' },
  ],

  // Nova Helix - Identity Engine (v1)
  helix: [
    { path: '/api/v1/helix/session', method: 'GET', auth: true, description: 'Get current session' },
    { path: '/api/v1/helix/me/roles', method: 'GET', auth: true, description: 'Get user roles' },
    { path: '/api/v1/helix/audit/logs', method: 'GET', auth: true, description: 'Get audit logs' },
  ],

  // Nova Pulse - Technician Portal (v1)
  pulse: [
    { path: '/api/v1/pulse/tickets', method: 'GET', auth: true, description: 'List tickets' },
    { path: '/api/v1/pulse/tickets', method: 'POST', auth: true, description: 'Create ticket' },
    { path: '/api/v1/pulse/queues/metrics', method: 'GET', auth: false, description: 'Queue metrics' },
  ],

  // Nova Orbit - End-User Portal (v1)
  orbit: [
    { path: '/api/v1/orbit/my/tickets', method: 'GET', auth: true, description: 'Get my tickets' },
    { path: '/api/v1/orbit/request-catalog', method: 'GET', auth: true, description: 'Get request catalog' },
    { path: '/api/v1/orbit/submit-request', method: 'POST', auth: true, description: 'Submit request' },
  ],

  // Nova Lore - Knowledge Base (v1)
  lore: [
    { path: '/api/v1/lore/articles', method: 'GET', auth: false, description: 'List articles' },
    { path: '/api/v1/lore/search', method: 'GET', auth: false, description: 'Search articles' },
  ],

  // Nova Synth - AI Engine (v1 and v2)
  synth: [
    { path: '/api/v1/synth/classify', method: 'POST', auth: true, description: 'Classify ticket (v1)' },
    { path: '/api/v2/synth/classify', method: 'POST', auth: true, description: 'Classify ticket (v2)' },
    { path: '/api/v2/synth/recommendations', method: 'GET', auth: true, description: 'Get recommendations' },
  ],

  // Authentication
  auth: [
    { path: '/api/auth/login', method: 'POST', auth: false, description: 'User login' },
    { path: '/api/auth/logout', method: 'POST', auth: true, description: 'User logout' },
    { path: '/api/auth/register', method: 'POST', auth: false, description: 'User registration' },
  ],

  // Tickets (Legacy)
  tickets: [
    { path: '/api/tickets', method: 'GET', auth: true, description: 'List tickets (legacy)' },
    { path: '/api/tickets', method: 'POST', auth: true, description: 'Create ticket (legacy)' },
  ],

  // SCIM Provisioning
  scim: [
    { path: '/scim/v2/Users', method: 'GET', auth: true, description: 'List SCIM users' },
    { path: '/scim/v2/Groups', method: 'GET', auth: true, description: 'List SCIM groups' },
  ],

  // Monitoring (v2)
  monitoring: [
    { path: '/api/v2/monitoring/monitors', method: 'GET', auth: true, description: 'List monitors' },
    { path: '/api/v2/monitoring/incidents', method: 'GET', auth: true, description: 'List incidents' },
    { path: '/api/v2/monitoring/status', method: 'GET', auth: false, description: 'Get monitoring status' },
  ],

  // Service Catalog
  serviceCatalog: [
    { path: '/api/service-catalog', method: 'GET', auth: false, description: 'List catalog items' },
    { path: '/api/service-catalog-requests', method: 'GET', auth: true, description: 'List service requests' },
    { path: '/api/service-catalog-requests', method: 'POST', auth: true, description: 'Create service request' },
  ],

  // User 360 (v2)
  user360: [
    { path: '/api/v2/user360/profile', method: 'GET', auth: true, description: 'Get user profile' },
    { path: '/api/v2/user360/interactions', method: 'GET', auth: true, description: 'Get user interactions' },
  ],

  // Analytics
  analytics: [
    { path: '/api/analytics', method: 'GET', auth: true, description: 'Get analytics data' },
  ],

  // Configuration
  config: [
    { path: '/api/v1/config', method: 'GET', auth: true, description: 'Get configuration' },
  ],

  // RBAC
  rbac: [
    { path: '/api/rbac/roles', method: 'GET', auth: true, description: 'List roles' },
    { path: '/api/rbac/permissions', method: 'GET', auth: true, description: 'List permissions' },
  ],

  // Notifications (v2)
  notifications: [
    { path: '/api/v2/notifications', method: 'GET', auth: true, description: 'List notifications' },
    { path: '/api/v1/notifications/stream', method: 'GET', auth: false, description: 'SSE notification stream' },
  ],
};

// Test Suite: API Endpoint Inventory
test('API Endpoint Inventory and Accessibility', async (t) => {
  console.log('\n📊 Testing API Endpoint Inventory...\n');

  for (const [category, endpoints] of Object.entries(API_ENDPOINTS)) {
    await t.test(`${category} endpoints`, async () => {
      console.log(`\n  Testing ${category}:`);
      
      for (const endpoint of endpoints) {
        const result = await APITester.makeRequest(endpoint.path, {
          method: endpoint.method,
        });

        // For endpoints requiring auth, we expect 401 or 403 (not 404)
        // For public endpoints, we expect 200 or valid responses
        const isAccessible = result.status !== 404;
        
        if (endpoint.auth) {
          // Should reject without auth (401/403) or return data if auth disabled
          assert.ok(
            result.status === 401 || result.status === 403 || result.status === 200 || result.status === 400,
            `${endpoint.method} ${endpoint.path} should exist (got ${result.status})`
          );
          console.log(`    ✓ ${endpoint.method} ${endpoint.path} - ${result.status} (protected)`);
        } else {
          // Should be accessible or require specific headers
          console.log(`    ✓ ${endpoint.method} ${endpoint.path} - ${result.status} (public)`);
        }

        // Record endpoint for inventory
        if (!isAccessible) {
          console.log(`    ⚠️  ${endpoint.method} ${endpoint.path} - NOT FOUND (404)`);
        }
      }
    });
  }
});

// Test Suite: Security Headers
test('API Security Headers', async (t) => {
  console.log('\n🔒 Testing Security Headers...\n');

  const testEndpoints = [
    '/health',
    '/api/health',
    '/api/v1/config',
  ];

  for (const endpoint of testEndpoints) {
    await t.test(`Security headers on ${endpoint}`, async () => {
      const result = await APITester.makeRequest(endpoint);
      const secHeaders = APITester.extractSecurityHeaders(result.headers);

      console.log(`  Testing ${endpoint}:`);
      console.log(`    X-Content-Type-Options: ${secHeaders['x-content-type-options'] || 'MISSING'}`);
      console.log(`    X-Frame-Options: ${secHeaders['x-frame-options'] || 'MISSING'}`);
      console.log(`    X-XSS-Protection: ${secHeaders['x-xss-protection'] || 'MISSING'}`);
      console.log(`    Strict-Transport-Security: ${secHeaders['strict-transport-security'] || 'MISSING'}`);
      console.log(`    X-Powered-By: ${secHeaders['x-powered-by'] || 'Not Exposed (Good)'}`);

      // X-Powered-By should not be present (security best practice)
      assert.ok(
        !secHeaders['x-powered-by'],
        'X-Powered-By header should not be exposed'
      );

      // Check for presence of security headers
      if (secHeaders['x-content-type-options']) {
        console.log(`    ✓ X-Content-Type-Options is set`);
      } else {
        console.log(`    ⚠️  X-Content-Type-Options is missing`);
      }
    });
  }
});

// Test Suite: API Versioning
test('API Versioning Consistency', async (t) => {
  await t.test('v1 and v2 endpoint consistency', async () => {
    console.log('\n📌 Testing API Versioning...\n');

    const versionTests = [
      { v1: '/api/v1/helix/session', v2: null },
      { v1: '/api/v1/pulse/tickets', v2: null },
      { v1: '/api/v1/synth/classify', v2: '/api/v2/synth/classify' },
      { v1: null, v2: '/api/v2/user360/profile' },
      { v1: null, v2: '/api/v2/monitoring/status' },
    ];

    for (const test of versionTests) {
      if (test.v1) {
        const v1Result = await APITester.makeRequest(test.v1);
        console.log(`  v1: ${test.v1} - ${v1Result.status}`);
      }
      if (test.v2) {
        const v2Result = await APITester.makeRequest(test.v2);
        console.log(`  v2: ${test.v2} - ${v2Result.status}`);
      }
    }
  });
});

// Test Suite: Duplicate Endpoint Detection
test('Duplicate Endpoint Detection', async (t) => {
  await t.test('Check for duplicate route registrations', async () => {
    console.log('\n🔍 Checking for Duplicate Endpoints...\n');

    // List of known duplicate registrations to verify
    const potentialDuplicates = [
      { paths: ['/api/kiosks', '/api/v1/kiosks'], description: 'Kiosk endpoints' },
      { paths: ['/api/tickets', '/api/v1/pulse/tickets'], description: 'Ticket endpoints' },
      { paths: ['/api/v1/oauth', '/api/v1/oauth'], description: 'OAuth endpoints (registered twice?)' },
    ];

    for (const dup of potentialDuplicates) {
      console.log(`  Checking: ${dup.description}`);
      const results = [];
      
      for (const path of dup.paths) {
        const result = await APITester.makeRequest(path);
        results.push({ path, status: result.status });
        console.log(`    ${path} - ${result.status}`);
      }

      // Check if all return similar status codes
      const statuses = results.map(r => r.status);
      const allSimilar = statuses.every(s => s === statuses[0]);
      
      if (allSimilar && statuses[0] !== 404) {
        console.log(`    ⚠️  Potential duplicate: ${dup.description} (all return ${statuses[0]})`);
      }
    }
  });
});

// Test Suite: Rate Limiting
test('Rate Limiting', async (t) => {
  await t.test('Check rate limiting on public endpoints', async () => {
    console.log('\n⏱️  Testing Rate Limiting...\n');

    const endpoint = '/health';
    const requests = [];
    const numRequests = 150;

    console.log(`  Sending ${numRequests} requests to ${endpoint}...`);

    for (let i = 0; i < numRequests; i++) {
      requests.push(APITester.makeRequest(endpoint));
    }

    const results = await Promise.all(requests);
    const rateLimited = results.filter(r => r.status === 429);
    const successful = results.filter(r => r.status === 200);

    console.log(`  Successful: ${successful.length}`);
    console.log(`  Rate Limited (429): ${rateLimited.length}`);

    if (rateLimited.length > 0) {
      console.log('  ✓ Rate limiting is active');
      
      // Check for rate limit headers
      const rateLimitedResponse = results.find(r => r.status === 429);
      if (rateLimitedResponse) {
        console.log(`    X-RateLimit-Limit: ${rateLimitedResponse.headers.get('x-ratelimit-limit') || 'Not set'}`);
        console.log(`    X-RateLimit-Remaining: ${rateLimitedResponse.headers.get('x-ratelimit-remaining') || 'Not set'}`);
        console.log(`    X-RateLimit-Reset: ${rateLimitedResponse.headers.get('x-ratelimit-reset') || 'Not set'}`);
      }
    } else {
      console.log('  ⚠️  No rate limiting detected');
    }
  });
});

// Test Suite: Error Handling Consistency
test('Error Handling Consistency', async (t) => {
  await t.test('Check error response format consistency', async () => {
    console.log('\n❌ Testing Error Response Formats...\n');

    const errorEndpoints = [
      '/api/v1/helix/nonexistent',
      '/api/v1/pulse/tickets/invalid-id',
      '/api/nonexistent',
      '/api/v2/user360/nonexistent',
    ];

    for (const endpoint of errorEndpoints) {
      const result = await APITester.makeRequest(endpoint);
      
      console.log(`  ${endpoint}:`);
      console.log(`    Status: ${result.status}`);
      
      if (result.body && typeof result.body === 'object') {
        console.log(`    Has error field: ${!!result.body.error}`);
        console.log(`    Has message field: ${!!result.body.message}`);
        
        // Check that error responses don't expose sensitive information
        const bodyStr = JSON.stringify(result.body).toLowerCase();
        const hasSensitiveInfo = 
          bodyStr.includes('stack') || 
          bodyStr.includes('at object') ||
          bodyStr.includes('at process');
        
        if (hasSensitiveInfo) {
          console.log(`    ⚠️  May expose stack trace or sensitive info`);
        } else {
          console.log(`    ✓ No sensitive information exposed`);
        }
      }
    }
  });
});

// Test Suite: CORS Configuration
test('CORS Configuration', async (t) => {
  await t.test('Check CORS headers', async () => {
    console.log('\n🌐 Testing CORS Configuration...\n');

    const result = await APITester.makeRequest('/health', {
      headers: {
        'Origin': 'http://example.com',
      },
    });

    const corsHeaders = {
      'access-control-allow-origin': result.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': result.headers.get('access-control-allow-methods'),
      'access-control-allow-credentials': result.headers.get('access-control-allow-credentials'),
    };

    console.log(`  Access-Control-Allow-Origin: ${corsHeaders['access-control-allow-origin'] || 'Not set'}`);
    console.log(`  Access-Control-Allow-Methods: ${corsHeaders['access-control-allow-methods'] || 'Not set'}`);
    console.log(`  Access-Control-Allow-Credentials: ${corsHeaders['access-control-allow-credentials'] || 'Not set'}`);

    if (corsHeaders['access-control-allow-origin']) {
      console.log('  ✓ CORS is configured');
    } else {
      console.log('  ⚠️  CORS headers not detected (may require OPTIONS request)');
    }
  });
});

console.log('\n🚀 Starting Comprehensive API Audit...\n');
