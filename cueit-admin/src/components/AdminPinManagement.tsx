import React, { useState } from 'react';
import { Button, Card, Modal, Input } from '@/components/ui';
import { 
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { Kiosk } from '@/types';

interface AdminPinManagementProps {
  kiosks: Kiosk[];
  onUpdate: () => void;
}

interface PinConfig {
  globalPin: string;
  kioskPins: { [kioskId: string]: string };
}

interface PinValidation {
  isValid: boolean;
  message: string;
}

export const AdminPinManagement: React.FC<AdminPinManagementProps> = ({
  kiosks,
  onUpdate
}) => {
  const [pinConfig, setPinConfig] = useState<PinConfig>({
    globalPin: '',
    kioskPins: {}
  });
  const [showPins, setShowPins] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPinValue, setTestPinValue] = useState('');
  const [testKioskId, setTestKioskId] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const { addToast } = useToastStore();

  const validatePin = (pin: string, context?: { type: 'global' | 'kiosk'; kioskId?: string }): PinValidation => {
    if (pin.length === 0) {
      return { isValid: true, message: '' };
    }
    
    if (pin.length !== 6) {
      return { isValid: false, message: 'PIN must be exactly 6 digits' };
    }
    
    if (!/^\d{6}$/.test(pin)) {
      return { isValid: false, message: 'PIN must contain only numbers' };
    }
    
    // Check for duplicates
    if (context) {
      const { globalPin, kioskPins } = pinConfig;
      
      if (context.type === 'global') {
        // Check if global PIN conflicts with any kiosk PIN
        for (const [kioskId, kioskPin] of Object.entries(kioskPins)) {
          if (kioskPin === pin) {
            return { isValid: false, message: `PIN conflicts with kiosk ${kioskId}` };
          }
        }
      } else if (context.type === 'kiosk' && context.kioskId) {
        // Check if kiosk PIN conflicts with global PIN
        if (globalPin === pin) {
          return { isValid: false, message: 'PIN conflicts with global PIN' };
        }
        
        // Check if kiosk PIN conflicts with other kiosk PINs
        for (const [otherKioskId, otherPin] of Object.entries(kioskPins)) {
          if (otherKioskId !== context.kioskId && otherPin === pin) {
            return { isValid: false, message: `PIN conflicts with kiosk ${otherKioskId}` };
          }
        }
      }
    }
    
    return { isValid: true, message: 'Valid PIN format' };
  };

  const updateGlobalPin = (pin: string) => {
    setPinConfig(prev => ({ ...prev, globalPin: pin }));
  };

  const updateKioskPin = (kioskId: string, pin: string) => {
    setPinConfig(prev => ({
      ...prev,
      kioskPins: {
        ...prev.kioskPins,
        [kioskId]: pin
      }
    }));
  };

  const removeKioskPin = (kioskId: string) => {
    setPinConfig(prev => {
      const newKioskPins = { ...prev.kioskPins };
      delete newKioskPins[kioskId];
      return { ...prev, kioskPins: newKioskPins };
    });
  };

  const toggleShowPin = (key: string) => {
    setShowPins(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const savePinConfiguration = async () => {
    try {
      setLoading(true);
      
      // Validate all PINs
      const globalValidation = validatePin(pinConfig.globalPin, { type: 'global' });
      if (!globalValidation.isValid) {
        throw new Error(`Global PIN: ${globalValidation.message}`);
      }
      
      for (const [kioskId, pin] of Object.entries(pinConfig.kioskPins)) {
        const validation = validatePin(pin, { type: 'kiosk', kioskId });
        if (!validation.isValid) {
          throw new Error(`Kiosk ${kioskId} PIN: ${validation.message}`);
        }
      }
      
      await api.updateAdminPins({
        globalPin: pinConfig.globalPin || undefined,
        kioskPins: Object.keys(pinConfig.kioskPins).length > 0 ? pinConfig.kioskPins : undefined
      });
      
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Admin PINs updated successfully',
      });
      
      onUpdate();
    } catch (error) {
      console.error('Failed to update admin PINs:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update admin PINs',
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePinInput = async () => {
    try {
      setLoading(true);
      const result = await api.validateAdminPin(testPinValue, testKioskId || undefined);
      setTestResult(result);
    } catch (error) {
      console.error('Failed to test PIN:', error);
      setTestResult({
        valid: false,
        permissions: [],
        expiresAt: '',
        error: 'Failed to validate PIN'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPin = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <KeyIcon className="h-6 w-6 text-primary-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Admin PIN Management</h3>
              <p className="text-sm text-gray-600">Configure PINs for offline admin access on kiosks</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowTestModal(true)}
            >
              Test PIN
            </Button>
            <Button
              onClick={savePinConfiguration}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Global PIN */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                <h4 className="text-md font-medium text-gray-900">Global Admin PIN</h4>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateGlobalPin(generateRandomPin())}
              >
                Generate Random
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    label="Global PIN (6 digits)"
                    type={showPins.global ? "text" : "password"}
                    value={pinConfig.globalPin}
                    onChange={(e) => updateGlobalPin(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleShowPin('global')}
                  className="mt-6"
                >
                  {showPins.global ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
              
              {pinConfig.globalPin && (
                <div className="text-sm">
                  {validatePin(pinConfig.globalPin, { type: 'global' }).isValid ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Valid PIN format
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {validatePin(pinConfig.globalPin, { type: 'global' }).message}
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-gray-600">
                The global PIN works on all kiosks and provides full admin permissions including user management.
              </p>
            </div>
          </div>

          {/* Kiosk-Specific PINs */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ComputerDesktopIcon className="h-5 w-5 text-orange-600" />
                <h4 className="text-md font-medium text-gray-900">Kiosk-Specific PINs</h4>
              </div>
            </div>
            
            <div className="space-y-4">
              {kiosks.length === 0 ? (
                <div className="bg-gray-50 rounded-md p-6 text-center">
                  <ComputerDesktopIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-sm font-medium text-gray-900 mb-2">No Kiosks Available</h4>
                  <p className="text-sm text-gray-500">
                    No kiosks are currently registered in the system. Kiosk-specific PINs will be available once kiosks are added.
                  </p>
                </div>
              ) : (
                kiosks.map((kiosk) => (
                  <div key={kiosk.id} className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{kiosk.id}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          kiosk.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {kiosk.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateKioskPin(kiosk.id, generateRandomPin())}
                        >
                          Generate
                        </Button>
                        {pinConfig.kioskPins[kiosk.id] && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => removeKioskPin(kiosk.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          label={`PIN for ${kiosk.id}`}
                          type={showPins[kiosk.id] ? "text" : "password"}
                          value={pinConfig.kioskPins[kiosk.id] || ''}
                          onChange={(e) => updateKioskPin(kiosk.id, e.target.value)}
                          placeholder="Leave empty for global PIN only"
                          maxLength={6}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleShowPin(kiosk.id)}
                        className="mt-6"
                      >
                        {showPins[kiosk.id] ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {pinConfig.kioskPins[kiosk.id] && (
                      <div className="mt-2 text-sm">
                        {validatePin(pinConfig.kioskPins[kiosk.id], { type: 'kiosk', kioskId: kiosk.id }).isValid ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Valid PIN format
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            {validatePin(pinConfig.kioskPins[kiosk.id], { type: 'kiosk', kioskId: kiosk.id }).message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
              
              <p className="text-sm text-gray-600">
                Kiosk-specific PINs provide limited admin permissions (status, schedule, branding) for that specific kiosk only.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* PIN Testing Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setTestPinValue('');
          setTestKioskId('');
          setTestResult(null);
        }}
        title="Test Admin PIN"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <Input
              label="PIN to Test"
              type="text"
              value={testPinValue}
              onChange={(e) => setTestPinValue(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Context (Optional)
            </label>
            <select
              value={testKioskId}
              onChange={(e) => setTestKioskId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              title="Select kiosk for testing context"
            >
              <option value="">Global Context</option>
              {kiosks.map((kiosk) => (
                <option key={kiosk.id} value={kiosk.id}>
                  {kiosk.id}
                </option>
              ))}
            </select>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded-md ${testResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center space-x-2 mb-2">
                {testResult.valid ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${testResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.valid ? 'PIN Valid' : 'PIN Invalid'}
                </span>
              </div>
              
              {testResult.valid && (
                <div className="text-sm space-y-1">
                  <div><strong>PIN Type:</strong> {testResult.pinType || 'Unknown'}</div>
                  <div><strong>Permissions:</strong> {testResult.permissions.join(', ')}</div>
                  <div><strong>Expires:</strong> {new Date(testResult.expiresAt).toLocaleString()}</div>
                </div>
              )}
              
              {testResult.error && (
                <div className="text-sm text-red-800">
                  <strong>Error:</strong> {testResult.error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowTestModal(false);
              setTestPinValue('');
              setTestKioskId('');
              setTestResult(null);
            }}
          >
            Close
          </Button>
          <Button
            onClick={validatePinInput}
            disabled={testPinValue.length !== 6 || loading}
          >
            {loading ? 'Testing...' : 'Test PIN'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
