import { Link } from 'react-router-dom';
import { useAuthStore } from '@stores/auth';
import { useQuery } from '@tanstack/react-query';
import { ticketService } from '@services/tickets';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { RefreshButton } from '@components/common/RefreshButton';
import toast from 'react-hot-toast';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface TicketData {
  status: string;
  count: number;
  color: string;
  icon: React.ComponentType<any>;
  priority?: string;
}

export function TicketOverview() {
  const { user } = useAuthStore();

  const getUserRole = () => {
    if (!user?.roles) return 'user';
    if (user.roles.some((role) => role.name === 'admin')) return 'admin';
    if (user.roles.some((role) => role.name === 'agent')) return 'agent';
    return 'user';
  };

  const userRole = getUserRole();

  // Fetch ticket statistics from API
  const {
    data: ticketStats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['ticket-stats', userRole],
    queryFn: async () => {
      try {
        return await ticketService.getTicketStats('30d');
      } catch (_error) {
        console.error('Failed to load ticket statistics:', error);
        toast.error('Failed to load ticket statistics');
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch recent tickets
  const {
    data: recentTicketsData,
    isLoading: isLoadingTickets,
    error: ticketsError,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ['recent-tickets', userRole],
    queryFn: async () => {
      try {
        const filters: any = {};

        // Filter based on user role
        if (userRole === 'agent') {
          filters.assignee = [user?.id]; // Only tickets assigned to this agent
        } else if (userRole === 'user') {
          filters.requester = [user?.id]; // Only tickets created by this user
        }

        return await ticketService.getTickets(1, 5, filters, [
          { field: 'updatedAt', direction: 'desc' },
        ]);
      } catch (_error) {
        console.error('Failed to load recent tickets:', error);
        toast.error('Failed to load recent tickets');
        throw error;
      }
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
  });

  const getTicketDataForRole = (): TicketData[] => {
    if (!ticketStats) {
      // Return loading state or defaults
      return [
        { status: 'Loading...', count: 0, color: 'text-gray-400', icon: InformationCircleIcon },
      ];
    }

    switch (userRole) {
      case 'admin':
        return [
          {
            status: 'Critical',
            count: ticketStats.byPriority?.critical || 0,
            color: 'text-red-600',
            icon: ExclamationTriangleIcon,
            priority: 'high',
          },
          {
            status: 'Open',
            count: ticketStats.open,
            color: 'text-blue-600',
            icon: InformationCircleIcon,
          },
          {
            status: 'In Progress',
            count: ticketStats.inProgress,
            color: 'text-yellow-600',
            icon: ClockIcon,
          },
          {
            status: 'Resolved Today',
            count: ticketStats.resolved,
            color: 'text-green-600',
            icon: CheckCircleIcon,
          },
        ];

      case 'agent':
        return [
          {
            status: 'My Queue',
            count: recentTicketsData?.meta?.total || 0,
            color: 'text-blue-600',
            icon: InformationCircleIcon,
          },
          {
            status: 'High Priority',
            count: ticketStats.byPriority?.high || 0,
            color: 'text-red-600',
            icon: ExclamationTriangleIcon,
            priority: 'high',
          },
          {
            status: 'In Progress',
            count: ticketStats.inProgress,
            color: 'text-yellow-600',
            icon: ClockIcon,
          },
          {
            status: 'Resolved Today',
            count: ticketStats.resolved,
            color: 'text-green-600',
            icon: CheckCircleIcon,
          },
        ];

      default: // user
        return [
          {
            status: 'Open',
            count: ticketStats.open,
            color: 'text-blue-600',
            icon: InformationCircleIcon,
          },
          {
            status: 'In Progress',
            count: ticketStats.inProgress,
            color: 'text-yellow-600',
            icon: ClockIcon,
          },
          {
            status: 'Resolved',
            count: ticketStats.resolved,
            color: 'text-green-600',
            icon: CheckCircleIcon,
          },
          {
            status: 'Total',
            count: ticketStats.total,
            color: 'text-gray-600',
            icon: InformationCircleIcon,
          },
        ];
    }
  };

  const ticketData = getTicketDataForRole();
  const recentTickets = recentTicketsData?.data || [];

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchStats(), refetchTickets()]);
      toast.success('Ticket data refreshed');
    } catch (_error) {
      // Individual errors are already handled in the query functions
      console.error('Failed to refresh ticket data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in progress':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved':
      case 'closed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {userRole === 'admin'
            ? 'Ticket Overview'
            : userRole === 'agent'
              ? 'My Tickets'
              : 'My Tickets'}
        </h3>
        <div className="flex items-center gap-3">
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={isLoadingStats || isLoadingTickets}
            size="sm"
            tooltip="Refresh ticket data"
          />
          <Link
            to="/tickets"
            className="text-nova-600 hover:text-nova-700 dark:text-nova-400 dark:hover:text-nova-300 flex items-center gap-1 text-sm font-medium"
          >
            View All
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingStats || isLoadingTickets ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : statsError || ticketsError ? (
        <div className="py-8 text-center">
          <ExclamationTriangleIcon className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Failed to Load Data
          </h4>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            There was an error loading the ticket information.
          </p>
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={false}
            size="md"
            tooltip="Retry loading data"
          />
        </div>
      ) : (
        <>
          {/* Ticket Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {ticketData.map((data) => {
              const IconComponent = data.icon;
              return (
                <div key={data.status} className="text-center">
                  <div className="mb-2 flex items-center justify-center">
                    <IconComponent className={`h-5 w-5 ${data.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${data.color}`}>{data.count}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{data.status}</div>
                </div>
              );
            })}
          </div>

          {/* Recent Tickets */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
              Recent Activity
            </h4>
            {recentTickets.length === 0 ? (
              <div className="py-6 text-center text-gray-500 dark:text-gray-400">
                <InformationCircleIcon className="mx-auto mb-2 h-8 w-8" />
                <p>No recent tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {ticket.number || ticket.id}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <p className="truncate text-sm text-gray-600 dark:text-gray-300">
                          {ticket.title}
                        </p>
                        <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className={getPriorityColor(ticket.priority)}>
                            {ticket.priority} Priority
                          </span>
                          {userRole !== 'user' && ticket.assignee && (
                            <span>
                              Assigned to{' '}
                              {typeof ticket.assignee === 'string'
                                ? ticket.assignee
                                : `${ticket.assignee.firstName || ''} ${ticket.assignee.lastName || ''}`.trim() ||
                                  ticket.assignee.email}
                            </span>
                          )}
                          <span>{formatTimeAgo(ticket.createdAt)}</span>
                        </div>
                      </div>
                      <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
