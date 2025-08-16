import { Link } from 'react-router-dom'
import { useAssetStore } from '@stores/assets'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn, formatCurrency, formatRelativeTime, getAssetStatusColor } from '@utils/index'
import type { Asset } from '@/types'

interface AssetTableProps {
  assets: Asset[]
  selectedAssets: string[]
  isLoading: boolean
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  onLoadAssets: (page?: number) => Promise<void>
}

export function AssetTable({ 
  assets, 
  selectedAssets, 
  isLoading, 
  pagination, 
  onLoadAssets 
}: AssetTableProps) {
  const { 
    setSelectedAssets, 
    addSelectedAsset, 
    removeSelectedAsset
  } = useAssetStore()

  const allSelected = assets.length > 0 && assets.every(asset => selectedAssets.includes(asset.id))
  const someSelected = selectedAssets.length > 0 && !allSelected

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedAssets(selectedAssets.filter(id => !assets.some(asset => asset.id === id)))
    } else {
      const currentPageIds = assets.map(asset => asset.id)
      const newSelected = [...new Set([...selectedAssets, ...currentPageIds])]
      setSelectedAssets(newSelected)
    }
  }

  const handleAssetSelect = (assetId: string, checked: boolean) => {
    if (checked) {
      addSelectedAsset(assetId)
    } else {
      removeSelectedAsset(assetId)
    }
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-nova-600 focus:ring-nova-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Asset
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {assets.map(asset => (
              <tr
                key={asset.id}
                className={cn(
                  'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                  selectedAssets.includes(asset.id) && 'bg-nova-50 dark:bg-nova-900/20'
                )}
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset.id)}
                    onChange={(e) => handleAssetSelect(asset.id, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-nova-600 focus:ring-nova-500"
                  />
                </td>
                
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <Link
                      to={`/assets/${asset.id}`}
                      className="font-medium text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
                    >
                      {asset.name}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {asset.assetTag}
                    </p>
                  </div>
                </td>
                
                <td className="px-4 py-4">
                  <span className={cn('badge', getAssetStatusColor(asset.status))}>
                    {asset.status}
                  </span>
                </td>
                
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {asset.location?.name || 'Unassigned'}
                  </span>
                </td>
                
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {asset.assignedUser?.name || 'Unassigned'}
                  </span>
                </td>
                
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {asset.purchasePrice ? formatCurrency(asset.purchasePrice) : '--'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
          <LoadingSpinner size="md" />
        </div>
      )}

      {/* Simple pagination */}
      {pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(pagination.page - 1) * pagination.perPage + 1} to{' '}
              {Math.min(pagination.page * pagination.perPage, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onLoadAssets(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => onLoadAssets(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}