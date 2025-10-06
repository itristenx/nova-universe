/**
 * Service Operations Service
 * Handles API calls for service requests, incidents, changes, and problems
 */

import { apiClient } from './api';

export interface ServiceRequest {
  id: string;
  number: string;
  short_description: string;
  description: string;
  state: string;
  priority: string;
  urgency: string;
  [key: string]: any;
}

export interface Incident {
  id: string;
  number: string;
  short_description: string;
  description: string;
  state: string;
  priority: string;
  urgency: string;
  [key: string]: any;
}

export interface Change {
  id: string;
  number: string;
  short_description: string;
  description: string;
  state: string;
  risk: string;
  [key: string]: any;
}

export interface Problem {
  id: string;
  number: string;
  short_description: string;
  description: string;
  state: string;
  priority: string;
  [key: string]: any;
}

class ServiceOperationsService {
  private readonly basePath = '/api/v1';

  async getServiceRequests(params?: any): Promise<{ requests: ServiceRequest[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/service-requests`, { params });
    return response.data;
  }

  async getIncidents(params?: any): Promise<{ incidents: Incident[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/incidents`, { params });
    return response.data;
  }

  async getChanges(params?: any): Promise<{ changes: Change[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/changes`, { params });
    return response.data;
  }

  async getProblems(params?: any): Promise<{ problems: Problem[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/problems`, { params });
    return response.data;
  }

  async getDashboard(): Promise<any> {
    const response = await apiClient.get(`${this.basePath}/service-operations/dashboard`);
    return response.data;
  }
}

export const serviceOperationsService = new ServiceOperationsService();
