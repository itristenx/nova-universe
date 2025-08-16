import { useEffect } from 'react';
import { useToastStore } from '@/stores/toast';

export const useConnectionNotifications = () => {
  const { addToast } = useToastStore();

  useEffect(() => {
    const handleReconnected = () => {
      addToast({
        type: 'success',
        title: 'Connection Restored',
        description: 'Successfully reconnected to the server',
      });
    };

    const handleDisconnected = (event: Event) => {
      const customEvent = event as CustomEvent;
      const error = customEvent.detail?.error || 'Server connection lost';
      addToast({
        type: 'error',
        title: 'Connection Lost',
        description: `Lost connection to server: ${error}`,
      });
    };

    // Listen for custom connection events
    window.addEventListener('api-reconnected', handleReconnected);
    window.addEventListener('api-disconnected', handleDisconnected);

    return () => {
      window.removeEventListener('api-reconnected', handleReconnected);
      window.removeEventListener('api-disconnected', handleDisconnected);
    };
  }, [addToast]);
};
