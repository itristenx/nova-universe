/**
 * CMDB (Configuration Management Database) Service
 * Handles API calls for configuration items, relationships, and CMDB analytics
 */

import { apiClient } from './api';

export interface ConfigurationItem {
  id: string;
  name: string;
  number: string;
  type: string;
  state: string;
  environment: string;
  category: string;
  subcategory?: string;
  description?: string;
  [key: string]: any;
}

export interface ConfigurationItemRelationship {
  id: string;
  fromCiId: string;
  toCiId: string;
  relationshipType: string;
  [key: string]: any;
}

export interface CMDBAnalytics {
  totalCIs: number;
  cisByType: Record<string, number>;
  cisByState: Record<string, number>;
  cisByEnvironment: Record<string, number>;
  [key: string]: any;
}

class CMDBService {
  private readonly basePath = '/api/v1/cmdb';

  /**
   * Get all configuration items with optional filtering
   */
  async getConfigurationItems(params?: {
    ciType?: string;
    status?: string;
    environment?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ cis: ConfigurationItem[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/cis`, { params });
    return response.data;
  }

  /**
   * Get a single configuration item by ID
   */
  async getConfigurationItem(id: string): Promise<ConfigurationItem> {
    const response = await apiClient.get(`${this.basePath}/cis/${id}`);
    return response.data;
  }

  /**
   * Create a new configuration item
   */
  async createConfigurationItem(ci: Partial<ConfigurationItem>): Promise<ConfigurationItem> {
    const response = await apiClient.post(`${this.basePath}/cis`, ci);
    return response.data;
  }

  /**
   * Update a configuration item
   */
  async updateConfigurationItem(
    id: string,
    updates: Partial<ConfigurationItem>
  ): Promise<ConfigurationItem> {
    const response = await apiClient.put(`${this.basePath}/cis/${id}`, updates);
    return response.data;
  }

  /**
   * Delete a configuration item
   */
  async deleteConfigurationItem(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/cis/${id}`);
  }

  /**
   * Get relationships for a configuration item
   */
  async getRelationships(ciId: string): Promise<ConfigurationItemRelationship[]> {
    const response = await apiClient.get(`${this.basePath}/cis/${ciId}/relationships`);
    return response.data;
  }

  /**
   * Create a relationship between configuration items
   */
  async createRelationship(
    relationship: Partial<ConfigurationItemRelationship>
  ): Promise<ConfigurationItemRelationship> {
    const response = await apiClient.post(`${this.basePath}/relationships`, relationship);
    return response.data;
  }

  /**
   * Get CMDB analytics and statistics
   */
  async getAnalytics(): Promise<CMDBAnalytics> {
    const response = await apiClient.get(`${this.basePath}/analytics`);
    return response.data;
  }

  /**
   * Perform impact analysis for a configuration item
   */
  async performImpactAnalysis(ciId: string): Promise<any> {
    const response = await apiClient.post(`${this.basePath}/cis/${ciId}/impact-analysis`);
    return response.data;
  }

  /**
   * Get CI types available in the system
   */
  async getCITypes(): Promise<string[]> {
    const response = await apiClient.get(`${this.basePath}/ci-types`);
    return response.data;
  }

  /**
   * Get business services
   */
  async getBusinessServices(): Promise<any[]> {
    const response = await apiClient.get(`${this.basePath}/business-services`);
    return response.data;
  }

  /**
   * Get CMDB health status
   */
  async getHealth(): Promise<any> {
    const response = await apiClient.get(`${this.basePath}/health`);
    return response.data;
  }
}

export const cmdbService = new CMDBService();
