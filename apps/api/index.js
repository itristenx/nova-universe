// All imports at the top
import { logger } from './logger.js';
import assetsRouter from './routes/assets.js';
import configurationRouter from './routes/configuration.js';
import directoryRouter from './routes/directory.js';
import integrationsRouter from './routes/integrations.js';
import organizationsRouter from './routes/organizations.js';
import rolesRouter from './routes/roles.js';
import searchRouter from './routes/search.js';
import serverRouter from './routes/server.js';
import logsRouter from './routes/logs.js'; // Import logsRouter
// Nova module routes
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import axios from 'axios';
import base64url from 'base64url';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import helmet from 'helmet';
import nodemailer from 'nodemailer';
import passport from 'passport';
import path from 'path';
import qrcode from 'qrcode';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import ConfigurationManager from './config/app-settings.js';
import db from './db.js';
import events from './events.js';
import { sign, verify } from './jwt.js';
import { authenticateJWT } from './middleware/auth.js';
import { authRateLimit } from './middleware/rateLimiter.js';
import { requestLogger, securityHeaders } from './middleware/security.js';
import { validateActivationCode, validateEmail, validateKioskRegistration } from './middleware/validation.js';
import helixRouter from './routes/helix.js';
import loreRouter from './routes/lore.js';
import orbitRouter from './routes/orbit.js';
import pulseRouter from './routes/pulse.js';
import mailroomRouter from './routes/mailroom.js';
import inventoryRouter from './routes/inventory.js';
import scimRouter from './routes/scim.js';
import synthRouter from './routes/synth.js';
import { getEmailStrategy } from './utils/serviceHelpers.js';
import { setupGraphQL } from './graphql.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure environment
dotenv.config();

// Initialize Express app
const app = express();
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
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../nova-core/package.json'), 'utf8'));
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

// Swagger/OpenAPI setup
let swaggerJSDoc, swaggerUi;
if (process.env.NODE_ENV !== 'test') {
  swaggerJSDoc = (await import('swagger-jsdoc')).default;
  swaggerUi = (await import('swagger-ui-express')).default;
} else {
  // Jest/test mode: provide a no-op function to avoid import errors
  swaggerJSDoc = () => ({ openapi: '3.0.0', info: {}, paths: {} });
  swaggerUi = { serve: (req, res, next) => next(), setup: () => (req, res, next) => next() };
}

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Nova Universe API',
    version: '1.0.0',
    description: 'API documentation for Nova Universe backend',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Nova Platform API server (v1)',
    },
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: [
    path.join(__dirname, 'routes', '*.js'),
    path.join(__dirname, 'routes', 'server.js'),
    path.join(__dirname, 'routes', 'organizations.js'),
    path.join(__dirname, 'routes', 'directory.js'),
    path.join(__dirname, 'routes', 'roles.js'),
    path.join(__dirname, 'routes', 'assets.js'),
    path.join(__dirname, 'routes', 'integrations.js'),
    // Nova module routes
    path.join(__dirname, 'routes', 'helix.js'),
    path.join(__dirname, 'routes', 'lore.js'),
    path.join(__dirname, 'routes', 'pulse.js'),
    path.join(__dirname, 'routes', 'orbit.js'),
    path.join(__dirname, 'routes', 'synth.js')
  ]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Debug: Log the swagger spec to see if it's being generated
if (process.env.NODE_ENV === 'development') {
  console.log('📋 Swagger spec generated with paths:', Object.keys(swaggerSpec.paths || {}));
}

// Environment variable validation helper
function validateEnv() {
  // Required variables for secure production operation
  const requiredVars = [
    'SESSION_SECRET',
    'JWT_SECRET'
  ];

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
  for (const key of optionalVars) {
    if (!process.env[key]) {
      logger.warn(`Optional environment variable not set: ${key}`);
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
  console.log('🔧 CORS Debug - originList:', originList);
}

// Apply security middleware
app.use(securityHeaders);
app.use(requestLogger);

// Regular CSP for other routes  
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"]
    }
  }
}));

// Disable CSP entirely for Swagger UI routes (must be after helmet)
app.use('/api-docs', (req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
});

// Add custom CORS debugging middleware
app.use((req, res, next) => {
  console.log('🔍 Request received:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  next();
});

// Temporarily allow all origins for debugging
if (process.env.DEBUG_CORS === 'true') {
  console.log('🔧 CORS Debug - Setting up CORS with origin: true');
  app.use(cors({ 
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200
  }));
} else {
  console.log('🔒 CORS Production - Setting up CORS with restricted origins:', originList);
  app.use(cors({ 
    origin: originList || false,
    credentials: true,
    optionsSuccessStatus: 200
  }));
}

// Add post-CORS middleware to log headers (only in debug mode)
if (process.env.DEBUG_CORS === 'true') {
  app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      console.log('📤 Response headers:', {
        'access-control-allow-origin': res.getHeader('access-control-allow-origin'),
        'access-control-allow-credentials': res.getHeader('access-control-allow-credentials'),
        vary: res.getHeader('vary')
      });
      return originalSend.call(this, data);
    };
    next();
  });
}

app.use(express.json({ limit: '10mb' })); // Limit JSON payload size


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

const DISABLE_AUTH = process.env.DISABLE_AUTH === 'true' ||
  process.env.NODE_ENV === 'test';
const SCIM_TOKEN = process.env.SCIM_TOKEN || '';
const KIOSK_TOKEN = process.env.KIOSK_TOKEN || '';
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!DISABLE_AUTH && !process.env.SESSION_SECRET) {
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
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      },
      name: 'novauniverse.sid' // Change default session name
    })
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
            db.run(`INSERT INTO users (name, email) VALUES ($1, $2)`, [name, email], function (e) {
              if (e) return done(e);
              done(null, { id: this.lastID, name, email });
            });
          }
        });
      }
    )
  );
  } // End SAML conditional
}

const PORT = process.env.API_PORT || 3000;
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
            user.permissions = Array.from(
              new Set(rows.map((r) => r.perm).filter(Boolean))
            );
            req.user = user;
            next();
          }
        );
      };

      if (req.isAuthenticated && req.isAuthenticated()) {
        return finalize(req.user);
      }
      const header = req.headers.authorization || '';
      const token = header.replace(/^Bearer\s+/i, '');
      const payload = token && verify(token);
      if (payload) {
        db.get(
          'SELECT id, name, email FROM users WHERE id=$1',
          [payload.id],
          (err, row) => {
            if (err || !row) {
              return res.status(401).json({ error: 'Authentication required', errorCode: 'AUTH_REQUIRED' });
            }
            finalize(row);
          }
        );
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
        sso: true 
      });
      
      // Redirect to admin UI with token
      const adminUrl = process.env.ADMIN_URL || 'http://localhost:5173';
      res.redirect(`${adminUrl}/?token=${encodeURIComponent(token)}`);
    }
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

// Create a v1Router to wrap all direct /api/* endpoints
const v1Router = express.Router();

// --- BEGIN: Move all direct /api/* endpoint definitions to v1Router ---
v1Router.get('/config', ensureAuth, (req, res) => {
  db.all(`SELECT key, value FROM config`, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    const config = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    delete config.adminPassword;
    res.json(config);
  });
});

v1Router.put("/api/config", ensureAuth, (req, res) => {
  const updates = req.body;
  const stmt = db.prepare('INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  db.serialize(() => {
    for (const [key, value] of Object.entries(updates)) {
      stmt.run(key, String(value));
    }
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "Config updated" });
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
        unavailableMessage: config.statusUnavailableMsg || 'Status Unavailable'
      };
      
      res.json(response);
    }
  );
});

v1Router.put('/api/status-config', ensureAuth, (req, res) => {
  const { enabled, currentStatus, openMessage, closedMessage, errorMessage, meetingMessage, brbMessage, lunchMessage, unavailableMessage } = req.body;
  
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
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`
  );
  db.serialize(() => {
    for (const [k, v] of Object.entries(updates)) {
      stmt.run(k, String(v));
    }
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      events.emit('status-config-updated', updates);
      res.json({ message: 'updated' });
    });
  });
});

// Directory config and search endpoints are now handled by directoryRouter

// SSO Configuration endpoint
v1Router.get('/api/sso-config', ensureAuth, (req, res) => {
  // Check database first, fall back to environment variables
  db.get('SELECT enabled, provider, configuration FROM sso_configurations WHERE id = 1', (err, row) => {
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
        cert: ''
      }
    };
    
    if (row && row.enabled) {
      try {
        const dbConfig = JSON.parse(row.configuration || '{}');
        config = {
          enabled: !!row.enabled,
          provider: row.provider || 'saml',
          ...dbConfig
        };
      } catch (e) {
        logger.error('Error parsing SSO configuration:', e);
      }
    } else {
      // Fallback to environment variables for backward compatibility
      const samlEnabled = !!(process.env.SAML_ENTRY_POINT && process.env.SAML_ISSUER && process.env.SAML_CALLBACK_URL);
      config = {
        enabled: samlEnabled,
        provider: 'saml',
        saml: {
          enabled: samlEnabled,
          entryPoint: process.env.SAML_ENTRY_POINT || '',
          issuer: process.env.SAML_ISSUER || '',
          callbackUrl: process.env.SAML_CALLBACK_URL || '',
          cert: process.env.SAML_CERT ? '***CONFIGURED***' : ''
        }
      };
    }
    
    res.json(config);
  });
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
      syncInterval: 3600
    };
    
    if (row) {
      config = {
        enabled: !!row.enabled,
        token: row.bearer_token ? '***CONFIGURED***' : '',
        endpoint: row.endpoint_url || '/scim/v2',
        autoProvisioning: !!row.auto_provisioning,
        autoDeprovisioning: !!row.auto_deprovisioning,
        syncInterval: row.sync_interval || 3600,
        lastSync: row.last_sync
      };
    } else {
      // Fallback to environment variables for backward compatibility
      const scimEnabled = !!SCIM_TOKEN;
      config = {
        enabled: scimEnabled,
        token: scimEnabled ? '***CONFIGURED***' : '',
        endpoint: '/scim/v2'
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
        if (config.saml && config.saml.entryPoint && config.saml.issuer && config.saml.callbackUrl) {
          ssoEnabled = true;
          loginUrl = '/auth/saml';
        }
      } catch (e) {
        logger.error('Error parsing SSO configuration:', e);
      }
    } else {
      // Fallback to environment variables
      ssoEnabled = !!(process.env.SAML_ENTRY_POINT && process.env.SAML_ISSUER && process.env.SAML_CALLBACK_URL);
      loginUrl = ssoEnabled ? '/auth/saml' : null;
    }
    
    res.json({ 
      available: ssoEnabled,
      loginUrl: loginUrl
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
      `
    };

    await transporter.sendMail(testMailOptions);
    
    res.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error) {
    logger.error('SMTP test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'SMTP test failed', 
      details: error.message
    });
  }
});

v1Router.post('/api/feedback', [
  body('name').optional().isString().trim(),
  body('message').isString().trim().notEmpty(),
], (req, res) => {
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
    }
  );
});

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
        active: true
      };
      res.json(newNotification);
    }
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
    }
  );
});

v1Router.post('/api/login', apiLoginLimiter, authRateLimit, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).trim(),
], (req, res) => {
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
  
  db.get('SELECT * FROM users WHERE email=$1 AND disabled=0 ORDER BY id DESC', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row || !row.passwordHash) {
      return res.status(401).json({ error: 'invalid' });
    }
    if (!bcrypt.compareSync(password, row.passwordHash)) {
      return res.status(401).json({ error: 'invalid' });
    }
    
    // Update last login timestamp
    db.run('UPDATE users SET last_login = $1 WHERE id = $2', [new Date().toISOString(), row.id]);
    
    const token = sign({ id: row.id, name: row.name, email: row.email });
    res.json({ token });
  });
});

// Health check endpoint for debugging frontend connectivity
app.get('/api/health', (req, res) => {
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
    uptimeSeconds: uptime
  });
});

// Auth status endpoint for admin UI
app.get('/api/auth/status', (req, res) => {
  res.json({
    authRequired: !DISABLE_AUTH,
    authDisabled: DISABLE_AUTH
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
    environment: process.env.NODE_ENV || 'development'
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
      if (err) return res.status(500).json({ error: "DB error" });
      events.emit('kiosk-registered', { id, version });
      res.json({ message: "registered" });
    }
  );
}

app.post('/api/register-kiosk', validateKioskRegistration, registerKioskHandler);
app.post('/api/v1/register-kiosk', validateKioskRegistration, registerKioskHandler);

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
    
    db.all(
      "SELECT key, value FROM config WHERE key LIKE 'directory%'",
      (e, rows) => {
        if (e) return res.status(500).json({ error: 'DB error' });
        const cfg = Object.fromEntries(rows.map((r) => [r.key, r.value]));
        res.json({
          ...row,
          directoryEnabled: cfg.directoryEnabled === '1',
          directoryProvider: cfg.directoryProvider || 'mock',
        });
      }
    );
  });
});

app.put("/api/kiosks/:id", ensureAuth, (req, res) => {
  const { id } = req.params;
  const { logoUrl, bgUrl, active } = req.body;
  db.run(
    `UPDATE kiosks SET logoUrl=$1, bgUrl=$2, active=COALESCE($3, active) WHERE id=$4`,
    [logoUrl, bgUrl, active !== undefined ? active : null, id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "updated" });
    }
  );
});

// Refactored kiosks GET endpoint (async/await, PostgreSQL)
app.get("/api/kiosks", ensureAuth, async (req, res) => {
  try {
    const { rows: kiosks } = await db.query("SELECT * FROM kiosks");
    const { rows: configRows } = await db.query('SELECT key, value FROM config');
    const globalConfig = Object.fromEntries(configRows.map(r => [r.key, r.value]));
    const kiosksWithConfig = kiosks.map(kiosk => ({
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
        errorMsg: kiosk.errorMsg || globalConfig.statusErrorMsg || 'Service temporarily unavailable',
        schedule: kiosk.schedule ? JSON.parse(kiosk.schedule) : undefined,
        officeHours: globalConfig.officeHours ? JSON.parse(globalConfig.officeHours) : undefined
      }
    }));
    res.json(kiosksWithConfig);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// Refactored kiosksRouter GET endpoint (async/await, PostgreSQL)
kiosksRouter.get('/', ensureAuth, async (req, res) => {
  try {
    const { rows: kiosks } = await db.query("SELECT * FROM kiosks");
    const { rows: configRows } = await db.query('SELECT key, value FROM config');
    const globalConfig = Object.fromEntries(configRows.map(r => [r.key, r.value]));
    const kiosksWithConfig = kiosks.map(kiosk => ({
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
        errorMsg: kiosk.errorMsg || globalConfig.statusErrorMsg || 'Service temporarily unavailable',
        schedule: kiosk.schedule ? JSON.parse(kiosk.schedule) : undefined,
        officeHours: globalConfig.officeHours ? JSON.parse(globalConfig.officeHours) : undefined
      }
    }));
    res.json(kiosksWithConfig);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
});

// DELETE notification
v1Router.delete('/api/notifications/:id', ensureAuth, (req, res) => {
  const { id } = req.params;
  db.run(
    `DELETE FROM notifications WHERE id = $1`,
    [id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Notification deleted' });
    }
  );
});

// DELETE all notifications
v1Router.delete('/api/notifications', ensureAuth, (req, res) => {
  db.run(
    `DELETE FROM notifications`,
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'All notifications deleted' });
    }
  );
});

// --- API v1 Kiosks endpoints ---
app.use('/api/v1/kiosks', kiosksRouter);

// Mount at both /api/kiosks and /api/v1/kiosks
app.use('/api/kiosks', kiosksRouter);
app.use('/api/v1/kiosks', kiosksRouter);

// Setup API routes
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Simple test page to debug Swagger UI
app.get('/api-docs/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Swagger UI Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
            .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        </style>
    </head>
    <body>
        <h1>Swagger UI Debug</h1>
        <div class="status success">✅ Server is running</div>
        <div class="status info">📋 JSON Spec available at: <a href="/api-docs/swagger.json">/api-docs/swagger.json</a></div>
        <div class="status info">📖 Swagger UI at: <a href="/api-docs/">/api-docs/</a></div>
        
        <h2>API Endpoints Found:</h2>
        <ul>
          ${Object.keys(swaggerSpec.paths || {}).map(path => `<li><code>${path}</code></li>`).join('')}
        </ul>
        
        <h2>Debug Info:</h2>
        <pre>Swagger spec paths: ${JSON.stringify(Object.keys(swaggerSpec.paths || {}), null, 2)}</pre>
        
        <script>
          console.log('Test page loaded successfully');
          fetch('/api-docs/swagger.json')
            .then(response => response.json())
            .then(data => {
              console.log('Swagger JSON loaded:', data);
              document.getElementById('swagger-status').textContent = '✅ Swagger JSON loads correctly';
            })
            .catch(error => {
              console.error('Error loading Swagger JSON:', error);
              document.getElementById('swagger-status').textContent = '❌ Error loading Swagger JSON';
            });
        </script>
        <div id="swagger-status" class="status info">🔄 Testing Swagger JSON loading...</div>
    </body>
    </html>
  `);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
  swaggerOptions: {
    url: '/api-docs/swagger.json'
  },
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Nova Universe API Documentation"
}));

// Initialize configuration management system
ConfigurationManager.initialize().catch(err => {
  logger.error('Failed to initialize configuration manager:', err);
});

// Initialize Elasticsearch
import elasticManager from './database/elastic.js';
elasticManager.initialize().catch(err => {
  logger.error('Failed to initialize Elasticsearch:', err);
});

app.use('/api/v1/organizations', organizationsRouter);
app.use('/api/v1/directory', directoryRouter);
app.use('/api/v1/roles', rolesRouter);
app.use('/api/v1/assets', assetsRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/integrations', integrationsRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/configuration', configurationRouter);
app.use('/api/v1', serverRouter); // Handles /api/v1/server-info
app.use('/api/v1/logs', logsRouter); // Register logsRouter

// Nova module routes
app.use('/api/v1/helix', helixRouter);     // Nova Helix - Identity Engine
app.use('/api/v1/lore', loreRouter);       // Nova Lore - Knowledge Base
app.use('/api/v1/pulse', pulseRouter);     // Nova Pulse - Technician Portal
app.use('/api/v1/mailroom', mailroomRouter); // Nova Mailroom - Package Handling
app.use('/api/v1/orbit', orbitRouter);     // Nova Orbit - End-User Portal
app.use('/api/v1/synth', synthRouter);     // Nova Synth - AI Engine
app.use('/scim/v2', scimRouter);          // SCIM 2.0 Provisioning API

// Wrap all app setup in an async function
export async function createApp() {
  // All the above setup code remains as is
  // (from dotenv.config() through all middleware, routers, etc.)
  // Setup Apollo GraphQL server
  await setupGraphQL(app);
  // Do not call app.listen here
  return app;
}

// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  createApp().then((app) => {
    app.listen(PORT, () => {
      console.log(`🚀 Nova Universe API Server running on port ${PORT}`);
      console.log(`📊 Admin interface: http://localhost:${PORT}/admin`);
      console.log(`🔧 Server info endpoint: http://localhost:${PORT}/api/server-info`);
    });
  });
}

export default createApp;

// Enhanced error handling
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Always log the error stack for server logs
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  const isProd = process.env.NODE_ENV === 'production';
  // Only show detailed error in non-production
  const errorResponse = isProd
    ? { error: 'Internal Server Error' }
    : { error: err.message || 'Internal Server Error', stack: err.stack };
  res.status(err.status || 500).json(errorResponse);
});
