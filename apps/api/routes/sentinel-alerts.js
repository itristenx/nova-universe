// nova-api/routes/sentinel-alerts.js
// Nova Sentinel + Alert System Integration
// Seamless monitoring and alerting with Cosmo AI intelligence

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { checkPermissions } from '../middleware/rbac.js';
import { audit } from '../middleware/audit.js';
import { createRateLimit } from '../middleware/rateLimiter.js';
import { analyzeAlertSituation } from '../utils/cosmo.js';

const router = express.Router();

/**
 * @swagger
 * /api/v2/sentinel/monitor-incident:
 *   post:
 *     tags: [Sentinel-Alerts Integration]
 *     summary: Create incident from monitor failure with intelligent alerting
 *     description: Process monitor down events with Cosmo AI analysis and alert creation
 */
router.post('/monitor-incident',
  authenticateJWT,
  checkPermissions(['monitoring:incident:create']),
  createRateLimit(60 * 1000, 20), // 20 incidents per minute
  [
    body('monitorId').isString().withMessage('Monitor ID required'),
    body('monitorName').isString().withMessage('Monitor name required'),
    body('status').isIn(['down', 'timeout', 'ssl_error', 'dns_error']).withMessage('Valid status required'),
    body('errorMessage').optional().isString(),
    body('responseTime').optional().isNumeric(),
    body('statusCode').optional().isNumeric(),
    body('important').optional().isBoolean()
  ],
  audit('sentinel.incident.create'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        monitorId,
        monitorName,
        status,
        errorMessage,
        responseTime,
        statusCode,
        important = false
      } = req.body;

      // Get monitor configuration
      const monitor = await db.get(`
        SELECT * FROM monitoring_monitors WHERE kuma_id = ? OR id = ?
      `, [monitorId, monitorId]);

      if (!monitor) {
        return res.status(404).json({
          success: false,
          error: 'Monitor not found'
        });
      }

      // Check if incident already exists
      const existingIncident = await db.get(`
        SELECT * FROM monitoring_incidents 
        WHERE monitor_id = ? AND status IN ('active', 'investigating', 'acknowledged')
        ORDER BY created_at DESC LIMIT 1
      `, [monitor.kuma_id]);

      if (existingIncident) {
        return res.json({
          success: true,
          action: 'updated_existing',
          incident: existingIncident,
          message: 'Incident already exists for this monitor'
        });
      }

      // Analyze with Cosmo AI
      const aiAnalysis = await analyzeAlertSituation({
        monitorId: monitor.kuma_id,
        monitorName,
        monitorType: monitor.type,
        monitorUrl: monitor.url,
        status,
        errorMessage,
        responseTime,
        statusCode,
        important,
        serviceCategory: 'infrastructure',
        keywords: ['monitoring', 'outage', status, monitor.type],
        tenantId: monitor.tenant_id
      }, `Monitor "${monitorName}" is ${status}. Error: ${errorMessage || 'Unknown'}. Should this create an alert and ticket?`, 'system');

      let ticketId = null;
      let alertId = null;
      let incidentSeverity = 'medium';

      // Determine severity based on AI analysis and monitor config
      if (aiAnalysis.confidence > 0.8 || important || monitor.public_status) {
        incidentSeverity = 'high';
      }
      if (aiAnalysis.action === 'create_alert' && aiAnalysis.confidence > 0.9) {
        incidentSeverity = 'critical';
      }

      // Create incident record
      const incidentResult = await db.run(`
        INSERT INTO monitoring_incidents 
        (monitor_id, monitor_name, status, severity, summary, description, tenant_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        monitor.kuma_id,
        monitorName,
        'active',
        incidentSeverity,
        `Service Down: ${monitorName}`,
        `Monitor "${monitorName}" is experiencing issues.\n\nStatus: ${status}\nError: ${errorMessage || 'Unknown error'}\nResponse Time: ${responseTime || 'N/A'}ms\nStatus Code: ${statusCode || 'N/A'}\n\nCosmo Analysis: ${aiAnalysis.reasoning}`,
        monitor.tenant_id,
        new Date().toISOString()
      ]);

      const incidentId = incidentResult.lastID;

      // Create ticket if AI recommends it or if it's a critical incident
      if (aiAnalysis.action === 'create_alert' || aiAnalysis.confidence > 0.7 || important) {
        try {
          const ticketResponse = await fetch('/api/v2/tickets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SYSTEM_API_TOKEN || req.headers.authorization}`
            },
            body: JSON.stringify({
              title: `🔴 Monitoring Alert: ${monitorName} Down`,
              description: `**Service Outage Detected**\n\n**Monitor:** ${monitorName}\n**Type:** ${monitor.type}\n**URL:** ${monitor.url}\n**Status:** ${status}\n**Error:** ${errorMessage || 'Unknown error'}\n\n**Technical Details:**\n- Response Time: ${responseTime || 'N/A'}ms\n- Status Code: ${statusCode || 'N/A'}\n- Monitor ID: ${monitor.kuma_id}\n\n**AI Analysis:**\n${aiAnalysis.reasoning}\n\n**Next Steps:**\n${aiAnalysis.suggestions?.join('\n') || '- Investigate service health\n- Check server logs\n- Verify network connectivity'}`,
              category: 'infrastructure',
              priority: incidentSeverity,
              source: 'monitoring',
              requesterName: 'Nova Sentinel',
              requesterEmail: 'sentinel@nova.local',
              metadata: {
                monitorId: monitor.kuma_id,
                monitorName,
                monitorType: monitor.type,
                incidentId,
                automated: true,
                aiAnalysis: {
                  action: aiAnalysis.action,
                  confidence: aiAnalysis.confidence,
                  reasoning: aiAnalysis.reasoning
                }
              }
            })
          });

          if (ticketResponse.ok) {
            const ticket = await ticketResponse.json();
            ticketId = ticket.id;

            // Update incident with ticket ID
            await db.run(`
              UPDATE monitoring_incidents 
              SET ticket_id = ? 
              WHERE id = ?
            `, [ticketId, incidentId]);
          }
        } catch (ticketError) {
          logger.error('Failed to create ticket for incident:', ticketError);
        }
      }

      // Create alert if AI recommends it and alerts are enabled
      if ((aiAnalysis.action === 'create_alert' || aiAnalysis.confidence > 0.8) && monitor.alerts_enabled) {
        try {
          const alertResponse = await fetch('/api/v2/alerts/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SYSTEM_API_TOKEN || req.headers.authorization}`
            },
            body: JSON.stringify({
              summary: `🔴 ${monitorName} - Service Down`,
              description: `**MONITORING ALERT**\n\nService: ${monitorName}\nStatus: ${status}\nError: ${errorMessage || 'Service appears to be down'}\n\nThis alert was automatically created by Nova Sentinel monitoring.\n\nCosmo AI Analysis (${Math.round(aiAnalysis.confidence * 100)}% confidence):\n${aiAnalysis.reasoning}`,
              source: 'monitoring',
              serviceId: determineAlertService(monitor, incidentSeverity),
              priority: incidentSeverity,
              ticketId: ticketId,
              metadata: {
                monitorId: monitor.kuma_id,
                monitorName,
                monitorType: monitor.type,
                incidentId,
                status,
                errorMessage,
                responseTime,
                statusCode,
                cosmoAnalysis: aiAnalysis,
                automated: true
              }
            })
          });

          if (alertResponse.ok) {
            const alert = await alertResponse.json();
            alertId = alert.alert.id;

            // Update incident with alert ID
            await db.run(`
              UPDATE monitoring_incidents 
              SET alert_id = ? 
              WHERE id = ?
            `, [alertId, incidentId]);
          }
        } catch (alertError) {
          logger.error('Failed to create alert for incident:', alertError);
        }
      }

      // Send notifications if configured
      await sendIncidentNotifications(monitor, {
        incidentId,
        ticketId,
        alertId,
        severity: incidentSeverity,
        monitorName,
        status,
        errorMessage
      });

      // Log the incident creation
      logger.info('Monitoring incident created:', {
        incidentId,
        monitorId: monitor.kuma_id,
        monitorName,
        severity: incidentSeverity,
        ticketId,
        alertId,
        aiAction: aiAnalysis.action,
        aiConfidence: aiAnalysis.confidence
      });

      res.json({
        success: true,
        incident: {
          id: incidentId,
          monitorId: monitor.kuma_id,
          monitorName,
          status: 'active',
          severity: incidentSeverity,
          ticketId,
          alertId,
          createdAt: new Date().toISOString()
        },
        aiAnalysis: {
          action: aiAnalysis.action,
          confidence: aiAnalysis.confidence,
          reasoning: aiAnalysis.reasoning,
          suggestions: aiAnalysis.suggestions
        },
        actions: {
          ticketCreated: !!ticketId,
          alertCreated: !!alertId,
          notificationsSent: true
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Incident creation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Incident creation failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/sentinel/monitor-recovery:
 *   post:
 *     tags: [Sentinel-Alerts Integration]
 *     summary: Process monitor recovery and resolve incidents
 */
router.post('/monitor-recovery',
  authenticateJWT,
  checkPermissions(['monitoring:incident:resolve']),
  createRateLimit(60 * 1000, 30), // 30 recoveries per minute
  [
    body('monitorId').isString().withMessage('Monitor ID required'),
    body('monitorName').isString().withMessage('Monitor name required'),
    body('responseTime').optional().isNumeric()
  ],
  audit('sentinel.incident.resolve'),
  async (req, res) => {
    try {
      const { monitorId, monitorName, responseTime } = req.body;

      // Find active incident
      const incident = await db.get(`
        SELECT * FROM monitoring_incidents 
        WHERE monitor_id = ? AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
      `, [monitorId]);

      if (!incident) {
        return res.json({
          success: true,
          action: 'no_incident',
          message: 'No active incident found for this monitor'
        });
      }

      const recoveryTime = new Date().toISOString();
      const downtimeDuration = new Date(recoveryTime).getTime() - new Date(incident.created_at).getTime();
      const downtimeMinutes = Math.round(downtimeDuration / 60000);

      // Resolve the incident
      await db.run(`
        UPDATE monitoring_incidents 
        SET status = 'resolved', 
            resolved_at = ?,
            downtime_duration = ?,
            auto_resolved = 1
        WHERE id = ?
      `, [recoveryTime, downtimeMinutes, incident.id]);

      // Resolve associated ticket
      if (incident.ticket_id) {
        try {
          await fetch(`/api/v2/tickets/${incident.ticket_id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SYSTEM_API_TOKEN || req.headers.authorization}`
            },
            body: JSON.stringify({
              status: 'resolved',
              resolution: `Service has been restored automatically. Monitor "${monitorName}" is now operational.\n\nDowntime: ${downtimeMinutes} minutes\nRecovery Time: ${recoveryTime}${responseTime ? `\nResponse Time: ${responseTime}ms` : ''}`,
              resolvedBy: 'system',
              resolvedAt: recoveryTime
            })
          });
        } catch (ticketError) {
          logger.error('Failed to resolve ticket:', ticketError);
        }
      }

      // Resolve associated alert
      if (incident.alert_id) {
        try {
          await fetch(`/api/v2/alerts/${incident.alert_id}/resolve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SYSTEM_API_TOKEN || req.headers.authorization}`
            },
            body: JSON.stringify({
              resolution: `Monitor recovery detected. Service "${monitorName}" is operational.`,
              resolvedBy: 'system'
            })
          });
        } catch (alertError) {
          logger.error('Failed to resolve alert:', alertError);
        }
      }

      // Send recovery notifications
      await sendRecoveryNotifications(incident, {
        monitorName,
        downtimeMinutes,
        responseTime,
        recoveryTime
      });

      logger.info('Monitoring incident resolved:', {
        incidentId: incident.id,
        monitorId,
        monitorName,
        downtimeMinutes,
        ticketId: incident.ticket_id,
        alertId: incident.alert_id
      });

      res.json({
        success: true,
        incident: {
          id: incident.id,
          monitorId,
          monitorName,
          status: 'resolved',
          resolvedAt: recoveryTime,
          downtimeMinutes
        },
        actions: {
          ticketResolved: !!incident.ticket_id,
          alertResolved: !!incident.alert_id,
          notificationsSent: true
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Incident resolution failed:', error);
      res.status(500).json({
        success: false,
        error: 'Incident resolution failed',
        details: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/v2/sentinel/incidents:
 *   get:
 *     tags: [Sentinel-Alerts Integration]
 *     summary: Get monitoring incidents with alert correlation
 */
router.get('/incidents',
  authenticateJWT,
  checkPermissions(['monitoring:read']),
  [
    query('status').optional().isIn(['active', 'resolved', 'acknowledged']),
    query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  async (req, res) => {
    try {
      const { status, severity, limit = 50 } = req.query;

      let query = `
        SELECT 
          mi.*,
          mm.name as monitor_name,
          mm.type as monitor_type,
          mm.url as monitor_url,
          CASE 
            WHEN mi.ticket_id IS NOT NULL THEN 'ticket_created'
            ELSE 'no_ticket'
          END as ticket_status,
          CASE 
            WHEN mi.alert_id IS NOT NULL THEN 'alert_created'
            ELSE 'no_alert'
          END as alert_status
        FROM monitoring_incidents mi
        JOIN monitoring_monitors mm ON mi.monitor_id = mm.kuma_id
        WHERE 1=1
      `;

      const params = [];
      let paramIndex = 1;

      // Apply tenant filtering for non-admin users
      if (req.user.role !== 'core_admin') {
        query += ` AND mi.tenant_id = ?`;
        params.push(req.user.tenantId);
        paramIndex++;
      }

      if (status) {
        query += ` AND mi.status = ?`;
        params.push(status);
        paramIndex++;
      }

      if (severity) {
        query += ` AND mi.severity = ?`;
        params.push(severity);
        paramIndex++;
      }

      query += ` ORDER BY mi.created_at DESC LIMIT ?`;
      params.push(parseInt(limit));

      const incidents = await db.all(query, params);

      // Enrich with correlation data
      const enrichedIncidents = await Promise.all(
        incidents.map(async (incident) => {
          const correlations = {
            ticket: null,
            alert: null,
            relatedIncidents: []
          };

          // Get ticket details if available
          if (incident.ticket_id) {
            try {
              const ticketResponse = await fetch(`/api/v2/tickets/${incident.ticket_id}`, {
                headers: { 'Authorization': `Bearer ${process.env.SYSTEM_API_TOKEN || req.headers.authorization}` }
              });
              if (ticketResponse.ok) {
                correlations.ticket = await ticketResponse.json();
              }
            } catch (e) {
              logger.debug('Failed to fetch ticket details:', e.message);
            }
          }

          // Get alert details if available
          if (incident.alert_id) {
            try {
              const alertResponse = await fetch(`/api/v2/alerts/status/${incident.alert_id}`, {
                headers: { 'Authorization': `Bearer ${process.env.SYSTEM_API_TOKEN || req.headers.authorization}` }
              });
              if (alertResponse.ok) {
                correlations.alert = await alertResponse.json();
              }
            } catch (e) {
              logger.debug('Failed to fetch alert details:', e.message);
            }
          }

          return {
            ...incident,
            correlations
          };
        })
      );

      res.json({
        success: true,
        incidents: enrichedIncidents,
        total: enrichedIncidents.length,
        summary: {
          active: enrichedIncidents.filter(i => i.status === 'active').length,
          resolved: enrichedIncidents.filter(i => i.status === 'resolved').length,
          withTickets: enrichedIncidents.filter(i => i.ticket_id).length,
          withAlerts: enrichedIncidents.filter(i => i.alert_id).length
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Failed to fetch incidents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch incidents',
        details: error.message
      });
    }
  }
);

// ========================================================================
// HELPER FUNCTIONS
// ========================================================================

/**
 * Determine which alert service to use based on monitor and severity
 */
function determineAlertService(monitor, severity) {
  // Map monitor types and severity to alert services
  if (monitor.public_status || severity === 'critical') {
    return 'ops-infra-001'; // Critical infrastructure service
  }

  if (monitor.type === 'http' && monitor.url?.includes('api')) {
    return 'ops-network-001'; // API/Network service
  }

  if (monitor.type === 'ssl' || monitor.url?.includes('https')) {
    return 'security-001'; // Security service for SSL issues
  }

  // Default to Level 2 support for other monitoring issues
  return 'support-l2-001';
}

/**
 * Send incident notifications via Nova Comms
 */
async function sendIncidentNotifications(monitor, incidentData) {
  try {
    // Get notification preferences for this monitor/tenant
    const notificationSettings = await db.get(`
      SELECT notification_settings FROM monitoring_monitors WHERE kuma_id = ?
    `, [monitor.kuma_id]);

    if (!notificationSettings?.notification_settings) {
      return; // No notifications configured
    }

    const settings = JSON.parse(notificationSettings.notification_settings);

    // Send to configured channels
    if (settings.slack?.enabled && settings.slack?.channel) {
      await sendSlackNotification(settings.slack.channel, {
        type: 'incident',
        ...incidentData,
        monitor
      });
    }

    if (settings.email?.enabled && settings.email?.recipients) {
      await sendEmailNotification(settings.email.recipients, {
        type: 'incident',
        ...incidentData,
        monitor
      });
    }

  } catch (error) {
    logger.error('Failed to send incident notifications:', error);
  }
}

/**
 * Send recovery notifications
 */
async function sendRecoveryNotifications(incident, recoveryData) {
  try {
    // Similar to incident notifications but for recovery
    const monitor = await db.get(`
      SELECT notification_settings FROM monitoring_monitors WHERE kuma_id = ?
    `, [incident.monitor_id]);

    if (!monitor?.notification_settings) {
      return;
    }

    const settings = JSON.parse(monitor.notification_settings);

    if (settings.slack?.enabled && settings.slack?.channel) {
      await sendSlackNotification(settings.slack.channel, {
        type: 'recovery',
        incident,
        ...recoveryData
      });
    }

    if (settings.email?.enabled && settings.email?.recipients) {
      await sendEmailNotification(settings.email.recipients, {
        type: 'recovery',
        incident,
        ...recoveryData
      });
    }

  } catch (error) {
    logger.error('Failed to send recovery notifications:', error);
  }
}

/**
 * Send Slack notification via Nova Comms
 */
async function sendSlackNotification(channel, data) {
  try {
    await fetch('/api/v2/comms/slack/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SYSTEM_API_TOKEN}`
      },
      body: JSON.stringify({
        channel,
        type: 'monitoring_alert',
        data
      })
    });
  } catch (error) {
    logger.error('Failed to send Slack notification:', error);
  }
}

/**
 * Send email notification via Nova Comms
 */
async function sendEmailNotification(recipients, data) {
  try {
    await fetch('/api/v2/comms/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SYSTEM_API_TOKEN}`
      },
      body: JSON.stringify({
        to: recipients,
        type: 'monitoring_alert',
        data
      })
    });
  } catch (error) {
    logger.error('Failed to send email notification:', error);
  }
}

export default router;
