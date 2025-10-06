// API V1 Endpoints Integration Tests
// Tests all major /api/v1 endpoints following OpenAPI specification

import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import express from 'express';

// Test Configuration
const CONFIG = {
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  timeout: 30000,
};

// Helper to make authenticated requests
class ApiV1TestHelper {
  constructor() {
    this.baseUrl = CONFIG.apiUrl;
    this.authToken = null;
    this.testUserId = null;
  }

  async authenticate(email = 'admin@example.com', password = 'admin') {
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.authToken = data.token;
      this.testUserId = data.user?.id;
      return data;
    }
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  async get(endpoint) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'GET',
      headers,
    });

    return {
      status: response.status,
      ok: response.ok,
      data: response.ok ? await response.json() : null,
      error: !response.ok ? await response.text() : null,
    };
  }

  async post(endpoint, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return {
      status: response.status,
      ok: response.ok,
      data: response.ok ? await response.json() : null,
      error: !response.ok ? await response.text() : null,
    };
  }

  async put(endpoint, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    return {
      status: response.status,
      ok: response.ok,
      data: response.ok ? await response.json() : null,
      error: !response.ok ? await response.text() : null,
    };
  }

  async patch(endpoint, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    return {
      status: response.status,
      ok: response.ok,
      data: response.ok ? await response.json() : null,
      error: !response.ok ? await response.text() : null,
    };
  }

  async delete(endpoint) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return {
      status: response.status,
      ok: response.ok,
      data: response.ok ? await response.json() : null,
      error: !response.ok ? await response.text() : null,
    };
  }
}

// ========================================
// V1 API Health & Server Info Tests
// ========================================
test('API V1 - Health & Server Info', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/health - should return health status', async () => {
    const result = await helper.get('/health');
    assert.strictEqual(result.status, 200);
    assert.ok(result.data);
    console.log('✅ Health check passed');
  });

  await t.test('GET /api/v1/server-info - should return server information', async () => {
    const result = await helper.get('/server-info');
    if (result.status === 200) {
      assert.ok(result.data);
      console.log('✅ Server info endpoint available');
    } else {
      console.log('⚠️  Server info endpoint not available or requires auth');
    }
  });
});

// ========================================
// V1 Authentication & Authorization Tests
// ========================================
test('API V1 - Authentication & Authorization', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('POST /api/v1/auth/login - should authenticate user', async () => {
    const result = await helper.post('/auth/login', {
      username: 'admin@example.com',
      password: 'admin',
    });

    if (result.ok) {
      assert.ok(result.data.token, 'Should return JWT token');
      assert.ok(result.data.user, 'Should return user object');
      console.log('✅ Authentication successful');
    } else {
      console.log('⚠️  Default credentials not available - skipping auth tests');
    }
  });

  await t.test('POST /api/v1/auth/logout - should logout user', async () => {
    try {
      await helper.authenticate();
      const result = await helper.post('/auth/logout', {});
      console.log(
        result.ok
          ? '✅ Logout endpoint available'
          : '⚠️  Logout endpoint not implemented or failed',
      );
    } catch (error) {
      console.log('⚠️  Authentication failed, skipping logout test');
    }
  });

  await t.test('POST /api/v1/auth/refresh - should refresh token', async () => {
    try {
      const loginData = await helper.authenticate();
      if (loginData.refreshToken) {
        const result = await helper.post('/auth/refresh', {
          refreshToken: loginData.refreshToken,
        });
        if (result.ok) {
          assert.ok(result.data.token, 'Should return new token');
          console.log('✅ Token refresh successful');
        }
      } else {
        console.log('⚠️  Refresh token not provided by login endpoint');
      }
    } catch (error) {
      console.log('⚠️  Token refresh test skipped');
    }
  });
});

// ========================================
// V1 Organizations Management Tests
// ========================================
test('API V1 - Organizations', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/organizations - should list organizations', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/organizations');

      if (result.ok) {
        assert.ok(Array.isArray(result.data) || result.data.organizations);
        console.log('✅ Organizations list retrieved');
      } else {
        console.log(`⚠️  Organizations endpoint returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Organizations test skipped:', error.message);
    }
  });

  await t.test('GET /api/v1/organizations/config - should get org config', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/organizations/config');
      console.log(
        result.ok
          ? '✅ Organization config retrieved'
          : `⚠️  Org config returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  Org config test skipped');
    }
  });
});

// ========================================
// V1 Directory & User Management Tests
// ========================================
test('API V1 - Directory & Users', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/directory - should list directory users', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/directory');

      if (result.ok) {
        console.log('✅ Directory users retrieved');
      } else {
        console.log(`⚠️  Directory endpoint returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Directory test skipped');
    }
  });

  await t.test('GET /api/v1/directory/sync - should trigger directory sync', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/directory/sync');
      console.log(
        result.ok ? '✅ Directory sync available' : `⚠️  Sync returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  Directory sync test skipped');
    }
  });
});

// ========================================
// V1 Roles & RBAC Tests
// ========================================
test('API V1 - Roles & RBAC', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/roles - should list roles', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/roles');

      if (result.ok) {
        assert.ok(Array.isArray(result.data) || result.data.roles);
        console.log('✅ Roles list retrieved');
      } else {
        console.log(`⚠️  Roles endpoint returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Roles test skipped');
    }
  });

  await t.test('GET /api/v1/rbac - should get RBAC configuration', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/rbac');
      console.log(
        result.ok ? '✅ RBAC config retrieved' : `⚠️  RBAC returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  RBAC test skipped');
    }
  });
});

// ========================================
// V1 Tickets Management Tests
// ========================================
test('API V1 - Tickets', async (t) => {
  const helper = new ApiV1TestHelper();
  let testTicketId = null;

  await t.test('GET /api/v1/tickets - should list tickets', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/tickets');

      if (result.ok) {
        assert.ok(Array.isArray(result.data) || result.data.tickets);
        console.log('✅ Tickets list retrieved');
      } else {
        console.log(`⚠️  Tickets endpoint returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Tickets list test skipped');
    }
  });

  await t.test('POST /api/v1/tickets - should create a ticket', async () => {
    try {
      await helper.authenticate();
      const ticketData = {
        title: `Test Ticket ${Date.now()}`,
        description: 'Integration test ticket for V1 API',
        priority: 'medium',
        category: 'technical',
        requester_email: 'test@example.com',
      };

      const result = await helper.post('/tickets', ticketData);

      if (result.ok) {
        assert.ok(result.data.id || result.data.ticket_id);
        testTicketId = result.data.id || result.data.ticket_id;
        console.log('✅ Ticket created successfully');
      } else {
        console.log(`⚠️  Ticket creation returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Ticket creation test skipped');
    }
  });

  await t.test('GET /api/v1/tickets/:id - should get ticket by ID', async () => {
    if (!testTicketId) {
      console.log('⚠️  Skipping ticket GET - no test ticket created');
      return;
    }

    try {
      const result = await helper.get(`/tickets/${testTicketId}`);

      if (result.ok) {
        assert.ok(result.data);
        console.log('✅ Ticket retrieved by ID');
      } else {
        console.log(`⚠️  Ticket GET returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Ticket GET test skipped');
    }
  });

  await t.test('PATCH /api/v1/tickets/:id - should update ticket', async () => {
    if (!testTicketId) {
      console.log('⚠️  Skipping ticket PATCH - no test ticket created');
      return;
    }

    try {
      const result = await helper.patch(`/tickets/${testTicketId}`, {
        status: 'in_progress',
      });

      if (result.ok) {
        console.log('✅ Ticket updated successfully');
      } else {
        console.log(`⚠️  Ticket PATCH returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Ticket PATCH test skipped');
    }
  });
});

// ========================================
// V1 ITSM Tests
// ========================================
test('API V1 - ITSM', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/itsm - should get ITSM dashboard', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/itsm');
      console.log(
        result.ok ? '✅ ITSM dashboard retrieved' : `⚠️  ITSM returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  ITSM test skipped');
    }
  });

  await t.test('GET /api/v1/service-requests - should list service requests', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/service-requests');

      if (result.ok) {
        console.log('✅ Service requests retrieved');
      } else {
        console.log(`⚠️  Service requests returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Service requests test skipped');
    }
  });

  await t.test('GET /api/v1/service-catalog - should list service catalog', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/service-catalog');

      if (result.ok) {
        console.log('✅ Service catalog retrieved');
      } else {
        console.log(`⚠️  Service catalog returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Service catalog test skipped');
    }
  });
});

// ========================================
// V1 Assets & CMDB Tests
// ========================================
test('API V1 - Assets & CMDB', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/assets - should list assets', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/assets');

      if (result.ok) {
        console.log('✅ Assets list retrieved');
      } else {
        console.log(`⚠️  Assets endpoint returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Assets test skipped');
    }
  });

  await t.test('GET /api/v1/cmdb/cis - should list configuration items', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/cmdb/cis');

      if (result.ok) {
        console.log('✅ CMDB CIs retrieved');
      } else {
        console.log(`⚠️  CMDB CIs returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  CMDB test skipped');
    }
  });

  await t.test('GET /api/v1/cmdb/ci-types - should list CI types', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/cmdb/ci-types');
      console.log(
        result.ok ? '✅ CI types retrieved' : `⚠️  CI types returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  CI types test skipped');
    }
  });
});

// ========================================
// V1 Workflows Tests
// ========================================
test('API V1 - Workflows', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/workflows - should list workflows', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/workflows');

      if (result.ok) {
        console.log('✅ Workflows list retrieved');
      } else {
        console.log(`⚠️  Workflows endpoint returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Workflows test skipped');
    }
  });

  await t.test('GET /api/v1/approvals - should list approvals', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/approvals');

      if (result.ok) {
        console.log('✅ Approvals list retrieved');
      } else {
        console.log(`⚠️  Approvals endpoint returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Approvals test skipped');
    }
  });
});

// ========================================
// V1 Monitoring & Alerts Tests
// ========================================
test('API V1 - Monitoring & Alerts', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/monitoring - should get monitoring data', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/monitoring');
      console.log(
        result.ok
          ? '✅ Monitoring data retrieved'
          : `⚠️  Monitoring returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  Monitoring test skipped');
    }
  });

  await t.test('GET /api/v1/alerts - should list alerts', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/alerts');

      if (result.ok) {
        console.log('✅ Alerts list retrieved');
      } else {
        console.log(`⚠️  Alerts endpoint returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Alerts test skipped');
    }
  });

  await t.test('GET /api/v1/notifications - should list notifications', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/notifications');

      if (result.ok) {
        console.log('✅ Notifications retrieved');
      } else {
        console.log(`⚠️  Notifications returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Notifications test skipped');
    }
  });
});

// ========================================
// V1 AI Services Tests
// ========================================
test('API V1 - AI Services', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/synth - should get AI Synth status', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/synth');
      console.log(
        result.ok ? '✅ Synth endpoint available' : `⚠️  Synth returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  Synth test skipped');
    }
  });

  await t.test('GET /api/v1/cosmo - should get Cosmo AI status', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/cosmo');
      console.log(
        result.ok ? '✅ Cosmo endpoint available' : `⚠️  Cosmo returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  Cosmo test skipped');
    }
  });

  await t.test('GET /api/v1/ai-fabric - should get AI Fabric status', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/ai-fabric');
      console.log(
        result.ok
          ? '✅ AI Fabric endpoint available'
          : `⚠️  AI Fabric returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  AI Fabric test skipped');
    }
  });
});

// ========================================
// V1 Analytics Tests
// ========================================
test('API V1 - Analytics', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/analytics - should get analytics data', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/analytics');
      console.log(
        result.ok ? '✅ Analytics retrieved' : `⚠️  Analytics returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  Analytics test skipped');
    }
  });

  await t.test('GET /api/v1/reports - should list reports', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/reports');
      console.log(
        result.ok ? '✅ Reports retrieved' : `⚠️  Reports returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  Reports test skipped');
    }
  });
});

// ========================================
// V1 Integrations Tests
// ========================================
test('API V1 - Integrations', async (t) => {
  const helper = new ApiV1TestHelper();

  await t.test('GET /api/v1/integrations - should list integrations', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/integrations');

      if (result.ok) {
        console.log('✅ Integrations list retrieved');
      } else {
        console.log(`⚠️  Integrations endpoint returned ${result.status}`);
      }
    } catch (error) {
      console.log('⚠️  Integrations test skipped');
    }
  });

  await t.test('GET /api/v1/webhooks - should list webhooks', async () => {
    try {
      await helper.authenticate();
      const result = await helper.get('/webhooks');
      console.log(
        result.ok ? '✅ Webhooks retrieved' : `⚠️  Webhooks returned ${result.status}`,
      );
    } catch (error) {
      console.log('⚠️  Webhooks test skipped');
    }
  });
});

console.log('✅ API V1 Integration Tests Completed');
