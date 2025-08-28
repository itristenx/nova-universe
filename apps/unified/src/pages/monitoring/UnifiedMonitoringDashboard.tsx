import React, { useState, useEffect } from 'react';
import unifiedMonitoringService from '../../services/unifiedMonitoring';
import type { 
  NovaMonitor, 
  NovaAlert, 
  NovaService, 
  NovaIntegrationKey, 
  NovaHeartbeatMonitor,
  NovaEscalationPolicy,
  NovaScheduleOverride,
  NovaServiceNotice,
  NovaServiceLabel,
  NovaAlertMetrics
} from '../../services/unifiedMonitoring';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  monitors: {
    total: number;
    up: number;
    down: number;
    maintenance: number;
  };
  alerts: {
    total: number;
    active: number;
    resolved: number;
  };
  services: {
    total: number;
    healthy: number;
    degraded: number;
    critical: number;
  };
}

const UnifiedMonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [monitors, setMonitors] = useState<NovaMonitor[]>([]);
  const [alerts, setAlerts] = useState<NovaAlert[]>([]);
  const [services, setServices] = useState<NovaService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [health, monitorsData, alertsData, servicesData] = await Promise.all([
        unifiedMonitoringService.getSystemHealth(),
        unifiedMonitoringService.getMonitors(),
        unifiedMonitoringService.getAlerts(),
        unifiedMonitoringService.getServices()
      ]);
      
      setSystemHealth(health);
      setMonitors(monitorsData);
      setAlerts(alertsData);
      setServices(servicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading unified monitoring dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Unified Monitoring & Alerting</h1>
              <p className="mt-1 text-sm text-gray-500">
                Nova-Sentinel + Nova-Alert unified platform
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('monitors')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'monitors'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Monitors
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'alerts'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Alerts
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'services'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setActiveTab('oncall')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'oncall'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                On-Call
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab systemHealth={systemHealth} />}
        {activeTab === 'monitors' && <MonitorsTab monitors={monitors} />}
        {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
        {activeTab === 'services' && <ServicesTab services={services} />}
        {activeTab === 'oncall' && <OnCallTab />}
      </div>
    </div>
  );
};

// ========================================================================
// TAB COMPONENTS
// ========================================================================

const OverviewTab: React.FC<{ systemHealth: SystemHealth | null }> = ({ systemHealth }) => {
  if (!systemHealth) return <div>No system health data available</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monitors Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitors</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{systemHealth.monitors.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Up:</span>
              <span className="font-medium">{systemHealth.monitors.up}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Down:</span>
              <span className="font-medium">{systemHealth.monitors.down}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">Maintenance:</span>
              <span className="font-medium">{systemHealth.monitors.maintenance}</span>
            </div>
          </div>
        </div>

        {/* Alerts Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{systemHealth.alerts.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Active:</span>
              <span className="font-medium">{systemHealth.alerts.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Resolved:</span>
              <span className="font-medium">{systemHealth.alerts.resolved}</span>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">{systemHealth.services.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Healthy:</span>
              <span className="font-medium">{systemHealth.services.healthy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">Degraded:</span>
              <span className="font-medium">{systemHealth.services.degraded}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Critical:</span>
              <span className="font-medium">{systemHealth.services.critical}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MonitorsTab: React.FC<{ monitors: NovaMonitor[] }> = ({ monitors }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Monitors</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add Monitor
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Monitors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monitors.map((monitor) => (
                <tr key={monitor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{monitor.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{monitor.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      monitor.status === 'up' ? 'bg-green-100 text-green-800' :
                      monitor.status === 'down' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {monitor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{monitor.uptime}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AlertsTab: React.FC<{ alerts: NovaAlert[] }> = ({ alerts }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Alerts</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create Alert
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Alerts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{alert.service_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.status === 'active' ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Acknowledge</button>
                    <button className="text-green-600 hover:text-green-900">Resolve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ServicesTab: React.FC<{ services: NovaService[] }> = ({ services }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add Service
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Services</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Labels</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      service.status === 'active' ? 'bg-green-100 text-green-800' :
                      service.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Object.entries(service.labels).map(([key, value]) => (
                      <span key={key} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                        {key}: {value}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OnCallTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">On-Call Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Manage Schedules
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current On-Call</h3>
        <p className="text-gray-600">On-call schedule management and escalation policies will be displayed here.</p>
      </div>
    </div>
  );
};

export default UnifiedMonitoringDashboard;
