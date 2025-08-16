/**
 * Nova Sentinel Integration for AI Fabric
 *
 * Integrates Nova AI Fabric with the existing Nova Sentinel monitoring system.
 * Provides AI components access to monitoring data and ability to create alerts,
 * while feeding AI metrics and errors into the existing monitoring infrastructure.
 *
 * Features:
 * - AI tool access to Nova Sentinel monitoring data
 * - Automated monitor creation for AI components
 * - AI error and performance data integration
 * - MCP tool registration for ChatGPT access
 * - Real-time incident correlation with AI events
 * - Integration with existing Nova infrastructure
 */

import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { aiMonitoringSystem } from './ai-monitoring.js';
import { aiFabric } from './ai-fabric.js';
import axios from 'axios';
import crypto from 'crypto';

// Sentinel Integration Types
export interface SentinelMonitor {
  id: string;
  name: string;
  type: 'ai_service' | 'ai_provider' | 'ai_endpoint' | 'rag_service' | 'custom_model';
  component: string; // AI Fabric component name
  providerId?: string; // For AI provider monitoring
  url?: string;
  checkInterval: number;
  timeout: number;
  retryAttempts: number;
  config: {
    healthEndpoint?: string;
    expectedResponse?: any;
    alertThresholds: {
      responseTime: number;
      errorRate: number;
      availability: number;
    };
  };
  tenant_id?: string;
  isActive: boolean;
  lastCheck?: Date;
  status: 'up' | 'down' | 'unknown' | 'maintenance';
  uptime24h?: number;
  avgResponseTime?: number;
}

export interface SentinelIncident {
  id: string;
  monitorId: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved';
  summary: string;
  description: string;
  startedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  ticketId?: string;
  escalatedToGoAlert?: boolean;
  aiAnalysis?: {
    rootCause?: string;
    impact?: string;
    recommendations?: string[];
    confidence: number;
  };
}

export interface SentinelAlert {
  id: string;
  type:
    | 'ai_failure'
    | 'performance_degradation'
    | 'provider_outage'
    | 'quota_exceeded'
    | 'security_incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  message: string;
  metrics?: Record<string, any>;
  timestamp: Date;
  escalated: boolean;
  resolved: boolean;
}

/**
 * Nova Sentinel Integration System
 *
 * Integrates with the existing Nova Sentinel service to provide AI monitoring tools
 */
export class NovaSentinelIntegration extends EventEmitter {
  private monitors: Map<string, SentinelMonitor> = new Map();
  private incidents: Map<string, SentinelIncident> = new Map();
  private alerts: Map<string, SentinelAlert> = new Map();

  private isInitialized = false;
  private sentinelApiUrl = process.env.NOVA_SENTINEL_API_URL || 'http://localhost:3001/api';
  private novaCoreApiUrl = process.env.NOVA_API_BASE_URL || 'http://localhost:3000/api';
  private apiKey = process.env.NOVA_SENTINEL_API_KEY || '';

  // Integration configuration
  private config = {
    enableAIMonitoring: true,
    enableMCPTools: true,
    autoCreateMonitors: true,
    escalationThresholds: {
      aiResponseTime: 15000, // 15 seconds
      aiErrorRate: 0.1, // 10%
      aiAvailability: 0.95, // 95%
    },
    mcpToolConfig: {
      toolPrefix: 'nova.sentinel',
      enabledTools: [
        'get_monitors',
        'get_incidents',
        'create_monitor',
        'create_incident',
        'get_status_page',
        'search_logs',
      ],
    },
  };

  constructor() {
    super();

    // Listen to AI Fabric events
    if (aiFabric) {
      aiFabric.on('providerHealthChanged', this.handleProviderHealthChange.bind(this));
      aiFabric.on('requestFailed', this.handleAIRequestFailure.bind(this));
      aiFabric.on('performanceDegraded', this.handlePerformanceDegradation.bind(this));
    }

    // Listen to AI Monitoring events
    if (aiMonitoringSystem) {
      aiMonitoringSystem.on('securityAlert', this.handleSecurityAlert.bind(this));
      aiMonitoringSystem.on('metricRecorded', this.handleMetricRecorded.bind(this));
      aiMonitoringSystem.on('auditEventRecorded', this.handleAuditEvent.bind(this));
    }
  }

  /**
   * Initialize the Sentinel integration
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Nova Sentinel Integration...');

      // Test connectivity to existing Nova Sentinel service
      await this.testSentinelConnectivity();

      // Register AI components as monitors in existing Sentinel
      if (this.config.autoCreateMonitors) {
        await this.registerAIComponentMonitors();
      }

      // Register MCP tools for AI access
      if (this.config.enableMCPTools) {
        await this.registerMCPTools();
      }

      // Set up event listeners for AI monitoring data
      this.setupAIEventListeners();

      // Sync with existing Sentinel data
      await this.syncWithSentinel();

      this.isInitialized = true;
      this.emit('initialized');

      logger.info('Nova Sentinel Integration initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Sentinel Integration:', error);
      throw error;
    }
  }

  /**
   * Register a new AI component for monitoring
   */
  async registerAIMonitor(
    monitor: Omit<SentinelMonitor, 'id' | 'lastCheck' | 'status'>,
  ): Promise<string> {
    const monitorId = crypto.randomUUID();
    const fullMonitor: SentinelMonitor = {
      ...monitor,
      id: monitorId,
      status: 'unknown',
    };

    this.monitors.set(monitorId, fullMonitor);

    // Create corresponding monitor in Sentinel
    await this.createSentinelMonitor(fullMonitor);

    logger.info('AI monitor registered', {
      monitorId,
      component: monitor.component,
      type: monitor.type,
    });

    this.emit('monitorRegistered', fullMonitor);
    return monitorId;
  }

  /**
   * Update monitor status
   */
  async updateMonitorStatus(
    monitorId: string,
    status: SentinelMonitor['status'],
    metrics?: Record<string, any>,
  ): Promise<void> {
    const monitor = this.monitors.get(monitorId);
    if (!monitor) {
      logger.warn('Attempt to update unknown monitor', { monitorId });
      return;
    }

    const previousStatus = monitor.status;
    monitor.status = status;
    monitor.lastCheck = new Date();

    if (metrics) {
      monitor.avgResponseTime = metrics.responseTime;
      monitor.uptime24h = metrics.uptime;
    }

    this.monitors.set(monitorId, monitor);

    // Check for status changes that require incident management
    if (previousStatus !== status) {
      await this.handleStatusChange(monitor, previousStatus, status);
    }

    // Update Sentinel via API
    await this.updateSentinelMonitor(monitor);

    this.emit('monitorStatusUpdated', { monitor, previousStatus, metrics });
  }

  /**
   * Create an incident
   */
  async createIncident(incident: Omit<SentinelIncident, 'id'>): Promise<string> {
    const incidentId = crypto.randomUUID();
    const fullIncident: SentinelIncident = {
      ...incident,
      id: incidentId,
    };

    this.incidents.set(incidentId, fullIncident);

    // Generate AI analysis if enabled
    if (this.config.enableAIAnalysis && aiFabric) {
      try {
        const analysis = await this.generateAIAnalysis(fullIncident);
        fullIncident.aiAnalysis = analysis;
      } catch (error) {
        logger.warn('Failed to generate AI analysis for incident', {
          incidentId,
          error: error.message,
        });
      }
    }

    // Create incident in Sentinel
    await this.createSentinelIncident(fullIncident);

    // Create ticket if configured
    if (this.config.createTicketsForIncidents) {
      try {
        const ticketId = await this.createIncidentTicket(fullIncident);
        fullIncident.ticketId = ticketId;
      } catch (error) {
        logger.warn('Failed to create ticket for incident', { incidentId, error: error.message });
      }
    }

    // Escalate to GoAlert if critical
    if (fullIncident.severity === 'critical' && this.config.autoEscalateToGoAlert) {
      try {
        await this.escalateToGoAlert(fullIncident);
        fullIncident.escalatedToGoAlert = true;
      } catch (error) {
        logger.warn('Failed to escalate incident to GoAlert', { incidentId, error: error.message });
      }
    }

    logger.info('Incident created', {
      incidentId,
      component: incident.component,
      severity: incident.severity,
    });

    this.emit('incidentCreated', fullIncident);
    return incidentId;
  }

  /**
   * Resolve an incident
   */
  async resolveIncident(incidentId: string, resolution?: string): Promise<void> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      logger.warn('Attempt to resolve unknown incident', { incidentId });
      return;
    }

    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    if (resolution) {
      incident.description += `\n\nResolution: ${resolution}`;
    }

    this.incidents.set(incidentId, incident);

    // Update Sentinel
    await this.updateSentinelIncident(incident);

    // Update ticket if exists
    if (incident.ticketId) {
      await this.resolveIncidentTicket(incident.ticketId, resolution);
    }

    logger.info('Incident resolved', { incidentId, component: incident.component });
    this.emit('incidentResolved', incident);
  }

  /**
   * Get monitoring dashboard data
   */
  getDashboardData(): any {
    const monitors = Array.from(this.monitors.values());
    const incidents = Array.from(this.incidents.values());
    const alerts = Array.from(this.alerts.values());

    const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
    const recentAlerts = alerts.filter(
      (a) => a.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000) && !a.resolved,
    );

    return {
      overview: {
        totalMonitors: monitors.length,
        healthyMonitors: monitors.filter((m) => m.status === 'up').length,
        activeIncidents: activeIncidents.length,
        recentAlerts: recentAlerts.length,
      },
      monitors: monitors.map((m) => ({
        id: m.id,
        name: m.name,
        type: m.type,
        component: m.component,
        status: m.status,
        uptime24h: m.uptime24h,
        avgResponseTime: m.avgResponseTime,
        lastCheck: m.lastCheck,
      })),
      incidents: activeIncidents.map((i) => ({
        id: i.id,
        component: i.component,
        severity: i.severity,
        status: i.status,
        summary: i.summary,
        startedAt: i.startedAt,
        ticketId: i.ticketId,
        escalatedToGoAlert: i.escalatedToGoAlert,
      })),
      alerts: recentAlerts.map((a) => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        component: a.component,
        message: a.message,
        timestamp: a.timestamp,
        escalated: a.escalated,
      })),
      healthByComponent: this.getHealthByComponent(),
      timestamp: new Date().toISOString(),
    };
  }

  // Private methods
  private async testSentinelConnectivity(): Promise<void> {
    try {
      // Test connection to existing Nova Sentinel service
      const response = await axios.get(`${this.sentinelApiUrl}/monitors`, {
        headers: this.getAuthHeaders(),
        timeout: 10000,
      });

      if (response.status !== 200) {
        throw new Error(`Nova Sentinel API returned status ${response.status}`);
      }

      logger.info('Nova Sentinel connectivity verified - found existing monitoring service');
    } catch (error) {
      logger.error('Failed to connect to Nova Sentinel:', error);
      throw new Error(
        'Nova Sentinel connectivity test failed - ensure Nova Sentinel service is running',
      );
    }
  }

  /**
   * Register AI components as monitors in the existing Nova Sentinel system
   */
  private async registerAIComponentMonitors(): Promise<void> {
    const aiComponents = [
      {
        name: 'AI Fabric Core',
        type: 'http',
        url: `${this.novaCoreApiUrl}/ai-fabric/status`,
        tags: ['ai-fabric', 'core'],
        interval_seconds: 60,
        timeout_seconds: 30,
        tenant_id: 'ai-platform',
      },
      {
        name: 'RAG Engine',
        type: 'http',
        url: `${this.novaCoreApiUrl}/ai-fabric/rag/status`,
        tags: ['ai-fabric', 'rag'],
        interval_seconds: 120,
        timeout_seconds: 45,
        tenant_id: 'ai-platform',
      },
      {
        name: 'MCP Server',
        type: 'http',
        url: 'http://localhost:3001/.well-known/mcp-server',
        tags: ['ai-fabric', 'mcp'],
        interval_seconds: 60,
        timeout_seconds: 30,
        tenant_id: 'ai-platform',
      },
      {
        name: 'AI Monitoring System',
        type: 'http',
        url: `${this.novaCoreApiUrl}/ai-fabric/monitoring/status`,
        tags: ['ai-fabric', 'monitoring'],
        interval_seconds: 300,
        timeout_seconds: 60,
        tenant_id: 'ai-platform',
      },
    ];

    for (const component of aiComponents) {
      try {
        // Check if monitor already exists
        const existing = await this.checkExistingMonitor(component.name);
        if (existing) {
          logger.info(`AI component monitor already exists: ${component.name}`);
          continue;
        }

        // Create monitor in Nova Sentinel
        await this.createSentinelMonitor(component);
        logger.info(`Created Nova Sentinel monitor for: ${component.name}`);
      } catch (error) {
        logger.warn(`Failed to create monitor for ${component.name}:`, error.message);
      }
    }
  }

  /**
   * Register MCP tools for AI access to Sentinel data
   */
  private async registerMCPTools(): Promise<void> {
    try {
      // Import MCP server dynamically to avoid circular dependencies
      const { novaMCPServer } = await import('./mcp-server.js');

      if (!novaMCPServer) {
        logger.warn('MCP Server not available - skipping tool registration');
        return;
      }

      // Register Sentinel monitoring tools
      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.get_monitors`,
        description: 'Get all monitors from Nova Sentinel',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['up', 'down', 'unknown'] },
            tenant_id: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        handler: this.handleGetMonitors.bind(this),
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.get_incidents`,
        description: 'Get active incidents from Nova Sentinel',
        inputSchema: {
          type: 'object',
          properties: {
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            status: { type: 'string', enum: ['open', 'acknowledged', 'investigating', 'resolved'] },
            tenant_id: { type: 'string' },
          },
        },
        handler: this.handleGetIncidents.bind(this),
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.create_incident`,
        description: 'Create a new incident in Nova Sentinel',
        inputSchema: {
          type: 'object',
          properties: {
            monitor_id: { type: 'string', description: 'Monitor ID' },
            summary: { type: 'string', description: 'Incident summary' },
            description: { type: 'string', description: 'Detailed description' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          },
          required: ['monitor_id', 'summary', 'severity'],
        },
        handler: this.handleCreateIncident.bind(this),
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.get_status_page`,
        description: 'Get status page information for a tenant',
        inputSchema: {
          type: 'object',
          properties: {
            tenant_id: { type: 'string', description: 'Tenant ID' },
          },
          required: ['tenant_id'],
        },
        handler: this.handleGetStatusPage.bind(this),
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.report_ai_error`,
        description: 'Report an AI error to Nova Sentinel monitoring',
        inputSchema: {
          type: 'object',
          properties: {
            component: { type: 'string', description: 'AI component name' },
            error_message: { type: 'string', description: 'Error message' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            metadata: { type: 'object', description: 'Additional error metadata' },
          },
          required: ['component', 'error_message', 'severity'],
        },
        handler: this.handleReportAIError.bind(this),
      });

      logger.info(
        `Registered ${this.config.mcpToolConfig.enabledTools.length} Nova Sentinel MCP tools`,
      );
    } catch (error) {
      logger.warn('Failed to register MCP tools:', error.message);
    }
  }

  /**
   * Set up event listeners for AI monitoring data
   */
  private setupAIEventListeners(): void {
    if (aiMonitoringSystem) {
      // Send AI metrics to Sentinel
      aiMonitoringSystem.on('metricRecorded', async (metric) => {
        try {
          await this.sendMetricToSentinel(metric);
        } catch (error) {
          logger.warn('Failed to send metric to Sentinel:', error.message);
        }
      });

      // Create incidents for security alerts
      aiMonitoringSystem.on('securityAlert', async (alert) => {
        try {
          await this.createSentinelIncidentFromAlert(alert);
        } catch (error) {
          logger.warn('Failed to create Sentinel incident from security alert:', error.message);
        }
      });

      // Update monitor status based on AI health
      aiMonitoringSystem.on('auditEventRecorded', async (event) => {
        if (event.severity === 'critical') {
          try {
            await this.updateMonitorStatusFromEvent(event);
          } catch (error) {
            logger.warn('Failed to update monitor status from audit event:', error.message);
          }
        }
      });
    }

    if (aiFabric) {
      // Monitor AI provider health
      aiFabric.on('providerHealthChanged', async (event) => {
        try {
          await this.updateProviderMonitorStatus(event);
        } catch (error) {
          logger.warn('Failed to update provider monitor status:', error.message);
        }
      });

      // Report AI request failures
      aiFabric.on('requestFailed', async (event) => {
        try {
          await this.reportAIFailureToSentinel(event);
        } catch (error) {
          logger.warn('Failed to report AI failure to Sentinel:', error.message);
        }
      });
    }
  }

  /**
   * Sync with existing Nova Sentinel data
   */
  private async syncWithSentinel(): Promise<void> {
    try {
      // Get existing monitors from Nova Sentinel
      const response = await axios.get(`${this.sentinelApiUrl}/monitors`, {
        headers: this.getAuthHeaders(),
        params: { tags: 'ai-fabric' },
      });

      if (response.data && response.data.monitors) {
        for (const monitor of response.data.monitors) {
          // Convert Nova Sentinel monitor to our format
          const sentinelMonitor: SentinelMonitor = {
            id: monitor.id,
            name: monitor.name,
            type: 'ai_service',
            component: this.extractComponentFromTags(monitor.tags),
            url: monitor.url,
            checkInterval: monitor.interval_seconds * 1000,
            timeout: monitor.timeout_seconds * 1000,
            retryAttempts: monitor.max_retries,
            config: {
              healthEndpoint: monitor.url,
              alertThresholds: {
                responseTime: this.config.escalationThresholds.aiResponseTime,
                errorRate: this.config.escalationThresholds.aiErrorRate,
                availability: this.config.escalationThresholds.aiAvailability,
              },
            },
            tenant_id: monitor.tenant_id,
            isActive: monitor.status !== 'disabled',
            status: this.mapSentinelStatus(monitor.status),
            uptime24h: monitor.uptime_24h,
            avgResponseTime: monitor.avg_response_time,
          };

          this.monitors.set(monitor.id, sentinelMonitor);
        }

        logger.info(`Synced ${response.data.monitors.length} AI monitors from Nova Sentinel`);
      }
    } catch (error) {
      logger.warn('Failed to sync with Nova Sentinel:', error.message);
    }
  }

  private async registerDefaultAIMonitors(): Promise<void> {
    const defaultMonitors = [
      {
        name: 'AI Fabric Core',
        type: 'ai_service' as const,
        component: 'ai-fabric-core',
        checkInterval: 30000,
        timeout: 10000,
        retryAttempts: 3,
        config: {
          healthEndpoint: '/api/ai-fabric/status',
          alertThresholds: {
            responseTime: 5000,
            errorRate: 0.05,
            availability: 0.99,
          },
        },
        isActive: true,
      },
      {
        name: 'RAG Engine',
        type: 'rag_service' as const,
        component: 'rag-engine',
        checkInterval: 60000,
        timeout: 15000,
        retryAttempts: 2,
        config: {
          healthEndpoint: '/api/ai-fabric/rag/status',
          alertThresholds: {
            responseTime: 10000,
            errorRate: 0.1,
            availability: 0.95,
          },
        },
        isActive: true,
      },
      {
        name: 'MCP Server',
        type: 'ai_endpoint' as const,
        component: 'mcp-server',
        checkInterval: 30000,
        timeout: 10000,
        retryAttempts: 3,
        config: {
          healthEndpoint: '/.well-known/mcp-server',
          alertThresholds: {
            responseTime: 3000,
            errorRate: 0.05,
            availability: 0.99,
          },
        },
        isActive: true,
      },
      {
        name: 'Nova Local AI',
        type: 'custom_model' as const,
        component: 'nova-local-ai',
        checkInterval: 120000,
        timeout: 30000,
        retryAttempts: 2,
        config: {
          healthEndpoint: '/api/ai-fabric/local-ai/status',
          alertThresholds: {
            responseTime: 15000,
            errorRate: 0.1,
            availability: 0.95,
          },
        },
        isActive: true,
      },
    ];

    for (const monitor of defaultMonitors) {
      try {
        await this.registerAIMonitor(monitor);
      } catch (error) {
        logger.warn('Failed to register default monitor', {
          monitor: monitor.name,
          error: error.message,
        });
      }
    }
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.checkInterval);

    logger.info('Monitoring loop started');
  }

  private async performHealthChecks(): Promise<void> {
    const monitors = Array.from(this.monitors.values()).filter((m) => m.isActive);

    for (const monitor of monitors) {
      try {
        await this.checkMonitorHealth(monitor);
      } catch (error) {
        logger.warn('Health check failed for monitor', {
          monitorId: monitor.id,
          component: monitor.component,
          error: error.message,
        });
      }
    }
  }

  private async checkMonitorHealth(monitor: SentinelMonitor): Promise<void> {
    const startTime = Date.now();
    let status: SentinelMonitor['status'] = 'unknown';
    let responseTime = 0;

    try {
      if (monitor.config.healthEndpoint) {
        const baseUrl = monitor.url || process.env.NOVA_API_BASE_URL || 'http://localhost:3000';
        const healthUrl = `${baseUrl}${monitor.config.healthEndpoint}`;

        const response = await axios.get(healthUrl, {
          timeout: monitor.timeout,
          headers: this.getAuthHeaders(),
        });

        responseTime = Date.now() - startTime;

        if (response.status === 200) {
          status = 'up';
        } else {
          status = 'down';
        }
      } else {
        // Component-specific health checks
        status = await this.checkComponentHealth(monitor.component);
        responseTime = Date.now() - startTime;
      }
    } catch (error) {
      status = 'down';
      responseTime = Date.now() - startTime;

      logger.warn('Monitor health check failed', {
        monitorId: monitor.id,
        component: monitor.component,
        error: error.message,
      });
    }

    await this.updateMonitorStatus(monitor.id, status, { responseTime });
  }

  private async checkComponentHealth(component: string): Promise<SentinelMonitor['status']> {
    try {
      switch (component) {
        case 'ai-fabric-core':
          return aiFabric?.isInitialized ? 'up' : 'down';

        case 'rag-engine':
          // Check if RAG engine is responsive via health endpoint
          try {
            const res = await axios.get(
              `${process.env.RAG_ENGINE_URL || 'http://localhost:4005'}/health`,
              { timeout: 3000 },
            );
            return res.status === 200 ? 'up' : 'down';
          } catch {
            return 'down';
          }

        case 'mcp-server':
          // Check MCP server health by pinging server info route
          try {
            const res = await axios.get(
              `${process.env.MCP_SERVER_URL || 'http://localhost:4010'}/api/mcp/info`,
              { timeout: 3000 },
            );
            return res.status === 200 ? 'up' : 'down';
          } catch {
            return 'down';
          }

        case 'nova-local-ai':
          // Check Nova Local AI health endpoint
          try {
            const res = await axios.get(
              `${process.env.NOVA_LOCAL_AI_URL || 'http://localhost:4015'}/health`,
              { timeout: 3000 },
            );
            return res.status === 200 ? 'up' : 'down';
          } catch {
            return 'down';
          }

        default:
          return 'unknown';
      }
    } catch (error) {
      logger.warn('Component health check failed', { component, error: error.message });
      return 'down';
    }
  }

  private async handleStatusChange(
    monitor: SentinelMonitor,
    previousStatus: SentinelMonitor['status'],
    newStatus: SentinelMonitor['status'],
  ): Promise<void> {
    if (previousStatus === 'up' && newStatus === 'down') {
      // Service went down - create incident
      const severity = this.determineSeverity(monitor);

      await this.createIncident({
        monitorId: monitor.id,
        component: monitor.component,
        severity,
        status: 'open',
        summary: `${monitor.name} is experiencing issues`,
        description: `Monitor ${monitor.name} (${monitor.component}) has gone down`,
        startedAt: new Date(),
      });
    } else if (previousStatus === 'down' && newStatus === 'up') {
      // Service recovered - resolve incidents
      await this.resolveComponentIncidents(monitor.component, 'Service has recovered');
    }
  }

  private determineSeverity(monitor: SentinelMonitor): SentinelIncident['severity'] {
    switch (monitor.type) {
      case 'ai_service':
        return monitor.component === 'ai-fabric-core' ? 'critical' : 'high';
      case 'ai_endpoint':
        return monitor.component === 'mcp-server' ? 'high' : 'medium';
      case 'rag_service':
        return 'medium';
      case 'custom_model':
        return 'low';
      default:
        return 'medium';
    }
  }

  private async resolveComponentIncidents(component: string, resolution: string): Promise<void> {
    const componentIncidents = Array.from(this.incidents.values()).filter(
      (i) => i.component === component && i.status !== 'resolved',
    );

    for (const incident of componentIncidents) {
      await this.resolveIncident(incident.id, resolution);
    }
  }

  private async generateAIAnalysis(
    incident: SentinelIncident,
  ): Promise<SentinelIncident['aiAnalysis']> {
    if (!aiFabric) {
      return { confidence: 0 };
    }

    try {
      const analysisRequest = {
        input: {
          component: incident.component,
          severity: incident.severity,
          summary: incident.summary,
          description: incident.description,
        },
        requestType: 'analysis',
        context: {
          type: 'incident_analysis',
          timestamp: incident.startedAt.toISOString(),
        },
      };

      const response = await aiFabric.processRequest(analysisRequest);

      if (response.success && response.output) {
        return {
          rootCause: response.output.rootCause,
          impact: response.output.impact,
          recommendations: response.output.recommendations || [],
          confidence: response.output.confidence || 0.7,
        };
      }
    } catch (error) {
      logger.warn('Failed to generate AI analysis', { error: error.message });
    }

    return { confidence: 0 };
  }

  private getHealthByComponent(): Record<string, any> {
    const components: Record<string, any> = {};

    for (const monitor of this.monitors.values()) {
      if (!components[monitor.component]) {
        components[monitor.component] = {
          status: 'unknown',
          monitors: 0,
          upMonitors: 0,
          avgResponseTime: 0,
          uptime24h: 0,
        };
      }

      const comp = components[monitor.component];
      comp.monitors++;

      if (monitor.status === 'up') {
        comp.upMonitors++;
      }

      if (monitor.avgResponseTime) {
        comp.avgResponseTime = (comp.avgResponseTime + monitor.avgResponseTime) / 2;
      }

      if (monitor.uptime24h) {
        comp.uptime24h = (comp.uptime24h + monitor.uptime24h) / 2;
      }

      // Determine overall component status
      if (comp.upMonitors === comp.monitors) {
        comp.status = 'healthy';
      } else if (comp.upMonitors > 0) {
        comp.status = 'degraded';
      } else {
        comp.status = 'down';
      }
    }

    return components;
  }

  private async handleProviderHealthChange(event: any): Promise<void> {
    const monitorId = `provider-${event.providerId}`;
    const monitor = Array.from(this.monitors.values()).find(
      (m) => m.providerId === event.providerId,
    );

    if (monitor) {
      await this.updateMonitorStatus(monitor.id, event.healthy ? 'up' : 'down');
    }
  }

  private async handleAIRequestFailure(event: any): Promise<void> {
    const alert: SentinelAlert = {
      id: crypto.randomUUID(),
      type: 'ai_failure',
      severity: event.critical ? 'critical' : 'high',
      component: event.component || 'unknown',
      message: `AI request failed: ${event.error}`,
      metrics: event.metrics,
      timestamp: new Date(),
      escalated: false,
      resolved: false,
    };

    this.alerts.set(alert.id, alert);
    this.emit('alertCreated', alert);
  }

  private async handlePerformanceDegradation(event: any): Promise<void> {
    const alert: SentinelAlert = {
      id: crypto.randomUUID(),
      type: 'performance_degradation',
      severity: 'medium',
      component: event.component || 'unknown',
      message: `Performance degradation detected: ${event.metric} = ${event.value}`,
      metrics: event.metrics,
      timestamp: new Date(),
      escalated: false,
      resolved: false,
    };

    this.alerts.set(alert.id, alert);
    this.emit('alertCreated', alert);
  }

  private async handleSecurityAlert(event: any): Promise<void> {
    const alert: SentinelAlert = {
      id: crypto.randomUUID(),
      type: 'security_incident',
      severity: event.severity || 'high',
      component: 'ai-security',
      message: `Security alert: ${event.description}`,
      metrics: event.indicators,
      timestamp: new Date(),
      escalated: false,
      resolved: false,
    };

    this.alerts.set(alert.id, alert);

    // Auto-escalate security incidents
    if (event.severity === 'critical') {
      try {
        await this.escalateSecurityAlert(alert);
        alert.escalated = true;
      } catch (error) {
        logger.warn('Failed to escalate security alert', {
          alertId: alert.id,
          error: error.message,
        });
      }
    }

    this.emit('alertCreated', alert);
  }

  private async handleMetricRecorded(event: any): Promise<void> {
    // Check for threshold violations that require alerts
    if (event.metricType === 'performance' && event.value > 10000) {
      // 10s response time
      const alert: SentinelAlert = {
        id: crypto.randomUUID(),
        type: 'performance_degradation',
        severity: 'medium',
        component: event.providerId || 'unknown',
        message: `High response time detected: ${event.value}ms`,
        metrics: { responseTime: event.value },
        timestamp: new Date(),
        escalated: false,
        resolved: false,
      };

      this.alerts.set(alert.id, alert);
      this.emit('alertCreated', alert);
    }
  }

  private async handleAuditEvent(event: any): Promise<void> {
    if (event.severity === 'critical' || event.eventType === 'policy_violation') {
      const alert: SentinelAlert = {
        id: crypto.randomUUID(),
        type: 'security_incident',
        severity: event.severity || 'high',
        component: 'ai-compliance',
        message: `Audit event: ${event.eventType}`,
        metrics: event.metadata,
        timestamp: new Date(),
        escalated: false,
        resolved: false,
      };

      this.alerts.set(alert.id, alert);
      this.emit('alertCreated', alert);
    }
  }

  // MCP Tool Handlers
  private async handleGetMonitors(args: any): Promise<any> {
    try {
      const response = await axios.get(`${this.sentinelApiUrl}/monitors`, {
        headers: this.getAuthHeaders(),
        params: args,
      });

      return {
        success: true,
        data: {
          monitors: response.data.monitors || [],
          total: response.data.monitors?.length || 0,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get monitors: ${error.message}`,
      };
    }
  }

  private async handleGetIncidents(args: any): Promise<any> {
    try {
      const response = await axios.get(`${this.sentinelApiUrl}/incidents`, {
        headers: this.getAuthHeaders(),
        params: args,
      });

      return {
        success: true,
        data: {
          incidents: response.data.incidents || [],
          total: response.data.incidents?.length || 0,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get incidents: ${error.message}`,
      };
    }
  }

  private async handleCreateIncident(args: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.sentinelApiUrl}/incidents`,
        {
          monitor_id: args.monitor_id,
          summary: args.summary,
          description: args.description,
          severity: args.severity,
          status: 'open',
          started_at: new Date().toISOString(),
        },
        {
          headers: this.getAuthHeaders(),
        },
      );

      return {
        success: true,
        data: {
          incident_id: response.data.id,
          message: 'Incident created successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create incident: ${error.message}`,
      };
    }
  }

  private async handleGetStatusPage(args: any): Promise<any> {
    try {
      const response = await axios.get(`${this.sentinelApiUrl}/status/${args.tenant_id}`, {
        headers: this.getAuthHeaders(),
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get status page: ${error.message}`,
      };
    }
  }

  private async handleReportAIError(args: any): Promise<any> {
    try {
      // Create an incident for the AI error
      const incident = await this.createIncident({
        monitorId: `ai-${args.component}`,
        component: args.component,
        severity: args.severity,
        status: 'open',
        summary: `AI Error: ${args.component}`,
        description: `${args.error_message}\n\nMetadata: ${JSON.stringify(args.metadata || {})}`,
        startedAt: new Date(),
      });

      return {
        success: true,
        data: {
          incident_id: incident,
          message: 'AI error reported to Nova Sentinel',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to report AI error: ${error.message}`,
      };
    }
  }

  // Sentinel API integration methods
  private async createSentinelMonitor(monitor: any): Promise<void> {
    try {
      await axios.post(`${this.sentinelApiUrl}/monitors`, monitor, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      logger.warn('Failed to create Nova Sentinel monitor', {
        monitor: monitor.name,
        error: error.message,
      });
    }
  }

  private async checkExistingMonitor(name: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.sentinelApiUrl}/monitors`, {
        headers: this.getAuthHeaders(),
        params: { name },
      });

      return response.data.monitors && response.data.monitors.length > 0;
    } catch (error) {
      logger.warn('Failed to check existing monitor:', error.message);
      return false;
    }
  }

  private async sendMetricToSentinel(metric: any): Promise<void> {
    try {
      // Send AI metrics as heartbeat data to Sentinel
      if (metric.metricType === 'performance') {
        const monitorId = `ai-${metric.providerId}`;

        // Find the monitor and update its status
        const monitor = Array.from(this.monitors.values()).find(
          (m) => m.component === metric.providerId,
        );

        if (monitor) {
          await this.updateMonitorStatus(
            monitor.id,
            metric.value > this.config.escalationThresholds.aiResponseTime ? 'down' : 'up',
            { responseTime: metric.value },
          );
        }
      }
    } catch (error) {
      logger.warn('Failed to send metric to Sentinel:', error.message);
    }
  }

  private async createSentinelIncidentFromAlert(alert: any): Promise<void> {
    try {
      await this.createIncident({
        monitorId: `ai-security`,
        component: 'ai-security',
        severity: alert.severity,
        status: 'open',
        summary: `Security Alert: ${alert.alertType}`,
        description: alert.description,
        startedAt: alert.timestamp,
      });
    } catch (error) {
      logger.warn('Failed to create Sentinel incident from alert:', error.message);
    }
  }

  private async updateMonitorStatusFromEvent(event: any): Promise<void> {
    try {
      const monitor = Array.from(this.monitors.values()).find((m) => m.component === 'ai-security');

      if (monitor) {
        await this.updateMonitorStatus(monitor.id, 'down', {
          lastError: event.eventType,
          severity: event.severity,
        });
      }
    } catch (error) {
      logger.warn('Failed to update monitor status from event:', error.message);
    }
  }

  private async updateProviderMonitorStatus(event: any): Promise<void> {
    try {
      const monitor = Array.from(this.monitors.values()).find(
        (m) => m.component === event.providerId,
      );

      if (monitor) {
        await this.updateMonitorStatus(monitor.id, event.healthy ? 'up' : 'down', {
          healthReason: event.reason,
        });
      }
    } catch (error) {
      logger.warn('Failed to update provider monitor status:', error.message);
    }
  }

  private async reportAIFailureToSentinel(event: any): Promise<void> {
    try {
      await this.createIncident({
        monitorId: `ai-${event.component}`,
        component: event.component,
        severity: event.critical ? 'critical' : 'high',
        status: 'open',
        summary: `AI Failure: ${event.component}`,
        description: `AI request failed: ${event.error}\n\nMetadata: ${JSON.stringify(event.metadata || {})}`,
        startedAt: new Date(),
      });
    } catch (error) {
      logger.warn('Failed to report AI failure to Sentinel:', error.message);
    }
  }

  // Helper methods
  private extractComponentFromTags(tags: string[]): string {
    const aiTag = tags.find(
      (tag) => tag.startsWith('ai-') || tag === 'core' || tag === 'rag' || tag === 'mcp',
    );
    return aiTag || 'unknown';
  }

  private mapSentinelStatus(status: string): SentinelMonitor['status'] {
    switch (status) {
      case 'active':
        return 'up';
      case 'paused':
        return 'unknown';
      case 'maintenance':
        return 'unknown';
      default:
        return 'down';
    }
  }

  private async updateSentinelMonitor(monitor: SentinelMonitor): Promise<void> {
    try {
      await axios.patch(
        `${this.sentinelApiUrl}/monitors/${monitor.id}`,
        {
          name: monitor.name,
          component: monitor.component,
          status: monitor.status,
          avg_response_time: monitor.avgResponseTime,
          uptime_24h: monitor.uptime24h,
        },
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      logger.warn('Failed to update Sentinel monitor', { id: monitor.id, error: error.message });
    }
  }

  private async createSentinelIncident(incident: SentinelIncident): Promise<void> {
    try {
      await axios.post(
        `${this.sentinelApiUrl}/incidents`,
        {
          monitor_id: incident.monitorId,
          severity: incident.severity,
          status: incident.status,
          summary: incident.summary,
          description: incident.description,
          started_at: incident.startedAt,
        },
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      logger.warn('Failed to create Sentinel incident', { error: error.message });
    }
  }

  private async updateSentinelIncident(incident: SentinelIncident): Promise<void> {
    try {
      await axios.patch(
        `${this.sentinelApiUrl}/incidents/${incident.id}`,
        {
          status: incident.status,
          resolved_at: incident.resolvedAt || undefined,
        },
        { headers: this.getAuthHeaders() },
      );
    } catch (error) {
      logger.warn('Failed to update Sentinel incident', { id: incident.id, error: error.message });
    }
  }

  private async syncMonitorsFromSentinel(): Promise<void> {
    try {
      const response = await axios.get(`${this.sentinelApiUrl}/monitors`, {
        headers: this.getAuthHeaders(),
        params: { tags: 'ai-fabric' },
      });

      logger.info('Synced monitors from Sentinel', { count: response.data.monitors?.length || 0 });
    } catch (error) {
      logger.warn('Failed to sync monitors from Sentinel', { error: error.message });
    }
  }

  private async escalateToGoAlert(incident: SentinelIncident): Promise<void> {
    // This will be implemented in the GoAlert integration
    logger.info('Would escalate to GoAlert', { incidentId: incident.id });
  }

  private async escalateSecurityAlert(alert: SentinelAlert): Promise<void> {
    // This will be implemented in the GoAlert integration
    logger.info('Would escalate security alert to GoAlert', { alertId: alert.id });
  }

  private async createIncidentTicket(incident: SentinelIncident): Promise<string> {
    try {
      // Best-effort: create a basic ticket record via local database if available
      const { default: db } = await import('../db.js');
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const title = `[Sentinel] ${incident.summary}`.slice(0, 255);
      const description = `${incident.description}\n\nComponent: ${incident.component}\nSeverity: ${incident.severity}`;
      await db.query?.(
        'INSERT INTO tickets (id, ticket_id, title, description, priority, status, requested_by_id, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [id, `INC-${Date.now()}`, title, description, incident.severity, 'open', null, now, now],
      );
      return id;
    } catch (error) {
      logger.warn('Ticket creation fallback (db unavailable)', {
        error: (error as Error)?.message,
      });
      return crypto.randomUUID();
    }
  }

  private async resolveIncidentTicket(ticketId: string, resolution?: string): Promise<void> {
    try {
      const { default: db } = await import('../db.js');
      await db.query?.(
        'UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['resolved', ticketId],
      );
      if (resolution) {
        await db.query?.(
          'INSERT INTO ticket_comments (id, ticket_id, content, type, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
          [crypto.randomUUID(), ticketId, `Resolution: ${resolution}`, 'internal'],
        );
      }
    } catch (error) {
      logger.warn('Ticket resolution fallback (db unavailable)', {
        error: (error as Error)?.message,
        ticketId,
      });
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down Nova Sentinel Integration...');

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.isInitialized = false;
    logger.info('Nova Sentinel Integration shutdown complete');
  }
}

// Export singleton instance
export const sentinelIntegration = new NovaSentinelIntegration();
