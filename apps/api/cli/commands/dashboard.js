/**
 * Dashboard Command - Web-based monitoring dashboard
 */

import { Command } from 'commander';
import chalk from 'chalk';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { existsSync } from 'fs';
import {
  logger,
  createSpinner,
  getProjectRoot,
  checkServiceStatus,
  connectDatabase,
} from '../utils/index.js';

export const dashboardCommand = new Command('dashboard').description(
  'Web-based monitoring dashboard',
);

// Dashboard start command
dashboardCommand
  .command('start')
  .description('Start the monitoring dashboard')
  .option('-p, --port <port>', 'Dashboard port', '8080')
  .option('--host <host>', 'Dashboard host', 'localhost')
  .option('--open', 'Open browser automatically', true)
  .action(async (options) => {
    try {
      await startDashboard(options);
    } catch (error) {
      logger.error(`Failed to start dashboard: ${error.message}`);
      process.exit(1);
    }
  });

// Dashboard info command
dashboardCommand
  .command('info')
  .description('Show dashboard information')
  .action(async () => {
    try {
      await showDashboardInfo();
    } catch (error) {
      logger.error(`Failed to get dashboard info: ${error.message}`);
      process.exit(1);
    }
  });

// Start monitoring dashboard
async function startDashboard(options) {
  console.log(chalk.cyan('📊 Starting Nova Universe Dashboard...\n'));

  const app = express();
  const server = createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const port = parseInt(options.port);
  const host = options.host;
  const projectRoot = getProjectRoot();

  // Serve static dashboard files
  const dashboardPath = path.join(projectRoot, 'nova-api', 'cli', 'dashboard');

  // Create dashboard HTML if it doesn't exist
  await ensureDashboardFiles(dashboardPath);

  app.use(express.static(dashboardPath));
  app.use(express.json());

  // API routes
  setupDashboardRoutes(app);

  // WebSocket connections
  setupWebSocketHandlers(io);

  const spinner = createSpinner('Starting dashboard server...');
  spinner.start();

  try {
    await new Promise((resolve, reject) => {
      server.listen(port, host, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    spinner.succeed('Dashboard server started');

    const dashboardUrl = `http://${host}:${port}`;

    console.log(chalk.green('\n🎉 Nova Universe Dashboard is ready!\n'));
    console.log(chalk.cyan('🌐 URL:'), chalk.blue(dashboardUrl));
    console.log(chalk.gray('Press Ctrl+C to stop the dashboard\n'));

    // Open browser if requested
    if (options.open) {
      try {
        const { default: open } = await import('open');
        await open(dashboardUrl);
      } catch {
        console.log(chalk.yellow('Could not open browser automatically'));
        console.log(chalk.gray(`Please open ${dashboardUrl} manually`));
      }
    }

    // Start real-time monitoring
    startRealTimeMonitoring(io);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Shutting down dashboard...'));
      server.close(() => {
        console.log(chalk.gray('Dashboard stopped'));
        process.exit(0);
      });
    });

    // Keep the server running
    await new Promise(() => {});
  } catch (error) {
    spinner.fail('Failed to start dashboard server');
    throw error;
  }
}

// Setup dashboard API routes
function setupDashboardRoutes(app) {
  // System status endpoint
  app.get('/api/status', async (req, res) => {
    try {
      const status = await getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Service status endpoint
  app.get('/api/services', async (req, res) => {
    try {
      const services = await checkServiceStatus();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Logs endpoint
  app.get('/api/logs{/:service}', async (req, res) => {
    try {
      const { service } = req.params;
      const { lines = 50 } = req.query;

      const logs = await getRecentLogs(service, parseInt(lines));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Metrics endpoint
  app.get('/api/metrics', async (req, res) => {
    try {
      const metrics = await getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const health = await getHealthCheck();
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

// Setup WebSocket handlers
function setupWebSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(chalk.gray(`Dashboard client connected: ${socket.id}`));

    socket.on('disconnect', () => {
      console.log(chalk.gray(`Dashboard client disconnected: ${socket.id}`));
    });

    // Send initial data
    sendInitialData(socket);
  });
}

// Send initial data to new clients
async function sendInitialData(socket) {
  try {
    const [status, services, metrics] = await Promise.all([
      getSystemStatus(),
      checkServiceStatus(),
      getSystemMetrics(),
    ]);

    socket.emit('status', status);
    socket.emit('services', services);
    socket.emit('metrics', metrics);
  } catch (error) {
    socket.emit('error', { message: error.message });
  }
}

// Start real-time monitoring
function startRealTimeMonitoring(io) {
  // Update every 5 seconds
  setInterval(async () => {
    try {
      const [services, metrics] = await Promise.all([checkServiceStatus(), getSystemMetrics()]);

      io.emit('services', services);
      io.emit('metrics', metrics);
    } catch (error) {
      io.emit('error', { message: error.message });
    }
  }, 5000);

  // Update logs every 10 seconds
  setInterval(async () => {
    try {
      const logs = await getRecentLogs(null, 20);
      io.emit('logs', logs);
    } catch (error) {
      io.emit('error', { message: error.message });
    }
  }, 10000);
}

// Get system status
async function getSystemStatus() {
  const os = await import('os');

  return {
    timestamp: new Date().toISOString(),
    platform: os.platform(),
    hostname: os.hostname(),
    uptime: os.uptime(),
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    },
    cpu: {
      count: os.cpus().length,
      load: os.loadavg(),
    },
    node: process.version,
    pid: process.pid,
  };
}

// Get system metrics
async function getSystemMetrics() {
  const os = await import('os');

  const memory = {
    total: os.totalmem(),
    free: os.freemem(),
    used: os.totalmem() - os.freemem(),
  };

  const cpu = {
    count: os.cpus().length,
    load: os.loadavg(),
  };

  return {
    timestamp: Date.now(),
    memory: {
      ...memory,
      percentage: (memory.used / memory.total) * 100,
    },
    cpu: {
      ...cpu,
      percentage: (cpu.load[0] / cpu.count) * 100,
    },
    uptime: os.uptime(),
  };
}

// Get recent logs
async function getRecentLogs(service, lines) {
  const projectRoot = getProjectRoot();
  const logs = [];

  const logFiles = [
    { service: 'api', path: 'nova-api/server.log' },
    { service: 'admin', path: 'nova-core/dist/server.log' },
    { service: 'comms', path: 'nova-comms/server.log' },
    { service: 'system', path: 'server.log' },
  ];

  for (const logFile of logFiles) {
    if (service && logFile.service !== service) continue;

    const logPath = path.join(projectRoot, logFile.path);
    if (existsSync(logPath)) {
      try {
        const { runCommand } = await import('../utils/index.js');
        const { stdout } = await runCommand('tail', ['-n', lines.toString(), logPath], {
          silent: true,
        });

        const logLines = stdout
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => ({
            service: logFile.service,
            timestamp: new Date().toISOString(), // In practice, parse from log line
            message: line,
            level: extractLogLevel(line),
          }));

        logs.push(...logLines);
      } catch {
        // Log file might not exist or be readable
      }
    }
  }

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Get health check data
async function getHealthCheck() {
  const health = {
    overall: 'healthy',
    checks: {},
  };

  try {
    // Check services
    const services = await checkServiceStatus();
    const runningServices = Object.values(services).filter((s) => s.status === 'running');

    health.checks.services = {
      status: runningServices.length === Object.keys(services).length ? 'healthy' : 'critical',
      running: runningServices.length,
      total: Object.keys(services).length,
    };

    // Check database
    try {
      await connectDatabase();
      health.checks.database = { status: 'healthy' };
    } catch (error) {
      health.checks.database = { status: 'critical', error: error.message };
      health.overall = 'critical';
    }

    // Check system resources
    const os = await import('os');
    const memUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
    const cpuLoad = (os.loadavg()[0] / os.cpus().length) * 100;

    health.checks.resources = {
      status:
        memUsage > 90 || cpuLoad > 100
          ? 'critical'
          : memUsage > 80 || cpuLoad > 80
            ? 'warning'
            : 'healthy',
      memory: memUsage,
      cpu: cpuLoad,
    };

    if (
      health.checks.resources.status === 'critical' ||
      health.checks.services.status === 'critical'
    ) {
      health.overall = 'critical';
    } else if (health.checks.resources.status === 'warning') {
      health.overall = 'warning';
    }
  } catch (error) {
    health.overall = 'critical';
    health.error = error.message;
  }

  return health;
}

// Extract log level from log line
function extractLogLevel(line) {
  if (line.includes('ERROR') || line.includes('error')) return 'error';
  if (line.includes('WARN') || line.includes('warn')) return 'warning';
  if (line.includes('INFO') || line.includes('info')) return 'info';
  if (line.includes('DEBUG') || line.includes('debug')) return 'debug';
  return 'info';
}

// Ensure dashboard files exist
async function ensureDashboardFiles(dashboardPath) {
  const { mkdirSync, writeFileSync } = await import('fs');

  // Create dashboard directory
  if (!existsSync(dashboardPath)) {
    mkdirSync(dashboardPath, { recursive: true });
  }

  // Create index.html
  const indexPath = path.join(dashboardPath, 'index.html');
  if (!existsSync(indexPath)) {
    writeFileSync(indexPath, getDashboardHTML());
  }

  // Create dashboard.css
  const cssPath = path.join(dashboardPath, 'dashboard.css');
  if (!existsSync(cssPath)) {
    writeFileSync(cssPath, getDashboardCSS());
  }

  // Create dashboard.js
  const jsPath = path.join(dashboardPath, 'dashboard.js');
  if (!existsSync(jsPath)) {
    writeFileSync(jsPath, getDashboardJS());
  }
}

// Show dashboard information
async function showDashboardInfo() {
  console.log(chalk.cyan('📊 Nova Universe Dashboard Information\n'));

  console.log(chalk.yellow('Features:'));
  console.log(chalk.gray('  • Real-time service monitoring'));
  console.log(chalk.gray('  • System resource metrics'));
  console.log(chalk.gray('  • Live log streaming'));
  console.log(chalk.gray('  • Health check indicators'));
  console.log(chalk.gray('  • Responsive web interface'));

  console.log(chalk.yellow('\nEndpoints:'));
  console.log(chalk.gray('  GET  /api/status     - System status'));
  console.log(chalk.gray('  GET  /api/services   - Service status'));
  console.log(chalk.gray('  GET  /api/logs       - Recent logs'));
  console.log(chalk.gray('  GET  /api/metrics    - System metrics'));
  console.log(chalk.gray('  GET  /api/health     - Health check'));

  console.log(chalk.yellow('\nUsage:'));
  console.log(chalk.gray('  nova dashboard start              - Start dashboard'));
  console.log(chalk.gray('  nova dashboard start --port 3030  - Custom port'));
  console.log(chalk.gray('  nova dashboard start --host 0.0.0.0 - Listen on all interfaces'));

  console.log();
}

// Dashboard HTML template
function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova Universe Dashboard</title>
    <link rel="stylesheet" href="dashboard.css">
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>🌟 Nova Universe Dashboard</h1>
            <div class="status-indicator" id="connection-status">
                <span class="dot"></span>
                <span class="text">Connected</span>
            </div>
        </header>

        <div class="dashboard-grid">
            <!-- System Overview -->
            <div class="card">
                <h2>📊 System Overview</h2>
                <div class="metrics">
                    <div class="metric">
                        <span class="label">Uptime</span>
                        <span class="value" id="uptime">-</span>
                    </div>
                    <div class="metric">
                        <span class="label">Memory</span>
                        <span class="value" id="memory">-</span>
                    </div>
                    <div class="metric">
                        <span class="label">CPU Load</span>
                        <span class="value" id="cpu">-</span>
                    </div>
                </div>
            </div>

            <!-- Services Status -->
            <div class="card">
                <h2>🚀 Services</h2>
                <div id="services-list">
                    <div class="loading">Loading services...</div>
                </div>
            </div>

            <!-- Health Status -->
            <div class="card">
                <h2>🏥 Health Status</h2>
                <div id="health-status">
                    <div class="loading">Checking health...</div>
                </div>
            </div>

            <!-- Recent Logs -->
            <div class="card logs-card">
                <h2>📋 Recent Logs</h2>
                <div class="log-controls">
                    <select id="log-filter">
                        <option value="">All Services</option>
                        <option value="api">API</option>
                        <option value="admin">Admin</option>
                        <option value="comms">Comms</option>
                    </select>
                    <select id="level-filter">
                        <option value="">All Levels</option>
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                    </select>
                </div>
                <div id="logs-container">
                    <div class="loading">Loading logs...</div>
                </div>
            </div>
        </div>

        <footer>
            <p>Nova Universe Dashboard • Last updated: <span id="last-updated">-</span></p>
        </footer>
    </div>

    <script src="dashboard.js"></script>
</body>
</html>`;
}

// Dashboard CSS
function getDashboardCSS() {
  return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 10px;
    backdrop-filter: blur(10px);
}

header h1 {
    color: white;
    font-size: 2.5em;
    font-weight: 300;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
}

.status-indicator .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #4CAF50;
    animation: pulse 2s infinite;
}

.status-indicator.disconnected .dot {
    background: #f44336;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.card h2 {
    margin-bottom: 20px;
    color: #333;
    font-size: 1.3em;
    font-weight: 500;
}

.metrics {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 8px;
}

.metric .label {
    font-weight: 500;
    color: #666;
}

.metric .value {
    font-weight: 600;
    color: #333;
}

.service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    margin: 8px 0;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #ddd;
}

.service-item.running {
    border-left-color: #4CAF50;
}

.service-item.stopped {
    border-left-color: #f44336;
}

.service-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
}

.service-status.running {
    color: #4CAF50;
}

.service-status.stopped {
    color: #f44336;
}

.health-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    margin: 5px 0;
    border-radius: 6px;
}

.health-status.healthy {
    background: rgba(76, 175, 80, 0.1);
    color: #4CAF50;
}

.health-status.warning {
    background: rgba(255, 193, 7, 0.1);
    color: #FFC107;
}

.health-status.critical {
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
}

.logs-card {
    grid-column: 1 / -1;
}

.log-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.log-controls select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
}

#logs-container {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 8px;
    background: #f8f9fa;
}

.log-entry {
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
}

.log-entry:last-child {
    border-bottom: none;
}

.log-entry.error {
    background: rgba(244, 67, 54, 0.1);
    border-left: 3px solid #f44336;
}

.log-entry.warning {
    background: rgba(255, 193, 7, 0.1);
    border-left: 3px solid #FFC107;
}

.log-entry.info {
    background: rgba(33, 150, 243, 0.1);
    border-left: 3px solid #2196F3;
}

.log-service {
    display: inline-block;
    background: #667eea;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    margin-right: 8px;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

footer {
    text-align: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9em;
}

@media (max-width: 768px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    
    header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    header h1 {
        font-size: 2em;
    }
}`;
}

// Dashboard JavaScript
function getDashboardJS() {
  return `class NovaDashboard {
    constructor() {
        this.socket = io();
        this.setupEventListeners();
        this.setupSocketHandlers();
        this.updateLastUpdated();
    }

    setupEventListeners() {
        document.getElementById('log-filter').addEventListener('change', () => {
            this.loadLogs();
        });

        document.getElementById('level-filter').addEventListener('change', () => {
            this.filterLogs();
        });
    }

    setupSocketHandlers() {
        this.socket.on('connect', () => {
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            this.updateConnectionStatus(false);
        });

        this.socket.on('status', (data) => {
            this.updateSystemStatus(data);
        });

        this.socket.on('services', (data) => {
            this.updateServices(data);
        });

        this.socket.on('metrics', (data) => {
            this.updateMetrics(data);
        });

        this.socket.on('logs', (data) => {
            this.updateLogs(data);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    updateConnectionStatus(connected) {
        const statusEl = document.getElementById('connection-status');
        if (connected) {
            statusEl.classList.remove('disconnected');
            statusEl.querySelector('.text').textContent = 'Connected';
        } else {
            statusEl.classList.add('disconnected');
            statusEl.querySelector('.text').textContent = 'Disconnected';
        }
    }

    updateSystemStatus(data) {
        document.getElementById('uptime').textContent = this.formatDuration(data.uptime * 1000);
        this.updateLastUpdated();
    }

    updateServices(data) {
        const container = document.getElementById('services-list');
        container.innerHTML = '';

        for (const [key, service] of Object.entries(data)) {
            const serviceEl = document.createElement('div');
            serviceEl.className = \`service-item \${service.status}\`;
            
            serviceEl.innerHTML = \`
                <div>
                    <strong>\${service.name}</strong>
                    <div>Port: \${service.port || 'N/A'}</div>
                </div>
                <div class="service-status \${service.status}">
                    \${service.status === 'running' ? '🟢' : '🔴'} \${service.status}
                </div>
            \`;
            
            container.appendChild(serviceEl);
        }
    }

    updateMetrics(data) {
        document.getElementById('memory').textContent = 
            \`\${this.formatBytes(data.memory.used)} / \${this.formatBytes(data.memory.total)} (\${data.memory.percentage.toFixed(1)}%)\`;
        
        document.getElementById('cpu').textContent = 
            \`\${data.cpu.percentage.toFixed(1)}% (Load: \${data.cpu.load[0].toFixed(2)})\`;
        
        this.updateLastUpdated();
    }

    updateLogs(data) {
        this.currentLogs = data;
        this.renderLogs();
    }

    renderLogs() {
        const container = document.getElementById('logs-container');
        const levelFilter = document.getElementById('level-filter').value;
        
        if (!this.currentLogs) {
            container.innerHTML = '<div class="loading">Loading logs...</div>';
            return;
        }

        let filteredLogs = this.currentLogs;
        
        if (levelFilter) {
            filteredLogs = filteredLogs.filter(log => log.level === levelFilter);
        }

        if (filteredLogs.length === 0) {
            container.innerHTML = '<div class="loading">No logs match the current filter</div>';
            return;
        }

        container.innerHTML = filteredLogs
            .slice(0, 50) // Limit to 50 entries
            .map(log => \`
                <div class="log-entry \${log.level}">
                    <span class="log-service">\${log.service}</span>
                    <span class="log-message">\${this.escapeHtml(log.message)}</span>
                </div>
            \`).join('');
    }

    filterLogs() {
        this.renderLogs();
    }

    async loadLogs() {
        const service = document.getElementById('log-filter').value;
        try {
            const response = await fetch(\`/api/logs\${service ? '/' + service : ''}\`);
            const logs = await response.json();
            this.updateLogs(logs);
        } catch (error) {
            console.error('Failed to load logs:', error);
        }
    }

    async loadHealthStatus() {
        try {
            const response = await fetch('/api/health');
            const health = await response.json();
            this.updateHealthStatus(health);
        } catch (error) {
            console.error('Failed to load health status:', error);
        }
    }

    updateHealthStatus(health) {
        const container = document.getElementById('health-status');
        container.innerHTML = \`
            <div class="health-item health-status \${health.overall}">
                <span>Overall Status</span>
                <span>\${health.overall.toUpperCase()}</span>
            </div>
        \`;

        for (const [check, result] of Object.entries(health.checks)) {
            const checkEl = document.createElement('div');
            checkEl.className = \`health-item health-status \${result.status}\`;
            checkEl.innerHTML = \`
                <span>\${this.capitalizeFirst(check)}</span>
                <span>\${result.status.toUpperCase()}</span>
            \`;
            container.appendChild(checkEl);
        }
    }

    updateLastUpdated() {
        document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return \`\${days}d \${hours % 24}h\`;
        if (hours > 0) return \`\${hours}h \${minutes % 60}m\`;
        if (minutes > 0) return \`\${minutes}m \${seconds % 60}s\`;
        return \`\${seconds}s\`;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new NovaDashboard();
});`;
}
