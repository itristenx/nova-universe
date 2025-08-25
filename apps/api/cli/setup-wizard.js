#!/usr/bin/env node

/**
 * Nova Universe CLI Setup Wizard
 *
 * Interactive command-line setup wizard that provides equivalent functionality
 * to the web-based setup wizard. Features include:
 * - Progressive disclosure of configuration options
 * - Real-time validation and connection testing
 * - Interactive prompts with smart defaults
 * - Configuration file generation
 * - Rollback and resume capabilities
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import ora from 'ora';
import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import WebSocket from 'ws';

// Setup wizard service integration
import SetupWizardService from '../services/setup-wizard.js';

class CLISetupWizard {
  constructor() {
    this.setupService = new SetupWizardService();
    this.sessionId = null;
    this.config = {};
    this.currentStep = 0;
    this.isConnected = false;
    this.ws = null;

    // Setup steps configuration
    this.steps = [
      {
        id: 'welcome',
        name: 'Welcome',
        description: 'Welcome to Nova Universe setup',
        handler: this.welcomeStep.bind(this),
        required: true,
        canSkip: false,
      },
      {
        id: 'organization',
        name: 'Organization',
        description: 'Configure organization details',
        handler: this.organizationStep.bind(this),
        required: true,
        canSkip: false,
      },
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Set up first admin user',
        handler: this.adminStep.bind(this),
        required: true,
        canSkip: false,
      },
      {
        id: 'database',
        name: 'Database',
        description: 'Configure database connection',
        handler: this.databaseStep.bind(this),
        required: true,
        canSkip: false,
      },
      {
        id: 'communications',
        name: 'Communications',
        description: 'Set up email and messaging',
        handler: this.communicationsStep.bind(this),
        required: false,
        canSkip: true,
      },
      {
        id: 'monitoring',
        name: 'Monitoring',
        description: 'Configure monitoring and alerting',
        handler: this.monitoringStep.bind(this),
        required: false,
        canSkip: true,
      },
      {
        id: 'storage',
        name: 'Storage',
        description: 'Configure file storage',
        handler: this.storageStep.bind(this),
        required: false,
        canSkip: true,
      },
      {
        id: 'ai',
        name: 'AI Features',
        description: 'Enable AI capabilities',
        handler: this.aiStep.bind(this),
        required: false,
        canSkip: true,
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Configure security settings',
        handler: this.securityStep.bind(this),
        required: true,
        canSkip: false,
      },
      {
        id: 'final',
        name: 'Complete',
        description: 'Review and finalize setup',
        handler: this.finalStep.bind(this),
        required: true,
        canSkip: false,
      },
    ];
  }

  // Display banner and introduction
  async displayBanner() {
    console.clear();

    try {
      const banner = figlet.textSync('Nova Universe', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      });

      console.log(chalk.cyan(banner));
    } catch {
      console.log(chalk.cyan.bold('=== Nova Universe Setup Wizard ==='));
    }

    console.log(chalk.gray('Enterprise IT Service Management Platform\\n'));
    console.log(chalk.yellow('Setting up your Nova Universe installation...\\n'));
  }

  // Initialize session and WebSocket connection
  async initialize() {
    const spinner = ora('Initializing setup session...').start();

    try {
      // Initialize session with setup service
      const session = await this.setupService.initializeSession();
      this.sessionId = session.sessionId;
      this.config = session.config || {};

      // Try to establish WebSocket connection for real-time updates
      await this.connectWebSocket();

      spinner.succeed('Setup session initialized');
      return true;
    } catch (error) {
      spinner.fail(`Failed to initialize session: ${error.message}`);
      return false;
    }
  }

  // WebSocket connection for real-time communication
  async connectWebSocket() {
    return new Promise((resolve, _reject) => {
      try {
        const wsUrl = process.env.WS_URL || 'ws://localhost:3001';
        this.ws = new WebSocket(`${wsUrl}/setup?sessionId=${this.sessionId}`);

        this.ws.on('open', () => {
          this.isConnected = true;
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data);
            this.handleWebSocketMessage(message);
          } catch {
            console.log(chalk.yellow('⚠ Warning: Invalid WebSocket message received'));
          }
        });

        this.ws.on('error', (error) => {
          console.log(chalk.yellow(`⚠ Warning: WebSocket connection failed: ${error.message}`));
          this.isConnected = false;
          resolve(); // Continue without WebSocket
        });

        this.ws.on('close', () => {
          this.isConnected = false;
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            resolve(); // Continue without WebSocket
          }
        }, 5000);
      } catch {
        this.isConnected = false;
        resolve(); // Continue without WebSocket
      }
    });
  }

  // Handle incoming WebSocket messages
  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'validation':
        // Handle real-time validation results
        if (message.data && !message.data.valid) {
          console.log(chalk.red('\\n⚠ Validation issues detected:'));
          message.data.errors.forEach((error) => {
            console.log(chalk.red(`  • ${error}`));
          });
        }
        break;

      case 'suggestions':
        // Handle configuration suggestions
        if (message.data && message.data.suggestions) {
          console.log(chalk.blue('\\n💡 Suggestions:'));
          message.data.suggestions.forEach((suggestion) => {
            console.log(chalk.blue(`  • ${suggestion}`));
          });
        }
        break;

      case 'error':
        console.log(chalk.red(`\\n❌ Error: ${message.data?.message || 'Unknown error'}`));
        break;
    }
  }

  // Send WebSocket message
  sendWebSocketMessage(message) {
    if (this.ws && this.isConnected) {
      this.ws.send(
        JSON.stringify({
          ...message,
          sessionId: this.sessionId,
          timestamp: Date.now(),
        }),
      );
    }
  }

  // Main wizard flow
  async run() {
    try {
      await this.displayBanner();

      const initialized = await this.initialize();
      if (!initialized) {
        console.log(chalk.red('Failed to initialize setup wizard. Exiting...'));
        process.exit(1);
      }

      // Connection status indicator
      const connectionStatus = this.isConnected
        ? chalk.green('✓ Connected')
        : chalk.yellow('⚠ Offline Mode');
      console.log(`Status: ${connectionStatus}\\n`);

      // Check for existing session
      const shouldResume = await this.checkResumeSession();
      if (shouldResume) {
        this.currentStep = await this.findCurrentStep();
      }

      // Run setup steps
      await this.runSetupSteps();

      // Completion
      await this.showCompletion();
    } catch (error) {
      console.error(chalk.red(`\\n❌ Setup failed: ${error.message}`));
      process.exit(1);
    } finally {
      if (this.ws) {
        this.ws.close();
      }
    }
  }

  // Check if we should resume existing session
  async checkResumeSession() {
    if (Object.keys(this.config).length > 0) {
      const { resume } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'resume',
          message: 'Found existing setup session. Would you like to resume?',
          default: true,
        },
      ]);

      if (!resume) {
        await this.setupService.resetSession(this.sessionId);
        this.config = {};
        this.currentStep = 0;
      }

      return resume;
    }

    return false;
  }

  // Find current step based on configuration
  async findCurrentStep() {
    // Logic to determine current step based on completed configuration
    if (!this.config.organization) return 1; // Organization step
    if (!this.config.admin) return 2; // Admin step
    if (!this.config.database) return 3; // Database step
    // Continue checking...
    return this.currentStep;
  }

  // Run through all setup steps
  async runSetupSteps() {
    const totalSteps = this.steps.length;

    while (this.currentStep < totalSteps) {
      const step = this.steps[this.currentStep];

      // Display step header
      console.log('\\n' + '='.repeat(60));
      console.log(chalk.cyan.bold(`Step ${this.currentStep + 1}/${totalSteps}: ${step.name}`));
      console.log(chalk.gray(step.description));

      if (!step.required) {
        console.log(chalk.yellow('(Optional - you can skip this step)'));
      }

      console.log('='.repeat(60) + '\\n');

      // Check if user wants to skip optional step
      if (!step.required && step.canSkip) {
        const { skip } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'skip',
            message: `Skip ${step.name} configuration?`,
            default: false,
          },
        ]);

        if (skip) {
          console.log(chalk.yellow(`⏭ Skipping ${step.name} step\\n`));
          this.currentStep++;
          continue;
        }
      }

      // Run step handler
      try {
        await step.handler();

        // Validate step if required
        if (step.required) {
          const isValid = await this.validateStep(step.id);
          if (!isValid) {
            console.log(chalk.red('\\n❌ Step validation failed. Please try again.'));
            continue; // Stay on current step
          }
        }

        console.log(chalk.green(`\\n✓ ${step.name} configuration completed`));
        this.currentStep++;
      } catch (error) {
        console.log(chalk.red(`\\n❌ Error in ${step.name}: ${error.message}`));

        const { retry } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'retry',
            message: 'Would you like to retry this step?',
            default: true,
          },
        ]);

        if (!retry) {
          throw new Error(`Setup aborted at ${step.name} step`);
        }
      }
    }
  }

  // Validate current step
  async validateStep(stepId) {
    const spinner = ora('Validating configuration...').start();

    try {
      const result = await this.setupService.validateStep(this.sessionId, stepId, this.config);

      if (result.valid) {
        spinner.succeed('Configuration valid');
        return true;
      } else {
        spinner.fail('Configuration validation failed');

        if (result.errors && result.errors.length > 0) {
          console.log(chalk.red('\\nValidation errors:'));
          result.errors.forEach((error) => {
            console.log(chalk.red(`  • ${error}`));
          });
        }

        if (result.suggestions && result.suggestions.length > 0) {
          console.log(chalk.blue('\\nSuggestions:'));
          result.suggestions.forEach((suggestion) => {
            console.log(chalk.blue(`  • ${suggestion}`));
          });
        }

        return false;
      }
    } catch (error) {
      spinner.fail(`Validation failed: ${error.message}`);
      return false;
    }
  }

  // Welcome step
  async welcomeStep() {
    console.log(chalk.blue.bold('Welcome to Nova Universe Setup!\\n'));

    console.log('This wizard will guide you through the initial configuration of your');
    console.log('IT Service Management platform. The setup process includes:\\n');

    const features = [
      '📊 Organization configuration and branding',
      '👤 Administrator account setup',
      '🗄️  Database connection configuration',
      '📧 Email and messaging integration (optional)',
      '📈 Monitoring and alerting setup (optional)',
      '💾 File storage configuration (optional)',
      '🤖 AI-powered features (optional)',
      '🔒 Security and authentication settings',
    ];

    features.forEach((feature) => {
      console.log(`  ${feature}`);
    });

    console.log('\\n⏱️  Estimated time: 15-30 minutes');
    console.log('💾 Your progress is automatically saved');
    console.log('🔄 You can resume setup at any time\\n');

    const { ready } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'ready',
        message: 'Ready to begin setup?',
        default: true,
      },
    ]);

    if (!ready) {
      console.log(chalk.yellow('Setup cancelled. You can run this wizard again at any time.'));
      process.exit(0);
    }

    // Initialize welcome config
    this.config.welcome = {
      completed: true,
      startTime: Date.now(),
    };
  }

  // Organization step with progressive disclosure
  async organizationStep() {
    console.log(chalk.blue.bold('Organization Configuration\\n'));

    // Basic organization info
    console.log(chalk.cyan('📋 Basic Information'));
    const basicInfo = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Organization name:',
        default: this.config.organization?.name,
        validate: (input) => (input.trim().length > 0 ? true : 'Organization name is required'),
      },
      {
        type: 'input',
        name: 'displayName',
        message: 'Display name (optional):',
        default: this.config.organization?.displayName,
      },
      {
        type: 'list',
        name: 'size',
        message: 'Organization size:',
        choices: [
          '1-10 employees',
          '11-50 employees',
          '51-200 employees',
          '201-1000 employees',
          '1000+ employees',
        ],
        default: this.config.organization?.size || '11-50 employees',
      },
    ]);

    // Progressive disclosure - ask if they want to configure advanced options
    const { configureAdvanced } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'configureAdvanced',
        message: 'Configure additional organization details? (industry, contact info, branding)',
        default: false,
      },
    ]);

    let advancedInfo = {};

    if (configureAdvanced) {
      console.log('\\n' + chalk.cyan('🏢 Additional Details'));

      advancedInfo = await inquirer.prompt([
        {
          type: 'input',
          name: 'industry',
          message: 'Industry:',
          default: this.config.organization?.industry,
        },
        {
          type: 'input',
          name: 'website',
          message: 'Website URL:',
          default: this.config.organization?.website,
          validate: (input) => {
            if (!input) return true; // Optional
            const urlPattern = /^https?:\/\/.+/;
            return urlPattern.test(input) ? true : 'Please enter a valid URL (http:// or https://)';
          },
        },
        {
          type: 'input',
          name: 'supportEmail',
          message: 'Support email:',
          default: this.config.organization?.supportEmail,
          validate: (input) => {
            if (!input) return true; // Optional
            const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            return emailPattern.test(input) ? true : 'Please enter a valid email address';
          },
        },
        {
          type: 'list',
          name: 'timezone',
          message: 'Primary timezone:',
          choices: [
            'America/New_York (Eastern)',
            'America/Chicago (Central)',
            'America/Denver (Mountain)',
            'America/Los_Angeles (Pacific)',
            'UTC',
            'Europe/London (GMT)',
            'Europe/Paris (CET)',
            'Asia/Tokyo (JST)',
          ],
          default: this.config.organization?.timezone || 'America/New_York (Eastern)',
        },
      ]);

      // Branding options
      const { configureBranding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'configureBranding',
          message: 'Configure branding (colors, logo)?',
          default: false,
        },
      ]);

      if (configureBranding) {
        console.log('\\n' + chalk.cyan('🎨 Branding'));

        const branding = await inquirer.prompt([
          {
            type: 'input',
            name: 'logoPath',
            message: 'Logo file path (optional):',
            default: this.config.organization?.logoPath,
          },
          {
            type: 'input',
            name: 'primaryColor',
            message: 'Primary color (hex):',
            default: this.config.organization?.primaryColor || '#3b82f6',
            validate: (input) => {
              const hexPattern = /^#[0-9A-Fa-f]{6}$/;
              return hexPattern.test(input)
                ? true
                : 'Please enter a valid hex color (e.g., #3b82f6)';
            },
          },
          {
            type: 'input',
            name: 'secondaryColor',
            message: 'Secondary color (hex):',
            default: this.config.organization?.secondaryColor || '#64748b',
            validate: (input) => {
              const hexPattern = /^#[0-9A-Fa-f]{6}$/;
              return hexPattern.test(input)
                ? true
                : 'Please enter a valid hex color (e.g., #64748b)';
            },
          },
        ]);

        advancedInfo = { ...advancedInfo, ...branding };
      }
    }

    // Merge configuration
    this.config.organization = {
      ...basicInfo,
      ...advancedInfo,
    };

    // Send update via WebSocket
    this.sendWebSocketMessage({
      type: 'config_update',
      data: {
        stepId: 'organization',
        config: this.config.organization,
      },
    });
  }

  // Admin step
  async adminStep() {
    console.log(chalk.blue.bold('Administrator Account Setup\\n'));
    console.log('Create the first administrator account for your Nova Universe instance.\\n');

    const adminConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: 'First name:',
        default: this.config.admin?.firstName,
        validate: (input) => (input.trim().length > 0 ? true : 'First name is required'),
      },
      {
        type: 'input',
        name: 'lastName',
        message: 'Last name:',
        default: this.config.admin?.lastName,
        validate: (input) => (input.trim().length > 0 ? true : 'Last name is required'),
      },
      {
        type: 'input',
        name: 'email',
        message: 'Email address:',
        default: this.config.admin?.email,
        validate: (input) => {
          const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
          return emailPattern.test(input) ? true : 'Please enter a valid email address';
        },
      },
      {
        type: 'input',
        name: 'username',
        message: 'Username:',
        default: this.config.admin?.username,
        validate: (input) => {
          if (input.length < 3) return 'Username must be at least 3 characters';
          if (!/^[a-zA-Z0-9_-]+$/.test(input))
            return 'Username can only contain letters, numbers, hyphens, and underscores';
          return true;
        },
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
        mask: '*',
        validate: (input) => {
          if (input.length < 8) return 'Password must be at least 8 characters';
          if (!/(?=.*[a-z])/.test(input))
            return 'Password must contain at least one lowercase letter';
          if (!/(?=.*[A-Z])/.test(input))
            return 'Password must contain at least one uppercase letter';
          if (!/(?=.*\\d)/.test(input)) return 'Password must contain at least one number';
          return true;
        },
      },
      {
        type: 'password',
        name: 'confirmPassword',
        message: 'Confirm password:',
        mask: '*',
        validate: (input, answers) => {
          return input === answers.password ? true : 'Passwords do not match';
        },
      },
    ]);

    // Remove confirmPassword from final config
    delete adminConfig.confirmPassword;

    this.config.admin = adminConfig;

    console.log(chalk.green('\\n✓ Administrator account configured'));
  }

  // Database step with connection testing
  async databaseStep() {
    console.log(chalk.blue.bold('Database Configuration\\n'));
    console.log('Configure the PostgreSQL database connection for Nova Universe.\\n');

    const dbConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'Database host:',
        default: this.config.database?.host || 'localhost',
      },
      {
        type: 'input',
        name: 'port',
        message: 'Database port:',
        default: this.config.database?.port || '5432',
        validate: (input) => {
          const port = parseInt(input);
          return port > 0 && port < 65536 ? true : 'Please enter a valid port number';
        },
      },
      {
        type: 'input',
        name: 'database',
        message: 'Database name:',
        default: this.config.database?.database || 'nova_universe',
        validate: (input) => (input.trim().length > 0 ? true : 'Database name is required'),
      },
      {
        type: 'input',
        name: 'username',
        message: 'Database username:',
        default: this.config.database?.username || 'postgres',
        validate: (input) => (input.trim().length > 0 ? true : 'Username is required'),
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database password:',
        mask: '*',
        default: this.config.database?.password,
      },
    ]);

    // Test database connection
    console.log('\\n');
    const spinner = ora('Testing database connection...').start();

    try {
      const testResult = await this.setupService.testDatabaseConnection(this.sessionId, dbConfig);

      if (testResult.success) {
        spinner.succeed('Database connection successful');

        // Test database permissions
        const permSpinner = ora('Checking database permissions...').start();
        const permResult = await this.setupService.testDatabasePermissions(
          this.sessionId,
          dbConfig,
        );

        if (permResult.canCreate && permResult.canWrite) {
          permSpinner.succeed('Database permissions verified');
        } else {
          permSpinner.warn('Limited database permissions detected');
          console.log(
            chalk.yellow('\\n⚠ Warning: The database user may have limited permissions.'),
          );
          console.log(chalk.yellow('Ensure the user can CREATE tables and WRITE data.'));
        }
      } else {
        spinner.fail('Database connection failed');
        console.log(chalk.red(`\\nError: ${testResult.error || 'Unknown connection error'}`));

        const { retry } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'retry',
            message: 'Would you like to try different database settings?',
            default: true,
          },
        ]);

        if (retry) {
          return this.databaseStep(); // Retry the step
        } else {
          throw new Error('Database configuration failed');
        }
      }
    } catch (error) {
      spinner.fail(`Database test failed: ${error.message}`);
      throw error;
    }

    this.config.database = dbConfig;

    console.log(chalk.green('\\n✓ Database configuration completed'));
  }

  // Communications step (optional)
  async communicationsStep() {
    console.log(chalk.blue.bold('Communications Setup\\n'));
    console.log('Configure email and messaging for notifications and integrations.\\n');

    const { configureEmail } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'configureEmail',
        message: 'Configure email settings?',
        default: true,
      },
    ]);

    let emailConfig = {};

    if (configureEmail) {
      console.log('\\n' + chalk.cyan('📧 Email Configuration'));

      emailConfig = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: 'Email provider:',
          choices: ['SMTP', 'SendGrid', 'Amazon SES', 'Gmail'],
          default: this.config.communications?.email?.provider || 'SMTP',
        },
        {
          type: 'input',
          name: 'host',
          message: 'SMTP host:',
          default: this.config.communications?.email?.host,
          when: (answers) => answers.provider === 'SMTP',
        },
        {
          type: 'input',
          name: 'port',
          message: 'SMTP port:',
          default: this.config.communications?.email?.port || '587',
          when: (answers) => answers.provider === 'SMTP',
        },
        {
          type: 'input',
          name: 'fromEmail',
          message: 'From email address:',
          default: this.config.communications?.email?.fromEmail,
          validate: (input) => {
            const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            return emailPattern.test(input) ? true : 'Please enter a valid email address';
          },
        },
      ]);

      // Test email configuration
      const { testEmail } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'testEmail',
          message: 'Test email configuration?',
          default: true,
        },
      ]);

      if (testEmail) {
        const spinner = ora('Testing email configuration...').start();

        try {
          const result = await this.setupService.testEmailConnection(this.sessionId, emailConfig);

          if (result.success) {
            spinner.succeed('Email configuration successful');
          } else {
            spinner.fail('Email test failed');
            console.log(chalk.red(`\\nError: ${result.error}`));
          }
        } catch (error) {
          spinner.fail(`Email test failed: ${error.message}`);
        }
      }
    }

    // Slack integration
    const { configureSlack } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'configureSlack',
        message: 'Configure Slack integration?',
        default: false,
      },
    ]);

    let slackConfig = {};

    if (configureSlack) {
      console.log('\\n' + chalk.cyan('💬 Slack Integration'));

      slackConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'token',
          message: 'Slack Bot Token:',
          default: this.config.communications?.slack?.token,
          validate: (input) =>
            input.startsWith('xoxb-')
              ? true
              : 'Please enter a valid Slack Bot Token (starts with xoxb-)',
        },
        {
          type: 'input',
          name: 'defaultChannel',
          message: 'Default channel:',
          default: this.config.communications?.slack?.defaultChannel || '#general',
        },
      ]);

      // Test Slack connection
      const spinner = ora('Testing Slack connection...').start();

      try {
        const result = await this.setupService.testSlackConnection(this.sessionId, slackConfig);

        if (result.success) {
          spinner.succeed('Slack connection successful');
        } else {
          spinner.fail('Slack test failed');
          console.log(chalk.red(`\\nError: ${result.error}`));
        }
      } catch (error) {
        spinner.fail(`Slack test failed: ${error.message}`);
      }
    }

    this.config.communications = {
      email: emailConfig,
      slack: slackConfig,
    };
  }

  // Monitoring step (optional)
  async monitoringStep() {
    console.log(chalk.blue.bold('Monitoring & Alerting Setup\\n'));
    console.log('Configure monitoring systems and alerting integrations.\\n');

    const { configureSentinel } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'configureSentinel',
        message: 'Configure Nova Sentinel monitoring?',
        default: true,
      },
    ]);

    let sentinelConfig = {};

    if (configureSentinel) {
      sentinelConfig = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Nova Sentinel URL:',
          default: this.config.monitoring?.sentinel?.url || 'http://localhost:3001',
        },
        {
          type: 'input',
          name: 'apiKey',
          message: 'API Key:',
          default: this.config.monitoring?.sentinel?.apiKey,
        },
      ]);
    }

    this.config.monitoring = {
      sentinel: sentinelConfig,
    };
  }

  // Storage step (optional)
  async storageStep() {
    console.log(chalk.blue.bold('File Storage Configuration\\n'));
    console.log('Configure file storage for attachments and documents.\\n');

    const storageConfig = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Storage provider:',
        choices: ['Local Filesystem', 'Amazon S3', 'MinIO', 'Google Cloud Storage'],
        default: this.config.storage?.provider || 'Local Filesystem',
      },
    ]);

    this.config.storage = storageConfig;
  }

  // AI step (optional)
  async aiStep() {
    console.log(chalk.blue.bold('AI Features Configuration\\n'));
    console.log('Enable AI-powered capabilities for enhanced automation.\\n');

    const aiConfig = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'enabled',
        message: 'Enable AI features?',
        default: false,
      },
    ]);

    this.config.ai = aiConfig;
  }

  // Security step
  async securityStep() {
    console.log(chalk.blue.bold('Security Configuration\\n'));
    console.log('Configure authentication and security settings.\\n');

    const securityConfig = await inquirer.prompt([
      {
        type: 'list',
        name: 'authMethod',
        message: 'Primary authentication method:',
        choices: ['Local Users', 'LDAP/Active Directory', 'SAML SSO', 'OAuth2'],
        default: this.config.security?.authMethod || 'Local Users',
      },
      {
        type: 'input',
        name: 'sessionTimeout',
        message: 'Session timeout (minutes):',
        default: this.config.security?.sessionTimeout || '480',
        validate: (input) => {
          const timeout = parseInt(input);
          return timeout > 0 ? true : 'Please enter a valid timeout in minutes';
        },
      },
      {
        type: 'confirm',
        name: 'enforceHttps',
        message: 'Enforce HTTPS?',
        default: this.config.security?.enforceHttps !== false,
      },
    ]);

    this.config.security = securityConfig;
  }

  // Final step
  async finalStep() {
    console.log(chalk.blue.bold('Setup Complete\\n'));
    console.log('Review your configuration and finalize the setup.\\n');

    // Display configuration summary
    console.log(chalk.cyan.bold('📋 Configuration Summary:'));
    console.log(chalk.cyan('▔'.repeat(50)));

    console.log(`🏢 Organization: ${this.config.organization?.name || 'Not configured'}`);
    console.log(`👤 Admin User: ${this.config.admin?.email || 'Not configured'}`);
    console.log(
      `🗄️  Database: ${this.config.database?.host || 'Not configured'}:${this.config.database?.port || 'N/A'}`,
    );
    console.log(`📧 Email: ${this.config.communications?.email?.fromEmail || 'Not configured'}`);
    console.log(
      `💬 Slack: ${this.config.communications?.slack?.token ? 'Configured' : 'Not configured'}`,
    );
    console.log(
      `📈 Monitoring: ${this.config.monitoring?.sentinel?.url ? 'Configured' : 'Not configured'}`,
    );
    console.log(`💾 Storage: ${this.config.storage?.provider || 'Not configured'}`);
    console.log(`🤖 AI Features: ${this.config.ai?.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`🔒 Security: ${this.config.security?.authMethod || 'Not configured'}`);

    console.log('\\n');

    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with setup completion?',
        default: true,
      },
    ]);

    if (!proceed) {
      console.log(chalk.yellow('Setup cancelled. Configuration has been saved.'));
      return;
    }

    // Generate configuration files
    await this.generateConfigFiles();

    // Complete setup
    const spinner = ora('Completing setup...').start();

    try {
      await this.setupService.completeSetup(this.sessionId, this.config);
      spinner.succeed('Setup completed successfully');
    } catch (error) {
      spinner.fail(`Setup completion failed: ${error.message}`);
      throw error;
    }
  }

  // Generate configuration files
  async generateConfigFiles() {
    const spinner = ora('Generating configuration files...').start();

    try {
      const configDir = path.join(process.cwd(), 'config');

      // Ensure config directory exists
      try {
        await fs.access(configDir);
      } catch {
        await fs.mkdir(configDir, { recursive: true });
      }

      // Generate YAML configuration
      const yamlConfig = yaml.dump(this.config, { indent: 2 });
      await fs.writeFile(path.join(configDir, 'nova-universe.yml'), yamlConfig);

      // Generate environment file
      const envContent = this.generateEnvFile();
      await fs.writeFile(path.join(configDir, '.env.production'), envContent);

      spinner.succeed('Configuration files generated');
      console.log(chalk.green('\\n✓ Configuration files saved:'));
      console.log(`  • ${path.join(configDir, 'nova-universe.yml')}`);
      console.log(`  • ${path.join(configDir, '.env.production')}`);
    } catch (error) {
      spinner.fail(`Failed to generate config files: ${error.message}`);
      throw error;
    }
  }

  // Generate environment file content
  generateEnvFile() {
    const lines = [];

    lines.push('# Nova Universe Configuration');
    lines.push('# Generated by CLI Setup Wizard');
    lines.push('');

    // Database configuration
    if (this.config.database) {
      lines.push('# Database Configuration');
      lines.push(`DATABASE_HOST=${this.config.database.host}`);
      lines.push(`DATABASE_PORT=${this.config.database.port}`);
      lines.push(`DATABASE_NAME=${this.config.database.database}`);
      lines.push(`DATABASE_USER=${this.config.database.username}`);
      lines.push(`DATABASE_PASSWORD=${this.config.database.password}`);
      lines.push('');
    }

    // Email configuration
    if (this.config.communications?.email) {
      lines.push('# Email Configuration');
      const email = this.config.communications.email;
      lines.push(`EMAIL_PROVIDER=${email.provider}`);
      lines.push(`EMAIL_FROM=${email.fromEmail}`);
      if (email.host) lines.push(`SMTP_HOST=${email.host}`);
      if (email.port) lines.push(`SMTP_PORT=${email.port}`);
      lines.push('');
    }

    // Security configuration
    if (this.config.security) {
      lines.push('# Security Configuration');
      lines.push(`AUTH_METHOD=${this.config.security.authMethod}`);
      lines.push(`SESSION_TIMEOUT=${this.config.security.sessionTimeout}`);
      lines.push(`ENFORCE_HTTPS=${this.config.security.enforceHttps}`);
      lines.push('');
    }

    return lines.join('\\n');
  }

  // Show completion message
  async showCompletion() {
    console.log('\\n' + '='.repeat(60));
    console.log(chalk.green.bold('🎉 Nova Universe Setup Complete!'));
    console.log('='.repeat(60));

    console.log('\\nYour Nova Universe installation has been configured successfully.');
    console.log('\\nNext steps:');
    console.log('  1. Review the generated configuration files');
    console.log('  2. Start the Nova Universe services');
    console.log('  3. Access the web interface to begin using the platform');

    console.log('\\n' + chalk.cyan('Need help?'));
    console.log('  • Documentation: https://docs.nova-universe.com');
    console.log('  • Community: https://community.nova-universe.com');
    console.log('  • Support: support@nova-universe.com');

    console.log('\\n' + chalk.yellow('Thank you for choosing Nova Universe! 🚀'));
  }
}

// CLI entry point
async function main() {
  const wizard = new CLISetupWizard();
  await wizard.run();
}

// Run the wizard if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red(`\n❌ Fatal error: ${error.message}`));
    process.exit(1);
  });
}

export { CLISetupWizard };
