import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  FileText,
  Send,
  MessageSquare,
  Paperclip,
  TrendingUp,
  Activity,
  BarChart3,
  Filter,
  Search,
  Plus,
  MoreVertical,
  ArrowRight,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Download,
} from 'lucide-react';

// Types
interface ChangeRequest {
  id: string;
  number: string;
  title: string;
  description: string;
  type: 'standard' | 'normal' | 'emergency';
  category: string;
  status: 'draft' | 'assessment' | 'approved' | 'scheduled' | 'implementing' | 'review' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  risk: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  requester: {
    name: string;
    avatar: string;
    email: string;
  };
  implementer: {
    name: string;
    avatar: string;
  };
  cab: {
    date: string;
    approved: boolean | null;
  };
  timeline: {
    startDate: string;
    endDate: string;
    duration: string;
  };
  affectedServices: string[];
  approvers: Array<{
    name: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: string;
  }>;
  backoutPlan: string;
  testPlan: string;
  createdAt: string;
  updatedAt: string;
}

interface ChangeStats {
  total: number;
  approved: number;
  scheduled: number;
  implementing: number;
  successRate: number;
}

const ChangeManagementPage: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'standard' | 'normal' | 'emergency'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedChange, setSelectedChange] = useState<ChangeRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my-changes' | 'cab' | 'calendar'>('all');

  // Sample Data
  const stats: ChangeStats = {
    total: 234,
    approved: 89,
    scheduled: 12,
    implementing: 3,
    successRate: 94.7,
  };

  const changes: ChangeRequest[] = [
    {
      id: 'chg-001',
      number: 'CHG0012345',
      title: 'Database Server Upgrade - Production Environment',
      description: 'Upgrade PostgreSQL from version 14 to 16 for improved performance and security features.',
      type: 'normal',
      category: 'Infrastructure',
      status: 'approved',
      priority: 'high',
      risk: 'medium',
      impact: 'high',
      requester: {
        name: 'Sarah Johnson',
        avatar: 'SJ',
        email: 'sarah.johnson@company.com',
      },
      implementer: {
        name: 'Mike Chen',
        avatar: 'MC',
      },
      cab: {
        date: '2025-01-25T14:00:00Z',
        approved: true,
      },
      timeline: {
        startDate: '2025-02-01T22:00:00Z',
        endDate: '2025-02-02T02:00:00Z',
        duration: '4 hours',
      },
      affectedServices: ['Customer Portal', 'API Gateway', 'Reporting Service'],
      approvers: [
        { name: 'David Park', role: 'Technical Lead', status: 'approved', date: '2025-01-24' },
        { name: 'Emma Wilson', role: 'Infrastructure Manager', status: 'approved', date: '2025-01-24' },
        { name: 'Lisa Anderson', role: 'CAB Chair', status: 'approved', date: '2025-01-25' },
      ],
      backoutPlan: 'Restore from backup snapshot created before upgrade. Estimated rollback time: 1 hour.',
      testPlan: 'Comprehensive testing in staging environment completed. Smoke tests to be performed post-upgrade.',
      createdAt: '2025-01-20T10:00:00Z',
      updatedAt: '2025-01-25T14:30:00Z',
    },
    {
      id: 'chg-002',
      number: 'CHG0012346',
      title: 'Emergency Security Patch - Web Application Firewall',
      description: 'Critical security patch to address CVE-2025-0001 vulnerability in WAF configuration.',
      type: 'emergency',
      category: 'Security',
      status: 'implementing',
      priority: 'critical',
      risk: 'low',
      impact: 'medium',
      requester: {
        name: 'Security Team',
        avatar: 'ST',
        email: 'security@company.com',
      },
      implementer: {
        name: 'Alex Rodriguez',
        avatar: 'AR',
      },
      cab: {
        date: '2025-01-26T09:00:00Z',
        approved: true,
      },
      timeline: {
        startDate: '2025-01-26T10:00:00Z',
        endDate: '2025-01-26T11:00:00Z',
        duration: '1 hour',
      },
      affectedServices: ['All Web Services'],
      approvers: [
        { name: 'John Smith', role: 'CISO', status: 'approved', date: '2025-01-26' },
        { name: 'Lisa Anderson', role: 'CAB Chair', status: 'approved', date: '2025-01-26' },
      ],
      backoutPlan: 'Revert to previous WAF configuration. No expected downtime.',
      testPlan: 'Patch tested in dev environment. Emergency change approved by CISO.',
      createdAt: '2025-01-26T08:00:00Z',
      updatedAt: '2025-01-26T10:15:00Z',
    },
    {
      id: 'chg-003',
      number: 'CHG0012347',
      title: 'Network Switch Replacement - Building A',
      description: 'Replace aging network switches in Building A to improve network reliability and performance.',
      type: 'standard',
      category: 'Network',
      status: 'scheduled',
      priority: 'medium',
      risk: 'low',
      impact: 'medium',
      requester: {
        name: 'Network Team',
        avatar: 'NT',
        email: 'network@company.com',
      },
      implementer: {
        name: 'David Brown',
        avatar: 'DB',
      },
      cab: {
        date: '2025-01-22T14:00:00Z',
        approved: true,
      },
      timeline: {
        startDate: '2025-02-05T20:00:00Z',
        endDate: '2025-02-05T23:00:00Z',
        duration: '3 hours',
      },
      affectedServices: ['Building A Network', 'VoIP Services'],
      approvers: [
        { name: 'Mike Chen', role: 'Network Lead', status: 'approved', date: '2025-01-21' },
        { name: 'Emma Wilson', role: 'Infrastructure Manager', status: 'approved', date: '2025-01-22' },
      ],
      backoutPlan: 'Reconnect old switches if issues arise. Estimated rollback time: 30 minutes.',
      testPlan: 'Switch configuration tested in lab environment. Backup switches available.',
      createdAt: '2025-01-18T09:00:00Z',
      updatedAt: '2025-01-22T14:45:00Z',
    },
    {
      id: 'chg-004',
      number: 'CHG0012348',
      title: 'CRM System Update - Version 5.2 to 5.3',
      description: 'Update CRM system to latest version with enhanced reporting and mobile app improvements.',
      type: 'normal',
      category: 'Application',
      status: 'assessment',
      priority: 'medium',
      risk: 'medium',
      impact: 'low',
      requester: {
        name: 'Sales Operations',
        avatar: 'SO',
        email: 'sales-ops@company.com',
      },
      implementer: {
        name: 'Emma Wilson',
        avatar: 'EW',
      },
      cab: {
        date: '2025-02-01T14:00:00Z',
        approved: null,
      },
      timeline: {
        startDate: '2025-02-08T20:00:00Z',
        endDate: '2025-02-08T22:00:00Z',
        duration: '2 hours',
      },
      affectedServices: ['CRM Platform', 'Mobile App'],
      approvers: [
        { name: 'Sarah Johnson', role: 'App Dev Lead', status: 'approved', date: '2025-01-25' },
        { name: 'David Park', role: 'Technical Lead', status: 'pending' },
        { name: 'Lisa Anderson', role: 'CAB Chair', status: 'pending' },
      ],
      backoutPlan: 'Database backup and application rollback procedure documented.',
      testPlan: 'UAT completed with sales team. Performance testing completed.',
      createdAt: '2025-01-24T11:00:00Z',
      updatedAt: '2025-01-26T09:20:00Z',
    },
  ];

  // Filter changes
  const filteredChanges = changes.filter((change) => {
    const matchesSearch =
      searchQuery === '' ||
      change.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || change.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || change.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'normal':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'standard':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'implementing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'scheduled':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'closed':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      default:
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
              Change Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Plan, approve, and implement changes with minimal risk - {filteredChanges.length} active changes
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl">
            <Plus className="h-5 w-5" />
            New Change Request
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Changes</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.scheduled}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.implementing}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.successRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {(['all', 'my-changes', 'cab', 'calendar'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-6 py-2 font-medium transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/70 text-gray-700 backdrop-blur-xl hover:bg-white hover:shadow dark:bg-gray-800/70 dark:text-gray-300'
            }`}
          >
            {tab.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search changes by number, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white/70 py-3 pl-12 pr-4 backdrop-blur-xl transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/70"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70"
        >
          <option value="all">All Types</option>
          <option value="standard">Standard</option>
          <option value="normal">Normal</option>
          <option value="emergency">Emergency</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="assessment">Assessment</option>
          <option value="approved">Approved</option>
          <option value="scheduled">Scheduled</option>
          <option value="implementing">Implementing</option>
          <option value="review">Review</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button className="rounded-xl bg-white/70 p-3 backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800">
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Changes List */}
      <div className="space-y-4">
        {filteredChanges.map((change) => (
          <div
            key={change.id}
            className="group rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur-xl transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/70"
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{change.number}</span>
                  <span className={`rounded-lg px-3 py-1 text-xs font-medium ${getTypeColor(change.type)}`}>
                    {change.type.toUpperCase()}
                  </span>
                  <span className={`rounded-lg px-3 py-1 text-xs font-medium ${getStatusColor(change.status)}`}>
                    {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(change.priority)}`}>
                    {change.priority.toUpperCase()} Priority
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold transition-all group-hover:text-blue-600">{change.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{change.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 opacity-0 transition-all hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-700">
                  <Eye className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 opacity-0 transition-all hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-700">
                  <Edit className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 opacity-0 transition-all hover:bg-gray-100 group-hover:opacity-100 dark:hover:bg-gray-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="mb-4 grid grid-cols-4 gap-4">
              <div>
                <div className="mb-1 text-xs text-gray-500">Category</div>
                <div className="font-medium">{change.category}</div>
              </div>
              <div>
                <div className="mb-1 text-xs text-gray-500">Risk Level</div>
                <div className={`font-medium ${getRiskColor(change.risk)}`}>
                  {change.risk.charAt(0).toUpperCase() + change.risk.slice(1)}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-gray-500">Impact</div>
                <div className="font-medium">{change.impact.charAt(0).toUpperCase() + change.impact.slice(1)}</div>
              </div>
              <div>
                <div className="mb-1 text-xs text-gray-500">Duration</div>
                <div className="flex items-center gap-1 font-medium">
                  <Clock className="h-4 w-4" />
                  {change.timeline.duration}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/30">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-500">Scheduled Start</div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    {new Date(change.timeline.startDate).toLocaleString()}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-500">Scheduled End</div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    {new Date(change.timeline.endDate).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Affected Services */}
            <div className="mb-4">
              <div className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">Affected Services</div>
              <div className="flex flex-wrap gap-2">
                {change.affectedServices.map((service) => (
                  <span
                    key={service}
                    className="rounded-lg bg-orange-500/10 px-3 py-1 text-sm text-orange-600 dark:text-orange-400"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Team & Approvals */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-semibold text-white">
                    {change.requester.avatar}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Requester</div>
                    <div className="text-sm font-medium">{change.requester.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-xs font-semibold text-white">
                    {change.implementer.avatar}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Implementer</div>
                    <div className="text-sm font-medium">{change.implementer.name}</div>
                  </div>
                </div>

                <div className="ml-4">
                  <div className="text-xs text-gray-500">Approvals</div>
                  <div className="flex items-center gap-1">
                    {change.approvers.map((approver, idx) => (
                      <div
                        key={idx}
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                          approver.status === 'approved'
                            ? 'bg-green-500/10 text-green-600'
                            : approver.status === 'rejected'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-gray-500/10 text-gray-600'
                        }`}
                      >
                        {approver.status === 'approved' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : approver.status === 'rejected' ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-600 transition-all hover:bg-blue-500/20 dark:text-blue-400">
                View Details
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredChanges.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white/70 p-12 text-center backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/70">
          <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">No changes found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChangeManagementPage;
