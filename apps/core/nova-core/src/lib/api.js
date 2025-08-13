import axios from 'axios';
import { getEnv } from './env';
import { mockUsers, mockKiosks, mockLogs, mockConfig, mockIntegrations, mockEmailAccounts, mockModules, mockRoles, mockPermissions, mockNotifications, mockDashboardStats, delay, shouldSimulateError, } from './mockData';
// Load environment settings
const { apiUrl, useMockApi: USE_MOCK_API } = getEnv();
class ApiClient {
    client;
    useMockMode = USE_MOCK_API;
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
        this.client.interceptors.response.use((response) => response, async (error) => {
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
        });
    }
    // Get the current server URL from localStorage or environment
    getServerUrl() {
        const storedUrl = localStorage.getItem('api_server_url');
        // Use stored URL if available, otherwise value from environment helper
        return storedUrl || apiUrl;
    }
    // Mock method helper
    async mockRequest(mockData, errorRate = 0.05) {
        await delay(200 + Math.random() * 500); // Simulate network delay
        if (shouldSimulateError(errorRate)) {
            throw new Error('Simulated API error');
        }
        return mockData;
    }
    // Auth
    async login(credentials) {
        if (this.useMockMode) {
            return this.mockRequest({ token: 'mock_token_12345' });
        }
        const response = await this.client.post('/api/login', credentials);
        return response.data;
    }
    async me(token) {
        if (this.useMockMode) {
            return this.mockRequest(mockUsers[0]);
        }
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await this.client.get('/api/me', { headers });
        return response.data;
    }
    // Users
    async getUsers() {
        if (this.useMockMode) {
            return this.mockRequest(mockUsers);
        }
        const response = await this.client.get('/api/users');
        return response.data;
    }
    async createUser(user) {
        if (this.useMockMode) {
            const newUser = { ...user, id: Date.now() };
            return this.mockRequest(newUser);
        }
        const response = await this.client.post('/api/users', user);
        return response.data;
    }
    async updateUser(id, user) {
        if (this.useMockMode) {
            const existingUser = mockUsers.find(u => u.id === id) || mockUsers[0];
            const updatedUser = { ...existingUser, ...user };
            return this.mockRequest(updatedUser);
        }
        const response = await this.client.put(`/api/users/${id}`, user);
        return response.data;
    }
    async deleteUser(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'User deleted successfully' });
        }
        const response = await this.client.delete(`/api/users/${id}`);
        return response.data;
    }
    async updateVipStatus(id, data) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'VIP updated' });
        }
        const response = await this.client.put(`/api/v1/helix/users/${id}/vip`, data);
        return response.data;
    }
    async getVipProxies() {
        const response = await this.client.get('/api/v1/vip/proxies');
        return response.data.proxies;
    }
    async createVipProxy(data) {
        const response = await this.client.post('/api/v1/vip/proxies', data);
        return response.data;
    }
    async deleteVipProxy(id) {
        const response = await this.client.delete(`/api/v1/vip/proxies/${id}`);
        return response.data;
    }
    async getVipHeatmap() {
        const response = await this.client.get('/api/reports/vip-heatmap');
        return response.data.heatmap;
    }
    // Roles and Permissions
    async getRoles() {
        if (this.useMockMode) {
            return this.mockRequest(mockRoles);
        }
        const response = await this.client.get('/api/roles');
        return response.data;
    }
    async getPermissions() {
        if (this.useMockMode) {
            return this.mockRequest(mockPermissions);
        }
        const response = await this.client.get('/api/roles/permissions');
        return response.data;
    }
    async createRole(role) {
        if (this.useMockMode) {
            const newRole = { ...role, id: Date.now() };
            return this.mockRequest(newRole);
        }
        const response = await this.client.post('/api/roles', role);
        return response.data;
    }
    async updateRole(id, role) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Role updated successfully' });
        }
        const response = await this.client.put(`/api/roles/${id}`, role);
        return response.data;
    }
    async deleteRole(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Role deleted successfully' });
        }
        const response = await this.client.delete(`/api/roles/${id}`);
        return response.data;
    }
    // Kiosks
    async getKiosks() {
        if (this.useMockMode) {
            return this.mockRequest(mockKiosks);
        }
        const response = await this.client.get('/api/kiosks');
        return response.data;
    }
    async updateKiosk(id, kiosk) {
        if (this.useMockMode) {
            const existingKiosk = mockKiosks.find(k => k.id === id) || mockKiosks[0];
            const updatedKiosk = { ...existingKiosk, ...kiosk };
            return this.mockRequest(updatedKiosk);
        }
        const response = await this.client.put(`/api/kiosks/${id}`, kiosk);
        return response.data;
    }
    async deleteKiosk(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Kiosk deleted successfully' });
        }
        const response = await this.client.delete(`/api/kiosks/${id}`);
        return response.data;
    }
    async activateKiosk(id) {
        if (this.useMockMode) {
            return this.mockRequest({ id, active: true });
        }
        const response = await this.client.post(`/api/kiosks/${id}/activate`);
        return response.data;
    }
    async deactivateKiosk(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Kiosk deactivated successfully' });
        }
        const response = await this.client.post(`/api/kiosks/${id}/deactivate`);
        return response.data;
    }
    async generateKioskActivation() {
        try {
            const response = await this.client.post('/api/kiosks/activation');
            return response.data;
        }
        catch (error) {
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
    async getKioskSystems() {
        if (this.useMockMode) {
            return this.mockRequest({
                systems: ['Desktop', 'Laptop', 'Mobile', 'Network', 'Printer', 'Software', 'Account Access']
            });
        }
        const response = await this.client.get('/api/kiosks/systems');
        return response.data;
    }
    async updateKioskSystems(systems) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Kiosk systems updated successfully' });
        }
        const response = await this.client.put('/api/kiosks/systems', { systems });
        return response.data;
    }
    // Remote Kiosk Management
    async refreshKioskConfig(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Config refresh requested' });
        }
        const response = await this.client.post(`/api/kiosks/${id}/refresh-config`);
        return response.data;
    }
    async resetKiosk(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Kiosk reset successfully' });
        }
        const response = await this.client.post(`/api/kiosks/${id}/reset`);
        return response.data;
    }
    // Server Management
    async restartServer() {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Server restart initiated' });
        }
        const response = await this.client.post('/api/server/restart');
        return response.data;
    }
    async getServerStatus() {
        if (this.useMockMode) {
            return this.mockRequest({
                status: 'running',
                uptime: 12345,
                version: '1.0.0',
                nodeVersion: 'v18.0.0'
            });
        }
        const response = await this.client.get('/api/v1/server/status');
        return response.data;
    }
    // Logs/Tickets
    async getLogs() {
        if (this.useMockMode) {
            return this.mockRequest(mockLogs);
        }
        const response = await this.client.get('/api/logs');
        return response.data;
    }
    async deleteLog(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Log deleted successfully' });
        }
        const response = await this.client.delete(`/api/logs/${id}`);
        return response.data;
    }
    async exportLogs() {
        if (this.useMockMode) {
            // Create a mock CSV blob
            const csvContent = 'ID,Ticket ID,Name,Email,Title,System,Urgency,Timestamp\n' +
                mockLogs.map(log => `${log.id},${log.ticketId},${log.name},${log.email},${log.title},${log.system},${log.urgency},${log.timestamp}`).join('\n');
            return new Blob([csvContent], { type: 'text/csv' });
        }
        const response = await this.client.get('/api/logs/export', { responseType: 'blob' });
        return response.data;
    }
    async clearLogs() {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'All logs cleared successfully' });
        }
        const response = await this.client.delete('/api/logs');
        return response.data;
    }
    // Config
    async getConfig() {
        if (this.useMockMode) {
            return this.mockRequest(mockConfig);
        }
        const response = await this.client.get('/api/config');
        return response.data;
    }
    async updateConfig(config) {
        if (this.useMockMode) {
            const updatedConfig = { ...mockConfig, ...config };
            return this.mockRequest(updatedConfig);
        }
        const response = await this.client.put('/api/config', config);
        return response.data;
    }
    async getOrganizationBranding() {
        if (this.useMockMode) {
            return this.mockRequest({
                logoUrl: '/logo.png',
                welcomeMessage: 'Welcome',
                helpMessage: 'Need help?',
                primaryColor: '#1D4ED8',
                secondaryColor: '#9333EA'
            });
        }
        const response = await this.client.get('/api/v1/organizations/config');
        return response.data;
    }
    // Notifications
    async getNotifications() {
        if (this.useMockMode) {
            return this.mockRequest(mockNotifications);
        }
        const response = await this.client.get('/api/notifications');
        return response.data;
    }
    async createNotification(notification) {
        if (this.useMockMode) {
            const newNotification = {
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
        const response = await this.client.post('/api/notifications', payload);
        return response.data;
    }
    async deleteNotification(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Notification deleted successfully' });
        }
        const response = await this.client.delete(`/api/notifications/${id}`);
        return response.data;
    }
    // Directory
    async searchDirectory(query) {
        if (this.useMockMode) {
            const mockDirectoryUsers = mockUsers.map(user => ({
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                department: 'Engineering'
            })).filter(user => user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase()));
            return this.mockRequest(mockDirectoryUsers);
        }
        const response = await this.client.get(`/api/directory/search?q=${encodeURIComponent(query)}`);
        return response.data;
    }
    // Integrations
    async getIntegrations() {
        if (this.useMockMode) {
            return this.mockRequest(mockIntegrations);
        }
        const response = await this.client.get('/api/integrations');
        return response.data;
    }
    async createIntegration(integration) {
        if (this.useMockMode) {
            const newIntegration = { ...integration, id: Date.now() };
            return this.mockRequest(newIntegration);
        }
        const response = await this.client.post('/api/integrations', integration);
        return response.data;
    }
    async updateIntegration(id, integration) {
        if (this.useMockMode) {
            const existingIntegration = mockIntegrations.find(i => i.id === id) || mockIntegrations[0];
            const updatedIntegration = { ...existingIntegration, ...integration };
            return this.mockRequest(updatedIntegration);
        }
        const response = await this.client.put(`/api/integrations/${id}`, integration);
        return response.data;
    }
    async deleteIntegration(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Integration deleted successfully' });
        }
        const response = await this.client.delete(`/api/integrations/${id}`);
        return response.data;
    }
    async testIntegration(id) {
        if (this.useMockMode) {
            const integration = mockIntegrations.find(i => i.id === id);
            const success = integration?.working !== false;
            return this.mockRequest({
                message: success ? 'Integration test successful' : 'Integration test failed'
            });
        }
        const response = await this.client.post(`/api/integrations/${id}/test`);
        return response.data;
    }
    // Email accounts
    async getEmailAccounts() {
        if (this.useMockMode) {
            return this.mockRequest(mockEmailAccounts);
        }
        const res = await this.client.get('/api/email-accounts');
        return res.data;
    }
    async createEmailAccount(account) {
        if (this.useMockMode) {
            const newAcc = { ...account, id: Date.now() };
            return this.mockRequest(newAcc);
        }
        const res = await this.client.post('/api/email-accounts', account);
        return res.data;
    }
    async updateEmailAccount(id, account) {
        if (this.useMockMode) {
            const existing = mockEmailAccounts[0];
            const updated = { ...existing, ...account };
            return this.mockRequest(updated);
        }
        const res = await this.client.put(`/api/email-accounts/${id}`, account);
        return res.data;
    }
    async deleteEmailAccount(id) {
        if (this.useMockMode) {
            return this.mockRequest(undefined);
        }
        await this.client.delete(`/api/email-accounts/${id}`);
    }
    // Modules
    async getModules() {
        if (this.useMockMode) {
            return this.mockRequest(mockModules);
        }
        const response = await this.client.get('/api/v1/modules');
        return response.data.modules;
    }
    async updateModule(key, enabled) {
        if (this.useMockMode) {
            mockModules[key] = enabled;
            return this.mockRequest({ message: 'Module updated' });
        }
        const response = await this.client.put(`/api/v1/modules/${key}`, { enabled });
        return response.data;
    }
    // Catalog Items
    async getCatalogItems() {
        const response = await this.client.get('/api/v1/orbit/catalog');
        return response.data;
    }
    async createCatalogItem(data) {
        const response = await this.client.post('/api/catalog-items', data);
        return response.data;
    }
    async updateCatalogItem(id, data) {
        const response = await this.client.put(`/api/catalog-items/${id}`, data);
        return response.data;
    }
    async deleteCatalogItem(id) {
        const response = await this.client.delete(`/api/catalog-items/${id}`);
        return response.data;
    }
    // Assets
    async getAssets() {
        if (this.useMockMode) {
            const mockAssets = [
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
        const response = await this.client.get('/api/assets');
        return response.data;
    }
    async uploadAsset(file, type) {
        if (this.useMockMode) {
            const mockAsset = {
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
        const response = await this.client.post('/api/assets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    async deleteAsset(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Asset deleted successfully' });
        }
        const response = await this.client.delete(`/api/assets/${id}`);
        return response.data;
    }
    // Dashboard
    async getDashboardStats() {
        if (this.useMockMode) {
            return this.mockRequest(mockDashboardStats);
        }
        const response = await this.client.get('/api/dashboard/stats');
        return response.data;
    }
    async getActivityLogs() {
        if (this.useMockMode) {
            return this.mockRequest(mockDashboardStats.recentActivity);
        }
        const response = await this.client.get('/api/dashboard/activity');
        return response.data;
    }
    // Security Settings
    async getSecuritySettings() {
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
    async updateSecuritySettings(settings) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Security settings updated successfully' });
        }
        const response = await this.client.put('/api/security-settings', settings);
        return response.data;
    }
    // Notification Settings
    async getNotificationSettings() {
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
    async updateNotificationSettings(settings) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Notification settings updated successfully' });
        }
        const response = await this.client.put('/api/notification-settings', settings);
        return response.data;
    }
    // Kiosk Activations
    async getKioskActivations() {
        try {
            const response = await this.client.get('/api/kiosks/activations');
            // Ensure we always return an array
            if (Array.isArray(response.data)) {
                return response.data;
            }
            else {
                console.warn('API returned non-array data for kiosk activations:', response.data);
                return [];
            }
        }
        catch (error) {
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
    async getKioskConfig(id) {
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
                        currentStatus: 'open',
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
        const response = await this.client.get(`/api/kiosk-config/${id}`);
        return response.data;
    }
    async updateKioskConfig(id, config) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Kiosk configuration updated successfully' });
        }
        const response = await this.client.put(`/api/kiosk-config/${id}`, config);
        return response.data;
    }
    // Feedback
    async getFeedback() {
        if (this.useMockMode) {
            return this.mockRequest([]);
        }
        const response = await this.client.get('/api/feedback');
        return response.data;
    }
    async createFeedback(feedback) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Feedback submitted successfully' });
        }
        const response = await this.client.post('/api/feedback', feedback);
        return response.data;
    }
    // Password Management
    async verifyPassword(password) {
        if (this.useMockMode) {
            return this.mockRequest({ valid: true });
        }
        const response = await this.client.post('/api/verify-password', { password });
        return response.data;
    }
    async updateAdminPassword(currentPassword, newPassword) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Password updated successfully' });
        }
        const response = await this.client.put('/api/admin-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    }
    // Status Configuration
    async getStatusConfig() {
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
        const response = await this.client.get('/api/status-config');
        return response.data;
    }
    async updateStatusConfig(config) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Status configuration updated successfully' });
        }
        const response = await this.client.put('/api/status-config', config);
        return response.data;
    }
    // Directory Configuration
    async getDirectoryConfig() {
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
        const response = await this.client.get('/api/directory-config');
        return response.data;
    }
    async updateDirectoryConfig(config) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Directory configuration updated successfully' });
        }
        const response = await this.client.put('/api/directory-config', config);
        return response.data;
    }
    // SSO Configuration
    async getSSOConfig() {
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
        const response = await this.client.get('/api/sso-config');
        return response.data;
    }
    async getSSOAvailability() {
        if (this.useMockMode) {
            return this.mockRequest({ available: false });
        }
        const response = await this.client.get('/api/sso-available');
        return response.data;
    }
    // SCIM Configuration
    async getSCIMConfig() {
        if (this.useMockMode) {
            return this.mockRequest({
                enabled: false,
                token: '',
                endpoint: '/scim/v2'
            });
        }
        const response = await this.client.get('/api/scim-config');
        return response.data;
    }
    async updateSCIMConfig(config) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'SCIM configuration updated successfully' });
        }
        const response = await this.client.put('/api/scim-config', config);
        return response.data;
    }
    // Passkey Management
    async getPasskeys() {
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
        const response = await this.client.get('/api/passkeys');
        return response.data;
    }
    async deletePasskey(id) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Passkey deleted successfully' });
        }
        const response = await this.client.delete(`/api/passkeys/${id}`);
        return response.data;
    }
    async beginPasskeyRegistration(options) {
        if (this.useMockMode) {
            return this.mockRequest({
                challenge: 'mock-challenge',
                rp: { name: 'Nova Universe Portal', id: 'localhost' },
                user: { id: 'mock-user-id', name: 'mock@example.com', displayName: 'Mock User' },
                pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                timeout: 60000
            });
        }
        const response = await this.client.post('/api/passkey/register/begin', options);
        return response.data;
    }
    async completePasskeyRegistration(data) {
        if (this.useMockMode) {
            return this.mockRequest({ verified: true, message: 'Passkey registered successfully' });
        }
        const response = await this.client.post('/api/passkey/register/complete', data);
        return response.data;
    }
    async beginPasskeyAuthentication() {
        if (this.useMockMode) {
            return this.mockRequest({
                challenge: 'mock-auth-challenge',
                timeout: 60000,
                rpId: 'localhost',
                allowCredentials: [],
                challengeKey: 'mock-challenge-key'
            });
        }
        const response = await this.client.post('/api/passkey/authenticate/begin');
        return response.data;
    }
    async completePasskeyAuthentication(data) {
        if (this.useMockMode) {
            return this.mockRequest({
                verified: true,
                token: 'mock-jwt-token',
                user: { id: 1, name: 'Mock User', email: 'mock@example.com' }
            });
        }
        const response = await this.client.post('/api/passkey/authenticate/complete', data);
        return response.data;
    }
    // Admin Pin Management
    async updateAdminPins(pinConfig) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Admin pins updated successfully' });
        }
        const response = await this.client.put('/api/admin-pins', pinConfig);
        return response.data;
    }
    async validateAdminPin(pin, kioskId) {
        if (this.useMockMode) {
            return this.mockRequest({
                valid: true,
                permissions: ['admin', 'override_status', 'manage_settings']
            });
        }
        const response = await this.client.post('/api/admin-pins/validate', { pin, kioskId });
        return response.data;
    }
    // SSO Configuration
    async updateSSOConfig(config) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'SSO configuration updated successfully' });
        }
        const response = await this.client.put('/api/sso-config', config);
        return response.data;
    }
    // Kiosk Configuration Management
    async getKioskConfiguration(kioskId) {
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
        const response = await this.client.get(`/api/kiosks/${kioskId}/configuration`);
        return response.data;
    }
    async setKioskOverride(kioskId, configType, configData) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Kiosk override set successfully' });
        }
        const response = await this.client.put(`/api/kiosks/${kioskId}/overrides/${configType}`, configData);
        return response.data;
    }
    async removeKioskOverride(kioskId, configType) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Kiosk override removed successfully' });
        }
        const response = await this.client.delete(`/api/kiosks/${kioskId}/overrides/${configType}`);
        return response.data;
    }
    // Global Configuration Management
    async getGlobalConfiguration() {
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
        const response = await this.client.get('/api/configuration/global');
        return response.data;
    }
    async getConfigurationSummary() {
        if (this.useMockMode) {
            return this.mockRequest({
                totalKiosks: 5,
                globalOverrides: 0,
                kioskOverrides: 2,
                lastUpdated: new Date().toISOString()
            });
        }
        const response = await this.client.get('/api/configuration/summary');
        return response.data;
    }
    async updateGlobalConfiguration(config) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Global configuration updated successfully' });
        }
        const response = await this.client.put('/api/configuration/global', config);
        return response.data;
    }
    async setKioskConfigScope(kioskId, scope) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Kiosk configuration scope updated successfully' });
        }
        const response = await this.client.put(`/api/kiosks/${kioskId}/config-scope`, { scope });
        return response.data;
    }
    async resetAllKiosksToGlobal() {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'All kiosks reset to global configuration successfully' });
        }
        const response = await this.client.post('/api/configuration/reset-all-to-global');
        return response.data;
    }
    async applyGlobalConfigToAll(configType) {
        if (this.useMockMode) {
            return this.mockRequest({ message: `Global ${configType} configuration applied to all kiosks successfully` });
        }
        const response = await this.client.post('/api/configuration/apply-global-to-all', { configType });
        return response.data;
    }
    // Kiosk Status Management
    async updateKioskStatus(kioskId, status) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'Kiosk status updated successfully' });
        }
        const response = await this.client.put(`/api/kiosks/${kioskId}/status`, status);
        return response.data;
    }
    // Schedule Configuration
    async getKioskScheduleConfig(kioskId) {
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
        const response = await this.client.get(`/api/kiosks/${kioskId}/schedule-config`);
        return response.data;
    }
    // SMTP Testing
    async testSMTP(testEmail) {
        if (this.useMockMode) {
            return this.mockRequest({ message: 'SMTP test email sent successfully' });
        }
        const response = await this.client.post('/api/smtp/test', { email: testEmail });
        return response.data;
    }
    // Knowledge Base (Nova Lore)
    async getKnowledgeArticles(params = {}) {
        if (this.useMockMode) {
            return this.mockRequest([]);
        }
        const response = await this.client.get('/api/v1/lore/articles', { params });
        return response.data.articles;
    }
    async getKnowledgeArticle(slug) {
        const response = await this.client.get(`/api/v1/lore/articles/${slug}`);
        return response.data.article;
    }
    async getKnowledgeVersions(articleId) {
        const response = await this.client.get(`/api/v1/lore/articles/${articleId}/versions`);
        return response.data.versions;
    }
    async getKnowledgeComments(articleId) {
        const response = await this.client.get(`/api/v1/lore/articles/${articleId}/comments`);
        return response.data.comments;
    }
    async addKnowledgeComment(articleId, data) {
        if (this.useMockMode) {
            const mockComment = {
                id: crypto.randomUUID(),
                user: { id: '1', name: 'Mock User' },
                content: data.content,
                createdAt: new Date().toISOString(),
            };
            return this.mockRequest(mockComment);
        }
        const response = await this.client.post(`/api/v1/lore/articles/${articleId}/comments`, data);
        return response.data.comment;
    }
    async createKnowledgeArticle(data) {
        const response = await this.client.post('/api/v1/lore/articles', data);
        return response.data.article;
    }
    async createKnowledgeVersion(articleId, data) {
        const response = await this.client.post(`/api/v1/lore/articles/${articleId}/versions`, data);
        return response.data.version;
    }
    
    // Analytics
    async getAnalytics(timeRange = '7d') {
        if (this.useMockMode) {
            // Return comprehensive mock analytics data for development
            return this.mockRequest({
                ticketTrends: [
                    { date: '2024-01-01', created: 25, resolved: 20, pending: 5 },
                    { date: '2024-01-02', created: 30, resolved: 25, pending: 10 },
                    { date: '2024-01-03', created: 20, resolved: 30, pending: 0 },
                    { date: '2024-01-04', created: 35, resolved: 28, pending: 7 },
                    { date: '2024-01-05', created: 40, resolved: 35, pending: 12 },
                    { date: '2024-01-06', created: 28, resolved: 32, pending: 8 },
                    { date: '2024-01-07', created: 32, resolved: 30, pending: 10 },
                ],
                kioskMetrics: [
                    { name: 'Kiosk-001', uptime: 99.5, usage: 87, tickets: 45 },
                    { name: 'Kiosk-002', uptime: 98.2, usage: 92, tickets: 52 },
                    { name: 'Kiosk-003', uptime: 99.8, usage: 76, tickets: 38 },
                    { name: 'Kiosk-004', uptime: 97.1, usage: 88, tickets: 41 },
                    { name: 'Kiosk-005', uptime: 99.9, usage: 95, tickets: 58 },
                ],
                userActivity: [
                    { hour: '00:00', active_users: 12, tickets_created: 2 },
                    { hour: '02:00', active_users: 8, tickets_created: 1 },
                    { hour: '04:00', active_users: 5, tickets_created: 0 },
                    { hour: '06:00', active_users: 15, tickets_created: 3 },
                    { hour: '08:00', active_users: 45, tickets_created: 12 },
                    { hour: '10:00', active_users: 65, tickets_created: 18 },
                    { hour: '12:00', active_users: 78, tickets_created: 22 },
                    { hour: '14:00', active_users: 82, tickets_created: 25 },
                    { hour: '16:00', active_users: 69, tickets_created: 19 },
                    { hour: '18:00', active_users: 45, tickets_created: 11 },
                    { hour: '20:00', active_users: 32, tickets_created: 8 },
                    { hour: '22:00', active_users: 25, tickets_created: 5 },
                ],
                categoryDistribution: [
                    { category: 'Hardware Issues', count: 145, percentage: 35 },
                    { category: 'Software Problems', count: 120, percentage: 29 },
                    { category: 'Network Issues', count: 78, percentage: 19 },
                    { category: 'User Support', count: 52, percentage: 13 },
                    { category: 'Other', count: 18, percentage: 4 },
                ],
                responseTimeMetrics: [
                    { metric: 'Average Response Time', value: 2.5, target: 4.0, trend: -0.5 },
                    { metric: 'First Response Time', value: 1.2, target: 2.0, trend: -0.3 },
                    { metric: 'Resolution Time', value: 24.5, target: 48.0, trend: -2.1 },
                    { metric: 'Customer Satisfaction', value: 4.7, target: 4.5, trend: 0.2 },
                ],
                systemPerformance: [
                    { timestamp: '00:00', cpu_usage: 45, memory_usage: 62, disk_usage: 78, response_time: 120 },
                    { timestamp: '04:00', cpu_usage: 32, memory_usage: 58, disk_usage: 78, response_time: 98 },
                    { timestamp: '08:00', cpu_usage: 68, memory_usage: 72, disk_usage: 79, response_time: 145 },
                    { timestamp: '12:00', cpu_usage: 85, memory_usage: 81, disk_usage: 80, response_time: 180 },
                    { timestamp: '16:00', cpu_usage: 72, memory_usage: 75, disk_usage: 80, response_time: 165 },
                    { timestamp: '20:00', cpu_usage: 54, memory_usage: 68, disk_usage: 81, response_time: 132 },
                ],
            });
        }
        const response = await this.client.get(`/api/v1/analytics?timeRange=${timeRange}`);
        return response.data;
    }
    
    // API Keys
    async getApiKeys() {
        const response = await this.client.get('/api/v1/api-keys');
        return response.data.apiKeys;
    }
    async createApiKey(description) {
        const response = await this.client.post('/api/v1/api-keys', { description });
        return response.data;
    }
    async deleteApiKey(key) {
        const response = await this.client.delete(`/api/v1/api-keys/${key}`);
        return response.data;
    }
}
export const api = new ApiClient();
