import express from 'express';
import digitalSignageRoutes from './src/routes/nova-tv-digital-signage.js';

const app = express();
const router = express.Router();

// Test mounting digital signage routes
console.log('Testing digital signage routes mounting...');
console.log('Digital signage routes object:', typeof digitalSignageRoutes);
console.log('Routes stack length:', digitalSignageRoutes.stack?.length || 'No stack');

try {
  router.use('/digital-signage', digitalSignageRoutes);
  console.log('✅ Digital signage routes mounted successfully');
  console.log('Router stack length after mounting:', router.stack?.length || 'No stack');
} catch (error) {
  console.error('❌ Error mounting digital signage routes:', error.message);
}

// Test the full app mounting
app.use('/api/v1/nova-tv', router);

// Start test server
const server = app.listen(3001, () => {
  console.log('🧪 Test server running on port 3001');

  // Test the endpoint
  import('node-fetch')
    .then(({ default: fetch }) => {
      return fetch('http://localhost:3001/api/v1/nova-tv/digital-signage/formats');
    })
    .then((response) => {
      console.log('Test endpoint status:', response.status);
      return response.text();
    })
    .then((text) => {
      console.log('Test endpoint response:', text.substring(0, 200));
      server.close();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test endpoint error:', error.message);
      server.close();
      process.exit(1);
    });
});
