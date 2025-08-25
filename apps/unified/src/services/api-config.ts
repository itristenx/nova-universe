/**
 * API Versioning Configuration
 *
 * This file defines the API version strategy for Nova Universe frontend services.
 * It ensures consistent API endpoint usage across all UI components.
 */

export interface ApiVersionConfig {
  version: 'v1' | 'v2';
  baseUrl: string;
  deprecated?: boolean;
  deprecationDate?: string;
  migrationGuide?: string;
  description: string;
}

export interface ApiEndpointConfig {
  [service: string]: ApiVersionConfig;
}

/**
 * API Versioning Strategy:
 *
 * - v2: Current stable version (recommended for all new features)
 * - v1: Legacy version (deprecated, maintained for backward compatibility)
 *
 * Migration Timeline:
 * - All new features should use v2 endpoints
 * - Existing v1 usage should be migrated to v2 before sunset date
 * - v1 endpoints include deprecation warnings in response headers
 */
export const API_VERSION_CONFIG: ApiEndpointConfig = {
  // === v2 Endpoints (Current/Recommended) ===
  user360: {
    version: 'v2',
    baseUrl: '/api/v2/user360',
    description: 'User 360-degree view API with advanced analytics and insights',
  },

  synth: {
    version: 'v2',
    baseUrl: '/api/v2/synth',
    description: 'Nova Synth AI Engine v2 - Enhanced AI capabilities and chat',
  },

  alerts: {
    version: 'v2',
    baseUrl: '/api/v2/alerts',
    description: 'Unified Alerts system (Nova Alert) - Advanced alerting and escalation',
  },

  notifications: {
    version: 'v2',
    baseUrl: '/api/v2/notifications',
    description: 'Universal Notification Platform - Multi-channel messaging',
  },

  beacon: {
    version: 'v2',
    baseUrl: '/api/v2/beacon',
    description: 'Nova Beacon Kiosk Management v2 - Enhanced kiosk features',
  },

  goalert: {
    version: 'v2',
    baseUrl: '/api/v2/goalert',
    description: 'GoAlert Proxy for incident alerting and escalation',
  },

  monitoring: {
    version: 'v2',
    baseUrl: '/api/v2/monitoring',
    description: 'Nova Sentinel Monitoring v2 - Enhanced system monitoring',
  },

  sentinel: {
    version: 'v2',
    baseUrl: '/api/v2/sentinel',
    description: 'Nova Sentinel alias for monitoring services',
  },

  mcp: {
    version: 'v2',
    baseUrl: '/api/v2/mcp',
    description: 'Model Context Protocol (MCP) Server Control Tower',
  },

  // === v1 Endpoints (Deprecated but Maintained) ===
  auth: {
    version: 'v1',
    baseUrl: '/api/v1/auth',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/auth-v2',
    description: 'Authentication service (migrate to v2 for enhanced security features)',
  },

  tickets: {
    version: 'v1',
    baseUrl: '/api/v1/tickets',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/tickets-v2',
    description: 'Ticket management (legacy - consider v2 pulse module)',
  },

  pulse: {
    version: 'v1',
    baseUrl: '/api/v1/pulse',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/pulse-v2',
    description: 'Nova Pulse Technician Portal (migrate to v2 for enhanced features)',
  },

  helix: {
    version: 'v1',
    baseUrl: '/api/v1/helix',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/helix-v2',
    description: 'Nova Helix Identity Engine (migrate to v2 for advanced identity features)',
  },

  lore: {
    version: 'v1',
    baseUrl: '/api/v1/lore',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/lore-v2',
    description: 'Nova Lore Knowledge Base (migrate to v2 for AI-enhanced search)',
  },

  orbit: {
    version: 'v1',
    baseUrl: '/api/v1/orbit',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/orbit-v2',
    description: 'Nova Orbit End-User Portal (migrate to v2 for enhanced UX)',
  },

  assets: {
    version: 'v1',
    baseUrl: '/api/v1/assets',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/assets-v2',
    description: 'Asset management (migrate to v2 inventory module)',
  },

  inventory: {
    version: 'v1',
    baseUrl: '/api/v1/inventory',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/inventory-v2',
    description: 'Inventory management (consider v2 for enhanced tracking)',
  },

  analytics: {
    version: 'v1',
    baseUrl: '/api/v1/analytics',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/analytics-v2',
    description: 'Analytics and reporting (migrate to v2 for advanced insights)',
  },

  knowledge: {
    version: 'v1',
    baseUrl: '/api/v1/knowledge',
    deprecated: true,
    deprecationDate: '2024-12-31',
    migrationGuide: 'https://docs.nova-universe.com/api/migration/knowledge-v2',
    description: 'Knowledge base search (part of Nova Lore - migrate to v2 lore)',
  },

  // === Special Routes (Non-versioned) ===
  scim: {
    version: 'v1', // SCIM maintains its own versioning scheme
    baseUrl: '/scim/v2',
    description: 'SCIM 2.0 provisioning API (follows SCIM standard versioning)',
  },
};

/**
 * Get API configuration for a specific service
 */
export function getApiConfig(service: keyof ApiEndpointConfig): ApiVersionConfig {
  const config = API_VERSION_CONFIG[service];
  if (!config) {
    throw new Error(`API configuration not found for service: ${service}`);
  }
  return config;
}

/**
 * Get base URL for a specific service
 */
export function getApiBaseUrl(service: keyof ApiEndpointConfig): string {
  return getApiConfig(service).baseUrl;
}

/**
 * Check if a service API is deprecated
 */
export function isApiDeprecated(service: keyof ApiEndpointConfig): boolean {
  return getApiConfig(service).deprecated === true;
}

/**
 * Get all deprecated services
 */
export function getDeprecatedServices(): Array<{
  service: string;
  config: ApiVersionConfig;
}> {
  return Object.entries(API_VERSION_CONFIG)
    .filter(([_, config]) => config.deprecated)
    .map(([service, config]) => ({ service, config }));
}

/**
 * Get all current (v2) services
 */
export function getCurrentServices(): Array<{
  service: string;
  config: ApiVersionConfig;
}> {
  return Object.entries(API_VERSION_CONFIG)
    .filter(([_, config]) => config.version === 'v2')
    .map(([service, config]) => ({ service, config }));
}

/**
 * Migration helper: Get v2 equivalent for a v1 service
 */
export function getV2Equivalent(v1Service: string): string | null {
  const migrationMap: Record<string, string> = {
    synth: 'synth', // v1 synth -> v2 synth
    knowledge: 'lore', // v1 knowledge -> v2 lore
    assets: 'inventory', // v1 assets -> v2 inventory (enhanced)
    analytics: 'user360', // v1 analytics -> v2 user360 (enhanced)
    pulse: 'pulse', // v1 pulse -> v2 pulse (when available)
    helix: 'helix', // v1 helix -> v2 helix (when available)
    lore: 'lore', // v1 lore -> v2 lore (when available)
    orbit: 'orbit', // v1 orbit -> v2 orbit (when available)
  };

  return migrationMap[v1Service] || null;
}

/**
 * Development helper: Log deprecation warnings
 */
export function logDeprecationWarning(service: keyof ApiEndpointConfig): void {
  const config = getApiConfig(service);
  if (config.deprecated && process.env.NODE_ENV === 'development') {
    console.warn(
      `🚨 API Deprecation Warning: ${service} (${config.version}) is deprecated.`,
      `\n📅 Sunset Date: ${config.deprecationDate}`,
      `\n📖 Migration Guide: ${config.migrationGuide}`,
      `\n💡 Description: ${config.description}`,
    );
  }
}

/**
 * Runtime API version validation
 */
export function validateApiUsage(): void {
  if (process.env.NODE_ENV === 'development') {
    const deprecated = getDeprecatedServices();
    if (deprecated.length > 0) {
      console.group('🔄 API Version Status Report');
      console.log('✅ Current Services (v2):', getCurrentServices().length);
      console.log('⚠️ Deprecated Services (v1):', deprecated.length);

      deprecated.forEach(({ service, config }) => {
        console.warn(`  • ${service}: ${config.description}`);
      });

      console.log('\n📋 Run migration tool: npm run api:migrate');
      console.groupEnd();
    }
  }
}

// Export types for TypeScript usage
export type ApiService = keyof typeof API_VERSION_CONFIG;
export type ApiVersion = 'v1' | 'v2';
