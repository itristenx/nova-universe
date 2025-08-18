import React, { useState, useEffect } from 'react'
import { 
  InboxIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import { PackageStats } from '../../types/courier'
import { CourierService } from '../../services/courier/courierService'

const StatsOverview: React.FC = () => {
  const [stats, setStats] = useState<PackageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await CourierService.getPackageStats('24h')
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Unable to load package statistics. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const statItems = [
    {
      name: 'Total Packages',
      value: stats.totalPackages.toLocaleString(),
      icon: InboxIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Pending Pickup',
      value: stats.pendingPickup.toLocaleString(),
      icon: ClockIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'Delivered Today',
      value: stats.deliveredToday.toLocaleString(),
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Utilization Rate',
      value: `${Math.round(stats.utilizationRate)}%`,
      icon: InboxIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
        Package Statistics
      </h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-md ${item.bgColor}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Top Carriers */}
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Top Carriers</h4>
          <div className="space-y-3">
            {stats.topCarriers.slice(0, 5).map((carrier) => (
              <div key={carrier.carrier} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {carrier.carrier.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {carrier.count}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({carrier.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">Department Breakdown</h4>
          <div className="space-y-3">
            {stats.departmentBreakdown.slice(0, 5).map((dept) => (
              <div key={dept.department} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {dept.department}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {dept.count}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({dept.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsOverview
