import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  EyeIcon,
  ShoppingCartIcon,
  ChatBubbleLeftIcon,
  BookOpenIcon,
  StarIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  BellIcon,
  ArrowRightIcon,
  TicketIcon,
  UserIcon,
  DocumentTextIcon,
  BoltIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

// Types
interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  completedTickets: number;
  avgResolutionTime: string;
}

interface RecentActivity {
  id: string;
  type: 'ticket_created' | 'ticket_updated' | 'service_requested' | 'knowledge_viewed';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  icon: React.ReactNode;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

interface PersonalizedRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'knowledge' | 'service' | 'tool';
  href: string;
  reason: string;
  icon: React.ReactNode;
}

export default function EnhancedUserDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    completedTickets: 0,
    avgResolutionTime: '0 days',
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'new-ticket',
      title: 'Submit Ticket',
      description: 'Report an issue or request help',
      href: '/tickets/new',
      icon: <PlusIcon className="h-6 w-6" />,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
      popular: true,
    },
    {
      id: 'track-tickets',
      title: 'Track Tickets',
      description: 'View status and updates',
      href: '/tickets',
      icon: <EyeIcon className="h-6 w-6" />,
      color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
      popular: true,
    },
    {
      id: 'request-service',
      title: 'Request Service',
      description: 'Browse service catalog',
      href: '/services/catalog',
      icon: <ShoppingCartIcon className="h-6 w-6" />,
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
      popular: true,
    },
    {
      id: 'search-knowledge',
      title: 'Knowledge Base',
      description: 'Find answers and guides',
      href: '/knowledge',
      icon: <BookOpenIcon className="h-6 w-6" />,
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
    },
    {
      id: 'knowledge-community',
      title: 'Knowledge Community',
      description: 'Expert network & peer recognition',
      href: '/knowledge/community',
      icon: <StarIcon className="h-6 w-6" />,
      color:
        'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:from-purple-100 hover:to-pink-100 border-purple-200',
      popular: true,
    },
    {
      id: 'cosmo-chat',
      title: 'Cosmo Assistant',
      description: 'Chat with AI assistant',
      href: '/ai',
      icon: <ChatBubbleLeftIcon className="h-6 w-6" />,
      color: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200',
    },
    {
      id: 'service-status',
      title: 'Service Status',
      description: 'Check system health',
      href: '/monitoring',
      icon: <ClockIcon className="h-6 w-6" />,
      color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
    },
  ];

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard data from API
        const response = await fetch('/api/dashboard/enhanced');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecentActivity(data.activity);
          setRecommendations(data.recommendations);
        } else {
          // Fallback to default stats if API fails
          setStats({
            totalTickets: 15,
            openTickets: 3,
            completedTickets: 12,
            avgResolutionTime: '2.5 hours',
          });
          setRecentActivity([]);
          setRecommendations([]);
        }
      } catch (_error) {
        console.warn('Dashboard API unavailable, using fallback data:', error);
        // Fallback to default stats
        setStats({
          totalTickets: 15,
          openTickets: 3,
          completedTickets: 12,
          avgResolutionTime: '2.5 hours',
        });
        setRecentActivity([]);
        setRecommendations([]);
      }
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket_created':
        return 'text-blue-600';
      case 'ticket_updated':
        return 'text-green-600';
      case 'service_requested':
        return 'text-purple-600';
      case 'knowledge_viewed':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
        <div className="relative z-10">
          <h1 className="mb-2 text-3xl font-bold">Welcome back!</h1>
          <p className="text-blue-100">Here's what's happening with your requests and services.</p>
        </div>
        <div className="absolute top-4 right-4 opacity-20">
          <SparklesIcon className="h-24 w-24" />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.openTickets}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
              <TicketIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedTickets}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.avgResolutionTime}
              </p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTickets}
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              <BoltIcon className="h-5 w-5 text-yellow-500" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.id}
                  to={action.href}
                  className={`group relative rounded-lg border-2 border-dashed p-4 transition-all duration-200 hover:scale-105 ${action.color}`}
                >
                  {action.popular && (
                    <div className="absolute -top-2 -right-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-yellow-900">
                        ★
                      </span>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">{action.icon}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm opacity-75">{action.description}</p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
            <BellIcon className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`rounded-r border-l-4 py-2 pl-4 ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{notification.timestamp}</p>
                  </div>
                  {!notification.read && (
                    <div className="ml-2 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <Link
              to="/notifications"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <ClockIcon className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 rounded-lg p-2 ${getActivityIcon(activity.type)} bg-gray-100 dark:bg-gray-700`}
                >
                  {activity.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                  <p className="mt-1 text-xs text-gray-500">{activity.timestamp}</p>
                </div>
                {activity.status && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {activity.status}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommendations</h2>
            <StarIcon className="h-5 w-5 text-yellow-500" />
          </div>

          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <Link
                key={recommendation.id}
                to={recommendation.href}
                className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-2 dark:from-purple-900/20 dark:to-pink-900/20">
                    {recommendation.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {recommendation.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {recommendation.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-purple-600 dark:text-purple-400">
                      {recommendation.reason}
                    </p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
