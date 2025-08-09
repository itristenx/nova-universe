'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Search, 
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Grid,
  List,
  Filter,
  Bookmark,
  ArrowRight,
  ShoppingCart,
  Shield,
  Monitor,
  Smartphone,
  Wifi,
  Key,
  FileText,
  Building,
  Settings,
  Heart,
  Tag,
  DollarSign,
  TrendingUp
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Types
interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  icon: React.ReactNode;
  estimatedTime: string;
  sla: string;
  cost: number;
  costType: 'free' | 'one-time' | 'monthly' | 'per-use';
  availability: 'available' | 'limited' | 'unavailable';
  popularity: number;
  rating: number;
  totalRequests: number;
  approvalRequired: boolean;
  tags: string[];
  requirements: string[];
  isBookmarked: boolean;
  isFavorite: boolean;
  lastUpdated: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  serviceCount: number;
}

interface SearchFilters {
  category: string;
  availability: string;
  approvalRequired: string;
  costType: string;
  sortBy: 'popularity' | 'rating' | 'name' | 'recent';
  sortOrder: 'asc' | 'desc';
}

// Search schema
const searchSchema = z.object({
  query: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function EnhancedServiceCatalog() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    availability: '',
    approvalRequired: '',
    costType: '',
    sortBy: 'popularity',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<string[]>([]);

  // Form management
  const { register, handleSubmit, watch } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
    }
  });

  const watchedQuery = watch('query');

  // Mock data
  useEffect(() => {
    const mockCategories: ServiceCategory[] = [
      {
        id: 'hardware',
        name: 'Hardware',
        description: 'Computer equipment and devices',
        icon: <Monitor className="w-6 h-6" />,
        color: 'bg-blue-100 text-blue-800',
        serviceCount: 12
      },
      {
        id: 'software',
        name: 'Software',
        description: 'Applications and licenses',
        icon: <Settings className="w-6 h-6" />,
        color: 'bg-green-100 text-green-800',
        serviceCount: 25
      },
      {
        id: 'access',
        name: 'Access & Security',
        description: 'Permissions and authentication',
        icon: <Key className="w-6 h-6" />,
        color: 'bg-purple-100 text-purple-800',
        serviceCount: 8
      },
      {
        id: 'network',
        name: 'Network',
        description: 'Connectivity and infrastructure',
        icon: <Wifi className="w-6 h-6" />,
        color: 'bg-orange-100 text-orange-800',
        serviceCount: 6
      },
      {
        id: 'facilities',
        name: 'Facilities',
        description: 'Office space and resources',
        icon: <Building className="w-6 h-6" />,
        color: 'bg-pink-100 text-pink-800',
        serviceCount: 9
      }
    ];

    const mockServices: ServiceItem[] = [
      {
        id: '1',
        name: 'New Laptop Request',
        description: 'Request a new laptop for work with standard software configuration',
        category: 'hardware',
        subcategory: 'computers',
        icon: <Monitor className="w-8 h-8" />,
        estimatedTime: '3-5 business days',
        sla: '5 days',
        cost: 1200,
        costType: 'one-time',
        availability: 'available',
        popularity: 95,
        rating: 4.8,
        totalRequests: 234,
        approvalRequired: true,
        tags: ['laptop', 'hardware', 'computer'],
        requirements: ['Manager approval', 'Asset return form'],
        isBookmarked: true,
        isFavorite: false,
        lastUpdated: '2024-01-15'
      },
      {
        id: '2',
        name: 'Microsoft Office License',
        description: 'Access to Microsoft Office suite including Word, Excel, PowerPoint',
        category: 'software',
        subcategory: 'productivity',
        icon: <FileText className="w-8 h-8" />,
        estimatedTime: '1-2 hours',
        sla: '4 hours',
        cost: 12,
        costType: 'monthly',
        availability: 'available',
        popularity: 87,
        rating: 4.6,
        totalRequests: 456,
        approvalRequired: false,
        tags: ['office', 'productivity', 'software'],
        requirements: ['Valid employee ID'],
        isBookmarked: false,
        isFavorite: true,
        lastUpdated: '2024-01-10'
      },
      {
        id: '3',
        name: 'VPN Access',
        description: 'Secure remote access to company network and resources',
        category: 'access',
        subcategory: 'remote-access',
        icon: <Shield className="w-8 h-8" />,
        estimatedTime: '30 minutes',
        sla: '2 hours',
        cost: 0,
        costType: 'free',
        availability: 'available',
        popularity: 78,
        rating: 4.4,
        totalRequests: 189,
        approvalRequired: false,
        tags: ['vpn', 'remote', 'security'],
        requirements: ['Security training completion'],
        isBookmarked: true,
        isFavorite: true,
        lastUpdated: '2024-01-20'
      },
      {
        id: '4',
        name: 'Mobile Device Setup',
        description: 'Configuration of work phone or tablet with corporate apps',
        category: 'hardware',
        subcategory: 'mobile',
        icon: <Smartphone className="w-8 h-8" />,
        estimatedTime: '2-3 hours',
        sla: '1 day',
        cost: 500,
        costType: 'one-time',
        availability: 'limited',
        popularity: 65,
        rating: 4.2,
        totalRequests: 123,
        approvalRequired: true,
        tags: ['mobile', 'phone', 'tablet'],
        requirements: ['Department head approval', 'Data plan selection'],
        isBookmarked: false,
        isFavorite: false,
        lastUpdated: '2024-01-12'
      },
      {
        id: '5',
        name: 'Parking Space Assignment',
        description: 'Reserved parking space in company garage',
        category: 'facilities',
        subcategory: 'parking',
        icon: <Building className="w-8 h-8" />,
        estimatedTime: '1-2 days',
        sla: '3 days',
        cost: 50,
        costType: 'monthly',
        availability: 'limited',
        popularity: 42,
        rating: 3.9,
        totalRequests: 67,
        approvalRequired: true,
        tags: ['parking', 'facilities', 'garage'],
        requirements: ['Seniority level 3+', 'Valid driver license'],
        isBookmarked: false,
        isFavorite: false,
        lastUpdated: '2024-01-08'
      },
      {
        id: '6',
        name: 'Database Access Request',
        description: 'Read/write access to specific databases for development',
        category: 'access',
        subcategory: 'database',
        icon: <Key className="w-8 h-8" />,
        estimatedTime: '4-6 hours',
        sla: '1 day',
        cost: 0,
        costType: 'free',
        availability: 'available',
        popularity: 71,
        rating: 4.5,
        totalRequests: 145,
        approvalRequired: true,
        tags: ['database', 'development', 'access'],
        requirements: ['Technical lead approval', 'Security clearance'],
        isBookmarked: false,
        isFavorite: false,
        lastUpdated: '2024-01-18'
      }
    ];

    setCategories(mockCategories);
    setServices(mockServices);
    setFilteredServices(mockServices);
  }, []);

  // Search and filter functionality
  useEffect(() => {
    let result = [...services];

    // Apply search query
    if (watchedQuery && watchedQuery.length > 0) {
      result = result.filter(service =>
        service.name.toLowerCase().includes(watchedQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(watchedQuery.toLowerCase()) ||
        service.tags.some(tag => tag.toLowerCase().includes(watchedQuery.toLowerCase()))
      );
    }

    // Apply category filter
    if (filters.category || activeCategory) {
      const categoryFilter = filters.category || activeCategory;
      result = result.filter(s => s.category === categoryFilter);
    }

    // Apply availability filter
    if (filters.availability) {
      result = result.filter(s => s.availability === filters.availability);
    }

    // Apply approval filter
    if (filters.approvalRequired !== '') {
      const requiresApproval = filters.approvalRequired === 'true';
      result = result.filter(s => s.approvalRequired === requiresApproval);
    }

    // Apply cost type filter
    if (filters.costType) {
      result = result.filter(s => s.costType === filters.costType);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'popularity':
          comparison = b.popularity - a.popularity;
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'recent':
          comparison = new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
          break;
      }
      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    setFilteredServices(result);
  }, [watchedQuery, filters, activeCategory, services]);

  const handleSearch = () => {
    // Search is handled by the useEffect
  };

  const toggleBookmark = (serviceId: string) => {
    setServices(prev => prev.map(service =>
      service.id === serviceId
        ? { ...service, isBookmarked: !service.isBookmarked }
        : service
    ));
  };

  const toggleFavorite = (serviceId: string) => {
    setServices(prev => prev.map(service =>
      service.id === serviceId
        ? { ...service, isFavorite: !service.isFavorite }
        : service
    ));
  };

  const addToCart = (serviceId: string) => {
    if (!cart.includes(serviceId)) {
      setCart(prev => [...prev, serviceId]);
    }
  };

  const removeFromCart = (serviceId: string) => {
    setCart(prev => prev.filter(id => id !== serviceId));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'limited':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'limited':
        return <AlertCircle className="w-4 h-4" />;
      case 'unavailable':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatCost = (cost: number, costType: string) => {
    if (cost === 0) return 'Free';
    const formatted = `$${cost}`;
    switch (costType) {
      case 'monthly':
        return `${formatted}/mo`;
      case 'per-use':
        return `${formatted}/use`;
      default:
        return formatted;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          Service Catalog
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse and request services, access, and resources you need to get your work done
        </p>
        {cart.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge variant="default" className="px-3 py-1">
              {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
            </Badge>
            <Button size="sm" variant="outline">
              View Cart
            </Button>
          </div>
        )}
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeCategory === '' ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setActiveCategory('')}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Grid className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold">All Services</h3>
                <p className="text-sm text-muted-foreground">{services.length} total</p>
              </CardContent>
            </Card>
            
            {categories.map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeCategory === category.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.serviceCount} services</p>
                  <Badge className={category.color} variant="secondary">
                    {category.description}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(handleSearch)} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                {...register('query')}
                placeholder="Search services, access, software..."
                className="pl-10 pr-4 py-3"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <div className="flex items-center gap-2 ml-auto">
                <Label className="text-sm">View:</Label>
                <Button
                  type="button"
                  variant={viewMode === 'grid' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Availability</Label>
                  <Select value={filters.availability} onValueChange={(value) => setFilters(f => ({ ...f, availability: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Approval Required</Label>
                  <Select value={filters.approvalRequired} onValueChange={(value) => setFilters(f => ({ ...f, approvalRequired: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="false">No Approval</SelectItem>
                      <SelectItem value="true">Approval Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Cost Type</Label>
                  <Select value={filters.costType} onValueChange={(value) => setFilters(f => ({ ...f, costType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="per-use">Per Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select value={filters.sortBy} onValueChange={(value: 'popularity' | 'rating' | 'name' | 'recent') => setFilters(f => ({ ...f, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="recent">Recently Updated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Services Grid/List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeCategory 
              ? `${categories.find(c => c.id === activeCategory)?.name || 'Category'} Services`
              : 'All Services'
            }
            <Badge variant="secondary" className="ml-2">
              {filteredServices.length} services
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                No services found matching your criteria.
              </div>
              <Button variant="outline" onClick={() => {
                setFilters({
                  category: '',
                  availability: '',
                  approvalRequired: '',
                  costType: '',
                  sortBy: 'popularity',
                  sortOrder: 'desc'
                });
                setActiveCategory('');
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {filteredServices.map((service) => (
                <Card key={service.id} className={`hover:shadow-lg transition-all ${viewMode === 'list' ? 'flex' : ''}`}>
                  <CardContent className={viewMode === 'list' ? "flex items-center p-4 space-x-4 flex-1" : "p-4"}>
                    {viewMode === 'list' && (
                      <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                        {service.icon}
                      </div>
                    )}
                    
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {viewMode === 'grid' && (
                            <div className="p-2 bg-muted rounded-lg">
                              {service.icon}
                            </div>
                          )}
                          <div>
                            <Badge className={getAvailabilityColor(service.availability)}>
                              {getAvailabilityIcon(service.availability)}
                              <span className="ml-1 capitalize">{service.availability}</span>
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(service.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Heart className={`w-4 h-4 ${service.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(service.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Bookmark className={`w-4 h-4 ${service.isBookmarked ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {service.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            <span>Delivery</span>
                          </div>
                          <span className="font-medium">{service.estimatedTime}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <DollarSign className="w-3 h-3" />
                            <span>Cost</span>
                          </div>
                          <span className="font-medium">{formatCost(service.cost, service.costType)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {renderStars(service.rating)}
                            <span className="ml-1">{service.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{service.popularity}% popular</span>
                          </div>
                        </div>
                        {service.approvalRequired && (
                          <Badge variant="outline" className="text-xs">
                            Approval Required
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (cart.includes(service.id)) {
                              removeFromCart(service.id);
                            } else {
                              addToCart(service.id);
                            }
                          }}
                          variant={cart.includes(service.id) ? "default" : "outline"}
                          className="flex-1"
                        >
                          {cart.includes(service.id) ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              In Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                        <Button size="sm" variant="outline">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {service.requirements.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Requirements:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {service.requirements.map((req, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
