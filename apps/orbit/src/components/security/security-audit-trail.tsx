'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Globe
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
    riskLevel: 'low'
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
    riskLevel: 'medium'
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
    riskLevel: 'high'
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
    riskLevel: 'critical'
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
    riskLevel: 'low'
  }
];

const mockMetrics: SecurityMetrics = {
  totalEvents: 1247,
  successfulLogins: 856,
  failedLogins: 23,
  suspiciousActivity: 5,
  dataAccess: 234,
  permissionChanges: 12
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Simulate export functionality
    alert('Audit log export initiated. You will receive an email when ready.');
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchTerm === '' || 
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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failure':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <User className="w-4 h-4" />;
      case 'logout':
        return <Lock className="w-4 h-4" />;
      case 'data_export':
        return <Download className="w-4 h-4" />;
      case 'permission_change':
        return <Settings className="w-4 h-4" />;
      case 'password_change':
        return <Unlock className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getRiskBadge = (riskLevel: AuditEvent['riskLevel']) => {
    const variants = {
      low: { variant: 'secondary' as const, className: 'text-green-600' },
      medium: { variant: 'outline' as const, className: 'text-yellow-600' },
      high: { variant: 'destructive' as const, className: 'text-orange-600' },
      critical: { variant: 'destructive' as const, className: 'text-red-600' }
    };
    return variants[riskLevel];
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return Smartphone;
    } else if (userAgent.includes('curl') || userAgent.includes('bot')) {
      return Globe;
    } else {
      return Monitor;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Security Audit Trail</h1>
            <p className="text-muted-foreground">
              Monitor and analyze security events across your organization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{mockMetrics.totalEvents}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mockMetrics.successfulLogins}</div>
              <div className="text-sm text-muted-foreground">Successful Logins</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{mockMetrics.failedLogins}</div>
              <div className="text-sm text-muted-foreground">Failed Logins</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{mockMetrics.suspiciousActivity}</div>
              <div className="text-sm text-muted-foreground">Suspicious Activity</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockMetrics.dataAccess}</div>
              <div className="text-sm text-muted-foreground">Data Access</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mockMetrics.permissionChanges}</div>
              <div className="text-sm text-muted-foreground">Permission Changes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        {getActionIcon(event.action)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium capitalize">
                            {event.action.replace('_', ' ')}
                          </h4>
                          <Badge {...riskBadge}>
                            {event.riskLevel} risk
                          </Badge>
                          {getStatusIcon(event.status)}
                        </div>
                        
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">{event.userEmail}</span> performed {event.action} on {event.resource}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.timestamp.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {event.ipAddress}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <DeviceIcon className="w-3 h-3" />
                            {event.userAgent.split(' ')[0]}
                          </span>
                        </div>
                        
                        {Object.keys(event.details).length > 0 && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
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
              <div className="text-center py-8 text-muted-foreground">
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
