/**
 * User Command - Manage Nova Universe users
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import bcrypt from 'bcryptjs';
import Table from 'cli-table3';
import {
  logger,
  createSpinner,
  connectDatabase,
  validateEmail,
  formatDate,
  sleep,
} from '../utils/index.js';

export const userCommand = new Command('user').description('Manage Nova Universe users');

// User create command
userCommand
  .command('create')
  .alias('add')
  .description('Create a new user')
  .option('-e, --email <email>', 'User email address')
  .option('-p, --password <password>', 'User password')
  .option('-r, --role <role>', 'User role (admin, user)', 'user')
  .option('-n, --name <name>', 'User full name')
  .option('--interactive', 'Interactive mode', true)
  .action(async (options) => {
    try {
      let userData = {};

      if (options.interactive || !options.email) {
        userData = await promptUserData(options);
      } else {
        userData = {
          email: options.email,
          password: options.password,
          role: options.role,
          name: options.name,
        };
      }

      await createUser(userData);
    } catch (error) {
      logger.error(`Failed to create user: ${error.message}`);
      process.exit(1);
    }
  });

// User list command
userCommand
  .command('list')
  .alias('ls')
  .description('List all users')
  .option('-r, --role <role>', 'Filter by role')
  .option('-j, --json', 'Output in JSON format')
  .option('--active', 'Show only active users')
  .option('--inactive', 'Show only inactive users')
  .action(async (options) => {
    try {
      const users = await listUsers(options);

      if (options.json) {
        console.log(JSON.stringify(users, null, 2));
      } else {
        displayUsersTable(users);
      }
    } catch (error) {
      logger.error(`Failed to list users: ${error.message}`);
      process.exit(1);
    }
  });

// User update command
userCommand
  .command('update <email>')
  .description('Update user information')
  .option('-p, --password <password>', 'New password')
  .option('-r, --role <role>', 'New role')
  .option('-n, --name <name>', 'New name')
  .option('--activate', 'Activate user')
  .option('--deactivate', 'Deactivate user')
  .action(async (email, options) => {
    try {
      await updateUser(email, options);
    } catch (error) {
      logger.error(`Failed to update user: ${error.message}`);
      process.exit(1);
    }
  });

// User delete command
userCommand
  .command('delete <email>')
  .alias('remove')
  .description('Delete a user')
  .option('-f, --force', 'Skip confirmation')
  .action(async (email, options) => {
    try {
      if (!options.force) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete user ${chalk.yellow(email)}?`,
            default: false,
          },
        ]);

        if (!confirm) {
          logger.info('User deletion cancelled');
          return;
        }
      }

      await deleteUser(email);
    } catch (error) {
      logger.error(`Failed to delete user: ${error.message}`);
      process.exit(1);
    }
  });

// User search command
userCommand
  .command('search <query>')
  .description('Search users by email or name')
  .option('-j, --json', 'Output in JSON format')
  .action(async (query, options) => {
    try {
      const users = await searchUsers(query);

      if (options.json) {
        console.log(JSON.stringify(users, null, 2));
      } else {
        if (users.length === 0) {
          logger.warning('No users found matching the search criteria');
        } else {
          console.log(chalk.cyan(`\n🔍 Found ${users.length} user(s):\n`));
          displayUsersTable(users);
        }
      }
    } catch (error) {
      logger.error(`Failed to search users: ${error.message}`);
      process.exit(1);
    }
  });

// User reset-password command
userCommand
  .command('reset-password <email>')
  .description('Reset user password')
  .option('-p, --password <password>', 'New password')
  .option('--generate', 'Generate random password')
  .action(async (email, options) => {
    try {
      await resetUserPassword(email, options);
    } catch (error) {
      logger.error(`Failed to reset password: ${error.message}`);
      process.exit(1);
    }
  });

// User info command
userCommand
  .command('info <email>')
  .description('Show detailed user information')
  .option('-j, --json', 'Output in JSON format')
  .action(async (email, options) => {
    try {
      const user = await getUserInfo(email);

      if (options.json) {
        console.log(JSON.stringify(user, null, 2));
      } else {
        displayUserInfo(user);
      }
    } catch (error) {
      logger.error(`Failed to get user info: ${error.message}`);
      process.exit(1);
    }
  });

// Prompt for user data
async function promptUserData(options = {}) {
  const questions = [];

  if (!options.email) {
    questions.push({
      type: 'input',
      name: 'email',
      message: 'Email address:',
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
      message: 'Password:',
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
      message: 'Full name (optional):',
    });
  }

  if (!options.role) {
    questions.push({
      type: 'list',
      name: 'role',
      message: 'User role:',
      choices: [
        { name: 'User', value: 'user' },
        { name: 'Admin', value: 'admin' },
      ],
      default: 'user',
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    email: options.email || answers.email,
    password: options.password || answers.password,
    name: options.name || answers.name,
    role: options.role || answers.role,
  };
}

// Create user
async function createUser(userData) {
  const spinner = createSpinner('Creating user...');
  spinner.start();

  try {
    const db = await connectDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email: userData.email });
    if (existingUser) {
      spinner.fail('User already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user document
    const user = {
      email: userData.email,
      password: hashedPassword,
      name: userData.name || '',
      role: userData.role || 'user',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('users').insertOne(user);

    spinner.succeed('User created successfully');

    console.log(chalk.green('\n✅ User Details:'));
    console.log(`   Email: ${userData.email}`);
    console.log(`   Name: ${userData.name || 'Not provided'}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Status: Active\n`);
  } catch (error) {
    spinner.fail('Failed to create user');
    throw error;
  }
}

// List users
async function listUsers(options = {}) {
  const spinner = createSpinner('Fetching users...');
  spinner.start();

  try {
    const db = await connectDatabase();

    let query = {};

    // Apply filters
    if (options.role) {
      query.role = options.role;
    }

    if (options.active) {
      query.active = true;
    } else if (options.inactive) {
      query.active = false;
    }

    const users = await db
      .collection('users')
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    spinner.succeed(`Found ${users.length} user(s)`);

    return users;
  } catch (error) {
    spinner.fail('Failed to fetch users');
    throw error;
  }
}

// Display users in a table
function displayUsersTable(users) {
  if (users.length === 0) {
    logger.warning('No users found');
    return;
  }

  const table = new Table({
    head: ['Email', 'Name', 'Role', 'Status', 'Created'],
    colWidths: [30, 20, 10, 10, 12],
  });

  for (const user of users) {
    const statusColor = user.active ? chalk.green : chalk.red;
    const statusIcon = user.active ? '🟢' : '🔴';
    const roleColor = user.role === 'admin' ? chalk.yellow : chalk.blue;

    table.push([
      user.email,
      user.name || chalk.gray('N/A'),
      roleColor(user.role),
      statusColor(`${statusIcon} ${user.active ? 'Active' : 'Inactive'}`),
      formatDate(user.createdAt),
    ]);
  }

  console.log(`\n👥 Users (${users.length})\n`);
  console.log(table.toString());
  console.log();
}

// Update user
async function updateUser(email, options) {
  const spinner = createSpinner('Updating user...');
  spinner.start();

  try {
    const db = await connectDatabase();

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      spinner.fail('User not found');
      return;
    }

    const updates = { updatedAt: new Date() };

    if (options.password) {
      updates.password = await bcrypt.hash(options.password, 10);
    }

    if (options.role) {
      updates.role = options.role;
    }

    if (options.name) {
      updates.name = options.name;
    }

    if (options.activate) {
      updates.active = true;
    } else if (options.deactivate) {
      updates.active = false;
    }

    await db.collection('users').updateOne({ email }, { $set: updates });

    spinner.succeed('User updated successfully');

    // Show updated user info
    const updatedUser = await db
      .collection('users')
      .findOne({ email }, { projection: { password: 0 } });

    console.log(chalk.green('\n✅ Updated User:'));
    displayUserInfo(updatedUser);
  } catch (error) {
    spinner.fail('Failed to update user');
    throw error;
  }
}

// Delete user
async function deleteUser(email) {
  const spinner = createSpinner('Deleting user...');
  spinner.start();

  try {
    const db = await connectDatabase();

    const result = await db.collection('users').deleteOne({ email });

    if (result.deletedCount === 0) {
      spinner.fail('User not found');
      return;
    }

    spinner.succeed('User deleted successfully');
    logger.success(`User ${email} has been removed from the system`);
  } catch (error) {
    spinner.fail('Failed to delete user');
    throw error;
  }
}

// Search users
async function searchUsers(query) {
  const spinner = createSpinner('Searching users...');
  spinner.start();

  try {
    const db = await connectDatabase();

    const searchQuery = {
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
    };

    const users = await db
      .collection('users')
      .find(searchQuery, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    spinner.succeed(`Found ${users.length} user(s) matching "${query}"`);

    return users;
  } catch (error) {
    spinner.fail('Search failed');
    throw error;
  }
}

// Reset user password
async function resetUserPassword(email, options) {
  const spinner = createSpinner('Resetting password...');
  spinner.start();

  try {
    const db = await connectDatabase();

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      spinner.fail('User not found');
      return;
    }

    let newPassword = options.password;

    if (options.generate) {
      // Generate random password
      newPassword = Math.random().toString(36).slice(-12);
    } else if (!newPassword) {
      // Prompt for password
      const { password } = await inquirer.prompt([
        {
          type: 'password',
          name: 'password',
          message: 'New password:',
          validate: (input) => {
            if (!input) return 'Password is required';
            if (input.length < 8) return 'Password must be at least 8 characters';
            return true;
          },
        },
      ]);
      newPassword = password;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection('users').updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    );

    spinner.succeed('Password reset successfully');

    console.log(chalk.green('\n✅ Password Reset Complete:'));
    console.log(`   User: ${email}`);
    if (options.generate) {
      console.log(chalk.yellow(`   New Password: ${newPassword}`));
      console.log(chalk.gray('   Please share this password securely with the user'));
    }
    console.log();
  } catch (error) {
    spinner.fail('Failed to reset password');
    throw error;
  }
}

// Get user info
async function getUserInfo(email) {
  const spinner = createSpinner('Fetching user information...');
  spinner.start();

  try {
    const db = await connectDatabase();

    const user = await db.collection('users').findOne({ email }, { projection: { password: 0 } });

    if (!user) {
      spinner.fail('User not found');
      throw new Error('User not found');
    }

    spinner.succeed('User information retrieved');

    return user;
  } catch (error) {
    spinner.fail('Failed to get user info');
    throw error;
  }
}

// Display user information
function displayUserInfo(user) {
  console.log(chalk.cyan('\n👤 User Information\n'));

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

  const statusColor = user.active ? chalk.green : chalk.red;
  const statusIcon = user.active ? '🟢' : '🔴';
  const roleColor = user.role === 'admin' ? chalk.yellow : chalk.blue;

  table.push(
    ['Email:', user.email],
    ['Name:', user.name || chalk.gray('Not provided')],
    ['Role:', roleColor(user.role)],
    ['Status:', statusColor(`${statusIcon} ${user.active ? 'Active' : 'Inactive'}`)],
    ['Created:', formatDate(user.createdAt)],
    ['Updated:', formatDate(user.updatedAt)],
  );

  console.log(table.toString());
  console.log();
}
