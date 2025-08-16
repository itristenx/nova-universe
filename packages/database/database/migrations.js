// database/migrations.js
// Database migration manager for schema updates and data migration
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { PostgreSQLManager } from './postgresql.js';
import { logger } from '../nova-api/logger.js';
import sqlite3pkg from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlite3 = sqlite3pkg.verbose();

export class MigrationManager {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../nova-api/migrations');
    this.postgresql = null;
  }

  /**
   * Initialize PostgreSQL connection for migrations
   */
  async initialize() {
    if (!this.postgresql) {
      this.postgresql = new PostgreSQLManager();
      await this.postgresql.initialize();
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations() {
    await this.initialize();

    try {
      logger.info('Running database migrations...');

      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Get list of migration files
      const migrationFiles = await this.getMigrationFiles();

      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      const appliedSet = new Set(appliedMigrations.map((m) => m.filename));

      // Run pending migrations
      for (const file of migrationFiles) {
        if (!appliedSet.has(file)) {
          await this.runMigration(file);
        } else {
          logger.debug(`Migration already applied: ${file}`);
        }
      }

      logger.info('Database migrations completed successfully');
    } catch (error) {
      logger.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Create migrations tracking table
   */
  async createMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await this.postgresql.query(sql);
    logger.debug('Migrations table ready');
  }

  /**
   * Get list of migration files
   */
  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files.filter((file) => file.endsWith('.sql')).sort();
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.warn('Migrations directory not found, creating default migrations...');
        await this.createDefaultMigrations();
        return await this.getMigrationFiles();
      }
      throw error;
    }
  }

  /**
   * Get applied migrations from database
   */
  async getAppliedMigrations() {
    try {
      const result = await this.postgresql.query(
        'SELECT filename, checksum, applied_at FROM _migrations ORDER BY applied_at',
      );
      return result.rows;
    } catch (error) {
      logger.error('Error fetching applied migrations:', error);
      return [];
    }
  }

  /**
   * Run a single migration
   */
  async runMigration(filename) {
    const filePath = path.join(this.migrationsPath, filename);

    try {
      logger.info(`Running migration: ${filename}`);

      // Read migration file
      const sql = await fs.readFile(filePath, 'utf8');

      // Calculate checksum
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');

      // Execute migration in transaction
      await this.postgresql.transaction(async (client) => {
        // Split SQL into statements and execute each
        const statements = sql
          .split(';')
          .map((stmt) => stmt.trim())
          .filter((stmt) => stmt.length > 0);

        for (const statement of statements) {
          await client.query(statement);
        }

        // Record migration as applied
        await client.query('INSERT INTO _migrations (filename, checksum) VALUES ($1, $2)', [
          filename,
          checksum,
        ]);
      });

      logger.info(`Migration completed: ${filename}`);
    } catch (error) {
      logger.error(`Migration failed: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Create a new migration file
   */
  async createMigration(name) {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const filename = `${timestamp}_${name}.sql`;
    const filePath = path.join(this.migrationsPath, filename);

    const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your SQL migration here
-- Example:
-- CREATE TABLE example (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Add indexes
-- CREATE INDEX idx_example_name ON example(name);

-- Don't forget to add rollback instructions in comments
-- Rollback: DROP TABLE IF EXISTS example;
`;

    try {
      await fs.mkdir(this.migrationsPath, { recursive: true });
      await fs.writeFile(filePath, template);
      logger.info(`Migration created: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error('Error creating migration:', error);
      throw error;
    }
  }

  /**
   * Create default migrations for Nova Universe schema
   */
  async createDefaultMigrations() {
    await fs.mkdir(this.migrationsPath, { recursive: true });

    // Main schema migration
    const initMigration = `-- Initial Nova Universe Schema
-- Created: ${new Date().toISOString()}

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255),
  disabled BOOLEAN DEFAULT false,
  isDefault BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- Role permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id)
);

-- Passkeys table for WebAuthn
CREATE TABLE IF NOT EXISTS passkeys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER DEFAULT 0,
  transports TEXT,
  device_type VARCHAR(50),
  backed_up BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP
);

-- Logs table
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(100),
  name VARCHAR(255),
  email VARCHAR(255),
  title VARCHAR(500),
  system VARCHAR(255),
  urgency VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email_status VARCHAR(50),
);

-- Configuration table
CREATE TABLE IF NOT EXISTS config (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kiosks table
CREATE TABLE IF NOT EXISTS kiosks (
  id VARCHAR(255) PRIMARY KEY,
  last_seen TIMESTAMP,
  version VARCHAR(50),
  active BOOLEAN DEFAULT false,
  logo_url TEXT,
  bg_url TEXT,
  status_enabled BOOLEAN DEFAULT false,
  current_status VARCHAR(100),
  open_msg TEXT,
  closed_msg TEXT,
  error_msg TEXT,
  meeting_msg TEXT,
  brb_msg TEXT,
  lunch_msg TEXT,
  unavailable_msg TEXT,
  schedule JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  level VARCHAR(50) DEFAULT 'info',
  active BOOLEAN DEFAULT true,
  type VARCHAR(50) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Directory integrations table
CREATE TABLE IF NOT EXISTS directory_integrations (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(100) NOT NULL,
  settings JSONB,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  size_bytes INTEGER,
  mime_type VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kiosk activations table
CREATE TABLE IF NOT EXISTS kiosk_activations (
  id VARCHAR(255) PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  qr_code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SSO configurations table
CREATE TABLE IF NOT EXISTS sso_configurations (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  configuration JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin PINs table
CREATE TABLE IF NOT EXISTS admin_pins (
  id INTEGER PRIMARY KEY DEFAULT 1,
  global_pin VARCHAR(255),
  kiosk_pins JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_isDefault ON users(isDefault);
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON passkeys(credential_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_ticket_id ON logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_kiosks_active ON kiosks(active);
CREATE INDEX IF NOT EXISTS idx_notifications_active ON notifications(active);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_kiosk_activations_expires ON kiosk_activations(expires_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kiosks_updated_at BEFORE UPDATE ON kiosks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const initPath = path.join(this.migrationsPath, `${timestamp}_init_schema.sql`);

    await fs.writeFile(initPath, initMigration);
    logger.info('Default migration created: init_schema.sql');
  }

  /**
   * Migrate data from SQLite to PostgreSQL/MongoDB
   */
  async migrateFromSQLite(sqlitePath, options = {}) {
    const { targetDatabases = ['postgresql', 'mongodb'], dryRun = false, force = false } = options;

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(sqlitePath);
      const results = {};

      Promise.resolve()
        .then(async () => {
          await this.initialize();

          // Tables to migrate to PostgreSQL
          const pgTables = [
            'users',
            'roles',
            'permissions',
            'user_roles',
            'role_permissions',
            'passkeys',
            'logs',
            'config',
            'kiosks',
            'feedback',
            'notifications',
            'directory_integrations',
            'assets',
            'kiosk_activations',
            'sso_configurations',
            'admin_pins',
          ];

          if (targetDatabases.includes('postgresql')) {
            results.postgresql = {};

            for (const table of pgTables) {
              try {
                results.postgresql[table] = await this.migrateSQLiteTable(db, table, 'postgresql', {
                  dryRun,
                  force,
                });
              } catch (error) {
                results.postgresql[table] = { error: error.message, recordsProcessed: 0 };
              }
            }
          }

          if (targetDatabases.includes('mongodb')) {
            results.mongodb = {};
            // MongoDB migration would handle preferences, analytics, etc.
            // For now, we'll just note it's available
            results.mongodb.info = { message: 'MongoDB migration structure ready' };
          }

          db.close();
          resolve(results);
        })
        .catch(reject);
    });
  }

  /**
   * Migrate a single SQLite table to PostgreSQL
   */
  async migrateSQLiteTable(sqliteDb, tableName, target, options = {}) {
    const { dryRun = false, force = false } = options;

    return new Promise((resolve, reject) => {
      // Check if table exists in SQLite
      sqliteDb.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [tableName],
        async (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          if (!row) {
            resolve({ recordsProcessed: 0, warnings: [`Table ${tableName} not found in SQLite`] });
            return;
          }

          // Get all records from SQLite table
          sqliteDb.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
            if (err) {
              reject(err);
              return;
            }

            try {
              if (dryRun) {
                resolve({ recordsProcessed: rows.length, dryRun: true });
                return;
              }

              if (target === 'postgresql' && rows.length > 0) {
                // Clear existing data if force flag is set
                if (force) {
                  await this.postgresql.query(`DELETE FROM ${tableName}`);
                }

                // Get column information
                const firstRow = rows[0];
                const columns = Object.keys(firstRow);
                const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
                const columnNames = columns.join(', ');

                // Insert data in batches
                await this.postgresql.transaction(async (client) => {
                  for (const row of rows) {
                    const values = columns.map((col) => row[col]);
                    await client.query(
                      `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                      values,
                    );
                  }
                });
              }

              resolve({ recordsProcessed: rows.length });
            } catch (error) {
              reject(error);
            }
          });
        },
      );
    });
  }
}
