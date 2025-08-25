import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { spaceService, type Space as APISpace, type SpaceBooking } from '@services/spaces';
import {
  ArrowLeftIcon,
  PencilIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WifiIcon,
  TvIcon,
  ComputerDesktopIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="border-nova-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
  </div>
);

/*
// interface Space {
//   id: string
//   name: string
  type: string
  capacity: number
  location: string
  floor: string
  building: string
  area: number
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved'
  amenities: string[]
  description: string
  hourlyRate?: number
  bookings: Booking[]
  images: string[]
  createdAt: string
  lastUpdated: string
}
*/

/*
interface Booking {
  id: string
  title: string
  organizer: string
  startTime: string
  endTime: string
  attendees: number
  status: 'Confirmed' | 'Pending' | 'Cancelled'
}
*/

const amenityIcons: Record<string, any> = {
  WiFi: WifiIcon,
  Projector: TvIcon,
  Computer: ComputerDesktopIcon,
  Phone: PhoneIcon,
  Whiteboard: ComputerDesktopIcon,
  'Video Conference': TvIcon,
};

const getStatusBadge = (status: APISpace['status']) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  switch (status) {
    case 'available':
      return (
        <span
          className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}
        >
          Available
        </span>
      );
    case 'occupied':
      return (
        <span
          className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}
        >
          Occupied
        </span>
      );
    case 'maintenance':
    case 'out_of_service':
      return (
        <span
          className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}
        >
          Maintenance
        </span>
      );
    case 'reserved':
      return (
        <span
          className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}
        >
          Reserved
        </span>
      );
    default:
      return (
        <span
          className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`}
        >
          {status}
        </span>
      );
  }
};

export default function SpaceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<APISpace | null>(null);
  const [bookings, setBookings] = useState<SpaceBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpace = async () => {
      if (!id) {
        toast.error('Space ID is required');
        navigate('/spaces');
        return;
      }

      try {
        setIsLoading(true);

        // Fetch space details from API
        const [spaceData, bookingsData] = await Promise.all([
          spaceService.getSpace(id),
          spaceService.getBookings(id),
        ]);

        setSpace(spaceData);
        setBookings(bookingsData.data);
      } catch (_error) {
        console.error('Failed to fetch space details:', error);
        toast.error('Failed to load space details');
        navigate('/spaces');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpace();
  }, [id, navigate]);

  const handleBookSpace = () => {
    navigate(`/spaces/${id}/book`);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="py-12 text-center">
        <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Space Not Found</h3>
        <p className="text-gray-500 dark:text-gray-400">The requested space could not be found.</p>
        <button
          onClick={() => navigate('/spaces')}
          className="bg-nova-600 hover:bg-nova-700 mt-4 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Spaces
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/spaces')}
            title="Back to Spaces"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{space.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {space.type} • {space.location}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusBadge(space.status)}
          {space.status === 'available' && (
            <button
              onClick={handleBookSpace}
              className="bg-nova-600 hover:bg-nova-700 focus:ring-nova-500 inline-flex items-center rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Book Space
            </button>
          )}
          <button
            onClick={() => navigate(`/spaces/${space.id}/edit`)}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Space Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Space Information
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Capacity
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <UserGroupIcon className="mr-2 h-4 w-4" />
                  {space.capacity} people
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Area
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {/* Note: Area not available in API Space type */}
                  {/* {space.area} sq ft */}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Building
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <MapPinIcon className="mr-2 h-4 w-4" />
                  {space.building}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Floor
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{space.floor}</p>
              </div>

              {/* Note: hourlyRate not available in API Space type */}
              {/* {space.hourlyRate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Hourly Rate
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${space.hourlyRate}/hour
                  </p>
                </div>
              )} */}
            </div>

            {space.description && (
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{space.description}</p>
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Amenities</h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {space.amenities.map((amenity, index) => {
                const IconComponent = amenityIcons[amenity] || CheckCircleIcon;
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-900 dark:text-white">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Bookings */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Today's Bookings
            </h3>

            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {/* {booking.organizer} • */} {booking.attendees} attendees
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(booking.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -
                        {new Date(booking.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No bookings scheduled for today.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Quick Stats</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Utilization Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">75%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  This Week's Bookings
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">18</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Average Duration</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">2.5 hours</span>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              System Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <ClockIcon className="mr-2 h-4 w-4" />
                  {new Date(space.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Updated
                </label>
                <div className="flex items-center text-sm text-gray-900 dark:text-white">
                  <ClockIcon className="mr-2 h-4 w-4" />
                  {new Date(space.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
