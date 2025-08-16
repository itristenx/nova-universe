import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Calendar,
  Globe,
  Bell,
  Activity,
  RefreshCw,
  User,
  LogOut
} from 'lucide-react';

// Helix Authentication Hook - Simplified for Public Access
function useHelixAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('helix_token');
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
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

// Enhanced status page interfaces for end users
interface EnhancedStatusPage {
  id: string;
  name: string;
  description?: string;
  slug: string;
  is_public: boolean;
  theme: 'light' | 'dark' | 'auto';
  monitors: EnhancedMonitor[];
  groups: StatusPageGroup[];
  incident_history_days: number;
  custom_domain?: string;
  created_at: string;
  updated_at: string;
}

interface EnhancedMonitor {
  id: string;
  name: string;
  type: string;
  url?: string;
  current_status: boolean;
  uptime_24h?: number;
  uptime_7d?: number;
  uptime_30d?: number;
  avg_response_time_24h?: number;
  in_maintenance_window?: boolean;
  tag_names?: string[];
  cert_days_remaining?: number;
  group_id?: string;
  group_name?: string;
}

interface StatusPageGroup {
  id: string;
  name: string;
  monitors: string[];
  collapsed: boolean;
  sort_order: number;
}

interface ServiceGroupWithMonitors {
  id: string;
  name: string;
  monitors: EnhancedMonitor[];
  collapsed: boolean;
  sort_order: number;
}

interface EnhancedIncident {
  id: string;
  monitor_id: string;
  monitor_name: string;
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  description?: string;
  started_at: string;
  resolved_at?: string;
  updates: IncidentUpdate[];
}

interface IncidentUpdate {
  id: string;
  incident_id: string;
  status: string;
  message: string;
  created_at: string;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  affected_monitors: string[];
  status: 'scheduled' | 'active' | 'completed';
}

// Enhanced status colors with better UX
const STATUS_COLORS = {
  operational: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    dot: 'bg-emerald-500'
  },
  degraded: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    dot: 'bg-amber-500'
  },
  down: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-600',
    dot: 'bg-red-500'
  },
  maintenance: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    dot: 'bg-blue-500'
  }
} as const;

interface UserStatusDashboardProps {
  statusPageSlug?: string;
}

type SelectedView = 'status' | 'incidents' | 'maintenance' | 'subscribe';

export default function UserStatusDashboard({ statusPageSlug = 'default' }: UserStatusDashboardProps): React.ReactElement {
  // Optional Helix authentication for enhanced features
  const { user, logout } = useHelixAuth();
  
  const [statusPage, setStatusPage] = useState<EnhancedStatusPage | null>(null);
  const [incidents, setIncidents] = useState<EnhancedIncident[]>([]);
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState<SelectedView>('status');

  const fetchStatusPageData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Fetch status page data
      const statusResponse = await fetch(`/api/enhanced-monitoring/status-pages/${statusPageSlug}`);
      const statusData = await statusResponse.json();
      
      if (statusData.page) {
        setStatusPage(statusData.page);
        
        // Fetch incidents for the status page monitors
        const incidentsResponse = await fetch(`/api/enhanced-monitoring/incidents?status_page=${statusPageSlug}`);
        const incidentsData = await incidentsResponse.json();
        setIncidents(incidentsData.incidents || []);
        
        // Fetch maintenance windows
        const maintenanceResponse = await fetch(`/api/enhanced-monitoring/maintenance?status_page=${statusPageSlug}`);
        const maintenanceData = await maintenanceResponse.json();
        setMaintenanceWindows(maintenanceData.windows || []);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch status page data:', error);
    } finally {
      setLoading(false);
    }
  }, [statusPageSlug]);

  useEffect(() => {
    fetchStatusPageData();
    const interval = setInterval(fetchStatusPageData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchStatusPageData]);

  const getOverallStatus = (): { status: keyof typeof STATUS_COLORS; label: string; message: string } => {
    if (!statusPage) return { status: 'operational', label: 'Unknown', message: 'Loading status...' };

    const monitors = statusPage.monitors;
    const activeIncidents = incidents.filter(i => i.status !== 'resolved');
    const activeMaintenance = maintenanceWindows.filter(w => w.status === 'active');

    // Check for active maintenance
    if (activeMaintenance.length > 0) {
      return {
        status: 'maintenance',
        label: 'Scheduled Maintenance',
        message: `We are currently performing scheduled maintenance on ${activeMaintenance.length} service${activeMaintenance.length > 1 ? 's' : ''}.`
      };
    }

    // Check for critical incidents
    const criticalIncidents = activeIncidents.filter(i => i.severity === 'critical');
    if (criticalIncidents.length > 0) {
      return {
        status: 'down',
        label: 'Major Outage',
        message: `We are experiencing major issues affecting ${criticalIncidents.length} service${criticalIncidents.length > 1 ? 's' : ''}.`
      };
    }

    // Check for any incidents
    if (activeIncidents.length > 0) {
      return {
        status: 'degraded',
        label: 'Partial Outage',
        message: `We are experiencing issues with ${activeIncidents.length} service${activeIncidents.length > 1 ? 's' : ''}.`
      };
    }

    // Check monitor health
    const downMonitors = monitors.filter(m => !m.current_status && !m.in_maintenance_window);
    if (downMonitors.length > 0) {
      return {
        status: 'down',
        label: 'Service Disruption',
        message: `${downMonitors.length} service${downMonitors.length > 1 ? 's are' : ' is'} currently experiencing issues.`
      };
    }

    const degradedMonitors = monitors.filter(m => m.current_status && (m.uptime_24h ?? 100) < 95);
    if (degradedMonitors.length > 0) {
      return {
        status: 'degraded',
        label: 'Degraded Performance',
        message: `${degradedMonitors.length} service${degradedMonitors.length > 1 ? 's are' : ' is'} experiencing degraded performance.`
      };
    }

    return {
      status: 'operational',
      label: 'All Systems Operational',
      message: 'All services are operating normally.'
    };
  };

  const groupedMonitors = statusPage?.groups.map(group => ({
    ...group,
    monitors: statusPage.monitors.filter(m => group.monitors.includes(m.id))
  })) || [];

  const ungroupedMonitors = statusPage?.monitors.filter(
    m => !statusPage.groups.some(g => g.monitors.includes(m.id))
  ) || [];

  const overallStatus = getOverallStatus();

  if (loading && !statusPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading status page...</p>
        </div>
      </div>
    );
  }

  if (!statusPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Status Page Not Found</h2>
          <p className="text-gray-500">The requested status page could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Globe className="w-7 h-7 text-blue-600" />
                {statusPage.name}
              </h1>
              {statusPage.description && (
                <p className="text-gray-600 mt-2">{statusPage.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <User className="w-3 h-3 text-gray-600" />
                  <span className="text-xs text-gray-700 font-medium">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={fetchStatusPageData}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-xs text-gray-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'status', label: 'Current Status', icon: <Activity className="w-4 h-4" /> },
              { key: 'incidents', label: `Incidents (${incidents.filter(i => i.status !== 'resolved').length})`, icon: <AlertTriangle className="w-4 h-4" /> },
              { key: 'maintenance', label: `Maintenance (${maintenanceWindows.filter(w => w.status !== 'completed').length})`, icon: <Calendar className="w-4 h-4" /> },
              { key: 'subscribe', label: 'Subscribe', icon: <Bell className="w-4 h-4" /> }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as SelectedView)}
                className={`${
                  selectedView === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm inline-flex items-center gap-2`}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedView === 'status' && (
          <div className="space-y-8">
            {/* Overall Status */}
            <div className={`rounded-xl p-6 border ${STATUS_COLORS[overallStatus.status].bg} ${STATUS_COLORS[overallStatus.status].border}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${STATUS_COLORS[overallStatus.status].bg}`}>
                  {overallStatus.status === 'operational' && <CheckCircle2 className={`w-6 h-6 ${STATUS_COLORS[overallStatus.status].icon}`} />}
                  {overallStatus.status === 'degraded' && <AlertTriangle className={`w-6 h-6 ${STATUS_COLORS[overallStatus.status].icon}`} />}
                  {overallStatus.status === 'down' && <XCircle className={`w-6 h-6 ${STATUS_COLORS[overallStatus.status].icon}`} />}
                  {overallStatus.status === 'maintenance' && <Clock className={`w-6 h-6 ${STATUS_COLORS[overallStatus.status].icon}`} />}
                </div>
                <div className="ml-4">
                  <h2 className={`text-lg font-semibold ${STATUS_COLORS[overallStatus.status].text}`}>
                    {overallStatus.label}
                  </h2>
                  <p className={`text-sm ${STATUS_COLORS[overallStatus.status].text} opacity-90`}>
                    {overallStatus.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Groups */}
            {groupedMonitors.map((group) => (
              <ServiceGroup key={group.id} group={group} />
            ))}

            {/* Ungrouped Services */}
            {ungroupedMonitors.length > 0 && (
              <ServiceGroup 
                group={{
                  id: 'ungrouped',
                  name: 'Services',
                  monitors: ungroupedMonitors,
                  collapsed: false,
                  sort_order: 999
                }} 
              />
            )}
          </div>
        )}

        {selectedView === 'incidents' && (
          <IncidentHistory incidents={incidents} />
        )}

        {selectedView === 'maintenance' && (
          <MaintenanceSchedule windows={maintenanceWindows} />
        )}

        {selectedView === 'subscribe' && (
          <SubscriptionOptions />
        )}
      </div>
    </div>
  );
}

// Service Group Component
function ServiceGroup({ group }: { group: ServiceGroupWithMonitors }): React.ReactElement {
  const [collapsed, setCollapsed] = useState(group.collapsed);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{group.monitors.length} services</span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {!collapsed && (
        <div className="px-6 pb-6 space-y-3">
          {group.monitors.map((monitor) => (
            <ServiceCard key={monitor.id} monitor={monitor} />
          ))}
        </div>
      )}
    </div>
  );
}

// Service Card Component
function ServiceCard({ monitor }: { monitor: EnhancedMonitor }): React.ReactElement {
  const getStatus = () => {
    if (monitor.in_maintenance_window) {
      return 'maintenance';
    } else if (!monitor.current_status) {
      return 'down';
    } else if ((monitor.uptime_24h ?? 100) < 95) {
      return 'degraded';
    } else {
      return 'operational';
    }
  };

  const status = getStatus();
  const colors = STATUS_COLORS[status];

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${colors.dot} mr-3`} />
        <div>
          <h4 className="text-sm font-medium text-gray-900">{monitor.name}</h4>
          {monitor.tag_names && monitor.tag_names.length > 0 && (
            <div className="flex gap-1 mt-1">
              {monitor.tag_names.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-right">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
          {status === 'operational' && 'Operational'}
          {status === 'degraded' && 'Degraded'}
          {status === 'down' && 'Down'}
          {status === 'maintenance' && 'Maintenance'}
        </div>
        {monitor.uptime_24h !== undefined && (
          <div className="text-xs text-gray-500 mt-1">
            {monitor.uptime_24h.toFixed(1)}% uptime
          </div>
        )}
      </div>
    </div>
  );
}

// Additional placeholder components
function IncidentHistory({ incidents }: { incidents: EnhancedIncident[] }): React.ReactElement {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Incident History</h2>
      {incidents.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-500">No incidents to report</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{incident.summary}</h3>
                  <p className="text-sm text-gray-500 mt-1">{incident.monitor_name}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Started {new Date(incident.started_at).toLocaleString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  incident.status === 'resolved' ? 'bg-green-50 text-green-700' :
                  incident.status === 'investigating' ? 'bg-blue-50 text-blue-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {incident.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MaintenanceSchedule({ windows }: { windows: MaintenanceWindow[] }): React.ReactElement {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Maintenance Schedule</h2>
      {windows.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <p className="text-gray-500">No scheduled maintenance</p>
        </div>
      ) : (
        <div className="space-y-4">
          {windows.map((window) => (
            <div key={window.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{window.title}</h3>
                  {window.description && (
                    <p className="text-sm text-gray-600 mt-1">{window.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(window.start_time).toLocaleString()} - {new Date(window.end_time).toLocaleString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  window.status === 'active' ? 'bg-blue-50 text-blue-700' :
                  window.status === 'scheduled' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  {window.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionOptions(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Subscribe to Updates</h2>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600 mb-4">
          Stay informed about service status changes and maintenance schedules.
        </p>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Get notified about incidents and maintenance</p>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Subscribe to Updates
          </button>
        </div>
      </div>
    </div>
  );
}
