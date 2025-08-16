import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Webhook,
  Slack,
  Plus,
  Trash2,
  Edit,
  TestTube,
} from 'lucide-react';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'webhook' | 'slack' | 'discord';
  endpoint: string;
  enabled: boolean;
  settings: Record<string, any>;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'incident_created' | 'incident_resolved' | 'monitor_down' | 'monitor_up';
  channels: string[];
  enabled: boolean;
}

const NotificationSettings: React.FC = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<NotificationChannel | null>(null);
  const [newChannel, setNewChannel] = useState<Partial<NotificationChannel>>({
    type: 'email',
    enabled: true,
    settings: {},
  });

  useEffect(() => {
    fetchChannels();
    fetchTemplates();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/monitoring/notifications/channels');
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Failed to fetch notification channels:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/monitoring/notifications/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'sms':
        return <MessageSquare className="h-5 w-5" />;
      case 'webhook':
        return <Webhook className="h-5 w-5" />;
      case 'slack':
        return <Slack className="h-5 w-5" />;
      case 'discord':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleSaveChannel = async () => {
    try {
      const channelData = editingChannel ? { ...editingChannel, ...newChannel } : newChannel;
      const url = editingChannel
        ? `/api/monitoring/notifications/channels/${editingChannel.id}`
        : '/api/monitoring/notifications/channels';

      const response = await fetch(url, {
        method: editingChannel ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelData),
      });

      if (response.ok) {
        fetchChannels();
        setShowChannelModal(false);
        setEditingChannel(null);
        setNewChannel({ type: 'email', enabled: true, settings: {} });
      }
    } catch (error) {
      console.error('Failed to save channel:', error);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('Are you sure you want to delete this notification channel?')) return;

    try {
      const response = await fetch(`/api/monitoring/notifications/channels/${channelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchChannels();
      }
    } catch (error) {
      console.error('Failed to delete channel:', error);
    }
  };

  const handleTestChannel = async (channel: NotificationChannel) => {
    try {
      const response = await fetch(`/api/monitoring/notifications/channels/${channel.id}/test`, {
        method: 'POST',
      });

      const result = await response.json();
      alert(
        result.success ? 'Test notification sent successfully!' : `Test failed: ${result.error}`,
      );
    } catch (error) {
      console.error('Failed to test channel:', error);
      alert('Test failed');
    }
  };

  const openEditModal = (channel: NotificationChannel) => {
    setEditingChannel(channel);
    setNewChannel(channel);
    setShowChannelModal(true);
  };

  const openCreateModal = () => {
    setEditingChannel(null);
    setNewChannel({ type: 'email', enabled: true, settings: {} });
    setShowChannelModal(true);
  };

  const renderChannelFields = () => {
    switch (newChannel.type) {
      case 'email':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newChannel.endpoint || ''}
              onChange={(e) => setNewChannel((prev) => ({ ...prev, endpoint: e.target.value }))}
              placeholder="notifications@example.com"
            />
          </div>
        );

      case 'sms':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newChannel.endpoint || ''}
              onChange={(e) => setNewChannel((prev) => ({ ...prev, endpoint: e.target.value }))}
              placeholder="+1234567890"
            />
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Webhook URL</label>
              <input
                type="url"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={newChannel.endpoint || ''}
                onChange={(e) => setNewChannel((prev) => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Secret (Optional)
              </label>
              <input
                type="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={newChannel.settings?.secret || ''}
                onChange={(e) =>
                  setNewChannel((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, secret: e.target.value },
                  }))
                }
                placeholder="Webhook signing secret"
              />
            </div>
          </div>
        );

      case 'slack':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Slack Webhook URL
            </label>
            <input
              type="url"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newChannel.endpoint || ''}
              onChange={(e) => setNewChannel((prev) => ({ ...prev, endpoint: e.target.value }))}
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
        );

      case 'discord':
        return (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Discord Webhook URL
            </label>
            <input
              type="url"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={newChannel.endpoint || ''}
              onChange={(e) => setNewChannel((prev) => ({ ...prev, endpoint: e.target.value }))}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-gray-600">Configure how you receive monitoring alerts and updates</p>
      </div>

      {/* Notification Channels */}
      <div className="mb-8 rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Notification Channels</h2>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Channel
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {channels.map((channel) => (
            <div key={channel.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {getChannelIcon(channel.type)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {channel.name ||
                        `${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Channel`}
                    </div>
                    <div className="text-sm text-gray-500">{channel.endpoint}</div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    channel.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {channel.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTestChannel(channel)}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <TestTube className="mr-1 h-4 w-4" />
                  Test
                </button>
                <button
                  onClick={() => openEditModal(channel)}
                  className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteChannel(channel.id)}
                  className="inline-flex items-center rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}

          {channels.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No notification channels</h3>
              <p className="mb-4 text-gray-500">
                Add your first notification channel to start receiving alerts
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Channel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Channel Modal */}
      {showChannelModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingChannel ? 'Edit Channel' : 'Add Notification Channel'}
              </h3>
            </div>

            <div className="space-y-4 px-6 py-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Channel Name</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newChannel.name || ''}
                  onChange={(e) => setNewChannel((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="My notification channel"
                />
              </div>

              <div>
                <label
                  htmlFor="channel-type"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Channel Type
                </label>
                <select
                  id="channel-type"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={newChannel.type}
                  onChange={(e) =>
                    setNewChannel((prev) => ({
                      ...prev,
                      type: e.target.value as any,
                      endpoint: '',
                      settings: {},
                    }))
                  }
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="webhook">Webhook</option>
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                </select>
              </div>

              {renderChannelFields()}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="channel-enabled"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={newChannel.enabled}
                  onChange={(e) =>
                    setNewChannel((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                />
                <label htmlFor="channel-enabled" className="ml-2 block text-sm text-gray-900">
                  Enable this channel
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowChannelModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChannel}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                {editingChannel ? 'Update' : 'Create'} Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
