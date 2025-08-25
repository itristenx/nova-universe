import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '../../stores/dashboard';
import { DraggableWidget } from './DraggableWidget';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { cn } from '../../utils';

// React 19 compatible custom icons
const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const Square3Stack3DIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
    />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
);

interface DashboardGridProps {
  layoutId?: string;
  isReadOnly?: boolean;
  className?: string;
}

export function DashboardGrid({ layoutId, isReadOnly = false, className }: DashboardGridProps) {
  const {
    currentLayout,
    widgets,
    isLoading,
    error,
    isEditMode,
    selectedWidget,
    loadDashboardLayout,
    loadLayouts,
    loadTemplates,
    loadStats,
    createWidget,
    deleteWidget,
    refreshWidget,
    enterEditMode,
    exitEditMode,
    selectWidget,
    clearError,
  } = useDashboardStore();

  // Load dashboard data on mount
  useEffect(() => {
    if (layoutId) {
      loadDashboardLayout(layoutId);
    }
    loadLayouts();
    loadTemplates();
    loadStats();
  }, [layoutId, loadDashboardLayout, loadLayouts, loadTemplates, loadStats]);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, clearError]);

  const handleAddWidget = useCallback(() => {
    const newWidget = {
      type: 'metric' as const,
      title: 'New Widget',
      description: 'Configure this widget',
      position: {
        x: 0,
        y: 0,
        width: 2,
        height: 2,
      },
      config: {
        metric: {
          value: 0,
          unit: '',
          trend: 'stable' as const,
          color: 'blue' as const,
        },
      },
    };
    createWidget(newWidget);
  }, [createWidget]);

  const handleWidgetSelect = useCallback(
    (widget: any) => {
      selectWidget(widget);
    },
    [selectWidget],
  );

  const handleWidgetDelete = useCallback(
    (id: string) => {
      deleteWidget(id);
    },
    [deleteWidget],
  );

  const handleWidgetRefresh = useCallback(
    (id: string) => {
      refreshWidget(id);
    },
    [refreshWidget],
  );

  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      exitEditMode();
    } else {
      enterEditMode();
    }
  }, [isEditMode, enterEditMode, exitEditMode]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={cn('h-full', className)}>
      {/* Dashboard Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentLayout?.name || 'Dashboard'}
          </h1>
          {currentLayout?.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {currentLayout.description}
            </p>
          )}
        </div>

        {!isReadOnly && (
          <div className="flex items-center space-x-3">
            {/* Edit Mode Toggle */}
            <button
              onClick={toggleEditMode}
              className={cn(
                'inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm leading-4 font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
                isEditMode
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
              )}
            >
              {isEditMode ? (
                <>
                  <EyeIcon className="mr-2 h-4 w-4" />
                  View Mode
                </>
              ) : (
                <>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit Mode
                </>
              )}
            </button>

            {/* Add Widget Button */}
            {isEditMode && (
              <button
                onClick={handleAddWidget}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Widget
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Square3Stack3DIcon className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No widgets yet</h3>
          <p className="mb-4 max-w-sm text-gray-600 dark:text-gray-400">
            Get started by adding widgets to your dashboard. Choose from metrics, charts, tables,
            and more.
          </p>
          {!isReadOnly && (
            <button
              onClick={handleAddWidget}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Widget
            </button>
          )}
        </div>
      )}

      {/* Widget Grid */}
      {widgets.length > 0 && (
        <div
          className={cn(
            'grid auto-rows-[200px] gap-4',
            currentLayout?.columns === 12
              ? 'grid-cols-12'
              : currentLayout?.columns === 8
                ? 'grid-cols-8'
                : currentLayout?.columns === 6
                  ? 'grid-cols-6'
                  : 'grid-cols-4',
          )}
        >
          {widgets.map((widget) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              isEditMode={isEditMode}
              isSelected={selectedWidget?.id === widget.id}
              onSelect={handleWidgetSelect}
              onDelete={handleWidgetDelete}
              onRefresh={handleWidgetRefresh}
            />
          ))}
        </div>
      )}

      {/* Edit Mode Instructions */}
      {isEditMode && widgets.length > 0 && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Edit Mode Active:</strong> Click widgets to select them, use the menu button to
            access widget options, or drag widgets to rearrange them. Click "View Mode" when you're
            done editing.
          </p>
        </div>
      )}
    </div>
  );
}
