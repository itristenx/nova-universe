import React, { useState, useEffect } from 'react';
import { Button, Card, Modal } from '@/components/ui';
import { 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';

interface Passkey {
  id: string;
  name: string;
  credentialId: string;
  deviceType?: string;
  lastUsed?: string;
  createdAt: string;
}

interface PasskeyManagementProps {
  showTitle?: boolean;
}

export const PasskeyManagement: React.FC<PasskeyManagementProps> = ({ 
  showTitle = true 
}) => {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; passkey?: Passkey }>({ isOpen: false });
  const { addToast } = useToastStore();

  useEffect(() => {
    loadPasskeys();
  }, []);

  const loadPasskeys = async () => {
    try {
      setLoading(true);
      const data = await api.getPasskeys(); // TODO-LINT: move to async function
      setPasskeys(data);
    } catch (error) {
      console.error('Failed to load passkeys:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load passkeys'
      });
    } finally {
      setLoading(false);
    }
  };

  const registerPasskey = async () => {
    try {
      setRegistering(true);

      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported in this browser');
      }

      // Get registration options from server
      const options = await api.beginPasskeyRegistration({}); // TODO-LINT: move to async function

      // Convert base64url to ArrayBuffer for the challenge
      const challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      const userIdBuffer = Uint8Array.from(atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge,
          user: {
            ...options.user,
            id: userIdBuffer
          }
        }
      }) as PublicKeyCredential; // TODO-LINT: move to async function

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Prepare credential data for server
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialData = {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        response: {
          clientDataJSON: arrayBufferToBase64url(response.clientDataJSON),
          attestationObject: arrayBufferToBase64url(response.attestationObject)
        },
        type: credential.type,
        name: prompt('Enter a name for this passkey (e.g., "iPhone", "YubiKey")') || 'Unnamed Passkey'
      };

      // Register with server
      await api.completePasskeyRegistration(credentialData); // TODO-LINT: move to async function
      
      addToast({
        type: 'success',
        title: 'Passkey Registered',
        description: 'Your passkey has been successfully registered'
      });

      await loadPasskeys(); // TODO-LINT: move to async function
    } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
      console.error('Failed to register passkey:', error);
      addToast({
        type: 'error',
        title: 'Registration Failed',
        description: error.message || 'Failed to register passkey'
      });
    } finally {
      setRegistering(false);
    }
  };

  const deletePasskey = async (passkey: Passkey) => {
    try {
      await api.deletePasskey(passkey.id); // TODO-LINT: move to async function
      
      addToast({
        type: 'success',
        title: 'Passkey Deleted',
        description: 'The passkey has been removed from your account'
      });

      await loadPasskeys(); // TODO-LINT: move to async function
      setDeleteModal({ isOpen: false });
    } catch (error) {
      console.error('Failed to delete passkey:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete passkey'
      });
    }
  };

  const arrayBufferToBase64url = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const getDeviceIcon = (deviceType?: string) => {
    if (deviceType?.includes('mobile') || deviceType?.includes('phone')) {
      return DevicePhoneMobileIcon;
    }
    return ComputerDesktopIcon;
  };

  const formatLastUsed = (date?: string) => {
    if (!date) return 'Never';
    const lastUsed = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - lastUsed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return lastUsed.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Passkey Management</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your passkeys for secure, passwordless authentication
          </p>
        </div>
      )}

      {/* WebAuthn Support Check */}
      {!window.PublicKeyCredential && (
        <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                WebAuthn Not Supported
              </h3>
              <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                <p>Your browser does not support WebAuthn. Please use a modern browser like Chrome, Firefox, Safari, or Edge to use passkeys.</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add Passkey Button */}
      {window.PublicKeyCredential && (
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Your Passkeys</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {passkeys.length === 0 ? 'No passkeys configured' : `${passkeys.length} passkey${passkeys.length === 1 ? '' : 's'} configured`}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={registerPasskey}
            disabled={registering}
            isLoading={registering}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Passkey
          </Button>
        </div>
      )}

      {/* Passkeys List */}
      {passkeys.length > 0 && (
        <div className="space-y-3">
          {passkeys.map((passkey) => {
            const DeviceIcon = getDeviceIcon(passkey.deviceType);
            return (
              <Card key={passkey.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                        <DeviceIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {passkey.name}
                      </h4>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Created {new Date(passkey.createdAt).toLocaleDateString()}</span>
                        <span>Last used {formatLastUsed(passkey.lastUsed)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setDeleteModal({ isOpen: true, passkey })}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex">
          <CheckCircleIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              About Passkeys
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul className="space-y-1">
                <li>• Passkeys provide secure, passwordless authentication</li>
                <li>• Works with Face ID, Touch ID, Windows Hello, or security keys</li>
                <li>• More secure than passwords and resistant to phishing</li>
                <li>• Can be used for admin login and kiosk authentication</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        title="Delete Passkey"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the passkey "{deleteModal.passkey?.name}"? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteModal.passkey && deletePasskey(deleteModal.passkey)}
            >
              Delete Passkey
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
