// Account Lockout Protection for Nova Universe API
// Implements brute force protection and account lockout mechanisms

import { logger } from '../logger.js';
import db from '../db.js';

/**
 * Account lockout configuration
 */
const LOCKOUT_CONFIG = {
  maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 15 * 60 * 1000, // 15 minutes
  progressiveLockout: process.env.PROGRESSIVE_LOCKOUT !== 'false',
  maxLockoutDuration: parseInt(process.env.MAX_LOCKOUT_DURATION) || 24 * 60 * 60 * 1000, // 24 hours
  resetSuccessfulLogin: process.env.RESET_ON_SUCCESS !== 'false',
  trackByIP: process.env.TRACK_BY_IP !== 'false',
  ipLockoutThreshold: parseInt(process.env.IP_LOCKOUT_THRESHOLD) || 20,
};

/**
 * In-memory cache for failed attempts (for production, use Redis)
 */
const attemptCache = new Map();
const ipAttemptCache = new Map();

/**
 * Get lockout duration with progressive increase
 */
function getLockoutDuration(attemptCount) {
  if (!LOCKOUT_CONFIG.progressiveLockout) {
    return LOCKOUT_CONFIG.lockoutDuration;
  }
  
  // Progressive lockout: 15m, 30m, 1h, 2h, 4h, 8h, 24h
  const multipliers = [1, 2, 4, 8, 16, 32, 96];
  const multiplier = multipliers[Math.min(attemptCount - LOCKOUT_CONFIG.maxAttempts, multipliers.length - 1)];
  
  const duration = LOCKOUT_CONFIG.lockoutDuration * multiplier;
  return Math.min(duration, LOCKOUT_CONFIG.maxLockoutDuration);
}

/**
 * Record failed login attempt
 */
export async function recordFailedAttempt(identifier, ipAddress = null) {
  const now = Date.now();
  
  try {
    // Get current attempts from database
    const currentAttempts = await getFailedAttempts(identifier);
    const newAttemptCount = currentAttempts.attemptCount + 1;
    
    // Calculate lockout end time
    let lockoutUntil = null;
    if (newAttemptCount >= LOCKOUT_CONFIG.maxAttempts) {
      const lockoutDuration = getLockoutDuration(newAttemptCount);
      lockoutUntil = new Date(now + lockoutDuration).toISOString();
    }
    
    // Store in database
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT OR REPLACE INTO failed_login_attempts 
        (identifier, attempt_count, last_attempt, lockout_until, ip_address, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        identifier,
        newAttemptCount,
        new Date(now).toISOString(),
        lockoutUntil,
        ipAddress,
        currentAttempts.createdAt || new Date(now).toISOString(),
        new Date(now).toISOString()
      ], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Update cache
    attemptCache.set(identifier, {
      attemptCount: newAttemptCount,
      lastAttempt: now,
      lockoutUntil: lockoutUntil ? new Date(lockoutUntil).getTime() : null
    });
    
    // Track IP-based attempts if enabled
    if (LOCKOUT_CONFIG.trackByIP && ipAddress) {
      await recordIPAttempt(ipAddress);
    }
    
    logger.warn('Failed login attempt recorded', {
      identifier: identifier.includes('@') ? identifier.split('@')[0] + '@***' : '***',
      attemptCount: newAttemptCount,
      ipAddress,
      lockoutUntil,
      lockoutDuration: lockoutUntil ? getLockoutDuration(newAttemptCount) : null
    });
    
    return {
      attemptCount: newAttemptCount,
      lockoutUntil,
      isLocked: !!lockoutUntil
    };
    
  } catch (error) {
    logger.error('Failed to record login attempt:', error);
    throw error;
  }
}

/**
 * Record IP-based failed attempt
 */
async function recordIPAttempt(ipAddress) {
  const now = Date.now();
  const cacheKey = `ip_${ipAddress}`;
  
  const current = ipAttemptCache.get(cacheKey) || { count: 0, lastAttempt: 0 };
  
  // Reset count if last attempt was more than 1 hour ago
  if (now - current.lastAttempt > 60 * 60 * 1000) {
    current.count = 0;
  }
  
  current.count++;
  current.lastAttempt = now;
  
  ipAttemptCache.set(cacheKey, current);
  
  if (current.count >= LOCKOUT_CONFIG.ipLockoutThreshold) {
    logger.warn('IP address locked due to excessive failed attempts', {
      ipAddress,
      attemptCount: current.count
    });
  }
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(identifier, ipAddress = null) {
  try {
    // Check cache first
    const cached = attemptCache.get(identifier);
    if (cached && cached.lockoutUntil && Date.now() < cached.lockoutUntil) {
      return {
        isLocked: true,
        lockoutUntil: new Date(cached.lockoutUntil),
        attemptCount: cached.attemptCount
      };
    }
    
    // Check database
    const attempts = await getFailedAttempts(identifier);
    
    if (attempts.lockoutUntil && new Date(attempts.lockoutUntil) > new Date()) {
      // Update cache
      attemptCache.set(identifier, {
        attemptCount: attempts.attemptCount,
        lastAttempt: new Date(attempts.lastAttempt).getTime(),
        lockoutUntil: new Date(attempts.lockoutUntil).getTime()
      });
      
      return {
        isLocked: true,
        lockoutUntil: new Date(attempts.lockoutUntil),
        attemptCount: attempts.attemptCount
      };
    }
    
    // Check IP-based lockout
    if (LOCKOUT_CONFIG.trackByIP && ipAddress) {
      const ipLocked = isIPLocked(ipAddress);
      if (ipLocked.isLocked) {
        return ipLocked;
      }
    }
    
    return {
      isLocked: false,
      attemptCount: attempts.attemptCount || 0
    };
    
  } catch (error) {
    logger.error('Failed to check account lockout:', error);
    // Fail open - allow login attempt if we can't check lockout status
    return { isLocked: false, attemptCount: 0 };
  }
}

/**
 * Check if IP is locked
 */
function isIPLocked(ipAddress) {
  const cacheKey = `ip_${ipAddress}`;
  const current = ipAttemptCache.get(cacheKey);
  
  if (!current) {
    return { isLocked: false };
  }
  
  // Reset if last attempt was more than 1 hour ago
  if (Date.now() - current.lastAttempt > 60 * 60 * 1000) {
    ipAttemptCache.delete(cacheKey);
    return { isLocked: false };
  }
  
  if (current.count >= LOCKOUT_CONFIG.ipLockoutThreshold) {
    return {
      isLocked: true,
      reason: 'IP address temporarily blocked due to excessive failed attempts',
      lockoutUntil: new Date(current.lastAttempt + 60 * 60 * 1000) // 1 hour from last attempt
    };
  }
  
  return { isLocked: false };
}

/**
 * Get failed attempts for identifier
 */
async function getFailedAttempts(identifier) {
  try {
    const attempts = await new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM failed_login_attempts 
        WHERE identifier = ?
      `, [identifier], (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      });
    });
    
    return {
      attemptCount: attempts.attempt_count || 0,
      lastAttempt: attempts.last_attempt,
      lockoutUntil: attempts.lockout_until,
      createdAt: attempts.created_at
    };
  } catch (error) {
    logger.error('Failed to get failed attempts:', error);
    return { attemptCount: 0 };
  }
}

/**
 * Clear failed attempts on successful login
 */
export async function clearFailedAttempts(identifier) {
  if (!LOCKOUT_CONFIG.resetSuccessfulLogin) {
    return;
  }
  
  try {
    await new Promise((resolve, reject) => {
      db.run(`
        DELETE FROM failed_login_attempts 
        WHERE identifier = ?
      `, [identifier], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Clear cache
    attemptCache.delete(identifier);
    
    logger.info('Failed attempts cleared for successful login', {
      identifier: identifier.includes('@') ? identifier.split('@')[0] + '@***' : '***'
    });
    
  } catch (error) {
    logger.error('Failed to clear failed attempts:', error);
  }
}

/**
 * Unlock account manually (admin function)
 */
export async function unlockAccount(identifier, adminUserId) {
  try {
    await new Promise((resolve, reject) => {
      db.run(`
        DELETE FROM failed_login_attempts 
        WHERE identifier = ?
      `, [identifier], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Clear cache
    attemptCache.delete(identifier);
    
    logger.info('Account unlocked manually', {
      identifier: identifier.includes('@') ? identifier.split('@')[0] + '@***' : '***',
      unlockedBy: adminUserId
    });
    
    return true;
  } catch (error) {
    logger.error('Failed to unlock account:', error);
    throw error;
  }
}

/**
 * Get lockout statistics
 */
export async function getLockoutStats() {
  try {
    const stats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          COUNT(*) as total_locked_accounts,
          COUNT(CASE WHEN lockout_until > datetime('now') THEN 1 END) as currently_locked,
          AVG(attempt_count) as avg_attempts,
          MAX(attempt_count) as max_attempts
        FROM failed_login_attempts
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0] || {});
      });
    });
    
    return {
      totalLockedAccounts: stats.total_locked_accounts || 0,
      currentlyLocked: stats.currently_locked || 0,
      averageAttempts: Math.round(stats.avg_attempts || 0),
      maxAttempts: stats.max_attempts || 0,
      cachedAttempts: attemptCache.size,
      ipAttempts: ipAttemptCache.size
    };
  } catch (error) {
    logger.error('Failed to get lockout stats:', error);
    return {};
  }
}

/**
 * Middleware to check account lockout
 */
export function checkAccountLockout(req, res, next) {
  const identifier = req.body.email || req.body.username;
  const ipAddress = req.ip;
  
  if (!identifier) {
    return next();
  }
  
  isAccountLocked(identifier, ipAddress)
    .then(lockStatus => {
      if (lockStatus.isLocked) {
        logger.warn('Login attempt on locked account', {
          identifier: identifier.includes('@') ? identifier.split('@')[0] + '@***' : '***',
          ipAddress,
          lockoutUntil: lockStatus.lockoutUntil,
          attemptCount: lockStatus.attemptCount
        });
        
        return res.status(423).json({
          success: false,
          error: 'Account temporarily locked',
          errorCode: 'ACCOUNT_LOCKED',
          lockoutUntil: lockStatus.lockoutUntil,
          message: lockStatus.reason || `Account is locked due to multiple failed login attempts. Try again after ${lockStatus.lockoutUntil?.toLocaleString()}.`
        });
      }
      
      // Add lockout info to request
      req.lockoutInfo = lockStatus;
      next();
    })
    .catch(error => {
      logger.error('Lockout check failed:', error);
      // Continue with login attempt if lockout check fails
      next();
    });
}

/**
 * Initialize database tables for failed attempts
 */
export async function initializeLockoutTables() {
  try {
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS failed_login_attempts (
          identifier TEXT PRIMARY KEY,
          attempt_count INTEGER NOT NULL DEFAULT 0,
          last_attempt TEXT NOT NULL,
          lockout_until TEXT,
          ip_address TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Create index for performance
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_failed_attempts_lockout 
        ON failed_login_attempts (lockout_until)
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    logger.info('Lockout tables initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize lockout tables:', error);
    throw error;
  }
}

/**
 * Cleanup expired lockout records
 */
export async function cleanupExpiredLockouts() {
  try {
    const result = await new Promise((resolve, reject) => {
      db.run(`
        DELETE FROM failed_login_attempts 
        WHERE lockout_until IS NOT NULL 
        AND lockout_until < datetime('now', '-1 day')
      `, function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
    
    logger.info('Cleaned up expired lockout records', { removedRecords: result });
    return result;
  } catch (error) {
    logger.error('Failed to cleanup expired lockouts:', error);
    throw error;
  }
}

export default {
  recordFailedAttempt,
  isAccountLocked,
  clearFailedAttempts,
  unlockAccount,
  getLockoutStats,
  checkAccountLockout,
  initializeLockoutTables,
  cleanupExpiredLockouts,
  LOCKOUT_CONFIG
};