import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedResponse } from '@/types';
import {
  getApiBaseUrl,
  logDeprecationWarning,
  validateApiUsage,
  type ApiService,
} from './api-config';

// API configuration with environment-aware base URL
// In production, prefer absolute API origin via VITE_API_URL to avoid relying on a proxy.
// In development, a relative path works with Vite dev proxy.
const API_ORIGIN = (import.meta.env?.VITE_API_URL ? String(import.meta.env.VITE_API_URL) : '').replace(/\/$/, '');
const API_PREFIX = '/api';
const API_BASE_URL = API_ORIGIN; // requests should include paths like `/api/...`
const API_TIMEOUT = 30000;

// Validate API usage in development
if (process.env.NODE_ENV === 'development') {
  validateApiUsage();
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
  },
  withCredentials: true, // Enable cookies for session management
});

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling auth errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          const url = `${API_ORIGIN}${API_PREFIX}/auth/refresh`;
          const response = await axios.post(url, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          TokenManager.setTokens(accessToken, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        TokenManager.clearTokens();
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Generic API client class
class ApiClient {
  private instance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.instance = axiosInstance;
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<ApiResponse<T>>(url, config);
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
      const message = error.response?.data?.message || error.message || 'An error occurred';
      const status = error.response?.status;
      const code = error.response?.data?.code || error.code;

      return new ApiError(message, status, code, error.response?.data);
    }

    return new Error('Network error occurred');
  }
}

// Custom API Error class
export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    if (status !== undefined) this.status = status;
    if (code !== undefined) this.code = code;
    this.details = details;
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
