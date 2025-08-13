/**
 * Nova Integration Layer (NIL) - Core Integration Engine
 * Enterprise-grade integration framework following industry standards
 * 
 * @version 2.0.0
 * @author Nova Team
 * @license MIT
 * 
 * This implementation follows Enterprise Integration Patterns (EIP) by Gregor Hohpe
 * and includes modern best practices for microservices integration.
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
let axios;
(async () => {
  try {
    // Try standard ESM import
    axios = (await import('axios')).default || (await import('axios'));
  } catch (e) {
    try {
      // Fallback: attempt CJS path if needed
      axios = (await import('axios/index.js')).default;
    } catch (e2) {
      // As a last resort, create a minimal fetch-like shim
      axios = async function(url, opts = {}) {
        const fetchMod = await import('node-fetch');
        const res = await fetchMod.default(url, opts);
        const data = await res.json().catch(() => null);
        return { status: res.status, data };
      // As a last resort, throw an error to indicate axios is required
      throw new Error('Failed to import axios. Please ensure axios is installed as a dependency.');
    }
  }
})();
import rateLimit from 'express-rate-limit';

// Prisma clients - will be imported dynamically to handle missing schemas gracefully
let CorePrismaClient, IntegrationPrismaClient;

// Circuit breaker - will be imported dynamically if available
let CircuitBreaker;

const prismaDisabled = process.env.PRISMA_DISABLED === 'true';

// ============================================================================
// CORE TYPES AND INTERFACES
// ============================================================================

/**
 * Standard connector interface following Enterprise Integration Patterns
 * Implements the Adapter pattern for external system integration
 */
export class IConnector {
  /**
   * @param {string} id - Unique connector identifier
   * @param {string} name - Human-readable connector name
   * @param {string} version - Connector version
   * @param {ConnectorType} type - Type of connector (IDENTITY_PROVIDER, etc.)
   */
  constructor(id, name, version, type) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.type = type;
  }

  // Lifecycle Management
  async initialize(config) {
    throw new Error('initialize() must be implemented by subclass');
  }

  async health() {
    throw new Error('health() must be implemented by subclass');
  }

  async shutdown() {
    throw new Error('shutdown() must be implemented by subclass');
  }

  // Data Operations
  async sync(options = {}) {
    throw new Error('sync() must be implemented by subclass');
  }

  async poll() {
    throw new Error('poll() must be implemented by subclass');
  }

  async push(action) {
    throw new Error('push() must be implemented by subclass');
  }

  // Configuration and Capabilities
  validateConfig(config) {
    return { valid: true, errors: [] };
  }

  getCapabilities() {
    return {
      supportsSync: true,
      supportsPush: true,
      supportsPoll: true,
      rateLimit: 100,
      dataTypes: []
    };
  }

  getSchema() {
    return {
      input: {},
      output: {}
    };
  }
}

// Core configuration interfaces
export const ConnectorType = {
  IDENTITY_PROVIDER: 'IDENTITY_PROVIDER',
  DEVICE_MANAGEMENT: 'DEVICE_MANAGEMENT',
  SECURITY_PLATFORM: 'SECURITY_PLATFORM',
  COLLABORATION: 'COLLABORATION',
  HRIS: 'HRIS',
  MONITORING: 'MONITORING',
  PROJECT_MANAGEMENT: 'PROJECT_MANAGEMENT',
  AI_PLATFORM: 'AI_PLATFORM',
  DATA_INTELLIGENCE: 'DATA_INTELLIGENCE'
};

export const HealthStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
  UNKNOWN: 'unknown'
};

export const SyncStrategy = {
  POLLING: 'POLLING',
  WEBHOOK: 'WEBHOOK',
  EVENT_DRIVEN: 'EVENT_DRIVEN',
  BATCH: 'BATCH'
};

// Core Types
const ConnectorConfigSchema = {
  id: 'string',
  credentials: 'object',
  endpoints: 'object',
  rateLimits: 'object',
  retryPolicy: 'object',
  security: 'object'
};

const HealthStatusSchema = {
  status: 'string', // 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  lastCheck: 'date',
  metrics: 'array',
  issues: 'array'
};

const SyncOptionsSchema = {
  type: 'string', // 'full' | 'incremental' | 'delta'
  filters: 'object',
  batchSize: 'number',
  parallel: 'boolean',
  dryRun: 'boolean'
};

const SyncResultSchema = {
  jobId: 'string',
  status: 'string', // 'success' | 'partial' | 'failed'
  metrics: 'object',
  errors: 'array',
  data: 'array'
};

/**
 * Nova Integration Layer - Main Engine
 * Implements Enterprise Service Bus pattern with message routing
 */
export class NovaIntegrationLayer extends EventEmitter {
  constructor(config) {
    super();
    this.connectors = new Map();
    this.prisma = null; // Will be initialized async
    this.config = config;
    this.circuitBreakers = new Map();
    this.rateLimiters = new Map();
    this.initialized = false;
    
    // Initialize logging
    this.logger = this.createLogger();
  }

  /**
   * Initialize the integration layer with enterprise patterns
   */
  async initialize() {
    try {
      this.logger.info('Initializing Nova Integration Layer...');
      
      // Initialize Prisma clients dynamically
      await this.initializePrismaClients();
      
      // Only proceed with database operations if Prisma is available
      if (this.prisma) {
        // Load registered connectors from database
        const connectorConfigs = await this.prisma.connector.findMany({
          where: { status: 'ACTIVE' }
        });

        // Initialize each connector with circuit breaker pattern
        for (const config of connectorConfigs) {
          await this.loadConnector(config);
        }

        // Start background services
        await this.startSyncScheduler();
        await this.startHealthMonitoring();
        await this.startEventProcessor();
      } else {
        this.logger.warn('Prisma not available - running in standalone mode');
      }

      this.initialized = true;
      this.logger.info('Nova Integration Layer initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Nova Integration Layer:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Initialize Prisma clients dynamically
   */
  async initializePrismaClients() {
    try {
      if (prismaDisabled) {
        this.logger.warn('Prisma disabled via PRISMA_DISABLED=true');
        this.prisma = null;
        return;
      }
      // Try to import Prisma clients
      try {
        const coreModule = await import('../../../prisma/generated/core/index.js');
        CorePrismaClient = coreModule.PrismaClient;
        
        const integrationModule = await import('../../../prisma/generated/integration/index.js');
        IntegrationPrismaClient = integrationModule.PrismaClient;
        
        this.coreDb = new CorePrismaClient({
          datasources: {
            core_db: { url: process.env.CORE_DATABASE_URL || process.env.DATABASE_URL }
          }
        });
        this.prisma = new IntegrationPrismaClient({
          datasources: {
            integration_db: { url: process.env.INTEGRATION_DATABASE_URL || process.env.DATABASE_URL }
          }
        });
        this.logger.info('Prisma clients initialized successfully');
      } catch (importError) {
        this.logger.warn('Prisma clients not available:', importError.message);
        this.prisma = null;
      }
    } catch (error) {
      this.logger.error('Failed to initialize Prisma clients:', error);
      this.prisma = null;
    }
  }

  /**
   * Register a new connector with circuit breaker and rate limiting
   */
  async registerConnector(connectorClass, config) {
    try {
      const connector = new connectorClass();
      
      // Validate configuration
      const validation = connector.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid connector config: ${validation.errors.join(', ')}`);
      }

      // Initialize connector
      await connector.initialize(config);

      // Setup circuit breaker for this connector if available
      await this.setupCircuitBreaker(config.id, connector, config);

      // Setup rate limiter
      this.setupRateLimiter(config.id, config.rateLimits);

      // Store in database if available
      if (this.prisma) {
        await this.prisma.connector.create({
          data: {
            id: config.id,
            name: connector.name,
            type: connector.type,
            version: connector.version,
            config: config,
            capabilities: connector.getCapabilities(),
            status: 'ACTIVE',
            tenantId: this.config.tenantId,
            createdBy: this.config.userId
          }
        });
      } else {
        this.logger.warn(`Connector ${config.id} registered in memory only (no database)`);
      }

      // Register in memory
      this.connectors.set(config.id, connector);

      this.logger.info(`Connector registered: ${config.id}`);
      this.emit('connector:registered', { id: config.id, name: connector.name });
    } catch (error) {
      this.logger.error(`Failed to register connector ${config.id}:`, error);
      this.emit('connector:error', { id: config.id, error });
      throw error;
    }
  }

  /**
   * Execute sync job for a connector with enterprise patterns
   */
  async executeSync(connectorId, options = {}) {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      throw new Error(`Connector not found: ${connectorId}`);
    }

    // Create sync job record
    const job = await this.prisma.syncJob.create({
      data: {
        connectorId,
        jobType: (options.type || 'full').toUpperCase(),
        strategy: 'POLLING',
        options: options,
        status: 'PENDING',
        triggerType: 'MANUAL'
      }
    });

    try {
      // Update job status
      await this.prisma.syncJob.update({
        where: { id: job.id },
        data: { 
          status: 'RUNNING',
          startedAt: new Date()
        }
      });

      // Execute sync with circuit breaker
      const circuitBreaker = this.circuitBreakers.get(connectorId);
      const result = circuitBreaker 
        ? await circuitBreaker.fire('sync', options)
        : await connector.sync(options);

      // Update job with results
      await this.prisma.syncJob.update({
        where: { id: job.id },
        data: {
          status: result.status === 'success' ? 'COMPLETED' : 'FAILED',
          completedAt: new Date(),
          duration: Date.now() - job.createdAt.getTime(),
          recordsProcessed: result.metrics?.totalRecords || 0,
          recordsSucceeded: result.metrics?.successCount || 0,
          recordsFailed: result.metrics?.errorCount || 0,
          errorMessage: result.errors?.[0]?.message
        }
      });

      // Emit events
      this.emit('sync:completed', { connectorId, jobId: job.id, result });

      return { ...result, jobId: job.id };
    } catch (error) {
      // Update job with error
      await this.prisma.syncJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error.message,
          errorDetails: { stack: error.stack }
        }
      });

      this.emit('sync:failed', { connectorId, jobId: job.id, error });
      throw error;
    }
  }

  /**
   * Get User 360 view with enhanced data aggregation
   */
  async getUserProfile(userId) {
    try {
      // Get identity mapping
      const identity = await this.prisma.identityMapping.findUnique({
        where: { novaUserId: userId }
      });

      if (!identity) {
        throw new Error(`User not found: ${userId}`);
      }

      // Aggregate data from all connectors
      const profile = {
        userId,
        email: identity.email,
        identity: identity.externalMappings,
        devices: [],
        apps: [],
        security: { mfa: false, riskScore: 0 },
        tickets: [],
        alerts: [],
        hr: {},
        lastUpdated: new Date()
      };

      // Fetch data from each active connector
      for (const [connectorId, connector] of this.connectors) {
        try {
          const connectorData = await this.fetchUserDataFromConnector(
            connector, 
            identity.externalMappings
          );
          
          // Use Nova Synth to normalize and transform data before merging
          const normalizedData = await this.normalizeUserAttributesWithSynth(
            connectorData, 
            connector.type
          );
          
          // Merge data into profile
          this.mergeConnectorData(profile, normalizedData, connectorId);
        } catch (error) {
          this.logger.warn(`Failed to fetch data from ${connectorId}:`, error.message);
        }
      }

      // Use Nova Synth to validate the final profile
      const validationResult = await this.validateProfileWithSynth(profile);
      if (validationResult.score < 0.7) {
        this.logger.warn(`Profile quality below threshold for user ${userId}: ${validationResult.score}`);
      }

      // Use Nova Synth to deduplicate any duplicate entries
      if (profile.devices.length > 1) {
        profile.devices = await this.deduplicateProfileDataWithSynth(profile.devices);
      }

      return profile;
    } catch (error) {
      this.emit('user360:error', { userId, error });
      throw error;
    }
  }

  /**
   * Get user assets from all connected systems
   */
  async getUserAssets(userId, type = 'all') {
    try {
      const identity = await this.prisma.identityMapping.findUnique({
        where: { novaUserId: userId }
      });

      if (!identity) {
        throw new Error(`User not found: ${userId}`);
      }

      const assets = [];
      const deviceConnectors = ['jamf', 'intune', 'crowdstrike'];
      
      for (const connectorId of deviceConnectors) {
        const connector = this.connectors.get(connectorId);
        if (!connector) continue;

        try {
          const connectorAssets = await this.fetchUserAssetsFromConnector(
            connector, 
            identity.externalMappings, 
            type
          );
          assets.push(...connectorAssets);
        } catch (error) {
          console.warn(`Failed to fetch assets from ${connectorId}:`, error.message);
        }
      }

      return assets;
    } catch (error) {
      this.emit('user360:assets:error', { userId, error });
      throw error;
    }
  }

  /**
   * Get user tickets from Nova ticketing system
   */
  async getUserTickets(userId, options = {}) {
    try {
      const { status = 'all', limit = 20 } = options;
      
      // Query Nova ticketing database
      const whereClause = status === 'all' ? {} : { status: status.toUpperCase() };
      
      const tickets = await this.prisma.ticket.findMany({
        where: {
          userId: userId,
          ...whereClause
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        include: {
          comments: {
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        }
      });

      return tickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        assignedTo: ticket.assignedTo,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        recentComments: ticket.comments
      }));
    } catch (error) {
      this.emit('user360:tickets:error', { userId, error });
      throw error;
    }
  }

  /**
   * Get user activity logs from all systems
   */
  async getUserActivity(userId, since) {
    try {
      const identity = await this.prisma.identityMapping.findUnique({
        where: { novaUserId: userId }
      });

      if (!identity) {
        throw new Error(`User not found: ${userId}`);
      }

      const activities = [];
      
      // Get activities from each connector that supports it
      for (const [connectorId, connector] of this.connectors) {
        if (!connector.getCapabilities?.()?.supportsActivityLogs) continue;

        try {
          const connectorActivities = await this.fetchUserActivityFromConnector(
            connector,
            identity.externalMappings,
            since
          );
          
          activities.push(...connectorActivities.map(activity => ({
            ...activity,
            source: connectorId
          })));
        } catch (error) {
          console.warn(`Failed to fetch activity from ${connectorId}:`, error.message);
        }
      }

      // Sort by timestamp descending
      return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      this.emit('user360:activity:error', { userId, error });
      throw error;
    }
  }

  /**
   * Update user profile with audit trail
   */
  async updateUserProfile(userId, updates, metadata = {}) {
    try {
      const identity = await this.prisma.identityMapping.findUnique({
        where: { novaUserId: userId }
      });

      if (!identity) {
        throw new Error(`User not found: ${userId}`);
      }

      // Update the user profile
      const updatedProfile = await this.prisma.userProfile.upsert({
        where: { userId },
        update: {
          ...updates,
          updatedAt: new Date()
        },
        create: {
          userId,
          ...updates,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create audit trail
      await this.prisma.auditLog.create({
        data: {
          entityType: 'USER_PROFILE',
          entityId: userId,
          action: 'UPDATE',
          changes: updates,
          performedBy: metadata.updatedBy || 'system',
          reason: metadata.reason || 'Profile update',
          timestamp: new Date()
        }
      });

      this.emit('user360:profile:updated', { userId, updates, metadata });
      
      return updatedProfile;
    } catch (error) {
      this.emit('user360:profile:error', { userId, error });
      throw error;
    }
  }

  /**
   * Merge user profiles (admin function)
   */
  async mergeUserProfiles(primaryUserId, secondaryUserId, options = {}) {
    try {
      const { strategy = 'merge', mergedBy, reason } = options;

      // Get both profiles
      const primaryProfile = await this.getUserProfile(primaryUserId);
      const secondaryProfile = await this.getUserProfile(secondaryUserId);

      if (!primaryProfile || !secondaryProfile) {
        throw new Error('One or both user profiles not found');
      }

      // Calculate merge confidence using Nova Synth
      const mergeConfidence = await this.calculateMergeConfidenceWithSynth(
        primaryProfile, 
        secondaryProfile
      );

      if (mergeConfidence < 0.7) {
        this.logger.warn(`Low confidence merge detected (${mergeConfidence}) for users ${primaryUserId} and ${secondaryUserId}`);
      }

      // Perform merge based on strategy
      let mergedData = {};
      
      switch (strategy) {
        case 'replace':
          mergedData = secondaryProfile;
          break;
        case 'keep_primary':
          mergedData = primaryProfile;
          break;
        case 'intelligent':
          // Use Nova Synth for intelligent merging
          try {
            const synthResult = await this.mergeProfilesWithSynth(primaryProfile, secondaryProfile);
            mergedData = synthResult || this.mergeProfileData(primaryProfile, secondaryProfile);
          } catch (synthError) {
            this.logger.warn('Nova Synth merge failed, falling back to standard merge');
            mergedData = this.mergeProfileData(primaryProfile, secondaryProfile);
          }
          break;
        case 'merge':
        default:
          mergedData = this.mergeProfileData(primaryProfile, secondaryProfile);
          break;
      }

      // Update primary profile with merged data
      await this.updateUserProfile(primaryUserId, mergedData, {
        updatedBy: mergedBy,
        reason: `Profile merge: ${reason}`,
        confidence: mergeConfidence
      });

      // Archive secondary profile
      await this.prisma.userProfile.update({
        where: { userId: secondaryUserId },
        data: {
          status: 'MERGED',
          mergedInto: primaryUserId,
          mergedAt: new Date(),
          mergedBy: mergedBy
        }
      });

      // Create detailed audit trail
      await this.prisma.auditLog.create({
        data: {
          entityType: 'USER_PROFILE_MERGE',
          entityId: primaryUserId,
          action: 'MERGE',
          changes: {
            strategy,
            secondaryUserId,
            mergedFields: Object.keys(mergedData)
          },
          performedBy: mergedBy,
          reason: reason,
          timestamp: new Date()
        }
      });

      this.emit('user360:profiles:merged', { 
        primaryUserId, 
        secondaryUserId, 
        strategy, 
        mergedBy 
      });

      return {
        success: true,
        primaryUserId,
        secondaryUserId,
        mergedFields: Object.keys(mergedData)
      };
    } catch (error) {
      this.emit('user360:merge:error', { primaryUserId, secondaryUserId, error });
      throw error;
    }
  }

  /**
   * Execute action on external system with circuit breaker
   */
  async executeAction(request) {
    const connector = this.connectors.get(request.connectorId);
    if (!connector) {
      throw new Error(`Connector not found: ${request.connectorId}`);
    }

    try {
      // Use circuit breaker if available
      const circuitBreaker = this.circuitBreakers.get(request.connectorId);
      const result = circuitBreaker 
        ? await circuitBreaker.fire('push', request)
        : await connector.push(request);
      
      // Log the action
      await this.logAction(request, result);
      
      this.emit('action:executed', { request, result });
      return result;
    } catch (error) {
      this.emit('action:failed', { request, error });
      throw error;
    }
  }

  /**
   * Get connector health status
   */
  async getConnectorHealth(connectorId) {
    const connectors = connectorId 
      ? [this.connectors.get(connectorId)].filter(Boolean)
      : Array.from(this.connectors.values());

    const healthStatuses = await Promise.allSettled(
      connectors.map(async (connector) => {
        try {
          return await connector.health();
        } catch (error) {
          return {
            status: 'unhealthy',
            lastCheck: new Date(),
            metrics: [],
            issues: [error.message]
          };
        }
      })
    );

    return healthStatuses
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  }

  // Private helper methods

  async loadConnector(config) {
    // Dynamic connector loading based on type
    const ConnectorClass = await this.getConnectorClass(config.type);
    const connector = new ConnectorClass();
    
    await connector.initialize(config.config);
    this.connectors.set(config.id, connector);
  }

  async getConnectorClass(type) {
    // Dynamic import based on connector type
    switch (type) {
      case 'IDENTITY_PROVIDER':
        const { OktaConnector } = await import('./connectors/okta-connector.js');
        return OktaConnector;
      
      case 'DEVICE_MANAGEMENT':
        // Handle multiple device management connectors
        try {
          const { JamfConnector } = await import('./connectors/jamf-connector.js');
          return JamfConnector;
        } catch {
          const { IntuneConnector } = await import('./connectors/intune-connector.js');
          return IntuneConnector;
        }
      
      case 'SECURITY_PLATFORM':
        const { CrowdStrikeConnector } = await import('./connectors/crowdstrike-connector.js');
        return CrowdStrikeConnector;
      
      case 'COLLABORATION':
        // Handle multiple collaboration connectors
        try {
          const { SlackConnector } = await import('./connectors/slack-connector.js');
          return SlackConnector;
        } catch {
          const { ZoomConnector } = await import('./connectors/zoom-connector.js');
          return ZoomConnector;
        }
      
      case 'AI_PLATFORM':
        const { NovaSynthConnector } = await import('./connectors/nova-synth-connector.js');
        return NovaSynthConnector;
      
      case 'DATA_INTELLIGENCE':
        const { NovaSynthConnector: DataNovaSynthConnector } = await import('./connectors/nova-synth-connector.js');
        return DataNovaSynthConnector;
      
      default:
        throw new Error(`Unknown connector type: ${type}`);
    }
  }

  async startSyncScheduler() {
    // Implementation for scheduled sync jobs
    setInterval(async () => {
      const scheduledConnectors = await this.prisma.connector.findMany({
        where: { 
          syncEnabled: true,
          status: 'ACTIVE'
        }
      });

      for (const connector of scheduledConnectors) {
        const lastSync = connector.lastSync;
        const interval = connector.syncInterval * 1000; // Convert to milliseconds
        
        if (!lastSync || Date.now() - lastSync.getTime() >= interval) {
          try {
            await this.executeSync(connector.id, { type: 'incremental' });
          } catch (error) {
            this.logger.error(`Scheduled sync failed for ${connector.id}:`, error);
          }
        }
      }
    }, 60000); // Check every minute
  }

  async startHealthMonitoring() {
    // Implementation for health monitoring
    setInterval(async () => {
      for (const [connectorId, connector] of this.connectors) {
        try {
          const health = await connector.health();
          
          // Store health metrics
          await this.prisma.connectorMetric.create({
            data: {
              connectorId,
              metricType: 'GAUGE',
              metricName: 'health_status',
              value: health.status === 'healthy' ? 1 : 0,
              dimensions: { status: health.status }
            }
          });
        } catch (error) {
          this.logger.error(`Health check failed for ${connectorId}:`, error);
        }
      }
    }, 30000); // Every 30 seconds
  }

  async startEventProcessor() {
    // Implementation for processing integration events
    // This would typically use a message queue like Kafka or Redis
  }

  async fetchUserDataFromConnector(connector, externalMappings) {
    // Implementation depends on connector capabilities
    try {
      const capabilities = connector.getCapabilities?.() || {};
      const userData = {};

      // Get user identity from external mapping
      const connectorUserId = this.getConnectorUserId(connector.id, externalMappings);
      if (!connectorUserId) {
        return {};
      }

      // Fetch data based on connector capabilities
      if (capabilities.dataTypes?.includes('users')) {
        userData.profile = await this.fetchUserProfile(connector, connectorUserId);
      }

      if (capabilities.dataTypes?.includes('devices')) {
        userData.devices = await this.fetchUserDevices(connector, connectorUserId);
      }

      if (capabilities.dataTypes?.includes('apps')) {
        userData.apps = await this.fetchUserApps(connector, connectorUserId);
      }

      if (capabilities.dataTypes?.includes('security')) {
        userData.security = await this.fetchUserSecurity(connector, connectorUserId);
      }

      return userData;
    } catch (error) {
      console.warn(`Failed to fetch data from ${connector.id}:`, error.message);
      return {};
    }
  }

  /**
   * Fetch user assets from a specific connector
   */
  async fetchUserAssetsFromConnector(connector, externalMappings, type) {
    try {
      const connectorUserId = this.getConnectorUserId(connector.id, externalMappings);
      if (!connectorUserId) {
        return [];
      }

      const capabilities = connector.getCapabilities?.() || {};
      const assets = [];

      if (capabilities.dataTypes?.includes('devices') && (type === 'all' || type === 'devices')) {
        const devices = await this.fetchUserDevices(connector, connectorUserId);
        assets.push(...devices.map(device => ({
          ...device,
          type: 'device',
          source: connector.id
        })));
      }

      if (capabilities.dataTypes?.includes('licenses') && (type === 'all' || type === 'licenses')) {
        const licenses = await this.fetchUserLicenses(connector, connectorUserId);
        assets.push(...licenses.map(license => ({
          ...license,
          type: 'license',
          source: connector.id
        })));
      }

      return assets;
    } catch (error) {
      console.warn(`Failed to fetch assets from ${connector.id}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch user activity from a specific connector
   */
  async fetchUserActivityFromConnector(connector, externalMappings, since) {
    try {
      const connectorUserId = this.getConnectorUserId(connector.id, externalMappings);
      if (!connectorUserId) {
        return [];
      }

      const capabilities = connector.getCapabilities?.() || {};
      
      if (!capabilities.supportsActivityLogs) {
        return [];
      }

      // Use polling method if available to get recent activity
      if (typeof connector.poll === 'function') {
        const events = await connector.poll();
        return events.filter(event => 
          event.timestamp >= since && 
          event.data?.userId === connectorUserId
        );
      }

      return [];
    } catch (error) {
      console.warn(`Failed to fetch activity from ${connector.id}:`, error.message);
      return [];
    }
  }

  /**
   * Helper method to get connector-specific user ID from mappings
   */
  getConnectorUserId(connectorId, externalMappings) {
    switch (connectorId) {
      case 'okta':
        return externalMappings.okta_id || externalMappings.oktaId;
      case 'jamf':
        return externalMappings.jamf_id || externalMappings.jamfId;
      case 'intune':
        return externalMappings.intune_id || externalMappings.intuneId;
      case 'crowdstrike':
        return externalMappings.crowdstrike_id || externalMappings.crowdstrikeId;
      case 'slack':
        return externalMappings.slack_id || externalMappings.slackId;
      case 'zoom':
        return externalMappings.zoom_id || externalMappings.zoomId;
      default:
        return externalMappings.email; // Fallback to email
    }
  }

  /**
   * Fetch user profile from connector
   */
  async fetchUserProfile(connector, userId) {
    // Implementation varies by connector type
    if (connector.type === 'IDENTITY_PROVIDER') {
      // Okta-style user fetch
      return await connector.getUser?.(userId) || {};
    }
    return {};
  }

  /**
   * Fetch user devices from connector
   */
  async fetchUserDevices(connector, userId) {
    try {
      if (connector.type === 'DEVICE_MANAGEMENT' || connector.type === 'SECURITY_PLATFORM') {
        // For device management connectors, get devices assigned to user
        const devices = await connector.getUserDevices?.(userId) || [];
        return devices;
      }
      return [];
    } catch (error) {
      console.warn(`Failed to fetch devices for user ${userId}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch user apps from connector
   */
  async fetchUserApps(connector, userId) {
    try {
      if (connector.type === 'IDENTITY_PROVIDER') {
        // Get apps assigned to user through IdP
        const apps = await connector.getUserApps?.(userId) || [];
        return apps;
      }
      return [];
    } catch (error) {
      console.warn(`Failed to fetch apps for user ${userId}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch user security data from connector
   */
  async fetchUserSecurity(connector, userId) {
    try {
      if (connector.type === 'SECURITY_PLATFORM') {
        const security = await connector.getUserSecurity?.(userId) || {};
        return security;
      }
      if (connector.type === 'IDENTITY_PROVIDER') {
        const mfaStatus = await connector.getUserMFAStatus?.(userId) || {};
        return { mfa: mfaStatus };
      }
      return {};
    } catch (error) {
      console.warn(`Failed to fetch security data for user ${userId}:`, error.message);
      return {};
    }
  }

  /**
   * Fetch user licenses from connector
   */
  async fetchUserLicenses(connector, userId) {
    try {
      if (connector.type === 'IDENTITY_PROVIDER' || connector.type === 'COLLABORATION') {
        const licenses = await connector.getUserLicenses?.(userId) || [];
        return licenses;
      }
      return [];
    } catch (error) {
      console.warn(`Failed to fetch licenses for user ${userId}:`, error.message);
      return [];
    }
  }

  /**
   * Merge profile data from two sources
   */
  mergeProfileData(primaryProfile, secondaryProfile) {
    const merged = { ...primaryProfile };

    // Merge arrays
    ['devices', 'apps', 'tickets', 'alerts'].forEach(key => {
      if (secondaryProfile[key] && Array.isArray(secondaryProfile[key])) {
        merged[key] = [...(merged[key] || []), ...secondaryProfile[key]];
      }
    });

    // Merge objects with preference to non-empty values
    ['identity', 'security', 'hr'].forEach(key => {
      if (secondaryProfile[key] && typeof secondaryProfile[key] === 'object') {
        merged[key] = {
          ...(merged[key] || {}),
          ...Object.fromEntries(
            Object.entries(secondaryProfile[key]).filter(([_, value]) => 
              value !== null && value !== undefined && value !== ''
            )
          )
        };
      }
    });

    // Update metadata
    merged.lastUpdated = new Date();
    
    return merged;
  }

  mergeConnectorData(profile, data, connectorId) {
    // Apply transformation rules and conflict resolution with Nova Synth intelligence
    try {
      if (!data || Object.keys(data).length === 0) {
        return;
      }

      // Use Nova Synth for intelligent data transformation if available
      this.transformDataWithSynth(data, connectorId).then(transformedData => {
        data = transformedData;
      }).catch(error => {
        console.warn(`Nova Synth transformation failed for ${connectorId}:`, error.message);
        // Continue with original data
      });

      // Merge profile information
      if (data.profile) {
        profile.identity = {
          ...profile.identity,
          [`${connectorId}_profile`]: data.profile
        };
      }

      // Merge devices
      if (data.devices && Array.isArray(data.devices)) {
        profile.devices.push(...data.devices.map(device => ({
          ...device,
          source: connectorId,
          lastSync: new Date()
        })));
      }

      // Merge apps
      if (data.apps && Array.isArray(data.apps)) {
        profile.apps.push(...data.apps.map(app => ({
          ...app,
          source: connectorId,
          lastSync: new Date()
        })));
      }

      // Merge security data
      if (data.security) {
        // Update MFA status if available
        if (data.security.mfa !== undefined) {
          profile.security.mfa = data.security.mfa;
        }

        // Calculate risk score (simple aggregation)
        if (data.security.riskScore !== undefined) {
          profile.security.riskScore = Math.max(
            profile.security.riskScore || 0,
            data.security.riskScore
          );
        }

        // Store connector-specific security data
        profile.security[`${connectorId}_data`] = data.security;
      }

      // Update last sync timestamp
      profile.lastUpdated = new Date();
      
    } catch (error) {
      console.error(`Failed to merge data from ${connectorId}:`, error.message);
    }
  }

  async logAction(request, result) {
    // Log action execution for audit purposes
    await this.prisma.integrationEvent.create({
      data: {
        eventType: 'action.executed',
        eventCategory: 'SYSTEM_EVENT',
        source: request.connectorId,
        data: { request, result },
        status: result.success ? 'COMPLETED' : 'FAILED'
      }
    });
  }

  // Utility methods for enterprise patterns

  async setupCircuitBreaker(connectorId, connector, config) {
    try {
      // Try to import circuit breaker if not already imported
      if (!CircuitBreaker) {
        try {
          const circuitBreakerModule = await import('opossum');
          CircuitBreaker = circuitBreakerModule.default;
        } catch (importError) {
          this.logger.warn('Circuit breaker not available - continuing without fault tolerance');
          return;
        }
      }

      // Setup circuit breaker for this connector
      const circuitBreaker = new CircuitBreaker(
        async (method, ...args) => connector[method](...args),
        {
          timeout: config.timeout || 30000,
          errorThresholdPercentage: 50,
          resetTimeout: 60000
        }
      );

      this.circuitBreakers.set(connectorId, circuitBreaker);
      this.logger.info(`Circuit breaker set up for connector: ${connectorId}`);
    } catch (error) {
      this.logger.warn(`Failed to setup circuit breaker for ${connectorId}:`, error.message);
    }
  }

  setupRateLimiter(connectorId, rateLimits) {
    // Setup rate limiter for connector
    const limiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: rateLimits?.perMinute || 100,
      message: 'Too many requests from this connector'
    });
    
    this.rateLimiters.set(connectorId, limiter);
  }

  createLogger() {
    // Simple logger implementation
    return {
      info: (message, ...args) => console.log(`[INFO] ${new Date().toISOString()} ${message}`, ...args),
      warn: (message, ...args) => console.warn(`[WARN] ${new Date().toISOString()} ${message}`, ...args),
      error: (message, ...args) => console.error(`[ERROR] ${new Date().toISOString()} ${message}`, ...args),
      debug: (message, ...args) => console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`, ...args)
    };
  }

  async validateConfiguration(config) {
    // Validate configuration against schema
    const requiredFields = ['id', 'credentials', 'endpoints'];
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    return { valid: true, errors: [] };
  }

  // ============================================================================
  // NOVA SYNTH DATA INTELLIGENCE INTEGRATION
  // ============================================================================

  /**
   * Transform data using Nova Synth intelligence
   */
  async transformDataWithSynth(data, connectorId) {
    try {
      const synthConnector = this.connectors.get('nova-synth-data-intelligence');
      if (!synthConnector) {
        return data; // Return original data if Synth not available
      }

      const result = await synthConnector.push({
        action: 'transform_data',
        target: data,
        parameters: {
          transformationRules: this.getTransformationRulesForConnector(connectorId),
          outputFormat: 'nova_standard'
        }
      });

      return result.success ? result.data.transformedData : data;
    } catch (error) {
      console.warn(`Nova Synth transformation failed:`, error.message);
      return data;
    }
  }

  /**
   * Match user profiles using Nova Synth intelligence
   */
  async matchUserProfilesWithSynth(sourceProfile, candidateProfiles) {
    try {
      const synthConnector = this.connectors.get('nova-synth-data-intelligence');
      if (!synthConnector) {
        return null; // No matching available
      }

      const result = await synthConnector.push({
        action: 'match_profiles',
        target: sourceProfile,
        parameters: {
          targetProfiles: candidateProfiles,
          matchingCriteria: {
            email: { weight: 0.4, required: true },
            name: { weight: 0.3, fuzzy: true },
            employeeId: { weight: 0.3, exact: true }
          },
          confidenceThreshold: 0.8
        }
      });

      return result.success ? result.data : null;
    } catch (error) {
      console.warn(`Nova Synth profile matching failed:`, error.message);
      return null;
    }
  }

  /**
   * Deduplicate profile data using Nova Synth
   */
  async deduplicateProfileDataWithSynth(profiles) {
    try {
      const synthConnector = this.connectors.get('nova-synth-data-intelligence');
      if (!synthConnector) {
        return profiles; // Return original if Synth not available
      }

      const result = await synthConnector.push({
        action: 'deduplicate_data',
        target: profiles,
        parameters: {
          deduplicationRules: {
            keyFields: ['email', 'employeeId'],
            fuzzyFields: ['name', 'department'],
            mergeBehavior: 'intelligent'
          },
          similarityThreshold: 0.9
        }
      });

      return result.success ? result.data.uniqueRecords : profiles;
    } catch (error) {
      console.warn(`Nova Synth deduplication failed:`, error.message);
      return profiles;
    }
  }

  /**
   * Validate profile completeness using Nova Synth
   */
  async validateProfileWithSynth(profile) {
    try {
      const synthConnector = this.connectors.get('nova-synth-data-intelligence');
      if (!synthConnector) {
        return { isValid: true, score: 1.0 }; // Default valid
      }

      const result = await synthConnector.push({
        action: 'validate_profile',
        target: profile,
        parameters: {
          validationRules: {
            required: ['email', 'identity'],
            recommended: ['devices', 'security'],
            format: 'nova_user360'
          },
          strictMode: false
        }
      });

      return result.success ? result.data : { isValid: true, score: 1.0 };
    } catch (error) {
      console.warn(`Nova Synth profile validation failed:`, error.message);
      return { isValid: true, score: 1.0 };
    }
  }

  /**
   * Calculate confidence score for profile merges using Nova Synth
   */
  async calculateMergeConfidenceWithSynth(primaryProfile, secondaryProfile) {
    try {
      const synthConnector = this.connectors.get('nova-synth-data-intelligence');
      if (!synthConnector) {
        return 0.5; // Default confidence
      }

      const result = await synthConnector.push({
        action: 'calculate_confidence',
        target: { primary: primaryProfile, secondary: secondaryProfile },
        parameters: {
          confidenceModel: 'profile_merge',
          context: { operation: 'user360_merge' }
        }
      });

      return result.success ? result.data.confidenceScore : 0.5;
    } catch (error) {
      console.warn(`Nova Synth confidence calculation failed:`, error.message);
      return 0.5;
    }
  }

  /**
   * Merge profiles intelligently using Nova Synth
   */
  async mergeProfilesWithSynth(primaryProfile, secondaryProfile) {
    try {
      const synthConnector = this.connectors.get('nova-synth-data-intelligence');
      if (!synthConnector) {
        return null; // Fall back to standard merge
      }

      const result = await synthConnector.push({
        action: 'merge_profiles',
        target: primaryProfile,
        parameters: {
          secondaryProfile: secondaryProfile,
          mergeStrategy: 'intelligent',
          preserveConflicts: true
        }
      });

      return result.success ? result.data.mergedProfile : null;
    } catch (error) {
      console.warn(`Nova Synth profile merging failed:`, error.message);
      return null;
    }
  }

  /**
   * Normalize user attributes across different systems using Nova Synth
   */
  async normalizeUserAttributesWithSynth(attributes, sourceSystem) {
    try {
      const synthConnector = this.connectors.get('nova-synth-data-intelligence');
      if (!synthConnector) {
        return attributes; // Return original if Synth not available
      }

      const result = await synthConnector.push({
        action: 'normalize_attributes',
        target: attributes,
        parameters: {
          normalizationRules: this.getNormalizationRulesForSystem(sourceSystem),
          targetFormat: 'nova_user360'
        }
      });

      return result.success ? result.data.normalizedAttributes : attributes;
    } catch (error) {
      console.warn(`Nova Synth attribute normalization failed:`, error.message);
      return attributes;
    }
  }

  /**
   * Get transformation rules for a specific connector
   */
  getTransformationRulesForConnector(connectorId) {
    const rules = {
      'okta-connector': [
        { field: 'firstName', target: 'profile.givenName' },
        { field: 'lastName', target: 'profile.familyName' },
        { field: 'email', target: 'profile.email', normalize: true }
      ],
      'jamf-connector': [
        { field: 'deviceName', target: 'device.hostname' },
        { field: 'serialNumber', target: 'device.serialNumber' },
        { field: 'osVersion', target: 'device.osVersion', format: 'version' }
      ],
      'crowdstrike-connector': [
        { field: 'hostname', target: 'device.hostname' },
        { field: 'agentVersion', target: 'security.agentVersion' },
        { field: 'lastSeen', target: 'device.lastActivity', format: 'date' }
      ]
    };

    return rules[connectorId] || [];
  }

  /**
   * Get normalization rules for a specific system
   */
  getNormalizationRulesForSystem(systemType) {
    const rules = {
      'IDENTITY_PROVIDER': {
        name: { case: 'title', trim: true },
        email: { case: 'lower', validate: 'email' },
        department: { case: 'title', normalize: 'department_codes' }
      },
      'DEVICE_MANAGEMENT': {
        hostname: { case: 'lower', trim: true },
        osVersion: { format: 'semantic_version' },
        serialNumber: { case: 'upper', trim: true }
      },
      'SECURITY_PLATFORM': {
        riskScore: { range: [0, 100], normalize: 'score' },
        severity: { map: 'severity_levels' }
      }
    };

    return rules[systemType] || {};
  }
}

// ============================================================================
// TYPE SCHEMAS AND CONFIGURATION
// ============================================================================

// Configuration schema for NIL
const NILConfigSchema = {
  tenantId: 'string',
  userId: 'string',
  database: {
    url: 'string'
  },
  security: {
    encryptionKey: 'string',
    jwtSecret: 'string'
  }
};

// User 360 profile schema
const User360ProfileSchema = {
  userId: 'string',
  email: 'string',
  identity: 'object', // Record<string, string>
  devices: 'array', // DeviceInfo[]
  apps: 'array', // AppInfo[]
  security: 'object', // SecurityInfo
  tickets: 'array', // TicketInfo[]
  alerts: 'array', // AlertInfo[]
  hr: 'object', // HRInfo
  lastUpdated: 'date'
};

// Action request schema
const ActionRequestSchema = {
  connectorId: 'string',
  action: 'string',
  target: 'string',
  parameters: 'object', // Record<string, any>
  requestedBy: 'string'
};

// Action result schema
const ActionResultSchema = {
  success: 'boolean',
  message: 'string',
  data: 'any',
  error: 'string'
};

// Validation result schema
const ValidationResultSchema = {
  valid: 'boolean',
  errors: 'array' // string[]
};

// Sync metrics schema
const SyncMetricsSchema = {
  totalRecords: 'number',
  successCount: 'number',
  errorCount: 'number'
};

// Security info schema
const SecurityInfoSchema = {
  mfa: 'boolean',
  riskScore: 'number'
};

// Export singleton instance
export const novaIntegrationLayer = new NovaIntegrationLayer({
  tenantId: process.env.TENANT_ID || 'default',
  userId: process.env.USER_ID || 'system',
  database: {
    url: process.env.INTEGRATION_DATABASE_URL || ''
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || '',
    jwtSecret: process.env.JWT_SECRET || ''
  }
});
