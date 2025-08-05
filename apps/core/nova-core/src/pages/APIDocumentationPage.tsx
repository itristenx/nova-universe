import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button, 
  Input, 
  Textarea,
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Chip,
  Code,
  Snippet,
  Accordion,
  AccordionItem,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@heroui/react';
import { 
  KeyIcon, 
  DocumentTextIcon, 
  CodeBracketIcon, 
  ClipboardDocumentIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { getEnv } from '@/lib/env';
import { useToastStore } from '@/stores/toast';
import type { ApiKey } from '@/types';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  requestBody?: {
    type: string;
    example: string;
  };
  responses: {
    status: number;
    description: string;
    example?: string;
  }[];
}

export const APIDocumentationPage: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('documentation');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const { apiUrl } = getEnv();
  const { addToast } = useToastStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Mock API endpoints data
  const apiEndpoints: Record<string, ApiEndpoint[]> = {
    'Authentication': [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate user and receive access token',
        requestBody: {
          type: 'application/json',
          example: JSON.stringify({ email: 'user@example.com', password: 'password123' }, null, 2)
        },
        responses: [
          {
            status: 200,
            description: 'Authentication successful',
            example: JSON.stringify({ token: 'jwt_token_here', user: { id: 1, email: 'user@example.com' } }, null, 2)
          },
          { status: 401, description: 'Invalid credentials' },
          { status: 400, description: 'Missing required fields' }
        ]
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Logout user and invalidate token',
        responses: [
          { status: 200, description: 'Logout successful' },
          { status: 401, description: 'Invalid token' }
        ]
      }
    ],
    'Tickets': [
      {
        method: 'GET',
        path: '/api/tickets',
        description: 'Retrieve all tickets with optional filtering',
        parameters: [
          { name: 'status', type: 'string', required: false, description: 'Filter by ticket status (open, closed, pending)' },
          { name: 'priority', type: 'string', required: false, description: 'Filter by priority (low, medium, high, critical)' },
          { name: 'assignee', type: 'number', required: false, description: 'Filter by assignee user ID' },
          { name: 'page', type: 'number', required: false, description: 'Page number for pagination' },
          { name: 'limit', type: 'number', required: false, description: 'Number of results per page' }
        ],
        responses: [
          {
            status: 200,
            description: 'List of tickets',
            example: JSON.stringify({
              tickets: [
                { id: 1, title: 'Login Issue', status: 'open', priority: 'high', assignee: { id: 1, name: 'John Doe' } }
              ],
              pagination: { page: 1, limit: 10, total: 25, pages: 3 }
            }, null, 2)
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/tickets',
        description: 'Create a new ticket',
        requestBody: {
          type: 'application/json',
          example: JSON.stringify({
            title: 'Unable to access dashboard',
            description: 'User cannot login to the main dashboard',
            priority: 'medium',
            category: 'technical',
            requestor_email: 'user@example.com'
          }, null, 2)
        },
        responses: [
          {
            status: 201,
            description: 'Ticket created successfully',
            example: JSON.stringify({ id: 123, title: 'Unable to access dashboard', status: 'open' }, null, 2)
          },
          { status: 400, description: 'Invalid ticket data' },
          { status: 401, description: 'Authentication required' }
        ]
      },
      {
        method: 'GET',
        path: '/api/tickets/:id',
        description: 'Get specific ticket by ID',
        parameters: [
          { name: 'id', type: 'number', required: true, description: 'Ticket ID' }
        ],
        responses: [
          {
            status: 200,
            description: 'Ticket details',
            example: JSON.stringify({
              id: 123,
              title: 'Login Issue',
              description: 'User cannot access system',
              status: 'open',
              priority: 'high',
              created_at: '2024-01-15T10:30:00Z',
              assignee: { id: 1, name: 'John Doe', email: 'john@example.com' }
            }, null, 2)
          },
          { status: 404, description: 'Ticket not found' }
        ]
      },
      {
        method: 'PUT',
        path: '/api/tickets/:id',
        description: 'Update existing ticket',
        parameters: [
          { name: 'id', type: 'number', required: true, description: 'Ticket ID' }
        ],
        requestBody: {
          type: 'application/json',
          example: JSON.stringify({ status: 'in_progress', assignee_id: 2, notes: 'Working on resolution' }, null, 2)
        },
        responses: [
          { status: 200, description: 'Ticket updated successfully' },
          { status: 404, description: 'Ticket not found' },
          { status: 400, description: 'Invalid update data' }
        ]
      }
    ],
    'Users': [
      {
        method: 'GET',
        path: '/api/users',
        description: 'Retrieve all users',
        parameters: [
          { name: 'role', type: 'string', required: false, description: 'Filter by user role' },
          { name: 'active', type: 'boolean', required: false, description: 'Filter by active status' }
        ],
        responses: [
          {
            status: 200,
            description: 'List of users',
            example: JSON.stringify({
              users: [
                { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', active: true }
              ]
            }, null, 2)
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/users',
        description: 'Create new user',
        requestBody: {
          type: 'application/json',
          example: JSON.stringify({
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'agent',
            password: 'secure_password'
          }, null, 2)
        },
        responses: [
          { status: 201, description: 'User created successfully' },
          { status: 400, description: 'Invalid user data' },
          { status: 409, description: 'Email already exists' }
        ]
      }
    ],
    'Reports': [
      {
        method: 'GET',
        path: '/api/reports/analytics',
        description: 'Get system analytics and metrics',
        parameters: [
          { name: 'period', type: 'string', required: false, description: 'Time period (7d, 30d, 90d)' },
          { name: 'type', type: 'string', required: false, description: 'Report type (tickets, users, performance)' }
        ],
        responses: [
          {
            status: 200,
            description: 'Analytics data',
            example: JSON.stringify({
              period: '7d',
              tickets: { created: 45, resolved: 38, pending: 7 },
              response_times: { avg: 2.5, median: 1.8 },
              satisfaction: { score: 4.2, responses: 23 }
            }, null, 2)
          }
        ]
      }
    ]
  };

  const load = async () => {
    try {
      setLoading(true);
      // For now, use mock data since the API endpoint doesn't exist yet
      // const data = await api.getApiKeys();
      
      // Generate mock API keys
      const mockKeys: ApiKey[] = [
        {
          key: 'nv_sk_live_1234567890abcdef',
          createdAt: '2024-01-10T10:30:00Z',
          description: 'Production API key for ticket management'
        },
        {
          key: 'nv_sk_test_abcdef1234567890',
          createdAt: '2024-01-08T14:22:00Z',
          description: 'Development testing key'
        }
      ];
      
      setKeys(mockKeys);
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Error', description: 'Failed to load API keys' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createKey = async () => {
    try {
      // const { apiKey } = await api.createApiKey();
      const newKey: ApiKey = {
        key: `nv_sk_live_${Math.random().toString(36).substring(2, 18)}`,
        createdAt: new Date().toISOString(),
        description: newKeyDescription || 'New API key'
      };
      
      setKeys(prev => [...prev, newKey]);
      setNewKeyDescription('');
      addToast({ type: 'success', title: 'Success', description: 'API key created successfully' });
      onOpenChange();
    } catch (err) {
      console.error("Failed to create API key:", err);
      addToast({ type: 'error', title: 'Error', description: 'Failed to create API key' });
    }
  };

  const deleteKey = async (key: string) => {
    try {
      // await api.deleteApiKey(key);
      setKeys(prev => prev.filter(k => k.key !== key));
      addToast({ type: 'success', title: 'Success', description: 'API key deleted successfully' });
    } catch (err) {
      console.error("Failed to delete API key:", err);
      addToast({ type: 'error', title: 'Error', description: 'Failed to delete API key' });
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ type: 'success', title: 'Copied', description: 'Copied to clipboard' });
  };

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 12)}${'*'.repeat(8)}${key.substring(key.length - 4)}`;
  };

  const getMethodColor = (method: string) => {
    const colors = {
      'GET': 'success',
      'POST': 'primary',
      'PUT': 'warning',
      'DELETE': 'danger',
      'PATCH': 'secondary'
    };
    return colors[method as keyof typeof colors] || 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
          <p className="mt-1 text-sm text-gray-600">Explore the Nova Universe API, manage keys, and test endpoints.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            color="primary" 
            startContent={<GlobeAltIcon className="h-4 w-4" />}
            onPress={() => window.open(`${apiUrl}/api-docs`, '_blank')}
          >
            Open Swagger UI
          </Button>
        </div>
      </div>

      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
        <Tab key="documentation" title={
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-4 w-4" />
            <span>API Reference</span>
          </div>
        }>
          <div className="space-y-6">
            {/* API Overview */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Getting Started</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Base URL</h4>
                  <Snippet symbol="">{apiUrl}</Snippet>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    All API requests require authentication using an API key in the Authorization header:
                  </p>
                  <Code>Authorization: Bearer YOUR_API_KEY</Code>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Response Format</h4>
                  <p className="text-sm text-gray-600">
                    All responses are returned in JSON format with consistent error handling and status codes.
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* API Endpoints */}
            {Object.entries(apiEndpoints).map(([category, endpoints]) => (
              <Card key={category}>
                <CardHeader>
                  <h3 className="text-lg font-semibold">{category} Endpoints</h3>
                </CardHeader>
                <CardBody>
                  <Accordion variant="splitted">
                    {endpoints.map((endpoint, idx) => (
                      <AccordionItem
                        key={`${category}-${idx}`}
                        title={
                          <div className="flex items-center gap-3">
                            <Chip 
                              color={getMethodColor(endpoint.method) as any} 
                              size="sm" 
                              variant="flat"
                            >
                              {endpoint.method}
                            </Chip>
                            <code className="text-sm">{endpoint.path}</code>
                          </div>
                        }
                        subtitle={endpoint.description}
                      >
                        <div className="space-y-4">
                          {endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Parameters</h5>
                              <Table aria-label="Parameters">
                                <TableHeader>
                                  <TableColumn>Name</TableColumn>
                                  <TableColumn>Type</TableColumn>
                                  <TableColumn>Required</TableColumn>
                                  <TableColumn>Description</TableColumn>
                                </TableHeader>
                                <TableBody>
                                  {endpoint.parameters.map((param, paramIdx) => (
                                    <TableRow key={paramIdx}>
                                      <TableCell>
                                        <code className="text-sm">{param.name}</code>
                                      </TableCell>
                                      <TableCell>
                                        <Chip size="sm" variant="flat">{param.type}</Chip>
                                      </TableCell>
                                      <TableCell>
                                        <Chip 
                                          size="sm" 
                                          color={param.required ? 'danger' : 'default'} 
                                          variant="flat"
                                        >
                                          {param.required ? 'Required' : 'Optional'}
                                        </Chip>
                                      </TableCell>
                                      <TableCell className="text-sm">{param.description}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}

                          {endpoint.requestBody && (
                            <div>
                              <h5 className="font-medium mb-2">Request Body</h5>
                              <pre className="p-3 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                                <code>{endpoint.requestBody.example}</code>
                              </pre>
                            </div>
                          )}

                          <div>
                            <h5 className="font-medium mb-2">Responses</h5>
                            <div className="space-y-2">
                              {endpoint.responses.map((response, respIdx) => (
                                <div key={respIdx} className="p-3 border border-gray-200 rounded-lg">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Chip 
                                      size="sm" 
                                      color={response.status < 300 ? 'success' : response.status < 400 ? 'warning' : 'danger'}
                                    >
                                      {response.status}
                                    </Chip>
                                    <span className="text-sm font-medium">{response.description}</span>
                                  </div>
                                  {response.example && (
                                    <pre className="p-3 bg-gray-100 rounded-lg text-sm overflow-x-auto mt-2">
                                      <code>{response.example}</code>
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardBody>
              </Card>
            ))}
          </div>
        </Tab>

        <Tab key="keys" title={
          <div className="flex items-center gap-2">
            <KeyIcon className="h-4 w-4" />
            <span>API Keys</span>
          </div>
        }>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">API Key Management</h3>
                    <p className="text-sm text-gray-600">Create and manage API keys for authentication</p>
                  </div>
                  <Button 
                    color="primary" 
                    startContent={<PlusIcon className="h-4 w-4" />}
                    onPress={onOpen}
                  >
                    Create API Key
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {keys.map(k => (
                      <div key={k.key} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <KeyIcon className="h-4 w-4 text-gray-400" />
                              <code className="text-sm font-mono">
                                {visibleKeys.has(k.key) ? k.key : maskApiKey(k.key)}
                              </code>
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => toggleKeyVisibility(k.key)}
                              >
                                {visibleKeys.has(k.key) ? (
                                  <EyeSlashIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                onPress={() => copyToClipboard(k.key)}
                              >
                                <ClipboardDocumentIcon className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600">{k.description}</p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(k.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Chip size="sm" color="success" variant="flat">
                              <ShieldCheckIcon className="h-3 w-3 mr-1" />
                              Active
                            </Chip>
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              isIconOnly
                              onPress={() => deleteKey(k.key)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {keys.length === 0 && (
                      <div className="text-center py-12">
                        <KeyIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No API keys created yet</p>
                        <Button color="primary" onPress={onOpen}>
                          Create Your First API Key
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="testing" title={
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="h-4 w-4" />
            <span>API Testing</span>
          </div>
        }>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Interactive API Testing</h3>
              <p className="text-sm text-gray-600">Test API endpoints directly from the documentation</p>
            </CardHeader>
            <CardBody>
              <div className="text-center py-12">
                <CodeBracketIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Interactive API testing interface coming soon</p>
                <p className="text-sm text-gray-400">
                  Use the Swagger UI for now to test endpoints interactively
                </p>
                <Button 
                  color="primary" 
                  variant="flat"
                  className="mt-4"
                  onPress={() => window.open(`${apiUrl}/api-docs`, '_blank')}
                >
                  Open Swagger UI
                </Button>
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Create API Key Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div className="flex items-center gap-2">
                  <PlusIcon className="h-5 w-5" />
                  <span>Create New API Key</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <Textarea
                      placeholder="Describe what this API key will be used for..."
                      value={newKeyDescription}
                      onValueChange={setNewKeyDescription}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This helps you identify the key later and understand its purpose.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">Security Notice</p>
                        <p className="text-yellow-700">
                          Store your API key securely. It will only be shown once after creation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={createKey}>
                  Create API Key
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default APIDocumentationPage;
