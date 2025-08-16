import React, { useState, useEffect } from 'react';
import type { ReactElement } from 'react';
import { 
  ComputerDesktopIcon as MonitorIcon,
  ExclamationTriangleIcon as AlertTriangle,
  CheckCircleIcon as CheckCircle2,
  XCircleIcon as XCircle,
  ClockIcon as Clock,
  BoltIcon as Activity,
  UsersIcon as Users,
  ArrowPathIcon as RefreshCw,
  BellIcon as Bell,
  Cog6ToothIcon as Settings,
  EyeIcon as Eye,
  PlusIcon as Plus,
  BoltIcon as Zap,
  TagIcon as Tag,
  CalendarIcon as Calendar,
  ShieldCheckIcon as Shield,
  SparklesIcon as Brain,
  ArrowRightOnRectangleIcon as LogOut
} from '@heroicons/react/24/outline';
import { 
  Monitor, 
  MonitorIncident, 
  MonitorGroup,
  MonitorsResponse, 
  IncidentsResponse,
  GroupsResponse,
  TechnicianDashboardProps,
  IncidentListProps,
  IncidentCardProps,
  MonitorStatusGridProps,
  MonitorStatusCardProps,
  QuickActionsProps,
  RealTimeStatsProps,
  IncidentStatus,
  NotificationProvider,
  MonitorTag,
  MaintenanceWindow
} from '../../types/monitoring';

// Helix Authentication Hook - Enhanced for Technicians
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

// Synth AI Integration Hook - Enhanced for Technician Workflows
function useSynthAI() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const generateTechnicianInsights = async (incidents: MonitorIncident[], monitors: Monitor[]) => {
    try {
      setLoading(true);
      const response = await fetch('/api/synth/technician-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('helix_token')}`
        },
        body: JSON.stringify({
          incidents: incidents.slice(0, 20),
          monitors: monitors.slice(0, 15),
          request_type: 'technician_analysis',
          role: 'technician'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || {
          priority: 'NORMAL',
          incidentCount: 0,
          recommendedActions: [],
          escalationSuggestions: []
        });
      }
    } catch (error) {
      console.error('Failed to generate technician insights:', error);
      setInsights({
        priority: 'UNKNOWN',
        incidentCount: 0,
        recommendedActions: ['Unable to connect to Synth AI service'],
        escalationSuggestions: []
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { insights, loading, generateTechnicianInsights };
}

// Nova integrations: hooks can be swapped with shared packages when available
// import { useAuth } from '../../hooks/useAuth'; // Helix authentication
// import { useSynth } from '../../hooks/useSynth'; // Synth AI integration

// Apple-inspired status colors with semantic meaning
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

export default function TechnicianMonitoringDashboard({ className = '' }: TechnicianDashboardProps): ReactElement {
  // Helix authentication and Synth AI integration
  const { user, loading: authLoading, logout } = useHelixAuth();
  const { insights: technicianInsights, loading: aiLoading, generateTechnicianInsights } = useSynthAI();
  
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [incidents, setIncidents] = useState<MonitorIncident[]>([]);
  const [groups, setGroups] = useState<MonitorGroup[]>([]);
  const [notificationProviders, setNotificationProviders] = useState<NotificationProvider[]>([]);
  const [tags, setTags] = useState<MonitorTag[]>([]);
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'incidents' | 'monitors' | 'settings'>('overview');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Auth hook can be swapped with shared implementation when available
  // const { user, token } = useAuth();
  // const { generateInsights } = useSynth();
  const token = localStorage.getItem('helix_token') || localStorage.getItem('token');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate AI insights for incidents
    if (incidents.length > 0 || monitors.length > 0) {
      generateTechnicianInsights(incidents, monitors);
    }
  }, [incidents, monitors]);

  const fetchData = async (): Promise<void> => {
    try {
      await Promise.all([
        fetchMonitors(),
        fetchIncidents(),
        fetchGroups(),
        fetchNotificationProviders(),
        fetchTags(),
        fetchMaintenanceWindows()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonitors = async (): Promise<void> => {
    const response = await fetch('/api/enhanced-monitoring/monitors', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data: MonitorsResponse = await response.json();
    setMonitors(data.monitors || []);
  };

  const fetchIncidents = async (): Promise<void> => {
    const response = await fetch('/api/enhanced-monitoring/incidents?status=open,acknowledged,investigating', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data: IncidentsResponse = await response.json();
    setIncidents(data.incidents || []);
  };

  const fetchGroups = async (): Promise<void> => {
    const response = await fetch('/api/enhanced-monitoring/groups', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data: GroupsResponse = await response.json();
    setGroups(data.groups || []);
  };

  const fetchNotificationProviders = async (): Promise<void> => {
    const response = await fetch('/api/enhanced-monitoring/notification-providers', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    setNotificationProviders(data.providers || []);
  };

  const fetchTags = async (): Promise<void> => {
    const response = await fetch('/api/enhanced-monitoring/tags', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    setTags(data.tags || []);
  };

  const fetchMaintenanceWindows = async (): Promise<void> => {
    const response = await fetch('/api/enhanced-monitoring/maintenance-windows?status=active,upcoming', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    setMaintenanceWindows(data.maintenance_windows || []);
  };

  const handleIncidentStatusChange = async (incidentId: string, status: IncidentStatus): Promise<void> => {
    try {
      await fetch(`/api/enhanced-monitoring/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchIncidents(); // Refresh incidents
    } catch (error) {
      console.error('Failed to update incident status:', error);
    }
  };

  const acknowledgeAllIncidents = async (): Promise<void> => {
    try {
      await fetch('/api/enhanced-monitoring/incidents/bulk-acknowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      fetchIncidents();
    } catch (error) {
      console.error('Failed to acknowledge all incidents:', error);
    }
  };

  const manualMonitorCheck = async (monitorId: string): Promise<void> => {
    try {
      await fetch(`/api/enhanced-monitoring/monitors/${monitorId}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      fetchMonitors(); // Refresh monitors
    } catch (error) {
      console.error('Failed to run manual check:', error);
    }
  };

  // Calculate real-time statistics
  const stats = {
    totalMonitors: monitors.length,
    activeIncidents: incidents.filter(i => i.status !== 'resolved').length,
    criticalIncidents: incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length,
    avgResponseTime: monitors.reduce((acc, m) => acc + (m.avg_response_time || 0), 0) / monitors.length || 0,
    globalUptime: monitors.reduce((acc, m) => acc + (m.uptime_24h || 0), 0) / monitors.length || 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {/* Header with Technician Context */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              Technician Monitoring Dashboard
            </h1>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 font-medium">
                  {user.name || user.email}
                </span>
                <button
                  onClick={logout}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}
            <QuickActions 
              onAcknowledgeAll={acknowledgeAllIncidents}
              onRefresh={fetchData}
              onCreateIncident={() => { /* no-op: wire to incident creation route */ }}
            />
          </div>
        </div>
      </div>

      {/* Real-time Statistics - Technician focused */}
      <RealTimeStats 
        totalMonitors={stats.totalMonitors}
        activeIncidents={stats.activeIncidents}
        avgResponseTime={stats.avgResponseTime}
        globalUptime={stats.globalUptime}
      />

      {/* Synth AI Insights for Technicians */}
      {technicianInsights && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start">
              <Brain className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-2">
                  Synth AI Technician Insights
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    technicianInsights.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                    technicianInsights.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {technicianInsights.priority} Priority
                  </span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="bg-white p-3 rounded-lg border">
                    <span className="text-xs text-gray-600">Active Incidents</span>
                    <div className="text-lg font-bold text-gray-900">{technicianInsights.incidentCount}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <span className="text-xs text-gray-600">Priority Level</span>
                    <div className="text-lg font-bold text-purple-600">{technicianInsights.priority}</div>
                  </div>
                </div>
                
                {technicianInsights.recommendedActions && technicianInsights.recommendedActions.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-gray-800 mb-1">Recommended Actions:</h4>
                    <ul className="space-y-1">
                      {technicianInsights.recommendedActions.map((action: string, index: number) => (
                        <li key={index} className="text-xs text-gray-700 flex items-start">
                          <span className="text-purple-500 mr-1">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {technicianInsights.escalationSuggestions && technicianInsights.escalationSuggestions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-orange-800 mb-1">Escalation Suggestions:</h4>
                    <ul className="space-y-1">
                      {technicianInsights.escalationSuggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-xs text-orange-700 flex items-start">
                          <span className="text-orange-500 mr-1">⚠</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Maintenance Windows */}
      {maintenanceWindows.length > 0 && (
        <div className="mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-amber-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">
                  {maintenanceWindows.length} Active Maintenance Window{maintenanceWindows.length !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  {maintenanceWindows.map(mw => mw.title).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Incidents Alert - Prominent for urgent response */}
      {stats.criticalIncidents > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  {stats.criticalIncidents} Critical Incident{stats.criticalIncidents !== 1 ? 's' : ''} Require Immediate Attention
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Review and respond to critical service outages below.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Selector - Enhanced with settings */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
              { key: 'incidents', label: `Incidents (${stats.activeIncidents})`, icon: <AlertTriangle className="w-4 h-4" /> },
              { key: 'monitors', label: 'Monitors', icon: <MonitorIcon className="w-4 h-4" /> },
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

      {/* View Selector - Clean Apple-style tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
              { key: 'incidents', label: `Incidents (${stats.activeIncidents})`, icon: <AlertTriangle className="w-4 h-4" /> },
              { key: 'monitors', label: 'Monitors', icon: <MonitorIcon className="w-4 h-4" /> }
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

      {/* Main Content Area */}
      <div className="space-y-6">
        {selectedView === 'overview' && (
          <>
            {/* Service Groups Overview */}
            {groups.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Service Groups</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map((group) => (
                    <GroupCard 
                      key={group.id} 
                      group={group} 
                      onClick={() => { /* no-op: open group details drawer */ }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Incidents */}
            {incidents.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Incidents</h2>
                <IncidentList 
                  incidents={incidents.slice(0, 5)}
                  onAcknowledge={(id: string) => handleIncidentStatusChange(id, 'acknowledged')}
                  onResolve={(id: string) => handleIncidentStatusChange(id, 'resolved')}
                  onInvestigate={(id: string) => handleIncidentStatusChange(id, 'investigating')}
                />
              </div>
            )}
          </>
        )}

        {selectedView === 'incidents' && (
          <IncidentList 
            incidents={incidents}
            onAcknowledge={(id: string) => handleIncidentStatusChange(id, 'acknowledged')}
            onResolve={(id: string) => handleIncidentStatusChange(id, 'resolved')}
            onInvestigate={(id: string) => handleIncidentStatusChange(id, 'investigating')}
          />
        )}

        {selectedView === 'monitors' && (
          <MonitorStatusGrid 
            monitors={monitors}
            onMonitorClick={(monitor: Monitor) => manualMonitorCheck(monitor.id)}
          />
        )}

        {selectedView === 'settings' && (
          <EnhancedSettingsView 
            notificationProviders={notificationProviders}
            tags={tags}
            maintenanceWindows={maintenanceWindows}
            onRefresh={fetchData}
          />
        )}
      </div>
    </div>
  );
}

// Enhanced Settings View Component
function EnhancedSettingsView({ 
  notificationProviders, 
  tags, 
  maintenanceWindows, 
  onRefresh 
}: {
  notificationProviders: NotificationProvider[];
  tags: MonitorTag[];
  maintenanceWindows: MaintenanceWindow[];
  onRefresh: () => void;
}): ReactElement {
  return (
    <div className="space-y-6">
      {/* Notification Providers */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Providers ({notificationProviders.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notificationProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">{provider.name}</h3>
                <div className={`w-2 h-2 rounded-full ${
                  provider.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                }`} />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{provider.type}</p>
              {provider.test_success !== undefined && (
                <p className={`text-xs mt-2 ${
                  provider.test_success ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  Last test: {provider.test_success ? 'Success' : 'Failed'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Monitor Tags ({tags.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border`}
              data-tag-color={tag.color}
            >
              {tag.name}
              {tag.monitor_count !== undefined && (
                <span className="ml-2 text-xs opacity-70">({tag.monitor_count})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Windows */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Maintenance Windows ({maintenanceWindows.length})
        </h2>
        <div className="space-y-3">
          {maintenanceWindows.map((window) => (
            <div key={window.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{window.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{window.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(window.start_time).toLocaleString()} - {new Date(window.end_time).toLocaleString()}
                  </p>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  window.status === 'active' ? 'text-blue-600 bg-blue-50 border border-blue-200' :
                  window.status === 'scheduled' ? 'text-amber-600 bg-amber-50 border border-amber-200' :
                  'text-gray-600 bg-gray-50 border border-gray-200'
                }`}>
                  {window.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Real-time Statistics Component
function RealTimeStats({ totalMonitors, activeIncidents, avgResponseTime, globalUptime }: RealTimeStatsProps): ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <MonitorIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Total Monitors</p>
            <p className="text-xl font-semibold text-gray-900">{totalMonitors}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${activeIncidents > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
            {activeIncidents > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Active Incidents</p>
            <p className={`text-xl font-semibold ${activeIncidents > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {activeIncidents}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Avg Response</p>
            <p className="text-xl font-semibold text-gray-900">
              {Math.round(avgResponseTime)}ms
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Global Uptime</p>
            <p className="text-xl font-semibold text-emerald-600">
              {globalUptime.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions({ onAcknowledgeAll, onRefresh, onCreateIncident }: QuickActionsProps): ReactElement {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
        title="Refresh data"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
      
      <button
        onClick={onAcknowledgeAll}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors duration-200"
      >
        <Bell className="w-4 h-4 mr-2" />
        Ack All
      </button>

      <button
        onClick={onCreateIncident}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
      >
        <Plus className="w-4 h-4 mr-2" />
        New Incident
      </button>
    </div>
  );
}

// Group Card Component
function GroupCard({ group, onClick }: { group: MonitorGroup; onClick: (group: MonitorGroup) => void }): ReactElement {
  const statusColor = group.uptime_24h >= 99 ? 'emerald' : 
                     group.uptime_24h >= 95 ? 'amber' : 'red';

  return (
    <div 
      onClick={() => onClick(group)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">{group.name}</h3>
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-${statusColor}-600 bg-${statusColor}-50 border border-${statusColor}-200`}>
          {group.uptime_24h.toFixed(1)}%
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-2">{group.description}</p>
      <p className="text-xs text-gray-400">{group.monitors.length} monitors</p>
    </div>
  );
}

// Incident List Component
function IncidentList({ incidents, onAcknowledge, onResolve, onInvestigate }: IncidentListProps): ReactElement {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Incidents</h3>
        <p className="mt-1 text-sm text-gray-500">All systems are operating normally.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident: MonitorIncident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
          onInvestigate={onInvestigate}
        />
      ))}
    </div>
  );
}

// Incident Card Component
function IncidentCard({ incident, onAcknowledge, onResolve, onInvestigate }: IncidentCardProps): ReactElement {
  const timeAgo = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${SEVERITY_COLORS[incident.severity]}`}>
              {incident.severity.toUpperCase()}
            </div>
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
              incident.status === 'open' ? 'text-red-600 bg-red-50 border-red-200' :
              incident.status === 'acknowledged' ? 'text-amber-600 bg-amber-50 border-amber-200' :
              incident.status === 'investigating' ? 'text-blue-600 bg-blue-50 border-blue-200' :
              'text-gray-600 bg-gray-50 border-gray-200'
            }`}>
              {incident.status.toUpperCase()}
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {incident.monitor_name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{incident.summary}</p>
          <p className="text-xs text-gray-500">Started {timeAgo(incident.started_at)}</p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {incident.status === 'open' && (
            <button
              onClick={() => onAcknowledge(incident.id)}
              className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors duration-200"
            >
              Acknowledge
            </button>
          )}
          
          {incident.status !== 'resolved' && (
            <>
              <button
                onClick={() => onInvestigate(incident.id)}
                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                Investigate
              </button>
              <button
                onClick={() => onResolve(incident.id)}
                className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors duration-200"
              >
                Resolve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Monitor Status Grid Component
function MonitorStatusGrid({ monitors, onMonitorClick }: MonitorStatusGridProps): ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {monitors.map((monitor: Monitor) => (
        <MonitorStatusCard
          key={monitor.id}
          monitor={monitor}
          onClick={onMonitorClick}
        />
      ))}
    </div>
  );
}

// Monitor Status Card Component
function MonitorStatusCard({ monitor, onClick }: MonitorStatusCardProps): ReactElement {
  const getStatusInfo = () => {
    // Check if monitor is currently down based on current_status
    if (monitor.current_status === false) {
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
    } else if (monitor.uptime_24h && monitor.uptime_24h >= 99) {
      return {
        status: 'up' as const,
        label: 'Operational',
        icon: <CheckCircle2 className="w-4 h-4" />
      };
    } else if (monitor.uptime_24h && monitor.uptime_24h >= 95) {
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
    <div 
      onClick={() => onClick(monitor)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
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
