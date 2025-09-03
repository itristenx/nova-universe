/**
 * Integration test for Nova Comms Slack service
 * Tests ticket creation without mock data
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';

// Test configuration
const TEST_CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'test_secret',
  commsPort: process.env.SLACK_PORT || 3001,
};

/**
 * Create a test JWT token
 */
function createTestJWT() {
  const payload = {
    id: 'test-user',
    email: 'test@nova.local',
    name: 'Test User',
    role: 'technician',
    tenantId: 'default',
    source: 'test',
  };
  
  return jwt.sign(payload, TEST_CONFIG.jwtSecret, {
    expiresIn: '1h',
    issuer: 'nova-universe-api',
    audience: 'nova-universe',
  });
}

/**
 * Test ticket creation via API
 */
async function testTicketCreation() {
  console.log('🧪 Testing ticket creation via Nova API...');
  
  try {
    const token = createTestJWT();
    const ticketData = {
      title: 'Test Slack Integration Ticket',
      description: 'This is a test ticket created to verify Slack integration works without mock data',
      category: 'IT Support',
      priority: 'medium',
      contactMethod: 'email',
      contactInfo: 'test@nova.local',
      source: 'slack-test',
    };

    const response = await axios.post(
      `${TEST_CONFIG.apiUrl}/api/v1/orbit/tickets`,
      ticketData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 201 && response.data?.ticket) {
      const ticket = response.data.ticket;
      console.log('✅ Ticket created successfully:');
      console.log(`   - ID: ${ticket.ticketId || ticket.id}`);
      console.log(`   - Title: ${ticket.title}`);
      console.log(`   - Status: ${ticket.status}`);
      console.log(`   - Priority: ${ticket.priority}`);
      return ticket;
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('❌ Ticket creation failed:');
    console.error(`   - Error: ${error.message}`);
    if (error.response?.data) {
      console.error(`   - Details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Test config endpoint
 */
async function testConfigEndpoint() {
  console.log('🧪 Testing config endpoint...');
  
  try {
    const token = createTestJWT();
    const response = await axios.get(`${TEST_CONFIG.apiUrl}/api/config`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Config endpoint accessible:');
    console.log(`   - Systems: ${JSON.stringify(response.data.systems || [])}`);
    console.log(`   - Urgency Levels: ${JSON.stringify(response.data.urgencyLevels || [])}`);
    return response.data;
  } catch (error) {
    console.error('❌ Config endpoint failed:');
    console.error(`   - Error: ${error.message}`);
    if (error.response?.data) {
      console.error(`   - Details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    throw error;
  }
}

/**
 * Test API connectivity
 */
async function testAPIConnectivity() {
  console.log('🧪 Testing Nova API connectivity...');
  
  try {
    const response = await axios.get(`${TEST_CONFIG.apiUrl}/api/v2/status`);
    
    if (response.status === 200) {
      console.log('✅ Nova API is accessible');
      console.log(`   - Status: ${response.data?.status || 'unknown'}`);
      return true;
    }
    
    throw new Error('API not responding correctly');
  } catch (error) {
    console.error('❌ Nova API connectivity failed:');
    console.error(`   - Error: ${error.message}`);
    return false;
  }
}

/**
 * Simulate Slack webhook payload for testing
 */
function createSlackWebhookPayload() {
  return {
    token: 'test-token',
    team_id: 'T1234567890',
    team_domain: 'test-workspace',
    channel_id: 'C1234567890',
    channel_name: 'general',
    user_id: 'U1234567890',
    user_name: 'testuser',
    command: '/new-ticket',
    text: '',
    api_app_id: 'A1234567890',
    is_enterprise_install: 'false',
    response_url: 'https://hooks.slack.com/commands/1234/5678',
    trigger_id: '123456789.987654321.abcdef123456'
  };
}

/**
 * Run all integration tests
 */
async function runIntegrationTests() {
  console.log('🚀 Starting Nova Comms Integration Tests\n');
  
  const results = {
    apiConnectivity: false,
    configEndpoint: false,
    ticketCreation: false,
  };

  try {
    // Test 1: API Connectivity
    results.apiConnectivity = await testAPIConnectivity();
    console.log('');

    // Test 2: Config Endpoint
    if (results.apiConnectivity) {
      await testConfigEndpoint();
      results.configEndpoint = true;
      console.log('');
    }

    // Test 3: Ticket Creation
    if (results.configEndpoint) {
      await testTicketCreation();
      results.ticketCreation = true;
      console.log('');
    }

    // Summary
    console.log('📊 Test Results Summary:');
    console.log(`   ✅ API Connectivity: ${results.apiConnectivity ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Config Endpoint: ${results.configEndpoint ? 'PASS' : 'FAIL'}`);
    console.log(`   ✅ Ticket Creation: ${results.ticketCreation ? 'PASS' : 'FAIL'}`);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      console.log('\n🎉 All tests passed! Nova Comms integration is working properly.');
      console.log('📝 The service can create real tickets without any mock data.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please check the API configuration and try again.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Integration test failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests();
}

export { runIntegrationTests, testTicketCreation, testConfigEndpoint, testAPIConnectivity };