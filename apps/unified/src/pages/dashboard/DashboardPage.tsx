import { useAuthStore } from '@stores/auth';
import { DashboardStats } from '@components/dashboard/DashboardStats';
import { QuickActions } from '@components/dashboard/QuickActions';
import { RecentActivity } from '@components/dashboard/RecentActivity';
import { TicketOverview } from '@components/dashboard/TicketOverview';
import { AssetOverview } from '@components/dashboard/AssetOverview';
import { SpaceOverview } from '@components/dashboard/SpaceOverview';
import { getUserDisplayName } from '@utils/index';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  ServerIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation('dashboard');
  const [systemMetrics, setSystemMetrics] = useState({
    apiStatus: 'healthy',
    dbConnections: 45,
    activeUsers: 128,
    systemLoad: 23,
    uptime: '99.9%',
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  const getUserRole = () => {
    if (!user?.roles) return 'user';
    if (user.roles.some((role) => role.name === 'admin')) return 'admin';
    if (user.roles.some((role) => role.name === 'agent')) return 'agent';
    return 'user';
  };

  const userRole = getUserRole();
  const isAdmin = userRole === 'admin';
  const isAgent = userRole === 'agent';
  const isUser = userRole === 'user';

  // Simulate real-time system metrics updates
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      setSystemMetrics((prev) => ({
        ...prev,
        dbConnections: Math.floor(Math.random() * 20) + 40,
        activeUsers: Math.floor(Math.random() * 50) + 100,
        systemLoad: Math.floor(Math.random() * 30) + 15,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/10">
      {/* Background patterns for Apple-style depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-600/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-600/10 blur-3xl"></div>
      </div>

      <div className="relative space-y-8 p-8">
        {/* Enhanced Welcome Section with Apple Glass Morphism */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl ring-1 ring-white/20 dark:ring-gray-700/50 p-8 transition-all duration-300 hover:shadow-3xl">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Nova Universe Dashboard
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Welcome to your unified ITSM platform
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Online</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getGreeting()}, {user ? getUserDisplayName(user) : 'User'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-semibold">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Cards - Industry Leader Inspired */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tickets Card - ServiceNow Style */}
          <div className="group backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl ring-1 ring-white/20 dark:ring-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">23</div>
                <div className="text-xs text-green-600 font-medium">↓ 12%</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Tickets</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Manage support tickets</p>
          </div>

          {/* Assets Card - Jira Style */}
          <div className="group backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl ring-1 ring-white/20 dark:ring-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">1,247</div>
                <div className="text-xs text-blue-600 font-medium">↑ 5%</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Assets</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Track your assets</p>
          </div>

          {/* Knowledge Base Card - Zendesk Style */}
          <div className="group backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl ring-1 ring-white/20 dark:ring-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">892</div>
                <div className="text-xs text-purple-600 font-medium">Articles</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Knowledge Base</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Browse documentation</p>
          </div>

          {/* Administration Card */}
          <div className="group backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl ring-1 ring-white/20 dark:ring-gray-700/50 p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">99.9%</div>
                <div className="text-xs text-green-600 font-medium">Uptime</div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Administration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">System settings</p>
          </div>
        </div>

        {/* Enhanced Quick Actions - Apple Button Style */}
        <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-xl ring-1 ring-white/20 dark:ring-gray-700/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="group relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold">Create Ticket</span>
              </div>
            </button>

            <button className="group relative p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold">Add Asset</span>
              </div>
            </button>

            <button className="group relative p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">View Reports</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
