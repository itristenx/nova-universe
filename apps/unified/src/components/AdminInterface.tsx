import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  UsersIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  FlagIcon,
  ChartBarIcon,
  KeyIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import { useRBACStore } from '../stores/rbacStore';
import {
  User,
  Role,
  Permission,
  Group,
  ApprovalFlow,
  FeatureFlag,
  SystemConfiguration,
  AuditLog,
} from '../types/rbac';

interface AdminInterfaceProps {
  className?: string;
}

interface TabConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  requiresPermission: string;
}

const ADMIN_TABS: TabConfig[] = [
  {
    id: 'overview',
    name: 'Dashboard',
    icon: ChartBarIcon,
    color: 'blue',
    requiresPermission: 'admin:read',
  },
  {
    id: 'users',
    name: 'User Management',
    icon: UsersIcon,
    color: 'green',
    requiresPermission: 'users:read',
  },
  {
    id: 'roles',
    name: 'Role Management',
    icon: ShieldCheckIcon,
    color: 'purple',
    requiresPermission: 'roles:read',
  },
  {
    id: 'permissions',
    name: 'Permissions',
    icon: KeyIcon,
    color: 'orange',
    requiresPermission: 'permissions:read',
  },
  {
    id: 'groups',
    name: 'Groups',
    icon: UserGroupIcon,
    color: 'indigo',
    requiresPermission: 'groups:read',
  },
  {
    id: 'approvals',
    name: 'Approval Flows',
    icon: ClipboardDocumentListIcon,
    color: 'yellow',
    requiresPermission: 'approvals:read',
  },
  {
    id: 'features',
    name: 'Feature Flags',
    icon: FlagIcon,
    color: 'pink',
    requiresPermission: 'features:read',
  },
  {
    id: 'config',
    name: 'System Config',
    icon: CogIcon,
    color: 'gray',
    requiresPermission: 'config:read',
  },
  {
    id: 'audit',
    name: 'Audit Logs',
    icon: DocumentTextIcon,
    color: 'red',
    requiresPermission: 'audit:read',
  },
];

export default function AdminInterface({ className = '' }: AdminInterfaceProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const {
    currentUser,
    checkPermission,
    users,
    roles,
    permissions,
    groups,
    approvalFlows,
    featureFlags,
    systemConfig,
    auditLogs,
    getAdminModules,
    initializeStandardRoles,
  } = useRBACStore();

  useEffect(() => {
    // Initialize standard roles if none exist
    if (roles.length === 0) {
      initializeStandardRoles();
    }
  }, [roles.length, initializeStandardRoles]);

  // Filter tabs based on user permissions
  const availableTabs = ADMIN_TABS.filter((tab) => checkPermission(tab.requiresPermission));

  if (!currentUser || !checkPermission('admin:read')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access the admin interface.</p>
        </div>
      </div>
    );
  }

  const renderOverviewTab = () => {
    const stats = [
      {
        name: 'Active Users',
        value: users.filter((u) => u.active).length,
        icon: UsersIcon,
        color: 'green',
      },
      { name: 'Total Roles', value: roles.length, icon: ShieldCheckIcon, color: 'purple' },
      { name: 'Permissions', value: permissions.length, icon: KeyIcon, color: 'orange' },
      {
        name: 'Active Groups',
        value: groups.filter((g) => g.active).length,
        icon: UserGroupIcon,
        color: 'indigo',
      },
      {
        name: 'Approval Flows',
        value: approvalFlows.filter((f) => f.active).length,
        icon: ClipboardDocumentListIcon,
        color: 'yellow',
      },
      {
        name: 'Feature Flags',
        value: featureFlags.filter((f) => f.enabled).length,
        icon: FlagIcon,
        color: 'pink',
      },
    ];

    const recentAudits = auditLogs.slice(0, 5);

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-lg p-3 bg-${stat.color}-100`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => setActiveTab('users')}
              className="flex items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <PlusIcon className="mr-3 h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium">Create User</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className="flex items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <ShieldCheckIcon className="mr-3 h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium">Manage Roles</span>
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className="flex items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <ClipboardDocumentListIcon className="mr-3 h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium">Approval Flows</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className="flex items-center rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
            >
              <DocumentTextIcon className="mr-3 h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium">View Audit Log</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-gray-900">Recent Activity</h3>
          <div className="space-y-3">
            {recentAudits.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.user_name}</p>
                    <p className="text-sm text-gray-600">
                      {log.action} {log.resource_type}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{log.timestamp.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUsersTab = () => {
    const filteredUsers = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="max-w-lg flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <FunnelIcon className="mr-2 h-4 w-4" />
              Filters
            </button>
            {checkPermission('users:create') && (
              <button className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add User
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Last Login
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                            <span className="text-sm font-medium text-gray-700">
                              {user.first_name?.[0] || user.username[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.username}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.slice(0, 2).map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                          >
                            {role.name}
                          </span>
                        ))}
                        {user.roles.length > 2 && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                            +{user.roles.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.active && !user.locked_out
                            ? 'bg-green-100 text-green-800'
                            : user.locked_out
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.locked_out ? 'Locked' : user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {user.last_login?.toLocaleString() || 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2">
                        {checkPermission('users:read') && (
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View user details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        {checkPermission('users:update') && (
                          <button className="text-gray-600 hover:text-gray-900" title="Edit user">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        {checkPermission('users:delete') && (
                          <button className="text-red-600 hover:text-red-900" title="Delete user">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderRolesTab = () => {
    const filteredRoles = roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="max-w-lg flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            {checkPermission('roles:create') && (
              <button className="inline-flex items-center rounded-lg border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Role
              </button>
            )}
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <div key={role.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <ShieldCheckIcon
                    className={`h-8 w-8 ${
                      role.type === 'system' ? 'text-blue-600' : 'text-purple-600'
                    }`}
                  />
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-500">{role.type}</p>
                  </div>
                </div>
                {role.elevated_privilege && (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                )}
              </div>

              <p className="mb-4 text-sm text-gray-600">{role.description}</p>

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">{role.permissions.length} permissions</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    role.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {role.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex space-x-2">
                {checkPermission('roles:read') && (
                  <button className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <EyeIcon className="mr-2 h-4 w-4" />
                    View
                  </button>
                )}
                {checkPermission('roles:update') && role.type !== 'system' && (
                  <button className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderApprovalsTab = () => {
    const filteredFlows = approvalFlows.filter(
      (flow) =>
        flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flow.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="max-w-lg flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search approval flows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            {checkPermission('approvals:create') && (
              <button className="inline-flex items-center rounded-lg border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Flow
              </button>
            )}
          </div>
        </div>

        {/* Approval Flows List */}
        <div className="space-y-4">
          {filteredFlows.map((flow) => (
            <div key={flow.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{flow.name}</h3>
                  <p className="text-sm text-gray-600">{flow.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      flow.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {flow.active ? 'Active' : 'Inactive'}
                  </span>
                  {checkPermission('approvals:update') && (
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      title="Edit approval flow"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Table</span>
                  <p className="text-sm text-gray-900">{flow.trigger_table}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Steps</span>
                  <p className="text-sm text-gray-900">{flow.steps.length}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Version</span>
                  <p className="text-sm text-gray-900">v{flow.version}</p>
                </div>
              </div>

              {/* Flow Steps Visualization */}
              <div className="flex items-center space-x-2 overflow-x-auto">
                {flow.steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-shrink-0 flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-xs font-medium text-blue-600">{step.order + 1}</span>
                      </div>
                      <span className="mt-1 max-w-20 truncate text-center text-xs text-gray-500">
                        {step.name}
                      </span>
                    </div>
                    {index < flow.steps.length - 1 && (
                      <ArrowRightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFeatureFlagsTab = () => {
    const filteredFlags = featureFlags.filter(
      (flag) =>
        flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flag.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="max-w-lg flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search feature flags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            {checkPermission('features:create') && (
              <button className="inline-flex items-center rounded-lg border border-transparent bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Flag
              </button>
            )}
          </div>
        </div>

        {/* Feature Flags List */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Flag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Rollout
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredFlags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{flag.name}</div>
                        <div className="text-sm text-gray-500">{flag.key}</div>
                        {flag.description && (
                          <div className="mt-1 text-xs text-gray-400">{flag.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          flag.type === 'boolean'
                            ? 'bg-blue-100 text-blue-800'
                            : flag.type === 'rollout'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {flag.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          flag.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {flag.type === 'rollout' && flag.rollout_percentage
                        ? `${flag.rollout_percentage}%`
                        : flag.enabled
                          ? '100%'
                          : '0%'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex space-x-2">
                        {checkPermission('features:read') && (
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View feature flag details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        {checkPermission('features:update') && (
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit feature flag"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        {checkPermission('features:delete') && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete feature flag"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderAuditTab = () => {
    const filteredLogs = auditLogs
      .filter(
        (log) =>
          log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .slice(0, 100); // Limit to 100 most recent

    return (
      <div className="space-y-6">
        {/* Search and Actions */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="max-w-lg flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.user_name}</div>
                      <div className="text-sm text-gray-500">{log.ip_address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          log.action === 'created'
                            ? 'bg-green-100 text-green-800'
                            : log.action === 'updated'
                              ? 'bg-blue-100 text-blue-800'
                              : log.action === 'deleted'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.resource_type}</div>
                      <div className="text-sm text-gray-500">{log.resource_id}</div>
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-500">
                      {log.after_value && typeof log.after_value === 'object'
                        ? JSON.stringify(log.after_value).substring(0, 100) + '...'
                        : 'No details'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'users':
        return renderUsersTab();
      case 'roles':
        return renderRolesTab();
      case 'permissions':
        return (
          <div className="p-8 text-center text-gray-500">Permissions management coming soon...</div>
        );
      case 'groups':
        return (
          <div className="p-8 text-center text-gray-500">Groups management coming soon...</div>
        );
      case 'approvals':
        return renderApprovalsTab();
      case 'features':
        return renderFeatureFlagsTab();
      case 'config':
        return (
          <div className="p-8 text-center text-gray-500">System configuration coming soon...</div>
        );
      case 'audit':
        return renderAuditTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage users, roles, permissions, and system configuration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Logged in as:{' '}
                <span className="font-medium text-gray-900">{currentUser?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
