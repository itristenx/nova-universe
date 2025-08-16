import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../components/TicketGrid.module.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  PlusIcon as Plus,
  MagnifyingGlassIcon as Search,
  PencilSquareIcon as Edit,
  TrashIcon as Trash2,
  UsersIcon as Users,
  Cog6ToothIcon as Settings,
  ExclamationCircleIcon as AlertCircle,
  CheckCircleIcon as CheckCircle,
  ClockIcon as Clock,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
} from '@heroicons/react/24/outline';

// API functions
const api = {
  getSupportGroups: async (filters: Record<string, string | number | undefined> = {}) => {
    const params = new URLSearchParams(
      Object.entries(filters).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {}),
    );
    const response = await fetch(`/api/v1/cmdb/support-groups?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to fetch support groups');
    return response.json();
  },

  createSupportGroup: async (data: Record<string, unknown>) => {
    const response = await fetch('/api/v1/cmdb/support-groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create support group');
    return response.json();
  },

  updateSupportGroup: async ({ id, ...data }: { id: string } & Record<string, unknown>) => {
    const response = await fetch(`/api/v1/cmdb/support-groups/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update support group');
    return response.json();
  },

  deleteSupportGroup: async (id: string) => {
    const response = await fetch(`/api/v1/cmdb/support-groups/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to delete support group');
    return response.json();
  },

  getUsers: async (): Promise<Array<{ id: string; name: string; email: string }>> => {
    const response = await fetch('/api/v1/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
};

// Support Group Form Component
const SupportGroupForm = ({
  group,
  onSave,
  onCancel,
}: {
  group?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    type: group?.type || 'technical',
    email: group?.email || '',
    phone: group?.phone || '',
    manager: group?.manager || '',
    escalationGroup: group?.escalationGroup || '',
    businessHours: group?.businessHours || null,
    slaTarget: group?.slaTarget || '',
    ...group,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  });

  const { data: supportGroups } = useQuery({
    queryKey: ['supportGroups'],
    queryFn: () => api.getSupportGroups({ limit: 100 }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      slaTarget: formData.slaTarget ? parseInt(formData.slaTarget) : null,
    };
    onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Support Group Name"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Type</label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="application">Application</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Support group description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="group@company.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Manager</label>
          <Select
            value={formData.manager}
            onValueChange={(value) => setFormData({ ...formData, manager: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">SLA Target (minutes)</label>
          <Input
            type="number"
            value={formData.slaTarget}
            onChange={(e) => setFormData({ ...formData, slaTarget: e.target.value })}
            placeholder="60"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Escalation Group</label>
        <Select
          value={formData.escalationGroup}
          onValueChange={(value) => setFormData({ ...formData, escalationGroup: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select escalation group" />
          </SelectTrigger>
          <SelectContent>
            {supportGroups?.supportGroups
              ?.filter((sg: any) => sg.id !== group?.id)
              .map((sg: any) => (
                <SelectItem key={sg.id} value={sg.id}>
                  {sg.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{group ? 'Update' : 'Create'} Support Group</Button>
      </div>
    </form>
  );
};

// Main Support Groups Page
const SupportGroupsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const queryClient = useQueryClient();

  // Fetch support groups
  const {
    data: supportGroupsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['supportGroups', { search: searchTerm, type: typeFilter }],
    queryFn: () =>
      api.getSupportGroups({
        search: searchTerm || undefined,
        type: typeFilter || undefined,
      }),
    refetchInterval: 30000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: api.createSupportGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportGroups'] });
      setShowCreateDialog(false);
      toast.success('Support group created successfully');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to create support group: ${message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: api.updateSupportGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportGroups'] });
      setEditingGroup(null);
      toast.success('Support group updated successfully');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to update support group: ${message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteSupportGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportGroups'] });
      toast.success('Support group deleted successfully');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Failed to delete support group: ${message}`);
    },
  });

  const handleCreate = (data: Record<string, unknown>) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: Record<string, unknown>) => {
    if (!editingGroup) return;
    updateMutation.mutate({ id: (editingGroup as any).id, ...data });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this support group?')) {
      deleteMutation.mutate(id);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      technical: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      application: 'bg-purple-100 text-purple-800',
      infrastructure: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <p className="text-red-600">
                Error loading support groups: {(error as Error).message}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  React.useEffect(() => {
    const handler = () => queryClient.invalidateQueries({ queryKey: ['supportGroups'] });
    window.addEventListener('pulse:pull_to_refresh', handler);
    return () => window.removeEventListener('pulse:pull_to_refresh', handler);
  }, [queryClient]);

  return (
    <motion.div
      className={`space-y-6 p-6 ${styles.pullContainer}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Groups</h1>
          <p className="text-muted-foreground">
            Manage user groups for CMDB ownership and RBAC permissions
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Support Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Support Group</DialogTitle>
              <DialogDescription>
                Create a new support group for CMDB ownership and permissions management.
              </DialogDescription>
            </DialogHeader>
            <SupportGroupForm onSave={handleCreate} onCancel={() => setShowCreateDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                  placeholder="Search support groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="infrastructure">Infrastructure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Support Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Support Groups
            {supportGroupsData && (
              <Badge variant="secondary">
                {supportGroupsData.supportGroups?.length || 0} groups
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : supportGroupsData?.supportGroups?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>CIs</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportGroupsData.supportGroups.map((group: any) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{group.name}</div>
                        {group.description && (
                          <div className="text-muted-foreground text-sm">{group.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(group.type)}>{group.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {group.members?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        {group._count?.configurationItems || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {group.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {group.email}
                          </div>
                        )}
                        {group.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {group.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={group.isActive ? 'default' : 'secondary'}>
                        {group.isActive ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => setEditingGroup(group)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(group.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-medium">No support groups found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first support group to get started.
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Support Group
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Support Group</DialogTitle>
            <DialogDescription>Update support group details and settings.</DialogDescription>
          </DialogHeader>
          {editingGroup && (
            <SupportGroupForm
              group={editingGroup}
              onSave={handleUpdate}
              onCancel={() => setEditingGroup(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SupportGroupsPage;
