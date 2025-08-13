/**
 * Service Command - Manage Nova Universe services
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Listr } from 'listr2';
import { spawn, exec } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import Table from 'cli-table3';
import { 
  logger, 
  createSpinner, 
  runCommand, 
  getProjectRoot,
  checkServiceStatus,
  formatDuration,
  sleep
} from '../utils/index.js';

export const serviceCommand = new Command('service')
  .alias('svc')
  .description('Manage Nova Universe services');

// Service start command
serviceCommand
  .command('start')
  .description('Start Nova services')
  .option('-s, --service <name>', 'Start specific service (api, admin, comms)')
  .option('-d, --detached', 'Run services in background')
  .option('-w, --watch', 'Start services in watch mode')
  .action(async (options) => {
    const projectRoot = getProjectRoot();
    
    try {
      if (options.service) {
        await startSingleService(options.service, projectRoot, options);
      } else {
        await startAllServices(projectRoot, options);
      }
    } catch (error) {
      logger.error(`Failed to start services: ${error.message}`);
      process.exit(1);
    }
  });

// Service stop command
serviceCommand
  .command('stop')
  .description('Stop Nova services')
  .option('-s, --service <name>', 'Stop specific service (api, admin, comms)')
  .option('-f, --force', 'Force kill services')
  .action(async (options) => {
    try {
      if (options.service) {
        await stopSingleService(options.service, options);
      } else {
        await stopAllServices(options);
      }
    } catch (error) {
      logger.error(`Failed to stop services: ${error.message}`);
      process.exit(1);
    }
  });

// Service restart command
serviceCommand
  .command('restart')
  .description('Restart Nova services')
  .option('-s, --service <name>', 'Restart specific service (api, admin, comms)')
  .action(async (options) => {
    try {
      console.log(chalk.cyan('🔄 Restarting services...\n'));
      
      // Stop first
      if (options.service) {
        await stopSingleService(options.service, { force: true });
        await sleep(2000);
        await startSingleService(options.service, getProjectRoot(), {});
      } else {
        await stopAllServices({ force: true });
        await sleep(2000);
        await startAllServices(getProjectRoot(), {});
      }
      
      logger.success('Services restarted successfully');
    } catch (error) {
      logger.error(`Failed to restart services: ${error.message}`);
      process.exit(1);
    }
  });

// Service status command
serviceCommand
  .command('status')
  .alias('ps')
  .description('Show service status')
  .option('-j, --json', 'Output in JSON format')
  .option('-w, --watch', 'Watch status continuously')
  .action(async (options) => {
    try {
      if (options.watch) {
        await watchServiceStatus();
      } else {
        const status = await checkServiceStatus();
        
        if (options.json) {
          console.log(JSON.stringify(status, null, 2));
        } else {
          displayServiceStatus(status);
        }
      }
    } catch (error) {
      logger.error(`Failed to get service status: ${error.message}`);
      process.exit(1);
    }
  });

// Service logs command
serviceCommand
  .command('logs')
  .description('Show service logs')
  .option('-s, --service <name>', 'Show logs for specific service')
  .option('-f, --follow', 'Follow log output')
  .option('-n, --lines <count>', 'Number of lines to show', '50')
  .action(async (options) => {
    try {
      await showServiceLogs(options);
    } catch (error) {
      logger.error(`Failed to show logs: ${error.message}`);
      process.exit(1);
    }
  });

// Start all services
async function startAllServices(projectRoot, options) {
  const services = [
    { name: 'api', dir: 'nova-api', command: 'npm', args: ['start'] },
    { name: 'admin', dir: 'nova-core', command: 'npm', args: ['run', 'dev'] },
    { name: 'comms', dir: 'nova-comms', command: 'npm', args: ['start'] }
  ];

  if (options.detached) {
    // Start services in background
    const tasks = new Listr(
      services.map(service => ({
        title: `Starting ${service.name}`,
        task: async () => {
          const servicePath = path.join(projectRoot, service.dir);
          if (existsSync(servicePath)) {
            const child = spawn(service.command, service.args, {
              cwd: servicePath,
              detached: true,
              stdio: 'ignore'
            });
            child.unref();
          }
        }
      })),
      { concurrent: true }
    );

    await tasks.run();
    logger.success('All services started in background');
  } else {
    // Start services in foreground with concurrency
    console.log(chalk.cyan('🚀 Starting Nova Universe services...\n'));
    
    const processes = [];
    
    for (const service of services) {
      const servicePath = path.join(projectRoot, service.dir);
      if (existsSync(servicePath)) {
        console.log(chalk.blue(`▶️  Starting ${service.name}...`));
        
        const child = spawn(service.command, service.args, {
          cwd: servicePath,
          stdio: 'inherit'
        });
        
        processes.push({ name: service.name, process: child });
      }
    }

    // Handle cleanup on exit
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Shutting down services...'));
      processes.forEach(({ name, process }) => {
        console.log(chalk.gray(`Stopping ${name}...`));
        process.kill('SIGTERM');
      });
      process.exit(0);
    });

    // Wait for all processes
    await Promise.all(
      processes.map(({ process }) => 
        new Promise((resolve) => {
          process.on('close', resolve);
        })
      )
    );
  }
}

// Start single service
async function startSingleService(serviceName, projectRoot, options) {
  const serviceConfig = {
    api: { dir: 'nova-api', command: 'npm', args: ['start'] },
    admin: { dir: 'nova-core', command: 'npm', args: ['run', 'dev'] },
    comms: { dir: 'nova-comms', command: 'npm', args: ['start'] }
  };

  const service = serviceConfig[serviceName];
  if (!service) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  const servicePath = path.join(projectRoot, service.dir);
  if (!existsSync(servicePath)) {
    throw new Error(`Service directory not found: ${servicePath}`);
  }

  console.log(chalk.blue(`▶️  Starting ${serviceName}...`));

  if (options.detached) {
    const child = spawn(service.command, service.args, {
      cwd: servicePath,
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    logger.success(`${serviceName} started in background`);
  } else {
    const child = spawn(service.command, service.args, {
      cwd: servicePath,
      stdio: 'inherit'
    });

    process.on('SIGINT', () => {
      console.log(chalk.yellow(`\n🛑 Stopping ${serviceName}...`));
      child.kill('SIGTERM');
      process.exit(0);
    });

    await new Promise((resolve) => {
      child.on('close', resolve);
    });
  }
}

// Stop all services
async function stopAllServices(options) {
  const spinner = createSpinner('Stopping services...');
  spinner.start();

  try {
    // Kill processes by port
    const ports = [3000, 5173, 3001];
    
    for (const port of ports) {
      try {
        if (options.force) {
          await runCommand('pkill', ['-f', `${port}`], { silent: true });
        } else {
          // Try graceful shutdown first
          exec(`lsof -ti:${port} | xargs kill -TERM`, { stdio: 'ignore' });
        }
      } catch (error) {
        // Port might not be in use, ignore error
      }
    }

    spinner.succeed('All services stopped');
  } catch (error) {
    spinner.fail('Failed to stop some services');
    throw error;
  }
}

// Stop single service
async function stopSingleService(serviceName, options) {
  const portMap = {
    api: 3000,
    admin: 5173,
    comms: 3001
  };

  const port = portMap[serviceName];
  if (!port) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  const spinner = createSpinner(`Stopping ${serviceName}...`);
  spinner.start();

  try {
    if (options.force) {
      await runCommand('pkill', ['-f', `${port}`], { silent: true });
    } else {
      exec(`lsof -ti:${port} | xargs kill -TERM`, { stdio: 'ignore' });
    }
    
    spinner.succeed(`${serviceName} stopped`);
  } catch (error) {
    spinner.fail(`Failed to stop ${serviceName}`);
    throw error;
  }
}

// Display service status in a table
function displayServiceStatus(status) {
  const table = new Table({
    head: ['Service', 'Status', 'Port', 'PID'],
    colWidths: [15, 10, 8, 10]
  });

  for (const [key, service] of Object.entries(status)) {
    const statusColor = service.status === 'running' ? chalk.green : chalk.red;
    const statusIcon = service.status === 'running' ? '🟢' : '🔴';
    
    table.push([
      service.name,
      statusColor(`${statusIcon} ${service.status}`),
      service.port,
      service.pid || 'N/A'
    ]);
  }

  console.log('\n📊 Service Status\n');
  console.log(table.toString());
  console.log();
}

// Watch service status continuously
async function watchServiceStatus() {
  console.log(chalk.cyan('👀 Watching service status (Press Ctrl+C to exit)\n'));
  
  let previousStatus = {};
  
  const updateStatus = async () => {
    try {
      const status = await checkServiceStatus();
      
      // Clear screen
      process.stdout.write('\x1B[2J\x1B[0f');
      
      console.log(chalk.cyan('👀 Service Status (Live)\n'));
      console.log(chalk.gray(`Last updated: ${new Date().toLocaleTimeString()}\n`));
      
      displayServiceStatus(status);
      
      // Check for status changes
      for (const [key, service] of Object.entries(status)) {
        const previous = previousStatus[key];
        if (previous && previous.status !== service.status) {
          const icon = service.status === 'running' ? '🟢' : '🔴';
          console.log(chalk.yellow(`${icon} ${service.name} status changed: ${previous.status} → ${service.status}`));
        }
      }
      
      previousStatus = status;
    } catch (error) {
      console.error(chalk.red('Error checking status:'), error.message);
    }
  };

  // Initial update
  await updateStatus();
  
  // Update every 2 seconds
  const interval = setInterval(updateStatus, 2000);
  
  // Cleanup on exit
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(chalk.yellow('\n👋 Stopped watching'));
    process.exit(0);
  });
}

// Show service logs
async function showServiceLogs(options) {
  const logFiles = {
    api: 'nova-api/server.log',
    admin: 'nova-core/dist/server.log',
    comms: 'nova-comms/server.log'
  };

  if (options.service) {
    const logFile = logFiles[options.service];
    if (!logFile) {
      throw new Error(`Unknown service: ${options.service}`);
    }
    
    const projectRoot = getProjectRoot();
    const logPath = path.join(projectRoot, logFile);
    
    if (!existsSync(logPath)) {
      logger.warning(`Log file not found: ${logPath}`);
      return;
    }

    console.log(chalk.cyan(`📋 ${options.service} logs\n`));
    
    if (options.follow) {
      // Follow logs
      const tail = spawn('tail', ['-f', '-n', options.lines, logPath], {
        stdio: 'inherit'
      });
      
      process.on('SIGINT', () => {
        tail.kill();
        process.exit(0);
      });
    } else {
      // Show last N lines
      await runCommand('tail', ['-n', options.lines, logPath]);
    }
  } else {
    // Show all logs
    console.log(chalk.cyan('📋 All service logs\n'));
    
    for (const [serviceName, logFile] of Object.entries(logFiles)) {
      const projectRoot = getProjectRoot();
      const logPath = path.join(projectRoot, logFile);
      
      if (existsSync(logPath)) {
        console.log(chalk.yellow(`\n=== ${serviceName.toUpperCase()} ===`));
        try {
          await runCommand('tail', ['-n', '10', logPath]);
        } catch (error) {
          console.log(chalk.gray('No logs available'));
        }
      }
    }
  }
}
