import React from 'react'
import { PerformanceAnalyticsDashboard } from '../components/enhanced/PerformanceAnalyticsDashboard'

const PerformanceAnalyticsPage: React.FC = () => {
  return (
    <div className="p-6">
      <PerformanceAnalyticsDashboard timeRange="month" />
    </div>
  )
}

export default PerformanceAnalyticsPage
