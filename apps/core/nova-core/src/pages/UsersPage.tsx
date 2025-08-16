import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Modal, Checkbox } from '@/components/ui';
import {
  UsersIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  PowerIcon,
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { useToastStore } from '@/stores/toast';
import type { User, Role } from '@/types';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  roles: string[];
  permissions: string[];
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToastStore();

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    roles: [],
    permissions: [],
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load users',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await api.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      roles: [],
      permissions: [],
    });
  };

  const handleCreateUser = async () => {
    try {
      const newUser = await api.createUser({
        name: formData.name,
        email: formData.email,
        roles: formData.roles,
        permissions: formData.permissions,
      } as Omit<User, 'id'>);
      setUsers([...users, newUser]);
      setShowCreateModal(false);
      resetForm();
      addToast({
        type: 'success',
        title: 'Success',
        description: 'User created successfully',
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create user',
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await api.updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        roles: formData.roles,
        ...(formData.password && { password: formData.password }),
      });

      setUsers(
        users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: formData.name,
                email: formData.email,
                roles: formData.roles,
              }
            : u,
        ),
      );

      setEditingUser(null);
      resetForm();
      addToast({
        type: 'success',
        title: 'Success',
        description: 'User updated successfully',
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to update user',
      });
    }
  };

  const deleteUser = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(id);
        setUsers(users.filter((u) => u.id !== id));
        addToast({
          type: 'success',
          title: 'Success',
          description: 'User deleted successfully',
        });
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        addToast({
          type: 'error',
          title: 'Error',
          description: error.response?.data?.error || 'Failed to delete user. Please try again.',
        });
      }
    }
  };

  const toggleUserStatus = async (user: User) => {
    const action = user.disabled ? 'enable' : 'disable';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await api.updateUser(user.id, {
          disabled: !user.disabled,
        });
        setUsers(users.map((u) => (u.id === user.id ? { ...u, disabled: !user.disabled } : u)));
        addToast({
          type: 'success',
          title: 'Success',
          description: `User ${action}d successfully`,
        });
      } catch (error: any) {
        console.error(`Failed to ${action} user:`, error);
        addToast({
          type: 'error',
          title: 'Error',
          description: error.response?.data?.error || `Failed to ${action} user. Please try again.`,
        });
      }
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      roles: user.roles || [],
      permissions: user.permissions || [],
    });
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setEditingUser(null);
    resetForm();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <div className="flex items-center">
            <div className="rounded-lg bg-blue-500 p-3">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="rounded-lg bg-green-500 p-3">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter((u) => u.roles?.includes('admin')).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="rounded-lg bg-purple-500 p-3">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Regular Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter((u) => !u.roles?.includes('admin')).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'No users found' : 'No users found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first user account.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            )}
          </div>
        ) : (
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Permissions
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 ${user.disabled ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${user.disabled ? 'bg-gray-400' : 'bg-primary-600'}`}
                        >
                          <span className="text-sm font-medium text-white">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                            {user.isDefault && (
                              <span className="ml-2 inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {user.email}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                          >
                            {role}
                          </span>
                        )) || <span className="text-sm text-gray-500">No roles assigned</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.permissions?.length || 0} permissions
                      </div>
                    </td>
                    <td className="space-x-2 px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>

                      {/* Disable/Enable button - only show if not default user */}
                      {!user.isDefault && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                          className={
                            user.disabled
                              ? 'text-green-600 hover:text-green-900'
                              : 'text-orange-600 hover:text-orange-900'
                          }
                          title={user.disabled ? 'Enable user' : 'Disable user'}
                        >
                          <PowerIcon className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Delete button - only show if not default user */}
                      {!user.isDefault && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create User Modal */}
      <Modal isOpen={showCreateModal} onClose={closeModals} title="Create New User" size="md">
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter user name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password"
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
            onClick={handleCreateUser}
            disabled={!formData.name || !formData.email || !formData.password}
          >
            Create User
          </Button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={closeModals}
        title={`Edit User: ${editingUser?.name}`}
        size="md"
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
            placeholder="Leave blank to keep current password"
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
            onClick={handleUpdateUser}
            disabled={!formData.name || !formData.email}
          >
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
};
