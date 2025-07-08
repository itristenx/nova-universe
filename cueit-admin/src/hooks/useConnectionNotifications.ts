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

    const handleDisconnected = (event: CustomEvent) => {
      const error = event.detail?.error || 'Server connection lost';
      addToast({
        type: 'error',
        title: 'Connection Lost',
        description: `Lost connection to server: ${error}`,
      });
    };

    // Listen for custom connection events
    window.addEventListener('api-reconnected', handleReconnected as EventListener);
    window.addEventListener('api-disconnected', handleDisconnected as EventListener);

    return () => {
      window.removeEventListener('api-reconnected', handleReconnected as EventListener);
      window.removeEventListener('api-disconnected', handleDisconnected as EventListener);
    };
  }, [addToast]);
};
