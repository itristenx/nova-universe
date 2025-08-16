/**
 * Logs Command - View and manage Nova Universe logs
 */

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import Table from 'cli-table3';
import { 
  logger, 
  createSpinner, 
  runCommand,
  getProjectRoot,
  formatFileSize,
  formatDate
} from '../utils/index.js';

export const logsCommand = new Command('logs')
  .description('View and manage Nova Universe logs');

// Logs view command
logsCommand
  .command('view [service]')
  .alias('show')
  .description('View logs for service or all services')
  .option('-f, --follow', 'Follow log output (tail -f)')
  .option('-n, --lines <count>', 'Number of lines to show', '50')
  .option('-l, --level <level>', 'Filter by log level (error, warn, info, debug)')
  .option('--since <time>', 'Show logs since time (1h, 30m, 2d)')
  .option('--grep <pattern>', 'Filter logs by pattern')
  .option('--json', 'Parse and format JSON logs')
  .action(async (service, options) => {
    try {
      await viewLogs(service, options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Failed to view logs: ${error.message}`);
      process.exit(1);
    }
  });

// Logs list command
logsCommand
  .command('list')
  .alias('ls')
  .description('List all log files')
  .option('-s, --size', 'Include file sizes')
  .option('-j, --json', 'Output in JSON format')
  .option('--sort <field>', 'Sort by: name, size, date', 'date')
  .action(async (options) => {
    try {
      await listLogFiles(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Failed to list logs: ${error.message}`);
      process.exit(1);
    }
  });

// Logs search command
logsCommand
  .command('search <pattern>')
  .alias('grep')
  .description('Search logs for pattern')
  .option('-s, --service <service>', 'Search specific service logs')
  .option('-i, --ignore-case', 'Ignore case in search')
  .option('-A, --after-context <lines>', 'Lines of context after match', '0')
  .option('-B, --before-context <lines>', 'Lines of context before match', '0')
  .option('-C, --context <lines>', 'Lines of context around match', '0')
  .option('--since <time>', 'Search logs since time (1h, 30m, 2d)')
  .action(async (pattern, options) => {
    try {
      await searchLogs(pattern, options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Failed to search logs: ${error.message}`);
      process.exit(1);
    }
  });

// Logs clean command
logsCommand
  .command('clean')
  .alias('clear')
  .description('Clean up old log files')
  .option('--older-than <days>', 'Remove logs older than N days', '30')
  .option('--keep <count>', 'Keep N most recent log files', '10')
  .option('--dry-run', 'Show what would be deleted')
  .option('--force', 'Skip confirmation')
  .action(async (options) => {
    try {
      await cleanLogs(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Failed to clean logs: ${error.message}`);
      process.exit(1);
    }
  });

// Logs archive command
logsCommand
  .command('archive')
  .description('Archive old log files')
  .option('--older-than <days>', 'Archive logs older than N days', '7')
  .option('-o, --output <path>', 'Archive output directory', 'logs/archive')
  .option('--compress', 'Compress archived logs', true)
  .action(async (options) => {
    try {
      await archiveLogs(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Failed to archive logs: ${error.message}`);
      process.exit(1);
    }
  });

// Logs stats command
logsCommand
  .command('stats')
  .description('Show log statistics')
  .option('-s, --service <service>', 'Stats for specific service')
  .option('--since <time>', 'Stats since time (1h, 30m, 2d)')
  .option('-j, --json', 'Output in JSON format')
  .action(async (options) => {
    try {
      await showLogStats(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Failed to get log stats: ${error.message}`);
      process.exit(1);
    }
  });

// Logs export command
logsCommand
  .command('export')
  .description('Export logs to different formats')
  .option('-s, --service <service>', 'Export specific service logs')
  .option('-f, --format <format>', 'Export format (json, csv, txt)', 'txt')
  .option('-o, --output <file>', 'Output file (default: stdout)')
  .option('--since <time>', 'Export logs since time')
  .option('--until <time>', 'Export logs until time')
  .action(async (options) => {
    try {
      await exportLogs(options); // TODO-LINT: move to async function
    } catch (error) {
      logger.error(`Failed to export logs: ${error.message}`);
      process.exit(1);
    }
  });

// View logs
async function viewLogs(service, options) {
  const projectRoot = getProjectRoot();
  const logFiles = await findLogFiles(projectRoot, service); // TODO-LINT: move to async function

  if (logFiles.length === 0) {
    logger.warning(`No log files found${service ? ` for ${service}` : ''}`);
    return;
  }

  if (service || logFiles.length === 1) {
    // View specific service or single log file
    const logFile = logFiles[0];
    await displaySingleLog(logFile, options); // TODO-LINT: move to async function
  } else {
    // Multiple services - let user choose or show all
    if (options.follow) {
      // For follow mode, show all logs interleaved
      await followMultipleLogs(logFiles, options); // TODO-LINT: move to async function
    } else {
      // Show recent logs from all services
      await displayMultipleLogs(logFiles, options); // TODO-LINT: move to async function
    }
  }
}

// Find log files
async function findLogFiles(projectRoot, service = null) {
  const logPaths = [
    'server.log',
    'logs/server.log',
    'logs/app.log',
    'logs/error.log',
    'logs/access.log',
    'nova-api/server.log',
    'nova-api/logs/server.log',
    'nova-core/logs/build.log',
    'nova-comms/server.log',
    'nova-comms/logs/server.log'
  ];

  const logFiles = [];

  for (const logPath of logPaths) {
    const fullPath = path.join(projectRoot, logPath);
    if (existsSync(fullPath)) {
      const stats = statSync(fullPath);
      const serviceName = extractServiceName(logPath);
      
      // Filter by service if specified
      if (!service || serviceName === service || logPath.includes(service)) {
        logFiles.push({
          path: fullPath,
          relativePath: logPath,
          service: serviceName,
          size: stats.size,
          modified: stats.mtime
        });
      }
    }
  }

  // Also check for rotated logs
  const logDirs = ['logs', 'nova-api/logs', 'nova-core/logs', 'nova-comms/logs'];
  
  for (const logDir of logDirs) {
    const dirPath = path.join(projectRoot, logDir);
    if (existsSync(dirPath)) {
      try {
        const files = readdirSync(dirPath);
        for (const file of files) {
          if (file.endsWith('.log') || file.match(/\.log\.\d+$/)) {
            const fullPath = path.join(dirPath, file);
            const stats = statSync(fullPath);
            const serviceName = extractServiceName(logDir);
            
            if (!service || serviceName === service) {
              logFiles.push({
                path: fullPath,
                relativePath: path.join(logDir, file),
                service: serviceName,
                size: stats.size,
                modified: stats.mtime
              });
            }
          }
        }
      } catch (error) {
        // Directory not readable, skip
      }
    }
  }

  return logFiles.sort((a, b) => b.modified - a.modified);
}

// Extract service name from log path
function extractServiceName(logPath) {
  if (logPath.includes('nova-api')) return 'api';
  if (logPath.includes('nova-core')) return 'admin';
  if (logPath.includes('nova-comms')) return 'comms';
  return 'system';
}

// Display single log file
async function displaySingleLog(logFile, options) {
  console.log(chalk.cyan(`📋 ${logFile.service} logs (${logFile.relativePath})\n`));

  if (options.follow) {
    // Follow mode using tail -f
    console.log(chalk.gray('Following logs (Press Ctrl+C to exit)...\n'));
    
    const tailArgs = ['-f'];
    if (options.lines) {
      tailArgs.push('-n', options.lines);
    }
    tailArgs.push(logFile.path);

    const tail = spawn('tail', tailArgs, { stdio: 'inherit' });
    
    process.on('SIGINT', () => {
      tail.kill();
      process.exit(0);
    });

    await new Promise((resolve) => {
      tail.on('close', resolve); // TODO-LINT: move to async function
    });
  } else {
    // Static view
    const tailArgs = ['-n', options.lines, logFile.path];
    
    try {
      let { stdout } = await runCommand('tail', tailArgs, { silent: true }); // TODO-LINT: move to async function
      
      // Apply filters
      if (options.level) {
        stdout = filterByLogLevel(stdout, options.level);
      }
      
      if (options.grep) {
        stdout = filterByPattern(stdout, options.grep);
      }
      
      if (options.since) {
        stdout = filterBySince(stdout, options.since);
      }

      if (options.json) {
        stdout = formatJsonLogs(stdout);
      }

      console.log(stdout);
    } catch (error) {
      logger.error(`Failed to read log file: ${error.message}`);
    }
  }
}

// Display multiple logs
async function displayMultipleLogs(logFiles, options) {
  console.log(chalk.cyan('📋 Recent logs from all services\n'));

  for (const logFile of logFiles.slice(0, 5)) { // Show top 5 most recent
    console.log(chalk.yellow(`\n=== ${logFile.service.toUpperCase()} (${logFile.relativePath}) ===`));
    
    try {
      const { stdout } = await runCommand('tail', ['-n', '10', logFile.path], { silent: true }); // TODO-LINT: move to async function
      
      let filteredOutput = stdout;
      
      if (options.level) {
        filteredOutput = filterByLogLevel(filteredOutput, options.level);
      }
      
      if (options.grep) {
        filteredOutput = filterByPattern(filteredOutput, options.grep);
      }

      if (filteredOutput.trim()) {
        console.log(filteredOutput);
      } else {
        console.log(chalk.gray('No matching log entries'));
      }
    } catch (error) {
      console.log(chalk.red(`Error reading log: ${error.message}`));
    }
  }
}

// Follow multiple logs
async function followMultipleLogs(logFiles, options) {
  console.log(chalk.cyan('📋 Following logs from all services\n'));
  console.log(chalk.gray('Press Ctrl+C to exit...\n'));

  const processes = [];

  for (const logFile of logFiles) {
    const tail = spawn('tail', ['-f', '-n', '0', logFile.path], { stdio: 'pipe' });
    
    tail.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      for (const line of lines) {
        let output = line;
        
        // Apply filters
        if (options.level && !matchesLogLevel(line, options.level)) {
          continue;
        }
        
        if (options.grep && !line.includes(options.grep)) {
          continue;
        }

        // Add service prefix
        const serviceColor = getServiceColor(logFile.service);
        console.log(`${serviceColor(`[${logFile.service}]`)} ${output}`);
      }
    });

    processes.push(tail);
  }

  // Handle cleanup
  process.on('SIGINT', () => {
    processes.forEach(proc => proc.kill());
    process.exit(0);
  });

  // Keep alive
  await new Promise(() => {}); // TODO-LINT: move to async function
}

// List log files
async function listLogFiles(options) {
  const projectRoot = getProjectRoot();
  const logFiles = await findLogFiles(projectRoot); // TODO-LINT: move to async function

  if (logFiles.length === 0) {
    logger.warning('No log files found');
    return;
  }

  // Sort files
  logFiles.sort((a, b) => {
    switch (options.sort) {
      case 'name':
        return a.relativePath.localeCompare(b.relativePath);
      case 'size':
        return b.size - a.size;
      case 'date':
      default:
        return b.modified - a.modified;
    }
  });

  if (options.json) {
    console.log(JSON.stringify(logFiles, null, 2));
  } else {
    displayLogFilesTable(logFiles, options.size);
  }
}

// Search logs
async function searchLogs(pattern, options) {
  const projectRoot = getProjectRoot();
  const logFiles = await findLogFiles(projectRoot, options.service); // TODO-LINT: move to async function

  if (logFiles.length === 0) {
    logger.warning(`No log files found${options.service ? ` for ${options.service}` : ''}`);
    return;
  }

  console.log(chalk.cyan(`🔍 Searching for "${pattern}" in logs...\n`));

  let totalMatches = 0;

  for (const logFile of logFiles) {
    try {
      const grepArgs = [];
      
      if (options.ignoreCase) {
        grepArgs.push('-i');
      }
      
      if (options.context) {
        grepArgs.push('-C', options.context);
      } else {
        if (options.beforeContext) {
          grepArgs.push('-B', options.beforeContext);
        }
        if (options.afterContext) {
          grepArgs.push('-A', options.afterContext);
        }
      }
      
      grepArgs.push('-n', pattern, logFile.path);

      const { stdout } = await runCommand('grep', grepArgs, { silent: true }); // TODO-LINT: move to async function
      
      if (stdout.trim()) {
        console.log(chalk.yellow(`\n=== ${logFile.service.toUpperCase()} (${logFile.relativePath}) ===`));
        
        const matches = stdout.split('\n').filter(line => line.trim());
        totalMatches += matches.length;
        
        for (const match of matches) {
          // Highlight the pattern in the output
          const highlighted = match.replace(
            new RegExp(pattern, options.ignoreCase ? 'gi' : 'g'),
            chalk.black.bgYellow(pattern)
          );
          console.log(highlighted);
        }
      }
    } catch (error) {
      // grep returns exit code 1 when no matches found, which is normal
      if (!error.message.includes('exit code 1')) {
        console.log(chalk.red(`Error searching ${logFile.relativePath}: ${error.message}`));
      }
    }
  }

  console.log(chalk.cyan(`\n📊 Search completed. Found ${totalMatches} match(es)`));
}

// Clean logs
async function cleanLogs(options) {
  const projectRoot = getProjectRoot();
  const logFiles = await findLogFiles(projectRoot); // TODO-LINT: move to async function

  if (logFiles.length === 0) {
    logger.warning('No log files found');
    return;
  }

  const cutoffDate = new Date(Date.now() - parseInt(options.olderThan) * 24 * 60 * 60 * 1000);
  const keepCount = parseInt(options.keep);

  // Sort by modification date (newest first)
  logFiles.sort((a, b) => b.modified - a.modified);

  const toDelete = [];

  // Mark files for deletion based on age
  for (const file of logFiles) {
    if (file.modified < cutoffDate) {
      toDelete.push(file);
    }
  }

  // Mark files for deletion based on count (keep only the most recent N files)
  if (logFiles.length > keepCount) {
    const extraFiles = logFiles.slice(keepCount);
    for (const file of extraFiles) {
      if (!toDelete.includes(file)) {
        toDelete.push(file);
      }
    }
  }

  if (toDelete.length === 0) {
    logger.info('No log files need to be cleaned');
    return;
  }

  if (options.dryRun) {
    console.log(chalk.cyan('\n🔍 Dry run - files that would be deleted:\n'));
    for (const file of toDelete) {
      console.log(chalk.gray(`   ${file.relativePath} (${formatDate(file.modified)}, ${formatFileSize(file.size)})`));
    }
    return;
  }

  if (!options.force) {
    console.log(chalk.yellow('\n⚠️  Log files to be deleted:\n'));
    for (const file of toDelete) {
      console.log(chalk.gray(`   ${file.relativePath} (${formatDate(file.modified)}, ${formatFileSize(file.size)})`));
    }

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Delete ${toDelete.length} log file(s)?`,
        default: false
      }
    ]); // TODO-LINT: move to async function

    if (!confirm) {
      logger.info('Cleanup cancelled');
      return;
    }
  }

  const spinner = createSpinner('Cleaning log files...');
  spinner.start();

  try {
    let deletedSize = 0;
    
    for (const file of toDelete) {
      deletedSize += file.size;
      await runCommand('rm', [file.path], { silent: true }); // TODO-LINT: move to async function
    }

    spinner.succeed(`Cleaned ${toDelete.length} log file(s)`);
    console.log(chalk.green(`   Space freed: ${formatFileSize(deletedSize)}`));

  } catch (error) {
    spinner.fail('Cleanup failed');
    throw error;
  }
}

// Archive logs
async function archiveLogs(options) {
  const projectRoot = getProjectRoot();
  const logFiles = await findLogFiles(projectRoot); // TODO-LINT: move to async function

  if (logFiles.length === 0) {
    logger.warning('No log files found');
    return;
  }

  const cutoffDate = new Date(Date.now() - parseInt(options.olderThan) * 24 * 60 * 60 * 1000);
  const archiveDir = path.join(projectRoot, options.output);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const toArchive = logFiles.filter(file => file.modified < cutoffDate);

  if (toArchive.length === 0) {
    logger.info('No log files need to be archived');
    return;
  }

  const spinner = createSpinner('Archiving log files...');
  spinner.start();

  try {
    // Create archive directory
    await runCommand('mkdir', ['-p', archiveDir]); // TODO-LINT: move to async function

    let archivedSize = 0;

    for (const file of toArchive) {
      const archiveName = `${file.service}-${timestamp}.log`;
      const archivePath = path.join(archiveDir, archiveName);
      
      await runCommand('cp', [file.path, archivePath]); // TODO-LINT: move to async function
      archivedSize += file.size;
      
      // Remove original
      await runCommand('rm', [file.path]); // TODO-LINT: move to async function
    }

    if (options.compress) {
      // Compress the entire archive directory
      const archiveTarPath = path.join(projectRoot, `logs-archive-${timestamp}.tar.gz`);
      await runCommand('tar', ['-czf', archiveTarPath, '-C', archiveDir, '.']); // TODO-LINT: move to async function
      
      // Remove uncompressed files
      await runCommand('rm', ['-rf', archiveDir]); // TODO-LINT: move to async function
      
      spinner.succeed(`Archived and compressed ${toArchive.length} log file(s)`);
      console.log(chalk.green(`   Archive: ${archiveTarPath}`));
    } else {
      spinner.succeed(`Archived ${toArchive.length} log file(s)`);
      console.log(chalk.green(`   Location: ${archiveDir}`));
    }

    console.log(chalk.gray(`   Size: ${formatFileSize(archivedSize)}`));

  } catch (error) {
    spinner.fail('Archive failed');
    throw error;
  }
}

// Show log statistics
async function showLogStats(options) {
  const projectRoot = getProjectRoot();
  const logFiles = await findLogFiles(projectRoot, options.service); // TODO-LINT: move to async function

  if (logFiles.length === 0) {
    logger.warning(`No log files found${options.service ? ` for ${options.service}` : ''}`);
    return;
  }

  const spinner = createSpinner('Analyzing logs...');
  spinner.start();

  try {
    const stats = {
      files: logFiles.length,
      totalSize: 0,
      services: {},
      levels: { error: 0, warn: 0, info: 0, debug: 0 },
      oldestLog: null,
      newestLog: null
    };

    for (const file of logFiles) {
      stats.totalSize += file.size;
      
      if (!stats.oldestLog || file.modified < stats.oldestLog) {
        stats.oldestLog = file.modified;
      }
      
      if (!stats.newestLog || file.modified > stats.newestLog) {
        stats.newestLog = file.modified;
      }

      // Count by service
      if (!stats.services[file.service]) {
        stats.services[file.service] = { files: 0, size: 0 };
      }
      stats.services[file.service].files++;
      stats.services[file.service].size += file.size;

      // Analyze log levels (sample from each file)
      try {
        const { stdout } = await runCommand('head', ['-n', '100', file.path], { silent: true }); // TODO-LINT: move to async function
        const lines = stdout.split('\n');
        
        for (const line of lines) {
          if (line.includes('ERROR') || line.includes('error')) stats.levels.error++;
          else if (line.includes('WARN') || line.includes('warn')) stats.levels.warn++;
          else if (line.includes('INFO') || line.includes('info')) stats.levels.info++;
          else if (line.includes('DEBUG') || line.includes('debug')) stats.levels.debug++;
        }
      } catch (error) {
        // Skip if can't read file
      }
    }

    spinner.succeed('Log analysis complete');

    if (options.json) {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      displayLogStats(stats);
    }

  } catch (error) {
    spinner.fail('Analysis failed');
    throw error;
  }
}

// Export logs
async function exportLogs(options) {
  const projectRoot = getProjectRoot();
  const logFiles = await findLogFiles(projectRoot, options.service); // TODO-LINT: move to async function

  if (logFiles.length === 0) {
    logger.warning(`No log files found${options.service ? ` for ${options.service}` : ''}`);
    return;
  }

  const spinner = createSpinner('Exporting logs...');
  spinner.start();

  try {
    let exportData = '';

    for (const file of logFiles) {
      const content = readFileSync(file.path, 'utf8');
      
      switch (options.format) {
        case 'json':
          // Convert each line to JSON object
          const lines = content.split('\n').filter(line => line.trim());
          for (const line of lines) {
            const logEntry = {
              timestamp: new Date().toISOString(),
              service: file.service,
              message: line
            };
            exportData += JSON.stringify(logEntry) + '\n';
          }
          break;
          
        case 'csv':
          // CSV format
          if (!exportData) {
            exportData = 'timestamp,service,level,message\n';
          }
          const csvLines = content.split('\n').filter(line => line.trim());
          for (const line of csvLines) {
            const level = extractLogLevel(line);
            exportData += `"${new Date().toISOString()}","${file.service}","${level}","${line.replace(/"/g, '""')}"\n`;
          }
          break;
          
        case 'txt':
        default:
          // Plain text with service headers
          exportData += `\n=== ${file.service.toUpperCase()} ===\n`;
          exportData += content + '\n';
          break;
      }
    }

    if (options.output) {
      require('fs').writeFileSync(options.output, exportData);
      spinner.succeed(`Logs exported to ${options.output}`);
    } else {
      spinner.succeed('Logs exported');
      console.log(exportData);
    }

  } catch (error) {
    spinner.fail('Export failed');
    throw error;
  }
}

// Helper functions
function filterByLogLevel(output, level) {
  const lines = output.split('\n');
  return lines.filter(line => 
    line.toLowerCase().includes(level.toLowerCase())
  ).join('\n');
}

function filterByPattern(output, pattern) {
  const lines = output.split('\n');
  return lines.filter(line => 
    line.includes(pattern)
  ).join('\n');
}

function filterBySince(output, since) {
  // This is a simplified implementation
  // In practice, you'd parse timestamps from log lines
  return output;
}

function formatJsonLogs(output) {
  const lines = output.split('\n');
  let formatted = '';
  
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      formatted += JSON.stringify(parsed, null, 2) + '\n';
    } catch (error) {
      formatted += line + '\n';
    }
  }
  
  return formatted;
}

function matchesLogLevel(line, level) {
  return line.toLowerCase().includes(level.toLowerCase());
}

function getServiceColor(service) {
  const colors = {
    api: chalk.blue,
    admin: chalk.green,
    comms: chalk.yellow,
    system: chalk.gray
  };
  return colors[service] || chalk.white;
}

function extractLogLevel(line) {
  if (line.includes('ERROR') || line.includes('error')) return 'error';
  if (line.includes('WARN') || line.includes('warn')) return 'warn';
  if (line.includes('INFO') || line.includes('info')) return 'info';
  if (line.includes('DEBUG') || line.includes('debug')) return 'debug';
  return 'info';
}

// Display functions
function displayLogFilesTable(logFiles, showSize = false) {
  const headers = ['Service', 'File', 'Modified'];
  const colWidths = [10, 30, 20];
  
  if (showSize) {
    headers.push('Size');
    colWidths.push(12);
  }

  const table = new Table({
    head: headers,
    colWidths: colWidths
  });

  for (const file of logFiles) {
    const row = [
      file.service,
      file.relativePath,
      formatDate(file.modified)
    ];
    
    if (showSize) {
      row.push(formatFileSize(file.size));
    }
    
    table.push(row);
  }

  console.log(chalk.cyan(`\n📋 Log Files (${logFiles.length})\n`));
  console.log(table.toString());
  console.log();
}

function displayLogStats(stats) {
  console.log(chalk.cyan('\n📊 Log Statistics\n'));

  // Overview
  const overviewTable = new Table({
    chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
            , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
            , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
            , 'right': '' , 'right-mid': '' }
  });

  overviewTable.push(
    ['Total Files:', stats.files.toString()],
    ['Total Size:', formatFileSize(stats.totalSize)],
    ['Oldest Log:', stats.oldestLog ? formatDate(stats.oldestLog) : 'N/A'],
    ['Newest Log:', stats.newestLog ? formatDate(stats.newestLog) : 'N/A']
  );

  console.log(overviewTable.toString());

  // Services breakdown
  if (Object.keys(stats.services).length > 1) {
    console.log(chalk.cyan('\n📦 By Service\n'));
    
    const serviceTable = new Table({
      head: ['Service', 'Files', 'Size'],
      colWidths: [15, 10, 15]
    });

    for (const [service, serviceStats] of Object.entries(stats.services)) {
      serviceTable.push([
        service,
        serviceStats.files.toString(),
        formatFileSize(serviceStats.size)
      ]);
    }

    console.log(serviceTable.toString());
  }

  // Log levels
  const totalLevelEntries = Object.values(stats.levels).reduce((a, b) => a + b, 0);
  if (totalLevelEntries > 0) {
    console.log(chalk.cyan('\n📈 Log Levels (sample)\n'));
    
    const levelTable = new Table({
      head: ['Level', 'Count', 'Percentage'],
      colWidths: [10, 10, 15]
    });

    for (const [level, count] of Object.entries(stats.levels)) {
      if (count > 0) {
        const percentage = ((count / totalLevelEntries) * 100).toFixed(1);
        levelTable.push([
          level.toUpperCase(),
          count.toString(),
          `${percentage}%`
        ]);
      }
    }

    console.log(levelTable.toString());
  }

  console.log();
}
