// Token Rotation Implementation
// Implements automatic refresh token rotation on use (OAuth 2.0 Best Practice)

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { logger } from '../logger.js';

/**
 * Rotate refresh token - generates new refresh token and invalidates old one
 * @param {string} oldRefreshToken - The refresh token to rotate
 * @returns {Promise<{accessToken: string, refreshToken: string}>}
 */
export async function rotateRefreshToken(oldRefreshToken) {
  try {
    // Verify old refresh token
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);
    
    // Check if token type is refresh
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type - must be refresh token');
    }
    
    // Check if token has already been rotated (prevent reuse)
    const isRevoked = await isTokenRevoked(decoded.jti);
    if (isRevoked) {
      logger.warn('Attempted reuse of rotated refresh token', {
        jti: decoded.jti,
        userId: decoded.userId,
        tenantId: decoded.tenantId
      });
      throw new Error('Refresh token has been revoked - possible token reuse attack');
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        role: decoded.role,
        email: decoded.email,
        type: 'access'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
        jti: uuidv4(),
        issuer: 'nova-universe-api',
        audience: 'nova-universe'
      }
    );
    
    // Generate new refresh token with incremented rotation counter
    const newRefreshToken = jwt.sign(
      {
        userId: decoded.userId,
        tenantId: decoded.tenantId,
        role: decoded.role,
        email: decoded.email,
        type: 'refresh',
        rotation: (decoded.rotation || 0) + 1
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
        jti: uuidv4(),
        issuer: 'nova-universe-api',
        audience: 'nova-universe'
      }
    );
    
    // Revoke old refresh token
    await revokeToken(oldRefreshToken, 'Token rotated on refresh grant');
    
    logger.info('Refresh token rotated successfully', {
      userId: decoded.userId,
      tenantId: decoded.tenantId,
      rotation: (decoded.rotation || 0) + 1
    });
    
    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer'
    };
    
  } catch (error) {
    logger.error('Token rotation failed', { error: error.message });
    throw error;
  }
}

/**
 * Revoke a token by adding it to the blacklist
 * @param {string} token - The token to revoke
 * @param {string} reason - Reason for revocation
 */
export async function revokeToken(token, reason = 'User initiated revocation') {
  try {
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.jti) {
      throw new Error('Invalid token - missing JTI claim');
    }
    
    // Add to revoked tokens table
    await db.query(
      `INSERT INTO oauth_revoked_tokens (jti, user_id, tenant_id, revoked_at, expires_at, reason)
       VALUES ($1, $2, $3, NOW(), $4, $5)
       ON CONFLICT (jti) DO NOTHING`,
      [
        decoded.jti,
        decoded.userId || null,
        decoded.tenantId || null,
        new Date(decoded.exp * 1000),
        reason
      ]
    );
    
    logger.info('Token revoked', {
      jti: decoded.jti,
      userId: decoded.userId,
      reason
    });
    
  } catch (error) {
    logger.error('Token revocation failed', { error: error.message });
    throw error;
  }
}

/**
 * Check if a token has been revoked
 * @param {string} jti - The token JTI to check
 * @returns {Promise<boolean>}
 */
export async function isTokenRevoked(jti) {
  try {
    const result = await db.query(
      'SELECT 1 FROM oauth_revoked_tokens WHERE jti = $1 AND expires_at > NOW()',
      [jti]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Token revocation check failed', { error: error.message });
    return false; // Fail open to prevent service disruption
  }
}

/**
 * Clean up expired revoked tokens (run periodically)
 */
export async function cleanupExpiredTokens() {
  try {
    const result = await db.query(
      'DELETE FROM oauth_revoked_tokens WHERE expires_at < NOW()'
    );
    
    if (result.rowCount > 0) {
      logger.info(`Cleaned up ${result.rowCount} expired revoked tokens`);
    }
  } catch (error) {
    logger.error('Token cleanup failed', { error: error.message });
  }
}

export default {
  rotateRefreshToken,
  revokeToken,
  isTokenRevoked,
  cleanupExpiredTokens
};
