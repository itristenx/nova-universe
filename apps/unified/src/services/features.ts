import { apiClient } from './api';

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  module: string;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NovaModule {
  id: string;
  name: string;
  key: string;
  description: string;
  version: string;
  enabled: boolean;
  features: FeatureFlag[];
  licenseRequired: boolean;
  dependencies: string[];
  routes: string[];
  permissions: string[];
  status: 'active' | 'inactive' | 'deprecated' | 'development';
  metadata: {
    icon: string;
    color: string;
    category: string;
    documentation?: string;
    supportContact?: string;
  };
}

class FeatureService {
  private featureCache = new Map<string, boolean>();
  private moduleCache = new Map<string, NovaModule>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;

  /**
   * Get all available Nova modules
   */
  async getModules(): Promise<NovaModule[]> {
    const response = await apiClient.get<NovaModule[]>('/features/modules');

    // Update module cache
    response.data?.forEach((module) => {
      this.moduleCache.set(module.key, module);
    });

    return response.data!;
  }

  /**
   * Get specific module by key
   */
  async getModule(moduleKey: string): Promise<NovaModule> {
    // Check cache first
    if (this.moduleCache.has(moduleKey)) {
      return this.moduleCache.get(moduleKey)!;
    }

    const response = await apiClient.get<NovaModule>(`/features/modules/${moduleKey}`);

    if (response.data) {
      this.moduleCache.set(moduleKey, response.data);
    }

    return response.data!;
  }

  /**
   * Enable/disable a Nova module
   */
  async toggleModule(moduleKey: string, enabled: boolean): Promise<NovaModule> {
    const response = await apiClient.post<NovaModule>(`/features/modules/${moduleKey}/toggle`, {
      enabled,
    });

    if (response.data) {
      this.moduleCache.set(moduleKey, response.data);
      // Clear feature cache as module state affects features
      this.clearFeatureCache();
    }

    return response.data!;
  }

  /**
   * Get all feature flags
   */
  async getFeatures(): Promise<FeatureFlag[]> {
    const response = await apiClient.get<FeatureFlag[]>('/features/flags');

    // Update feature cache
    response.data?.forEach((feature) => {
      this.featureCache.set(feature.key, feature.enabled);
    });
    this.lastCacheUpdate = Date.now();

    return response.data!;
  }

  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(featureKey: string): Promise<boolean> {
    // Check cache first
    if (this.isCacheValid() && this.featureCache.has(featureKey)) {
      return this.featureCache.get(featureKey)!;
    }

    try {
      const response = await apiClient.get<{ enabled: boolean }>(`/features/flags/${featureKey}`);
      const enabled = response.data?.enabled ?? false;

      this.featureCache.set(featureKey, enabled);
      return enabled;
    } catch (_error) {
      // Default to false if feature doesn't exist or API fails
      return false;
    }
  }

  /**
   * Check multiple features at once
   */
  async aresFeaturesEnabled(featureKeys: string[]): Promise<Record<string, boolean>> {
    const response = await apiClient.post<Record<string, boolean>>('/features/flags/check', {
      features: featureKeys,
    });

    // Update cache
    Object.entries(response.data || {}).forEach(([key, enabled]) => {
      this.featureCache.set(key, enabled);
    });

    return response.data!;
  }

  /**
   * Toggle a feature flag
   */
  async toggleFeature(featureKey: string, enabled: boolean): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag>(`/features/flags/${featureKey}/toggle`, {
      enabled,
    });

    if (response.data) {
      this.featureCache.set(featureKey, response.data.enabled);
    }

    return response.data!;
  }

  /**
   * Create a new feature flag
   */
  async createFeature(
    data: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag>('/features/flags', data);

    if (response.data) {
      this.featureCache.set(response.data.key, response.data.enabled);
    }

    return response.data!;
  }

  /**
   * Update a feature flag
   */
  async updateFeature(featureKey: string, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const response = await apiClient.patch<FeatureFlag>(`/features/flags/${featureKey}`, data);

    if (response.data) {
      this.featureCache.set(response.data.key, response.data.enabled);
    }

    return response.data!;
  }

  /**
   * Delete a feature flag
   */
  async deleteFeature(featureKey: string): Promise<void> {
    await apiClient.delete(`/features/flags/${featureKey}`);
    this.featureCache.delete(featureKey);
  }

  /**
   * Get module status and feature availability
   */
  async getModuleStatus(): Promise<{
    modules: Array<{
      key: string;
      name: string;
      enabled: boolean;
      features: Array<{
        key: string;
        name: string;
        enabled: boolean;
      }>;
    }>;
  }> {
    const response = await apiClient.get<{
      modules: Array<{
        key: string;
        name: string;
        enabled: boolean;
        features: Array<{
          key: string;
          name: string;
          enabled: boolean;
        }>;
      }>;
    }>('/features/status');

    return response.data!;
  }

  /**
   * Synchronous feature check (uses cache)
   */
  isFeatureEnabledSync(featureKey: string): boolean {
    return this.featureCache.get(featureKey) ?? false;
  }

  /**
   * Check if module is enabled (synchronous)
   */
  isModuleEnabledSync(moduleKey: string): boolean {
    const module = this.moduleCache.get(moduleKey);
    return module?.enabled ?? false;
  }

  /**
   * Get available Nova modules with their current status
   */
  getAvailableModules(): NovaModule[] {
    return Array.from(this.moduleCache.values());
  }

  /**
   * Clear feature cache
   */
  clearFeatureCache(): void {
    this.featureCache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Refresh cache from server
   */
  async refreshCache(): Promise<void> {
    await Promise.all([this.getFeatures(), this.getModules()]);
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheTimeout;
  }

  /**
   * Get Nova module configuration
   */
  getNovaModulesConfig(): Record<
    string,
    {
      name: string;
      description: string;
      defaultEnabled: boolean;
      features: string[];
      routes: string[];
      dependencies: string[];
    }
  > {
    return {
      'nova-core': {
        name: 'Nova Core',
        description: 'Core ITSM functionality including tickets, users, and basic operations',
        defaultEnabled: true,
        features: [
          'tickets',
          'users',
          'authentication',
          'notifications',
          'audit-logs',
          'api-access',
        ],
        routes: ['/tickets', '/admin/users', '/dashboard'],
        dependencies: [],
      },
      'nova-inventory': {
        name: 'Nova Inventory',
        description: 'Comprehensive asset and inventory management system',
        defaultEnabled: true,
        features: [
          'asset-management',
          'inventory-tracking',
          'cmdb',
          'asset-discovery',
          'depreciation',
          'maintenance-scheduling',
          'procurement',
          'asset-analytics',
        ],
        routes: ['/assets', '/inventory', '/cmdb'],
        dependencies: ['nova-core'],
      },
      'nova-atlas': {
        name: 'Nova Atlas',
        description: 'Space management, floor plans, and facility booking system',
        defaultEnabled: true,
        features: [
          'space-management',
          'floor-plans',
          'room-booking',
          'visitor-management',
          'occupancy-tracking',
          'facility-analytics',
          'wayfinding',
          'zoom-integration',
        ],
        routes: ['/spaces', '/booking', '/floor-plans'],
        dependencies: ['nova-core'],
      },
      'nova-courier': {
        name: 'Nova Courier',
        description: 'Package and mailroom tracking system',
        defaultEnabled: false,
        features: [
          'package-tracking',
          'mailroom-management',
          'delivery-notifications',
          'courier-integration',
          'signature-capture',
          'package-analytics',
        ],
        routes: ['/courier', '/packages'],
        dependencies: ['nova-core'],
      },
      'nova-synth': {
        name: 'Nova Synth',
        description: 'AI-powered analytics, automation, and intelligent insights',
        defaultEnabled: false,
        features: [
          'ai-analytics',
          'predictive-maintenance',
          'intelligent-routing',
          'automation-workflows',
          'natural-language-processing',
          'anomaly-detection',
          'smart-recommendations',
        ],
        routes: ['/ai', '/analytics', '/automation'],
        dependencies: ['nova-core', 'nova-inventory'],
      },
      'nova-security': {
        name: 'Nova Security',
        description: 'Advanced security, compliance, and risk management',
        defaultEnabled: false,
        features: [
          'security-monitoring',
          'compliance-tracking',
          'risk-assessment',
          'vulnerability-management',
          'security-analytics',
          'incident-response',
          'access-control',
        ],
        routes: ['/security', '/compliance'],
        dependencies: ['nova-core'],
      },
    };
  }
}

export const featureService = new FeatureService();

// Export Nova modules configuration
export const NOVA_MODULES = featureService.getNovaModulesConfig();

// Feature flag hooks for React components
export const useFeatureFlag = (featureKey: string): boolean => {
  return featureService.isFeatureEnabledSync(featureKey);
};

export const useModuleEnabled = (moduleKey: string): boolean => {
  return featureService.isModuleEnabledSync(moduleKey);
};
