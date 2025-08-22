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
import aiFabricRouter from './routes/ai-fabric.js';
import mcpServerRouter from './routes/mcp-server.js';
import setupRouter from './routes/setup.js';
import coreRouter from './routes/core.js';
import statusSummaryRouter from './routes/status.js';
import announcementsRouter from './routes/announcements.js';
import cosmoRouter from './routes/cosmo.js';
import beaconRouter from './routes/beacon.js';
import goalertProxyRouter from './routes/goalert-proxy.js';
import uptimeKumaProxyRouter from './routes/uptime-kuma-proxy.js';
import uptimeKumaWebSocketRouter from './routes/uptime-kuma-websocket.js';
import alertsRouter from './routes/alerts.js';
import cmdbRouter from './routes/cmdb.js';
import cmdbExtendedRouter from './routes/cmdbExtended.js';
import notificationsRouter from './routes/notifications.js'; // Universal Notification Platform
import user360Router from './routes/user360.js'; // User 360 API
import authRouter from './routes/auth.js';
import ticketsRouter from './routes/tickets.js';
import spacesRouter from './routes/spaces.js';
import commsRouter from './routes/comms.js'; // Nova Comms Slack integration
import novaTVRouter from './src/routes/nova-tv.js'; // Nova TV - Channel Management
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
import {
  validateEmail,
  validateKioskRegistration,
} from './middleware/validation.js';
import helixRouter from './routes/helix.js';
import helixUniversalLoginRouter from './routes/helix-universal-login.js';
import loreRouter from './routes/lore.js';
import orbitRouter from './routes/orbit.js';
import pulseRouter from './routes/pulse.js';
import inventoryRouter from './routes/inventory.js';
import scimRouter from './routes/scim.js';
import scimMonitorRouter from './routes/scimMonitor.js';
import synthRouter from './routes/synth.js';
import synthV2Router from './routes/synth-v2.js';
import { setupGraphQL } from './graphql.js';
import { initializeSlackApp, startSlackApp } from './services/nova-comms.js';
import { validateProductionEnvironment } from './config/production-validation.js';
import PerformanceMonitor from './middleware/performance-monitor.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const server = http.createServer(app);
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

// Initialize Uptime Kuma WebSocket handler
import { initializeUptimeKumaWebSocket, shutdownUptimeKumaWebSocket } from './websocket/uptime-kuma-handler.js';
initializeUptimeKumaWebSocket().catch(error => {
  logger.error('Failed to initialize Uptime Kuma WebSocket handler', { error: error.message });
});

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

// Enhanced Swagger definition with proper versioning
const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Nova Universe Platform API',
    version: getApiVersion(),
    description: `
# Nova Universe IT Service Management Platform API

A comprehensive API for managing IT service operations, including ticket management, 
asset tracking, knowledge base, user directory, AI-powered automation, and more.

## 🔐 Authentication

This API uses **Bearer token authentication**. Include your API token in the Authorization header:

\`\`\`
Authorization: Bearer your-jwt-token-here
\`\`\`

Tokens can be obtained through the \`/auth/login\` endpoint.

## 📦 API Versioning

This API follows **semantic versioning** with **URI-based versioning**:

- **v2 (Current)**: Latest stable version with all new features
- **v1 (Legacy)**: Deprecated version maintained for backward compatibility

### Version Migration
- Breaking changes increment the major version (v1 → v2)
- Non-breaking changes (new endpoints, optional parameters) may be added to existing versions
- Deprecated endpoints include sunset dates in response headers

## 🚦 Rate Limiting

API requests are rate limited to ensure fair usage:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Rate limit information is included in response headers:
- \`X-RateLimit-Limit\`: Request limit per window
- \`X-RateLimit-Remaining\`: Requests remaining
- \`X-RateLimit-Reset\`: Unix timestamp when window resets

## 📊 Response Format

All API responses follow a consistent format:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "pagination": { ... },  // For paginated responses
  "meta": { ... }         // Additional metadata
}
\`\`\`

Error responses include detailed error information:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [ ... ],    // Validation errors, if applicable
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
\`\`\`

## 🔍 Filtering and Pagination

Most list endpoints support filtering and pagination:

- **Pagination**: Use \`page\` and \`limit\` query parameters
- **Filtering**: Use specific filter parameters (documented per endpoint)
- **Sorting**: Use \`sort\` and \`order\` parameters
- **Search**: Use \`search\` parameter for full-text search

## 📡 WebSocket Support

Real-time updates are available via WebSocket connections at \`/socket.io\`.
Subscribe to specific data types for live updates on tickets, system status, and more.
    `,
    contact: {
      name: 'Nova Universe API Support',
      email: 'api-support@nova-universe.com',
      url: 'https://docs.nova-universe.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    termsOfService: 'https://nova-universe.com/terms'
  },
  servers: [
    { url: '/api/v2', description: 'Current API (v2) - Latest features and improvements' },
    { url: '/api/v1', description: 'Legacy API (v1) - Deprecated, maintained for backward compatibility' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from /auth/login endpoint'
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for service-to-service authentication'
      }
    },
    parameters: {
      PageParam: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination (1-based)',
        schema: { type: 'integer', minimum: 1, default: 1 }
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
      },
      SortParam: {
        name: 'sort',
        in: 'query',
        description: 'Field to sort by',
        schema: { type: 'string' }
      },
      OrderParam: {
        name: 'order',
        in: 'query',
        description: 'Sort order',
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
      }
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
                    message: { type: 'string', example: 'Authentication required' }
                  }
                }
              }
            }
          }
        }
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
                    message: { type: 'string', example: 'Insufficient permissions' }
                  }
                }
              }
            }
          }
        }
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
                    message: { type: 'string', example: 'Resource not found' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  security: [
    { BearerAuth: [] },
    { ApiKeyAuth: [] }
  ]
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
      version: getApiVersion() // Ensure version is from package.json
    },
    paths: {
      ...swaggerSpec.paths,
      ...comprehensiveSpec.paths
    },
    components: {
      ...swaggerSpec.components,
      ...comprehensiveSpec.components,
      securitySchemes: {
        ...swaggerSpec.components?.securitySchemes,
        ...comprehensiveSpec.components?.securitySchemes
      }
    }
  };
  logger.info('📋 Merged comprehensive OpenAPI specification with JSDoc spec');
}

// Helper function to update server URLs after PORT is defined
function updateSwaggerServerUrls() {
  const PORT = Number(process.env.API_PORT || 3000);
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? (process.env.API_BASE_URL || 'https://api.nova-universe.com')
    : `http://localhost:${PORT}`;
  
  const servers = [
    { url: `${baseUrl}/api/v2`, description: 'Current API (v2) - Latest features and improvements' },
    { url: `${baseUrl}/api/v1`, description: 'Legacy API (v1) - Deprecated, maintained for backward compatibility' },
  ];
  
  swaggerSpec.servers = servers;
  
  if (process.env.NODE_ENV === 'development') {
    logger.debug('📋 Updated Swagger server URLs:', servers);
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
app.use(configureCORS());
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
const CERT_PATH = process.env.TLS_CERT_PATH;
const KEY_PATH = process.env.TLS_KEY_PATH;
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

// Create a v1Router to wrap all direct /api/* endpoints with deprecation warnings
const v1Router = express.Router();

// Add deprecation middleware for v1 API
const addDeprecationHeaders = (req, res, next) => {
  // Add deprecation warning headers for v1 API
  res.set({
    'Deprecation': 'true',
    'Sunset': '2024-12-31T23:59:59Z', // RFC 8594 compliant sunset date
    'Link': '</api/v2>; rel="successor-version"; type="application/json"',
    'Warning': '299 "This API version is deprecated. Please migrate to v2. See https://docs.nova-universe.com/api/migration"',
    'X-API-Version': 'v1',
    'X-API-Deprecation-Notice': 'This version will be sunset on 2024-12-31. Please upgrade to v2.'
  });
  next();
};

// Apply deprecation middleware to v1 router
v1Router.use(addDeprecationHeaders);

// Version validation middleware
const validateApiVersion = (req, res, next) => {
  const apiVersion = req.path.match(/^\/api\/(v\d+)/)?.[1];
  
  if (apiVersion) {
    // Add version information to response headers
    res.set('X-API-Version', apiVersion);
    
    // Log version usage for analytics
    if (process.env.NODE_ENV !== 'test') {
      logger.debug(`API ${apiVersion} accessed: ${req.method} ${req.path}`, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        endpoint: req.path
      });
    }
  }
  
  next();
};

// Apply version validation to all API routes
app.use('/api', validateApiVersion);

// Create v2Router for current API version
const v2Router = express.Router();

// Add current version headers for v2 API
const addCurrentVersionHeaders = (req, res, next) => {
  res.set({
    'X-API-Version': 'v2',
    'X-API-Status': 'stable',
    'Cache-Control': 'public, max-age=300', // Cache responses for 5 minutes
    'X-Rate-Limit-Policy': 'https://docs.nova-universe.com/api/rate-limits'
  });
  next();
};

v2Router.use(addCurrentVersionHeaders);

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
      organizationName: 'Your Organization',
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
          organizationName: 'Your Organization',
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
  '/api/login',
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
  if (!db || !db.query) {
    return res.status(503).json({ status: 'starting' });
  }
  const uptime = Math.floor(process.uptime());
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: req.headers.origin || 'no-origin',
    apiVersion: getApiVersion(),
    uiVersion: getUiVersion(),
    cliVersion: getCliVersion(),
    uptime: `${hours}h ${minutes}m ${seconds}s`,
    uptimeSeconds: uptime,
  });
});

// Root health endpoint with performance monitoring
app.get('/health', (req, res) => {
  const health = performanceMonitor.getHealthStatus();
  res.status(health.status === 'healthy' ? 200 : health.status === 'warning' ? 200 : 503).json(health);
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
app.get('/api/kiosks/:id/remote-config', (req, res) => {
  const kioskId = req.params.id;

  // Check authentication
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const payload = token && verify(token);

  const isKioskAuth = payload && payload.type === 'kiosk' && payload.kioskId === kioskId;
  const isAdminAuth = req.user || (payload && payload.type !== 'kiosk');
  const hasGeneralKioskToken = KIOSK_TOKEN && token === KIOSK_TOKEN;

  if (!isKioskAuth && !isAdminAuth && !hasGeneralKioskToken && !DISABLE_AUTH) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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
app.put('/api/kiosks/:id/status', (req, res) => {
  const kioskId = req.params.id;
  const { status, timestamp } = req.body;

  // Check authentication
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const payload = token && verify(token);

  const isKioskAuth = payload && payload.type === 'kiosk' && payload.kioskId === kioskId;
  const isAdminAuth = req.user || (payload && payload.type !== 'kiosk');
  const hasGeneralKioskToken = KIOSK_TOKEN && token === KIOSK_TOKEN;

  if (!isKioskAuth && !isAdminAuth && !hasGeneralKioskToken && !DISABLE_AUTH) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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

app.get('/api/kiosks/:id', (req, res) => {
  const kioskId = req.params.id;

  // Check if request has valid kiosk token or admin auth
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const payload = token && verify(token);

  // Allow access with valid kiosk token, admin auth, or general kiosk token
  const isKioskAuth = payload && payload.type === 'kiosk' && payload.kioskId === kioskId;
  const isAdminAuth = req.user || (payload && payload.type !== 'kiosk');
  const hasGeneralKioskToken = KIOSK_TOKEN && token === KIOSK_TOKEN;

  if (!isKioskAuth && !isAdminAuth && !hasGeneralKioskToken && !DISABLE_AUTH) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

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
    res.status(500).json({ error: 'DB error' });
  }
});

// Refactored kiosksRouter GET endpoint (async/await, PostgreSQL)
kiosksRouter.get('/', ensureAuth, async (req, res) => {
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

// --- API v1 Kiosks endpoints ---
app.use('/api/v1/kiosks', kiosksRouter);

// Mount at both /api/kiosks and /api/v1/kiosks
app.use('/api/kiosks', kiosksRouter);
app.use('/api/v1/kiosks', kiosksRouter);

// Register v1 router for legacy API endpoints
app.use('/api/v1', v1Router);

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
      name: 'Nova Universe Platform API'
    },
    versions: {
      supported: ['v2', 'v1'],
      current: 'v2',
      deprecated: ['v1'],
      sunset: {
        v1: '2024-12-31T23:59:59Z' // Example sunset date for v1
      }
    },
    ui: {
      version: getUiVersion()
    },
    cli: {
      version: getCliVersion()
    },
    deprecationPolicy: {
      notice: 'Deprecated versions will be supported for 12 months after deprecation announcement',
      migration: 'See migration guide at https://docs.nova-universe.com/api/migration'
    }
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
    node: process.version
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
                ${swaggerSpec.servers?.map(s => `• ${s.url} - ${s.description}`).join('<br>') || 'None configured'}
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
      }
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
    swaggerUrl: '/api-docs/swagger.json'
  }),
);

// === API VERSION ROUTING STRATEGY ===
// 
// This API follows semantic versioning with URI-based versioning:
// - v2: Current stable version with latest features (default for new endpoints)
// - v1: Legacy version with deprecation warnings (maintained for backward compatibility)
//
// Route organization:
// 1. v2 routes: /api/v2/* - Latest features and improvements
// 2. v1 routes: /api/v1/* - Legacy routes with deprecation headers
// 3. Backward compatibility: Legacy unversioned routes (/api/*) map to v1
//
// Migration strategy:
// - New features are added to v2 only
// - v1 receives only critical security fixes
// - Breaking changes require a new major version
// - Deprecation notices are sent via response headers

// Register versioned routers first
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// === API v2 ROUTES (Current Stable Version) ===

// Core v2 endpoints
v2Router.use('/user360', user360Router); // User 360 API (v2 only)
v2Router.use('/mcp', mcpServerRouter); // MCP Server Control Tower API (v2 only)
v2Router.use('/synth', synthV2Router); // Nova Synth - AI Engine v2 (Enhanced)
v2Router.use('/alerts', alertsRouter); // Unified Alerts facade (Nova Alert)
v2Router.use('/notifications', ensureAuth, notificationsRouter); // Universal Notification Platform
v2Router.use('/beacon', beaconRouter); // Nova Beacon - Kiosk Management v2
v2Router.use('/goalert', goalertProxyRouter); // GoAlert Proxy for alerting

// v2 aliases for monitoring (backward compatibility)
v2Router.use('/monitoring', monitoringRouter);
v2Router.use('/sentinel', monitoringRouter);

// === API v1 ROUTES (Legacy/Deprecated Version) ===

// Legacy configuration and core endpoints
v1Router.use('/organizations', organizationsRouter);
v1Router.use('/directory', directoryRouter);
v1Router.use('/roles', rolesRouter);
v1Router.use('/assets', assetsRouter);
v1Router.use('/inventory', inventoryRouter);
v1Router.use('/cmdb', cmdbRouter);
v1Router.use('/cmdb', cmdbExtendedRouter);
v1Router.use('/integrations', integrationsRouter);
v1Router.use('/catalog-items', catalogItemsRouter);
v1Router.use('/search', searchRouter);
v1Router.use('/configuration', configurationRouter);
v1Router.use('/', serverRouter); // Handles /api/v1/server-info
v1Router.use('/logs', logsRouter);
v1Router.use('/reports', reportsRouter);
v1Router.use('/vip', vipRouter);
v1Router.use('/workflows', workflowsRouter);
v1Router.use('/modules', modulesRouter);
v1Router.use('/api-keys', apiKeysRouter);
v1Router.use('/websocket', websocketRouter);
v1Router.use('/helpscout', helpscoutRouter);
v1Router.use('/analytics', analyticsRouter);
v1Router.use('/monitoring', monitoringRouter);
v1Router.use('/uptime-kuma', uptimeKumaProxyRouter);
v1Router.use('/websocket/uptime-kuma', uptimeKumaWebSocketRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/tickets', ticketsRouter);
v1Router.use('/spaces', spacesRouter);
v1Router.use('/ai-fabric', aiFabricRouter);
v1Router.use('/setup', setupRouter);
v1Router.use('/comms', commsRouter); // Nova Comms - Slack integration
v1Router.use('/nova-tv', novaTVRouter); // Nova TV - Channel Management
v1Router.use('/scim/monitor', scimMonitorRouter); // SCIM Monitoring and Logging
v1Router.use('/core', coreRouter);
v1Router.use('/status', statusSummaryRouter);
v1Router.use('/announcements', announcementsRouter);
v1Router.use('/cosmo', cosmoRouter);

// Nova module routes (v1)
v1Router.use('/helix', helixRouter); // Nova Helix - Identity Engine
v1Router.use('/helix/login', helixUniversalLoginRouter); // Nova Helix - Universal Login
v1Router.use('/lore', loreRouter); // Nova Lore - Knowledge Base
v1Router.use('/pulse', pulseRouter); // Nova Pulse - Technician Portal
v1Router.use('/orbit', orbitRouter); // Nova Orbit - End-User Portal
v1Router.use('/synth', synthRouter); // Nova Synth - AI Engine (Legacy v1)

// Kiosk management (available in both versions)
v1Router.use('/kiosks', kiosksRouter);
v2Router.use('/kiosks', kiosksRouter);

// === BACKWARD COMPATIBILITY ROUTES ===
// Map legacy unversioned routes to v1 for backward compatibility
// These routes include deprecation warnings via the v1Router middleware

app.use('/api/catalog-items', catalogItemsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/helpscout', helpscoutRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/ai-fabric', aiFabricRouter);
app.use('/api/setup', setupRouter);
app.use('/api/nova-tv', novaTVRouter);
app.use('/api/kiosks', kiosksRouter);

// Special routes that maintain their own paths
app.use('/scim/v2', scimRouter); // SCIM 2.0 Provisioning API
app.use('/core', coreRouter);

// Feature-gated status pages
const featureStatusPagesEnv = process.env.FEATURE_STATUS_PAGES === 'true';
let featureStatusPagesConfig = false;
try {
  featureStatusPagesConfig = await ConfigurationManager.get('features.statusPages', false);
} catch {}

if (featureStatusPagesEnv || featureStatusPagesConfig) {
  app.use('/status', statusSummaryRouter);
} else {
  // Still expose summary for legacy clients without pages
  v1Router.use('/status', statusSummaryRouter);
}

app.use('/announcements', announcementsRouter);

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
  createApp().then(async ({ app, server, io }) => {
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
    res.status(500).json({ error: 'DB error' });
  }
});
// --- END Kiosks Router ---

// --- END: Move all direct /api/* endpoint definitions to v1Router ---
