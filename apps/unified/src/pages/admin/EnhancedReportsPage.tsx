/**
 * Enhanced Apple-style Reporting & Analytics Dashboard
 * Professional reporting interface with ServiceNow-inspired analytics
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  BoltIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from '@components/common/GlassCard';
import { AppleButton } from '@components/common/AppleButton';
import { cn, cardHoverEffect } from '@utils/apple-utils';
import { fadeInAnimation } from '@utils/apple-utils';

// Report configuration interface
interface ReportConfig {
  id: string;
  name: string;
  description: string;
  category: 'tickets' | 'users' | 'performance' | 'sla' | 'trends';
  icon: React.ReactNode;
  lastRun?: Date;
  schedule?: string;
  favorite?: boolean;
}

// Chart data interface
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    trend?: 'up' | 'down' | 'stable';
  }[];
}

// KPI metric interface
interface KPIMetric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  change: string;
  color: 'green' | 'red' | 'blue' | 'orange' | 'purple';
}

export default function EnhancedReportsPage() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock KPI data
  const kpiMetrics: KPIMetric[] = [
    {
      label: 'Total Tickets',
      value: 2847,
      trend: 'up',
      change: '+12.5%',
      color: 'blue'
    },
    {
      label: 'Avg Resolution Time',
      value: '4.2h',
      trend: 'down',
      change: '-18.3%',
      color: 'green'
    },
    {
      label: 'SLA Compliance',
      value: '94.8%',
      trend: 'up',
      change: '+2.1%',
      color: 'green'
    },
    {
      label: 'Customer Satisfaction',
      value: 4.6,
      trend: 'stable',
      change: '0.0%',
      color: 'blue'
    },
    {
      label: 'First Call Resolution',
      value: '87.2%',
      trend: 'up',
      change: '+5.4%',
      color: 'green'
    },
    {
      label: 'Escalation Rate',
      value: '8.3%',
      trend: 'down',
      change: '-15.2%',
      color: 'green'
    }
  ];

  // Pre-built reports
  const availableReports: ReportConfig[] = [
    {
      id: '1',
      name: 'Ticket Volume Analysis',
      description: 'Daily, weekly, and monthly ticket creation trends',
      category: 'tickets',
      icon: <BoltIcon className="h-6 w-6" />,
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
      schedule: 'Daily at 9:00 AM',
      favorite: true
    },
    {
      id: '2', 
      name: 'Agent Performance Report',
      description: 'Individual and team performance metrics',
      category: 'users',
      icon: <UserIcon className="h-6 w-6" />,
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      schedule: 'Weekly on Monday'
    },
    {
      id: '3',
      name: 'SLA Compliance Dashboard',
      description: 'Service level agreement compliance tracking',
      category: 'sla',
      icon: <ClockIcon className="h-6 w-6" />,
      lastRun: new Date(Date.now() - 60 * 60 * 1000),
      schedule: 'Real-time',
      favorite: true
    },
    {
      id: '4',
      name: 'System Performance Metrics',
      description: 'Response times, uptime, and system health',
      category: 'performance',
      icon: <ChartBarIcon className="h-6 w-6" />,
      lastRun: new Date(Date.now() - 30 * 60 * 1000),
      schedule: 'Hourly'
    },
    {
      id: '5',
      name: 'Trend Analysis Report',
      description: 'Historical trends and predictive analytics',
      category: 'trends',
      icon: <TrendingUpIcon className="h-6 w-6" />,
      lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000),
      schedule: 'Weekly on Sunday'
    },
    {
      id: '6',
      name: 'Customer Satisfaction Survey',
      description: 'User feedback and satisfaction scores',
      category: 'users',
      icon: <DocumentChartBarIcon className="h-6 w-6" />,
      lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000),
      schedule: 'Monthly'
    }
  ];

  // Filter reports
  const filteredReports = useMemo(() => {
    return availableReports.filter(report => {
      const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const favoriteReports = availableReports.filter(report => report.favorite);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tickets': return 'bg-blue-100 text-blue-800';
      case 'users': return 'bg-green-100 text-green-800';
      case 'performance': return 'bg-purple-100 text-purple-800';
      case 'sla': return 'bg-orange-100 text-orange-800';
      case 'trends': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
      default: return <div className="w-4 h-1 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
                Reports & Analytics
              </h1>
              <p className="text-xl text-gray-600">
                Comprehensive insights into system performance and business metrics
              </p>
            </div>

            <div className="flex gap-3">
              <AppleButton
                variant="secondary"
                leftIcon={<CalendarIcon className="h-5 w-5" />}
              >
                Schedule Report
              </AppleButton>
              
              <AppleButton
                leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
              >
                Export Data
              </AppleButton>
            </div>
          </div>
        </div>

        {/* KPI Dashboard */}
        <div className="mb-8" {...fadeInAnimation(0.1)}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Performance Indicators</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpiMetrics.map((metric, index) => (
              <GlassCard
                key={metric.label}
                intensity="medium"
                hover="subtle"
                padding="md"
                className={cardHoverEffect('subtle')}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {metric.label}
                  </div>
                  <div className={cn(
                    'flex items-center justify-center gap-1 text-xs font-semibold',
                    getTrendColor(metric.trend)
                  )}>
                    {getTrendIcon(metric.trend)}
                    <span>{metric.change}</span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Time Period Selector */}
        <GlassCard intensity="medium" hover={false} padding="md" className="mb-8" {...fadeInAnimation(0.2)}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Time Period:</span>
              <div className="flex gap-2">
                {[
                  { value: '7d', label: 'Last 7 Days' },
                  { value: '30d', label: 'Last 30 Days' },
                  { value: '90d', label: 'Last 3 Months' },
                  { value: '1y', label: 'Last Year' }
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      selectedPeriod === period.value
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={cn(
                  'px-4 py-2 bg-white/90 backdrop-blur-sm',
                  'border border-gray-200 rounded-lg',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200 ease-out'
                )}
              >
                <option value="all">All Categories</option>
                <option value="tickets">Tickets</option>
                <option value="users">Users</option>
                <option value="performance">Performance</option>
                <option value="sla">SLA</option>
                <option value="trends">Trends</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Favorite Reports */}
        {favoriteReports.length > 0 && (
          <div className="mb-8" {...fadeInAnimation(0.3)}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              ⭐ Favorite Reports
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteReports.map((report) => (
                <GlassCard
                  key={report.id}
                  intensity="medium"
                  hover="strong"
                  padding="lg"
                  className={cn(
                    cardHoverEffect('strong'),
                    'cursor-pointer relative'
                  )}
                  onClick={() => navigate(`/admin/reports/${report.id}`)}
                >
                  {/* Favorite Badge */}
                  <div className="absolute top-4 right-4 text-yellow-500">
                    ⭐
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                      {report.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {report.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className={cn(
                          'px-2 py-1 rounded-lg font-medium',
                          getCategoryColor(report.category)
                        )}>
                          {report.category}
                        </span>
                        
                        {report.lastRun && (
                          <span className="text-gray-500">
                            {formatRelativeTime(report.lastRun)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* All Reports */}
        <div {...fadeInAnimation(0.4)}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">All Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, index) => (
              <GlassCard
                key={report.id}
                intensity="medium"
                hover="medium"
                padding="lg"
                className={cn(
                  cardHoverEffect('medium'),
                  'cursor-pointer'
                )}
                onClick={() => navigate(`/admin/reports/${report.id}`)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl text-gray-600">
                    {report.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.name}
                      </h3>
                      {report.favorite && (
                        <span className="text-yellow-500 text-sm">⭐</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {report.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={cn(
                          'px-2 py-1 rounded-lg font-medium',
                          getCategoryColor(report.category)
                        )}>
                          {report.category}
                        </span>
                        
                        <AppleButton 
                          size="sm" 
                          variant="ghost"
                          leftIcon={<EyeIcon className="h-4 w-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/reports/${report.id}`);
                          }}
                        >
                          View
                        </AppleButton>
                      </div>

                      {report.schedule && (
                        <div className="text-xs text-gray-500">
                          Schedule: {report.schedule}
                        </div>
                      )}

                      {report.lastRun && (
                        <div className="text-xs text-gray-500">
                          Last run: {formatRelativeTime(report.lastRun)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <GlassCard intensity="medium" hover={false} padding="xl" className="text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ChartBarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or category filter.
              </p>
              <AppleButton
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Show All Reports
              </AppleButton>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}