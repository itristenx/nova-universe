// Test digital signage mounting
console.log('Testing digital signage import...');

import digitalSignageRoutes from './src/routes/nova-tv-digital-signage.js';
import novaTVRoutes from './src/routes/nova-tv.js';

console.log('✅ Digital signage routes imported:', digitalSignageRoutes.stack?.length || 'Unknown', 'routes');
console.log('✅ Nova TV routes imported:', novaTVRoutes.stack?.length || 'Unknown', 'routes');

// Check if digital signage routes are mounted in nova-tv
const stack = novaTVRoutes.stack || [];
const dsRoute = stack.find(layer => {
  return layer.regexp && (layer.regexp.source.includes('digital-signage') || layer.name === 'router');
});
console.log('Digital signage route found:', !!dsRoute);

// List all nova-tv routes
stack.forEach((layer, i) => {
  if (layer.route) {
    console.log(`Route ${i}: ${Object.keys(layer.route.methods)} ${layer.route.path}`);
  } else if (layer.name === 'router') {
    console.log(`Route ${i}: mounted router at ${layer.regexp}`);
  }
});
