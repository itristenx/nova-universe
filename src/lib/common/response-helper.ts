/**
 * Common Response Utilities
 * Consolidates duplicate response patterns across API routes
 */

import { logger } from '../../../apps/api/logger.js';

interface SuccessResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data?: any;
}

interface ErrorResponse {
  error: string;
  errorCode: string;
  timestamp: string;
  details?: any;
}

interface PaginatedResponse extends SuccessResponse {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ResponseHelper {
  /**
   * Send standardized database error response
   */
  static databaseError(res: any, error: any, message = 'Database error', statusCode = 500) {
    logger.error(`Database operation failed: ${error}`);
    return res.status(statusCode).json({
      error: message,
      errorCode: 'DB_ERROR',
      timestamp: new Date().toISOString()
    } as ErrorResponse);
  }

  /**
   * Send standardized validation error response
   */
  static validationError(res: any, errors: any, message = 'Validation failed', statusCode = 400) {
    logger.warn(`Validation error: ${errors}`);
    return res.status(statusCode).json({
      error: message,
      errorCode: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString()
    } as ErrorResponse);
  }

  /**
   * Send standardized authentication error response
   */
  static authenticationError(res: any, message = 'Authentication required', statusCode = 401) {
    logger.warn(`Authentication error: ${message}`);
    return res.status(statusCode).json({
      error: message,
      errorCode: 'AUTH_ERROR',
      timestamp: new Date().toISOString()
    } as ErrorResponse);
  }

  /**
   * Send standardized authorization error response
   */
  static authorizationError(res: any, message = 'Insufficient permissions', statusCode = 403) {
    logger.warn(`Authorization error: ${message}`);
    return res.status(statusCode).json({
      error: message,
      errorCode: 'AUTHZ_ERROR',
      timestamp: new Date().toISOString()
    } as ErrorResponse);
  }

  /**
   * Send standardized not found error response
   */
  static notFoundError(res: any, resource = 'Resource', message: string | null = null) {
    const errorMessage = message || `${resource} not found`;
    logger.info(`Resource not found: ${errorMessage}`);
    return res.status(404).json({
      error: errorMessage,
      errorCode: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    } as ErrorResponse);
  }

  /**
   * Send standardized server error response
   */
  static serverError(res: any, error: any, message = 'Internal server error', statusCode = 500) {
    logger.error(`Server error: ${error}`);
    return res.status(statusCode).json({
      error: message,
      errorCode: 'SERVER_ERROR',
      timestamp: new Date().toISOString()
    } as ErrorResponse);
  }

  /**
   * Send standardized success response
   */
  static success(res: any, data: any = null, message = 'Success', statusCode = 200) {
    const response: SuccessResponse = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send standardized created response
   */
  static created(res: any, data: any = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Send standardized updated response
   */
  static updated(res: any, data: any = null, message = 'Resource updated successfully') {
    return this.success(res, data, message, 200);
  }

  /**
   * Send standardized deleted response
   */
  static deleted(res: any, message = 'Resource deleted successfully') {
    return this.success(res, null, message, 200);
  }

  /**
   * Handle common database callback pattern
   */
  static handleDatabaseCallback(res: any, successCallback: (result: any) => any) {
    return (err: any, result: any) => {
      if (err) {
        return this.databaseError(res, err);
      }
      return successCallback(result);
    };
  }

  /**
   * Async wrapper for database operations
   */
  static async handleDatabaseOperation(res: any, operation: () => Promise<any>, successCallback: (result: any) => any) {
    try {
      const result = await operation();
      return successCallback(result);
    } catch (error) {
      return this.databaseError(res, error);
    }
  }

  /**
   * Paginated response helper
   */
  static paginated(res: any, data: any, page: number, limit: number, total: number, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(total / limit);
    
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: parseInt(String(page)),
        limit: parseInt(String(limit)),
        total: parseInt(String(total)),
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString()
    } as PaginatedResponse);
  }

  /**
   * Build filter query from request parameters
   */
  static buildFilters(req: any, allowedFields: string[] = []): Record<string, any> {
    const filters: Record<string, any> = {};
    const query = req.query || {};

    // Build WHERE conditions from query parameters
    for (const field of allowedFields) {
      if (query[field] !== undefined) {
        filters[field] = query[field];
      }
    }

    // Handle common query patterns
    if (query.search && allowedFields.includes('search')) {
      filters.search = query.search;
    }

    if (query.status && allowedFields.includes('status')) {
      filters.status = query.status;
    }

    if (query.created_after) {
      filters.created_after = query.created_after;
    }

    if (query.created_before) {
      filters.created_before = query.created_before;
    }

    return filters;
  }

  /**
   * Build sort options from request parameters
   */
  static buildSort(req: any, allowedFields: string[] = [], defaultSort = 'created_at DESC'): string {
    const { sort_by, sort_order } = req.query || {};
    
    if (!sort_by || !allowedFields.includes(sort_by)) {
      return defaultSort;
    }

    const order = sort_order && sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    return `${sort_by} ${order}`;
  }

  /**
   * Extract pagination parameters
   */
  static getPagination(req: any, defaultLimit = 20, maxLimit = 100) {
    const page = Math.max(1, parseInt(req.query?.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query?.limit) || defaultLimit));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }
}

export default ResponseHelper;
