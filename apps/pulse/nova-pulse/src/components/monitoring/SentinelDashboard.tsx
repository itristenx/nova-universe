import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BellIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
// import AlertCard from '../alerts/AlertCard'; // Currently unused
import SmartAlertButton from '../alerts/SmartAlertButton';
import { useAlertCosmo } from '../../hooks/useAlertCosmo';

interface Monitor {
  id: string;
  kuma_id: string;
  name: string;
  type: string;
  url?: string;
  hostname?: string;
  status: 'up' | 'down' | 'pending' | 'maintenance';
  uptime_24h: number;
  uptime_7d: number;
  uptime_30d: number;
  avg_response_time: number;
  last_check: string;
  alerts_enabled: boolean;
  public_status: boolean;
  active_incidents: number;
  tags: string[];
}

interface MonitoringIncident {
  id: string;
  monitor_id: string;
  monitor_name: string;
  ticket_id?: string;
  alert_id?: string;
  status: 'active' | 'acknowledged' | 'investigating' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  description: string;
  created_at: string;
  downtime_duration?: number;
  correlations?: {
    ticket?: any;
    alert?: any;
  };
}

interface SentinelDashboardProps {
  className?: string;
}

const SentinelDashboard: React.FC<SentinelDashboardProps> = ({ className = '' }) => {
  const queryClient = useQueryClient();
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const { analyzeTicket, isAnalyzing } = useAlertCosmo({
    onAlertCreated: (alert) => {
      console.log('Smart alert created from monitoring:', alert);
      queryClient.invalidateQueries({ queryKey: ['monitoring-incidents'] });
    },
  });

  // Fetch monitors
  const { data: monitors = [], isLoading: monitorsLoading } = useQuery({
    queryKey: ['monitoring-monitors', filterStatus, filterType],
    queryFn: async (): Promise<Monitor[]> => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);

      const response = await fetch(`/api/monitoring/monitors?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Failed to fetch monitors');
      const data = await response.json();
      return data.monitors;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch incidents
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['monitoring-incidents'],
    queryFn: async (): Promise<MonitoringIncident[]> => {
      const response = await fetch('/api/monitoring/incidents?status=active', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data = await response.json();
      return data.incidents;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (monitorData: any) => {
      const response = await fetch('/api/monitoring/monitor-incident', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(monitorData),
      });

      if (!response.ok) throw new Error('Failed to create incident');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'maintenance':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return CheckCircleIcon;
      case 'down':
        return ExclamationTriangleIcon;
      case 'pending':
        return ClockIcon;
      case 'maintenance':
        return Cog6ToothIcon;
      default:
        return ServerIcon;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatResponseTime = (time: number) => {
    return time > 1000 ? `${(time / 1000).toFixed(1)}s` : `${time}ms`;
  };

  const handleCreateIncident = async (monitor: Monitor) => {
    try {
      await createIncidentMutation.mutateAsync({
        monitorId: monitor.kuma_id,
        monitorName: monitor.name,
        status: 'down',
        errorMessage: 'Manual incident creation from Pulse dashboard',
        important: true,
      });
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };

  const handleSmartAnalysis = async (monitor: Monitor) => {
    const ticketData = {
      id: `monitor-${monitor.id}`,
      title: `Monitor Analysis: ${monitor.name}`,
      description: `Monitoring service: ${monitor.name}\nType: ${monitor.type}\nURL: ${monitor.url || monitor.hostname}\nStatus: ${monitor.status}\nUptime 24h: ${formatUptime(monitor.uptime_24h)}\nResponse Time: ${formatResponseTime(monitor.avg_response_time)}`,
      priority: monitor.status === 'down' ? 'high' : 'medium',
      category: 'infrastructure',
      customerTier: monitor.public_status ? 'vip' : 'standard',
      affectedUsers: monitor.public_status ? 100 : 1,
    };

    try {
      await analyzeTicket(ticketData);
    } catch (error) {
      console.error('Smart analysis failed:', error);
    }
  };

  const filteredMonitors = monitors.filter((monitor) => {
    if (filterStatus !== 'all' && monitor.status !== filterStatus) return false;
    if (filterType !== 'all' && monitor.type !== filterType) return false;
    return true;
  });

  const monitorTypes = [...new Set(monitors.map((m) => m.type))];
  const isLoading = monitorsLoading || incidentsLoading;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Sentinel</h1>
          <p className="mt-1 text-gray-600">Infrastructure monitoring and intelligent alerting</p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['monitoring-monitors'] });
              queryClient.invalidateQueries({ queryKey: ['monitoring-incidents'] });
            }}
            className="rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
            title="Refresh data"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>

          <div className="flex items-center rounded-lg bg-gray-100 p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 transition-colors duration-200 ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <ChartBarIcon className="h-4 w-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`rounded-md p-2 transition-colors duration-200 ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <ServerIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 rounded-xl border border-gray-200/50 bg-white/80 p-4 backdrop-blur-xl">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="pending">Pending</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            {monitorTypes.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          {filteredMonitors.length} of {monitors.length} monitors
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {monitors.filter((m) => m.status === 'up').length}
              </p>
              <p className="text-sm text-gray-600">Services Up</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-red-100 p-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {monitors.filter((m) => m.status === 'down').length}
              </p>
              <p className="text-sm text-gray-600">Services Down</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <BellIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
              <p className="text-sm text-gray-600">Active Incidents</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {monitors.length > 0
                  ? (monitors.reduce((acc, m) => acc + m.uptime_24h, 0) / monitors.length).toFixed(
                      1,
                    )
                  : '0'}
                %
              </p>
              <p className="text-sm text-gray-600">Avg Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monitors */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Service Monitors</h2>
              <span className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredMonitors.map((monitor) => {
                  const StatusIcon = getStatusIcon(monitor.status);
                  return (
                    <motion.div
                      key={monitor.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`rounded-lg border p-2 ${getStatusColor(monitor.status)}`}
                          >
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{monitor.name}</h3>
                            <p className="text-sm text-gray-600">{monitor.type.toUpperCase()}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedMonitor(monitor)}
                            className="rounded p-1 text-gray-400 hover:text-blue-600"
                            title="View details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </motion.button>

                          <SmartAlertButton
                            ticketData={{
                              id: `monitor-${monitor.id}`,
                              title: `Monitor: ${monitor.name}`,
                              description: `Service monitoring for ${monitor.name}`,
                              priority: monitor.status === 'down' ? 'high' : 'medium',
                              category: 'infrastructure',
                              customerTier: monitor.public_status ? 'vip' : 'standard',
                              affectedUsers: monitor.public_status ? 100 : 1,
                            }}
                            className="scale-75"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">24h Uptime:</span>
                          <span className="font-medium">{formatUptime(monitor.uptime_24h)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Response:</span>
                          <span className="font-medium">
                            {formatResponseTime(monitor.avg_response_time)}
                          </span>
                        </div>
                        {monitor.active_incidents > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-red-600">Incidents:</span>
                            <span className="font-medium text-red-600">
                              {monitor.active_incidents}
                            </span>
                          </div>
                        )}
                      </div>

                      {monitor.url && (
                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <p className="truncate text-xs text-gray-500" title={monitor.url}>
                            {monitor.url}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMonitors.map((monitor) => {
                  const StatusIcon = getStatusIcon(monitor.status);
                  return (
                    <motion.div
                      key={monitor.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`rounded-md p-1.5 ${getStatusColor(monitor.status)}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{monitor.name}</h4>
                          <p className="text-sm text-gray-600">
                            {monitor.type} • {formatUptime(monitor.uptime_24h)} uptime
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          {formatResponseTime(monitor.avg_response_time)}
                        </span>
                        <SmartAlertButton
                          ticketData={{
                            id: `monitor-${monitor.id}`,
                            title: `Monitor: ${monitor.name}`,
                            description: `Service monitoring for ${monitor.name}`,
                            priority: monitor.status === 'down' ? 'high' : 'medium',
                            category: 'infrastructure',
                            customerTier: monitor.public_status ? 'vip' : 'standard',
                            affectedUsers: monitor.public_status ? 100 : 1,
                          }}
                          className="scale-75"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {filteredMonitors.length === 0 && !isLoading && (
              <div className="py-12 text-center">
                <ServerIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">No monitors match your current filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Incidents Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Active Incidents</h3>

            <div className="space-y-3">
              {incidents.map((incident) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg border p-4 ${getSeverityColor(incident.severity)}`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-sm font-medium">{incident.monitor_name}</h4>
                    <span className="rounded bg-white/50 px-2 py-1 text-xs">
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>

                  <p className="mb-3 text-xs">{incident.summary}</p>

                  <div className="flex items-center justify-between text-xs">
                    <span>{new Date(incident.created_at).toLocaleTimeString()}</span>
                    <div className="flex items-center space-x-2">
                      {incident.ticket_id && (
                        <span className="rounded bg-blue-100 px-1 py-0.5 text-blue-700">
                          Ticket
                        </span>
                      )}
                      {incident.alert_id && (
                        <span className="rounded bg-orange-100 px-1 py-0.5 text-orange-700">
                          Alert
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {incidents.length === 0 && (
                <div className="py-8 text-center">
                  <CheckCircleIcon className="mx-auto mb-2 h-8 w-8 text-green-500" />
                  <p className="text-sm text-gray-600">No active incidents</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentinelDashboard;
