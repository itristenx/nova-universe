import React, { useState, useEffect } from 'react';
import { Button, Card, Input, FileInput, Checkbox } from '@/components/ui';
import { CogIcon, PaintBrushIcon, KeyIcon, BellIcon, ServerIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { Config, SecuritySettings, NotificationSettings } from '@/types';

export const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load config:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load configuration',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      await api.updateConfig(config);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Configuration saved successfully',
      });
    } catch (error) {
      console.error('Failed to save config:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save configuration',
      });
    } finally {
      setSaving(false);
    }
  };

  const restartServer = async () => {
    if (!confirm('Are you sure you want to restart the server? This will temporarily interrupt service.')) {
      return;
    }

    try {
      setRestarting(true);
      await api.restartServer();
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Server restart initiated successfully',
      });
    } catch (error) {
      console.error('Failed to restart server:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to restart server',
      });
    } finally {
      setRestarting(false);
    }
  };

  const handleAssetUpload = async (file: File | null, type: 'logo' | 'favicon') => {
    if (!file) return;

    try {
      setUploadingAsset(type);
      const asset = await api.uploadAsset(file, type);
      
      setConfig(prev => prev ? {
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'faviconUrl']: asset.url
      } : null);

      addToast({
        type: 'success',
        title: 'Success',
        description: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`,
      });
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      addToast({
        type: 'error',
        title: 'Error',
        description: `Failed to upload ${type}`,
      });
    } finally {
      setUploadingAsset(null);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'branding', name: 'Branding', icon: PaintBrushIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'system', name: 'System', icon: ServerIcon },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure your CueIT system settings and preferences
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Sidebar */}
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon
                  className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
                    activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span className="truncate">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          <Card>
            <div className="px-4 py-5 sm:p-6">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">General Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure basic system settings and messages.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="Welcome Message"
                      value={config?.welcomeMessage || ''}
                      onChange={(e) => setConfig(prev => prev ? { ...prev, welcomeMessage: e.target.value } : null)}
                      helperText="Message displayed on the kiosk welcome screen"
                    />
                    
                    <Input
                      label="Help Message"
                      value={config?.helpMessage || ''}
                      onChange={(e) => setConfig(prev => prev ? { ...prev, helpMessage: e.target.value } : null)}
                      helperText="Help text displayed to users"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Status Open Message"
                        value={config?.statusOpenMsg || ''}
                        onChange={(e) => setConfig(prev => prev ? { ...prev, statusOpenMsg: e.target.value } : null)}
                      />
                      <Input
                        label="Status Closed Message"
                        value={config?.statusClosedMsg || ''}
                        onChange={(e) => setConfig(prev => prev ? { ...prev, statusClosedMsg: e.target.value } : null)}
                      />
                      <Input
                        label="Status Error Message"
                        value={config?.statusErrorMsg || ''}
                        onChange={(e) => setConfig(prev => prev ? { ...prev, statusErrorMsg: e.target.value } : null)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Branding Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Customize the appearance of your kiosks and admin interface.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* Logo Upload */}
                    <div>
                      <FileInput
                        label="Organization Logo"
                        accept="image/*"
                        onChange={(file) => handleAssetUpload(file, 'logo')}
                        disabled={uploadingAsset === 'logo'}
                        helperText="Upload your organization's logo (PNG, JPG, SVG recommended)"
                      />
                      
                      {/* Logo preview */}
                      {config?.logoUrl && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Logo</label>
                          <div className="flex items-center space-x-4">
                            <img
                              src={config.logoUrl}
                              alt="Organization logo"
                              className="h-16 w-auto border border-gray-300 rounded bg-white p-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <Input
                              label="Logo URL (optional)"
                              value={config?.logoUrl || ''}
                              onChange={(e) => setConfig(prev => prev ? { ...prev, logoUrl: e.target.value } : null)}
                              helperText="Direct URL to logo file"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Favicon Upload */}
                    <div>
                      <FileInput
                        label="Favicon"
                        accept="image/*"
                        onChange={(file) => handleAssetUpload(file, 'favicon')}
                        disabled={uploadingAsset === 'favicon'}
                        helperText="Upload a favicon for browser tabs (ICO, PNG recommended, 16x16 or 32x32 pixels)"
                      />
                      
                      {config?.faviconUrl && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Favicon</label>
                          <div className="flex items-center space-x-4">
                            <img
                              src={config.faviconUrl}
                              alt="Favicon"
                              className="h-8 w-8 border border-gray-300 rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <Input
                              label="Favicon URL (optional)"
                              value={config?.faviconUrl || ''}
                              onChange={(e) => setConfig(prev => prev ? { ...prev, faviconUrl: e.target.value } : null)}
                              helperText="Direct URL to favicon file"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Theme Colors */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Theme Customization</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Theme Customization Coming Soon
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>Advanced theme customization including custom colors, fonts, and layout options will be available here.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure authentication and security options.
                    </p>
                  </div>

                  <SecuritySettingsForm />
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Notification Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure how and when notifications are sent.
                    </p>
                  </div>

                  <NotificationSettingsForm />
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">System Management</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage server operations and system maintenance.
                    </p>
                  </div>

                  <Card className="p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Server Control</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Restart the API server to apply configuration changes or resolve issues. This will temporarily interrupt service.
                    </p>
                    <Button
                      variant="danger"
                      onClick={restartServer}
                      isLoading={restarting}
                      className="w-auto"
                    >
                      {restarting ? 'Restarting...' : 'Restart Server'}
                    </Button>
                  </Card>
                </div>
              )}

              {/* Save button */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={saveConfig}
                    isLoading={saving}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Security Settings Form Component
const SecuritySettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [adminPin, setAdminPin] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadSecuritySettings();
    loadAdminPin();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSecuritySettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load security settings:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load security settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminPin = async () => {
    try {
      const response = await fetch('/api/admin-pin', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAdminPin(data.pin);
      }
    } catch (error) {
      console.error('Failed to load admin PIN:', error);
    }
  };

  const saveSecuritySettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await api.updateSecuritySettings(settings);
      await saveAdminPin();
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Security settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save security settings:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save security settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAdminPin = async () => {
    if (!/^\d{6}$/.test(adminPin)) {
      throw new Error('PIN must be 6 digits');
    }
    
    const response = await fetch('/api/admin-pin', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ pin: adminPin }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save admin PIN');
    }
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Minimum Password Length"
            type="number"
            value={settings?.passwordMinLength || '8'}
            onChange={(e) => setSettings(prev => prev ? { ...prev, passwordMinLength: parseInt(e.target.value) || 8 } : null)}
            min="6"
            max="128"
          />
        </div>
        <div>
          <Input
            label="Session Timeout (hours)"
            type="number"
            value={settings?.sessionTimeout || '24'}
            onChange={(e) => setSettings(prev => prev ? { ...prev, sessionTimeout: parseInt(e.target.value) || 24 } : null)}
            min="1"
            max="168"
          />
        </div>
        <div>
          <Input
            label="Max Login Attempts"
            type="number"
            value={settings?.maxLoginAttempts || '5'}
            onChange={(e) => setSettings(prev => prev ? { ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 } : null)}
            min="3"
            max="20"
          />
        </div>
        <div>
          <Input
            label="Lockout Duration (minutes)"
            type="number"
            value={settings?.lockoutDuration || '15'}
            onChange={(e) => setSettings(prev => prev ? { ...prev, lockoutDuration: parseInt(e.target.value) || 15 } : null)}
            min="5"
            max="1440"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Password Requirements</h4>
        <div className="space-y-3">
          <Checkbox
            label="Require symbols in passwords"
            checked={settings?.passwordRequireSymbols || false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, passwordRequireSymbols: checked } : null)}
          />
          <Checkbox
            label="Require numbers in passwords"
            checked={settings?.passwordRequireNumbers || false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, passwordRequireNumbers: checked } : null)}
          />
          <Checkbox
            label="Require uppercase letters in passwords"
            checked={settings?.passwordRequireUppercase || false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, passwordRequireUppercase: checked } : null)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Kiosk Access</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Admin PIN (6 digits)"
              type="text"
              value={adminPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setAdminPin(value);
              }}
              placeholder="123456"
              maxLength={6}
              pattern="\d{6}"
              helperText="6-digit PIN for kiosk admin access"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Advanced Security</h4>
        <div className="space-y-3">
          <Checkbox
            label="Require two-factor authentication"
            checked={settings?.twoFactorRequired || false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, twoFactorRequired: checked } : null)}
          />
          <Checkbox
            label="Enable audit logging"
            checked={settings?.auditLogging !== false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, auditLogging: checked } : null)}
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={saveSecuritySettings}
            isLoading={saving}
          >
            Save Security Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

// Notification Settings Form Component
const NotificationSettingsForm: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getNotificationSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load notification settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await api.updateNotificationSettings(settings);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Notification settings saved successfully',
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save notification settings',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">General Notifications</h4>
        <div className="space-y-3">
          <Checkbox
            label="Enable email notifications"
            checked={settings?.emailNotifications !== false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, emailNotifications: checked } : null)}
          />
          <Checkbox
            label="Enable Slack notifications"
            checked={settings?.slackNotifications || false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, slackNotifications: checked } : null)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Event Notifications</h4>
        <div className="space-y-3">
          <Checkbox
            label="Notify when tickets are created"
            checked={settings?.ticketCreatedNotify !== false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, ticketCreatedNotify: checked } : null)}
          />
          <Checkbox
            label="Notify when kiosks go offline"
            checked={settings?.kioskOfflineNotify !== false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, kioskOfflineNotify: checked } : null)}
          />
          <Checkbox
            label="Notify on system errors"
            checked={settings?.systemErrorNotify !== false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, systemErrorNotify: checked } : null)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Reports</h4>
        <div className="space-y-3">
          <Checkbox
            label="Send daily reports"
            checked={settings?.dailyReports || false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, dailyReports: checked } : null)}
          />
          <Checkbox
            label="Send weekly reports"
            checked={settings?.weeklyReports || false}
            onChange={(checked) => setSettings(prev => prev ? { ...prev, weeklyReports: checked } : null)}
          />
        </div>
      </div>

      <div>
        <Input
          label="Notification Retention (days)"
          type="number"
          value={settings?.notificationRetention || '30'}
          onChange={(e) => setSettings(prev => prev ? { ...prev, notificationRetention: parseInt(e.target.value) || 30 } : null)}
          min="1"
          max="365"
          helperText="How long to keep notifications before automatic deletion"
        />
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={saveNotificationSettings}
            isLoading={saving}
          >
            Save Notification Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
