// Production-ready data structures with comprehensive mock data for development
export const mockUsers = [
    {
        id: 1,
        name: 'Administrator',
        email: 'admin@nova-universe.com',
        roles: ['admin', 'superuser'],
        permissions: [
            'users.create', 'users.edit', 'users.delete', 'users.view',
            'kiosks.manage', 'kiosks.configure', 'kiosks.monitor',
            'tickets.view', 'tickets.edit', 'tickets.assign', 'tickets.close',
            'inventory.manage', 'inventory.import', 'inventory.export',
            'reports.view', 'reports.export', 'settings.manage',
            'integrations.configure', 'audit.view'
        ],
        lastLogin: new Date().toISOString(),
        created: new Date(Date.now() - 86400000 * 30).toISOString(),
        status: 'active',
        department: 'IT Administration',
        phone: '+1-555-0101',
        timezone: 'America/New_York'
    },
    {
        id: 2,
        name: 'Sarah Chen',
        email: 'sarah.chen@nova-universe.com',
        roles: ['technician', 'it-support'],
        permissions: [
            'tickets.view', 'tickets.edit', 'tickets.assign', 'tickets.comment',
            'inventory.view', 'inventory.assign', 'kiosks.view',
            'users.view', 'reports.view'
        ],
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        created: new Date(Date.now() - 86400000 * 90).toISOString(),
        status: 'active',
        department: 'IT Support',
        phone: '+1-555-0102',
        timezone: 'America/New_York'
    },
    {
        id: 3,
        name: 'Michael Rodriguez',
        email: 'mike.rodriguez@nova-universe.com',
        roles: ['hr-support', 'user'],
        permissions: [
            'tickets.view', 'tickets.edit', 'tickets.comment',
            'users.view', 'hr.access'
        ],
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        created: new Date(Date.now() - 86400000 * 60).toISOString(),
        status: 'active',
        department: 'Human Resources',
        phone: '+1-555-0103',
        timezone: 'America/New_York'
    },
    {
        id: 4,
        name: 'Emily Johnson',
        email: 'emily.johnson@nova-universe.com',
        roles: ['user'],
        permissions: ['tickets.view', 'tickets.create'],
        lastLogin: new Date(Date.now() - 1800000).toISOString(),
        created: new Date(Date.now() - 86400000 * 45).toISOString(),
        status: 'active',
        department: 'Marketing',
        phone: '+1-555-0104',
        timezone: 'America/New_York'
    },
    {
        id: 5,
        name: 'David Kim',
        email: 'david.kim@nova-universe.com',
        roles: ['supervisor', 'technician'],
        permissions: [
            'tickets.view', 'tickets.edit', 'tickets.assign', 'tickets.close',
            'inventory.view', 'inventory.assign', 'users.view',
            'reports.view', 'team.manage'
        ],
        lastLogin: new Date(Date.now() - 900000).toISOString(),
        created: new Date(Date.now() - 86400000 * 120).toISOString(),
        status: 'active',
        department: 'IT Support',
        phone: '+1-555-0105',
        timezone: 'America/New_York'
    }
];
export const mockKiosks = [
    {
        id: 'kiosk-001',
        name: 'Main Lobby Kiosk',
        location: 'Building A - Main Lobby',
        lastSeen: new Date().toISOString(),
        version: '2.1.0',
        active: true,
        configScope: 'global',
        hasOverrides: false,
        overrideCount: 0,
        status: 'online',
        ipAddress: '192.168.1.101',
        macAddress: '00:1B:44:11:3A:B7',
        effectiveConfig: {
            logoUrl: 'https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=Nova+Universe',
            bgUrl: 'https://via.placeholder.com/1920x1080/F8FAFC/64748B?text=Nova+Universe+Background',
            statusEnabled: true,
            currentStatus: 'open',
            openMsg: 'IT Support is Available - Submit Your Request',
            closedMsg: 'IT Support is Currently Closed - Back at 8:00 AM',
            errorMsg: 'System temporarily unavailable - Please try again shortly',
            welcomeMessage: 'Welcome to Nova Universe Support',
            helpText: 'Please select your request type below or describe your issue',
            departments: ['IT', 'HR', 'Facilities', 'Security'],
            urgencyLevels: ['Low', 'Medium', 'High', 'Critical'],
            categories: ['Hardware', 'Software', 'Network', 'Access', 'Other'],
            operatingHours: {
                monday: { open: '08:00', close: '17:00', enabled: true },
                tuesday: { open: '08:00', close: '17:00', enabled: true },
                wednesday: { open: '08:00', close: '17:00', enabled: true },
                thursday: { open: '08:00', close: '17:00', enabled: true },
                friday: { open: '08:00', close: '17:00', enabled: true },
                saturday: { open: '09:00', close: '13:00', enabled: false },
                sunday: { open: '09:00', close: '13:00', enabled: false }
            }
        },
        metadata: {
            deviceModel: 'iPad Pro 12.9"',
            osVersion: 'iPadOS 17.1',
            appVersion: '2.1.0',
            installDate: new Date(Date.now() - 86400000 * 90).toISOString(),
            totalTickets: 1247,
            ticketsThisMonth: 89,
            averageResponseTime: '4.2 minutes'
        }
    },
    {
        id: 'kiosk-002',
        name: 'Reception Desk Kiosk',
        location: 'Building B - Reception Area',
        lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        version: '2.0.5',
        active: true,
        configScope: 'individual',
        hasOverrides: true,
        overrideCount: 3,
        status: 'online',
        ipAddress: '192.168.1.102',
        macAddress: '00:1B:44:11:3A:B8',
        effectiveConfig: {
            logoUrl: 'https://via.placeholder.com/200x60/FF6B35/FFFFFF?text=Reception+Desk',
            bgUrl: 'https://via.placeholder.com/1920x1080/FFF7ED/EA580C?text=Reception+Background',
            statusEnabled: true,
            currentStatus: 'open',
            openMsg: 'Reception is Available - How Can We Help?',
            closedMsg: 'Reception is Closed - Please Use Main Lobby Kiosk',
            errorMsg: 'Reception System Under Maintenance',
            welcomeMessage: 'Welcome to Building B Reception',
            helpText: 'Please describe how our reception team can assist you',
            departments: ['Reception', 'Visitor Management', 'General Inquiries'],
            urgencyLevels: ['Standard', 'Urgent'],
            categories: ['Visitor Access', 'Deliveries', 'Information', 'Assistance'],
            operatingHours: {
                monday: { open: '07:00', close: '19:00', enabled: true },
                tuesday: { open: '07:00', close: '19:00', enabled: true },
                wednesday: { open: '07:00', close: '19:00', enabled: true },
                thursday: { open: '07:00', close: '19:00', enabled: true },
                friday: { open: '07:00', close: '18:00', enabled: true },
                saturday: { open: '09:00', close: '15:00', enabled: true },
                sunday: { open: '10:00', close: '14:00', enabled: false }
            }
        },
        overrides: {
            status: {
                scope: 'individual',
                kioskId: 'kiosk-002',
                overriddenAt: new Date().toISOString(),
                overriddenBy: 'admin@nova-universe.com',
                reason: 'Special event configuration'
            },
            branding: {
                scope: 'individual',
                kioskId: 'kiosk-002',
                overriddenAt: new Date().toISOString(),
                overriddenBy: 'admin@nova-universe.com',
                reason: 'Reception-specific branding'
            },
            schedule: {
                scope: 'individual',
                kioskId: 'kiosk-002',
                overriddenAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                overriddenBy: 'manager@nova-universe.com',
                reason: 'Extended reception hours'
            }
        },
        metadata: {
            deviceModel: 'iPad Air 5th Gen',
            osVersion: 'iPadOS 16.7',
            appVersion: '2.0.5',
            installDate: new Date(Date.now() - 86400000 * 180).toISOString(),
            totalTickets: 834,
            ticketsThisMonth: 67,
            averageResponseTime: '3.8 minutes'
        }
    },
    {
        id: 'kiosk-003',
        name: 'Engineering Floor Kiosk',
        location: 'Building C - 3rd Floor Engineering',
        lastSeen: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        version: '2.1.0',
        active: false,
        configScope: 'individual',
        hasOverrides: true,
        overrideCount: 1,
        status: 'offline',
        ipAddress: '192.168.1.103',
        macAddress: '00:1B:44:11:3A:B9',
        effectiveConfig: {
            logoUrl: 'https://via.placeholder.com/200x60/10B981/FFFFFF?text=Engineering+Support',
            bgUrl: 'https://via.placeholder.com/1920x1080/ECFDF5/059669?text=Engineering+Background',
            statusEnabled: false,
            currentStatus: 'maintenance',
            openMsg: 'Engineering Support Available',
            closedMsg: 'Engineering Support Currently Unavailable - Use General IT',
            errorMsg: 'Kiosk Under Maintenance - Please Use Alternative Location',
            welcomeMessage: 'Engineering Department Support Portal',
            helpText: 'Specialized support for engineering tools and infrastructure',
            departments: ['Engineering IT', 'CAD Support', 'Lab Equipment'],
            urgencyLevels: ['Low', 'Medium', 'High', 'Production Critical'],
            categories: ['Workstation', 'CAD Software', 'Lab Equipment', 'Network', 'Access'],
            operatingHours: {
                monday: { open: '08:00', close: '17:00', enabled: true },
                tuesday: { open: '08:00', close: '17:00', enabled: true },
                wednesday: { open: '08:00', close: '17:00', enabled: true },
                thursday: { open: '08:00', close: '17:00', enabled: true },
                friday: { open: '08:00', close: '17:00', enabled: true },
                saturday: { open: '09:00', close: '13:00', enabled: false },
                sunday: { open: '09:00', close: '13:00', enabled: false }
            }
        },
        overrides: {
            operatingMode: {
                scope: 'individual',
                kioskId: 'kiosk-003',
                overriddenAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                overriddenBy: 'it-admin@nova-universe.com',
                reason: 'Temporary maintenance mode for hardware upgrade'
            }
        },
        metadata: {
            deviceModel: 'iPad Pro 11"',
            osVersion: 'iPadOS 17.1',
            appVersion: '2.1.0',
            installDate: new Date(Date.now() - 86400000 * 45).toISOString(),
            totalTickets: 432,
            ticketsThisMonth: 28,
            averageResponseTime: '5.1 minutes',
            lastMaintenanceDate: new Date(Date.now() - 172800000).toISOString(),
            maintenanceReason: 'Hardware upgrade and configuration update'
        }
    }
];

export const mockLogs = [
    {
        id: 1,
        ticketId: 'NOV-2024-001',
        name: 'Sarah Chen',
        email: 'sarah.chen@nova-universe.com',
        title: 'Laptop display flickering intermittently',
        system: 'Hardware',
        department: 'Engineering',
        urgency: 'Medium',
        status: 'In Progress',
        assignedTo: 'David Kim',
        timestamp: new Date().toISOString(),
        emailStatus: 'delivered',
        integrationId: 'SN-INC0010001',
        kioskId: 'kiosk-003',
        resolution: null,
        responseTime: 187, // minutes
        tags: ['hardware', 'display', 'urgent'],
        customerSatisfaction: null
    },
    {
        id: 2,
        ticketId: 'NOV-2024-002',
        name: 'Michael Rodriguez',
        email: 'mike.rodriguez@nova-universe.com',
        title: 'Unable to access shared network drive',
        system: 'Network',
        department: 'Human Resources',
        urgency: 'High',
        status: 'Resolved',
        assignedTo: 'Sarah Chen',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        emailStatus: 'delivered',
        integrationId: 'SN-INC0010002',
        kioskId: 'kiosk-001',
        resolution: 'Permissions updated for HR shared drive access. User can now access all required folders.',
        responseTime: 23, // minutes
        resolvedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        tags: ['network', 'permissions', 'resolved'],
        customerSatisfaction: 5
    },
    {
        id: 3,
        ticketId: 'NOV-2024-003',
        name: 'Emily Johnson',
        email: 'emily.johnson@nova-universe.com',
        title: 'New employee workstation setup required',
        system: 'Setup',
        department: 'Marketing',
        urgency: 'Medium',
        status: 'Assigned',
        assignedTo: 'David Kim',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        emailStatus: 'delivered',
        integrationId: 'SN-REQ0010001',
        kioskId: 'kiosk-002',
        resolution: null,
        responseTime: null,
        tags: ['setup', 'new-employee', 'workstation'],
        customerSatisfaction: null,
        priority: 'standard',
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString() // 2 days from now
    },
    {
        id: 4,
        ticketId: 'NOV-2024-004',
        name: 'James Wilson',
        email: 'james.wilson@nova-universe.com',
        title: 'Software licensing renewal - Adobe Creative Suite',
        system: 'Software',
        department: 'Creative',
        urgency: 'Low',
        status: 'Pending Approval',
        assignedTo: null,
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        emailStatus: 'delivered',
        integrationId: 'SN-REQ0010002',
        kioskId: 'kiosk-001',
        resolution: null,
        responseTime: null,
        tags: ['software', 'licensing', 'approval-required'],
        customerSatisfaction: null,
        priority: 'low',
        approvalRequired: true,
        estimatedCost: 2400.00
    },
    {
        id: 5,
        ticketId: 'NOV-2024-005',
        name: 'Lisa Park',
        email: 'lisa.park@nova-universe.com',
        title: 'Password reset for domain account',
        system: 'Security',
        department: 'Operations',
        urgency: 'High',
        status: 'Resolved',
        assignedTo: 'Sarah Chen',
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        emailStatus: 'delivered',
        integrationId: 'SN-INC0010003',
        kioskId: 'kiosk-001',
        resolution: 'Password reset completed. User notified via secure email with temporary credentials.',
        responseTime: 8, // minutes
        resolvedAt: new Date(Date.now() - 10320000).toISOString(), // 2 hours 52 minutes ago
        tags: ['password', 'security', 'resolved'],
        customerSatisfaction: 4,
        priority: 'high'
    }
];
export const mockConfig = {
    // Brand Configuration
    organizationName: 'Nova Universe Corporation',
    logoUrl: 'https://via.placeholder.com/200x60/3B82F6/FFFFFF?text=Nova+Universe',
    faviconUrl: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=N',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    
    // User Experience
    welcomeMessage: 'Welcome to Nova Universe Support Portal',
    helpMessage: 'Please describe your issue in detail and our support team will assist you promptly',
    thankYouMessage: 'Thank you for your request. You will receive a confirmation email shortly.',
    
    // Operational Status
    statusOpenMsg: 'Support services are available - Submit your request now',
    statusClosedMsg: 'Support services are currently closed - We will be back at 8:00 AM EST',
    statusErrorMsg: 'System maintenance in progress - Please try again in a few minutes',
    
    // Rate Limiting
    rateLimitWindow: '900000', // 15 minutes
    rateLimitMax: '100',
    
    // Support Categories and Options
    systems: 'Desktop,Laptop,Mobile Device,Network,Printer,Software,Security,Access Request,Hardware Setup',
    urgencies: 'Low,Medium,High,Critical,Emergency',
    departments: 'IT Support,Human Resources,Facilities,Security,Engineering,Finance,Marketing,Operations',
    
    // Directory Integration
    directoryEnabled: true,
    directoryProvider: 'azure-ad',
    directoryUrl: 'https://login.microsoftonline.com/tenant-id',
    directoryToken: '***CONFIGURED***',
    
    // Feature Flags
    kioskMode: true,
    assetManagement: true,
    knowledgeBase: true,
    chatbotEnabled: true,
    fileUploadEnabled: true,
    multiLanguageEnabled: false,
    customFieldsEnabled: true,
    approvalWorkflowEnabled: true,
    reportingEnabled: true,
    auditLoggingEnabled: true,
    
    // Service Level Configuration
    defaultResponseTime: 240, // 4 hours in minutes
    defaultResolutionTime: 1440, // 24 hours in minutes
    escalationEnabled: true,
    
    // Operating Hours
    timezone: 'America/New_York',
    operatingHoursEnabled: true,
    
    // Maintenance and Updates
    lastUpdated: new Date().toISOString(),
    version: '2.1.0',
    maintenanceMode: false,
    
    // Security
    sessionTimeoutMinutes: 480, // 8 hours
    mfaRequired: false,
    passwordComplexity: true,
    
    // Compliance
    dataRetentionDays: 2555, // 7 years
    auditRetentionDays: 1095, // 3 years
    encryptionEnabled: true
};
export const mockIntegrations = [
    {
        id: 1,
        name: 'Nova Universe SMTP Server',
        type: 'smtp',
        enabled: true,
        status: 'connected',
        lastTested: new Date(Date.now() - 3600000).toISOString(),
        settings: {
            notifications: true,
            ticketUpdates: true,
            escalations: true
        },
        config: {
            host: 'smtp.nova-universe.com',
            port: 587,
            security: 'STARTTLS',
            username: 'noreply@nova-universe.com',
            senderName: 'Nova Universe Support'
        },
        working: true,
        metrics: {
            emailsSent: 1247,
            emailsDelivered: 1239,
            emailsFailed: 8,
            deliveryRate: 99.4
        }
    },
    {
        id: 2,
        name: 'ServiceNow Production',
        type: 'servicenow',
        enabled: true,
        status: 'connected',
        lastTested: new Date(Date.now() - 1800000).toISOString(),
        settings: {
            autoCreateIncidents: true,
            syncStatus: true,
            biDirectionalSync: false
        },
        config: {
            instanceUrl: 'https://nova-universe.service-now.com',
            apiVersion: 'v1',
            username: 'nova_integration',
            assignmentGroup: 'IT Support',
            category: 'Software',
            subcategory: 'Application'
        },
        working: true,
        metrics: {
            ticketsSynced: 342,
            syncErrors: 2,
            syncRate: 99.4,
            avgSyncTime: 1.8 // seconds
        }
    },
    {
        id: 3,
        name: 'Slack Workspace Integration',
        type: 'slack',
        enabled: true,
        status: 'connected',
        lastTested: new Date(Date.now() - 900000).toISOString(),
        settings: {
            channels: ['#it-support', '#general'],
            notifications: true,
            slashCommands: true
        },
        config: {
            workspaceUrl: 'https://nova-universe.slack.com',
            botToken: '***CONFIGURED***',
            signingSecret: '***CONFIGURED***',
            appId: 'A1234567890'
        },
        working: true,
        metrics: {
            commandsUsed: 89,
            notificationsSent: 156,
            responseTime: 0.3 // seconds
        }
    },
    {
        id: 4,
        name: 'Azure Active Directory',
        type: 'azure-ad',
        enabled: true,
        status: 'connected',
        lastTested: new Date(Date.now() - 600000).toISOString(),
        settings: {
            autoSync: true,
            syncInterval: 3600, // seconds
            createUsers: true,
            updateUsers: true
        },
        config: {
            tenantId: crypto.randomUUID ? crypto.randomUUID() : 'tenant-' + Math.random().toString(36).substr(2, 8),
            clientId: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
            clientSecret: '***CONFIGURED***',
            authority: 'https://login.microsoftonline.com/'
        },
        working: true,
        metrics: {
            usersSync: 1247,
            groupsSync: 34,
            lastSyncTime: new Date(Date.now() - 3600000).toISOString(),
            syncErrors: 0
        }
    },
    {
        id: 5,
        name: 'Knowledge Base AI',
        type: 'ai-assistant',
        enabled: true,
        status: 'connected',
        lastTested: new Date(Date.now() - 300000).toISOString(),
        settings: {
            autoSuggestions: true,
            sentimentAnalysis: true,
            categoryPrediction: true
        },
        config: {
            provider: 'OpenAI',
            model: 'gpt-4',
            apiKey: '***CONFIGURED***',
            temperature: 0.7
        },
        working: true,
        metrics: {
            suggestionsGenerated: 234,
            accuracyRate: 87.3,
            avgResponseTime: 2.1 // seconds
        }
    },
    {
        id: 6,
        name: 'Help Scout (Legacy)',
        type: 'helpscout',
        enabled: false,
        status: 'deprecated',
        lastTested: new Date(Date.now() - 86400000 * 30).toISOString(),
        settings: {
            smtpFallback: false
        },
        config: {
            apiKey: '***DISABLED***',
            mailboxId: 'legacy',
            webhookUrl: 'https://api.nova-universe.com/webhooks/helpscout'
        },
        working: false,
        lastError: 'Integration deprecated - migrated to ServiceNow',
        metrics: {
            ticketsProcessed: 0,
            lastTicket: new Date(Date.now() - 86400000 * 60).toISOString()
        }
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
    { 
        id: 1, 
        name: 'admin',
        displayName: 'System Administrator',
        description: 'Full system access with all administrative privileges',
        permissions: '*',
        userCount: 2,
        created: new Date(Date.now() - 86400000 * 365).toISOString()
    },
    { 
        id: 2, 
        name: 'superuser',
        displayName: 'Super User',
        description: 'Extended privileges for senior staff members',
        permissions: 'users.*,kiosks.*,reports.*,settings.view',
        userCount: 1,
        created: new Date(Date.now() - 86400000 * 300).toISOString()
    },
    { 
        id: 3, 
        name: 'technician',
        displayName: 'IT Technician',
        description: 'Technical support staff with ticket and user management',
        permissions: 'tickets.*,users.view,inventory.*,kiosks.view',
        userCount: 5,
        created: new Date(Date.now() - 86400000 * 200).toISOString()
    },
    { 
        id: 4, 
        name: 'it-support',
        displayName: 'IT Support Specialist',
        description: 'Primary support role for IT-related tickets',
        permissions: 'tickets.view,tickets.edit,tickets.assign,inventory.view',
        userCount: 8,
        created: new Date(Date.now() - 86400000 * 180).toISOString()
    },
    { 
        id: 5, 
        name: 'hr-support',
        displayName: 'HR Support Representative',
        description: 'Human resources support with access to HR tickets only',
        permissions: 'tickets.view,tickets.edit,hr.access,users.view',
        userCount: 3,
        created: new Date(Date.now() - 86400000 * 150).toISOString()
    },
    { 
        id: 6, 
        name: 'supervisor',
        displayName: 'Team Supervisor',
        description: 'Team leadership with assignment and reporting privileges',
        permissions: 'tickets.*,users.view,reports.view,team.manage',
        userCount: 4,
        created: new Date(Date.now() - 86400000 * 120).toISOString()
    },
    { 
        id: 7, 
        name: 'user',
        displayName: 'Standard User',
        description: 'Basic user access for ticket submission and viewing',
        permissions: 'tickets.view,tickets.create,tickets.comment',
        userCount: 234,
        created: new Date(Date.now() - 86400000 * 90).toISOString()
    },
    { 
        id: 8, 
        name: 'readonly',
        displayName: 'Read-Only User',
        description: 'View-only access for auditing and reporting purposes',
        permissions: 'tickets.view,users.view,reports.view',
        userCount: 12,
        created: new Date(Date.now() - 86400000 * 60).toISOString()
    },
    { 
        id: 9, 
        name: 'guest',
        displayName: 'Guest User',
        description: 'Limited access for external users and contractors',
        permissions: 'tickets.view,tickets.create',
        userCount: 8,
        created: new Date(Date.now() - 86400000 * 30).toISOString()
    }
];
export const mockPermissions = [
    // User Management
    { id: 1, name: 'users.create', category: 'User Management', description: 'Create new user accounts' },
    { id: 2, name: 'users.edit', category: 'User Management', description: 'Edit existing user accounts' },
    { id: 3, name: 'users.delete', category: 'User Management', description: 'Delete user accounts' },
    { id: 4, name: 'users.view', category: 'User Management', description: 'View user information' },
    
    // Kiosk Management
    { id: 5, name: 'kiosks.manage', category: 'Kiosk Management', description: 'Full kiosk management access' },
    { id: 6, name: 'kiosks.configure', category: 'Kiosk Management', description: 'Configure kiosk settings' },
    { id: 7, name: 'kiosks.monitor', category: 'Kiosk Management', description: 'Monitor kiosk status and health' },
    { id: 8, name: 'kiosks.view', category: 'Kiosk Management', description: 'View kiosk information' },
    
    // Ticket Management
    { id: 9, name: 'tickets.view', category: 'Ticket Management', description: 'View tickets and their details' },
    { id: 10, name: 'tickets.edit', category: 'Ticket Management', description: 'Edit ticket information' },
    { id: 11, name: 'tickets.assign', category: 'Ticket Management', description: 'Assign tickets to technicians' },
    { id: 12, name: 'tickets.close', category: 'Ticket Management', description: 'Close and resolve tickets' },
    { id: 13, name: 'tickets.create', category: 'Ticket Management', description: 'Create new tickets' },
    { id: 14, name: 'tickets.comment', category: 'Ticket Management', description: 'Add comments to tickets' },
    
    // Inventory Management
    { id: 15, name: 'inventory.manage', category: 'Inventory Management', description: 'Full inventory management access' },
    { id: 16, name: 'inventory.import', category: 'Inventory Management', description: 'Import inventory data' },
    { id: 17, name: 'inventory.export', category: 'Inventory Management', description: 'Export inventory reports' },
    { id: 18, name: 'inventory.view', category: 'Inventory Management', description: 'View inventory information' },
    { id: 19, name: 'inventory.assign', category: 'Inventory Management', description: 'Assign assets to users' },
    
    // Reporting and Analytics
    { id: 20, name: 'reports.view', category: 'Reporting', description: 'View reports and analytics' },
    { id: 21, name: 'reports.export', category: 'Reporting', description: 'Export reports and data' },
    { id: 22, name: 'reports.create', category: 'Reporting', description: 'Create custom reports' },
    
    // System Settings
    { id: 23, name: 'settings.manage', category: 'System Settings', description: 'Manage system configuration' },
    { id: 24, name: 'settings.view', category: 'System Settings', description: 'View system settings' },
    
    // Integration Management
    { id: 25, name: 'integrations.configure', category: 'Integration Management', description: 'Configure external integrations' },
    { id: 26, name: 'integrations.test', category: 'Integration Management', description: 'Test integration connections' },
    { id: 27, name: 'integrations.view', category: 'Integration Management', description: 'View integration status' },
    
    // Audit and Security
    { id: 28, name: 'audit.view', category: 'Audit and Security', description: 'View audit logs and security events' },
    { id: 29, name: 'audit.export', category: 'Audit and Security', description: 'Export audit data' },
    
    // Team Management
    { id: 30, name: 'team.manage', category: 'Team Management', description: 'Manage team assignments and schedules' },
    { id: 31, name: 'team.view', category: 'Team Management', description: 'View team information' },
    
    // Department-Specific
    { id: 32, name: 'hr.access', category: 'HR Department', description: 'Access HR-specific features and data' },
    { id: 33, name: 'finance.access', category: 'Finance Department', description: 'Access finance-related features' },
    { id: 34, name: 'facilities.access', category: 'Facilities Department', description: 'Access facilities management features' },
    
    // Advanced Features
    { id: 35, name: 'workflows.manage', category: 'Workflow Management', description: 'Manage automated workflows' },
    { id: 36, name: 'api.access', category: 'API Access', description: 'Access to API endpoints' },
    { id: 37, name: 'backup.manage', category: 'System Administration', description: 'Manage system backups' }
];
export const mockNotifications = [
    {
        id: 1,
        title: 'High Priority Ticket Submitted',
        message: 'New critical ticket NOV-2024-006 submitted from Engineering floor - Server room temperature alert',
        createdAt: new Date().toISOString(),
        read: false,
        type: 'critical',
        category: 'ticket',
        priority: 'high',
        actionRequired: true,
        relatedTicket: 'NOV-2024-006',
        assignedTo: 'David Kim'
    },
    {
        id: 2,
        title: 'Kiosk Offline Alert',
        message: 'Kiosk kiosk-003 (Engineering Floor) has been offline for 47 minutes',
        createdAt: new Date(Date.now() - 2820000).toISOString(), // 47 minutes ago
        read: false,
        type: 'warning',
        category: 'system',
        priority: 'medium',
        actionRequired: true,
        relatedKiosk: 'kiosk-003',
        troubleshootingUrl: '/admin/kiosks/kiosk-003/troubleshoot'
    },
    {
        id: 3,
        title: 'Integration Test Successful',
        message: 'ServiceNow Production integration test completed successfully - All systems operational',
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        read: true,
        type: 'success',
        category: 'integration',
        priority: 'low',
        actionRequired: false,
        relatedIntegration: 'ServiceNow Production'
    },
    {
        id: 4,
        title: 'Weekly Report Available',
        message: 'Your weekly support metrics report is ready for review - 98.2% satisfaction rate this week',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: true,
        type: 'info',
        category: 'report',
        priority: 'low',
        actionRequired: false,
        reportUrl: '/admin/reports/weekly/2024-w32'
    },
    {
        id: 5,
        title: 'Asset Warranty Expiring',
        message: '15 assets have warranties expiring within the next 30 days - Review required',
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read: false,
        type: 'warning',
        category: 'inventory',
        priority: 'medium',
        actionRequired: true,
        affectedAssets: 15,
        inventoryUrl: '/admin/inventory/warranty-alerts'
    },
    {
        id: 6,
        title: 'User Access Request',
        message: 'New user Emily Johnson requires approval for elevated access to Engineering systems',
        createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        read: true,
        type: 'info',
        category: 'access',
        priority: 'medium',
        actionRequired: true,
        requestingUser: 'Emily Johnson',
        approvalUrl: '/admin/users/access-requests/456'
    },
    {
        id: 7,
        title: 'Scheduled Maintenance Reminder',
        message: 'System maintenance scheduled for tonight at 11:00 PM EST - Expected duration: 2 hours',
        createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
        read: true,
        type: 'info',
        category: 'maintenance',
        priority: 'medium',
        actionRequired: false,
        scheduledTime: new Date(Date.now() + 25200000).toISOString(), // 7 hours from now
        duration: 120 // minutes
    },
    {
        id: 8,
        title: 'Monthly Backup Completed',
        message: 'Monthly system backup completed successfully - 2.4GB archived to secure storage',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
        read: true,
        type: 'success',
        category: 'backup',
        priority: 'low',
        actionRequired: false,
        backupSize: '2.4GB',
        backupLocation: 'Azure Blob Storage - Region: East US'
    }
];
export const mockDashboardStats = {
    // Core Metrics
    totalTickets: 2847,
    openTickets: 89,
    resolvedTickets: 2758,
    totalKiosks: 12,
    activeKiosks: 9,
    totalUsers: 287,
    activeUsers: 234,
    
    // Performance Metrics
    averageResponseTime: 3.7, // hours
    averageResolutionTime: 18.2, // hours
    customerSatisfactionScore: 4.6, // out of 5
    firstCallResolutionRate: 78.3, // percentage
    
    // Trending Data
    ticketsThisMonth: 156,
    ticketsLastMonth: 142,
    ticketTrend: 9.9, // percentage increase
    
    // SLA Metrics
    slaCompliance: 94.2, // percentage
    breachedSLAs: 8,
    criticalTickets: 3,
    
    // Asset and Inventory
    totalAssets: 1247,
    assetsAssigned: 1156,
    assetsAvailable: 91,
    warrantyExpiringCount: 15,
    
    // Integration Health
    integrationStatus: {
        servicenow: 'connected',
        slack: 'connected',
        azure_ad: 'connected',
        smtp: 'connected',
        ai_assistant: 'connected'
    },
    
    // Recent Activity Summary
    recentActivity: [
        {
            id: 1,
            type: 'ticket_created',
            message: 'Critical ticket NOV-2024-006 created by Alex Thompson',
            timestamp: new Date().toISOString(),
            priority: 'critical',
            category: 'infrastructure'
        },
        {
            id: 2,
            type: 'ticket_resolved',
            message: 'Password reset ticket NOV-2024-005 resolved by Sarah Chen',
            timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
            priority: 'high',
            category: 'security'
        },
        {
            id: 3,
            type: 'kiosk_offline',
            message: 'Engineering Floor Kiosk (kiosk-003) went offline',
            timestamp: new Date(Date.now() - 2820000).toISOString(), // 47 minutes ago
            priority: 'medium',
            category: 'system'
        },
        {
            id: 4,
            type: 'user_created',
            message: 'New user account created for Jennifer Martinez',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            priority: 'low',
            category: 'administration'
        },
        {
            id: 5,
            type: 'integration_success',
            message: 'ServiceNow integration test completed successfully',
            timestamp: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
            priority: 'low',
            category: 'integration'
        }
    ],
    
    // Department Breakdown
    departmentStats: {
        'IT Support': { tickets: 45, avgResolution: 12.3 },
        'Human Resources': { tickets: 18, avgResolution: 8.7 },
        'Engineering': { tickets: 23, avgResolution: 24.1 },
        'Facilities': { tickets: 8, avgResolution: 6.2 },
        'Security': { tickets: 12, avgResolution: 4.8 },
        'Finance': { tickets: 6, avgResolution: 15.4 }
    },
    
    // Urgency Distribution
    urgencyDistribution: {
        'Low': 34,
        'Medium': 28,
        'High': 19,
        'Critical': 6,
        'Emergency': 2
    },
    
    // Technology Metrics
    topIssueCategories: [
        { category: 'Password Reset', count: 23, trend: '+5%' },
        { category: 'Hardware Issues', count: 18, trend: '-12%' },
        { category: 'Software Installation', count: 15, trend: '+8%' },
        { category: 'Network Access', count: 12, trend: '+3%' },
        { category: 'Account Setup', count: 11, trend: '+15%' }
    ],
    
    // Time-based Analytics
    hourlyDistribution: {
        '08:00': 12, '09:00': 18, '10:00': 15, '11:00': 22,
        '12:00': 8, '13:00': 14, '14:00': 19, '15:00': 16,
        '16:00': 13, '17:00': 9
    },
    
    // System Health
    systemHealth: {
        database: 'healthy',
        apiPerformance: 'good',
        diskUsage: 67, // percentage
        memoryUsage: 54, // percentage
        cpuUsage: 23, // percentage
        lastBackup: new Date(Date.now() - 86400000).toISOString() // 24 hours ago
    }
};

// Additional Mock Data for Asset Management
export const mockAssets = [
    {
        id: 1,
        assetTag: 'NV-LAP-001',
        name: 'Dell Latitude 5520',
        type: 'laptop',
        status: 'assigned',
        assignedTo: 'Sarah Chen',
        department: 'IT Support',
        location: 'Building A - 2nd Floor',
        serialNumber: 'DL5520-2024-001',
        purchaseDate: '2024-01-15',
        warrantyExpiry: '2027-01-15',
        value: 1299.99,
        category: 'Hardware'
    },
    {
        id: 2,
        assetTag: 'NV-DSK-002',
        name: 'HP EliteDesk 800 G9',
        type: 'desktop',
        status: 'available',
        assignedTo: null,
        department: 'IT Support',
        location: 'Storage Room B',
        serialNumber: 'HP800G9-2024-002',
        purchaseDate: '2024-02-20',
        warrantyExpiry: '2027-02-20',
        value: 899.99,
        category: 'Hardware'
    }
];

// Additional Mock Data for Knowledge Base
export const mockKnowledgeBase = [
    {
        id: 1,
        title: 'How to Reset Your Password',
        category: 'Security',
        content: 'Step-by-step guide for password reset procedures...',
        author: 'Sarah Chen',
        created: new Date(Date.now() - 86400000 * 30).toISOString(),
        updated: new Date(Date.now() - 86400000 * 5).toISOString(),
        views: 234,
        helpful: 89,
        notHelpful: 12,
        tags: ['password', 'security', 'account']
    },
    {
        id: 2,
        title: 'Setting Up VPN Access',
        category: 'Network',
        content: 'Complete guide for VPN configuration and troubleshooting...',
        author: 'David Kim',
        created: new Date(Date.now() - 86400000 * 45).toISOString(),
        updated: new Date(Date.now() - 86400000 * 10).toISOString(),
        views: 156,
        helpful: 67,
        notHelpful: 8,
        tags: ['vpn', 'network', 'remote-access']
    }
];

// Additional Mock Data for Audit Logs
export const mockAuditLogs = [
    {
        id: 1,
        timestamp: new Date().toISOString(),
        userId: 1,
        userName: 'Administrator',
        action: 'user.created',
        target: 'Emily Johnson',
        details: 'New user account created with IT Support role',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        severity: 'info'
    },
    {
        id: 2,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        userId: 2,
        userName: 'Sarah Chen',
        action: 'ticket.assigned',
        target: 'NOV-2024-005',
        details: 'Ticket assigned to David Kim',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        severity: 'info'
    }
];

// Helper function to simulate API delay with realistic timing
export const delay = (ms = 200 + Math.random() * 800) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate API errors with configurable error rate
export const shouldSimulateError = (errorRate = 0.05) => Math.random() < errorRate;

// Helper function to generate realistic timestamps
export const generateTimestamp = (hoursAgo = 0) => {
    return new Date(Date.now() - (hoursAgo * 3600000)).toISOString();
};

// Helper function to generate random IDs
export const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// Helper function to format mock data responses
export const mockApiResponse = (data, status = 'success', message = null) => ({
    status,
    data,
    message,
    timestamp: new Date().toISOString(),
    version: '2.1.0'
});

// Helper function to simulate pagination
export const paginateMockData = (data, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
        data: paginatedData,
        pagination: {
            page,
            limit,
            total: data.length,
            totalPages: Math.ceil(data.length / limit),
            hasNext: endIndex < data.length,
            hasPrev: page > 1
        }
    };
};

// Helper function to filter mock data
export const filterMockData = (data, filters = {}) => {
    return data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value) return true;
            const itemValue = item[key];
            if (typeof itemValue === 'string') {
                return itemValue.toLowerCase().includes(value.toLowerCase());
            }
            return itemValue === value;
        });
    });
};

// Helper function to sort mock data
export const sortMockData = (data, sortBy = 'id', sortOrder = 'asc') => {
    return [...data].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'desc') {
            return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
    });
};
