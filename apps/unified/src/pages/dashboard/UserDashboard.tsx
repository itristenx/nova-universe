import { useState, useEffect } from 'react';
import {
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface UserStats {
  openTickets: number;
  resolvedTickets: number;
  avgResolutionTime: string;
  upcomingMeetings: number;
  recentRequests: number;
  knowledgeBaseViews: number;
}

interface RecentTicket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        openTickets: 3,
        resolvedTickets: 12,
        avgResolutionTime: '1.2 days',
        upcomingMeetings: 2,
        recentRequests: 5,
        knowledgeBaseViews: 8,
      });
      setRecentTickets([
        {
          id: 'TKT-1001',
          title: 'Request for software license',
          status: 'In Progress',
          createdAt: '2 days ago',
          priority: 'medium',
        },
        {
          id: 'TKT-1002',
          title: 'Laptop keyboard replacement',
          status: 'Waiting for Parts',
          createdAt: '1 week ago',
          priority: 'high',
        },
        {
          id: 'TKT-1003',
          title: 'VPN access setup',
          status: 'Resolved',
          createdAt: '2 weeks ago',
          priority: 'low',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in progress':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'waiting for parts':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'open':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
        <button className="bg-nova-600 hover:bg-nova-700 focus:ring-nova-500 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
          <PlusIcon className="mr-2 h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TicketIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Requests</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.openTickets}
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.resolvedTickets}
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Resolution</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.avgResolutionTime}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Upcoming Meetings
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.upcomingMeetings}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tickets */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Requests</h3>
            <button className="text-nova-600 hover:text-nova-700 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`border-l-4 ${getPriorityColor(ticket.priority)} rounded-r-lg bg-gray-50 p-3 dark:bg-gray-700/50`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.id}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="mb-1 text-sm text-gray-700 dark:text-gray-300">{ticket.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created {ticket.createdAt}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Resources */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Help & Resources
          </h3>
          <div className="space-y-3">
            <div className="flex items-center rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <BookOpenIcon className="mr-3 h-6 w-6 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Knowledge Base</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Find answers to common questions
                </p>
              </div>
            </div>
            <div className="flex items-center rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <ChatBubbleLeftIcon className="mr-3 h-6 w-6 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Live Chat Support
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Get instant help from our team
                </p>
              </div>
            </div>
            <div className="flex items-center rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
              <QuestionMarkCircleIcon className="mr-3 h-6 w-6 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Video Tutorials</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Step-by-step guides and tutorials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center rounded-lg bg-blue-50 px-4 py-3 text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30">
            <PlusIcon className="mr-2 h-5 w-5" />
            New Request
          </button>
          <button className="flex items-center justify-center rounded-lg bg-green-50 px-4 py-3 text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30">
            <TicketIcon className="mr-2 h-5 w-5" />
            My Requests
          </button>
          <button className="flex items-center justify-center rounded-lg bg-amber-50 px-4 py-3 text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30">
            <ChatBubbleLeftIcon className="mr-2 h-5 w-5" />
            Contact Support
          </button>
          <button className="flex items-center justify-center rounded-lg bg-purple-50 px-4 py-3 text-purple-700 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30">
            <BookOpenIcon className="mr-2 h-5 w-5" />
            Help Center
          </button>
        </div>
      </div>
    </div>
  );
}
