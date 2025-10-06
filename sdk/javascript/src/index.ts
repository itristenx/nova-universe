/**
 * Nova Universe JavaScript/TypeScript SDK
 * Official client library for the Nova Universe Platform API V1
 * 
 * @packageDocumentation
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// ========================================
// Types & Interfaces
// ========================================

export interface NovaClientConfig {
  baseUrl?: string;
  apiKey?: string;
  apiVersion?: string;
  timeout?: number;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string;
  requester_email?: string;
  assigned_to?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  serial_number?: string;
  location?: string;
  assigned_to?: string;
  status?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TicketListParams extends PaginationParams {
  status?: string;
  priority?: string;
  search?: string;
}

// ========================================
// Custom Errors
// ========================================

export class NovaUniverseError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NovaUniverseError';
  }
}

export class AuthenticationError extends NovaUniverseError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends NovaUniverseError {
  constructor(message: string = 'Validation failed') {
    super(message, 422);
    this.name = 'ValidationError';
  }
}

export class ResourceNotFoundError extends NovaUniverseError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'ResourceNotFoundError';
  }
}

export class RateLimitError extends NovaUniverseError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

// ========================================
// API Resources
// ========================================

class APIResource {
  constructor(protected client: NovaClient) {}

  protected async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<T> {
    return this.client.request<T>(method, endpoint, data, params);
  }
}

export class TicketsResource extends APIResource {
  /**
   * List tickets with optional filters
   */
  async list(params?: TicketListParams): Promise<Ticket[]> {
    return this.request<Ticket[]>('GET', '/tickets', undefined, params);
  }

  /**
   * Get ticket by ID
   */
  async get(ticketId: number): Promise<Ticket> {
    return this.request<Ticket>('GET', `/tickets/${ticketId}`);
  }

  /**
   * Create a new ticket
   */
  async create(data: Partial<Ticket>): Promise<Ticket> {
    if (!data.title || !data.description) {
      throw new ValidationError('Title and description are required');
    }
    return this.request<Ticket>('POST', '/tickets', data);
  }

  /**
   * Update ticket
   */
  async update(ticketId: number, data: Partial<Ticket>): Promise<Ticket> {
    return this.request<Ticket>('PATCH', `/tickets/${ticketId}`, data);
  }

  /**
   * Delete ticket
   */
  async delete(ticketId: number): Promise<void> {
    return this.request<void>('DELETE', `/tickets/${ticketId}`);
  }

  /**
   * Add comment to ticket
   */
  async addComment(
    ticketId: number,
    content: string,
    isPublic: boolean = false
  ): Promise<any> {
    return this.request('POST', `/tickets/${ticketId}/comments`, {
      content,
      is_public: isPublic,
    });
  }
}

export class AssetsResource extends APIResource {
  /**
   * List assets
   */
  async list(params?: PaginationParams): Promise<Asset[]> {
    return this.request<Asset[]>('GET', '/assets', undefined, params);
  }

  /**
   * Get asset by ID
   */
  async get(assetId: number): Promise<Asset> {
    return this.request<Asset>('GET', `/assets/${assetId}`);
  }

  /**
   * Create new asset
   */
  async create(data: Partial<Asset>): Promise<Asset> {
    return this.request<Asset>('POST', '/assets', data);
  }

  /**
   * Update asset
   */
  async update(assetId: number, data: Partial<Asset>): Promise<Asset> {
    return this.request<Asset>('PATCH', `/assets/${assetId}`, data);
  }
}

export class UsersResource extends APIResource {
  /**
   * List directory users
   */
  async list(params?: PaginationParams): Promise<User[]> {
    return this.request<User[]>('GET', '/directory', undefined, params);
  }

  /**
   * Get user by ID
   */
  async get(userId: number): Promise<User> {
    return this.request<User>('GET', `/directory/${userId}`);
  }

  /**
   * Trigger directory sync
   */
  async sync(): Promise<any> {
    return this.request('POST', '/directory/sync');
  }
}

export class MonitoringResource extends APIResource {
  /**
   * Get monitoring dashboard
   */
  async dashboard(): Promise<any> {
    return this.request('GET', '/monitoring');
  }

  /**
   * Get system health
   */
  async health(): Promise<any> {
    return this.request('GET', '/monitoring/health');
  }

  /**
   * List alerts
   */
  async alerts(status?: string): Promise<any[]> {
    const params = status ? { status } : undefined;
    return this.request<any[]>('GET', '/alerts', undefined, params);
  }

  /**
   * Create alert
   */
  async createAlert(data: any): Promise<any> {
    return this.request('POST', '/alerts', data);
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: number): Promise<any> {
    return this.request('PATCH', `/alerts/${alertId}`, {
      status: 'acknowledged',
    });
  }
}

export class WorkflowsResource extends APIResource {
  /**
   * List workflows
   */
  async list(): Promise<any[]> {
    return this.request<any[]>('GET', '/workflows');
  }

  /**
   * Get workflow by ID
   */
  async get(workflowId: number): Promise<any> {
    return this.request('GET', `/workflows/${workflowId}`);
  }

  /**
   * Create workflow
   */
  async create(data: any): Promise<any> {
    return this.request('POST', '/workflows', data);
  }
}

export class AnalyticsResource extends APIResource {
  /**
   * Get analytics dashboard
   */
  async dashboard(): Promise<any> {
    return this.request('GET', '/analytics');
  }

  /**
   * Get ticket metrics
   */
  async tickets(period: string = '7d'): Promise<any> {
    return this.request('GET', '/analytics/tickets', undefined, { period });
  }
}

// ========================================
// Main Client
// ========================================

export class NovaClient {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  // Resource endpoints
  public readonly tickets: TicketsResource;
  public readonly assets: AssetsResource;
  public readonly users: UsersResource;
  public readonly monitoring: MonitoringResource;
  public readonly workflows: WorkflowsResource;
  public readonly analytics: AnalyticsResource;

  constructor(config: NovaClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.apiVersion = config.apiVersion || 'v1';

    this.axiosInstance = axios.create({
      baseURL: `${this.baseUrl}/api/${this.apiVersion}`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'nova-universe-js-sdk/1.0.0',
      },
    });

    // Set API key if provided
    if (config.apiKey) {
      this.authToken = config.apiKey;
    }

    // Add request interceptor for auth token
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;

          switch (status) {
            case 401:
              throw new AuthenticationError(data.message || 'Authentication failed');
            case 404:
              throw new ResourceNotFoundError(data.message || 'Resource not found');
            case 422:
              throw new ValidationError(data.message || 'Validation failed');
            case 429:
              throw new RateLimitError(data.message || 'Rate limit exceeded');
            default:
              throw new NovaUniverseError(
                data.message || 'API request failed',
                status
              );
          }
        } else if (error.request) {
          throw new NovaUniverseError('No response from server');
        } else {
          throw new NovaUniverseError(error.message);
        }
      }
    );

    // Initialize resources
    this.tickets = new TicketsResource(this);
    this.assets = new AssetsResource(this);
    this.users = new UsersResource(this);
    this.monitoring = new MonitoringResource(this);
    this.workflows = new WorkflowsResource(this);
    this.analytics = new AnalyticsResource(this);
  }

  /**
   * Authenticate with username and password
   */
  async authenticate(username: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      'POST',
      '/auth/login',
      { username, password },
      undefined,
      true // skip auth
    );

    if (response.token) {
      this.authToken = response.token;
    }

    return response;
  }

  /**
   * Internal request method
   */
  async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: any,
    skipAuth: boolean = false
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      params,
    };

    if (skipAuth) {
      delete config.headers?.Authorization;
    }

    const response: AxiosResponse<T> = await this.axiosInstance.request(config);
    return response.data;
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Set auth token manually
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear auth token
   */
  clearAuth(): void {
    this.authToken = null;
  }
}

// ========================================
// Convenience Functions
// ========================================

/**
 * Create a new Nova Universe client
 */
export function createClient(config?: NovaClientConfig): NovaClient {
  return new NovaClient(config);
}

/**
 * Create and authenticate a client
 */
export async function createAuthenticatedClient(
  username: string,
  password: string,
  config?: NovaClientConfig
): Promise<NovaClient> {
  const client = new NovaClient(config);
  await client.authenticate(username, password);
  return client;
}

// Default export
export default NovaClient;
