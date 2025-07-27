export interface User {
    id: number;
    name: string;
    email: string;
    disabled?: boolean;
    is_default?: boolean;
    roles?: string[];
    permissions?: string[];
}
export interface Role {
    id: number;
    name: string;
}
export interface Permission {
    id: number;
    name: string;
}
export interface TimeSlot {
    start: string;
    end: string;
}
export interface DaySchedule {
    enabled: boolean;
    slots: TimeSlot[];
}
export interface WeeklySchedule {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
}
export interface ScheduleConfig {
    enabled: boolean;
    schedule: WeeklySchedule;
    timezone: string;
}
export interface OfficeHours {
    enabled: boolean;
    title: string;
    schedule: WeeklySchedule;
    timezone: string;
    showNextOpen: boolean;
}
export interface Kiosk {
    id: string;
    lastSeen: string;
    version: string;
    active: boolean;
    configScope: ConfigScope;
    hasOverrides: boolean;
    overrideCount: number;
    effectiveConfig: {
        logoUrl?: string;
        bgUrl?: string;
        statusEnabled: boolean;
        currentStatus: 'open' | 'closed' | 'error' | 'meeting' | 'brb' | 'lunch';
        openMsg: string;
        closedMsg: string;
        errorMsg: string;
        schedule?: ScheduleConfig;
        officeHours?: OfficeHours;
    };
    overrides?: {
        status?: ConfigOverride;
        schedule?: ConfigOverride;
        officeHours?: ConfigOverride;
        branding?: ConfigOverride;
    };
}
export interface Log {
    id: number;
    ticketId: string;
    name: string;
    email: string;
    title: string;
    system: string;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    timestamp: string;
    emailStatus: 'success' | 'fail';
    serviceNowId?: string;
}
export interface Config {
    logoUrl: string;
    faviconUrl: string;
    kioskLogoUrl?: string;
    welcomeMessage: string;
    helpMessage: string;
    statusOpenMsg: string;
    statusClosedMsg: string;
    statusErrorMsg: string;
    systems?: string;
    urgencies?: string;
    directoryEnabled: boolean;
    directoryProvider: string;
    directoryUrl?: string;
    directoryToken?: string;
}
export interface Notification {
    id: number;
    message: string;
    type: 'ticket' | 'system' | 'integration';
    level?: 'info' | 'warning' | 'error' | 'critical';
    read: boolean;
    createdAt: string;
}
export interface DirectoryUser {
    id?: string;
    name: string;
    email: string;
    department?: string;
}
export interface Integration {
    id: number;
    name: string;
    type: 'smtp' | 'helpscout' | 'servicenow' | 'slack' | 'teams' | 'webhook';
    enabled: boolean;
    settings: Record<string, unknown>;
    config?: Record<string, unknown>;
    working?: boolean;
    lastError?: string;
}
export interface KioskActivation {
    id: string;
    code: string;
    qrCode: string;
    expiresAt: string;
    used: boolean;
    usedAt?: string;
    createdAt: string;
}
export interface Asset {
    id: number;
    name: string;
    type: 'logo' | 'favicon' | 'background';
    url: string;
    uploadedAt: string;
}
export interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> extends ApiResponse {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
export interface LoginCredentials {
    email: string;
    password: string;
}
export interface AuthToken {
    token: string;
}
export interface DashboardStats {
    totalKiosks: number;
    activeKiosks: number;
    totalTickets: number;
    openTickets: number;
    pendingTickets?: number;
    resolvedTickets: number;
    totalUsers: number;
    recentActivity: ActivityLog[];
}
export interface ActivityLog {
    id: number;
    type: string;
    message: string;
    timestamp: string;
}
export interface SecuritySettings {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordRequireSymbols: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireUppercase: boolean;
    twoFactorRequired: boolean;
    auditLogging: boolean;
}
export interface NotificationSettings {
    emailNotifications: boolean;
    slackNotifications: boolean;
    ticketCreatedNotify: boolean;
    kioskOfflineNotify: boolean;
    systemErrorNotify: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
    notificationRetention: number;
}
export interface KioskConfig {
    kiosk: Kiosk;
    config: {
        logoUrl: string;
        faviconUrl: string;
        welcomeMessage: string;
        helpMessage: string;
        statusOpenMsg: string;
        statusClosedMsg: string;
        statusErrorMsg: string;
        systems: string[];
    };
}
export interface KioskAdminLoginRequest {
    email: string;
    password: string;
    kioskId: string;
}
export interface KioskAdminLoginResponse {
    success: boolean;
    token?: string;
    admin?: {
        id: string;
        email: string;
        name: string;
    };
    error?: string;
}
export type ConfigScope = 'global' | 'individual';
export interface ConfigOverride {
    scope: ConfigScope;
    kioskId?: string;
    overriddenAt: string;
    overriddenBy: string;
}
export interface KioskConfiguration {
    id: string;
    statusConfig?: {
        override: ConfigOverride;
        enabled: boolean;
        currentStatus: 'open' | 'closed' | 'meeting' | 'brb' | 'lunch';
        customMessages?: {
            openMessage?: string;
            closedMessage?: string;
            meetingMessage?: string;
            brbMessage?: string;
            lunchMessage?: string;
        };
    };
    scheduleConfig?: {
        override: ConfigOverride;
        schedule: ScheduleConfig;
    };
    officeHoursConfig?: {
        override: ConfigOverride;
        officeHours: OfficeHours;
    };
    brandingConfig?: {
        override: ConfigOverride;
        logoUrl?: string;
        backgroundUrl?: string;
        welcomeMessage?: string;
        helpMessage?: string;
    };
}
export interface GlobalConfiguration {
    defaultStatus: {
        enabled: boolean;
        currentStatus: 'open' | 'closed' | 'meeting' | 'brb' | 'lunch';
        messages: {
            openMessage: string;
            closedMessage: string;
            meetingMessage: string;
            brbMessage: string;
            lunchMessage: string;
        };
    };
    defaultSchedule: ScheduleConfig;
    defaultOfficeHours: OfficeHours;
    defaultBranding: {
        logoUrl: string;
        backgroundUrl?: string;
        welcomeMessage: string;
        helpMessage: string;
    };
    systems: string[];
}
export interface ConfigurationSummary {
    totalKiosks: number;
    globallyManaged: number;
    individuallyManaged: number;
    overridesByType: {
        status: number;
        schedule: number;
        officeHours: number;
        branding: number;
    };
}
export interface KioskConfigUpdate {
    type: 'status' | 'schedule' | 'branding';
    data: any;
    timestamp: string;
    source: 'kiosk' | 'admin';
    kioskId: string;
}
export interface KioskRemoteConfig {
    config: {
        statusEnabled: boolean;
        currentStatus: 'open' | 'closed' | 'meeting' | 'brb' | 'lunch';
        openMsg: string;
        closedMsg: string;
        errorMsg: string;
        logoUrl: string;
        backgroundUrl?: string;
        welcomeMessage: string;
        helpMessage: string;
        schedule: ScheduleConfig;
        officeHours: OfficeHours;
    };
    adminPins: {
        global?: string;
        kiosk?: string;
    };
    lastUpdate: string;
    version: number;
    permissions: {
        canEditStatus: boolean;
        canEditSchedule: boolean;
        canEditBranding: boolean;
        canEditOfficeHours: boolean;
    };
}
export interface AdminPinValidation {
    valid: boolean;
    token?: string;
    permissions: string[];
    expiresAt: string;
    pinType?: 'global' | 'kiosk-specific';
}
export interface AdminSession {
    token: string;
    expiresAt: string;
    permissions: string[];
    kioskId?: string;
    createdAt: string;
}
export interface KioskWithSync extends Kiosk {
    lastSyncAt?: string;
    configVersion?: number;
    pendingUpdates?: KioskConfigUpdate[];
    syncStatus: 'synced' | 'pending' | 'conflict' | 'offline';
}
export interface DirectoryConfig {
    enabled: boolean;
    provider: 'mock' | 'scim' | 'ldap' | 'activedirectory';
    url?: string;
    token?: string;
    baseDN?: string;
    bindDN?: string;
    bindPassword?: string;
    userFilter?: string;
    syncInterval?: number;
    readonly?: boolean;
}
export interface SAMLConfig {
    enabled: boolean;
    entryPoint?: string;
    issuer?: string;
    callbackUrl?: string;
    cert?: string;
    signatureAlgorithm?: string;
    digestAlgorithm?: string;
    authnContextClassRef?: string;
    attributeMapping?: {
        email?: string;
        displayName?: string;
        firstName?: string;
        lastName?: string;
        groups?: string;
    };
}
export interface SSOConfig {
    enabled: boolean;
    provider: 'saml' | 'oauth2' | 'oidc';
    saml?: SAMLConfig;
    oauth2?: {
        enabled: boolean;
        clientId?: string;
        clientSecret?: string;
        authorizationUrl?: string;
        tokenUrl?: string;
        userInfoUrl?: string;
        scope?: string;
    };
    oidc?: {
        enabled: boolean;
        discoveryUrl?: string;
        clientId?: string;
        clientSecret?: string;
        scope?: string;
    };
}
export interface SCIMConfig {
    enabled: boolean;
    token?: string;
    endpoint?: string;
    autoProvisioning?: boolean;
    autoDeprovisioning?: boolean;
    syncInterval?: number;
    lastSync?: string;
    userMapping?: {
        displayName?: string;
        email?: string;
        groups?: string;
    };
    groupMapping?: Record<string, string>;
}
//# sourceMappingURL=index.d.ts.map