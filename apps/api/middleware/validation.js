/**
 * Input validation middleware for Nova Universe API
 * Extend with more validators as needed.
 */
export const validateInput = {
  /**
   * Email validation and normalization
   */
  email: (req, res, next) => {
    const { email } = req.body;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format', errorCode: 'INVALID_EMAIL' });
      }
      req.body.email = email.toLowerCase().trim();
    }
    next();
  },
  /**
   * Kiosk ID validation (UUID format)
   */
  kioskId: (req, res, next) => {
    const kioskId = req.params.id || req.body.id;
    if (kioskId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(kioskId)) {
        return res.status(400).json({ error: 'Invalid kiosk ID format', errorCode: 'INVALID_KIOSK_ID' });
      }
    }
    next();
  },
  /**
   * Activation code validation (8 characters, alphanumeric, case-insensitive)
   */
  activationCode: (req, res, next) => {
    const { activationCode } = req.body;
    if (activationCode) {
      const codeRegex = /^[A-HJ-NP-Z2-9]{8}$/i;
      if (!codeRegex.test(activationCode)) {
        return res.status(400).json({ error: 'Invalid activation code format', errorCode: 'INVALID_ACTIVATION_CODE' });
      }
      req.body.activationCode = activationCode.toUpperCase();
    }
    next();
  },
  /**
   * Generic string sanitization for all string fields in req.body
   */
  sanitizeStrings: (req, res, next) => {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str.trim().replace(/[<>]/g, '');
    };
    const sanitizeObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) return obj;
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    next();
  },

  // Password strength validation
  passwordStrength: (req, res, next) => {
    const { password } = req.body;
    if (password) {
      // Add type check first
      if (typeof password !== 'string') {
        return res.status(400).json({ 
          error: 'Password must be a string',
          errorCode: 'INVALID_PASSWORD_TYPE'
        });
      }
      if (password.length < 8) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters long',
          errorCode: 'PASSWORD_TOO_SHORT'
        });
      }
      if (password.length > 128) {
        return res.status(400).json({ 
          error: 'Password must be less than 128 characters long',
          errorCode: 'PASSWORD_TOO_LONG'
        });
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return res.status(400).json({ 
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
          errorCode: 'PASSWORD_COMPLEXITY_INSUFFICIENT'
        });
      }
      
      // Check for common weak passwords
      const commonPasswords = [
        'password', 'password123', '123456', 'admin', 'qwerty', 
        'letmein', 'welcome', 'monkey', 'dragon', 'password1'
      ];
      if (commonPasswords.includes(password.toLowerCase())) {
        return res.status(400).json({ 
          error: 'Password is too common. Please choose a more secure password.',
          errorCode: 'PASSWORD_TOO_COMMON'
        });
      }
    }
    next();
  }
};

// Alternative validation functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateKioskId = (id) => {
  // Kiosk IDs should be alphanumeric with hyphens, 36 chars (UUID format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const validateActivationCode = (code) => {
  // Activation codes should be 6-8 uppercase alphanumeric characters
  return /^[A-Z0-9]{6,8}$/.test(code);
};

export const sanitizeInput = (input, maxLength = 255) => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>'"&]/g, '') // Remove HTML/JS injection chars
    .trim()
    .substring(0, maxLength);
};

export const validateKioskRegistration = (req, res, next) => {
  const { id, token } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  if (!token || token !== process.env.KIOSK_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  // Optionally sanitize inputs
  req.body.id = sanitizeInput(id, 36);
  req.body.version = sanitizeInput(req.body.version || '1.0.0', 20);

  next();
};

export const validateTicketSubmission = (req, res, next) => {
  const { name, email, title, system, urgency } = req.body;
  
  if (!name || !email || !title) {
    return res.status(400).json({ error: 'Missing required fields: name, email, title' });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Sanitize inputs
  req.body.name = sanitizeInput(name, 100);
  req.body.email = sanitizeInput(email, 100);
  req.body.title = sanitizeInput(title, 200);
  req.body.system = sanitizeInput(system, 50);
  req.body.urgency = sanitizeInput(urgency, 20);
  
  // Validate urgency level
  const validUrgencies = ['low', 'medium', 'high', 'urgent'];
  if (req.body.urgency && !validUrgencies.includes(req.body.urgency.toLowerCase())) {
    req.body.urgency = 'medium'; // Default to medium if invalid
  }
  
  next();
};

/**
 * Kiosk authentication validation middleware
 */
export const validateKioskAuth = (req, res, next) => {
  // Kiosk authentication logic
  const kioskToken = req.headers['x-kiosk-token'] || req.query.kioskToken;
  
  if (!kioskToken) {
    return res.status(401).json({ 
      error: 'Kiosk authentication required', 
      errorCode: 'MISSING_KIOSK_TOKEN' 
    });
  }

  // Basic token validation (extend as needed)
  if (kioskToken.length < 10) {
    return res.status(401).json({ 
      error: 'Invalid kiosk token', 
      errorCode: 'INVALID_KIOSK_TOKEN' 
    });
  }

  // Add kiosk info to request
  req.kiosk = {
    token: kioskToken,
    authenticated: true
  };

  next();
};

/**
 * Generic request validation middleware
 */
export const validateRequest = (req, res, next) => {
  // Generic validation logic
  const errors = [];

  // Check for common validation requirements
  if (req.body && typeof req.body !== 'object') {
    errors.push('Invalid request body format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors,
      errorCode: 'VALIDATION_FAILED' 
    });
  }

  next();
};
