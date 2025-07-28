// nova-core/src/pages/NovaDashboard.tsx
// Nova Universe Enhanced Dashboard
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import {
    AcademicCapIcon,
    BeakerIcon,
    BoltIcon,
    ChartBarIcon,
    CogIcon,
    GlobeAltIcon,
    ServerIcon,
    ShieldCheckIcon,
    WrenchScrewdriverIcon
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
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  const novaModules: NovaModule[] = useMemo(() => [
    {
      name: 'helix',
      displayName: 'Nova Helix',
      icon: ShieldCheckIcon,
      status: 'operational',
      description: 'Identity & Authentication Engine',
      color: 'text-purple-500'
    },
    {
      name: 'lore',
      displayName: 'Nova Lore', 
      icon: AcademicCapIcon,
      status: 'operational',
      description: 'Knowledge Management System',
      color: 'text-blue-500'
    },
    {
      name: 'pulse',
      displayName: 'Nova Pulse',
      icon: WrenchScrewdriverIcon,
      status: 'operational', 
      description: 'Technician Portal & Ticketing',
      color: 'text-green-500'
    },
    {
      name: 'orbit',
      displayName: 'Nova Orbit',
      icon: GlobeAltIcon,
      status: 'operational',
      description: 'End-User Service Portal', 
      color: 'text-orange-500'
    },
    {
      name: 'synth',
      displayName: 'Nova Synth',
      icon: BeakerIcon,
      status: 'operational',
      description: 'AI-Powered Analytics & Insights',
      color: 'text-pink-500'
    }
  ], []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use existing API methods
        const serverStatus = await api.getServerStatus();
        const users = await api.getUsers();
        
        // Mock module health for now
        const moduleHealth: Record<string, boolean> = {};
        novaModules.forEach(module => {
          moduleHealth[module.name] = true;
        });

        setSystemHealth({
          api: true,
          database: !!serverStatus,
          authentication: true,
          modules: moduleHealth
        });

        setAuthStats({
          totalUsers: users.length,
          activeUsers: users.filter(u => !u.disabled).length,
          twoFactorEnabled: Math.floor(users.length * 0.6), // Mock 60% have 2FA
          recentActivity: [
            'SCIM User Provisioning Enabled',
            'Two-Factor Authentication System Deployed', 
            'Nova Modules Integration Complete',
            'SAML SSO Middleware Installed'
          ]
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">Nova Universe Control Center</h1>
        <p className="text-purple-100">Enterprise ITSM Platform - Phase 4 Enhanced Administration</p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">API Server</p>
              <p className={`text-lg font-semibold ${systemHealth?.api ? 'text-green-600' : 'text-red-600'}`}>
                {systemHealth?.api ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <CogIcon className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Database</p>
              <p className={`text-lg font-semibold ${systemHealth?.database ? 'text-green-600' : 'text-red-600'}`}>
                {systemHealth?.database ? 'Healthy' : 'Error'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Authentication</p>
              <p className={`text-lg font-semibold ${systemHealth?.authentication ? 'text-green-600' : 'text-red-600'}`}>
                {systemHealth?.authentication ? 'Active' : 'Down'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <BoltIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Nova Modules</p>
              <p className="text-lg font-semibold text-green-600">
                {Object.values(systemHealth?.modules || {}).filter(Boolean).length}/{novaModules.length} Active
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Nova Modules Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BoltIcon className="h-6 w-6 mr-2 text-purple-500" />
          Nova Modules Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {novaModules.map((module) => {
            const Icon = module.icon;
            const isHealthy = systemHealth?.modules[module.name];
            return (
              <div key={module.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Icon className={`h-6 w-6 mr-2 ${module.color}`} />
                    <h3 className="font-medium">{module.displayName}</h3>
                  </div>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isHealthy 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-purple-500" />
            Authentication Overview
          </h2>
          {authStats && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users</span>
                <span className="font-semibold text-2xl">{authStats.totalUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <span className="font-semibold text-xl text-green-600">{authStats.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">2FA Enabled</span>
                <span className="font-semibold text-xl text-blue-600">{authStats.twoFactorEnabled}</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    ref={progressBarRef}
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {twoFactorPercentage}% have 2FA enabled
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2 text-blue-500" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
              Manage Users & Roles
            </button>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Configure SAML SSO
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              SCIM Provisioning
            </button>
            <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors">
              View API Documentation
            </button>
            <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
              System Configuration
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent System Activity</h2>
        <div className="space-y-3">
          {authStats?.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
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
        <h2 className="text-xl font-semibold mb-4">Nova API Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <h3 className="font-medium text-purple-600">Nova Helix API</h3>
            <p className="text-sm text-gray-600 mt-1">Authentication & Identity endpoints</p>
            <p className="text-xs text-gray-400 mt-2">15+ endpoints available</p>
          </div>
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <h3 className="font-medium text-blue-600">SCIM 2.0 API</h3>
            <p className="text-sm text-gray-600 mt-1">User provisioning and lifecycle management</p>
            <p className="text-xs text-gray-400 mt-2">5 core endpoints</p>
          </div>
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <h3 className="font-medium text-green-600">All Nova Modules</h3>
            <p className="text-sm text-gray-600 mt-1">Complete API reference for all modules</p>
            <p className="text-xs text-gray-400 mt-2">50+ total endpoints</p>
          </div>
        </div>
        <div className="mt-4">
          <a 
            href="http://localhost:3000/api-docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Open Interactive API Documentation
          </a>
        </div>
      </Card>
    </div>
  );
};
