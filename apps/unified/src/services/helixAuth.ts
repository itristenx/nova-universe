import { api, apiClient } from './api'

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

export interface ProfileUpdateRequest {
  firstName?: string
  lastName?: string
  displayName?: string
  email?: string
  avatar?: string
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
    interface TenantDiscoveryApiResponse extends TenantDiscoveryResponse {
      success: boolean
      error?: string
    }

    const { data } = await api.post<TenantDiscoveryApiResponse>(`${this.baseUrl}/tenant/discover`, {
      email,
      redirectUrl,
    })

    if (!data.success) {
      throw new Error(data.error || 'Failed to discover tenant')
    }

    const { success, error, ...tenantData } = data
    return tenantData
  }

  /**
   * Authenticate user with discovered tenant and method
   */
  async authenticate(request: AuthenticationRequest): Promise<AuthenticationResponse> {
    interface AuthenticationApiResponse extends AuthenticationResponse {
      success: boolean
      error?: string
    }

    const { data } = await api.post<AuthenticationApiResponse>(`${this.baseUrl}/authenticate`, request)

    if (!data.success) {
      throw new Error(data.error || 'Authentication failed')
    }

    const { success, error, ...authData } = data

    // If we received tokens, store them
    if (authData.accessToken && authData.refreshToken) {
      localStorage.setItem('nova_access_token', authData.accessToken)
      localStorage.setItem('nova_refresh_token', authData.refreshToken)

      if (authData.expiresIn) {
        const expiry = Date.now() + authData.expiresIn * 1000
        localStorage.setItem('nova_token_expiry', expiry.toString())
      }
    }

    return authData
  }

  /**
   * Verify MFA code during login
   */
  async verifyMfa(request: MfaVerificationRequest): Promise<AuthenticationResponse> {
    interface MfaVerificationApiResponse extends AuthenticationResponse {
      success: boolean
      error?: string
      token?: string
    }

    const { data } = await api.post<MfaVerificationApiResponse>(`${this.baseUrl}/mfa/verify`, request)

    if (!data.success) {
      throw new Error(data.error || 'MFA verification failed')
    }

    const { success, error, token, ...authData } = data

    // Store tokens if authentication is complete
    const accessToken = authData.accessToken ?? token
    if (accessToken && authData.refreshToken) {
      localStorage.setItem('nova_access_token', accessToken)
      localStorage.setItem('nova_refresh_token', authData.refreshToken)

      if (authData.expiresIn) {
        const expiry = Date.now() + authData.expiresIn * 1000
        localStorage.setItem('nova_token_expiry', expiry.toString())
      }
    }

    return { ...authData, accessToken }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthenticationResponse> {
    const refreshToken = localStorage.getItem('nova_refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    interface TokenRefreshApiResponse {
      success: boolean
      token: string
      expiresIn?: string | number
      error?: string
    }

    const { data } = await api.post<TokenRefreshApiResponse>(`${this.baseUrl}/token/refresh`, {
      refreshToken,
    })

    if (!data.success) {
      throw new Error(data.error || 'Token refresh failed')
    }

    const accessToken = data.token
    localStorage.setItem('nova_access_token', accessToken)

    if (data.expiresIn) {
      let expiresInSeconds: number | undefined
      if (typeof data.expiresIn === 'string') {
        const match = data.expiresIn.match(/^(\d+)([smhd])$/)
        if (match) {
          const value = parseInt(match[1], 10)
          const unit = match[2]
          const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
          expiresInSeconds = value * (multipliers[unit] || 1)
        }
      } else {
        expiresInSeconds = data.expiresIn
      }

      if (expiresInSeconds) {
        const expiry = Date.now() + expiresInSeconds * 1000
        localStorage.setItem('nova_token_expiry', expiry.toString())
      }
    }

    return { accessToken }
  }

  /**
   * Logout user and revoke tokens
   */
  async logout(): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/logout`)
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

  async updateProfile(updates: ProfileUpdateRequest) {
    const { data } = await apiClient.patch(`${this.baseUrl}/me`, updates)
    return data
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
