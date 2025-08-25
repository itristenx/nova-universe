import { create } from 'zustand';
import {
  ticketService,
  type TicketFilters,
  type CreateTicketData,
  type UpdateTicketData,
} from '@services/tickets';
import type { Ticket, PaginatedResponse, SortOption } from '@/types';

interface TicketState {
  // State
  tickets: Ticket[];
  selectedTickets: string[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  filters: TicketFilters;
  sort: SortOption[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
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
  } | null;

  // Actions
  loadTickets: (page?: number) => Promise<void>;
  loadTicket: (id: string) => Promise<void>;
  createTicket: (data: CreateTicketData) => Promise<Ticket>;
  updateTicket: (id: string, data: UpdateTicketData) => Promise<Ticket>;
  deleteTicket: (id: string) => Promise<void>;
  bulkUpdateTickets: (ticketIds: string[], updates: UpdateTicketData) => Promise<void>;
  bulkDeleteTickets: (ticketIds: string[]) => Promise<void>;
  setFilters: (filters: Partial<TicketFilters>) => void;
  setSortOrder: (sort: SortOption[]) => void;
  setSelectedTickets: (ticketIds: string[]) => void;
  addSelectedTicket: (ticketId: string) => void;
  removeSelectedTicket: (ticketId: string) => void;
  clearSelectedTickets: () => void;
  loadStats: (period?: string) => Promise<void>;
  searchTickets: (query: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  refreshTickets: () => Promise<void>;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  // Initial state
  tickets: [],
  selectedTickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,
  filters: {},
  sort: [{ field: 'createdAt', direction: 'desc' }],
  pagination: {
    page: 1,
    perPage: 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  stats: null,

  // Load tickets with pagination and filters
  loadTickets: async (page?: number) => {
    const state = get();
    const currentPage = page ?? state.pagination.page;

    set({ isLoading: true, error: null });

    try {
      const response: PaginatedResponse<Ticket> = await ticketService.getTickets(
        currentPage,
        state.pagination.perPage,
        state.filters,
        state.sort,
      );

      set({
        tickets: response.data,
        pagination: {
          page: response.meta.page,
          perPage: response.meta.perPage,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNext: response.meta.hasNext,
          hasPrev: response.meta.hasPrev,
        },
        isLoading: false,
        error: null,
      });
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load tickets',
      });
    }
  },

  // Load single ticket
  loadTicket: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const ticket = await ticketService.getTicket(id);
      set({
        currentTicket: ticket,
        isLoading: false,
        error: null,
      });
    } catch (_error) {
      set({
        currentTicket: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load ticket',
      });
    }
  },

  // Create new ticket
  createTicket: async (data: CreateTicketData) => {
    set({ isLoading: true, error: null });

    try {
      const ticket = await ticketService.createTicket(data);

      // Add new ticket to the beginning of the list
      set((state) => ({
        tickets: [ticket, ...state.tickets],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
        isLoading: false,
        error: null,
      }));

      return ticket;
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create ticket',
      });
      throw error;
    }
  },

  // Update ticket
  updateTicket: async (id: string, data: UpdateTicketData) => {
    set({ isLoading: true, error: null });

    try {
      const updatedTicket = await ticketService.updateTicket(id, data);

      set((state) => ({
        tickets: state.tickets.map((ticket) => (ticket.id === id ? updatedTicket : ticket)),
        currentTicket: state.currentTicket?.id === id ? updatedTicket : state.currentTicket,
        isLoading: false,
        error: null,
      }));

      return updatedTicket;
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update ticket',
      });
      throw error;
    }
  },

  // Delete ticket
  deleteTicket: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await ticketService.deleteTicket(id);

      set((state) => ({
        tickets: state.tickets.filter((ticket) => ticket.id !== id),
        selectedTickets: state.selectedTickets.filter((ticketId) => ticketId !== id),
        currentTicket: state.currentTicket?.id === id ? null : state.currentTicket,
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1,
        },
        isLoading: false,
        error: null,
      }));
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete ticket',
      });
      throw error;
    }
  },

  // Bulk update tickets
  bulkUpdateTickets: async (ticketIds: string[], updates: UpdateTicketData) => {
    set({ isLoading: true, error: null });

    try {
      await ticketService.bulkUpdateTickets({ ticketIds, updates });

      // Refresh tickets to get updated data
      await get().loadTickets();

      set({
        selectedTickets: [],
        isLoading: false,
        error: null,
      });
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update tickets',
      });
      throw error;
    }
  },

  // Bulk delete tickets
  bulkDeleteTickets: async (ticketIds: string[]) => {
    set({ isLoading: true, error: null });

    try {
      await ticketService.bulkDeleteTickets(ticketIds);

      set((state) => ({
        tickets: state.tickets.filter((ticket) => !ticketIds.includes(ticket.id)),
        selectedTickets: [],
        pagination: {
          ...state.pagination,
          total: state.pagination.total - ticketIds.length,
        },
        isLoading: false,
        error: null,
      }));
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete tickets',
      });
      throw error;
    }
  },

  // Set filters and reload tickets
  setFilters: (filters: Partial<TicketFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }, // Reset to first page
    }));

    // Reload tickets with new filters
    get().loadTickets(1);
  },

  // Set sort order and reload tickets
  setSortOrder: (sort: SortOption[]) => {
    set({ sort });
    get().loadTickets();
  },

  // Selection management
  setSelectedTickets: (ticketIds: string[]) => {
    set({ selectedTickets: ticketIds });
  },

  addSelectedTicket: (ticketId: string) => {
    set((state) => ({
      selectedTickets: [...state.selectedTickets, ticketId],
    }));
  },

  removeSelectedTicket: (ticketId: string) => {
    set((state) => ({
      selectedTickets: state.selectedTickets.filter((id) => id !== ticketId),
    }));
  },

  clearSelectedTickets: () => {
    set({ selectedTickets: [] });
  },

  // Load ticket statistics
  loadStats: async (period = '30d') => {
    try {
      const stats = await ticketService.getTicketStats(period);
      set({ stats });
    } catch (_error) {
      console.error('Failed to load ticket stats:', error);
    }
  },

  // Search tickets
  searchTickets: async (query: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await ticketService.searchTickets(query);
      set({
        tickets: response.data,
        pagination: {
          page: response.meta.page,
          perPage: response.meta.perPage,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNext: response.meta.hasNext,
          hasPrev: response.meta.hasPrev,
        },
        isLoading: false,
        error: null,
      });
    } catch (_error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to search tickets',
      });
    }
  },

  // Refresh current tickets
  refreshTickets: async () => {
    await get().loadTickets();
  },

  // Utility actions
  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
