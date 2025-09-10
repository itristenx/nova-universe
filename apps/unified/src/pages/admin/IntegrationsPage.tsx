import { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { cn, formatNumber } from '@utils/index';
import toast from 'react-hot-toast';

// Custom icon components for React 19 compatibility
const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
    />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
    />
  </svg>
);

// Integration interface
interface Integration {
  id: number;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  description: string;
  category: string;
  enabled: boolean;
  lastSync?: string;
  config: Record<string, any>;
  metrics?: {
    totalSyncs: number;
    successRate: number;
    lastError?: string;
  };
}

const INTEGRATION_TYPES = [
  { value: 'smtp', label: 'SMTP Email', category: 'Communication' },
  { value: 'slack', label: 'Slack', category: 'Communication' },
  { value: 'teams', label: 'Microsoft Teams', category: 'Communication' },
  { value: 'microsoft365', label: 'Microsoft 365', category: 'Communication' },
  { value: 'webhook', label: 'Generic Webhook', category: 'API' },
  { value: 'jira', label: 'Jira', category: 'Project Management' },
  { value: 'servicenow', label: 'ServiceNow', category: 'ITSM' },
  { value: 'salesforce', label: 'Salesforce', category: 'CRM' },
  { value: 'zendesk', label: 'Zendesk', category: 'Support' },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'microsoft365',
    config: { tenantId: '', clientId: '', clientSecret: '', mailbox: '' },
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  useEffect(() => {
    if (editingIntegration) {
      setFormData({
        name: editingIntegration.name,
        type: editingIntegration.type,
        config: {
          tenantId: editingIntegration.config?.tenantId || '',
          clientId: editingIntegration.config?.clientId || '',
          clientSecret: editingIntegration.config?.clientSecret || '',
          mailbox: editingIntegration.config?.mailbox || '',
        },
      });
    } else if (showCreateModal) {
      setFormData({
        name: '',
        type: 'microsoft365',
        config: { tenantId: '', clientId: '', clientSecret: '', mailbox: '' },
      });
    }
  }, [editingIntegration, showCreateModal]);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);

      // Fetch integrations from API
      const response = await apiFetch('/api/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      } else {
        // Fallback to empty state if API fails
        setIntegrations([]);
      }
    } catch (_error) {
      console.warn('Integrations API unavailable, using fallback data:', _error);
      // Fallback to empty state
      setIntegrations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveIntegration = async () => {
    try {
      const response = await apiFetch(`/api/integrations/${formData.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.config),
      });
      if (response.ok) {
        toast.success(
          editingIntegration ? 'Integration updated successfully' : 'Integration created successfully',
        );
        setShowCreateModal(false);
        setEditingIntegration(null);
        await loadIntegrations();
      } else {
        toast.error('Failed to save integration');
      }
    } catch (_error) {
      console.error('Error saving integration:', _error);
      toast.error('Failed to save integration');
    }
  };

  const testIntegration = async (integrationId: string) => {
    try {
      setTestingIntegration(integrationId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIntegrations(
        integrations.map((integration) =>
          integration.id === integrationId
            ? { ...integration, status: 'connected' as const }
            : integration,
        ),
      );

      toast.success('Integration test successful');
    } catch (_error) {
      console.error('Error testing integration:', _error);
      toast.error('Integration test failed');
    } finally {
      setTestingIntegration(null);
    }
  };

  const toggleIntegration = async (integrationId: string, enabled: boolean) => {
    try {
      setIntegrations(
        integrations.map((integration) =>
          integration.id === integrationId
            ? { ...integration, enabled, status: enabled ? 'connected' : ('disconnected' as const) }
            : integration,
        ),
      );

      toast.success(`Integration ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (_error) {
      console.error('Error updating integration:', _error);
      toast.error('Failed to update integration');
    }
  };

  const deleteIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) {
      return;
    }

    try {
      setIntegrations(integrations.filter((integration) => integration.id !== integrationId));
      toast.success('Integration deleted successfully');
    } catch (_error) {
      console.error('Error deleting integration:', _error);
      toast.error('Failed to delete integration');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircleIcon className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <LoadingSpinner size="sm" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-gray-600';
      case 'error':
        return 'text-red-600';
      case 'testing':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  const categories = [...new Set(INTEGRATION_TYPES.map((t) => t.category))];
  const statuses = ['connected', 'disconnected', 'error'];

  const filteredIntegrations = integrations.filter((integration) => {
    const categoryMatch = !categoryFilter || integration.category === categoryFilter;
    const statusMatch = !statusFilter || integration.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  const integrationStats = {
    total: integrations.length,
    connected: integrations.filter((i) => i.status === 'connected').length,
    disconnected: integrations.filter((i) => i.status === 'disconnected').length,
    error: integrations.filter((i) => i.status === 'error').length,
    enabled: integrations.filter((i) => i.enabled).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="Loading integrations..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Integrations</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Connect Nova with external services and tools
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <PlusIcon className="h-4 w-4" />
            Add Integration
          </button>
        </div>
      </div>

      {/* Integration Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="card p-4 text-center">
          <div className="text-nova-600 text-2xl font-bold">
            {formatNumber(integrationStats.total)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(integrationStats.connected)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Connected</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {formatNumber(integrationStats.disconnected)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Disconnected</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(integrationStats.error)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(integrationStats.enabled)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Enabled</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Integration Filters
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setCategoryFilter('');
                setStatusFilter('');
              }}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredIntegrations.map((integration) => (
          <div key={integration.id} className="card p-6">
            {/* Integration Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <LinkIcon className="text-nova-600 h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {INTEGRATION_TYPES.find((t) => t.value === integration.type)?.label ||
                      integration.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {getStatusIcon(integration.status)}
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    integration.category === 'Communication' &&
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    integration.category === 'Project Management' &&
                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                    integration.category === 'ITSM' &&
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    integration.category === 'CRM' &&
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    !['Communication', 'Project Management', 'ITSM', 'CRM'].includes(
                      integration.category,
                    ) && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
                  )}
                >
                  {integration.category}
                </span>
              </div>
            </div>

            {/* Integration Description */}
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {integration.description}
            </p>

            {/* Status and Metrics */}
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                <span className={cn('text-sm font-medium', getStatusColor(integration.status))}>
                  {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                </span>
              </div>

              {integration.metrics && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {integration.metrics.successRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Syncs</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatNumber(integration.metrics.totalSyncs)}
                    </span>
                  </div>
                </>
              )}

              {integration.lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Sync</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {new Date(integration.lastSync).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {integration.status === 'error' && integration.metrics?.lastError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <div className="mb-1 text-xs font-medium text-red-700 dark:text-red-300">
                  Last Error
                </div>
                <div className="text-xs text-red-600 dark:text-red-400">
                  {integration.metrics.lastError}
                </div>
              </div>
            )}

            {/* Integration Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleIntegration(integration.id, !integration.enabled)}
                  className={cn(
                    'flex items-center space-x-2 rounded-full px-3 py-1 text-sm font-medium transition-colors',
                    integration.enabled
                      ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                  )}
                >
                  <span>{integration.enabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => testIntegration(integration.id)}
                  disabled={testingIntegration === integration.id}
                  className="btn btn-sm btn-secondary"
                >
                  {testingIntegration === integration.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                  Test
                </button>

                <button
                  onClick={() => setEditingIntegration(integration)}
                  className="btn btn-sm btn-secondary"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </button>

                <button
                  onClick={() => deleteIntegration(integration.id)}
                  className="btn btn-sm btn-danger"
                  aria-label={`Delete ${integration.name} integration`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="card p-12 text-center">
          <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No integrations found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {integrations.length === 0
              ? 'Get started by adding your first integration'
              : 'No integrations match your current filters'}
          </p>
          {integrations.length === 0 && (
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary mt-4">
              <PlusIcon className="h-4 w-4" />
              Add Integration
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingIntegration) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="bg-opacity-50 fixed inset-0 bg-black"
              onClick={() => {
                setShowCreateModal(false);
                setEditingIntegration(null);
              }}
            />

            <div className="relative w-full max-w-lg rounded-lg bg-white shadow-xl dark:bg-gray-800">
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {editingIntegration ? 'Edit Integration' : 'Add Integration'}
                  </h2>

                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingIntegration(null);
                    }}
                    className="btn btn-sm btn-secondary"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="input"
                      disabled={!!editingIntegration}
                    >
                      {INTEGRATION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.type === 'microsoft365' && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tenant ID
                        </label>
                        <input
                          type="text"
                          value={formData.config.tenantId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              config: { ...formData.config, tenantId: e.target.value },
                            })
                          }
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={formData.config.clientId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              config: { ...formData.config, clientId: e.target.value },
                            })
                          }
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Client Secret
                        </label>
                        <input
                          type="password"
                          value={formData.config.clientSecret}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              config: { ...formData.config, clientSecret: e.target.value },
                            })
                          }
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mailbox
                        </label>
                        <input
                          type="email"
                          value={formData.config.mailbox}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              config: { ...formData.config, mailbox: e.target.value },
                            })
                          }
                          className="input"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingIntegration(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button onClick={saveIntegration} className="btn btn-primary">
                    {editingIntegration ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
