import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn, formatNumber } from '@utils/index'
import { useUserStore } from '@stores/users'
import toast from 'react-hot-toast'

// Custom icon components for React 19 compatibility
const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
)

const StarSolidIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
)

const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const FunnelIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9ZM8.5 12l7-7M8.5 12l7 7" />
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

// VIP levels configuration
const VIP_LEVELS = [
  { value: 'priority', label: 'Priority', color: 'blue', description: 'Standard priority support' },
  { value: 'gold', label: 'Gold', color: 'yellow', description: 'Enhanced support with dedicated agent' },
  { value: 'exec', label: 'Executive', color: 'purple', description: 'Executive level support with immediate escalation' }
]

export default function VIPManagementPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({})
  const [vipStats, setVipStats] = useState<any>({})
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const {
    users,
    isLoading,
    error,
    getUsers,
    refreshUsers,
    setFilters
  } = useUserStore()

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        getUsers(),
        loadVipStats()
      ])
    }
    loadData()
  }, [getUsers])

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: any = { ...localFilters }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim()
      }
      
      setFilters(filters)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, localFilters, setFilters])

  const loadVipStats = async () => {
    try {
      // Calculate VIP stats from users data
      const vipUsers = users.filter(user => (user as any).isVip)
      const stats = {
        total: vipUsers.length,
        priority: vipUsers.filter(user => (user as any).vipLevel === 'priority').length,
        gold: vipUsers.filter(user => (user as any).vipLevel === 'gold').length,
        exec: vipUsers.filter(user => (user as any).vipLevel === 'exec').length,
        regularUsers: users.length - vipUsers.length
      }
      setVipStats(stats)
    } catch (error) {
      console.error('Error loading VIP stats:', error)
    }
  }

  // Update VIP stats when users data changes
  useEffect(() => {
    if (users.length > 0) {
      loadVipStats()
    }
  }, [users])

  const updateVipStatus = async (userId: string, isVip: boolean, vipLevel?: string) => {
    try {
      setIsUpdating(userId)
      
      // Simulate API call - replace with actual service call
      const response = await fetch(`/api/users/${userId}/vip`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isVip,
          vipLevel: isVip ? (vipLevel || 'priority') : undefined
        })
      })

      if (response.ok) {
        await refreshUsers()
        toast.success(isVip ? 'VIP status granted' : 'VIP status removed')
      } else {
        throw new Error('Failed to update VIP status')
      }
    } catch (error) {
      console.error('Error updating VIP status:', error)
      toast.error('Failed to update VIP status')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setLocalFilters(newFilters)
  }

  const handleClearFilters = () => {
    setLocalFilters({})
    setSearchQuery('')
  }

  const getVipLevelConfig = (level: string) => {
    return VIP_LEVELS.find(l => l.value === level) || VIP_LEVELS[0]
  }

  // Show error if there's an issue loading data
  if (error && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              VIP Management
            </h1>
            <p className="mt-1 text-red-600 dark:text-red-400">
              Error loading VIP data: {error}
            </p>
          </div>
        </div>
        
        <div className="card p-12 text-center">
          <div className="text-red-600 dark:text-red-400">
            Failed to load VIP data. Please try again.
          </div>
          <button
            onClick={() => refreshUsers()}
            className="btn btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            VIP Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage VIP user status and support priority levels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/admin/vip/reports', '_blank')}
            className="btn btn-secondary"
          >
            VIP Reports
          </button>
        </div>
      </div>

      {/* VIP Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-nova-600">{formatNumber(vipStats?.total || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total VIPs</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(vipStats?.priority || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Priority</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{formatNumber(vipStats?.gold || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Gold</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{formatNumber(vipStats?.exec || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Executive</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{formatNumber(vipStats?.regularUsers || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Regular Users</div>
        </div>
      </div>

      {/* VIP Level Reference */}
      <div className="card p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">VIP Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VIP_LEVELS.map((level) => (
            <div key={level.value} className="flex items-start space-x-3">
              <div className={cn(
                'flex-shrink-0 w-3 h-3 rounded-full mt-1',
                level.color === 'blue' && 'bg-blue-500',
                level.color === 'yellow' && 'bg-yellow-500', 
                level.color === 'purple' && 'bg-purple-500'
              )} />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{level.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{level.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, or VIP level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'btn btn-secondary',
                showFilters && 'bg-nova-100 text-nova-700 dark:bg-nova-900 dark:text-nova-300'
              )}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {Object.keys(localFilters).length > 0 && (
                <span className="ml-1 rounded-full bg-nova-600 px-2 py-0.5 text-xs text-white">
                  {Object.keys(localFilters).length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => refreshUsers()}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Refresh'
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VIP Status
                </label>
                <select
                  value={localFilters.vipStatus || ''}
                  onChange={(e) => handleFiltersChange({ ...localFilters, vipStatus: e.target.value || undefined })}
                  className="input"
                  aria-label="Filter by VIP status"
                >
                  <option value="">All Users</option>
                  <option value="vip">VIP Only</option>
                  <option value="regular">Regular Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VIP Level
                </label>
                <select
                  value={localFilters.vipLevel || ''}
                  onChange={(e) => handleFiltersChange({ ...localFilters, vipLevel: e.target.value || undefined })}
                  className="input"
                  aria-label="Filter by VIP level"
                >
                  <option value="">All Levels</option>
                  {VIP_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="btn btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="lg" text="Loading VIP data..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No users found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              No users match your current filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    VIP Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    VIP Level
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => {
                  const userVip = user as any
                  const isVip = userVip.isVip || false
                  const vipLevel = userVip.vipLevel || 'priority'
                  const levelConfig = getVipLevelConfig(vipLevel)
                  const updating = isUpdating === user.id

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-nova-100 dark:bg-nova-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-nova-700 dark:text-nova-300">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.firstName} {user.lastName}
                              </div>
                              {isVip && (
                                <StarSolidIcon className={cn(
                                  'h-4 w-4',
                                  levelConfig?.color === 'blue' && 'text-blue-500',
                                  levelConfig?.color === 'yellow' && 'text-yellow-500',
                                  levelConfig?.color === 'purple' && 'text-purple-500'
                                )} />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => (
                            <span
                              key={role.id}
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                role.name === 'admin' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                                role.name === 'agent' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                                role.name === 'user' && 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                              )}
                            >
                              {role.name}
                            </span>
                          )) || (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                              user
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => updateVipStatus(user.id, !isVip, vipLevel)}
                          disabled={updating}
                          className={cn(
                            'flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors',
                            isVip 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                            updating && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {updating ? (
                            <LoadingSpinner size="sm" />
                          ) : isVip ? (
                            <CheckIcon className="h-4 w-4" />
                          ) : (
                            <XMarkIcon className="h-4 w-4" />
                          )}
                          <span>{isVip ? 'VIP' : 'Regular'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {isVip ? (
                          <select
                            value={vipLevel}
                            onChange={(e) => updateVipStatus(user.id, true, e.target.value)}
                            disabled={updating}
                            aria-label={`VIP level for ${user.firstName} ${user.lastName}`}
                            className={cn(
                              'text-sm border-0 bg-transparent focus:ring-2 focus:ring-nova-500 rounded-md',
                              levelConfig?.color === 'blue' && 'text-blue-700 dark:text-blue-300',
                              levelConfig?.color === 'yellow' && 'text-yellow-700 dark:text-yellow-300',
                              levelConfig?.color === 'purple' && 'text-purple-700 dark:text-purple-300',
                              updating && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            {VIP_LEVELS.map((level) => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => updateVipStatus(user.id, !isVip, isVip ? undefined : 'priority')}
                            disabled={updating}
                            className={cn(
                              'btn btn-sm',
                              isVip ? 'btn-secondary' : 'btn-primary',
                              updating && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            {updating ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <StarIcon className="h-4 w-4" />
                                {isVip ? 'Remove VIP' : 'Make VIP'}
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
