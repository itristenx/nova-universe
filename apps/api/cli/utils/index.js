/**
 * CLI Utilities and Helpers
 */

import chalk from 'chalk';
import ora from 'ora';
import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import Conf from 'conf';

// Configuration store
export const config = new Conf({
  projectName: 'nova-cli',
  schema: {
    apiUrl: {
      type: 'string',
      default: 'http://localhost:3000'
    },
    adminUrl: {
      type: 'string', 
      default: 'http://localhost:5173'
    },
    environment: {
      type: 'string',
      default: 'development'
    },
    autoStart: {
      type: 'boolean',
      default: false
    },
    theme: {
      type: 'string',
      default: 'default'
    }
  }
});

// Logging utilities
export const logger = {
  info: (message) => {
    if (!process.env.NOVA_QUIET) {
      console.log(chalk.blue('ℹ'), message);
    }
  },
  success: (message) => {
    if (!process.env.NOVA_QUIET) {
      console.log(chalk.green('✅'), message);
    }
  },
  warning: (message) => {
    console.log(chalk.yellow('⚠️'), message);
  },
  error: (message) => {
    console.error(chalk.red('❌'), message);
  },
  debug: (message) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), chalk.gray(message));
    }
  }
};

// Spinner utilities
export function createSpinner(text, options = {}) {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots',
    ...options
  });
}

// Process management
export async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.silent ? 'pipe' : 'inherit',
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    if (options.silent) {
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
      }
    });

    child.on('error', reject);
  });
}

// Check if Nova services are running
export async function checkServiceStatus() {
  const services = {
    api: { port: 3000, name: 'Nova API' },
    admin: { port: 5173, name: 'Nova Admin UI' },
    comms: { port: 3001, name: 'Nova Communications' }
  };

  const results = {};

  for (const [key, service] of Object.entries(services)) {
    try {
      // Check if port is in use
      execSync(`lsof -i :${service.port}`, { stdio: 'pipe' });
      results[key] = { 
        status: 'running', 
        name: service.name, 
        port: service.port 
      };
    } catch {
      results[key] = { 
        status: 'stopped', 
        name: service.name, 
        port: service.port 
      };
    }
  }

  return results;
}

// Get project root directory
export function getProjectRoot() {
  let current = process.cwd();
  
  while (current !== path.parse(current).root) {
    if (existsSync(path.join(current, 'package.json'))) {
      const pkg = JSON.parse(readFileSync(path.join(current, 'package.json'), 'utf8'));
      if (pkg.name === 'nova-api' || pkg.name?.includes('nova')) {
        return current;
      }
    }
    current = path.dirname(current);
  }
  
  return process.cwd();
}

// Format duration
export function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Validate email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate secure password
export function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Validate password strength
export function validatePassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  const issues = [];
  
  if (password.length < minLength) {
    issues.push(`Must be at least ${minLength} characters long`);
  }
  if (!hasUpper) {
    issues.push('Must contain at least one uppercase letter');
  }
  if (!hasLower) {
    issues.push('Must contain at least one lowercase letter');
  }
  if (!hasNumber) {
    issues.push('Must contain at least one number');
  }
  if (!hasSpecial) {
    issues.push('Must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// Format bytes
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format file size (alias for formatBytes for consistency)
export const formatFileSize = formatBytes;

// Sleep utility
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if running in CI
export function isCI() {
  return Boolean(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.BUILD_NUMBER ||
    process.env.GITHUB_ACTIONS ||
    process.env.TRAVIS ||
    process.env.CIRCLECI
  );
}

// Database connection (simplified for CLI)
export async function connectDatabase() {
  // This is a placeholder for database connection
  // In a real implementation, this would connect to the actual database
  // For now, we'll simulate it
  return {
    connected: true,
    type: 'mock'
  };
}

// Validate email (alias for isValidEmail for consistency)
export const validateEmail = isValidEmail;

// Format date
export function formatDate(date, format = 'short') {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString();
  } else if (format === 'long') {
    return d.toLocaleString();
  } else if (format === 'iso') {
    return d.toISOString();
  } else {
    return d.toString();
  }
}

// Validate URL
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate port
export function validatePort(port) {
  const num = parseInt(port, 10);
  return !isNaN(num) && num > 0 && num <= 65535;
}

// Cleanup processes (for safe shutdown)
export function cleanup() {
  // Graceful cleanup logic
  process.exit(0);
}
