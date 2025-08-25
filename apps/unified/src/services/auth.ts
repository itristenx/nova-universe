import { apiClient, TokenManager } from './api';
import type { User } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface MagicLinkRequest {
  email: string;
  redirectUrl?: string;
}

export interface VerifyMagicLinkData {
  token: string;
}

export interface MfaSetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface MfaVerificationData {
  token: string;
  code: string;
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/v1/auth/login', credentials);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      TokenManager.setTokens(accessToken, refreshToken);
    }

    return response.data!;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/v1/auth/register', data);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      TokenManager.setTokens(accessToken, refreshToken);
    }

    return response.data!;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (_error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      TokenManager.clearTokens();
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: ResetPasswordData): Promise<void> {
    await apiClient.post('/v1/auth/password/reset', data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/v1/auth/password/reset/confirm', {
      token,
      newPassword,
    });
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await apiClient.post('/v1/auth/password/change', data);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/v1/auth/me');
    return response.data!;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>('/v1/auth/me', data);
    return response.data!;
  }

  /**
   * Request magic link login
   */
  async requestMagicLink(data: MagicLinkRequest): Promise<void> {
    await apiClient.post('/v1/auth/magic-link', data);
  }

  /**
   * Verify magic link token
   */
  async verifyMagicLink(data: VerifyMagicLinkData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/v1/auth/magic-link/verify', data);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      TokenManager.setTokens(accessToken, refreshToken);
    }

    return response.data!;
  }

  /**
   * Setup MFA for user
   */
  async setupMfa(): Promise<MfaSetupResponse> {
    const response = await apiClient.post<MfaSetupResponse>('/v1/auth/mfa/setup');
    return response.data!;
  }

  /**
   * Verify MFA setup
   */
  async verifyMfaSetup(code: string): Promise<void> {
    await apiClient.post('/v1/auth/mfa/setup/verify', { code });
  }

  /**
   * Verify MFA during login
   */
  async verifyMfa(data: MfaVerificationData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/v1/auth/mfa/verify', data);

    if (response.success && response.data) {
      const { accessToken, refreshToken } = response.data;
      TokenManager.setTokens(accessToken, refreshToken);
    }

    return response.data!;
  }

  /**
   * Disable MFA
   */
  async disableMfa(password: string): Promise<void> {
    await apiClient.post('/v1/auth/mfa/disable', { password });
  }

  /**
   * Generate new backup codes
   */
  async generateBackupCodes(): Promise<string[]> {
    const response = await apiClient.post<string[]>('/v1/auth/mfa/backup-codes');
    return response.data!;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>('/v1/auth/refresh', {
      refreshToken,
    });

    if (response.success && response.data) {
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      TokenManager.setTokens(accessToken, newRefreshToken);
    }

    return response.data!;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return TokenManager.getAccessToken() !== null;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return TokenManager.getAccessToken();
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/v1/auth/email/verify', { token });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    await apiClient.post('/v1/auth/email/resend');
  }

  /**
   * Get user sessions
   */
  async getSessions(): Promise<
    Array<{
      id: string;
      device: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>
  > {
    const response = await apiClient.get<
      Array<{
        id: string;
        device: string;
        location: string;
        lastActive: string;
        current: boolean;
      }>
    >('/v1/auth/sessions');
    return response.data!;
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/v1/auth/sessions/${sessionId}`);
  }

  /**
   * Revoke all other sessions
   */
  async revokeAllOtherSessions(): Promise<void> {
    await apiClient.post('/v1/auth/sessions/revoke-others');
  }
}

export const authService = new AuthService();
