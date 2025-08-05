import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Chip,
  Progress,
  Divider
} from '@heroui/react';
import {
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { api } from '@/lib/api';

interface AnalyticsData {
  ticketTrends: {
    date: string;
    created: number;
    resolved: number;
    pending: number;
  }[];
  kioskMetrics: {
    name: string;
    uptime: number;
    usage: number;
    tickets: number;
  }[];
  userActivity: {
    hour: string;
    active_users: number;
    tickets_created: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  responseTimeMetrics: {
    metric: string;
    value: number;
    target: number;
    trend: number;
  }[];
  systemPerformance: {
    timestamp: string;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    response_time: number;
  }[];
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // For now, use mock data since the API endpoint doesn't exist yet
      // const data = await api.getAnalytics(timeRange);
      
      // Generate mock analytics data
      const mockData: AnalyticsData = {
        ticketTrends: [
          { date: '2024-01-01', created: 25, resolved: 20, pending: 5 },
          { date: '2024-01-02', created: 30, resolved: 25, pending: 10 },
          { date: '2024-01-03', created: 20, resolved: 30, pending: 0 },
          { date: '2024-01-04', created: 35, resolved: 28, pending: 7 },
          { date: '2024-01-05', created: 40, resolved: 35, pending: 12 },
          { date: '2024-01-06', created: 28, resolved: 32, pending: 8 },
          { date: '2024-01-07', created: 32, resolved: 30, pending: 10 },
        ],
        kioskMetrics: [
          { name: 'Kiosk-001', uptime: 99.5, usage: 87, tickets: 45 },
          { name: 'Kiosk-002', uptime: 98.2, usage: 92, tickets: 52 },
          { name: 'Kiosk-003', uptime: 99.8, usage: 76, tickets: 38 },
          { name: 'Kiosk-004', uptime: 97.1, usage: 88, tickets: 41 },
          { name: 'Kiosk-005', uptime: 99.9, usage: 95, tickets: 58 },
        ],
        userActivity: [
          { hour: '00:00', active_users: 12, tickets_created: 2 },
          { hour: '02:00', active_users: 8, tickets_created: 1 },
          { hour: '04:00', active_users: 5, tickets_created: 0 },
          { hour: '06:00', active_users: 15, tickets_created: 3 },
          { hour: '08:00', active_users: 45, tickets_created: 12 },
          { hour: '10:00', active_users: 65, tickets_created: 18 },
          { hour: '12:00', active_users: 78, tickets_created: 22 },
          { hour: '14:00', active_users: 82, tickets_created: 25 },
          { hour: '16:00', active_users: 69, tickets_created: 19 },
          { hour: '18:00', active_users: 45, tickets_created: 11 },
          { hour: '20:00', active_users: 32, tickets_created: 8 },
          { hour: '22:00', active_users: 25, tickets_created: 5 },
        ],
        categoryDistribution: [
          { category: 'Hardware Issues', count: 145, percentage: 35 },
          { category: 'Software Problems', count: 120, percentage: 29 },
          { category: 'Network Issues', count: 78, percentage: 19 },
          { category: 'User Support', count: 52, percentage: 13 },
          { category: 'Other', count: 18, percentage: 4 },
        ],
        responseTimeMetrics: [
          { metric: 'Average Response Time', value: 2.5, target: 4.0, trend: -0.5 },
          { metric: 'First Response Time', value: 1.2, target: 2.0, trend: -0.3 },
          { metric: 'Resolution Time', value: 24.5, target: 48.0, trend: -2.1 },
          { metric: 'Customer Satisfaction', value: 4.7, target: 4.5, trend: 0.2 },
        ],
        systemPerformance: [
          { timestamp: '00:00', cpu_usage: 45, memory_usage: 62, disk_usage: 78, response_time: 120 },
          { timestamp: '04:00', cpu_usage: 32, memory_usage: 58, disk_usage: 78, response_time: 98 },
          { timestamp: '08:00', cpu_usage: 68, memory_usage: 72, disk_usage: 79, response_time: 145 },
          { timestamp: '12:00', cpu_usage: 85, memory_usage: 81, disk_usage: 80, response_time: 180 },
          { timestamp: '16:00', cpu_usage: 72, memory_usage: 75, disk_usage: 80, response_time: 165 },
          { timestamp: '20:00', cpu_usage: 54, memory_usage: 68, disk_usage: 81, response_time: 132 },
        ],
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const metricCards: MetricCard[] = [
    {
      title: 'Total Tickets',
      value: '1,247',
      change: 12.5,
      trend: 'up',
      icon: DocumentChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Avg Response Time',
      value: '2.5h',
      change: -8.2,
      trend: 'down',
      icon: ClockIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Active Users',
      value: '892',
      change: 5.7,
      trend: 'up',
      icon: UserIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'System Uptime',
      value: '99.2%',
      change: 0.3,
      trend: 'up',
      icon: ComputerDesktopIcon,
      color: 'bg-orange-500'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <ChartBarIcon className="w-12 h-12 mx-auto animate-pulse text-primary" />
          <p className="mt-4 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights and performance metrics for your Nova Universe platform
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            size="sm"
            selectedKeys={[timeRange]}
            onSelectionChange={(keys) => setTimeRange(Array.from(keys)[0] as string)}
            className="w-32"
          >
            <SelectItem key="1d">Last Day</SelectItem>
            <SelectItem key="7d">Last Week</SelectItem>
            <SelectItem key="30d">Last Month</SelectItem>
            <SelectItem key="90d">Last Quarter</SelectItem>
          </Select>
          <Button
            startContent={<CalendarIcon className="w-4 h-4" />}
            variant="bordered"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardBody className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                    <div className="ml-2 flex items-center">
                      {metric.trend === 'up' ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                      ) : metric.trend === 'down' ? (
                        <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                      ) : null}
                      <span
                        className={`text-sm font-medium ${
                          metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {metric.change >= 0 ? '+' : ''}
                        {metric.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Card>
        <CardBody>
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            aria-label="Analytics Tabs"
          >
            <Tab key="overview" title="Overview">
              <div className="space-y-6 pt-4">
                {/* Ticket Trends */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Ticket Trends</h3>
                  </CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics?.ticketTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="created" stroke="#8884d8" name="Created" />
                        <Line type="monotone" dataKey="resolved" stroke="#82ca9d" name="Resolved" />
                        <Line type="monotone" dataKey="pending" stroke="#ffc658" name="Pending" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>

                {/* Category Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Issue Categories</h3>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={analytics?.categoryDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                          >
                            {analytics?.categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Response Time Metrics</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        {analytics?.responseTimeMetrics.map((metric, index) => (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">{metric.metric}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{metric.value}</span>
                                <Chip
                                  size="sm"
                                  color={metric.trend >= 0 ? 'success' : 'danger'}
                                  variant="flat"
                                >
                                  {metric.trend >= 0 ? '+' : ''}{metric.trend}
                                </Chip>
                              </div>
                            </div>
                            <Progress
                              value={(metric.value / metric.target) * 100}
                              color={metric.value <= metric.target ? 'success' : 'warning'}
                              className="mb-1"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Current: {metric.value}</span>
                              <span>Target: {metric.target}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </Tab>

            <Tab key="kiosks" title="Kiosk Performance">
              <div className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Kiosk Metrics</h3>
                  </CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics?.kioskMetrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="uptime" fill="#8884d8" name="Uptime %" />
                        <Bar dataKey="usage" fill="#82ca9d" name="Usage %" />
                        <Bar dataKey="tickets" fill="#ffc658" name="Tickets" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics?.kioskMetrics.map((kiosk, index) => (
                    <Card key={index}>
                      <CardBody>
                        <h4 className="font-semibold mb-3">{kiosk.name}</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Uptime</span>
                              <span>{kiosk.uptime}%</span>
                            </div>
                            <Progress value={kiosk.uptime} color="success" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Usage</span>
                              <span>{kiosk.usage}%</span>
                            </div>
                            <Progress value={kiosk.usage} color="primary" />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Tickets</span>
                            <Chip size="sm" variant="flat">{kiosk.tickets}</Chip>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            </Tab>

            <Tab key="activity" title="User Activity">
              <div className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Hourly Activity</h3>
                  </CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics?.userActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="active_users"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                          name="Active Users"
                        />
                        <Area
                          type="monotone"
                          dataKey="tickets_created"
                          stackId="2"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          name="Tickets Created"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            <Tab key="system" title="System Performance">
              <div className="space-y-6 pt-4">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">System Metrics</h3>
                  </CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics?.systemPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cpu_usage" stroke="#8884d8" name="CPU Usage %" />
                        <Line type="monotone" dataKey="memory_usage" stroke="#82ca9d" name="Memory Usage %" />
                        <Line type="monotone" dataKey="disk_usage" stroke="#ffc658" name="Disk Usage %" />
                        <Line type="monotone" dataKey="response_time" stroke="#ff7300" name="Response Time (ms)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};
