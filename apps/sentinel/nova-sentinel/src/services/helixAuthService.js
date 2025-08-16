// Nova Sentinel - Helix Authentication Service
// Complete integration with Nova Helix for authentication and user preferences

import fetch from 'node-fetch';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

export class HelixAuthService {
  constructor(config) {
    this.config = config;
    this.baseUrl = config.url;
    this.apiKey = config.apiKey;
  }

  async initialize() {
    try {
      // Test connection to Helix
      const health = await this.healthCheck(); // TODO-LINT: move to async function
      if (!health) {
        throw new Error('Unable to connect to Nova Helix');
      }
      
      logger.info('Helix authentication service initialized');
    } catch (error) {
      logger.error('Failed to initialize Helix auth service:', error);
      throw error;
    }
  }

  // ========================================================================
  // AUTHENTICATION METHODS
  // ========================================================================

  async validateToken(token) {
    try {
      const response = await fetch(`${this.baseUrl}/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ token }),
        timeout: 5000
      }); // TODO-LINT: move to async function

      if (!response.ok) {
        logger.debug(`Token validation failed: ${response.status}`);
        return null;
      }

      const data = await response.json(); // TODO-LINT: move to async function
      
      if (data.success && data.user) {
        return {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          tenantId: data.user.tenant_id || data.user.tenantId,
          roles: data.user.roles || [],
          permissions: data.user.permissions || []
        };
      }

      return null;
    } catch (error) {
      logger.error('Token validation error:', error);
      return null;
    }
  }

  async getUserById(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      }); // TODO-LINT: move to async function

      if (!response.ok) {
        return null;
      }

      const data = await response.json(); // TODO-LINT: move to async function
      return data.user;
    } catch (error) {
      logger.error('Get user error:', error);
      return null;
    }
  }

  // ========================================================================
  // USER PREFERENCES (Sentinel-specific settings stored in Helix)
  // ========================================================================

  async getUserPreference(userId, key, defaultValue = null) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/preferences`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      }); // TODO-LINT: move to async function

      if (!response.ok) {
        return defaultValue;
      }

      const data = await response.json(); // TODO-LINT: move to async function
      const preferences = data.preferences || {};
      
      return preferences[key] !== undefined ? preferences[key] : defaultValue;
    } catch (error) {
      logger.debug('Get user preference error:', error);
      return defaultValue;
    }
  }

  async setUserPreference(userId, key, value) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          [key]: value
        }),
        timeout: 5000
      }); // TODO-LINT: move to async function

      if (!response.ok) {
        logger.warn(`Failed to set user preference: ${response.status}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Set user preference error:', error);
      return false;
    }
  }

  async deleteUserPreference(userId, key) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/preferences/${key}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      }); // TODO-LINT: move to async function

      return response.ok;
    } catch (error) {
      logger.error('Delete user preference error:', error);
      return false;
    }
  }

  async getAllUserPreferences(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/preferences`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      }); // TODO-LINT: move to async function

      if (!response.ok) {
        return {};
      }

      const data = await response.json(); // TODO-LINT: move to async function
      return data.preferences || {};
    } catch (error) {
      logger.error('Get all user preferences error:', error);
      return {};
    }
  }

  // ========================================================================
  // SENTINEL-SPECIFIC PREFERENCE HELPERS
  // ========================================================================

  async getMonitorPreferences(userId, monitorId) {
    const key = `sentinel.monitor.${monitorId}`;
    return await this.getUserPreference(userId, key, {
      favorite: false,
      customName: null,
      lastViewed: null,
      alertPreferences: {
        email: true,
        push: true,
        sms: false
      }
    }); // TODO-LINT: move to async function
  }

  async setMonitorPreferences(userId, monitorId, preferences) {
    const key = `sentinel.monitor.${monitorId}`;
    const existing = await this.getMonitorPreferences(userId, monitorId); // TODO-LINT: move to async function
    const merged = { ...existing, ...preferences, updatedAt: new Date().toISOString() };
    
    return await this.setUserPreference(userId, key, merged); // TODO-LINT: move to async function
  }

  async getStatusPagePreferences(userId, statusPageId) {
    const key = `sentinel.status-page.${statusPageId}`;
    return await this.getUserPreference(userId, key, {
      favorite: false,
      lastViewed: null,
      subscribed: false,
      notificationTypes: ['incidents', 'maintenance']
    }); // TODO-LINT: move to async function
  }

  async setStatusPagePreferences(userId, statusPageId, preferences) {
    const key = `sentinel.status-page.${statusPageId}`;
    const existing = await this.getStatusPagePreferences(userId, statusPageId); // TODO-LINT: move to async function
    const merged = { ...existing, ...preferences, updatedAt: new Date().toISOString() };
    
    return await this.setUserPreference(userId, key, merged); // TODO-LINT: move to async function
  }

  async getDashboardPreferences(userId) {
    const key = 'sentinel.dashboard';
    return await this.getUserPreference(userId, key, {
      layout: 'grid',
      refreshInterval: 30,
      showMonitorTypes: ['http', 'port', 'ping'],
      favoriteMonitors: [],
      favoriteStatusPages: [],
      hiddenMonitors: [],
      compactView: false,
      sortBy: 'name',
      sortOrder: 'asc',
      filters: {
        status: 'all',
        type: 'all',
        tags: []
      }
    }); // TODO-LINT: move to async function
  }

  async setDashboardPreferences(userId, preferences) {
    const key = 'sentinel.dashboard';
    const existing = await this.getDashboardPreferences(userId); // TODO-LINT: move to async function
    const merged = { ...existing, ...preferences, updatedAt: new Date().toISOString() };
    
    return await this.setUserPreference(userId, key, merged); // TODO-LINT: move to async function
  }

  async getNotificationPreferences(userId) {
    const key = 'sentinel.notifications';
    return await this.getUserPreference(userId, key, {
      email: {
        enabled: true,
        incidents: true,
        maintenance: true,
        monitorDown: true,
        monitorUp: false,
        sslExpiry: true
      },
      push: {
        enabled: true,
        incidents: true,
        maintenance: false,
        monitorDown: true,
        monitorUp: false,
        sslExpiry: true
      },
      sms: {
        enabled: false,
        incidents: false,
        maintenance: false,
        monitorDown: false,
        monitorUp: false,
        sslExpiry: false
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
        timezone: 'UTC'
      }
    }); // TODO-LINT: move to async function
  }

  async setNotificationPreferences(userId, preferences) {
    const key = 'sentinel.notifications';
    const existing = await this.getNotificationPreferences(userId); // TODO-LINT: move to async function
    const merged = { ...existing, ...preferences, updatedAt: new Date().toISOString() };
    
    return await this.setUserPreference(userId, key, merged); // TODO-LINT: move to async function
  }

  // ========================================================================
  // RBAC HELPERS
  // ========================================================================

  async hasPermission(userId, permission) {
    try {
      const user = await this.getUserById(userId); // TODO-LINT: move to async function
      if (!user) return false;

      const permissions = user.permissions || [];
      const roles = user.roles || [];

      // Check direct permission
      if (permissions.includes(permission)) return true;

      // Check role-based permissions
      const rolePermissions = {
        'admin': ['*'],
        'sentinel:admin': [
          'sentinel:*',
          'sentinel:monitors:*',
          'sentinel:status-pages:*',
          'sentinel:notifications:*',
          'sentinel:maintenance:*'
        ],
        'sentinel:manager': [
          'sentinel:monitors:read',
          'sentinel:monitors:create',
          'sentinel:monitors:update',
          'sentinel:status-pages:read',
          'sentinel:status-pages:create',
          'sentinel:notifications:read'
        ],
        'sentinel:operator': [
          'sentinel:monitors:read',
          'sentinel:status-pages:read',
          'sentinel:maintenance:read'
        ],
        'sentinel:viewer': [
          'sentinel:monitors:read',
          'sentinel:status-pages:read'
        ]
      };

      for (const role of roles) {
        const rolePerms = rolePermissions[role] || [];
        
        // Wildcard permission
        if (rolePerms.includes('*')) return true;
        
        // Direct permission match
        if (rolePerms.includes(permission)) return true;
        
        // Wildcard pattern match
        for (const perm of rolePerms) {
          if (perm.endsWith('*')) {
            const pattern = perm.slice(0, -1);
            if (permission.startsWith(pattern)) return true;
          }
        }
      }

      return false;
    } catch (error) {
      logger.error('Permission check error:', error);
      return false;
    }
  }

  async getTenantUsers(tenantId) {
    try {
      const response = await fetch(`${this.baseUrl}/tenants/${tenantId}/users`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      }); // TODO-LINT: move to async function

      if (!response.ok) {
        return [];
      }

      const data = await response.json(); // TODO-LINT: move to async function
      return data.users || [];
    } catch (error) {
      logger.error('Get tenant users error:', error);
      return [];
    }
  }

  // ========================================================================
  // AUDIT LOGGING
  // ========================================================================

  async logAction(userId, action, resource, metadata = {}) {
    try {
      await fetch(`${this.baseUrl}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          userId,
          action,
          resource,
          service: 'nova-sentinel',
          metadata,
          timestamp: new Date().toISOString()
        }),
        timeout: 5000
      }); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Audit log error:', error);
      // Don't throw - audit failures shouldn't break _functionality
    }
  }

  // ========================================================================
  // _UTILITY METHODS
  // ========================================================================

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        timeout: 3000
      }); // TODO-LINT: move to async function
      
      return response.ok;
    } catch (error) {
      logger.debug('Helix health check failed:', error.message);
      return false;
    }
  }

  async getSystemInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/system/info`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 5000
      }); // TODO-LINT: move to async function

      if (!response.ok) {
        return null;
      }

      return await response.json(); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Get system info error:', error);
      return null;
    }
  }

  async close() {
    // No persistent connections to close
    logger.info('Helix auth service closed');
  }
}

export default HelixAuthService;
