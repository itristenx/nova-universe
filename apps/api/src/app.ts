import express from 'express';
import cors from 'cors';
import { logger } from '../logger.js';
import enhancedMonitoringRoutes from './routes/enhanced-monitoring.js';
import synthAiRoutes from './routes/synth-ai.js';
import novaTvRoutes from './routes/nova-tv.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'nova-enhanced-monitoring-api',
  });
});

// Authentication endpoint (stub)
app.post('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Mock user data for development
  res.json({
    id: 'user-1',
    email: 'admin@nova.com',
    name: 'Nova Admin',
    role: 'admin',
  });
});

// Enhanced monitoring API routes
app.use('/api/enhanced-monitoring', enhancedMonitoringRoutes);

// Synth AI integration routes
app.use('/api/synth', synthAiRoutes);

// Nova TV digital signage routes
app.use('/api/nova-tv', novaTvRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`API Error: ${err.message}`);

  if (err.message?.includes('entity.parse.failed')) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`🚀 Nova Enhanced Monitoring API running on port ${PORT}`);
  logger.info(`📊 Enhanced monitoring endpoints available at /api/enhanced-monitoring`);
  logger.info(`🧠 Synth AI endpoints available at /api/synth`);
  logger.info(`📺 Nova TV digital signage endpoints available at /api/nova-tv`);
});

export default app;
