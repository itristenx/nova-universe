// Simple Mock API Server for Testing
// This provides basic endpoints to test the test infrastructure

import http from 'http';
import url from 'url';

const PORT = process.env.PORT || 3000;

// Mock data
const mockData = {
  health: { status: 'ok', timestamp: new Date().toISOString() },
  users: [
    { id: 1, name: 'Test User 1', email: 'user1@test.com', role: 'end_user' },
    { id: 2, name: 'Test User 2', email: 'user2@test.com', role: 'support_agent' },
    { id: 3, name: 'Test Manager', email: 'manager@test.com', role: 'manager' },
    { id: 4, name: 'Test Admin', email: 'admin@test.com', role: 'admin' },
  ],
  tickets: [
    { id: 1, title: 'Test Ticket 1', status: 'open', priority: 'medium', userId: 1 },
    { id: 2, title: 'Test Ticket 2', status: 'closed', priority: 'high', userId: 1 },
  ],
  auth: {
    tokens: new Map(),
    sessions: new Map(),
  },
};

// Request handler
const requestHandler = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (path === '/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.health));
    return;
  }

  // Users endpoint
  if (path === '/api/users' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.users));
    return;
  }

  // Tickets endpoint
  if (path === '/api/tickets' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.tickets));
    return;
  }

  // Create ticket endpoint
  if (path === '/api/tickets' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const ticket = JSON.parse(body);
        const newTicket = {
          id: mockData.tickets.length + 1,
          ...ticket,
          status: ticket.status || 'open',
          createdAt: new Date().toISOString(),
        };
        mockData.tickets.push(newTicket);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newTicket));
      } catch (_error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // User registration endpoint
  if (path === '/api/auth/register' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        const newUser = {
          id: mockData.users.length + 1,
          ...userData,
          role: userData.role || 'end_user',
          createdAt: new Date().toISOString(),
        };
        mockData.users.push(newUser);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newUser));
      } catch (_error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // User login endpoint
  if (path === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const loginData = JSON.parse(body);
        const user = mockData.users.find((u) => u.email === loginData.email);
        if (user) {
          const token = `mock-jwt-token-${user.id}`;
          mockData.auth.tokens.set(token, user.id);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ token, user }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
      } catch (_error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Update ticket endpoint
  if (path.match(/^\/api\/tickets\/\d+$/) && method === 'PUT') {
    const ticketId = parseInt(path.split('/').pop());
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        const ticketIndex = mockData.tickets.findIndex((t) => t.id === ticketId);
        if (ticketIndex !== -1) {
          mockData.tickets[ticketIndex] = { ...mockData.tickets[ticketIndex], ...updates };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockData.tickets[ticketIndex]));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ticket not found' }));
        }
      } catch (_error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Dashboard endpoints
  if (path === '/api/dashboard/metrics' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        totalTickets: mockData.tickets.length,
        openTickets: mockData.tickets.filter((t) => t.status === 'open').length,
        closedTickets: mockData.tickets.filter((t) => t.status === 'closed').length,
      }),
    );
    return;
  }

  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
};

// Create server
const server = http.createServer(requestHandler);

// Start server
server.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Users: http://localhost:${PORT}/api/users`);
  console.log(`Tickets: http://localhost:${PORT}/api/tickets`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
