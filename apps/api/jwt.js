import jwt from 'jsonwebtoken';

export function sign(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  // Validate secret strength (minimum 32 characters)
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(payload, secret, { 
    expiresIn,
    issuer: 'nova-universe-api',
    audience: 'nova-universe'
  });
}

export function verify(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  try {
    return jwt.verify(token, secret, {
      issuer: 'nova-universe-api',
      audience: 'nova-universe'
    });
  } catch (error) {
    // Log the specific error for debugging (but don't expose it to client)
    console.error('JWT verification failed:', error.message);
    return null;
  }
}
