import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { cn } from '@utils/index'
import toast from 'react-hot-toast'

// Custom icon components for React 19 compatibility
const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const CodeBracketIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
)

const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
)

const ClipboardDocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.375A2.25 2.25 0 014.125 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
)

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EyeSlashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
  permissions: string[]
}

interface OpenAPIParameter {
  name: string
  in: 'query' | 'path' | 'header' | 'cookie'
  required: boolean
  schema: {
    type: string
    format?: string
    enum?: string[]
    minimum?: number
    maximum?: number
    default?: any
  }
  description: string
}

interface OpenAPIResponse {
  description: string
  content?: {
    [mediaType: string]: {
      schema: any
      example?: any
    }
  }
}

interface OpenAPIEndpoint {
  operationId: string
  summary: string
  description: string
  tags: string[]
  parameters?: OpenAPIParameter[]
  requestBody?: {
    required: boolean
    content: {
      [mediaType: string]: {
        schema: any
        example?: any
      }
    }
  }
  responses: {
    [statusCode: string]: OpenAPIResponse
  }
  security?: Array<{ [scheme: string]: string[] }>
}

interface OpenAPIPath {
  [method: string]: OpenAPIEndpoint
}

interface OpenAPISpec {
  openapi: string
  info: {
    title: string
    description: string
    version: string
    contact?: {
      name: string
      email: string
      url: string
    }
    license?: {
      name: string
      url: string
    }
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: {
    [path: string]: OpenAPIPath
  }
  components: {
    schemas: {
      [name: string]: any
    }
    securitySchemes: {
      [name: string]: any
    }
  }
}

export default function APIDocumentationPage() {
  const [activeTab, setActiveTab] = useState<'documentation' | 'keys' | 'testing'>('documentation')
  const [isLoading, setIsLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')

  // OpenAPI 3.0 specification for Nova Universe API
  const openApiSpec: OpenAPISpec = {
    openapi: '3.0.3',
    info: {
      title: 'Nova Universe API',
      description: 'Comprehensive API for Nova Universe ITSM platform providing endpoints for user management, ticketing, assets, spaces, and more.',
      version: '1.0.0',
      contact: {
        name: 'Nova Universe API Support',
        email: 'api-support@nova-universe.com',
        url: 'https://docs.nova-universe.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `${window.location.origin}/api/v1`,
        description: 'Production server'
      },
      {
        url: 'https://staging-api.nova-universe.com/v1',
        description: 'Staging server'
      }
    ],
    paths: {
      '/auth/login': {
        post: {
          operationId: 'loginUser',
          summary: 'User authentication',
          description: 'Authenticate a user with email and password to receive an access token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 }
                  }
                },
                example: {
                  email: 'user@example.com',
                  password: 'password123'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Authentication successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: { type: 'string' },
                      user: { $ref: '#/components/schemas/User' },
                      expiresIn: { type: 'number' }
                    }
                  },
                  example: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    user: { id: 1, email: 'user@example.com', name: 'John Doe' },
                    expiresIn: 3600
                  }
                }
              }
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '400': {
              description: 'Bad request - missing required fields'
            }
          }
        }
      },
      '/users': {
        get: {
          operationId: 'getUsers',
          summary: 'List users',
          description: 'Retrieve a paginated list of users with optional filtering',
          tags: ['Users'],
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1 },
              description: 'Page number for pagination'
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
              description: 'Number of users per page'
            },
            {
              name: 'search',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Search term for filtering users by name or email'
            },
            {
              name: 'role',
              in: 'query',
              required: false,
              schema: { 
                type: 'string',
                enum: ['admin', 'agent', 'user']
              },
              description: 'Filter users by role'
            }
          ],
          responses: {
            '200': {
              description: 'List of users retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      users: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' }
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' }
                    }
                  }
                }
              }
            }
          },
          security: [{ bearerAuth: [] }]
        },
        post: {
          operationId: 'createUser',
          summary: 'Create user',
          description: 'Create a new user account',
          tags: ['Users'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUserRequest' }
              }
            }
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            },
            '400': {
              description: 'Validation error'
            },
            '409': {
              description: 'User already exists'
            }
          },
          security: [{ bearerAuth: [] }]
        }
      },
      '/tickets': {
        get: {
          operationId: 'getTickets',
          summary: 'List tickets',
          description: 'Retrieve tickets with filtering and pagination',
          tags: ['Tickets'],
          parameters: [
            {
              name: 'status',
              in: 'query',
              required: false,
              schema: {
                type: 'string',
                enum: ['open', 'in_progress', 'resolved', 'closed']
              },
              description: 'Filter by ticket status'
            },
            {
              name: 'priority',
              in: 'query',
              required: false,
              schema: {
                type: 'string',
                enum: ['low', 'medium', 'high', 'urgent']
              },
              description: 'Filter by priority level'
            },
            {
              name: 'assignee_id',
              in: 'query',
              required: false,
              schema: { type: 'integer' },
              description: 'Filter by assigned user ID'
            }
          ],
          responses: {
            '200': {
              description: 'List of tickets',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      tickets: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Ticket' }
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' }
                    }
                  }
                }
              }
            }
          },
          security: [{ bearerAuth: [] }]
        }
      }
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'agent', 'user'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateUserRequest: {
          type: 'object',
          required: ['email', 'name', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 8 },
            role: { type: 'string', enum: ['admin', 'agent', 'user'], default: 'user' }
          }
        },
        Ticket: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            assignee: { $ref: '#/components/schemas/User' },
            reporter: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'integer' }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API calls
      // Mock API keys
      setApiKeys([
        {
          id: '1',
          name: 'Production API Key',
          key: 'nvsk_1234567890abcdef1234567890abcdef',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastUsed: new Date(Date.now() - 3600000).toISOString(),
          permissions: ['read', 'write']
        },
        {
          id: '2',
          name: 'Development API Key',
          key: 'nvsk_abcdef1234567890abcdef1234567890',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          permissions: ['read']
        }
      ])
    } catch (error) {
      console.error('Failed to load API data:', error)
      toast.error('Failed to load API data')
    } finally {
      setIsLoading(false)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name')
      return
    }

    try {
      // TODO: Replace with actual API call
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `nvsk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString(),
        permissions: ['read']
      }
      setApiKeys([newKey, ...apiKeys])
      setNewKeyName('')
      setShowCreateModal(false)
      toast.success('API key created successfully')
    } catch (error) {
      console.error('Failed to create API key:', error)
      toast.error('Failed to create API key')
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return

    try {
      // TODO: Replace with actual API call
      setApiKeys(apiKeys.filter(key => key.id !== id))
      toast.success('API key deleted successfully')
    } catch (error) {
      console.error('Failed to delete API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(id)) {
      newVisible.delete(id)
    } else {
      newVisible.add(id)
    }
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      case 'POST': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'PUT': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'DELETE': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      case 'PATCH': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              API Documentation
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Explore API endpoints and manage API keys
            </p>
          </div>
        </div>
        
        <div className="card p-12 text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading API documentation...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            API Documentation
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Explore API endpoints, test requests, and manage API keys
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            <DocumentTextIcon className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4" />
            Create API Key
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'documentation', label: 'Documentation', icon: DocumentTextIcon },
              { id: 'keys', label: 'API Keys', icon: KeyIcon },
              { id: 'testing', label: 'Testing', icon: CodeBracketIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm",
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'documentation' && (
            <div className="space-y-8">
              {/* API Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-4">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {openApiSpec.info.title} v{openApiSpec.info.version}
                    </h2>
                    <p className="text-blue-700 dark:text-blue-300 mt-2">
                      {openApiSpec.info.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-blue-800 dark:text-blue-200">OpenAPI:</span>
                        <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-blue-900 dark:text-blue-100">
                          {openApiSpec.openapi}
                        </code>
                      </div>
                      {openApiSpec.info.license && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-800 dark:text-blue-200">License:</span>
                          <a 
                            href={openApiSpec.info.license.url}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {openApiSpec.info.license.name}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Servers */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Servers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openApiSpec.servers.map((server, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{server.description}</h4>
                          <code className="text-sm text-gray-600 dark:text-gray-400">{server.url}</code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(server.url)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy server URL"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endpoints grouped by tags */}
              {Object.entries(openApiSpec.paths).map(([path, pathItem]) => (
                <div key={path} className="space-y-4">
                  {Object.entries(pathItem).map(([method, operation]) => (
                    <div key={`${method}-${path}`} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase",
                            getMethodColor(method.toUpperCase())
                          )}>
                            {method.toUpperCase()}
                          </span>
                          <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {path}
                          </code>
                          {operation.tags && (
                            <div className="flex space-x-1">
                              {operation.tags.map((tag: string) => (
                                <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                          {operation.summary}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {operation.description}
                        </p>
                        {operation.operationId && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Operation ID: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{operation.operationId}</code>
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {/* Security Requirements */}
                        {operation.security && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Security
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {operation.security.map((secReq: any, idx: number) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                  <KeyIcon className="h-3 w-3 mr-1" />
                                  {Object.keys(secReq)[0]}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Parameters */}
                        {operation.parameters && operation.parameters.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Parameters
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                      Name
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                      In
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                      Type
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                      Required
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                      Description
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                  {operation.parameters.map((param: OpenAPIParameter) => (
                                    <tr key={param.name}>
                                      <td className="px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100">
                                        {param.name}
                                      </td>
                                      <td className="px-3 py-2 text-sm">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                          {param.in}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                        {param.schema.type}
                                        {param.schema.format && ` (${param.schema.format})`}
                                        {param.schema.enum && (
                                          <div className="mt-1">
                                            <span className="text-xs text-gray-500">enum: </span>
                                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                              {param.schema.enum.join(' | ')}
                                            </code>
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-sm">
                                        <span className={cn(
                                          "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                                          param.required 
                                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                        )}>
                                          {param.required ? 'Required' : 'Optional'}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                                        {param.description}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Request Body */}
                        {operation.requestBody && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                              Request Body {operation.requestBody.required && <span className="text-red-600">*</span>}
                            </h4>
                            {Object.entries(operation.requestBody.content).map(([mediaType, content]) => (
                              <div key={mediaType} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">Content-Type:</span>
                                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{mediaType}</code>
                                </div>
                                {content.example && (
                                  <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto">
                                    <code>{JSON.stringify(content.example, null, 2)}</code>
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Responses */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            Responses
                          </h4>
                          <div className="space-y-3">
                            {Object.entries(operation.responses).map(([statusCode, response]) => (
                              <div key={statusCode} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={cn(
                                    "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                                    parseInt(statusCode) >= 200 && parseInt(statusCode) < 300
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                      : parseInt(statusCode) >= 400
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  )}>
                                    {statusCode}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {response.description}
                                  </span>
                                </div>
                                {response.content && Object.entries(response.content).map(([mediaType, content]) => (
                                  <div key={mediaType} className="mt-2">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-xs text-gray-500">Content-Type:</span>
                                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">{mediaType}</code>
                                    </div>
                                    {content.example && (
                                      <pre className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                                        <code>{JSON.stringify(content.example, null, 2)}</code>
                                      </pre>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Schema Components */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Schema Components</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(openApiSpec.components.schemas).map(([schemaName, schema]) => (
                    <div key={schemaName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{schemaName}</h4>
                      <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                        <code>{JSON.stringify(schema, null, 2)}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {apiKeys.map((key) => (
                  <div key={key.id} className="card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {key.name}
                        </h3>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {visibleKeys.has(key.id) ? key.key : '••••••••••••••••••••••••••••••••'}
                            </code>
                            <button
                              onClick={() => toggleKeyVisibility(key.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              title="Toggle visibility"
                            >
                              {visibleKeys.has(key.id) ? (
                                <EyeSlashIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(key.key)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              title="Copy to clipboard"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                          {key.lastUsed && (
                            <span>Last used {new Date(key.lastUsed).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {key.permissions.map((permission) => (
                            <span key={permission} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteApiKey(key.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete API key"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="space-y-6">
              <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500">
                <div className="flex items-start space-x-3">
                  <CodeBracketIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-300">
                      API Testing Console
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      Test API endpoints directly from the browser. Interactive testing console powered by OpenAPI specification.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  OpenAPI Specification
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      OpenAPI JSON URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/api/v1/openapi.json`}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      />
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/api/v1/openapi.json`)}
                        className="btn btn-secondary"
                        title="Copy OpenAPI URL"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Swagger UI
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/api/docs`}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      />
                      <button
                        onClick={() => window.open(`${window.location.origin}/api/docs`, '_blank')}
                        className="btn btn-primary"
                      >
                        Open Swagger UI
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Interactive API documentation with built-in testing capabilities
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Base URL & Servers
                </h3>
                <div className="space-y-4">
                  {openApiSpec.servers.map((server, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{server.description}</h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(server.url)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Copy server URL"
                          >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <code className="text-sm text-gray-900 dark:text-gray-100">{server.url}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Authentication
                </h3>
                <div className="space-y-4">
                  {Object.entries(openApiSpec.components.securitySchemes).map(([schemeName, scheme]) => (
                    <div key={schemeName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{schemeName}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">{scheme.type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Scheme:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">{scheme.scheme}</span>
                        </div>
                        {scheme.bearerFormat && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Format:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{scheme.bearerFormat}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Example:</span>
                        <div className="mt-1 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <code className="text-sm text-gray-900 dark:text-gray-100">
                            Authorization: {scheme.scheme} YOUR_API_KEY
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  cURL Examples
                </h3>
                <div className="space-y-4">
                  {Object.entries(openApiSpec.paths).slice(0, 2).map(([path, pathItem]) => (
                    Object.entries(pathItem).map(([method, operation]) => (
                      <div key={`${method}-${path}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {operation.summary}
                        </h4>
                        <pre className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                          <code>{`curl -X ${method.toUpperCase()} '${openApiSpec.servers[0]?.url || window.location.origin + '/api/v1'}${path}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY'${
    operation.requestBody && operation.requestBody.content['application/json']?.example
      ? ` \\\n  -d '${JSON.stringify(operation.requestBody.content['application/json'].example)}'`
      : ''
  }`}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(`curl -X ${method.toUpperCase()} '${openApiSpec.servers[0]?.url || window.location.origin + '/api/v1'}${path}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY'${
    operation.requestBody && operation.requestBody.content['application/json']?.example
      ? ` \\\n  -d '${JSON.stringify(operation.requestBody.content['application/json'].example)}'`
      : ''
  }`)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Copy cURL command
                        </button>
                      </div>
                    ))
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Testing Tools
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <a
                    href="https://www.postman.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Postman</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Import OpenAPI spec and test endpoints with a GUI
                    </p>
                  </a>
                  <a
                    href="https://insomnia.rest/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Insomnia</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Modern REST client with OpenAPI support
                    </p>
                  </a>
                  <a
                    href="https://hoppscotch.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Hoppscotch</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Free, fast, and beautiful API request builder
                    </p>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Create API Key
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Key Name
                </label>
                <input
                  id="keyName"
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Enter a name for this API key"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                className="btn btn-primary"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
