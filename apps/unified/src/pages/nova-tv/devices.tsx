import React, { useState, useEffect } from 'react';
import { Monitor, Wifi, WifiOff, Activity, MapPin, Calendar, MoreVertical } from 'lucide-react';
import { novaTVService, Device } from '../../services/nova-tv';

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadDevices();
  }, [selectedStatus]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const filters = selectedStatus !== 'all' ? { connectionStatus: selectedStatus } : {};
      const data = await novaTVService.getDevices(filters);
      setDevices(data);
    } catch (_error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeDevice = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke access for "${name}"?`)) {
      try {
        await novaTVService.revokeDevice(id);
        loadDevices();
      } catch (_error) {
        console.error('Error revoking device:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <Activity className="h-4 w-4 text-red-600" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['all', 'connected', 'disconnected', 'error'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
            <p className="mt-1 text-gray-600">Monitor and manage Nova TV devices</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            Register New Device
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
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
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-green-600">
                {devices.filter((d) => d.connectionStatus === 'connected').length}
              </p>
            </div>
            <Wifi className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disconnected</p>
              <p className="text-2xl font-bold text-gray-600">
                {devices.filter((d) => d.connectionStatus === 'disconnected').length}
              </p>
            </div>
            <WifiOff className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {devices.filter((d) => d.connectionStatus === 'error').length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by connection status"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'all'
                  ? 'All Statuses'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Device List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Dashboard
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Monitor className="mr-3 h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{device.name}</div>
                          <div className="text-sm text-gray-500">
                            {device.ipAddress || 'IP not available'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(device.connectionStatus)}
                        <span
                          className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(device.connectionStatus)}`}
                        >
                          {device.connectionStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {device.location ? (
                          <>
                            <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                            {device.location}
                          </>
                        ) : (
                          <span className="text-gray-500">Not specified</span>
                        )}
                      </div>
                      {device.department && (
                        <div className="text-sm text-gray-500">{device.department}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {device.dashboardId ? (
                        <span className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          Dashboard #{device.dashboardId.slice(0, 8)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {device.lastActiveAt ? (
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(device.lastActiveAt).toLocaleDateString()}
                        </div>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-blue-600 transition-colors hover:text-blue-900"
                          title="View device details"
                          aria-label="View device details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => revokeDevice(device.id, device.name)}
                          className="text-red-600 transition-colors hover:text-red-900"
                          title="Revoke device access"
                          aria-label="Revoke device access"
                        >
                          Revoke
                        </button>
                        <button
                          className="text-gray-600 transition-colors hover:text-gray-900"
                          title="More options"
                          aria-label="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {devices.length === 0 && (
            <div className="py-12 text-center">
              <Monitor className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">No devices found</h3>
              <p className="mb-4 text-gray-600">
                {selectedStatus !== 'all'
                  ? `No devices with ${selectedStatus} status.`
                  : 'No Nova TV devices have been registered yet.'}
              </p>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                Register First Device
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceManagement;
