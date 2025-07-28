import request from 'supertest';
import app from '../index.js';
import { closeDatabase } from '../db.js';

let authToken;
let testUser = {
  email: 'test.user@nova-universe.local',
  password: 'TestPass123!',
  name: 'Test User'
};
export { testUser };
export const getAuthToken = () => authToken;

describe('Nova Helix Authentication Features', () => {
  beforeAll(async () => {
    // Initialize test database
    // This would normally reset the test database
  });

  describe('Basic JWT Authentication', () => {
    test('Should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/helix/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.token).toBeDefined();
      authToken = response.body.token;
    });

    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/helix/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    test('Should get user session with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/helix/session')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(testUser.email);
    });
  });

  describe('Two-Factor Authentication (2FA)', () => {
    let twoFactorSecret;
    let backupCodes;

    test('Should setup 2FA for user', async () => {
      const response = await request(app)
        .post('/api/v1/helix/2fa/setup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.secret).toBeDefined();
      expect(response.body.qrCodeUrl).toBeDefined();
      expect(response.body.backupCodes).toBeDefined();
      expect(response.body.backupCodes).toHaveLength(10);
      
      twoFactorSecret = response.body.secret;
      backupCodes = response.body.backupCodes;
    });

    test('Should get 2FA status', async () => {
      const response = await request(app)
        .get('/api/v1/helix/2fa/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.enabled).toBeDefined();
      expect(response.body.verified).toBeDefined();
    });

    test('Should verify 2FA token (mock)', async () => {
      // Note: In real testing, you'd generate a valid TOTP token
      const mockToken = '123456';
      
      const response = await request(app)
        .post('/api/v1/helix/2fa/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token: mockToken })
        .expect(400); // Expected to fail with mock token

      expect(response.body.success).toBe(false);
    });

    test('Should regenerate backup codes', async () => {
      const response = await request(app)
        .post('/api/v1/helix/2fa/backup-codes/regenerate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.backupCodes).toBeDefined();
      expect(response.body.backupCodes).toHaveLength(10);
      expect(response.body.backupCodes).not.toEqual(backupCodes);
    });

    test('Should disable 2FA', async () => {
      const response = await request(app)
        .post('/api/v1/helix/2fa/disable')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('SAML SSO Endpoints', () => {
    test('Should provide SAML metadata', async () => {
      const response = await request(app)
        .get('/api/v1/helix/sso/saml/metadata')
        .expect(200);

      expect(response.header['content-type']).toContain('application/xml');
      expect(response.text).toContain('EntityDescriptor');
    });

    test('Should initiate SAML login', async () => {
      const response = await request(app)
        .get('/api/v1/helix/sso/saml/login')
        .expect(302); // Redirect to IdP

      expect(response.header.location).toBeDefined();
    });

    test('Should handle SAML callback (without valid assertion)', async () => {
      const response = await request(app)
        .post('/api/v1/helix/sso/saml/callback')
        .send({ SAMLResponse: 'invalid' })
        .expect(500); // Expected to fail without valid SAML setup

      expect(response.body.success).toBe(false);
    });
  });

  describe('SCIM 2.0 User Provisioning', () => {
    const scimToken = 'dev-scim-token-change-in-production';
    let scimUserId;

    test('Should create user via SCIM', async () => {
      const scimUser = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        userName: 'scim.user@example.com',
        name: {
          givenName: 'SCIM',
          familyName: 'User'
        },
        emails: [{
          value: 'scim.user@example.com',
          primary: true
        }],
        active: true
      };

      const response = await request(app)
        .post('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .send(scimUser)
        .expect(201);

      expect(response.body.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:User');
      expect(response.body.userName).toBe(scimUser.userName);
      expect(response.body.id).toBeDefined();
      scimUserId = response.body.id;
    });

    test('Should get all users via SCIM', async () => {
      const response = await request(app)
        .get('/scim/v2/Users')
        .set('Authorization', `Bearer ${scimToken}`)
        .expect(200);

      expect(response.body.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:ListResponse');
      expect(response.body.Resources).toBeDefined();
      expect(response.body.totalResults).toBeGreaterThan(0);
    });

    test('Should get specific user via SCIM', async () => {
      const response = await request(app)
        .get(`/scim/v2/Users/${scimUserId}`)
        .set('Authorization', `Bearer ${scimToken}`)
        .expect(200);

      expect(response.body.id).toBe(scimUserId);
      expect(response.body.userName).toBe('scim.user@example.com');
    });

    test('Should update user via SCIM', async () => {
      const updatedUser = {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
        name: {
          givenName: 'Updated',
          familyName: 'User'
        }
      };

      const response = await request(app)
        .put(`/scim/v2/Users/${scimUserId}`)
        .set('Authorization', `Bearer ${scimToken}`)
        .send(updatedUser)
        .expect(200);

      expect(response.body.name.givenName).toBe('Updated');
    });

    test('Should delete user via SCIM', async () => {
      await request(app)
        .delete(`/scim/v2/Users/${scimUserId}`)
        .set('Authorization', `Bearer ${scimToken}`)
        .expect(204);

      // Verify user is deleted
      await request(app)
        .get(`/scim/v2/Users/${scimUserId}`)
        .set('Authorization', `Bearer ${scimToken}`)
        .expect(404);
    });
  });

  describe('Nova Module Integration', () => {
    test('Should access Nova Lore with authentication', async () => {
      const response = await request(app)
        .get('/api/v1/lore/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Should access Nova Pulse with authentication', async () => {
      const response = await request(app)
        .get('/api/v1/pulse/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Should access Nova Orbit with authentication', async () => {
      const response = await request(app)
        .get('/api/v1/orbit/requests')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('Should access Nova Synth with authentication', async () => {
      const response = await request(app)
        .get('/api/v1/synth/chat/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Error Handling and Security', () => {
    test('Should reject requests without authentication', async () => {
      await request(app)
        .get('/api/v1/helix/session')
        .expect(401);
    });

    test('Should reject requests with invalid token', async () => {
      await request(app)
        .get('/api/v1/helix/session')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    test('Should reject SCIM requests without proper token', async () => {
      await request(app)
        .get('/scim/v2/Users')
        .expect(401);
    });

    test('Should reject SCIM requests with invalid token', async () => {
      await request(app)
        .get('/scim/v2/Users')
        .set('Authorization', 'Bearer invalid-scim-token')
        .expect(401);
    });

    test('Should handle malformed 2FA requests', async () => {
      const response = await request(app)
        .post('/api/v1/helix/2fa/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ token: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  afterAll(async () => {
    await closeDatabase();
  });
});
