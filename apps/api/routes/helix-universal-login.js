// Nova Helix Universal Login Routes
// Implements tenant-aware, multi-step authentication with SSO, MFA, and comprehensive audit logging

import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { body, validationResult } from 'express-validator';
import { rateLimit } from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

import db from '../db.js';
import { logger } from '../logger.js';
import { authenticateJWT } from '../middleware/auth.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { configureSAML } from '../middleware/saml.js';

const router = express.Router();

// Rate limiters
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const mfaRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 MFA attempts per window
  message: { error: 'Too many MFA attempts, please try again later' }
});

/**
 * Tenant Discovery and Branding Service
 */

/**
 * @swagger
 * /api/v1/helix/login/tenant/discover:
 *   post:
 *     summary: Discover tenant and authentication methods by email/domain
 *     description: First step in multi-step login flow - discovers tenant and available auth methods
 *     tags: [Helix - Universal Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               domain:
 *                 type: string
 *               redirectUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tenant discovery successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tenant:
 *                   type: object
 *                 authMethods:
 *                   type: array
 *                 branding:
 *                   type: object
 */
router.post('/tenant/discover', [
  body('email').optional().isEmail().normalizeEmail(),
  body('domain').optional().isLength({ min: 1, max: 255 }),
  body('redirectUrl').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, domain, redirectUrl } = req.body;
    let tenant = null;
    let user = null;

    // Discover tenant by domain or email domain
    if (email) {
      const emailDomain = email.split('@')[1];
      
      // First try to find user and their tenant
      user = await db.query(
        `SELECT u.id as user_id, u.name as user_name, u.email, u.tenant_id,
                t.id as tenant_id, t.name as tenant_name, t.domain, t.subdomain,
                t.logo_url, t.theme_color, t.background_image_url, t.login_message,
                t.sso_enabled, t.mfa_required
         FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id WHERE u.email = $1`,
        [email]
      );
      
      if (user.rows.length > 0) {
        const row = user.rows[0];
        tenant = {
          id: row.tenant_id,
          name: row.tenant_name,
          domain: row.domain,
          subdomain: row.subdomain,
          logo_url: row.logo_url,
          theme_color: row.theme_color,
          background_image_url: row.background_image_url,
          login_message: row.login_message,
          sso_enabled: row.sso_enabled,
          mfa_required: row.mfa_required
        };
      } else {
        // Try to find tenant by email domain
        const domainResult = await db.query(
          'SELECT * FROM tenants WHERE domain = $1 AND active = true',
          [emailDomain]
        );
        
        if (domainResult.rows.length > 0) {
          tenant = domainResult.rows[0];
        }
      }
    } else if (domain) {
      // Find tenant by provided domain
      const domainResult = await db.query(
        'SELECT * FROM tenants WHERE (domain = $1 OR subdomain = $1) AND active = true',
        [domain]
      );
      
      if (domainResult.rows.length > 0) {
        tenant = domainResult.rows[0];
      }
    }

    // Fall back to default tenant if no specific tenant found
    if (!tenant) {
      const defaultResult = await db.query(
        'SELECT * FROM tenants WHERE domain = $1 AND active = true',
        ['localhost']
      );
      
      if (defaultResult.rows.length > 0) {
        tenant = defaultResult.rows[0];
      } else {
        return res.status(404).json({
          success: false,
          error: 'No tenant configuration found'
        });
      }
    }

    // Get available authentication methods
    const authMethods = [];
    
    // Always support password authentication
    authMethods.push({
      type: 'password',
      name: 'Password',
      primary: true
    });

    // Check for SSO configurations
    if (tenant.sso_enabled) {
      const ssoConfigs = await db.query(
        'SELECT provider, provider_name, enabled FROM sso_configs WHERE tenant_id = $1 AND enabled = true',
        [tenant.id]
      );
      
      for (const sso of ssoConfigs.rows) {
        authMethods.push({
          type: 'sso',
          provider: sso.provider,
          name: sso.provider_name,
          primary: false
        });
      }
    }

    // Check for WebAuthn/Passkey support
    if (user && user.rows.length > 0) {
      const passkeyResult = await db.query(
        'SELECT COUNT(*) as count FROM passkeys WHERE user_id = $1',
        [user.rows[0].user_id]
      );
      
      if (parseInt(passkeyResult.rows[0].count) > 0) {
        authMethods.push({
          type: 'passkey',
          name: 'Passkey',
          primary: false
        });
      }
    }

    // Build branding response
    const branding = {
      logo: tenant.logo_url,
      themeColor: tenant.theme_color || '#1f2937',
      backgroundImage: tenant.background_image_url,
      loginMessage: tenant.login_message,
      organizationName: tenant.name
    };

    // Store discovery in session for security
    const discoveryToken = uuidv4();
    await db.query(
      `INSERT INTO auth_audit_logs (
        tenant_id, event_type, event_category, event_description, 
        ip_address, user_agent, success, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        tenant.id,
        'tenant_discovery',
        'authentication',
        `Tenant discovery for ${email || domain}`,
        req.ip,
        req.get('User-Agent'),
        true,
        JSON.stringify({ 
          discoveryToken, 
          email: email || null, 
          domain: domain || null,
          redirectUrl: redirectUrl || null 
        })
      ]
    );

    res.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain
      },
      authMethods,
      branding,
      userExists: user && user.rows.length > 0,
      mfaRequired: tenant.mfa_required,
      discoveryToken
    });

  } catch (error) {
    logger.error('Tenant discovery error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during tenant discovery'
    });
  }
});

/**
 * @swagger
 * /api/v1/helix/login/authenticate:
 *   post:
 *     summary: Authenticate user with credentials
 *     description: Second step in login flow - authenticate with password, SSO, or passkey
 *     tags: [Helix - Universal Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discoveryToken:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               authMethod:
 *                 type: string
 *                 enum: [password, sso, passkey]
 *               ssoProvider:
 *                 type: string
 *               redirectUrl:
 *                 type: string
 */
router.post('/authenticate', loginRateLimit, [
  body('discoveryToken').isUUID(),
  body('email').isEmail().normalizeEmail(),
  body('authMethod').isIn(['password', 'sso', 'passkey']),
  body('password').optional().isLength({ min: 1 }),
  body('ssoProvider').optional().isLength({ min: 1 }),
  body('redirectUrl').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { discoveryToken, email, password, authMethod, ssoProvider, redirectUrl } = req.body;

    // Verify discovery token
    const auditResult = await db.query(
      `SELECT metadata FROM auth_audit_logs 
       WHERE event_type = 'tenant_discovery' 
       AND metadata->>'discoveryToken' = $1 
       AND created_at > NOW() - INTERVAL '10 minutes'
       ORDER BY created_at DESC LIMIT 1`,
      [discoveryToken]
    );

    if (auditResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired discovery token'
      });
    }

    const discoveryMetadata = auditResult.rows[0].metadata;

    console.log('DEBUG: Starting authentication for email:', email);
    console.log('DEBUG: Discovery metadata:', JSON.stringify(discoveryMetadata, null, 2));

    // Get user and tenant
    const userResult = await db.query(
      `SELECT u.id as user_id, u.name as user_name, u.email, u.password_hash, 
              u.disabled, u.two_factor_enabled, u.tenant_id,
              t.id as tenant_id, t.name as tenant_name, t.domain, t.subdomain,
              t.logo_url, t.theme_color, t.background_image_url, t.login_message,
              t.sso_enabled, t.mfa_required
       FROM users u 
       LEFT JOIN tenants t ON u.tenant_id = t.id 
       WHERE u.email = $1`,
      [email]
    );

    console.log('DEBUG: User query result:', JSON.stringify(userResult.rows, null, 2));

    if (userResult.rows.length === 0) {
      console.log('DEBUG: User not found for email:', email);
      await logAuthEvent(null, null, 'login_failure', 'authentication', 
        'User not found', req.ip, req.get('User-Agent'), false, 
        { email, authMethod, error: 'user_not_found' });
      
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const row = userResult.rows[0];
    const user = {
      id: row.user_id,
      name: row.user_name,
      email: row.email,
      password_hash: row.password_hash,
      disabled: row.disabled,
      two_factor_enabled: row.two_factor_enabled,
      tenant_id: row.tenant_id
    };
    const tenantId = row.tenant_id;

    console.log('DEBUG: Parsed user object:', JSON.stringify(user, null, 2));
    console.log('DEBUG: Tenant ID:', tenantId);

    // Check if user is disabled
    if (user.disabled) {
      await logAuthEvent(tenantId, user.id, 'login_failure', 'authentication',
        'Account disabled', req.ip, req.get('User-Agent'), false,
        { email, authMethod, error: 'account_disabled' });
      
      return res.status(401).json({
        success: false,
        error: 'Account is disabled'
      });
    }

    // Rate limiting check
    const rateLimitResult = await checkRateLimit(email, req.ip);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      });
    }

    let authSuccess = false;
    let authError = null;

    // Handle different authentication methods
    if (authMethod === 'password') {
      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required'
        });
      }

      if (!user.password_hash) {
        authError = 'Password authentication not available for this user';
      } else {
        console.log('DEBUG: Attempting bcrypt comparison');
        console.log('DEBUG: Password received:', password);
        console.log('DEBUG: Password hash from DB:', user.password_hash);
        console.log('DEBUG: User object:', JSON.stringify(user, null, 2));
        
        authSuccess = await bcrypt.compare(password, user.password_hash);
        
        console.log('DEBUG: bcrypt comparison result:', authSuccess);
        
        if (!authSuccess) {
          authError = 'Invalid password';
          console.log('DEBUG: Authentication failed - bcrypt returned false');
        } else {
          console.log('DEBUG: Authentication successful - bcrypt returned true');
        }
      }
    } else if (authMethod === 'sso') {
      // For SSO, we'll return a redirect URL
      if (!ssoProvider) {
        return res.status(400).json({
          success: false,
          error: 'SSO provider is required'
        });
      }

      const ssoConfig = await db.query(
        'SELECT * FROM sso_configs WHERE tenant_id = $1 AND provider = $2 AND enabled = true',
        [tenantId, ssoProvider]
      );

      if (ssoConfig.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'SSO provider not configured'
        });
      }

      // Generate SSO state token
      const ssoState = uuidv4();
      const ssoUrl = await generateSSOUrl(ssoConfig.rows[0], ssoState, redirectUrl);

      // Store SSO state
      await db.query(
        'INSERT INTO mfa_challenges (user_id, session_temp_id, challenge_type, expires_at) VALUES ($1, $2, $3, $4)',
        [user.id, ssoState, 'sso_state', new Date(Date.now() + 10 * 60 * 1000)] // 10 minutes
      );

      return res.json({
        success: true,
        authMethod: 'sso',
        redirectUrl: ssoUrl,
        state: ssoState
      });
    }

    if (!authSuccess) {
      await incrementRateLimit(email, req.ip);
      await logAuthEvent(tenantId, user.id, 'login_failure', 'authentication',
        authError, req.ip, req.get('User-Agent'), false,
        { email, authMethod, error: authError });

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if MFA is required
    const mfaRequired = user.two_factor_enabled || 
                       await checkTenantMfaRequirement(tenantId) ||
                       await checkRiskBasedMfaRequirement(user.id, req);

    if (mfaRequired) {
      // Generate temporary session for MFA
      const tempSessionId = uuidv4();
      
      await db.query(
        `INSERT INTO mfa_challenges (user_id, session_temp_id, challenge_type, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [user.id, tempSessionId, 'login_pending', new Date(Date.now() + 10 * 60 * 1000)]
      );

      await logAuthEvent(tenantId, user.id, 'mfa_challenge', 'authentication',
        'MFA challenge initiated', req.ip, req.get('User-Agent'), true,
        { email, authMethod, tempSessionId });

      return res.json({
        success: true,
        requiresMFA: true,
        tempSessionId,
        availableMfaMethods: await getAvailableMfaMethods(user.id)
      });
    }

    // Create full session
    const session = await createAuthSession(user, tenantId, authMethod, req);
    
    await logAuthEvent(tenantId, user.id, 'login_success', 'authentication',
      'Successful login', req.ip, req.get('User-Agent'), true,
      { email, authMethod, sessionId: session.id });

    // Update user last login
    await db.query('UPDATE users SET "lastLoginAt" = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    res.json({
      success: true,
      token: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: '12h',
      user: sanitizeUser(user),
      redirectUrl: redirectUrl || '/'
    });

  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
});

/**
 * MFA Challenge and Verification Endpoints
 */

/**
 * @swagger
 * /api/v1/helix/login/mfa/challenge:
 *   post:
 *     summary: Initiate MFA challenge
 *     description: Send MFA challenge (TOTP, SMS, email) to user
 *     tags: [Helix - Universal Login]
 */
router.post('/mfa/challenge', mfaRateLimit, [
  body('tempSessionId').isUUID(),
  body('mfaMethod').isIn(['totp', 'sms', 'email', 'backup_code'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { tempSessionId, mfaMethod } = req.body;

    // Verify temp session
    const tempSession = await db.query(
      `SELECT * FROM mfa_challenges 
       WHERE session_temp_id = $1 AND challenge_type = 'login_pending' 
       AND expires_at > CURRENT_TIMESTAMP`,
      [tempSessionId]
    );

    if (tempSession.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const userId = tempSession.rows[0].user_id;

    // Get user's MFA configuration
    const mfaConfig = await db.query(
      'SELECT * FROM mfa_methods WHERE user_id = $1 AND method_type = $2 AND is_active = true',
      [userId, mfaMethod]
    );

    if (mfaConfig.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'MFA method not configured'
      });
    }

    const config = mfaConfig.rows[0];
    let challengeResponse = { method: mfaMethod };

    if (mfaMethod === 'totp') {
      // TOTP doesn't need server-side challenge, just return ready state
      challengeResponse.message = 'Enter code from your authenticator app';
    } else if (mfaMethod === 'sms' || mfaMethod === 'email') {
      // Generate and send challenge code
      const challengeCode = crypto.randomInt(100000, 999999).toString();
      const challengeHash = await bcrypt.hash(challengeCode, 10);

      // Store challenge
      await db.query(
        `INSERT INTO mfa_challenges (user_id, session_temp_id, challenge_type, challenge_code_hash, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, tempSessionId, mfaMethod, challengeHash, new Date(Date.now() + 5 * 60 * 1000)]
      );

      if (mfaMethod === 'sms') {
        // TODO: Implement SMS sending
        challengeResponse.message = 'Verification code sent to your phone';
        challengeResponse.maskedPhone = maskPhoneNumber(decrypt(config.phone_number_encrypted));
      } else if (mfaMethod === 'email') {
        // TODO: Implement email sending
        challengeResponse.message = 'Verification code sent to your email';
        challengeResponse.maskedEmail = maskEmail(decrypt(config.email_address_encrypted));
      }
    }

    res.json({
      success: true,
      ...challengeResponse
    });

  } catch (error) {
    logger.error('MFA challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during MFA challenge'
    });
  }
});

/**
 * @swagger
 * /api/v1/helix/login/mfa/verify:
 *   post:
 *     summary: Verify MFA challenge response
 *     description: Verify TOTP, SMS, email, or backup code
 *     tags: [Helix - Universal Login]
 */
router.post('/mfa/verify', mfaRateLimit, [
  body('tempSessionId').isUUID(),
  body('mfaMethod').isIn(['totp', 'sms', 'email', 'backup_code']),
  body('code').isLength({ min: 4, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { tempSessionId, mfaMethod, code } = req.body;

    // Get temp session
    const tempSession = await db.query(
      `SELECT * FROM mfa_challenges 
       WHERE session_temp_id = $1 AND challenge_type = 'login_pending' 
       AND expires_at > CURRENT_TIMESTAMP`,
      [tempSessionId]
    );

    if (tempSession.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const userId = tempSession.rows[0].user_id;

    // Get user and tenant info
    const userResult = await db.query(
      'SELECT u.*, t.id as tenant_id FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id WHERE u.id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];
    const tenantId = user.tenant_id;

    let mfaValid = false;
    let mfaError = null;

    if (mfaMethod === 'totp') {
      // Verify TOTP
      const mfaConfig = await db.query(
        'SELECT * FROM mfa_methods WHERE user_id = $1 AND method_type = $2 AND is_active = true',
        [userId, 'totp']
      );

      if (mfaConfig.rows.length === 0) {
        mfaError = 'TOTP not configured';
      } else {
        const secret = decrypt(mfaConfig.rows[0].totp_secret_encrypted);
        mfaValid = speakeasy.totp.verify({
          secret,
          encoding: 'base32',
          token: code,
          window: 2 // Allow some time drift
        });
        
        if (!mfaValid) {
          mfaError = 'Invalid TOTP code';
        }
      }
    } else if (mfaMethod === 'sms' || mfaMethod === 'email') {
      // Verify challenge code
      const challenge = await db.query(
        `SELECT * FROM mfa_challenges 
         WHERE user_id = $1 AND session_temp_id = $2 AND challenge_type = $3 
         AND expires_at > CURRENT_TIMESTAMP`,
        [userId, tempSessionId, mfaMethod]
      );

      if (challenge.rows.length === 0) {
        mfaError = 'Challenge expired or not found';
      } else {
        mfaValid = await bcrypt.compare(code, challenge.rows[0].challenge_code_hash);
        if (!mfaValid) {
          mfaError = 'Invalid verification code';
        }
      }
    } else if (mfaMethod === 'backup_code') {
      // Verify backup code
      const mfaConfig = await db.query(
        'SELECT * FROM mfa_methods WHERE user_id = $1 AND method_type = $2 AND is_active = true',
        [userId, 'backup_codes']
      );

      if (mfaConfig.rows.length === 0) {
        mfaError = 'Backup codes not configured';
      } else {
        const backupCodes = JSON.parse(decrypt(mfaConfig.rows[0].backup_codes_encrypted));
        const usedCodes = mfaConfig.rows[0].backup_codes_used || [];
        
        if (backupCodes.includes(code) && !usedCodes.includes(code)) {
          mfaValid = true;
          
          // Mark backup code as used
          usedCodes.push(code);
          await db.query(
            'UPDATE mfa_methods SET backup_codes_used = $1 WHERE id = $2',
            [JSON.stringify(usedCodes), mfaConfig.rows[0].id]
          );
        } else {
          mfaError = 'Invalid or already used backup code';
        }
      }
    }

    if (!mfaValid) {
      await logAuthEvent(tenantId, userId, 'mfa_failure', 'authentication',
        mfaError, req.ip, req.get('User-Agent'), false,
        { mfaMethod, tempSessionId, error: mfaError });

      return res.status(401).json({
        success: false,
        error: mfaError || 'MFA verification failed'
      });
    }

    // MFA successful - create full session
    const session = await createAuthSession(user, tenantId, 'mfa', req);

    // Clean up temporary session
    await db.query(
      'DELETE FROM mfa_challenges WHERE session_temp_id = $1',
      [tempSessionId]
    );

    await logAuthEvent(tenantId, userId, 'mfa_success', 'authentication',
      'MFA verification successful', req.ip, req.get('User-Agent'), true,
      { mfaMethod, sessionId: session.id });

    // Update user last login
    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [userId]);

    res.json({
      success: true,
      token: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: '12h',
      user: sanitizeUser(user)
    });

  } catch (error) {
    logger.error('MFA verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during MFA verification'
    });
  }
});

/**
 * Token Management Endpoints
 */

/**
 * @swagger
 * /api/v1/helix/login/token/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Exchange refresh token for new access token
 *     tags: [Helix - Universal Login]
 */
router.post('/token/refresh', [
  body('refreshToken').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { refreshToken } = req.body;

    // Find active session with this refresh token
    const sessionResult = await db.query(
      `SELECT s.*, u.*, t.id as tenant_id FROM auth_sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN tenants t ON s.tenant_id = t.id
       WHERE s.refresh_token = $1 AND s.is_active = true 
       AND s.refresh_expires_at > CURRENT_TIMESTAMP`,
      [refreshToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }

    const session = sessionResult.rows[0];
    const user = sessionResult.rows[0];

    // Check if user is still active
    if (user.disabled) {
      await db.query('UPDATE auth_sessions SET is_active = false WHERE id = $1', [session.id]);
      return res.status(401).json({
        success: false,
        error: 'Account is disabled'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user, session.tenant_id);
    const newAccessTokenHash = crypto.createHash('sha256').update(newAccessToken).digest('hex');

    // Update session
    await db.query(
      `UPDATE auth_sessions 
       SET access_token_hash = $1, last_accessed_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newAccessTokenHash, session.id]
    );

    await logAuthEvent(session.tenant_id, user.id, 'token_refresh', 'session',
      'Access token refreshed', req.ip, req.get('User-Agent'), true,
      { sessionId: session.id });

    res.json({
      success: true,
      token: newAccessToken,
      expiresIn: '12h'
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during token refresh'
    });
  }
});

/**
 * Session Management Endpoints
 */

/**
 * @swagger
 * /api/v1/helix/login/logout:
 *   post:
 *     summary: Logout and revoke session
 *     description: Revoke current session and access tokens
 *     tags: [Helix - Universal Login]
 */
router.post('/logout', authenticateJWT, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find and deactivate session
    const sessionResult = await db.query(
      'SELECT * FROM auth_sessions WHERE access_token_hash = $1 AND is_active = true',
      [tokenHash]
    );

    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0];
      
      await db.query(
        'UPDATE auth_sessions SET is_active = false WHERE id = $1',
        [session.id]
      );

      await logAuthEvent(session.tenant_id, session.user_id, 'logout', 'session',
        'User logout', req.ip, req.get('User-Agent'), true,
        { sessionId: session.id });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during logout'
    });
  }
});

/**
 * SSO Endpoints
 */

/**
 * @swagger
 * /api/v1/helix/login/sso/initiate/{provider}:
 *   get:
 *     summary: Initiate SSO login
 *     description: Start SAML or OIDC login flow
 *     tags: [Helix - Universal Login]
 */
router.get('/sso/initiate/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { tenant, state, redirectUrl } = req.query;

    // Get SSO configuration
    const ssoConfig = await db.query(
      'SELECT * FROM sso_configs WHERE tenant_id = $1 AND provider = $2 AND enabled = true',
      [tenant, provider]
    );

    if (ssoConfig.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'SSO provider not found or not enabled'
      });
    }

    const config = ssoConfig.rows[0];
    
    if (config.provider === 'saml') {
      // TODO: Implement SAML initiation
      const samlUrl = await initiateSAMLLogin(config, state, redirectUrl);
      res.redirect(samlUrl);
    } else if (config.provider === 'oidc') {
      // TODO: Implement OIDC initiation
      const oidcUrl = await initiateOIDCLogin(config, state, redirectUrl);
      res.redirect(oidcUrl);
    } else {
      res.status(400).json({
        success: false,
        error: 'Unsupported SSO provider type'
      });
    }

  } catch (error) {
    logger.error('SSO initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during SSO initiation'
    });
  }
});

/**
 * @swagger
 * /api/v1/helix/login/sso/callback/{provider}:
 *   post:
 *     summary: Handle SSO callback
 *     description: Process SAML or OIDC response
 *     tags: [Helix - Universal Login]
 */
router.post('/sso/callback/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    
    // TODO: Implement SSO callback handling
    // This would process SAML responses or OIDC authorization codes
    // Verify the response, extract user information, and create session
    
    res.json({
      success: true,
      message: 'SSO callback handling not yet implemented'
    });

  } catch (error) {
    logger.error('SSO callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during SSO callback'
    });
  }
});

/**
 * Audit and Admin Endpoints
 */

/**
 * @swagger
 * /api/v1/helix/login/audit:
 *   get:
 *     summary: Get authentication audit logs
 *     description: Retrieve authentication events (admin only)
 *     tags: [Helix - Universal Login]
 */
router.get('/audit', authenticateJWT, async (req, res) => {
  try {
    // Check if user has admin permissions
    if (!req.user.roles || !req.user.roles.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    const { page = 1, limit = 50, eventType, userId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];
    let paramCount = 0;

    if (eventType) {
      whereClause += ` AND event_type = $${++paramCount}`;
      params.push(eventType);
    }

    if (userId) {
      whereClause += ` AND user_id = $${++paramCount}`;
      params.push(userId);
    }

    if (startDate) {
      whereClause += ` AND created_at >= $${++paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ` AND created_at <= $${++paramCount}`;
      params.push(endDate);
    }

    const logsResult = await db.query(
      `SELECT 
        l.*,
        u.email as user_email,
        u.name as user_name,
        t.name as tenant_name
       FROM auth_audit_logs l
       LEFT JOIN users u ON l.user_id = u.id
       LEFT JOIN tenants t ON l.tenant_id = t.id
       WHERE ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${++paramCount} OFFSET $${++paramCount}`,
      [...params, limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM auth_audit_logs WHERE ${whereClause}`,
      params
    );

    res.json({
      success: true,
      logs: logsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (error) {
    logger.error('Audit logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error retrieving audit logs'
    });
  }
});

// Helper Functions

async function logAuthEvent(tenantId, userId, eventType, eventCategory, description, ipAddress, userAgent, success, metadata = {}) {
  try {
    await db.query(
      `INSERT INTO auth_audit_logs (
        tenant_id, user_id, event_type, event_category, event_description,
        ip_address, user_agent, success, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [tenantId, userId, eventType, eventCategory, description, ipAddress, userAgent, success, JSON.stringify(metadata)]
    );
  } catch (error) {
    logger.error('Failed to log auth event:', error);
  }
}

async function checkRateLimit(email, ipAddress) {
  // Check both email and IP-based rate limiting
  const checks = [
    { identifier: email, type: 'email' },
    { identifier: ipAddress, type: 'ip' }
  ];

  for (const check of checks) {
    const result = await db.query(
      'SELECT * FROM login_rate_limits WHERE identifier = $1 AND identifier_type = $2',
      [check.identifier, check.type]
    );

    if (result.rows.length > 0) {
      const limit = result.rows[0];
      
      if (limit.blocked_until && new Date() < new Date(limit.blocked_until)) {
        return {
          allowed: false,
          retryAfter: Math.ceil((new Date(limit.blocked_until) - new Date()) / 1000)
        };
      }

      if (limit.attempts >= 5 && new Date() - new Date(limit.last_attempt_at) < 15 * 60 * 1000) {
        return { allowed: false, retryAfter: 900 }; // 15 minutes
      }
    }
  }

  return { allowed: true };
}

async function incrementRateLimit(email, ipAddress) {
  const identifiers = [
    { identifier: email, type: 'email' },
    { identifier: ipAddress, type: 'ip' }
  ];

  for (const check of identifiers) {
    await db.query(
      `INSERT INTO login_rate_limits (identifier, identifier_type, attempts, last_attempt_at)
       VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
       ON CONFLICT (identifier, identifier_type) 
       DO UPDATE SET 
         attempts = login_rate_limits.attempts + 1,
         last_attempt_at = CURRENT_TIMESTAMP,
         blocked_until = CASE 
           WHEN login_rate_limits.attempts >= 4 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
           ELSE NULL
         END`,
      [check.identifier, check.type]
    );
  }
}

async function createAuthSession(user, tenantId, loginMethod, req) {
  const sessionId = uuidv4();
  const accessToken = generateAccessToken(user, tenantId);
  const refreshToken = uuidv4();
  const accessTokenHash = crypto.createHash('sha256').update(accessToken).digest('hex');

  await db.query(
    `INSERT INTO auth_sessions (
      id, user_id, tenant_id, session_token, refresh_token, access_token_hash,
      ip_address, user_agent, login_method, expires_at, refresh_expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      sessionId,
      user.id,
      tenantId,
      sessionId,
      refreshToken,
      accessTokenHash,
      req.ip,
      req.get('User-Agent'),
      loginMethod,
      new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    ]
  );

  return {
    id: sessionId,
    accessToken,
    refreshToken
  };
}

function generateAccessToken(user, tenantId) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      tenantId: tenantId,
      roles: user.roles || [],
      type: 'access'
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '12h' }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    lastLogin: user.last_login,
    tenantId: user.tenant_id
  };
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  return `${local.charAt(0)}${'*'.repeat(local.length - 2)}${local.charAt(local.length - 1)}@${domain}`;
}

function maskPhoneNumber(phone) {
  return `***-***-${phone.slice(-4)}`;
}

async function getAvailableMfaMethods(userId) {
  const methods = await db.query(
    'SELECT method_type, method_name, is_primary FROM mfa_methods WHERE user_id = $1 AND is_active = true',
    [userId]
  );

  return methods.rows.map(m => ({
    type: m.method_type,
    name: m.method_name,
    primary: m.is_primary
  }));
}

async function checkTenantMfaRequirement(tenantId) {
  const result = await db.query('SELECT mfa_required FROM tenants WHERE id = $1', [tenantId]);
  return result.rows.length > 0 ? result.rows[0].mfa_required : false;
}

async function checkRiskBasedMfaRequirement(userId, req) {
  // TODO: Implement risk-based MFA logic
  // Check factors like:
  // - New device/browser
  // - Unusual location
  // - Time of access
  // - Previous login patterns
  return false;
}

async function generateSSOUrl(ssoConfig, state, redirectUrl) {
  // TODO: Implement SSO URL generation for different providers
  return `#`;
}

async function initiateSAMLLogin(config, state, redirectUrl) {
  // TODO: Implement SAML login initiation
  return `#`;
}

async function initiateOIDCLogin(config, state, redirectUrl) {
  // TODO: Implement OIDC login initiation
  return `#`;
}

export default router;
