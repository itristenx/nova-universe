import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Select, Checkbox } from '@heroui/react';
import { 
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { Integration } from '@/types';

const integrationTypes = [
  { value: 'smtp', label: 'SMTP Email' },
  { value: 'helpscout', label: 'Help Scout' },
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'webhook', label: 'Generic Webhook' },
];

export const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [testingIntegration, setTestingIntegration] = useState<number | null>(null);
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    config: {} as Record<string, any>,
    enabled: true,
  });

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await api.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load integrations',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = async () => {
    try {
      const integrationData = {
        ...formData,
        type: formData.type as Integration['type'],
      };
      const newIntegration = await api.updateIntegration(0, integrationData);
      setIntegrations([...integrations, newIntegration as Integration]);
      setShowCreateModal(false);
      resetForm();
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Integration created successfully',
      });
    } catch (error) {
      console.error('Failed to create integration:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create integration',
      });
    }
  };

  const handleUpdateIntegration = async () => {
    if (!editingIntegration) return;

    try {
      const integrationData = {
        ...formData,
        type: formData.type as Integration['type'],
      };
      await api.updateIntegration(editingIntegration.id, integrationData);
      setIntegrations(integrations.map(i => 
        i.id === editingIntegration.id 
          ? { ...i, ...integrationData } 
          : i
      ));
      setEditingIntegration(null);
      resetForm();
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Integration updated successfully',
      });
    } catch (error) {
      console.error('Failed to update integration:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update integration',
      });
    }
  };

  const deleteIntegration = async (id: number) => {
    if (confirm('Are you sure you want to delete this integration?')) {
      try {
        await api.deleteIntegration(id);
        setIntegrations(integrations.filter(i => i.id !== id));
        addToast({
          type: 'success',
          title: 'Success',
          description: 'Integration deleted successfully',
        });
      } catch (error: any) {
        console.error('Failed to delete integration:', error);
        addToast({
          type: 'error',
          title: 'Error',
          description: error.response?.data?.error || 'Failed to delete integration. Please try again.',
        });
      }
    }
  };

  const testIntegration = async (id: number) => {
    try {
      setTestingIntegration(id);
      await api.testIntegration(id);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Integration test successful',
      });
    } catch (error) {
      console.error('Failed to test integration:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Integration test failed',
      });
    } finally {
      setTestingIntegration(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      config: {},
      enabled: true,
    });
  };

  const openEditModal = (integration: Integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      type: integration.type,
      config: integration.config || {},
      enabled: integration.enabled,
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingIntegration(null);
    resetForm();
  };

  const renderConfigFields = (type: string) => {
    switch (type) {
      case 'smtp':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-sm text-green-700">
                <h4 className="font-medium mb-2">SMTP Setup Instructions:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Gmail:</strong> Use smtp.gmail.com, port 587, enable 2FA and use App Password</li>
                  <li><strong>Outlook:</strong> Use smtp.live.com, port 587 with TLS</li>
                  <li><strong>Office 365:</strong> Use smtp.office365.com, port 587 with TLS</li>
                  <li><strong>Custom:</strong> Contact your email provider for SMTP settings</li>
                </ul>
              </div>
            </div>
            <Input
              label="SMTP Host"
              value={formData.config.host || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, host: e.target.value }
              })}
              placeholder="smtp.gmail.com"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Port"
                type="number"
                value={formData.config.port || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  config: { ...formData.config, port: parseInt(e.target.value) }
                })}
                placeholder="587"
                required
              />
              <div className="flex items-center pt-6">
                <Checkbox
                  label="Use TLS"
                  checked={formData.config.secure || false}
                  onChange={(checked) => setFormData({
                    ...formData,
                    config: { ...formData.config, secure: checked }
                  })}
                />
              </div>
            </div>
            <Input
              label="Username"
              value={formData.config.username || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, username: e.target.value }
              })}
              placeholder="your-email@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={formData.config.password || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, password: e.target.value }
              })}
              placeholder="App password or SMTP password"
              required
            />
          </div>
        );
      case 'helpscout':
        return (
          <div className="space-y-4">
            <Input
              label="API Key"
              value={formData.config.apiKey || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, apiKey: e.target.value }
              })}
              placeholder="Help Scout API key"
              required
            />
            <Input
              label="Mailbox ID"
              value={formData.config.mailboxId || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, mailboxId: e.target.value }
              })}
              placeholder="123456"
              required
            />
          </div>
        );
      case 'slack':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-sm text-blue-700">
                <h4 className="font-medium mb-2">Slack Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to your Slack workspace settings</li>
                  <li>Navigate to "Apps" → "App Directory" → "Manage"</li>
                  <li>Create a new app or select "Incoming Webhooks"</li>
                  <li>Enable incoming webhooks and add to workspace</li>
                  <li>Copy the webhook URL and paste it below</li>
                </ol>
              </div>
            </div>
            <Input
              label="Webhook URL"
              value={formData.config.webhookUrl || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, webhookUrl: e.target.value }
              })}
              placeholder="https://hooks.slack.com/services/..."
              required
            />
            <Input
              label="Channel"
              value={formData.config.channel || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, channel: e.target.value }
              })}
              placeholder="#general or #support"
              required
            />
            <Input
              label="Username (optional)"
              value={formData.config.username || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, username: e.target.value }
              })}
              placeholder="Nova Universe Bot"
            />
          </div>
        );
      case 'teams':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-sm text-blue-700">
                <h4 className="font-medium mb-2">Microsoft Teams Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Open Microsoft Teams and go to your channel</li>
                  <li>Click "..." → "Connectors" → "Configure"</li>
                  <li>Find "Incoming Webhook" and click "Add"</li>
                  <li>Provide a name and upload an image (optional)</li>
                  <li>Copy the webhook URL and paste it below</li>
                </ol>
              </div>
            </div>
            <Input
              label="Webhook URL"
              value={formData.config.webhookUrl || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, webhookUrl: e.target.value }
              })}
              placeholder="https://your-tenant.webhook.office.com/..."
              required
            />
          </div>
        );
      case 'webhook':
        return (
          <div className="space-y-4">
            <Input
              label="Webhook URL"
              value={formData.config.url || ''}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, url: e.target.value }
              })}
              placeholder="https://your-webhook-endpoint.com/hook"
              required
            />
            <Select
              label="HTTP Method"
              value={formData.config.method || 'POST'}
              onChange={(value) => setFormData({
                ...formData,
                config: { ...formData.config, method: value }
              })}
              options={[
                { value: 'POST', label: 'POST' },
                { value: 'PUT', label: 'PUT' },
                { value: 'PATCH', label: 'PATCH' },
              ]}
            />
            <Input
              label="Content Type"
              value={formData.config.contentType || 'application/json'}
              onChange={(e) => setFormData({
                ...formData,
                config: { ...formData.config, contentType: e.target.value }
              })}
              placeholder="application/json"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (enabled: boolean, working?: boolean) => {
    if (working === false) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
    if (enabled) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <XCircleIcon className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage external service integrations and API connections
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <Cog6ToothIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Integrations</p>
              <p className="text-2xl font-semibold text-gray-900">{integrations.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-semibold text-gray-900">
                {integrations.filter(i => i.enabled).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-500">
              <XCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-semibold text-gray-900">
                {integrations.filter(i => !i.enabled).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Integrations List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : integrations.length === 0 ? (
          <div className="text-center py-12">
            <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No integrations configured</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first integration.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(integration.enabled, integration.working)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {integrationTypes.find(t => t.value === integration.type)?.label || integration.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => testIntegration(integration.id)}
                      isLoading={testingIntegration === integration.id}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Test
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openEditModal(integration)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => deleteIntegration(integration.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {integration.lastError && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{integration.lastError}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Integration Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModals}
        title="Add Integration"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Integration Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Integration"
            required
          />
          
          <Select
            label="Integration Type"
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value, config: {} })}
            options={integrationTypes}
            required
          />

          {formData.type && renderConfigFields(formData.type)}

          <Checkbox
            label="Enable this integration"
            checked={formData.enabled}
            onChange={(checked) => setFormData({ ...formData, enabled: checked })}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={closeModals}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateIntegration}
            disabled={!formData.name || !formData.type}
          >
            Create Integration
          </Button>
        </div>
      </Modal>

      {/* Edit Integration Modal */}
      <Modal
        isOpen={!!editingIntegration}
        onClose={closeModals}
        title={`Edit Integration: ${editingIntegration?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Integration Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Select
            label="Integration Type"
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value, config: {} })}
            options={integrationTypes}
            required
          />

          {formData.type && renderConfigFields(formData.type)}

          <Checkbox
            label="Enable this integration"
            checked={formData.enabled}
            onChange={(checked) => setFormData({ ...formData, enabled: checked })}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={closeModals}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateIntegration}
            disabled={!formData.name || !formData.type}
          >
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
};
