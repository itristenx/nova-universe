import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ServerIcon,
  GlobeAltIcon,
  BellIcon,
  CogIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  KeyIcon,
  CloudIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Monitor {
  id: string;
  name: string;
  type: string;
  status: 'up' | 'down' | 'paused';
  uptime: number;
  config: Record<string, any>;
  tenantId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface StatusPage {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  config: Record<string, any>;
  tenantId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationProvider {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  isDefault: boolean;
  active: boolean;
  tenantId: string;
  createdBy: string;
  createdAt: string;
}

interface SystemSettings {
  [key: string]: {
    value: any;
    type: string;
    description: string;
  };
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  tenantId: string;
  lastLogin?: string;
}

const SentinelAdminPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'monitors' | 'status-pages' | 'notifications' | 'users' | 'settings'
  >('overview');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'monitor' | 'status-page' | 'notification' | null>(
    null,
  );

  // Fetch system overview
  const { data: systemStats } = useQuery({
    queryKey: ['sentinel-admin-overview'],
    queryFn: async () => {
      const response = await fetch('/api/v2/monitoring/analytics/system', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch system stats');
      const data = await response.json();
      return data.analytics;
    },
    refetchInterval: 30000,
  });

  // Fetch monitors for admin
  const { data: monitors = [] } = useQuery({
    queryKey: ['sentinel-admin-monitors'],
    queryFn: async (): Promise<Monitor[]> => {
      const response = await fetch('/api/v2/monitoring/monitors?admin=true', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch monitors');
      const data = await response.json();
      return data.monitors;
    },
    enabled: activeTab === 'monitors',
  });

  // Fetch status pages for admin
  const { data: statusPages = [] } = useQuery({
    queryKey: ['sentinel-admin-status-pages'],
    queryFn: async (): Promise<StatusPage[]> => {
      const response = await fetch('/api/v2/monitoring/status-pages?admin=true', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch status pages');
      const data = await response.json();
      return data.statusPages;
    },
    enabled: activeTab === 'status-pages',
  });

  // Fetch notification providers for admin
  const { data: notifications = [] } = useQuery({
    queryKey: ['sentinel-admin-notifications'],
    queryFn: async (): Promise<NotificationProvider[]> => {
      const response = await fetch('/api/v2/monitoring/notifications?admin=true', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      return data.providers;
    },
    enabled: activeTab === 'notifications',
  });

  // Fetch system settings
  const { data: settings = {} } = useQuery({
    queryKey: ['sentinel-admin-settings'],
    queryFn: async (): Promise<SystemSettings> => {
      const response = await fetch('/api/v2/monitoring/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      return data.settings;
    },
    enabled: activeTab === 'settings',
  });

  // Fetch users for admin
  const { data: users = [] } = useQuery({
    queryKey: ['sentinel-admin-users'],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch('/api/v1/helix/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return data.users.filter((user: User) =>
        user.roles.some((role) => role.startsWith('sentinel')),
      );
    },
    enabled: activeTab === 'users',
  });

  // Delete monitor mutation
  const deleteMonitorMutation = useMutation({
    mutationFn: async (monitorId: string) => {
      const response = await fetch(`/api/v2/monitoring/monitors/${monitorId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete monitor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentinel-admin-monitors'] });
      queryClient.invalidateQueries({ queryKey: ['sentinel-admin-overview'] });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      const response = await fetch('/api/v2/monitoring/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ settings: newSettings }),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentinel-admin-settings'] });
    },
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon, count: 0 },
    { id: 'monitors', name: 'Monitors', icon: ServerIcon, count: monitors.length },
    { id: 'status-pages', name: 'Status Pages', icon: GlobeAltIcon, count: statusPages.length },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, count: notifications.length },
    { id: 'users', name: 'Users', icon: UsersIcon, count: users.length },
    { id: 'settings', name: 'Settings', icon: CogIcon, count: 0 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'paused':
        return <PauseIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ServerIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMonitorTypeIcon = (type: string) => {
    switch (type) {
      case 'http':
      case 'https':
        return <GlobeAltIcon className="h-4 w-4" />;
      case 'port':
      case 'tcp':
        return <ServerIcon className="h-4 w-4" />;
      case 'ping':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'dns':
        return <CloudIcon className="h-4 w-4" />;
      default:
        return <ServerIcon className="h-4 w-4" />;
    }
  };

  const formatUptime = (uptime: number) => `${uptime.toFixed(2)}%`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Sentinel Administration</h1>
          <p className="mt-1 text-gray-600">
            Complete monitoring system management and configuration
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['sentinel-admin-overview'] });
              queryClient.invalidateQueries({ queryKey: ['sentinel-admin-monitors'] });
              queryClient.invalidateQueries({ queryKey: ['sentinel-admin-status-pages'] });
              queryClient.invalidateQueries({ queryKey: ['sentinel-admin-notifications'] });
            }}
            className="rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-700"
            title="Refresh all data"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
          >
            <PlusIcon className="mr-2 inline h-4 w-4" />
            Create New
          </motion.button>
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
                {tab.count > 0 && (
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <h2 className="mb-6 text-xl font-semibold text-gray-900">System Overview</h2>

              {systemStats && (
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-gray-200 p-6">
                    <div className="mb-4 flex items-center space-x-3">
                      <div className="rounded-lg bg-green-100 p-2">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {systemStats.monitors.up}
                        </p>
                        <p className="text-sm text-gray-600">Monitors Up</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {systemStats.monitors.down > 0 && (
                        <span className="text-red-600">{systemStats.monitors.down} down</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-6">
                    <div className="mb-4 flex items-center space-x-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {systemStats.statusPages}
                        </p>
                        <p className="text-sm text-gray-600">Status Pages</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-6">
                    <div className="mb-4 flex items-center space-x-3">
                      <div className="rounded-lg bg-purple-100 p-2">
                        <BellIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {systemStats.subscribers}
                        </p>
                        <p className="text-sm text-gray-600">Subscribers</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-6">
                    <div className="mb-4 flex items-center space-x-3">
                      <div className="rounded-lg bg-orange-100 p-2">
                        <ChartBarIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {systemStats.recentEvents}
                        </p>
                        <p className="text-sm text-gray-600">Recent Events</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCreateType('monitor');
                    setShowCreateModal(true);
                  }}
                  className="rounded-xl border border-gray-200 p-4 text-left transition-all duration-200 hover:shadow-md"
                >
                  <ServerIcon className="mb-3 h-8 w-8 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Create Monitor</h3>
                  <p className="text-sm text-gray-600">Add a new service monitor</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCreateType('status-page');
                    setShowCreateModal(true);
                  }}
                  className="rounded-xl border border-gray-200 p-4 text-left transition-all duration-200 hover:shadow-md"
                >
                  <GlobeAltIcon className="mb-3 h-8 w-8 text-green-600" />
                  <h3 className="font-medium text-gray-900">Create Status Page</h3>
                  <p className="text-sm text-gray-600">Setup a public status page</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCreateType('notification');
                    setShowCreateModal(true);
                  }}
                  className="rounded-xl border border-gray-200 p-4 text-left transition-all duration-200 hover:shadow-md"
                >
                  <BellIcon className="mb-3 h-8 w-8 text-purple-600" />
                  <h3 className="font-medium text-gray-900">Add Notification</h3>
                  <p className="text-sm text-gray-600">Configure notification provider</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Monitors Tab */}
          {activeTab === 'monitors' && (
            <motion.div
              key="monitors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Monitor Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCreateType('monitor');
                    setShowCreateModal(true);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <PlusIcon className="mr-2 inline h-4 w-4" />
                  Create Monitor
                </motion.button>
              </div>

              <div className="space-y-4">
                {monitors.map((monitor) => (
                  <motion.div
                    key={monitor.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(monitor.status)}
                        <div className="flex items-center space-x-2">
                          {getMonitorTypeIcon(monitor.type)}
                          <span className="text-xs tracking-wide text-gray-500 uppercase">
                            {monitor.type}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{monitor.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Uptime: {formatUptime(monitor.uptime)}</span>
                            <span>Tenant: {monitor.tenantId}</span>
                            <span>Created: {formatDate(monitor.createdAt)}</span>
                          </div>
                          {monitor.config.url && (
                            <p className="mt-1 text-xs text-gray-500">{monitor.config.url}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedItem(monitor)}
                          className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
                        >
                          <EyeIcon className="mr-1 inline h-4 w-4" />
                          View
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                        >
                          <PencilIcon className="mr-1 inline h-4 w-4" />
                          Edit
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteMonitorMutation.mutate(monitor.id)}
                          disabled={deleteMonitorMutation.isPending}
                          className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          <TrashIcon className="mr-1 inline h-4 w-4" />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Status Pages Tab */}
          {activeTab === 'status-pages' && (
            <motion.div
              key="status-pages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Status Page Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCreateType('status-page');
                    setShowCreateModal(true);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <PlusIcon className="mr-2 inline h-4 w-4" />
                  Create Status Page
                </motion.button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {statusPages.map((statusPage) => (
                  <motion.div
                    key={statusPage.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="font-medium text-gray-900">{statusPage.title}</h3>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          statusPage.published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusPage.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="mb-4 space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Slug:</span>
                        <span className="font-mono text-xs">{statusPage.slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tenant:</span>
                        <span>{statusPage.tenantId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{formatDate(statusPage.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedItem(statusPage)}
                        className="flex-1 rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200"
                      >
                        <EyeIcon className="mr-1 inline h-4 w-4" />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                      >
                        <PencilIcon className="mr-1 inline h-4 w-4" />
                        Edit
                      </motion.button>
                      {statusPage.published && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => window.open(`/status/${statusPage.slug}`, '_blank')}
                          className="rounded-lg bg-green-100 px-3 py-2 text-sm text-green-700 hover:bg-green-200"
                        >
                          <GlobeAltIcon className="h-4 w-4" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Notification Providers</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCreateType('notification');
                    setShowCreateModal(true);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <PlusIcon className="mr-2 inline h-4 w-4" />
                  Add Provider
                </motion.button>
              </div>

              <div className="space-y-4">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <BellIcon className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{notification.name}</h3>
                            {notification.isDefault && (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                DEFAULT
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                notification.active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {notification.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Type: {notification.type.toUpperCase()}</span>
                            <span>Tenant: {notification.tenantId}</span>
                            <span>Created: {formatDate(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg bg-yellow-100 px-3 py-1 text-sm text-yellow-700 hover:bg-yellow-200"
                        >
                          Test
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedItem(notification)}
                          className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
                        >
                          <EyeIcon className="mr-1 inline h-4 w-4" />
                          View
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                        >
                          <PencilIcon className="mr-1 inline h-4 w-4" />
                          Edit
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Sentinel Users</h2>

              <div className="space-y-4">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <UsersIcon className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{user.username}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{user.email}</span>
                            <span>Tenant: {user.tenantId}</span>
                            {user.lastLogin && (
                              <span>Last login: {formatDate(user.lastLogin)}</span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center space-x-2">
                            {user.roles
                              .filter((role) => role.startsWith('sentinel'))
                              .map((role) => (
                                <span
                                  key={role}
                                  className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800"
                                >
                                  {role.replace('sentinel:', '').toUpperCase()}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
                        >
                          <EyeIcon className="mr-1 inline h-4 w-4" />
                          Permissions
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateSettingsMutation.mutate(settings)}
                  disabled={updateSettingsMutation.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Changes
                </motion.button>
              </div>

              <div className="space-y-6">
                {Object.entries(settings).map(([key, setting]) => (
                  <div key={key} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1 font-medium text-gray-900">{key}</h3>
                        {setting.description && (
                          <p className="mb-3 text-sm text-gray-600">{setting.description}</p>
                        )}

                        <div className="flex items-center space-x-3">
                          {setting.type === 'boolean' ? (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={setting.value}
                                onChange={(e) => {
                                  const newSettings = {
                                    ...settings,
                                    [key]: { ...setting, value: e.target.checked },
                                  };
                                  // Update local state here if using React state
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                {setting.value ? 'Enabled' : 'Disabled'}
                              </span>
                            </label>
                          ) : setting.type === 'number' ? (
                            <input
                              type="number"
                              value={setting.value}
                              onChange={(e) => {
                                const newSettings = {
                                  ...settings,
                                  [key]: { ...setting, value: parseFloat(e.target.value) },
                                };
                                // Update local state here
                              }}
                              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                              aria-label={`${key} numeric value`}
                              placeholder={`${key}`}
                            />
                          ) : (
                            <input
                              type="text"
                              value={setting.value}
                              onChange={(e) => {
                                const newSettings = {
                                  ...settings,
                                  [key]: { ...setting, value: e.target.value },
                                };
                                // Update local state here
                              }}
                              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                              aria-label={`${key} text value`}
                              placeholder={`${key}`}
                            />
                          )}
                        </div>
                      </div>

                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {setting.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Create New</h3>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCreateType('monitor');
                    setShowCreateModal(false);
                  }}
                  className="w-full rounded-lg border border-gray-200 p-3 text-left transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <ServerIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Monitor</h4>
                      <p className="text-sm text-gray-600">Add a new service monitor</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCreateType('status-page');
                    setShowCreateModal(false);
                  }}
                  className="w-full rounded-lg border border-gray-200 p-3 text-left transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-medium">Status Page</h4>
                      <p className="text-sm text-gray-600">Create a public status page</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setCreateType('notification');
                    setShowCreateModal(false);
                  }}
                  className="w-full rounded-lg border border-gray-200 p-3 text-left transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <BellIcon className="h-6 w-6 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Notification Provider</h4>
                      <p className="text-sm text-gray-600">Configure notifications</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Item Details</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="rounded-lg p-2 hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-sm">
                  {JSON.stringify(selectedItem, null, 2)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SentinelAdminPanel;
