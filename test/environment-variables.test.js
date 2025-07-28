// test/environment-variables.test.js
// Test suite for environment variable handling improvements
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('Environment Variable Handling', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Nullish Coalescing vs Logical OR', () => {
    it('should handle undefined values correctly with nullish coalescing', () => {
      delete process.env.TEST_VAR;
      
      const withNullishCoalescing = process.env.TEST_VAR ?? 'default';
      const withLogicalOR = process.env.TEST_VAR || 'default';
      
      assert.strictEqual(withNullishCoalescing, 'default');
      assert.strictEqual(withLogicalOR, 'default');
    });

    it('should handle empty strings differently with nullish coalescing vs logical OR', () => {
      process.env.TEST_VAR = '';
      
      const withNullishCoalescing = process.env.TEST_VAR ?? 'default';
      const withLogicalOR = process.env.TEST_VAR || 'default';
      
      // Nullish coalescing preserves empty strings (more precise behavior)
      assert.strictEqual(withNullishCoalescing, '');
      // Logical OR treats empty string as falsy
      assert.strictEqual(withLogicalOR, 'default');
    });

    it('should handle null values correctly with nullish coalescing', () => {
      process.env.TEST_VAR = null;
      
      const withNullishCoalescing = process.env.TEST_VAR ?? 'default';
      const withLogicalOR = process.env.TEST_VAR || 'default';
      
      assert.strictEqual(withNullishCoalescing, 'default');
      assert.strictEqual(withLogicalOR, 'default');
    });

    it('should preserve non-empty string values with both operators', () => {
      process.env.TEST_VAR = 'actual_value';
      
      const withNullishCoalescing = process.env.TEST_VAR ?? 'default';
      const withLogicalOR = process.env.TEST_VAR || 'default';
      
      assert.strictEqual(withNullishCoalescing, 'actual_value');
      assert.strictEqual(withLogicalOR, 'actual_value');
    });
  });

  describe('Database Configuration Environment Variables', () => {
    it('should not create redundant assignments', () => {
      // This test ensures we don't have patterns like:
      // process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'default';
      
      process.env.POSTGRES_PASSWORD = 'test_password';
      const originalValue = process.env.POSTGRES_PASSWORD;
      
      // Simulate the improved pattern (reading the variable, not reassigning)
      const configPassword = process.env.POSTGRES_PASSWORD ?? 'default_password';
      
      // Ensure the environment variable wasn't modified
      assert.strictEqual(process.env.POSTGRES_PASSWORD, originalValue);
      assert.strictEqual(configPassword, 'test_password');
    });

    it('should provide defaults when environment variables are not set', () => {
      delete process.env.POSTGRES_PASSWORD;
      delete process.env.POSTGRES_HOST;
      delete process.env.POSTGRES_PORT;
      
      const configPassword = process.env.POSTGRES_PASSWORD ?? 'default_password';
      const configHost = process.env.POSTGRES_HOST ?? 'localhost';
      const configPort = parseInt(process.env.POSTGRES_PORT ?? '5432');
      
      assert.strictEqual(configPassword, 'default_password');
      assert.strictEqual(configHost, 'localhost');
      assert.strictEqual(configPort, 5432);
    });

    it('should preserve intentionally set empty values for non-critical config', () => {
      // For some config options, an empty string might be intentional
      process.env.POSTGRES_SSL_CA = '';
      
      const sslCA = process.env.POSTGRES_SSL_CA ?? 'default_ca_path';
      
      // With nullish coalescing, empty string is preserved
      assert.strictEqual(sslCA, '');
    });
  });

  describe('Configuration Import Tests', () => {
    it('should successfully import database configuration without errors', async () => {
      // Set required environment variables for testing
      process.env.POSTGRES_HOST = 'localhost';
      process.env.POSTGRES_PORT = '5432';
      process.env.POSTGRES_DB = 'test_db';
      process.env.POSTGRES_USER = 'test_user';
      process.env.POSTGRES_PASSWORD = 'test_password';
      
      // Import should not throw errors
      const { databaseConfig } = await import('../nova-api/config/database.js');
      
      assert.ok(databaseConfig);
      assert.ok(databaseConfig.postgresql);
      assert.strictEqual(databaseConfig.postgresql.host, 'localhost');
      assert.strictEqual(databaseConfig.postgresql.password, 'test_password');
    });
  });
});