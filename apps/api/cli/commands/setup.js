/**
 * Setup Command - Initialize and configure Nova Universe
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import path from 'path';
import { 
  logger, 
  createSpinner, 
  runCommand, 
  getProjectRoot,
  config,
  generatePassword,
  isValidEmail,
  validatePassword
} from '../utils/index.js';

export const _setupCommand = new Command('setup')
  .description('Initialize and configure Nova Universe platform')
  .option('-i, --interactive', 'Run interactive setup wizard')
  .option('-f, --force', 'Force overwrite existing configuration')
  .option('--skip-dependencies', 'Skip dependency installation')
  .option('--skip-database', 'Skip database initialization')
  .action(async (options) => {
    console.log(chalk.cyan.bold('\n🚀 Nova Universe Setup\n'));
    
    try {
      if (options.interactive) {
        await runInteractiveSetup(options); // TODO-LINT: move to async function
      } else {
        await runQuickSetup(options); // TODO-LINT: move to async function
      }
      
      logger.success('Setup completed successfully!');
      console.log(chalk.cyan('\n💡 Next steps:'));
      console.log(chalk.white('  • Run'), chalk.yellow('nova service start'), chalk.white('to start all services'));
      console.log(chalk.white('  • Visit'), chalk.blue('http://localhost:5173'), chalk.white('to access the admin UI'));
      console.log(chalk.white('  • Use'), chalk.yellow('nova dashboard'), chalk.white('for real-time monitoring'));
      
    } catch (error) {
      logger.error(`Setup failed: ${error.message}`);
      if (process.env.DEBUG) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Quick setup with sensible defaults
async function runQuickSetup(options) {
  const projectRoot = getProjectRoot();
  
  const tasks = new Listr([
    {
      title: 'Checking environment',
      task: async (ctx) => {
        ctx.projectRoot = projectRoot;
        ctx.nodeVersion = process.version;
        
        // Check Node.js version
        const majorVersion = parseInt(process.version.substring(1));
        if (majorVersion < 18) {
          throw new Error('Node.js 18 or higher is required');
        }
      }
    },
    {
      title: 'Installing dependencies',
      skip: () => options.skipDependencies,
      task: async (ctx) => {
        const dirs = ['nova-api', 'nova-core', 'nova-comms'];
        
        for (const dir of dirs) {
          const dirPath = path.join(ctx.projectRoot, dir);
          if (existsSync(dirPath)) {
            await runCommand('npm', ['ci'], { 
              cwd: dirPath, 
              silent: true 
            }); // TODO-LINT: move to async function
          }
        }
      }
    },
    {
      title: 'Creating configuration files',
      task: async (ctx) => {
        await createEnvironmentFiles(ctx.projectRoot, {
          adminEmail: 'admin@nova.local',
          adminPassword: generatePassword(),
          dbType: 'postgresql'
        }); // TODO-LINT: move to async function
      }
    },
    {
      title: 'Initializing database',
      skip: () => options.skipDatabase,
      task: async (ctx) => {
        const apiPath = path.join(ctx.projectRoot, 'nova-api');
        if (existsSync(apiPath)) {
          await runCommand('node', ['migrate-database.js'], { 
            cwd: apiPath, 
            silent: true 
          }); // TODO-LINT: move to async function
        }
      }
    },
    {
      title: 'Setting up CLI configuration',
      task: async (ctx) => {
        config.set('environment', 'development');
        config.set('projectRoot', ctx.projectRoot);
        config.set('setupComplete', true);
        config.set('setupDate', new Date().toISOString());
      }
    }
  ], {
    concurrent: false,
    renderer: 'default'
  });

  await tasks.run(); // TODO-LINT: move to async function
}

// Interactive setup wizard
async function runInteractiveSetup(options) {
  console.log(chalk.gray('This wizard will guide you through setting up Nova Universe.\n'));
  
  // Project configuration
  const projectConfig = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'Nova Universe',
      validate: (input) => input.length > 0 || 'Project name is required'
    },
    {
      type: 'list',
      name: 'environment',
      message: 'Environment:',
      choices: [
        { name: 'Development', value: 'development' },
        { name: 'Staging', value: 'staging' },
        { name: 'Production', value: 'production' }
      ],
      default: 'development'
    }
  ]); // TODO-LINT: move to async function

  // Admin account setup
  console.log(chalk.cyan('\n👤 Admin Account Setup'));
  const adminConfig = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Admin email:',
      default: 'admin@nova.local',
      validate: (input) => isValidEmail(input) || 'Please enter a valid email address'
    },
    {
      type: 'password',
      name: 'password',
      message: 'Admin password:',
      mask: '*',
      validate: (input) => {
        const validation = validatePassword(input); // TODO-LINT: move to async function
        return validation.valid || validation.issues.join(', ');
      }
    }
  ]);

  // Database configuration
  console.log(chalk.cyan('\n🗄️  Database Configuration'));
  const dbConfig = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Database type:',
      choices: [
        { name: 'PostgreSQL', value: 'postgresql' },
        { name: 'MongoDB', value: 'mongodb' }
      ],
      default: 'postgresql'
    }
  ]); // TODO-LINT: move to async function

  // Additional database config for non-SQLite
  let dbDetails = {};
  if (dbConfig.type !== 'sqlite') {
    dbDetails = await inquirer.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'Database host:',
        default: 'localhost'
      },
      {
        type: 'input',
        name: 'port',
        message: 'Database port:',
        default: dbConfig.type === 'postgresql' ? '5432' : '27017'
      },
      {
        type: 'input',
        name: 'database',
        message: 'Database name:',
        default: 'nova_universe'
      },
      {
        type: 'input',
        name: 'username',
        message: 'Database username:'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database password:',
        mask: '*'
      }
    ]); // TODO-LINT: move to async function
  }

  // Feature configuration
  console.log(chalk.cyan('\n⚡ Feature Configuration'));
  const featureConfig = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features to enable:',
      choices: [
        { name: 'Email notifications (SMTP)', value: 'email', checked: true },
        { name: 'Slack integration', value: 'slack' },
        { name: 'Microsoft Teams integration', value: 'teams' },
        { name: 'SAML authentication', value: 'saml' },
        { name: 'WebAuthn (passwordless login)', value: 'webauthn' },
        { name: 'Elasticsearch logging', value: 'elasticsearch' }
      ]
    }
  ]); // TODO-LINT: move to async function

  // Final confirmation
  console.log(chalk.cyan('\n📋 Configuration Summary'));
  console.log(chalk.white('Project:'), projectConfig.projectName);
  console.log(chalk.white('Environment:'), projectConfig.environment);
  console.log(chalk.white('Admin Email:'), adminConfig.email);
  console.log(chalk.white('Database:'), dbConfig.type.toUpperCase());
  console.log(chalk.white('Features:'), featureConfig.features.join(', ') || 'None');

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Proceed with this configuration?',
      default: true
    }
  ]); // TODO-LINT: move to async function

  if (!confirmed) {
    logger.warning('Setup cancelled by user');
    process.exit(0);
  }

  // Run setup tasks
  const projectRoot = getProjectRoot();
  
  const tasks = new Listr([
    {
      title: 'Installing dependencies',
      skip: () => options.skipDependencies,
      task: async () => {
        const dirs = ['nova-api', 'nova-core', 'nova-comms'];
        
        for (const dir of dirs) {
          const dirPath = path.join(projectRoot, dir);
          if (existsSync(dirPath)) {
            await runCommand('npm', ['ci'], { 
              cwd: dirPath, 
              silent: true 
            }); // TODO-LINT: move to async function
          }
        }
      }
    },
    {
      title: 'Creating configuration files',
      task: async () => {
        await createEnvironmentFiles(projectRoot, {
          ...adminConfig,
          ...dbConfig,
          ...dbDetails,
          features: featureConfig.features,
          environment: projectConfig.environment,
          projectName: projectConfig.projectName
        }); // TODO-LINT: move to async function
      }
    },
    {
      title: 'Initializing database',
      skip: () => options.skipDatabase,
      task: async () => {
        const apiPath = path.join(projectRoot, 'nova-api');
        if (existsSync(apiPath)) {
          await runCommand('node', ['migrate-database.js'], { 
            cwd: apiPath, 
            silent: true 
          }); // TODO-LINT: move to async function
        }
      }
    },
    {
      title: 'Setting up CLI configuration',
      task: async () => {
        config.set('environment', projectConfig.environment);
        config.set('projectRoot', projectRoot);
        config.set('adminEmail', adminConfig.email);
        config.set('features', featureConfig.features);
        config.set('setupComplete', true);
        config.set('setupDate', new Date().toISOString());
      }
    }
  ], {
    concurrent: false,
    renderer: 'default'
  });

  await tasks.run(); // TODO-LINT: move to async function
}

// Create environment configuration files
async function createEnvironmentFiles(projectRoot, config) {
  const envFiles = [
    {
      path: path.join(projectRoot, 'nova-api', '.env'),
      content: generateApiEnv(config)
    },
    {
      path: path.join(projectRoot, 'nova-core', '.env'),
      content: generateCoreEnv(config)
    },
    {
      path: path.join(projectRoot, 'nova-comms', '.env'),
      content: generateCommsEnv(config)
    }
  ];

  for (const file of envFiles) {
    const dir = path.dirname(file.path);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    if (!existsSync(file.path) || options.force) {
      writeFileSync(file.path, file.content);
    }
  }
}

function generateApiEnv(config) {
  return `# Nova API Configuration
NODE_ENV=${config.environment || 'development'}
API_PORT=3000
HOST=localhost

# Security
SESSION_SECRET=${generatePassword(64)}
JWT_SECRET=${generatePassword(64)}

# Admin Account
ADMIN_EMAIL=${config.email || 'admin@nova.local'}
ADMIN_PASSWORD=${config.password || generatePassword()}
ADMIN_NAME=Nova Administrator

# Database
DB_TYPE=${config.type || 'postgresql'}
${config.type === 'postgresql' ? `
DB_HOST=${config.host || 'localhost'}
DB_PORT=${config.port || '5432'}
DB_NAME=${config.database || 'nova_universe'}
DB_USER=${config.username || ''}
DB_PASSWORD=${config.password || ''}
` : ''}
${config.type === 'mongodb' ? `
MONGODB_URI=mongodb://${config.host || 'localhost'}:${config.port || '27017'}/${config.database || 'nova_universe'}
` : ''}

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Features
${config.features?.includes('email') ? `
# Email Configuration
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Nova Universe <noreply@nova.local>"
` : ''}

${config.features?.includes('slack') ? `
# Slack Integration
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
` : ''}

${config.features?.includes('elasticsearch') ? `
# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=nova-logs
` : ''}
`;
}

function generateCoreEnv(config) {
  return `# Nova Core Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=${config.projectName || 'Nova Universe'}
VITE_ENVIRONMENT=${config.environment || 'development'}
`;
}

function generateCommsEnv(config) {
  return `# Nova Communications Configuration
NODE_ENV=${config.environment || 'development'}
COMMS_PORT=3001
API_URL=http://localhost:3000
`;
}
