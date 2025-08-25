import { useEffect, useState } from 'react';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { UserCreateModal } from '@components/admin/UserCreateModal';
import { UserEditModal } from '@components/admin/UserEditModal';
import { cn, formatNumber } from '@utils/index';
import { useUserStore } from '@stores/users';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});

  const {
    users,
    selectedUsers,
    stats,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalUsers,
    totalPages,
    getUsers,
    getUserStats,
    activateUser,
    deactivateUser,
    deleteUser,
    resetUserPassword,
    selectAllUsers,
    clearSelection,
    toggleUserSelection,
    setFilters,
    setPage,
    refreshUsers,
  } = useUserStore();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([getUsers(), getUserStats()]);
    };
    loadData();
  }, [getUsers, getUserStats]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filters: any = { ...localFilters };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      setFilters(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, localFilters, setFilters]);

  const handleBulkAction = async (action: string) => {
    const userIds = Array.from(selectedUsers);
    if (userIds.length === 0) {
      toast.error('Please select users first');
      return;
    }

    try {
      switch (action) {
        case 'activate':
          for (const userId of userIds) {
            await activateUser(userId);
          }
          break;
        case 'deactivate':
          for (const userId of userIds) {
            await deactivateUser(userId);
          }
          break;
        case 'delete':
          if (confirm(`Delete ${userIds.length} users? This cannot be undone.`)) {
            for (const userId of userIds) {
              await deleteUser(userId);
            }
          }
          break;
      }
      clearSelection();
    } catch (_error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'activate':
          await activateUser(userId);
          break;
        case 'deactivate':
          await deactivateUser(userId);
          break;
        case 'delete':
          if (confirm('Delete this user? This cannot be undone.')) {
            await deleteUser(userId);
          }
          break;
        case 'reset-password':
          const tempPassword = await resetUserPassword(userId);
          if (tempPassword) {
            toast.success(`Temporary password: ${tempPassword}`);
          }
          break;
        case 'edit':
          const user = users.find((u) => u.id === userId);
          if (user) {
            setEditingUser(user);
          }
          break;
      }
    } catch (_error) {
      console.error('User action failed:', error);
    }
  };

  const handleUserUpdate = async () => {
    setEditingUser(null);
    await refreshUsers();
  };

  const handleUserCreate = async () => {
    setShowCreateModal(false);
    await refreshUsers();
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setLocalFilters(newFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setSearchQuery('');
  };

  // Show error if there's an issue loading data
  if (error && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
            <p className="mt-1 text-red-600 dark:text-red-400">Error loading users: {error}</p>
          </div>
        </div>

        <div className="card p-12 text-center">
          <div className="text-red-600 dark:text-red-400">
            Failed to load user data. Please try again.
          </div>
          <button onClick={() => refreshUsers()} className="btn btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/admin/users/import', '_blank')}
            className="btn btn-secondary"
          >
            Import Users
          </button>

          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <PlusIcon className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="card p-4 text-center">
          <div className="text-nova-600 text-2xl font-bold">{formatNumber(stats?.total || 0)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(stats?.active || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatNumber(stats?.inactive || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {formatNumber(stats?.byRole?.admin || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Admins</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(stats?.byRole?.agent || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Agents</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {formatNumber(stats?.byRole?.user || 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">End Users</div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'btn btn-secondary',
                showFilters && 'bg-nova-100 text-nova-700 dark:bg-nova-900 dark:text-nova-300',
              )}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {Object.keys(localFilters).length > 0 && (
                <span className="bg-nova-600 ml-1 rounded-full px-2 py-0.5 text-xs text-white">
                  {Object.keys(localFilters).length}
                </span>
              )}
            </button>

            <button
              onClick={() => refreshUsers()}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Refresh'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                <select
                  value={localFilters.role || ''}
                  onChange={(e) =>
                    handleFiltersChange({ ...localFilters, role: e.target.value || undefined })
                  }
                  className="input"
                  aria-label="Filter by role"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={
                    localFilters.isActive !== undefined
                      ? localFilters.isActive
                        ? 'active'
                        : 'inactive'
                      : ''
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFiltersChange({
                      ...localFilters,
                      isActive: value === '' ? undefined : value === 'active',
                    });
                  }}
                  className="input"
                  aria-label="Filter by status"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-end">
                <button onClick={handleClearFilters} className="btn btn-secondary w-full">
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selectedUsers.size > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatNumber(selectedUsers.size)} user{selectedUsers.size !== 1 ? 's' : ''}{' '}
                selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="btn btn-secondary btn-sm"
                >
                  <LockOpenIcon className="h-4 w-4" />
                  Activate
                </button>

                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="btn btn-secondary btn-sm"
                >
                  <LockClosedIcon className="h-4 w-4" />
                  Deactivate
                </button>

                <button onClick={() => handleBulkAction('delete')} className="btn btn-error btn-sm">
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            <button onClick={() => clearSelection()} className="btn btn-ghost btn-sm">
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        {isLoading && users.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner size="lg" text="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              No users found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Get started by adding your first user
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary mt-4">
              <PlusIcon className="h-4 w-4" />
              Add User
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="w-8 px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size > 0 && selectedUsers.size === users.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllUsers();
                        } else {
                          clearSelection();
                        }
                      }}
                      className="checkbox"
                      aria-label="Select all users"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="checkbox"
                        aria-label={`Select user ${user.firstName} ${user.lastName}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="bg-nova-100 dark:bg-nova-900 flex h-10 w-10 items-center justify-center rounded-full">
                            <span className="text-nova-700 dark:text-nova-300 text-sm font-medium">
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role.id}
                            className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                              role.name === 'admin' &&
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                              role.name === 'agent' &&
                                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                              role.name === 'user' &&
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                            )}
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                        )}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUserAction('edit', user.id)}
                          className="text-nova-600 hover:text-nova-700 dark:text-nova-400 dark:hover:text-nova-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleUserAction(user.isActive ? 'deactivate' : 'activate', user.id)
                          }
                          className={cn(
                            user.isActive
                              ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                              : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
                          )}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleUserAction('reset-password', user.id)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Reset Password
                        </button>
                        <button
                          onClick={() => handleUserAction('delete', user.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Showing{' '}
                      <span className="font-medium">
                        {Math.min((currentPage - 1) * pageSize + 1, totalUsers)}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, totalUsers)}
                      </span>{' '}
                      of <span className="font-medium">{totalUsers}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                        className="btn btn-secondary btn-sm rounded-r-none"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setPage(page)}
                            className={cn(
                              'btn btn-sm rounded-none',
                              page === currentPage ? 'btn-primary' : 'btn-secondary',
                            )}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                        className="btn btn-secondary btn-sm rounded-l-none"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleUserCreate}
      />

      {/* Edit User Modal */}
      <UserEditModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={handleUserUpdate}
      />
    </div>
  );
}
