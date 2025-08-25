import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PowerIcon,
  CodeBracketIcon,
  UserIcon,
  UserGroupIcon,
  GlobeAltIcon,
  PercentBadgeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useRBACStore } from '../stores/rbacStore';
import { FeatureFlag, FeatureFlagOverride } from '../types/rbac';

interface FeatureFlagManagerProps {
  className?: string;
}

interface FlagFormData {
  key: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json' | 'rollout';
  enabled: boolean;
  value: any;
  rollout_percentage?: number;
  environment_override: boolean;
  requires_restart: boolean;
  tags: string[];
}

export default function FeatureFlagManager({ className = '' }: FeatureFlagManagerProps) {
  const [activeTab, setActiveTab] = useState<'flags' | 'overrides'>('flags');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState<FlagFormData>({
    key: '',
    name: '',
    description: '',
    type: 'boolean',
    enabled: false,
    value: false,
    environment_override: true,
    requires_restart: false,
    tags: [],
  });

  const {
    currentUser,
    featureFlags,
    featureFlagOverrides,
    createFeatureFlag,
    updateFeatureFlag,
    deleteFeatureFlag,
    isFeatureEnabled,
    getFeatureFlagValue,
    createFeatureFlagOverride,
    removeFeatureFlagOverride,
    checkPermission,
  } = useRBACStore();

  // Filter feature flags based on search and filters
  const filteredFlags = featureFlags.filter((flag) => {
    const matchesSearch =
      flag.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || flag.type === selectedType;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'enabled' && flag.enabled) ||
      (selectedStatus === 'disabled' && !flag.enabled);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateFlag = () => {
    if (!formData.key || !formData.name) return;

    createFeatureFlag({
      key: formData.key,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      enabled: formData.enabled,
      value: formData.value,
      rollout_percentage: formData.type === 'rollout' ? formData.rollout_percentage : undefined,
      environment_override: formData.environment_override,
      created_by: currentUser?.id || 'system',
    });

    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateFlag = () => {
    if (!editingFlag) return;

    updateFeatureFlag(editingFlag.id, {
      name: formData.name,
      description: formData.description,
      enabled: formData.enabled,
      value: formData.value,
      rollout_percentage: formData.type === 'rollout' ? formData.rollout_percentage : undefined,
      environment_override: formData.environment_override,
    });

    setShowEditModal(false);
    setEditingFlag(null);
    resetForm();
  };

  const handleDeleteFlag = (flagId: string) => {
    if (window.confirm('Are you sure you want to delete this feature flag?')) {
      deleteFeatureFlag(flagId);
    }
  };

  const handleToggleFlag = (flag: FeatureFlag) => {
    updateFeatureFlag(flag.id, { enabled: !flag.enabled });
  };

  const resetForm = () => {
    setFormData({
      key: '',
      name: '',
      description: '',
      type: 'boolean',
      enabled: false,
      value: false,
      environment_override: true,
      requires_restart: false,
      tags: [],
    });
  };

  const openEditModal = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    setFormData({
      key: flag.key,
      name: flag.name,
      description: flag.description || '',
      type: flag.type,
      enabled: flag.enabled,
      value: flag.value,
      rollout_percentage: flag.rollout_percentage,
      environment_override: flag.environment_override,
      requires_restart: false,
      tags: [],
    });
    setShowEditModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'boolean':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'string':
        return <CodeBracketIcon className="h-4 w-4" />;
      case 'number':
        return <PercentBadgeIcon className="h-4 w-4" />;
      case 'rollout':
        return <UserGroupIcon className="h-4 w-4" />;
      case 'json':
        return <CodeBracketIcon className="h-4 w-4" />;
      default:
        return <FlagIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'boolean':
        return 'bg-blue-100 text-blue-800';
      case 'string':
        return 'bg-green-100 text-green-800';
      case 'number':
        return 'bg-purple-100 text-purple-800';
      case 'rollout':
        return 'bg-yellow-100 text-yellow-800';
      case 'json':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderValue = (flag: FeatureFlag) => {
    if (flag.type === 'boolean') {
      return flag.value ? 'true' : 'false';
    } else if (flag.type === 'json') {
      return (
        JSON.stringify(flag.value).substring(0, 50) +
        (JSON.stringify(flag.value).length > 50 ? '...' : '')
      );
    } else {
      return String(flag.value);
    }
  };

  const renderFlagsTab = () => (
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FunnelIcon className="mr-2 h-4 w-4" />
            Filters
          </button>
          {checkPermission('features:create') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Flag
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="boolean">Boolean</option>
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="rollout">Rollout</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Environment
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
                      <div className="flex items-center">
                        <FlagIcon className="mr-3 h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{flag.name}</div>
                          <div className="text-sm text-gray-500">{flag.key}</div>
                        </div>
                      </div>
                      {flag.description && (
                        <div className="mt-1 ml-8 text-xs text-gray-400">{flag.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(flag.type)}`}
                    >
                      {getTypeIcon(flag.type)}
                      <span className="ml-1">{flag.type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleFlag(flag)}
                      disabled={!checkPermission('features:update')}
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        flag.enabled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } ${!checkPermission('features:update') ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <PowerIcon className="mr-1 h-3 w-3" />
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                    <div className="max-w-32 truncate">{renderValue(flag)}</div>
                    {flag.type === 'rollout' && flag.rollout_percentage && (
                      <div className="text-xs text-gray-500">
                        {flag.rollout_percentage}% rollout
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {flag.environment_override && (
                        <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          <GlobeAltIcon className="mr-1 h-3 w-3" />
                          ENV
                        </span>
                      )}
                      {/* Remove requires_restart display since it's not in the type */}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                    <div className="flex space-x-2">
                      {checkPermission('features:read') && (
                        <button
                          onClick={() => openEditModal(flag)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View/Edit flag"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      {checkPermission('features:update') && (
                        <button
                          onClick={() => openEditModal(flag)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit flag"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {checkPermission('features:delete') && (
                        <button
                          onClick={() => handleDeleteFlag(flag.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete flag"
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

  const renderOverridesTab = () => (
    <div className="space-y-6">
      <div className="py-12 text-center">
        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Feature Flag Overrides</h3>
        <p className="mt-1 text-sm text-gray-500">
          User and group-specific feature flag overrides will be displayed here.
        </p>
      </div>
    </div>
  );

  const renderFormModal = (isEdit: boolean) => (
    <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
      <div className="relative top-10 mx-auto w-full max-w-2xl rounded-md border bg-white p-5 shadow-lg">
        <div className="mt-3">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {isEdit ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </h3>
            <button
              onClick={() => {
                isEdit ? setShowEditModal(false) : setShowCreateModal(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Key (only for new flags) */}
            {!isEdit && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Flag Key *</label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="feature_name"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Unique identifier for the feature flag (lowercase, underscores only)
                </p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Display Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Feature Name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows={3}
                placeholder="Describe what this feature flag controls..."
              />
            </div>

            {/* Type and Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as any,
                      value:
                        e.target.value === 'boolean'
                          ? false
                          : e.target.value === 'number'
                            ? 0
                            : e.target.value === 'json'
                              ? {}
                              : '',
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isEdit}
                >
                  <option value="boolean">Boolean</option>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="rollout">Rollout</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Default Value
                </label>
                {formData.type === 'boolean' ? (
                  <select
                    value={String(formData.value)}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value === 'true' })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                ) : formData.type === 'number' ? (
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                ) : formData.type === 'json' ? (
                  <textarea
                    value={
                      typeof formData.value === 'object'
                        ? JSON.stringify(formData.value, null, 2)
                        : formData.value
                    }
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, value: JSON.parse(e.target.value) });
                      } catch {
                        setFormData({ ...formData, value: e.target.value });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    rows={2}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Rollout Percentage */}
            {formData.type === 'rollout' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rollout Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.rollout_percentage || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, rollout_percentage: parseInt(e.target.value) || 0 })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
                  Enabled by default
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="environment_override"
                  checked={formData.environment_override}
                  onChange={(e) =>
                    setFormData({ ...formData, environment_override: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="environment_override" className="ml-2 block text-sm text-gray-900">
                  Allow environment variable override
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_restart"
                  checked={formData.requires_restart}
                  onChange={(e) => setFormData({ ...formData, requires_restart: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="requires_restart" className="ml-2 block text-sm text-gray-900">
                  Requires application restart
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={isEdit ? handleUpdateFlag : handleCreateFlag}
              disabled={!formData.name || (!isEdit && !formData.key)}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isEdit ? 'Update' : 'Create'} Flag
            </button>
            <button
              onClick={() => {
                isEdit ? setShowEditModal(false) : setShowCreateModal(false);
                resetForm();
              }}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentUser || !checkPermission('features:read')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access feature flags.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feature Flag Manager</h2>
          <p className="mt-1 text-sm text-gray-600">Control feature rollouts and configuration</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {filteredFlags.filter((f) => f.enabled).length} of {filteredFlags.length} enabled
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('flags')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'flags'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Feature Flags
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {featureFlags.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('overrides')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'overrides'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Overrides
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {featureFlagOverrides.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'flags' && renderFlagsTab()}
          {activeTab === 'overrides' && renderOverridesTab()}
        </motion.div>
      </AnimatePresence>

      {/* Create Modal */}
      {showCreateModal && renderFormModal(false)}

      {/* Edit Modal */}
      {showEditModal && renderFormModal(true)}
    </div>
  );
}
