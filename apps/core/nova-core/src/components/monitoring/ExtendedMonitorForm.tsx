import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Eye, EyeOff, HelpCircle } from 'lucide-react';

interface ExtendedMonitorFormProps {
  onClose: () => void;
  onSubmit: (monitor: any) => void;
  editingMonitor?: any;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function ExtendedMonitorForm({
  onClose,
  onSubmit,
  editingMonitor,
}: ExtendedMonitorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'http',
    url: '',
    hostname: '',
    port: 80,
    interval_seconds: 60,
    timeout_seconds: 30,
    retry_interval_seconds: 60,
    max_retries: 3,
    tags: [] as string[],
    // HTTP specific
    http_method: 'GET',
    http_headers: {} as Record<string, string>,
    http_body: '',
    accepted_status_codes: [200],
    follow_redirects: true,
    ignore_ssl: false,
    // Keyword monitoring
    keyword: '',
    keyword_inverted: false,
    // JSON Query monitoring
    json_path: '',
    expected_value: '',
    // Docker monitoring
    docker_container: '',
    docker_host: 'unix:///var/run/docker.sock',
    // Steam monitoring
    steam_id: '',
    // SSL monitoring
    ssl_days_remaining: 30,
    // Auth settings
    auth_method: 'none',
    auth_username: '',
    auth_password: '',
    auth_token: '',
    auth_domain: '',
    // Proxy settings
    proxy_id: '',
    // Notifications
    notification_settings: {},
  });

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');

  const monitorTypes = [
    { value: 'http', label: 'HTTP(s)', description: 'Monitor web pages and APIs' },
    { value: 'tcp', label: 'TCP Port', description: 'Check if a port is open' },
    { value: 'ping', label: 'Ping', description: 'ICMP ping monitoring' },
    { value: 'dns', label: 'DNS', description: 'DNS resolution monitoring' },
    { value: 'ssl', label: 'SSL Certificate', description: 'Monitor SSL certificate expiry' },
    {
      value: 'keyword',
      label: 'Keyword',
      description: 'Check for specific text in HTTP responses',
    },
    { value: 'json-query', label: 'JSON Query', description: 'Query JSON API responses' },
    { value: 'docker', label: 'Docker Container', description: 'Monitor Docker container status' },
    { value: 'steam', label: 'Steam Game Server', description: 'Monitor Steam game servers' },
    { value: 'grpc', label: 'gRPC', description: 'Monitor gRPC services' },
    { value: 'mqtt', label: 'MQTT', description: 'Monitor MQTT brokers' },
    { value: 'radius', label: 'RADIUS', description: 'Monitor RADIUS servers' },
    {
      value: 'push',
      label: 'Push (Passive)',
      description: 'Passive monitoring via push notifications',
    },
  ];

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  const authMethods = [
    { value: 'none', label: 'None' },
    { value: 'basic', label: 'HTTP Basic Auth' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'api-key', label: 'API Key' },
    { value: 'ntlm', label: 'NTLM' },
  ];

  useEffect(() => {
    fetchTags();
    if (editingMonitor) {
      setFormData({ ...editingMonitor });
    }
  }, [editingMonitor]);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/monitoring/tags');
      const data = await response.json();
      setAvailableTags(data.tags || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on monitor type
    if (!validateForm()) return;

    onSubmit(formData);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert('Monitor name is required');
      return false;
    }

    switch (formData.type) {
      case 'http':
        if (!formData.url.trim()) {
          alert('URL is required for HTTP monitors');
          return false;
        }
        break;
      case 'tcp':
      case 'ping':
      case 'dns':
        if (!formData.hostname.trim()) {
          alert('Hostname is required');
          return false;
        }
        break;
      case 'keyword':
        if (!formData.url.trim() || !formData.keyword.trim()) {
          alert('URL and keyword are required for keyword monitors');
          return false;
        }
        break;
      case 'json-query':
        if (!formData.url.trim() || !formData.json_path.trim()) {
          alert('URL and JSON path are required for JSON query monitors');
          return false;
        }
        break;
      case 'docker':
        if (!formData.docker_container.trim()) {
          alert('Container name is required for Docker monitors');
          return false;
        }
        break;
      case 'steam':
        if (!formData.hostname.trim()) {
          alert('Hostname is required for Steam monitors');
          return false;
        }
        break;
    }

    return true;
  };

  const addHeader = () => {
    if (headerKey && headerValue) {
      setFormData((prev) => ({
        ...prev,
        http_headers: {
          ...prev.http_headers,
          [headerKey]: headerValue,
        },
      }));
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    setFormData((prev) => {
      const newHeaders = { ...prev.http_headers };
      delete newHeaders[key];
      return {
        ...prev,
        http_headers: newHeaders,
      };
    });
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((id) => id !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const addStatusCode = () => {
    const newCode = parseInt(prompt('Enter status code (e.g., 201):') || '200');
    if (newCode >= 100 && newCode <= 599) {
      setFormData((prev) => ({
        ...prev,
        accepted_status_codes: [...prev.accepted_status_codes, newCode],
      }));
    }
  };

  const removeStatusCode = (code: number) => {
    setFormData((prev) => ({
      ...prev,
      accepted_status_codes: prev.accepted_status_codes.filter((c) => c !== code),
    }));
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'http':
      case 'keyword':
      case 'json-query':
        return (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="http_method"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  HTTP Method
                </label>
                <select
                  id="http_method"
                  value={formData.http_method}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, http_method: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {httpMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="auth_method"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Authentication
                </label>
                <select
                  id="auth_method"
                  value={formData.auth_method}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, auth_method: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {authMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.auth_method !== 'none' && (
              <div className="grid grid-cols-2 gap-4">
                {formData.auth_method === 'basic' && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        type="text"
                        value={formData.auth_username}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, auth_username: e.target.value }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.auth_password}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, auth_password: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {formData.auth_method === 'bearer' && (
                  <div className="col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Bearer Token
                    </label>
                    <input
                      type="password"
                      value={formData.auth_token}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, auth_token: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}

            {formData.type === 'keyword' && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Keyword to Search *
                  </label>
                  <input
                    type="text"
                    value={formData.keyword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, keyword: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="success"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keyword_inverted"
                    checked={formData.keyword_inverted}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, keyword_inverted: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="keyword_inverted" className="ml-2 block text-sm text-gray-700">
                    Alert when keyword is NOT found (inverted)
                  </label>
                </div>
              </div>
            )}

            {formData.type === 'json-query' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    JSON Path *
                  </label>
                  <input
                    type="text"
                    value={formData.json_path}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, json_path: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="data.status"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Expected Value
                  </label>
                  <input
                    type="text"
                    value={formData.expected_value}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expected_value: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="ok"
                  />
                </div>
              </div>
            )}

            {/* HTTP Headers */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">HTTP Headers</label>
              <div className="space-y-2">
                {Object.entries(formData.http_headers).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                      {key}: {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHeader(key)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={headerKey}
                    onChange={(e) => setHeaderKey(e.target.value)}
                    placeholder="Header name"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={headerValue}
                    onChange={(e) => setHeaderValue(e.target.value)}
                    placeholder="Header value"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addHeader}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Accepted Status Codes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Accepted Status Codes
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.accepted_status_codes.map((code) => (
                    <div key={code} className="flex items-center rounded-lg bg-gray-100 px-2 py-1">
                      <span className="font-mono text-sm">{code}</span>
                      <button
                        type="button"
                        onClick={() => removeStatusCode(code)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addStatusCode}
                    className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-3 w-3" />
                    Add Code
                  </button>
                </div>
              </div>
            </div>

            {/* SSL Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="follow_redirects"
                  checked={formData.follow_redirects}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, follow_redirects: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="follow_redirects" className="ml-2 block text-sm text-gray-700">
                  Follow Redirects
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ignore_ssl"
                  checked={formData.ignore_ssl}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ignore_ssl: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ignore_ssl" className="ml-2 block text-sm text-gray-700">
                  Ignore SSL Errors
                </label>
              </div>
            </div>
          </div>
        );

      case 'tcp':
      case 'ping':
      case 'dns':
      case 'grpc':
      case 'mqtt':
      case 'radius':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Hostname *</label>
              <input
                type="text"
                value={formData.hostname}
                onChange={(e) => setFormData((prev) => ({ ...prev, hostname: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, port: parseInt(e.target.value) }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                min="1"
                max="65535"
              />
            </div>
          </div>
        );

      case 'docker':
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Container Name *
              </label>
              <input
                type="text"
                value={formData.docker_container}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, docker_container: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="my-container"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Docker Host</label>
              <input
                type="text"
                value={formData.docker_host}
                onChange={(e) => setFormData((prev) => ({ ...prev, docker_host: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="unix:///var/run/docker.sock"
              />
            </div>
          </div>
        );

      case 'steam':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Server IP/Hostname *
              </label>
              <input
                type="text"
                value={formData.hostname}
                onChange={(e) => setFormData((prev) => ({ ...prev, hostname: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="game.example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Port (default: 27015)
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, port: parseInt(e.target.value) }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="27015"
              />
            </div>
          </div>
        );

      case 'ssl':
        return (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Hostname *</label>
              <input
                type="text"
                value={formData.hostname}
                onChange={(e) => setFormData((prev) => ({ ...prev, hostname: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="example.com"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, port: parseInt(e.target.value) }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="443"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Alert Days Before Expiry
              </label>
              <input
                type="number"
                value={formData.ssl_days_remaining}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ssl_days_remaining: parseInt(e.target.value) }))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="30"
              />
            </div>
          </div>
        );

      case 'push':
        return (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Push Monitoring</h4>
            </div>
            <p className="text-sm text-blue-700">
              Push monitors receive data from external sources. After creating this monitor, you'll
              receive a unique URL to send heartbeat requests to.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {editingMonitor ? 'Edit Monitor' : 'Create New Monitor'}
          </h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Monitor Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  placeholder="My API Monitor"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Monitor Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  {monitorTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type-specific fields */}
            {renderTypeSpecificFields()}

            {/* Timing Configuration */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Check Interval (seconds)
                </label>
                <input
                  type="number"
                  value={formData.interval_seconds}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, interval_seconds: parseInt(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  min="20"
                  max="86400"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={formData.timeout_seconds}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, timeout_seconds: parseInt(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="300"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Retry Interval (seconds)
                </label>
                <input
                  type="number"
                  value={formData.retry_interval_seconds}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      retry_interval_seconds: parseInt(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="3600"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Max Retries</label>
                <input
                  type="number"
                  value={formData.max_retries}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, max_retries: parseInt(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="10"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      formData.tags.includes(tag.id)
                        ? 'border-2 border-blue-300 bg-blue-100 text-blue-800'
                        : 'border-2 border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor: formData.tags.includes(tag.id)
                        ? tag.color + '20'
                        : undefined,
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-gray-200 bg-gray-50 p-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              {editingMonitor ? 'Update Monitor' : 'Create Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
