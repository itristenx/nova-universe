/**
 * Health check endpoint for Nova Comms
 */

import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'nova-comms',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

const port = process.env.HEALTH_PORT || 3002;
app.listen(port, () => {
  console.log(`Health check server running on port ${port}`);
});

export default app;