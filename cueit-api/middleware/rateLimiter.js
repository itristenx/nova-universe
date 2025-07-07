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
