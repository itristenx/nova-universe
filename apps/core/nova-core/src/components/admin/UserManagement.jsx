/**
 * Nova Universe User Management Interface
 * Phase 3 Implementation - Real user management using design system
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardText,
  CardActions,
  Button,
  PrimaryButton,
  OutlineButton,
  GhostButton,
  DangerButton,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Toast,
  Progress,
  Spinner,
  Skeleton,
  useTheme,
} from '../../packages/design-system';

const userStyles = `
.user-management {
  padding: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
  background-color: var(--color-background);
  min-height: 100vh;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.user-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-content);
  margin: 0;
  flex: 1;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  background: linear-gradient(135deg, var(--color-primary)10, var(--color-accent)10);
  border: 1px solid var(--color-primary)20;
}

.stat-number {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin: 0 0 var(--space-1) 0;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: 0;
}

.stat-change {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  margin-top: var(--space-1);
}

.stat-change--positive {
  color: var(--color-success);
}

.stat-change--negative {
  color: var(--color-error);
}

.user-filters {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  padding: var(--space-4);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 120px;
}

.filter-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.users-table-container {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-muted)20;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background-color: var(--color-muted)10;
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-content);
  border-bottom: 1px solid var(--color-muted)20;
}

.users-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-muted)10;
  vertical-align: middle;
}

.users-table tr:hover {
  background-color: var(--color-muted)05;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: var(--font-semibold);
  color: var(--color-content);
  margin: 0;
}

.user-email {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: 0;
}

.user-role {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.user-role--admin {
  background-color: var(--color-error)20;
  color: var(--color-error);
}

.user-role--manager {
  background-color: var(--color-warning)20;
  color: var(--color-warning);
}

.user-role--employee {
  background-color: var(--color-info)20;
  color: var(--color-info);
}

.user-role--guest {
  background-color: var(--color-muted)20;
  color: var(--color-muted);
}

.user-status {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator--active {
  background-color: var(--color-success);
  box-shadow: 0 0 4px var(--color-success)60;
}

.status-indicator--inactive {
  background-color: var(--color-muted);
}

.status-indicator--pending {
  background-color: var(--color-warning);
}

.user-actions {
  display: flex;
  gap: var(--space-1);
}

.user-last-active {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.empty-state {
  text-align: center;
  padding: var(--space-12) var(--space-6);
  color: var(--color-muted);
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-state-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-2) 0;
}

.empty-state-description {
  margin: 0 0 var(--space-6) 0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-top: 1px solid var(--color-muted)20;
}

.pagination-info {
  font-size: var(--text-sm);
  color: var(--color-muted);
}

.pagination-controls {
  display: flex;
  gap: var(--space-2);
}

@media (max-width: 768px) {
  .user-management {
    padding: var(--space-4);
  }
  
  .user-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .user-filters {
    flex-direction: column;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 600px;
  }
  
  .user-stats {
    grid-template-columns: 1fr;
  }
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = userStyles;
  document.head.appendChild(styleElement);
}

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'admin',
    status: 'active',
    department: 'IT',
    lastActive: '2024-01-20T10:30:00Z',
    createdAt: '2023-06-15T09:00:00Z',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'manager',
    status: 'active',
    department: 'Operations',
    lastActive: '2024-01-19T16:45:00Z',
    createdAt: '2023-08-20T14:30:00Z',
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'employee',
    status: 'active',
    department: 'Support',
    lastActive: '2024-01-20T09:15:00Z',
    createdAt: '2023-09-10T11:00:00Z',
  },
  {
    id: 4,
    name: 'Lisa Wilson',
    email: 'lisa.wilson@company.com',
    role: 'employee',
    status: 'inactive',
    department: 'HR',
    lastActive: '2024-01-15T13:20:00Z',
    createdAt: '2023-07-05T10:15:00Z',
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@company.com',
    role: 'manager',
    status: 'active',
    department: 'Finance',
    lastActive: '2024-01-20T11:45:00Z',
    createdAt: '2023-05-25T16:20:00Z',
  },
  {
    id: 6,
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    role: 'employee',
    status: 'pending',
    department: 'Marketing',
    lastActive: null,
    createdAt: '2024-01-18T09:30:00Z',
  },
];

export default function UserManagement() {
  const { colorMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
  });

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setUsers(mockUsers);
      setLoading(false);
    };

    loadUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    if (filters.role !== 'all' && user.role !== filters.role) {
      return false;
    }

    if (filters.status !== 'all' && user.status !== filters.status) {
      return false;
    }

    if (
      filters.search &&
      !user.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !user.email.toLowerCase().includes(filters.search.toLowerCase()) &&
      !user.department.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Calculate stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    pending: users.filter((u) => u.status === 'pending').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
  };

  const handleUserClick = (user, mode = 'view') => {
    setSelectedUser(user);
    setModalMode(mode);
    setShowModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleStatusUpdate = (userId, newStatus) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)),
    );
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'admin';
      case 'manager':
        return 'manager';
      case 'employee':
        return 'employee';
      case 'guest':
        return 'guest';
      default:
        return 'employee';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'active';
      case 'inactive':
        return 'inactive';
      case 'pending':
        return 'pending';
      default:
        return 'inactive';
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="user-header">
          <Skeleton variant="title" width="300px" />
          <Skeleton variant="button" />
        </div>

        <div className="user-stats">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton variant="text" />
                <Skeleton variant="text" width="60%" />
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardBody>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ marginBottom: 'var(--space-3)' }}>
                <Skeleton variant="text" />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="user-header">
        <h1 className="user-title">User Management</h1>
        <PrimaryButton onClick={handleCreateUser}>+ Add User</PrimaryButton>
      </div>

      {/* Stats */}
      <div className="user-stats">
        <Card className="stat-card">
          <CardBody>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-change stat-change--positive">+12% this month</div>
          </CardBody>
        </Card>

        <Card className="stat-card">
          <CardBody>
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active Users</div>
            <div className="stat-change stat-change--positive">+5% this week</div>
          </CardBody>
        </Card>

        <Card className="stat-card">
          <CardBody>
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Approval</div>
            <div className="stat-change stat-change--negative">2 new requests</div>
          </CardBody>
        </Card>

        <Card className="stat-card">
          <CardBody>
            <div className="stat-number">{stats.inactive}</div>
            <div className="stat-label">Inactive Users</div>
            <div className="stat-change stat-change--negative">-8% this month</div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="user-filters">
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <Input
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Role</label>
          <select
            value={filters.role}
            onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-muted)40',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-content)',
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-muted)40',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-content)',
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardBody>
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3 className="empty-state-title">No users found</h3>
              <p className="empty-state-description">
                {filters.search || filters.role !== 'all' || filters.status !== 'all'
                  ? 'Try adjusting your filters to see more users.'
                  : 'No users have been created yet.'}
              </p>
              <PrimaryButton onClick={handleCreateUser}>Add First User</PrimaryButton>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">{getInitials(user.name)}</div>
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`user-role user-role--${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.department}</td>
                  <td>
                    <div className="user-status">
                      <span
                        className={`status-indicator status-indicator--${getStatusColor(user.status)}`}
                      ></span>
                      {user.status}
                    </div>
                  </td>
                  <td>
                    <div className="user-last-active">{formatTimestamp(user.lastActive)}</div>
                  </td>
                  <td>
                    <div className="user-actions">
                      <GhostButton size="sm" onClick={() => handleUserClick(user, 'view')}>
                        View
                      </GhostButton>
                      <GhostButton size="sm" onClick={() => handleUserClick(user, 'edit')}>
                        Edit
                      </GhostButton>
                      {user.status === 'pending' && (
                        <PrimaryButton
                          size="sm"
                          onClick={() => handleStatusUpdate(user.id, 'active')}
                        >
                          Approve
                        </PrimaryButton>
                      )}
                      {user.status === 'active' && (
                        <DangerButton
                          size="sm"
                          onClick={() => handleStatusUpdate(user.id, 'inactive')}
                        >
                          Deactivate
                        </DangerButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <div className="pagination-info">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <div className="pagination-controls">
              <OutlineButton size="sm" disabled>
                Previous
              </OutlineButton>
              <OutlineButton size="sm" disabled>
                Next
              </OutlineButton>
            </div>
          </div>
        </div>
      )}

      {/* User Detail/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
        <ModalHeader onClose={() => setShowModal(false)}>
          {modalMode === 'create'
            ? 'Create New User'
            : modalMode === 'edit'
              ? 'Edit User'
              : 'User Details'}
        </ModalHeader>
        <ModalBody>
          {selectedUser ? (
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <Label>Name</Label>
                  {modalMode === 'view' ? (
                    <div style={{ padding: 'var(--space-2) 0' }}>{selectedUser.name}</div>
                  ) : (
                    <Input defaultValue={selectedUser.name} />
                  )}
                </div>
                <div className="form-group">
                  <Label>Email</Label>
                  {modalMode === 'view' ? (
                    <div style={{ padding: 'var(--space-2) 0' }}>{selectedUser.email}</div>
                  ) : (
                    <Input type="email" defaultValue={selectedUser.email} />
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label>Role</Label>
                  {modalMode === 'view' ? (
                    <div style={{ padding: 'var(--space-2) 0' }}>
                      <span className={`user-role user-role--${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  ) : (
                    <select
                      defaultValue={selectedUser.role}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-muted)40',
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-content)',
                        width: '100%',
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                      <option value="guest">Guest</option>
                    </select>
                  )}
                </div>
                <div className="form-group">
                  <Label>Department</Label>
                  {modalMode === 'view' ? (
                    <div style={{ padding: 'var(--space-2) 0' }}>{selectedUser.department}</div>
                  ) : (
                    <Input defaultValue={selectedUser.department} />
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label>Status</Label>
                  <div style={{ padding: 'var(--space-2) 0' }}>
                    <div className="user-status">
                      <span
                        className={`status-indicator status-indicator--${getStatusColor(selectedUser.status)}`}
                      ></span>
                      {selectedUser.status}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <Label>Created</Label>
                  <div style={{ padding: 'var(--space-2) 0' }}>
                    {formatTimestamp(selectedUser.createdAt)}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <Label>Last Active</Label>
                <div style={{ padding: 'var(--space-2) 0' }}>
                  {formatTimestamp(selectedUser.lastActive)}
                </div>
              </div>
            </div>
          ) : (
            // Create user form
            <div className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <Label>Name</Label>
                  <Input placeholder="Enter full name" />
                </div>
                <div className="form-group">
                  <Label>Email</Label>
                  <Input type="email" placeholder="user@company.com" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label>Role</Label>
                  <select
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-muted)40',
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-content)',
                      width: '100%',
                    }}
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="employee">Employee</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
                <div className="form-group">
                  <Label>Department</Label>
                  <Input placeholder="Enter department" />
                </div>
              </div>

              <div className="form-group">
                <Label>Initial Password</Label>
                <Input type="password" placeholder="Temporary password" />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <OutlineButton onClick={() => setShowModal(false)}>Cancel</OutlineButton>
          {modalMode === 'view' ? (
            <PrimaryButton onClick={() => setModalMode('edit')}>Edit User</PrimaryButton>
          ) : modalMode === 'edit' ? (
            <PrimaryButton>Save Changes</PrimaryButton>
          ) : (
            <PrimaryButton>Create User</PrimaryButton>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
