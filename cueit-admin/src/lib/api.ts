import axios, { AxiosInstance } from 'axios';
import type {
  User,
  Role,
  Permission,
  Kiosk,
  Log,
  Config,
  Notification,
  DirectoryUser,
  Integration,
  KioskActivation,
  KioskConfig,
  Asset,
  ApiResponse,
  LoginCredentials,
  AuthToken,
  DashboardStats,
  ActivityLog,
} from '@/types';
import {
  mockUsers,
  mockKiosks,
  mockLogs,
  mockConfig,
  mockIntegrations,
  mockRoles,
  mockPermissions,
  mockNotifications,
  mockDashboardStats,
  delay,
  shouldSimulateError,
} from './mockData';

// Check if we should use mock mode (when API is not available or VITE_USE_MOCK_API is true)
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

class ApiClient {
  private client: AxiosInstance;
  private useMockMode: boolean = USE_MOCK_API;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Log API errors for debugging
        console.error('API Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
          code: error.code
        });
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Mock method helper
  private async mockRequest<T>(mockData: T, errorRate: number = 0.05): Promise<T> {
    await delay(200 + Math.random() * 500); // Simulate network delay
    
    if (shouldSimulateError(errorRate)) {
      throw new Error('Simulated API error');
    }
    
    return mockData;
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<AuthToken> {
    if (this.useMockMode) {
      return this.mockRequest({ token: 'mock_token_12345' });
    }

    const response = await this.client.post<AuthToken>('/api/login', credentials);
    return response.data;
  }

  async me(): Promise<User> {
    if (this.useMockMode) {
      return this.mockRequest(mockUsers[0]);
    }

    const response = await this.client.get<User>('/api/me');
    return response.data;
  }

  // Users
  async getUsers(): Promise<User[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockUsers);
    }

    const response = await this.client.get<User[]>('/api/users');
    return response.data;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    if (this.useMockMode) {
      const newUser = { ...user, id: Date.now() };
      return this.mockRequest(newUser);
    }

    const response = await this.client.post<User>('/api/users', user);
    return response.data;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    if (this.useMockMode) {
      const existingUser = mockUsers.find(u => u.id === id) || mockUsers[0];
      const updatedUser = { ...existingUser, ...user };
      return this.mockRequest(updatedUser);
    }

    const response = await this.client.put<User>(`/api/users/${id}`, user);
    return response.data;
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'User deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/users/${id}`);
    return response.data;
  }

  // Roles and Permissions
  async getRoles(): Promise<Role[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockRoles);
    }

    const response = await this.client.get<Role[]>('/api/roles');
    return response.data;
  }

  async getPermissions(): Promise<Permission[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockPermissions);
    }

    const response = await this.client.get<Permission[]>('/api/roles/permissions');
    return response.data;
  }

  async createRole(role: Omit<Role, 'id'>): Promise<Role> {
    if (this.useMockMode) {
      const newRole = { ...role, id: Date.now() };
      return this.mockRequest(newRole);
    }

    const response = await this.client.post<Role>('/api/roles', role);
    return response.data;
  }

  async updateRole(id: number, role: Partial<Role>): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Role updated successfully' });
    }

    const response = await this.client.put<ApiResponse>(`/api/roles/${id}`, role);
    return response.data;
  }

  async deleteRole(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Role deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/roles/${id}`);
    return response.data;
  }

  // Kiosks
  async getKiosks(): Promise<Kiosk[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockKiosks);
    }

    const response = await this.client.get<Kiosk[]>('/api/kiosks');
    return response.data;
  }

  async updateKiosk(id: string, kiosk: Partial<Kiosk>): Promise<Kiosk> {
    if (this.useMockMode) {
      const existingKiosk = mockKiosks.find(k => k.id === id) || mockKiosks[0];
      const updatedKiosk = { ...existingKiosk, ...kiosk };
      return this.mockRequest(updatedKiosk);
    }

    const response = await this.client.put<Kiosk>(`/api/kiosks/${id}`, kiosk);
    return response.data;
  }

  async deleteKiosk(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/kiosks/${id}`);
    return response.data;
  }

  async activateKiosk(id: string): Promise<Partial<Kiosk>> {
    if (this.useMockMode) {
      return this.mockRequest({ id, active: true });
    }

    const response = await this.client.post<Partial<Kiosk>>(`/api/kiosks/${id}/activate`);
    return response.data;
  }

  async deactivateKiosk(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk deactivated successfully' });
    }

    const response = await this.client.post<ApiResponse>(`/api/kiosks/${id}/deactivate`);
    return response.data;
  }

  async generateKioskActivation(): Promise<KioskActivation> {
    try {
      const response = await this.client.post<KioskActivation>('/api/kiosks/activation');
      return response.data;
    } catch (error) {
      console.error('Error generating kiosk activation:', error);
      // Fallback to mock only if API is completely unavailable
      if (this.useMockMode || !navigator.onLine) {
        return this.mockRequest({
          id: 'activation_' + Date.now(),
          code: 'ABC' + Math.floor(Math.random() * 1000),
          qrCode: 'data:image/png;base64,mock_qr_code',
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
          used: false,
          createdAt: new Date().toISOString()
        });
      }
      throw error;
    }
  }

  // Kiosk Systems Configuration
  async getKioskSystems(): Promise<{ systems: string[] }> {
    if (this.useMockMode) {
      return this.mockRequest({
        systems: ['Desktop', 'Laptop', 'Mobile', 'Network', 'Printer', 'Software', 'Account Access']
      });
    }

    const response = await this.client.get<{ systems: string[] }>('/api/kiosk-systems');
    return response.data;
  }

  async updateKioskSystems(systems: string[]): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Systems updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/kiosk-systems', { systems });
    return response.data;
  }

  // Remote Kiosk Management
  async refreshKioskConfig(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Config refresh requested' });
    }

    const response = await this.client.post<ApiResponse>(`/api/kiosks/${id}/refresh-config`);
    return response.data;
  }

  async resetKiosk(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk reset successfully' });
    }

    const response = await this.client.post<ApiResponse>(`/api/kiosks/${id}/reset`);
    return response.data;
  }

  // Server Management
  async restartServer(): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Server restart initiated' });
    }

    const response = await this.client.post<ApiResponse>('/api/server/restart');
    return response.data;
  }

  async getServerStatus(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        status: 'running',
        uptime: 12345,
        version: '1.0.0',
        nodeVersion: 'v18.0.0'
      });
    }

    const response = await this.client.get('/api/server/status');
    return response.data;
  }

  // Logs/Tickets
  async getLogs(): Promise<Log[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockLogs);
    }

    const response = await this.client.get<Log[]>('/api/logs');
    return response.data;
  }

  async deleteLog(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Log deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/logs/${id}`);
    return response.data;
  }

  async exportLogs(): Promise<Blob> {
    if (this.useMockMode) {
      // Create a mock CSV blob
      const csvContent = 'ID,Ticket ID,Name,Email,Title,System,Urgency,Timestamp\n' +
        mockLogs.map(log => 
          `${log.id},${log.ticketId},${log.name},${log.email},${log.title},${log.system},${log.urgency},${log.timestamp}`
        ).join('\n');
      return new Blob([csvContent], { type: 'text/csv' });
    }

    const response = await this.client.get('/api/logs/export', { responseType: 'blob' });
    return response.data;
  }

  async clearLogs(): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'All logs cleared successfully' });
    }

    const response = await this.client.delete<ApiResponse>('/api/logs');
    return response.data;
  }

  // Config
  async getConfig(): Promise<Config> {
    if (this.useMockMode) {
      return this.mockRequest(mockConfig);
    }

    const response = await this.client.get<Config>('/api/config');
    return response.data;
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    if (this.useMockMode) {
      const updatedConfig = { ...mockConfig, ...config };
      return this.mockRequest(updatedConfig);
    }

    const response = await this.client.put<Config>('/api/config', config);
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockNotifications);
    }

    const response = await this.client.get<Notification[]>('/api/notifications');
    return response.data;
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    if (this.useMockMode) {
      const newNotification: Notification = {
        ...notification,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      return this.mockRequest(newNotification);
    }

    // Map frontend notification to backend format
    const payload = {
      message: notification.message,
      type: notification.type,
      level: notification.level || 'info'
    };

    const response = await this.client.post<Notification>('/api/notifications', payload);
    return response.data;
  }

  async deleteNotification(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Notification deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/notifications/${id}`);
    return response.data;
  }

  // Directory
  async searchDirectory(query: string): Promise<DirectoryUser[]> {
    if (this.useMockMode) {
      const mockDirectoryUsers: DirectoryUser[] = mockUsers.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        department: 'Engineering'
      })).filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) || 
        user.email.toLowerCase().includes(query.toLowerCase())
      );
      return this.mockRequest(mockDirectoryUsers);
    }

    const response = await this.client.get<DirectoryUser[]>(`/api/directory/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockIntegrations);
    }

    const response = await this.client.get<Integration[]>('/api/integrations');
    return response.data;
  }

  async createIntegration(integration: Omit<Integration, 'id'>): Promise<Integration> {
    if (this.useMockMode) {
      const newIntegration = { ...integration, id: Date.now() };
      return this.mockRequest(newIntegration);
    }

    const response = await this.client.post<Integration>('/api/integrations', integration);
    return response.data;
  }

  async updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration> {
    if (this.useMockMode) {
      const existingIntegration = mockIntegrations.find(i => i.id === id) || mockIntegrations[0];
      const updatedIntegration = { ...existingIntegration, ...integration };
      return this.mockRequest(updatedIntegration);
    }

    const response = await this.client.put<Integration>(`/api/integrations/${id}`, integration);
    return response.data;
  }

  async deleteIntegration(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Integration deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/integrations/${id}`);
    return response.data;
  }

  async testIntegration(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      const integration = mockIntegrations.find(i => i.id === id);
      const success = integration?.working !== false;
      return this.mockRequest({ 
        message: success ? 'Integration test successful' : 'Integration test failed'
      });
    }

    const response = await this.client.post<ApiResponse>(`/api/integrations/${id}/test`);
    return response.data;
  }

  // Assets
  async getAssets(): Promise<Asset[]> {
    if (this.useMockMode) {
      const mockAssets: Asset[] = [
        {
          id: 1,
          name: 'Company Logo',
          type: 'logo',
          url: 'https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=CueIT',
          uploadedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Favicon',
          type: 'favicon',
          url: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=C',
          uploadedAt: new Date().toISOString()
        }
      ];
      return this.mockRequest(mockAssets);
    }

    const response = await this.client.get<Asset[]>('/api/assets');
    return response.data;
  }

  async uploadAsset(file: File, type: Asset['type']): Promise<Asset> {
    if (this.useMockMode) {
      const mockAsset: Asset = {
        id: Date.now(),
        name: file.name,
        type,
        url: `http://localhost:3000/assets/${file.name}`,
        uploadedAt: new Date().toISOString()
      };
      return this.mockRequest(mockAsset);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.client.post<Asset>('/api/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async deleteAsset(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Asset deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/assets/${id}`);
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    if (this.useMockMode) {
      return this.mockRequest(mockDashboardStats);
    }

    const response = await this.client.get<DashboardStats>('/api/dashboard/stats');
    return response.data;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockDashboardStats.recentActivity);
    }

    const response = await this.client.get<ActivityLog[]>('/api/dashboard/activity');
    return response.data;
  }

  // Security Settings
  async getSecuritySettings(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        passwordMinLength: '8',
        passwordRequireSymbols: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        sessionTimeout: '24',
        maxLoginAttempts: '5',
        lockoutDuration: '15',
        twoFactorRequired: false,
        auditLogging: true
      });
    }

    const response = await this.client.get('/api/security-settings');
    return response.data;
  }

  async updateSecuritySettings(settings: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Security settings updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/security-settings', settings);
    return response.data;
  }

  // Notification Settings
  async getNotificationSettings(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        emailNotifications: true,
        slackNotifications: false,
        ticketCreatedNotify: true,
        kioskOfflineNotify: true,
        systemErrorNotify: true,
        dailyReports: false,
        weeklyReports: false,
        notificationRetention: '30'
      });
    }

    const response = await this.client.get('/api/notification-settings');
    return response.data;
  }

  async updateNotificationSettings(settings: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Notification settings updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/notification-settings', settings);
    return response.data;
  }

  // Kiosk Activations
  async getKioskActivations(): Promise<KioskActivation[]> {
    try {
      const response = await this.client.get<KioskActivation[]>('/api/kiosks/activations');
      return response.data;
    } catch (error) {
      console.error('Error getting kiosk activations:', error);
      // Fallback to mock only if API is completely unavailable
      if (this.useMockMode || !navigator.onLine) {
        return this.mockRequest([
          {
            id: 'activation_123',
            code: 'ABC123',
            qrCode: 'data:image/png;base64,mock_qr_code',
            expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
            used: false,
            createdAt: new Date().toISOString()
          }
        ]);
      }
      // Return empty array if API fails but we're not in mock mode
      return [];
    }
  }

  async getKioskConfig(id: string): Promise<KioskConfig> {
    if (this.useMockMode) {
      return this.mockRequest({
        kiosk: { 
          id, 
          active: true, 
          statusEnabled: true, 
          currentStatus: 'open' as const,
          openMsg: 'Open', 
          closedMsg: 'Closed', 
          errorMsg: 'Error',
          lastSeen: new Date().toISOString(),
          version: '1.0.0'
        },
        config: {
          logoUrl: '/logo.png',
          faviconUrl: '/vite.svg',
          welcomeMessage: 'Welcome to the Help Desk',
          helpMessage: 'Need to report an issue?',
          statusOpenMsg: 'Open',
          statusClosedMsg: 'Closed',
          statusErrorMsg: 'Error',
          systems: ['Desktop', 'Laptop', 'Mobile', 'Network', 'Printer', 'Software', 'Account Access']
        }
      });
    }

    const response = await this.client.get<KioskConfig>(`/api/kiosk-config/${id}`);
    return response.data;
  }

  async updateKioskConfig(id: string, config: Partial<Kiosk>): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk configuration updated successfully' });
    }

    const response = await this.client.put<ApiResponse>(`/api/kiosk-config/${id}`, config);
    return response.data;
  }

  // Feedback
  async getFeedback(): Promise<any[]> {
    if (this.useMockMode) {
      return this.mockRequest([]);
    }

    const response = await this.client.get<any[]>('/api/feedback');
    return response.data;
  }

  async createFeedback(feedback: { message: string; rating?: number }): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Feedback submitted successfully' });
    }

    const response = await this.client.post<ApiResponse>('/api/feedback', feedback);
    return response.data;
  }

  // Password Management
  async verifyPassword(password: string): Promise<{ valid: boolean }> {
    if (this.useMockMode) {
      return this.mockRequest({ valid: true });
    }

    const response = await this.client.post<{ valid: boolean }>('/api/verify-password', { password });
    return response.data;
  }

  async updateAdminPassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Password updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/admin-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  // Status Configuration
  async getStatusConfig(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        enabled: true,
        openMessage: 'Help Desk is Open',
        closedMessage: 'Help Desk is Closed',
        schedule: null
      });
    }

    const response = await this.client.get<any>('/api/status-config');
    return response.data;
  }

  async updateStatusConfig(config: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Status configuration updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/status-config', config);
    return response.data;
  }

  // Directory Configuration
  async getDirectoryConfig(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        enabled: false,
        provider: 'ldap',
        url: '',
        baseDN: '',
        bindDN: '',
        bindPassword: ''
      });
    }

    const response = await this.client.get<any>('/api/directory-config');
    return response.data;
  }

  async updateDirectoryConfig(config: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Directory configuration updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/directory-config', config);
    return response.data;
  }

  // Kiosk Users
  async getKioskUsers(kioskId: string): Promise<User[]> {
    if (this.useMockMode) {
      return this.mockRequest([]);
    }

    const response = await this.client.get<User[]>(`/api/kiosks/${kioskId}/users`);
    return response.data;
  }

  async addKioskUser(kioskId: string, userId: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'User added to kiosk successfully' });
    }

    const response = await this.client.post<ApiResponse>(`/api/kiosks/${kioskId}/users`, { userId });
    return response.data;
  }

  // Kiosk Status
  async getKioskStatus(kioskId: string): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        status: 'online',
        lastSeen: new Date().toISOString(),
        version: '1.0.0'
      });
    }

    const response = await this.client.get<any>(`/api/kiosks/${kioskId}/status`);
    return response.data;
  }

  async updateKioskStatus(kioskId: string, status: any): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk status updated successfully' });
    }

    // Handle both activation endpoint and general status endpoint
    const endpoint = status.hasOwnProperty('active') 
      ? `/api/kiosks/${kioskId}/active` 
      : `/api/kiosks/${kioskId}/status`;
    
    const response = await this.client.put<ApiResponse>(endpoint, status);
    return response.data;
  }
}

export const api = new ApiClient();
