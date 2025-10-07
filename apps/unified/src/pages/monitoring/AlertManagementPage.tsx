import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Users,
  Filter,
  Search,
  X,
  Check,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Calendar,
  RefreshCw,
  Download,
  Settings,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { StatusBadge } from '@/components/design-system/StatusBadge';
import { Modal } from '@/components/design-system/Modal';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'active' | 'acknowledged' | 'resolved' | 'muted';
  source: string;
  category: 'infrastructure' | 'application' | 'security' | 'performance' | 'availability';
  affectedServices: string[];
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  assignedTo?: string;
  impact: 'none' | 'minor' | 'moderate' | 'major' | 'critical';
  metrics?: {
    label: string;
    value: string;
    threshold: string;
  };
  timeline: {
    timestamp: Date;
    action: string;
    user?: string;
  }[];
}

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: string;
  threshold: string;
  severity: Alert['severity'];
  notifications: ('email' | 'slack' | 'sms' | 'webhook')[];
  assignee?: string;
}

/**
 * AlertManagementPage - Comprehensive alert management system
 * 
 * Features:
 * - Real-time alert monitoring with severity levels
 * - Alert filtering and search
 * - Acknowledge, resolve, and mute alerts
 * - Alert assignment and escalation
 * - Alert rules configuration
 * - Alert history and timeline
 * - Notification channel management
 * - Bulk operations
 * - Export capabilities
 * 
 * Design: Apple Liquid Glass 2025 with spring animations and glassmorphism
 */
export default function AlertManagementPage() {
  const [selectedTab, setSelectedTab] = useState<'active' | 'history' | 'rules'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | Alert['severity']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Alert['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Alert['category']>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Database Connection Pool Exhausted',
      description: 'PostgreSQL connection pool has reached maximum capacity. New connections are being rejected.',
      severity: 'critical',
      status: 'active',
      source: 'PostgreSQL Primary',
      category: 'infrastructure',
      affectedServices: ['API Gateway', 'Auth Service', 'Ticket Service'],
      triggeredAt: new Date(Date.now() - 15 * 60 * 1000),
      impact: 'critical',
      metrics: {
        label: 'Active Connections',
        value: '200/200',
        threshold: '180'
      },
      timeline: [
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          action: 'Alert triggered',
        },
        {
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          action: 'Alert escalated to on-call engineer',
        }
      ]
    },
    {
      id: '2',
      title: 'High Error Rate Detected',
      description: 'API error rate has exceeded threshold (5%) for the past 10 minutes.',
      severity: 'high',
      status: 'acknowledged',
      source: 'API Gateway',
      category: 'application',
      affectedServices: ['API Gateway'],
      triggeredAt: new Date(Date.now() - 25 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 20 * 60 * 1000),
      acknowledgedBy: 'Sarah Chen',
      assignedTo: 'DevOps Team',
      impact: 'major',
      metrics: {
        label: 'Error Rate',
        value: '7.2%',
        threshold: '5%'
      },
      timeline: [
        {
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          action: 'Alert triggered',
        },
        {
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          action: 'Acknowledged by Sarah Chen',
          user: 'Sarah Chen'
        }
      ]
    },
    {
      id: '3',
      title: 'Suspicious Login Activity',
      description: 'Multiple failed login attempts detected from unusual geographic location.',
      severity: 'high',
      status: 'active',
      source: 'Security Monitor',
      category: 'security',
      affectedServices: ['Auth Service'],
      triggeredAt: new Date(Date.now() - 5 * 60 * 1000),
      assignedTo: 'Security Team',
      impact: 'moderate',
      timeline: [
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          action: 'Alert triggered',
        },
        {
          timestamp: new Date(Date.now() - 3 * 60 * 1000),
          action: 'Auto-assigned to Security Team',
        }
      ]
    },
    {
      id: '4',
      title: 'Slow Query Performance',
      description: 'Database query execution time has increased significantly.',
      severity: 'medium',
      status: 'acknowledged',
      source: 'MongoDB Atlas',
      category: 'performance',
      affectedServices: ['MongoDB Atlas', 'Analytics Service'],
      triggeredAt: new Date(Date.now() - 45 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 40 * 60 * 1000),
      acknowledgedBy: 'Mike Johnson',
      assignedTo: 'Database Team',
      impact: 'minor',
      metrics: {
        label: 'Avg Query Time',
        value: '842ms',
        threshold: '500ms'
      },
      timeline: [
        {
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          action: 'Alert triggered',
        },
        {
          timestamp: new Date(Date.now() - 40 * 60 * 1000),
          action: 'Acknowledged by Mike Johnson',
          user: 'Mike Johnson'
        }
      ]
    },
    {
      id: '5',
      title: 'SSL Certificate Expiring Soon',
      description: 'SSL certificate for api.nova.com will expire in 7 days.',
      severity: 'medium',
      status: 'active',
      source: 'Certificate Monitor',
      category: 'security',
      affectedServices: ['API Gateway', 'CDN'],
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      assignedTo: 'DevOps Team',
      impact: 'moderate',
      timeline: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          action: 'Alert triggered',
        }
      ]
    },
    {
      id: '6',
      title: 'Disk Space Low',
      description: 'Available disk space on /data partition is below 15%.',
      severity: 'low',
      status: 'resolved',
      source: 'Server Monitor',
      category: 'infrastructure',
      affectedServices: ['Object Storage'],
      triggeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      acknowledgedBy: 'DevOps Team',
      resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      resolvedBy: 'Automated Cleanup',
      impact: 'minor',
      metrics: {
        label: 'Available Space',
        value: '12%',
        threshold: '15%'
      },
      timeline: [
        {
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          action: 'Alert triggered',
        },
        {
          timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
          action: 'Acknowledged by DevOps Team',
          user: 'DevOps Team'
        },
        {
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          action: 'Resolved by Automated Cleanup',
          user: 'Automated Cleanup'
        }
      ]
    }
  ]);

  const [alertRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'High CPU Usage',
      enabled: true,
      condition: 'CPU > threshold for 5 minutes',
      threshold: '80%',
      severity: 'high',
      notifications: ['email', 'slack'],
      assignee: 'DevOps Team'
    },
    {
      id: '2',
      name: 'Database Connection Limit',
      enabled: true,
      condition: 'Active connections > threshold',
      threshold: '180 connections',
      severity: 'critical',
      notifications: ['email', 'slack', 'sms'],
      assignee: 'Database Team'
    },
    {
      id: '3',
      name: 'API Error Rate',
      enabled: true,
      condition: 'Error rate > threshold for 10 minutes',
      threshold: '5%',
      severity: 'high',
      notifications: ['email', 'slack'],
      assignee: 'DevOps Team'
    },
    {
      id: '4',
      name: 'Failed Login Attempts',
      enabled: true,
      condition: 'Failed attempts > threshold in 1 minute',
      threshold: '10 attempts',
      severity: 'high',
      notifications: ['email', 'slack'],
      assignee: 'Security Team'
    },
    {
      id: '5',
      name: 'Certificate Expiration',
      enabled: true,
      condition: 'Certificate expires in < threshold',
      threshold: '7 days',
      severity: 'medium',
      notifications: ['email'],
      assignee: 'DevOps Team'
    }
  ]);

  const getSeverityIcon = (severity: Alert['severity']) => {
    const iconClass = "w-5 h-5";
    switch (severity) {
      case 'critical':
        return <AlertTriangle className={`${iconClass} text-red-600`} />;
      case 'high':
        return <AlertCircle className={`${iconClass} text-orange-600`} />;
      case 'medium':
        return <Info className={`${iconClass} text-yellow-600`} />;
      case 'low':
        return <Info className={`${iconClass} text-blue-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const getSeverityBadgeVariant = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'error' as const;
      case 'high':
        return 'warning' as const;
      case 'medium':
        return 'warning' as const;
      case 'low':
        return 'info' as const;
      default:
        return 'default' as const;
    }
  };

  const getStatusBadgeVariant = (status: Alert['status']) => {
    switch (status) {
      case 'active':
        return 'error' as const;
      case 'acknowledged':
        return 'warning' as const;
      case 'resolved':
        return 'success' as const;
      default:
        return 'default' as const;
    }
  };

  const getStatusIcon = (status: Alert['status']) => {
    const iconClass = "w-4 h-4";
    switch (status) {
      case 'active':
        return <Bell className={iconClass} />;
      case 'acknowledged':
        return <Eye className={iconClass} />;
      case 'resolved':
        return <CheckCircle className={iconClass} />;
      case 'muted':
        return <BellOff className={iconClass} />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchQuery === '' || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || alert.category === categoryFilter;
    const matchesTab = selectedTab === 'active' 
      ? alert.status === 'active' || alert.status === 'acknowledged'
      : alert.status === 'resolved';
    
    return matchesSearch && matchesSeverity && matchesStatus && matchesCategory && matchesTab;
  });

  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged').length;
  const resolvedToday = alerts.filter(a => 
    a.status === 'resolved' && 
    a.resolvedAt && 
    a.resolvedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  const handleAcknowledge = (alertId: string) => {
    console.log('Acknowledging alert:', alertId);
    // In production: call API to acknowledge alert
  };

  const handleResolve = (alertId: string) => {
    console.log('Resolving alert:', alertId);
    // In production: call API to resolve alert
  };

  const handleMute = (alertId: string) => {
    console.log('Muting alert:', alertId);
    // In production: call API to mute alert
  };

  const handleBulkAction = (action: 'acknowledge' | 'resolve' | 'mute') => {
    console.log(`Bulk ${action}:`, Array.from(selectedAlerts));
    // In production: call API for bulk operation
    setSelectedAlerts(new Set());
  };

  const toggleAlertSelection = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const selectAllVisible = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map(a => a.id)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Alert Management
            </h1>
            <p className="text-gray-600">
              Monitor, acknowledge, and resolve system alerts
            </p>
          </div>
          <div className="flex gap-2">
            <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/50 transition-all">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
            <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/50 transition-all">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
            <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/50 transition-all">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{activeAlerts}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Critical</p>
                <p className="text-2xl font-bold text-red-600">{criticalAlerts}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Acknowledged</p>
                <p className="text-2xl font-bold text-yellow-600">{acknowledgedAlerts}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{resolvedToday}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass rounded-xl p-1 inline-flex gap-1">
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTab === 'active'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active Alerts
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTab === 'history'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setSelectedTab('rules')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTab === 'rules'
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Alert Rules
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {selectedTab !== 'rules' ? (
          <>
            {/* Filters */}
            <div className="glass rounded-xl p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px]">
                  <SearchBar
                    placeholder="Search alerts by title, description, or source..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-sm">
                      <Filter className="w-4 h-4" />
                      <span>Severity: {severityFilter === 'all' ? 'All' : severityFilter}</span>
                    </button>
                  }
                  items={[
                    { label: 'All Severities', onClick: () => setSeverityFilter('all') },
                    { label: 'Critical', onClick: () => setSeverityFilter('critical') },
                    { label: 'High', onClick: () => setSeverityFilter('high') },
                    { label: 'Medium', onClick: () => setSeverityFilter('medium') },
                    { label: 'Low', onClick: () => setSeverityFilter('low') },
                    { label: 'Info', onClick: () => setSeverityFilter('info') }
                  ]}
                />
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-sm">
                      <Filter className="w-4 h-4" />
                      <span>Status: {statusFilter === 'all' ? 'All' : statusFilter}</span>
                    </button>
                  }
                  items={[
                    { label: 'All Statuses', onClick: () => setStatusFilter('all') },
                    { label: 'Active', onClick: () => setStatusFilter('active') },
                    { label: 'Acknowledged', onClick: () => setStatusFilter('acknowledged') },
                    { label: 'Resolved', onClick: () => setStatusFilter('resolved') },
                    { label: 'Muted', onClick: () => setStatusFilter('muted') }
                  ]}
                />
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-2 px-3 py-2 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-sm">
                      <Filter className="w-4 h-4" />
                      <span>Category: {categoryFilter === 'all' ? 'All' : categoryFilter}</span>
                    </button>
                  }
                  items={[
                    { label: 'All Categories', onClick: () => setCategoryFilter('all') },
                    { label: 'Infrastructure', onClick: () => setCategoryFilter('infrastructure') },
                    { label: 'Application', onClick: () => setCategoryFilter('application') },
                    { label: 'Security', onClick: () => setCategoryFilter('security') },
                    { label: 'Performance', onClick: () => setCategoryFilter('performance') },
                    { label: 'Availability', onClick: () => setCategoryFilter('availability') }
                  ]}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedAlerts.size > 0 && (
              <div className="glass rounded-xl p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedAlerts.size} alert{selectedAlerts.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction('acknowledge')}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleBulkAction('resolve')}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Resolve
                  </button>
                  <button
                    onClick={() => handleBulkAction('mute')}
                    className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm font-medium flex items-center gap-1"
                  >
                    <VolumeX className="w-4 h-4" />
                    Mute
                  </button>
                  <button
                    onClick={() => setSelectedAlerts(new Set())}
                    className="px-3 py-1.5 bg-white/50 rounded-lg hover:bg-white/70 transition-all text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Alerts List */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTab === 'active' ? 'Active Alerts' : 'Alert History'}
                </h2>
                <button
                  onClick={selectAllVisible}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {selectedAlerts.size === filteredAlerts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="space-y-3">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No alerts found</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`bg-white/50 rounded-xl p-4 hover:bg-white/70 transition-all cursor-pointer border-2 ${
                        selectedAlerts.has(alert.id) ? 'border-blue-500' : 'border-transparent'
                      }`}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button')) return;
                        setSelectedAlert(alert);
                        setShowDetailsModal(true);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedAlerts.has(alert.id)}
                          onChange={() => toggleAlertSelection(alert.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {getSeverityIcon(alert.severity)}
                              <div>
                                <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge variant={getSeverityBadgeVariant(alert.severity)} size="sm">
                                {alert.severity}
                              </StatusBadge>
                              <StatusBadge variant={getStatusBadgeVariant(alert.status)} size="sm">
                                {alert.status}
                              </StatusBadge>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {alert.triggeredAt.toLocaleString()}
                            </span>
                            <span>Source: {alert.source}</span>
                            <span className="capitalize">Category: {alert.category}</span>
                            {alert.assignedTo && (
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {alert.assignedTo}
                              </span>
                            )}
                          </div>

                          {alert.affectedServices.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1">Affected Services:</p>
                              <div className="flex flex-wrap gap-1">
                                {alert.affectedServices.map((service, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                                  >
                                    {service}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {alert.metrics && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500 mb-1">Metric</p>
                                  <p className="font-medium text-gray-900">{alert.metrics.label}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Current Value</p>
                                  <p className="font-medium text-red-600">{alert.metrics.value}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Threshold</p>
                                  <p className="font-medium text-gray-900">{alert.metrics.threshold}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            {alert.status === 'active' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcknowledge(alert.id);
                                  }}
                                  className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  Acknowledge
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResolve(alert.id);
                                  }}
                                  className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center gap-1"
                                >
                                  <Check className="w-4 h-4" />
                                  Resolve
                                </button>
                              </>
                            )}
                            {alert.status === 'acknowledged' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResolve(alert.id);
                                }}
                                className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-medium flex items-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                Resolve
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMute(alert.id);
                              }}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm font-medium flex items-center gap-1"
                            >
                              <VolumeX className="w-4 h-4" />
                              Mute
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAlert(alert);
                                setShowDetailsModal(true);
                              }}
                              className="ml-auto px-3 py-1.5 bg-white rounded-lg hover:bg-gray-50 transition-all text-sm font-medium flex items-center gap-1"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          /* Alert Rules */
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Alert Rules
              </h2>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-medium">
                Create New Rule
              </button>
            </div>

            <div className="space-y-3">
              {alertRules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white/50 rounded-xl p-4 hover:bg-white/70 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                        <StatusBadge 
                          variant={rule.enabled ? 'success' : 'default'} 
                          size="sm"
                        >
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </StatusBadge>
                        <StatusBadge variant={getSeverityBadgeVariant(rule.severity)} size="sm">
                          {rule.severity}
                        </StatusBadge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500 mb-1">Condition</p>
                          <p className="text-gray-900">{rule.condition}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Threshold</p>
                          <p className="text-gray-900 font-medium">{rule.threshold}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Notifications:</span>
                          <div className="inline-flex gap-1 ml-2">
                            {rule.notifications.map((notif, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                              >
                                {notif}
                              </span>
                            ))}
                          </div>
                        </div>
                        {rule.assignee && (
                          <div>
                            <span className="text-gray-500">Assignee:</span>
                            <span className="ml-2 text-gray-900">{rule.assignee}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white rounded-lg transition-all">
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alert Details Modal */}
      {showDetailsModal && selectedAlert && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAlert(null);
          }}
          title="Alert Details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {getSeverityIcon(selectedAlert.severity)}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {selectedAlert.title}
                </h3>
                <p className="text-gray-600 mb-4">{selectedAlert.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <StatusBadge variant={getSeverityBadgeVariant(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </StatusBadge>
                  <StatusBadge variant={getStatusBadgeVariant(selectedAlert.status)}>
                    {selectedAlert.status}
                  </StatusBadge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 mb-1">Source</p>
                <p className="text-sm font-medium text-gray-900">{selectedAlert.source}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{selectedAlert.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Impact</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{selectedAlert.impact}</p>
              </div>
              {selectedAlert.assignedTo && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900">{selectedAlert.assignedTo}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Timeline</p>
              <div className="space-y-2">
                {selectedAlert.timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    <div className="p-1 bg-blue-100 rounded-full mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{event.action}</p>
                      {event.user && (
                        <p className="text-gray-500">by {event.user}</p>
                      )}
                      <p className="text-gray-400 text-xs">{event.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              {selectedAlert.status === 'active' && (
                <>
                  <button
                    onClick={() => {
                      handleAcknowledge(selectedAlert.id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => {
                      handleResolve(selectedAlert.id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium"
                  >
                    Resolve
                  </button>
                </>
              )}
              {selectedAlert.status === 'acknowledged' && (
                <button
                  onClick={() => {
                    handleResolve(selectedAlert.id);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium"
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
