import express from 'express';
import cors from 'cors';
import enhancedMonitoringRoutes from './routes/enhanced-monitoring';
import synthAiRoutes from './routes/synth-ai';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'nova-enhanced-monitoring-api'
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
    role: 'admin'
  });
});

// Enhanced monitoring API routes
app.use('/api/enhanced-monitoring', enhancedMonitoringRoutes);

// Synth AI integration routes
app.use('/api/synth', synthAiRoutes);

// Error handling middleware
app.use((err: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Nova Enhanced Monitoring API running on port ${PORT}`);
  console.log(`📊 Enhanced monitoring endpoints available at /api/enhanced-monitoring`);
  console.log(`🧠 Synth AI endpoints available at /api/synth`);
});

export default app;
