'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Shield,
  User,
  Eye,
  Edit,
  Settings,
  AlertTriangle,
  Check,
  X,
  Clock,
  Info,
} from 'lucide-react';

// Permission types and levels
interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'read' | 'write' | 'admin' | 'system';
  level: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  lastModified: Date;
  grantedBy?: string;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isDefault: boolean;
}

const mockPermissions: Permission[] = [
  {
    id: 'read_profile',
    name: 'View Profile',
    description: 'View your own profile information',
    category: 'read',
    level: 'low',
    enabled: true,
    lastModified: new Date('2024-01-15'),
    grantedBy: 'System',
  },
  {
    id: 'edit_profile',
    name: 'Edit Profile',
    description: 'Modify your profile information',
    category: 'write',
    level: 'medium',
    enabled: true,
    lastModified: new Date('2024-01-15'),
    grantedBy: 'System',
  },
  {
    id: 'view_analytics',
    name: 'View Analytics',
    description: 'Access dashboard analytics and reports',
    category: 'read',
    level: 'medium',
    enabled: true,
    lastModified: new Date('2024-01-10'),
    grantedBy: 'Admin',
  },
  {
    id: 'manage_users',
    name: 'User Management',
    description: 'Create, edit, and delete user accounts',
    category: 'admin',
    level: 'high',
    enabled: false,
    lastModified: new Date('2024-01-05'),
    grantedBy: 'Super Admin',
  },
  {
    id: 'system_config',
    name: 'System Configuration',
    description: 'Modify system-wide settings and configurations',
    category: 'system',
    level: 'critical',
    enabled: false,
    lastModified: new Date('2024-01-01'),
    grantedBy: 'Super Admin',
  },
];

const mockRoles: UserRole[] = [
  {
    id: 'user',
    name: 'User',
    description: 'Standard user with basic permissions',
    permissions: ['read_profile', 'edit_profile'],
    userCount: 1250,
    isDefault: true,
  },
  {
    id: 'analyst',
    name: 'Analyst',
    description: 'User with access to analytics and reporting',
    permissions: ['read_profile', 'edit_profile', 'view_analytics'],
    userCount: 45,
    isDefault: false,
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'User with administrative privileges',
    permissions: ['read_profile', 'edit_profile', 'view_analytics', 'manage_users'],
    userCount: 8,
    isDefault: false,
  },
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access and control',
    permissions: [
      'read_profile',
      'edit_profile',
      'view_analytics',
      'manage_users',
      'system_config',
    ],
    userCount: 2,
    isDefault: false,
  },
];

// Permission level styling
const getLevelBadge = (level: Permission['level']) => {
  const variants = {
    low: { variant: 'secondary' as const, color: 'text-green-600' },
    medium: { variant: 'outline' as const, color: 'text-yellow-600' },
    high: { variant: 'destructive' as const, color: 'text-orange-600' },
    critical: { variant: 'destructive' as const, color: 'text-red-600' },
  };
  return variants[level];
};

const getCategoryIcon = (category: Permission['category']) => {
  const icons = {
    read: Eye,
    write: Edit,
    admin: Settings,
    system: Shield,
  };
  return icons[category];
};

export function PermissionManager() {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const togglePermission = (permissionId: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === permissionId ? { ...p, enabled: !p.enabled, lastModified: new Date() } : p,
      ),
    );
  };

  const currentRole = mockRoles.find((r) => r.id === selectedRole);
  const enabledPermissions = permissions.filter((p) => p.enabled);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-primary h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Permission Management</h1>
            <p className="text-muted-foreground">
              Manage your account permissions and security settings
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? 'Simple View' : 'Advanced View'}
        </Button>
      </div>

      {/* Current Role Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Role: {currentRole?.name}
          </CardTitle>
          <CardDescription>{currentRole?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {enabledPermissions.length} of {permissions.length} permissions enabled
            </div>
            <Badge variant={currentRole?.isDefault ? 'secondary' : 'outline'}>
              {currentRole?.isDefault ? 'Default Role' : 'Custom Role'}
            </Badge>
          </div>
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              data-width={`${(enabledPermissions.length / permissions.length) * 100}%`}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Permissions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Individual Permissions</h2>
          {permissions.map((permission) => {
            const IconComponent = getCategoryIcon(permission.category);
            const levelStyle = getLevelBadge(permission.level);

            return (
              <Card key={permission.id} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <div className="bg-muted rounded-lg p-2">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-medium">{permission.name}</h3>
                          <Badge {...levelStyle}>{permission.level}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2 text-sm">
                          {permission.description}
                        </p>
                        {showAdvanced && (
                          <div className="text-muted-foreground flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Modified {permission.lastModified.toLocaleDateString()}
                            </span>
                            {permission.grantedBy && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Granted by {permission.grantedBy}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {permission.level === 'critical' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <Switch
                        checked={permission.enabled}
                        onCheckedChange={() => togglePermission(permission.id)}
                        disabled={permission.level === 'critical' && !showAdvanced}
                      />
                      {permission.enabled ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Role Templates */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Role Templates</h2>
          {mockRoles.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all ${
                selectedRole === role.id ? 'ring-primary ring-2' : ''
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{role.name}</span>
                  <div className="flex items-center gap-2">
                    {role.isDefault && <Badge variant="secondary">Default</Badge>}
                    <Badge variant="outline">{role.userCount} users</Badge>
                  </div>
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Included Permissions:</div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permId) => {
                      const perm = permissions.find((p) => p.id === permId);
                      if (!perm) return null;

                      return (
                        <Badge key={permId} variant="outline" className="text-xs">
                          {perm.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="space-y-1">
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Security Notice</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Changes to critical permissions require additional verification and may take up to
                24 hours to take effect. Always review permissions carefully before making changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PermissionManager;
