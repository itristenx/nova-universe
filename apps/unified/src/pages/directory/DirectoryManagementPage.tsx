import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  UserPlus,
  UserMinus,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Shield,
  Filter,
  Download,
  Upload,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Activity,
  TrendingUp,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Eye,
  Lock,
  Unlock,
  Key,
  Folder,
  FolderPlus,
} from 'lucide-react';
import backendAPI from '@services/backend-api-client';

/**
 * Directory Management Page
 * 
 * Comprehensive user and group directory management with:
 * - User directory with search and filtering
 * - Group management and organization
 * - Bulk operations (add, remove, disable users)
 * - Role and permission management
 * - Department and team organization
 * - Import/Export capabilities
 * - Activity audit trail
 * 
 * Design: Apple Liquid Glass 2025
 * - Glassmorphism with backdrop blur
 * - Spring animations (400ms, cubic-bezier)
 * - SF Pro typography
 * - 8px grid system
 */

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  title: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  joinedDate: string;
  permissions: string[];
  groups: string[];
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: 'department' | 'team' | 'role' | 'custom';
  memberCount: number;
  permissions: string[];
  createdAt: string;
  createdBy: string;
}

interface DirectoryStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  totalGroups: number;
  newUsersThisMonth: number;
}

const DirectoryManagementPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'audit'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [stats, setStats] = useState<DirectoryStats>({
    totalUsers: 247,
    activeUsers: 218,
    inactiveUsers: 15,
    suspendedUsers: 14,
    totalGroups: 32,
    newUsersThisMonth: 18,
  });

  // Search users via backend API
  useEffect(() => {
    async function searchBackend() {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        if (activeTab === 'users') {
          const results = await backendAPI.directory.searchUsers(searchQuery);
          setSearchResults(results);
        } else if (activeTab === 'groups') {
          const results = await backendAPI.directory.searchGroups(searchQuery);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }

    const timeoutId = setTimeout(searchBackend, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, activeTab]);

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      avatar: 'SJ',
      role: 'Administrator',
      department: 'IT',
      title: 'IT Director',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      status: 'active',
      lastActive: '2025-01-15T10:30:00Z',
      joinedDate: '2023-03-15',
      permissions: ['admin', 'users.manage', 'groups.manage', 'reports.view'],
      groups: ['IT Department', 'Administrators', 'Management'],
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      avatar: 'MC',
      role: 'Agent',
      department: 'IT Support',
      title: 'Senior Support Engineer',
      phone: '+1 (555) 234-5678',
      location: 'New York, NY',
      status: 'active',
      lastActive: '2025-01-15T09:45:00Z',
      joinedDate: '2022-08-20',
      permissions: ['tickets.manage', 'knowledge.edit', 'reports.view'],
      groups: ['IT Support', 'Agents', 'Level 2 Support'],
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      avatar: 'ER',
      role: 'Manager',
      department: 'Operations',
      title: 'Operations Manager',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      status: 'active',
      lastActive: '2025-01-15T08:15:00Z',
      joinedDate: '2021-11-10',
      permissions: ['reports.manage', 'users.view', 'approvals.manage'],
      groups: ['Operations', 'Managers', 'Approvers'],
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.kim@company.com',
      avatar: 'DK',
      role: 'User',
      department: 'Marketing',
      title: 'Marketing Specialist',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      status: 'inactive',
      lastActive: '2025-01-10T16:20:00Z',
      joinedDate: '2024-05-15',
      permissions: ['tickets.create', 'knowledge.view'],
      groups: ['Marketing', 'End Users'],
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      avatar: 'LA',
      role: 'Agent',
      department: 'IT Support',
      title: 'Support Engineer',
      phone: '+1 (555) 567-8901',
      location: 'Boston, MA',
      status: 'suspended',
      lastActive: '2025-01-05T14:30:00Z',
      joinedDate: '2023-09-01',
      permissions: ['tickets.manage', 'knowledge.view'],
      groups: ['IT Support', 'Agents'],
    },
  ]);

  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'IT Department',
      description: 'Information Technology department members',
      type: 'department',
      memberCount: 45,
      permissions: ['tickets.manage', 'assets.view', 'knowledge.edit'],
      createdAt: '2023-01-15T10:00:00Z',
      createdBy: 'System',
    },
    {
      id: '2',
      name: 'Administrators',
      description: 'System administrators with full access',
      type: 'role',
      memberCount: 8,
      permissions: ['admin', 'users.manage', 'groups.manage', 'system.config'],
      createdAt: '2023-01-15T10:00:00Z',
      createdBy: 'System',
    },
    {
      id: '3',
      name: 'Level 2 Support',
      description: 'Escalation team for complex technical issues',
      type: 'team',
      memberCount: 12,
      permissions: ['tickets.manage', 'escalations.handle', 'knowledge.edit'],
      createdAt: '2023-06-20T14:30:00Z',
      createdBy: 'Sarah Johnson',
    },
    {
      id: '4',
      name: 'Approvers',
      description: 'Users who can approve requests and changes',
      type: 'custom',
      memberCount: 23,
      permissions: ['approvals.manage', 'requests.approve'],
      createdAt: '2023-08-10T09:00:00Z',
      createdBy: 'Sarah Johnson',
    },
  ]);

  // Helper functions
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'suspended':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'inactive':
        return <XCircle className="h-4 w-4" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getGroupTypeColor = (type: Group['type']) => {
    switch (type) {
      case 'department':
        return 'text-blue-600 bg-blue-50';
      case 'team':
        return 'text-purple-600 bg-purple-50';
      case 'role':
        return 'text-green-600 bg-green-50';
      case 'custom':
        return 'text-orange-600 bg-orange-50';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesDepartment && matchesStatus && matchesRole;
  });

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  // Bulk actions
  const handleBulkAction = (action: 'activate' | 'deactivate' | 'suspend' | 'delete') => {
    console.log(`Bulk ${action} for users:`, selectedUsers);
    setSelectedUsers([]);
  };

  // Render Users Tab
  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.activeUsers}
              </p>
            </div>
            <div className="rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive Users</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.inactiveUsers}
              </p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-700/30">
              <UserX className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.newUsersThisMonth}
              </p>
              <p className="mt-1 flex items-center text-xs text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12% vs last month
              </p>
            </div>
            <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
              <UserPlus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-0 bg-white/70 py-2 pl-10 pr-4 text-sm backdrop-blur-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/70 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              aria-label="Filter users by department"
              className="rounded-xl border-0 bg-white/70 px-4 py-2 text-sm backdrop-blur-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/70 dark:text-white"
            >
              <option value="all">All Departments</option>
              <option value="IT">IT</option>
              <option value="IT Support">IT Support</option>
              <option value="Operations">Operations</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter users by status"
              className="rounded-xl border-0 bg-white/70 px-4 py-2 text-sm backdrop-blur-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/70 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              aria-label="Filter users by role"
              className="rounded-xl border-0 bg-white/70 px-4 py-2 text-sm backdrop-blur-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800/70 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Manager">Manager</option>
              <option value="Agent">Agent</option>
              <option value="User">User</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button 
              aria-label="Export users"
              className="rounded-xl bg-white/70 p-2 backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800"
            >
              <Download className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
            <button 
              aria-label="Import users"
              className="rounded-xl bg-white/70 p-2 backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800"
            >
              <Upload className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
            <button
              onClick={() => setShowUserModal(true)}
              aria-label="Add new user"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
            >
              <UserPlus className="h-5 w-5" />
              Add User
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Suspend
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="glass group cursor-pointer rounded-2xl p-6 transition-all hover:shadow-xl"
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUserSelection(user.id)}
                aria-label={`Select user ${user.name}`}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              {/* Avatar */}
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
                {user.avatar}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.title}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(user.status)}`}
                    >
                      {getStatusIcon(user.status)}
                      {user.status}
                    </span>
                    <button 
                      aria-label={`More options for ${user.name}`}
                      className="rounded-lg p-2 opacity-0 transition-all hover:bg-white group-hover:opacity-100 dark:hover:bg-gray-800"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="h-4 w-4" />
                    <span>{user.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Last active {formatTimeAgo(user.lastActive)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {formatDate(user.joinedDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {user.groups.length} groups
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No users found</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Groups Tab
  const renderGroupsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Groups</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage departments, teams, and roles
            </p>
          </div>
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
          >
            <FolderPlus className="h-5 w-5" />
            Create Group
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div
            key={group.id}
            className="glass group cursor-pointer rounded-2xl p-6 transition-all hover:scale-105 hover:shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${getGroupTypeColor(group.type)}`}
              >
                {group.type}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {group.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{group.description}</p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>{group.memberCount} members</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Key className="h-4 w-4" />
                <span>{group.permissions.length} permissions</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>Created {formatDate(group.createdAt)}</span>
              <button className="text-blue-600 opacity-0 transition-all group-hover:opacity-100 hover:text-blue-700">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Audit Tab
  const renderAuditTab = () => (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Activity Audit</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Track all user and group management activities (Coming soon)
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Directory Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage users, groups, and organizational structure
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              aria-label="Group settings"
              className="rounded-xl bg-white/70 p-3 backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800"
            >
              <Settings className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
            <button 
              aria-label="Refresh groups"
              className="rounded-xl bg-white/70 p-3 backdrop-blur-xl transition-all hover:bg-white hover:shadow-lg dark:bg-gray-800/70 dark:hover:bg-gray-800"
            >
              <RefreshCw className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="glass rounded-2xl p-2">
          <div className="flex gap-2">
            {[
              { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
              { id: 'groups', label: 'Groups', icon: <Folder className="h-5 w-5" /> },
              { id: 'audit', label: 'Audit Log', icon: <Activity className="h-5 w-5" /> },
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
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'groups' && renderGroupsTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>
    </div>
  );
};

export default DirectoryManagementPage;
