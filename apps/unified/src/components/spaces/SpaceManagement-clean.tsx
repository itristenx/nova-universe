import { useState, useEffect } from 'react';
import { cn } from '../../utils';
import { useSpaceStore } from '../../stores/spaces';
import type { Space } from '../../services/spaces';

interface SpaceManagementProps {
  className?: string;
}

export function SpaceManagement({ className }: SpaceManagementProps) {
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'floor' | 'bookings' | 'analytics'>('floor');
  const [selectedFloor, setSelectedFloor] = useState<string>('1');

  // Use space store for API integration
  const { spaces, currentSpace, isLoading, error, loadSpaces, loadSpace, clearError } =
    useSpaceStore();

  // Load spaces on component mount
  useEffect(() => {
    loadSpaces(1);
  }, [loadSpaces]);

  // Auto-select first space if available
  useEffect(() => {
    if (!selectedSpace && spaces.length > 0 && spaces[0]) {
      setSelectedSpace(spaces[0].id);
      loadSpace(spaces[0].id);
    }
  }, [spaces, selectedSpace, loadSpace]);

  // Handle space selection
  const handleSpaceSelect = (spaceId: string) => {
    setSelectedSpace(spaceId);
    loadSpace(spaceId);
  };

  // Get selected space data
  const selectedSpaceData = currentSpace || spaces.find((s: Space) => s.id === selectedSpace);

  // Loading state
  if (isLoading && spaces.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading spaces...</p>
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
          <p className="mb-2 font-medium text-gray-900 dark:text-white">Error loading spaces</p>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => {
              clearError();
              loadSpaces(1);
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
  if (spaces.length === 0) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <div className="text-center">
          <div className="mb-4 text-6xl text-gray-400">🏢</div>
          <p className="mb-2 font-medium text-gray-900 dark:text-white">No spaces found</p>
          <p className="text-gray-600 dark:text-gray-400">Add your first space to get started</p>
        </div>
      </div>
    );
  }

  // Helper functions
  const spaceTypeIcons: { [key: string]: string } = {
    meeting_room: '🏛️',
    conference_room: '👥',
    open_workspace: '🗄️',
    private_office: '🏢',
    focus_room: '🔇',
    phone_booth: '📞',
    lounge: '🛋️',
    kitchen: '🍽️',
    bathroom: '🚿',
    storage: '📦',
    other: '📍',
  };

  const statusConfig = {
    available: { color: 'bg-green-100 text-green-800', label: 'Available' },
    occupied: { color: 'bg-red-100 text-red-800', label: 'Occupied' },
    maintenance: { color: 'bg-yellow-100 text-yellow-800', label: 'Maintenance' },
    reserved: { color: 'bg-blue-100 text-blue-800', label: 'Reserved' },
    unavailable: { color: 'bg-gray-100 text-gray-800', label: 'Unavailable' },
  };

  const floorSpaces = spaces.filter((space: Space) => space.floor === selectedFloor);

  const renderFloorPlan = () => (
    <div className="flex h-full flex-col">
      {/* Floor Controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Floor {selectedFloor}
          </h3>
          <div className="flex items-center space-x-2">
            {['1', '2', '3'].map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  selectedFloor === floor
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                )}
              >
                Floor {floor}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded border border-green-300 bg-green-100"></div>
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded border border-red-300 bg-red-100"></div>
            <span className="text-gray-600 dark:text-gray-400">Occupied</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded border border-yellow-300 bg-yellow-100"></div>
            <span className="text-gray-600 dark:text-gray-400">Maintenance</span>
          </div>
        </div>
      </div>

      {/* Interactive Floor Plan */}
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
        <div className="grid min-h-full grid-cols-8 gap-2">
          {floorSpaces.map((space: Space) => (
            <div
              key={space.id}
              onClick={() => handleSpaceSelect(space.id)}
              className={cn(
                'flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-2 text-center transition-all duration-200 hover:shadow-md',
                selectedSpace === space.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 dark:border-gray-600',
                statusConfig[space.status as keyof typeof statusConfig]?.color ||
                  statusConfig.available.color,
              )}
            >
              <div className="mb-1 text-lg">
                {spaceTypeIcons[space.type] || spaceTypeIcons.other}
              </div>
              <div className="text-xs font-medium text-gray-900 dark:text-white">{space.name}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{space.capacity} seats</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Space Bookings</h3>

      {spaces.map((space: Space) => (
        <div
          key={space.id}
          className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-xl">{spaceTypeIcons[space.type] || spaceTypeIcons.other}</div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{space.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Floor {space.floor} • {space.capacity} capacity
                </p>
              </div>
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs font-medium',
                statusConfig[space.status as keyof typeof statusConfig]?.color ||
                  statusConfig.available.color,
              )}
            >
              {statusConfig[space.status as keyof typeof statusConfig]?.label || space.status}
            </span>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>{space.description || 'No description available'}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Space Overview */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Space Overview</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Spaces:</span>
            <span className="font-medium text-gray-900 dark:text-white">{spaces.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Available:</span>
            <span className="font-medium text-green-600">
              {spaces.filter((s: Space) => s.status === 'available').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Occupied:</span>
            <span className="font-medium text-red-600">
              {spaces.filter((s: Space) => s.status === 'occupied').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Maintenance:</span>
            <span className="font-medium text-yellow-600">
              {spaces.filter((s: Space) => s.status === 'maintenance').length}
            </span>
          </div>
        </div>
      </div>

      {/* Capacity Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Capacity Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Capacity:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {spaces.reduce((sum: number, space: Space) => sum + (space.capacity || 0), 0)} seats
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Avg. Space Size:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {spaces.length > 0
                ? Math.round(
                    spaces.reduce((sum: number, space: Space) => sum + (space.capacity || 0), 0) /
                      spaces.length,
                  )
                : 0}{' '}
              seats
            </span>
          </div>
        </div>
      </div>

      {/* Space Types */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Space Types</h3>
        <div className="space-y-2">
          {Object.entries(
            spaces.reduce(
              (acc: { [key: string]: number }, space: Space) => {
                const type = space.type || 'other';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
              },
              {} as { [key: string]: number },
            ),
          ).map(([type, count]) => (
            <div key={type} className="flex justify-between">
              <span className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <span>{spaceTypeIcons[type] || spaceTypeIcons.other}</span>
                <span>{type.replace('_', ' ')}:</span>
              </span>
              <span className="font-medium text-gray-900 dark:text-white">{count as number}</span>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Space Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive floor plans and booking system
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-gray-300 p-1 dark:border-gray-600">
            {[
              { key: 'floor', label: 'Floor Plan', icon: '🏢' },
              { key: 'bookings', label: 'Bookings', icon: '📅' },
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
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'floor' && renderFloorPlan()}
          {viewMode === 'bookings' && renderBookings()}
          {viewMode === 'analytics' && renderAnalytics()}
        </div>

        {/* Space Detail Panel */}
        {selectedSpaceData && (
          <div className="w-96 overflow-y-auto border-l border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            {/* Space Header */}
            <div className="mb-6">
              <div className="mb-3 flex items-center space-x-3">
                <div className="text-3xl">
                  {spaceTypeIcons[selectedSpaceData.type] || spaceTypeIcons.other}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedSpaceData.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Floor {selectedSpaceData.floor} • {selectedSpaceData.capacity} capacity
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-medium',
                  statusConfig[selectedSpaceData.status as keyof typeof statusConfig]?.color ||
                    statusConfig.available.color,
                )}
              >
                {statusConfig[selectedSpaceData.status as keyof typeof statusConfig]?.label ||
                  selectedSpaceData.status}
              </span>
            </div>

            {/* Space Details */}
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedSpaceData.type?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedSpaceData.capacity || 0} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Floor:</span>
                    <span className="text-gray-900 dark:text-white">{selectedSpaceData.floor}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedSpaceData.description || 'No description available'}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <button className="w-full rounded-lg bg-blue-50 px-3 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30">
                    📅 Book This Space
                  </button>
                  <button className="w-full rounded-lg bg-gray-50 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    📊 View Utilization
                  </button>
                  <button className="w-full rounded-lg bg-gray-50 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    🔧 Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
