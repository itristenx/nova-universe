// Nova Universe OAuth 2.0 Server Implementation
// Full RFC 6749 OAuth 2.0 Authorization Framework with PKCE (RFC 7636)
// Supports multi-tenant environments with tenant isolation

import express from 'express';
import crypto from 'crypto';
import { body, query, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { logger } from '../logger.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// OAuth 2.0 Configuration
const OAUTH_CONFIG = {
  authorizationCodeExpiry: 600, // 10 minutes
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  issuer: process.env.OAUTH_ISSUER || 'https://nova-universe.com',
  supportedGrantTypes: ['authorization_code', 'refresh_token', 'client_credentials'],
  supportedResponseTypes: ['code'],
  supportedScopes: ['read', 'write', 'admin', 'scim', 'openid', 'profile', 'email'],
  requirePKCE: true,
};

/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414)
 * @swagger
 * /.well-known/oauth-authorization-server:
 *   get:
 *     summary: OAuth 2.0 Authorization Server Metadata
 *     description: Returns OAuth 2.0 server metadata as per RFC 8414
 *     tags: [OAuth 2.0]
 *     responses:
 *       200:
 *         description: Authorization server metadata
 */
router.get('/.well-known/oauth-authorization-server', async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    issuer: OAUTH_CONFIG.issuer,
    authorization_endpoint: `${baseUrl}/api/v1/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/v1/oauth/token`,
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'none'],
    revocation_endpoint: `${baseUrl}/api/v1/oauth/revoke`,
    introspection_endpoint: `${baseUrl}/api/v1/oauth/introspect`,
    response_types_supported: OAUTH_CONFIG.supportedResponseTypes,
    grant_types_supported: OAUTH_CONFIG.supportedGrantTypes,
    scopes_supported: OAUTH_CONFIG.supportedScopes,
    code_challenge_methods_supported: ['S256'],
    service_documentation: `${baseUrl}/docs/oauth`,
    ui_locales_supported: ['en-US'],
  });
});

/**
 * Client Registration Endpoint (RFC 7591 - Dynamic Client Registration)
 * @swagger
 * /api/v1/oauth/register:
 *   post:
 *     summary: Register OAuth 2.0 Client
 *     description: Dynamically register a new OAuth 2.0 client
 *     tags: [OAuth 2.0]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client_name
 *               - redirect_uris
 *             properties:
 *               client_name:
 *                 type: string
 *               redirect_uris:
 *                 type: array
 *                 items:
 *                   type: string
 *               scope:
 *                 type: string
 *               grant_types:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Client registered successfully
 */
router.post(
  '/register',
  createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  [
    body('client_name').isString().isLength({ min: 1, max: 255 }),
    body('redirect_uris').isArray().notEmpty(),
    body('redirect_uris.*').isURL(),
    body('scope').optional().isString(),
    body('grant_types').optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Invalid client registration request',
          details: errors.array(),
        });
      }

      const { client_name, redirect_uris, scope, grant_types } = req.body;
      
      // Generate client credentials
      const client_id = `client_${uuidv4()}`;
      const client_secret = crypto.randomBytes(32).toString('base64url');
      const client_secret_hash = crypto.createHash('sha256').update(client_secret).digest('hex');

      // Default tenant (can be customized per deployment)
      const tenant_id = req.body.tenant_id || null;

      // Insert client into database
      await db.query(
        `INSERT INTO oauth_clients (
          client_id, client_secret_hash, client_name, redirect_uris, 
          scope, grant_types, tenant_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
        [
          client_id,
          client_secret_hash,
          client_name,
          JSON.stringify(redirect_uris),
          scope || OAUTH_CONFIG.supportedScopes.join(' '),
          JSON.stringify(grant_types || ['authorization_code', 'refresh_token']),
          tenant_id,
        ]
      );

      logger.info('OAuth client registered:', { client_id, client_name, tenant_id });

      res.status(201).json({
        client_id,
        client_secret,
        client_name,
        redirect_uris,
        grant_types: grant_types || ['authorization_code', 'refresh_token'],
        scope: scope || OAUTH_CONFIG.supportedScopes.join(' '),
        client_id_issued_at: Math.floor(Date.now() / 1000),
      });
    } catch (error) {
      logger.error('Client registration error:', error);
      res.status(500).json({
        error: 'server_error',
        error_description: 'Failed to register client',
      });
    }
  }
);

/**
 * Authorization Endpoint (RFC 6749 Section 3.1)
 * @swagger
 * /api/v1/oauth/authorize:
 *   get:
 *     summary: OAuth 2.0 Authorization Endpoint
 *     description: Initiate authorization code flow with PKCE support
 *     tags: [OAuth 2.0]
 *     parameters:
 *       - name: response_type
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [code]
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
 *       - name: scope
 *         in: query
 *         schema:
 *           type: string
 *       - name: state
 *         in: query
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
  '/authorize',
  createRateLimiter({ windowMs: 60 * 1000, max: 30 }),
  [
    query('response_type').equals('code'),
    query('client_id').isString().notEmpty(),
    query('redirect_uri').isURL(),
    query('code_challenge').isString().notEmpty(),
    query('code_challenge_method').equals('S256'),
    query('scope').optional().isString(),
    query('state').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Invalid authorization request',
        });
      }

      const { client_id, redirect_uri, scope, state, code_challenge, code_challenge_method } = req.query;

      // Verify client exists and redirect_uri is registered
      const client = await db.oneOrNone(
        'SELECT * FROM oauth_clients WHERE client_id = $1 AND is_active = true',
        [client_id]
      );

      if (!client) {
        return res.status(400).json({
          error: 'invalid_client',
          error_description: 'Client not found or inactive',
        });
      }

      const registeredUris = JSON.parse(client.redirect_uris);
      if (!registeredUris.includes(redirect_uri)) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Invalid redirect_uri',
        });
      }

      // In a real implementation, this would redirect to a login/consent page
      // For now, we'll generate the authorization code directly (assuming user is authenticated)
      
      // Check if user is authenticated (simplified - should use session)
      const user_id = req.user?.id || req.session?.user_id;
      if (!user_id) {
        // Redirect to login page with return URL
        return res.redirect(`/login?return_to=${encodeURIComponent(req.originalUrl)}`);
      }

      // Generate authorization code
      const authorization_code = crypto.randomBytes(32).toString('base64url');
      const expires_at = new Date(Date.now() + OAUTH_CONFIG.authorizationCodeExpiry * 1000);

      // Store authorization code
      await db.query(
        `INSERT INTO oauth_authorization_codes (
          code, client_id, user_id, redirect_uri, scope, 
          code_challenge, code_challenge_method, expires_at, tenant_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          authorization_code,
          client_id,
          user_id,
          redirect_uri,
          scope || OAUTH_CONFIG.supportedScopes.join(' '),
          code_challenge,
          code_challenge_method,
          expires_at,
          client.tenant_id,
        ]
      );

      // Redirect back to client with authorization code
      const redirectUrl = new URL(redirect_uri);
      redirectUrl.searchParams.set('code', authorization_code);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }

      logger.info('Authorization code issued:', { client_id, user_id });

      res.redirect(redirectUrl.toString());
    } catch (error) {
      logger.error('Authorization error:', error);
      
      // Try to redirect with error if possible
      if (req.query.redirect_uri) {
        const redirectUrl = new URL(req.query.redirect_uri);
        redirectUrl.searchParams.set('error', 'server_error');
        redirectUrl.searchParams.set('error_description', 'Authorization failed');
        if (req.query.state) {
          redirectUrl.searchParams.set('state', req.query.state);
        }
        return res.redirect(redirectUrl.toString());
      }

      res.status(500).json({
        error: 'server_error',
        error_description: 'Authorization failed',
      });
    }
  }
);

/**
 * Token Endpoint (RFC 6749 Section 3.2)
 * @swagger
 * /api/v1/oauth/token:
 *   post:
 *     summary: OAuth 2.0 Token Endpoint
 *     description: Exchange authorization code for access token with PKCE verification
 *     tags: [OAuth 2.0]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - grant_type
 *               - client_id
 *             properties:
 *               grant_type:
 *                 type: string
 *                 enum: [authorization_code, refresh_token, client_credentials]
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *               code:
 *                 type: string
 *               redirect_uri:
 *                 type: string
 *               code_verifier:
 *                 type: string
 *               refresh_token:
 *                 type: string
 *               scope:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token issued successfully
 */
router.post(
  '/token',
  createRateLimiter({ windowMs: 60 * 1000, max: 60 }),
  express.urlencoded({ extended: true }),
  [
    body('grant_type').isIn(['authorization_code', 'refresh_token', 'client_credentials']),
    body('client_id').isString().notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Invalid token request',
        });
      }

      const { grant_type, client_id, client_secret, code, redirect_uri, code_verifier, refresh_token, scope } = req.body;

      // Verify client
      const client = await db.oneOrNone(
        'SELECT * FROM oauth_clients WHERE client_id = $1 AND is_active = true',
        [client_id]
      );

      if (!client) {
        return res.status(401).json({
          error: 'invalid_client',
          error_description: 'Client authentication failed',
        });
      }

      // Verify client_secret if provided
      if (client_secret) {
        const client_secret_hash = crypto.createHash('sha256').update(client_secret).digest('hex');
        if (client_secret_hash !== client.client_secret_hash) {
          return res.status(401).json({
            error: 'invalid_client',
            error_description: 'Invalid client credentials',
          });
        }
      }

      let user_id, tenant_id, token_scope;

      if (grant_type === 'authorization_code') {
        // Validate authorization code
        if (!code || !code_verifier) {
          return res.status(400).json({
            error: 'invalid_request',
            error_description: 'Missing code or code_verifier',
          });
        }

        const authCode = await db.oneOrNone(
          `SELECT * FROM oauth_authorization_codes 
           WHERE code = $1 AND client_id = $2 AND used = false AND expires_at > NOW()`,
          [code, client_id]
        );

        if (!authCode) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'Invalid or expired authorization code',
          });
        }

        // Verify PKCE code_verifier
        const verifierHash = crypto.createHash('sha256').update(code_verifier).digest('base64url');
        if (verifierHash !== authCode.code_challenge) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'PKCE verification failed',
          });
        }

        // Verify redirect_uri matches
        if (redirect_uri !== authCode.redirect_uri) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'redirect_uri mismatch',
          });
        }

        user_id = authCode.user_id;
        tenant_id = authCode.tenant_id;
        token_scope = authCode.scope;

        // Mark authorization code as used
        await db.query(
          'UPDATE oauth_authorization_codes SET used = true WHERE code = $1',
          [code]
        );

      } else if (grant_type === 'refresh_token') {
        // Validate refresh token
        if (!refresh_token) {
          return res.status(400).json({
            error: 'invalid_request',
            error_description: 'Missing refresh_token',
          });
        }

        try {
          const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
          
          if (decoded.type !== 'refresh' || decoded.client_id !== client_id) {
            throw new Error('Invalid refresh token');
          }

          user_id = decoded.user_id;
          tenant_id = decoded.tenant_id;
          token_scope = scope || decoded.scope;

        } catch (error) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'Invalid refresh token',
          });
        }

      } else if (grant_type === 'client_credentials') {
        // Client credentials grant (machine-to-machine)
        if (!client_secret) {
          return res.status(401).json({
            error: 'invalid_client',
            error_description: 'Client secret required for client_credentials grant',
          });
        }

        user_id = null; // No user context for client credentials
        tenant_id = client.tenant_id;
        token_scope = scope || client.scope;
      }

      // Generate access token (JWT)
      const accessTokenPayload = {
        user_id,
        client_id,
        tenant_id,
        scope: token_scope,
        type: 'access',
        jti: uuidv4(),
      };

      const accessToken = jwt.sign(
        accessTokenPayload,
        process.env.JWT_SECRET,
        {
          expiresIn: OAUTH_CONFIG.accessTokenExpiry,
          issuer: OAUTH_CONFIG.issuer,
          audience: client_id,
        }
      );

      // Generate refresh token (JWT)
      const refreshTokenPayload = {
        user_id,
        client_id,
        tenant_id,
        scope: token_scope,
        type: 'refresh',
        jti: uuidv4(),
      };

      const newRefreshToken = jwt.sign(
        refreshTokenPayload,
        process.env.JWT_SECRET,
        {
          expiresIn: OAUTH_CONFIG.refreshTokenExpiry,
          issuer: OAUTH_CONFIG.issuer,
          audience: client_id,
        }
      );

      // Calculate expires_in
      const decoded = jwt.decode(accessToken);
      const expires_in = decoded.exp - Math.floor(Date.now() / 1000);

      logger.info('Access token issued:', { client_id, user_id, grant_type });

      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in,
        refresh_token: newRefreshToken,
        scope: token_scope,
      });

    } catch (error) {
      logger.error('Token endpoint error:', error);
      res.status(500).json({
        error: 'server_error',
        error_description: 'Token generation failed',
      });
    }
  }
);

/**
 * Token Revocation Endpoint (RFC 7009)
 * @swagger
 * /api/v1/oauth/revoke:
 *   post:
 *     summary: Revoke OAuth 2.0 Token
 *     description: Revoke an access or refresh token
 *     tags: [OAuth 2.0]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *               token_type_hint:
 *                 type: string
 *                 enum: [access_token, refresh_token]
 *     responses:
 *       200:
 *         description: Token revoked successfully
 */
router.post(
  '/revoke',
  createRateLimiter({ windowMs: 60 * 1000, max: 60 }),
  express.urlencoded({ extended: true }),
  [body('token').isString().notEmpty()],
  async (req, res) => {
    try {
      const { token, token_type_hint } = req.body;

      // Decode token to get JTI
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.jti) {
        return res.status(200).send(); // RFC 7009 requires 200 even for invalid tokens
      }

      // Add token to revocation list
      const expires_at = new Date(decoded.exp * 1000);
      await db.query(
        `INSERT INTO oauth_revoked_tokens (jti, token_type, expires_at) 
         VALUES ($1, $2, $3) ON CONFLICT (jti) DO NOTHING`,
        [decoded.jti, token_type_hint || decoded.type, expires_at]
      );

      logger.info('Token revoked:', { jti: decoded.jti, client_id: decoded.client_id });

      res.status(200).send();
    } catch (error) {
      logger.error('Token revocation error:', error);
      // RFC 7009 requires 200 even on error
      res.status(200).send();
    }
  }
);

/**
 * Token Introspection Endpoint (RFC 7662)
 * @swagger
 * /api/v1/oauth/introspect:
 *   post:
 *     summary: Introspect OAuth 2.0 Token
 *     description: Validate and get information about a token
 *     tags: [OAuth 2.0]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token introspection result
 */
router.post(
  '/introspect',
  createRateLimiter({ windowMs: 60 * 1000, max: 120 }),
  express.urlencoded({ extended: true }),
  [body('token').isString().notEmpty()],
  async (req, res) => {
    try {
      const { token } = req.body;

      // Verify and decode token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if token is revoked
        const revoked = await db.oneOrNone(
          'SELECT 1 FROM oauth_revoked_tokens WHERE jti = $1',
          [decoded.jti]
        );

        if (revoked) {
          return res.json({ active: false });
        }

        // Token is active
        res.json({
          active: true,
          scope: decoded.scope,
          client_id: decoded.client_id,
          username: decoded.user_id,
          token_type: decoded.type,
          exp: decoded.exp,
          iat: decoded.iat,
          sub: decoded.user_id,
          aud: decoded.aud,
          iss: decoded.iss,
          jti: decoded.jti,
          tenant_id: decoded.tenant_id,
        });

      } catch (error) {
        // Invalid or expired token
        res.json({ active: false });
      }
    } catch (error) {
      logger.error('Token introspection error:', error);
      res.json({ active: false });
    }
  }
);

export default router;
