import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, HelpCircle } from 'lucide-react';

interface NotificationProviderFormProps {
  onClose: () => void;
  onSubmit: (provider: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void;
  editingProvider?: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
}

export default function _NotificationProviderForm({ onClose, onSubmit, editingProvider }: NotificationProviderFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'telegram',
    config: {} as Record<string, any>,
    is_active: true,
    is_default: false
  });

  const providerTypes = [
    // Popular providers
    { value: 'telegram', label: 'Telegram Bot', category: 'Popular' },
    { value: 'slack', label: 'Slack', category: 'Popular' },
    { value: 'discord', label: 'Discord', category: 'Popular' },
    { value: 'teams', label: 'Microsoft Teams', category: 'Popular' },
    { value: 'email', label: 'Email (SMTP)', category: 'Popular' },
    { value: 'webhook', label: 'Generic Webhook', category: 'Popular' },
    
    // Mobile push
    { value: 'pushover', label: 'Pushover', category: 'Mobile Push' },
    { value: 'pushbullet', label: 'Pushbullet', category: 'Mobile Push' },
    { value: 'gotify', label: 'Gotify', category: 'Mobile Push' },
    { value: 'bark', label: 'Bark (iOS)', category: 'Mobile Push' },
    { value: 'ntfy', label: 'ntfy', category: 'Mobile Push' },
    
    // Enterprise
    { value: 'pagerduty', label: 'PagerDuty', category: 'Enterprise' },
    { value: 'opsgenie', label: 'Opsgenie', category: 'Enterprise' },
    { value: 'pagertree', label: 'PagerTree', category: 'Enterprise' },
    { value: 'splunk', label: 'Splunk', category: 'Enterprise' },
    
    // Chat platforms
    { value: 'matrix', label: 'Matrix', category: 'Chat' },
    { value: 'mattermost', label: 'Mattermost', category: 'Chat' },
    { value: 'rocket_chat', label: 'Rocket.Chat', category: 'Chat' },
    { value: 'signal', label: 'Signal', category: 'Chat' },
    
    // Regional
    { value: 'feishu', label: 'Feishu/Lark', category: 'Regional' },
    { value: 'dingtalk', label: 'DingTalk', category: 'Regional' },
    { value: 'line', label: 'LINE', category: 'Regional' },
    { value: 'wecom', label: 'WeCom', category: 'Regional' },
    
    // SMS
    { value: 'twilio', label: 'Twilio SMS', category: 'SMS' },
    { value: 'clicksendsms', label: 'ClickSend SMS', category: 'SMS' },
    { value: 'smseagle', label: 'SMSEagle', category: 'SMS' },
    
    // Home automation
    { value: 'homeassistant', label: 'Home Assistant', category: 'Home Automation' },
    
    // Development
    { value: 'apprise', label: 'Apprise', category: 'Development' }
  ];

  useEffect(() => {
    if (editingProvider) {
      setFormData({ ...editingProvider });
    }
  }, [editingProvider]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Provider name is required');
      return;
    }

    if (!validateProviderConfig()) {
      return;
    }

    onSubmit(formData);
  };

  const validateProviderConfig = (): boolean => {
    const config = formData.config;
    
    switch (formData.type) {
      case 'telegram':
        if (!config.bot_token || !config.chat_id) {
          alert('Bot token and chat ID are required for Telegram');
          return false;
        }
        break;
      case 'slack':
        if (!config.webhook_url) {
          alert('Webhook URL is required for Slack');
          return false;
        }
        break;
      case 'discord':
        if (!config.webhook_url) {
          alert('Webhook URL is required for Discord');
          return false;
        }
        break;
      case 'email':
        if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
          alert('SMTP configuration is required for email');
          return false;
        }
        break;
      case 'pushover':
        if (!config.user_key || !config.api_token) {
          alert('User key and API token are required for Pushover');
          return false;
        }
        break;
      case 'pagerduty':
        if (!config.integration_key) {
          alert('Integration key is required for PagerDuty');
          return false;
        }
        break;
      // Add more validation as needed
    }
    
    return true;
  };

  const updateConfig = (key: string, value: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
  };

  const renderProviderConfig = () => {
    switch (formData.type) {
      case 'telegram':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot Token *
              </label>
              <input
                type="password"
                value={formData.config.bot_token || ''}
                onChange={(e) => updateConfig('bot_token', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              />
              <p className="text-sm text-gray-600 mt-1">
                Get your bot token from @BotFather on Telegram
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chat ID *
              </label>
              <input
                type="text"
                value={formData.config.chat_id || ''}
                onChange={(e) => updateConfig('chat_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="-1001234567890"
              />
              <p className="text-sm text-gray-600 mt-1">
                Use @userinfobot to get your chat ID
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thread ID (Optional)
              </label>
              <input
                type="text"
                value={formData.config.thread_id || ''}
                onChange={(e) => updateConfig('thread_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="silent_notification"
                checked={formData.config.silent_notification || false}
                onChange={(e) => updateConfig('silent_notification', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="silent_notification" className="ml-2 block text-sm text-gray-700">
                Silent notifications
              </label>
            </div>
          </div>
        );

      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL *
              </label>
              <input
                type="url"
                value={formData.config.webhook_url || ''}
                onChange={(e) => updateConfig('webhook_url', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel (Optional)
              </label>
              <input
                type="text"
                value={formData.config.channel || ''}
                onChange={(e) => updateConfig('channel', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#alerts"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username (Optional)
              </label>
              <input
                type="text"
                value={formData.config.username || ''}
                onChange={(e) => updateConfig('username', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nova Sentinel"
              />
            </div>
          </div>
        );

      case 'discord':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL *
              </label>
              <input
                type="url"
                value={formData.config.webhook_url || ''}
                onChange={(e) => updateConfig('webhook_url', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  value={formData.config.smtp_host || ''}
                  onChange={(e) => updateConfig('smtp_host', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={formData.config.smtp_port || 587}
                  onChange={(e) => updateConfig('smtp_port', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="email"
                value={formData.config.smtp_user || ''}
                onChange={(e) => updateConfig('smtp_user', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={formData.config.smtp_password || ''}
                onChange={(e) => updateConfig('smtp_password', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={formData.config.from_email || ''}
                onChange={(e) => updateConfig('from_email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="alerts@yourdomain.com"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smtp_tls"
                checked={formData.config.smtp_tls !== false}
                onChange={(e) => updateConfig('smtp_tls', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smtp_tls" className="ml-2 block text-sm text-gray-700">
                Use TLS/STARTTLS
              </label>
            </div>
          </div>
        );

      case 'pushover':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Key *
              </label>
              <input
                type="password"
                value={formData.config.user_key || ''}
                onChange={(e) => updateConfig('user_key', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Token *
              </label>
              <input
                type="password"
                value={formData.config.api_token || ''}
                onChange={(e) => updateConfig('api_token', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device (Optional)
              </label>
              <input
                type="text"
                value={formData.config.device || ''}
                onChange={(e) => updateConfig('device', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="phone1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sound
              </label>
              <select
                value={formData.config.sound || 'pushover'}
                onChange={(e) => updateConfig('sound', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pushover">Pushover (default)</option>
                <option value="bike">Bike</option>
                <option value="bugle">Bugle</option>
                <option value="cashregister">Cash Register</option>
                <option value="classical">Classical</option>
                <option value="cosmic">Cosmic</option>
                <option value="falling">Falling</option>
                <option value="gamelan">Gamelan</option>
                <option value="incoming">Incoming</option>
                <option value="intermission">Intermission</option>
                <option value="magic">Magic</option>
                <option value="mechanical">Mechanical</option>
                <option value="pianobar">Piano Bar</option>
                <option value="siren">Siren</option>
                <option value="spacealarm">Space Alarm</option>
                <option value="tugboat">Tug Boat</option>
                <option value="alien">Alien Alarm (long)</option>
                <option value="climb">Climb (long)</option>
                <option value="persistent">Persistent (long)</option>
                <option value="echo">Pushover Echo (long)</option>
                <option value="updown">Up Down (long)</option>
                <option value="none">None (silent)</option>
              </select>
            </div>
          </div>
        );

      case 'pagerduty':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Integration Key *
              </label>
              <input
                type="password"
                value={formData.config.integration_key || ''}
                onChange={(e) => updateConfig('integration_key', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="32 character key"
              />
              <p className="text-sm text-gray-600 mt-1">
                From your PagerDuty service integration
              </p>
            </div>
          </div>
        );

      case 'opsgenie':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <input
                type="password"
                value={formData.config.api_key || ''}
                onChange={(e) => updateConfig('api_key', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={formData.config.region || 'us'}
                onChange={(e) => updateConfig('region', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="us">US</option>
                <option value="eu">EU</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teams (Optional)
              </label>
              <input
                type="text"
                value={formData.config.teams || ''}
                onChange={(e) => updateConfig('teams', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                value={formData.config.tags || ''}
                onChange={(e) => updateConfig('tags', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tag1,tag2,tag3"
              />
            </div>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL *
              </label>
              <input
                type="url"
                value={formData.config.webhook_url || ''}
                onChange={(e) => updateConfig('webhook_url', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-webhook-endpoint.com/hook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTTP Method
              </label>
              <select
                value={formData.config.method || 'POST'}
                onChange={(e) => updateConfig('method', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret (Optional)
              </label>
              <input
                type="password"
                value={formData.config.secret || ''}
                onChange={(e) => updateConfig('secret', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="For HMAC signature verification"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Headers (JSON)
              </label>
              <textarea
                value={formData.config.headers || ''}
                onChange={(e) => updateConfig('headers', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Provider Configuration</h4>
            </div>
            <p className="text-blue-700 text-sm">
              Configuration options for {formData.type} will be available soon.
              Please check the Nova Sentinel documentation for setup instructions.
            </p>
          </div>
        );
    }
  };

  const groupedProviders = providerTypes.reduce((acc, provider) => {
    if (!acc[provider.category]) {
      acc[provider.category] = [];
    }
    acc[provider.category].push(provider);
    return acc;
  }, {} as Record<string, typeof providerTypes>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            {editingProvider ? 'Edit Notification Provider' : 'Add Notification Provider'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Name *
                </label>
                <input
                  id="provider_name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Telegram Bot"
                  required
                />
              </div>

              <div>
                <label htmlFor="provider_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Type *
                </label>
                <select
                  id="provider_type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, config: {} }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(groupedProviders).map(([category, providers]) => (
                    <optgroup key={category} label={category}>
                      {providers.map(provider => (
                        <option key={provider.value} value={provider.value}>
                          {provider.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Provider-specific configuration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
              {renderProviderConfig()}
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
                    Default provider
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {editingProvider ? 'Update Provider' : 'Add Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
