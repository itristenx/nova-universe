// nova-api/lib/mcp-server.js
// Model Context Protocol (MCP) Server

import { logger } from '../logger.js';

/**
 * Nova MCP Server for AI model context management
 */
class NovaMCPServer {
  constructor() {
    this.initialized = false;
    this.contexts = new Map();
    this.models = new Map();
  }

  /**
   * Initialize MCP Server
   */
  async initialize() {
    try {
      logger.info('Initializing Nova MCP Server...');
      this.initialized = true;
      logger.info('Nova MCP Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Nova MCP Server', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if MCP server is ready
   */
  isReady() {
    return this.initialized;
  }

  /**
   * Create new context
   */
  async createContext(contextId, options = {}) {
    if (!this.initialized) {
      throw new Error('MCP Server not initialized');
    }

    const context = {
      id: contextId,
      options,
      createdAt: new Date().toISOString(),
      messages: [],
      metadata: {}
    };

    this.contexts.set(contextId, context);
    logger.info('MCP context created', { contextId });
    
    return context;
  }

  /**
   * Get context
   */
  getContext(contextId) {
    return this.contexts.get(contextId);
  }

  /**
   * Update context
   */
  async updateContext(contextId, updates) {
    const context = this.contexts.get(contextId);
    if (!context) {
      throw new Error(`Context ${contextId} not found`);
    }

    Object.assign(context, updates);
    context.updatedAt = new Date().toISOString();
    
    logger.info('MCP context updated', { contextId });
    return context;
  }

  /**
   * Add message to context
   */
  async addMessage(contextId, message) {
    const context = this.contexts.get(contextId);
    if (!context) {
      throw new Error(`Context ${contextId} not found`);
    }

    context.messages.push({
      ...message,
      timestamp: new Date().toISOString()
    });

    logger.debug('Message added to MCP context', { contextId, messageId: message.id });
    return context;
  }

  /**
   * List all contexts
   */
  listContexts() {
    return Array.from(this.contexts.values());
  }

  /**
   * Delete context
   */
  deleteContext(contextId) {
    const deleted = this.contexts.delete(contextId);
    if (deleted) {
      logger.info('MCP context deleted', { contextId });
    }
    return deleted;
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      contextCount: this.contexts.size,
      modelCount: this.models.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}

// Create singleton instance
export const novaMCPServer = new NovaMCPServer();

// Initialize on module load
if (process.env.NODE_ENV !== 'test') {
  novaMCPServer.initialize().catch(err => {
    logger.error('Nova MCP Server initialization failed', { error: err.message });
  });
}
