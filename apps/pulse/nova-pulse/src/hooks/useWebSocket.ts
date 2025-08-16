import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  enabled?: boolean;
  subscriptions?: string[];
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

export const useWebSocket = (
  options: UseWebSocketOptions = {},
): {
  isConnected: boolean;
  connectionError: string | null;
  lastMessage: WebSocketMessage | null;
  subscribe: (dataType: string) => void;
  unsubscribe: (dataType: string) => void;
  sendMessage: (type: string, data: any) => void;
  socket: Socket | null;
} => {
  const {
    enabled = true,
    subscriptions = [],
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Get API URL from environment or default to same origin
    const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');

    if (!token) {
      setConnectionError('No authentication token available');
      return;
    }

    // Initialize WebSocket connection
    const socket = io(apiUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Nova Pulse WebSocket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      onConnect?.();

      // Subscribe to requested data types for technician portal
      subscriptions.forEach((subscription) => {
        socket.emit('subscribe', subscription);
        console.log(`🔔 Subscribed to: ${subscription}`);
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Nova Pulse WebSocket disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.(reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Nova Pulse WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
      onError?.(error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Nova Pulse WebSocket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    // Data update handlers specific to technician needs
    const dispatchNative = (name: string, detail: any) => {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    };
    const toastKiosk = (title: string, body: string) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/assets/icons/icon-192x192.png',
          tag: 'kiosk-activation',
        });
      }
    };

    socket.on('ticket_update', (message: WebSocketMessage) => {
      console.log('🎫 Ticket update received:', message.type);
      setLastMessage(message);
      onMessage?.(message);
      dispatchNative('pulse:ticket_update', message);
    });

    socket.on('ticket_assigned', (message: WebSocketMessage) => {
      console.log('📝 Ticket assigned:', message.type);
      setLastMessage(message);
      onMessage?.(message);

      // Show notification for new assignments
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Ticket Assigned', {
          body: `Ticket #${message.data.id} has been assigned to you`,
          icon: '/assets/icons/icon-192x192.png',
          tag: 'ticket-assigned',
        });
      }
    });

    socket.on('knowledge_update', (message: WebSocketMessage) => {
      console.log('📚 Knowledge update received:', message.type);
      setLastMessage(message);
      onMessage?.(message);
    });

    socket.on('technician_notification', (message: WebSocketMessage) => {
      console.log('🔔 Technician notification:', message.type);
      setLastMessage(message);
      onMessage?.(message);
      dispatchNative('pulse:technician_notification', message);

      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nova Pulse', {
          body: message.data.message || 'New notification',
          icon: '/assets/icons/icon-192x192.png',
          tag: 'pulse-notification',
        });
      }
    });

    socket.on('data_update', (message: WebSocketMessage) => {
      // Broadcast native event for app-wide listeners
      dispatchNative('pulse:data_update', message);
      if (message?.type === 'kiosk_activated') {
        toastKiosk('Kiosk Paired', `Kiosk ${message?.data?.kioskId || ''} paired successfully`);
      }
    });

    socket.on('realtime_update', (message: WebSocketMessage) => {
      dispatchNative('pulse:realtime_update', message);
      if (message?.type === 'kiosk_activated') {
        toastKiosk('Kiosk Paired', `Kiosk ${message?.data?.kioskId || ''} paired successfully`);
      }
    });

    socket.on('kiosk_alert', (message: WebSocketMessage) => {
      console.log('🚨 Kiosk alert received:', message.type);
      setLastMessage(message);
      onMessage?.(message);

      // High priority alerts get persistent notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Kiosk Alert', {
          body: message.data.message || 'Kiosk requires attention',
          icon: '/assets/icons/icon-192x192.png',
          tag: 'kiosk-alert',
          requireInteraction: true,
        });
      }
    });

    socket.on('system_announcement', (message: WebSocketMessage) => {
      console.log('📢 System announcement:', message.type);
      setLastMessage(message);
      onMessage?.(message);
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up Nova Pulse WebSocket connection');
      socket.disconnect();
    };
  }, [enabled, JSON.stringify(subscriptions)]);

  // Helper functions
  const subscribe = (dataType: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe', dataType);
      console.log(`🔔 Subscribed to: ${dataType}`);
    }
  };

  const unsubscribe = (dataType: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', dataType);
      console.log(`🔕 Unsubscribed from: ${dataType}`);
    }
  };

  const sendMessage = (type: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, data);
      console.log(`📤 Sent message: ${type}`);
    }
  };

  return {
    isConnected,
    connectionError,
    lastMessage,
    subscribe,
    unsubscribe,
    sendMessage,
    socket: socketRef.current,
  };
};

// Request notification permission on first use
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export default useWebSocket;
