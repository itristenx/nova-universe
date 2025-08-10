import db from '../db.js';
import { logger } from '../logger.js';

// Sanitize payloads to avoid logging secrets
function sanitize(obj) {
  try {
    const clone = JSON.parse(JSON.stringify(obj || {}));
    const redactKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'auth'];
    const redact = (o) => {
      if (Array.isArray(o)) return o.map(redact);
      if (o && typeof o === 'object') {
        for (const k of Object.keys(o)) {
          if (redactKeys.includes(k.toLowerCase())) {
            o[k] = '[REDACTED]';
          } else if (typeof o[k] === 'object') {
            o[k] = redact(o[k]);
          }
        }
      }
      return o;
    };
    return redact(clone);
  } catch {
    return {};
  }
}

// Generic audit logger (fallback)
export async function logAudit(event, user, details = {}) {
  try {
    const entry = {
      action: event,
      user_id: user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      details: sanitize(details)
    };
    // Prefer unified DB audit collection/table if available
    if (typeof db.createAuditLog === 'function') {
      await db.createAuditLog(event, entry.user_id, entry.details);
    } else {
      // Fallback to Postgres generic table if present
      await db.query(
        'INSERT INTO audit_logs (action, user_id, metadata, created_at) VALUES ($1, $2, $3, NOW())',
        [entry.action, entry.user_id, JSON.stringify(entry.details)]
      ).catch(() => {});
    }
  } catch (error) {
    logger.warn('Audit fallback logging failed', { error: error.message });
  }
}

// Express middleware factory to audit specific events and persist to domain tables
export function audit(eventName) {
  return async (req, res, next) => {
    const startedAt = Date.now();
    const requestMeta = {
      method: req.method,
      path: req.originalUrl || req.url,
      params: sanitize(req.params),
      query: sanitize(req.query),
      body: sanitize(req.body),
      ip: req.ip,
      userAgent: req.get?.('User-Agent')
    };

    // After response finishes, persist audit
    res.on('finish', async () => {
      const durationMs = Date.now() - startedAt;
      const userId = req.user?.id || 'anonymous';
      const metadata = {
        ...requestMeta,
        statusCode: res.statusCode,
        durationMs,
        responseMeta: sanitize(res.locals?.audit || {})
      };

      try {
        // Route to the appropriate audit table based on event name
        if (eventName.startsWith('goalert.') || eventName.startsWith('alert.')) {
          // Alerts / GoAlert operations
          await db.query(
            `INSERT INTO alert_audit_log (user_id, operation, alert_id, schedule_id, service_id, source_ticket_id, delivery_status, metadata, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
              userId,
              eventName,
              metadata.responseMeta.alertId || null,
              metadata.responseMeta.scheduleId || null,
              metadata.responseMeta.serviceId || null,
              metadata.responseMeta.ticketId || null,
              metadata.responseMeta.deliveryStatus || 'pending',
              JSON.stringify(metadata)
            ]
          ).catch(() => {});
        } else if (
          eventName.startsWith('sentinel.') ||
          eventName.startsWith('monitoring.') ||
          eventName.includes('status-pages') ||
          eventName.includes('maintenance') ||
          eventName.includes('monitors')
        ) {
          // Monitoring / Sentinel operations
          await db.query(
            `INSERT INTO monitoring_audit_log (user_id, operation, monitor_id, monitor_name, monitor_type, incident_id, metadata, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [
              userId,
              eventName,
              metadata.responseMeta.monitorId || req.params?.id || null,
              metadata.responseMeta.monitorName || null,
              metadata.responseMeta.monitorType || null,
              metadata.responseMeta.incidentId || null,
              JSON.stringify(metadata)
            ]
          ).catch(() => {});
        } else {
          // Fallback generic audit
          await logAudit(eventName, req.user, metadata);
        }
      } catch (error) {
        logger.warn('Audit middleware failed to persist event', { eventName, error: error.message });
      }
    });

    next();
  };
}
