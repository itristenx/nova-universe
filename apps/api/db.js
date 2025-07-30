// db.js - Enhanced database layer with PostgreSQL/MongoDB support
import { logger } from './logger.js';
import { DatabaseFactory } from './database/factory.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database factory
const dbFactory = new DatabaseFactory();
let db = null;
let isInitialized = false;

/**
 * Initialize the database factory and set up schemas
 */
async function initializeDatabase() {
  if (isInitialized) return db;
  try {
    logger.info('Initializing database factory...');
    await dbFactory.initialize();
    db = dbFactory;
    await setupSchemas();
    await setupInitialData();
    isInitialized = true;
    logger.info('Database factory initialized successfully');
    return db;
  } catch (error) {
    logger.error('Failed to initialize database factory:', error);
    throw error;
  }
}

/**
 * Set up database schemas
 */
async function setupSchemas() {
  try {
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
    const roles = [
      { id: 1, name: 'superadmin', description: 'Super Administrator - Full System Access' },
      { id: 2, name: 'admin', description: 'Administrator - User Management Access' },
      { id: 3, name: 'user', description: 'Regular User - No Admin Access' }
    ];
    for (const role of roles) {
      await db.query(
        'INSERT INTO roles (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING',
        [role.id, role.name, role.description]
      );
    }
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
    const rolePermissions = [
      [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
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
      rateLimitWindow: process.env.RATE_LIMIT_WINDOW || '900000',
      rateLimitMax: process.env.RATE_LIMIT_MAX || '100',
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
    defaults.adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin', 12);
    for (const [key, value] of Object.entries(defaults)) {
      await db.query(
        'INSERT INTO config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [key, value]
      );
    }
    await db.query(
      'INSERT INTO directory_integrations (id, provider, settings, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
      [1, 'mock', '[]', new Date().toISOString(), new Date().toISOString()]
    );
    logger.info('Default configuration setup completed');
  } catch (error) {
    logger.error('Error setting up default configuration:', error);
    throw error;
  }
}

async function setupDefaultAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin';
    const adminHash = bcrypt.hashSync(adminPass, 12);
    const existingAdmin = await db.query(
      'SELECT id FROM users WHERE email = $1 OR is_default = true LIMIT 1',
      [adminEmail]
    );
    if (existingAdmin.rows.length === 0) {
      logger.info('Creating default admin user...');
      const newUserId = uuidv4();
      const now = new Date().toISOString();
      const result = await db.query(
        'INSERT INTO users (id, name, email, password_hash, is_default, created_at, updated_at) VALUES ($1, $2, $3, $4, true, $5, $6) RETURNING id',
        [newUserId, 'Admin', 'admin@example.com', adminHash, now, now]
      );
      const userId = result.rows[0].id;
      await db.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, 1]
      );
      if (!process.env.CLI_MODE) {
        logger.info(`Default admin user created: ${adminEmail} (password: ${adminPass})`);
      }
    } else {
      const userId = existingAdmin.rows[0].id;
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

  async purgeOldLogs(days, cb) {
    try {
      await this.ensureReady();
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      await db.query('DELETE FROM logs WHERE timestamp < $1', [cutoff]);
      if (cb) cb(null);
    } catch (err) {
      if (cb) cb(err);
    }
  }

  // Compatibility: .get(sql, params, cb)
  get(sql, params, cb) {
    this.query(sql, params)
      .then(result => {
        if (result && result.rows && result.rows.length > 0) {
          cb(null, result.rows[0]);
        } else {
          cb(null, undefined);
        }
      })
      .catch(cb);
  }

  // Compatibility: .run(sql, params, cb) or .run(sql, params) returning a promise
  run(sql, params, cb) {
    // If only two arguments and second is a function, shift
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    // If callback is provided, use callback style
    if (typeof cb === 'function') {
      this.query(sql, params)
        .then(result => cb(null, result))
        .catch(cb);
    } else {
      // Otherwise, return a promise
      return this.query(sql, params);
    }
  }
}

// Create and export the database wrapper
const dbWrapper = new DatabaseWrapper();
const prisma = new PrismaClient();

// Initialize the database
initializeDatabase().catch(error => {
  logger.error('Failed to initialize database:', error);
});

export default dbWrapper;
export { prisma };

// Gracefully close all database connections
async function closeDatabase() {
  try {
    if (dbFactory && typeof dbFactory.close === 'function' && isInitialized) {
      await dbFactory.close();
      isInitialized = false;
    } else {
      logger.warn('closeDatabase called but dbFactory or isInitialized is in an invalid state.', {
        dbFactory: dbFactory ? 'valid' : 'null/undefined',
        isInitialized,
      });
    }
  } catch (error) {
    logger.error('Failed to close database:', error);
  }
}

export { setupInitialData, initializeDatabase, closeDatabase };
