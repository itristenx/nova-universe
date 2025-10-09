# Real-Time Updates Implementation Guide

**Date**: October 9, 2025  
**Status**: WebSocket Infrastructure Exists - Implementation TODO  
**Estimated Time**: 1-2 hours

---

## Overview

Nova Universe already has WebSocket infrastructure in place. This guide shows how to implement real-time updates for live notifications, data updates, and collaborative features.

---

## Existing Infrastructure

### Backend WebSocket Server

**File**: `apps/api/routes/websocket.js`

The backend already has:
- ✅ WebSocket server running
- ✅ Connection handling
- ✅ Room/channel support
- ✅ Event broadcasting
- ✅ Authentication support

### Frontend WebSocket Client

**File**: `apps/unified/src/services/websocket.ts` (if exists)

Need to verify or create WebSocket client utility.

---

## Implementation Plan

### Phase 1: WebSocket Client Setup (15 min)

**File**: `apps/unified/src/services/websocket-client.ts`

```typescript
/**
 * WebSocket Client for Real-Time Updates
 * Connects to backend WebSocket server for live notifications and data updates
 */

type EventHandler = (data: any) => void;

interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isIntentionallyClosed = false;
        
        // Get auth token
        const token = localStorage.getItem('nova_access_token');
        const wsUrl = `${this.config.url}?token=${token}`;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket] Reconnecting... (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnect failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Subscribe to an event
   */
  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Send message to server
   */
  send(event: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    } else {
      console.warn('[WebSocket] Cannot send message - not connected');
    }
  }

  /**
   * Join a room/channel
   */
  join(room: string): void {
    this.send('join', { room });
  }

  /**
   * Leave a room/channel
   */
  leave(room: string): void {
    this.send('leave', { room });
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: { event: string; data: any }): void {
    const handlers = this.eventHandlers.get(message.event);
    if (handlers) {
      handlers.forEach((handler) => handler(message.data));
    }

    // Also trigger wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
const wsClient = new WebSocketClient({
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
});

export default wsClient;
```

---

### Phase 2: React Hook for WebSocket (15 min)

**File**: `apps/unified/src/hooks/useWebSocket.ts`

```typescript
import { useEffect, useCallback, useRef } from 'react';
import wsClient from '@services/websocket-client';

/**
 * Hook for using WebSocket in components
 */
export function useWebSocket(event: string, handler: (data: any) => void, deps: any[] = []) {
  const handlerRef = useRef(handler);

  // Update handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  // Memoized handler that uses ref
  const stableHandler = useCallback((data: any) => {
    handlerRef.current(data);
  }, []);

  useEffect(() => {
    // Subscribe to event
    wsClient.on(event, stableHandler);

    // Cleanup
    return () => {
      wsClient.off(event, stableHandler);
    };
  }, [event, stableHandler, ...deps]);

  // Return send function
  const send = useCallback((data: any) => {
    wsClient.send(event, data);
  }, [event]);

  return { send, isConnected: wsClient.isConnected };
}

/**
 * Hook for joining/leaving rooms
 */
export function useWebSocketRoom(room: string) {
  useEffect(() => {
    wsClient.join(room);

    return () => {
      wsClient.leave(room);
    };
  }, [room]);

  return { isConnected: wsClient.isConnected };
}

/**
 * Hook for WebSocket connection management
 */
export function useWebSocketConnection() {
  useEffect(() => {
    // Connect on mount
    wsClient.connect().catch(console.error);

    // Disconnect on unmount
    return () => {
      wsClient.disconnect();
    };
  }, []);

  return { isConnected: wsClient.isConnected };
}
```

---

### Phase 3: Real-Time Notifications (20 min)

**File**: `apps/unified/src/components/common/NotificationCenter.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useWebSocket } from '@hooks/useWebSocket';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Listen for new notifications
  useWebSocket('notification', (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show toast
    const toastFn = notification.type === 'error' ? toast.error : toast.success;
    toastFn(notification.message, {
      duration: 5000,
      icon: getIcon(notification.type),
    });
  });

  // Listen for alert notifications
  useWebSocket('alert:new', (alert: any) => {
    toast.error(`New Alert: ${alert.title}`, {
      duration: 10000,
      icon: '🚨',
    });
  });

  // Listen for change approval notifications
  useWebSocket('change:approved', (change: any) => {
    toast.success(`Change ${change.number} approved`, {
      icon: '✅',
    });
  });

  // Listen for workflow completion
  useWebSocket('workflow:completed', (workflow: any) => {
    toast.success(`Workflow "${workflow.name}" completed`, {
      icon: '🎉',
    });
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getIcon(notification.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function getIcon(type: string): string {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

const BellIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
```

---

### Phase 4: Live Data Updates (20 min)

**Example**: Real-time updates in Change Management Page

```typescript
// Add to ChangeManagementPage.tsx

import { useWebSocket } from '@hooks/useWebSocket';

export const ChangeManagementPage: React.FC = () => {
  const [changes, setChanges] = useState<ChangeRequest[]>([]);

  // Listen for new changes
  useWebSocket('change:created', (newChange) => {
    setChanges((prev) => [newChange, ...prev]);
    toast.success(`New change request: ${newChange.number}`);
  });

  // Listen for change updates
  useWebSocket('change:updated', (updatedChange) => {
    setChanges((prev) =>
      prev.map((c) => (c.id === updatedChange.id ? updatedChange : c))
    );
  });

  // Listen for change deletions
  useWebSocket('change:deleted', (deletedId) => {
    setChanges((prev) => prev.filter((c) => c.id !== deletedId));
    toast.info('A change request was deleted');
  });

  // Listen for approvals
  useWebSocket('change:approved', (change) => {
    setChanges((prev) =>
      prev.map((c) => (c.id === change.id ? { ...c, state: 'APPROVED' } : c))
    );
    toast.success(`Change ${change.number} was approved`);
  });

  // ... rest of component
};
```

---

### Phase 5: Collaborative Features (15 min)

**Example**: Show who's viewing a page

```typescript
import { useWebSocketRoom } from '@hooks/useWebSocket';
import { useWebSocket } from '@hooks/useWebSocket';

export const CollaborativeView: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  
  // Join room for this page
  useWebSocketRoom('change-management');

  // Listen for user join/leave events
  useWebSocket('user:joined', (user) => {
    setActiveUsers((prev) => [...prev, user.name]);
  });

  useWebSocket('user:left', (user) => {
    setActiveUsers((prev) => prev.filter((u) => u !== user.name));
  });

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <UsersIcon className="w-4 h-4" />
      <span>{activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''} viewing</span>
      {activeUsers.length > 0 && (
        <div className="flex -space-x-2">
          {activeUsers.map((user) => (
            <div
              key={user}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white"
              title={user}
            >
              {user[0]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## Backend Event Examples

### Emit Events from Backend

```javascript
// apps/api/routes/changes.js

// When creating a change
router.post('/changes', async (req, res) => {
  const change = await prisma.change.create({ data: req.body });
  
  // Emit WebSocket event
  io.emit('change:created', change);
  
  res.json(change);
});

// When approving a change
router.post('/changes/:id/approve', async (req, res) => {
  const change = await prisma.change.update({
    where: { id: req.params.id },
    data: { state: 'APPROVED' },
  });
  
  // Emit approval event
  io.emit('change:approved', change);
  
  // Send notification to requester
  io.to(`user:${change.requesterId}`).emit('notification', {
    type: 'success',
    title: 'Change Approved',
    message: `Your change request ${change.number} has been approved`,
  });
  
  res.json(change);
});
```

---

## Testing Real-Time Updates

### Manual Testing

1. **Open two browsers side-by-side**
2. **Login to both**
3. **Navigate to Change Management**
4. **In Browser 1**: Create a new change
5. **In Browser 2**: Should see the change appear immediately
6. **In Browser 1**: Approve the change
7. **In Browser 2**: Should see status update live

### Automated Testing

```typescript
// tests/e2e/realtime/websocket.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Real-Time Updates', () => {
  test('should receive live notifications', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Login both
    await page1.goto('/auth/login');
    await page1.fill('input[name="email"]', 'admin@nova-universe.com');
    await page1.fill('input[name="password"]', 'Admin123!');
    await page1.click('button[type="submit"]');
    
    await page2.goto('/auth/login');
    await page2.fill('input[name="email"]', 'approver@example.com');
    await page2.fill('input[name="password"]', 'Admin123!');
    await page2.click('button[type="submit"]');
    
    // Both navigate to changes
    await page1.goto('/admin/changes');
    await page2.goto('/admin/changes');
    
    // Page 1 creates change
    await page1.click('button:has-text("New Change Request")');
    await page1.fill('input[name="shortDescription"]', 'Test Real-Time');
    await page1.click('button:has-text("Create")');
    
    // Page 2 should see it appear
    await expect(page2.locator('text=Test Real-Time')).toBeVisible({ timeout: 5000 });
  });
});
```

---

## Connection Management

### Auto-Reconnect

Already handled in WebSocketClient class:
- ✅ Automatic reconnection on disconnect
- ✅ Exponential backoff
- ✅ Max retry attempts
- ✅ Connection status tracking

### Connection Status Indicator

```typescript
// Add to header/navbar
import { useWebSocketConnection } from '@hooks/useWebSocket';

export const ConnectionStatus: React.FC = () => {
  const { isConnected } = useWebSocketConnection();

  if (isConnected) return null;

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 text-sm text-center">
      Reconnecting to server...
    </div>
  );
};
```

---

## Performance Optimization

### 1. Debounce Updates

```typescript
import { debounce } from 'lodash';

const debouncedUpdate = debounce((data) => {
  setChanges((prev) => updateChanges(prev, data));
}, 500);

useWebSocket('change:updated', debouncedUpdate);
```

### 2. Batch Updates

```typescript
const [updateQueue, setUpdateQueue] = useState([]);

useWebSocket('change:updated', (change) => {
  setUpdateQueue((prev) => [...prev, change]);
});

// Process queue every second
useEffect(() => {
  const interval = setInterval(() => {
    if (updateQueue.length > 0) {
      setChanges((prev) => applyUpdates(prev, updateQueue));
      setUpdateQueue([]);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [updateQueue]);
```

### 3. Room-Based Filtering

```typescript
// Only subscribe to changes for current page
useWebSocketRoom(`changes:${currentPage}`);

// Backend sends to specific rooms
io.to(`changes:${page}`).emit('change:created', change);
```

---

## Security Considerations

1. **✅ Authentication**: Token-based WebSocket auth
2. **✅ Authorization**: Room-based access control
3. **✅ Validation**: Validate all incoming messages
4. **✅ Rate Limiting**: Prevent message flooding
5. **✅ Encryption**: Use WSS (WebSocket Secure) in production

---

**Status**: Infrastructure exists, implementation TODO  
**Estimated Time**: 1-2 hours  
**Priority**: Medium (after RBAC and E2E tests)
