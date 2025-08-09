// nova-api/logger.js
// Centralized logger utility for consistent logging
import fs from 'fs';
import path from 'path';
const errorLogPath = path.join(process.cwd(), 'apps/api/error.log');

const log = (level, ...args) => {
  const timestamp = new Date().toISOString();
  const msg = `[${timestamp}] ${level.toUpperCase()} ${args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}\n`;
  switch (level) {
    case 'error':
      console.error(`[${timestamp}] ❌`, ...args);
      try { fs.appendFileSync(errorLogPath, msg); } catch (e) {}
      break;
    case 'warn':
      console.warn(`[${timestamp}] ⚠️`, ...args);
      break;
    case 'info':
      console.info(`[${timestamp}] ℹ️`, ...args);
      break;
    case 'debug':
      console.debug(`[${timestamp}] 🐛`, ...args);
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
  debug: (...args) => log('debug', ...args)
<<<<<<< Current (Your changes)
>>>>>>> Incoming (Background Agent changes)
=======
>>>>>>> Incoming (Background Agent changes)
};
