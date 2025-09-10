import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Global token blacklist (in production, this should be stored in Redis or database)
export const tokenBlacklist = new Set();

export function sign(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  // Validate secret strength (minimum 64 characters for production)
  if (secret.length < 64) {
    throw new Error('JWT_SECRET must be at least 64 characters long for security');
  }

  // Check for common weak secrets (case-insensitive)
  const weakSecrets = [
    'change_me',
    'your_secret_here',
    'jwt_secret',
    'secret',
    'development_secret',
    'dev_jwt_secret',
    'test_secret',
    'replace_with_64_char_secure_random_string',
    'strong_password_here',
    'ultra_secure_jwt_secret_key_for_nova_universe_development',
  ];

  if (weakSecrets.some((weak) => secret.toLowerCase().includes(weak.toLowerCase()))) {
    throw new Error(
      'JWT_SECRET appears to be a default/weak value. Please use a cryptographically strong secret.',
    );
  }

  // Add security-focused claims
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = options.expiresIn || process.env.JWT_EXPIRES_IN || '1h';
  
  const jwtPayload = {
    ...payload,
    iat: now,
    jti: crypto.randomUUID(), // Unique token ID for revocation
    sub: payload.id?.toString(), // Subject identifier
  };

  return jwt.sign(jwtPayload, secret, {
    expiresIn,
    issuer: 'nova-universe-api',
    audience: 'nova-universe',
    algorithm: 'HS256', // Explicitly specify algorithm
    header: {
      typ: 'JWT',
      alg: 'HS256',
    },
  });
}

export function verify(token, options = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    throw new Error('Token has been revoked');
  }

  // Validate secret strength (minimum 64 characters for production)
  if (secret.length < 64) {
    throw new Error('JWT_SECRET must be at least 64 characters long for security');
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'nova-universe-api',
      audience: 'nova-universe',
      algorithms: ['HS256'], // Prevent algorithm confusion attacks
      clockTolerance: 30, // Allow 30 seconds clock skew
      ...options,
    });

    // Validate required claims
    if (!decoded.sub || !decoded.id || !decoded.email) {
      throw new Error('Token missing required claims');
    }

    // Validate token age (optional additional security check)
    const tokenAge = Date.now() / 1000 - decoded.iat;
    const maxAge = 24 * 60 * 60; // 24 hours
    if (tokenAge > maxAge) {
      throw new Error('Token too old');
    }

    return decoded;
  } catch (error) {
    // Log security events (but don't expose details to client)
    if (process.env.NODE_ENV !== 'test') {
      console.warn('JWT verification failed:', {
        error: error.message,
        token: token.substring(0, 20) + '...', // Log partial token for debugging
        timestamp: new Date().toISOString(),
      });
    }
    
    throw error;
  }
}

export function revoke(token) {
  if (token) {
    tokenBlacklist.add(token);
    
    // In production, you would also:
    // 1. Store the revoked token in Redis/database with expiration
    // 2. Clean up expired tokens periodically
    // 3. Check revocation across multiple server instances
    
    return true;
  }
  return false;
}

// Utility function to generate a secure random JWT secret
export function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}
