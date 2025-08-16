// src/lib/db/index.ts
// Unified database manager coordinating PostgreSQL, MongoDB, and Elasticsearch
import { logger } from '../../../apps/api/logger.js';
import { elasticManager } from './elastic.js';
import enhancedMongo from './mongo.js';
import enhancedPrisma from './postgres.js';

// Database health status interface
interface DatabaseHealth {
  postgres: {
    healthy: boolean;
    responseTime?: number;
    error?: string;
  };
  mongo: {
    healthy: boolean;
    responseTime?: number;
    error?: string;
  };
  elasticsearch: {
    healthy: boolean;
    responseTime?: number;
    clusterStatus?: string;
    error?: string;
  };
}

// Nova Database Manager - coordinates all database operations
class NovaDatabaseManager {
  private initialized = false;

  constructor() {
    // Graceful shutdown handler
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  async initialize() {
    if (this.initialized) return;

    logger.info('Initializing Nova Database Manager...');

    try {
      // Initialize all database connections in parallel
      await Promise.all([
        Promise.resolve(), // Prisma client is already initialized
        enhancedMongo.getDb(),
        elasticManager.initialize()
      ]); // TODO-LINT: move to async function

      this.initialized = true;
      logger.info('Nova Database Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Nova Database Manager: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Get comprehensive health status of all databases
  async getHealthStatus(): Promise<DatabaseHealth> {
    const [postgresHealth, mongoHealth, elasticHealth] = await Promise.allSettled([
      enhancedPrisma.healthCheck(),
      enhancedMongo.healthCheck(),
      elasticManager.healthCheck()
    ]); // TODO-LINT: move to async function

    const healthStatus = {
      postgres: postgresHealth.status === 'fulfilled' 
        ? postgresHealth.value 
        : { healthy: false, error: postgresHealth.reason?.message },
      mongo: mongoHealth.status === 'fulfilled'
        ? mongoHealth.value
        : { healthy: false, error: mongoHealth.reason?.message },
      elasticsearch: elasticHealth.status === 'fulfilled'
        ? elasticHealth.value
        : { healthy: false, error: elasticHealth.reason?.message }
    };

    logger.info('Health status: ' + JSON.stringify(healthStatus));

    return healthStatus;
  }

  // User management operations (PostgreSQL primary, with audit logging to MongoDB)
  async createUser(userData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function

      // Create user in PostgreSQL
      const user = await enhancedPrisma.prisma.user.create({ data: userData }); // TODO-LINT: move to async function

      // Log user creation to MongoDB
      await enhancedMongo.logUserActivity(
        user.id,
        'user_created',
        { userId: user.id, email: user.email }
      ); // TODO-LINT: move to async function

      // Also log as audit entry
      await enhancedMongo.logAudit(
        user.id,
        'user_created',
        { email: user.email },
        userData.ip
      ); // TODO-LINT: move to async function

      logger.info(`User created: ${user.id}`);
      return user;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to create user',
        'database_manager',
        error as Error,
        { userData }
      ); // TODO-LINT: move to async function
      throw error;
    }
  }

  async updateUser(userId: string, updateData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types, auditInfo: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function

      // Update user in PostgreSQL
      const user = await enhancedPrisma.prisma.user.update({
        where: { id: userId },
        data: updateData
      }); // TODO-LINT: move to async function

      // Log update to MongoDB
      await enhancedMongo.logUserActivity(
        userId,
        'user_updated',
        { changes: updateData }
      ); // TODO-LINT: move to async function

      // Audit log
      await enhancedMongo.logAudit(
        userId,
        'user_updated',
        { changes: updateData },
        auditInfo.ip
      ); // TODO-LINT: move to async function

      return user;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to update user',
        'database_manager',
        error as Error,
        { userId, updateData }
      ); // TODO-LINT: move to async function
      throw error;
    }
  }

  // Ticket management with full-text search indexing
  async createTicket(ticketData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function

      // Create ticket in PostgreSQL (first check if supportTicket model exists)
      let ticket;
      try {
        ticket = await enhancedPrisma.prisma.support_tickets.create({ 
          data: ticketData,
          include: {
            users_support_tickets_userIdTousers: true,
            users_support_tickets_assigneeIdTousers: true
          }
        }); // TODO-LINT: move to async function
      } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
        // If supportTicket model doesn't exist, create a generic ticket record
        if (error.message.includes('Unknown model')) {
          logger.warn('SupportTicket model not found, creating basic ticket record');
          // For now, just log the ticket creation
          await enhancedMongo.logSystem(
            'info',
            'Ticket created (no PostgreSQL model)',
            'database_manager',
            ticketData
          ); // TODO-LINT: move to async function
          
          // Create a mock ticket for indexing
          ticket = {
            id: `ticket_${Date.now()}`,
            ...ticketData,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } else {
          throw error;
        }
      }

      // Index ticket in Elasticsearch for search
      await elasticManager.indexTicket({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        userId: ticket.userId,
        assigneeId: ticket.assigneeId,
        tags: ticket.tags,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }); // TODO-LINT: move to async function

      // Log ticket creation
      await enhancedMongo.logUserActivity(
        ticket.userId,
        'ticket_created',
        { ticketId: ticket.id, title: ticket.title }
      ); // TODO-LINT: move to async function

      logger.info(`Ticket created: ${ticket.id}`);
      return ticket;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to create ticket',
        'database_manager',
        error as Error,
        { ticketData }
      ); // TODO-LINT: move to async function
      throw error;
    }
  }

  async updateTicket(ticketId: string, updateData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types, userId: string) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function

      // Update ticket in PostgreSQL
      let ticket;
      try {
        ticket = await enhancedPrisma.prisma.support_tickets.update({
          where: { id: parseInt(ticketId, 10) }, // Convert ticketId to number
          data: updateData,
          include: {
            users_support_tickets_userIdTousers: true,
            users_support_tickets_assigneeIdTousers: true
          }
        }); // TODO-LINT: move to async function
      } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
        if (error.message.includes('Unknown model')) {
          logger.warn('SupportTicket model not found, logging update only');
          await enhancedMongo.logSystem(
            'info',
            'Ticket updated (no PostgreSQL model)',
            'database_manager',
            { ticketId, updateData }
          ); // TODO-LINT: move to async function
          
          // Create mock updated ticket
          ticket = {
            id: ticketId,
            ...updateData,
            updatedAt: new Date()
          };
        } else {
          throw error;
        }
      }

      // Re-index ticket in Elasticsearch
      await elasticManager.indexTicket({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        userId: ticket.userId,
        assigneeId: ticket.assigneeId,
        tags: ticket.tags,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }); // TODO-LINT: move to async function

      // Log ticket update
      await enhancedMongo.logUserActivity(
        userId,
        'ticket_updated',
        { ticketId, changes: updateData }
      ); // TODO-LINT: move to async function

      return ticket;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to update ticket',
        'database_manager',
        error as Error,
        { ticketId, updateData }
      ); // TODO-LINT: move to async function
      throw error;
    }
  }

  // Search tickets using Elasticsearch
  async searchTickets(query: string, filters: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}, options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function

      const startTime = Date.now();
      const results = await elasticManager.searchTickets(query, filters, options); // TODO-LINT: move to async function
      const responseTime = Date.now() - startTime;

      // Log search activity
      await enhancedMongo.logSearch(
        query,
        filters.userId,
        results.hits.length,
        responseTime,
        { filters, options }
      ); // TODO-LINT: move to async function

      // Also log as API usage
      await enhancedMongo.logApiUsage(
        '/api/tickets/search',
        'GET',
        filters.userId,
        responseTime,
        { query, filters, resultsCount: results.hits.length }
      ); // TODO-LINT: move to async function

      return results;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to search tickets',
        'search',
        error as Error,
        { query, filters }
      ); // TODO-LINT: move to async function
      throw error;
    }
  }

  // Knowledge base management
  async createKbArticle(articleData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function

      // Create article in PostgreSQL
      let article;
      try {
        article = await enhancedPrisma.prisma.knowledge_base_articles.create({ 
          data: articleData
        }); // TODO-LINT: move to async function
      } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
        if (error.message.includes('Unknown model')) {
          logger.warn('KnowledgeBaseArticle model not found, creating basic article record');
          await enhancedMongo.logSystem(
            'info',
            'KB article created (no PostgreSQL model)',
            'database_manager',
            articleData
          ); // TODO-LINT: move to async function
          
          article = {
            id: `kb_${Date.now()}`,
            ...articleData,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } else {
          throw error;
        }
      }

      // Index article in Elasticsearch
      await elasticManager.indexKbArticle({
        id: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary,
        category: article.category,
        tags: article.tags,
        authorId: article.authorId,
        visibility: article.visibility,
        status: article.status,
        version: article.version,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        viewCount: article.viewCount,
        rating: article.rating
      }); // TODO-LINT: move to async function

      // Log creation
      await enhancedMongo.logUserActivity(
        article.authorId,
        'kb_article_created',
        { articleId: article.id, title: article.title }
      ); // TODO-LINT: move to async function

      return article;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to create KB article',
        'database_manager',
        error as Error,
        { articleData }
      ); // TODO-LINT: move to async function
      throw error;
    }
  }

  // Search knowledge base
  async searchKnowledgeBase(query: string, filters: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}, options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {}) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function

      const startTime = Date.now();
      const results = await elasticManager.searchKnowledgeBase(query, filters, options); // TODO-LINT: move to async function
      const responseTime = Date.now() - startTime;

      // Log search activity
      await enhancedMongo.logSearch(
        query,
        filters.userId,
        results.hits.length,
        responseTime,
        { type: 'knowledge_base', filters, options }
      ); // TODO-LINT: move to async function

      // API usage log
      await enhancedMongo.logApiUsage(
        '/api/kb/search',
        'GET',
        filters.userId,
        responseTime,
        { query, filters, resultsCount: results.hits.length }
      ); // TODO-LINT: move to async function

      return results;
    } catch (error) {
      await enhancedMongo.logError(
        'error',
        'Failed to search knowledge base',
        'search',
        error as Error,
        { query, filters }
      ); // TODO-LINT: move to async function
      throw error;
    }
  }

  // System monitoring and analytics
  async getSystemMetrics(timeRange: string = '24h') {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function

      const [
        dbHealth,
        searchAnalytics
      ] = await Promise.allSettled([
        this.getHealthStatus(),
        elasticManager.getSearchAnalytics(timeRange)
      ]); // TODO-LINT: move to async function

      return {
        health: dbHealth.status === 'fulfilled' ? dbHealth.value : null,
        search: searchAnalytics.status === 'fulfilled' ? searchAnalytics.value : null,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Error getting system metrics: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  // Log application events
  async logEvent(eventData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
    try {
      await enhancedMongo.logSystem(
        eventData.level || 'info',
        eventData.message,
        eventData.source || 'nova-universe',
        eventData.details || {}
      ); // TODO-LINT: move to async function

      // Also index important events in Elasticsearch for search
      if (eventData.level === 'error' || eventData.level === 'warn') {
        await elasticManager.indexLog(eventData); // TODO-LINT: move to async function
      }
    } catch (error) {
      logger.error('Error logging event: ' + (error instanceof Error ? error.message : String(error)));
      // Don't throw for logging errors
    }
  }

  // Data export for backup/analysis
  async exportData(options: { 
    includeUsers?: boolean;
    includeTickets?: boolean;
    includeKb?: boolean;
    includeLogs?: boolean;
    timeRange?: string;
  } = {}) {
    try {
      await this.ensureInitialized(); // TODO-LINT: move to async function

      const exportData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types = {
        exportedAt: new Date(),
        metadata: {
          version: '1.0',
          options
        }
      };

      if (options.includeUsers) {
        try {
          exportData.users = await enhancedPrisma.prisma.user.findMany({
            select: {
              id: true,
              email: true,
              createdAt: true,
              updatedAt: true
            }
          }); // TODO-LINT: move to async function
        } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
          if (error.message.includes('Unknown model')) {
            logger.warn('User model not found, skipping users export');
            exportData.users = [];
          } else {
            throw error;
          }
        }
      }

      if (options.includeTickets) {
        try {
          exportData.tickets = await enhancedPrisma.prisma.support_tickets.findMany({
            include: {
              users_support_tickets_userIdTousers: { select: { id: true, email: true } },
              users_support_tickets_assigneeIdTousers: { select: { id: true, email: true } }
            }
          }); // TODO-LINT: move to async function
        } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
          if (error.message.includes('Unknown model')) {
            logger.warn('SupportTicket model not found, skipping tickets export');
            exportData.tickets = [];
          } else {
            throw error;
          }
        }
      }

      if (options.includeKb) {
        try {
          exportData.knowledgeBase = await enhancedPrisma.prisma.knowledge_base_articles.findMany(); // TODO-LINT: move to async function
        } catch (error: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types) {
          if (error.message.includes('Unknown model')) {
            logger.warn('KnowledgeBaseArticle model not found, skipping KB export');
            exportData.knowledgeBase = [];
          } else {
            throw error;
          }
        }
      }

      // Log export activity
      await this.logEvent({
        level: 'info',
        message: 'Data export completed',
        source: 'database_manager',
        details: { options, recordCounts: Object.keys(exportData).length }
      }); // TODO-LINT: move to async function

      return exportData;
    } catch (error) {
      await this.logEvent({
        level: 'error',
        message: 'Data export failed',
        source: 'database_manager',
        error: error as Error
      }); // TODO-LINT: move to async function
      throw error;
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize(); // TODO-LINT: move to async function
    }
  }

  // Graceful shutdown
  private async gracefulShutdown() {
    logger.info('Shutting down Nova Database Manager...');

    try {
      await Promise.all([
        enhancedPrisma.disconnect(),
        enhancedMongo.close(),
        elasticManager.close()
      ]); // TODO-LINT: move to async function

      logger.info('Nova Database Manager shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during database shutdown: ' + (error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  }
}

// Export singleton instance
export const novaDb = new NovaDatabaseManager();

// Export individual database managers for direct access when needed
export { elasticManager as elasticsearch } from './elastic.js';
export { default as mongo } from './mongo.js';
export { default as postgres } from './postgres.js';

// Export convenience methods
export const {
  initialize,
  getHealthStatus,
  createUser,
  updateUser,
  createTicket,
  updateTicket,
  searchTickets,
  createKbArticle,
  searchKnowledgeBase,
  getSystemMetrics,
  logEvent,
  exportData
} = novaDb;

export default novaDb;
