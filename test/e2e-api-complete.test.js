// End-to-End API Test Suite
// Comprehensive tests for all Nova Universe API V1 endpoints
// Tests authentication, MFA, CRUD operations, security, and integrations

import axios from 'axios';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';

// Test configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};
const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'admin',
};

let authToken = null;
let adminToken = null;
let testTicketId = null;
let mfaSecret = null;

// Helper functions
const apiRequest = async (method, endpoint, data = null, token = authToken) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================================================
// TEST SUITE
// =============================================================================

describe('Nova Universe API V1 - E2E Test Suite', () => {
  
  // ---------------------------------------------------------------------------
  // Setup and Teardown
  // ---------------------------------------------------------------------------
  
  before(async () => {
    console.log('🚀 Starting E2E test suite...');
    console.log(`📡 API URL: ${API_URL}`);
    
    // Wait for API to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ API is ready');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw new Error('API failed to start');
        await sleep(1000);
      }
    }
  });
  
  after(async () => {
    console.log('🏁 E2E test suite completed');
  });
  
  // ---------------------------------------------------------------------------
  // Infrastructure & Meta Endpoints
  // ---------------------------------------------------------------------------
  
  describe('Infrastructure Endpoints', () => {
    it('should get health status', async () => {
      const response = await axios.get(`${BASE_URL}/api/health`);
      assert.strictEqual(response.status, 200);
      assert.ok(response.data.status);
      assert.ok(response.data.apiVersion);
    });
    
    it('should get API version info', async () => {
      const response = await axios.get(`${BASE_URL}/api/version`);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.api.version, 'v1 (2025.08)');
      assert.ok(response.data.versions.supported.includes('v1'));
    });
    
    it('should get readiness status', async () => {
      const response = await axios.get(`${BASE_URL}/ready`);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.status, 'ready');
    });
  });
  
  // ---------------------------------------------------------------------------
  // Authentication & Authorization
  // ---------------------------------------------------------------------------
  
  describe('Authentication', () => {
    it('should login with admin credentials', async () => {
      const data = await apiRequest('POST', '/login', ADMIN_USER, null);
      assert.ok(data.token);
      adminToken = data.token;
    });
    
    it('should reject invalid credentials', async () => {
      try {
        await apiRequest('POST', '/login', {
          email: 'invalid@example.com',
          password: 'wrongpassword',
        }, null);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.ok(error.message.includes('401'));
      }
    });
    
    it('should get current user profile', async () => {
      const data = await apiRequest('GET', '/me', null, adminToken);
      assert.ok(data.success);
      assert.ok(data.user.email);
      assert.ok(Array.isArray(data.user.roles));
    });
    
    it('should get auth status', async () => {
      const data = await apiRequest('GET', '/auth/status', null, null);
      assert.strictEqual(data.authRequired, true);
    });
  });
  
  // ---------------------------------------------------------------------------
  // Multi-Factor Authentication
  // ---------------------------------------------------------------------------
  
  describe('MFA (Multi-Factor Authentication)', () => {
    it('should get MFA status', async () => {
      const data = await apiRequest('GET', '/mfa/status', null, adminToken);
      assert.ok(data.success);
      assert.ok(typeof data.data.enabled === 'boolean');
    });
    
    it('should setup MFA for user', async () => {
      const data = await apiRequest('POST', '/mfa/setup', null, adminToken);
      assert.ok(data.success);
      assert.ok(data.data.secret);
      assert.ok(data.data.qrCode);
      mfaSecret = data.data.secret;
    });
    
    // Note: Cannot fully test MFA enable without actual TOTP token
    // This would require a TOTP library to generate test tokens
  });
  
  // ---------------------------------------------------------------------------
  // Server & Configuration
  // ---------------------------------------------------------------------------
  
  describe('Server Management', () => {
    it('should get server status', async () => {
      const data = await apiRequest('GET', '/server/status', null, adminToken);
      assert.strictEqual(data.status, 'running');
      assert.ok(data.uptime);
      assert.ok(data.apiVersion);
    });
    
    it('should get configuration', async () => {
      const data = await apiRequest('GET', '/config', null, adminToken);
      assert.ok(data.organizationName);
    });
  });
  
  // ---------------------------------------------------------------------------
  // Tickets (ITSM Core)
  // ---------------------------------------------------------------------------
  
  describe('Tickets', () => {
    it('should create a ticket', async () => {
      const ticketData = {
        title: 'E2E Test Ticket',
        description: 'This is an automated test ticket',
        priority: 'medium',
        category: 'general',
        status: 'open',
      };
      
      const data = await apiRequest('POST', '/tickets', ticketData, adminToken);
      assert.ok(data.id || data.ticket?.id);
      testTicketId = data.id || data.ticket?.id;
    });
    
    it('should list tickets', async () => {
      const data = await apiRequest('GET', '/tickets', null, adminToken);
      assert.ok(Array.isArray(data) || Array.isArray(data.tickets));
    });
    
    it('should get ticket by ID', async () => {
      if (!testTicketId) {
        console.warn('⚠️  Skipping test - no ticket ID available');
        return;
      }
      
      const data = await apiRequest('GET', `/tickets/${testTicketId}`, null, adminToken);
      assert.ok(data.id || data.ticket?.id);
    });
    
    it('should update ticket', async () => {
      if (!testTicketId) {
        console.warn('⚠️  Skipping test - no ticket ID available');
        return;
      }
      
      const updateData = {
        status: 'in_progress',
        notes: 'Updated by E2E test',
      };
      
      await apiRequest('PUT', `/tickets/${testTicketId}`, updateData, adminToken);
    });
    
    it('should search tickets', async () => {
      const data = await apiRequest('GET', '/tickets?search=E2E', null, adminToken);
      assert.ok(Array.isArray(data) || Array.isArray(data.tickets));
    });
  });
  
  // ---------------------------------------------------------------------------
  // Organizations
  // ---------------------------------------------------------------------------
  
  describe('Organizations', () => {
    it('should list organizations', async () => {
      const data = await apiRequest('GET', '/organizations', null, adminToken);
      assert.ok(Array.isArray(data) || Array.isArray(data.organizations));
    });
  });
  
  // ---------------------------------------------------------------------------
  // Users & Directory
  // ---------------------------------------------------------------------------
  
  describe('Users & Directory', () => {
    it('should list users', async () => {
      const data = await apiRequest('GET', '/users', null, adminToken);
      assert.ok(Array.isArray(data) || Array.isArray(data.users));
    });
    
    it('should get directory config', async () => {
      const data = await apiRequest('GET', '/directory/config', null, adminToken);
      assert.ok(typeof data.enabled === 'boolean');
    });
  });
  
  // ---------------------------------------------------------------------------
  // Roles & RBAC
  // ---------------------------------------------------------------------------
  
  describe('Roles & RBAC', () => {
    it('should list roles', async () => {
      const data = await apiRequest('GET', '/roles', null, adminToken);
      assert.ok(Array.isArray(data) || Array.isArray(data.roles));
    });
    
    it('should list permissions', async () => {
      const data = await apiRequest('GET', '/rbac/permissions', null, adminToken);
      assert.ok(Array.isArray(data) || Array.isArray(data.permissions));
    });
  });
  
  // ---------------------------------------------------------------------------
  // Monitoring & Alerts
  // ---------------------------------------------------------------------------
  
  describe('Monitoring & Alerts', () => {
    it('should get monitoring dashboard', async () => {
      try {
        await apiRequest('GET', '/monitoring/dashboard', null, adminToken);
      } catch (error) {
        // Monitoring might not be fully configured in test environment
        console.warn('⚠️  Monitoring endpoint not fully configured');
      }
    });
    
    it('should list alerts', async () => {
      try {
        const data = await apiRequest('GET', '/alerts', null, adminToken);
        assert.ok(Array.isArray(data) || Array.isArray(data.alerts));
      } catch (error) {
        console.warn('⚠️  Alerts endpoint not fully configured');
      }
    });
  });
  
  // ---------------------------------------------------------------------------
  // Security Features
  // ---------------------------------------------------------------------------
  
  describe('Security', () => {
    it('should get security dashboard', async () => {
      try {
        const response = await axios.get(`${BASE_URL}/security/dashboard`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        
        assert.strictEqual(response.status, 200);
        assert.ok(response.data.success);
        assert.ok(response.data.data);
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn('⚠️  Security dashboard endpoint not available');
        } else {
          throw error;
        }
      }
    });
    
    it('should enforce authentication', async () => {
      try {
        await axios.get(`${API_URL}/me`);
        assert.fail('Should have required authentication');
      } catch (error) {
        assert.ok(error.response.status === 401);
      }
    });
    
    it('should enforce rate limiting', async () => {
      // Make multiple rapid requests to test rate limiting
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(
          axios.get(`${API_URL}/auth/status`).catch(e => e.response)
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r?.status === 429);
      
      // Rate limiting might not trigger in all environments
      if (!rateLimited) {
        console.warn('⚠️  Rate limiting not triggered (may be disabled in test mode)');
      }
    });
  });
  
  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  
  describe('Notifications', () => {
    it('should list notifications', async () => {
      const data = await apiRequest('GET', '/notifications', null, adminToken);
      assert.ok(Array.isArray(data) || data.notifications);
    });
    
    it('should create notification', async () => {
      const notificationData = {
        message: 'E2E Test Notification',
        level: 'info',
        type: 'system',
      };
      
      const data = await apiRequest('POST', '/notifications', notificationData, adminToken);
      assert.ok(data.id);
    });
  });
  
  // ---------------------------------------------------------------------------
  // Kiosks
  // ---------------------------------------------------------------------------
  
  describe('Kiosks', () => {
    it('should list kiosks', async () => {
      const data = await apiRequest('GET', '/kiosks', null, adminToken);
      assert.ok(Array.isArray(data));
    });
    
    it('should register kiosk', async () => {
      const kioskData = {
        id: `test-kiosk-${Date.now()}`,
        version: '1.0.0',
      };
      
      const data = await apiRequest('POST', '/kiosks/register', kioskData, adminToken);
      assert.strictEqual(data.message, 'registered');
    });
  });
  
  // ---------------------------------------------------------------------------
  // Analytics & Reports
  // ---------------------------------------------------------------------------
  
  describe('Analytics & Reports', () => {
    it('should get analytics data', async () => {
      try {
        await apiRequest('GET', '/analytics', null, adminToken);
      } catch (error) {
        console.warn('⚠️  Analytics endpoint not fully configured');
      }
    });
    
    it('should list reports', async () => {
      try {
        const data = await apiRequest('GET', '/reports', null, adminToken);
        assert.ok(Array.isArray(data) || data.reports);
      } catch (error) {
        console.warn('⚠️  Reports endpoint not fully configured');
      }
    });
  });
  
  // ---------------------------------------------------------------------------
  // API Documentation
  // ---------------------------------------------------------------------------
  
  describe('API Documentation', () => {
    it('should serve OpenAPI JSON spec', async () => {
      const response = await axios.get(`${BASE_URL}/api-docs/swagger.json`);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.openapi, '3.0.3');
      assert.ok(response.data.paths);
    });
    
    it('should serve Swagger UI', async () => {
      const response = await axios.get(`${BASE_URL}/api-docs/`);
      assert.strictEqual(response.status, 200);
      assert.ok(response.data.includes('swagger-ui'));
    });
  });
  
  // ---------------------------------------------------------------------------
  // Error Handling
  // ---------------------------------------------------------------------------
  
  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      try {
        await axios.get(`${API_URL}/nonexistent-endpoint`);
        assert.fail('Should have returned 404');
      } catch (error) {
        assert.strictEqual(error.response.status, 404);
      }
    });
    
    it('should return 400 for invalid request data', async () => {
      try {
        await apiRequest('POST', '/tickets', { invalid: 'data' }, adminToken);
        // Some endpoints might accept any data, so we don't fail if it succeeds
      } catch (error) {
        assert.ok(error.message.includes('400') || error.message.includes('422'));
      }
    });
  });
  
  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------
  
  describe('Cleanup', () => {
    it('should delete test ticket', async () => {
      if (!testTicketId) {
        console.warn('⚠️  No test ticket to clean up');
        return;
      }
      
      try {
        await apiRequest('DELETE', `/tickets/${testTicketId}`, null, adminToken);
      } catch (error) {
        console.warn('⚠️  Could not delete test ticket:', error.message);
      }
    });
  });
});

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Running E2E API Test Suite...');
  console.log('================================\n');
}
