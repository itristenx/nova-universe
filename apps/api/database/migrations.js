// Migration system for PostgreSQL
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';
import postgresManager from './postgresql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Migration Manager
 * Handles schema migrations and data migration from SQLite
 */
class MigrationManager {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations/postgresql');
    this.seedsPath = path.join(__dirname, '../migrations/seeds');
  }

  /**
   * Initialize migration system
   */
  async initialize() {
    await this.ensureMigrationsTable();
    await this.ensureMigrationsDirectory();
  }

  /**
   * Create migrations table if it doesn't exist
   */
  async ensureMigrationsTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER,
        checksum VARCHAR(64)
      );
      
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
    `;

    await postgresManager.query(sql);
    logger.debug('✅ Migration tracking table ensured');
  }

  /**
   * Ensure migrations directory exists
   */
  async ensureMigrationsDirectory() {
    try {
      await fs.access(this.migrationsPath);
    } catch (error) {
      await fs.mkdir(this.migrationsPath, { recursive: true });
      logger.info(`📁 Created migrations directory: ${this.migrationsPath}`);
    }

    try {
      await fs.access(this.seedsPath);
    } catch (error) {
      await fs.mkdir(this.seedsPath, { recursive: true });
      logger.info(`📁 Created seeds directory: ${this.seedsPath}`);
    }
  }

  /**
   * Get all migration files
   */
  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      return files
        .filter((file) => file.endsWith('.sql'))
        .sort()
        .map((file) => {
          const version = file.replace('.sql', '');
          return {
            version,
            name: this.extractMigrationName(file),
            filename: file,
            path: path.join(this.migrationsPath, file),
          };
        });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Extract migration name from filename
   */
  extractMigrationName(filename) {
    // Extract name from format: 001_create_users_table.sql
    const parts = filename.replace('.sql', '').split('_');
    return parts
      .slice(1)
      .join(' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Get executed migrations
   */
  async getExecutedMigrations() {
    try {
      const result = await postgresManager.query(
        'SELECT version FROM schema_migrations ORDER BY version',
      );
      return result.rows.map((row) => row.version);
    } catch (error) {
      logger.error('❌ Error getting executed migrations:', error.message);
      return [];
    }
  }

  /**
   * Calculate file checksum
   */
  async calculateChecksum(filePath) {
    const crypto = await import('crypto');
    const content = await fs.readFile(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Run pending migrations
   */
  async runMigrations() {
    logger.info('🔄 Checking for pending migrations...');

    const migrationFiles = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();

    const pendingMigrations = migrationFiles.filter(
      (migration) => !executedMigrations.includes(migration.version),
    );

    if (pendingMigrations.length === 0) {
      logger.info('✅ No pending migrations');
      return;
    }

    logger.info(`📋 Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      await this.runMigration(migration);
    }

    logger.info('✅ All migrations completed successfully');
  }

  /**
   * Run a single migration
   */
  async runMigration(migration) {
    const startTime = Date.now();

    try {
      logger.info(`▶️  Running migration: ${migration.version} - ${migration.name}`);

      // Read migration file
      const sql = await fs.readFile(migration.path, 'utf8');
      const checksum = await this.calculateChecksum(migration.path);

      // Execute migration in transaction
      await postgresManager.transaction(async (client) => {
        // Execute the migration SQL
        await postgresManager.executeSQL(sql);

        // Record migration
        const executionTime = Date.now() - startTime;
        await postgresManager.query(
          `INSERT INTO schema_migrations (version, name, execution_time_ms, checksum) 
           VALUES ($1, $2, $3, $4)`,
          [migration.version, migration.name, executionTime, checksum],
          { client },
        );
      });

      const executionTime = Date.now() - startTime;
      logger.info(`✅ Migration completed: ${migration.version} (${executionTime}ms)`);
    } catch (error) {
      logger.error(`❌ Migration failed: ${migration.version}`, error.message);
      throw new Error(`Migration ${migration.version} failed: ${error.message}`);
    }
  }

  /**
   * Rollback last migration
   */
  async rollbackLastMigration() {
    const result = await postgresManager.query(
      'SELECT * FROM schema_migrations ORDER BY executed_at DESC LIMIT 1',
    );

    if (result.rows.length === 0) {
      logger.info('ℹ️  No migrations to rollback');
      return;
    }

    const migration = result.rows[0];
    logger.warn(`⚠️  Rolling back migration: ${migration.version} - ${migration.name}`);

    // Look for rollback file
    const rollbackFile = path.join(this.migrationsPath, `${migration.version}_rollback.sql`);

    try {
      const rollbackSQL = await fs.readFile(rollbackFile, 'utf8');

      await postgresManager.transaction(async (client) => {
        await postgresManager.executeSQL(rollbackSQL);
        await postgresManager.query(
          'DELETE FROM schema_migrations WHERE version = $1',
          [migration.version],
          { client },
        );
      });

      logger.info(`✅ Rollback completed: ${migration.version}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        logger.error(`❌ Rollback file not found: ${rollbackFile}`);
        logger.error('Manual rollback required');
      } else {
        logger.error(`❌ Rollback failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create new migration file
   */
  async createMigration(name) {
    if (!name) {
      throw new Error('Migration name is required');
    }

    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
    const filename = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}.sql`;
    const filePath = path.join(this.migrationsPath, filename);

    const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE INDEX idx_example_name ON example(name);
`;

    await fs.writeFile(filePath, template);
    logger.info(`📝 Created migration file: ${filename}`);

    return filePath;
  }

  /**
   * Run database seeds
   */
  async runSeeds() {
    logger.info('🌱 Running database seeds...');

    try {
      const seedFiles = await fs.readdir(this.seedsPath);
      const sqlSeeds = seedFiles.filter((file) => file.endsWith('.sql')).sort();

      for (const seedFile of sqlSeeds) {
        const seedPath = path.join(this.seedsPath, seedFile);
        const sql = await fs.readFile(seedPath, 'utf8');

        logger.info(`🌱 Running seed: ${seedFile}`);
        await postgresManager.executeSQL(sql);
      }

      logger.info('✅ Database seeds completed');
    } catch (error) {
      logger.error('❌ Seed execution failed:', error.message);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getStatus() {
    const migrationFiles = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();

    return {
      total_migrations: migrationFiles.length,
      executed_migrations: executedMigrations.length,
      pending_migrations: migrationFiles.length - executedMigrations.length,
      migrations: migrationFiles.map((migration) => ({
        ...migration,
        executed: executedMigrations.includes(migration.version),
      })),
    };
  }
}

// Export singleton instance
const migrationManager = new MigrationManager();
export default migrationManager;
export { MigrationManager };
