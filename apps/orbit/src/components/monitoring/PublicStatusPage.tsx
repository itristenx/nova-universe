import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, Calendar, ExternalLink } from 'lucide-react';
import {
  StatusPageResponse,
  IncidentHistoryResponse,
  StatusPageProps,
  ServiceListProps,
  ServiceCardProps,
  ServiceGroupProps,
  IncidentBannerProps,
  IncidentListProps,
  IncidentCardProps,
  MaintenanceBannerProps,
  OverallStatusProps,
  StatusIndicatorProps,
  PublicIncident,
} from '../../types/monitoring';

// Apple-inspired status colors with high contrast
const STATUS_COLORS = {
  operational: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  degraded: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    dot: 'bg-amber-500',
  },
  major_outage: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: 'text-red-600',
    dot: 'bg-red-500',
  },
  maintenance: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    dot: 'bg-blue-500',
  },
} as const;

const SEVERITY_COLORS = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
} as const;

export default function PublicStatusPage({ tenant, embedded = false }: StatusPageProps) {
  const [data, setData] = useState<StatusPageResponse | null>(null);
  const [incidentHistory, setIncidentHistory] = useState<PublicIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchStatusPage = useCallback(async () => {
    try {
      const url = tenant ? `/api/v2/monitoring/status/${tenant}` : '/api/v2/monitoring/status';
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }

      const statusData: StatusPageResponse = await response.json();
      setData(statusData);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch status page:', error);
      setError('Unable to load status information');
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  const fetchIncidentHistory = useCallback(async () => {
    try {
      const url = tenant
        ? `/api/v2/monitoring/incidents/history/${tenant}?limit=20`
        : '/api/v2/monitoring/incidents/history?limit=20';
      const response = await fetch(url);

      if (response.ok) {
        const historyData: IncidentHistoryResponse = await response.json();
        setIncidentHistory(historyData.incidents);
      }
    } catch (error) {
      console.error('Failed to fetch incident history:', error);
    }
  }, [tenant]);

  useEffect(() => {
    fetchStatusPage();
    fetchIncidentHistory();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatusPage, 30000);
    return () => clearInterval(interval);
  }, [fetchStatusPage, fetchIncidentHistory]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Loading status...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="mb-2 text-xl font-semibold text-gray-900">Status Page Unavailable</h1>
          <p className="text-gray-600">{error || 'Unable to load status information'}</p>
          <button
            onClick={fetchStatusPage}
            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const containerClass = embedded ? 'max-w-4xl mx-auto p-4' : 'min-h-screen bg-gray-50';

  return (
    <div className={containerClass}>
      {!embedded && (
        <>
          {/* Header */}
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-4xl px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {data.config.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.config.logo_url} alt="Logo" className="mr-3 h-8 w-auto" />
                  )}
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{data.config.title}</h1>
                    {data.config.description && (
                      <p className="mt-1 text-gray-600">{data.config.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {data.config.support_url && (
                    <a
                      href={data.config.support_url}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Support
                    </a>
                  )}
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {showHistory ? 'Current Status' : 'Incident History'}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Major Incident Banner */}
          {data.active_incidents.some((i) => i.severity === 'critical') && (
            <IncidentBanner
              incidents={data.active_incidents.filter((i) => i.severity === 'critical')}
            />
          )}

          {/* Maintenance Banner */}
          {data.maintenance_windows.length > 0 && (
            <MaintenanceBanner maintenance={data.maintenance_windows} />
          )}
        </>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {!showHistory ? (
          <>
            {/* Overall Status */}
            <OverallStatus status={data.overall_status} lastUpdated={data.last_updated} />

            {/* Services */}
            <div className="mt-8">
              <ServiceList
                services={data.services}
                groups={data.groups}
                showUptime={data.config.show_uptime_percentages}
              />
            </div>

            {/* Recent Incidents */}
            {data.active_incidents.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Incidents</h2>
                <IncidentList incidents={data.active_incidents} maxItems={5} />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Incident History */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Incident History</h2>
              <p className="mt-1 text-gray-600">Past incidents and service disruptions</p>
            </div>

            <IncidentList incidents={incidentHistory} showHistory={true} />
          </>
        )}

        {/* Footer */}
        {!embedded && (
          <footer className="mt-16 border-t border-gray-200 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-500">
                {data.config.footer_text || `© ${new Date().getFullYear()} Status Page`}
              </div>
              <div className="mt-4 flex items-center gap-4 sm:mt-0">
                {data.config.twitter_username && (
                  <a
                    href={`https://twitter.com/${data.config.twitter_username}`}
                    className="text-sm text-gray-500 hover:text-gray-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{data.config.twitter_username}
                  </a>
                )}
                <span className="text-xs text-gray-400">Powered by Nova Sentinel</span>
              </div>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

// Overall Status Component
function OverallStatus({ status, lastUpdated }: OverallStatusProps) {
  const statusInfo = {
    operational: {
      title: 'All Systems Operational',
      description: 'All services are running normally',
      icon: <CheckCircle2 className="h-6 w-6" />,
    },
    degraded: {
      title: 'Degraded Performance',
      description: 'Some services are experiencing issues',
      icon: <AlertTriangle className="h-6 w-6" />,
    },
    major_outage: {
      title: 'Major Service Outage',
      description: 'Multiple services are currently unavailable',
      icon: <XCircle className="h-6 w-6" />,
    },
    maintenance: {
      title: 'Scheduled Maintenance',
      description: 'Some services may be temporarily unavailable',
      icon: <Clock className="h-6 w-6" />,
    },
  };

  const info = statusInfo[status];
  const colors = STATUS_COLORS[status];

  return (
    <div className={`${colors.bg} ${colors.border} rounded-xl border p-6`}>
      <div className="flex items-center">
        <div className={`${colors.icon} mr-4`}>{info.icon}</div>
        <div className="flex-1">
          <h2 className={`text-xl font-semibold ${colors.text}`}>{info.title}</h2>
          <p className={`${colors.text} mt-1 opacity-80`}>{info.description}</p>
        </div>
        <div className="text-right">
          <p className={`text-sm ${colors.text} opacity-60`}>Last updated</p>
          <p className={`text-sm font-medium ${colors.text}`}>
            {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

// Service List Component
function ServiceList({ services, groups, showUptime = true }: ServiceListProps) {
  if (groups.length > 0) {
    return (
      <div className="space-y-6">
        {groups.map((group) => (
          <ServiceGroup key={group.id} group={group} showUptime={showUptime} />
        ))}

        {/* Ungrouped services */}
        {services.filter((s) => !s.group).length > 0 && (
          <ServiceGroup
            group={{
              id: 'ungrouped',
              name: 'Other Services',
              services: services.filter((s) => !s.group),
              overall_status: 'operational',
              description: undefined,
            }}
            showUptime={showUptime}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} showUptime={showUptime} />
      ))}
    </div>
  );
}

// Service Group Component
function ServiceGroup({ group, showUptime = true }: ServiceGroupProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
            {group.description && <p className="mt-1 text-sm text-gray-600">{group.description}</p>}
          </div>
          <StatusIndicator status={group.overall_status} showLabel />
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {group.services.map((service) => (
          <div key={service.id} className="px-6 py-4">
            <ServiceCard service={service} showUptime={showUptime} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, showUptime = true }: ServiceCardProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center">
        <StatusIndicator status={service.status} size="sm" />
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
          {service.description && (
            <p className="mt-1 text-xs text-gray-500">{service.description}</p>
          )}
        </div>
      </div>

      {showUptime && (
        <div className="text-right">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div>
              <span className="font-medium text-gray-900">{service.uptime_24h.toFixed(1)}%</span>
              <br />
              24h uptime
            </div>
            <div>
              <span className="font-medium text-gray-900">{service.uptime_30d.toFixed(1)}%</span>
              <br />
              30d uptime
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Indicator Component
function StatusIndicator({ status, size = 'md', showLabel = false }: StatusIndicatorProps) {
  const colors = STATUS_COLORS[status];
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const statusLabels = {
    operational: 'Operational',
    degraded: 'Degraded',
    major_outage: 'Major Outage',
    maintenance: 'Maintenance',
  };

  return (
    <div className="flex items-center">
      <div className={`${colors.dot} ${sizeClasses[size]} rounded-full`} />
      {showLabel && (
        <span className={`ml-2 text-sm font-medium ${colors.text}`}>{statusLabels[status]}</span>
      )}
    </div>
  );
}

// Incident Banner Component
function IncidentBanner({ incidents }: IncidentBannerProps) {
  if (incidents.length === 0) return null;

  return (
    <div className="bg-red-600 text-white">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center">
          <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">
              {incidents.length === 1
                ? incidents[0].title
                : `${incidents.length} critical incidents are affecting our services`}
            </p>
            {incidents.length === 1 && incidents[0].description && (
              <p className="mt-1 text-sm text-red-100">{incidents[0].description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Maintenance Banner Component
function MaintenanceBanner({ maintenance }: MaintenanceBannerProps) {
  if (maintenance.length === 0) return null;

  const activeOrUpcoming = maintenance.filter(
    (m) =>
      m.status === 'in_progress' ||
      (m.status === 'scheduled' &&
        new Date(m.scheduled_start) <= new Date(Date.now() + 24 * 60 * 60 * 1000)),
  );

  if (activeOrUpcoming.length === 0) return null;

  return (
    <div className="bg-blue-600 text-white">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center">
          <Calendar className="mr-3 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">
              {activeOrUpcoming[0].status === 'in_progress'
                ? 'Scheduled maintenance is currently in progress'
                : 'Scheduled maintenance is planned'}
            </p>
            <p className="mt-1 text-sm text-blue-100">{activeOrUpcoming[0].description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Incident List Component
function IncidentList({ incidents, showHistory = false, maxItems }: IncidentListProps) {
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  const displayIncidents = maxItems ? incidents.slice(0, maxItems) : incidents;

  if (incidents.length === 0) {
    return (
      <div className="py-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {showHistory ? 'No Past Incidents' : 'No Current Incidents'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {showHistory
            ? 'No incidents have been reported recently.'
            : 'All systems are operating normally.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayIncidents.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          expanded={expandedIncident === incident.id}
          onToggle={() =>
            setExpandedIncident(expandedIncident === incident.id ? null : incident.id)
          }
        />
      ))}
    </div>
  );
}

// Incident Card Component
function IncidentCard({ incident, expanded = false, onToggle }: IncidentCardProps) {
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
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="cursor-pointer p-6 transition-colors hover:bg-gray-50" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${SEVERITY_COLORS[incident.severity]}`} />
              <h3 className="text-sm font-medium text-gray-900">{incident.title}</h3>
              <span className="text-xs text-gray-500">{timeAgo(incident.started_at)}</span>
            </div>

            {incident.affected_services.length > 0 && (
              <p className="mb-2 text-xs text-gray-600">
                Affected: {incident.affected_services.join(', ')}
              </p>
            )}

            <p className="text-sm text-gray-600">{incident.description}</p>
          </div>

          <div className="ml-4 text-right">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                incident.status === 'investigating'
                  ? 'bg-amber-100 text-amber-700'
                  : incident.status === 'identified'
                    ? 'bg-blue-100 text-blue-700'
                    : incident.status === 'monitoring'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {expanded && incident.updates.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <h4 className="mb-3 text-sm font-medium text-gray-900">Updates</h4>
          <div className="space-y-3">
            {incident.updates.map((update) => (
              <div key={update.id} className="text-sm">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(update.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600">{update.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
