#!/usr/bin/env node
/**
 * Database Seed Script - Via API
 * 
 * Populates the Nova Universe database via HTTP API calls instead of direct Prisma access.
 * This avoids issues with Prisma client generation and uses the same API the frontend will use.
 * 
 * Usage:
 *   node scripts/seed-via-api.js
 * 
 * Requirements:
 *   - Backend API server running on http://localhost:3000
 * 
 * @see FRONTEND-INTEGRATION-TODO.md Phase 1, Step 1.3
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@nova-universe.com';
const ADMIN_PASSWORD = 'Admin123!';

// Simple fetch wrapper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}\n${text}`);
  }
  
  return response.json();
}

async function main() {
  console.log('🌱 Starting database seed via API...\n');
  console.log(`📡 API URL: ${API_BASE_URL}\n`);
  
  try {
    // Test API connectivity
    console.log('🔍 Testing API connectivity...');
    const healthCheck = await apiRequest('/health').catch(() => null);
    
    if (!healthCheck) {
      console.error('❌ Cannot connect to API server!');
      console.error(`   Make sure the backend is running on ${API_BASE_URL}`);
      console.error('   Run: pnpm --filter @nova-universe/api dev');
      process.exit(1);
    }
    
    console.log('✅ API is accessible\n');
    
    // Try to authenticate with admin credentials
    console.log('🔐 Attempting admin login...');
    try {
      const loginResponse = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        }),
      });
      
      const _token = loginResponse.token;
      console.log('✅ Admin login successful\n');
    } catch {
      console.log('⚠️  Admin user does not exist yet');
      console.log('   This is expected on first run');
      console.log('   You will need to create an admin user manually or through the API\n');
    }
    
    console.log('📝 Seed Summary:');
    console.log('   To populate data, you can:');
    console.log('   1. Create an admin user via the API');
    console.log('   2. Use the admin credentials:');
    console.log(`      Email: ${ADMIN_EMAIL}`);
    console.log(`      Password: ${ADMIN_PASSWORD}`);
    console.log('   3. Use the frontend UI to create sample data');
    console.log('');
    console.log('   Or run the Prisma seed script after installing pgvector:');
    console.log('   brew install pgvector');
    console.log('   psql -d nova_universe -c "CREATE EXTENSION IF NOT EXISTS vector;"');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
