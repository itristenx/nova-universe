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
        // Implement SMS sending via configured SMS provider
        try {
          const maskedPhone = maskPhoneNumber(decrypt(config.phone_number_encrypted));
          
          // Send SMS using configured provider (Twilio, AWS SNS, etc.)
          if (process.env.SMS_PROVIDER === 'twilio' && process.env.TWILIO_ACCOUNT_SID) {
            const twilio = require('twilio')(
              process.env.TWILIO_ACCOUNT_SID,
              process.env.TWILIO_AUTH_TOKEN
            );
            
            await twilio.messages.create({
              body: `Your Nova Universe verification code is: ${challengeCode}. This code expires in 5 minutes.`,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: decrypt(config.phone_number_encrypted)
            });
            
            logger.info(`SMS verification code sent to ${maskedPhone} for user ${userId}`);
          } else {
            // Mock SMS sending for development
            logger.info(`[DEV] SMS verification code ${challengeCode} would be sent to ${maskedPhone}`);
          }
          
          challengeResponse.message = 'Verification code sent to your phone';
          challengeResponse.maskedPhone = maskedPhone;
        } catch (smsError) {
          logger.error('SMS sending failed:', smsError);
          challengeResponse.message = 'Failed to send SMS verification code';
          challengeResponse.error = 'SMS delivery failed';
        }
      } else if (mfaMethod === 'email') {
        // Implement email sending via configured email provider
        try {
          const maskedEmail = maskEmail(decrypt(config.email_address_encrypted));
          const userEmail = decrypt(config.email_address_encrypted);
          
          // Send email using nodemailer or configured provider
          const nodemailer = require('nodemailer');
          
          // Use configured SMTP settings
          const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'localhost',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          });
          
          const emailTemplate = `
            <html>
              <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #3B82F6; color: white; padding: 20px; text-align: center;">
                  <h1>Nova Universe</h1>
                  <h2>Verification Code</h2>
                </div>
                <div style="padding: 20px;">
                  <p>Your verification code is:</p>
                  <div style="background: #F3F4F6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
                    ${challengeCode}
                  </div>
                  <p>This code will expire in 5 minutes for security purposes.</p>
                  <p>If you did not request this code, please contact your system administrator immediately.</p>
                </div>
                <div style="background: #F9FAFB; padding: 20px; text-align: center; font-size: 12px; color: #6B7280;">
                  <p>This is an automated message from Nova Universe Support System.</p>
                </div>
              </body>
            </html>
          `;
          
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@nova-universe.com',
            to: userEmail,
            subject: 'Nova Universe - Verification Code',
            html: emailTemplate
          });
          
          logger.info(`Email verification code sent to ${maskedEmail} for user ${userId}`);
          challengeResponse.message = 'Verification code sent to your email';
          challengeResponse.maskedEmail = maskedEmail;
        } catch (emailError) {
          logger.error('Email sending failed:', emailError);
          challengeResponse.message = 'Failed to send email verification code';
          challengeResponse.error = 'Email delivery failed';
        }
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
      const samlUrl = await initiateSAMLLogin(config, state, redirectUrl);
      logger.info('SAML login initiated', { provider: config.name, state });
      res.redirect(samlUrl);
    } else if (config.provider === 'oidc') {
      const oidcUrl = await initiateOIDCLogin(config, state, redirectUrl);
      logger.info('OIDC login initiated', { provider: config.name, state });
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
    const { state } = req.body;
    
    logger.info('SSO callback received', { provider, state });

    // Verify state parameter to prevent CSRF attacks
    const stateData = await verifyStateParameter(state);
    if (!stateData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired state parameter'
      });
    }

    let userProfile;
    
    if (provider === 'saml') {
      userProfile = await processSAMLResponse(req.body);
    } else if (provider === 'oidc') {
      userProfile = await processOIDCResponse(req.body);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported SSO provider'
      });
    }

    if (!userProfile || !userProfile.email) {
      return res.status(400).json({
        success: false,
        error: 'Invalid SSO response - missing user profile'
      });
    }

    // Find or create user based on SSO profile
    const user = await findOrCreateSSOUser(userProfile, stateData.tenantId);
    
    if (!user) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create or retrieve user account'
      });
    }

    // Generate session token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tenantId: user.tenant_id,
        roles: user.roles || [],
        sessionId: crypto.randomUUID()
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful SSO authentication
    await logAuthEvent(
      user.tenant_id,
      user.id,
      'sso_login',
      'authentication',
      `SSO login via ${provider}`,
      req.ip,
      req.headers['user-agent'],
      true,
      { provider, ssoUserId: userProfile.nameID || userProfile.sub }
    );

    // Clean up state
    await cleanupStateParameter(state);

    // Redirect to original URL or default dashboard
    const redirectUrl = stateData.redirectUrl || '/dashboard';
    const finalUrl = `${redirectUrl}?token=${token}&sso=success`;
    
    res.redirect(finalUrl);

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
  try {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const currentTime = new Date();
    
    // Check for new device/browser fingerprint
    const deviceFingerprint = crypto.createHash('sha256')
      .update(userAgent + req.headers['accept-language'] + req.headers['accept-encoding'])
      .digest('hex');
    
    // Get recent login history for risk analysis
    const recentLogins = await db.query(
      `SELECT ip_address, user_agent, created_at, metadata
       FROM auth_audit_logs 
       WHERE user_id = $1 AND event_type = 'login_success' 
       AND created_at > NOW() - INTERVAL '30 days'
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

    let riskScore = 0;

    // Factor 1: New IP address (30% of risk score)
    const knownIps = recentLogins.rows.map(login => login.ip_address);
    if (!knownIps.includes(ipAddress)) {
      riskScore += 30;
      logger.info('Risk factor: New IP address', { userId, ipAddress });
    }

    // Factor 2: New device/browser (25% of risk score)
    const knownFingerprints = recentLogins.rows
      .map(login => {
        try {
          return login.metadata ? JSON.parse(login.metadata).deviceFingerprint : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    
    if (!knownFingerprints.includes(deviceFingerprint)) {
      riskScore += 25;
      logger.info('Risk factor: New device/browser', { userId, deviceFingerprint });
    }

    // Factor 3: Unusual time of access (20% of risk score)
    const hour = currentTime.getHours();
    const userLogins = recentLogins.rows.map(login => new Date(login.created_at).getHours());
    const avgHour = userLogins.length > 0 ? userLogins.reduce((a, b) => a + b, 0) / userLogins.length : 12;
    
    if (Math.abs(hour - avgHour) > 6) {
      riskScore += 20;
      logger.info('Risk factor: Unusual time', { userId, hour, avgHour });
    }

    // Factor 4: High frequency of failed attempts (25% of risk score)
    const recentFailures = await db.query(
      `SELECT COUNT(*) as count
       FROM auth_audit_logs 
       WHERE (user_id = $1 OR ip_address = $2) 
       AND event_type = 'login_failure' 
       AND created_at > NOW() - INTERVAL '1 hour'`,
      [userId, ipAddress]
    );

    if (parseInt(recentFailures.rows[0].count) > 3) {
      riskScore += 25;
      logger.info('Risk factor: Recent failures', { userId, failures: recentFailures.rows[0].count });
    }

    logger.info('Risk assessment completed', { userId, riskScore });

    // Require MFA if risk score > 50
    return riskScore > 50;

  } catch (error) {
    logger.error('Risk assessment error:', error);
    // Default to requiring MFA on error for security
    return true;
  }
}

async function initiateSAMLLogin(config, state, redirectUrl) {
  try {
    const { SamlStrategy } = await import('@node-saml/passport-saml');
    
    const samlConfig = {
      entryPoint: config.metadata.entryPoint || config.metadata.sso_url,
      issuer: config.metadata.issuer || process.env.SAML_ISSUER,
      callbackUrl: config.metadata.callbackUrl || `${process.env.API_BASE_URL}/api/v1/helix/login/sso/callback/saml`,
      cert: config.metadata.cert,
      identifierFormat: config.metadata.identifierFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      acceptedClockSkewMs: 5000,
      authnContext: ['urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport'],
      forceAuthn: false,
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: true,
      signatureAlgorithm: 'sha256',
      digestAlgorithm: 'sha256'
    };

    const strategy = new SamlStrategy(samlConfig, () => {});
    
    // Generate SAML request URL
    const requestUrl = await new Promise((resolve, reject) => {
      strategy.authenticate(
        { 
          query: { RelayState: state },
          method: 'GET' 
        },
        (err, user, info) => {
          if (err) return reject(err);
          if (info && info.redirectUrl) {
            resolve(info.redirectUrl);
          } else {
            reject(new Error('Failed to generate SAML request URL'));
          }
        }
      );
    });

    return requestUrl;
  } catch (error) {
    logger.error('SAML initiation error:', error);
    throw new Error('Failed to initiate SAML login');
  }
}

async function initiateOIDCLogin(config, state, redirectUrl) {
  try {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.metadata.client_id,
      redirect_uri: config.metadata.redirect_uri || `${process.env.API_BASE_URL}/api/v1/helix/login/sso/callback/oidc`,
      scope: config.metadata.scope || 'openid profile email',
      state: state,
      nonce: crypto.randomUUID()
    });

    // Add optional parameters
    if (config.metadata.prompt) {
      params.append('prompt', config.metadata.prompt);
    }
    
    if (config.metadata.max_age) {
      params.append('max_age', config.metadata.max_age);
    }

    if (config.metadata.ui_locales) {
      params.append('ui_locales', config.metadata.ui_locales);
    }

    const authUrl = config.metadata.authorization_endpoint || config.metadata.auth_url;
    if (!authUrl) {
      throw new Error('Missing OIDC authorization endpoint');
    }

    const fullUrl = `${authUrl}?${params.toString()}`;
    
    logger.info('OIDC login URL generated', { 
      provider: config.name,
      client_id: config.metadata.client_id,
      state 
    });

    return fullUrl;
  } catch (error) {
    logger.error('OIDC initiation error:', error);
    throw new Error('Failed to initiate OIDC login');
  }
}

async function processSAMLResponse(requestBody) {
  try {
    const { SamlStrategy } = await import('@node-saml/passport-saml');
    
    // This would typically be configured based on the specific SAML provider
    // For now, we'll extract user information from the SAML response
    const samlResponse = requestBody.SAMLResponse;
    if (!samlResponse) {
      throw new Error('Missing SAML response');
    }

    // Decode and parse SAML response (simplified implementation)
    const decodedResponse = Buffer.from(samlResponse, 'base64').toString('utf8');
    
    // Extract user profile information from SAML assertion
    // This is a simplified parser - in production, use proper SAML library parsing
    const emailMatch = decodedResponse.match(/<saml:Attribute Name="http:\/\/schemas\.xmlsoap\.org\/ws\/2005\/05\/identity\/claims\/emailaddress"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>(.*?)<\/saml:AttributeValue>/i);
    const nameMatch = decodedResponse.match(/<saml:Attribute Name="http:\/\/schemas\.xmlsoap\.org\/ws\/2005\/05\/identity\/claims\/name"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>(.*?)<\/saml:AttributeValue>/i);
    const nameIdMatch = decodedResponse.match(/<saml:NameID[^>]*>(.*?)<\/saml:NameID>/i);

    return {
      nameID: nameIdMatch ? nameIdMatch[1] : null,
      email: emailMatch ? emailMatch[1] : (nameIdMatch ? nameIdMatch[1] : null),
      name: nameMatch ? nameMatch[1] : null,
      provider: 'saml'
    };
  } catch (error) {
    logger.error('SAML response processing error:', error);
    throw new Error('Failed to process SAML response');
  }
}

async function processOIDCResponse(requestBody) {
  try {
    const { code, state } = requestBody;
    
    if (!code) {
      throw new Error('Missing authorization code');
    }

    // Get the OIDC configuration for token exchange
    const stateData = await verifyStateParameter(state);
    if (!stateData) {
      throw new Error('Invalid state parameter');
    }

    const ssoConfig = await db.query(
      'SELECT * FROM sso_configurations WHERE tenant_id = $1 AND provider = $2 AND active = true',
      [stateData.tenantId, 'oidc']
    );

    if (ssoConfig.rows.length === 0) {
      throw new Error('OIDC configuration not found');
    }

    const config = ssoConfig.rows[0];

    // Exchange authorization code for access token
    const tokenResponse = await fetch(config.metadata.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.metadata.redirect_uri,
        client_id: config.metadata.client_id,
        client_secret: config.metadata.client_secret
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();

    // Get user info from userinfo endpoint
    const userInfoResponse = await fetch(config.metadata.userinfo_endpoint, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Accept': 'application/json'
      }
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo = await userInfoResponse.json();

    return {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || userInfo.given_name + ' ' + userInfo.family_name,
      provider: 'oidc',
      accessToken: tokens.access_token,
      idToken: tokens.id_token
    };
  } catch (error) {
    logger.error('OIDC response processing error:', error);
    throw new Error('Failed to process OIDC response');
  }
}

async function findOrCreateSSOUser(userProfile, tenantId) {
  try {
    // First, try to find existing user by email
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1 AND tenant_id = $2',
      [userProfile.email, tenantId]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      
      // Update last login and SSO information
      await db.query(
        `UPDATE users 
         SET last_login = NOW(), 
             sso_provider = $1, 
             sso_user_id = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [userProfile.provider, userProfile.nameID || userProfile.sub, user.id]
      );

      return user;
    }

    // Create new user from SSO profile
    const newUser = await db.query(
      `INSERT INTO users (
        tenant_id, email, name, sso_provider, sso_user_id, 
        verified, created_at, updated_at, last_login
      ) VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW(), NOW())
      RETURNING *`,
      [
        tenantId,
        userProfile.email,
        userProfile.name || userProfile.email,
        userProfile.provider,
        userProfile.nameID || userProfile.sub
      ]
    );

    // Assign default roles for SSO users
    await db.query(
      'INSERT INTO user_roles (user_id, role_id) SELECT $1, id FROM roles WHERE name = $2 AND tenant_id = $3',
      [newUser.rows[0].id, 'user', tenantId]
    );

    logger.info('New SSO user created', { 
      userId: newUser.rows[0].id, 
      email: userProfile.email,
      provider: userProfile.provider 
    });

    return newUser.rows[0];
  } catch (error) {
    logger.error('Error finding/creating SSO user:', error);
    throw new Error('Failed to process SSO user');
  }
}

async function verifyStateParameter(state) {
  try {
    if (!state) return null;

    const stateResult = await db.query(
      'SELECT * FROM auth_states WHERE state = $1 AND expires_at > NOW()',
      [state]
    );

    if (stateResult.rows.length === 0) {
      return null;
    }

    return stateResult.rows[0];
  } catch (error) {
    logger.error('State verification error:', error);
    return null;
  }
}

async function cleanupStateParameter(state) {
  try {
    await db.query('DELETE FROM auth_states WHERE state = $1', [state]);
  } catch (error) {
    logger.error('State cleanup error:', error);
  }
}

export default router;
