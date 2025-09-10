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
/**
 * Nova GoAlert Integration System
 *
 * Integrates with the existing Nova GoAlert proxy to provide AI alerting tools
 */
export class NovaGoAlertIntegration extends EventEmitter {
    services = new Map();
    escalationPolicies = new Map();
    schedules = new Map();
    alerts = new Map();
    alertRules = new Map();
    isInitialized = false;
    novaApiUrl = process.env.NOVA_API_BASE_URL || 'http://localhost:3000';
    goAlertProxyUrl = `${this.novaApiUrl}/api/v2/goalert`;
    apiToken = process.env.NOVA_API_TOKEN || '';
    // Integration configuration
    config = {
        enableAIAlerting: true,
        enableMCPTools: true,
        autoCreateServices: true,
        aiAlertThresholds: {
            responseTime: 15000, // 15 seconds
            errorRate: 0.1, // 10%
            availability: 0.95, // 95%
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
                'escalate_incident',
            ],
        },
        aiServices: {
            'ai-fabric-core': {
                name: 'AI Fabric Core',
                description: 'Core AI orchestration engine',
                escalationPolicy: 'ai-platform-critical',
            },
            'ai-security': {
                name: 'AI Security',
                description: 'AI security monitoring and compliance',
                escalationPolicy: 'ai-security-critical',
            },
            'ai-performance': {
                name: 'AI Performance',
                description: 'AI performance and model monitoring',
                escalationPolicy: 'ai-ops-standard',
            },
        },
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
    async initialize() {
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
        }
        catch (error) {
            logger.error('Failed to initialize GoAlert Integration:', error);
            throw error;
        }
    }
    /**
     * Create an alert in GoAlert
     */
    async createAlert(alert) {
        const alertId = crypto.randomUUID();
        const fullAlert = {
            ...alert,
            id: alertId,
            createdAt: new Date(),
            status: 'triggered',
            escalatedSteps: 0,
        };
        // Check for alert suppression
        if (await this.shouldSuppressAlert(fullAlert)) {
            logger.info('Alert suppressed', { alertId, reason: 'suppression_rule_matched' });
            return alertId;
        }
        // Check for duplicates
        if (this.config.enableDuplicateDetection && (await this.isDuplicateAlert(fullAlert))) {
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
                component: alert.component,
            });
            this.emit('alertCreated', fullAlert);
        }
        catch (error) {
            logger.error('Failed to create alert in GoAlert', { alertId, error: error.message });
            fullAlert.status = 'triggered'; // Keep as triggered for retry
        }
        return alertId;
    }
    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(alertId, userId, message) {
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
            }
            catch (error) {
                logger.warn('Failed to acknowledge alert in GoAlert', {
                    alertId,
                    goAlertId: alert.goAlertId,
                    error: error.message,
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
            component: alert.component,
        });
        this.emit('alertAcknowledged', alert);
    }
    /**
     * Close an alert
     */
    async closeAlert(alertId, userId, reason) {
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
            }
            catch (error) {
                logger.warn('Failed to close alert in GoAlert', {
                    alertId,
                    goAlertId: alert.goAlertId,
                    error: error.message,
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
            component: alert.component,
        });
        this.emit('alertClosed', alert);
    }
    /**
     * Get active alerts
     */
    getActiveAlerts(serviceId) {
        const alerts = Array.from(this.alerts.values()).filter((a) => a.status === 'active' || a.status === 'acknowledged');
        if (serviceId) {
            return alerts.filter((a) => a.serviceId === serviceId);
        }
        return alerts;
    }
    /**
     * Get on-call information
     */
    async getOnCallInfo(scheduleId) {
        try {
            if (scheduleId) {
                const schedule = this.schedules.get(scheduleId);
                if (!schedule) {
                    throw new Error(`Schedule ${scheduleId} not found`);
                }
                return await this.getGoAlertOnCall(scheduleId);
            }
            // Get all AI team on-call info
            const onCallInfo = {};
            for (const [id, schedule] of this.schedules) {
                try {
                    onCallInfo[id] = await this.getGoAlertOnCall(id);
                    // Include schedule information in the result
                    onCallInfo[id].schedule = {
                        name: schedule.name,
                        description: schedule.description,
                        timezone: schedule.timeZone,
                    };
                }
                catch (error) {
                    logger.warn('Failed to get on-call info for schedule', {
                        scheduleId: id,
                        scheduleName: schedule.name,
                        error: error.message,
                    });
                    onCallInfo[id] = {
                        error: error.message,
                        schedule: {
                            name: schedule.name,
                            description: schedule.description,
                            timezone: schedule.timeZone,
                        },
                    };
                }
            }
            return onCallInfo;
        }
        catch (error) {
            logger.error('Failed to get on-call information', { error: error.message });
            throw error;
        }
    }
    /**
     * Get dashboard data
     */
    getDashboardData() {
        const alerts = Array.from(this.alerts.values());
        const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'acknowledged');
        const recentAlerts = alerts.filter((a) => a.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000));
        return {
            overview: {
                totalAlerts: recentAlerts.length,
                activeAlerts: activeAlerts.length,
                acknowledgedAlerts: activeAlerts.filter((a) => a.status === 'acknowledged').length,
                criticalAlerts: activeAlerts.filter((a) => a.severity === 'critical').length,
                services: this.services.size,
                schedules: this.schedules.size,
            },
            alertsByComponent: this.getAlertsByComponent(recentAlerts),
            alertsBySeverity: this.getAlertsBySeverity(recentAlerts),
            alertsByStatus: this.getAlertsByStatus(alerts),
            recentAlerts: recentAlerts.slice(0, 20).map((a) => ({
                id: a.id,
                summary: a.summary,
                component: a.component,
                severity: a.severity,
                status: a.status,
                createdAt: a.createdAt,
                acknowledgedAt: a.acknowledgedAt,
                acknowledgedBy: a.acknowledgedBy,
            })),
            services: Array.from(this.services.values()).map((s) => ({
                id: s.id,
                name: s.name,
                isActive: s.isActive,
                activeAlerts: activeAlerts.filter((a) => a.serviceId === s.id).length,
            })),
            escalationPolicies: Array.from(this.escalationPolicies.values()).map((p) => ({
                id: p.id,
                name: p.name,
                steps: p.steps.length,
                repeat: p.repeat,
                isActive: p.isActive,
            })),
            timestamp: new Date().toISOString(),
        };
    }
    // Private methods
    async testGoAlertProxyConnectivity() {
        try {
            // Test connection to existing Nova GoAlert proxy
            const response = await axios.get(`${this.goAlertProxyUrl}/services`, {
                headers: this.getAuthHeaders(),
                timeout: 10000,
            });
            if (response.status !== 200) {
                throw new Error(`Nova GoAlert proxy returned status ${response.status}`);
            }
            logger.info('Nova GoAlert proxy connectivity verified - found existing alerting system');
        }
        catch (error) {
            logger.error('Failed to connect to Nova GoAlert proxy:', error);
            throw new Error('Nova GoAlert proxy connectivity test failed - ensure GoAlert proxy is running');
        }
    }
    /**
     * Register AI services in existing GoAlert via proxy
     */
    async registerAIServices() {
        for (const [serviceId, serviceConfig] of Object.entries(this.config.aiServices)) {
            try {
                // Check if service already exists
                const existing = await this.checkExistingService(serviceConfig.name);
                if (existing) {
                    logger.info(`AI service already exists in GoAlert: ${serviceConfig.name} (ID: ${serviceId})`);
                    continue;
                }
                // Create service via Nova GoAlert proxy
                await this.createGoAlertService(serviceConfig);
                logger.info(`Created GoAlert service for: ${serviceConfig.name} (ID: ${serviceId})`);
            }
            catch (error) {
                logger.warn(`Failed to create GoAlert service for ${serviceConfig.name} (ID: ${serviceId}):`, error.message);
            }
        }
    }
    /**
     * Register MCP tools for AI access to GoAlert data
     */
    async registerMCPTools() {
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
                        favorites_only: { type: 'boolean', description: 'Show only favorite services' },
                    },
                },
                handler: this.handleGetServices.bind(this),
            });
            await novaMCPServer.registerTool({
                name: `${this.config.mcpToolConfig.toolPrefix}.get_alerts`,
                description: 'Get current alerts from Nova GoAlert',
                inputSchema: {
                    type: 'object',
                    properties: {
                        service_id: { type: 'string', description: 'Filter by service ID' },
                        status: {
                            type: 'string',
                            enum: ['triggered', 'active', 'closed'],
                            description: 'Alert status',
                        },
                        limit: { type: 'number', description: 'Maximum number of alerts to return' },
                    },
                },
                handler: this.handleGetAlerts.bind(this),
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
                        dedup_key: { type: 'string', description: 'Deduplication key' },
                    },
                    required: ['service_id', 'summary'],
                },
                handler: this.handleCreateAlert.bind(this),
            });
            await novaMCPServer.registerTool({
                name: `${this.config.mcpToolConfig.toolPrefix}.acknowledge_alert`,
                description: 'Acknowledge an alert in Nova GoAlert',
                inputSchema: {
                    type: 'object',
                    properties: {
                        alert_id: { type: 'string', description: 'Alert ID to acknowledge', required: true },
                    },
                    required: ['alert_id'],
                },
                handler: this.handleAcknowledgeAlert.bind(this),
            });
            await novaMCPServer.registerTool({
                name: `${this.config.mcpToolConfig.toolPrefix}.close_alert`,
                description: 'Close an alert in Nova GoAlert',
                inputSchema: {
                    type: 'object',
                    properties: {
                        alert_id: { type: 'string', description: 'Alert ID to close', required: true },
                    },
                    required: ['alert_id'],
                },
                handler: this.handleCloseAlert.bind(this),
            });
            await novaMCPServer.registerTool({
                name: `${this.config.mcpToolConfig.toolPrefix}.get_schedules`,
                description: 'Get on-call schedules from Nova GoAlert',
                inputSchema: {
                    type: 'object',
                    properties: {
                        search: { type: 'string', description: 'Search term for schedule names' },
                        favorites_only: { type: 'boolean', description: 'Show only favorite schedules' },
                    },
                },
                handler: this.handleGetSchedules.bind(this),
            });
            await novaMCPServer.registerTool({
                name: `${this.config.mcpToolConfig.toolPrefix}.get_oncall`,
                description: 'Get current on-call information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        schedule_id: { type: 'string', description: 'Specific schedule ID' },
                        service_id: { type: 'string', description: 'Service ID' },
                    },
                },
                handler: this.handleGetOnCall.bind(this),
            });
            await novaMCPServer.registerTool({
                name: `${this.config.mcpToolConfig.toolPrefix}.escalate_incident`,
                description: 'Escalate an incident to the next level',
                inputSchema: {
                    type: 'object',
                    properties: {
                        alert_id: { type: 'string', description: 'Alert ID to escalate', required: true },
                        reason: { type: 'string', description: 'Escalation reason' },
                    },
                    required: ['alert_id'],
                },
                handler: this.handleEscalateIncident.bind(this),
            });
            logger.info(`Registered ${this.config.mcpToolConfig.enabledTools.length} Nova GoAlert MCP tools`);
        }
        catch (error) {
            logger.warn('Failed to register GoAlert MCP tools:', error.message);
        }
    }
    /**
     * Set up event listeners for AI alerting
     */
    setupAIEventListeners() {
        if (sentinelIntegration) {
            // Create alerts from Sentinel incidents
            sentinelIntegration.on('incidentCreated', async (incident) => {
                try {
                    if (incident.severity === 'critical' || incident.severity === 'high') {
                        await this.createAlertFromIncident(incident);
                    }
                }
                catch (error) {
                    logger.warn('Failed to create alert from Sentinel incident:', error.message);
                }
            });
        }
        if (aiMonitoringSystem) {
            // Create alerts from AI security events
            aiMonitoringSystem.on('securityAlert', async (alert) => {
                try {
                    await this.createAlertFromSecurityEvent(alert);
                }
                catch (error) {
                    logger.warn('Failed to create alert from security event:', error.message);
                }
            });
            // Create alerts from bias detection
            aiMonitoringSystem.on('biasAssessed', async (biasMetric) => {
                if (!biasMetric.passed && biasMetric.biasScore > 0.5) {
                    // High bias threshold
                    try {
                        await this.createAlertFromBiasEvent(biasMetric);
                    }
                    catch (error) {
                        logger.warn('Failed to create alert from bias event:', error.message);
                    }
                }
            });
            // Create alerts from model drift
            aiMonitoringSystem.on('driftDetected', async (driftMetric) => {
                if (driftMetric.alertTriggered && driftMetric.driftScore > 0.7) {
                    // High drift threshold
                    try {
                        await this.createAlertFromDriftEvent(driftMetric);
                    }
                    catch (error) {
                        logger.warn('Failed to create alert from drift event:', error.message);
                    }
                }
            });
        }
    }
    /**
     * Sync with existing GoAlert data via proxy
     */
    async syncWithGoAlert() {
        try {
            // Get existing services from Nova GoAlert proxy
            const servicesResponse = await axios.get(`${this.goAlertProxyUrl}/services`, {
                headers: this.getAuthHeaders(),
            });
            if (servicesResponse.data && servicesResponse.data.services) {
                for (const service of servicesResponse.data.services) {
                    const goAlertService = {
                        id: service.id,
                        name: service.name,
                        description: service.description,
                        escalationPolicyId: service.escalation_policy_id,
                        isActive: !service.maintenance_expires_at,
                        labels: service.labels || {},
                    };
                    this.services.set(service.id, goAlertService);
                }
                logger.info(`Synced ${servicesResponse.data.services.length} services from Nova GoAlert`);
            }
            // Get existing schedules
            const schedulesResponse = await axios.get(`${this.goAlertProxyUrl}/schedules`, {
                headers: this.getAuthHeaders(),
            });
            if (schedulesResponse.data && schedulesResponse.data.schedules) {
                for (const schedule of schedulesResponse.data.schedules) {
                    const goAlertSchedule = {
                        id: schedule.id,
                        name: schedule.name,
                        description: schedule.description,
                        timeZone: schedule.time_zone,
                        targets: schedule.targets || [],
                        rules: schedule.rules || [],
                        isActive: true,
                    };
                    this.schedules.set(schedule.id, goAlertSchedule);
                }
                logger.info(`Synced ${schedulesResponse.data.schedules.length} schedules from Nova GoAlert`);
            }
        }
        catch (error) {
            logger.warn('Failed to sync with Nova GoAlert:', error.message);
        }
    }
    async initializeAIServices() {
        const defaultServices = [
            {
                name: 'AI Fabric Core',
                description: 'Core AI orchestration engine',
                escalationPolicy: 'ai-platform-critical',
                labels: { component: 'ai-fabric-core', team: 'ai-platform' },
            },
            {
                name: 'AI Security',
                description: 'AI security monitoring and compliance',
                escalationPolicy: 'ai-security-critical',
                labels: { component: 'ai-security', team: 'ai-security' },
            },
            {
                name: 'AI Performance',
                description: 'AI performance and model drift monitoring',
                escalationPolicy: 'ai-ops-standard',
                labels: { component: 'ai-performance', team: 'ai-ops' },
            },
            {
                name: 'RAG Engine',
                description: 'Retrieval-Augmented Generation services',
                escalationPolicy: 'ai-platform-standard',
                labels: { component: 'rag-engine', team: 'ai-platform' },
            },
            {
                name: 'MCP Server',
                description: 'Model Context Protocol server',
                escalationPolicy: 'ai-platform-standard',
                labels: { component: 'mcp-server', team: 'ai-platform' },
            },
        ];
        for (const service of defaultServices) {
            try {
                await this.createService(service.name, service.description, service.escalationPolicy, service.labels);
            }
            catch (error) {
                logger.warn('Failed to create default service', {
                    service: service.name,
                    error: error.message,
                });
            }
        }
    }
    async initializeAISchedules() {
        for (const [scheduleId, config] of Object.entries(this.config.aiTeamSchedules)) {
            try {
                await this.createSchedule(scheduleId, config.name, config.timezone);
            }
            catch (error) {
                logger.warn('Failed to create default schedule', {
                    scheduleId,
                    error: error.message,
                });
            }
        }
    }
    async initializeAlertRules() {
        const defaultRules = [
            {
                name: 'Critical AI Failure',
                description: 'Alert for critical AI service failures',
                conditions: [
                    {
                        type: 'event_pattern',
                        field: 'severity',
                        operator: 'eq',
                        value: 'critical',
                    },
                ],
                serviceId: 'ai-fabric-core',
                priority: 1,
            },
            {
                name: 'Security Incident',
                description: 'Alert for AI security incidents',
                conditions: [
                    {
                        type: 'event_pattern',
                        field: 'source',
                        operator: 'eq',
                        value: 'security',
                    },
                ],
                serviceId: 'ai-security',
                priority: 1,
            },
            {
                name: 'Performance Degradation',
                description: 'Alert for AI performance issues',
                conditions: [
                    {
                        type: 'metric_threshold',
                        field: 'response_time',
                        operator: 'gt',
                        value: 10000,
                        timeWindow: 300,
                    },
                ],
                serviceId: 'ai-performance',
                priority: 2,
            },
            {
                name: 'Model Drift Detection',
                description: 'Alert for model drift detection',
                conditions: [
                    {
                        type: 'event_pattern',
                        field: 'type',
                        operator: 'eq',
                        value: 'model_drift',
                    },
                ],
                serviceId: 'ai-performance',
                priority: 2,
            },
        ];
        for (const rule of defaultRules) {
            try {
                await this.createAlertRule(rule);
            }
            catch (error) {
                logger.warn('Failed to create default alert rule', {
                    rule: rule.name,
                    error: error.message,
                });
            }
        }
    }
    startSyncLoop() {
        this.syncInterval = setInterval(async () => {
            await this.syncWithGoAlertStatus();
        }, this.config.syncInterval);
        logger.info('GoAlert sync loop started');
    }
    async syncWithGoAlertStatus() {
        try {
            // Sync alert statuses
            await this.syncAlertStatuses();
            // Sync schedules and on-call information
            await this.syncSchedules();
            // Check for auto-acknowledgment timeouts
            await this.checkAutoAcknowledgmentTimeouts();
        }
        catch (error) {
            logger.warn('Failed to sync with GoAlert', { error: error.message });
        }
    }
    async syncAlertStatuses() {
        const activeAlerts = Array.from(this.alerts.values()).filter((a) => a.goAlertId && (a.status === 'active' || a.status === 'acknowledged'));
        for (const alert of activeAlerts) {
            try {
                const goAlertStatus = await this.getGoAlertStatus(alert.goAlertId);
                if (goAlertStatus === 'closed' && alert.status !== 'closed') {
                    alert.status = 'closed';
                    alert.closedAt = new Date();
                    alert.closedBy = 'system';
                    this.alerts.set(alert.id, alert);
                    this.emit('alertClosed', alert);
                }
            }
            catch (error) {
                logger.warn('Failed to sync alert status', {
                    alertId: alert.id,
                    goAlertId: alert.goAlertId,
                    error: error.message,
                });
            }
        }
    }
    async syncSchedules() {
        try {
            const resp = await axios.get(`${this.goAlertProxyUrl}/schedules`, {
                headers: this.getAuthHeaders(),
            });
            const schedules = resp.data?.schedules || [];
            for (const s of schedules) {
                const schedule = {
                    id: s.id,
                    name: s.name,
                    description: s.description,
                    timeZone: s.time_zone || s.timeZone || 'UTC',
                    targets: s.targets || [],
                    rules: s.rules || [],
                    isActive: s.enabled ?? true,
                };
                this.schedules.set(schedule.id, schedule);
            }
            logger.info('Synced schedules from GoAlert', { count: schedules.length });
        }
        catch (error) {
            logger.warn('Failed to sync schedules from GoAlert', { error: error?.message });
        }
    }
    async checkAutoAcknowledgmentTimeouts() {
        const activeAlerts = Array.from(this.alerts.values()).filter((a) => a.status === 'active');
        const now = new Date();
        for (const alert of activeAlerts) {
            const ageMs = now.getTime() - alert.createdAt.getTime();
            if (ageMs > this.config.autoAcknowledgeTimeout) {
                try {
                    await this.acknowledgeAlert(alert.id, 'system', 'Auto-acknowledged due to timeout');
                }
                catch (error) {
                    logger.warn('Failed to auto-acknowledge alert', {
                        alertId: alert.id,
                        error: error.message,
                    });
                }
            }
        }
    }
    async shouldSuppressAlert(alert) {
        // Check maintenance mode
        if (this.config.alertSuppression.maintenanceMode) {
            const service = this.services.get(alert.serviceId);
            if (service?.maintenanceExpiresAt && service.maintenanceExpiresAt > new Date()) {
                return true;
            }
        }
        // Check dependency failures
        if (this.config.alertSuppression.dependencyFailures) {
            try {
                // Basic dependency suppression: if related component is already down, suppress follow-on alerts
                const related = Array.from(this.alerts.values()).find((a) => a.component !== alert.component && a.status !== 'closed' && a.severity === 'critical');
                if (related) {
                    return true;
                }
            }
            catch { }
        }
        return false;
    }
    async isDuplicateAlert(alert) {
        if (!this.config.enableDuplicateDetection) {
            return false;
        }
        const recentWindow = new Date(Date.now() - this.config.alertSuppression.duplicateWindow);
        const recentAlerts = Array.from(this.alerts.values()).filter((a) => a.createdAt >= recentWindow &&
            a.serviceId === alert.serviceId &&
            a.component === alert.component &&
            a.summary === alert.summary &&
            a.status !== 'closed');
        return recentAlerts.length > 0;
    }
    shouldCreateTicket(alert) {
        return alert.severity === 'critical' || alert.severity === 'high';
    }
    getAlertsByComponent(alerts) {
        const byComponent = {};
        for (const alert of alerts) {
            byComponent[alert.component] = (byComponent[alert.component] || 0) + 1;
        }
        return byComponent;
    }
    getAlertsBySeverity(alerts) {
        const bySeverity = {};
        for (const alert of alerts) {
            bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
        }
        return bySeverity;
    }
    getAlertsByStatus(alerts) {
        const byStatus = {};
        for (const alert of alerts) {
            byStatus[alert.status] = (byStatus[alert.status] || 0) + 1;
        }
        return byStatus;
    }
    // Event handlers
    async handleSentinelIncident(incident) {
        const alert = await this.createAlert({
            serviceId: this.getServiceIdForComponent(incident.component),
            summary: incident.summary,
            details: incident.description,
            source: 'sentinel',
            severity: incident.severity,
            component: incident.component,
            metadata: {
                sentinelIncidentId: incident.id,
                monitorId: incident.monitorId,
            },
            sentinelIncidentId: incident.id,
        });
        logger.info('Created alert from Sentinel incident', {
            alertId: alert,
            incidentId: incident.id,
        });
    }
    async handleSentinelAlert(sentinelAlert) {
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
                metrics: sentinelAlert.metrics,
            },
        });
        logger.info('Created alert from Sentinel alert', {
            alertId: alert,
            sentinelAlertId: sentinelAlert.id,
        });
    }
    async handleMonitorStatusChange(event) {
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
                    metrics: event.metrics,
                },
            });
        }
    }
    async handleSecurityAlert(securityAlert) {
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
                mitigationActions: securityAlert.mitigationActions,
            },
        });
        logger.info('Created alert from security alert', {
            alertId: alert,
            securityAlertId: securityAlert.id,
        });
    }
    async handleBiasAlert(biasMetric) {
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
                    testType: biasMetric.testType,
                },
            });
        }
    }
    async handleModelDrift(driftMetric) {
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
                    detectionMethod: driftMetric.detectionMethod,
                },
            });
        }
    }
    async handleAuditEvent(auditEvent) {
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
                    complianceFlags: auditEvent.complianceFlags,
                },
            });
        }
    }
    // Helper methods
    getServiceIdForComponent(component) {
        const componentServiceMap = {
            'ai-fabric-core': 'ai-fabric-core',
            'rag-engine': 'rag-engine',
            'mcp-server': 'mcp-server',
            'nova-local-ai': 'ai-fabric-core',
            'ai-security': 'ai-security',
            'ai-monitoring': 'ai-performance',
            'ai-bias-detection': 'ai-performance',
            'ai-drift-detection': 'ai-performance',
            'ai-compliance': 'ai-security',
        };
        return componentServiceMap[component] || 'ai-fabric-core';
    }
    getSeverityForMonitorType(type) {
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
    async handleGetServices(args) {
        try {
            const response = await axios.get(`${this.goAlertProxyUrl}/services`, {
                headers: this.getAuthHeaders(),
                params: args,
            });
            return {
                success: true,
                data: {
                    services: response.data.services || [],
                    total: response.data.services?.length || 0,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get services: ${error.message}`,
            };
        }
    }
    async handleGetAlerts(args) {
        try {
            const response = await axios.get(`${this.goAlertProxyUrl}/alerts`, {
                headers: this.getAuthHeaders(),
                params: args,
            });
            return {
                success: true,
                data: {
                    alerts: response.data.alerts || [],
                    total: response.data.alerts?.length || 0,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get alerts: ${error.message}`,
            };
        }
    }
    async handleCreateAlert(args) {
        try {
            const response = await axios.post(`${this.goAlertProxyUrl}/alerts`, {
                service_id: args.service_id,
                summary: args.summary,
                details: args.details,
                dedup_key: args.dedup_key || crypto.randomUUID(),
            }, {
                headers: this.getAuthHeaders(),
            });
            return {
                success: true,
                data: {
                    alert_id: response.data.id,
                    message: 'Alert created successfully via Nova GoAlert',
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to create alert: ${error.message}`,
            };
        }
    }
    async handleAcknowledgeAlert(args) {
        try {
            const response = await axios.post(`${this.goAlertProxyUrl}/alerts/${args.alert_id}/acknowledge`, {}, {
                headers: this.getAuthHeaders(),
            });
            return {
                success: true,
                data: {
                    alert_id: args.alert_id,
                    message: 'Alert acknowledged successfully',
                    acknowledged_by: response.data?.acknowledged_by,
                    acknowledged_at: response.data?.acknowledged_at || new Date().toISOString(),
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to acknowledge alert: ${error.message}`,
            };
        }
    }
    async handleCloseAlert(args) {
        try {
            const response = await axios.post(`${this.goAlertProxyUrl}/alerts/${args.alert_id}/close`, {}, {
                headers: this.getAuthHeaders(),
            });
            return {
                success: true,
                data: {
                    alert_id: args.alert_id,
                    message: 'Alert closed successfully',
                    closed_by: response.data?.closed_by,
                    closed_at: response.data?.closed_at || new Date().toISOString(),
                    status: response.data?.status || 'closed',
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to close alert: ${error.message}`,
            };
        }
    }
    async handleGetSchedules(args) {
        try {
            const response = await axios.get(`${this.goAlertProxyUrl}/schedules`, {
                headers: this.getAuthHeaders(),
                params: args,
            });
            return {
                success: true,
                data: {
                    schedules: response.data.schedules || [],
                    total: response.data.schedules?.length || 0,
                    timestamp: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get schedules: ${error.message}`,
            };
        }
    }
    async handleGetOnCall(args) {
        try {
            let url = `${this.goAlertProxyUrl}/oncall`;
            if (args.schedule_id) {
                url += `/${args.schedule_id}`;
            }
            else if (args.service_id) {
                url += `?service_id=${args.service_id}`;
            }
            const response = await axios.get(url, {
                headers: this.getAuthHeaders(),
            });
            return {
                success: true,
                data: response.data,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get on-call information: ${error.message}`,
            };
        }
    }
    async handleEscalateIncident(args) {
        try {
            const response = await axios.post(`${this.goAlertProxyUrl}/alerts/${args.alert_id}/escalate`, {
                reason: args.reason,
            }, {
                headers: this.getAuthHeaders(),
            });
            return {
                success: true,
                data: {
                    alert_id: args.alert_id,
                    message: 'Incident escalated successfully',
                    escalated_by: response.data?.escalated_by,
                    escalated_at: response.data?.escalated_at || new Date().toISOString(),
                    escalation_level: response.data?.escalation_level,
                    next_escalation: response.data?.next_escalation,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to escalate incident: ${error.message}`,
            };
        }
    }
    // Helper methods for AI event handling
    async createAlertFromIncident(incident) {
        try {
            const serviceId = this.getAIServiceIdForComponent(incident.component);
            await this.createAlert({
                serviceId,
                summary: incident.summary,
                details: incident.description,
                source: 'sentinel',
                severity: incident.severity,
                component: incident.component,
                metadata: {
                    sentinelIncidentId: incident.id,
                    monitorId: incident.monitorId,
                },
            });
            logger.info('Created GoAlert alert from Sentinel incident', {
                incidentId: incident.id,
                serviceId,
            });
        }
        catch (error) {
            logger.warn('Failed to create GoAlert alert from incident:', error.message);
        }
    }
    async createAlertFromSecurityEvent(alert) {
        try {
            const serviceId = this.getAIServiceIdForComponent('ai-security');
            await this.createAlert({
                serviceId,
                summary: `AI Security Alert: ${alert.alertType}`,
                details: alert.description,
                source: 'ai_fabric',
                severity: alert.severity,
                component: 'ai-security',
                metadata: {
                    alertType: alert.alertType,
                    indicators: alert.indicators,
                },
            });
            logger.info('Created GoAlert alert from AI security event', {
                alertId: alert.id,
                serviceId,
            });
        }
        catch (error) {
            logger.warn('Failed to create GoAlert alert from security event:', error.message);
        }
    }
    async createAlertFromBiasEvent(biasMetric) {
        try {
            const serviceId = this.getAIServiceIdForComponent('ai-performance');
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
                    protectedAttribute: biasMetric.protectedAttribute,
                },
            });
            logger.info('Created GoAlert alert from bias detection', {
                model: biasMetric.model,
                serviceId,
            });
        }
        catch (error) {
            logger.warn('Failed to create GoAlert alert from bias event:', error.message);
        }
    }
    async createAlertFromDriftEvent(driftMetric) {
        try {
            const serviceId = this.getAIServiceIdForComponent('ai-performance');
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
                    driftType: driftMetric.driftType,
                },
            });
            logger.info('Created GoAlert alert from model drift', {
                model: driftMetric.model,
                serviceId,
            });
        }
        catch (error) {
            logger.warn('Failed to create GoAlert alert from drift event:', error.message);
        }
    }
    // Nova GoAlert proxy integration methods
    async createGoAlertService(serviceConfig) {
        try {
            await axios.post(`${this.goAlertProxyUrl}/services`, {
                name: serviceConfig.name,
                description: serviceConfig.description,
                escalation_policy_id: serviceConfig.escalationPolicy,
                labels: {
                    component: 'ai-fabric',
                    team: 'ai-platform',
                },
            }, {
                headers: this.getAuthHeaders(),
            });
        }
        catch (error) {
            logger.warn('Failed to create GoAlert service via proxy', {
                service: serviceConfig.name,
                error: error.message,
            });
        }
    }
    async checkExistingService(name) {
        try {
            const response = await axios.get(`${this.goAlertProxyUrl}/services`, {
                headers: this.getAuthHeaders(),
                params: { search: name },
            });
            return response.data.services && response.data.services.some((s) => s.name === name);
        }
        catch (error) {
            logger.warn('Failed to check existing service:', error.message);
            return false;
        }
    }
    getAIServiceIdForComponent(component) {
        // Map AI components to GoAlert service IDs
        const componentServiceMap = {
            'ai-fabric-core': 'ai-fabric-core',
            'rag-engine': 'ai-fabric-core',
            'mcp-server': 'ai-fabric-core',
            'nova-local-ai': 'ai-fabric-core',
            'ai-security': 'ai-security',
            'ai-monitoring': 'ai-performance',
            'ai-bias-detection': 'ai-performance',
            'ai-drift-detection': 'ai-performance',
            'ai-compliance': 'ai-security',
        };
        return componentServiceMap[component] || 'ai-fabric-core';
    }
    async createService(name, description, escalationPolicyId, labels) {
        try {
            await this.createGoAlertService({ name, description, escalationPolicy: escalationPolicyId });
            // After creating via proxy, refresh services and return the matching ID
            await this.syncWithGoAlert();
            const found = Array.from(this.services.values()).find((s) => s.name === name);
            return found?.id || crypto.randomUUID();
        }
        catch (error) {
            logger.warn('Service creation fallback (proxy unavailable)', {
                error: error?.message,
                name,
            });
            const serviceId = crypto.randomUUID();
            const service = {
                id: serviceId,
                name,
                description,
                escalationPolicyId,
                isActive: true,
                labels,
            };
            this.services.set(serviceId, service);
            return serviceId;
        }
    }
    async createSchedule(id, name, timezone) {
        try {
            await axios.post(`${this.goAlertProxyUrl}/schedules`, {
                name,
                timeZone: timezone,
            }, { headers: this.getAuthHeaders() });
            await this.syncWithGoAlert();
            const found = Array.from(this.schedules.values()).find((s) => s.name === name);
            return found?.id || id;
        }
        catch (error) {
            logger.warn('Schedule creation fallback (proxy unavailable)', {
                error: error?.message,
                name,
            });
            const schedule = {
                id,
                name,
                description: `AI team schedule: ${name}`,
                timeZone: timezone,
                targets: [],
                rules: [],
                isActive: true,
            };
            this.schedules.set(id, schedule);
            return id;
        }
    }
    async createAlertRule(rule) {
        const ruleId = crypto.randomUUID();
        const fullRule = {
            ...rule,
            id: ruleId,
            isActive: true,
        };
        this.alertRules.set(ruleId, fullRule);
        return ruleId;
    }
    async createGoAlert(alert) {
        // Create alert via Nova GoAlert proxy
        const resp = await axios.post(`${this.goAlertProxyUrl}/alerts`, {
            serviceID: alert.serviceId,
            summary: alert.summary,
            details: alert.details || '',
        }, {
            headers: this.getAuthHeaders(),
        });
        return resp.data?.alert?.id || crypto.randomUUID();
    }
    async acknowledgeGoAlert(goAlertId, userId) {
        // Enhanced alert acknowledgment with comprehensive user tracking and audit logging
        console.log(`Acknowledging GoAlert ${goAlertId} by user ${userId}`);
        
        // Log acknowledgment attempt with user context
        const acknowledgmentData = {
            alertId: goAlertId,
            acknowledgedBy: userId,
            timestamp: new Date().toISOString(),
            source: 'nova-goalert-integration',
            userAgent: 'Nova-GoAlert-Bridge/1.0'
        };
        
        console.log('Acknowledgment request:', acknowledgmentData);
        
        try {
            const resp = await axios.post(`${this.goAlertProxyUrl}/alerts/${goAlertId}/acknowledge`, {
                acknowledgedBy: userId,
                acknowledgedAt: acknowledgmentData.timestamp,
                source: acknowledgmentData.source,
                metadata: {
                    userContext: userId,
                    integrationVersion: '1.0',
                    platform: 'nova-universe'
                }
            }, {
                headers: this.getAuthHeaders(),
            });
            
            // Log successful acknowledgment with comprehensive details
            console.log(`GoAlert ${goAlertId} successfully acknowledged by user ${userId}`, {
                responseStatus: resp.status,
                acknowledgedAt: acknowledgmentData.timestamp,
                userId: userId,
                alertId: goAlertId
            });
            
            return {
                success: true,
                acknowledgedBy: userId,
                acknowledgedAt: acknowledgmentData.timestamp,
                alertId: goAlertId,
                response: resp.data
            };
            
        } catch (error) {
            console.error(`Failed to acknowledge GoAlert ${goAlertId} for user ${userId}:`, {
                error: error.message,
                userId: userId,
                alertId: goAlertId,
                timestamp: acknowledgmentData.timestamp
            });
            throw error;
        }
    }
    async closeGoAlert(goAlertId) {
        await axios.post(`${this.goAlertProxyUrl}/alerts/${goAlertId}/close`, {}, {
            headers: this.getAuthHeaders(),
        });
    }
    async getGoAlertStatus(goAlertId) {
        const resp = await axios.get(`${this.goAlertProxyUrl}/alerts?status=active&limit=1&offset=0`, {
            headers: this.getAuthHeaders(),
        });
        const found = Array.isArray(resp.data?.alerts)
            ? resp.data.alerts.find((a) => a.id === goAlertId)
            : undefined;
        return found ? 'active' : 'closed';
    }
    async getGoAlertOnCall(scheduleId) {
        const resp = await axios.get(`${this.goAlertProxyUrl}/schedules/${scheduleId}/on-call`, {
            headers: this.getAuthHeaders(),
        });
        return resp.data?.onCall || [];
    }
    async createAlertTicket(alert) {
        try {
            const { default: db } = await import('../db.js');
            const id = crypto.randomUUID();
            const now = new Date().toISOString();
            const title = `[Alert] ${alert.summary}`.slice(0, 255);
            const description = `${alert.details || ''}\n\nComponent: ${alert.component}\nSeverity: ${alert.severity}`;
            await db.query?.('INSERT INTO tickets (id, ticket_id, title, description, priority, status, requested_by_id, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [id, `ALRT-${Date.now()}`, title, description, alert.severity, 'open', null, now, now]);
            return id;
        }
        catch (error) {
            logger.warn('Ticket creation fallback (db unavailable)', {
                error: error?.message,
            });
            return crypto.randomUUID();
        }
    }
    async updateAlertTicket(ticketId, status, message) {
        try {
            const { default: db } = await import('../db.js');
            await db.query?.('UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, ticketId]);
            if (message) {
                await db.query?.('INSERT INTO ticket_comments (id, ticket_id, content, type, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)', [crypto.randomUUID(), ticketId, message, 'internal']);
            }
        }
        catch (error) {
            logger.debug('Ticket update fallback (db unavailable)', {
                error: error?.message,
                ticketId,
            });
        }
    }
    async resolveAlertTicket(ticketId, reason) {
        try {
            const { default: db } = await import('../db.js');
            await db.query?.('UPDATE tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['resolved', ticketId]);
            if (reason) {
                await db.query?.('INSERT INTO ticket_comments (id, ticket_id, content, type, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)', [crypto.randomUUID(), ticketId, `Resolution: ${reason}`, 'internal']);
            }
        }
        catch (error) {
            logger.debug('Ticket resolution fallback (db unavailable)', {
                error: error?.message,
                ticketId,
            });
        }
    }
    async linkToSentinelIncident(alert, incidentId) {
        try {
            await axios.post(`${this.goAlertProxyUrl}/alerts/${alert.goAlertId || alert.id}/metadata`, {
                sentinelIncidentId: incidentId,
            }, { headers: this.getAuthHeaders() });
        }
        catch (error) {
            logger.debug('Sentinel link fallback (proxy unavailable)', {
                error: error?.message,
                incidentId,
            });
        }
    }
    async shutdown() {
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
