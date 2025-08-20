import { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ServerIcon,
  CpuChipIcon,
  SignalIcon,
  ChartBarIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import uptimeKumaService from '@/services/uptimeKuma'
import type { NovaMonitor, NovaSystemHealth } from '@/services/uptimeKuma'

interface MonitoringMetric {
  name: string
  value: string
  status: 'healthy' | 'warning' | 'critical'
  change?: string
  icon: any // Changed from React.ComponentType<any> to any
}

export default function MonitoringPage() {
  const [systemHealth, setSystemHealth] = useState<NovaSystemHealth | null>(null)
  const [monitors, setMonitors] = useState<NovaMonitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived metrics from system health
  const [metrics, setMetrics] = useState<MonitoringMetric[]>([])

  useEffect(() => {
    loadSystemHealth()
    loadMonitors()
    
    // Set up real-time updates
    const unsubscribe = uptimeKumaService.subscribeToEvents((event) => {
      if (event.type === 'monitor_up' || event.type === 'monitor_down') {
        // Refresh monitors when status changes
        loadMonitors()
        loadSystemHealth()
      }
    })

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadSystemHealth()
      loadMonitors()
    }, 30000)

    return () => {
      unsubscribe.then(cleanup => cleanup && cleanup())
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (systemHealth) {
      setMetrics([
        {
          name: 'System Health',
          value: `${systemHealth.monitors.uptime.toFixed(1)}%`,
          status: systemHealth.overall === 'up' ? 'healthy' : systemHealth.overall === 'degraded' ? 'warning' : 'critical',
          change: '+0.2%',
          icon: ShieldCheckIcon
        },
        {
          name: 'Active Monitors',
          value: `${systemHealth.monitors.up}/${systemHealth.monitors.total}`,
          status: systemHealth.monitors.down > 0 ? 'warning' : 'healthy',
          change: systemHealth.monitors.down > 0 ? `-${systemHealth.monitors.down}` : '0',
          icon: ServerIcon
        },
        {
          name: 'Avg Response Time',
          value: `${systemHealth.monitors.averageResponseTime}ms`,
          status: systemHealth.monitors.averageResponseTime > 1000 ? 'warning' : 'healthy',
          change: '-12ms',
          icon: ClockIcon
        },
        {
          name: 'CPU Usage',
          value: `${systemHealth.performance.cpu}%`,
          status: systemHealth.performance.cpu > 80 ? 'critical' : systemHealth.performance.cpu > 60 ? 'warning' : 'healthy',
          change: '-5%',
          icon: CpuChipIcon
        }
      ])
    }
  }, [systemHealth])

  const loadSystemHealth = async () => {
    try {
      const health = await uptimeKumaService.getSystemHealth()
      setSystemHealth(health)
      setError(null)
    } catch (err) {
      console.error('Failed to load system health:', err)
      setError('Failed to load system health')
    }
  }

  const loadMonitors = async () => {
    try {
      setLoading(true)
      const monitorsData = await uptimeKumaService.getMonitors()
      setMonitors(monitorsData)
      setError(null)
    } catch (err) {
      console.error('Failed to load monitors:', err)
      setError('Failed to load monitors')
    } finally {
      setLoading(false)
    }
  }

  const handlePauseMonitor = async (id: string) => {
    try {
      await uptimeKumaService.pauseMonitor(id)
      await loadMonitors()
    } catch (err) {
      console.error('Failed to pause monitor:', err)
    }
  }

  const handleResumeMonitor = async (id: string) => {
    try {
      await uptimeKumaService.resumeMonitor(id)
      await loadMonitors()
    } catch (err) {
      console.error('Failed to resume monitor:', err)
    }
  }

  const handleDeleteMonitor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this monitor?')) return
    
    try {
      await uptimeKumaService.deleteMonitor(id)
      await loadMonitors()
      await loadSystemHealth()
    } catch (err) {
      console.error('Failed to delete monitor:', err)
    }
  }

  const handleTestMonitor = async (id: string) => {
    try {
      await uptimeKumaService.testMonitor(id)
      // Refresh after a short delay to see results
      setTimeout(() => {
        loadMonitors()
      }, 2000)
    } catch (err) {
      console.error('Failed to test monitor:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'critical':
      case 'down':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      case 'maintenance':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading && monitors.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading monitoring data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Monitoring Service Error
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    setError(null)
                    loadSystemHealth()
                    loadMonitors()
                  }}
                  className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-5 w-5 text-white" />
            </div>
            System Monitoring
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Real-time monitoring powered by embedded Uptime Kuma backend
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.href = '/monitoring/add'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Monitor
          </button>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            systemHealth?.overall === 'up' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : systemHealth?.overall === 'degraded'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              systemHealth?.overall === 'up' ? 'bg-green-500 animate-pulse' : 
              systemHealth?.overall === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            {systemHealth?.overall === 'up' ? 'All Systems Operational' : 
             systemHealth?.overall === 'degraded' ? 'Some Issues Detected' : 'System Issues'}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const IconComponent = metric.icon
          return (
            <div key={metric.name} className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center justify-center p-3 rounded-lg ${getStatusColor(metric.status)}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {metric.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {metric.value}
                      </div>
                      {metric.change && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          metric.change.startsWith('+') && metric.status === 'warning' ? 'text-red-600' : 
                          metric.change.startsWith('-') ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {metric.change}
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Monitors */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <SignalIcon className="h-5 w-5" />
              Active Monitors
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {monitors.length} total
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {monitors.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ServerIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No monitors configured</p>
                <button
                  onClick={() => window.location.href = '/monitoring/add'}
                  className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Add your first monitor
                </button>
              </div>
            ) : (
              monitors.map((monitor) => (
                <div key={monitor.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      monitor.status === 'up' ? 'bg-green-500' :
                      monitor.status === 'degraded' ? 'bg-yellow-500' : 
                      monitor.status === 'maintenance' ? 'bg-blue-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {monitor.name}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {monitor.type} • {monitor.url || monitor.hostname}
                      </div>
                      {monitor.averageResponseTime && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Avg response: {monitor.averageResponseTime}ms
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(monitor.status)}`}>
                      {monitor.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTestMonitor(monitor.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Test monitor"
                      >
                        <CogIcon className="h-4 w-4" />
                      </button>
                      {monitor.isActive ? (
                        <button
                          onClick={() => handlePauseMonitor(monitor.id)}
                          className="p-1 text-gray-400 hover:text-yellow-600 transition-colors"
                          title="Pause monitor"
                        >
                          <PauseIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleResumeMonitor(monitor.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Resume monitor"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMonitor(monitor.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete monitor"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Services */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            System Services
          </h2>
          <div className="space-y-4">
            {systemHealth?.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'up' ? 'bg-green-500' :
                    service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {service.responseTime && `Response: ${service.responseTime}ms`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {service.lastChecked}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                Loading system services...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5" />
          Performance Metrics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Monitor Response Times</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">Last 24 hours</span>
              </div>
              <div className="flex-1 flex items-end space-x-2">
                {Array.from({ length: 24 }, (_, i) => (
                  <div 
                    key={i}
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${Math.random() * 80 + 20}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>0h</span>
                <span>12h</span>
                <span>24h</span>
              </div>
            </div>
          </div>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">System Uptime</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">Last 24 hours</span>
              </div>
              <div className="flex-1 flex items-end space-x-2">
                {Array.from({ length: 24 }, (_, i) => (
                  <div 
                    key={i}
                    className="flex-1 bg-green-500 rounded-t"
                    style={{ height: `${Math.random() * 20 + 80}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>0h</span>
                <span>12h</span>
                <span>24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
