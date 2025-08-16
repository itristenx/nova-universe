import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Badge,
} from '@heroui/react';
import {
  MagnifyingGlassIcon,
  CommandLineIcon,
  ClockIcon,
  StarIcon,
  FunnelIcon,
  UserIcon,
  TicketIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  BookmarkIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface SearchResult {
  id: string;
  type: 'ticket' | 'customer' | 'article' | 'conversation' | 'agent' | 'queue';
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, any>;
  relevanceScore: number;
  lastUpdated?: Date;
  tags?: string[];
  url: string;
}

interface SearchFilter {
  types: string[];
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  priority: string[];
  status: string[];
  tags: string[];
  customDateStart?: Date;
  customDateEnd?: Date;
}

interface RecentItem {
  id: string;
  type: 'ticket' | 'page' | 'search' | 'customer';
  title: string;
  url: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface FavoriteItem {
  id: string;
  type: 'ticket' | 'page' | 'search' | 'customer' | 'queue';
  title: string;
  url: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

interface Props {
  onNavigate?: (url: string, context?: any) => void;
}

export const AdvancedSearchNavigation: React.FC<Props> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilter>({
    types: [],
    dateRange: 'all',
    priority: [],
    status: [],
    tags: [],
  });
  const [commandQuery, setCommandQuery] = useState('');

  const { isOpen: isFiltersOpen, onOpen: onFiltersOpen, onClose: onFiltersClose } = useDisclosure();

  // Global search results
  const { data: searchResults = [], isLoading: isSearchLoading } = useQuery({
    queryKey: ['global-search', searchQuery, searchFilters],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchQuery.trim()) return [];

      // Mock search results - in real implementation, this would call a search API
      return [
        {
          id: 'T-001',
          type: 'ticket' as const,
          title: 'Authentication service down',
          subtitle: 'T-001 • High Priority • John Smith',
          description: 'Users unable to log into the system due to authentication service issues',
          relevanceScore: 0.95,
          lastUpdated: new Date(),
          tags: ['auth', 'critical', 'service-down'],
          url: '/tickets/T-001',
          metadata: { priority: 'high', status: 'open', assignee: 'Sarah Wilson' },
        },
        {
          id: 'KB-123',
          type: 'article' as const,
          title: 'Troubleshooting Authentication Issues',
          subtitle: 'Knowledge Base • Updated 2 days ago',
          description: 'Step-by-step guide for resolving common authentication problems',
          relevanceScore: 0.87,
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          tags: ['auth', 'troubleshooting', 'guide'],
          url: '/kb/123',
        },
        {
          id: 'C-456',
          type: 'customer' as const,
          title: 'John Smith',
          subtitle: 'john.smith@company.com • Enterprise Customer',
          description: '5 open tickets, last contacted 2 hours ago',
          relevanceScore: 0.82,
          url: '/customers/456',
          metadata: { tier: 'enterprise', openTickets: 5, lastContact: new Date() },
        },
        {
          id: 'CONV-789',
          type: 'conversation' as const,
          title: 'Auth service discussion',
          subtitle: 'Team chat • 15 minutes ago',
          description: 'Engineering team discussing authentication service outage',
          relevanceScore: 0.75,
          lastUpdated: new Date(Date.now() - 15 * 60 * 1000),
          url: '/conversations/789',
        },
      ]
        .filter((result) => {
          // Apply filters
          if (searchFilters.types.length > 0 && !searchFilters.types.includes(result.type)) {
            return false;
          }
          return true;
        })
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
    },
    enabled: searchQuery.trim().length > 2,
  });

  // Recent items
  const { data: recentItems = [] } = useQuery({
    queryKey: ['recent-items'],
    queryFn: async (): Promise<RecentItem[]> => [
      {
        id: 'T-001',
        type: 'ticket',
        title: 'Authentication service down',
        url: '/tickets/T-001',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: 'dashboard',
        type: 'page',
        title: 'Agent Dashboard',
        url: '/',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        id: 'search-auth',
        type: 'search',
        title: 'Search: "authentication"',
        url: '/search?q=authentication',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 'C-456',
        type: 'customer',
        title: 'John Smith',
        url: '/customers/456',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    ],
  });

  // Favorite items
  const { data: favoriteItems = [] } = useQuery({
    queryKey: ['favorite-items'],
    queryFn: async (): Promise<FavoriteItem[]> => [
      {
        id: 'dashboard',
        type: 'page',
        title: 'Agent Dashboard',
        url: '/',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'queue-vip',
        type: 'queue',
        title: 'VIP Customer Queue',
        url: '/queue?filter=vip',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'T-999',
        type: 'ticket',
        title: 'Critical system outage',
        url: '/tickets/T-999',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Command palette commands
  const commands = [
    { id: 'tickets', title: 'View All Tickets', url: '/tickets', icon: TicketIcon },
    { id: 'new-ticket', title: 'Create New Ticket', url: '/tickets/new', icon: TicketIcon },
    { id: 'dashboard', title: 'Go to Dashboard', url: '/', icon: EyeIcon },
    { id: 'queue', title: 'Queue Management', url: '/queue', icon: UserIcon },
    {
      id: 'communication',
      title: 'Communication Hub',
      url: '/communication',
      icon: ChatBubbleLeftRightIcon,
    },
    { id: 'deep-work', title: 'Deep Work Mode', url: '/deepwork', icon: EyeIcon },
    { id: 'settings', title: 'Settings', url: '/settings', icon: Cog6ToothIcon },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(commandQuery.toLowerCase()),
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }

      // Escape to close command palette
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
        setCommandQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // Add to recent searches
        console.log('Performing search:', searchQuery);
      }
    },
    [searchQuery],
  );

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      // Add to recent items
      console.log('Navigating to:', result.url);
      onNavigate?.(result.url, result.metadata);
      navigate(result.url);
    },
    [navigate, onNavigate],
  );

  const handleCommandExecute = useCallback(
    (command: any) => {
      console.log('Executing command:', command.title);
      setIsCommandPaletteOpen(false);
      setCommandQuery('');
      navigate(command.url);
    },
    [navigate],
  );

  const handleAddToFavorites = useCallback((item: SearchResult | RecentItem) => {
    console.log('Adding to favorites:', item.title);
    // In real implementation, this would call an API
  }, []);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return <TicketIcon className="h-5 w-5 text-blue-500" />;
      case 'customer':
        return <UserIcon className="h-5 w-5 text-green-500" />;
      case 'article':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
      case 'conversation':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-orange-500" />;
      case 'agent':
        return <UserIcon className="h-5 w-5 text-indigo-500" />;
      case 'queue':
        return <UserIcon className="h-5 w-5 text-pink-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Search & Navigation
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Global search with intelligent filtering and quick navigation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="flat"
            onPress={() => setIsCommandPaletteOpen(true)}
            startContent={<CommandLineIcon className="h-4 w-4" />}
            className="hidden sm:flex"
          >
            Command Palette
          </Button>

          <kbd className="hidden rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500 sm:inline dark:border-gray-500 dark:bg-gray-600 dark:text-gray-400">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Main Search */}
      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <h3 className="font-semibold">Global Search</h3>
            <Button
              size="sm"
              variant="flat"
              onPress={onFiltersOpen}
              startContent={<FunnelIcon className="h-4 w-4" />}
            >
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets, customers, articles, conversations..."
              startContent={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
              size="lg"
            />

            {/* Active filters */}
            {(searchFilters.types.length > 0 || searchFilters.priority.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {searchFilters.types.map((type) => (
                  <Chip
                    key={type}
                    size="sm"
                    variant="flat"
                    onClose={() =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        types: prev.types.filter((t) => t !== type),
                      }))
                    }
                  >
                    Type: {type}
                  </Chip>
                ))}
                {searchFilters.priority.map((priority) => (
                  <Chip
                    key={priority}
                    size="sm"
                    variant="flat"
                    onClose={() =>
                      setSearchFilters((prev) => ({
                        ...prev,
                        priority: prev.priority.filter((p) => p !== priority),
                      }))
                    }
                  >
                    Priority: {priority}
                  </Chip>
                ))}
              </div>
            )}

            {/* Search Results */}
            {searchQuery.trim().length > 2 && (
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {isSearchLoading ? (
                  <div className="py-8 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="group cursor-pointer rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-3">
                        {getResultIcon(result.type)}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="truncate font-medium text-gray-900 dark:text-gray-100">
                              {result.title}
                            </h4>
                            <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                size="sm"
                                variant="flat"
                                isIconOnly
                                onPress={() => handleAddToFavorites(result)}
                              >
                                <StarIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {result.subtitle && (
                            <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                              {result.subtitle}
                            </p>
                          )}

                          {result.description && (
                            <p className="line-clamp-2 text-sm text-gray-500">
                              {result.description}
                            </p>
                          )}

                          <div className="mt-2 flex items-center gap-2">
                            <Badge size="sm" variant="flat">
                              {Math.round(result.relevanceScore * 100)}% match
                            </Badge>
                            {result.lastUpdated && (
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(result.lastUpdated)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </form>
        </CardBody>
      </Card>

      {/* Recent & Favorites */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">Recent Items</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="group flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => navigate(item.url)}
              >
                <div className="flex items-center gap-3">
                  {getResultIcon(item.type)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(item.timestamp)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    onPress={() => handleAddToFavorites(item)}
                  >
                    <StarIcon className="h-4 w-4" />
                  </Button>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookmarkIcon className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">Favorites</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            {favoriteItems.map((item) => (
              <div
                key={item.id}
                className="group flex cursor-pointer items-center justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => navigate(item.url)}
              >
                <div className="flex items-center gap-3">
                  {getResultIcon(item.type)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
                    <p className="text-xs text-gray-500">Added {formatTimeAgo(item.createdAt)}</p>
                  </div>
                </div>

                <ArrowRightIcon className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Command Palette Modal */}
      <Modal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        size="lg"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <CommandLineIcon className="h-5 w-5" />
              Command Palette
            </div>
          </ModalHeader>
          <ModalBody>
            <Input
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              placeholder="Type a command..."
              autoFocus
              startContent={<MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />}
            />

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {filteredCommands.map((command) => (
                <div
                  key={command.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleCommandExecute(command)}
                >
                  <command.icon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{command.title}</span>
                </div>
              ))}

              {filteredCommands.length === 0 && commandQuery && (
                <div className="py-8 text-center text-gray-500">
                  No commands found for "{commandQuery}"
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Filters Modal */}
      <Modal isOpen={isFiltersOpen} onClose={onFiltersClose}>
        <ModalContent>
          <ModalHeader>Search Filters</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Content Types</label>
                <div className="flex flex-wrap gap-2">
                  {['ticket', 'customer', 'article', 'conversation', 'agent'].map((type) => (
                    <Chip
                      key={type}
                      size="sm"
                      variant={searchFilters.types.includes(type) ? 'solid' : 'flat'}
                      className="cursor-pointer"
                      onClick={() =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          types: prev.types.includes(type)
                            ? prev.types.filter((t) => t !== type)
                            : [...prev.types, type],
                        }))
                      }
                    >
                      {type}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Priority</label>
                <div className="flex flex-wrap gap-2">
                  {['urgent', 'high', 'medium', 'low'].map((priority) => (
                    <Chip
                      key={priority}
                      size="sm"
                      variant={searchFilters.priority.includes(priority) ? 'solid' : 'flat'}
                      className="cursor-pointer"
                      onClick={() =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          priority: prev.priority.includes(priority)
                            ? prev.priority.filter((p) => p !== priority)
                            : [...prev.priority, priority],
                        }))
                      }
                    >
                      {priority}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() =>
                setSearchFilters({
                  types: [],
                  dateRange: 'all',
                  priority: [],
                  status: [],
                  tags: [],
                })
              }
            >
              Clear All
            </Button>
            <Button color="primary" onPress={onFiltersClose}>
              Apply Filters
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
