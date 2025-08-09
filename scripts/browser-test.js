// scripts/browser-test.js
if (typeof window === 'undefined') {
  console.log('Skipping browser-only script in Node environment');
  process.exit(0);
}

console.log('🔍 Testing CueIT Authentication...');
localStorage.removeItem('auth_token');

// Additional browser-based checks can be added here
