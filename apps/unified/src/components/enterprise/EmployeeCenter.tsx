/**
 * Employee Center Portal Component
 * ServiceNow-equivalent Employee Center with self-service capabilities,
 * service catalog, personalized dashboard, and knowledge base
 */

import React, { useState, useEffect, useCallback } from 'react';

// Local type definitions
interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

type ServiceRequestState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'WAITING_FOR_APPROVAL'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

type CatalogItemCategory =
  | 'IT_HARDWARE'
  | 'IT_SOFTWARE'
  | 'HR_SERVICES'
  | 'FACILITIES'
  | 'SECURITY'
  | 'TRAINING'
  | 'TRAVEL'
  | 'FINANCE'
  | 'OTHER';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

type EventType =
  | 'ANNOUNCEMENT'
  | 'TRAINING'
  | 'MEETING'
  | 'DEADLINE'
  | 'MAINTENANCE'
  | 'CELEBRATION'
  | 'OTHER';

interface User extends BaseRecord {
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  department?: string;
  title?: string;
  manager_id?: string;
  location?: string;
  phone?: string;
  employee_id?: string;
}

interface CatalogItem extends BaseRecord {
  name: string;
  short_description: string;
  description?: string;
  category: CatalogItemCategory;
  subcategory?: string;
  price?: number;
  icon?: string;
  popularity_score: number;
  average_rating: number;
  fulfillment_time_days: number;
  is_active: boolean;
  approval_required: boolean;
  form_fields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number';
    required: boolean;
    options?: string[];
  }>;
}

interface ServiceRequest extends BaseRecord {
  number: string;
  catalog_item_id: string;
  catalog_item: CatalogItem;
  requested_by_id: string;
  requested_by: User;
  requested_for_id?: string;
  requested_for?: User;
  state: ServiceRequestState;
  priority: Priority;
  approval_state?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by_id?: string;
  approved_by?: User;
  approval_date?: string;
  form_data?: Record<string, any>;
  special_instructions?: string;
  business_justification?: string;
  delivery_address?: string;
  expected_delivery?: string;
  actual_delivery?: string;
  cost?: number;
  opened_at: string;
  closed_at?: string;
  work_notes?: string;
  satisfaction_rating?: number;
  satisfaction_comments?: string;
}

interface KnowledgeArticle extends BaseRecord {
  number: string;
  title: string;
  short_description: string;
  content: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  view_count: number;
  rating: number;
  published: boolean;
  author_id: string;
  author: User;
  published_at?: string;
  last_reviewed?: string;
}

interface CompanyEvent extends BaseRecord {
  title: string;
  description: string;
  type: EventType;
  start_date: string;
  end_date?: string;
  location?: string;
  is_all_day: boolean;
  organizer_id: string;
  organizer: User;
  max_attendees?: number;
  current_attendees: number;
  registration_required: boolean;
  registration_deadline?: string;
  is_virtual: boolean;
  meeting_link?: string;
  tags: string[];
}

interface PersonalizedDashboard {
  recentRequests: ServiceRequest[];
  popularCatalogItems: CatalogItem[];
  upcomingEvents: CompanyEvent[];
  recommendedKnowledge: KnowledgeArticle[];
  quickStats: {
    openRequests: number;
    completedThisMonth: number;
    averageResolutionTime: number;
    satisfactionScore: number;
  };
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    priority: Priority;
    created_at: string;
    expires_at?: string;
  }>;
}

interface EmployeeCenterProps {
  currentUser?: User;
  onCreateServiceRequest?: (catalogItemId: string) => void;
  onViewServiceRequest?: (requestId: string) => void;
  onRegisterForEvent?: (eventId: string) => void;
  onViewKnowledgeArticle?: (articleId: string) => void;
}

// Styling constants
const CATEGORY_COLORS = {
  IT_HARDWARE: '#3b82f6',
  IT_SOFTWARE: '#8b5cf6',
  HR_SERVICES: '#10b981',
  FACILITIES: '#f59e0b',
  SECURITY: '#dc2626',
  TRAINING: '#059669',
  TRAVEL: '#0891b2',
  FINANCE: '#c2410c',
  OTHER: '#6b7280',
};

const CATEGORY_ICONS = {
  IT_HARDWARE: '💻',
  IT_SOFTWARE: '💿',
  HR_SERVICES: '👥',
  FACILITIES: '🏢',
  SECURITY: '🔐',
  TRAINING: '📚',
  TRAVEL: '✈️',
  FINANCE: '💰',
  OTHER: '⚙️',
};

const STATE_COLORS = {
  DRAFT: '#6b7280',
  SUBMITTED: '#3b82f6',
  WAITING_FOR_APPROVAL: '#f59e0b',
  APPROVED: '#10b981',
  IN_PROGRESS: '#8b5cf6',
  COMPLETED: '#059669',
  CANCELLED: '#6b7280',
  REJECTED: '#dc2626',
};

const PRIORITY_COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#ea580c',
  MEDIUM: '#d97706',
  LOW: '#65a30d',
};

const EVENT_TYPE_ICONS = {
  ANNOUNCEMENT: '📢',
  TRAINING: '🎓',
  MEETING: '🤝',
  DEADLINE: '⏰',
  MAINTENANCE: '🔧',
  CELEBRATION: '🎉',
  OTHER: '📅',
};

// Component styles
const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '24px',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  welcomeSection: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    marginBottom: '4px',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
  },
  searchContainer: {
    position: 'relative' as const,
    minWidth: '300px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: '#f9fafb',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    fontSize: '18px',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '24px',
  },
  primaryContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
  },
  quickActionIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  quickActionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '4px',
  },
  quickActionDesc: {
    fontSize: '14px',
    color: '#64748b',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  catalogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  catalogCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#fafbfc',
  },
  catalogCardHover: {
    borderColor: '#3b82f6',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
  },
  catalogHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  catalogIcon: {
    fontSize: '24px',
  },
  catalogName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  catalogDescription: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  catalogMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#6b7280',
  },
  requestCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#fafbfc',
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  requestNumber: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
  },
  requestTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginTop: '4px',
  },
  stateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
  },
  requestMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  metaLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  metaValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  eventCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#fafbfc',
    cursor: 'pointer',
  },
  eventHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  eventIcon: {
    fontSize: '20px',
  },
  eventTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  eventDescription: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  eventMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#6b7280',
  },
  knowledgeCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#fafbfc',
    cursor: 'pointer',
  },
  knowledgeTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  knowledgeDescription: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  knowledgeMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#6b7280',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  statCard: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
  },
  announcementCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: '#fafbfc',
  },
  announcementTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  announcementContent: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '16px',
    color: '#64748b',
  },
  error: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #fecaca',
  },
};

const EmployeeCenter: React.FC<EmployeeCenterProps> = ({
  currentUser = {
    id: '1',
    email: 'user@company.com',
    first_name: 'John',
    last_name: 'Doe',
    department: 'Engineering',
    title: 'Software Engineer',
    created_at: '',
    updated_at: '',
  },
  onCreateServiceRequest,
  onViewServiceRequest,
  onRegisterForEvent,
  onViewKnowledgeArticle,
}) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<PersonalizedDashboard | null>(null);
  const [popularCatalogItems, setPopularCatalogItems] = useState<CatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for demonstration
      const mockCatalogItems: CatalogItem[] = [
        {
          id: '1',
          name: 'New Laptop Request',
          short_description: 'Request a new laptop for work',
          description:
            'Submit a request for a new laptop with specifications based on your role and requirements',
          category: 'IT_HARDWARE',
          subcategory: 'Computers',
          price: 1200,
          icon: '💻',
          popularity_score: 95,
          average_rating: 4.8,
          fulfillment_time_days: 3,
          is_active: true,
          approval_required: true,
          form_fields: [
            {
              name: 'laptop_type',
              label: 'Laptop Type',
              type: 'select',
              required: true,
              options: ['MacBook Pro', 'MacBook Air', 'ThinkPad', 'Dell XPS'],
            },
            {
              name: 'justification',
              label: 'Business Justification',
              type: 'textarea',
              required: true,
            },
          ],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Software License Request',
          short_description: 'Request access to software applications',
          description: 'Request licenses for professional software tools and applications',
          category: 'IT_SOFTWARE',
          subcategory: 'Licenses',
          price: 200,
          icon: '💿',
          popularity_score: 87,
          average_rating: 4.6,
          fulfillment_time_days: 1,
          is_active: true,
          approval_required: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '3',
          name: 'Time Off Request',
          short_description: 'Submit vacation or time off request',
          description: 'Request time off for vacation, personal days, or sick leave',
          category: 'HR_SERVICES',
          subcategory: 'Leave Management',
          popularity_score: 92,
          average_rating: 4.9,
          fulfillment_time_days: 0,
          is_active: true,
          approval_required: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '4',
          name: 'Office Supplies',
          short_description: 'Order office supplies and equipment',
          description: 'Request office supplies, stationery, and workspace equipment',
          category: 'FACILITIES',
          subcategory: 'Supplies',
          price: 50,
          icon: '📝',
          popularity_score: 78,
          average_rating: 4.4,
          fulfillment_time_days: 2,
          is_active: true,
          approval_required: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockServiceRequests: ServiceRequest[] = [
        {
          id: '1',
          number: 'REQ0001001',
          catalog_item_id: '1',
          catalog_item: mockCatalogItems[0],
          requested_by_id: currentUser.id,
          requested_by: currentUser,
          state: 'IN_PROGRESS',
          priority: 'MEDIUM',
          approval_state: 'APPROVED',
          opened_at: '2024-01-08T10:00:00Z',
          created_at: '2024-01-08T10:00:00Z',
          updated_at: '2024-01-08T10:00:00Z',
        },
        {
          id: '2',
          number: 'REQ0001002',
          catalog_item_id: '3',
          catalog_item: mockCatalogItems[2],
          requested_by_id: currentUser.id,
          requested_by: currentUser,
          state: 'WAITING_FOR_APPROVAL',
          priority: 'LOW',
          opened_at: '2024-01-10T14:00:00Z',
          created_at: '2024-01-10T14:00:00Z',
          updated_at: '2024-01-10T14:00:00Z',
        },
      ];

      const mockEvents: CompanyEvent[] = [
        {
          id: '1',
          title: 'All Hands Meeting',
          description: 'Quarterly company all hands meeting with updates from leadership',
          type: 'MEETING',
          start_date: '2024-01-15T14:00:00Z',
          end_date: '2024-01-15T15:30:00Z',
          location: 'Main Conference Room',
          is_all_day: false,
          organizer_id: '1',
          organizer: {
            id: '1',
            email: 'ceo@company.com',
            first_name: 'Jane',
            last_name: 'Smith',
            created_at: '',
            updated_at: '',
          },
          max_attendees: 200,
          current_attendees: 156,
          registration_required: false,
          is_virtual: false,
          tags: ['company-wide', 'quarterly'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          title: 'Security Awareness Training',
          description: 'Mandatory cybersecurity awareness training for all employees',
          type: 'TRAINING',
          start_date: '2024-01-20T10:00:00Z',
          end_date: '2024-01-20T12:00:00Z',
          is_all_day: false,
          organizer_id: '2',
          organizer: {
            id: '2',
            email: 'security@company.com',
            first_name: 'Security',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          max_attendees: 50,
          current_attendees: 23,
          registration_required: true,
          registration_deadline: '2024-01-18T00:00:00Z',
          is_virtual: true,
          meeting_link: 'https://teams.microsoft.com/meeting/...',
          tags: ['security', 'mandatory', 'training'],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockKnowledge: KnowledgeArticle[] = [
        {
          id: '1',
          number: 'KB0001001',
          title: 'How to Reset Your Password',
          short_description: 'Step-by-step guide to reset your company password',
          content: 'Detailed instructions for password reset...',
          category: 'IT Support',
          subcategory: 'Account Management',
          keywords: ['password', 'reset', 'account', 'login'],
          view_count: 1247,
          rating: 4.8,
          published: true,
          author_id: '1',
          author: {
            id: '1',
            email: 'ithelp@company.com',
            first_name: 'IT',
            last_name: 'Support',
            created_at: '',
            updated_at: '',
          },
          published_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          number: 'KB0001002',
          title: 'Expense Reporting Guidelines',
          short_description: 'Complete guide to submitting expense reports',
          content: 'Guidelines and procedures for expense reporting...',
          category: 'Finance',
          subcategory: 'Expenses',
          keywords: ['expense', 'reporting', 'reimbursement', 'travel'],
          view_count: 892,
          rating: 4.6,
          published: true,
          author_id: '2',
          author: {
            id: '2',
            email: 'finance@company.com',
            first_name: 'Finance',
            last_name: 'Team',
            created_at: '',
            updated_at: '',
          },
          published_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockDashboard: PersonalizedDashboard = {
        recentRequests: mockServiceRequests,
        popularCatalogItems: mockCatalogItems.slice(0, 3),
        upcomingEvents: mockEvents,
        recommendedKnowledge: mockKnowledge,
        quickStats: {
          openRequests: 2,
          completedThisMonth: 8,
          averageResolutionTime: 2.3,
          satisfactionScore: 4.7,
        },
        announcements: [
          {
            id: '1',
            title: 'System Maintenance Scheduled',
            content:
              'Planned maintenance window this Saturday 2-4 AM EST. Some services may be temporarily unavailable.',
            priority: 'MEDIUM',
            created_at: '2024-01-10T00:00:00Z',
            expires_at: '2024-01-13T00:00:00Z',
          },
          {
            id: '2',
            title: 'New Employee Benefits Package',
            content:
              'Enhanced health and wellness benefits are now available. Check your employee portal for details.',
            priority: 'LOW',
            created_at: '2024-01-09T00:00:00Z',
          },
        ],
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setDashboardData(mockDashboard);
      setPopularCatalogItems(mockCatalogItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employee center data');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Format time ago
  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Recently';
  };

  // Format date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get category color
  const getCategoryColor = (category: CatalogItemCategory): string => {
    return CATEGORY_COLORS[category] || '#6b7280';
  };

  // Get category icon
  const getCategoryIcon = (category: CatalogItemCategory): string => {
    return CATEGORY_ICONS[category] || '⚙️';
  };

  // Get state color
  const getStateColor = (state: ServiceRequestState): string => {
    return STATE_COLORS[state] || '#6b7280';
  };

  // Filter catalog items based on search
  const filteredCatalogItems = popularCatalogItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.short_description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return <div style={styles.loading}>Loading Employee Center...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>Welcome back, {currentUser.first_name}! 👋</h1>
          <p style={styles.welcomeSubtitle}>
            {currentUser.title} • {currentUser.department}
          </p>
        </div>
        <div style={styles.searchContainer}>
          <div style={styles.searchIcon}>🔍</div>
          <input
            type="text"
            placeholder="Search services, knowledge, and more..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <div style={styles.quickActionCard} onClick={() => onCreateServiceRequest?.('1')}>
          <div style={styles.quickActionIcon}>💻</div>
          <div style={styles.quickActionTitle}>Request Hardware</div>
          <div style={styles.quickActionDesc}>Laptops, monitors, accessories</div>
        </div>
        <div style={styles.quickActionCard} onClick={() => onCreateServiceRequest?.('2')}>
          <div style={styles.quickActionIcon}>💿</div>
          <div style={styles.quickActionTitle}>Software Access</div>
          <div style={styles.quickActionDesc}>Applications and licenses</div>
        </div>
        <div style={styles.quickActionCard} onClick={() => onCreateServiceRequest?.('3')}>
          <div style={styles.quickActionIcon}>🏖️</div>
          <div style={styles.quickActionTitle}>Time Off</div>
          <div style={styles.quickActionDesc}>Vacation and personal days</div>
        </div>
        <div style={styles.quickActionCard}>
          <div style={styles.quickActionIcon}>📞</div>
          <div style={styles.quickActionTitle}>Get Help</div>
          <div style={styles.quickActionDesc}>Contact IT support</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.primaryContent}>
          {/* Service Catalog */}
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>🛒 Service Catalog</h2>
            <div style={styles.catalogGrid}>
              {filteredCatalogItems.map((item) => (
                <div
                  key={item.id}
                  style={styles.catalogCard}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, styles.catalogCardHover);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '';
                  }}
                  onClick={() => onCreateServiceRequest?.(item.id)}
                >
                  <div style={styles.catalogHeader}>
                    <div
                      style={{
                        ...styles.catalogIcon,
                        color: getCategoryColor(item.category),
                      }}
                    >
                      {getCategoryIcon(item.category)}
                    </div>
                    <div style={styles.catalogName}>{item.name}</div>
                  </div>
                  <div style={styles.catalogDescription}>{item.short_description}</div>
                  <div style={styles.catalogMeta}>
                    <span>⭐ {item.average_rating}/5</span>
                    <span>⏱️ {item.fulfillment_time_days} days</span>
                    {item.price && <span>💰 ${item.price}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests */}
          <div style={styles.sectionCard}>
            <h2 style={styles.sectionTitle}>📋 My Recent Requests</h2>
            {dashboardData?.recentRequests.map((request) => (
              <div
                key={request.id}
                style={styles.requestCard}
                onClick={() => onViewServiceRequest?.(request.id)}
              >
                <div style={styles.requestHeader}>
                  <div>
                    <div style={styles.requestNumber}>{request.number}</div>
                    <div style={styles.requestTitle}>{request.catalog_item.name}</div>
                  </div>
                  <div
                    style={{ ...styles.stateBadge, backgroundColor: getStateColor(request.state) }}
                  >
                    {request.state.replace('_', ' ')}
                  </div>
                </div>
                <div style={styles.requestMeta}>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Priority</span>
                    <span style={styles.metaValue}>{request.priority}</span>
                  </div>
                  <div style={styles.metaItem}>
                    <span style={styles.metaLabel}>Opened</span>
                    <span style={styles.metaValue}>{formatTimeAgo(request.opened_at)}</span>
                  </div>
                  {request.approval_state && (
                    <div style={styles.metaItem}>
                      <span style={styles.metaLabel}>Approval</span>
                      <span style={styles.metaValue}>{request.approval_state}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Quick Stats */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>📊 My Stats</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{dashboardData?.quickStats.openRequests || 0}</div>
                <div style={styles.statLabel}>Open Requests</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>
                  {dashboardData?.quickStats.completedThisMonth || 0}
                </div>
                <div style={styles.statLabel}>Completed This Month</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>
                  {dashboardData?.quickStats.averageResolutionTime || 0}d
                </div>
                <div style={styles.statLabel}>Avg Resolution Time</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>
                  {dashboardData?.quickStats.satisfactionScore || 0}/5
                </div>
                <div style={styles.statLabel}>Satisfaction Score</div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>📢 Announcements</h3>
            {dashboardData?.announcements.map((announcement) => (
              <div key={announcement.id} style={styles.announcementCard}>
                <div style={styles.announcementTitle}>{announcement.title}</div>
                <div style={styles.announcementContent}>{announcement.content}</div>
              </div>
            ))}
          </div>

          {/* Upcoming Events */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>📅 Upcoming Events</h3>
            {dashboardData?.upcomingEvents.map((event) => (
              <div
                key={event.id}
                style={styles.eventCard}
                onClick={() => onRegisterForEvent?.(event.id)}
              >
                <div style={styles.eventHeader}>
                  <div style={styles.eventIcon}>{EVENT_TYPE_ICONS[event.type]}</div>
                  <div style={styles.eventTitle}>{event.title}</div>
                </div>
                <div style={styles.eventDescription}>{event.description}</div>
                <div style={styles.eventMeta}>
                  <span>{formatDate(event.start_date)}</span>
                  {event.registration_required && <span>Registration Required</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Knowledge Base */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>📚 Helpful Articles</h3>
            {dashboardData?.recommendedKnowledge.map((article) => (
              <div
                key={article.id}
                style={styles.knowledgeCard}
                onClick={() => onViewKnowledgeArticle?.(article.id)}
              >
                <div style={styles.knowledgeTitle}>{article.title}</div>
                <div style={styles.knowledgeDescription}>{article.short_description}</div>
                <div style={styles.knowledgeMeta}>
                  <span>⭐ {article.rating}/5</span>
                  <span>👁️ {article.view_count} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCenter;
