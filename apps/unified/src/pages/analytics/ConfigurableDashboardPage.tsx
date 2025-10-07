import React, { useState } from 'react';
import {
  Plus,
  Save,
  Share2,
  Settings,
  Trash2,
  GripVertical,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Ticket,
  AlertCircle,
  Move,
} from 'lucide-react';
import {
  Modal,
  ModalButton,
  Dropdown,
  DropdownButton,
  useDynamicIsland,
  type DropdownItem,
} from '@components/design-system';

interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'timeline' | 'gauge';
  title: string;
  config: Record<string, unknown>;
  data?: unknown;
}

interface DashboardWidget extends Widget {
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Configurable Dashboard Builder
 * Drag-and-drop dashboard with customizable widgets
 */
export const ConfigurableDashboardPage: React.FC = () => {
  const [dashboard, setDashboard] = useState<Dashboard>({
    id: 'default',
    name: 'My Dashboard',
    description: 'Customizable analytics dashboard',
    widgets: [
      {
        id: 'metric-1',
        type: 'metric',
        title: 'Total Tickets',
        config: { value: '1,234', trend: 'up', trendValue: '+12%' },
        layout: { x: 0, y: 0, w: 3, h: 2 },
      },
      {
        id: 'metric-2',
        type: 'metric',
        title: 'Open Tickets',
        config: { value: '234', trend: 'down', trendValue: '-5%' },
        layout: { x: 3, y: 0, w: 3, h: 2 },
      },
      {
        id: 'chart-1',
        type: 'chart',
        title: 'Ticket Trends',
        config: { chartType: 'line' },
        layout: { x: 0, y: 2, w: 6, h: 4 },
      },
      {
        id: 'list-1',
        type: 'list',
        title: 'Recent Tickets',
        config: { limit: 5 },
        layout: { x: 6, y: 0, w: 6, h: 6 },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const dynamicIsland = useDynamicIsland();

  // Add widget
  const addWidget = (type: Widget['type']) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: `New ${type}`,
      config: {},
      layout: {
        x: 0,
        y: Infinity, // Put at bottom
        w: type === 'metric' ? 3 : 6,
        h: type === 'metric' ? 2 : 4,
      },
    };

    setDashboard((prev) => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      updatedAt: new Date().toISOString(),
    }));

    setShowWidgetPicker(false);
    dynamicIsland.success('Added', `${type} widget added`);
  };

  // Remove widget
  const removeWidget = (widgetId: string) => {
    setDashboard((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== widgetId),
      updatedAt: new Date().toISOString(),
    }));
    dynamicIsland.success('Removed', 'Widget removed');
  };

  // Save dashboard
  const handleSave = async () => {
    dynamicIsland.loading('Saving', 'Saving dashboard...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      dynamicIsland.success('Saved', 'Dashboard saved successfully');
      setShowSaveModal(false);
      setIsEditing(false);
    } catch (error) {
      dynamicIsland.error('Error', 'Failed to save dashboard');
    }
  };

  // Widget picker items
  const widgetTypes: Array<{
    type: Widget['type'];
    icon: React.ReactNode;
    label: string;
    description: string;
  }> = [
    {
      type: 'metric',
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Metric Card',
      description: 'Display a single metric with trend',
    },
    {
      type: 'chart',
      icon: <LineChart className="w-6 h-6" />,
      label: 'Chart',
      description: 'Line, bar, or pie chart',
    },
    {
      type: 'list',
      icon: <Ticket className="w-6 h-6" />,
      label: 'List',
      description: 'List of items',
    },
    {
      type: 'timeline',
      icon: <AlertCircle className="w-6 h-6" />,
      label: 'Timeline',
      description: 'Activity timeline',
    },
    {
      type: 'gauge',
      icon: <BarChart3 className="w-6 h-6" />,
      label: 'Gauge',
      description: 'Circular gauge indicator',
    },
  ];

  // Render widget
  const renderWidget = (widget: DashboardWidget) => {
    return (
      <div className="glass rounded-apple-lg p-4 h-full flex flex-col">
        {/* Widget Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isEditing && (
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            )}
            <h3 className="text-sm font-sf-display font-semibold text-gray-900 dark:text-white">
              {widget.title}
            </h3>
          </div>
          {isEditing && (
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
              type="button"
              aria-label="Remove widget"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          )}
        </div>

        {/* Widget Content */}
        <div className="flex-1 flex items-center justify-center">
          {widget.type === 'metric' && (
            <div className="text-center">
              <div className="text-4xl font-sf-display font-bold text-gray-900 dark:text-white mb-2">
                {(widget.config.value as string) || '0'}
              </div>
              <div className="text-sm font-sf-text text-success-600 dark:text-success-400">
                {(widget.config.trendValue as string) || '0%'}
              </div>
            </div>
          )}

          {widget.type === 'chart' && (
            <div className="w-full h-full flex items-center justify-center">
              <LineChart className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              <span className="ml-3 text-sm font-sf-text text-gray-500 dark:text-gray-400">
                Chart Preview
              </span>
            </div>
          )}

          {widget.type === 'list' && (
            <div className="w-full space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-sf-text text-gray-600 dark:text-gray-400"
                >
                  List item {i}
                </div>
              ))}
            </div>
          )}

          {widget.type === 'timeline' && (
            <div className="w-full">
              <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="text-xs font-sf-text text-gray-500 dark:text-gray-400 text-center mt-2">
                Timeline
              </p>
            </div>
          )}

          {widget.type === 'gauge' && (
            <div>
              <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="text-xs font-sf-text text-gray-500 dark:text-gray-400 text-center mt-2">
                Gauge
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-apple-bg-primary dark:bg-apple-bg-primary-dark">
      {/* Header */}
      <div className="glass border-b border-gray-200/20 dark:border-gray-700/20 p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-sf-display font-bold text-gray-900 dark:text-white">
                {dashboard.name}
              </h1>
              {dashboard.description && (
                <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 mt-1">
                  {dashboard.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setShowWidgetPicker(true)}
                    className="px-4 py-2 rounded-apple-sm bg-apple-blue dark:bg-apple-blue-dark text-white font-sf-text font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                    Add Widget
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-apple-sm bg-success-600 dark:bg-success-500 text-white font-sf-text font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                    type="button"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-apple-sm glass text-gray-700 dark:text-gray-300 font-sf-text font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    type="button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-apple-sm glass text-gray-700 dark:text-gray-300 font-sf-text font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                    type="button"
                  >
                    <Settings className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 rounded-apple-sm glass text-gray-700 dark:text-gray-300 font-sf-text font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                    type="button"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="p-6">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-12 gap-6 auto-rows-fr">
            {dashboard.widgets.map((widget) => (
              <div
                key={widget.id}
                className={`col-span-${widget.layout.w} row-span-${widget.layout.h}`}
                style={{
                  gridColumn: `span ${widget.layout.w}`,
                  minHeight: `${widget.layout.h * 100}px`,
                }}
              >
                {renderWidget(widget)}
              </div>
            ))}
          </div>

          {dashboard.widgets.length === 0 && (
            <div className="text-center py-24">
              <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white mb-2">
                No Widgets Yet
              </h3>
              <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 mb-6">
                Click "Edit" to start building your dashboard
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Widget Picker Modal */}
      <Modal
        isOpen={showWidgetPicker}
        onClose={() => setShowWidgetPicker(false)}
        title="Add Widget"
        subtitle="Choose a widget type"
        size="md"
      >
        <div className="grid grid-cols-1 gap-3">
          {widgetTypes.map((widget) => (
            <button
              key={widget.type}
              onClick={() => addWidget(widget.type)}
              className="p-4 rounded-apple-md glass hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left flex items-start gap-4"
              type="button"
            >
              <div className="p-3 rounded-apple-sm bg-apple-blue/10 dark:bg-apple-blue-dark/10 text-apple-blue dark:text-apple-blue-dark flex-shrink-0">
                {widget.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-sf-display font-semibold text-gray-900 dark:text-white mb-1">
                  {widget.label}
                </h4>
                <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400">
                  {widget.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ConfigurableDashboardPage;
