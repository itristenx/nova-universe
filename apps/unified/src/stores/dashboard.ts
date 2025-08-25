import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Widget,
  DashboardLayout,
  DashboardTemplate,
  DashboardStats,
  RealTimeEvent,
  CollaborationEvent,
  UserPresence,
} from '../types/dashboard';
import { widgetService } from '../services/widgets';
import toast from 'react-hot-toast';

interface DashboardState {
  // Current dashboard state
  currentLayout: DashboardLayout | null;
  widgets: Widget[];
  isLoading: boolean;
  error: string | null;

  // Available layouts and templates
  layouts: DashboardLayout[];
  templates: DashboardTemplate[];
  stats: DashboardStats | null;

  // Real-time features
  realTimeEvents: RealTimeEvent[];
  collaborationEvents: CollaborationEvent[];
  presenceUsers: UserPresence[];
  isCollaborationActive: boolean;

  // Widget editing state
  isEditMode: boolean;
  selectedWidget: Widget | null;
  isDragging: boolean;
  draggedWidget: Widget | null;

  // Actions
  loadDashboardLayout: (id: string) => Promise<void>;
  loadLayouts: (userId?: string) => Promise<void>;
  loadTemplates: (category?: string) => Promise<void>;
  loadStats: (filters?: any) => Promise<void>;

  createWidget: (widget: Omit<Widget, 'id' | 'lastUpdated'>) => Promise<void>;
  updateWidget: (id: string, updates: Partial<Widget>) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
  refreshWidget: (id: string) => Promise<void>;
  moveWidget: (
    id: string,
    position: { x: number; y: number; width: number; height: number },
  ) => Promise<void>;

  saveDashboardLayout: (
    layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<void>;
  updateDashboardLayout: (id: string, updates: Partial<DashboardLayout>) => Promise<void>;
  deleteDashboardLayout: (id: string) => Promise<void>;
  duplicateDashboardLayout: (id: string, name: string) => Promise<void>;

  createFromTemplate: (templateId: string, name: string) => Promise<void>;

  // Edit mode
  enterEditMode: () => void;
  exitEditMode: () => void;
  selectWidget: (widget: Widget | null) => void;

  // Drag and drop
  startDragging: (widget: Widget) => void;
  stopDragging: () => void;

  // Real-time collaboration
  startCollaboration: (resourceType: string, resourceId: string) => Promise<void>;
  stopCollaboration: (resourceType: string, resourceId: string) => Promise<void>;
  sendCollaborationEvent: (
    event: Omit<CollaborationEvent, 'id' | 'timestamp' | 'userId' | 'userName' | 'userAvatar'>,
  ) => Promise<void>;

  // Utility actions
  clearError: () => void;
  addRealTimeEvent: (event: RealTimeEvent) => void;
  addCollaborationEvent: (event: CollaborationEvent) => void;
  updatePresence: (users: UserPresence[]) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentLayout: null,
      widgets: [],
      isLoading: false,
      error: null,
      layouts: [],
      templates: [],
      stats: null,
      realTimeEvents: [],
      collaborationEvents: [],
      presenceUsers: [],
      isCollaborationActive: false,
      isEditMode: false,
      selectedWidget: null,
      isDragging: false,
      draggedWidget: null,

      // Load dashboard layout
      loadDashboardLayout: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const layout = await widgetService.getDashboardLayout(id);
          set({
            currentLayout: layout,
            widgets: layout.widgets,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Failed to load dashboard layout',
            isLoading: false,
          });
          toast.error('Failed to load dashboard layout');
        }
      },

      // Load layouts
      loadLayouts: async (userId?: string) => {
        try {
          const layouts = await widgetService.getDashboardLayouts(userId);
          set({ layouts });
        } catch (error: any) {
          set({ error: error.message || 'Failed to load layouts' });
          toast.error('Failed to load dashboard layouts');
        }
      },

      // Load templates
      loadTemplates: async (category?: string) => {
        try {
          const templates = await widgetService.getDashboardTemplates(category);
          set({ templates });
        } catch (error: any) {
          set({ error: error.message || 'Failed to load templates' });
          toast.error('Failed to load dashboard templates');
        }
      },

      // Load stats
      loadStats: async (filters?: any) => {
        try {
          const stats = await widgetService.getDashboardStats(filters);
          set({ stats });
        } catch (error: any) {
          set({ error: error.message || 'Failed to load stats' });
          toast.error('Failed to load dashboard statistics');
        }
      },

      // Create widget
      createWidget: async (widget: Omit<Widget, 'id' | 'lastUpdated'>) => {
        try {
          const newWidget = await widgetService.createWidget(widget);
          const { widgets, currentLayout } = get();
          const updatedWidgets = [...widgets, newWidget];

          set({ widgets: updatedWidgets });

          // Update current layout if it exists
          if (currentLayout) {
            await get().updateDashboardLayout(currentLayout.id, {
              widgets: updatedWidgets,
            });
          }

          toast.success('Widget created successfully');
        } catch (error: any) {
          set({ error: error.message || 'Failed to create widget' });
          toast.error('Failed to create widget');
        }
      },

      // Update widget
      updateWidget: async (id: string, updates: Partial<Widget>) => {
        try {
          const updatedWidget = await widgetService.updateWidget(id, updates);
          const { widgets, currentLayout } = get();
          const updatedWidgets = widgets.map((w) => (w.id === id ? updatedWidget : w));

          set({ widgets: updatedWidgets });

          // Update current layout if it exists
          if (currentLayout) {
            await get().updateDashboardLayout(currentLayout.id, {
              widgets: updatedWidgets,
            });
          }

          toast.success('Widget updated successfully');
        } catch (error: any) {
          set({ error: error.message || 'Failed to update widget' });
          toast.error('Failed to update widget');
        }
      },

      // Delete widget
      deleteWidget: async (id: string) => {
        try {
          await widgetService.deleteWidget(id);
          const { widgets, currentLayout } = get();
          const updatedWidgets = widgets.filter((w) => w.id !== id);

          set({ widgets: updatedWidgets, selectedWidget: null });

          // Update current layout if it exists
          if (currentLayout) {
            await get().updateDashboardLayout(currentLayout.id, {
              widgets: updatedWidgets,
            });
          }

          toast.success('Widget deleted successfully');
        } catch (error: any) {
          set({ error: error.message || 'Failed to delete widget' });
          toast.error('Failed to delete widget');
        }
      },

      // Refresh widget
      refreshWidget: async (id: string) => {
        try {
          const refreshedWidget = await widgetService.refreshWidget(id);
          const { widgets } = get();
          const updatedWidgets = widgets.map((w) => (w.id === id ? refreshedWidget : w));
          set({ widgets: updatedWidgets });
        } catch (error: any) {
          set({ error: error.message || 'Failed to refresh widget' });
          toast.error('Failed to refresh widget');
        }
      },

      // Move widget
      moveWidget: async (
        id: string,
        position: { x: number; y: number; width: number; height: number },
      ) => {
        const { widgets } = get();
        const updatedWidgets = widgets.map((w) => (w.id === id ? { ...w, position } : w));
        set({ widgets: updatedWidgets });

        // Save to backend
        try {
          await get().updateWidget(id, { position });
        } catch (error: any) {
          // Revert on error
          set({ widgets });
          toast.error('Failed to save widget position');
        }
      },

      // Save dashboard layout
      saveDashboardLayout: async (
        layout: Omit<DashboardLayout, 'id' | 'createdAt' | 'updatedAt'>,
      ) => {
        try {
          const newLayout = await widgetService.createDashboardLayout(layout);
          const { layouts } = get();
          set({
            layouts: [...layouts, newLayout],
            currentLayout: newLayout,
          });
          toast.success('Dashboard layout saved successfully');
        } catch (error: any) {
          set({ error: error.message || 'Failed to save dashboard layout' });
          toast.error('Failed to save dashboard layout');
        }
      },

      // Update dashboard layout
      updateDashboardLayout: async (id: string, updates: Partial<DashboardLayout>) => {
        try {
          const updatedLayout = await widgetService.updateDashboardLayout(id, updates);
          const { layouts, currentLayout } = get();
          const updatedLayouts = layouts.map((l) => (l.id === id ? updatedLayout : l));

          set({
            layouts: updatedLayouts,
            currentLayout: currentLayout?.id === id ? updatedLayout : currentLayout,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to update dashboard layout' });
          toast.error('Failed to update dashboard layout');
        }
      },

      // Delete dashboard layout
      deleteDashboardLayout: async (id: string) => {
        try {
          await widgetService.deleteDashboardLayout(id);
          const { layouts, currentLayout } = get();
          const updatedLayouts = layouts.filter((l) => l.id !== id);

          set({
            layouts: updatedLayouts,
            currentLayout: currentLayout?.id === id ? null : currentLayout,
            widgets: currentLayout?.id === id ? [] : get().widgets,
          });

          toast.success('Dashboard layout deleted successfully');
        } catch (error: any) {
          set({ error: error.message || 'Failed to delete dashboard layout' });
          toast.error('Failed to delete dashboard layout');
        }
      },

      // Duplicate dashboard layout
      duplicateDashboardLayout: async (id: string, name: string) => {
        try {
          const newLayout = await widgetService.duplicateDashboardLayout(id, name);
          const { layouts } = get();
          set({ layouts: [...layouts, newLayout] });
          toast.success('Dashboard layout duplicated successfully');
        } catch (error: any) {
          set({ error: error.message || 'Failed to duplicate dashboard layout' });
          toast.error('Failed to duplicate dashboard layout');
        }
      },

      // Create from template
      createFromTemplate: async (templateId: string, name: string) => {
        try {
          const newLayout = await widgetService.createDashboardFromTemplate(templateId, name);
          const { layouts } = get();
          set({
            layouts: [...layouts, newLayout],
            currentLayout: newLayout,
            widgets: newLayout.widgets,
          });
          toast.success('Dashboard created from template successfully');
        } catch (error: any) {
          set({ error: error.message || 'Failed to create dashboard from template' });
          toast.error('Failed to create dashboard from template');
        }
      },

      // Edit mode
      enterEditMode: () => set({ isEditMode: true }),
      exitEditMode: () => set({ isEditMode: false, selectedWidget: null }),
      selectWidget: (widget: Widget | null) => set({ selectedWidget: widget }),

      // Drag and drop
      startDragging: (widget: Widget) => set({ isDragging: true, draggedWidget: widget }),
      stopDragging: () => set({ isDragging: false, draggedWidget: null }),

      // Real-time collaboration
      startCollaboration: async (resourceType: string, resourceId: string) => {
        try {
          await widgetService.joinCollaboration(resourceType, resourceId);
          set({ isCollaborationActive: true });

          // Subscribe to events
          widgetService.subscribeToEvents(resourceType, resourceId);

          // Setup event handlers
          widgetService.onEvent('widget_updated', (event) => {
            get().addRealTimeEvent(event);
          });

          widgetService.onCollaborationEvent((event) => {
            get().addCollaborationEvent(event);
          });

          widgetService.onPresenceUpdate((users) => {
            get().updatePresence(users);
          });
        } catch (error: any) {
          toast.error('Failed to start collaboration');
        }
      },

      stopCollaboration: async (resourceType: string, resourceId: string) => {
        try {
          await widgetService.leaveCollaboration(resourceType, resourceId);
          widgetService.unsubscribeFromEvents();
          set({
            isCollaborationActive: false,
            collaborationEvents: [],
            presenceUsers: [],
          });
        } catch (error: any) {
          toast.error('Failed to stop collaboration');
        }
      },

      sendCollaborationEvent: async (
        event: Omit<CollaborationEvent, 'id' | 'timestamp' | 'userId' | 'userName' | 'userAvatar'>,
      ) => {
        try {
          await widgetService.sendCollaborationEvent(event);
        } catch (error: any) {
          console.error('Failed to send collaboration event:', error);
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),

      addRealTimeEvent: (event: RealTimeEvent) => {
        const { realTimeEvents } = get();
        set({
          realTimeEvents: [event, ...realTimeEvents].slice(0, 100), // Keep last 100 events
        });
      },

      addCollaborationEvent: (event: CollaborationEvent) => {
        const { collaborationEvents } = get();
        set({
          collaborationEvents: [event, ...collaborationEvents].slice(0, 50), // Keep last 50 events
        });
      },

      updatePresence: (users: UserPresence[]) => {
        set({ presenceUsers: users });
      },
    }),
    { name: 'dashboard-store' },
  ),
);
