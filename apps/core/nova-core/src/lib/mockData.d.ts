import type { User, Kiosk, Log, Config, Notification, Integration, EmailAccount, DashboardStats, Role, Permission } from '@/types';
export declare const mockUsers: User[];
export declare const mockKiosks: Kiosk[];
export declare const mockLogs: Log[];
export declare const mockConfig: Config;
export declare const mockIntegrations: Integration[];
export declare const mockEmailAccounts: EmailAccount[];
export declare const mockModules: Record<string, boolean>;
export declare const mockRoles: Role[];
export declare const mockPermissions: Permission[];
export declare const mockNotifications: Notification[];
export declare const mockDashboardStats: DashboardStats;
export declare const delay: (ms: number) => Promise<unknown>;
export declare const shouldSimulateError: (errorRate?: number) => boolean;
//# sourceMappingURL=mockData.d.ts.map