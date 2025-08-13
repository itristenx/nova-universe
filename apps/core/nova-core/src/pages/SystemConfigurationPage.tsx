import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Switch, Select, Tabs, Chip, Textarea } from '@/components/ui';
import {
  CogIcon,
  ServerIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  EnvelopeIcon,
  DocumentIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';

interface SystemConfig {
  general: {
    systemName: string;
    systemDescription: string;
    timezone: string;
    defaultLanguage: string;
    maintenanceMode: boolean;
    debugMode: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorEnabled: boolean;
    ipWhitelist: string[];
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    smtpSecure: boolean;
    fromEmail: string;
    fromName: string;
  };
  notifications: {
    emailNotifications: boolean;
    slackWebhook: string;
    discordWebhook: string;
    teamsWebhook: string;
    criticalAlerts: boolean;
    systemUpdates: boolean;
  };
  storage: {
    maxFileSize: number;
    allowedFileTypes: string[];
    storageQuota: number;
    backupRetention: number;
  };
  integrations: {
    elasticsearchEnabled: boolean;
    elasticsearchUrl: string;
    redisEnabled: boolean;
    redisUrl: string;
    webhooksEnabled: boolean;
    apiRateLimit: number;
  };
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'ui' | 'api' | 'integration' | 'experimental';
  rolloutPercentage: number;
}

interface EnvironmentVariable {
  key: string;
  value: string;
  description: string;
  sensitive: boolean;
}

const SystemConfigurationPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  // const { isOpen, onOpen, onClose } = useDisclosure(); // Removed useDisclosure
  const [selectedEnvVar, setSelectedEnvVar] = useState<EnvironmentVariable | null>(null);
  const addToast = useToastStore((state: any) => state.addToast);

  useEffect(() => {
    loadSystemConfig();
    loadFeatureFlags();
    loadEnvironmentVariables();
  }, []);

  const loadSystemConfig = async () => {
    try {
      // For now, use mock data since the API endpoint doesn't exist yet
      // const response = await api.getConfig();
      
      // Set default config 
      setConfig({
        general: {
          systemName: 'Nova Universe',
          systemDescription: 'Enterprise ITSM Platform',
          timezone: 'UTC',
          defaultLanguage: 'en',
          maintenanceMode: false,
          debugMode: false,
          logLevel: 'info'
        },
        security: {
          sessionTimeout: 3600,
          maxLoginAttempts: 3,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
          },
          twoFactorEnabled: false,
          ipWhitelist: []
        },
        email: {
          smtpHost: '',
          smtpPort: 587,
          smtpUsername: '',
          smtpPassword: '',
          smtpSecure: true,
          fromEmail: '',
          fromName: 'Nova Universe'
        },
        notifications: {
          emailNotifications: true,
          slackWebhook: '',
          discordWebhook: '',
          teamsWebhook: '',
          criticalAlerts: true,
          systemUpdates: true
        },
        storage: {
          maxFileSize: 10485760, // 10MB
          allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
          storageQuota: 1073741824, // 1GB
          backupRetention: 30
        },
        integrations: {
          elasticsearchEnabled: false,
          elasticsearchUrl: '',
          redisEnabled: false,
          redisUrl: '',
          webhooksEnabled: true,
          apiRateLimit: 100
        }
      });
    } catch (error) {
      console.error('Failed to load system config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeatureFlags = async () => {
    try {
      // For now, use mock data since the API endpoint doesn't exist yet
      // const response = await api.getFeatureFlags();
      
      // Set some default feature flags
      setFeatureFlags([
        {
          id: 'new-ui',
          name: 'New UI Design',
          description: 'Enable the new modern UI design',
          enabled: true,
          category: 'ui',
          rolloutPercentage: 100
        },
        {
          id: 'ai-suggestions',
          name: 'AI Suggestions',
          description: 'Enable AI-powered ticket suggestions',
          enabled: false,
          category: 'experimental',
          rolloutPercentage: 10
        },
        {
          id: 'advanced-analytics',
          name: 'Advanced Analytics',
          description: 'Enable advanced analytics dashboard',
          enabled: true,
          category: 'ui',
          rolloutPercentage: 80
        }
      ]);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    }
  };

  const loadEnvironmentVariables = async () => {
    try {
      // For now, use mock data since the API endpoint doesn't exist yet
      // const response = await api.getEnvironmentVariables();
      
      // Set some default env vars (non-sensitive)
      setEnvVars([
        {
          key: 'NODE_ENV',
          value: 'production',
          description: 'Node.js environment',
          sensitive: false
        },
        {
          key: 'DATABASE_URL',
          value: '***REDACTED***',
          description: 'Database connection string',
          sensitive: true
        },
        {
          key: 'API_RATE_LIMIT',
          value: '100',
          description: 'API rate limit per minute',
          sensitive: false
        }
      ]);
    } catch (error) {
      console.error('Failed to load environment variables:', error);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      // For now, just simulate save since the API endpoint doesn't exist yet
      // await api.updateConfig(config);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      addToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Configuration Saved',
        message: 'System configuration has been updated successfully'
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save system configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatureFlag = async (flagId: string) => {
    try {
      // For now, just simulate toggle since the API endpoint doesn't exist yet
      // await api.toggleFeatureFlag(flagId);
      
      setFeatureFlags(prev => prev.map(flag => 
        flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag
      ));
      
      addToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Feature Flag Updated',
        message: 'Feature flag has been toggled successfully'
      });
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Toggle Failed',
        message: 'Failed to toggle feature flag'
      });
    }
  };

  const updateConfig = (section: keyof SystemConfig, field: string, value: any) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value
      }
    }));
  };

  const updateNestedConfig = (section: keyof SystemConfig, parentField: string, field: string, value: any) => {
    if (!config) return;
    
    setConfig(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [parentField]: {
          ...(prev![section] as any)[parentField],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <CogIcon className="w-12 h-12 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading system configuration...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load system configuration</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage system settings, environment variables, and feature flags
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            color="success"
            startContent={<WrenchScrewdriverIcon className="w-4 h-4" />}
            onPress={saveConfig}
            isLoading={saving}
          >
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Card>
        <div className="p-4">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key: string) => setActiveTab(key)}
            tabs={[
              {
                key: 'general',
                label: 'General',
                content: (
                  <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="System Name"
                        value={config.general.systemName}
                        onChange={(e) => updateConfig('general', 'systemName', e.target.value)}
                      />
                      <Input
                        label="Timezone"
                        value={config.general.timezone}
                        onChange={(e) => updateConfig('general', 'timezone', e.target.value)}
                      />
                      <Select
                        label="Default Language"
                        value={config.general.defaultLanguage}
                        onChange={(value) => updateConfig('general', 'defaultLanguage', value)}
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'es', label: 'Spanish' },
                          { value: 'fr', label: 'French' },
                          { value: 'de', label: 'German' },
                        ]}
                      />
                      <Select
                        label="Log Level"
                        value={config.general.logLevel}
                        onChange={(value) => updateConfig('general', 'logLevel', value as any)}
                        options={[
                          { value: 'error', label: 'Error' },
                          { value: 'warn', label: 'Warning' },
                          { value: 'info', label: 'Info' },
                          { value: 'debug', label: 'Debug' },
                        ]}
                      />
                    </div>
                    
                    <Textarea
                      label="System Description"
                      value={config.general.systemDescription}
                      onChange={(e) => updateConfig('general', 'systemDescription', e.target.value)}
                    />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Maintenance Mode</h4>
                          <p className="text-sm text-gray-600">Put the system into maintenance mode</p>
                        </div>
                        <Switch
                          checked={config.general.maintenanceMode}
                          onChange={(checked) => updateConfig('general', 'maintenanceMode', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Debug Mode</h4>
                          <p className="text-sm text-gray-600">Enable debug logging and error details</p>
                        </div>
                        <Switch
                          checked={config.general.debugMode}
                          onChange={(checked) => updateConfig('general', 'debugMode', checked)}
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'security',
                label: 'Security',
                content: (
                  <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Session Timeout (seconds)"
                        value={config.security.sessionTimeout.toString()}
                        onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
                      />
                      <Input
                        type="number"
                        label="Max Login Attempts"
                        value={config.security.maxLoginAttempts.toString()}
                        onChange={(e) => updateConfig('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Password Policy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="number"
                          label="Minimum Length"
                          value={config.security.passwordPolicy.minLength.toString()}
                          onChange={(e) => updateNestedConfig('security', 'passwordPolicy', 'minLength', parseInt(e.target.value))}
                        />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>Require Uppercase</span>
                            <Switch
                              checked={config.security.passwordPolicy.requireUppercase}
                              onChange={(checked) => updateNestedConfig('security', 'passwordPolicy', 'requireUppercase', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Require Lowercase</span>
                            <Switch
                              checked={config.security.passwordPolicy.requireLowercase}
                              onChange={(checked) => updateNestedConfig('security', 'passwordPolicy', 'requireLowercase', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Require Numbers</span>
                            <Switch
                              checked={config.security.passwordPolicy.requireNumbers}
                              onChange={(checked) => updateNestedConfig('security', 'passwordPolicy', 'requireNumbers', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Require Special Characters</span>
                            <Switch
                              checked={config.security.passwordPolicy.requireSpecialChars}
                              onChange={(checked) => updateNestedConfig('security', 'passwordPolicy', 'requireSpecialChars', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Require 2FA for all users</p>
                      </div>
                      <Switch
                        checked={config.security.twoFactorEnabled}
                        onChange={(checked) => updateConfig('security', 'twoFactorEnabled', checked)}
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: 'email',
                label: 'Email',
                content: (
                  <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="SMTP Host"
                        value={config.email.smtpHost}
                        onChange={(e) => updateConfig('email', 'smtpHost', e.target.value)}
                      />
                      <Input
                        type="number"
                        label="SMTP Port"
                        value={config.email.smtpPort.toString()}
                        onChange={(e) => updateConfig('email', 'smtpPort', parseInt(e.target.value))}
                      />
                      <Input
                        label="SMTP Username"
                        value={config.email.smtpUsername}
                        onChange={(e) => updateConfig('email', 'smtpUsername', e.target.value)}
                      />
                      <Input
                        type="password"
                        label="SMTP Password"
                        value={config.email.smtpPassword}
                        onChange={(e) => updateConfig('email', 'smtpPassword', e.target.value)}
                      />
                      <Input
                        label="From Email"
                        value={config.email.fromEmail}
                        onChange={(e) => updateConfig('email', 'fromEmail', e.target.value)}
                      />
                      <Input
                        label="From Name"
                        value={config.email.fromName}
                        onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">SMTP Secure (TLS/SSL)</h4>
                        <p className="text-sm text-gray-600">Use secure connection for SMTP</p>
                      </div>
                      <Switch
                        checked={config.email.smtpSecure}
                        onChange={(checked) => updateConfig('email', 'smtpSecure', checked)}
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: 'notifications',
                label: 'Notifications',
                content: (
                  <div className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Enable email notifications</p>
                        </div>
                        <Switch
                          checked={config.notifications.emailNotifications}
                          onChange={(checked) => updateConfig('notifications', 'emailNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Critical Alerts</h4>
                          <p className="text-sm text-gray-600">Send alerts for critical system events</p>
                        </div>
                        <Switch
                          checked={config.notifications.criticalAlerts}
                          onChange={(checked) => updateConfig('notifications', 'criticalAlerts', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">System Updates</h4>
                          <p className="text-sm text-gray-600">Send notifications for system updates</p>
                        </div>
                        <Switch
                          checked={config.notifications.systemUpdates}
                          onChange={(checked) => updateConfig('notifications', 'systemUpdates', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Webhook URLs</h3>
                      <Input
                        label="Slack Webhook"
                        value={config.notifications.slackWebhook}
                        onChange={(e) => updateConfig('notifications', 'slackWebhook', e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                      />
                      <Input
                        label="Discord Webhook"
                        value={config.notifications.discordWebhook}
                        onChange={(e) => updateConfig('notifications', 'discordWebhook', e.target.value)}
                        placeholder="https://discord.com/api/webhooks/..."
                      />
                      <Input
                        label="Teams Webhook"
                        value={config.notifications.teamsWebhook}
                        onChange={(e) => updateConfig('notifications', 'teamsWebhook', e.target.value)}
                        placeholder="https://outlook.office.com/webhook/..."
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: 'integrations',
                label: 'Integrations',
                content: (
                  <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <div className="p-4 border-b">
                          <h3 className="text-lg font-semibold">Elasticsearch</h3>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Enable Elasticsearch</span>
                              <Switch
                                checked={config.integrations.elasticsearchEnabled}
                                onChange={(checked) => updateConfig('integrations', 'elasticsearchEnabled', checked)}
                              />
                            </div>
                            <Input
                              label="Elasticsearch URL"
                              value={config.integrations.elasticsearchUrl}
                              onChange={(e) => updateConfig('integrations', 'elasticsearchUrl', e.target.value)}
                              disabled={!config.integrations.elasticsearchEnabled}
                            />
                          </div>
                        </div>
                      </Card>
                      
                      <Card>
                        <div className="p-4 border-b">
                          <h3 className="text-lg font-semibold">Redis</h3>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Enable Redis</span>
                              <Switch
                                checked={config.integrations.redisEnabled}
                                onChange={(checked) => updateConfig('integrations', 'redisEnabled', checked)}
                              />
                            </div>
                            <Input
                              label="Redis URL"
                              value={config.integrations.redisUrl}
                              onChange={(e) => updateConfig('integrations', 'redisUrl', e.target.value)}
                              disabled={!config.integrations.redisEnabled}
                            />
                          </div>
                        </div>
                      </Card>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Webhooks</h4>
                          <p className="text-sm text-gray-600">Enable outgoing webhooks</p>
                        </div>
                        <Switch
                          checked={config.integrations.webhooksEnabled}
                          onChange={(checked) => updateConfig('integrations', 'webhooksEnabled', checked)}
                        />
                      </div>
                      
                      <Input
                        type="number"
                        label="API Rate Limit (per minute)"
                        value={config.integrations.apiRateLimit.toString()}
                        onChange={(e) => updateConfig('integrations', 'apiRateLimit', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: 'feature-flags',
                label: 'Feature Flags',
                content: (
                  <div className="space-y-6 pt-4">
                    <div className="space-y-4">
                      {featureFlags.map((flag) => (
                        <Card key={flag.id}>
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium">{flag.name}</h4>
                                  <Chip
                                    color={
                                      flag.category === 'ui' ? 'primary' :
                                      flag.category === 'api' ? 'secondary' :
                                      flag.category === 'integration' ? 'success' : 'warning'
                                    }
                                    variant="flat"
                                    size="sm"
                                  >
                                    {flag.category}
                                  </Chip>
                                  {flag.enabled && (
                                    <Chip color="success" variant="flat" size="sm">
                                      Active
                                    </Chip>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Rollout: {flag.rolloutPercentage}%
                                </p>
                              </div>
                              <Switch
                                checked={flag.enabled}
                                onChange={() => toggleFeatureFlag(flag.id)}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                key: 'environment',
                label: 'Environment',
                content: (
                  <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Environment Variables</h3>
                      {/* <Button size="sm" onPress={onOpen}> */}
                      {/* Add Variable */}
                      {/* </Button> */}
                    </div>
                    
                    <div className="space-y-3">
                      {envVars.map((envVar) => (
                        <Card key={envVar.key}>
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                    {envVar.key}
                                  </code>
                                  {envVar.sensitive && (
                                    <Chip color="warning" variant="flat" size="sm">
                                      Sensitive
                                    </Chip>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{envVar.description}</p>
                                <p className="text-xs font-mono text-gray-500 mt-1">
                                  {envVar.sensitive ? '***REDACTED***' : envVar.value}
                                </p>
                              </div>
                              {/* <Button
                                size="sm"
                                variant="light"
                                onPress={() => {
                                  setSelectedEnvVar(envVar);
                                  onOpen();
                                }}
                              >
                                Edit
                              </Button> */}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </Card>

      {/* Environment Variable Modal */}
      {/* <Modal isOpen={isOpen} onClose={onClose} size="lg"> */}
      {/* <ModalContent> */}
      {/* <ModalHeader> */}
      {/* {selectedEnvVar ? 'Edit Environment Variable' : 'Add Environment Variable'} */}
      {/* </ModalHeader> */}
      {/* <ModalBody> */}
      {/* <div className="space-y-4"> */}
      {/* <Input */}
      {/* label="Key" */}
      {/* placeholder="VARIABLE_NAME" */}
      {/* defaultValue={selectedEnvVar?.key || ''} */}
      {/* /> */}
      {/* <Input */}
      {/* label="Value" */}
      {/* placeholder="variable value" */}
      {/* defaultValue={selectedEnvVar?.value || ''} */}
      {/* /> */}
      {/* <Textarea */}
      {/* label="Description" */}
      {/* placeholder="Description of this environment variable" */}
      {/* defaultValue={selectedEnvVar?.description || ''} */}
      {/* /> */}
      {/* <div className="flex items-center justify-between"> */}
      {/* <span>Sensitive Variable</span> */}
      {/* <Switch defaultSelected={selectedEnvVar?.sensitive || false} /> */}
      {/* </div> */}
      {/* </div> */}
      {/* </ModalBody> */}
      {/* <ModalFooter> */}
      {/* <Button variant="light" onPress={onClose}> */}
      {/* Cancel */}
      {/* </Button> */}
      {/* <Button color="primary" onPress={onClose}> */}
      {/* {selectedEnvVar ? 'Update' : 'Add'} Variable */}
      {/* </Button> */}
      {/* </ModalFooter> */}
      {/* </ModalContent> */}
      {/* </Modal> */}
    </div>
  );
};

export default SystemConfigurationPage;
