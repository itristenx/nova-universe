import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  BellAlertIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Switch } from '../ui/Switch';
import { Card } from '../ui/Card';
import { api } from '../../lib/api';

interface MonitoringConfig {
  // Nova Sentinel
  sentinelEnabled: boolean;
  sentinelUrl: string;
  sentinelApiKey: string;
  sentinelWebhookSecret: string;
  
  // GoAlert
  goAlertEnabled: boolean;
  goAlertUrl: string;
  goAlertApiKey: string;
  goAlertSmtpHost: string;
  goAlertSmtpPort: string;
  goAlertSmtpUser: string;
  goAlertSmtpPass: string;
}

interface TestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
}

const MonitoringSetup: React.FC = () => {
  const [config, setConfig] = useState<MonitoringConfig>({
    sentinelEnabled: false,
    sentinelUrl: 'http://localhost:3001',
    sentinelApiKey: '',
    sentinelWebhookSecret: '',
    goAlertEnabled: false,
    goAlertUrl: 'http://localhost:8081',
    goAlertApiKey: '',
    goAlertSmtpHost: '',
    goAlertSmtpPort: '587',
    goAlertSmtpUser: '',
    goAlertSmtpPass: ''
  });

  const [testResults, setTestResults] = useState<{
    sentinel: TestResult;
    goalert: TestResult;
  }>({
    sentinel: { status: 'idle' },
    goalert: { status: 'idle' }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load current configuration
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/v1/configuration/monitoring', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setConfig(prev => ({ ...prev, ...data.data }));
        }
      } else {
        // Use defaults if endpoint doesn't exist or fails
        const defaultConfig = {
          sentinelEnabled: false,
          sentinelUrl: 'http://localhost:3001',
          sentinelApiKey: '',
          sentinelWebhookSecret: '',
          goAlertEnabled: false,
          goAlertUrl: 'http://localhost:8081',
          goAlertApiKey: '',
          goAlertSmtpHost: '',
          goAlertSmtpPort: '587',
          goAlertSmtpUser: '',
          goAlertSmtpPass: ''
        };
        setConfig(prev => ({ ...prev, ...defaultConfig }));
      }
    } catch (error) {
      console.error('Failed to load monitoring configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = (field: keyof MonitoringConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    
    // Reset test status when config changes
    if (field.startsWith('sentinel')) {
      setTestResults(prev => ({ ...prev, sentinel: { status: 'idle' } }));
    } else if (field.startsWith('goAlert')) {
      setTestResults(prev => ({ ...prev, goalert: { status: 'idle' } }));
    }
  };

  const testConnection = async (service: 'sentinel' | 'goalert') => {
    setTestResults(prev => ({
      ...prev,
      [service]: { status: 'testing', message: undefined }
    }));

    try {
      const endpoint = service === 'sentinel' ? '/api/setup/test-sentinel' : '/api/setup/test-goalert';
      const payload = service === 'sentinel' 
        ? {
            sentinelUrl: config.sentinelUrl,
            sentinelApiKey: config.sentinelApiKey
          }
        : {
            goAlertUrl: config.goAlertUrl,
            goAlertApiKey: config.goAlertApiKey
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      setTestResults(prev => ({
        ...prev,
        [service]: {
          status: data.success ? 'success' : 'error',
          message: data.message || data.error
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [service]: {
          status: 'error',
          message: 'Connection test failed'
        }
      }));
    }
  };

    const saveConfiguration = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/v1/configuration/monitoring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Configuration saved successfully
        alert('Monitoring configuration saved successfully!');
      } else {
        console.error('Failed to save configuration:', data.message || 'Unknown error');
        alert(`Failed to save configuration: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const TestStatus: React.FC<{ result: TestResult }> = ({ result }) => {
    if (result.status === 'idle') return null;

    const statusConfig = {
      testing: {
        icon: CogIcon,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20'
      },
      success: {
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-900/20'
      },
      error: {
        icon: ExclamationTriangleIcon,
        color: 'text-red-600',
        bg: 'bg-red-50 dark:bg-red-900/20'
      }
    };

    const { icon: Icon, color, bg } = statusConfig[result.status];

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={`mt-3 rounded-lg p-3 ${bg}`}
      >
        <div className="flex items-center space-x-2">
          <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
          <p className={`text-sm ${color.replace('600', '700')} dark:${color.replace('600', '300')}`}>
            {result.message || `Connection ${result.status}`}
          </p>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Monitoring & Alerting Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Configure Nova Sentinel monitoring and GoAlert incident management
        </p>
      </div>

      {/* Nova Sentinel Configuration */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Nova Sentinel
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Uptime monitoring and service health tracking
                </p>
              </div>
            </div>
            <Switch
              checked={config.sentinelEnabled}
              onChange={(checked) => handleConfigChange('sentinelEnabled', checked)}
            />
          </div>

          {config.sentinelEnabled && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sentinel URL *
                  </label>
                  <Input
                    type="url"
                    value={config.sentinelUrl}
                    onChange={(e) => handleConfigChange('sentinelUrl', e.target.value)}
                    placeholder="http://localhost:3001"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    API Key
                  </label>
                  <Input
                    type="password"
                    value={config.sentinelApiKey}
                    onChange={(e) => handleConfigChange('sentinelApiKey', e.target.value)}
                    placeholder="Optional API key for authentication"
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
                  value={config.sentinelWebhookSecret}
                  onChange={(e) => handleConfigChange('sentinelWebhookSecret', e.target.value)}
                  placeholder="Secret for webhook validation"
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
                  disabled={testResults.sentinel.status === 'testing' || !config.sentinelUrl}
                  isLoading={testResults.sentinel.status === 'testing'}
                >
                  Test Connection
                </Button>
              </div>

              <TestStatus result={testResults.sentinel} />
            </div>
          )}
        </div>
      </Card>

      {/* GoAlert Configuration */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <BellAlertIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  GoAlert
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Incident response and escalation management
                </p>
              </div>
            </div>
            <Switch
              checked={config.goAlertEnabled}
              onChange={(checked) => handleConfigChange('goAlertEnabled', checked)}
            />
          </div>

          {config.goAlertEnabled && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    GoAlert URL *
                  </label>
                  <Input
                    type="url"
                    value={config.goAlertUrl}
                    onChange={(e) => handleConfigChange('goAlertUrl', e.target.value)}
                    placeholder="http://localhost:8081"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    API Key *
                  </label>
                  <Input
                    type="password"
                    value={config.goAlertApiKey}
                    onChange={(e) => handleConfigChange('goAlertApiKey', e.target.value)}
                    placeholder="GoAlert API token"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                  SMTP Configuration
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Configure email settings for GoAlert notifications
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      SMTP Host
                    </label>
                    <Input
                      value={config.goAlertSmtpHost}
                      onChange={(e) => handleConfigChange('goAlertSmtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      SMTP Port
                    </label>
                    <Input
                      value={config.goAlertSmtpPort}
                      onChange={(e) => handleConfigChange('goAlertSmtpPort', e.target.value)}
                      placeholder="587"
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
                      value={config.goAlertSmtpUser}
                      onChange={(e) => handleConfigChange('goAlertSmtpUser', e.target.value)}
                      placeholder="your-email@gmail.com"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      SMTP Password
                    </label>
                    <Input
                      type="password"
                      value={config.goAlertSmtpPass}
                      onChange={(e) => handleConfigChange('goAlertSmtpPass', e.target.value)}
                      placeholder="App password or SMTP password"
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
                  disabled={testResults.goalert.status === 'testing' || !config.goAlertUrl || !config.goAlertApiKey}
                  isLoading={testResults.goalert.status === 'testing'}
                >
                  Test Connection
                </Button>
              </div>

              <TestStatus result={testResults.goalert} />
            </div>
          )}
        </div>
      </Card>

      {/* Information Card */}
      <Card>
        <div className="p-6">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                Monitoring Integration
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Nova Sentinel provides uptime monitoring and status pages, while GoAlert handles 
                incident escalation and on-call management. Both services integrate seamlessly 
                with Nova Universe to provide comprehensive monitoring and alerting capabilities.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={saveConfiguration}
          disabled={isSaving}
          isLoading={isSaving}
          className="px-8"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default MonitoringSetup;
