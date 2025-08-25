import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { spaceService, type Space as APISpace } from '@services/spaces';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="border-nova-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
  </div>
);

/*
// Local Space interface (unused - should use Space from types)
interface Space {
  id: string
  name: string
  type: string
  capacity: number
  location: string
  hourlyRate?: number
  amenities: string[]
  description: string
}
*/

interface BookingFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  attendees: number;
  recurring: boolean;
  recurrenceType: 'none' | 'daily' | 'weekly' | 'monthly';
  recurrenceEnd: string;
  setupTime: number;
  cleanupTime: number;
  cateringRequired: boolean;
  specialRequirements: string;
}

const timeSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
];

export default function BookingPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [space, setSpace] = useState<APISpace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [currentStep, setCurrentStep] = useState(1) // Unused
  const [formData, setFormData] = useState<BookingFormData>({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    title: '',
    description: '',
    attendees: 1,
    recurring: false,
    recurrenceType: 'none',
    recurrenceEnd: '',
    setupTime: 0,
    cleanupTime: 0,
    cateringRequired: false,
    specialRequirements: '',
  });

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
        const spaceData = await spaceService.getSpace(id);
        setSpace(spaceData);
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

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateDuration = () => {
    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);
    const diffMs = end.getTime() - start.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60)); // hours
  };

  /*
  const calculateTotalCost = () => { // Unused function
    // Note: hourlyRate not available in API Space type
    return 0
    // if (!space?.hourlyRate) return 0
    // const duration = calculateDuration()
    // const setupCleanupTime = (formData.setupTime + formData.cleanupTime) / 60 // convert minutes to hours
    // return (duration + setupCleanupTime) * space.hourlyRate
  }
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim()) {
      toast.error('Please enter a booking title');
      return;
    }

    if (formData.attendees > (space?.capacity || 0)) {
      toast.error(`Number of attendees cannot exceed room capacity (${space?.capacity})`);
      return;
    }

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);

    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Booking created successfully!');
      navigate(`/spaces/${id}`);
    } catch (_error) {
      toast.error('Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
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

  const duration = calculateDuration();
  // const totalCost = calculateTotalCost() // Unused

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/spaces/${id}`)}
          title="Back to Space Details"
          className="rounded-lg p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book {space.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {space.type} • {space.location}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Booking Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter event description"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      title="Start Date"
                      className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Time *
                    </label>
                    <select
                      required
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      title="Select Start Time"
                      className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={formData.startDate}
                      title="End Date"
                      className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Time *
                    </label>
                    <select
                      required
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      title="Select End Time"
                      className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of Attendees *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={space.capacity}
                    value={formData.attendees}
                    onChange={(e) => handleInputChange('attendees', parseInt(e.target.value) || 1)}
                    title="Number of Attendees"
                    className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Maximum capacity: {space.capacity} people
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                Additional Options
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Setup Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={formData.setupTime}
                      onChange={(e) =>
                        handleInputChange('setupTime', parseInt(e.target.value) || 0)
                      }
                      title="Setup Time in Minutes"
                      className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cleanup Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={formData.cleanupTime}
                      onChange={(e) =>
                        handleInputChange('cleanupTime', parseInt(e.target.value) || 0)
                      }
                      title="Cleanup Time in Minutes"
                      className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="catering"
                    type="checkbox"
                    checked={formData.cateringRequired}
                    onChange={(e) => handleInputChange('cateringRequired', e.target.checked)}
                    className="text-nova-600 focus:ring-nova-500 h-4 w-4 rounded border-gray-300 dark:border-gray-600"
                  />
                  <label
                    htmlFor="catering"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Catering required
                  </label>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Special Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={formData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Any special requirements or notes"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/spaces/${id}`)}
                className="rounded-lg bg-gray-100 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-nova-600 hover:bg-nova-700 focus:ring-nova-500 rounded-lg px-6 py-2 text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
              </button>
            </div>
          </form>
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          {/* Space Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Space Information
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <UserGroupIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Capacity: {space.capacity} people
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{space.location}</span>
              </div>

              {/* Note: hourlyRate not available in API Space type 
              {space.hourlyRate && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                  Note: hourlyRate not available in API Space type
              {space.hourlyRate && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="ml-2">
                      ${space.hourlyRate}/hour
                    </span>
                  </div>
                </div>
              )}
                  </span>
                </div>
              )}
              */}
            </div>

            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Available Amenities
              </h4>
              <div className="space-y-1">
                {space.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Booking Summary
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {duration.toFixed(1)} hours
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Attendees</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formData.attendees} people
                </span>
              </div>

              {(formData.setupTime > 0 || formData.cleanupTime > 0) && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Setup/Cleanup</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formData.setupTime + formData.cleanupTime} min
                  </span>
                </div>
              )}

              {/* Note: hourlyRate not available in API Space type */}
              {/* {space.hourlyRate && (
                <>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Total Cost
                    </span>
                    <span className="text-lg font-bold text-nova-600">
                      ${totalCost.toFixed(2)}
                    </span>
                  </div>
                </>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
