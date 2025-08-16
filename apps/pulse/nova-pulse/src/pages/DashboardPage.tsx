import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../components/TicketGrid.module.css';
import { useQuery } from '@tanstack/react-query';
import { DashboardWidget } from '../components/dashboard/DashboardWidget';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RealTimeStatusWidget } from '../components/dashboard/RealTimeStatusWidget';
import { ProductivityInsightsWidget } from '../components/dashboard/ProductivityInsightsWidget';
import { QuickActionsToolbar } from '../components/dashboard/QuickActionsToolbar';

// Icon components
const TicketIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const UserIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const TrendIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

interface DashboardData {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
  slaCompliance: number;
  recentTimesheets: Array<{
    id: number;
    taskDescription: string;
    hoursWorked: number;
    date: string;
  }>;
}

export const DashboardPage: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Mock API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        totalTickets: 247,
        openTickets: 42,
        resolvedToday: 18,
        avgResolutionTime: 24,
        customerSatisfaction: 4.6,
        slaCompliance: 94,
        recentTimesheets: [
          {
            id: 1,
            taskDescription: 'Customer Support - Level 1',
            hoursWorked: 3.5,
            date: '2024-01-15',
          },
          {
            id: 2,
            taskDescription: 'Bug Investigation - Critical',
            hoursWorked: 2.0,
            date: '2024-01-15',
          },
          { id: 3, taskDescription: 'Documentation Update', hoursWorked: 1.0, date: '2024-01-14' },
          { id: 4, taskDescription: 'Training Session', hoursWorked: 2.5, date: '2024-01-14' },
        ],
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary-600 h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">No Data Available</h2>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    const handler = () => window.dispatchEvent(new CustomEvent('dashboard:refresh'));
    window.addEventListener('pulse:pull_to_refresh', handler);
    return () => window.removeEventListener('pulse:pull_to_refresh', handler);
  }, []);

  return (
    <motion.div
      className={`min-h-screen bg-gray-50 p-6 dark:bg-gray-900 ${styles.pullContainer}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Agent Dashboard</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Welcome back! Here's your performance overview for today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid')}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {layoutMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
            <button className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-sm font-medium text-white">
              Customize
            </button>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Tickets"
            value={dashboardData.totalTickets}
            icon={<TicketIcon />}
            color="primary"
            change={{ value: '+8', trend: 'up' }}
            description="All tickets assigned to you"
          />
          <MetricCard
            title="Open Tickets"
            value={dashboardData.openTickets}
            icon={<ClockIcon />}
            color="warning"
            change={{ value: '+3', trend: 'up' }}
            description="Awaiting your response"
          />
          <MetricCard
            title="Resolved Today"
            value={dashboardData.resolvedToday}
            icon={<UserIcon />}
            color="success"
            change={{ value: '+5', trend: 'up' }}
            description="Great work!"
          />
          <MetricCard
            title="Avg Resolution"
            value={`${dashboardData.avgResolutionTime}h`}
            icon={<TrendIcon />}
            color="default"
            change={{ value: '-2h', trend: 'down' }}
            description="Faster than target"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div
          className={`grid gap-6 ${layoutMode === 'grid' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}
        >
          {/* Real-time Status Widget */}
          <DashboardWidget
            id="real-time-status"
            title="Real-time Status"
            subtitle="Agent & queue performance"
            icon={<TrendIcon />}
            size={layoutMode === 'grid' ? 'lg' : 'xl'}
          >
            <RealTimeStatusWidget />
          </DashboardWidget>

          {/* Productivity Insights */}
          <DashboardWidget
            id="productivity-insights"
            title="Productivity Insights"
            subtitle="Your performance metrics"
            icon={<ClockIcon />}
            size={layoutMode === 'grid' ? 'lg' : 'xl'}
          >
            <ProductivityInsightsWidget />
          </DashboardWidget>

          {/* Quick Actions */}
          <DashboardWidget
            id="quick-actions"
            title="Quick Actions"
            subtitle="Frequently used tools"
            icon={<UserIcon />}
            size={layoutMode === 'grid' ? 'md' : 'xl'}
          >
            <QuickActionsToolbar />
          </DashboardWidget>
        </div>

        {/* Recent Activity */}
        <DashboardWidget
          id="recent-timesheets"
          title="Recent Timesheets"
          subtitle="Your latest logged hours"
          icon={<ClockIcon />}
          size="xl"
        >
          <div className="space-y-4">
            {dashboardData.recentTimesheets.map((timesheet) => (
              <div
                key={timesheet.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-700"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {timesheet.taskDescription}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{timesheet.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-primary-600 dark:text-primary-400 text-lg font-semibold">
                    {timesheet.hoursWorked}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardWidget>

        {/* Additional KPI Summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Customer Satisfaction
            </h3>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-green-600 dark:text-green-400">
                {dashboardData.customerSatisfaction}/5
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on 127 recent reviews
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              SLA Compliance
            </h3>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardData.slaCompliance}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Above target of 90%</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              This Week's Focus
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Reduce resolution time</span>
                <span className="text-green-600 dark:text-green-400">On track</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Improve first call resolution
                </span>
                <span className="text-yellow-600 dark:text-yellow-400">Needs attention</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Complete training modules</span>
                <span className="text-blue-600 dark:text-blue-400">In progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
