/**
 * Kiosk Management Service
 * Handles all kiosk related API operations
 */

import { api } from './api';

export interface Kiosk {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  active: boolean;
  lastSeen: string;
  version: string;
  todayTickets: number;
  totalTickets: number;
  uptime: string;
  health: number;
  assetTag: string;
  serialNumber: string;
  ipAddress: string;
}

export interface KioskActivation {
  id: string;
  code: string;
  qrCode?: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
}

export interface NewKioskData {
  name: string;
  location: string;
  assetTag: string;
  serialNumber: string;
}

export type GlobalStatus = 'enabled' | 'disabled' | 'maintenance';

export class KioskService {
  static async getAll(): Promise<Kiosk[]> {
    const response = await api.get<Kiosk[]>('/admin/kiosks');
    return response.data || [];
  }

  static async getById(id: string): Promise<Kiosk> {
    const response = await api.get<Kiosk>(`/admin/kiosks/${id}`);
    if (!response.data) {
      throw new Error('Kiosk not found');
    }
    return response.data;
  }

  static async updateStatus(id: string, active: boolean): Promise<Kiosk> {
    const response = await api.patch<Kiosk>(`/admin/kiosks/${id}/status`, { active });
    if (!response.data) {
      throw new Error('Failed to update kiosk status');
    }
    return response.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/admin/kiosks/${id}`);
  }

  static async getGlobalStatus(): Promise<GlobalStatus> {
    const response = await api.get<{ status: GlobalStatus }>('/admin/kiosks/global-status');
    return response.data?.status || 'enabled';
  }

  static async updateGlobalStatus(status: GlobalStatus): Promise<void> {
    await api.put('/admin/kiosks/global-status', { status });
  }

  static async getActivations(): Promise<KioskActivation[]> {
    const response = await api.get<KioskActivation[]>('/admin/kiosks/activations');
    return response.data || [];
  }

  static async generateActivationCode(kioskData: NewKioskData): Promise<KioskActivation> {
    const response = await api.post<KioskActivation>('/admin/kiosks/activations', kioskData);
    if (!response.data) {
      throw new Error('Failed to generate activation code');
    }
    return response.data;
  }

  static async revokeActivation(id: string): Promise<void> {
    await api.delete(`/admin/kiosks/activations/${id}`);
  }

  static async getKioskConfiguration(id: string): Promise<any> {
    const response = await api.get(`/admin/kiosks/${id}/configuration`);
    return response.data;
  }

  static async updateKioskConfiguration(id: string, config: any): Promise<void> {
    await api.put(`/admin/kiosks/${id}/configuration`, config);
  }
}
