import React, { useState, useEffect } from 'react';
import {
  Search,
  Ticket,
  Book,
  MessageCircle,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  Zap,
  FileText,
  Users,
  Calendar,
  Package,
  Settings,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Send,
  Bookmark,
  ArrowRight,
  Sparkles,
  Bell,
  Menu,
  X,
  Plus,
} from 'lucide-react';

/**
 * Self-Service Portal Page (Orbit)
 * 
 * End-user self-service portal with:
 * - Ticket submission and tracking
 * - Knowledge base access
 * - Service catalog browsing
 * - Live chat support
 * - Personal dashboard
 * - Request history
 * 
 * Design: Apple Liquid Glass 2025
 * - Glassmorphism with backdrop blur
 * - Spring animations (400ms, cubic-bezier)
 * - SF Pro typography
 * - 8px grid system
 */

// Types
interface UserTicket {
  id: string;
  number: string;
  subject: string;
  status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  lastUpdate: string;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  views: number;
  helpful: number;
  rating: number;
  readTime: string;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  approvalRequired: boolean;
  estimatedTime: string;
  popular: boolean;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const SelfServicePortalPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets' | 'knowledge' | 'services'>(
    'dashboard',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [myTickets, setMyTickets] = useState<UserTicket[]>([
    {
      id: '1',
      number: 'TKT-2451',
      subject: 'Unable to access email on mobile device',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2025-01-15T09:00:00Z',
      updatedAt: '2025-01-15T10:30:00Z',
      lastUpdate: 'Agent is working on your request',
    },
    {
      id: '2',
      number: 'TKT-2398',
      subject: 'Request for Adobe Creative Suite license',
      status: 'pending',
      priority: 'medium',
      createdAt: '2025-01-14T14:00:00Z',
      updatedAt: '2025-01-15T08:00:00Z',
      lastUpdate: 'Waiting for manager approval',
    },
    {
      id: '3',
      number: 'TKT-2301',
      subject: 'Password reset confirmation',
      status: 'resolved',
      priority: 'low',
      createdAt: '2025-01-12T11:00:00Z',
      updatedAt: '2025-01-12T11:30:00Z',
      lastUpdate: 'Password has been reset successfully',
    },
  ]);

  const [popularArticles, setPopularArticles] = useState<KnowledgeArticle[]>([
    {
      id: '1',
      title: 'How to Reset Your Password',
      summary: 'Step-by-step guide to reset your account password securely',
      category: 'Account & Access',
      views: 2847,
      helpful: 2654,
      rating: 4.8,
      readTime: '3 min',
    },
    {
      id: '2',
      title: 'Setting Up VPN Connection',
      summary: 'Configure VPN access for secure remote work',
      category: 'Network & Security',
      views: 1923,
      helpful: 1802,
      rating: 4.7,
      readTime: '5 min',
    },
    {
      id: '3',
      title: 'Email Configuration on Mobile',
      summary: 'Add your work email to iOS and Android devices',
      category: 'Email & Communication',
      views: 1654,
      helpful: 1521,
      rating: 4.6,
      readTime: '4 min',
    },
    {
      id: '4',
      title: 'Connecting to WiFi',
      summary: 'Access corporate WiFi network on campus',
      category: 'Network & Security',
      views: 1432,
      helpful: 1389,
      rating: 4.9,
      readTime: '2 min',
    },
  ]);

  const [popularServices, setPopularServices] = useState<ServiceItem[]>([
    {
      id: '1',
      name: 'Software Installation',
      description: 'Request installation of approved software applications',
      category: 'Software & Applications',
      icon: '💻',
      approvalRequired: true,
      estimatedTime: '1-2 business days',
      popular: true,
    },
    {
      id: '2',
      name: 'New Equipment Request',
      description: 'Request laptop, monitor, keyboard, or other hardware',
      category: 'Hardware & Equipment',
      icon: '🖥️',
      approvalRequired: true,
      estimatedTime: '3-5 business days',
      popular: true,
    },
    {
      id: '3',
      name: 'Access Request',
      description: 'Request access to systems, folders, or applications',
      category: 'Account & Access',
      icon: '🔐',
      approvalRequired: true,
      estimatedTime: '4 hours',
      popular: true,
    },
    {
      id: '4',
      name: 'Meeting Room Booking',
      description: 'Reserve conference rooms and collaboration spaces',
      category: 'Facilities',
      icon: '🏢',
      approvalRequired: false,
      estimatedTime: 'Instant',
      popular: false,
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Ticket Updated',
      message: 'Your ticket TKT-2451 has been assigned to an agent',
      time: '5 min ago',
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'New Article',
      message: 'Check out our new guide on Windows 11 features',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Pending Approval',
      message: 'Your software request is awaiting manager approval',
      time: '1 day ago',
      read: true,
    },
  ]);

  // Helper functions
  const getStatusColor = (status: UserTicket['status']) => {
    switch (status) {
      case 'open':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'resolved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'closed':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: UserTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'info':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'warning':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Render Dashboard Tab
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass rounded-2xl p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome to Orbit
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your personal IT support hub - Get help, track requests, and find answers
            </p>
          </div>
          <button className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg">
            Create Ticket
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {myTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length}
              </p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {myTickets.filter((t) => t.status === 'resolved').length}
              </p>
            </div>
            <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarks</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <div className="rounded-xl bg-yellow-100 p-3 dark:bg-yellow-900/30">
              <Bookmark className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
            <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
              <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {popularServices.map((service) => (
            <button
              key={service.id}
              className="group flex items-center gap-3 rounded-xl bg-white/70 p-4 text-left transition-all hover:scale-105 hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800"
            >
              <span className="text-3xl">{service.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {service.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{service.estimatedTime}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Tickets & Popular Articles */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tickets */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Tickets</h3>
            <button
              onClick={() => setActiveTab('tickets')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {myTickets.slice(0, 3).map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-xl bg-white/50 p-4 dark:bg-gray-800/50 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium text-gray-600 dark:text-gray-400">
                      {ticket.number}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatTimeAgo(ticket.updatedAt)}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {ticket.subject}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{ticket.lastUpdate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Popular Articles</h3>
            <button
              onClick={() => setActiveTab('knowledge')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Browse All
            </button>
          </div>
          <div className="space-y-3">
            {popularArticles.slice(0, 3).map((article) => (
              <div
                key={article.id}
                className="rounded-xl bg-white/50 p-4 dark:bg-gray-800/50 cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Star className="h-3 w-3 fill-yellow-600" />
                    <span className="text-xs">{article.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{article.summary}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.readTime} read</span>
                  <span>{article.views.toLocaleString()} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Tickets Tab
  const renderTickets = () => (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Tickets</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track and manage your support requests
            </p>
          </div>
          <button className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700">
            <Plus className="mr-2 inline h-5 w-5" />
            New Ticket
          </button>
        </div>

        <div className="space-y-4">
          {myTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl bg-white/70 p-6 transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                    {ticket.number}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(ticket.status)}`}
                  >
                    {ticket.status}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getPriorityColor(ticket.priority)}`}
                  >
                    {ticket.priority}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Updated</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTimeAgo(ticket.updatedAt)}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {ticket.subject}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{ticket.lastUpdate}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Created {formatTimeAgo(ticket.createdAt)}
                  </span>
                </div>
                <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Knowledge Tab
  const renderKnowledge = () => (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Knowledge Base
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Find answers to common questions and learn helpful tips
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-0 bg-white/70 py-3 pl-12 pr-4 text-sm backdrop-blur-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/70 dark:text-white"
          />
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {popularArticles.map((article) => (
            <div
              key={article.id}
              className="group rounded-xl bg-white/70 p-6 transition-all hover:scale-[1.02] hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800 cursor-pointer"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {article.category}
                </span>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="h-4 w-4 fill-yellow-600" />
                  <span className="text-sm font-medium">{article.rating}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{article.summary}</p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                  <span>{article.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 text-green-600 hover:text-green-700">
                    <ThumbsUp className="h-3 w-3" />
                    {article.helpful}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Services Tab
  const renderServices = () => (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Service Catalog
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Browse and request IT services and resources
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {popularServices.map((service) => (
            <div
              key={service.id}
              className="group rounded-xl bg-white/70 p-6 transition-all hover:scale-105 hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800 cursor-pointer relative"
            >
              {service.popular && (
                <div className="absolute -right-2 -top-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  Popular
                </div>
              )}

              <div className="mb-4 flex items-center justify-between">
                <span className="text-4xl">{service.icon}</span>
                {service.approvalRequired && (
                  <span className="rounded-lg bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                    Approval Required
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {service.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {service.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {service.estimatedTime}
                </span>
                <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                  Request
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Self-Service Portal
              <span className="ml-3 text-2xl font-normal text-gray-500">Orbit</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Get the help you need, when you need it
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-xl bg-white/70 p-3 backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800"
              >
                <Bell className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white p-4 shadow-2xl dark:bg-gray-800 z-10">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      aria-label="Close notifications"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`rounded-lg p-3 ${notification.read ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                      >
                        <div className="flex items-start gap-2">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Chat */}
            <button
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="hidden sm:inline">Live Chat</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass mb-6 rounded-2xl p-2">
          <div className="flex gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Sparkles className="h-5 w-5" /> },
              { id: 'tickets', label: 'My Tickets', icon: <Ticket className="h-5 w-5" /> },
              { id: 'knowledge', label: 'Knowledge', icon: <Book className="h-5 w-5" /> },
              { id: 'services', label: 'Services', icon: <Package className="h-5 w-5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/50 dark:text-gray-300 dark:hover:bg-gray-800/50'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'tickets' && renderTickets()}
        {activeTab === 'knowledge' && renderKnowledge()}
        {activeTab === 'services' && renderServices()}

        {/* Floating Chat Widget */}
        {showChat && (
          <div className="fixed bottom-6 right-6 w-96 rounded-2xl bg-white shadow-2xl dark:bg-gray-800 z-50">
            <div className="flex items-center justify-between rounded-t-2xl bg-blue-600 p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="font-medium text-white">Live Chat Support</span>
              </div>
              <button 
                onClick={() => setShowChat(false)} 
                aria-label="Close chat"
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-96 overflow-y-auto p-4">
              <div className="mb-4 flex items-start gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  AI
                </div>
                <div className="flex-1 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Hi! I'm here to help. What can I assist you with today?
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t p-4 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 rounded-lg border-0 bg-gray-100 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button 
                  aria-label="Send message"
                  className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfServicePortalPage;
