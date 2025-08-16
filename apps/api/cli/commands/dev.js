/**
 * Dev Command - Development tools and utilities
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { spawn } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';
import Table from 'cli-table3';
import { 
  logger, 
  createSpinner, 
  runCommand,
  getProjectRoot,
  checkServiceStatus,
  sleep
} from '../utils/index.js';

export const devCommand = new Command('dev')
  .description('Development tools and utilities');

// Dev start command
devCommand
  .command('start')
  .description('Start development environment')
  .option('-w, --watch', 'Enable watch mode', true)
  .option('-d, --debug', 'Enable debug mode')
  .option('--hot', 'Enable hot reload')
  .action(async (options) => {
    try {
      await startDevelopment(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Failed to start development: ${error.message}`);
      process.exit(1);
    }
  });

// Dev test command
devCommand
  .command('test')
  .description('Run tests')
  .option('-w, --watch', 'Watch mode')
  .option('-c, --coverage', 'Generate coverage report')
  .option('-u, --update', 'Update snapshots')
  .option('-t, --testNamePattern <pattern>', 'Run tests matching pattern')
  .option('--integration', 'Run integration tests')
  .option('--unit', 'Run unit tests only')
  .action(async (options) => {
    try {
      await runTests(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Tests failed: ${error.message}`);
      process.exit(1);
    }
  });

// Dev lint command
devCommand
  .command('lint')
  .description('Run linting')
  .option('-f, --fix', 'Auto-fix issues')
  .option('--staged', 'Lint staged files only')
  .action(async (options) => {
    try {
      await runLinting(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Linting failed: ${error.message}`);
      process.exit(1);
    }
  });

// Dev build command
devCommand
  .command('build')
  .description('Build the application')
  .option('-p, --production', 'Production build')
  .option('-w, --watch', 'Watch mode')
  .option('--analyze', 'Analyze bundle')
  .action(async (options) => {
    try {
      await buildApplication(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Build failed: ${error.message}`);
      process.exit(1);
    }
  });

// Dev deps command
devCommand
  .command('deps')
  .description('Manage dependencies')
  .option('--check', 'Check for outdated packages')
  .option('--update', 'Update packages')
  .option('--audit', 'Security audit')
  .option('--clean', 'Clean node_modules and reinstall')
  .action(async (options) => {
    try {
      await manageDependencies(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Dependency management failed: ${error.message}`);
      process.exit(1);
    }
  });

// Dev db command
devCommand
  .command('db')
  .description('Database development tools')
  .option('--migrate', 'Run migrations')
  .option('--seed', 'Seed database')
  .option('--reset', 'Reset database')
  .option('--studio', 'Open database studio')
  .action(async (options) => {
    try {
      await databaseTools(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Database operation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Dev generate command
devCommand
  .command('generate <type>')
  .alias('gen')
  .description('Generate code scaffolding (component, route, model)')
  .option('-n, --name <name>', 'Name of the generated item')
  .option('-d, --directory <dir>', 'Target directory')
  .action(async (type, options) => {
    try {
      await generateCode(type, options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Code generation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Dev docs command
devCommand
  .command('docs')
  .description('Generate or serve documentation')
  .option('-s, --serve', 'Serve documentation locally')
  .option('-g, --generate', 'Generate documentation')
  .option('-p, --port <port>', 'Port for documentation server', '8080')
  .action(async (options) => {
    try {
      await manageDocs(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Documentation command failed: ${error.message}`);
      process.exit(1);
    }
  });

// Start development environment
async function startDevelopment(options) {
  console.log(chalk.cyan('🚀 Starting Nova Universe development environment...\n'));

  const projectRoot = getProjectRoot();
  const processes = [];

  // Set environment variables
  process.env.NODE_ENV = 'development';
  if (options.debug) {
    process.env.DEBUG = '*';
  }

  // Start API server
  console.log(chalk.blue('📡 Starting API server...'));
  const apiProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(projectRoot, 'nova-api'),
    stdio: 'pipe',
    env: { ...process.env, PORT: '3000' }
  });

  processes.push({ name: 'API', process: apiProcess, port: 3000 });

  // Start frontend dev server
  console.log(chalk.blue('🎨 Starting frontend server...'));
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(projectRoot, 'nova-core'),
    stdio: 'pipe',
    env: { ...process.env, PORT: '5173' }
  });

  processes.push({ name: 'Frontend', process: frontendProcess, port: 5173 });

  // Start comms service if it exists
  const commsPath = path.join(projectRoot, 'nova-comms');
  if (existsSync(commsPath)) {
    console.log(chalk.blue('📞 Starting communications service...'));
    const commsProcess = spawn('npm', ['run', 'dev'], {
      cwd: commsPath,
      stdio: 'pipe',
      env: { ...process.env, PORT: '3001' }
    });

    processes.push({ name: 'Comms', process: commsProcess, port: 3001 });
  }

  // Set up process monitoring
  for (const { name, process: proc, port } of processes) {
    proc.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(chalk.gray(`[${name}] ${output}`));
      }
    });

    proc.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('ExperimentalWarning')) {
        console.log(chalk.yellow(`[${name}] ${output}`));
      }
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.log(chalk.red(`[${name}] Process exited with code ${code}`));
      }
    });
  }

  // Wait for services to start
  console.log(chalk.cyan('\n⏳ Waiting for services to start...\n'));
  await sleep(3000); // TODO-LINT: move to async function

  // Check service status
  const status = await checkServiceStatus(); // TODO-LINT: move to async function
  displayServiceStatus(status);

  console.log(chalk.green('\n🎉 Development environment is ready!\n'));
  console.log(chalk.cyan('📱 Frontend:'), chalk.blue('http://localhost:5173'));
  console.log(chalk.cyan('🔧 API:'), chalk.blue('http://localhost:3000'));
  if (processes.find(p => p.name === 'Comms')) {
    console.log(chalk.cyan('📞 Comms:'), chalk.blue('http://localhost:3001'));
  }

  console.log(chalk.gray('\nPress Ctrl+C to stop all services\n'));

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down development environment...'));
    
    processes.forEach(({ name, process: proc }) => {
      console.log(chalk.gray(`Stopping ${name}...`));
      proc.kill('SIGTERM');
    });

    setTimeout(() => {
      processes.forEach(({ process: proc }) => {
        proc.kill('SIGKILL');
      });
      process.exit(0);
    }, 5000);
  });

  // Keep the process alive
  await new Promise(() => {}); // TODO-LINT: move to async function
}

// Run tests
async function runTests(options) {
  console.log(chalk.cyan('🧪 Running tests...\n'));

  const projectRoot = getProjectRoot();
  const testCommands = [];

  // Determine test type
  if (options.unit) {
    testCommands.push(['npm', ['run', 'test:unit']]);
  } else if (options.integration) {
    testCommands.push(['npm', ['run', 'test:integration']]);
  } else {
    // Run all tests
    testCommands.push(['npm', ['test']]);
  }

  const jestOptions = [];
  
  if (options.watch) {
    jestOptions.push('--watch');
  }
  
  if (options.coverage) {
    jestOptions.push('--coverage');
  }
  
  if (options.update) {
    jestOptions.push('--updateSnapshot');
  }
  
  if (options.testNamePattern) {
    jestOptions.push('--testNamePattern', options.testNamePattern);
  }

  for (const [command, args] of testCommands) {
    console.log(chalk.blue(`Running: ${command} ${args.join(' ')} ${jestOptions.join(' ')}`));
    
    try {
      await runCommand(command, [...args, ...jestOptions], {
        cwd: projectRoot,
        stdio: 'inherit'
      }); // TODO-LINT: move to async function
    } catch (error) {
      if (!options.watch) {
        throw error;
      }
    }
  }

  if (!options.watch) {
    logger.success('✅ All tests completed');
  }
}

// Run linting
async function runLinting(options) {
  console.log(chalk.cyan('🔍 Running linting...\n'));

  const projectRoot = getProjectRoot();
  const lintCommands = [];

  // Check if ESLint config exists
  const eslintConfigFiles = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js'];
  const hasEslint = eslintConfigFiles.some(file => existsSync(path.join(projectRoot, file)));

  if (hasEslint) {
    const eslintArgs = ['run', 'lint'];
    if (options.fix) {
      eslintArgs.push('--', '--fix');
    }
    lintCommands.push(['npm', eslintArgs]);
  }

  // Check for Prettier
  if (existsSync(path.join(projectRoot, '.prettierrc')) || 
      existsSync(path.join(projectRoot, 'prettier.config.js'))) {
    if (options.fix) {
      lintCommands.push(['npm', ['run', 'format']]);
    } else {
      lintCommands.push(['npm', ['run', 'format:check']]);
    }
  }

  if (lintCommands.length === 0) {
    logger.warning('No linting configuration found');
    return;
  }

  for (const [command, args] of lintCommands) {
    const spinner = createSpinner(`Running ${command} ${args.join(' ')}...`);
    spinner.start();

    try {
      await runCommand(command, args, { cwd: projectRoot }); // TODO-LINT: move to async function
      spinner.succeed(`${command} completed`);
    } catch (error) {
      spinner.fail(`${command} failed`);
      if (!options.staged) {
        throw error;
      }
    }
  }

  logger.success('✅ Linting completed');
}

// Build application
async function buildApplication(options) {
  console.log(chalk.cyan('🏗️  Building application...\n'));

  const projectRoot = getProjectRoot();
  const services = ['nova-api', 'nova-core'];

  if (existsSync(path.join(projectRoot, 'nova-comms'))) {
    services.push('nova-comms');
  }

  const buildPromises = services.map(async (service) => {
    const servicePath = path.join(projectRoot, service);
    
    if (!existsSync(servicePath)) {
      return;
    }

    const spinner = createSpinner(`Building ${service}...`);
    spinner.start();

    try {
      const buildArgs = options.production ? ['run', 'build'] : ['run', 'build:dev'];
      
      if (options.watch && service === 'nova-core') {
        buildArgs.push('--', '--watch');
      }

      await runCommand('npm', buildArgs, { 
        cwd: servicePath,
        silent: !options.watch 
      }); // TODO-LINT: move to async function

      spinner.succeed(`${service} built successfully`);
    } catch (error) {
      spinner.fail(`${service} build failed`);
      throw error;
    }
  });

  await Promise.all(buildPromises); // TODO-LINT: move to async function

  if (options.analyze) {
    console.log(chalk.cyan('\n📊 Analyzing bundle...\n'));
    
    try {
      await runCommand('npm', ['run', 'analyze'], {
        cwd: path.join(projectRoot, 'nova-core')
      }); // TODO-LINT: move to async function
    } catch (error) {
      logger.warning('Bundle analysis not available');
    }
  }

  logger.success('✅ Build completed successfully');
}

// Manage dependencies
async function manageDependencies(options) {
  const projectRoot = getProjectRoot();

  if (options.check) {
    console.log(chalk.cyan('🔍 Checking for outdated packages...\n'));
    
    const services = ['nova-api', 'nova-core', 'nova-comms'];
    
    for (const service of services) {
      const servicePath = path.join(projectRoot, service);
      if (existsSync(servicePath)) {
        console.log(chalk.blue(`\n📦 ${service}:`));
        try {
          await runCommand('npm', ['outdated'], { cwd: servicePath }); // TODO-LINT: move to async function
        } catch (error) {
          // npm outdated returns exit code 1 when outdated packages are found
          console.log(chalk.gray('All packages are up to date'));
        }
      }
    }
  }

  if (options.audit) {
    console.log(chalk.cyan('🔒 Running security audit...\n'));
    
    const services = ['nova-api', 'nova-core', 'nova-comms'];
    
    for (const service of services) {
      const servicePath = path.join(projectRoot, service);
      if (existsSync(servicePath)) {
        console.log(chalk.blue(`\n🔍 Auditing ${service}:`));
        try {
          await runCommand('npm', ['audit'], { cwd: servicePath }); // TODO-LINT: move to async function
        } catch (error) {
          console.log(chalk.yellow('Security vulnerabilities found'));
        }
      }
    }
  }

  if (options.update) {
    console.log(chalk.cyan('📦 Updating packages...\n'));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'This will update all packages. Continue?',
        default: false
      }
    ]); // TODO-LINT: move to async function

    if (confirm) {
      const services = ['nova-api', 'nova-core', 'nova-comms'];
      
      for (const service of services) {
        const servicePath = path.join(projectRoot, service);
        if (existsSync(servicePath)) {
          const spinner = createSpinner(`Updating ${service} packages...`);
          spinner.start();
          
          try {
            await runCommand('npm', ['update'], { cwd: servicePath }); // TODO-LINT: move to async function
            spinner.succeed(`${service} packages updated`);
          } catch (error) {
            spinner.fail(`${service} update failed`);
          }
        }
      }
    }
  }

  if (options.clean) {
    console.log(chalk.cyan('🧹 Cleaning and reinstalling dependencies...\n'));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'This will delete node_modules and reinstall. Continue?',
        default: false
      }
    ]); // TODO-LINT: move to async function

    if (confirm) {
      const services = ['nova-api', 'nova-core', 'nova-comms'];
      
      for (const service of services) {
        const servicePath = path.join(projectRoot, service);
        if (existsSync(servicePath)) {
          const spinner = createSpinner(`Cleaning ${service}...`);
          spinner.start();
          
          try {
            await runCommand('rm', ['-rf', 'node_modules'], { cwd: servicePath }); // TODO-LINT: move to async function
            await runCommand('npm', ['install'], { cwd: servicePath }); // TODO-LINT: move to async function
            spinner.succeed(`${service} dependencies reinstalled`);
          } catch (error) {
            spinner.fail(`${service} clean failed`);
          }
        }
      }
    }
  }
}

// Database development tools
async function databaseTools(options) {
  const projectRoot = getProjectRoot();

  if (options.migrate) {
    console.log(chalk.cyan('📊 Running database migrations...\n'));
    
    try {
      await runCommand('npm', ['run', 'migrate'], { cwd: projectRoot }); // TODO-LINT: move to async function
      logger.success('✅ Migrations completed');
    } catch (error) {
      logger.error('Migration failed');
      throw error;
    }
  }

  if (options.seed) {
    console.log(chalk.cyan('🌱 Seeding database...\n'));
    
    try {
      await runCommand('npm', ['run', 'seed'], { cwd: projectRoot }); // TODO-LINT: move to async function
      logger.success('✅ Database seeded');
    } catch (error) {
      logger.error('Seeding failed');
      throw error;
    }
  }

  if (options.reset) {
    console.log(chalk.cyan('🔄 Resetting database...\n'));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'This will delete all data. Continue?',
        default: false
      }
    ]); // TODO-LINT: move to async function

    if (confirm) {
      try {
        await runCommand('npm', ['run', 'db:reset'], { cwd: projectRoot }); // TODO-LINT: move to async function
        logger.success('✅ Database reset');
      } catch (error) {
        logger.error('Reset failed');
        throw error;
      }
    }
  }

  if (options.studio) {
    console.log(chalk.cyan('🎨 Opening database studio...\n'));
    
    try {
      await runCommand('npm', ['run', 'db:studio'], { 
        cwd: projectRoot,
        stdio: 'inherit'
      }); // TODO-LINT: move to async function
    } catch (error) {
      logger.error('Failed to open database studio');
    }
  }
}

// Generate code scaffolding
async function generateCode(type, options) {
  console.log(chalk.cyan(`🎭 Generating ${type}...\n`));

  const projectRoot = getProjectRoot();
  
  if (!options.name) {
    const { name } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: `Enter ${type} name:`,
        validate: (input) => input.trim() !== '' || 'Name is required'
      }
    ]); // TODO-LINT: move to async function
    options.name = name;
  }

  switch (type) {
    case 'component':
      await generateComponent(options, projectRoot); // TODO-LINT: move to async function
      break;
    case 'route':
      await generateRoute(options, projectRoot); // TODO-LINT: move to async function
      break;
    case 'model':
      await generateModel(options, projectRoot); // TODO-LINT: move to async function
      break;
    case 'api':
      await generateAPI(options, projectRoot); // TODO-LINT: move to async function
      break;
    default:
      throw new Error(`Unknown generator type: ${type}`);
  }

  logger.success(`✅ ${type} generated successfully`);
}

// Generate React component
async function generateComponent(options, projectRoot) {
  const componentName = options.name;
  const targetDir = options.directory || 'nova-core/src/components';
  const componentPath = path.join(projectRoot, targetDir, componentName);

  // Create component directory
  await runCommand('mkdir', ['-p', componentPath]); // TODO-LINT: move to async function

  // Generate component file
  const componentContent = `import React from 'react';
import './${componentName}.css';

interface ${componentName}Props {
  // Define props here
}

const ${componentName}: React.FC<${componentName}Props> = () => {
  return (
    <div className="${componentName.toLowerCase()}">
      <h1>${componentName}</h1>
      {/* Component content here */}
    </div>
  );
};

export default ${componentName};
`;

  const cssContent = `.${componentName.toLowerCase()} {
  /* Component styles here */
}
`;

  require('fs').writeFileSync(path.join(componentPath, `${componentName}.tsx`), componentContent);
  require('fs').writeFileSync(path.join(componentPath, `${componentName}.css`), cssContent);
  require('fs').writeFileSync(path.join(componentPath, 'index.ts'), `export { default } from './${componentName}';`);
}

// Generate API route
async function generateRoute(options, projectRoot) {
  const routeName = options.name;
  const targetDir = options.directory || 'nova-api/routes';
  const routePath = path.join(projectRoot, targetDir, `${routeName}.js`);

  const routeContent = `/**
 * ${routeName} API routes
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /${routeName}
router.get('/', authenticate, async (req, res) => {
  try {
    // Implementation here
    res.json({ message: '${routeName} endpoint' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /${routeName}
router.post('/', authenticate, async (req, res) => {
  try {
    // Implementation here
    res.json({ message: '${routeName} created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
`;

  require('fs').writeFileSync(routePath, routeContent);
}

// Generate database model
async function generateModel(options, projectRoot) {
  const modelName = options.name;
  const targetDir = options.directory || 'nova-api/models';
  const modelPath = path.join(projectRoot, targetDir, `${modelName}.js`);

  const modelContent = `/**
 * ${modelName} model
 */

class ${modelName} {
  constructor(data = {}) {
    this.id = data.id;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    
    // Add model properties here
  }

  static async findById(id) {
    // Implementation here
  }

  static async findAll(filters = {}) {
    // Implementation here
  }

  async save() {
    // Implementation here
    this.updatedAt = new Date();
  }

  async delete() {
    // Implementation here
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
      // Add other properties
    };
  }
}

export default ${modelName};
`;

  require('fs').writeFileSync(modelPath, modelContent);
}

// Generate API endpoint
async function generateAPI(options, projectRoot) {
  // This would generate both route and controller
  await generateRoute(options, projectRoot); // TODO-LINT: move to async function
  
  // Generate controller
  const controllerName = options.name;
  const targetDir = 'nova-api/controllers';
  const controllerPath = path.join(projectRoot, targetDir, `${controllerName}Controller.js`);

  const controllerContent = `/**
 * ${controllerName} controller
 */

export class ${controllerName}Controller {
  static async index(req, res) {
    try {
      // List all items
      res.json({ data: [] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async show(req, res) {
    try {
      // Show single item
      const { id } = req.params;
      res.json({ data: { id } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      // Create new item
      const data = req.body;
      res.status(201).json({ data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      // Update item
      const { id } = req.params;
      const data = req.body;
      res.json({ data: { id, ...data } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async destroy(req, res) {
    try {
      // Delete item
      const { id } = req.params;
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
`;

  // Ensure controller directory exists
  await runCommand('mkdir', ['-p', path.join(projectRoot, targetDir)]); // TODO-LINT: move to async function
  require('fs').writeFileSync(controllerPath, controllerContent);
}

// Manage documentation
async function manageDocs(options) {
  const projectRoot = getProjectRoot();

  if (options.generate) {
    console.log(chalk.cyan('📚 Generating documentation...\n'));
    
    const spinner = createSpinner('Generating API documentation...');
    spinner.start();

    try {
      // Generate JSDoc documentation
      await runCommand('npm', ['run', 'docs:generate'], { cwd: projectRoot }); // TODO-LINT: move to async function
      spinner.succeed('Documentation generated');
      
      logger.success('✅ Documentation generated in ./docs');
    } catch (error) {
      spinner.fail('Documentation generation failed');
      throw error;
    }
  }

  if (options.serve) {
    console.log(chalk.cyan('📖 Starting documentation server...\n'));
    
    const port = options.port;
    const docsPath = path.join(projectRoot, 'docs');

    if (!existsSync(docsPath)) {
      logger.warning('Documentation not found. Run with --generate first.');
      return;
    }

    console.log(chalk.green(`📚 Documentation server starting on port ${port}`));
    console.log(chalk.blue(`🌐 Open: http://localhost:${port}`));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));

    // Start simple HTTP server
    const server = spawn('npx', ['http-server', docsPath, '-p', port, '-o'], {
      stdio: 'inherit'
    });

    process.on('SIGINT', () => {
      server.kill();
      process.exit(0);
    });
  }
}

// Display service status
function displayServiceStatus(status) {
  const table = new Table({
    head: ['Service', 'Status', 'Port'],
    colWidths: [15, 15, 10]
  });

  for (const [key, service] of Object.entries(status)) {
    const statusColor = service.status === 'running' ? chalk.green : chalk.red;
    const statusIcon = service.status === 'running' ? '🟢' : '🔴';
    
    table.push([
      service.name,
      statusColor(`${statusIcon} ${service.status}`),
      service.port
    ]);
  }

  console.log(table.toString());
}
