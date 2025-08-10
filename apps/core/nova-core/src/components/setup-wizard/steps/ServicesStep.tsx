import React, { useState, useEffect } from 'react';
import { CogIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Switch } from '../../ui/Switch';

interface ServiceData {
  slackEnabled?: boolean;
  slackToken?: string;
  slackChannel?: string;
  teamsEnabled?: boolean;
  teamsWebhook?: string;
  webhooksEnabled?: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  elasticsearchEnabled?: boolean;
  elasticsearchUrl?: string;
  elasticsearchIndex?: string;
  analyticsEnabled?: boolean;
  analyticsProvider?: string;
  googleAnalyticsId?: string;
  sentryEnabled?: boolean;
  sentryDsn?: string;
  storageProvider?: string;
  s3Bucket?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Region?: string;
  knowledgeBaseEnabled?: boolean;
  aiAssistEnabled?: boolean;
  openaiApiKey?: string;
  
  // Monitoring & Alerting
  sentinelEnabled?: boolean;
  sentinelUrl?: string;
  sentinelApiKey?: string;
  sentinelWebhookSecret?: string;
  goAlertEnabled?: boolean;
  goAlertUrl?: string;
  goAlertApiKey?: string;
  goAlertSmtpHost?: string;
  goAlertSmtpPort?: string;
  goAlertSmtpUser?: string;
  goAlertSmtpPass?: string;
}

interface SetupData {
  services?: ServiceData;
}

interface ServicesStepProps {
  data: SetupData;
  onUpdate: (data: SetupData) => void;
  onComplete: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export const ServicesStep: React.FC<ServicesStepProps> = ({
  data,
  onUpdate,
  onComplete,
  errors,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    // Integrations
    slackEnabled: data?.services?.slackEnabled || false,
    slackToken: data?.services?.slackToken || '',
    slackChannel: data?.services?.slackChannel || '#support',
    
    teamsEnabled: data?.services?.teamsEnabled || false,
    teamsWebhook: data?.services?.teamsWebhook || '',
    
    webhooksEnabled: data?.services?.webhooksEnabled || false,
    webhookUrl: data?.services?.webhookUrl || '',
    webhookSecret: data?.services?.webhookSecret || '',
    
    // Search and Analytics
    elasticsearchEnabled: data?.services?.elasticsearchEnabled || false,
    elasticsearchUrl: data?.services?.elasticsearchUrl || 'http://localhost:9200',
    elasticsearchIndex: data?.services?.elasticsearchIndex || 'nova-tickets',
    
    analyticsEnabled: data?.services?.analyticsEnabled || false,
    analyticsProvider: data?.services?.analyticsProvider || 'internal',
    googleAnalyticsId: data?.services?.googleAnalyticsId || '',
    
    // Monitoring
    sentryEnabled: data?.services?.sentryEnabled || false,
    sentryDsn: data?.services?.sentryDsn || '',
    
    // File Storage
    storageProvider: data?.services?.storageProvider || 'local',
    s3Bucket: data?.services?.s3Bucket || '',
    s3Region: data?.services?.s3Region || 'us-east-1',
    s3AccessKey: data?.services?.s3AccessKey || '',
    s3SecretKey: data?.services?.s3SecretKey || '',
    
    // Knowledge Base
    knowledgeBaseEnabled: data?.services?.knowledgeBaseEnabled || false,
    aiAssistEnabled: data?.services?.aiAssistEnabled || false,
    openaiApiKey: data?.services?.openaiApiKey || '',
    
    // Monitoring & Alerting
    sentinelEnabled: data?.services?.sentinelEnabled || false,
    sentinelUrl: data?.services?.sentinelUrl || 'http://localhost:3001',
    sentinelApiKey: data?.services?.sentinelApiKey || '',
    sentinelWebhookSecret: data?.services?.sentinelWebhookSecret || '',
    
    goAlertEnabled: data?.services?.goAlertEnabled || false,
    goAlertUrl: data?.services?.goAlertUrl || 'http://localhost:8081',
    goAlertApiKey: data?.services?.goAlertApiKey || '',
    goAlertSmtpHost: data?.services?.goAlertSmtpHost || '',
    goAlertSmtpPort: data?.services?.goAlertSmtpPort || '587',
    goAlertSmtpUser: data?.services?.goAlertSmtpUser || '',
    goAlertSmtpPass: data?.services?.goAlertSmtpPass || ''
  });

  const [connectionTests, setConnectionTests] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});
  const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    onUpdate({
      services: formData
    });
  }, [formData, onUpdate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear connection status when field changes
    if (connectionTests[field]) {
      setConnectionTests(prev => ({ ...prev, [field]: 'idle' }));
      setConnectionErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const testConnection = async (service: string) => {
    setConnectionTests(prev => ({ ...prev, [service]: 'testing' }));
    setConnectionErrors(prev => ({ ...prev, [service]: '' }));
    
    try {
      const response = await fetch(`/api/setup/test-${service}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setConnectionTests(prev => ({ ...prev, [service]: 'success' }));
      } else {
        setConnectionTests(prev => ({ ...prev, [service]: 'error' }));
        setConnectionErrors(prev => ({ ...prev, [service]: result.error || `Failed to test ${service} connection` }));
      }
    } catch (error) {
      setConnectionTests(prev => ({ ...prev, [service]: 'error' }));
      setConnectionErrors(prev => ({ ...prev, [service]: `Unable to test ${service} connection` }));
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  const ConnectionStatus: React.FC<{ service: string }> = ({ service }) => {
    const status = connectionTests[service];
    const error = connectionErrors[service];

    if (status === 'idle') return null;

    return (
      <div className={`mt-2 rounded-lg p-3 ${
        status === 'success' 
          ? 'bg-green-50 dark:bg-green-900/20' 
          : status === 'error'
          ? 'bg-red-50 dark:bg-red-900/20'
          : 'bg-blue-50 dark:bg-blue-900/20'
      }`}>
        <div className="flex items-center space-x-2">
          {status === 'success' && (
            <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
          )}
          {status === 'error' && (
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <p className={`text-sm ${
            status === 'success' 
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}>
            {status === 'success' 
              ? `${service} connection successful!` 
              : error
            }
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center">
          <CogIcon className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Services & Integrations</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Connect external services to enhance your platform capabilities
          </p>
        </div>
      </div>

      {/* Services Configuration */}
      <div className="space-y-8">
        {/* Team Communication */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Team Communication</h3>
          
          {/* Slack Integration */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💬</div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Slack</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Send notifications to Slack channels
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.slackEnabled}
                onChange={(checked) => handleInputChange('slackEnabled', checked)}
              />
            </div>

            {formData.slackEnabled && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Bot Token *
                    </label>
                    <Input
                      type="password"
                      value={formData.slackToken}
                      onChange={(e) => handleInputChange('slackToken', e.target.value)}
                      placeholder="xoxb-your-token-here"
                      error={errors.slackToken}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Default Channel
                    </label>
                    <Input
                      value={formData.slackChannel}
                      onChange={(e) => handleInputChange('slackChannel', e.target.value)}
                      placeholder="#support"
                      error={errors.slackChannel}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => testConnection('slack')}
                    disabled={connectionTests.slack === 'testing' || !formData.slackToken}
                    isLoading={connectionTests.slack === 'testing'}
                  >
                    Test Connection
                  </Button>
                </div>
                <ConnectionStatus service="slack" />
              </div>
            )}
          </div>

          {/* Microsoft Teams Integration */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📢</div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Microsoft Teams</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Send notifications via Teams webhooks
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.teamsEnabled}
                onChange={(checked) => handleInputChange('teamsEnabled', checked)}
              />
            </div>

            {formData.teamsEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Teams Webhook URL *
                  </label>
                  <Input
                    type="url"
                    value={formData.teamsWebhook}
                    onChange={(e) => handleInputChange('teamsWebhook', e.target.value)}
                    placeholder="https://outlook.office.com/webhook/..."
                    error={errors.teamsWebhook}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => testConnection('teams')}
                    disabled={connectionTests.teams === 'testing' || !formData.teamsWebhook}
                    isLoading={connectionTests.teams === 'testing'}
                  >
                    Test Connection
                  </Button>
                </div>
                <ConnectionStatus service="teams" />
              </div>
            )}
          </div>
        </div>

        {/* Storage & Search */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Storage & Search</h3>
          
          {/* File Storage */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">File Storage</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose where to store uploaded files and attachments
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleInputChange('storageProvider', 'local')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.storageProvider === 'local'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-2">💾</div>
                  <h5 className="font-medium text-slate-900 dark:text-white">Local Storage</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Store files on the server</p>
                </button>

                <button
                  onClick={() => handleInputChange('storageProvider', 's3')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.storageProvider === 's3'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-2">☁️</div>
                  <h5 className="font-medium text-slate-900 dark:text-white">Amazon S3</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Cloud storage with S3</p>
                </button>
              </div>

              {formData.storageProvider === 's3' && (
                <div className="space-y-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        S3 Bucket *
                      </label>
                      <Input
                        value={formData.s3Bucket}
                        onChange={(e) => handleInputChange('s3Bucket', e.target.value)}
                        placeholder="my-nova-bucket"
                        error={errors.s3Bucket}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Region
                      </label>
                      <Input
                        value={formData.s3Region}
                        onChange={(e) => handleInputChange('s3Region', e.target.value)}
                        placeholder="us-east-1"
                        error={errors.s3Region}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Access Key *
                      </label>
                      <Input
                        value={formData.s3AccessKey}
                        onChange={(e) => handleInputChange('s3AccessKey', e.target.value)}
                        placeholder="AKIAIOSFODNN7EXAMPLE"
                        error={errors.s3AccessKey}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Secret Key *
                      </label>
                      <Input
                        type="password"
                        value={formData.s3SecretKey}
                        onChange={(e) => handleInputChange('s3SecretKey', e.target.value)}
                        placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                        error={errors.s3SecretKey}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => testConnection('s3')}
                      disabled={connectionTests.s3 === 'testing' || !formData.s3Bucket}
                      isLoading={connectionTests.s3 === 'testing'}
                    >
                      Test S3 Connection
                    </Button>
                  </div>
                  <ConnectionStatus service="s3" />
                </div>
              )}
            </div>
          </div>

          {/* Elasticsearch */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🔍</div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Elasticsearch</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Advanced search and analytics for tickets
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.elasticsearchEnabled}
                onChange={(checked) => handleInputChange('elasticsearchEnabled', checked)}
              />
            </div>

            {formData.elasticsearchEnabled && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Elasticsearch URL *
                    </label>
                    <Input
                      type="url"
                      value={formData.elasticsearchUrl}
                      onChange={(e) => handleInputChange('elasticsearchUrl', e.target.value)}
                      placeholder="http://localhost:9200"
                      error={errors.elasticsearchUrl}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Index Name
                    </label>
                    <Input
                      value={formData.elasticsearchIndex}
                      onChange={(e) => handleInputChange('elasticsearchIndex', e.target.value)}
                      placeholder="nova-tickets"
                      error={errors.elasticsearchIndex}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => testConnection('elasticsearch')}
                    disabled={connectionTests.elasticsearch === 'testing' || !formData.elasticsearchUrl}
                    isLoading={connectionTests.elasticsearch === 'testing'}
                  >
                    Test Connection
                  </Button>
                </div>
                <ConnectionStatus service="elasticsearch" />
              </div>
            )}
          </div>
        </div>

        {/* AI & Knowledge Base */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">AI & Knowledge Base</h3>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📚</div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Knowledge Base</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Enable self-service knowledge articles
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.knowledgeBaseEnabled}
                  onChange={(checked) => handleInputChange('knowledgeBaseEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">AI Assistant</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      AI-powered ticket suggestions and responses
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.aiAssistEnabled}
                  onChange={(checked) => handleInputChange('aiAssistEnabled', checked)}
                />
              </div>

              {formData.aiAssistEnabled && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    OpenAI API Key *
                  </label>
                  <Input
                    type="password"
                    value={formData.openaiApiKey}
                    onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                    error={errors.openaiApiKey}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Get your API key from the OpenAI dashboard
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monitoring & Alerting */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Monitoring & Alerting</h3>
          
          {/* Nova Sentinel */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🛡️</div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Nova Sentinel</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Uptime monitoring and service health tracking
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.sentinelEnabled}
                onChange={(checked) => handleInputChange('sentinelEnabled', checked)}
              />
            </div>

            {formData.sentinelEnabled && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Sentinel URL *
                    </label>
                    <Input
                      type="url"
                      value={formData.sentinelUrl}
                      onChange={(e) => handleInputChange('sentinelUrl', e.target.value)}
                      placeholder="http://localhost:3001"
                      error={errors.sentinelUrl}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      API Key
                    </label>
                    <Input
                      type="password"
                      value={formData.sentinelApiKey}
                      onChange={(e) => handleInputChange('sentinelApiKey', e.target.value)}
                      placeholder="Optional API key for authentication"
                      error={errors.sentinelApiKey}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Webhook Secret
                  </label>
                  <Input
                    type="password"
                    value={formData.sentinelWebhookSecret}
                    onChange={(e) => handleInputChange('sentinelWebhookSecret', e.target.value)}
                    placeholder="Secret for webhook validation"
                    error={errors.sentinelWebhookSecret}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Used to validate incoming webhook notifications from Sentinel
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => testConnection('sentinel')}
                    disabled={connectionTests.sentinel === 'testing' || !formData.sentinelUrl}
                    isLoading={connectionTests.sentinel === 'testing'}
                  >
                    Test Connection
                  </Button>
                </div>
                <ConnectionStatus service="sentinel" />
              </div>
            )}
          </div>

          {/* GoAlert */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🚨</div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">GoAlert</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Incident response and escalation management
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.goAlertEnabled}
                onChange={(checked) => handleInputChange('goAlertEnabled', checked)}
              />
            </div>

            {formData.goAlertEnabled && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      GoAlert URL *
                    </label>
                    <Input
                      type="url"
                      value={formData.goAlertUrl}
                      onChange={(e) => handleInputChange('goAlertUrl', e.target.value)}
                      placeholder="http://localhost:8081"
                      error={errors.goAlertUrl}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      API Key *
                    </label>
                    <Input
                      type="password"
                      value={formData.goAlertApiKey}
                      onChange={(e) => handleInputChange('goAlertApiKey', e.target.value)}
                      placeholder="GoAlert API token"
                      error={errors.goAlertApiKey}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <h5 className="font-medium text-slate-900 dark:text-white mb-3">SMTP Configuration</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Configure email settings for GoAlert notifications
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        SMTP Host
                      </label>
                      <Input
                        value={formData.goAlertSmtpHost}
                        onChange={(e) => handleInputChange('goAlertSmtpHost', e.target.value)}
                        placeholder="smtp.gmail.com"
                        error={errors.goAlertSmtpHost}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        SMTP Port
                      </label>
                      <Input
                        value={formData.goAlertSmtpPort}
                        onChange={(e) => handleInputChange('goAlertSmtpPort', e.target.value)}
                        placeholder="587"
                        error={errors.goAlertSmtpPort}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        SMTP Username
                      </label>
                      <Input
                        value={formData.goAlertSmtpUser}
                        onChange={(e) => handleInputChange('goAlertSmtpUser', e.target.value)}
                        placeholder="your-email@gmail.com"
                        error={errors.goAlertSmtpUser}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        SMTP Password
                      </label>
                      <Input
                        type="password"
                        value={formData.goAlertSmtpPass}
                        onChange={(e) => handleInputChange('goAlertSmtpPass', e.target.value)}
                        placeholder="App password or SMTP password"
                        error={errors.goAlertSmtpPass}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => testConnection('goalert')}
                    disabled={connectionTests.goalert === 'testing' || !formData.goAlertUrl || !formData.goAlertApiKey}
                    isLoading={connectionTests.goalert === 'testing'}
                  >
                    Test Connection
                  </Button>
                </div>
                <ConnectionStatus service="goalert" />
              </div>
            )}
          </div>
        </div>

        {/* Continue/Skip */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CogIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Optional Configuration
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                All integrations are optional and can be configured later. You can enable 
                basic functionality now and add integrations as your team grows.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={isLoading}
          isLoading={isLoading}
          className="px-8"
        >
          Continue Setup
        </Button>
      </div>
    </div>
  );
};
