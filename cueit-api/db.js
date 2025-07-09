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
      email TEXT UNIQUE,
      passwordHash TEXT,
      disabled INTEGER DEFAULT 0,
      is_default INTEGER DEFAULT 0,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
      name TEXT UNIQUE,
      description TEXT
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

  db.run(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS kiosk_activations (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      qr_code TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      used_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sso_configurations (
      id INTEGER PRIMARY KEY,
      provider TEXT NOT NULL,
      enabled INTEGER DEFAULT 0,
      configuration TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS admin_pins (
      id INTEGER PRIMARY KEY DEFAULT 1,
      global_pin TEXT,
      kiosk_pins TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
  addColumnIfMissing('notifications', 'type TEXT DEFAULT "system"');
  addColumnIfMissing('users', 'passwordHash TEXT');
  addColumnIfMissing('users', 'disabled INTEGER DEFAULT 0');
  addColumnIfMissing('users', 'is_default INTEGER DEFAULT 0');
  addColumnIfMissing('logs', 'servicenow_id TEXT');
  addColumnIfMissing('roles', 'description TEXT');

  // After adding columns, mark default admin users
  setTimeout(() => {
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    db.run('UPDATE users SET is_default = 1 WHERE email = ? AND is_default IS NOT NULL', [defaultEmail], (err) => {
      if (!err) {
        if (!process.env.CLI_MODE) console.log(`✅ Marked ${defaultEmail} as default admin user`);
      }
    });

    // Create unique index on email if it doesn't exist
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
      if (err && !err.message.includes('already exists')) {
        console.error('Warning: Could not create unique index on users.email:', err.message);
      }
    });
  }, 1000); // Wait for schema updates to complete

  // seed role/permission tables with hierarchical roles
  db.run("INSERT OR IGNORE INTO roles (id, name, description) VALUES (1, 'superadmin', 'Super Administrator - Full System Access')");
  db.run("INSERT OR IGNORE INTO roles (id, name, description) VALUES (2, 'admin', 'Administrator - User Management Access')");
  db.run("INSERT OR IGNORE INTO roles (id, name, description) VALUES (3, 'user', 'Regular User - No Admin Access')");
  
  // Permissions for different access levels
  db.run("INSERT OR IGNORE INTO permissions (id, name) VALUES (1, 'manage_users')");
  db.run("INSERT OR IGNORE INTO permissions (id, name) VALUES (2, 'manage_roles')");
  db.run("INSERT OR IGNORE INTO permissions (id, name) VALUES (3, 'manage_integrations')");
  db.run("INSERT OR IGNORE INTO permissions (id, name) VALUES (4, 'manage_system')");
  db.run("INSERT OR IGNORE INTO permissions (id, name) VALUES (5, 'view_admin_ui')");
  db.run("INSERT OR IGNORE INTO permissions (id, name) VALUES (6, 'manage_admins')");
  
  // Superadmin gets all permissions
  db.run("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 1)"); // manage_users
  db.run("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 2)"); // manage_roles
  db.run("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 3)"); // manage_integrations
  db.run("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 4)"); // manage_system
  db.run("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 5)"); // view_admin_ui
  db.run("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (1, 6)"); // manage_admins
  
  // Admin gets limited permissions
  db.run("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, 1)"); // manage_users
  db.run("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (2, 5)"); // view_admin_ui
  
  // Regular users get no admin permissions (only kiosk access)
  // No permissions assigned to role ID 3
  db.run("INSERT OR IGNORE INTO directory_integrations (id, provider, settings) VALUES (1, 'mock', '[]')");

  // insert default config if not present
  const defaults = {
    logoUrl: process.env.LOGO_URL || '/logo.png',
    faviconUrl: process.env.FAVICON_URL || '/vite.svg',
    organizationName: process.env.ORGANIZATION_NAME || 'Your Organization',
    welcomeMessage: 'Welcome to the Help Desk',
    helpMessage: 'Need to report an issue?',
    statusOpenMsg: 'Open',
    statusClosedMsg: 'Closed',
    statusErrorMsg: 'Error',
    minPinLength: process.env.MIN_PIN_LENGTH || '4',
    maxPinLength: process.env.MAX_PIN_LENGTH || '8',
    scimToken: process.env.SCIM_TOKEN || '',
    directoryEnabled: '0',
    directoryProvider: 'mock',
    directoryUrl: '',
    directoryToken: '',
    // Default SMTP integration - enabled by default
    integration_smtp: JSON.stringify({
      enabled: true,
      config: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        username: process.env.SMTP_USER || '',
        password: process.env.SMTP_PASS || ''
      },
      updatedAt: new Date().toISOString()
    })
  };
  
  // Hash admin password with proper salt rounds (12 for better security)
  defaults.adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin', 12);
  const stmt = db.prepare(`INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)`);
  for (const [key, value] of Object.entries(defaults)) {
    stmt.run(key, value);
  }
  stmt.finalize();

  // Insert default admin user if not present - prevent duplicates
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminName = process.env.ADMIN_NAME || 'Admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin';
  const adminHash = bcrypt.hashSync(adminPass, 12); // Increase salt rounds for better security
  
  // Use a flag to prevent multiple admin creation attempts
  let adminCreationInProgress = false;
  
  db.serialize(() => {
    // Check for any existing admin users (default or superadmin role)
    db.get(`
      SELECT u.id, u.email FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = ? OR (r.name = 'superadmin' AND u.is_default = 1)
      LIMIT 1
    `, [adminEmail], (err, row) => {
      if (err) {
        console.error('Error checking for admin user:', err);
        return;
      }
      
      const assignRole = (uid) => {
        // Assign superadmin role to default admin user
        db.run(
          'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, 1)',
          [uid],
          (err) => {
            if (err) {
              console.error('Error assigning superadmin role:', err);
            } else {
              if (!process.env.CLI_MODE) console.log(`✅ Superadmin role assigned to user ID ${uid}`);
            }
          }
        );
      };
      
      if (!row && !adminCreationInProgress) {
        adminCreationInProgress = true;
        console.log('Creating default admin user...');
        
        db.run(
          'INSERT INTO users (name, email, passwordHash, is_default) VALUES (?, ?, ?, 1)',
          [adminName, adminEmail, adminHash],
          function (err) {
            if (err) {
              if (err.message && err.message.includes('UNIQUE constraint failed')) {
                if (!process.env.CLI_MODE) console.log('✅ Admin user already exists (concurrent creation detected)');
              } else {
                if (!process.env.CLI_MODE) console.error('Error creating admin user:', err);
              }
            } else {
              if (!process.env.CLI_MODE) console.log(`✅ Default admin user created: ${adminEmail} (password: ${adminPass})`);
              assignRole(this.lastID);
            }
            adminCreationInProgress = false;
          }
        );
      } else if (row) {
        if (!process.env.CLI_MODE) console.log(`✅ Admin user already exists: ${row.email}`);
        // Mark existing admin as default if not already marked
        db.run('UPDATE users SET is_default = 1 WHERE id = ?', [row.id], (updateErr) => {
          if (updateErr && !process.env.CLI_MODE) console.log('Note: Could not mark user as default (column may not exist yet)');
        });
        assignRole(row.id);
      }
    });
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
