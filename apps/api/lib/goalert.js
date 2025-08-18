// Nova GoAlert Integration Layer
// Handles communication with GoAlert headless alerting backend

import axios from 'axios';

/**
 * GoAlert client for Nova integration
 */
export class GoAlertClient {
  constructor(baseUrl = process.env.GOALERT_URL || 'http://localhost:8081', apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {}
    });
  }

  async getServices() {
    try {
      const response = await this.axios.get('/api/v2/services');
      return response.data.map(service => this.transformService(service));
    } catch (error) {
      console.error('Error fetching services:', error.message);
      return [];
    }
  }

  async createService(service) {
    try {
      const response = await this.axios.post('/api/v2/services', {
        name: service.name,
        description: service.description,
        escalation_policy_id: service.escalationPolicyId
      });
      return this.transformService(response.data);
    } catch (error) {
      console.error('Error creating service:', error.message);
      throw error;
    }
  }

  async updateService(id, updates) {
    try {
      const response = await this.axios.put(`/api/v2/services/${id}`, updates);
      return this.transformService(response.data);
    } catch (error) {
      console.error('Error updating service:', error.message);
      throw error;
    }
  }

  async deleteService(id) {
    try {
      await this.axios.delete(`/api/v2/services/${id}`);
    } catch (error) {
      console.error('Error deleting service:', error.message);
      throw error;
    }
  }

  async getAlerts(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.serviceId) params.append('service_id', filters.serviceId);
      if (filters.status) params.append('status', filters.status);
      
      const response = await this.axios.get(`/api/v2/alerts?${params.toString()}`);
      return response.data.map(alert => this.transformAlert(alert));
    } catch (error) {
      console.error('Error fetching alerts:', error.message);
      return [];
    }
  }

  async createAlert(alert) {
    try {
      const response = await this.axios.post('/api/v2/alerts', {
        summary: alert.summary,
        details: alert.details,
        service_id: alert.serviceId,
        dedup_key: alert.dedupKey
      });
      return this.transformAlert(response.data);
    } catch (error) {
      console.error('Error creating alert:', error.message);
      throw error;
    }
  }

  async acknowledgeAlert(id) {
    try {
      const response = await this.axios.post(`/api/v2/alerts/${id}/acknowledge`);
      return this.transformAlert(response.data);
    } catch (error) {
      console.error('Error acknowledging alert:', error.message);
      throw error;
    }
  }

  async closeAlert(id) {
    try {
      const response = await this.axios.post(`/api/v2/alerts/${id}/close`);
      return this.transformAlert(response.data);
    } catch (error) {
      console.error('Error closing alert:', error.message);
      throw error;
    }
  }

  async getEscalationPolicies() {
    try {
      const response = await this.axios.get('/api/v2/escalation-policies');
      return response.data.map(policy => this.transformEscalationPolicy(policy));
    } catch (error) {
      console.error('Error fetching escalation policies:', error.message);
      return [];
    }
  }

  async getSchedules() {
    try {
      const response = await this.axios.get('/api/v2/schedules');
      return response.data.map(schedule => this.transformSchedule(schedule));
    } catch (error) {
      console.error('Error fetching schedules:', error.message);
      return [];
    }
  }

  async getOnCall(scheduleId) {
    try {
      const response = await this.axios.get(`/api/v2/schedules/${scheduleId}/on-call`);
      return response.data.map(onCall => this.transformOnCall(onCall));
    } catch (error) {
      console.error('Error fetching on-call data:', error.message);
      return [];
    }
  }

  async getUsers() {
    try {
      const response = await this.axios.get('/api/v2/users');
      return response.data.map(user => this.transformUser(user));
    } catch (error) {
      console.error('Error fetching users:', error.message);
      return [];
    }
  }

  async getSystemInfo() {
    try {
      await this.axios.get('/api/v2/user/profile');
      return { version: 'connected', isConnected: true };
    } catch (error) {
      console.error('Error fetching system info:', error.message);
      return { version: 'unknown', isConnected: false };
    }
  }

  // Transformation helpers to convert GoAlert data to Nova format
  transformService(goalertService) {
    return {
      id: goalertService.id,
      name: goalertService.name,
      description: goalertService.description,
      escalationPolicyId: goalertService.escalation_policy_id,
      createdAt: goalertService.created_at ? new Date(goalertService.created_at).toISOString() : null,
      updatedAt: goalertService.updated_at ? new Date(goalertService.updated_at).toISOString() : null
    };
  }

  transformAlert(goalertAlert) {
    return {
      id: goalertAlert.id,
      summary: goalertAlert.summary,
      details: goalertAlert.details,
      status: goalertAlert.status,
      serviceId: goalertAlert.service_id,
      serviceName: goalertAlert.service_name,
      dedupKey: goalertAlert.dedup_key,
      createdAt: goalertAlert.created_at ? new Date(goalertAlert.created_at).toISOString() : null,
      acknowledgedAt: goalertAlert.acknowledged_at ? new Date(goalertAlert.acknowledged_at).toISOString() : null,
      closedAt: goalertAlert.closed_at ? new Date(goalertAlert.closed_at).toISOString() : null
    };
  }

  transformEscalationPolicy(goalertPolicy) {
    return {
      id: goalertPolicy.id,
      name: goalertPolicy.name,
      description: goalertPolicy.description,
      repeat: goalertPolicy.repeat,
      steps: goalertPolicy.steps || []
    };
  }

  transformSchedule(goalertSchedule) {
    return {
      id: goalertSchedule.id,
      name: goalertSchedule.name,
      description: goalertSchedule.description,
      timeZone: goalertSchedule.time_zone
    };
  }

  transformOnCall(goalertOnCall) {
    return {
      userId: goalertOnCall.user_id,
      userName: goalertOnCall.user_name,
      start: goalertOnCall.start ? new Date(goalertOnCall.start).toISOString() : null,
      end: goalertOnCall.end ? new Date(goalertOnCall.end).toISOString() : null
    };
  }

  transformUser(goalertUser) {
    return {
      id: goalertUser.id,
      name: goalertUser.name,
      email: goalertUser.email,
      role: goalertUser.role
    };
  }
}

// Create and export default client instance
export const goalertClient = new GoAlertClient();

// Export Nova-compatible alerting management functions
export async function getNovaServices() {
  const services = await goalertClient.getServices();
  return services.map(service => ({
    ...service,
    source: 'goalert',
    managedBy: 'nova'
  }));
}

export async function createNovaService(serviceData) {
  const service = await goalertClient.createService(serviceData);
  return {
    ...service,
    source: 'goalert',
    managedBy: 'nova'
  };
}

export async function updateNovaService(id, updates) {
  const service = await goalertClient.updateService(id, updates);
  return {
    ...service,
    source: 'goalert',
    managedBy: 'nova'
  };
}

export async function deleteNovaService(id) {
  return await goalertClient.deleteService(id);
}

export async function getNovaAlerts(filters) {
  const alerts = await goalertClient.getAlerts(filters);
  return alerts.map(alert => ({
    ...alert,
    source: 'goalert',
    managedBy: 'nova'
  }));
}

export async function createNovaAlert(alertData) {
  const alert = await goalertClient.createAlert(alertData);
  return {
    ...alert,
    source: 'goalert',
    managedBy: 'nova'
  };
}

export async function acknowledgeNovaAlert(id) {
  const alert = await goalertClient.acknowledgeAlert(id);
  return {
    ...alert,
    source: 'goalert',
    managedBy: 'nova'
  };
}

export async function closeNovaAlert(id) {
  const alert = await goalertClient.closeAlert(id);
  return {
    ...alert,
    source: 'goalert',
    managedBy: 'nova'
  };
}

export async function getNovaEscalationPolicies() {
  const policies = await goalertClient.getEscalationPolicies();
  return policies.map(policy => ({
    ...policy,
    source: 'goalert',
    managedBy: 'nova'
  }));
}

export async function getNovaSchedules() {
  const schedules = await goalertClient.getSchedules();
  return schedules.map(schedule => ({
    ...schedule,
    source: 'goalert',
    managedBy: 'nova'
  }));
}

export async function getNovaOnCall(scheduleId) {
  const onCall = await goalertClient.getOnCall(scheduleId);
  return onCall.map(entry => ({
    ...entry,
    source: 'goalert',
    managedBy: 'nova'
  }));
}

export async function getNovaAlertingHealth() {
  const info = await goalertClient.getSystemInfo();
  const services = await getNovaServices();
  const alerts = await getNovaAlerts();
  
  const totalServices = services.length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged').length;
  
  return {
    service: 'goalert',
    version: info.version,
    isConnected: info.isConnected,
    totalServices,
    activeAlerts,
    acknowledgedAlerts,
    closedAlerts: alerts.length - activeAlerts - acknowledgedAlerts,
    healthScore: activeAlerts === 0 ? 100 : Math.max(0, 100 - (activeAlerts * 10))
  };
}

export default GoAlertClient;
