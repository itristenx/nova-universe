import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  CogIcon,
  BuildingOfficeIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'

// Types
interface ServiceItem {
  id: string
  name: string
  description: string
  category: string
  icon: React.ReactNode
  estimatedTime: string
  popularity: number
  featured: boolean
  tags: string[]
  department: string
  requestCount: number
  averageRating: number
  lastUpdated: string
}

interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  itemCount: number
  color: string
}

export default function ServiceCatalogPage() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'rating' | 'recent'>('popularity')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCatalogData = async () => {
      setLoading(true)

      try {
        // Fetch from API
        const response = await fetch('/api/services/catalog')
        if (response.ok) {
          const data = await response.json()
          setServices(data.services || [])
          setCategories(data.categories || [])
        } else {
          // Fallback to empty state if API fails
          setServices([])
          setCategories([])
        }
      } catch (error) {
        console.warn('Services catalog API unavailable, using fallback data:', error)
        // Fallback to empty state
        setServices([])
        setCategories([])
      }

      setLoading(false)
    }

    loadCatalogData()
  }, [])

  // Filter and sort services
  useEffect(() => {
    let filtered = services

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort services
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'popularity':
          return b.popularity - a.popularity
        case 'rating':
          return b.averageRating - a.averageRating
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })

    setFilteredServices(filtered)
  }, [services, selectedCategory, searchQuery, sortBy])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Service Catalog</h1>
          <p className="text-purple-100">Browse and request IT services, hardware, and support</p>
        </div>
        <div className="absolute right-4 top-4 opacity-20">
          <BuildingOfficeIcon className="h-24 w-24" />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services, hardware, software..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <label htmlFor="sort-select" className="sr-only">Sort services by</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Recently Updated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              selectedCategory === 'all'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <div className="flex justify-center mb-2">
              <CogIcon className="h-6 w-6" />
            </div>
            <div className="font-medium">All Services</div>
            <div className="text-sm text-gray-500">{services.length} items</div>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                selectedCategory === category.id
                  ? `border-blue-500 ${category.color}`
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex justify-center mb-2">
                {category.icon}
              </div>
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-gray-500">{category.itemCount} items</div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Services */}
      {selectedCategory === 'all' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Featured Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.filter(service => service.featured).map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="group relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-700 p-6 hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="absolute top-2 right-2">
                  <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    <StarIcon className="h-3 w-3 fill-current" />
                    <span>Featured</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                    {service.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{service.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(service.averageRating)}
                        <span className="ml-1">({service.requestCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Services */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedCategory === 'all' ? 'All Services' : categories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {service.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {service.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-3 w-3" />
                          <span>{service.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-3 w-3" />
                          <span>{service.department}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(service.averageRating)}
                          <span className="ml-1">({service.requestCount})</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {service.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Link
                      to={`/tickets/new?service=${service.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Request
                    </Link>
                    <Link
                      to={`/services/${service.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
