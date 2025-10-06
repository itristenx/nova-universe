import db from '../db.js';
import { logger } from '../logger.js';
import auditService, { AuditActions, SecuritySeverity } from '../services/audit.js';

/**
 * Middleware factory to create an audit trail entry for the handled route.
 * Persists via unified audit logger and never blocks the request on failure.
 */
export function audit(actionKey) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.connection?.remoteAddress || null;
      const userAgent = req.get('User-Agent') || null;
      const sessionId = req.session?.id || req.sessionID || null;
      const tenantId = req.user?.tenantId || req.tenant?.id || null;

      const details = {
        path: req.originalUrl,
        method: req.method,
        params: req.params,
        query: req.query,
        body: redactBody(req.body),
      };

      // Use new comprehensive audit service
      auditService.log({
        userId,
        action: actionKey,
        ipAddress,
        userAgent,
        requestMethod: req.method,
        requestPath: req.path,
        sessionId,
        tenantId,
        metadata: details,
      }).catch((err) => {
        logger.warn('Audit log failed', { actionKey, error: err?.message });
      });

      // Fallback to legacy db.createAuditLog for compatibility
      if (db.createAuditLog) {
        db.createAuditLog(actionKey, userId || 'anonymous', details).catch((err) => {
          logger.warn('Legacy audit log failed', { actionKey, error: err?.message });
        });
      }
    } catch (err) {
      logger.warn('Audit middleware error', { actionKey, error: err?.message });
    } finally {
      next();
    }
  };
}

/**
 * Helper to programmatically create audit entries.
 */
export async function logAudit(actionKey, user, details = {}) {
  try {
    const userId = user?.id || 'anonymous';
    await db.createAuditLog(actionKey, userId, details);
  } catch (err) {
    logger.warn('logAudit failed', { actionKey, error: err?.message });
  }
}

function redactBody(body) {
  if (!body || typeof body !== 'object') return body;
  try {
    const clone = JSON.parse(JSON.stringify(body));
    const redactKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    for (const key of Object.keys(clone)) {
      if (redactKeys.includes(key.toLowerCase())) {
        clone[key] = '[REDACTED]';
      }
    }
    return clone;
  } catch {
    return undefined;
  }
}
