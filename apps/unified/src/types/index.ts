// Core application types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar?: string;
  roles: UserRole[];
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  slack: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface DashboardPreferences {
  layout: 'grid' | 'list';
  widgets: DashboardWidget[];
  refreshInterval: number;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, unknown>;
  isVisible: boolean;
}

// Ticket system types
export interface Ticket {
  id: string;
  number: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  category?: string;
  subcategory?: string;
  requester: User;
  requesterId: string;
  assignee?: User;
  assignedGroup?: Group;
  tags: string[];
  customFields: Record<string, unknown>;
  attachments: Attachment[];
  comments: Comment[];
  watchers: User[];
  sla?: SLA;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  dueDate?: string;
}

export type TicketStatus = 'new' | 'open' | 'pending' | 'resolved' | 'closed' | 'canceled';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type TicketType =
  | 'incident'
  | 'request'
  | 'problem'
  | 'change'
  | 'task'
  | 'hr'
  | 'ops'
  | 'isac'
  | 'feedback';

export interface Group {
  id: string;
  name: string;
  description: string;
  members: User[];
  isActive: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  isInternal: boolean;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedBy: User;
  uploadedAt: string;
}

export interface SLA {
  id: string;
  name: string;
  responseTime: number;
  resolutionTime: number;
  breachWarningTime: number;
  isBreached: boolean;
  timeRemaining: number;
}

// Asset management types
export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  description?: string;
  category: AssetCategory;
  type: AssetType;
  status: AssetStatus;
  condition: AssetCondition;
  location?: AssetLocation;
  assignedTo?: User;
  assignedUser?: User;
  owner?: User;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  purchasePrice?: number;
  currentValue?: number;
  customFields: Record<string, unknown>;
  attachments: Attachment[];
  maintenanceHistory: MaintenanceRecord[];
  checkoutHistory: CheckoutRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  customFields: CustomField[];
}

export interface AssetType {
  id: string;
  name: string;
  description?: string;
}

export interface AssetLocation {
  id: string;
  name: string;
  description?: string;
  building?: string;
  floor?: string;
  room?: string;
}

export type AssetStatus =
  | 'available'
  | 'assigned'
  | 'deployed'
  | 'maintenance'
  | 'retired'
  | 'lost'
  | 'stolen';

export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'broken';

export interface Location {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  parentId?: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  type: 'preventive' | 'corrective' | 'upgrade';
  description: string;
  performedBy: User;
  cost?: number;
  startDate: string;
  endDate?: string;
  nextDueDate?: string;
  notes?: string;
  attachments: Attachment[];
}

export interface CheckoutRecord {
  id: string;
  assetId: string;
  checkedOutTo: User;
  checkedOutBy: User;
  checkedOutAt: string;
  expectedReturnDate?: string;
  checkedInAt?: string;
  checkedInBy?: User;
  notes?: string;
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  isRequired: boolean;
  options?: string[];
  defaultValue?: unknown;
  validation?: Record<string, unknown>;
}

// Space management types (Nova Atlas)
export interface Space {
  id: string;
  name: string;
  description?: string;
  type: SpaceType;
  capacity: number;
  location: Location;
  floor?: Floor;
  amenities: Amenity[];
  equipment: Equipment[];
  bookings: SpaceBooking[];
  isActive: boolean;
  isBookable: boolean;
  coordinates?: { x: number; y: number; width: number; height: number };
}

export type SpaceType =
  | 'meeting_room'
  | 'conference_room'
  | 'office'
  | 'desk'
  | 'huddle_room'
  | 'phone_booth'
  | 'lounge'
  | 'kitchen'
  | 'other';

export interface Floor {
  id: string;
  name: string;
  level: number;
  building: Building;
  floorPlan?: FloorPlan;
  spaces: Space[];
}

export interface Building {
  id: string;
  name: string;
  address: string;
  floors: Floor[];
}

export interface FloorPlan {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  scale: number;
  width: number;
  height: number;
  calibrationPoints: CalibrationPoint[];
}

export interface CalibrationPoint {
  imageX: number;
  imageY: number;
  realX: number;
  realY: number;
}

export interface Amenity {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  isWorking: boolean;
  lastMaintenanceDate?: string;
}

export interface SpaceBooking {
  id: string;
  spaceId: string;
  title: string;
  description?: string;
  organizer: User;
  attendees: User[];
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  status: BookingStatus;
  equipment: Equipment[];
  services: Service[];
  zoomRoomId?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'confirmed' | 'tentative' | 'canceled';

export interface Service {
  id: string;
  name: string;
  description?: string;
  cost?: number;
  provider?: string;
}

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phoneNumber?: string;
  host: User;
  purpose: string;
  arrivalTime?: string;
  departureTime?: string;
  badgeNumber?: string;
  status: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
  photo?: string;
  createdAt: string;
}

export type VisitorStatus = 'expected' | 'checked_in' | 'checked_out' | 'no_show';

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  recipient: User;
  isRead: boolean;
  url?: string;
  data?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export type NotificationType = 'ticket' | 'asset' | 'space' | 'system' | 'announcement';

export type NotificationPriority = 'low' | 'normal' | 'high';

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  validation?: Record<string, unknown>;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: string;
  showWhen?: unknown;
}

export interface FormSchema {
  fields: FormField[];
  validation?: Record<string, unknown>;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  status?: string[];
  type?: string[];
  priority?: string[];
  assignee?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  customFilters?: Record<string, unknown>;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// UI state types
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  currentModule: string;
  breadcrumbs: Breadcrumb[];
  loading: boolean;
  error?: string;
}

export interface Breadcrumb {
  label: string;
  href?: string;
  isActive?: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Configuration types
export interface AppConfig {
  apiBaseUrl: string;
  wsUrl: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
  limits: {
    maxFileSize: number;
    maxAttachments: number;
    sessionTimeout: number;
  };
}

// Event types for real-time updates
export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

export interface TicketEvent extends WebSocketMessage {
  type: 'ticket.created' | 'ticket.updated' | 'ticket.deleted';
  payload: {
    ticketId: string;
    ticket?: Ticket;
    changes?: Record<string, unknown>;
  };
}

export interface AssetEvent extends WebSocketMessage {
  type:
    | 'asset.created'
    | 'asset.updated'
    | 'asset.deleted'
    | 'asset.checked_out'
    | 'asset.checked_in';
  payload: {
    assetId: string;
    asset?: Asset;
    changes?: Record<string, unknown>;
  };
}

export interface SpaceEvent extends WebSocketMessage {
  type: 'space.booked' | 'space.updated' | 'space.canceled';
  payload: {
    spaceId: string;
    bookingId?: string;
    booking?: SpaceBooking;
    changes?: Record<string, unknown>;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
