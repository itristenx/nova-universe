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
  ArrowRightOnRectangleIcon as LogOut,
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
  MaintenanceWindow,
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
            Authorization: `Bearer ${token}`,
          },
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
          Authorization: `Bearer ${localStorage.getItem('helix_token')}`,
        },
        body: JSON.stringify({
          incidents: incidents.slice(0, 20),
          monitors: monitors.slice(0, 15),
          request_type: 'technician_analysis',
          role: 'technician',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(
          data.insights || {
            priority: 'NORMAL',
            incidentCount: 0,
            recommendedActions: [],
            escalationSuggestions: [],
          },
        );
      }
    } catch (error) {
      console.error('Failed to generate technician insights:', error);
      setInsights({
        priority: 'UNKNOWN',
        incidentCount: 0,
        recommendedActions: ['Unable to connect to Synth AI service'],
        escalationSuggestions: [],
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
  paused: 'text-gray-600 bg-gray-50 border-gray-200',
} as const;

const SEVERITY_COLORS = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-blue-600 bg-blue-50 border-blue-200',
} as const;

export default function TechnicianMonitoringDashboard({
  className = '',
}: TechnicianDashboardProps): ReactElement {
  // Helix authentication and Synth AI integration
  const { user, loading: authLoading, logout } = useHelixAuth();
  const {
    insights: technicianInsights,
    loading: aiLoading,
    generateTechnicianInsights,
  } = useSynthAI();

  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [incidents, setIncidents] = useState<MonitorIncident[]>([]);
  const [groups, setGroups] = useState<MonitorGroup[]>([]);
  const [notificationProviders, setNotificationProviders] = useState<NotificationProvider[]>([]);
  const [tags, setTags] = useState<MonitorTag[]>([]);
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    'overview' | 'incidents' | 'monitors' | 'settings'
  >('overview');
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
        fetchMaintenanceWindows(),
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
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data: MonitorsResponse = await response.json();
    setMonitors(data.monitors || []);
  };

  const fetchIncidents = async (): Promise<void> => {
    const response = await fetch(
      '/api/enhanced-monitoring/incidents?status=open,acknowledged,investigating',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const data: IncidentsResponse = await response.json();
    setIncidents(data.incidents || []);
  };

  const fetchGroups = async (): Promise<void> => {
    const response = await fetch('/api/enhanced-monitoring/groups', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data: GroupsResponse = await response.json();
    setGroups(data.groups || []);
  };

  const fetchNotificationProviders = async (): Promise<void> => {
    const response = await fetch('/api/enhanced-monitoring/notification-providers', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setNotificationProviders(data.providers || []);
  };

  const fetchTags = async (): Promise<void> => {
    const response = await fetch('/api/enhanced-monitoring/tags', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    setTags(data.tags || []);
  };

  const fetchMaintenanceWindows = async (): Promise<void> => {
    const response = await fetch(
      '/api/enhanced-monitoring/maintenance-windows?status=active,upcoming',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const data = await response.json();
    setMaintenanceWindows(data.maintenance_windows || []);
  };

  const handleIncidentStatusChange = async (
    incidentId: string,
    status: IncidentStatus,
  ): Promise<void> => {
    try {
      await fetch(`/api/enhanced-monitoring/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
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
          Authorization: `Bearer ${token}`,
        },
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
          Authorization: `Bearer ${token}`,
        },
      });
      fetchMonitors(); // Refresh monitors
    } catch (error) {
      console.error('Failed to run manual check:', error);
    }
  };

  // Calculate real-time statistics
  const stats = {
    totalMonitors: monitors.length,
    activeIncidents: incidents.filter((i) => i.status !== 'resolved').length,
    criticalIncidents: incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved')
      .length,
    avgResponseTime:
      monitors.reduce((acc, m) => acc + (m.avg_response_time || 0), 0) / monitors.length || 0,
    globalUptime: monitors.reduce((acc, m) => acc + (m.uptime_24h || 0), 0) / monitors.length || 0,
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
      {/* Header with Technician Context */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-gray-900">
              <Shield className="h-6 w-6 text-blue-600" />
              Technician Monitoring Dashboard
            </h1>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 sm:mt-0">
            {user && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-blue-700">{user.name || user.email}</span>
                <button
                  onClick={logout}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-3 w-3" />
                </button>
              </div>
            )}
            <QuickActions
              onAcknowledgeAll={acknowledgeAllIncidents}
              onRefresh={fetchData}
              onCreateIncident={() => {
                /* no-op: wire to incident creation route */
              }}
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
          <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4">
            <div className="flex items-start">
              <Brain className="mt-0.5 mr-3 h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-800">
                  Synth AI Technician Insights
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      technicianInsights.priority === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : technicianInsights.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {technicianInsights.priority} Priority
                  </span>
                </h3>

                <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-white p-3">
                    <span className="text-xs text-gray-600">Active Incidents</span>
                    <div className="text-lg font-bold text-gray-900">
                      {technicianInsights.incidentCount}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-white p-3">
                    <span className="text-xs text-gray-600">Priority Level</span>
                    <div className="text-lg font-bold text-purple-600">
                      {technicianInsights.priority}
                    </div>
                  </div>
                </div>

                {technicianInsights.recommendedActions &&
                  technicianInsights.recommendedActions.length > 0 && (
                    <div className="mb-3">
                      <h4 className="mb-1 text-xs font-semibold text-gray-800">
                        Recommended Actions:
                      </h4>
                      <ul className="space-y-1">
                        {technicianInsights.recommendedActions.map(
                          (action: string, index: number) => (
                            <li key={index} className="flex items-start text-xs text-gray-700">
                              <span className="mr-1 text-purple-500">•</span>
                              {action}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {technicianInsights.escalationSuggestions &&
                  technicianInsights.escalationSuggestions.length > 0 && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold text-orange-800">
                        Escalation Suggestions:
                      </h4>
                      <ul className="space-y-1">
                        {technicianInsights.escalationSuggestions.map(
                          (suggestion: string, index: number) => (
                            <li key={index} className="flex items-start text-xs text-orange-700">
                              <span className="mr-1 text-orange-500">⚠</span>
                              {suggestion}
                            </li>
                          ),
                        )}
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
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center">
              <Calendar className="mr-3 h-5 w-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">
                  {maintenanceWindows.length} Active Maintenance Window
                  {maintenanceWindows.length !== 1 ? 's' : ''}
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  {maintenanceWindows.map((mw) => mw.title).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Incidents Alert - Prominent for urgent response */}
      {stats.criticalIncidents > 0 && (
        <div className="mb-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <AlertTriangle className="mr-3 h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  {stats.criticalIncidents} Critical Incident
                  {stats.criticalIncidents !== 1 ? 's' : ''} Require Immediate Attention
                </h3>
                <p className="mt-1 text-sm text-red-700">
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
              { key: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
              {
                key: 'incidents',
                label: `Incidents (${stats.activeIncidents})`,
                icon: <AlertTriangle className="h-4 w-4" />,
              },
              { key: 'monitors', label: 'Monitors', icon: <MonitorIcon className="h-4 w-4" /> },
              { key: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={`${
                  selectedView === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap`}
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
              { key: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
              {
                key: 'incidents',
                label: `Incidents (${stats.activeIncidents})`,
                icon: <AlertTriangle className="h-4 w-4" />,
              },
              { key: 'monitors', label: 'Monitors', icon: <MonitorIcon className="h-4 w-4" /> },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={`${
                  selectedView === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap`}
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
                <h2 className="mb-4 text-lg font-medium text-gray-900">Service Groups</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onClick={() => {
                        /* no-op: open group details drawer */
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Incidents */}
            {incidents.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-medium text-gray-900">Recent Incidents</h2>
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
  onRefresh,
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
        <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
          <Bell className="h-5 w-5" />
          Notification Providers ({notificationProviders.length})
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notificationProviders.map((provider) => (
            <div
              key={provider.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{provider.name}</h3>
                <div
                  className={`h-2 w-2 rounded-full ${
                    provider.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                  }`}
                />
              </div>
              <p className="text-xs tracking-wide text-gray-500 uppercase">{provider.type}</p>
              {provider.test_success !== undefined && (
                <p
                  className={`mt-2 text-xs ${
                    provider.test_success ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  Last test: {provider.test_success ? 'Success' : 'Failed'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
          <Tag className="h-5 w-5" />
          Monitor Tags ({tags.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium`}
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
        <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
          <Calendar className="h-5 w-5" />
          Maintenance Windows ({maintenanceWindows.length})
        </h2>
        <div className="space-y-3">
          {maintenanceWindows.map((window) => (
            <div
              key={window.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{window.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">{window.description}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(window.start_time).toLocaleString()} -{' '}
                    {new Date(window.end_time).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    window.status === 'active'
                      ? 'border border-blue-200 bg-blue-50 text-blue-600'
                      : window.status === 'scheduled'
                        ? 'border border-amber-200 bg-amber-50 text-amber-600'
                        : 'border border-gray-200 bg-gray-50 text-gray-600'
                  }`}
                >
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
function RealTimeStats({
  totalMonitors,
  activeIncidents,
  avgResponseTime,
  globalUptime,
}: RealTimeStatsProps): ReactElement {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <div className="rounded-lg bg-blue-50 p-2">
            <MonitorIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Total Monitors</p>
            <p className="text-xl font-semibold text-gray-900">{totalMonitors}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <div className={`rounded-lg p-2 ${activeIncidents > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
            {activeIncidents > 0 ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Active Incidents</p>
            <p
              className={`text-xl font-semibold ${activeIncidents > 0 ? 'text-red-600' : 'text-emerald-600'}`}
            >
              {activeIncidents}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <div className="rounded-lg bg-blue-50 p-2">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Avg Response</p>
            <p className="text-xl font-semibold text-gray-900">{Math.round(avgResponseTime)}ms</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center">
          <div className="rounded-lg bg-emerald-50 p-2">
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Global Uptime</p>
            <p className="text-xl font-semibold text-emerald-600">{globalUptime.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions({
  onAcknowledgeAll,
  onRefresh,
  onCreateIncident,
}: QuickActionsProps): ReactElement {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        title="Refresh data"
      >
        <RefreshCw className="h-4 w-4" />
      </button>

      <button
        onClick={onAcknowledgeAll}
        className="inline-flex items-center rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors duration-200 hover:bg-amber-100 focus:border-transparent focus:ring-2 focus:ring-amber-500"
      >
        <Bell className="mr-2 h-4 w-4" />
        Ack All
      </button>

      <button
        onClick={onCreateIncident}
        className="inline-flex items-center rounded-lg border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 focus:border-transparent focus:ring-2 focus:ring-red-500"
      >
        <Plus className="mr-2 h-4 w-4" />
        New Incident
      </button>
    </div>
  );
}

// Group Card Component
function GroupCard({
  group,
  onClick,
}: {
  group: MonitorGroup;
  onClick: (group: MonitorGroup) => void;
}): ReactElement {
  const statusColor = group.uptime_24h >= 99 ? 'emerald' : group.uptime_24h >= 95 ? 'amber' : 'red';

  return (
    <div
      onClick={() => onClick(group)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">{group.name}</h3>
        <div
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-${statusColor}-600 bg-${statusColor}-50 border border-${statusColor}-200`}
        >
          {group.uptime_24h.toFixed(1)}%
        </div>
      </div>
      <p className="mb-2 text-xs text-gray-500">{group.description}</p>
      <p className="text-xs text-gray-400">{group.monitors.length} monitors</p>
    </div>
  );
}

// Incident List Component
function IncidentList({
  incidents,
  onAcknowledge,
  onResolve,
  onInvestigate,
}: IncidentListProps): ReactElement {
  if (incidents.length === 0) {
    return (
      <div className="py-8 text-center">
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
function IncidentCard({
  incident,
  onAcknowledge,
  onResolve,
  onInvestigate,
}: IncidentCardProps): ReactElement {
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <div
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${SEVERITY_COLORS[incident.severity]}`}
            >
              {incident.severity.toUpperCase()}
            </div>
            <div
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                incident.status === 'open'
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : incident.status === 'acknowledged'
                    ? 'border-amber-200 bg-amber-50 text-amber-600'
                    : incident.status === 'investigating'
                      ? 'border-blue-200 bg-blue-50 text-blue-600'
                      : 'border-gray-200 bg-gray-50 text-gray-600'
              }`}
            >
              {incident.status.toUpperCase()}
            </div>
          </div>

          <h3 className="mb-1 text-sm font-medium text-gray-900">{incident.monitor_name}</h3>
          <p className="mb-2 text-sm text-gray-600">{incident.summary}</p>
          <p className="text-xs text-gray-500">Started {timeAgo(incident.started_at)}</p>
        </div>

        <div className="ml-4 flex items-center gap-2">
          {incident.status === 'open' && (
            <button
              onClick={() => onAcknowledge(incident.id)}
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition-colors duration-200 hover:bg-amber-100"
            >
              Acknowledge
            </button>
          )}

          {incident.status !== 'resolved' && (
            <>
              <button
                onClick={() => onInvestigate(incident.id)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-colors duration-200 hover:bg-blue-100"
              >
                Investigate
              </button>
              <button
                onClick={() => onResolve(incident.id)}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors duration-200 hover:bg-emerald-100"
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {monitors.map((monitor: Monitor) => (
        <MonitorStatusCard key={monitor.id} monitor={monitor} onClick={onMonitorClick} />
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
        icon: <XCircle className="h-4 w-4" />,
      };
    } else if (monitor.in_maintenance_window) {
      return {
        status: 'maintenance' as const,
        label: 'Maintenance',
        icon: <Clock className="h-4 w-4" />,
      };
    } else if (monitor.uptime_24h && monitor.uptime_24h >= 99) {
      return {
        status: 'up' as const,
        label: 'Operational',
        icon: <CheckCircle2 className="h-4 w-4" />,
      };
    } else if (monitor.uptime_24h && monitor.uptime_24h >= 95) {
      return {
        status: 'degraded' as const,
        label: 'Degraded',
        icon: <AlertTriangle className="h-4 w-4" />,
      };
    } else {
      return {
        status: 'down' as const,
        label: 'Down',
        icon: <XCircle className="h-4 w-4" />,
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      onClick={() => onClick(monitor)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-gray-900">{monitor.name}</h3>
          <p className="mt-1 text-xs text-gray-500">{monitor.type.toUpperCase()}</p>
          {monitor.tag_names && monitor.tag_names.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {monitor.tag_names.slice(0, 2).map((tagName, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
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
        <div
          className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${STATUS_COLORS[statusInfo.status]}`}
        >
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
            {monitor.avg_response_time_24h
              ? `${Math.round(monitor.avg_response_time_24h)}ms`
              : 'N/A'}
          </span>
        </div>
        {monitor.cert_days_remaining !== undefined && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Cert Expiry</span>
            <span
              className={`font-medium ${
                monitor.cert_days_remaining <= 7
                  ? 'text-red-600'
                  : monitor.cert_days_remaining <= 30
                    ? 'text-amber-600'
                    : 'text-gray-900'
              }`}
            >
              {monitor.cert_days_remaining}d
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
