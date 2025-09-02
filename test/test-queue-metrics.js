#!/usr/bin/env node

// Test script for Queue Metrics API endpoints
// Handles authentication and tests all queue-related endpoints

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/v1';

let authToken = null;

// Test credentials (we'll need to check if these exist in the database)
const TEST_CREDENTIALS = {
  email: 'admin@nova.local',
  password: 'admin123',
  authMethod: 'password',
};

// Helper function to make authenticated requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return {
      status: response.status,
      success: response.ok,
      data,
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      error: error.message,
    };
  }
}

// Step 1: Tenant Discovery
async function discoverTenant() {
  console.log('🔍 Discovering tenant...');

  const result = await makeRequest('/helix/login/tenant/discover', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_CREDENTIALS.email,
    }),
  });

  if (result.success) {
    console.log('✅ Tenant discovery successful');
    return result.data.discoveryToken;
  } else {
    console.log('❌ Tenant discovery failed:', result.data);
    return null;
  }
}

// Step 2: Simple Authentication
async function authenticate() {
  console.log('🔐 Authenticating...');

  const result = await makeRequest('/helix/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
    }),
  });

  if (result.success && result.data.token) {
    console.log('✅ Authentication successful');
    authToken = result.data.token;
    return true;
  } else {
    console.log('❌ Authentication failed:', result.data);
    return false;
  }
}

// Test Queue Metrics Endpoints
async function testQueueMetrics() {
  console.log('\n📊 Testing Queue Metrics API...');

  // Test 1: Get all queue metrics
  console.log('\n1️⃣ Testing GET /pulse/queues/metrics');
  const metricsResult = await makeRequest('/pulse/queues/metrics');

  if (metricsResult.success) {
    console.log('✅ Queue metrics retrieved successfully');
    console.log('Data:', JSON.stringify(metricsResult.data, null, 2));
  } else {
    console.log('❌ Failed to get queue metrics:', metricsResult.data);
  }

  // Test 2: Get agents for a specific queue (we'll use the first queue from metrics)
  if (metricsResult.success && metricsResult.data.length > 0) {
    const firstQueue = metricsResult.data[0];
    console.log(`\n2️⃣ Testing GET /pulse/queues/${firstQueue.queueName}/agents`);

    const agentsResult = await makeRequest(`/pulse/queues/${firstQueue.queueName}/agents`);

    if (agentsResult.success) {
      console.log('✅ Queue agents retrieved successfully');
      console.log('Data:', JSON.stringify(agentsResult.data, null, 2));
    } else {
      console.log('❌ Failed to get queue agents:', agentsResult.data);
    }
  }

  // Test 3: Test availability toggle (we need a user ID for this)
  console.log('\n3️⃣ Testing POST /pulse/queues/general/agents/availability');
  const availabilityResult = await makeRequest('/pulse/queues/general/agents/availability', {
    method: 'POST',
    body: JSON.stringify({
      available: true,
    }),
  });

  if (availabilityResult.success) {
    console.log('✅ Availability toggle successful');
    console.log('Data:', JSON.stringify(availabilityResult.data, null, 2));
  } else {
    console.log('❌ Failed to toggle availability:', availabilityResult.data);
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Queue Metrics API Tests\n');

  try {
    // Step 1: Discover tenant (optional but good for testing)
    const discoveryToken = await discoverTenant();
    if (discoveryToken) {
      console.log('✅ Tenant discovery completed with token:', discoveryToken.substring(0, 10) + '...');
    }

    // Step 2: Authenticate directly
    const authSuccess = await authenticate();
    if (!authSuccess) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }

    // Step 3: Test queue metrics endpoints
    await testQueueMetrics();

    console.log('\n🎉 Test run completed!');
  } catch (error) {
    console.error('💥 Test script error:', error);
  }
}

// Check if we can connect to the API
async function checkApiConnection() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log('✅ API server is running');
      return true;
    } else {
      console.log('❌ API server returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to API server:', error.message);
    return false;
  }
}

// Run the tests
checkApiConnection().then((connected) => {
  if (connected) {
    runTests();
  } else {
    console.log('Please start the API server first with: npm run dev:api');
  }
});
