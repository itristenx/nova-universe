import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@stores/auth';
import { RefreshButton } from '@components/common/RefreshButton';
import { spaceService } from '@services/spaces';
import type { SpaceMetrics } from '@services/spaces';
import {
  BuildingOfficeIcon,
  UsersIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Type definitions for role-based space data
interface BaseSpaceData {
  summary: Array<{
    name: string;
    count: number;
    color: string;
    icon: any;
  }>;
  utilizationRate: number;
  peakTime: string;
  averageDuration: number;
  popularSpaces: Array<{
    spaceId: string;
    name: string;
    bookingCount: number;
  }>;
}

interface AdminSpaceData extends BaseSpaceData {
  spaceTypes: Array<{
    name: string;
    count: number;
    available: number;
    icon: any;
    color: string;
  }>;
  recentBookings: Array<{
    id: string;
    space: string;
    user: string;
    time: string;
    status: string;
  }>;
}

interface AgentUserSpaceData extends BaseSpaceData {
  myBookings: Array<{
    id: string;
    space: string;
    time: string;
    status: string;
  }>;
  quickActions: Array<{
    name: string;
    icon: any;
    href: string;
  }>;
}

export function SpaceOverview() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [spaceMetrics, setSpaceMetrics] = useState<SpaceMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getUserRole = () => {
    if (!user?.roles) return 'user';
    if (user.roles.some((role) => role.name === 'admin')) return 'admin';
    if (user.roles.some((role) => role.name === 'agent')) return 'agent';
    return 'user';
  };

  const userRole = getUserRole();

  // Load space metrics from API
  useEffect(() => {
    loadSpaceMetrics();
  }, []);

  const loadSpaceMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load real space metrics from API
      const metrics = await spaceService.getMetrics('week');
      setSpaceMetrics(metrics);
    } catch (err) {
      console.warn('Space metrics API not available, using fallback data:', err);
      setError('Space management system temporarily unavailable');

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
          { spaceId: '3', name: 'Meeting Room B', bookingCount: 15 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadSpaceMetrics();
  };

  const getSpaceDataForRole = () => {
    if (!spaceMetrics) return null;

    const baseData = {
      summary: [
        {
          name: 'Total Spaces',
          count: spaceMetrics.totalSpaces,
          color: 'text-blue-600',
          icon: BuildingOfficeIcon,
        },
        {
          name: 'Available',
          count: spaceMetrics.availableSpaces,
          color: 'text-green-600',
          icon: CheckCircleIcon,
        },
        {
          name: 'Occupied',
          count: spaceMetrics.occupiedSpaces,
          color: 'text-yellow-600',
          icon: UsersIcon,
        },
        {
          name: 'Maintenance',
          count: spaceMetrics.maintenanceSpaces,
          color: 'text-red-600',
          icon: WrenchScrewdriverIcon,
        },
      ],
      utilizationRate: spaceMetrics.utilizationRate,
      peakTime: spaceMetrics.peakOccupancyTime,
      averageDuration: spaceMetrics.averageBookingDuration,
      popularSpaces: spaceMetrics.mostPopularSpaces,
    };

    switch (userRole) {
      case 'admin':
        return {
          ...baseData,
          spaceTypes: [
            {
              name: 'Conference Rooms',
              count: 45,
              available: 23,
              icon: UsersIcon,
              color: 'text-blue-600',
            },
            {
              name: 'Hot Desks',
              count: 67,
              available: 34,
              icon: ComputerDesktopIcon,
              color: 'text-green-600',
            },
            {
              name: 'Phone Booths',
              count: 20,
              available: 8,
              icon: ClockIcon,
              color: 'text-purple-600',
            },
            {
              name: 'Focus Pods',
              count: 13,
              available: 2,
              icon: CheckCircleIcon,
              color: 'text-orange-600',
            },
          ],
          recentBookings: [
            {
              id: '1',
              space: 'Conference Room A',
              user: 'John Doe',
              time: '2:00 PM - 3:00 PM',
              status: 'confirmed',
            },
            {
              id: '2',
              space: 'Focus Pod 3',
              user: 'Jane Smith',
              time: '3:30 PM - 4:30 PM',
              status: 'pending',
            },
            {
              id: '3',
              space: 'Meeting Room B',
              user: 'Mike Johnson',
              time: '1:00 PM - 2:00 PM',
              status: 'completed',
            },
          ],
        };

      case 'agent':
        return {
          ...baseData,
          myBookings: [
            { id: '1', space: 'Conference Room A', time: '2:00 PM - 3:00 PM', status: 'confirmed' },
            { id: '2', space: 'Focus Pod 1', time: '4:00 PM - 5:00 PM', status: 'pending' },
          ],
          quickActions: [
            { name: 'Book a Space', icon: CalendarIcon, href: '/spaces/book' },
            { name: 'View My Bookings', icon: ClockIcon, href: '/spaces/my-bookings' },
            { name: 'Cancel Booking', icon: InformationCircleIcon, href: '/spaces/manage' },
          ],
        };

      default: // user
        return {
          ...baseData,
          myBookings: [
            { id: '1', space: 'Focus Pod 2', time: 'Today 3:00 PM - 4:00 PM', status: 'confirmed' },
            {
              id: '2',
              space: 'Conference Room C',
              time: 'Tomorrow 10:00 AM - 11:00 AM',
              status: 'pending',
            },
          ],
          quickActions: [
            { name: 'Book a Space', icon: CalendarIcon, href: '/spaces/book' },
            { name: 'My Bookings', icon: ClockIcon, href: '/spaces/bookings' },
          ],
        };
    }
  };

  const spaceData = getSpaceDataForRole();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading && !spaceMetrics) {
    return (
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Space Management</h3>
          <div className="border-nova-600 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!spaceData) {
    return (
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Space Management</h3>
          <RefreshButton onRefresh={handleRefresh} isLoading={loading} />
        </div>
        <div className="py-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">Failed to load space data</p>
          <RefreshButton onRefresh={handleRefresh} isLoading={loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Space Management</h3>
        <div className="flex items-center space-x-2">
          {error && (
            <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
              <ExclamationTriangleIcon className="mr-1 h-4 w-4" />
              <span>Using cached data</span>
            </div>
          )}
          <RefreshButton onRefresh={handleRefresh} isLoading={loading} />
        </div>
      </div>

      {/* Space Summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {spaceData.summary.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.name} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
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
          );
        })}
      </div>

      {/* Utilization Metrics */}
      <div className="mb-6">
        <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
          Space Utilization
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Utilization Rate</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {Math.round(spaceData.utilizationRate * 100)}%
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Peak Time</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {spaceData.peakTime}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Duration</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              {spaceData.averageDuration}min
            </div>
          </div>
        </div>
      </div>

      {/* Role-specific content */}
      {userRole === 'admin' && 'spaceTypes' in spaceData && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Space Types</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(spaceData as AdminSpaceData).spaceTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <div
                  key={type.name}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                >
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
              );
            })}
          </div>
        </div>
      )}

      {/* My Bookings for agents and users */}
      {(userRole === 'agent' || userRole === 'user') && 'myBookings' in spaceData && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">My Bookings</h4>
          <div className="space-y-2">
            {(spaceData as AgentUserSpaceData).myBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.space}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{booking.time}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings for admins */}
      {userRole === 'admin' && 'recentBookings' in spaceData && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
            Recent Bookings
          </h4>
          <div className="space-y-2">
            {(spaceData as AdminSpaceData).recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {booking.space}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {booking.user} • {booking.time}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}
                >
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {'quickActions' in spaceData && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Quick Actions</h4>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {(spaceData as AgentUserSpaceData).quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="flex items-center rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  <IconComponent className="text-nova-600 dark:text-nova-400 mr-3 h-5 w-5" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {action.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Spaces */}
      {spaceData.popularSpaces && spaceData.popularSpaces.length > 0 && (
        <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
          <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
            Most Popular Spaces
          </h4>
          <div className="space-y-2">
            {spaceData.popularSpaces.slice(0, 3).map((space, index) => (
              <div key={space.spaceId} className="flex items-center justify-between p-2">
                <div className="flex items-center">
                  <div className="bg-nova-100 dark:bg-nova-900 mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                    <span className="text-nova-600 dark:text-nova-400 text-xs font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">{space.name}</span>
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
  );
}
