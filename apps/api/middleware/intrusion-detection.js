// Intrusion Detection System for Nova Universe API
// Implements real-time threat detection and automated response

import { logger } from '../logger.js';
import { logSecurityEvent } from './security-monitoring.js';

/**
 * Intrusion Detection System configuration
 */
const IDS_CONFIG = {
  // Threat scoring thresholds
  thresholds: {
    low: 25,      // Informational alerts
    medium: 50,   // Warning alerts
    high: 75,     // High priority alerts
    critical: 90, // Critical alerts requiring immediate action
  },
  
  // Time windows for analysis (in milliseconds)
  timeWindows: {
    short: 5 * 60 * 1000,      // 5 minutes
    medium: 15 * 60 * 1000,    // 15 minutes
    long: 60 * 60 * 1000,      // 1 hour
    extended: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Anomaly detection parameters
  anomalyDetection: {
    requestRateMultiplier: 5,   // Alert if request rate > 5x normal
    errorRateThreshold: 0.3,    // Alert if error rate > 30%
    uniqueIpThreshold: 100,     // Alert if > 100 unique IPs per hour
    suspiciousPatterns: 50,     // Alert if > 50 suspicious patterns detected
  },
  
  // Automated response configurations
  responses: {
    enableAutoBlock: true,      // Automatically block malicious IPs
    autoBlockDuration: 60 * 60 * 1000, // 1 hour default block
    enableRateLimit: true,      // Apply aggressive rate limiting
    enableNotifications: true,  // Send security notifications
  },
  
  // Whitelist configurations
  whitelist: {
    ips: ['127.0.0.1', '::1'], // Localhost IPs
    userAgents: [],             // Trusted user agents
    patterns: [],               // Trusted URL patterns
  },
};

/**
 * In-memory threat tracking
 */
class ThreatTracker {
  constructor() {
    this.ipThreatScores = new Map();
    this.userThreatScores = new Map();
    this.requestPatterns = new Map();
    this.blockedIps = new Map();
    this.sessionAnalytics = new Map();
    
    // Cleanup old data periodically
    this.startCleanupInterval();
  }

  updateThreatScore(identifier, type, scoreIncrease, reason) {
    const map = type === 'ip' ? this.ipThreatScores : this.userThreatScores;
    const currentScore = map.get(identifier) || 0;
    const newScore = Math.min(currentScore + scoreIncrease, 100);
    
    map.set(identifier, newScore);
    
    logger.info('Threat score updated', {
      identifier,
      type,
      previousScore: currentScore,
      newScore,
      increase: scoreIncrease,
      reason
    });
    
    return newScore;
  }

  getThreatScore(identifier, type) {
    const map = type === 'ip' ? this.ipThreatScores : this.userThreatScores;
    return map.get(identifier) || 0;
  }

  blockIP(ip, duration = IDS_CONFIG.responses.autoBlockDuration, reason = 'Automated threat detection') {
    const expiresAt = Date.now() + duration;
    this.blockedIps.set(ip, { reason, expiresAt, blockedAt: Date.now() });
    
    logger.warn('IP automatically blocked', { ip, duration, reason, expiresAt });
    
    // Log security event
    logSecurityEvent('IP_AUTO_BLOCKED', {
      ipAddress: ip,
      resource: 'intrusion_detection',
      metadata: { reason, duration, expiresAt }
    });
  }

  isIPBlocked(ip) {
    const blockInfo = this.blockedIps.get(ip);
    if (!blockInfo) return false;
    
    // Check if block has expired
    if (Date.now() > blockInfo.expiresAt) {
      this.blockedIps.delete(ip);
      return false;
    }
    
    return blockInfo;
  }

  recordRequestPattern(ip, pattern) {
    if (!this.requestPatterns.has(ip)) {
      this.requestPatterns.set(ip, []);
    }
    
    const patterns = this.requestPatterns.get(ip);
    patterns.push({ ...pattern, timestamp: Date.now() });
    
    // Keep only recent patterns (last hour)
    const oneHourAgo = Date.now() - IDS_CONFIG.timeWindows.long;
    const recentPatterns = patterns.filter(p => p.timestamp > oneHourAgo);
    this.requestPatterns.set(ip, recentPatterns);
    
    return recentPatterns.length;
  }

  analyzeSessionBehavior(sessionId, userId, behavior) {
    const sessionKey = sessionId || `user_${userId}`;
    if (!this.sessionAnalytics.has(sessionKey)) {
      this.sessionAnalytics.set(sessionKey, {
        startTime: Date.now(),
        behaviors: [],
        riskFactors: [],
      });
    }
    
    const session = this.sessionAnalytics.get(sessionKey);
    session.behaviors.push({ ...behavior, timestamp: Date.now() });
    
    return this.calculateSessionRisk(session);
  }

  calculateSessionRisk(session) {
    let riskScore = 0;
    const behaviors = session.behaviors;
    
    // Check for rapid successive actions
    if (behaviors.length > 50) {
      riskScore += 10;
      session.riskFactors.push('High activity volume');
    }
    
    // Check for suspicious timing patterns
    const timings = behaviors.map(b => b.timestamp);
    const intervals = [];
    for (let i = 1; i < timings.length; i++) {
      intervals.push(timings[i] - timings[i-1]);
    }
    
    // Very consistent timing might indicate automation
    if (intervals.length > 10) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      if (variance < 100) { // Very low variance
        riskScore += 15;
        session.riskFactors.push('Bot-like timing patterns');
      }
    }
    
    // Check for unusual behavior sequences
    const behaviorTypes = behaviors.map(b => b.type);
    const uniqueBehaviors = new Set(behaviorTypes);
    
    if (uniqueBehaviors.size < behaviorTypes.length / 10) {
      riskScore += 10;
      session.riskFactors.push('Repetitive behavior patterns');
    }
    
    return riskScore;
  }

  startCleanupInterval() {
    setInterval(() => {
      const now = Date.now();
      const oneHourAgo = now - IDS_CONFIG.timeWindows.long;
      const oneDayAgo = now - IDS_CONFIG.timeWindows.extended;
      
      // Clean up expired IP blocks
      for (const [ip, blockInfo] of this.blockedIps.entries()) {
        if (now > blockInfo.expiresAt) {
          this.blockedIps.delete(ip);
        }
      }
      
      // Clean up old request patterns
      for (const [ip, patterns] of this.requestPatterns.entries()) {
        const recentPatterns = patterns.filter(p => p.timestamp > oneHourAgo);
        if (recentPatterns.length === 0) {
          this.requestPatterns.delete(ip);
        } else {
          this.requestPatterns.set(ip, recentPatterns);
        }
      }
      
      // Decay threat scores over time
      for (const [ip, score] of this.ipThreatScores.entries()) {
        const newScore = Math.max(0, score - 5); // Reduce by 5 points per cleanup interval
        if (newScore === 0) {
          this.ipThreatScores.delete(ip);
        } else {
          this.ipThreatScores.set(ip, newScore);
        }
      }
      
      // Clean up old session analytics
      for (const [sessionKey, session] of this.sessionAnalytics.entries()) {
        if (session.startTime < oneDayAgo) {
          this.sessionAnalytics.delete(sessionKey);
        }
      }
      
    }, 5 * 60 * 1000); // Run cleanup every 5 minutes
  }
}

const threatTracker = new ThreatTracker();

/**
 * Analyze request for suspicious patterns
 */
function analyzeRequestSuspicion(req) {
  const suspiciousPatterns = [];
  let suspicionScore = 0;
  
  const url = req.originalUrl || req.url;
  const method = req.method;
  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';
  
  // SQL Injection patterns
  const sqlPatterns = [
    /union\s+select/i, /select\s+.*\s+from/i, /insert\s+into/i,
    /update\s+.*\s+set/i, /delete\s+from/i, /drop\s+table/i,
    /exec\s*\(/i, /script\s*>/i, /'.*or.*'/i, /--/
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(url) || pattern.test(JSON.stringify(req.body || {}))) {
      suspiciousPatterns.push('SQL injection attempt');
      suspicionScore += 20;
      break;
    }
  }
  
  // XSS patterns
  const xssPatterns = [
    /<script/i, /javascript:/i, /on\w+\s*=/i, /<iframe/i,
    /document\.cookie/i, /eval\s*\(/i, /alert\s*\(/i
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(url) || pattern.test(JSON.stringify(req.body || {}))) {
      suspiciousPatterns.push('XSS attempt');
      suspicionScore += 15;
      break;
    }
  }
  
  // Directory traversal
  if (/\.\.\/|\.\.\\|%2e%2e/i.test(url)) {
    suspiciousPatterns.push('Directory traversal attempt');
    suspicionScore += 15;
  }
  
  // Command injection
  const cmdPatterns = [
    /[;&|`]/, /\$\(/, /\${/, /system\s*\(/i, /exec\s*\(/i,
    /passthru\s*\(/i, /shell_exec\s*\(/i
  ];
  
  for (const pattern of cmdPatterns) {
    if (pattern.test(url) || pattern.test(JSON.stringify(req.body || {}))) {
      suspiciousPatterns.push('Command injection attempt');
      suspicionScore += 20;
      break;
    }
  }
  
  // Suspicious user agents
  const suspiciousAgents = [
    /sqlmap/i, /nikto/i, /nessus/i, /openvas/i, /nmap/i,
    /burp/i, /w3af/i, /acunetix/i, /netsparker/i, /curl/i,
    /wget/i, /python-requests/i, /go-http-client/i
  ];
  
  for (const pattern of suspiciousAgents) {
    if (pattern.test(userAgent)) {
      suspiciousPatterns.push('Suspicious user agent');
      suspicionScore += 10;
      break;
    }
  }
  
  // Unusual HTTP methods
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(method)) {
    suspiciousPatterns.push('Unusual HTTP method');
    suspicionScore += 5;
  }
  
  // Missing or suspicious referer
  if (method === 'POST' && !referer && !req.headers['x-requested-with']) {
    suspiciousPatterns.push('Missing referer on POST request');
    suspicionScore += 5;
  }
  
  // Multiple encoded characters
  const encodedCount = (url.match(/%[0-9a-f]{2}/gi) || []).length;
  if (encodedCount > 5) {
    suspiciousPatterns.push('Excessive URL encoding');
    suspicionScore += 10;
  }
  
  // Very long URLs
  if (url.length > 1000) {
    suspiciousPatterns.push('Abnormally long URL');
    suspicionScore += 5;
  }
  
  return { suspiciousPatterns, suspicionScore };
}

/**
 * Detect anomalous behavior patterns
 */
function detectAnomalies(ip, requestHistory) {
  const anomalies = [];
  let anomalyScore = 0;
  
  if (requestHistory.length === 0) return { anomalies, anomalyScore };
  
  // Calculate request rate
  const timespan = Math.max(Date.now() - requestHistory[0].timestamp, 60000); // At least 1 minute
  const requestRate = (requestHistory.length / timespan) * 60000; // Requests per minute
  
  if (requestRate > 60) { // More than 1 request per second
    anomalies.push('High request rate');
    anomalyScore += 15;
  }
  
  // Check for error rate
  const errorRequests = requestHistory.filter(r => r.statusCode >= 400);
  const errorRate = errorRequests.length / requestHistory.length;
  
  if (errorRate > IDS_CONFIG.anomalyDetection.errorRateThreshold) {
    anomalies.push('High error rate');
    anomalyScore += 10;
  }
  
  // Check for scanning behavior (accessing many different endpoints)
  const uniqueEndpoints = new Set(requestHistory.map(r => r.endpoint));
  if (uniqueEndpoints.size > 20 && requestHistory.length > 30) {
    anomalies.push('Scanning behavior detected');
    anomalyScore += 20;
  }
  
  // Check for rapid authentication attempts
  const authAttempts = requestHistory.filter(r => r.endpoint.includes('/auth/'));
  if (authAttempts.length > 10) {
    anomalies.push('Multiple authentication attempts');
    anomalyScore += 15;
  }
  
  return { anomalies, anomalyScore };
}

/**
 * Main intrusion detection middleware
 */
export function intrusionDetectionMiddleware() {
  return async (req, res, next) => {
    try {
      const ip = req.ip;
      const userId = req.user?.id;
      const sessionId = req.sessionID;
      
      // Check if IP is whitelisted
      if (IDS_CONFIG.whitelist.ips.includes(ip)) {
        return next();
      }
      
      // Check if IP is blocked
      const blockInfo = threatTracker.isIPBlocked(ip);
      if (blockInfo) {
        await logSecurityEvent('BLOCKED_IP_ACCESS_ATTEMPT', {
          ipAddress: ip,
          userAgent: req.get('User-Agent'),
          resource: req.originalUrl,
          metadata: { blockReason: blockInfo.reason, blockedAt: blockInfo.blockedAt }
        });
        
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          errorCode: 'IP_BLOCKED',
          retryAfter: Math.ceil((blockInfo.expiresAt - Date.now()) / 1000)
        });
      }
      
      // Analyze request for suspicious patterns
      const { suspiciousPatterns, suspicionScore } = analyzeRequestSuspicion(req);
      
      // Record request pattern
      const requestPattern = {
        endpoint: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        suspicionScore,
        suspiciousPatterns
      };
      
      const patternCount = threatTracker.recordRequestPattern(ip, requestPattern);
      
      // Get recent request history for anomaly detection
      const requestHistory = threatTracker.requestPatterns.get(ip) || [];
      const { anomalies, anomalyScore } = detectAnomalies(ip, requestHistory);
      
      // Calculate total threat score
      let totalThreatScore = suspicionScore + anomalyScore;
      
      // Analyze session behavior if available
      if (sessionId || userId) {
        const sessionRisk = threatTracker.analyzeSessionBehavior(sessionId, userId, {
          type: req.method,
          endpoint: req.originalUrl,
          suspicionScore
        });
        totalThreatScore += sessionRisk;
      }
      
      // Update threat scores
      if (totalThreatScore > 0) {
        const ipThreatScore = threatTracker.updateThreatScore(ip, 'ip', totalThreatScore, 
          `Suspicious patterns: ${suspiciousPatterns.join(', ')}, Anomalies: ${anomalies.join(', ')}`);
        
        if (userId) {
          threatTracker.updateThreatScore(userId, 'user', totalThreatScore / 2, 
            'Associated with suspicious IP activity');
        }
        
        // Determine alert level and response
        let alertLevel = 'info';
        if (ipThreatScore >= IDS_CONFIG.thresholds.critical) {
          alertLevel = 'critical';
        } else if (ipThreatScore >= IDS_CONFIG.thresholds.high) {
          alertLevel = 'high';
        } else if (ipThreatScore >= IDS_CONFIG.thresholds.medium) {
          alertLevel = 'medium';
        } else if (ipThreatScore >= IDS_CONFIG.thresholds.low) {
          alertLevel = 'low';
        }
        
        // Log security event
        await logSecurityEvent('INTRUSION_ATTEMPT_DETECTED', {
          userId,
          ipAddress: ip,
          userAgent: req.get('User-Agent'),
          resource: req.originalUrl,
          action: req.method,
          metadata: {
            alertLevel,
            threatScore: ipThreatScore,
            suspicionScore,
            anomalyScore,
            suspiciousPatterns,
            anomalies,
            patternCount
          }
        });
        
        // Automated responses
        if (IDS_CONFIG.responses.enableAutoBlock && ipThreatScore >= IDS_CONFIG.thresholds.high) {
          threatTracker.blockIP(ip, IDS_CONFIG.responses.autoBlockDuration, 
            `High threat score: ${ipThreatScore}`);
          
          return res.status(403).json({
            success: false,
            error: 'Suspicious activity detected',
            errorCode: 'SUSPICIOUS_ACTIVITY'
          });
        }
        
        // Add threat score to request for other middleware
        req.threatScore = ipThreatScore;
        req.intrusionFlags = {
          suspiciousPatterns,
          anomalies,
          alertLevel
        };
      }
      
      next();
      
    } catch (error) {
      logger.error('Intrusion detection error', { error: error.message, ip: req.ip });
      next(); // Continue processing on error
    }
  };
}

/**
 * Get current threat intelligence
 */
export function getThreatIntelligence() {
  return {
    blockedIPs: Array.from(threatTracker.blockedIps.entries()).map(([ip, info]) => ({
      ip,
      ...info,
      remainingTime: Math.max(0, info.expiresAt - Date.now())
    })),
    topThreats: {
      ips: Array.from(threatTracker.ipThreatScores.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([ip, score]) => ({ ip, score })),
      users: Array.from(threatTracker.userThreatScores.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([userId, score]) => ({ userId, score }))
    },
    activePatterns: threatTracker.requestPatterns.size,
    activeSessions: threatTracker.sessionAnalytics.size
  };
}

/**
 * Manually block/unblock IP addresses
 */
export function manualIPControl(action, ip, duration = null, reason = 'Manual intervention') {
  if (action === 'block') {
    const blockDuration = duration || IDS_CONFIG.responses.autoBlockDuration;
    threatTracker.blockIP(ip, blockDuration, reason);
    
    logSecurityEvent('IP_MANUALLY_BLOCKED', {
      ipAddress: ip,
      resource: 'intrusion_detection',
      metadata: { reason, duration: blockDuration }
    });
    
    return { success: true, message: `IP ${ip} blocked for ${blockDuration}ms` };
  } else if (action === 'unblock') {
    const wasBlocked = threatTracker.blockedIps.has(ip);
    threatTracker.blockedIps.delete(ip);
    
    if (wasBlocked) {
      logSecurityEvent('IP_MANUALLY_UNBLOCKED', {
        ipAddress: ip,
        resource: 'intrusion_detection',
        metadata: { reason }
      });
    }
    
    return { success: true, message: `IP ${ip} ${wasBlocked ? 'unblocked' : 'was not blocked'}` };
  }
  
  return { success: false, message: 'Invalid action. Use "block" or "unblock"' };
}

/**
 * Reset threat score for IP or user
 */
export function resetThreatScore(identifier, type) {
  const map = type === 'ip' ? threatTracker.ipThreatScores : threatTracker.userThreatScores;
  const hadScore = map.has(identifier);
  map.delete(identifier);
  
  logSecurityEvent('THREAT_SCORE_RESET', {
    resource: 'intrusion_detection',
    metadata: { identifier, type, hadScore }
  });
  
  return { success: true, message: `Threat score reset for ${type}: ${identifier}` };
}

export default {
  intrusionDetectionMiddleware,
  getThreatIntelligence,
  manualIPControl,
  resetThreatScore,
  IDS_CONFIG,
};