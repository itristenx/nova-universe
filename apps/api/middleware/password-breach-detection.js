// Password Breach Detection for Nova Universe API
// Implements Have I Been Pwned API integration and local breach detection

import crypto from 'crypto';
import https from 'https';
import fs from 'fs/promises';
import { logger } from '../logger.js';
import { logSecurityEvent } from './security-monitoring.js';

/**
 * Password breach detection configuration
 */
const BREACH_CONFIG = {
  // Have I Been Pwned API settings
  hibpApiUrl: 'https://api.pwnedpasswords.com/range/',
  hibpUserAgent: 'Nova-Universe-API',
  requestTimeout: 5000,
  
  // Local breach database settings
  localBreachFile: '/tmp/common-passwords.txt',
  maxLocalPasswords: 100000, // Maximum passwords to store locally
  
  // Cache settings
  cacheEnabled: true,
  cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxCacheSize: 10000,
  
  // Thresholds
  minOccurrences: 1, // Minimum occurrences to consider breached
  highRiskOccurrences: 100, // Occurrences that indicate high risk
  
  // Rate limiting for HIBP API
  apiRateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
};

/**
 * In-memory cache for breach check results
 */
class BreachCache {
  constructor() {
    this.cache = new Map();
    this.apiRequestTimes = [];
    this.cleanup();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key, data) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= BREACH_CONFIG.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      expires: Date.now() + BREACH_CONFIG.cacheTTL,
    });
  }

  canMakeApiRequest() {
    const now = Date.now();
    const windowStart = now - BREACH_CONFIG.apiRateLimit.windowMs;
    
    // Remove old request times
    this.apiRequestTimes = this.apiRequestTimes.filter(time => time > windowStart);
    
    return this.apiRequestTimes.length < BREACH_CONFIG.apiRateLimit.maxRequests;
  }

  recordApiRequest() {
    this.apiRequestTimes.push(Date.now());
  }

  cleanup() {
    // Clean up expired cache entries every hour
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expires) {
          this.cache.delete(key);
        }
      }
    }, 60 * 60 * 1000);
  }
}

const breachCache = new BreachCache();

/**
 * Generate SHA-1 hash of password
 */
function generatePasswordHash(password) {
  return crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
}

/**
 * Check password against Have I Been Pwned API
 */
async function checkHIBPBreach(passwordHash) {
  return new Promise((resolve) => {
    // Check rate limiting
    if (!breachCache.canMakeApiRequest()) {
      logger.warn('HIBP API rate limit reached, skipping check');
      return resolve({ breached: false, occurrences: 0, source: 'rate_limited' });
    }
    
    const hashPrefix = passwordHash.substring(0, 5);
    const hashSuffix = passwordHash.substring(5);
    const url = `${BREACH_CONFIG.hibpApiUrl}${hashPrefix}`;
    
    const req = https.get(url, {
      headers: {
        'User-Agent': BREACH_CONFIG.hibpUserAgent,
      },
      timeout: BREACH_CONFIG.requestTimeout,
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        breachCache.recordApiRequest();
        
        if (res.statusCode !== 200) {
          logger.warn('HIBP API request failed', { statusCode: res.statusCode, url });
          return resolve({ breached: false, occurrences: 0, source: 'api_error' });
        }
        
        // Parse response to find hash suffix
        const lines = data.split('\n');
        for (const line of lines) {
          const [suffix, count] = line.split(':');
          if (suffix === hashSuffix) {
            const occurrences = parseInt(count, 10);
            return resolve({
              breached: occurrences >= BREACH_CONFIG.minOccurrences,
              occurrences,
              source: 'hibp_api',
              riskLevel: occurrences >= BREACH_CONFIG.highRiskOccurrences ? 'high' : 'medium'
            });
          }
        }
        
        // Hash not found in breaches
        resolve({ breached: false, occurrences: 0, source: 'hibp_api' });
      });
    });
    
    req.on('error', (error) => {
      logger.error('HIBP API request error', { error: error.message, url });
      resolve({ breached: false, occurrences: 0, source: 'request_error' });
    });
    
    req.on('timeout', () => {
      req.destroy();
      logger.warn('HIBP API request timeout', { url });
      resolve({ breached: false, occurrences: 0, source: 'timeout' });
    });
  });
}

/**
 * Load local common passwords list
 */
async function loadLocalBreachList() {
  try {
    // Try to load from local file
    const content = await fs.readFile(BREACH_CONFIG.localBreachFile, 'utf8');
    return content.split('\n').filter(line => line.trim()).slice(0, BREACH_CONFIG.maxLocalPasswords);
  } catch {
    // If file doesn't exist, create a basic common passwords list
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 'password1',
      'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password123',
      'qwerty123', '123123', 'admin123', 'root', 'toor', 'pass', 'test',
      'guest', 'user', 'demo', '12345', '1234', '12345678', 'dragon',
      'trustno1', 'baseball', 'football', 'superman', 'michael', 'jordan',
      'iloveyou', 'shadow', 'master', 'jennifer', 'computer', 'freedom',
      'whatever', 'nicolas', 'security', 'princess', 'cookie', 'access',
      'login', 'hello', 'sunshine', 'maggie', 'starwars', 'summer',
      'internet', 'service', 'canada', 'hello123', 'ranger', 'dakota',
      'testing', 'orange', 'marina', 'diablo', 'hockey', 'secret',
      'passw0rd', 'password!', 'qwerty1', 'welcome1', 'admin1', 'test123'
    ];
    
    try {
      await fs.writeFile(BREACH_CONFIG.localBreachFile, commonPasswords.join('\n'), 'utf8');
    } catch (writeError) {
      logger.warn('Could not write local breach file', { error: writeError.message });
    }
    
    return commonPasswords;
  }
}

/**
 * Check password against local breach list
 */
async function checkLocalBreach(password) {
  try {
    const localPasswords = await loadLocalBreachList();
    const lowercasePassword = password.toLowerCase();
    
    // Check exact match
    if (localPasswords.includes(lowercasePassword)) {
      return { breached: true, source: 'local_list', riskLevel: 'high' };
    }
    
    // Check common variations
    const variations = [
      password,
      password + '1',
      password + '!',
      password + '123',
      '123' + password,
      password.replace(/[aeiou]/gi, ''),
      password.split('').reverse().join(''),
    ];
    
    for (const variation of variations) {
      if (localPasswords.includes(variation.toLowerCase())) {
        return { breached: true, source: 'local_variation', riskLevel: 'medium' };
      }
    }
    
    return { breached: false, source: 'local_list' };
    
  } catch (error) {
    logger.error('Local breach check error', { error: error.message });
    return { breached: false, source: 'local_error' };
  }
}

/**
 * Check password patterns for common weak patterns
 */
function checkPasswordPatterns(password) {
  const patterns = [
    // Sequential numbers
    { regex: /^[0-9]+$/, risk: 'high', description: 'Only numbers' },
    { regex: /^(012|123|234|345|456|567|678|789|890)+/, risk: 'high', description: 'Sequential numbers' },
    
    // Sequential letters
    { regex: /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+/i, risk: 'high', description: 'Sequential letters' },
    
    // Keyboard patterns
    { regex: /^(qwerty|asdf|zxcv|qaz|wsx|edc|rfv|tgb|yhn|ujm|ik|ol|p)+/i, risk: 'high', description: 'Keyboard pattern' },
    
    // Repeated characters
    { regex: /^(.)\1+$/, risk: 'high', description: 'Repeated character' },
    { regex: /(.)\1{2,}/, risk: 'medium', description: 'Contains repeated characters' },
    
    // Common words with numbers at end
    { regex: /^(password|admin|user|test|guest|login|root|demo|welcome)[0-9]*$/i, risk: 'high', description: 'Common word with numbers' },
    
    // Date patterns
    { regex: /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/, risk: 'medium', description: 'Date pattern (YYYYMMDD)' },
    { regex: /^(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])(19|20)\d{2}$/, risk: 'medium', description: 'Date pattern (DDMMYYYY)' },
    
    // Simple substitutions
    { regex: /^[a-z]+[0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?~`]*$/i, risk: 'low', description: 'Simple word with symbols/numbers' },
  ];
  
  for (const pattern of patterns) {
    if (pattern.regex.test(password)) {
      return {
        weak: true,
        riskLevel: pattern.risk,
        description: pattern.description,
        source: 'pattern_analysis'
      };
    }
  }
  
  return { weak: false, source: 'pattern_analysis' };
}

/**
 * Comprehensive password breach check
 */
export async function checkPasswordBreach(password, options = {}) {
  const {
    checkHIBP = true,
    checkLocal = true,
    checkPatterns = true,
    userId = null,
    skipCache = false
  } = options;
  
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Invalid password provided');
    }
    
    const passwordHash = generatePasswordHash(password);
    const cacheKey = `breach:${passwordHash}`;
    
    // Check cache first
    if (BREACH_CONFIG.cacheEnabled && !skipCache) {
      const cached = breachCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    const results = {
      breached: false,
      riskLevel: 'low',
      sources: [],
      occurrences: 0,
      checks: {},
      timestamp: new Date().toISOString()
    };
    
    // Check local breach list
    if (checkLocal) {
      const localResult = await checkLocalBreach(password);
      results.checks.local = localResult;
      
      if (localResult.breached) {
        results.breached = true;
        results.riskLevel = localResult.riskLevel;
        results.sources.push(localResult.source);
      }
    }
    
    // Check password patterns
    if (checkPatterns) {
      const patternResult = checkPasswordPatterns(password);
      results.checks.patterns = patternResult;
      
      if (patternResult.weak) {
        results.breached = true;
        results.riskLevel = patternResult.riskLevel;
        results.sources.push(patternResult.source);
        results.patternDescription = patternResult.description;
      }
    }
    
    // Check Have I Been Pwned (only if not already breached by local checks)
    if (checkHIBP && !results.breached) {
      const hibpResult = await checkHIBPBreach(passwordHash);
      results.checks.hibp = hibpResult;
      
      if (hibpResult.breached) {
        results.breached = true;
        results.riskLevel = hibpResult.riskLevel;
        results.sources.push(hibpResult.source);
        results.occurrences = hibpResult.occurrences;
      }
    }
    
    // Determine overall risk level
    if (results.breached) {
      const riskLevels = Object.values(results.checks)
        .filter(check => check.riskLevel)
        .map(check => check.riskLevel);
      
      if (riskLevels.includes('high')) {
        results.riskLevel = 'high';
      } else if (riskLevels.includes('medium')) {
        results.riskLevel = 'medium';
      }
    }
    
    // Cache result
    if (BREACH_CONFIG.cacheEnabled) {
      breachCache.set(cacheKey, results);
    }
    
    // Log security event if breached
    if (results.breached && userId) {
      await logSecurityEvent('PASSWORD_BREACH_DETECTED', {
        userId,
        resource: 'password',
        metadata: {
          riskLevel: results.riskLevel,
          sources: results.sources,
          occurrences: results.occurrences,
          patternDescription: results.patternDescription
        }
      });
    }
    
    logger.info('Password breach check completed', {
      userId,
      breached: results.breached,
      riskLevel: results.riskLevel,
      sources: results.sources,
      occurrences: results.occurrences
    });
    
    return results;
    
  } catch (error) {
    logger.error('Password breach check error', { error: error.message, userId });
    throw error;
  }
}

/**
 * Password breach validation middleware
 */
export function validatePasswordBreach(options = {}) {
  const {
    required = false,
    blockBreached = false,
    warnOnly = true
  } = options;
  
  return async (req, res, next) => {
    try {
      const password = req.body.password || req.body.newPassword;
      
      if (!password) {
        if (required) {
          return res.status(400).json({
            success: false,
            error: 'Password is required for breach validation',
            errorCode: 'PASSWORD_REQUIRED'
          });
        }
        return next();
      }
      
      const userId = req.user?.id;
      const breachResult = await checkPasswordBreach(password, { userId });
      
      // Attach breach result to request
      req.passwordBreachResult = breachResult;
      
      if (breachResult.breached) {
        const errorMessage = `Password has been compromised in data breaches (found ${breachResult.occurrences} times)`;
        
        if (blockBreached) {
          return res.status(400).json({
            success: false,
            error: errorMessage,
            errorCode: 'PASSWORD_BREACHED',
            breachDetails: {
              riskLevel: breachResult.riskLevel,
              sources: breachResult.sources,
              occurrences: breachResult.occurrences,
              patternDescription: breachResult.patternDescription
            }
          });
        }
        
        if (warnOnly) {
          // Add warning to response but continue
          req.passwordWarning = {
            type: 'breach_detected',
            message: errorMessage,
            details: breachResult
          };
        }
      }
      
      next();
      
    } catch (error) {
      logger.error('Password breach validation error', { error: error.message });
      
      // Continue processing on validation error
      if (options.continueOnError !== false) {
        return next();
      }
      
      res.status(500).json({
        success: false,
        error: 'Password validation error',
        errorCode: 'VALIDATION_ERROR'
      });
    }
  };
}

/**
 * Get breach statistics
 */
export async function getBreachStatistics(db, timeframe = '30 days') {
  try {
    let dateFilter = "datetime('now', '-30 days')";
    
    if (timeframe === '7 days') {
      dateFilter = "datetime('now', '-7 days')";
    } else if (timeframe === '1 day') {
      dateFilter = "datetime('now', '-1 day')";
    } else if (timeframe === '1 year') {
      dateFilter = "datetime('now', '-1 year')";
    }
    
    const query = `
      SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN JSON_EXTRACT(metadata, '$.riskLevel') = 'high' THEN 1 ELSE 0 END) as high_risk,
        SUM(CASE WHEN JSON_EXTRACT(metadata, '$.riskLevel') = 'medium' THEN 1 ELSE 0 END) as medium_risk,
        SUM(CASE WHEN JSON_EXTRACT(metadata, '$.riskLevel') = 'low' THEN 1 ELSE 0 END) as low_risk,
        AVG(CAST(JSON_EXTRACT(metadata, '$.occurrences') AS INTEGER)) as avg_occurrences
      FROM security_events 
      WHERE event_type = 'PASSWORD_BREACH_DETECTED' 
        AND created_at >= ${dateFilter}
    `;
    
    const stats = await new Promise((resolve, reject) => {
      db.get(query, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    return {
      timeframe,
      totalChecks: stats.total_checks || 0,
      riskDistribution: {
        high: stats.high_risk || 0,
        medium: stats.medium_risk || 0,
        low: stats.low_risk || 0
      },
      averageOccurrences: Math.round(stats.avg_occurrences || 0)
    };
    
  } catch (error) {
    logger.error('Failed to get breach statistics', { error: error.message });
    throw error;
  }
}

export default {
  checkPasswordBreach,
  validatePasswordBreach,
  getBreachStatistics,
  BREACH_CONFIG,
};