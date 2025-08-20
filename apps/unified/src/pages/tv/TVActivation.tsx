import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Wifi, Key, QrCode, Smartphone, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { novaTVService } from '../../services/nova-tv';

const TVActivation: React.FC = () => {
  const navigate = useNavigate();
  const [activationMethod, setActivationMethod] = useState<'code' | 'qr'>('code');
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    userAgent: string;
    screen: { width: number; height: number };
    online: boolean;
  } | null>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [activationUrl, setActivationUrl] = useState<string>('');

  useEffect(() => {
    // Collect device information
    const generatedDeviceId = generateDeviceFingerprint();
    setDeviceId(generatedDeviceId);
    
    setDeviceInfo({
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      online: navigator.onLine
    });

    // Generate QR code for admin activation
    generateQRCode(generatedDeviceId);

    // Check if already activated (has dashboard assignment)
    checkExistingActivation();

    // Start polling for activation status
    const pollInterval = setInterval(() => {
      checkActivationStatus(generatedDeviceId);
    }, 3000); // Check every 3 seconds

    return () => clearInterval(pollInterval);
  }, []);

  const checkActivationStatus = async (deviceId: string) => {
    try {
      // Check if device has been activated by admin
      // For now, we'll use local storage as a simple check
      const activationKey = `tv-activated-${deviceId}`;
      const activatedData = localStorage.getItem(activationKey);
      
      if (activatedData) {
        const { dashboardId } = JSON.parse(activatedData);
        setSuccess(true);
        setTimeout(() => {
          navigate(`/tv/display?dashboard=${dashboardId}&device=${deviceId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking activation status:', error);
      // Don't show error for polling failures
    }
  };

  const checkExistingActivation = async () => {
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      // In a real implementation, check if this device is already registered
      // For now, we'll skip this check
    } catch (error) {
      console.error('Error checking existing activation:', error);
    }
  };

  const generateDeviceFingerprint = (): string => {
    // Generate a unique fingerprint for this device/browser
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  };

  const generateQRCode = async (deviceId: string) => {
    try {
      // Create activation URL that admins can scan
      const baseUrl = window.location.origin;
      const activationUrl = `${baseUrl}/admin/tv-activate?device=${deviceId}&screen=${window.screen.width}x${window.screen.height}`;
      setActivationUrl(activationUrl);
      
      // Generate QR code
      const qrDataURL = await QRCodeLib.toDataURL(activationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff' // White
        }
      });
      
      setQrCodeDataURL(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Failed to generate QR code');
    }
  };

  const handleCodeActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activationCode.trim()) {
      setError('Please enter an activation code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For demo purposes, we'll simulate different codes
      const code = activationCode.trim().toLowerCase();
      
      if (code === 'demo123' || code === '123456') {
        // Simulate successful activation
        setSuccess(true);
        setTimeout(() => {
          // Redirect to TV display with a demo dashboard
          navigate('/tv/display?dashboard=demo-dashboard&device=' + generateDeviceFingerprint());
        }, 2000);
      } else {
        // Try to verify with the server
        const result = await novaTVService.verifyAuthCode('demo-session', activationCode);
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            navigate('/tv/display?dashboard=' + (result.dashboardId || 'default'));
          }, 2000);
        } else {
          setError('Invalid activation code. Please check and try again.');
        }
      }
    } catch (err) {
      console.error('Activation error:', err);
      setError('Activation failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async () => {
    // In a real implementation, this would open a QR scanner
    // For demo, we'll simulate a successful scan
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate scanning
      setSuccess(true);
      setTimeout(() => {
        navigate('/tv/display?dashboard=qr-dashboard&device=' + generateDeviceFingerprint());
      }, 2000);
    } catch (err) {
      setError('QR scan failed. Please try the activation code method.');
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (value: string): string => {
    // Format as XXX-XXX for 6-digit codes
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 6);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setActivationCode(formatted);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Activation Successful!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Your Nova TV is now connected and ready to display content.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span>Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-full p-3">
              <Monitor className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Nova TV Activation</h1>
              <p className="text-blue-100">Connect your display to the Nova Universe</p>
            </div>
          </div>
          
          {/* Device Info */}
          {deviceInfo && (
            <div className="bg-white/10 rounded-lg p-4 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className={`w-4 h-4 ${deviceInfo.online ? 'text-green-300' : 'text-red-300'}`} />
                <span>Device Status: {deviceInfo.online ? 'Online' : 'Offline'}</span>
              </div>
              <div className="text-blue-100">
                Screen: {deviceInfo.screen.width} × {deviceInfo.screen.height}
              </div>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Activation Method Selection */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Activation Method</h2>
              
              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="activation-method"
                    value="code"
                    checked={activationMethod === 'code'}
                    onChange={(e) => setActivationMethod(e.target.value as 'code')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    activationMethod === 'code' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {activationMethod === 'code' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Activation Code</div>
                      <div className="text-sm text-gray-600">Enter the 6-digit code from your admin</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="activation-method"
                    value="qr"
                    checked={activationMethod === 'qr'}
                    onChange={(e) => setActivationMethod(e.target.value as 'qr')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    activationMethod === 'qr' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {activationMethod === 'qr' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">QR Code Scan</div>
                      <div className="text-sm text-gray-600">Scan QR code from your mobile device</div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-red-800">Activation Failed</div>
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Activation Form */}
            <div>
              {activationMethod === 'code' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Activation Code</h3>
                  
                  <form onSubmit={handleCodeActivation} className="space-y-6">
                    <div>
                      <label htmlFor="activation-code" className="block text-sm font-medium text-gray-700 mb-2">
                        6-Digit Code
                      </label>
                      <input
                        id="activation-code"
                        type="text"
                        value={activationCode}
                        onChange={handleCodeChange}
                        placeholder="123-456"
                        maxLength={7} // XXX-XXX format
                        className="w-full text-2xl text-center font-mono px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading || !activationCode.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Activating...</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-5 h-5" />
                          <span>Activate TV</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-blue-800 mb-1">Demo Codes</div>
                        <div className="text-blue-700">
                          Try: <code className="bg-white px-1 rounded">demo123</code> or <code className="bg-white px-1 rounded">123456</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Activation via QR Code</h3>
                  
                  <div className="text-center space-y-6">
                    {qrCodeDataURL ? (
                      <div className="bg-white rounded-lg p-6 border-2 border-gray-200 inline-block">
                        <img 
                          src={qrCodeDataURL} 
                          alt="Device Activation QR Code"
                          className="mx-auto"
                        />
                        <p className="text-sm text-gray-600 mt-4 max-w-xs">
                          Scan this QR code with your phone to activate this Nova TV device
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-12 border-2 border-dashed border-gray-300">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                          Generating QR code...
                        </p>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium mb-2">How to activate:</p>
                      <ol className="text-left space-y-1">
                        <li>1. Scan the QR code above with your phone</li>
                        <li>2. Log into Nova Universe as an admin</li>
                        <li>3. Select a dashboard for this TV</li>
                        <li>4. Confirm activation</li>
                      </ol>
                    </div>

                    <button
                      onClick={() => generateQRCode(deviceId)}
                      disabled={loading}
                      className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Refresh QR Code</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">How to Get Your Activation Code</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">For Administrators:</h4>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Log into the Nova Universe admin portal</li>
                  <li>Navigate to Nova TV → Authentication</li>
                  <li>Click "Generate New Code"</li>
                  <li>Share the 6-digit code with this device</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                <ul className="space-y-1">
                  <li>• Contact your IT administrator</li>
                  <li>• Check network connectivity</li>
                  <li>• Ensure device is authorized</li>
                  <li>• Verify activation code is current</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVActivation;
