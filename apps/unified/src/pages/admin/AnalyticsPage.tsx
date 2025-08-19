import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { analyticsService, type DashboardAnalytics } from '@services/analytics'

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const result = await analyticsService.getDashboardAnalytics('30d')
      setData(result)
    } catch {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!data) {
    return <p className="text-center text-gray-500">No analytics data available</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Metric label="Total Tickets" value={data.summary.totalTickets} />
        <Metric label="Open Tickets" value={data.summary.openTickets} />
        <Metric label="Resolved Tickets" value={data.summary.resolvedTickets} />
        <Metric label="Active Users" value={data.summary.activeUsers} />
        <Metric label="Knowledge Articles" value={data.summary.knowledgeArticles} />
        <Metric label="System Uptime" value={`${data.summary.systemUptime}%`} />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded bg-gray-50 dark:bg-gray-800">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}
