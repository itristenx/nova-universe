import { useAuthStore } from '@stores/auth'
import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '@services/analytics'
import { ticketService } from '@services/tickets'
import { assetService } from '@services/assets'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { RefreshButton } from '@components/common/RefreshButton'
import toast from 'react-hot-toast'
import { 
  TicketIcon, 
  CubeIcon, 
  MapIcon, 
  UserGroupIcon,
  ServerIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface StatCard {
  name: string
  value: string | number
  change: string
  changeColor?: string
  icon: React.ComponentType<any>
  color: string
}

export function DashboardStats() {
  const { user } = useAuthStore()
  
  const getUserRole = () => {
    if (!user?.roles) return 'user'
    if (user.roles.some(role => role.name === 'admin')) return 'admin'
    if (user.roles.some(role => role.name === 'agent')) return 'agent'
    return 'user'
  }

  const userRole = getUserRole()

  // Fetch analytics data for admin overview
  const { 
    data: dashboardAnalytics, 
    isLoading: analyticsLoading, 
    error: analyticsError,
    refetch: refetchAnalytics 
  } = useQuery({
    queryKey: ['dashboard-analytics', '7d'],
    queryFn: async () => {
      try {
        return await analyticsService.getDashboardAnalytics('7d')
      } catch (error) {
        console.error('Failed to load dashboard analytics:', error)
        toast.error('Failed to load dashboard statistics')
        throw error
      }
    },
    enabled: userRole === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })

  // Fetch user-specific ticket data for agents and users
  const { 
    data: userTickets, 
    isLoading: ticketsLoading, 
    error: ticketsError,
    refetch: refetchTickets 
  } = useQuery({
    queryKey: ['user-tickets', user?.id],
    queryFn: async () => {
      try {
        return await ticketService.getTicketStats()
      } catch (error) {
        console.error('Failed to load ticket statistics:', error)
        toast.error('Failed to load ticket data')
        throw error
      }
    },
    enabled: userRole !== 'admin',
    refetchInterval: 30000,
    staleTime: 15000,
  })

  // Fetch user-specific asset data
  const { 
    data: userAssets, 
    isLoading: assetsLoading, 
    error: assetsError,
    refetch: refetchAssets 
  } = useQuery({
    queryKey: ['user-assets', user?.id],
    queryFn: async () => {
      try {
        return await assetService.getAssetStats()
      } catch (error) {
        console.error('Failed to load asset statistics:', error)
        toast.error('Failed to load asset data')
        throw error
      }
    },
    enabled: userRole !== 'admin',
    refetchInterval: 30000,
    staleTime: 15000,
  })

  const isLoading = analyticsLoading || ticketsLoading || assetsLoading
  const hasError = analyticsError || ticketsError || assetsError

  // Error handler for retry functionality
  const handleRetry = () => {
    if (analyticsError && refetchAnalytics) refetchAnalytics()
    if (ticketsError && refetchTickets) refetchTickets()
    if (assetsError && refetchAssets) refetchAssets()
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-center justify-center h-16">
              <LoadingSpinner size="md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state with retry option
  if (hasError) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Dashboard Statistics
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We're having trouble loading your dashboard data. Please try again.
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-nova-600 text-white rounded-lg hover:bg-nova-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const getStatsForRole = (): StatCard[] => {
    switch (userRole) {
      case 'admin':
        if (!dashboardAnalytics) return []
        
        const { summary, performance } = dashboardAnalytics
        
        return [
          { 
            name: 'Total Tickets', 
            value: summary?.totalTickets?.toLocaleString() || '0', 
            change: (summary?.openTickets || 0) > 0 ? `${summary?.openTickets || 0} open` : 'All resolved', 
            icon: TicketIcon, 
            color: 'text-blue-600',
            changeColor: (summary?.openTickets || 0) > 10 ? 'text-yellow-600' : 'text-green-600'
          },
          { 
            name: 'Active Users', 
            value: summary?.activeUsers?.toLocaleString() || '0', 
            change: 'Last 7 days', 
            icon: UserGroupIcon, 
            color: 'text-purple-600',
            changeColor: 'text-gray-600'
          },
          { 
            name: 'Avg Resolution', 
            value: `${summary?.avgResolutionHours || 0}h`, 
            change: parseFloat(performance?.errorRate || '0') < 1 ? 'Performing well' : 'Needs attention', 
            icon: ClockIcon, 
            color: 'text-yellow-600',
            changeColor: parseFloat(performance?.errorRate || '0') < 1 ? 'text-green-600' : 'text-red-600'
          },
          { 
            name: 'System Health', 
            value: `${summary?.systemUptime || 0}%`, 
            change: `${performance?.avgResponseTime || 0}ms avg`, 
            icon: ServerIcon, 
            color: 'text-emerald-600',
            changeColor: parseFloat(performance?.avgResponseTime || '0') < 200 ? 'text-green-600' : 'text-yellow-600'
          }
        ]
      
      case 'agent':
        const agentStats = userTickets || { 
          total: 0, 
          open: 0, 
          inProgress: 0, 
          resolved: 0, 
          averageResolutionTime: 0,
          byPriority: {},
          slaBreaches: 0
        }
        
        // Calculate agent-specific metrics from available data
        const myQueue = (agentStats.open || 0) + (agentStats.inProgress || 0)
        const priorityStats = (agentStats.byPriority as Record<string, number>) || {}
        const urgentCount = (priorityStats['urgent'] || 0) + (priorityStats['high'] || 0)
        const avgResolutionHours = (agentStats.averageResolutionTime || 0) / 3600 // Convert seconds to hours
        
        return [
          { 
            name: 'My Queue', 
            value: myQueue, 
            change: myQueue > 10 ? 'High workload' : 'Manageable', 
            icon: TicketIcon, 
            color: 'text-blue-600',
            changeColor: myQueue > 10 ? 'text-red-600' : 'text-green-600'
          },
          { 
            name: 'Resolved Total', 
            value: agentStats.resolved || 0, 
            change: 'All time', 
            icon: CheckCircleIcon, 
            color: 'text-green-600',
            changeColor: 'text-gray-600'
          },
          { 
            name: 'Urgent Tickets', 
            value: urgentCount, 
            change: urgentCount > 3 ? 'Needs attention' : 'Under control', 
            icon: ExclamationTriangleIcon, 
            color: 'text-red-600',
            changeColor: urgentCount > 3 ? 'text-red-600' : 'text-green-600'
          },
          { 
            name: 'Avg Resolution', 
            value: avgResolutionHours > 0 ? `${avgResolutionHours.toFixed(1)}h` : 'N/A', 
            change: 'Average time', 
            icon: ClockIcon, 
            color: 'text-yellow-600',
            changeColor: 'text-gray-600'
          }
        ]
      
      default: // user
        const userStats = userTickets || { total: 0, resolved: 0, open: 0 }
        const assetStats = userAssets || { assigned: 0, active: 0 }
        
        return [
          { 
            name: 'My Tickets', 
            value: userStats.open || 0, 
            change: (userStats.open || 0) > 0 ? `${userStats.open || 0} open` : 'All resolved', 
            icon: TicketIcon, 
            color: 'text-blue-600',
            changeColor: (userStats.open || 0) > 0 ? 'text-yellow-600' : 'text-green-600'
          },
          { 
            name: 'Resolved', 
            value: userStats.resolved || 0, 
            change: 'Total resolved', 
            icon: CheckCircleIcon, 
            color: 'text-green-600',
            changeColor: 'text-gray-600'
          },
          { 
            name: 'My Assets', 
            value: assetStats.assigned || assetStats.active || 0, 
            change: 'Assigned to me', 
            icon: CubeIcon, 
            color: 'text-purple-600',
            changeColor: 'text-gray-600'
          },
          { 
            name: 'Knowledge Base', 
            value: dashboardAnalytics?.summary?.knowledgeArticles || 0, 
            change: 'Articles available', 
            icon: MapIcon, 
            color: 'text-orange-600',
            changeColor: 'text-gray-600'
          }
        ]
    }
  }

  const stats = getStatsForRole()

  const handleRefresh = async () => {
    if (userRole === 'admin' && refetchAnalytics) {
      refetchAnalytics()
    } else {
      if (refetchTickets) refetchTickets()
      if (refetchAssets) refetchAssets()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Dashboard Statistics
        </h3>
        <RefreshButton 
          onRefresh={handleRefresh}
          isLoading={isLoading}
          tooltip="Refresh dashboard statistics"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="card p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.name}
              </p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
                {stat.change && (
                  <p className={`ml-2 text-sm font-medium ${stat.changeColor || 'text-green-600'}`}>
                    {stat.change}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}