/**
 * Nova RAG Data Source Connectors
 *
 * Connects the RAG engine to various Nova data sources including:
 * - Knowledge Base Articles
 * - Support Tickets and Requests
 * - Service Catalog Items
 * - Documentation
 * - GoAlert monitoring data
 * - Uptime-Kuma monitoring data
 *
 * Features:
 * - Real-time data synchronization
 * - Incremental indexing for performance
 * - RBAC-aware data extraction
 * - Multi-tenant data isolation
 * - Automatic metadata enrichment
 */
import { EventEmitter } from 'events';
import { logger } from '../logger.js';
import { ragEngine } from './rag-engine.js';
import { goAlertIntegration } from './goalert-integration.js';
import { sentinelIntegration } from './sentinel-integration.js';
/**
 * Nova RAG Data Source Connectors System
 */
export class NovaRAGDataConnectors extends EventEmitter {
    connectors = new Map();
    syncIntervals = new Map();
    lastSyncState = new Map();
    isInitialized = false;
    db; // Database connection
    constructor() {
        super();
    }
    /**
     * Initialize the data connectors system
     */
    async initialize() {
        try {
            logger.info('Initializing Nova RAG Data Connectors...');
            // Import database connection
            const { default: database } = await import('../db.js');
            this.db = database;
            // Initialize default data source configurations
            await this.initializeDefaultConnectors();
            // Start sync loops for enabled connectors
            await this.startSyncLoops();
            this.isInitialized = true;
            this.emit('initialized');
            logger.info('Nova RAG Data Connectors initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize Data Connectors:', error);
            throw error;
        }
    }
    /**
     * Sync all enabled data sources
     */
    async syncAllSources() {
        const results = [];
        for (const connector of this.connectors.values()) {
            if (connector.config.enabled) {
                try {
                    const result = await this.syncDataSource(connector.id);
                    results.push(result);
                }
                catch (error) {
                    logger.error(`Failed to sync data source ${connector.id}:`, error);
                    results.push({
                        sourceId: connector.id,
                        documentsProcessed: 0,
                        documentsAdded: 0,
                        documentsUpdated: 0,
                        documentsRemoved: 0,
                        errors: [error.message],
                        syncTime: 0,
                        lastSyncTimestamp: new Date(),
                    });
                }
            }
        }
        return results;
    }
    /**
     * Sync a specific data source
     */
    async syncDataSource(connectorId) {
        const connector = this.connectors.get(connectorId);
        if (!connector) {
            throw new Error(`Connector ${connectorId} not found`);
        }
        const startTime = Date.now();
        logger.info(`Starting sync for data source: ${connector.name}`);
        let result;
        try {
            switch (connector.type) {
                case 'knowledge_base':
                    result = await this.syncKnowledgeBase(connector);
                    break;
                case 'tickets':
                    result = await this.syncTickets(connector);
                    break;
                case 'service_catalog':
                    result = await this.syncServiceCatalog(connector);
                    break;
                case 'documentation':
                    result = await this.syncDocumentation(connector);
                    break;
                case 'monitoring':
                    result = await this.syncMonitoringData(connector);
                    break;
                default:
                    throw new Error(`Unsupported connector type: ${connector.type}`);
            }
            // Update connector status
            connector.lastSync = new Date();
            connector.nextSync = new Date(Date.now() + connector.config.syncInterval);
            connector.totalDocuments = result.documentsAdded + result.documentsUpdated;
            logger.info(`Completed sync for ${connector.name}`, {
                documentsProcessed: result.documentsProcessed,
                syncTime: result.syncTime,
            });
            this.emit('syncCompleted', { connector, result });
        }
        catch (error) {
            logger.error(`Sync failed for ${connector.name}:`, error);
            result = {
                sourceId: connectorId,
                documentsProcessed: 0,
                documentsAdded: 0,
                documentsUpdated: 0,
                documentsRemoved: 0,
                errors: [error.message],
                syncTime: Date.now() - startTime,
                lastSyncTimestamp: new Date(),
            };
            this.emit('syncFailed', { connector, error });
        }
        return result;
    }
    /**
     * Sync Knowledge Base Articles
     */
    async syncKnowledgeBase(connector) {
        const startTime = Date.now();
        const result = {
            sourceId: connector.id,
            documentsProcessed: 0,
            documentsAdded: 0,
            documentsUpdated: 0,
            documentsRemoved: 0,
            errors: [],
            syncTime: 0,
            lastSyncTimestamp: new Date(),
        };
        try {
            // Get the last sync timestamp for incremental sync
            const lastSync = connector.config.incrementalSync ?
                this.lastSyncState.get(connector.id)?.lastSyncTimestamp : null;
            // Query KB articles
            let query = `
        SELECT 
          ka.id,
          ka.slug,
          ka.title,
          ka.is_published,
          ka.tags,
          ka.created_at,
          ka.updated_at,
          ka.author_id,
          u.email as author_email,
          u.first_name,
          u.last_name,
          kav.content,
          kav.summary,
          kav.version,
          kav.is_approved
        FROM kb_articles ka
        LEFT JOIN kb_article_versions kav ON ka.current_version_id = kav.id
        LEFT JOIN users u ON ka.author_id = u.id
        WHERE ka.is_published = true AND kav.is_approved = true
      `;
            const params = [];
            if (lastSync) {
                query += ' AND ka.updated_at > $1';
                params.push(lastSync);
            }
            query += ' ORDER BY ka.updated_at DESC';
            const articles = await this.db.query(query, params);
            for (const article of articles.rows || []) {
                try {
                    result.documentsProcessed++;
                    // Prepare document for RAG indexing
                    const document = {
                        id: `kb_article_${article.id}`,
                        content: this.prepareKBContent(article),
                        metadata: {
                            source: 'knowledge_base',
                            type: 'knowledge_article',
                            category: 'knowledge_base',
                            title: article.title,
                            slug: article.slug,
                            tags: article.tags || [],
                            authorId: article.author_id,
                            authorEmail: article.author_email,
                            authorName: `${article.first_name || ''} ${article.last_name || ''}`.trim(),
                            version: article.version,
                            isApproved: article.is_approved,
                            createdAt: new Date(article.created_at),
                            updatedAt: new Date(article.updated_at),
                            classification: 'internal', // Default classification
                            securityClassification: 'internal',
                            accessLevel: 'standard',
                            dataClassification: 'knowledge',
                        },
                    };
                    // RBAC context
                    const rbacContext = connector.config.rbacEnabled ? {
                        userId: article.author_id || 'system',
                        tenantId: 'default', // TODO: Extract from user or article
                        departmentId: 'knowledge_management',
                        securityClassification: 'internal',
                    } : undefined;
                    // Check if document already exists
                    const existingDoc = Array.from(ragEngine.documentChunks.values())
                        .find(chunk => chunk.documentId === document.id);
                    if (existingDoc) {
                        // Update existing document
                        await ragEngine.updateDocument(document.id, document.content, document.metadata);
                        result.documentsUpdated++;
                    }
                    else {
                        // Add new document
                        await ragEngine.addDocuments([document], rbacContext);
                        result.documentsAdded++;
                    }
                }
                catch (error) {
                    result.errors.push(`Error processing KB article ${article.id}: ${error.message}`);
                    logger.warn('Error processing KB article', { articleId: article.id, error: error.message });
                }
            }
            // Update last sync state
            this.lastSyncState.set(connector.id, {
                lastSyncTimestamp: new Date(),
                totalArticles: articles.rows?.length || 0,
            });
        }
        catch (error) {
            result.errors.push(`Knowledge base sync error: ${error.message}`);
            throw error;
        }
        result.syncTime = Date.now() - startTime;
        return result;
    }
    /**
     * Sync Support Tickets
     */
    async syncTickets(connector) {
        const startTime = Date.now();
        const result = {
            sourceId: connector.id,
            documentsProcessed: 0,
            documentsAdded: 0,
            documentsUpdated: 0,
            documentsRemoved: 0,
            errors: [],
            syncTime: 0,
            lastSyncTimestamp: new Date(),
        };
        try {
            // Get the last sync timestamp for incremental sync
            const lastSync = connector.config.incrementalSync ?
                this.lastSyncState.get(connector.id)?.lastSyncTimestamp : null;
            // Query tickets - prioritize enhanced tickets if available
            let query = `
        SELECT 
          est.id,
          est.ticket_number,
          est.title,
          est.description,
          est.short_description,
          est.type,
          est.state,
          est.priority,
          est.urgency,
          est.impact,
          est.category,
          est.subcategory,
          est.business_service,
          est.configuration_item,
          est.user_id,
          est.assigned_to_user_id,
          est.assigned_to_group_id,
          est.source,
          est.channel,
          est.location,
          est.cost_center,
          est.resolution,
          est.close_notes,
          est.tags,
          est.custom_fields,
          est.confidentiality_level,
          est.created_at,
          est.updated_at,
          est.closed_at,
          est.resolved_at,
          u1.email as requester_email,
          u1.first_name as requester_first_name,
          u1.last_name as requester_last_name,
          u2.email as assigned_email,
          u2.first_name as assigned_first_name,
          u2.last_name as assigned_last_name
        FROM enhanced_support_tickets est
        LEFT JOIN users u1 ON est.user_id = u1.id
        LEFT JOIN users u2 ON est.assigned_to_user_id = u2.id
        WHERE est.state IN ('resolved', 'closed')
      `;
            const params = [];
            if (lastSync) {
                query += ' AND est.updated_at > $1';
                params.push(lastSync);
            }
            // Only index resolved/closed tickets to avoid exposing active sensitive data
            query += ' ORDER BY est.updated_at DESC LIMIT 1000';
            const tickets = await this.db.query(query, params);
            for (const ticket of tickets.rows || []) {
                try {
                    result.documentsProcessed++;
                    // Prepare document for RAG indexing
                    const document = {
                        id: `ticket_${ticket.id}`,
                        content: this.prepareTicketContent(ticket),
                        metadata: {
                            source: 'support_tickets',
                            type: 'ticket',
                            category: ticket.category || 'general',
                            subcategory: ticket.subcategory,
                            title: ticket.title,
                            ticketNumber: ticket.ticket_number,
                            ticketType: ticket.type,
                            state: ticket.state,
                            priority: ticket.priority,
                            urgency: ticket.urgency,
                            impact: ticket.impact,
                            businessService: ticket.business_service,
                            configurationItem: ticket.configuration_item,
                            source: ticket.source,
                            channel: ticket.channel,
                            location: ticket.location,
                            costCenter: ticket.cost_center,
                            tags: ticket.tags || [],
                            requesterId: ticket.user_id,
                            requesterEmail: ticket.requester_email,
                            assignedToId: ticket.assigned_to_user_id,
                            assignedEmail: ticket.assigned_email,
                            createdAt: new Date(ticket.created_at),
                            updatedAt: new Date(ticket.updated_at),
                            closedAt: ticket.closed_at ? new Date(ticket.closed_at) : undefined,
                            resolvedAt: ticket.resolved_at ? new Date(ticket.resolved_at) : undefined,
                            classification: ticket.confidentiality_level || 'internal',
                            securityClassification: ticket.confidentiality_level || 'internal',
                            accessLevel: this.getTicketAccessLevel(ticket),
                            dataClassification: 'support_data',
                            department: this.getDepartmentFromTicket(ticket),
                        },
                    };
                    // RBAC context
                    const rbacContext = connector.config.rbacEnabled ? {
                        userId: ticket.assigned_to_user_id || ticket.user_id || 'system',
                        tenantId: 'default', // TODO: Extract from ticket or user
                        departmentId: this.getDepartmentFromTicket(ticket),
                        securityClassification: ticket.confidentiality_level || 'internal',
                    } : undefined;
                    // Check if document already exists
                    const existingDoc = Array.from(ragEngine.documentChunks.values())
                        .find(chunk => chunk.documentId === document.id);
                    if (existingDoc) {
                        // Update existing document
                        await ragEngine.updateDocument(document.id, document.content, document.metadata);
                        result.documentsUpdated++;
                    }
                    else {
                        // Add new document
                        await ragEngine.addDocuments([document], rbacContext);
                        result.documentsAdded++;
                    }
                }
                catch (error) {
                    result.errors.push(`Error processing ticket ${ticket.id}: ${error.message}`);
                    logger.warn('Error processing ticket', { ticketId: ticket.id, error: error.message });
                }
            }
            // Update last sync state
            this.lastSyncState.set(connector.id, {
                lastSyncTimestamp: new Date(),
                totalTickets: tickets.rows?.length || 0,
            });
        }
        catch (error) {
            result.errors.push(`Tickets sync error: ${error.message}`);
            throw error;
        }
        result.syncTime = Date.now() - startTime;
        return result;
    }
    /**
     * Sync Service Catalog Items
     */
    async syncServiceCatalog(connector) {
        const startTime = Date.now();
        const result = {
            sourceId: connector.id,
            documentsProcessed: 0,
            documentsAdded: 0,
            documentsUpdated: 0,
            documentsRemoved: 0,
            errors: [],
            syncTime: 0,
            lastSyncTimestamp: new Date(),
        };
        try {
            // Get service catalog items
            const query = `
        SELECT 
          sci.id,
          sci.name,
          sci.description,
          sci.category,
          sci.price,
          sci.currency,
          sci.active,
          sci.delivery_time,
          sci.approval_required,
          sci.form_schema,
          sci.metadata,
          sci.created_at,
          sci.updated_at
        FROM service_catalog_items sci
        WHERE sci.active = true
        ORDER BY sci.updated_at DESC
      `;
            const items = await this.db.query(query);
            for (const item of items.rows || []) {
                try {
                    result.documentsProcessed++;
                    // Prepare document for RAG indexing
                    const document = {
                        id: `service_item_${item.id}`,
                        content: this.prepareServiceItemContent(item),
                        metadata: {
                            source: 'service_catalog',
                            type: 'service_item',
                            category: item.category || 'services',
                            title: item.name,
                            description: item.description,
                            price: item.price,
                            currency: item.currency,
                            active: item.active,
                            deliveryTime: item.delivery_time,
                            approvalRequired: item.approval_required,
                            formSchema: item.form_schema,
                            serviceMetadata: item.metadata,
                            createdAt: new Date(item.created_at),
                            updatedAt: new Date(item.updated_at),
                            classification: 'internal',
                            securityClassification: 'public', // Service catalog is generally public
                            accessLevel: 'standard',
                            dataClassification: 'service_catalog',
                            tags: ['service', 'catalog', item.category].filter(Boolean),
                        },
                    };
                    // RBAC context - service catalog is generally accessible
                    const rbacContext = connector.config.rbacEnabled ? {
                        userId: 'system',
                        tenantId: 'default',
                        departmentId: 'service_management',
                        securityClassification: 'public',
                    } : undefined;
                    // Check if document already exists
                    const existingDoc = Array.from(ragEngine.documentChunks.values())
                        .find(chunk => chunk.documentId === document.id);
                    if (existingDoc) {
                        await ragEngine.updateDocument(document.id, document.content, document.metadata);
                        result.documentsUpdated++;
                    }
                    else {
                        await ragEngine.addDocuments([document], rbacContext);
                        result.documentsAdded++;
                    }
                }
                catch (error) {
                    result.errors.push(`Error processing service item ${item.id}: ${error.message}`);
                    logger.warn('Error processing service item', { itemId: item.id, error: error.message });
                }
            }
            // Update last sync state
            this.lastSyncState.set(connector.id, {
                lastSyncTimestamp: new Date(),
                totalItems: items.rows?.length || 0,
            });
        }
        catch (error) {
            result.errors.push(`Service catalog sync error: ${error.message}`);
            throw error;
        }
        result.syncTime = Date.now() - startTime;
        return result;
    }
    /**
     * Sync Monitoring Data from GoAlert and Sentinel
     */
    async syncMonitoringData(connector) {
        const startTime = Date.now();
        const result = {
            sourceId: connector.id,
            documentsProcessed: 0,
            documentsAdded: 0,
            documentsUpdated: 0,
            documentsRemoved: 0,
            errors: [],
            syncTime: 0,
            lastSyncTimestamp: new Date(),
        };
        try {
            // Sync GoAlert data
            if (goAlertIntegration && connector.config.config.includeGoAlert) {
                await this.syncGoAlertData(result);
            }
            // Sync Sentinel data
            if (sentinelIntegration && connector.config.config.includeSentinel) {
                await this.syncSentinelData(result);
            }
        }
        catch (error) {
            result.errors.push(`Monitoring data sync error: ${error.message}`);
            throw error;
        }
        result.syncTime = Date.now() - startTime;
        return result;
    }
    /**
     * Sync GoAlert monitoring data
     */
    async syncGoAlertData(result) {
        try {
            const dashboardData = goAlertIntegration.getDashboardData();
            // Index recent alerts as knowledge
            for (const alert of dashboardData.recentAlerts || []) {
                const document = {
                    id: `goalert_alert_${alert.id}`,
                    content: `Alert: ${alert.summary}\nComponent: ${alert.component}\nSeverity: ${alert.severity}\nStatus: ${alert.status}\nDetails: ${alert.details || 'No additional details'}`,
                    metadata: {
                        source: 'monitoring',
                        type: 'alert',
                        category: 'monitoring',
                        title: alert.summary,
                        component: alert.component,
                        severity: alert.severity,
                        status: alert.status,
                        createdAt: new Date(alert.createdAt),
                        classification: 'internal',
                        securityClassification: 'internal',
                        accessLevel: 'standard',
                        dataClassification: 'monitoring_data',
                        tags: ['alert', 'monitoring', alert.component, alert.severity],
                    },
                };
                await ragEngine.addDocuments([document]);
                result.documentsAdded++;
                result.documentsProcessed++;
            }
        }
        catch (error) {
            result.errors.push(`GoAlert sync error: ${error.message}`);
            logger.warn('Error syncing GoAlert data:', error);
        }
    }
    /**
     * Sync Sentinel monitoring data
     */
    async syncSentinelData(result) {
        try {
            const dashboardData = sentinelIntegration.getDashboardData();
            // Index recent incidents as knowledge
            for (const incident of dashboardData.incidents || []) {
                const document = {
                    id: `sentinel_incident_${incident.id}`,
                    content: `Incident: ${incident.summary}\nComponent: ${incident.component}\nSeverity: ${incident.severity}\nStatus: ${incident.status}\nDescription: ${incident.description || 'No description'}`,
                    metadata: {
                        source: 'monitoring',
                        type: 'incident',
                        category: 'monitoring',
                        title: incident.summary,
                        component: incident.component,
                        severity: incident.severity,
                        status: incident.status,
                        createdAt: new Date(incident.startedAt),
                        classification: 'internal',
                        securityClassification: 'internal',
                        accessLevel: 'standard',
                        dataClassification: 'monitoring_data',
                        tags: ['incident', 'monitoring', incident.component, incident.severity],
                    },
                };
                await ragEngine.addDocuments([document]);
                result.documentsAdded++;
                result.documentsProcessed++;
            }
        }
        catch (error) {
            result.errors.push(`Sentinel sync error: ${error.message}`);
            logger.warn('Error syncing Sentinel data:', error);
        }
    }
    /**
     * Sync Documentation (placeholder for future implementation)
     */
    async syncDocumentation(connector) {
        // Placeholder for documentation sync
        return {
            sourceId: connector.id,
            documentsProcessed: 0,
            documentsAdded: 0,
            documentsUpdated: 0,
            documentsRemoved: 0,
            errors: [],
            syncTime: 0,
            lastSyncTimestamp: new Date(),
        };
    }
    /**
     * Get connector status
     */
    getConnectorStatus() {
        return Array.from(this.connectors.values());
    }
    /**
     * Enable or disable a connector
     */
    async setConnectorEnabled(connectorId, enabled) {
        const connector = this.connectors.get(connectorId);
        if (!connector) {
            throw new Error(`Connector ${connectorId} not found`);
        }
        connector.config.enabled = enabled;
        if (enabled) {
            // Start sync loop
            await this.startSyncLoop(connector);
        }
        else {
            // Stop sync loop
            this.stopSyncLoop(connectorId);
        }
        logger.info(`Connector ${connector.name} ${enabled ? 'enabled' : 'disabled'}`);
        this.emit('connectorToggled', { connector, enabled });
    }
    // Private helper methods
    async initializeDefaultConnectors() {
        const defaultConnectors = [
            {
                id: 'nova_knowledge_base',
                name: 'Nova Knowledge Base Articles (Primary Source)',
                type: 'knowledge_base',
                enabled: true,
                syncInterval: 2 * 60 * 1000, // 2 minutes - Frequent sync for primary source
                incrementalSync: true,
                rbacEnabled: true,
                tenantScoped: true,
                config: {
                    priority: 'highest',
                    isNovaSource: true,
                    dataQuality: 'high',
                    sourceTrustLevel: 'primary',
                },
            },
            {
                id: 'nova_support_tickets',
                name: 'Nova Support Tickets (Operational Data)',
                type: 'tickets',
                enabled: true,
                syncInterval: 5 * 60 * 1000, // 5 minutes - High priority for operational data
                incrementalSync: true,
                rbacEnabled: true,
                tenantScoped: true,
                config: {
                    includeClosedTickets: true,
                    maxAge: 30, // days
                    priority: 'highest',
                    isNovaSource: true,
                    dataQuality: 'high',
                    sourceTrustLevel: 'primary',
                },
            },
            {
                id: 'nova_service_catalog',
                name: 'Nova Service Catalog (Authoritative)',
                type: 'service_catalog',
                enabled: true,
                syncInterval: 10 * 60 * 1000, // 10 minutes - Authoritative source
                incrementalSync: false,
                rbacEnabled: false, // Service catalog is generally public
                tenantScoped: false,
                config: {
                    includeInactive: false,
                    priority: 'highest',
                    isNovaSource: true,
                    dataQuality: 'high',
                    sourceTrustLevel: 'authoritative',
                },
            },
            {
                id: 'nova_monitoring_data',
                name: 'Nova Monitoring Data (Real-time)',
                type: 'monitoring',
                enabled: true,
                syncInterval: 5 * 60 * 1000, // 5 minutes - Real-time Nova operational data
                incrementalSync: true,
                rbacEnabled: true,
                tenantScoped: true,
                config: {
                    includeGoAlert: true,
                    includeSentinel: true,
                    maxAlerts: 100,
                    priority: 'highest',
                    isNovaSource: true,
                    dataQuality: 'high',
                    sourceTrustLevel: 'primary',
                },
            },
            {
                id: 'nova_workflows',
                name: 'Nova Workflow Patterns (Source of Truth)',
                type: 'workflows',
                enabled: true,
                syncInterval: 3 * 60 * 1000, // 3 minutes - Critical for workflow optimization
                incrementalSync: true,
                rbacEnabled: true,
                tenantScoped: true,
                config: {
                    includeCompleted: true,
                    includeInProgress: true,
                    maxAge: 90, // days
                    priority: 'highest',
                    isNovaSource: true,
                    dataQuality: 'high',
                    sourceTrustLevel: 'authoritative',
                    workflowTypes: ['service_request', 'incident', 'change', 'problem'],
                },
            },
            {
                id: 'nova_historical_data',
                name: 'Nova Historical Patterns (Learning Source)',
                type: 'historical',
                enabled: true,
                syncInterval: 60 * 60 * 1000, // 60 minutes - Historical data for pattern learning
                incrementalSync: true,
                rbacEnabled: true,
                tenantScoped: true,
                config: {
                    timeRange: '1 year',
                    priority: 'high',
                    isNovaSource: true,
                    dataQuality: 'high',
                    sourceTrustLevel: 'primary',
                    includePerformanceMetrics: true,
                    includeUserBehavior: true,
                },
            },
        ];
        for (const config of defaultConnectors) {
            const connector = {
                id: config.id,
                name: config.name,
                type: config.type,
                isConnected: false,
                totalDocuments: 0,
                config,
            };
            this.connectors.set(config.id, connector);
        }
    }
    async startSyncLoops() {
        for (const connector of this.connectors.values()) {
            if (connector.config.enabled) {
                await this.startSyncLoop(connector);
            }
        }
    }
    async startSyncLoop(connector) {
        // Stop existing interval if any
        this.stopSyncLoop(connector.id);
        // Start immediate sync
        this.syncDataSource(connector.id).catch(error => {
            logger.error(`Initial sync failed for ${connector.name}:`, error);
        });
        // Set up recurring sync
        const interval = setInterval(async () => {
            try {
                await this.syncDataSource(connector.id);
            }
            catch (error) {
                logger.error(`Scheduled sync failed for ${connector.name}:`, error);
            }
        }, connector.config.syncInterval);
        this.syncIntervals.set(connector.id, interval);
        connector.isConnected = true;
        logger.info(`Started sync loop for ${connector.name} (interval: ${connector.config.syncInterval}ms)`);
    }
    stopSyncLoop(connectorId) {
        const interval = this.syncIntervals.get(connectorId);
        if (interval) {
            clearInterval(interval);
            this.syncIntervals.delete(connectorId);
        }
        const connector = this.connectors.get(connectorId);
        if (connector) {
            connector.isConnected = false;
        }
    }
    prepareKBContent(article) {
        return `Title: ${article.title}

${article.summary || ''}

${article.content || ''}

Tags: ${(article.tags || []).join(', ')}
Author: ${article.author_email}
Version: ${article.version}
Last Updated: ${new Date(article.updated_at).toLocaleDateString()}`;
    }
    prepareTicketContent(ticket) {
        return `Ticket: ${ticket.ticket_number} - ${ticket.title}

Description: ${ticket.description || ''}

${ticket.short_description ? `Summary: ${ticket.short_description}` : ''}

Type: ${ticket.type}
State: ${ticket.state}
Priority: ${ticket.priority}
Category: ${ticket.category || 'N/A'}
${ticket.subcategory ? `Subcategory: ${ticket.subcategory}` : ''}

${ticket.business_service ? `Business Service: ${ticket.business_service}` : ''}
${ticket.configuration_item ? `Configuration Item: ${ticket.configuration_item}` : ''}

Requester: ${ticket.requester_email}
${ticket.assigned_email ? `Assigned To: ${ticket.assigned_email}` : ''}

${ticket.resolution ? `Resolution: ${ticket.resolution}` : ''}
${ticket.close_notes ? `Close Notes: ${ticket.close_notes}` : ''}

Created: ${new Date(ticket.created_at).toLocaleDateString()}
${ticket.resolved_at ? `Resolved: ${new Date(ticket.resolved_at).toLocaleDateString()}` : ''}`;
    }
    prepareServiceItemContent(item) {
        return `Service: ${item.name}

Description: ${item.description || ''}

Category: ${item.category || 'N/A'}
${item.price ? `Price: ${item.price} ${item.currency || 'USD'}` : ''}
${item.delivery_time ? `Delivery Time: ${item.delivery_time}` : ''}
${item.approval_required ? 'Approval Required: Yes' : 'Approval Required: No'}

${item.metadata ? `Additional Information: ${JSON.stringify(item.metadata, null, 2)}` : ''}

Status: ${item.active ? 'Active' : 'Inactive'}
Last Updated: ${new Date(item.updated_at).toLocaleDateString()}`;
    }
    getTicketAccessLevel(ticket) {
        // Determine access level based on ticket properties
        if (ticket.confidentiality_level === 'restricted' || ticket.confidentiality_level === 'confidential') {
            return 'restricted';
        }
        if (ticket.priority === 'critical' || ticket.urgency === 'high') {
            return 'elevated';
        }
        return 'standard';
    }
    getDepartmentFromTicket(ticket) {
        // Extract department from ticket metadata, location, or cost center
        if (ticket.cost_center) {
            return ticket.cost_center;
        }
        if (ticket.location) {
            return ticket.location;
        }
        if (ticket.category) {
            // Map common categories to departments
            const categoryDeptMap = {
                'IT Support': 'information_technology',
                'HR': 'human_resources',
                'Finance': 'finance',
                'Facilities': 'facilities',
                'Security': 'security',
            };
            return categoryDeptMap[ticket.category] || 'general';
        }
        return 'general';
    }
    async shutdown() {
        logger.info('Shutting down Nova RAG Data Connectors...');
        // Stop all sync loops
        for (const connectorId of this.syncIntervals.keys()) {
            this.stopSyncLoop(connectorId);
        }
        this.isInitialized = false;
        logger.info('Nova RAG Data Connectors shutdown complete');
    }
}
// Export singleton instance
export const ragDataConnectors = new NovaRAGDataConnectors();
