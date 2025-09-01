import React, { useState, useEffect } from 'react';
import unifiedMonitoringService from '../../services/unifiedMonitoring';
import type { 
  NovaMonitor, 
  NovaAlert, 
  NovaService, 
  OnCallAssignment,
  ServiceHealth
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
  integrations: {
    goalert: ServiceHealth['goalert_api'];
    uptime_kuma: ServiceHealth['uptime_kuma_api'];
    database: ServiceHealth['database'];
  };
}

const UnifiedMonitoringDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [monitors, setMonitors] = useState<NovaMonitor[]>([]);
  const [alerts, setAlerts] = useState<NovaAlert[]>([]);
  const [services, setServices] = useState<NovaService[]>([]);
  const [onCallAssignments, setOnCallAssignments] = useState<OnCallAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [healthData, monitorsData, alertsData, servicesData, onCallData] = await Promise.all([
        unifiedMonitoringService.getSystemHealth(),
        unifiedMonitoringService.getMonitors(),
        unifiedMonitoringService.getAlerts(),
        unifiedMonitoringService.getServices(),
        unifiedMonitoringService.getOnCallAssignments()
      ]);
      
      // Transform health data to match UI expectations
      const transformedHealth: SystemHealth = {
        status: healthData.overall_status,
        monitors: {
          total: monitorsData.length,
          up: monitorsData.filter(m => m.status === 'up').length,
          down: monitorsData.filter(m => m.status === 'down').length,
          maintenance: monitorsData.filter(m => m.status === 'maintenance').length,
        },
        alerts: {
          total: alertsData.length,
          active: alertsData.filter(a => a.status === 'active').length,
          resolved: alertsData.filter(a => a.status === 'resolved').length,
        },
        services: {
          total: servicesData.length,
          healthy: servicesData.filter(s => s.status === 'active').length,
          degraded: servicesData.filter(s => s.status === 'maintenance').length,
          critical: servicesData.filter(s => s.status === 'inactive').length,
        },
        integrations: {
          goalert: healthData.goalert?.goalert_api || { status: 'unhealthy', message: 'No data' },
          uptime_kuma: healthData.uptime_kuma?.uptime_kuma_api || { status: 'unhealthy', message: 'No data' },
          database: healthData.goalert?.database || { status: 'unhealthy', message: 'No data' }
        }
      };
      
      setSystemHealth(transformedHealth);
      setMonitors(monitorsData);
      setAlerts(alertsData);
      setServices(servicesData);
      setOnCallAssignments(onCallData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await unifiedMonitoringService.acknowledgeAlert(alertId);
      await loadDashboardData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await unifiedMonitoringService.resolveAlert(alertId);
      await loadDashboardData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  const handleSyncUsers = async () => {
    try {
      await unifiedMonitoringService.syncUsersToGoAlert();
      await loadDashboardData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync users');
    }
  };

  const handleSyncMonitors = async () => {
    try {
      await unifiedMonitoringService.syncMonitorsToUptimeKuma();
      await loadDashboardData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync monitors');
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
              <h1 className="text-3xl font-bold text-gray-900">Nova Universe Monitoring</h1>
              <p className="mt-1 text-sm text-gray-500">
                Unified GoAlert + Uptime-Kuma platform • Last refresh: {lastRefresh.toLocaleTimeString()}
              </p>
              {systemHealth && (
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    systemHealth.status === 'healthy' ? 'bg-green-100 text-green-800' :
                    systemHealth.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth.status === 'healthy' ? '🟢' : systemHealth.status === 'degraded' ? '🟡' : '🔴'}
                    System {systemHealth.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    systemHealth.integrations.goalert.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    GoAlert {systemHealth.integrations.goalert.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    systemHealth.integrations.uptime_kuma.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Uptime-Kuma {systemHealth.integrations.uptime_kuma.status}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadDashboardData}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                🔄 Refresh
              </button>
              <div className="flex space-x-1">
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
                  Alerts {alerts.filter(a => a.status === 'active').length > 0 && (
                    <span className="ml-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {alerts.filter(a => a.status === 'active').length}
                    </span>
                  )}
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
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab systemHealth={systemHealth} />}
        {activeTab === 'monitors' && <MonitorsTab monitors={monitors} onRefresh={loadDashboardData} />}
        {activeTab === 'alerts' && <AlertsTab alerts={alerts} onAcknowledge={handleAcknowledgeAlert} onResolve={handleResolveAlert} />}
        {activeTab === 'services' && <ServicesTab services={services} onRefresh={loadDashboardData} />}
        {activeTab === 'oncall' && <OnCallTab assignments={onCallAssignments} />}
        {activeTab === 'admin' && <AdminTab onSyncUsers={handleSyncUsers} onSyncMonitors={handleSyncMonitors} systemHealth={systemHealth} />}
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

const MonitorsTab: React.FC<{ monitors: NovaMonitor[]; onRefresh: () => void }> = ({ monitors, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Monitors</h2>
        <div className="flex space-x-2">
          <button 
            onClick={onRefresh}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            🔄 Refresh
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            ➕ Add Monitor
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Monitors ({monitors.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Check</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monitors.map((monitor) => (
                <tr key={monitor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {monitor.name}
                    {monitor.syncStatus === 'failed' && (
                      <span className="ml-2 text-xs text-red-600">⚠️ Sync failed</span>
                    )}
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {monitor.responseTime ? `${monitor.responseTime}ms` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{monitor.uptime}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {monitor.lastCheck ? new Date(monitor.lastCheck).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {monitors.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No monitors configured yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AlertsTab: React.FC<{ 
  alerts: NovaAlert[]; 
  onAcknowledge: (alertId: string) => void; 
  onResolve: (alertId: string) => void; 
}> = ({ alerts, onAcknowledge, onResolve }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Alerts</h2>
        <div className="flex space-x-2">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
            🔍 Filter
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            ➕ Create Alert
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Active Alerts ({alerts.filter(a => a.status === 'active').length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert.id} className={alert.status === 'active' ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {alert.service_name}
                    {alert.slaBreached && (
                      <span className="ml-2 text-xs text-red-600">⚠️ SLA Breach</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.status === 'active' ? 'bg-red-100 text-red-800' :
                      alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={alert.summary}>
                      {alert.summary}
                    </div>
                    {alert.details && (
                      <div className="text-xs text-gray-500 max-w-xs truncate" title={alert.details}>
                        {alert.details}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {alert.status === 'active' && (
                      <>
                        <button 
                          onClick={() => onAcknowledge(alert.id)}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          📋 Acknowledge
                        </button>
                        <button 
                          onClick={() => onResolve(alert.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          ✅ Resolve
                        </button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <button 
                        onClick={() => onResolve(alert.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        ✅ Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No alerts at this time 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ServicesTab: React.FC<{ services: NovaService[]; onRefresh: () => void }> = ({ services, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
        <div className="flex space-x-2">
          <button 
            onClick={onRefresh}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            🔄 Refresh
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            ➕ Add Service
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Services ({services.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={service.description}>
                      {service.description || '-'}
                    </div>
                  </td>
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
                    {service.novaMonitorId ? (
                      <span className="text-green-600">✅ Linked</span>
                    ) : (
                      <span className="text-gray-400">No monitor</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No services configured yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OnCallTab: React.FC<{ assignments: OnCallAssignment[] }> = ({ assignments }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">On-Call Management</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          🗓️ Manage Schedules
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current On-Call */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Current On-Call</h3>
          </div>
          <div className="p-6">
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{assignment.userName}</div>
                      <div className="text-sm text-gray-500">{assignment.userEmail}</div>
                      <div className="text-sm text-gray-500">{assignment.scheduleName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {assignment.isOverride ? '🔄 Override' : '📅 Scheduled'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Until {new Date(assignment.endTime).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No one is currently on-call</p>
            )}
          </div>
        </div>

        {/* On-Call Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700">
              🔄 Create Override
            </button>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              📋 View Schedule
            </button>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              📞 Contact On-Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminTab: React.FC<{ 
  onSyncUsers: () => void; 
  onSyncMonitors: () => void; 
  systemHealth: SystemHealth | null; 
}> = ({ onSyncUsers, onSyncMonitors, systemHealth }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Administration</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Data Synchronization</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">User Synchronization</h4>
              <p className="text-sm text-gray-600 mb-3">
                Sync Nova users to GoAlert for alerting and on-call management
              </p>
              <button 
                onClick={onSyncUsers}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                🔄 Sync Users to GoAlert
              </button>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Monitor Synchronization</h4>
              <p className="text-sm text-gray-600 mb-3">
                Sync Nova monitors to Uptime-Kuma for uptime monitoring
              </p>
              <button 
                onClick={onSyncMonitors}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                🔄 Sync Monitors to Uptime-Kuma
              </button>
            </div>
          </div>
        </div>

        {/* Integration Health */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Integration Health</h3>
          </div>
          <div className="p-6">
            {systemHealth ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">GoAlert API</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    systemHealth.integrations.goalert.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth.integrations.goalert.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Uptime-Kuma API</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    systemHealth.integrations.uptime_kuma.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth.integrations.uptime_kuma.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Database</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    systemHealth.integrations.database.status === 'healthy' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {systemHealth.integrations.database.status}
                  </span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Overall Status</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      systemHealth.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      systemHealth.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {systemHealth.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Loading health information...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedMonitoringDashboard;
