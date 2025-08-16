import { formatCurrency, formatNumber } from '@utils/index'

interface AssetStatsProps {
  stats: {
    total: number
    active: number
    inactive: number
    maintenance: number
    retired: number
    assigned: number
    unassigned: number
    overdue: number
    totalValue: number
    byCategory: Record<string, number>
    byLocation: Record<string, number>
    byStatus: Record<string, number>
    maintenanceDue: number
    warrantyExpiring: number
  }
}

export function AssetStats({ stats }: AssetStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-nova-600">{formatNumber(stats.total)}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Assets</div>
      </div>
      
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{formatNumber(stats.active)}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
      </div>
      
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-yellow-600">{formatNumber(stats.maintenance)}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Maintenance</div>
      </div>
      
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.assigned)}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Assigned</div>
      </div>
      
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-gray-600">{formatNumber(stats.unassigned)}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Unassigned</div>
      </div>
      
      <div className="card p-4 text-center">
        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalValue)}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
      </div>
    </div>
  )
}