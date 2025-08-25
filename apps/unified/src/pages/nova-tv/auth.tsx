import React, { useState, useEffect, useRef } from 'react';
import { QrCode, RefreshCw, CheckCircle, XCircle, Clock, Smartphone } from 'lucide-react';
import { novaTVService, AuthSession } from '../../services/nova-tv';

const QRAuthentication: React.FC = () => {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>(
    'pending',
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    generateAuthCode();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (authSession) {
      startCountdown();
      startPolling();
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [authSession]);

  const generateAuthCode = async () => {
    try {
      setLoading(true);
      setError(null);
      setVerificationStatus('pending');

      const session = await novaTVService.generateAuthCode();
      setAuthSession(session);

      // Calculate time remaining
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);
    } catch (err) {
      setError('Failed to generate authentication code');
      console.error('Error generating auth code:', err);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setError('Authentication code expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startPolling = () => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Poll the server every 2 seconds to check if the code was used
    pollingRef.current = setInterval(async () => {
      if (!authSession) return;

      try {
        const status = await novaTVService.checkAuthStatus(authSession.sessionId);
        if (status.isVerified) {
          setVerificationStatus('success');
          clearInterval(pollingRef.current!);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        } else if (status.isExpired) {
          setError('Authentication code expired');
          clearInterval(pollingRef.current!);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (_error) {
        console.error('Error checking auth status:', error);
        // Continue polling - don't stop on network errors
      }
    }, 2000); // Poll every 2 seconds
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Device Authentication</h1>
        <p className="mt-1 text-gray-600">Connect a new Nova TV device using QR code or PIN</p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* QR Code Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="text-center">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Scan QR Code</h2>

              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <XCircle className="mb-4 h-16 w-16 text-red-500" />
                  <p className="mb-4 text-red-600">{error}</p>
                  <button
                    onClick={generateAuthCode}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate New Code
                  </button>
                </div>
              ) : verificationStatus === 'success' ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">Device Connected!</h3>
                  <p className="mb-4 text-gray-600">
                    Your Nova TV device has been successfully authenticated.
                  </p>
                  <button
                    onClick={generateAuthCode}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Connect Another Device
                  </button>
                </div>
              ) : authSession ? (
                <div>
                  {/* QR Code Display */}
                  <div className="mb-4 inline-block rounded-lg border-2 border-gray-200 bg-white p-4">
                    <div className="flex h-48 w-48 items-center justify-center rounded border border-gray-300 bg-gray-100">
                      <QrCode className="h-32 w-32 text-gray-400" />
                      {/* In a real implementation, you would render the actual QR code here */}
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="mb-4 flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Expires in:{' '}
                      <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                    </span>
                  </div>

                  {/* QR Code Value (for testing) */}
                  <div className="mb-4 text-xs break-all text-gray-500">
                    <p className="mb-1">QR Code Data:</p>
                    <code className="block rounded bg-gray-100 p-2">{authSession.qrCode}</code>
                  </div>

                  <button
                    onClick={() => copyToClipboard(authSession.qrCode)}
                    className="text-sm text-blue-600 transition-colors hover:text-blue-800"
                  >
                    Copy QR Code Data
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* PIN Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="text-center">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Enter PIN Code</h2>

              {authSession && verificationStatus === 'pending' ? (
                <div>
                  <div className="mb-6">
                    <Smartphone className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                    <p className="mb-4 text-gray-600">Enter this code on your Nova TV device:</p>

                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-6">
                      <div className="text-4xl font-bold tracking-wider text-blue-900">
                        {authSession.sixDigitCode}
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(authSession.sixDigitCode)}
                      className="text-sm text-blue-600 transition-colors hover:text-blue-800"
                    >
                      Copy Code
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>Waiting for device to enter this code...</p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600"></div>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 [animation-delay:0.2s]"></div>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600 [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              ) : verificationStatus === 'success' ? (
                <div className="flex h-64 flex-col items-center justify-center">
                  <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Authentication Complete!
                  </h3>
                  <p className="text-gray-600">Device successfully connected to Nova TV.</p>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center">
                  <Smartphone className="mb-4 h-16 w-16 text-gray-400" />
                  <p className="text-gray-600">Generate an authentication code to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">How to Connect Your Device</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium text-gray-900">Method 1: QR Code</h4>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Open the Nova TV app on your device</li>
                <li>2. Navigate to "Connect Device"</li>
                <li>3. Scan the QR code displayed above</li>
                <li>4. Your device will automatically connect</li>
              </ol>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-900">Method 2: PIN Code</h4>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Open the Nova TV app on your device</li>
                <li>2. Select "Enter PIN Code"</li>
                <li>3. Type in the 6-digit code shown above</li>
                <li>4. Tap "Connect" to complete setup</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="mt-0.5 h-5 w-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
              <p className="mt-1 text-sm text-yellow-700">
                Authentication codes expire after 15 minutes for security. Only share these codes
                with trusted devices in your organization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRAuthentication;
