#!/usr/bin/env node

// Test script for Queue Metrics API endpoints with JWT authentication

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/v1';

// JWT token generated for testing
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlci1pZCIsIm5hbWUiOiJUZXN0IEFkbWluIiwiZW1haWwiOiJhZG1pbkBub3ZhLmxvY2FsIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU0NDQ5NDU4LCJleHAiOjE3NTQ0NTMwNTh9.zV09MeNTwPQpTdvPDBJk4ZG8J-oAjnR8yzo9BjQYThw';

// Helper function to make authenticated requests
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'No JSON response' };
    }
    
    return {
      status: response.status,
      success: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
}

// Test Queue Metrics Endpoints
async function testQueueMetrics() {
  console.log('📊 Testing Queue Metrics API with JWT Authentication\n');
  
  // Test 1: Get all queue metrics
  console.log('1️⃣ Testing GET /pulse/queues/metrics');
  const metricsResult = await makeRequest('/pulse/queues/metrics');
  
  console.log(`Status: ${metricsResult.status}`);
  if (metricsResult.success) {
    console.log('✅ Queue metrics retrieved successfully');
    console.log('Data:', JSON.stringify(metricsResult.data, null, 2));
  } else {
    console.log('❌ Failed to get queue metrics');
    console.log('Error:', JSON.stringify(metricsResult.data, null, 2));
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Get agents for a specific queue
  console.log('2️⃣ Testing GET /pulse/queues/general/agents');
  const agentsResult = await makeRequest('/pulse/queues/general/agents');
  
  console.log(`Status: ${agentsResult.status}`);
  if (agentsResult.success) {
    console.log('✅ Queue agents retrieved successfully');
    console.log('Data:', JSON.stringify(agentsResult.data, null, 2));
  } else {
    console.log('❌ Failed to get queue agents');
    console.log('Error:', JSON.stringify(agentsResult.data, null, 2));
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 3: Test availability toggle
  console.log('3️⃣ Testing POST /pulse/queues/general/agents/availability');
  const availabilityResult = await makeRequest('/pulse/queues/general/agents/availability', {
    method: 'POST',
    body: JSON.stringify({
      available: true
    })
  });
  
  console.log(`Status: ${availabilityResult.status}`);
  if (availabilityResult.success) {
    console.log('✅ Availability toggle successful');
    console.log('Data:', JSON.stringify(availabilityResult.data, null, 2));
  } else {
    console.log('❌ Failed to toggle availability');
    console.log('Error:', JSON.stringify(availabilityResult.data, null, 2));
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 4: Test with a different queue
  console.log('4️⃣ Testing GET /pulse/queues/technical/agents');
  const techAgentsResult = await makeRequest('/pulse/queues/technical/agents');
  
  console.log(`Status: ${techAgentsResult.status}`);
  if (techAgentsResult.success) {
    console.log('✅ Technical queue agents retrieved successfully');
    console.log('Data:', JSON.stringify(techAgentsResult.data, null, 2));
  } else {
    console.log('❌ Failed to get technical queue agents');
    console.log('Error:', JSON.stringify(techAgentsResult.data, null, 2));
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
console.log('🚀 Starting Queue Metrics API Tests with JWT\n');
checkApiConnection().then(connected => {
  if (connected) {
    testQueueMetrics().then(() => {
      console.log('\n🎉 Test run completed!');
    });
  } else {
    console.log('Please ensure the API server is running');
  }
});
