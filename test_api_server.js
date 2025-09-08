#!/usr/bin/env node

/**
 * Simple API Server Startup Script for Testing
 * Bypasses complex initialization to get the server running
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoints
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'nova-universe-api'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        endpoints: [
            '/health',
            '/api/health',
            '/api/auth/login',
            '/api/v2/auth/login',
            '/api/tickets',
            '/api/users'
        ]
    });
});

// Mock API endpoints for testing
const mockResponse = (req, res) => {
    res.status(501).json({
        error: 'Not Implemented',
        message: 'This endpoint is available but not fully implemented in test mode',
        endpoint: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
};

// Authentication endpoints
app.post('/api/auth/login', mockResponse);
app.post('/api/v2/auth/login', mockResponse);
app.get('/api/auth/status', mockResponse);

// Core resource endpoints
app.get('/api/tickets', mockResponse);
app.post('/api/tickets', mockResponse);
app.get('/api/v2/tickets', mockResponse);
app.post('/api/v2/tickets', mockResponse);

app.get('/api/users', mockResponse);
app.get('/api/v2/users', mockResponse);

// Nova module endpoints
app.get('/api/helix/status', mockResponse);
app.get('/api/v2/helix/session', mockResponse);
app.get('/api/lore/articles', mockResponse);
app.get('/api/v2/lore/articles', mockResponse);
app.get('/api/pulse/dashboard', mockResponse);
app.get('/api/v2/pulse/dashboard', mockResponse);
app.get('/api/orbit/categories', mockResponse);
app.get('/api/v2/orbit/categories', mockResponse);
app.get('/api/synth/conversation', mockResponse);
app.get('/api/v2/synth/conversation', mockResponse);

// SCIM endpoints
app.get('/scim/v2/Users', mockResponse);
app.post('/scim/v2/Users', mockResponse);

// Other endpoints
app.get('/api/integrations', mockResponse);
app.get('/api/v2/integrations', mockResponse);
app.get('/api/monitoring', mockResponse);
app.get('/api/v2/monitoring', mockResponse);
app.get('/api/assets', mockResponse);
app.get('/api/v2/assets', mockResponse);
app.get('/api/configuration', mockResponse);
app.get('/api/v2/configuration', mockResponse);

// API Documentation mock
app.get('/api-docs', (req, res) => {
    res.json({
        openapi: '3.0.3',
        info: {
            title: 'Nova Universe API',
            version: '2.0.0',
            description: 'Test mode API server for endpoint validation'
        },
        servers: [
            { url: `http://localhost:${PORT}/api/v2`, description: 'Current API (v2)' },
            { url: `http://localhost:${PORT}/api/v1`, description: 'Legacy API (v1)' }
        ],
        paths: {
            '/health': { get: { summary: 'Health check', responses: { '200': { description: 'Healthy' } } } },
            '/auth/login': { post: { summary: 'User login', responses: { '200': { description: 'Login successful' } } } },
            '/tickets': { get: { summary: 'List tickets', responses: { '200': { description: 'Ticket list' } } } },
            '/users': { get: { summary: 'List users', responses: { '200': { description: 'User list' } } } }
        }
    });
});

// Catch-all for unmapped endpoints
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'This endpoint does not exist',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'GET /health',
            'GET /api/health', 
            'GET /api-docs',
            'POST /api/auth/login',
            'GET /api/tickets',
            'GET /api/users'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Nova Universe Test API Server running on http://localhost:${PORT}`);
    console.log(`📋 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔧 Test Mode: All endpoints return mock responses`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔄 Received SIGINT, shutting down gracefully');
    process.exit(0);
});