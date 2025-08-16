interface TicketStatsProps {
  stats: {
    total: number
    open: number
    inProgress: number
    resolved: number
    closed: number
    averageResolutionTime: number
    slaBreaches: number
    byPriority: Record<string, number>
    byType: Record<string, number>
    byStatus: Record<string, number>
    trends: Array<{ date: string; count: number }>
  }
}

export function TicketStats({ stats }: TicketStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-nova-600">{stats.total}</div>
        <div className="text-sm text-gray-600">Total</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
        <div className="text-sm text-gray-600">Open</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
        <div className="text-sm text-gray-600">In Progress</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
        <div className="text-sm text-gray-600">Resolved</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-gray-600">{stats.closed}</div>
        <div className="text-sm text-gray-600">Closed</div>
      </div>
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{stats.slaBreaches}</div>
        <div className="text-sm text-gray-600">SLA Breaches</div>
      </div>
    </div>
  )
}