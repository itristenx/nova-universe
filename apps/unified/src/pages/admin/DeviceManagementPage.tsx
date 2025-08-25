import React, { useEffect, useState } from 'react';
import {
  Monitor,
  Smartphone,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  Power,
  QrCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  UnifiedDeviceService,
  type Device,
  type DeviceActivation,
  type NewDeviceData,
  type DeviceType,
  type KioskDevice,
  type NovaTV,
} from '../../services/unified-device';

const DeviceManagementPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [activations, setActivations] = useState<DeviceActivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType>('nova-tv');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [filterType, setFilterType] = useState<DeviceType | 'all'>('all');
  const [newDeviceData, setNewDeviceData] = useState<NewDeviceData>({
    name: '',
    location: '',
    assetTag: '',
    serialNumber: '',
    type: 'nova-tv',
    department: '',
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [deviceList, activationList] = await Promise.all([
        UnifiedDeviceService.getAllDevices(),
        UnifiedDeviceService.getActivations(),
      ]);
      setDevices(deviceList);
      setActivations(activationList);
    } catch {
      toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const generateActivationCode = async () => {
    setGeneratingCode(true);
    try {
      const activation = await UnifiedDeviceService.generateActivationCode(newDeviceData);
      setActivations([activation, ...activations]);
      setShowActivationModal(false);
      setNewDeviceData({
        name: '',
        location: '',
        assetTag: '',
        serialNumber: '',
        type: 'nova-tv',
        department: '',
      });
      toast.success('Activation code generated successfully');
    } catch {
      toast.error('Failed to generate activation code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const toggleDeviceStatus = async (id: string, active: boolean) => {
    try {
      const updated = await UnifiedDeviceService.updateDeviceStatus(id, active);
      setDevices(devices.map((d) => (d.id === id ? updated : d)));
      toast.success(`Device ${active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update device status');
    }
  };

  const deleteDevice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    try {
      await UnifiedDeviceService.deleteDevice(id);
      setDevices(devices.filter((d) => d.id !== id));
      toast.success('Device deleted');
    } catch {
      toast.error('Failed to delete device');
    }
  };

  const revokeActivation = async (id: string) => {
    if (!confirm('Revoke this activation code?')) return;
    try {
      await UnifiedDeviceService.revokeActivation(id);
      setActivations(activations.filter((a) => a.id !== id));
      toast.success('Activation code revoked');
    } catch {
      toast.error('Failed to revoke activation code');
    }
  };

  const filteredDevices =
    filterType === 'all' ? devices : devices.filter((d) => d.type === filterType);

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'kiosk':
        return <Smartphone className="h-5 w-5" />;
      case 'nova-tv':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'offline':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending_activation':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
          <p className="mt-1 text-gray-600">Manage all Nova devices including Kiosks and TVs</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowActivationModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Generate Activation Code
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
            </div>
            <Monitor className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nova TVs</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter((d) => d.type === 'nova-tv').length}
              </p>
            </div>
            <Monitor className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kiosks</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter((d) => d.type === 'kiosk').length}
              </p>
            </div>
            <Smartphone className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter((d) => d.status === 'online').length}
              </p>
            </div>
            <Power className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DeviceType | 'all')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            aria-label="Filter devices by type"
          >
            <option value="all">All Devices</option>
            <option value="nova-tv">Nova TVs</option>
            <option value="kiosk">Kiosks</option>
          </select>
        </div>
      </div>

      {/* Devices List */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Devices</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredDevices.map((device) => (
            <div key={device.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">{getDeviceIcon(device.type)}</div>
                <div>
                  <h3 className="font-medium text-gray-900">{device.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{device.location}</span>
                    <span>•</span>
                    <span className="capitalize">{device.type.replace('-', ' ')}</span>
                    <span>•</span>
                    <span>{device.assetTag}</span>
                    {device.type === 'nova-tv' && (device as NovaTV).department && (
                      <>
                        <span>•</span>
                        <span>{(device as NovaTV).department}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(device.status)}`}
                    >
                      {device.status.replace('_', ' ')}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(device.connectionStatus)}`}
                    >
                      {device.connectionStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleDeviceStatus(device.id, !device.active)}
                  className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                    device.active
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {device.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="rounded-lg px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50"
                  title="Device Settings"
                  aria-label="Device Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteDevice(device.id)}
                  className="rounded-lg px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
                  title="Delete Device"
                  aria-label="Delete Device"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredDevices.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No devices found. Generate an activation code to add a new device.
            </div>
          )}
        </div>
      </div>

      {/* Activation Codes */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Active Activation Codes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {activations
            .filter((a) => !a.used)
            .map((activation) => (
              <div key={activation.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <QrCode className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">{activation.deviceData.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{activation.deviceData.location}</span>
                      <span>•</span>
                      <span className="capitalize">{activation.type.replace('-', ' ')}</span>
                      <span>•</span>
                      <span>Code: {activation.code}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Expires: {new Date(activation.expiresAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => revokeActivation(activation.id)}
                  className="rounded-lg px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  Revoke
                </button>
              </div>
            ))}
          {activations.filter((a) => !a.used).length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">No active activation codes.</div>
          )}
        </div>
      </div>

      {/* Activation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Generate Device Activation Code
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Device Type</label>
                <select
                  value={newDeviceData.type}
                  onChange={(e) =>
                    setNewDeviceData({ ...newDeviceData, type: e.target.value as DeviceType })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  aria-label="Select device type"
                >
                  <option value="nova-tv">Nova TV</option>
                  <option value="kiosk">Kiosk</option>
                </select>
              </div>

              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Device Name"
                value={newDeviceData.name}
                onChange={(e) => setNewDeviceData({ ...newDeviceData, name: e.target.value })}
              />

              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Location"
                value={newDeviceData.location}
                onChange={(e) => setNewDeviceData({ ...newDeviceData, location: e.target.value })}
              />

              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Asset Tag"
                value={newDeviceData.assetTag}
                onChange={(e) => setNewDeviceData({ ...newDeviceData, assetTag: e.target.value })}
              />

              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Serial Number"
                value={newDeviceData.serialNumber}
                onChange={(e) =>
                  setNewDeviceData({ ...newDeviceData, serialNumber: e.target.value })
                }
              />

              {newDeviceData.type === 'nova-tv' && (
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Department (optional)"
                  value={newDeviceData.department || ''}
                  onChange={(e) =>
                    setNewDeviceData({ ...newDeviceData, department: e.target.value })
                  }
                />
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowActivationModal(false)}
                className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={generateActivationCode}
                disabled={generatingCode || !newDeviceData.name || !newDeviceData.location}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
              >
                {generatingCode ? 'Generating...' : 'Generate Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagementPage;
