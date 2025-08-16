import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  PlusIcon,
  StarIcon,
  EyeIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  WrenchScrewdriverIcon,
  GlobeAltIcon,
  FireIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Monitor {
  id: string;
  name: string;
  type: string;
  status: 'up' | 'down';
  uptime: number;
  responseTime?: number;
  lastHeartbeat?: string;
  errorMessage?: string;
  userPreferences: {
    favorite: boolean;
    customName?: string;
    lastViewed?: string;
  };
  config: {
    url?: string;
    interval?: number;
    timeout?: number;
  };
}

interface StatusPage {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  stats: {
    totalMonitors: number;
    upMonitors: number;
    downMonitors: number;
    overallUptime: number;
  };
  userPreferences: {
    favorite: boolean;
    lastViewed?: string;
  };
}

interface Maintenance {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  affectedMonitors: string[];
  monitorDetails?: Array<{
    name: string;
    type: string;
  }>;
}

interface SystemStats {
  monitors: {
    total: number;
    up: number;
    down: number;
    unknown: number;
  };
  statusPages: number;
  recentHeartbeats: number;
  subscribers: number;
  recentEvents: number;
  timestamp: string;
}

const NovaSentinelDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'monitors' | 'status-pages' | 'maintenance' | 'analytics'>('monitors');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const base = window.location.origin.replace(/^http/, 'ws');
    const ws = new WebSocket(`${base}/ws/monitoring`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'authenticate', token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'heartbeat':
        case 'monitor_updated':
        case 'monitor_created':
        case 'monitor_deleted':
          queryClient.invalidateQueries({ queryKey: ['sentinel-monitors'] });
          queryClient.invalidateQueries({ queryKey: ['sentinel-stats'] });
          break;
        case 'maintenance_scheduled':
        case 'maintenance_updated':
        case 'maintenance_started':
        case 'maintenance_completed':
          queryClient.invalidateQueries({ queryKey: ['sentinel-maintenance'] });
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, [queryClient]);

  // Fetch system statistics
  const { data: systemStats } = useQuery({
    queryKey: ['sentinel-stats'],
    queryFn: async (): Promise<SystemStats> => {
      const response = await fetch('/api/v2/monitoring/analytics/system', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch system stats');
      const data = await response.json();
      return data.analytics;
    },
    refetchInterval: 30000
  });

  // Fetch monitors
  const { data: monitors = [], isLoading: monitorsLoading } = useQuery({
    queryKey: ['sentinel-monitors', filterStatus, filterType, searchTerm],
    queryFn: async (): Promise<Monitor[]> => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/v2/monitoring/monitors?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch monitors');
      const data = await response.json();
      return data.monitors;
    },
    refetchInterval: 30000
  });

  // Fetch status pages
  const { data: statusPages = [] } = useQuery({
    queryKey: ['sentinel-status-pages'],
    queryFn: async (): Promise<StatusPage[]> => {
      const response = await fetch('/api/v2/monitoring/status-pages', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch status pages');
      const data = await response.json();
      return data.statusPages;
    },
    enabled: activeTab === 'status-pages'
  });

  // Fetch maintenance windows
  const { data: maintenance = [] } = useQuery({
    queryKey: ['sentinel-maintenance'],
    queryFn: async (): Promise<Maintenance[]> => {
      const response = await fetch('/api/v2/monitoring/maintenance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch maintenance');
      const data = await response.json();
      return data.maintenance;
    },
    enabled: activeTab === 'maintenance'
  });

  // Toggle monitor pause/resume
  const toggleMonitorMutation = useMutation({
    mutationFn: async ({ monitorId, action }: { monitorId: string; action: 'pause' | 'resume' }) => {
      const response = await fetch(`/api/v2/monitoring/monitors/${monitorId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error(`Failed to ${action} monitor`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentinel-monitors'] });
    }
  });

  // Toggle favorite monitor
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ monitorId, favorite }: { monitorId: string; favorite: boolean }) => {
      const endpoint = favorite ? 'favorite' : 'unfavorite';
      const response = await fetch(`/api/v2/monitoring/monitors/${monitorId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to update favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentinel-monitors'] });
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'down':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMonitorTypeIcon = (type: string) => {
    switch (type) {
      case 'http':
      case 'https':
        return <GlobeAltIcon className="w-4 h-4" />;
      case 'port':
      case 'tcp':
        return <ServerIcon className="w-4 h-4" />;
      case 'ping':
        return <ShieldCheckIcon className="w-4 h-4" />;
      case 'dns':
        return <FireIcon className="w-4 h-4" />;
      default:
        return <ServerIcon className="w-4 h-4" />;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const tabs = [
    { id: 'monitors', name: 'Monitors', icon: ServerIcon, count: monitors.length },
    { id: 'status-pages', name: 'Status Pages', icon: GlobeAltIcon, count: statusPages.length },
    { id: 'maintenance', name: 'Maintenance', icon: WrenchScrewdriverIcon, count: maintenance.filter(m => m.status !== 'completed').length },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, count: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Sentinel</h1>
          <p className="text-gray-600 mt-1">
            Complete monitoring and status management
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['sentinel-monitors'] });
              queryClient.invalidateQueries({ queryKey: ['sentinel-stats'] });
            }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Refresh data"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* System Stats */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStats.monitors.up}</p>
                <p className="text-sm text-gray-600">Monitors Up</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStats.monitors.down}</p>
                <p className="text-sm text-gray-600">Monitors Down</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <GlobeAltIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStats.statusPages}</p>
                <p className="text-sm text-gray-600">Status Pages</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BellIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{systemStats.recentEvents}</p>
                <p className="text-sm text-gray-600">Recent Events</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl">
        <AnimatePresence mode="wait">
          {activeTab === 'monitors' && (
            <motion.div
              key="monitors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Monitor Management</h2>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Search monitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="Filter by monitor type"
                  >
                    <option value="all">All Types</option>
                    <option value="http">HTTP</option>
                    <option value="port">Port</option>
                    <option value="ping">Ping</option>
                    <option value="dns">DNS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {monitors.map((monitor) => (
                  <motion.div
                    key={monitor.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border rounded-xl ${getStatusColor(monitor.status)} hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(monitor.status)}
                        <div className="flex items-center space-x-2">
                          {getMonitorTypeIcon(monitor.type)}
                          <span className="text-xs text-gray-500 uppercase tracking-wide">{monitor.type}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">
                              {monitor.userPreferences.customName || monitor.name}
                            </h3>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleFavoriteMutation.mutate({
                                monitorId: monitor.id,
                                favorite: !monitor.userPreferences.favorite
                              })}
                              className="text-gray-400 hover:text-yellow-500"
                            >
                              {monitor.userPreferences.favorite ? (
                                <StarIconSolid className="w-4 h-4 text-yellow-500" />
                              ) : (
                                <StarIcon className="w-4 h-4" />
                              )}
                            </motion.button>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Uptime: {formatUptime(monitor.uptime)}</span>
                            {monitor.responseTime && <span>Response: {monitor.responseTime}ms</span>}
                            <span>Last seen: {formatLastSeen(monitor.lastHeartbeat)}</span>
                          </div>
                          {monitor.config.url && (
                            <p className="text-xs text-gray-500 mt-1">{monitor.config.url}</p>
                          )}
                          {monitor.errorMessage && (
                            <p className="text-xs text-red-600 mt-1">{monitor.errorMessage}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMonitor(monitor)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          <EyeIcon className="w-4 h-4 inline mr-1" />
                          View
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleMonitorMutation.mutate({
                            monitorId: monitor.id,
                            action: monitor.status === 'up' ? 'pause' : 'resume'
                          })}
                          disabled={toggleMonitorMutation.isPending}
                          className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50"
                        >
                          {monitor.status === 'up' ? (
                            <><PauseIcon className="w-4 h-4 inline mr-1" />Pause</>
                          ) : (
                            <><PlayIcon className="w-4 h-4 inline mr-1" />Resume</>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {monitors.length === 0 && !monitorsLoading && (
                  <div className="text-center py-12">
                    <ServerIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No monitors found matching your criteria</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'status-pages' && (
            <motion.div
              key="status-pages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Status Pages</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 inline mr-2" />
                  Create Status Page
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statusPages.map((statusPage) => (
                  <motion.div
                    key={statusPage.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <GlobeAltIcon className="w-5 h-5 text-blue-600" />
                        <h3 className="font-medium text-gray-900">{statusPage.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          statusPage.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {statusPage.published ? 'Published' : 'Draft'}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-gray-400 hover:text-yellow-500"
                        >
                          {statusPage.userPreferences.favorite ? (
                            <StarIconSolid className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <StarIcon className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Monitors:</span>
                        <span>{statusPage.stats.totalMonitors}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span>{formatUptime(statusPage.stats.overallUptime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={statusPage.stats.downMonitors > 0 ? 'text-red-600' : 'text-green-600'}>
                          {statusPage.stats.downMonitors > 0 ? 'Issues Detected' : 'All Operational'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                        >
                          <EyeIcon className="w-4 h-4 inline mr-1" />
                          View
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          <CogIcon className="w-4 h-4 inline mr-1" />
                          Config
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'maintenance' && (
            <motion.div
              key="maintenance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Maintenance Windows</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 inline mr-2" />
                  Schedule Maintenance
                </motion.button>
              </div>

              <div className="space-y-4">
                {maintenance.map((maint) => (
                  <motion.div
                    key={maint.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <WrenchScrewdriverIcon className="w-5 h-5 text-orange-600 mt-1" />
                        <div>
                          <h3 className="font-medium text-gray-900">{maint.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{maint.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span>Start: {new Date(maint.startTime).toLocaleString()}</span>
                            <span>End: {new Date(maint.endTime).toLocaleString()}</span>
                            <span className={`px-2 py-1 rounded text-white ${
                              maint.status === 'active' ? 'bg-orange-500' :
                              maint.status === 'completed' ? 'bg-green-500' :
                              maint.status === 'cancelled' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}>
                              {maint.status.toUpperCase()}
                            </span>
                          </div>
                          {maint.monitorDetails && maint.monitorDetails.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Affected monitors: </span>
                              <span className="text-xs text-gray-700">
                                {maint.monitorDetails.map(m => m.name).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {maint.status === 'scheduled' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700"
                            >
                              Start Now
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
                            >
                              Cancel
                            </motion.button>
                          </>
                        )}
                        {maint.status === 'active' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            Complete
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          <EyeIcon className="w-4 h-4 inline mr-1" />
                          Details
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {maintenance.length === 0 && (
                  <div className="text-center py-12">
                    <WrenchScrewdriverIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No maintenance windows scheduled</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Analytics</h2>
              <div className="text-center py-12">
                <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No analytics available yet. Connect data sources or view Monitors.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Monitor Details Modal */}
      <AnimatePresence>
        {selectedMonitor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedMonitor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Monitor Details</h3>
                <button
                  onClick={() => setSelectedMonitor(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedMonitor.status)}
                  <div>
                    <h4 className="font-medium">{selectedMonitor.name}</h4>
                    <p className="text-sm text-gray-600">Type: {selectedMonitor.type}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedMonitor.status)}`}>
                      {selectedMonitor.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Uptime:</span>
                    <span className="ml-2 font-medium">{formatUptime(selectedMonitor.uptime)}</span>
                  </div>
                  {selectedMonitor.responseTime && (
                    <div>
                      <span className="text-gray-600">Response Time:</span>
                      <span className="ml-2 font-medium">{selectedMonitor.responseTime}ms</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Last Heartbeat:</span>
                    <span className="ml-2">{formatLastSeen(selectedMonitor.lastHeartbeat)}</span>
                  </div>
                </div>
                
                {selectedMonitor.config.url && (
                  <div>
                    <span className="text-gray-600 text-sm">URL:</span>
                    <p className="mt-1 p-2 bg-gray-50 rounded text-sm break-all">{selectedMonitor.config.url}</p>
                  </div>
                )}
                
                {selectedMonitor.errorMessage && (
                  <div>
                    <span className="text-gray-600 text-sm">Last Error:</span>
                    <p className="mt-1 p-2 bg-red-50 text-red-800 rounded text-sm">{selectedMonitor.errorMessage}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NovaSentinelDashboard;
