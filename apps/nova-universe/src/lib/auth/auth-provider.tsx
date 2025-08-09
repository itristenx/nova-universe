'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, NovaModule } from '@/types'
import { authApi } from './auth-api'
import { safeLocalStorage } from '@/lib/utils'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshToken: () => Promise<boolean>
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  hasModuleAccess: (module: NovaModule) => boolean
  getCurrentModule: () => NovaModule | null
  switchModule: (module: NovaModule) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = safeLocalStorage().getItem('nova_token')
      
      if (!token) {
        setIsLoading(false)
        return
      }

      // Validate token and get user info
      const userData = await authApi.getCurrentUser()
      
      if (userData) {
        setUser(userData)
      } else {
        // Token is invalid, clear it
        safeLocalStorage().removeItem('nova_token')
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      safeLocalStorage().removeItem('nova_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const response = await authApi.login(email, password)
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data
        
        // Store token
        safeLocalStorage().setItem('nova_token', token)
        
        // Set user data
        setUser(userData)
        
        return { success: true }
      } else {
        return { 
          success: false, 
          error: response.error?.message || 'Login failed' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    safeLocalStorage().removeItem('nova_token')
    safeLocalStorage().removeItem('nova_current_module')
    router.push('/login')
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await authApi.refreshToken()
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data
        
        safeLocalStorage().setItem('nova_token', token)
        setUser(userData)
        
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.roles.some(userRole => userRole.name === role)
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    
    // Check direct permissions
    const hasDirectPermission = user.permissions.some(p => p.name === permission)
    if (hasDirectPermission) return true
    
    // Check role-based permissions
    return user.roles.some(role => 
      role.permissions.some(p => p.name === permission)
    )
  }

  const hasModuleAccess = (module: NovaModule): boolean => {
    if (!user) return false
    
    // Admin users have access to all modules
    if (hasRole('admin') || hasRole('super_admin')) return true
    
    // Check module-specific permissions
    const modulePermissions = {
      core: 'access:core',
      pulse: 'access:pulse',
      orbit: 'access:orbit',
      beacon: 'access:beacon',
      lore: 'access:lore',
      synth: 'access:synth',
    }
    
    return hasPermission(modulePermissions[module])
  }

  const getCurrentModule = (): NovaModule | null => {
    const stored = safeLocalStorage().getItem('nova_current_module') as NovaModule
    
    if (stored && hasModuleAccess(stored)) {
      return stored
    }
    
    // Default to first accessible module
    const modules: NovaModule[] = ['orbit', 'pulse', 'core', 'lore', 'beacon', 'synth']
    
    for (const module of modules) {
      if (hasModuleAccess(module)) {
        return module
      }
    }
    
    return null
  }

  const switchModule = (module: NovaModule): boolean => {
    if (!hasModuleAccess(module)) {
      return false
    }
    
    safeLocalStorage().setItem('nova_current_module', module)
    
    // Navigate to module home
    const moduleRoutes = {
      core: '/admin',
      pulse: '/pulse',
      orbit: '/portal',
      beacon: '/kiosk',
      lore: '/knowledge',
      synth: '/analytics',
    }
    
    router.push(moduleRoutes[module])
    return true
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    hasRole,
    hasPermission,
    hasModuleAccess,
    getCurrentModule,
    switchModule,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}