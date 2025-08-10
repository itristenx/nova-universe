/**
 * Nova MCP Server - Hosted Model Context Protocol Server
 * 
 * Implements MCP specification for ChatGPT integration following OpenAI standards.
 * This server hosts Nova's AI capabilities and makes them available to external
 * clients including ChatGPT instances.
 * 
 * Features:
 * - OpenAI-compatible API endpoints
 * - MCP protocol compliance
 * - Secure authentication and authorization
 * - Rate limiting and quota management
 * - Comprehensive audit logging
 * - Tool discovery and registration
 * - Session management
 */

import express, { Request, Response, NextFunction } from 'express';
import { createServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger.js';
import { aiFabric } from './ai-fabric.js';

// MCP Protocol Types (following OpenAI standards)
export interface MCPCapability {
  name: string;
  version: string;
  description: string;
  experimental?: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  experimental?: boolean;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPServerInfo {
  name: string;
  version: string;
  capabilities: MCPCapability[];
  tools?: MCPTool[];
  resources?: MCPResource[];
}

export interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number | null;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface MCPSession {
  id: string;
  clientId: string;
  userId?: string;
  tenantId?: string;
  capabilities: string[];
  websocket?: WebSocket;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface MCPClient {
  id: string;
  name: string;
  apiKey: string;
  allowedTools: string[];
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  metadata: Record<string, any>;
}

/**
 * Nova MCP Server Implementation
 */
export class NovaMCPServer {
  private app: express.Application;
  private server: Server;
  private wsServer: WebSocketServer;
  private port: number;
  private isRunning = false;
  
  // Session and client management
  private sessions: Map<string, MCPSession> = new Map();
  private clients: Map<string, MCPClient> = new Map();
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  
  // Rate limiting
  private rateLimiters = new Map<string, any>();
  
  constructor(port: number = 3001) {
    this.port = port;
    this.app = express();
    this.server = createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.registerDefaultTools();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS for OpenAI compatibility
    this.app.use(cors({
      origin: [
        'https://chatgpt.com',
        'https://chat.openai.com',
        'https://platform.openai.com',
        /^https:\/\/.*\.openai\.com$/,
        /^https:\/\/.*\.nova-universe\.com$/,
        'http://localhost:3000',
        'http://localhost:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID', 'X-Session-ID']
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Global rate limiting
    const globalRateLimit = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(globalRateLimit);

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const requestId = uuidv4();
      req.headers['x-request-id'] = requestId;
      
      logger.info('MCP Request', {
        requestId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      next();
    });
  }

  /**
   * Setup REST API routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
      });
    });

    // MCP Server Information (OpenAI Discovery)
    this.app.get('/.well-known/mcp-server', (req: Request, res: Response) => {
      const serverInfo: MCPServerInfo = {
        name: 'Nova MCP Server',
        version: '1.0.0',
        capabilities: [
          {
            name: 'tools',
            version: '1.0.0',
            description: 'Tool execution capabilities'
          },
          {
            name: 'resources',
            version: '1.0.0',
            description: 'Resource access capabilities'
          },
          {
            name: 'session',
            version: '1.0.0',
            description: 'Session management capabilities'
          }
        ],
        tools: Array.from(this.tools.values()),
        resources: Array.from(this.resources.values())
      };

      res.json(serverInfo);
    });

    // Client registration (for API key generation)
    this.app.post('/api/v1/clients/register', this.authenticateAdmin.bind(this), (req: Request, res: Response) => {
      this.handleClientRegistration(req, res);
    });

    // MCP JSON-RPC endpoint (OpenAI compatible)
    this.app.post('/mcp', this.authenticateClient.bind(this), this.applyRateLimit.bind(this), (req: Request, res: Response) => {
      this.handleMCPRequest(req, res);
    });

    // Tool execution endpoint
    this.app.post('/api/v1/tools/:toolName/execute', this.authenticateClient.bind(this), this.applyRateLimit.bind(this), (req: Request, res: Response) => {
      this.handleToolExecution(req, res);
    });

    // Session management endpoints
    this.app.post('/api/v1/sessions', this.authenticateClient.bind(this), (req: Request, res: Response) => {
      this.handleSessionCreation(req, res);
    });

    this.app.get('/api/v1/sessions/:sessionId', this.authenticateClient.bind(this), (req: Request, res: Response) => {
      this.handleSessionRetrieval(req, res);
    });

    this.app.delete('/api/v1/sessions/:sessionId', this.authenticateClient.bind(this), (req: Request, res: Response) => {
      this.handleSessionDeletion(req, res);
    });

    // Tools and resources discovery
    this.app.get('/api/v1/tools', this.authenticateClient.bind(this), (req: Request, res: Response) => {
      const client = (req as any).client as MCPClient;
      const allowedTools = Array.from(this.tools.values()).filter(tool => 
        client.allowedTools.includes('*') || client.allowedTools.includes(tool.name)
      );
      
      res.json({ tools: allowedTools });
    });

    this.app.get('/api/v1/resources', this.authenticateClient.bind(this), (req: Request, res: Response) => {
      res.json({ resources: Array.from(this.resources.values()) });
    });

    // Error handling middleware
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('MCP Server Error:', error);
      
      res.status(500).json({
        error: {
          code: -32603,
          message: 'Internal error',
          data: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    });
  }

  /**
   * Setup WebSocket server for real-time MCP communication
   */
  private setupWebSocket(): void {
    this.wsServer = new WebSocketServer({ 
      server: this.server,
      path: '/mcp/ws'
    });

    this.wsServer.on('connection', (ws: WebSocket, req: any) => {
      this.handleWebSocketConnection(ws, req);
    });
  }

  /**
   * Register default Nova tools
   */
  private registerDefaultTools(): void {
    const defaultTools: MCPTool[] = [
      {
        name: 'nova.tickets.create',
        description: 'Create a new ticket in Nova system',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Ticket title' },
            description: { type: 'string', description: 'Ticket description' },
            category: { type: 'string', enum: ['hardware', 'software', 'network', 'access', 'other'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            userId: { type: 'string', description: 'User ID creating the ticket' }
          },
          required: ['title', 'description']
        }
      },
      {
        name: 'nova.knowledge.search',
        description: 'Search Nova knowledge base',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            category: { type: 'string', description: 'Knowledge category filter' },
            limit: { type: 'number', description: 'Maximum results to return', default: 5 }
          },
          required: ['query']
        }
      },
      {
        name: 'nova.ai.classify',
        description: 'Classify text using Nova AI',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string', description: 'Text to classify' },
            categories: { type: 'array', items: { type: 'string' }, description: 'Possible categories' }
          },
          required: ['text']
        }
      },
      {
        name: 'nova.system.status',
        description: 'Get Nova system status',
        inputSchema: {
          type: 'object',
          properties: {
            component: { type: 'string', description: 'Specific component to check' }
          }
        }
      }
    ];

    defaultTools.forEach(tool => {
      this.tools.set(tool.name, tool);
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Initialize AI Fabric if not already done
        if (!aiFabric.getStatus().isInitialized) {
          aiFabric.initialize().catch(error => {
            logger.error('Failed to initialize AI Fabric:', error);
          });
        }

        this.server.listen(this.port, () => {
          this.isRunning = true;
          logger.info(`Nova MCP Server started on port ${this.port}`);
          logger.info(`WebSocket endpoint: ws://localhost:${this.port}/mcp/ws`);
          logger.info(`Discovery endpoint: http://localhost:${this.port}/.well-known/mcp-server`);
          resolve();
        });

        this.server.on('error', (error) => {
          logger.error('MCP Server error:', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isRunning) {
        resolve();
        return;
      }

      // Close all WebSocket connections
      this.wsServer.clients.forEach(ws => ws.close());
      this.wsServer.close();

      // Close HTTP server
      this.server.close(() => {
        this.isRunning = false;
        logger.info('Nova MCP Server stopped');
        resolve();
      });
    });
  }

  // Authentication middleware
  private async authenticateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const apiKey = req.headers['x-api-key'] as string;
      
      let clientId: string | null = null;

      if (authHeader?.startsWith('Bearer ')) {
        // JWT authentication
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nova-mcp-secret') as any;
        clientId = decoded.clientId;
      } else if (apiKey) {
        // API Key authentication
        const client = Array.from(this.clients.values()).find(c => c.apiKey === apiKey);
        if (client && client.isActive) {
          clientId = client.id;
        }
      }

      if (!clientId) {
        res.status(401).json({
          error: {
            code: -32000,
            message: 'Authentication required'
          }
        });
        return;
      }

      const client = this.clients.get(clientId);
      if (!client || !client.isActive) {
        res.status(401).json({
          error: {
            code: -32000,
            message: 'Invalid or inactive client'
          }
        });
        return;
      }

      (req as any).client = client;
      next();
    } catch (error) {
      logger.error('Authentication error:', error);
      res.status(401).json({
        error: {
          code: -32000,
          message: 'Authentication failed'
        }
      });
    }
  }

  private async authenticateAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Admin authentication logic
    const adminToken = req.headers.authorization?.substring(7);
    
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  }

  private applyRateLimit(req: Request, res: Response, next: NextFunction): void {
    const client = (req as any).client as MCPClient;
    const clientId = client.id;

    if (!this.rateLimiters.has(clientId)) {
      this.rateLimiters.set(clientId, rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: client.rateLimits.requestsPerMinute,
        message: 'Rate limit exceeded',
        keyGenerator: () => clientId,
        standardHeaders: true,
        legacyHeaders: false,
      }));
    }

    const limiter = this.rateLimiters.get(clientId);
    limiter(req, res, next);
  }

  // Request handlers
  private async handleMCPRequest(req: Request, res: Response): Promise<void> {
    const message: MCPMessage = req.body;
    const client = (req as any).client as MCPClient;

    try {
      let response: MCPMessage;

      switch (message.method) {
        case 'initialize':
          response = await this.handleInitialize(message, client);
          break;
        case 'tools/list':
          response = await this.handleToolsList(message, client);
          break;
        case 'tools/call':
          response = await this.handleToolCall(message, client);
          break;
        case 'resources/list':
          response = await this.handleResourcesList(message, client);
          break;
        case 'resources/read':
          response = await this.handleResourceRead(message, client);
          break;
        default:
          response = {
            jsonrpc: '2.0',
            id: message.id,
            error: {
              code: -32601,
              message: 'Method not found'
            }
          };
      }

      res.json(response);
    } catch (error) {
      logger.error('MCP request error:', error);
      res.json({
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }

  private async handleInitialize(message: MCPMessage, client: MCPClient): Promise<MCPMessage> {
    const serverInfo = {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: { listChanged: true },
        resources: { subscribe: false, listChanged: true }
      },
      serverInfo: {
        name: 'Nova MCP Server',
        version: '1.0.0'
      }
    };

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: serverInfo
    };
  }

  private async handleToolsList(message: MCPMessage, client: MCPClient): Promise<MCPMessage> {
    const allowedTools = Array.from(this.tools.values()).filter(tool => 
      client.allowedTools.includes('*') || client.allowedTools.includes(tool.name)
    );

    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        tools: allowedTools
      }
    };
  }

  private async handleToolCall(message: MCPMessage, client: MCPClient): Promise<MCPMessage> {
    const { name, arguments: args } = message.params;

    if (!client.allowedTools.includes('*') && !client.allowedTools.includes(name)) {
      return {
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32000,
          message: 'Tool not allowed for this client'
        }
      };
    }

    try {
      // Route to AI Fabric for execution
      const aiRequest = {
        id: uuidv4(),
        type: this.mapToolToRequestType(name),
        input: args,
        context: {
          userId: args.userId,
          tenantId: client.metadata.tenantId,
          module: 'mcp-server',
          sessionId: args.sessionId
        },
        preferences: {},
        metadata: {
          tool: name,
          client: client.id
        },
        timestamp: new Date()
      };

      const aiResponse = await aiFabric.processRequest(aiRequest);

      return {
        jsonrpc: '2.0',
        id: message.id,
        result: {
          content: [{
            type: 'text',
            text: typeof aiResponse.result === 'string' ? aiResponse.result : JSON.stringify(aiResponse.result)
          }],
          isError: false
        }
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: message.id,
        result: {
          content: [{
            type: 'text',
            text: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        }
      };
    }
  }

  private async handleResourcesList(message: MCPMessage, client: MCPClient): Promise<MCPMessage> {
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        resources: Array.from(this.resources.values())
      }
    };
  }

  private async handleResourceRead(message: MCPMessage, client: MCPClient): Promise<MCPMessage> {
    const { uri } = message.params;
    
    // Resource reading logic would go here
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {
        contents: [{
          uri,
          mimeType: 'text/plain',
          text: 'Resource content placeholder'
        }]
      }
    };
  }

  private async handleClientRegistration(req: Request, res: Response): Promise<void> {
    const { name, allowedTools, rateLimits, permissions } = req.body;

    const client: MCPClient = {
      id: uuidv4(),
      name,
      apiKey: this.generateApiKey(),
      allowedTools: allowedTools || ['*'],
      rateLimits: rateLimits || {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000
      },
      permissions: permissions || [],
      isActive: true,
      createdAt: new Date(),
      metadata: req.body.metadata || {}
    };

    this.clients.set(client.id, client);

    res.json({
      clientId: client.id,
      apiKey: client.apiKey,
      allowedTools: client.allowedTools,
      rateLimits: client.rateLimits
    });
  }

  private async handleToolExecution(req: Request, res: Response): Promise<void> {
    const { toolName } = req.params;
    const client = (req as any).client as MCPClient;

    if (!client.allowedTools.includes('*') && !client.allowedTools.includes(toolName)) {
      res.status(403).json({ error: 'Tool not allowed for this client' });
      return;
    }

    try {
      const result = await this.executeNovaTool(toolName, req.body, client);
      res.json({ result });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  private async handleSessionCreation(req: Request, res: Response): Promise<void> {
    const client = (req as any).client as MCPClient;
    const { capabilities, metadata } = req.body;

    const session: MCPSession = {
      id: uuidv4(),
      clientId: client.id,
      userId: req.body.userId,
      tenantId: req.body.tenantId || client.metadata.tenantId,
      capabilities: capabilities || [],
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      metadata: metadata || {}
    };

    this.sessions.set(session.id, session);

    res.json({
      sessionId: session.id,
      capabilities: session.capabilities,
      createdAt: session.createdAt
    });
  }

  private async handleSessionRetrieval(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const client = (req as any).client as MCPClient;
    
    const session = this.sessions.get(sessionId);
    if (!session || session.clientId !== client.id) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({
      sessionId: session.id,
      capabilities: session.capabilities,
      isActive: session.isActive,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    });
  }

  private async handleSessionDeletion(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const client = (req as any).client as MCPClient;
    
    const session = this.sessions.get(sessionId);
    if (!session || session.clientId !== client.id) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    session.isActive = false;
    this.sessions.delete(sessionId);

    res.json({ message: 'Session deleted successfully' });
  }

  private async handleWebSocketConnection(ws: WebSocket, req: any): Promise<void> {
    logger.info('WebSocket connection established');

    ws.on('message', async (data: string) => {
      try {
        const message: MCPMessage = JSON.parse(data);
        // Handle WebSocket MCP messages
        const response = await this.processMCPWebSocketMessage(message, ws);
        ws.send(JSON.stringify(response));
      } catch (error) {
        logger.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32700,
            message: 'Parse error'
          }
        }));
      }
    });

    ws.on('close', () => {
      logger.info('WebSocket connection closed');
    });
  }

  // Helper methods
  private mapToolToRequestType(toolName: string): string {
    const mapping: Record<string, string> = {
      'nova.tickets.create': 'custom',
      'nova.knowledge.search': 'rag_query',
      'nova.ai.classify': 'classification',
      'nova.system.status': 'custom'
    };

    return mapping[toolName] || 'custom';
  }

  private async executeNovaTool(toolName: string, args: any, client: MCPClient): Promise<any> {
    // This would integrate with the existing Nova tools
    // For now, return a placeholder response
    return {
      tool: toolName,
      result: 'Tool execution result placeholder',
      timestamp: new Date().toISOString()
    };
  }

  private async processMCPWebSocketMessage(message: MCPMessage, ws: WebSocket): Promise<MCPMessage> {
    // WebSocket-specific MCP message processing
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: { status: 'acknowledged' }
    };
  }

  private generateApiKey(): string {
    return `nova_${uuidv4().replace(/-/g, '')}`;
  }

  // Public getters
  get isServerRunning(): boolean {
    return this.isRunning;
  }

  get serverPort(): number {
    return this.port;
  }

  getServerInfo(): MCPServerInfo {
    return {
      name: 'Nova MCP Server',
      version: '1.0.0',
      capabilities: [
        {
          name: 'tools',
          version: '1.0.0',
          description: 'Tool execution capabilities'
        }
      ],
      tools: Array.from(this.tools.values()),
      resources: Array.from(this.resources.values())
    };
  }
}

// Export singleton instance
export const novaMCPServer = new NovaMCPServer(
  parseInt(process.env.MCP_SERVER_PORT || '3001')
);