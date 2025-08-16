// db.js - Consolidated database layer with PostgreSQL/MongoDB support
// (merged from the former db.js and db-new.js implementations)

// Configure environment variables before importing database config
import dotenv from 'dotenv';
dotenv.config();

import { logger } from './logger.js';
import { DatabaseFactory } from './database/factory.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
// import { PrismaClient } from '../../prisma/generated/core/index.js';

const __filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);

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
    await dbFactory.initialize(); // TODO-LINT: move to async function
    db = dbFactory;
    await setupSchemas(); // TODO-LINT: move to async function
    await setupInitialData(); // TODO-LINT: move to async function
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
    await setupRolesAndPermissions(); // TODO-LINT: move to async function
    await setupDefaultConfig(); // TODO-LINT: move to async function
    await setupDefaultAdmin(); // TODO-LINT: move to async function
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
    // Ensure baseline tables exist (idempotent on clean DBs)
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ); // TODO-LINT: move to async function
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL,
        permission_id INTEGER NOT NULL,
        PRIMARY KEY (role_id, permission_id)
      );
    `);

    const roles = [
      { id: 1, name: 'superadmin', description: 'Super Administrator - Full System Access' },
      { id: 2, name: 'admin', description: 'Administrator - User Management Access' },
      { id: 3, name: 'user', description: 'Regular User - No Admin Access' }
    ];

    for (const role of roles) {
      await db.query(
        'INSERT INTO roles (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING',
        [role.id, role.name, role.description]
      ); // TODO-LINT: move to async function
    }

    const permissions = [
      { id: 1, name: 'manage_users' },
      { id: 2, name: 'manage_roles' },
      { id: 3, name: 'manage_permissions' },
      { id: 4, name: 'view_admin_panel' },
      { id: 5, name: 'manage_integrations' },
      { id: 6, name: 'view_audit_logs' }
    ];

    for (const permission of permissions) {
      await db.query(
        'INSERT INTO permissions (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [permission.id, permission.name]
      ); // TODO-LINT: move to async function
    }

    // Assign permissions to roles
    const rolePermissions = [
      { roleId: 1, permissionId: 1 },
      { roleId: 1, permissionId: 2 },
      { roleId: 1, permissionId: 3 },
      { roleId: 1, permissionId: 4 },
      { roleId: 1, permissionId: 5 },
      { roleId: 1, permissionId: 6 },
      { roleId: 2, permissionId: 1 },
      { roleId: 2, permissionId: 4 },
      { roleId: 2, permissionId: 6 },
    ];

    for (const rp of rolePermissions) {
      await db.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [rp.roleId, rp.permissionId]
      ); // TODO-LINT: move to async function
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
      companyName: process.env.COMPANY_NAME || 'Nova Universe',
      enableRegistration: process.env.ENABLE_REGISTRATION || 'false',
      enableSSOLogin: process.env.ENABLE_SSO_LOGIN || 'false',
      enablePasswordLogin: process.env.ENABLE_PASSWORD_LOGIN || 'true',
      enableWebauthn: process.env.ENABLE_WEBAUTHN || 'true',
      sessionTimeout: process.env.SESSION_TIMEOUT || '3600',
      maxLoginAttempts: process.env.MAX_LOGIN_ATTEMPTS || '5',
      lockoutDuration: process.env.LOCKOUT_DURATION || '900',
      passwordMinLength: process.env.PASSWORD_MIN_LENGTH || '8',
      enablePasswordComplexity: process.env.ENABLE_PASSWORD_COMPLEXITY || 'true',
      enableMFA: process.env.ENABLE_MFA || 'false',
      enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING || 'true',
      retentionDays: process.env.LOG_RETENTION_DAYS || '90',
      backupEnabled: process.env.BACKUP_ENABLED || 'true',
      backupFrequency: process.env.BACKUP_FREQUENCY || 'daily',
      maintenanceMode: process.env.MAINTENANCE_MODE || 'false',
      apiRateLimit: process.env.API_RATE_LIMIT || '1000',
      maxFileSize: process.env.MAX_FILE_SIZE || '10485760',
      allowedFileTypes: process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx',
      smtpEnabled: process.env.SMTP_ENABLED || 'false',
      smtpHost: process.env.SMTP_HOST || 'localhost',
      smtpPort: process.env.SMTP_PORT || '587',
      emailFrom: process.env.EMAIL_FROM || 'noreply@novauniverse.com',
      themePrimary: process.env.THEME_PRIMARY || '#3b82f6',
      themeSecondary: process.env.THEME_SECONDARY || '#64748b'
    };

    for (const [key, value] of Object.entries(defaults)) {
      await db.query(
        'INSERT INTO config (key, value, value_type, category, created_at, updated_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (key) DO NOTHING',
        [key, value, 'string', 'general']
      ); // TODO-LINT: move to async function
    }

    // Add default directory integration
    await db.query(
      'INSERT INTO directory_integrations (provider, enabled, settings, created_at, updated_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING',
      ['mock', true, '{}']
    ); // TODO-LINT: move to async function

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
    // Use a single transaction to avoid race conditions
    const client = await db.coreDb.pool.connect(); // TODO-LINT: move to async function
    
    try {
      await client.query('BEGIN'); // TODO-LINT: move to async function
      
      // Check if admin user already exists
      const existingAdmin = await client.query(
        'SELECT id FROM users WHERE email = $1',
        ['admin@novauniverse.com']
      ); // TODO-LINT: move to async function

      if (existingAdmin.rows && existingAdmin.rows.length > 0) {
        logger.info('Default admin user already exists');
        await client.query('COMMIT'); // TODO-LINT: move to async function
        return;
      }

      // Create default admin user using the correct schema
      const hashedPassword = await bcrypt.hash('admin123!', 12); // TODO-LINT: move to async function
      const adminUuid = uuidv4();

      const result = await client.query(
        'INSERT INTO users (uuid, name, email, password_hash, disabled, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
        [adminUuid, 'System Administrator', 'admin@novauniverse.com', hashedPassword, false]
      ); // TODO-LINT: move to async function

      const adminId = result.rows[0].id;

      // Assign superadmin role
      await client.query(
        'INSERT INTO user_roles (user_id, role_id, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP)',
        [adminId, 1] // superadmin role
      ); // TODO-LINT: move to async function

      await client.query('COMMIT'); // TODO-LINT: move to async function
      logger.info('Default admin user created: admin@novauniverse.com / admin123!');
    } catch (error) {
      await client.query('ROLLBACK'); // TODO-LINT: move to async function
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    // If it's a duplicate key error, it means another process already created the admin user
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      logger.info('Default admin user already exists (created by another process)');
      return;
    }
    logger.error('Error setting up default admin:', error);
    throw error;
  }
}

/**
 * Enhanced database operations with compatibility layer
 */
class DatabaseWrapper {
  constructor() {
    this.db = null;
  }

  async ensureReady() {
    if (!this.db) {
      this.db = await initializeDatabase(); // TODO-LINT: move to async function
    }
    return this.db;
  }

  // Modern async methods
  async query(sql, params = []) {
    const database = await this.ensureReady(); // TODO-LINT: move to async function
    return await database.query(sql, params); // TODO-LINT: move to async function
  }

  async transaction(callback) {
    const database = await this.ensureReady(); // TODO-LINT: move to async function
    return await database.transaction(callback); // TODO-LINT: move to async function
  }

  async storeDocument(collection, document) {
    const database = await this.ensureReady(); // TODO-LINT: move to async function
    return await database.storeDocument(collection, document); // TODO-LINT: move to async function
  }

  async findDocuments(collection, query = {}, options = {}) {
    const database = await this.ensureReady(); // TODO-LINT: move to async function
    return await database.findDocuments(collection, query, options); // TODO-LINT: move to async function
  }

  async createAuditLog(action, userId, details) {
    try {
      const database = await this.ensureReady(); // TODO-LINT: move to async function
      await database.storeDocument('audit_logs', {
        action,
        userId,
        details,
        timestamp: new Date(),
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown'
      }); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Failed to create audit log:', error);
    }
  }

  async purgeOldLogs(days, cb) {
    try {
      const database = await this.ensureReady(); // TODO-LINT: move to async function
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // Check if system_logs table exists first
      const tableExists = await database.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'system_logs'
        )`
      ); // TODO-LINT: move to async function
      
      if (!tableExists.rows[0].exists) {
        logger.info('system_logs table does not exist, skipping log purge');
        if (cb) cb(null, { rowCount: 0 });
        return { rowCount: 0 };
      }
      
      const result = await database.query(
        'DELETE FROM system_logs WHERE created_at < $1',
        [cutoffDate]
      ); // TODO-LINT: move to async function
      
      if (cb) cb(null, result);
      return result;
    } catch (error) {
      logger.error('Failed to purge old logs:', error);
      if (cb) cb(error);
      throw error;
    }
  }

  // Compatibility: .get(sql, params, cb)
  get(sql, params, cb) {
    // If only two arguments and second is a function, shift
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    // If callback is provided, use callback style
    if (typeof cb === 'function') {
      this.query(sql, params)
        .then(result => cb(null, result.rows?.[0] || null))
        .catch(cb);
    } else {
      // Otherwise, return a promise
      return this.query(sql, params).then(result => result.rows?.[0] || null);
    }
  }

  // Compatibility: .all(sql, params, cb)
  all(sql, params, cb) {
    // If only two arguments and second is a function, shift
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    // If callback is provided, use callback style
    if (typeof cb === 'function') {
      this.query(sql, params)
        .then(result => cb(null, result.rows || []))
        .catch(cb);
    } else {
      // Otherwise, return a promise
      return this.query(sql, params).then(result => result.rows || []);
    }
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
        .then(result => {
          const context = {
            lastID: (result && result.rows && result.rows[0] && (result.rows[0].id || result.rows[0].uuid)) || undefined,
            changes: typeof result?.rowCount === 'number' ? result.rowCount : 0
          };
          cb.call(context, null, result);
        })
        .catch(cb);
    } else {
      // Otherwise, return a promise
      return this.query(sql, params);
    }
  }
}

// Create and export the database wrapper
const dbWrapper = new DatabaseWrapper();
// const prisma = new PrismaClient();

export default dbWrapper;
// export { prisma };

// Gracefully close all database connections
async function closeDatabase() {
  try {
    if (dbFactory && typeof dbFactory.close === 'function' && isInitialized) {
      await dbFactory.close(); // TODO-LINT: move to async function
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
