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
 * Middleware to authenticate kiosk devices using kiosk tokens
 */
export async function authenticateKioskToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Missing or invalid Authorization header', 
      errorCode: 'AUTH_HEADER_MISSING' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Check if it's a kiosk token
    const kioskToken = await db.oneOrNone(`
      SELECT kt.*, k.device_id, k.is_active, k.name as kiosk_name
      FROM kiosk_tokens kt
      JOIN kiosks k ON kt.device_id = k.device_id
      WHERE kt.token = $1 AND kt.expires_at > $2 AND k.deleted_at IS NULL
    `, [token, new Date()]);

    if (kioskToken) {
      // Verify kiosk is active
      if (!kioskToken.is_active) {
        return res.status(403).json({ 
          error: 'Kiosk is deactivated', 
          errorCode: 'KIOSK_DEACTIVATED' 
        });
      }

      // Set kiosk info in request
      req.kiosk = {
        deviceId: kioskToken.device_id,
        name: kioskToken.kiosk_name,
        token: kioskToken.token
      };
      return next();
    }

    // If not a kiosk token, fall back to regular JWT authentication
    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).json({ 
          error: 'Invalid or expired token', 
          errorCode: 'INVALID_TOKEN' 
        });
      }
      req.user = user;
      next();
    });

  } catch (error) {
    console.error('Error in kiosk authentication:', error);
    return res.status(500).json({ 
      error: 'Authentication error', 
      errorCode: 'AUTH_ERROR' 
    });
  }
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
