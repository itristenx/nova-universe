import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  BellIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface ServiceStatus {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'degraded' | 'major_outage' | 'maintenance';
  uptime_24h: number;
  uptime_7d: number;
  uptime_30d: number;
  avg_response_time: number;
  last_check: string;
  description?: string;
}

interface StatusIncident {
  id: string;
  monitor_name: string;
  status: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  started_at: string;
  acknowledged_at?: string;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduled_start: string;
  scheduled_end: string;
  affected_services: string[];
}

interface StatusPageConfig {
  title: string;
  description: string;
  logo_url?: string;
  show_uptime_percentages: boolean;
  show_incident_history_days: number;
  show_maintenance_windows: boolean;
}

interface ServiceStatusPageProps {
  tenantId: string;
  className?: string;
}

const ServiceStatusPage: React.FC<ServiceStatusPageProps> = ({ tenantId, className = '' }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Fetch status page data
  const {
    data: statusData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['status-page', tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/v2/monitoring/status/${tenantId}`);
      if (!response.ok) throw new Error('Failed to fetch status page data');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  const config: StatusPageConfig = statusData?.config || {
    title: 'Service Status',
    description: 'Current status of our services',
    show_uptime_percentages: true,
    show_incident_history_days: 30,
    show_maintenance_windows: true,
  };

  const services: ServiceStatus[] = statusData?.services || [];
  const incidents: StatusIncident[] = statusData?.active_incidents || [];
  const maintenanceWindows: MaintenanceWindow[] = statusData?.maintenance_windows || [];
  const overallStatus: string = statusData?.overall_status || 'operational';

  const getOverallStatusConfig = (status: string) => {
    switch (status) {
      case 'operational':
        return {
          text: 'All Systems Operational',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CheckCircleIcon,
        };
      case 'degraded':
        return {
          text: 'Partial System Outage',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: ExclamationTriangleIcon,
        };
      case 'major_outage':
        return {
          text: 'Major System Outage',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: ExclamationTriangleIcon,
        };
      case 'maintenance':
        return {
          text: 'System Maintenance',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: Cog6ToothIcon,
        };
      default:
        return {
          text: 'Status Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: InformationCircleIcon,
        };
    }
  };

  const getServiceStatusConfig = (status: string) => {
    switch (status) {
      case 'operational':
        return {
          text: 'Operational',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircleIcon,
        };
      case 'degraded':
        return {
          text: 'Degraded',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: ExclamationTriangleIcon,
        };
      case 'major_outage':
        return {
          text: 'Outage',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: ExclamationTriangleIcon,
        };
      case 'maintenance':
        return {
          text: 'Maintenance',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: Cog6ToothIcon,
        };
      default:
        return {
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: ClockIcon,
        };
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' };
      case 'high':
        return {
          color: 'text-orange-700',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-300',
        };
      case 'medium':
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-300',
        };
      case 'low':
        return { color: 'text-blue-700', bgColor: 'bg-blue-100', borderColor: 'border-blue-300' };
      default:
        return { color: 'text-gray-700', bgColor: 'bg-gray-100', borderColor: 'border-gray-300' };
    }
  };

  const getUptimeForTimeframe = (service: ServiceStatus) => {
    switch (selectedTimeframe) {
      case '24h':
        return service.uptime_24h;
      case '7d':
        return service.uptime_7d;
      case '30d':
        return service.uptime_30d;
      default:
        return service.uptime_24h;
    }
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const formatResponseTime = (time: number) => {
    return time > 1000 ? `${(time / 1000).toFixed(1)}s` : `${time}ms`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const overallStatusConfig = getOverallStatusConfig(overallStatus);
  const OverallStatusIcon = overallStatusConfig.icon;

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 backdrop-blur-xl">
          <div className="space-y-6">
            <div className="h-8 w-1/3 rounded bg-gray-200"></div>
            <div className="h-4 w-2/3 rounded bg-gray-200"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="rounded-2xl border border-red-200/50 bg-white/80 p-8 backdrop-blur-xl">
          <div className="text-center">
            <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Failed to Load Status</h3>
            <p className="mb-4 text-gray-600">Unable to fetch current service status.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-8 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
            <p className="mt-2 text-gray-600">{config.description}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => refetch()}
            className="rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
            title="Refresh status"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center space-x-4 rounded-xl border p-6 ${overallStatusConfig.bgColor} ${overallStatusConfig.borderColor}`}
        >
          <OverallStatusIcon className={`h-8 w-8 ${overallStatusConfig.color}`} />
          <div>
            <h2 className={`text-xl font-semibold ${overallStatusConfig.color}`}>
              {overallStatusConfig.text}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Last updated: {formatDate(statusData?.last_updated || new Date().toISOString())}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Active Incidents */}
      <AnimatePresence>
        {incidents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-orange-200/50 bg-white/80 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Active Incidents</h3>
            </div>

            <div className="space-y-4">
              {incidents.map((incident, index) => {
                const severityConfig = getSeverityConfig(incident.severity);
                return (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-lg border p-4 ${severityConfig.bgColor} ${severityConfig.borderColor}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-medium ${severityConfig.color}`}>
                          {incident.monitor_name} - {incident.summary}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          Started: {formatDate(incident.started_at)}
                        </p>
                        {incident.acknowledged_at && (
                          <p className="text-sm text-gray-600">
                            Acknowledged: {formatDate(incident.acknowledged_at)}
                          </p>
                        )}
                      </div>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${severityConfig.bgColor} ${severityConfig.color}`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Windows */}
      <AnimatePresence>
        {config.show_maintenance_windows && maintenanceWindows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-blue-200/50 bg-white/80 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center space-x-3">
              <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Maintenance</h3>
            </div>

            <div className="space-y-4">
              {maintenanceWindows.map((maintenance, index) => (
                <motion.div
                  key={maintenance.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">{maintenance.title}</h4>
                      <p className="mt-1 text-sm text-blue-700">{maintenance.description}</p>
                      <p className="mt-2 text-sm text-blue-600">
                        Scheduled: {formatDate(maintenance.scheduled_start)} -{' '}
                        {formatDate(maintenance.scheduled_end)}
                      </p>
                    </div>
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {maintenance.status.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services Status */}
      <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>

          {config.show_uptime_percentages && (
            <div className="flex items-center rounded-lg bg-gray-100 p-1">
              {(['24h', '7d', '30d'] as const).map((timeframe) => (
                <motion.button
                  key={timeframe}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`rounded-md px-3 py-1 text-sm transition-colors duration-200 ${
                    selectedTimeframe === timeframe
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {timeframe}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {services.map((service, index) => {
            const statusConfig = getServiceStatusConfig(service.status);
            const StatusIcon = statusConfig.icon;
            const uptime = getUptimeForTimeframe(service);

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <div className={`rounded-lg p-2 ${statusConfig.bgColor}`}>
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600">
                      {service.description || `${service.type.toUpperCase()} service`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {config.show_uptime_percentages && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatUptime(uptime)}</p>
                      <p className="text-xs text-gray-600">uptime</p>
                    </div>
                  )}

                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatResponseTime(service.avg_response_time)}
                    </p>
                    <p className="text-xs text-gray-600">response</p>
                  </div>

                  <div
                    className={`rounded-full px-3 py-1 text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                  >
                    {statusConfig.text}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {services.length === 0 && (
          <div className="py-12 text-center">
            <ChartBarIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No services configured for monitoring</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-sm text-gray-500">
        <p>
          Status page powered by Nova Sentinel • Last updated:{' '}
          {formatDate(statusData?.last_updated || new Date().toISOString())}
        </p>
      </div>
    </div>
  );
};

export default ServiceStatusPage;
