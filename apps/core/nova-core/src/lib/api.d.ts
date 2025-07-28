import type { User, Role, Permission, Kiosk, Log, Config, Notification, DirectoryUser, Integration, KioskActivation, KioskConfig, Asset, ApiResponse, LoginCredentials, AuthToken, DashboardStats, ActivityLog } from '@/types';
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
    getNotifications(): Promise<Notification[]>;
    createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
    deleteNotification(id: number): Promise<ApiResponse>;
    searchDirectory(query: string): Promise<DirectoryUser[]>;
    getIntegrations(): Promise<Integration[]>;
    createIntegration(integration: Omit<Integration, 'id'>): Promise<Integration>;
    updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration>;
    deleteIntegration(id: number): Promise<ApiResponse>;
    testIntegration(id: number): Promise<ApiResponse>;
    getAssets(): Promise<Asset[]>;
    uploadAsset(file: File, type: Asset['type']): Promise<Asset>;
    deleteAsset(id: number): Promise<ApiResponse>;
    getDashboardStats(): Promise<DashboardStats>;
    getActivityLogs(): Promise<ActivityLog[]>;
    getSecuritySettings(): Promise<any>;
    updateSecuritySettings(settings: any): Promise<ApiResponse>;
    getNotificationSettings(): Promise<any>;
    updateNotificationSettings(settings: any): Promise<ApiResponse>;
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
    updateStatusConfig(config: any): Promise<ApiResponse>;
    getDirectoryConfig(): Promise<any>;
    updateDirectoryConfig(config: any): Promise<ApiResponse>;
    getSSOConfig(): Promise<any>;
    getSSOAvailability(): Promise<{
        available: boolean;
        loginUrl?: string;
    }>;
    getSCIMConfig(): Promise<any>;
    updateSCIMConfig(config: any): Promise<ApiResponse>;
    getPasskeys(): Promise<any[]>;
    deletePasskey(id: string): Promise<ApiResponse>;
    beginPasskeyRegistration(options: any): Promise<any>;
    completePasskeyRegistration(data: any): Promise<ApiResponse>;
    beginPasskeyAuthentication(): Promise<any>;
    completePasskeyAuthentication(data: any): Promise<{
        verified: boolean;
        token?: string;
        user?: any;
    }>;
    updateAdminPins(pinConfig: {
        globalPin?: string;
        kioskPins?: Record<string, string>;
    }): Promise<ApiResponse>;
    validateAdminPin(pin: string, kioskId?: string): Promise<{
        valid: boolean;
        permissions: string[];
    }>;
    updateSSOConfig(config: any): Promise<ApiResponse>;
    getKioskConfiguration(kioskId: string): Promise<any>;
    setKioskOverride(kioskId: string, configType: string, configData: any): Promise<ApiResponse>;
    removeKioskOverride(kioskId: string, configType: string): Promise<ApiResponse>;
    getGlobalConfiguration(): Promise<any>;
    getConfigurationSummary(): Promise<any>;
    updateGlobalConfiguration(config: any): Promise<ApiResponse>;
    setKioskConfigScope(kioskId: string, scope: string): Promise<ApiResponse>;
    resetAllKiosksToGlobal(): Promise<ApiResponse>;
    applyGlobalConfigToAll(configType: string): Promise<ApiResponse>;
    updateKioskStatus(kioskId: string, status: {
        active: boolean;
    }): Promise<ApiResponse>;
    getKioskScheduleConfig(kioskId: string): Promise<any>;
    testSMTP(testEmail: string): Promise<ApiResponse>;
}
export declare const api: ApiClient;
export {};
//# sourceMappingURL=api.d.ts.map