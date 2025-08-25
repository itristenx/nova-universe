import { apiClient } from './api';
// import type { OpenAPIV3 } from 'openapi-types'

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

// export type OpenAPISpec = OpenAPIV3.Document
export type OpenAPISpec = any;

class ApiDocsService {
  private static baseUrl = '/api/v1/admin';

  static async getSpec(): Promise<OpenAPISpec> {
    const { data } = await apiClient.get<OpenAPISpec>('/api/v1/openapi');
    return data;
  }

  static async listKeys(): Promise<ApiKey[]> {
    const { data } = await apiClient.get<ApiKey[]>(`${this.baseUrl}/api-keys`);
    return data || [];
  }

  static async createKey(name: string): Promise<ApiKey> {
    const { data } = await apiClient.post<ApiKey>(`${this.baseUrl}/api-keys`, { name });
    return data;
  }

  static async deleteKey(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/api-keys/${id}`);
  }
}

export const apiDocsService = ApiDocsService;
export default ApiDocsService;
