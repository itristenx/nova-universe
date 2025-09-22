// Enhanced JWT Security System for Nova Universe API
// Implements secure JWT handling with refresh tokens, blacklisting, and token rotation

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { logger } from '../logger.js';
import db from '../db.js';

/**
 * JWT configuration following security best practices
 */
const JWT_CONFIG = {
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  issuer: 'nova-universe-api',
  audience: 'nova-universe',
  algorithm: 'HS256',
  notBeforeLeeway: 10, // seconds
  clockTolerance: 30, // seconds
};

/**
 * In-memory token blacklist (for production, use Redis or database)
 */
const TOKEN_BLACKLIST = new Set();

/**
 * Generate a secure refresh token
 */
function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Create JWT access token with enhanced security
 */
export function createAccessToken(payload, options = {}) {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set and be at least 32 characters long');
  }
  
  const tokenId = crypto.randomUUID();
  const issuedAt = Math.floor(Date.now() / 1000);
  
  const tokenPayload = {
    ...payload,
    jti: tokenId, // JWT ID for token tracking
    iat: issuedAt,
    nbf: issuedAt - JWT_CONFIG.notBeforeLeeway, // Not before (with leeway)
    type: 'access',
    // Security claims
    ip: options.ipAddress,
    userAgent: options.userAgent?.substring(0, 100), // Limit length
  };
  
  return jwt.sign(tokenPayload, jwtSecret, {
    expiresIn: JWT_CONFIG.accessTokenExpiry,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
    algorithm: JWT_CONFIG.algorithm,
  });
}

/**
 * Create refresh token and store in database
 */
export async function createRefreshToken(userId, options = {}) {
  const token = generateRefreshToken();
  const expiresAt = new Date(Date.now() + parseDuration(JWT_CONFIG.refreshTokenExpiry));
  const tokenId = crypto.randomUUID();
  
  try {
    // Store refresh token in database
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO refresh_tokens (
          id, user_id, token_hash, expires_at, created_at, 
          ip_address, user_agent, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        tokenId,
        userId,
        crypto.createHash('sha256').update(token).digest('hex'),
        expiresAt.toISOString(),
        new Date().toISOString(),
        options.ipAddress,
        options.userAgent?.substring(0, 255),
        1
      ], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    return { token, tokenId, expiresAt };
  } catch (error) {
    logger.error('Failed to create refresh token:', error);
    throw new Error('Failed to create refresh token');
  }
}

/**
 * Verify JWT token with enhanced security checks
 */
export function verifyAccessToken(token, options = {}) {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }
  
  try {
    // Check if token is blacklisted
    if (TOKEN_BLACKLIST.has(token)) {
      throw new Error('Token has been revoked');
    }
    
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithms: [JWT_CONFIG.algorithm],
      clockTolerance: JWT_CONFIG.clockTolerance,
    });
    
    // Verify token type
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    // Optional IP address verification
    if (options.verifyIpAddress && decoded.ip && decoded.ip !== options.ipAddress) {
      logger.warn('Token IP address mismatch', {
        tokenIp: decoded.ip,
        requestIp: options.ipAddress,
        userId: decoded.id
      });
      
      if (process.env.STRICT_IP_VERIFICATION === 'true') {
        throw new Error('Token IP address mismatch');
      }
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.info('Access token expired', { 
        expiredAt: error.expiredAt,
        userId: extractUserIdFromToken(token)
      });
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT token', { 
        error: error.message,
        token: token.substring(0, 20) + '...'
      });
    }
    
    throw error;
  }
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  try {
    const refreshToken = await new Promise((resolve, reject) => {
      db.get(`
        SELECT rt.*, u.email, u.name 
        FROM refresh_tokens rt 
        JOIN users u ON rt.user_id = u.id 
        WHERE rt.token_hash = ? AND rt.is_active = 1 AND rt.expires_at > ?
      `, [tokenHash, new Date().toISOString()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!refreshToken) {
      throw new Error('Invalid or expired refresh token');
    }
    
    return {
      id: refreshToken.id,
      userId: refreshToken.user_id,
      user: {
        id: refreshToken.user_id,
        email: refreshToken.email,
        name: refreshToken.name
      }
    };
  } catch (error) {
    logger.error('Refresh token verification failed:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken, options = {}) {
  try {
    const tokenData = await verifyRefreshToken(refreshToken);
    
    // Create new access token
    const newAccessToken = createAccessToken({
      id: tokenData.userId,
      email: tokenData.user.email,
      name: tokenData.user.name,
    }, options);
    
    // Optionally rotate refresh token for enhanced security
    if (process.env.ROTATE_REFRESH_TOKENS === 'true') {
      await revokeRefreshToken(refreshToken);
      const newRefreshTokenData = await createRefreshToken(tokenData.userId, options);
      
      logger.info('Tokens refreshed with rotation', {
        userId: tokenData.userId,
        ip: options.ipAddress
      });
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenData.token,
        expiresAt: newRefreshTokenData.expiresAt
      };
    }
    
    logger.info('Access token refreshed', {
      userId: tokenData.userId,
      ip: options.ipAddress
    });
    
    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken, // Keep existing refresh token
    };
  } catch (error) {
    logger.error('Token refresh failed:', error);
    throw error;
  }
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  try {
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE refresh_tokens 
        SET is_active = 0, revoked_at = ? 
        WHERE token_hash = ?
      `, [new Date().toISOString(), tokenHash], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    logger.info('Refresh token revoked', { tokenHash: tokenHash.substring(0, 16) + '...' });
  } catch (error) {
    logger.error('Failed to revoke refresh token:', error);
    throw error;
  }
}

/**
 * Blacklist access token (for logout)
 */
export function blacklistAccessToken(token) {
  TOKEN_BLACKLIST.add(token);
  
  // Clean up old tokens periodically
  if (TOKEN_BLACKLIST.size > 10000) {
    cleanupBlacklist();
  }
  
  logger.info('Access token blacklisted', {
    tokenPrefix: token.substring(0, 20) + '...',
    blacklistSize: TOKEN_BLACKLIST.size
  });
}

/**
 * Clean up expired tokens from blacklist
 */
function cleanupBlacklist() {
  const currentTime = Math.floor(Date.now() / 1000);
  const expiredTokens = [];
  
  for (const token of TOKEN_BLACKLIST) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp && decoded.exp < currentTime) {
        expiredTokens.push(token);
      }
    } catch {
      // Remove invalid tokens
      expiredTokens.push(token);
    }
  }
  
  expiredTokens.forEach(token => TOKEN_BLACKLIST.delete(token));
  
  logger.info('Cleaned up token blacklist', {
    removedTokens: expiredTokens.length,
    remainingTokens: TOKEN_BLACKLIST.size
  });
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId) {
  try {
    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE refresh_tokens 
        SET is_active = 0, revoked_at = ? 
        WHERE user_id = ? AND is_active = 1
      `, [new Date().toISOString(), userId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    logger.info('All refresh tokens revoked for user', { userId });
  } catch (error) {
    logger.error('Failed to revoke user tokens:', error);
    throw error;
  }
}

/**
 * Get active sessions for a user
 */
export async function getUserActiveSessions(userId) {
  try {
    const sessions = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, created_at, ip_address, user_agent, 
               substr(token_hash, 1, 8) as token_preview
        FROM refresh_tokens 
        WHERE user_id = ? AND is_active = 1 AND expires_at > ?
        ORDER BY created_at DESC
      `, [userId, new Date().toISOString()], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    return sessions;
  } catch (error) {
    logger.error('Failed to get user sessions:', error);
    throw error;
  }
}

/**
 * Helper function to parse duration strings
 */
function parseDuration(duration) {
  const units = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000,
  };
  
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

/**
 * Extract user ID from token without verification (for logging)
 */
function extractUserIdFromToken(token) {
  try {
    const decoded = jwt.decode(token);
    return decoded?.id || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Initialize database tables for refresh tokens
 */
export async function initializeTokenTables() {
  try {
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          revoked_at TEXT,
          ip_address TEXT,
          user_agent TEXT,
          is_active INTEGER DEFAULT 1,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Create index for performance
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_active 
        ON refresh_tokens (user_id, is_active)
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    logger.info('Token tables initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize token tables:', error);
    throw error;
  }
}

export default {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
  blacklistAccessToken,
  revokeAllUserTokens,
  getUserActiveSessions,
  initializeTokenTables,
  JWT_CONFIG
};