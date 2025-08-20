import React, { useState, useEffect, useRef } from 'react';
import { QrCode, RefreshCw, CheckCircle, XCircle, Clock, Smartphone } from 'lucide-react';
import { novaTVService, AuthSession } from '../../services/nova-tv';

const QRAuthentication: React.FC = () => {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
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
      } catch (error) {
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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Device Authentication</h1>
        <p className="text-gray-600 mt-1">Connect a new Nova TV device using QR code or PIN</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan QR Code</h2>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <XCircle className="w-16 h-16 text-red-500 mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={generateAuthCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate New Code
                  </button>
                </div>
              ) : verificationStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Device Connected!</h3>
                  <p className="text-gray-600 mb-4">Your Nova TV device has been successfully authenticated.</p>
                  <button
                    onClick={generateAuthCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Connect Another Device
                  </button>
                </div>
              ) : authSession ? (
                <div>
                  {/* QR Code Display */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-4 inline-block">
                    <div className="w-48 h-48 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-gray-400" />
                      {/* In a real implementation, you would render the actual QR code here */}
                    </div>
                  </div>
                  
                  {/* Timer */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Expires in: <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
                    </span>
                  </div>
                  
                  {/* QR Code Value (for testing) */}
                  <div className="text-xs text-gray-500 mb-4 break-all">
                    <p className="mb-1">QR Code Data:</p>
                    <code className="bg-gray-100 p-2 rounded block">{authSession.qrCode}</code>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(authSession.qrCode)}
                    className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                  >
                    Copy QR Code Data
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* PIN Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter PIN Code</h2>
              
              {authSession && verificationStatus === 'pending' ? (
                <div>
                  <div className="mb-6">
                    <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Enter this code on your Nova TV device:
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                      <div className="text-4xl font-bold text-blue-900 tracking-wider">
                        {authSession.sixDigitCode}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(authSession.sixDigitCode)}
                      className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>Waiting for device to enter this code...</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              ) : verificationStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Complete!</h3>
                  <p className="text-gray-600">Device successfully connected to Nova TV.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <Smartphone className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">Generate an authentication code to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Connect Your Device</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Method 1: QR Code</h4>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Open the Nova TV app on your device</li>
                <li>2. Navigate to "Connect Device"</li>
                <li>3. Scan the QR code displayed above</li>
                <li>4. Your device will automatically connect</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Method 2: PIN Code</h4>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Open the Nova TV app on your device</li>
                <li>2. Select "Enter PIN Code"</li>
                <li>3. Type in the 6-digit code shown above</li>
                <li>4. Tap "Connect" to complete setup</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Security Notice</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Authentication codes expire after 15 minutes for security. Only share these codes with trusted devices in your organization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRAuthentication;
