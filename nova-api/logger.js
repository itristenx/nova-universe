// nova-api/logger.js
// Centralized logger utility for consistent logging

const log = (level, ...args) => {
  const timestamp = new Date().toISOString();
  switch (level) {
    case 'error':
      console.error(`[${timestamp}] ❌`, ...args);
      break;
    case 'warn':
      console.warn(`[${timestamp}] ⚠️`, ...args);
      break;
    case 'info':
      console.info(`[${timestamp}] ℹ️`, ...args);
      break;
    default:
      console.log(`[${timestamp}]`, ...args);
  }
};

export const logger = {
  error: (...args) => log('error', ...args),
  warn: (...args) => log('warn', ...args),
  info: (...args) => log('info', ...args),
  log: (...args) => log('log', ...args),
};
