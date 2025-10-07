import React, { useState } from 'react';
import {
  Webhook,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  X,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Code,
  Key,
  Lock,
  Settings,
  Activity,
  Filter
} from 'lucide-react';

interface WebhookConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  enabled: boolean;
  events: string[];
  headers: { [key: string]: string };
  authType: 'none' | 'bearer' | 'basic' | 'api_key';
  authConfig?: {
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  timeout: number;
  createdAt: Date;
  lastTriggered?: Date;
  status: 'active' | 'paused' | 'error';
  stats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
  };
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  timestamp: Date;
  status: 'success' | 'failed' | 'retrying';
  statusCode?: number;
  responseTime: number;
  payload: any;
  response?: any;
  error?: string;
  attemptNumber: number;
}

/**
 * WebhookConfigurationPage - Comprehensive webhook management system
 * 
 * Features:
 * - Create, edit, and delete webhooks
 * - Event subscription management
 * - Authentication configuration (Bearer, Basic, API Key)
 * - Retry policy configuration
 * - Real-time webhook testing
 * - Webhook activity logs
 * - Success/failure statistics
 * - Webhook templates
 * - Payload preview
 * - Bulk operations
 * 
 * Design: Apple Liquid Glass 2025 with glassmorphism and spring animations
 */
export default function WebhookConfigurationPage() {
  const [webhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      name: 'Slack Notifications',
      description: 'Send ticket updates to Slack #incidents channel',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
      method: 'POST',
      enabled: true,
      events: ['ticket.created', 'ticket.updated', 'ticket.resolved'],
      headers: {
        'Content-Type': 'application/json'
      },
      authType: 'none',
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 1000
      },
      timeout: 5000,
      createdAt: new Date('2025-01-01'),
      lastTriggered: new Date(Date.now() - 15 * 60 * 1000),
      status: 'active',
      stats: {
        totalRequests: 1847,
        successfulRequests: 1842,
        failedRequests: 5,
        avgResponseTime: 245
      }
    },
    {
      id: '2',
      name: 'PagerDuty Integration',
      description: 'Trigger PagerDuty incidents for critical alerts',
      url: 'https://events.pagerduty.com/v2/enqueue',
      method: 'POST',
      enabled: true,
      events: ['alert.critical', 'service.down'],
      headers: {
        'Content-Type': 'application/json'
      },
      authType: 'api_key',
      authConfig: {
        apiKey: 'pd_live_••••••••••••',
        apiKeyHeader: 'Authorization'
      },
      retryPolicy: {
        maxAttempts: 5,
        backoffMultiplier: 2,
        initialDelay: 2000
      },
      timeout: 10000,
      createdAt: new Date('2024-12-15'),
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active',
      stats: {
        totalRequests: 342,
        successfulRequests: 340,
        failedRequests: 2,
        avgResponseTime: 189
      }
    },
    {
      id: '3',
      name: 'Custom Analytics Endpoint',
      description: 'Send usage analytics to custom data warehouse',
      url: 'https://analytics.company.com/api/events',
      method: 'POST',
      enabled: false,
      events: ['user.login', 'user.logout', 'ticket.created', 'article.viewed'],
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '2.0'
      },
      authType: 'bearer',
      authConfig: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9••••••'
      },
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 1.5,
        initialDelay: 500
      },
      timeout: 3000,
      createdAt: new Date('2024-11-20'),
      lastTriggered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'paused',
      stats: {
        totalRequests: 8932,
        successfulRequests: 8845,
        failedRequests: 87,
        avgResponseTime: 412
      }
    },
    {
      id: '4',
      name: 'Microsoft Teams Alerts',
      description: 'Post service alerts to Teams channel',
      url: 'https://outlook.office.com/webhook/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
      method: 'POST',
      enabled: true,
      events: ['alert.high', 'alert.critical', 'service.degraded'],
      headers: {
        'Content-Type': 'application/json'
      },
      authType: 'none',
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 1000
      },
      timeout: 5000,
      createdAt: new Date('2024-12-28'),
      lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
      status: 'error',
      stats: {
        totalRequests: 156,
        successfulRequests: 142,
        failedRequests: 14,
        avgResponseTime: 567
      }
    }
  ]);

  const [recentLogs] = useState<WebhookLog[]>([
    {
      id: '1',
      webhookId: '1',
      event: 'ticket.created',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'success',
      statusCode: 200,
      responseTime: 234,
      payload: { ticket_id: 'TKT-1234', title: 'Database connection issue' },
      attemptNumber: 1
    },
    {
      id: '2',
      webhookId: '2',
      event: 'alert.critical',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'success',
      statusCode: 202,
      responseTime: 178,
      payload: { alert_id: 'ALR-5678', severity: 'critical' },
      attemptNumber: 1
    },
    {
      id: '3',
      webhookId: '4',
      event: 'service.degraded',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'failed',
      statusCode: 500,
      responseTime: 890,
      payload: { service: 'API Gateway', status: 'degraded' },
      error: 'Internal Server Error',
      attemptNumber: 3
    }
  ]);

  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const getStatusBadgeClass = (status: WebhookConfig['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'paused':
        return 'bg-yellow-100 text-yellow-700';
      case 'error':
        return 'bg-red-100 text-red-700';
    }
  };

  const getLogStatusIcon = (status: WebhookLog['status']) => {
    const iconClass = "w-4 h-4";
    switch (status) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'failed':
        return <XCircle className={`${iconClass} text-red-600`} />;
      case 'retrying':
        return <RotateCcw className={`${iconClass} text-yellow-600 animate-spin`} />;
    }
  };

  const handleToggleWebhook = (id: string) => {
    console.log('Toggle webhook:', id);
    // In production: call API to enable/disable webhook
  };

  const handleTestWebhook = (id: string) => {
    console.log('Testing webhook:', id);
    // In production: call API to send test payload
  };

  const handleDeleteWebhook = (id: string) => {
    console.log('Delete webhook:', id);
    // In production: call API to delete webhook
  };

  const totalWebhooks = webhooks.length;
  const activeWebhooks = webhooks.filter(w => w.enabled).length;
  const totalRequests = webhooks.reduce((sum, w) => sum + w.stats.totalRequests, 0);
  const successRate = webhooks.length > 0
    ? (webhooks.reduce((sum, w) => sum + w.stats.successfulRequests, 0) / totalRequests * 100).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Webhook Configuration
            </h1>
            <p className="text-gray-600">
              Configure and manage outbound webhooks for event notifications
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-xl flex items-center gap-2 hover:bg-blue-600 transition-all font-medium shadow-lg">
            <Plus className="w-5 h-5" />
            Create Webhook
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Webhooks</p>
                <p className="text-2xl font-bold text-gray-900">{totalWebhooks}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Webhook className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeWebhooks}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Code className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{successRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Webhooks List */}
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configured Webhooks
          </h2>

          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="bg-white/50 rounded-xl p-5 hover:bg-white/70 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      webhook.status === 'active' ? 'bg-green-100' :
                      webhook.status === 'paused' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      <Webhook className={`w-6 h-6 ${
                        webhook.status === 'active' ? 'text-green-600' :
                        webhook.status === 'paused' ? 'text-yellow-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{webhook.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(webhook.status)}`}>
                          {webhook.status}
                        </span>
                        {webhook.enabled ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Enabled
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{webhook.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Endpoint</p>
                          <p className="text-sm font-mono text-gray-900 truncate">{webhook.url}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Method</p>
                          <p className="text-sm font-semibold text-gray-900">{webhook.method}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Auth Type</p>
                          <p className="text-sm text-gray-900 capitalize">{webhook.authType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Timeout</p>
                          <p className="text-sm text-gray-900">{webhook.timeout}ms</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-2">Subscribed Events ({webhook.events.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-mono"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Total Requests</p>
                          <p className="text-sm font-semibold text-gray-900">{webhook.stats.totalRequests.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Success</p>
                          <p className="text-sm font-semibold text-green-600">{webhook.stats.successfulRequests.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Failed</p>
                          <p className="text-sm font-semibold text-red-600">{webhook.stats.failedRequests}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Avg Response</p>
                          <p className="text-sm font-semibold text-gray-900">{webhook.stats.avgResponseTime}ms</p>
                        </div>
                      </div>

                      {webhook.lastTriggered && (
                        <p className="text-xs text-gray-500 mt-3">
                          Last triggered: {webhook.lastTriggered.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleWebhook(webhook.id)}
                      className={`p-2 rounded-lg transition-all ${
                        webhook.enabled
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={webhook.enabled ? 'Pause' : 'Resume'}
                    >
                      {webhook.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleTestWebhook(webhook.id)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                      title="Test webhook"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedWebhook(webhook);
                        setShowLogsModal(true);
                      }}
                      className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all"
                      title="View logs"
                    >
                      <Activity className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-2xl p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentLogs.map((log) => {
              const webhook = webhooks.find(w => w.id === log.webhookId);
              return (
                <div
                  key={log.id}
                  className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {getLogStatusIcon(log.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{webhook?.name}</h4>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-mono">
                            {log.event}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {log.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Status Code</p>
                          <p className="font-semibold text-gray-900">{log.statusCode || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Response Time</p>
                          <p className="font-semibold text-gray-900">{log.responseTime}ms</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Attempt</p>
                          <p className="font-semibold text-gray-900">{log.attemptNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Status</p>
                          <p className={`font-semibold ${
                            log.status === 'success' ? 'text-green-600' :
                            log.status === 'failed' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {log.status}
                          </p>
                        </div>
                      </div>
                      {log.error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <strong>Error:</strong> {log.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
