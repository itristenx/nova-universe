import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { spaceService, type SpaceStatus } from '@services/spaces'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  MapIcon
} from '@heroicons/react/24/outline'

// CSS for the SVG floor plan
const svgStyles = `
  .svg-floorplan {
    min-height: 400px;
    max-height: 600px;
  }
`

// Simple loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nova-600"></div>
  </div>
)

// Convert API status to local status format
const convertSpaceStatus = (apiStatus: SpaceStatus): 'available' | 'occupied' | 'maintenance' | 'reserved' => {
  switch (apiStatus) {
    case 'available':
      return 'available'
    case 'occupied':
      return 'occupied'
    case 'maintenance':
    case 'out_of_service':
      return 'maintenance'
    case 'reserved':
      return 'reserved'
    default:
      return 'available'
  }
}

interface FloorSpace {
  id: string
  name: string
  type: string
  capacity: number
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
}

interface FloorPlan {
  id: string
  name: string
  building: string
  floor: number
  spaces: FloorSpace[]
  dimensions: {
    width: number
    height: number
  }
}

const getStatusColor = (status: FloorSpace['status']) => {
  switch (status) {
    case 'available':
      return 'fill-green-200 stroke-green-500 dark:fill-green-800 dark:stroke-green-400'
    case 'occupied':
      return 'fill-red-200 stroke-red-500 dark:fill-red-800 dark:stroke-red-400'
    case 'maintenance':
      return 'fill-yellow-200 stroke-yellow-500 dark:fill-yellow-800 dark:stroke-yellow-400'
    case 'reserved':
      return 'fill-blue-200 stroke-blue-500 dark:fill-blue-800 dark:stroke-blue-400'
    default:
      return 'fill-gray-200 stroke-gray-500 dark:fill-gray-800 dark:stroke-gray-400'
  }
}

const getStatusIcon = (status: FloorSpace['status']) => {
  switch (status) {
    case 'available':
      return CheckCircleIcon
    case 'occupied':
      return XCircleIcon
    case 'maintenance':
      return ExclamationTriangleIcon
    case 'reserved':
      return ClockIcon
    default:
      return CheckCircleIcon
  }
}

export default function FloorPlanPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([])
  const [selectedFloor, setSelectedFloor] = useState<FloorPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSpace, setSelectedSpace] = useState<FloorSpace | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const fetchFloorPlans = async () => {
      try {
        setIsLoading(true)
        
        // Get all spaces from the API
        const spacesResponse = await spaceService.getSpaces()
        const spaces = spacesResponse.data
        
        // Group spaces by building and floor to create floor plans
        const floorPlanMap = new Map<string, FloorPlan>()
        
        spaces.forEach(space => {
          const key = `${space.building}-${space.floor}`
          
          if (!floorPlanMap.has(key)) {
            floorPlanMap.set(key, {
              id: key,
              name: `${space.building} - Floor ${space.floor}`,
              building: space.building,
              floor: parseInt(space.floor),
              dimensions: { width: 800, height: 600 }, // Default dimensions
              spaces: []
            })
          }
          
          const floorPlan = floorPlanMap.get(key)!
          floorPlan.spaces.push({
            id: space.id,
            name: space.name,
            type: space.type,
            capacity: space.capacity,
            status: convertSpaceStatus(space.status),
            // For demo purposes, generate coordinates based on index
            x: (floorPlan.spaces.length % 4) * 200 + 50,
            y: Math.floor(floorPlan.spaces.length / 4) * 150 + 50,
            width: space.type === 'phone_booth' ? 40 : space.type === 'office' ? 80 : 120,
            height: space.type === 'phone_booth' ? 40 : 80
          })
        })
        
        const floorPlansArray = Array.from(floorPlanMap.values())
        setFloorPlans(floorPlansArray)
        
        // Set initial floor based on URL params or default to first floor
        const floorParam = searchParams.get('floor')
        let initialFloor: FloorPlan | null = null
        if (floorParam) {
          initialFloor = floorPlansArray.find(f => f.id === floorParam) || null
        }
        if (!initialFloor && floorPlansArray.length > 0) {
          initialFloor = floorPlansArray[0] || null
        }
        setSelectedFloor(initialFloor)
        
      } catch (error) {
        console.error('Failed to fetch floor plans:', error)
        // Keep empty array instead of falling back to mock data
      } finally {
        setIsLoading(false)
      }
    }

    fetchFloorPlans()
  }, [searchParams])

  const handleFloorChange = (floorId: string) => {
    const floor = floorPlans.find(f => f.id === floorId)
    if (floor) {
      setSelectedFloor(floor)
      setSearchParams({ floor: floorId })
      setSelectedSpace(null)
    }
  }

  const handleSpaceClick = (space: FloorSpace) => {
    setSelectedSpace(space)
  }

  const handleSpaceDetail = (space: FloorSpace) => {
    navigate(`/spaces/${space.id}`)
  }

  const handleBookSpace = (space: FloorSpace) => {
    navigate(`/spaces/${space.id}/book`)
  }

  const filteredSpaces = selectedFloor?.spaces.filter(space => {
    const matchesSearch = searchTerm === '' || 
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || space.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Add CSS styles */}
      <style>{svgStyles}</style>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-nova-100 dark:bg-nova-900 rounded-lg">
            <MapIcon className="h-6 w-6 text-nova-600 dark:text-nova-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Floor Plans
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Interactive space management and booking system
            </p>
          </div>
        </div>

        {/* Floor Selector */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Floor:
          </label>
          <select
            value={selectedFloor?.id || ''}
            onChange={(e) => handleFloorChange(e.target.value)}
            title="Select Floor"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nova-500 focus:border-transparent"
          >
            {floorPlans.map(floor => (
              <option key={floor.id} value={floor.id}>
                {floor.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search spaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nova-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter by Status"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-nova-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Reserved">Reserved</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Floor Plan Visualization */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            {selectedFloor && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedFloor.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {selectedFloor.building}
                    </span>
                    <span>Floor {selectedFloor.floor}</span>
                  </div>
                </div>

                {/* SVG Floor Plan */}
                <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                  <svg
                    viewBox={`0 0 ${selectedFloor.dimensions.width} ${selectedFloor.dimensions.height}`}
                    className="w-full h-auto svg-floorplan"
                  >
                    {/* Background grid */}
                    <defs>
                      <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Spaces */}
                    {filteredSpaces.map((space) => {
                      const isSelected = selectedSpace?.id === space.id
                      
                      return (
                        <g key={space.id}>
                          {/* Space rectangle */}
                          <rect
                            x={space.x}
                            y={space.y}
                            width={space.width}
                            height={space.height}
                            className={`${getStatusColor(space.status)} cursor-pointer transition-all duration-200 ${
                              isSelected ? 'stroke-[3] opacity-100' : 'stroke-[2] opacity-90'
                            } hover:opacity-100 hover:stroke-[3]`}
                            onClick={() => handleSpaceClick(space)}
                          />
                          
                          {/* Space label */}
                          <text
                            x={space.x + space.width / 2}
                            y={space.y + space.height / 2 - 8}
                            textAnchor="middle"
                            className="fill-gray-800 dark:fill-gray-200 text-xs font-medium pointer-events-none"
                          >
                            {space.name}
                          </text>
                          
                          {/* Capacity info */}
                          <text
                            x={space.x + space.width / 2}
                            y={space.y + space.height / 2 + 6}
                            textAnchor="middle"
                            className="fill-gray-600 dark:fill-gray-400 text-xs pointer-events-none"
                          >
                            {space.capacity} people
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 text-sm">
                  {[
                    { status: 'Available', color: 'bg-green-200 border-green-500' },
                    { status: 'Occupied', color: 'bg-red-200 border-red-500' },
                    { status: 'Reserved', color: 'bg-blue-200 border-blue-500' },
                    { status: 'Maintenance', color: 'bg-yellow-200 border-yellow-500' }
                  ].map(({ status, color }) => (
                    <div key={status} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border-2 ${color}`}></div>
                      <span className="text-gray-600 dark:text-gray-400">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Space Details Sidebar */}
        <div className="space-y-6">
          {selectedSpace ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Space Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {selectedSpace.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedSpace.type}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Capacity: {selectedSpace.capacity} people
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {(() => {
                    const StatusIcon = getStatusIcon(selectedSpace.status)
                    return <StatusIcon className="h-4 w-4 text-gray-400" />
                  })()}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Status: {selectedSpace.status}
                  </span>
                </div>

                <div className="flex flex-col space-y-2 pt-4">
                  <button
                    onClick={() => handleSpaceDetail(selectedSpace)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  
                  {selectedSpace.status === 'available' && (
                    <button
                      onClick={() => handleBookSpace(selectedSpace)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-nova-600 border border-transparent rounded-lg hover:bg-nova-700"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Book Space
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Space Details
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click on a space in the floor plan to view details.
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Floor Statistics
            </h3>
            
            {selectedFloor && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Spaces</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFloor.spaces.length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Available</span>
                  <span className="text-sm font-medium text-green-600">
                    {selectedFloor.spaces.filter(s => s.status === 'available').length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Occupied</span>
                  <span className="text-sm font-medium text-red-600">
                    {selectedFloor.spaces.filter(s => s.status === 'occupied').length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Capacity</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedFloor.spaces.reduce((sum, space) => sum + space.capacity, 0)} people
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
