/**
 * Enhanced Apple-style Administrative Dashboard
 * Professional system health monitoring with Apple design and ServiceNow functionality
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CpuChipIcon,
  ServerIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CogIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from '@components/common/GlassCard';
import { AppleButton } from '@components/common/AppleButton';
import { StatusBadge } from '@components/common/AppleBadges';
import { cn, cardHoverEffect } from '@utils/apple-utils';
import { fadeInAnimation } from '@utils/apple-utils';

// System metrics interface
interface SystemMetrics {
  apiStatus: 'healthy' | 'degraded' | 'down';
  dbConnections: number;
  activeUsers: number;
  systemLoad: number;
  uptime: string;
  responseTime: number;
  errorRate: number;
  ticketVolume: {
    today: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  resolution: {
    avgTime: string;
    slaCompliance: number;
  };
}

// Service health interface
interface ServiceHealth {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: string;
  responseTime: number;
  lastCheck: Date;
  endpoint?: string;
}

// Recent activity interface
interface Activity {
  id: string;
  type: 'ticket' | 'user' | 'system' | 'security';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export default function EnhancedAdminDashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    apiStatus: 'healthy',
    dbConnections: 45,
    activeUsers: 128,
    systemLoad: 23,
    uptime: '99.9%',
    responseTime: 245,
    errorRate: 0.02,
    ticketVolume: {
      today: 47,
      trend: 'up',
      percentage: 12
    },
    resolution: {
      avgTime: '4.2h',
      slaCompliance: 94.5
    }
  });

  const [services, setServices] = useState<ServiceHealth[]>([
    {
      name: 'User Authentication',
      status: 'operational',
      uptime: '99.95%',
      responseTime: 120,
      lastCheck: new Date(),
      endpoint: '/auth/health'
    },
    {
      name: 'Ticket Management',
      status: 'operational',
      uptime: '99.99%',
      responseTime: 89,
      lastCheck: new Date(),
      endpoint: '/api/tickets'
    },
    {
      name: 'File Storage',
      status: 'degraded',
      uptime: '98.2%',
      responseTime: 450,
      lastCheck: new Date(),
      endpoint: '/api/files'
    },
    {
      name: 'Email Service',
      status: 'operational',
      uptime: '99.8%',
      responseTime: 340,
      lastCheck: new Date(),
      endpoint: '/api/email'
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: '99.95%',
      responseTime: 15,
      lastCheck: new Date(),
      endpoint: '/db/health'
    }
  ]);

  const [recentActivity, setRecentActivity] = useState<Activity[]>([
    {
      id: '1',
      type: 'ticket',
      title: 'Critical incident resolved',
      description: 'Email server outage affecting 200+ users',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      user: 'John Smith',
      severity: 'critical'
    },
    {
      id: '2',
      type: 'system',
      title: 'Database maintenance completed',
      description: 'Scheduled maintenance window executed successfully',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      user: 'System',
      severity: 'low'
    },
    {
      id: '3',
      type: 'user',
      title: 'New user account created',
      description: 'Sarah Johnson added to Engineering team',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: 'Admin Console',
      severity: 'low'
    },
    {
      id: '4',
      type: 'security',
      title: 'Failed login attempts detected',
      description: 'Multiple failed attempts from IP 192.168.1.100',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      user: 'Security Monitor',
      severity: 'medium'
    }
  ]);

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        systemLoad: Math.max(0, Math.min(100, prev.systemLoad + Math.floor(Math.random() * 6 - 3))),
        responseTime: Math.max(50, prev.responseTime + Math.floor(Math.random() * 20 - 10))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-orange-600 bg-orange-100';
      case 'outage':
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return <BoltIcon className="h-5 w-5" />;
      case 'user':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'system':
        return <CogIcon className="h-5 w-5" />;
      case 'security':
        return <ShieldCheckIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8" {...fadeInAnimation()}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                System Dashboard
              </h1>
              <p className="text-xl text-gray-600">
                Monitor system health, performance, and user activity in real-time
              </p>
            </div>

            <div className="flex gap-3">
              <AppleButton
                variant="secondary"
                onClick={() => navigate('/admin/settings')}
                leftIcon={<CogIcon className="h-5 w-5" />}
              >
                Settings
              </AppleButton>
              
              <AppleButton
                onClick={() => navigate('/admin/reports')}
                leftIcon={<ChartBarIcon className="h-5 w-5" />}
              >
                View Reports
              </AppleButton>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" {...fadeInAnimation(0.1)}>
          {/* API Status */}
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    metrics.apiStatus === 'healthy' && 'bg-green-500',
                    metrics.apiStatus === 'degraded' && 'bg-orange-500',
                    metrics.apiStatus === 'down' && 'bg-red-500'
                  )} />
                  <span className="text-sm font-medium text-gray-600">API Status</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {metrics.apiStatus}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <ServerIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </GlassCard>

          {/* Active Users */}
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Active Users</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.activeUsers}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowTrendingUpIcon className="h-3 w-3" />
                  <span>+8% from yesterday</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </GlassCard>

          {/* System Load */}
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">System Load</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.systemLoad}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={cn(
                      'h-2 rounded-full transition-all duration-500',
                      metrics.systemLoad > 80 ? 'bg-red-500' :
                      metrics.systemLoad > 60 ? 'bg-orange-500' : 'bg-green-500'
                    )}
                    style={{ width: `${metrics.systemLoad}%` }}
                  />
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <CpuChipIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </GlassCard>

          {/* Response Time */}
          <GlassCard intensity="medium" hover="subtle" padding="md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Avg Response</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.responseTime}ms</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <ArrowTrendingDownIcon className="h-3 w-3" />
                  <span>-5ms from last hour</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Ticket Analytics */}
          <GlassCard intensity="medium" hover="subtle" padding="lg" {...fadeInAnimation(0.2)}>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BoltIcon className="h-6 w-6 text-blue-600" />
              Ticket Analytics
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Today's Volume</div>
                  <div className="text-2xl font-bold text-gray-900">{metrics.ticketVolume.today}</div>
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  metrics.ticketVolume.trend === 'up' ? 'text-red-600' : 'text-green-600'
                )}>
                  {metrics.ticketVolume.trend === 'up' ? 
                    <ArrowTrendingUpIcon className="h-4 w-4" /> :
                    <ArrowTrendingDownIcon className="h-4 w-4" />
                  }
                  <span>{metrics.ticketVolume.percentage}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <div className="text-sm font-medium text-gray-600">Avg Resolution</div>
                  <div className="text-lg font-semibold text-gray-900">{metrics.resolution.avgTime}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">SLA Compliance</div>
                  <div className="text-lg font-semibold text-green-600">{metrics.resolution.slaCompliance}%</div>
                </div>
              </div>

              <AppleButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/reports/tickets')}
                className="w-full"
              >
                View Detailed Reports
              </AppleButton>
            </div>
          </GlassCard>

          {/* Service Health */}
          <GlassCard intensity="medium" hover="subtle" padding="lg" {...fadeInAnimation(0.3)}>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
              Service Health
            </h3>

            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.name} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      service.status === 'operational' && 'bg-green-500',
                      service.status === 'degraded' && 'bg-orange-500',
                      service.status === 'outage' && 'bg-red-500'
                    )} />
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-xs text-gray-500">{service.responseTime}ms avg</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{service.uptime}</div>
                    <div className="text-xs text-gray-500">uptime</div>
                  </div>
                </div>
              ))}
            </div>

            <AppleButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/monitoring')}
              className="w-full mt-4"
            >
              View Full Status Page
            </AppleButton>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard intensity="medium" hover="subtle" padding="lg" {...fadeInAnimation(0.4)}>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ClockIcon className="h-6 w-6 text-purple-600" />
              Recent Activity
            </h3>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3 p-3 bg-white/50 rounded-xl">
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    activity.severity === 'critical' && 'bg-red-100 text-red-600',
                    activity.severity === 'high' && 'bg-orange-100 text-orange-600', 
                    activity.severity === 'medium' && 'bg-yellow-100 text-yellow-600',
                    activity.severity === 'low' && 'bg-gray-100 text-gray-600'
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{activity.title}</div>
                    <div className="text-xs text-gray-600 line-clamp-1">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatRelativeTime(activity.timestamp)} • {activity.user}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <AppleButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/activity')}
              className="w-full mt-4"
            >
              View All Activity
            </AppleButton>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <GlassCard intensity="medium" hover={false} padding="lg" {...fadeInAnimation(0.5)}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'User Management', icon: UserGroupIcon, path: '/admin/users', color: 'blue' },
              { name: 'System Config', icon: CogIcon, path: '/admin/settings', color: 'gray' },
              { name: 'Security Center', icon: ShieldCheckIcon, path: '/admin/security', color: 'green' },
              { name: 'Performance', icon: ChartBarIcon, path: '/admin/performance', color: 'purple' },
              { name: 'Integrations', icon: GlobeAltIcon, path: '/admin/integrations', color: 'orange' },
              { name: 'Maintenance', icon: ExclamationTriangleIcon, path: '/admin/maintenance', color: 'red' }
            ].map((action) => (
              <AppleButton
                key={action.name}
                variant="secondary"
                onClick={() => navigate(action.path)}
                className="h-20 flex-col gap-2 text-center"
              >
                <action.icon className="h-6 w-6" />
                <span className="text-xs">{action.name}</span>
              </AppleButton>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}