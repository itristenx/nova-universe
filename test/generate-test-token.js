#!/usr/bin/env node

// Script to generate a test JWT token for our queue metrics testing

import jwt from 'jsonwebtoken';

const JWT_SECRET = 'dev_jwt_secret_change_in_production';

// Create a test token for our admin user
const payload = {
  id: 'test-user-id', // We'll use a simple ID since our user creation script generated a UUID
  name: 'Test Admin',
  email: 'admin@nova.local',
  roles: ['admin'],
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
};

const token = jwt.sign(payload, JWT_SECRET);

console.log('🎫 Generated test JWT token:');
console.log(token);

console.log('\n📋 Token payload:');
console.log(JSON.stringify(payload, null, 2));

console.log('\n✅ Copy this token and use it in your API tests with:');
console.log(`Authorization: Bearer ${token}`);

// Verify the token works
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('\n🔍 Token verification successful:');
  console.log(JSON.stringify(decoded, null, 2));
} catch (error) {
  console.log('\n❌ Token verification failed:', error.message);
}
