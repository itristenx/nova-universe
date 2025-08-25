import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  TicketIcon,
  BoltIcon,
  CalendarIcon,
  ArrowPathIcon,
  FunnelIcon,
  EyeIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@utils/index';

interface Metric {
  id: string;
  name: string;
  value: number | string;
  previousValue?: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  description: string;
  category: 'volume' | 'performance' | 'satisfaction' | 'efficiency';
}

interface Prediction {
  id: string;
  type: 'volume_surge' | 'category_trend' | 'resource_need' | 'escalation_risk';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  affectedMetrics: string[];
  accuracy?: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
  predicted?: boolean;
  confidence?: number;
}

interface PredictiveAnalyticsDashboardProps {
  className?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: string) => void;
  onMetricClick?: (metric: Metric) => void;
  onPredictionClick?: (prediction: Prediction) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Mock data for demonstration
const mockMetrics: Metric[] = [
  {
    id: 'total-tickets',
    name: 'Total Tickets',
    value: 1247,
    previousValue: 1156,
    change: 7.9,
    changeType: 'increase',
    trend: 'up',
    description: 'Total number of support tickets created',
    category: 'volume',
  },
  {
    id: 'avg-resolution-time',
    name: 'Avg Resolution Time',
    value: '4.2h',
    previousValue: '5.1h',
    change: -17.6,
    changeType: 'decrease',
    trend: 'down',
    unit: 'hours',
    description: 'Average time to resolve tickets',
    category: 'performance',
  },
  {
    id: 'satisfaction-score',
    name: 'Satisfaction Score',
    value: '4.6/5',
    previousValue: '4.4/5',
    change: 4.5,
    changeType: 'increase',
    trend: 'up',
    description: 'Customer satisfaction rating',
    category: 'satisfaction',
  },
  {
    id: 'first-contact-resolution',
    name: 'First Contact Resolution',
    value: '78%',
    previousValue: '73%',
    change: 6.8,
    changeType: 'increase',
    trend: 'up',
    unit: '%',
    description: 'Tickets resolved on first contact',
    category: 'efficiency',
  },
  {
    id: 'escalation-rate',
    name: 'Escalation Rate',
    value: '12%',
    previousValue: '15%',
    change: -20.0,
    changeType: 'decrease',
    trend: 'down',
    unit: '%',
    description: 'Percentage of tickets escalated',
    category: 'efficiency',
  },
  {
    id: 'active-agents',
    name: 'Active Agents',
    value: 34,
    previousValue: 32,
    change: 6.3,
    changeType: 'increase',
    trend: 'up',
    description: 'Number of agents currently handling tickets',
    category: 'volume',
  },
];

const mockPredictions: Prediction[] = [
  {
    id: 'volume-surge-monday',
    type: 'volume_surge',
    title: 'Expected Volume Surge Monday',
    description:
      'Based on historical patterns, expect 35% increase in ticket volume Monday morning due to weekend system issues.',
    confidence: 87,
    timeframe: 'Next 2 days',
    impact: 'high',
    recommendation: 'Schedule additional agents for Monday 8-11 AM shift',
    affectedMetrics: ['total-tickets', 'avg-resolution-time'],
    accuracy: 91,
  },
  {
    id: 'password-reset-trend',
    type: 'category_trend',
    title: 'Password Reset Requests Rising',
    description:
      'Password reset requests have increased 45% this week. New security policy may be causing confusion.',
    confidence: 92,
    timeframe: 'This week',
    impact: 'medium',
    recommendation: 'Create self-service guide and send communication to users',
    affectedMetrics: ['total-tickets', 'first-contact-resolution'],
    accuracy: 88,
  },
  {
    id: 'escalation-risk-hardware',
    type: 'escalation_risk',
    title: 'Hardware Issue Escalation Risk',
    description:
      'Current hardware tickets have 73% chance of escalation based on complexity patterns.',
    confidence: 78,
    timeframe: 'Next 24 hours',
    impact: 'medium',
    recommendation: 'Assign senior technician to hardware queue',
    affectedMetrics: ['escalation-rate', 'satisfaction-score'],
  },
  {
    id: 'resource-need-weekend',
    type: 'resource_need',
    title: 'Weekend Coverage Gap',
    description:
      'Predicted 23% understaffing for weekend shift based on historical demand patterns.',
    confidence: 84,
    timeframe: 'This weekend',
    impact: 'high',
    recommendation: 'Schedule on-call coverage or implement weekend surge pricing for contractors',
    affectedMetrics: ['avg-resolution-time', 'satisfaction-score'],
  },
];

const mockChartData: ChartDataPoint[] = [
  { label: 'Mon', value: 142 },
  { label: 'Tue', value: 158 },
  { label: 'Wed', value: 169 },
  { label: 'Thu', value: 187 },
  { label: 'Fri', value: 201 },
  { label: 'Sat', value: 89, predicted: true, confidence: 85 },
  { label: 'Sun', value: 67, predicted: true, confidence: 82 },
  { label: 'Mon*', value: 245, predicted: true, confidence: 87 },
];

export function PredictiveAnalyticsDashboard({
  className,
  timeRange = '7d',
  onTimeRangeChange,
  onMetricClick,
  onPredictionClick,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
}: PredictiveAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<Metric[]>(mockMetrics);
  const [predictions, setPredictions] = useState<Prediction[]>(mockPredictions);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'volume':
        return <TicketIcon className="h-5 w-5" />;
      case 'performance':
        return <ClockIcon className="h-5 w-5" />;
      case 'satisfaction':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'efficiency':
        return <BoltIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'volume_surge':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-orange-600" />;
      case 'category_trend':
        return <ChartBarIcon className="h-5 w-5 text-blue-600" />;
      case 'resource_need':
        return <UserGroupIcon className="h-5 w-5 text-purple-600" />;
      case 'escalation_risk':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ArrowTrendingUpIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'low':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredMetrics =
    selectedCategory === 'all'
      ? metrics
      : metrics.filter((metric) => metric.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Metrics', icon: <ChartBarIcon className="h-4 w-4" /> },
    { id: 'volume', name: 'Volume', icon: <TicketIcon className="h-4 w-4" /> },
    { id: 'performance', name: 'Performance', icon: <ClockIcon className="h-4 w-4" /> },
    { id: 'satisfaction', name: 'Satisfaction', icon: <UserGroupIcon className="h-4 w-4" /> },
    { id: 'efficiency', name: 'Efficiency', icon: <BoltIcon className="h-4 w-4" /> },
  ];

  const timeRanges = [
    { id: '7d', name: '7 Days' },
    { id: '30d', name: '30 Days' },
    { id: '90d', name: '90 Days' },
    { id: '1y', name: '1 Year' },
  ];

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Predictive Analytics</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            AI-powered insights and predictions for your support operations
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => onTimeRangeChange?.(range.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  timeRange === range.id
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
                )}
              >
                {range.name}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowPathIcon className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Last updated: {lastUpdated.toLocaleString()}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              selectedCategory === category.id
                ? 'bg-nova-100 dark:bg-nova-900/20 text-nova-700 dark:text-nova-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
            )}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMetrics.map((metric) => (
          <div
            key={metric.id}
            className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            onClick={() => onMetricClick?.(metric)}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'rounded-lg p-2',
                    metric.category === 'volume' &&
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
                    metric.category === 'performance' &&
                      'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
                    metric.category === 'satisfaction' &&
                      'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
                    metric.category === 'efficiency' &&
                      'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
                  )}
                >
                  {getMetricIcon(metric.category)}
                </div>
                <h3 className="font-medium text-gray-900 dark:text-white">{metric.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                {metric.trend === 'up' && (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
                {metric.trend === 'down' && (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.description}
                </span>
                <div
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium',
                    metric.changeType === 'increase' &&
                      'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
                    metric.changeType === 'decrease' &&
                      'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
                    metric.changeType === 'neutral' &&
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
                  )}
                >
                  {metric.changeType === 'increase' && <ArrowTrendingUpIcon className="h-3 w-3" />}
                  {metric.changeType === 'decrease' && (
                    <ArrowTrendingDownIcon className="h-3 w-3" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Predictions Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="from-nova-500 rounded-lg bg-gradient-to-r to-purple-600 p-2">
              <BoltIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Predictions & Recommendations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Actionable insights based on historical patterns and current trends
              </p>
            </div>
          </div>
          <button className="text-nova-600 dark:text-nova-400 hover:text-nova-700 dark:hover:text-nova-300 flex items-center gap-2 text-sm">
            <EyeIcon className="h-4 w-4" />
            View All
          </button>
        </div>

        <div className="space-y-4">
          {predictions.map((prediction, index) => (
            <div
              key={prediction.id}
              className="dark:hover:bg-gray-750 cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700"
              onClick={() => onPredictionClick?.(prediction)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">{getPredictionIcon(prediction.type)}</div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {prediction.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-1 text-xs font-medium',
                          getImpactColor(prediction.impact),
                        )}
                      >
                        {prediction.impact.toUpperCase()} IMPACT
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        {prediction.confidence}% confidence
                      </span>
                    </div>
                  </div>

                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    {prediction.description}
                  </p>

                  <div className="bg-nova-50 dark:bg-nova-900/10 mb-3 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <InformationCircleIcon className="text-nova-600 dark:text-nova-400 mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <span className="text-nova-700 dark:text-nova-300 text-sm font-medium">
                          Recommendation:
                        </span>
                        <span className="text-nova-600 dark:text-nova-400 ml-2 text-sm">
                          {prediction.recommendation}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3" />
                        {prediction.timeframe}
                      </span>
                      {prediction.accuracy && (
                        <span className="flex items-center gap-1">
                          <ChartBarIcon className="h-3 w-3" />
                          {prediction.accuracy}% historical accuracy
                        </span>
                      )}
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ticket Volume Forecast
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="bg-nova-500 h-3 w-3 rounded-full"></div>
            <span>Actual</span>
            <div className="bg-nova-300 border-nova-500 h-3 w-3 rounded-full border-2"></div>
            <span>Predicted</span>
          </div>
        </div>

        <div className="flex h-64 items-end justify-between gap-2">
          {mockChartData.map((point, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-300',
                    point.predicted
                      ? 'from-nova-300 to-nova-500 border-nova-500 border-2 bg-gradient-to-t opacity-70'
                      : 'from-nova-500 to-nova-600 bg-gradient-to-t',
                  )}
                  style={
                    {
                      height: `${(point.value / Math.max(...mockChartData.map((p) => p.value))) * 200}px`,
                    } as React.CSSProperties
                  }
                >
                  {point.predicted && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 transform text-xs text-gray-500 dark:text-gray-400">
                      {point.confidence}%
                    </div>
                  )}
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform text-xs font-medium whitespace-nowrap text-gray-900 dark:text-white">
                  {point.value}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {point.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
