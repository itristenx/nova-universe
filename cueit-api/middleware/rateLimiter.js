import rateLimit from 'express-rate-limit';

// Rate limiting configurations
export const createRateLimiter = (options = {}) => {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req, res) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    }
  };

  return rateLimit({ ...defaults, ...options });
};

// Specific rate limiters for different endpoints
export const rateLimiters = {
  // Authentication endpoints - stricter limits
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
    }
  }),

  // API endpoints - moderate limits
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }),

  // Kiosk endpoints - specific limits
  kiosk: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 kiosk requests per minute
    message: {
      error: 'Too many kiosk requests, please try again later.',
    }
  }),

  // Ticket submission - prevent spam
  ticket: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each IP to 5 ticket submissions per 5 minutes
    message: {
      error: 'Too many ticket submissions, please try again later.',
    }
  })
};

// Alternative implementation - custom rate limiting middleware
const rateLimitStore = new Map();

export const createRateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [id, data] of rateLimitStore.entries()) {
      if (data.lastRequest < windowStart) {
        rateLimitStore.delete(id);
      }
    }
    
    // Get or create client data
    const clientData = rateLimitStore.get(clientId) || { requests: [], lastRequest: now };
    
    // Filter requests within window
    clientData.requests = clientData.requests.filter(time => time > windowStart);
    
    // Check rate limit
    if (clientData.requests.length >= maxRequests) {
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
      });
      return res.status(429).json({ 
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`
      });
    }
    
    // Add current request
    clientData.requests.push(now);
    clientData.lastRequest = now;
    rateLimitStore.set(clientId, clientData);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': maxRequests - clientData.requests.length,
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });
    
    next();
  };
};

// Specific rate limiters for different endpoints
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const kioskRateLimit = createRateLimit(60 * 1000, 10); // 10 requests per minute for kiosks
