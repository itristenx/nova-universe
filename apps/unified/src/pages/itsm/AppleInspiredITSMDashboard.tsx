import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TicketIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@stores/auth';
import { ticketService, type TicketStats } from '@services/tickets';
import { AppleInspiredLayout } from '@components/layout/AppleInspiredLayout';
import { AppleCard, AppleCardHeader, AppleCardContent } from '@components/design-system/AppleCard';
import { AppleStatsCard, AppleStatsGrid } from '@components/design-system/AppleStatsCard';
import { AppleButton } from '@components/design-system/AppleButton';
import { AppleTable } from '@components/design-system/AppleTable';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { getUserDisplayName, formatRelativeTime } from '@utils/index';
import type { Ticket } from '@/types';

interface DashboardData {
  stats: TicketStats | null;
  recentTickets: Ticket[];
  isLoading: boolean;
  error: string | null;
}

export default function AppleInspiredITSMDashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: null,
    recentTickets: [],
    isLoading: true,
    error: null,
  });

  const getUserRole = () => {
    if (!user?.roles) return 'user';
    if (user.roles.some((role) => role.name === 'admin')) return 'admin';
    if (user.roles.some((role) => role.name === 'agent')) return 'agent';
    return 'user';
  };

  const userRole = getUserRole();
  const userName = getUserDisplayName(user);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Load stats and recent tickets in parallel
        const [statsResult, ticketsResult] = await Promise.allSettled([
          ticketService.getTicketStats(),
          ticketService.getTickets(1, 5), // Recent 5 tickets
        ]);

        const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;
        const tickets = ticketsResult.status === 'fulfilled' ? ticketsResult.value.data : [];

        setDashboardData({
          stats,
          recentTickets: tickets,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load dashboard data',
        }));
      }
    };

    loadDashboardData();
  }, []);

  if (dashboardData.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading your dashboard..." />
      </div>
    );
  }

  const stats = dashboardData.stats || {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    onHold: 0,
    averageResolutionTime: 0,
    slaBreaches: 0,
    byPriority: {},
    byType: {},
    byStatus: {},
    trends: [],
  };

  // Calculate resolution rate
  const resolutionRate = stats.total > 0 ? ((stats.resolved + stats.closed) / stats.total) * 100 : 0;
  
  // Calculate high priority percentage
  const highPriorityCount = (stats.byPriority?.high || 0) + (stats.byPriority?.critical || 0);
  const highPriorityRate = stats.total > 0 ? (highPriorityCount / stats.total) * 100 : 0;

  // Table columns for recent tickets
  const ticketColumns = [
    { key: 'id', title: 'ID', width: '80px' },
    { key: 'title', title: 'Title' },
    { key: 'status', title: 'Status', width: '120px' },
    { key: 'priority', title: 'Priority', width: '100px' },
    { key: 'createdAt', title: 'Created', width: '120px' },
  ];

  // Format tickets for table
  const formattedTickets = dashboardData.recentTickets.map(ticket => ({
    ...ticket,
    status: (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        ticket.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
        ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
        ticket.status === 'resolved' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      }`}>
        {ticket.status}
      </span>
    ),
    priority: (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        ticket.priority === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
        ticket.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
        ticket.priority === 'normal' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      }`}>
        {ticket.priority}
      </span>
    ),
    createdAt: formatRelativeTime(new Date(ticket.createdAt)),
  }));

  return (
    <AppleInspiredLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getGreeting()}, {userName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                Welcome to your Nova Universe ITSM dashboard
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/tickets/create">
                <AppleButton
                  variant="primary"
                  icon={<TicketIcon className="w-4 h-4" />}
                >
                  Create Ticket
                </AppleButton>
              </Link>
              <AppleButton
                variant="secondary"
                icon={<ChartBarIcon className="w-4 h-4" />}
              >
                View Reports
              </AppleButton>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <AppleStatsGrid columns={4}>
            <AppleStatsCard
              title="Total Tickets"
              value={stats.total}
              subtitle="All time"
              icon={<TicketIcon className="w-5 h-5" />}
              color="blue"
              trend={{
                value: 12,
                label: 'vs last month',
                direction: 'up',
              }}
            />
            <AppleStatsCard
              title="Open Tickets"
              value={stats.open + stats.inProgress}
              subtitle="Need attention"
              icon={<ClockIcon className="w-5 h-5" />}
              color="yellow"
              trend={{
                value: 8,
                label: 'vs last week',
                direction: 'down',
              }}
            />
            <AppleStatsCard
              title="Resolution Rate"
              value={`${resolutionRate.toFixed(1)}%`}
              subtitle="This month"
              icon={<CheckCircleIcon className="w-5 h-5" />}
              color="green"
              trend={{
                value: 15,
                label: 'vs last month',
                direction: 'up',
              }}
            />
            <AppleStatsCard
              title="High Priority"
              value={`${highPriorityRate.toFixed(1)}%`}
              subtitle="Critical & High"
              icon={<ExclamationTriangleIcon className="w-5 h-5" />}
              color="red"
              trend={{
                value: 5,
                label: 'vs last week',
                direction: 'down',
              }}
            />
          </AppleStatsGrid>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Distribution */}
          <AppleCard variant="elevated" className="lg:col-span-2">
            <AppleCardHeader
              title="Ticket Status Distribution"
              subtitle="Current status breakdown"
              action={
                <AppleButton variant="ghost" size="sm">
                  View All
                </AppleButton>
              }
            />
            <AppleCardContent>
              <div className="space-y-4">
                {Object.entries(stats.byStatus).map(([status, count]) => {
                  const percentage = stats.total > 0 ? (Number(count) / stats.total) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'open' ? 'bg-green-500' :
                          status === 'pending' ? 'bg-yellow-500' :
                          status === 'resolved' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 origin-left ${
                              status === 'open' ? 'bg-green-500' :
                              status === 'pending' ? 'bg-yellow-500' :
                              status === 'resolved' ? 'bg-blue-500' :
                              'bg-gray-500'
                            } ${percentage > 0 ? 'min-w-[2px]' : 'w-0'}`}
                            {...({ style: { width: `${Math.min(percentage, 100)}%` } } as any)}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-0">
                          {String(count)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AppleCardContent>
          </AppleCard>

          {/* Quick Actions */}
          <AppleCard variant="elevated">
            <AppleCardHeader
              title="Quick Actions"
              subtitle="Common tasks"
            />
            <AppleCardContent>
              <div className="space-y-3">
                <Link to="/tickets/create" className="block">
                  <AppleButton
                    variant="secondary"
                    fullWidth
                    icon={<TicketIcon className="w-4 h-4" />}
                  >
                    Create New Ticket
                  </AppleButton>
                </Link>
                <Link to="/tickets" className="block">
                  <AppleButton
                    variant="secondary"
                    fullWidth
                    icon={<UsersIcon className="w-4 h-4" />}
                  >
                    My Tickets
                  </AppleButton>
                </Link>
                <AppleButton
                  variant="secondary"
                  fullWidth
                  icon={<CpuChipIcon className="w-4 h-4" />}
                >
                  System Status
                </AppleButton>
                <AppleButton
                  variant="secondary"
                  fullWidth
                  icon={<ArrowTrendingUpIcon className="w-4 h-4" />}
                >
                  View Analytics
                </AppleButton>
              </div>
            </AppleCardContent>
          </AppleCard>
        </div>

        {/* Recent Tickets */}
        <AppleCard variant="elevated">
          <AppleCardHeader
            title="Recent Tickets"
            subtitle="Latest ticket activity"
            action={
              <Link to="/tickets">
                <AppleButton
                  variant="ghost"
                  size="sm"
                >
                  View All Tickets
                </AppleButton>
              </Link>
            }
          />
          <AppleCardContent>
            <AppleTable
              columns={ticketColumns}
              data={formattedTickets}
              onRowClick={(ticket) => window.open(`/tickets/${ticket.id}`, '_blank')}
              emptyState={
                <div className="text-center py-8">
                  <TicketIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No tickets yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Get started by creating your first ticket.
                  </p>
                  <Link to="/tickets/create">
                    <AppleButton
                      variant="primary"
                    >
                      Create Ticket
                    </AppleButton>
                  </Link>
                </div>
              }
            />
          </AppleCardContent>
        </AppleCard>
      </div>
    </AppleInspiredLayout>
  );
}