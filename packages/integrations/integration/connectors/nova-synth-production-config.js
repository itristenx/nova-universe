/**
 * Nova Synth Production Configuration
 * Complete production-ready configuration for Nova Synth data intelligence integration
 */

class NovaSynthProductionConfig {
  constructor() {
    this.defaultConfig = this.buildDefaultConfig();
    this.environmentConfig = this.buildEnvironmentConfig();
  }

  /**
   * Build default production configuration
   */
  buildDefaultConfig() {
    return {
      // API Configuration
      endpoints: {
        synthUrl: process.env.NOVA_SYNTH_API_URL || 'https://api.novasynth.ai',
        fallbackUrl: process.env.NOVA_SYNTH_FALLBACK_URL || 'https://fallback.novasynth.ai',
        healthCheckUrl: '/health',
        metricsUrl: '/metrics',
      },

      // Authentication Configuration
      authentication: {
        strategy: process.env.NOVA_SYNTH_AUTH_STRATEGY || 'oauth2', // bearer, oauth2, jwt, api_key
        tokenUrl: process.env.NOVA_SYNTH_TOKEN_URL,
        refreshUrl: process.env.NOVA_SYNTH_REFRESH_URL,
        scope: 'data-intelligence read write',
        tokenRefreshThreshold: 300, // seconds before expiry
      },

      // Organization Configuration
      organization: {
        id: process.env.NOVA_ORGANIZATION_ID,
        name: process.env.NOVA_ORGANIZATION_NAME,
        tier: process.env.NOVA_ORGANIZATION_TIER || 'enterprise',
        dataRetentionDays: parseInt(process.env.NOVA_DATA_RETENTION_DAYS) || 365,
      },

      // Quality and Performance Configuration
      quality: {
        minConfidenceThreshold: 0.75,
        qualityMonitoringEnabled: true,
        realTimeQualityChecks: true,
        qualityMetricsRetention: 90, // days
      },

      // Training Configuration
      training: {
        autoRetrainingEnabled: true,
        retrainingFrequency: 'weekly', // daily, weekly, monthly
        minimumFeedbackThreshold: 50,
        trainingDataRetention: 180, // days
        incrementalTrainingEnabled: true,
      },

      // Monitoring Configuration
      monitoring: {
        healthCheckInterval: 30000, // 30 seconds
        metricsCollectionInterval: 60000, // 1 minute
        alertingEnabled: true,
        performanceThresholds: {
          responseTime: 2000, // milliseconds
          errorRate: 0.05, // 5%
          availability: 0.999, // 99.9%
        },
      },

      // Rate Limiting
      rateLimiting: {
        requestsPerMinute: 1000,
        burstLimit: 100,
        backoffStrategy: 'exponential',
      },

      // Fallback Configuration
      fallback: {
        enabled: true,
        maxRetries: 3,
        retryDelay: 1000, // milliseconds
        circuitBreakerThreshold: 10,
        circuitBreakerTimeout: 30000, // 30 seconds
      },

      // Security Configuration
      security: {
        encryptionEnabled: true,
        dataRedactionEnabled: true,
        auditLoggingEnabled: true,
        sensitiveFields: ['ssn', 'credit_card', 'password'],
        ipWhitelisting: process.env.NOVA_IP_WHITELIST?.split(',') || [],
      },
    };
  }

  /**
   * Build environment-specific configuration
   */
  buildEnvironmentConfig() {
    const env = process.env.NODE_ENV || 'development';

    const environments = {
      development: {
        debug: true,
        logLevel: 'debug',
        mockMode: true,
        rateLimiting: { requestsPerMinute: 100 },
        monitoring: { healthCheckInterval: 60000 },
      },

      staging: {
        debug: true,
        logLevel: 'info',
        mockMode: false,
        rateLimiting: { requestsPerMinute: 500 },
        monitoring: { healthCheckInterval: 45000 },
      },

      production: {
        debug: false,
        logLevel: 'warn',
        mockMode: false,
        rateLimiting: { requestsPerMinute: 1000 },
        monitoring: { healthCheckInterval: 30000 },
      },
    };

    return environments[env] || environments.development;
  }

  /**
   * Get complete configuration for environment
   */
  getConfig(environment = null) {
    const env = environment || process.env.NODE_ENV || 'development';
    const envConfig = this.buildEnvironmentConfig()[env] || this.environmentConfig.development;

    return this.mergeDeep(this.defaultConfig, envConfig);
  }

  /**
   * Get authentication configuration
   */
  getAuthConfig(strategy = null) {
    const authStrategy = strategy || process.env.NOVA_SYNTH_AUTH_STRATEGY || 'oauth2';

    const authConfigs = {
      bearer: {
        type: 'bearer',
        credentials: {
          token: process.env.NOVA_SYNTH_BEARER_TOKEN,
        },
      },

      oauth2: {
        type: 'oauth2',
        credentials: {
          clientId: process.env.NOVA_SYNTH_CLIENT_ID,
          clientSecret: process.env.NOVA_SYNTH_CLIENT_SECRET,
          issuer: process.env.NOVA_SYNTH_ISSUER,
        },
        authentication: {
          tokenUrl: process.env.NOVA_SYNTH_TOKEN_URL,
          refreshUrl: process.env.NOVA_SYNTH_REFRESH_URL,
          scope: 'data-intelligence read write',
        },
      },

      jwt: {
        type: 'jwt',
        credentials: {
          issuer: process.env.NOVA_SYNTH_JWT_ISSUER,
          subject: process.env.NOVA_SYNTH_JWT_SUBJECT,
          jwtSecret: process.env.NOVA_SYNTH_JWT_SECRET,
        },
      },

      api_key: {
        type: 'api_key',
        credentials: {
          apiKey: process.env.NOVA_SYNTH_API_KEY,
          apiKeyHeader: process.env.NOVA_SYNTH_API_KEY_HEADER || 'X-API-Key',
        },
      },
    };

    return authConfigs[authStrategy] || authConfigs.oauth2;
  }

  /**
   * Get organization-specific patterns
   */
  getOrganizationPatterns() {
    return {
      namePatterns: [
        /^[A-Z][a-z]+ [A-Z][a-z]+$/, // First Last
        /^[A-Z]\. [A-Z][a-z]+$/, // F. Last
        /^[A-Z][a-z]+, [A-Z][a-z]+$/, // Last, First
      ],

      emailDomains: process.env.NOVA_ORG_EMAIL_DOMAINS?.split(',') || [
        'company.com',
        'organization.org',
      ],

      departmentMappings: {
        IT: ['Information Technology', 'Tech', 'Technology'],
        HR: ['Human Resources', 'People', 'Personnel'],
        Finance: ['Accounting', 'Financial', 'Treasury'],
        Sales: ['Business Development', 'Revenue', 'Commercial'],
        Marketing: ['Brand', 'Communications', 'Digital'],
      },

      deviceNamingConventions: [
        /^[A-Z]{2,3}-\d{3,4}$/, // IT-001, CORP-1234
        /^[a-z]+-[a-z]+-\d+$/, // laptop-user-001
        /^\w+\.\w+\.\w+$/, // device.department.number
      ],

      customAttributes: {
        employeeIdPattern: /^EMP\d{6}$/,
        locationPattern: /^[A-Z]{2}-[A-Z]{3}-\d{2}$/, // US-NYC-01
        costCenterPattern: /^\d{4}-\d{3}$/, // 1234-001
      },
    };
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    const errors = [];

    // Required fields validation
    if (!config.organization?.id) {
      errors.push('Organization ID is required');
    }

    if (!config.endpoints?.synthUrl) {
      errors.push('Nova Synth API URL is required');
    }

    // Authentication validation
    const authConfig = this.getAuthConfig(config.authentication?.strategy);
    if (!authConfig.credentials) {
      errors.push('Authentication credentials are required');
    }

    // Environment-specific validation
    if (process.env.NODE_ENV === 'production') {
      if (!config.security?.encryptionEnabled) {
        errors.push('Encryption must be enabled in production');
      }
      if (!config.monitoring?.alertingEnabled) {
        errors.push('Alerting must be enabled in production');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Deep merge objects
   */
  mergeDeep(target, source) {
    const output = Object.assign({}, target);

    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.mergeDeep(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }

    return output;
  }

  /**
   * Check if value is an object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

export { NovaSynthProductionConfig };
