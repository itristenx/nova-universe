#!/usr/bin/env node

// Simple test script to verify our queue metrics endpoints work
// This bypasses authentication for initial testing

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/v1';

// Helper function to _make _requests without authentication
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    }); // TODO-LINT: move to async function
    
    const data = await response.json(); // TODO-LINT: move to async function
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

// Test our endpoints
async function testEndpoints() {
  console.log('🔧 Testing Queue Metrics Endpoints (without auth)...\n');
  
  // Test 1: Try to access queue metrics
  console.log('1️⃣ Testing GET /pulse/queues/metrics');
  const metricsResult = await makeRequest('/pulse/queues/metrics'); // TODO-LINT: move to async function
  
  console.log(`Status: ${metricsResult.status}`);
  console.log('Response:', JSON.stringify(metricsResult.data, null, 2));
  
  // Test 2: Try to access health endpoint
  console.log('\n2️⃣ Testing GET /health');
  const healthResult = await makeRequest('/health'); // TODO-LINT: move to async function
  
  console.log(`Status: ${healthResult.status}`);
  console.log('Response:', JSON.stringify(healthResult.data, null, 2));
  
  // Test 3: Check available endpoints
  console.log('\n3️⃣ Testing GET /server-info');
  const infoResult = await makeRequest('/server-info'); // TODO-LINT: move to async function
  
  console.log(`Status: ${infoResult.status}`);
  if (infoResult.success) {
    console.log('Available endpoints include our queue metrics:', 
      infoResult.data.routes?.some(route => route.includes('pulse/queues')) || 'Not found');
  }
}

// Run the tests
console.log('🚀 Starting Basic Endpoint Tests\n');
testEndpoints();
