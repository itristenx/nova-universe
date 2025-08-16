import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ServerIcon,
  CogIcon,
  BellIcon,
  PlusIcon,
  StarIcon,
  EyeIcon,
  ArrowPathIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface GoAlertService {
  id: string;
  name: string;
  description: string;
  escalationPolicyID: string;
  userFavorite: boolean;
  lastAccessed?: string;
}

interface GoAlertAlert {
  id: string;
  serviceID: string;
  serviceName: string;
  summary: string;
  details: string;
  status: 'active' | 'acknowledged' | 'closed';
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  closedAt?: string;
  closedBy?: string;
}

interface GoAlertSchedule {
  id: string;
  name: string;
  description: string;
  timeZone: string;
  userFavorite: boolean;
  currentOnCall: Array<{
    userID: string;
    userName: string;
    start: string;
    end: string;
  }>;
}

interface GoAlertEscalationPolicy {
  id: string;
  name: string;
  description: string;
  repeat: number;
  userFavorite: boolean;
  steps: Array<{
    delayMinutes: number;
    targets: Array<{
      id: string;
      name: string;
      type: string;
    }>;
  }>;
}

const GoAlertDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'alerts' | 'services' | 'schedules' | 'escalation-policies'
  >('alerts');
  const [selectedAlert, setSelectedAlert] = useState<GoAlertAlert | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('active');

  // Fetch alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['goalert-alerts', filterStatus],
    queryFn: async (): Promise<GoAlertAlert[]> => {
      const response = await fetch(`/api/v2/goalert/alerts?status=${filterStatus}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      return data.alerts || data; // proxy returns {alerts}
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch services
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['goalert-services'],
    queryFn: async (): Promise<GoAlertService[]> => {
      const response = await fetch('/api/v2/goalert/services', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      return data.services;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch schedules
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['goalert-schedules'],
    queryFn: async (): Promise<GoAlertSchedule[]> => {
      const response = await fetch('/api/v2/goalert/schedules', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      return data.schedules;
    },
    refetchInterval: 60000,
  });

  // Fetch escalation policies
  const { data: escalationPolicies = [], isLoading: escalationPoliciesLoading } = useQuery({
    queryKey: ['goalert-escalation-policies'],
    queryFn: async (): Promise<GoAlertEscalationPolicy[]> => {
      const response = await fetch('/api/v2/goalert/escalation-policies', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch escalation policies');
      const data = await response.json();
      return data.escalationPolicies;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/v2/goalert/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to acknowledge alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalert-alerts'] });
    },
  });

  // Close alert mutation
  const closeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/v2/goalert/alerts/${alertId}/close`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to close alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goalert-alerts'] });
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ type, id, favorite }: { type: string; id: string; favorite: boolean }) => {
      const endpoint =
        type === 'service' ? 'services' : type === 'schedule' ? 'schedules' : 'escalation-policies';
      const response = await fetch(`/api/v2/goalert/${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ favorite }),
      });
      if (!response.ok) throw new Error('Failed to update favorite');
      return response.json();
    },
    onSuccess: (_, variables) => {
      const queryKey =
        variables.type === 'service'
          ? 'goalert-services'
          : variables.type === 'schedule'
            ? 'goalert-schedules'
            : 'goalert-escalation-policies';
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'acknowledged':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'closed':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return ExclamationTriangleIcon;
      case 'acknowledged':
        return ClockIcon;
      case 'closed':
        return CheckCircleIcon;
      default:
        return BellIcon;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const tabs = [
    { id: 'alerts', name: 'Alerts', icon: BellIcon, count: alerts.length },
    { id: 'services', name: 'Services', icon: ServerIcon, count: services.length },
    { id: 'schedules', name: 'Schedules', icon: CalendarIcon, count: schedules.length },
    {
      id: 'escalation-policies',
      name: 'Escalation Policies',
      icon: UserGroupIcon,
      count: escalationPolicies.length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">GoAlert Management</h1>
          <p className="mt-1 text-gray-600">
            Complete alerting and on-call management through Nova
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['goalert-alerts'] });
              queryClient.invalidateQueries({ queryKey: ['goalert-services'] });
              queryClient.invalidateQueries({ queryKey: ['goalert-schedules'] });
              queryClient.invalidateQueries({ queryKey: ['goalert-escalation-policies'] });
            }}
            className="rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
            title="Refresh all data"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-red-100 p-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter((a) => a.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Active Alerts</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <ServerIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              <p className="text-sm text-gray-600">Services</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
              <p className="text-sm text-gray-600">Schedules</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/50 bg-white/80 p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{escalationPolicies.length}</p>
              <p className="text-sm text-gray-600">Escalation Policies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="rounded-xl border border-gray-200/50 bg-white/80 p-1 backdrop-blur-xl">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Active Alerts</h2>

                <div className="flex items-center space-x-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {alerts.map((alert) => {
                  const StatusIcon = getStatusIcon(alert.status);
                  return (
                    <motion.div
                      key={alert.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-lg border p-4 ${getStatusColor(alert.status)} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <StatusIcon className="mt-1 h-5 w-5" />
                          <div>
                            <h3 className="font-medium text-gray-900">{alert.summary}</h3>
                            <p className="mt-1 text-sm text-gray-600">
                              Service: {alert.serviceName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Created: {formatDate(alert.createdAt)}
                            </p>
                            {alert.details && (
                              <p className="mt-2 text-sm text-gray-700">{alert.details}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {alert.status === 'active' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => acknowledgeAlertMutation.mutate(alert.id)}
                                disabled={acknowledgeAlertMutation.isPending}
                                className="rounded-lg bg-yellow-600 px-3 py-1 text-sm text-white hover:bg-yellow-700 disabled:opacity-50"
                              >
                                Acknowledge
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => closeAlertMutation.mutate(alert.id)}
                                disabled={closeAlertMutation.isPending}
                                className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                Close
                              </motion.button>
                            </>
                          )}

                          {alert.status === 'acknowledged' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => closeAlertMutation.mutate(alert.id)}
                              disabled={closeAlertMutation.isPending}
                              className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Close
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {alerts.length === 0 && !alertsLoading && (
                  <div className="py-12 text-center">
                    <BellIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No {filterStatus} alerts found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <PlusIcon className="mr-2 inline h-4 w-4" />
                  Create Service
                </motion.button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <ServerIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          toggleFavoriteMutation.mutate({
                            type: 'service',
                            id: service.id,
                            favorite: !service.userFavorite,
                          })
                        }
                        className="text-gray-400 hover:text-yellow-500"
                      >
                        {service.userFavorite ? (
                          <StarIconSolid className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <StarIcon className="h-5 w-5" />
                        )}
                      </motion.button>
                    </div>

                    <p className="mb-3 text-sm text-gray-600">{service.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Policy: {service.escalationPolicyID}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        <EyeIcon className="mr-1 inline h-4 w-4" />
                        View
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'schedules' && (
            <motion.div
              key="schedules"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Schedules</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <PlusIcon className="mr-2 inline h-4 w-4" />
                  Create Schedule
                </motion.button>
              </div>

              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <motion.div
                    key={schedule.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <CalendarIcon className="mt-1 h-5 w-5 text-green-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{schedule.name}</h3>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                toggleFavoriteMutation.mutate({
                                  type: 'schedule',
                                  id: schedule.id,
                                  favorite: !schedule.userFavorite,
                                })
                              }
                              className="text-gray-400 hover:text-yellow-500"
                            >
                              {schedule.userFavorite ? (
                                <StarIconSolid className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <StarIcon className="h-4 w-4" />
                              )}
                            </motion.button>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{schedule.description}</p>
                          <p className="text-sm text-gray-500">Time Zone: {schedule.timeZone}</p>

                          {schedule.currentOnCall.length > 0 && (
                            <div className="mt-3">
                              <p className="mb-2 text-sm font-medium text-gray-700">
                                Currently On-Call:
                              </p>
                              <div className="space-y-1">
                                {schedule.currentOnCall.map((onCall, index) => (
                                  <div key={index} className="flex items-center space-x-2 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="text-gray-700">{onCall.userName}</span>
                                    <span className="text-gray-500">
                                      until {formatDate(onCall.end)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        <EyeIcon className="mr-1 inline h-4 w-4" />
                        Manage
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'escalation-policies' && (
            <motion.div
              key="escalation-policies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Escalation Policies</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <PlusIcon className="mr-2 inline h-4 w-4" />
                  Create Policy
                </motion.button>
              </div>

              <div className="space-y-4">
                {escalationPolicies.map((policy) => (
                  <motion.div
                    key={policy.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <UserGroupIcon className="mt-1 h-5 w-5 text-purple-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{policy.name}</h3>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                toggleFavoriteMutation.mutate({
                                  type: 'escalation-policy',
                                  id: policy.id,
                                  favorite: !policy.userFavorite,
                                })
                              }
                              className="text-gray-400 hover:text-yellow-500"
                            >
                              {policy.userFavorite ? (
                                <StarIconSolid className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <StarIcon className="h-4 w-4" />
                              )}
                            </motion.button>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{policy.description}</p>
                          <p className="text-sm text-gray-500">
                            {policy.steps.length} steps, repeat {policy.repeat} times
                          </p>

                          <div className="mt-3 space-y-2">
                            {policy.steps.map((step, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
                                  {index + 1}
                                </div>
                                <span className="text-gray-600">
                                  After {step.delayMinutes} min → {step.targets.length} target(s)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        <CogIcon className="mr-1 inline h-4 w-4" />
                        Configure
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GoAlertDashboard;
