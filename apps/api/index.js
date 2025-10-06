// All imports at the top
import { logger } from './logger.js';
import assetsRouter from './routes/assets.js';
import configurationRouter from './routes/configuration.js';
import directoryRouter from './routes/directory.js';
import integrationsRouter from './routes/integrations.js';
import catalogItemsRouter from './routes/catalogItems.js';
import organizationsRouter from './routes/organizations.js';
import rolesRouter from './routes/roles.js';
import searchRouter from './routes/search.js';
import serverRouter from './routes/server.js';
import logsRouter from './routes/logs.js'; // Import logsRouter
import reportsRouter from './routes/reports.js';
import vipRouter from './routes/vip.js';
import workflowsRouter from './routes/workflows.js';
import modulesRouter from './routes/modules.js';
import apiKeysRouter from './routes/apiKeys.js';
import websocketRouter from './routes/websocket.js';
import helpscoutRouter from './routes/helpscout.js';
import analyticsRouter from './routes/analytics.js';
import monitoringRouter from './routes/monitoring.js';
// Defer loading heavy AI Fabric until explicitly enabled to keep demo startup light
let aiFabricRouter = null;
// Heavy MCP server (may pull AI dependencies); load conditionally
let mcpServerRouter = null;
import setupRouter from './routes/setup.js';
import coreRouter from './routes/core.js';
import statusSummaryRouter from './routes/status.js';
import announcementsRouter from './routes/announcements.js';
// Cosmo routes use AI Fabric; load conditionally
let cosmoRouter = null;
import beaconRouter from './routes/beacon.js';
import goalertProxyRouter from './routes/goalert-proxy.js';
import uptimeKumaProxyRouter from './routes/uptime-kuma-proxy.js';
import uptimeKumaWebSocketRouter from './routes/uptime-kuma-websocket.js';
import unifiedMonitoringRouter from './routes/unified-monitoring.js';
import alertsRouter from './routes/alerts.js';
import cmdbRouter from './routes/cmdb.js';
import cmdbExtendedRouter from './routes/cmdbExtended.js';
import notificationsRouter from './routes/notifications.js'; // Universal Notification Platform
import user360Router from './routes/user360.js'; // User 360 API
import user360InteractionsRouter from './routes/user360-interactions.js'; // User 360 Interactions API
import appSwitcherRouter from './routes/app-switcher.js'; // Enhanced App Switcher API
// AI Control Tower routes are heavy (TensorFlow); load only if enabled
let aiControlTowerRouter = null;
import authRouter from './routes/auth.js';
import ticketsRouter from './routes/tickets.js';
import itsmRouter from './routes/itsm.js'; // Enhanced ITSM routes
import serviceRequestsRouter from './routes/service-requests.js'; // Service Requests API
// TEMPORARILY COMMENTED OUT - ESM IMPORT ISSUES WITH @prisma/client
// import serviceCatalogAPIRouter from './routes/service-catalog.js'; // Service Catalog API  
// import incidentsRouter from './routes/incidents.js'; // Incidents API
// import changesRouter from './routes/changes.js'; // Changes API
// import problemsRouter from './routes/problems.js'; // Problems API
// import knowledgeArticlesRouter from './routes/knowledge-articles.js'; // Knowledge Articles API
// import workflowAnalyticsRouter from './routes/workflow-analytics.js'; // Workflow Analytics API
// import mlPipelineRouter from './routes/ml-pipeline.js'; // ML Pipeline Management - TEMPORARILY DISABLED
// import novaRAGRouter from './routes/nova-rag.js'; // Nova RAG with RBAC - TEMPORARILY DISABLED
// import aiAgentRouter from './routes/ai-agent.js'; // Nova AI Agent Framework - TEMPORARILY DISABLED
import spacesRouter from './routes/spaces.js';
import commsRouter from './routes/comms.js'; // Nova Comms Slack integration
import novaTVRouter from './routes/nova-tv-prisma.js'; // Nova TV - Channel Management (Prisma-backed)
import novaTVDigitalSignageRouter from './src/routes/nova-tv-digital-signage.js'; // Nova TV Digital Signage (media, playlists)
import emailActionsRouter from './routes/email-actions.js'; // Enhanced Email Actions for Workflows
import customerActivityRouter from './routes/customer-activity.js'; // Customer Activity & Email Communication Tracking
// Service Catalog API routes
import serviceCatalogRouter from './routes/serviceCatalog.js';
import serviceCatalogRequestsRouter from './routes/serviceCatalogRequests.js';
import rbacRouter from './routes/rbac.js';
import approvalsRouter from './routes/approvals.js';
import featureFlagsRouter from './routes/featureFlags.js';
// import emailIntegrationRouter from './routes/email-integration.js'; // TEMPORARILY DISABLED
import emailTemplatesRouter from './routes/email-templates.js';
import abTestingRouter from './routes/abTesting.js';
import costCentersRouter from './routes/costCenters.js';
// Nova module routes
import { createUploadsMiddleware } from './middleware/uploads.js';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import http from 'http';
import https from 'https';
import nodemailer from 'nodemailer';
import passport from 'passport';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import ConfigurationManager from './config/app-settings.js';
import db, { closeDatabase } from './db.js';
import events from './events.js';
import { sign, verify } from './jwt.js';
import { authRateLimit } from './middleware/rateLimiter.js';
import { requestLogger, securityHeaders } from './middleware/security.js';
import { configureCORS, sanitizeInput } from './middleware/security.js';
import { validateEmail, validateKioskRegistration } from './middleware/validation.js';
import helixRouter from './routes/helix.js';
import helixUniversalLoginRouter from './routes/helix-universal-login.js';
import loreRouter from './routes/lore.js';
import orbitRouter from './routes/orbit.js';
import pulseRouter from './routes/pulse.js';
import inventoryRouter from './routes/inventory.js';
import scimRouter from './routes/scim.js';
import scimMonitorRouter from './routes/scimMonitor.js';
import oauth2Router from './routes/oauth2.js';
import tenantDiscoveryRouter from './routes/tenant-discovery.js';
import synthRouter from './routes/synth.js';
// Synth v2 routes also use AI Fabric; load conditionally
let synthV2Router = null;
import { setupGraphQL } from './graphql.js';
import { initializeSlackApp, startSlackApp } from './services/nova-comms.js';
import { validateProductionEnvironment } from './config/production-validation.js';
import PerformanceMonitor from './middleware/performance-monitor.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TLS configuration
const CERT_PATH = process.env.TLS_CERT_PATH;
const KEY_PATH = process.env.TLS_KEY_PATH;

// Configure environment
dotenv.config();

// Validate production environment early in startup
validateProductionEnvironment();

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Authentication/feature flags must be defined before any middleware uses them
const DISABLE_AUTH = process.env.DISABLE_AUTH === 'true' || process.env.NODE_ENV === 'test';
const SCIM_TOKEN = process.env.SCIM_TOKEN || '';
const KIOSK_TOKEN = process.env.KIOSK_TOKEN || '';
// JWT_SECRET available for future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

// Initialize Express app
const app = express();
// Trust reverse proxy headers in UAT/Production for correct protocol and IP
app.set('trust proxy', 1);

// Create HTTP server and WebSocket server
let server;
if (CERT_PATH && KEY_PATH && fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
  // Create HTTPS server with TLS certificates
  const options = {
    cert: fs.readFileSync(CERT_PATH),
    key: fs.readFileSync(KEY_PATH),
  };
  server = https.createServer(options, app);
  logger.info('Starting HTTPS server with TLS certificates');
} else {
  // Fallback to HTTP server
  server = http.createServer(app);
  if (CERT_PATH || KEY_PATH) {
    logger.warning('TLS certificates not found or incomplete, falling back to HTTP');
  }
}
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// WebSocket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token && !DISABLE_AUTH) {
      return next(new Error('Authentication required'));
    }

    if (token) {
      const payload = verify(token);
      if (payload) {
        // Fetch user details from database
        db.get('SELECT id, name, email FROM users WHERE id=$1', [payload.id], (err, user) => {
          if (err || !user) {
            return next(new Error('Invalid authentication'));
          }
          socket.userId = user.id;
          socket.userEmail = user.email;
          socket.userName = user.name;
          next();
        });
      } else {
        next(new Error('Invalid token'));
      }
    } else {
      // Auth disabled - allow connection
      next();
    }
  } catch (error) {
    logger.warn('WebSocket authentication failed:', error.message);
    next(new Error('Authentication failed'));
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`WebSocket connected: ${socket.id} (User: ${socket.userName || 'anonymous'})`);

  // Join user to their personal room for targeted updates
  if (socket.userId) {
    socket.join(`user_${socket.userId}`);
  }

  // Join admin room if user has admin permissions
  if (socket.userId) {
    // Check if user has admin permissions
    db.all(
      `SELECT r.name AS role, p.name AS perm
       FROM user_roles ur
       JOIN roles r ON ur.roleId=r.id
       LEFT JOIN role_permissions rp ON r.id=rp."roleId"
       LEFT JOIN permissions p ON rp."permissionId"=p.id
       WHERE ur.userId=$1`,
      [socket.userId],
      (err, rows) => {
        if (!err) {
          const permissions = rows.map((r) => r.perm).filter(Boolean);
          const roles = rows.map((r) => r.role);

          if (roles.includes('admin') || permissions.includes('admin')) {
            socket.join('admin');
            logger.info(`User ${socket.userName} joined admin room`);
          }
        }
      },
    );
  }

  // Handle subscription to specific data types
  socket.on('subscribe', (dataType) => {
    const allowedSubscriptions = [
      'tickets',
      'analytics',
      'kiosks',
      'users',
      'notifications',
      'system_status',
      'modules',
      'uptime-kuma',
    ];

    if (allowedSubscriptions.includes(dataType)) {
      socket.join(dataType);
      logger.info(`Socket ${socket.id} subscribed to ${dataType}`);
    }
  });

  // Handle unsubscription
  socket.on('unsubscribe', (dataType) => {
    socket.leave(dataType);
    logger.info(`Socket ${socket.id} unsubscribed from ${dataType}`);
  });

  socket.on('disconnect', (reason) => {
    logger.info(`WebSocket disconnected: ${socket.id} (${reason})`);
  });
});

// Export io for use in other modules
app.io = io;

// Initialize WebSocket manager
import WebSocketManager from './websocket/events.js';
const wsManager = new WebSocketManager(io);
app.wsManager = wsManager;

// Initialize Uptime Kuma WebSocket handler (only if Uptime Kuma is available)
import {
  initializeUptimeKumaWebSocket,
  shutdownUptimeKumaWebSocket,
} from './websocket/uptime-kuma-handler.js';

// Only initialize Uptime Kuma WebSocket if the service is configured and available
if (process.env.UPTIME_KUMA_URL || process.env.ENABLE_UPTIME_KUMA === 'true') {
  logger.info('Uptime Kuma integration enabled, initializing WebSocket handler...');
  initializeUptimeKumaWebSocket().catch((error) => {
    logger.warn('Uptime Kuma WebSocket handler not available (this is normal if Uptime Kuma is not running)', { 
      error: error.message,
      note: 'Set UPTIME_KUMA_URL or ENABLE_UPTIME_KUMA=true to enable this integration'
    });
  });
} else {
  logger.info('Uptime Kuma integration disabled (set UPTIME_KUMA_URL or ENABLE_UPTIME_KUMA=true to enable)');
}

// Graceful shutdown handler
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  shutdownUptimeKumaWebSocket();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  shutdownUptimeKumaWebSocket();
  process.exit(0);
});
// --- Version helpers ---
function getApiVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function getUiVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../nova-core/package.json'), 'utf8'),
    );
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function getCliVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

// Swagger/OpenAPI setup with comprehensive API documentation
let swaggerJSDoc, swaggerUi, yaml;
if (process.env.NODE_ENV !== 'test' || process.env.FORCE_LISTEN === 'true') {
  swaggerJSDoc = (await import('swagger-jsdoc')).default;
  swaggerUi = (await import('swagger-ui-express')).default;
  yaml = (await import('js-yaml')).default;
} else {
  // Jest/test mode: provide a no-op function to avoid import errors
  swaggerJSDoc = () => ({ openapi: '3.0.0', info: {}, paths: {} });
  swaggerUi = { serve: (req, res, next) => next(), setup: () => (req, res, next) => next() };
  yaml = { load: () => ({}) };
}

// Load comprehensive OpenAPI v3 specification
let comprehensiveSpec = {};
try {
  const specPath = path.join(__dirname, 'openapi_spec_v3.yaml');
  if (fs.existsSync(specPath)) {
    const specContent = fs.readFileSync(specPath, 'utf8');
    comprehensiveSpec = yaml.load(specContent);
    logger.info('📋 Loaded comprehensive OpenAPI v3 specification');
  }
} catch (error) {
  logger.warn('Failed to load comprehensive OpenAPI spec:', error.message);
}

// Enhanced Swagger definition with V1 (2025.08) versioning
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Nova Universe Platform API',
    version: 'v1 (2025.08)',
    description: `
# Nova Universe IT Service Management Platform API v1 (2025.08)

A comprehensive RESTful API for managing IT service operations, including ticket management, 
asset tracking, knowledge base, user directory, AI-powered automation, and more.

## 🎯 API Version: V1 (2025.08)

This is the **current and only supported version** of the Nova Universe API.
- **Version**: V1
- **Release**: 2025.08
- **Status**: Stable
- **Base Path**: \`/api/v1\`

Following Microsoft Azure REST API best practices:
- URI path versioning for clarity and simplicity
- No backward compatibility for legacy versions
- Clean, consistent endpoint structure
- Semantic versioning for predictable updates

## 🔐 Authentication

This API uses **Bearer token authentication**. Include your API token in the Authorization header:

\`\`\`
Authorization: Bearer your-jwt-token-here
\`\`\`

Tokens can be obtained through the \`/api/v1/auth/login\` endpoint.

### Alternative Authentication Methods

- **API Key**: Use \`X-API-Key\` header for service-to-service authentication
- **OAuth 2.0**: Available at \`/api/v1/oauth\` endpoints
- **SAML SSO**: Enterprise SSO via \`/auth/saml\` (if configured)

## 🚦 Rate Limiting

API requests are rate limited to ensure fair usage and system stability:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour
- **Burst protection**: Maximum 100 requests per minute

Rate limit information is included in response headers:
- \`X-RateLimit-Limit\`: Request limit per window
- \`X-RateLimit-Remaining\`: Requests remaining
- \`X-RateLimit-Reset\`: Unix timestamp when window resets
- \`Retry-After\`: Seconds to wait before retry (when rate limited)

## 📊 Response Format

All API responses follow a consistent JSON structure:

### Success Response
\`\`\`json
{
  "success": true,
  "data": { ... },
  "pagination": {     // For paginated responses
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4
  },
  "meta": {          // Additional metadata
    "requestId": "req_123456",
    "timestamp": "2025-08-15T10:30:00Z",
    "version": "v1"
  }
}
\`\`\`

### Error Response
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [],        // Validation errors, if applicable
    "timestamp": "2025-08-15T10:30:00Z",
    "requestId": "req_123456",
    "path": "/api/v1/resource",
    "statusCode": 400
  }
}
\`\`\`

## 🔍 Filtering, Sorting, and Pagination

Most list endpoints support advanced querying:

### Pagination
- \`page\`: Page number (1-based, default: 1)
- \`limit\`: Items per page (1-100, default: 25)

### Sorting
- \`sort\`: Field to sort by (e.g., \`createdAt\`, \`name\`)
- \`order\`: Sort direction (\`asc\` or \`desc\`, default: \`desc\`)

### Filtering
- Use field-specific query parameters
- Example: \`?status=open&priority=high\`

### Search
- \`search\`: Full-text search across multiple fields
- \`q\`: Alias for search parameter

### Example
\`\`\`
GET /api/v1/tickets?page=1&limit=50&status=open&sort=priority&order=desc&search=network
\`\`\`

## 📡 WebSocket Support

Real-time updates are available via WebSocket connections at \`/socket.io\`.

### Subscribing to Updates
\`\`\`javascript
const socket = io('wss://your-domain.com', {
  auth: { token: 'your-jwt-token' }
});

socket.on('ticket:updated', (data) => {
  console.log('Ticket updated:', data);
});
\`\`\`

### Available Events
- \`ticket:created\`, \`ticket:updated\`, \`ticket:deleted\`
- \`alert:triggered\`, \`alert:resolved\`
- \`notification:new\`
- \`system:status\`

## 🏗️ Resource Organization

The API is organized into logical resource groups:

### Core Resources
- \`/api/v1/auth\` - Authentication & Authorization
- \`/api/v1/organizations\` - Organization Management
- \`/api/v1/directory\` - User Directory & LDAP
- \`/api/v1/roles\` - Role-Based Access Control

### ITSM Resources
- \`/api/v1/tickets\` - Ticket Management
- \`/api/v1/service-requests\` - Service Requests
- \`/api/v1/incidents\` - Incident Management
- \`/api/v1/service-catalog\` - Service Catalog

### AI & Automation
- \`/api/v1/synth\` - AI Orchestration Engine
- \`/api/v1/cosmo\` - Conversational AI
- \`/api/v1/ai-fabric\` - Enterprise AI Platform

### Monitoring & Alerts
- \`/api/v1/monitoring\` - System Monitoring
- \`/api/v1/alerts\` - Alert Management
- \`/api/v1/notifications\` - Notification Platform

## 🛡️ Security Best Practices

- **Use HTTPS**: All production requests must use HTTPS
- **Rotate tokens**: Refresh JWT tokens before expiration
- **Validate input**: All input is validated and sanitized
- **Rate limits**: Respect rate limits to avoid throttling
- **Audit logs**: All API calls are logged for security auditing

## 📞 Support

- **Documentation**: https://docs.nova-universe.com
- **API Support**: api-support@nova-universe.com
- **Status Page**: https://status.nova-universe.com
    `,
    contact: {
      name: 'Nova Universe API Support',
      email: 'api-support@nova-universe.com',
      url: 'https://docs.nova-universe.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    termsOfService: 'https://nova-universe.com/terms',
  },
  servers: [
    { 
      url: '/api/v1', 
      description: 'Nova Universe API V1 (2025.08) - Current Stable Version' 
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /api/v1/auth/login endpoint',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for service-to-service authentication',
      },
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination (1-based)',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
      },
      SortParam: {
        name: 'sort',
        in: 'query',
        description: 'Field to sort by',
        schema: { type: 'string' },
      },
      OrderParam: {
        name: 'order',
        in: 'query',
        description: 'Sort order',
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
      },
      SearchParam: {
        name: 'search',
        in: 'query',
        description: 'Full-text search query',
        schema: { type: 'string' },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: 'UNAUTHORIZED' },
                    message: { type: 'string', example: 'Authentication required' },
                    statusCode: { type: 'integer', example: 401 },
                  },
                },
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: 'FORBIDDEN' },
                    message: { type: 'string', example: 'Insufficient permissions' },
                    statusCode: { type: 'integer', example: 403 },
                  },
                },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: 'NOT_FOUND' },
                    message: { type: 'string', example: 'Resource not found' },
                    statusCode: { type: 'integer', example: 404 },
                  },
                },
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'Invalid request data',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: 'VALIDATION_ERROR' },
                    message: { type: 'string', example: 'Invalid request data' },
                    details: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          field: { type: 'string' },
                          message: { type: 'string' },
                        },
                      },
                    },
                    statusCode: { type: 'integer', example: 400 },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
};

// Combine JSDoc-generated spec with comprehensive YAML spec
const swaggerOptions = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, 'routes', '*.js'),
    path.join(__dirname, 'routes', 'nova-modules', '*.js'),
    path.join(__dirname, 'openapi_spec.yaml'),
    path.join(__dirname, 'openapi_spec_v3.yaml'),
  ],
};

let swaggerSpec = swaggerJSDoc(swaggerOptions);

// Merge with comprehensive specification if available and update server URLs
if (comprehensiveSpec && comprehensiveSpec.paths) {
  swaggerSpec = {
    ...swaggerSpec,
    ...comprehensiveSpec,
    info: {
      ...swaggerSpec.info,
      ...comprehensiveSpec.info,
      version: getApiVersion(), // Ensure version is from package.json
    },
    paths: {
      ...swaggerSpec.paths,
      ...comprehensiveSpec.paths,
    },
    components: {
      ...swaggerSpec.components,
      ...comprehensiveSpec.components,
      securitySchemes: {
        ...swaggerSpec.components?.securitySchemes,
        ...comprehensiveSpec.components?.securitySchemes,
      },
    },
  };
  logger.info('📋 Merged comprehensive OpenAPI specification with JSDoc spec');
}

// Helper function to update server URLs after PORT is defined
function updateSwaggerServerUrls() {
  const PORT = Number(process.env.API_PORT || process.env.PORT || 3000);
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.API_BASE_URL || process.env.BASE_URL || 'https://api.nova-universe.com'
      : process.env.API_BASE_URL || process.env.BASE_URL || `http://localhost:${PORT}`;

  const servers = [
    {
      url: `${baseUrl}/api/v1`,
      description: 'Nova Universe API V1 (2025.08) - Current Stable Version',
    },
  ];

  swaggerSpec.servers = servers;

  if (process.env.NODE_ENV !== 'production') {
    logger.info('📋 Swagger server URLs configured:', servers);
  }
}

// Debug: Log the swagger spec to see if it's being generated
if (process.env.NODE_ENV === 'development') {
  logger.debug('📋 Swagger spec generated with paths:', Object.keys(swaggerSpec.paths || {}));
  logger.debug('📋 API version:', swaggerSpec.info?.version);
}

// Environment variable validation helper
function validateEnv() {
  // Required variables for secure production operation
  const requiredVars = ['SESSION_SECRET', 'JWT_SECRET'];

  // Only require SMTP in production
  if (process.env.NODE_ENV === 'production') {
    requiredVars.push('SMTP_HOST', 'SMTP_USER', 'SMTP_PASS');
  }

  // Optional variables (warn if missing, but not fatal)
  const optionalVars = [
    'CORS_ORIGINS',
    'SAML_ENTRY_POINT',
    'SAML_ISSUER',
    'SAML_CALLBACK_URL',
    'SAML_CERT',
    'SLACK_WEBHOOK_URL',
    'TLS_CERT_PATH',
    'TLS_KEY_PATH',
    'LOG_RETENTION_DAYS',
    'RATE_LIMIT_WINDOW',
    'SUBMIT_TICKET_LIMIT',
    'API_LOGIN_LIMIT',
    'AUTH_LIMIT',
    'DISABLE_AUTH',
    'DISABLE_CLEANUP',
    'DEBUG_CORS',
    'NODE_ENV',
    'API_PORT',
    'SCIM_TOKEN',
    'KIOSK_TOKEN',
  ];
  let hasError = false;
  for (const key of requiredVars) {
    if (!process.env[key]) {
      logger.error(`Missing required environment variable: ${key}`);
      hasError = true;
    }
  }
  // Only log missing optional variables if in debug mode
  if (process.env.DEBUG_ENV_VARS === 'true') {
    for (const key of optionalVars) {
      if (!process.env[key]) {
        logger.warn(`Optional environment variable not set: ${key}`);
      }
    }
  }
  if (hasError) {
    logger.error('Exiting due to missing required environment variables.');
    process.exit(1);
  }
}

validateEnv();

// Configure CORS origins
const originList = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : null;
if (process.env.DEBUG_CORS === 'true') {
  logger.debug('🔧 CORS Debug - originList:', originList);
}

// Apply security middleware
app.use(securityHeaders());
app.use(requestLogger);
// CORS for all routes and preflight handling
app.use(configureCORS());
app.options('*', configureCORS());
app.use(sanitizeInput);

// Add performance monitoring middleware
app.use(performanceMonitor.requestTracking());

// Disable CSP entirely for Swagger UI routes (must be after helmet)
app.use('/api-docs', (req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
});

// Add custom CORS debugging middleware (only when DEBUG_CORS is true)
if (process.env.DEBUG_CORS === 'true') {
  app.use((req, res, next) => {
    logger.debug('🔍 Request received:', {
      method: req.method,
      url: req.url,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']?.substring(0, 50),
    });
    next();
  });
}

// Optional CORS debug toggle
if (process.env.DEBUG_CORS === 'true') {
  logger.debug('🔧 CORS Debug enabled');
}

// Add post-CORS middleware to log headers (only in debug mode)
if (process.env.DEBUG_CORS === 'true') {
  app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
      logger.debug('📤 Response headers:', {
        'access-control-allow-origin': res.getHeader('access-control-allow-origin'),
        'access-control-allow-credentials': res.getHeader('access-control-allow-credentials'),
        vary: res.getHeader('vary'),
      });
      return originalSend.call(this, data);
    };
    next();
  });
}

// Ensure JSON body parsing before routers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Add uploads middleware for serving local files
app.use('/uploads', createUploadsMiddleware());

// ---
// NOTE: Periodically review these rate limiting settings to ensure they are effective for your current usage and threat model.
// ---
const RATE_WINDOW = Number(process.env.RATE_LIMIT_WINDOW || 60_000);
const SUBMIT_TICKET_LIMIT = Number(process.env.SUBMIT_TICKET_LIMIT || 10);
const API_LOGIN_LIMIT = Number(process.env.API_LOGIN_LIMIT || 5);
const AUTH_LIMIT = Number(process.env.AUTH_LIMIT || 5);

const ticketLimiter = rateLimit({
  windowMs: RATE_WINDOW,
  limit: SUBMIT_TICKET_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
const apiLoginLimiter = rateLimit({
  windowMs: RATE_WINDOW,
  limit: API_LOGIN_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: RATE_WINDOW,
  limit: AUTH_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

if (process.env.DISABLE_AUTH === 'true' && process.env.NODE_ENV === 'production') {
  logger.error('DISABLE_AUTH cannot be true when NODE_ENV is production');
  process.exit(1);
}

// (moved above to avoid temporal dead zone issues when referenced earlier)

if (!DISABLE_AUTH && !process.env.SESSION_SECRET && process.env.NODE_ENV !== 'test') {
  logger.error('SESSION_SECRET environment variable is required');
  process.exit(1);
}

if (!DISABLE_AUTH) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      name: 'novauniverse.sid', // Change default session name
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((u, d) => d(null, u));
  passport.deserializeUser((u, d) => d(null, u));

  // Only initialize SAML if SAML_ENTRY_POINT is configured
  if (process.env.SAML_ENTRY_POINT) {
    passport.use(
      new SamlStrategy(
        {
          entryPoint: process.env.SAML_ENTRY_POINT,
          issuer: process.env.SAML_ISSUER,
          callbackUrl: process.env.SAML_CALLBACK_URL,
          idpCert: process.env.SAML_CERT && process.env.SAML_CERT.replace(/\\n/g, '\n'),
        },
        (profile, done) => {
          const email =
            profile.email ||
            profile.mail ||
            profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
          const name = profile.displayName || profile.cn || profile.givenName || email;
          db.get(`SELECT id FROM users WHERE email=$1`, [email], (err, row) => {
            if (err) return done(err);
            if (row) {
              db.run(`UPDATE users SET name=$1 WHERE id=$2`, [name, row.id], (e) => {
                if (e) return done(e);
                done(null, { id: row.id, name, email });
              });
            } else {
              db.run(
                `INSERT INTO users (name, email) VALUES ($1, $2)`,
                [name, email],
                function (e) {
                  if (e) return done(e);
                  done(null, { id: this.lastID, name, email });
                },
              );
            }
          });
        },
      ),
    );
  } // End SAML conditional
}

const PORT = Number(process.env.API_PORT || 3000);
const SLACK_URL = process.env.SLACK_WEBHOOK_URL;
const LOG_RETENTION_DAYS = Number(process.env.LOG_RETENTION_DAYS || 30);

if (process.env.DISABLE_CLEANUP !== 'true') {
  const purge = () => {
    db.purgeOldLogs(LOG_RETENTION_DAYS, (err) => {
      if (err) {
        logger.error('Failed to purge old logs:', err.message);
      }
    });
  };
  purge();
  setInterval(purge, 24 * 60 * 60 * 1000);
}

if (SLACK_URL) {
  events.on('kiosk-registered', ({ id, version }) => {
    const verText = version ? ` v${version}` : '';
    axios
      .post(SLACK_URL, { text: `Kiosk ${id} registered${verText}` })
      .catch((err) => logger.error('Slack webhook failed:', err.message));
  });

  events.on('kiosk-deleted', (data) => {
    const text = data.all ? 'All kiosks deleted' : `Kiosk ${data.id} deleted`;
    axios
      .post(SLACK_URL, { text })
      .catch((err) => logger.error('Slack webhook failed:', err.message));
  });

  events.on('mail-error', (err) => {
    axios
      .post(SLACK_URL, { text: `Email send failed: ${err.message}` })
      .catch((err2) => logger.error('Slack webhook failed:', err2.message));
  });
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  secure: process.env.SMTP_SECURE === 'true',
});

const ensureAuth = DISABLE_AUTH
  ? (req, res, next) => next()
  : (req, res, next) => {
      const finalize = (user) => {
        db.all(
          `SELECT r.name AS role, p.name AS perm
             FROM user_roles ur
             JOIN roles r ON ur.roleId=r.id
             LEFT JOIN role_permissions rp ON r.id=rp."roleId"
             LEFT JOIN permissions p ON rp."permissionId"=p.id
            WHERE ur.userId=$1`,
          [user.id],
          (e, rows) => {
            if (e) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
            user.roles = Array.from(new Set(rows.map((r) => r.role)));
            user.permissions = Array.from(new Set(rows.map((r) => r.perm).filter(Boolean)));
            req.user = user;
            next();
          },
        );
      };

      if (req.isAuthenticated && req.isAuthenticated()) {
        return finalize(req.user);
      }
      const header = req.headers.authorization || '';
      const token = header.replace(/^Bearer\s+/i, '');
      const payload = token && verify(token);
      if (payload) {
        db.get('SELECT id, name, email FROM users WHERE id=$1', [payload.id], (err, row) => {
          if (err || !row) {
            return res
              .status(401)
              .json({ error: 'Authentication required', errorCode: 'AUTH_REQUIRED' });
          }
          finalize(row);
        });
      } else {
        res.status(401).json({ error: 'Authentication required', errorCode: 'AUTH_REQUIRED' });
      }
    };

const requirePermission = (perm) =>
  DISABLE_AUTH
    ? (req, res, next) => next()
    : (req, res, next) => {
        const perms = req.user?.permissions || [];
        if (perms.includes(perm)) return next();
        res.status(403).json({ error: 'Forbidden', errorCode: 'FORBIDDEN' });
      };

const ensureScimAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!SCIM_TOKEN || token !== SCIM_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized', errorCode: 'UNAUTHORIZED' });
  }
  next();
};

const kioskOrAuth = (req, res, next) => {
  // Allow kiosk token authentication or regular admin authentication
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const { token: bodyToken } = req.body || {};

  // Check for kiosk token first
  if (KIOSK_TOKEN && (token === KIOSK_TOKEN || bodyToken === KIOSK_TOKEN)) {
    return next();
  }

  // Fall back to regular authentication
  if (DISABLE_AUTH) {
    return next();
  }

  return ensureAuth(req, res, next);
};

// SAML authentication routes (only if SAML is configured)
if (!DISABLE_AUTH && process.env.SAML_ENTRY_POINT) {
  app.get('/auth/saml', authLimiter, passport.authenticate('saml'));
  app.post(
    '/auth/saml/callback',
    authLimiter,
    passport.authenticate('saml', { failureRedirect: '/?error=sso_failed' }),
    (req, res) => {
      // Generate JWT token for SAML authenticated user
      const token = sign({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        sso: true,
      });

      // Redirect to admin UI with token
      const adminUrl = process.env.ADMIN_URL || 'http://localhost:5173';
      res.redirect(`${adminUrl}/?token=${encodeURIComponent(token)}`);
    },
  );
}

// General authentication routes
if (!DISABLE_AUTH) {
  app.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect(process.env.ADMIN_URL || '/');
    });
  });
}

// ========================================
// API VERSIONING - V1 (2025.08)
// ========================================
// Nova Universe API follows industry-standard URI path versioning
// Following Microsoft Azure REST API best practices:
// - Single version: V1 (2025.08)
// - No backward compatibility for legacy versions
// - Clean, consistent endpoint structure
// - All routes under /api/v1/* namespace
// ========================================

const v1Router = express.Router();

// Version information middleware for V1 (2025.08)
const addV1VersionHeaders = (req, res, next) => {
  res.set({
    'X-API-Version': 'v1',
    'X-API-Release': '2025.08',
    'X-API-Status': 'stable',
    'Cache-Control': 'public, max-age=300', // Cache responses for 5 minutes
    'X-Rate-Limit-Policy': 'https://docs.nova-universe.com/api/rate-limits',
    'X-Content-Type-Options': 'nosniff',
  });
  next();
};

// Apply version headers to v1 router
v1Router.use(addV1VersionHeaders);

// Version validation middleware
const validateApiVersion = (req, res, next) => {
  const apiVersion = req.path.match(/^\/api\/(v\d+)/)?.[1];

  if (apiVersion) {
    // Add version information to response headers
    res.set('X-API-Version', apiVersion);

    // Log version usage for analytics
    if (process.env.NODE_ENV !== 'test') {
      logger.info(`API ${apiVersion} accessed: ${req.method} ${req.path}`, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        endpoint: req.path,
      });
    }
  }

  next();
};

// Apply version validation to all API routes
app.use('/api', validateApiVersion);

// Create kiosksRouter for kiosk management endpoints
const kiosksRouter = express.Router();

// --- BEGIN: Move all direct /api/* endpoint definitions to v1Router ---
v1Router.get('/config', ensureAuth, (req, res) => {
  db.all(`SELECT key, value FROM config`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const dbConfig = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    delete dbConfig.adminPassword;

    const defaults = {
      logoUrl: '/logo.png',
      faviconUrl: '/vite.svg',
      organizationName: 'Nova ITSM',
      welcomeMessage: 'Welcome to the Help Desk',
      helpMessage: 'Need to report an issue?',
      statusOpenMsg: 'Open',
      statusClosedMsg: 'Closed',
      statusErrorMsg: 'Error',
      statusMeetingMsg: 'In a Meeting - Back Soon',
      statusBrbMsg: 'Be Right Back',
      statusLunchMsg: 'Out to Lunch - Back in 1 Hour',
      statusUnavailableMsg: 'Status Unavailable',
      rateLimitWindow: '900000',
      rateLimitMax: '100',
    };

    const envConfig = {
      logoUrl: process.env.LOGO_URL,
      faviconUrl: process.env.FAVICON_URL,
      organizationName: process.env.ORGANIZATION_NAME,
      welcomeMessage: process.env.WELCOME_MESSAGE,
      helpMessage: process.env.HELP_MESSAGE,
      statusOpenMsg: process.env.STATUS_OPEN_MSG,
      statusClosedMsg: process.env.STATUS_CLOSED_MSG,
      statusErrorMsg: process.env.STATUS_ERROR_MSG,
      statusMeetingMsg: process.env.STATUS_MEETING_MSG,
      statusBrbMsg: process.env.STATUS_BRB_MSG,
      statusLunchMsg: process.env.STATUS_LUNCH_MSG,
      statusUnavailableMsg: process.env.STATUS_UNAVAILABLE_MSG,
      rateLimitWindow: process.env.RATE_LIMIT_WINDOW,
      rateLimitMax: process.env.RATE_LIMIT_MAX,
    };

    const config = { ...defaults, ...dbConfig, ...envConfig };
    res.json(config);
  });
});

v1Router.put('/api/config', ensureAuth, (req, res) => {
  const updates = req.body;
  const stmt = db.prepare(
    'INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
  );
  db.serialize(() => {
    for (const [key, value] of Object.entries(updates)) {
      stmt.run(key, String(value));
    }
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: 'DB error' });

      db.all(`SELECT key, value FROM config`, (err2, rows) => {
        if (err2) return res.status(500).json({ error: 'DB error' });
        const dbConfig = Object.fromEntries(rows.map((r) => [r.key, r.value]));
        delete dbConfig.adminPassword;

        const defaults = {
          logoUrl: '/logo.png',
          faviconUrl: '/vite.svg',
          organizationName: 'Nova ITSM',
          welcomeMessage: 'Welcome to the Help Desk',
          helpMessage: 'Need to report an issue?',
          statusOpenMsg: 'Open',
          statusClosedMsg: 'Closed',
          statusErrorMsg: 'Error',
          statusMeetingMsg: 'In a Meeting - Back Soon',
          statusBrbMsg: 'Be Right Back',
          statusLunchMsg: 'Out to Lunch - Back in 1 Hour',
          statusUnavailableMsg: 'Status Unavailable',
          rateLimitWindow: '900000',
          rateLimitMax: '100',
        };

        const envConfig = {
          logoUrl: process.env.LOGO_URL,
          faviconUrl: process.env.FAVICON_URL,
          organizationName: process.env.ORGANIZATION_NAME,
          welcomeMessage: process.env.WELCOME_MESSAGE,
          helpMessage: process.env.HELP_MESSAGE,
          statusOpenMsg: process.env.STATUS_OPEN_MSG,
          statusClosedMsg: process.env.STATUS_CLOSED_MSG,
          statusErrorMsg: process.env.STATUS_ERROR_MSG,
          statusMeetingMsg: process.env.STATUS_MEETING_MSG,
          statusBrbMsg: process.env.STATUS_BRB_MSG,
          statusLunchMsg: process.env.STATUS_LUNCH_MSG,
          statusUnavailableMsg: process.env.STATUS_UNAVAILABLE_MSG,
          rateLimitWindow: process.env.RATE_LIMIT_WINDOW,
          rateLimitMax: process.env.RATE_LIMIT_MAX,
        };

        const config = { ...defaults, ...dbConfig, ...envConfig };
        res.json(config);
      });
    });
  });
});

v1Router.get('/api/status-config', ensureAuth, (req, res) => {
  db.all(
    "SELECT key, value FROM config WHERE key IN ('statusEnabled', 'currentStatus', 'statusOpenMsg','statusClosedMsg','statusErrorMsg','statusMeetingMsg','statusBrbMsg','statusLunchMsg')",
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      const config = Object.fromEntries(rows.map((r) => [r.key, r.value]));

      // Convert to the expected format for the frontend
      const response = {
        enabled: config.statusEnabled === '1' || config.statusEnabled === 'true',
        currentStatus: config.currentStatus || 'closed',
        openMessage: config.statusOpenMsg || 'Help Desk is Open',
        closedMessage: config.statusClosedMsg || 'Help Desk is Closed',
        errorMessage: config.statusErrorMsg || 'Service temporarily unavailable',
        meetingMessage: config.statusMeetingMsg || 'In a Meeting - Back Soon',
        brbMessage: config.statusBrbMsg || 'Be Right Back',
        lunchMessage: config.statusLunchMsg || 'Out to Lunch - Back in 1 Hour',
        unavailableMessage: config.statusUnavailableMsg || 'Status Unavailable',
      };

      res.json(response);
    },
  );
});

v1Router.put('/api/status-config', ensureAuth, (req, res) => {
  const {
    enabled,
    currentStatus,
    openMessage,
    closedMessage,
    errorMessage,
    meetingMessage,
    brbMessage,
    lunchMessage,
    unavailableMessage,
  } = req.body;

  // Convert frontend format to backend config keys
  const updates = {};
  if (enabled !== undefined) updates.statusEnabled = enabled ? '1' : '0';
  if (currentStatus !== undefined) updates.currentStatus = currentStatus;
  if (openMessage !== undefined) updates.statusOpenMsg = openMessage;
  if (closedMessage !== undefined) updates.statusClosedMsg = closedMessage;
  if (errorMessage !== undefined) updates.statusErrorMsg = errorMessage;
  if (meetingMessage !== undefined) updates.statusMeetingMsg = meetingMessage;
  if (brbMessage !== undefined) updates.statusBrbMsg = brbMessage;
  if (lunchMessage !== undefined) updates.statusLunchMsg = lunchMessage;
  if (unavailableMessage !== undefined) updates.statusUnavailableMsg = unavailableMessage;

  const stmt = db.prepare(
    `INSERT INTO config (key, value) VALUES ($1, $2)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
  );
  db.serialize(() => {
    for (const [k, v] of Object.entries(updates)) {
      stmt.run(k, String(v));
    }
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      events.emit('status-config-updated', updates);
      res.json({ message: 'updated' });
    });
  });
});

// Directory config and search endpoints are now handled by directoryRouter

// SSO Configuration endpoint
v1Router.get('/api/sso-config', ensureAuth, (req, res) => {
  // Check database first, fall back to environment variables
  db.get(
    'SELECT enabled, provider, configuration FROM sso_configurations WHERE id = 1',
    (err, row) => {
      if (err) {
        logger.error('Error fetching SSO config:', err);
      }

      let config = {
        enabled: false,
        provider: 'saml',
        saml: {
          enabled: false,
          entryPoint: '',
          issuer: '',
          callbackUrl: '',
          cert: '',
        },
      };

      if (row && row.enabled) {
        try {
          const dbConfig = JSON.parse(row.configuration || '{}');
          config = {
            enabled: !!row.enabled,
            provider: row.provider || 'saml',
            ...dbConfig,
          };
        } catch (e) {
          logger.error('Error parsing SSO configuration:', e);
        }
      } else {
        // Fallback to environment variables for backward compatibility
        const samlEnabled = !!(
          process.env.SAML_ENTRY_POINT &&
          process.env.SAML_ISSUER &&
          process.env.SAML_CALLBACK_URL
        );
        config = {
          enabled: samlEnabled,
          provider: 'saml',
          saml: {
            enabled: samlEnabled,
            entryPoint: process.env.SAML_ENTRY_POINT || '',
            issuer: process.env.SAML_ISSUER || '',
            callbackUrl: process.env.SAML_CALLBACK_URL || '',
            cert: process.env.SAML_CERT ? '***CONFIGURED***' : '',
          },
        };
      }

      res.json(config);
    },
  );
});

// SCIM Configuration endpoint
v1Router.get('/api/scim-config', ensureAuth, (req, res) => {
  // Check database first, fall back to environment variables
  db.get('SELECT * FROM scim_configurations WHERE id = 1', (err, row) => {
    if (err) {
      logger.error('Error fetching SCIM config:', err);
    }

    let config = {
      enabled: false,
      token: '',
      endpoint: '/scim/v2',
      autoProvisioning: true,
      autoDeprovisioning: false,
      syncInterval: 3600,
    };

    if (row) {
      config = {
        enabled: !!row.enabled,
        token: row.bearer_token ? '***CONFIGURED***' : '',
        endpoint: row.endpoint_url || '/scim/v2',
        autoProvisioning: !!row.auto_provisioning,
        autoDeprovisioning: !!row.auto_deprovisioning,
        syncInterval: row.sync_interval || 3600,
        lastSync: row.last_sync,
      };
    } else {
      // Fallback to environment variables for backward compatibility
      const scimEnabled = !!SCIM_TOKEN;
      config = {
        enabled: scimEnabled,
        token: scimEnabled ? '***CONFIGURED***' : '',
        endpoint: '/scim/v2',
      };
    }

    res.json(config);
  });
});

// SSO availability endpoint (no authentication required for login page)
v1Router.get('/api/sso-available', (req, res) => {
  // Check database first, fall back to environment variables
  db.get('SELECT enabled, configuration FROM sso_configurations WHERE id = 1', (err, row) => {
    if (err) {
      logger.error('Error checking SSO config:', err);
    }

    let ssoEnabled = false;
    let loginUrl = null;

    if (row && row.enabled) {
      try {
        const config = JSON.parse(row.configuration || '{}');
        if (
          config.saml &&
          config.saml.entryPoint &&
          config.saml.issuer &&
          config.saml.callbackUrl
        ) {
          ssoEnabled = true;
          loginUrl = '/auth/saml';
        }
      } catch (e) {
        logger.error('Error parsing SSO configuration:', e);
      }
    } else {
      // Fallback to environment variables
      ssoEnabled = !!(
        process.env.SAML_ENTRY_POINT &&
        process.env.SAML_ISSUER &&
        process.env.SAML_CALLBACK_URL
      );
      loginUrl = ssoEnabled ? '/auth/saml' : null;
    }

    res.json({
      available: ssoEnabled,
      loginUrl: loginUrl,
    });
  });
});

// SMTP Test endpoint
v1Router.post('/api/test-smtp', ensureAuth, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  try {
    const testMailOptions = {
      from: process.env.SMTP_FROM || 'noreply@novauniverse.local',
      to: email,
      subject: 'Nova Universe SMTP Test Email',
      text: 'This is a test email from Nova Universe to verify SMTP configuration is working correctly.',
      html: `
        <h2>Nova Universe SMTP Test</h2>
        <p>This is a test email from Nova Universe to verify SMTP configuration is working correctly.</p>
        <p>If you receive this email, your SMTP settings are configured properly.</p>
        <hr>
        <small>Sent from Nova Universe Admin Panel</small>
      `,
    };

    await transporter.sendMail(testMailOptions);

    res.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    logger.error('SMTP test failed:', error);
    res.status(500).json({
      success: false,
      error: 'SMTP test failed',
      details: error.message,
    });
  }
});

v1Router.post(
  '/api/feedback',
  [body('name').optional().isString().trim(), body('message').isString().trim().notEmpty()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name = '', message } = req.body;
    const timestamp = new Date().toISOString();
    db.run(
      `INSERT INTO feedback (name, message, timestamp) VALUES ($1, $2, $3)`,
      [name, message, timestamp],
      function (err) {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ id: this.lastID });
      },
    );
  },
);

v1Router.get('/api/feedback', ensureAuth, (req, res) => {
  db.all(`SELECT * FROM feedback ORDER BY timestamp DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// GET notifications
v1Router.get('/api/notifications', ensureAuth, (req, res) => {
  db.all(`SELECT * FROM notifications ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST notification
v1Router.post('/api/notifications', ensureAuth, (req, res) => {
  const { message, level, type } = req.body;
  const created_at = new Date().toISOString();
  const updated_at = created_at;
  const notificationLevel = level || 'info';
  const notificationType = type || 'system';
  db.run(
    `INSERT INTO notifications (message, level, type, created_at, updated_at, active) VALUES ($1, $2, $3, $4, $5, true)`,
    [message, notificationLevel, notificationType, created_at, updated_at],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const newNotification = {
        id: this.lastID,
        message,
        level: notificationLevel,
        type: notificationType,
        created_at,
        updated_at,
        active: true,
      };
      res.json(newNotification);
    },
  );
});

v1Router.post('/api/verify-password', ensureAuth, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Missing password' });
  db.get(`SELECT value FROM config WHERE key='adminPassword'`, (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const hash = row ? row.value : '';
    const valid = bcrypt.compareSync(password, hash);
    res.json({ valid });
  });
});

v1Router.put('/api/admin-password', ensureAuth, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Missing password' });
  const hash = bcrypt.hashSync(password, 12);
  db.run(
    `INSERT INTO config (key, value) VALUES ('adminPassword', $1)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [hash],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Password updated' });
    },
  );
});

v1Router.post(
  '/login',
  apiLoginLimiter,
  authRateLimit,
  [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 8 }).trim()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    db.get(
      'SELECT * FROM users WHERE email=$1 AND disabled=0 ORDER BY id DESC',
      [email],
      (err, row) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!row || !row.passwordHash) {
          return res.status(401).json({ error: 'invalid' });
        }
        if (!bcrypt.compareSync(password, row.passwordHash)) {
          return res.status(401).json({ error: 'invalid' });
        }

        // Update last login timestamp
        db.run('UPDATE users SET last_login = $1 WHERE id = $2', [
          new Date().toISOString(),
          row.id,
        ]);

        const token = sign({ id: row.id, name: row.name, email: row.email });
        res.json({ token });
      },
    );
  },
);

// Health check endpoint for debugging frontend connectivity
app.get('/api/health', (req, res) => {
  const uptime = Math.floor(process.uptime());
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: req.headers.origin || 'no-origin',
    apiVersion: getApiVersion(),
    uiVersion: getUiVersion(),
    cliVersion: getCliVersion(),
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    uptimeSeconds: uptime,
  };

  // If database is not ready, indicate it but still return 200 for API health
  if (!db || !db.query) {
    response.database = 'starting';
    response.note = 'API is running, database initializing';
  } else {
    response.database = 'ready';
  }

  res.json(response);
});

// Root health endpoint with performance monitoring
app.get('/health', (req, res) => {
  const health = performanceMonitor.getHealthStatus();
  res
    .status(health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503)
    .json(health);
});

// Metrics endpoint (admin only)
app.get('/metrics', ensureAuth, (req, res) => {
  const userRoles = req.user?.roles || [];
  if (!userRoles.includes('admin') && !userRoles.includes('superadmin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const metrics = performanceMonitor.getMetrics();
  res.json(metrics);
});

// Readiness probe for UAT/Prod deployments
app.get('/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'degraded', error: 'db_unavailable' });
  }
});

// Auth status endpoint for admin UI
app.get('/api/auth/status', (req, res) => {
  res.json({
    authRequired: !DISABLE_AUTH,
    authDisabled: DISABLE_AUTH,
  });
});

// Simple test login endpoint for frontend connectivity testing
app.post('/api/login-test', (req, res) => {
  console.log('Login test endpoint hit with body:', req.body);
  res.json({
    success: true,
    test: true,
    message: 'Login endpoint working'
  });
});

// Working login endpoint for development
app.post('/api/login-dev', (req, res) => {
  console.log('Dev login endpoint hit with body:', req.body);
  // Disable dev mock login; always require real auth
  return res.status(401).json({ error: 'Authentication required' });
});

// Login endpoint for admin UI and frontend
app.post('/api/login', (req, res) => {
  console.log('Login endpoint hit with body:', req.body);
  
  // Always require real auth
  
  // For production mode, return auth required message
  res.status(401).json({ error: 'Authentication required in production mode' });
});

// Current user profile endpoint
app.get('/api/me', ensureAuth, (req, res) => {
  // No mock user; require valid auth

  // Return current authenticated user
  if (req.user) {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        roles: req.user.roles || [],
        permissions: req.user.permissions || []
      }
    });
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
});

// Server status endpoint for admin UI
app.get('/api/server/status', ensureAuth, (req, res) => {
  const uptime = Math.floor(process.uptime());
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  res.json({
    status: 'running',
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    uptimeSeconds: uptime,
    apiVersion: getApiVersion(),
    uiVersion: getUiVersion(),
    cliVersion: getCliVersion(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});
// --- API version endpoint ---
app.get('/api/version', (req, res) => {
  res.json({
    apiVersion: getApiVersion(),
    uiVersion: getUiVersion(),
    cliVersion: getCliVersion(),
    // For iOS/macOS app version, see Info.plist in nova-beacon
  });
});

// Register kiosk handler function
function registerKioskHandler(req, res) {
  const { id, version } = req.body;
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO kiosks (id, last_seen, version, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT(id) DO UPDATE SET last_seen=excluded.last_seen, version=excluded.version, updated_at=excluded.updated_at`,
    [id, now, version || '', now, now],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      events.emit('kiosk-registered', { id, version });
      res.json({ message: 'registered' });
    },
  );
}

app.post('/api/register-kiosk', validateKioskRegistration, registerKioskHandler);
app.post('/api/v1/register-kiosk', validateKioskRegistration, registerKioskHandler);

// Kiosk activation endpoint
app.post('/api/kiosks/activate', (req, res) => {
  const { kioskId, activationCode } = req.body;

  if (!kioskId || !activationCode) {
    return res.status(400).json({ error: 'Missing kioskId or activationCode' });
  }

  // Check if activation code is valid (for now, use a simple check)
  // In production, this should validate against a database of valid codes
  const validCodes = ['NOVA123', 'ACTIVATE', 'BEACON01', 'KIOSK001'];
  if (!validCodes.includes(activationCode.toUpperCase())) {
    return res.status(401).json({ error: 'Invalid activation code' });
  }

  // Update or create kiosk record as activated
  db.run(
    `INSERT INTO kiosks (id, logoUrl, bgUrl, active, activated_at) 
     VALUES ($1, $2, $3, 1, $4) 
     ON CONFLICT(id) DO UPDATE SET 
       active = 1, 
       activated_at = $4`,
    [kioskId, '/logo.png', '', new Date().toISOString()],
    function (err) {
      if (err) {
        logger.error('Kiosk activation error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        message: 'Kiosk activated successfully',
        kioskId: kioskId,
        activated: true,
      });
    },
  );
});

// Kiosk configuration endpoint
app.get('/api/kiosks/:id/remote-config', kioskOrAuth, (req, res) => {
  const kioskId = req.params.id;

  // Get kiosk-specific configuration
  db.get('SELECT * FROM kiosks WHERE id=$1', [kioskId], (err, kiosk) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    // Get global configuration
    db.all('SELECT key, value FROM config', (configErr, configRows) => {
      if (configErr) return res.status(500).json({ error: 'Config error' });

      const globalConfig = Object.fromEntries(configRows.map((r) => [r.key, r.value]));

      const config = {
        kioskId: kioskId,
        active: kiosk?.active || false,
        roomName: kiosk?.room_name || globalConfig.defaultRoomName || 'Conference Room',
        logoUrl: kiosk?.logoUrl || globalConfig.logoUrl || '/logo.png',
        backgroundUrl: kiosk?.bgUrl || globalConfig.backgroundUrl || '',
        theme: globalConfig.theme || 'default',
        statusMessages: {
          available: globalConfig.availableMessage || 'Room Available',
          inUse: globalConfig.inUseMessage || 'Room Occupied',
          meeting: globalConfig.meetingMessage || 'In Meeting',
          brb: globalConfig.brbMessage || 'Be Right Back',
          lunch: globalConfig.lunchMessage || 'Out for Lunch',
          unavailable: globalConfig.unavailableMessage || 'Unavailable',
        },
        features: {
          ticketSubmission: globalConfig.enableTicketSubmission === '1',
          statusUpdates: globalConfig.enableStatusUpdates === '1',
          directoryIntegration: globalConfig.directoryEnabled === '1',
        },
      };

      res.json({ config });
    });
  });
});

// Kiosk status update endpoint
app.put('/api/kiosks/:id/status', kioskOrAuth, (req, res) => {
  const kioskId = req.params.id;
  const { status, timestamp } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const validStatuses = ['available', 'inUse', 'meeting', 'brb', 'lunch', 'unavailable'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  // Update kiosk status
  db.run(
    `UPDATE kiosks SET current_status=$1, last_status_update=$2 WHERE id=$3`,
    [status, timestamp || new Date().toISOString(), kioskId],
    function (err) {
      if (err) {
        logger.error('Kiosk status update error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Kiosk not found' });
      }

      res.json({
        message: 'Status updated successfully',
        kioskId: kioskId,
        status: status,
        timestamp: timestamp || new Date().toISOString(),
      });
    },
  );
});

app.get('/api/kiosks/:id', kioskOrAuth, (req, res) => {
  const kioskId = req.params.id;

  db.get('SELECT * FROM kiosks WHERE id=$1', [kioskId], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.json({});

    db.all("SELECT key, value FROM config WHERE key LIKE 'directory%'", (e, rows) => {
      if (e) return res.status(500).json({ error: 'DB error' });
      const cfg = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      res.json({
        ...row,
        directoryEnabled: cfg.directoryEnabled === '1',
        directoryProvider: cfg.directoryProvider || 'mock',
      });
    });
  });
});

app.put('/api/kiosks/:id', ensureAuth, (req, res) => {
  const { id } = req.params;
  const { logoUrl, bgUrl, active } = req.body;
  db.run(
    `UPDATE kiosks SET logoUrl=$1, bgUrl=$2, active=COALESCE($3, active) WHERE id=$4`,
    [logoUrl, bgUrl, active !== undefined ? active : null, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'updated' });
    },
  );
});

// Refactored kiosks GET endpoint (async/await, PostgreSQL)
app.get('/api/kiosks', ensureAuth, async (req, res) => {
  try {
    const { rows: kiosks } = await db.query('SELECT * FROM kiosks');
    const { rows: configRows } = await db.query('SELECT key, value FROM config');
    const globalConfig = Object.fromEntries(configRows.map((r) => [r.key, r.value]));
    const kiosksWithConfig = kiosks.map((kiosk) => ({
      ...kiosk,
      active: Boolean(kiosk.active),
      configScope: 'global',
      hasOverrides: false,
      overrideCount: 0,
      effectiveConfig: {
        logoUrl: kiosk.logoUrl || globalConfig.logoUrl || '/logo.png',
        bgUrl: kiosk.bgUrl || globalConfig.backgroundUrl,
        statusEnabled: Boolean(kiosk.statusEnabled),
        currentStatus: kiosk.currentStatus || globalConfig.currentStatus || 'closed',
        openMsg: kiosk.openMsg || globalConfig.statusOpenMsg || 'Help Desk is Open',
        closedMsg: kiosk.closedMsg || globalConfig.statusClosedMsg || 'Help Desk is Closed',
        errorMsg:
          kiosk.errorMsg || globalConfig.statusErrorMsg || 'Service temporarily unavailable',
        schedule: kiosk.schedule ? JSON.parse(kiosk.schedule) : undefined,
        officeHours: globalConfig.officeHours ? JSON.parse(globalConfig.officeHours) : undefined,
      },
    }));
    res.json(kiosksWithConfig);
  } catch (err) {
    logger.error('Error fetching kiosks with config:', err.message);
    res.status(500).json({ error: 'DB error' });
  }
});

// Refactored kiosksRouter GET endpoint (async/await, PostgreSQL)
kiosksRouter.get('/', kioskOrAuth, async (req, res) => {
  try {
    const { rows: kiosks } = await db.query('SELECT * FROM kiosks');
    const { rows: configRows } = await db.query('SELECT key, value FROM config');
    const globalConfig = Object.fromEntries(configRows.map((r) => [r.key, r.value]));
    const kiosksWithConfig = kiosks.map((kiosk) => ({
      ...kiosk,
      active: Boolean(kiosk.active),
      configScope: 'global',
      hasOverrides: false,
      overrideCount: 0,
      effectiveConfig: {
        logoUrl: kiosk.logoUrl || globalConfig.logoUrl || '/logo.png',
        bgUrl: kiosk.bgUrl || globalConfig.backgroundUrl,
        statusEnabled: Boolean(kiosk.statusEnabled),
        currentStatus: kiosk.currentStatus || globalConfig.currentStatus || 'closed',
        openMsg: kiosk.openMsg || globalConfig.statusOpenMsg || 'Help Desk is Open',
        closedMsg: kiosk.closedMsg || globalConfig.statusClosedMsg || 'Help Desk is Closed',
        errorMsg:
          kiosk.errorMsg || globalConfig.statusErrorMsg || 'Service temporarily unavailable',
        schedule: kiosk.schedule ? JSON.parse(kiosk.schedule) : undefined,
        officeHours: globalConfig.officeHours ? JSON.parse(globalConfig.officeHours) : undefined,
      },
    }));
    res.json(kiosksWithConfig);
  } catch (err) {
    logger.error('Error in kiosksRouter GET:', err.message);
    res.status(500).json({ error: 'DB error' });
  }
});

// Automation workflow endpoints
app.get('/api/v2/automation/workflows', ensureAuth, (req, res) => {
  // For now, return basic workflow configurations
  // In production, this would query a workflows database table
  const workflows = [
    {
      id: 'wf-smart-assignment',
      name: 'Smart Ticket Assignment',
      description: 'Automatically assigns tickets based on agent skills and workload',
      type: 'auto_assignment',
      status: 'active',
      trigger: { type: 'ticket_created', conditions: ['priority=high'] },
      actions: [
        {
          id: 'act-001',
          type: 'assign_ticket',
          parameters: { algorithm: 'skills_based', consider_workload: true },
          order: 1,
        },
      ],
      conditions: [{ field: 'priority', operator: 'equals', value: 'high' }],
      metrics: {
        totalRuns: 1247,
        successRate: 94.2,
        avgExecutionTime: 1.8,
        lastRun: new Date().toISOString(),
      },
      schedule: { type: 'event_driven' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'wf-sla-predictor',
      name: 'SLA Breach Predictor',
      description: 'Predicts and prevents potential SLA violations',
      type: 'sla_prediction',
      status: 'active',
      trigger: { type: 'time_based', conditions: ['check_interval=15_minutes'] },
      actions: [
        {
          id: 'act-002',
          type: 'send_notification',
          parameters: { recipients: ['managers'] },
          order: 1,
        },
        { id: 'act-003', type: 'escalate', parameters: { escalation_level: 1 }, order: 2 },
      ],
      conditions: [{ field: 'time_remaining', operator: 'less_than', value: '2_hours' }],
      metrics: {
        totalRuns: 3456,
        successRate: 89.1,
        avgExecutionTime: 5.7,
        lastRun: new Date().toISOString(),
      },
      schedule: { type: 'cron', expression: '*/15 * * * *' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  res.json({ workflows });
});

app.get('/api/v2/automation/insights', ensureAuth, (req, res) => {
  // Return predictive insights about automation opportunities
  const insights = [
    {
      id: 'insight-001',
      type: 'efficiency',
      title: 'Workflow Optimization Opportunity',
      description:
        'Smart assignment workflow can be optimized for 15% better performance by enabling machine learning refinements',
      impact: 'high',
      confidence: 0.89,
      recommendations: [
        'Enable machine learning refinement for assignment algorithm',
        'Add customer satisfaction feedback loop',
        'Implement dynamic skill weighting based on recent performance',
      ],
      data: {
        currentEfficiency: 85,
        potentialEfficiency: 98,
        estimatedSavings: '$12,000/month',
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'insight-002',
      type: 'pattern_detection',
      title: 'Recurring Issue Pattern Detected',
      description:
        'Identified 5 recurring issue patterns that could benefit from automated resolution workflows',
      impact: 'high',
      confidence: 0.92,
      recommendations: [
        'Create automated resolution workflows for top 3 patterns',
        'Implement pattern-based ticket categorization',
        'Set up proactive monitoring for pattern triggers',
      ],
      data: {
        patternsDetected: 5,
        totalOccurrences: 1247,
        automationPotential: 89,
        estimatedTimeReduction: '45 hours/week',
      },
      createdAt: new Date().toISOString(),
    },
  ];

  res.json({ insights });
});

app.post('/api/v2/automation/workflows', ensureAuth, (req, res) => {
  const { name, description, type, trigger, actions, conditions } = req.body;

  if (!name || !type || !trigger || !actions) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // In production, this would save to database
  const newWorkflow = {
    id: `wf-${Date.now()}`,
    name,
    description: description || '',
    type,
    status: 'draft',
    trigger,
    actions,
    conditions: conditions || [],
    metrics: { totalRuns: 0, successRate: 0, avgExecutionTime: 0, lastRun: null },
    schedule: { type: 'event_driven' },
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  res.status(201).json(newWorkflow);
});

// DELETE notification
v1Router.delete('/api/notifications/:id', ensureAuth, (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM notifications WHERE id = $1`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Notification deleted' });
  });
});

// DELETE all notifications
v1Router.delete('/api/notifications', ensureAuth, (req, res) => {
  db.run(`DELETE FROM notifications`, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'All notifications deleted' });
  });
});

// ========================================
// API Documentation & Developer Tools
// ========================================

// Enhanced Swagger UI setup with comprehensive documentation
const docsRequireAuth =
  process.env.NODE_ENV === 'production' && process.env.ENABLE_PUBLIC_DOCS !== 'true';
const docsAuth = docsRequireAuth ? ensureAuth : (req, res, next) => next();

// API Documentation JSON endpoint
app.get('/api-docs/swagger.json', docsAuth, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  res.send(swaggerSpec);
});

// API version information endpoint
app.get('/api/version', (req, res) => {
  res.json({
    api: {
      version: getApiVersion(),
      name: 'Nova Universe Platform API',
    },
    versions: {
      supported: ['v2', 'v1'],
      current: 'v2',
      deprecated: ['v1'],
      sunset: {
        v1: '2024-12-31T23:59:59Z', // Example sunset date for v1
      },
    },
    ui: {
      version: getUiVersion(),
    },
    cli: {
      version: getCliVersion(),
    },
    deprecationPolicy: {
      notice: 'Deprecated versions will be supported for 12 months after deprecation announcement',
      migration: 'See migration guide at https://docs.nova-universe.com/api/migration',
    },
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: getApiVersion(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    node: process.version,
  });
});

// Simple test page to debug Swagger UI with enhanced debugging
app.get('/api-docs/test', (req, res) => {
  const pathCount = Object.keys(swaggerSpec.paths || {}).length;
  const componentCount = Object.keys(swaggerSpec.components?.schemas || {}).length;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Nova Universe API Documentation Debug</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .status { padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid; }
            .success { background: #d4edda; border-left-color: #28a745; color: #155724; }
            .info { background: #d1ecf1; border-left-color: #17a2b8; color: #0c5460; }
            .warning { background: #fff3cd; border-left-color: #ffc107; color: #856404; }
            h1 { color: #333; margin-bottom: 30px; }
            h2 { color: #555; margin-top: 30px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .metric { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
            .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
            .metric-label { color: #666; margin-top: 5px; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 6px; overflow-x: auto; }
            code { background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
            .endpoint-list { max-height: 300px; overflow-y: auto; background: #f8f9fa; padding: 15px; border-radius: 6px; }
            .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 5px; }
            .btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Nova Universe API Documentation Debug</h1>
            
            <div class="status success">✅ API Server is running successfully</div>
            <div class="status info">📋 OpenAPI v3 specification loaded and processed</div>
            <div class="status info">🔒 Authentication: ${docsRequireAuth ? 'Required' : 'Public Access'}</div>
            
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">${pathCount}</div>
                    <div class="metric-label">API Endpoints</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${componentCount}</div>
                    <div class="metric-label">Data Schemas</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${swaggerSpec.info?.version || 'unknown'}</div>
                    <div class="metric-label">API Version</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${swaggerSpec.servers?.length || 0}</div>
                    <div class="metric-label">Server Environments</div>
                </div>
            </div>
            
            <h2>📡 Quick Links</h2>
            <a href="/api-docs/" class="btn">📖 Full API Documentation</a>
            <a href="/api-docs/swagger.json" class="btn">📋 OpenAPI JSON Spec</a>
            <a href="/api/version" class="btn">ℹ️ Version Information</a>
            <a href="/api/health" class="btn">💚 Health Check</a>
            
            <h2>🛠️ Available API Endpoints</h2>
            <div class="endpoint-list">
                ${Object.keys(swaggerSpec.paths || {})
                  .sort()
                  .map((path) => {
                    const methods = Object.keys(swaggerSpec.paths[path]).join(', ').toUpperCase();
                    return `<div><code>${path}</code> - ${methods}</div>`;
                  })
                  .join('')}
            </div>
            
            <h2>🔧 Server Configuration</h2>
            <div class="status info">
                <strong>Servers:</strong><br>
                ${swaggerSpec.servers?.map((s) => `• ${s.url} - ${s.description}`).join('<br>') || 'None configured'}
            </div>
            
            <h2>🐞 Debug Information</h2>
            <pre id="debug-info">Loading debug information...</pre>
            
            <div id="swagger-status" class="status info">🔄 Testing OpenAPI specification loading...</div>
        </div>
        
        <script>
          console.log('API Documentation debug page loaded');
          
          // Test OpenAPI JSON loading
          fetch('/api-docs/swagger.json')
            .then(response => response.json())
            .then(data => {
              console.log('OpenAPI specification loaded successfully:', data);
              document.getElementById('swagger-status').textContent = '✅ OpenAPI specification loads correctly';
              document.getElementById('swagger-status').className = 'status success';
              
              // Update debug info
              document.getElementById('debug-info').textContent = JSON.stringify({
                openApiVersion: data.openapi,
                title: data.info?.title,
                version: data.info?.version,
                pathCount: Object.keys(data.paths || {}).length,
                componentCount: Object.keys(data.components?.schemas || {}).length,
                serverCount: data.servers?.length || 0,
                securitySchemes: Object.keys(data.components?.securitySchemes || {})
              }, null, 2);
            })
            .catch(error => {
              console.error('Error loading OpenAPI specification:', error);
              document.getElementById('swagger-status').textContent = '❌ Error loading OpenAPI specification: ' + error.message;
              document.getElementById('swagger-status').className = 'status warning';
            });
            
          // Test API health
          fetch('/api/health')
            .then(response => response.json())
            .then(data => console.log('API Health Check:', data))
            .catch(error => console.error('Health check failed:', error));
        </script>
    </body>
    </html>
  `);
});

// Enhanced Swagger UI with custom styling and configuration
app.use(
  '/api-docs',
  docsAuth,
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: {
      url: '/api-docs/swagger.json',
      deepLinking: true,
      displayOperationId: false,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        // Add custom headers or modify requests
        req.headers['X-Client'] = 'SwaggerUI';
        return req;
      },
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .info .title { font-size: 36px; color: #333; }
      .swagger-ui .info .description { font-size: 14px; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f7f7f7; padding: 15px; border-radius: 4px; margin: 20px 0; }
      .swagger-ui .servers { background: #e8f4f8; padding: 15px; border-radius: 4px; margin: 20px 0; }
      .swagger-ui .opblock.opblock-deprecated { opacity: 0.6; border-left: 4px solid #ff6b6b; }
      .swagger-ui .opblock-summary-description { font-weight: normal; }
      .swagger-ui .btn.try-out__btn { background: #007bff; border-color: #007bff; }
      .swagger-ui .btn.execute { background: #28a745; border-color: #28a745; }
    `,
    customSiteTitle: 'Nova Universe API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerUrl: '/api-docs/swagger.json',
  }),
);

// ========================================
// API ROUTE REGISTRATION - V1 (2025.08)
// ========================================
// All API endpoints are registered under /api/v1/* following REST best practices
// Organization:
// - Authentication & Identity: /api/v1/auth, /api/v1/helix, /api/v1/oauth
// - Core Resources: /api/v1/organizations, /api/v1/directory, /api/v1/users
// - ITSM: /api/v1/tickets, /api/v1/incidents, /api/v1/service-requests
// - AI & Automation: /api/v1/synth, /api/v1/cosmo, /api/v1/ai-fabric
// - Monitoring & Alerts: /api/v1/monitoring, /api/v1/alerts, /api/v1/notifications
// - Integrations: /api/v1/integrations, /api/v1/scim, /api/v1/webhooks
// ========================================

// Register V1 router
app.use('/api/v1', v1Router);

// ========================================
// V1 Core Authentication & Identity Routes
// ========================================
v1Router.use('/auth', authRouter); // Authentication & Authorization
v1Router.use('/helix', helixRouter); // Nova Helix - Identity Engine
v1Router.use('/helix/login', helixUniversalLoginRouter); // Nova Helix - Universal Login
v1Router.use('/oauth', oauth2Router); // OAuth 2.0 Authorization Server (RFC 6749)
v1Router.use('/tenants', tenantDiscoveryRouter); // Enhanced Tenant Discovery

// ========================================
// V1 Core Resource Management Routes
// ========================================
v1Router.use('/organizations', organizationsRouter); // Organization Management
v1Router.use('/directory', directoryRouter); // User Directory & LDAP Integration
v1Router.use('/roles', rolesRouter); // Role-Based Access Control
v1Router.use('/users', v1Router); // User management (alias for directory)
v1Router.use('/configuration', requirePermission('admin'), configurationRouter); // System Configuration
v1Router.use('/modules', modulesRouter); // Module/Feature Flag Management
v1Router.use('/api-keys', apiKeysRouter); // API Key Management
v1Router.use('/', serverRouter); // Server Info (handles /api/v1/health, /api/v1/server-info)
v1Router.use('/logs', logsRouter); // System Logs

// ========================================
// V1 Asset & Inventory Management Routes
// ========================================
v1Router.use('/assets', assetsRouter); // Asset Management
v1Router.use('/inventory', inventoryRouter); // Inventory Tracking
v1Router.use('/cmdb', cmdbRouter); // Configuration Management Database
v1Router.use('/cmdb', cmdbExtendedRouter); // Extended CMDB Features

// ========================================
// V1 ITSM & Service Management Routes
// ========================================
v1Router.use('/tickets', ticketsRouter); // Ticket Management
v1Router.use('/itsm', itsmRouter); // Enhanced ITSM Ticket Management
v1Router.use('/service-requests', serviceRequestsRouter); // Service Request Management
v1Router.use('/service-catalog', serviceCatalogRouter); // Service Catalog
v1Router.use('/service-catalog-requests', serviceCatalogRequestsRouter); // Service Catalog Requests
v1Router.use('/catalog-items', catalogItemsRouter); // Legacy Catalog Items
v1Router.use('/approvals', approvalsRouter); // Approval Workflows

// ========================================
// V1 Knowledge & Documentation Routes
// ========================================
v1Router.use('/lore', loreRouter); // Nova Lore - Knowledge Base
v1Router.use('/search', searchRouter); // Global Search

// ========================================
// V1 Workflow & Automation Routes
// ========================================
v1Router.use('/workflows', workflowsRouter); // Workflow Engine
v1Router.use('/rbac', rbacRouter); // Role-Based Access Control Engine

// ========================================
// V1 AI & Intelligence Routes
// ========================================
v1Router.use('/synth', synthRouter); // Nova Synth - AI Orchestration Engine

// Conditionally load AI-dependent routes
if (process.env.ENABLE_AI_COMPONENTS === 'true') {
  try {
    const cosmoMod = await import('./routes/cosmo.js');
    cosmoRouter = cosmoMod.default || cosmoMod;
    v1Router.use('/cosmo', cosmoRouter); // Nova Cosmo - Conversational AI
  } catch (e) {
    logger.warn('Cosmo routes disabled (failed to load):', e.message);
  }

  try {
    const aiFabricMod = await import('./routes/ai-fabric.js');
    aiFabricRouter = aiFabricMod.default || aiFabricMod;
    v1Router.use('/ai-fabric', aiFabricRouter); // AI Fabric - Enterprise AI Platform
  } catch (e) {
    logger.warn('AI Fabric routes disabled (failed to load):', e.message);
  }

  try {
    const aiControlTowerMod = await import('./routes/ai-control-tower.js');
    aiControlTowerRouter = aiControlTowerMod.default || aiControlTowerMod;
    v1Router.use('/ai-control-tower', aiControlTowerRouter); // AI Control Tower - AI/ML/RAG Management
  } catch (e) {
    logger.warn('AI Control Tower disabled (failed to load):', e.message);
  }

  try {
    const mcpMod = await import('./routes/mcp-server.js');
    mcpServerRouter = mcpMod.default || mcpMod;
    v1Router.use('/mcp', mcpServerRouter); // Model Context Protocol Server
  } catch (e) {
    logger.warn('MCP routes disabled (failed to load):', e.message);
  }

  try {
    const synthV2Mod = await import('./routes/synth-v2.js');
    synthV2Router = synthV2Mod.default || synthV2Router;
    v1Router.use('/synth-enhanced', synthV2Router); // Enhanced Synth with MCP support
  } catch (e) {
    logger.warn('Enhanced Synth routes disabled (failed to load):', e.message);
  }
} else {
  logger.info('AI components disabled (ENABLE_AI_COMPONENTS not set to true)');
}

// ========================================
// V1 Monitoring & Alerting Routes
// ========================================
v1Router.use('/monitoring', monitoringRouter); // System Monitoring
v1Router.use('/unified-monitoring', unifiedMonitoringRouter); // Unified Monitoring & Alerting
v1Router.use('/alerts', alertsRouter); // Alert Management (Nova Alert)
v1Router.use('/notifications', ensureAuth, notificationsRouter); // Universal Notification Platform
v1Router.use('/analytics', analyticsRouter); // Analytics & Reporting
v1Router.use('/uptime-kuma', uptimeKumaProxyRouter); // Uptime Kuma Proxy
v1Router.use('/websocket/uptime-kuma', uptimeKumaWebSocketRouter); // Uptime Kuma WebSocket
v1Router.use('/status', statusSummaryRouter); // Status Page
v1Router.use('/announcements', announcementsRouter); // System Announcements

// ========================================
// V1 Integration & Communication Routes
// ========================================
v1Router.use('/integrations', integrationsRouter); // Third-Party Integrations
v1Router.use('/helpscout', helpscoutRouter); // HelpScout Integration
v1Router.use('/comms', commsRouter); // Nova Comms - Slack Integration
v1Router.use('/websocket', websocketRouter); // WebSocket Management
v1Router.use('/scim/monitor', scimMonitorRouter); // SCIM Monitoring
v1Router.use('/email-actions', emailActionsRouter); // Enhanced Email Actions for Workflows
v1Router.use('/email-templates', emailTemplatesRouter); // Email Template Management
v1Router.use('/customer-activity', customerActivityRouter); // Customer Activity Tracking

// ========================================
// V1 Portal & User Experience Routes
// ========================================
v1Router.use('/pulse', pulseRouter); // Nova Pulse - Technician Portal
v1Router.use('/orbit', orbitRouter); // Nova Orbit - End-User Portal
v1Router.use('/beacon', beaconRouter); // Nova Beacon - Kiosk Management
v1Router.use('/kiosks', kioskOrAuth, kiosksRouter); // Kiosk Management
v1Router.use('/app-switcher', appSwitcherRouter); // Enhanced App Switcher
v1Router.use('/spaces', spacesRouter); // Collaborative Spaces
v1Router.use('/nova-tv', novaTVRouter); // Nova TV - Digital Signage Channel Management
v1Router.use('/nova-tv/digital-signage', novaTVDigitalSignageRouter); // Nova TV Digital Signage

// ========================================
// V1 User360 & Engagement Routes
// ========================================
v1Router.use('/user360', user360Router); // User 360 - Complete User Profile
v1Router.use('/user360/interactions', user360InteractionsRouter); // User 360 Interactions

// ========================================
// V1 Reporting & Analytics Routes
// ========================================
v1Router.use('/reports', reportsRouter); // Report Generation
v1Router.use('/vip', vipRouter); // VIP Management

// ========================================
// V1 Advanced Features Routes
// ========================================
v1Router.use('/feature-flags', featureFlagsRouter); // Feature Flag Management
v1Router.use('/ab-testing', abTestingRouter); // A/B Testing
v1Router.use('/cost-centers', costCentersRouter); // Cost Center Management

// ========================================
// V1 Setup & Administration Routes
// ========================================
v1Router.use('/setup', setupRouter); // System Setup & Configuration
v1Router.use('/core', coreRouter); // Core System Functions

// ========================================
// V1 GoAlert Integration Route
// ========================================
v1Router.use('/goalert', goalertProxyRouter); // GoAlert Proxy for alerting

// ========================================
// Special Routes (Outside /api/v1 namespace)
// ========================================
// These routes maintain their own paths for compatibility with external systems

// SCIM 2.0 Provisioning API (maintains /scim/v2 path per SCIM spec)
app.use('/scim/v2', ensureScimAuth, scimRouter);

// OAuth 2.0 well-known endpoints (maintains /.well-known path per RFC 8414)
app.use('/.well-known', oauth2Router);

// Status page (public endpoint, no versioning)
const featureStatusPagesEnv = process.env.FEATURE_STATUS_PAGES === 'true';
let featureStatusPagesConfig = false;
try {
  featureStatusPagesConfig = await ConfigurationManager.get('features.statusPages', false);
} catch {}

if (featureStatusPagesEnv || featureStatusPagesConfig) {
  app.use('/status', statusSummaryRouter);
}

// Announcements (public endpoint)
app.use('/announcements', announcementsRouter);

// Core functions (maintains /core path)
app.use('/core', coreRouter);

// Wrap all app setup in an async function
export async function createApp() {
  // Update Swagger server URLs now that PORT is available
  updateSwaggerServerUrls();

  // Initialize configuration management system
  try {
    await ConfigurationManager.initialize();
    logger.info('Configuration management system initialized');
  } catch (err) {
    logger.error('Failed to initialize configuration manager:', err);
  }

  // Initialize Elasticsearch
  try {
    const elasticManager = (await import('./database/elastic.js')).default;
    await elasticManager.initialize();
    logger.info('Elasticsearch initialized successfully');
  } catch (err) {
    logger.error('Failed to initialize Elasticsearch:', err);
  }

  // Setup Apollo GraphQL server
  try {
    await setupGraphQL(app);
    logger.info('GraphQL server setup complete');
  } catch (err) {
    logger.error('Failed to setup GraphQL server:', err);
  }

  // Initialize Nova Comms Slack integration (if configured)
  try {
    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET) {
      logger.info('Initializing Nova Comms Slack integration...');
      initializeSlackApp();
      logger.info('Nova Comms Slack integration initialized successfully');
    } else {
      logger.info('Slack credentials not found - Slack integration disabled');
    }
  } catch (slackError) {
    logger.warn('Failed to initialize Slack integration:', slackError.message);
  }

  // Log API versioning information
  logger.info('🔗 API Versioning Strategy:');
  logger.info('  • v2 (Current): /api/v2/* - Latest features and improvements');
  logger.info('  • v1 (Deprecated): /api/v1/* - Legacy version with sunset warnings');
  logger.info('  • Backward compatibility: /api/* routes map to v1 with deprecation headers');
  logger.info(`📋 API Documentation available at http://localhost:${PORT}/api-docs`);

  // Do not call server.listen here
  return { app, server, io };
}

// Only start the server if not in test mode (unless FORCE_LISTEN=true or API_PORT is provided for CI)
if (
  process.env.NODE_ENV !== 'test' ||
  process.env.FORCE_LISTEN === 'true' ||
  process.env.API_PORT
) {
  createApp().then(async ({ app: _app, server, io: _io }) => {
    server.listen(PORT, async () => {
      logger.info(`🚀 Nova Universe API Server running on port ${PORT}`);
      logger.info(`📊 Admin interface: http://localhost:${PORT}/admin`);
      logger.info(`🔧 Server info endpoint: http://localhost:${PORT}/api/server-info`);
      logger.info(`⚡ WebSocket server ready for real-time updates`);

      // Start Slack app if configured
      try {
        if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET) {
          const slackPort = parseInt(process.env.SLACK_PORT) || 3001;
          await startSlackApp(slackPort);
        }
      } catch (slackError) {
        logger.warn('Failed to start Slack app:', slackError.message);
      }

      // Initialize Nova RAG systems (optional heavy components)
      try {
        if (process.env.FAST_BOOT === 'true') {
          logger.info('⏭️  FAST_BOOT enabled: skipping AI/RAG initialization');
        } else {
          logger.info('🧠 Initializing Nova RAG systems...');
        
        // Import available RAG components
        let ragComponents = {};
        
        // Initialize Nova RAG RBAC system
        try {
          const { ragRBAC } = await import('./lib/nova-rag-rbac.js');
          ragComponents.ragRBAC = ragRBAC;
          await ragRBAC.initialize();
          logger.info('✅ Nova RAG RBAC system initialized');
        } catch (rbacError) {
          logger.warn('Nova RAG RBAC not available:', rbacError.message);
        }
        
        // Initialize RAG engine
        try {
          const { ragEngine } = await import('./lib/rag-engine.js');
          ragComponents.ragEngine = ragEngine;
          await ragEngine.initialize();
          logger.info('✅ Nova RAG engine initialized');
        } catch (engineError) {
          logger.warn('RAG engine not available:', engineError.message);
        }
        
        // Initialize RAG data connectors
        try {
          const { ragDataConnectors } = await import('./lib/nova-rag-data-connectors.js');
          ragComponents.ragDataConnectors = ragDataConnectors;
          await ragDataConnectors.initialize();
          logger.info('✅ Nova RAG data connectors initialized');
        } catch (connectorError) {
          logger.warn('Nova RAG data connectors not available:', connectorError.message);
        }
        
        // Initialize Nova Synth RAG integration
        try {
          const { novaSynthRAG } = await import('./lib/nova-synth-rag-integration.js');
          ragComponents.novaSynthRAG = novaSynthRAG;
          await novaSynthRAG.initialize();
          logger.info('✅ Nova Synth RAG integration initialized');
        } catch (synthError) {
          logger.warn('Nova Synth RAG integration not available:', synthError.message);
        }
        
        // Initialize Nova Synth Email Processor
        try {
          const { novaSynthEmailProcessor } = await import('./lib/nova-synth-email-processor.js');
          ragComponents.novaSynthEmailProcessor = novaSynthEmailProcessor;
          await novaSynthEmailProcessor.initialize();
          logger.info('✅ Nova Synth Email Processor initialized');
        } catch (emailError) {
          logger.warn('Nova Synth Email Processor not available:', emailError.message);
        }
        
        // Initialize User Interaction Service
        try {
          const { userInteractionService } = await import('./services/user-interaction.service.js');
          ragComponents.userInteractionService = userInteractionService;
          await userInteractionService.initialize();
          logger.info('✅ User Interaction Service initialized');
        } catch (interactionError) {
          logger.warn('User Interaction Service not available:', interactionError.message);
        }
        
        // Initialize Nova AI Agent Framework
        try {
          const { novaAIAgentFramework } = await import('./lib/nova-ai-agent-framework.js');
          ragComponents.novaAIAgentFramework = novaAIAgentFramework;
          await novaAIAgentFramework.initialize();
          logger.info('✅ Nova AI Agent Framework initialized');
        } catch (agentError) {
          logger.warn('Nova AI Agent Framework not available:', agentError.message);
        }
        
        // Initialize Nova ML Pipeline
        try {
          const { novaMLPipeline } = await import('./lib/nova-ml-pipeline.js');
          ragComponents.novaMLPipeline = novaMLPipeline;
          await novaMLPipeline.initialize();
          logger.info('✅ Nova ML Pipeline initialized');
        } catch (mlError) {
          logger.warn('Nova ML Pipeline not available:', mlError.message);
        }
        
        // Initialize Nova Conversational Interface
        try {
          const { novaConversationalInterface } = await import('./lib/nova-conversational-interface.js');
          ragComponents.novaConversationalInterface = novaConversationalInterface;
          await novaConversationalInterface.initialize();
          logger.info('✅ Nova Conversational Interface initialized');
        } catch (conversationError) {
          logger.warn('Nova Conversational Interface not available:', conversationError.message);
        }
        
        const activeComponents = Object.keys(ragComponents).length;
          logger.info(`🎯 Nova RAG systems initialized successfully (${activeComponents} components active)`);
          logger.info('✅ Full RAG functionality available - no TypeScript limitations');
        }
      } catch (ragError) {
        logger.error('Failed to initialize Nova RAG systems:', ragError);
        logger.warn('Nova RAG functionality will be limited');
      }
    });
  });
}

export default createApp;

// Centralized not-found and error handling (must be after all routes)
import { notFoundHandler, errorHandler } from './middleware/error-handler.js';
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown for production/UAT
const shutdownSignals = ['SIGINT', 'SIGTERM'];
for (const sig of shutdownSignals) {
  process.on(sig, async () => {
    try {
      logger.info(`\n🛑 Received ${sig}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
      });
      await closeDatabase();
    } catch (e) {
      logger.error('Error during shutdown:', e);
    } finally {
      process.exit(0);
    }
  });
}

// --- Kiosks Router ---
// Router declaration moved to top of file

// Minimal GET endpoint for kiosks
kiosksRouter.get('/', async (req, res) => {
  try {
    const { rows: kiosks } = await db.query('SELECT * FROM kiosks');
    res.json(kiosks);
  } catch (err) {
    logger.error('Error fetching kiosks:', err.message);
    res.status(500).json({ error: 'DB error' });
  }
});
// --- END Kiosks Router ---

// --- END: Move all direct /api/* endpoint definitions to v1Router ---
