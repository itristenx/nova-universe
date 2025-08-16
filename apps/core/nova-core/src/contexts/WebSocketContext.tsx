import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket, webSocketService } from '@/hooks/useWebSocket';

interface WebSocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  subscribe: (dataType: string) => void;
  unsubscribe: (dataType: string) => void;
  broadcast: (message: string, data?: any) => void;
  notify: (userId: string, message: string, type?: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const { isConnected, connectionError, subscribe, unsubscribe, sendMessage } = useWebSocket({
    enabled: isInitialized,
    subscriptions: ['tickets', 'kiosks', 'users', 'system'],
    onConnect: () => {
      console.log('✅ Admin WebSocket connected - subscribing to admin channels');
    },
    onDisconnect: (reason) => {
      console.log('❌ Admin WebSocket disconnected:', reason);
    },
    onMessage: (message) => {
      console.log('📨 Received admin message:', message);
      // Handle global admin messages here
    },
    onError: (error) => {
      console.error('❌ Admin WebSocket error:', error);
    },
  });

  useEffect(() => {
    // Initialize WebSocket connection when component mounts
    const token = localStorage.getItem('token');
    if (token) {
      setIsInitialized(true);
    }
  }, []);

  const broadcast = async (message: string, data?: any) => {
    try {
      const response = await fetch('/api/websocket/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ message, data }),
      });

      if (!response.ok) {
        throw new Error('Failed to broadcast message');
      }

      console.log('📢 Message broadcasted successfully');
    } catch (error) {
      console.error('❌ Failed to broadcast message:', error);
    }
  };

  const notify = async (userId: string, message: string, type: string = 'info') => {
    try {
      const response = await fetch('/api/websocket/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, message, type }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      console.log('🔔 Notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
    }
  };

  const contextValue: WebSocketContextType = {
    isConnected,
    connectionError,
    subscribe,
    unsubscribe,
    broadcast,
    notify,
  };

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;
