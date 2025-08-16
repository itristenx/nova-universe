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
} from '@heroui/react';
import {
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentChartBarIcon,
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
  Area,
} from 'recharts';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Real API call for analytics data
      const data = await api.getAnalytics(timeRange);
      setAnalytics(data);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  const metricCards = [
    {
      title: 'Total Tickets',
      value: '1,247',
      change: 12.5,
      trend: 'up',
      icon: DocumentChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Avg Response Time',
      value: '2.5h',
      change: -8.2,
      trend: 'down',
      icon: ClockIcon,
      color: 'bg-green-500',
    },
    {
      title: 'Active Users',
      value: '892',
      change: 5.7,
      trend: 'up',
      icon: UserIcon,
      color: 'bg-purple-500',
    },
    {
      title: 'System Uptime',
      value: '99.2%',
      change: 0.3,
      trend: 'up',
      icon: ComputerDesktopIcon,
      color: 'bg-orange-500',
    },
  ];
  if (loading) {
    return React.createElement(
      'div',
      { className: 'flex justify-center items-center min-h-96' },
      React.createElement(
        'div',
        { className: 'text-center' },
        React.createElement(ChartBarIcon, {
          className: 'w-12 h-12 mx-auto animate-pulse text-primary',
        }),
        React.createElement('p', { className: 'mt-4 text-lg' }, 'Loading analytics...'),
      ),
    );
  }
  return React.createElement(
    'div',
    { className: 'space-y-6' },
    React.createElement(
      'div',
      { className: 'flex justify-between items-center' },
      React.createElement(
        'div',
        null,
        React.createElement('h1', { className: 'text-3xl font-bold' }, 'Analytics & Reports'),
        React.createElement(
          'p',
          { className: 'text-gray-600 dark:text-gray-400' },
          'Comprehensive insights and performance metrics for your Nova Universe platform',
        ),
      ),
      React.createElement(
        'div',
        { className: 'flex gap-2' },
        React.createElement(
          Select,
          {
            size: 'sm',
            selectedKeys: [timeRange],
            onSelectionChange: (keys) => setTimeRange(Array.from(keys)[0]),
            className: 'w-32',
          },
          React.createElement(SelectItem, { key: '1d' }, 'Last Day'),
          React.createElement(SelectItem, { key: '7d' }, 'Last Week'),
          React.createElement(SelectItem, { key: '30d' }, 'Last Month'),
          React.createElement(SelectItem, { key: '90d' }, 'Last Quarter'),
        ),
        React.createElement(
          Button,
          {
            startContent: React.createElement(CalendarIcon, { className: 'w-4 h-4' }),
            variant: 'bordered',
          },
          'Export Report',
        ),
      ),
    ),
    React.createElement(
      'div',
      { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' },
      metricCards.map((metric, index) =>
        React.createElement(
          Card,
          { key: index },
          React.createElement(
            CardBody,
            { className: 'p-6' },
            React.createElement(
              'div',
              { className: 'flex items-center' },
              React.createElement(
                'div',
                { className: `p-3 rounded-lg ${metric.color}` },
                React.createElement(metric.icon, { className: 'h-6 w-6 text-white' }),
              ),
              React.createElement(
                'div',
                { className: 'ml-4 flex-1' },
                React.createElement(
                  'p',
                  { className: 'text-sm font-medium text-gray-600' },
                  metric.title,
                ),
                React.createElement(
                  'div',
                  { className: 'flex items-baseline' },
                  React.createElement(
                    'p',
                    { className: 'text-2xl font-semibold text-gray-900' },
                    metric.value,
                  ),
                  React.createElement(
                    'div',
                    { className: 'ml-2 flex items-center' },
                    metric.trend === 'up'
                      ? React.createElement(ArrowTrendingUpIcon, {
                          className: 'w-4 h-4 text-green-500',
                        })
                      : metric.trend === 'down'
                        ? React.createElement(ArrowTrendingDownIcon, {
                            className: 'w-4 h-4 text-red-500',
                          })
                        : null,
                    React.createElement(
                      'span',
                      {
                        className: `text-sm font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`,
                      },
                      metric.change >= 0 ? '+' : '',
                      metric.change,
                      '%',
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        CardBody,
        null,
        React.createElement(
          Tabs,
          {
            selectedKey: activeTab,
            onSelectionChange: (key) => setActiveTab(key),
            'aria-label': 'Analytics Tabs',
          },
          React.createElement(
            Tab,
            { key: 'overview', title: 'Overview' },
            React.createElement(
              'div',
              { className: 'space-y-6 pt-4' },
              React.createElement(
                Card,
                null,
                React.createElement(
                  CardHeader,
                  null,
                  React.createElement(
                    'h3',
                    { className: 'text-lg font-semibold' },
                    'Ticket Trends',
                  ),
                ),
                React.createElement(
                  CardBody,
                  null,
                  React.createElement(
                    ResponsiveContainer,
                    { width: '100%', height: 300 },
                    React.createElement(
                      LineChart,
                      { data: analytics?.ticketTrends },
                      React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
                      React.createElement(XAxis, { dataKey: 'date' }),
                      React.createElement(YAxis, null),
                      React.createElement(Tooltip, null),
                      React.createElement(Legend, null),
                      React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'created',
                        stroke: '#8884d8',
                        name: 'Created',
                      }),
                      React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'resolved',
                        stroke: '#82ca9d',
                        name: 'Resolved',
                      }),
                      React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'pending',
                        stroke: '#ffc658',
                        name: 'Pending',
                      }),
                    ),
                  ),
                ),
              ),
              React.createElement(
                'div',
                { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
                React.createElement(
                  Card,
                  null,
                  React.createElement(
                    CardHeader,
                    null,
                    React.createElement(
                      'h3',
                      { className: 'text-lg font-semibold' },
                      'Issue Categories',
                    ),
                  ),
                  React.createElement(
                    CardBody,
                    null,
                    React.createElement(
                      ResponsiveContainer,
                      { width: '100%', height: 250 },
                      React.createElement(
                        PieChart,
                        null,
                        React.createElement(
                          Pie,
                          {
                            data: analytics?.categoryDistribution,
                            cx: '50%',
                            cy: '50%',
                            outerRadius: 80,
                            fill: '#8884d8',
                            dataKey: 'count',
                            label: ({ name, percentage }) => `${name}: ${percentage}%`,
                          },
                          analytics?.categoryDistribution.map((entry, index) =>
                            React.createElement(Cell, {
                              key: `cell-${index}`,
                              fill: COLORS[index % COLORS.length],
                            }),
                          ),
                        ),
                        React.createElement(Tooltip, null),
                      ),
                    ),
                  ),
                ),
                React.createElement(
                  Card,
                  null,
                  React.createElement(
                    CardHeader,
                    null,
                    React.createElement(
                      'h3',
                      { className: 'text-lg font-semibold' },
                      'Response Time Metrics',
                    ),
                  ),
                  React.createElement(
                    CardBody,
                    null,
                    React.createElement(
                      'div',
                      { className: 'space-y-4' },
                      analytics?.responseTimeMetrics.map((metric, index) =>
                        React.createElement(
                          'div',
                          { key: index },
                          React.createElement(
                            'div',
                            { className: 'flex justify-between items-center mb-2' },
                            React.createElement(
                              'span',
                              { className: 'text-sm font-medium' },
                              metric.metric,
                            ),
                            React.createElement(
                              'div',
                              { className: 'flex items-center gap-2' },
                              React.createElement('span', { className: 'text-sm' }, metric.value),
                              React.createElement(
                                Chip,
                                {
                                  size: 'sm',
                                  color: metric.trend >= 0 ? 'success' : 'danger',
                                  variant: 'flat',
                                },
                                metric.trend >= 0 ? '+' : '',
                                metric.trend,
                              ),
                            ),
                          ),
                          React.createElement(Progress, {
                            value: (metric.value / metric.target) * 100,
                            color: metric.value <= metric.target ? 'success' : 'warning',
                            className: 'mb-1',
                          }),
                          React.createElement(
                            'div',
                            { className: 'flex justify-between text-xs text-gray-500' },
                            React.createElement('span', null, 'Current: ', metric.value),
                            React.createElement('span', null, 'Target: ', metric.target),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          React.createElement(
            Tab,
            { key: 'kiosks', title: 'Kiosk Performance' },
            React.createElement(
              'div',
              { className: 'space-y-6 pt-4' },
              React.createElement(
                Card,
                null,
                React.createElement(
                  CardHeader,
                  null,
                  React.createElement(
                    'h3',
                    { className: 'text-lg font-semibold' },
                    'Kiosk Metrics',
                  ),
                ),
                React.createElement(
                  CardBody,
                  null,
                  React.createElement(
                    ResponsiveContainer,
                    { width: '100%', height: 300 },
                    React.createElement(
                      BarChart,
                      { data: analytics?.kioskMetrics },
                      React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
                      React.createElement(XAxis, { dataKey: 'name' }),
                      React.createElement(YAxis, null),
                      React.createElement(Tooltip, null),
                      React.createElement(Legend, null),
                      React.createElement(Bar, {
                        dataKey: 'uptime',
                        fill: '#8884d8',
                        name: 'Uptime %',
                      }),
                      React.createElement(Bar, {
                        dataKey: 'usage',
                        fill: '#82ca9d',
                        name: 'Usage %',
                      }),
                      React.createElement(Bar, {
                        dataKey: 'tickets',
                        fill: '#ffc658',
                        name: 'Tickets',
                      }),
                    ),
                  ),
                ),
              ),
              React.createElement(
                'div',
                { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
                analytics?.kioskMetrics.map((kiosk, index) =>
                  React.createElement(
                    Card,
                    { key: index },
                    React.createElement(
                      CardBody,
                      null,
                      React.createElement('h4', { className: 'font-semibold mb-3' }, kiosk.name),
                      React.createElement(
                        'div',
                        { className: 'space-y-3' },
                        React.createElement(
                          'div',
                          null,
                          React.createElement(
                            'div',
                            { className: 'flex justify-between text-sm mb-1' },
                            React.createElement('span', null, 'Uptime'),
                            React.createElement('span', null, kiosk.uptime, '%'),
                          ),
                          React.createElement(Progress, { value: kiosk.uptime, color: 'success' }),
                        ),
                        React.createElement(
                          'div',
                          null,
                          React.createElement(
                            'div',
                            { className: 'flex justify-between text-sm mb-1' },
                            React.createElement('span', null, 'Usage'),
                            React.createElement('span', null, kiosk.usage, '%'),
                          ),
                          React.createElement(Progress, { value: kiosk.usage, color: 'primary' }),
                        ),
                        React.createElement(
                          'div',
                          { className: 'flex justify-between items-center' },
                          React.createElement('span', { className: 'text-sm' }, 'Tickets'),
                          React.createElement(Chip, { size: 'sm', variant: 'flat' }, kiosk.tickets),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          React.createElement(
            Tab,
            { key: 'activity', title: 'User Activity' },
            React.createElement(
              'div',
              { className: 'space-y-6 pt-4' },
              React.createElement(
                Card,
                null,
                React.createElement(
                  CardHeader,
                  null,
                  React.createElement(
                    'h3',
                    { className: 'text-lg font-semibold' },
                    'Hourly Activity',
                  ),
                ),
                React.createElement(
                  CardBody,
                  null,
                  React.createElement(
                    ResponsiveContainer,
                    { width: '100%', height: 300 },
                    React.createElement(
                      AreaChart,
                      { data: analytics?.userActivity },
                      React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
                      React.createElement(XAxis, { dataKey: 'hour' }),
                      React.createElement(YAxis, null),
                      React.createElement(Tooltip, null),
                      React.createElement(Legend, null),
                      React.createElement(Area, {
                        type: 'monotone',
                        dataKey: 'active_users',
                        stackId: '1',
                        stroke: '#8884d8',
                        fill: '#8884d8',
                        name: 'Active Users',
                      }),
                      React.createElement(Area, {
                        type: 'monotone',
                        dataKey: 'tickets_created',
                        stackId: '2',
                        stroke: '#82ca9d',
                        fill: '#82ca9d',
                        name: 'Tickets Created',
                      }),
                    ),
                  ),
                ),
              ),
            ),
          ),
          React.createElement(
            Tab,
            { key: 'system', title: 'System Performance' },
            React.createElement(
              'div',
              { className: 'space-y-6 pt-4' },
              React.createElement(
                Card,
                null,
                React.createElement(
                  CardHeader,
                  null,
                  React.createElement(
                    'h3',
                    { className: 'text-lg font-semibold' },
                    'System Metrics',
                  ),
                ),
                React.createElement(
                  CardBody,
                  null,
                  React.createElement(
                    ResponsiveContainer,
                    { width: '100%', height: 300 },
                    React.createElement(
                      LineChart,
                      { data: analytics?.systemPerformance },
                      React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
                      React.createElement(XAxis, { dataKey: 'timestamp' }),
                      React.createElement(YAxis, null),
                      React.createElement(Tooltip, null),
                      React.createElement(Legend, null),
                      React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'cpu_usage',
                        stroke: '#8884d8',
                        name: 'CPU Usage %',
                      }),
                      React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'memory_usage',
                        stroke: '#82ca9d',
                        name: 'Memory Usage %',
                      }),
                      React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'disk_usage',
                        stroke: '#ffc658',
                        name: 'Disk Usage %',
                      }),
                      React.createElement(Line, {
                        type: 'monotone',
                        dataKey: 'response_time',
                        stroke: '#ff7300',
                        name: 'Response Time (ms)',
                      }),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
};
