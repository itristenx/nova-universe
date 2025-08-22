import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { env } from '@utils/index'
import type { ApiResponse, PaginatedResponse } from '@/types'
import { getApiBaseUrl, logDeprecationWarning, validateApiUsage, type ApiService } from './api-config'

// API configuration with versioning support
const API_BASE_URL = '/api' // Use relative URL to go through Vite proxy
const API_TIMEOUT = 30000

// Validate API usage in development
if (process.env.NODE_ENV === 'development') {
  validateApiUsage()
}

// Create axios instance with enhanced configuration
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client': 'Nova-Universe-UI',
    'X-Client-Version': '2.0.0', // UI version
  },
  withCredentials: true, // Enable cookies for session management
})

// Enhanced token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'nova_access_token'
  private static readonly REFRESH_TOKEN_KEY = 'nova_refresh_token'
  private static readonly TOKEN_EXPIRY_KEY = 'nova_token_expiry'

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token)
  }

  static getTokenExpiry(): number | null {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY)
    return expiry ? parseInt(expiry, 10) : null
  }

  static setTokenExpiry(expiry: number): void {
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString())
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY)
  }

  static setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    this.setAccessToken(accessToken)
    if (refreshToken) {
      this.setRefreshToken(refreshToken)
    }
    if (expiresIn) {
      const expiry = Date.now() + (expiresIn * 1000)
      this.setTokenExpiry(expiry)
    }
  }

  static isTokenExpired(): boolean {
    const expiry = this.getTokenExpiry()
    if (!expiry) return false
    return Date.now() >= expiry
  }

  static isTokenExpiringSoon(): boolean {
    const expiry = this.getTokenExpiry()
    if (!expiry) return false
    // Return true if token expires within 5 minutes
    return Date.now() >= (expiry - 5 * 60 * 1000)
  }
}

// Request interceptor for adding auth token and request ID
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling auth errors and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = TokenManager.getRefreshToken()
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data
          TokenManager.setTokens(accessToken, newRefreshToken)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        TokenManager.clearTokens()
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Generic API client class
class ApiClient {
  private instance: AxiosInstance

  constructor(axiosInstance: AxiosInstance) {
    this.instance = axiosInstance
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async getPaginated<T = unknown>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.instance.get<PaginatedResponse<T>>(url, { params })
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async uploadFile<T = unknown>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await this.instance.post<ApiResponse<T>>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })

      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.instance.get(url, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'An error occurred'
      const status = error.response?.status
      const code = error.response?.data?.code || error.code

      return new ApiError(message, status, code, error.response?.data)
    }

    return new Error('Network error occurred')
  }
}

// Custom API Error class
export class ApiError extends Error {
  public status?: number
  public code?: string
  public details?: unknown

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    if (status !== undefined) this.status = status
    if (code !== undefined) this.code = code
    this.details = details
  }
}

// Create singleton instance
export const apiClient = new ApiClient(api)

// === VERSIONED API CLIENT METHODS ===

/**
 * Create a service-specific API client with automatic version handling
 */
export function createServiceClient(service: ApiService) {
  const baseUrl = getApiBaseUrl(service)
  
  // Log deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    logDeprecationWarning(service)
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
    
    uploadFile: <T = unknown>(endpoint: string, file: File, onProgress?: (progress: number) => void) => 
      apiClient.uploadFile<T>(`${baseUrl}${endpoint}`, file, onProgress),
    
    downloadFile: (endpoint: string, filename?: string) => 
      apiClient.downloadFile(`${baseUrl}${endpoint}`, filename),
  }
}

/**
 * Legacy method for backward compatibility
 * @deprecated Use createServiceClient instead
 */
export function getVersionedClient(version: 'v1' | 'v2' = 'v1') {
  console.warn(`getVersionedClient is deprecated. Use createServiceClient with specific service name instead.`)
  
  const baseUrl = `/api/${version}`
  
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
  }
}

// Export default instance for backward compatibility
export default apiClient