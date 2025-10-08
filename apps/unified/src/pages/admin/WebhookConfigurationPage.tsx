import { useState, useEffect } from 'react';
import { webhooksAPI, type WebhookEndpoint, type WebhookEvent, type WebhookDelivery } from '@services/backend-api-client';
import { cn } from '@utils/index';
import toast from 'react-hot-toast';

// Icon Components
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
);

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

export default function WebhookConfigurationPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [availableEvents, setAvailableEvents] = useState<WebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    active: true,
    secret: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editingWebhook) {
      setFormData({
        name: editingWebhook.name,
        url: editingWebhook.url,
        events: editingWebhook.events,
        active: editingWebhook.active,
        secret: editingWebhook.secret || '',
      });
    } else if (showCreateModal) {
      setFormData({
        name: '',
        url: '',
        events: [],
        active: true,
        secret: '',
      });
    }
  }, [editingWebhook, showCreateModal]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [webhooksList, eventsList] = await Promise.all([
        webhooksAPI.list(),
        webhooksAPI.getEvents(),
      ]);

      setWebhooks(webhooksList);
      setAvailableEvents(eventsList);
    } catch (err: any) {
      console.error('Error loading webhooks:', err);
      setError(err.message || 'Failed to load webhooks');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeliveries = async (webhookId: string) => {
    try {
      setLoadingDeliveries(true);
      const deliveriesList = await webhooksAPI.getDeliveries(webhookId);
      setDeliveries(deliveriesList);
    } catch (err: any) {
      console.error('Error loading deliveries:', err);
      toast.error('Failed to load delivery history');
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const handleSaveWebhook = async () => {
    try {
      if (!formData.name || !formData.url || formData.events.length === 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editingWebhook) {
        await webhooksAPI.update(editingWebhook.id, formData);
        toast.success('Webhook updated successfully');
      } else {
        await webhooksAPI.create(formData);
        toast.success('Webhook created successfully');
      }

      setShowCreateModal(false);
      setEditingWebhook(null);
      await loadData();
    } catch (err: any) {
      console.error('Error saving webhook:', err);
      toast.error(err.message || 'Failed to save webhook');
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }

    try {
      await webhooksAPI.delete(id);
      toast.success('Webhook deleted successfully');
      await loadData();
    } catch (err: any) {
      console.error('Error deleting webhook:', err);
      toast.error('Failed to delete webhook');
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      const result = await webhooksAPI.test(id);
      if (result.success) {
        toast.success(result.message || 'Webhook test successful');
      } else {
        toast.error(result.message || 'Webhook test failed');
      }
    } catch (err: any) {
      console.error('Error testing webhook:', err);
      toast.error('Failed to test webhook');
    }
  };

  const handleRetryDelivery = async (webhookId: string, deliveryId: string) => {
    try {
      await webhooksAPI.retry(webhookId, deliveryId);
      toast.success('Delivery retry initiated');
      await loadDeliveries(webhookId);
    } catch (err: any) {
      console.error('Error retrying delivery:', err);
      toast.error('Failed to retry delivery');
    }
  };

  const toggleEvent = (eventName: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(eventName)
        ? prev.events.filter((e) => e !== eventName)
        : [...prev.events, eventName],
    }));
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
  if (error && webhooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-lg">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Error Loading Webhooks</h3>
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

  // Event categories
  const eventsByCategory = availableEvents.reduce((acc, event) => {
    if (!acc[event.category]) {
      acc[event.category] = [];
    }
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, WebhookEvent[]>);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Webhook Configuration</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage webhooks to receive real-time event notifications
          </p>
        </div>
        <button
          onClick={() => {
            setEditingWebhook(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add Webhook
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Webhooks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{webhooks.length}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {webhooks.filter(w => w.active).length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">
                {webhooks.filter(w => !w.active).length}
              </p>
            </div>
            <XCircleIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {availableEvents.length}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Webhooks List */}
      {webhooks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No webhooks configured yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            Create Your First Webhook
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {webhook.name}
                      </h3>
                      {webhook.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                          <CheckCircleIcon className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 text-xs font-medium rounded-full">
                          <XCircleIcon className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-mono">
                      {webhook.url}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded"
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Created {new Date(webhook.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestWebhook(webhook.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      title="Test webhook"
                    >
                      <PlayIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedWebhook(webhook);
                        loadDeliveries(webhook.id);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                      title="View deliveries"
                    >
                      <ChartBarIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingWebhook(webhook);
                        setShowCreateModal(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      title="Edit webhook"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      title="Delete webhook"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Webhook Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="My Webhook"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Endpoint URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                    placeholder="https://example.com/webhook"
                  />
                </div>

                {/* Secret */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secret Key (optional)
                  </label>
                  <input
                    type="password"
                    value={formData.secret}
                    onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                    placeholder="Your secret key"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Used to sign webhook payloads for verification
                  </p>
                </div>

                {/* Events */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Events * ({formData.events.length} selected)
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {Object.entries(eventsByCategory).map(([category, events]) => (
                      <div key={category} className="mb-4 last:mb-0">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {events.map((event) => (
                            <label
                              key={event.name}
                              className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={formData.events.includes(event.name)}
                                onChange={() => toggleEvent(event.name)}
                                className="mt-1"
                              />
                              <div>
                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                  {event.name}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {event.description}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Activate webhook immediately
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingWebhook(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWebhook}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingWebhook ? 'Update Webhook' : 'Create Webhook'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deliveries Modal */}
      {selectedWebhook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Delivery History: {selectedWebhook.name}
                </h2>
                <button
                  onClick={() => {
                    setSelectedWebhook(null);
                    setDeliveries([]);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ×
                </button>
              </div>

              {loadingDeliveries ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Loading deliveries...</p>
                </div>
              ) : deliveries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">No deliveries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                              {delivery.event}
                            </span>
                            <span
                              className={cn(
                                'px-2 py-1 text-xs font-medium rounded-full',
                                delivery.status === 'SUCCESS' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                                delivery.status === 'FAILED' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
                                delivery.status === 'PENDING' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                                delivery.status === 'RETRYING' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              )}
                            >
                              {delivery.status}
                            </span>
                            {delivery.statusCode && (
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                HTTP {delivery.statusCode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(delivery.createdAt).toLocaleString()} • Attempt {delivery.attemptCount}
                          </p>
                        </div>
                        {delivery.status === 'FAILED' && (
                          <button
                            onClick={() => handleRetryDelivery(selectedWebhook.id, delivery.id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                            Retry
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
