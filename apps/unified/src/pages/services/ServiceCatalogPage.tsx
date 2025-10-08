import { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  RectangleStackIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import backendAPI from '../../services/backend-api-client';

const ServiceCatalogPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for backend data
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [popularServices, setPopularServices] = useState<any[]>([]);
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  // Fetch services data on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all services data in parallel
        const [featured, popular, cats, status] = await Promise.all([
          backendAPI.services.getFeatured(),
          backendAPI.services.getPopular(),
          backendAPI.services.getCategories(),
          backendAPI.services.getStatus(),
        ]);
        
        setFeaturedServices(featured);
        setPopularServices(popular);
        // Transform categories array of strings to array of objects
        const categoryObjects = cats.map((name: string) => ({ name, count: 0 }));
        setCategories(categoryObjects);
        setServiceStatus(status);
      } catch (err: any) {
        console.error('Error fetching service catalog:', err);
        setError(err.message || 'Failed to load services');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Filter services based on search
  const filteredServices = popularServices.filter(service =>
    service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPERATIONAL':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'DEGRADED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'OUTAGE':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPERATIONAL':
        return 'text-green-600 dark:text-green-400';
      case 'DEGRADED':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'OUTAGE':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Error Loading Service Catalog</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Catalog</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Browse and request IT services
          </p>
        </div>
        {serviceStatus && (
          <div className="flex items-center gap-2">
            {getStatusIcon(serviceStatus.overallStatus)}
            <span className={`text-sm font-medium ${getStatusColor(serviceStatus.overallStatus)}`}>
              System {serviceStatus.overallStatus}
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <MagnifyingGlassIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="focus:ring-nova-500 w-full rounded-lg border border-gray-300 py-3 pr-4 pl-12 text-lg focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <RectangleStackIcon className="h-5 w-5" />
            Categories
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category: any) => (
              <div
                key={category.name}
                className="cursor-pointer rounded-lg border border-gray-200 p-4 text-center transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{category.count} services</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Services */}
      {featuredServices.length > 0 && !searchQuery && (
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <StarIcon className="h-5 w-5" />
            Featured Services
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((service: any) => (
              <div
                key={service.id}
                className="cursor-pointer rounded-lg border-2 border-nova-200 dark:border-nova-800 p-4 transition-all hover:shadow-md hover:border-nova-400 dark:hover:border-nova-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{service.name}</h3>
                  <StarSolidIcon className="h-5 w-5 text-nova-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{service.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {service.category}
                  </span>
                  {service.type && (
                    <span className="text-gray-500 dark:text-gray-400">{service.type}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Services / Search Results */}
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          {searchQuery ? 'Search Results' : 'All Services'}
        </h2>
        {filteredServices.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <RectangleStackIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{searchQuery ? 'No services found' : 'No services available'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service: any) => (
              <div
                key={service.id}
                className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <h3 className="font-medium text-gray-900 dark:text-white hover:text-nova-600 dark:hover:text-nova-400">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {service.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {service.category}
                  </span>
                  {service.isActive ? (
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCatalogPage;
