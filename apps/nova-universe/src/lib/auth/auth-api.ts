import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { User, ApiResponse } from '@/types'
import { safeLocalStorage } from '@/lib/utils'

class AuthApi {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000/api/v1/helix',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = safeLocalStorage().getItem('nova_token')
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      return config
    })

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          safeLocalStorage().removeItem('nova_token')
          
          // Only redirect if not already on login page
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }
        
        return Promise.reject(error)
      }
    )
  }

  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      // First, discover tenant and auth methods
      const discoveryResponse = await this.client.post('/login/tenant/discover', {
        email: email.trim(),
      })

      if (!discoveryResponse.data.success) {
        return {
          success: false,
          error: {
            code: 'DISCOVERY_FAILED',
            message: discoveryResponse.data.error?.message || 'Failed to discover user tenant',
          },
        }
      }

      const { discoveryToken, availableAuthMethods } = discoveryResponse.data.data

      // Check if password auth is available
      const passwordAuth = availableAuthMethods.find((method: any) => method.type === 'password')
      
      if (!passwordAuth) {
        return {
          success: false,
          error: {
            code: 'PASSWORD_AUTH_NOT_AVAILABLE',
            message: 'Password authentication is not available for this user',
          },
        }
      }

      // Perform authentication
      const authResponse = await this.client.post('/login/authenticate', {
        discoveryToken,
        email: email.trim(),
        authMethod: 'password',
        password,
      })

      if (!authResponse.data.success) {
        return {
          success: false,
          error: {
            code: 'AUTH_FAILED',
            message: authResponse.data.error?.message || 'Authentication failed',
          },
        }
      }

      const { token, user, requiresMFA } = authResponse.data.data

      if (requiresMFA) {
        // Handle MFA flow - for now, return error indicating MFA is required
        // In a full implementation, you'd handle the MFA challenge flow
        return {
          success: false,
          error: {
            code: 'MFA_REQUIRED',
            message: 'Multi-factor authentication is required',
          },
        }
      }

      return {
        success: true,
        data: { token, user },
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.response?.data?.error?.message || 'Network error occurred',
        },
      }
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await this.client.post('/logout')
      
      return { success: true }
    } catch (error: any) {
      // Even if logout fails on server, we should clear local state
      return {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: error.response?.data?.error?.message || 'Logout failed',
        },
      }
    }
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const response = await this.client.post('/token/refresh')
      
      if (!response.data.success) {
        return {
          success: false,
          error: {
            code: 'REFRESH_FAILED',
            message: response.data.error?.message || 'Token refresh failed',
          },
        }
      }

      return {
        success: true,
        data: response.data.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'REFRESH_ERROR',
          message: error.response?.data?.error?.message || 'Token refresh error',
        },
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.client.get('/me')
      
      if (response.data.success) {
        return response.data.data
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.put('/me', data)
      
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.response?.data?.error?.message || 'Profile update failed',
        },
      }
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post('/change-password', {
        currentPassword,
        newPassword,
      })
      
      return {
        success: response.data.success,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'PASSWORD_CHANGE_ERROR',
          message: error.response?.data?.error?.message || 'Password change failed',
        },
      }
    }
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post('/password-reset/request', {
        email: email.trim(),
      })
      
      return {
        success: response.data.success,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'RESET_REQUEST_ERROR',
          message: error.response?.data?.error?.message || 'Password reset request failed',
        },
      }
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post('/password-reset/confirm', {
        token,
        newPassword,
      })
      
      return {
        success: response.data.success,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'RESET_ERROR',
          message: error.response?.data?.error?.message || 'Password reset failed',
        },
      }
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post('/verify-email', {
        token,
      })
      
      return {
        success: response.data.success,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'VERIFICATION_ERROR',
          message: error.response?.data?.error?.message || 'Email verification failed',
        },
      }
    }
  }

  async resendVerification(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post('/resend-verification', {
        email: email.trim(),
      })
      
      return {
        success: response.data.success,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'RESEND_ERROR',
          message: error.response?.data?.error?.message || 'Resend verification failed',
        },
      }
    }
  }

  // Admin endpoints
  async getUsers(options?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{ users: User[]; total: number }>> {
    try {
      const params = new URLSearchParams()
      
      if (options?.page) params.append('page', options.page.toString())
      if (options?.limit) params.append('limit', options.limit.toString())
      if (options?.search) params.append('search', options.search)
      
      const response = await this.client.get(`/users?${params.toString()}`)
      
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.error,
        pagination: response.data.pagination,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'FETCH_USERS_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch users',
        },
      }
    }
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.post('/users', userData)
      
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'CREATE_USER_ERROR',
          message: error.response?.data?.error?.message || 'Failed to create user',
        },
      }
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.put(`/users/${userId}`, userData)
      
      return {
        success: response.data.success,
        data: response.data.data,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'UPDATE_USER_ERROR',
          message: error.response?.data?.error?.message || 'Failed to update user',
        },
      }
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.delete(`/users/${userId}`)
      
      return {
        success: response.data.success,
        error: response.data.error,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'DELETE_USER_ERROR',
          message: error.response?.data?.error?.message || 'Failed to delete user',
        },
      }
    }
  }
}

export const authApi = new AuthApi()