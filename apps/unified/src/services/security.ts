/**
 * Security Service
 * Handles API calls for security incidents, vulnerabilities, and events
 */

import { apiClient } from './api';

export interface SecurityIncident {
  id: string;
  number: string;
  short_description: string;
  description: string;
  state: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  [key: string]: any;
}

export interface Vulnerability {
  id: string;
  cve_id?: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvss_score?: number;
  affected_systems: number;
  status: string;
  [key: string]: any;
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  timestamp: Date;
  [key: string]: any;
}

class SecurityService {
  private readonly basePath = '/api/v1/security';

  async getIncidents(params?: {
    state?: string;
    severity?: string;
    page?: number;
    limit?: number;
  }): Promise<{ incidents: SecurityIncident[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/incidents`, { params });
    return response.data;
  }

  async getIncident(id: string): Promise<SecurityIncident> {
    const response = await apiClient.get(`${this.basePath}/incidents/${id}`);
    return response.data;
  }

  async createIncident(incident: Partial<SecurityIncident>): Promise<SecurityIncident> {
    const response = await apiClient.post(`${this.basePath}/incidents`, incident);
    return response.data;
  }

  async updateIncident(id: string, updates: Partial<SecurityIncident>): Promise<SecurityIncident> {
    const response = await apiClient.put(`${this.basePath}/incidents/${id}`, updates);
    return response.data;
  }

  async getVulnerabilities(params?: {
    severity?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ vulnerabilities: Vulnerability[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/vulnerabilities`, { params });
    return response.data;
  }

  async getEvents(params?: {
    type?: string;
    severity?: string;
    timeRange?: string;
    page?: number;
    limit?: number;
  }): Promise<{ events: SecurityEvent[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/events`, { params });
    return response.data;
  }

  async getDashboard(): Promise<any> {
    const response = await apiClient.get(`${this.basePath}/dashboard`);
    return response.data;
  }
}

export const securityService = new SecurityService();
