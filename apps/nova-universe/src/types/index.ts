// Base types
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

// User and Authentication types
export interface User extends BaseEntity {
  email: string
  name: string
  firstName?: string
  lastName?: string
  avatar?: string
  roles: UserRole[]
  permissions: Permission[]
  isActive: boolean
  lastLoginAt?: string
  preferences: UserPreferences
  novaId: string
}

export interface UserRole {
  id: string
  name: string
  displayName: string
  description?: string
  permissions: Permission[]
  module?: NovaModule
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  scope?: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationPreferences
  dashboard: DashboardPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  ticketUpdates: boolean
  systemAlerts: boolean
}

export interface DashboardPreferences {
  defaultView: 'overview' | 'tickets' | 'analytics'
  widgets: string[]
  layout: 'compact' | 'comfortable' | 'spacious'
}

// Nova Module types
export type NovaModule = 'core' | 'pulse' | 'orbit' | 'beacon' | 'lore' | 'synth'

export interface ModuleConfig {
  name: NovaModule
  displayName: string
  description: string
  icon: string
  color: string
  enabled: boolean
  requiredRoles: string[]
  features: ModuleFeature[]
}

export interface ModuleFeature {
  name: string
  enabled: boolean
  requiredPermissions: string[]
}

// Ticket types
export interface Ticket extends BaseEntity {
  number: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  subcategory?: string
  assignee?: User
  reporter: User
  tags: string[]
  attachments: Attachment[]
  comments: TicketComment[]
  slaTarget?: Date
  resolvedAt?: string
  closedAt?: string
  metadata: Record<string, any>
}

export type TicketStatus = 
  | 'new'
  | 'open'
  | 'in_progress'
  | 'pending'
  | 'resolved'
  | 'closed'
  | 'cancelled'

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export interface TicketCategory {
  id: string
  name: string
  description?: string
  module: NovaModule
  subcategories: TicketSubcategory[]
}

export interface TicketSubcategory {
  id: string
  name: string
  description?: string
}

export interface TicketComment extends BaseEntity {
  content: string
  author: User
  isInternal: boolean
  attachments: Attachment[]
}

export interface Attachment extends BaseEntity {
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedBy: User
}

// Asset types
export interface Asset extends BaseEntity {
  name: string
  assetTag: string
  serialNumber?: string
  model: string
  manufacturer: string
  category: AssetCategory
  status: AssetStatus
  assignedTo?: User
  location?: string
  purchaseDate?: string
  warrantyExpiry?: string
  cost?: number
  notes?: string
  specifications: Record<string, any>
}

export type AssetStatus = 
  | 'active'
  | 'inactive'
  | 'maintenance'
  | 'retired'
  | 'lost'
  | 'stolen'

export interface AssetCategory {
  id: string
  name: string
  description?: string
  fields: AssetField[]
}

export interface AssetField {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'select'
  required: boolean
  options?: string[]
}

// Knowledge Base types
export interface Article extends BaseEntity {
  title: string
  content: string
  summary?: string
  category: ArticleCategory
  tags: string[]
  author: User
  status: ArticleStatus
  visibility: ArticleVisibility
  views: number
  likes: number
  attachments: Attachment[]
  relatedArticles: string[]
  lastReviewedAt?: string
  reviewedBy?: User
}

export type ArticleStatus = 'draft' | 'published' | 'archived'
export type ArticleVisibility = 'public' | 'internal' | 'restricted'

export interface ArticleCategory {
  id: string
  name: string
  description?: string
  parent?: string
  icon?: string
}

// Dashboard and Analytics types
export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  position: WidgetPosition
  size: WidgetSize
  config: Record<string, any>
  data?: any
}

export type WidgetType = 
  | 'metric'
  | 'chart'
  | 'table'
  | 'list'
  | 'progress'
  | 'status'
  | 'calendar'

export interface WidgetPosition {
  x: number
  y: number
}

export interface WidgetSize {
  width: number
  height: number
}

export interface Metric {
  name: string
  value: number | string
  change?: number
  changeType?: 'increase' | 'decrease'
  format?: 'number' | 'percentage' | 'currency' | 'bytes'
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  pagination?: PaginationInfo
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

// Form and UI types
export interface FormField {
  name: string
  label: string
  type: FormFieldType
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  validation?: FormValidation
}

export type FormFieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FormValidation {
  min?: number
  max?: number
  pattern?: string
  message?: string
}

// Toast and Notification types
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number
  action?: ToastAction
}

export interface ToastAction {
  label: string
  onClick: () => void
}

// Theme and Configuration types
export interface ThemeConfig {
  name: string
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, string>
  borderRadius: Record<string, string>
}

export interface AppConfig {
  name: string
  version: string
  apiUrl: string
  features: Record<string, boolean>
  modules: ModuleConfig[]
  theme: ThemeConfig
}

// Search and Filter types
export interface SearchFilter {
  field: string
  operator: FilterOperator
  value: any
}

export type FilterOperator = 
  | 'equals'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'

export interface SearchOptions {
  query?: string
  filters?: SearchFilter[]
  sort?: SortOption[]
  page?: number
  limit?: number
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
}

// Real-time types
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: number
}

export interface NotificationMessage {
  id: string
  type: 'ticket_update' | 'assignment' | 'mention' | 'system'
  title: string
  message: string
  data?: Record<string, any>
  timestamp: number
  read: boolean
}