import { useState, useEffect } from 'react';
import { cn } from '../../utils';
import { useAssetStore } from '../../stores/assets';

interface AssetLifecycleManagementProps {
  className?: string;
}

export function AssetLifecycleManagement({ className }: AssetLifecycleManagementProps) {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'analytics'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Use asset store for API integration
  const { assets, currentAsset, isLoading, error, loadAssets, loadAsset, clearError } =
    useAssetStore();

  // Load assets on component mount
  useEffect(() => {
    loadAssets(1);
  }, [loadAssets]);

  // Auto-select first asset if available
  useEffect(() => {
    if (!selectedAsset && assets.length > 0 && assets[0]) {
      setSelectedAsset(assets[0].id);
      loadAsset(assets[0].id);
    }
  }, [assets, selectedAsset, loadAsset]);

  // Handle asset selection
  const handleAssetSelect = (assetId: string) => {
    setSelectedAsset(assetId);
    loadAsset(assetId);
  };

  // Get selected asset data
  const selectedAssetData = currentAsset || assets.find((a) => a.id === selectedAsset);

  // Loading state
  if (isLoading && assets.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading assets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center">
          <div className="mb-4 text-4xl text-red-500">⚠️</div>
          <p className="mb-2 font-medium text-gray-900 dark:text-white">Error loading assets</p>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => {
              clearError();
              loadAssets(1);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center">
          <div className="mb-4 text-6xl text-gray-400">💻</div>
          <p className="mb-2 font-medium text-gray-900 dark:text-white">No assets found</p>
          <p className="text-gray-600 dark:text-gray-400">Add your first asset to get started</p>
        </div>
      </div>
    );
  }

  // Helper functions
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'Maintenance' },
    retired: { color: 'bg-red-100 text-red-800', label: 'Retired' },
    lost: { color: 'bg-red-100 text-red-800', label: 'Lost' },
    stolen: { color: 'bg-red-100 text-red-800', label: 'Stolen' },
  };

  const conditionConfig = {
    excellent: { color: 'bg-green-100 text-green-800', label: 'Excellent' },
    good: { color: 'bg-blue-100 text-blue-800', label: 'Good' },
    fair: { color: 'bg-yellow-100 text-yellow-800', label: 'Fair' },
    poor: { color: 'bg-orange-100 text-orange-800', label: 'Poor' },
    damaged: { color: 'bg-red-100 text-red-800', label: 'Damaged' },
  };

  const typeIcons: { [key: string]: string } = {
    laptop: '💻',
    desktop: '🖥️',
    monitor: '📺',
    phone: '📱',
    tablet: '📱',
    printer: '🖨️',
    server: '⚡',
    network: '🌐',
    other: '📦',
  };

  const filteredAssets =
    filterStatus === 'all' ? assets : assets.filter((asset) => asset.status === filterStatus);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderAssetList = () => (
    <div className="space-y-3">
      {filteredAssets.map((asset) => (
        <div
          key={asset.id}
          onClick={() => handleAssetSelect(asset.id)}
          className={cn(
            'cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-md',
            selectedAsset === asset.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex flex-1 items-center space-x-3">
              <div className="text-2xl">
                {typeIcons[asset.type?.name?.toLowerCase()] || typeIcons.other}
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{asset.name}</h3>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      statusConfig[asset.status as keyof typeof statusConfig]?.color ||
                        statusConfig.active.color,
                    )}
                  >
                    {statusConfig[asset.status as keyof typeof statusConfig]?.label || asset.status}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      conditionConfig[asset.condition as keyof typeof conditionConfig]?.color ||
                        conditionConfig.good.color,
                    )}
                  >
                    {conditionConfig[asset.condition as keyof typeof conditionConfig]?.label ||
                      asset.condition}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
  );

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Asset Overview */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Asset Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Assets:</span>
            <span className="font-medium text-gray-900 dark:text-white">{assets.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Active:</span>
            <span className="font-medium text-green-600">
              {assets.filter((a) => a.status === 'available').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Maintenance:</span>
            <span className="font-medium text-yellow-600">
              {assets.filter((a) => a.status === 'maintenance').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Retired:</span>
            <span className="font-medium text-red-600">
              {assets.filter((a) => a.status === 'retired').length}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Financial Summary
        </h3>
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
              {assets.length > 0
                ? formatCurrency(
                    assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0) /
                      assets.length,
                  )
                : '$0'}
            </span>
          </div>
        </div>
      </div>

      {/* Asset Types */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Asset Types</h3>
        <div className="space-y-2">
          {Object.entries(
            assets.reduce(
              (acc, asset) => {
                const type = asset.type?.name || 'Other';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
              },
              {} as { [key: string]: number },
            ),
          ).map(([type, count]) => (
            <div key={type} className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{type}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Asset Lifecycle Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track assets from purchase to retirement
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-gray-300 p-1 dark:border-gray-600">
            {[
              { key: 'list', label: 'List', icon: '📋' },
              { key: 'timeline', label: 'Timeline', icon: '📈' },
              { key: 'analytics', label: 'Analytics', icon: '📊' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={cn(
                  'flex items-center space-x-2 rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  viewMode === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
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
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
      <div className="flex min-h-0 flex-1">
        {/* Asset List */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'list' && renderAssetList()}
          {viewMode === 'analytics' && renderAnalytics()}
          {viewMode === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Asset Timeline</h3>

              {selectedAssetData ? (
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Asset Created</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(selectedAssetData.createdAt)}
                        </p>
                      </div>
                    </div>

                    {selectedAssetData.purchaseDate && (
                      <div className="flex items-center space-x-3">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Purchased</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(selectedAssetData.purchaseDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Last Updated</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(selectedAssetData.updatedAt)}
                        </p>
                      </div>
                    </div>

                    {selectedAssetData.warrantyExpiry && (
                      <div className="flex items-center space-x-3">
                        <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Warranty Expires
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(selectedAssetData.warrantyExpiry)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Select an asset to view its timeline
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Asset Detail Panel */}
        {selectedAssetData && (
          <div className="w-96 overflow-y-auto border-l border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            {/* Asset Header */}
            <div className="mb-6">
              <div className="mb-3 flex items-center space-x-3">
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
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    statusConfig[selectedAssetData.status as keyof typeof statusConfig]?.color ||
                      statusConfig.active.color,
                  )}
                >
                  {statusConfig[selectedAssetData.status as keyof typeof statusConfig]?.label ||
                    selectedAssetData.status}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    conditionConfig[selectedAssetData.condition as keyof typeof conditionConfig]
                      ?.color || conditionConfig.good.color,
                  )}
                >
                  {conditionConfig[selectedAssetData.condition as keyof typeof conditionConfig]
                    ?.label || selectedAssetData.condition}
                </span>
              </div>
            </div>

            {/* Asset Details */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Model:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.model || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Serial:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.serialNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.location?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Assigned:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.assignedUser?.displayName || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Financial
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Purchase Price:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.purchasePrice
                        ? formatCurrency(selectedAssetData.purchasePrice)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Purchase Date:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.purchaseDate
                        ? formatDate(selectedAssetData.purchaseDate)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Warranty:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedAssetData.warrantyExpiry
                        ? formatDate(selectedAssetData.warrantyExpiry)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAssetData.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
