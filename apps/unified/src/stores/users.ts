import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { userService, type User, type UserFilters, type CreateUserData, type UpdateUserData, type Role, type UserStats } from '@services/users'
import toast from 'react-hot-toast'

interface UserState {
  // Current state
  users: User[]
  selectedUsers: Set<string>
  roles: Role[]
  stats: UserStats | null
  isLoading: boolean
  error: string | null

  // Pagination
  currentPage: number
  pageSize: number
  totalUsers: number
  totalPages: number

  // Filters
  filters: UserFilters

  // Actions
  getUsers: (page?: number, limit?: number, filters?: UserFilters) => Promise<void>
  getUserById: (id: string) => Promise<User | null>
  createUser: (userData: CreateUserData) => Promise<User | null>
  updateUser: (id: string, userData: UpdateUserData) => Promise<User | null>
  deleteUser: (id: string) => Promise<boolean>
  activateUser: (id: string) => Promise<boolean>
  deactivateUser: (id: string) => Promise<boolean>
  resetUserPassword: (id: string) => Promise<string | null>
  getRoles: () => Promise<void>
  getUserStats: () => Promise<void>
  bulkUpdateUsers: (userIds: string[], updates: Partial<UpdateUserData>) => Promise<boolean>

  // Selection management
  selectUser: (userId: string) => void
  selectAllUsers: () => void
  clearSelection: () => void
  toggleUserSelection: (userId: string) => void

  // Filters
  setFilters: (filters: Partial<UserFilters>) => void
  clearFilters: () => void

  // Pagination
  setPage: (page: number) => void
  setPageSize: (size: number) => void

  // Utils
  refreshUsers: () => Promise<void>
  clearError: () => void
}

export const useUserStore = create<UserState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    users: [],
    selectedUsers: new Set<string>(),
    roles: [],
    stats: null,
    isLoading: false,
    error: null,

    // Pagination
    currentPage: 1,
    pageSize: 20,
    totalUsers: 0,
    totalPages: 0,

    // Filters
    filters: {},

    // Actions
    getUsers: async (page = 1, limit = 20, filters = {}) => {
      set({ isLoading: true, error: null })
      
      try {
        const response = await userService.getUsers(page, limit, filters)
        
        set({
          users: response.data,
          currentPage: response.meta.page,
          pageSize: response.meta.perPage,
          totalUsers: response.meta.total,
          totalPages: response.meta.totalPages,
          filters,
          isLoading: false
        })
      } catch (error: any) {
        set({ 
          error: error.message || 'Failed to fetch users',
          isLoading: false 
        })
        toast.error('Failed to fetch users')
      }
    },

    getUserById: async (id: string) => {
      try {
        const user = await userService.getUser(id)
        return user
      } catch (error: any) {
        toast.error('Failed to fetch user details')
        return null
      }
    },

    createUser: async (userData: CreateUserData) => {
      set({ isLoading: true, error: null })
      
      try {
        const newUser = await userService.createUser(userData)
        
        // Add to current list if not filtered out
        const { users } = get()
        set({ 
          users: [...users, newUser],
          totalUsers: get().totalUsers + 1,
          isLoading: false 
        })
        
        toast.success('User created successfully')
        return newUser
      } catch (error: any) {
        set({ 
          error: error.message || 'Failed to create user',
          isLoading: false 
        })
        toast.error('Failed to create user')
        return null
      }
    },

    updateUser: async (id: string, userData: UpdateUserData) => {
      set({ isLoading: true, error: null })
      
      try {
        const updatedUser = await userService.updateUser(id, userData)
        
        // Update in current list
        const { users } = get()
        const updatedUsers = users.map(user => 
          user.id === id ? updatedUser : user
        )
        
        set({ 
          users: updatedUsers,
          isLoading: false 
        })
        
        toast.success('User updated successfully')
        return updatedUser
      } catch (error: any) {
        set({ 
          error: error.message || 'Failed to update user',
          isLoading: false 
        })
        toast.error('Failed to update user')
        return null
      }
    },

    deleteUser: async (id: string) => {
      set({ isLoading: true, error: null })
      
      try {
        await userService.deleteUser(id)
        
        // Remove from current list
        const { users, selectedUsers } = get()
        const filteredUsers = users.filter(user => user.id !== id)
        const updatedSelection = new Set(selectedUsers)
        updatedSelection.delete(id)
        
        set({ 
          users: filteredUsers,
          selectedUsers: updatedSelection,
          totalUsers: get().totalUsers - 1,
          isLoading: false 
        })
        
        toast.success('User deleted successfully')
        return true
      } catch (error: any) {
        set({ 
          error: error.message || 'Failed to delete user',
          isLoading: false 
        })
        toast.error('Failed to delete user')
        return false
      }
    },

    activateUser: async (id: string) => {
      try {
        const updatedUser = await userService.activateUser(id)
        
        // Update in current list
        const { users } = get()
        const updatedUsers = users.map(user => 
          user.id === id ? updatedUser : user
        )
        
        set({ users: updatedUsers })
        toast.success('User activated successfully')
        return true
      } catch (error: any) {
        toast.error('Failed to activate user')
        return false
      }
    },

    deactivateUser: async (id: string) => {
      try {
        const updatedUser = await userService.deactivateUser(id)
        
        // Update in current list
        const { users } = get()
        const updatedUsers = users.map(user => 
          user.id === id ? updatedUser : user
        )
        
        set({ users: updatedUsers })
        toast.success('User deactivated successfully')
        return true
      } catch (error: any) {
        toast.error('Failed to deactivate user')
        return false
      }
    },

    resetUserPassword: async (id: string) => {
      try {
        const result = await userService.resetUserPassword(id)
        toast.success('Password reset successfully')
        return result.temporaryPassword || null
      } catch (error: any) {
        toast.error('Failed to reset password')
        return null
      }
    },

    getRoles: async () => {
      try {
        const roles = await userService.getRoles()
        set({ roles })
      } catch (error: any) {
        toast.error('Failed to fetch roles')
      }
    },

    getUserStats: async () => {
      try {
        const stats = await userService.getUserStats()
        set({ stats })
      } catch (error: any) {
        console.error('Failed to fetch user stats:', error)
      }
    },

    bulkUpdateUsers: async (userIds: string[], updates: Partial<UpdateUserData>) => {
      set({ isLoading: true, error: null })
      
      try {
        const result = await userService.bulkUpdateUsers(userIds, updates)
        
        // Refresh user list to get updated data
        await get().refreshUsers()
        
        set({ 
          selectedUsers: new Set(),
          isLoading: false 
        })
        
        toast.success(`Updated ${result.updated} users successfully`)
        if (result.failed.length > 0) {
          toast.error(`Failed to update ${result.failed.length} users`)
        }
        
        return true
      } catch (error: any) {
        set({ 
          error: error.message || 'Failed to bulk update users',
          isLoading: false 
        })
        toast.error('Failed to bulk update users')
        return false
      }
    },

    // Selection management
    selectUser: (userId: string) => {
      const { selectedUsers } = get()
      const updated = new Set(selectedUsers)
      updated.add(userId)
      set({ selectedUsers: updated })
    },

    selectAllUsers: () => {
      const { users } = get()
      const allIds = new Set(users.map(user => user.id))
      set({ selectedUsers: allIds })
    },

    clearSelection: () => {
      set({ selectedUsers: new Set() })
    },

    toggleUserSelection: (userId: string) => {
      const { selectedUsers } = get()
      const updated = new Set(selectedUsers)
      
      if (updated.has(userId)) {
        updated.delete(userId)
      } else {
        updated.add(userId)
      }
      
      set({ selectedUsers: updated })
    },

    // Filters
    setFilters: (newFilters: Partial<UserFilters>) => {
      const { filters } = get()
      const updatedFilters = { ...filters, ...newFilters }
      set({ filters: updatedFilters })
      
      // Auto-refresh with new filters
      get().getUsers(1, get().pageSize, updatedFilters)
    },

    clearFilters: () => {
      set({ filters: {} })
      get().getUsers(1, get().pageSize, {})
    },

    // Pagination
    setPage: (page: number) => {
      const { pageSize, filters } = get()
      get().getUsers(page, pageSize, filters)
    },

    setPageSize: (size: number) => {
      const { filters } = get()
      set({ pageSize: size })
      get().getUsers(1, size, filters)
    },

    // Utils
    refreshUsers: async () => {
      const { currentPage, pageSize, filters } = get()
      await get().getUsers(currentPage, pageSize, filters)
    },

    clearError: () => {
      set({ error: null })
    }
  }))
)

export default useUserStore
