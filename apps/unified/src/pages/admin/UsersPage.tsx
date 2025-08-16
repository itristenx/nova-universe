import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  EllipsisHorizontalIcon,
  UserPlusIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { UserTable } from '@components/admin/UserTable'
import { UserFilters } from '@components/admin/UserFilters'
import { CreateUserModal } from '@components/admin/CreateUserModal'
import { EditUserModal } from '@components/admin/EditUserModal'
import { cn, formatNumber, getUserDisplayName, getInitials } from '@utils/index'
import toast from 'react-hot-toast'
import type { User } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [filters, setFilters] = useState<Record<string, any>>({})

  // Mock data for demo
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          email: 'john.doe@company.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          roles: [{ id: '1', name: 'admin', description: 'Administrator', permissions: [] }],
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'jane.smith@company.com',
          firstName: 'Jane',
          lastName: 'Smith',
          isActive: true,
          roles: [{ id: '2', name: 'agent', description: 'Support Agent', permissions: [] }],
          lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          email: 'bob.johnson@company.com',
          firstName: 'Bob',
          lastName: 'Johnson',
          isActive: false,
          roles: [{ id: '3', name: 'user', description: 'End User', permissions: [] }],
          lastLoginAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleSearch = async (query: string) => {
    // Mock search functionality
    if (!query.trim()) {
      return // Reset to full list
    }
    toast.success(`Searching for: ${query}`)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first')
      return
    }

    switch (action) {
      case 'activate':
        toast.success(`Activated ${selectedUsers.length} users`)
        break
      case 'deactivate':
        toast.success(`Deactivated ${selectedUsers.length} users`)
        break
      case 'delete':
        if (confirm(`Delete ${selectedUsers.length} users? This cannot be undone.`)) {
          toast.success(`Deleted ${selectedUsers.length} users`)
        }
        break
    }
    setSelectedUsers([])
  }

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ))
    setEditingUser(null)
    toast.success('User updated successfully')
  }

  const handleUserCreate = (newUser: User) => {
    setUsers(prev => [newUser, ...prev])
    setShowCreateModal(false)
    toast.success('User created successfully')
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    admins: users.filter(u => u.roles?.some(r => r.name === 'admin')).length,
    agents: users.filter(u => u.roles?.some(r => r.name === 'agent')).length,
    endUsers: users.filter(u => u.roles?.some(r => r.name === 'user')).length,
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            User Management
          </h1>
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
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-nova-600">{formatNumber(stats.total)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{formatNumber(stats.active)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{formatNumber(stats.inactive)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.admins)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Admins</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.agents)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Agents</div>
        </div>
        
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{formatNumber(stats.endUsers)}</div>
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
                showFilters && 'bg-nova-100 text-nova-700 dark:bg-nova-900 dark:text-nova-300'
              )}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="ml-1 rounded-full bg-nova-600 px-2 py-0.5 text-xs text-white">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <UserFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={() => setFilters({})}
            />
          </div>
        )}
      </div>

      {/* Bulk actions */}
      {selectedUsers.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatNumber(selectedUsers.length)} user{selectedUsers.length !== 1 ? 's' : ''} selected
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
                
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="btn btn-error btn-sm"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedUsers([])}
              className="btn btn-ghost btn-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        {isLoading ? (
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary mt-4"
            >
              <PlusIcon className="h-4 w-4" />
              Add User
            </button>
          </div>
        ) : (
          <UserTable 
            users={users}
            selectedUsers={selectedUsers}
            onSelectionChange={setSelectedUsers}
            onEditUser={setEditingUser}
            onUserUpdate={handleUserUpdate}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onUserCreate={handleUserCreate}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  )
}
