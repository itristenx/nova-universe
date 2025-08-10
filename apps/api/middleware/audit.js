import db from '../db.js';
import { logger } from '../logger.js';

/**
 * Middleware factory to create an audit trail entry for the handled route.
 * Persists via unified audit logger and never blocks the request on failure.
 */
export function audit(actionKey) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || 'anonymous';
      const details = {
        path: req.originalUrl,
        method: req.method,
        params: req.params,
        query: req.query,
        // Avoid storing secrets; shallow copy body with redactions
        body: redactBody(req.body),
        ip_address: req.ip,
        user_agent: req.get('User-Agent') || null,
      };
      // Fire and forget
      db.createAuditLog(actionKey, userId, details).catch((err) => {
        logger.warn('Audit log failed', { actionKey, error: err?.message });
      });
    } catch (err) {
      logger.warn('Audit middleware error', { actionKey, error: err?.message });
    } finally {
      next();
    }
  };
}

<<<<<<< Current (Your changes)
module.exports = { logAudit };
=======
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
>>>>>>> Incoming (Background Agent changes)
