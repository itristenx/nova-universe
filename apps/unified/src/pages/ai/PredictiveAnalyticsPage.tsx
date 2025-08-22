import React from 'react'
import { PredictiveAnalyticsDashboard } from '@components/ai/PredictiveAnalyticsDashboard'

const PredictiveAnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <PredictiveAnalyticsDashboard />
      </div>
    </div>
  )
}

export default PredictiveAnalyticsPage
