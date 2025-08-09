// Mock data for development when API is not available
export const mockUsers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        roles: ['admin'],
        permissions: ['users.create', 'users.edit', 'users.delete', 'kiosks.manage']
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        roles: ['user'],
        permissions: ['tickets.view']
    },
    {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob@example.com',
        roles: ['support'],
        permissions: ['tickets.view', 'tickets.edit']
    }
];
export const mockKiosks = [
    {
        id: 'kiosk-001',
        lastSeen: new Date().toISOString(),
        version: '2.1.0',
        active: true,
        configScope: 'global',
        hasOverrides: false,
        overrideCount: 0,
        effectiveConfig: {
            logoUrl: 'https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=Nova+Universe',
            bgUrl: '',
            statusEnabled: true,
            currentStatus: 'open',
            openMsg: 'Help Desk is Open',
            closedMsg: 'Help Desk is Closed',
            errorMsg: 'System error occurred'
        }
    },
    {
        id: 'kiosk-002',
        lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        version: '2.0.5',
        active: true,
        configScope: 'individual',
        hasOverrides: true,
        overrideCount: 3,
        effectiveConfig: {
            logoUrl: 'https://via.placeholder.com/200x60/FF6B35/FFFFFF?text=Reception',
            bgUrl: '',
            statusEnabled: true,
            currentStatus: 'meeting',
            openMsg: 'Reception is available',
            closedMsg: 'Reception is closed',
            errorMsg: 'System maintenance'
        },
        overrides: {
            status: {
                scope: 'individual',
                kioskId: 'kiosk-002',
                overriddenAt: new Date().toISOString(),
                overriddenBy: 'admin@example.com'
            },
            branding: {
                scope: 'individual',
                kioskId: 'kiosk-002',
                overriddenAt: new Date().toISOString(),
                overriddenBy: 'admin@example.com'
            },
            schedule: {
                scope: 'individual',
                kioskId: 'kiosk-002',
                overriddenAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                overriddenBy: 'manager@example.com'
            }
        }
    },
    {
        id: 'kiosk-003',
        lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        version: '2.1.0',
        active: false,
        configScope: 'individual',
        hasOverrides: true,
        overrideCount: 1,
        effectiveConfig: {
            logoUrl: 'https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=Nova+Universe',
            bgUrl: '',
            statusEnabled: false,
            currentStatus: 'closed',
            openMsg: 'IT Support Available',
            closedMsg: 'IT Support Currently Closed - Back at 8 AM',
            errorMsg: 'System error occurred'
        },
        overrides: {
            officeHours: {
                scope: 'individual',
                kioskId: 'kiosk-003',
                overriddenAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                overriddenBy: 'it-admin@example.com'
            }
        }
    }
];
export const mockLogs = [
    {
        id: 1,
        ticketId: 'TKT-001',
        name: 'John Doe',
        email: 'john.doe@company.com',
        title: 'Computer not turning on',
        system: 'Desktop',
        urgency: 'Medium',
        timestamp: new Date().toISOString(),
        emailStatus: 'success'
    },
    {
        id: 2,
        ticketId: 'TKT-002',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        title: 'Application crashing repeatedly',
        system: 'Laptop',
        urgency: 'Critical',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        emailStatus: 'success'
    }
];
export const mockConfig = {
    organizationName: 'Nova Universe',
    logoUrl: 'https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=Nova+Universe',
    faviconUrl: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=N',
    primaryColor: '#1D4ED8',
    secondaryColor: '#9333EA',
    welcomeMessage: 'Welcome to Nova Universe Support',
    helpMessage: 'Please describe your issue and we will help you',
    statusOpenMsg: 'IT Support is available',
    statusClosedMsg: 'IT Support is currently closed',
    statusErrorMsg: 'There is a system error, please try again later',
    rateLimitWindow: 900000,
    rateLimitMax: 100,
    systems: 'Desktop,Laptop,Mobile,Network,Printer',
    urgencies: 'Low,Medium,High,Critical',
    directoryEnabled: true,
    directoryProvider: 'activedirectory',
    directoryUrl: 'ldap://company.local',
    directoryToken: ''
};
export const mockIntegrations = [
    {
        id: 1,
        name: 'Company SMTP',
        type: 'smtp',
        enabled: true,
        settings: {},
        config: {
            host: 'smtp.company.com',
            port: 587,
            secure: true,
            username: 'noreply@company.com'
        },
        working: true
    },
    {
        id: 2,
        name: 'Help Scout',
        type: 'helpscout',
        enabled: true,
        settings: {},
        config: {
            apiKey: 'hs_***',
            mailboxId: '123456'
        },
        working: true
    }
];
export const mockEmailAccounts = [
    {
        id: 1,
        queue: 'IT',
        address: 'it@company.com',
        displayName: 'IT Queue',
        enabled: true,
        graphImpersonation: false,
        autoCreateTickets: true,
        webhookMode: false,
        lastSynced: new Date().toISOString(),
    },
];
export const mockModules = {
    pulse: true,
    orbit: true,
    comms: false,
    beacon: true,
    synth: false,
};
export const mockRoles = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'support' },
    { id: 3, name: 'user' },
    { id: 4, name: 'readonly' }
];
export const mockPermissions = [
    { id: 1, name: 'users.create' },
    { id: 2, name: 'users.edit' },
    { id: 3, name: 'users.delete' },
    { id: 4, name: 'kiosks.manage' },
    { id: 5, name: 'tickets.view' },
    { id: 6, name: 'tickets.edit' },
    { id: 7, name: 'settings.manage' }
];
export const mockNotifications = [
    {
        id: 1,
        message: 'New ticket submitted from Kiosk 001',
        createdAt: new Date().toISOString(),
        read: false,
        type: 'ticket'
    },
    {
        id: 2,
        message: 'Kiosk 003 went offline',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        read: false,
        type: 'system'
    },
    {
        id: 3,
        message: 'Integration test successful for Help Scout',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        type: 'integration'
    }
];
export const mockDashboardStats = {
    totalTickets: 156,
    openTickets: 23,
    resolvedTickets: 133,
    totalKiosks: 12,
    activeKiosks: 9,
    totalUsers: 45,
    recentActivity: [
        {
            id: 1,
            type: 'ticket_created',
            message: 'New ticket from John Doe',
            timestamp: new Date().toISOString()
        },
        {
            id: 2,
            type: 'kiosk_offline',
            message: 'Kiosk 003 went offline',
            timestamp: new Date(Date.now() - 900000).toISOString()
        }
    ]
};
// Helper function to simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// Helper function to simulate API errors
export const shouldSimulateError = (errorRate = 0.1) => Math.random() < errorRate;
