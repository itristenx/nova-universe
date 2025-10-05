// Enhanced Session Management
// Implements concurrent session limits and advanced session controls

import db from '../db.js';
import { logger } from '../logger.js';

/**
 * Default session configuration
 */
const DEFAULT_SESSION_CONFIG = {
  maxConcurrentSessions: 5,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  idleTimeout: 2 * 60 * 60 * 1000, // 2 hours
  requireDeviceTrust: false,
  allowMultipleDeviceTypes: true
};

/**
 * Get tenant-specific session configuration
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<Object>}
 */
export async function getTenantSessionConfig(tenantId) {
  const result = await db.query(
    'SELECT session_config FROM tenants WHERE id = $1',
    [tenantId]
  );
  
  if (result.rows.length === 0) {
    return DEFAULT_SESSION_CONFIG;
  }
  
  const config = result.rows[0].session_config || {};
  return { ...DEFAULT_SESSION_CONFIG, ...config };
}

/**
 * Enforce concurrent session limit
 * @param {string} userId - The user ID
 * @param {string} tenantId - The tenant ID
 * @param {number} maxSessions - Maximum allowed concurrent sessions
 */
export async function enforceSessionLimit(userId, tenantId, maxSessions = null) {
  try {
    // Get tenant-specific config if not provided
    if (maxSessions === null) {
      const config = await getTenantSessionConfig(tenantId);
      maxSessions = config.maxConcurrentSessions;
    }
    
    // Count active sessions
    const countResult = await db.query(
      `SELECT COUNT(*) as count
       FROM auth_sessions
       WHERE user_id = $1 AND tenant_id = $2 AND is_active = true AND expires_at > NOW()`,
      [userId, tenantId]
    );
    
    const activeCount = parseInt(countResult.rows[0].count);
    
    if (activeCount >= maxSessions) {
      // Get oldest sessions to revoke
      const sessionsToRevoke = activeCount - maxSessions + 1;
      
      await db.query(
        `UPDATE auth_sessions
         SET is_active = false, logged_out_at = NOW()
         WHERE id IN (
           SELECT id FROM auth_sessions
           WHERE user_id = $1 AND tenant_id = $2 AND is_active = true
           ORDER BY last_accessed_at ASC
           LIMIT $3
         )`,
        [userId, tenantId, sessionsToRevoke]
      );
      
      logger.info('Session limit enforced - oldest sessions revoked', {
        userId,
        tenantId,
        revokedCount: sessionsToRevoke,
        maxSessions
      });
    }
  } catch (error) {
    logger.error('Failed to enforce session limit', {
      error: error.message,
      userId,
      tenantId
    });
    // Don't throw - fail open to prevent login disruption
  }
}

/**
 * Create a new session with limit enforcement
 * @param {Object} sessionData - Session data
 * @returns {Promise<string>} - Session ID
 */
export async function createSession(sessionData) {
  const {
    userId,
    tenantId,
    sessionToken,
    refreshToken,
    accessTokenHash,
    ipAddress,
    userAgent,
    deviceFingerprint,
    locationCountry,
    locationCity,
    loginMethod,
    ssoProvider
  } = sessionData;
  
  // Enforce session limit before creating new session
  await enforceSessionLimit(userId, tenantId);
  
  // Get tenant session config
  const config = await getTenantSessionConfig(tenantId);
  
  // Calculate expiration times
  const expiresAt = new Date(Date.now() + config.sessionTimeout);
  const idleExpiresAt = new Date(Date.now() + config.idleTimeout);
  
  const result = await db.query(
    `INSERT INTO auth_sessions (
      user_id, tenant_id, session_token, refresh_token, access_token_hash,
      ip_address, user_agent, device_fingerprint, location_country, location_city,
      is_active, login_method, sso_provider, created_at, last_accessed_at, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11, $12, NOW(), NOW(), $13)
    RETURNING id`,
    [
      userId, tenantId, sessionToken, refreshToken, accessTokenHash,
      ipAddress, userAgent, deviceFingerprint, locationCountry, locationCity,
      loginMethod, ssoProvider, expiresAt
    ]
  );
  
  logger.info('Session created', {
    sessionId: result.rows[0].id,
    userId,
    tenantId,
    loginMethod
  });
  
  return result.rows[0].id;
}

/**
 * Update session last accessed time
 * @param {string} sessionId - The session ID
 */
export async function touchSession(sessionId) {
  await db.query(
    'UPDATE auth_sessions SET last_accessed_at = NOW() WHERE id = $1 AND is_active = true',
    [sessionId]
  );
}

/**
 * Check if session is still valid based on idle timeout
 * @param {string} sessionId - The session ID
 * @returns {Promise<boolean>}
 */
export async function isSessionActive(sessionId) {
  const result = await db.query(
    `SELECT s.id, s.last_accessed_at, s.expires_at, s.tenant_id, t.session_config
     FROM auth_sessions s
     LEFT JOIN tenants t ON s.tenant_id = t.id
     WHERE s.id = $1 AND s.is_active = true`,
    [sessionId]
  );
  
  if (result.rows.length === 0) {
    return false;
  }
  
  const session = result.rows[0];
  const config = { ...DEFAULT_SESSION_CONFIG, ...(session.session_config || {}) };
  
  // Check absolute expiration
  if (new Date(session.expires_at) < new Date()) {
    return false;
  }
  
  // Check idle timeout
  const idleTime = Date.now() - new Date(session.last_accessed_at).getTime();
  if (idleTime > config.idleTimeout) {
    // Expire session due to inactivity
    await db.query(
      'UPDATE auth_sessions SET is_active = false, logged_out_at = NOW() WHERE id = $1',
      [sessionId]
    );
    return false;
  }
  
  return true;
}

/**
 * Terminate a specific session
 * @param {string} sessionId - The session ID
 */
export async function terminateSession(sessionId) {
  await db.query(
    'UPDATE auth_sessions SET is_active = false, logged_out_at = NOW() WHERE id = $1',
    [sessionId]
  );
  
  logger.info('Session terminated', { sessionId });
}

/**
 * Terminate all sessions for a user
 * @param {string} userId - The user ID
 * @param {string} tenantId - The tenant ID
 * @param {string} exceptSessionId - Optional session ID to exclude
 */
export async function terminateAllUserSessions(userId, tenantId, exceptSessionId = null) {
  const query = exceptSessionId
    ? 'UPDATE auth_sessions SET is_active = false, logged_out_at = NOW() WHERE user_id = $1 AND tenant_id = $2 AND id != $3 AND is_active = true'
    : 'UPDATE auth_sessions SET is_active = false, logged_out_at = NOW() WHERE user_id = $1 AND tenant_id = $2 AND is_active = true';
  
  const params = exceptSessionId ? [userId, tenantId, exceptSessionId] : [userId, tenantId];
  
  const result = await db.query(query, params);
  
  logger.info('All user sessions terminated', {
    userId,
    tenantId,
    count: result.rowCount,
    exceptSessionId
  });
}

/**
 * Get all active sessions for a user
 * @param {string} userId - The user ID
 * @param {string} tenantId - The tenant ID
 * @returns {Promise<Array>}
 */
export async function getUserSessions(userId, tenantId) {
  const result = await db.query(
    `SELECT id, ip_address, user_agent, device_fingerprint, location_country, location_city,
            login_method, sso_provider, created_at, last_accessed_at, expires_at
     FROM auth_sessions
     WHERE user_id = $1 AND tenant_id = $2 AND is_active = true AND expires_at > NOW()
     ORDER BY last_accessed_at DESC`,
    [userId, tenantId]
  );
  
  return result.rows;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  const result = await db.query(
    'DELETE FROM auth_sessions WHERE expires_at < NOW() - INTERVAL \'90 days\''
  );
  
  if (result.rowCount > 0) {
    logger.info(`Cleaned up ${result.rowCount} expired sessions`);
  }
}

export default {
  getTenantSessionConfig,
  enforceSessionLimit,
  createSession,
  touchSession,
  isSessionActive,
  terminateSession,
  terminateAllUserSessions,
  getUserSessions,
  cleanupExpiredSessions
};
