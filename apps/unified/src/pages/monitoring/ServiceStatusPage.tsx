import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ServerIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

// Types
interface ServiceStatus {
  id: string;
  name: string;
  description: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'under_maintenance';
  category: string;
  icon: React.ReactNode;
  lastUpdated: string;
  uptime: number;
  responseTime: number;
  incidents: number;
  details?: string;
}

interface SystemMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  description: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedServices: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  affectedServices: string[];
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  impact: 'no_impact' | 'minimal' | 'partial' | 'full';
}

export default function ServiceStatusPage() {
  const { t } = useTranslation('serviceStatus');
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  useEffect(() => {
    loadStatusData();
    setLastRefresh(new Date().toLocaleString());

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadStatusData();
      setLastRefresh(new Date().toLocaleString());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadStatusData = async () => {
    setLoading(true);

    try {
      // Fetch from API
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
        setMetrics(data.metrics || []);
        setIncidents(data.incidents || []);
        setMaintenance(data.maintenance || []);
      } else {
        // Fallback to empty state if API fails
        setServices([]);
        setMetrics([]);
        setIncidents([]);
        setMaintenance([]);
      }
    } catch (_error) {
      console.warn('Service status API unavailable, using fallback data:', error);
      // Fallback to empty state
      setServices([]);
      setMetrics([]);
      setIncidents([]);
      setMaintenance([]);
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'partial_outage':
        return 'text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
      case 'major_outage':
        return 'text-red-600 bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      case 'under_maintenance':
        return 'text-blue-600 bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'partial_outage':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'major_outage':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'under_maintenance':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const overallStatus = services.every((s) => s.status === 'operational')
    ? 'operational'
    : services.some((s) => s.status === 'major_outage')
      ? 'major_outage'
      : services.some((s) => s.status === 'partial_outage')
        ? 'partial_outage'
        : 'degraded';

  if (loading && services.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={`relative overflow-hidden rounded-xl px-6 py-8 text-white ${
          overallStatus === 'operational'
            ? 'bg-gradient-to-r from-green-600 to-blue-600'
            : overallStatus === 'major_outage'
              ? 'bg-gradient-to-r from-red-600 to-red-700'
              : 'bg-gradient-to-r from-yellow-600 to-orange-600'
        }`}
      >
        <div className="relative z-10">
          <div className="mb-2 flex items-center space-x-3">
            {getStatusIcon(overallStatus)}
            <h1 className="text-3xl font-bold">System Status</h1>
          </div>
          <p className="text-blue-100">
            {overallStatus === 'operational'
              ? t('serviceStatus:allSystemsOperational')
              : overallStatus === 'major_outage'
                ? t('serviceStatus:someServicesIssues')
                : t('serviceStatus:minorIssuesDetected')}
          </p>
          <p className="mt-2 text-sm text-blue-200">
            {t('serviceStatus:lastUpdated', { time: lastRefresh })}
          </p>
        </div>
        <div className="absolute top-4 right-4 opacity-20">
          <ServerIcon className="h-24 w-24" />
        </div>
      </div>

      {/* System Metrics */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('serviceStatus:systemMetrics')}
          </h2>
          <button
            onClick={() => loadStatusData()}
            disabled={loading}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <ArrowPathIcon className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('serviceStatus:refresh')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="text-center">
              <div
                className={`mx-auto mb-2 rounded-lg p-3 ${getMetricColor(metric.status)} bg-gray-100 dark:bg-gray-700`}
              >
                {metric.icon}
              </div>
              <div className={`text-2xl font-bold ${getMetricColor(metric.status)}`}>
                {metric.value}
                {metric.unit}
              </div>
              <div className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                {metric.name}
              </div>
              <div className="text-xs text-gray-500">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Incidents */}
      {incidents.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('serviceStatus:activeIncidents')}
          </h2>

          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{incident.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {incident.description}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${getSeverityColor(incident.severity)}`}
                    >
                      {t(`serviceStatus:severity.${incident.severity}`)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {t(`serviceStatus:status.${incident.status}`)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    {t('serviceStatus:affected')}: {incident.affectedServices.join(', ')}
                  </div>
                  <div>
                    {t('serviceStatus:started')}: {incident.createdAt} •{' '}
                    {t('serviceStatus:updated')}: {incident.updatedAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Maintenance */}
      {maintenance.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {t('serviceStatus:scheduledMaintenance')}
          </h2>

          <div className="space-y-4">
            {maintenance.map((window) => (
              <div
                key={window.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{window.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {window.description}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        window.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          : window.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {t(`serviceStatus:status.${window.status}`)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    {t('serviceStatus:affected')}: {window.affectedServices.join(', ')}
                  </div>
                  <div>
                    {window.startTime} - {window.endTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          {t('serviceStatus:serviceDetails')}
        </h2>

        <div className="space-y-4">
          {Object.entries(
            services.reduce(
              (acc, service) => {
                if (!acc[service.category]) acc[service.category] = [];
                acc[service.category]!.push(service);
                return acc;
              },
              {} as Record<string, ServiceStatus[]>,
            ),
          ).map(([category, categoryServices]) => (
            <div key={category}>
              <h3 className="mb-3 border-b border-gray-200 pb-2 font-medium text-gray-900 dark:border-gray-700 dark:text-white">
                {t(`serviceStatus:categories.${category.toLowerCase().replace(/\s+/g, '')}`)}
              </h3>

              <div className="space-y-3">
                {categoryServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
                        {service.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {service.description}
                        </p>
                        {service.details && (
                          <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                            {service.details}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {service.uptime}%
                        </div>
                        <div className="text-gray-500">{t('serviceStatus:uptime')}</div>
                      </div>

                      <div className="text-center">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {service.responseTime}ms
                        </div>
                        <div className="text-gray-500">{t('serviceStatus:response')}</div>
                      </div>

                      <div
                        className={`rounded-lg border px-3 py-2 ${getStatusColor(service.status)} flex items-center space-x-2`}
                      >
                        {getStatusIcon(service.status)}
                        <span className="font-medium capitalize">
                          {t(`serviceStatus:status.${service.status}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
