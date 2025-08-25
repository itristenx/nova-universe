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

  // Check for common weak secrets
  const weakSecrets = [
    'change_me',
    'your_secret_here',
    'jwt_secret',
    'secret',
    'development_secret',
    'dev_jwt_secret',
    'test_secret',
    'replace_with_64_char_secure_random_string',
    'strong_password_here',
  ];

  if (weakSecrets.some((weak) => secret.toLowerCase().includes(weak))) {
    throw new Error(
      'JWT_SECRET appears to be a default/weak value. Please use a cryptographically strong secret.',
    );
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: 'nova-universe-api',
    audience: 'nova-universe',
  });
}

export function verify(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  // Validate secret strength (minimum 32 characters)
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  try {
    return jwt.verify(token, secret, {
      issuer: 'nova-universe-api',
      audience: 'nova-universe',
    });
  } catch {
    // Return null for invalid tokens without logging (handled by auth middleware)
    return null;
  }
}
