// All imports at the top
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { logger } from './logger.js';
import organizationsRouter from './routes/organizations.js';
import directoryRouter from './routes/directory.js';
import serverRouter from './routes/server.js';
import rolesRouter from './routes/roles.js';
import assetsRouter from './routes/assets.js';
import integrationsRouter from './routes/integrations.js';
import searchRouter from './routes/search.js';
import configurationRouter from './routes/configuration.js';
import ConfigurationManager from './config/app-settings.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import session from 'express-session';
import passport from 'passport';
import { rateLimit } from 'express-rate-limit';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';
import events from './events.js';
import { sign, verify } from './jwt.js';
import base64url from 'base64url';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import qrcode from 'qrcode';
import { securityHeaders, requestLogger } from './middleware/security.js';
import { validateKioskRegistration, validateTicketSubmission, validateEmail, validateActivationCode } from './middleware/validation.js';
import { authRateLimit, apiRateLimit, kioskRateLimit } from './middleware/rateLimiter.js';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { getServiceNowConfig, getEmailStrategy } from './utils/serviceHelpers.js';

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
    path.join(__dirname, 'routes', 'integrations.js')
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
      name: 'cueit.sid' // Change default session name
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
        db.get(`SELECT id FROM users WHERE email=?`, [email], (err, row) => {
          if (err) return done(err);
          if (row) {
            db.run(`UPDATE users SET name=? WHERE id=?`, [name, row.id], (e) => {
              if (e) return done(e);
              done(null, { id: row.id, name, email });
            });
          } else {
            db.run(`INSERT INTO users (name, email) VALUES (?, ?)`, [name, email], function (e) {
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
             JOIN roles r ON ur.role_id=r.id
             LEFT JOIN role_permissions rp ON r.id=rp.role_id
             LEFT JOIN permissions p ON rp.permission_id=p.id
            WHERE ur.user_id=?`,
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
          'SELECT id, name, email FROM users WHERE id=?',
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

app.post("/submit-ticket", ticketLimiter, [
  body('name').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('title').isString().trim().notEmpty(),
  body('system').isString().trim().notEmpty(),
  body('urgency').isString().trim().notEmpty(),
  body('description').optional().isString().trim(),
], async (req, res) => {
  const { name, email, title, system, urgency, description } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const ticketId = uuidv4().split("-")[0];
  const timestamp = new Date().toISOString();

  // Handle ServiceNow integration
  let serviceNowId = '';
  const serviceNowConfig = getServiceNowConfig();
  if (serviceNowConfig) {
    try {
      const resp = await axios.post(
        `${serviceNowConfig.instance}/api/now/table/incident`,
        {
          short_description: title,
          urgency,
          description: `Name: ${name}\nEmail: ${email}\nSystem: ${system}\n\n${description || ''}`,
        },
        {
          auth: { username: serviceNowConfig.user, password: serviceNowConfig.pass },
        }
      );
      serviceNowId = resp.data?.result?.sys_id || '';
    } catch (err) {
      logger.error('ServiceNow request failed:', err.message);
    }
  }

  const mailOptions = {
    from: email,
    to: process.env.HELPDESK_EMAIL,
    subject: `[CueIT Ticket] ${title} (${urgency})`,
    text: `
New IT Help Desk Request (CueIT):

Name: ${name}
Email: ${email}
Title: ${title}
System: ${system}
Urgency: ${urgency}
Description:
${description || "(No description provided)"}
    `,
  };

  // Determine email sending strategy
  const emailStrategy = getEmailStrategy();

  let emailStatus = "success";
  try {
    if (emailStrategy.sendViaHelpScout) {
      await axios.post(
        "https://api.helpscout.net/v2/conversations",
        {
          type: "email",
          subject: mailOptions.subject,
          mailboxId: Number(emailStrategy.helpScout.mailboxId),
          customer: { email, firstName: name },
          threads: [
            {
              type: "customer",
              status: "active",
              body: mailOptions.text,
            },
          ],
        },
        {
          headers: { Authorization: `Bearer ${emailStrategy.helpScout.apiKey}` },
        }
      );
    }
    if (emailStrategy.sendViaSmtp) {
      await transporter.sendMail(mailOptions);
    }
  } catch (err) {
    logger.error("Failed to send email:", err.message);
    events.emit('mail-error', err);
    emailStatus = "fail";
  }

  db.run(
    `INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status, servicenow_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [ticketId, name, email, title, system, urgency, timestamp, emailStatus, serviceNowId],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });

      return res.json({ message: "Ticket submitted", ticketId, emailStatus });
    }
  );
});

app.get('/api/logs', ensureAuth, (req, res) => {
  const { start, end, status } = req.query;
  const clauses = [];
  const params = [];

  if (start) {
    clauses.push('timestamp >= ?');
    params.push(start);
  }
  if (end) {
    clauses.push('timestamp <= ?');
    params.push(end);
  }
  if (status) {
    clauses.push('email_status = ?');
    params.push(status);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT * FROM logs ${where} ORDER BY timestamp DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      logger.error('Failed to fetch logs:', err.message);
      return res.status(500).json({ error: 'DB error' });
    }
    res.json(rows);
  });
});

app.delete("/api/logs/:id", ensureAuth, (req, res) => {
  db.deleteLog(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "deleted" });
  });
});

app.delete("/api/logs", ensureAuth, (req, res) => {
  db.deleteAllLogs((err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "cleared" });
  });
});

app.get("/api/config", ensureAuth, (req, res) => {
  db.all(`SELECT key, value FROM config`, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    const config = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    delete config.adminPassword;
    res.json(config);
  });
});

app.put("/api/config", ensureAuth, (req, res) => {
  const updates = req.body;
  const stmt = db.prepare(`INSERT INTO config (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value`);
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

app.get('/api/status-config', ensureAuth, (req, res) => {
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

app.put('/api/status-config', ensureAuth, (req, res) => {
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
    `INSERT INTO config (key, value) VALUES (?, ?)
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
app.get('/api/sso-config', ensureAuth, (req, res) => {
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
app.get('/api/scim-config', ensureAuth, (req, res) => {
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
app.get('/api/sso-available', (req, res) => {
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
app.post('/api/test-smtp', ensureAuth, async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  try {
    const testMailOptions = {
      from: process.env.SMTP_FROM || 'noreply@cueit.local',
      to: email,
      subject: 'CueIT SMTP Test Email',
      text: 'This is a test email from CueIT to verify SMTP configuration is working correctly.',
      html: `
        <h2>CueIT SMTP Test</h2>
        <p>This is a test email from CueIT to verify SMTP configuration is working correctly.</p>
        <p>If you receive this email, your SMTP settings are configured properly.</p>
        <hr>
        <small>Sent from CueIT Admin Panel</small>
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

app.post('/api/feedback', [
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
    `INSERT INTO feedback (name, message, timestamp) VALUES (?, ?, ?)`,
    [name, message, timestamp],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/feedback', ensureAuth, (req, res) => {
  db.all(`SELECT * FROM feedback ORDER BY timestamp DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

app.get('/api/notifications', ensureAuth, (req, res) => {
  db.all(
    `SELECT * FROM notifications ORDER BY created_at DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows);
    }
  );
});

app.post('/api/notifications', ensureAuth, (req, res) => {
  const { message, level, type } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Default values for backward compatibility
  const notificationLevel = level || 'info';
  const notificationType = type || 'system';
  const createdAt = new Date().toISOString();
  
  db.run(
    `INSERT INTO notifications (message, level, type, created_at, active) VALUES (?, ?, ?, ?, 1)`,
    [message, notificationLevel, notificationType, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      const newNotification = {
        id: this.lastID,
        message,
        level: notificationLevel,
        type: notificationType,
        read: false,
        createdAt,
        active: 1
      };
      
      events.emit('notifications-updated');
      res.json(newNotification);
    }
  );
});

app.delete('/api/notifications/:id', ensureAuth, (req, res) => {
  db.run(`DELETE FROM notifications WHERE id=?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    events.emit('notifications-updated');
    res.json({ message: 'deleted' });
  });
});

app.post('/api/verify-password', ensureAuth, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Missing password' });
  db.get(`SELECT value FROM config WHERE key='adminPassword'`, (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const hash = row ? row.value : '';
    const valid = bcrypt.compareSync(password, hash);
    res.json({ valid });
  });
});

app.put('/api/admin-password', ensureAuth, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Missing password' });
  const hash = bcrypt.hashSync(password, 12);
  db.run(
    `INSERT INTO config (key, value) VALUES ('adminPassword', ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [hash],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Password updated' });
    }
  );
});

app.post('/api/login', apiLoginLimiter, authRateLimit, [
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
  
  db.get('SELECT * FROM users WHERE email=? AND disabled=0 ORDER BY id DESC', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row || !row.passwordHash) {
      return res.status(401).json({ error: 'invalid' });
    }
    if (!bcrypt.compareSync(password, row.passwordHash)) {
      return res.status(401).json({ error: 'invalid' });
    }
    
    // Update last login timestamp
    db.run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), row.id]);
    
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

// /api/server-info now handled in organizations router for modularity

app.post('/api/register-kiosk', validateKioskRegistration, (req, res) => {
  const { id, version, token } = req.body;
  const header = req.headers.authorization || '';
  const auth = header.replace(/^Bearer\s+/i, '');
  if (KIOSK_TOKEN && token !== KIOSK_TOKEN && auth !== KIOSK_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const lastSeen = new Date().toISOString();
  db.run(
    `INSERT INTO kiosks (id, last_seen, version) VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET last_seen=excluded.last_seen, version=excluded.version`,
    [id, lastSeen, version || ""],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      events.emit('kiosk-registered', { id, version });
      res.json({ message: "registered" });
    }
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
  
  db.get('SELECT * FROM kiosks WHERE id=?', [kioskId], (err, row) => {
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
    `UPDATE kiosks SET logoUrl=?, bgUrl=?, active=COALESCE(?, active) WHERE id=?`,
    [logoUrl, bgUrl, active !== undefined ? (active ? 1 : 0) : null, id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "updated" });
    }
  );
});

app.get("/api/kiosks", ensureAuth, (req, res) => {
  db.all(`SELECT * FROM kiosks`, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    
    // Get global configuration for defaults
    db.all('SELECT key, value FROM config', (err2, configRows) => {
      if (err2) return res.status(500).json({ error: "DB error" });
      
      const globalConfig = Object.fromEntries(configRows.map(r => [r.key, r.value]));
      
      // Transform kiosks to include effectiveConfig structure
      const kiosksWithConfig = rows.map(kiosk => ({
        ...kiosk,
        active: Boolean(kiosk.active), // Convert to boolean
        configScope: 'global', // Default config scope
        hasOverrides: false, // For now, no individual overrides
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
    });
  });
});

app.delete("/api/kiosks/:id", ensureAuth, (req, res) => {
  db.deleteKiosk(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    events.emit('kiosk-deleted', { id: req.params.id });
    res.json({ message: "deleted" });
  });
});

app.delete("/api/kiosks", ensureAuth, (req, res) => {
  db.deleteAllKiosks((err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    events.emit('kiosk-deleted', { all: true });
    res.json({ message: "cleared" });
  });
});

app.put("/api/kiosks/:id/active", ensureAuth, (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  db.run(
    `UPDATE kiosks SET active=? WHERE id=?`,
    [active ? 1 : 0, id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      events.emit('kiosk-status-updated', { id, active });
      res.json({ message: "updated" });
    }
  );
});

// Kiosk refresh config endpoint
app.post("/api/kiosks/:id/refresh-config", ensureAuth, (req, res) => {
  const { id } = req.params;
  // Emit event to notify kiosk to refresh its config
  events.emit('kiosk-config-refresh', { id });
  res.json({ message: 'Config refresh requested' });
});

// Kiosk reset endpoint  
app.post("/api/kiosks/:id/reset", ensureAuth, (req, res) => {
  const { id } = req.params;
  
  // Reset kiosk to defaults and deactivate
  db.run(
    `UPDATE kiosks SET 
     active=0, 
     statusEnabled=0, 
     currentStatus='closed',
     logoUrl=NULL,
     bgUrl=NULL,
     openMsg=NULL,
     closedMsg=NULL,
     errorMsg=NULL,
     schedule=NULL
     WHERE id=?`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      events.emit('kiosk-reset', { id });
      res.json({ message: 'Kiosk reset successfully' });
    }
  );
});

// Activate kiosk endpoint
app.post("/api/kiosks/:id/activate", ensureAuth, (req, res) => {
  const { id } = req.params;
  db.run(
    `UPDATE kiosks SET active=1 WHERE id=?`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      events.emit('kiosk-activated', { id });
      res.json({ id, active: true });
    }
  );
});

// Deactivate kiosk endpoint
app.post("/api/kiosks/:id/deactivate", ensureAuth, (req, res) => {
  const { id } = req.params;
  db.run(
    `UPDATE kiosks SET active=0 WHERE id=?`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      events.emit('kiosk-deactivated', { id });
      res.json({ message: "Kiosk deactivated successfully" });
    }
  );
});

// Activate kiosk with activation code endpoint (for iOS app)
app.post("/api/kiosks/activate", (req, res) => {
  const { kioskId, activationCode } = req.body;
  
  if (!kioskId || !activationCode) {
    return res.status(400).json({
      error: 'Missing kioskId or activationCode',
      errorCode: 'MISSING_PARAMETERS'
    });
  }
  
  // Validate activation code format
  if (!validateActivationCode(activationCode)) {
    return res.status(400).json({
      error: 'Invalid activation code format',
      errorCode: 'INVALID_CODE_FORMAT'
    });
  }
  
  // Check activation code against the database (production logic)
  const normalizedCode = activationCode.toUpperCase();
  db.get(
    'SELECT * FROM kiosk_activations WHERE code = ? AND expires_at > ? LIMIT 1',
    [normalizedCode, new Date().toISOString()],
    (err, activation) => {
      if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
      if (!activation) return res.status(400).json({ error: 'Invalid or expired activation code', errorCode: 'INVALID_OR_EXPIRED_CODE' });
      // Check if kiosk exists
      db.get('SELECT * FROM kiosks WHERE id=?', [kioskId], (err, kiosk) => {
        if (err) return res.status(500).json({ error: 'Database error', errorCode: 'DB_ERROR' });
        if (!kiosk) return res.status(404).json({ error: 'Kiosk not found', errorCode: 'KIOSK_NOT_FOUND' });
        // Activate the kiosk
        db.run(
          `UPDATE kiosks SET active=1 WHERE id=?`,
          [kioskId],
          (err) => {
            if (err) return res.status(500).json({ error: 'Failed to activate kiosk', errorCode: 'ACTIVATION_FAILED' });
            // Optionally, delete or mark the activation code as used
            db.run('DELETE FROM kiosk_activations WHERE code = ?', [normalizedCode], () => {
              // Ignore errors here
              res.json({
                message: 'Kiosk activated successfully',
                kioskId: kioskId,
                active: true
              });
            });
          }
        );
      });
    }
  );
});

// Generate activation code and QR code for kiosk setup
app.post("/api/generate-activation", ensureAuth, (req, res) => {
  const activationCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  const qrData = JSON.stringify({
    type: 'kiosk_activation',
    code: activationCode,
    server: req.get('host'),
    timestamp: Date.now()
  });
  
  // Generate QR code
  qrcode.toDataURL(qrData, { width: 256 }, (err, qrCodeUrl) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate QR code' });
    }
    
    // Store activation code (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    
    db.run(
      'INSERT OR REPLACE INTO kiosk_activations (id, code, qr_code, expires_at) VALUES (?, ?, ?, ?)',
      [crypto.randomUUID(), activationCode, qrCodeUrl, expiresAt],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to store activation code' });
        }
        
        res.json({
          activationCode,
          qrCode: qrCodeUrl,
          expiresAt,
          instructions: 'Enter this code on your kiosk device or scan the QR code'
        });
      }
    );
  });
});

// Start the server
// --- MISSING API ENDPOINTS FOR UI COMPATIBILITY ---

// 1. Kiosk Activations
app.get('/api/kiosks/activations', ensureAuth, (req, res) => {
  db.all('SELECT * FROM kiosk_activations WHERE expires_at > ? ORDER BY expires_at DESC', [new Date().toISOString()], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows || []);
  });
});

// 2. Kiosk Config
app.get('/api/kiosk-config/:id', ensureAuth, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM kiosks WHERE id=?', [id], (err, kiosk) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!kiosk) return res.status(404).json({ error: 'Kiosk not found' });
    db.all('SELECT key, value FROM config', (err2, configRows) => {
      if (err2) return res.status(500).json({ error: 'DB error' });
      const globalConfig = Object.fromEntries(configRows.map(r => [r.key, r.value]));
      res.json({
        kiosk,
        config: globalConfig
      });
    });
  });
});
app.put('/api/kiosk-config/:id', ensureAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = Object.keys(updates).filter(k => ['logoUrl','bgUrl','active','statusEnabled','currentStatus','openMsg','closedMsg','errorMsg','schedule'].includes(k));
  if (!fields.length) return res.status(400).json({ error: 'No valid fields' });
  const setClause = fields.map(f => `${f}=?`).join(', ');
  const values = fields.map(f => updates[f]);
  values.push(id);
  db.run(`UPDATE kiosks SET ${setClause} WHERE id=?`, values, (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ message: 'updated' });
  });
});

// 3. Kiosk Systems
app.get('/api/kiosks/systems', ensureAuth, (req, res) => {
  db.get("SELECT value FROM config WHERE key='kioskSystems'", (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    let systems = ['Desktop','Laptop','Mobile','Network','Printer','Software','Account Access'];
    if (row && row.value) {
      try { systems = JSON.parse(row.value); } catch {}
    }
    res.json({ systems });
  });
});
app.put('/api/kiosks/systems', ensureAuth, (req, res) => {
  const { systems } = req.body;
  if (!Array.isArray(systems)) return res.status(400).json({ error: 'Invalid systems' });
  db.run("INSERT INTO config (key, value) VALUES ('kioskSystems', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", [JSON.stringify(systems)], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ message: 'updated' });
  });
});

// 4. Server Management
import { exec } from 'child_process';
app.post('/api/server/restart', ensureAuth, (req, res) => {
  // Only allow restart if running under PM2
  if (process.env.pm_id !== undefined || process.env.PM2_HOME) {
    exec('pm2 restart ' + process.env.pm_id, (err, stdout, stderr) => {
      if (err) {
        console.error('PM2 restart failed:', err, stderr);
        return res.status(500).json({ error: 'PM2 restart failed', details: stderr });
      }
      res.json({ message: 'Server restart initiated via PM2', output: stdout });
      // Optionally, you can also call process.exit(0) here, but PM2 should handle it.
    });
  } else {
    res.status(501).json({ error: 'Restart not supported: not running under PM2' });
  }
});

// 5. Directory Search
// Directory search endpoint is now handled by directoryRouter

// 6. Dashboard
app.get('/api/dashboard/stats', ensureAuth, (req, res) => {
  db.get('SELECT COUNT(*) as userCount FROM users', (err, userRow) => {
    db.get('SELECT COUNT(*) as kioskCount FROM kiosks', (err2, kioskRow) => {
      db.get('SELECT COUNT(*) as logCount FROM logs', (err3, logRow) => {
        res.json({
          users: userRow?.userCount || 0,
          kiosks: kioskRow?.kioskCount || 0,
          logs: logRow?.logCount || 0,
          version: 'CueIT API v2.0'
        });
      });
    });
  });
});
app.get('/api/dashboard/activity', ensureAuth, (req, res) => {
  db.all('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 20', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows || []);
  });
});

// 7. Passkey Management (FIDO2/WebAuthn)
const rpName = process.env.RP_NAME || 'CueIT Portal';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.RP_ORIGIN || 'http://localhost:5173';

// In-memory challenge store (for demo; use Redis or DB for production)
const userChallenges = {};

app.get('/api/passkeys', ensureAuth, (req, res) => {
  const userId = req.user.id;
  db.all('SELECT id, credential_id, public_key, device_type, backed_up, created_at, last_used FROM passkeys WHERE user_id=?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows.map(row => ({
      id: row.id,
      credentialId: row.credential_id,
      deviceType: row.device_type,
      backedUp: !!row.backed_up,
      createdAt: row.created_at,
      lastUsed: row.last_used
    })));
  });
});

app.delete('/api/passkeys/:id', ensureAuth, (req, res) => {
  const userId = req.user.id;
  db.run('DELETE FROM passkeys WHERE id=? AND user_id=?', [req.params.id, userId], function(err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ message: 'Passkey deleted successfully' });
  });
});

// Registration Begin
app.post('/api/passkey/register/begin', ensureAuth, (req, res) => {
  const user = req.user;
  db.all('SELECT credential_id FROM passkeys WHERE user_id=?', [user.id], (err, creds) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: String(user.id),
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials: creds.map(c => ({ id: base64url.toBuffer(c.credential_id), type: 'public-key' })),
      authenticatorSelection: { userVerification: 'preferred' },
    });
    userChallenges[user.id] = options.challenge;
    res.json(options);
  });
});

// Registration Complete
app.post('/api/passkey/register/complete', ensureAuth, async (req, res) => {
  const user = req.user;
  const expectedChallenge = userChallenges[user.id];
  if (!expectedChallenge) return res.status(400).json({ error: 'No registration in progress' });
  try {
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
    if (!verification.verified) return res.status(400).json({ error: 'Registration failed' });
    const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp, credentialDeviceType: deviceType, credentialBackedUp: backedUp, } = verification.registrationInfo;
    db.run(
      'INSERT INTO passkeys (user_id, credential_id, public_key, counter, device_type, backed_up, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user.id, base64url.encode(credentialID), credentialPublicKey.toString('base64'), counter, deviceType, backedUp ? 1 : 0, new Date().toISOString()],
      (err) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        delete userChallenges[user.id];
        res.json({ verified: true, message: 'Passkey registered successfully' });
      }
    );
  } catch (e) {
    res.status(400).json({ error: 'Registration error', details: e.message });
  }
});

// Authentication Begin
app.post('/api/passkey/authenticate/begin', ensureAuth, (req, res) => {
  const user = req.user;
  db.all('SELECT credential_id FROM passkeys WHERE user_id=?', [user.id], (err, creds) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const options = generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials: creds.map(c => ({ id: base64url.toBuffer(c.credential_id), type: 'public-key' })),
    });
    userChallenges[user.id] = options.challenge;
    res.json(options);
  });
});

// Authentication Complete
app.post('/api/passkey/authenticate/complete', ensureAuth, async (req, res) => {
  const user = req.user;
  const expectedChallenge = userChallenges[user.id];
  if (!expectedChallenge) return res.status(400).json({ error: 'No authentication in progress' });
  db.get('SELECT * FROM passkeys WHERE user_id=? AND credential_id=?', [user.id, req.body.id], async (err, cred) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!cred) return res.status(404).json({ error: 'Credential not found' });
    try {
      const verification = await verifyAuthenticationResponse({
        response: req.body,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: {
          credentialID: base64url.toBuffer(cred.credential_id),
          credentialPublicKey: Buffer.from(cred.public_key, 'base64'),
          counter: cred.counter,
        },
      });
      if (!verification.verified) return res.status(400).json({ error: 'Authentication failed' });
      db.run('UPDATE passkeys SET counter=?, last_used=? WHERE id=?', [verification.authenticationInfo.newCounter, new Date().toISOString(), cred.id]);
      delete userChallenges[user.id];
      // Issue JWT or session here as needed
      res.json({ verified: true, token: sign({ id: user.id, name: user.name, email: user.email }), user: { id: user.id, name: user.name, email: user.email } });
    } catch (e) {
      res.status(400).json({ error: 'Authentication error', details: e.message });
    }
  });
});

// --- END MISSING ENDPOINTS ---

// --- ADDITIONAL MISSING ENDPOINTS FOR FULL UI COMPATIBILITY ---

// /api/me
app.get('/api/me', ensureAuth, (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
  res.json(req.user);
});

// /api/users
app.get('/api/users', ensureAuth, (req, res) => {
  db.all('SELECT id, name, email, disabled, last_login FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows || []);
  });
});
app.post('/api/users', ensureAuth, (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hash = bcrypt.hashSync(password, 12);
  db.run('INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)', [name, email, hash], function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ id: this.lastID, name, email });
  });
});
app.get('/api/users/:id', ensureAuth, (req, res) => {
  db.get('SELECT id, name, email, disabled, last_login FROM users WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
});
app.put('/api/users/:id', ensureAuth, (req, res) => {
  const { name, email, password, disabled } = req.body;
  const fields = [];
  const values = [];
  if (name !== undefined) { fields.push('name=?'); values.push(name); }
  if (email !== undefined) { fields.push('email=?'); values.push(email); }
  if (password !== undefined) { fields.push('passwordHash=?'); values.push(bcrypt.hashSync(password, 12)); }
  if (disabled !== undefined) { fields.push('disabled=?'); values.push(disabled ? 1 : 0); }
  if (!fields.length) return res.status(400).json({ error: 'No valid fields' });
  values.push(req.params.id);
  db.run(`UPDATE users SET ${fields.join(', ')} WHERE id=?`, values, function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ message: 'updated' });
  });
});
app.delete('/api/users/:id', ensureAuth, (req, res) => {
  db.run('DELETE FROM users WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ message: 'deleted' });
  });
});


// --- END ADDITIONAL MISSING ENDPOINTS ---

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
app.use('/api/v1/integrations', integrationsRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/configuration', configurationRouter);
app.use('/api/v1', serverRouter); // Handles /api/v1/server-info

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 CueIT API Server running on port ${PORT}`);
    console.log(`📊 Admin interface: http://localhost:${PORT}/admin`);
    console.log(`🔧 Server info endpoint: http://localhost:${PORT}/api/server-info`);
  });
}

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

export default app;
