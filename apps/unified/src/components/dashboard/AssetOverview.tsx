import { Link } from 'react-router-dom';
import { useAuthStore } from '@stores/auth';
import { useQuery } from '@tanstack/react-query';
import { assetService } from '@services/assets';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { RefreshButton } from '@components/common/RefreshButton';
import toast from 'react-hot-toast';
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  PrinterIcon,
  ServerIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

export function AssetOverview() {
  const { user } = useAuthStore();

  const getUserRole = () => {
    if (!user?.roles) return 'user';
    if (user.roles.some((role) => role.name === 'admin')) return 'admin';
    if (user.roles.some((role) => role.name === 'agent')) return 'agent';
    return 'user';
  };

  const userRole = getUserRole();

  // Fetch asset statistics from API
  const {
    data: assetStats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['asset-stats', userRole],
    queryFn: async () => {
      try {
        return await assetService.getAssetStats();
      } catch (_error) {
        console.error('Failed to load asset statistics:', error);
        toast.error('Failed to load asset statistics');
        throw error;
      }
    },
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch recent assets for the user
  const {
    data: recentAssetsData,
    isLoading: isLoadingAssets,
    error: assetsError,
    refetch: refetchAssets,
  } = useQuery({
    queryKey: ['recent-assets', userRole, user?.id],
    queryFn: async () => {
      try {
        const filters: any = {};

        // Filter based on user role
        if (userRole === 'user') {
          filters.assignee = [user?.id]; // Only assets assigned to this user
        }

        return await assetService.getAssets(1, 5, filters, [
          { field: 'updatedAt', direction: 'desc' },
        ]);
      } catch (_error) {
        console.error('Failed to load recent assets:', error);
        toast.error('Failed to load recent assets');
        throw error;
      }
    },
    refetchInterval: 60000,
    retry: 3,
    retryDelay: 1000,
  });

  const getAssetDataForRole = () => {
    if (!assetStats) {
      return {
        summary: [{ name: 'Loading...', count: 0, color: 'text-gray-400', icon: CheckCircleIcon }],
        categories: [],
        myAssets: [],
      };
    }

    switch (userRole) {
      case 'admin':
        return {
          summary: [
            {
              name: 'Available',
              count: assetStats.unassigned,
              color: 'text-green-600',
              icon: CheckCircleIcon,
            },
            {
              name: 'Checked Out',
              count: assetStats.assigned,
              color: 'text-blue-600',
              icon: ComputerDesktopIcon,
            },
            {
              name: 'Maintenance',
              count: assetStats.maintenance,
              color: 'text-yellow-600',
              icon: WrenchScrewdriverIcon,
            },
            {
              name: 'Retired',
              count: assetStats.retired,
              color: 'text-red-600',
              icon: ExclamationTriangleIcon,
            },
          ],
          categories: [
            {
              name: 'Laptops',
              count: assetStats.byCategory?.laptops || 0,
              icon: ComputerDesktopIcon,
              color: 'text-blue-600',
            },
            {
              name: 'Mobile Devices',
              count: assetStats.byCategory?.mobile || 0,
              icon: DevicePhoneMobileIcon,
              color: 'text-green-600',
            },
            {
              name: 'Printers',
              count: assetStats.byCategory?.printers || 0,
              icon: PrinterIcon,
              color: 'text-purple-600',
            },
            {
              name: 'Servers',
              count: assetStats.byCategory?.servers || 0,
              icon: ServerIcon,
              color: 'text-red-600',
            },
          ],
        };

      case 'agent':
        return {
          summary: [
            {
              name: 'Available',
              count: assetStats.unassigned,
              color: 'text-green-600',
              icon: CheckCircleIcon,
            },
            {
              name: 'Pending Assignment',
              count: assetStats.byStatus?.pending || 0,
              color: 'text-yellow-600',
              icon: ComputerDesktopIcon,
            },
            {
              name: 'Need Maintenance',
              count: assetStats.maintenanceDue,
              color: 'text-red-600',
              icon: WrenchScrewdriverIcon,
            },
          ],
          categories: [
            {
              name: 'Laptops',
              count: assetStats.byCategory?.laptops || 0,
              icon: ComputerDesktopIcon,
              color: 'text-blue-600',
            },
            {
              name: 'Mobile Devices',
              count: assetStats.byCategory?.mobile || 0,
              icon: DevicePhoneMobileIcon,
              color: 'text-green-600',
            },
            {
              name: 'Printers',
              count: assetStats.byCategory?.printers || 0,
              icon: PrinterIcon,
              color: 'text-purple-600',
            },
          ],
        };

      default: // user
        const userAssets = recentAssetsData?.data || [];
        return {
          summary: [
            {
              name: 'My Assets',
              count: userAssets.length,
              color: 'text-blue-600',
              icon: ComputerDesktopIcon,
            },
            {
              name: 'Available',
              count: assetStats.unassigned,
              color: 'text-green-600',
              icon: CheckCircleIcon,
            },
            {
              name: 'Warranty Expiring',
              count: assetStats.warrantyExpiring,
              color: 'text-yellow-600',
              icon: ExclamationTriangleIcon,
            },
          ],
          myAssets: userAssets.slice(0, 3).map((asset) => ({
            name: asset.name,
            id: asset.assetTag || asset.id,
            status: asset.status,
            type: asset.type?.name || 'Unknown',
          })),
        };
    }
  };

  const assetData = getAssetDataForRole();

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchStats(), refetchAssets()]);
      toast.success('Asset data refreshed');
    } catch (_error) {
      // Individual errors are already handled in the query functions
      console.error('Failed to refresh asset data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {userRole === 'user' ? 'My Assets' : 'Asset Overview'}
        </h3>
        <div className="flex items-center gap-3">
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={isLoadingStats || isLoadingAssets}
            size="sm"
            tooltip="Refresh asset data"
          />
          <Link
            to="/assets"
            className="text-nova-600 hover:text-nova-700 dark:text-nova-400 dark:hover:text-nova-300 flex items-center gap-1 text-sm font-medium"
          >
            View All
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoadingStats || isLoadingAssets ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : statsError || assetsError ? (
        <div className="py-8 text-center">
          <ExclamationTriangleIcon className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Failed to Load Data
          </h4>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            There was an error loading the asset information.
          </p>
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={false}
            size="md"
            tooltip="Retry loading data"
          />
        </div>
      ) : (
        <>
          {/* Asset Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4">
            {assetData.summary.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`h-5 w-5 ${item.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className={`font-semibold ${item.color}`}>{item.count}</span>
                </div>
              );
            })}
          </div>

          {/* Asset Categories or My Assets */}
          {userRole === 'user' && assetData.myAssets && assetData.myAssets.length > 0 ? (
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                Assigned to Me
              </h4>
              <div className="space-y-2">
                {assetData.myAssets.map((asset) => (
                  <Link key={asset.id} to={`/assets/${asset.id}`} className="block">
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {asset.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {asset.id} • {asset.type}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(asset.status)}`}
                      >
                        {asset.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : userRole !== 'user' && assetData.categories && assetData.categories.length > 0 ? (
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                By Category
              </h4>
              <div className="space-y-2">
                {assetData.categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <div
                      key={category.name}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-5 w-5 ${category.color}`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </span>
                      </div>
                      <span className={`font-semibold ${category.color}`}>{category.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              <ComputerDesktopIcon className="mx-auto mb-2 h-8 w-8" />
              <p>No assets found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
