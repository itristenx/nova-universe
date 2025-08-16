'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  User,
  Lock,
  Unlock,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
} from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'warning';
  ipAddress: string;
  userAgent: string;
  location?: string;
  details: Record<string, string | number | boolean>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityMetrics {
  totalEvents: number;
  successfulLogins: number;
  failedLogins: number;
  suspiciousActivity: number;
  dataAccess: number;
  permissionChanges: number;
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    timestamp: new Date('2024-01-20T10:30:00Z'),
    userId: 'user123',
    userEmail: 'john.doe@example.com',
    action: 'login',
    resource: 'authentication',
    status: 'success',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'New York, NY',
    details: { method: '2FA', deviceFingerprint: 'abc123' },
    riskLevel: 'low',
  },
  {
    id: '2',
    timestamp: new Date('2024-01-20T09:15:00Z'),
    userId: 'user456',
    userEmail: 'jane.smith@example.com',
    action: 'data_export',
    resource: 'user_data',
    status: 'success',
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    location: 'London, UK',
    details: { exportType: 'profile', dataSize: '2.4KB' },
    riskLevel: 'medium',
  },
  {
    id: '3',
    timestamp: new Date('2024-01-20T08:45:00Z'),
    userId: 'admin789',
    userEmail: 'admin@example.com',
    action: 'permission_change',
    resource: 'user_permissions',
    status: 'success',
    ipAddress: '172.16.0.10',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    location: 'San Francisco, CA',
    details: { targetUser: 'user123', permission: 'admin', action: 'granted' },
    riskLevel: 'high',
  },
  {
    id: '4',
    timestamp: new Date('2024-01-20T08:30:00Z'),
    userId: 'user789',
    userEmail: 'suspicious@example.com',
    action: 'login',
    resource: 'authentication',
    status: 'failure',
    ipAddress: '203.0.113.42',
    userAgent: 'curl/7.68.0',
    location: 'Unknown',
    details: { reason: 'invalid_credentials', attempts: 5 },
    riskLevel: 'critical',
  },
  {
    id: '5',
    timestamp: new Date('2024-01-20T07:20:00Z'),
    userId: 'user123',
    userEmail: 'john.doe@example.com',
    action: 'password_change',
    resource: 'user_account',
    status: 'success',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    location: 'New York, NY',
    details: { method: 'self_service', strength: 'strong' },
    riskLevel: 'low',
  },
];

const mockMetrics: SecurityMetrics = {
  totalEvents: 1247,
  successfulLogins: 856,
  failedLogins: 23,
  suspiciousActivity: 5,
  dataAccess: 234,
  permissionChanges: 12,
};

export function SecurityAuditTrail() {
  const [events] = useState<AuditEvent[]>(mockAuditEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Simulate export functionality
    alert('Audit log export initiated. You will receive an email when ready.');
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchTerm === '' ||
      event.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.ipAddress.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesRisk = filterRisk === 'all' || event.riskLevel === filterRisk;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getStatusIcon = (status: AuditEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <User className="h-4 w-4" />;
      case 'logout':
        return <Lock className="h-4 w-4" />;
      case 'data_export':
        return <Download className="h-4 w-4" />;
      case 'permission_change':
        return <Settings className="h-4 w-4" />;
      case 'password_change':
        return <Unlock className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRiskBadge = (riskLevel: AuditEvent['riskLevel']) => {
    const variants = {
      low: { variant: 'secondary' as const, className: 'text-green-600' },
      medium: { variant: 'outline' as const, className: 'text-yellow-600' },
      high: { variant: 'destructive' as const, className: 'text-orange-600' },
      critical: { variant: 'destructive' as const, className: 'text-red-600' },
    };
    return variants[riskLevel];
  };

  const getDeviceIcon = (userAgent: string) => {
    if (
      userAgent.includes('Mobile') ||
      userAgent.includes('Android') ||
      userAgent.includes('iPhone')
    ) {
      return Smartphone;
    } else if (userAgent.includes('curl') || userAgent.includes('bot')) {
      return Globe;
    } else {
      return Monitor;
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-primary h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Security Audit Trail</h1>
            <p className="text-muted-foreground">
              Monitor and analyze security events across your organization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{mockMetrics.totalEvents}</div>
              <div className="text-muted-foreground text-sm">Total Events</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockMetrics.successfulLogins}
              </div>
              <div className="text-muted-foreground text-sm">Successful Logins</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{mockMetrics.failedLogins}</div>
              <div className="text-muted-foreground text-sm">Failed Logins</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mockMetrics.suspiciousActivity}
              </div>
              <div className="text-muted-foreground text-sm">Suspicious Activity</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockMetrics.dataAccess}</div>
              <div className="text-muted-foreground text-sm">Data Access</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockMetrics.permissionChanges}
              </div>
              <div className="text-muted-foreground text-sm">Permission Changes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  placeholder="Search by user, action, or IP address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>
            Showing {filteredEvents.length} of {events.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const riskBadge = getRiskBadge(event.riskLevel);
              const DeviceIcon = getDeviceIcon(event.userAgent);

              return (
                <div
                  key={event.id}
                  className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <div className="bg-muted rounded-lg p-2">{getActionIcon(event.action)}</div>

                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-medium capitalize">
                            {event.action.replace('_', ' ')}
                          </h4>
                          <Badge {...riskBadge}>{event.riskLevel} risk</Badge>
                          {getStatusIcon(event.status)}
                        </div>

                        <div className="text-muted-foreground mb-2 text-sm">
                          <span className="font-medium">{event.userEmail}</span> performed{' '}
                          {event.action} on {event.resource}
                        </div>

                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.timestamp.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {event.ipAddress}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <DeviceIcon className="h-3 w-3" />
                            {event.userAgent.split(' ')[0]}
                          </span>
                        </div>

                        {Object.keys(event.details).length > 0 && (
                          <div className="bg-muted mt-2 rounded p-2 text-xs">
                            <strong>Details:</strong> {JSON.stringify(event.details, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredEvents.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                No events match your current filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SecurityAuditTrail;
