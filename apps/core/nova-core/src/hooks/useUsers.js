import { api } from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';
export const useUsers = (filters = {}, page = 1, limit = 10) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        filteredUsers = filteredUsers.filter((user) => user.roles?.includes(filters.role));
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
  const createUser = async (userData) => {
    try {
      const newUser = await api.createUser(userData);
      await fetchUsers(); // Refresh the list
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      return null;
    }
  };
  const updateUser = async (id, userData) => {
    try {
      const updatedUser = await api.updateUser(id, userData);
      await fetchUsers(); // Refresh the list
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      return null;
    }
  };
  const deleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      return false;
    }
  };
  const toggleUserStatus = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return false;
    return (await updateUser(id, { disabled: !user.disabled })) !== null;
  };
  const assignRole = async (userId, role) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return false;
    const updatedRoles = [...(user.roles || []), role];
    return (await updateUser(userId, { roles: updatedRoles })) !== null;
  };
  const removeRole = async (userId, role) => {
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
