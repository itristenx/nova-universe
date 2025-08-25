import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCulturalFormatting } from '../../utils/culturalFormatting';
import {
  UsersIcon,
  TicketIcon,
  ServerStackIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  activeTickets: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  serverUptime: string;
  recentAlerts: number;
  completedTasks: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const formatting = useCulturalFormatting();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        activeTickets: 23,
        systemHealth: 'healthy',
        serverUptime: '99.9%',
        recentAlerts: 3,
        completedTasks: 156,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.title')}
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('admin.dashboard.lastUpdated')}: {formatting.formatTime(new Date())}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.metrics.totalUsers')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatting.formatNumber(stats?.totalUsers || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TicketIcon className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.metrics.activeTickets')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatting.formatNumber(stats?.activeTickets || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ServerStackIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.metrics.serverUptime')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats?.serverUptime}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.metrics.completedTasks')}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatting.formatNumber(stats?.completedTasks || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Health */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Overall Status</span>
              <div className="flex items-center">
                <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Database</span>
              <div className="flex items-center">
                <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">API Services</span>
              <div className="flex items-center">
                <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">Running</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Background Jobs</span>
              <div className="flex items-center">
                <ClockIcon className="mr-2 h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-600">Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Recent Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  High CPU usage detected
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Server load at 85% - 2 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircleIcon className="mt-0.5 h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Database backup completed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Weekly backup successful - 1 hour ago
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <ArrowTrendingUpIcon className="mt-0.5 h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  User registration spike
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  50 new users in the last hour - 3 hours ago
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
            <UsersIcon className="mr-2 h-5 w-5" />
            Manage Users
          </button>
          <button className="flex items-center justify-center rounded-lg bg-amber-50 px-4 py-3 text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/30">
            <TicketIcon className="mr-2 h-5 w-5" />
            View Tickets
          </button>
          <button className="flex items-center justify-center rounded-lg bg-green-50 px-4 py-3 text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30">
            <ServerStackIcon className="mr-2 h-5 w-5" />
            System Status
          </button>
          <button className="flex items-center justify-center rounded-lg bg-purple-50 px-4 py-3 text-purple-700 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30">
            <ChartBarIcon className="mr-2 h-5 w-5" />
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
}
