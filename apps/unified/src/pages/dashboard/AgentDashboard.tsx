import { useState, useEffect } from 'react';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ChartBarIcon,
  InboxIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface AgentStats {
  assignedTickets: number;
  resolvedToday: number;
  avgResponseTime: string;
  customerSatisfaction: number;
  ticketsInProgress: number;
  escalatedTickets: number;
  newAssignments: number;
  pendingApprovals: number;
}

interface RecentTicket {
  id: string;
  title: string;
  customer: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  assignedAt: string;
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        assignedTickets: 12,
        resolvedToday: 8,
        avgResponseTime: '2.5 hrs',
        customerSatisfaction: 4.7,
        ticketsInProgress: 5,
        escalatedTickets: 2,
        newAssignments: 3,
        pendingApprovals: 1,
      });
      setRecentTickets([
        {
          id: 'TKT-1001',
          title: 'Unable to access company WiFi',
          customer: 'John Smith',
          priority: 'high',
          status: 'In Progress',
          assignedAt: '2 hours ago',
        },
        {
          id: 'TKT-1002',
          title: 'Printer not responding',
          customer: 'Sarah Johnson',
          priority: 'medium',
          status: 'New',
          assignedAt: '30 minutes ago',
        },
        {
          id: 'TKT-1003',
          title: 'Software installation request',
          customer: 'Mike Davis',
          priority: 'low',
          status: 'Pending Approval',
          assignedAt: '1 hour ago',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Dashboard</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here's your workload for today.
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TicketIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Assigned Tickets
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.assignedTickets}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved Today</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.resolvedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Avg Response Time
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.avgResponseTime}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Satisfaction Score
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.customerSatisfaction}/5.0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Work Status and Recent Tickets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Work Status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Work Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">In Progress</span>
              <div className="flex items-center">
                <ClockIcon className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {stats?.ticketsInProgress} tickets
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Escalated</span>
              <div className="flex items-center">
                <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">
                  {stats?.escalatedTickets} tickets
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">New Assignments</span>
              <div className="flex items-center">
                <InboxIcon className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">
                  {stats?.newAssignments} tickets
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Pending Approval</span>
              <div className="flex items-center">
                <CheckCircleIcon className="mr-2 h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">
                  {stats?.pendingApprovals} tickets
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Recent Assignments
          </h3>
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start space-x-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.id}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-gray-700 dark:text-gray-300">{ticket.title}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <UserIcon className="mr-1 h-3 w-3" />
                    {ticket.customer} • {ticket.assignedAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center rounded-lg bg-blue-50 px-4 py-3 text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30">
            <TicketIcon className="mr-2 h-5 w-5" />
            My Tickets
          </button>
          <button className="flex items-center justify-center rounded-lg bg-green-50 px-4 py-3 text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30">
            <InboxIcon className="mr-2 h-5 w-5" />
            New Assignments
          </button>
          <button className="flex items-center justify-center rounded-lg bg-amber-50 px-4 py-3 text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30">
            <ClockIcon className="mr-2 h-5 w-5" />
            Time Tracking
          </button>
          <button className="flex items-center justify-center rounded-lg bg-purple-50 px-4 py-3 text-purple-700 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30">
            <ChartBarIcon className="mr-2 h-5 w-5" />
            My Performance
          </button>
        </div>
      </div>
    </div>
  );
}
