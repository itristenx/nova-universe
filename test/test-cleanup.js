/**
 * Test Cleanup Utility
 * Provides graceful cleanup mechanisms for all Nova Universe tests
 */

// Global cleanup tracking
const globalCleanupRegistry = {
  timeouts: new Set(),
  intervals: new Set(),
  connections: new Set(),
  workers: new Set(),
  processes: new Set(),
  eventListeners: new Map(),
  fileHandles: new Set(),
  resources: new Set(),
};

let isCleaningUp = false;
let cleanupHandlersRegistered = false;

/**
 * Register a resource for cleanup
 * @param {string} type - Type of resource (timeout, interval, connection, worker, process, etc.)
 * @param {*} resource - The resource to track
 */
export function registerResource(type, resource) {
  if (!globalCleanupRegistry[type]) {
    globalCleanupRegistry[type] = new Set();
  }
  globalCleanupRegistry[type].add(resource);
}

/**
 * Unregister a resource (when cleaned up manually)
 * @param {string} type - Type of resource
 * @param {*} resource - The resource to untrack
 */
export function unregisterResource(type, resource) {
  if (globalCleanupRegistry[type]) {
    globalCleanupRegistry[type].delete(resource);
  }
}

/**
 * Create a tracked timeout that will be automatically cleaned up
 * @param {Function} callback - Callback function
 * @param {number} delay - Delay in milliseconds
 * @returns {number} Timeout ID
 */
export function createTimeout(callback, delay) {
  const timeoutId = setTimeout(() => {
    unregisterResource('timeouts', timeoutId);
    callback();
  }, delay);
  registerResource('timeouts', timeoutId);
  return timeoutId;
}

/**
 * Create a tracked interval that will be automatically cleaned up
 * @param {Function} callback - Callback function
 * @param {number} delay - Interval in milliseconds
 * @returns {number} Interval ID
 */
export function createInterval(callback, delay) {
  const intervalId = setInterval(callback, delay);
  registerResource('intervals', intervalId);
  return intervalId;
}

/**
 * Main cleanup function
 */
export async function performCleanup() {
  if (isCleaningUp) return;
  isCleaningUp = true;

  console.log('🧹 Starting comprehensive test cleanup...');

  let cleanupTasks = 0;

  // Clean up timeouts
  if (globalCleanupRegistry.timeouts.size > 0) {
    console.log(`   Clearing ${globalCleanupRegistry.timeouts.size} timeouts...`);
    for (const timeoutId of globalCleanupRegistry.timeouts) {
      clearTimeout(timeoutId);
      cleanupTasks++;
    }
    globalCleanupRegistry.timeouts.clear();
  }

  // Clean up intervals
  if (globalCleanupRegistry.intervals.size > 0) {
    console.log(`   Clearing ${globalCleanupRegistry.intervals.size} intervals...`);
    for (const intervalId of globalCleanupRegistry.intervals) {
      clearInterval(intervalId);
      cleanupTasks++;
    }
    globalCleanupRegistry.intervals.clear();
  }

  // Clean up worker threads
  if (globalCleanupRegistry.workers.size > 0) {
    console.log(`   Terminating ${globalCleanupRegistry.workers.size} workers...`);
    const workerTerminations = Array.from(globalCleanupRegistry.workers).map((worker) => {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          try {
            worker.terminate();
          } catch (_error) {
            console.warn('Warning: Error terminating worker:', error.message);
          }
          resolve();
        }, 3000);

        worker.once('exit', () => {
          clearTimeout(timeout);
          resolve();
        });

        try {
          worker.postMessage({ type: 'shutdown' });
        } catch (_error) {
          worker.terminate();
          clearTimeout(timeout);
          resolve();
        }
      });
    });

    await Promise.all(workerTerminations);
    cleanupTasks += globalCleanupRegistry.workers.size;
    globalCleanupRegistry.workers.clear();
  }

  // Clean up child processes
  if (globalCleanupRegistry.processes.size > 0) {
    console.log(`   Terminating ${globalCleanupRegistry.processes.size} processes...`);
    for (const process of globalCleanupRegistry.processes) {
      try {
        if (process && !process.killed) {
          process.kill('SIGTERM');
          // Give process time to terminate gracefully
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (!process.killed) {
            process.kill('SIGKILL');
          }
        }
        cleanupTasks++;
      } catch (_error) {
        console.warn('Warning: Error terminating process:', error.message);
      }
    }
    globalCleanupRegistry.processes.clear();
  }

  // Clean up connections
  if (globalCleanupRegistry.connections.size > 0) {
    console.log(`   Closing ${globalCleanupRegistry.connections.size} connections...`);
    for (const connection of globalCleanupRegistry.connections) {
      try {
        if (connection && typeof connection.close === 'function') {
          await connection.close();
        } else if (connection && typeof connection.end === 'function') {
          await connection.end();
        }
        cleanupTasks++;
      } catch (_error) {
        console.warn('Warning: Error closing connection:', error.message);
      }
    }
    globalCleanupRegistry.connections.clear();
  }

  // Clean up file handles
  if (globalCleanupRegistry.fileHandles.size > 0) {
    console.log(`   Closing ${globalCleanupRegistry.fileHandles.size} file handles...`);
    for (const handle of globalCleanupRegistry.fileHandles) {
      try {
        if (handle && typeof handle.close === 'function') {
          await handle.close();
        }
        cleanupTasks++;
      } catch (_error) {
        console.warn('Warning: Error closing file handle:', error.message);
      }
    }
    globalCleanupRegistry.fileHandles.clear();
  }

  // Clean up generic resources
  if (globalCleanupRegistry.resources.size > 0) {
    console.log(`   Disposing ${globalCleanupRegistry.resources.size} resources...`);
    for (const resource of globalCleanupRegistry.resources) {
      try {
        if (resource && typeof resource.dispose === 'function') {
          await resource.dispose();
        } else if (resource && typeof resource.cleanup === 'function') {
          await resource.cleanup();
        }
        cleanupTasks++;
      } catch (_error) {
        console.warn('Warning: Error disposing resource:', error.message);
      }
    }
    globalCleanupRegistry.resources.clear();
  }

  // Remove event listeners
  if (globalCleanupRegistry.eventListeners.size > 0) {
    console.log(`   Removing ${globalCleanupRegistry.eventListeners.size} event listeners...`);
    for (const [target, listeners] of globalCleanupRegistry.eventListeners) {
      for (const { event, listener } of listeners) {
        try {
          target.removeListener(event, listener);
          cleanupTasks++;
        } catch (_error) {
          console.warn('Warning: Error removing event listener:', error.message);
        }
      }
    }
    globalCleanupRegistry.eventListeners.clear();
  }

  console.log(`✅ Test cleanup completed successfully (${cleanupTasks} resources cleaned)`);
  isCleaningUp = false;
}

/**
 * Register cleanup handlers for the current process
 */
export function registerCleanupHandlers() {
  if (cleanupHandlersRegistered) return;
  cleanupHandlersRegistered = true;

  // Handle graceful shutdown signals
  process.on('SIGINT', async () => {
    console.log('\n⚠️  Received SIGINT, cleaning up...');
    await performCleanup();
    process.exit(130);
  });

  process.on('SIGTERM', async () => {
    console.log('\n⚠️  Received SIGTERM, cleaning up...');
    await performCleanup();
    process.exit(143);
  });

  // Handle process exit
  process.on('exit', () => {
    // Synchronous cleanup only (no async operations allowed here)
    if (globalCleanupRegistry.timeouts.size > 0) {
      for (const timeoutId of globalCleanupRegistry.timeouts) {
        clearTimeout(timeoutId);
      }
    }
    if (globalCleanupRegistry.intervals.size > 0) {
      for (const intervalId of globalCleanupRegistry.intervals) {
        clearInterval(intervalId);
      }
    }
  });

  // Handle uncaught exceptions and unhandled rejections
  process.on('uncaughtException', async (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error(error.stack);
    await performCleanup();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    await performCleanup();
    process.exit(1);
  });

  // Handle before exit for graceful shutdown
  process.on('beforeExit', async () => {
    await performCleanup();
  });
}

/**
 * Create a test suite with automatic cleanup
 * @param {Function} testFunction - The test function to wrap
 * @returns {Function} Wrapped test function
 */
export function withCleanup(testFunction) {
  return async (...args) => {
    try {
      registerCleanupHandlers();
      return await testFunction(...args);
    } finally {
      await performCleanup();
    }
  };
}

// Export cleanup registry for advanced usage
export { globalCleanupRegistry };

// Auto-register cleanup handlers when this module is imported
registerCleanupHandlers();

console.log('🧹 Test cleanup utility initialized');
