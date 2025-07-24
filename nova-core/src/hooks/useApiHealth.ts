import { useState, useEffect, useCallback } from 'react';

export const useApiHealth = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const checkHealth = useCallback(async (showNotification = false) => {
    if (isChecking) return;
    
    setIsChecking(true);
    setConnectionError(null);
    
    try {
      // Try to make a simple API call to check connectivity
      const serverUrl = localStorage.getItem('api_server_url') || 
                       import.meta.env.VITE_API_URL || 
                       'http://localhost:3000';
      
      // Use fetch for health check to avoid interceptors that might interfere
      // Use /api/health for status, /api/version for version info
      const response = await fetch(`${serverUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        const wasDisconnected = !isConnected;
        setIsConnected(true);
        setLastChecked(new Date());
        
        // Show reconnection notification if previously disconnected
        if (wasDisconnected && showNotification) {
          // Dispatch custom event for reconnection
          window.dispatchEvent(new CustomEvent('api-reconnected'));
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      const wasConnected = isConnected;
      setIsConnected(false);
      setLastChecked(new Date());
      
      // Set appropriate error message
      if (error.name === 'AbortError' || error.code === 'ERR_NETWORK') {
        setConnectionError('Network timeout or connection refused');
      } else {
        setConnectionError(error.message || 'Unknown connection error');
      }
      
      // Show disconnection notification if previously connected
      if (wasConnected && showNotification) {
        // Dispatch custom event for disconnection
        window.dispatchEvent(new CustomEvent('api-disconnected', {
          detail: { error: error.message }
        }));
      }
    } finally {
      setIsChecking(false);
    }
  }, [isConnected, isChecking]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    // Check immediately
    checkHealth();

    // Then check every 15 seconds for more real-time monitoring
    interval = setInterval(() => checkHealth(true), 15000);

    // Listen for online/offline events
    const handleOnline = () => checkHealth(true);
    const handleOffline = () => {
      setIsConnected(false);
      setConnectionError('Browser is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkHealth]);

  // Manual refresh function
  const refreshConnection = useCallback(() => {
    checkHealth(true);
  }, [checkHealth]);

  return { 
    isConnected, 
    isChecking, 
    lastChecked, 
    connectionError, 
    refreshConnection 
  };
};
