// Input validation middleware
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
  
  if (!id || !validateKioskId(id)) {
    return res.status(400).json({ error: 'Invalid kiosk ID format' });
  }
  
  if (!token || token !== process.env.KIOSK_TOKEN) {
    return res.status(401).json({ error: 'Invalid kiosk token' });
  }
  
  // Sanitize inputs
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
