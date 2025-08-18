import { useState } from 'react'
import { cn } from '../../utils'

interface EnhancedDashboardPageProps {
  role?: 'admin' | 'agent' | 'user'
  className?: string
}

export function EnhancedDashboardPage({ 
  role = 'admin',
  className 
}: EnhancedDashboardPageProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [widgets, setWidgets] = useState([
    {
      id: '1',
      type: 'metric' as const,
      title: 'Total Tickets',
      description: 'All tickets in the system',
      position: { x: 0, y: 0, width: 2, height: 2 },
      config: {
        metric: {
          value: 1247,
          unit: '',
          trend: 'up' as const,
          trendValue: 12,
          color: 'blue' as const,
          icon: 'ticket'
        }
      },
      lastUpdated: new Date()
    },
    {
      id: '2',
      type: 'metric' as const,
      title: 'Open Tickets',
      description: 'Currently open tickets',
      position: { x: 2, y: 0, width: 2, height: 2 },
      config: {
        metric: {
          value: 23,
          unit: '',
          trend: 'down' as const,
          trendValue: 8,
          color: 'green' as const,
          icon: 'clock'
        }
      },
      lastUpdated: new Date()
    },
    {
      id: '3',
      type: 'progress' as const,
      title: 'SLA Compliance',
      description: 'This month\'s SLA performance',
      position: { x: 0, y: 2, width: 4, height: 2 },
      config: {
        progress: {
          current: 94,
          target: 100,
          unit: '%',
          showPercentage: true,
          color: 'green' as const
        }
      },
      lastUpdated: new Date()
    },
    {
      id: '4',
      type: 'chart' as const,
      title: 'Ticket Trends',
      description: 'Weekly ticket volume',
      position: { x: 4, y: 0, width: 4, height: 4 },
      config: {
        chart: {
          type: 'line' as const,
          data: [
            { label: 'Mon', value: 45 },
            { label: 'Tue', value: 52 },
            { label: 'Wed', value: 48 },
            { label: 'Thu', value: 61 },
            { label: 'Fri', value: 55 },
            { label: 'Sat', value: 32 },
            { label: 'Sun', value: 28 }
          ],
          timeRange: '7d' as const,
          showLegend: true
        }
      },
      lastUpdated: new Date()
    },
    {
      id: '5',
      type: 'activity' as const,
      title: 'Recent Activity',
      description: 'Latest system activities',
      position: { x: 8, y: 0, width: 4, height: 4 },
      config: {
        activity: {
          items: [
            {
              id: '1',
              title: 'New ticket created',
              description: 'Server down in data center',
              timestamp: new Date(Date.now() - 1000 * 60 * 5),
              type: 'ticket' as const,
              status: 'error' as const
            },
            {
              id: '2',
              title: 'Asset checked out',
              description: 'Laptop assigned to John Doe',
              timestamp: new Date(Date.now() - 1000 * 60 * 15),
              type: 'asset' as const,
              status: 'success' as const
            },
            {
              id: '3',
              title: 'User logged in',
              description: 'Jane Smith accessed the system',
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
              type: 'user' as const,
              status: 'info' as const
            }
          ],
          maxItems: 10,
          showTimestamps: true
        }
      },
      lastUpdated: new Date()
    },
    {
      id: '6',
      type: 'alert' as const,
      title: 'System Alert',
      description: 'Critical system notification',
      position: { x: 0, y: 4, width: 6, height: 2 },
      config: {
        alert: {
          severity: 'warning' as const,
          message: 'Database backup is 2 hours overdue. Please check the backup service.',
          actionUrl: '/monitoring/backups',
          actionLabel: 'View Backups',
          dismissible: true
        }
      },
      lastUpdated: new Date()
    },
    {
      id: '7',
      type: 'table' as const,
      title: 'Recent Tickets',
      description: 'Last 5 tickets created',
      position: { x: 6, y: 4, width: 6, height: 2 },
      config: {
        table: {
          columns: [
            { key: 'id', label: 'ID', width: '80px' },
            { key: 'title', label: 'Title' },
            { key: 'status', label: 'Status', width: '100px' },
            { key: 'priority', label: 'Priority', width: '100px' }
          ],
          data: [
            { id: 'T-001', title: 'Server outage', status: 'Open', priority: 'High' },
            { id: 'T-002', title: 'Password reset', status: 'Resolved', priority: 'Low' },
            { id: 'T-003', title: 'Software license', status: 'In Progress', priority: 'Medium' },
            { id: 'T-004', title: 'Hardware failure', status: 'Open', priority: 'Critical' },
            { id: 'T-005', title: 'Access request', status: 'Pending', priority: 'Low' }
          ],
          maxRows: 5
        }
      },
      lastUpdated: new Date()
    }
  ])

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
    setSelectedWidget(null)
  }

  const handleWidgetSelect = (widget: any) => {
    if (isEditMode) {
      setSelectedWidget(widget.id)
    }
  }

  const handleWidgetDelete = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id))
    setSelectedWidget(null)
  }

  const handleWidgetRefresh = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id 
        ? { ...w, lastUpdated: new Date(), isLoading: false }
        : w
    ))
  }

  const addNewWidget = () => {
    const newWidget = {
      id: Date.now().toString(),
      type: 'metric' as const,
      title: 'New Metric',
      description: 'Configure this widget',
      position: { x: 0, y: 6, width: 2, height: 2 },
      config: {
        metric: {
          value: 0,
          unit: '',
          trend: 'stable' as const,
          trendValue: 0,
          color: 'blue' as const,
          icon: 'default'
        }
      },
      lastUpdated: new Date()
    } as any
    setWidgets([...widgets, newWidget])
  }

  const renderWidget = (widget: any) => {
    const isSelected = selectedWidget === widget.id

    return (
      <div
        key={widget.id}
        onClick={() => handleWidgetSelect(widget)}
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 cursor-pointer relative group",
          {
            'ring-2 ring-blue-500 ring-opacity-50': isSelected,
            'hover:shadow-md': true
          }
        )}
        style={{
          gridColumn: `span ${widget.position.width}`,
          gridRow: `span ${widget.position.height}`,
          minHeight: `${widget.position.height * 180}px`
        }}
      >
        {/* Widget Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {widget.title}
            </h3>
            {widget.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {widget.description}
              </p>
            )}
          </div>
          
          {isEditMode && (
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleWidgetRefresh(widget.id)
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                title="Refresh"
              >
                ↻
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleWidgetDelete(widget.id)
                }}
                className="p-1 text-red-400 hover:text-red-600 rounded"
                title="Delete"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Widget Content */}
        <div className="flex-1 h-full p-4">
          {renderWidgetContent(widget)}
        </div>

        {/* Last Updated */}
        {widget.lastUpdated && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Updated {widget.lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    )
  }

  const renderWidgetContent = (widget: any) => {
    switch (widget.type) {
      case 'metric':
        const { metric } = widget.config
        const trendIcon = metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'
        const trendColor = metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-400'
        
        return (
          <div className="h-full flex flex-col justify-center text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              {metric.unit && <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>}
            </div>
            {metric.trendValue && (
              <div className={cn("text-sm", trendColor)}>
                {trendIcon} {metric.trendValue}% vs last period
              </div>
            )}
          </div>
        )

      case 'progress':
        const { progress } = widget.config
        const percentage = Math.round((progress.current / progress.target) * 100)
        
        return (
          <div className="h-full flex flex-col justify-center">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress.current}{progress.unit} / {progress.target}{progress.unit}
              </div>
              {progress.showPercentage && (
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  {percentage}% Complete
                </div>
              )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="h-3 bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        )

      case 'chart':
        return (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Chart Visualization</p>
              <p className="text-xs mt-1">
                {widget.config.chart.type} chart with {widget.config.chart.data.length} data points
              </p>
            </div>
          </div>
        )

      case 'activity':
        const { activity } = widget.config
        return (
          <div className="h-full overflow-auto">
            <div className="space-y-3">
              {activity.items.slice(0, activity.maxItems || 5).map((item: any) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    item.status === 'success' ? 'bg-green-500' :
                    item.status === 'error' ? 'bg-red-500' :
                    item.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                    {activity.showTimestamps && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'alert':
        const { alert } = widget.config
        const severityColors = {
          info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
          warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
          error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
          success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
        }
        
        return (
          <div className={cn("h-full p-3 border-2 rounded-lg", severityColors[alert.severity as keyof typeof severityColors] || severityColors.info)}>
            <div className="h-full flex flex-col justify-center">
              <p className="font-medium text-sm">{alert.message}</p>
              {alert.actionUrl && alert.actionLabel && (
                <button
                  onClick={() => window.open(alert.actionUrl, '_blank')}
                  className="mt-3 inline-flex items-center px-3 py-1 text-xs font-medium rounded-md border border-current"
                >
                  {alert.actionLabel}
                </button>
              )}
            </div>
          </div>
        )

      case 'table':
        const { table } = widget.config
        return (
          <div className="h-full overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {table.columns.map((column: any) => (
                    <th
                      key={column.key}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                      style={{ width: column.width }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {table.data.slice(0, table.maxRows || 5).map((row: any, index: number) => (
                  <tr key={index}>
                    {table.columns.map((column: any) => (
                      <td key={column.key} className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-white">
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      default:
        return (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Unknown widget type</p>
          </div>
        )
    }
  }

  return (
    <div className={cn("h-full", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enhanced Dashboard ({role})
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Interactive widgets with real-time updates and customizable layouts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleEditMode}
            className={cn(
              "inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
              isEditMode
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500 dark:bg-blue-900/20 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300"
            )}
          >
            {isEditMode ? '👁 View Mode' : '✏️ Edit Mode'}
          </button>

          {isEditMode && (
            <button
              onClick={addNewWidget}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ➕ Add Widget
            </button>
          )}
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-12 gap-4 auto-rows-[180px]">
        {widgets.map(renderWidget)}
      </div>

      {/* Edit Mode Instructions */}
      {isEditMode && (
        <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Edit Mode Active:</strong> Click widgets to select them, use the buttons to refresh or delete widgets. 
            Click "View Mode" when you're done editing.
          </p>
        </div>
      )}
    </div>
  )
}
