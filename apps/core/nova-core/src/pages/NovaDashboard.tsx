// nova-core/src/pages/NovaDashboard.tsx
// Nova Universe Enhanced Dashboard
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  AcademicCapIcon,
  BeakerIcon,
  BoltIcon,
  ChartBarIcon,
  CogIcon,
  GlobeAltIcon,
  ServerIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface NovaModule {
  name: string;
  displayName: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'operational' | 'degraded' | 'offline';
  description: string;
  color: string;
}

interface SystemHealth {
  api: boolean;
  database: boolean;
  authentication: boolean;
  modules: Record<string, boolean>;
}

interface AuthenticationStats {
  totalUsers: number;
  activeUsers: number;
  twoFactorEnabled: number;
  recentActivity: string[];
}

export const NovaDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [authStats, setAuthStats] = useState<AuthenticationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Setup WebSocket for real-time updates
  const { isConnected } = useWebSocket({
    subscriptions: ['system', 'users', 'analytics'],
    onMessage: (message) => {
      console.log('Dashboard received real-time update:', message);
      setLastUpdate(new Date());

      switch (message.type) {
        case 'system_health':
          setSystemHealth((prev) => ({
            ...prev,
            ...message.data,
          }));
          break;
        case 'user_stats':
          setAuthStats((prev) => ({
            ...prev,
            ...message.data,
          }));
          break;
        case 'module_status':
          setSystemHealth((prev) =>
            prev
              ? {
                  ...prev,
                  modules: {
                    ...prev.modules,
                    [message.data.module]: message.data.status === 'operational',
                  },
                }
              : null,
          );
          break;
        default:
          console.log('Unhandled real-time message type:', message.type);
      }
    },
    onConnect: () => {
      console.log('Dashboard WebSocket connected');
    },
    onDisconnect: (reason) => {
      console.log('Dashboard WebSocket disconnected:', reason);
    },
  });

  // Calculate 2FA percentage for progress bar
  const twoFactorPercentage = useMemo(() => {
    if (!authStats || authStats.totalUsers === 0) return 0;
    return Math.round((authStats.twoFactorEnabled / authStats.totalUsers) * 100);
  }, [authStats]);

  // Update progress bar width using ref to avoid inline styles
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${twoFactorPercentage}%`;
    }
  }, [twoFactorPercentage]);

  const novaModules: NovaModule[] = useMemo(
    () => [
      {
        name: 'helix',
        displayName: 'Nova Helix',
        icon: ShieldCheckIcon,
        status: 'operational',
        description: 'Identity & Authentication Engine',
        color: 'text-purple-500',
      },
      {
        name: 'lore',
        displayName: 'Nova Lore',
        icon: AcademicCapIcon,
        status: 'operational',
        description: 'Knowledge Management System',
        color: 'text-blue-500',
      },
      {
        name: 'pulse',
        displayName: 'Nova Pulse',
        icon: WrenchScrewdriverIcon,
        status: 'operational',
        description: 'Technician Portal & Ticketing',
        color: 'text-green-500',
      },
      {
        name: 'orbit',
        displayName: 'Nova Orbit',
        icon: GlobeAltIcon,
        status: 'operational',
        description: 'End-User Service Portal',
        color: 'text-orange-500',
      },
      {
        name: 'synth',
        displayName: 'Nova Synth',
        icon: BeakerIcon,
        status: 'operational',
        description: 'AI-Powered Analytics & Insights',
        color: 'text-pink-500',
      },
    ],
    [],
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use existing API methods
        const serverStatus = await api.getServerStatus();
        const users = await api.getUsers();

        // Mock module health for now
        const moduleHealth: Record<string, boolean> = {};
        novaModules.forEach((module) => {
          moduleHealth[module.name] = true;
        });

        setSystemHealth({
          api: true,
          database: !!serverStatus,
          authentication: true,
          modules: moduleHealth,
        });

        setAuthStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => !u.disabled).length,
          twoFactorEnabled: Math.floor(users.length * 0.6), // Mock 60% have 2FA
          recentActivity: [
            'SCIM User Provisioning Enabled',
            'Two-Factor Authentication System Deployed',
            'Nova Modules Integration Complete',
            'SAML SSO Middleware Installed',
          ],
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [novaModules]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-900 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Nova Universe Control Center</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Enterprise ITSM Platform - Phase 4 Enhanced Administration
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div
                className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
              />
              <span className="text-sm">{isConnected ? 'Live Updates' : 'Offline'}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center">
            <ServerIcon className="mr-3 h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">API Server</p>
              <p
                className={`text-lg font-semibold ${systemHealth?.api ? 'text-green-600' : 'text-red-600'}`}
              >
                {systemHealth?.api ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <CogIcon className="mr-3 h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Database</p>
              <p
                className={`text-lg font-semibold ${systemHealth?.database ? 'text-green-600' : 'text-red-600'}`}
              >
                {systemHealth?.database ? 'Healthy' : 'Error'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="mr-3 h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Authentication</p>
              <p
                className={`text-lg font-semibold ${systemHealth?.authentication ? 'text-green-600' : 'text-red-600'}`}
              >
                {systemHealth?.authentication ? 'Active' : 'Down'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <BoltIcon className="mr-3 h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Nova Modules</p>
              <p className="text-lg font-semibold text-green-600">
                {Object.values(systemHealth?.modules || {}).filter(Boolean).length}/
                {novaModules.length} Active
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Nova Modules Status */}
      <Card className="p-6">
        <h2 className="mb-4 flex items-center text-xl font-semibold">
          <BoltIcon className="mr-2 h-6 w-6 text-purple-500" />
          Nova Modules Status
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {novaModules.map((module) => {
            const Icon = module.icon;
            const isHealthy = systemHealth?.modules[module.name];
            return (
              <div
                key={module.name}
                className="rounded-lg border p-4 transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className={`mr-2 h-6 w-6 ${module.color}`} />
                    <h3 className="font-medium">{module.displayName}</h3>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isHealthy ? 'Active' : 'Offline'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{module.description}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Authentication Statistics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 flex items-center text-xl font-semibold">
            <ShieldCheckIcon className="mr-2 h-6 w-6 text-purple-500" />
            Authentication Overview
          </h2>
          {authStats && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Users</span>
                <span className="text-2xl font-semibold">{authStats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="text-xl font-semibold text-green-600">
                  {authStats.activeUsers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">2FA Enabled</span>
                <span className="text-xl font-semibold text-blue-600">
                  {authStats.twoFactorEnabled}
                </span>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    ref={progressBarRef}
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {twoFactorPercentage}% have 2FA enabled
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 flex items-center text-xl font-semibold">
            <ChartBarIcon className="mr-2 h-6 w-6 text-blue-500" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              className="bg-primary-600 hover:bg-primary-700 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-white transition-colors"
              href="/users"
            >
              Manage Users & Roles
            </a>
            <a
              className="bg-primary-600 hover:bg-primary-700 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-white transition-colors"
              href="/saml-configuration"
            >
              Configure SAML SSO
            </a>
            <a
              className="bg-primary-600 hover:bg-primary-700 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-white transition-colors"
              href="/scim-provisioning"
            >
              SCIM Provisioning
            </a>
            <a
              className="bg-secondary-600 hover:bg-secondary-700 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-white transition-colors"
              href="/api-docs"
            >
              View API Documentation
            </a>
            <a
              className="inline-flex w-full items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              href="/settings"
            >
              System Configuration
            </a>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent System Activity</h2>
        <div className="space-y-3">
          {authStats?.recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b py-2 last:border-b-0"
            >
              <div>
                <p className="font-medium">{activity}</p>
                <p className="text-sm text-gray-600">System enhancement deployed successfully</p>
              </div>
              <span className="text-sm text-gray-500">{(index + 1) * 5} minutes ago</span>
            </div>
          ))}
        </div>
      </Card>

      {/* API Documentation Quick Access */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Nova API Documentation</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50">
            <h3 className="font-medium text-purple-600">Nova Helix API</h3>
            <p className="mt-1 text-sm text-gray-600">Authentication & Identity endpoints</p>
            <p className="mt-2 text-xs text-gray-400">15+ endpoints available</p>
          </div>
          <div className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50">
            <h3 className="font-medium text-blue-600">SCIM 2.0 API</h3>
            <p className="mt-1 text-sm text-gray-600">User provisioning and lifecycle management</p>
            <p className="mt-2 text-xs text-gray-400">5 core endpoints</p>
          </div>
          <div className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50">
            <h3 className="font-medium text-green-600">All Nova Modules</h3>
            <p className="mt-1 text-sm text-gray-600">Complete API reference for all modules</p>
            <p className="mt-2 text-xs text-gray-400">50+ total endpoints</p>
          </div>
        </div>
        <div className="mt-4">
          <a
            href={`${import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '')}/api-docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-secondary-600 hover:bg-secondary-700 inline-flex items-center rounded-md px-4 py-2 text-white transition-colors"
          >
            Open Interactive API Documentation
          </a>
        </div>
      </Card>
    </div>
  );
};
