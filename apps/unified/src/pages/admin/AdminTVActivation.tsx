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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
        department: 'General'
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Tv className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Nova TV Device Activation</h1>
              <p className="text-sm text-gray-600">
                {mode === 'scan' ? 'Activate scanned TV device' : 'Generate activation code or scan QR'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              Logged in as {user?.displayName || `${user?.firstName} ${user?.lastName}` || user?.email}
            </div>
            {mode === 'generate' && (
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setMode('generate')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    mode === 'generate' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
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
      <div className="max-w-4xl mx-auto p-6">
        {mode === 'scan' && deviceId ? (
          // QR Scan Mode - Device detected
          <div className="grid md:grid-cols-2 gap-8">
            {/* Device Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-gray-600" />
                Device Information
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Device ID:</span>
                      <p className="text-gray-900 font-mono text-xs break-all">{deviceId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Screen Size:</span>
                      <p className="text-gray-900">{screenSize}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-800 mb-1">Activation Process</div>
                      <div className="text-blue-700">
                        This device is waiting for activation. Select a dashboard below and click "Activate Device" to complete the setup.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Selection */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Dashboard Configuration
              </h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="dashboard-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Dashboard
                  </label>
                  
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-10 rounded-lg"></div>
                  ) : (
                    <select
                      id="dashboard-select"
                      value={selectedDashboard}
                      onChange={(e) => setSelectedDashboard(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div className="bg-gray-50 rounded-lg p-4">
                    {(() => {
                      const selected = dashboards.find(d => d.id === selectedDashboard);
                      return selected ? (
                        <div className="text-sm">
                          <h4 className="font-medium text-gray-900 mb-2">{selected.name}</h4>
                          <p className="text-gray-600 mb-2">{selected.description || 'No description available'}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Department: {selected.department}</span>
                            <span>Created: {new Date(selected.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <button
                  onClick={handleActivateDevice}
                  disabled={loading || !selectedDashboard}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Activating Device...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Activate Device</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Generate Mode - Show options
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center mb-8">
                <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Nova TV Device Activation</h2>
                <p className="text-gray-600">
                  Choose how you want to activate a Nova TV device
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="dashboard-select-gen" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Default Dashboard
                  </label>
                  <select
                    id="dashboard-select-gen"
                    value={selectedDashboard}
                    onChange={(e) => setSelectedDashboard(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a dashboard...</option>
                    {dashboards.map((dashboard) => (
                      <option key={dashboard.id} value={dashboard.id}>
                        {dashboard.name} ({dashboard.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleGenerateActivationCode}
                    disabled={loading || !selectedDashboard}
                    className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Generate Activation Code</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Create a new activation code for a TV device
                    </p>
                  </button>

                  <button
                    onClick={() => navigate('/admin/devices')}
                    className="flex flex-col items-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Monitor className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-medium text-gray-900 mb-2">Manage Devices</h3>
                    <p className="text-sm text-gray-600 text-center">
                      View and manage all Nova TV devices
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              TV Activated Successfully!
            </h2>
            
            <p className="text-gray-600 mb-6">
              The Nova TV device has been configured and will start displaying the selected dashboard shortly.
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600">
                <p><strong>Device ID:</strong> {deviceId}</p>
                <p><strong>Screen Size:</strong> {screenSize}</p>
                <p><strong>Dashboard:</strong> {dashboards.find(d => d.id === selectedDashboard)?.name}</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/nova-tv')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Nova TV Management
              </button>
              <button
                onClick={() => navigate('/admin/devices')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
