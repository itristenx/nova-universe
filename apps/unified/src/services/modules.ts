import { apiClient } from './api';

export interface ModuleConfiguration {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  value: any;
  options?: string[];
  description?: string;
}

export interface ModuleHealth {
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  uptime: number;
  errors: string[];
  responseTime?: number;
  memoryUsage?: number;
}

export interface Module {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  version: string;
  category: string;
  status: 'active' | 'inactive' | 'error' | 'updating';
  dependencies: string[];
  configurations: ModuleConfiguration[];
  health: ModuleHealth;
  installDate?: string;
  lastUpdate?: string;
  author?: string;
  documentation?: string;
}

export interface ModuleUpdateRequest {
  enabled?: boolean;
  configurations?: Record<string, any>;
}

export interface ModuleInstallRequest {
  name: string;
  version?: string;
  source: 'marketplace' | 'file' | 'git';
  config?: Record<string, any>;
}

export class ModuleService {
  private static baseUrl = '/api/v1/modules';

  /**
   * Get all installed modules
   */
  static async getAll(): Promise<Module[]> {
    const response = await apiClient.get<Module[]>(this.baseUrl);
    return response.data || [];
  }

  /**
   * Get module by key
   */
  static async getByKey(key: string): Promise<Module> {
    const response = await apiClient.get<Module>(`${this.baseUrl}/${key}`);
    if (!response.data) {
      throw new Error(`Module ${key} not found`);
    }
    return response.data;
  }

  /**
   * Enable/disable a module
   */
  static async toggleEnabled(key: string, enabled: boolean): Promise<Module> {
    const response = await apiClient.patch<Module>(`${this.baseUrl}/${key}/toggle`, { enabled });
    if (!response.data) {
      throw new Error(`Failed to toggle module ${key}`);
    }
    return response.data;
  }

  /**
   * Update module configuration
   */
  static async updateConfiguration(
    key: string,
    configurations: Record<string, any>,
  ): Promise<Module> {
    const response = await apiClient.put<Module>(`${this.baseUrl}/${key}/config`, {
      configurations,
    });
    if (!response.data) {
      throw new Error(`Failed to update module configuration for ${key}`);
    }
    return response.data;
  }

  /**
   * Install a new module
   */
  static async install(installRequest: ModuleInstallRequest): Promise<Module> {
    const response = await apiClient.post<Module>(`${this.baseUrl}/install`, installRequest);
    if (!response.data) {
      throw new Error(`Failed to install module ${installRequest.name}`);
    }
    return response.data;
  }

  /**
   * Uninstall a module
   */
  static async uninstall(key: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${key}`);
  }

  /**
   * Update module to latest version
   */
  static async update(key: string): Promise<Module> {
    const response = await apiClient.post<Module>(`${this.baseUrl}/${key}/update`);
    if (!response.data) {
      throw new Error(`Failed to update module ${key}`);
    }
    return response.data;
  }

  /**
   * Get module health status
   */
  static async getHealth(key: string): Promise<ModuleHealth> {
    const response = await apiClient.get<ModuleHealth>(`${this.baseUrl}/${key}/health`);
    if (!response.data) {
      throw new Error(`Failed to get health for module ${key}`);
    }
    return response.data;
  }

  /**
   * Run health check on module
   */
  static async runHealthCheck(key: string): Promise<ModuleHealth> {
    const response = await apiClient.post<ModuleHealth>(`${this.baseUrl}/${key}/health-check`);
    if (!response.data) {
      throw new Error(`Failed to run health check for module ${key}`);
    }
    return response.data;
  }

  /**
   * Get available modules from marketplace
   */
  static async getMarketplace(): Promise<Module[]> {
    const response = await apiClient.get<Module[]>(`${this.baseUrl}/marketplace`);
    return response.data || [];
  }

  /**
   * Get module categories
   */
  static async getCategories(): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseUrl}/categories`);
    return response.data || [];
  }

  /**
   * Get module dependency graph
   */
  static async getDependencyGraph(): Promise<Record<string, string[]>> {
    const response = await apiClient.get<Record<string, string[]>>(`${this.baseUrl}/dependencies`);
    return response.data || {};
  }

  /**
   * Restart a module
   */
  static async restart(key: string): Promise<Module> {
    const response = await apiClient.post<Module>(`${this.baseUrl}/${key}/restart`);
    if (!response.data) {
      throw new Error(`Failed to restart module ${key}`);
    }
    return response.data;
  }

  /**
   * Get module logs
   */
  static async getLogs(key: string, limit = 100): Promise<string[]> {
    const response = await apiClient.get<string[]>(`${this.baseUrl}/${key}/logs?limit=${limit}`);
    return response.data || [];
  }

  /**
   * Export module configuration
   */
  static async exportConfig(key: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`${this.baseUrl}/${key}/export`, {
      responseType: 'blob',
    });
    if (!response.data) {
      throw new Error(`Failed to export configuration for module ${key}`);
    }
    return response.data;
  }

  /**
   * Import module configuration
   */
  static async importConfig(key: string, configFile: File): Promise<Module> {
    const formData = new FormData();
    formData.append('config', configFile);

    const response = await apiClient.post<Module>(`${this.baseUrl}/${key}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (!response.data) {
      throw new Error(`Failed to import configuration for module ${key}`);
    }
    return response.data;
  }
}

export default ModuleService;
