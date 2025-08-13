#!/usr/bin/env node

/**
 * Nova Universe Platform CLI - Progressive Test
 * Testing command imports progressively
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
console.log(chalk.gray('Progressive test version\n'));

// Configure main program
program
  .name('nova')
  .description('Nova Universe CLI - Progressive test')
  .version('2.0.0');

// Test with just one command first
try {
  console.log('Importing setup command...');
  const { setupCommand } = await import('./commands/setup.js');
  program.addCommand(setupCommand);
  console.log('✅ Setup command imported successfully');
} catch (error) {
  console.error('❌ Failed to import setup command:', error.message);
}

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}
