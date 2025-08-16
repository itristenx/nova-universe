import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Webhook, Slack, Plus, Trash2, Edit, TestTube } from 'lucide-react';

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
    settings: {}
  });

  useEffect(() => {
    fetchChannels();
    fetchTemplates();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/monitoring/notifications/channels'); // TODO-LINT: move to async function
      const data = await response.json(); // TODO-LINT: move to async function
      setChannels(data);
    } catch (error) {
      console.error('Failed to fetch notification channels:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/monitoring/notifications/templates'); // TODO-LINT: move to async function
      const data = await response.json(); // TODO-LINT: move to async function
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-5 h-5" />;
      case 'sms': return <MessageSquare className="w-5 h-5" />;
      case 'webhook': return <Webhook className="w-5 h-5" />;
      case 'slack': return <Slack className="w-5 h-5" />;
      case 'discord': return <MessageSquare className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
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
        body: JSON.stringify(channelData)
      }); // TODO-LINT: move to async function

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
        method: 'DELETE'
      }); // TODO-LINT: move to async function

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
        method: 'POST'
      }); // TODO-LINT: move to async function

      const result = await response.json(); // TODO-LINT: move to async function
      alert(result.success ? 'Test notification sent successfully!' : `Test failed: ${result.error}`);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newChannel.endpoint || ''}
              onChange={(e) => setNewChannel(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder="notifications@example.com"
            />
          </div>
        );
      
      case 'sms':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newChannel.endpoint || ''}
              onChange={(e) => setNewChannel(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder="+1234567890"
            />
          </div>
        );
      
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newChannel.endpoint || ''}
                onChange={(e) => setNewChannel(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://api.example.com/webhook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secret (Optional)
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newChannel.settings?.secret || ''}
                onChange={(e) => setNewChannel(prev => ({ 
                  ...prev, 
                  settings: { ...prev.settings, secret: e.target.value }
                }))}
                placeholder="Webhook signing secret"
              />
            </div>
          </div>
        );
      
      case 'slack':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slack Webhook URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newChannel.endpoint || ''}
              onChange={(e) => setNewChannel(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
        );
      
      case 'discord':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discord Webhook URL
            </label>
            <input
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newChannel.endpoint || ''}
              onChange={(e) => setNewChannel(prev => ({ ...prev, endpoint: e.target.value }))}
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notification Settings</h1>
        <p className="text-gray-600">Configure how you receive monitoring alerts and updates</p>
      </div>

      {/* Notification Channels */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Notification Channels</h2>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Channel
          </button>
        </div>
        
        <div className="divide-y divide-gray-200">
          {channels.map((channel) => (
            <div key={channel.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  {getChannelIcon(channel.type)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {channel.name || `${channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Channel`}
                    </div>
                    <div className="text-sm text-gray-500">{channel.endpoint}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  channel.enabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {channel.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTestChannel(channel)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  <TestTube className="w-4 h-4 mr-1" />
                  Test
                </button>
                <button
                  onClick={() => openEditModal(channel)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteChannel(channel.id)}
                  className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))}
          
          {channels.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notification channels</h3>
              <p className="text-gray-500 mb-4">Add your first notification channel to start receiving alerts</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Channel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Channel Modal */}
      {showChannelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingChannel ? 'Edit Channel' : 'Add Notification Channel'}
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newChannel.name || ''}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My notification channel"
                />
              </div>
              
              <div>
                <label htmlFor="channel-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Type
                </label>
                <select
                  id="channel-type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newChannel.type}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, type: e.target.value as any, endpoint: '', settings: {} }))}
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={newChannel.enabled}
                  onChange={(e) => setNewChannel(prev => ({ ...prev, enabled: e.target.checked }))}
                />
                <label htmlFor="channel-enabled" className="ml-2 block text-sm text-gray-900">
                  Enable this channel
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowChannelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChannel}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
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
