#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3002', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Nova Universe API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// Simple auth endpoints for testing
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Simple mock authentication
  if (email === 'admin@nova.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        email: email,
        name: 'Admin User',
        role: 'admin',
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 1,
      email: 'admin@nova.com',
      name: 'Admin User',
      role: 'admin',
    },
  });
});

// Helix authentication endpoints for frontend compatibility
app.post('/api/v1/helix/login/tenant/discover', (req, res) => {
  const { email } = req.body;

  res.json({
    success: true,
    tenant: {
      id: 'nova-universe',
      name: 'Nova Universe',
      domain: 'nova.com',
      logo: null,
    },
  });
});

app.post('/api/v1/helix/login/authenticate', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@nova.com' && password === 'admin123') {
    res.json({
      success: true,
      requiresMfa: false,
      user: {
        id: 1,
        email: email,
        name: 'Admin User',
        role: 'admin',
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }
});

app.post('/api/v1/helix/login/mfa/verify', (req, res) => {
  res.json({
    success: true,
    token: 'mock-helix-jwt-token-' + Date.now(),
    user: {
      id: 1,
      email: 'admin@nova.com',
      name: 'Admin User',
      role: 'admin',
    },
  });
});

app.post('/api/v1/helix/login/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.emit('connected', {
    message: 'Connected to Nova Universe API',
    timestamp: new Date().toISOString(),
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Nova Universe Test API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket ready on port ${PORT}`);
  console.log(`🔑 Test credentials: admin@nova.com / admin123`);
});
