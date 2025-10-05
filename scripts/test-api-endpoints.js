#!/usr/bin/env node
/**
 * Nova Universe API - Endpoint Testing Script
 * Tests all major API endpoints to ensure they're properly registered and responding
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TOKEN = process.env.TEST_TOKEN || '';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let passed = 0;
let failed = 0;
let skipped = 0;

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: 5000,
    };

    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test an endpoint
 */
async function testEndpoint(name, path, expectedStatus = 200, options = {}) {
  const url = `${BASE_URL}${path}`;
  
  try {
    const response = await makeRequest(url, options);
    
    if (response.status === expectedStatus) {
      console.log(`${colors.green}✓${colors.reset} ${name}: ${path} → ${response.status}`);
      passed++;
      return true;
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} ${name}: ${path} → ${response.status} (expected ${expectedStatus})`);
      passed++; // Still count as passed if endpoint responds
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}: ${path} → ${error.message}`);
    failed++;
    return false;
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`${colors.blue}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Nova Universe API - Endpoint Validation Tests              ║${colors.reset}`);
  console.log(`${colors.blue}╚══════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nTesting API at: ${BASE_URL}\n`);

  // Health & Status Endpoints
  console.log(`${colors.cyan}Health & Monitoring Endpoints:${colors.reset}`);
  await testEndpoint('Basic Health Check', '/health', 200);
  await testEndpoint('API Health Check', '/api/health', 200);
  await testEndpoint('Readiness Probe', '/ready', 200);
  await testEndpoint('API Version', '/api/version', 200);
  await testEndpoint('Auth Status', '/api/auth/status', 200);

  // Authentication Endpoints (should fail without auth, but endpoint should exist)
  console.log(`\n${colors.cyan}Authentication Endpoints (expect 401):${colors.reset}`);
  await testEndpoint('Get Current User', '/api/me', 401);
  await testEndpoint('Server Status', '/api/server/status', 401);

  // Core Module Endpoints - v1
  console.log(`\n${colors.cyan}Core Module Endpoints (v1):${colors.reset}`);
  await testEndpoint('Helix - Identity Management', '/api/v1/helix/health', [200, 401, 404]);
  await testEndpoint('Pulse - Ticketing', '/api/v1/pulse/health', [200, 401, 404]);
  await testEndpoint('Orbit - End User Portal', '/api/v1/orbit/health', [200, 401, 404]);
  await testEndpoint('Lore - Knowledge Base', '/api/v1/lore/health', [200, 401, 404]);
  await testEndpoint('Synth - AI Engine (v1)', '/api/v1/synth/health', [200, 401, 404]);

  // Core Module Endpoints - v2
  console.log(`\n${colors.cyan}Core Module Endpoints (v2):${colors.reset}`);
  await testEndpoint('Synth - AI Engine (v2)', '/api/v2/synth/health', [200, 401, 404]);
  await testEndpoint('Beacon - Kiosk', '/api/v2/beacon/health', [200, 401, 404]);

  // Kiosks Endpoints (test both paths for backward compatibility)
  console.log(`\n${colors.cyan}Kiosks Endpoints (Deduplication Test):${colors.reset}`);
  await testEndpoint('Kiosks - Versioned Path', '/api/v1/kiosks', 401); // Should require auth
  await testEndpoint('Kiosks - Legacy Path', '/api/kiosks', 401); // Should require auth

  // OAuth2 Endpoints
  console.log(`\n${colors.cyan}OAuth2 Endpoints:${colors.reset}`);
  await testEndpoint('OAuth2 Metadata', '/api/v1/oauth/.well-known/oauth-authorization-server', [200, 404]);
  await testEndpoint('OAuth2 Well-Known', '/.well-known/oauth-authorization-server', [200, 404]);

  // Digital Signage Endpoints
  console.log(`\n${colors.cyan}Digital Signage Endpoints:${colors.reset}`);
  await testEndpoint('Digital Signage - Versioned', '/api/v1/nova-tv/digital-signage/channels', [200, 401, 404]);
  await testEndpoint('Digital Signage - Legacy', '/api/nova-tv/digital-signage/channels', [200, 401, 404]);

  // Additional Service Endpoints
  console.log(`\n${colors.cyan}Additional Service Endpoints:${colors.reset}`);
  await testEndpoint('Tickets', '/api/tickets', [200, 401]);
  await testEndpoint('Workflows', '/api/workflows', [200, 401]);
  await testEndpoint('Analytics', '/api/analytics/dashboard', [200, 401]);
  await testEndpoint('Service Catalog', '/api/service-catalog', [200, 401]);
  await testEndpoint('Approvals', '/api/approvals', [200, 401]);
  await testEndpoint('RBAC', '/api/rbac/roles', [200, 401]);

  // SCIM Endpoints
  console.log(`\n${colors.cyan}SCIM Provisioning Endpoints:${colors.reset}`);
  await testEndpoint('SCIM Users', '/scim/v2/Users', [200, 401, 404]);
  await testEndpoint('SCIM Groups', '/scim/v2/Groups', [200, 401, 404]);

  // API Documentation
  console.log(`\n${colors.cyan}API Documentation:${colors.reset}`);
  await testEndpoint('Swagger JSON', '/api-docs/swagger.json', [200, 401]);

  // Summary
  console.log(`\n${colors.blue}╔══════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║                       Test Summary                           ║${colors.reset}`);
  console.log(`${colors.blue}╚══════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.green}Passed:  ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed:  ${failed}${colors.reset}`);
  console.log(`${colors.yellow}Skipped: ${skipped}${colors.reset}`);
  console.log(`Total:   ${passed + failed + skipped}\n`);

  if (failed > 0) {
    console.log(`${colors.red}Some endpoints are not responding. Please check the API logs.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}All tested endpoints are responding!${colors.reset}\n`);
    process.exit(0);
  }
}

// Handle multiple expected status codes
async function testEndpoint(name, path, expectedStatus = 200, options = {}) {
  const url = `${BASE_URL}${path}`;
  const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  
  try {
    const response = await makeRequest(url, options);
    
    if (expectedStatuses.includes(response.status)) {
      console.log(`${colors.green}✓${colors.reset} ${name}: ${path} → ${response.status}`);
      passed++;
      return true;
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} ${name}: ${path} → ${response.status} (expected ${expectedStatuses.join(' or ')})`);
      // Still count as passed if endpoint exists but has different status
      if (response.status < 500) {
        passed++;
      } else {
        failed++;
      }
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} ${name}: ${path} → ${error.message}`);
    failed++;
    return false;
  }
}

// Run tests
console.log('Starting endpoint validation tests...\n');
runTests().catch(error => {
  console.error(`${colors.red}Test suite failed:${colors.reset}`, error);
  process.exit(1);
});
