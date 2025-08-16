import React, { useState, useEffect, useCallback, useRef } from 'react';
import './EnhancedQueueSwitcher.css';

// Mock API functions for enhanced queue management
const getQueueMetrics = async (queueId: string) => {
  // Use queueId in mock
  console.log('getQueueMetrics called with queueId:', queueId);
  return {
    success: true,
    metrics: {
      capacityUtilization: 0.75,
      availableAgents: 5,
      totalAgents: 10,
      openTickets: 20,
      thresholdCritical: false,
      thresholdWarning: true,
    },
  };
};
const getQueueAgents = async (queueId: string) => {
  // Use queueId in mock
  console.log('getQueueAgents called with queueId:', queueId);
  return [
    { userId: 'u1', isAvailable: true, status: 'active', currentLoad: 2, maxCapacity: 5 },
    { userId: 'u2', isAvailable: false, status: 'break', currentLoad: 0, maxCapacity: 5 },
  ];
};
const toggleAgentAvailability = async (queueId: string, options: any) => {
  // Use queueId and options in mock
  console.log('toggleAgentAvailability called with queueId:', queueId, 'options:', options);
  return { queueId, ...options };
};
const getQueueSLAStatus = async (queueId: string) => {
  // Use queueId in mock
  console.log('getQueueSLAStatus called with queueId:', queueId);
  return { breachRisk: 25, timeToNextBreach: 45 };
};
const getSkillBasedRecommendations = async (userId: string) => {
  // Use userId in mock
  console.log('getSkillBasedRecommendations called with userId:', userId);
  return [];
};

// Enhanced type definitions
interface QueueMetrics {
  capacityUtilization: number;
  availableAgents: number;
  totalAgents: number;
  openTickets: number;
  thresholdCritical: boolean;
  thresholdWarning: boolean;
}

interface AgentAvailability {
  userId: string;
  isAvailable: boolean;
  status: string;
  currentLoad: number;
  maxCapacity: number;
}

interface QueueSLAStatus {
  breachRisk: number;
  timeToNextBreach: number;
}

interface SkillRecommendation {
  queueId: string;
  queueName: string;
  matchScore: number;
  reason: string;
}

interface Props {
  currentQueue: string;
  onQueueChange: (queue: string) => void;
  queues: string[];
  userId: string;
}

interface QueueAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  queueId: string;
}

interface EnhancedQueueMetrics extends QueueMetrics {
  slaStatus?: QueueSLAStatus;
  avgResponseTime: number;
  escalatedTickets: number;
  queueHealth: 'excellent' | 'good' | 'warning' | 'critical';
  trendDirection: 'up' | 'down' | 'stable';
}

export const EnhancedQueueSwitcher: React.FC<Props> = ({
  currentQueue,
  onQueueChange,
  queues,
  userId,
}) => {
  // Enhanced State Management
  const [metrics, setMetrics] = useState<EnhancedQueueMetrics | null>(null);
  const [agents, setAgents] = useState<AgentAvailability[]>([]);
  const [currentUser, setCurrentUser] = useState<AgentAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [alerts, setAlerts] = useState<QueueAlert[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [skillRecommendations, setSkillRecommendations] = useState<SkillRecommendation[]>([]);
  const [selectedBreakReason, setSelectedBreakReason] = useState('');
  const [showQueueSuggestions, setShowQueueSuggestions] = useState(false);

  // Real-time updates
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Break reasons for agent status
  const breakReasons = [
    'Lunch Break',
    'Training',
    'Team Meeting',
    'Administrative Tasks',
    'Technical Issues',
    'Personal Break',
  ];

  useEffect(() => {
    if (currentQueue) {
      loadQueueData();
      if (autoRefresh) {
        startAutoRefresh();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentQueue, autoRefresh, refreshInterval]);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      loadQueueData(true); // Silent refresh
    }, refreshInterval * 1000);
  }, [refreshInterval]);

  const loadQueueData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const [metricsData, agentsData, slaData, skillData] = await Promise.all([
        getQueueMetrics(currentQueue),
        getQueueAgents(currentQueue),
        getQueueSLAStatus(currentQueue),
        getSkillBasedRecommendations(userId),
      ]);

      if (metricsData.success && !Array.isArray(metricsData.metrics)) {
        const baseMetrics = metricsData.metrics as QueueMetrics;
        const enhancedMetrics: EnhancedQueueMetrics = {
          ...baseMetrics,
          slaStatus: slaData,
          avgResponseTime: calculateAvgResponseTime(baseMetrics),
          escalatedTickets: calculateEscalatedTickets(baseMetrics),
          queueHealth: determineQueueHealth(baseMetrics),
          trendDirection: determineTrendDirection(baseMetrics),
        };
        setMetrics(enhancedMetrics);

        // Check for alerts
        checkQueueAlerts(enhancedMetrics);
      }

      setAgents(agentsData as AgentAvailability[]);
      setSkillRecommendations(skillData as SkillRecommendation[]);

      // Find current user in agents list
      const user = (agentsData as AgentAvailability[]).find(
        (agent: AgentAvailability) => agent.userId === userId,
      );
      setCurrentUser(user || null);
    } catch (error) {
      console.error('Error loading queue data:', error);
      addAlert('critical', 'Failed to load queue data', currentQueue);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const calculateAvgResponseTime = (metrics: QueueMetrics): number => {
    // Implementation would calculate based on historical data
    return Math.round(metrics.openTickets * 2.5); // Placeholder calculation
  };

  const calculateEscalatedTickets = (metrics: QueueMetrics): number => {
    // Implementation would get escalated ticket count
    return Math.round(metrics.openTickets * 0.15); // Placeholder calculation
  };

  const determineQueueHealth = (
    metrics: QueueMetrics,
  ): 'excellent' | 'good' | 'warning' | 'critical' => {
    if (metrics.capacityUtilization >= 95) return 'critical';
    if (metrics.capacityUtilization >= 80) return 'warning';
    if (metrics.capacityUtilization >= 60) return 'good';
    return 'excellent';
  };

  const determineTrendDirection = (metrics: QueueMetrics): 'up' | 'down' | 'stable' => {
    // Implementation would compare with historical data
    // Placeholder logic
    if (metrics.capacityUtilization > 75) return 'up';
    if (metrics.capacityUtilization < 30) return 'down';
    return 'stable';
  };

  const checkQueueAlerts = (metrics: EnhancedQueueMetrics) => {
    const newAlerts: QueueAlert[] = [];

    // Critical capacity alert
    if (metrics.capacityUtilization >= 95) {
      newAlerts.push({
        id: `critical-${Date.now()}`,
        type: 'critical',
        message: 'Queue capacity is critically high (95%+)',
        timestamp: new Date(),
        queueId: currentQueue,
      });
      playAlertSound();
    }

    // SLA breach warning
    if (metrics.slaStatus && metrics.slaStatus.breachRisk > 70) {
      newAlerts.push({
        id: `sla-${Date.now()}`,
        type: 'warning',
        message: `High SLA breach risk (${metrics.slaStatus.breachRisk}%)`,
        timestamp: new Date(),
        queueId: currentQueue,
      });
    }

    // Update alerts state
    setAlerts((prev) => [...prev.slice(-4), ...newAlerts]); // Keep last 5 alerts
  };

  const addAlert = (type: QueueAlert['type'], message: string, queueId: string) => {
    const alert: QueueAlert = {
      id: `${type}-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      queueId,
    };
    setAlerts((prev) => [...prev.slice(-4), alert]);
  };

  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleAvailabilityToggle = async () => {
    if (!currentUser) return;

    try {
      await toggleAgentAvailability(currentQueue, {
        isAvailable: !currentUser.isAvailable,
        reason: selectedBreakReason,
      });
      await loadQueueData(); // Refresh data

      addAlert(
        'info',
        `Status changed to ${!currentUser.isAvailable ? 'Available' : 'Unavailable'}`,
        currentQueue,
      );
    } catch (error) {
      console.error('Error toggling availability:', error);
      addAlert('critical', 'Failed to update availability status', currentQueue);
    }
  };

  const handleQueueChange = (newQueue: string) => {
    onQueueChange(newQueue);
    addAlert('info', `Switched to queue: ${newQueue}`, newQueue);
  };

  const getCapacityBarWidth = (utilization: number) => {
    const rounded = Math.round(utilization / 10) * 10;
    return Math.min(Math.max(rounded, 0), 100).toString();
  };

  const getCapacityColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="agents-loaded-info">Agents loaded: {agents.length}</div>
      {/* Audio element for alerts */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/alert.mp3" type="audio/mpeg" />
      </audio>

      {/* Enhanced Queue Selector */}
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Active Queue</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQueueSuggestions(!showQueueSuggestions)}
              className="text-xs text-blue-600 hover:text-blue-800"
              title="Show queue suggestions"
            >
              💡 Suggestions
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`rounded px-2 py-1 text-xs ${
                autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
              title="Toggle auto-refresh"
            >
              {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
            </button>
          </div>
        </div>

        <select
          value={currentQueue}
          onChange={(e) => handleQueueChange(e.target.value)}
          title="Select queue"
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {queues.map((queue) => (
            <option key={queue} value={queue}>
              {queue}
            </option>
          ))}
        </select>

        {/* Queue Suggestions */}
        {showQueueSuggestions && skillRecommendations.length > 0 && (
          <div className="mt-3 rounded-md bg-blue-50 p-3">
            <h4 className="mb-2 text-sm font-medium text-blue-900">Recommended Queues</h4>
            <div className="space-y-1">
              {skillRecommendations.slice(0, 3).map((rec) => (
                <button
                  key={rec.queueId}
                  onClick={() => handleQueueChange(rec.queueId)}
                  className="block w-full rounded border bg-white p-2 text-left text-xs hover:bg-blue-50"
                >
                  <div className="flex justify-between">
                    <span>{rec.queueName}</span>
                    <span className="text-blue-600">{rec.matchScore}% match</span>
                  </div>
                  <div className="text-gray-500">{rec.reason}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(-3).map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between rounded-md p-3 ${
                alert.type === 'critical'
                  ? 'border border-red-300 bg-red-100'
                  : alert.type === 'warning'
                    ? 'border border-yellow-300 bg-yellow-100'
                    : 'border border-blue-300 bg-blue-100'
              }`}
            >
              <div>
                <div
                  className={`text-sm font-medium ${
                    alert.type === 'critical'
                      ? 'text-red-800'
                      : alert.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                  }`}
                >
                  {alert.message}
                </div>
                <div className="text-xs text-gray-600">{alert.timestamp.toLocaleTimeString()}</div>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-gray-400 hover:text-gray-600"
                title="Dismiss alert"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Queue Metrics */}
      {metrics && (
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Queue Performance</h3>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${getHealthColor(metrics.queueHealth)}`}>
                {metrics.queueHealth.toUpperCase()}
              </span>
              <span className="text-xs">{getTrendIcon(metrics.trendDirection)}</span>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-xs text-blue-600 hover:text-blue-800"
                title="Compare with other queues"
              >
                📊 Compare
              </button>
            </div>
          </div>

          {/* Enhanced Capacity Bar */}
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs text-gray-600">
              <span>Utilization</span>
              <span>{metrics.capacityUtilization.toFixed(1)}%</span>
            </div>
            <div className="capacity-bar-container">
              <div
                className={`capacity-bar-fill ${getCapacityColor(metrics.capacityUtilization)}`}
                data-width={getCapacityBarWidth(metrics.capacityUtilization)}
              />
              {/* SLA Threshold Indicator */}
              <div className="sla-threshold-indicator" title="SLA Threshold" />
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Available Agents:</span>
              <span className="ml-1 font-medium">
                {metrics.availableAgents}/{metrics.totalAgents}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Open Tickets:</span>
              <span className="ml-1 font-medium">{metrics.openTickets}</span>
            </div>
            <div>
              <span className="text-gray-600">Avg Response:</span>
              <span className="ml-1 font-medium">{formatTime(metrics.avgResponseTime)}</span>
            </div>
            <div>
              <span className="text-gray-600">Escalated:</span>
              <span className="ml-1 font-medium text-red-600">{metrics.escalatedTickets}</span>
            </div>
          </div>

          {/* SLA Status */}
          {metrics.slaStatus && (
            <div className="border-t pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">SLA Status</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    metrics.slaStatus.breachRisk >= 70
                      ? 'bg-red-100 text-red-800'
                      : metrics.slaStatus.breachRisk >= 40
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {metrics.slaStatus.breachRisk}% risk
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Next breach in: {formatTime(metrics.slaStatus.timeToNextBreach)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Availability Controls */}
      {currentUser && (
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Your Status</h3>
              <p className="text-xs text-gray-500">
                {currentUser.status} • Load: {currentUser.currentLoad}/{currentUser.maxCapacity}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  currentUser.isAvailable ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <button
                onClick={handleAvailabilityToggle}
                disabled={loading}
                className={`rounded-md px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                  currentUser.isAvailable
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
                } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {currentUser.isAvailable ? 'Available' : 'Unavailable'}
              </button>
            </div>
          </div>

          {/* Break Reason Selector */}
          {!currentUser.isAvailable && (
            <div className="mt-3">
              <label className="mb-1 block text-xs text-gray-600">Break Reason</label>
              <select
                value={selectedBreakReason}
                onChange={(e) => setSelectedBreakReason(e.target.value)}
                className="break-reason-select"
                title="Select break reason"
                aria-label="Break reason selection"
              >
                <option value="">Select reason...</option>
                {breakReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-3 flex space-x-2">
            <button
              onClick={() => setRefreshInterval(15)}
              className={`rounded px-2 py-1 text-xs ${
                refreshInterval === 15 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Fast Refresh
            </button>
            <button
              onClick={() => loadQueueData()}
              disabled={loading}
              className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              🔄 Refresh Now
            </button>
          </div>
        </div>
      )}

      {/* Queue Comparison Panel */}
      {showComparison && (
        <div className="rounded-lg border bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-gray-900">Queue Comparison</h3>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {queues.map((queue) => (
              <div key={queue} className="flex items-center justify-between rounded border p-2">
                <span className="text-sm">{queue}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">45%</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      queue === currentQueue ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 text-sm font-medium text-gray-900">Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Auto-refresh</span>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="settings-checkbox"
                title="Enable auto-refresh"
                aria-label="Toggle auto-refresh"
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Refresh interval</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="settings-select"
              title="Select refresh interval"
              aria-label="Refresh interval selection"
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="py-2 text-center">
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Updating queue data...</span>
        </div>
      )}
    </div>
  );
};
