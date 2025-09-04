import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Wifi,
  Key,
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
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
  const [sessionId, setSessionId] = useState<string>('');
  const [serverSixDigitCode, setServerSixDigitCode] = useState<string>('');

  useEffect(() => {
    // Collect device information
    const generatedDeviceId = generateDeviceFingerprint();
    setDeviceId(generatedDeviceId);

    setDeviceInfo({
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      online: navigator.onLine,
    });

    // Register device with backend and generate an auth session (code + QR)
    (async () => {
      try {
        // Register or update this device on the server
        await novaTVService.registerDevice({
          name: `TV-${generatedDeviceId.slice(-6)}`,
          deviceFingerprint: generatedDeviceId,
          settings: {
            screen: `${window.screen.width}x${window.screen.height}`,
          },
        });

        // Request an auth session (six-digit code + QR payload)
        const session = await novaTVService.generateAuthCode({ deviceFingerprint: generatedDeviceId });
        setSessionId(session.sessionId);
        setServerSixDigitCode(session.sixDigitCode);

        // Prefer server-provided QR payload; fall back to local URL if needed
        const qrPayload = session.qrCode || buildActivationUrl(generatedDeviceId);
        await generateQRCodeFromPayload(qrPayload);

        // Store activation URL in case admin prefers copy/paste flow
        setActivationUrl(buildActivationUrl(generatedDeviceId));
        localStorage.setItem(`tv-activation-url-${generatedDeviceId}`, buildActivationUrl(generatedDeviceId));
      } catch (ex) {
        console.error('Initialization error:', ex);
      }
    })();

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
      // Prefer server session status if we have one
      if (sessionId) {
        const status = await novaTVService.checkAuthStatus(sessionId);
        if (status.isVerified) {
          // Let admin assignment take effect; use a placeholder dashboard until real selection is wired
          const localActivation = { dashboardId: 'default', timestamp: new Date().toISOString(), method: 'code' };
          localStorage.setItem(`tv-activated-${deviceId}`, JSON.stringify(localActivation));
          setSuccess(true);
          setTimeout(() => {
            navigate(`/tv/display?dashboard=${localActivation.dashboardId}&device=${deviceId}`);
          }, 1500);
          return;
        }
      }

      // Fallback to local storage signal (e.g., QR flow that writes locally)
      const activationKey = `tv-activated-${deviceId}`;
      const activatedData = localStorage.getItem(activationKey);
      if (activatedData) {
        const { dashboardId } = JSON.parse(activatedData);
        setSuccess(true);
        setTimeout(() => {
          navigate(`/tv/display?dashboard=${dashboardId}&device=${deviceId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking activation status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check activation status';
      
      // Track activation check failures for monitoring
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('TV Activation Check Failed', {
          deviceId,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Don't show error to user for polling failures, but log for debugging
      console.warn('Activation status check failed (will continue polling):', errorMessage);
    }
  };

  const checkExistingActivation = async () => {
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      
      // Check if this device is already registered in local storage
      const existingActivation = localStorage.getItem(`tv-activated-${deviceFingerprint}`);
      
      if (existingActivation) {
        const activationData = JSON.parse(existingActivation);
        console.log('Found existing activation for device:', activationData);
        
        // Verify the activation is still valid
        const activationAge = Date.now() - new Date(activationData.timestamp || 0).getTime();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (activationAge < maxAge) {
          // Auto-redirect to existing dashboard
          navigate(`/tv/display?dashboard=${activationData.dashboardId}&device=${deviceFingerprint}`);
          return;
        } else {
          // Clean up expired activation
          localStorage.removeItem(`tv-activated-${deviceFingerprint}`);
        }
      }
      
      // Track device registration check
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('TV Device Registration Check', {
          deviceFingerprint,
          existingActivation: !!existingActivation,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error checking existing activation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check existing activation';
      
      // Track activation check failures
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('TV Existing Activation Check Failed', {
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Log error but don't prevent normal activation flow
      console.warn('Could not check existing activation, proceeding with normal flow:', errorMessage);
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
      canvas.toDataURL(),
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(16);
  };

  const buildActivationUrl = (deviceId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/admin/tv-activate?device=${deviceId}&screen=${window.screen.width}x${window.screen.height}`;
  };

  const generateQRCodeFromPayload = async (payload: string) => {
    try {
      // Track QR payload generation
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('TV Activation URL Generated', {
          deviceId: deviceId,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          activationUrl: payload,
          timestamp: new Date().toISOString(),
        });
      }

      // Generate QR code
      const qrDataURL = await QRCodeLib.toDataURL(payload, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937', // Dark gray
          light: '#ffffff', // White
        },
      });

      setQrCodeDataURL(qrDataURL);
      
      // Log successful QR generation
      console.log('QR code generated successfully for activation payload');
    } catch (error) {
      console.error('Error generating QR code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate QR code';
      setError(`QR Generation Failed: ${errorMessage}`);
      
      // Track QR generation failures
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('TV QR Generation Failed', {
          deviceId,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
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
      // Clean 6-digit code (strip hyphen and non-digits)
      const code = activationCode.replace(/\D/g, '').slice(0, 6);
      if (!sessionId) {
        setError('Activation session is not ready yet. Please wait and try again.');
        return;
      }
      const result = await novaTVService.verifyAuthCode(sessionId, code);
      if (result.success) {
        const deviceFingerprint = generateDeviceFingerprint();
        // Persist minimal activation info locally
        const activationData = {
          dashboardId: result.dashboardId || 'default',
          timestamp: new Date().toISOString(),
          method: 'code'
        };
        localStorage.setItem(`tv-activated-${deviceFingerprint}`, JSON.stringify(activationData));
        setSuccess(true);
        setTimeout(() => {
          navigate('/tv/display?dashboard=' + (result.dashboardId || 'default') + '&device=' + deviceFingerprint);
        }, 2000);
      } else {
        setError('Invalid activation code. Please check and try again.');
      }
    } catch (err) {
      console.error('Activation error:', err);
      setError('Activation failed. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prefer native BarcodeDetector if available
      const anyWindow = window as any;
      const supportsDetector = typeof anyWindow.BarcodeDetector !== 'undefined';

      if (supportsDetector) {
        const detector = new anyWindow.BarcodeDetector({ formats: ['qr_code'] });
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();

        // Attempt a few scans over ~5 seconds
        const result = await new Promise<string>((resolve, reject) => {
          let attempts = 0;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const tick = async () => {
            attempts++;
            if (attempts > 50) return reject(new Error('No QR code detected'));
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
              const bitmap = await createImageBitmap(canvas);
              const codes = await detector.detect(bitmap);
              if (codes && codes.length > 0 && codes[0].rawValue) {
                return resolve(codes[0].rawValue);
              }
            }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });

        // Stop camera
        stream.getTracks().forEach((t) => t.stop());

        // Handle scanned payload
        const deviceFingerprint = generateDeviceFingerprint();
        if (anyWindow.analytics) {
          anyWindow.analytics.track('TV QR Scan Attempted', {
            deviceId: deviceFingerprint,
            method: 'qr-scan',
            timestamp: new Date().toISOString(),
          });
        }

        // For now, route to display with the scanned value as dashboard id if it matches expected format
        const activationData = { dashboardId: 'qr-dashboard', timestamp: new Date().toISOString(), method: 'qr-scan', scanned: result };
        localStorage.setItem(`tv-activated-${deviceFingerprint}`, JSON.stringify(activationData));
        setSuccess(true);
        setTimeout(() => {
          navigate('/tv/display?dashboard=qr-dashboard&device=' + deviceFingerprint);
        }, 1200);
        return;
      }

      // Fallback if BarcodeDetector is unavailable
      throw new Error('QR scanning not supported on this browser');
    } catch (error) {
      console.error('QR scan failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'QR scan failed';
      setError(`QR Scan Failed: ${errorMessage}. Please try the activation code method.`);

      const anyWindow = window as any;
      if (anyWindow.analytics) {
        anyWindow.analytics.track('TV QR Scan Failed', {
          error: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 p-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="mb-4 text-2xl font-bold text-gray-900">Activation Successful!</h1>

          <p className="mb-6 text-gray-600">
            Your Nova TV is now connected and ready to display content.
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-green-600"></div>
            <span>Redirecting to dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="mb-4 flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-3">
              <Monitor className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Nova TV Activation</h1>
              <p className="text-blue-100">Connect your display to the Nova Universe</p>
            </div>
          </div>

          {/* Device Info */}
          {deviceInfo && (
            <div className="rounded-lg bg-white/10 p-4 text-sm">
              <div className="mb-2 flex items-center gap-2">
                <Wifi
                  className={`h-4 w-4 ${deviceInfo.online ? 'text-green-300' : 'text-red-300'}`}
                />
                <span>Device Status: {deviceInfo.online ? 'Online' : 'Offline'}</span>
              </div>
              <div className="text-blue-100">
                Screen: {deviceInfo.screen.width} × {deviceInfo.screen.height}
              </div>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Activation Method Selection */}
            <div>
              <h2 className="mb-6 text-xl font-semibold text-gray-900">Choose Activation Method</h2>

              <div className="mb-6 space-y-4">
                <label className="flex cursor-pointer items-center rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-300">
                  <input
                    type="radio"
                    name="activation-method"
                    value="code"
                    checked={activationMethod === 'code'}
                    onChange={(e) => setActivationMethod(e.target.value as 'code')}
                    className="sr-only"
                  />
                  <div
                    className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      activationMethod === 'code'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {activationMethod === 'code' && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Activation Code</div>
                      <div className="text-sm text-gray-600">
                        Enter the 6-digit code from your admin
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-300">
                  <input
                    type="radio"
                    name="activation-method"
                    value="qr"
                    checked={activationMethod === 'qr'}
                    onChange={(e) => setActivationMethod(e.target.value as 'qr')}
                    className="sr-only"
                  />
                  <div
                    className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      activationMethod === 'qr' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                    }`}
                  >
                    {activationMethod === 'qr' && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <QrCode className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">QR Code Scan</div>
                      <div className="text-sm text-gray-600">
                        Scan QR code from your mobile device
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
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
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Enter Activation Code</h3>

                  <form onSubmit={handleCodeActivation} className="space-y-6">
                    <div>
                      <label
                        htmlFor="activation-code"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        6-Digit Code
                      </label>
                      <input
                        id="activation-code"
                        type="text"
                        value={activationCode}
                        onChange={handleCodeChange}
                        placeholder="123-456"
                        maxLength={7} // XXX-XXX format
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-mono text-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !activationCode.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                          <span>Activating...</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-5 w-5" />
                          <span>Activate TV</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 rounded-lg bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div className="text-sm">
                        <div className="mb-1 font-medium text-blue-800">Demo Codes</div>
                        {serverSixDigitCode ? (
                          <div className="text-blue-700">
                            Your activation code: <code className="rounded bg-white px-1 tracking-widest">{serverSixDigitCode.slice(0,3)}-{serverSixDigitCode.slice(3)}</code>
                          </div>
                        ) : (
                          <div className="text-blue-700">Generate a code or use QR activation</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Admin Activation via QR Code
                  </h3>

                  <div className="space-y-6 text-center">
                    {qrCodeDataURL ? (
                      <div className="inline-block rounded-lg border-2 border-gray-200 bg-white p-6">
                        <img
                          src={qrCodeDataURL}
                          alt="Device Activation QR Code"
                          className="mx-auto"
                        />
                        <p className="mt-4 max-w-xs text-sm text-gray-600">
                          Scan this QR code with your phone to activate this Nova TV device
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-12">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                        <p className="text-gray-600">Generating QR code...</p>
                      </div>
                    )}

                    <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                      <p className="mb-2 font-medium">How to activate:</p>
                      <ol className="space-y-1 text-left">
                        <li>1. Scan the QR code above with your phone</li>
                        <li>2. Log into Nova Universe as an admin</li>
                        <li>3. Select a dashboard for this TV</li>
                        <li>4. Confirm activation</li>
                      </ol>
                      
                      {activationUrl && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="font-medium text-gray-700 mb-1">Activation URL:</p>
                          <p className="text-xs text-gray-600 break-all font-mono">{activationUrl}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(activationUrl);
                              // Show brief success feedback
                              setError(null);
                            }}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            Copy URL
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          try {
                            setLoading(true);
                            const session = await novaTVService.generateAuthCode({ deviceFingerprint: deviceId });
                            setSessionId(session.sessionId);
                            setServerSixDigitCode(session.sixDigitCode);
                            await generateQRCodeFromPayload(session.qrCode || activationUrl);
                          } catch (e) {
                            console.error('Failed to refresh QR code:', e);
                            setError('Failed to refresh QR code. Please try again.');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700 disabled:bg-gray-400"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Refresh QR Code</span>
                      </button>
                      
                      <button
                        onClick={handleQRScan}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>Test QR Scan</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              How to Get Your Activation Code
            </h3>
            <div className="grid gap-6 text-sm text-gray-600 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium text-gray-900">For Administrators:</h4>
                <ol className="list-inside list-decimal space-y-1">
                  <li>Log into the Nova Universe admin portal</li>
                  <li>Navigate to Nova TV → Authentication</li>
                  <li>Click "Generate New Code"</li>
                  <li>Share the 6-digit code with this device</li>
                </ol>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-gray-900">Need Help?</h4>
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
