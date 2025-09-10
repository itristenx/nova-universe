import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        role?: string;
      };
    }
  }
}

interface JWTPayload {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    // Log authentication failure for security monitoring
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`JWT authentication failed: ${errorMessage}`, {
      token: token ? `${token.substring(0, 10)}...` : 'none',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = jwt.verify(token, secret) as JWTPayload;
      req.user = decoded;
    } catch (error) {
      // Invalid token in optional auth - log for security awareness but proceed
      const errorMessage = error instanceof Error ? error.message : 'Unknown token error';
      console.debug(`Optional auth failed with invalid token: ${errorMessage}`);
    }
  }

  next();
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role && roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};
