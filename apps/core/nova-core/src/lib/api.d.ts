import type { User, Role, Permission, Kiosk, Log, Config, Notification, DirectoryUser, Integration, KioskActivation, KioskConfig, Asset, KnowledgeArticle, KnowledgeArticleVersion, ApiKey, ApiResponse, LoginCredentials, AuthToken, DashboardStats, ActivityLog, EmailAccount } from '@/types';
declare class ApiClient {
    private client;
    private useMockMode;
    constructor();
    private getServerUrl;
    private mockRequest;
    login(credentials: LoginCredentials): Promise<AuthToken>;
    me(token?: string): Promise<User>;
    getUsers(): Promise<User[]>;
    createUser(user: Omit<User, 'id'>): Promise<User>;
    updateUser(id: number, user: Partial<User>): Promise<User>;
    deleteUser(id: number): Promise<ApiResponse>;
    updateVipStatus(id: number, data: {
        isVip: boolean;
        vipLevel?: string;
    }): Promise<ApiResponse>;
    getVipProxies(): Promise<any[]>;
    createVipProxy(data: {
        vipId: string;
        proxyId: string;
        expiresAt?: string;
    }): Promise<ApiResponse>;
    deleteVipProxy(id: number): Promise<ApiResponse>;
    getVipHeatmap(): Promise<any[]>;
    getRoles(): Promise<Role[]>;
    getPermissions(): Promise<Permission[]>;
    createRole(role: Omit<Role, 'id'>): Promise<Role>;
    updateRole(id: number, role: Partial<Role>): Promise<ApiResponse>;
    deleteRole(id: number): Promise<ApiResponse>;
    getKiosks(): Promise<Kiosk[]>;
    updateKiosk(id: string, kiosk: Partial<Kiosk>): Promise<Kiosk>;
    deleteKiosk(id: string): Promise<ApiResponse>;
    activateKiosk(id: string): Promise<Partial<Kiosk>>;
    deactivateKiosk(id: string): Promise<ApiResponse>;
    generateKioskActivation(): Promise<KioskActivation>;
    getKioskSystems(): Promise<{
        systems: string[];
    }>;
    updateKioskSystems(systems: string[]): Promise<ApiResponse>;
    refreshKioskConfig(id: string): Promise<ApiResponse>;
    resetKiosk(id: string): Promise<ApiResponse>;
    restartServer(): Promise<ApiResponse>;
    getServerStatus(): Promise<any>;
    getLogs(): Promise<Log[]>;
    deleteLog(id: number): Promise<ApiResponse>;
    exportLogs(): Promise<Blob>;
    clearLogs(): Promise<ApiResponse>;
    getConfig(): Promise<Config>;
    updateConfig(config: Partial<Config>): Promise<Config>;
    getOrganizationBranding(): Promise<OrganizationBranding>;
    getNotifications(): Promise<Notification[]>;
    createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
    deleteNotification(id: number): Promise<ApiResponse>;
    searchDirectory(query: string): Promise<DirectoryUser[]>;
    getIntegrations(): Promise<Integration[]>;
    createIntegration(integration: Omit<Integration, 'id'>): Promise<Integration>;
    updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration>;
    deleteIntegration(id: number): Promise<ApiResponse>;
    testIntegration(id: number): Promise<ApiResponse>;
    getEmailAccounts(): Promise<EmailAccount[]>;
    createEmailAccount(account: Omit<EmailAccount, 'id'>): Promise<EmailAccount>;
    updateEmailAccount(id: number, account: Partial<EmailAccount>): Promise<EmailAccount>;
    deleteEmailAccount(id: number): Promise<void>;
    getModules(): Promise<Record<string, boolean>>;
    updateModule(key: string, enabled: boolean): Promise<ApiResponse>;
    getCatalogItems(): Promise<RequestCatalogItem[]>;
    createCatalogItem(data: Omit<RequestCatalogItem, 'id'>): Promise<RequestCatalogItem>;
    updateCatalogItem(id: number, data: Partial<RequestCatalogItem>): Promise<ApiResponse>;
    deleteCatalogItem(id: number): Promise<ApiResponse>;
    getAssets(): Promise<Asset[]>;
    uploadAsset(file: File, type: Asset['type']): Promise<Asset>;
    deleteAsset(id: number): Promise<ApiResponse>;
    getDashboardStats(): Promise<DashboardStats>;
    getActivityLogs(): Promise<ActivityLog[]>;
    getSecuritySettings(): Promise<any>;
    updateSecuritySettings(settings: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse>;
    getNotificationSettings(): Promise<any>;
    updateNotificationSettings(settings: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse>;
    getKioskActivations(): Promise<KioskActivation[]>;
    getKioskConfig(id: string): Promise<KioskConfig>;
    updateKioskConfig(id: string, config: Partial<Kiosk>): Promise<ApiResponse>;
    getFeedback(): Promise<any[]>;
    createFeedback(feedback: {
        message: string;
        rating?: number;
    }): Promise<ApiResponse>;
    verifyPassword(password: string): Promise<{
        valid: boolean;
    }>;
    updateAdminPassword(currentPassword: string, newPassword: string): Promise<ApiResponse>;
    getStatusConfig(): Promise<any>;
    updateStatusConfig(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse>;
    getDirectoryConfig(): Promise<any>;
    updateDirectoryConfig(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse>;
    getSSOConfig(): Promise<any>;
    getSSOAvailability(): Promise<{
        available: boolean;
        loginUrl?: string;
    }>;
    getSCIMConfig(): Promise<any>;
    updateSCIMConfig(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse>;
    getPasskeys(): Promise<any[]>;
    deletePasskey(id: string): Promise<ApiResponse>;
    beginPasskeyRegistration(options: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<any>;
    completePasskeyRegistration(data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse>;
    beginPasskeyAuthentication(): Promise<any>;
    completePasskeyAuthentication(data: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<{
        verified: boolean;
        token?: string;
        user?: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types;
    }>;
    updateAdminPins(pinConfig: {
        globalPin?: string;
        kioskPins?: Record<string, string>;
    }): Promise<ApiResponse>;
    validateAdminPin(pin: string, kioskId?: string): Promise<{
        valid: boolean;
        permissions: string[];
    }>;
    updateSSOConfig(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse>;
    getKioskConfiguration(kioskId: string): Promise<any>;
    setKioskOverride(kioskId: string, configType: string, configData: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse>;
    removeKioskOverride(kioskId: string, configType: string): Promise<ApiResponse>;
    getGlobalConfiguration(): Promise<any>;
    getConfigurationSummary(): Promise<any>;
    updateGlobalConfiguration(config: any // eslint-disable-line @typescript-eslint/no-explicit-any -- TODO-LINT: refine types): Promise<ApiResponse>;
    setKioskConfigScope(kioskId: string, scope: string): Promise<ApiResponse>;
    resetAllKiosksToGlobal(): Promise<ApiResponse>;
    applyGlobalConfigToAll(configType: string): Promise<ApiResponse>;
    updateKioskStatus(kioskId: string, status: {
        active: boolean;
    }): Promise<ApiResponse>;
    getKioskScheduleConfig(kioskId: string): Promise<any>;
    testSMTP(testEmail: string): Promise<ApiResponse>;
    getKnowledgeArticles(params?: {
        search?: string;
    }): Promise<KnowledgeArticle[]>;
    getKnowledgeArticle(slug: string): Promise<KnowledgeArticle>;
    getKnowledgeVersions(articleId: number): Promise<KnowledgeArticleVersion[]>;
    getKnowledgeComments(articleId: number): Promise<any[]>;
    addKnowledgeComment(articleId: number, data: {
        content: string;
    }): Promise<any>;
    createKnowledgeArticle(data: {
        title: string;
        content: string;
        tags?: string[];
    }): Promise<KnowledgeArticle>;
    createKnowledgeVersion(articleId: number, data: {
        content: string;
    }): Promise<KnowledgeArticleVersion>;
    getApiKeys(): Promise<ApiKey[]>;
    createApiKey(description?: string): Promise<{
        apiKey: ApiKey;
    }>;
    deleteApiKey(key: string): Promise<ApiResponse>;
}
export declare const api: ApiClient;
export {};
//# sourceMappingURL=api.d.ts.map