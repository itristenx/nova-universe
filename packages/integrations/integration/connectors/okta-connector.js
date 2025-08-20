/**
 * Okta Identity Provider Connector
 * Implements SCIM 2.0 and Okta API standards
 *
 * @author Nova Team
 * @version 1.0.0
 */

import { IConnector, ConnectorType, HealthStatus } from '../nova-integration-layer.js';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Okta Connector implementing SCIM 2.0 and Okta APIs
 * Follows enterprise integration patterns for identity management
 */
export class OktaConnector extends IConnector {
  constructor() {
    super('okta-connector', 'Okta Identity Provider', '1.0.0', ConnectorType.IDENTITY_PROVIDER);
    this.client = null;
    this.config = null;
    this.scimClient = null;
  }

  /**
   * Initialize Okta connector with enterprise configuration
   */
  async initialize(config) {
    try {
      this.config = config;

      // Validate Okta-specific configuration
      this.validateOktaConfig(config);

      // Initialize Okta Management API client
      this.client = axios.create({
        baseURL: config.endpoints.oktaUrl,
        headers: {
          Authorization: `SSWS ${config.credentials.apiToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: config.timeout || 30000,
      });

      // Initialize SCIM client if SCIM endpoint is provided
      if (config.endpoints.scimUrl) {
        this.scimClient = axios.create({
          baseURL: config.endpoints.scimUrl,
          headers: {
            Authorization: `Bearer ${config.credentials.scimToken}`,
            Accept: 'application/scim+json',
            'Content-Type': 'application/scim+json',
          },
          timeout: config.timeout || 30000,
        });
      }

      // Test the connection
      await this.testConnection();

      console.log('Okta connector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Okta connector:', error);
      throw error;
    }
  }

  /**
   * Health check with comprehensive Okta API testing
   */
  async health() {
    try {
      const startTime = Date.now();

      // Test Okta Management API
      const orgResponse = await this.client.get('/api/v1/org');
      const apiLatency = Date.now() - startTime;

      // Test SCIM endpoint if available
      let scimStatus = 'not_configured';
      let scimLatency = 0;

      if (this.scimClient) {
        try {
          const scimStartTime = Date.now();
          await this.scimClient.get('/Users?count=1');
          scimLatency = Date.now() - scimStartTime;
          scimStatus = 'healthy';
        } catch (error) {
          scimStatus = 'unhealthy';
        }
      }

      const overallStatus =
        orgResponse.status === 200 && (scimStatus === 'healthy' || scimStatus === 'not_configured')
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
            name: 'scim_latency',
            value: scimLatency,
            unit: 'ms',
          },
          {
            name: 'org_status',
            value: orgResponse.status,
            unit: 'http_status',
          },
        ],
        issues: overallStatus !== HealthStatus.HEALTHY ? ['SCIM endpoint issues detected'] : [],
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
   * Sync users from Okta using pagination and filtering
   */
  async sync(options = {}) {
    try {
      const syncType = options.type || 'full';
      const batchSize = options.batchSize || 200;
      let after = null;
      let totalUsers = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      console.log(`Starting ${syncType} sync from Okta...`);

      do {
        try {
          // Build query parameters
          const params = {
            limit: batchSize,
          };

          if (after) {
            params.after = after;
          }

          // Add filters for incremental sync
          if (syncType === 'incremental' && options.lastSyncTime) {
            params.filter = `lastUpdated gt "${options.lastSyncTime.toISOString()}"`;
          }

          // Fetch users from Okta
          const response = await this.client.get('/api/v1/users', { params });
          const users = response.data;

          // Process users
          for (const user of users) {
            try {
              await this.processUser(user);
              successCount++;
            } catch (error) {
              errorCount++;
              errors.push({
                userId: user.id,
                message: error.message,
              });
            }
          }

          totalUsers += users.length;

          // Check for next page
          const linkHeader = response.headers.link;
          after = this.extractNextCursor(linkHeader);
        } catch (batchError) {
          errorCount++;
          errors.push({
            message: `Batch error: ${batchError.message}`,
          });
          break;
        }
      } while (after && totalUsers < (options.maxUsers || 10000));

      const status = errorCount === 0 ? 'success' : successCount > 0 ? 'partial' : 'failed';

      return {
        jobId: crypto.randomUUID(),
        status,
        metrics: {
          totalRecords: totalUsers,
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
   * Poll for real-time events from Okta System Log
   */
  async poll() {
    try {
      const since = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes
      const params = {
        since: since.toISOString(),
        filter:
          'eventType eq "user.lifecycle.create" or eventType eq "user.lifecycle.update" or eventType eq "user.lifecycle.delete"',
        limit: 100,
      };

      const response = await this.client.get('/api/v1/logs', { params });

      return response.data.map((event) => ({
        id: event.uuid,
        type: event.eventType,
        timestamp: new Date(event.published),
        data: {
          userId: event.actor?.id,
          userEmail: event.actor?.alternateId,
          action: event.eventType,
          details: event.debugContext,
        },
        source: 'okta',
      }));
    } catch (error) {
      console.error('Failed to poll Okta events:', error);
      return [];
    }
  }

  /**
   * Execute actions on Okta (reset MFA, suspend user, etc.)
   */
  async push(action) {
    try {
      const { action: actionType, target, parameters } = action;

      switch (actionType) {
        case 'reset_mfa':
          return await this.resetUserMFA(target);

        case 'suspend_user':
          return await this.suspendUser(target);

        case 'activate_user':
          return await this.activateUser(target);

        case 'reset_password':
          return await this.resetPassword(target, parameters);

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
   * Validate Okta-specific configuration
   */
  validateConfig(config) {
    const errors = [];

    if (!config.credentials?.apiToken) {
      errors.push('Missing Okta API token');
    }

    if (!config.endpoints?.oktaUrl) {
      errors.push('Missing Okta URL');
    }

    if (config.endpoints?.scimUrl && !config.credentials?.scimToken) {
      errors.push('SCIM URL provided but SCIM token missing');
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
      supportsScim: !!this.config?.endpoints?.scimUrl,
      rateLimit: 600, // Okta rate limit per minute
      dataTypes: ['users', 'groups', 'applications', 'events'],
      actions: ['reset_mfa', 'suspend_user', 'activate_user', 'reset_password'],
    };
  }

  /**
   * Get data schema for Okta integration
   */
  getSchema() {
    return {
      input: {
        user: {
          id: 'string',
          login: 'string',
          email: 'string',
          firstName: 'string',
          lastName: 'string',
          status: 'string',
        },
      },
      output: {
        nova_user: {
          userId: 'string',
          email: 'string',
          identity: 'object',
          status: 'string',
          lastSync: 'date',
        },
      },
    };
  }

  async shutdown() {
    // Cleanup resources
    this.client = null;
    this.scimClient = null;
    this.config = null;
    console.log('Okta connector shut down');
  }

  // Private helper methods

  validateOktaConfig(config) {
    if (!config.endpoints?.oktaUrl?.includes('okta.com')) {
      throw new Error('Invalid Okta URL format');
    }

    if (!config.credentials?.apiToken?.startsWith('00')) {
      throw new Error('Invalid Okta API token format');
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/api/v1/org');
      if (response.status !== 200) {
        throw new Error('Failed to connect to Okta API');
      }
    } catch (error) {
      throw new Error(`Okta connection test failed: ${error.message}`);
    }
  }

  async processUser(oktaUser) {
    // Transform Okta user to Nova format
    const novaUser = {
      userId: oktaUser.id,
      email: oktaUser.profile.email,
      firstName: oktaUser.profile.firstName,
      lastName: oktaUser.profile.lastName,
      status: oktaUser.status,
      oktaId: oktaUser.id,
      lastUpdated: new Date(oktaUser.lastUpdated),
      source: 'okta',
    };

    // Here you would save to Nova database or send to message queue
    console.log(`Processed user: ${novaUser.email}`);

    return novaUser;
  }

  extractNextCursor(linkHeader) {
    if (!linkHeader) return null;

    const nextMatch = linkHeader.match(/<[^>]*[?&]after=([^&>]+)[^>]*>;\s*rel="next"/);
    return nextMatch ? nextMatch[1] : null;
  }

  async resetUserMFA(userId) {
    try {
      await this.client.post(`/api/v1/users/${userId}/lifecycle/reset_factors`);
      return {
        success: true,
        message: 'MFA reset successfully',
        data: { userId, action: 'mfa_reset' },
      };
    } catch (error) {
      throw new Error(`Failed to reset MFA: ${error.message}`);
    }
  }

  async suspendUser(userId) {
    try {
      await this.client.post(`/api/v1/users/${userId}/lifecycle/suspend`);
      return {
        success: true,
        message: 'User suspended successfully',
        data: { userId, action: 'suspend' },
      };
    } catch (error) {
      throw new Error(`Failed to suspend user: ${error.message}`);
    }
  }

  async activateUser(userId) {
    try {
      await this.client.post(`/api/v1/users/${userId}/lifecycle/activate`);
      return {
        success: true,
        message: 'User activated successfully',
        data: { userId, action: 'activate' },
      };
    } catch (error) {
      throw new Error(`Failed to activate user: ${error.message}`);
    }
  }

  async resetPassword(userId, parameters) {
    try {
      const response = await this.client.post(`/api/v1/users/${userId}/lifecycle/reset_password`, {
        sendEmail: parameters?.sendEmail !== false,
      });

      return {
        success: true,
        message: 'Password reset initiated',
        data: {
          userId,
          action: 'password_reset',
          resetUrl: response.data?.resetPasswordUrl,
        },
      };
    } catch (error) {
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  }
}
