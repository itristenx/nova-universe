/**
 * Nova GoAlert Integration for AI Fabric
 * 
 * Integrates Nova AI Fabric with the existing Nova GoAlert proxy system.
 * Provides AI components access to alert management and escalation capabilities
 * while feeding AI incidents into the existing GoAlert infrastructure.
 * 
 * Features:
 * - AI tool access to GoAlert services, schedules, and alerts
 * - Automated alert creation from AI failures via existing proxy
 * - MCP tool registration for ChatGPT access to alerting
 * - Integration with existing Nova RBAC and audit systems
 * - Real-time on-call information access for AI
 * - AI-driven incident correlation and escalation
 */

import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { aiMonitoringSystem } from './ai-monitoring.js';
import { sentinelIntegration } from './sentinel-integration.js';
import axios from 'axios';
import crypto from 'crypto';

// GoAlert Integration Types
export interface GoAlertService {
  id: string;
  name: string;
  description: string;
  escalationPolicyId: string;
  maintenanceExpiresAt?: Date;
  isActive: boolean;
  labels: Record<string, string>;
}

export interface GoAlertEscalationPolicy {
  id: string;
  name: string;
  description: string;
  steps: GoAlertEscalationStep[];
  repeat: number;
  isActive: boolean;
}

export interface GoAlertEscalationStep {
  id: string;
  delayMinutes: number;
  targets: GoAlertTarget[];
}

export interface GoAlertTarget {
  id: string;
  type: 'user' | 'schedule' | 'rotation' | 'webhook';
  name: string;
}

export interface GoAlertSchedule {
  id: string;
  name: string;
  description: string;
  timeZone: string;
  targets: GoAlertTarget[];
  rules: GoAlertScheduleRule[];
  isActive: boolean;
}

export interface GoAlertScheduleRule {
  id: string;
  start: string; // Time in format "15:04"
  end: string;
  weekdayFilter: number[]; // 0=Sunday, 1=Monday, etc.
  targetId: string;
}

export interface NovaAlert {
  id: string;
  serviceId: string;
  summary: string;
  details?: string;
  source: 'ai_fabric' | 'sentinel' | 'monitoring' | 'security' | 'manual';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  metadata: Record<string, any>;
  status: 'triggered' | 'active' | 'acknowledged' | 'closed';
  createdAt: Date;
  acknowledgedAt?: Date;
  closedAt?: Date;
  acknowledgedBy?: string;
  closedBy?: string;
  escalatedSteps: number;
  goAlertId?: string;
  ticketId?: string;
  sentinelIncidentId?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  conditions: AlertCondition[];
  serviceId: string;
  isActive: boolean;
  priority: number;
  suppressionRules?: SuppressionRule[];
}

export interface AlertCondition {
  type: 'metric_threshold' | 'event_pattern' | 'time_based' | 'dependency';
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains' | 'matches';
  value: any;
  timeWindow?: number; // seconds
}

export interface SuppressionRule {
  id: string;
  type: 'maintenance_window' | 'duplicate_alert' | 'dependency_failure';
  conditions: Record<string, any>;
  duration?: number; // seconds
}

/**
 * Nova GoAlert Integration System
 * 
 * Integrates with the existing Nova GoAlert proxy to provide AI alerting tools
 */
export class NovaGoAlertIntegration extends EventEmitter {
  private services: Map<string, GoAlertService> = new Map();
  private escalationPolicies: Map<string, GoAlertEscalationPolicy> = new Map();
  private schedules: Map<string, GoAlertSchedule> = new Map();
  private alerts: Map<string, NovaAlert> = new Map();
  private alertRules: Map<string, AlertRule> = new Map();
  
  private isInitialized = false;
  private novaApiUrl = process.env.NOVA_API_BASE_URL || 'http://localhost:3000';
  private goAlertProxyUrl = `${this.novaApiUrl}/api/v2/goalert`;
  private apiToken = process.env.NOVA_API_TOKEN || '';
  
  // Integration configuration
  private config = {
    enableAIAlerting: true,
    enableMCPTools: true,
    autoCreateServices: true,
    aiAlertThresholds: {
      responseTime: 15000, // 15 seconds
      errorRate: 0.1, // 10%
      availability: 0.95 // 95%
    },
    mcpToolConfig: {
      toolPrefix: 'nova.goalert',
      enabledTools: [
        'get_services',
        'get_alerts',
        'create_alert',
        'acknowledge_alert',
        'close_alert',
        'get_schedules',
        'get_oncall',
        'escalate_incident'
      ]
    },
    aiServices: {
      'ai-fabric-core': {
        name: 'AI Fabric Core',
        description: 'Core AI orchestration engine',
        escalationPolicy: 'ai-platform-critical'
      },
      'ai-security': {
        name: 'AI Security',
        description: 'AI security monitoring and compliance',
        escalationPolicy: 'ai-security-critical'
      },
      'ai-performance': {
        name: 'AI Performance',
        description: 'AI performance and model monitoring',
        escalationPolicy: 'ai-ops-standard'
      }
    }
  };

  constructor() {
    super();
    
    // Listen to Sentinel integration events
    if (sentinelIntegration) {
      sentinelIntegration.on('incidentCreated', this.handleSentinelIncident.bind(this));
      sentinelIntegration.on('alertCreated', this.handleSentinelAlert.bind(this));
      sentinelIntegration.on('monitorStatusUpdated', this.handleMonitorStatusChange.bind(this));
    }

    // Listen to AI Monitoring events
    if (aiMonitoringSystem) {
      aiMonitoringSystem.on('securityAlert', this.handleSecurityAlert.bind(this));
      aiMonitoringSystem.on('biasAssessed', this.handleBiasAlert.bind(this));
      aiMonitoringSystem.on('driftDetected', this.handleModelDrift.bind(this));
      aiMonitoringSystem.on('auditEventRecorded', this.handleAuditEvent.bind(this));
    }
  }

  /**
   * Initialize the GoAlert integration
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Nova GoAlert Integration...');

      // Test connectivity to existing Nova GoAlert proxy
      await this.testGoAlertProxyConnectivity();

      // Register AI services in existing GoAlert via proxy
      if (this.config.autoCreateServices) {
        await this.registerAIServices();
      }

      // Register MCP tools for AI access to GoAlert
      if (this.config.enableMCPTools) {
        await this.registerMCPTools();
      }

      // Set up event listeners for AI alerting
      this.setupAIEventListeners();

      // Sync with existing GoAlert data via proxy
      await this.syncWithGoAlert();

      this.isInitialized = true;
      this.emit('initialized');

      logger.info('Nova GoAlert Integration initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize GoAlert Integration:', error);
      throw error;
    }
  }

  /**
   * Create an alert in GoAlert
   */
  async createAlert(alert: Omit<NovaAlert, 'id' | 'createdAt' | 'status' | 'escalatedSteps'>): Promise<string> {
    const alertId = crypto.randomUUID();
    const fullAlert: NovaAlert = {
      ...alert,
      id: alertId,
      createdAt: new Date(),
      status: 'triggered',
      escalatedSteps: 0
    };

    // Check for alert suppression
    if (await this.shouldSuppressAlert(fullAlert)) {
      logger.info('Alert suppressed', { alertId, reason: 'suppression_rule_matched' });
      return alertId;
    }

    // Check for duplicates
    if (this.config.enableDuplicateDetection && await this.isDuplicateAlert(fullAlert)) {
      logger.info('Duplicate alert detected', { alertId, originalAlert: 'found' });
      return alertId;
    }

    this.alerts.set(alertId, fullAlert);

    try {
      // Create alert in GoAlert
      const goAlertId = await this.createGoAlert(fullAlert);
      fullAlert.goAlertId = goAlertId;
      fullAlert.status = 'active';

      // Create ticket if configured
      if (this.shouldCreateTicket(fullAlert)) {
        const ticketId = await this.createAlertTicket(fullAlert);
        fullAlert.ticketId = ticketId;
      }

      // Link to Sentinel incident if exists
      if (alert.sentinelIncidentId) {
        await this.linkToSentinelIncident(fullAlert, alert.sentinelIncidentId);
      }

      logger.info('Alert created in GoAlert', { 
        alertId, 
        goAlertId, 
        serviceId: alert.serviceId,
        severity: alert.severity,
        component: alert.component
      });

      this.emit('alertCreated', fullAlert);
    } catch (error) {
      logger.error('Failed to create alert in GoAlert', { alertId, error: error.message });
      fullAlert.status = 'triggered'; // Keep as triggered for retry
    }

    return alertId;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string, message?: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    if (alert.status !== 'active') {
      throw new Error(`Alert ${alertId} is not active (status: ${alert.status})`);
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = userId;

    if (message) {
      alert.details = (alert.details || '') + `\n\nAcknowledged: ${message}`;
    }

    // Acknowledge in GoAlert
    if (alert.goAlertId) {
      try {
        await this.acknowledgeGoAlert(alert.goAlertId, userId);
      } catch (error) {
        logger.warn('Failed to acknowledge alert in GoAlert', { 
          alertId, 
          goAlertId: alert.goAlertId, 
          error: error.message 
        });
      }
    }

    // Update ticket if exists
    if (alert.ticketId) {
      await this.updateAlertTicket(alert.ticketId, 'acknowledged', message);
    }

    this.alerts.set(alertId, alert);
    
    logger.info('Alert acknowledged', { 
      alertId, 
      acknowledgedBy: userId, 
      component: alert.component 
    });

    this.emit('alertAcknowledged', alert);
  }

  /**
   * Close an alert
   */
  async closeAlert(alertId: string, userId: string, reason?: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    if (alert.status === 'closed') {
      logger.warn('Attempt to close already closed alert', { alertId });
      return;
    }

    alert.status = 'closed';
    alert.closedAt = new Date();
    alert.closedBy = userId;

    if (reason) {
      alert.details = (alert.details || '') + `\n\nClosed: ${reason}`;
    }

    // Close in GoAlert
    if (alert.goAlertId) {
      try {
        await this.closeGoAlert(alert.goAlertId);
      } catch (error) {
        logger.warn('Failed to close alert in GoAlert', { 
          alertId, 
          goAlertId: alert.goAlertId, 
          error: error.message 
        });
      }
    }

    // Resolve ticket if exists
    if (alert.ticketId) {
      await this.resolveAlertTicket(alert.ticketId, reason);
    }

    this.alerts.set(alertId, alert);
    
    logger.info('Alert closed', { 
      alertId, 
      closedBy: userId, 
      reason,
      component: alert.component 
    });

    this.emit('alertClosed', alert);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(serviceId?: string): NovaAlert[] {
    const alerts = Array.from(this.alerts.values())
      .filter(a => a.status === 'active' || a.status === 'acknowledged');

    if (serviceId) {
      return alerts.filter(a => a.serviceId === serviceId);
    }

    return alerts;
  }

  /**
   * Get on-call information
   */
  async getOnCallInfo(scheduleId?: string): Promise<any> {
    try {
      if (scheduleId) {
        const schedule = this.schedules.get(scheduleId);
        if (!schedule) {
          throw new Error(`Schedule ${scheduleId} not found`);
        }
        return await this.getGoAlertOnCall(scheduleId);
      }

      // Get all AI team on-call info
      const onCallInfo: Record<string, any> = {};
      for (const [id, schedule] of this.schedules) {
        try {
          onCallInfo[id] = await this.getGoAlertOnCall(id);
        } catch (error) {
          logger.warn('Failed to get on-call info for schedule', { scheduleId: id, error: error.message });
          onCallInfo[id] = { error: error.message };
        }
      }

      return onCallInfo;
    } catch (error) {
      logger.error('Failed to get on-call information', { error: error.message });
      throw error;
    }
  }

  /**
   * Get dashboard data
   */
  getDashboardData(): any {
    const alerts = Array.from(this.alerts.values());
    const activeAlerts = alerts.filter(a => a.status === 'active' || a.status === 'acknowledged');
    const recentAlerts = alerts.filter(a => 
      a.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      overview: {
        totalAlerts: recentAlerts.length,
        activeAlerts: activeAlerts.length,
        acknowledgedAlerts: activeAlerts.filter(a => a.status === 'acknowledged').length,
        criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length,
        services: this.services.size,
        schedules: this.schedules.size
      },
      alertsByComponent: this.getAlertsByComponent(recentAlerts),
      alertsBySeverity: this.getAlertsBySeverity(recentAlerts),
      alertsByStatus: this.getAlertsByStatus(alerts),
      recentAlerts: recentAlerts.slice(0, 20).map(a => ({
        id: a.id,
        summary: a.summary,
        component: a.component,
        severity: a.severity,
        status: a.status,
        createdAt: a.createdAt,
        acknowledgedAt: a.acknowledgedAt,
        acknowledgedBy: a.acknowledgedBy
      })),
      services: Array.from(this.services.values()).map(s => ({
        id: s.id,
        name: s.name,
        isActive: s.isActive,
        activeAlerts: activeAlerts.filter(a => a.serviceId === s.id).length
      })),
      escalationPolicies: Array.from(this.escalationPolicies.values()).map(p => ({
        id: p.id,
        name: p.name,
        steps: p.steps.length,
        repeat: p.repeat,
        isActive: p.isActive
      })),
      timestamp: new Date().toISOString()
    };
  }

  // Private methods
  private async testGoAlertProxyConnectivity(): Promise<void> {
    try {
      // Test connection to existing Nova GoAlert proxy
      const response = await axios.get(`${this.goAlertProxyUrl}/services`, {
        headers: this.getAuthHeaders(),
        timeout: 10000
      });

      if (response.status !== 200) {
        throw new Error(`Nova GoAlert proxy returned status ${response.status}`);
      }

      logger.info('Nova GoAlert proxy connectivity verified - found existing alerting system');
    } catch (error) {
      logger.error('Failed to connect to Nova GoAlert proxy:', error);
      throw new Error('Nova GoAlert proxy connectivity test failed - ensure GoAlert proxy is running');
    }
  }

  /**
   * Register AI services in existing GoAlert via proxy
   */
  private async registerAIServices(): Promise<void> {
    for (const [serviceId, serviceConfig] of Object.entries(this.config.aiServices)) {
      try {
        // Check if service already exists
        const existing = await this.checkExistingService(serviceConfig.name);
        if (existing) {
          logger.info(`AI service already exists in GoAlert: ${serviceConfig.name}`);
          continue;
        }

        // Create service via Nova GoAlert proxy
        await this.createGoAlertService(serviceConfig);
        logger.info(`Created GoAlert service for: ${serviceConfig.name}`);
      } catch (error) {
        logger.warn(`Failed to create GoAlert service for ${serviceConfig.name}:`, error.message);
      }
    }
  }

  /**
   * Register MCP tools for AI access to GoAlert data
   */
  private async registerMCPTools(): Promise<void> {
    try {
      // Import MCP server dynamically to avoid circular dependencies
      const { novaMCPServer } = await import('./mcp-server.js');
      
      if (!novaMCPServer) {
        logger.warn('MCP Server not available - skipping GoAlert tool registration');
        return;
      }

      // Register GoAlert alerting tools
      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.get_services`,
        description: 'Get all services from Nova GoAlert',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search term for service names' },
            favorites_only: { type: 'boolean', description: 'Show only favorite services' }
          }
        },
        handler: this.handleGetServices.bind(this)
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.get_alerts`,
        description: 'Get current alerts from Nova GoAlert',
        inputSchema: {
          type: 'object',
          properties: {
            service_id: { type: 'string', description: 'Filter by service ID' },
            status: { type: 'string', enum: ['triggered', 'active', 'closed'], description: 'Alert status' },
            limit: { type: 'number', description: 'Maximum number of alerts to return' }
          }
        },
        handler: this.handleGetAlerts.bind(this)
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.create_alert`,
        description: 'Create a new alert in Nova GoAlert',
        inputSchema: {
          type: 'object',
          properties: {
            service_id: { type: 'string', description: 'Service ID to alert', required: true },
            summary: { type: 'string', description: 'Alert summary', required: true },
            details: { type: 'string', description: 'Alert details' },
            dedup_key: { type: 'string', description: 'Deduplication key' }
          },
          required: ['service_id', 'summary']
        },
        handler: this.handleCreateAlert.bind(this)
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.acknowledge_alert`,
        description: 'Acknowledge an alert in Nova GoAlert',
        inputSchema: {
          type: 'object',
          properties: {
            alert_id: { type: 'string', description: 'Alert ID to acknowledge', required: true }
          },
          required: ['alert_id']
        },
        handler: this.handleAcknowledgeAlert.bind(this)
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.close_alert`,
        description: 'Close an alert in Nova GoAlert',
        inputSchema: {
          type: 'object',
          properties: {
            alert_id: { type: 'string', description: 'Alert ID to close', required: true }
          },
          required: ['alert_id']
        },
        handler: this.handleCloseAlert.bind(this)
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.get_schedules`,
        description: 'Get on-call schedules from Nova GoAlert',
        inputSchema: {
          type: 'object',
          properties: {
            search: { type: 'string', description: 'Search term for schedule names' },
            favorites_only: { type: 'boolean', description: 'Show only favorite schedules' }
          }
        },
        handler: this.handleGetSchedules.bind(this)
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.get_oncall`,
        description: 'Get current on-call information',
        inputSchema: {
          type: 'object',
          properties: {
            schedule_id: { type: 'string', description: 'Specific schedule ID' },
            service_id: { type: 'string', description: 'Service ID' }
          }
        },
        handler: this.handleGetOnCall.bind(this)
      });

      await novaMCPServer.registerTool({
        name: `${this.config.mcpToolConfig.toolPrefix}.escalate_incident`,
        description: 'Escalate an incident to the next level',
        inputSchema: {
          type: 'object',
          properties: {
            alert_id: { type: 'string', description: 'Alert ID to escalate', required: true },
            reason: { type: 'string', description: 'Escalation reason' }
          },
          required: ['alert_id']
        },
        handler: this.handleEscalateIncident.bind(this)
      });

      logger.info(`Registered ${this.config.mcpToolConfig.enabledTools.length} Nova GoAlert MCP tools`);
    } catch (error) {
      logger.warn('Failed to register GoAlert MCP tools:', error.message);
    }
  }

  /**
   * Set up event listeners for AI alerting
   */
  private setupAIEventListeners(): void {
    if (sentinelIntegration) {
      // Create alerts from Sentinel incidents
      sentinelIntegration.on('incidentCreated', async (incident) => {
        try {
          if (incident.severity === 'critical' || incident.severity === 'high') {
            await this.createAlertFromIncident(incident);
          }
        } catch (error) {
          logger.warn('Failed to create alert from Sentinel incident:', error.message);
        }
      });
    }

    if (aiMonitoringSystem) {
      // Create alerts from AI security events
      aiMonitoringSystem.on('securityAlert', async (alert) => {
        try {
          await this.createAlertFromSecurityEvent(alert);
        } catch (error) {
          logger.warn('Failed to create alert from security event:', error.message);
        }
      });

      // Create alerts from bias detection
      aiMonitoringSystem.on('biasAssessed', async (biasMetric) => {
        if (!biasMetric.passed && biasMetric.biasScore > 0.5) { // High bias threshold
          try {
            await this.createAlertFromBiasEvent(biasMetric);
          } catch (error) {
            logger.warn('Failed to create alert from bias event:', error.message);
          }
        }
      });

      // Create alerts from model drift
      aiMonitoringSystem.on('driftDetected', async (driftMetric) => {
        if (driftMetric.alertTriggered && driftMetric.driftScore > 0.7) { // High drift threshold
          try {
            await this.createAlertFromDriftEvent(driftMetric);
          } catch (error) {
            logger.warn('Failed to create alert from drift event:', error.message);
          }
        }
      });
    }
  }

  /**
   * Sync with existing GoAlert data via proxy
   */
  private async syncWithGoAlert(): Promise<void> {
    try {
      // Get existing services from Nova GoAlert proxy
      const servicesResponse = await axios.get(`${this.goAlertProxyUrl}/services`, {
        headers: this.getAuthHeaders()
      });

      if (servicesResponse.data && servicesResponse.data.services) {
        for (const service of servicesResponse.data.services) {
          const goAlertService: GoAlertService = {
            id: service.id,
            name: service.name,
            description: service.description,
            escalationPolicyId: service.escalation_policy_id,
            isActive: !service.maintenance_expires_at,
            labels: service.labels || {}
          };

          this.services.set(service.id, goAlertService);
        }

        logger.info(`Synced ${servicesResponse.data.services.length} services from Nova GoAlert`);
      }

      // Get existing schedules
      const schedulesResponse = await axios.get(`${this.goAlertProxyUrl}/schedules`, {
        headers: this.getAuthHeaders()
      });

      if (schedulesResponse.data && schedulesResponse.data.schedules) {
        for (const schedule of schedulesResponse.data.schedules) {
          const goAlertSchedule: GoAlertSchedule = {
            id: schedule.id,
            name: schedule.name,
            description: schedule.description,
            timeZone: schedule.time_zone,
            targets: schedule.targets || [],
            rules: schedule.rules || [],
            isActive: true
          };

          this.schedules.set(schedule.id, goAlertSchedule);
        }

        logger.info(`Synced ${schedulesResponse.data.schedules.length} schedules from Nova GoAlert`);
      }
    } catch (error) {
      logger.warn('Failed to sync with Nova GoAlert:', error.message);
    }
  }

  private async initializeAIServices(): Promise<void> {
    const defaultServices = [
      {
        name: 'AI Fabric Core',
        description: 'Core AI orchestration engine',
        escalationPolicy: 'ai-platform-critical',
        labels: { component: 'ai-fabric-core', team: 'ai-platform' }
      },
      {
        name: 'AI Security',
        description: 'AI security monitoring and compliance',
        escalationPolicy: 'ai-security-critical',
        labels: { component: 'ai-security', team: 'ai-security' }
      },
      {
        name: 'AI Performance',
        description: 'AI performance and model drift monitoring',
        escalationPolicy: 'ai-ops-standard',
        labels: { component: 'ai-performance', team: 'ai-ops' }
      },
      {
        name: 'RAG Engine',
        description: 'Retrieval-Augmented Generation services',
        escalationPolicy: 'ai-platform-standard',
        labels: { component: 'rag-engine', team: 'ai-platform' }
      },
      {
        name: 'MCP Server',
        description: 'Model Context Protocol server',
        escalationPolicy: 'ai-platform-standard',
        labels: { component: 'mcp-server', team: 'ai-platform' }
      }
    ];

    for (const service of defaultServices) {
      try {
        await this.createService(service.name, service.description, service.escalationPolicy, service.labels);
      } catch (error) {
        logger.warn('Failed to create default service', { 
          service: service.name, 
          error: error.message 
        });
      }
    }
  }

  private async initializeAISchedules(): Promise<void> {
    for (const [scheduleId, config] of Object.entries(this.config.aiTeamSchedules)) {
      try {
        await this.createSchedule(scheduleId, config.name, config.timezone);
      } catch (error) {
        logger.warn('Failed to create default schedule', { 
          scheduleId, 
          error: error.message 
        });
      }
    }
  }

  private async initializeAlertRules(): Promise<void> {
    const defaultRules = [
      {
        name: 'Critical AI Failure',
        description: 'Alert for critical AI service failures',
        conditions: [
          {
            type: 'event_pattern' as const,
            field: 'severity',
            operator: 'eq' as const,
            value: 'critical'
          }
        ],
        serviceId: 'ai-fabric-core',
        priority: 1
      },
      {
        name: 'Security Incident',
        description: 'Alert for AI security incidents',
        conditions: [
          {
            type: 'event_pattern' as const,
            field: 'source',
            operator: 'eq' as const,
            value: 'security'
          }
        ],
        serviceId: 'ai-security',
        priority: 1
      },
      {
        name: 'Performance Degradation',
        description: 'Alert for AI performance issues',
        conditions: [
          {
            type: 'metric_threshold' as const,
            field: 'response_time',
            operator: 'gt' as const,
            value: 10000,
            timeWindow: 300
          }
        ],
        serviceId: 'ai-performance',
        priority: 2
      },
      {
        name: 'Model Drift Detection',
        description: 'Alert for model drift detection',
        conditions: [
          {
            type: 'event_pattern' as const,
            field: 'type',
            operator: 'eq' as const,
            value: 'model_drift'
          }
        ],
        serviceId: 'ai-performance',
        priority: 2
      }
    ];

    for (const rule of defaultRules) {
      try {
        await this.createAlertRule(rule);
      } catch (error) {
        logger.warn('Failed to create default alert rule', { 
          rule: rule.name, 
          error: error.message 
        });
      }
    }
  }

  private startSyncLoop(): void {
    this.syncInterval = setInterval(async () => {
      await this.syncWithGoAlert();
    }, this.config.syncInterval);

    logger.info('GoAlert sync loop started');
  }

  private async syncWithGoAlert(): Promise<void> {
    try {
      // Sync alert statuses
      await this.syncAlertStatuses();
      
      // Sync schedules and on-call information
      await this.syncSchedules();
      
      // Check for auto-acknowledgment timeouts
      await this.checkAutoAcknowledgmentTimeouts();
      
    } catch (error) {
      logger.warn('Failed to sync with GoAlert', { error: error.message });
    }
  }

  private async syncAlertStatuses(): Promise<void> {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(a => a.goAlertId && (a.status === 'active' || a.status === 'acknowledged'));

    for (const alert of activeAlerts) {
      try {
        const goAlertStatus = await this.getGoAlertStatus(alert.goAlertId!);
        
        if (goAlertStatus === 'closed' && alert.status !== 'closed') {
          alert.status = 'closed';
          alert.closedAt = new Date();
          alert.closedBy = 'system';
          this.alerts.set(alert.id, alert);
          this.emit('alertClosed', alert);
        }
      } catch (error) {
        logger.warn('Failed to sync alert status', { 
          alertId: alert.id, 
          goAlertId: alert.goAlertId, 
          error: error.message 
        });
      }
    }
  }

  private async syncSchedules(): Promise<void> {
    // Sync schedule information from GoAlert
    // This is a placeholder for now
  }

  private async checkAutoAcknowledgmentTimeouts(): Promise<void> {
    const activeAlerts = Array.from(this.alerts.values())
      .filter(a => a.status === 'active');

    const now = new Date();
    for (const alert of activeAlerts) {
      const ageMs = now.getTime() - alert.createdAt.getTime();
      
      if (ageMs > this.config.autoAcknowledgeTimeout) {
        try {
          await this.acknowledgeAlert(alert.id, 'system', 'Auto-acknowledged due to timeout');
        } catch (error) {
          logger.warn('Failed to auto-acknowledge alert', { 
            alertId: alert.id, 
            error: error.message 
          });
        }
      }
    }
  }

  private async shouldSuppressAlert(alert: NovaAlert): Promise<boolean> {
    // Check maintenance mode
    if (this.config.alertSuppression.maintenanceMode) {
      const service = this.services.get(alert.serviceId);
      if (service?.maintenanceExpiresAt && service.maintenanceExpiresAt > new Date()) {
        return true;
      }
    }

    // Check dependency failures
    if (this.config.alertSuppression.dependencyFailures) {
      // Placeholder for dependency checking logic
    }

    return false;
  }

  private async isDuplicateAlert(alert: NovaAlert): Promise<boolean> {
    if (!this.config.enableDuplicateDetection) {
      return false;
    }

    const recentWindow = new Date(Date.now() - this.config.alertSuppression.duplicateWindow);
    const recentAlerts = Array.from(this.alerts.values())
      .filter(a => 
        a.createdAt >= recentWindow &&
        a.serviceId === alert.serviceId &&
        a.component === alert.component &&
        a.summary === alert.summary &&
        a.status !== 'closed'
      );

    return recentAlerts.length > 0;
  }

  private shouldCreateTicket(alert: NovaAlert): boolean {
    return alert.severity === 'critical' || alert.severity === 'high';
  }

  private getAlertsByComponent(alerts: NovaAlert[]): Record<string, number> {
    const byComponent: Record<string, number> = {};
    for (const alert of alerts) {
      byComponent[alert.component] = (byComponent[alert.component] || 0) + 1;
    }
    return byComponent;
  }

  private getAlertsBySeverity(alerts: NovaAlert[]): Record<string, number> {
    const bySeverity: Record<string, number> = {};
    for (const alert of alerts) {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    }
    return bySeverity;
  }

  private getAlertsByStatus(alerts: NovaAlert[]): Record<string, number> {
    const byStatus: Record<string, number> = {};
    for (const alert of alerts) {
      byStatus[alert.status] = (byStatus[alert.status] || 0) + 1;
    }
    return byStatus;
  }

  // Event handlers
  private async handleSentinelIncident(incident: any): Promise<void> {
    const alert = await this.createAlert({
      serviceId: this.getServiceIdForComponent(incident.component),
      summary: incident.summary,
      details: incident.description,
      source: 'sentinel',
      severity: incident.severity,
      component: incident.component,
      metadata: {
        sentinelIncidentId: incident.id,
        monitorId: incident.monitorId
      },
      sentinelIncidentId: incident.id
    });

    logger.info('Created alert from Sentinel incident', { 
      alertId: alert, 
      incidentId: incident.id 
    });
  }

  private async handleSentinelAlert(sentinelAlert: any): Promise<void> {
    const alert = await this.createAlert({
      serviceId: this.getServiceIdForComponent(sentinelAlert.component),
      summary: sentinelAlert.message,
      details: `Sentinel alert: ${sentinelAlert.type}`,
      source: 'sentinel',
      severity: sentinelAlert.severity,
      component: sentinelAlert.component,
      metadata: {
        sentinelAlertId: sentinelAlert.id,
        alertType: sentinelAlert.type,
        metrics: sentinelAlert.metrics
      }
    });

    logger.info('Created alert from Sentinel alert', { 
      alertId: alert, 
      sentinelAlertId: sentinelAlert.id 
    });
  }

  private async handleMonitorStatusChange(event: any): Promise<void> {
    if (event.monitor.status === 'down' && event.previousStatus === 'up') {
      await this.createAlert({
        serviceId: this.getServiceIdForComponent(event.monitor.component),
        summary: `${event.monitor.name} is down`,
        details: `Monitor ${event.monitor.name} has changed status from ${event.previousStatus} to ${event.monitor.status}`,
        source: 'monitoring',
        severity: this.getSeverityForMonitorType(event.monitor.type),
        component: event.monitor.component,
        metadata: {
          monitorId: event.monitor.id,
          previousStatus: event.previousStatus,
          newStatus: event.monitor.status,
          metrics: event.metrics
        }
      });
    }
  }

  private async handleSecurityAlert(securityAlert: any): Promise<void> {
    const alert = await this.createAlert({
      serviceId: 'ai-security',
      summary: `Security Alert: ${securityAlert.alertType}`,
      details: securityAlert.description,
      source: 'security',
      severity: securityAlert.severity,
      component: 'ai-security',
      metadata: {
        alertType: securityAlert.alertType,
        indicators: securityAlert.indicators,
        mitigationActions: securityAlert.mitigationActions
      }
    });

    logger.info('Created alert from security alert', { 
      alertId: alert, 
      securityAlertId: securityAlert.id 
    });
  }

  private async handleBiasAlert(biasMetric: any): Promise<void> {
    if (!biasMetric.passed) {
      await this.createAlert({
        serviceId: 'ai-performance',
        summary: `Bias detected in model ${biasMetric.model}`,
        details: `Bias score ${biasMetric.biasScore} exceeds threshold ${biasMetric.threshold} for ${biasMetric.protectedAttribute}`,
        source: 'ai_fabric',
        severity: biasMetric.biasScore > biasMetric.threshold * 2 ? 'high' : 'medium',
        component: 'ai-bias-detection',
        metadata: {
          model: biasMetric.model,
          biasScore: biasMetric.biasScore,
          threshold: biasMetric.threshold,
          protectedAttribute: biasMetric.protectedAttribute,
          testType: biasMetric.testType
        }
      });
    }
  }

  private async handleModelDrift(driftMetric: any): Promise<void> {
    if (driftMetric.alertTriggered) {
      await this.createAlert({
        serviceId: 'ai-performance',
        summary: `Model drift detected in ${driftMetric.model}`,
        details: `Drift score ${driftMetric.driftScore} exceeds threshold ${driftMetric.threshold}`,
        source: 'ai_fabric',
        severity: driftMetric.driftScore > driftMetric.threshold * 2 ? 'high' : 'medium',
        component: 'ai-drift-detection',
        metadata: {
          model: driftMetric.model,
          driftScore: driftMetric.driftScore,
          threshold: driftMetric.threshold,
          driftType: driftMetric.driftType,
          detectionMethod: driftMetric.detectionMethod
        }
      });
    }
  }

  private async handleAuditEvent(auditEvent: any): Promise<void> {
    if (auditEvent.severity === 'critical' || auditEvent.eventType === 'policy_violation') {
      await this.createAlert({
        serviceId: 'ai-security',
        summary: `Audit Alert: ${auditEvent.eventType}`,
        details: `Critical audit event detected: ${JSON.stringify(auditEvent.details)}`,
        source: 'ai_fabric',
        severity: auditEvent.severity,
        component: 'ai-compliance',
        metadata: {
          eventId: auditEvent.id,
          eventType: auditEvent.eventType,
          userId: auditEvent.userId,
          sessionId: auditEvent.sessionId,
          riskScore: auditEvent.riskScore,
          complianceFlags: auditEvent.complianceFlags
        }
      });
    }
  }

  // Helper methods
  private getServiceIdForComponent(component: string): string {
    const componentServiceMap: Record<string, string> = {
      'ai-fabric-core': 'ai-fabric-core',
      'rag-engine': 'rag-engine',
      'mcp-server': 'mcp-server',
      'nova-local-ai': 'ai-fabric-core',
      'ai-security': 'ai-security',
      'ai-monitoring': 'ai-performance',
      'ai-bias-detection': 'ai-performance',
      'ai-drift-detection': 'ai-performance',
      'ai-compliance': 'ai-security'
    };

    return componentServiceMap[component] || 'ai-fabric-core';
  }

  private getSeverityForMonitorType(type: string): NovaAlert['severity'] {
    switch (type) {
      case 'ai_service':
        return 'high';
      case 'ai_endpoint':
        return 'medium';
      case 'rag_service':
        return 'medium';
      case 'custom_model':
        return 'low';
      default:
        return 'medium';
    }
  }

  // MCP Tool Handlers
  private async handleGetServices(args: any): Promise<any> {
    try {
      const response = await axios.get(`${this.goAlertProxyUrl}/services`, {
        headers: this.getAuthHeaders(),
        params: args
      });

      return {
        success: true,
        data: {
          services: response.data.services || [],
          total: response.data.services?.length || 0,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get services: ${error.message}`
      };
    }
  }

  private async handleGetAlerts(args: any): Promise<any> {
    try {
      const response = await axios.get(`${this.goAlertProxyUrl}/alerts`, {
        headers: this.getAuthHeaders(),
        params: args
      });

      return {
        success: true,
        data: {
          alerts: response.data.alerts || [],
          total: response.data.alerts?.length || 0,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get alerts: ${error.message}`
      };
    }
  }

  private async handleCreateAlert(args: any): Promise<any> {
    try {
      const response = await axios.post(`${this.goAlertProxyUrl}/alerts`, {
        service_id: args.service_id,
        summary: args.summary,
        details: args.details,
        dedup_key: args.dedup_key || crypto.randomUUID()
      }, {
        headers: this.getAuthHeaders()
      });

      return {
        success: true,
        data: {
          alert_id: response.data.id,
          message: 'Alert created successfully via Nova GoAlert'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create alert: ${error.message}`
      };
    }
  }

  private async handleAcknowledgeAlert(args: any): Promise<any> {
    try {
      const response = await axios.post(`${this.goAlertProxyUrl}/alerts/${args.alert_id}/acknowledge`, {}, {
        headers: this.getAuthHeaders()
      });

      return {
        success: true,
        data: {
          alert_id: args.alert_id,
          message: 'Alert acknowledged successfully'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to acknowledge alert: ${error.message}`
      };
    }
  }

  private async handleCloseAlert(args: any): Promise<any> {
    try {
      const response = await axios.post(`${this.goAlertProxyUrl}/alerts/${args.alert_id}/close`, {}, {
        headers: this.getAuthHeaders()
      });

      return {
        success: true,
        data: {
          alert_id: args.alert_id,
          message: 'Alert closed successfully'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to close alert: ${error.message}`
      };
    }
  }

  private async handleGetSchedules(args: any): Promise<any> {
    try {
      const response = await axios.get(`${this.goAlertProxyUrl}/schedules`, {
        headers: this.getAuthHeaders(),
        params: args
      });

      return {
        success: true,
        data: {
          schedules: response.data.schedules || [],
          total: response.data.schedules?.length || 0,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get schedules: ${error.message}`
      };
    }
  }

  private async handleGetOnCall(args: any): Promise<any> {
    try {
      let url = `${this.goAlertProxyUrl}/oncall`;
      if (args.schedule_id) {
        url += `/${args.schedule_id}`;
      } else if (args.service_id) {
        url += `?service_id=${args.service_id}`;
      }

      const response = await axios.get(url, {
        headers: this.getAuthHeaders()
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get on-call information: ${error.message}`
      };
    }
  }

  private async handleEscalateIncident(args: any): Promise<any> {
    try {
      const response = await axios.post(`${this.goAlertProxyUrl}/alerts/${args.alert_id}/escalate`, {
        reason: args.reason
      }, {
        headers: this.getAuthHeaders()
      });

      return {
        success: true,
        data: {
          alert_id: args.alert_id,
          message: 'Incident escalated successfully'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to escalate incident: ${error.message}`
      };
    }
  }

  // Helper methods for AI event handling
  private async createAlertFromIncident(incident: any): Promise<void> {
    try {
      const serviceId = this.getServiceIdForComponent(incident.component);
      
      await this.createAlert({
        serviceId,
        summary: incident.summary,
        details: incident.description,
        source: 'sentinel',
        severity: incident.severity,
        component: incident.component,
        metadata: {
          sentinelIncidentId: incident.id,
          monitorId: incident.monitorId
        }
      });

      logger.info('Created GoAlert alert from Sentinel incident', { 
        incidentId: incident.id,
        serviceId 
      });
    } catch (error) {
      logger.warn('Failed to create GoAlert alert from incident:', error.message);
    }
  }

  private async createAlertFromSecurityEvent(alert: any): Promise<void> {
    try {
      const serviceId = this.getServiceIdForComponent('ai-security');
      
      await this.createAlert({
        serviceId,
        summary: `AI Security Alert: ${alert.alertType}`,
        details: alert.description,
        source: 'ai_fabric',
        severity: alert.severity,
        component: 'ai-security',
        metadata: {
          alertType: alert.alertType,
          indicators: alert.indicators
        }
      });

      logger.info('Created GoAlert alert from AI security event', { 
        alertId: alert.id,
        serviceId 
      });
    } catch (error) {
      logger.warn('Failed to create GoAlert alert from security event:', error.message);
    }
  }

  private async createAlertFromBiasEvent(biasMetric: any): Promise<void> {
    try {
      const serviceId = this.getServiceIdForComponent('ai-performance');
      
      await this.createAlert({
        serviceId,
        summary: `AI Bias Alert: ${biasMetric.model}`,
        details: `High bias detected: ${biasMetric.biasScore} > ${biasMetric.threshold} for ${biasMetric.protectedAttribute}`,
        source: 'ai_fabric',
        severity: biasMetric.biasScore > 0.7 ? 'high' : 'medium',
        component: 'ai-bias-detection',
        metadata: {
          model: biasMetric.model,
          biasScore: biasMetric.biasScore,
          protectedAttribute: biasMetric.protectedAttribute
        }
      });

      logger.info('Created GoAlert alert from bias detection', { 
        model: biasMetric.model,
        serviceId 
      });
    } catch (error) {
      logger.warn('Failed to create GoAlert alert from bias event:', error.message);
    }
  }

  private async createAlertFromDriftEvent(driftMetric: any): Promise<void> {
    try {
      const serviceId = this.getServiceIdForComponent('ai-performance');
      
      await this.createAlert({
        serviceId,
        summary: `AI Model Drift Alert: ${driftMetric.model}`,
        details: `Model drift detected: ${driftMetric.driftScore} > ${driftMetric.threshold}`,
        source: 'ai_fabric',
        severity: driftMetric.driftScore > 0.8 ? 'high' : 'medium',
        component: 'ai-drift-detection',
        metadata: {
          model: driftMetric.model,
          driftScore: driftMetric.driftScore,
          driftType: driftMetric.driftType
        }
      });

      logger.info('Created GoAlert alert from model drift', { 
        model: driftMetric.model,
        serviceId 
      });
    } catch (error) {
      logger.warn('Failed to create GoAlert alert from drift event:', error.message);
    }
  }

  // Nova GoAlert proxy integration methods
  private async createGoAlertService(serviceConfig: any): Promise<void> {
    try {
      await axios.post(`${this.goAlertProxyUrl}/services`, {
        name: serviceConfig.name,
        description: serviceConfig.description,
        escalation_policy_id: serviceConfig.escalationPolicy,
        labels: {
          component: 'ai-fabric',
          team: 'ai-platform'
        }
      }, {
        headers: this.getAuthHeaders()
      });
    } catch (error) {
      logger.warn('Failed to create GoAlert service via proxy', { 
        service: serviceConfig.name, 
        error: error.message 
      });
    }
  }

  private async checkExistingService(name: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.goAlertProxyUrl}/services`, {
        headers: this.getAuthHeaders(),
        params: { search: name }
      });

      return response.data.services && response.data.services.some((s: any) => s.name === name);
    } catch (error) {
      logger.warn('Failed to check existing service:', error.message);
      return false;
    }
  }

  private getServiceIdForComponent(component: string): string {
    // Map AI components to GoAlert service IDs
    const componentServiceMap: Record<string, string> = {
      'ai-fabric-core': 'ai-fabric-core',
      'rag-engine': 'ai-fabric-core',
      'mcp-server': 'ai-fabric-core',
      'nova-local-ai': 'ai-fabric-core',
      'ai-security': 'ai-security',
      'ai-monitoring': 'ai-performance',
      'ai-bias-detection': 'ai-performance',
      'ai-drift-detection': 'ai-performance',
      'ai-compliance': 'ai-security'
    };

    return componentServiceMap[component] || 'ai-fabric-core';
  }

  private async createService(name: string, description: string, escalationPolicyId: string, labels: Record<string, string>): Promise<string> {
    // Placeholder for service creation
    const serviceId = crypto.randomUUID();
    
    const service: GoAlertService = {
      id: serviceId,
      name,
      description,
      escalationPolicyId,
      isActive: true,
      labels
    };

    this.services.set(serviceId, service);
    return serviceId;
  }

  private async createSchedule(id: string, name: string, timezone: string): Promise<string> {
    // Placeholder for schedule creation
    const schedule: GoAlertSchedule = {
      id,
      name,
      description: `AI team schedule: ${name}`,
      timeZone: timezone,
      targets: [],
      rules: [],
      isActive: true
    };

    this.schedules.set(id, schedule);
    return id;
  }

  private async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<string> {
    const ruleId = crypto.randomUUID();
    const fullRule: AlertRule = {
      ...rule,
      id: ruleId,
      isActive: true
    };

    this.alertRules.set(ruleId, fullRule);
    return ruleId;
  }

  private async createGoAlert(alert: NovaAlert): Promise<string> {
    // Create alert via Nova GoAlert proxy
    const resp = await axios.post(`${this.goAlertProxyUrl}/alerts`, {
      serviceID: alert.serviceId,
      summary: alert.summary,
      details: alert.details || ''
    }, {
      headers: this.getAuthHeaders()
    });
    return resp.data?.alert?.id || crypto.randomUUID();
  }

  private async acknowledgeGoAlert(goAlertId: string, userId: string): Promise<void> {
    await axios.post(`${this.goAlertProxyUrl}/alerts/${goAlertId}/acknowledge`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  private async closeGoAlert(goAlertId: string): Promise<void> {
    await axios.post(`${this.goAlertProxyUrl}/alerts/${goAlertId}/close`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  private async getGoAlertStatus(goAlertId: string): Promise<string> {
    const resp = await axios.get(`${this.goAlertProxyUrl}/alerts?status=active&limit=1&offset=0`, {
      headers: this.getAuthHeaders()
    });
    const found = Array.isArray(resp.data?.alerts) ? resp.data.alerts.find((a: any) => a.id === goAlertId) : undefined;
    return found ? 'active' : 'closed';
  }

  private async getGoAlertOnCall(scheduleId: string): Promise<any> {
    const resp = await axios.get(`${this.goAlertProxyUrl}/schedules/${scheduleId}/on-call`, {
      headers: this.getAuthHeaders()
    });
    return resp.data?.onCall || [];
  }

  private async createAlertTicket(alert: NovaAlert): Promise<string> {
    // Placeholder for ticket creation
    return crypto.randomUUID();
  }

  private async updateAlertTicket(ticketId: string, status: string, message?: string): Promise<void> {
    // Placeholder for ticket update
    logger.debug('Would update ticket', { ticketId, status, message });
  }

  private async resolveAlertTicket(ticketId: string, reason?: string): Promise<void> {
    // Placeholder for ticket resolution
    logger.debug('Would resolve ticket', { ticketId, reason });
  }

  private async linkToSentinelIncident(alert: NovaAlert, incidentId: string): Promise<void> {
    // Placeholder for linking to Sentinel incident
    logger.debug('Would link to Sentinel incident', { alertId: alert.id, incidentId });
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down Nova GoAlert Integration...');
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.isInitialized = false;
    logger.info('Nova GoAlert Integration shutdown complete');
  }
}

// Export singleton instance
export const goAlertIntegration = new NovaGoAlertIntegration();
