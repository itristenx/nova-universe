import jwt from 'jsonwebtoken';

// Use the same secret from the API server
const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Generate a token that expires in 1 hour
const token = jwt.sign({
  userId: 'f47f5cf2-226c-4654-96a6-855a398d74a1',
  email: 'admin@example.com',
  name: 'Admin User',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
}, secret);

console.log('Fresh JWT Token:');
console.log(token);
