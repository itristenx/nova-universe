import React, { useState, useEffect } from 'react';
import { Button, Card, Modal } from '@/components/ui';
import { 
  ComputerDesktopIcon, 
  TrashIcon, 
  PowerIcon,
  QrCodeIcon,
  CogIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { Kiosk, KioskActivation } from '@/types';

export const KiosksPage: React.FC = () => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKiosk, setSelectedKiosk] = useState<Kiosk | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationData, setActivationData] = useState<KioskActivation | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    loadKiosks();
  }, []);

  const loadKiosks = async () => {
    try {
      setLoading(true);
      const data = await api.getKiosks();
      setKiosks(data);
    } catch (error) {
      console.error('Failed to load kiosks:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load kiosks',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleKioskActive = async (id: string, active: boolean) => {
    try {
      if (active) {
        await api.deactivateKiosk(id);
      } else {
        await api.activateKiosk(id);
      }
      setKiosks(kiosks.map(k => k.id === id ? { ...k, active: !active } : k));
      addToast({
        type: 'success',
        title: 'Success',
        description: `Kiosk ${!active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Failed to toggle kiosk:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to toggle kiosk status',
      });
    }
  };

  const deleteKiosk = async (id: string) => {
    if (confirm('Are you sure you want to delete this kiosk?')) {
      try {
        await api.deleteKiosk(id);
        setKiosks(kiosks.filter(k => k.id !== id));
        addToast({
          type: 'success',
          title: 'Success',
          description: 'Kiosk deleted successfully',
        });
      } catch (error) {
        console.error('Failed to delete kiosk:', error);
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to delete kiosk',
        });
      }
    }
  };

  const generateActivationCode = async () => {
    try {
      setGeneratingCode(true);
      const activation = await api.generateKioskActivation();
      setActivationData(activation);
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Activation code generated successfully',
      });
    } catch (error) {
      console.error('Failed to generate activation code:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to generate activation code',
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast({
        type: 'success',
        title: 'Copied',
        description: 'Activation code copied to clipboard',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to copy to clipboard',
      });
    }
  };

  const openActivationModal = () => {
    setShowActivationModal(true);
    setActivationData(null);
  };

  const closeActivationModal = () => {
    setShowActivationModal(false);
    setActivationData(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kiosk Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage your deployed kiosks
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openActivationModal}
        >
          <QrCodeIcon className="h-4 w-4 mr-2" />
          Generate Activation Code
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-500">
              <ComputerDesktopIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Kiosks</p>
              <p className="text-2xl font-semibold text-gray-900">{kiosks.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-500">
              <PowerIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Kiosks</p>
              <p className="text-2xl font-semibold text-gray-900">
                {kiosks.filter(k => k.active).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-500">
              <CogIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online Now</p>
              <p className="text-2xl font-semibold text-gray-900">
                {kiosks.filter(k => {
                  const lastSeen = new Date(k.lastSeen);
                  const now = new Date();
                  const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
                  return diffMinutes < 5; // Consider online if seen within 5 minutes
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Kiosks Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : kiosks.length === 0 ? (
          <div className="text-center py-12">
            <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No kiosks registered</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate an activation code to register your first kiosk.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={openActivationModal}
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                Generate Activation Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kiosk ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kiosks.map((kiosk) => (
                  <tr key={kiosk.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ComputerDesktopIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{kiosk.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        kiosk.active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {kiosk.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(kiosk.currentStatus)}`}>
                        {kiosk.currentStatus || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {kiosk.version || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(kiosk.lastSeen)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKioskActive(kiosk.id, kiosk.active)}
                        className={kiosk.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                      >
                        <PowerIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedKiosk(kiosk)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <CogIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteKiosk(kiosk.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Activation Modal */}
      <Modal
        isOpen={showActivationModal}
        onClose={closeActivationModal}
        title="Generate Kiosk Activation Code"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Generate a QR code and activation code for new kiosk registration. 
              The kiosk administrator can scan the QR code or enter the activation code manually.
            </p>
          </div>

          {!activationData ? (
            <div className="text-center py-8">
              <QrCodeIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Generate Activation Code
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Click the button below to generate a new kiosk activation code and QR code.
              </p>
              <Button
                variant="primary"
                onClick={generateActivationCode}
                isLoading={generatingCode}
                className="px-8"
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                Generate Activation Code
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 bg-white border-2 border-gray-200 rounded-lg inline-block">
                  <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                    <div className="text-center">
                      <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">QR Code</p>
                      <p className="text-xs text-gray-400">{activationData.code}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Scan this QR code with the kiosk app to activate
                </p>
              </div>

              {/* Activation Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activation Code
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <code className="text-lg font-mono text-gray-900">
                      {activationData.code}
                    </code>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(activationData.code)}
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Manually enter this code in the kiosk activation screen
                </p>
              </div>

              {/* Activation URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Data
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <code className="text-sm font-mono text-gray-900 break-all">
                      {activationData.qrCode}
                    </code>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(activationData.qrCode)}
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  QR code data for manual entry
                </p>
              </div>

              {/* Expiration */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Activation Code Expires
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>This activation code will expire on {new Date(activationData.expiresAt).toLocaleString()}.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate New Code */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={generateActivationCode}
                  isLoading={generatingCode}
                  className="w-full"
                >
                  Generate New Code
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={closeActivationModal}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Kiosk Configuration Modal */}
      <Modal
        isOpen={!!selectedKiosk}
        onClose={() => setSelectedKiosk(null)}
        title={`Configure Kiosk ${selectedKiosk?.id}`}
        size="lg"
      >
        {selectedKiosk && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kiosk ID
                </label>
                <p className="text-sm text-gray-900">{selectedKiosk.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  selectedKiosk.active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {selectedKiosk.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current State
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedKiosk.currentStatus)}`}>
                  {selectedKiosk.currentStatus || 'Unknown'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <p className="text-sm text-gray-900">{selectedKiosk.version || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Seen
                </label>
                <p className="text-sm text-gray-900">{formatDate(selectedKiosk.lastSeen)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Enabled
                </label>
                <p className="text-sm text-gray-900">{selectedKiosk.statusEnabled ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Actions</h4>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedKiosk.active ? "secondary" : "primary"}
                  onClick={() => toggleKioskActive(selectedKiosk.id, selectedKiosk.active)}
                >
                  <PowerIcon className="h-4 w-4 mr-2" />
                  {selectedKiosk.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    // Refresh kiosk status
                    loadKiosks();
                  }}
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Advanced Configuration
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Advanced kiosk configuration features including remote updates, branding customization, and detailed monitoring will be available here.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="secondary" onClick={() => setSelectedKiosk(null)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};
