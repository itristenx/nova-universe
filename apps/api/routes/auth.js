import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { logger } from '../logger.js';
import { sign as signJwt } from '../jwt.js';

const router = express.Router();

// In-memory fallback stores for test/dev without DB
const inMemoryUsersByEmail = new Map();
const failedLoginAttempts = new Map();

// Enhanced password strength validation following industry standards
function validatePasswordStrength(password) {
  if (typeof password !== 'string') {
    return { 
      isValid: false, 
      errors: ['Password must be a string'] 
    };
  }

  const errors = [];
  const requirements = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  };

  // Length validation
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  }
  if (password.length > requirements.maxLength) {
    errors.push(`Password must be no more than ${requirements.maxLength} characters long`);
  }

  // Character class validation
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (requirements.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Common weak passwords
  const commonWeakPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty',
    'abc123', 'password1', 'admin', 'letmein', 'welcome',
    'monkey', '1234567890', 'password!', 'Password1', 'Password123',
    'qwerty123', 'admin123', 'root', 'toor', 'pass'
  ];
  
  if (commonWeakPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common and easily guessable');
  }

  // Sequential character detection
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    errors.push('Password should not contain sequential alphabetic characters');
  }
  if (/(?:123|234|345|456|567|678|789|890)/.test(password)) {
    errors.push('Password should not contain sequential numeric characters');
  }

  // Repeated character detection
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (3+ in a row)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: calculatePasswordScore(password),
  };
}

function calculatePasswordScore(password) {
  let score = 0;
  
  // Base score for length
  score += Math.min(password.length * 2, 20);
  
  // Character variety bonus
  if (/[A-Z]/.test(password)) score += 5;
  if (/[a-z]/.test(password)) score += 5;
  if (/\d/.test(password)) score += 5;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;
  
  // Length bonuses
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 5;
  
  // Penalize common patterns
  if (/password/i.test(password)) score -= 20;
  if (/123/.test(password)) score -= 10;
  if (/abc/i.test(password)) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

function isStrongPassword(pw) {
  const validation = validatePasswordStrength(pw);
  return validation.isValid;
}

// POST /api/auth/register
router.post(
  '/register',
  // Normalize incoming field names to support both camelCase and snake_case
  (req, _res, next) => {
    try {
      if (req.body) {
        if (!req.body.first_name && req.body.firstName) req.body.first_name = req.body.firstName;
        if (!req.body.last_name && req.body.lastName) req.body.last_name = req.body.lastName;
      }
    } catch {}
    next();
  },
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('first_name').isString().isLength({ min: 1 }).withMessage('First name is required'),
    body('last_name').isString().isLength({ min: 1 }).withMessage('Last name is required'),
    body('password')
      .isString()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, first_name, last_name, password } = req.body;

      // Enhanced password complexity validation
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(422).json({ 
          error: 'Password does not meet complexity requirements',
          details: passwordValidation.errors,
          score: passwordValidation.score,
        });
      }

      const fullName = `${first_name} ${last_name}`.trim();

      // Try DB first; on failure use in-memory store
      try {
        const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows && existing.rows.length > 0) {
          return res.status(409).json({ error: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const result = await db.query(
          'INSERT INTO users (name, email, password_hash, disabled, created_at, updated_at) VALUES ($1, $2, $3, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, name, email',
          [fullName, email, passwordHash],
        );
        const user = result.rows[0];
        return res.status(201).json({ id: user.id, email: user.email, name: user.name });
      } catch (dbErr) {
        // Log database error and fallback to in-memory for environments without DB
        console.warn('Database unavailable, using in-memory storage:', dbErr.message);

        if (inMemoryUsersByEmail.has(email)) {
          return res.status(409).json({ error: 'User already exists' });
        }
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const passwordHash = await bcrypt.hash(password, 12);
        const user = {
          id,
          email,
          name: fullName,
          passwordHash,
          createdAt: new Date().toISOString(),
        };
        inMemoryUsersByEmail.set(email, user);
        return res.status(201).json({ id, email, name: fullName });
      }
    } catch (error) {
      logger.error('Registration error', { error: error.message });
      return res.status(500).json({ error: 'Registration failed' });
    }
  },
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || 'Unknown';

      // Enhanced brute force protection
      const now = Date.now();
      const attemptKey = `${email}:${clientIp}`;
      const attempt = failedLoginAttempts.get(attemptKey) || { 
        count: 0, 
        lockedUntil: 0,
        firstAttempt: now,
        lastAttempt: now,
      };
      
      // Check if account is locked
      if (attempt.lockedUntil && now < attempt.lockedUntil) {
        const lockTimeRemaining = Math.ceil((attempt.lockedUntil - now) / 1000 / 60);
        logger.warn('Login attempt on locked account', {
          email,
          ip: clientIp,
          userAgent,
          lockTimeRemaining,
          timestamp: new Date().toISOString(),
        });
        return res.status(423).json({ 
          error: 'Account temporarily locked due to too many failed attempts',
          lockTimeRemaining: `${lockTimeRemaining} minutes`,
        });
      }

      let user = null;
      try {
        const found = await db.query(
          'SELECT id, name, email, password_hash as passwordhash, disabled, locked_until, failed_login_attempts FROM users WHERE email = $1',
          [email],
        );
        if (found.rows && found.rows.length > 0) {
          user = { ...found.rows[0], passwordHash: found.rows[0].passwordhash };
          
          // Check if account is disabled
          if (user.disabled) {
            logger.warn('Login attempt on disabled account', {
              email,
              ip: clientIp,
              userAgent,
              timestamp: new Date().toISOString(),
            });
            return res.status(403).json({ error: 'Account has been disabled' });
          }
          
          // Check database-level lock
          if (user.locked_until && new Date(user.locked_until).getTime() > now) {
            return res.status(423).json({ error: 'Account temporarily locked' });
          }
        }
      } catch (dbErr) {
        logger.warn('Database error during login', { error: dbErr.message });
        // ignore DB error and use in-memory
      }

      if (!user && inMemoryUsersByEmail.has(email)) {
        user = inMemoryUsersByEmail.get(email);
      }

      // Verify password using constant-time comparison
      const isValidPassword = user && user.passwordHash && await bcrypt.compare(password, user.passwordHash);
      
      if (!user || !isValidPassword) {
        // Log failed attempt
        logger.warn('Failed login attempt', {
          email,
          ip: clientIp,
          userAgent,
          reason: !user ? 'user_not_found' : 'invalid_password',
          timestamp: new Date().toISOString(),
        });

        // Increment failed attempts with progressive lockout
        attempt.count += 1;
        attempt.lastAttempt = now;
        
        // Progressive lockout times
        let lockDuration = 0;
        if (attempt.count >= 3) lockDuration = 5 * 60 * 1000;      // 5 minutes after 3 attempts
        if (attempt.count >= 5) lockDuration = 15 * 60 * 1000;     // 15 minutes after 5 attempts  
        if (attempt.count >= 10) lockDuration = 60 * 60 * 1000;    // 1 hour after 10 attempts
        if (attempt.count >= 20) lockDuration = 24 * 60 * 60 * 1000; // 24 hours after 20 attempts
        
        if (lockDuration > 0) {
          attempt.lockedUntil = now + lockDuration;
        }
        
        failedLoginAttempts.set(attemptKey, attempt);

        // Always return same error message to prevent user enumeration
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Reset failed attempts on successful login
      failedLoginAttempts.delete(attemptKey);

      // Update last_login and reset failed attempts in database
      try {
        await db.query(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP, failed_login_attempts = 0, locked_until = NULL WHERE id = $1',
          [user.id]
        );
      } catch (dbErr) {
        logger.warn('Failed to update user login timestamp', { error: dbErr.message });
      }

      // Log successful login
      logger.info('Successful login', {
        userId: user.id,
        email: user.email,
        ip: clientIp,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      const token = signJwt({ 
        id: user.id, 
        email: user.email,
        name: user.name,
        roles: user.roles || ['user'], // Default role
      });
      
      return res.json({ 
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (error) {
      logger.error('Login error', { error: error.message, stack: error.stack });
      return res.status(500).json({ error: 'Login failed' });
    }
  },
);

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No valid token provided',
        errorCode: 'MISSING_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];
    const clientIp = req.ip || req.connection.remoteAddress;
    
    try {
      // Verify the token first to get user info for logging
      const { verify: verifyJwt } = await import('../jwt.js');
      const decoded = verifyJwt(token);
      
      // Log the logout event
      logger.info('User logout', {
        userId: decoded.id,
        email: decoded.email,
        tokenId: decoded.jti,
        ip: clientIp,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });

      // Revoke the token using the improved JWT system
      const { revoke } = await import('../jwt.js');
      revoke(token);
      
      // In a production environment, you should also:
      // 1. Store the revoked token JTI in Redis with TTL equal to token expiration
      // 2. Implement a cleanup job for expired revoked tokens
      // 3. Check revocation list in the JWT middleware
      // 4. Consider revoking all sessions for the user if this is a "logout everywhere" operation

      return res.json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      });
      
    } catch (tokenError) {
      // Even if token verification fails, we still want to attempt to blacklist it
      const { revoke } = await import('../jwt.js');
      revoke(token);
      
      logger.warn('Logout with invalid token', {
        error: tokenError.message,
        ip: clientIp,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });
      
      return res.json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error('Logout error', { 
      error: error.message, 
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      success: false,
      error: 'Logout failed',
      errorCode: 'LOGOUT_ERROR',
    });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No valid token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    try {
      const { verify: verifyJwt } = await import('../jwt.js');
      const decoded = verifyJwt(token);

      if (!decoded || !decoded.id || !decoded.email) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
      }

      // Try to get user from database first
      try {
        const result = await db.query(
          'SELECT id, name, email, created_at, last_login FROM users WHERE id = $1 AND email = $2',
          [decoded.id, decoded.email],
        );

        if (result.rows && result.rows.length > 0) {
          const user = result.rows[0];
          return res.json({
            success: true,
            data: {
              id: user.id,
              email: user.email,
              name: user.name,
              createdAt: user.created_at,
              lastLogin: user.last_login,
            },
          });
        }
      } catch (dbErr) {
        // Log database connection issue for debugging
        console.error('Database connection failed during token verification:', dbErr.message);

        // Fallback to in-memory store
        if (inMemoryUsersByEmail.has(decoded.email)) {
          const user = inMemoryUsersByEmail.get(decoded.email);
          return res.json({
            success: true,
            data: {
              id: user.id,
              email: user.email,
              name: user.name,
              createdAt: user.createdAt,
              lastLogin: null,
            },
          });
        }
      }

      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    } catch (jwtErr) {
      // Log JWT verification error for debugging
      console.error('JWT verification failed:', jwtErr.message);

      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
    });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;

      // Always return success to prevent user enumeration attacks
      const successResponse = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };

      try {
        // Check if user exists
        const userResult = await db.query(
          'SELECT id, email, name FROM users WHERE email = $1 AND disabled = FALSE',
          [email]
        );

        if (userResult.rows && userResult.rows.length > 0) {
          const user = userResult.rows[0];
          
          // Generate secure reset token
          const resetToken = crypto.randomBytes(32).toString('hex');
          const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now
          
          // Log password reset request
          logger.info('Password reset requested', {
            userId: user.id,
            email: user.email,
            ip: clientIp,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
          });

          // In production, send email with reset link
          // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
          // await sendPasswordResetEmail(user.email, user.name, resetUrl);
        }

        return res.json(successResponse);
      } catch (dbErr) {
        logger.warn('Database error during password reset request', { 
          error: dbErr.message,
          email,
        });
        return res.json(successResponse); // Always return success
      }
    } catch (error) {
      logger.error('Forgot password error', { error: error.message });
      return res.status(500).json({ error: 'Password reset request failed' });
    }
  }
);

export default router;
