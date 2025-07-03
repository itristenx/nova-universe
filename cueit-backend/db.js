const Database = require('better-sqlite3');
const dbFile = process.env.DB_FILE || 'log.sqlite';
const raw = new Database(dbFile);

function run(sql, params = [], cb = () => {}) {
  if (typeof params === 'function') {
    cb = params; params = [];
  }
  try {
    raw.prepare(sql).run(params);
    cb(null);
  } catch (err) {
    cb(err);
  }
}

function all(sql, params = [], cb) {
  if (typeof params === 'function') {
    cb = params; params = [];
  }
  const rows = raw.prepare(sql).all(params);
  cb(null, rows);
}

function prepare(sql) {
  const stmt = raw.prepare(sql);
  return {
    run: (...params) => { stmt.run(...params); },
    finalize: (cb) => { if (cb) cb(null); }
  };
}

function serialize(fn) { fn(); }

function close(cb) { raw.close(); if (cb) cb(); }

// initialize schema and defaults
serialize(() => {
  run(`CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id TEXT,
      name TEXT,
      email TEXT,
      title TEXT,
      system TEXT,
      urgency TEXT,
      timestamp TEXT,
      email_status TEXT
    )`);

  run(`CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )`);

  run(`CREATE TABLE IF NOT EXISTS kiosks (
      id TEXT PRIMARY KEY,
      last_seen TEXT,
      version TEXT,
      active INTEGER DEFAULT 0
    )`);

  // add active column if database was created with an older schema
  run(`ALTER TABLE kiosks ADD COLUMN active INTEGER DEFAULT 0`);

  const defaults = {
    logoUrl: process.env.LOGO_URL || '/logo.png',
    welcomeMessage: 'Welcome to the Help Desk',
    helpMessage: 'Need to report an issue?',
    adminPassword: 'admin'
  };
  const stmt = prepare(`INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`);
  for (const [key, value] of Object.entries(defaults)) {
    stmt.run(key, value);
  }
  stmt.finalize();
});

module.exports = { run, all, prepare, serialize, close };
