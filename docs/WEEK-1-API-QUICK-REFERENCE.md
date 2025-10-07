# Week 1 API Quick Reference

Quick reference for frontend developers integrating Week 1 backend APIs.

---

## 🔑 Authentication

All protected endpoints require JWT token in Authorization header:

```javascript
const response = await fetch('/api/v1/agent/queue', {
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});
```

WebSocket requires token in handshake:

```javascript
import io from 'socket.io-client';

const socket = io('/chat', {
  auth: { token: authToken }
});
```

---

## 📡 Agent Portal APIs

**Base URL**: `/api/v1/agent`

### Get Agent Queue

```javascript
// GET /api/v1/agent/queue
const { data } = await fetch('/api/v1/agent/queue?status=IN_PROGRESS&priority=CRITICAL');

// Response
{
  "success": true,
  "data": [
    {
      "id": "ticket-id",
      "ticketNumber": "TKT-001",
      "title": "Laptop not working",
      "status": "IN_PROGRESS",
      "priority": "CRITICAL",
      "requester": { "id": "...", "name": "John Doe", "email": "john@company.com" },
      "sla": {
        "breached": false,
        "targetMinutes": 60,
        "timeRemainingMinutes": 25,
        "ageMinutes": 35
      }
    }
  ],
  "meta": { "count": 5, "agentId": "...", "timestamp": "2025-01-..." }
}
```

### Get Agent Stats

```javascript
// GET /api/v1/agent/stats
const { data } = await fetch('/api/v1/agent/stats');

// Response
{
  "success": true,
  "data": {
    "totalTickets": 150,
    "openTickets": 12,
    "resolvedToday": 8,
    "resolvedThisWeek": 42,
    "resolvedThisMonth": 125,
    "avgResponseTimeMinutes": 15,
    "satisfactionRating": 4.7,
    "totalRatings": 89
  }
}
```

### Get Team Members

```javascript
// GET /api/v1/agent/team
const { data } = await fetch('/api/v1/agent/team');

// Response
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "name": "Jane Smith",
      "email": "jane@company.com",
      "avatar": "https://...",
      "role": "AGENT",
      "status": "AVAILABLE",
      "activeTickets": 5,
      "isCurrentUser": false
    }
  ],
  "meta": { "department": "IT Support", "count": 8 }
}
```

### Get Achievements

```javascript
// GET /api/v1/agent/achievements
const { data } = await fetch('/api/v1/agent/achievements');

// Response
{
  "success": true,
  "data": [
    {
      "id": "achievement-id",
      "name": "Speed Demon",
      "description": "Resolved 10 tickets in one day",
      "icon": "🏆",
      "category": "PERFORMANCE",
      "points": 50,
      "earnedAt": "2025-01-15T10:30:00Z",
      "progress": 100
    }
  ],
  "meta": { "totalPoints": 450, "achievementCount": 12 }
}
```

---

## 📚 Knowledge Base APIs

**Base URL**: `/api/v1/knowledge`  
**Auth**: Public (no token required)

### Get Popular Articles

```javascript
// GET /api/v1/knowledge/popular?limit=10&category=IT
const { data } = await fetch('/api/v1/knowledge/popular?limit=10');

// Response
{
  "success": true,
  "data": [
    {
      "id": "article-id",
      "title": "How to reset your password",
      "summary": "Step-by-step guide...",
      "category": "Account Management",
      "tags": ["password", "security", "account"],
      "views": 1523,
      "helpful": 89,
      "author": { "id": "...", "name": "Admin", "avatar": "..." },
      "createdAt": "2024-12-01T00:00:00Z",
      "updatedAt": "2025-01-10T00:00:00Z"
    }
  ],
  "meta": { "count": 10, "timestamp": "..." }
}
```

### Search Articles

```javascript
// GET /api/v1/knowledge/search?q=password&limit=20
const { data } = await fetch('/api/v1/knowledge/search?q=password');

// Response format same as popular
```

### Get Categories

```javascript
// GET /api/v1/knowledge/categories
const { data } = await fetch('/api/v1/knowledge/categories');

// Response
{
  "success": true,
  "data": [
    { "name": "Account Management", "articleCount": 25 },
    { "name": "IT Support", "articleCount": 18 }
  ],
  "meta": { "count": 8 }
}
```

### Get Article Details

```javascript
// GET /api/v1/knowledge/:id
const { data } = await fetch('/api/v1/knowledge/article-123');

// Response
{
  "success": true,
  "data": {
    "id": "article-123",
    "title": "...",
    "summary": "...",
    "content": "Full article content in Markdown...",
    "category": "...",
    "tags": [...],
    "views": 1524, // Incremented automatically
    "helpful": 89,
    "author": {...},
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 🛠️ Services APIs

**Base URL**: `/api/v1/services`  
**Auth**: Public (read-only), Protected (create request)

### Get Popular Services

```javascript
// GET /api/v1/services/popular?limit=10
const { data } = await fetch('/api/v1/services/popular');

// Response
{
  "success": true,
  "data": [
    {
      "id": "service-id",
      "name": "Request New Laptop",
      "description": "Order a new laptop...",
      "category": "Hardware",
      "icon": "💻",
      "requests": 345,
      "rating": 4.8,
      "avgFulfillmentTime": 240, // minutes
      "price": 1200.00,
      "currency": "USD",
      "requiresApproval": true,
      "tags": ["hardware", "laptop"]
    }
  ],
  "meta": { "count": 10 }
}
```

### Get Featured Services

```javascript
// GET /api/v1/services/featured
const { data } = await fetch('/api/v1/services/featured');

// Response format same as popular (max 8 services)
```

### Get Categories

```javascript
// GET /api/v1/services/categories
const { data } = await fetch('/api/v1/services/categories');

// Response
{
  "success": true,
  "data": [
    { "name": "Hardware", "serviceCount": 15 },
    { "name": "Software", "serviceCount": 22 }
  ]
}
```

### Submit Service Request

```javascript
// POST /api/v1/services/:id/request
const response = await fetch('/api/v1/services/service-123/request', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    additionalInfo: 'Need for remote work',
    urgency: 'HIGH'
  })
});

const { data } = await response.json();

// Response
{
  "success": true,
  "data": {
    "id": "request-id",
    "requestNumber": "REQ-001",
    "service": { "id": "...", "name": "Request New Laptop" },
    "requester": { "id": "...", "name": "John Doe", "email": "..." },
    "status": "PENDING_APPROVAL", // or "NEW" if no approval required
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

---

## 👥 Directory Management APIs

**Base URL**: `/api/v1/directory`  
**Auth**: Admin role required

### Get Users

```javascript
// GET /api/v1/directory/users?page=1&perPage=25&search=john&department=IT&status=ACTIVE
const { data, pagination } = await fetch('/api/v1/directory/users?page=1&perPage=25');

// Response
{
  "success": true,
  "data": [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@company.com",
      "department": "IT Support",
      "role": "AGENT",
      "status": "ACTIVE",
      "avatarUrl": "https://...",
      "lastLogin": "2025-01-15T09:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 25,
    "totalCount": 150,
    "totalPages": 6
  }
}
```

### Get Groups

```javascript
// GET /api/v1/directory/groups
const { data } = await fetch('/api/v1/directory/groups');

// Response
{
  "success": true,
  "data": [
    {
      "id": "group-id",
      "name": "IT Support Team",
      "description": "All IT support agents",
      "memberCount": 12,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { "count": 5 }
}
```

### Bulk Activate Users

```javascript
// POST /api/v1/directory/users/bulk-activate
const response = await fetch('/api/v1/directory/users/bulk-activate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userIds: ['user-1', 'user-2', 'user-3']
  })
});

// Response
{
  "success": true,
  "data": { "updatedCount": 3 }
}
```

### Bulk Suspend Users

```javascript
// POST /api/v1/directory/users/bulk-suspend
// Same format as bulk-activate
```

### Bulk Delete Users

```javascript
// DELETE /api/v1/directory/users/bulk-delete
const response = await fetch('/api/v1/directory/users/bulk-delete', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userIds: ['user-1', 'user-2']
  })
});

// Response
{
  "success": true,
  "data": { "deletedCount": 2 }
}
```

### Get Audit Log

```javascript
// GET /api/v1/directory/audit?page=1&perPage=25&action=CREATE_USER
const { data, pagination } = await fetch('/api/v1/directory/audit');

// Response
{
  "success": true,
  "data": [
    {
      "id": "log-id",
      "action": "BULK_ACTIVATE_USERS",
      "user": { "id": "...", "name": "Admin User", "email": "..." },
      "metadata": { "userIds": [...], "count": 3 },
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": { "page": 1, "perPage": 25, "totalCount": 89, "totalPages": 4 }
}
```

---

## 💬 Live Chat WebSocket

**Namespace**: `/chat`  
**Auth**: Token in handshake

### Connect

```javascript
import io from 'socket.io-client';

const socket = io('/chat', {
  auth: { token: authToken }
});

socket.on('connect', () => {
  console.log('Connected to chat:', socket.id);
});

socket.on('error', (error) => {
  console.error('Chat error:', error);
});
```

### Join Chat Session

```javascript
socket.emit('join_session', {
  sessionId: 'session-123',
  ticketId: 'ticket-456' // optional
});

// Server responds with chat history
socket.on('chat_history', ({ sessionId, messages, timestamp }) => {
  console.log('Chat history:', messages);
  // messages = [{ id, sessionId, type, from, userId, userName, content, timestamp }, ...]
});

// Notification when another user joins
socket.on('user_joined', ({ userId, userName, timestamp }) => {
  console.log(`${userName} joined the chat`);
});
```

### Send Message

```javascript
socket.emit('send_message', {
  sessionId: 'session-123',
  message: 'Hello, I need help with my laptop',
  type: 'message' // or 'status'
});

// Receive messages from others
socket.on('new_message', (message) => {
  console.log('New message:', message);
  // message = { id, sessionId, type, from, userId, userName, content, timestamp }
});
```

### Typing Indicator

```javascript
// When user starts typing
socket.emit('typing', {
  sessionId: 'session-123',
  isTyping: true
});

// When user stops typing
socket.emit('typing', {
  sessionId: 'session-123',
  isTyping: false
});

// Receive typing indicators from others
socket.on('user_typing', ({ userId, userName, isTyping, timestamp }) => {
  if (isTyping) {
    console.log(`${userName} is typing...`);
  } else {
    console.log(`${userName} stopped typing`);
  }
});
```

### Agent Joins (for agents only)

```javascript
// Only works if user has AGENT/SUPERVISOR/MANAGER/ADMIN role
socket.emit('agent_join', {
  sessionId: 'session-123'
});

// User receives notification
socket.on('agent_joined', ({ agentId, agentName, timestamp }) => {
  console.log(`Agent ${agentName} has joined the chat`);
});

socket.on('agent_left', ({ agentName, timestamp }) => {
  console.log(`Agent ${agentName} has left the chat`);
});
```

### Disconnect

```javascript
socket.disconnect();

// Others receive notification
socket.on('user_left', ({ userName, timestamp }) => {
  console.log(`${userName} left the chat`);
});
```

---

## ⚠️ Error Handling

All APIs return errors in this format:

```javascript
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error message (optional)",
  "details": [ // Validation errors (optional)
    { "field": "userIds", "message": "userIds must be an array" }
  ]
}
```

**Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔄 Pagination

Paginated endpoints return this format:

```javascript
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,        // Current page
    "perPage": 25,    // Items per page
    "totalCount": 150,// Total items
    "totalPages": 6   // Total pages
  }
}
```

---

## 🚀 Example: Frontend Integration

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

export function useAgentQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch('/api/v1/agent/queue', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch queue');
        
        const { data } = await response.json();
        setQueue(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
    
    // Refresh every 2 minutes (cache TTL)
    const interval = setInterval(fetchQueue, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { queue, loading, error };
}
```

### WebSocket Hook Example

```typescript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export function useChat(sessionId: string) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io('/chat', { auth: { token } });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join_session', { sessionId });
    });

    newSocket.on('chat_history', ({ messages }) => {
      setMessages(messages);
    });

    newSocket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [sessionId]);

  const sendMessage = (message: string) => {
    if (socket && connected) {
      socket.emit('send_message', { sessionId, message });
    }
  };

  return { messages, sendMessage, connected };
}
```

---

## 📝 Notes

- All endpoints use `/api/v1/` prefix
- Timestamps are in ISO 8601 format (UTC)
- All responses include `success: true/false`
- Public endpoints don't require authentication
- Protected endpoints require JWT in Authorization header
- WebSocket requires JWT in handshake auth object
- Rate limits apply to all endpoints (see WEEK-1-BACKEND-IMPLEMENTATION-STATUS.md)

---

**For full documentation, see**: `WEEK-1-BACKEND-IMPLEMENTATION-STATUS.md`
