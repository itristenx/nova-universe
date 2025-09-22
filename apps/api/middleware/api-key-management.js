// Secure API Key Management for Nova Universe API
// Implements secure API key generation, validation, and lifecycle management

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { logger } from '../logger.js';
import { logSecurityEvent } from './security-monitoring.js';

/**
 * API Key configuration
 */
const API_KEY_CONFIG = {
  // Key generation settings
  keyLength: 32, // Length in bytes (256 bits)
  secretLength: 64, // Length in bytes (512 bits)
  hashRounds: 12, // bcrypt rounds for hashing
  
  // Key prefix for identification
  keyPrefix: 'nova_',
  
  // Expiration settings
  defaultExpiryDays: 365, // 1 year default
  maxExpiryDays: 1095, // 3 years maximum
  
  // Rate limiting per API key
  defaultRateLimit: 1000, // Requests per hour
  maxRateLimit: 10000, // Maximum requests per hour
  
  // Key scopes/permissions
  scopes: {
    read: 'read',
    write: 'write',
    admin: 'admin',
    delete: 'delete',
    monitor: 'monitor',
  },
  
  // Key environments
  environments: {
    development: 'dev',
    staging: 'staging',
    production: 'prod',
    testing: 'test',
  },
};

/**
 * Generate a secure API key
 */
function generateApiKey() {
  const keyBytes = crypto.randomBytes(API_KEY_CONFIG.keyLength);
  const key = keyBytes.toString('base64url');
  return `${API_KEY_CONFIG.keyPrefix}${key}`;
}

/**
 * Generate a secure API secret
 */
function generateApiSecret() {
  const secretBytes = crypto.randomBytes(API_KEY_CONFIG.secretLength);
  return secretBytes.toString('base64url');
}

/**
 * Hash API secret for storage
 */
async function hashApiSecret(secret) {
  return await bcrypt.hash(secret, API_KEY_CONFIG.hashRounds);
}

/**
 * Verify API secret
 */
async function verifyApiSecret(secret, hashedSecret) {
  return await bcrypt.compare(secret, hashedSecret);
}

/**
 * Validate API key format
 */
function isValidApiKeyFormat(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Check prefix
  if (!apiKey.startsWith(API_KEY_CONFIG.keyPrefix)) {
    return false;
  }
  
  // Check length (prefix + base64url encoded bytes)
  const expectedLength = API_KEY_CONFIG.keyPrefix.length + Math.ceil((API_KEY_CONFIG.keyLength * 4) / 3);
  return apiKey.length === expectedLength;
}

/**
 * Validate scopes
 */
function validateScopes(scopes) {
  if (!Array.isArray(scopes)) {
    return false;
  }
  
  const validScopes = Object.values(API_KEY_CONFIG.scopes);
  return scopes.every(scope => validScopes.includes(scope));
}

/**
 * Create new API key
 */
export async function createApiKey(db, {
  userId,
  name,
  description = '',
  scopes = ['read'],
  environment = 'production',
  expiryDays = API_KEY_CONFIG.defaultExpiryDays,
  rateLimit = API_KEY_CONFIG.defaultRateLimit,
  ipWhitelist = [],
  metadata = {}
}) {
  try {
    // Validate inputs
    if (!userId || !name) {
      throw new Error('User ID and name are required');
    }
    
    if (!validateScopes(scopes)) {
      throw new Error('Invalid scopes provided');
    }
    
    if (!Object.values(API_KEY_CONFIG.environments).includes(environment)) {
      throw new Error('Invalid environment');
    }
    
    if (expiryDays > API_KEY_CONFIG.maxExpiryDays) {
      throw new Error(`Expiry days cannot exceed ${API_KEY_CONFIG.maxExpiryDays}`);
    }
    
    if (rateLimit > API_KEY_CONFIG.maxRateLimit) {
      throw new Error(`Rate limit cannot exceed ${API_KEY_CONFIG.maxRateLimit}`);
    }
    
    // Generate key and secret
    const apiKey = generateApiKey();
    const apiSecret = generateApiSecret();
    const hashedSecret = await hashApiSecret(apiSecret);
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    // Store API key in database
    const query = `
      INSERT INTO api_keys (
        api_key, api_secret_hash, user_id, name, description,
        scopes, environment, rate_limit, ip_whitelist,
        expires_at, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = await new Promise((resolve, reject) => {
      db.run(query, [
        apiKey,
        hashedSecret,
        userId,
        name,
        description,
        JSON.stringify(scopes),
        environment,
        rateLimit,
        JSON.stringify(ipWhitelist),
        expiresAt.toISOString(),
        JSON.stringify(metadata)
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
    
    // Log security event
    await logSecurityEvent('API_KEY_CREATED', {
      userId,
      resource: 'api_key',
      metadata: {
        apiKeyId: result.id,
        name,
        environment,
        scopes,
        expiryDays,
        rateLimit
      }
    });
    
    logger.info('API key created successfully', {
      apiKeyId: result.id,
      userId,
      name,
      environment,
      scopes,
      expiryDays
    });
    
    return {
      id: result.id,
      apiKey,
      apiSecret, // Only returned once during creation
      name,
      environment,
      scopes,
      expiresAt,
      rateLimit
    };
    
  } catch (error) {
    logger.error('Failed to create API key', { error: error.message, userId });
    throw error;
  }
}

/**
 * Validate API key and secret
 */
export async function validateApiKey(db, apiKey, apiSecret = null) {
  try {
    if (!isValidApiKeyFormat(apiKey)) {
      return { valid: false, reason: 'Invalid API key format' };
    }
    
    // Get API key from database
    const query = `
      SELECT ak.*, u.username, u.email, u.roles
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.api_key = ? AND ak.is_active = 1
    `;
    
    const keyData = await new Promise((resolve, reject) => {
      db.get(query, [apiKey], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!keyData) {
      await logSecurityEvent('API_KEY_VALIDATION_FAILED', {
        resource: 'api_key',
        metadata: { reason: 'Key not found', apiKey: apiKey.substring(0, 10) + '...' }
      });
      return { valid: false, reason: 'API key not found' };
    }
    
    // Check expiration
    if (new Date() > new Date(keyData.expires_at)) {
      await logSecurityEvent('API_KEY_VALIDATION_FAILED', {
        userId: keyData.user_id,
        resource: 'api_key',
        metadata: { reason: 'Key expired', apiKeyId: keyData.id }
      });
      return { valid: false, reason: 'API key expired' };
    }
    
    // Verify secret if provided
    if (apiSecret) {
      const secretValid = await verifyApiSecret(apiSecret, keyData.api_secret_hash);
      if (!secretValid) {
        await logSecurityEvent('API_KEY_VALIDATION_FAILED', {
          userId: keyData.user_id,
          resource: 'api_key',
          metadata: { reason: 'Invalid secret', apiKeyId: keyData.id }
        });
        return { valid: false, reason: 'Invalid API secret' };
      }
    }
    
    // Update last used timestamp
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE api_keys SET last_used_at = datetime("now"), usage_count = usage_count + 1 WHERE id = ?',
        [keyData.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Parse JSON fields
    const scopes = JSON.parse(keyData.scopes);
    const ipWhitelist = JSON.parse(keyData.ip_whitelist || '[]');
    const metadata = JSON.parse(keyData.metadata || '{}');
    const userRoles = JSON.parse(keyData.roles || '[]');
    
    return {
      valid: true,
      keyData: {
        id: keyData.id,
        userId: keyData.user_id,
        username: keyData.username,
        email: keyData.email,
        userRoles,
        name: keyData.name,
        description: keyData.description,
        scopes,
        environment: keyData.environment,
        rateLimit: keyData.rate_limit,
        ipWhitelist,
        metadata,
        expiresAt: keyData.expires_at,
        lastUsedAt: keyData.last_used_at,
        usageCount: keyData.usage_count,
        createdAt: keyData.created_at
      }
    };
    
  } catch (error) {
    logger.error('API key validation error', { error: error.message, apiKey: apiKey?.substring(0, 10) + '...' });
    return { valid: false, reason: 'Validation error' };
  }
}

/**
 * Check if API key has required scope
 */
export function hasRequiredScope(keyData, requiredScope) {
  if (!keyData || !keyData.scopes) {
    return false;
  }
  
  // Admin scope grants all permissions
  if (keyData.scopes.includes(API_KEY_CONFIG.scopes.admin)) {
    return true;
  }
  
  return keyData.scopes.includes(requiredScope);
}

/**
 * Check IP whitelist
 */
export function isIpAllowed(keyData, clientIp) {
  if (!keyData || !keyData.ipWhitelist || keyData.ipWhitelist.length === 0) {
    return true; // No IP restrictions
  }
  
  return keyData.ipWhitelist.includes(clientIp);
}

/**
 * API key authentication middleware
 */
export function authenticateApiKey(requiredScope = 'read') {
  return async (req, res, next) => {
    try {
      const apiKey = req.headers['x-api-key'] || req.query.api_key;
      const apiSecret = req.headers['x-api-secret'];
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: 'API key required',
          errorCode: 'API_KEY_REQUIRED'
        });
      }
      
      // Validate API key
      const validation = await validateApiKey(req.db, apiKey, apiSecret);
      
      if (!validation.valid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key',
          errorCode: 'INVALID_API_KEY',
          reason: validation.reason
        });
      }
      
      const { keyData } = validation;
      
      // Check scope
      if (!hasRequiredScope(keyData, requiredScope)) {
        await logSecurityEvent('API_KEY_INSUFFICIENT_SCOPE', {
          userId: keyData.userId,
          resource: 'api_key',
          metadata: {
            apiKeyId: keyData.id,
            requiredScope,
            availableScopes: keyData.scopes
          }
        });
        
        return res.status(403).json({
          success: false,
          error: 'Insufficient scope',
          errorCode: 'INSUFFICIENT_SCOPE',
          requiredScope,
          availableScopes: keyData.scopes
        });
      }
      
      // Check IP whitelist
      if (!isIpAllowed(keyData, req.ip)) {
        await logSecurityEvent('API_KEY_IP_NOT_ALLOWED', {
          userId: keyData.userId,
          ipAddress: req.ip,
          resource: 'api_key',
          metadata: {
            apiKeyId: keyData.id,
            allowedIps: keyData.ipWhitelist
          }
        });
        
        return res.status(403).json({
          success: false,
          error: 'IP address not allowed',
          errorCode: 'IP_NOT_ALLOWED'
        });
      }
      
      // Attach API key data to request
      req.apiKey = keyData;
      req.user = {
        id: keyData.userId,
        username: keyData.username,
        email: keyData.email,
        roles: keyData.userRoles,
        isApiKey: true
      };
      
      next();
      
    } catch (error) {
      logger.error('API key authentication error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Authentication error',
        errorCode: 'AUTH_ERROR'
      });
    }
  };
}

/**
 * Revoke API key
 */
export async function revokeApiKey(db, apiKeyId, userId = null) {
  try {
    let query = 'UPDATE api_keys SET is_active = 0, revoked_at = datetime("now") WHERE id = ?';
    let params = [apiKeyId];
    
    // If userId provided, ensure user owns the key
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    const result = await new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes === 0) {
      throw new Error('API key not found or access denied');
    }
    
    await logSecurityEvent('API_KEY_REVOKED', {
      userId,
      resource: 'api_key',
      metadata: { apiKeyId }
    });
    
    logger.info('API key revoked', { apiKeyId, userId });
    return true;
    
  } catch (error) {
    logger.error('Failed to revoke API key', { error: error.message, apiKeyId, userId });
    throw error;
  }
}

/**
 * List API keys for user
 */
export async function listApiKeys(db, userId) {
  try {
    const query = `
      SELECT id, name, description, scopes, environment, rate_limit,
             expires_at, last_used_at, usage_count, is_active, created_at
      FROM api_keys
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    
    const keys = await new Promise((resolve, reject) => {
      db.all(query, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    return keys.map(key => ({
      ...key,
      scopes: JSON.parse(key.scopes),
      isExpired: new Date() > new Date(key.expires_at)
    }));
    
  } catch (error) {
    logger.error('Failed to list API keys', { error: error.message, userId });
    throw error;
  }
}

/**
 * Clean up expired API keys
 */
export async function cleanupExpiredApiKeys(db) {
  try {
    const query = `
      UPDATE api_keys 
      SET is_active = 0, revoked_at = datetime('now')
      WHERE expires_at < datetime('now') AND is_active = 1
    `;
    
    const result = await new Promise((resolve, reject) => {
      db.run(query, [], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    if (result.changes > 0) {
      logger.info('Cleaned up expired API keys', { count: result.changes });
      
      await logSecurityEvent('API_KEYS_CLEANUP', {
        resource: 'api_key',
        metadata: { expiredKeysCount: result.changes }
      });
    }
    
    return result.changes;
    
  } catch (error) {
    logger.error('Failed to cleanup expired API keys', { error: error.message });
    throw error;
  }
}

/**
 * Initialize API key database schema
 */
export async function initializeApiKeySchema(db) {
  const schema = `
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key TEXT UNIQUE NOT NULL,
      api_secret_hash TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      scopes TEXT NOT NULL DEFAULT '["read"]',
      environment TEXT NOT NULL DEFAULT 'production',
      rate_limit INTEGER NOT NULL DEFAULT 1000,
      ip_whitelist TEXT DEFAULT '[]',
      expires_at TEXT NOT NULL,
      last_used_at TEXT,
      usage_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      revoked_at TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
    CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);
    CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
  `;
  
  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default {
  createApiKey,
  validateApiKey,
  authenticateApiKey,
  revokeApiKey,
  listApiKeys,
  cleanupExpiredApiKeys,
  initializeApiKeySchema,
  hasRequiredScope,
  isIpAllowed,
  API_KEY_CONFIG,
};