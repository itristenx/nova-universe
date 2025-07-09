import React, { useState, useEffect } from 'react';
import { Button, Card, Modal } from '@/components/ui';
import { ScheduleManager } from '@/components/ScheduleManager';
import { KioskConfigurationModal } from '@/components/KioskConfigurationModal';
import { 
  GlobeAltIcon,
  CogIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { 
  GlobalConfiguration, 
  ConfigurationSummary, 
  Kiosk, 
  ScheduleConfig, 
  OfficeHours,
  ConfigScope 
} from '@/types';

export const ConfigurationPage: React.FC = () => {
  const [globalConfig, setGlobalConfig] = useState<GlobalConfiguration | null>(null);
  const [configSummary, setConfigSummary] = useState<ConfigurationSummary | null>(null);
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [showKioskConfigModal, setShowKioskConfigModal] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [globalData, summaryData, kiosksData] = await Promise.all([
        api.getGlobalConfiguration(),
        api.getConfigurationSummary(),
        api.getKiosks()
      ]);
      
      setGlobalConfig(globalData);
      setConfigSummary(summaryData);
      setKiosks(kiosksData);
    } catch (error) {
      console.error('Failed to load configuration data:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load configuration data',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGlobalConfig = async (updates: Partial<GlobalConfiguration>) => {
    try {
      await api.updateGlobalConfiguration(updates);
      setGlobalConfig(prev => prev ? { ...prev, ...updates } : null);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Global configuration updated successfully',
      });
      loadData(); // Reload to get updated summary
    } catch (error) {
      console.error('Failed to update global configuration:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update global configuration',
      });
      throw error;
    }
  };

  const toggleKioskScope = async (kioskId: string, newScope: ConfigScope) => {
    try {
      await api.setKioskConfigScope(kioskId, newScope);
      await loadData();
      addToast({
        type: 'success',
        title: 'Success',
        description: `Kiosk ${kioskId} set to ${newScope} management`,
      });
    } catch (error) {
      console.error('Failed to update kiosk scope:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update kiosk management scope',
      });
    }
  };

  const resetAllToGlobal = async () => {
    try {
      await api.resetAllKiosksToGlobal();
      await loadData();
      setShowResetModal(false);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'All kiosks reset to global configuration',
      });
    } catch (error) {
      console.error('Failed to reset kiosks to global:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to reset kiosks to global configuration',
      });
    }
  };

  const openKioskConfig = (kiosk: Kiosk) => {
    setSelectedKiosk(kiosk);
    setShowKioskConfigModal(true);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'global-status', name: 'Global Status', icon: GlobeAltIcon },
    { id: 'global-schedule', name: 'Global Schedule', icon: CogIcon },
    { id: 'kiosks', name: 'Individual Kiosks', icon: ComputerDesktopIcon },
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage global settings and individual kiosk configurations
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowResetModal(true)}
            className="text-orange-600 hover:text-orange-700"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Reset All to Global
          </Button>
          <Button onClick={loadData}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Configuration Summary */}
      {configSummary && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{configSummary.totalKiosks}</div>
              <div className="text-sm text-gray-600">Total Kiosks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{configSummary.globallyManaged}</div>
              <div className="text-sm text-gray-600">Globally Managed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{configSummary.individuallyManaged}</div>
              <div className="text-sm text-gray-600">Individually Managed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(configSummary.overridesByType).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Overrides</div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                activeTab === tab.id ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Override Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Override Summary</h3>
              <div className="space-y-3">
                {configSummary && Object.entries(configSummary.overridesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {count} override{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  onClick={() => api.applyGlobalConfigToAll('status')}
                  className="w-full"
                >
                  Apply Global Status to All
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => api.applyGlobalConfigToAll('schedule')}
                  className="w-full"
                >
                  Apply Global Schedule to All
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => api.applyGlobalConfigToAll('branding')}
                  className="w-full"
                >
                  Apply Global Branding to All
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'global-status' && globalConfig && (
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Global Status Configuration</h3>
            <div className="space-y-6">
              {/* Status Enable/Disable */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="global-status-enabled"
                  checked={globalConfig.defaultStatus.enabled}
                  onChange={(e) => updateGlobalConfig({
                    defaultStatus: {
                      ...globalConfig.defaultStatus,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="global-status-enabled" className="text-sm font-medium text-gray-700">
                  Enable status system globally
                </label>
              </div>

              {/* Current Global Status */}
              <div>
                <label htmlFor="global-current-status" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Global Status
                </label>
                <select
                  id="global-current-status"
                  value={globalConfig.defaultStatus.currentStatus}
                  onChange={(e) => updateGlobalConfig({
                    defaultStatus: {
                      ...globalConfig.defaultStatus,
                      currentStatus: e.target.value as any
                    }
                  })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="meeting">In a Meeting</option>
                  <option value="brb">Be Right Back</option>
                  <option value="lunch">Out to Lunch</option>
                </select>
              </div>

              {/* Status Messages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="global-open-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Open Message
                  </label>
                  <input
                    id="global-open-message"
                    type="text"
                    value={globalConfig.defaultStatus.messages.openMessage}
                    onChange={(e) => updateGlobalConfig({
                      defaultStatus: {
                        ...globalConfig.defaultStatus,
                        messages: {
                          ...globalConfig.defaultStatus.messages,
                          openMessage: e.target.value
                        }
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="global-closed-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Closed Message
                  </label>
                  <input
                    id="global-closed-message"
                    type="text"
                    value={globalConfig.defaultStatus.messages.closedMessage}
                    onChange={(e) => updateGlobalConfig({
                      defaultStatus: {
                        ...globalConfig.defaultStatus,
                        messages: {
                          ...globalConfig.defaultStatus.messages,
                          closedMessage: e.target.value
                        }
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="global-meeting-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Message
                  </label>
                  <input
                    id="global-meeting-message"
                    type="text"
                    value={globalConfig.defaultStatus.messages.meetingMessage}
                    onChange={(e) => updateGlobalConfig({
                      defaultStatus: {
                        ...globalConfig.defaultStatus,
                        messages: {
                          ...globalConfig.defaultStatus.messages,
                          meetingMessage: e.target.value
                        }
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="global-brb-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Be Right Back Message
                  </label>
                  <input
                    id="global-brb-message"
                    type="text"
                    value={globalConfig.defaultStatus.messages.brbMessage}
                    onChange={(e) => updateGlobalConfig({
                      defaultStatus: {
                        ...globalConfig.defaultStatus,
                        messages: {
                          ...globalConfig.defaultStatus.messages,
                          brbMessage: e.target.value
                        }
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="global-lunch-message" className="block text-sm font-medium text-gray-700 mb-2">
                    Out to Lunch Message
                  </label>
                  <input
                    id="global-lunch-message"
                    type="text"
                    value={globalConfig.defaultStatus.messages.lunchMessage}
                    onChange={(e) => updateGlobalConfig({
                      defaultStatus: {
                        ...globalConfig.defaultStatus,
                        messages: {
                          ...globalConfig.defaultStatus.messages,
                          lunchMessage: e.target.value
                        }
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'global-schedule' && globalConfig && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Global Schedule Configuration</h3>
              <ScheduleManager
                title="Global Automatic Schedule"
                config={globalConfig.defaultSchedule}
                onSave={(newSchedule: ScheduleConfig) => updateGlobalConfig({ defaultSchedule: newSchedule })}
                showEnabled={true}
              />
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Global Office Hours Configuration</h3>
              <ScheduleManager
                title="Global Office Hours"
                config={globalConfig.defaultOfficeHours}
                onSave={(newOfficeHours: OfficeHours) => updateGlobalConfig({ defaultOfficeHours: newOfficeHours })}
                showEnabled={true}
                showTitle={true}
                showNextOpen={true}
              />
            </Card>
          </div>
        )}

        {activeTab === 'kiosks' && (
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Individual Kiosk Management</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kiosk ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Management Mode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overrides
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kiosks.map((kiosk) => (
                    <tr key={kiosk.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {kiosk.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            kiosk.configScope === 'global' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {kiosk.configScope === 'global' ? 'Global' : 'Individual'}
                          </span>
                          <button
                            onClick={() => toggleKioskScope(
                              kiosk.id, 
                              kiosk.configScope === 'global' ? 'individual' : 'global'
                            )}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Switch
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kiosk.hasOverrides ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {kiosk.overrideCount} override{kiosk.overrideCount !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          kiosk.effectiveConfig.currentStatus === 'open' ? 'bg-green-100 text-green-800' :
                          kiosk.effectiveConfig.currentStatus === 'closed' ? 'bg-red-100 text-red-800' :
                          kiosk.effectiveConfig.currentStatus === 'meeting' ? 'bg-purple-100 text-purple-800' :
                          kiosk.effectiveConfig.currentStatus === 'brb' ? 'bg-yellow-100 text-yellow-800' :
                          kiosk.effectiveConfig.currentStatus === 'lunch' ? 'bg-orange-100 text-orange-800' :
                          kiosk.effectiveConfig.currentStatus === 'unavailable' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {kiosk.effectiveConfig.currentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openKioskConfig(kiosk)}
                        >
                          Configure
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Reset All Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Kiosks to Global Configuration"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900">
                This action will reset all kiosks to use global configuration settings, 
                removing all individual overrides.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={resetAllToGlobal}>
            Reset All Kiosks
          </Button>
        </div>
      </Modal>

      {/* Individual Kiosk Configuration Modal */}
      {selectedKiosk && globalConfig && (
        <KioskConfigurationModal
          isOpen={showKioskConfigModal}
          onClose={() => setShowKioskConfigModal(false)}
          kiosk={selectedKiosk}
          globalConfig={globalConfig}
          onUpdate={loadData}
        />
      )}
    </div>
  );
};
