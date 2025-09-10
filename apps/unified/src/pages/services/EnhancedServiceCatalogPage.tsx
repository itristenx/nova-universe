/**
 * Enhanced Apple-style Service Catalog
 * Professional service request interface following Apple design principles
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  ComputerDesktopIcon,
  WifiIcon,
  KeyIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { GlassCard } from '@components/common/GlassCard';
import { AppleButton } from '@components/common/AppleButton';
import { AppleInput } from '@components/common/AppleInput';
import { cn, cardHoverEffect } from '@utils/apple-utils';
import { fadeInAnimation } from '@utils/apple-utils';

// Service catalog item type
interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  estimatedTime: string;
  popularity: number;
  rating: number;
  price?: string;
  tags: string[];
  featured?: boolean;
}

// Service categories with Apple-style icons and colors
const serviceCategories = [
  {
    id: 'hardware',
    name: 'Hardware',
    icon: <ComputerDesktopIcon className="h-6 w-6" />,
    color: 'blue',
    description: 'Computers, phones, and equipment'
  },
  {
    id: 'software',
    name: 'Software',
    icon: <RocketLaunchIcon className="h-6 w-6" />,
    color: 'purple',
    description: 'Applications and licenses'
  },
  {
    id: 'access',
    name: 'Access & Security', 
    icon: <KeyIcon className="h-6 w-6" />,
    color: 'green',
    description: 'Accounts and permissions'
  },
  {
    id: 'network',
    name: 'Network',
    icon: <WifiIcon className="h-6 w-6" />,
    color: 'orange',
    description: 'Connectivity and communication'
  },
  {
    id: 'facilities',
    name: 'Facilities',
    icon: <BuildingOfficeIcon className="h-6 w-6" />,
    color: 'red',
    description: 'Office space and amenities'
  },
  {
    id: 'training',
    name: 'Training',
    icon: <AcademicCapIcon className="h-6 w-6" />,
    color: 'indigo',
    description: 'Learning and development'
  }
];

// Mock service items
const serviceItems: ServiceItem[] = [
  {
    id: '1',
    name: 'New Laptop Setup',
    description: 'Request a new laptop with standard software configuration',
    category: 'hardware',
    icon: <ComputerDesktopIcon className="h-8 w-8" />,
    estimatedTime: '2-3 business days',
    popularity: 95,
    rating: 4.8,
    tags: ['laptop', 'hardware', 'setup'],
    featured: true
  },
  {
    id: '2',
    name: 'Software License Request',
    description: 'Request access to licensed software applications',
    category: 'software',
    icon: <RocketLaunchIcon className="h-8 w-8" />,
    estimatedTime: '1-2 business days',
    popularity: 87,
    rating: 4.6,
    tags: ['software', 'license', 'access']
  },
  {
    id: '3',
    name: 'VPN Access Setup',
    description: 'Configure secure remote access to company network',
    category: 'network',
    icon: <ShieldCheckIcon className="h-8 w-8" />,
    estimatedTime: '4-6 hours',
    popularity: 92,
    rating: 4.9,
    tags: ['vpn', 'remote', 'security'],
    featured: true
  },
  {
    id: '4',
    name: 'Office Space Request',
    description: 'Request desk assignment or office relocation',
    category: 'facilities',
    icon: <BuildingOfficeIcon className="h-8 w-8" />,
    estimatedTime: '1-2 weeks',
    popularity: 73,
    rating: 4.4,
    tags: ['office', 'desk', 'relocation']
  },
  {
    id: '5',
    name: 'Account Creation',
    description: 'Create new user account with appropriate permissions',
    category: 'access',
    icon: <KeyIcon className="h-8 w-8" />,
    estimatedTime: '2-4 hours',
    popularity: 89,
    rating: 4.7,
    tags: ['account', 'user', 'permissions']
  },
  {
    id: '6',
    name: 'Training Course Enrollment',
    description: 'Enroll in professional development courses',
    category: 'training',
    icon: <AcademicCapIcon className="h-8 w-8" />,
    estimatedTime: 'Immediate',
    popularity: 68,
    rating: 4.5,
    tags: ['training', 'learning', 'development']
  }
];

export default function EnhancedServiceCatalogPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let filtered = serviceItems.filter(service => {
      const matchesSearch = searchQuery === '' || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [serviceItems, searchQuery, selectedCategory, sortBy]);

  const featuredServices = serviceItems.filter(service => service.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8" {...fadeInAnimation()}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Service Catalog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Request services, software, hardware, and access with just a few clicks. 
            Everything you need for productive work.
          </p>
        </div>

        {/* Featured Services */}
        {featuredServices.length > 0 && (
          <div className="mb-12" {...fadeInAnimation(0.1)}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <StarIcon className="h-6 w-6 text-yellow-500" />
              Featured Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <GlassCard
                  key={service.id}
                  intensity="medium"
                  hover="strong"
                  padding="lg"
                  className={cn(
                    cardHoverEffect('strong'),
                    'cursor-pointer relative overflow-hidden'
                  )}
                  onClick={() => navigate(`/services/${service.id}/request`)}
                >
                  {/* Featured Badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Featured
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                      {service.icon}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{service.estimatedTime}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <span>{service.rating}</span>
                      </div>
                    </div>

                    <AppleButton size="sm" className="w-full">
                      Request Now
                    </AppleButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="mb-8" {...fadeInAnimation(0.2)}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'p-4 rounded-2xl border-2 text-center transition-all duration-200',
                'hover:scale-105 hover:shadow-lg',
                selectedCategory === 'all'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center text-white">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-gray-900">All Services</span>
            </button>

            {serviceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'p-4 rounded-2xl border-2 text-center transition-all duration-200',
                  'hover:scale-105 hover:shadow-lg',
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-white',
                  category.color === 'blue' && 'bg-gradient-to-r from-blue-500 to-blue-600',
                  category.color === 'purple' && 'bg-gradient-to-r from-purple-500 to-purple-600',
                  category.color === 'green' && 'bg-gradient-to-r from-green-500 to-green-600',
                  category.color === 'orange' && 'bg-gradient-to-r from-orange-500 to-orange-600',
                  category.color === 'red' && 'bg-gradient-to-r from-red-500 to-red-600',
                  category.color === 'indigo' && 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                )}>
                  {category.icon}
                </div>
                <span className="text-sm font-semibold text-gray-900 block">{category.name}</span>
                <span className="text-xs text-gray-500">{category.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <GlassCard intensity="medium" hover={false} padding="md" className="mb-6" {...fadeInAnimation(0.3)}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <AppleInput
                placeholder="Search services by name, description, or tags..."
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="glass"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={cn(
                  'px-4 py-3 bg-white/90 backdrop-blur-sm',
                  'border border-gray-200 rounded-xl',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200 ease-out'
                )}
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" {...fadeInAnimation(0.4)}>
          {filteredServices.map((service, index) => (
            <GlassCard
              key={service.id}
              intensity="medium"
              hover="medium"
              padding="lg"
              className={cn(
                cardHoverEffect('medium'),
                'cursor-pointer h-full flex flex-col'
              )}
              onClick={() => navigate(`/services/${service.id}/request`)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-white',
                    'bg-gradient-to-r from-blue-500 to-purple-600'
                  )}>
                    {service.icon}
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold">{service.rating}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {service.popularity}% popular
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                  {service.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <ClockIcon className="h-4 w-4" />
                  <span>{service.estimatedTime}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {service.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <AppleButton size="sm" className="w-full mt-auto">
                Request Service
              </AppleButton>
            </GlassCard>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <GlassCard intensity="medium" hover={false} padding="xl" className="text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or browse different categories.
              </p>
              <AppleButton
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Show All Services
              </AppleButton>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}