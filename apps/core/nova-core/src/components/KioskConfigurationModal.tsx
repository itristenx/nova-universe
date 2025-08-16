import React, { useState, useEffect } from 'react';
import { Button, Modal } from '@/components/ui';
import { ScheduleManager } from '@/components/ScheduleManager';
import {
  CogIcon,
  ClockIcon,
  BellIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type {
  Kiosk,
  KioskConfiguration,
  ScheduleConfig,
  OfficeHours,
  GlobalConfiguration,
} from '@/types';

interface KioskConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  kiosk: Kiosk;
  globalConfig: GlobalConfiguration;
  onUpdate: () => void;
}

type ConfigTab = 'status' | 'schedule' | 'office-hours' | 'branding';

export const KioskConfigurationModal: React.FC<KioskConfigurationModalProps> = ({
  isOpen,
  onClose,
  kiosk,
  globalConfig,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('status');
  const [kioskConfig, setKioskConfig] = useState<KioskConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  // Local state for each configuration type
  const [statusConfig, setStatusConfig] = useState({
    enabled: kiosk.effectiveConfig.statusEnabled,
    currentStatus: kiosk.effectiveConfig.currentStatus,
    customMessages: {
      openMessage: kiosk.effectiveConfig.openMsg,
      closedMessage: kiosk.effectiveConfig.closedMsg,
      meetingMessage: 'In a Meeting - Back Soon',
      brbMessage: 'Be Right Back',
      lunchMessage: 'Out to Lunch - Back in 1 Hour',
      unavailableMessage: 'Status Unavailable',
    },
  });

  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(
    globalConfig.defaultSchedule,
  );
  const [officeHoursConfig, setOfficeHoursConfig] = useState<OfficeHours>(
    globalConfig.defaultOfficeHours,
  );
  const [brandingConfig, setBrandingConfig] = useState({
    logoUrl: kiosk.effectiveConfig.logoUrl || globalConfig.defaultBranding.logoUrl,
    backgroundUrl: kiosk.effectiveConfig.bgUrl || globalConfig.defaultBranding.backgroundUrl || '',
    welcomeMessage: globalConfig.defaultBranding.welcomeMessage,
    helpMessage: globalConfig.defaultBranding.helpMessage,
  });

  useEffect(() => {
    if (isOpen && kiosk) {
      loadKioskConfiguration();
    }
  }, [isOpen, kiosk.id]);

  const loadKioskConfiguration = async () => {
    try {
      setLoading(true);
      const config = await api.getKioskConfiguration(kiosk.id);
      setKioskConfig(config);

      // Update local state with existing overrides
      if (config.statusConfig) {
        setStatusConfig({
          enabled: config.statusConfig.enabled,
          currentStatus: config.statusConfig.currentStatus,
          customMessages: {
            openMessage:
              config.statusConfig.customMessages?.openMessage ||
              statusConfig.customMessages.openMessage,
            closedMessage:
              config.statusConfig.customMessages?.closedMessage ||
              statusConfig.customMessages.closedMessage,
            meetingMessage:
              config.statusConfig.customMessages?.meetingMessage ||
              statusConfig.customMessages.meetingMessage,
            brbMessage:
              config.statusConfig.customMessages?.brbMessage ||
              statusConfig.customMessages.brbMessage,
            lunchMessage:
              config.statusConfig.customMessages?.lunchMessage ||
              statusConfig.customMessages.lunchMessage,
            unavailableMessage:
              config.statusConfig.customMessages?.unavailableMessage ||
              statusConfig.customMessages.unavailableMessage,
          },
        });
      }

      if (config.scheduleConfig) {
        setScheduleConfig(config.scheduleConfig.schedule);
      }

      if (config.officeHoursConfig) {
        setOfficeHoursConfig(config.officeHoursConfig.officeHours);
      }

      if (config.brandingConfig) {
        setBrandingConfig({
          logoUrl: config.brandingConfig.logoUrl || brandingConfig.logoUrl,
          backgroundUrl: config.brandingConfig.backgroundUrl || brandingConfig.backgroundUrl,
          welcomeMessage: config.brandingConfig.welcomeMessage || brandingConfig.welcomeMessage,
          helpMessage: config.brandingConfig.helpMessage || brandingConfig.helpMessage,
        });
      }
    } catch (error) {
      console.error('Failed to load kiosk configuration:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load kiosk configuration',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveOverride = async (configType: ConfigTab) => {
    try {
      setSaving(true);

      let configData;
      switch (configType) {
        case 'status':
          configData = statusConfig;
          break;
        case 'schedule':
          configData = scheduleConfig;
          break;
        case 'office-hours':
          configData = officeHoursConfig;
          break;
        case 'branding':
          configData = brandingConfig;
          break;
      }

      await api.setKioskOverride(
        kiosk.id,
        configType === 'office-hours' ? 'officeHours' : configType,
        configData,
      );

      addToast({
        type: 'success',
        title: 'Success',
        description: `${configType} configuration saved successfully`,
      });

      onUpdate();
      await loadKioskConfiguration();
    } catch (error) {
      console.error(`Failed to save ${configType} override:`, error);
      addToast({
        type: 'error',
        title: 'Error',
        description: `Failed to save ${configType} configuration`,
      });
    } finally {
      setSaving(false);
    }
  };

  const removeOverride = async (configType: ConfigTab) => {
    try {
      setSaving(true);
      await api.removeKioskOverride(
        kiosk.id,
        configType === 'office-hours' ? 'officeHours' : configType,
      );

      addToast({
        type: 'success',
        title: 'Success',
        description: `${configType} override removed - using global settings`,
      });

      onUpdate();
      await loadKioskConfiguration();
    } catch (error) {
      console.error(`Failed to remove ${configType} override:`, error);
      addToast({
        type: 'error',
        title: 'Error',
        description: `Failed to remove ${configType} override`,
      });
    } finally {
      setSaving(false);
    }
  };

  const hasOverride = (configType: ConfigTab): boolean => {
    if (!kioskConfig) return false;

    switch (configType) {
      case 'status':
        return !!kioskConfig.statusConfig;
      case 'schedule':
        return !!kioskConfig.scheduleConfig;
      case 'office-hours':
        return !!kioskConfig.officeHoursConfig;
      case 'branding':
        return !!kioskConfig.brandingConfig;
      default:
        return false;
    }
  };

  const tabs = [
    { id: 'status' as ConfigTab, name: 'Status', icon: CogIcon },
    { id: 'schedule' as ConfigTab, name: 'Schedule', icon: ClockIcon },
    { id: 'office-hours' as ConfigTab, name: 'Office Hours', icon: BellIcon },
    { id: 'branding' as ConfigTab, name: 'Branding', icon: PhotoIcon },
  ];

  const currentlyUsingGlobal = kiosk.configScope === 'global';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configure ${kiosk.id}`} size="xl">
      <div className="space-y-6">
        {/* Configuration Mode Notice */}
        <div
          className={`rounded-md border p-4 ${
            currentlyUsingGlobal ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'
          }`}
        >
          <div className="flex items-start space-x-3">
            {currentlyUsingGlobal ? (
              <CheckCircleIcon className="mt-0.5 h-5 w-5 text-blue-500" />
            ) : (
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-orange-500" />
            )}
            <div>
              <h3
                className={`text-sm font-medium ${
                  currentlyUsingGlobal ? 'text-blue-800' : 'text-orange-800'
                }`}
              >
                Configuration Mode: {kiosk.configScope === 'global' ? 'Global' : 'Individual'}
              </h3>
              <div
                className={`mt-2 text-sm ${
                  currentlyUsingGlobal ? 'text-blue-700' : 'text-orange-700'
                }`}
              >
                {currentlyUsingGlobal ? (
                  <p>
                    This kiosk uses global configuration settings. Any overrides you create will
                    switch it to individual mode.
                  </p>
                ) : (
                  <p>
                    This kiosk has {kiosk.overrideCount} individual override
                    {kiosk.overrideCount !== 1 ? 's' : ''}. Changes will only affect this kiosk.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center border-b-2 px-1 py-2 text-sm font-medium ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon
                      className={`mr-2 -ml-0.5 h-5 w-5 ${
                        activeTab === tab.id
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {tab.name}
                    {hasOverride(tab.id) && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                        Override
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'status' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Status Configuration</h3>
                    <div className="flex space-x-2">
                      {hasOverride('status') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => removeOverride('status')}
                          disabled={saving}
                        >
                          <XMarkIcon className="mr-1 h-4 w-4" />
                          Remove Override
                        </Button>
                      )}
                      <Button onClick={() => saveOverride('status')} disabled={saving} size="sm">
                        {hasOverride('status') ? 'Update Override' : 'Create Override'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Status Enable/Disable */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="status-enabled"
                        checked={statusConfig.enabled}
                        onChange={(e) =>
                          setStatusConfig((prev) => ({ ...prev, enabled: e.target.checked }))
                        }
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="status-enabled" className="text-sm font-medium text-gray-700">
                        Enable status system for this kiosk
                      </label>
                    </div>

                    {/* Current Status */}
                    <div>
                      <label
                        htmlFor="current-status"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Current Status
                      </label>
                      <select
                        id="current-status"
                        value={statusConfig.currentStatus}
                        onChange={(e) =>
                          setStatusConfig((prev) => ({
                            ...prev,
                            currentStatus: e.target.value as any,
                          }))
                        }
                        className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                        <option value="meeting">In a Meeting</option>
                        <option value="brb">Be Right Back</option>
                        <option value="lunch">Out to Lunch</option>
                        <option value="unavailable">Status Unavailable</option>
                      </select>
                    </div>

                    {/* Status Messages */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor="open-message"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Open Message
                        </label>
                        <input
                          id="open-message"
                          type="text"
                          value={statusConfig.customMessages.openMessage}
                          onChange={(e) =>
                            setStatusConfig((prev) => ({
                              ...prev,
                              customMessages: {
                                ...prev.customMessages,
                                openMessage: e.target.value,
                              },
                            }))
                          }
                          className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="closed-message"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Closed Message
                        </label>
                        <input
                          id="closed-message"
                          type="text"
                          value={statusConfig.customMessages.closedMessage}
                          onChange={(e) =>
                            setStatusConfig((prev) => ({
                              ...prev,
                              customMessages: {
                                ...prev.customMessages,
                                closedMessage: e.target.value,
                              },
                            }))
                          }
                          className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="meeting-message"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Meeting Message
                        </label>
                        <input
                          id="meeting-message"
                          type="text"
                          value={statusConfig.customMessages.meetingMessage}
                          onChange={(e) =>
                            setStatusConfig((prev) => ({
                              ...prev,
                              customMessages: {
                                ...prev.customMessages,
                                meetingMessage: e.target.value,
                              },
                            }))
                          }
                          className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="brb-message"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Be Right Back Message
                        </label>
                        <input
                          id="brb-message"
                          type="text"
                          value={statusConfig.customMessages.brbMessage}
                          onChange={(e) =>
                            setStatusConfig((prev) => ({
                              ...prev,
                              customMessages: {
                                ...prev.customMessages,
                                brbMessage: e.target.value,
                              },
                            }))
                          }
                          className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label
                          htmlFor="lunch-message"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Out to Lunch Message
                        </label>
                        <input
                          id="lunch-message"
                          type="text"
                          value={statusConfig.customMessages.lunchMessage}
                          onChange={(e) =>
                            setStatusConfig((prev) => ({
                              ...prev,
                              customMessages: {
                                ...prev.customMessages,
                                lunchMessage: e.target.value,
                              },
                            }))
                          }
                          className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label
                          htmlFor="unavailable-message"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Status Unavailable Message
                        </label>
                        <input
                          id="unavailable-message"
                          type="text"
                          value={statusConfig.customMessages.unavailableMessage}
                          onChange={(e) =>
                            setStatusConfig((prev) => ({
                              ...prev,
                              customMessages: {
                                ...prev.customMessages,
                                unavailableMessage: e.target.value,
                              },
                            }))
                          }
                          className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Schedule Configuration</h3>
                    <div className="flex space-x-2">
                      {hasOverride('schedule') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => removeOverride('schedule')}
                          disabled={saving}
                        >
                          <XMarkIcon className="mr-1 h-4 w-4" />
                          Remove Override
                        </Button>
                      )}
                      <Button onClick={() => saveOverride('schedule')} disabled={saving} size="sm">
                        {hasOverride('schedule') ? 'Update Override' : 'Create Override'}
                      </Button>
                    </div>
                  </div>

                  <ScheduleManager
                    title="Kiosk Automatic Schedule"
                    config={scheduleConfig}
                    onSave={async (newSchedule: ScheduleConfig) => {
                      setScheduleConfig(newSchedule);
                    }}
                    showEnabled={true}
                  />
                </div>
              )}

              {activeTab === 'office-hours' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Office Hours Configuration
                    </h3>
                    <div className="flex space-x-2">
                      {hasOverride('office-hours') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => removeOverride('office-hours')}
                          disabled={saving}
                        >
                          <XMarkIcon className="mr-1 h-4 w-4" />
                          Remove Override
                        </Button>
                      )}
                      <Button
                        onClick={() => saveOverride('office-hours')}
                        disabled={saving}
                        size="sm"
                      >
                        {hasOverride('office-hours') ? 'Update Override' : 'Create Override'}
                      </Button>
                    </div>
                  </div>

                  <ScheduleManager
                    title="Kiosk Office Hours"
                    config={officeHoursConfig}
                    onSave={async (newOfficeHours: OfficeHours) => {
                      setOfficeHoursConfig(newOfficeHours);
                    }}
                    showEnabled={true}
                    showTitle={true}
                    showNextOpen={true}
                  />
                </div>
              )}

              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Branding Configuration</h3>
                    <div className="flex space-x-2">
                      {hasOverride('branding') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => removeOverride('branding')}
                          disabled={saving}
                        >
                          <XMarkIcon className="mr-1 h-4 w-4" />
                          Remove Override
                        </Button>
                      )}
                      <Button onClick={() => saveOverride('branding')} disabled={saving} size="sm">
                        {hasOverride('branding') ? 'Update Override' : 'Create Override'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={brandingConfig.logoUrl}
                        onChange={(e) =>
                          setBrandingConfig((prev) => ({ ...prev, logoUrl: e.target.value }))
                        }
                        className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Background URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={brandingConfig.backgroundUrl}
                        onChange={(e) =>
                          setBrandingConfig((prev) => ({ ...prev, backgroundUrl: e.target.value }))
                        }
                        className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                        placeholder="https://example.com/background.jpg"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="welcome-message"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Welcome Message
                      </label>
                      <input
                        id="welcome-message"
                        type="text"
                        value={brandingConfig.welcomeMessage}
                        onChange={(e) =>
                          setBrandingConfig((prev) => ({ ...prev, welcomeMessage: e.target.value }))
                        }
                        className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="help-message"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Help Message
                      </label>
                      <input
                        id="help-message"
                        type="text"
                        value={brandingConfig.helpMessage}
                        onChange={(e) =>
                          setBrandingConfig((prev) => ({ ...prev, helpMessage: e.target.value }))
                        }
                        className="focus:border-primary-500 focus:ring-primary-500 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Logo Preview */}
                  {brandingConfig.logoUrl && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Logo Preview
                      </label>
                      <div className="rounded-md border bg-gray-50 p-4">
                        <img
                          src={brandingConfig.logoUrl}
                          alt="Logo Preview"
                          className="max-h-16 max-w-xs"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3 border-t pt-6">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
