/**
 * Unified Error Handling Utilities
 * Provides consistent error handling patterns across the application
 */

export interface AppError {
  message: string;
  code: string;
  statusCode: number;
  isOperational: boolean;
  context?: Record<string, any>;
}

export class DatabaseError extends Error implements AppError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = 'DatabaseError';
    this.code = 'DB_ERROR';
    this.statusCode = 500;
    this.isOperational = true;
    this.context = context;
  }
}

export class ValidationError extends Error implements AppError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.statusCode = 400;
    this.isOperational = true;
    this.context = context;
  }
}

export class NotFoundError extends Error implements AppError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(resource: string, context?: Record<string, any>) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND';
    this.statusCode = 404;
    this.isOperational = true;
    this.context = context;
  }
}

export class AuthenticationError extends Error implements AppError {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = 'AUTH_ERROR';
    this.statusCode = 401;
    this.isOperational = true;
    this.context = context;
  }
}

/**
 * Standard error response formatter
 */
export function formatErrorResponse(error: AppError | Error, includeStack: boolean = false) {
  const isAppError = 'isOperational' in error;
  
  const response: any = {
    success: false,
    error: error.message,
    code: isAppError ? (error as AppError).code : 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };

  if (isAppError && (error as AppError).context) {
    response.context = (error as AppError).context;
  }

  if (includeStack && 'stack' in error && error.stack) {
    response.stack = error.stack;
  }

  return response;
}

/**
 * Database health check utility
 */
export interface DatabaseHealthStatus {
  healthy: boolean;
  latency?: number;
  error?: string;
  timestamp: string;
}

export async function checkDatabaseHealth(
  connection: any,
  healthQuery: string = 'SELECT 1'
): Promise<DatabaseHealthStatus> {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  try {
    await connection.raw(healthQuery);
    return {
      healthy: true,
      latency: Date.now() - start,
      timestamp
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp
    };
  }
}

/**
 * Unified logging context
 */
export interface LogContext {
  userId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
  ip?: string;
  userAgent?: string;
}

export function createLogContext(req?: any): LogContext {
  if (!req) return {};
  
  return {
    userId: req.user?.id,
    requestId: req.id || req.headers['x-request-id'],
    action: `${req.method} ${req.path}`,
    resource: req.params?.id || req.params?.resourceId,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']
  };
}
