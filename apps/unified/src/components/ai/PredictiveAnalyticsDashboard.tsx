/**
 * Predictive Analytics Dashboard - Phase 2 Implementation
 * AI-powered insights and predictions for ITSM operations
 * Inspired by ServiceNow Now Assist and modern analytics platforms
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { analyticsService } from '@/services/analytics'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  ServerIcon,
  BoltIcon,
  EyeIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

interface PredictiveInsight {
  id: string
  type: 'trend' | 'prediction' | 'anomaly' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  timeline: string
  action?: string
  data?: any
}

interface MetricCard {
  id: string
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'stable'
  prediction?: string
  icon: React.ComponentType<any>
  color: string
}

export function PredictiveAnalyticsDashboard() {
  const { t } = useTranslation(['analytics', 'common'])
  const [insights, setInsights] = useState<PredictiveInsight[]>([])
  const [metrics, setMetrics] = useState<MetricCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')

  // Fetch AI-powered insights from real API
  useEffect(() => {
    const fetchPredictiveInsights = async () => {
      setIsLoading(true)
      
      try {
        // Fetch real data from AI analytics API
        const [insights, metrics] = await Promise.all([
          analyticsService.getPredictiveInsights(selectedTimeframe),
          analyticsService.getPredictiveMetrics(selectedTimeframe)
        ])
        
        setInsights(insights)
        setMetrics(metrics)
      } catch (error) {
        console.error('Failed to fetch predictive analytics:', error)
        // Set empty arrays on error
        setInsights([])
        setMetrics([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPredictiveInsights()
  }, [selectedTimeframe, t])

  const handleActionClick = (action: string) => {
    // Handle specific actions like automation setup, reports, etc.
    console.log('Action clicked:', action)
  }

  const handleViewFullReport = () => {
    // Navigate to full analytics report
    console.log('View full report clicked')
  }

  const handleSetupAutomation = () => {
    // Navigate to automation setup
    console.log('Setup automation clicked')
  }

  const handleCustomizeMetrics = () => {
    // Open metrics customization modal
    console.log('Customize metrics clicked')
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return ArrowTrendingUpIcon
      case 'anomaly': return ExclamationTriangleIcon
      case 'recommendation': return BoltIcon
      case 'trend': return ChartBarIcon
      default: return SparklesIcon
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('analytics:dashboard.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('analytics:dashboard.subtitle')}
            </p>
          </div>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('analytics:dashboard.timeframe')}:
          </span>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            aria-label={t('analytics:dashboard.timeframe')}
          >
            <option value="24h">{t('analytics:timeframes.24h')}</option>
            <option value="7d">{t('analytics:timeframes.7d')}</option>
            <option value="30d">{t('analytics:timeframes.30d')}</option>
            <option value="90d">{t('analytics:timeframes.90d')}</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const TrendIcon = metric.trend === 'up' ? ArrowTrendingUpIcon : metric.trend === 'down' ? ArrowTrendingDownIcon : ClockIcon
          
          return (
            <div
              key={metric.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${metric.color}`} />
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.title}
                </h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </div>
                {metric.prediction && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {metric.prediction}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            {t('analytics:insights.title')}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {insights.map((insight) => {
            const TypeIcon = getTypeIcon(insight.type)
            
            return (
              <div key={insight.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getImpactColor(insight.impact)}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {insight.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {t('analytics:insights.confidence')}: {insight.confidence}%
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(insight.impact)}`}>
                          {t(`analytics:impacts.${insight.impact}`)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        {insight.timeline}
                      </span>
                      
                      {insight.action && (
                        <button 
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium"
                          onClick={() => handleActionClick(insight.action!)}
                        >
                          {insight.action}
                          <ArrowRightIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          onClick={handleViewFullReport}
        >
          <EyeIcon className="w-4 h-4" />
          {t('analytics:actions.viewFullReport')}
        </button>
        <button 
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={handleSetupAutomation}
        >
          <BoltIcon className="w-4 h-4" />
          {t('analytics:actions.setupAutomation')}
        </button>
        <button 
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={handleCustomizeMetrics}
        >
          <ChartBarIcon className="w-4 h-4" />
          {t('analytics:actions.customizeMetrics')}
        </button>
      </div>
    </div>
  )
}
