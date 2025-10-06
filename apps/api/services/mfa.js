// Multi-Factor Authentication (MFA) Service
// Implements TOTP (Time-based One-Time Password) authentication
// Following OWASP best practices and RFC 6238

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logger } from '../logger.js';
import db from '../db.js';

/**
 * MFA Service for Two-Factor Authentication
 */
class MFAService {
  constructor() {
    this.issuer = process.env.MFA_ISSUER || 'Nova Universe';
    this.window = Number(process.env.MFA_WINDOW || 2); // Allow 2 time windows for clock drift
    this.codeLength = Number(process.env.MFA_CODE_LENGTH || 6);
  }

  /**
   * Generate a new MFA secret for a user
   * @param {string} userEmail - User's email address
   * @returns {Object} Secret and QR code data URL
   */
  async generateSecret(userEmail) {
    try {
      const secret = speakeasy.generateSecret({
        name: `${this.issuer} (${userEmail})`,
        issuer: this.issuer,
        length: 32,
      });

      // Generate QR code for mobile authenticator apps
      const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode: qrCodeDataURL,
        otpauthUrl: secret.otpauth_url,
      };
    } catch (error) {
      logger.error('Failed to generate MFA secret:', error);
      throw new Error('Failed to generate MFA secret');
    }
  }

  /**
   * Verify a TOTP code against a secret
   * @param {string} token - 6-digit code from authenticator app
   * @param {string} secret - User's MFA secret
   * @returns {boolean} Whether the token is valid
   */
  verifyToken(token, secret) {
    try {
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: this.window,
      });

      return verified;
    } catch (error) {
      logger.error('Failed to verify MFA token:', error);
      return false;
    }
  }

  /**
   * Enable MFA for a user
   * @param {number} userId - User ID
   * @param {string} secret - MFA secret
   * @param {string} token - Verification token
   * @returns {boolean} Success status
   */
  async enableMFA(userId, secret, token) {
    try {
      // Verify the token first
      if (!this.verifyToken(token, secret)) {
        throw new Error('Invalid verification code');
      }

      // Store encrypted secret in database
      await db.query(
        `UPDATE users 
         SET mfa_secret = $1, 
             mfa_enabled = true, 
             mfa_enabled_at = NOW() 
         WHERE id = $2`,
        [secret, userId]
      );

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();
      
      // Store hashed backup codes
      for (const code of backupCodes) {
        const bcrypt = await import('bcryptjs');
        const hashedCode = await bcrypt.hash(code, 10);
        await db.query(
          `INSERT INTO mfa_backup_codes (user_id, code_hash, created_at) 
           VALUES ($1, $2, NOW())`,
          [userId, hashedCode]
        );
      }

      logger.info(`MFA enabled for user ${userId}`);

      return {
        success: true,
        backupCodes,
      };
    } catch (error) {
      logger.error(`Failed to enable MFA for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Disable MFA for a user
   * @param {number} userId - User ID
   * @param {string} password - User's password for verification
   * @returns {boolean} Success status
   */
  async disableMFA(userId, password) {
    try {
      // Verify password before disabling MFA
      const user = await db.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      if (!user.rows[0]) {
        throw new Error('User not found');
      }

      const bcrypt = await import('bcryptjs');
      const validPassword = await bcrypt.compare(password, user.rows[0].password);

      if (!validPassword) {
        throw new Error('Invalid password');
      }

      // Disable MFA
      await db.query(
        `UPDATE users 
         SET mfa_secret = NULL, 
             mfa_enabled = false, 
             mfa_disabled_at = NOW() 
         WHERE id = $1`,
        [userId]
      );

      // Delete backup codes
      await db.query(
        'DELETE FROM mfa_backup_codes WHERE user_id = $1',
        [userId]
      );

      logger.info(`MFA disabled for user ${userId}`);

      return { success: true };
    } catch (error) {
      logger.error(`Failed to disable MFA for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Verify MFA during login
   * @param {number} userId - User ID
   * @param {string} token - TOTP token or backup code
   * @returns {boolean} Whether authentication succeeded
   */
  async verifyMFALogin(userId, token) {
    try {
      // Get user's MFA secret
      const result = await db.query(
        'SELECT mfa_secret, mfa_enabled FROM users WHERE id = $1',
        [userId]
      );

      const user = result.rows[0];

      if (!user || !user.mfa_enabled || !user.mfa_secret) {
        return false;
      }

      // Try TOTP verification first
      if (this.verifyToken(token, user.mfa_secret)) {
        // Log successful MFA authentication
        await db.query(
          `INSERT INTO audit_logs (user_id, action, ip_address, user_agent, created_at)
           VALUES ($1, 'mfa_success', $2, $3, NOW())`,
          [userId, 'system', 'system']
        );
        return true;
      }

      // Try backup code verification
      const backupCodeValid = await this.verifyBackupCode(userId, token);
      
      if (backupCodeValid) {
        // Log backup code usage
        await db.query(
          `INSERT INTO audit_logs (user_id, action, ip_address, user_agent, created_at)
           VALUES ($1, 'mfa_backup_code_used', $2, $3, NOW())`,
          [userId, 'system', 'system']
        );
        return true;
      }

      // Log failed MFA attempt
      await db.query(
        `INSERT INTO audit_logs (user_id, action, ip_address, user_agent, created_at)
         VALUES ($1, 'mfa_failed', $2, $3, NOW())`,
        [userId, 'system', 'system']
      );

      return false;
    } catch (error) {
      logger.error(`MFA verification failed for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Generate backup codes for account recovery
   * @returns {string[]} Array of backup codes
   */
  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      const code = Array.from({ length: 8 }, () => 
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]
      ).join('');
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verify a backup code
   * @param {number} userId - User ID
   * @param {string} code - Backup code to verify
   * @returns {boolean} Whether the code is valid
   */
  async verifyBackupCode(userId, code) {
    try {
      const result = await db.query(
        `SELECT id, code_hash FROM mfa_backup_codes 
         WHERE user_id = $1 AND used_at IS NULL`,
        [userId]
      );

      const bcrypt = await import('bcryptjs');

      for (const row of result.rows) {
        const valid = await bcrypt.compare(code, row.code_hash);
        if (valid) {
          // Mark code as used
          await db.query(
            'UPDATE mfa_backup_codes SET used_at = NOW() WHERE id = $1',
            [row.id]
          );
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error(`Failed to verify backup code for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if user has MFA enabled
   * @param {number} userId - User ID
   * @returns {boolean} Whether MFA is enabled
   */
  async isMFAEnabled(userId) {
    try {
      const result = await db.query(
        'SELECT mfa_enabled FROM users WHERE id = $1',
        [userId]
      );

      return result.rows[0]?.mfa_enabled || false;
    } catch (error) {
      logger.error(`Failed to check MFA status for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get MFA status and statistics for a user
   * @param {number} userId - User ID
   * @returns {Object} MFA status information
   */
  async getMFAStatus(userId) {
    try {
      const userResult = await db.query(
        `SELECT mfa_enabled, mfa_enabled_at, mfa_disabled_at 
         FROM users WHERE id = $1`,
        [userId]
      );

      const backupCodesResult = await db.query(
        `SELECT COUNT(*) as total,
                COUNT(CASE WHEN used_at IS NULL THEN 1 END) as unused
         FROM mfa_backup_codes 
         WHERE user_id = $1`,
        [userId]
      );

      const user = userResult.rows[0];
      const backupCodes = backupCodesResult.rows[0];

      return {
        enabled: user?.mfa_enabled || false,
        enabledAt: user?.mfa_enabled_at,
        disabledAt: user?.mfa_disabled_at,
        backupCodes: {
          total: parseInt(backupCodes?.total) || 0,
          unused: parseInt(backupCodes?.unused) || 0,
        },
      };
    } catch (error) {
      logger.error(`Failed to get MFA status for user ${userId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export default new MFAService();
