import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export const useApiHealth = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkHealth = async () => {
      if (isChecking) return;
      
      setIsChecking(true);
      try {
        // Try to make a simple API call to check connectivity
        await api.getConfig();
        setIsConnected(true);
      } catch (error: any) {
        // Only mark as disconnected if it's a network error
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          setIsConnected(false);
        }
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately
    checkHealth();

    // Then check every 30 seconds
    interval = setInterval(checkHealth, 30000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isChecking]);

  return { isConnected, isChecking };
};
