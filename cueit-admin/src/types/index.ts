export interface User {
  id: number;
  name: string;
  email: string;
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

export interface Kiosk {
  id: string;
  lastSeen: string;
  version: string;
  active: boolean;
  logoUrl?: string;
  bgUrl?: string;
  statusEnabled: boolean;
  currentStatus: 'open' | 'closed' | 'error';
  openMsg: string;
  closedMsg: string;
  errorMsg: string;
  schedule?: Record<string, unknown>;
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
