import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { Strategy as SamlStrategy } from '@node-saml/passport-saml';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';
import events from './events.js';
import { sign, verify } from './jwt.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

dotenv.config();

const app = express();
const originList = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : undefined;
app.use(cors(originList ? { origin: originList } : undefined));
app.use(express.json());

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
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((u, d) => d(null, u));
  passport.deserializeUser((u, d) => d(null, u));

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
      if (req.isAuthenticated()) return next();
      const header = req.headers.authorization || '';
      const token = header.replace(/^Bearer\s+/i, '');
      if (token && verify(token)) return next();
      res.status(401).json({ error: 'unauthenticated' });
    };

const ensureScimAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!SCIM_TOKEN || token !== SCIM_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
};

if (!DISABLE_AUTH) {
  app.get('/login', authLimiter, passport.authenticate('saml'));
  app.post(
    '/login/callback',
    authLimiter,
    passport.authenticate('saml', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect(process.env.ADMIN_URL || '/');
    }
  );
  app.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect(process.env.ADMIN_URL || '/');
    });
  });
}

app.post("/submit-ticket", ticketLimiter, async (req, res) => {
  const { name, email, title, system, urgency, description } = req.body;

  if (!name || !email || !title || !system || !urgency) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const ticketId = uuidv4().split("-")[0];
  const timestamp = new Date().toISOString();

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
    `INSERT INTO logs (ticket_id, name, email, title, system, urgency, timestamp, email_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [ticketId, name, email, title, system, urgency, timestamp, emailStatus],
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
    "SELECT key, value FROM config WHERE key IN ('statusOpenMsg','statusClosedMsg','statusErrorMsg')",
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      const out = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      res.json(out);
    }
  );
});

app.put('/api/status-config', ensureAuth, (req, res) => {
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
      events.emit('status-config-updated', updates);
      res.json({ message: 'updated' });
    });
  });
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
  const { message, level } = req.body;
  if (!message || !level) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO notifications (message, level, created_at) VALUES (?, ?, ?)`,
    [message, level, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      events.emit('notifications-updated');
      res.json({ id: this.lastID });
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

app.post('/api/login', apiLoginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  db.get('SELECT * FROM users WHERE email=?', [email], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row || !row.passwordHash) {
      return res.status(401).json({ error: 'invalid' });
    }
    if (!bcrypt.compareSync(password, row.passwordHash)) {
      return res.status(401).json({ error: 'invalid' });
    }
    const token = sign({ id: row.id, name: row.name, email: row.email });
    res.json({ token });
  });
});

app.post('/api/register-kiosk', (req, res) => {
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

app.get("/api/kiosks/:id", (req, res) => {
  db.get(`SELECT * FROM kiosks WHERE id=?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(row || {});
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
      res.json({ message: "updated" });
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

app.get("/api/users", ensureAuth, (req, res) => {
  db.all(`SELECT * FROM users`, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

app.post('/api/users', ensureAuth, (req, res) => {
  const { name, email, password } = req.body;
  const hash = password ? bcrypt.hashSync(password, 10) : null;
  db.run(
    `INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)`,
    [name || '', email || '', hash],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/users/:id', ensureAuth, (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const hash = password ? bcrypt.hashSync(password, 10) : null;
  db.run(
    `UPDATE users SET name=?, email=?, passwordHash=COALESCE(?, passwordHash) WHERE id=?`,
    [name, email, hash, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json({ message: 'updated' });
    }
  );
});

app.delete("/api/users/:id", ensureAuth, (req, res) => {
  db.run(`DELETE FROM users WHERE id=?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "deleted" });
  });
});

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
  db.run(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.status(201).json(formatUser({ id: this.lastID, name, email }));
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
  db.run('DELETE FROM users WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.status(204).end();
  });
});

app.use('/scim/v2', scim);

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

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  if (CERT_PATH && KEY_PATH) {
    const options = {
      cert: fs.readFileSync(CERT_PATH),
      key: fs.readFileSync(KEY_PATH),
    };
    https.createServer(options, app).listen(PORT, () => {
      console.log(`✅ CueIT API running at https://localhost:${PORT}`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(`✅ CueIT API running at http://localhost:${PORT}`);
    });
  }
}

export default app;
