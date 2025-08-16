'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Activity,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye,
  Smartphone,
  Monitor,
  Download,
  RefreshCw,
  Plus,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  userSatisfaction: number;
  systemUptime: number;
  responseTime: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  unit: string;
}

interface UserBehaviorData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  topPages: Array<{ page: string; views: number; avgTime: number }>;
  userFlow: Array<{ from: string; to: string; count: number }>;
}

interface DeviceAnalytics {
  desktop: number;
  mobile: number;
  tablet: number;
  browsers: Array<{ name: string; percentage: number }>;
  operatingSystems: Array<{ name: string; percentage: number }>;
}

interface RealTimeMetrics {
  onlineUsers: number;
  activeTickets: number;
  systemLoad: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'user_behavior' | 'system' | 'business';
  dateRange: string;
  metrics: string[];
  createdAt: Date;
}

export default function AdvancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    resolvedTickets: 0,
    avgResolutionTime: 0,
    userSatisfaction: 0,
    systemUptime: 0,
    responseTime: 0,
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehaviorData | null>(null);
  const [deviceAnalytics, setDeviceAnalytics] = useState<DeviceAnalytics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);

      // Simulate API calls with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock metrics
      setMetrics({
        totalUsers: 1247,
        activeUsers: 342,
        totalTickets: 1892,
        resolvedTickets: 1634,
        avgResolutionTime: 2.3,
        userSatisfaction: 4.6,
        systemUptime: 99.8,
        responseTime: 245,
      });

      // Mock performance metrics
      setPerformanceMetrics([
        {
          name: 'First Contentful Paint',
          value: 1.2,
          target: 2.5,
          trend: 'up',
          change: -15.3,
          unit: 's',
        },
        {
          name: 'Largest Contentful Paint',
          value: 2.1,
          target: 4.0,
          trend: 'up',
          change: -8.2,
          unit: 's',
        },
        {
          name: 'Cumulative Layout Shift',
          value: 0.05,
          target: 0.1,
          trend: 'stable',
          change: 0,
          unit: '',
        },
        {
          name: 'Time to Interactive',
          value: 3.1,
          target: 5.0,
          trend: 'up',
          change: -12.1,
          unit: 's',
        },
      ]);

      // Mock user behavior data
      setUserBehavior({
        pageViews: 15847,
        uniqueVisitors: 3241,
        bounceRate: 23.5,
        avgSessionDuration: 8.2,
        conversionRate: 15.3,
        topPages: [
          { page: '/enhanced-dashboard', views: 4821, avgTime: 3.2 },
          { page: '/tickets/new-enhanced', views: 3142, avgTime: 5.1 },
          { page: '/knowledge/enhanced', views: 2563, avgTime: 4.8 },
          { page: '/catalog/enhanced', views: 1923, avgTime: 6.3 },
          { page: '/cosmo/enhanced', views: 1456, avgTime: 7.2 },
        ],
        userFlow: [
          { from: '/enhanced-dashboard', to: '/tickets/new-enhanced', count: 1523 },
          { from: '/enhanced-dashboard', to: '/knowledge/enhanced', count: 987 },
          { from: '/tickets/new-enhanced', to: '/tickets/track', count: 756 },
          { from: '/knowledge/enhanced', to: '/cosmo/enhanced', count: 432 },
        ],
      });

      // Mock device analytics
      setDeviceAnalytics({
        desktop: 62.3,
        mobile: 31.2,
        tablet: 6.5,
        browsers: [
          { name: 'Chrome', percentage: 68.4 },
          { name: 'Safari', percentage: 18.7 },
          { name: 'Firefox', percentage: 8.2 },
          { name: 'Edge', percentage: 4.7 },
        ],
        operatingSystems: [
          { name: 'Windows', percentage: 45.3 },
          { name: 'macOS', percentage: 28.1 },
          { name: 'iOS', percentage: 15.7 },
          { name: 'Android', percentage: 8.9 },
          { name: 'Linux', percentage: 2.0 },
        ],
      });

      // Mock real-time metrics
      setRealTimeMetrics({
        onlineUsers: 127,
        activeTickets: 23,
        systemLoad: 34.7,
        responseTime: 198,
        errorRate: 0.12,
        throughput: 1247,
      });

      // Mock custom reports
      setCustomReports([
        {
          id: '1',
          name: 'Weekly Performance Report',
          description: 'Core Web Vitals and performance metrics for the past week',
          type: 'performance',
          dateRange: 'Last 7 days',
          metrics: ['LCP', 'FID', 'CLS', 'TTFB'],
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          name: 'User Engagement Analysis',
          description: 'User behavior patterns and engagement metrics',
          type: 'user_behavior',
          dateRange: 'Last 30 days',
          metrics: ['Page Views', 'Session Duration', 'Bounce Rate'],
          createdAt: new Date('2024-01-14'),
        },
        {
          id: '3',
          name: 'System Health Dashboard',
          description: 'System performance and uptime monitoring',
          type: 'system',
          dateRange: 'Last 24 hours',
          metrics: ['Uptime', 'Response Time', 'Error Rate'],
          createdAt: new Date('2024-01-13'),
        },
      ]);

      setLoading(false);
      setLastUpdate(new Date());
    };

    loadAnalyticsData();
  }, [selectedTimeRange]);

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (realTimeMetrics) {
        setRealTimeMetrics((prev) =>
          prev
            ? {
                ...prev,
                onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 10 - 5),
                systemLoad: Math.max(0, Math.min(100, prev.systemLoad + Math.random() * 10 - 5)),
                responseTime: Math.max(50, prev.responseTime + Math.floor(Math.random() * 20 - 10)),
                errorRate: Math.max(0, prev.errorRate + (Math.random() * 0.1 - 0.05)),
                throughput: Math.max(0, prev.throughput + Math.floor(Math.random() * 100 - 50)),
              }
            : null,
        );
        setLastUpdate(new Date());
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [realTimeMetrics]);

  const getMetricTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 rotate-180 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPerformanceColor = (value: number, target: number) => {
    const ratio = value / target;
    if (ratio <= 0.5) return 'text-green-600';
    if (ratio <= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const refreshData = () => {
    window.location.reload();
  };

  const exportReport = (reportType: string) => {
    // In a real app, this would generate and download a report
    console.log(`Exporting ${reportType} report...`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Advanced Analytics Dashboard
                  <Badge variant="outline" className="border-green-600 text-green-600">
                    <Activity className="mr-1 h-3 w-3" />
                    Live
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Real-time operational metrics, user behavior analytics, and performance insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport('full')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          <div className="text-muted-foreground text-xs">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Real-time System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realTimeMetrics.onlineUsers}
                </div>
                <div className="text-muted-foreground text-xs">Online Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realTimeMetrics.activeTickets}
                </div>
                <div className="text-muted-foreground text-xs">Active Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {realTimeMetrics.systemLoad.toFixed(1)}%
                </div>
                <div className="text-muted-foreground text-xs">System Load</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {realTimeMetrics.responseTime}ms
                </div>
                <div className="text-muted-foreground text-xs">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {realTimeMetrics.errorRate.toFixed(2)}%
                </div>
                <div className="text-muted-foreground text-xs">Error Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {realTimeMetrics.throughput}
                </div>
                <div className="text-muted-foreground text-xs">Throughput/min</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Users</p>
                    <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+12.3% vs last week</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Users</p>
                    <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                    <p className="text-xs text-green-600">+8.7% vs yesterday</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Resolution Rate</p>
                    <p className="text-2xl font-bold">
                      {((metrics.resolvedTickets / metrics.totalTickets) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-600">+2.1% vs last week</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Avg Resolution</p>
                    <p className="text-2xl font-bold">{metrics.avgResolutionTime}d</p>
                    <p className="text-xs text-green-600">-15.2% vs last week</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Uptime</span>
                    <span className="font-medium">{metrics.systemUptime}%</span>
                  </div>
                  <Progress value={metrics.systemUptime} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User Satisfaction</span>
                    <span className="font-medium">{metrics.userSatisfaction}/5.0</span>
                  </div>
                  <Progress value={(metrics.userSatisfaction / 5) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span className="font-medium">{metrics.responseTime}ms</span>
                  </div>
                  <Progress value={Math.max(0, 100 - metrics.responseTime / 10)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded bg-yellow-50 p-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div className="text-sm">
                      <p className="font-medium">High Memory Usage</p>
                      <p className="text-muted-foreground">Server load at 85%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded bg-green-50 p-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="text-sm">
                      <p className="font-medium">Database Backup Complete</p>
                      <p className="text-muted-foreground">Daily backup successful</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded bg-blue-50 p-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <div className="text-sm">
                      <p className="font-medium">Performance Optimization</p>
                      <p className="text-muted-foreground">CDN cache updated</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {performanceMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-medium">{metric.name}</h4>
                    {getMetricTrendIcon(metric.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <span
                        className={`text-2xl font-bold ${getPerformanceColor(metric.value, metric.target)}`}
                      >
                        {metric.value}
                        {metric.unit}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        Target: {metric.target}
                        {metric.unit}
                      </span>
                    </div>
                    <Progress
                      value={Math.max(0, Math.min(100, (1 - metric.value / metric.target) * 100))}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs">
                      <span className={metric.change < 0 ? 'text-green-600' : 'text-red-600'}>
                        {metric.change > 0 ? '+' : ''}
                        {metric.change.toFixed(1)}% vs last week
                      </span>
                      <span className="text-muted-foreground">
                        {((1 - metric.value / metric.target) * 100).toFixed(1)}% of target
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          {userBehavior && (
            <>
              {/* User Behavior Overview */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Page Views</p>
                        <p className="text-2xl font-bold">
                          {userBehavior.pageViews.toLocaleString()}
                        </p>
                      </div>
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Avg Session</p>
                        <p className="text-2xl font-bold">{userBehavior.avgSessionDuration}m</p>
                      </div>
                      <Clock className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Conversion Rate</p>
                        <p className="text-2xl font-bold">{userBehavior.conversionRate}%</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userBehavior.topPages.map((page, index) => (
                      <div
                        key={page.page}
                        className="bg-muted flex items-center justify-between rounded p-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <div>
                            <p className="text-sm font-medium">{page.page}</p>
                            <p className="text-muted-foreground text-xs">
                              {page.views.toLocaleString()} views
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{page.avgTime}m</p>
                          <p className="text-muted-foreground text-xs">avg time</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          {deviceAnalytics && (
            <>
              {/* Device Distribution */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Device Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span className="text-sm">Desktop</span>
                        </div>
                        <span className="font-medium">{deviceAnalytics.desktop}%</span>
                      </div>
                      <Progress value={deviceAnalytics.desktop} className="h-2" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span className="text-sm">Mobile</span>
                        </div>
                        <span className="font-medium">{deviceAnalytics.mobile}%</span>
                      </div>
                      <Progress value={deviceAnalytics.mobile} className="h-2" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          <span className="text-sm">Tablet</span>
                        </div>
                        <span className="font-medium">{deviceAnalytics.tablet}%</span>
                      </div>
                      <Progress value={deviceAnalytics.tablet} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Browser Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {deviceAnalytics.browsers.map((browser) => (
                        <div key={browser.name} className="flex items-center justify-between">
                          <span className="text-sm">{browser.name}</span>
                          <span className="font-medium">{browser.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Operating Systems */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Operating Systems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    {deviceAnalytics.operatingSystems.map((os) => (
                      <div key={os.name} className="bg-muted rounded p-3 text-center">
                        <div className="text-lg font-bold">{os.percentage}%</div>
                        <div className="text-muted-foreground text-sm">{os.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Custom Reports</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-muted-foreground text-sm">{report.description}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Type:</span>
                        <Badge variant="outline">{report.type.replace('_', ' ')}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Range:</span>
                        <span className="text-muted-foreground">{report.dateRange}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Created:</span>
                        <span className="text-muted-foreground">
                          {report.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-1 h-3 w-3" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportReport(report.name)}>
                        <Download className="mr-1 h-3 w-3" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
