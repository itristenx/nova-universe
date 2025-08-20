import React, { useEffect, useState } from 'react';
import { Monitor, Smartphone, Plus, RefreshCw, Settings, Trash2, Power, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  UnifiedDeviceService,
  type Device,
  type DeviceActivation,
  type NewDeviceData,
  type DeviceType,
  type KioskDevice,
  type NovaTV
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
    department: ''
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [deviceList, activationList] = await Promise.all([
        UnifiedDeviceService.getAllDevices(),
        UnifiedDeviceService.getActivations()
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
        department: ''
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
      setDevices(devices.map(d => (d.id === id ? updated : d)));
      toast.success(`Device ${active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update device status');
    }
  };

  const deleteDevice = async (id: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    try {
      await UnifiedDeviceService.deleteDevice(id);
      setDevices(devices.filter(d => d.id !== id));
      toast.success('Device deleted');
    } catch {
      toast.error('Failed to delete device');
    }
  };

  const revokeActivation = async (id: string) => {
    if (!confirm('Revoke this activation code?')) return;
    try {
      await UnifiedDeviceService.revokeActivation(id);
      setActivations(activations.filter(a => a.id !== id));
      toast.success('Activation code revoked');
    } catch {
      toast.error('Failed to revoke activation code');
    }
  };

  const filteredDevices = filterType === 'all' 
    ? devices 
    : devices.filter(d => d.type === filterType);

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'kiosk':
        return <Smartphone className="w-5 h-5" />;
      case 'nova-tv':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
          <p className="text-gray-600 mt-1">Manage all Nova devices including Kiosks and TVs</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowActivationModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Activation Code
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
            </div>
            <Monitor className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nova TVs</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter(d => d.type === 'nova-tv').length}
              </p>
            </div>
            <Monitor className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Kiosks</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter(d => d.type === 'kiosk').length}
              </p>
            </div>
            <Smartphone className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900">
                {devices.filter(d => d.status === 'online').length}
              </p>
            </div>
            <Power className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DeviceType | 'all')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filter devices by type"
          >
            <option value="all">All Devices</option>
            <option value="nova-tv">Nova TVs</option>
            <option value="kiosk">Kiosks</option>
          </select>
        </div>
      </div>

      {/* Devices List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Devices</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredDevices.map((device) => (
            <div key={device.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {getDeviceIcon(device.type)}
                </div>
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
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                      {device.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.connectionStatus)}`}>
                      {device.connectionStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleDeviceStatus(device.id, !device.active)}
                  className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                    device.active
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {device.active ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                  title="Device Settings"
                  aria-label="Device Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDevice(device.id)}
                  className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                  title="Delete Device"
                  aria-label="Delete Device"
                >
                  <Trash2 className="w-4 h-4" />
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
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Active Activation Codes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {activations.filter(a => !a.used).map((activation) => (
            <div key={activation.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <QrCode className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">{activation.deviceData.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{activation.deviceData.location}</span>
                    <span>•</span>
                    <span className="capitalize">{activation.type.replace('-', ' ')}</span>
                    <span>•</span>
                    <span>Code: {activation.code}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Expires: {new Date(activation.expiresAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => revokeActivation(activation.id)}
                className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
              >
                Revoke
              </button>
            </div>
          ))}
          {activations.filter(a => !a.used).length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No active activation codes.
            </div>
          )}
        </div>
      </div>

      {/* Activation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Generate Device Activation Code</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                <select
                  value={newDeviceData.type}
                  onChange={(e) => setNewDeviceData({ ...newDeviceData, type: e.target.value as DeviceType })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Select device type"
                >
                  <option value="nova-tv">Nova TV</option>
                  <option value="kiosk">Kiosk</option>
                </select>
              </div>
              
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Device Name"
                value={newDeviceData.name}
                onChange={(e) => setNewDeviceData({ ...newDeviceData, name: e.target.value })}
              />
              
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Location"
                value={newDeviceData.location}
                onChange={(e) => setNewDeviceData({ ...newDeviceData, location: e.target.value })}
              />
              
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Asset Tag"
                value={newDeviceData.assetTag}
                onChange={(e) => setNewDeviceData({ ...newDeviceData, assetTag: e.target.value })}
              />
              
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Serial Number"
                value={newDeviceData.serialNumber}
                onChange={(e) => setNewDeviceData({ ...newDeviceData, serialNumber: e.target.value })}
              />
              
              {newDeviceData.type === 'nova-tv' && (
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Department (optional)"
                  value={newDeviceData.department || ''}
                  onChange={(e) => setNewDeviceData({ ...newDeviceData, department: e.target.value })}
                />
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowActivationModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateActivationCode}
                disabled={generatingCode || !newDeviceData.name || !newDeviceData.location}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
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
