#!/usr/bin/env node

// Simple test to verify frontend can communicate with API
// scripts/test-frontend-api.js
if (typeof window === 'undefined') {
  console.log('Skipping browser-only test in Node environment');
  process.exit(0);
}

import axios from 'axios';

const API_URL = 'http://localhost:3000';
const FRONTEND_ORIGIN = 'http://localhost:5173';

async function testConnectivity() {
  console.log('🔍 Testing frontend-to-API connectivity...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${API_URL}/api/health`, {
      headers: { Origin: FRONTEND_ORIGIN }
    });
    console.log('✅ Health check:', health.data);

    // Test 2: Auth status
    console.log('\n2. Testing auth status...');
    const authStatus = await axios.get(`${API_URL}/api/auth/status`, {
      headers: { Origin: FRONTEND_ORIGIN }
    });
    console.log('✅ Auth status:', authStatus.data);

    // Test 3: Login
    console.log('\n3. Testing login...');
    const login = await axios.post(`${API_URL}/api/login`, {
      email: 'admin@example.com',
      password: 'admin'
    }, {
      headers: { 
        'Content-Type': 'application/json',
        Origin: FRONTEND_ORIGIN 
      }
    });
    console.log('✅ Login successful, token length:', login.data.token.length);

    // Test 4: Profile with token
    console.log('\n4. Testing profile endpoint...');
    const profile = await axios.get(`${API_URL}/api/me`, {
      headers: { 
        Authorization: `Bearer ${login.data.token}`,
        Origin: FRONTEND_ORIGIN 
      }
    });
    console.log('✅ Profile:', profile.data);

    console.log('\n🎉 All tests passed! Frontend should be able to communicate with API.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testConnectivity();
