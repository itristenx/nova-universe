import { apiClient } from './api';
import type {
  Ticket,
  PaginatedResponse,
  SearchFilters,
  SortOption,
  Comment,
  Attachment,
} from '@/types';

export interface CreateTicketData {
  title: string;
  description: string;
  type: string;
  priority: string;
  category?: string;
  subcategory?: string;
  assigneeId?: string;
  assignedGroupId?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
  attachments?: File[];
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  assignedGroupId?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface TicketFilters extends SearchFilters {
  status?: string[];
  priority?: string[];
  type?: string[];
  assignee?: string[];
  requester?: string[];
  category?: string[];
  tags?: string[];
  slaBreached?: boolean;
  overdue?: boolean;
}

export interface BulkUpdateData {
  ticketIds: string[];
  updates: UpdateTicketData;
}

class TicketService {
  /**
   * Get paginated list of tickets with filters
   */
  async getTickets(
    page = 1,
    perPage = 25,
    filters?: TicketFilters,
    sort?: SortOption[],
  ): Promise<PaginatedResponse<Ticket>> {
    const params = {
      page,
      perPage,
      ...filters,
      sort: sort?.map((s) => `${s.field}:${s.direction}`).join(','),
    };

    return await apiClient.getPaginated<Ticket>('/v1/tickets', params);
  }

  /**
   * Get single ticket by ID
   */
  async getTicket(id: string): Promise<Ticket> {
    const response = await apiClient.get<Ticket>(`/v1/tickets/${id}`);
    return response.data!;
  }

  /**
   * Create new ticket
   */
  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const formData = new FormData();

    // Add ticket data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'attachments') return; // Handle separately
      if (value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    // Add attachments
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post<Ticket>('/v1/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data!;
  }

  /**
   * Update existing ticket
   */
  async updateTicket(id: string, data: UpdateTicketData): Promise<Ticket> {
    const response = await apiClient.patch<Ticket>(`/v1/tickets/${id}`, data);
    return response.data!;
  }

  /**
   * Delete ticket
   */
  async deleteTicket(id: string): Promise<void> {
    await apiClient.delete(`/v1/tickets/${id}`);
  }

  /**
   * Bulk update multiple tickets
   */
  async bulkUpdateTickets(data: BulkUpdateData): Promise<{ updated: number; failed: number }> {
    const response = await apiClient.post<{ updated: number; failed: number }>(
      '/v1/tickets/bulk-update',
      data,
    );
    return response.data!;
  }

  /**
   * Bulk delete multiple tickets
   */
  async bulkDeleteTickets(ticketIds: string[]): Promise<{ deleted: number; failed: number }> {
    const response = await apiClient.post<{ deleted: number; failed: number }>(
      '/v1/tickets/bulk-delete',
      {
        ticketIds,
      },
    );
    return response.data!;
  }

  /**
   * Get ticket comments
   */
  async getTicketComments(ticketId: string): Promise<Comment[]> {
    const response = await apiClient.get<Comment[]>(`/v1/tickets/${ticketId}/comments`);
    return response.data!;
  }

  /**
   * Add comment to ticket
   */
  async addComment(
    ticketId: string,
    content: string,
    isInternal = false,
    attachments?: File[],
  ): Promise<Comment> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('isInternal', String(isInternal));

    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post<Comment>(`/v1/tickets/${ticketId}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data!;
  }

  /**
   * Update comment
   */
  async updateComment(ticketId: string, commentId: string, content: string): Promise<Comment> {
    const response = await apiClient.patch<Comment>(
      `/v1/tickets/${ticketId}/comments/${commentId}`,
      {
        content,
      },
    );
    return response.data!;
  }

  /**
   * Delete comment
   */
  async deleteComment(ticketId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/v1/tickets/${ticketId}/comments/${commentId}`);
  }

  /**
   * Assign ticket to user
   */
  async assignTicket(ticketId: string, assigneeId: string): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(`/v1/tickets/${ticketId}/assign`, {
      assigneeId,
    });
    return response.data!;
  }

  /**
   * Assign ticket to group
   */
  async assignToGroup(ticketId: string, groupId: string): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(`/v1/tickets/${ticketId}/assign-group`, {
      groupId,
    });
    return response.data!;
  }

  /**
   * Add watcher to ticket
   */
  async addWatcher(ticketId: string, userId: string): Promise<void> {
    await apiClient.post(`/v1/tickets/${ticketId}/watchers`, { userId });
  }

  /**
   * Remove watcher from ticket
   */
  async removeWatcher(ticketId: string, userId: string): Promise<void> {
    await apiClient.delete(`/v1/tickets/${ticketId}/watchers/${userId}`);
  }

  /**
   * Get ticket attachments
   */
  async getTicketAttachments(ticketId: string): Promise<Attachment[]> {
    const response = await apiClient.get<Attachment[]>(`/v1/tickets/${ticketId}/attachments`);
    return response.data!;
  }

  /**
   * Upload attachment to ticket
   */
  async uploadAttachment(ticketId: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Attachment>(
      `/v1/tickets/${ticketId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data!;
  }

  /**
   * Delete attachment from ticket
   */
  async deleteAttachment(ticketId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/v1/tickets/${ticketId}/attachments/${attachmentId}`);
  }

  /**
   * Get ticket history/activity
   */
  async getTicketHistory(ticketId: string): Promise<
    Array<{
      id: string;
      action: string;
      description: string;
      user: { id: string; name: string };
      createdAt: string;
      changes?: Record<string, { from: unknown; to: unknown }>;
    }>
  > {
    const response = await apiClient.get<
      Array<{
        id: string;
        action: string;
        description: string;
        user: { id: string; name: string };
        createdAt: string;
        changes?: Record<string, { from: unknown; to: unknown }>;
      }>
    >(`/v1/tickets/${ticketId}/history`);
    return response.data!;
  }

  /**
   * Export tickets to various formats
   */
  async exportTickets(format: 'csv' | 'excel' | 'pdf'): Promise<void> {
    await apiClient.downloadFile(`/v1/v1/tickets/export?format=${format}`, `tickets.${format}`);
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats(period = '30d'): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    averageResolutionTime: number;
    slaBreaches: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    trends: Array<{ date: string; count: number }>;
  }> {
    const response = await apiClient.get<{
      total: number;
      open: number;
      inProgress: number;
      resolved: number;
      closed: number;
      averageResolutionTime: number;
      slaBreaches: number;
      byPriority: Record<string, number>;
      byType: Record<string, number>;
      byStatus: Record<string, number>;
      trends: Array<{ date: string; count: number }>;
    }>(`/v1/tickets/stats?period=${period}`);
    return response.data!;
  }

  /**
   * Search tickets with advanced query
   */
  async searchTickets(
    query: string,
    page = 1,
    perPage = 25,
  ): Promise<PaginatedResponse<Ticket & { score: number; highlights: Record<string, string[]> }>> {
    const params = { query, page, perPage };
    return await apiClient.getPaginated<
      Ticket & { score: number; highlights: Record<string, string[]> }
    >('/tickets/search', params);
  }

  /**
   * Get suggested tickets based on content
   */
  async getSuggestedTickets(
    title: string,
    description: string,
    limit = 5,
  ): Promise<Array<Ticket & { similarity: number; reason: string }>> {
    const response = await apiClient.post<Array<Ticket & { similarity: number; reason: string }>>(
      '/tickets/suggestions',
      {
        title,
        description,
        limit,
      },
    );
    return response.data!;
  }

  /**
   * Get ticket templates
   */
  async getTicketTemplates(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      type: string;
      fields: Record<string, unknown>;
    }>
  > {
    const response = await apiClient.get<
      Array<{
        id: string;
        name: string;
        description: string;
        type: string;
        fields: Record<string, unknown>;
      }>
    >('/tickets/templates');
    return response.data!;
  }

  /**
   * Create ticket from template
   */
  async createFromTemplate(
    templateId: string,
    overrides?: Partial<CreateTicketData>,
  ): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(
      `/v1/tickets/templates/${templateId}/create`,
      overrides,
    );
    return response.data!;
  }

  /**
   * Merge tickets
   */
  async mergeTickets(primaryTicketId: string, ticketIds: string[]): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(`/v1/tickets/${primaryTicketId}/merge`, {
      ticketIds,
    });
    return response.data!;
  }

  /**
   * Link tickets
   */
  async linkTickets(
    ticketId: string,
    relatedTicketId: string,
    relationship: 'blocks' | 'is_blocked_by' | 'duplicates' | 'is_duplicated_by' | 'relates_to',
  ): Promise<void> {
    await apiClient.post(`/v1/tickets/${ticketId}/links`, {
      relatedTicketId,
      relationship,
    });
  }

  /**
   * Remove ticket link
   */
  async unlinkTickets(ticketId: string, linkId: string): Promise<void> {
    await apiClient.delete(`/v1/tickets/${ticketId}/links/${linkId}`);
  }
}

export const ticketService = new TicketService();
