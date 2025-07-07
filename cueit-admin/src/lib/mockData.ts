import type { User, Kiosk, Log, Config, Notification, Integration, DashboardStats, Role, Permission } from '@/types';

// Mock data for development when API is not available
export const mockUsers: User[] = [
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

export const mockKiosks: Kiosk[] = [
  {
    id: 'kiosk-001',
    lastSeen: new Date().toISOString(),
    version: '2.1.0',
    active: true,
    logoUrl: '',
    bgUrl: '',
    statusEnabled: true,
    currentStatus: 'open',
    openMsg: 'IT Support is available',
    closedMsg: 'IT Support is closed',
    errorMsg: 'System error occurred'
  },
  {
    id: 'kiosk-002',
    lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    version: '2.0.5',
    active: true,
    logoUrl: '',
    bgUrl: '',
    statusEnabled: true,
    currentStatus: 'closed',
    openMsg: 'IT Support is available',
    closedMsg: 'IT Support is closed',
    errorMsg: 'System error occurred'
  },
  {
    id: 'kiosk-003',
    lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    version: '2.1.0',
    active: false,
    logoUrl: '',
    bgUrl: '',
    statusEnabled: false,
    currentStatus: 'error',
    openMsg: 'IT Support is available',
    closedMsg: 'IT Support is closed',
    errorMsg: 'System error occurred'
  }
];

export const mockLogs: Log[] = [
  {
    id: 1,
    ticketId: 'TKT-001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    title: 'Computer not turning on',
    system: 'Desktop',
    urgency: 'Medium',
    timestamp: new Date().toISOString(),
    emailStatus: 'success',
    serviceNowId: 'INC0010001'
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
    emailStatus: 'success',
    serviceNowId: 'INC0010002'
  }
];

export const mockConfig: Config = {
  logoUrl: 'https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=CueIT',
  faviconUrl: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=C',
  welcomeMessage: 'Welcome to CueIT Support',
  helpMessage: 'Please describe your issue and we will help you',
  statusOpenMsg: 'IT Support is available',
  statusClosedMsg: 'IT Support is currently closed',
  statusErrorMsg: 'There is a system error, please try again later',
  systems: 'Desktop,Laptop,Mobile,Network,Printer',
  urgencies: 'Low,Medium,High,Critical',
  directoryEnabled: true,
  directoryProvider: 'activedirectory',
  directoryUrl: 'ldap://company.local',
  directoryToken: ''
};

export const mockIntegrations: Integration[] = [
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
  },
  {
    id: 3,
    name: 'ServiceNow Dev',
    type: 'servicenow',
    enabled: false,
    settings: {},
    config: {
      instanceUrl: 'https://company-dev.service-now.com',
      username: 'api_user'
    },
    working: false,
    lastError: 'Authentication failed'
  }
];

export const mockRoles: Role[] = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'support' },
  { id: 3, name: 'user' },
  { id: 4, name: 'readonly' }
];

export const mockPermissions: Permission[] = [
  { id: 1, name: 'users.create' },
  { id: 2, name: 'users.edit' },
  { id: 3, name: 'users.delete' },
  { id: 4, name: 'kiosks.manage' },
  { id: 5, name: 'tickets.view' },
  { id: 6, name: 'tickets.edit' },
  { id: 7, name: 'settings.manage' }
];

export const mockNotifications: Notification[] = [
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

export const mockDashboardStats: DashboardStats = {
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
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate API errors
export const shouldSimulateError = (errorRate: number = 0.1) => Math.random() < errorRate;
