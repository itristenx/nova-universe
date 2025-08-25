export interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'progress' | 'alert' | 'activity';
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  refreshInterval?: number; // in seconds
  lastUpdated?: Date;
  isLoading?: boolean;
  error?: string;
}

export interface WidgetConfig {
  metric?: {
    value: number | string;
    target?: number;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
    icon?: string;
  };
  chart?: {
    type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
    data: ChartData[];
    timeRange?: '1h' | '24h' | '7d' | '30d' | '90d';
    showLegend?: boolean;
  };
  table?: {
    columns: TableColumn[];
    data: Record<string, any>[];
    pagination?: boolean;
    maxRows?: number;
  };
  progress?: {
    current: number;
    target: number;
    unit?: string;
    showPercentage?: boolean;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  };
  alert?: {
    severity: 'info' | 'warning' | 'error' | 'success';
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    dismissible?: boolean;
  };
  activity?: {
    items: ActivityItem[];
    maxItems?: number;
    showTimestamps?: boolean;
  };
}

export interface ChartData {
  label: string;
  value: number;
  timestamp?: Date;
  color?: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'status' | 'badge' | 'link';
}

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  type: 'ticket' | 'asset' | 'user' | 'space' | 'alert' | 'system';
  status?: 'success' | 'warning' | 'error' | 'info';
  avatar?: string;
  actionUrl?: string;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  columns: number;
  isDefault?: boolean;
  roles?: string[];
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'admin' | 'agent' | 'user' | 'custom';
  widgets: Omit<Widget, 'id'>[];
  preview?: string;
  tags: string[];
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  totalAssets: number;
  assetsInUse: number;
  assetsAvailable: number;
  totalUsers: number;
  activeUsers: number;
  totalSpaces: number;
  occupiedSpaces: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
  alerts: number;
  criticalAlerts: number;
}

export interface RealTimeEvent {
  id: string;
  type:
    | 'ticket_created'
    | 'ticket_updated'
    | 'asset_checked_out'
    | 'space_booked'
    | 'alert_triggered'
    | 'user_login';
  payload: Record<string, any>;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface CollaborationEvent {
  id: string;
  type:
    | 'user_joined'
    | 'user_left'
    | 'cursor_moved'
    | 'selection_changed'
    | 'comment_added'
    | 'edit_made';
  userId: string;
  userName: string;
  userAvatar?: string;
  data: Record<string, any>;
  timestamp: Date;
  resourceId: string;
  resourceType: 'ticket' | 'asset' | 'space' | 'dashboard';
}

export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentResource?: {
    id: string;
    type: 'ticket' | 'asset' | 'space' | 'dashboard';
    title: string;
  };
  cursor?: {
    x: number;
    y: number;
  };
}
