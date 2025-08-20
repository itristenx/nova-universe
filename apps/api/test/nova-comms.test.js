/**
 * Nova Comms Integration Tests
 * Tests for the integrated Slack service within the Nova Universe API
 */

import { jest } from '@jest/globals';
import { validateSlackEnv, isSlackAvailable } from '../services/nova-comms.js';

describe('Nova Comms Integration', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  describe('validateSlackEnv', () => {
    test('throws when required Slack variables are missing', () => {
      delete process.env.SLACK_SIGNING_SECRET;
      delete process.env.SLACK_BOT_TOKEN;
      delete process.env.JWT_SECRET;
      
      expect(() => validateSlackEnv()).toThrow(/Missing required Slack environment variables/);
    });

    test('returns valid config when all variables are provided', () => {
      process.env.SLACK_SIGNING_SECRET = 'test-signing-secret';
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.JWT_SECRET = 'test-jwt-secret';
      process.env.SLACK_PORT = '3001';
      process.env.VITE_ADMIN_URL = 'http://localhost:5173';
      process.env.COMMS_SERVICE_USER_ID = 'test-service';
      process.env.COMMS_SERVICE_USER_EMAIL = 'test@nova.local';
      process.env.COMMS_SERVICE_USER_NAME = 'Test Bot';
      process.env.COMMS_SERVICE_USER_ROLE = 'admin';
      process.env.COMMS_TENANT_ID = 'test-tenant';

      const config = validateSlackEnv();
      
      expect(config).toEqual({
        port: 3001,
        jwtExpiresIn: '1h',
        adminUrl: 'http://localhost:5173',
        serviceUserId: 'test-service',
        serviceUserEmail: 'test@nova.local',
        serviceUserName: 'Test Bot',
        serviceUserRole: 'admin',
        tenantId: 'test-tenant',
        apiUrl: 'http://localhost:3000',
      });
    });

    test('uses default values when optional variables are not provided', () => {
      process.env.SLACK_SIGNING_SECRET = 'test-signing-secret';
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.JWT_SECRET = 'test-jwt-secret';

      const config = validateSlackEnv();
      
      expect(config.port).toBe(3001);
      expect(config.jwtExpiresIn).toBe('1h');
      expect(config.serviceUserId).toBe('comms-service');
      expect(config.serviceUserEmail).toBe('comms@nova.local');
      expect(config.serviceUserName).toBe('Nova Comms Bot');
      expect(config.serviceUserRole).toBe('technician');
      expect(config.tenantId).toBe('default');
      expect(config.apiUrl).toBe('http://localhost:3000');
    });
  });

  describe('isSlackAvailable', () => {
    test('returns false when Slack is not initialized', () => {
      expect(isSlackAvailable()).toBe(false);
    });
  });

  describe('Environment Variables Migration', () => {
    test('all original comms environment variables are supported', () => {
      // Test that all the original environment variables from the standalone comms app
      // are still supported in the integrated version
      process.env.SLACK_SIGNING_SECRET = 'test-signing-secret';
      process.env.SLACK_BOT_TOKEN = 'xoxb-test-token';
      process.env.JWT_SECRET = 'test-jwt-secret';
      process.env.SLACK_PORT = '4000';
      process.env.JWT_EXPIRES_IN = '2h';
      process.env.VITE_ADMIN_URL = 'http://admin.example.com';
      process.env.COMMS_SERVICE_USER_ID = 'custom-service';
      process.env.COMMS_SERVICE_USER_EMAIL = 'custom@example.com';
      process.env.COMMS_SERVICE_USER_NAME = 'Custom Bot';
      process.env.COMMS_SERVICE_USER_ROLE = 'admin';
      process.env.COMMS_TENANT_ID = 'custom-tenant';
      process.env.API_URL = 'http://api.example.com';

      const config = validateSlackEnv();
      
      expect(config.port).toBe(4000);
      expect(config.jwtExpiresIn).toBe('2h');
      expect(config.adminUrl).toBe('http://admin.example.com');
      expect(config.serviceUserId).toBe('custom-service');
      expect(config.serviceUserEmail).toBe('custom@example.com');
      expect(config.serviceUserName).toBe('Custom Bot');
      expect(config.serviceUserRole).toBe('admin');
      expect(config.tenantId).toBe('custom-tenant');
      expect(config.apiUrl).toBe('http://api.example.com');
    });
  });
});
