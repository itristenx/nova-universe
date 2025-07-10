import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';
import events from './events.js';
import * as directory from './directory.js';
import { sign, verify } from './jwt.js';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import qrcode from 'qrcode';
import multer from 'multer';
import path from 'path';
import { securityHeaders, securityLogger, requestLogger } from './middleware/security.js';
import { validateInput } from './middleware/validation.js';
import assetsRouter from './routes/assets.js';
import integrationsRouter from './routes/integrations.js';
import rolesRouter from './routes/roles.js';
import { validateKioskRegistration, validateTicketSubmission, validateEmail, validateActivationCode } from './middleware/validation.js';
import { authRateLimit, apiRateLimit, kioskRateLimit } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();

// Configure CORS origins
const originList = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : null;
if (process.env.DEBUG_CORS === 'true') {
  console.log('🔧 CORS Debug - originList:', originList);
}

// Apply security middleware
app.use(securityHeaders);
app.use(requestLogger);

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

const RATE_WINDOW = Number(process.env.RATE_LIMIT_WINDOW || 60_000);
const SUBMIT_TICKET_LIMIT = Number(process.env.SUBMIT_TICKET_LIMIT || 10);
const API_LOGIN_LIMIT = Number(process.env.API_LOGIN_LIMIT || 5);
const AUTH_LIMIT = Number(process.env.AUTH_LIMIT || 5);

const ticketLimiter = rateLimit({ windowMs: RATE_WINDOW, max: SUBMIT_TICKET_LIMIT });
const apiLoginLimiter = rateLimit({ windowMs: RATE_WINDOW, max: API_LOGIN_LIMIT });
const authLimiter = rateLimit({ windowMs: RATE_WINDOW, max: AUTH_LIMIT });

if (process.env.DISABLE_AUTH === 'true' && process.env.NODE_ENV === 'production') {
  console.error('DISABLE_AUTH cannot be true when NODE_ENV is production');
  process.exit(1);
}

const DISABLE_AUTH = process.env.DISABLE_AUTH === 'true' ||
  process.env.NODE_ENV === 'test';
const SCIM_TOKEN = process.env.SCIM_TOKEN || '';
const KIOSK_TOKEN = process.env.KIOSK_TOKEN || '';
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

if (!DISABLE_AUTH && !process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET environment variable is required');
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
        console.error('Failed to purge old logs:', err.message);
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
      .catch((err) => console.error('Slack webhook failed:', err.message));
  });

  events.on('kiosk-deleted', (data) => {
    const text = data.all ? 'All kiosks deleted' : `Kiosk ${data.id} deleted`;
    axios
      .post(SLACK_URL, { text })
      .catch((err) => console.error('Slack webhook failed:', err.message));
  });

  events.on('mail-error', (err) => {
    axios
      .post(SLACK_URL, { text: `Email send failed: ${err.message}` })
      .catch((err2) => console.error('Slack webhook failed:', err2.message));
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
            if (e) return res.status(500).json({ error: 'DB error' });
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
              return res.status(401).json({ error: 'unauthenticated' });
            }
            finalize(row);
          }
        );
      } else {
        res.status(401).json({ error: 'unauthenticated' });
      }
    };

const requirePermission = (perm) =>
  DISABLE_AUTH
    ? (req, res, next) => next()
    : (req, res, next) => {
        const perms = req.user?.permissions || [];
        if (perms.includes(perm)) return next();
        res.status(403).json({ error: 'forbidden' });
      };

const ensureScimAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!SCIM_TOKEN || token !== SCIM_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
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

app.post("/submit-ticket", ticketLimiter, validateTicketSubmission, async (req, res) => {
  const { name, email, title, system, urgency, description } = req.body;

  if (!name || !email || !title || !system || !urgency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const ticketId = uuidv4().split("-")[0];
  const timestamp = new Date().toISOString();

  const SN_INSTANCE = process.env.SERVICENOW_INSTANCE;
  const SN_USER = process.env.SERVICENOW_USER;
  const SN_PASS = process.env.SERVICENOW_PASS;
  let serviceNowId = '';
  if (SN_INSTANCE && SN_USER && SN_PASS) {
    try {
      const resp = await axios.post(
        `${SN_INSTANCE}/api/now/table/incident`,
        {
          short_description: title,
          urgency,
          description: `Name: ${name}\nEmail: ${email}\nSystem: ${system}\n\n${description || ''}`,
        },
        {
          auth: { username: SN_USER, password: SN_PASS },
        }
      );
      serviceNowId = resp.data?.result?.sys_id || '';
    } catch (err) {
      console.error('❌ ServiceNow request failed:', err.message);
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

  const HS_KEY = process.env.HELPSCOUT_API_KEY || '';
  const HS_MAILBOX = process.env.HELPSCOUT_MAILBOX_ID || '';
  const HS_FALLBACK = process.env.HELPSCOUT_SMTP_FALLBACK === 'true';

  const sendViaHelpScout = !!HS_KEY;
  const sendViaSmtp = !sendViaHelpScout || HS_FALLBACK;

  let emailStatus = "success";
  try {
    if (sendViaHelpScout) {
      await axios.post(
        "https://api.helpscout.net/v2/conversations",
        {
          type: "email",
          subject: mailOptions.subject,
          mailboxId: Number(HS_MAILBOX),
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
          headers: { Authorization: `Bearer ${HS_KEY}` },
        }
      );
    }
    if (sendViaSmtp) {
      await transporter.sendMail(mailOptions);
    }
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
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
      console.error('❌ Failed to fetch logs:', err.message);
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

app.get('/api/directory-config', ensureAuth, (req, res) => {
  db.all(
    "SELECT key, value FROM config WHERE key LIKE 'directory%'",
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      const out = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      res.json(out);
    }
  );
});

app.put('/api/directory-config', ensureAuth, (req, res) => {
  const updates = req.body;
  const stmt = db.prepare(
    `INSERT INTO config (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`
  );
  db.serialize(() => {
    for (const [k, v] of Object.entries(updates)) {
      stmt.run(k, String(v));
    }
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'updated' });
    });
  });
});

// SSO Configuration endpoint
app.get('/api/sso-config', ensureAuth, (req, res) => {
  // Check database first, fall back to environment variables
  db.get('SELECT enabled, provider, configuration FROM sso_configurations WHERE id = 1', (err, row) => {
    if (err) {
      console.error('Error fetching SSO config:', err);
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
        console.error('Error parsing SSO configuration:', e);
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
      console.error('Error fetching SCIM config:', err);
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
      console.error('Error checking SSO config:', err);
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
        console.error('Error parsing SSO configuration:', e);
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
    console.error('SMTP test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'SMTP test failed', 
      details: error.message 
    });
  }
});

app.post('/api/feedback', (req, res) => {
  const { name = '', message } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });
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
  const hash = bcrypt.hashSync(password, 10);
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

app.post('/api/login', apiLoginLimiter, authRateLimit, (req, res) => {
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
    api: 'CueIT API v2.0',
    version: 'CueIT API v2.0',
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
    version: 'CueIT API v2.0',
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Public endpoint for kiosk initial setup
app.get('/api/server-info', (req, res) => {
  db.all(`SELECT key, value FROM config WHERE key IN ('organizationName', 'logoUrl', 'minPinLength', 'maxPinLength')`, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    const config = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json({
      organizationName: config.organizationName || 'Your Organization',
      logoUrl: config.logoUrl || '/logo.png',
      minPinLength: parseInt(config.minPinLength || '4'),
      maxPinLength: parseInt(config.maxPinLength || '8'),
      serverVersion: 'CueIT API v2.0'
    });
  });
});

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
    return res.status(400).json({ error: 'Missing kioskId or activationCode' });
  }
  
  // Validate activation code format
  if (!validateActivationCode(activationCode)) {
    return res.status(400).json({ error: 'Invalid activation code format' });
  }
  
  // Check if the activation code is valid (for demo purposes, accept any 6-8 character code)
  // In production, you would check against a database of valid codes
  const normalizedCode = activationCode.toUpperCase();
  
  // For now, accept any properly formatted activation code
  if (normalizedCode.length >= 6 && normalizedCode.length <= 8) {
    // Check if kiosk exists
    db.get('SELECT * FROM kiosks WHERE id=?', [kioskId], (err, kiosk) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!kiosk) return res.status(404).json({ error: 'Kiosk not found' });
      
      // Activate the kiosk
      db.run(
        `UPDATE kiosks SET active=1 WHERE id=?`,
        [kioskId],
        (err) => {
          if (err) return res.status(500).json({ error: 'Failed to activate kiosk' });
          
          res.json({
            message: 'Kiosk activated successfully',
            kioskId: kioskId,
            active: true
          });
        }
      );
    });
  } else {
    res.status(400).json({ error: 'Invalid activation code' });
  }
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
app.listen(PORT, () => {
  console.log(`🚀 CueIT API Server running on port ${PORT}`);
  console.log(`📊 Admin interface: http://localhost:${PORT}/admin`);
  console.log(`🔧 Server info endpoint: http://localhost:${PORT}/api/server-info`);
});
