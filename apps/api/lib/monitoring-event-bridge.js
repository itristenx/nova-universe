/**
 * Nova Monitoring Event Bridge
 *
 * Provides real-time bidirectional synchronization between Nova and
 * external monitoring services (GoAlert, Uptime Kuma). Handles:
 * - Event routing and transformation
 * - Data consistency across services
 * - Conflict resolution
 * - Real-time WebSocket updates
 * - Audit logging
 *
 * Part of the Nova Monitoring & Alerting Integration
 */

import EventEmitter from 'events';
import WebSocket from 'ws';
import { logger } from '../utils/logger.js';
import { database } from '../utils/database.js';
import { monitoringIntegrationService } from './monitoring-integration-service.js';

class MonitoringEventBridge extends EventEmitter {
  constructor() {
    super();
    this.wsConnections = new Map(); // tenant_id -> WebSocket connections
    this.syncQueues = new Map(); // service -> pending sync operations
    this.conflictHandlers = new Map();
    this.eventFilters = new Map();
    this.isStarted = false;

    this.setupEventHandlers();
    this.setupConflictHandlers();
    this.setupEventFilters();
  }

  /**
   * Start the event bridge service
   */
  async start() {
    if (this.isStarted) {
      return;
    }

    try {
      logger.info('Starting Nova Monitoring Event Bridge...');

      // Initialize sync queues for each service
      this.syncQueues.set('goalert', []);
      this.syncQueues.set('uptime_kuma', []);
      this.syncQueues.set('nova', []);

      // Start periodic sync operations
      this.startPeriodicSync();

      // Start WebSocket server for real-time updates
      this.startWebSocketServer();

      // Register for external service webhooks
      await this.registerWebhooks();

      this.isStarted = true;
      logger.info('Nova Monitoring Event Bridge started successfully');
    } catch (error) {
      logger.error('Failed to start Monitoring Event Bridge:', error);
      throw error;
    }
  }

  /**
   * Stop the event bridge service
   */
  async stop() {
    if (!this.isStarted) {
      return;
    }

    try {
      logger.info('Stopping Nova Monitoring Event Bridge...');

      // Close all WebSocket connections
      for (const connections of this.wsConnections.values()) {
        connections.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close();
          }
        });
      }
      this.wsConnections.clear();

      // Stop periodic sync
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }

      // Unregister webhooks
      await this.unregisterWebhooks();

      this.isStarted = false;
      logger.info('Nova Monitoring Event Bridge stopped');
    } catch (error) {
      logger.error('Error stopping Monitoring Event Bridge:', error);
    }
  }

  // =============================================================================
  // EVENT HANDLING
  // =============================================================================

  /**
   * Setup core event handlers for different resource types
   */
  setupEventHandlers() {
    // Monitor events
    this.on('monitor.created', this.handleMonitorCreated.bind(this));
    this.on('monitor.updated', this.handleMonitorUpdated.bind(this));
    this.on('monitor.deleted', this.handleMonitorDeleted.bind(this));
    this.on('monitor.check_result', this.handleMonitorCheckResult.bind(this));

    // Alert events
    this.on('alert.created', this.handleAlertCreated.bind(this));
    this.on('alert.acknowledged', this.handleAlertAcknowledged.bind(this));
    this.on('alert.resolved', this.handleAlertResolved.bind(this));
    this.on('alert.escalated', this.handleAlertEscalated.bind(this));

    // On-call events
    this.on('oncall.schedule_created', this.handleScheduleCreated.bind(this));
    this.on('oncall.schedule_updated', this.handleScheduleUpdated.bind(this));
    this.on('oncall.override_created', this.handleOverrideCreated.bind(this));

    // Incident events
    this.on('incident.created', this.handleIncidentCreated.bind(this));
    this.on('incident.updated', this.handleIncidentUpdated.bind(this));
    this.on('incident.resolved', this.handleIncidentResolved.bind(this));

    // External service events
    this.on('external.goalert.alert', this.handleGoAlertEvent.bind(this));
    this.on('external.goalert.schedule', this.handleGoAlertScheduleEvent.bind(this));
    this.on('external.uptime_kuma.check', this.handleUptimeKumaEvent.bind(this));
    this.on('external.uptime_kuma.incident', this.handleUptimeKumaIncidentEvent.bind(this));

    // Sync events
    this.on('sync.conflict', this.handleSyncConflict.bind(this));
    this.on('sync.error', this.handleSyncError.bind(this));
  }

  /**
   * Setup conflict resolution handlers
   */
  setupConflictHandlers() {
    // Monitor conflicts: Nova wins for configuration, external wins for status
    this.conflictHandlers.set('monitor', async (novaData, externalData, _source) => {
      return {
        name: novaData.name,
        description: novaData.description,
        url: novaData.url,
        interval: novaData.interval,
        timeout: novaData.timeout,
        status: externalData.status,
        last_check: externalData.last_check,
        response_time: externalData.response_time,
        resolution: 'merge',
        source: 'bridge_merge',
      };
    });

    // Alert conflicts: Most recent update wins
    this.conflictHandlers.set('alert', async (novaData, externalData, source) => {
      const novaUpdated = new Date(novaData.updated_at || novaData.created_at);
      const externalUpdated = new Date(externalData.updated_at || externalData.created_at);

      if (novaUpdated >= externalUpdated) {
        return {
          ...novaData,
          resolution: 'nova_wins',
          source: 'nova',
        };
      } else {
        return {
          ...externalData,
          resolution: 'external_wins',
          source: source,
        };
      }
    });

    // Schedule conflicts: Nova wins for configuration
    this.conflictHandlers.set('schedule', async (novaData, externalData, _source) => {
      return {
        ...novaData,
        external_id: externalData.id,
        resolution: 'nova_wins',
        source: 'nova',
      };
    });
  }

  /**
   * Setup event filters to prevent infinite loops
   */
  setupEventFilters() {
    this.eventFilters.set('prevent_loops', (event, data) => {
      // Don't sync events that originated from sync operations
      if (data.source === 'sync' || data.source === 'bridge_sync') {
        return false;
      }
      return true;
    });

    this.eventFilters.set('tenant_isolation', (event, data) => {
      // Ensure events are properly scoped to tenants
      return data.tenant_id !== undefined;
    });
  }

  // =============================================================================
  // MONITOR EVENTS
  // =============================================================================

  async handleMonitorCreated(data) {
    try {
      const { monitor, user, timestamp } = data;

      // Apply event filters
      if (!this.applyEventFilters('monitor.created', data)) {
        return;
      }

      // Create in external services based on monitor type
      if (monitor.type === 'http' || monitor.type === 'https') {
        await this.syncMonitorToUptimeKuma(monitor, 'create');
      }

      if (monitor.goalert_service_id) {
        await this.syncMonitorToGoAlert(monitor, 'create');
      }

      // Broadcast to WebSocket clients
      this.broadcastToClients(monitor.tenant_id, 'monitor.created', {
        monitor,
        timestamp,
      });

      // Log event
      await this.logIntegrationEvent('monitor.created', monitor.id, {
        user_id: user.id,
        action: 'create',
        timestamp,
      });
    } catch (error) {
      logger.error('Error handling monitor created event:', error);
      this.emit('sync.error', { event: 'monitor.created', error, data });
    }
  }

  async handleMonitorUpdated(data) {
    try {
      const { monitor, previous, user, timestamp } = data;

      if (!this.applyEventFilters('monitor.updated', data)) {
        return;
      }

      // Sync configuration changes to external services
      if (this.hasSignificantChanges(monitor, previous, ['name', 'url', 'interval', 'timeout'])) {
        if (monitor.uptime_kuma_id) {
          await this.syncMonitorToUptimeKuma(monitor, 'update');
        }
        if (monitor.goalert_service_id) {
          await this.syncMonitorToGoAlert(monitor, 'update');
        }
      }

      // Broadcast to clients
      this.broadcastToClients(monitor.tenant_id, 'monitor.updated', {
        monitor,
        previous,
        timestamp,
      });

      await this.logIntegrationEvent('monitor.updated', monitor.id, {
        user_id: user.id,
        action: 'update',
        changes: this.getFieldChanges(monitor, previous),
        timestamp,
      });
    } catch (error) {
      logger.error('Error handling monitor updated event:', error);
      this.emit('sync.error', { event: 'monitor.updated', error, data });
    }
  }

  async handleMonitorDeleted(data) {
    try {
      const { monitor, user, timestamp } = data;

      if (!this.applyEventFilters('monitor.deleted', data)) {
        return;
      }

      // Remove from external services
      if (monitor.uptime_kuma_id) {
        await this.removeMonitorFromUptimeKuma(monitor.uptime_kuma_id);
      }
      if (monitor.goalert_service_id) {
        await this.removeMonitorFromGoAlert(monitor.goalert_service_id);
      }

      // Broadcast to clients
      this.broadcastToClients(monitor.tenant_id, 'monitor.deleted', {
        monitor_id: monitor.id,
        timestamp,
      });

      await this.logIntegrationEvent('monitor.deleted', monitor.id, {
        user_id: user.id,
        action: 'delete',
        timestamp,
      });
    } catch (error) {
      logger.error('Error handling monitor deleted event:', error);
      this.emit('sync.error', { event: 'monitor.deleted', error, data });
    }
  }

  async handleMonitorCheckResult(data) {
    try {
      const { monitor_id, status, response_time, checked_at, details } = data;

      // Store check result in Nova
      await database.query(
        `
        INSERT INTO monitor_checks (
          monitor_id, status, response_time, checked_at, details
        ) VALUES ($1, $2, $3, $4, $5)
      `,
        [monitor_id, status, response_time, checked_at, JSON.stringify(details)],
      );

      // Update monitor status
      await database.query(
        `
        UPDATE monitors 
        SET 
          status = $1,
          last_check = $2,
          response_time = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `,
        [status, checked_at, response_time, monitor_id],
      );

      // Create alert if monitor is down
      if (status !== 'up') {
        await this.createMonitorAlert(monitor_id, status, details);
      }

      // Get monitor for broadcasting
      const monitorResult = await database.query('SELECT * FROM monitors WHERE id = $1', [
        monitor_id,
      ]);

      if (monitorResult.rows.length > 0) {
        const monitor = monitorResult.rows[0];

        this.broadcastToClients(monitor.tenant_id, 'monitor.check_result', {
          monitor_id,
          status,
          response_time,
          checked_at,
          details,
        });
      }
    } catch (error) {
      logger.error('Error handling monitor check result:', error);
    }
  }

  // =============================================================================
  // ALERT EVENTS
  // =============================================================================

  async handleAlertCreated(data) {
    try {
      const { alert, user, timestamp } = data;

      if (!this.applyEventFilters('alert.created', data)) {
        return;
      }

      // Create in GoAlert if not already created
      if (!alert.goalert_alert_id && (alert.severity === 'critical' || alert.escalate)) {
        try {
          const goalertAlert = await monitoringIntegrationService.createGoAlertAlert({
            summary: alert.summary,
            details: alert.description,
            severity: alert.severity,
            service_id: alert.service_id,
            metadata: {
              nova_alert_id: alert.id,
              created_via: 'nova_bridge',
            },
          });

          // Update Nova alert with GoAlert ID
          await database.query(
            `
            UPDATE nova_alerts 
            SET goalert_alert_id = $1
            WHERE id = $2
          `,
            [goalertAlert.id, alert.id],
          );
        } catch (goalertError) {
          logger.warn(`Failed to create GoAlert alert for ${alert.id}:`, goalertError);
        }
      }

      // Broadcast to clients
      this.broadcastToClients(alert.tenant_id || user.tenant_id, 'alert.created', {
        alert,
        timestamp,
      });

      await this.logIntegrationEvent('alert.created', alert.id, {
        user_id: user.id,
        severity: alert.severity,
        timestamp,
      });
    } catch (error) {
      logger.error('Error handling alert created event:', error);
      this.emit('sync.error', { event: 'alert.created', error, data });
    }
  }

  async handleAlertAcknowledged(data) {
    try {
      const { alert, previous, user, message, timestamp } = data;

      if (!this.applyEventFilters('alert.acknowledged', data)) {
        return;
      }

      // Acknowledge in GoAlert
      if (alert.goalert_alert_id) {
        try {
          await monitoringIntegrationService.acknowledgeGoAlertAlert(alert.goalert_alert_id, {
            user_id: user.goalert_user_id || user.email,
            message: message || 'Acknowledged via Nova',
          });
        } catch (goalertError) {
          logger.warn(
            `Failed to acknowledge GoAlert alert ${alert.goalert_alert_id}:`,
            goalertError,
          );
        }
      }

      this.broadcastToClients(alert.tenant_id || user.tenant_id, 'alert.acknowledged', {
        alert,
        previous,
        user: {
          id: user.id,
          name: user.first_name + ' ' + user.last_name,
          email: user.email,
        },
        message,
        timestamp,
      });

      await this.logIntegrationEvent('alert.acknowledged', alert.id, {
        user_id: user.id,
        message,
        timestamp,
      });
    } catch (error) {
      logger.error('Error handling alert acknowledged event:', error);
      this.emit('sync.error', { event: 'alert.acknowledged', error, data });
    }
  }

  async handleAlertResolved(data) {
    try {
      const { alert, previous, user, resolution_notes, root_cause, timestamp } = data;

      if (!this.applyEventFilters('alert.resolved', data)) {
        return;
      }

      // Resolve in GoAlert
      if (alert.goalert_alert_id) {
        try {
          await monitoringIntegrationService.resolveGoAlertAlert(alert.goalert_alert_id, {
            user_id: user.goalert_user_id || user.email,
            message: resolution_notes || 'Resolved via Nova',
          });
        } catch (goalertError) {
          logger.warn(`Failed to resolve GoAlert alert ${alert.goalert_alert_id}:`, goalertError);
        }
      }

      this.broadcastToClients(alert.tenant_id || user.tenant_id, 'alert.resolved', {
        alert,
        previous,
        user: {
          id: user.id,
          name: user.first_name + ' ' + user.last_name,
          email: user.email,
        },
        resolution_notes,
        root_cause,
        timestamp,
      });

      await this.logIntegrationEvent('alert.resolved', alert.id, {
        user_id: user.id,
        resolution_notes,
        root_cause,
        timestamp,
      });
    } catch (error) {
      logger.error('Error handling alert resolved event:', error);
      this.emit('sync.error', { event: 'alert.resolved', error, data });
    }
  }

  // =============================================================================
  // EXTERNAL SERVICE EVENT HANDLERS
  // =============================================================================

  async handleGoAlertEvent(data) {
    try {
      const { alert, action, timestamp } = data;

      // Find corresponding Nova alert
      const novaAlertResult = await database.query(
        `
        SELECT * FROM nova_alerts 
        WHERE goalert_alert_id = $1
      `,
        [alert.id],
      );

      if (novaAlertResult.rows.length === 0) {
        // Create new Nova alert from GoAlert
        await this.createNovaAlertFromGoAlert(alert);
        return;
      }

      const novaAlert = novaAlertResult.rows[0];

      // Sync status changes
      if (action === 'acknowledged' && novaAlert.status === 'active') {
        await database.query(
          `
          UPDATE nova_alerts 
          SET 
            status = 'acknowledged',
            acknowledged_at = $1,
            acknowledged_by = (
              SELECT id FROM users 
              WHERE email = $2 OR goalert_user_id = $2
              LIMIT 1
            ),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `,
          [timestamp, alert.acknowledged_by, novaAlert.id],
        );

        // Broadcast acknowledgment
        this.broadcastToClients(novaAlert.tenant_id, 'alert.acknowledged', {
          alert_id: novaAlert.id,
          acknowledged_by: alert.acknowledged_by,
          timestamp,
          source: 'goalert',
        });
      }

      if (action === 'resolved' && novaAlert.status !== 'resolved') {
        await database.query(
          `
          UPDATE nova_alerts 
          SET 
            status = 'resolved',
            resolved_at = $1,
            resolved_by = (
              SELECT id FROM users 
              WHERE email = $2 OR goalert_user_id = $2
              LIMIT 1
            ),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `,
          [timestamp, alert.resolved_by, novaAlert.id],
        );

        // Broadcast resolution
        this.broadcastToClients(novaAlert.tenant_id, 'alert.resolved', {
          alert_id: novaAlert.id,
          resolved_by: alert.resolved_by,
          timestamp,
          source: 'goalert',
        });
      }

      await this.logIntegrationEvent('external.goalert.alert', novaAlert.id, {
        action,
        goalert_alert_id: alert.id,
        timestamp,
      });
    } catch (error) {
      logger.error('Error handling GoAlert event:', error);
      this.emit('sync.error', { event: 'external.goalert.alert', error, data });
    }
  }

  async handleUptimeKumaEvent(data) {
    try {
      const { monitor, status, response_time, timestamp } = data;

      // Find corresponding Nova monitor
      const novaMonitorResult = await database.query(
        `
        SELECT * FROM monitors 
        WHERE uptime_kuma_id = $1
      `,
        [monitor.id],
      );

      if (novaMonitorResult.rows.length === 0) {
        logger.warn(`No Nova monitor found for Uptime Kuma monitor ${monitor.id}`);
        return;
      }

      const novaMonitor = novaMonitorResult.rows[0];

      // Process check result
      await this.handleMonitorCheckResult({
        monitor_id: novaMonitor.id,
        status: status,
        response_time: response_time,
        checked_at: timestamp,
        details: {
          source: 'uptime_kuma',
          uptime_kuma_id: monitor.id,
        },
      });

      await this.logIntegrationEvent('external.uptime_kuma.check', novaMonitor.id, {
        status,
        response_time,
        uptime_kuma_id: monitor.id,
        timestamp,
      });
    } catch (error) {
      logger.error('Error handling Uptime Kuma event:', error);
      this.emit('sync.error', { event: 'external.uptime_kuma.check', error, data });
    }
  }

  // =============================================================================
  // SYNCHRONIZATION METHODS
  // =============================================================================

  async syncMonitorToUptimeKuma(monitor, action) {
    try {
      if (action === 'create') {
        const uptimeKumaMonitor = await monitoringIntegrationService.createUptimeKumaMonitor({
          name: monitor.name,
          type: monitor.type,
          url: monitor.url,
          interval: monitor.interval,
          timeout: monitor.timeout,
          tags: [`nova:${monitor.id}`, `tenant:${monitor.tenant_id}`],
        });

        // Update Nova monitor with Uptime Kuma ID
        await database.query(
          `
          UPDATE monitors 
          SET uptime_kuma_id = $1
          WHERE id = $2
        `,
          [uptimeKumaMonitor.id, monitor.id],
        );
      } else if (action === 'update' && monitor.uptime_kuma_id) {
        await monitoringIntegrationService.updateUptimeKumaMonitor(monitor.uptime_kuma_id, {
          name: monitor.name,
          url: monitor.url,
          interval: monitor.interval,
          timeout: monitor.timeout,
        });
      }
    } catch (error) {
      logger.error(`Failed to sync monitor ${monitor.id} to Uptime Kuma:`, error);
      throw error;
    }
  }

  async syncMonitorToGoAlert(monitor, action) {
    try {
      if (action === 'create' && monitor.goalert_service_id) {
        // GoAlert doesn't have monitors per se, but we can create/update heartbeat checks
        await monitoringIntegrationService.createGoAlertHeartbeat({
          service_id: monitor.goalert_service_id,
          name: monitor.name,
          timeout: monitor.timeout,
          metadata: {
            nova_monitor_id: monitor.id,
            monitor_url: monitor.url,
          },
        });
      }
    } catch (error) {
      logger.error(`Failed to sync monitor ${monitor.id} to GoAlert:`, error);
      throw error;
    }
  }

  async createMonitorAlert(monitorId, status, details) {
    try {
      const monitorResult = await database.query('SELECT * FROM monitors WHERE id = $1', [
        monitorId,
      ]);

      if (monitorResult.rows.length === 0) {
        return;
      }

      const monitor = monitorResult.rows[0];

      // Check if there's already an active alert for this monitor
      const existingAlertResult = await database.query(
        `
        SELECT id FROM nova_alerts 
        WHERE monitor_id = $1 AND status IN ('active', 'acknowledged')
        ORDER BY created_at DESC
        LIMIT 1
      `,
        [monitorId],
      );

      if (existingAlertResult.rows.length > 0) {
        // Update existing alert instead of creating new one
        return;
      }

      // Create new alert
      const severity = status === 'down' ? 'high' : 'medium';
      const summary = `Monitor ${monitor.name} is ${status}`;

      const alertResult = await database.query(
        `
        INSERT INTO nova_alerts (
          summary, description, severity, monitor_id, status, source
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [
          summary,
          `Monitor check failed: ${JSON.stringify(details)}`,
          severity,
          monitorId,
          'active',
          'monitoring',
        ],
      );

      const alert = alertResult.rows[0];

      // Emit alert created event
      this.emit('alert.created', {
        alert,
        user: { id: null, tenant_id: monitor.tenant_id },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error creating monitor alert:', error);
    }
  }

  // =============================================================================
  // WEBSOCKET REAL-TIME UPDATES
  // =============================================================================

  startWebSocketServer() {
    // This would typically be integrated with the main Express server
    // For now, we'll use the event broadcasting system
    logger.info('WebSocket real-time update system initialized');
  }

  /**
   * Add WebSocket connection for a tenant
   */
  addWebSocketConnection(tenantId, ws) {
    if (!this.wsConnections.has(tenantId)) {
      this.wsConnections.set(tenantId, new Set());
    }
    this.wsConnections.get(tenantId).add(ws);

    ws.on('close', () => {
      this.wsConnections.get(tenantId)?.delete(ws);
    });
  }

  /**
   * Broadcast event to all WebSocket clients for a tenant
   */
  broadcastToClients(tenantId, eventType, data) {
    if (!tenantId || !this.wsConnections.has(tenantId)) {
      return;
    }

    const connections = this.wsConnections.get(tenantId);
    const message = JSON.stringify({
      type: eventType,
      data: data,
      timestamp: new Date().toISOString(),
    });

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          logger.warn('Failed to send WebSocket message:', error);
          connections.delete(ws);
        }
      }
    });
  }

  // =============================================================================
  // PERIODIC SYNC
  // =============================================================================

  startPeriodicSync() {
    // Run full sync every 5 minutes
    this.syncInterval = setInterval(
      async () => {
        try {
          await this.performFullSync();
        } catch (error) {
          logger.error('Error in periodic sync:', error);
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes

    logger.info('Periodic sync started (5 minute intervals)');
  }

  async performFullSync() {
    try {
      logger.debug('Starting periodic full sync...');

      // Sync monitor statuses from Uptime Kuma
      await this.syncMonitorStatusesFromUptimeKuma();

      // Sync alert statuses from GoAlert
      await this.syncAlertStatusesFromGoAlert();

      // Sync on-call schedules from GoAlert
      await this.syncOnCallSchedulesFromGoAlert();

      // Clean up stale data
      await this.cleanupStaleData();

      logger.debug('Periodic full sync completed');
    } catch (error) {
      logger.error('Error in full sync:', error);
    }
  }

  async syncMonitorStatusesFromUptimeKuma() {
    try {
      // Get all Nova monitors with Uptime Kuma IDs
      const monitorsResult = await database.query(`
        SELECT id, uptime_kuma_id, tenant_id 
        FROM monitors 
        WHERE uptime_kuma_id IS NOT NULL AND is_active = true
      `);

      for (const monitor of monitorsResult.rows) {
        try {
          const ukStatus = await monitoringIntegrationService.getUptimeKumaMonitorStatus(
            monitor.uptime_kuma_id,
          );

          if (ukStatus) {
            await database.query(
              `
              UPDATE monitors 
              SET 
                status = $1,
                last_check = $2,
                response_time = $3,
                uptime_percentage = $4,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = $5
            `,
              [
                ukStatus.status,
                ukStatus.last_check,
                ukStatus.response_time,
                ukStatus.uptime_percentage,
                monitor.id,
              ],
            );
          }
        } catch (error) {
          logger.warn(`Failed to sync status for monitor ${monitor.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error syncing monitor statuses from Uptime Kuma:', error);
    }
  }

  async syncAlertStatusesFromGoAlert() {
    try {
      // Get all Nova alerts with GoAlert IDs
      const alertsResult = await database.query(`
        SELECT id, goalert_alert_id 
        FROM nova_alerts 
        WHERE goalert_alert_id IS NOT NULL AND status IN ('active', 'acknowledged')
      `);

      for (const alert of alertsResult.rows) {
        try {
          const goalertAlert = await monitoringIntegrationService.getGoAlertAlert(
            alert.goalert_alert_id,
          );

          if (goalertAlert && goalertAlert.status !== alert.status) {
            await database.query(
              `
              UPDATE nova_alerts 
              SET 
                status = $1,
                updated_at = CURRENT_TIMESTAMP,
                acknowledged_at = CASE WHEN $1 = 'acknowledged' THEN COALESCE(acknowledged_at, CURRENT_TIMESTAMP) ELSE acknowledged_at END,
                resolved_at = CASE WHEN $1 = 'resolved' THEN COALESCE(resolved_at, CURRENT_TIMESTAMP) ELSE resolved_at END
              WHERE id = $2
            `,
              [goalertAlert.status, alert.id],
            );
          }
        } catch (error) {
          logger.warn(`Failed to sync status for alert ${alert.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error syncing alert statuses from GoAlert:', error);
    }
  }

  async syncOnCallSchedulesFromGoAlert() {
    try {
      // Get all Nova schedules with GoAlert IDs
      const schedulesResult = await database.query(`
        SELECT id, goalert_schedule_id, tenant_id
        FROM oncall_schedules 
        WHERE goalert_schedule_id IS NOT NULL AND is_active = true
      `);

      for (const schedule of schedulesResult.rows) {
        try {
          const goalertSchedule = await monitoringIntegrationService.getGoAlertSchedule(
            schedule.goalert_schedule_id,
          );

          if (goalertSchedule) {
            // Sync current on-call assignments
            await this.syncOnCallAssignments(schedule.id, goalertSchedule);
          }
        } catch (error) {
          logger.warn(`Failed to sync schedule ${schedule.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('Error syncing on-call schedules from GoAlert:', error);
    }
  }

  async syncOnCallAssignments(scheduleId, _goalertSchedule) {
    // This would sync the current on-call assignments from GoAlert
    // Implementation depends on GoAlert API structure
    logger.debug(`Syncing on-call assignments for schedule ${scheduleId}`);
  }

  async cleanupStaleData() {
    try {
      // Remove old integration events (keep last 30 days)
      await database.query(`
        DELETE FROM integration_events 
        WHERE created_at < CURRENT_DATE - INTERVAL '30 days'
      `);

      // Remove old monitor checks (keep last 90 days)
      await database.query(`
        DELETE FROM monitor_checks 
        WHERE checked_at < CURRENT_DATE - INTERVAL '90 days'
      `);

      logger.debug('Stale data cleanup completed');
    } catch (error) {
      logger.error('Error cleaning up stale data:', error);
    }
  }

  // =============================================================================
  // WEBHOOK REGISTRATION
  // =============================================================================

  async registerWebhooks() {
    try {
      // Register GoAlert webhooks
      const goalertWebhookUrl = `${process.env.NOVA_BASE_URL}/api/webhooks/goalert`;
      await monitoringIntegrationService.registerGoAlertWebhook(goalertWebhookUrl);

      // Register Uptime Kuma webhooks
      const uptimeKumaWebhookUrl = `${process.env.NOVA_BASE_URL}/api/webhooks/uptime-kuma`;
      await monitoringIntegrationService.registerUptimeKumaWebhook(uptimeKumaWebhookUrl);

      logger.info('External service webhooks registered successfully');
    } catch (error) {
      logger.error('Error registering webhooks:', error);
    }
  }

  async unregisterWebhooks() {
    try {
      await monitoringIntegrationService.unregisterGoAlertWebhook();
      await monitoringIntegrationService.unregisterUptimeKumaWebhook();
      logger.info('External service webhooks unregistered');
    } catch (error) {
      logger.error('Error unregistering webhooks:', error);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  applyEventFilters(eventName, data) {
    for (const [filterName, filterFunc] of this.eventFilters) {
      if (!filterFunc(eventName, data)) {
        logger.debug(`Event ${eventName} filtered out by ${filterName}`);
        return false;
      }
    }
    return true;
  }

  hasSignificantChanges(current, previous, fields) {
    return fields.some((field) => current[field] !== previous[field]);
  }

  getFieldChanges(current, previous) {
    const changes = {};
    for (const key in current) {
      if (current[key] !== previous[key]) {
        changes[key] = {
          from: previous[key],
          to: current[key],
        };
      }
    }
    return changes;
  }

  async logIntegrationEvent(eventType, resourceId, metadata) {
    try {
      await database.query(
        `
        INSERT INTO integration_events (
          event_type, resource_id, metadata, created_at
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      `,
        [eventType, resourceId, JSON.stringify(metadata)],
      );
    } catch (error) {
      logger.error('Error logging integration event:', error);
    }
  }

  // Conflict resolution methods
  async handleSyncConflict(data) {
    const { resource_type, nova_data, external_data, source } = data;

    if (this.conflictHandlers.has(resource_type)) {
      try {
        const resolution = await this.conflictHandlers.get(resource_type)(
          nova_data,
          external_data,
          source,
        );

        logger.info(`Conflict resolved for ${resource_type}:`, resolution);
        return resolution;
      } catch (error) {
        logger.error(`Error resolving conflict for ${resource_type}:`, error);
        throw error;
      }
    } else {
      logger.warn(`No conflict handler found for resource type: ${resource_type}`);
      return nova_data; // Default to Nova data
    }
  }

  async handleSyncError(data) {
    const { event, error, data: eventData } = data;

    logger.error(`Sync error in event ${event}:`, error);

    // Store error for later retry
    await database.query(
      `
      INSERT INTO integration_sync_errors (
        event_type, error_message, event_data, created_at
      ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `,
      [event, error.message, JSON.stringify(eventData)],
    );
  }

  async createNovaAlertFromGoAlert(goalertAlert) {
    try {
      // Find the associated service/monitor
      const monitorResult = await database.query(
        `
        SELECT * FROM monitors 
        WHERE goalert_service_id = $1
        LIMIT 1
      `,
        [goalertAlert.service_id],
      );

      const monitor = monitorResult.rows[0];

      const alertResult = await database.query(
        `
        INSERT INTO nova_alerts (
          summary, description, severity, monitor_id, status,
          goalert_alert_id, service_id, source, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
        [
          goalertAlert.summary,
          goalertAlert.details,
          goalertAlert.severity || 'medium',
          monitor?.id,
          goalertAlert.status,
          goalertAlert.id,
          goalertAlert.service_id,
          'goalert',
          goalertAlert.created_at,
        ],
      );

      const novaAlert = alertResult.rows[0];

      // Broadcast new alert
      if (monitor) {
        this.broadcastToClients(monitor.tenant_id, 'alert.created', {
          alert: novaAlert,
          source: 'goalert',
          timestamp: new Date().toISOString(),
        });
      }

      return novaAlert;
    } catch (error) {
      logger.error('Error creating Nova alert from GoAlert:', error);
      throw error;
    }
  }
}

// Create singleton instance
const monitoringEventBridge = new MonitoringEventBridge();

export { monitoringEventBridge };
export default monitoringEventBridge;
