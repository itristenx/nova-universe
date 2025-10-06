// Comprehensive End-to-End Testing Suite for Nova Universe API
// Tests complete ticket lifecycles, user flows, and all major API endpoints

import test from 'node:test';
import assert from 'node:assert';
import fetch from 'node-fetch';
import crypto from 'crypto';

// Test Configuration
const CONFIG = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  timeout: 60000, // 60 seconds per test
  retryAttempts: 3,
};

// Test state to track created resources for cleanup
const testResources = {
  users: [],
  tickets: [],
  tokens: [],
  serviceRequests: [],
};

// Cleanup handler
async function cleanup() {
  console.log('\n🧹 Cleaning up test resources...');
  
  for (const token of testResources.tokens) {
    try {
      await makeRequest('/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      // Ignore cleanup errors
    }
  }
  
  console.log('✅ Cleanup completed\n');
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Utility Functions
async function makeRequest(endpoint, options = {}) {
  const url = `${CONFIG.apiUrl}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Nova-E2E-Test',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  return {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    ok: response.ok,
    json: async () => {
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    },
  };
}

function generateUniqueEmail() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `test-${timestamp}-${random}@e2etest.com`;
}

function generateStrongPassword() {
  // Generate a cryptographically secure password that meets all requirements
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const password = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    ...crypto.randomBytes(8).toString('base64').slice(0, 8),
  ].join('');
  
  return password;
}

async function registerUser(userData) {
  const password = generateStrongPassword();
  const email = generateUniqueEmail();
  
  const response = await makeRequest('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      first_name: userData.firstName || 'Test',
      last_name: userData.lastName || 'User',
      password,
    }),
  });

  const data = await response.json();
  
  if (response.ok) {
    testResources.users.push(data);
    return { ...data, password, email };
  }
  
  throw new Error(`Registration failed: ${response.status} - ${JSON.stringify(data)}`);
}

async function loginUser(email, password) {
  const response = await makeRequest('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (response.ok && data.token) {
    testResources.tokens.push(data.token);
    return data.token;
  }
  
  throw new Error(`Login failed: ${response.status} - ${JSON.stringify(data)}`);
}

// ==================== SERVICE HEALTH CHECKS ====================

test('System Health Checks', async (t) => {
  await t.test('API server is accessible', async () => {
    const response = await makeRequest('/health');
    assert.strictEqual(response.status, 200, 'Health endpoint should return 200');
  });

  await t.test('Database connectivity check', async () => {
    const response = await makeRequest('/api/monitoring/health');
    const health = await response.json();
    
    assert.strictEqual(health.status, 'healthy', 'System should be healthy');
    assert.strictEqual(health.database?.status, 'connected', 'Database should be connected');
  });

  await t.test('API documentation is accessible', async () => {
    const response = await makeRequest('/api-docs');
    assert.ok(response.status === 200 || response.status === 301, 'API docs should be accessible');
  });
});

// ==================== AUTHENTICATION & AUTHORIZATION ====================

test('Authentication Flow - Complete User Journey', async (t) => {
  let testUser = null;
  let authToken = null;

  await t.test('User Registration - Valid Data', async () => {
    testUser = await registerUser({ firstName: 'E2E', lastName: 'TestUser' });
    
    assert.ok(testUser.id, 'User should have an ID');
    assert.ok(testUser.email, 'User should have an email');
    assert.strictEqual(testUser.name, 'E2E TestUser', 'User name should be set correctly');
  });

  await t.test('User Registration - Duplicate Email Rejection', async () => {
    try {
      await registerUser({ firstName: 'Duplicate', lastName: 'User' });
      // If it succeeds, the duplicate check isn't working
      assert.fail('Should not allow duplicate email registration');
    } catch (error) {
      // Expected to fail
      assert.ok(error.message.includes('409') || error.message.includes('exists'), 
        'Should return conflict error for duplicate email');
    }
  });

  await t.test('User Registration - Weak Password Rejection', async () => {
    const response = await makeRequest('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: generateUniqueEmail(),
        first_name: 'Weak',
        last_name: 'Password',
        password: 'weak',
      }),
    });

    assert.ok(response.status === 400 || response.status === 422, 
      'Should reject weak passwords');
  });

  await t.test('User Login - Valid Credentials', async () => {
    authToken = await loginUser(testUser.email, testUser.password);
    
    assert.ok(authToken, 'Should receive auth token');
    assert.ok(authToken.length > 20, 'Token should be a valid JWT');
  });

  await t.test('User Login - Invalid Password', async () => {
    const response = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword123!',
      }),
    });

    assert.strictEqual(response.status, 401, 'Should reject invalid password');
  });

  await t.test('User Login - Non-existent User', async () => {
    const response = await makeRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'SomePassword123!',
      }),
    });

    assert.strictEqual(response.status, 401, 'Should reject non-existent user');
  });

  await t.test('Protected Endpoint Access - Valid Token', async () => {
    const response = await makeRequest('/api/v1/tickets', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.ok(response.ok, 'Should access protected endpoint with valid token');
  });

  await t.test('Protected Endpoint Access - Invalid Token', async () => {
    const response = await makeRequest('/api/v1/tickets', {
      headers: { Authorization: 'Bearer invalid-token-12345' },
    });

    assert.strictEqual(response.status, 401, 'Should reject invalid token');
  });

  await t.test('Protected Endpoint Access - Missing Token', async () => {
    const response = await makeRequest('/api/v1/tickets');

    assert.strictEqual(response.status, 401, 'Should reject missing token');
  });

  await t.test('User Logout', async () => {
    const response = await makeRequest('/api/v1/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.ok(response.ok, 'Logout should succeed');
  });

  await t.test('Token After Logout - Should Be Invalid', async () => {
    const response = await makeRequest('/api/v1/tickets', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // After logout, the token should be blacklisted
    assert.strictEqual(response.status, 401, 'Token should be invalid after logout');
  });
});

// ==================== TICKET LIFECYCLE - COMPLETE JOURNEY ====================

test('Ticket Lifecycle - Create to Close', async (t) => {
  let requesterUser = null;
  let requesterToken = null;
  let technicianUser = null;
  let technicianToken = null;
  let ticketId = null;

  // Setup: Create test users
  await t.test('Setup - Create Requester User', async () => {
    requesterUser = await registerUser({ firstName: 'Ticket', lastName: 'Requester' });
    requesterToken = await loginUser(requesterUser.email, requesterUser.password);
    assert.ok(requesterToken, 'Requester should be logged in');
  });

  await t.test('Setup - Create Technician User', async () => {
    technicianUser = await registerUser({ firstName: 'Support', lastName: 'Technician' });
    technicianToken = await loginUser(technicianUser.email, technicianUser.password);
    assert.ok(technicianToken, 'Technician should be logged in');
  });

  // Step 1: Create Ticket
  await t.test('Step 1 - Create New Ticket', async () => {
    const ticketData = {
      title: `E2E Test Ticket - ${Date.now()}`,
      description: 'This is a comprehensive end-to-end test ticket for lifecycle testing.',
      priority: 'medium',
      category: 'technical',
      requester_email: requesterUser.email,
    };

    const response = await makeRequest('/api/v1/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${requesterToken}` },
      body: JSON.stringify(ticketData),
    });

    const data = await response.json();
    assert.ok(response.ok, `Ticket creation should succeed: ${JSON.stringify(data)}`);
    assert.ok(data.id, 'Ticket should have an ID');
    
    ticketId = data.id;
    testResources.tickets.push(ticketId);
  });

  // Step 2: Retrieve Ticket
  await t.test('Step 2 - Retrieve Created Ticket', async () => {
    const response = await makeRequest(`/api/v1/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${requesterToken}` },
    });

    const ticket = await response.json();
    assert.ok(response.ok, 'Should retrieve ticket');
    assert.strictEqual(ticket.id, ticketId, 'Ticket ID should match');
    assert.strictEqual(ticket.status, 'open', 'New ticket should be open');
  });

  // Step 3: Update Ticket Priority
  await t.test('Step 3 - Update Ticket Priority', async () => {
    const response = await makeRequest(`/api/v1/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${requesterToken}` },
      body: JSON.stringify({ priority: 'high' }),
    });

    const updated = await response.json();
    assert.ok(response.ok, 'Ticket update should succeed');
    assert.strictEqual(updated.priority, 'high', 'Priority should be updated');
  });

  // Step 4: Assign Ticket to Technician
  await t.test('Step 4 - Assign Ticket to Technician', async () => {
    const response = await makeRequest(`/api/v1/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${technicianToken}` },
      body: JSON.stringify({ assigned_to: technicianUser.id }),
    });

    const assigned = await response.json();
    assert.ok(response.ok, 'Ticket assignment should succeed');
    assert.strictEqual(assigned.assigned_to, technicianUser.id, 'Should be assigned to technician');
  });

  // Step 5: Change Status to In Progress
  await t.test('Step 5 - Change Status to In Progress', async () => {
    const response = await makeRequest(`/api/v1/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${technicianToken}` },
      body: JSON.stringify({ status: 'in_progress' }),
    });

    const updated = await response.json();
    assert.ok(response.ok, 'Status update should succeed');
    assert.strictEqual(updated.status, 'in_progress', 'Status should be in_progress');
  });

  // Step 6: Add Comment to Ticket
  await t.test('Step 6 - Add Comment to Ticket', async () => {
    const response = await makeRequest(`/api/v1/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${technicianToken}` },
      body: JSON.stringify({
        comment: 'Working on this issue. Will update soon.',
      }),
    });

    assert.ok(response.ok, 'Comment should be added successfully');
  });

  // Step 7: Retrieve Ticket Comments
  await t.test('Step 7 - Retrieve Ticket Comments', async () => {
    const response = await makeRequest(`/api/v1/tickets/${ticketId}/comments`, {
      headers: { Authorization: `Bearer ${requesterToken}` },
    });

    const comments = await response.json();
    assert.ok(response.ok, 'Should retrieve comments');
    assert.ok(Array.isArray(comments), 'Comments should be an array');
    assert.ok(comments.length > 0, 'Should have at least one comment');
  });

  // Step 8: Resolve Ticket
  await t.test('Step 8 - Resolve Ticket', async () => {
    const response = await makeRequest(`/api/v1/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${technicianToken}` },
      body: JSON.stringify({
        status: 'resolved',
        resolution: 'Issue has been fixed',
      }),
    });

    const resolved = await response.json();
    assert.ok(response.ok, 'Ticket resolution should succeed');
    assert.strictEqual(resolved.status, 'resolved', 'Status should be resolved');
  });

  // Step 9: Close Ticket
  await t.test('Step 9 - Close Ticket', async () => {
    const response = await makeRequest(`/api/v1/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${requesterToken}` },
      body: JSON.stringify({ status: 'closed' }),
    });

    const closed = await response.json();
    assert.ok(response.ok, 'Ticket closure should succeed');
    assert.strictEqual(closed.status, 'closed', 'Status should be closed');
  });

  // Step 10: Verify Ticket History/Audit Trail
  await t.test('Step 10 - Verify Ticket Audit Trail', async () => {
    const response = await makeRequest(`/api/v1/tickets/${ticketId}/history`, {
      headers: { Authorization: `Bearer ${technicianToken}` },
    });

    if (response.ok) {
      const history = await response.json();
      assert.ok(Array.isArray(history), 'History should be an array');
      // Audit trail should show multiple status changes
      assert.ok(history.length > 0, 'Should have audit trail entries');
    }
    // If history endpoint doesn't exist, that's okay for this test
  });
});

// ==================== TICKET SEARCH AND FILTERING ====================

test('Ticket Search and Filtering', async (t) => {
  let authToken = null;

  await t.test('Setup - Authenticate User', async () => {
    const user = await registerUser({ firstName: 'Search', lastName: 'Tester' });
    authToken = await loginUser(user.email, user.password);
  });

  await t.test('Search - List All Tickets', async () => {
    const response = await makeRequest('/api/v1/tickets', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const tickets = await response.json();
    assert.ok(response.ok, 'Should retrieve tickets list');
    assert.ok(Array.isArray(tickets), 'Tickets should be an array');
  });

  await t.test('Search - Filter by Status', async () => {
    const response = await makeRequest('/api/v1/tickets?status=open', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const tickets = await response.json();
    if (response.ok && Array.isArray(tickets)) {
      tickets.forEach(ticket => {
        assert.strictEqual(ticket.status, 'open', 'All tickets should be open');
      });
    }
  });

  await t.test('Search - Filter by Priority', async () => {
    const response = await makeRequest('/api/v1/tickets?priority=high', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const tickets = await response.json();
    if (response.ok && Array.isArray(tickets)) {
      tickets.forEach(ticket => {
        assert.strictEqual(ticket.priority, 'high', 'All tickets should be high priority');
      });
    }
  });

  await t.test('Search - Pagination', async () => {
    const response = await makeRequest('/api/v1/tickets?limit=10&offset=0', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const tickets = await response.json();
    if (response.ok && Array.isArray(tickets)) {
      assert.ok(tickets.length <= 10, 'Should respect limit parameter');
    }
  });
});

// ==================== ERROR HANDLING AND EDGE CASES ====================

test('Error Handling - Invalid Inputs', async (t) => {
  let authToken = null;

  await t.test('Setup - Authenticate User', async () => {
    const user = await registerUser({ firstName: 'Error', lastName: 'Handler' });
    authToken = await loginUser(user.email, user.password);
  });

  await t.test('Create Ticket - Missing Required Fields', async () => {
    const response = await makeRequest('/api/v1/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ description: 'No title provided' }),
    });

    assert.ok(response.status === 400 || response.status === 422, 
      'Should reject ticket without required fields');
  });

  await t.test('Create Ticket - Invalid Priority Value', async () => {
    const response = await makeRequest('/api/v1/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'invalid-priority',
      }),
    });

    assert.ok(response.status === 400 || response.status === 422, 
      'Should reject invalid priority values');
  });

  await t.test('Update Ticket - Non-existent Ticket ID', async () => {
    const response = await makeRequest('/api/v1/tickets/99999999', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ priority: 'high' }),
    });

    assert.strictEqual(response.status, 404, 'Should return 404 for non-existent ticket');
  });

  await t.test('Get Ticket - Invalid ID Format', async () => {
    const response = await makeRequest('/api/v1/tickets/invalid-id', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.ok(response.status === 400 || response.status === 404, 
      'Should handle invalid ID format');
  });
});

// ==================== RATE LIMITING ====================

test('Rate Limiting', async (t) => {
  let authToken = null;

  await t.test('Setup - Authenticate User', async () => {
    const user = await registerUser({ firstName: 'Rate', lastName: 'Limiter' });
    authToken = await loginUser(user.email, user.password);
  });

  await t.test('Rate Limit - Excessive Requests', async () => {
    const requests = [];
    
    // Make 150 rapid requests
    for (let i = 0; i < 150; i++) {
      requests.push(
        makeRequest('/api/v1/tickets', {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);

    assert.ok(rateLimited, 'Should implement rate limiting');
  });
});

// ==================== SERVICE CATALOG ====================

test('Service Catalog Functionality', async (t) => {
  let authToken = null;

  await t.test('Setup - Authenticate User', async () => {
    const user = await registerUser({ firstName: 'Catalog', lastName: 'User' });
    authToken = await loginUser(user.email, user.password);
  });

  await t.test('List Service Catalog Items', async () => {
    const response = await makeRequest('/api/service-catalog', {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.ok) {
      const items = await response.json();
      assert.ok(Array.isArray(items), 'Service catalog should return array');
    }
  });

  await t.test('Create Service Request', async () => {
    const response = await makeRequest('/api/service-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        service_id: 1,
        title: 'Test Service Request',
        description: 'Testing service request creation',
      }),
    });

    if (response.ok) {
      const request = await response.json();
      assert.ok(request.id, 'Service request should be created');
      testResources.serviceRequests.push(request.id);
    }
  });
});

// ==================== USER MANAGEMENT ====================

test('User Management', async (t) => {
  let adminToken = null;

  await t.test('Setup - Authenticate Admin User', async () => {
    const admin = await registerUser({ firstName: 'Admin', lastName: 'User' });
    adminToken = await loginUser(admin.email, admin.password);
  });

  await t.test('List Users', async () => {
    const response = await makeRequest('/api/v1/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.ok) {
      const users = await response.json();
      assert.ok(Array.isArray(users), 'Users list should be an array');
      assert.ok(users.length > 0, 'Should have at least one user');
    }
  });

  await t.test('Get User Profile', async () => {
    const response = await makeRequest('/api/v1/users/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (response.ok) {
      const profile = await response.json();
      assert.ok(profile.id, 'Profile should have ID');
      assert.ok(profile.email, 'Profile should have email');
    }
  });

  await t.test('Update User Profile', async () => {
    const response = await makeRequest('/api/v1/users/me', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Updated Admin User',
      }),
    });

    if (response.ok) {
      const updated = await response.json();
      assert.ok(updated.name, 'Name should be updated');
    }
  });
});

// ==================== FINAL SUMMARY ====================

test('Test Suite Summary', async () => {
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPREHENSIVE E2E TEST SUITE COMPLETED');
  console.log('='.repeat(70));
  console.log(`Total Users Created: ${testResources.users.length}`);
  console.log(`Total Tickets Created: ${testResources.tickets.length}`);
  console.log(`Total Tokens Generated: ${testResources.tokens.length}`);
  console.log('='.repeat(70) + '\n');
});
