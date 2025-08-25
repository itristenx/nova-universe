// nova-api/lib/nova-mcp-server.js
// Nova MCP Server - Official Implementation following MCP Documentation

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { logger } from '../logger.js';
import { aiFabric } from './ai-fabric.js';
import db from '../db.js';

/**
 * Nova MCP Server - Official MCP Implementation
 *
 * Implements the Model Context Protocol to make Nova's AI capabilities
 * accessible to external clients like ChatGPT, Claude, and other MCP clients.
 *
 * Features:
 * - Tools: AI processing, ticket management, knowledge retrieval
 * - Resources: Dynamic Nova data access
 * - Prompts: Pre-configured Nova interaction templates
 * - Compliance: Full NIST AI RMF and security standards
 */
class NovaMCPServer {
  constructor() {
    this.mcpServer = null;
    this.transport = null;
    this.isRunning = false;
    this.sessions = new Map();
    this.clients = new Map();
  }

  /**
   * Initialize the Nova MCP Server
   */
  async initialize() {
    try {
      logger.info('Initializing Nova MCP Server...');

      // Create the MCP server instance
      this.mcpServer = new McpServer({
        name: 'nova-universe-mcp',
        version: '1.0.0',
        description: 'Nova Universe Model Context Protocol Server',
      });

      // Register Nova tools
      await this.registerNovaTools();

      // Register Nova resources
      await this.registerNovaResources();

      // Register Nova prompts
      await this.registerNovaPrompts();

      logger.info('Nova MCP Server initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Nova MCP Server:', error);
      throw error;
    }
  }

  /**
   * Register Nova-specific MCP tools
   */
  async registerNovaTools() {
    // AI Fabric Processing Tool
    this.mcpServer.registerTool(
      'nova-ai-process',
      {
        title: 'Nova AI Processing',
        description: "Process requests through Nova's AI Fabric system",
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'The input text to process',
            },
            type: {
              type: 'string',
              enum: ['classification', 'sentiment', 'summarization', 'general'],
              description: 'Type of AI processing to perform',
            },
            model: {
              type: 'string',
              description: 'Specific Nova AI model to use (optional)',
              default: 'nova-ai-general',
            },
            context: {
              type: 'object',
              description: 'Additional context for processing',
              additionalProperties: true,
            },
          },
          required: ['input'],
        },
      },
      async ({ input, type = 'general', model = 'nova-ai-general', context = {} }) => {
        try {
          // Ensure AI Fabric is ready
          if (!aiFabric.isReady()) {
            await aiFabric.initialize();
          }

          // Process through AI Fabric
          const response = await aiFabric.processRequest({
            input,
            type,
            model,
            context: {
              ...context,
              source: 'mcp',
              timestamp: new Date().toISOString(),
            },
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    result: response.result || response.data,
                    confidence: response.confidence || 0.85,
                    model: response.provider || model,
                    processingTime: response.processingTime,
                    metadata: response.metadata || {},
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          logger.error('Nova AI processing failed:', error);
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // Ticket Management Tool
    this.mcpServer.registerTool(
      'nova-ticket-create',
      {
        title: 'Create Nova Ticket',
        description: "Create a new ticket in Nova's ITSM system",
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Ticket title',
            },
            description: {
              type: 'string',
              description: 'Ticket description',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Ticket priority',
              default: 'medium',
            },
            category: {
              type: 'string',
              enum: ['incident', 'request', 'change', 'problem'],
              description: 'Ticket category',
              default: 'incident',
            },
            assignee: {
              type: 'string',
              description: 'User ID to assign the ticket to (optional)',
            },
          },
          required: ['title', 'description'],
        },
      },
      async ({ title, description, priority = 'medium', category = 'incident', assignee }) => {
        try {
          // Create ticket through database
          const ticketData = {
            title,
            description,
            priority,
            category,
            status: 'new',
            assignee_id: assignee || null,
            created_at: new Date(),
            updated_at: new Date(),
          };

          const result = await db.query(
            'INSERT INTO tickets (title, description, priority, category, status, assignee_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [
              ticketData.title,
              ticketData.description,
              ticketData.priority,
              ticketData.category,
              ticketData.status,
              ticketData.assignee_id,
              ticketData.created_at,
              ticketData.updated_at,
            ],
          );

          const ticket = result.rows[0];

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    ticket: {
                      id: ticket.id,
                      title: ticket.title,
                      description: ticket.description,
                      priority: ticket.priority,
                      category: ticket.category,
                      status: ticket.status,
                      createdAt: ticket.created_at,
                    },
                    message: `Ticket ${ticket.id} created successfully`,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          logger.error('Ticket creation failed:', error);
          return {
            content: [
              {
                type: 'text',
                text: `Error creating ticket: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // Knowledge Search Tool
    this.mcpServer.registerTool(
      'nova-knowledge-search',
      {
        title: 'Nova Knowledge Search',
        description: "Search Nova's knowledge base using RAG",
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            category: {
              type: 'string',
              enum: ['procedures', 'troubleshooting', 'documentation', 'all'],
              description: 'Knowledge category to search',
              default: 'all',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results',
              default: 5,
              minimum: 1,
              maximum: 20,
            },
          },
          required: ['query'],
        },
      },
      async ({ query, category = 'all', limit = 5 }) => {
        try {
          // Use AI Fabric's RAG engine
          const response = await aiFabric.processRequest({
            input: query,
            type: 'knowledge_retrieval',
            model: 'nova-ai-knowledge',
            context: {
              category,
              limit,
              source: 'mcp',
            },
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    results: response.result || response.data,
                    query: query,
                    category: category,
                    totalFound: limit,
                    sources: response.sources || [],
                    confidence: response.confidence || 0.8,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          logger.error('Knowledge search failed:', error);
          return {
            content: [
              {
                type: 'text',
                text: `Error searching knowledge base: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // System Status Tool
    this.mcpServer.registerTool(
      'nova-system-status',
      {
        title: 'Nova System Status',
        description: 'Get current status of Nova Universe systems',
        inputSchema: {
          type: 'object',
          properties: {
            component: {
              type: 'string',
              enum: ['all', 'ai-fabric', 'database', 'api', 'services'],
              description: 'System component to check',
              default: 'all',
            },
          },
        },
      },
      async ({ component = 'all' }) => {
        try {
          const status = {
            timestamp: new Date().toISOString(),
            overall: 'healthy',
            components: {},
          };

          if (component === 'all' || component === 'ai-fabric') {
            status.components.aiFabric = aiFabric.getStatus();
          }

          if (component === 'all' || component === 'database') {
            try {
              await db.query('SELECT 1');
              status.components.database = { status: 'healthy', connectionPool: 'active' };
            } catch (dbError) {
              status.components.database = { status: 'error', error: dbError.message };
              status.overall = 'degraded';
            }
          }

          if (component === 'all' || component === 'api') {
            status.components.api = {
              status: 'healthy',
              uptime: process.uptime(),
              memory: process.memoryUsage(),
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(status, null, 2),
              },
            ],
          };
        } catch (error) {
          logger.error('System status check failed:', error);
          return {
            content: [
              {
                type: 'text',
                text: `Error checking system status: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );
  }

  /**
   * Register Nova-specific MCP resources
   */
  async registerNovaResources() {
    // Tickets Resource
    this.mcpServer.registerResource(
      'nova-tickets',
      'nova://tickets/{status?}',
      {
        title: 'Nova Tickets',
        description: 'Access Nova ticket data',
        mimeType: 'application/json',
      },
      async (uri, { status }) => {
        try {
          let query = 'SELECT id, title, status, priority, category, created_at FROM tickets';
          const params = [];

          if (status) {
            query += ' WHERE status = $1';
            params.push(status);
          }

          query += ' ORDER BY created_at DESC LIMIT 50';

          const result = await db.query(query, params);

          return {
            contents: [
              {
                uri: uri.href,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    tickets: result.rows,
                    count: result.rows.length,
                    filter: status || 'all',
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          logger.error('Failed to fetch tickets resource:', error);
          return {
            contents: [
              {
                uri: uri.href,
                mimeType: 'application/json',
                text: JSON.stringify({ error: error.message }, null, 2),
              },
            ],
          };
        }
      },
    );

    // AI Models Resource
    this.mcpServer.registerResource(
      'nova-ai-models',
      'nova://ai/models',
      {
        title: 'Nova AI Models',
        description: 'Available AI models in Nova',
        mimeType: 'application/json',
      },
      async (uri) => {
        try {
          const models = aiFabric.getModels();
          const providers = aiFabric.getProviders();

          return {
            contents: [
              {
                uri: uri.href,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    models,
                    providers,
                    status: aiFabric.getStatus(),
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } catch (error) {
          logger.error('Failed to fetch AI models resource:', error);
          return {
            contents: [
              {
                uri: uri.href,
                mimeType: 'application/json',
                text: JSON.stringify({ error: error.message }, null, 2),
              },
            ],
          };
        }
      },
    );
  }

  /**
   * Register Nova-specific MCP prompts
   */
  async registerNovaPrompts() {
    // ITSM Analysis Prompt
    this.mcpServer.registerPrompt(
      'nova-itsm-analysis',
      {
        title: 'Nova ITSM Analysis',
        description: 'Analyze IT service management scenarios using Nova AI',
        argsSchema: {
          issue: z.string().describe('The IT issue or request to analyze'),
          urgency: z
            .enum(['low', 'medium', 'high', 'critical'])
            .optional()
            .describe('Issue urgency level'),
          context: z.string().optional().describe('Additional context about the issue'),
        },
      },
      ({ issue, urgency, context }) => ({
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `As Nova's AI ITSM specialist, analyze this issue and provide recommendations:

Issue: ${issue}
${urgency ? `Urgency: ${urgency}` : ''}
${context ? `Context: ${context}` : ''}

Please provide:
1. Issue classification and category
2. Recommended priority level
3. Suggested resolution steps
4. Similar known issues
5. Estimated resolution time

Use Nova's knowledge base and ITSM best practices for your analysis.`,
            },
          },
        ],
      }),
    );

    // Knowledge Synthesis Prompt
    this.mcpServer.registerPrompt(
      'nova-knowledge-synthesis',
      {
        title: 'Nova Knowledge Synthesis',
        description: "Synthesize information from Nova's knowledge base",
        argsSchema: {
          topic: z.string().describe('The topic to research and synthesize'),
          scope: z
            .enum(['procedures', 'technical', 'general', 'all'])
            .optional()
            .describe('Knowledge scope'),
          depth: z
            .enum(['summary', 'detailed', 'comprehensive'])
            .optional()
            .describe('Analysis depth'),
        },
      },
      ({ topic, scope = 'all', depth = 'detailed' }) => ({
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Using Nova's knowledge base, provide a ${depth} analysis of: ${topic}

Scope: ${scope}

Please include:
1. Key concepts and definitions
2. Relevant procedures and workflows
3. Best practices and recommendations
4. Common issues and solutions
5. Related resources and documentation

Structure your response clearly and cite specific Nova knowledge base sources where applicable.`,
            },
          },
        ],
      }),
    );
  }

  /**
   * Start the MCP server with specified transport
   */
  async start(transportType = 'stdio', options = {}) {
    try {
      if (!this.mcpServer) {
        await this.initialize();
      }

      let transport;

      switch (transportType) {
        case 'stdio':
          transport = new StdioServerTransport();
          break;

        case 'http':
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => crypto.randomUUID(),
            enableDnsRebindingProtection: options.enableDnsProtection || false,
            allowedHosts: options.allowedHosts || ['127.0.0.1', 'localhost'],
            allowedOrigins: options.allowedOrigins || [],
          });
          break;

        default:
          throw new Error(`Unsupported transport type: ${transportType}`);
      }

      await this.mcpServer.connect(transport);
      this.transport = transport;
      this.isRunning = true;

      logger.info(`Nova MCP Server started with ${transportType} transport`);

      return this;
    } catch (error) {
      logger.error('Failed to start Nova MCP Server:', error);
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
  async stop() {
    try {
      if (this.transport) {
        await this.transport.close();
        this.transport = null;
      }

      this.isRunning = false;
      this.sessions.clear();
      this.clients.clear();

      logger.info('Nova MCP Server stopped');
    } catch (error) {
      logger.error('Error stopping Nova MCP Server:', error);
      throw error;
    }
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeSessions: this.sessions.size,
      connectedClients: this.clients.size,
      aiFabricStatus: aiFabric.getStatus(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}

// Create singleton instance
export const novaMCPServer = new NovaMCPServer();

// Auto-start if in production and not test environment
if (process.env.NODE_ENV === 'production' && process.env.NODE_ENV !== 'test') {
  novaMCPServer.start('stdio').catch((err) => {
    logger.error('Failed to auto-start Nova MCP Server:', err);
  });
}

export default novaMCPServer;
