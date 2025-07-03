import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import db from './db.js';
import { v4 as uuidv4 } from 'uuid';
import events from './events.js';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.API_PORT || 3000;
const SLACK_URL = process.env.SLACK_WEBHOOK_URL;

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
  secure: false,
});

app.post("/submit-ticket", async (req, res) => {
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

  let emailStatus = "success";
  try {
    await transporter.sendMail(mailOptions);
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

app.get("/api/logs", (req, res) => {
  db.all(`SELECT * FROM logs ORDER BY timestamp DESC`, (err, rows) => {
    if (err) {
      console.error("❌ Failed to fetch logs:", err.message);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});

app.delete("/api/logs/:id", (req, res) => {
  db.deleteLog(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "deleted" });
  });
});

app.delete("/api/logs", (req, res) => {
  db.deleteAllLogs((err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "cleared" });
  });
});

app.get("/api/config", (req, res) => {
  db.all(`SELECT key, value FROM config`, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    const config = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    delete config.adminPassword;
    res.json(config);
  });
});

app.put("/api/config", (req, res) => {
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

app.post('/api/verify-password', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Missing password' });
  db.get(`SELECT value FROM config WHERE key='adminPassword'`, (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    const hash = row ? row.value : '';
    const valid = bcrypt.compareSync(password, hash);
    res.json({ valid });
  });
});

app.put('/api/admin-password', (req, res) => {
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

app.post("/api/register-kiosk", (req, res) => {
  const { id, version } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });
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

app.put("/api/kiosks/:id", (req, res) => {
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

app.get("/api/kiosks", (req, res) => {
  db.all(`SELECT * FROM kiosks`, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

app.delete("/api/kiosks/:id", (req, res) => {
  db.deleteKiosk(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    events.emit('kiosk-deleted', { id: req.params.id });
    res.json({ message: "deleted" });
  });
});

app.delete("/api/kiosks", (req, res) => {
  db.deleteAllKiosks((err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    events.emit('kiosk-deleted', { all: true });
    res.json({ message: "cleared" });
  });
});

app.put("/api/kiosks/:id/active", (req, res) => {
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

app.get("/api/users", (req, res) => {
  db.all(`SELECT * FROM users`, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body;
  db.run(
    `INSERT INTO users (name, email) VALUES (?, ?)`,
    [name || "", email || ""],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ id: this.lastID });
    }
  );
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  db.run(
    `UPDATE users SET name=?, email=? WHERE id=?`,
    [name, email, id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ message: "updated" });
    }
  );
});

app.delete("/api/users/:id", (req, res) => {
  db.run(`DELETE FROM users WHERE id=?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ message: "deleted" });
  });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  app.listen(PORT, () => {
    console.log(`✅ CueIT API running at http://localhost:${PORT}`);
  });
}

export default app;
