// Nova Sentinel - Complete Uptime Kuma Integration Service
// 1:1 Feature Parity with Enhanced Nova Universe Integration

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import winston from 'winston';

// Import Nova Sentinel modules
import { UptimeKumaAdapter } from './adapters/uptimeKumaAdapter.js';
import { HelixAuthService } from './services/helixAuthService.js';
import { NotificationService } from './services/notificationService.js';
import { StatusPageService } from './services/statusPageService.js';
import { MonitoringService } from './services/monitoringService.js';
import { AnalyticsService } from './services/analyticsService.js';
import { DatabaseService } from './services/databaseService.js';

// Import route handlers
import monitorsRoutes from './routes/monitors.js';
import statusPagesRoutes from './routes/statusPages.js';
import notificationsRoutes from './routes/notifications.js';
import maintenanceRoutes from './routes/maintenance.js';
import analyticsRoutes from './routes/analytics.js';
import webhooksRoutes from './routes/webhooks.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

// Logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Express app setup
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Configuration
const CONFIG = {
  port: process.env.SENTINEL_PORT || 3002,
  uptimeKuma: {
    url: process.env.UPTIME_KUMA_URL || 'http://localhost:3001',
    apiKey: process.env.UPTIME_KUMA_API_KEY,
    enabled: process.env.UPTIME_KUMA_ENABLED === 'true',
  },
  helix: {
    url: process.env.HELIX_URL || 'http://localhost:3000/api/v1/helix',
    apiKey: process.env.HELIX_API_KEY,
  },
  database: {
    type: process.env.DB_TYPE || 'sqlite',
    path: process.env.DB_PATH || './data/sentinel.db',
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enabled: process.env.REDIS_ENABLED === 'true',
  },
};

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws:', 'wss:'],
      },
    },
  }),
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Service instances
let services = {};

// Initialize services
async function initializeServices() {
  try {
    logger.info('Initializing Nova Sentinel services...');

    // Initialize database
    services.database = new DatabaseService(CONFIG.database);
    await services.database.initialize();

    // Initialize Helix authentication
    services.helix = new HelixAuthService(CONFIG.helix);
    await services.helix.initialize();

    // Initialize Uptime Kuma adapter
    services.uptimeKuma = new UptimeKumaAdapter(CONFIG.uptimeKuma);
    await services.uptimeKuma.initialize();

    // Initialize core services
    services.monitoring = new MonitoringService(services.database, services.uptimeKuma);
    services.notifications = new NotificationService(services.database);
    services.statusPages = new StatusPageService(services.database);
    services.analytics = new AnalyticsService(services.database);

    // Initialize all services
    await Promise.all([
      services.monitoring.initialize(),
      services.notifications.initialize(),
      services.statusPages.initialize(),
      services.analytics.initialize(),
    ]);

    logger.info('All Nova Sentinel services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Authentication middleware
async function authenticateRequest(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required',
      });
    }

    const user = await services.helix.validateToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

// Global middleware for services
app.use((req, res, next) => {
  req.services = services;
  req.io = io;
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: (await services.database?.healthCheck()) || false,
        uptimeKuma: (await services.uptimeKuma?.healthCheck()) || false,
        helix: (await services.helix?.healthCheck()) || false,
      },
    };

    // Check overall health
    const servicesHealthy = Object.values(health.services).every((status) => status === true);
    if (!servicesHealthy) {
      health.status = 'degraded';
    }

    res.json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    service: 'Nova Sentinel',
    version: '1.0.0',
    description: 'Complete Uptime Kuma Integration with 1:1 Feature Parity',
    features: [
      'HTTP, TCP, Ping, DNS, Push monitoring',
      'SSL certificate monitoring',
      'Status pages and dashboards',
      'Real-time notifications',
      'Maintenance windows',
      'Analytics and reporting',
      'Helix authentication integration',
      'WebSocket real-time updates',
    ],
    endpoints: {
      monitors: '/api/v1/monitors',
      statusPages: '/api/v1/status-pages',
      notifications: '/api/v1/notifications',
      maintenance: '/api/v1/maintenance',
      analytics: '/api/v1/analytics',
      webhooks: '/api/v1/webhooks',
      settings: '/api/v1/settings',
    },
  });
});

// API Routes with authentication
app.use('/api/v1/monitors', authenticateRequest, monitorsRoutes);
app.use('/api/v1/status-pages', statusPagesRoutes); // Public access for status pages
app.use('/api/v1/notifications', authenticateRequest, notificationsRoutes);
app.use('/api/v1/maintenance', authenticateRequest, maintenanceRoutes);
app.use('/api/v1/analytics', authenticateRequest, analyticsRoutes);
app.use('/api/v1/webhooks', webhooksRoutes); // No auth for webhook endpoints
app.use('/api/v1/settings', authenticateRequest, settingsRoutes);

// WebSocket connection handling
io.on('connection', async (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Authenticate WebSocket connection
  socket.on('authenticate', async (token) => {
    try {
      const user = await services.helix.validateToken(token);
      if (user) {
        socket.user = user;
        socket.join(`user_${user.id}`);
        socket.join(`tenant_${user.tenantId}`);
        socket.emit('authenticated', { success: true, user: user });
        logger.info(`Socket authenticated for user: ${user.id}`);
      } else {
        socket.emit('authentication_error', { error: 'Invalid token' });
        socket.disconnect();
      }
    } catch (error) {
      logger.error('Socket authentication error:', error);
      socket.emit('authentication_error', { error: 'Authentication failed' });
      socket.disconnect();
    }
  });

  // Handle monitor subscription
  socket.on('subscribe_monitors', (monitorIds) => {
    if (socket.user) {
      monitorIds.forEach((id) => {
        socket.join(`monitor_${id}`);
      });
      socket.emit('subscription_confirmed', { monitors: monitorIds });
    }
  });

  // Handle status page subscription
  socket.on('subscribe_status_page', (statusPageId) => {
    socket.join(`status_page_${statusPageId}`);
    socket.emit('status_page_subscribed', { statusPageId });
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Start monitoring loops
async function startBackgroundServices() {
  // Start monitor checking loop
  setInterval(async () => {
    try {
      await services.monitoring.runMonitorChecks();
    } catch (error) {
      logger.error('Monitor check loop error:', error);
    }
  }, 30000); // Check every 30 seconds

  // Start status page updates
  setInterval(async () => {
    try {
      await services.statusPages.updateAllStatusPages();
    } catch (error) {
      logger.error('Status page update error:', error);
    }
  }, 60000); // Update every minute

  // Start analytics collection
  setInterval(async () => {
    try {
      await services.analytics.collectMetrics();
    } catch (error) {
      logger.error('Analytics collection error:', error);
    }
  }, 300000); // Collect every 5 minutes
}

// Global error handlers
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  // Close server
  server.close(() => {
    logger.info('Server closed');
  });

  // Close database connections
  if (services.database) {
    await services.database.close();
  }

  process.exit(0);
});

// Start the server
async function startServer() {
  try {
    await initializeServices();

    server.listen(CONFIG.port, () => {
      logger.info(`🌌 Nova Sentinel running on port ${CONFIG.port}`);
      logger.info(`📊 Health check: http://localhost:${CONFIG.port}/health`);
      logger.info(`📖 API docs: http://localhost:${CONFIG.port}/api-docs`);
      logger.info(`🔗 Uptime Kuma: ${CONFIG.uptimeKuma.enabled ? 'Connected' : 'Disabled'}`);
      logger.info(`🔐 Helix Auth: ${CONFIG.helix.url}`);
    });

    // Start background services
    await startBackgroundServices();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Export for testing
export { app, server, io, services };

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
