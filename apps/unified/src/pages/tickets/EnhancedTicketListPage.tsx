/**
 * Enhanced Apple-style Ticket List View
 * Combining Apple design with ServiceNow information density and Jira organization
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ChevronDownIcon,
  UserIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useTicketStore } from '@stores/tickets';
import { GlassCard } from '@components/common/GlassCard';
import { AppleButton } from '@components/common/AppleButton';
import { AppleInput } from '@components/common/AppleInput';
import { StatusBadge, PriorityBadge } from '@components/common/AppleBadges';
import { cn, formatTicketId, formatRelativeTime, cardHoverEffect } from '@utils/apple-utils';
import { fadeInAnimation } from '@utils/apple-utils';

// Ticket data type
interface Ticket {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'new' | 'open' | 'in-progress' | 'resolved' | 'closed' | 'on-hold';
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  type: 'incident' | 'request' | 'problem' | 'change' | 'task';
  category?: string;
  subcategory?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  requester: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags?: string[];
}

// Mock data for demonstration
const mockTickets: Ticket[] = [
  {
    id: '1',
    number: 'INC0000001',
    title: 'Email server not responding',
    description: 'Users cannot access email since 9:00 AM',
    status: 'in-progress',
    priority: 'critical',
    type: 'incident',
    category: 'Network',
    assignee: {
      id: '1',
      name: 'John Smith',
      avatar: '/avatars/john.jpg'
    },
    requester: {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com'
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  // Add more mock tickets...
];

export default function EnhancedTicketListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let filtered = mockTickets.filter(ticket => {
      const matchesSearch = searchQuery === '' || 
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.requester.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort tickets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'priority':
          const priorityOrder = { critical: 4, urgent: 3, high: 2, normal: 1, low: 0 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [mockTickets, searchQuery, statusFilter, priorityFilter, sortBy]);

  const statusCounts = {
    all: mockTickets.length,
    open: mockTickets.filter(t => ['new', 'open', 'in-progress'].includes(t.status)).length,
    resolved: mockTickets.filter(t => t.status === 'resolved').length,
    closed: mockTickets.filter(t => t.status === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8" {...fadeInAnimation()}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Service Tickets
              </h1>
              <p className="text-xl text-gray-600">
                Manage and track all service requests and incidents
              </p>
            </div>
            
            <AppleButton
              onClick={() => navigate('/tickets/create')}
              leftIcon={<PlusIcon className="h-5 w-5" />}
            >
              Create Ticket
            </AppleButton>
          </div>
        </div>

        {/* Stats Cards - ServiceNow Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" {...fadeInAnimation(0.1)}>
          {[
            { label: 'Total Tickets', count: statusCounts.all, color: 'blue', trend: '+12%' },
            { label: 'Open Tickets', count: statusCounts.open, color: 'orange', trend: '-5%' },
            { label: 'Resolved Today', count: statusCounts.resolved, color: 'green', trend: '+8%' },
            { label: 'Overdue', count: 3, color: 'red', trend: '-15%' }
          ].map((stat, index) => (
            <GlassCard key={stat.label} intensity="medium" hover="subtle" padding="md">
              <div className="text-center">
                <div className={cn(
                  'text-3xl font-bold mb-1',
                  stat.color === 'blue' && 'text-blue-600',
                  stat.color === 'orange' && 'text-orange-600',
                  stat.color === 'green' && 'text-green-600',
                  stat.color === 'red' && 'text-red-600'
                )}>
                  {stat.count}
                </div>
                <div className="text-sm font-medium text-gray-600 mb-2">{stat.label}</div>
                <div className={cn(
                  'text-xs font-semibold',
                  stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.trend}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Search and Filters */}
        <GlassCard intensity="medium" hover={false} padding="md" className="mb-6" {...fadeInAnimation(0.2)}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <AppleInput
                placeholder="Search tickets by title, number, or requester..."
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="glass"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={cn(
                  'px-4 py-3 bg-white/90 backdrop-blur-sm',
                  'border border-gray-200 rounded-xl',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200 ease-out'
                )}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={cn(
                  'px-4 py-3 bg-white/90 backdrop-blur-sm',
                  'border border-gray-200 rounded-xl',
                  'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'transition-all duration-200 ease-out'
                )}
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>

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
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-600">Quick Filters:</span>
            {[
              { label: 'My Tickets', filter: 'assigned' },
              { label: 'High Priority', filter: 'high-priority' },
              { label: 'Overdue', filter: 'overdue' },
              { label: 'New Today', filter: 'new-today' }
            ].map((filter) => (
              <button
                key={filter.filter}
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium',
                  'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  'transition-all duration-150 ease-out'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Ticket Cards */}
        <div className="space-y-4" {...fadeInAnimation(0.3)}>
          {filteredTickets.map((ticket, index) => (
            <GlassCard
              key={ticket.id}
              intensity="medium"
              hover="medium"
              padding="lg"
              className={cn(
                cardHoverEffect('medium'),
                'cursor-pointer'
              )}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-sm font-semibold text-blue-600">
                      {ticket.number}
                    </span>
                    <StatusBadge status={ticket.status} size="sm" />
                    <PriorityBadge priority={ticket.priority} size="sm" />
                    {ticket.category && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                        {ticket.category}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {ticket.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span>Requester: {ticket.requester.name}</span>
                    </div>
                    
                    {ticket.assignee && (
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        <span>Assigned: {ticket.assignee.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Created: {formatRelativeTime(ticket.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>Updated: {formatRelativeTime(ticket.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex flex-col items-end gap-3">
                  {ticket.assignee && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {ticket.assignee.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {ticket.id}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Empty State */}
        {filteredTickets.length === 0 && (
          <GlassCard intensity="medium" hover={false} padding="xl" className="text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or create a new ticket.
              </p>
              <AppleButton
                onClick={() => navigate('/tickets/create')}
                leftIcon={<PlusIcon className="h-5 w-5" />}
              >
                Create New Ticket
              </AppleButton>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}