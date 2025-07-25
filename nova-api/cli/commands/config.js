/**
 * Config Command - Manage Nova Universe configuration
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import Table from 'cli-table3';
import dotenv from 'dotenv';
import { 
  logger, 
  createSpinner, 
  getProjectRoot,
  validateEmail,
  runCommand
} from '../utils/index.js';

export const configCommand = new Command('config')
  .alias('cfg')
  .description('Manage Nova Universe configuration');

// Config get command
configCommand
  .command('get [key]')
  .description('Get configuration value(s)')
  .option('-e, --env <env>', 'Environment file (.env, .env.local, etc)', '.env')
  .option('-j, --json', 'Output in JSON format')
  .option('-a, --all', 'Show all configuration values')
  .action(async (key, options) => {
    try {
      await getConfig(key, options);
    } catch (error) {
      logger.error(`Failed to get config: ${error.message}`);
      process.exit(1);
    }
  });

// Config set command
configCommand
  .command('set <key> <value>')
  .description('Set configuration value')
  .option('-e, --env <env>', 'Environment file (.env, .env.local, etc)', '.env')
  .option('-c, --create', 'Create file if it doesn\'t exist')
  .action(async (key, value, options) => {
    try {
      await setConfig(key, value, options);
    } catch (error) {
      logger.error(`Failed to set config: ${error.message}`);
      process.exit(1);
    }
  });

// Config unset command
configCommand
  .command('unset <key>')
  .alias('delete')
  .description('Remove configuration value')
  .option('-e, --env <env>', 'Environment file (.env, .env.local, etc)', '.env')
  .action(async (key, options) => {
    try {
      await unsetConfig(key, options);
    } catch (error) {
      logger.error(`Failed to unset config: ${error.message}`);
      process.exit(1);
    }
  });

// Config list command
configCommand
  .command('list')
  .alias('ls')
  .description('List all configuration files')
  .option('-j, --json', 'Output in JSON format')
  .action(async (options) => {
    try {
      await listConfigFiles(options);
    } catch (error) {
      logger.error(`Failed to list config files: ${error.message}`);
      process.exit(1);
    }
  });

// Config validate command
configCommand
  .command('validate')
  .description('Validate configuration')
  .option('-e, --env <env>', 'Environment file to validate', '.env')
  .action(async (options) => {
    try {
      await validateConfig(options);
    } catch (error) {
      logger.error(`Failed to validate config: ${error.message}`);
      process.exit(1);
    }
  });

// Config backup command
configCommand
  .command('backup')
  .description('Backup configuration files')
  .option('-d, --directory <dir>', 'Backup directory', 'backups')
  .action(async (options) => {
    try {
      await backupConfig(options);
    } catch (error) {
      logger.error(`Failed to backup config: ${error.message}`);
      process.exit(1);
    }
  });

// Config restore command
configCommand
  .command('restore <backup>')
  .description('Restore configuration from backup')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (backup, options) => {
    try {
      await restoreConfig(backup, options);
    } catch (error) {
      logger.error(`Failed to restore config: ${error.message}`);
      process.exit(1);
    }
  });

// Config edit command
configCommand
  .command('edit [file]')
  .description('Edit configuration file in default editor')
  .option('-e, --env <env>', 'Environment file to edit', '.env')
  .action(async (file, options) => {
    try {
      await editConfig(file || options.env);
    } catch (error) {
      logger.error(`Failed to edit config: ${error.message}`);
      process.exit(1);
    }
  });

// Config wizard command
configCommand
  .command('wizard')
  .description('Interactive configuration setup wizard')
  .action(async () => {
    try {
      await configWizard();
    } catch (error) {
      logger.error(`Configuration wizard failed: ${error.message}`);
      process.exit(1);
    }
  });

// Get configuration
async function getConfig(key, options) {
  const projectRoot = getProjectRoot();
  const envPath = path.join(projectRoot, options.env);

  if (!existsSync(envPath)) {
    logger.error(`Environment file not found: ${envPath}`);
    return;
  }

  const config = dotenv.parse(readFileSync(envPath));

  if (key) {
    // Get specific key
    if (config[key] !== undefined) {
      if (options.json) {
        console.log(JSON.stringify({ [key]: config[key] }, null, 2));
      } else {
        console.log(config[key]);
      }
    } else {
      logger.warning(`Configuration key '${key}' not found`);
    }
  } else {
    // Get all values
    if (options.json) {
      console.log(JSON.stringify(config, null, 2));
    } else {
      displayConfigTable(config, options.env);
    }
  }
}

// Set configuration
async function setConfig(key, value, options) {
  const spinner = createSpinner(`Setting ${key}...`);
  spinner.start();

  try {
    const projectRoot = getProjectRoot();
    const envPath = path.join(projectRoot, options.env);

    let config = {};
    
    if (existsSync(envPath)) {
      config = dotenv.parse(readFileSync(envPath));
    } else if (!options.create) {
      spinner.fail(`Environment file not found: ${envPath}`);
      logger.info('Use --create flag to create a new file');
      return;
    }

    // Update the value
    const oldValue = config[key];
    config[key] = value;

    // Write back to file
    const envContent = Object.entries(config)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    writeFileSync(envPath, envContent + '\n');

    spinner.succeed(`Configuration updated`);

    if (oldValue !== undefined) {
      console.log(chalk.gray(`   Previous: ${oldValue}`));
    }
    console.log(chalk.green(`   Current:  ${value}`));

  } catch (error) {
    spinner.fail('Failed to set configuration');
    throw error;
  }
}

// Unset configuration
async function unsetConfig(key, options) {
  const spinner = createSpinner(`Removing ${key}...`);
  spinner.start();

  try {
    const projectRoot = getProjectRoot();
    const envPath = path.join(projectRoot, options.env);

    if (!existsSync(envPath)) {
      spinner.fail(`Environment file not found: ${envPath}`);
      return;
    }

    const config = dotenv.parse(readFileSync(envPath));

    if (config[key] === undefined) {
      spinner.fail(`Configuration key '${key}' not found`);
      return;
    }

    const oldValue = config[key];
    delete config[key];

    // Write back to file
    const envContent = Object.entries(config)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    writeFileSync(envPath, envContent + '\n');

    spinner.succeed(`Configuration key removed`);
    console.log(chalk.gray(`   Removed: ${key}=${oldValue}`));

  } catch (error) {
    spinner.fail('Failed to remove configuration');
    throw error;
  }
}

// List configuration files
async function listConfigFiles(options) {
  const projectRoot = getProjectRoot();
  
  const configFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    '.env.test',
    'nova-api/.env',
    'nova-core/.env',
    'nova-comms/.env'
  ];

  const foundFiles = [];

  for (const file of configFiles) {
    const filePath = path.join(projectRoot, file);
    if (existsSync(filePath)) {
      const stats = require('fs').statSync(filePath);
      const config = dotenv.parse(readFileSync(filePath));
      
      foundFiles.push({
        file,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        keys: Object.keys(config).length
      });
    }
  }

  if (options.json) {
    console.log(JSON.stringify(foundFiles, null, 2));
  } else {
    displayConfigFilesTable(foundFiles);
  }
}

// Validate configuration
async function validateConfig(options) {
  const spinner = createSpinner('Validating configuration...');
  spinner.start();

  try {
    const projectRoot = getProjectRoot();
    const envPath = path.join(projectRoot, options.env);

    if (!existsSync(envPath)) {
      spinner.fail(`Environment file not found: ${envPath}`);
      return;
    }

    const config = dotenv.parse(readFileSync(envPath));
    const issues = [];

    // Define required keys and their validation rules
    const validationRules = {
      DATABASE_URL: {
        required: true,
        validator: (value) => value && value.includes('://'),
        message: 'Must be a valid database connection string'
      },
      JWT_SECRET: {
        required: true,
        validator: (value) => value && value.length >= 32,
        message: 'Must be at least 32 characters long'
      },
      PORT: {
        required: false,
        validator: (value) => !value || (!isNaN(value) && value > 0 && value <= 65535),
        message: 'Must be a valid port number (1-65535)'
      },
      NODE_ENV: {
        required: false,
        validator: (value) => !value || ['development', 'production', 'test'].includes(value),
        message: 'Must be one of: development, production, test'
      },
      ADMIN_EMAIL: {
        required: false,
        validator: (value) => !value || validateEmail(value),
        message: 'Must be a valid email address'
      }
    };

    // Check each rule
    for (const [key, rule] of Object.entries(validationRules)) {
      const value = config[key];

      if (rule.required && (!value || value.trim() === '')) {
        issues.push({
          type: 'error',
          key,
          message: `Required key '${key}' is missing`
        });
      } else if (value && !rule.validator(value)) {
        issues.push({
          type: 'error',
          key,
          message: `Invalid value for '${key}': ${rule.message}`
        });
      }
    }

    // Check for common issues
    if (config.JWT_SECRET === 'your-secret-key' || config.JWT_SECRET === 'change-me') {
      issues.push({
        type: 'warning',
        key: 'JWT_SECRET',
        message: 'Using default/example JWT secret - please change for security'
      });
    }

    if (config.NODE_ENV === 'production' && config.DEBUG === 'true') {
      issues.push({
        type: 'warning',
        key: 'DEBUG',
        message: 'Debug mode enabled in production environment'
      });
    }

    spinner.succeed('Configuration validation complete');

    if (issues.length === 0) {
      logger.success('✅ Configuration is valid');
    } else {
      console.log(chalk.yellow('\n⚠️  Configuration Issues Found:\n'));
      
      for (const issue of issues) {
        const icon = issue.type === 'error' ? '❌' : '⚠️';
        const color = issue.type === 'error' ? chalk.red : chalk.yellow;
        console.log(color(`${icon} ${issue.key}: ${issue.message}`));
      }
      
      const errorCount = issues.filter(i => i.type === 'error').length;
      const warningCount = issues.filter(i => i.type === 'warning').length;
      
      console.log(chalk.gray(`\nFound ${errorCount} error(s) and ${warningCount} warning(s)\n`));
    }

  } catch (error) {
    spinner.fail('Validation failed');
    throw error;
  }
}

// Backup configuration
async function backupConfig(options) {
  const spinner = createSpinner('Creating configuration backup...');
  spinner.start();

  try {
    const projectRoot = getProjectRoot();
    const backupDir = path.join(projectRoot, options.directory);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `config-backup-${timestamp}`);

    // Create backup directory
    await runCommand('mkdir', ['-p', backupPath], { silent: true });

    const configFiles = ['.env', '.env.local', '.env.development', '.env.production'];
    let backedUpFiles = 0;

    for (const file of configFiles) {
      const filePath = path.join(projectRoot, file);
      if (existsSync(filePath)) {
        await runCommand('cp', [filePath, path.join(backupPath, file)], { silent: true });
        backedUpFiles++;
      }
    }

    // Also backup service-specific configs
    const serviceConfigs = ['nova-api/.env', 'nova-core/.env', 'nova-comms/.env'];
    for (const file of serviceConfigs) {
      const filePath = path.join(projectRoot, file);
      if (existsSync(filePath)) {
        const backupFileName = file.replace('/', '-');
        await runCommand('cp', [filePath, path.join(backupPath, backupFileName)], { silent: true });
        backedUpFiles++;
      }
    }

    spinner.succeed(`Configuration backup created`);
    console.log(chalk.green(`   Location: ${backupPath}`));
    console.log(chalk.gray(`   Files backed up: ${backedUpFiles}`));

  } catch (error) {
    spinner.fail('Backup failed');
    throw error;
  }
}

// Restore configuration
async function restoreConfig(backup, options) {
  const spinner = createSpinner('Restoring configuration...');
  spinner.start();

  try {
    const projectRoot = getProjectRoot();
    const backupPath = path.resolve(backup);

    if (!existsSync(backupPath)) {
      spinner.fail(`Backup directory not found: ${backupPath}`);
      return;
    }

    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'This will overwrite existing configuration files. Continue?',
          default: false
        }
      ]);

      if (!confirm) {
        spinner.stop();
        logger.info('Restore cancelled');
        return;
      }
    }

    // Restore files
    const files = require('fs').readdirSync(backupPath);
    let restoredFiles = 0;

    for (const file of files) {
      const srcPath = path.join(backupPath, file);
      let destPath;

      if (file.includes('-')) {
        // Service-specific config (e.g., nova-api-.env)
        destPath = path.join(projectRoot, file.replace('-', '/'));
      } else {
        // Root config file
        destPath = path.join(projectRoot, file);
      }

      await runCommand('cp', [srcPath, destPath], { silent: true });
      restoredFiles++;
    }

    spinner.succeed(`Configuration restored`);
    console.log(chalk.green(`   Files restored: ${restoredFiles}`));
    console.log(chalk.yellow('   Please restart services to apply changes'));

  } catch (error) {
    spinner.fail('Restore failed');
    throw error;
  }
}

// Edit configuration file
async function editConfig(filename) {
  const projectRoot = getProjectRoot();
  const filePath = path.join(projectRoot, filename);

  if (!existsSync(filePath)) {
    const { create } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'create',
        message: `File ${filename} doesn't exist. Create it?`,
        default: true
      }
    ]);

    if (create) {
      writeFileSync(filePath, '# Nova Universe Configuration\n');
    } else {
      return;
    }
  }

  const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
  
  console.log(chalk.cyan(`Opening ${filename} in ${editor}...`));
  
  try {
    await runCommand(editor, [filePath], { stdio: 'inherit' });
    logger.success('Configuration file saved');
  } catch (error) {
    logger.error(`Failed to open editor: ${error.message}`);
  }
}

// Configuration wizard
async function configWizard() {
  console.log(chalk.cyan('🧙 Nova Universe Configuration Wizard\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'environment',
      message: 'What environment are you setting up?',
      choices: [
        { name: 'Development', value: 'development' },
        { name: 'Production', value: 'production' },
        { name: 'Testing', value: 'test' }
      ]
    },
    {
      type: 'input',
      name: 'databaseUrl',
      message: 'Database connection URL:',
      default: 'postgresql://user:password@localhost:5432/nova',
      validate: (input) => input.includes('://') || 'Please enter a valid database URL'
    },
    {
      type: 'input',
      name: 'jwtSecret',
      message: 'JWT Secret (leave blank to generate):',
      filter: (input) => input || require('crypto').randomBytes(32).toString('hex')
    },
    {
      type: 'number',
      name: 'port',
      message: 'API Server Port:',
      default: 3000,
      validate: (input) => (input > 0 && input <= 65535) || 'Port must be between 1 and 65535'
    },
    {
      type: 'input',
      name: 'adminEmail',
      message: 'Admin email address:',
      validate: (input) => {
        if (!input) return true;
        return validateEmail(input) || 'Please enter a valid email address';
      }
    }
  ]);

  const spinner = createSpinner('Creating configuration...');
  spinner.start();

  try {
    const projectRoot = getProjectRoot();
    const envFile = answers.environment === 'production' ? '.env.production' : '.env';
    const envPath = path.join(projectRoot, envFile);

    const config = {
      NODE_ENV: answers.environment,
      DATABASE_URL: answers.databaseUrl,
      JWT_SECRET: answers.jwtSecret,
      PORT: answers.port.toString(),
      ...(answers.adminEmail && { ADMIN_EMAIL: answers.adminEmail })
    };

    const envContent = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    writeFileSync(envPath, envContent + '\n');

    spinner.succeed('Configuration created successfully');
    
    console.log(chalk.green(`\n✅ Configuration saved to ${envFile}`));
    console.log(chalk.yellow('💡 Next steps:'));
    console.log(chalk.gray('   1. Review the configuration file'));
    console.log(chalk.gray('   2. Run database migrations'));
    console.log(chalk.gray('   3. Start the services'));

  } catch (error) {
    spinner.fail('Failed to create configuration');
    throw error;
  }
}

// Display configuration table
function displayConfigTable(config, filename) {
  const table = new Table({
    head: ['Key', 'Value'],
    colWidths: [30, 50]
  });

  for (const [key, value] of Object.entries(config)) {
    // Mask sensitive values
    let displayValue = value;
    if (key.toLowerCase().includes('secret') || 
        key.toLowerCase().includes('password') || 
        key.toLowerCase().includes('key')) {
      displayValue = '*'.repeat(Math.min(value.length, 8));
    }

    table.push([chalk.cyan(key), displayValue]);
  }

  console.log(chalk.cyan(`\n⚙️  Configuration (${filename})\n`));
  console.log(table.toString());
  console.log();
}

// Display configuration files table
function displayConfigFilesTable(files) {
  if (files.length === 0) {
    logger.warning('No configuration files found');
    return;
  }

  const table = new Table({
    head: ['File', 'Keys', 'Size', 'Modified'],
    colWidths: [25, 8, 10, 20]
  });

  for (const file of files) {
    table.push([
      file.file,
      file.keys.toString(),
      `${Math.round(file.size / 1024)}KB`,
      file.modified.toLocaleDateString()
    ]);
  }

  console.log(chalk.cyan(`\n📁 Configuration Files (${files.length})\n`));
  console.log(table.toString());
  console.log();
}
