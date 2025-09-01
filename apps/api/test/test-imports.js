#!/usr/bin/env node

/**
 * Simple test to verify imports work
 */

console.log('Testing imports...');

try {
  console.log('1. Testing basic imports...');
  const inquirer = await import('inquirer');
  console.log('✓ inquirer imported');
  console.log(`  - inquirer.default.prompt available: ${typeof inquirer.default.prompt === 'function'}`);

  const chalk = await import('chalk');
  console.log('✓ chalk imported');
  console.log(`  - chalk styling: ${chalk.default.green('✓ works')}`);

  const figlet = await import('figlet');
  console.log('✓ figlet imported');

  const ora = await import('ora');
  console.log('✓ ora imported');
  console.log(`  - ora spinner available: ${typeof ora.default === 'function'}`);

  console.log('2. Testing banner creation...');
  const bannerText = figlet.default.textSync('Nova', { font: 'Standard' });
  console.log('✓ Banner created');
  console.log(`  - Banner length: ${bannerText.length} characters`);

  console.log('3. Testing SetupWizardService import...');
  const SetupWizardService = await import('../services/setup-wizard.js');
  console.log('✓ SetupWizardService imported');

  console.log('4. Creating service instance...');
  const service = new SetupWizardService.default();
  console.log('✓ Service instance created');
  console.log(`  - Service type: ${service.constructor.name}`);

  console.log('\nAll imports successful! CLI wizard should work.');
} catch (error) {
  console.error('Import failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
