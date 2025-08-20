import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { helixAuthService } from '@services/helixAuth'
import type { User } from '@/types'

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  loginWithHelix: (data: {
    discoveryToken: string
    email: string
    password: string
    rememberMe?: boolean
  }) => Promise<void>
  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    confirmPassword: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

// Helper function to convert Helix user data to our User type
function mapHelixUserToUser(helixUser: {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  tenantId: string
}): User {
  return {
    id: helixUser.id,
    email: helixUser.email,
    firstName: helixUser.firstName,
    lastName: helixUser.lastName,
    displayName: `${helixUser.firstName} ${helixUser.lastName}`,
    roles: [{
      id: helixUser.role,
      name: helixUser.role,
      description: `${helixUser.role} role`,
      permissions: [], // Would be populated based on role
    }],
    permissions: [], // Would be populated based on role
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    preferences: {
      theme: 'system' as const,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        email: true,
        push: true,
        slack: false,
        sms: false,
        inApp: true,
        frequency: 'immediate' as const,
      },
      dashboard: {
        layout: 'grid' as const,
        widgets: [],
        refreshInterval: 30000,
      },
    },
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Legacy login action for backward compatibility
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null })
        
        try {
          // First discover tenant
          const discovery = await helixAuthService.discoverTenant(email)
          
          // Then authenticate
          const response = await helixAuthService.authenticate({
            discoveryToken: discovery.discoveryToken,
            email,
            password,
            authMethod: 'password',
            rememberMe: rememberMe || false,
          })
          
          if (response.user) {
            set({
              user: mapHelixUserToUser(response.user),
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error('No user data returned')
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          })
          throw error
        }
      },

      // Helix-specific login action
      loginWithHelix: async (data) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await helixAuthService.authenticate({
            discoveryToken: data.discoveryToken,
            email: data.email,
            password: data.password,
            authMethod: 'password',
            rememberMe: data.rememberMe || false,
          })
          
          if (response.user) {
            set({
              user: mapHelixUserToUser(response.user),
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error('No user data returned')
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          })
          throw error
        }
      },

      // Register action - Note: Registration might not be available in Helix
      register: async () => {
        set({ isLoading: true, error: null })
        
        try {
          // In Nova Helix, registration is typically handled by administrators
          // This would need to be adapted based on your specific setup
          throw new Error('Self-registration is not available. Please contact your administrator.')
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          })
          throw error
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true })
        
        try {
          await helixAuthService.logout()
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        }
      },

      // Refresh user data
      refreshUser: async () => {
        if (!helixAuthService.isAuthenticated()) {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          })
          return
        }

        set({ isLoading: true, error: null })
        
        try {
          const userData = await helixAuthService.getCurrentUser()
          
          // Map the user data if it's in Helix format
          let user: User
          if (userData && typeof userData === 'object' && 'id' in userData) {
            user = mapHelixUserToUser(userData as any)
          } else {
            throw new Error('Invalid user data format')
          }
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to refresh user data',
          })
        }
      },

      // Update profile
      updateProfile: async (updates?: Partial<User>) => {
        set({ isLoading: true, error: null })

        try {
          const updated = await helixAuthService.updateProfile(updates || {})
          set(state => ({
            user: state.user ? { ...state.user, ...(updated as any) } : updated,
            isLoading: false,
            error: null
          }))
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to update profile'
          })
          throw error
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'nova-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)