import React, { useState, useEffect } from 'react'
import { getQueueMetrics, getQueueAgents, toggleAgentAvailability } from '../lib/api'
import type { QueueMetrics, AgentAvailability } from '../types'

interface Props {
  currentQueue: string
  onQueueChange: (queue: string) => void
  queues: string[]
}

export const QueueSwitcher: React.FC<Props> = ({ currentQueue, onQueueChange, queues }) => {
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null)
  const [currentUser, setCurrentUser] = useState<AgentAvailability | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentQueue) {
      loadQueueData()
    }
  }, [currentQueue])

  const loadQueueData = async () => {
    try {
      setLoading(true)
      const [metricsData, agentsData] = await Promise.all([
        getQueueMetrics(currentQueue),
        getQueueAgents(currentQueue)
      ])
      
      if (metricsData.success && !Array.isArray(metricsData.metrics)) {
        setMetrics(metricsData.metrics)
      }
      
      // Find current user in agents list
      const user = agentsData.find(agent => agent.userId === getCurrentUserId())
      setCurrentUser(user || null)
    } catch (error) {
      console.error('Error loading queue data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Mock function _to _get current user _ID - _replace _with _actual auth
  const getCurrentUserId = () => {
    // This should come from your auth context
    return 'current-user-id'
  }

  const handleAvailabilityToggle = async () => {
    if (!currentUser) return
    
    try {
      await toggleAgentAvailability(currentQueue, {
        isAvailable: !currentUser.isAvailable
      })
      await loadQueueData() // Refresh data
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  const getCapacityBarWidth = (utilization: number) => {
    const width = Math.min(utilization, 100)
    if (width >= 95) return 'w-full'
    if (width >= 90) return 'w-11/12'
    if (width >= 80) return 'w-4/5'
    if (width >= 75) return 'w-3/4'
    if (width >= 66) return 'w-2/3'
    if (width >= 50) return 'w-1/2'
    if (width >= 33) return 'w-1/3'
    if (width >= 25) return 'w-1/4'
    if (width >= 20) return 'w-1/5'
    if (width >= 10) return 'w-1/12'
    return 'w-0'
  }

  const getCapacityColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-500'
    if (utilization >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Queue Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Queue
        </label>
        <select
          value={currentQueue}
          onChange={(e) => onQueueChange(e.target.value)}
          title="Select queue"
          className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {queues.map((queue) => (
            <option key={queue} value={queue}>
              {queue}
            </option>
          ))}
        </select>
      </div>

      {/* Queue Metrics */}
      {metrics && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900">Queue Capacity</h3>
            {metrics.thresholdCritical && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                Critical
              </span>
            )}
            {metrics.thresholdWarning && !metrics.thresholdCritical && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                Warning
              </span>
            )}
          </div>
          
          {/* Capacity Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Utilization</span>
              <span>{metrics.capacityUtilization.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getCapacityColor(metrics.capacityUtilization)} ${getCapacityBarWidth(metrics.capacityUtilization)}`}
              />
            </div>
          </div>

          {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Available Agents:</span>
                <span className="ml-1 font-medium">{metrics.availableAgents}/{metrics.totalAgents}</span>
              </div>
              <div>
                <span className="text-gray-600">Open Tickets:</span>
                <span className="ml-1 font-medium">{metrics.openTickets}</span>
              </div>
            </div>
        </div>
      )}

      {/* Availability Toggle */}
      {currentUser && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Your Availability</h3>
              <p className="text-xs text-gray-500">
                Status: {currentUser.status} • Load: {currentUser.currentLoad}/{currentUser.maxCapacity}
              </p>
            </div>
            <button
              onClick={handleAvailabilityToggle}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                currentUser.isAvailable
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {currentUser.isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-2">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}
 // TODO-LINT: move to async function