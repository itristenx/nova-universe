export interface Package {
  id: string;
  trackingNumber: string;
  carrier: Carrier;
  recipient: Recipient;
  sender: Sender;
  status: PackageStatus;
  location: string;
  lockerAssignment?: LockerAssignment;
  images: PackageImage[];
  notifications: Notification[];
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  pickedUpAt?: string;
  pickupCode?: string;
  priority: PackagePriority;
  packageType: PackageType;
  dimensions?: PackageDimensions;
  weight?: number;
  specialInstructions?: string;
  chainOfCustody: CustodyRecord[];
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  location: string;
  building?: string;
  floor?: string;
  room?: string;
  deliveryPreferences: DeliveryPreferences;
}

export interface Sender {
  name: string;
  company?: string;
  address: Address;
  phone?: string;
  email?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface DeliveryPreferences {
  notificationChannels: NotificationChannel[];
  preferredPickupTime?: TimeWindow;
  delegatedPickupUsers: string[];
  specialInstructions?: string;
}

export interface TimeWindow {
  start: string;
  end: string;
}

export interface LockerAssignment {
  lockerId: string;
  lockerNumber: string;
  accessCode: string;
  expiresAt: string;
  assignedAt: string;
}

export interface PackageImage {
  id: string;
  url: string;
  type: ImageType;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  message: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  failed?: boolean;
  failureReason?: string;
}

export interface CustodyRecord {
  id: string;
  action: CustodyAction;
  performedBy: string;
  timestamp: string;
  location: string;
  notes?: string;
  signature?: string;
  ipAddress?: string;
}

export interface PackageDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'inches' | 'cm';
}

export interface ScanResult {
  trackingNumber?: string;
  carrier?: Carrier;
  confidence: number;
  rawText: string;
  extractedData: Record<string, unknown>;
  image: string;
}

export interface SmartLocker {
  id: string;
  number: string;
  size: LockerSize;
  status: LockerStatus;
  location: string;
  currentPackage?: string;
  lastUsed?: string;
  maintenanceStatus: MaintenanceStatus;
}

export interface LockerNetwork {
  id: string;
  name: string;
  location: string;
  lockers: SmartLocker[];
  status: NetworkStatus;
  totalCapacity: number;
  availableCapacity: number;
}

export interface PackageStats {
  totalPackages: number;
  pendingPickup: number;
  deliveredToday: number;
  averageProcessingTime: number;
  utilizationRate: number;
  topCarriers: CarrierStats[];
  departmentBreakdown: DepartmentStats[];
}

export interface CarrierStats {
  carrier: Carrier;
  count: number;
  percentage: number;
}

export interface DepartmentStats {
  department: string;
  count: number;
  percentage: number;
}

// Enums
export enum PackageStatus {
  RECEIVED = 'received',
  PROCESSING = 'processing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  IN_LOCKER = 'in_locker',
  PICKED_UP = 'picked_up',
  RETURNED_TO_SENDER = 'returned_to_sender',
  DAMAGED = 'damaged',
  LOST = 'lost',
}

export enum PackagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum PackageType {
  ENVELOPE = 'envelope',
  BOX = 'box',
  TUBE = 'tube',
  PALLET = 'pallet',
  IRREGULAR = 'irregular',
}

export enum Carrier {
  FEDEX = 'fedex',
  UPS = 'ups',
  USPS = 'usps',
  DHL = 'dhl',
  AMAZON = 'amazon',
  OTHER = 'other',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  SLACK = 'slack',
  VOICE = 'voice',
}

export enum NotificationType {
  PACKAGE_RECEIVED = 'package_received',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKUP_REMINDER = 'pickup_reminder',
  PACKAGE_DELIVERED = 'package_delivered',
  PACKAGE_RETURNED = 'package_returned',
  LOCKER_ASSIGNED = 'locker_assigned',
  ESCALATION = 'escalation',
}

export enum ImageType {
  LABEL = 'label',
  PACKAGE = 'package',
  DAMAGE = 'damage',
  SIGNATURE = 'signature',
}

export enum CustodyAction {
  RECEIVED = 'received',
  SCANNED = 'scanned',
  ASSIGNED_LOCKER = 'assigned_locker',
  NOTIFICATION_SENT = 'notification_sent',
  ACCESS_GRANTED = 'access_granted',
  PICKED_UP = 'picked_up',
  RETURNED = 'returned',
  ESCALATED = 'escalated',
}

export enum LockerSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large',
}

export enum LockerStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  OUT_OF_ORDER = 'out_of_order',
  MAINTENANCE = 'maintenance',
}

export enum MaintenanceStatus {
  GOOD = 'good',
  NEEDS_ATTENTION = 'needs_attention',
  CRITICAL = 'critical',
}

export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  PARTIAL = 'partial',
}
