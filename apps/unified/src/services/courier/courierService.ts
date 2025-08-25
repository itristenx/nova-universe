import axios from 'axios';
import {
  Package,
  PackageStatus,
  ScanResult,
  SmartLocker,
  LockerNetwork,
  PackageStats,
  Recipient,
  NotificationChannel,
  CustodyAction,
} from '../../types/courier';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/courier`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nova_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class CourierService {
  // Package Management
  static async getPackages(filters?: {
    status?: PackageStatus;
    recipient?: string;
    carrier?: string;
    dateFrom?: string;
    dateTo?: string;
    location?: string;
  }): Promise<Package[]> {
    const response = await api.get('/packages', { params: filters });
    return response.data;
  }

  static async getPackage(id: string): Promise<Package> {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  }

  static async createPackage(packageData: Partial<Package>): Promise<Package> {
    const response = await api.post('/packages', packageData);
    return response.data;
  }

  static async updatePackage(id: string, updates: Partial<Package>): Promise<Package> {
    const response = await api.patch(`/packages/${id}`, updates);
    return response.data;
  }

  static async updatePackageStatus(
    id: string,
    status: PackageStatus,
    notes?: string,
  ): Promise<Package> {
    const response = await api.patch(`/packages/${id}/status`, { status, notes });
    return response.data;
  }

  static async deletePackage(id: string): Promise<void> {
    await api.delete(`/packages/${id}`);
  }

  // Package Reception & Scanning
  static async receivePackage(scanData: {
    images: File[];
    manualData?: Partial<Package>;
  }): Promise<{ package: Package; scanResult: ScanResult }> {
    const formData = new FormData();

    scanData.images.forEach((image) => {
      formData.append(`images`, image);
    });

    if (scanData.manualData) {
      formData.append('manualData', JSON.stringify(scanData.manualData));
    }

    const response = await api.post('/packages/receive', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async scanPackageLabel(imageFile: File): Promise<ScanResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/scan/label', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async batchScanPackages(images: File[]): Promise<ScanResult[]> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post('/scan/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Smart Locker Management
  static async getLockerNetworks(): Promise<LockerNetwork[]> {
    const response = await api.get('/lockers/networks');
    return response.data;
  }

  static async getAvailableLockers(
    packageId: string,
    requiredSize?: string,
  ): Promise<SmartLocker[]> {
    const response = await api.get('/lockers/available', {
      params: { packageId, requiredSize },
    });
    return response.data;
  }

  static async assignPackageToLocker(
    packageId: string,
    lockerId: string,
  ): Promise<{ package: Package; accessCode: string }> {
    const response = await api.post(`/packages/${packageId}/assign-locker`, {
      lockerId,
    });
    return response.data;
  }

  static async releaseLocker(
    packageId: string,
    accessCode: string,
  ): Promise<{ success: boolean; package: Package }> {
    const response = await api.post(`/packages/${packageId}/release-locker`, {
      accessCode,
    });
    return response.data;
  }

  static async getLockerStatus(lockerId: string): Promise<SmartLocker> {
    const response = await api.get(`/lockers/${lockerId}`);
    return response.data;
  }

  // Notifications
  static async sendNotification(
    packageId: string,
    channels: NotificationChannel[],
    customMessage?: string,
  ): Promise<{ sent: number; failed: number; details: unknown[] }> {
    const response = await api.post(`/packages/${packageId}/notify`, {
      channels,
      customMessage,
    });
    return response.data;
  }

  static async getNotificationHistory(packageId: string): Promise<unknown[]> {
    const response = await api.get(`/packages/${packageId}/notifications`);
    return response.data;
  }

  static async updateNotificationPreferences(
    recipientId: string,
    preferences: {
      channels: NotificationChannel[];
      timeWindow?: { start: string; end: string };
      frequency?: 'immediate' | 'hourly' | 'daily';
    },
  ): Promise<Recipient> {
    const response = await api.patch(`/recipients/${recipientId}/preferences`, preferences);
    return response.data;
  }

  // Recipients Management
  static async getRecipients(query?: string): Promise<Recipient[]> {
    const response = await api.get('/recipients', { params: { q: query } });
    return response.data;
  }

  static async getRecipient(id: string): Promise<Recipient> {
    const response = await api.get(`/recipients/${id}`);
    return response.data;
  }

  static async createRecipient(recipientData: Partial<Recipient>): Promise<Recipient> {
    const response = await api.post('/recipients', recipientData);
    return response.data;
  }

  static async updateRecipient(id: string, updates: Partial<Recipient>): Promise<Recipient> {
    const response = await api.patch(`/recipients/${id}`, updates);
    return response.data;
  }

  // Analytics & Reporting
  static async getPackageStats(period?: '24h' | '7d' | '30d' | '90d'): Promise<PackageStats> {
    const response = await api.get('/analytics/stats', { params: { period } });
    return response.data;
  }

  static async getDeliveryMetrics(dateRange: { startDate: string; endDate: string }): Promise<{
    averageProcessingTime: number;
    deliverySuccessRate: number;
    mostActiveHours: { hour: number; count: number }[];
    carrierPerformance: unknown[];
  }> {
    const response = await api.get('/analytics/metrics', { params: dateRange });
    return response.data;
  }

  static async generateReport(
    type: 'daily' | 'weekly' | 'monthly' | 'custom',
    options: {
      startDate?: string;
      endDate?: string;
      departments?: string[];
      carriers?: string[];
      format?: 'json' | 'csv' | 'pdf';
    },
  ): Promise<{ reportId: string; downloadUrl?: string }> {
    const response = await api.post('/reports/generate', { type, options });
    return response.data;
  }

  // Chain of Custody
  static async addCustodyRecord(
    packageId: string,
    action: CustodyAction,
    notes?: string,
  ): Promise<void> {
    await api.post(`/packages/${packageId}/custody`, {
      action,
      notes,
      timestamp: new Date().toISOString(),
    });
  }

  static async getCustodyHistory(packageId: string): Promise<unknown[]> {
    const response = await api.get(`/packages/${packageId}/custody`);
    return response.data;
  }

  // Search & Filtering
  static async searchPackages(query: {
    text?: string;
    filters?: {
      status?: PackageStatus[];
      carriers?: string[];
      dateRange?: { start: string; end: string };
      departments?: string[];
      priority?: string[];
    };
    sortBy?: 'createdAt' | 'status' | 'recipient' | 'carrier';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{
    packages: Package[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await api.post('/packages/search', query);
    return response.data;
  }

  // Bulk Operations
  static async bulkUpdateStatus(
    packageIds: string[],
    status: PackageStatus,
    notes?: string,
  ): Promise<{ updated: number; failed: string[] }> {
    const response = await api.patch('/packages/bulk/status', {
      packageIds,
      status,
      notes,
    });
    return response.data;
  }

  static async bulkNotify(
    packageIds: string[],
    channels: NotificationChannel[],
    message?: string,
  ): Promise<{ sent: number; failed: number }> {
    const response = await api.post('/packages/bulk/notify', {
      packageIds,
      channels,
      message,
    });
    return response.data;
  }

  // Integration APIs
  static async syncWithNovaInventory(packageId: string): Promise<{
    success: boolean;
    assetId?: string;
    message: string;
  }> {
    const response = await api.post(`/packages/${packageId}/sync-inventory`);
    return response.data;
  }

  static async createPulseTicket(
    packageId: string,
    issue: {
      type: 'delivery_issue' | 'damage' | 'lost' | 'other';
      description: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
    },
  ): Promise<{ ticketId: string; ticketUrl: string }> {
    const response = await api.post(`/packages/${packageId}/create-ticket`, issue);
    return response.data;
  }
}
