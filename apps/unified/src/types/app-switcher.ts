// TypeScript types for the Enhanced App Switcher

export interface App {
  id: number;
  name: string;
  description: string;
  url: string;
  iconUrl?: string;
  backgroundColor: string;
  textColor: string;
  appType: string;
  launchConfig: Record<string, any>;
  category: {
    name: string;
    color: string;
    icon: string;
  };
  isFavorite: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  sortOrder: number;
  lastAccess?: string;
  accessCount: number;
  usage30d: number;
  rating: number;
  totalUsers: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  app_count: number;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  type: string;
  visibility: string;
  icon: string;
  color: string;
  is_smart: boolean;
  smart_rules?: Record<string, any>;
  app_count: number;
}

export interface DashboardConfig {
  layout_type: 'grid' | 'list' | 'compact' | 'tiles';
  apps_per_row: number;
  show_app_names: boolean;
  show_descriptions: boolean;
  show_categories: boolean;
  default_view: string;
  auto_launch_behavior: string;
  show_usage_stats: boolean;
  enable_recommendations: boolean;
  theme: string;
  primary_color?: string;
  track_usage: boolean;
  share_usage_analytics: boolean;
}

export interface LaunchContext {
  launch_method?: string;
  referrer?: string;
  device_info?: Record<string, any>;
}

export interface LaunchResponse {
  url: string;
  requires_new_window: boolean;
  sso_enabled: boolean;
  app_type: string;
  custom_headers: Record<string, string>;
}

export interface SearchFilters {
  category_id?: number;
  app_type?: string;
  featured?: boolean;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DashboardData {
  apps: App[];
  categories: Category[];
  collections: Collection[];
  dashboardConfig: DashboardConfig;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
