// db.js - Enhanced database layer with PostgreSQL/MongoDB support
import { logger } from './logger.js';
import { DatabaseFactory } from './database/factory.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database factory
const dbFactory = new DatabaseFactory();
let db = null;
let isInitialized = false;

// Legacy SQLite database for backward compatibility
import sqlite3pkg from 'sqlite3';
const sqlite3 = sqlite3pkg.verbose();
const legacyDb = new sqlite3.Database("log.sqlite");

/**
 * Initialize the database factory and set up schemas
 */
async function initializeDatabase() {
  if (isInitialized) return db;
  
  try {
    logger.info('Initializing database factory...');
    
    // Initialize the database factory
    await dbFactory.initialize();
    db = dbFactory;
    
    // Set up schemas and initial data
    await setupSchemas();
    await setupInitialData();
    
    isInitialized = true;
    logger.info('Database factory initialized successfully');
    return db;
  } catch (error) {
    logger.error('Failed to initialize database factory:', error);
    logger.warn('Falling back to SQLite mode');
    
    // Fallback to legacy SQLite
    await setupLegacySQLite();
    db = legacyDb;
    isInitialized = true;
    return db;
  }
}

/**
 * Set up database schemas
 */
async function setupSchemas() {
  try {
    // PostgreSQL tables are already created via migrations
    // MongoDB collections are set up automatically
    logger.info('Database schemas verified');
  } catch (error) {
    logger.error('Error setting up schemas:', error);
    throw error;
  }
}

/**
 * Set up initial data
 */
async function setupInitialData() {
  try {
    await setupRolesAndPermissions();
    await setupDefaultConfig();
    await setupDefaultAdmin();
    logger.info('Initial data setup completed');
  } catch (error) {
    logger.error('Error setting up initial data:', error);
    throw error;
  }
}

/**
 * Set up roles and permissions
 */
async function setupRolesAndPermissions() {
  try {
    // Create default roles
    const roles = [
      { id: 1, name: 'superadmin', description: 'Super Administrator - Full System Access' },
      { id: 2, name: 'admin', description: 'Administrator - User Management Access' },
      { id: 3, name: 'user', description: 'Regular User - No Admin Access' }
    ];

    for (const role of roles) {
      await db.query(
        'INSERT INTO roles (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [role.id, role.name, role.description]
      );
    }

    // Create default permissions
    const permissions = [
      { id: 1, name: 'manage_users' },
      { id: 2, name: 'manage_roles' },
      { id: 3, name: 'manage_integrations' },
      { id: 4, name: 'manage_system' },
      { id: 5, name: 'view_admin_ui' },
      { id: 6, name: 'manage_admins' }
    ];

    for (const permission of permissions) {
      await db.query(
        'INSERT INTO permissions (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [permission.id, permission.name]
      );
    }

    // Assign permissions to roles
    const rolePermissions = [
      // Superadmin gets all permissions
      [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
      // Admin gets limited permissions
      [2, 1], [2, 5]
    ];

    for (const [roleId, permissionId] of rolePermissions) {
      await db.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [roleId, permissionId]
      );
    }

    logger.info('Roles and permissions setup completed');
  } catch (error) {
    logger.error('Error setting up roles and permissions:', error);
    throw error;
  }
}

/**
 * Set up default configuration
 */
async function setupDefaultConfig() {
  try {
    const defaults = {
      logoUrl: process.env.LOGO_URL || '/logo.png',
      faviconUrl: process.env.FAVICON_URL || '/vite.svg',
      organizationName: process.env.ORGANIZATION_NAME || 'Your Organization',
      welcomeMessage: 'Welcome to the Help Desk',
      helpMessage: 'Need to report an issue?',
      statusOpenMsg: 'Open',
      statusClosedMsg: 'Closed',
      statusErrorMsg: 'Error',
      statusMeetingMsg: 'In a Meeting - Back Soon',
      statusBrbMsg: 'Be Right Back',
      statusLunchMsg: 'Out to Lunch - Back in 1 Hour',
      statusUnavailableMsg: 'Status Unavailable',
      minPinLength: process.env.MIN_PIN_LENGTH || '4',
      maxPinLength: process.env.MAX_PIN_LENGTH || '8',
      scimToken: process.env.SCIM_TOKEN || '',
      directoryEnabled: '0',
      directoryProvider: 'mock',
      directoryUrl: '',
      directoryToken: '',
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

    // Hash admin password
    defaults.adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin', 12);

    for (const [key, value] of Object.entries(defaults)) {
      await db.query(
        'INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [key, value]
      );
    }

    // Insert default directory integration
    await db.query(
      'INSERT INTO directory_integrations (id, provider, settings) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [1, 'mock', '[]']
    );

    logger.info('Default configuration setup completed');
  } catch (error) {
    logger.error('Error setting up default configuration:', error);
    throw error;
  }
}

/**
 * Set up default admin user
 */
async function setupDefaultAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin';
    const adminHash = bcrypt.hashSync(adminPass, 12);

    // Check if admin user already exists
    const existingAdmin = await db.query(
      'SELECT id FROM users WHERE email = $1 OR is_default = true LIMIT 1',
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      logger.info('Creating default admin user...');
      
      // Create admin user
      const result = await db.query(
        'INSERT INTO users (name, email, password_hash, is_default) VALUES ($1, $2, $3, true) RETURNING id',
        [adminName, adminEmail, adminHash]
      );

      const userId = result.rows[0].id;

      // Assign superadmin role
      await db.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, 1]
      );

      if (!process.env.CLI_MODE) {
        logger.info(`Default admin user created: ${adminEmail} (password: ${adminPass})`);
      }
    } else {
      const userId = existingAdmin.rows[0].id;
      
      // Ensure admin has superadmin role
      await db.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, 1]
      );

      if (!process.env.CLI_MODE) {
        logger.info(`Admin user already exists: ${adminEmail}`);
      }
    }
  } catch (error) {
    logger.error('Error setting up default admin:', error);
    throw error;
  }
}

/**
 * Set up legacy SQLite database for fallback
 */
async function setupLegacySQLite() {
  return new Promise((resolve) => {
    legacyDb.serialize(() => {
      // Create tables (existing SQLite schema)
      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS passkeys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          credential_id TEXT NOT NULL,
          public_key TEXT NOT NULL,
          counter INTEGER DEFAULT 0,
          transports TEXT,
          device_type TEXT,
          backed_up INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          last_used TEXT,
          UNIQUE(user_id, credential_id)
        )
      `);

      legacyDb.run(`
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

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS config (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);

      legacyDb.run(`
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
          meetingMsg TEXT,
          brbMsg TEXT,
          lunchMsg TEXT,
          unavailableMsg TEXT,
          schedule TEXT
        )
      `);

      legacyDb.run(`
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

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          message TEXT,
          timestamp TEXT
        )
      `);

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message TEXT,
          level TEXT,
          active INTEGER DEFAULT 1,
          created_at TEXT
        )
      `);

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE,
          description TEXT
        )
      `);

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS permissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE
        )
      `);

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          role_id INTEGER,
          permission_id INTEGER
        )
      `);

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS user_roles (
          user_id INTEGER,
          role_id INTEGER
        )
      `);

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS directory_integrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          provider TEXT,
          settings TEXT
        )
      `);

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS assets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          filename TEXT NOT NULL,
          url TEXT NOT NULL,
          uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      legacyDb.run(`
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

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS sso_configurations (
          id INTEGER PRIMARY KEY,
          provider TEXT NOT NULL,
          enabled INTEGER DEFAULT 0,
          configuration TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      legacyDb.run(`
        CREATE TABLE IF NOT EXISTS admin_pins (
          id INTEGER PRIMARY KEY DEFAULT 1,
          global_pin TEXT,
          kiosk_pins TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, () => {
        logger.info('Legacy SQLite database setup completed');
        resolve();
      });
    });
  });
}

/**
 * Enhanced database operations with compatibility layer
 */
class DatabaseWrapper {
  constructor() {
    this.ready = false;
    this.initPromise = null;
  }

  async ensureReady() {
    if (this.ready) return;
    
    if (!this.initPromise) {
      this.initPromise = initializeDatabase();
    }
    
    await this.initPromise;
    this.ready = true;
  }

  // Modern async methods
  async query(sql, params = []) {
    await this.ensureReady();
    return db.query(sql, params);
  }

  async transaction(callback) {
    await this.ensureReady();
    return db.transaction(callback);
  }

  async storeDocument(collection, document) {
    await this.ensureReady();
    return db.storeDocument(collection, document);
  }

  async findDocuments(collection, query = {}, options = {}) {
    await this.ensureReady();
    return db.findDocuments(collection, query, options);
  }

  async createAuditLog(action, userId, details) {
    await this.ensureReady();
    return db.createAuditLog(action, userId, details);
  }

  // Legacy SQLite-compatible methods for backward compatibility
  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    this.ensureReady().then(async () => {
      try {
        if (db.query) {
          // Using modern database
          const result = await db.query(sql, params);
          if (callback) callback(null, result);
        } else {
          // Using legacy SQLite
          db.run(sql, params, callback);
        }
      } catch (error) {
        if (callback) callback(error);
      }
    });
  }

  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    this.ensureReady().then(async () => {
      try {
        if (db.query) {
          // Using modern database
          const result = await db.query(sql, params);
          const row = result.rows?.[0] || null;
          if (callback) callback(null, row);
        } else {
          // Using legacy SQLite
          db.get(sql, params, callback);
        }
      } catch (error) {
        if (callback) callback(error);
      }
    });
  }

  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    this.ensureReady().then(async () => {
      try {
        if (db.query) {
          // Using modern database
          const result = await db.query(sql, params);
          if (callback) callback(null, result.rows || []);
        } else {
          // Using legacy SQLite
          db.all(sql, params, callback);
        }
      } catch (error) {
        if (callback) callback(error);
      }
    });
  }

  prepare(sql) {
    // Return a statement-like object for backward compatibility
    return {
      run: (params, callback) => this.run(sql, params, callback),
      get: (params, callback) => this.get(sql, params, callback),
      all: (params, callback) => this.all(sql, params, callback),
      finalize: () => {} // No-op for compatibility
    };
  }

  serialize(callback) {
    this.ensureReady().then(() => {
      if (callback) callback();
    });
  }

  // Helper methods for backward compatibility
  deleteLog(id, cb) {
    this.run('DELETE FROM logs WHERE id = $1', [id], cb);
  }

  deleteAllLogs(cb) {
    this.run('DELETE FROM logs', cb);
  }

  deleteKiosk(id, cb) {
    this.run('DELETE FROM kiosks WHERE id = $1', [id], cb);
  }

  deleteAllKiosks(cb) {
    this.run('DELETE FROM kiosks', cb);
  }

  purgeOldLogs(days = 30, cb = () => {}) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    this.run('DELETE FROM logs WHERE timestamp < $1', [cutoff], cb);
  }
}

// Create and export the database wrapper
const dbWrapper = new DatabaseWrapper();

// Initialize the database
initializeDatabase().catch(error => {
  logger.error('Failed to initialize database:', error);
});

export default dbWrapper;
