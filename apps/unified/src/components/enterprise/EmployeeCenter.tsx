/**
 * Employee Center Portal Component
 * ServiceNow-equivalent Employee Center with self-service capabilities,
 * service catalog, personalized dashboard, and knowledge base
 */

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../services/api';

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

      // Fetch data from API endpoints
      try {
        const [catalogResponse, requestsResponse, eventsResponse, knowledgeResponse] = await Promise.all([
          apiClient.get('/api/v1/service-catalog'),
          apiClient.get(`/api/v1/service-requests?requester=${currentUser?.id || ''}`),
          apiClient.get('/api/v1/company-events'),
          apiClient.get('/api/v1/knowledge-articles'),
        ]);

        const catalogItems: CatalogItem[] = catalogResponse.success ? catalogResponse.data || [] : [];
        const serviceRequests: ServiceRequest[] = requestsResponse.success ? requestsResponse.data || [] : [];
        const events: CompanyEvent[] = eventsResponse.success ? eventsResponse.data || [] : [];
        const knowledgeArticles: KnowledgeArticle[] = knowledgeResponse.success ? knowledgeResponse.data || [] : [];

        const dashboardData: PersonalizedDashboard = {
          recentRequests: serviceRequests.slice(0, 5),
          popularCatalogItems: catalogItems.slice(0, 3),
          upcomingEvents: events.slice(0, 3),
          recommendedKnowledge: knowledgeArticles.slice(0, 4),
          quickStats: {
            openRequests: serviceRequests.filter((req: any) => ['SUBMITTED', 'IN_PROGRESS', 'WAITING_FOR_APPROVAL'].includes(req.state)).length,
            completedThisMonth: serviceRequests.filter((req: any) => req.state === 'COMPLETED' && new Date(req.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
            averageResolutionTime: 2.3, // Would be calculated from API data
            satisfactionScore: 4.7, // Would come from API data
          },
          announcements: [], // Would come from announcements API
        };

        setDashboardData(dashboardData);
        setPopularCatalogItems(catalogItems);
      } catch (apiError) {
        console.warn('API endpoints not available, using empty data:', apiError);
        // Set empty data for production
        setDashboardData({
          recentRequests: [],
          popularCatalogItems: [],
          upcomingEvents: [],
          recommendedKnowledge: [],
          quickStats: {
            openRequests: 0,
            completedThisMonth: 0,
            averageResolutionTime: 0,
            satisfactionScore: 0,
          },
          announcements: [],
        });
        setPopularCatalogItems([]);
      }
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
                    <span 
                      style={{
                        ...styles.metaValue,
                        color: PRIORITY_COLORS[request.priority as keyof typeof PRIORITY_COLORS],
                        fontWeight: '600',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: `${PRIORITY_COLORS[request.priority as keyof typeof PRIORITY_COLORS]}15`,
                        border: `1px solid ${PRIORITY_COLORS[request.priority as keyof typeof PRIORITY_COLORS]}30`,
                      }}
                    >
                      {request.priority}
                    </span>
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
