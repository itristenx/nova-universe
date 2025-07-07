// Input validation middleware
export const validateInput = {
  // Email validation
  email: (req, res, next) => {
    const { email } = req.body;
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      // Sanitize email
      req.body.email = email.toLowerCase().trim();
    }
    next();
  },

  // Kiosk ID validation (UUID format)
  kioskId: (req, res, next) => {
    const kioskId = req.params.id || req.body.id;
    if (kioskId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(kioskId)) {
        return res.status(400).json({ error: 'Invalid kiosk ID format' });
      }
    }
    next();
  },

  // Activation code validation (8 characters, alphanumeric)
  activationCode: (req, res, next) => {
    const { activationCode } = req.body;
    if (activationCode) {
      const codeRegex = /^[A-HJ-NP-Z2-9]{8}$/; // Excluding confusing characters
      if (!codeRegex.test(activationCode)) {
        return res.status(400).json({ error: 'Invalid activation code format' });
      }
      // Normalize to uppercase
      req.body.activationCode = activationCode.toUpperCase();
    }
    next();
  },

  // Generic string sanitization
  sanitizeStrings: (req, res, next) => {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      return str.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
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
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return res.status(400).json({ 
          error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
        });
      }
    }
    next();
  }
};
