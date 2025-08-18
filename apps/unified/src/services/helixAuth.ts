import { apiClient } from './api'

export interface TenantDiscoveryRequest {
  email: string
  redirectUrl?: string
}

export interface TenantDiscoveryResponse {
  tenant: {
    id: string
    name: string
    domain: string
  }
  authMethods: Array<{
    type: 'password' | 'sso' | 'passkey'
    provider?: string
    name: string
    primary: boolean
  }>
  branding: {
    logo?: string
    themeColor?: string
    backgroundImage?: string
    loginMessage?: string
    organizationName?: string
  }
  userExists: boolean
  mfaRequired: boolean
  discoveryToken: string
}

export interface AuthenticationRequest {
  discoveryToken: string
  email: string
  password?: string
  authMethod: 'password' | 'sso' | 'passkey'
  ssoProvider?: string
  rememberMe?: boolean
  redirectUrl?: string
}

export interface AuthenticationResponse {
  success: boolean
  requiresMFA?: boolean
  tempSessionId?: string
  availableMfaMethods?: Array<{
    type: string
    name: string
    primary: boolean
  }>
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    tenantId: string
  }
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  redirectUrl?: string
  state?: string
}

export interface MfaVerificationRequest {
  tempSessionId: string
  mfaMethod: 'totp' | 'sms' | 'email' | 'backup_code'
  code: string
  rememberDevice?: boolean
}

export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Nova Helix Universal Login Service
 * Integrates with the Nova Helix authentication system for tenant discovery,
 * multi-factor authentication, and SSO login flows
 */
class HelixAuthService {
  private readonly baseUrl = '/v1/helix/login'

  /**
   * Discover tenant and available authentication methods by email
   */
  async discoverTenant(email: string, redirectUrl?: string): Promise<TenantDiscoveryResponse> {
    const response = await apiClient.post<TenantDiscoveryResponse>(`${this.baseUrl}/tenant/discover`, {
      email,
      redirectUrl,
    })

    if (!response.success || !response.data) {
      throw new Error('Failed to discover tenant')
    }

    return response.data
  }

  /**
   * Authenticate user with discovered tenant and method
   */
  async authenticate(request: AuthenticationRequest): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(`${this.baseUrl}/authenticate`, request)

    if (!response.success || !response.data) {
      throw new Error('Authentication failed')
    }

    const authData = response.data

    // If we received tokens, store them
    if (authData.accessToken && authData.refreshToken) {
      localStorage.setItem('nova_access_token', authData.accessToken)
      localStorage.setItem('nova_refresh_token', authData.refreshToken)
      
      if (authData.expiresIn) {
        const expiry = Date.now() + (authData.expiresIn * 1000)
        localStorage.setItem('nova_token_expiry', expiry.toString())
      }
    }

    return authData
  }

  /**
   * Verify MFA code during login
   */
  async verifyMfa(request: MfaVerificationRequest): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(`${this.baseUrl}/mfa/verify`, request)

    if (!response.success || !response.data) {
      throw new Error('MFA verification failed')
    }

    const authData = response.data

    // Store tokens if authentication is complete
    if (authData.token && authData.refreshToken) {
      localStorage.setItem('nova_access_token', authData.token)
      localStorage.setItem('nova_refresh_token', authData.refreshToken)
      
      if (authData.expiresIn) {
        const expiry = Date.now() + (authData.expiresIn * 1000)
        localStorage.setItem('nova_token_expiry', expiry.toString())
      }
    }

    return authData
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthenticationResponse> {
    const refreshToken = localStorage.getItem('nova_refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiClient.post<AuthenticationResponse>(`${this.baseUrl}/token/refresh`, {
      refreshToken,
    })

    if (!response.success || !response.data) {
      throw new Error('Token refresh failed')
    }

    const authData = response.data

    // Update stored tokens
    if (authData.accessToken && authData.refreshToken) {
      localStorage.setItem('nova_access_token', authData.accessToken)
      localStorage.setItem('nova_refresh_token', authData.refreshToken)
      
      if (authData.expiresIn) {
        const expiry = Date.now() + (authData.expiresIn * 1000)
        localStorage.setItem('nova_token_expiry', expiry.toString())
      }
    }

    return authData
  }

  /**
   * Logout user and revoke tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/logout`)
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error)
    } finally {
      // Clear stored tokens
      localStorage.removeItem('nova_access_token')
      localStorage.removeItem('nova_refresh_token')
      localStorage.removeItem('nova_token_expiry')
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/password/reset`, { email })
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/password/reset/confirm`, {
      token,
      newPassword,
    })
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/password/change`, {
      currentPassword,
      newPassword,
    })
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    const response = await apiClient.get(`${this.baseUrl}/me`)
    return response.data
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('nova_access_token')
    const expiry = localStorage.getItem('nova_token_expiry')
    
    if (!token) return false
    if (!expiry) return true
    
    return Date.now() < parseInt(expiry, 10)
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('nova_access_token')
  }

  /**
   * Get available SSO providers for a tenant
   */
  async getSSOProviders(tenantId: string): Promise<Array<{
    provider: string
    name: string
    loginUrl: string
  }>> {
    const response = await apiClient.get<Array<{
      provider: string
      name: string
      loginUrl: string
    }>>(`${this.baseUrl}/sso/providers/${tenantId}`)
    return response.data || []
  }

  /**
   * Initiate SSO login flow
   */
  async initiateSSOLogin(provider: string, state?: string): Promise<{ redirectUrl: string }> {
    const response = await apiClient.get<{ redirectUrl: string }>(`${this.baseUrl}/sso/initiate/${provider}`, {
      params: { state },
    })
    
    if (!response.success || !response.data) {
      throw new Error('Failed to initiate SSO login')
    }
    
    return response.data
  }

  /**
   * Handle SSO callback
   */
  async handleSSOCallback(provider: string, code: string, state?: string): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(`${this.baseUrl}/sso/callback/${provider}`, {
      code,
      state,
    })

    if (!response.success || !response.data) {
      throw new Error('SSO callback failed')
    }

    const authData = response.data

    // Store tokens if authentication is complete
    if (authData.accessToken && authData.refreshToken) {
      localStorage.setItem('nova_access_token', authData.accessToken)
      localStorage.setItem('nova_refresh_token', authData.refreshToken)
      
      if (authData.expiresIn) {
        const expiry = Date.now() + (authData.expiresIn * 1000)
        localStorage.setItem('nova_token_expiry', expiry.toString())
      }
    }

    return authData
  }

  /**
   * Get audit logs for current user
   */
  async getAuditLogs(limit: number = 50, offset: number = 0) {
    const response = await apiClient.get(`${this.baseUrl}/audit`, {
      params: { limit, offset },
    })
    return response.data
  }

  /**
   * Get user sessions
   */
  async getSessions() {
    const response = await apiClient.get(`${this.baseUrl}/sessions`)
    return response.data
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/sessions/${sessionId}`)
  }

  /**
   * Revoke all other sessions
   */
  async revokeAllOtherSessions(): Promise<void> {
    await apiClient.post(`${this.baseUrl}/sessions/revoke-others`)
  }
}

export const helixAuthService = new HelixAuthService()
