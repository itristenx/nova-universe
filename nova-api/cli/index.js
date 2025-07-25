#!/usr/bin/env node

/**
 * Nova Universe Platform CLI
 * A modern, interactive command-line interface for managing the Nova platform
 */

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';

const program = new Command();

// ASCII Art Banner
console.log(chalk.cyan(figlet.textSync('Nova CLI', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default'
})));

console.log(chalk.gray('Nova Universe Command Line Interface'));
console.log(chalk.gray('Modern development tools for the Nova platform\n'));

// Configure main program
program
  .name('nova')
  .description('Nova Universe CLI - Modern command line interface')
  .version('2.0.0');

// Load commands dynamically
async function loadCommands() {
  const commands = [
    { name: 'setup', file: './commands/setup.js', export: 'setupCommand' },
    { name: 'service', file: './commands/service.js', export: 'serviceCommand' },
    { name: 'user', file: './commands/user.js', export: 'userCommand' },
    { name: 'config', file: './commands/config.js', export: 'configCommand' },
    { name: 'backup', file: './commands/backup.js', export: 'backupCommand' },
    { name: 'dev', file: './commands/dev.js', export: 'devCommand' },
    { name: 'health', file: './commands/health.js', export: 'healthCommand' },
    { name: 'logs', file: './commands/logs.js', export: 'logsCommand' },
    { name: 'dashboard', file: './commands/dashboard.js', export: 'dashboardCommand' }
  ];

  for (const { name, file, export: exportName } of commands) {
    try {
      const module = await import(file);
      if (module[exportName]) {
        program.addCommand(module[exportName]);
      } else {
        console.warn(chalk.yellow(`⚠️  ${name} command export '${exportName}' not found`));
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Failed to load ${name} command: ${error.message}`));
    }
  }
}

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\nUnexpected error:'), error.message);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\nUnhandled promise rejection:'), reason);
  if (process.env.DEBUG) {
    console.error(promise);
  }
  process.exit(1);
});

// Enhanced help
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name() + ' ' + cmd.usage()
});

// Custom help text
program.addHelpText('after', `
${chalk.cyan('Examples:')}
  ${chalk.gray('$')} nova setup                    ${chalk.dim('# Interactive setup wizard')}
  ${chalk.gray('$')} nova service start            ${chalk.dim('# Start all services')}
  ${chalk.gray('$')} nova user create              ${chalk.dim('# Create a new user')}
  ${chalk.gray('$')} nova config get DATABASE_URL  ${chalk.dim('# Get configuration value')}
  ${chalk.gray('$')} nova backup create --all      ${chalk.dim('# Create full backup')}
  ${chalk.gray('$')} nova dev start                ${chalk.dim('# Start development environment')}
  ${chalk.gray('$')} nova health check             ${chalk.dim('# System health check')}
  ${chalk.gray('$')} nova logs view api --follow   ${chalk.dim('# Follow API logs')}
  ${chalk.gray('$')} nova dashboard start          ${chalk.dim('# Start web dashboard')}

${chalk.cyan('Command Categories:')}
  ${chalk.yellow('Setup:')}      setup
  ${chalk.yellow('Services:')}   service, health, logs
  ${chalk.yellow('Users:')}      user
  ${chalk.yellow('Config:')}     config
  ${chalk.yellow('Data:')}       backup
  ${chalk.yellow('Development:')} dev
  ${chalk.yellow('Monitoring:')} dashboard

${chalk.cyan('Documentation:')}
  ${chalk.blue('https://github.com/nova-universe/nova-universe')}

${chalk.cyan('Support:')}
  ${chalk.blue('https://github.com/nova-universe/nova-universe/issues')}
`);

export { program };

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  await loadCommands();
  program.parse();
}
