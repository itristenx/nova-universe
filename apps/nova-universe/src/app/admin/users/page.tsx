'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  UserIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ShieldCheckIcon,
  KeyIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { formatRelativeTime, cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'super_admin' | 'admin' | 'technician' | 'end_user'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  department?: string
  lastLogin?: Date
  createdAt: Date
  permissions: string[]
  modules: string[]
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Kim',
    email: 'sarah.kim@company.com',
    phone: '+1 (555) 123-4567',
    role: 'admin',
    status: 'active',
    department: 'IT Administration',
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    permissions: ['user:manage', 'system:configure', 'tickets:manage'],
    modules: ['core', 'pulse', 'orbit']
  },
  {
    id: '2',
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@company.com',
    phone: '+1 (555) 234-5678',
    role: 'technician',
    status: 'active',
    department: 'Technical Support',
    lastLogin: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
    permissions: ['tickets:manage', 'pulse:access'],
    modules: ['pulse']
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'end_user',
    status: 'active',
    department: 'Marketing',
    lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    permissions: ['orbit:access'],
    modules: ['orbit']
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    phone: '+1 (555) 345-6789',
    role: 'technician',
    status: 'inactive',
    department: 'Hardware Support',
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    permissions: ['tickets:manage', 'pulse:access'],
    modules: ['pulse']
  },
  {
    id: '5',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'end_user',
    status: 'pending',
    department: 'Finance',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    permissions: [],
    modules: []
  }
]

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
  technician: 'bg-blue-100 text-blue-800',
  end_user: 'bg-green-100 text-green-800'
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  suspended: 'bg-red-100 text-red-800'
}

const rolePermissions = {
  super_admin: ['*'],
  admin: ['user:manage', 'system:configure', 'tickets:manage', 'analytics:view'],
  technician: ['tickets:manage', 'pulse:access', 'queue:manage'],
  end_user: ['orbit:access', 'tickets:create']
}

const moduleOptions = [
  { id: 'core', name: 'Nova Core', description: 'Admin Portal' },
  { id: 'pulse', name: 'Nova Pulse', description: 'Technician Portal' },
  { id: 'orbit', name: 'Nova Orbit', description: 'Self-Service Portal' },
  { id: 'lore', name: 'Nova Lore', description: 'Knowledge Base' },
  { id: 'beacon', name: 'Nova Beacon', description: 'Kiosk Portal' },
  { id: 'synth', name: 'Nova Synth', description: 'Analytics Portal' }
]

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })

  const departments = Array.from(new Set(mockUsers.map(u => u.department).filter(Boolean)))

  const userStats = {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'active').length,
    pending: mockUsers.filter(u => u.status === 'pending').length,
    admins: mockUsers.filter(u => ['super_admin', 'admin'].includes(u.role)).length
  }

  const handleCreateUser = () => {
    setIsCreateDialogOpen(false)
    // Mock create user logic
    console.log('Creating new user')
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    // Mock delete user logic
    console.log('Deleting user:', userId)
  }

  const handleToggleStatus = (userId: string) => {
    // Mock toggle user status logic
    console.log('Toggling user status:', userId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts, roles, and permissions across the Nova Universe
          </p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userStats.total}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
              </div>
              <UserIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{userStats.pending}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Administrators</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.admins}</p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
                <SelectItem value="end_user">End User</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold truncate">{user.name}</h3>
                      <Badge className={cn("text-xs", roleColors[user.role])}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                      <Badge className={cn("text-xs", statusColors[user.status])}>
                        {user.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <EnvelopeIcon className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center space-x-1">
                            <PhoneIcon className="w-3 h-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.department && (
                          <span>{user.department}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {user.lastLogin && (
                          <span>Last login: {formatRelativeTime(user.lastLogin)}</span>
                        )}
                        <span>Created: {formatRelativeTime(user.createdAt)}</span>
                        <span>Modules: {user.modules.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the Nova Universe platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@company.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" placeholder="IT Support" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end_user">End User</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Module Access</Label>
              <div className="grid grid-cols-2 gap-2">
                {moduleOptions.map((module) => (
                  <label key={module.id} className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>{module.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>
              Create User
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input 
                    id="editFirstName" 
                    defaultValue={selectedUser.name.split(' ')[0]} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input 
                    id="editLastName" 
                    defaultValue={selectedUser.name.split(' ').slice(1).join(' ')} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input 
                  id="editEmail" 
                  type="email" 
                  defaultValue={selectedUser.email} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input 
                  id="editPhone" 
                  type="tel" 
                  defaultValue={selectedUser.phone || ''} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editDepartment">Department</Label>
                <Input 
                  id="editDepartment" 
                  defaultValue={selectedUser.department || ''} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="end_user">End User</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select defaultValue={selectedUser.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Module Access</Label>
                <div className="grid grid-cols-2 gap-2">
                  {moduleOptions.map((module) => (
                    <label key={module.id} className="flex items-center space-x-2 text-sm">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        defaultChecked={selectedUser.modules.includes(module.id)}
                      />
                      <span>{module.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}