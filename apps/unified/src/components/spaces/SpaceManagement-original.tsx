import { useState } from 'react';
import { cn } from '../../utils';

interface SpaceManagementProps {
  className?: string;
}

export function SpaceManagement({ className }: SpaceManagementProps) {
  const [selectedSpace, setSelectedSpace] = useState<string | null>('SPACE-001');
  const [viewMode, setViewMode] = useState<'floor' | 'bookings' | 'analytics'>('floor');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  const spaces = [
    {
      id: 'SPACE-001',
      name: 'Conference Room A',
      type: 'meeting_room',
      floor: 1,
      capacity: 12,
      features: ['Projector', 'Whiteboard', 'Video Conferencing', 'Coffee Station'],
      status: 'available',
      location: { x: 2, y: 1, width: 2, height: 1 },
      bookings: [
        {
          id: 'b1',
          title: 'Team Standup',
          organizer: 'John Doe',
          attendees: 8,
          startTime: new Date('2024-01-15T09:00:00'),
          endTime: new Date('2024-01-15T10:00:00'),
          status: 'confirmed',
          recurring: 'daily',
        },
        {
          id: 'b2',
          title: 'Client Presentation',
          organizer: 'Jane Smith',
          attendees: 6,
          startTime: new Date('2024-01-15T14:00:00'),
          endTime: new Date('2024-01-15T15:30:00'),
          status: 'confirmed',
          recurring: null,
        },
      ],
      utilization: 65,
      maintenance: {
        lastCleaned: new Date('2024-01-14T18:00:00'),
        nextMaintenance: new Date('2024-01-20T08:00:00'),
        issues: [],
      },
    },
    {
      id: 'SPACE-002',
      name: 'Conference Room B',
      type: 'meeting_room',
      floor: 1,
      capacity: 8,
      features: ['Whiteboard', 'TV Display', 'Phone Conference'],
      status: 'occupied',
      location: { x: 5, y: 1, width: 2, height: 1 },
      bookings: [
        {
          id: 'b3',
          title: 'Engineering Review',
          organizer: 'Alice Wilson',
          attendees: 5,
          startTime: new Date('2024-01-15T10:30:00'),
          endTime: new Date('2024-01-15T12:00:00'),
          status: 'in_progress',
          recurring: 'weekly',
        },
      ],
      utilization: 78,
      maintenance: {
        lastCleaned: new Date('2024-01-14T18:00:00'),
        nextMaintenance: new Date('2024-01-18T08:00:00'),
        issues: ['HVAC temperature inconsistent'],
      },
    },
    {
      id: 'SPACE-003',
      name: 'Open Workspace - North',
      type: 'open_workspace',
      floor: 1,
      capacity: 24,
      features: ['Hot Desks', 'Standing Desks', 'Power Outlets', 'Natural Light'],
      status: 'available',
      location: { x: 0, y: 0, width: 4, height: 1 },
      bookings: [],
      utilization: 45,
      maintenance: {
        lastCleaned: new Date('2024-01-14T20:00:00'),
        nextMaintenance: new Date('2024-01-21T08:00:00'),
        issues: [],
      },
    },
    {
      id: 'SPACE-004',
      name: 'Focus Pods',
      type: 'focus_room',
      floor: 1,
      capacity: 1,
      features: ['Noise Cancelling', 'Privacy Glass', 'Power & USB'],
      status: 'maintenance',
      location: { x: 7, y: 0, width: 1, height: 1 },
      bookings: [],
      utilization: 85,
      maintenance: {
        lastCleaned: new Date('2024-01-14T18:00:00'),
        nextMaintenance: new Date('2024-01-15T10:00:00'),
        issues: ['Privacy glass mechanism faulty', 'Chair needs replacement'],
      },
    },
    {
      id: 'SPACE-005',
      name: 'Cafeteria',
      type: 'common_area',
      floor: 1,
      capacity: 60,
      features: ['Kitchen', 'Microwave', 'Coffee Machines', 'Seating Areas'],
      status: 'available',
      location: { x: 4, y: 0, width: 3, height: 1 },
      bookings: [
        {
          id: 'b4',
          title: 'All Hands Meeting',
          organizer: 'HR Team',
          attendees: 45,
          startTime: new Date('2024-01-17T12:00:00'),
          endTime: new Date('2024-01-17T13:00:00'),
          status: 'confirmed',
          recurring: 'monthly',
        },
      ],
      utilization: 72,
      maintenance: {
        lastCleaned: new Date('2024-01-14T21:00:00'),
        nextMaintenance: new Date('2024-01-16T07:00:00'),
        issues: [],
      },
    },
    {
      id: 'SPACE-006',
      name: 'Executive Conference Room',
      type: 'meeting_room',
      floor: 2,
      capacity: 16,
      features: ['4K Video Wall', 'Premium Audio', 'Executive Seating', 'Catering Setup'],
      status: 'available',
      location: { x: 3, y: 2, width: 3, height: 1 },
      bookings: [
        {
          id: 'b5',
          title: 'Board Meeting',
          organizer: 'CEO Office',
          attendees: 12,
          startTime: new Date('2024-01-16T10:00:00'),
          endTime: new Date('2024-01-16T12:00:00'),
          status: 'confirmed',
          recurring: 'monthly',
        },
      ],
      utilization: 45,
      maintenance: {
        lastCleaned: new Date('2024-01-14T18:00:00'),
        nextMaintenance: new Date('2024-01-22T08:00:00'),
        issues: [],
      },
    },
  ];

  const statusConfig = {
    available: { color: 'bg-green-500', label: 'Available', textColor: 'text-green-800' },
    occupied: { color: 'bg-red-500', label: 'Occupied', textColor: 'text-red-800' },
    maintenance: { color: 'bg-yellow-500', label: 'Maintenance', textColor: 'text-yellow-800' },
    reserved: { color: 'bg-blue-500', label: 'Reserved', textColor: 'text-blue-800' },
  };

  const typeConfig = {
    meeting_room: { icon: '🏢', label: 'Meeting Room' },
    open_workspace: { icon: '💼', label: 'Open Workspace' },
    focus_room: { icon: '🎯', label: 'Focus Room' },
    common_area: { icon: '☕', label: 'Common Area' },
    office: { icon: '🚪', label: 'Private Office' },
  };

  const selectedSpaceData = spaces.find((s) => s.id === selectedSpace);
  const floorSpaces = spaces.filter((s) => s.floor === selectedFloor);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isCurrentlyBooked = (space: any) => {
    const now = new Date();
    return space.bookings.some(
      (booking: any) =>
        booking.status === 'in_progress' ||
        (booking.status === 'confirmed' && now >= booking.startTime && now <= booking.endTime),
    );
  };

  const getNextBooking = (space: any) => {
    const now = new Date();
    return space.bookings
      .filter((booking: any) => booking.startTime > now)
      .sort((a: any, b: any) => a.startTime.getTime() - b.startTime.getTime())[0];
  };

  const renderFloorPlan = () => {
    const gridCols = 8;
    const gridRows = 3;

    return (
      <div className="space-y-6">
        {/* Floor Selector */}
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Floor Plan</h3>
          <div className="flex items-center rounded-lg border border-gray-300 p-1 dark:border-gray-600">
            <button
              onClick={() => setSelectedFloor(1)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                selectedFloor === 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
              )}
            >
              Floor 1
            </button>
            <button
              onClick={() => setSelectedFloor(2)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                selectedFloor === 2
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
              )}
            >
              Floor 2
            </button>
          </div>
        </div>

        {/* Floor Grid */}
        <div
          className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            gap: '8px',
            aspectRatio: '16/9',
            minHeight: '400px',
          }}
        >
          {floorSpaces.map((space) => (
            <div
              key={space.id}
              onClick={() => setSelectedSpace(space.id)}
              className={cn(
                'relative cursor-pointer overflow-hidden rounded-lg border-2 p-3 transition-all duration-200 hover:shadow-md',
                selectedSpace === space.id
                  ? 'border-blue-500 ring-1 ring-blue-500'
                  : 'border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-700',
              )}
              style={{
                gridColumn: `${space.location.x + 1} / span ${space.location.width}`,
                gridRow: `${space.location.y + 1} / span ${space.location.height}`,
              }}
            >
              {/* Status Indicator */}
              <div
                className={cn(
                  'absolute top-2 right-2 h-3 w-3 rounded-full',
                  statusConfig[space.status as keyof typeof statusConfig].color,
                )}
              />

              {/* Space Info */}
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-1 flex items-center space-x-2">
                    <span className="text-lg">
                      {typeConfig[space.type as keyof typeof typeConfig].icon}
                    </span>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {space.id}
                    </span>
                  </div>
                  <h4 className="mb-1 text-sm leading-tight font-medium text-gray-900 dark:text-white">
                    {space.name}
                  </h4>
                  <div className="text-xs text-gray-500">👥 {space.capacity} capacity</div>
                </div>

                {/* Current/Next Booking */}
                <div className="mt-2">
                  {isCurrentlyBooked(space) ? (
                    <div className="text-xs font-medium text-red-600 dark:text-red-400">
                      🔴 In Use
                    </div>
                  ) : (
                    (() => {
                      const nextBooking = getNextBooking(space);
                      return nextBooking ? (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          Next: {formatTime(nextBooking.startTime)}
                        </div>
                      ) : (
                        <div className="text-xs text-green-600 dark:text-green-400">Available</div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="font-medium text-gray-900 dark:text-white">Status:</div>
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center space-x-2">
              <div className={cn('h-3 w-3 rounded-full', config.color)} />
              <span className="text-gray-600 dark:text-gray-400">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBookings = () => {
    const allBookings = spaces
      .flatMap((space) => space.bookings.map((booking) => ({ ...booking, space })))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Space Bookings</h3>

        <div className="space-y-4">
          {allBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {booking.title}
                    </h4>
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-xs font-medium',
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800',
                      )}
                    >
                      {booking.status.replace('_', ' ')}
                    </span>
                    {booking.recurring && (
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                        {booking.recurring}
                      </span>
                    )}
                  </div>

                  <div className="mb-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>🏢 {booking.space.name}</span>
                    <span>👤 {booking.organizer}</span>
                    <span>👥 {booking.attendees} attendees</span>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    🕐 {formatDateTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
                  <button className="text-sm text-red-600 hover:text-red-700">Cancel</button>
                </div>
              </div>
            </div>
          ))}

          {allBookings.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No bookings scheduled
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    const totalSpaces = spaces.length;
    const availableSpaces = spaces.filter((s) => s.status === 'available').length;
    const averageUtilization =
      spaces.reduce((sum, space) => sum + space.utilization, 0) / totalSpaces;
    const spacesWithIssues = spaces.filter((s) => s.maintenance.issues.length > 0).length;

    const utilizationByType = spaces.reduce(
      (acc, space) => {
        if (!acc[space.type]) {
          acc[space.type] = { count: 0, totalUtilization: 0 };
        }
        acc[space.type]!.count++;
        acc[space.type]!.totalUtilization += space.utilization;
        return acc;
      },
      {} as Record<string, { count: number; totalUtilization: number }>,
    );

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Space Analytics</h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalSpaces}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Spaces</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600">{availableSpaces}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available Now</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(averageUtilization)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Utilization</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-yellow-600">{spacesWithIssues}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Need Attention</div>
          </div>
        </div>

        {/* Utilization by Type */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 text-sm font-medium text-gray-900 dark:text-white">
            Utilization by Space Type
          </h4>
          <div className="space-y-3">
            {Object.entries(utilizationByType).map(([type, data]) => {
              const avgUtilization = Math.round(data.totalUtilization / data.count);
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {typeConfig[type as keyof typeof typeConfig].icon}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {typeConfig[type as keyof typeof typeConfig].label}
                    </span>
                    <span className="text-xs text-gray-500">({data.count} spaces)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${avgUtilization}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm font-medium text-gray-900 dark:text-white">
                      {avgUtilization}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Space Issues */}
        {spacesWithIssues > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-white p-4 dark:border-yellow-800 dark:bg-gray-800">
            <h4 className="mb-4 flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-white">
              <span>⚠️</span>
              <span>Spaces Requiring Attention</span>
            </h4>
            <div className="space-y-3">
              {spaces
                .filter((space) => space.maintenance.issues.length > 0)
                .map((space) => (
                  <div
                    key={space.id}
                    className="flex items-start justify-between rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {space.name}
                      </div>
                      <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                        {space.id} • Floor {space.floor}
                      </div>
                      <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
                        {space.maintenance.issues.map((issue, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span>•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-700">
                      Schedule Fix
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Top Utilized Spaces */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-4 text-sm font-medium text-gray-900 dark:text-white">
            Most Utilized Spaces
          </h4>
          <div className="space-y-2">
            {spaces
              .sort((a, b) => b.utilization - a.utilization)
              .slice(0, 5)
              .map((space) => (
                <div
                  key={space.id}
                  className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {typeConfig[space.type as keyof typeof typeConfig].icon}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {space.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {space.id} • {space.capacity} capacity
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${space.utilization}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm font-medium text-gray-900 dark:text-white">
                      {space.utilization}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Space Management</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Floor plans, bookings, and space optimization
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Toggle */}
            <div className="flex items-center rounded-lg border border-gray-300 p-1 dark:border-gray-600">
              <button
                onClick={() => setViewMode('floor')}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  viewMode === 'floor'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
              >
                🏢 Floor Plan
              </button>
              <button
                onClick={() => setViewMode('bookings')}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  viewMode === 'bookings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
              >
                📅 Bookings
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  viewMode === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
              >
                📊 Analytics
              </button>
            </div>

            <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
              ➕ Book Space
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {viewMode === 'floor' && renderFloorPlan()}
          {viewMode === 'bookings' && renderBookings()}
          {viewMode === 'analytics' && renderAnalytics()}
        </div>
      </div>

      {/* Space Detail Panel */}
      {selectedSpaceData && viewMode === 'floor' && (
        <div className="w-96 overflow-y-auto border-l border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          {/* Space Header */}
          <div className="mb-6">
            <div className="mb-3 flex items-center space-x-3">
              <div className="text-3xl">
                {typeConfig[selectedSpaceData.type as keyof typeof typeConfig].icon}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedSpaceData.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedSpaceData.id}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      statusConfig[selectedSpaceData.status as keyof typeof statusConfig].color ===
                        'bg-green-500'
                        ? 'bg-green-100 text-green-800'
                        : statusConfig[selectedSpaceData.status as keyof typeof statusConfig]
                              .color === 'bg-red-500'
                          ? 'bg-red-100 text-red-800'
                          : statusConfig[selectedSpaceData.status as keyof typeof statusConfig]
                                .color === 'bg-yellow-500'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800',
                    )}
                  >
                    {statusConfig[selectedSpaceData.status as keyof typeof statusConfig].label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Space Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Space Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="text-gray-900 dark:text-white">
                    {typeConfig[selectedSpaceData.type as keyof typeof typeConfig].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Floor:</span>
                  <span className="text-gray-900 dark:text-white">
                    Floor {selectedSpaceData.floor}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Capacity:</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedSpaceData.capacity} people
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Utilization:</span>
                  <span className="text-gray-900 dark:text-white">
                    {selectedSpaceData.utilization}%
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Features & Amenities
              </h4>
              <div className="flex flex-wrap gap-1">
                {selectedSpaceData.features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Current/Upcoming Bookings */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Bookings</h4>
              {selectedSpaceData.bookings.length > 0 ? (
                <div className="space-y-3">
                  {selectedSpaceData.bookings
                    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                    .slice(0, 3)
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {booking.title}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-xs font-medium',
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800',
                            )}
                          >
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          <div>👤 {booking.organizer}</div>
                          <div>👥 {booking.attendees} attendees</div>
                          <div>
                            🕐 {formatDateTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </div>
                          {booking.recurring && (
                            <div className="flex items-center space-x-1">
                              <span>🔄</span>
                              <span className="capitalize">{booking.recurring}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic dark:text-gray-400">
                  No upcoming bookings
                </div>
              )}
            </div>

            {/* Maintenance */}
            <div>
              <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Maintenance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Last Cleaned:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(selectedSpaceData.maintenance.lastCleaned)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Next Maintenance:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDateTime(selectedSpaceData.maintenance.nextMaintenance)}
                  </span>
                </div>
              </div>

              {selectedSpaceData.maintenance.issues.length > 0 && (
                <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                  <div className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    ⚠️ Issues Reported
                  </div>
                  <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                    {selectedSpaceData.maintenance.issues.map((issue, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span>•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-2">
            <button className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm leading-4 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
              📅 Book This Space
            </button>
            <button className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              🔧 Report Issue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
