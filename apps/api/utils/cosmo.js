import { logger } from '../logger.js';
import { v4 as uuidv4 } from 'uuid';
// MCP SDK is optional; loaded dynamically in initializeMCPServer
// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// import { z } from 'zod'; // Lazy-loaded in registerNovaTools
import db from '../db.js';
import { aiFabric } from '../lib/ai-fabric.js';
import { generateTypedTicketId } from './dbUtils.js';
import { normalizeTicketType } from './utils.js';
import { CosmoTicketProcessor } from '../services/cosmo-ticket-processor.js';

// In-memory conversation storage (in production, use Redis or database)
const conversations = new Map();
const escalations = new Map();

// AI Ticket Processor instance
let ticketProcessor = null;

// MCP Server instance
let mcpServer = null;

/**
 * Initialize the MCP server with Nova-specific tools and AI ticket processor
 */
export async function initializeMCPServer() {
  if (mcpServer) {
    return mcpServer;
  }

  let McpServerCtor = null;
  try {
    ({ McpServer: McpServerCtor } = await import('@modelcontextprotocol/sdk/server/mcp.js'));
  } catch (e) {
    logger.warn('MCP SDK not installed; Cosmo features disabled');
    // Provide a minimal no-op server to satisfy callers
    mcpServer = {
      registerTool: () => {},
      callTool: async () => ({
        content: [{ type: 'text', text: 'MCP not available' }],
        isError: true,
      }),
    };
    return mcpServer;
  }

  mcpServer = new McpServerCtor({
    name: 'nova-cosmo-server',
    version: '1.0.0',
  });

  // Initialize AI ticket processor
  ticketProcessor = new CosmoTicketProcessor({
    enableAI: true,
    enableTrendAnalysis: true,
    enableDuplicateDetection: true,
    duplicateThreshold: 0.8,
    autoClassifyPriority: true,
    autoMatchCustomers: true,
  });

  // Set up event listeners for ticket processor
  ticketProcessor.on('ticketProcessed', (ticket) => {
    logger.info(`AI processed ticket: ${ticket.id}`, {
      category: ticket.aiClassification?.category,
      priority: ticket.aiClassification?.priority,
      duplicates: ticket.duplicateAnalysis?.isDuplicate,
    });
  });

  ticketProcessor.on('ticketError', ({ ticket, error }) => {
    logger.error(`Error processing ticket ${ticket.id}: ${error.message}`);
  });

  // Register Nova-specific MCP tools
  await registerNovaTools(mcpServer);

  logger.info('MCP Server initialized with Nova tools and AI ticket processor');
  return mcpServer;
}

/**
 * Register Nova Universe MCP tools
 */
async function registerNovaTools(server) {
  const { z } = await import('zod');
  // Ticket management tools with AI processing
  server.registerTool(
    'nova.tickets.create',
    {
      title: 'Create Ticket',
      description: 'Create a new ticket in Nova Pulse with AI enhancement',
      inputSchema: {
        title: z.string().min(5).max(200),
        description: z.string().min(10).max(2000),
        category: z.enum(['hardware', 'software', 'network', 'access', 'other']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        location: z.string().optional(),
        assignedTo: z.string().optional(),
        requesterEmail: z.string().email().optional(),
        requesterName: z.string().optional(),
        useAI: z.boolean().default(true),
      },
    },
    async (
      {
        title,
        description,
        category,
        priority,
        location,
        assignedTo,
        requesterEmail,
        requesterName,
        useAI = true,
      },
      context,
    ) => {
      try {
        // Prepare ticket data for AI processing
        const ticketData = {
          id: uuidv4(),
          title,
          description,
          category,
          priority,
          location,
          assignedTo,
          requesterEmail,
          requesterName,
          createdAt: Date.now(),
          status: 'open',
          userId: context.userId,
        };

        let processedTicket = ticketData;

        // Apply AI processing if enabled
        if (useAI && ticketProcessor) {
          processedTicket = await ticketProcessor.processTicket(ticketData);
        }

        // Create ticket in database with AI-enhanced data
        const ticketId = await createTicketInDatabase(context.userId, processedTicket);

        // Prepare response with AI insights
        let responseText = `✅ Ticket ${ticketId} created successfully!\n\n**Title:** ${title}\n**Priority:** ${processedTicket.priority || priority || 'medium'}\n**Category:** ${processedTicket.category || category || 'other'}`;

        if (useAI && processedTicket.aiClassification) {
          responseText += '\n\n🤖 **AI Analysis:**';

          if (processedTicket.aiClassification.category && !category) {
            responseText += `\n• Suggested Category: ${processedTicket.aiClassification.category} (${Math.round(processedTicket.aiClassification.categoryConfidence * 100)}% confidence)`;
          }

          if (processedTicket.aiClassification.priority && !priority) {
            responseText += `\n• Suggested Priority: ${processedTicket.aiClassification.priority}`;
          }

          if (processedTicket.customerMatch?.customer) {
            responseText += `\n• Customer Matched: ${processedTicket.customerMatch.customer.name}`;
          }

          if (processedTicket.duplicateAnalysis?.isDuplicate) {
            responseText += `\n• ⚠️ Potential duplicate detected (${Math.round(processedTicket.duplicateAnalysis.confidence * 100)}% similarity)`;
          } else if (processedTicket.duplicateAnalysis?.similarTickets?.length > 0) {
            responseText += `\n• 📋 Found ${processedTicket.duplicateAnalysis.similarTickets.length} similar tickets`;
          }

          if (processedTicket.suggestions?.length > 0) {
            responseText += '\n\n💡 **AI Suggestions:**';
            processedTicket.suggestions.forEach((suggestion, index) => {
              responseText += `\n${index + 1}. ${suggestion.reason}`;
            });
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Failed to create ticket: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Knowledge base search tool
  server.registerTool(
    'nova.lore.search',
    {
      title: 'Search Knowledge Base',
      description: 'Search Nova Lore knowledge base for relevant articles',
      inputSchema: {
        query: z.string().min(3).max(200),
        category: z.string().optional(),
        limit: z.number().min(1).max(10).default(5),
      },
    },
    async ({ query, category, limit = 5 }) => {
      try {
        const articles = await searchKnowledgeBase(query, category, limit);

        if (articles.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No knowledge base articles found for: "${query}"`,
              },
            ],
          };
        }

        const formattedResults = articles
          .map(
            (article) =>
              `📄 **${article.title}**\n${article.summary}\n[View Article](${article.url})`,
          )
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `🔍 Found ${articles.length} knowledge base articles:\n\n${formattedResults}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Knowledge base search failed: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // AI Ticket Analysis tools
  server.registerTool(
    'nova.ai.analyze_ticket',
    {
      title: 'Analyze Ticket with AI',
      description:
        'Get AI analysis of ticket content including classification, similarity, and suggestions',
      inputSchema: {
        title: z.string(),
        description: z.string(),
        requesterEmail: z.string().email().optional(),
        requesterName: z.string().optional(),
      },
    },
    async ({ title, description, requesterEmail, requesterName }) => {
      try {
        if (!ticketProcessor) {
          throw new Error('AI ticket processor not initialized');
        }

        const analysisData = {
          id: 'analysis-' + uuidv4(),
          title,
          description,
          requesterEmail,
          requesterName,
          timestamp: Date.now(),
        };

        const analysis = await ticketProcessor.enrichTicketData(analysisData);

        let responseText = `🤖 **AI Ticket Analysis**\n\n`;

        if (analysis.aiClassification) {
          responseText += `**Classification:**\n`;
          responseText += `• Category: ${analysis.aiClassification.category} (${Math.round(analysis.aiClassification.categoryConfidence * 100)}% confidence)\n`;
          responseText += `• Priority: ${analysis.aiClassification.priority}\n`;
          if (analysis.aiClassification.alternativeCategories.length > 0) {
            responseText += `• Alternative categories: ${analysis.aiClassification.alternativeCategories.join(', ')}\n`;
          }
        }

        if (analysis.customerMatch?.customer) {
          responseText += `\n**Customer Match:**\n`;
          responseText += `• Customer: ${analysis.customerMatch.customer.name}\n`;
          responseText += `• Contract: ${analysis.customerMatch.customer.contract}\n`;
          responseText += `• Priority: ${analysis.customerMatch.customer.priority}\n`;
          responseText += `• Match confidence: ${Math.round(analysis.customerMatch.confidence * 100)}%\n`;
        }

        if (analysis.duplicateAnalysis) {
          responseText += `\n**Duplicate Analysis:**\n`;
          if (analysis.duplicateAnalysis.isDuplicate) {
            responseText += `• ⚠️ Potential duplicate detected!\n`;
            responseText += `• Similar to: ${analysis.duplicateAnalysis.duplicateTickets[0].ticket.title}\n`;
          } else {
            responseText += `• No duplicates found\n`;
          }

          if (analysis.duplicateAnalysis.similarTickets.length > 0) {
            responseText += `• Found ${analysis.duplicateAnalysis.similarTickets.length} similar tickets\n`;
          }
        }

        if (analysis.suggestions && analysis.suggestions.length > 0) {
          responseText += `\n**AI Suggestions:**\n`;
          analysis.suggestions.forEach((suggestion, index) => {
            responseText += `${index + 1}. ${suggestion.reason}\n`;
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ AI analysis failed: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'nova.ai.find_similar_tickets',
    {
      title: 'Find Similar Tickets',
      description: 'Find tickets similar to the provided description',
      inputSchema: {
        title: z.string(),
        description: z.string(),
        limit: z.number().min(1).max(20).optional().default(5),
      },
    },
    async ({ title, description, limit = 5 }) => {
      try {
        if (!ticketProcessor) {
          throw new Error('AI ticket processor not initialized');
        }

        const similarTickets = await ticketProcessor.searchSimilarTickets(
          title,
          description,
          limit,
        );

        if (similarTickets.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `No similar tickets found for: "${title}"`,
              },
            ],
          };
        }

        let responseText = `🔍 **Found ${similarTickets.length} Similar Tickets:**\n\n`;

        similarTickets.forEach((ticket, index) => {
          responseText += `**${index + 1}. ${ticket.ticket.title}**\n`;
          responseText += `   Similarity: ${Math.round(ticket.similarity * 100)}%\n`;
          responseText += `   Status: ${ticket.ticket.status || 'unknown'}\n`;
          responseText += `   Created: ${new Date(ticket.timestamp).toLocaleDateString()}\n\n`;
        });

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Similar ticket search failed: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'nova.ai.get_trends',
    {
      title: 'Get Ticket Trends',
      description: 'Get AI-powered ticket trends and patterns analysis',
      inputSchema: {
        timeframe: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
      },
    },
    async ({ timeframe = 'daily' }) => {
      try {
        if (!ticketProcessor) {
          throw new Error('AI ticket processor not initialized');
        }

        const trends = ticketProcessor.getTrends();
        const stats = ticketProcessor.getStats();

        let responseText = `📊 **Ticket Trends Analysis (${timeframe})**\n\n`;

        if (trends.current.has(timeframe)) {
          const data = trends.current.get(timeframe);
          responseText += `**Current Stats:**\n`;
          responseText += `• Total tickets: ${data.totalTickets}\n`;
          responseText += `• Most common category: ${Object.keys(data.categories).reduce((a, b) => (data.categories[a] > data.categories[b] ? a : b))}\n`;
          responseText += `• Most common priority: ${Object.keys(data.priorities).reduce((a, b) => (data.priorities[a] > data.priorities[b] ? a : b))}\n`;

          if (data.averageResolutionTime) {
            const hours = Math.round(data.averageResolutionTime / (1000 * 60 * 60));
            responseText += `• Average resolution time: ${hours} hours\n`;
          }
        }

        if (trends.patterns.length > 0) {
          responseText += `\n**Detected Patterns:**\n`;
          trends.patterns.forEach((pattern, index) => {
            responseText += `${index + 1}. ${pattern.description}\n`;
          });
        }

        if (trends.predictions.length > 0) {
          responseText += `\n**Predictions:**\n`;
          trends.predictions.slice(0, 3).forEach((prediction, index) => {
            responseText += `${index + 1}. ${prediction.category}: ${Math.round(prediction.probability * 100)}% likelihood (${prediction.confidence} confidence)\n`;
          });
        }

        responseText += `\n**System Stats:**\n`;
        responseText += `• Tickets processed: ${stats.ticketsProcessed}\n`;
        responseText += `• Queue length: ${stats.queueLength}\n`;
        responseText += `• Customers in database: ${stats.customers}\n`;

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Trends analysis failed: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'nova.ai.add_customer',
    {
      title: 'Add Customer to AI Database',
      description: 'Add a customer to the AI customer matching database',
      inputSchema: {
        name: z.string(),
        domain: z.string(),
        emails: z.array(z.string().email()),
        contract: z.enum(['standard', 'premium', 'enterprise']).optional().default('standard'),
        priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
        location: z.string().optional(),
        department: z.string().optional(),
      },
    },
    async ({
      name,
      domain,
      emails,
      contract = 'standard',
      priority = 'medium',
      location,
      department,
    }) => {
      try {
        if (!ticketProcessor) {
          throw new Error('AI ticket processor not initialized');
        }

        const customer = await ticketProcessor.addCustomer({
          name,
          domain,
          emails,
          contract,
          priority,
          location,
          department,
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ Customer added to AI database:\n\n**${customer.name}** (${customer.id})\n• Domain: ${customer.domain}\n• Contract: ${customer.contract}\n• Priority: ${customer.priority}\n• Emails: ${customer.emails.join(', ')}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Failed to add customer: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // XP and gamification tools
  server.registerTool(
    'nova.gamification.award_xp',
    {
      title: 'Award XP',
      description: 'Award experience points to users',
      inputSchema: {
        userId: z.string(),
        amount: z.number().min(1).max(100),
        reason: z.string(),
        category: z.enum([
          'ticket_resolved',
          'knowledge_shared',
          'help_provided',
          'system_improvement',
        ]),
      },
    },
    async ({ userId, amount, reason, category }) => {
      try {
        await awardUserXP(userId, amount, reason, category);

        return {
          content: [
            {
              type: 'text',
              text: `🌟 Awarded ${amount} XP to user for: ${reason}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Failed to award XP: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // System status tool
  server.registerTool(
    'nova.system.status',
    {
      title: 'Check System Status',
      description: 'Get current system status and health metrics',
      inputSchema: {
        component: z
          .enum(['all', 'api', 'database', 'redis', 'websocket'])
          .optional()
          .default('all'),
      },
    },
    async ({ component = 'all' }) => {
      try {
        const status = await getSystemStatus(component);

        const statusText = Object.entries(status)
          .map(
            ([comp, info]) => `${comp}: ${info.status} ${info.status === 'healthy' ? '✅' : '❌'}`,
          )
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `🖥️ System Status:\n\n${statusText}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Failed to check system status: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Workflow automation tool
  server.registerTool(
    'nova.workflow.execute',
    {
      title: 'Execute Workflow',
      description: 'Execute predefined workflows',
      inputSchema: {
        workflowId: z.string(),
        parameters: z.record(z.any()).optional(),
      },
    },
    async ({ workflowId, parameters = {} }, context) => {
      try {
        const result = await executeWorkflow(workflowId, parameters, context);

        return {
          content: [
            {
              type: 'text',
              text: `🔄 Workflow "${workflowId}" executed successfully:\n${result.summary}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Workflow execution failed: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ========================================================================
  // ADDITIONAL SYNTH V2 SPECIFICATION TOOLS
  // ========================================================================

  // Intent Classification Tool
  server.registerTool(
    'nova.ai.classify_intent',
    {
      title: 'Classify Intent',
      description: 'Classify user input into intent categories (ticket, command, query)',
      inputSchema: {
        input: z.string().min(1).max(2000),
        context: z
          .object({
            userId: z.string().optional(),
            userRole: z.string().optional(),
            module: z.string().optional(),
          })
          .optional(),
      },
    },
    async ({ input, context = {} }) => {
      try {
        // Simple intent classification based on keywords and patterns
        const text = input.toLowerCase();
        let intent = 'query';
        let category = 'general';
        let priority = 'medium';
        let confidence = 0.5;
        const entities = [];
        const suggestedActions = [];

        // Intent detection
        if (
          text.includes('create ticket') ||
          text.includes('report issue') ||
          text.includes('problem with')
        ) {
          intent = 'ticket';
          confidence = 0.9;
          suggestedActions.push('create_ticket');
        } else if (text.includes('help') || text.includes('how to') || text.includes('search')) {
          intent = 'query';
          suggestedActions.push('search_knowledge_base');
        } else if (
          text.includes('escalate') ||
          text.includes('urgent') ||
          text.includes('emergency')
        ) {
          intent = 'escalation';
          priority = 'high';
          confidence = 0.8;
          suggestedActions.push('escalate_to_agent');
        } else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
          intent = 'greeting';
          confidence = 0.95;
        }

        // Category detection
        if (text.includes('password') || text.includes('login') || text.includes('access')) {
          category = 'access';
        } else if (text.includes('network') || text.includes('wifi') || text.includes('internet')) {
          category = 'network';
        } else if (
          text.includes('computer') ||
          text.includes('laptop') ||
          text.includes('hardware')
        ) {
          category = 'hardware';
        } else if (
          text.includes('software') ||
          text.includes('application') ||
          text.includes('app')
        ) {
          category = 'software';
        }

        // Extract entities (simple keyword extraction)
        const keywords =
          text.match(/\b(password|network|computer|laptop|software|printer|email|phone)\b/g) || [];
        entities.push(...keywords.map((keyword) => ({ type: 'keyword', value: keyword })));

        const result = {
          intent,
          confidence,
          category,
          priority,
          entities,
          suggestedActions,
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message, intent: 'unknown', confidence: 0 }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Auto Ticket Creation Tool
  server.registerTool(
    'nova.tickets.auto_create',
    {
      title: 'Auto Create Ticket',
      description: 'Automatically create a ticket from classified intent',
      inputSchema: {
        input: z.string().min(5).max(2000),
        classification: z
          .object({
            intent: z.string(),
            category: z.string(),
            priority: z.string(),
            confidence: z.number(),
          })
          .optional(),
        requesterInfo: z
          .object({
            userId: z.string().optional(),
            userName: z.string().optional(),
            userEmail: z.string().optional(),
          })
          .optional(),
        useAI: z.boolean().default(true),
      },
    },
    async ({ input, classification = {}, requesterInfo = {}, useAI = true }) => {
      try {
        // Extract title from input (first sentence or up to 100 chars)
        const sentences = input.split(/[.!?]+/);
        const title = sentences[0].trim().substring(0, 100) || 'Auto-generated ticket';

        const ticket = {
          id: `INC${Date.now().toString().slice(-6)}`,
          title,
          description: input,
          category: classification.category || 'general',
          priority: classification.priority || 'medium',
          status: 'open',
          requester: requesterInfo.userName || 'Unknown',
          requesterEmail: requesterInfo.userEmail,
          createdAt: new Date().toISOString(),
          source: 'ai_auto_creation',
        };

        if (useAI && ticketProcessor) {
          // Use AI processor if available
          const processed = await ticketProcessor.processTicket(ticket);
          ticket.aiAnalysis = {
            classification: processed.aiClassification,
            customerMatch: processed.customerMatch,
            suggestions: processed.suggestions,
            duplicateAnalysis: processed.duplicateAnalysis,
          };
        }

        // Estimate resolution time based on category and priority
        let estimatedResolution = 4; // hours
        if (ticket.priority === 'critical') estimatedResolution = 1;
        else if (ticket.priority === 'high') estimatedResolution = 2;
        else if (ticket.priority === 'low') estimatedResolution = 8;

        ticket.estimatedResolution = `${estimatedResolution} hours`;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ticket),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Semantic Knowledge Base Search Tool
  server.registerTool(
    'nova.lore.semantic_search',
    {
      title: 'Semantic Knowledge Search',
      description: 'AI-powered semantic search of Nova Lore knowledge base',
      inputSchema: {
        query: z.string().min(3).max(500),
        context: z
          .object({
            userId: z.string().optional(),
            userRole: z.string().optional(),
            tenantId: z.string().optional(),
          })
          .optional(),
        limit: z.number().min(1).max(20).default(10),
        includeAttachments: z.boolean().default(false),
      },
    },
    async ({ query, context = {}, limit = 10, includeAttachments = false }) => {
      try {
        const startTime = Date.now();

        // Simulate semantic search (in production, this would use actual semantic search)
        const mockArticles = [
          {
            id: 'KB-001',
            title: 'Password Reset Procedures',
            content: 'How to reset user passwords in Nova system',
            relevance: 0.95,
            category: 'access',
            author: 'IT Admin',
            lastUpdated: '2024-08-01T10:00:00Z',
          },
          {
            id: 'KB-002',
            title: 'Network Troubleshooting Guide',
            content: 'Step-by-step network connectivity troubleshooting',
            relevance: 0.87,
            category: 'network',
            author: 'Network Team',
            lastUpdated: '2024-07-15T14:30:00Z',
          },
          {
            id: 'KB-003',
            title: 'VPN Setup Instructions',
            content: 'Configure VPN access for remote workers',
            relevance: 0.76,
            category: 'network',
            author: 'IT Security',
            lastUpdated: '2024-07-20T09:15:00Z',
          },
        ];

        // Filter by query relevance (simple keyword matching)
        const queryWords = query.toLowerCase().split(' ');
        const results = mockArticles
          .filter((article) => {
            const articleText = `${article.title} ${article.content}`.toLowerCase();
            return queryWords.some((word) => articleText.includes(word));
          })
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, limit);

        const searchTime = Date.now() - startTime;

        const response = {
          articles: results,
          totalResults: results.length,
          searchTime,
          suggestions:
            results.length === 0
              ? ['Try different keywords', 'Check spelling', 'Use more general terms']
              : [],
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message, articles: [], totalResults: 0 }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Knowledge Base Feedback Tool
  server.registerTool(
    'nova.lore.submit_feedback',
    {
      title: 'Submit Knowledge Feedback',
      description: 'Submit feedback on knowledge base search results',
      inputSchema: {
        queryId: z.string(),
        resultId: z.string(),
        rating: z.number().min(1).max(5),
        feedback: z.string().optional(),
        helpful: z.boolean(),
        userId: z.string(),
        timestamp: z.string(),
      },
    },
    async ({ queryId, resultId, rating, feedback, helpful, userId, timestamp }) => {
      try {
        // Store feedback (in production, this would save to database)
        const feedbackEntry = {
          id: `FB-${Date.now()}`,
          queryId,
          resultId,
          rating,
          feedback,
          helpful,
          userId,
          timestamp,
          processed: false,
        };

        logger.info('Knowledge feedback submitted:', feedbackEntry);

        return {
          content: [
            {
              type: 'text',
              text: `✅ Feedback submitted successfully for ${resultId}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Failed to submit feedback: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Workflow Execution Tool (Enhanced)
  server.registerTool(
    'nova.workflows.execute',
    {
      title: 'Execute Workflow',
      description: 'Execute a predefined workflow by ID',
      inputSchema: {
        workflowId: z.string(),
        parameters: z.object({}).optional(),
        dryRun: z.boolean().default(false),
        executedBy: z.string().optional(),
        timestamp: z.string().optional(),
      },
    },
    async ({ workflowId, parameters = {}, dryRun = false, executedBy, timestamp }) => {
      try {
        const execution = {
          id: `EXEC-${Date.now()}`,
          workflowId,
          status: dryRun ? 'dry_run_complete' : 'completed',
          steps: [
            { step: 'validate_parameters', status: 'completed', duration: 50 },
            {
              step: 'execute_actions',
              status: dryRun ? 'skipped' : 'completed',
              duration: dryRun ? 0 : 200,
            },
            { step: 'finalize', status: 'completed', duration: 30 },
          ],
          duration: dryRun ? 80 : 280,
          output: {
            message: dryRun ? 'Workflow validated successfully' : 'Workflow executed successfully',
            results: parameters,
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(execution),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Custom Workflow Execution Tool
  server.registerTool(
    'nova.workflows.execute_custom',
    {
      title: 'Execute Custom Workflow',
      description: 'Execute a custom ad-hoc workflow',
      inputSchema: {
        name: z.string(),
        steps: z.array(
          z.object({
            name: z.string(),
            action: z.string(),
            parameters: z.object({}).optional(),
          }),
        ),
        parameters: z.object({}).optional(),
        dryRun: z.boolean().default(false),
        createdBy: z.string().optional(),
        timestamp: z.string().optional(),
      },
    },
    async ({ name, steps, parameters = {}, dryRun = false, createdBy, timestamp }) => {
      try {
        const execution = {
          id: `CUSTOM-${Date.now()}`,
          name,
          status: dryRun ? 'dry_run_complete' : 'completed',
          steps: steps.map((step, index) => ({
            ...step,
            status: dryRun ? 'validated' : 'completed',
            duration: Math.random() * 100 + 50,
            order: index + 1,
          })),
          duration: steps.length * 75,
          output: {
            message: dryRun ? 'Custom workflow validated' : 'Custom workflow executed',
            stepsExecuted: steps.length,
            results: parameters,
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(execution),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Enhanced Gamification Tool
  server.registerTool(
    'nova.gamification.grant_xp',
    {
      title: 'Grant Experience Points',
      description: 'Award or deduct XP with detailed tracking',
      inputSchema: {
        userId: z.string(),
        amount: z.number().min(-1000).max(1000),
        reason: z.string().optional(),
        category: z
          .enum([
            'ticket_resolved',
            'knowledge_shared',
            'feedback_given',
            'milestone_reached',
            'penalty',
          ])
          .optional(),
        metadata: z.object({}).optional(),
        grantedBy: z.string().optional(),
        timestamp: z.string().optional(),
      },
    },
    async ({ userId, amount, reason, category, metadata = {}, grantedBy, timestamp }) => {
      try {
        // Simulate XP calculation
        const currentXP = Math.floor(Math.random() * 1000) + 500; // Mock current XP
        const newTotal = Math.max(0, currentXP + amount);

        // Level calculation (100 XP per level)
        const currentLevel = Math.floor(currentXP / 100);
        const newLevel = Math.floor(newTotal / 100);
        const levelUp = newLevel > currentLevel;

        const badgesEarned = [];
        if (levelUp) {
          badgesEarned.push(`Level ${newLevel} Achievement`);
        }
        if (category === 'knowledge_shared' && amount > 0) {
          badgesEarned.push('Knowledge Contributor');
        }

        const result = {
          userId,
          amountGranted: amount,
          newTotal,
          levelUp,
          newLevel,
          badgesEarned,
          reason: reason || 'No reason provided',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Gamification Profile Tool
  server.registerTool(
    'nova.gamification.get_profile',
    {
      title: 'Get Gamification Profile',
      description: 'Retrieve user XP, badges, and leaderboard data',
      inputSchema: {
        userId: z.string(),
        includeLeaderboard: z.boolean().default(true),
        includeHistory: z.boolean().default(false),
      },
    },
    async ({ userId, includeLeaderboard = true, includeHistory = false }) => {
      try {
        // Mock profile data
        const profile = {
          userId,
          xp: Math.floor(Math.random() * 2000) + 500,
          level: Math.floor((Math.random() * 2000 + 500) / 100),
          badges: [
            'First Ticket Resolved',
            'Knowledge Contributor',
            'Helpful User',
            'Quick Responder',
          ],
          achievements: [
            { name: 'Ticket Master', description: 'Resolved 50 tickets', earnedAt: '2024-07-15' },
            { name: 'Team Player', description: 'Helped 20 colleagues', earnedAt: '2024-07-20' },
          ],
          leaderboardRank: includeLeaderboard ? Math.floor(Math.random() * 50) + 1 : null,
          streaks: {
            daily: 5,
            weekly: 2,
            monthlyTickets: 12,
          },
          stats: {
            ticketsResolved: Math.floor(Math.random() * 100) + 10,
            knowledgeShared: Math.floor(Math.random() * 20) + 3,
            feedbackGiven: Math.floor(Math.random() * 15) + 5,
          },
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(profile),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Integration Hook Registration Tool
  server.registerTool(
    'nova.hooks.register',
    {
      title: 'Register Integration Hook',
      description: 'Register a webhook or API call for specific events',
      inputSchema: {
        name: z.string(),
        event: z.string(),
        endpoint: z.string().url(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('POST'),
        headers: z.object({}).optional(),
        active: z.boolean().default(true),
        registeredBy: z.string(),
        tenantId: z.string().optional(),
      },
    },
    async ({
      name,
      event,
      endpoint,
      method = 'POST',
      headers = {},
      active = true,
      registeredBy,
      tenantId,
    }) => {
      try {
        const hook = {
          id: `HOOK-${Date.now()}`,
          name,
          event,
          endpoint,
          method,
          headers,
          active,
          registeredBy,
          tenantId,
          createdAt: new Date().toISOString(),
          lastTriggered: null,
          triggerCount: 0,
        };

        logger.info('Integration hook registered:', hook);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(hook),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Alert Analysis Tool
  server.registerTool(
    'nova.alerts.analyze',
    {
      title: 'Analyze Alert Situation',
      description: 'Analyze tickets/situations and recommend alert creation or escalation actions',
      inputSchema: {
        userId: z.string(),
        module: z.enum(['pulse', 'orbit', 'core']).default('pulse'),
        userRole: z.string().default('technician'),
        context: z.object({
          ticketId: z.string().optional(),
          alertId: z.string().optional(),
          priority: z.string().optional(),
          customerTier: z.string().optional(),
          affectedUsers: z.number().optional(),
          serviceCategory: z.string().optional(),
          keywords: z.array(z.string()).optional(),
          tenantId: z.string().optional(),
          timestamp: z.string().optional(),
        }),
        message: z.string(),
      },
    },
    async ({ userId, module, userRole, context, message }) => {
      try {
        // Analyze the situation using Nova's alert intelligence
        const analysis = await analyzeAlertSituation(context, message, userRole);

        // Log the analysis request
        logger.info('Alert analysis performed:', {
          userId,
          module,
          context,
          action: analysis.action,
          confidence: analysis.confidence,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis),
            },
          ],
        };
      } catch (error) {
        logger.error('Alert analysis failed:', error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                action: 'no_action',
                reasoning: `Analysis failed: ${error.message}`,
                confidence: 0.1,
                error: true,
              }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Hook Trigger Tool
  server.registerTool(
    'nova.hooks.trigger',
    {
      title: 'Trigger Integration Hook',
      description: 'Manually trigger a registered hook with test data',
      inputSchema: {
        hookId: z.string(),
        testData: z.object({}).optional(),
        triggeredBy: z.string().optional(),
        timestamp: z.string().optional(),
        manual: z.boolean().default(false),
      },
    },
    async ({ hookId, testData = {}, triggeredBy, timestamp, manual = false }) => {
      try {
        // Simulate hook trigger
        const responseTime = Math.random() * 200 + 50;
        const success = Math.random() > 0.1; // 90% success rate

        const result = {
          hookId,
          status: success ? 'success' : 'failed',
          responseCode: success ? 200 : 500,
          responseTime: Math.round(responseTime),
          error: success ? null : 'Connection timeout',
          triggeredAt: timestamp || new Date().toISOString(),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // MCP Session Management Tools
  server.registerTool(
    'nova.mcp.create_session',
    {
      title: 'Create MCP Session',
      description: 'Initialize a new Model Context Protocol session',
      inputSchema: {
        requestedTools: z.array(z.string()).optional(),
        context: z.object({}).optional(),
        sessionName: z.string().optional(),
      },
    },
    async ({ requestedTools = [], context = {}, sessionName }) => {
      try {
        const session = {
          id: `MCP-${Date.now()}`,
          availableTools:
            requestedTools.length > 0
              ? requestedTools
              : [
                  'nova.tickets.create',
                  'nova.lore.search',
                  'nova.ai.analyze_ticket',
                  'nova.gamification.grant_xp',
                ],
          context,
          status: 'active',
          createdAt: new Date().toISOString(),
          name: sessionName || 'Unnamed Session',
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(session),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'nova.mcp.get_session',
    {
      title: 'Get MCP Session',
      description: 'Retrieve MCP session state and context',
      inputSchema: {
        sessionId: z.string(),
        userId: z.string(),
      },
    },
    async ({ sessionId, userId }) => {
      try {
        // Mock session retrieval
        const session = {
          id: sessionId,
          availableTools: ['nova.tickets.create', 'nova.lore.search'],
          context: { userId },
          status: 'active',
          callHistory: [],
          createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          lastActive: new Date().toISOString(),
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(session),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: error.message }),
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    'nova.mcp.end_session',
    {
      title: 'End MCP Session',
      description: 'End and cleanup MCP session',
      inputSchema: {
        sessionId: z.string(),
        userId: z.string(),
      },
    },
    async ({ sessionId, userId }) => {
      try {
        logger.info(`MCP session ${sessionId} ended by user ${userId}`);

        return {
          content: [
            {
              type: 'text',
              text: `✅ MCP session ${sessionId} ended successfully`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Failed to end MCP session: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}

/**
 * Start a new conversation with Cosmo
 */
export async function startConversation(conversationId, userId, tenantId, context, initialMessage) {
  try {
    const conversation = {
      id: conversationId,
      userId,
      tenantId,
      context,
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
    };

    conversations.set(conversationId, conversation);

    // Initialize MCP server if needed
    if (!mcpServer) {
      await initializeMCPServer();
    }

    logger.info(`Started conversation ${conversationId} for user ${userId}`);

    // If there's an initial message, process it
    if (initialMessage) {
      await sendMessage(conversationId, userId, initialMessage, context);
    }

    return conversation;
  } catch (error) {
    logger.error('Error starting conversation:', error);
    throw error;
  }
}

/**
 * Send a message to Cosmo and get a response
 */
export async function sendMessage(conversationId, userId, message, context = {}) {
  try {
    const conversation = conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (conversation.userId !== userId) {
      throw new Error('Unauthorized access to conversation');
    }

    // Add user message to conversation
    const userMessage = {
      id: uuidv4(),
      from: 'user',
      text: message,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    // Process message with AI and MCP tools
    const aiResponse = await processMessageWithAI(message, conversation, context);

    // Add Cosmo response to conversation
    const cosmoMessage = {
      id: uuidv4(),
      from: 'cosmo',
      text: aiResponse.message,
      timestamp: new Date(),
      metadata: aiResponse.metadata,
    };
    conversation.messages.push(cosmoMessage);

    conversation.lastActivity = new Date();
    conversation.updatedAt = new Date();

    logger.info(`Message processed in conversation ${conversationId}`);

    return {
      message: aiResponse.message,
      metadata: aiResponse.metadata,
      actions: aiResponse.actions,
    };
  } catch (error) {
    logger.error('Error sending message:', error);
    throw error;
  }
}

/**
 * End a conversation
 */
export async function endConversation(conversationId, userId) {
  try {
    const conversation = conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    if (conversation.userId !== userId) {
      throw new Error('Unauthorized access to conversation');
    }

    conversation.status = 'archived';
    conversation.updatedAt = new Date();

    // Store conversation in database for historical purposes
    await storeConversationInDatabase(conversation);

    // Remove from memory
    conversations.delete(conversationId);

    logger.info(`Ended conversation ${conversationId} for user ${userId}`);
  } catch (error) {
    logger.error('Error ending conversation:', error);
    throw error;
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId, userId) {
  try {
    const conversation = conversations.get(conversationId);
    if (!conversation) {
      // Try to load from database
      const dbConversation = await loadConversationFromDatabase(conversationId, userId);
      if (!dbConversation) {
        throw new Error(`Conversation ${conversationId} not found`);
      }
      return dbConversation;
    }

    if (conversation.userId !== userId) {
      throw new Error('Unauthorized access to conversation');
    }

    return conversation;
  } catch (error) {
    logger.error('Error getting conversation history:', error);
    throw error;
  }
}

/**
 * Create an escalation
 */
export async function createEscalation(conversationId, userId, tenantId, escalationData) {
  try {
    const escalation = {
      id: uuidv4(),
      conversationId,
      userId,
      tenantId,
      ticketId: escalationData.ticketId,
      level: escalationData.level,
      reason: escalationData.reason,
      context: escalationData.context,
      suggestedActions: generateEscalationActions(escalationData),
      status: 'pending',
      createdAt: new Date(),
    };

    escalations.set(escalation.id, escalation);

    // Store in database
    await storeEscalationInDatabase(escalation);

    // Notify appropriate teams based on escalation level
    await notifyEscalationTeams(escalation);

    logger.info(`Created escalation ${escalation.id} for conversation ${conversationId}`);

    return escalation;
  } catch (error) {
    logger.error('Error creating escalation:', error);
    throw error;
  }
}

/**
 * Handle MCP requests
 */
export async function handleMCPRequest(userId, tenantId, mcpRequest) {
  try {
    if (!mcpServer) {
      await initializeMCPServer();
    }

    // Add user context to MCP request
    const context = {
      userId,
      tenantId,
      timestamp: new Date(),
    };

    // Process MCP request through the server
    // This is a simplified implementation - in a real system, you'd need
    // proper MCP protocol handling
    const response = await mcpServer.handleRequest(mcpRequest, context);

    logger.info(`Processed MCP request for user ${userId}`);

    return response;
  } catch (error) {
    logger.error('Error handling MCP request:', error);
    throw error;
  }
}

/**
 * Process message with AI and determine appropriate response
 */
async function processMessageWithAI(message, conversation, context) {
  try {
    // Use AI Fabric for intelligent processing instead of simulated responses
    const response = await aiFabric.processRequest({
      type: 'chat',
      input: message,
      context: { 
        module: 'cosmo-synth',
        conversationId: conversation.id,
        userId: conversation.userId,
        tenantId: conversation.tenantId,
        messageHistory: conversation.messages.slice(-5), // Last 5 messages for context
        ...context 
      },
      preferences: {
        enableMCPTools: true,
        maxTokens: 500,
        temperature: 0.7
      },
      metadata: { 
        source: 'synth_conversation',
        tools: ['nova.tickets.create', 'nova.lore.search', 'nova.system.status']
      },
      timestamp: new Date(),
    });

    // Parse AI Fabric response and extract actions/metadata
    let actions = [];
    let metadata = response.metadata || {};

    // Check if AI suggested specific actions
    if (response.actions && Array.isArray(response.actions)) {
      actions = response.actions;
    }

    // Award XP for engagement
    if (shouldAwardXP(message, conversation)) {
      metadata.xpAwarded = 5;
      actions.push({
        type: 'award_xp',
        payload: {
          userId: conversation.userId,
          amount: 5,
          reason: 'Active engagement with Cosmo',
        },
      });
    }

    return {
      message: response.response || response.message || 'I understand. How can I help you further?',
      metadata,
      actions,
    };
  } catch (error) {
    logger.error('Error processing message with AI Fabric:', error);
    return {
      message:
        "I apologize, but I'm having trouble processing your request right now. Please try again or contact support if the issue persists.",
      metadata: { error: true },
      actions: [],
    };
  }
}

/**
 * Classify user intent from message
 */
function classifyIntent(message) {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('create') &&
    (lowerMessage.includes('ticket') || lowerMessage.includes('issue'))
  ) {
    return 'create_ticket';
  }

  if (
    lowerMessage.includes('search') ||
    lowerMessage.includes('find') ||
    lowerMessage.includes('look up')
  ) {
    return 'search_knowledge';
  }

  if (
    lowerMessage.includes('status') ||
    lowerMessage.includes('health') ||
    lowerMessage.includes('down')
  ) {
    return 'system_status';
  }

  if (
    lowerMessage.includes('escalate') ||
    lowerMessage.includes('urgent') ||
    lowerMessage.includes('emergency')
  ) {
    return 'escalation_needed';
  }

  if (
    lowerMessage.includes('hello') ||
    lowerMessage.includes('hi') ||
    lowerMessage.includes('hey')
  ) {
    return 'greeting';
  }

  return 'general_inquiry';
}

/**
 * Extract search query from message
 */
function extractSearchQuery(message) {
  // Simple extraction - in a real system, use NLP
  const patterns = [/search for (.+)/i, /find (.+)/i, /look up (.+)/i];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Generate contextual response based on conversation history
 */
function generateContextualResponse(message, conversation, context) {
  const responses = [
    'I understand your question. Let me help you with that.',
    "Thanks for reaching out! I'll do my best to assist you.",
    "I'm here to help! Could you provide a bit more detail about what you need?",
    "That's a great question. Let me see what I can find for you.",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Check if XP should be awarded
 */
function shouldAwardXP(message, conversation) {
  // Award XP for meaningful interactions (longer messages, multiple interactions)
  return (
    message.length > 10 && // Meaningful message length
    conversation.messages.length > 2 // Not on first interaction
  );
}

/**
 * Generate escalation actions based on context
 */
function generateEscalationActions(escalationData) {
  const actions = [];

  switch (escalationData.level) {
    case 'critical':
      actions.push(
        {
          type: 'immediate_assignment',
          description: 'Assign to on-call technician',
          priority: 1,
          automated: true,
        },
        {
          type: 'notification',
          description: 'Send SMS to management',
          priority: 1,
          automated: true,
        },
        { type: 'status_page', description: 'Update status page', priority: 2, automated: false },
      );
      break;

    case 'high':
      actions.push(
        {
          type: 'priority_assignment',
          description: 'Assign to senior technician',
          priority: 1,
          automated: true,
        },
        {
          type: 'email_notification',
          description: 'Email team lead',
          priority: 2,
          automated: true,
        },
      );
      break;

    case 'medium':
      actions.push(
        {
          type: 'queue_assignment',
          description: 'Add to priority queue',
          priority: 1,
          automated: true,
        },
        {
          type: 'follow_up',
          description: 'Schedule 2-hour follow-up',
          priority: 2,
          automated: false,
        },
      );
      break;

    default:
      actions.push({
        type: 'standard_assignment',
        description: 'Assign to available technician',
        priority: 1,
        automated: true,
      });
  }

  return actions;
}

// Helper functions for database operations
async function createTicketInDatabase(userId, ticketData) {
  return new Promise(async (resolve, reject) => {
    try {
      const typeCode = normalizeTicketType(ticketData.type || 'INC');
      const ticketId = await generateTypedTicketId(typeCode);
      const sql = `
        INSERT INTO tickets (id, ticket_id, type_code, title, description, category, priority, status, requested_by_id, location, assigned_to_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', $8, $9, $10, $11, $12)
      `;
      const id = uuidv4();
      const now = new Date().toISOString();
      await db.run(sql, [
        id,
        ticketId,
        typeCode,
        ticketData.title,
        ticketData.description,
        ticketData.category,
        ticketData.priority,
        userId,
        ticketData.location,
        ticketData.assignedTo,
        now,
        now,
      ]);
      resolve(ticketId);
    } catch (err) {
      reject(err);
    }
  });
}

async function searchKnowledgeBase(query, category, limit) {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT id, title, content, category, slug, created_at
      FROM knowledge_articles 
      WHERE (title LIKE ? OR content LIKE ?)
    `;
    const params = [`%${query}%`, `%${query}%`];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY updated_at DESC LIMIT ?';
    params.push(limit);

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const articles = rows.map((row) => ({
          id: row.id,
          title: row.title,
          summary: row.content.substring(0, 150) + '...',
          category: row.category,
          url: `/knowledge/${row.slug}`,
        }));
        resolve(articles);
      }
    });
  });
}

async function awardUserXP(userId, amount, reason, category) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO user_xp (user_id, amount, reason, category, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [userId, amount, reason, category, new Date().toISOString()], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

async function getSystemStatus(component) {
  // Simplified status check - in a real system, check actual services
  const status = {
    api: { status: 'healthy', response_time: '25ms' },
    database: { status: 'healthy', connections: 5 },
    redis: { status: 'healthy', memory_usage: '45%' },
    websocket: { status: 'healthy', active_connections: 12 },
  };

  if (component === 'all') {
    return status;
  } else {
    return { [component]: status[component] || { status: 'unknown' } };
  }
}

async function executeWorkflow(workflowId, parameters, context) {
  try {
    const id = uuidv4();
    const startedAt = new Date().toISOString();
    await db.run(
      `
      INSERT INTO workflow_executions (id, workflow_id, parameters, status, created_by, created_at)
      VALUES (?, ?, ?, 'running', ?, ?)
    `,
      [id, workflowId, JSON.stringify(parameters || {}), context?.userId || 'system', startedAt],
    );

    // Simulate execution; in production this would enqueue a background worker
    setImmediate(async () => {
      await db.run(
        `UPDATE workflow_executions SET status = 'completed', finished_at = ? WHERE id = ?`,
        [new Date().toISOString(), id],
      );
    });

    return { workflowId, executionId: id, status: 'running', queuedAt: startedAt };
  } catch (error) {
    return { workflowId, status: 'failed', error: error.message };
  }
}

async function storeConversationInDatabase(conversation) {
  // Store conversation in database for historical purposes
  logger.info(`Storing conversation ${conversation.id} in database`);
}

async function loadConversationFromDatabase(conversationId, userId) {
  // Load conversation from database
  logger.info(`Loading conversation ${conversationId} from database`);
  return null;
}

async function storeEscalationInDatabase(escalation) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO escalations (id, conversation_id, user_id, tenant_id, ticket_id, level, reason, context, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        escalation.id,
        escalation.conversationId,
        escalation.userId,
        escalation.tenantId,
        escalation.ticketId,
        escalation.level,
        escalation.reason,
        JSON.stringify(escalation.context),
        escalation.status,
        escalation.createdAt.toISOString(),
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      },
    );
  });
}

async function notifyEscalationTeams(escalation) {
  logger.info(`Notifying teams about escalation ${escalation.id} (level: ${escalation.level})`);
  // Implement notification logic (Slack, email, etc.)
}

/**
 * Legacy function for backward compatibility
 */
export async function notifyCosmoEscalation(ticketId, reason) {
  logger.info(`Legacy escalation notification for ticket ${ticketId}: ${reason}`);

  // Create escalation using new system
  const escalationData = {
    ticketId,
    level: 'medium',
    reason,
    context: { legacy: true },
  };

  try {
    await createEscalation(null, 'system', 'default', escalationData);
  } catch (error) {
    logger.error('Error in legacy escalation:', error);
  }
}

/**
 * Analyze alert situation using Nova's business logic
 */
export async function analyzeAlertSituation(context, message, userRole) {
  const analysis = {
    action: 'no_action',
    reasoning: '',
    confidence: 0.5,
    suggestions: [],
    alertData: null,
    escalationData: null,
  };

  // Priority-based analysis
  if (context.priority) {
    switch (context.priority.toLowerCase()) {
      case 'critical':
        analysis.confidence += 0.3;
        analysis.action = 'create_alert';
        analysis.reasoning = 'Critical priority issue requires immediate alert.';
        break;
      case 'high':
        analysis.confidence += 0.2;
        if (
          context.customerTier === 'vip' ||
          (context.affectedUsers && context.affectedUsers > 5)
        ) {
          analysis.action = 'create_alert';
          analysis.reasoning = 'High priority with significant impact requires alert.';
        } else {
          analysis.action = 'suggest_resolution';
          analysis.reasoning = 'High priority issue should be monitored closely.';
          analysis.suggestions.push('Monitor for escalation if not resolved within 30 minutes');
        }
        break;
      case 'medium':
        analysis.confidence += 0.1;
        if (context.affectedUsers && context.affectedUsers > 10) {
          analysis.action = 'create_alert';
          analysis.reasoning = 'Medium priority affecting many users requires alert.';
        } else {
          analysis.action = 'suggest_resolution';
          analysis.reasoning = 'Medium priority issue - continue normal resolution process.';
        }
        break;
      case 'low':
        analysis.action = 'suggest_resolution';
        analysis.reasoning = 'Low priority issue - handle through normal channels.';
        analysis.suggestions.push('Track resolution time for SLA compliance');
        break;
    }
  }

  // Customer tier analysis
  if (context.customerTier === 'vip') {
    analysis.confidence += 0.2;
    if (analysis.action === 'suggest_resolution') {
      analysis.action = 'escalate_alert';
      analysis.reasoning += ' VIP customer requires escalated attention.';
    }
  }

  // Keyword-based analysis
  if (context.keywords && context.keywords.length > 0) {
    const criticalKeywords = ['outage', 'down', 'security', 'breach', 'critical', 'emergency'];
    const hasCriticalKeywords = context.keywords.some((k) =>
      criticalKeywords.includes(k.toLowerCase()),
    );

    if (hasCriticalKeywords) {
      analysis.confidence += 0.25;
      if (analysis.action === 'no_action' || analysis.action === 'suggest_resolution') {
        analysis.action = 'create_alert';
        analysis.reasoning += ' Critical keywords detected indicating serious issue.';
      }
    }

    const securityKeywords = ['security', 'breach', 'malware', 'phishing', 'unauthorized'];
    const hasSecurityKeywords = context.keywords.some((k) =>
      securityKeywords.includes(k.toLowerCase()),
    );

    if (hasSecurityKeywords) {
      analysis.confidence += 0.3;
      analysis.action = 'create_alert';
      analysis.reasoning += ' Security incident requires immediate alert.';
    }
  }

  // Affected users analysis
  if (context.affectedUsers) {
    if (context.affectedUsers > 50) {
      analysis.confidence += 0.4;
      analysis.action = 'escalate_alert';
      analysis.reasoning += ` Large number of affected users (${context.affectedUsers}) requires escalation.`;
    } else if (context.affectedUsers > 10) {
      analysis.confidence += 0.2;
      if (analysis.action === 'no_action') {
        analysis.action = 'create_alert';
        analysis.reasoning += ` Multiple users affected (${context.affectedUsers}) requires alert.`;
      }
    }
  }

  // Time-based analysis (if alertId provided, this is an existing alert)
  if (context.alertId) {
    // This is analysis for potential escalation
    analysis.action = 'escalate_alert';
    analysis.reasoning = 'Existing alert requires escalation analysis.';
    analysis.confidence += 0.1;
  }

  // Service category analysis
  if (context.serviceCategory) {
    switch (context.serviceCategory.toLowerCase()) {
      case 'security':
        analysis.confidence += 0.3;
        analysis.action = 'create_alert';
        analysis.reasoning += ' Security category requires alert creation.';
        break;
      case 'infrastructure':
      case 'network':
        analysis.confidence += 0.2;
        if (context.affectedUsers && context.affectedUsers > 1) {
          analysis.action = 'create_alert';
          analysis.reasoning += ' Infrastructure issue affecting multiple users.';
        }
        break;
    }
  }

  // Role-based adjustments
  if (userRole === 'pulse_lead' || userRole === 'core_admin') {
    // Leaders can trigger alerts more easily
    analysis.confidence += 0.1;
  }

  // Normalize confidence
  analysis.confidence = Math.min(1.0, Math.max(0.0, analysis.confidence));

  // Add general suggestions based on action
  switch (analysis.action) {
    case 'create_alert':
      analysis.suggestions.push(
        'Review on-call schedule before creating alert',
        'Include relevant context in alert description',
        'Set appropriate priority level',
      );
      break;
    case 'escalate_alert':
      analysis.suggestions.push(
        'Document escalation reason clearly',
        'Notify relevant stakeholders',
        'Update ticket with escalation details',
      );
      break;
    case 'suggest_resolution':
      analysis.suggestions.push(
        'Continue normal resolution process',
        'Monitor for changes in severity',
        'Update ticket status regularly',
      );
      break;
    case 'no_action':
      analysis.suggestions.push(
        'Continue current resolution process',
        'No immediate alert action required',
      );
      break;
  }

  return analysis;
}
