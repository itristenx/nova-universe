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

// Apply security middleware
app.use(securityHeaders);
app.use(requestLogger);
app.use(cors(originList ? { origin: originList } : undefined));
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
        meetingMessage: config.statusMeetingMsg || 'In a Meeting',
        brbMessage: config.statusBrbMsg || 'Be Right Back',
        lunchMessage: config.statusLunchMsg || 'Out to Lunch'
      };
      
      res.json(response);
    }
  );
});

app.put('/api/status-config', ensureAuth, (req, res) => {
  const { enabled, currentStatus, openMessage, closedMessage, errorMessage, meetingMessage, brbMessage, lunchMessage } = req.body;
  
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
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cors: req.headers.origin || 'no-origin',
    api: 'CueIT API v2.0'
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
  
  // Allow access with valid kiosk token or admin auth
  const isKioskAuth = payload && payload.type === 'kiosk' && payload.kioskId === kioskId;
  const isAdminAuth = req.user || (payload && payload.type !== 'kiosk');
  
  if (!isKioskAuth && !isAdminAuth && !DISABLE_AUTH) {
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
    res.json(rows);
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

app.get('/api/kiosks/:id/status', (req, res) => {
  const { id } = req.params;
  db.get(
    `SELECT statusEnabled, currentStatus, openMsg, closedMsg, errorMsg, schedule FROM kiosks WHERE id=?`,
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(row || {});
    }
  );
});

app.put('/api/kiosks/:id/status', ensureAuth, (req, res) => {
  const { id } = req.params;
  const { statusEnabled, currentStatus, openMsg, closedMsg, errorMsg, schedule } = req.body;
  const sched = schedule === undefined ? null : typeof schedule === 'object' ? JSON.stringify(schedule) : String(schedule);
  db.run(
    `UPDATE kiosks SET
      statusEnabled=COALESCE(?, statusEnabled),
      currentStatus=COALESCE(?, currentStatus),
      openMsg=COALESCE(?, openMsg),
      closedMsg=COALESCE(?, closedMsg),
      errorMsg=COALESCE(?, errorMsg),
      schedule=COALESCE(?, schedule)
     WHERE id=?`,
    [
      statusEnabled !== undefined ? (statusEnabled ? 1 : 0) : null,
      currentStatus,
      openMsg,
      closedMsg,
      errorMsg,
      sched,
      id,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      events.emit('kiosk-status-updated', { id });
      res.json({ message: 'updated' });
    }
  );
});

app.get('/api/kiosks/:id/users', async (req, res) => {
  try {
    const users = await directory.searchDirectory(String(req.query.q || ''));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'lookup-failed' });
  }
});

app.post('/api/kiosks/:id/users', async (req, res) => {
  // NOTE: This creates a LOCAL user in CueIT database based on directory lookup
  // Directory integration is read-only - we never modify external directory data
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'missing fields' });
  try {
    const id = await directory.createUser(name, email);
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: 'create-failed' });
  }
});

// Kiosk systems configuration
app.get('/api/kiosks/systems', ensureAuth, (req, res) => {
  db.get('SELECT value FROM config WHERE key = ?', ['kioskSystems'], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const systems = row ? JSON.parse(row.value || '[]') : [];
    res.json({ systems });
  });
});

app.put('/api/kiosks/systems', ensureAuth, (req, res) => {
  const { systems } = req.body;
  if (!Array.isArray(systems)) {
    return res.status(400).json({ error: 'Systems must be an array' });
  }
  
  db.run(
    'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    ['kioskSystems', JSON.stringify(systems)],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Systems updated successfully' });
    }
  );
});

app.get(
  "/api/users",
  ensureAuth,
  requirePermission('manage_users'),
  (req, res) => {
    db.all(`
      SELECT u.id, u.name, u.email, u.disabled, u.is_default,
             r.name as role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
    `, (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    });
  }
);

app.post(
  '/api/users',
  ensureAuth,
  requirePermission('manage_users'),
  (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const hash = password ? bcrypt.hashSync(password, 10) : null;
    db.run(
      `INSERT INTO users (name, email, passwordHash, disabled, is_default) VALUES (?, ?, ?, 0, 0)`,
      [name, email, hash],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'User with this email already exists' });
          }
          return res.status(500).json({ error: 'DB error' });
        }
        res.json({ id: this.lastID });
      }
    );
  }
);

app.put(
  '/api/users/:id',
  ensureAuth,
  requirePermission('manage_users'),
  (req, res) => {
    const { id } = req.params;
    const { name, email, password, disabled } = req.body;
    
    // Check if this is a default user
    db.get('SELECT is_default FROM users WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!row) return res.status(404).json({ error: 'User not found' });
      
      // Prevent disabling default users
      if (row.is_default && disabled) {
        return res.status(403).json({ error: 'Cannot disable default admin users' });
      }
      
      const hash = password ? bcrypt.hashSync(password, 10) : null;
      const fields = [];
      const values = [];
      
      if (name !== undefined) { fields.push('name=?'); values.push(name); }
      if (email !== undefined) { fields.push('email=?'); values.push(email); }
      if (hash) { fields.push('passwordHash=?'); values.push(hash); }
      if (disabled !== undefined && !row.is_default) { fields.push('disabled=?'); values.push(disabled ? 1 : 0); }
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      values.push(id);
      
      db.run(
        `UPDATE users SET ${fields.join(', ')} WHERE id=?`,
        values,
        (err) => {
          if (err) return res.status(500).json({ error: 'DB error' });
          res.json({ message: 'updated' });
        }
      );
    });
  }
);

app.delete(
  "/api/users/:id",
  ensureAuth,
  requirePermission('manage_users'),
  (req, res) => {
    const { id } = req.params;
    
    // Check if this is a default user
    db.get('SELECT is_default, email FROM users WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      if (!row) return res.status(404).json({ error: 'User not found' });
      
      // Prevent deletion of default users
      if (row.is_default) {
        return res.status(403).json({ 
          error: 'Cannot delete default admin users. Use disable instead.',
          canDisable: false
        });
      }
      
      // Delete the user and their role assignments
      db.serialize(() => {
        db.run('DELETE FROM user_roles WHERE user_id = ?', [id]);
        db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
          if (err) return res.status(500).json({ error: 'DB error' });
          res.json({ message: 'deleted' });
        });
      });
    });
  }
);

app.get(
  '/api/users/:id/roles',
  ensureAuth,
  requirePermission('manage_users'),
  (req, res) => {
    db.get(
      `SELECT r.name FROM roles r JOIN user_roles ur ON r.id=ur.role_id WHERE ur.user_id=? LIMIT 1`,
      [req.params.id],
      (err, row) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ role: row ? row.name : null });
      }
    );
  }
);

app.put(
  '/api/users/:id/roles',
  ensureAuth,
  requirePermission('manage_users'),
  (req, res) => {
    const { role } = req.body; // Changed from 'roles' array to single 'role'
    if (!role || typeof role !== 'string') {
      return res.status(400).json({ error: 'Single role required' });
    }
    const { id } = req.params;
    
    db.serialize(() => {
      // Clear existing roles
      db.run('DELETE FROM user_roles WHERE user_id=?', [id]);
      
      // Assign the single new role
      db.run(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name=?))',
        [id, role],
        function(err) {
          if (err) return res.status(500).json({ error: 'DB error' });
          if (this.changes === 0) {
            return res.status(400).json({ error: 'Invalid role name' });
          }
          res.json({ message: 'updated' });
        }
      );
    });
  }
);

app.get(
  '/api/roles',
  ensureAuth,
  requirePermission('manage_roles'),
  (req, res) => {
    db.all('SELECT * FROM roles', (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows);
    });
  }
);

app.post(
  '/api/roles',
  ensureAuth,
  requirePermission('manage_roles'),
  (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'missing name' });
    db.run('INSERT INTO roles (name) VALUES (?)', [name], function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ id: this.lastID });
    });
  }
);

app.put(
  '/api/roles/:id/permissions',
  ensureAuth,
  requirePermission('manage_roles'),
  (req, res) => {
    const { id } = req.params;
    const { permissions } = req.body;
    if (!Array.isArray(permissions))
      return res.status(400).json({ error: 'bad permissions' });
    db.serialize(() => {
      db.run('DELETE FROM role_permissions WHERE role_id=?', [id]);
      const stmt = db.prepare(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, (SELECT id FROM permissions WHERE name=?))'
      );
      for (const p of permissions) stmt.run(id, p);
      stmt.finalize((err) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ message: 'updated' });
      });
    });
  }
);

app.get(
  '/api/directory-search',
  ensureAuth,
  requirePermission('manage_users'),
  async (req, res) => {
    try {
      const users = await directory.searchDirectory(String(req.query.q || ''));
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'lookup-failed' });
    }
  }
);

// SCIM 2.0 user management
const scim = express.Router();
scim.use(express.json());
scim.use(ensureScimAuth);

function formatUser(row) {
  return { id: String(row.id), userName: row.email, displayName: row.name };
}

scim.get('/Users', (req, res) => {
  let sql = 'SELECT * FROM users';
  const params = [];
  if (req.query.filter) {
    const m = req.query.filter.match(/userName eq \"([^\"]+)\"/);
    if (m) {
      sql += ' WHERE email=?';
      params.push(m[1]);
    }
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ Resources: rows.map(formatUser), totalResults: rows.length });
  });
});

scim.get('/Users/:id', (req, res) => {
  db.get('SELECT * FROM users WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(formatUser(row));
  });
});

scim.post('/Users', (req, res) => {
  const name = req.body.displayName || '';
  const email = req.body.userName || '';
  const groups = req.body.groups || [];
  
  db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      const userId = this.lastID;
      
      // Map SCIM groups to roles (assign only the first/highest priority role)
      if (groups.length > 0) {
        const roleNames = groups.map(g => g.value || g.display).filter(Boolean);
        
        // Determine the highest priority role
        let mappedRole = null;
        for (const roleName of roleNames) {
          let role = roleName.toLowerCase();
          if (role === 'superadmin' || role === 'superadministrator') {
            mappedRole = 'superadmin';
            break; // Superadmin is highest priority
          } else if (role === 'administrator' || role === 'administrators') {
            mappedRole = 'admin';
          } else if (!mappedRole && (role === 'users' || role === 'employees' || role === 'user')) {
            mappedRole = 'user';
          }
        }
        
        if (mappedRole) {
          db.run(
            'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name=?))',
            [userId, mappedRole],
            () => {
              console.log(`🔗 SCIM: Assigned role '${mappedRole}' to user ${email}`);
            }
          );
        }
      }
      
      res.status(201).json(formatUser({ id: userId, name, email }));
    }
  );
});

scim.put('/Users/:id', (req, res) => {
  const { id } = req.params;
  const name = req.body.displayName;
  const email = req.body.userName;
  db.run(
    'UPDATE users SET name=?, email=? WHERE id=?',
    [name, email, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      db.get('SELECT * FROM users WHERE id=?', [id], (err2, row) => {
        if (err2) return res.status(500).json({ error: 'DB error' });
        res.json(formatUser(row));
      });
    }
  );
});

scim.delete('/Users/:id', (req, res) => {
  const { id } = req.params;
  
  // Check if this is a default/admin user before deletion
  db.get('SELECT is_default, email FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'User not found' });
    
    // Prevent deletion of default admin users via SCIM
    if (row.is_default) {
      console.log(`🛡️  SCIM: Prevented deletion of default admin user: ${row.email}`);
      return res.status(403).json({ 
        error: 'Cannot delete default admin users via SCIM',
        detail: 'Default admin users cannot be removed through directory synchronization'
      });
    }
    
    // Remove user and their role assignments
    db.serialize(() => {
      db.run('DELETE FROM user_roles WHERE user_id = ?', [id]);
      db.run('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        console.log(`🗑️  SCIM: Removed user ID ${id} (${row.email}) from directory sync`);
        res.status(204).end();
      });
    });
  });
});

// SSO Configuration save endpoint
app.put('/api/sso-config', ensureAuth, (req, res) => {
  const { enabled, provider, configuration } = req.body;
  
  try {
    // Save to database instead of environment variables
    db.run(
      'INSERT OR REPLACE INTO sso_configurations (id, provider, enabled, configuration, updated_at) VALUES (1, ?, ?, ?, datetime("now"))',
      [provider || 'saml', enabled ? 1 : 0, JSON.stringify(configuration || {})],
      function(err) {
        if (err) {
          console.error('Error saving SSO config:', err);
          return res.status(500).json({ error: 'Failed to save SSO configuration' });
        }
        
        // Update config table for quick access
        db.run('INSERT OR REPLACE INTO config (key, value) VALUES ("sso_enabled", ?)', [enabled ? '1' : '0']);
        
        res.json({ message: 'SSO configuration saved successfully' });
      }
    );
  } catch (error) {
    console.error('Error processing SSO config:', error);
    res.status(500).json({ error: 'Failed to process SSO configuration' });
  }
});

// SCIM Configuration save endpoint
app.put('/api/scim-config', ensureAuth, (req, res) => {
  const { enabled, bearerToken, endpointUrl, autoProvisioning, autoDeprovisioning, syncInterval } = req.body;
  
  try {
    db.run(
      `INSERT OR REPLACE INTO scim_configurations (id, enabled, bearer_token, endpoint_url, auto_provisioning, auto_deprovisioning, sync_interval, updated_at) 
       VALUES (1, ?, ?, ?, ?, ?, ?, datetime("now"))`,
      [
        enabled ? 1 : 0, 
        bearerToken || '', 
        endpointUrl || '/scim/v2',
        autoProvisioning ? 1 : 0,
        autoDeprovisioning ? 1 : 0,
        syncInterval || 3600
      ],
      function(err) {
        if (err) {
          console.error('Error saving SCIM config:', err);
          return res.status(500).json({ error: 'Failed to save SCIM configuration' });
        }
        
        // Update config table for quick access
        db.run('INSERT OR REPLACE INTO config (key, value) VALUES ("scim_enabled", ?)', [enabled ? '1' : '0']);
        
        res.json({ message: 'SCIM configuration saved successfully' });
      }
    );
  } catch (error) {
    console.error('Error processing SCIM config:', error);
    res.status(500).json({ error: 'Failed to process SCIM configuration' });
  }
});

// Passkey Registration endpoints
app.post('/api/passkey/register/begin', ensureAuth, async (req, res) => {
  try {
    const user = req.user;
    const { rpName, rpId, userName, userDisplayName } = req.body;
    
    // Generate challenge for registration
    const challenge = Buffer.from(crypto.randomBytes(32)).toString('base64url');
    
    // Store challenge in session/cache (simplified for demo)
    const registrationOptions = {
      challenge,
      rp: {
        name: rpName || 'CueIT Portal',
        id: rpId || 'localhost'
      },
      user: {
        id: Buffer.from(user.id.toString()).toString('base64url'),
        name: userName || user.email,
        displayName: userDisplayName || user.name
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' } // RS256
      ],
      timeout: 60000,
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
        residentKey: 'preferred'
      },
      excludeCredentials: []
    };
    
    // Get existing credentials to exclude
    db.all('SELECT credential_id FROM webauthn_credentials WHERE user_id = ?', [user.id], (err, rows) => {
      if (!err && rows.length > 0) {
        registrationOptions.excludeCredentials = rows.map(row => ({
          id: row.credential_id,
          type: 'public-key',
          transports: ['internal']
        }));
      }
      
      // Store challenge temporarily (in production, use proper session storage)
      db.run('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)', 
        [`passkey_challenge_${user.id}`, JSON.stringify({ challenge, timestamp: Date.now() })]);
      
      res.json(registrationOptions);
    });
  } catch (error) {
    console.error('Error beginning passkey registration:', error);
    res.status(500).json({ error: 'Failed to begin passkey registration' });
  }
});

app.post('/api/passkey/register/complete', ensureAuth, async (req, res) => {
  try {
    const user = req.user;
    const { credential, credentialName } = req.body;
    
    // Retrieve stored challenge
    db.get('SELECT value FROM config WHERE key = ?', [`passkey_challenge_${user.id}`], (err, row) => {
      if (err || !row) {
        return res.status(400).json({ error: 'Invalid or expired challenge' });
      }
      
      try {
        const { challenge, timestamp } = JSON.parse(row.value);
        
        // Check challenge age (5 minutes max)
        if (Date.now() - timestamp > 300000) {
          return res.status(400).json({ error: 'Challenge expired' });
        }
        
        // Verify the credential (simplified - in production use a proper WebAuthn library)
        const credentialId = credential.id;
        const publicKey = credential.response.publicKey;
        
        // Store the credential
        db.run(
          `INSERT INTO webauthn_credentials 
           (id, user_id, credential_id, credential_public_key, name, transports, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, datetime("now"))`,
          [
            crypto.randomUUID(),
            user.id,
            credentialId,
            publicKey,
            credentialName || 'Passkey',
            JSON.stringify(['internal'])
          ],
          function(err) {
            if (err) {
              console.error('Error storing passkey:', err);
              return res.status(500).json({ error: 'Failed to store passkey' });
            }
            
            // Clean up challenge
            db.run('DELETE FROM config WHERE key = ?', [`passkey_challenge_${user.id}`]);
            
            res.json({ 
              verified: true, 
              credentialId: credentialId,
              message: 'Passkey registered successfully' 
            });
          }
        );
      } catch (parseError) {
        console.error('Error parsing challenge:', parseError);
        res.status(400).json({ error: 'Invalid challenge data' });
      }
    });
  } catch (error) {
    console.error('Error completing passkey registration:', error);
    res.status(500).json({ error: 'Failed to complete passkey registration' });
  }
});

// Passkey Authentication endpoints
app.post('/api/passkey/authenticate/begin', async (req, res) => {
  try {
    const challenge = Buffer.from(crypto.randomBytes(32)).toString('base64url');
    
    // Get all credentials for challenge generation
    db.all('SELECT DISTINCT credential_id FROM webauthn_credentials', (err, rows) => {
      const allowCredentials = rows ? rows.map(row => ({
        id: row.credential_id,
        type: 'public-key',
        transports: ['internal']
      })) : [];
      
      const authenticationOptions = {
        challenge,
        timeout: 60000,
        rpId: 'localhost',
        allowCredentials,
        userVerification: 'preferred'
      };
      
      // Store challenge temporarily
      const challengeKey = `passkey_auth_challenge_${Date.now()}`;
      db.run('INSERT INTO config (key, value) VALUES (?, ?)', 
        [challengeKey, JSON.stringify({ challenge, timestamp: Date.now() })]);
      
      res.json({ ...authenticationOptions, challengeKey });
    });
  } catch (error) {
    console.error('Error beginning passkey authentication:', error);
    res.status(500).json({ error: 'Failed to begin passkey authentication' });
  }
});

app.post('/api/passkey/authenticate/complete', async (req, res) => {
  try {
    const { credential, challengeKey } = req.body;
    
    // Retrieve stored challenge
    db.get('SELECT value FROM config WHERE key = ?', [challengeKey], (err, row) => {
      if (err || !row) {
        return res.status(400).json({ error: 'Invalid or expired challenge' });
      }
      
      try {
        const { challenge, timestamp } = JSON.parse(row.value);
        
        // Check challenge age (5 minutes max)
        if (Date.now() - timestamp > 300000) {
          return res.status(400).json({ error: 'Challenge expired' });
        }
        
        // Find the credential and associated user
        db.get(
          `SELECT wc.*, u.id as user_id, u.name, u.email 
           FROM webauthn_credentials wc 
           JOIN users u ON wc.user_id = u.id 
           WHERE wc.credential_id = ? AND u.disabled = 0`,
          [credential.id],
          (err, credentialRow) => {
            if (err || !credentialRow) {
              return res.status(401).json({ error: 'Invalid credential' });
            }
            
            // Update last used timestamp and counter
            db.run(
              'UPDATE webauthn_credentials SET last_used = datetime("now"), counter = counter + 1 WHERE credential_id = ?',
              [credential.id]
            );
            
            // Update user last login
            db.run('UPDATE users SET last_login = datetime("now") WHERE id = ?', [credentialRow.user_id]);
            
            // Generate JWT token
            const payload = {
              id: credentialRow.user_id,
              email: credentialRow.email,
              name: credentialRow.name,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
              method: 'passkey'
            };
            
            const token = jwt.sign(payload, JWT_SECRET);
            
            // Clean up challenge
            db.run('DELETE FROM config WHERE key = ?', [challengeKey]);
            
            res.json({ 
              verified: true, 
              token,
              user: {
                id: credentialRow.user_id,
                name: credentialRow.name,
                email: credentialRow.email
              }
            });
          }
        );
      } catch (parseError) {
        console.error('Error parsing challenge:', parseError);
        res.status(400).json({ error: 'Invalid challenge data' });
      }
    });
  } catch (error) {
    console.error('Error completing passkey authentication:', error);
    res.status(500).json({ error: 'Failed to complete passkey authentication' });
  }
});

// List user's passkeys
app.get('/api/passkeys', ensureAuth, (req, res) => {
  db.all(
    `SELECT id, name, created_at, last_used, credential_device_type 
     FROM webauthn_credentials 
     WHERE user_id = ? 
     ORDER BY created_at DESC`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error('Error fetching passkeys:', err);
        return res.status(500).json({ error: 'Failed to fetch passkeys' });
      }
      res.json(rows || []);
    }
  );
});

// Delete a passkey
app.delete('/api/passkeys/:id', ensureAuth, (req, res) => {
  const { id } = req.params;
  
  db.run(
    'DELETE FROM webauthn_credentials WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        console.error('Error deleting passkey:', err);
        return res.status(500).json({ error: 'Failed to delete passkey' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Passkey not found' });
      }
      
      res.json({ message: 'Passkey deleted successfully' });
    }
  );
});

app.get('/api/me', ensureAuth, (req, res) => {
  res.json(req.user || {});
});

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();
  const send = (ev, data) => {
    res.write(`event: ${ev}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  const names = [
    'kiosk-registered',
    'kiosk-deleted',
    'kiosk-status-updated',
    'status-config-updated',
    'notifications-updated'
  ];
  const handlers = {};
  for (const n of names) {
    handlers[n] = (d) => send(n, d);
    events.on(n, handlers[n]);
  }
  req.on('close', () => {
    for (const n of names) events.off(n, handlers[n]);
  });
});

app.get('/api/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();
  const send = () => {
    db.all(
      `SELECT * FROM notifications WHERE active=1 ORDER BY created_at DESC`,
      (err, rows) => {
        if (err) return;
        res.write(`data: ${JSON.stringify(rows)}\n\n`);
      }
    );
  };
  const handler = () => send();
  events.on('notifications-updated', handler);
  req.on('close', () => events.off('notifications-updated', handler));
  send();
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Public auth status endpoint (doesn't require authentication)
app.get("/api/auth/status", (req, res) => {
  res.json({ 
    authRequired: !DISABLE_AUTH,
    authDisabled: DISABLE_AUTH 
  });
});

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  if (CERT_PATH && KEY_PATH) {
    const options = {
      cert: fs.readFileSync(CERT_PATH),
      key: fs.readFileSync(KEY_PATH),
    };
    https.createServer(options, app).listen(PORT, () => {
      console.log(`✅ CueIT API running at https://localhost:${PORT}`);
      console.log(`🔑 Admin login: ${process.env.ADMIN_EMAIL || 'admin@example.com'} / ${process.env.ADMIN_PASSWORD || 'admin'}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`✅ CueIT API running at http://localhost:${PORT}`);
      console.log(`🔑 Admin login: ${process.env.ADMIN_EMAIL || 'admin@example.com'} / ${process.env.ADMIN_PASSWORD || 'admin'}`);
    });
  }
}

// Security settings endpoint
app.get('/api/security-settings', ensureAuth, (req, res) => {
  db.all(
    "SELECT key, value FROM config WHERE key LIKE 'security_%' OR key LIKE 'session_%' OR key LIKE 'password_%'",
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
      
      // Add current settings with defaults
      const securitySettings = {
        passwordMinLength: settings.password_min_length || '8',
        passwordRequireSymbols: settings.password_require_symbols === 'true',
        passwordRequireNumbers: settings.password_require_numbers === 'true',
        passwordRequireUppercase: settings.password_require_uppercase === 'true',
        sessionTimeout: settings.session_timeout || '24',
        maxLoginAttempts: settings.max_login_attempts || '5',
        lockoutDuration: settings.lockout_duration || '15',
        twoFactorRequired: settings.two_factor_required === 'true',
        auditLogging: settings.audit_logging !== 'false'
      };
      
      res.json(securitySettings);
    }
  );
});

app.put('/api/security-settings', ensureAuth, (req, res) => {
  const settings = req.body;
  
  const stmt = db.prepare(
    'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
  );
  
  db.serialize(() => {
    // Map frontend settings to config keys
    const configMappings = {
      passwordMinLength: 'password_min_length',
      passwordRequireSymbols: 'password_require_symbols',
      passwordRequireNumbers: 'password_require_numbers',
      passwordRequireUppercase: 'password_require_uppercase',
      sessionTimeout: 'session_timeout',
      maxLoginAttempts: 'max_login_attempts',
      lockoutDuration: 'lockout_duration',
      twoFactorRequired: 'two_factor_required',
      auditLogging: 'audit_logging'
    };
    
    for (const [frontendKey, configKey] of Object.entries(configMappings)) {
      if (settings[frontendKey] !== undefined) {
        stmt.run(configKey, String(settings[frontendKey]));
      }
    }
    
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Security settings updated' });
    });
  });
});

// Notification settings endpoint
app.get('/api/notification-settings', ensureAuth, (req, res) => {
  db.all(
    "SELECT key, value FROM config WHERE key LIKE 'notification_%' OR key LIKE 'email_%'",
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
      
      const notificationSettings = {
        emailNotifications: settings.email_notifications !== 'false',
        slackNotifications: settings.slack_notifications === 'true',
        ticketCreatedNotify: settings.notification_ticket_created !== 'false',
        kioskOfflineNotify: settings.notification_kiosk_offline !== 'false',
        systemErrorNotify: settings.notification_system_error !== 'false',
        dailyReports: settings.notification_daily_reports === 'true',
        weeklyReports: settings.notification_weekly_reports === 'true',
        notificationRetention: settings.notification_retention || '30'
      };
      
      res.json(notificationSettings);
    }
  );
});

app.put('/api/notification-settings', ensureAuth, (req, res) => {
  const settings = req.body;
  
  const stmt = db.prepare(
    'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
  );
  
  db.serialize(() => {
    const configMappings = {
      emailNotifications: 'email_notifications',
      slackNotifications: 'slack_notifications',
      ticketCreatedNotify: 'notification_ticket_created',
      kioskOfflineNotify: 'notification_kiosk_offline',
      systemErrorNotify: 'notification_system_error',
      dailyReports: 'notification_daily_reports',
      weeklyReports: 'notification_weekly_reports',
      notificationRetention: 'notification_retention'
    };
    
    for (const [frontendKey, configKey] of Object.entries(configMappings)) {
      if (settings[frontendKey] !== undefined) {
        stmt.run(configKey, String(settings[frontendKey]));
      }
    }
    
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Notification settings updated' });
    });
  });
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', ensureAuth, async (req, res) => {
  try {
    // Get counts from database
    const [
      totalTickets,
      totalKiosks, 
      totalUsers,
      activeKiosks
    ] = await Promise.all([
      new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM logs', (err, row) => {
          resolve(err ? 0 : row.count);
        });
      }),
      new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM kiosks', (err, row) => {
          resolve(err ? 0 : row.count);
        });
      }),
      new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          resolve(err ? 0 : row.count);
        });
      }),
      new Promise((resolve) => {
        db.get('SELECT COUNT(*) as count FROM kiosks WHERE active=1', (err, row) => {
          resolve(err ? 0 : row.count);
        });
      })
    ]);

    // Get recent activity (last 10 logs)
    const recentActivity = await new Promise((resolve) => {
      db.all(
        'SELECT ticket_id, name, timestamp, "ticket_created" as type FROM logs ORDER BY timestamp DESC LIMIT 10',
        (err, rows) => {
          if (err) return resolve([]);
          resolve(rows.map(row => ({
            id: row.ticket_id,
            type: row.type,
            message: `New ticket from ${row.name}`,
            timestamp: row.timestamp
          })));
        }
      );
    });

    const stats = {
      totalTickets,
      openTickets: 0, // Would need status tracking in logs table
      resolvedTickets: totalTickets,
      totalKiosks,
      activeKiosks,
      totalUsers,
      recentActivity
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// Server management endpoints
app.post('/api/server/restart', ensureAuth, requirePermission('manage_system'), (req, res) => {
  console.log('🔄 Server restart requested by admin');
  res.json({ message: 'Server restart initiated' });
  
  // Give the response time to send before restarting
  setTimeout(() => {
    process.exit(0); // Exit gracefully - process manager should restart
  }, 1000);
});

app.get('/api/server/status', ensureAuth, (req, res) => {
  res.json({ 
    status: 'running',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    nodeVersion: process.version
  });
});

// Kiosk systems configuration endpoints
app.get('/api/kiosk-systems', ensureAuth, (req, res) => {
  db.get('SELECT value FROM config WHERE key="systems"', (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const systems = row ? row.value.split(',').map(s => s.trim()).filter(Boolean) : [
      'Desktop', 'Laptop', 'Mobile', 'Network', 'Printer', 'Software', 'Account Access'
    ];
    res.json({ systems });
  });
});

app.put('/api/kiosk-systems', ensureAuth, requirePermission('manage_system'), (req, res) => {
  const { systems } = req.body;
  if (!Array.isArray(systems)) {
    return res.status(400).json({ error: 'Systems must be an array' });
  }
  
  const systemsString = systems.filter(s => s && s.trim()).join(',');
  
  db.run(
    'INSERT INTO config (key, value) VALUES ("systems", ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    [systemsString],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'Systems updated', systems });
    }
  );
});

// Full kiosk configuration endpoint
app.get('/api/kiosk-config/:id', ensureAuth, (req, res) => {
  const { id } = req.params;
  
  // Get kiosk specific config
  db.get('SELECT * FROM kiosks WHERE id=?', [id], (err, kiosk) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    
    // Get global config
    db.all('SELECT key, value FROM config', (err2, configRows) => {
      if (err2) return res.status(500).json({ error: 'DB error' });
      
      const config = Object.fromEntries(configRows.map(r => [r.key, r.value]));
      const systems = config.systems ? config.systems.split(',').map(s => s.trim()) : [
        'Desktop', 'Laptop', 'Mobile', 'Network', 'Printer', 'Software', 'Account Access'
      ];
      
      res.json({
        kiosk: kiosk || { id },
        config: {
          logoUrl: config.logoUrl || '/logo.png',
          faviconUrl: config.faviconUrl || '/vite.svg',
          welcomeMessage: config.welcomeMessage || 'Welcome to the Help Desk',
          helpMessage: config.helpMessage || 'Need to report an issue?',
          statusOpenMsg: config.statusOpenMsg || 'Open',
          statusClosedMsg: config.statusClosedMsg || 'Closed',
          statusErrorMsg: config.statusErrorMsg || 'Service temporarily unavailable',
          systems
        }
      });
    });
  });
});

app.put('/api/kiosk-config/:id', ensureAuth, requirePermission('manage_system'), (req, res) => {
  const { id } = req.params;
  const { 
    logoUrl, bgUrl, active, statusEnabled, currentStatus, 
    openMsg, closedMsg, errorMsg, schedule 
  } = req.body;
  
  const sched = schedule === undefined ? null : 
    typeof schedule === 'object' ? JSON.stringify(schedule) : String(schedule);
  
  db.run(
    `INSERT INTO kiosks (id, logoUrl, bgUrl, active, statusEnabled, currentStatus, openMsg, closedMsg, errorMsg, schedule)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       logoUrl=COALESCE(?, logoUrl),
       bgUrl=COALESCE(?, bgUrl), 
       active=COALESCE(?, active),
       statusEnabled=COALESCE(?, statusEnabled),
       currentStatus=COALESCE(?, currentStatus),
       openMsg=COALESCE(?, openMsg),
       closedMsg=COALESCE(?, closedMsg),
       errorMsg=COALESCE(?, errorMsg),
       schedule=COALESCE(?, schedule)`,
    [
      id, logoUrl, bgUrl, active ? 1 : 0, statusEnabled ? 1 : 0, currentStatus,
      openMsg, closedMsg, errorMsg, sched,
      logoUrl, bgUrl, active !== undefined ? (active ? 1 : 0) : null,
      statusEnabled !== undefined ? (statusEnabled ? 1 : 0) : null, currentStatus,
      openMsg, closedMsg, errorMsg, sched
    ],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      events.emit('kiosk-config-updated', { id });
      res.json({ message: 'Kiosk configuration updated' });
    }
  );
});

// Admin PIN endpoints for kiosk access
app.post('/api/verify-admin-pin', (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'Missing PIN' });

  db.get(`SELECT value FROM config WHERE key='adminPin'`, (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const storedPin = row ? row.value : '123456'; // Default PIN
    const valid = pin === storedPin;
    res.json({ valid });
  });
});

app.put('/api/admin-pin', ensureAuth, (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: 'Missing PIN' });
  if (!/^\d{6}$/.test(pin)) return res.status(400).json({ error: 'PIN must be 6 digits' });
  
  db.run(
    `INSERT INTO config (key, value) VALUES ('adminPin', ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [pin],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'PIN updated' });
    }
  );
});

app.get('/api/admin-pin', ensureAuth, (req, res) => {
  db.get(`SELECT value FROM config WHERE key='adminPin'`, (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const pin = row ? row.value : '123456'; // Default PIN
    res.json({ pin });
  });
});

// Kiosk configuration sync endpoints
app.post('/api/kiosks/:id/sync-config', kioskOrAuth, (req, res) => {
  const { id } = req.params;
  const { configUpdates } = req.body;
  
  if (!configUpdates || !Array.isArray(configUpdates)) {
    return res.status(400).json({ error: 'Invalid config updates' });
  }
  
  // Process configuration updates from kiosk
  const promises = configUpdates.map(update => {
    return new Promise((resolve, reject) => {
      switch (update.type) {
        case 'status':
          const statusData = JSON.parse(update.data);
          db.run(
            `UPDATE kiosks SET
              statusEnabled=?,
              currentStatus=?,
              openMsg=?,
              closedMsg=?,
              errorMsg=?
             WHERE id=?`,
            [
              statusData.statusEnabled ? 1 : 0,
              statusData.currentStatus,
              statusData.openMsg,
              statusData.closedMsg,
              statusData.errorMsg,
              id
            ],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
          break;
        
        case 'schedule':
          const scheduleData = JSON.parse(update.data);
          db.run(
            `UPDATE kiosks SET schedule=? WHERE id=?`,
            [JSON.stringify(scheduleData), id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
          break;
        
        case 'branding':
          const brandingData = JSON.parse(update.data);
          db.run(
            `UPDATE kiosks SET logoUrl=?, bgUrl=? WHERE id=?`,
            [brandingData.logoUrl, brandingData.bgUrl, id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
          break;
        
        default:
          resolve(); // Skip unknown update types
      }
    });
  });
  
  Promise.all(promises)
    .then(() => {
      events.emit('kiosk-config-synced', { id, updates: configUpdates });
      res.json({ message: 'Configuration synced successfully' });
    })
    .catch(err => {
      console.error('Config sync error:', err);
      res.status(500).json({ error: 'Failed to sync configuration' });
    });
});

// Get remote configuration for kiosk
app.get('/api/kiosks/:id/remote-config', kioskOrAuth, (req, res) => {
  const { id } = req.params;
  
  // Get kiosk configuration
  db.get('SELECT * FROM kiosks WHERE id=?', [id], (err, kiosk) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!kiosk) return res.status(404).json({ error: 'Kiosk not found' });
    
    // Get global configuration
    db.all('SELECT key, value FROM config', (err, configRows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      
      const globalConfig = Object.fromEntries(configRows.map(r => [r.key, r.value]));
      
      // Get admin PINs (encrypted)
      db.get(
        'SELECT global_pin, kiosk_pins FROM admin_pins WHERE id=1',
        (err, pinRow) => {
          if (err) console.error('Failed to load admin PINs:', err);
          
          const adminPins = {
            global: pinRow?.global_pin || null,
            kiosk: pinRow?.kiosk_pins ? JSON.parse(pinRow.kiosk_pins)[id] || null : null
          };
          
          const remoteConfig = {
            config: {
              statusEnabled: Boolean(kiosk.statusEnabled),
              currentStatus: kiosk.currentStatus || 'closed',
              openMsg: kiosk.openMsg || globalConfig.openMsg || 'We are open!',
              closedMsg: kiosk.closedMsg || globalConfig.closedMsg || 'We are closed.',
              errorMsg: kiosk.errorMsg || globalConfig.errorMsg || 'Service temporarily unavailable.',
              logoUrl: kiosk.logoUrl || globalConfig.logoUrl || '/logo.png',
              backgroundUrl: kiosk.bgUrl || globalConfig.backgroundUrl || null,
              welcomeMessage: globalConfig.welcomeMessage || 'Welcome',
              helpMessage: globalConfig.helpMessage || 'Need help?',
              schedule: kiosk.schedule ? JSON.parse(kiosk.schedule) : null,
              officeHours: globalConfig.officeHours ? JSON.parse(globalConfig.officeHours) : null
            },
            adminPins: adminPins,
            lastUpdate: new Date().toISOString(),
            version: 1,
            permissions: {
              canEditStatus: true,
              canEditSchedule: true,
              canEditBranding: true,
              canEditOfficeHours: false // Always false for kiosk
            }
          };
          
          res.json(remoteConfig);
        }
      );
    });
  });
});

// Validate admin PIN
app.post('/api/admin-pins/validate', (req, res) => {
  const { pin, kioskId } = req.body;
  
  if (!pin || !/^\d{6}$/.test(pin)) {
    return res.status(400).json({ error: 'Invalid PIN format' });
  }
  
  db.get(
    'SELECT global_pin, kiosk_pins FROM admin_pins WHERE id=1',
    (err, row) => {
      if (err) {
        console.error('Failed to validate PIN:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      let valid = false;
      let pinType = null;
      
      // Check global PIN
      if (row?.global_pin && row.global_pin === pin) {
        valid = true;
        pinType = 'global';
      }
      
      // Check kiosk-specific PIN
      if (!valid && row?.kiosk_pins && kioskId) {
        const kioskPins = JSON.parse(row.kiosk_pins);
        if (kioskPins[kioskId] === pin) {
          valid = true;
          pinType = 'kiosk';
        }
      }
      
      if (valid) {
        // Generate session token
        const token = sign({ 
          type: 'admin-pin',
          kioskId: kioskId || null,
          pinType
        });
        
        res.json({
          valid: true,
          token,
          permissions: ['status', 'schedule', 'branding'], // No office hours
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          pinType
        });
      } else {
        res.json({
          valid: false,
          token: null,
          permissions: [],
          expiresAt: null,
          pinType: null
        });
      }
    }
  );
});

// Update admin PINs
app.put('/api/admin-pins', ensureAuth, (req, res) => {
  const { globalPin, kioskPins } = req.body;
  
  // Validate PIN formats
  if (globalPin && !/^\d{6}$/.test(globalPin)) {
    return res.status(400).json({ error: 'Global PIN must be 6 digits' });
  }
  
  if (kioskPins) {
    for (const [kioskId, pin] of Object.entries(kioskPins)) {
      if (pin && !/^\d{6}$/.test(pin)) {
        return res.status(400).json({ error: `PIN for kiosk ${kioskId} must be 6 digits` });
      }
    }
  }
  
  // Create or update admin pins table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_pins (
      id INTEGER PRIMARY KEY,
      global_pin TEXT,
      kiosk_pins TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Failed to create admin_pins table:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.run(
      `INSERT INTO admin_pins (id, global_pin, kiosk_pins) VALUES (1, ?, ?)
       ON CONFLICT(id) DO UPDATE SET 
       global_pin=excluded.global_pin,
       kiosk_pins=excluded.kiosk_pins,
       updated_at=CURRENT_TIMESTAMP`,
      [globalPin || null, kioskPins ? JSON.stringify(kioskPins) : null],
      (err) => {
        if (err) {
          console.error('Failed to update admin PINs:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        events.emit('admin-pins-updated', { globalPin: !!globalPin, kioskPins: Object.keys(kioskPins || {}) });
        res.json({ message: 'Admin PINs updated successfully' });
      }
    );
  });
});

// Get admin PINs (for management interface)
app.get('/api/admin-pins', ensureAuth, (req, res) => {
  db.get(
    'SELECT global_pin, kiosk_pins FROM admin_pins WHERE id=1',
    (err, row) => {
      if (err) {
        console.error('Failed to get admin PINs:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        globalPin: row?.global_pin || null,
        kioskPins: row?.kiosk_pins ? JSON.parse(row.kiosk_pins) : {}
      });
    }
  );
});
