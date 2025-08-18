import { useAuthStore } from '@stores/auth'
import { useQuery } from '@tanstack/react-query'
import { analyticsService, type ActivityItem } from '@services/analytics'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { RefreshButton } from '@components/common/RefreshButton'
import toast from 'react-hot-toast'
import { 
  TicketIcon,
  CubeIcon,
  MapIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export function RecentActivity() {
  const { user } = useAuthStore()
  
  const getUserRole = () => {
    if (!user?.roles) return 'user'
    if (user.roles.some(role => role.name === 'admin')) return 'admin'
    if (user.roles.some(role => role.name === 'agent')) return 'agent'
    return 'user'
  }

  const userRole = getUserRole()

  // Fetch real activity data
  const { data: activities, isLoading, error, refetch } = useQuery({
    queryKey: ['recent-activity', userRole],
    queryFn: async () => {
      try {
        return await analyticsService.getRecentActivity(userRole === 'admin' ? 8 : 6)
      } catch (error) {
        console.error('Failed to load recent activity:', error)
        toast.error('Failed to load recent activity')
        throw error
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })

  const getIconForActivity = (activity: ActivityItem) => {
    // Use the type to determine the icon
    switch (activity.type) {
      case 'ticket':
        return TicketIcon
      case 'asset':
        return CubeIcon
      case 'space':
        return MapIcon
      case 'user':
        return UserIcon
      case 'auth':
        return ShieldCheckIcon
      case 'system':
        return CogIcon
      default:
        // Fall back to status-based icon
        switch (activity.status) {
          case 'success':
            return CheckCircleIcon
          case 'warning':
          case 'error':
            return ExclamationTriangleIcon
          default:
            return ClockIcon
        }
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
    }
  }

  const getStatusDot = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="md" text="Loading recent activity..." />
        </div>
      </div>
    )
  }

  if (error || !activities) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Failed to Load Activity
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We're having trouble loading your recent activity. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-nova-600 text-white rounded-lg hover:bg-nova-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Activity
        </h3>
        <div className="text-center py-8">
          <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No recent activity to display
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Activity
        </h3>
        <RefreshButton 
          onRefresh={async () => { await refetch() }}
          isLoading={isLoading}
          tooltip="Refresh recent activity"
        />
      </div>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => {
            const IconComponent = getIconForActivity(activity)
            return (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${getStatusColor(activity.status)}`}>
                        <IconComponent className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                        {activity.user && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            by {activity.user}
                          </p>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${getStatusDot(activity.status)}`}></span>
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
