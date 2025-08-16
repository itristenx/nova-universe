// Production Error Handler Middleware for Nova Universe API
// Provides comprehensive error handling, logging, and graceful degradation

import { logger } from '../logger.js';

// Error types and classifications
const ErrorTypes = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  DATABASE: 'database',
  EXTERNAL_SERVICE: 'external_service',
  RATE_LIMIT: 'rate_limit',
  INTERNAL: 'internal',
};

// Error severity levels
const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    type = ErrorTypes.INTERNAL,
    severity = ErrorSeverity.MEDIUM,
    isOperational = true,
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.type = type;
    this.severity = severity;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

// Custom error classes for different scenarios
class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, ErrorTypes.VALIDATION, ErrorSeverity.LOW);
    this.field = field;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, ErrorTypes.AUTHENTICATION, ErrorSeverity.MEDIUM);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, ErrorTypes.AUTHORIZATION, ErrorSeverity.MEDIUM);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, ErrorTypes.NOT_FOUND, ErrorSeverity.LOW);
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500, ErrorTypes.DATABASE, ErrorSeverity.HIGH);
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message = 'External service unavailable') {
    super(`${service}: ${message}`, 503, ErrorTypes.EXTERNAL_SERVICE, ErrorSeverity.MEDIUM);
    this.service = service;
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, ErrorTypes.RATE_LIMIT, ErrorSeverity.LOW);
  }
}

// Error context collector
const collectErrorContext = (req, error) => {
  return {
    url: req.originalUrl,
    method: req.method,
    headers: {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
    },
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || null,
    sessionId: req.sessionID || null,
    timestamp: new Date().toISOString(),
    errorId: generateErrorId(),
    body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  };
};

// Generate unique error ID for tracking
const generateErrorId = () => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Sanitize request body to remove sensitive data
const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

// Log error based on severity
const logError = (error, context) => {
  const logData = {
    error: {
      name: error.name,
      message: error.message,
      type: error.type || ErrorTypes.INTERNAL,
      severity: error.severity || ErrorSeverity.MEDIUM,
      statusCode: error.statusCode || 500,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    context,
  };

  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      logger.error('CRITICAL ERROR', logData);
      // In production, this would trigger immediate alerts
      break;
    case ErrorSeverity.HIGH:
      logger.error('HIGH SEVERITY ERROR', logData);
      break;
    case ErrorSeverity.MEDIUM:
      logger.warn('MEDIUM SEVERITY ERROR', logData);
      break;
    case ErrorSeverity.LOW:
      logger.info('LOW SEVERITY ERROR', logData);
      break;
    default:
      logger.error('UNKNOWN SEVERITY ERROR', logData);
  }
};

// Send error response to client
const sendErrorResponse = (res, error, context) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Base response structure
  const response = {
    error: true,
    message: error.message,
    type: error.type || ErrorTypes.INTERNAL,
    timestamp: error.timestamp || new Date().toISOString(),
    errorId: context.errorId,
  };

  // Add field-specific validation errors
  if (error instanceof ValidationError && error.field) {
    response.field = error.field;
  }

  // Add service information for external service errors
  if (error instanceof ExternalServiceError && error.service) {
    response.service = error.service;
  }

  // Include stack trace and additional details in development
  if (!isProduction) {
    response.stack = error.stack;
    response.context = context;
  }

  // For production, sanitize sensitive error messages
  if (isProduction && error.statusCode >= 500) {
    response.message = 'An internal server error occurred';

    // But provide more specific messages for known operational errors
    if (error.isOperational) {
      response.message = error.message;
    }
  }

  res.status(error.statusCode || 500).json(response);
};

// Handle specific error types
const handleDatabaseError = (error) => {
  // Prisma/Database specific error handling
  if (error.code === 'P2002') {
    return new ValidationError('A record with this data already exists');
  }
  if (error.code === 'P2025') {
    return new NotFoundError('Requested record');
  }
  if (error.code === 'P2003') {
    return new ValidationError('Referenced record does not exist');
  }

  return new DatabaseError('Database operation failed');
};

const handleJwtError = (error) => {
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token has expired');
  }
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  return new AuthenticationError('Token validation failed');
};

const handleMongoError = (error) => {
  if (error.code === 11000) {
    return new ValidationError('Duplicate data detected');
  }
  return new DatabaseError('MongoDB operation failed');
};

// Main error handling middleware
const errorHandler = (error, req, res, next) => {
  // Skip if response already sent
  if (res.headersSent) {
    return next(error);
  }

  let processedError = error;

  // Transform specific error types
  if (!error.isOperational) {
    // Handle database errors
    if (error.name?.includes('Prisma') || error.code?.startsWith('P')) {
      processedError = handleDatabaseError(error);
    }
    // Handle JWT errors
    else if (error.name?.includes('Token') || error.name === 'JsonWebTokenError') {
      processedError = handleJwtError(error);
    }
    // Handle MongoDB errors
    else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      processedError = handleMongoError(error);
    }
    // Handle validation errors from express-validator
    else if (error.name === 'ValidationError') {
      processedError = new ValidationError(error.message);
    }
    // Handle syntax errors
    else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      processedError = new ValidationError('Invalid JSON in request body');
    }
    // Default to internal server error
    else {
      processedError = new AppError(
        'An unexpected error occurred',
        500,
        ErrorTypes.INTERNAL,
        ErrorSeverity.HIGH,
        false,
      );
    }
  }

  // Collect error context
  const context = collectErrorContext(req, processedError);

  // Log the error
  logError(processedError, context);

  // Send response to client
  sendErrorResponse(res, processedError, context);
};

// Async error wrapper for route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler (should be used before error handler)
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
  next(error);
};

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Give ongoing requests time to complete
  setTimeout(() => {
    logger.info('Graceful shutdown completed');
    process.exit(0);
  }, 10000);
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });

  // In production, exit the process after logging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason:
      reason instanceof Error
        ? {
            name: reason.name,
            message: reason.message,
            stack: reason.stack,
          }
        : reason,
    promise: promise,
  });

  // In production, exit the process after logging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

export {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError,
  ErrorTypes,
  ErrorSeverity,
};
