'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Types
export interface WebSocketMessage<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export interface OptimisticUpdate<T> {
  id: string;
  data: T;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  rollback?: () => void;
}

// WebSocket Hook for real-time updates
export function _useWebSocket<T = unknown>(config: WebSocketConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage<T> | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const messageQueue = useRef<WebSocketMessage<T>[]>([]);

  const {
    url,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000
  } = config;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState('connecting');
    
    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttempts.current = 0;

        // Send queued messages
        while (messageQueue.current.length > 0) {
          const message = messageQueue.current.shift();
          if (message && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
          }
        }

        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatIntervalRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'ping',
                timestamp: Date.now()
              }));
            }
          }, heartbeatInterval);
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage<T> = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = () => {
        setConnectionState('error');
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnectionState('error');
    }
  }, [url, reconnectInterval, maxReconnectAttempts, heartbeatInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const sendMessage = useCallback((message: Omit<WebSocketMessage<T>, 'timestamp'>) => {
    const fullMessage: WebSocketMessage<T> = {
      ...message,
      timestamp: Date.now()
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(fullMessage));
    } else {
      // Queue message for when connection is established
      messageQueue.current.push(fullMessage);
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionState,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
}

// Optimistic UI Updates Hook
export function _useOptimisticUpdates<T>() {
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<T>[]>([]);

  const addOptimisticUpdate = useCallback((update: Omit<OptimisticUpdate<T>, 'timestamp'>) => {
    const fullUpdate: OptimisticUpdate<T> = {
      ...update,
      timestamp: Date.now()
    };

    setPendingUpdates(prev => [...prev, fullUpdate]);

    // Auto-remove after timeout if not confirmed
    setTimeout(() => {
      setPendingUpdates(prev => prev.filter(u => u.id !== fullUpdate.id));
    }, 10000); // 10 seconds timeout

    return fullUpdate.id;
  }, []);

  const confirmUpdate = useCallback((id: string) => {
    setPendingUpdates(prev => prev.filter(u => u.id !== id));
  }, []);

  const rollbackUpdate = useCallback((id: string) => {
    setPendingUpdates(prev => {
      const update = prev.find(u => u.id === id);
      if (update?.rollback) {
        update.rollback();
      }
      return prev.filter(u => u.id !== id);
    });
  }, []);

  const clearPendingUpdates = useCallback(() => {
    setPendingUpdates([]);
  }, []);

  return {
    pendingUpdates,
    addOptimisticUpdate,
    confirmUpdate,
    rollbackUpdate,
    clearPendingUpdates
  };
}

// Background Sync Hook
export function _useBackgroundSync<T = unknown>() {
  const [syncQueue, setSyncQueue] = useState<Array<{
    id: string;
    operation: string;
    data: T;
    timestamp: number;
    retries: number;
  }>>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const addToSyncQueue = useCallback((operation: string, data: T) => {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setSyncQueue(prev => [...prev, {
      id,
      operation,
      data,
      timestamp: Date.now(),
      retries: 0
    }]);

    return id;
  }, []);

  const processSyncQueue = useCallback(async () => {
    if (syncQueue.length === 0 || isSyncing) {
      return;
    }

    setIsSyncing(true);

    for (const item of syncQueue) {
      try {
        // In a real app, you would make the actual API call here
        await new Promise(resolve => setTimeout(resolve, 1000)); // TODO-LINT: move to async function // Simulate API call
        
        // Remove successful item from queue
        setSyncQueue(prev => prev.filter(i => i.id !== item.id));
        
      } catch (error) {
        console.error('Sync failed for operation:', item.operation, error);
        
        // Increment retry count
        setSyncQueue(prev => prev.map(i => 
          i.id === item.id 
            ? { ...i, retries: i.retries + 1 }
            : i
        ));

        // Remove if too many retries
        if (item.retries >= 3) {
          setSyncQueue(prev => prev.filter(i => i.id !== item.id));
        }
      }
    }

    setIsSyncing(false);
  }, [syncQueue, isSyncing]);

  // Auto-sync when online
  useEffect(() => {
    const handleOnline = () => {
      if (syncQueue.length > 0) {
        processSyncQueue();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncQueue, processSyncQueue]);

  // Periodic sync attempt
  useEffect(() => {
    if (syncQueue.length > 0 && navigator.onLine) {
      const interval = setInterval(processSyncQueue, 30000); // Try every 30 seconds
      return () => clearInterval(interval);
    }
  }, [syncQueue, processSyncQueue]);

  return {
    syncQueue,
    isSyncing,
    addToSyncQueue,
    processSyncQueue
  };
}

// Push Notifications Hook
export function _usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported');
    }

    const result = await Notification.requestPermission(); // TODO-LINT: move to async function
    setPermission(result);
    return result;
  }, [isSupported]);

  const subscribeToPush = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      throw new Error('Push notifications not granted');
    }

    try {
      const registration = await navigator.serviceWorker.ready; // TODO-LINT: move to async function
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY // You'd need to set this
      }); // TODO-LINT: move to async function

      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }, [isSupported, permission]);

  const unsubscribeFromPush = useCallback(async () => {
    if (subscription) {
      await subscription.unsubscribe(); // TODO-LINT: move to async function
      setSubscription(null);
    }
  }, [subscription]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      });
    }
  }, [permission]);

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification
  };
}

// Real-time Event Bus
class EventBus {
  private events: Map<string, Array<(...args: unknown[]) => void>> = new Map();

  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: (...args: unknown[]) => void) {
    if (this.events.has(event)) {
      const callbacks = this.events.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: unknown[]) {
    if (this.events.has(event)) {
      this.events.get(event)!.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Event callback error:', error);
        }
      });
    }
  }

  clear() {
    this.events.clear();
  }
}

export const _eventBus = new EventBus();
