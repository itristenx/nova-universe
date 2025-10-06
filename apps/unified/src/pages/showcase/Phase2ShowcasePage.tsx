import React, { useState } from 'react';
import {
  SmartForm,
  Timeline,
  StatusBadge,
  StatusBadgeGroup,
  MetricCard,
  MetricCardGrid,
  SearchBar,
  Modal,
  ModalButton,
  useConfirmModal,
  Dropdown,
  DropdownButton,
  useDynamicIsland,
  type FormField,
  type TimelineEvent,
  type MetricCardProps,
  type SearchResult,
  type DropdownItem,
} from '@components/design-system';
import {
  Ticket,
  User,
  Settings,
  Download,
  Filter,
  MoreVertical,
  MessageSquare,
  CheckCircle,
  Clock,
  Edit,
  Link as LinkIcon,
} from 'lucide-react';

/**
 * Phase 2 Showcase Page
 * Demonstrates Core ITSM Components
 */
export const Phase2ShowcasePage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { confirm, ConfirmModal } = useConfirmModal();
  const dynamicIsland = useDynamicIsland();

  // SmartForm demo data
  const formFields: FormField[] = [
    {
      id: 'title',
      name: 'title',
      label: 'Ticket Title',
      type: 'text',
      placeholder: 'Enter ticket title',
      required: true,
      aiSuggestion: 'Unable to access shared drive',
    },
    {
      id: 'description',
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe the issue',
      required: true,
      rows: 4,
      helpText: 'Provide as much detail as possible',
    },
    {
      id: 'priority',
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: true,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' },
      ],
    },
    {
      id: 'category',
      name: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'hardware', label: 'Hardware' },
        { value: 'software', label: 'Software' },
        { value: 'network', label: 'Network' },
        { value: 'access', label: 'Access' },
      ],
    },
    {
      id: 'notify',
      name: 'notify',
      label: 'Notify me of updates',
      type: 'checkbox',
      defaultValue: true,
    },
  ];

  // Timeline demo data
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'comment',
      title: 'Comment added',
      description: 'This issue appears to be related to network configuration',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      user: { name: 'Sarah Chen', avatar: undefined },
    },
    {
      id: '2',
      type: 'status_change',
      title: 'Status changed',
      description: 'Status changed from Open to In Progress',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      user: { name: 'John Doe', avatar: undefined },
      metadata: { from: 'Open', to: 'In Progress' },
    },
    {
      id: '3',
      type: 'assignment',
      title: 'Ticket assigned',
      description: 'Assigned to IT Support Team',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      user: { name: 'Admin', avatar: undefined },
      metadata: { assignee: 'IT Support Team' },
    },
    {
      id: '4',
      type: 'attachment',
      title: 'Attachment added',
      description: 'screenshot.png uploaded',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      user: { name: 'Alice Johnson', avatar: undefined },
      metadata: { filename: 'screenshot.png', size: '2.3 MB' },
    },
    {
      id: '5',
      type: 'system',
      title: 'Ticket created',
      description: 'Incident INC0012345 created',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      user: { name: 'System', avatar: undefined },
    },
  ];

  // Metrics demo data
  const metrics: Array<MetricCardProps & { id: string }> = [
    {
      id: '1',
      title: 'Open Tickets',
      value: '142',
      icon: Ticket,
      trend: 'up',
      trendValue: '+12%',
      sparklineData: [45, 52, 48, 61, 55, 67, 69],
    },
    {
      id: '2',
      title: 'Avg Resolution Time',
      value: '4.2h',
      icon: Clock,
      trend: 'down',
      trendValue: '-8%',
      description: 'Average time to resolve tickets',
      sparklineData: [8, 7, 6, 5, 4, 4, 4],
    },
    {
      id: '3',
      title: 'Customer Satisfaction',
      value: '94%',
      icon: CheckCircle,
      trend: 'up',
      trendValue: '+2%',
      sparklineData: [88, 89, 91, 92, 93, 93, 94],
    },
    {
      id: '4',
      title: 'Active Users',
      value: '1,247',
      icon: User,
      trend: 'neutral',
      trendValue: '0%',
      sparklineData: [1200, 1210, 1205, 1230, 1240, 1245, 1247],
    },
  ];

  // Search demo data
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'network outage',
    'password reset',
    'VPN access',
  ]);

  const handleSearch = (query: string) => {
    // Simulate search
    const mockResults: SearchResult[] = [
      {
        id: '1',
        title: `INC0012345 - ${query}`,
        subtitle: 'Open • High Priority',
        icon: <Ticket className="w-5 h-5" />,
        category: 'Incident',
      },
      {
        id: '2',
        title: `Knowledge: How to resolve ${query}`,
        subtitle: 'Updated 2 days ago',
        icon: <MessageSquare className="w-5 h-5" />,
        category: 'Article',
      },
    ];
    setSearchResults(mockResults);

    // Add to recent if not duplicate
    if (!recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches].slice(0, 5));
    }
  };

  // Dropdown demo data
  const dropdownItems: DropdownItem[] = [
    {
      id: '1',
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => dynamicIsland.info('Edit clicked'),
    },
    {
      id: '2',
      label: 'Download',
      icon: <Download className="w-4 h-4" />,
      onClick: () => dynamicIsland.info('Download started'),
    },
    {
      id: 'divider1',
      label: '',
      divider: true,
    },
    {
      id: '3',
      label: 'Share',
      icon: <LinkIcon className="w-4 h-4" />,
      children: [
        { id: '3-1', label: 'Email', onClick: () => dynamicIsland.info('Email share') },
        { id: '3-2', label: 'Slack', onClick: () => dynamicIsland.info('Slack share') },
        { id: '3-3', label: 'Teams', onClick: () => dynamicIsland.info('Teams share') },
      ],
    },
    {
      id: 'divider2',
      label: '',
      divider: true,
    },
    {
      id: '4',
      label: 'Delete',
      icon: <MessageSquare className="w-4 h-4" />,
      danger: true,
      onClick: async () => {
        const confirmed = await confirm({
          title: 'Delete Item',
          message: 'Are you sure you want to delete this item?',
          variant: 'danger',
          confirmLabel: 'Delete',
        });
        if (confirmed) {
          dynamicIsland.success('Deleted', 'Item deleted successfully');
        }
      },
    },
  ];

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    dynamicIsland.loading('Submitting', 'Creating ticket...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    dynamicIsland.success('Success', 'Ticket created successfully');
    console.log('Form submitted:', data);
  };

  return (
    <div className="min-h-screen bg-apple-bg-primary dark:bg-apple-bg-primary-dark p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-sf-display font-bold text-gray-900 dark:text-white mb-2">
            Phase 2 Showcase
          </h1>
          <p className="text-lg font-sf-text text-gray-600 dark:text-gray-400">
            Core ITSM Components with Apple Liquid Glass 2025
          </p>
        </div>

        {/* Status Badges */}
        <section className="space-y-4">
          <h2 className="text-2xl font-sf-display font-semibold text-gray-900 dark:text-white">
            Status Badges
          </h2>
          <div className="glass rounded-apple-md p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-sf-text font-medium text-gray-600 dark:text-gray-400">
                Ticket Status
              </h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge variant="open" showDot animated />
                <StatusBadge variant="in-progress" showDot animated />
                <StatusBadge variant="pending" />
                <StatusBadge variant="resolved" showDot />
                <StatusBadge variant="closed" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-sf-text font-medium text-gray-600 dark:text-gray-400">
                Priority Levels
              </h3>
              <div className="flex flex-wrap gap-3">
                <StatusBadge variant="critical" size="md" showDot animated />
                <StatusBadge variant="high" size="md" showDot />
                <StatusBadge variant="medium" size="md" />
                <StatusBadge variant="low" size="md" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-sf-text font-medium text-gray-600 dark:text-gray-400">
                Badge Group
              </h3>
              <StatusBadgeGroup
                badges={[
                  { id: '1', variant: 'critical', label: 'P1' },
                  { id: '2', variant: 'open' },
                  { id: '3', variant: 'high', label: 'Urgent' },
                  { id: '4', variant: 'in-progress' },
                ]}
                maxVisible={3}
              />
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="space-y-4">
          <h2 className="text-2xl font-sf-display font-semibold text-gray-900 dark:text-white">
            Metric Cards
          </h2>
          <MetricCardGrid metrics={metrics} columns={4} />
        </section>

        {/* Search Bar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-sf-display font-semibold text-gray-900 dark:text-white">
            Search Bar
          </h2>
          <div className="glass rounded-apple-md p-6">
            <SearchBar
              placeholder="Search tickets, knowledge base, users..."
              onSearch={handleSearch}
              results={searchResults}
              recentSearches={recentSearches}
              onClearRecent={() => setRecentSearches([])}
              showShortcut
            />
          </div>
        </section>

        {/* Smart Form */}
        <section className="space-y-4">
          <h2 className="text-2xl font-sf-display font-semibold text-gray-900 dark:text-white">
            Smart Form
          </h2>
          <div className="glass rounded-apple-md p-6">
            <SmartForm
              fields={formFields}
              onSubmit={handleFormSubmit}
              submitLabel="Create Ticket"
              aiEnabled
            />
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-4">
          <h2 className="text-2xl font-sf-display font-semibold text-gray-900 dark:text-white">
            Activity Timeline
          </h2>
          <div className="glass rounded-apple-md p-6">
            <Timeline events={timelineEvents} />
          </div>
        </section>

        {/* Modal & Dropdown */}
        <section className="space-y-4">
          <h2 className="text-2xl font-sf-display font-semibold text-gray-900 dark:text-white">
            Overlays & Menus
          </h2>
          <div className="glass rounded-apple-md p-6">
            <div className="flex flex-wrap gap-4">
              {/* Modal */}
              <ModalButton onClick={() => setModalOpen(true)} variant="primary">
                Open Modal
              </ModalButton>

              {/* Dropdown */}
              <Dropdown
                trigger={
                  <DropdownButton icon={<Settings className="w-4 h-4" />} variant="secondary">
                    Actions
                  </DropdownButton>
                }
                items={dropdownItems}
              />

              {/* More Dropdown */}
              <Dropdown
                trigger={
                  <button
                    className="p-2 glass rounded-apple-sm hover-lift"
                    type="button"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                }
                items={[
                  { id: '1', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
                  { id: '2', label: 'Filters', icon: <Filter className="w-4 h-4" /> },
                ]}
                align="right"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example Modal"
        subtitle="This is a demonstration of the modal component"
        size="md"
        footer={
          <>
            <ModalButton onClick={() => setModalOpen(false)}>Cancel</ModalButton>
            <ModalButton
              onClick={() => {
                dynamicIsland.success('Saved', 'Changes saved successfully');
                setModalOpen(false);
              }}
              variant="primary"
            >
              Save Changes
            </ModalButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="font-sf-text text-gray-700 dark:text-gray-300">
            This modal demonstrates the glassmorphic overlay system with proper focus trap,
            keyboard navigation (ESC to close), and backdrop click handling.
          </p>
          <p className="font-sf-text text-gray-700 dark:text-gray-300">
            Available sizes: sm, md, lg, xl, full
          </p>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal />
    </div>
  );
};

export default Phase2ShowcasePage;
