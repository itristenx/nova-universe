// nova-api/routes/mcp-server.js
// MCP Server API Routes with OAuth 2.1 Compliance

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateJWT } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../logger.js';

const router = Router();

// Import MCP server instance - handle potential import errors gracefully
let novaMCPServer;
try {
  const mcpModule = await import('../lib/nova-mcp-server.js');
  novaMCPServer = mcpModule.novaMCPServer || mcpModule.default;
} catch (error) {
  logger.warn('Nova MCP Server not available:', error.message);
  novaMCPServer = {
    isRunning: false,
    getServerInfo: () => ({ status: 'not_available', tools: [], resources: [], prompts: [] }),
    getCapabilities: () => ({ tools: {}, resources: {}, prompts: {} }),
    getStatus: () => ({ status: 'not_available', uptime: 0, connections: 0 }),
    start: async () => {
      throw new Error('MCP Server not available');
    },
    stop: async () => {
      throw new Error('MCP Server not available');
    },
    listTools: () => [],
    callTool: async () => {
      throw new Error('MCP Server not available');
    },
  };
}

// OAuth 2.1 endpoints for OpenAI MCP compliance

/**
 * @swagger
 * /api/v2/mcp/.well-known/oauth-authorization-server:
 *   get:
 *     tags: [MCP OAuth]
 *     summary: OAuth 2.1 Authorization Server Metadata
 *     description: Returns OAuth 2.1 authorization server metadata for MCP
 *     responses:
 *       200:
 *         description: Authorization server metadata retrieved successfully
 */
router.get('/.well-known/oauth-authorization-server', async (req, res) => {
  try {
    const metadata = novaMCPServer.getAuthorizationServerMetadata();
    res.json(metadata);
  } catch (error) {
    logger.error('Failed to get authorization server metadata:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/v2/mcp/oauth/register:
 *   post:
 *     tags: [MCP OAuth]
 *     summary: Dynamic Client Registration
 *     description: Register OAuth 2.1 client for MCP access
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_name:
 *                 type: string
 *               redirect_uris:
 *                 type: array
 *                 items:
 *                   type: string
 *               scope:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client registered successfully
 */
router.post(
  '/oauth/register',
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }), // 10 registrations per minute
  async (req, res) => {
    try {
      const clientInfo = req.body;
      const client = await novaMCPServer.registerClient(clientInfo);
      res.status(201).json(client);
    } catch (error) {
      logger.error('Failed to register OAuth client:', error);
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * @swagger
 * /api/v2/mcp/oauth/authorize:
 *   get:
 *     tags: [MCP OAuth]
 *     summary: OAuth 2.1 Authorization Endpoint
 *     description: Authorize access with PKCE support
 *     parameters:
 *       - name: client_id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: redirect_uri
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: code_challenge
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *       - name: code_challenge_method
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [S256]
 *     responses:
 *       302:
 *         description: Redirect to client with authorization code
 */
router.get(
  '/oauth/authorize',
  createRateLimiter({ windowMs: 60 * 1000, max: 30 }), // 30 requests per minute
  async (req, res) => {
    try {
      const result = await novaMCPServer.authorize(req.query);

      // Redirect back to client with authorization code
      const redirectUrl = new URL(req.query.redirect_uri);
      redirectUrl.searchParams.set('code', result.code);
      if (result.state) {
        redirectUrl.searchParams.set('state', result.state);
      }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('Authorization failed:', error);

      // Redirect with error
      const redirectUrl = new URL(req.query.redirect_uri);
      redirectUrl.searchParams.set('error', error.message);
      if (req.query.state) {
        redirectUrl.searchParams.set('state', req.query.state);
      }

      res.redirect(redirectUrl.toString());
    }
  },
);

/**
 * @swagger
 * /api/v2/mcp/oauth/token:
 *   post:
 *     tags: [MCP OAuth]
 *     summary: OAuth 2.1 Token Endpoint
 *     description: Exchange authorization code for access token with PKCE verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               grant_type:
 *                 type: string
 *                 enum: [authorization_code, refresh_token]
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *               code:
 *                 type: string
 *               code_verifier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token issued successfully
 */
router.post(
  '/oauth/token',
  createRateLimiter({ windowMs: 60 * 1000, max: 60 }), // 60 requests per minute
  async (req, res) => {
    try {
      const tokenResponse = await novaMCPServer.exchangeToken(req.body);
      res.json(tokenResponse);
    } catch (error) {
      logger.error('Token exchange failed:', error);
      res.status(400).json({
        error: error.message.includes('invalid_') ? error.message : 'invalid_request',
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/mcp/oauth/revoke:
 *   post:
 *     tags: [MCP OAuth]
 *     summary: OAuth 2.1 Token Revocation
 *     description: Revoke access or refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token revoked successfully
 */
router.post(
  '/oauth/revoke',
  createRateLimiter({ windowMs: 60 * 1000, max: 30 }), // 30 requests per minute
  async (req, res) => {
    try {
      await novaMCPServer.revokeToken(req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Token revocation failed:', error);
      res.status(400).json({ error: error.message });
    }
  },
);

// OAuth 2.1 middleware for protected MCP endpoints
const authenticateOAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    const token = authHeader.substring(7);
    const tokenData = novaMCPServer.validateAccessToken(token);

    if (!tokenData) {
      return res.status(401).json({ error: 'invalid_token' });
    }

    req.oauth = tokenData;
    next();
  } catch (error) {
    logger.error('OAuth authentication failed:', error);
    res.status(401).json({ error: 'invalid_token' });
  }
};

/**
 * @swagger
 * /api/v2/mcp/status:
 *   get:
 *     tags: [MCP Server]
 *     summary: Get MCP Server status
 *     description: Returns comprehensive status of the MCP server
 *     security:
 *       - bearerAuth: []
 *       - oauth2: [mcp:read]
 *     responses:
 *       200:
 *         description: MCP Server status retrieved successfully
 */
router.get(
  '/status',
  authenticateJWT,
  createRateLimiter({ windowMs: 60 * 1000, max: 60 }), // 60 requests per minute
  async (req, res) => {
    try {
      const status = {
        isRunning: novaMCPServer.isRunning || false,
        serverInfo: novaMCPServer.getServerInfo ? novaMCPServer.getServerInfo() : {},
        capabilities: novaMCPServer.getCapabilities ? novaMCPServer.getCapabilities() : {},
        status: novaMCPServer.getStatus ? novaMCPServer.getStatus() : { status: 'unknown' },
        timestamp: new Date().toISOString(),
      };

      res.json({
        success: true,
        ...status,
      });
    } catch (error) {
      logger.error('Failed to get MCP Server status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get MCP Server status',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/mcp/servers:
 *   get:
 *     tags: [MCP Server]
 *     summary: List MCP servers
 *     description: Returns list of available MCP servers
 */
router.get(
  '/servers',
  authenticateJWT,
  createRateLimiter({ windowMs: 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      // For now, we only have the Nova MCP server
      const servers = [
        {
          id: 'nova-mcp-server',
          name: 'Nova MCP Server',
          status: novaMCPServer.isRunning ? 'running' : 'stopped',
          type: 'internal',
          version: '1.0.0',
          capabilities: novaMCPServer.getCapabilities ? novaMCPServer.getCapabilities() : {},
          uptime: novaMCPServer.getStatus ? novaMCPServer.getStatus().uptime : 0,
          connections: novaMCPServer.getStatus ? novaMCPServer.getStatus().connections : 0,
          lastHealthCheck: new Date().toISOString(),
          healthStatus: novaMCPServer.isRunning ? 'healthy' : 'stopped',
        },
      ];

      res.json({
        success: true,
        servers,
        totalServers: servers.length,
        runningServers: servers.filter((s) => s.status === 'running').length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to list MCP servers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list MCP servers',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/mcp/servers/{serverId}/control:
 *   post:
 *     tags: [MCP Server]
 *     summary: Control MCP server
 *     description: Start, stop, or restart an MCP server
 */
router.post(
  '/servers/:serverId/control',
  authenticateJWT,
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }), // 10 requests per minute
  [
    body('action')
      .isIn(['start', 'stop', 'restart'])
      .withMessage('Action must be start, stop, or restart'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { serverId } = req.params;
      const { action } = req.body;

      if (serverId !== 'nova-mcp-server') {
        return res.status(404).json({
          success: false,
          error: 'Server not found',
        });
      }

      logger.info(`MCP Server ${action} requested for ${serverId} by user ${req.user.id}`);

      let result;
      try {
        switch (action) {
          case 'start':
            if (novaMCPServer.start) {
              await novaMCPServer.start();
              result = { message: 'Server started successfully' };
            } else {
              throw new Error('Start method not available');
            }
            break;
          case 'stop':
            if (novaMCPServer.stop) {
              await novaMCPServer.stop();
              result = { message: 'Server stopped successfully' };
            } else {
              throw new Error('Stop method not available');
            }
            break;
          case 'restart':
            if (novaMCPServer.stop && novaMCPServer.start) {
              await novaMCPServer.stop();
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
              await novaMCPServer.start();
              result = { message: 'Server restarted successfully' };
            } else {
              throw new Error('Restart methods not available');
            }
            break;
        }
      } catch (serverError) {
        logger.error(`MCP Server ${action} failed:`, serverError);
        return res.status(500).json({
          success: false,
          error: `Failed to ${action} server`,
          details: serverError.message,
        });
      }

      res.json({
        success: true,
        serverId,
        action,
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`MCP Server control failed:`, error);
      res.status(500).json({
        success: false,
        error: 'Server control failed',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/mcp/tools:
 *   get:
 *     tags: [MCP Server]
 *     summary: List available MCP tools
 *     description: Returns list of available MCP tools
 */
router.get(
  '/tools',
  authenticateJWT,
  createRateLimiter({ windowMs: 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      let tools = [];

      if (novaMCPServer.listTools) {
        tools = novaMCPServer.listTools();
      } else if (novaMCPServer.getServerInfo) {
        const serverInfo = novaMCPServer.getServerInfo();
        tools = serverInfo.tools || [];
      }

      res.json({
        success: true,
        tools,
        totalTools: tools.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to list MCP tools:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list MCP tools',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/mcp/tools/{toolName}/call:
 *   post:
 *     tags: [MCP Server]
 *     summary: Call MCP tool
 *     description: Execute an MCP tool with provided arguments
 */
router.post(
  '/tools/:toolName/call',
  authenticateJWT,
  createRateLimiter({ windowMs: 60 * 1000, max: 50 }), // 50 requests per minute
  [body('arguments').optional().isObject().withMessage('Arguments must be an object')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { toolName } = req.params;
      const { arguments: toolArgs = {} } = req.body;

      if (!novaMCPServer.callTool) {
        return res.status(503).json({
          success: false,
          error: 'MCP tool execution not available',
        });
      }

      logger.info(`MCP Tool ${toolName} called by user ${req.user.id}`);

      const result = await novaMCPServer.callTool(toolName, toolArgs);

      res.json({
        success: true,
        toolName,
        result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`MCP Tool ${req.params.toolName} execution failed:`, error);
      res.status(500).json({
        success: false,
        error: 'Tool execution failed',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/mcp/resources:
 *   get:
 *     tags: [MCP Server]
 *     summary: List MCP resources
 *     description: Returns list of available MCP resources
 */
router.get(
  '/resources',
  authenticateJWT,
  createRateLimiter({ windowMs: 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      let resources = [];

      if (novaMCPServer.getServerInfo) {
        const serverInfo = novaMCPServer.getServerInfo();
        resources = serverInfo.resources || [];
      }

      res.json({
        success: true,
        resources,
        totalResources: resources.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to list MCP resources:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list MCP resources',
        details: error.message,
      });
    }
  },
);

/**
 * @swagger
 * /api/v2/mcp/prompts:
 *   get:
 *     tags: [MCP Server]
 *     summary: List MCP prompts
 *     description: Returns list of available MCP prompts
 */
router.get(
  '/prompts',
  authenticateJWT,
  createRateLimiter({ windowMs: 60 * 1000, max: 30 }),
  async (req, res) => {
    try {
      let prompts = [];

      if (novaMCPServer.getServerInfo) {
        const serverInfo = novaMCPServer.getServerInfo();
        prompts = serverInfo.prompts || [];
      }

      res.json({
        success: true,
        prompts,
        totalPrompts: prompts.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to list MCP prompts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list MCP prompts',
        details: error.message,
      });
    }
  },
);

export default router;
