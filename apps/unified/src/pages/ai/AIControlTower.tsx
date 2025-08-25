import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CpuChipIcon,
  CircleStackIcon,
  BoltIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CommandLineIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { api } from '@services/api';

interface AIModel {
  id: string;
  name: string;
  type: 'general' | 'specialized' | 'rag';
  status: 'active' | 'inactive' | 'training' | 'error';
  usage: {
    requests: number;
    errors: number;
    avgResponseTime: number;
  };
  lastUsed: string | null;
  isDefault: boolean;
  priority: number;
  capabilities: string[];
  healthScore: number;
}

interface AIMetrics {
  totalRequests: number;
  totalResponses: number;
  avgResponseTime: number;
  errorRate: number;
  modelsActive: number;
  complianceScore: number;
  securityStatus: 'secure' | 'warning' | 'critical';
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

interface AISession {
  id: string;
  userId: string;
  model: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'error';
  requestCount: number;
  lastActivity: string;
}

interface MCPServer {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  endpoint: string;
  capabilities: string[];
  clients: number;
  uptime: string;
  version: string;
}

export default function AIControlTower() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'models' | 'sessions' | 'mcp' | 'security'
  >('overview');

  // State
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [mcpServers, setMCPServers] = useState<MCPServer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load AI Fabric metrics
      const [metricsRes, modelsRes, sessionsRes, mcpRes] = await Promise.all([
        api.get('/api/v2/ai-fabric/metrics'),
        api.get('/api/v2/ai-fabric/models'),
        api.get('/api/v2/ai-fabric/sessions'),
        api.get('/api/v2/mcp/servers'),
      ]);

      setMetrics(metricsRes.data);
      setModels(modelsRes.data);
      setSessions(sessionsRes.data);
      setMCPServers(mcpRes.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load AI Control Tower data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleModelAction = async (modelId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await api.post(`/api/v2/ai-fabric/models/${modelId}/${action}`);
      await loadDashboardData();
    } catch (err: any) {
      console.error(`Failed to ${action} model:`, err);
      setError(`Failed to ${action} model`);
    }
  };

  const handleMCPAction = async (serverId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await api.post(`/api/v2/mcp/servers/${serverId}/${action}`);
      await loadDashboardData();
    } catch (err: any) {
      console.error(`Failed to ${action} MCP server:`, err);
      setError(`Failed to ${action} MCP server`);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <CpuChipIcon className="h-8 w-8 text-blue-600" />
            Nova AI Control Tower
          </h1>
          <p className="mt-1 text-gray-600">
            Centralized management and monitoring for Nova's AI systems
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className="btn btn-secondary flex items-center gap-2"
            disabled={loading}
          >
            <ArrowTrendingUpIcon className="h-4 w-4" />
            Refresh
          </button>

          <button className="btn btn-primary flex items-center gap-2">
            <Cog6ToothIcon className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 text-red-600" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Status Overview */}
      {metrics && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalRequests.toLocaleString()}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime}ms</p>
              </div>
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(metrics.errorRate * 100).toFixed(1)}%
                </p>
              </div>
              <ExclamationTriangleIcon
                className={`h-8 w-8 ${metrics.errorRate > 0.05 ? 'text-red-600' : 'text-green-600'}`}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Status</p>
                <p
                  className={`text-2xl font-bold ${
                    metrics.securityStatus === 'secure'
                      ? 'text-green-600'
                      : metrics.securityStatus === 'warning'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {metrics.securityStatus.toUpperCase()}
                </p>
              </div>
              <ShieldCheckIcon
                className={`h-8 w-8 ${
                  metrics.securityStatus === 'secure'
                    ? 'text-green-600'
                    : metrics.securityStatus === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: EyeIcon },
            { id: 'models', label: 'AI Models', icon: CpuChipIcon },
            { id: 'sessions', label: 'Active Sessions', icon: UserGroupIcon },
            { id: 'mcp', label: 'MCP Servers', icon: CircleStackIcon },
            { id: 'security', label: 'Security', icon: ShieldCheckIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Health */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <BoltIcon className="h-5 w-5 text-yellow-600" />
                System Health
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-green-600">
                    {metrics?.performanceGrade || 'A'}
                  </div>
                  <p className="text-sm text-gray-600">Performance Grade</p>
                </div>

                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-blue-600">
                    {metrics?.complianceScore.toFixed(1) || '98.5'}%
                  </div>
                  <p className="text-sm text-gray-600">Compliance Score</p>
                </div>

                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-purple-600">
                    {metrics?.modelsActive || models.filter((m) => m.status === 'active').length}
                  </div>
                  <p className="text-sm text-gray-600">Active Models</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                Recent Activity
              </h3>

              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          session.status === 'active'
                            ? 'bg-green-500'
                            : session.status === 'completed'
                              ? 'bg-blue-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <span className="text-sm font-medium">Session {session.id.slice(0, 8)}</span>
                      <span className="text-sm text-gray-500">Model: {session.model}</span>
                    </div>
                    <div className="text-sm text-gray-500">{session.requestCount} requests</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">AI Models</h3>
              <button className="btn btn-primary flex items-center gap-2">
                <BeakerIcon className="h-4 w-4" />
                Deploy New Model
              </button>
            </div>

            <div className="grid gap-6">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-gray-900">{model.name}</h4>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            model.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : model.status === 'inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : model.status === 'training'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {model.status}
                        </span>
                        {model.isDefault && (
                          <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mb-3 text-sm text-gray-600">
                        Type: {model.type} | Health Score: {model.healthScore}%
                      </p>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {model.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Requests:</span>
                          <span className="ml-2 font-medium">
                            {model.usage.requests.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Errors:</span>
                          <span className="ml-2 font-medium">{model.usage.errors}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Response:</span>
                          <span className="ml-2 font-medium">{model.usage.avgResponseTime}ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      {model.status === 'active' ? (
                        <button
                          onClick={() => handleModelAction(model.id, 'stop')}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Stop Model"
                        >
                          <StopIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleModelAction(model.id, 'start')}
                          className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                          title="Start Model"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleModelAction(model.id, 'restart')}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="Restart Model"
                      >
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                      </button>

                      <button
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-50"
                        title="Model Settings"
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active AI Sessions</h3>
              <span className="text-sm text-gray-600">
                {sessions.filter((s) => s.status === 'active').length} active sessions
              </span>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Requests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                        {session.id.slice(0, 12)}...
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        {session.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            session.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : session.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        {session.requestCount}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        {new Date(session.startTime).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <button className="mr-3 text-blue-600 hover:text-blue-900">View</button>
                        <button className="text-red-600 hover:text-red-900">Terminate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'mcp' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">MCP Servers</h3>
              <button className="btn btn-primary flex items-center gap-2">
                <RocketLaunchIcon className="h-4 w-4" />
                Deploy MCP Server
              </button>
            </div>

            <div className="grid gap-6">
              {mcpServers.map((server) => (
                <div
                  key={server.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-gray-900">{server.name}</h4>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            server.status === 'running'
                              ? 'bg-green-100 text-green-800'
                              : server.status === 'stopped'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {server.status}
                        </span>
                      </div>

                      <p className="mb-3 text-sm text-gray-600">Endpoint: {server.endpoint}</p>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {server.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="rounded bg-purple-50 px-2 py-1 text-xs text-purple-700"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Clients:</span>
                          <span className="ml-2 font-medium">{server.clients}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Uptime:</span>
                          <span className="ml-2 font-medium">{server.uptime}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Version:</span>
                          <span className="ml-2 font-medium">{server.version}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2">
                      {server.status === 'running' ? (
                        <button
                          onClick={() => handleMCPAction(server.id, 'stop')}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Stop Server"
                        >
                          <StopIcon className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMCPAction(server.id, 'start')}
                          className="rounded-lg p-2 text-green-600 hover:bg-green-50"
                          title="Start Server"
                        >
                          <PlayIcon className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleMCPAction(server.id, 'restart')}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="Restart Server"
                      >
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                      </button>

                      <button
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-50"
                        title="Server Console"
                      >
                        <CommandLineIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security & Compliance</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                  Security Status
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Encryption</span>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Authentication</span>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rate Limiting</span>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Audit Logging</span>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  Compliance
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">NIST AI RMF</span>
                    <span className="text-sm font-medium text-green-600">98.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ISO/IEC 42001</span>
                    <span className="text-sm font-medium text-green-600">97.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">EU AI Act</span>
                    <span className="text-sm font-medium text-green-600">99.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">GDPR</span>
                    <span className="text-sm font-medium text-green-600">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
