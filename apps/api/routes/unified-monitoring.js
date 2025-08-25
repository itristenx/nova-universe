/**
 * Nova Unified Monitoring & Alerting API Gateway
 *
 * Provides unified API access to GoAlert and Uptime Kuma services
 * with Nova authentication, RBAC, and data synchronization.
 *
 * Features:
 * - Unified endpoint mapping
 * - Authentication and authorization
 * - Data transformation and correlation
 * - Real-time synchronization
 * - Error handling and fallbacks
 */

import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import { authenticateToken, requirePermission } from '../middleware/auth.js';
import { database } from '../database.js';
import { monitoringIntegrationService } from '../lib/monitoring-integration-service.js';
import { eventBridge } from '../lib/event-bridge.js';
import { cacheManager } from '../lib/cache-manager.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many API requests',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const criticalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit critical operations
  message: {
    error: 'Too many critical operations',
    retryAfter: '1 minute',
  },
});

router.use(apiLimiter);

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: errors.array(),
    });
  }
  next();
};

// Error handling middleware
const handleServiceError = (error, serviceName) => {
  logger.error(`${serviceName} service error:`, error);

  if (error.code === 'ECONNREFUSED') {
    return {
      status: 503,
      error: `${serviceName} service unavailable`,
      details: 'Service is temporarily unavailable',
    };
  }

  if (error.response?.status === 401) {
    return {
      status: 401,
      error: 'Authentication failed',
      details: 'Invalid credentials for monitoring service',
    };
  }

  if (error.response?.status === 403) {
    return {
      status: 403,
      error: 'Permission denied',
      details: 'Insufficient permissions for this operation',
    };
  }

  return {
    status: 500,
    error: 'Internal service error',
    details: error.message,
  };
};

// =============================================================================
// UNIFIED MONITOR MANAGEMENT
// =============================================================================

/**
 * GET /api/v2/monitoring/monitors
 * List all monitors with unified data from Nova, GoAlert, and Uptime Kuma
 */
router.get(
  '/monitors',
  authenticateToken,
  requirePermission('monitor.view'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'paused', 'disabled']),
    query('type').optional().isIn(['http', 'tcp', 'ping', 'dns', 'push', 'ssl']),
    query('tag').optional().isString(),
    query('search').optional().isString(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        tag,
        search,
        tenant_id = req.user.tenant_id,
      } = req.query;

      // Check cache first
      const cacheKey = `monitors:${tenant_id}:${JSON.stringify(req.query)}`;
      let result = await cacheManager.get(cacheKey);

      if (!result) {
        // Get monitors from Nova database with correlation to external services
        const offset = (page - 1) * limit;

        let whereConditions = ['1=1'];
        let params = [];
        let paramIndex = 1;

        if (tenant_id) {
          whereConditions.push(`m.tenant_id = $${paramIndex++}`);
          params.push(tenant_id);
        }

        if (status) {
          whereConditions.push(`m.status = $${paramIndex++}`);
          params.push(status);
        }

        if (type) {
          whereConditions.push(`m.type = $${paramIndex++}`);
          params.push(type);
        }

        if (search) {
          whereConditions.push(`(m.name ILIKE $${paramIndex++} OR m.url ILIKE $${paramIndex})`);
          params.push(`%${search}%`, `%${search}%`);
          paramIndex += 2;
        }

        if (tag) {
          whereConditions.push(`m.tags @> $${paramIndex++}`);
          params.push(JSON.stringify([tag]));
        }

        const query = `
          SELECT 
            m.*,
            -- Latest heartbeat data
            mh.status as current_status,
            mh.response_time_ms,
            mh.checked_at as last_check,
            -- Alert configuration
            CASE WHEN m.goalert_service_id IS NOT NULL THEN true ELSE false END as alert_enabled,
            -- Uptime statistics (last 24h)
            (
              SELECT COUNT(*)::float / NULLIF(COUNT(*), 0) * 100
              FROM monitor_heartbeats mh2 
              WHERE mh2.monitor_id = m.id 
              AND mh2.checked_at >= NOW() - INTERVAL '24 hours'
              AND mh2.status = 'up'
            ) as uptime_24h,
            -- Active incidents count
            (
              SELECT COUNT(*)
              FROM monitor_incidents mi
              WHERE mi.monitor_id = m.id 
              AND mi.status IN ('open', 'acknowledged', 'investigating')
            ) as active_incidents_count,
            -- Creator information
            u.email as created_by_email,
            u.first_name || ' ' || u.last_name as created_by_name
          FROM monitors m
          LEFT JOIN monitor_heartbeats mh ON m.id = mh.monitor_id 
            AND mh.checked_at = (
              SELECT MAX(checked_at) 
              FROM monitor_heartbeats mh3 
              WHERE mh3.monitor_id = m.id
            )
          LEFT JOIN users u ON m.created_by = u.id
          WHERE ${whereConditions.join(' AND ')}
          ORDER BY m.created_at DESC
          LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        params.push(limit, offset);

        const monitorsResult = await database.query(query, params);

        // Get total count for pagination
        const countQuery = `
          SELECT COUNT(*) as total
          FROM monitors m
          WHERE ${whereConditions.join(' AND ')}
        `;

        const countResult = await database.query(countQuery, params.slice(0, -2));
        const total = parseInt(countResult.rows[0].total);

        // Enrich with real-time data from Uptime Kuma if available
        const enrichedMonitors = await Promise.all(
          monitorsResult.rows.map(async (monitor) => {
            try {
              // Get real-time status from Uptime Kuma
              if (monitor.kuma_id) {
                const kumaStatus = await monitoringIntegrationService.getUptimeKumaMonitorStatus(
                  monitor.kuma_id,
                );
                if (kumaStatus) {
                  monitor.realtime_status = kumaStatus.status;
                  monitor.realtime_response_time = kumaStatus.response_time;
                }
              }

              // Get alert information from GoAlert
              if (monitor.goalert_service_id) {
                const alertInfo = await monitoringIntegrationService.getGoAlertServiceInfo(
                  monitor.goalert_service_id,
                );
                if (alertInfo) {
                  monitor.alert_policy = alertInfo.escalation_policy;
                  monitor.on_call_user = alertInfo.current_on_call;
                }
              }

              return monitor;
            } catch (error) {
              logger.warn(`Failed to enrich monitor ${monitor.id}:`, error);
              return monitor;
            }
          }),
        );

        result = {
          monitors: enrichedMonitors,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
          meta: {
            timestamp: new Date().toISOString(),
            cached: false,
          },
        };

        // Cache result for 30 seconds
        await cacheManager.set(cacheKey, result, 30);
      }

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      const serviceError = handleServiceError(error, 'Monitoring');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * POST /api/v2/monitoring/monitors
 * Create a new monitor with unified setup across services
 */
router.post(
  '/monitors',
  authenticateToken,
  requirePermission('monitor.create'),
  criticalLimiter,
  [
    body('name').isString().isLength({ min: 1, max: 255 }),
    body('type').isIn(['http', 'tcp', 'ping', 'dns', 'push', 'ssl']),
    body('url').optional().isURL(),
    body('hostname').optional().isString(),
    body('port').optional().isInt({ min: 1, max: 65535 }),
    body('interval_seconds').optional().isInt({ min: 20, max: 3600 }),
    body('timeout_seconds').optional().isInt({ min: 1, max: 300 }),
    body('tags').optional().isArray(),
    body('alert_enabled').optional().isBoolean(),
    body('escalation_policy_id').optional().isString(),
    body('notification_settings').optional().isObject(),
  ],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const {
        name,
        type,
        url,
        hostname,
        port,
        interval_seconds = 60,
        timeout_seconds = 30,
        tags = [],
        alert_enabled = true,
        escalation_policy_id,
        notification_settings = {},
        tenant_id = req.user.tenant_id,
      } = req.body;

      // 1. Validate monitor configuration
      if (type === 'http' && !url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required for HTTP monitors',
        });
      }

      if ((type === 'tcp' || type === 'ping') && !hostname) {
        return res.status(400).json({
          success: false,
          error: 'Hostname is required for TCP/Ping monitors',
        });
      }

      // 2. Create monitor in Uptime Kuma
      const kumaMonitor = await monitoringIntegrationService.createUptimeKumaMonitor({
        name,
        type,
        url,
        hostname,
        port,
        interval: interval_seconds,
        timeout: timeout_seconds,
        tags,
      });

      // 3. Create monitor in Nova database
      const monitorResult = await database.query(
        `
        INSERT INTO monitors (
          kuma_id, name, type, url, hostname, port, tenant_id, tags,
          interval_seconds, timeout_seconds, status, created_by,
          alert_enabled, escalation_policy_id, notification_settings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `,
        [
          kumaMonitor.id,
          name,
          type,
          url,
          hostname,
          port,
          tenant_id,
          JSON.stringify(tags),
          interval_seconds,
          timeout_seconds,
          'active',
          req.user.id,
          alert_enabled,
          escalation_policy_id,
          JSON.stringify(notification_settings),
        ],
      );

      const monitor = monitorResult.rows[0];

      // 4. Set up alerting in GoAlert if enabled
      if (alert_enabled) {
        try {
          const goalertService = await monitoringIntegrationService.createGoAlertService({
            name: `Monitor: ${name}`,
            description: `Monitoring service for ${type} monitor: ${url || hostname}`,
            escalation_policy_id: escalation_policy_id,
          });

          // Update monitor with GoAlert service ID
          await database.query(
            `
            UPDATE monitors 
            SET goalert_service_id = $1, integration_metadata = $2
            WHERE id = $3
          `,
            [goalertService.id, JSON.stringify({ goalert_service: goalertService }), monitor.id],
          );

          monitor.goalert_service_id = goalertService.id;
        } catch (alertError) {
          logger.warn(`Failed to set up alerting for monitor ${monitor.id}:`, alertError);
          // Continue without alerting - can be set up later
        }
      }

      // 5. Emit event for real-time updates
      eventBridge.emit('monitor.created', {
        monitor,
        user: req.user,
        timestamp: new Date().toISOString(),
      });

      // 6. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          after_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          req.user.id,
          'create_monitor',
          'monitor',
          monitor.id,
          'nova_monitoring',
          JSON.stringify(monitor),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      // Clear related caches
      await cacheManager.deletePattern(`monitors:${tenant_id}:*`);

      res.status(201).json({
        success: true,
        monitor: {
          ...monitor,
          tags: JSON.parse(monitor.tags || '[]'),
          notification_settings: JSON.parse(monitor.notification_settings || '{}'),
        },
        message: 'Monitor created successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Monitor Creation');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * PUT /api/v2/monitoring/monitors/:id
 * Update an existing monitor across all services
 */
router.put(
  '/monitors/:id',
  authenticateToken,
  requirePermission('monitor.edit'),
  [
    param('id').isUUID(),
    body('name').optional().isString().isLength({ min: 1, max: 255 }),
    body('url').optional().isURL(),
    body('hostname').optional().isString(),
    body('port').optional().isInt({ min: 1, max: 65535 }),
    body('interval_seconds').optional().isInt({ min: 20, max: 3600 }),
    body('timeout_seconds').optional().isInt({ min: 1, max: 300 }),
    body('status').optional().isIn(['active', 'paused', 'disabled']),
    body('tags').optional().isArray(),
    body('alert_enabled').optional().isBoolean(),
    body('notification_settings').optional().isObject(),
  ],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const { id } = req.params;
      const updateData = req.body;

      // 1. Get current monitor
      const currentResult = await database.query(
        `
        SELECT * FROM monitors WHERE id = $1 AND (tenant_id = $2 OR $3 = true)
      `,
        [id, req.user.tenant_id, req.user.role === 'admin'],
      );

      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Monitor not found',
        });
      }

      const currentMonitor = currentResult.rows[0];

      // 2. Update in Uptime Kuma if applicable
      if (
        currentMonitor.kuma_id &&
        (updateData.url || updateData.hostname || updateData.interval_seconds)
      ) {
        try {
          await monitoringIntegrationService.updateUptimeKumaMonitor(currentMonitor.kuma_id, {
            name: updateData.name || currentMonitor.name,
            url: updateData.url || currentMonitor.url,
            hostname: updateData.hostname || currentMonitor.hostname,
            port: updateData.port || currentMonitor.port,
            interval: updateData.interval_seconds || currentMonitor.interval_seconds,
            timeout: updateData.timeout_seconds || currentMonitor.timeout_seconds,
          });
        } catch (kumaError) {
          logger.warn(`Failed to update Uptime Kuma monitor ${currentMonitor.kuma_id}:`, kumaError);
          // Continue with Nova update
        }
      }

      // 3. Update in Nova database
      const setClause = [];
      const params = [];
      let paramIndex = 1;

      Object.entries(updateData).forEach(([key, value]) => {
        if (key === 'tags' || key === 'notification_settings') {
          setClause.push(`${key} = $${paramIndex++}`);
          params.push(JSON.stringify(value));
        } else {
          setClause.push(`${key} = $${paramIndex++}`);
          params.push(value);
        }
      });

      setClause.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(id);

      const updateQuery = `
        UPDATE monitors 
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const updatedResult = await database.query(updateQuery, params);
      const updatedMonitor = updatedResult.rows[0];

      // 4. Handle alert configuration changes
      if (updateData.alert_enabled !== undefined) {
        if (updateData.alert_enabled && !currentMonitor.goalert_service_id) {
          // Enable alerting
          try {
            const goalertService = await monitoringIntegrationService.createGoAlertService({
              name: `Monitor: ${updatedMonitor.name}`,
              description: `Monitoring service for ${updatedMonitor.type} monitor`,
            });

            await database.query(
              `
              UPDATE monitors SET goalert_service_id = $1 WHERE id = $2
            `,
              [goalertService.id, id],
            );

            updatedMonitor.goalert_service_id = goalertService.id;
          } catch (alertError) {
            logger.warn(`Failed to enable alerting for monitor ${id}:`, alertError);
          }
        } else if (!updateData.alert_enabled && currentMonitor.goalert_service_id) {
          // Disable alerting
          try {
            await monitoringIntegrationService.deleteGoAlertService(
              currentMonitor.goalert_service_id,
            );

            await database.query(
              `
              UPDATE monitors SET goalert_service_id = NULL WHERE id = $1
            `,
              [id],
            );

            updatedMonitor.goalert_service_id = null;
          } catch (alertError) {
            logger.warn(`Failed to disable alerting for monitor ${id}:`, alertError);
          }
        }
      }

      // 5. Emit event for real-time updates
      eventBridge.emit('monitor.updated', {
        monitor: updatedMonitor,
        previous: currentMonitor,
        changes: updateData,
        user: req.user,
        timestamp: new Date().toISOString(),
      });

      // 6. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          before_state, after_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          req.user.id,
          'update_monitor',
          'monitor',
          id,
          'nova_monitoring',
          JSON.stringify(currentMonitor),
          JSON.stringify(updatedMonitor),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      // Clear related caches
      await cacheManager.deletePattern(`monitors:${req.user.tenant_id}:*`);

      res.json({
        success: true,
        monitor: {
          ...updatedMonitor,
          tags: JSON.parse(updatedMonitor.tags || '[]'),
          notification_settings: JSON.parse(updatedMonitor.notification_settings || '{}'),
        },
        message: 'Monitor updated successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Monitor Update');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * DELETE /api/v2/monitoring/monitors/:id
 * Delete a monitor from all services
 */
router.delete(
  '/monitors/:id',
  authenticateToken,
  requirePermission('monitor.delete'),
  criticalLimiter,
  [param('id').isUUID()],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const { id } = req.params;

      // 1. Get monitor details
      const monitorResult = await database.query(
        `
        SELECT * FROM monitors WHERE id = $1 AND (tenant_id = $2 OR $3 = true)
      `,
        [id, req.user.tenant_id, req.user.role === 'admin'],
      );

      if (monitorResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Monitor not found',
        });
      }

      const monitor = monitorResult.rows[0];

      // 2. Delete from Uptime Kuma
      if (monitor.kuma_id) {
        try {
          await monitoringIntegrationService.deleteUptimeKumaMonitor(monitor.kuma_id);
        } catch (kumaError) {
          logger.warn(`Failed to delete Uptime Kuma monitor ${monitor.kuma_id}:`, kumaError);
        }
      }

      // 3. Delete from GoAlert
      if (monitor.goalert_service_id) {
        try {
          await monitoringIntegrationService.deleteGoAlertService(monitor.goalert_service_id);
        } catch (goalertError) {
          logger.warn(
            `Failed to delete GoAlert service ${monitor.goalert_service_id}:`,
            goalertError,
          );
        }
      }

      // 4. Delete from Nova database (cascade will handle related records)
      await database.query('DELETE FROM monitors WHERE id = $1', [id]);

      // 5. Emit event for real-time updates
      eventBridge.emit('monitor.deleted', {
        monitor,
        user: req.user,
        timestamp: new Date().toISOString(),
      });

      // 6. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          before_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          req.user.id,
          'delete_monitor',
          'monitor',
          id,
          'nova_monitoring',
          JSON.stringify(monitor),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      // Clear related caches
      await cacheManager.deletePattern(`monitors:${req.user.tenant_id}:*`);

      res.json({
        success: true,
        message: 'Monitor deleted successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Monitor Deletion');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

// =============================================================================
// UNIFIED ALERT MANAGEMENT
// =============================================================================

/**
 * GET /api/v2/alerts
 * List all alerts with unified data from Nova and GoAlert
 */
router.get(
  '/alerts',
  authenticateToken,
  requirePermission('alert.view'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['active', 'acknowledged', 'resolved', 'closed']),
    query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    query('assigned_to').optional().isUUID(),
    query('monitor_id').optional().isUUID(),
    query('from_date').optional().isISO8601(),
    query('to_date').optional().isISO8601(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        severity,
        assigned_to,
        monitor_id,
        from_date,
        to_date,
        tenant_id = req.user.tenant_id,
      } = req.query;

      // Build dynamic query
      let whereConditions = ['1=1'];
      let params = [];
      let paramIndex = 1;

      // Tenant filtering
      if (tenant_id) {
        whereConditions.push(`(m.tenant_id = $${paramIndex++} OR m.tenant_id IS NULL)`);
        params.push(tenant_id);
      }

      if (status) {
        whereConditions.push(`a.status = $${paramIndex++}`);
        params.push(status);
      }

      if (severity) {
        whereConditions.push(`a.severity = $${paramIndex++}`);
        params.push(severity);
      }

      if (assigned_to) {
        whereConditions.push(`a.assigned_to = $${paramIndex++}`);
        params.push(assigned_to);
      }

      if (monitor_id) {
        whereConditions.push(`a.monitor_id = $${paramIndex++}`);
        params.push(monitor_id);
      }

      if (from_date) {
        whereConditions.push(`a.created_at >= $${paramIndex++}`);
        params.push(from_date);
      }

      if (to_date) {
        whereConditions.push(`a.created_at <= $${paramIndex++}`);
        params.push(to_date);
      }

      const offset = (page - 1) * limit;

      const alertsQuery = `
        SELECT 
          a.*,
          -- Monitor information
          m.name as monitor_name,
          m.type as monitor_type,
          m.url as monitor_url,
          -- User information
          u_created.email as created_by_email,
          u_created.first_name || ' ' || u_created.last_name as created_by_name,
          u_assigned.email as assigned_to_email,
          u_assigned.first_name || ' ' || u_assigned.last_name as assigned_to_name,
          u_ack.email as acknowledged_by_email,
          u_ack.first_name || ' ' || u_ack.last_name as acknowledged_by_name,
          u_resolved.email as resolved_by_email,
          u_resolved.first_name || ' ' || u_resolved.last_name as resolved_by_name,
          -- SLA calculations
          CASE 
            WHEN a.acknowledged_at IS NOT NULL THEN
              EXTRACT(EPOCH FROM (a.acknowledged_at - a.created_at)) / 60
            ELSE NULL
          END as response_time_minutes,
          CASE 
            WHEN a.resolved_at IS NOT NULL THEN
              EXTRACT(EPOCH FROM (a.resolved_at - a.created_at)) / 60
            ELSE NULL
          END as resolution_time_minutes,
          -- Related incident count
          (
            SELECT COUNT(*)
            FROM monitor_incidents mi
            WHERE mi.alert_id = a.id
          ) as related_incidents_count
        FROM nova_alerts a
        LEFT JOIN monitors m ON a.monitor_id = m.id
        LEFT JOIN users u_created ON a.created_by = u_created.id
        LEFT JOIN users u_assigned ON a.assigned_to = u_assigned.id
        LEFT JOIN users u_ack ON a.acknowledged_by = u_ack.id
        LEFT JOIN users u_resolved ON a.resolved_by = u_resolved.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY 
          CASE a.severity 
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END,
          a.created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      params.push(limit, offset);

      const alertsResult = await database.query(alertsQuery, params);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM nova_alerts a
        LEFT JOIN monitors m ON a.monitor_id = m.id
        WHERE ${whereConditions.join(' AND ')}
      `;

      const countResult = await database.query(countQuery, params.slice(0, -2));
      const total = parseInt(countResult.rows[0].total);

      // Enrich with GoAlert data
      const enrichedAlerts = await Promise.all(
        alertsResult.rows.map(async (alert) => {
          try {
            if (alert.goalert_alert_id) {
              const goalertAlert = await monitoringIntegrationService.getGoAlertAlert(
                alert.goalert_alert_id,
              );
              if (goalertAlert) {
                alert.goalert_data = goalertAlert;
                alert.escalation_info = goalertAlert.escalation_info;
              }
            }
            return alert;
          } catch (error) {
            logger.warn(`Failed to enrich alert ${alert.id} with GoAlert data:`, error);
            return alert;
          }
        }),
      );

      res.json({
        success: true,
        alerts: enrichedAlerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
        summary: {
          total_alerts: total,
          by_severity: await getAlertsBySeverity(whereConditions, params.slice(0, -2)),
          by_status: await getAlertsByStatus(whereConditions, params.slice(0, -2)),
        },
      });
    } catch (error) {
      const serviceError = handleServiceError(error, 'Alert Management');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * POST /api/v2/alerts
 * Create a new alert with automatic GoAlert integration
 */
router.post(
  '/alerts',
  authenticateToken,
  requirePermission('alert.create'),
  criticalLimiter,
  [
    body('summary').isString().isLength({ min: 1, max: 500 }),
    body('description').optional().isString(),
    body('severity').isIn(['low', 'medium', 'high', 'critical']),
    body('monitor_id').optional().isUUID(),
    body('component').optional().isString(),
    body('source').optional().isIn(['monitoring', 'manual', 'api', 'automated']),
    body('assigned_to').optional().isUUID(),
    body('escalate_immediately').optional().isBoolean(),
    body('metadata').optional().isObject(),
  ],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const {
        summary,
        description,
        severity,
        monitor_id,
        component,
        source = 'manual',
        assigned_to,
        escalate_immediately = false,
        metadata = {},
      } = req.body;

      // 1. Create alert in Nova database
      const alertResult = await database.query(
        `
        INSERT INTO nova_alerts (
          summary, description, severity, monitor_id, component, source,
          assigned_to, created_by, metadata, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `,
        [
          summary,
          description,
          severity,
          monitor_id,
          component,
          source,
          assigned_to,
          req.user.id,
          JSON.stringify(metadata),
          'active',
        ],
      );

      const alert = alertResult.rows[0];

      // 2. Get monitor information for service mapping
      let goalertServiceId = null;
      if (monitor_id) {
        const monitorResult = await database.query(
          `
          SELECT goalert_service_id, escalation_policy_id 
          FROM monitors 
          WHERE id = $1
        `,
          [monitor_id],
        );

        if (monitorResult.rows.length > 0) {
          goalertServiceId = monitorResult.rows[0].goalert_service_id;
        }
      }

      // 3. Create alert in GoAlert if service is configured or if escalation is requested
      if (goalertServiceId || escalate_immediately || severity === 'critical') {
        try {
          const goalertAlert = await monitoringIntegrationService.createGoAlertAlert({
            service_id: goalertServiceId,
            summary: summary,
            details: description,
            severity: severity,
            source: 'nova_monitoring',
            metadata: {
              nova_alert_id: alert.id,
              monitor_id: monitor_id,
              component: component,
              created_by: req.user.email,
            },
          });

          // Update Nova alert with GoAlert ID
          await database.query(
            `
            UPDATE nova_alerts 
            SET goalert_alert_id = $1, service_id = $2
            WHERE id = $3
          `,
            [goalertAlert.id, goalertServiceId, alert.id],
          );

          alert.goalert_alert_id = goalertAlert.id;
          alert.service_id = goalertServiceId;
        } catch (goalertError) {
          logger.warn(`Failed to create GoAlert alert for ${alert.id}:`, goalertError);
          // Continue without GoAlert - alert still exists in Nova
        }
      }

      // 4. Create incident if monitor-related
      if (monitor_id) {
        await database.query(
          `
          INSERT INTO monitor_incidents (
            monitor_id, alert_id, status, severity, summary, description,
            started_at, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
          [
            monitor_id,
            alert.id,
            'open',
            severity,
            summary,
            description,
            alert.created_at,
            JSON.stringify(metadata),
          ],
        );
      }

      // 5. Send notifications
      try {
        await monitoringIntegrationService.sendAlertNotifications(alert, {
          immediate: severity === 'critical' || escalate_immediately,
          channels: ['email', 'slack'], // Default channels
          recipients: assigned_to ? [assigned_to] : [],
        });
      } catch (notificationError) {
        logger.warn(`Failed to send notifications for alert ${alert.id}:`, notificationError);
      }

      // 6. Emit event for real-time updates
      eventBridge.emit('alert.created', {
        alert,
        user: req.user,
        timestamp: new Date().toISOString(),
      });

      // 7. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          after_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          req.user.id,
          'create_alert',
          'alert',
          alert.id,
          'nova_monitoring',
          JSON.stringify(alert),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        alert: {
          ...alert,
          metadata: JSON.parse(alert.metadata || '{}'),
        },
        message: 'Alert created successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Alert Creation');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * PUT /api/v2/alerts/:id/acknowledge
 * Acknowledge an alert across all systems
 */
router.put(
  '/alerts/:id/acknowledge',
  authenticateToken,
  requirePermission('alert.acknowledge'),
  [param('id').isUUID(), body('message').optional().isString().isLength({ max: 1000 })],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const { id } = req.params;
      const { message } = req.body;

      // 1. Get current alert
      const alertResult = await database.query(
        `
        SELECT * FROM nova_alerts WHERE id = $1
      `,
        [id],
      );

      if (alertResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found',
        });
      }

      const alert = alertResult.rows[0];

      if (alert.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'Only active alerts can be acknowledged',
        });
      }

      // 2. Acknowledge in Nova
      const updatedResult = await database.query(
        `
        UPDATE nova_alerts 
        SET 
          status = 'acknowledged',
          acknowledged_by = $1,
          acknowledged_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `,
        [req.user.id, id],
      );

      const updatedAlert = updatedResult.rows[0];

      // 3. Acknowledge in GoAlert if applicable
      if (alert.goalert_alert_id) {
        try {
          await monitoringIntegrationService.acknowledgeGoAlertAlert(alert.goalert_alert_id, {
            user_id: req.user.goalert_user_id || req.user.email,
            message: message || 'Acknowledged via Nova',
          });
        } catch (goalertError) {
          logger.warn(
            `Failed to acknowledge GoAlert alert ${alert.goalert_alert_id}:`,
            goalertError,
          );
        }
      }

      // 4. Update related incident
      if (alert.monitor_id) {
        await database.query(
          `
          UPDATE monitor_incidents 
          SET 
            status = 'acknowledged',
            acknowledged_at = CURRENT_TIMESTAMP
          WHERE alert_id = $1 AND status = 'open'
        `,
          [id],
        );
      }

      // 5. Send acknowledgment notifications
      try {
        await monitoringIntegrationService.sendAlertNotifications(updatedAlert, {
          type: 'acknowledgment',
          message: message,
          acknowledged_by: req.user,
        });
      } catch (notificationError) {
        logger.warn(
          `Failed to send acknowledgment notifications for alert ${id}:`,
          notificationError,
        );
      }

      // 6. Emit event
      eventBridge.emit('alert.acknowledged', {
        alert: updatedAlert,
        previous: alert,
        user: req.user,
        message: message,
        timestamp: new Date().toISOString(),
      });

      // 7. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          before_state, after_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          req.user.id,
          'acknowledge_alert',
          'alert',
          id,
          'nova_monitoring',
          JSON.stringify(alert),
          JSON.stringify(updatedAlert),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      res.json({
        success: true,
        alert: {
          ...updatedAlert,
          metadata: JSON.parse(updatedAlert.metadata || '{}'),
        },
        message: 'Alert acknowledged successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Alert Acknowledgment');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * PUT /api/v2/alerts/:id/resolve
 * Resolve an alert across all systems
 */
router.put(
  '/alerts/:id/resolve',
  authenticateToken,
  requirePermission('alert.resolve'),
  [
    param('id').isUUID(),
    body('resolution_notes').optional().isString().isLength({ max: 2000 }),
    body('root_cause').optional().isString().isLength({ max: 1000 }),
  ],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const { id } = req.params;
      const { resolution_notes, root_cause } = req.body;

      // 1. Get current alert
      const alertResult = await database.query(
        `
        SELECT * FROM nova_alerts WHERE id = $1
      `,
        [id],
      );

      if (alertResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Alert not found',
        });
      }

      const alert = alertResult.rows[0];

      if (!['active', 'acknowledged'].includes(alert.status)) {
        return res.status(400).json({
          success: false,
          error: 'Only active or acknowledged alerts can be resolved',
        });
      }

      // 2. Resolve in Nova
      const updatedResult = await database.query(
        `
        UPDATE nova_alerts 
        SET 
          status = 'resolved',
          resolved_by = $1,
          resolved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP,
          metadata = $2
        WHERE id = $3
        RETURNING *
      `,
        [
          req.user.id,
          JSON.stringify({
            ...JSON.parse(alert.metadata || '{}'),
            resolution_notes,
            root_cause,
          }),
          id,
        ],
      );

      const updatedAlert = updatedResult.rows[0];

      // 3. Resolve in GoAlert if applicable
      if (alert.goalert_alert_id) {
        try {
          await monitoringIntegrationService.resolveGoAlertAlert(alert.goalert_alert_id, {
            user_id: req.user.goalert_user_id || req.user.email,
            message: resolution_notes || 'Resolved via Nova',
          });
        } catch (goalertError) {
          logger.warn(`Failed to resolve GoAlert alert ${alert.goalert_alert_id}:`, goalertError);
        }
      }

      // 4. Update related incident
      if (alert.monitor_id) {
        await database.query(
          `
          UPDATE monitor_incidents 
          SET 
            status = 'resolved',
            resolved_at = CURRENT_TIMESTAMP,
            root_cause = $1,
            resolution_notes = $2
          WHERE alert_id = $3 AND status IN ('open', 'acknowledged', 'investigating')
        `,
          [root_cause, resolution_notes, id],
        );
      }

      // 5. Send resolution notifications
      try {
        await monitoringIntegrationService.sendAlertNotifications(updatedAlert, {
          type: 'resolution',
          resolution_notes,
          root_cause,
          resolved_by: req.user,
        });
      } catch (notificationError) {
        logger.warn(`Failed to send resolution notifications for alert ${id}:`, notificationError);
      }

      // 6. Emit event
      eventBridge.emit('alert.resolved', {
        alert: updatedAlert,
        previous: alert,
        user: req.user,
        resolution_notes,
        root_cause,
        timestamp: new Date().toISOString(),
      });

      // 7. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          before_state, after_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          req.user.id,
          'resolve_alert',
          'alert',
          id,
          'nova_monitoring',
          JSON.stringify(alert),
          JSON.stringify(updatedAlert),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      res.json({
        success: true,
        alert: {
          ...updatedAlert,
          metadata: JSON.parse(updatedAlert.metadata || '{}'),
        },
        message: 'Alert resolved successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Alert Resolution');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

// =============================================================================
// ON-CALL SCHEDULE MANAGEMENT
// =============================================================================

/**
 * GET /api/v2/oncall/schedules
 * List all on-call schedules with current assignments
 */
router.get(
  '/oncall/schedules',
  authenticateToken,
  requirePermission('oncall.view'),
  [
    query('include_inactive').optional().isBoolean(),
    query('team_id').optional().isUUID(),
    query('service_id').optional().isString(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        include_inactive = false,
        team_id,
        service_id,
        tenant_id = req.user.tenant_id,
      } = req.query;

      let whereConditions = ['1=1'];
      let params = [];
      let paramIndex = 1;

      // Tenant filtering
      if (tenant_id) {
        whereConditions.push(`s.tenant_id = $${paramIndex++}`);
        params.push(tenant_id);
      }

      if (!include_inactive) {
        whereConditions.push(`s.is_active = true`);
      }

      if (team_id) {
        whereConditions.push(`s.team_id = $${paramIndex++}`);
        params.push(team_id);
      }

      if (service_id) {
        whereConditions.push(`s.goalert_schedule_id = $${paramIndex++}`);
        params.push(service_id);
      }

      const schedulesQuery = `
        SELECT 
          s.*,
          -- Team information
          t.name as team_name,
          t.description as team_description,
          -- Current on-call information
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'user_id', u.id,
                  'email', u.email,
                  'name', u.first_name || ' ' || u.last_name,
                  'phone', u.phone,
                  'shift_start', osa.shift_start,
                  'shift_end', osa.shift_end,
                  'is_primary', osa.is_primary
                )
              )
              FROM oncall_schedule_assignments osa
              JOIN users u ON osa.user_id = u.id
              WHERE osa.schedule_id = s.id
                AND osa.shift_start <= CURRENT_TIMESTAMP
                AND osa.shift_end >= CURRENT_TIMESTAMP
                AND osa.is_active = true
            ), 
            '[]'::json
          ) as current_oncall,
          -- Next on-call information
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'user_id', u.id,
                  'email', u.email,
                  'name', u.first_name || ' ' || u.last_name,
                  'shift_start', osa.shift_start,
                  'shift_end', osa.shift_end,
                  'is_primary', osa.is_primary
                )
              )
              FROM oncall_schedule_assignments osa
              JOIN users u ON osa.user_id = u.id
              WHERE osa.schedule_id = s.id
                AND osa.shift_start > CURRENT_TIMESTAMP
                AND osa.is_active = true
              ORDER BY osa.shift_start
              LIMIT 5
            ), 
            '[]'::json
          ) as upcoming_oncall,
          -- Schedule statistics
          (
            SELECT COUNT(*)
            FROM oncall_schedule_assignments osa
            WHERE osa.schedule_id = s.id
              AND osa.shift_start >= CURRENT_DATE - INTERVAL '30 days'
              AND osa.is_active = true
          ) as assignments_last_30_days
        FROM oncall_schedules s
        LEFT JOIN teams t ON s.team_id = t.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY s.name, s.created_at DESC
      `;

      const schedulesResult = await database.query(schedulesQuery, params);

      // Enrich with GoAlert data
      const enrichedSchedules = await Promise.all(
        schedulesResult.rows.map(async (schedule) => {
          try {
            if (schedule.goalert_schedule_id) {
              const goalertSchedule = await monitoringIntegrationService.getGoAlertSchedule(
                schedule.goalert_schedule_id,
              );
              if (goalertSchedule) {
                schedule.goalert_data = goalertSchedule;
                schedule.sync_status = 'synced';
              } else {
                schedule.sync_status = 'error';
              }
            } else {
              schedule.sync_status = 'nova_only';
            }
            return schedule;
          } catch (error) {
            logger.warn(`Failed to enrich schedule ${schedule.id} with GoAlert data:`, error);
            schedule.sync_status = 'sync_error';
            return schedule;
          }
        }),
      );

      res.json({
        success: true,
        schedules: enrichedSchedules,
        summary: {
          total_schedules: enrichedSchedules.length,
          active_schedules: enrichedSchedules.filter((s) => s.is_active).length,
          synced_schedules: enrichedSchedules.filter((s) => s.sync_status === 'synced').length,
          current_oncall_count: enrichedSchedules.reduce(
            (sum, s) => sum + s.current_oncall.length,
            0,
          ),
        },
      });
    } catch (error) {
      const serviceError = handleServiceError(error, 'Schedule Management');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * POST /api/v2/oncall/schedules
 * Create a new on-call schedule with GoAlert integration
 */
router.post(
  '/oncall/schedules',
  authenticateToken,
  requirePermission('oncall.create'),
  criticalLimiter,
  [
    body('name').isString().isLength({ min: 1, max: 200 }),
    body('description').optional().isString(),
    body('timezone').isString(),
    body('team_id').optional().isUUID(),
    body('rotation_type').isIn(['daily', 'weekly', 'custom']),
    body('rotation_config').isObject(),
    body('escalation_policy_id').optional().isString(),
    body('create_in_goalert').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const {
        name,
        description,
        timezone,
        team_id,
        rotation_type,
        rotation_config,
        escalation_policy_id,
        create_in_goalert = true,
      } = req.body;

      // 1. Create schedule in Nova
      const scheduleResult = await database.query(
        `
        INSERT INTO oncall_schedules (
          name, description, timezone, team_id, rotation_type,
          rotation_config, escalation_policy_id, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
        [
          name,
          description,
          timezone,
          team_id,
          rotation_type,
          JSON.stringify(rotation_config),
          escalation_policy_id,
          req.user.id,
        ],
      );

      const schedule = scheduleResult.rows[0];

      // 2. Create in GoAlert if requested
      if (create_in_goalert) {
        try {
          const goalertSchedule = await monitoringIntegrationService.createGoAlertSchedule({
            name: name,
            description: description,
            time_zone: timezone,
            targets: [], // Will be populated when assignments are made
            metadata: {
              nova_schedule_id: schedule.id,
              created_via: 'nova_ui',
              rotation_type: rotation_type,
            },
          });

          // Update Nova schedule with GoAlert ID
          await database.query(
            `
            UPDATE oncall_schedules 
            SET goalert_schedule_id = $1
            WHERE id = $2
          `,
            [goalertSchedule.id, schedule.id],
          );

          schedule.goalert_schedule_id = goalertSchedule.id;
        } catch (goalertError) {
          logger.warn(`Failed to create GoAlert schedule for ${schedule.id}:`, goalertError);
          // Continue without GoAlert - schedule still exists in Nova
        }
      }

      // 3. Send notifications to team
      if (team_id) {
        try {
          await monitoringIntegrationService.sendScheduleNotifications(schedule, {
            type: 'schedule_created',
            team_id: team_id,
            created_by: req.user,
          });
        } catch (notificationError) {
          logger.warn(`Failed to send schedule creation notifications:`, notificationError);
        }
      }

      // 4. Emit event
      eventBridge.emit('schedule.created', {
        schedule,
        user: req.user,
        timestamp: new Date().toISOString(),
      });

      // 5. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          after_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          req.user.id,
          'create_schedule',
          'schedule',
          schedule.id,
          'nova_monitoring',
          JSON.stringify(schedule),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        schedule: {
          ...schedule,
          rotation_config: JSON.parse(schedule.rotation_config || '{}'),
        },
        message: 'On-call schedule created successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Schedule Creation');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * GET /api/v2/oncall/current
 * Get current on-call information across all schedules
 */
router.get(
  '/oncall/current',
  authenticateToken,
  requirePermission('oncall.view'),
  [
    query('team_id').optional().isUUID(),
    query('service_id').optional().isString(),
    query('include_upcoming').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        team_id,
        service_id,
        include_upcoming = true,
        tenant_id = req.user.tenant_id,
      } = req.query;

      let whereConditions = ['1=1'];
      let params = [];
      let paramIndex = 1;

      // Tenant filtering
      if (tenant_id) {
        whereConditions.push(`s.tenant_id = $${paramIndex++}`);
        params.push(tenant_id);
      }

      if (team_id) {
        whereConditions.push(`s.team_id = $${paramIndex++}`);
        params.push(team_id);
      }

      if (service_id) {
        whereConditions.push(`s.goalert_schedule_id = $${paramIndex++}`);
        params.push(service_id);
      }

      // Current on-call query
      const currentQuery = `
        SELECT 
          s.id as schedule_id,
          s.name as schedule_name,
          s.goalert_schedule_id,
          t.name as team_name,
          osa.shift_start,
          osa.shift_end,
          osa.is_primary,
          u.id as user_id,
          u.email,
          u.first_name || ' ' || u.last_name as name,
          u.phone,
          u.timezone as user_timezone,
          -- Contact preferences
          COALESCE(
            (
              SELECT json_build_object(
                'email_enabled', cp.email_enabled,
                'sms_enabled', cp.sms_enabled,
                'push_enabled', cp.push_enabled,
                'voice_enabled', cp.voice_enabled
              )
              FROM user_contact_preferences cp
              WHERE cp.user_id = u.id
            ),
            '{"email_enabled": true, "sms_enabled": true, "push_enabled": true, "voice_enabled": false}'::json
          ) as contact_preferences,
          -- Recent alert count
          (
            SELECT COUNT(*)
            FROM nova_alerts a
            WHERE a.assigned_to = u.id
              AND a.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
              AND a.status IN ('active', 'acknowledged')
          ) as recent_alerts_count
        FROM oncall_schedule_assignments osa
        JOIN oncall_schedules s ON osa.schedule_id = s.id
        LEFT JOIN teams t ON s.team_id = t.id
        JOIN users u ON osa.user_id = u.id
        WHERE ${whereConditions.join(' AND ')}
          AND osa.shift_start <= CURRENT_TIMESTAMP
          AND osa.shift_end >= CURRENT_TIMESTAMP
          AND osa.is_active = true
          AND s.is_active = true
        ORDER BY 
          osa.is_primary DESC,
          s.priority DESC,
          s.name
      `;

      const currentResult = await database.query(currentQuery, params);

      let upcomingResult = { rows: [] };
      if (include_upcoming) {
        // Upcoming on-call query (next 7 days)
        const upcomingQuery = `
          SELECT 
            s.id as schedule_id,
            s.name as schedule_name,
            s.goalert_schedule_id,
            t.name as team_name,
            osa.shift_start,
            osa.shift_end,
            osa.is_primary,
            u.id as user_id,
            u.email,
            u.first_name || ' ' || u.last_name as name,
            u.phone
          FROM oncall_schedule_assignments osa
          JOIN oncall_schedules s ON osa.schedule_id = s.id
          LEFT JOIN teams t ON s.team_id = t.id
          JOIN users u ON osa.user_id = u.id
          WHERE ${whereConditions.join(' AND ')}
            AND osa.shift_start > CURRENT_TIMESTAMP
            AND osa.shift_start <= CURRENT_TIMESTAMP + INTERVAL '7 days'
            AND osa.is_active = true
            AND s.is_active = true
          ORDER BY 
            osa.shift_start,
            osa.is_primary DESC,
            s.name
          LIMIT 20
        `;

        upcomingResult = await database.query(upcomingQuery, params);
      }

      // Enrich with GoAlert data
      const enrichedCurrent = await Promise.all(
        currentResult.rows.map(async (assignment) => {
          try {
            if (assignment.goalert_schedule_id) {
              const goalertOnCall = await monitoringIntegrationService.getGoAlertCurrentOnCall(
                assignment.goalert_schedule_id,
              );
              if (goalertOnCall) {
                assignment.goalert_data = goalertOnCall;
              }
            }
            return assignment;
          } catch (error) {
            logger.warn(`Failed to enrich current on-call data:`, error);
            return assignment;
          }
        }),
      );

      res.json({
        success: true,
        current_oncall: enrichedCurrent.map((row) => ({
          ...row,
          contact_preferences:
            typeof row.contact_preferences === 'string'
              ? JSON.parse(row.contact_preferences)
              : row.contact_preferences,
        })),
        upcoming_oncall: include_upcoming ? upcomingResult.rows : [],
        summary: {
          total_current: enrichedCurrent.length,
          primary_oncall: enrichedCurrent.filter((a) => a.is_primary).length,
          secondary_oncall: enrichedCurrent.filter((a) => !a.is_primary).length,
          high_alert_users: enrichedCurrent.filter((a) => a.recent_alerts_count > 5).length,
        },
      });
    } catch (error) {
      const serviceError = handleServiceError(error, 'Current On-Call');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * POST /api/v2/oncall/override
 * Create an on-call override for emergency situations
 */
router.post(
  '/oncall/override',
  authenticateToken,
  requirePermission('oncall.override'),
  criticalLimiter,
  [
    body('schedule_id').isUUID(),
    body('user_id').isUUID(),
    body('start_time').isISO8601(),
    body('end_time').isISO8601(),
    body('reason').isString().isLength({ min: 1, max: 500 }),
    body('replace_user_id').optional().isUUID(),
  ],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const { schedule_id, user_id, start_time, end_time, reason, replace_user_id } = req.body;

      // 1. Validate schedule exists and user has access
      const scheduleResult = await database.query(
        `
        SELECT * FROM oncall_schedules 
        WHERE id = $1 AND is_active = true
      `,
        [schedule_id],
      );

      if (scheduleResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found or inactive',
        });
      }

      const schedule = scheduleResult.rows[0];

      // 2. Create override assignment
      const overrideResult = await database.query(
        `
        INSERT INTO oncall_schedule_assignments (
          schedule_id, user_id, shift_start, shift_end,
          is_override, override_reason, created_by, replaced_user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
        [schedule_id, user_id, start_time, end_time, true, reason, req.user.id, replace_user_id],
      );

      const override = overrideResult.rows[0];

      // 3. Deactivate conflicting assignments if replacing
      if (replace_user_id) {
        await database.query(
          `
          UPDATE oncall_schedule_assignments 
          SET is_active = false, updated_at = CURRENT_TIMESTAMP
          WHERE schedule_id = $1 
            AND user_id = $2
            AND shift_start <= $3
            AND shift_end >= $4
            AND is_active = true
            AND id != $5
        `,
          [schedule_id, replace_user_id, end_time, start_time, override.id],
        );
      }

      // 4. Create in GoAlert if applicable
      if (schedule.goalert_schedule_id) {
        try {
          await monitoringIntegrationService.createGoAlertOverride({
            schedule_id: schedule.goalert_schedule_id,
            user_id: req.user.goalert_user_id || req.user.email,
            start: start_time,
            end: end_time,
            message: reason,
          });
        } catch (goalertError) {
          logger.warn(`Failed to create GoAlert override:`, goalertError);
        }
      }

      // 5. Send notifications
      try {
        await monitoringIntegrationService.sendOverrideNotifications(override, {
          schedule_name: schedule.name,
          override_user: req.user,
          replaced_user_id: replace_user_id,
          reason: reason,
        });
      } catch (notificationError) {
        logger.warn(`Failed to send override notifications:`, notificationError);
      }

      // 6. Emit event
      eventBridge.emit('oncall.override_created', {
        override,
        schedule,
        user: req.user,
        timestamp: new Date().toISOString(),
      });

      // 7. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          after_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          req.user.id,
          'create_override',
          'oncall_assignment',
          override.id,
          'nova_monitoring',
          JSON.stringify(override),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        override,
        message: 'On-call override created successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Override Creation');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

// =============================================================================
// STATUS PAGE MANAGEMENT
// =============================================================================

/**
 * GET /api/v2/status/public/:tenantId
 * Public status page for a tenant (no authentication required)
 */
router.get(
  '/status/public/:tenantId',
  [
    param('tenantId').isUUID(),
    query('include_history').optional().isBoolean(),
    query('days').optional().isInt({ min: 1, max: 90 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { tenantId } = req.params;
      const { include_history = true, days = 30 } = req.query;

      // 1. Get tenant status page configuration
      const configResult = await database.query(
        `
        SELECT 
          spc.*,
          t.name as tenant_name,
          t.subdomain
        FROM status_page_config spc
        JOIN tenants t ON spc.tenant_id = t.id
        WHERE spc.tenant_id = $1 AND spc.is_public = true
      `,
        [tenantId],
      );

      if (configResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Public status page not found for this tenant',
        });
      }

      const config = configResult.rows[0];

      // 2. Get current service status
      const servicesQuery = `
        SELECT 
          m.id,
          m.name,
          m.description,
          m.type,
          m.url,
          m.status,
          m.last_check,
          m.response_time,
          m.uptime_percentage,
          -- Current incident information
          COALESCE(
            (
              SELECT json_build_object(
                'id', mi.id,
                'status', mi.status,
                'severity', mi.severity,
                'summary', mi.summary,
                'started_at', mi.started_at,
                'estimated_resolution', mi.estimated_resolution
              )
              FROM monitor_incidents mi
              WHERE mi.monitor_id = m.id
                AND mi.status IN ('open', 'investigating', 'identified', 'monitoring')
              ORDER BY mi.created_at DESC
              LIMIT 1
            ),
            null
          ) as current_incident,
          -- Recent uptime data
          CASE WHEN $2 THEN
            COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'date', DATE(checked_at),
                    'uptime_percentage', 
                    ROUND(
                      (COUNT(*) FILTER (WHERE status = 'up')::float / COUNT(*)) * 100,
                      2
                    ),
                    'avg_response_time',
                    ROUND(AVG(response_time), 2),
                    'incidents_count',
                    COUNT(DISTINCT CASE WHEN status != 'up' THEN checked_at END)
                  )
                  ORDER BY DATE(checked_at) DESC
                )
                FROM monitor_checks mc
                WHERE mc.monitor_id = m.id
                  AND mc.checked_at >= CURRENT_DATE - INTERVAL '%s days'
                GROUP BY DATE(checked_at)
                ORDER BY DATE(checked_at) DESC
                LIMIT 30
              ),
              '[]'::json
            )
          ELSE '[]'::json
          END as uptime_history
        FROM monitors m
        WHERE m.tenant_id = $1
          AND m.include_in_status_page = true
          AND m.is_active = true
        ORDER BY m.display_order, m.name
      `;

      const servicesResult = await database.query(servicesQuery.replace('%s', days.toString()), [
        tenantId,
        include_history,
      ]);

      // 3. Get recent incidents (last 30 days)
      const incidentsQuery = `
        SELECT 
          mi.*,
          m.name as monitor_name,
          m.type as monitor_type,
          -- Incident updates
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', iu.id,
                  'status', iu.status,
                  'message', iu.message,
                  'created_at', iu.created_at,
                  'created_by_name', u.first_name || ' ' || u.last_name
                )
                ORDER BY iu.created_at DESC
              )
              FROM incident_updates iu
              LEFT JOIN users u ON iu.created_by = u.id
              WHERE iu.incident_id = mi.id
            ),
            '[]'::json
          ) as updates
        FROM monitor_incidents mi
        LEFT JOIN monitors m ON mi.monitor_id = m.id
        WHERE m.tenant_id = $1
          AND mi.created_at >= CURRENT_DATE - INTERVAL '30 days'
          AND mi.is_public = true
        ORDER BY mi.created_at DESC
        LIMIT 20
      `;

      const incidentsResult = await database.query(incidentsQuery, [tenantId]);

      // 4. Calculate overall status
      const activeIncidents = incidentsResult.rows.filter((incident) =>
        ['open', 'investigating', 'identified', 'monitoring'].includes(incident.status),
      );

      let overallStatus = 'operational';
      if (activeIncidents.length > 0) {
        const criticalIncidents = activeIncidents.filter((i) => i.severity === 'critical');
        const highIncidents = activeIncidents.filter((i) => i.severity === 'high');

        if (criticalIncidents.length > 0) {
          overallStatus = 'major_outage';
        } else if (highIncidents.length > 0) {
          overallStatus = 'partial_outage';
        } else {
          overallStatus = 'degraded_performance';
        }
      }

      // 5. Get maintenance windows
      const maintenanceQuery = `
        SELECT 
          mw.*,
          -- Affected services
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', m.id,
                  'name', m.name,
                  'type', m.type
                )
              )
              FROM maintenance_window_services mws
              JOIN monitors m ON mws.monitor_id = m.id
              WHERE mws.maintenance_window_id = mw.id
            ),
            '[]'::json
          ) as affected_services
        FROM maintenance_windows mw
        WHERE mw.tenant_id = $1
          AND mw.is_public = true
          AND (
            mw.status = 'scheduled' OR
            (mw.status IN ('in_progress', 'completed') AND mw.end_time >= CURRENT_TIMESTAMP - INTERVAL '7 days')
          )
        ORDER BY mw.start_time DESC
      `;

      const maintenanceResult = await database.query(maintenanceQuery, [tenantId]);

      // 6. Cache the response for public access
      const _cacheKey = `status_page:${tenantId}:${include_history}:${days}`;
      const cacheTimeout = 60; // 1 minute cache

      const statusPageData = {
        success: true,
        status_page: {
          tenant_name: config.tenant_name,
          subdomain: config.subdomain,
          title: config.title,
          description: config.description,
          logo_url: config.logo_url,
          custom_css: config.custom_css,
          last_updated: new Date().toISOString(),
        },
        overall_status: overallStatus,
        services: servicesResult.rows.map((service) => ({
          ...service,
          uptime_history: include_history ? service.uptime_history : [],
        })),
        active_incidents: activeIncidents,
        recent_incidents: incidentsResult.rows,
        scheduled_maintenance: maintenanceResult.rows.filter((m) => m.status === 'scheduled'),
        past_incidents: incidentsResult.rows
          .filter((incident) => ['resolved', 'postmortem'].includes(incident.status))
          .slice(0, 10),
        summary: {
          total_services: servicesResult.rows.length,
          operational_services: servicesResult.rows.filter((s) => s.status === 'up').length,
          active_incidents: activeIncidents.length,
          scheduled_maintenance: maintenanceResult.rows.filter((m) => m.status === 'scheduled')
            .length,
        },
      };

      // Set appropriate cache headers for public access
      res.set({
        'Cache-Control': `public, max-age=${cacheTimeout}`,
        ETag: `"${Buffer.from(JSON.stringify(statusPageData)).toString('base64').slice(0, 16)}"`,
        'Last-Modified': new Date().toUTCString(),
      });

      res.json(statusPageData);
    } catch (error) {
      const serviceError = handleServiceError(error, 'Status Page');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * POST /api/v2/status/incidents
 * Create a new incident for status page
 */
router.post(
  '/status/incidents',
  authenticateToken,
  requirePermission('incident.create'),
  criticalLimiter,
  [
    body('summary').isString().isLength({ min: 1, max: 500 }),
    body('description').optional().isString(),
    body('severity').isIn(['low', 'medium', 'high', 'critical']),
    body('status').isIn(['investigating', 'identified', 'monitoring']),
    body('affected_services').isArray(),
    body('affected_services.*').isUUID(),
    body('estimated_resolution').optional().isISO8601(),
    body('is_public').optional().isBoolean(),
  ],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const {
        summary,
        description,
        severity,
        status,
        affected_services,
        estimated_resolution,
        is_public = true,
      } = req.body;

      // 1. Create incident
      const incidentResult = await database.query(
        `
        INSERT INTO monitor_incidents (
          summary, description, severity, status, 
          estimated_resolution, is_public, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
        [summary, description, severity, status, estimated_resolution, is_public, req.user.id],
      );

      const incident = incidentResult.rows[0];

      // 2. Link affected services
      for (const serviceId of affected_services) {
        await database.query(
          `
          INSERT INTO incident_affected_services (incident_id, monitor_id)
          VALUES ($1, $2)
        `,
          [incident.id, serviceId],
        );

        // Update monitor status if incident is severe
        if (['high', 'critical'].includes(severity)) {
          await database.query(
            `
            UPDATE monitors 
            SET status = CASE 
              WHEN $1 = 'critical' THEN 'down'
              ELSE 'degraded'
            END,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `,
            [severity, serviceId],
          );
        }
      }

      // 3. Create initial incident update
      await database.query(
        `
        INSERT INTO incident_updates (
          incident_id, status, message, created_by
        ) VALUES ($1, $2, $3, $4)
      `,
        [incident.id, status, description || `Incident created: ${summary}`, req.user.id],
      );

      // 4. Send notifications
      try {
        await monitoringIntegrationService.sendIncidentNotifications(incident, {
          type: 'incident_created',
          affected_services: affected_services,
          created_by: req.user,
        });
      } catch (notificationError) {
        logger.warn(`Failed to send incident notifications:`, notificationError);
      }

      // 5. Create GoAlert alert if critical
      if (severity === 'critical' && affected_services.length > 0) {
        try {
          // Get service IDs for GoAlert
          const serviceQuery = await database.query(
            `
            SELECT goalert_service_id 
            FROM monitors 
            WHERE id = ANY($1) AND goalert_service_id IS NOT NULL
          `,
            [affected_services],
          );

          for (const service of serviceQuery.rows) {
            if (service.goalert_service_id) {
              await monitoringIntegrationService.createGoAlertAlert({
                service_id: service.goalert_service_id,
                summary: `Critical Incident: ${summary}`,
                details: description,
                severity: 'critical',
                source: 'nova_incident',
                metadata: {
                  nova_incident_id: incident.id,
                  status_page_incident: true,
                },
              });
            }
          }
        } catch (goalertError) {
          logger.warn(`Failed to create GoAlert alerts for incident:`, goalertError);
        }
      }

      // 6. Emit event
      eventBridge.emit('incident.created', {
        incident,
        affected_services,
        user: req.user,
        timestamp: new Date().toISOString(),
      });

      // 7. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          after_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          req.user.id,
          'create_incident',
          'incident',
          incident.id,
          'nova_monitoring',
          JSON.stringify(incident),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      res.status(201).json({
        success: true,
        incident,
        message: 'Incident created successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Incident Creation');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

/**
 * PUT /api/v2/status/incidents/:id/update
 * Update an incident status with a new message
 */
router.put(
  '/status/incidents/:id/update',
  authenticateToken,
  requirePermission('incident.update'),
  [
    param('id').isUUID(),
    body('status').isIn(['investigating', 'identified', 'monitoring', 'resolved']),
    body('message').isString().isLength({ min: 1, max: 2000 }),
    body('estimated_resolution').optional().isISO8601(),
  ],
  validateRequest,
  async (req, res) => {
    const transaction = await database.getTransaction();

    try {
      const { id } = req.params;
      const { status, message, estimated_resolution } = req.body;

      // 1. Get current incident
      const incidentResult = await database.query(
        `
        SELECT * FROM monitor_incidents WHERE id = $1
      `,
        [id],
      );

      if (incidentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found',
        });
      }

      const incident = incidentResult.rows[0];

      // 2. Update incident
      const updatedResult = await database.query(
        `
        UPDATE monitor_incidents 
        SET 
          status = $1,
          estimated_resolution = COALESCE($2, estimated_resolution),
          updated_at = CURRENT_TIMESTAMP,
          resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
        WHERE id = $3
        RETURNING *
      `,
        [status, estimated_resolution, id],
      );

      const updatedIncident = updatedResult.rows[0];

      // 3. Create incident update
      await database.query(
        `
        INSERT INTO incident_updates (
          incident_id, status, message, created_by
        ) VALUES ($1, $2, $3, $4)
      `,
        [id, status, message, req.user.id],
      );

      // 4. Update affected services if resolved
      if (status === 'resolved') {
        await database.query(
          `
          UPDATE monitors 
          SET 
            status = 'up',
            updated_at = CURRENT_TIMESTAMP
          WHERE id IN (
            SELECT monitor_id 
            FROM incident_affected_services 
            WHERE incident_id = $1
          )
        `,
          [id],
        );
      }

      // 5. Send notifications
      try {
        await monitoringIntegrationService.sendIncidentNotifications(updatedIncident, {
          type: 'incident_updated',
          status: status,
          message: message,
          updated_by: req.user,
        });
      } catch (notificationError) {
        logger.warn(`Failed to send incident update notifications:`, notificationError);
      }

      // 6. Emit event
      eventBridge.emit('incident.updated', {
        incident: updatedIncident,
        previous: incident,
        status,
        message,
        user: req.user,
        timestamp: new Date().toISOString(),
      });

      // 7. Audit log
      await database.query(
        `
        INSERT INTO integration_audit_log (
          user_id, action, resource_type, resource_id, service_name,
          before_state, after_state, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          req.user.id,
          'update_incident',
          'incident',
          id,
          'nova_monitoring',
          JSON.stringify(incident),
          JSON.stringify(updatedIncident),
          req.ip,
          req.get('User-Agent'),
        ],
      );

      await transaction.commit();

      res.json({
        success: true,
        incident: updatedIncident,
        message: 'Incident updated successfully',
      });
    } catch (error) {
      await transaction.rollback();
      const serviceError = handleServiceError(error, 'Incident Update');
      res.status(serviceError.status).json({
        success: false,
        error: serviceError.error,
        details: serviceError.details,
      });
    }
  },
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Helper functions for alert statistics
async function getAlertsBySeverity(whereConditions, params) {
  const query = `
    SELECT 
      severity,
      COUNT(*) as count
    FROM nova_alerts a
    LEFT JOIN monitors m ON a.monitor_id = m.id
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY severity
    ORDER BY 
      CASE severity 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END
  `;

  const result = await database.query(query, params);
  return result.rows.reduce((acc, row) => {
    acc[row.severity] = parseInt(row.count);
    return acc;
  }, {});
}

async function getAlertsByStatus(whereConditions, params) {
  const query = `
    SELECT 
      status,
      COUNT(*) as count
    FROM nova_alerts a
    LEFT JOIN monitors m ON a.monitor_id = m.id
    WHERE ${whereConditions.join(' AND ')}
    GROUP BY status
    ORDER BY status
  `;

  const result = await database.query(query, params);
  return result.rows.reduce((acc, row) => {
    acc[row.status] = parseInt(row.count);
    return acc;
  }, {});
}

export default router;
