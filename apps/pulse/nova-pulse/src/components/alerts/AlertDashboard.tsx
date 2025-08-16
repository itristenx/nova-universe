import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  UsersIcon,
  BellIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowPathIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Alert, Schedule, AlertStats, AlertFilters, AlertDashboardState } from '../../types/alerts';
import AlertCard from './AlertCard';
import ScheduleCard from './ScheduleCard';
import AlertStatsWidget from './AlertStatsWidget';
// import OnCallIndicator from './OnCallIndicator'; // Currently unused
import CreateAlertModal from './CreateAlertModal';
import AlertFiltersPanel from './AlertFiltersPanel';

interface AlertDashboardProps {
  className?: string;
}

const AlertDashboard: React.FC<AlertDashboardProps> = ({ className = '' }) => {
  const queryClient = useQueryClient();
  const [dashboardState, setDashboardState] = useState<AlertDashboardState>({
    stats: {
      totalAlerts: 0,
      alertsByStatus: {},
      alertsByPriority: {},
      alertsByService: {},
      averageResponseTime: 0,
      averageResolutionTime: 0,
      escalationRate: 0,
      period: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    },
    recentAlerts: [],
    activeSchedules: [],
    loading: false,
    error: undefined,
    refreshInterval: 30000,
    lastRefresh: new Date().toISOString(),
  });

  const [filters, setFilters] = useState<AlertFilters>({
    status: ['triggered', 'acknowledged'],
    priority: [],
    serviceId: [],
    assignedTo: [],
    createdAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tags: [],
    source: [],
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch alert statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['alert-stats', filters],
    queryFn: async (): Promise<AlertStats> => {
      const params = new URLSearchParams({
        startDate: filters.createdAfter || dashboardState.stats.period.start,
        endDate: filters.createdBefore || dashboardState.stats.period.end,
        ...(filters.serviceId?.length && { serviceIds: filters.serviceId.join(',') }),
      });

      const response = await fetch(`/api/v2/alerts/stats?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Failed to fetch alert stats');
      const data = await response.json();
      return data.stats;
    },
    refetchInterval: dashboardState.refreshInterval,
  });

  // Fetch recent alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['recent-alerts', filters, searchQuery],
    queryFn: async (): Promise<Alert[]> => {
      const params = new URLSearchParams({
        limit: '20',
        ...(filters.status?.length && { status: filters.status.join(',') }),
        ...(filters.priority?.length && { priority: filters.priority.join(',') }),
        ...(filters.serviceId?.length && { serviceId: filters.serviceId.join(',') }),
        ...(filters.createdAfter && { startDate: filters.createdAfter }),
        ...(filters.createdBefore && { endDate: filters.createdBefore }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/v2/alerts/history?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      return data.alerts;
    },
    refetchInterval: dashboardState.refreshInterval,
  });

  // Fetch active schedules
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ['active-schedules'],
    queryFn: async (): Promise<Schedule[]> => {
      const response = await fetch('/api/v2/alerts/schedules?active=true', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      return data.schedules;
    },
    refetchInterval: dashboardState.refreshInterval,
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/v2/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to acknowledge alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    },
  });

  // Resolve alert mutation
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/v2/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to resolve alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    },
  });

  // Escalate alert mutation
  const escalateAlertMutation = useMutation({
    mutationFn: async ({ alertId, reason }: { alertId: string; reason: string }) => {
      const response = await fetch(`/api/v2/alerts/${alertId}/escalate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to escalate alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    },
  });

  // Handle alert actions
  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlertMutation.mutate(alertId);
  };

  const handleResolveAlert = (alertId: string) => {
    resolveAlertMutation.mutate(alertId);
  };

  const handleEscalateAlert = (alertId: string) => {
    const reason = prompt('Please provide a reason for escalation:');
    if (reason) {
      escalateAlertMutation.mutate({ alertId, reason });
    }
  };

  const handleSelectAlert = (alertId: string, selected: boolean) => {
    setSelectedAlerts((prev) =>
      selected ? [...prev, alertId] : prev.filter((id) => id !== alertId),
    );
  };

  const handleBulkAction = (action: string) => {
    // Implement bulk actions for selected alerts
    console.log('Bulk action:', action, 'for alerts:', selectedAlerts);
    setSelectedAlerts([]);
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
    queryClient.invalidateQueries({ queryKey: ['active-schedules'] });
    setDashboardState((prev) => ({ ...prev, lastRefresh: new Date().toISOString() }));
  };

  useEffect(() => {
    const handler = () => refreshData();
    window.addEventListener('alerts:refresh', handler);
    return () => window.removeEventListener('alerts:refresh', handler);
  }, []);

  const isLoading = statsLoading || alertsLoading || schedulesLoading;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alert Dashboard</h1>
          <p className="mt-1 text-gray-600">Monitor and manage alerts across your infrastructure</p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            className="rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
            title="Refresh data"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-lg p-2 transition-colors duration-200 ${
              showFilters
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
            title="Filter alerts"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-600"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Alert</span>
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
        <input
          type="text"
          placeholder="Search alerts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200/50 bg-white/80 py-3 pr-4 pl-10 backdrop-blur-xl transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <AlertFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AlertStatsWidget
            title="Total Alerts"
            value={stats.totalAlerts}
            icon={BellIcon}
            trend={{ value: 12, isPositive: false }}
            color="blue"
          />
          <AlertStatsWidget
            title="Critical Alerts"
            value={stats.alertsByPriority.critical || 0}
            icon={ExclamationTriangleIcon}
            trend={{ value: 5, isPositive: false }}
            color="red"
          />
          <AlertStatsWidget
            title="Avg Response Time"
            value={`${Math.round(stats.averageResponseTime / 60)}m`}
            icon={ClockIcon}
            trend={{ value: 8, isPositive: true }}
            color="orange"
          />
          <AlertStatsWidget
            title="Resolution Rate"
            value={`${Math.round((1 - stats.escalationRate) * 100)}%`}
            icon={CheckCircleIcon}
            trend={{ value: 15, isPositive: true }}
            color="green"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Alerts */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
              {selectedAlerts.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedAlerts.length} selected</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBulkAction('acknowledge')}
                    className="rounded-lg bg-orange-500 px-3 py-1 text-sm text-white hover:bg-orange-600"
                  >
                    Acknowledge All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBulkAction('resolve')}
                    className="rounded-lg bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                  >
                    Resolve All
                  </motion.button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {alerts?.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledgeAlert}
                    onResolve={handleResolveAlert}
                    onEscalate={handleEscalateAlert}
                    onSelect={handleSelectAlert}
                    isSelected={selectedAlerts.includes(alert.id)}
                    compact={true}
                  />
                ))}
              </AnimatePresence>

              {alerts?.length === 0 && !isLoading && (
                <div className="py-12 text-center">
                  <BellIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">No alerts match your current filters</p>
                </div>
              )}

              {isLoading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 rounded-xl bg-gray-200" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* On-Call Schedules */}
          <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">On-Call Today</h3>
              <UsersIcon className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {schedules?.slice(0, 3).map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  compact={true}
                  showCurrentOnly={true}
                />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="w-full rounded-lg border border-blue-200 bg-blue-50 p-3 text-left transition-colors duration-200 hover:bg-blue-100"
              >
                <div className="flex items-center space-x-3">
                  <PlusIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Create New Alert</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-lg border border-purple-200 bg-purple-50 p-3 text-left transition-colors duration-200 hover:bg-purple-100"
              >
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">View Analytics</span>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-lg border border-orange-200 bg-orange-50 p-3 text-left transition-colors duration-200 hover:bg-orange-100"
              >
                <div className="flex items-center space-x-3">
                  <Cog6ToothIcon className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Manage Schedules</span>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateAlertModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onAlertCreated={() => {
              setShowCreateModal(false);
              refreshData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertDashboard;
