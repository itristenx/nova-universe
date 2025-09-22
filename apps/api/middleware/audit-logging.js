// Comprehensive Audit Logging System for Nova Universe API
// Implements detailed audit trails for compliance and security monitoring

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { logger } from '../logger.js';

/**
 * Audit logging configuration
 */
const AUDIT_CONFIG = {
  // Log file settings
  logDirectory: process.env.AUDIT_LOG_DIR || '/tmp/audit-logs',
  logFilePrefix: 'audit',
  maxLogFileSize: 100 * 1024 * 1024, // 100MB
  maxLogFiles: 50, // Keep 50 log files max
  
  // Log levels
  levels: {
    INFO: 'INFO',
    WARN: 'WARN', 
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL',
  },
  
  // Event categories
  categories: {
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    DATA_ACCESS: 'data_access',
    DATA_MODIFICATION: 'data_modification',
    SYSTEM_ACCESS: 'system_access',
    CONFIGURATION: 'configuration',
    SECURITY: 'security',
    COMPLIANCE: 'compliance',
  },
  
  // Sensitive data patterns to redact
  sensitivePatterns: [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /auth/i,
    /credential/i,
    /ssn/i,
    /social.security/i,
    /credit.card/i,
    /bank.account/i,
  ],
  
  // PII patterns to redact
  piiPatterns: [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN format
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card format
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email format
    /\b\d{3}[- ]?\d{3}[- ]?\d{4}\b/, // Phone number format
  ],
  
  // Retention settings
  retention: {
    days: 90, // Keep audit logs for 90 days
    compressAfterDays: 7, // Compress logs older than 7 days
  },
};

/**
 * Audit log entry structure
 */
class AuditLogEntry {
  constructor({
    eventType,
    category,
    level = AUDIT_CONFIG.levels.INFO,
    userId = null,
    sessionId = null,
    ipAddress = null,
    userAgent = null,
    resource = null,
    action = null,
    outcome = 'SUCCESS',
    details = {},
    metadata = {},
    timestamp = new Date(),
  }) {
    this.id = crypto.randomUUID();
    this.timestamp = timestamp.toISOString();
    this.eventType = eventType;
    this.category = category;
    this.level = level;
    this.userId = userId;
    this.sessionId = sessionId;
    this.ipAddress = ipAddress;
    this.userAgent = userAgent;
    this.resource = resource;
    this.action = action;
    this.outcome = outcome;
    this.details = this.sanitizeData(details);
    this.metadata = this.sanitizeData(metadata);
    this.checksum = this.generateChecksum();
  }

  sanitizeData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = JSON.parse(JSON.stringify(data));
    this.redactSensitiveData(sanitized);
    return sanitized;
  }

  redactSensitiveData(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(item => this.redactSensitiveData(item));
      return;
    }

    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        // Check if key matches sensitive patterns
        const keyIsSensitive = AUDIT_CONFIG.sensitivePatterns.some(pattern => 
          pattern.test(key)
        );

        if (keyIsSensitive) {
          obj[key] = '[REDACTED]';
        } else if (typeof value === 'string') {
          // Check if value matches PII patterns
          let redactedValue = value;
          AUDIT_CONFIG.piiPatterns.forEach(pattern => {
            redactedValue = redactedValue.replace(pattern, '[REDACTED]');
          });
          obj[key] = redactedValue;
        } else if (typeof value === 'object') {
          this.redactSensitiveData(value);
        }
      }
    }
  }

  generateChecksum() {
    const dataToHash = {
      timestamp: this.timestamp,
      eventType: this.eventType,
      userId: this.userId,
      resource: this.resource,
      action: this.action,
      outcome: this.outcome,
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(dataToHash))
      .digest('hex')
      .substring(0, 16);
  }

  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      eventType: this.eventType,
      category: this.category,
      level: this.level,
      userId: this.userId,
      sessionId: this.sessionId,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      resource: this.resource,
      action: this.action,
      outcome: this.outcome,
      details: this.details,
      metadata: this.metadata,
      checksum: this.checksum,
    };
  }
}

/**
 * Audit logger class
 */
class AuditLogger {
  constructor() {
    this.currentLogFile = null;
    this.writeBuffer = [];
    this.flushInterval = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Ensure log directory exists
      await fs.mkdir(AUDIT_CONFIG.logDirectory, { recursive: true });
      
      // Set up current log file
      await this.rotateLogFileIfNeeded();
      
      // Start flush interval
      this.flushInterval = setInterval(() => {
        this.flushBuffer();
      }, 5000); // Flush every 5 seconds
      
      this.initialized = true;
      logger.info('Audit logger initialized', { logDirectory: AUDIT_CONFIG.logDirectory });
      
    } catch (error) {
      logger.error('Failed to initialize audit logger', { error: error.message });
      throw error;
    }
  }

  async rotateLogFileIfNeeded() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const logFileName = `${AUDIT_CONFIG.logFilePrefix}-${dateStr}.log`;
    const logFilePath = path.join(AUDIT_CONFIG.logDirectory, logFileName);

    // Check if current log file needs rotation
    if (this.currentLogFile !== logFilePath) {
      this.currentLogFile = logFilePath;
    }

    try {
      const stats = await fs.stat(logFilePath);
      if (stats.size > AUDIT_CONFIG.maxLogFileSize) {
        // Rotate the file
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const rotatedName = `${AUDIT_CONFIG.logFilePrefix}-${dateStr}-${timestamp}.log`;
        const rotatedPath = path.join(AUDIT_CONFIG.logDirectory, rotatedName);
        
        await fs.rename(logFilePath, rotatedPath);
        this.currentLogFile = logFilePath;
        
        logger.info('Audit log file rotated', { 
          originalFile: logFileName,
          rotatedFile: rotatedName 
        });
      }
    } catch (error) {
      // File doesn't exist yet, which is fine
      if (error.code !== 'ENOENT') {
        logger.warn('Error checking log file stats', { error: error.message });
      }
    }
  }

  async log(auditEntry) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Add to buffer
      this.writeBuffer.push(auditEntry);
      
      // Immediate flush for critical events
      if (auditEntry.level === AUDIT_CONFIG.levels.CRITICAL) {
        await this.flushBuffer();
      }
      
      // Also log to database if available
      if (global.db) {
        await this.logToDatabase(auditEntry);
      }
      
    } catch (error) {
      logger.error('Failed to log audit entry', { 
        error: error.message,
        auditEntryId: auditEntry.id 
      });
    }
  }

  async flushBuffer() {
    if (this.writeBuffer.length === 0) {
      return;
    }

    try {
      await this.rotateLogFileIfNeeded();
      
      const logLines = this.writeBuffer.map(entry => 
        JSON.stringify(entry.toJSON())
      ).join('\n') + '\n';
      
      await fs.appendFile(this.currentLogFile, logLines, 'utf8');
      
      // Clear buffer
      this.writeBuffer = [];
      
    } catch (error) {
      logger.error('Failed to flush audit log buffer', { error: error.message });
    }
  }

  async logToDatabase(auditEntry) {
    try {
      const query = `
        INSERT INTO audit_logs (
          id, timestamp, event_type, category, level, user_id, session_id,
          ip_address, user_agent, resource, action, outcome, details, metadata, checksum
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        auditEntry.id,
        auditEntry.timestamp,
        auditEntry.eventType,
        auditEntry.category,
        auditEntry.level,
        auditEntry.userId,
        auditEntry.sessionId,
        auditEntry.ipAddress,
        auditEntry.userAgent,
        auditEntry.resource,
        auditEntry.action,
        auditEntry.outcome,
        JSON.stringify(auditEntry.details),
        JSON.stringify(auditEntry.metadata),
        auditEntry.checksum,
      ];
      
      await new Promise((resolve, reject) => {
        global.db.run(query, values, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
      
    } catch (error) {
      // Don't throw on database errors to avoid blocking audit logging
      logger.warn('Failed to log audit entry to database', { 
        error: error.message,
        auditEntryId: auditEntry.id 
      });
    }
  }

  async cleanup() {
    try {
      // Get all log files
      const files = await fs.readdir(AUDIT_CONFIG.logDirectory);
      const logFiles = files.filter(file => file.startsWith(AUDIT_CONFIG.logFilePrefix));
      
      // Sort by creation time (newest first)
      const fileStats = await Promise.all(
        logFiles.map(async file => {
          const filePath = path.join(AUDIT_CONFIG.logDirectory, file);
          const stats = await fs.stat(filePath);
          return { file, path: filePath, mtime: stats.mtime };
        })
      );
      
      fileStats.sort((a, b) => b.mtime - a.mtime);
      
      // Remove excess files
      if (fileStats.length > AUDIT_CONFIG.maxLogFiles) {
        const filesToDelete = fileStats.slice(AUDIT_CONFIG.maxLogFiles);
        for (const fileInfo of filesToDelete) {
          await fs.unlink(fileInfo.path);
          logger.info('Deleted old audit log file', { file: fileInfo.file });
        }
      }
      
      // Remove files older than retention period
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - AUDIT_CONFIG.retention.days);
      
      for (const fileInfo of fileStats) {
        if (fileInfo.mtime < retentionDate) {
          await fs.unlink(fileInfo.path);
          logger.info('Deleted expired audit log file', { 
            file: fileInfo.file,
            age: Math.floor((Date.now() - fileInfo.mtime) / (24 * 60 * 60 * 1000)) + ' days'
          });
        }
      }
      
    } catch (error) {
      logger.error('Failed to cleanup audit logs', { error: error.message });
    }
  }

  async shutdown() {
    try {
      // Flush remaining buffer
      await this.flushBuffer();
      
      // Clear flush interval
      if (this.flushInterval) {
        clearInterval(this.flushInterval);
      }
      
      logger.info('Audit logger shutdown complete');
      
    } catch (error) {
      logger.error('Error during audit logger shutdown', { error: error.message });
    }
  }
}

// Singleton audit logger instance
const auditLogger = new AuditLogger();

/**
 * Main audit logging function
 */
export async function auditLog(params) {
  const auditEntry = new AuditLogEntry(params);
  await auditLogger.log(auditEntry);
  return auditEntry.id;
}

/**
 * Convenience functions for different audit categories
 */
export async function auditAuthentication(params) {
  return auditLog({
    ...params,
    category: AUDIT_CONFIG.categories.AUTHENTICATION,
  });
}

export async function auditAuthorization(params) {
  return auditLog({
    ...params,
    category: AUDIT_CONFIG.categories.AUTHORIZATION,
  });
}

export async function auditDataAccess(params) {
  return auditLog({
    ...params,
    category: AUDIT_CONFIG.categories.DATA_ACCESS,
  });
}

export async function auditDataModification(params) {
  return auditLog({
    ...params,
    category: AUDIT_CONFIG.categories.DATA_MODIFICATION,
  });
}

export async function auditSystemAccess(params) {
  return auditLog({
    ...params,
    category: AUDIT_CONFIG.categories.SYSTEM_ACCESS,
  });
}

export async function auditConfiguration(params) {
  return auditLog({
    ...params,
    category: AUDIT_CONFIG.categories.CONFIGURATION,
  });
}

export async function auditSecurity(params) {
  return auditLog({
    ...params,
    category: AUDIT_CONFIG.categories.SECURITY,
  });
}

export async function auditCompliance(params) {
  return auditLog({
    ...params,
    category: AUDIT_CONFIG.categories.COMPLIANCE,
  });
}

/**
 * Middleware for automatic request auditing
 */
export function auditMiddleware(options = {}) {
  const {
    excludePaths = ['/health', '/metrics'],
    includeRequestBody = false,
    includeResponseBody = false,
  } = options;

  return async (req, res, next) => {
    // Skip excluded paths
    if (excludePaths.some(path => req.originalUrl.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();
    
    // Capture original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    let responseBody = null;
    
    // Override response methods to capture response data
    res.send = function(body) {
      if (includeResponseBody && typeof body === 'string') {
        responseBody = body.substring(0, 1000); // Limit size
      }
      return originalSend.call(this, body);
    };
    
    res.json = function(obj) {
      if (includeResponseBody) {
        responseBody = JSON.stringify(obj).substring(0, 1000); // Limit size
      }
      return originalJson.call(this, obj);
    };
    
    // Handle response completion
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const outcome = res.statusCode < 400 ? 'SUCCESS' : 'FAILURE';
        
        const auditParams = {
          eventType: 'HTTP_REQUEST',
          category: AUDIT_CONFIG.categories.SYSTEM_ACCESS,
          level: res.statusCode >= 500 ? AUDIT_CONFIG.levels.ERROR : AUDIT_CONFIG.levels.INFO,
          userId: req.user?.id,
          sessionId: req.sessionID,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          resource: req.originalUrl,
          action: req.method,
          outcome,
          details: {
            statusCode: res.statusCode,
            duration,
            contentLength: res.get('Content-Length'),
            ...(includeRequestBody && req.body && { requestBody: JSON.stringify(req.body).substring(0, 1000) }),
            ...(responseBody && { responseBody }),
          },
          metadata: {
            threatScore: req.threatScore,
            intrusionFlags: req.intrusionFlags,
            headers: {
              contentType: req.get('Content-Type'),
              accept: req.get('Accept'),
              referer: req.get('Referer'),
            },
          },
        };
        
        if (outcome === 'FAILURE') {
          auditParams.level = res.statusCode >= 500 ? 
            AUDIT_CONFIG.levels.ERROR : 
            AUDIT_CONFIG.levels.WARN;
        }
        
        await auditLog(auditParams);
        
      } catch (error) {
        logger.error('Failed to audit HTTP request', { 
          error: error.message,
          url: req.originalUrl,
          method: req.method 
        });
      }
    });
    
    next();
  };
}

/**
 * Initialize audit logging database schema
 */
export async function initializeAuditSchema(db) {
  const schema = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      event_type TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL,
      user_id INTEGER,
      session_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      resource TEXT,
      action TEXT,
      outcome TEXT NOT NULL,
      details TEXT,
      metadata TEXT,
      checksum TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_outcome ON audit_logs(outcome);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);
  `;
  
  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Query audit logs
 */
export async function queryAuditLogs(db, filters = {}, options = {}) {
  try {
    const {
      startDate,
      endDate,
      userId,
      category,
      eventType,
      outcome,
      ipAddress,
      level,
    } = filters;
    
    const {
      limit = 100,
      offset = 0,
      orderBy = 'timestamp',
      orderDirection = 'DESC',
    } = options;
    
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    
    if (startDate) {
      query += ' AND timestamp >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND timestamp <= ?';
      params.push(endDate);
    }
    
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (eventType) {
      query += ' AND event_type = ?';
      params.push(eventType);
    }
    
    if (outcome) {
      query += ' AND outcome = ?';
      params.push(outcome);
    }
    
    if (ipAddress) {
      query += ' AND ip_address = ?';
      params.push(ipAddress);
    }
    
    if (level) {
      query += ' AND level = ?';
      params.push(level);
    }
    
    query += ` ORDER BY ${orderBy} ${orderDirection} LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const rows = await new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    return rows.map(row => ({
      ...row,
      details: JSON.parse(row.details || '{}'),
      metadata: JSON.parse(row.metadata || '{}'),
    }));
    
  } catch (error) {
    logger.error('Failed to query audit logs', { error: error.message, filters });
    throw error;
  }
}

/**
 * Cleanup and shutdown
 */
export async function shutdownAuditLogger() {
  await auditLogger.shutdown();
}

export async function cleanupAuditLogs() {
  await auditLogger.cleanup();
}

// Schedule regular cleanup
setInterval(cleanupAuditLogs, 24 * 60 * 60 * 1000); // Daily cleanup

export default {
  auditLog,
  auditAuthentication,
  auditAuthorization,
  auditDataAccess,
  auditDataModification,
  auditSystemAccess,
  auditConfiguration,
  auditSecurity,
  auditCompliance,
  auditMiddleware,
  initializeAuditSchema,
  queryAuditLogs,
  shutdownAuditLogger,
  cleanupAuditLogs,
  AUDIT_CONFIG,
};