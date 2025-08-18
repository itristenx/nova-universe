import { useState, useEffect } from 'react'
import { cn } from '../../utils'
import { useAssetStore } from '../../stores/assets'

interface AssetLifecycleManagementProps {
  className?: string
}

export function AssetLifecycleManagement({ className }: AssetLifecycleManagementProps) {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'analytics'>('list')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Use asset store for API integration
  const {
    assets,
    currentAsset,
    isLoading,
    error,
    loadAssets,
    loadAsset,
    clearError
  } = useAssetStore()

  // Load assets on component mount
  useEffect(() => {
    loadAssets(1)
  }, [loadAssets])

  // Auto-select first asset if available
  useEffect(() => {
    if (!selectedAsset && assets.length > 0 && assets[0]) {
      setSelectedAsset(assets[0].id)
      loadAsset(assets[0].id)
    }
  }, [assets, selectedAsset, loadAsset])

  // Handle asset selection
  const handleAssetSelect = (assetId: string) => {
    setSelectedAsset(assetId)
    loadAsset(assetId)
  }

  // Get selected asset data
  const selectedAssetData = currentAsset || assets.find(a => a.id === selectedAsset)

  // Loading state
  if (isLoading && assets.length === 0) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading assets...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-gray-900 dark:text-white font-medium mb-2">Error loading assets</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError()
              loadAssets(1)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <div className={cn("h-full flex items-center justify-center", className)}>
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">💻</div>
          <p className="text-gray-900 dark:text-white font-medium mb-2">No assets found</p>
          <p className="text-gray-600 dark:text-gray-400">Add your first asset to get started</p>
        </div>
      </div>
    )
  }

  // Helper functions
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'Maintenance' },
    retired: { color: 'bg-red-100 text-red-800', label: 'Retired' },
    lost: { color: 'bg-red-100 text-red-800', label: 'Lost' },
    stolen: { color: 'bg-red-100 text-red-800', label: 'Stolen' }
  }

  const conditionConfig = {
    excellent: { color: 'bg-green-100 text-green-800', label: 'Excellent' },
    good: { color: 'bg-blue-100 text-blue-800', label: 'Good' },
    fair: { color: 'bg-yellow-100 text-yellow-800', label: 'Fair' },
    poor: { color: 'bg-orange-100 text-orange-800', label: 'Poor' },
    damaged: { color: 'bg-red-100 text-red-800', label: 'Damaged' }
  }

  const typeIcons: { [key: string]: string } = {
    laptop: '💻',
    desktop: '🖥️',
    monitor: '📺',
    phone: '📱',
    tablet: '📱',
    printer: '🖨️',
    server: '⚡',
    network: '🌐',
    other: '📦'
  }

  const filteredAssets = filterStatus === 'all' 
    ? assets 
    : assets.filter(asset => asset.status === filterStatus)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderAssetList = () => (
    <div className="space-y-3">
      {filteredAssets.map((asset) => (
        <div
          key={asset.id}
          onClick={() => handleAssetSelect(asset.id)}
          className={cn(
            "border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
            selectedAsset === asset.id
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="text-2xl">
                {typeIcons[asset.type?.name?.toLowerCase()] || typeIcons.other}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {asset.name}
                  </h3>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    statusConfig[asset.status as keyof typeof statusConfig]?.color || statusConfig.active.color
                  )}>
                    {statusConfig[asset.status as keyof typeof statusConfig]?.label || asset.status}
                  </span>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    conditionConfig[asset.condition as keyof typeof conditionConfig]?.color || conditionConfig.good.color
                  )}>
                    {conditionConfig[asset.condition as keyof typeof conditionConfig]?.label || asset.condition}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div>Model: {asset.model || 'N/A'}</div>
                  <div>Serial: {asset.serialNumber || 'N/A'}</div>
                  <div>Location: {asset.location?.name || 'Unassigned'}</div>
                  <div>Assigned: {asset.assignedUser?.displayName || 'Unassigned'}</div>
                </div>
              </div>
            </div>
            
            <div className="text-right text-sm">
              <div className="font-medium text-gray-900 dark:text-white">
                {asset.purchasePrice ? formatCurrency(asset.purchasePrice) : 'N/A'}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {asset.purchaseDate ? formatDate(asset.purchaseDate) : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Asset Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Asset Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Assets:</span>
            <span className="font-medium text-gray-900 dark:text-white">{assets.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Active:</span>
            <span className="font-medium text-green-600">{assets.filter(a => a.status === 'available').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Maintenance:</span>
            <span className="font-medium text-yellow-600">{assets.filter(a => a.status === 'maintenance').length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Retired:</span>
            <span className="font-medium text-red-600">{assets.filter(a => a.status === 'retired').length}</span>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0))}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Avg. Asset Value:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {assets.length > 0 ? formatCurrency(assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0) / assets.length) : '$0'}
            </span>
          </div>
        </div>
      </div>

      {/* Asset Types */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Asset Types</h3>
        <div className="space-y-2">
          {Object.entries(
            assets.reduce((acc, asset) => {
              const type = asset.type?.name || 'Other'
              acc[type] = (acc[type] || 0) + 1
              return acc
            }, {} as { [key: string]: number })
          ).map(([type, count]) => (
            <div key={type} className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{type}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Lifecycle Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track assets from purchase to retirement</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            {[
              { key: 'list', label: 'List', icon: '📋' },
              { key: 'timeline', label: 'Timeline', icon: '📈' },
              { key: 'analytics', label: 'Analytics', icon: '📊' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={cn(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center space-x-2",
                  viewMode === key
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex">
        {/* Asset List */}
        <div className="flex-1 p-6 overflow-y-auto">
          {viewMode === 'list' && renderAssetList()}
          {viewMode === 'analytics' && renderAnalytics()}
          {viewMode === 'timeline' && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">🚧</div>
              <p className="text-gray-600 dark:text-gray-400">Timeline view coming soon</p>
            </div>
          )}
        </div>

        {/* Asset Detail Panel */}
        {selectedAssetData && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
            {/* Asset Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-3xl">
                  {typeIcons[selectedAssetData.type?.name?.toLowerCase()] || typeIcons.other}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedAssetData.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedAssetData.assetTag}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  statusConfig[selectedAssetData.status as keyof typeof statusConfig]?.color || statusConfig.active.color
                )}>
                  {statusConfig[selectedAssetData.status as keyof typeof statusConfig]?.label || selectedAssetData.status}
                </span>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  conditionConfig[selectedAssetData.condition as keyof typeof conditionConfig]?.color || conditionConfig.good.color
                )}>
                  {conditionConfig[selectedAssetData.condition as keyof typeof conditionConfig]?.label || selectedAssetData.condition}
                </span>
              </div>
            </div>

            {/* Asset Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Model:</span>
                    <span className="text-gray-900 dark:text-white">{selectedAssetData.model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Serial:</span>
                    <span className="text-gray-900 dark:text-white">{selectedAssetData.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="text-gray-900 dark:text-white">{selectedAssetData.location?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Assigned:</span>
                    <span className="text-gray-900 dark:text-white">{selectedAssetData.assignedUser?.displayName || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Financial</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Purchase Price:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.purchasePrice ? formatCurrency(selectedAssetData.purchasePrice) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Purchase Date:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.purchaseDate ? formatDate(selectedAssetData.purchaseDate) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Warranty:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.warrantyExpiry ? formatDate(selectedAssetData.warrantyExpiry) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAssetData.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
