// API Key Rotation Implementation
// Implements API key rotation with grace period for zero-downtime migrations

import crypto from 'crypto';
import db from '../db.js';
import { logger } from '../logger.js';

/**
 * Generate a new API key
 * @returns {string} - The generated API key
 */
export function generateApiKey() {
  // Generate 32 random bytes and encode as base64url
  const buffer = crypto.randomBytes(32);
  return buffer.toString('base64url'); // URL-safe base64 encoding
}

/**
 * Hash an API key for storage
 * @param {string} apiKey - The API key to hash
 * @returns {string} - The hashed API key
 */
export function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Create a new API key for a client
 * @param {string} clientId - The client ID
 * @param {string} tenantId - The tenant ID
 * @param {Object} options - Options for the API key
 * @returns {Promise<{apiKey: string, keyId: string}>}
 */
export async function createApiKey(clientId, tenantId, options = {}) {
  const {
    expiresIn = null, // null means no expiration
    description = 'API Key',
    scopes = []
  } = options;
  
  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);
  
  // Calculate expiration date if specified
  const expiresAt = expiresIn 
    ? new Date(Date.now() + expiresIn) 
    : null;
  
  const result = await db.query(
    `INSERT INTO api_keys (key_hash, client_id, tenant_id, expires_at, description, scopes, version, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, 1, true, NOW())
     RETURNING id`,
    [keyHash, clientId, tenantId, expiresAt, description, JSON.stringify(scopes)]
  );
  
  logger.info('API key created', {
    keyId: result.rows[0].id,
    clientId,
    tenantId,
    expiresAt
  });
  
  return {
    apiKey, // Return the plain API key (only shown once)
    keyId: result.rows[0].id,
    expiresAt
  };
}

/**
 * Rotate an existing API key with grace period
 * @param {string} keyId - The key ID to rotate
 * @param {number} gracePeriod - Grace period in milliseconds (default 7 days)
 * @returns {Promise<{newApiKey: string, newKeyId: string, oldKeyExpiresAt: Date}>}
 */
export async function rotateApiKey(keyId, gracePeriod = 7 * 24 * 60 * 60 * 1000) {
  // Get existing key info
  const existing = await db.query(
    'SELECT client_id, tenant_id, description, scopes FROM api_keys WHERE id = $1 AND is_active = true',
    [keyId]
  );
  
  if (existing.rows.length === 0) {
    throw new Error('API key not found or already inactive');
  }
  
  const { client_id, tenant_id, description, scopes } = existing.rows[0];
  
  // Create new API key with incremented version
  const newApiKey = generateApiKey();
  const newKeyHash = hashApiKey(newApiKey);
  
  const newKeyResult = await db.query(
    `INSERT INTO api_keys (key_hash, client_id, tenant_id, description, scopes, version, is_active, created_at)
     SELECT $1, client_id, tenant_id, $2, scopes, version + 1, true, NOW()
     FROM api_keys WHERE id = $3
     RETURNING id, version`,
    [newKeyHash, description, keyId]
  );
  
  // Set grace period expiration on old key
  const oldKeyExpiresAt = new Date(Date.now() + gracePeriod);
  await db.query(
    `UPDATE api_keys 
     SET rotated_at = NOW(), 
         expires_at = $1,
         description = description || ' (rotated - expires ' || $1::text || ')'
     WHERE id = $2`,
    [oldKeyExpiresAt, keyId]
  );
  
  logger.info('API key rotated', {
    oldKeyId: keyId,
    newKeyId: newKeyResult.rows[0].id,
    newVersion: newKeyResult.rows[0].version,
    gracePeriod: `${gracePeriod / (24 * 60 * 60 * 1000)} days`,
    oldKeyExpiresAt
  });
  
  return {
    newApiKey,
    newKeyId: newKeyResult.rows[0].id,
    oldKeyExpiresAt,
    gracePeriod
  };
}

/**
 * Revoke an API key immediately
 * @param {string} keyId - The key ID to revoke
 */
export async function revokeApiKey(keyId) {
  const result = await db.query(
    'UPDATE api_keys SET is_active = false, expires_at = NOW() WHERE id = $1 RETURNING client_id, tenant_id',
    [keyId]
  );
  
  if (result.rows.length > 0) {
    logger.info('API key revoked', {
      keyId,
      clientId: result.rows[0].client_id,
      tenantId: result.rows[0].tenant_id
    });
  }
}

/**
 * Validate an API key
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<{valid: boolean, clientId?: string, tenantId?: string, scopes?: array}>}
 */
export async function validateApiKey(apiKey) {
  const keyHash = hashApiKey(apiKey);
  
  const result = await db.query(
    `SELECT id, client_id, tenant_id, scopes, expires_at
     FROM api_keys
     WHERE key_hash = $1 
       AND is_active = true
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [keyHash]
  );
  
  if (result.rows.length === 0) {
    return { valid: false };
  }
  
  const key = result.rows[0];
  
  // Update last used timestamp
  await db.query(
    'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
    [key.id]
  );
  
  return {
    valid: true,
    keyId: key.id,
    clientId: key.client_id,
    tenantId: key.tenant_id,
    scopes: JSON.parse(key.scopes || '[]')
  };
}

/**
 * Clean up expired API keys
 */
export async function cleanupExpiredApiKeys() {
  const result = await db.query(
    'DELETE FROM api_keys WHERE is_active = false AND expires_at < NOW() - INTERVAL \'90 days\''
  );
  
  if (result.rowCount > 0) {
    logger.info(`Cleaned up ${result.rowCount} expired API keys`);
  }
}

/**
 * List all API keys for a client
 * @param {string} clientId - The client ID
 * @returns {Promise<Array>}
 */
export async function listApiKeys(clientId) {
  const result = await db.query(
    `SELECT id, description, version, is_active, expires_at, created_at, rotated_at, last_used_at
     FROM api_keys
     WHERE client_id = $1
     ORDER BY version DESC, created_at DESC`,
    [clientId]
  );
  
  return result.rows;
}

export default {
  generateApiKey,
  hashApiKey,
  createApiKey,
  rotateApiKey,
  revokeApiKey,
  validateApiKey,
  cleanupExpiredApiKeys,
  listApiKeys
};
