#!/usr/bin/env node
/**
 * Database Migration Script for Nova Universe
 * Migrates data from SQLite to PostgreSQL/MongoDB
 *
 * Usage:
 *   node migrate-database.js [options]
 *
 * Options:
 *   --source <path>     Source SQLite database path (default: ./log.sqlite)
 *   --target <type>     Target database type (postgresql, mongodb, both)
 *   --dry-run           Show what would be migrated without making changes
 *   --force             Overwrite existing data in target database
 *   --backup            Create backup before migration
 *   --help              Show this help message
 */

import { Command } from 'commander';
import { logger } from '../../../apps/api/logger.js';
import { MigrationManager } from '../../../apps/api/database/migrations.js';
import { DatabaseFactory } from '../../../apps/api/database/factory.js';
import fs from 'fs';

const program = new Command();

// CLI Configuration
program
  .name('migrate-database')
  .description('Migrate Nova Universe data from SQLite to PostgreSQL/MongoDB')
  .version('1.0.0')
  .option('-s, --source <path>', 'Source SQLite database path', './nova-api/log.sqlite')
  .option('-t, --target <type>', 'Target database type (postgresql, mongodb, both)', 'both')
  .option('-d, --dry-run', 'Show what would be migrated without making changes', false)
  .option('-f, --force', 'Overwrite existing data in target database', false)
  .option('-b, --backup', 'Create backup before migration', true)
  .option('--no-backup', 'Skip backup creation')
  .helpOption('-h, --help', 'Show this help message');

program.parse();
const options = program.opts();

/**
 * Main migration function
 */
async function main() {
  try {
    logger.info('Starting Nova Universe database migration...');
    logger.info('Options:', options);

    // Initialize migration manager
    const migrationManager = new MigrationManager();
    const dbFactory = new DatabaseFactory();

    // Initialize target database
    await dbFactory.initialize();
    logger.info('Target database initialized');

    // Run database migrations first
    logger.info('Running database schema migrations...');
    await migrationManager.runMigrations();

    // Create backup if requested
    if (options.backup && !options.dryRun) {
      await createBackup(options.source);
    }

    // Perform data migration
    logger.info('Starting data migration...');
    const migrationResult = await migrationManager.migrate({
      targetDatabases: options.target === 'both' ? ['postgresql', 'mongodb'] : [options.target],
      dryRun: options.dryRun,
      force: options.force,
    });

    // Display results
    displayMigrationResults(migrationResult);

    if (!options.dryRun) {
      logger.info('Migration completed successfully!');
      logger.info('');
      logger.info('Next steps:');
      logger.info('1. Update your .env file with database connection details');
      logger.info('2. Test the application with: npm start');
      logger.info('3. Verify data integrity');
      logger.info('4. Consider removing the old SQLite database after verification');
    }
  } catch (_error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Create a backup of the source database
 */
async function createBackup(sourcePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${sourcePath}.backup.${timestamp}`;

  logger.info(`Creating backup: ${backupPath}`);

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(sourcePath);
    const writeStream = fs.createWriteStream(backupPath);

    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('close', () => {
      logger.info('Backup created successfully');
      resolve(backupPath);
    });

    readStream.pipe(writeStream);
  });
}

/**
 * Display migration results
 */
function displayMigrationResults(results) {
  logger.info('');
  logger.info('Migration Results:');
  logger.info('='.repeat(50));

  for (const [database, dbResults] of Object.entries(results)) {
    logger.info(`\n${database.toUpperCase()}:`);

    for (const [table, tableResult] of Object.entries(dbResults)) {
      const status = tableResult.error ? '❌ FAILED' : '✅ SUCCESS';
      const count = tableResult.recordsProcessed || 0;

      logger.info(`  ${table}: ${status} (${count} records)`);

      if (tableResult.error) {
        logger.error(`    Error: ${tableResult.error}`);
      }

      if (tableResult.warnings && tableResult.warnings.length > 0) {
        tableResult.warnings.forEach((warning) => {
          logger.warn(`    Warning: ${warning}`);
        });
      }
    }
  }

  // Summary
  const totalTables = Object.values(results).reduce((acc, db) => acc + Object.keys(db).length, 0);
  const failedTables = Object.values(results).reduce((acc, db) => {
    return acc + Object.values(db).filter((table) => table.error).length;
  }, 0);

  logger.info('');
  logger.info(`Summary: ${totalTables - failedTables}/${totalTables} tables migrated successfully`);

  if (failedTables > 0) {
    logger.warn(`${failedTables} tables had errors - please review the logs above`);
  }
}

/**
 * Interactive migration setup
 */
async function interactiveSetup() {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  try {
    logger.info('Nova Universe Database Migration Setup');
    logger.info('=====================================');
    logger.info('');

    // Check for existing .env file
    const envExists = fs.existsSync('.env');
    if (!envExists) {
      logger.info("No .env file found. Let's create one...");

      const setupEnv = await question(
        'Would you like to set up database configuration now? (y/N): ',
      );
      if (setupEnv.toLowerCase() === 'y') {
        await setupEnvironment(question);
      } else {
        logger.info('Please copy .env.example to .env and configure your database settings');
        logger.info('Then run this migration script again');
        return;
      }
    }

    // Confirm migration
    logger.info('');
    logger.info('Migration Configuration:');
    logger.info(`Source: ${options.source}`);
    logger.info(`Target: ${options.target}`);
    logger.info(`Dry run: ${options.dryRun ? 'Yes' : 'No'}`);
    logger.info(`Backup: ${options.backup ? 'Yes' : 'No'}`);
    logger.info('');

    const confirm = await question('Proceed with migration? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      logger.info('Migration cancelled');
      return;
    }

    await main();
  } finally {
    rl.close();
  }
}

/**
 * Setup environment configuration
 */
async function setupEnvironment(question) {
  const config = {};

  // Database selection
  const dbType = (await question('Database type (postgresql/mongodb/both) [both]: ')) || 'both';
  config.PRIMARY_DATABASE = dbType === 'both' ? 'postgresql,mongodb' : dbType;

  if (dbType === 'postgresql' || dbType === 'both') {
    // PostgreSQL configuration
    config.POSTGRES_HOST = (await question('PostgreSQL host [localhost]: ')) || 'localhost';
    config.POSTGRES_PORT = (await question('PostgreSQL port [5432]: ')) || '5432';
    config.POSTGRES_DB =
      (await question('PostgreSQL database [nova_universe]: ')) || 'nova_universe';
    config.POSTGRES_USER = (await question('PostgreSQL user [nova_user]: ')) || 'nova_user';
    config.POSTGRES_PASSWORD = await question('PostgreSQL password: ');
  }

  if (dbType === 'mongodb' || dbType === 'both') {
    // MongoDB configuration
    config.MONGO_URI =
      (await question('MongoDB URI [mongodb://localhost:27017/nova_universe]: ')) ||
      'mongodb://localhost:27017/nova_universe';
    config.MONGO_USER = (await question('MongoDB user [nova_user]: ')) || 'nova_user';
    config.MONGO_PASSWORD = await question('MongoDB password: ');
  }

  // Admin user
  config.ADMIN_EMAIL = (await question('Admin email [admin@example.com]: ')) || 'admin@example.com';
  config.ADMIN_PASSWORD = (await question('Admin password [admin123!]: ')) || 'admin123!';

  // Generate secrets
  config.JWT_SECRET = generateSecret(64);
  config.SESSION_SECRET = generateSecret(64);

  // Write .env file
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync('.env', envContent);
  logger.info('.env file created successfully');
}

/**
 * Generate a random secret
 */
function generateSecret(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Run the migration
if (process.argv.includes('--interactive')) {
  interactiveSetup().catch((error) => {
    logger.error('Interactive setup failed:', error);
    process.exit(1);
  });
} else {
  main().catch((error) => {
    logger.error('Migration failed:', error);
    process.exit(1);
  });
}
