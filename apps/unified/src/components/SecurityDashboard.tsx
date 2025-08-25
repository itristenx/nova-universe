import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  WifiIcon,
  MapPinIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useRBACStore } from '../stores/rbacStore';

// Enhanced Security Types
export interface SecurityEvent {
  id: string;
  type:
    | 'login'
    | 'permission_change'
    | 'data_access'
    | 'failed_login'
    | 'password_change'
    | 'session_anomaly'
    | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id: string;
  user_email: string;
  resource?: string;
  action?: string;
  ip_address: string;
  user_agent: string;
  location?: {
    country: string;
    city: string;
    coordinates?: [number, number];
  };
  device_info: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    is_trusted: boolean;
  };
  timestamp: Date;
  details: Record<string, any>;
  risk_score: number;
  session_id: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'data_protection' | 'session_management' | 'audit';
  enabled: boolean;
  configuration: Record<string, any>;
  enforcement_level: 'warn' | 'block' | 'monitor';
  created_at: Date;
  updated_at: Date;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  affected_users?: string[];
  risk_indicators: string[];
  recommended_actions: string[];
  created_at: Date;
  resolved_at?: Date;
  assigned_to?: string;
}

export interface DeviceInfo {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  is_trusted: boolean;
  last_used: Date;
  first_seen: Date;
  location_history: Array<{
    country: string;
    city: string;
    timestamp: Date;
  }>;
  risk_score: number;
}

export interface SessionInfo {
  id: string;
  user_id: string;
  device_id: string;
  ip_address: string;
  location: {
    country: string;
    city: string;
  };
  started_at: Date;
  last_activity: Date;
  is_active: boolean;
  risk_factors: string[];
  permissions_used: string[];
}

// Security Dashboard Component
export const SecurityDashboard: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [trustedDevices, setTrustedDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const { currentUser, hasPermission } = useRBACStore();

  useEffect(() => {
    if (hasPermission('security.view')) {
      loadSecurityData();
    }
  }, [timeRange, hasPermission]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API calls
      setSecurityEvents([
        {
          id: '1',
          type: 'login',
          severity: 'low',
          user_id: 'user1',
          user_email: 'john.doe@company.com',
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          location: {
            country: 'United States',
            city: 'San Francisco',
          },
          device_info: {
            type: 'desktop',
            os: 'macOS',
            browser: 'Chrome',
            is_trusted: true,
          },
          timestamp: new Date('2024-01-20T10:30:00'),
          details: { login_method: 'password' },
          risk_score: 15,
          session_id: 'sess_1',
        },
        {
          id: '2',
          type: 'failed_login',
          severity: 'medium',
          user_id: 'user2',
          user_email: 'jane.smith@company.com',
          ip_address: '203.0.113.45',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          location: {
            country: 'Unknown',
            city: 'Unknown',
          },
          device_info: {
            type: 'desktop',
            os: 'Windows',
            browser: 'Edge',
            is_trusted: false,
          },
          timestamp: new Date('2024-01-20T09:15:00'),
          details: {
            attempts: 3,
            reason: 'invalid_password',
            account_locked: false,
          },
          risk_score: 65,
          session_id: 'sess_2',
        },
        {
          id: '3',
          type: 'privilege_escalation',
          severity: 'high',
          user_id: 'user3',
          user_email: 'admin@company.com',
          resource: 'user_management',
          action: 'role_assignment',
          ip_address: '10.0.0.50',
          user_agent: 'Nova-Admin-CLI/1.0',
          location: {
            country: 'United States',
            city: 'New York',
          },
          device_info: {
            type: 'desktop',
            os: 'Linux',
            browser: 'CLI',
            is_trusted: true,
          },
          timestamp: new Date('2024-01-20T08:45:00'),
          details: {
            target_user: 'user4',
            role_added: 'system_admin',
            justification: 'Emergency access for system maintenance',
          },
          risk_score: 85,
          session_id: 'sess_3',
        },
      ]);

      setSecurityAlerts([
        {
          id: '1',
          title: 'Unusual Login Activity Detected',
          description: 'Multiple failed login attempts from unknown IP addresses',
          severity: 'high',
          category: 'Authentication',
          status: 'active',
          affected_users: ['jane.smith@company.com'],
          risk_indicators: [
            'Failed login attempts from new location',
            'Rapid successive login attempts',
            'User agent indicates bot-like behavior',
          ],
          recommended_actions: [
            'Temporarily lock the affected account',
            'Require MFA for next login',
            'Monitor for additional suspicious activity',
          ],
          created_at: new Date('2024-01-20T09:16:00'),
        },
        {
          id: '2',
          title: 'Privilege Escalation Requires Review',
          description: 'Administrative role assigned outside normal business hours',
          severity: 'medium',
          category: 'Authorization',
          status: 'investigating',
          affected_users: ['user4@company.com'],
          risk_indicators: [
            'Role assignment outside business hours',
            'High-privilege role assigned',
            'Emergency justification provided',
          ],
          recommended_actions: [
            'Verify emergency justification',
            'Review role assignment logs',
            'Contact assigned user for confirmation',
          ],
          created_at: new Date('2024-01-20T08:45:00'),
          assigned_to: 'security_team',
        },
      ]);

      setActiveSessions([
        {
          id: 'sess_1',
          user_id: 'user1',
          device_id: 'dev_1',
          ip_address: '192.168.1.100',
          location: {
            country: 'United States',
            city: 'San Francisco',
          },
          started_at: new Date('2024-01-20T10:30:00'),
          last_activity: new Date('2024-01-20T11:45:00'),
          is_active: true,
          risk_factors: [],
          permissions_used: ['catalog.view', 'request.create'],
        },
        {
          id: 'sess_2',
          user_id: 'user2',
          device_id: 'dev_2',
          ip_address: '10.0.0.25',
          location: {
            country: 'United States',
            city: 'New York',
          },
          started_at: new Date('2024-01-20T09:00:00'),
          last_activity: new Date('2024-01-20T11:30:00'),
          is_active: true,
          risk_factors: ['new_device'],
          permissions_used: ['admin.view', 'user.manage'],
        },
      ]);

      setTrustedDevices([
        {
          id: 'dev_1',
          user_id: 'user1',
          device_name: "John's MacBook Pro",
          device_type: 'desktop',
          os: 'macOS 14.2',
          browser: 'Chrome 120.0',
          is_trusted: true,
          last_used: new Date('2024-01-20T11:45:00'),
          first_seen: new Date('2024-01-15T09:00:00'),
          location_history: [
            {
              country: 'United States',
              city: 'San Francisco',
              timestamp: new Date('2024-01-20T10:30:00'),
            },
          ],
          risk_score: 15,
        },
      ]);
    } catch (_error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LockClosedIcon className="h-4 w-4" />;
      case 'failed_login':
        return <XCircleIcon className="h-4 w-4" />;
      case 'permission_change':
        return <KeyIcon className="h-4 w-4" />;
      case 'data_access':
        return <EyeIcon className="h-4 w-4" />;
      case 'privilege_escalation':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ShieldCheckIcon className="h-4 w-4" />;
    }
  };

  if (!hasPermission('security.view')) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view security data.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
          <p className="text-gray-600">Monitor security events and manage policies</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <div className="rounded-lg border bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="flex items-center text-lg font-medium text-gray-900">
              <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-500" />
              Active Security Alerts
            </h3>
          </div>
          <div className="space-y-4 p-6">
            {securityAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-r-lg border-l-4 p-4 ${
                  alert.severity === 'critical'
                    ? 'border-red-500 bg-red-50'
                    : alert.severity === 'high'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(alert.severity)}`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500">{alert.category}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{alert.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <ClockIcon className="mr-1 h-3 w-3" />
                        {alert.created_at.toLocaleString()}
                      </span>
                      {alert.affected_users && (
                        <span className="flex items-center">
                          <UserIcon className="mr-1 h-3 w-3" />
                          {alert.affected_users.length} user(s)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Investigate
                    </button>
                    <button className="text-sm text-gray-600 hover:text-gray-800">Dismiss</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Security Events</p>
              <p className="text-2xl font-semibold text-gray-900">{securityEvents.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {securityAlerts.filter((a) => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {activeSessions.filter((s) => s.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <ComputerDesktopIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Trusted Devices</p>
              <p className="text-2xl font-semibold text-gray-900">
                {trustedDevices.filter((d) => d.is_trusted).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="rounded-lg border bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Security Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {securityEvents.slice(0, 10).map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`rounded-full p-1 ${getSeverityColor(event.severity)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {event.type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-gray-500">{event.severity}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.user_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPinIcon className="mr-1 h-4 w-4" />
                      {event.location
                        ? `${event.location.city}, ${event.location.country}`
                        : 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500">{event.ip_address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {event.device_info.type === 'desktop' ? (
                        <ComputerDesktopIcon className="mr-1 h-4 w-4" />
                      ) : (
                        <DevicePhoneMobileIcon className="mr-1 h-4 w-4" />
                      )}
                      <div>
                        <div className="text-sm text-gray-900">{event.device_info.os}</div>
                        <div className="text-xs text-gray-500">{event.device_info.browser}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        event.risk_score >= 80
                          ? 'bg-red-100 text-red-800'
                          : event.risk_score >= 60
                            ? 'bg-orange-100 text-orange-800'
                            : event.risk_score >= 40
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {event.risk_score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {event.timestamp.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-lg border bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {session.location.city}, {session.location.country}
                    </div>
                    <div className="text-sm text-gray-500">{session.ip_address}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Started: {session.started_at.toLocaleString()}
                  </div>
                  {session.risk_factors.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-yellow-600">
                        {session.risk_factors.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <button className="text-sm text-red-600 hover:text-red-800">Terminate</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
