import React from 'react';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface SLAStatusProps {
  status: 'ok' | 'warning' | 'breach' | 'at_risk';
  timeRemaining?: number; // minutes
  timeToTarget?: number; // minutes
  breachTime?: number; // minutes (if already breached)
  showDetails?: boolean;
  className?: string;
}

interface SLABreachInfo {
  type: 'response' | 'resolution';
  severity: 'minor' | 'major' | 'critical';
  duration: number; // minutes overdue
  escalated: boolean;
}

interface SLADetailsProps {
  ticketId: string;
  responseTime?: {
    target: number;
    elapsed: number;
    remaining: number;
    status: 'ok' | 'warning' | 'breach';
  };
  resolutionTime?: {
    target: number;
    elapsed: number;
    remaining: number;
    status: 'ok' | 'warning' | 'breach';
  };
  breaches?: SLABreachInfo[];
}

const formatTimeRemaining = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
};

const getSLAStatusIcon = (status: SLAStatusProps['status']) => {
  switch (status) {
    case 'ok':
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600" />;
    case 'breach':
      return <XCircleIcon className="h-4 w-4 text-red-600" />;
    case 'at_risk':
      return <ClockIcon className="h-4 w-4 text-orange-600" />;
    default:
      return <ClockIcon className="h-4 w-4 text-gray-600" />;
  }
};

const getSLAStatusColor = (status: SLAStatusProps['status']) => {
  switch (status) {
    case 'ok':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'breach':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'at_risk':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export function SLAStatusBadge({
  status,
  timeRemaining,
  timeToTarget,
  breachTime,
  showDetails = false,
  className,
}: SLAStatusProps) {
  const displayTime = () => {
    if (status === 'breach' && breachTime) {
      return `Overdue by ${formatTimeRemaining(breachTime)}`;
    }
    if (timeRemaining !== undefined) {
      return `${formatTimeRemaining(timeRemaining)} left`;
    }
    if (timeToTarget !== undefined) {
      return `Target: ${formatTimeRemaining(timeToTarget)}`;
    }
    return '';
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium',
        getSLAStatusColor(status),
        className,
      )}
    >
      {getSLAStatusIcon(status)}
      <span className="capitalize">{status.replace('_', ' ')}</span>
      {showDetails && displayTime() && (
        <span className="text-xs opacity-75">• {displayTime()}</span>
      )}
    </div>
  );
}

export function SLADetails({
  ticketId,
  responseTime,
  resolutionTime,
  breaches = [],
}: SLADetailsProps) {
  const renderTimeMetric = (label: string, metric: SLADetailsProps['responseTime']) => {
    if (!metric) return null;

    const percentage = Math.min((metric.elapsed / metric.target) * 100, 100);
    const isOverdue = metric.elapsed > metric.target;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <SLAStatusBadge status={metric.status} timeRemaining={metric.remaining} showDetails />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Elapsed: {formatTimeRemaining(metric.elapsed)}</span>
            <span>Target: {formatTimeRemaining(metric.target)}</span>
          </div>

          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                isOverdue ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500',
              )}
              style={{
                width: `${Math.min(percentage, 100)}%`,
              }}
            />
          </div>

          {isOverdue && (
            <div className="text-xs font-medium text-red-600">
              Overdue by {formatTimeRemaining(metric.elapsed - metric.target)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">SLA Status</h3>
        <span className="text-sm text-gray-500">Ticket #{ticketId}</span>
      </div>

      {responseTime && renderTimeMetric('Response Time', responseTime)}
      {resolutionTime && renderTimeMetric('Resolution Time', resolutionTime)}

      {breaches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-600">SLA Breaches</h4>
          <div className="space-y-2">
            {breaches.map((breach, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-2"
              >
                <div className="flex items-center gap-2">
                  <XCircleIcon className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    {breach.type === 'response' ? 'Response' : 'Resolution'} Time Breach
                  </span>
                  {breach.escalated && (
                    <span className="rounded bg-red-600 px-2 py-0.5 text-xs text-white">
                      Escalated
                    </span>
                  )}
                </div>
                <div className="text-xs text-red-600">
                  Overdue by {formatTimeRemaining(breach.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SLAStatusBadge;
