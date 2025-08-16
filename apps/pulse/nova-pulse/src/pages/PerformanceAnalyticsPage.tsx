import React from 'react'
import { motion } from 'framer-motion'
import styles from '../components/TicketGrid.module.css'
import { PerformanceAnalyticsDashboard } from '../components/enhanced/PerformanceAnalyticsDashboard'

const PerformanceAnalyticsPage: React.FC = () => {
  React.useEffect(() => {
    const handler = () => window.dispatchEvent(new CustomEvent('analytics:refresh'))
    window.addEventListener('pulse:pull_to_refresh', handler)
    return () => window.removeEventListener('pulse:pull_to_refresh', handler)
  }, [])

  return (
    <motion.div className={`p-6 ${styles.pullContainer}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <PerformanceAnalyticsDashboard timeRange="month" />
    </motion.div>
  )
}

export default PerformanceAnalyticsPage
