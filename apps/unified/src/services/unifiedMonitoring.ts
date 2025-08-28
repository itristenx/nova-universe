

import { apiClient } from './api';
import { io, Socket } from 'socket.io-client';

// Nova-Sentinel Monitor Types
export interface NovaMonitor {
  id: string;
  name: string;
  type: string;
  status: 'up' | 'down' | 'degraded' | 'maintenance' | 'pending';
  uptime: number;
  url?: string;
  interval: number;
  timeout: number;
  created_at: string;
  updated_at: string;
}

// Nova-Sentinel Alert Types
export interface NovaAlert {
  id: string;
  service_name: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'acknowledged';
  message: string;
  created_at: string;
  updated_at: string;
}

// GoAlert Service Types - Missing from original implementation
export interface NovaService {
  id: string;
  name: string;
  description?: string;
  escalation_policy_id?: string;
  labels: Record<string, string>;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

// Integration Key Types
export interface NovaIntegrationKey {
  id: string;
  service_id: string;
  name: string;
  type: 'generic' | 'grafana' | 'site24x7' | 'prometheus' | 'email' | 'webhook';
  key: string;
  url?: string;
  config: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Heartbeat Monitor Types
export interface NovaHeartbeatMonitor {
  id: string;
  service_id: string;
  name: string;
  url: string;
  interval: number;
  timeout: number;
  last_heartbeat?: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  created_at: string;
  updated_at: string;
}

// Enhanced Escalation Policy Types
export interface NovaEscalationStep {
  id: string;
  level: number;
  delay_minutes: number;
  users: string[];
  notification_channels: string[];
  actions: string[];
  repeat_count: number;
  repeat_delay_minutes: number;
}

export interface NovaEscalationPolicy {
  id: string;
  name: string;
  description?: string;
  steps: NovaEscalationStep[];
  repeat_policy: 'no-repeat' | 'repeat-forever' | 'repeat-n-times';
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Schedule Override Types
export interface NovaScheduleOverride {
  id: string;
  schedule_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  reason?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Service Notice Types
export interface NovaServiceNotice {
  id: string;
  service_id: string;
  type: 'maintenance' | 'outage' | 'degraded' | 'info';
  title: string;
  message: string;
  start_time: string;
  end_time?: string;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Service Label Types
export interface NovaServiceLabel {
  id: string;
  service_id: string;
  key: string;
  value: string;
  created_at: string;
}

// Alert Metrics Types
export interface NovaAlertMetrics {
  service_id: string;
  time_period: '24h' | '7d' | '30d';
  total_alerts: number;
  acknowledged_alerts: number;
  resolved_alerts: number;
  average_response_time: number;
  average_resolution_time: number;
  escalation_count: number;
  created_at: string;
}

class UnifiedMonitoringService {
  // ========================================================================
  // BASIC MONITORING METHODS - Core functionality
  // ========================================================================

  async getSystemHealth(): Promise<any> {
    try {
      const response = await apiClient.get('/api/v2/monitoring/system-health');
      return (response as any).data.data;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  }

  async getMonitors(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/v2/monitoring/monitors');
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch monitors:', error);
      throw error;
    }
  }

  async getAlerts(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/v2/monitoring/alerts');
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      throw error;
    }
  }

  // ========================================================================
  // GOALERT SERVICE MANAGEMENT - Missing from original implementation
  // ========================================================================

  async getServices(filters?: {
    status?: string;
    labels?: Record<string, string>;
    escalation_policy_id?: string;
  }): Promise<NovaService[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.escalation_policy_id) params.append('escalation_policy_id', filters.escalation_policy_id);
      if (filters?.labels) params.append('labels', JSON.stringify(filters.labels));

      const response = await apiClient.get(`/api/v2/monitoring/services?${params.toString()}`);
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  }

  async getService(id: string): Promise<NovaService> {
    try {
      const response = await apiClient.get(`/api/v2/monitoring/services/${id}`);
      return (response as any).data.data;
    } catch (error) {
      console.error(`Failed to fetch service ${id}:`, error);
      throw error;
    }
  }

  async createService(service: Omit<NovaService, 'id' | 'created_at' | 'updated_at'>): Promise<NovaService> {
    try {
      const response = await apiClient.post('/api/v2/monitoring/services', service);
      return (response as any).data.data;
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  }

  async updateService(id: string, updates: Partial<NovaService>): Promise<NovaService> {
    try {
      const response = await apiClient.patch(`/api/v2/monitoring/services/${id}`, updates);
      return (response as any).data.data;
    } catch (error) {
      console.error(`Failed to update service ${id}:`, error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v2/monitoring/services/${id}`);
    } catch (error) {
      console.error(`Failed to delete service ${id}:`, error);
      throw error;
    }
  }

  // ========================================================================
  // INTEGRATION KEY MANAGEMENT
  // ========================================================================

  async getIntegrationKeys(service_id?: string): Promise<NovaIntegrationKey[]> {
    try {
      const params = new URLSearchParams();
      if (service_id) params.append('service_id', service_id);

      const response = await apiClient.get(`/api/v2/monitoring/integration-keys?${params.toString()}`);
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch integration keys:', error);
      throw error;
    }
  }

  async createIntegrationKey(integrationKey: Omit<NovaIntegrationKey, 'id' | 'created_at' | 'updated_at'>): Promise<NovaIntegrationKey> {
    try {
      const response = await apiClient.post('/api/v2/monitoring/integration-keys', integrationKey);
      return (response as any).data.data;
    } catch (error) {
      console.error('Failed to create integration key:', error);
      throw error;
    }
  }

  async deleteIntegrationKey(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v2/monitoring/integration-keys/${id}`);
    } catch (error) {
      console.error(`Failed to delete integration key ${id}:`, error);
      throw error;
    }
  }

  // ========================================================================
  // HEARTBEAT MONITOR MANAGEMENT
  // ========================================================================

  async getHeartbeatMonitors(service_id?: string): Promise<NovaHeartbeatMonitor[]> {
    try {
      const params = new URLSearchParams();
      if (service_id) params.append('service_id', service_id);

      const response = await apiClient.get(`/api/v2/monitoring/heartbeat-monitors?${params.toString()}`);
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch heartbeat monitors:', error);
      throw error;
    }
  }

  async createHeartbeatMonitor(heartbeatMonitor: Omit<NovaHeartbeatMonitor, 'id' | 'created_at' | 'updated_at'>): Promise<NovaHeartbeatMonitor> {
    try {
      const response = await apiClient.post('/api/v2/monitoring/heartbeat-monitors', heartbeatMonitor);
      return (response as any).data.data;
    } catch (error) {
      console.error('Failed to create heartbeat monitor:', error);
      throw error;
    }
  }

  async updateHeartbeatMonitor(id: string, updates: Partial<NovaHeartbeatMonitor>): Promise<NovaHeartbeatMonitor> {
    try {
      const response = await apiClient.patch(`/api/v2/monitoring/heartbeat-monitors/${id}`, updates);
      return (response as any).data.data;
    } catch (error) {
      console.error(`Failed to update heartbeat monitor ${id}:`, error);
      throw error;
    }
  }

  async deleteHeartbeatMonitor(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v2/monitoring/heartbeat-monitors/${id}`);
    } catch (error) {
      console.error(`Failed to delete heartbeat monitor ${id}:`, error);
      throw error;
    }
  }

  // ========================================================================
  // ENHANCED ESCALATION POLICY MANAGEMENT
  // ========================================================================

  async getEscalationPolicies(): Promise<NovaEscalationPolicy[]> {
    try {
      const response = await apiClient.get('/api/v2/monitoring/escalation-policies');
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch escalation policies:', error);
      throw error;
    }
  }

  async createEscalationPolicy(policy: Omit<NovaEscalationPolicy, 'id' | 'created_at' | 'updated_at'>): Promise<NovaEscalationPolicy> {
    try {
      const response = await apiClient.post('/api/v2/monitoring/escalation-policies', policy);
      return (response as any).data.data;
    } catch (error) {
      console.error('Failed to create escalation policy:', error);
      throw error;
    }
  }

  async updateEscalationPolicy(id: string, updates: Partial<NovaEscalationPolicy>): Promise<NovaEscalationPolicy> {
    try {
      const response = await apiClient.patch(`/api/v2/monitoring/escalation-policies/${id}`, updates);
      return (response as any).data.data;
    } catch (error) {
      console.error(`Failed to update escalation policy ${id}:`, error);
      throw error;
    }
  }

  async deleteEscalationPolicy(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v2/monitoring/escalation-policies/${id}`);
    } catch (error) {
      console.error(`Failed to delete escalation policy ${id}:`, error);
      throw error;
    }
  }

  // ========================================================================
  // SCHEDULE OVERRIDE MANAGEMENT
  // ========================================================================

  async getScheduleOverrides(schedule_id?: string): Promise<NovaScheduleOverride[]> {
    try {
      const params = new URLSearchParams();
      if (schedule_id) params.append('schedule_id', schedule_id);

      const response = await apiClient.get(`/api/v2/monitoring/schedule-overrides?${params.toString()}`);
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch schedule overrides:', error);
      throw error;
    }
  }

  async createScheduleOverride(override: Omit<NovaScheduleOverride, 'id' | 'created_at' | 'updated_at'>): Promise<NovaScheduleOverride> {
    try {
      const response = await apiClient.post('/api/v2/monitoring/schedule-overrides', override);
      return (response as any).data.data;
    } catch (error) {
      console.error('Failed to create schedule override:', error);
      throw error;
    }
  }

  async deleteScheduleOverride(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v2/monitoring/schedule-overrides/${id}`);
    } catch (error) {
      console.error(`Failed to delete schedule override ${id}:`, error);
      throw error;
    }
  }

  // ========================================================================
  // SERVICE NOTICE MANAGEMENT
  // ========================================================================

  async getServiceNotices(service_id?: string): Promise<NovaServiceNotice[]> {
    try {
      const params = new URLSearchParams();
      if (service_id) params.append('service_id', service_id);

      const response = await apiClient.get(`/api/v2/monitoring/service-notices?${params.toString()}`);
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch service notices:', error);
      throw error;
    }
  }

  async createServiceNotice(notice: Omit<NovaServiceNotice, 'id' | 'created_at' | 'updated_at'>): Promise<NovaServiceNotice> {
    try {
      const response = await apiClient.post('/api/v2/monitoring/service-notices', notice);
      return (response as any).data.data;
    } catch (error) {
      console.error('Failed to create service notice:', error);
      throw error;
    }
  }

  async updateServiceNotice(id: string, updates: Partial<NovaServiceNotice>): Promise<NovaServiceNotice> {
    try {
      const response = await apiClient.patch(`/api/v2/monitoring/service-notices/${id}`, updates);
      return (response as any).data.data;
    } catch (error) {
      console.error(`Failed to update service notice ${id}:`, error);
      throw error;
    }
  }

  async deleteServiceNotice(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v2/monitoring/service-notices/${id}`);
    } catch (error) {
      console.error(`Failed to delete service notice ${id}:`, error);
      throw error;
    }
  }

  // ========================================================================
  // SERVICE LABEL MANAGEMENT
  // ========================================================================

  async getServiceLabels(service_id?: string): Promise<NovaServiceLabel[]> {
    try {
      const params = new URLSearchParams();
      if (service_id) params.append('service_id', service_id);

      const response = await apiClient.get(`/api/v2/monitoring/service-labels?${params.toString()}`);
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch service labels:', error);
      throw error;
    }
  }

  async createServiceLabel(label: Omit<NovaServiceLabel, 'id' | 'created_at'>): Promise<NovaServiceLabel> {
    try {
      const response = await apiClient.post('/api/v2/monitoring/service-labels', label);
      return (response as any).data.data;
    } catch (error) {
      console.error('Failed to create service label:', error);
      throw error;
    }
  }

  async deleteServiceLabel(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v2/monitoring/service-labels/${id}`);
    } catch (error) {
      console.error(`Failed to delete service label ${id}:`, error);
      throw error;
    }
  }

  // ========================================================================
  // ALERT METRICS
  // ========================================================================

  async getAlertMetrics(service_id?: string, time_period: '24h' | '7d' | '30d' = '24h'): Promise<NovaAlertMetrics[]> {
    try {
      const params = new URLSearchParams();
      if (service_id) params.append('service_id', service_id);
      params.append('time_period', time_period);

      const response = await apiClient.get(`/api/v2/monitoring/alert-metrics?${params.toString()}`);
      return (response as any).data.data || [];
    } catch (error) {
      console.error('Failed to fetch alert metrics:', error);
      throw error;
    }
  }
}



// Export singleton instance
const unifiedMonitoringService = new UnifiedMonitoringService();
export default unifiedMonitoringService;
