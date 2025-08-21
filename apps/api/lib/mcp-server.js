// nova-api/lib/mcp-server.js
// Model Context Protocol (MCP) Server with OAuth 2.1 Compliance

import { logger } from '../logger.js';
import crypto from 'crypto';

/**
 * Nova MCP Server for AI model context management
 * Enhanced with OAuth 2.1 compliance for OpenAI integration
 */
class NovaMCPServer {
  constructor() {
    this.initialized = false;
    this.contexts = new Map();
    this.models = new Map();
    
    // OAuth 2.1 compliance properties
    this.clients = new Map(); // Registered OAuth clients
    this.authorizationCodes = new Map(); // PKCE codes
    this.accessTokens = new Map(); // Active access tokens
    this.refreshTokens = new Map(); // Refresh tokens
    
    // OAuth 2.1 server metadata
    this.serverMetadata = {
      issuer: process.env.MCP_ISSUER || 'https://api.nova.local/mcp',
      authorization_endpoint: process.env.MCP_AUTH_ENDPOINT || 'https://api.nova.local/mcp/oauth/authorize',
      token_endpoint: process.env.MCP_TOKEN_ENDPOINT || 'https://api.nova.local/mcp/oauth/token',
      registration_endpoint: process.env.MCP_REGISTRATION_ENDPOINT || 'https://api.nova.local/mcp/oauth/register',
      revocation_endpoint: process.env.MCP_REVOCATION_ENDPOINT || 'https://api.nova.local/mcp/oauth/revoke',
      scopes_supported: ['mcp:read', 'mcp:write', 'mcp:admin'],
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'], // PKCE required
      token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
      revocation_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic']
    };
  }

  /**
   * Initialize MCP Server with OAuth 2.1 compliance
   */
  async initialize() {
    try {
      logger.info('Initializing Nova MCP Server with OAuth 2.1 compliance...');
      
      // Initialize OAuth 2.1 compliance features
      await this.initializeOAuthServer();
      
      this.initialized = true;
      logger.info('Nova MCP Server initialized successfully with OAuth 2.1 compliance');
    } catch (error) {
      logger.error('Failed to initialize Nova MCP Server', { error: error.message });
      throw error;
    }
  }

  /**
   * Initialize OAuth 2.1 server components
   */
  async initializeOAuthServer() {
    logger.info('Initializing OAuth 2.1 server components...');
    
    // Pre-register OpenAI client if configured
    if (process.env.OPENAI_CLIENT_ID && process.env.OPENAI_CLIENT_SECRET) {
      await this.registerClient({
        client_name: 'OpenAI',
        client_id: process.env.OPENAI_CLIENT_ID,
        client_secret: process.env.OPENAI_CLIENT_SECRET,
        redirect_uris: [process.env.OPENAI_REDIRECT_URI || 'https://api.openai.com/v1/oauth/callback'],
        scope: 'mcp:read mcp:write',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code']
      });
    }
    
    logger.info('OAuth 2.1 server components initialized');
  }

  /**
   * Get OAuth 2.1 authorization server metadata (.well-known/oauth-authorization-server)
   */
  getAuthorizationServerMetadata() {
    return this.serverMetadata;
  }

  /**
   * Dynamic client registration (RFC 7591)
   */
  async registerClient(clientInfo) {
    const clientId = clientInfo.client_id || crypto.randomUUID();
    const clientSecret = clientInfo.client_secret || crypto.randomBytes(32).toString('hex');
    
    const client = {
      client_id: clientId,
      client_secret: clientSecret,
      client_name: clientInfo.client_name || 'Unnamed Client',
      redirect_uris: clientInfo.redirect_uris || [],
      scope: clientInfo.scope || 'mcp:read',
      grant_types: clientInfo.grant_types || ['authorization_code'],
      response_types: clientInfo.response_types || ['code'],
      created_at: new Date().toISOString()
    };
    
    this.clients.set(clientId, client);
    logger.info('OAuth client registered', { clientId, clientName: client.client_name });
    
    return {
      client_id: clientId,
      client_secret: clientSecret,
      client_name: client.client_name,
      redirect_uris: client.redirect_uris,
      scope: client.scope,
      grant_types: client.grant_types,
      response_types: client.response_types
    };
  }

  /**
   * Authorization endpoint with PKCE support (RFC 7636)
   */
  async authorize(params) {
    const { client_id, redirect_uri, scope, state, code_challenge, code_challenge_method, response_type } = params;
    
    // Validate client
    const client = this.clients.get(client_id);
    if (!client) {
      throw new Error('invalid_client');
    }
    
    // Validate redirect URI
    if (!client.redirect_uris.includes(redirect_uri)) {
      throw new Error('invalid_redirect_uri');
    }
    
    // Validate PKCE (required for OAuth 2.1)
    if (!code_challenge || code_challenge_method !== 'S256') {
      throw new Error('invalid_request: PKCE required');
    }
    
    // Validate response type
    if (response_type !== 'code') {
      throw new Error('unsupported_response_type');
    }
    
    // Generate authorization code
    const authCode = crypto.randomBytes(32).toString('hex');
    
    this.authorizationCodes.set(authCode, {
      client_id,
      redirect_uri,
      scope: scope || 'mcp:read',
      code_challenge,
      code_challenge_method,
      state,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    
    logger.info('Authorization code generated', { clientId: client_id, scope });
    
    return {
      code: authCode,
      state
    };
  }

  /**
   * Token endpoint with PKCE verification
   */
  async exchangeToken(params) {
    const { grant_type, client_id, client_secret, code, redirect_uri, code_verifier, refresh_token } = params;
    
    // Validate client
    const client = this.clients.get(client_id);
    if (!client || client.client_secret !== client_secret) {
      throw new Error('invalid_client');
    }
    
    if (grant_type === 'authorization_code') {
      // Validate authorization code
      const authData = this.authorizationCodes.get(code);
      if (!authData || authData.client_id !== client_id || authData.redirect_uri !== redirect_uri) {
        throw new Error('invalid_grant');
      }
      
      // Check expiration
      if (new Date() > authData.expires_at) {
        this.authorizationCodes.delete(code);
        throw new Error('invalid_grant: expired');
      }
      
      // Verify PKCE code verifier
      const codeChallenge = crypto.createHash('sha256').update(code_verifier).digest('base64url');
      if (codeChallenge !== authData.code_challenge) {
        throw new Error('invalid_grant: PKCE verification failed');
      }
      
      // Generate tokens
      const accessToken = crypto.randomBytes(32).toString('hex');
      const newRefreshToken = crypto.randomBytes(32).toString('hex');
      
      // Store tokens
      this.accessTokens.set(accessToken, {
        client_id,
        scope: authData.scope,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });
      
      this.refreshTokens.set(newRefreshToken, {
        client_id,
        scope: authData.scope,
        created_at: new Date()
      });
      
      // Clean up authorization code
      this.authorizationCodes.delete(code);
      
      logger.info('Access token issued', { clientId: client_id, scope: authData.scope });
      
      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken,
        scope: authData.scope
      };
      
    } else if (grant_type === 'refresh_token') {
      // Validate refresh token
      const refreshData = this.refreshTokens.get(refresh_token);
      if (!refreshData || refreshData.client_id !== client_id) {
        throw new Error('invalid_grant');
      }
      
      // Generate new access token
      const accessToken = crypto.randomBytes(32).toString('hex');
      
      this.accessTokens.set(accessToken, {
        client_id,
        scope: refreshData.scope,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });
      
      logger.info('Access token refreshed', { clientId: client_id });
      
      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: refreshData.scope
      };
    }
    
    throw new Error('unsupported_grant_type');
  }

  /**
   * Token revocation endpoint
   */
  async revokeToken(params) {
    const { token, token_type_hint, client_id, client_secret } = params;
    
    // Validate client
    const client = this.clients.get(client_id);
    if (!client || client.client_secret !== client_secret) {
      throw new Error('invalid_client');
    }
    
    // Revoke access token
    if (this.accessTokens.has(token)) {
      this.accessTokens.delete(token);
      logger.info('Access token revoked', { clientId: client_id });
      return;
    }
    
    // Revoke refresh token
    if (this.refreshTokens.has(token)) {
      this.refreshTokens.delete(token);
      logger.info('Refresh token revoked', { clientId: client_id });
      return;
    }
    
    // Token not found - still return success per RFC
    logger.info('Token revocation requested for unknown token', { clientId: client_id });
  }

  /**
   * Validate access token
   */
  validateAccessToken(token) {
    const tokenData = this.accessTokens.get(token);
    if (!tokenData) {
      return null;
    }
    
    // Check expiration
    if (new Date() > tokenData.expires_at) {
      this.accessTokens.delete(token);
      return null;
    }
    
    return tokenData;
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
      metadata: {},
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
      timestamp: new Date().toISOString(),
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
      timestamp: new Date().toISOString(),
    };
  }
}

// Create singleton instance
export const novaMCPServer = new NovaMCPServer();

// Initialize on module load
if (process.env.NODE_ENV !== 'test') {
  novaMCPServer.initialize().catch((err) => {
    logger.error('Nova MCP Server initialization failed', { error: err.message });
  });
}
