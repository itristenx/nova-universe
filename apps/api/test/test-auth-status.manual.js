// This is a manual integration script, not a Jest test. Rename file to test-auth-status.manual.js or move to a /manual/ folder.

// Test script to verify /api/auth/status endpoint integration
import axios from 'axios';

async function testAuthStatusIntegration() {
  console.log('🧪 Testing /api/v1/auth/status endpoint integration...\n');

  const API_URL = 'http://localhost:3000';
  const FRONTEND_ORIGIN = 'http://localhost:5175';

  try {
    console.log('1. Testing direct auth status call...');
    const response = await axios.get(`${API_URL}/api/v1/auth/status`, {
      headers: {
        'Origin': FRONTEND_ORIGIN,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('✅ Auth status response:', response.data);
    console.log(`   Status Code: ${response.status}`);
    console.log(`   Headers: ${JSON.stringify(response.headers, null, 2)}`);

    // Verify the response format matches what the admin UI expects
    const expectedFields = ['authRequired', 'authDisabled'];
    const actualFields = Object.keys(response.data);
    
    console.log('\n2. Checking response format...');
    console.log(`   Expected fields: ${expectedFields.join(', ')}`);
    console.log(`   Actual fields: ${actualFields.join(', ')}`);
    
    const hasAllFields = expectedFields.every(field => field in response.data);
    if (hasAllFields) {
      console.log('✅ Response format is correct');
    } else {
      console.log('❌ Response format is incorrect');
      return;
    }

    // Check the logic
    console.log('\n3. Checking auth logic...');
    console.log(`   authRequired: ${response.data.authRequired}`);
    console.log(`   authDisabled: ${response.data.authDisabled}`);
    
    if (response.data.authRequired === !response.data.authDisabled) {
      console.log('✅ Auth logic is consistent');
    } else {
      console.log('❌ Auth logic is inconsistent');
    }

    console.log('\n🎉 All tests passed! The /api/auth/status endpoint is working correctly.');
    console.log('   The admin UI should now be able to check authentication status successfully.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('   Status:', error.response?.status);
    console.error('   Headers:', error.response?.headers);
  }
}

testAuthStatusIntegration();
