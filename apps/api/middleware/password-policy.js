// Password Policy Middleware for Nova Universe API
// Implements industry-standard password security requirements

import { logger } from '../logger.js';
import zxcvbn from 'zxcvbn';

/**
 * Password policy configuration following NIST guidelines
 */
const PASSWORD_POLICY = {
  minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 12,
  maxLength: 128,
  requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
  requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
  requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
  requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== 'false',
  preventCommonPasswords: true,
  preventPasswordReuse: parseInt(process.env.PASSWORD_HISTORY_COUNT) || 12,
  minStrengthScore: 3, // zxcvbn score 0-4, we require 3 (strong)
};

/**
 * Common weak passwords to explicitly reject
 */
const WEAK_PASSWORDS = [
  'password', 'password123', '123456', '123456789', 'qwerty',
  'abc123', 'password1', 'admin', 'welcome', 'letmein',
  'monkey', 'dragon', 'master', 'superman', 'batman',
  'football', 'baseball', 'princess', 'sunshine', 'iloveyou',
  'welcome123', 'admin123', 'root', 'administrator'
];

/**
 * Special characters allowed in passwords
 */
const SPECIAL_CHARS = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?~`]/;

/**
 * Validate password against policy
 * @param {string} password - Password to validate
 * @param {string} email - User email for context checking
 * @param {string} name - User name for context checking
 * @returns {Object} Validation result
 */
export function validatePassword(password, email = '', name = '') {
  const errors = [];
  const warnings = [];

  // Basic length check
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters long`);
  }

  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_POLICY.maxLength} characters`);
  }

  // Character requirements
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_POLICY.requireSpecialChars && !SPECIAL_CHARS.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  // Check for common weak passwords
  if (PASSWORD_POLICY.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (WEAK_PASSWORDS.some(weak => lowerPassword.includes(weak))) {
      errors.push('Password contains common patterns that are easily guessable');
    }
  }

  // Check for personal information in password
  if (email) {
    const emailUser = email.split('@')[0].toLowerCase();
    if (password.toLowerCase().includes(emailUser)) {
      errors.push('Password should not contain parts of your email address');
    }
  }

  if (name) {
    const nameParts = name.toLowerCase().split(/\s+/);
    for (const part of nameParts) {
      if (part.length > 2 && password.toLowerCase().includes(part)) {
        errors.push('Password should not contain parts of your name');
      }
    }
  }

  // Use zxcvbn for advanced password strength analysis
  const strengthResult = zxcvbn(password, [email, name].filter(Boolean));
  
  if (strengthResult.score < PASSWORD_POLICY.minStrengthScore) {
    errors.push(`Password is too weak. ${strengthResult.feedback.warning || 'Please choose a stronger password.'}`);
    
    if (strengthResult.feedback.suggestions && strengthResult.feedback.suggestions.length > 0) {
      warnings.push(...strengthResult.feedback.suggestions);
    }
  }

  // Check for sequential characters
  if (hasSequentialChars(password)) {
    warnings.push('Avoid sequential characters (e.g., 123, abc) for better security');
  }

  // Check for repeated characters
  if (hasRepeatedChars(password)) {
    warnings.push('Avoid repeated characters for better security');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strength: {
      score: strengthResult.score,
      label: getStrengthLabel(strengthResult.score),
      crackTimeDisplay: strengthResult.crack_times_display.offline_slow_hashing_1e4_per_second
    }
  };
}

/**
 * Get human-readable strength label
 */
function getStrengthLabel(score) {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  return labels[score] || 'Unknown';
}

/**
 * Check for sequential characters
 */
function hasSequentialChars(password) {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    'qwertyuiopasdfghjklzxcvbnm'
  ];

  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - 3; i++) {
      const subseq = sequence.substring(i, i + 3);
      if (password.toLowerCase().includes(subseq)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check for repeated characters
 */
function hasRepeatedChars(password) {
  const repeatedPattern = /(.)\1{2,}/;
  return repeatedPattern.test(password);
}

/**
 * Middleware to validate password in request body
 */
export function validatePasswordMiddleware(req, res, next) {
  const { password, email, name } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password is required',
      errorCode: 'PASSWORD_REQUIRED'
    });
  }

  const validation = validatePassword(password, email, name);

  if (!validation.isValid) {
    logger.warn('Password policy violation', {
      userId: req.user?.id,
      email: email,
      errors: validation.errors,
      ip: req.ip
    });

    return res.status(400).json({
      success: false,
      error: 'Password does not meet security requirements',
      errorCode: 'PASSWORD_POLICY_VIOLATION',
      details: validation.errors,
      warnings: validation.warnings,
      requirements: getPasswordRequirements()
    });
  }

  // Add validation result to request for potential logging
  req.passwordValidation = validation;
  next();
}

/**
 * Get password requirements for client display
 */
export function getPasswordRequirements() {
  return {
    minLength: PASSWORD_POLICY.minLength,
    maxLength: PASSWORD_POLICY.maxLength,
    requireUppercase: PASSWORD_POLICY.requireUppercase,
    requireLowercase: PASSWORD_POLICY.requireLowercase,
    requireNumbers: PASSWORD_POLICY.requireNumbers,
    requireSpecialChars: PASSWORD_POLICY.requireSpecialChars,
    minStrengthScore: PASSWORD_POLICY.minStrengthScore,
    description: `Password must be ${PASSWORD_POLICY.minLength}-${PASSWORD_POLICY.maxLength} characters long and include: uppercase letters, lowercase letters, numbers, and special characters.`
  };
}

/**
 * Check password against previous passwords for reuse prevention
 * @param {string} newPassword - New password to check
 * @param {Array} passwordHistory - Array of previous password hashes
 * @returns {boolean} True if password was previously used
 */
export async function checkPasswordReuse(newPassword, passwordHistory = []) {
  if (!PASSWORD_POLICY.preventPasswordReuse || !passwordHistory.length) {
    return false;
  }

  const bcrypt = await import('bcryptjs');
  
  // Check against recent passwords
  for (const oldPasswordHash of passwordHistory.slice(-PASSWORD_POLICY.preventPasswordReuse)) {
    if (await bcrypt.compare(newPassword, oldPasswordHash)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Route to get password requirements
 */
export function getPasswordPolicyRoute(req, res) {
  res.json({
    success: true,
    data: getPasswordRequirements()
  });
}

export default {
  validatePassword,
  validatePasswordMiddleware,
  getPasswordRequirements,
  checkPasswordReuse,
  getPasswordPolicyRoute,
  PASSWORD_POLICY
};