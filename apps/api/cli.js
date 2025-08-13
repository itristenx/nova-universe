#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import db from './db.js';
import { logger } from './logger.js';

// Set flag to suppress verbose admin setup output
process.env.CLI_MODE = 'true';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askPassword(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function changeAdminPassword() {
  logger.info('🔑 Nova Universe Portal Password Reset Tool');
  logger.info('=====================================\n');
  
  // Check if password is provided as argument
  const newPassword = process.argv[3];
  
  if (newPassword) {
    // Password provided as argument
    updatePassword(newPassword);
  } else {
    // Interactive mode
    setTimeout(() => {
      askPassword('Enter new password: ').then((password) => {
        updatePassword(password);
      });
    }, 2000);
  }
}

function updatePassword(newPassword) {
  if (!newPassword || newPassword.length < 8) {
    logger.error('Password must be at least 8 characters long');
    rl.close();
    return;
  }
  
  // Additional password strength validation
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    logger.error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    rl.close();
    return;
  }
  
  // Find default admin users
  db.all('SELECT email FROM users WHERE isDefault = 1', (err, rows) => {
    if (err) {
      logger.error('Database error:', err.message);
      rl.close();
      return;
    }
    
    if (rows.length === 0) {
      logger.error('No default admin users found');
      rl.close();
      return;
    }
    
    const adminEmail = rows[0].email;
    logger.info(`Updating password for: ${adminEmail}`);
    
    const hashedPassword = bcrypt.hashSync(newPassword, 12); // Increase salt rounds
    
    db.run(
      'UPDATE users SET passwordHash = ? WHERE email = ? AND isDefault = 1',
      [hashedPassword, adminEmail],
      function(err) {
        if (err) {
          logger.error('Failed to update password:', err.message);
        } else if (this.changes === 0) {
          logger.error('No users updated - check if default admin exists');
        } else {
          logger.info(`Password updated successfully for ${adminEmail}`);
        }
        rl.close();
      }
    );
  });
}

function listUsers() {
  logger.info('Nova Universe Default Admin Users');
  logger.info('============================\n');
  
  // Wait for database initialization
  setTimeout(() => {
    db.all(`
      SELECT DISTINCT u.id, u.name, u.email, u.disabled, u."isDefault",
             r.name as role
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u."isDefault" = 1 AND r.name = 'superadmin'
      ORDER BY u.id
    `, (err, rows) => {
      if (err) {
        logger.error('Failed to fetch default admin users:', err.message);
        rl.close();
        return;
      }
      
      if (rows.length === 0) {
        logger.warn('No default superadmin users found.');
        rl.close();
        return;
      }
      
      rows.forEach(user => {
        const status = user.disabled ? '❌ DISABLED' : '✅ ACTIVE';
        
        logger.info(`ID: ${user.id} | ${user.name} (${user.email})`);
        logger.info(`   Status: ${status} 🛡️  DEFAULT SUPERADMIN`);
        logger.info(`   Role: ${user.role}\n`);
      });
      
      rl.close();
    });
  }, 1000);
}

// System health check
async function healthCheck() {
  logger.info('🔍 Nova Universe System Health Check');
  logger.info('====================================\n');
  
  const checks = [];
  
  // Check API Health
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      checks.push({ service: 'Nova API', status: '✅ Healthy', port: 3000 });
    } else {
      checks.push({ service: 'Nova API', status: '❌ Unhealthy', port: 3000 });
    }
  } catch (error) {
    checks.push({ service: 'Nova API', status: '❌ Offline', port: 3000 });
  }
  
  // Check Core UI
  try {
    const response = await fetch('http://localhost:3001');
    if (response.ok) {
      checks.push({ service: 'Nova Core UI', status: '✅ Healthy', port: 3001 });
    } else {
      checks.push({ service: 'Nova Core UI', status: '❌ Unhealthy', port: 3001 });
    }
  } catch (error) {
    checks.push({ service: 'Nova Core UI', status: '❌ Offline', port: 3001 });
  }
  
  // Check Sentinel (if enabled)
  try {
    const response = await fetch('http://localhost:3002/api/status');
    if (response.ok) {
      checks.push({ service: 'Nova Sentinel', status: '✅ Healthy', port: 3002 });
    } else {
      checks.push({ service: 'Nova Sentinel', status: '❌ Unhealthy', port: 3002 });
    }
  } catch (error) {
    checks.push({ service: 'Nova Sentinel', status: '❌ Offline', port: 3002 });
  }
  
  // Check GoAlert (if enabled)
  try {
    const response = await fetch('http://localhost:8081/health');
    if (response.ok) {
      checks.push({ service: 'GoAlert', status: '✅ Healthy', port: 8081 });
    } else {
      checks.push({ service: 'GoAlert', status: '❌ Unhealthy', port: 8081 });
    }
  } catch (error) {
    checks.push({ service: 'GoAlert', status: '❌ Offline', port: 8081 });
  }
  
  // Display results
  checks.forEach(check => {
    logger.info(`${check.service.padEnd(20)} ${check.status} (Port: ${check.port})`);
  });
  
  const healthyCount = checks.filter(c => c.status.includes('✅')).length;
  logger.info(`\nOverall Status: ${healthyCount}/${checks.length} services healthy`);
  
  rl.close();
}

// Configure monitoring services
function configureMonitoring() {
  logger.info('⚙️  Nova Universe Monitoring Configuration');
  logger.info('=========================================\n');
  
  logger.info('Available monitoring services:');
  logger.info('1. Nova Sentinel (Uptime monitoring)');
  logger.info('2. GoAlert (Incident management)');
  logger.info('3. AI Fabric (ML/AI monitoring)');
  logger.info('\nUse the setup wizard at http://localhost:3001/setup to configure these services.');
  
  rl.close();
}

// Start/Stop services
function startServices() {
  logger.info('🚀 Starting Nova Universe Services');
  logger.info('==================================\n');
  
  const dockerCompose = spawn('docker-compose', ['up', '-d'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  dockerCompose.on('close', (code) => {
    if (code === 0) {
      logger.info('\n✅ All services started successfully!');
      logger.info('📱 Core UI: http://localhost:3001');
      logger.info('🔌 API: http://localhost:3000');
      logger.info('📊 Sentinel: http://localhost:3002');
      logger.info('🚨 GoAlert: http://localhost:8081');
    } else {
      logger.error('❌ Failed to start services');
    }
    rl.close();
  });
}

function stopServices() {
  logger.info('🛑 Stopping Nova Universe Services');
  logger.info('==================================\n');
  
  const dockerCompose = spawn('docker-compose', ['down'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  dockerCompose.on('close', (code) => {
    if (code === 0) {
      logger.info('\n✅ All services stopped successfully!');
    } else {
      logger.error('❌ Failed to stop services');
    }
    rl.close();
  });
}

// Reset system to clean state
function resetSystem() {
  logger.info('🔄 Nova Universe System Reset');
  logger.info('=============================\n');
  logger.info('⚠️  This will remove all data and reset to initial state.');
  
  askPassword('Type "RESET" to confirm: ').then((confirmation) => {
    if (confirmation === 'RESET') {
      logger.info('Resetting system...');
      
      const dockerCompose = spawn('docker-compose', ['down', '-v'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      dockerCompose.on('close', (code) => {
        if (code === 0) {
          logger.info('\n✅ System reset complete!');
          logger.info('Run "node cli.js start" to begin fresh setup.');
        } else {
          logger.error('❌ Failed to reset system');
        }
        rl.close();
      });
    } else {
      logger.info('Reset cancelled.');
      rl.close();
    }
  });
}

// Show system status and URLs
function showStatus() {
  logger.info('📊 Nova Universe Status');
  logger.info('=======================\n');
  
  logger.info('Service URLs:');
  logger.info('• Core Admin UI:     http://localhost:3001');
  logger.info('• API Documentation: http://localhost:3000/docs');
  logger.info('• Sentinel Monitor:  http://localhost:3002');
  logger.info('• GoAlert Dashboard: http://localhost:8081');
  logger.info('• AI Fabric:         http://localhost:3000/ai-fabric');
  logger.info('\nDefault Admin Login:');
  logger.info('• Email:    admin@example.com');
  logger.info('• Password: admin');
  logger.info('\n💡 Use "node cli.js health" for detailed health check');
  
  rl.close();
}

function showHelp() {
  logger.info('Nova Universe CLI');
  logger.info('=================\n');
  
  logger.info('User Management:');
  logger.info('  passwd, change-password [pwd] - Change admin password');
  logger.info('  users, list-users             - List admin users\n');
  
  logger.info('Service Management:');
  logger.info('  start                         - Start all services');
  logger.info('  stop                          - Stop all services');
  logger.info('  restart                       - Restart all services');
  logger.info('  status                        - Show service URLs and info');
  logger.info('  health                        - Check service health\n');
  
  logger.info('Configuration:');
  logger.info('  config, configure             - Configure monitoring services');
  logger.info('  reset                         - Reset system (removes all data)\n');
  
  logger.info('Information:');
  logger.info('  help, --help, -h              - Show this help');
  logger.info('  version, --version, -v        - Show version info\n');
  
  logger.info('Examples:');
  logger.info('  node cli.js start             # Start all services');
  logger.info('  node cli.js passwd newpass123 # Set admin password');
  logger.info('  node cli.js health            # Check system health');
  
  rl.close();
}

function showVersion() {
  const packagePath = path.join(process.cwd(), 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    logger.info(`Nova Universe v${pkg.version}`);
    logger.info('Enterprise Help Desk Platform');
  } catch (error) {
    logger.info('Nova Universe (version unknown)');
  }
  rl.close();
}

// CLI command router
const command = process.argv[2];

switch (command) {
  case 'change-password':
  case 'passwd':
    changeAdminPassword();
    break;
  case 'list-users':
  case 'users':
    listUsers();
    break;
  case 'health':
  case 'check':
    healthCheck();
    break;
  case 'config':
  case 'configure':
    configureMonitoring();
    break;
  case 'start':
    startServices();
    break;
  case 'stop':
    stopServices();
    break;
  case 'restart':
    stopServices();
    setTimeout(startServices, 3000);
    break;
  case 'reset':
    resetSystem();
    break;
  case 'status':
    showStatus();
    break;
  case 'version':
  case '--version':
  case '-v':
    showVersion();
    break;
  case 'help':
  case '--help':
  case '-h':
  default:
    if (command && !command.startsWith('-')) {
      logger.error(`❌ Unknown command: ${command}\n`);
    }
    showHelp();
}
