import { Button, Card, Checkbox, Input, Modal } from '@/components/ui';
import { UserFilters, useUsers } from '@/hooks/useUsers';
import type { User, Role } from '@/types';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onAssignRole: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onAssignRole,
}) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded bg-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-12 text-center">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Roles
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500">
                      <span className="text-sm font-medium text-white">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {user.roles?.map((role: string) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {role}
                    </span>
                  )) || <span className="text-sm text-gray-500 italic">No roles assigned</span>}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}
                >
                  {user.disabled ? 'Disabled' : 'Active'}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="rounded p-1 text-indigo-600 hover:text-indigo-900"
                    title="Edit user"
                    aria-label={`Edit user ${user.name}`}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAssignRole(user)}
                    className="rounded p-1 text-blue-600 hover:text-blue-900"
                    title="Manage roles"
                    aria-label={`Manage roles for ${user.name}`}
                  >
                    <ShieldCheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(user)}
                    className={`rounded p-1 ${
                      user.disabled
                        ? 'text-green-600 hover:text-green-900'
                        : 'text-yellow-600 hover:text-yellow-900'
                    }`}
                    title={user.disabled ? 'Enable user' : 'Disable user'}
                    aria-label={`${user.disabled ? 'Enable' : 'Disable'} user ${user.name}`}
                  >
                    {user.disabled ? (
                      <UserPlusIcon className="h-4 w-4" />
                    ) : (
                      <UserMinusIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="rounded p-1 text-red-600 hover:text-red-900"
                    title="Delete user"
                    aria-label={`Delete user ${user.name}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface FilterBarProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange }) => {
  const availableRoles = ['admin', 'user', 'moderator', 'viewer'];

  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
              aria-label="Search users"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="sm:w-40">
          <select
            value={filters.role || 'all'}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                role: e.target.value === 'all' ? undefined : e.target.value,
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter by role"
          >
            <option value="all">All Roles</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:w-40">
          <select
            value={filters.status || 'all'}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status:
                  e.target.value === 'all' ? undefined : (e.target.value as 'active' | 'disabled'),
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  if (totalPages <= 1) return null;

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Go to previous page"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 border-indigo-500 bg-indigo-50 text-indigo-600'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Go to next page"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserManagementPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UserFilters>({});
  const pageSize = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: [] as string[],
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const { addToast } = useToastStore();

  const {
    users,
    loading,
    error,
    total,
    totalPages,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useUsers(filters, currentPage, pageSize);

  const isFormValid = (
    data: { name: string; email: string; password: string; roles: string[] },
    requirePassword = false,
  ) => {
    if (!data.name || !data.email) return false;
    if (requirePassword && !data.password) return false;
    return true;
  };

  useEffect(() => {
    api
      .getRoles()
      .then(setRoles)
      .catch((e) => {
        console.error('Failed to load roles:', e);
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to load roles. Please try again later.',
        });
      });
  }, []);

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', roles: [] });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      roles: user.roles || [],
    });
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      const success = await deleteUser(user.id);
      if (success) {
        addToast({ type: 'success', title: 'Deleted', description: 'User deleted successfully' });
      } else {
        addToast({ type: 'error', title: 'Error', description: 'Failed to delete user' });
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    const success = await toggleUserStatus(user.id);
    if (success) {
      addToast({
        type: 'success',
        title: 'Updated',
        description: `User ${user.disabled ? 'enabled' : 'disabled'} successfully`,
      });
    } else {
      addToast({ type: 'error', title: 'Error', description: 'Failed to update user status' });
    }
  };

  const handleAssignRole = (user: User) => {
    setRoleUser(user);
    setFormData({ name: '', email: '', password: '', roles: user.roles || [] });
  };

  const handleCreateUser = () => {
    setShowCreateModal(true);
  };

  const submitCreateUser = async () => {
    const newUser = await createUser({
      name: formData.name,
      email: formData.email,
      roles: formData.roles,
      permissions: [],
      disabled: false,
    } as Omit<User, 'id'>);
    if (newUser) {
      addToast({
        type: 'success',
        title: 'User Created',
        description: 'User created successfully',
      });
      setShowCreateModal(false);
      resetForm();
    } else {
      addToast({ type: 'error', title: 'Error', description: 'Failed to create user' });
    }
  };

  const submitUpdateUser = async () => {
    if (!editingUser) return;
    const updated = await updateUser(editingUser.id, {
      name: formData.name,
      email: formData.email,
      roles: formData.roles,
      ...(formData.password ? { password: formData.password } : {}),
    });
    if (updated) {
      addToast({ type: 'success', title: 'Updated', description: 'User updated successfully' });
      setEditingUser(null);
      resetForm();
    } else {
      addToast({ type: 'error', title: 'Error', description: 'Failed to update user' });
    }
  };

  const saveRoles = async () => {
    if (!roleUser) return;
    const updated = await updateUser(roleUser.id, { roles: formData.roles });
    if (updated) {
      addToast({
        type: 'success',
        title: 'Roles Updated',
        description: 'Roles updated successfully',
      });
      setRoleUser(null);
      resetForm();
    } else {
      addToast({ type: 'error', title: 'Error', description: 'Failed to update roles' });
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    setRoleUser(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center text-2xl font-bold text-gray-900">
            <UsersIcon className="mr-3 h-8 w-8 text-indigo-600" />
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user accounts, roles, and permissions across Nova Universe
          </p>
        </div>
        <button
          onClick={handleCreateUser}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Add User
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <Card className="overflow-hidden">
        <FilterBar filters={filters} onFiltersChange={setFilters} />
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onAssignRole={handleAssignRole}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          limit={pageSize}
          onPageChange={setCurrentPage}
        />
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={closeModals} title="Create User">
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Roles</label>
            <div className="space-y-2">
              {roles.map((role) => (
                <Checkbox
                  key={role.id}
                  label={role.name}
                  checked={formData.roles.includes(role.name)}
                  onChange={(checked) => {
                    if (checked) {
                      setFormData({ ...formData, roles: [...formData.roles, role.name] });
                    } else {
                      setFormData({
                        ...formData,
                        roles: formData.roles.filter((r) => r !== role.name),
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={closeModals}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submitCreateUser}
            disabled={!isFormValid(formData, true)}
          >
            Create
          </Button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={closeModals}
        title={editingUser ? `Edit ${editingUser.name}` : 'Edit User'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Leave blank to keep current"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Roles</label>
            <div className="space-y-2">
              {roles.map((role) => (
                <Checkbox
                  key={role.id}
                  label={role.name}
                  checked={formData.roles.includes(role.name)}
                  onChange={(checked) => {
                    if (checked) {
                      setFormData({ ...formData, roles: [...formData.roles, role.name] });
                    } else {
                      setFormData({
                        ...formData,
                        roles: formData.roles.filter((r) => r !== role.name),
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={closeModals}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={submitUpdateUser}
            disabled={!formData.name || !formData.email}
          >
            Save
          </Button>
        </div>
      </Modal>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={!!roleUser}
        onClose={closeModals}
        title={roleUser ? `Roles for ${roleUser.name}` : 'Assign Roles'}
      >
        <div className="space-y-4">
          {roles.map((role) => (
            <Checkbox
              key={role.id}
              label={role.name}
              checked={formData.roles.includes(role.name)}
              onChange={(checked) => {
                if (checked) {
                  setFormData({ ...formData, roles: [...formData.roles, role.name] });
                } else {
                  setFormData({
                    ...formData,
                    roles: formData.roles.filter((r) => r !== role.name),
                  });
                }
              }}
            />
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={closeModals}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveRoles}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
};
