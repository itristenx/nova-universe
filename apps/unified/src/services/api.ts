import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import {
  getApiBaseUrl,
  logDeprecationWarning,
  validateApiUsage,
  type ApiService,
} from './api-config';

// Enhanced API configuration with retry logic
const API_ORIGIN = (import.meta.env?.VITE_API_URL ? String(import.meta.env.VITE_API_URL) : '').replace(/\/$/, '');
const API_PREFIX = '/api';
const API_BASE_URL = API_ORIGIN; // requests should include paths like `/api/...`
const API_TIMEOUT = 30000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // Base delay in ms

// Validate API usage in development
if (process.env.NODE_ENV === 'development') {
  validateApiUsage();
}

// Enhanced retry configuration for different request types
interface RetryConfig {
  attempts: number;
  delay: number;
  backoffFactor: number;
  retryCondition: (error: any) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: RETRY_ATTEMPTS,
  delay: RETRY_DELAY,
  backoffFactor: 2,
  retryCondition: (error) => {
    // Retry on network errors and 5xx server errors, but not on 4xx client errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  },
};

// Helper function for exponential backoff with jitter
function getRetryDelay(attempt: number, baseDelay: number, backoffFactor: number): number {
  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return exponentialDelay + jitter;
}

// Create axios instance with enhanced configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client': 'Nova-Universe-UI',
    'X-Client-Version': '2.0.0', // UI version
    'X-Request-ID': '', // Will be set per request
  },
  withCredentials: true, // Enable cookies for session management
});

// Generate unique request ID for tracing
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Enhanced token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'nova_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'nova_refresh_token';
  private static readonly TOKEN_EXPIRY_KEY = 'nova_token_expiry';
  private static useSession = false;

  // Allow auth store to switch storage type (remember me vs session)
  static setStorage(storage: 'local' | 'session') {
    const targetIsSession = storage === 'session';
    if (this.useSession === targetIsSession) return;
    const currentStorage = this.getStorage();
    const targetStorage = targetIsSession ? window.sessionStorage : window.localStorage;
    const access = currentStorage.getItem(this.ACCESS_TOKEN_KEY);
    const refresh = currentStorage.getItem(this.REFRESH_TOKEN_KEY);
    const expiry = currentStorage.getItem(this.TOKEN_EXPIRY_KEY);
    // Move tokens
    if (access) targetStorage.setItem(this.ACCESS_TOKEN_KEY, access);
    if (refresh) targetStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
    if (expiry) targetStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry);
    // Clear from previous storage
    currentStorage.removeItem(this.ACCESS_TOKEN_KEY);
    currentStorage.removeItem(this.REFRESH_TOKEN_KEY);
    currentStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    this.useSession = targetIsSession;
  }

  static getTokenKeys(): string[] {
    return [this.ACCESS_TOKEN_KEY, this.REFRESH_TOKEN_KEY, this.TOKEN_EXPIRY_KEY];
  }

  private static getStorage(): Storage {
    if (typeof window === 'undefined') return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } as unknown as Storage;
    return this.useSession ? window.sessionStorage : window.localStorage;
  }

  static getAccessToken(): string | null {
    return this.getStorage().getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    this.getStorage().setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return this.getStorage().getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    this.getStorage().setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getTokenExpiry(): number | null {
    const expiry = this.getStorage().getItem(this.TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  static setTokenExpiry(expiry: number): void {
    this.getStorage().setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
  }

  static clearTokens(): void {
    this.getStorage().removeItem(this.ACCESS_TOKEN_KEY);
    this.getStorage().removeItem(this.REFRESH_TOKEN_KEY);
    this.getStorage().removeItem(this.TOKEN_EXPIRY_KEY);
  }

  static setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
    if (expiresIn) {
      const expiry = Date.now() + expiresIn * 1000;
      this.setTokenExpiry(expiry);
    }
  }

  static isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;
    return Date.now() >= expiry;
  }

  static isTokenExpiringSoon(): boolean {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;
    // Return true if token expires within 5 minutes
    return Date.now() >= expiry - 5 * 60 * 1000;
  }
}

// Request interceptor for adding auth token and request ID
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add unique request ID for tracing
    const requestId = generateRequestId();
    config.headers['X-Request-ID'] = requestId;
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.debug(`API Request [${requestId}]:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor for handling auth errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      const requestId = response.config.headers['X-Request-ID'];
      console.debug(`API Response [${requestId}]:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const requestId = originalRequest?.headers?.['X-Request-ID'] || 'unknown';

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error [${requestId}]:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        url: originalRequest?.url,
      });
    }

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken && !TokenManager.isTokenExpired()) {
          const url = `${API_ORIGIN}${API_PREFIX}/auth/refresh`;
          const response = await axios.post(url, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data;
          TokenManager.setTokens(accessToken, newRefreshToken, expiresIn);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.warn('Token refresh failed, redirecting to login:', refreshError);
        TokenManager.clearTokens();
        
        // Only redirect if we're in a browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle rate limiting (429) with exponential backoff
    if (error.response?.status === 429 && !originalRequest._rateLimitRetry) {
      originalRequest._rateLimitRetry = true;
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

// Generic API client class with enhanced error handling and retries
class ApiClient {
  private instance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.instance = axiosInstance;
  }

  // Retry mechanism for failed requests
  private async retryRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
  ): Promise<AxiosResponse<T>> {
    let lastError: any;

    for (let attempt = 0; attempt <= retryConfig.attempts; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on the last attempt or if retry condition is not met
        if (attempt === retryConfig.attempts || !retryConfig.retryCondition(error)) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = getRetryDelay(attempt, retryConfig.delay, retryConfig.backoffFactor);
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retryConfig.attempts}):`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  async get<T = unknown>(
    url: string, 
    config?: AxiosRequestConfig,
    retryConfig?: Partial<RetryConfig>
  ): Promise<ApiResponse<T>> {
    try {
      const finalRetryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
      const response = await this.retryRequest(
        () => this.instance.get<ApiResponse<T>>(url, config),
        finalRetryConfig
      );
      return response.data;
    } catch (_error) {
      throw this.handleError(_error);
    }
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (_error) {
      throw this.handleError(_error);
    }
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (_error) {
      throw this.handleError(_error);
    }
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
      return response.data;
    } catch (_error) {
      throw this.handleError(_error);
    }
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (_error) {
      throw this.handleError(_error);
    }
  }

  async getPaginated<T = unknown>(
    url: string,
    params?: Record<string, unknown>,
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.instance.get<PaginatedResponse<T>>(url, { params });
      return response.data;
    } catch (_error) {
      throw this.handleError(_error);
    }
  }

  async uploadFile<T = unknown>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.instance.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (_error) {
      throw this.handleError(_error);
    }
  }

  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.instance.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (_error) {
      throw this.handleError(_error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data?.message || error.message || 'An error occurred';
      const code = data?.code || error.code;
      const requestId = error.config?.headers?.['X-Request-ID'];

      // Enhanced error information for different status codes
      const errorInfo: any = {
        message,
        status,
        code,
        requestId,
        timestamp: new Date().toISOString(),
      };

      // Add specific context based on status code
      switch (status) {
        case 400:
          errorInfo.userMessage = 'The request was invalid. Please check your input and try again.';
          errorInfo.details = data?.validation_errors || data?.details;
          break;
        case 401:
          errorInfo.userMessage = 'You are not authorized. Please log in and try again.';
          break;
        case 403:
          errorInfo.userMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorInfo.userMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorInfo.userMessage = 'There was a conflict with your request. The resource may have been modified.';
          break;
        case 422:
          errorInfo.userMessage = 'The data provided could not be processed.';
          errorInfo.details = data?.validation_errors || data?.details;
          break;
        case 429:
          errorInfo.userMessage = 'Too many requests. Please wait a moment before trying again.';
          errorInfo.retryAfter = error.response?.headers?.['retry-after'];
          break;
        case 500:
          errorInfo.userMessage = 'An internal server error occurred. Please try again later.';
          break;
        case 502:
        case 503:
        case 504:
          errorInfo.userMessage = 'The service is temporarily unavailable. Please try again later.';
          break;
        default:
          errorInfo.userMessage = 'An unexpected error occurred. Please try again.';
      }

      return new ApiError(message, status, code, errorInfo);
    }

    // Network or other non-HTTP errors
    return new ApiError(
      'Network error occurred',
      undefined,
      'NETWORK_ERROR',
      {
        userMessage: 'Unable to connect to the server. Please check your internet connection.',
        timestamp: new Date().toISOString(),
      }
    );
  }
}

// Enhanced Custom API Error class with industry-standard error information
export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: unknown;
  public requestId?: string;
  public timestamp?: string;
  public userMessage?: string;
  public retryAfter?: string;
  public isRetryable?: boolean;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    
    if (status !== undefined) this.status = status;
    if (code !== undefined) this.code = code;
    if (details) {
      this.details = details.details || details;
      this.requestId = details.requestId;
      this.timestamp = details.timestamp;
      this.userMessage = details.userMessage;
      this.retryAfter = details.retryAfter;
    }

    // Determine if error is retryable based on status code
    this.isRetryable = !status || status >= 500 || status === 429;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  // Get user-friendly error message
  getUserMessage(): string {
    return this.userMessage || this.message || 'An unexpected error occurred';
  }

  // Check if error indicates network connectivity issues
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || !this.status;
  }

  // Check if error indicates authentication issues
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  // Check if error indicates client-side issues (4xx)
  isClientError(): boolean {
    return this.status ? this.status >= 400 && this.status < 500 : false;
  }

  // Check if error indicates server-side issues (5xx)
  isServerError(): boolean {
    return this.status ? this.status >= 500 : false;
  }

  // Serialize error for logging
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      requestId: this.requestId,
      timestamp: this.timestamp,
      userMessage: this.userMessage,
      isRetryable: this.isRetryable,
      stack: this.stack,
    };
  }
}

// Create singleton instance
export const apiClient = new ApiClient(api);

// === VERSIONED API CLIENT METHODS ===

/**
 * Create a service-specific API client with automatic version handling
 */
export function createServiceClient(service: ApiService) {
  const baseUrl = getApiBaseUrl(service);

  // Log deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    logDeprecationWarning(service);
  }

  return {
    get: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
      apiClient.get<T>(`${baseUrl}${endpoint}`, config),

    post: <T = unknown>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.post<T>(`${baseUrl}${endpoint}`, data, config),

    put: <T = unknown>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.put<T>(`${baseUrl}${endpoint}`, data, config),

    patch: <T = unknown>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.patch<T>(`${baseUrl}${endpoint}`, data, config),

    delete: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
      apiClient.delete<T>(`${baseUrl}${endpoint}`, config),

    getPaginated: <T = unknown>(endpoint: string, params?: Record<string, unknown>) =>
      apiClient.getPaginated<T>(`${baseUrl}${endpoint}`, params),

    uploadFile: <T = unknown>(
      endpoint: string,
      file: File,
      onProgress?: (progress: number) => void,
    ) => apiClient.uploadFile<T>(`${baseUrl}${endpoint}`, file, onProgress),

    downloadFile: (endpoint: string, filename?: string) =>
      apiClient.downloadFile(`${baseUrl}${endpoint}`, filename),
  };
}

/**
 * Legacy method for backward compatibility
 * @deprecated Use createServiceClient instead
 */
export function getVersionedClient(version: 'v1' | 'v2' = 'v1') {
  console.warn(
    `getVersionedClient is deprecated. Use createServiceClient with specific service name instead.`,
  );

  const baseUrl = `/api/${version}`;

  return {
    get: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
      apiClient.get<T>(`${baseUrl}${endpoint}`, config),

    post: <T = unknown>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.post<T>(`${baseUrl}${endpoint}`, data, config),

    put: <T = unknown>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.put<T>(`${baseUrl}${endpoint}`, data, config),

    patch: <T = unknown>(endpoint: string, data?: unknown, config?: AxiosRequestConfig) =>
      apiClient.patch<T>(`${baseUrl}${endpoint}`, data, config),

    delete: <T = unknown>(endpoint: string, config?: AxiosRequestConfig) =>
      apiClient.delete<T>(`${baseUrl}${endpoint}`, config),
  };
}

// Named exports for compatibility
export { api }; // Export the axios instance for backward compatibility
export { TokenManager }; // Export TokenManager for auth service

// Export default instance for backward compatibility
export default apiClient;
