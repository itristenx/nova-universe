require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const db = require("./db");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.API_PORT || 3000;

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
    res.json({ message: "deleted" });
  });
});

app.delete("/api/kiosks", (req, res) => {
  db.deleteAllKiosks((err) => {
    if (err) return res.status(500).json({ error: "DB error" });
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ CueIT Backend running at http://localhost:${PORT}`);
  });
}

module.exports = app;
