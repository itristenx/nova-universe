import * as React from 'react'
// Nova Alert System Type Definitions
// Complete 1:1 feature parity with GoAlert backend

export interface Alert {
  id: string;
  summary: string;
  description?: string;
  status: 'triggered' | 'acknowledged' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: 'workflow' | 'manual' | 'ticket' | 'cosmo' | 'integration';
  serviceId: string;
  serviceName: string;
  ticketId?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdBy?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  escalationLevel: number;
  tags: string[];
  metadata: Record<string, any>;
  novaMetadata?: {
    sourceTicketId?: string;
    createdBy?: string;
    operation: string;
    metadata: Record<string, any>;
  };
}

export interface Schedule {
  id: string;
  name: string;
  description?: string;
  timeZone: string;
  enabled: boolean;
  currentOnCall: OnCallUser[];
  nextOnCall: OnCallUser[];
  userCanEdit: boolean;
  rules?: ScheduleRule[];
  overrides?: ScheduleOverride[];
}

export interface OnCallUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  shiftStart: string;
  shiftEnd: string;
  isBackup: boolean;
}

export interface ScheduleRule {
  id: string;
  scheduleId: string;
  start: string;
  end: string;
  userId: string;
  userName: string;
  isActive: boolean;
  weeklyRecurrence?: {
    days: number[]; // 0-6, Sunday = 0
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  };
}

export interface ScheduleOverride {
  id: string;
  scheduleId: string;
  userId: string;
  userName: string;
  start: string;
  end: string;
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  escalationPolicyId: string;
  escalationPolicy?: EscalationPolicy;
  integrationCount: number;
  userCanEdit: boolean;
  alertCount?: number;
  lastAlertAt?: string;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  description?: string;
  stepCount: number;
  steps: EscalationStep[];
  userCanEdit: boolean;
}

export interface EscalationStep {
  id: string;
  stepNumber: number;
  delayMinutes: number;
  targets: EscalationTarget[];
}

export interface EscalationTarget {
  id: string;
  type: 'user' | 'schedule' | 'webhook' | 'slack' | 'email';
  name: string;
  details: Record<string, any>;
}

export interface AlertWorkflowRule {
  id: string;
  ruleName: string;
  description?: string;
  triggerConditions: Record<string, any>;
  actions: Record<string, any>;
  priority: number;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertPreferences {
  id: string;
  userId: string;
  goalertUserId?: string;
  notificationMethods: string[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  autoAcknowledgeTimeout: number;
  escalationDelay: number;
  enabled: boolean;
}

export interface NotificationChannel {
  id: string;
  channelType: 'email' | 'sms' | 'slack' | 'teams' | 'webhook';
  channelName: string;
  goalertChannelId?: string;
  configuration: Record<string, any>;
  userId?: string;
  teamId?: string;
  enabled: boolean;
}

export interface SuppressionWindow {
  id: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  serviceIds?: string[];
  reason?: string;
  createdBy: string;
  enabled: boolean;
  createdAt: string;
}

export interface AlertStats {
  totalAlerts: number;
  alertsByStatus: Record<string, number>;
  alertsByPriority: Record<string, number>;
  alertsByService: Record<string, number>;
  averageResponseTime: number;
  averageResolutionTime: number;
  escalationRate: number;
  period: {
    start: string;
    end: string;
  };
}

export interface AlertFilters {
  status?: string[];
  priority?: string[];
  serviceId?: string[];
  assignedTo?: string[];
  createdAfter?: string;
  createdBefore?: string;
  tags?: string[];
  source?: string[];
}

export interface AlertHistory {
  alerts: Alert[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Event types for real-time updates
export interface AlertEvent {
  type: 'alert.created' | 'alert.acknowledged' | 'alert.resolved' | 'alert.escalated' | 'schedule.updated';
  alertId?: string;
  scheduleId?: string;
  userId?: string;
  timestamp: string;
  data: Record<string, any>;
}

// Form types for creating/editing
export interface CreateAlertRequest {
  summary: string;
  description?: string;
  source: string;
  serviceId: string;
  priority?: string;
  ticketId?: string;
  metadata?: Record<string, any>;
}

export interface EscalateAlertRequest {
  ticketId: string;
  reason: string;
  priority?: string;
  serviceId: string;
}

export interface CreateScheduleOverrideRequest {
  scheduleId: string;
  userId: string;
  start: string;
  end: string;
  reason?: string;
}

// UI State types
export interface AlertListState {
  alerts: Alert[];
  loading: boolean;
  error?: string;
  filters: AlertFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  selectedAlerts: string[];
  sortBy: 'createdAt' | 'priority' | 'status' | 'serviceName';
  sortOrder: 'asc' | 'desc';
}

export interface ScheduleViewState {
  schedules: Schedule[];
  selectedSchedule?: Schedule;
  loading: boolean;
  error?: string;
  viewMode: 'list' | 'calendar' | 'timeline';
  timeRange: {
    start: string;
    end: string;
  };
}

export interface AlertDashboardState {
  stats: AlertStats;
  recentAlerts: Alert[];
  activeSchedules: Schedule[];
  loading: boolean;
  error?: string;
  refreshInterval: number;
  lastRefresh: string;
}

// Apple-specific UI component props
export interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onEscalate?: (alertId: string) => void;
  onSelect?: (alertId: string, selected: boolean) => void;
  isSelected?: boolean;
  compact?: boolean;
  showActions?: boolean;
}

export interface ScheduleCardProps {
  schedule: Schedule;
  onScheduleSelect?: (schedule: Schedule) => void;
  onOverrideCreate?: (override: CreateScheduleOverrideRequest) => void;
  onRotateNow?: (scheduleId: string) => void;
  showCurrentOnly?: boolean;
  compact?: boolean;
}

export interface OnCallIndicatorProps {
  users: OnCallUser[];
  schedule?: Schedule;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  interactive?: boolean;
}

// Animation and transition types
export interface AlertAnimationProps {
  type: 'slideIn' | 'fadeIn' | 'pulse' | 'bounce';
  duration?: number;
  delay?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// Accessibility types
export interface AlertAccessibilityProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

// Theme and styling types
export interface AlertThemeProps {
  variant?: 'default' | 'compact' | 'detailed';
  colorScheme?: 'light' | 'dark' | 'auto';
  accentColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

// Error handling
export interface AlertError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  retryable: boolean;
}

export interface AlertOperationResult {
  success: boolean;
  error?: AlertError;
  data?: any;
  timestamp: string;
}
