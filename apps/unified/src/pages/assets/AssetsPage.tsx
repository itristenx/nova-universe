import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlusIcon, 
  FunnelIcon, 
  ArrowsUpDownIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  XMarkIcon,
  QrCodeIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAssetStore } from '@stores/assets'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { AssetTable } from '@components/assets/AssetTable'
import { AssetFilters } from '@components/assets/AssetFilters'
import { AssetStats } from '@components/assets/AssetStats'
import { BulkAssetActions } from '@components/assets/BulkAssetActions'
import { cn, formatNumber } from '@utils/index'
import toast from 'react-hot-toast'

export default function AssetsPage() {
  const {
    assets,
    selectedAssets,
    isLoading,
    error,
    pagination,
    stats,
    filters,
    loadAssets,
    loadStats,
    loadCategories,
    loadTypes,
    loadLocations,
    setFilters,
    searchAssets,
    clearSelectedAssets,
    bulkUpdateAssets,
    refreshAssets,
    clearError,
  } = useAssetStore()

  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showMaintenanceAlert, setShowMaintenanceAlert] = useState(true)
  const [showWarrantyAlert, setShowWarrantyAlert] = useState(true)

  // Load assets and related data on component mount
  useEffect(() => {
    loadAssets()
    loadStats()
    loadCategories()
    loadTypes()
    loadLocations()
  }, [loadAssets, loadStats, loadCategories, loadTypes, loadLocations])

  // Handle search with debouncing
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      await loadAssets()
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      await searchAssets(query)
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Handle bulk actions
  const handleBulkAssign = async (userId: string) => {
    if (selectedAssets.length === 0) {
      toast.error('Please select assets to assign')
      return
    }

    try {
      await bulkUpdateAssets({
        assetIds: selectedAssets,
        action: 'assign',
        data: { userId }
      })
      toast.success(`Assigned ${selectedAssets.length} assets`)
      clearSelectedAssets()
    } catch (error) {
      toast.error('Failed to assign assets')
    }
  }

  const handleBulkRelocate = async (locationId: string) => {
    if (selectedAssets.length === 0) {
      toast.error('Please select assets to relocate')
      return
    }

    try {
      await bulkUpdateAssets({
        assetIds: selectedAssets,
        action: 'relocate',
        data: { locationId }
      })
      toast.success(`Relocated ${selectedAssets.length} assets`)
      clearSelectedAssets()
    } catch (error) {
      toast.error('Failed to relocate assets')
    }
  }

  const handleBulkStatusChange = async (status: 'active' | 'inactive' | 'maintenance' | 'retired') => {
    if (selectedAssets.length === 0) {
      toast.error('Please select assets to update')
      return
    }

    try {
      await bulkUpdateAssets({
        assetIds: selectedAssets,
        action: status === 'active' ? 'activate' : status,
        data: {}
      })
      toast.success(`Updated ${selectedAssets.length} assets to ${status}`)
      clearSelectedAssets()
    } catch (error) {
      toast.error(`Failed to update assets to ${status}`)
    }
  }

  // Handle export
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      toast.success(`Exporting assets as ${format.toUpperCase()}`)
      // Export functionality would be implemented here
    } catch (error) {
      toast.error('Export failed')
    }
  }

  // Handle QR code generation
  const handleGenerateQRCodes = async () => {
    if (selectedAssets.length === 0) {
      toast.error('Please select assets for QR code generation')
      return
    }

    try {
      toast.success(`Generating QR codes for ${selectedAssets.length} assets`)
      // QR code generation would be implemented here
    } catch (error) {
      toast.error('Failed to generate QR codes')
    }
  }

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) clearError()
    }
  }, [error, clearError])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Asset Management
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage and track all organizational assets and inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Asset discovery */}
          <Link to="/assets/discovery" className="btn btn-secondary">
            <MagnifyingGlassIcon className="h-4 w-4" />
            Asset Discovery
          </Link>

          {/* Import assets */}
          <Link to="/assets/import" className="btn btn-secondary">
            <DocumentArrowDownIcon className="h-4 w-4" />
            Import
          </Link>

          {/* Export menu */}
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleExport(e.target.value as 'csv' | 'excel' | 'pdf')
                  e.target.value = ''
                }
              }}
              className="btn btn-secondary"
              defaultValue=""
            >
              <option value="" disabled>Export</option>
              <option value="csv">Export as CSV</option>
              <option value="excel">Export as Excel</option>
              <option value="pdf">Export as PDF</option>
            </select>
          </div>

          {/* Create asset button */}
          <Link to="/assets/new" className="btn btn-primary">
            <PlusIcon className="h-4 w-4" />
            Add Asset
          </Link>
        </div>
      </div>

      {/* Alert banners */}
      {stats && stats.maintenanceDue > 0 && showMaintenanceAlert && (
        <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <WrenchScrewdriverIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Maintenance Required
              </h3>
              <div className="mt-2 text-sm text-orange-700 dark:text-orange-300">
                <p>
                  {stats.maintenanceDue} asset{stats.maintenanceDue !== 1 ? 's' : ''} require maintenance.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Link
                    to="/assets/maintenance-due"
                    className="rounded-md bg-orange-50 px-2 py-1.5 text-sm font-medium text-orange-800 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-200 dark:hover:bg-orange-900/60"
                  >
                    View Assets
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowMaintenanceAlert(false)}
                    className="ml-3 rounded-md bg-orange-50 px-2 py-1.5 text-sm font-medium text-orange-800 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-200 dark:hover:bg-orange-900/60"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && stats.warrantyExpiring > 0 && showWarrantyAlert && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Warranties Expiring
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  {stats.warrantyExpiring} asset{stats.warrantyExpiring !== 1 ? 's have' : ' has'} expiring warranties.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Link
                    to="/assets/warranty-expiring"
                    className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60"
                  >
                    View Assets
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowWarrantyAlert(false)}
                    className="ml-3 rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats overview */}
      {stats && <AssetStats stats={stats} />}

      {/* Search and filters bar */}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assets by name, tag, serial number, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          {/* Filter and sort buttons */}
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
              {Object.keys(filters).length > 0 && (
                <span className="ml-1 rounded-full bg-nova-600 px-2 py-0.5 text-xs text-white">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>

            <button
              onClick={refreshAssets}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
              Sort
            </button>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <AssetFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({})}
            />
          </div>
        )}
      </div>

      {/* Bulk actions bar */}
      {selectedAssets.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatNumber(selectedAssets.length)} asset{selectedAssets.length !== 1 ? 's' : ''} selected
              </span>
              
              <BulkAssetActions
                selectedCount={selectedAssets.length}
                onAssign={handleBulkAssign}
                onRelocate={handleBulkRelocate}
                onStatusChange={handleBulkStatusChange}
                onGenerateQRCodes={handleGenerateQRCodes}
              />
            </div>

            <button
              onClick={clearSelectedAssets}
              className="btn btn-ghost btn-sm"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error loading assets
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    clearError()
                    refreshAssets()
                  }}
                  className="btn btn-sm btn-secondary"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets table */}
      <div className="card overflow-hidden">
        {isLoading && !assets.length ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="lg" text="Loading assets..." />
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <PlusIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No assets found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {searchQuery || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first asset'}
            </p>
            {!searchQuery && Object.keys(filters).length === 0 && (
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/assets/new" className="btn btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  Add Asset
                </Link>
                <Link to="/assets/import" className="btn btn-secondary">
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Import Assets
                </Link>
              </div>
            )}
          </div>
        ) : (
          <AssetTable 
            assets={assets}
            selectedAssets={selectedAssets}
            isLoading={isLoading}
            pagination={pagination}
            onLoadAssets={loadAssets}
          />
        )}
      </div>
    </div>
  )
}