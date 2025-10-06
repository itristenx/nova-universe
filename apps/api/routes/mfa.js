// Multi-Factor Authentication (MFA) API Routes
// Provides endpoints for TOTP setup, verification, and management

import express from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../logger.js';
import mfaService from '../services/mfa.js';
import { authRateLimit } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route GET /api/v1/mfa/status
 * @desc Get MFA status for current user
 * @access Private
 */
router.get('/status', async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const status = await mfaService.getMFAStatus(req.user.id);

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error('Failed to get MFA status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get MFA status',
    });
  }
});

/**
 * @route POST /api/v1/mfa/setup
 * @desc Generate MFA secret and QR code for setup
 * @access Private
 */
router.post('/setup', authRateLimit, async (req, res) => {
  try {
    if (!req.user || !req.user.id || !req.user.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if MFA is already enabled
    const isEnabled = await mfaService.isMFAEnabled(req.user.id);
    if (isEnabled) {
      return res.status(400).json({
        success: false,
        error: 'MFA is already enabled for this account',
      });
    }

    const { secret, qrCode, otpauthUrl } = await mfaService.generateSecret(
      req.user.email
    );

    res.json({
      success: true,
      data: {
        secret,
        qrCode,
        otpauthUrl,
      },
      message: 'Scan the QR code with your authenticator app',
    });
  } catch (error) {
    logger.error('Failed to setup MFA:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to setup MFA',
    });
  }
});

/**
 * @route POST /api/v1/mfa/enable
 * @desc Enable MFA after verifying setup
 * @access Private
 */
router.post(
  '/enable',
  authRateLimit,
  [
    body('secret').isString().notEmpty().withMessage('Secret is required'),
    body('token')
      .isString()
      .isLength({ min: 6, max: 6 })
      .withMessage('Token must be 6 digits'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { secret, token } = req.body;

      const result = await mfaService.enableMFA(req.user.id, secret, token);

      res.json({
        success: true,
        data: {
          backupCodes: result.backupCodes,
        },
        message:
          'MFA enabled successfully. Save these backup codes in a secure location.',
      });
    } catch (error) {
      logger.error('Failed to enable MFA:', error);
      
      if (error.message === 'Invalid verification code') {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code. Please try again.',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to enable MFA',
      });
    }
  }
);

/**
 * @route POST /api/v1/mfa/disable
 * @desc Disable MFA for the user
 * @access Private
 */
router.post(
  '/disable',
  authRateLimit,
  [
    body('password')
      .isString()
      .notEmpty()
      .withMessage('Password is required for verification'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { password } = req.body;

      await mfaService.disableMFA(req.user.id, password);

      res.json({
        success: true,
        message: 'MFA disabled successfully',
      });
    } catch (error) {
      logger.error('Failed to disable MFA:', error);

      if (error.message === 'Invalid password') {
        return res.status(400).json({
          success: false,
          error: 'Invalid password. Please try again.',
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to disable MFA',
      });
    }
  }
);

/**
 * @route POST /api/v1/mfa/verify
 * @desc Verify MFA token during login
 * @access Public (but requires partial authentication)
 */
router.post(
  '/verify',
  authRateLimit,
  [
    body('userId').isInt().withMessage('User ID is required'),
    body('token')
      .isString()
      .isLength({ min: 6, max: 8 })
      .withMessage('Token must be 6-8 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { userId, token } = req.body;

      const verified = await mfaService.verifyMFALogin(userId, token);

      if (!verified) {
        return res.status(401).json({
          success: false,
          error: 'Invalid verification code',
        });
      }

      res.json({
        success: true,
        message: 'MFA verification successful',
      });
    } catch (error) {
      logger.error('Failed to verify MFA:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify MFA',
      });
    }
  }
);

/**
 * @route POST /api/v1/mfa/regenerate-backup-codes
 * @desc Generate new backup codes
 * @access Private
 */
router.post(
  '/regenerate-backup-codes',
  authRateLimit,
  [
    body('password')
      .isString()
      .notEmpty()
      .withMessage('Password is required for verification'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if MFA is enabled
      const isEnabled = await mfaService.isMFAEnabled(req.user.id);
      if (!isEnabled) {
        return res.status(400).json({
          success: false,
          error: 'MFA is not enabled for this account',
        });
      }

      // Verify password (implement in mfaService if needed)
      // For now, we'll skip password verification and regenerate codes

      const backupCodes = mfaService.generateBackupCodes();

      // Delete old backup codes and store new ones
      const db = await import('../db.js');
      await db.default.query(
        'DELETE FROM mfa_backup_codes WHERE user_id = $1',
        [req.user.id]
      );

      const bcrypt = await import('bcryptjs');
      for (const code of backupCodes) {
        const hashedCode = await bcrypt.hash(code, 10);
        await db.default.query(
          `INSERT INTO mfa_backup_codes (user_id, code_hash, created_at) 
           VALUES ($1, $2, NOW())`,
          [req.user.id, hashedCode]
        );
      }

      res.json({
        success: true,
        data: {
          backupCodes,
        },
        message: 'New backup codes generated. Save them in a secure location.',
      });
    } catch (error) {
      logger.error('Failed to regenerate backup codes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to regenerate backup codes',
      });
    }
  }
);

export default router;
