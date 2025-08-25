import { ReactNode } from 'react';
import type { Widget } from '../../types/dashboard';

interface DraggableWidgetProps {
  id?: string;
  widget?: Widget;
  children?: ReactNode;
  isEditMode?: boolean;
  isSelected?: boolean;
  onSelect?: (widget: Widget) => void;
  onDelete?: (id: string) => void;
  onRefresh?: (id: string) => void;
  onDragStart?: (id: string) => void;
  onDragEnd?: () => void;
  className?: string;
}

export function DraggableWidget({
  id,
  widget,
  children,
  isEditMode = false,
  isSelected = false,
  onSelect,
  onDelete,
  onRefresh,
  onDragStart,
  onDragEnd,
  className = '',
}: DraggableWidgetProps) {
  const handleClick = () => {
    if (widget && onSelect) {
      onSelect(widget);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (widget && onDelete) {
      onDelete(widget.id);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (widget && onRefresh) {
      onRefresh(widget.id);
    }
  };

  if (widget) {
    const gridColumnSpan = `col-span-${widget.position.width}`;
    const gridRowSpan = `row-span-${widget.position.height}`;

    return (
      <div
        draggable={isEditMode}
        onDragStart={() => onDragStart?.(widget.id)}
        onDragEnd={onDragEnd}
        onClick={handleClick}
        className={`relative rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 ${isEditMode ? 'cursor-move' : 'cursor-default'} ${isSelected ? 'ring-2 ring-blue-500' : ''} ${gridColumnSpan} ${gridRowSpan} ${className} `}
      >
        {isEditMode && (
          <div className="absolute top-2 right-2 flex space-x-1">
            <button
              onClick={handleRefresh}
              title="Refresh widget"
              className="rounded bg-white p-1 text-gray-400 shadow hover:text-gray-600"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              title="Delete widget"
              className="rounded bg-white p-1 text-red-400 shadow hover:text-red-600"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{widget.title}</h3>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{widget.description}</p>

        {/* Widget content based on type */}
        <div className="widget-content">
          {widget.type === 'metric' && widget.config?.metric && (
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {widget.config.metric.value}
                {widget.config.metric.unit && (
                  <span className="ml-1 text-lg text-gray-500">{widget.config.metric.unit}</span>
                )}
              </div>
              {widget.config.metric.trend && (
                <div
                  className={`mt-1 text-sm ${
                    widget.config.metric.trend === 'up'
                      ? 'text-green-600'
                      : widget.config.metric.trend === 'down'
                        ? 'text-red-600'
                        : 'text-gray-600'
                  }`}
                >
                  {widget.config.metric.trendValue}% vs last period
                </div>
              )}
            </div>
          )}

          {widget.type === 'chart' && (
            <div className="flex h-32 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
              <span className="text-gray-500">Chart Placeholder</span>
            </div>
          )}

          {widget.type === 'table' && widget.config?.table && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {widget.config.table.columns?.map((column, i) => (
                      <th key={i} className="px-2 py-1 text-left">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {widget.config.table.data
                    ?.slice(0, widget.config.table.maxRows || 10)
                    .map((row, i) => (
                      <tr key={i} className="border-b">
                        {widget.config.table?.columns?.map((column, j) => (
                          <td key={j} className="px-2 py-1">
                            {row[column.key]}
                          </td>
                        )) || []}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {widget.lastUpdated && (
          <div className="mt-4 text-xs text-gray-400">
            Last updated: {widget.lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  }

  // Fallback for basic usage with children
  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(id || '')}
      onDragEnd={onDragEnd}
      className={`cursor-move ${className}`}
    >
      {children}
    </div>
  );
}
