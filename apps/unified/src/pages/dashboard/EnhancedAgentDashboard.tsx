import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  QueueListIcon,
  UserGroupIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn, formatRelativeTime } from '@utils/index'
import { useAuthStore } from '@stores/auth'
import { ticketService } from '@services/tickets'
import { pulseService } from '@services/pulse'
import toast from 'react-hot-toast'

interface DashboardMetrics {
  totalTickets: number
  openTickets: number
  avgResolutionTime: number
  productivityScore: number
  resolvedToday: number
  slaBreaches: number
  queueBacklog: number
  teamPerformance: number
}

interface QueueStats {
  id: string
  name: string
  ticketCount: number
  avgWaitTime: number
  slaStatus: 'safe' | 'warning' | 'breach'
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo'
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-50',
    green: 'bg-green-500 text-green-50',
    yellow: 'bg-yellow-500 text-yellow-50',
    red: 'bg-red-500 text-red-50',
    purple: 'bg-purple-500 text-purple-50',
    indigo: 'bg-indigo-500 text-indigo-50',
  }

  const changeClasses = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium',
                changeClasses[changeType]
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', colorClasses[color])}>{icon}</div>
      </div>
    </div>
  )
}

export default function EnhancedAgentDashboard() {
  const { user } = useAuthStore()
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today')
  const [selectedQueue, setSelectedQueue] = useState<'all' | 'hr' | 'it' | 'ops' | 'cyber'>('all')

  // Load dashboard metrics from Pulse API
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['agent-dashboard-metrics', user?.id, timeRange],
    queryFn: async () => {
      try {
        const dashboardData = await pulseService.getDashboard()
        
        // Transform pulse dashboard data to component format
        const transformedMetrics: DashboardMetrics = {
          totalTickets: dashboardData.myTickets.total || 0,
          openTickets: dashboardData.myTickets.open || 0,
          avgResolutionTime: dashboardData.todayStats.avgResolutionTime || 0,
          productivityScore: Math.min(100, Math.floor((dashboardData.todayStats.ticketsResolved / Math.max(1, dashboardData.myTickets.total)) * 100)),
          resolvedToday: dashboardData.todayStats.ticketsResolved || 0,
          slaBreaches: 0, // Will be calculated from upcoming tasks API when backend integration is complete
          queueBacklog: dashboardData.upcomingTasks.length || 0,
          teamPerformance: 85 // Mock value until API provides this
        }
        
        return transformedMetrics
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error)
        // Return fallback data
        return {
          totalTickets: 0,
          openTickets: 0,
          avgResolutionTime: 0,
          productivityScore: 0,
          resolvedToday: 0,
          slaBreaches: 0,
          queueBacklog: 0,
          teamPerformance: 0
        }
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  // Load queue statistics from Pulse API
  const { data: queueStats = [], isLoading: queueLoading } = useQuery({
    queryKey: ['queue-stats', selectedQueue],
    queryFn: async () => {
      try {
        const queueMetrics = await pulseService.getQueueMetrics(selectedQueue === 'all' ? undefined : selectedQueue)
        
        // Transform pulse queue metrics to component format
        const transformedQueues: QueueStats[] = queueMetrics.map(queue => ({
          id: queue.queue_name,
          name: queue.queue_name.charAt(0).toUpperCase() + queue.queue_name.slice(1),
          ticketCount: queue.tickets_in_queue || 0,
          avgWaitTime: queue.avg_wait_time_minutes || 0,
          slaStatus: queue.sla_breach_count > 2 ? 'breach' : 
                    queue.sla_breach_count > 0 ? 'warning' : 'safe'
        }))
        
        return transformedQueues
      } catch (error) {
        console.error('Failed to load queue stats:', error)
        // Return fallback data
        return [
          { id: 'it', name: 'IT Support', ticketCount: 0, avgWaitTime: 0, slaStatus: 'safe' as const },
          { id: 'hr', name: 'HR Support', ticketCount: 0, avgWaitTime: 0, slaStatus: 'safe' as const }
        ]
      }
    }
  })

  // Load recent tickets
  const { data: recentTicketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['recent-tickets', user?.id, selectedQueue],
    queryFn: async () => {
      try {
        const filters: any = {
          assignee: user?.id ? [user.id] : undefined,
          status: ['open', 'in-progress'],
        }
        
        if (selectedQueue !== 'all') {
          filters.category = [selectedQueue]
        }
        
        const response = await ticketService.getTickets(1, 10, filters)
        return response
      } catch (error) {
        toast.error('Failed to load recent tickets')
        return { data: [], total: 0, page: 1, perPage: 10, totalPages: 0 }
      }
    }
  })

  const recentTickets = recentTicketsData?.data || []

  if (metricsLoading || queueLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const getQueueSlaColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'breach': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || 'Agent'}</p>
        </div>
        
        {/* Time Range & Queue Filters */}
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            aria-label="Select time range"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <select
            value={selectedQueue}
            onChange={(e) => setSelectedQueue(e.target.value as typeof selectedQueue)}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
            aria-label="Select queue"
          >
            <option value="all">All Queues</option>
            <option value="it">IT Support</option>
            <option value="hr">HR Support</option>
            <option value="ops">Operations</option>
            <option value="cyber">Cybersecurity</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Open Tickets"
          value={metrics?.openTickets || 0}
          change="+3 from yesterday"
          changeType="neutral"
          icon={<QueueListIcon className="h-6 w-6" />}
          color="blue"
        />
        
        <MetricCard
          title="Resolved Today"
          value={metrics?.resolvedToday || 0}
          change="+2 from yesterday"
          changeType="positive"
          icon={<CheckCircleIcon className="h-6 w-6" />}
          color="green"
        />
        
        <MetricCard
          title="Avg Resolution Time"
          value={`${Math.floor((metrics?.avgResolutionTime || 0) / 60)}h ${(metrics?.avgResolutionTime || 0) % 60}m`}
          change="-15m from yesterday"
          changeType="positive"
          icon={<ClockIcon className="h-6 w-6" />}
          color="purple"
        />
        
        <MetricCard
          title="Productivity Score"
          value={`${metrics?.productivityScore || 0}%`}
          change="+5% from yesterday"
          changeType="positive"
          icon={<ChartBarIcon className="h-6 w-6" />}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Queue Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Queue Status</h2>
            <UserGroupIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {queueStats.map((queue) => (
              <div key={queue.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h3 className="font-medium text-gray-900">{queue.name}</h3>
                  <p className="text-sm text-gray-600">{queue.ticketCount} tickets</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Avg Wait: {queue.avgWaitTime}m</p>
                  <span className={cn('inline-block rounded-full px-2 py-1 text-xs font-medium', getQueueSlaColor(queue.slaStatus))}>
                    {queue.slaStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
            <Link
              to="/tickets"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {ticketsLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : recentTickets.length > 0 ? (
              recentTickets.slice(0, 5).map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block rounded-lg border p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                      <p className="text-sm text-gray-600">#{ticket.number}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        'inline-block rounded-full px-2 py-1 text-xs font-medium',
                        ticket.priority === 'urgent' || ticket.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        ticket.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {ticket.priority}
                      </span>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(ticket.updatedAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No recent tickets</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link
            to="/tickets/new"
            className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-blue-500 hover:bg-blue-50"
          >
            <BoltIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm font-medium text-gray-900">Create Ticket</span>
          </Link>
          
          <Link
            to="/deepwork"
            className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-blue-500 hover:bg-blue-50"
          >
            <ClockIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm font-medium text-gray-900">Deep Work Mode</span>
          </Link>
          
          <Link
            to="/analytics"
            className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-blue-500 hover:bg-blue-50"
          >
            <ChartBarIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm font-medium text-gray-900">Analytics</span>
          </Link>
          
          <Link
            to="/queue"
            className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-blue-500 hover:bg-blue-50"
          >
            <QueueListIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm font-medium text-gray-900">Queue Management</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
