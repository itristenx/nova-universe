import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Monitor, CheckCircle, AlertCircle, Settings, Tv, QrCode, RefreshCw } from 'lucide-react';
import { novaTVService, Dashboard } from '../../services/nova-tv';
import { UnifiedDeviceService } from '../../services/unified-device';
import { useAuthStore } from '../../stores/auth';
import toast from 'react-hot-toast';

const AdminTVActivation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  const [deviceId, setDeviceId] = useState<string>('');
  const [screenSize, setScreenSize] = useState<string>('');
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState<'scan' | 'generate'>('scan'); // scan QR or generate activation code

  // If auth is still loading, show loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `/auth/login?return=${returnUrl}`;
    return null;
  }

  useEffect(() => {
    // Get device info from URL params (if coming from QR scan)
    const deviceParam = searchParams.get('device');
    const screenParam = searchParams.get('screen');

    if (deviceParam) {
      // Coming from QR scan
      setMode('scan');
      setDeviceId(deviceParam);
      setScreenSize(screenParam || 'Unknown');
    } else {
      // Regular admin access - show generation mode
      setMode('generate');
    }

    // Load available dashboards
    loadDashboards();
  }, [searchParams]);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      const data = await novaTVService.getDashboards({ isActive: true });
      setDashboards(data);
    } catch (err) {
      console.error('Error loading dashboards:', err);
      setError('Failed to load available dashboards');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDevice = async () => {
    if (!selectedDashboard) {
      setError('Please select a dashboard for this TV');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the unified device service to activate the device
      await UnifiedDeviceService.activateDevice(deviceId, selectedDashboard);
      setSuccess(true);
      toast.success('TV device activated successfully!');
    } catch (err) {
      console.error('Error activating device:', err);
      setError('Failed to activate TV device');
      toast.error('Failed to activate TV device');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateActivationCode = async () => {
    if (!selectedDashboard) {
      setError('Please select a dashboard first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await UnifiedDeviceService.generateActivationCode({
        name: `Nova TV - ${new Date().toLocaleString()}`,
        location: 'TBD',
        assetTag: `TV-${Date.now()}`,
        serialNumber: `SN-${Date.now()}`,
        type: 'nova-tv',
        department: 'General',
      });
      toast.success('Activation code generated! Check Device Management page.');
      navigate('/admin/devices');
    } catch (err) {
      console.error('Error generating activation code:', err);
      setError('Failed to generate activation code');
      toast.error('Failed to generate activation code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Tv className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Nova TV Device Activation</h1>
              <p className="text-sm text-gray-600">
                {mode === 'scan'
                  ? 'Activate scanned TV device'
                  : 'Generate activation code or scan QR'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              Logged in as{' '}
              {user?.displayName || `${user?.firstName} ${user?.lastName}` || user?.email}
            </div>
            {mode === 'generate' && (
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => setMode('generate')}
                  className={`rounded-md px-3 py-1 text-sm transition-colors ${
                    mode === 'generate' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Generate Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl p-6">
        {mode === 'scan' && deviceId ? (
          // QR Scan Mode - Device detected
          <div className="grid gap-8 md:grid-cols-2">
            {/* Device Information */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                <Monitor className="h-5 w-5 text-gray-600" />
                Device Information
              </h2>

              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Device ID:</span>
                      <p className="font-mono text-xs break-all text-gray-900">{deviceId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Screen Size:</span>
                      <p className="text-gray-900">{screenSize}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div className="text-sm">
                      <div className="mb-1 font-medium text-blue-800">Activation Process</div>
                      <div className="text-blue-700">
                        This device is waiting for activation. Select a dashboard below and click
                        "Activate Device" to complete the setup.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Selection */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                <Settings className="h-5 w-5 text-gray-600" />
                Dashboard Configuration
              </h2>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="dashboard-select"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Select Dashboard
                  </label>

                  {loading ? (
                    <div className="h-10 animate-pulse rounded-lg bg-gray-200"></div>
                  ) : (
                    <select
                      id="dashboard-select"
                      value={selectedDashboard}
                      onChange={(e) => setSelectedDashboard(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a dashboard...</option>
                      {dashboards.map((dashboard) => (
                        <option key={dashboard.id} value={dashboard.id}>
                          {dashboard.name} ({dashboard.department})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedDashboard && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    {(() => {
                      const selected = dashboards.find((d) => d.id === selectedDashboard);
                      return selected ? (
                        <div className="text-sm">
                          <h4 className="mb-2 font-medium text-gray-900">{selected.name}</h4>
                          <p className="mb-2 text-gray-600">
                            {selected.description || 'No description available'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Department: {selected.department}</span>
                            <span>
                              Created: {new Date(selected.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <button
                  onClick={handleActivateDevice}
                  disabled={loading || !selectedDashboard}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      <span>Activating Device...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Activate Device</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Generate Mode - Show options
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border bg-white p-8 shadow-sm">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 p-6">
                  <QrCode className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">Nova TV Device Activation</h2>
                <p className="text-gray-600">Choose how you want to activate a Nova TV device</p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="dashboard-select-gen"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Select Default Dashboard
                  </label>
                  <select
                    id="dashboard-select-gen"
                    value={selectedDashboard}
                    onChange={(e) => setSelectedDashboard(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a dashboard...</option>
                    {dashboards.map((dashboard) => (
                      <option key={dashboard.id} value={dashboard.id}>
                        {dashboard.name} ({dashboard.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <button
                    onClick={handleGenerateActivationCode}
                    disabled={loading || !selectedDashboard}
                    className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <RefreshCw className="mb-3 h-8 w-8 text-blue-600" />
                    <h3 className="mb-2 font-medium text-gray-900">Generate Activation Code</h3>
                    <p className="text-center text-sm text-gray-600">
                      Create a new activation code for a TV device
                    </p>
                  </button>

                  <button
                    onClick={() => navigate('/admin/devices')}
                    className="flex flex-col items-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-500 hover:bg-blue-50"
                  >
                    <Monitor className="mb-3 h-8 w-8 text-blue-600" />
                    <h3 className="mb-2 font-medium text-gray-900">Manage Devices</h3>
                    <p className="text-center text-sm text-gray-600">
                      View and manage all Nova TV devices
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 p-8 text-center shadow-xl">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 p-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>

            <h2 className="mb-4 text-2xl font-bold text-gray-900">TV Activated Successfully!</h2>

            <p className="mb-6 text-gray-600">
              The Nova TV device has been configured and will start displaying the selected
              dashboard shortly.
            </p>

            <div className="mb-6 rounded-lg bg-white p-4">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Device ID:</strong> {deviceId}
                </p>
                <p>
                  <strong>Screen Size:</strong> {screenSize}
                </p>
                <p>
                  <strong>Dashboard:</strong>{' '}
                  {dashboards.find((d) => d.id === selectedDashboard)?.name}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/nova-tv')}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Nova TV Management
              </button>
              <button
                onClick={() => navigate('/admin/devices')}
                className="rounded-lg bg-gray-600 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-700"
              >
                Device Inventory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTVActivation;
