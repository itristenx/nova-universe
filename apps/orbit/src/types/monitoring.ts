// Nova Sentinel Monitoring Types for Orbit End-User Interface
// Matches Nova Sentinel specification for public status pages

export type ServiceStatus = 'operational' | 'degraded' | 'major_outage' | 'maintenance';
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface PublicService {
  id: string;
  name: string;
  description?: string;
  status: ServiceStatus;
  uptime_24h: number;
  uptime_7d: number;
  uptime_30d: number;
  last_checked: string;
  group?: string;
}

export interface PublicIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affected_services: string[];
  started_at: string;
  updated_at: string;
  resolved_at?: string;
  updates: IncidentUpdate[];
}

export interface IncidentUpdate {
  id: string;
  status: IncidentStatus;
  message: string;
  created_at: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  description?: string;
  services: PublicService[];
  overall_status: ServiceStatus;
}

export interface StatusPageConfig {
  title: string;
  description: string;
  logo_url?: string;
  primary_color: string;
  show_uptime_percentages: boolean;
  show_incident_history_days: number;
  custom_css?: string;
  footer_text?: string;
  twitter_username?: string;
  support_url?: string;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  affected_services: string[];
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface UptimeMetrics {
  current_status: ServiceStatus;
  uptime_24h: number;
  uptime_7d: number;
  uptime_30d: number;
  uptime_90d: number;
  incident_count_30d: number;
  avg_resolution_time: number;
}

export interface NotificationSubscription {
  id: string;
  email: string;
  phone?: string;
  services: string[];
  incident_types: IncidentSeverity[];
  maintenance_notifications: boolean;
  verified: boolean;
}

// API Response Types
export interface StatusPageResponse {
  config: StatusPageConfig;
  services: PublicService[];
  groups: ServiceGroup[];
  active_incidents: PublicIncident[];
  maintenance_windows: MaintenanceWindow[];
  overall_status: ServiceStatus;
  last_updated: string;
}

export interface IncidentHistoryResponse {
  incidents: PublicIncident[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface UptimeHistoryResponse {
  service_id: string;
  data: UptimeDataPoint[];
  period: string;
}

export interface UptimeDataPoint {
  date: string;
  uptime_percent: number;
  downtime_minutes: number;
  incident_count: number;
}

// Component Props Types
export interface StatusPageProps {
  tenant?: string;
  embedded?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface ServiceListProps {
  services: PublicService[];
  groups: ServiceGroup[];
  showUptime?: boolean;
}

export interface ServiceCardProps {
  service: PublicService;
  showUptime?: boolean;
  onClick?: (service: PublicService) => void;
}

export interface ServiceGroupProps {
  group: ServiceGroup;
  showUptime?: boolean;
}

export interface IncidentBannerProps {
  incidents: PublicIncident[];
  onDismiss?: (incidentId: string) => void;
}

export interface IncidentListProps {
  incidents: PublicIncident[];
  showHistory?: boolean;
  maxItems?: number;
}

export interface IncidentCardProps {
  incident: PublicIncident;
  expanded?: boolean;
  onToggle?: () => void;
}

export interface MaintenanceBannerProps {
  maintenance: MaintenanceWindow[];
}

export interface UptimeChartProps {
  serviceId: string;
  period: '24h' | '7d' | '30d' | '90d';
  height?: number;
}

export interface SubscriptionFormProps {
  onSubscribe: (subscription: Omit<NotificationSubscription, 'id' | 'verified'>) => void;
  availableServices: PublicService[];
}

export interface OverallStatusProps {
  status: ServiceStatus;
  lastUpdated: string;
}

export interface MetricsDisplayProps {
  metrics: UptimeMetrics;
}

export interface StatusIndicatorProps {
  status: ServiceStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  banner?: React.ReactNode;
}
