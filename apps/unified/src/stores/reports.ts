import { create } from 'zustand';
import { reportsService } from '@services/reports';
import type {
  ReportFilters,
  OverviewMetrics,
  TicketMetrics,
  AssetMetrics,
  UserMetrics,
  SpaceMetrics,
  TicketTrendData,
  AssetReportData,
  UserReportData,
  SpaceReportData,
} from '@services/reports';
import toast from 'react-hot-toast';

interface ReportsState {
  // Current filters
  filters: ReportFilters;
  selectedReport: 'overview' | 'tickets' | 'assets' | 'users' | 'spaces';

  // Loading states
  isLoading: boolean;
  isExporting: boolean;

  // Data
  overviewMetrics: OverviewMetrics | null;
  ticketMetrics: TicketMetrics | null;
  assetMetrics: AssetMetrics | null;
  userMetrics: UserMetrics | null;
  spaceMetrics: SpaceMetrics | null;

  // Chart data
  ticketTrends: TicketTrendData | null;
  assetReportData: AssetReportData | null;
  userReportData: UserReportData | null;
  spaceReportData: SpaceReportData | null;

  // Error state
  error: string | null;

  // Actions
  setFilters: (filters: Partial<ReportFilters>) => void;
  setSelectedReport: (report: 'overview' | 'tickets' | 'assets' | 'users' | 'spaces') => void;

  // Data loading
  loadOverviewData: () => Promise<void>;
  loadTicketData: () => Promise<void>;
  loadAssetData: () => Promise<void>;
  loadUserData: () => Promise<void>;
  loadSpaceData: () => Promise<void>;
  loadAllReportData: () => Promise<void>;

  // Export functions
  exportReport: (format: 'pdf' | 'excel' | 'csv') => Promise<void>;

  // Utility functions
  clearError: () => void;
  clearData: () => void;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  // Initial state
  filters: {
    period: '7d',
  },
  selectedReport: 'overview',
  isLoading: false,
  isExporting: false,
  overviewMetrics: null,
  ticketMetrics: null,
  assetMetrics: null,
  userMetrics: null,
  spaceMetrics: null,
  ticketTrends: null,
  assetReportData: null,
  userReportData: null,
  spaceReportData: null,
  error: null,

  // Actions
  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters });

    // Auto-reload data when filters change
    setTimeout(() => {
      get().loadAllReportData();
    }, 100);
  },

  setSelectedReport: (report) => {
    set({ selectedReport: report });

    // Load specific report data
    setTimeout(() => {
      const { loadOverviewData, loadTicketData, loadAssetData, loadUserData, loadSpaceData } =
        get();
      switch (report) {
        case 'overview':
          loadOverviewData();
          break;
        case 'tickets':
          loadTicketData();
          break;
        case 'assets':
          loadAssetData();
          break;
        case 'users':
          loadUserData();
          break;
        case 'spaces':
          loadSpaceData();
          break;
      }
    }, 100);
  },

  // Data loading functions
  loadOverviewData: async () => {
    try {
      set({ isLoading: true, error: null });
      const { filters } = get();

      const overviewMetrics = await reportsService.getOverviewMetrics(filters);

      set({
        overviewMetrics,
        isLoading: false,
      });
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load overview data';
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  loadTicketData: async () => {
    try {
      set({ isLoading: true, error: null });
      const { filters } = get();

      const [ticketMetrics, ticketTrends] = await Promise.all([
        reportsService.getTicketMetrics(filters),
        reportsService.getTicketTrends(filters),
      ]);

      set({
        ticketMetrics,
        ticketTrends,
        isLoading: false,
      });
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load ticket data';
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  loadAssetData: async () => {
    try {
      set({ isLoading: true, error: null });
      const { filters } = get();

      const [assetMetrics, assetReportData] = await Promise.all([
        reportsService.getAssetMetrics(filters),
        reportsService.getAssetReportData(filters),
      ]);

      set({
        assetMetrics,
        assetReportData,
        isLoading: false,
      });
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load asset data';
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  loadUserData: async () => {
    try {
      set({ isLoading: true, error: null });
      const { filters } = get();

      const [userMetrics, userReportData] = await Promise.all([
        reportsService.getUserMetrics(filters),
        reportsService.getUserReportData(filters),
      ]);

      set({
        userMetrics,
        userReportData,
        isLoading: false,
      });
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load user data';
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  loadSpaceData: async () => {
    try {
      set({ isLoading: true, error: null });
      const { filters } = get();

      const [spaceMetrics, spaceReportData] = await Promise.all([
        reportsService.getSpaceMetrics(filters),
        reportsService.getSpaceReportData(filters),
      ]);

      set({
        spaceMetrics,
        spaceReportData,
        isLoading: false,
      });
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load space data';
      set({
        error: errorMessage,
        isLoading: false,
      });
      toast.error(errorMessage);
    }
  },

  loadAllReportData: async () => {
    const { selectedReport } = get();

    switch (selectedReport) {
      case 'overview':
        return get().loadOverviewData();
      case 'tickets':
        return get().loadTicketData();
      case 'assets':
        return get().loadAssetData();
      case 'users':
        return get().loadUserData();
      case 'spaces':
        return get().loadSpaceData();
    }
  },

  // Export function
  exportReport: async (format) => {
    try {
      set({ isExporting: true, error: null });
      const { selectedReport, filters } = get();

      const blob = await reportsService.exportReport(selectedReport, format, filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      set({ isExporting: false });
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export report';
      set({
        error: errorMessage,
        isExporting: false,
      });
      toast.error(errorMessage);
    }
  },

  // Utility functions
  clearError: () => set({ error: null }),

  clearData: () =>
    set({
      overviewMetrics: null,
      ticketMetrics: null,
      assetMetrics: null,
      userMetrics: null,
      spaceMetrics: null,
      ticketTrends: null,
      assetReportData: null,
      userReportData: null,
      spaceReportData: null,
      error: null,
    }),
}));
