// Type definitions for Nova Sentinel monitoring system - Enhanced with full Uptime Kuma parity

// Extended monitor types for complete coverage
export type MonitorType = 
  | 'http' 
  | 'port' 
  | 'ping' 
  | 'keyword' 
  | 'dns' 
  | 'docker' 
  | 'push' 
  | 'steam' 
  | 'real-browser' 
  | 'json-query' 
  | 'mongodb' 
  | 'microsoft-sql-server' 
  | 'postgres';

// Enhanced notification provider types (90+ providers)
export type NotificationProviderType = 
  | 'slack' | 'discord' | 'teams' | 'email' | 'webhook' | 'telegram' 
  | 'pushover' | 'gotify' | 'ntfy' | 'apprise' | 'pushbullet' | 'line'
  | 'mattermost' | 'rocket.chat' | 'matrix' | 'opsgenie' | 'pagerduty' 
  | 'pagertree' | 'signal' | 'clicksendsms' | 'lunasea' | 'dingding'
  | 'wecom' | 'bark' | 'smsmanager' | 'mailgun' | 'smtp' | 'pushsafer'
  | 'octopush' | 'promosms' | 'smspartner' | 'splunk' | 'homeassistant'
  | 'notica' | 'serverless' | 'google-chat' | 'gorush' | 'aliyunsms'
  | 'dingding-robot' | 'feishu' | 'alerta' | 'beanstalk' | 'squadcast'
  | 'keep' | 'google-chat-webhook' | 'smsc' | 'cellsynt' | 'sevenio'
  | 'clickup' | 'google-analytics' | 'webhook-json' | 'gotify-priority'
  | 'ntfy-priority' | 'twilio' | 'freemobile' | 'alertnow' | 'alertmanager'
  | 'goalert' | 'serverchan' | 'techlulus' | 'mailgun-api' | 'zoho'
  | 'mightytext' | 'phonenumber' | 'stackfield' | 'pushme' | 'ifttt'
  | 'post' | 'custom' | 'mqtt' | 'kafka' | 'rabbitMQ' | 'aws-sns'
  | 'aws-ses' | 'azure-notification-hub' | 'gcp-chat' | 'gcp-pubsub'
  | 'facebook-workplace' | 'whatsapp-business' | 'telegram-bot'
  | 'zendesk' | 'freshdesk' | 'servicenow' | 'jira' | 'linear'
  | 'github-issues' | 'gitlab-issues' | 'trello' | 'monday'
  | 'asana' | 'notion' | 'airtable' | 'basecamp' | 'clickup-task'
  | 'monday-item' | 'zapier' | 'make' | 'n8n' | 'integromat';

export interface Monitor {
  id: string;
  kuma_id?: string;
  name: string;
  type: MonitorType;
  url?: string;
  hostname?: string;
  port?: number;
  tenant_id?: string;
  tags: string[];
  interval_seconds: number;
  timeout_seconds: number;
  retry_interval_seconds: number;
  max_retries: number;
  status: 'active' | 'paused' | 'disabled';
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Enhanced monitoring configuration
  interval: number;
  retries: number;
  retry_interval: number;
  resend_interval: number;
  
  // Status and performance
  current_status: boolean;
  uptime_24h?: number;
  uptime_7d?: number;
  uptime_30d?: number;
  avg_response_time_24h?: number;
  avg_response_time_7d?: number;
  avg_response_time_30d?: number;
  
  // Enhanced features
  tag_names?: string[];
  in_maintenance_window?: boolean;
  cert_days_remaining?: number;
  keyword?: string;
  accepted_statuscodes?: string[];
  
  // HTTP specific
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  follow_redirect?: boolean;
  ignore_tls?: boolean;
  
  // Legacy compatibility
  http_method?: string;
  http_headers?: Record<string, string>;
  accepted_status_codes?: number[];
  follow_redirects?: boolean;
  ignore_ssl?: boolean;
  notification_settings?: Record<string, any>;
  maintenance_windows?: any[];
  avg_response_time?: number;
  group_name?: string;
  incident_status?: string;
  
  // Docker specific
  docker_container?: string;
  docker_host?: string;
  
  // DNS specific
  dns_server?: string;
  dns_resolve_type?: string;
  
  // Database specific
  database_connection_string?: string;
  database_query?: string;
  
  // Game server specific
  game_server_type?: string;
  game_server_port?: number;
}

// Enhanced notification provider interface
export interface NotificationProvider {
  id: string;
  name: string;
  type: NotificationProviderType;
  config: Record<string, any>;
  is_default: boolean;
  active: boolean;
  test_success?: boolean;
  tenant_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Monitor tag interface
export interface MonitorTag {
  id: string;
  name: string;
  description?: string;
  color: string;
  monitor_count?: number;
  tenant_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Maintenance window interface
export interface MaintenanceWindow {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  affected_monitors: string[];
  affected_monitor_count?: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  timezone: string;
  tenant_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Status page interface
export interface StatusPage {
  id: string;
  name: string;
  description?: string;
  slug: string;
  custom_domain?: string;
  is_public: boolean;
  password_protected: boolean;
  password?: string;
  theme: 'light' | 'dark' | 'auto';
  monitors: string[];
  groups: StatusPageGroup[];
  incident_history_days: number;
  tenant_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Status page group interface
export interface StatusPageGroup {
  id: string;
  name: string;
  monitors: string[];
  collapsed: boolean;
  sort_order: number;
}

export interface MonitorIncident {
  id: string;
  monitor_id: string;
  ticket_id?: string;
  status: 'open' | 'acknowledged' | 'investigating' | 'resolved';
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  description?: string;
  started_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  auto_resolved: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joined fields
  monitor_name?: string;
  monitor_type?: string;
}

export interface MonitorHeartbeat {
  id: string;
  monitor_id: string;
  status: 'up' | 'down' | 'degraded' | 'maintenance';
  response_time_ms?: number;
  status_code?: number;
  error_message?: string;
  checked_at: string;
  important: boolean;
  metadata?: Record<string, any>;
}

export interface MonitorGroup {
  id: string;
  name: string;
  description?: string;
  tenant_id?: string;
  color: string;
  sort_order: number;
  public_visible: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MonitorSubscription {
  id: string;
  monitor_id: string;
  user_id: string;
  notification_type: 'email' | 'slack' | 'sms' | 'push';
  notification_config: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UptimeHistoryPoint {
  timestamp: string;
  uptime_percent: number;
  avg_response_time: number;
  min_response_time: number;
  max_response_time: number;
  total_checks: number;
}

export interface UptimeStatistics {
  period: string;
  total_checks: number;
  uptime_percent: number;
  downtime_count: number;
  avg_response_time: number;
}

export interface MonitoringAPIResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface MonitorsResponse {
  monitors: Monitor[];
  count: number;
  timestamp: string;
}

export interface IncidentsResponse {
  incidents: MonitorIncident[];
  count: number;
  timestamp: string;
}

export interface HistoryResponse {
  history: UptimeHistoryPoint[];
  statistics: UptimeStatistics;
  timestamp: string;
}

export type MonitorStatus = Monitor['status'];
export type IncidentStatus = MonitorIncident['status'];
export type IncidentSeverity = MonitorIncident['severity'];

// Component prop types
export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'amber';
}

export interface MonitorCardProps {
  monitor: Monitor;
  onUpdate: () => void;
}

export interface IncidentRowProps {
  incident: MonitorIncident;
}

export interface UptimeChartProps {
  monitorId: string;
}

export interface CreateMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface MonitorFormData {
  name: string;
  type: MonitorType;
  url?: string;
  hostname?: string;
  port?: number;
  tenant_id?: string;
  tags: string[];
  interval_seconds: number;
  timeout_seconds: number;
  retry_interval_seconds: number;
  max_retries: number;
  http_method?: string;
  http_headers?: Record<string, string>;
  accepted_status_codes?: number[];
  follow_redirects?: boolean;
  ignore_ssl?: boolean;
}
