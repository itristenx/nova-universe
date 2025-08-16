/**
 * Nova Synth Data Matching Connector
 * Implements Nova Synth AI for intelligent data matching, correlation, and transformation
 *
 * @author Nova Team
 * @version 1.0.0
 */

import { IConnector, ConnectorType, HealthStatus } from '../nova-integration-layer.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Nova Synth Data Matching Connector for intelligent data correlation and profile matching
 * Follows enterprise integration patterns for AI-powered data operations
 */
export class NovaSynthConnector extends IConnector {
  constructor(config = null) {
    super(
      'nova-synth-connector',
      'Nova Synth Data Intelligence Engine',
      '1.0.0',
      ConnectorType.DATA_INTELLIGENCE,
    );
    this.client = null;
    this.config = config;
    this.matchingCache = new Map();
    this.transformationRules = new Map();
  }

  /**
   * Initialize Nova Synth connector for data intelligence operations
   */
  async initialize(providedConfig = null) {
    try {
      // Use provided config or fall back to constructor config
      const config = providedConfig || this.config;
      if (!config) {
        throw new Error('Configuration is required for Nova Synth connector');
      }

      this.config = config;

      // Validate Nova Synth-specific configuration
      this.validateNovaSynthConfig(config);

      // Setup authentication strategy
      const authHeaders = await this.setupAuthentication(config);

      // Initialize Nova Synth Data Intelligence API client
      this.client = axios.create({
        baseURL: config.endpoints?.synthUrl || 'https://api.novasynth.ai',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Nova-Universe/1.0.0',
          'X-Organization-ID': config.organization?.id,
          ...authHeaders,
        },
      });

      // Add mock response interceptors for testing
      if (config.mockMode) {
        this.setupMockInterceptors();
      } else {
        // Setup request/response interceptors for monitoring
        this.setupInterceptors(config);
      }

      // Initialize transformation rules
      await this.loadTransformationRules();

      // Initialize organization-specific patterns
      await this.loadOrganizationPatterns(config);

      // Test the connection
      await this.testConnection();

      console.log('Nova Synth Data Intelligence connector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Nova Synth connector:', error);
      throw error;
    }
  }

  /**
   * Health check with comprehensive Nova Synth data intelligence testing
   */
  async health() {
    try {
      const startTime = Date.now();

      // Test core matching endpoints
      const matchResponse = await this.client.get('/matching/health', {
        timeout: 5000,
      });

      const apiLatency = Date.now() - startTime;

      // Test transformation engine
      let transformationStatus = 'healthy';
      let transformationLatency = 0;

      try {
        const transformationStartTime = Date.now();
        await this.client.post('/transform/test', {
          data: { test: 'value' },
          rules: [],
        });
        transformationLatency = Date.now() - transformationStartTime;
      } catch (error) {
        transformationStatus = 'degraded';
      }

      // Test correlation engine
      let correlationStatus = 'healthy';
      let correlationLatency = 0;

      try {
        const correlationStartTime = Date.now();
        await this.client.post('/correlate/test', {
          profiles: [{ id: 'test', attributes: {} }],
        });
        correlationLatency = Date.now() - correlationStartTime;
      } catch (error) {
        correlationStatus = 'degraded';
      }

      const overallStatus =
        matchResponse.status === 200 &&
        transformationStatus === 'healthy' &&
        correlationStatus === 'healthy'
          ? HealthStatus.HEALTHY
          : HealthStatus.DEGRADED;

      return {
        status: overallStatus,
        lastCheck: new Date(),
        metrics: [
          {
            name: 'api_latency',
            value: apiLatency,
            unit: 'ms',
          },
          {
            name: 'transformation_latency',
            value: transformationLatency,
            unit: 'ms',
          },
          {
            name: 'correlation_latency',
            value: correlationLatency,
            unit: 'ms',
          },
          {
            name: 'cached_matches',
            value: this.matchingCache.size,
            unit: 'count',
          },
          {
            name: 'transformation_rules',
            value: this.transformationRules.size,
            unit: 'count',
          },
        ],
        issues:
          overallStatus !== HealthStatus.HEALTHY
            ? [
                `Transformation status: ${transformationStatus}`,
                `Correlation status: ${correlationStatus}`,
              ]
            : [],
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        lastCheck: new Date(),
        metrics: [],
        issues: [error.message],
      };
    }
  }

  /**
   * Sync data intelligence operations and update matching rules
   */
  async sync(options = {}) {
    try {
      const syncType = options.type || 'full';
      let totalRecords = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      console.log(`Starting ${syncType} sync for Nova Synth Data Intelligence...`);

      // Update transformation rules
      const rulesResult = await this.syncTransformationRules(options);
      totalRecords += rulesResult.totalRecords;
      successCount += rulesResult.successCount;
      errorCount += rulesResult.errorCount;
      errors.push(...rulesResult.errors);

      // Update matching algorithms
      const matchingResult = await this.syncMatchingAlgorithms(options);
      totalRecords += matchingResult.totalRecords;
      successCount += matchingResult.successCount;
      errorCount += matchingResult.errorCount;
      errors.push(...matchingResult.errors);

      // Update correlation models
      const correlationResult = await this.syncCorrelationModels(options);
      totalRecords += correlationResult.totalRecords;
      successCount += correlationResult.successCount;
      errorCount += correlationResult.errorCount;
      errors.push(...correlationResult.errors);

      const status = errorCount === 0 ? 'success' : successCount > 0 ? 'partial' : 'failed';

      return {
        jobId: crypto.randomUUID(),
        status,
        metrics: {
          totalRecords,
          successCount,
          errorCount,
        },
        errors: errors.slice(0, 10), // Limit error details
        data: null,
      };
    } catch (error) {
      return {
        jobId: crypto.randomUUID(),
        status: 'failed',
        metrics: {
          totalRecords: 0,
          successCount: 0,
          errorCount: 1,
        },
        errors: [
          {
            message: error.message,
          },
        ],
      };
    }
  }

  /**
   * Poll for real-time data intelligence events and matching opportunities
   */
  async poll() {
    try {
      const since = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

      // Get recent data intelligence events
      const eventsResponse = await this.client.get(
        `/events?since=${since.toISOString()}&limit=100`,
      );
      const events = [];

      for (const event of eventsResponse.data.events || []) {
        events.push({
          id: event.id,
          type: event.type,
          timestamp: new Date(event.timestamp),
          data: {
            eventType: event.type,
            entityId: event.entityId,
            matchingScore: event.matchingScore,
            transformationApplied: event.transformationApplied,
            correlations: event.correlations,
            metadata: event.metadata,
          },
          source: 'nova-synth-data-intelligence',
        });
      }

      // Get potential matching candidates
      const matchingCandidates = await this.client.get(
        `/matching/candidates?since=${since.toISOString()}`,
      );

      for (const candidate of matchingCandidates.data.candidates || []) {
        events.push({
          id: `match-${candidate.id}-${candidate.timestamp}`,
          type: 'data.matching.candidate',
          timestamp: new Date(candidate.timestamp),
          data: {
            candidateId: candidate.id,
            sourceEntity: candidate.sourceEntity,
            targetEntity: candidate.targetEntity,
            matchingScore: candidate.matchingScore,
            confidence: candidate.confidence,
            suggestedMerge: candidate.suggestedMerge,
          },
          source: 'nova-synth-data-intelligence',
        });
      }

      return events;
    } catch (error) {
      console.error('Failed to poll Nova Synth data intelligence events:', error);
      return [];
    }
  }

  /**
   * Execute data intelligence operations via Nova Synth
   */
  async push(action) {
    try {
      const { action: actionType, target, parameters } = action;

      switch (actionType) {
        case 'match_profiles':
          return await this.matchProfiles(target, parameters);

        case 'transform_data':
          return await this.transformData(target, parameters);

        case 'correlate_entities':
          return await this.correlateEntities(target, parameters);

        case 'merge_profiles':
          return await this.mergeProfiles(target, parameters);

        case 'deduplicate_data':
          return await this.deduplicateData(target, parameters);

        case 'validate_profile':
          return await this.validateProfile(target, parameters);

        case 'normalize_attributes':
          return await this.normalizeAttributes(target, parameters);

        case 'calculate_confidence':
          return await this.calculateConfidence(target, parameters);

        default:
          throw new Error(`Unsupported action: ${actionType}`);
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.message,
      };
    }
  }

  /**
   * Validate Nova Synth-specific configuration
   */
  validateConfig(config) {
    const errors = [];

    if (!config.credentials?.apiToken) {
      errors.push('Missing Nova Synth API token');
    }

    if (config.endpoints?.synthUrl && !config.endpoints.synthUrl.includes('/api/v2/synth')) {
      errors.push('Invalid Nova Synth API URL - should include /api/v2/synth');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get connector capabilities
   */
  getCapabilities() {
    return {
      supportsSync: true,
      supportsPush: true,
      supportsPoll: true,
      rateLimit: 1000, // Nova Synth internal rate limit
      dataTypes: [
        'profile_matching',
        'data_transformation',
        'entity_correlation',
        'profile_deduplication',
        'attribute_normalization',
        'confidence_scoring',
      ],
      actions: [
        'match_profiles',
        'transform_data',
        'correlate_entities',
        'merge_profiles',
        'deduplicate_data',
        'validate_profile',
        'normalize_attributes',
        'calculate_confidence',
      ],
      dataIntelligenceCategories: [
        'profile_matching',
        'data_transformation',
        'entity_correlation',
        'deduplication',
      ],
    };
  }

  /**
   * Get data schema for Nova Synth data intelligence integration
   */
  getSchema() {
    return {
      input: {
        profile_matching: {
          sourceProfile: 'object',
          targetProfiles: 'array',
          matchingCriteria: 'object',
          confidenceThreshold: 'number',
        },
        data_transformation: {
          sourceData: 'object',
          transformationRules: 'array',
          outputFormat: 'string',
        },
        entity_correlation: {
          entities: 'array',
          correlationRules: 'object',
          context: 'object',
        },
      },
      output: {
        nova_match_result: {
          matchId: 'string',
          sourceId: 'string',
          targetId: 'string',
          matchingScore: 'number',
          confidence: 'number',
          matchedAttributes: 'array',
        },
        nova_transformation_result: {
          transformationId: 'string',
          sourceData: 'object',
          transformedData: 'object',
          rulesApplied: 'array',
          success: 'boolean',
        },
        nova_correlation_result: {
          correlationId: 'string',
          entities: 'array',
          relationships: 'array',
          confidence: 'number',
        },
      },
    };
  }

  async shutdown() {
    // Cleanup resources
    this.matchingCache.clear();
    this.transformationRules.clear();
    this.client = null;
    this.config = null;
    console.log('Nova Synth Data Intelligence connector shut down');
  }

  // Private helper methods

  // Private helper methods

  validateNovaSynthConfig(config) {
    // Skip validation in mock mode
    if (config.mockMode) {
      console.log('Mock mode enabled - skipping strict validation');
      return;
    }

    // Validate authentication strategy
    const authStrategy = config.authentication?.strategy || 'bearer';
    if (!['bearer', 'oauth2', 'jwt', 'api_key'].includes(authStrategy)) {
      throw new Error(`Unsupported authentication strategy: ${authStrategy}`);
    }

    // Validate credentials based on strategy
    if (!config.credentials) {
      throw new Error('Credentials are required');
    }

    switch (authStrategy) {
      case 'bearer':
        if (!config.credentials.token) {
          throw new Error('Bearer token is required');
        }
        break;
      case 'oauth2':
        if (!config.credentials.clientId || !config.credentials.clientSecret) {
          throw new Error('OAuth2 client ID and secret are required');
        }
        break;
      case 'jwt':
        if (!config.credentials.jwtSecret) {
          throw new Error('JWT secret is required');
        }
        break;
      case 'api_key':
        if (!config.credentials.apiKey) {
          throw new Error('API key is required');
        }
        break;
    }

    // Validate organization configuration
    if (!config.organization?.id) {
      throw new Error('Organization ID is required for Nova Synth configuration');
    }
  }

  async setupAuthentication(config) {
    // Skip actual authentication in mock mode
    if (config.mockMode) {
      console.log('Mock mode - using mock authentication headers');
      return {
        Authorization: 'Bearer mock-token',
        'X-API-Key': 'mock-api-key',
      };
    }

    const strategy = config.authentication?.strategy || 'bearer';

    switch (strategy) {
      case 'bearer':
        const bearerToken = config.credentials.token || config.credentials.apiToken;
        return {
          Authorization: `Bearer ${bearerToken}`,
        };

      case 'oauth2':
        const accessToken = await this.getOAuth2Token(config);
        return {
          Authorization: `Bearer ${accessToken}`,
        };

      case 'jwt':
        const jwtToken = await this.generateJWTToken(config);
        return {
          Authorization: `Bearer ${jwtToken}`,
        };

      case 'api_key':
        const apiKey = config.credentials.apiKey;
        const headerName = config.credentials.apiKeyHeader || 'X-API-Key';
        return {
          [headerName]: apiKey,
        };

      default:
        throw new Error(`Unsupported authentication strategy: ${strategy}`);
    }
  }

  setupMockInterceptors() {
    // Mock request interceptor
    this.client.interceptors.request.use((config) => {
      console.log(`[Mock Nova Synth API] ${config.method?.toUpperCase()} ${config.url}`);

      // Generate mock responses based on URL patterns
      const mockResponse = this.generateMockResponse(config);

      // Return a rejected promise that will be caught by response interceptor
      // This prevents actual HTTP requests in mock mode
      return Promise.reject({
        isMockResponse: true,
        config,
        data: mockResponse.data,
        status: mockResponse.status,
        statusText: 'OK',
        headers: {},
      });
    });

    // Mock response interceptor to handle our mock responses
    this.client.interceptors.response.use(
      (response) => response, // This won't be called in mock mode
      (error) => {
        if (error.isMockResponse) {
          // Return our mock response as a successful response
          return Promise.resolve({
            data: error.data,
            status: error.status,
            statusText: error.statusText,
            headers: error.headers,
            config: error.config,
          });
        }
        return Promise.reject(error);
      },
    );
  }

  generateMockResponse(config) {
    const url = config.url || '';
    const method = config.method?.toUpperCase() || 'GET';

    // Mock responses based on URL patterns
    if (url.includes('/profiles/match') || url.includes('/matching/profiles')) {
      return {
        status: 200,
        data: {
          success: true,
          result: {
            matches: [
              {
                id: 'match_1',
                profiles: [
                  { name: 'John Doe', email: 'john@company.com' },
                  { name: 'J. Doe', email: 'j.doe@company.com' },
                ],
                confidence: 0.89,
                matchType: 'high_confidence',
              },
            ],
          },
        },
      };
    }

    if (url.includes('/data/transform') || url.includes('/transformation/apply')) {
      // Create a mock transformed result based on input data
      const inputData = config.data?.data || [];
      const transformedData = inputData.map((item) => {
        const transformed = { ...item };
        // Apply mock transformations based on the input
        if (transformed.name) {
          transformed.name = 'John Doe'; // Normalized name
        }
        if (transformed.email) {
          transformed.email = 'john@company.com'; // Normalized email
        }
        // Preserve other fields (like ssn) so redaction can be applied later
        return transformed;
      });

      return {
        status: 200,
        data: {
          success: true,
          result: transformedData,
          transformedData: transformedData,
        },
      };
    }

    if (url.includes('/data/correlate') || url.includes('/correlation/analyze')) {
      return {
        status: 200,
        data: {
          success: true,
          result: {
            correlations: [
              {
                entity1: { id: 1, type: 'user' },
                entity2: { id: 1, type: 'device' },
                relationship: 'owns',
                confidence: 0.95,
              },
            ],
          },
        },
      };
    }

    if (url.includes('/records/deduplicate') || url.includes('/deduplication/analyze')) {
      return {
        status: 200,
        data: {
          success: true,
          result: {
            duplicates: [
              {
                id: 'dup_1',
                records: [
                  { name: 'John Doe', email: 'john@company.com' },
                  { name: 'John Doe', email: 'john@company.com' },
                ],
                confidence: 1.0,
              },
            ],
          },
        },
      };
    }

    if (url.includes('/training/organization') && method === 'POST') {
      return {
        status: 200,
        data: {
          success: true,
          trainingId: 'train_123',
          patternsLearned: 15,
          modelVersion: '2.1.0',
          accuracy: 0.94,
        },
      };
    }

    if (url.includes('/metrics/quality')) {
      return {
        status: 200,
        data: {
          success: true,
          overallQuality: 0.87,
          matchingAccuracy: 0.89,
          transformationSuccess: 0.92,
          deduplicationEfficiency: 0.84,
          confidenceDistribution: { high: 0.6, medium: 0.3, low: 0.1 },
          errorRates: { total: 0.03 },
        },
      };
    }

    if (url.includes('/analysis/matching-failures')) {
      return {
        status: 200,
        data: [
          { type: 'name_matching', reason: 'fuzzy match failed', count: 5 },
          { type: 'email_matching', reason: 'domain mismatch', count: 3 },
        ],
      };
    }

    if (url.includes('/analysis/errors')) {
      return {
        status: 200,
        data: [
          { message: 'auth token expired', status: 401, timestamp: new Date() },
          { message: 'validation failed', status: 400, timestamp: new Date() },
        ],
      };
    }

    // Default mock response
    return {
      status: 200,
      data: {
        success: true,
        message: 'Mock response',
        data: {},
      },
    };
  }

  setupInterceptors() {
    // Request interceptor for monitoring and auth refresh
    this.client.interceptors.request.use(
      (config) => {
        // Add correlation ID for request tracking
        config.headers['X-Correlation-ID'] = crypto.randomUUID();
        config.headers['X-Organization-ID'] = this.config.organization?.id;

        // Log request for monitoring
        this.logAPIRequest(config);

        return config;
      },
      (error) => {
        this.logAPIError('request', error);
        return Promise.reject(error);
      },
    );

    // Response interceptor for monitoring and error handling
    this.client.interceptors.response.use(
      (response) => {
        // Log successful response
        this.logAPIResponse(response);

        // Update quality metrics
        this.updateQualityMetrics(response);

        return response;
      },
      async (error) => {
        // Handle auth errors with refresh
        if (error.response?.status === 401) {
          try {
            await this.refreshAuthentication();
            // Retry the original request
            return this.client.request(error.config);
          } catch (refreshError) {
            this.logAPIError('auth_refresh', refreshError);
          }
        }

        this.logAPIError('response', error);
        return Promise.reject(error);
      },
    );
  }

  async loadOrganizationPatterns(config) {
    try {
      // In mock mode, use predefined patterns
      if (config?.mockMode) {
        this.organizationPatterns = {
          namePatterns: [/^[A-Z][a-z]+ [A-Z][a-z]+$/],
          emailDomains: ['company.com', 'test.org'],
          departmentMappings: { IT: ['Information Technology'] },
          deviceNamingConventions: [/^[A-Z]{2}-\d{3}$/],
          customAttributes: { employeeIdPattern: /^EMP\d{6}$/ },
        };

        console.log('Loaded mock organization patterns');
        return;
      }

      const orgId = config.organization?.id;
      if (!orgId) return;

      // Load organization-specific data patterns
      const response = await this.client.get(`/organization/${orgId}/patterns`);
      const patterns = response.data.patterns || {};

      // Store patterns for use in data operations
      this.organizationPatterns = {
        namePatterns: patterns.namePatterns || [],
        emailDomains: patterns.emailDomains || [],
        departmentMappings: patterns.departmentMappings || {},
        deviceNamingConventions: patterns.deviceNamingConventions || [],
        customAttributes: patterns.customAttributes || {},
      };

      console.log(`Loaded ${Object.keys(patterns).length} organization-specific patterns`);
    } catch (error) {
      console.warn('Failed to load organization patterns:', error.message);
      this.organizationPatterns = {};
    }
  }

  async testConnection() {
    try {
      // Skip actual connection test in mock mode
      if (this.config?.mockMode) {
        console.log('Mock mode - skipping connection test');
        return;
      }

      const response = await this.client.get('/health');

      if (response.status !== 200) {
        throw new Error('Failed to connect to Nova Synth Data Intelligence API');
      }
    } catch (error) {
      throw new Error(`Nova Synth connection test failed: ${error.message}`);
    }
  }

  async loadTransformationRules() {
    try {
      // In mock mode, use predefined rules
      if (this.config?.mockMode) {
        const mockRules = [
          { id: 'name-normalize', type: 'normalize', field: 'name' },
          { id: 'email-lowercase', type: 'transform', field: 'email' },
        ];

        for (const rule of mockRules) {
          this.transformationRules.set(rule.id, rule);
        }

        console.log(`Loaded ${mockRules.length} mock transformation rules`);
        return;
      }

      const response = await this.client.get('/transformation/rules');
      const rules = response.data.rules || [];

      for (const rule of rules) {
        this.transformationRules.set(rule.id, rule);
      }

      console.log(`Loaded ${rules.length} transformation rules`);
    } catch (error) {
      console.warn('Failed to load transformation rules:', error.message);
    }
  }

  async syncTransformationRules(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      const response = await this.client.get('/transformation/rules');
      const rules = response.data.rules || [];
      totalRecords = rules.length;

      for (const rule of rules) {
        try {
          this.transformationRules.set(rule.id, rule);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            ruleId: rule.id,
            message: error.message,
          });
        }
      }

      return {
        totalRecords,
        successCount,
        errorCount,
        errors,
      };
    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }],
      };
    }
  }

  async syncMatchingAlgorithms(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      const response = await this.client.get('/matching/algorithms');
      const algorithms = response.data.algorithms || [];
      totalRecords = algorithms.length;

      for (const algorithm of algorithms) {
        try {
          await this.processMatchingAlgorithm(algorithm);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            algorithmId: algorithm.id,
            message: error.message,
          });
        }
      }

      return {
        totalRecords,
        successCount,
        errorCount,
        errors,
      };
    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }],
      };
    }
  }

  async syncCorrelationModels(options) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    let totalRecords = 0;

    try {
      const response = await this.client.get('/correlation/models');
      const models = response.data.models || [];
      totalRecords = models.length;

      for (const model of models) {
        try {
          await this.processCorrelationModel(model);
          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            modelId: model.id,
            message: error.message,
          });
        }
      }

      return {
        totalRecords,
        successCount,
        errorCount,
        errors,
      };
    } catch (error) {
      return {
        totalRecords,
        successCount: 0,
        errorCount: 1,
        errors: [{ message: error.message }],
      };
    }
  }

  async processMatchingAlgorithm(algorithm) {
    console.log(`Processing matching algorithm: ${algorithm.name}`);
    // Here you would save to Nova database or cache
    return algorithm;
  }

  async processCorrelationModel(model) {
    console.log(`Processing correlation model: ${model.name}`);
    // Here you would save to Nova database or cache
    return model;
  }

  // Data Intelligence Operations

  async matchProfiles(sourceProfile, parameters) {
    try {
      const { targetProfiles, matchingCriteria, confidenceThreshold } = parameters;

      const response = await this.client.post('/matching/profiles', {
        sourceProfile,
        targetProfiles: targetProfiles || [],
        criteria: matchingCriteria || {},
        threshold: confidenceThreshold || 0.8,
      });

      return {
        success: true,
        message: 'Profile matching completed successfully',
        data: {
          matches: response.data.result?.matches || response.data.matches,
          totalCandidates: response.data.totalCandidates,
          bestMatch: response.data.bestMatch,
        },
      };
    } catch (error) {
      throw new Error(`Failed to match profiles: ${error.message}`);
    }
  }

  async transformData(sourceData, parameters) {
    try {
      // Handle both formats: direct rules or nested transformationRules
      let transformationRules = parameters?.transformationRules || parameters;
      const outputFormat = parameters?.outputFormat;
      const redact = parameters?.redact !== false; // Default to true unless explicitly false

      // Apply data redaction if specified
      let processedData = sourceData;
      if (redact && transformationRules) {
        processedData = this.applyDataRedaction(sourceData, transformationRules);
      }

      const response = await this.client.post('/transformation/apply', {
        data: processedData,
        rules: transformationRules || [],
        format: outputFormat || 'nova_standard',
      });

      let transformedData = response.data.result || response.data.transformedData || [];

      // Apply redaction to the final result if needed
      if (redact && transformationRules) {
        transformedData = this.applyDataRedaction(transformedData, transformationRules);
      }

      return {
        success: true,
        message: 'Data transformation completed successfully',
        data: {
          transformedData: transformedData,
          rulesApplied: response.data.rulesApplied,
          transformationId: response.data.id,
        },
        transformedData: transformedData,
        transformedRecords: transformedData,
        appliedRules: response.data.rulesApplied || [],
        redactionApplied:
          redact && transformationRules && Object.keys(transformationRules).length > 0,
      };
    } catch (error) {
      throw new Error(`Failed to transform data: ${error.message}`);
    }
  }

  /**
   * Apply data redaction to sensitive fields
   */
  applyDataRedaction(data, rules = {}) {
    const sensitiveFields = ['ssn', 'credit_card', 'password', 'social_security', 'email', 'phone'];

    const redactValue = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map((item) => redactValue(item));
      }

      if (obj && typeof obj === 'object') {
        const redactedObj = { ...obj };

        Object.keys(redactedObj).forEach((key) => {
          if (sensitiveFields.includes(key.toLowerCase()) || rules[key]?.redact) {
            redactedObj[key] = '[REDACTED]';
          } else if (typeof redactedObj[key] === 'object') {
            redactedObj[key] = redactValue(redactedObj[key]);
          }
        });

        return redactedObj;
      }

      return obj;
    };

    return redactValue(data);
  }

  async correlateEntities(entities, parameters) {
    try {
      const { correlationRules, context } = parameters;

      const response = await this.client.post('/correlation/analyze', {
        entities: entities || [],
        rules: correlationRules || {},
        context: context || {},
      });

      return {
        success: true,
        message: 'Entity correlation completed successfully',
        data: {
          correlations: response.data.result?.correlations || response.data.correlations,
          relationships: response.data.relationships,
          confidence: response.data.confidence,
        },
      };
    } catch (error) {
      throw new Error(`Failed to correlate entities: ${error.message}`);
    }
  }

  async mergeProfiles(primaryProfile, parameters) {
    try {
      const { secondaryProfile, mergeStrategy, preserveConflicts } = parameters;

      const response = await this.client.post('/profiles/merge', {
        primary: primaryProfile,
        secondary: secondaryProfile,
        strategy: mergeStrategy || 'intelligent',
        preserveConflicts: preserveConflicts !== false,
      });

      return {
        success: true,
        message: 'Profile merge completed successfully',
        data: {
          mergedProfile: response.data.mergedProfile,
          conflicts: response.data.conflicts,
          mergeId: response.data.mergeId,
        },
      };
    } catch (error) {
      throw new Error(`Failed to merge profiles: ${error.message}`);
    }
  }

  async deduplicateData(dataset, parameters) {
    try {
      const { deduplicationRules, similarityThreshold } = parameters;

      const response = await this.client.post('/deduplication/analyze', {
        data: dataset,
        rules: deduplicationRules || {},
        threshold: similarityThreshold || 0.9,
      });

      return {
        success: true,
        message: 'Data deduplication completed successfully',
        data: {
          uniqueRecords: response.data.uniqueRecords || response.data.result?.uniqueRecords,
          duplicates: response.data.duplicates || response.data.result?.duplicates,
          deduplicationReport: response.data.report || response.data.result?.report,
        },
      };
    } catch (error) {
      throw new Error(`Failed to deduplicate data: ${error.message}`);
    }
  }

  async validateProfile(profile, parameters) {
    try {
      const { validationRules, strictMode } = parameters;

      const response = await this.client.post('/validation/profile', {
        profile,
        rules: validationRules || {},
        strict: strictMode !== false,
      });

      return {
        success: true,
        message: 'Profile validation completed successfully',
        data: {
          isValid: response.data.valid,
          errors: response.data.errors,
          warnings: response.data.warnings,
          validationScore: response.data.score,
        },
      };
    } catch (error) {
      throw new Error(`Failed to validate profile: ${error.message}`);
    }
  }

  async normalizeAttributes(attributes, parameters) {
    try {
      const { normalizationRules, targetFormat } = parameters;

      const response = await this.client.post('/normalization/attributes', {
        attributes,
        rules: normalizationRules || {},
        format: targetFormat || 'nova_standard',
      });

      return {
        success: true,
        message: 'Attribute normalization completed successfully',
        data: {
          normalizedAttributes: response.data.normalized,
          normalizationReport: response.data.report,
        },
      };
    } catch (error) {
      throw new Error(`Failed to normalize attributes: ${error.message}`);
    }
  }

  async calculateConfidence(data, parameters) {
    try {
      const { confidenceModel, context } = parameters;

      const response = await this.client.post('/confidence/calculate', {
        data,
        model: confidenceModel || 'default',
        context: context || {},
      });

      return {
        success: true,
        message: 'Confidence calculation completed successfully',
        data: {
          confidenceScore: response.data.score,
          factors: response.data.factors,
          recommendation: response.data.recommendation,
        },
      };
    } catch (error) {
      throw new Error(`Failed to calculate confidence: ${error.message}`);
    }
  }

  // ============================================================================
  // CONVENIENCE METHODS FOR PRODUCTION API
  // ============================================================================

  /**
   * Convenience method for matching user profiles (alias for matchProfiles)
   */
  async matchUserProfiles(profiles, options = {}) {
    const result = await this.matchProfiles(profiles[0], {
      targetProfiles: profiles.slice(1),
      ...options,
    });
    // Return data in expected format for tests
    return {
      ...result,
      matches: result.data?.matches || [],
      totalCandidates: result.data?.totalCandidates,
      bestMatch: result.data?.bestMatch,
    };
  }

  /**
   * Convenience method for correlating data (alias for correlateEntities)
   */
  async correlateData(data, options = {}) {
    const result = await this.correlateEntities(data, options);
    // Return data in expected format for tests
    return {
      ...result,
      correlations: result.data?.correlations || [],
      relationships: result.data?.relationships,
      confidence: result.data?.confidence,
    };
  }

  /**
   * Convenience method for deduplicating records (alias for deduplicateData)
   */
  async deduplicateRecords(records, options = {}) {
    const result = await this.deduplicateData(records, options);
    // Return data in expected format for tests
    return {
      ...result,
      duplicates: result.data?.duplicates || result.data?.result?.duplicates || [],
      uniqueRecords: result.data?.uniqueRecords || result.data?.result?.uniqueRecords,
      deduplicationStats: result.data?.deduplicationStats || result.data?.deduplicationReport,
    };
  }

  // ============================================================================
  // TRAINING AND ORGANIZATION PATTERN MANAGEMENT
  // ============================================================================

  /**
   * Train Nova Synth with organization-specific data patterns
   */
  async trainWithOrganizationData(trainingData) {
    try {
      const response = await this.client.post('/training/organization', {
        organizationId: this.config.organization?.id,
        trainingData: {
          userProfiles: trainingData.userProfiles || [],
          devicePatterns: trainingData.devicePatterns || [],
          namingConventions: trainingData.namingConventions || {},
          departmentStructure: trainingData.departmentStructure || {},
          customMappings: trainingData.customMappings || {},
        },
        trainingOptions: {
          mode: 'incremental',
          validateBefore: true,
          createBackup: true,
        },
      });

      return {
        success: true,
        message: 'Organization training completed successfully',
        data: {
          trainingId: response.data.trainingId,
          patternsLearned: response.data.patternsLearned,
          modelVersion: response.data.modelVersion,
          accuracy: response.data.accuracy,
        },
      };
    } catch (error) {
      throw new Error(`Failed to train with organization data: ${error.message}`);
    }
  }

  /**
   * Update organization-specific patterns
   */
  async updateOrganizationPatterns(patterns) {
    try {
      const response = await this.client.put(
        `/organization/${this.config.organization?.id}/patterns`,
        {
          patterns: {
            namePatterns: patterns.namePatterns || [],
            emailDomains: patterns.emailDomains || [],
            departmentMappings: patterns.departmentMappings || {},
            deviceNamingConventions: patterns.deviceNamingConventions || [],
            customAttributes: patterns.customAttributes || {},
            validationRules: patterns.validationRules || {},
            transformationRules: patterns.transformationRules || {},
          },
          updateMode: 'merge', // 'replace' or 'merge'
        },
      );

      // Update local patterns cache
      this.organizationPatterns = {
        ...this.organizationPatterns,
        ...patterns,
      };

      return {
        success: true,
        message: 'Organization patterns updated successfully',
        data: response.data,
      };
    } catch (error) {
      throw new Error(`Failed to update organization patterns: ${error.message}`);
    }
  }

  /**
   * Validate data quality and provide feedback for training
   */
  async validateAndProvideFeedback(validationData) {
    try {
      const response = await this.client.post('/validation/feedback', {
        organizationId: this.config.organization?.id,
        validationResults: validationData.results || [],
        feedback: {
          correctMatches: validationData.correctMatches || [],
          incorrectMatches: validationData.incorrectMatches || [],
          missedMatches: validationData.missedMatches || [],
          transformationAccuracy: validationData.transformationAccuracy || {},
          userFeedback: validationData.userFeedback || [],
        },
        improvementSuggestions: validationData.improvementSuggestions || [],
      });

      return {
        success: true,
        message: 'Feedback provided successfully',
        data: {
          feedbackId: response.data.feedbackId,
          improvementsImplemented: response.data.improvementsImplemented,
          nextTrainingScheduled: response.data.nextTrainingScheduled,
        },
      };
    } catch (error) {
      throw new Error(`Failed to provide feedback: ${error.message}`);
    }
  }

  // ============================================================================
  // MONITORING AND QUALITY METRICS
  // ============================================================================

  /**
   * Get data quality metrics and confidence scores
   */
  async getQualityMetrics(timeRange = '24h') {
    try {
      const response = await this.client.get(
        `/metrics/quality?range=${timeRange}&org=${this.config.organization?.id}`,
      );

      return {
        success: true,
        data: {
          overallQuality: response.data.overallQuality,
          matchingAccuracy: response.data.matchingAccuracy,
          transformationSuccess: response.data.transformationSuccess,
          deduplicationEfficiency: response.data.deduplicationEfficiency,
          confidenceDistribution: response.data.confidenceDistribution,
          errorRates: response.data.errorRates,
          performanceMetrics: response.data.performanceMetrics,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get quality metrics: ${error.message}`);
    }
  }

  /**
   * Monitor real-time data quality
   */
  async startQualityMonitoring(callback) {
    try {
      // In mock mode, simulate real-time monitoring
      if (this.config?.mockMode) {
        console.log('Mock mode - simulating quality monitoring');

        // Simulate periodic quality updates
        const mockEventSource = {
          close: () => console.log('Mock quality monitoring stopped'),
        };

        const simulateUpdate = () => {
          const mockQualityData = {
            timestamp: new Date().toISOString(),
            overallQuality: 0.85 + Math.random() * 0.1,
            matchingAccuracy: 0.9 + Math.random() * 0.05,
            alerts: [],
          };
          callback(null, mockQualityData);
        };

        // Send initial update
        setTimeout(simulateUpdate, 100);

        return {
          success: true,
          message: 'Mock quality monitoring started',
          eventSource: mockEventSource,
        };
      }

      // Setup server-sent events for real-time monitoring
      const eventSource = new EventSource(
        `${this.config.endpoints.synthUrl}/stream/quality?org=${this.config.organization?.id}`,
        {
          headers: await this.setupAuthentication(this.config),
        },
      );

      eventSource.onmessage = (event) => {
        try {
          const qualityData = JSON.parse(event.data);
          callback(null, qualityData);
        } catch (parseError) {
          callback(parseError, null);
        }
      };

      eventSource.onerror = (error) => {
        callback(error, null);
      };

      return {
        success: true,
        message: 'Quality monitoring started',
        eventSource,
      };
    } catch (error) {
      throw new Error(`Failed to start quality monitoring: ${error.message}`);
    }
  }

  // ============================================================================
  // AUTHENTICATION AND API HELPERS
  // ============================================================================

  async getOAuth2Token(config) {
    try {
      const tokenResponse = await axios.post(config.authentication.tokenUrl, {
        grant_type: 'client_credentials',
        client_id: config.credentials.clientId,
        client_secret: config.credentials.clientSecret,
        scope: config.authentication.scope || 'data-intelligence',
      });

      this.accessToken = tokenResponse.data.access_token;
      this.tokenExpiry = new Date(Date.now() + tokenResponse.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      throw new Error(`OAuth2 authentication failed: ${error.message}`);
    }
  }

  async generateJWTToken(config) {
    try {
      // Generate JWT token with organization claims
      const payload = {
        iss: config.credentials.issuer,
        sub: config.credentials.subject,
        aud: 'nova-synth-api',
        org: config.organization?.id,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        iat: Math.floor(Date.now() / 1000),
      };

      // Simple JWT implementation (in production, use proper JWT library)
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
        'base64url',
      );
      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const signature = crypto
        .createHmac('sha256', config.credentials.jwtSecret)
        .update(`${header}.${payloadB64}`)
        .digest('base64url');

      return `${header}.${payloadB64}.${signature}`;
    } catch (error) {
      throw new Error(`JWT generation failed: ${error.message}`);
    }
  }

  async refreshAuthentication() {
    try {
      const newHeaders = await this.setupAuthentication(this.config);
      Object.assign(this.client.defaults.headers, newHeaders);
      console.log('Authentication refreshed successfully');
    } catch (error) {
      throw new Error(`Authentication refresh failed: ${error.message}`);
    }
  }

  logAPIRequest(config) {
    console.log(`[Nova Synth API] ${config.method?.toUpperCase()} ${config.url}`, {
      correlationId: config.headers['X-Correlation-ID'],
      organizationId: config.headers['X-Organization-ID'],
    });
  }

  logAPIResponse(response) {
    const duration = response.config.metadata?.startTime
      ? Date.now() - response.config.metadata.startTime
      : 0;

    console.log(`[Nova Synth API] Response ${response.status} in ${duration}ms`, {
      correlationId: response.config.headers['X-Correlation-ID'],
      dataSize: JSON.stringify(response.data).length,
    });
  }

  logAPIError(type, error) {
    console.error(`[Nova Synth API] ${type} error:`, {
      message: error.message,
      status: error.response?.status,
      correlationId: error.config?.headers?.['X-Correlation-ID'],
    });
  }

  updateQualityMetrics(response) {
    // Extract quality metrics from API responses
    if (response.data.qualityScore) {
      this.qualityMetrics = {
        ...this.qualityMetrics,
        lastQualityScore: response.data.qualityScore,
        lastUpdate: new Date(),
      };
    }
  }

  // ============================================================================
  // FEEDBACK LOOPS AND CONTINUOUS IMPROVEMENT
  // ============================================================================

  /**
   * Start automated feedback loop for continuous improvement
   */
  async startFeedbackLoop(options = {}) {
    try {
      const feedbackConfig = {
        frequency: options.frequency || 'daily', // hourly, daily, weekly
        autoRetraining: options.autoRetraining || true,
        qualityThreshold: options.qualityThreshold || 0.8,
        improvementMetrics: options.improvementMetrics || ['accuracy', 'speed', 'confidence'],
        alertThreshold: options.alertThreshold || 0.7,
      };

      // Setup automated quality monitoring
      const qualityMonitor = setInterval(async () => {
        try {
          const metrics = await this.getQualityMetrics('1h');
          await this.evaluateAndImprove(metrics.data, feedbackConfig);
        } catch (error) {
          console.error('Automated feedback loop error:', error);
        }
      }, this.getFrequencyInterval(feedbackConfig.frequency));

      // Setup automated retraining
      if (feedbackConfig.autoRetraining) {
        const retrainingSchedule = setInterval(async () => {
          try {
            await this.performAutomaticRetraining();
          } catch (error) {
            console.error('Automated retraining error:', error);
          }
        }, this.getRetrainingInterval(feedbackConfig.frequency));

        this.retrainingSchedule = retrainingSchedule;
      }

      this.feedbackLoop = qualityMonitor;
      this.feedbackConfig = feedbackConfig;

      return {
        success: true,
        message: 'Feedback loop started successfully',
        config: feedbackConfig,
      };
    } catch (error) {
      throw new Error(`Failed to start feedback loop: ${error.message}`);
    }
  }

  /**
   * Stop automated feedback loop
   */
  stopFeedbackLoop() {
    if (this.feedbackLoop) {
      clearInterval(this.feedbackLoop);
      this.feedbackLoop = null;
    }
    if (this.retrainingSchedule) {
      clearInterval(this.retrainingSchedule);
      this.retrainingSchedule = null;
    }
    return { success: true, message: 'Feedback loop stopped' };
  }

  /**
   * Evaluate metrics and trigger improvements
   */
  async evaluateAndImprove(metrics, config) {
    try {
      const improvements = [];

      // Check overall quality
      if (metrics.overallQuality < config.qualityThreshold) {
        improvements.push({
          type: 'quality_improvement',
          priority: 'high',
          action: 'retrain_model',
          reason: `Quality score ${metrics.overallQuality} below threshold ${config.qualityThreshold}`,
        });
      }

      // Check matching accuracy
      if (metrics.matchingAccuracy < config.qualityThreshold) {
        improvements.push({
          type: 'matching_improvement',
          priority: 'medium',
          action: 'update_matching_rules',
          reason: `Matching accuracy ${metrics.matchingAccuracy} needs improvement`,
        });
      }

      // Check error rates
      if (metrics.errorRates?.total > 1 - config.alertThreshold) {
        improvements.push({
          type: 'error_reduction',
          priority: 'high',
          action: 'investigate_errors',
          reason: `Error rate ${metrics.errorRates.total} exceeds alert threshold`,
        });
      }

      // Implement improvements
      for (const improvement of improvements) {
        await this.implementImprovement(improvement);
      }

      return {
        success: true,
        improvements: improvements.length,
        actions: improvements.map((i) => i.action),
      };
    } catch (error) {
      throw new Error(`Failed to evaluate and improve: ${error.message}`);
    }
  }

  /**
   * Implement specific improvement action
   */
  async implementImprovement(improvement) {
    try {
      switch (improvement.action) {
        case 'retrain_model':
          await this.triggerRetraining(improvement);
          break;
        case 'update_matching_rules':
          await this.updateMatchingRules(improvement);
          break;
        case 'investigate_errors':
          await this.investigateErrors(improvement);
          break;
        default:
          console.warn(`Unknown improvement action: ${improvement.action}`);
      }

      // Log improvement action
      console.log(`[Nova Synth] Implemented improvement: ${improvement.action}`, {
        priority: improvement.priority,
        reason: improvement.reason,
      });
    } catch (error) {
      throw new Error(`Failed to implement improvement: ${error.message}`);
    }
  }

  /**
   * Trigger automated retraining
   */
  async triggerRetraining(improvement) {
    try {
      const response = await this.client.post('/training/automatic', {
        organizationId: this.config.organization?.id,
        trigger: improvement.reason,
        priority: improvement.priority,
        retrainingType: 'incremental',
      });

      return {
        success: true,
        retrainingId: response.data.retrainingId,
        estimatedDuration: response.data.estimatedDuration,
      };
    } catch (error) {
      throw new Error(`Failed to trigger retraining: ${error.message}`);
    }
  }

  /**
   * Update matching rules based on performance
   */
  async updateMatchingRules(improvement) {
    try {
      // Analyze recent matching failures and update rules
      const failureAnalysis = await this.client.get('/analysis/matching-failures?days=7');

      const updatedRules = this.generateImprovedMatchingRules(failureAnalysis.data);

      await this.client.put('/rules/matching', {
        organizationId: this.config.organization?.id,
        rules: updatedRules,
        reason: improvement.reason,
      });

      return { success: true, rulesUpdated: Object.keys(updatedRules).length };
    } catch (error) {
      throw new Error(`Failed to update matching rules: ${error.message}`);
    }
  }

  /**
   * Investigate and categorize errors for improvement
   */
  async investigateErrors(improvement) {
    try {
      const errorAnalysis = await this.client.get('/analysis/errors?days=1');

      const categorizedErrors = this.categorizeErrors(errorAnalysis.data);

      // Submit error analysis for automated improvement
      await this.client.post('/improvement/error-analysis', {
        organizationId: this.config.organization?.id,
        errorCategories: categorizedErrors,
        priority: improvement.priority,
      });

      return { success: true, errorsAnalyzed: errorAnalysis.data.length };
    } catch (error) {
      throw new Error(`Failed to investigate errors: ${error.message}`);
    }
  }

  // ============================================================================
  // HELPER METHODS FOR FEEDBACK LOOPS
  // ============================================================================

  getFrequencyInterval(frequency) {
    const intervals = {
      hourly: 60 * 60 * 1000, // 1 hour
      daily: 24 * 60 * 60 * 1000, // 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    return intervals[frequency] || intervals.daily;
  }

  getRetrainingInterval(frequency) {
    const intervals = {
      hourly: 6 * 60 * 60 * 1000, // 6 hours
      daily: 3 * 24 * 60 * 60 * 1000, // 3 days
      weekly: 2 * 7 * 24 * 60 * 60 * 1000, // 2 weeks
    };
    return intervals[frequency] || intervals.daily;
  }

  generateImprovedMatchingRules(failureData) {
    // Analyze failure patterns and generate improved rules
    const rules = {};

    // Group failures by type
    const failuresByType = failureData.reduce((acc, failure) => {
      acc[failure.type] = acc[failure.type] || [];
      acc[failure.type].push(failure);
      return acc;
    }, {});

    // Generate improved rules for each failure type
    Object.entries(failuresByType).forEach(([type, failures]) => {
      rules[type] = this.generateRuleForFailureType(type, failures);
    });

    return rules;
  }

  generateRuleForFailureType(type, failures) {
    // Basic rule generation logic (can be enhanced)
    return {
      confidence_threshold: Math.max(0.5, 1.0 - failures.length / 100),
      similarity_weight: type === 'name_matching' ? 0.8 : 0.6,
      exact_match_priority: true,
      fuzzy_matching_enabled: failures.length > 10,
    };
  }

  categorizeErrors(errorData) {
    const categories = {
      authentication: [],
      data_validation: [],
      matching: [],
      transformation: [],
      network: [],
      unknown: [],
    };

    errorData.forEach((error) => {
      if (error.message.includes('auth') || error.status === 401) {
        categories.authentication.push(error);
      } else if (error.message.includes('validation') || error.status === 400) {
        categories.data_validation.push(error);
      } else if (error.message.includes('match')) {
        categories.matching.push(error);
      } else if (error.message.includes('transform')) {
        categories.transformation.push(error);
      } else if (error.status >= 500 || error.message.includes('network')) {
        categories.network.push(error);
      } else {
        categories.unknown.push(error);
      }
    });

    return categories;
  }

  async performAutomaticRetraining() {
    try {
      // Get recent feedback data
      const feedbackData = await this.client.get('/feedback/recent?days=7');

      if (feedbackData.data.length < 10) {
        console.log('Insufficient feedback data for retraining');
        return;
      }

      // Trigger retraining with accumulated feedback
      await this.trainWithOrganizationData({
        userProfiles: feedbackData.data.filter((f) => f.type === 'user_profile'),
        devicePatterns: feedbackData.data.filter((f) => f.type === 'device_pattern'),
        customMappings: feedbackData.data.filter((f) => f.type === 'custom_mapping'),
      });

      console.log('Automatic retraining completed successfully');
    } catch (error) {
      console.error('Automatic retraining failed:', error);
    }
  }
}
