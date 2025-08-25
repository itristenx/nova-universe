# 📺 Nova TV - Comprehensive Feature Specification

## Executive Summary

Nova TV is a digital signage and custom dashboard solution designed to enhance team engagement and information sharing within the Nova Universe ecosystem. Inspired by Workvivo TV's proven activation process and content management capabilities, Nova TV will serve multiple organizational departments with customized experiences while maintaining a unified, Apple-inspired design philosophy.

## 🎯 Strategic Objectives

- **Enhance Team Engagement**: Provide dynamic, visually appealing content displays that keep teams informed and motivated
- **Departmental Customization**: Deliver tailored dashboard experiences for HR, Operations, IT, and other departments
- **Seamless Integration**: Leverage existing Nova Universe infrastructure and maintain consistency with the unified platform
- **Market Differentiation**: Establish Nova Universe as a comprehensive employee experience platform
- **Scalable Foundation**: Create an extensible system that can grow with organizational needs

## 🏗️ Technical Architecture

### Core Components Architecture

```
Nova TV System
├── Frontend Components
│   ├── Dashboard Creation & Management
│   ├── Template Library System
│   ├── Content Management Interface
│   ├── Real-time Display Engine
│   └── Device Authentication System
├── Backend Services
│   ├── Dashboard API (/api/nova-tv/*)
│   ├── Content Management Service
│   ├── Template Engine
│   ├── Device Management Service
│   └── Real-time WebSocket Handler
├── Database Schema
│   ├── TV Dashboards & Templates
│   ├── Content & Media Storage
│   ├── Device Registrations
│   └── Department Configurations
└── Integration Layer
    ├── Nova Universe Auth System
    ├── Role-based Access Control
    ├── Existing Widget Framework
    └── Notification System
```

### Technology Stack Integration

```typescript
// Leveraging Existing Nova Universe Stack
- Frontend: React 19 + TypeScript + Vite
- State Management: Zustand + TanStack Query
- UI Framework: Tailwind CSS + HeadlessUI + Framer Motion
- Real-time: Socket.io-client
- Backend: Node.js + Express + Prisma
- Database: PostgreSQL with existing schema extensions
- Authentication: Existing Helix Auth integration
```

## 🚀 Feature Specifications

### 1. Dashboard Creation & Management System

#### 1.1 Dashboard Builder Interface

**Location**: `/apps/unified/src/pages/nova-tv/DashboardBuilder.tsx`

**Core Features**:

- **Drag-and-drop dashboard editor** with real-time preview
- **Template-based creation** with department-specific presets
- **Multi-screen layout support** for different display sizes
- **Brand customization tools** (colors, logos, themes)
- **Live preview mode** showing how content will appear on displays

**User Experience Flow**:

```typescript
interface DashboardBuilder {
  // Dashboard Configuration
  dashboardName: string;
  targetDepartment: DepartmentType;
  displaySettings: {
    orientation: 'landscape' | 'portrait';
    resolution: '1920x1080' | '1080x1920' | '3840x2160';
    refreshInterval: number; // seconds
  };

  // Brand Customization
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    backgroundImage?: string;
  };

  // Content Configuration
  templates: TemplateConfiguration[];
  contentSources: ContentSource[];
  updateSchedule: ScheduleSettings;
}
```

#### 1.2 Department-Specific Dashboard Templates

**HR Department Dashboard Template**:

```typescript
interface HRDashboardTemplate {
  id: 'hr-executive-summary';
  name: 'HR Executive Dashboard';
  sections: [
    {
      type: 'employee-metrics';
      widgets: [
        'new-hires-this-month',
        'employee-satisfaction-score',
        'upcoming-anniversaries',
        'open-positions-count',
        'training-completion-rate',
      ];
    },
    {
      type: 'announcements';
      widgets: [
        'company-news-feed',
        'hr-policy-updates',
        'benefits-reminders',
        'wellness-program-highlights',
      ];
    },
    {
      type: 'recognition';
      widgets: ['employee-spotlight', 'recent-achievements', 'peer-recognition-feed'];
    },
  ];
}
```

**IT Operations Dashboard Template**:

```typescript
interface ITDashboardTemplate {
  id: 'it-operations-center';
  name: 'IT Operations Dashboard';
  sections: [
    {
      type: 'system-health';
      widgets: [
        'service-status-overview',
        'incident-count-today',
        'system-uptime-metrics',
        'security-alerts-summary',
      ];
    },
    {
      type: 'helpdesk-metrics';
      widgets: [
        'open-tickets-by-priority',
        'sla-compliance-rate',
        'team-performance-metrics',
        'recent-resolutions',
      ];
    },
    {
      type: 'infrastructure';
      widgets: [
        'server-resource-utilization',
        'network-performance',
        'backup-status',
        'patch-management-status',
      ];
    },
  ];
}
```

**Operations Dashboard Template**:

```typescript
interface OperationsDashboardTemplate {
  id: 'operations-command-center';
  name: 'Operations Command Center';
  sections: [
    {
      type: 'kpi-overview';
      widgets: [
        'daily-production-metrics',
        'quality-indicators',
        'efficiency-ratings',
        'cost-per-unit-tracking',
      ];
    },
    {
      type: 'workflow-status';
      widgets: [
        'active-projects-status',
        'resource-allocation',
        'bottleneck-identification',
        'completion-forecasts',
      ];
    },
    {
      type: 'safety-compliance';
      widgets: [
        'safety-incident-tracker',
        'compliance-checklist-status',
        'equipment-maintenance-alerts',
      ];
    },
  ];
}
```

### 2. Workvivo-Inspired Activation System

#### 2.1 QR Code Authentication Process

**Enhanced Authentication Flow**:

```typescript
interface ActivationProcess {
  // Step 1: Generate Display Code
  generateDisplayCode(): {
    qrCode: string; // QR code image data
    sixDigitCode: string; // Backup manual entry code
    expirationTime: Date; // 5-minute expiration
    deviceFingerprint: string; // Unique device identifier
  };

  // Step 2: Mobile Authentication
  authenticateViaQR(qrData: string): {
    availableDashboards: Dashboard[];
    userPermissions: Permission[];
    departmentAccess: DepartmentType[];
  };

  // Step 3: Dashboard Selection
  selectDashboard(dashboardId: string): {
    dashboardConfig: DashboardConfiguration;
    refreshToken: string; // 7-day validity
    deviceRegistration: DeviceRegistration;
  };
}
```

**Authentication Security Features**:

- **Time-limited codes** (5-minute expiration)
- **Device fingerprinting** for security tracking
- **Role-based dashboard access** integration with existing Nova Universe permissions
- **Automatic device registration** with management capabilities
- **Session management** with 7-day refresh cycle

#### 2.2 Device Management System

**Location**: `/apps/unified/src/pages/nova-tv/DeviceManagement.tsx`

```typescript
interface DeviceManagement {
  // Device Registration
  registeredDevices: ConnectedDevice[];

  // Device Control
  revokeDeviceAccess(deviceId: string): Promise<void>;
  updateDeviceSettings(deviceId: string, settings: DeviceSettings): Promise<void>;
  renameDevice(deviceId: string, newName: string): Promise<void>;

  // Monitoring
  getDeviceStatus(deviceId: string): DeviceStatus;
  getDeviceMetrics(deviceId: string): DeviceMetrics;
}

interface ConnectedDevice {
  id: string;
  name: string; // e.g., "Samsung TV - HR Reception"
  location: string;
  department: DepartmentType;
  ipAddress: string;
  browserInfo: string;
  lastActiveAt: Date;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  assignedDashboard: Dashboard;
  settings: {
    autoRefresh: boolean;
    refreshInterval: number;
    allowRemoteControl: boolean;
  };
}
```

### 3. Advanced Template System

#### 3.1 Dynamic Content Templates

**Summary Template (Multi-Widget Display)**:

```typescript
interface SummaryTemplate {
  id: 'enhanced-summary';
  name: 'Nova Summary Display';
  layout: 'grid' | 'masonry' | 'split-screen';
  refreshInterval: 150; // seconds (2.5 minutes)

  contentWidgets: {
    primary: {
      type: 'activity-feed';
      source: 'auto' | 'manual';
      filters: ContentFilters;
      maxItems: number;
    };
    secondary: [
      {
        type: 'announcements';
        priority: 'high' | 'medium' | 'low';
        department: DepartmentType[];
      },
      {
        type: 'metrics-dashboard';
        kpis: KPIWidget[];
        updateFrequency: 'real-time' | 'hourly' | 'daily';
      },
      {
        type: 'events-calendar';
        timeRange: 'today' | 'week' | 'month';
        eventTypes: EventType[];
      },
    ];
  };
}
```

**Video Template (Enhanced Media Display)**:

```typescript
interface VideoTemplate {
  id: 'nova-media-player';
  name: 'Nova Media Display';

  videoSettings: {
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    showSubtitles: boolean;
    subtitleLanguage: string;
  };

  overlayOptions: {
    showQRCode: boolean;
    qrCodePosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    showTitle: boolean;
    showDepartmentBranding: boolean;
    customOverlayText?: string;
  };

  mediaQueue: MediaItem[];
  transitionEffects: 'fade' | 'slide' | 'none';
}
```

**Interactive Poster Template**:

```typescript
interface InteractivePosterTemplate {
  id: 'nova-digital-billboard';
  name: 'Nova Interactive Poster';

  displaySettings: {
    duration: number; // seconds (30-3600)
    transitionEffect: TransitionType;
    backgroundMusic?: AudioFile;
  };

  interactivityOptions: {
    enableQRCode: boolean;
    qrCodeAction: 'view-details' | 'feedback-form' | 'custom-url';
    touchScreenSupport: boolean;
    gestureControls?: GestureMapping[];
  };

  contentRotation: PosterContent[];
  animationPresets: AnimationPreset[];
}
```

#### 3.2 Department-Specific Content Feeds

**Automated Content Intelligence**:

```typescript
interface ContentIntelligence {
  // AI-Powered Content Curation
  aiContentSuggestions: {
    enabled: boolean;
    learningModel: 'engagement-based' | 'relevance-based' | 'hybrid';
    feedbackLoop: boolean;
  };

  // Department Content Rules
  departmentRules: {
    [key in DepartmentType]: {
      contentPriority: ContentPriorityRules;
      excludeKeywords: string[];
      includeOnlyFromSources: string[];
      maxContentAge: number; // hours
    };
  };

  // Real-time Filtering
  dynamicFilters: {
    urgencyLevel: 'critical' | 'high' | 'normal' | 'low';
    audienceScope: 'department' | 'company' | 'location';
    contentTypes: ContentType[];
  };
}
```

### 4. Advanced User Experience Features

#### 4.1 Real-Time Collaboration

**Multi-User Dashboard Editing**:

```typescript
interface CollaborativeEditing {
  // Real-time Presence
  activeEditors: UserPresence[];

  // Conflict Resolution
  changeTracking: ChangeEvent[];
  mergeConflictResolution: 'last-writer-wins' | 'manual-merge' | 'version-branches';

  // Permission Management
  editPermissions: {
    canEdit: string[]; // user IDs
    canView: string[]; // user IDs
    canPublish: string[]; // user IDs
    adminOverride: boolean;
  };

  // Communication
  comments: DashboardComment[];
  notifications: CollaborationNotification[];
}
```

#### 4.2 Advanced Analytics & Insights

**Dashboard Performance Analytics**:

```typescript
interface DashboardAnalytics {
  // Engagement Metrics
  viewership: {
    uniqueViews: number;
    averageViewDuration: number;
    peakViewingHours: TimeRange[];
    departmentBreakdown: Record<DepartmentType, number>;
  };

  // Content Performance
  contentEffectiveness: {
    mostEngagingContent: ContentItem[];
    leastEngagingContent: ContentItem[];
    optimalRefreshIntervals: number[];
    contentTypePerformance: Record<ContentType, PerformanceMetrics>;
  };

  // System Performance
  technicalMetrics: {
    loadTimes: number[];
    errorRates: number;
    devicePerformance: Record<string, DevicePerformance>;
    bandwidthUsage: BandwidthMetrics;
  };

  // Recommendations
  aiRecommendations: {
    contentOptimization: string[];
    layoutSuggestions: LayoutSuggestion[];
    timingRecommendations: TimingRecommendation[];
  };
}
```

### 5. Integration with Nova Universe Ecosystem

#### 5.1 Unified Authentication & Permissions

**Seamless Integration Points**:

```typescript
interface NovaUniverseIntegration {
  // Authentication
  authenticationService: {
    useExistingHelixAuth: boolean;
    ssoIntegration: boolean;
    roleBasedAccess: {
      admin: AdminPermissions;
      agent: AgentPermissions;
      user: UserPermissions;
      department_head: DepartmentHeadPermissions;
    };
  };

  // Data Sources
  dataIntegration: {
    ticketingSystem: TicketSystemIntegration;
    assetManagement: AssetManagementIntegration;
    learningPlatform: LearningPlatformIntegration;
    gamificationSystem: GamificationIntegration;
    monitoringAlerts: MonitoringIntegration;
  };

  // Notification System
  notificationIntegration: {
    realTimeAlerts: boolean;
    emailNotifications: boolean;
    mobileAppIntegration: boolean;
    slackIntegration: boolean;
  };
}
```

#### 5.2 Widget Framework Extension

**Leveraging Existing Widget System**:

```typescript
interface NovaWidgetFramework {
  // Extend existing widget types
  existingWidgets: [
    'ticket-overview',
    'asset-status',
    'user-dashboard',
    'performance-metrics',
    'gamification-leaderboard',
  ];

  // New TV-specific widgets
  tvSpecificWidgets: [
    'large-format-metrics',
    'scrolling-announcements',
    'video-background-widget',
    'interactive-floor-plan',
    'qr-code-generator',
    'weather-location-widget',
    'clock-timezone-widget',
    'emergency-alert-banner',
  ];

  // Widget Adaptation
  responsiveDesign: {
    autoScaling: boolean;
    fontSizeAdjustment: 'auto' | 'manual';
    colorContrastOptimization: boolean;
    distanceViewingOptimization: boolean;
  };
}
```

## 📋 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

```markdown
- [ ] Core dashboard creation interface
- [ ] Basic QR code authentication system
- [ ] Device management foundation
- [ ] Database schema implementation
- [ ] Template framework setup
```

### Phase 2: Template System (Weeks 5-8)

```markdown
- [ ] Summary template implementation
- [ ] Video template with overlay support
- [ ] Interactive poster template
- [ ] Content management interface
- [ ] Department-specific templates
```

### Phase 3: Advanced Features (Weeks 9-12)

```markdown
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] AI-powered content recommendations
- [ ] Multi-screen synchronization
- [ ] Performance optimization
```

### Phase 4: Integration & Polish (Weeks 13-16)

```markdown
- [ ] Complete Nova Universe integration
- [ ] Mobile app companion features
- [ ] Advanced security features
- [ ] Accessibility compliance
- [ ] User training materials
```

## 🔧 Technical Implementation Details

### Database Schema Extensions

```sql
-- Nova TV Dashboard Tables
CREATE TABLE nova_tv_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  template_id UUID REFERENCES nova_tv_templates(id),
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nova_tv_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  department VARCHAR(50),
  ip_address INET,
  browser_info TEXT,
  device_fingerprint VARCHAR(255) UNIQUE,
  dashboard_id UUID REFERENCES nova_tv_dashboards(id),
  last_active_at TIMESTAMP,
  connection_status VARCHAR(20) DEFAULT 'disconnected',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nova_tv_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  department_type VARCHAR(50),
  template_config JSONB NOT NULL,
  is_system_template BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nova_tv_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES nova_tv_dashboards(id),
  content_type VARCHAR(50) NOT NULL,
  content_data JSONB NOT NULL,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nova_tv_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES nova_tv_dashboards(id),
  device_id UUID REFERENCES nova_tv_devices(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints Structure

```typescript
// Nova TV API Routes
interface NovaTVAPIRoutes {
  // Dashboard Management
  'GET /api/nova-tv/dashboards': GetDashboardsResponse;
  'POST /api/nova-tv/dashboards': CreateDashboardRequest;
  'PUT /api/nova-tv/dashboards/:id': UpdateDashboardRequest;
  'DELETE /api/nova-tv/dashboards/:id': DeleteDashboardResponse;

  // Device Management
  'GET /api/nova-tv/devices': GetDevicesResponse;
  'POST /api/nova-tv/devices/register': RegisterDeviceRequest;
  'PUT /api/nova-tv/devices/:id': UpdateDeviceRequest;
  'DELETE /api/nova-tv/devices/:id/revoke': RevokeDeviceResponse;

  // Authentication
  'POST /api/nova-tv/auth/generate-code': GenerateAuthCodeResponse;
  'POST /api/nova-tv/auth/verify-code': VerifyAuthCodeRequest;
  'POST /api/nova-tv/auth/refresh': RefreshTokenRequest;

  // Templates
  'GET /api/nova-tv/templates': GetTemplatesResponse;
  'POST /api/nova-tv/templates': CreateTemplateRequest;
  'GET /api/nova-tv/templates/:id/preview': PreviewTemplateResponse;

  // Content Management
  'POST /api/nova-tv/content': CreateContentRequest;
  'PUT /api/nova-tv/content/:id': UpdateContentRequest;
  'DELETE /api/nova-tv/content/:id': DeleteContentResponse;

  // Analytics
  'GET /api/nova-tv/analytics/dashboard/:id': GetDashboardAnalyticsResponse;
  'POST /api/nova-tv/analytics/events': TrackEventRequest;
}
```

## 🎨 Design System Integration

### Apple-Inspired Design Principles

**Visual Design Language**:

```typescript
interface NovaTVDesignSystem {
  // Typography Scale for Large Displays
  typography: {
    display: '4.5rem'; // 72px for far viewing
    heading1: '3rem'; // 48px
    heading2: '2.25rem'; // 36px
    body: '1.125rem'; // 18px minimum for readability
    caption: '0.875rem'; // 14px
  };

  // Color Palette for High Contrast
  colors: {
    primary: '#007AFF'; // Nova Blue
    secondary: '#34C759'; // Success Green
    accent: '#FF9500'; // Warning Orange
    neutral: {
      50: '#F9FAFB';
      900: '#111827';
    };
    departmentColors: {
      hr: '#FF6B6B';
      it: '#4ECDC4';
      operations: '#45B7D1';
      finance: '#96CEB4';
      security: '#FECA57';
    };
  };

  // Spacing Scale for TV Displays
  spacing: {
    xs: '0.5rem'; // 8px
    sm: '1rem'; // 16px
    md: '1.5rem'; // 24px
    lg: '2rem'; // 32px
    xl: '3rem'; // 48px
    xxl: '4rem'; // 64px
  };

  // Animation Presets
  animations: {
    slideIn: 'ease-out 0.3s';
    fadeIn: 'ease-in-out 0.5s';
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s';
    contentRotation: 'ease-in-out 1s';
  };
}
```

### Accessibility Standards

**WCAG 2.1 AA Compliance**:

```typescript
interface AccessibilityFeatures {
  // Visual Accessibility
  visualSupport: {
    highContrastMode: boolean;
    fontSizeScaling: number; // 100% to 200%
    colorBlindnessSupport: boolean;
    motionReducedMode: boolean;
  };

  // Cognitive Accessibility
  cognitiveSupport: {
    simplifiedLayouts: boolean;
    consistentNavigation: boolean;
    clearHeadings: boolean;
    readableContent: boolean;
  };

  // Distance Viewing Optimization
  distanceViewing: {
    minimumFontSize: '18px';
    maximumInformationDensity: 'low';
    contrastRatio: 7; // WCAG AAA for large text
    readingDistance: '3-6 feet';
  };
}
```

## 🔒 Security & Privacy Considerations

### Data Protection Framework

```typescript
interface SecurityMeasures {
  // Authentication Security
  authentication: {
    multiFactorRequired: boolean;
    sessionTimeout: number; // 24 hours
    deviceTrustValidation: boolean;
    adminOverrideLogging: boolean;
  };

  // Content Security
  contentSecurity: {
    sensitiveDataDetection: boolean;
    contentApprovalWorkflow: boolean;
    automaticContentExpiration: boolean;
    auditLogging: boolean;
  };

  // Network Security
  networkSecurity: {
    httpsRequired: boolean;
    certificatePinning: boolean;
    contentSecurityPolicy: CSPConfig;
    rateLimiting: RateLimitConfig;
  };

  // Privacy Controls
  privacy: {
    personalDataMinimization: boolean;
    consentManagement: boolean;
    dataRetentionPolicies: RetentionPolicy[];
    gdprCompliance: boolean;
  };
}
```

## 📊 Success Metrics & KPIs

### Engagement Metrics

```typescript
interface SuccessMetrics {
  // User Engagement
  engagement: {
    dailyActiveDevices: number;
    averageViewingTime: number;
    contentInteractionRate: number;
    qrCodeScans: number;
  };

  // Content Effectiveness
  contentMetrics: {
    contentCompletionRate: number;
    messageRetention: number;
    actionableItemsCompleted: number;
    feedbackScore: number;
  };

  // System Performance
  performance: {
    systemUptime: number; // target: 99.9%
    averageLoadTime: number; // target: <2s
    errorRate: number; // target: <0.1%
    deviceConnectivity: number; // target: >95%
  };

  // Business Impact
  businessImpact: {
    employeeAwarenessScore: number;
    departmentCommunicationEfficiency: number;
    informationDiscoveryTime: number;
    overallEmployeeSatisfaction: number;
  };
}
```

## 🌟 Future Enhancement Opportunities

### Advanced AI Integration

- **Predictive Content Recommendations**: AI-driven content suggestions based on viewing patterns
- **Automatic Layout Optimization**: Machine learning-optimized dashboard layouts
- **Natural Language Content Generation**: AI-generated announcements and updates
- **Sentiment Analysis**: Real-time mood and engagement monitoring

### Extended Ecosystem Integration

- **IoT Device Integration**: Smart building sensors and automation
- **Voice Control Support**: Alexa/Google Assistant integration for hands-free control
- **Augmented Reality Features**: AR overlays for interactive experiences
- **Mobile Companion App**: Enhanced mobile control and content creation

### Enterprise-Grade Features

- **Multi-Tenant Architecture**: Support for multiple organizations
- **Advanced Workflow Automation**: Trigger-based content updates
- **Enterprise API Gateway**: Third-party system integrations
- **Advanced Analytics Platform**: Comprehensive business intelligence dashboard

---

## 📝 Implementation Notes

This specification provides a comprehensive foundation for implementing Nova TV while maintaining consistency with Nova Universe's existing architecture and design principles. The phased approach ensures manageable development cycles while delivering value incrementally.

The feature set positions Nova Universe as a complete employee experience platform, differentiating it from competitors through its unified approach to digital workplace management.

**Total Estimated Development Time**: 16 weeks
**Team Size**: 4-6 developers (Frontend, Backend, UI/UX, QA)
**Launch Target**: Q2 2025
