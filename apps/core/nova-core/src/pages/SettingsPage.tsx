import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Checkbox } from '@heroui/react';
import { FileInput } from '@/components/ui';
import { CogIcon, PaintBrushIcon, KeyIcon, BellIcon, ServerIcon, ClockIcon, UserGroupIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ScheduleManager } from '@/components/ScheduleManager';
import { ThemeSelector } from '@/components/ThemeSelector';
import { DirectorySSOConfig } from '@/components/DirectorySSOConfig';
import { PasskeyManagement } from '@/components/PasskeyManagement';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { Config, SecuritySettings, NotificationSettings, ScheduleConfig, OfficeHours, Kiosk } from '@/types';
import { AdminPinManagement } from '@/components/AdminPinManagement';

export const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig | null>(null);
  const [officeHoursConfig, setOfficeHoursConfig] = useState<OfficeHours | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadConfig();
    loadScheduleConfigs();
    loadKiosks();
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

  const loadScheduleConfigs = async () => {
    try {
      const statusConfig = await api.getStatusConfig();
      setScheduleConfig(statusConfig.schedule || {
        enabled: false,
        schedule: {
          monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          saturday: { enabled: false, slots: [] },
          sunday: { enabled: false, slots: [] }
        },
        timezone: 'America/New_York'
      });
      setOfficeHoursConfig(statusConfig.officeHours || {
        enabled: false,
        title: 'IT Support Hours',
        schedule: {
          monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          saturday: { enabled: false, slots: [] },
          sunday: { enabled: false, slots: [] }
        },
        timezone: 'America/New_York',
        showNextOpen: true
      });
    } catch (error) {
      console.error('Failed to load schedule configs:', error);
    }
  };

  const loadKiosks = async () => {
    try {
      const data = await api.getKiosks();
      setKiosks(data);
    } catch (error) {
      console.error('Failed to load kiosks:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load kiosk list',
      });
    }
  };

  const saveScheduleConfig = async (newConfig: ScheduleConfig) => {
    try {
      const currentStatusConfig = await api.getStatusConfig();
      await api.updateStatusConfig({
        ...currentStatusConfig,
        schedule: newConfig
      });
      setScheduleConfig(newConfig);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Schedule configuration saved successfully',
      });
    } catch (error) {
      console.error('Failed to save schedule config:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save schedule configuration',
      });
      throw error;
    }
  };

  const saveOfficeHoursConfig = async (newConfig: OfficeHours) => {
    try {
      const currentStatusConfig = await api.getStatusConfig();
      await api.updateStatusConfig({
        ...currentStatusConfig,
        officeHours: newConfig
      });
      setOfficeHoursConfig(newConfig);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Office hours configuration saved successfully',
      });
    } catch (error) {
      console.error('Failed to save office hours config:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save office hours configuration',
      });
      throw error;
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

  const handleAssetUpload = async (file: File | null, type: 'logo' | 'favicon' | 'kiosk-logo') => {
    if (!file) return;

    try {
      setUploadingAsset(type);
      // Use 'logo' for API call for kiosk-logo since it's the same type
      const apiType = type === 'kiosk-logo' ? 'logo' as const : type;
      const asset = await api.uploadAsset(file, apiType);
      
      setConfig(prev => prev ? {
        ...prev,
        [type === 'logo' ? 'logoUrl' : type === 'favicon' ? 'faviconUrl' : 'kioskLogoUrl']: asset.url
      } : null);

      addToast({
        type: 'success',
        title: 'Success',
        description: `${type === 'logo' ? 'Logo' : type === 'favicon' ? 'Favicon' : 'Kiosk Logo'} uploaded successfully`,
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
    { id: 'branding', name: 'Portal Branding', icon: PaintBrushIcon },
    { id: 'schedule', name: 'Schedule & Hours', icon: ClockIcon },
    { id: 'directory', name: 'Directory & SSO', icon: UserGroupIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'pin-management', name: 'PIN Management', icon: KeyIcon },
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
          Configure your Nova Universe system settings and preferences
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
                      Configure basic admin portal settings and system defaults.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Appearance</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Theme
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Choose between light and dark mode for the admin interface
                            </p>
                          </div>
                          <ThemeSelector />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Session Settings</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Session Timeout (minutes)"
                          type="number"
                          value="30"
                          min="5"
                          max="480"
                          helperText="How long users stay logged in"
                        />
                        <Input
                          label="Auto-refresh Interval (seconds)"
                          type="number"
                          value="30"
                          min="10"
                          max="300"
                          helperText="How often data refreshes automatically"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">System Defaults</h4>
                      <div className="space-y-4">
                        <Input
                          label="Default Support Department"
                          value="IT Support"
                          helperText="Default department for new tickets"
                        />
                        <Input
                          label="Support Email"
                          type="email"
                          value="support@company.com"
                          helperText="Email address for support communications"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save button for General tab */}
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
              )}

              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Portal Branding Settings</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Customize the appearance of your kiosks and admin interface.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="Organization Name"
                      value={config?.organizationName || ''}
                      onChange={(e) =>
                        setConfig(prev => prev ? { ...prev, organizationName: e.target.value } : null)
                      }
                      helperText="Displayed across the admin interface"
                    />

                    {/* Logo Upload */}
                    <div>
                      <FileInput
                        label="Organization Logo"
                        accept="image/*"
                        onChange={(file) => handleAssetUpload(file, 'logo')}
                        disabled={uploadingAsset === 'logo'}
                        helperText="Upload your organization's logo (PNG, JPG, SVG recommended). Recommended size: 200x200px (square) or 200x60px (wide)"
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

                    {/* Kiosk Logo Upload */}
                    <div>
                      <FileInput
                        label="Kiosk Logo"
                        accept="image/*"
                        onChange={(file) => handleAssetUpload(file, 'kiosk-logo')}
                        disabled={uploadingAsset === 'kiosk-logo'}
                        helperText="Upload a logo specifically for kiosk displays (PNG, JPG, SVG recommended). Recommended size: 300x150px or 400x200px for optimal display on kiosk screens"
                      />
                      
                      {/* Kiosk Logo preview */}
                      {config?.kioskLogoUrl && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Kiosk Logo</label>
                          <div className="flex items-center space-x-4">
                            <img
                              src={config.kioskLogoUrl}
                              alt="Kiosk logo"
                              className="h-16 w-auto border border-gray-300 rounded bg-white p-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <Input
                              label="Kiosk Logo URL (optional)"
                              value={config?.kioskLogoUrl || ''}
                              onChange={(e) => setConfig(prev => prev ? { ...prev, kioskLogoUrl: e.target.value } : null)}
                              helperText="Direct URL to kiosk logo file"
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

                  {/* Welcome and Help Messages */}
                  <div className="border-t border-gray-200 pt-6 grid grid-cols-1 gap-6">
                    <Input
                      label="Welcome Message"
                      value={config?.welcomeMessage || ''}
                      onChange={(e) =>
                        setConfig((prev) => (prev ? { ...prev, welcomeMessage: e.target.value } : null))
                      }
                      helperText="Message shown at the top of the kiosk"
                    />
                    <Input
                      label="Help Message"
                      value={config?.helpMessage || ''}
                      onChange={(e) =>
                        setConfig((prev) => (prev ? { ...prev, helpMessage: e.target.value } : null))
                      }
                      helperText="Short instruction for users"
                    />
                  </div>

                    {/* Theme Colors */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Theme Customization</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700 mb-2">
                              Primary Color
                            </label>
                            <input
                              id="primary-color"
                              type="color"
                              className="w-full h-10 border border-gray-300 rounded-md"
                              value={config?.primaryColor || '#3B82F6'}
                              onChange={(e) =>
                                setConfig(prev => prev ? { ...prev, primaryColor: e.target.value } : null)
                              }
                              title="Primary theme color"
                            />
                          </div>
                          <div>
                            <label htmlFor="secondary-color" className="block text-sm font-medium text-gray-700 mb-2">
                              Secondary Color
                            </label>
                            <input
                              id="secondary-color"
                              type="color"
                              className="w-full h-10 border border-gray-300 rounded-md"
                              value={config?.secondaryColor || '#6B7280'}
                              onChange={(e) =>
                                setConfig(prev => prev ? { ...prev, secondaryColor: e.target.value } : null)
                              }
                              title="Secondary theme color"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 mb-2">
                            Font Family
                          </label>
                          <select
                            id="font-family"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            title="Font family for the interface"
                          >
                            <option value="inter">Inter (Default)</option>
                            <option value="roboto">Roboto</option>
                            <option value="open-sans">Open Sans</option>
                            <option value="lato">Lato</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" defaultChecked title="Enable dark mode support" />
                            <span className="text-sm text-gray-700">Enable dark mode</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" title="Enable high contrast mode" />
                            <span className="text-sm text-gray-700">High contrast mode</span>
                          </label>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Save button for Branding tab */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={saveConfig}
                        isLoading={saving}
                      >
                        Save Branding Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Schedule & Hours Configuration</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure automatic scheduling and office hours display for kiosks.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Automatic Scheduling */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Automatic Scheduling</h4>
                      <p className="text-sm text-gray-600 mb-6">
                        Automatically open and close kiosks based on your schedule. Kiosks will switch to "closed" status outside of scheduled hours.
                      </p>
                      
                      {scheduleConfig && (
                        <ScheduleManager
                          title="Automatic Schedule"
                          config={scheduleConfig}
                          onSave={saveScheduleConfig}
                          showEnabled={true}
                        />
                      )}
                    </div>

                    {/* Office Hours Display */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Office Hours Display</h4>
                      <p className="text-sm text-gray-600 mb-6">
                        Show office hours information on kiosks. This is purely informational and doesn't affect automatic scheduling.
                      </p>
                      
                      {officeHoursConfig && (
                        <ScheduleManager
                          title="Office Hours"
                          config={officeHoursConfig}
                          onSave={saveOfficeHoursConfig}
                          showEnabled={true}
                          showTitle={true}
                          showNextOpen={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'directory' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Directory & SSO Integration</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Configure directory integration, Single Sign-On (SSO), and SCIM provisioning for user management.
                    </p>
                  </div>

                  <DirectorySSOConfig onConfigChange={loadConfig} />
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
                  
                  <div className="border-t border-gray-200 pt-6">
                    <PasskeyManagement />
                  </div>
                </div>
              )}

              {activeTab === 'pin-management' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Admin PIN Management</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage admin PINs for kiosk access. Configure global PINs or individual PINs for each kiosk.
                    </p>
                  </div>

                  <AdminPinManagement 
                    kiosks={kiosks} 
                    onUpdate={() => {
                      // Refresh kiosks list if needed
                      loadKiosks();
                    }} 
                  />
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

                <Card className="p-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Rate Limiting</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Window (ms)"
                      type="number"
                      value={config?.rateLimitWindow || ''}
                      onChange={(e) =>
                        setConfig((prev) => (prev ? { ...prev, rateLimitWindow: e.target.value } : null))
                      }
                      helperText="Time window for rate limits"
                    />
                    <Input
                      label="Max Requests"
                      type="number"
                      value={config?.rateLimitMax || ''}
                      onChange={(e) =>
                        setConfig((prev) => (prev ? { ...prev, rateLimitMax: e.target.value } : null))
                      }
                      helperText="Requests allowed per window"
                    />
                  </div>
                </Card>
              </div>
              )}
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

  const saveSecuritySettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      await api.updateSecuritySettings(settings);
      
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

      {/* Save button for Security Settings */}
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
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');
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

  const handleTestSMTP = async () => {
    if (!testEmail) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Please enter an email address for testing',
      });
      return;
    }

    try {
      setTestingEmail(true);
      await api.testSMTP(testEmail);
      
      addToast({
        type: 'success',
        title: 'SMTP Test Successful',
        description: `Test email sent to ${testEmail}`,
      });
    } catch (error: any) {
      console.error('SMTP test failed:', error);
      addToast({
        type: 'error',
        title: 'SMTP Test Failed',
        description: error.response?.data?.error || 'Failed to send test email',
      });
    } finally {
      setTestingEmail(false);
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
      </div>      <div>
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

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">SMTP Email Testing</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Test your SMTP configuration by sending a test email
        </p>
        <div className="flex space-x-3">
          <div className="flex-1">
            <Input
              label="Test Email Address"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleTestSMTP}
              disabled={testingEmail || !testEmail}
              size="sm"
            >
              {testingEmail ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Test Email'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Save button for Notification Settings */}
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
