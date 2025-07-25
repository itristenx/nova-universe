#!/usr/bin/env node

/**
 * Debug CLI - Test basic functionality
 */

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';

console.log('Starting debug CLI...');

const program = new Command();

console.log('Testing figlet...');
try {
  const ascii = figlet.textSync('Nova CLI', {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  console.log(chalk.cyan(ascii));
  console.log('Figlet working!');
} catch (error) {
  console.error('Figlet failed:', error);
}

program
  .name('nova-debug')
  .description('Debug version of Nova CLI')
  .version('1.0.0');

program
  .command('test')
  .description('Test command')
  .action(() => {
    console.log(chalk.green('✅ Test command works!'));
  });

console.log('Program configured, about to parse...');

program.parse();
