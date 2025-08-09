import React from 'react'
import { Card, CardHeader, CardBody, Progress, Chip } from '@heroui/react'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline'

export interface ProductivityMetric {
  label: string
  current: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'neutral'
  trendValue: string
}

export interface TimeDistribution {
  category: string
  hours: number
  percentage: number
  color: string
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') {
    return <ArrowUpIcon className="w-3 h-3 text-green-500" />
  }
  if (trend === 'down') {
    return <ArrowDownIcon className="w-3 h-3 text-red-500" />
  }
  return <MinusIcon className="w-3 h-3 text-gray-400" />
}

const MetricRow = ({ metric }: { metric: ProductivityMetric }) => {
  const isOnTarget = metric.current >= metric.target
  const progressValue = Math.min((metric.current / metric.target) * 100, 100)
  const progressColor = isOnTarget ? 'success' : metric.current >= metric.target * 0.8 ? 'warning' : 'danger'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {metric.label}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {metric.current}{metric.unit}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            / {metric.target}{metric.unit}
          </span>
          <div className="flex items-center space-x-1">
            <TrendIcon trend={metric.trend} />
            <span className={`text-xs ${
              metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
              metric.trend === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-gray-500 dark:text-gray-400'
            }`}>
              {metric.trendValue}
            </span>
          </div>
        </div>
      </div>
      <Progress
        value={progressValue}
        color={progressColor}
        size="sm"
        className="w-full"
      />
    </div>
  )
}

const TimeDistributionBar = ({ distribution }: { distribution: TimeDistribution }) => {
  const colorClasses = {
    '#3b82f6': 'bg-blue-500',
    '#8b5cf6': 'bg-purple-500', 
    '#10b981': 'bg-green-500',
    '#f59e0b': 'bg-yellow-500'
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3 flex-1">
        <div
          className={`w-3 h-3 rounded-full ${colorClasses[distribution.color as keyof typeof colorClasses] || 'bg-gray-500'}`}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {distribution.category}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {distribution.hours}h
        </span>
        <Chip
          size="sm"
          variant="flat"
          className="text-xs"
        >
          {distribution.percentage}%
        </Chip>
      </div>
    </div>
  )
}

export const ProductivityInsightsWidget: React.FC = () => {
  const productivityMetrics: ProductivityMetric[] = [
    {
      label: 'Tickets Resolved',
      current: 28,
      target: 35,
      unit: '',
      trend: 'up',
      trendValue: '+12%'
    },
    {
      label: 'Avg Resolution Time',
      current: 45,
      target: 60,
      unit: ' min',
      trend: 'up',
      trendValue: '-8%'
    },
    {
      label: 'Customer Satisfaction',
      current: 4.8,
      target: 4.5,
      unit: '/5',
      trend: 'up',
      trendValue: '+2%'
    },
    {
      label: 'First Contact Resolution',
      current: 72,
      target: 80,
      unit: '%',
      trend: 'down',
      trendValue: '-3%'
    }
  ]

  const timeDistribution: TimeDistribution[] = [
    { category: 'Active Support', hours: 6.2, percentage: 78, color: '#3b82f6' },
    { category: 'Administrative', hours: 1.1, percentage: 14, color: '#8b5cf6' },
    { category: 'Training', hours: 0.4, percentage: 5, color: '#10b981' },
    { category: 'Breaks', hours: 0.3, percentage: 3, color: '#f59e0b' }
  ]

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Performance Metrics
            </h3>
            <Chip size="sm" color="primary" variant="flat">
              Today
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-4">
            {productivityMetrics.map((metric, index) => (
              <MetricRow key={index} metric={metric} />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Time Distribution */}
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Time Distribution
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-1">
            {timeDistribution.map((dist, index) => (
              <TimeDistributionBar key={index} distribution={dist} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Active Time</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">8.0h</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Insights */}
      <Card shadow="sm">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Quick Insights
          </h3>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Above target</span> on customer satisfaction this week
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  4.8/5 average rating (+0.1 from last week)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Room for improvement</span> in first contact resolution
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  72% vs 80% target (consider knowledge base updates)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Trend analysis</span> shows improved efficiency
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Resolution time decreased by 8% compared to last period
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
