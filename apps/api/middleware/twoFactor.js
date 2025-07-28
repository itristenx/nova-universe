// nova-api/middleware/twoFactor.js
// Nova Helix Two-Factor Authentication (2FA) System
import qrcode from 'qrcode';
import speakeasy from 'speakeasy';
import db from '../db.js';
import { logger } from '../logger.js';

/**
 * Generate 2FA secret for a user
 */
export async function generate2FASecret(user) {
  try {
    const secret = speakeasy.generateSecret({
      name: `Nova Universe (${user.email})`,
      issuer: 'Nova Universe',
      length: 32
    });

    // Store the secret in database (temporarily, until verified)
    const tempSecretId = require('uuid').v4();
    const now = new Date().toISOString();

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO user_2fa_temp (id, user_id, secret, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
        [
          tempSecretId,
          user.id,
          secret.base32,
          now,
          new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes expiry
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32,
      tempId: tempSecretId
    };
  } catch (error) {
    logger.error('Error generating 2FA secret:', error);
    throw error;
  }
}

/**
 * Verify 2FA setup with user-provided token
 */
export async function verify2FASetup(userId, tempId, token) {
  try {
    // Get temporary secret
    const tempSecret = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_2fa_temp WHERE id = ? AND user_id = ? AND expires_at > ?',
        [tempId, userId, new Date().toISOString()],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!tempSecret) {
      throw new Error('Invalid or expired setup session');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: tempSecret.secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow some time skew
    });

    if (!verified) {
      throw new Error('Invalid verification code');
    }

    // Save the verified secret permanently
    const secretId = require('uuid').v4();
    const now = new Date().toISOString();

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO user_2fa (id, user_id, secret, backup_codes, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          secretId,
          userId,
          tempSecret.secret,
          JSON.stringify(generateBackupCodes()),
          1, // enabled
          now,
          now
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Clean up temporary secret
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM user_2fa_temp WHERE id = ?', [tempId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Generate backup codes for the user
    const backupCodes = generateBackupCodes();

    // Update user to mark 2FA as enabled
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET two_factor_enabled = 1, updated_at = ? WHERE id = ?',
        [now, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    logger.info('2FA setup completed for user', { userId });

    return { backupCodes };
  } catch (error) {
    logger.error('Error verifying 2FA setup:', error);
    throw error;
  }
}

/**
 * Verify 2FA token during login
 */
export async function verify2FAToken(userId, token) {
  try {
    // Get user's 2FA secret
    const user2FA = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_2fa WHERE user_id = ? AND enabled = 1',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user2FA) {
      throw new Error('2FA not enabled for user');
    }

    // Check if it's a backup code
    const backupCodes = JSON.parse(user2FA.backup_codes || '[]');
    const backupCodeIndex = backupCodes.findIndex(code => code.code === token && !code.used);
    
    if (backupCodeIndex !== -1) {
      // Mark backup code as used
      backupCodes[backupCodeIndex].used = true;
      backupCodes[backupCodeIndex].usedAt = new Date().toISOString();

      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE user_2fa SET backup_codes = ?, updated_at = ? WHERE id = ?',
          [JSON.stringify(backupCodes), new Date().toISOString(), user2FA.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      logger.info('2FA verified using backup code', { userId });
      return { verified: true, method: 'backup_code' };
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user2FA.secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (verified) {
      logger.info('2FA verified using TOTP', { userId });
      return { verified: true, method: 'totp' };
    }

    return { verified: false };
  } catch (error) {
    logger.error('Error verifying 2FA token:', error);
    throw error;
  }
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId) {
  try {
    const now = new Date().toISOString();

    // Disable 2FA
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE user_2fa SET enabled = 0, disabled_at = ?, updated_at = ? WHERE user_id = ?',
        [now, now, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Update user record
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET two_factor_enabled = 0, updated_at = ? WHERE id = ?',
        [now, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    logger.info('2FA disabled for user', { userId });
    return true;
  } catch (error) {
    logger.error('Error disabling 2FA:', error);
    throw error;
  }
}

/**
 * Generate new backup codes
 */
export async function regenerateBackupCodes(userId) {
  try {
    const backupCodes = generateBackupCodes();
    const now = new Date().toISOString();

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE user_2fa SET backup_codes = ?, updated_at = ? WHERE user_id = ? AND enabled = 1',
        [JSON.stringify(backupCodes), now, userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    logger.info('Backup codes regenerated for user', { userId });
    return backupCodes.map(c => c.code);
  } catch (error) {
    logger.error('Error regenerating backup codes:', error);
    throw error;
  }
}

/**
 * Generate backup codes
 */
function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push({
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      used: false,
      usedAt: null
    });
  }
  return codes;
}

/**
 * Check if user has 2FA enabled
 */
export async function is2FAEnabled(userId) {
  try {
    const user2FA = await new Promise((resolve, reject) => {
      db.get(
        'SELECT enabled FROM user_2fa WHERE user_id = ? AND enabled = 1',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    return !!user2FA;
  } catch (error) {
    logger.error('Error checking 2FA status:', error);
    return false;
  }
}

/**
 * Get 2FA status and backup codes info
 */
export async function get2FAStatus(userId) {
  try {
    const user2FA = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_2fa WHERE user_id = ? AND enabled = 1',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user2FA) {
      return { enabled: false };
    }

    const backupCodes = JSON.parse(user2FA.backup_codes || '[]');
    const unusedBackupCodes = backupCodes.filter(c => !c.used).length;

    return {
      enabled: true,
      setupDate: user2FA.created_at,
      lastUsed: user2FA.last_used_at,
      backupCodesRemaining: unusedBackupCodes
    };
  } catch (error) {
    logger.error('Error getting 2FA status:', error);
    return { enabled: false };
  }
}

/**
 * Middleware to require 2FA verification
 */
export function require2FA(req, res, next) {
  // This middleware can be used to protect sensitive endpoints
  // It checks if the user has completed 2FA verification in their current session
  
  if (req.user && req.user.twoFactorVerified) {
    return next();
  }

  if (req.user && req.user.twoFactorEnabled) {
    return res.status(403).json({
      success: false,
      error: 'Two-factor authentication required',
      errorCode: '2FA_REQUIRED',
      requiresTwoFactor: true
    });
  }

  // If 2FA is not enabled, proceed
  next();
}

export default {
  generate2FASecret,
  verify2FASetup,
  verify2FAToken,
  disable2FA,
  regenerateBackupCodes,
  is2FAEnabled,
  get2FAStatus,
  require2FA
};
