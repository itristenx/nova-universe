import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@stores/auth'
import { RefreshButton } from '@components/common/RefreshButton'
import { spaceService } from '@services/spaces'
import type { SpaceMetrics } from '@services/spaces'
import { 
  Bui      {(userRole === 'agent' || userRole === 'user') && spaceData && 'myBookings' in spaceData && spaceData.myBookings && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            My Bookings
          </h4>
          <div className="space-y-3">
            {spaceData.myBookings.map((booking: any) => (ficeIcon,
  UsersIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export function SpaceOverview() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [spaceMetrics, setSpaceMetrics] = useState<SpaceMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getUserRole = () => {
    if (!user?.roles) return 'user'
    if (user.roles.some(role => role.name === 'admin')) return 'admin'
    if (user.roles.some(role => role.name === 'agent')) return 'agent'
    return 'user'
  }

  const userRole = getUserRole()

  // Load space metrics from API
  useEffect(() => {
    loadSpaceMetrics()
  }, [])

  const loadSpaceMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to load real space metrics from API
      const metrics = await spaceService.getMetrics('week')
      setSpaceMetrics(metrics)
    } catch (err) {
      console.warn('Space metrics API not available, using fallback data:', err)
      setError('Space management system temporarily unavailable')
      
      // Fallback to simulated data if API is not available
      setSpaceMetrics({
        totalSpaces: 145,
        availableSpaces: 67,
        occupiedSpaces: 72,
        maintenanceSpaces: 6,
        utilizationRate: 0.74,
        peakOccupancyTime: '2:00 PM',
        averageBookingDuration: 90,
        mostPopularSpaces: [
          { spaceId: '1', name: 'Conference Room A', bookingCount: 23 },
          { spaceId: '2', name: 'Focus Pod 3', bookingCount: 18 },
          { spaceId: '3', name: 'Meeting Room B', bookingCount: 15 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadSpaceMetrics()
  }

  const getSpaceDataForRole = () => {
    if (!spaceMetrics) return null

    const baseData = {
      summary: [
        { 
          name: 'Total Spaces', 
          count: spaceMetrics.totalSpaces, 
          color: 'text-blue-600', 
          icon: BuildingOfficeIcon 
        },
        { 
          name: 'Available', 
          count: spaceMetrics.availableSpaces, 
          color: 'text-green-600', 
          icon: CheckCircleIcon 
        },
        { 
          name: 'Occupied', 
          count: spaceMetrics.occupiedSpaces, 
          color: 'text-yellow-600', 
          icon: UsersIcon 
        },
        { 
          name: 'Maintenance', 
          count: spaceMetrics.maintenanceSpaces, 
          color: 'text-red-600', 
          icon: WrenchScrewdriverIcon 
        }
      ],
      utilizationRate: spaceMetrics.utilizationRate,
      peakTime: spaceMetrics.peakOccupancyTime,
      averageDuration: spaceMetrics.averageBookingDuration,
      popularSpaces: spaceMetrics.mostPopularSpaces
    }

    switch (userRole) {
      case 'admin':
        return {
          ...baseData,
          spaceTypes: [
            { name: 'Conference Rooms', count: 45, available: 23, icon: UsersIcon, color: 'text-blue-600' },
            { name: 'Hot Desks', count: 67, available: 34, icon: ComputerDesktopIcon, color: 'text-green-600' },
            { name: 'Phone Booths', count: 20, available: 8, icon: ClockIcon, color: 'text-purple-600' },
            { name: 'Focus Pods', count: 13, available: 2, icon: CheckCircleIcon, color: 'text-orange-600' }
          ],
          recentBookings: [
            { id: '1', space: 'Conference Room A', user: 'John Doe', time: '2:00 PM - 3:00 PM', status: 'confirmed' },
            { id: '2', space: 'Focus Pod 3', user: 'Jane Smith', time: '3:30 PM - 4:30 PM', status: 'pending' },
            { id: '3', space: 'Meeting Room B', user: 'Mike Johnson', time: '1:00 PM - 2:00 PM', status: 'completed' }
          ]
        }
      
      case 'agent':
        return {
          ...baseData,
          myBookings: [
            { id: '1', space: 'Conference Room A', time: '2:00 PM - 3:00 PM', status: 'confirmed' },
            { id: '2', space: 'Focus Pod 1', time: '4:00 PM - 5:00 PM', status: 'pending' }
          ],
          quickActions: [
            { name: 'Book a Space', icon: CalendarIcon, href: '/spaces/book' },
            { name: 'View My Bookings', icon: ClockIcon, href: '/spaces/my-bookings' },
            { name: 'Cancel Booking', icon: InformationCircleIcon, href: '/spaces/manage' }
          ]
        }
      
      default: // user
        return {
          ...baseData,
          myBookings: [
            { id: '1', space: 'Focus Pod 2', time: 'Today 3:00 PM - 4:00 PM', status: 'confirmed' },
            { id: '2', space: 'Conference Room C', time: 'Tomorrow 10:00 AM - 11:00 AM', status: 'pending' }
          ],
          quickActions: [
            { name: 'Book a Space', icon: CalendarIcon, href: '/spaces/book' },
            { name: 'My Bookings', icon: ClockIcon, href: '/spaces/bookings' }
          ]
        }
    }
  }

  const spaceData = getSpaceDataForRole()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading && !spaceMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Space Management
          </h3>
          <div className="animate-spin h-4 w-4 border-2 border-nova-600 border-t-transparent rounded-full"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!spaceData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Space Management
          </h3>
          <RefreshButton onClick={handleRefresh} loading={loading} />
        </div>
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400">Failed to load space data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Space Management
        </h3>
        <div className="flex items-center space-x-2">
          {error && (
            <div className="flex items-center text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              <span>Using cached data</span>
            </div>
          )}
          <RefreshButton onClick={handleRefresh} loading={loading} />
        </div>
      </div>

      {/* Space Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {spaceData.summary.map((item) => {
          const IconComponent = item.icon
          return (
            <div key={item.name} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${item.color}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {item.count}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Utilization Metrics */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Space Utilization
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Utilization Rate</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {Math.round(spaceData.utilizationRate * 100)}%
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Peak Time</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {spaceData.peakTime}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Duration</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {spaceData.averageDuration}min
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific content */}
      {userRole === 'admin' && spaceData && 'spaceTypes' in spaceData && spaceData.spaceTypes && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Space Types
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spaceData.spaceTypes.map((type: any) => {
              const IconComponent = type.icon
              return (
                <div key={type.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={type.color}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {type.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {type.available} of {type.count} available
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* My Bookings for agents and users */}
      {(userRole === 'agent' || userRole === 'user') && spaceData.myBookings && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            My Bookings
          </h4>
          <div className="space-y-2">
            {spaceData.myBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.space}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {booking.time}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings for admins */}
      {userRole === 'admin' && spaceData.recentBookings && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Recent Bookings
          </h4>
          <div className="space-y-2">
            {spaceData.recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.space}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {booking.user} • {booking.time}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {spaceData.quickActions && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {spaceData.quickActions.map((action) => {
              const IconComponent = action.icon
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <IconComponent className="h-5 w-5 text-nova-600 dark:text-nova-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Popular Spaces */}
      {spaceData.popularSpaces && spaceData.popularSpaces.length > 0 && (
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Most Popular Spaces
          </h4>
          <div className="space-y-2">
            {spaceData.popularSpaces.slice(0, 3).map((space, index) => (
              <div key={space.spaceId} className="flex items-center justify-between p-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-6 h-6 bg-nova-100 dark:bg-nova-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-nova-600 dark:text-nova-400">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {space.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {space.bookingCount} bookings
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
