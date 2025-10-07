import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Ticket,
  MessageSquare,
  Calendar,
  Target,
  Award,
  Activity,
  Filter,
  Search,
  Bell,
  Settings,
  BarChart3,
  Clock3,
  Timer,
  Zap,
  Star,
  ThumbsUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';

/**
 * Agent Portal Page (Pulse)
 * 
 * Comprehensive agent workspace with:
 * - Real-time ticket queue management
 * - Performance metrics and KPIs
 * - Quick actions and shortcuts
 * - Team collaboration tools
 * - Personal productivity tracking
 * - Gamification elements
 * 
 * Design: Apple Liquid Glass 2025
 * - Glassmorphism with backdrop blur
 * - Spring animations (400ms, cubic-bezier)
 * - SF Pro typography
 * - 8px grid system
 */

// Types
interface AgentStats {
  assignedTickets: number;
  resolvedToday: number;
  avgResponseTime: number; // in minutes
  satisfactionScore: number; // 0-5
  activeTickets: number;
  pendingTickets: number;
  escalatedTickets: number;
  slaCompliance: number; // percentage
  pointsToday: number;
  rank: number;
  streak: number; // days
}

interface QueueTicket {
  id: string;
  number: string;
  title: string;
  requester: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'in-progress' | 'pending' | 'resolved';
  category: string;
  createdAt: string;
  slaRemaining: number; // in minutes
  unreadMessages: number;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  activeTickets: number;
  specialization: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  badge?: number;
}

const AgentPortalPage: React.FC = () => {
  // State
  const [stats, setStats] = useState<AgentStats>({
    assignedTickets: 12,
    resolvedToday: 8,
    avgResponseTime: 45,
    satisfactionScore: 4.7,
    activeTickets: 5,
    pendingTickets: 3,
    escalatedTickets: 2,
    slaCompliance: 94.5,
    pointsToday: 850,
    rank: 3,
    streak: 12,
  });

  const [queueTickets, setQueueTickets] = useState<QueueTicket[]>([
    {
      id: '1',
      number: 'TKT-2451',
      title: 'Unable to access email - urgent',
      requester: 'Sarah Johnson',
      priority: 'critical',
      status: 'assigned',
      category: 'Email & Communication',
      createdAt: '2025-01-15T09:30:00Z',
      slaRemaining: 45,
      unreadMessages: 2,
    },
    {
      id: '2',
      number: 'TKT-2452',
      title: 'Software installation request - Adobe Creative Suite',
      requester: 'Michael Chen',
      priority: 'medium',
      status: 'in-progress',
      category: 'Software & Applications',
      createdAt: '2025-01-15T08:15:00Z',
      slaRemaining: 180,
      unreadMessages: 0,
    },
    {
      id: '3',
      number: 'TKT-2453',
      title: 'VPN connection issues from home',
      requester: 'Emily Rodriguez',
      priority: 'high',
      status: 'new',
      category: 'Network & Connectivity',
      createdAt: '2025-01-15T10:00:00Z',
      slaRemaining: 90,
      unreadMessages: 1,
    },
    {
      id: '4',
      number: 'TKT-2454',
      title: 'Password reset for multiple applications',
      requester: 'David Kim',
      priority: 'low',
      status: 'pending',
      category: 'Account & Access',
      createdAt: '2025-01-15T07:45:00Z',
      slaRemaining: 240,
      unreadMessages: 0,
    },
    {
      id: '5',
      number: 'TKT-2455',
      title: 'Printer not responding in Conference Room B',
      requester: 'Lisa Anderson',
      priority: 'medium',
      status: 'assigned',
      category: 'Hardware & Equipment',
      createdAt: '2025-01-15T09:00:00Z',
      slaRemaining: 120,
      unreadMessages: 3,
    },
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Alex Thompson',
      avatar: 'AT',
      status: 'available',
      activeTickets: 8,
      specialization: 'Network & Infrastructure',
    },
    {
      id: '2',
      name: 'Jamie Lee',
      avatar: 'JL',
      status: 'busy',
      activeTickets: 12,
      specialization: 'Software & Applications',
    },
    {
      id: '3',
      name: 'Morgan Davis',
      avatar: 'MD',
      status: 'available',
      activeTickets: 6,
      specialization: 'Hardware Support',
    },
    {
      id: '4',
      name: 'Taylor Wilson',
      avatar: 'TW',
      status: 'away',
      activeTickets: 4,
      specialization: 'Security & Compliance',
    },
  ]);

  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Speed Demon',
      description: 'Resolved 5 tickets in under 30 minutes',
      icon: '⚡',
      unlockedAt: '2025-01-15T09:00:00Z',
    },
    {
      id: '2',
      title: '12-Day Streak',
      description: 'Maintained perfect SLA compliance for 12 days',
      icon: '🔥',
      unlockedAt: '2025-01-14T17:00:00Z',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'new-ticket',
      label: 'Create Ticket',
      icon: <Plus className="h-5 w-5" />,
      action: () => console.log('Create ticket'),
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      icon: <Search className="h-5 w-5" />,
      action: () => console.log('Open knowledge base'),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-5 w-5" />,
      action: () => console.log('Open notifications'),
      badge: 5,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      action: () => console.log('Open settings'),
    },
  ];

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // Simulate real-time updates
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Helper functions
  const getPriorityColor = (priority: QueueTicket['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: QueueTicket['status']) => {
    switch (status) {
      case 'new':
        return 'text-purple-600 bg-purple-50';
      case 'assigned':
        return 'text-blue-600 bg-blue-50';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'pending':
        return 'text-orange-600 bg-orange-50';
      case 'resolved':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSLAUrgency = (minutes: number) => {
    if (minutes <= 30) return 'text-red-600 font-semibold';
    if (minutes <= 60) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getTeamStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
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

  const formatSLATime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Filter tickets
  const filteredTickets = queueTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority =
      filterPriority === 'all' || ticket.priority === filterPriority;

    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Agent Portal
              <span className="ml-3 text-2xl font-normal text-gray-500">Pulse</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Your command center for exceptional service delivery
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                aria-label={action.label}
                className="relative flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
                {action.badge && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {action.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              aria-label={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
              className={`rounded-xl px-4 py-2 text-sm font-medium backdrop-blur-xl transition-all ${
                autoRefresh
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                  : 'bg-white/70 text-gray-700 dark:bg-gray-800/70 dark:text-gray-200'
              }`}
            >
              <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Assigned Tickets */}
          <div className="glass group cursor-pointer rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Assigned Tickets
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.assignedTickets}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="flex items-center text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="ml-1">12% vs yesterday</span>
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Resolved Today */}
          <div className="glass group cursor-pointer rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Resolved Today
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.resolvedToday}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="ml-1">On track</span>
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="glass group cursor-pointer rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Response Time
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.avgResponseTime}m
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="flex items-center text-green-600">
                    <TrendingDown className="h-4 w-4" />
                    <span className="ml-1">15% faster</span>
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
                <Timer className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Satisfaction Score */}
          <div className="glass group cursor-pointer rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Satisfaction Score
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.satisfactionScore}/5
                </p>
                <div className="mt-2 flex items-center text-sm">
                  <div className="flex items-center text-yellow-600">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(stats.satisfactionScore)
                            ? 'fill-yellow-600'
                            : 'fill-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <ThumbsUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics Row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* SLA Compliance */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    SLA Compliance
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.slaCompliance}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="h-16 w-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{stats.slaCompliance}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Points Today */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
                  <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Points Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.pointsToday}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                <p>Rank #{stats.rank}</p>
                <p className="flex items-center justify-end gap-1 text-orange-600">
                  <Award className="h-4 w-4" />
                  {stats.streak} day streak
                </p>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Latest Achievements
              </p>
            </div>
            <div className="space-y-2">
              {recentAchievements.slice(0, 2).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-2 rounded-lg bg-white/50 p-2 dark:bg-gray-800/50"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {achievement.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Ticket Queue (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Queue Header */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  My Ticket Queue
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredTickets.length} tickets
                </span>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border-0 bg-white/70 py-2 pl-10 pr-4 text-sm backdrop-blur-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/70 dark:text-white"
                  />
                </div>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  aria-label="Filter tickets by priority"
                  className="rounded-xl border-0 bg-white/70 px-4 py-2 text-sm backdrop-blur-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/70 dark:text-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  aria-label="Filter tickets by status"
                  className="rounded-xl border-0 bg-white/70 px-4 py-2 text-sm backdrop-blur-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/70 dark:text-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Ticket List */}
            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="glass group cursor-pointer rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono font-medium text-gray-600 dark:text-gray-400">
                          {ticket.number}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}
                        >
                          {ticket.status}
                        </span>
                        {ticket.unreadMessages > 0 && (
                          <span className="flex items-center gap-1 text-xs text-blue-600">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.unreadMessages} new
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {ticket.title}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {ticket.requester}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTimeAgo(ticket.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          {ticket.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">SLA</p>
                      <p className={`text-sm font-bold ${getSLAUrgency(ticket.slaRemaining)}`}>
                        {formatSLATime(ticket.slaRemaining)}
                      </p>
                      <button 
                        aria-label={`Open ticket ${ticket.number}`}
                        className="mt-2 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-blue-700"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTickets.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No tickets found
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (1/3 width) */}
          <div className="space-y-4">
            {/* Team Status */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Team Status
              </h3>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl bg-white/50 p-3 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                          {member.avatar}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getTeamStatusColor(member.status)}`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {member.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {member.activeTickets}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">tickets</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Tickets
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.activeTickets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Pending Tickets
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {stats.pendingTickets}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Escalated Tickets
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    {stats.escalatedTickets}
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule
              </h3>
              <div className="space-y-3">
                <div className="rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Team Stand-up
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">9:00 AM</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Daily sync with the IT support team
                  </p>
                </div>

                <div className="rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Training Session
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">2:00 PM</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    New ticketing system features
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPortalPage;
