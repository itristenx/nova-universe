import { useState, useEffect } from 'react'
import {
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'

interface Space {
  id: string
  name: string
  type: 'office' | 'meeting_room' | 'desk' | 'common_area'
  capacity: number
  floor: string
  building: string
  isAvailable: boolean
  nextBooking?: {
    time: string
    duration: string
    bookedBy: string
  }
  amenities: string[]
}

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterFloor, setFilterFloor] = useState<string>('')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSpaces([
        {
          id: '1',
          name: 'Conference Room A',
          type: 'meeting_room',
          capacity: 12,
          floor: '2nd Floor',
          building: 'Main Building',
          isAvailable: true,
          amenities: ['Projector', 'Whiteboard', 'Video Conference']
        },
        {
          id: '2',
          name: 'Hot Desk Station 1',
          type: 'desk',
          capacity: 1,
          floor: '1st Floor',
          building: 'Main Building',
          isAvailable: false,
          nextBooking: {
            time: '10:00 AM',
            duration: '4 hours',
            bookedBy: 'John Smith'
          },
          amenities: ['Monitor', 'Ethernet', 'Power Outlet']
        },
        {
          id: '3',
          name: 'Break Room',
          type: 'common_area',
          capacity: 20,
          floor: '1st Floor',
          building: 'Main Building',
          isAvailable: true,
          amenities: ['Kitchen', 'Coffee Machine', 'Microwave', 'Seating']
        },
        {
          id: '4',
          name: 'Executive Office',
          type: 'office',
          capacity: 4,
          floor: '3rd Floor',
          building: 'Main Building',
          isAvailable: true,
          amenities: ['Private Bathroom', 'Executive Desk', 'Meeting Table']
        },
        {
          id: '5',
          name: 'Training Room B',
          type: 'meeting_room',
          capacity: 24,
          floor: '2nd Floor',
          building: 'Main Building',
          isAvailable: false,
          nextBooking: {
            time: '2:00 PM',
            duration: '2 hours',
            bookedBy: 'Marketing Team'
          },
          amenities: ['Large Screen', 'Audio System', 'Flipchart']
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.floor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === '' || space.type === filterType
    const matchesFloor = filterFloor === '' || space.floor === filterFloor
    
    return matchesSearch && matchesType && matchesFloor
  })

  const getSpaceTypeIcon = (type: string) => {
    switch (type) {
      case 'office': return BuildingOfficeIcon
      case 'meeting_room': return UserGroupIcon
      case 'desk': return MapPinIcon
      case 'common_area': return BuildingOfficeIcon
      default: return BuildingOfficeIcon
    }
  }

  const getSpaceTypeLabel = (type: string) => {
    switch (type) {
      case 'office': return 'Office'
      case 'meeting_room': return 'Meeting Room'
      case 'desk': return 'Desk'
      case 'common_area': return 'Common Area'
      default: return type
    }
  }

  const getSpaceTypeColor = (type: string) => {
    switch (type) {
      case 'office': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'meeting_room': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'desk': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'common_area': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Space Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and book office spaces, meeting rooms, and workstations
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-nova-600 text-white text-sm font-medium rounded-lg hover:bg-nova-700 focus:outline-none focus:ring-2 focus:ring-nova-500 focus:ring-offset-2 transition-colors">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Space
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spaces</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {spaces.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {spaces.filter(s => s.isAvailable).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Booked</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {spaces.filter(s => !s.isAvailable).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPinIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Capacity</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {spaces.reduce((sum, space) => sum + space.capacity, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search spaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-nova-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filter by space type"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-nova-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="office">Offices</option>
            <option value="meeting_room">Meeting Rooms</option>
            <option value="desk">Desks</option>
            <option value="common_area">Common Areas</option>
          </select>
          <select
            value={filterFloor}
            onChange={(e) => setFilterFloor(e.target.value)}
            aria-label="Filter by floor"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-nova-500 focus:border-transparent"
          >
            <option value="">All Floors</option>
            <option value="1st Floor">1st Floor</option>
            <option value="2nd Floor">2nd Floor</option>
            <option value="3rd Floor">3rd Floor</option>
          </select>
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpaces.map((space) => {
          const IconComponent = getSpaceTypeIcon(space.type)
          return (
            <div
              key={space.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <IconComponent className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {space.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {space.building} • {space.floor}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSpaceTypeColor(space.type)}`}>
                  {getSpaceTypeLabel(space.type)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Capacity:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {space.capacity} {space.capacity === 1 ? 'person' : 'people'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
                  <span className={`text-sm font-medium ${
                    space.isAvailable 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {space.isAvailable ? 'Available' : 'Occupied'}
                  </span>
                </div>

                {space.nextBooking && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Next Booking
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-300">
                      {space.nextBooking.time} • {space.nextBooking.duration}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-300">
                      by {space.nextBooking.bookedBy}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {space.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button className="inline-flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </button>
                <button className="inline-flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  className={`inline-flex items-center px-3 py-1 text-sm rounded transition-colors ${
                    space.isAvailable
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  }`}
                  disabled={!space.isAvailable}
                >
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {space.isAvailable ? 'Book' : 'Booked'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredSpaces.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No spaces found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}