// Rate limiting middleware
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
