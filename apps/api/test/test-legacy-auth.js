#!/usr/bin/env node

import fetch from 'node-fetch';

async function testLegacyAuth() {
  try {
    console.log('🧪 Testing legacy auth endpoint...\n');
    
    const API_URL = 'http://localhost:3000';
    
    // Test login with admin@example.com / admin123
    console.log('1. Testing login with admin@example.com / admin123...');
    
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
      }),
    });
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('   Token:', loginResult.token ? `${loginResult.token.substring(0, 20)}...` : 'No token');
      console.log('   Response:', loginResult);
      
      // Test the token by calling a protected endpoint
      if (loginResult.token) {
        console.log('\n2. Testing token authentication...');
        
        const profileResponse = await fetch(`${API_URL}/api/auth/status`, {
          headers: {
            'Authorization': `Bearer ${loginResult.token}`,
          },
        });
        
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          console.log('✅ Token authentication successful!');
          console.log('   Profile:', profile);
        } else {
          console.log('❌ Token authentication failed:', profileResponse.status);
        }
      }
      
    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', loginResponse.status);
      console.log('   Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testLegacyAuth();
