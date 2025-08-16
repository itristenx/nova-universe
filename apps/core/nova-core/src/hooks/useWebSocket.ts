import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getEnv } from '@/lib/env';

interface WebSocketMessage {
  type: string;
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
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

export const useWebSocket = (options: UseWebSocketOptions = {}): {
  isConnected: boolean;
  connectionError: string | null;
  lastMessage: WebSocketMessage | null;
  subscribe: (dataType: string) => void;
  unsubscribe: (dataType: string) => void;
  sendMessage: (type: string, data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void;
  socket: Socket | null;
} => {
  const {
    enabled = true,
    subscriptions = [],
    onMessage,
    onConnect,
    onDisconnect,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const { apiUrl } = getEnv();
    const token = localStorage.getItem('token');
    
    if (!token) {
      setConnectionError('No authentication token available');
      return;
    }

    // Initialize WebSocket connection
    const socket = io(apiUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      onConnect?.();

      // Subscribe to requested data types
      subscriptions.forEach(subscription => {
        socket.emit('subscribe', subscription);
        console.log(`🔔 Subscribed to: ${subscription}`);
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
      onDisconnect?.(reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
      onError?.(error);
    });

    // Data update handlers
    socket.on('data_update', (message: WebSocketMessage) => {
      console.log('📊 Data update received:', message.type);
      setLastMessage(message);
      onMessage?.(message);
    });

    socket.on('realtime_update', (message: WebSocketMessage) => {
      console.log('⚡ Realtime update received:', message.type);
      setLastMessage(message);
      onMessage?.(message);
    });

    socket.on('user_update', (message: WebSocketMessage) => {
      console.log('👤 User update received:', message.type);
      setLastMessage(message);
      onMessage?.(message);
    });

    socket.on('admin_broadcast', (message: WebSocketMessage) => {
      console.log('📢 Admin broadcast received:', message.type);
      setLastMessage(message);
      onMessage?.(message);
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      socket.disconnect();
    };
  }, [enabled, JSON.stringify(subscriptions)]);

  // Helper _functions
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

  const sendMessage = (type: string, data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => {
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
    socket: socketRef.current
  };
};

// WebSocket service for managing global connection
class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers = new Map<string, Set<(data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void>>();
  private connectionHandlers = new Set<() => void>();
  private disconnectionHandlers = new Set<(reason: string) => void>();

  connect(token: string) {
    if (this.socket?.connected) return;

    const { apiUrl } = getEnv();
    
    this.socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Global WebSocket connected');
      this.connectionHandlers.forEach(handler => handler());
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Global WebSocket disconnected:', reason);
      this.disconnectionHandlers.forEach(handler => handler(reason));
    });

    // Handle all message types
    const messageTypes = [
      'data_update',
      'realtime_update', 
      'user_update',
      'admin_broadcast'
    ];

    messageTypes.forEach(type => {
      this.socket?.on(type, (message: WebSocketMessage) => {
        const handlers = this.messageHandlers.get(message.type);
        handlers?.forEach(handler => handler(message.data));
      });
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  subscribe(messageType: string, handler: (data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)?.add(handler);
  }

  unsubscribe(messageType: string, handler: (data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) => void) {
    this.messageHandlers.get(messageType)?.delete(handler);
  }

  onConnect(handler: () => void) {
    this.connectionHandlers.add(handler);
  }

  onDisconnect(handler: (reason: string) => void) {
    this.disconnectionHandlers.add(handler);
  }

  emit(event: string, data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    this.socket?.emit(event, data);
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

export const _webSocketService = new WebSocketService();

export default useWebSocket;
