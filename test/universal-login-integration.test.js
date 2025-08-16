import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Mock the database connection
const mockDb = {
  query: jest.fn(),
  transaction: jest.fn(),
};

// Mock the logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

// Import the universal login router after setting up mocks
jest.mock('../apps/api/db.js', () => ({
  default: mockDb,
  query: mockDb.query,
  transaction: mockDb.transaction,
}));

jest.mock('../apps/api/logger.js', () => ({
  logger: mockLogger,
}));

describe('Universal Login System Integration Tests', () => {
  let app;
  let helixUniversalLoginRouter;
  const testTenantId = uuidv4();
  const testUserId = 'test-user-123';
  const testEmail = 'test@example.com';

  beforeAll(async () => {
    // Setup Express app for testing
    app = express();
    app.use(express.json());
    
    // Import and mount the router
    const { default: router } = await import('../apps/api/routes/helix-universal-login.js'); // TODO-LINT: move to async function
    helixUniversalLoginRouter = router;
    app.use('/api/v1/helix/login', helixUniversalLoginRouter);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('Phase 1: Tenant Discovery', () => {
    it('should discover tenant and auth methods for valid email', async () => {
      // Mock database responses
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            id: testTenantId,
            name: 'Test Organization',
            domain: 'example.com',
            theme_color: '#1f2937',
            sso_enabled: true,
            mfa_required: false,
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: testUserId,
            email: testEmail,
            password_hash: await bcrypt.hash('password123', 10),
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            provider: 'saml',
            provider_name: 'Corporate SSO',
            enabled: true,
          }]
        }); // TODO-LINT: move to async function

      const response = await request(app)
        .post('/api/v1/helix/login/tenant/discover')
        .send({
          email: testEmail,
          redirectUrl: 'http://localhost:3000/',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tenant');
      expect(response.body).toHaveProperty('authMethods');
      expect(response.body).toHaveProperty('userExists', true);
      expect(response.body).toHaveProperty('discoveryToken');
      expect(response.body.tenant.name).toBe('Test Organization');
      expect(response.body.authMethods).toHaveLength(2); // password + SSO
    });

    it('should handle unknown domain gracefully', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/v1/helix/login/tenant/discover')
        .send({
          email: 'user@unknown-domain.com',
          redirectUrl: 'http://localhost:3000/',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(200);
      expect(response.body.tenant.name).toBe('Default Organization');
      expect(response.body.userExists).toBe(false);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/helix/login/tenant/discover')
        .send({
          email: 'invalid-email',
          redirectUrl: 'http://localhost:3000/',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Phase 2: Authentication', () => {
    const discoveryToken = 'test-discovery-token';

    it('should authenticate user with valid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10); // TODO-LINT: move to async function
      
      // Mock discovery token validation
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            tenant_id: testTenantId,
            user_id: testUserId,
            email: testEmail,
          }]
        })
        // Mock user lookup
        .mockResolvedValueOnce({
          rows: [{
            id: testUserId,
            email: testEmail,
            password_hash: hashedPassword,
            disabled: false,
            two_factor_enabled: false,
          }]
        })
        // Mock session creation
        .mockResolvedValueOnce({
          rows: [{
            id: uuidv4(),
            session_token: 'test-session-token',
          }]
        });

      const response = await request(app)
        .post('/api/v1/helix/login/authenticate')
        .send({
          discoveryToken,
          email: testEmail,
          authMethod: 'password',
          password: 'password123',
          redirectUrl: 'http://localhost:3000/',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.requiresMFA).toBe(false);
    });

    it('should initiate MFA for users with 2FA enabled', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10); // TODO-LINT: move to async function
      
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            tenant_id: testTenantId,
            user_id: testUserId,
            email: testEmail,
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: testUserId,
            email: testEmail,
            password_hash: hashedPassword,
            disabled: false,
            two_factor_enabled: true,
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            method_type: 'totp',
            method_name: 'Authenticator App',
            is_primary: true,
          }]
        });

      const response = await request(app)
        .post('/api/v1/helix/login/authenticate')
        .send({
          discoveryToken,
          email: testEmail,
          authMethod: 'password',
          password: 'password123',
          redirectUrl: 'http://localhost:3000/',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(200);
      expect(response.body.requiresMFA).toBe(true);
      expect(response.body).toHaveProperty('tempSessionId');
      expect(response.body).toHaveProperty('availableMfaMethods');
    });

    it('should reject invalid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10); // TODO-LINT: move to async function
      
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            tenant_id: testTenantId,
            user_id: testUserId,
            email: testEmail,
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: testUserId,
            email: testEmail,
            password_hash: hashedPassword,
            disabled: false,
          }]
        });

      const response = await request(app)
        .post('/api/v1/helix/login/authenticate')
        .send({
          discoveryToken,
          email: testEmail,
          authMethod: 'password',
          password: 'wrongpassword',
          redirectUrl: 'http://localhost:3000/',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Phase 3: MFA Verification', () => {
    const tempSessionId = 'temp-session-123';

    it('should send SMS MFA challenge', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            user_id: testUserId,
            mfa_method: 'sms',
            phone_number_encrypted: 'encrypted-phone',
          }]
        })
        .mockResolvedValueOnce({ rows: [] }); // Insert challenge

      const response = await request(app)
        .post('/api/v1/helix/login/mfa/challenge')
        .send({
          tempSessionId,
          mfaMethod: 'sms',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('SMS');
    });

    it('should verify TOTP code successfully', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            user_id: testUserId,
            totp_secret_encrypted: 'encrypted-secret',
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: testUserId,
            email: testEmail,
            name: 'Test User',
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            id: uuidv4(),
            session_token: 'final-session-token',
          }]
        });

      const response = await request(app)
        .post('/api/v1/helix/login/mfa/verify')
        .send({
          tempSessionId,
          mfaMethod: 'totp',
          code: '123456',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid MFA codes', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          user_id: testUserId,
          totp_secret_encrypted: 'encrypted-secret',
        }]
      });

      const response = await request(app)
        .post('/api/v1/helix/login/mfa/verify')
        .send({
          tempSessionId,
          mfaMethod: 'totp',
          code: '000000',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Phase 4: Session Management', () => {
    const sessionToken = 'valid-session-token';

    it('should refresh valid tokens', async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [{
            id: uuidv4(),
            user_id: testUserId,
            refresh_token: 'valid-refresh-token',
            expires_at: new Date(Date.now() + 3600000),
          }]
        })
        .mockResolvedValueOnce({
          rows: [{
            session_token: 'new-session-token',
          }]
        });

      const response = await request(app)
        .post('/api/v1/helix/login/token/refresh')
        .send({
          refreshToken: 'valid-refresh-token',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should logout and invalidate session', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/v1/helix/login/logout')
        .set('Authorization', `Bearer ${sessionToken}`)
        .send(); // TODO-LINT: move to async function

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Phase 5: Audit Logging', () => {
    it('should log authentication events', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          id: uuidv4(),
          event_type: 'login_success',
          user_id: testUserId,
          ip_address: '127.0.0.1',
          created_at: new Date(),
        }]
      });

      const response = await request(app)
        .get('/api/v1/helix/login/audit')
        .query({
          userId: testUserId,
          limit: 10,
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });
  });

  describe('Error Handling and Security', () => {
    it('should handle rate limiting', async () => {
      // Simulate multiple failed attempts
      for (let i = 0; i < 5; i++) {
        mockDb.query.mockResolvedValueOnce({ rows: [] });
        
        const response = await request(app)
          .post('/api/v1/helix/login/authenticate')
          .send({
            discoveryToken: 'invalid-token',
            email: testEmail,
            authMethod: 'password',
            password: 'wrongpassword',
          }); // TODO-LINT: move to async function
        
        if (i < 4) {
          expect(response.status).toBe(401);
        } else {
          expect(response.status).toBe(429); // Rate limited
        }
      }
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/helix/login/authenticate')
        .send({
          email: testEmail,
          // Missing required fields
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should sanitize input data', async () => {
      const response = await request(app)
        .post('/api/v1/helix/login/tenant/discover')
        .send({
          email: '<script>alert("xss")</script>@example.com',
          redirectUrl: 'javascript:alert("xss")',
        }); // TODO-LINT: move to async function

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});

export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  testMatch: ['**/test/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
