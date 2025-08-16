import axios, { AxiosInstance } from 'axios';
import { getEnv } from './env';
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
  KnowledgeArticle,
  KnowledgeArticleVersion,
  ApiKey,
  ApiResponse,
  LoginCredentials,
  AuthToken,
  DashboardStats,
  ActivityLog,
  EmailAccount,
  OrganizationBranding,
  RequestCatalogItem,
} from '@/types';
import {
  mockUsers,
  mockKiosks,
  mockLogs,
  mockConfig,
  mockIntegrations,
  mockEmailAccounts,
  mockModules,
  mockRoles,
  mockPermissions,
  mockNotifications,
  mockDashboardStats,
  delay,
  shouldSimulateError,
} from './mockData';

// Load environment settings
const { apiUrl, useMockApi: USE_MOCK_API } = getEnv();

class ApiClient {
  private client: AxiosInstance;
  private useMockMode: boolean = USE_MOCK_API;

  constructor() {
    this.client = axios.create({
      baseURL: this.getServerUrl(),
      timeout: 10000,
    });

    // Request interceptor to add auth token and update base URL
    this.client.interceptors.request.use((config) => {
      // Update base URL in case it changed
      config.baseURL = this.getServerUrl();
      
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

  // Get the current server URL from localStorage or environment
  private getServerUrl(): string {
    const storedUrl = localStorage.getItem('api_server_url');
    // Use stored URL if available, otherwise value from environment helper
    return storedUrl || apiUrl;
  }

  // Mock method helper
  private async mockRequest<T>(mockData: T, errorRate: number = 0.05): Promise<T> {
    await delay(200 + Math.random() * 500); // TODO-LINT: move to async function // Simulate network delay
    
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

    const response = await this.client.post<AuthToken>('/api/login', credentials); // TODO-LINT: move to async function
    return response.data;
  }

  async me(token?: string): Promise<User> {
    if (this.useMockMode) {
      return this.mockRequest(mockUsers[0]);
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await this.client.get<User>('/api/me', { headers }); // TODO-LINT: move to async function
    return response.data;
  }

  // Users
  async getUsers(): Promise<User[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockUsers);
    }

    const response = await this.client.get<User[]>('/api/users'); // TODO-LINT: move to async function
    return response.data;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    if (this.useMockMode) {
      const newUser = { ...user, id: Date.now() };
      return this.mockRequest(newUser);
    }

    const response = await this.client.post<User>('/api/users', user); // TODO-LINT: move to async function
    return response.data;
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    if (this.useMockMode) {
      const existingUser = mockUsers.find(u => u.id === id) || mockUsers[0];
      const updatedUser = { ...existingUser, ...user };
      return this.mockRequest(updatedUser);
    }

    const response = await this.client.put<User>(`/api/users/${id}`, user); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteUser(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'User deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/users/${id}`); // TODO-LINT: move to async function
    return response.data;
  }

  async updateVipStatus(id: number, data: { isVip: boolean; vipLevel?: string }): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'VIP updated' });
    }
    const response = await this.client.put<ApiResponse>(`/api/v1/helix/users/${id}/vip`, data); // TODO-LINT: move to async function
    return response.data;
  }

  async getVipProxies(): Promise<any[]> {
    const response = await this.client.get<{ proxies: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[] }>('/api/v1/vip/proxies'); // TODO-LINT: move to async function
    return response.data.proxies;
  }

  async createVipProxy(data: { vipId: string; proxyId: string; expiresAt?: string }): Promise<ApiResponse> {
    const response = await this.client.post<ApiResponse>('/api/v1/vip/proxies', data); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteVipProxy(id: number): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/api/v1/vip/proxies/${id}`); // TODO-LINT: move to async function
    return response.data;
  }

  async getVipHeatmap(): Promise<any[]> {
    const response = await this.client.get<{ heatmap: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[] }>('/api/reports/vip-heatmap'); // TODO-LINT: move to async function
    return response.data.heatmap;
  }

  // Roles and Permissions
  async getRoles(): Promise<Role[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockRoles);
    }

    const response = await this.client.get<Role[]>('/api/roles'); // TODO-LINT: move to async function
    return response.data;
  }

  async getPermissions(): Promise<Permission[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockPermissions);
    }

    const response = await this.client.get<Permission[]>('/api/roles/permissions'); // TODO-LINT: move to async function
    return response.data;
  }

  async createRole(role: Omit<Role, 'id'>): Promise<Role> {
    if (this.useMockMode) {
      const newRole = { ...role, id: Date.now() };
      return this.mockRequest(newRole);
    }

    const response = await this.client.post<Role>('/api/roles', role); // TODO-LINT: move to async function
    return response.data;
  }

  async updateRole(id: number, role: Partial<Role>): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Role updated successfully' });
    }

    const response = await this.client.put<ApiResponse>(`/api/roles/${id}`, role); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteRole(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Role deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/roles/${id}`); // TODO-LINT: move to async function
    return response.data;
  }

  // Kiosks
  async getKiosks(): Promise<Kiosk[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockKiosks);
    }

    const response = await this.client.get<Kiosk[]>('/api/kiosks'); // TODO-LINT: move to async function
    return response.data;
  }

  async updateKiosk(id: string, kiosk: Partial<Kiosk>): Promise<Kiosk> {
    if (this.useMockMode) {
      const existingKiosk = mockKiosks.find(k => k.id === id) || mockKiosks[0];
      const updatedKiosk = { ...existingKiosk, ...kiosk };
      return this.mockRequest(updatedKiosk);
    }

    const response = await this.client.put<Kiosk>(`/api/kiosks/${id}`, kiosk); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteKiosk(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/kiosks/${id}`); // TODO-LINT: move to async function
    return response.data;
  }

  async activateKiosk(id: string): Promise<Partial<Kiosk>> {
    if (this.useMockMode) {
      return this.mockRequest({ id, active: true });
    }

    const response = await this.client.post<Partial<Kiosk>>(`/api/kiosks/${id}/activate`); // TODO-LINT: move to async function
    return response.data;
  }

  async deactivateKiosk(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk deactivated successfully' });
    }

    const response = await this.client.post<ApiResponse>(`/api/kiosks/${id}/deactivate`); // TODO-LINT: move to async function
    return response.data;
  }

  async generateKioskActivation(): Promise<KioskActivation> {
    try {
      const response = await this.client.post<KioskActivation>('/api/kiosks/activation'); // TODO-LINT: move to async function
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

    const response = await this.client.get<{ systems: string[] }>('/api/kiosks/systems'); // TODO-LINT: move to async function
    return response.data;
  }

  async updateKioskSystems(systems: string[]): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk systems updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/kiosks/systems', { systems }); // TODO-LINT: move to async function
    return response.data;
  }

  // Remote Kiosk Management
  async refreshKioskConfig(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Config refresh requested' });
    }

    const response = await this.client.post<ApiResponse>(`/api/kiosks/${id}/refresh-config`); // TODO-LINT: move to async function
    return response.data;
  }

  async resetKiosk(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk reset successfully' });
    }

    const response = await this.client.post<ApiResponse>(`/api/kiosks/${id}/reset`); // TODO-LINT: move to async function
    return response.data;
  }

  // Server Management
  async restartServer(): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Server restart initiated' });
    }

    const response = await this.client.post<ApiResponse>('/api/server/restart'); // TODO-LINT: move to async function
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

    const response = await this.client.get('/api/v1/server/status'); // TODO-LINT: move to async function
    return response.data;
  }

  // Logs/Tickets
  async getLogs(): Promise<Log[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockLogs);
    }

    const response = await this.client.get<Log[]>('/api/logs'); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteLog(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Log deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/logs/${id}`); // TODO-LINT: move to async function
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

    const response = await this.client.get('/api/logs/export', { responseType: 'blob' }); // TODO-LINT: move to async function
    return response.data;
  }

  async clearLogs(): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'All logs cleared successfully' });
    }

    const response = await this.client.delete<ApiResponse>('/api/logs'); // TODO-LINT: move to async function
    return response.data;
  }

  // Config
  async getConfig(): Promise<Config> {
    if (this.useMockMode) {
      return this.mockRequest(mockConfig);
    }

    const response = await this.client.get<Config>('/api/config'); // TODO-LINT: move to async function
    return response.data;
  }

  async updateConfig(config: Partial<Config>): Promise<Config> {
    if (this.useMockMode) {
      const updatedConfig = { ...mockConfig, ...config };
      return this.mockRequest(updatedConfig);
    }

    const response = await this.client.put<Config>('/api/config', config); // TODO-LINT: move to async function
    return response.data;
  }

  async getOrganizationBranding(): Promise<OrganizationBranding> {
    if (this.useMockMode) {
      return this.mockRequest({
        logoUrl: '/logo.png',
        welcomeMessage: 'Welcome',
        helpMessage: 'Need help?',
        primaryColor: '#1D4ED8',
        secondaryColor: '#9333EA'
      });
    }

    const response = await this.client.get('/api/v1/organizations/config'); // TODO-LINT: move to async function
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockNotifications);
    }

    const response = await this.client.get<Notification[]>('/api/notifications'); // TODO-LINT: move to async function
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

    const response = await this.client.post<Notification>('/api/notifications', payload); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteNotification(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Notification deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/notifications/${id}`); // TODO-LINT: move to async function
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

    const response = await this.client.get<DirectoryUser[]>(`/api/directory/search?q=${encodeURIComponent(query)}`); // TODO-LINT: move to async function
    return response.data;
  }

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockIntegrations);
    }

    const response = await this.client.get<Integration[]>('/api/integrations'); // TODO-LINT: move to async function
    return response.data;
  }

  async createIntegration(integration: Omit<Integration, 'id'>): Promise<Integration> {
    if (this.useMockMode) {
      const newIntegration = { ...integration, id: Date.now() };
      return this.mockRequest(newIntegration);
    }

    const response = await this.client.post<Integration>('/api/integrations', integration); // TODO-LINT: move to async function
    return response.data;
  }

  async updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration> {
    if (this.useMockMode) {
      const existingIntegration = mockIntegrations.find(i => i.id === id) || mockIntegrations[0];
      const updatedIntegration = { ...existingIntegration, ...integration };
      return this.mockRequest(updatedIntegration);
    }

    const response = await this.client.put<Integration>(`/api/integrations/${id}`, integration); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteIntegration(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Integration deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/integrations/${id}`); // TODO-LINT: move to async function
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

    const response = await this.client.post<ApiResponse>(`/api/integrations/${id}/test`); // TODO-LINT: move to async function
    return response.data;
  }

  // Email accounts
  async getEmailAccounts(): Promise<EmailAccount[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockEmailAccounts);
    }
    const res = await this.client.get<EmailAccount[]>('/api/email-accounts'); // TODO-LINT: move to async function
    return res.data;
  }

  async createEmailAccount(account: Omit<EmailAccount, 'id'>): Promise<EmailAccount> {
    if (this.useMockMode) {
      const newAcc = { ...account, id: Date.now() } as EmailAccount;
      return this.mockRequest(newAcc);
    }
    const res = await this.client.post<EmailAccount>('/api/email-accounts', account); // TODO-LINT: move to async function
    return res.data;
  }

  async updateEmailAccount(id: number, account: Partial<EmailAccount>): Promise<EmailAccount> {
    if (this.useMockMode) {
      const existing = mockEmailAccounts[0];
      const updated = { ...existing, ...account } as EmailAccount;
      return this.mockRequest(updated);
    }
    const res = await this.client.put<EmailAccount>(`/api/email-accounts/${id}`, account); // TODO-LINT: move to async function
    return res.data;
  }

  async deleteEmailAccount(id: number): Promise<void> {
    if (this.useMockMode) {
      return this.mockRequest(undefined as any);
    }
    await this.client.delete(`/api/email-accounts/${id}`); // TODO-LINT: move to async function
  }

  // Modules
  async getModules(): Promise<Record<string, boolean>> {
    if (this.useMockMode) {
      return this.mockRequest(mockModules);
    }

    const response = await this.client.get<{ modules: Record<string, boolean> }>('/api/v1/modules'); // TODO-LINT: move to async function
    return response.data.modules;
  }

  async updateModule(key: string, enabled: boolean): Promise<ApiResponse> {
    if (this.useMockMode) {
      mockModules[key] = enabled;
      return this.mockRequest({ message: 'Module updated' });
    }

    const response = await this.client.put<ApiResponse>(`/api/v1/modules/${key}`, { enabled }); // TODO-LINT: move to async function
    return response.data;
  }

  // Catalog Items
  async getCatalogItems(): Promise<RequestCatalogItem[]> {
    const response = await this.client.get<RequestCatalogItem[]>('/api/v1/orbit/catalog'); // TODO-LINT: move to async function
    return response.data;
  }

  async createCatalogItem(data: Omit<RequestCatalogItem, 'id'>): Promise<RequestCatalogItem> {
    const response = await this.client.post<RequestCatalogItem>('/api/catalog-items', data); // TODO-LINT: move to async function
    return response.data;
  }

  async updateCatalogItem(id: number, data: Partial<RequestCatalogItem>): Promise<ApiResponse> {
    const response = await this.client.put<ApiResponse>(`/api/catalog-items/${id}`, data); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteCatalogItem(id: number): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/api/catalog-items/${id}`); // TODO-LINT: move to async function
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
          url: 'https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=Nova+Universe',
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

    const response = await this.client.get<Asset[]>('/api/assets'); // TODO-LINT: move to async function
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
    }); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteAsset(id: number): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Asset deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/assets/${id}`); // TODO-LINT: move to async function
    return response.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    if (this.useMockMode) {
      return this.mockRequest(mockDashboardStats);
    }

    const response = await this.client.get<DashboardStats>('/api/dashboard/stats'); // TODO-LINT: move to async function
    return response.data;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    if (this.useMockMode) {
      return this.mockRequest(mockDashboardStats.recentActivity);
    }

    const response = await this.client.get<ActivityLog[]>('/api/dashboard/activity'); // TODO-LINT: move to async function
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

    const response = await this.client.get('/api/security-settings'); // TODO-LINT: move to async function
    return response.data;
  }

  async updateSecuritySettings(settings: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Security settings updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/security-settings', settings); // TODO-LINT: move to async function
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

    const response = await this.client.get('/api/notification-settings'); // TODO-LINT: move to async function
    return response.data;
  }

  async updateNotificationSettings(settings: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Notification settings updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/notification-settings', settings); // TODO-LINT: move to async function
    return response.data;
  }

  // Kiosk Activations
  async getKioskActivations(): Promise<KioskActivation[]> {
    try {
      const response = await this.client.get<KioskActivation[]>('/api/kiosks/activations'); // TODO-LINT: move to async function
      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn('API returned non-array data for kiosk activations:', response.data);
        return [];
      }
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
          lastSeen: new Date().toISOString(),
          version: '1.0.0',
          configScope: 'global',
          hasOverrides: false,
          overrideCount: 0,
          effectiveConfig: {
            statusEnabled: true, 
            currentStatus: 'open' as const,
            openMsg: 'Open', 
            closedMsg: 'Closed', 
            errorMsg: 'Error'
          }
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

    const response = await this.client.get<KioskConfig>(`/api/kiosk-config/${id}`); // TODO-LINT: move to async function
    return response.data;
  }

  async updateKioskConfig(id: string, config: Partial<Kiosk>): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk configuration updated successfully' });
    }

    const response = await this.client.put<ApiResponse>(`/api/kiosk-config/${id}`, config); // TODO-LINT: move to async function
    return response.data;
  }

  // Feedback
  async getFeedback(): Promise<any[]> {
    if (this.useMockMode) {
      return this.mockRequest([]);
    }

    const response = await this.client.get<any[]>('/api/feedback'); // TODO-LINT: move to async function
    return response.data;
  }

  async createFeedback(feedback: { message: string; rating?: number }): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Feedback submitted successfully' });
    }

    const response = await this.client.post<ApiResponse>('/api/feedback', feedback); // TODO-LINT: move to async function
    return response.data;
  }

  // Password Management
  async verifyPassword(password: string): Promise<{ valid: boolean }> {
    if (this.useMockMode) {
      return this.mockRequest({ valid: true });
    }

    const response = await this.client.post<{ valid: boolean }>('/api/verify-password', { password }); // TODO-LINT: move to async function
    return response.data;
  }

  async updateAdminPassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Password updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/admin-password', {
      currentPassword,
      newPassword
    }); // TODO-LINT: move to async function
    return response.data;
  }

  // Status Configuration
  async getStatusConfig(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        enabled: true,
        currentStatus: 'open', // Current global status
        openMessage: 'Help Desk is Open',
        closedMessage: 'Help Desk is Closed',
        meetingMessage: 'In a Meeting - Back Soon',
        brbMessage: 'Be Right Back',
        lunchMessage: 'Out to Lunch - Back in 1 Hour',
        unavailableMessage: 'Status Unavailable',
        schedule: {
          enabled: false,
          schedule: {
            monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] }
          },
          timezone: 'America/New_York'
        },
        officeHours: {
          enabled: false,
          title: 'IT Support Hours',
          schedule: {
            monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] }
          },
          timezone: 'America/New_York',
          showNextOpen: true
        }
      });
    }

    const response = await this.client.get<any>('/api/status-config'); // TODO-LINT: move to async function
    return response.data;
  }

  async updateStatusConfig(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Status configuration updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/status-config', config); // TODO-LINT: move to async function
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

    const response = await this.client.get<any>('/api/directory-config'); // TODO-LINT: move to async function
    return response.data;
  }

  async updateDirectoryConfig(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Directory configuration updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/directory-config', config); // TODO-LINT: move to async function
    return response.data;
  }

  // SSO Configuration
  async getSSOConfig(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        enabled: false,
        provider: 'saml',
        saml: {
          enabled: false,
          entryPoint: '',
          issuer: '',
          callbackUrl: '',
          cert: ''
        }
      });
    }

    const response = await this.client.get<any>('/api/sso-config'); // TODO-LINT: move to async function
    return response.data;
  }

  async getSSOAvailability(): Promise<{ available: boolean; loginUrl?: string }> {
    if (this.useMockMode) {
      return this.mockRequest({ available: false });
    }

    const response = await this.client.get<{ available: boolean; // TODO-LINT: move to async function loginUrl?: string }>('/api/sso-available');
    return response.data;
  }

  // SCIM Configuration
  async getSCIMConfig(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        enabled: false,
        token: '',
        endpoint: '/scim/v2'
      });
    }

    const response = await this.client.get<any>('/api/scim-config'); // TODO-LINT: move to async function
    return response.data;
  }

  async updateSCIMConfig(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'SCIM configuration updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/scim-config', config); // TODO-LINT: move to async function
    return response.data;
  }

  // Passkey Management
  async getPasskeys(): Promise<any[]> {
    if (this.useMockMode) {
      return this.mockRequest([
        {
          id: '1',
          name: 'Touch ID',
          created_at: '2025-01-01T00:00:00Z',
          last_used: '2025-01-07T00:00:00Z',
          credential_device_type: 'platform'
        }
      ]);
    }

    const response = await this.client.get<any[]>('/api/passkeys'); // TODO-LINT: move to async function
    return response.data;
  }

  async deletePasskey(id: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Passkey deleted successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/passkeys/${id}`); // TODO-LINT: move to async function
    return response.data;
  }

  async beginPasskeyRegistration(options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        challenge: 'mock-challenge',
        rp: { name: 'Nova Universe Portal', id: 'localhost' },
        user: { id: 'mock-user-id', name: 'mock@example.com', displayName: 'Mock User' },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        timeout: 60000
      });
    }

    const response = await this.client.post<any>('/api/passkey/register/begin', options); // TODO-LINT: move to async function
    return response.data;
  }

  async completePasskeyRegistration(data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ verified: true, message: 'Passkey registered successfully' });
    }

    const response = await this.client.post<ApiResponse>('/api/passkey/register/complete', data); // TODO-LINT: move to async function
    return response.data;
  }

  async beginPasskeyAuthentication(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        challenge: 'mock-auth-challenge',
        timeout: 60000,
        rpId: 'localhost',
        allowCredentials: [],
        challengeKey: 'mock-challenge-key'
      });
    }

    const response = await this.client.post<any>('/api/passkey/authenticate/begin'); // TODO-LINT: move to async function
    return response.data;
  }

  async completePasskeyAuthentication(data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<{ verified: boolean; token?: string; user?: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types }> {
    if (this.useMockMode) {
      return this.mockRequest({
        verified: true,
        token: 'mock-jwt-token',
        user: { id: 1, name: 'Mock User', email: 'mock@example.com' }
      });
    }

    const response = await this.client.post<{ verified: boolean; // TODO-LINT: move to async function token?: string; user?: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types }>('/api/passkey/authenticate/complete', data);
    return response.data;
  }

  // Admin Pin Management
  async updateAdminPins(pinConfig: { globalPin?: string; kioskPins?: Record<string, string> }): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Admin pins updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/admin-pins', pinConfig); // TODO-LINT: move to async function
    return response.data;
  }

  async validateAdminPin(pin: string, kioskId?: string): Promise<{ valid: boolean; permissions: string[] }> {
    if (this.useMockMode) {
      return this.mockRequest({ 
        valid: true, 
        permissions: ['admin', 'override_status', 'manage_settings'] 
      });
    }

    const response = await this.client.post<{ valid: boolean; // TODO-LINT: move to async function permissions: string[] }>('/api/admin-pins/validate', { pin, kioskId });
    return response.data;
  }

  // SSO Configuration
  async updateSSOConfig(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'SSO configuration updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/sso-config', config); // TODO-LINT: move to async function
    return response.data;
  }

  // Kiosk Configuration Management
  async getKioskConfiguration(kioskId: string): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        id: kioskId,
        statusConfig: {
          enabled: true,
          currentStatus: 'open',
          openMessage: 'Help Desk is Open',
          closedMessage: 'Help Desk is Closed'
        },
        brandingConfig: {
          logoUrl: '/logo.png',
          welcomeMessage: 'Welcome to IT Help Desk'
        },
        scheduleConfig: {
          enabled: false,
          timezone: 'America/New_York'
        }
      });
    }

    const response = await this.client.get<any>(`/api/kiosks/${kioskId}/configuration`); // TODO-LINT: move to async function
    return response.data;
  }

  async setKioskOverride(kioskId: string, configType: string, configData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk override set successfully' });
    }

    const response = await this.client.put<ApiResponse>(`/api/kiosks/${kioskId}/overrides/${configType}`, configData); // TODO-LINT: move to async function
    return response.data;
  }

  async removeKioskOverride(kioskId: string, configType: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk override removed successfully' });
    }

    const response = await this.client.delete<ApiResponse>(`/api/kiosks/${kioskId}/overrides/${configType}`); // TODO-LINT: move to async function
    return response.data;
  }

  // Global Configuration Management
  async getGlobalConfiguration(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        status: {
          enabled: true,
          currentStatus: 'open',
          openMessage: 'Help Desk is Open',
          closedMessage: 'Help Desk is Closed'
        },
        branding: {
          logoUrl: '/logo.png',
          welcomeMessage: 'Welcome to IT Help Desk'
        },
        schedule: {
          enabled: false,
          timezone: 'America/New_York'
        }
      });
    }

    const response = await this.client.get<any>('/api/configuration/global'); // TODO-LINT: move to async function
    return response.data;
  }

  async getConfigurationSummary(): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        totalKiosks: 5,
        globalOverrides: 0,
        kioskOverrides: 2,
        lastUpdated: new Date().toISOString()
      });
    }

    const response = await this.client.get<any>('/api/configuration/summary'); // TODO-LINT: move to async function
    return response.data;
  }

  async updateGlobalConfiguration(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Global configuration updated successfully' });
    }

    const response = await this.client.put<ApiResponse>('/api/configuration/global', config); // TODO-LINT: move to async function
    return response.data;
  }

  async setKioskConfigScope(kioskId: string, scope: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk configuration scope updated successfully' });
    }

    const response = await this.client.put<ApiResponse>(`/api/kiosks/${kioskId}/config-scope`, { scope }); // TODO-LINT: move to async function
    return response.data;
  }

  async resetAllKiosksToGlobal(): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'All kiosks reset to global configuration successfully' });
    }

    const response = await this.client.post<ApiResponse>('/api/configuration/reset-all-to-global'); // TODO-LINT: move to async function
    return response.data;
  }

  async applyGlobalConfigToAll(configType: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: `Global ${configType} configuration applied to all kiosks successfully` });
    }

    const response = await this.client.post<ApiResponse>('/api/configuration/apply-global-to-all', { configType }); // TODO-LINT: move to async function
    return response.data;
  }

  // Kiosk Status Management
  async updateKioskStatus(kioskId: string, status: { active: boolean }): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'Kiosk status updated successfully' });
    }

    const response = await this.client.put<ApiResponse>(`/api/kiosks/${kioskId}/status`, status); // TODO-LINT: move to async function
    return response.data;
  }

  // Schedule Configuration
  async getKioskScheduleConfig(kioskId: string): Promise<any> {
    if (this.useMockMode) {
      return this.mockRequest({
        enabled: false,
        timezone: 'America/New_York',
        schedule: {
          monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
          saturday: { enabled: false, slots: [] },
          sunday: { enabled: false, slots: [] }
        }
      });
    }

    const response = await this.client.get<any>(`/api/kiosks/${kioskId}/schedule-config`); // TODO-LINT: move to async function
    return response.data;
  }

  // SMTP Testing
  async testSMTP(testEmail: string): Promise<ApiResponse> {
    if (this.useMockMode) {
      return this.mockRequest({ message: 'SMTP test email sent successfully' });
    }

    const response = await this.client.post<ApiResponse>('/api/smtp/test', { email: testEmail }); // TODO-LINT: move to async function
    return response.data;
  }

  // Knowledge Base (Nova Lore)
  async getKnowledgeArticles(params: { search?: string } = {}): Promise<KnowledgeArticle[]> {
    if (this.useMockMode) {
      return this.mockRequest([]);
    }

    const response = await this.client.get<{ articles: KnowledgeArticle[] }>('/api/v1/lore/articles', { params }); // TODO-LINT: move to async function
    return response.data.articles;
  }

  async getKnowledgeArticle(slug: string): Promise<KnowledgeArticle> {
    const response = await this.client.get<{ article: KnowledgeArticle }>(`/api/v1/lore/articles/${slug}`); // TODO-LINT: move to async function
    return response.data.article;
  }

  async getKnowledgeVersions(articleId: number): Promise<KnowledgeArticleVersion[]> {
    const response = await this.client.get<{ versions: KnowledgeArticleVersion[] }>(`/api/v1/lore/articles/${articleId}/versions`); // TODO-LINT: move to async function
    return response.data.versions;
  }

  async getKnowledgeComments(articleId: number): Promise<any[]> {
    const response = await this.client.get<{ comments: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types[] }>(`/api/v1/lore/articles/${articleId}/comments`); // TODO-LINT: move to async function
    return response.data.comments;
  }

  async addKnowledgeComment(articleId: number, data: { content: string }): Promise<any> {
    if (this.useMockMode) {
      const mockComment = {
        id: crypto.randomUUID(),
        user: { id: '1', name: 'Mock User' },
        content: data.content,
        createdAt: new Date().toISOString(),
      };
      return this.mockRequest(mockComment);
    }

    const response = await this.client.post<{ comment: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types }>(`/api/v1/lore/articles/${articleId}/comments`, data); // TODO-LINT: move to async function
    return response.data.comment;
  }

  async createKnowledgeArticle(data: { title: string; content: string; tags?: string[] }): Promise<KnowledgeArticle> {
    const response = await this.client.post<{ article: KnowledgeArticle }>('/api/v1/lore/articles', data); // TODO-LINT: move to async function
    return response.data.article;
  }

  async createKnowledgeVersion(articleId: number, data: { content: string }): Promise<KnowledgeArticleVersion> {
    const response = await this.client.post<{ version: KnowledgeArticleVersion }>(`/api/v1/lore/articles/${articleId}/versions`, data); // TODO-LINT: move to async function
    return response.data.version;
  }

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await this.client.get<{ apiKeys: ApiKey[] }>('/api/v1/api-keys'); // TODO-LINT: move to async function
    return response.data.apiKeys;
  }

  async createApiKey(description?: string): Promise<{ apiKey: ApiKey }> {
    const response = await this.client.post<{ apiKey: ApiKey }>('/api/v1/api-keys', { description }); // TODO-LINT: move to async function
    return response.data;
  }

  async deleteApiKey(key: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/api/v1/api-keys/${key}`); // TODO-LINT: move to async function
    return response.data;
  }
}

export const api = new ApiClient();

export async function _generateActivationCode(input: { kioskId: string; _kioskName?: string; location?: string; configuration?: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types }) {
  const res = await fetch('/api/v2/beacon/activation-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  }); // TODO-LINT: move to async function
  if (!res.ok) throw new Error('Failed to generate activation code');
  return res.json();
}

export async function _listActivationCodes() {
  const res = await fetch('/api/v1/configuration/activations'); // TODO-LINT: move to async function
  if (!res.ok) throw new Error('Failed to list activation codes');
  return res.json();
}
