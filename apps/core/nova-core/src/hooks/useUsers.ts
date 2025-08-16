import { api } from '@/lib/api';
import type { User } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export interface UserFilters {
  search?: string;
  role?: string;
  status?: 'active' | 'disabled' | 'all';
}

export interface ExtendedUser extends User {
  // Additional properties for user management
  twoFactorEnabled?: boolean;
  lastLogin?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const useUsers = (filters: UserFilters = {}, page = 1, limit = 10) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get users from the API
      const allUsers = await api.getUsers();

      // Apply client-side filtering
      let filteredUsers = allUsers;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower),
        );
      }

      if (filters.role && filters.role !== 'all') {
        filteredUsers = filteredUsers.filter((user) => user.roles?.includes(filters.role!));
      }

      if (filters.status && filters.status !== 'all') {
        filteredUsers = filteredUsers.filter((user) => {
          if (filters.status === 'active') {
            return !user.disabled;
          } else if (filters.status === 'disabled') {
            return user.disabled;
          }
          return true;
        });
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setTotal(filteredUsers.length);
      setTotalPages(Math.ceil(filteredUsers.length / limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.role, filters.status, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (userData: Omit<User, 'id'>): Promise<User | null> => {
    try {
      const newUser = await api.createUser(userData);
      await fetchUsers(); // Refresh the list
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      return null;
    }
  };

  const updateUser = async (id: number, userData: Partial<User>): Promise<User | null> => {
    try {
      const updatedUser = await api.updateUser(id, userData);
      await fetchUsers(); // Refresh the list
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      return null;
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      await api.deleteUser(id);
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      return false;
    }
  };

  const toggleUserStatus = async (id: number): Promise<boolean> => {
    const user = users.find((u) => u.id === id);
    if (!user) return false;

    return (await updateUser(id, { disabled: !user.disabled })) !== null;
  };

  const assignRole = async (userId: number, role: string): Promise<boolean> => {
    const user = users.find((u) => u.id === userId);
    if (!user) return false;

    const updatedRoles = [...(user.roles || []), role];
    return (await updateUser(userId, { roles: updatedRoles })) !== null;
  };

  const removeRole = async (userId: number, role: string): Promise<boolean> => {
    const user = users.find((u) => u.id === userId);
    if (!user) return false;

    const updatedRoles = (user.roles || []).filter((r) => r !== role);
    return (await updateUser(userId, { roles: updatedRoles })) !== null;
  };

  return {
    users,
    loading,
    error,
    total,
    totalPages,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    assignRole,
    removeRole,
    refetch: fetchUsers,
  };
};
