/**
 * Tenant Command - Manage Nova Universe tenants
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import bcrypt from 'bcryptjs';
import Table from 'cli-table3';
import { v4 as uuidv4 } from 'uuid';
import {
  logger,
  createSpinner,
  validateEmail,
  formatDate,
  validateUrl,
} from '../utils/index.js';
import db from '../../db.js';

export const tenantCommand = new Command('tenant').description('Manage Nova Universe tenants');

// Tenant create command
tenantCommand
  .command('create')
  .alias('add')
  .description('Create a new tenant')
  .option('-n, --name <name>', 'Tenant name')
  .option('-d, --domain <domain>', 'Tenant domain')
  .option('-s, --subdomain <subdomain>', 'Tenant subdomain')
  .option('--theme-color <color>', 'Theme color (hex)', '#000000')
  .option('--logo-url <url>', 'Logo URL')
  .option('--support-email <email>', 'Support email address')
  .option('--interactive', 'Interactive mode', true)
  .action(async (options) => {
    try {
      let tenantData = {};

      if (options.interactive || !options.name || !options.domain) {
        tenantData = await promptTenantData(options);
      } else {
        tenantData = {
          name: options.name,
          domain: options.domain,
          subdomain: options.subdomain,
          themeColor: options.themeColor,
          logoUrl: options.logoUrl,
          supportEmail: options.supportEmail,
        };
      }

      await createTenant(tenantData);
    } catch (error) {
      logger.error(`Failed to create tenant: ${error.message}`);
      process.exit(1);
    }
  });

// Tenant list command
tenantCommand
  .command('list')
  .alias('ls')
  .description('List all tenants')
  .option('-j, --json', 'Output in JSON format')
  .option('--active', 'Show only active tenants')
  .option('--inactive', 'Show only inactive tenants')
  .action(async (options) => {
    try {
      const tenants = await listTenants(options);

      if (options.json) {
        console.log(JSON.stringify(tenants, null, 2));
      } else {
        displayTenantsTable(tenants);
      }
    } catch (error) {
      logger.error(`Failed to list tenants: ${error.message}`);
      process.exit(1);
    }
  });

// Tenant create-admin command
tenantCommand
  .command('create-admin <tenantDomain>')
  .description('Create a tenant admin user')
  .option('-e, --email <email>', 'Admin email address')
  .option('-p, --password <password>', 'Admin password')
  .option('-n, --name <name>', 'Admin full name')
  .option('--interactive', 'Interactive mode', true)
  .action(async (tenantDomain, options) => {
    try {
      let adminData = {};

      if (options.interactive || !options.email) {
        adminData = await promptAdminData(options);
      } else {
        adminData = {
          email: options.email,
          password: options.password,
          name: options.name,
        };
      }

      await createTenantAdmin(tenantDomain, adminData);
    } catch (error) {
      logger.error(`Failed to create tenant admin: ${error.message}`);
      process.exit(1);
    }
  });

// Tenant info command
tenantCommand
  .command('info <domain>')
  .description('Show detailed tenant information')
  .option('-j, --json', 'Output in JSON format')
  .action(async (domain, options) => {
    try {
      const tenant = await getTenantInfo(domain);

      if (options.json) {
        console.log(JSON.stringify(tenant, null, 2));
      } else {
        displayTenantInfo(tenant);
      }
    } catch (error) {
      logger.error(`Failed to get tenant info: ${error.message}`);
      process.exit(1);
    }
  });

// Prompt for tenant data
async function promptTenantData(options = {}) {
  const questions = [];

  if (!options.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Tenant name:',
      validate: (input) => {
        if (!input) return 'Tenant name is required';
        if (input.length < 2) return 'Tenant name must be at least 2 characters';
        return true;
      },
    });
  }

  if (!options.domain) {
    questions.push({
      type: 'input',
      name: 'domain',
      message: 'Tenant domain (e.g., company.com):',
      validate: (input) => {
        if (!input) return 'Domain is required';
        // Basic domain validation
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!domainRegex.test(input)) return 'Please enter a valid domain';
        return true;
      },
    });
  }

  if (!options.subdomain) {
    questions.push({
      type: 'input',
      name: 'subdomain',
      message: 'Tenant subdomain (optional):',
      validate: (input) => {
        if (!input) return true; // Optional
        const subdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
        if (!subdomainRegex.test(input)) return 'Please enter a valid subdomain (alphanumeric and hyphens only)';
        return true;
      },
    });
  }

  if (!options.supportEmail) {
    questions.push({
      type: 'input',
      name: 'supportEmail',
      message: 'Support email (optional):',
      validate: (input) => {
        if (!input) return true; // Optional
        if (!validateEmail(input)) return 'Please enter a valid email address';
        return true;
      },
    });
  }

  if (!options.themeColor) {
    questions.push({
      type: 'input',
      name: 'themeColor',
      message: 'Theme color (hex, optional):',
      default: '#000000',
      validate: (input) => {
        if (!input) return true;
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        if (!hexRegex.test(input)) return 'Please enter a valid hex color (e.g., #3b82f6)';
        return true;
      },
    });
  }

  if (!options.logoUrl) {
    questions.push({
      type: 'input',
      name: 'logoUrl',
      message: 'Logo URL (optional):',
      validate: (input) => {
        if (!input) return true; // Optional
        if (!validateUrl(input)) return 'Please enter a valid URL';
        return true;
      },
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    name: options.name || answers.name,
    domain: options.domain || answers.domain,
    subdomain: options.subdomain || answers.subdomain || null,
    themeColor: options.themeColor || answers.themeColor || '#000000',
    logoUrl: options.logoUrl || answers.logoUrl || null,
    supportEmail: options.supportEmail || answers.supportEmail || null,
  };
}

// Prompt for admin data
async function promptAdminData(options = {}) {
  const questions = [];

  if (!options.email) {
    questions.push({
      type: 'input',
      name: 'email',
      message: 'Admin email address:',
      validate: (input) => {
        if (!input) return 'Email is required';
        if (!validateEmail(input)) return 'Please enter a valid email address';
        return true;
      },
    });
  }

  if (!options.password) {
    questions.push({
      type: 'password',
      name: 'password',
      message: 'Admin password:',
      validate: (input) => {
        if (!input) return 'Password is required';
        if (input.length < 8) return 'Password must be at least 8 characters';
        return true;
      },
    });

    questions.push({
      type: 'password',
      name: 'confirmPassword',
      message: 'Confirm password:',
      validate: (input, answers) => {
        if (input !== answers.password) return 'Passwords do not match';
        return true;
      },
    });
  }

  if (!options.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: 'Admin full name:',
      validate: (input) => {
        if (!input) return 'Name is required';
        return true;
      },
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    email: options.email || answers.email,
    password: options.password || answers.password,
    name: options.name || answers.name,
  };
}

// Create tenant
async function createTenant(tenantData) {
  const spinner = createSpinner('Creating tenant...');
  spinner.start();

  try {
    // Check if tenant already exists
    const existingTenant = await db.query('SELECT id FROM tenants WHERE domain = $1', [tenantData.domain]);
    if (existingTenant.rows.length > 0) {
      spinner.fail('Tenant with this domain already exists');
      return;
    }

    // Check subdomain if provided
    if (tenantData.subdomain) {
      const existingSubdomain = await db.query('SELECT id FROM tenants WHERE subdomain = $1', [tenantData.subdomain]);
      if (existingSubdomain.rows.length > 0) {
        spinner.fail('Tenant with this subdomain already exists');
        return;
      }
    }

    // Create tenant
    const tenantId = uuidv4();
    const result = await db.query(
      `INSERT INTO tenants (id, name, domain, subdomain, theme_color, logo_url, support_email, active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        tenantId,
        tenantData.name,
        tenantData.domain,
        tenantData.subdomain,
        tenantData.themeColor,
        tenantData.logoUrl,
        tenantData.supportEmail,
        true,
      ]
    );

    spinner.succeed('Tenant created successfully');

    const tenant = result.rows[0];
    console.log(chalk.green('\n✅ Tenant Details:'));
    console.log(`   ID: ${tenant.id}`);
    console.log(`   Name: ${tenant.name}`);
    console.log(`   Domain: ${tenant.domain}`);
    console.log(`   Subdomain: ${tenant.subdomain || 'Not set'}`);
    console.log(`   Theme Color: ${tenant.theme_color}`);
    console.log(`   Support Email: ${tenant.support_email || 'Not set'}`);
    console.log(`   Status: ${tenant.active ? 'Active' : 'Inactive'}\n`);
  } catch (error) {
    spinner.fail('Failed to create tenant');
    throw error;
  }
}

// List tenants
async function listTenants(options = {}) {
  const spinner = createSpinner('Fetching tenants...');
  spinner.start();

  try {
    let query = 'SELECT * FROM tenants';
    const params = [];

    // Apply filters
    if (options.active || options.inactive) {
      query += ' WHERE active = $1';
      params.push(options.active ? true : false);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    const tenants = result.rows;

    spinner.succeed(`Found ${tenants.length} tenant(s)`);

    return tenants;
  } catch (error) {
    spinner.fail('Failed to fetch tenants');
    throw error;
  }
}

// Display tenants in a table
function displayTenantsTable(tenants) {
  if (tenants.length === 0) {
    logger.warning('No tenants found');
    return;
  }

  const table = new Table({
    head: ['Name', 'Domain', 'Subdomain', 'Status', 'Created'],
    colWidths: [25, 30, 20, 10, 12],
  });

  for (const tenant of tenants) {
    const statusColor = tenant.active ? chalk.green : chalk.red;
    const statusIcon = tenant.active ? '🟢' : '🔴';

    table.push([
      tenant.name,
      tenant.domain,
      tenant.subdomain || chalk.gray('N/A'),
      statusColor(`${statusIcon} ${tenant.active ? 'Active' : 'Inactive'}`),
      formatDate(tenant.created_at),
    ]);
  }

  console.log(`\n🏢 Tenants (${tenants.length})\n`);
  console.log(table.toString());
  console.log();
}

// Create tenant admin
async function createTenantAdmin(tenantDomain, adminData) {
  const spinner = createSpinner('Creating tenant admin...');
  spinner.start();

  try {
    // Find tenant
    const tenantResult = await db.query('SELECT id, name FROM tenants WHERE domain = $1 AND active = true', [tenantDomain]);
    if (tenantResult.rows.length === 0) {
      spinner.fail('Tenant not found or inactive');
      return;
    }

    const tenant = tenantResult.rows[0];

    // Check if user already exists
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [adminData.email]);
    if (existingUser.rows.length > 0) {
      spinner.fail('User with this email already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Create user
    const userId = uuidv4();
    const userResult = await db.query(
      `INSERT INTO users (uuid, name, email, password_hash, disabled, tenant_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, false, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      [userId, adminData.name, adminData.email, hashedPassword, tenant.id]
    );

    const newUserId = userResult.rows[0].id;

    // Assign admin role (role_id = 2 for admin, as seen in the database setup)
    await db.query(
      'INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (user_id, role_id) DO NOTHING',
      [newUserId, 2] // admin role
    );

    spinner.succeed('Tenant admin created successfully');

    console.log(chalk.green('\n✅ Tenant Admin Details:'));
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Tenant: ${tenant.name} (${tenantDomain})`);
    console.log(`   Role: Admin`);
    console.log(`   Status: Active\n`);
  } catch (error) {
    spinner.fail('Failed to create tenant admin');
    throw error;
  }
}

// Get tenant info
async function getTenantInfo(domain) {
  const spinner = createSpinner('Fetching tenant information...');
  spinner.start();

  try {
    const result = await db.query('SELECT * FROM tenants WHERE domain = $1 OR subdomain = $1', [domain]);

    if (result.rows.length === 0) {
      spinner.fail('Tenant not found');
      throw new Error('Tenant not found');
    }

    const tenant = result.rows[0];

    // Get tenant users count
    const usersResult = await db.query('SELECT COUNT(*) as count FROM users WHERE tenant_id = $1', [tenant.id]);
    const usersCount = parseInt(usersResult.rows[0].count);

    // Get tenant admins count
    const adminsResult = await db.query(
      `SELECT COUNT(*) as count FROM users u 
       JOIN user_roles ur ON u.id = ur.user_id 
       WHERE u.tenant_id = $1 AND ur.role_id IN (1, 2)`, // superadmin or admin
      [tenant.id]
    );
    const adminsCount = parseInt(adminsResult.rows[0].count);

    spinner.succeed('Tenant information retrieved');

    return {
      ...tenant,
      users_count: usersCount,
      admins_count: adminsCount,
    };
  } catch (error) {
    spinner.fail('Failed to get tenant info');
    throw error;
  }
}

// Display tenant information
function displayTenantInfo(tenant) {
  console.log(chalk.cyan('\n🏢 Tenant Information\n'));

  const table = new Table({
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
    },
  });

  const statusColor = tenant.active ? chalk.green : chalk.red;
  const statusIcon = tenant.active ? '🟢' : '🔴';

  table.push(
    ['ID:', tenant.id],
    ['Name:', tenant.name],
    ['Domain:', tenant.domain],
    ['Subdomain:', tenant.subdomain || chalk.gray('Not set')],
    ['Theme Color:', tenant.theme_color],
    ['Logo URL:', tenant.logo_url || chalk.gray('Not set')],
    ['Support Email:', tenant.support_email || chalk.gray('Not set')],
    ['SSO Enabled:', tenant.sso_enabled ? 'Yes' : 'No'],
    ['MFA Required:', tenant.mfa_required ? 'Yes' : 'No'],
    ['Status:', statusColor(`${statusIcon} ${tenant.active ? 'Active' : 'Inactive'}`)],
    ['Users:', tenant.users_count || 0],
    ['Admins:', tenant.admins_count || 0],
    ['Created:', formatDate(tenant.created_at)],
    ['Updated:', formatDate(tenant.updated_at)],
  );

  console.log(table.toString());
  console.log();
}