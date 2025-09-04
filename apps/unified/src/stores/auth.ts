import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { helixAuthService } from '@services/helixAuth';
import { apiClient, TokenManager } from '@services/api';
import { userService } from '@services/users';
import type { User, UserRole, Permission, UserPreferences } from '@/types';

// Helper types for Helix integration
interface HelixUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

interface HelixAuthData {
  discoveryToken: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithHelix: (data: HelixAuthData) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// Helper function to map userService User to application User type
function mapUserServiceToAppUser(serviceUser: any): User {
  return {
    id: serviceUser.id,
    email: serviceUser.email,
    firstName: serviceUser.firstName,
    lastName: serviceUser.lastName,
    displayName: serviceUser.displayName,
    avatar: serviceUser.avatarUrl,
    roles: serviceUser.roles.map((role: any): UserRole => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((perm: string): Permission => ({
        id: perm,
        name: perm,
        resource: 'general',
        action: perm,
      })),
    })),
    permissions: serviceUser.permissions.map((perm: string): Permission => ({
      id: perm,
      name: perm,
      resource: 'general',
      action: perm,
    })),
    isActive: serviceUser.isActive,
    lastLoginAt: serviceUser.lastLoginAt,
    createdAt: serviceUser.createdAt,
    updatedAt: serviceUser.updatedAt,
    preferences: {
      theme: serviceUser.preferences.theme,
      language: serviceUser.preferences.language,
      timezone: serviceUser.preferences.timezone,
      notifications: {
        email: serviceUser.preferences.notifications.email,
        push: serviceUser.preferences.notifications.push,
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
    } as UserPreferences,
  };
}

// Helper function to convert Helix user data to our User type
function mapHelixUserToUser(helixUser: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}): User {
  return {
    id: helixUser.id,
    email: helixUser.email,
    firstName: helixUser.firstName,
    lastName: helixUser.lastName,
    displayName: `${helixUser.firstName} ${helixUser.lastName}`,
    roles: [
      {
        id: helixUser.role,
        name: helixUser.role,
        description: `${helixUser.role} role`,
        permissions: [], // Would be populated based on role
      },
    ],
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
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Hydrate current user after successful auth to ensure roles/permissions are accurate
      const hydrateUserFromApis = async (fallbackEmail?: string) => {
        // Try Helix first
        try {
          const helixUser = await helixAuthService.getCurrentUser();
          if (helixUser && (helixUser as any).id) {
            const mapped = mapHelixUserToUser(helixUser as HelixUser);
            set({ user: mapped, isAuthenticated: true, isLoading: false, error: null });
            try { scheduleTokenRefresh(); } catch {}
            return;
          }
        } catch {}

        // Fallback to unified user service
        try {
          const fallbackUser = await userService.getCurrentUser();
          const mapped = mapUserServiceToAppUser(fallbackUser as any);
          set({ user: mapped, isAuthenticated: true, isLoading: false, error: null });
          try { scheduleTokenRefresh(); } catch {}
          return;
        } catch {}

        // Fallback to minimal /auth/me endpoint if available
        try {
          const resp = await apiClient.get<any>('/auth/me');
          const data = (resp as any)?.data?.data || (resp as any)?.data || null;
          if (data && (data.id || data.email)) {
            const bootstrapUser: User = {
              id: data.id || 'user',
              email: data.email || fallbackEmail || 'user@example.com',
              firstName: data.name || (fallbackEmail ? fallbackEmail.split('@')[0] : 'User'),
              lastName: '',
              displayName: data.name || fallbackEmail || 'User',
              roles: [],
              permissions: [],
              isActive: true,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              preferences: {
                theme: 'system',
                language: 'en',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                notifications: {
                  email: true,
                  push: true,
                  slack: false,
                  sms: false,
                  inApp: true,
                  frequency: 'immediate',
                },
                dashboard: { layout: 'grid', widgets: [], refreshInterval: 30000 },
              } as UserPreferences,
            };
            set({ user: bootstrapUser, isAuthenticated: true, isLoading: false, error: null });
            try { scheduleTokenRefresh(); } catch {}
            return;
          }
        } catch {}

        // If all else fails, mark as unauthenticated
        set({ user: null, isAuthenticated: false, isLoading: false });
      };

      // Utility function to get current authentication status
      const getCurrentAuthState = () => {
        const state = get();
        return {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          hasValidToken: !!TokenManager.getAccessToken(),
          tokenExpiry: TokenManager.getTokenExpiry(),
        };
      };

      return {
        // Initial state - no demo mode, require proper authentication
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Legacy login action for backward compatibility, with fallback to basic auth
        login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });

        try {
          // First discover tenant
          const discovery = await helixAuthService.discoverTenant(email);

          // Then authenticate
          const response = await helixAuthService.authenticate({
            discoveryToken: discovery.discoveryToken,
            email,
            password,
            authMethod: 'password',
            rememberMe: rememberMe || false,
          });

          // Configure storage based on rememberMe
          // Configure storage based on rememberMe
          try { TokenManager.setStorage(rememberMe ? 'local' : 'session'); } catch {}
          // Store tokens via TokenManager if provided
          if (response.accessToken) {
            TokenManager.setTokens(response.accessToken, response.refreshToken, response.expiresIn);
          }

          if (response.user) {
            // Prefer hydrating full profile after auth
            await hydrateUserFromApis(email);
          } else {
            throw new Error('No user data returned');
          }
        } catch (_error) {
          // Fallback to legacy auth (/api/auth/login)
          try {
            const legacy = await apiClient.post<{ token?: string; accessToken?: string; refreshToken?: string; expiresIn?: number }>(
              '/auth/login',
              {
              email,
              password,
            });

            const token = (legacy as any)?.data?.token || (legacy as any)?.data?.accessToken;
            if (!token) throw new Error('Legacy login did not return a token');

            try { TokenManager.setStorage(rememberMe ? 'local' : 'session'); } catch {}
            TokenManager.setTokens(
              token,
              (legacy as any)?.data?.refreshToken,
              (legacy as any)?.data?.expiresIn,
            );

            // Hydrate a real user profile if available; otherwise minimal bootstrap
            await hydrateUserFromApis(email);
          } catch (fallbackErr) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error:
                fallbackErr instanceof Error
                  ? fallbackErr.message
                  : _error instanceof Error
                  ? _error.message
                  : 'Login failed',
            });
            throw fallbackErr;
          }
        }
      },

      // Helix-specific login action with legacy fallback
      loginWithHelix: async (data: HelixAuthData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await helixAuthService.authenticate({
            discoveryToken: data.discoveryToken,
            email: data.email,
            password: data.password,
            authMethod: 'password',
            rememberMe: data.rememberMe || false,
          });

          if (response.accessToken) {
            TokenManager.setTokens(response.accessToken, response.refreshToken, response.expiresIn);
          }

          if (response.user) {
            await hydrateUserFromApis(data.email);
          } else {
            throw new Error('No user data returned');
          }
        } catch (_error) {
          // Fallback to legacy auth (/api/auth/login) to support non-Helix environments
          try {
            const legacy = await apiClient.post<{ token?: string; accessToken?: string; refreshToken?: string; expiresIn?: number }>(
              '/auth/login',
              {
              email: data.email,
              password: data.password,
            });

            const token = (legacy as any)?.data?.token || (legacy as any)?.data?.accessToken;
            if (!token) throw new Error('Legacy login did not return a token');

            // Store access token for axios interceptor
            try { TokenManager.setStorage(data.rememberMe ? 'local' : 'session'); } catch {}
            TokenManager.setTokens(
              token,
              (legacy as any)?.data?.refreshToken,
              (legacy as any)?.data?.expiresIn,
            );

            await hydrateUserFromApis(data.email);
          } catch (fallbackErr) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error:
                fallbackErr instanceof Error
                  ? fallbackErr.message
                  : _error instanceof Error
                  ? _error.message
                  : 'Login failed',
            });
            throw fallbackErr;
          }
        }
      },

      // Register action - Note: Registration might not be available in Helix
      register: async () => {
        set({ isLoading: true, error: null });

        try {
          // In Nova Helix, registration is typically handled by administrators
          // This would need to be adapted based on your specific setup
          throw new Error('Self-registration is not available. Please contact your administrator.');
        } catch (_error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: _error instanceof Error ? _error.message : 'Registration failed',
          });
          throw _error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });

        try {
          await helixAuthService.logout();
          // Best-effort legacy API logout to blacklist token
          try { await apiClient.post('/auth/logout'); } catch {}
          // Ensure tokens cleared for all code paths
          TokenManager.clearTokens();
        } catch (_error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', _error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Refresh user data
      refreshUser: async () => {
        // Use getCurrentAuthState for consistent state checking
        const authState = getCurrentAuthState();
        
        if (!helixAuthService.isAuthenticated() && !authState.hasValidToken) {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Try Helix authentication service first
          const userData = await helixAuthService.getCurrentUser();

          // Map the user data if it's in Helix format
          let user: User;
          if (userData && typeof userData === 'object' && 'id' in userData) {
            user = mapHelixUserToUser(userData as HelixUser);
          } else {
            throw new Error('Invalid user data format');
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (helixError) {
          // Fallback to userService for broader compatibility
          try {
            console.warn('Helix user refresh failed, falling back to userService:', helixError);
            const fallbackUser = await userService.getCurrentUser();
            const mappedUser = mapUserServiceToAppUser(fallbackUser);
            
            set({
              user: mappedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (fallbackError) {
            // Clear tokens if refresh fails to avoid stuck state
            try { TokenManager.clearTokens(); } catch {}
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: fallbackError instanceof Error ? fallbackError.message : 'Failed to refresh user data',
            });
          }
        }
      },

      // Update profile
      updateProfile: async (updates?: Partial<User>) => {
        set({ isLoading: true, error: null });

        try {
          // Try Helix authentication service first
          const updated = await helixAuthService.updateProfile(updates || {});
          set((state) => ({
            user: state.user ? { ...state.user, ...(updated as any) } : updated,
            isLoading: false,
            error: null,
          }));
        } catch (helixError) {
          // Fallback to userService for broader compatibility
          try {
            console.warn('Helix profile update failed, falling back to userService:', helixError);
            const updatedUser = await userService.updateCurrentUser(updates || {});
            const mappedUser = mapUserServiceToAppUser(updatedUser);
            
            set((state) => ({
              user: state.user ? { ...state.user, ...mappedUser } : mappedUser,
              isLoading: false,
              error: null,
            }));
          } catch (fallbackError) {
            set({
              isLoading: false,
              error: fallbackError instanceof Error ? fallbackError.message : 'Failed to update profile',
            });
            throw fallbackError;
          }
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

        // Set loading state
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      };
    },
    {
      name: 'nova-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Cross-tab logout sync and proactive token refresh
let refreshTimer: number | null = null;

function scheduleTokenRefresh() {
  if (typeof window === 'undefined') return;
  if (refreshTimer) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  const expiry = TokenManager.getTokenExpiry();
  if (!expiry) return;
  const lead = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();
  const delay = Math.max(5_000, expiry - now - lead);
  refreshTimer = window.setTimeout(async () => {
    try {
      // Try Helix refresh first
      const refreshed = await helixAuthService.refreshToken();
      const accessToken = (refreshed as any)?.accessToken || (refreshed as any)?.token;
      const expiresIn = (refreshed as any)?.expiresIn as number | undefined;
      if (accessToken) {
        TokenManager.setTokens(accessToken, TokenManager.getRefreshToken() || undefined, expiresIn);
        scheduleTokenRefresh();
        return;
      }
      // Fallback to legacy refresh
      const refreshToken = TokenManager.getRefreshToken();
      if (refreshToken) {
        const resp = await apiClient.post<any>('/auth/refresh', { refreshToken });
        const data = (resp as any)?.data || resp;
        const newAccess = data?.accessToken || data?.token;
        const newRefresh = data?.refreshToken || refreshToken;
        const newExpiresIn = data?.expiresIn;
        if (newAccess) {
          TokenManager.setTokens(newAccess, newRefresh, newExpiresIn);
          scheduleTokenRefresh();
          return;
        }
      }
    } catch (refreshError) {
      // On refresh failure, log for debugging and rely on interceptor to handle 401
      console.debug('Token refresh failed:', refreshError instanceof Error ? refreshError.message : 'Unknown refresh error');
      
      // Check if we should force logout on persistent auth errors  
      const currentState = useAuthStore.getState();
      const hasValidToken = !!TokenManager.getAccessToken();
      if (!hasValidToken && currentState.isAuthenticated) {
        console.warn('Invalid auth state detected during refresh, clearing authentication');
        useAuthStore.setState({ user: null, isAuthenticated: false });
      }
    }
  }, delay);
}

if (typeof window !== 'undefined') {
  // Kick off scheduling if tokens already present
  if (TokenManager.getAccessToken() && TokenManager.getTokenExpiry()) {
    scheduleTokenRefresh();
  }
  // Ensure auth flag is consistent with token presence on load
  if (!TokenManager.getAccessToken()) {
    try { useAuthStore.setState({ isAuthenticated: false }); } catch {}
  }
  window.addEventListener('storage', (e) => {
    const keys = (TokenManager as any).getTokenKeys ? TokenManager.getTokenKeys() : ['nova_access_token'];
    if (!e.key || !keys.includes(e.key)) return;
    // If access token was cleared in another tab, logout locally
    if (e.key === keys[0] && e.newValue === null) {
      useAuthStore.setState({ user: null, isAuthenticated: false });
      try { if (refreshTimer) { window.clearTimeout(refreshTimer); refreshTimer = null; } } catch {}
    }
  });
}
