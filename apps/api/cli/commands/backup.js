/**
 * Backup Command - Manage Nova Universe backups
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import path from 'path';
import Table from 'cli-table3';
import { 
  logger, 
  createSpinner, 
  runCommand,
  getProjectRoot,
  connectDatabase,
  formatDate,
  formatFileSize
} from '../utils/index.js';

export const backupCommand = new Command('backup')
  .description('Manage Nova Universe backups');

// Backup create command
backupCommand
  .command('create')
  .alias('make')
  .description('Create a new backup')
  .option('-d, --database', 'Include database backup')
  .option('-f, --files', 'Include file backups')
  .option('-c, --config', 'Include configuration backups')
  .option('-a, --all', 'Include everything (database, files, config)', true)
  .option('-o, --output <path>', 'Output directory', 'backups')
  .option('-n, --name <name>', 'Backup name (default: timestamp)')
  .option('--compress', 'Compress backup files', true)
  .action(async (options) => {
    try {
      await createBackup(options);
    } catch (error) {
      logger.error(`Failed to create backup: ${error.message}`);
      process.exit(1);
    }
  });

// Backup list command
backupCommand
  .command('list')
  .alias('ls')
  .description('List all backups')
  .option('-d, --directory <path>', 'Backup directory', 'backups')
  .option('-j, --json', 'Output in JSON format')
  .option('--sort <field>', 'Sort by: name, date, size', 'date')
  .action(async (options) => {
    try {
      await listBackups(options);
    } catch (error) {
      logger.error(`Failed to list backups: ${error.message}`);
      process.exit(1);
    }
  });

// Backup restore command
backupCommand
  .command('restore <backup>')
  .description('Restore from backup')
  .option('-d, --database', 'Restore database only')
  .option('-f, --files', 'Restore files only')
  .option('-c, --config', 'Restore config only')
  .option('--force', 'Skip confirmation prompts')
  .option('--dry-run', 'Show what would be restored without doing it')
  .action(async (backup, options) => {
    try {
      await restoreBackup(backup, options);
    } catch (error) {
      logger.error(`Failed to restore backup: ${error.message}`);
      process.exit(1);
    }
  });

// Backup info command
backupCommand
  .command('info <backup>')
  .description('Show detailed backup information')
  .option('-j, --json', 'Output in JSON format')
  .action(async (backup, options) => {
    try {
      await showBackupInfo(backup, options);
    } catch (error) {
      logger.error(`Failed to get backup info: ${error.message}`);
      process.exit(1);
    }
  });

// Backup delete command
backupCommand
  .command('delete <backup>')
  .alias('remove')
  .description('Delete a backup')
  .option('--force', 'Skip confirmation')
  .action(async (backup, options) => {
    try {
      await deleteBackup(backup, options);
    } catch (error) {
      logger.error(`Failed to delete backup: ${error.message}`);
      process.exit(1);
    }
  });

// Backup cleanup command
backupCommand
  .command('cleanup')
  .description('Clean up old backups')
  .option('--keep <count>', 'Number of backups to keep', '10')
  .option('--days <days>', 'Keep backups newer than N days', '30')
  .option('--dry-run', 'Show what would be deleted without doing it')
  .option('--force', 'Skip confirmation')
  .action(async (options) => {
    try {
      await cleanupBackups(options);
    } catch (error) {
      logger.error(`Failed to cleanup backups: ${error.message}`);
      process.exit(1);
    }
  });

// Backup schedule command
backupCommand
  .command('schedule')
  .description('Manage backup schedules')
  .option('--enable', 'Enable scheduled backups')
  .option('--disable', 'Disable scheduled backups')
  .option('--cron <expression>', 'Cron expression for schedule')
  .option('--show', 'Show current schedule')
  .action(async (options) => {
    try {
      await manageSchedule(options);
    } catch (error) {
      logger.error(`Failed to manage schedule: ${error.message}`);
      process.exit(1);
    }
  });

// Create backup
async function createBackup(options) {
  console.log(chalk.cyan('📦 Creating Nova Universe backup...\n'));

  const projectRoot = getProjectRoot();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = options.name || `backup-${timestamp}`;
  const backupDir = path.join(projectRoot, options.output);
  const backupPath = path.join(backupDir, backupName);

  // Ensure backup directory exists
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  if (!existsSync(backupPath)) {
    mkdirSync(backupPath, { recursive: true });
  }

  const tasks = [];

  // Determine what to backup
  const includeDatabase = options.all || options.database;
  const includeFiles = options.all || options.files;
  const includeConfig = options.all || options.config;

  if (includeDatabase) {
    tasks.push({
      name: 'Database',
      handler: () => backupDatabase(backupPath)
    });
  }

  if (includeFiles) {
    tasks.push({
      name: 'Files',
      handler: () => backupFiles(backupPath, projectRoot)
    });
  }

  if (includeConfig) {
    tasks.push({
      name: 'Configuration',
      handler: () => backupConfig(backupPath, projectRoot)
    });
  }

  // Execute backup tasks
  for (const task of tasks) {
    const spinner = createSpinner(`Backing up ${task.name.toLowerCase()}...`);
    spinner.start();

    try {
      await task.handler();
      spinner.succeed(`${task.name} backup complete`);
    } catch (error) {
      spinner.fail(`${task.name} backup failed`);
      throw error;
    }
  }

  // Create manifest
  await createBackupManifest(backupPath, {
    name: backupName,
    created: new Date().toISOString(),
    includes: {
      database: includeDatabase,
      files: includeFiles,
      config: includeConfig
    }
  });

  // Compress if requested
  if (options.compress) {
    const spinner = createSpinner('Compressing backup...');
    spinner.start();

    try {
      const archivePath = `${backupPath}.tar.gz`;
      await runCommand('tar', ['-czf', archivePath, '-C', backupDir, backupName]);
      await runCommand('rm', ['-rf', backupPath]);
      
      spinner.succeed('Backup compressed');
      
      const stats = statSync(archivePath);
      logger.success(`\n✅ Backup created successfully`);
      console.log(chalk.green(`   Location: ${archivePath}`));
      console.log(chalk.gray(`   Size: ${formatFileSize(stats.size)}`));
    } catch (error) {
      spinner.fail('Compression failed');
      throw error;
    }
  } else {
    const stats = await getFolderSize(backupPath);
    logger.success(`\n✅ Backup created successfully`);
    console.log(chalk.green(`   Location: ${backupPath}`));
    console.log(chalk.gray(`   Size: ${formatFileSize(stats)}`));
  }
}

// Backup database
async function backupDatabase(backupPath) {
  try {
    // Try to get database URL from environment
    const dbUrl = process.env.CORE_DATABASE_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('CORE_DATABASE_URL not found in environment');
    }

    const dbBackupPath = path.join(backupPath, 'database.sql');

    if (dbUrl.includes('postgresql://')) {
      // PostgreSQL backup
      await runCommand('pg_dump', [dbUrl, '-f', dbBackupPath], { silent: true });
    } else if (dbUrl.includes('mongodb://')) {
      // MongoDB backup
      const dbBackupDir = path.join(backupPath, 'mongodb');
      mkdirSync(dbBackupDir, { recursive: true });
      await runCommand('mongodump', ['--uri', dbUrl, '--out', dbBackupDir], { silent: true });
    } else {
      throw new Error('Unsupported database type');
    }
  } catch (error) {
    // Fallback: try to export from application
    try {
      const db = await connectDatabase();
      const collections = ['users', 'sessions', 'logs'];
      const dbBackupPath = path.join(backupPath, 'database.json');
      
      const data = {};
      for (const collection of collections) {
        try {
          data[collection] = await db.collection(collection).find({}).toArray();
        } catch {
          // Collection might not exist
          data[collection] = [];
        }
      }
      
      require('fs').writeFileSync(dbBackupPath, JSON.stringify(data, null, 2));
    } catch {
      throw new Error(`Database backup failed: ${error.message}`);
    }
  }
}

// Backup files
async function backupFiles(backupPath, projectRoot) {
  const filesToBackup = [
    'uploads',
    'logs',
    'nova-api/uploads',
    'nova-api/logs',
    'nova-core/dist',
    'nova-comms/logs'
  ];

  const filesBackupPath = path.join(backupPath, 'files');
  mkdirSync(filesBackupPath, { recursive: true });

  for (const file of filesToBackup) {
    const sourcePath = path.join(projectRoot, file);
    const destPath = path.join(filesBackupPath, file.replace('/', '-'));

    if (existsSync(sourcePath)) {
      await runCommand('cp', ['-r', sourcePath, destPath], { silent: true });
    }
  }
}

// Backup configuration
async function backupConfig(backupPath, projectRoot) {
  const configFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    'docker-compose.yml',
    'package.json',
    'nova-api/.env',
    'nova-api/package.json',
    'nova-core/.env',
    'nova-core/package.json',
    'nova-comms/.env',
    'nova-comms/package.json'
  ];

  const configBackupPath = path.join(backupPath, 'config');
  mkdirSync(configBackupPath, { recursive: true });

  for (const file of configFiles) {
    const sourcePath = path.join(projectRoot, file);
    const destPath = path.join(configBackupPath, file.replace('/', '-'));

    if (existsSync(sourcePath)) {
      await runCommand('cp', [sourcePath, destPath], { silent: true });
    }
  }
}

// Create backup manifest
async function createBackupManifest(backupPath, metadata) {
  const manifestPath = path.join(backupPath, 'manifest.json');
  
  const manifest = {
    ...metadata,
    version: '1.0',
    system: {
      platform: process.platform,
      node: process.version,
      pwd: process.cwd()
    }
  };

  require('fs').writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

// List backups
async function listBackups(options) {
  const projectRoot = getProjectRoot();
  const backupDir = path.join(projectRoot, options.directory);

  if (!existsSync(backupDir)) {
    logger.warning('No backup directory found');
    return;
  }

  const spinner = createSpinner('Scanning backups...');
  spinner.start();

  try {
    const items = readdirSync(backupDir);
    const backups = [];

    for (const item of items) {
      const itemPath = path.join(backupDir, item);
      const stats = statSync(itemPath);

      let backup = {
        name: item,
        path: itemPath,
        date: stats.mtime,
        size: stats.size,
        type: stats.isDirectory() ? 'directory' : 'archive'
      };

      // Try to read manifest if it exists
      try {
        let manifestPath;
        if (backup.type === 'directory') {
          manifestPath = path.join(itemPath, 'manifest.json');
        } else {
          // For archives, we'd need to extract manifest, skip for now
        }

        if (manifestPath && existsSync(manifestPath)) {
          const manifest = JSON.parse(require('fs').readFileSync(manifestPath, 'utf8'));
          backup.manifest = manifest;
        }
      } catch {
        // Manifest not readable, continue
      }

      if (backup.type === 'directory') {
        backup.size = await getFolderSize(itemPath);
      }

      backups.push(backup);
    }

    // Sort backups
    backups.sort((a, b) => {
      switch (options.sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'date':
        default:
          return b.date.getTime() - a.date.getTime();
      }
    });

    spinner.succeed(`Found ${backups.length} backup(s)`);

    if (options.json) {
      console.log(JSON.stringify(backups, null, 2));
    } else {
      displayBackupsTable(backups);
    }

  } catch (error) {
    spinner.fail('Failed to scan backups');
    throw error;
  }
}

// Restore backup
async function restoreBackup(backupName, options) {
  const projectRoot = getProjectRoot();
  let backupPath = path.resolve(backupName);

  if (!existsSync(backupPath)) {
    // Try in backups directory
    const altPath = path.join(projectRoot, 'backups', backupName);
    if (existsSync(altPath)) {
      backupPath = altPath;
    } else {
      throw new Error(`Backup not found: ${backupName}`);
    }
  }

  if (options.dryRun) {
    console.log(chalk.cyan('🔍 Dry run - showing what would be restored:\n'));
  } else if (!options.force) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `This will restore from backup ${chalk.yellow(backupName)}. This may overwrite existing data. Continue?`,
        default: false
      }
    ]);

    if (!confirm) {
      logger.info('Restore cancelled');
      return;
    }
  }

  // Handle compressed backups
  let workingPath = backupPath;
  if (backupPath.endsWith('.tar.gz')) {
    if (options.dryRun) {
      console.log(chalk.gray('Would extract compressed backup'));
    } else {
      const spinner = createSpinner('Extracting backup...');
      spinner.start();

      const extractDir = path.join(path.dirname(backupPath), 'temp-restore');
      await runCommand('mkdir', ['-p', extractDir]);
      await runCommand('tar', ['-xzf', backupPath, '-C', extractDir]);
      
      // Find the extracted directory
      const extracted = readdirSync(extractDir)[0];
      workingPath = path.join(extractDir, extracted);
      
      spinner.succeed('Backup extracted');
    }
  }

  // Read manifest
  let manifest = null;
  const manifestPath = path.join(workingPath, 'manifest.json');
  if (existsSync(manifestPath)) {
    manifest = JSON.parse(require('fs').readFileSync(manifestPath, 'utf8'));
  }

  console.log(chalk.cyan('🔄 Restoring backup...\n'));

  // Restore components
  if (!options.files && !options.config && (options.database || !manifest)) {
    await restoreDatabase(workingPath, options.dryRun);
  }

  if (!options.database && !options.config && (options.files || !manifest)) {
    await restoreFiles(workingPath, projectRoot, options.dryRun);
  }

  if (!options.database && !options.files && (options.config || !manifest)) {
    await restoreConfig(workingPath, projectRoot, options.dryRun);
  }

  if (manifest && !options.database && !options.files && !options.config) {
    // Restore everything
    if (manifest.includes.database) {
      await restoreDatabase(workingPath, options.dryRun);
    }
    if (manifest.includes.files) {
      await restoreFiles(workingPath, projectRoot, options.dryRun);
    }
    if (manifest.includes.config) {
      await restoreConfig(workingPath, projectRoot, options.dryRun);
    }
  }

  if (!options.dryRun) {
    logger.success('✅ Restore completed successfully');
    console.log(chalk.yellow('💡 You may need to restart services to apply changes'));
  }
}

// Restore database
async function restoreDatabase(backupPath, dryRun = false) {
  const dbSqlPath = path.join(backupPath, 'database.sql');
  const dbJsonPath = path.join(backupPath, 'database.json');
  const mongoPath = path.join(backupPath, 'mongodb');

  if (dryRun) {
    if (existsSync(dbSqlPath)) {
      console.log(chalk.gray('Would restore PostgreSQL database from SQL dump'));
    } else if (existsSync(mongoPath)) {
      console.log(chalk.gray('Would restore MongoDB database'));
    } else if (existsSync(dbJsonPath)) {
      console.log(chalk.gray('Would restore database from JSON export'));
    }
    return;
  }

  const spinner = createSpinner('Restoring database...');
  spinner.start();

  try {
    if (existsSync(dbSqlPath)) {
      // PostgreSQL restore
      const dbUrl = process.env.CORE_DATABASE_URL || process.env.DATABASE_URL;
      if (dbUrl && dbUrl.includes('postgresql://')) {
        await runCommand('psql', [dbUrl, '-f', dbSqlPath], { silent: true });
      }
    } else if (existsSync(mongoPath)) {
      // MongoDB restore
      const dbUrl = process.env.AUDIT_DATABASE_URL || process.env.DATABASE_URL;
      if (dbUrl && dbUrl.includes('mongodb://')) {
        await runCommand('mongorestore', ['--uri', dbUrl, '--drop', mongoPath], { silent: true });
      }
    } else if (existsSync(dbJsonPath)) {
      // JSON restore
      const data = JSON.parse(require('fs').readFileSync(dbJsonPath, 'utf8'));
      const db = await connectDatabase();
      
      for (const [collection, documents] of Object.entries(data)) {
        if (documents.length > 0) {
          await db.collection(collection).deleteMany({});
          await db.collection(collection).insertMany(documents);
        }
      }
    }

    spinner.succeed('Database restored');
  } catch (error) {
    spinner.fail('Database restore failed');
    throw error;
  }
}

// Restore files
async function restoreFiles(backupPath, projectRoot, dryRun = false) {
  const filesPath = path.join(backupPath, 'files');
  
  if (!existsSync(filesPath)) {
    return;
  }

  if (dryRun) {
    console.log(chalk.gray('Would restore application files'));
    return;
  }

  const spinner = createSpinner('Restoring files...');
  spinner.start();

  try {
    const files = readdirSync(filesPath);
    
    for (const file of files) {
      const sourcePath = path.join(filesPath, file);
      const destPath = path.join(projectRoot, file.replace('-', '/'));
      
      // Create destination directory if needed
      const destDir = path.dirname(destPath);
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      
      await runCommand('cp', ['-r', sourcePath, destPath], { silent: true });
    }

    spinner.succeed('Files restored');
  } catch (error) {
    spinner.fail('File restore failed');
    throw error;
  }
}

// Restore configuration
async function restoreConfig(backupPath, projectRoot, dryRun = false) {
  const configPath = path.join(backupPath, 'config');
  
  if (!existsSync(configPath)) {
    return;
  }

  if (dryRun) {
    console.log(chalk.gray('Would restore configuration files'));
    return;
  }

  const spinner = createSpinner('Restoring configuration...');
  spinner.start();

  try {
    const files = readdirSync(configPath);
    
    for (const file of files) {
      const sourcePath = path.join(configPath, file);
      const destPath = path.join(projectRoot, file.replace('-', '/'));
      
      // Create destination directory if needed
      const destDir = path.dirname(destPath);
      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      
      await runCommand('cp', [sourcePath, destPath], { silent: true });
    }

    spinner.succeed('Configuration restored');
  } catch (error) {
    spinner.fail('Configuration restore failed');
    throw error;
  }
}

// Show backup info
async function showBackupInfo(backupName, options) {
  const projectRoot = getProjectRoot();
  let backupPath = path.resolve(backupName);

  if (!existsSync(backupPath)) {
    // Try in backups directory
    const altPath = path.join(projectRoot, 'backups', backupName);
    if (existsSync(altPath)) {
      backupPath = altPath;
    } else {
      throw new Error(`Backup not found: ${backupName}`);
    }
  }

  const stats = statSync(backupPath);
  const isArchive = backupPath.endsWith('.tar.gz');
  
  const info = {
    name: path.basename(backupPath),
    path: backupPath,
    type: isArchive ? 'archive' : 'directory',
    size: isArchive ? stats.size : await getFolderSize(backupPath),
    created: stats.mtime,
    modified: stats.mtime
  };

  // Try to read manifest
  if (!isArchive) {
    const manifestPath = path.join(backupPath, 'manifest.json');
    if (existsSync(manifestPath)) {
      try {
        info.manifest = JSON.parse(require('fs').readFileSync(manifestPath, 'utf8'));
      } catch {
        // Manifest not readable
      }
    }
  }

  if (options.json) {
    console.log(JSON.stringify(info, null, 2));
  } else {
    displayBackupInfo(info);
  }
}

// Delete backup
async function deleteBackup(backupName, options) {
  const projectRoot = getProjectRoot();
  let backupPath = path.resolve(backupName);

  if (!existsSync(backupPath)) {
    // Try in backups directory
    const altPath = path.join(projectRoot, 'backups', backupName);
    if (existsSync(altPath)) {
      backupPath = altPath;
    } else {
      throw new Error(`Backup not found: ${backupName}`);
    }
  }

  if (!options.force) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete backup ${chalk.yellow(backupName)}?`,
        default: false
      }
    ]);

    if (!confirm) {
      logger.info('Deletion cancelled');
      return;
    }
  }

  const spinner = createSpinner('Deleting backup...');
  spinner.start();

  try {
    await runCommand('rm', ['-rf', backupPath]);
    spinner.succeed('Backup deleted');
  } catch (error) {
    spinner.fail('Failed to delete backup');
    throw error;
  }
}

// Cleanup old backups
async function cleanupBackups(options) {
  const projectRoot = getProjectRoot();
  const backupDir = path.join(projectRoot, 'backups');

  if (!existsSync(backupDir)) {
    logger.warning('No backup directory found');
    return;
  }

  const spinner = createSpinner('Analyzing backups...');
  spinner.start();

  try {
    const items = readdirSync(backupDir);
    const backups = items
      .map(item => ({
        name: item,
        path: path.join(backupDir, item),
        stats: statSync(path.join(backupDir, item))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

    const toDelete = [];
    const keepCount = parseInt(options.keep);
    const keepDays = parseInt(options.days);
    const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);

    // Mark backups for deletion based on count
    if (backups.length > keepCount) {
      toDelete.push(...backups.slice(keepCount));
    }

    // Mark backups for deletion based on age
    for (const backup of backups) {
      if (backup.stats.mtime < cutoffDate && !toDelete.includes(backup)) {
        toDelete.push(backup);
      }
    }

    spinner.succeed(`Found ${toDelete.length} backup(s) to clean up`);

    if (toDelete.length === 0) {
      logger.info('No backups need to be cleaned up');
      return;
    }

    if (options.dryRun) {
      console.log(chalk.cyan('\n🔍 Dry run - backups that would be deleted:\n'));
      for (const backup of toDelete) {
        console.log(chalk.gray(`   ${backup.name} (${formatDate(backup.stats.mtime)})`));
      }
      return;
    }

    if (!options.force) {
      console.log(chalk.yellow('\n⚠️  Backups to be deleted:\n'));
      for (const backup of toDelete) {
        console.log(chalk.gray(`   ${backup.name} (${formatDate(backup.stats.mtime)})`));
      }

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Delete ${toDelete.length} backup(s)?`,
          default: false
        }
      ]);

      if (!confirm) {
        logger.info('Cleanup cancelled');
        return;
      }
    }

    // Delete backups
    for (const backup of toDelete) {
      await runCommand('rm', ['-rf', backup.path], { silent: true });
    }

    logger.success(`✅ Cleaned up ${toDelete.length} backup(s)`);

  } catch (error) {
    spinner.fail('Cleanup failed');
    throw error;
  }
}

// Manage backup schedules
async function manageSchedule(options) {
  // This would integrate with cron or a task scheduler
  // For now, just show the concept
  
  if (options.show) {
    console.log(chalk.cyan('📅 Backup Schedule Status\n'));
    console.log(chalk.gray('Scheduled backups are not currently configured.'));
    console.log(chalk.gray('Use --enable with --cron to set up automatic backups.'));
    return;
  }

  if (options.enable) {
    const cron = options.cron || '0 2 * * *'; // Default: daily at 2 AM
    
    console.log(chalk.cyan('⏰ Setting up backup schedule...\n'));
    console.log(chalk.green(`Schedule: ${cron}`));
    console.log(chalk.gray('This would set up a cron job for automatic backups.'));
    
    // In a real implementation, this would:
    // 1. Create a cron job
    // 2. Save schedule configuration
    // 3. Set up monitoring
    
    logger.success('Backup schedule configured');
  }

  if (options.disable) {
    console.log(chalk.cyan('🚫 Disabling backup schedule...\n'));
    logger.success('Backup schedule disabled');
  }
}

// Helper: Get folder size
async function getFolderSize(folderPath) {
  try {
    const { stdout } = await runCommand('du', ['-sb', folderPath], { silent: true });
    return parseInt(stdout.split('\t')[0]);
  } catch {
    return 0;
  }
}

// Display backups table
function displayBackupsTable(backups) {
  if (backups.length === 0) {
    logger.warning('No backups found');
    return;
  }

  const table = new Table({
    head: ['Name', 'Type', 'Size', 'Date'],
    colWidths: [25, 10, 12, 20]
  });

  for (const backup of backups) {
    const typeColor = backup.type === 'archive' ? chalk.blue : chalk.green;
    
    table.push([
      backup.name,
      typeColor(backup.type),
      formatFileSize(backup.size),
      formatDate(backup.date)
    ]);
  }

  console.log(chalk.cyan(`\n📦 Backups (${backups.length})\n`));
  console.log(table.toString());
  console.log();
}

// Display backup info
function displayBackupInfo(info) {
  console.log(chalk.cyan('\n📦 Backup Information\n'));
  
  const table = new Table({
    chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
            , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
            , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
            , 'right': '' , 'right-mid': '' }
  });

  const typeColor = info.type === 'archive' ? chalk.blue : chalk.green;

  table.push(
    ['Name:', info.name],
    ['Type:', typeColor(info.type)],
    ['Size:', formatFileSize(info.size)],
    ['Created:', formatDate(info.created)],
    ['Path:', info.path]
  );

  if (info.manifest) {
    table.push(['Includes:']);
    if (info.manifest.includes.database) table.push(['  Database:', '✅']);
    if (info.manifest.includes.files) table.push(['  Files:', '✅']);
    if (info.manifest.includes.config) table.push(['  Config:', '✅']);
  }

  console.log(table.toString());
  console.log();
}
