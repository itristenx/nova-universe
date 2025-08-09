import React from 'react'
import { Card, CardHeader, CardBody, Progress } from '@heroui/react'
import { CheckIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export interface StatusIndicatorProps {
  status: 'online' | 'busy' | 'away' | 'offline'
  label: string
  count?: number
  lastUpdate?: string
}

export interface QueueStatusProps {
  queueName: string
  assignedTickets: number
  waitingTickets: number
  avgResponseTime: string
  slaCompliance: number
  status: 'healthy' | 'warning' | 'critical'
}

const StatusDot = ({ status }: { status: 'online' | 'busy' | 'away' | 'offline' }) => {
  const colors = {
    online: 'bg-green-500',
    busy: 'bg-red-500', 
    away: 'bg-yellow-500',
    offline: 'bg-gray-400'
  }
  
  return (
    <div className={`w-2 h-2 rounded-full ${colors[status]} animate-pulse`} />
  )
}

const StatusIcon = ({ status }: { status: 'healthy' | 'warning' | 'critical' }) => {
  if (status === 'healthy') {
    return <CheckIcon className="w-4 h-4 text-green-500" />
  }
  if (status === 'warning') {
    return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
  }
  return <XMarkIcon className="w-4 h-4 text-red-500" />
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label, 
  count, 
  lastUpdate 
}) => {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <StatusDot status={status} />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </p>
          {lastUpdate && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last update: {lastUpdate}
            </p>
          )}
        </div>
      </div>
      {count !== undefined && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {count}
        </span>
      )}
    </div>
  )
}

const QueueStatus: React.FC<QueueStatusProps> = ({
  queueName,
  assignedTickets,
  waitingTickets,
  avgResponseTime,
  slaCompliance,
  status
}) => {
  return (
    <Card className="w-full" shadow="sm">
      <CardBody className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {queueName}
          </h4>
          <StatusIcon status={status} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Assigned</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {assignedTickets}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Waiting</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {waitingTickets}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Avg Response</span>
            <span className="text-gray-900 dark:text-gray-100">{avgResponseTime}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">SLA Compliance</span>
            <span className="text-gray-900 dark:text-gray-100">{slaCompliance}%</span>
          </div>
          <Progress
            value={slaCompliance}
            color={slaCompliance >= 95 ? 'success' : slaCompliance >= 80 ? 'warning' : 'danger'}
            size="sm"
            className="mt-1"
          />
        </div>
      </CardBody>
    </Card>
  )
}

export const RealTimeStatusWidget: React.FC = () => {
  const agentStatuses: StatusIndicatorProps[] = [
    { status: 'online', label: 'Available Agents', count: 12, lastUpdate: '2 min ago' },
    { status: 'busy', label: 'Busy Agents', count: 8, lastUpdate: '1 min ago' },
    { status: 'away', label: 'Away Agents', count: 3, lastUpdate: '5 min ago' },
    { status: 'offline', label: 'Offline Agents', count: 2, lastUpdate: '15 min ago' }
  ]

  const queueStatuses: QueueStatusProps[] = [
    {
      queueName: 'Level 1 Support',
      assignedTickets: 45,
      waitingTickets: 12,
      avgResponseTime: '2.3 min',
      slaCompliance: 96,
      status: 'healthy'
    },
    {
      queueName: 'Level 2 Support',
      assignedTickets: 23,
      waitingTickets: 8,
      avgResponseTime: '8.7 min',
      slaCompliance: 88,
      status: 'warning'
    },
    {
      queueName: 'Escalations',
      assignedTickets: 7,
      waitingTickets: 15,
      avgResponseTime: '25.1 min',
      slaCompliance: 67,
      status: 'critical'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Agent Status Section */}
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Agent Status
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-1">
            {agentStatuses.map((agent, index) => (
              <StatusIndicator key={index} {...agent} />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Queue Status Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Queue Status
        </h3>
        <div className="space-y-3">
          {queueStatuses.map((queue, index) => (
            <QueueStatus key={index} {...queue} />
          ))}
        </div>
      </div>

      {/* System Health Indicators */}
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            System Health
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">99.9%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">127ms</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">1.2K</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">25</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Queued Jobs</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
