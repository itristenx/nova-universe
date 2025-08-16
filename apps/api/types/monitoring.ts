// Nova Sentinel Monitoring Types
// TypeScript type definitions for the monitoring system

export interface MonitorResult {
  success: boolean;
  responseTime: number;
  statusCode?: number;
  message: string;
  data: Record<string, any>;
  timestamp?: string;
}

export interface Monitor {
  id: string;
  kuma_id?: string;
  name: string;
  type:
    | 'http'
    | 'tcp'
    | 'ping'
    | 'dns'
    | 'push'
    | 'ssl'
    | 'keyword'
    | 'json-query'
    | 'docker'
    | 'steam'
    | 'grpc'
    | 'mqtt'
    | 'radius';
  url?: string;
  hostname?: string;
  port?: number;
  tenant_id?: string;
  tags: string[];
  interval_seconds: number; // Minimum 20 seconds (Kuma compatibility)
  timeout_seconds: number;
  retry_interval_seconds: number;
  max_retries: number;
  status: 'active' | 'paused' | 'disabled';
  created_by?: string;
  created_at: string;
  updated_at: string;
  // HTTP specific
  http_method?: string;
  http_headers?: Record<string, any>;
  http_body?: string;
  accepted_status_codes?: number[];
  follow_redirects?: boolean;
  ignore_ssl?: boolean;
  // Keyword monitoring
  keyword?: string;
  keyword_inverted?: boolean; // Alert when keyword NOT found
  // JSON Query monitoring
  json_path?: string;
  expected_value?: string;
  // Docker monitoring
  docker_container?: string;
  docker_host?: string;
  // Steam monitoring
  steam_id?: string;
  // SSL monitoring
  ssl_days_remaining?: number; // Alert threshold
  // Certificate monitoring
  certificate_info?: {
    issuer?: string;
    valid_from?: string;
    valid_to?: string;
    days_remaining?: number;
  };
  // Proxy settings
  proxy_id?: string;
  // Advanced settings
  notification_settings?: Record<string, any>;
  maintenance_windows?: any[];
  auth_method?: 'none' | 'basic' | 'bearer' | 'api-key';
  auth_username?: string;
  auth_password?: string;
  auth_token?: string;
  auth_domain?: string; // For NTLM
}

export interface MonitorIncident {
  id: string;
  monitor_id: string;
  ticket_id?: string;
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary?: string;
  description?: string;
  started_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  auto_resolved: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MonitorSubscription {
  id: string;
  tenant_id: string;
  user_id?: string;
  email?: string;
  phone?: string;
  webhook_url?: string;
  event_types: string[];
  monitor_ids: string[];
  enabled: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonitorHeartbeat {
  id: string;
  monitor_id: string;
  status: 'up' | 'down' | 'maintenance';
  response_time_ms?: number;
  status_code?: number;
  error_message?: string;
  checked_at: string;
  metadata?: Record<string, any>;
}

export interface MonitorMaintenance {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  affected_monitors: string[];
  tenant_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MonitorGroup {
  id: string;
  name: string;
  description?: string;
  tenant_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MonitorGroupMember {
  id: string;
  group_id: string;
  monitor_id: string;
  added_at: string;
}

export interface StatusPageConfig {
  id: string;
  tenant_id?: string;
  title: string;
  description?: string;
  logo_url?: string;
  custom_css?: string;
  monitor_groups: string[];
  public_url?: string;
  show_incident_history: boolean;
  show_maintenance_schedule: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UptimeKumaMonitor {
  id: number;
  name: string;
  type: string;
  url?: string;
  hostname?: string;
  port?: number;
  interval: number;
  active: boolean;
  status: number; // 0 = down, 1 = up, 2 = pending
}

export interface UptimeKumaHeartbeat {
  id: number;
  monitor_id: number;
  status: number;
  time: string;
  msg: string;
  ping?: number;
  important: boolean;
  duration: number;
}

export interface KumaWebhookEvent {
  heartbeat: UptimeKumaHeartbeat;
  monitor: UptimeKumaMonitor;
  msg: string;
}

export interface MonitorStats {
  total_monitors: number;
  up_monitors: number;
  down_monitors: number;
  paused_monitors: number;
  average_response_time: number;
  uptime_percentage: number;
}

export interface IncidentStats {
  total_incidents: number;
  open_incidents: number;
  resolved_today: number;
  mttr_hours: number; // Mean Time To Resolution
}

export interface NotificationChannel {
  id: string;
  name: string;
  type:
    | 'email'
    | 'sms'
    | 'slack'
    | 'discord'
    | 'webhook'
    | 'telegram'
    | 'pushover'
    | 'gotify'
    | 'teams'
    | 'matrix'
    | 'signal'
    | 'pushbullet'
    | 'line'
    | 'mattermost'
    | 'pushj'
    | 'apprise'
    | 'lunasea'
    | 'feishu'
    | 'aliyunsms'
    | 'dingtalk'
    | 'bark'
    | 'serwersms'
    | 'stackfield'
    | 'smseagle'
    | 'pagerduty'
    | 'pagertree'
    | 'twilio'
    | 'signl4'
    | 'dingding'
    | 'rocket_chat'
    | 'pushsafer'
    | 'octopush'
    | 'promosms'
    | 'clicksendsms'
    | 'lunasea'
    | 'notica'
    | 'pushme'
    | 'gorush'
    | 'opsgenie'
    | 'alerta'
    | 'smsc'
    | 'wecom'
    | 'highsms'
    | 'splunk'
    | 'homeassistant'
    | 'ntfy'
    | 'pduinfo'
    | 'telegram_bot';
  tenant_id?: string;
  config: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_default: boolean;
  is_active: boolean;
}

export interface NotificationSubscription {
  id: string;
  tenant_id: string;
  user_id?: string;
  email?: string;
  phone?: string;
  channels: NotificationChannel[];
  monitors: string[];
  incident_types: string[];
  maintenance_notifications: boolean;
  verified: boolean;
}

export interface NotificationEvent {
  type:
    | 'incident_created'
    | 'incident_updated'
    | 'incident_resolved'
    | 'monitor_down'
    | 'monitor_up'
    | 'maintenance_scheduled';
  monitor_id?: string;
  incident_id?: string;
  tenant_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data: Record<string, any>;
}

export interface MonitoringDashboardProps {
  tenantId?: string;
}

export interface TechnicianMonitoringProps {
  tenantId?: string;
}

export interface PublicStatusPageProps {
  tenantId?: string;
  config?: StatusPageConfig;
}

export interface MonitorFormData {
  name: string;
  type: Monitor['type'];
  url?: string;
  hostname?: string;
  port?: number;
  interval_seconds: number;
  timeout_seconds: number;
  tags: string[];
  notification_settings?: Record<string, any>;
}

export interface IncidentFormData {
  monitor_id: string;
  severity: MonitorIncident['severity'];
  summary: string;
  description?: string;
}

export interface MaintenanceFormData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  affected_monitors: string[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MonitorHistory {
  monitor_id: string;
  timeframe: '1h' | '24h' | '7d' | '30d';
  datapoints: {
    timestamp: string;
    status: 'up' | 'down' | 'maintenance';
    response_time?: number;
  }[];
  uptime_percentage: number;
  average_response_time: number;
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: {
    database: boolean;
    uptime_kuma: boolean;
    notifications: boolean;
  };
  timestamp: string;
}
