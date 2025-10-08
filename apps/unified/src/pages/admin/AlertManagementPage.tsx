import { useState, useEffect } from 'react';
import { alertsAPI, type Alert, type AlertRule, type AlertStats } from '@services/backend-api-client';
import { cn } from '@utils/index';
import toast from 'react-hot-toast';

// Icon Components
const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
  </svg>
);

const ShieldExclamationIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);

const InformationCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

export default function AlertManagementPage() {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'all' | 'rules'>('active');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condition: {},
    actions: [],
    enabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh active alerts every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadActiveAlerts();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (editingRule) {
      setFormData({
        name: editingRule.name,
        description: editingRule.description || '',
        condition: editingRule.condition,
        actions: editingRule.actions,
        enabled: editingRule.enabled,
      });
    } else if (showRuleModal) {
      setFormData({
        name: '',
        description: '',
        condition: {},
        actions: [],
        enabled: true,
      });
    }
  }, [editingRule, showRuleModal]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [activeList, statsList] = await Promise.all([
        alertsAPI.getActive(),
        alertsAPI.getStats(),
      ]);

      setActiveAlerts(activeList);
      setStats(statsList);
    } catch (err: any) {
      console.error('Error loading alerts:', err);
      setError(err.message || 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActiveAlerts = async () => {
    try {
      const activeList = await alertsAPI.getActive();
      setActiveAlerts(activeList);
    } catch (err: any) {
      console.error('Error refreshing active alerts:', err);
    }
  };

  const loadAllAlerts = async () => {
    try {
      const list = await alertsAPI.list();
      setAllAlerts(list);
    } catch (err: any) {
      console.error('Error loading all alerts:', err);
      toast.error('Failed to load alert history');
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await alertsAPI.acknowledge(id);
      toast.success('Alert acknowledged');
      await loadData();
    } catch (err: any) {
      console.error('Error acknowledging alert:', err);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await alertsAPI.resolve(id);
      toast.success('Alert resolved');
      await loadData();
    } catch (err: any) {
      console.error('Error resolving alert:', err);
      toast.error('Failed to resolve alert');
    }
  };

  const handleSaveRule = async () => {
    try {
      if (!formData.name) {
        toast.error('Please enter a rule name');
        return;
      }

      if (editingRule) {
        await alertsAPI.updateRule(editingRule.id, formData);
        toast.success('Alert rule updated successfully');
      } else {
        await alertsAPI.createRule(formData);
        toast.success('Alert rule created successfully');
      }

      setShowRuleModal(false);
      setEditingRule(null);
      // Reload rules if needed
    } catch (err: any) {
      console.error('Error saving alert rule:', err);
      toast.error(err.message || 'Failed to save alert rule');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert rule?')) {
      return;
    }

    try {
      await alertsAPI.deleteRule(id);
      toast.success('Alert rule deleted successfully');
      // Reload rules if needed
    } catch (err: any) {
      console.error('Error deleting alert rule:', err);
      toast.error('Failed to delete alert rule');
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <ShieldExclamationIcon className="h-5 w-5 text-red-500" />;
      case 'ERROR':
        return <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />;
      case 'WARNING':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
      case 'INFO':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'ERROR':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'WARNING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'INFO':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-600';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-lg">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Error Loading Alerts</h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Alert Management</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Monitor and manage system alerts in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={() => {
              setEditingRule(null);
              setShowRuleModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            New Rule
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-gray-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <BellIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <ShieldExclamationIcon className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Warning</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <ExclamationCircleIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Info</p>
                <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
              </div>
              <InformationCircleIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          <button
            onClick={() => {
              setSelectedTab('active');
              loadActiveAlerts();
            }}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              selectedTab === 'active'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            Active Alerts ({activeAlerts.length})
          </button>
          <button
            onClick={() => {
              setSelectedTab('all');
              loadAllAlerts();
            }}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              selectedTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            All Alerts
          </button>
          <button
            onClick={() => setSelectedTab('rules')}
            className={cn(
              'px-4 py-2 font-medium border-b-2 transition-colors',
              selectedTab === 'rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            )}
          >
            Alert Rules
          </button>
        </nav>
      </div>

      {/* Active Alerts Tab */}
      {selectedTab === 'active' && (
        <div className="space-y-4">
          {activeAlerts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All Clear!</p>
              <p className="text-gray-600 dark:text-gray-400">No active alerts at this time</p>
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'rounded-lg shadow p-6 border-l-4',
                  getSeverityColor(alert.severity)
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{alert.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-white/50 dark:bg-black/30">
                          {alert.severity}
                        </span>
                        {alert.source && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            from {alert.source}
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <p className="text-xs opacity-75">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* All Alerts Tab */}
      {selectedTab === 'all' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            {allAlerts.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">No alerts found</p>
            ) : (
              <div className="space-y-3">
                {allAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{alert.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full',
                        alert.status === 'RESOLVED' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                        alert.status === 'ACKNOWLEDGED' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                        alert.status === 'ACTIVE' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      )}
                    >
                      {alert.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Rules Tab */}
      {selectedTab === 'rules' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-center text-gray-600 dark:text-gray-400 py-8">
            Alert rules configuration coming soon
          </p>
        </div>
      )}

      {/* Create/Edit Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="High CPU Usage Alert"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Alert when CPU usage exceeds 80% for 5 minutes"
                  />
                </div>

                {/* Enabled toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable this rule
                  </label>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Advanced condition and action configuration will be available in the full implementation.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRuleModal(false);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
