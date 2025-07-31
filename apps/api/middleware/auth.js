// middleware/auth.js
// Centralized authentication and authorization middleware for Nova Universe API
import db from '../db.js';
import jwt from 'jsonwebtoken';
import config from '../config/environment.js';

/**
 * Middleware to verify JWT and attach user info to req.user
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header', errorCode: 'AUTH_HEADER_MISSING' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token', errorCode: 'INVALID_TOKEN' });
    req.user = user;
    next();
  });
}

/**
 * Middleware to require a specific role (e.g., 'admin', 'superadmin')
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || !req.user.roles || !req.user.roles.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions', errorCode: 'INSUFFICIENT_PERMISSIONS' });
    }
    next();
  };
}

/**
 * Middleware to require token scopes
 */
export function requireScopes(scopes = []) {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.scopes)) {
      return res.status(403).json({ error: 'Insufficient scope', errorCode: 'INSUFFICIENT_SCOPE' });
    }
    const missing = scopes.filter(s => !req.user.scopes.includes(s));
    if (missing.length > 0) {
      return res.status(403).json({ error: 'Insufficient scope', errorCode: 'INSUFFICIENT_SCOPE' });
    }
    next();
  };
}

/**
 * Helper to issue a JWT for a user object
 */
export function issueJWT(user) {
  // You may want to include roles, permissions, etc. in the payload
  const payload = {
    id: user.id,
    email: user.email,
    roles: user.roles || [],
  };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '12h' });
}
