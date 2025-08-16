/**
 * Health Command - System health monitoring and diagnostics
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { existsSync, statSync } from 'fs';
import path from 'path';
import os from 'os';
import Table from 'cli-table3';
import {
  logger,
  createSpinner,
  runCommand,
  getProjectRoot,
  checkServiceStatus,
  connectDatabase,
  formatFileSize,
  formatDuration,
} from '../utils/index.js';

export const healthCommand = new Command('health').description(
  'System health monitoring and diagnostics',
);

// Health check command
healthCommand
  .command('check')
  .description('Run comprehensive health check')
  .option('-v, --verbose', 'Verbose output')
  .option('-j, --json', 'Output in JSON format')
  .option('--services', 'Check services only')
  .option('--system', 'Check system resources only')
  .option('--database', 'Check database only')
  .action(async (options) => {
    try {
      await runHealthCheck(options);
    } catch (error) {
      logger.error(`Health check failed: ${error.message}`);
      process.exit(1);
    }
  });

// System info command
healthCommand
  .command('system')
  .description('Show system information')
  .option('-j, --json', 'Output in JSON format')
  .action(async (options) => {
    try {
      await showSystemInfo(options);
    } catch (error) {
      logger.error(`Failed to get system info: ${error.message}`);
      process.exit(1);
    }
  });

// Monitor command
healthCommand
  .command('monitor')
  .description('Continuous health monitoring')
  .option('-i, --interval <seconds>', 'Update interval in seconds', '5')
  .option('--alerts', 'Enable alerts for issues')
  .action(async (options) => {
    try {
      await startMonitoring(options);
    } catch (error) {
      logger.error(`Monitoring failed: ${error.message}`);
      process.exit(1);
    }
  });

// Diagnostics command
healthCommand
  .command('diagnose')
  .description('Run diagnostic tests')
  .option('--fix', 'Attempt to fix issues automatically')
  .action(async (options) => {
    try {
      await runDiagnostics(options);
    } catch (error) {
      logger.error(`Diagnostics failed: ${error.message}`);
      process.exit(1);
    }
  });

// Run comprehensive health check
async function runHealthCheck(options) {
  console.log(chalk.cyan('🏥 Nova Universe Health Check\n'));

  const results = {
    timestamp: new Date().toISOString(),
    overall: 'healthy',
    checks: {},
  };

  const checks = [];

  // Determine which checks to run
  if (!options.services && !options.system && !options.database) {
    // Run all checks
    checks.push(
      { name: 'System Resources', check: checkSystemResources },
      { name: 'Services', check: checkServices },
      { name: 'Database', check: checkDatabase },
      { name: 'File System', check: checkFileSystem },
      { name: 'Dependencies', check: checkDependencies },
      { name: 'Configuration', check: checkConfiguration },
    );
  } else {
    if (options.system) {
      checks.push({ name: 'System Resources', check: checkSystemResources });
    }
    if (options.services) {
      checks.push({ name: 'Services', check: checkServices });
    }
    if (options.database) {
      checks.push({ name: 'Database', check: checkDatabase });
    }
  }

  // Run health checks
  for (const { name, check } of checks) {
    const spinner = createSpinner(`Checking ${name.toLowerCase()}...`);
    spinner.start();

    try {
      const result = await check(options.verbose);
      results.checks[name] = result;

      if (result.status === 'healthy') {
        spinner.succeed(`${name}: ${chalk.green('Healthy')}`);
      } else if (result.status === 'warning') {
        spinner.warn(`${name}: ${chalk.yellow('Warning')}`);
        results.overall = 'warning';
      } else {
        spinner.fail(`${name}: ${chalk.red('Critical')}`);
        results.overall = 'critical';
      }

      if (options.verbose && result.details) {
        for (const detail of result.details) {
          const icon = detail.status === 'ok' ? '✅' : detail.status === 'warning' ? '⚠️' : '❌';
          console.log(chalk.gray(`   ${icon} ${detail.message}`));
        }
      }
    } catch (error) {
      spinner.fail(`${name}: ${chalk.red('Error')}`);
      results.checks[name] = {
        status: 'error',
        message: error.message,
      };
      results.overall = 'critical';
    }
  }

  // Display summary
  console.log(chalk.cyan('\n📊 Health Summary\n'));

  const overallColor =
    results.overall === 'healthy'
      ? chalk.green
      : results.overall === 'warning'
        ? chalk.yellow
        : chalk.red;
  const overallIcon =
    results.overall === 'healthy' ? '🟢' : results.overall === 'warning' ? '🟡' : '🔴';

  console.log(
    `Overall Status: ${overallColor(`${overallIcon} ${results.overall.toUpperCase()}`)}\n`,
  );

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    displayHealthSummary(results);
  }

  // Exit with appropriate code
  if (results.overall === 'critical') {
    process.exit(1);
  } else if (results.overall === 'warning') {
    process.exit(2);
  }
}

// Check system resources
async function checkSystemResources(verbose = false) {
  const result = {
    status: 'healthy',
    details: [],
  };

  // Memory usage
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsage = (usedMem / totalMem) * 100;

  result.details.push({
    status: memoryUsage > 90 ? 'error' : memoryUsage > 80 ? 'warning' : 'ok',
    message: `Memory: ${formatFileSize(usedMem)} / ${formatFileSize(totalMem)} (${memoryUsage.toFixed(1)}%)`,
  });

  if (memoryUsage > 90) {
    result.status = 'critical';
  } else if (memoryUsage > 80) {
    result.status = 'warning';
  }

  // CPU load
  const loadAvg = os.loadavg();
  const cpuCount = os.cpus().length;
  const loadPercentage = (loadAvg[0] / cpuCount) * 100;

  result.details.push({
    status: loadPercentage > 100 ? 'error' : loadPercentage > 80 ? 'warning' : 'ok',
    message: `CPU Load: ${loadAvg[0].toFixed(2)} (${loadPercentage.toFixed(1)}%)`,
  });

  if (loadPercentage > 100 && result.status !== 'critical') {
    result.status = 'critical';
  } else if (loadPercentage > 80 && result.status === 'healthy') {
    result.status = 'warning';
  }

  // Disk space
  try {
    const projectRoot = getProjectRoot();
    const { stdout } = await runCommand('df', ['-h', projectRoot], { silent: true });
    const lines = stdout.split('\n');
    const diskLine = lines[1];
    const parts = diskLine.split(/\s+/);
    const usage = parseInt(parts[4]);

    result.details.push({
      status: usage > 95 ? 'error' : usage > 85 ? 'warning' : 'ok',
      message: `Disk Usage: ${parts[4]} (${parts[2]} used of ${parts[1]})`,
    });

    if (usage > 95 && result.status !== 'critical') {
      result.status = 'critical';
    } else if (usage > 85 && result.status === 'healthy') {
      result.status = 'warning';
    }
  } catch (error) {
    result.details.push({
      status: 'warning',
      message: 'Disk usage check failed',
    });
  }

  // Uptime
  const uptime = os.uptime();
  result.details.push({
    status: 'ok',
    message: `System Uptime: ${formatDuration(uptime * 1000)}`,
  });

  return result;
}

// Check services status
async function checkServices(verbose = false) {
  const result = {
    status: 'healthy',
    details: [],
  };

  try {
    const serviceStatus = await checkServiceStatus();

    for (const [key, service] of Object.entries(serviceStatus)) {
      const isRunning = service.status === 'running';

      result.details.push({
        status: isRunning ? 'ok' : 'error',
        message: `${service.name}: ${service.status} ${service.port ? `(port ${service.port})` : ''}`,
      });

      if (!isRunning) {
        result.status = 'critical';
      }
    }

    // Check for port conflicts
    const ports = Object.values(serviceStatus)
      .filter((s) => s.port)
      .map((s) => s.port);

    const duplicatePorts = ports.filter((port, index) => ports.indexOf(port) !== index);
    if (duplicatePorts.length > 0) {
      result.details.push({
        status: 'error',
        message: `Port conflicts detected: ${duplicatePorts.join(', ')}`,
      });
      result.status = 'critical';
    }
  } catch (error) {
    result.status = 'error';
    result.details.push({
      status: 'error',
      message: `Service check failed: ${error.message}`,
    });
  }

  return result;
}

// Check database connection
async function checkDatabase(verbose = false) {
  const result = {
    status: 'healthy',
    details: [],
  };

  try {
    const startTime = Date.now();
    const db = await connectDatabase();
    const connectionTime = Date.now() - startTime;

    result.details.push({
      status: connectionTime > 5000 ? 'warning' : 'ok',
      message: `Database connection: ${connectionTime}ms`,
    });

    if (connectionTime > 5000) {
      result.status = 'warning';
    }

    // Test basic operations
    try {
      await db.admin().ping();
      result.details.push({
        status: 'ok',
        message: 'Database ping: successful',
      });
    } catch (error) {
      result.details.push({
        status: 'error',
        message: `Database ping failed: ${error.message}`,
      });
      result.status = 'critical';
    }

    // Check collections
    try {
      const collections = await db.listCollections().toArray();
      result.details.push({
        status: 'ok',
        message: `Collections: ${collections.length} found`,
      });
    } catch (error) {
      result.details.push({
        status: 'warning',
        message: 'Could not list collections',
      });
    }
  } catch (error) {
    result.status = 'critical';
    result.details.push({
      status: 'error',
      message: `Database connection failed: ${error.message}`,
    });
  }

  return result;
}

// Check file system
async function checkFileSystem(verbose = false) {
  const result = {
    status: 'healthy',
    details: [],
  };

  const projectRoot = getProjectRoot();

  // Check critical directories
  const criticalDirs = ['nova-api', 'nova-core', 'uploads', 'logs'];

  for (const dir of criticalDirs) {
    const dirPath = path.join(projectRoot, dir);
    const exists = existsSync(dirPath);

    result.details.push({
      status: exists ? 'ok' : 'error',
      message: `Directory ${dir}: ${exists ? 'exists' : 'missing'}`,
    });

    if (!exists && dir !== 'uploads' && dir !== 'logs') {
      result.status = 'critical';
    }
  }

  // Check file permissions
  try {
    const logDir = path.join(projectRoot, 'logs');
    if (existsSync(logDir)) {
      const stats = statSync(logDir);
      const isWritable = (stats.mode & parseInt('0200', 8)) !== 0;

      result.details.push({
        status: isWritable ? 'ok' : 'error',
        message: `Log directory: ${isWritable ? 'writable' : 'not writable'}`,
      });

      if (!isWritable) {
        result.status = 'critical';
      }
    }
  } catch (error) {
    result.details.push({
      status: 'warning',
      message: 'Could not check file permissions',
    });
  }

  return result;
}

// Check dependencies
async function checkDependencies(verbose = false) {
  const result = {
    status: 'healthy',
    details: [],
  };

  const projectRoot = getProjectRoot();
  const services = ['nova-api', 'nova-core'];

  for (const service of services) {
    const servicePath = path.join(projectRoot, service);
    if (!existsSync(servicePath)) continue;

    const packageJsonPath = path.join(servicePath, 'package.json');
    const nodeModulesPath = path.join(servicePath, 'node_modules');

    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'));
      const hasNodeModules = existsSync(nodeModulesPath);

      result.details.push({
        status: hasNodeModules ? 'ok' : 'error',
        message: `${service} dependencies: ${hasNodeModules ? 'installed' : 'missing'}`,
      });

      if (!hasNodeModules) {
        result.status = 'critical';
      }

      // Check for package.json vs package-lock.json mismatch
      const lockPath = path.join(servicePath, 'package-lock.json');
      if (existsSync(lockPath)) {
        try {
          const lockStats = statSync(lockPath);
          const packageStats = statSync(packageJsonPath);

          if (packageStats.mtime > lockStats.mtime) {
            result.details.push({
              status: 'warning',
              message: `${service}: package.json newer than package-lock.json`,
            });
            if (result.status === 'healthy') {
              result.status = 'warning';
            }
          }
        } catch (error) {
          // Ignore stat errors
        }
      }
    }
  }

  return result;
}

// Check configuration
async function checkConfiguration(verbose = false) {
  const result = {
    status: 'healthy',
    details: [],
  };

  const projectRoot = getProjectRoot();

  // Check environment files
  const envFiles = ['.env', '.env.local', 'nova-api/.env'];

  for (const envFile of envFiles) {
    const envPath = path.join(projectRoot, envFile);
    const exists = existsSync(envPath);

    result.details.push({
      status: exists ? 'ok' : 'warning',
      message: `${envFile}: ${exists ? 'found' : 'missing'}`,
    });

    if (!exists && envFile === '.env') {
      if (result.status === 'healthy') {
        result.status = 'warning';
      }
    }
  }

  // Check required environment variables
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];

  for (const varName of requiredVars) {
    const exists = !!process.env[varName];

    result.details.push({
      status: exists ? 'ok' : 'error',
      message: `${varName}: ${exists ? 'set' : 'missing'}`,
    });

    if (!exists) {
      result.status = 'critical';
    }
  }

  return result;
}

// Show system information
async function showSystemInfo(options) {
  const systemInfo = {
    platform: os.platform(),
    architecture: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    },
    cpu: {
      count: os.cpus().length,
      model: os.cpus()[0]?.model || 'Unknown',
      load: os.loadavg(),
    },
    node: {
      version: process.version,
      execPath: process.execPath,
    },
    project: {
      root: getProjectRoot(),
      pid: process.pid,
    },
  };

  if (options.json) {
    console.log(JSON.stringify(systemInfo, null, 2));
  } else {
    displaySystemInfo(systemInfo);
  }
}

// Start continuous monitoring
async function startMonitoring(options) {
  console.log(chalk.cyan('📊 Starting continuous health monitoring...\n'));
  console.log(chalk.gray(`Update interval: ${options.interval} seconds`));
  console.log(chalk.gray('Press Ctrl+C to stop\n'));

  const interval = parseInt(options.interval) * 1000;
  let previousStatus = {};

  const checkHealth = async () => {
    try {
      // Clear screen
      process.stdout.write('\x1B[2J\x1B[0f');

      console.log(chalk.cyan('📊 Nova Universe Health Monitor\n'));
      console.log(chalk.gray(`Last updated: ${new Date().toLocaleTimeString()}\n`));

      // Quick health check
      const serviceStatus = await checkServiceStatus();
      const systemCheck = await checkSystemResources();

      // Display services
      displayServiceStatus(serviceStatus);

      // Display system metrics
      console.log(chalk.cyan('\n💻 System Resources\n'));
      for (const detail of systemCheck.details) {
        const icon = detail.status === 'ok' ? '✅' : detail.status === 'warning' ? '⚠️' : '❌';
        console.log(`${icon} ${detail.message}`);
      }

      // Check for status changes
      if (options.alerts) {
        for (const [key, service] of Object.entries(serviceStatus)) {
          const previous = previousStatus[key];
          if (previous && previous.status !== service.status) {
            const icon = service.status === 'running' ? '🟢' : '🔴';
            console.log(
              chalk.yellow(
                `\n🚨 ALERT: ${service.name} status changed: ${previous.status} → ${service.status}`,
              ),
            );
          }
        }
      }

      previousStatus = serviceStatus;
    } catch (error) {
      console.error(chalk.red('Monitor error:'), error.message);
    }
  };

  // Initial check
  await checkHealth();

  // Set up interval
  const monitorInterval = setInterval(checkHealth, interval);

  // Handle cleanup
  process.on('SIGINT', () => {
    clearInterval(monitorInterval);
    console.log(chalk.yellow('\n👋 Monitoring stopped'));
    process.exit(0);
  });
}

// Run diagnostics
async function runDiagnostics(options) {
  console.log(chalk.cyan('🔧 Running system diagnostics...\n'));

  const issues = [];

  // Check common issues
  const diagnostics = [
    {
      name: 'Port conflicts',
      check: async () => {
        const ports = [3000, 5173, 3001];
        const conflicts = [];

        for (const port of ports) {
          try {
            const { stdout } = await runCommand('lsof', [`-i:${port}`], { silent: true });
            if (stdout.trim()) {
              conflicts.push(port);
            }
          } catch (error) {
            // Port not in use
          }
        }

        return conflicts.length === 0 ? null : `Port conflicts: ${conflicts.join(', ')}`;
      },
      fix: async () => {
        logger.info('To fix port conflicts, stop services using these ports');
        return false;
      },
    },
    {
      name: 'Missing dependencies',
      check: async () => {
        const projectRoot = getProjectRoot();
        const services = ['nova-api', 'nova-core'];
        const missing = [];

        for (const service of services) {
          const nodeModules = path.join(projectRoot, service, 'node_modules');
          if (!existsSync(nodeModules)) {
            missing.push(service);
          }
        }

        return missing.length === 0 ? null : `Missing dependencies: ${missing.join(', ')}`;
      },
      fix: async () => {
        const projectRoot = getProjectRoot();
        const services = ['nova-api', 'nova-core'];

        for (const service of services) {
          const servicePath = path.join(projectRoot, service);
          const nodeModules = path.join(servicePath, 'node_modules');

          if (!existsSync(nodeModules)) {
            console.log(chalk.blue(`Installing dependencies for ${service}...`));
            await runCommand('npm', ['install'], { cwd: servicePath });
          }
        }

        return true;
      },
    },
    {
      name: 'Database connection',
      check: async () => {
        try {
          await connectDatabase();
          return null;
        } catch (error) {
          return `Database connection failed: ${error.message}`;
        }
      },
      fix: async () => {
        logger.info('Database connection issues require manual intervention');
        logger.info('Check DATABASE_URL environment variable');
        return false;
      },
    },
  ];

  // Run diagnostics
  for (const diagnostic of diagnostics) {
    const spinner = createSpinner(`Checking ${diagnostic.name}...`);
    spinner.start();

    try {
      const issue = await diagnostic.check();

      if (issue) {
        spinner.fail(issue);
        issues.push({ ...diagnostic, issue });
      } else {
        spinner.succeed(`${diagnostic.name}: OK`);
      }
    } catch (error) {
      spinner.fail(`${diagnostic.name}: Error - ${error.message}`);
      issues.push({ ...diagnostic, issue: error.message });
    }
  }

  // Display results
  if (issues.length === 0) {
    logger.success('✅ No issues found');
  } else {
    console.log(chalk.yellow(`\n⚠️  Found ${issues.length} issue(s):\n`));

    for (const issue of issues) {
      console.log(chalk.red(`❌ ${issue.issue}`));
    }

    if (options.fix) {
      console.log(chalk.cyan('\n🔧 Attempting to fix issues...\n'));

      for (const issue of issues) {
        if (issue.fix) {
          const spinner = createSpinner(`Fixing ${issue.name}...`);
          spinner.start();

          try {
            const fixed = await issue.fix();
            if (fixed) {
              spinner.succeed(`${issue.name} fixed`);
            } else {
              spinner.warn(`${issue.name} requires manual fix`);
            }
          } catch (error) {
            spinner.fail(`Failed to fix ${issue.name}: ${error.message}`);
          }
        }
      }
    } else {
      console.log(chalk.gray('\nUse --fix to attempt automatic repairs\n'));
    }
  }
}

// Display health summary
function displayHealthSummary(results) {
  const table = new Table({
    head: ['Component', 'Status', 'Details'],
    colWidths: [20, 12, 50],
  });

  for (const [name, check] of Object.entries(results.checks)) {
    const statusColor =
      check.status === 'healthy'
        ? chalk.green
        : check.status === 'warning'
          ? chalk.yellow
          : chalk.red;
    const statusIcon = check.status === 'healthy' ? '🟢' : check.status === 'warning' ? '🟡' : '🔴';

    const details = check.details
      ? check.details
          .slice(0, 2)
          .map((d) => d.message)
          .join(', ')
      : check.message || '';

    table.push([
      name,
      statusColor(`${statusIcon} ${check.status}`),
      details.length > 47 ? details.substring(0, 44) + '...' : details,
    ]);
  }

  console.log(table.toString());
}

// Display system information
function displaySystemInfo(info) {
  console.log(chalk.cyan('💻 System Information\n'));

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

  table.push(
    ['Platform:', `${info.platform} ${info.architecture}`],
    ['Release:', info.release],
    ['Hostname:', info.hostname],
    ['Uptime:', formatDuration(info.uptime * 1000)],
    ['Memory:', `${formatFileSize(info.memory.used)} / ${formatFileSize(info.memory.total)}`],
    ['CPU:', `${info.cpu.count}x ${info.cpu.model.split(' ')[0]}`],
    ['Load:', info.cpu.load.map((l) => l.toFixed(2)).join(', ')],
    ['Node.js:', info.node.version],
    ['Project:', info.project.root],
    ['PID:', info.project.pid.toString()],
  );

  console.log(table.toString());
  console.log();
}

// Display service status (reused from service command)
function displayServiceStatus(status) {
  const table = new Table({
    head: ['Service', 'Status', 'Port'],
    colWidths: [15, 15, 10],
  });

  for (const [key, service] of Object.entries(status)) {
    const statusColor = service.status === 'running' ? chalk.green : chalk.red;
    const statusIcon = service.status === 'running' ? '🟢' : '🔴';

    table.push([
      service.name,
      statusColor(`${statusIcon} ${service.status}`),
      service.port || 'N/A',
    ]);
  }

  console.log(table.toString());
}
