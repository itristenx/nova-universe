import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  Dropdown,
  DropdownButton,
  StatusBadge,
  useDynamicIsland,
  type DropdownItem,
} from '@components/design-system';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

/**
 * Simple Line Chart Component
 */
const LineChart: React.FC<{
  data: TimeSeriesData[];
  title: string;
  color?: string;
}> = ({ data, title, color = '#007AFF' }) => {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  // Calculate SVG points
  const width = 600;
  const height = 200;
  const padding = 20;
  const stepX = (width - 2 * padding) / (data.length - 1 || 1);

  const points = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((d.value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${
    width - padding
  },${height - padding}`;

  return (
    <div className="glass rounded-apple-lg p-6">
      <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ maxHeight: '200px' }}
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <line
            key={percent}
            x1={padding}
            y1={padding + (height - 2 * padding) * (percent / 100)}
            x2={width - padding}
            y2={padding + (height - 2 * padding) * (percent / 100)}
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.1"
          />
        ))}

        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill={color}
          opacity="0.1"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + i * stepX;
          const y =
            height - padding - ((d.value - min) / range) * (height - 2 * padding);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              className="hover:r-6 transition-all cursor-pointer"
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs font-sf-text text-gray-500 dark:text-gray-400">
        <span>{data[0]?.date || ''}</span>
        <span>{data[data.length - 1]?.date || ''}</span>
      </div>
    </div>
  );
};

/**
 * Simple Bar Chart Component
 */
const BarChart: React.FC<{
  data: ChartData[];
  title: string;
}> = ({ data, title }) => {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="glass rounded-apple-lg p-6">
      <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm font-sf-text">
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="font-sf-mono font-medium text-gray-900 dark:text-white">
                {item.value}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || '#007AFF',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Simple Pie Chart Component
 */
const PieChart: React.FC<{
  data: ChartData[];
  title: string;
}> = ({ data, title }) => {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = -90;

  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate arc path
    const startX = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
    const startY = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
    const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
    const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      percentage,
      path: `M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArc} 1 ${endX} ${endY} Z`,
    };
  });

  return (
    <div className="glass rounded-apple-lg p-6">
      <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color || `hsl(${index * 60}, 70%, 60%)`}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>

        <div className="flex-1 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: item.color || `hsl(${index * 60}, 70%, 60%)`,
                }}
              />
              <span className="text-sm font-sf-text text-gray-700 dark:text-gray-300 flex-1">
                {item.label}
              </span>
              <span className="text-sm font-sf-mono font-medium text-gray-900 dark:text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Sparkline Mini Chart
 */
export const Sparkline: React.FC<{
  data: number[];
  color?: string;
  height?: number;
}> = ({ data, color = '#007AFF', height = 40 }) => {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const width = data.length * 8;
  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Analytics Visualization Page
 */
export const AnalyticsVisualizationPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(false);

  const dynamicIsland = useDynamicIsland();

  // Mock data
  const ticketTrendData: TimeSeriesData[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    value: Math.floor(Math.random() * 50) + 20,
  }));

  const ticketsByPriorityData: ChartData[] = [
    { label: 'Critical', value: 12, color: '#FF3B30' },
    { label: 'High', value: 34, color: '#FF9500' },
    { label: 'Medium', value: 56, color: '#FFCC00' },
    { label: 'Low', value: 89, color: '#34C759' },
  ];

  const ticketsByStatusData: ChartData[] = [
    { label: 'Open', value: 45, color: '#007AFF' },
    { label: 'In Progress', value: 67, color: '#5856D6' },
    { label: 'Resolved', value: 123, color: '#34C759' },
    { label: 'Closed', value: 89, color: '#8E8E93' },
  ];

  const resolutionTimeData: TimeSeriesData[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    value: Math.floor(Math.random() * 24) + 12,
  }));

  // Time range dropdown
  const timeRangeItems: DropdownItem[] = [
    { id: '7d', label: 'Last 7 days', onClick: () => setTimeRange('7d') },
    { id: '30d', label: 'Last 30 days', onClick: () => setTimeRange('30d') },
    { id: '90d', label: 'Last 90 days', onClick: () => setTimeRange('90d') },
  ];

  const handleRefresh = async () => {
    setLoading(true);
    dynamicIsland.loading('Refreshing', 'Updating analytics data...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dynamicIsland.success('Refreshed', 'Analytics data updated');
    } catch (error) {
      dynamicIsland.error('Error', 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    dynamicIsland.loading('Exporting', 'Preparing analytics report...');
    setTimeout(() => {
      dynamicIsland.success('Exported', 'Report downloaded');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-apple-bg-primary dark:bg-apple-bg-primary-dark">
      {/* Header */}
      <div className="glass border-b border-gray-200/20 dark:border-gray-700/20 p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-sf-display font-bold text-gray-900 dark:text-white">
                Analytics
              </h1>
              <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 mt-1">
                Visualize your ITSM data and trends
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Dropdown
                trigger={
                  <DropdownButton icon={<Calendar className="w-4 h-4" />}>
                    {timeRange === '7d'
                      ? 'Last 7 days'
                      : timeRange === '30d'
                      ? 'Last 30 days'
                      : 'Last 90 days'}
                  </DropdownButton>
                }
                items={timeRangeItems}
              />

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 rounded-apple-sm glass text-gray-700 dark:text-gray-300 font-sf-text font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                type="button"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={handleExport}
                className="px-4 py-2 rounded-apple-sm bg-apple-blue dark:bg-apple-blue-dark text-white font-sf-text font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                type="button"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'Total Tickets',
                value: '324',
                trend: 'up',
                trendValue: '+12%',
                sparklineData: [20, 25, 22, 28, 30, 35, 32],
              },
              {
                label: 'Avg Resolution Time',
                value: '18h',
                trend: 'down',
                trendValue: '-8%',
                sparklineData: [24, 22, 20, 19, 18, 17, 18],
              },
              {
                label: 'Customer Satisfaction',
                value: '94%',
                trend: 'up',
                trendValue: '+3%',
                sparklineData: [88, 90, 91, 92, 93, 93, 94],
              },
              {
                label: 'SLA Compliance',
                value: '96%',
                trend: 'up',
                trendValue: '+2%',
                sparklineData: [92, 93, 94, 95, 95, 96, 96],
              },
            ].map((metric, index) => (
              <div key={index} className="glass rounded-apple-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </p>
                  <StatusBadge
                    variant={metric.trend === 'up' ? 'success' : 'info'}
                    label={metric.trendValue}
                    size="xs"
                  />
                </div>
                <div className="text-3xl font-sf-display font-bold text-gray-900 dark:text-white mb-3">
                  {metric.value}
                </div>
                <div className="h-10">
                  <Sparkline
                    data={metric.sparklineData}
                    color={metric.trend === 'up' ? '#34C759' : '#007AFF'}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart
              data={ticketTrendData}
              title="Ticket Volume Trend"
              color="#007AFF"
            />
            <LineChart
              data={resolutionTimeData}
              title="Average Resolution Time (hours)"
              color="#5856D6"
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart data={ticketsByPriorityData} title="Tickets by Priority" />
            <PieChart data={ticketsByStatusData} title="Tickets by Status" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsVisualizationPage;
