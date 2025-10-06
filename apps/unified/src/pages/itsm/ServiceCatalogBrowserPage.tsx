import React, { useState, useEffect, useMemo } from 'react';
import {
  SearchBar,
  Dropdown,
  DropdownButton,
  StatusBadge,
  MetricCardGrid,
  Modal,
  ModalButton,
  SmartForm,
  useDynamicIsland,
  type SearchResult,
  type DropdownItem,
  type FormField,
  type MetricCardProps,
} from '@components/design-system';
import {
  Grid3x3,
  List,
  Filter,
  Star,
  TrendingUp,
  ShoppingCart,
  Package,
  Zap,
  Settings,
} from 'lucide-react';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  price?: number;
  deliveryTime: string;
  popularity: number;
  rating: number;
  isFavorite: boolean;
  isAvailable: boolean;
  tags: string[];
}

/**
 * Service Catalog Browser
 * Browse and request services from the catalog
 */
export const ServiceCatalogBrowserPage: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const dynamicIsland = useDynamicIsland();

  // Mock data - replace with API call
  useEffect(() => {
    const mockItems: CatalogItem[] = [
      {
        id: '1',
        name: 'Microsoft 365 License',
        description: 'Full Microsoft 365 suite including Office apps, Teams, OneDrive, and more',
        category: 'Software',
        icon: '📦',
        price: 12.50,
        deliveryTime: '2-4 hours',
        popularity: 95,
        rating: 4.8,
        isFavorite: true,
        isAvailable: true,
        tags: ['productivity', 'collaboration', 'cloud'],
      },
      {
        id: '2',
        name: 'New Laptop Request',
        description: 'Request a new laptop with standard company configuration',
        category: 'Hardware',
        icon: '💻',
        deliveryTime: '3-5 business days',
        popularity: 88,
        rating: 4.6,
        isFavorite: false,
        isAvailable: true,
        tags: ['hardware', 'equipment'],
      },
      {
        id: '3',
        name: 'VPN Access',
        description: 'Remote access to company network via VPN',
        category: 'Access',
        icon: '🔐',
        deliveryTime: '1-2 hours',
        popularity: 92,
        rating: 4.7,
        isFavorite: true,
        isAvailable: true,
        tags: ['security', 'remote', 'network'],
      },
      {
        id: '4',
        name: 'Conference Room Booking',
        description: 'Book a conference room for meetings and presentations',
        category: 'Facilities',
        icon: '🏢',
        deliveryTime: 'Immediate',
        popularity: 75,
        rating: 4.4,
        isFavorite: false,
        isAvailable: true,
        tags: ['meeting', 'space', 'booking'],
      },
      {
        id: '5',
        name: 'Adobe Creative Cloud',
        description: 'Access to full Adobe Creative Suite for design work',
        category: 'Software',
        icon: '🎨',
        price: 54.99,
        deliveryTime: '2-4 hours',
        popularity: 68,
        rating: 4.9,
        isFavorite: false,
        isAvailable: true,
        tags: ['design', 'creative', 'productivity'],
      },
      {
        id: '6',
        name: 'Database Access Request',
        description: 'Request access to production or development databases',
        category: 'Access',
        icon: '🗄️',
        deliveryTime: '4-8 hours',
        popularity: 54,
        rating: 4.3,
        isFavorite: false,
        isAvailable: true,
        tags: ['database', 'development', 'security'],
      },
    ];
    setItems(mockItems);
    setFilteredItems(mockItems);
  }, []);

  // Filter items
  useEffect(() => {
    let filtered = items;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (showFavorites) {
      filtered = filtered.filter((item) => item.isFavorite);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  }, [items, selectedCategory, showFavorites, searchQuery]);

  // Categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(items.map((item) => item.category))];
    return cats;
  }, [items]);

  // Metrics
  const metrics: Array<MetricCardProps & { id: string }> = useMemo(() => {
    return [
      {
        id: '1',
        title: 'Total Services',
        value: items.length.toString(),
        icon: Package,
        trend: 'neutral',
        trendValue: '0%',
      },
      {
        id: '2',
        title: 'Popular Services',
        value: items.filter((i) => i.popularity > 80).length.toString(),
        icon: TrendingUp,
        trend: 'up',
        trendValue: '+5%',
      },
      {
        id: '3',
        title: 'My Favorites',
        value: items.filter((i) => i.isFavorite).length.toString(),
        icon: Star,
        trend: 'neutral',
        trendValue: '0%',
      },
      {
        id: '4',
        title: 'Quick Delivery',
        value: items.filter((i) => i.deliveryTime.includes('hour')).length.toString(),
        icon: Zap,
        trend: 'up',
        trendValue: '+2%',
      },
    ];
  }, [items]);

  // Search results
  const searchResults: SearchResult[] = useMemo(() => {
    if (!searchQuery) return [];
    return filteredItems.slice(0, 5).map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: `${item.category} • ${item.deliveryTime}`,
      icon: <Package className="w-5 h-5" />,
      category: item.category,
    }));
  }, [filteredItems, searchQuery]);

  // Category dropdown
  const categoryItems: DropdownItem[] = categories.map((cat) => ({
    id: cat,
    label: cat === 'all' ? 'All Categories' : cat,
    onClick: () => setSelectedCategory(cat),
  }));

  // Toggle favorite
  const toggleFavorite = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // Request service form
  const requestFields: FormField[] = [
    {
      id: 'service',
      name: 'service',
      label: 'Service',
      type: 'text',
      defaultValue: selectedItem?.name,
      disabled: true,
    },
    {
      id: 'justification',
      name: 'justification',
      label: 'Business Justification',
      type: 'textarea',
      placeholder: 'Explain why you need this service',
      required: true,
      rows: 4,
      helpText: 'Provide details about how this service will be used',
    },
    {
      id: 'urgency',
      name: 'urgency',
      label: 'Urgency',
      type: 'select',
      required: true,
      options: [
        { value: 'low', label: 'Low - Can wait' },
        { value: 'medium', label: 'Medium - Needed soon' },
        { value: 'high', label: 'High - Needed urgently' },
      ],
      defaultValue: 'medium',
    },
    {
      id: 'notify',
      name: 'notify',
      label: 'Notify me when request is processed',
      type: 'checkbox',
      defaultValue: true,
    },
  ];

  const handleRequestService = async (data: Record<string, unknown>) => {
    dynamicIsland.loading('Submitting', 'Creating service request...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dynamicIsland.success('Success', 'Service request created');
      setShowRequestModal(false);
      setSelectedItem(null);
    } catch (error) {
      dynamicIsland.error('Error', 'Failed to create request');
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg-primary dark:bg-apple-bg-primary-dark">
      {/* Header */}
      <div className="glass border-b border-gray-200/20 dark:border-gray-700/20 p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-sf-display font-bold text-gray-900 dark:text-white">
                Service Catalog
              </h1>
              <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 mt-1">
                Browse and request services
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`px-4 py-2 rounded-apple-sm font-sf-text font-medium transition-all ${
                  showFavorites
                    ? 'bg-apple-blue dark:bg-apple-blue-dark text-white'
                    : 'glass text-gray-700 dark:text-gray-300'
                }`}
                type="button"
              >
                <Star className="w-4 h-4 inline-block mr-2" />
                Favorites
              </button>

              <Dropdown
                trigger={
                  <DropdownButton icon={<Filter className="w-4 h-4" />}>
                    {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                  </DropdownButton>
                }
                items={categoryItems}
              />

              <div className="flex items-center gap-2 glass rounded-apple-sm p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-apple-blue dark:text-apple-blue-dark'
                      : 'text-gray-400'
                  }`}
                  type="button"
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-apple-blue dark:text-apple-blue-dark'
                      : 'text-gray-400'
                  }`}
                  type="button"
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <SearchBar
            placeholder="Search services..."
            onSearch={setSearchQuery}
            results={searchResults}
            onResultClick={(result) => {
              const item = items.find((i) => i.id === result.id);
              if (item) {
                setSelectedItem(item);
                setShowRequestModal(true);
              }
            }}
            showShortcut
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="p-6">
        <div className="max-w-[1600px] mx-auto">
          <MetricCardGrid metrics={metrics} columns={4} />
        </div>
      </div>

      {/* Catalog Items */}
      <div className="p-6">
        <div className="max-w-[1600px] mx-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-apple-md p-6 hover:shadow-glass-md hover-lift transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowRequestModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{item.icon}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      type="button"
                      aria-label="Toggle favorite"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          item.isFavorite
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="text-lg font-sf-display font-semibold text-gray-900 dark:text-white mb-2">
                    {item.name}
                  </h3>

                  <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge variant="info" label={item.category} size="xs" />
                    {item.price && (
                      <span className="text-xs font-sf-mono text-gray-500">
                        ${item.price}/mo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-sf-text text-gray-500 dark:text-gray-400">
                    <span>⚡ {item.deliveryTime}</span>
                    <span>⭐ {item.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-apple-md p-4 hover:shadow-glass-md transition-all cursor-pointer flex items-center gap-4"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowRequestModal(true);
                  }}
                >
                  <div className="text-3xl">{item.icon}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-sf-display font-semibold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      <StatusBadge variant="info" label={item.category} size="xs" />
                    </div>
                    <p className="text-sm font-sf-text text-gray-600 dark:text-gray-400 truncate">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-sm font-sf-text text-gray-500">
                    <span>⚡ {item.deliveryTime}</span>
                    <span>⭐ {item.rating}</span>
                    {item.price && <span>${item.price}/mo</span>}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    type="button"
                    aria-label="Toggle favorite"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        item.isFavorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-sf-text text-gray-500 dark:text-gray-400">
                No services found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          setSelectedItem(null);
        }}
        title="Request Service"
        subtitle={selectedItem?.name}
        size="md"
      >
        <SmartForm
          fields={requestFields}
          onSubmit={handleRequestService}
          onCancel={() => {
            setShowRequestModal(false);
            setSelectedItem(null);
          }}
          submitLabel="Submit Request"
        />
      </Modal>
    </div>
  );
};

export default ServiceCatalogBrowserPage;
