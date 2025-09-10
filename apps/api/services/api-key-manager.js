// services/api-key-manager.js
// Centralized API key management for secure authentication
import crypto from 'crypto';
import { logger } from '../logger.js';

/**
 * Centralized API key manager to prevent storage/validation mismatches
 * and ensure secure API key handling across the application
 */
class ApiKeyManager {
  constructor() {
    // In-memory store for API keys (in production, use database)
    this.apiKeys = new Map();
    this.initializeTestKeys();
  }

  /**
   * Initialize test keys only in non-production environments
   */
  initializeTestKeys() {
    // Only create test keys in development/test environments
    if (process.env.NODE_ENV === 'production') {
      logger.info('Production environment detected - test API keys disabled');
      return;
    }

    // Only create test key if explicitly provided via environment variable
    if (process.env.TEST_API_KEY) {
      const testApiKey = process.env.TEST_API_KEY;
      this.apiKeys.set(testApiKey, {
        id: 'test-user-' + crypto.randomBytes(8).toString('hex'),
        email: 'test@nova-universe.com',
        name: 'Test User',
        permissions: ['read', 'write', 'admin'],
        roles: ['user', 'api_user', 'admin'],
        createdAt: new Date().toISOString(),
        isTestKey: true,
        purpose: 'Automated Testing'
      });
      
      logger.info('Test API key initialized from environment variable');
    } else {
      logger.info('No TEST_API_KEY environment variable found - no test keys available');
    }
  }

  /**
   * Create a new API key for a user
   */
  createApiKey(userData, purpose = 'API Access') {
    if (!userData || !userData.id || !userData.email) {
      throw new Error('Invalid user data for API key creation');
    }

    const apiKey = 'nova-api-' + crypto.randomBytes(32).toString('hex');
    const keyData = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      purpose,
      permissions: userData.permissions || ['read', 'write'], // Standard permissions
      roles: userData.roles || ['user', 'api_user'],
      createdAt: new Date().toISOString(),
      lastUsed: null,
      isTestKey: false
    };

    this.apiKeys.set(apiKey, keyData);

    logger.info('API key created', { 
      userId: userData.id, 
      email: userData.email, 
      purpose,
      keyPrefix: apiKey.substring(0, 12) + '...'
    });

    return {
      apiKey,
      keyData: { ...keyData }
    };
  }

  /**
   * Validate and retrieve API key data
   */
  validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      return null;
    }

    const keyData = this.apiKeys.get(apiKey);
    if (!keyData) {
      return null;
    }

    // Update last used timestamp
    keyData.lastUsed = new Date().toISOString();
    this.apiKeys.set(apiKey, keyData);

    return { ...keyData }; // Return a copy to prevent mutation
  }

  /**
   * Get all API keys for a user (excluding the actual key values)
   */
  getUserApiKeys(userId) {
    const userKeys = [];
    for (const [key, data] of this.apiKeys.entries()) {
      if (data.id === userId) {
        userKeys.push({
          keyPrefix: key.substring(0, 12) + '...',
          purpose: data.purpose,
          permissions: data.permissions,
          createdAt: data.createdAt,
          lastUsed: data.lastUsed,
          isTestKey: data.isTestKey
        });
      }
    }
    return userKeys;
  }

  /**
   * Revoke an API key
   */
  revokeApiKey(apiKey) {
    const deleted = this.apiKeys.delete(apiKey);
    if (deleted) {
      logger.info('API key revoked', { keyPrefix: apiKey.substring(0, 12) + '...' });
    }
    return deleted;
  }

  /**
   * Get the test API key (only in non-production)
   */
  getTestApiKey() {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }

    if (!process.env.TEST_API_KEY) {
      return null;
    }

    return {
      testApiKey: process.env.TEST_API_KEY,
      purpose: 'Automated Testing',
      permissions: ['read', 'write', 'admin'],
      usage: {
        loginEndpoint: '/api/auth/api-login',
        example: {
          method: 'POST',
          body: { apiKey: process.env.TEST_API_KEY },
          response: 'JWT token for authenticated requests'
        }
      }
    };
  }

  /**
   * Clean up expired or unused API keys (for future use)
   */
  cleanup() {
    // In production, implement cleanup logic for expired keys
    // For now, this is a placeholder
    logger.debug('API key cleanup called');
  }

  /**
   * Get statistics about API key usage
   */
  getStats() {
    const stats = {
      totalKeys: this.apiKeys.size,
      testKeys: 0,
      userKeys: 0,
      recentlyUsed: 0
    };

    const recentThreshold = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

    for (const [key, data] of this.apiKeys.entries()) {
      if (data.isTestKey) {
        stats.testKeys++;
      } else {
        stats.userKeys++;
      }

      if (data.lastUsed && new Date(data.lastUsed).getTime() > recentThreshold) {
        stats.recentlyUsed++;
      }
    }

    return stats;
  }
}

// Create singleton instance
const apiKeyManager = new ApiKeyManager();

export default apiKeyManager;