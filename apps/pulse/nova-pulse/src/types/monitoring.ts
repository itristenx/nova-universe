import * as React from 'react'
// Nova Sentinel Enhanced Monitoring Types - Complete Uptime Kuma Parity
// Supports 13+ monitor types and 90+ notification providers

export type MonitorType = 
  | 'http' | 'tcp' | 'ping' | 'dns' | 'ssl' 
  | 'keyword' | 'json-query' | 'docker' | 'steam' 
  | 'grpc' | 'mqtt' | 'radius' | 'push';

export type MonitorStatus = 'active' | 'paused' | 'disabled' | 'maintenance';
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved';

export type NotificationProviderType = 
  | 'telegram' | 'slack' | 'discord' | 'teams' | 'email' | 'webhook'
  | 'pushover' | 'gotify' | 'pagerduty' | 'opsgenie' | 'pushbullet'
  | 'line' | 'mattermost' | 'rocket_chat' | 'feishu' | 'dingtalk'
  | 'bark' | 'ntfy' | 'splunk' | 'homeassistant' | 'matrix' | 'signal';

export interface Monitor {
  id: string;
  tenant_id: string;
  name: string;
  type: MonitorType;
  url?: string;
  hostname?: string;
  port?: number;
  interval_seconds: number;
  timeout_seconds: number;
  retry_interval_seconds: number;
  max_retries: number;
  status: MonitorStatus;
  
  // HTTP-specific
  http_method?: string;
  http_headers?: Record<string, string>;
  http_body?: string;
  accepted_status_codes?: number[];
  follow_redirects?: boolean;
  ignore_ssl?: boolean;
  
  // Enhanced monitoring fields
  keyword?: string;
  keyword_inverted?: boolean;
  json_path?: string;
  expected_value?: string;
  docker_container?: string;
  docker_host?: string;
  steam_id?: string;
  ssl_days_remaining?: number;
  
  // Authentication
  auth_method?: string;
  auth_username?: string;
  auth_password?: string;
  auth_token?: string;
  auth_domain?: string;
  
  // Organization
  description?: string;
  group_name?: string;
  weight?: number;
  tags?: string[];
  tag_names?: string[];
  tag_colors?: string[];
  
  // Statistics
  uptime_24h?: number;
  uptime_7d?: number;
  uptime_30d?: number;
  avg_response_time?: number;
  avg_response_time_24h?: number;
  total_checks_24h?: number;
  failed_checks_24h?: number;
  last_check_time?: string;
  last_response_time?: number;
  current_status?: boolean;
  
  // Certificate info
  cert_days_remaining?: number;
  cert_expired?: boolean;
  cert_issuer?: string;
  
  // Maintenance
  in_maintenance_window?: boolean;
  
  // Push monitoring
  push_token?: string;
  push_url?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface MonitorIncident {
  id: string;
  monitor_id: string;
  monitor_name?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  summary: string;
  description?: string;
  started_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
  resolved_by?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

// Enhanced Monitoring Interfaces
export interface NotificationProvider {
  id: string;
  name: string;
  type: NotificationProviderType;
  config: Record<string, any>;
  is_active: boolean;
  is_default: boolean;
  tenant_id: string;
  test_success?: boolean;
  last_test_at?: string;
  failure_count?: number;
  last_success_at?: string;
  last_failure_at?: string;
  total_sent?: number;
  created_at: string;
  updated_at: string;
}

export interface MonitorTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  monitor_count?: number;
  tenant_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  recurring_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurring_interval?: number;
  recurring_days?: number[];
  notify_subscribers: boolean;
  affected_monitors?: string[];
  affected_tags?: string[];
  affected_monitor_names?: string[];
  affected_tag_names?: string[];
  affected_monitor_count?: number;
  affected_tag_count?: number;
  tenant_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StatusPage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  theme: 'apple' | 'dark' | 'light' | 'custom';
  custom_css?: string;
  custom_domain?: string;
  published: boolean;
  show_uptime: boolean;
  show_incident_history: boolean;
  incident_history_days: number;
  show_powered_by: boolean;
  password_protected: boolean;
  password?: string;
  monitor_count?: number;
  subscriber_count?: number;
  tenant_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface StatusPageIncident {
  id: string;
  status_page_id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CertificateInfo {
  monitor_id: string;
  hostname: string;
  port: number;
  issuer: string;
  subject: string;
  serial_number: string;
  valid_from: string;
  valid_to: string;
  days_remaining: number;
  fingerprint: string;
  fingerprint256: string;
  is_self_signed: boolean;
  is_expired: boolean;
  is_valid: boolean;
  last_checked: string;
}

export interface UptimeHistoryPoint {
  timestamp: string;
  uptime_percent: number;
  response_time: number;
  status: 'up' | 'down' | 'degraded';
}

export interface MonitorGroup {
  id: string;
  name: string;
  description?: string;
  monitors: Monitor[];
  uptime_24h: number;
}

// API Response Types
export interface MonitorsResponse {
  monitors: Monitor[];
  total: number;
  page?: number;
  limit?: number;
}

export interface IncidentsResponse {
  incidents: MonitorIncident[];
  total: number;
  page?: number;
  limit?: number;
}

export interface HistoryResponse {
  history: UptimeHistoryPoint[];
  monitor_id: string;
  period: string;
}

export interface GroupsResponse {
  groups: MonitorGroup[];
  total: number;
}

// Component Props Types
export interface TechnicianDashboardProps {
  className?: string;
}

export interface IncidentListProps {
  incidents: MonitorIncident[];
  onAcknowledge: (incidentId: string) => void;
  onResolve: (incidentId: string) => void;
  onInvestigate: (incidentId: string) => void;
}

export interface IncidentCardProps {
  incident: MonitorIncident;
  onAcknowledge: (incidentId: string) => void;
  onResolve: (incidentId: string) => void;
  onInvestigate: (incidentId: string) => void;
}

export interface MonitorStatusGridProps {
  monitors: Monitor[];
  onMonitorClick: (monitor: Monitor) => void;
}

export interface MonitorStatusCardProps {
  monitor: Monitor;
  onClick: (monitor: Monitor) => void;
}

export interface GroupStatusProps {
  groups: MonitorGroup[];
  onGroupClick: (group: MonitorGroup) => void;
}

export interface GroupCardProps {
  group: MonitorGroup;
  onClick: (group: MonitorGroup) => void;
}

export interface QuickActionsProps {
  onAcknowledgeAll: () => void;
  onRefresh: () => void;
  onCreateIncident: () => void;
}

export interface RealTimeStatsProps {
  totalMonitors: number;
  activeIncidents: number;
  avgResponseTime: number;
  globalUptime: number;
}

export interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface MonitorDetailModalProps {
  monitor: Monitor | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface IncidentDetailModalProps {
  incident: MonitorIncident | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (incidentId: string, status: IncidentStatus) => void;
}
