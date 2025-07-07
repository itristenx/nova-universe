// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Only set HSTS if HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Content Security Policy - Removed 'unsafe-inline' for production security
  const isDevelopment = process.env.NODE_ENV === 'development';
  const csp = [
    "default-src 'self'",
    isDevelopment ? "script-src 'self' 'unsafe-inline'" : "script-src 'self'", // Allow inline scripts only in dev
    "style-src 'self' 'unsafe-inline'", // Keep for styling compatibility
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  next();
};

// Security logging middleware
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'unknown'
    };
    
    // Log security-relevant events
    if (res.statusCode >= 400) {
      console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);
    }
    
    // Log suspicious patterns
    if (req.url.includes('../') || req.url.includes('..\\')) {
      console.log(`[SECURITY] Path traversal attempt: ${JSON.stringify(logEntry)}`);
    }
    
    if (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',').length > 3) {
      console.log(`[SECURITY] Suspicious proxy chain: ${JSON.stringify(logEntry)}`);
    }
  });
  
  next();
};
