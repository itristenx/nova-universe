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
      email_status TEXT,
      servicenow_id TEXT
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

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT,
      level TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id INTEGER,
      permission_id INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER,
      role_id INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS directory_integrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT,
      settings TEXT
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

  addColumnIfMissing('notifications', 'active INTEGER DEFAULT 1');
  addColumnIfMissing('notifications', 'created_at TEXT');
  addColumnIfMissing('users', 'passwordHash TEXT');
  addColumnIfMissing('logs', 'servicenow_id TEXT');

  // seed role/permission tables
  db.run("INSERT OR IGNORE INTO roles (id, name) VALUES (1, 'Super Admin')");
  db.run("INSERT OR IGNORE INTO roles (id, name) VALUES (2, 'Admin')");
  db.run("INSERT OR IGNORE INTO permissions (id, name) VALUES (1, 'manage_users')");
  db.run("INSERT OR IGNORE INTO permissions (id, name) VALUES (2, 'manage_roles')");
  db.run(
    "INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 1)"
  );
  db.run(
    "INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 2)"
  );
  db.run(
    "INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, 1)"
  );
  db.run("INSERT OR IGNORE INTO directory_integrations (id, provider, settings) VALUES (1, 'mock', '[]')");

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

  // insert default admin user if not present
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminName = process.env.ADMIN_NAME || 'Admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin';
  const adminHash = bcrypt.hashSync(adminPass, 10);
  db.get('SELECT id FROM users WHERE email=?', [adminEmail], (err, row) => {
    if (err) return console.error(err);
    const assign = (uid) => {
      db.run(
        'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, 1)',
        [uid]
      );
    };
    if (!row) {
      db.run(
        'INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)',
        [adminName, adminEmail, adminHash],
        function (e) {
          if (!e) assign(this.lastID);
        }
      );
    } else {
      assign(row.id);
    }
  });
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
