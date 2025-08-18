import { apiClient } from './api'
import type { ApiResponse, PaginatedResponse } from '@/types'

// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  isActive: boolean
  roles: Role[]
  permissions: string[]
  preferences: UserPreferences
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  avatarUrl?: string
  department?: string
  title?: string
  phone?: string
  location?: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
}

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  roleIds: string[]
  department?: string
  title?: string
  phone?: string
  location?: string
  isActive?: boolean
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  roleIds?: string[]
  department?: string
  title?: string
  phone?: string
  location?: string
  isActive?: boolean
}

export interface UserFilters {
  search?: string
  role?: string
  department?: string
  isActive?: boolean
  lastLoginSince?: string
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  newThisMonth: number
  byRole: Record<string, number>
  byDepartment: Record<string, number>
}

class UserService {
  /**
   * Get paginated list of users with filters
   */
  async getUsers(
    page = 1,
    limit = 20,
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
    })

    const response = await apiClient.get<PaginatedResponse<User>>(`/v1/users?${params}`)
    if (!response.data) {
      throw new Error('No data received from server')
    }
    return response.data
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/v1/users/${id}`)
    if (!response.data?.data) {
      throw new Error('User not found')
    }
    return response.data.data
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/v1/users/me')
    if (!response.data?.data) {
      throw new Error('User profile not found')
    }
    return response.data.data
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserData): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/v1/users', userData)
    if (!response.data?.data) {
      throw new Error('Failed to create user')
    }
    return response.data.data
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/v1/users/${id}`, userData)
    if (!response.data?.data) {
      throw new Error('Failed to update user')
    }
    return response.data.data
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(userData: Partial<UpdateUserData>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/v1/users/me', userData)
    if (!response.data?.data) {
      throw new Error('Failed to update profile')
    }
    return response.data.data
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/v1/users/${id}`)
  }

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(`/v1/users/${id}/activate`)
    if (!response.data?.data) {
      throw new Error('Failed to activate user')
    }
    return response.data.data
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>(`/v1/users/${id}/deactivate`)
    if (!response.data?.data) {
      throw new Error('Failed to deactivate user')
    }
    return response.data.data
  }

  /**
   * Reset user password
   */
  async resetUserPassword(id: string, newPassword?: string): Promise<{ temporaryPassword?: string }> {
    const response = await apiClient.post<ApiResponse<{ temporaryPassword?: string }>>(
      `/v1/users/${id}/reset-password`,
      { newPassword }
    )
    if (!response.data?.data) {
      throw new Error('Failed to reset password')
    }
    return response.data.data
  }

  /**
   * Get available roles
   */
  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<ApiResponse<Role[]>>('/v1/roles')
    if (!response.data?.data) {
      throw new Error('Failed to fetch roles')
    }
    return response.data.data
  }

  /**
   * Search users (lightweight)
   */
  async searchUsers(query: string, limit = 10): Promise<User[]> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    })

    const response = await apiClient.get<ApiResponse<User[]>>(`/v1/users/search?${params}`)
    if (!response.data?.data) {
      throw new Error('Failed to search users')
    }
    return response.data.data
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<ApiResponse<UserStats>>('/v1/users/stats')
    if (!response.data?.data) {
      throw new Error('Failed to fetch user statistics')
    }
    return response.data.data
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(
    userIds: string[], 
    updates: Partial<UpdateUserData>
  ): Promise<{ updated: number; failed: string[] }> {
    const response = await apiClient.post<ApiResponse<{ updated: number; failed: string[] }>>(
      '/v1/users/bulk-update',
      { userIds, updates }
    )
    if (!response.data?.data) {
      throw new Error('Failed to bulk update users')
    }
    return response.data.data
  }

  /**
   * Update user avatar
   */
  async updateUserAvatar(file: File): Promise<User> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await apiClient.post<ApiResponse<User>>('/v1/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (!response.data?.data) {
      throw new Error('Failed to update avatar')
    }
    return response.data.data
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiClient.put<ApiResponse<UserPreferences>>(
      '/v1/users/me/preferences',
      preferences
    )
    if (!response.data?.data) {
      throw new Error('Failed to update preferences')
    }
    return response.data.data
  }

  /**
   * Get user activity log
   */
  async getUserActivity(
    userId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await apiClient.get<PaginatedResponse<any>>(
      `/v1/users/${userId}/activity?${params}`
    )
    if (!response.data) {
      throw new Error('Failed to fetch user activity')
    }
    return response.data
  }
}

export const userService = new UserService()
export default userService
