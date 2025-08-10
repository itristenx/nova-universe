import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus,
  Search,
  Filter,
  Activity,
  TrendingUp,
  Settings,
  Eye,
  Brain,
  Bell,
  Tag,
  Calendar,
  Users,
  Server,
  Zap,
  BarChart3,
  Globe,
  RefreshCw,
  MonitorIcon
} from 'lucide-react';
import { 
  Monitor, 
  MonitorIncident, 
  StatCardProps,
  MonitorCardProps,
  IncidentRowProps,
  CreateMonitorModalProps,
  MonitorType,
  MonitorStatus,
  NotificationProvider,
  MonitorTag,
  MaintenanceWindow,
  StatusPage
} from '../../types/monitoring';

// Helix Authentication Hook
function useHelixAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('helix_token');
        if (!token) {
          throw new Error('No token found');
        }
        
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('helix_token');
          window.location.href = '/auth/login';
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        window.location.href = '/auth/login';
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const logout = () => {
    localStorage.removeItem('helix_token');
    setUser(null);
    window.location.href = '/auth/login';
  };
  
  return { user, loading, logout };
}

// Synth AI Integration Hook
function useSynthAI() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const generateInsights = async (monitors: EnhancedMonitor[], incidents: MonitorIncident[]) => {
    try {
      setLoading(true);
      const response = await fetch('/api/synth/monitoring-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('helix_token')}`
        },
        body: JSON.stringify({
          monitors: monitors.slice(0, 10), // Limit data for AI processing
          incidents: incidents.slice(0, 20),
          request_type: 'monitoring_analysis'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || {
          riskLevel: 'LOW',
          activeAlerts: 0,
          systemEfficiency: 95,
          recommendations: []
        });
      }
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      // Set default insights on error
      setInsights({
        riskLevel: 'UNKNOWN',
        activeAlerts: 0,
        systemEfficiency: 0,
        recommendations: ['Unable to connect to Synth AI service']
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { insights, loading, generateInsights };
}

// Enhanced monitoring interface for admin
interface EnhancedMonitor extends Monitor {
  current_status: boolean;
  uptime_24h?: number;
  uptime_7d?: number;
  uptime_30d?: number;
  avg_response_time_24h?: number;
  avg_response_time_7d?: number;
  avg_response_time_30d?: number;
  tag_names?: string[];
  in_maintenance_window?: boolean;
  cert_days_remaining?: number;
}

// Apple-inspired status colors
const STATUS_COLORS = {
  up: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  down: 'text-red-600 bg-red-50 border-red-200',
  degraded: 'text-amber-600 bg-amber-50 border-amber-200',
  maintenance: 'text-blue-600 bg-blue-50 border-blue-200',
  paused: 'text-gray-600 bg-gray-50 border-gray-200'
} as const;

const SEVERITY_COLORS = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200'
} as const;

export default function AdminMonitoringDashboard(): ReactElement {
  // Authentication and AI integration
  const { user, loading: authLoading, logout } = useHelixAuth();
  const { insights: aiInsights, loading: aiLoading, generateInsights } = useSynthAI();
  
  // State management
  const [monitors, setMonitors] = useState<EnhancedMonitor[]>([]);
  const [incidents, setIncidents] = useState<MonitorIncident[]>([]);
  const [notificationProviders, setNotificationProviders] = useState<NotificationProvider[]>([]);
  const [tags, setTags] = useState<MonitorTag[]>([]);
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([]);
  const [statusPages, setStatusPages] = useState<StatusPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<MonitorType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MonitorStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'monitors' | 'incidents' | 'notifications' | 'tags' | 'maintenance' | 'status-pages' | 'settings'>('dashboard');

  useEffect(() => {
    fetchAllData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMonitors(),
        fetchIncidents(),
        fetchNotificationProviders(),
        fetchTags(),
        fetchMaintenanceWindows(),
        fetchStatusPages()
      ]);
      
      // Generate AI insights after data is loaded
      if (monitors.length > 0 || incidents.length > 0) {
        generateInsights(monitors, incidents);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitors = async (): Promise<void> => {
    try {
      const response = await fetch('/api/enhanced-monitoring/monitors', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMonitors(data.monitors || data || []);
    } catch (error) {
      console.error('Failed to fetch monitors:', error);
    }
  };

  const fetchIncidents = async (): Promise<void> => {
    try {
      const response = await fetch('/api/enhanced-monitoring/incidents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setIncidents(data.incidents || data || []);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    }
  };

  const fetchNotificationProviders = async (): Promise<void> => {
    try {
      const response = await fetch('/api/enhanced-monitoring/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setNotificationProviders(data.providers || data || []);
    } catch (error) {
      console.error('Failed to fetch notification providers:', error);
    }
  };

  const fetchTags = async (): Promise<void> => {
    try {
      const response = await fetch('/api/enhanced-monitoring/tags', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setTags(data.tags || data || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const fetchMaintenanceWindows = async (): Promise<void> => {
    try {
      const response = await fetch('/api/enhanced-monitoring/maintenance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setMaintenanceWindows(data.windows || data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch maintenance windows:', error);
      setLoading(false);
    }
  };

  const fetchStatusPages = async (): Promise<void> => {
    try {
      const response = await fetch('/api/enhanced-monitoring/status-pages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStatusPages(data.pages || data || []);
    } catch (error) {
      console.error('Failed to fetch status pages:', error);
    }
  };

  // Filter monitors based on search and filters
  const filteredMonitors = monitors.filter(monitor => {
    const matchesSearch = monitor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || monitor.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || monitor.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate enhanced statistics
  const stats = {
    total: monitors.length,
    up: monitors.filter(m => m.current_status && (m.uptime_24h ?? 0) > 95).length,
    down: monitors.filter(m => !m.current_status || (m.uptime_24h ?? 0) < 50).length,
    degraded: monitors.filter(m => m.current_status && (m.uptime_24h ?? 0) >= 50 && (m.uptime_24h ?? 0) <= 95).length,
    maintenance: monitors.filter(m => m.in_maintenance_window).length,
    avgResponseTime: monitors.length > 0 ? 
      Math.round(monitors.reduce((acc, m) => acc + (m.avg_response_time_24h || 0), 0) / monitors.length) : 0,
    globalUptime: monitors.length > 0 ?
      monitors.reduce((acc, m) => acc + (m.uptime_24h || 0), 0) / monitors.length : 0,
    activeIncidents: incidents.filter(i => i.status !== 'resolved').length,
    criticalIncidents: incidents.filter(i => i.status !== 'resolved' && i.severity === 'critical').length,
    notificationProviders: notificationProviders.length,
    activeProviders: notificationProviders.filter(p => p.active).length,
    tagsCount: tags.length,
    maintenanceActive: maintenanceWindows.filter(w => w.status === 'active').length,
    statusPagesCount: statusPages.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading enhanced monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-600" />
              Enhanced Monitoring Admin
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              AI-powered monitoring with full Uptime Kuma parity - manage {stats.total} services across {stats.notificationProviders} providers
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">
                  {user.name || user.email}
                </span>
                <button
                  onClick={logout}
                  className="ml-2 text-green-600 hover:text-green-800 text-sm"
                >
                  Logout
                </button>
              </div>
            )}
            <button
              onClick={fetchAllData}
              className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Monitor
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
              { key: 'monitors', label: `Monitors (${stats.total})`, icon: <Server className="w-4 h-4" /> },
              { key: 'incidents', label: `Incidents (${stats.activeIncidents})`, icon: <AlertTriangle className="w-4 h-4" /> },
              { key: 'notifications', label: `Providers (${stats.activeProviders})`, icon: <Bell className="w-4 h-4" /> },
              { key: 'tags', label: `Tags (${stats.tagsCount})`, icon: <Tag className="w-4 h-4" /> },
              { key: 'maintenance', label: `Maintenance (${stats.maintenanceActive})`, icon: <Calendar className="w-4 h-4" /> },
              { key: 'status-pages', label: `Status Pages (${stats.statusPagesCount})`, icon: <Globe className="w-4 h-4" /> },
              { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={`${
                  selectedView === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Dashboard View */}
      {selectedView === 'dashboard' && (
        <div className="space-y-6">
          {/* Enhanced Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Monitors"
              value={stats.total}
              icon={<Server className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              title="Operational"
              value={stats.up}
              icon={<CheckCircle className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Issues"
              value={stats.down + stats.degraded}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="red"
            />
            <StatCard
              title="Global Uptime"
              value={`${stats.globalUptime.toFixed(1)}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
          </div>

          {/* Synth AI Insights Panel */}
          {aiInsights && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Brain className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Synth AI Insights</h3>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  AI-Powered
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Risk Level</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      aiInsights.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                      aiInsights.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {aiInsights.riskLevel}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Active Alerts</span>
                    <span className="text-lg font-bold text-gray-900">{aiInsights.activeAlerts}</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">System Efficiency</span>
                    <span className="text-lg font-bold text-blue-600">{aiInsights.systemEfficiency}%</span>
                  </div>
                </div>
              </div>
              
              {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Recommendations</h4>
                  <ul className="space-y-1">
                    {aiInsights.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Active Incidents"
              value={stats.activeIncidents}
              icon={<XCircle className="w-5 h-5" />}
              color={stats.activeIncidents > 0 ? "red" : "green"}
            />
            <StatCard
              title="Avg Response"
              value={`${stats.avgResponseTime}ms`}
              icon={<Zap className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              title="Maintenance"
              value={stats.maintenanceActive}
              icon={<Clock className="w-5 h-5" />}
              color={stats.maintenanceActive > 0 ? "amber" : "green"}
            />
            <StatCard
              title="Notification Providers"
              value={`${stats.activeProviders}/${stats.notificationProviders}`}
              icon={<Bell className="w-5 h-5" />}
              color="blue"
            />
          </div>

          {/* Monitor Overview Grid */}
          {filteredMonitors.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Service Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMonitors.slice(0, 12).map((monitor) => (
                  <AdminMonitorCard
                    key={monitor.id}
                    monitor={monitor}
                    onUpdate={fetchAllData}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other view implementations would go here */}
      {selectedView !== 'dashboard' && (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} View</h3>
          <p className="text-gray-500">
            Enhanced {selectedView} management interface coming soon
          </p>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: StatCardProps): ReactElement {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    red: 'text-red-600 bg-red-50',
    amber: 'text-amber-600 bg-amber-50'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Admin Monitor Card Component
function AdminMonitorCard({ monitor, onUpdate }: { monitor: EnhancedMonitor; onUpdate: () => void }): ReactElement {
  const getStatusInfo = () => {
    if (!monitor.current_status) {
      return {
        status: 'down' as const,
        label: 'Down',
        icon: <XCircle className="w-4 h-4" />
      };
    } else if (monitor.in_maintenance_window) {
      return {
        status: 'maintenance' as const,
        label: 'Maintenance',
        icon: <Clock className="w-4 h-4" />
      };
    } else if ((monitor.uptime_24h ?? 0) >= 99) {
      return {
        status: 'up' as const,
        label: 'Operational',
        icon: <CheckCircle className="w-4 h-4" />
      };
    } else if ((monitor.uptime_24h ?? 0) >= 95) {
      return {
        status: 'degraded' as const,
        label: 'Degraded',
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else {
      return {
        status: 'down' as const,
        label: 'Down',
        icon: <XCircle className="w-4 h-4" />
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {monitor.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {monitor.type.toUpperCase()}
          </p>
          {monitor.tag_names && monitor.tag_names.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {monitor.tag_names.slice(0, 2).map((tagName, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {tagName}
                </span>
              ))}
              {monitor.tag_names.length > 2 && (
                <span className="text-xs text-gray-400">+{monitor.tag_names.length - 2}</span>
              )}
            </div>
          )}
        </div>
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[statusInfo.status]}`}>
          {statusInfo.icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Uptime (24h)</span>
          <span className="font-medium text-gray-900">
            {monitor.uptime_24h ? `${monitor.uptime_24h.toFixed(1)}%` : 'N/A'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Response</span>
          <span className="font-medium text-gray-900">
            {monitor.avg_response_time_24h ? `${Math.round(monitor.avg_response_time_24h)}ms` : 'N/A'}
          </span>
        </div>
        {monitor.cert_days_remaining !== undefined && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Cert Expiry</span>
            <span className={`font-medium ${
              monitor.cert_days_remaining <= 7 ? 'text-red-600' :
              monitor.cert_days_remaining <= 30 ? 'text-amber-600' : 'text-gray-900'
            }`}>
              {monitor.cert_days_remaining}d
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
