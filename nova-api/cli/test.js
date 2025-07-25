#!/usr/bin/env node

/**
 * Nova Universe Platform CLI - Test Version
 * A modern, interactive command-line interface for managing the Nova platform
 */

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

console.log(chalk.cyan('Nova CLI Test'));
console.log(chalk.gray('Testing basic functionality\n'));

// Configure main program
program
  .name('nova')
  .description('Nova Universe CLI - Modern command line interface')
  .version('2.0.0');

// Add a simple test command
program
  .command('test')
  .description('Test command')
  .action(() => {
    console.log(chalk.green('✅ CLI is working!'));
    console.log(chalk.blue('All dependencies are loaded correctly.'));
  });

// Export program
export { program };

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
