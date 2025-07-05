// db.js
import sqlite3pkg from 'sqlite3';
import bcrypt from 'bcryptjs';
const sqlite3 = sqlite3pkg.verbose();
const db = new sqlite3.Database("log.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT,
      name TEXT,
      email TEXT,
      title TEXT,
      system TEXT,
      urgency TEXT,
      timestamp TEXT,
      email_status TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS kiosks (
      id TEXT PRIMARY KEY,
      last_seen TEXT,
      version TEXT,
      active INTEGER DEFAULT 0,
      logoUrl TEXT,
      bgUrl TEXT,
      statusEnabled INTEGER DEFAULT 0,
      currentStatus TEXT,
      openMsg TEXT,
      closedMsg TEXT,
      errorMsg TEXT,
      schedule TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      message TEXT,
      timestamp TEXT
    )
  `);

  // add columns if database was created with an older schema
  function addColumnIfMissing(table, columnDef) {
    const columnName = columnDef.split(" ")[0];
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) {
        console.error(err);
        return;
      }
      const exists = rows.some((r) => r.name === columnName);
      if (!exists) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`, (err2) => {
          if (err2 && !/duplicate column name/i.test(err2.message)) {
            console.error(err2);
          }
        });
      }
    });
  }

  addColumnIfMissing('kiosks', 'active INTEGER DEFAULT 0');
  addColumnIfMissing('kiosks', 'logoUrl TEXT');
  addColumnIfMissing('kiosks', 'bgUrl TEXT');
  addColumnIfMissing('kiosks', 'statusEnabled INTEGER DEFAULT 0');
  addColumnIfMissing('kiosks', 'currentStatus TEXT');
  addColumnIfMissing('kiosks', 'openMsg TEXT');
  addColumnIfMissing('kiosks', 'closedMsg TEXT');
  addColumnIfMissing('kiosks', 'errorMsg TEXT');
  addColumnIfMissing('kiosks', 'schedule TEXT');

  // insert default config if not present
  const defaults = {
    logoUrl: process.env.LOGO_URL || '/logo.png',
    faviconUrl: process.env.FAVICON_URL || '/vite.svg',
    welcomeMessage: 'Welcome to the Help Desk',
    helpMessage: 'Need to report an issue?',
    statusOpenMsg: 'Open',
    statusClosedMsg: 'Closed',
    statusErrorMsg: 'Error',
    adminPassword: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin', 10),
    scimToken: process.env.SCIM_TOKEN || ''
  };
  const stmt = db.prepare(`INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`);
  for (const [key, value] of Object.entries(defaults)) {
    stmt.run(key, value);
  }
  stmt.finalize();
});

// helpers for deleting records
db.deleteLog = (id, cb) => {
  db.run(`DELETE FROM logs WHERE id=?`, [id], cb);
};

db.deleteAllLogs = (cb) => {
  db.run(`DELETE FROM logs`, cb);
};

db.deleteKiosk = (id, cb) => {
  db.run(`DELETE FROM kiosks WHERE id=?`, [id], cb);
};

db.deleteAllKiosks = (cb) => {
  db.run(`DELETE FROM kiosks`, cb);
};

db.purgeOldLogs = (days = 30, cb = () => {}) => {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  db.run(`DELETE FROM logs WHERE timestamp < ?`, [cutoff], cb);
};

export default db;
