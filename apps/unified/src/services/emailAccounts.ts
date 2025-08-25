/**
 * Email Accounts Service
 * Handles all email account related API operations
 */

import { api } from './api';

export interface EmailAccount {
  id: number;
  queue: string;
  address: string;
  displayName: string;
  enabled: boolean;
  graphImpersonation: boolean;
  autoCreateTickets: boolean;
  webhookMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailAccountForm {
  queue: string;
  address: string;
  displayName: string;
  enabled: boolean;
  graphImpersonation: boolean;
  autoCreateTickets: boolean;
  webhookMode: boolean;
}

export class EmailAccountsService {
  static async getAll(): Promise<EmailAccount[]> {
    const response = await api.get<EmailAccount[]>('/admin/email-accounts');
    return response.data || [];
  }

  static async getById(id: number): Promise<EmailAccount> {
    const response = await api.get<EmailAccount>(`/admin/email-accounts/${id}`);
    if (!response.data) {
      throw new Error('Email account not found');
    }
    return response.data;
  }

  static async create(data: EmailAccountForm): Promise<EmailAccount> {
    const response = await api.post<EmailAccount>('/admin/email-accounts', data);
    if (!response.data) {
      throw new Error('Failed to create email account');
    }
    return response.data;
  }

  static async update(id: number, data: EmailAccountForm): Promise<EmailAccount> {
    const response = await api.put<EmailAccount>(`/admin/email-accounts/${id}`, data);
    if (!response.data) {
      throw new Error('Failed to update email account');
    }
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/admin/email-accounts/${id}`);
  }

  static async testConnection(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      `/admin/email-accounts/${id}/test`,
    );
    if (!response.data) {
      throw new Error('Failed to test email account connection');
    }
    return response.data;
  }
}
