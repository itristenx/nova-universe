/**
 * Nova Universe Connection Service
 * Manages API connectivity, offline detection, and connection status
 */

export interface ConnectionStatus {
  isOnline: boolean;
  isAPIConnected: boolean;
  lastCheck: Date;
  retryCount: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
  latency?: number;
}

export interface ConnectionOptions {
  checkInterval: number;
  maxRetries: number;
  timeout: number;
  healthEndpoint: string;
  retryInterval: number;
  maxRetryInterval: number;
  maxJitter?: number;
  maxBackoffExponent?: number;
}

class ConnectionService {
  private status: ConnectionStatus = {
    isOnline: navigator.onLine,
    isAPIConnected: false,
    lastCheck: new Date(),
    retryCount: 0,
    quality: 'offline',
  };

  private options: ConnectionOptions = {
    checkInterval: 5000, // 5 seconds for normal monitoring
    maxRetries: 3,
    timeout: 5000,
    healthEndpoint: '/api/health',
    retryInterval: 1000, // 1 second for retry attempts during failures
    maxRetryInterval: 10000, // Max 10 seconds between retries
    maxJitter: 1000, // Max 1 second of jitter to prevent thundering herd
    maxBackoffExponent: 6, // Cap exponential backoff at 2^6 = 64x multiplier
  };

  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private checkInterval?: NodeJS.Timeout;
  private retryTimeout?: NodeJS.Timeout;
  private isChecking = false;

  constructor() {
    this.setupEventListeners();
    this.startMonitoring();
  }

  /**
   * Set up browser online/offline event listeners
   */
  private setupEventListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Listen for visibility changes to check connection when user returns
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Handle browser coming online
   */
  private handleOnline() {
    this.status.isOnline = true;
    this.checkAPIConnection();
    this.notifyListeners();
  }

  /**
   * Handle browser going offline
   */
  private handleOffline() {
    this.status.isOnline = false;
    this.status.isAPIConnected = false;
    this.status.quality = 'offline';
    this.status.retryCount = 0;
    this.clearRetryTimeout(); // Clear any pending retries when offline
    this.notifyListeners();
  }

  /**
   * Handle visibility change (user switching tabs/apps)
   */
  private handleVisibilityChange() {
    if (!document.hidden && this.status.isOnline) {
      this.checkAPIConnection();
    }
  }

  /**
   * Start continuous connection monitoring
   */
  public startMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      if (this.status.isOnline && !this.isChecking) {
        this.checkAPIConnection();
      }
    }, this.options.checkInterval);

    // Initial check
    this.checkAPIConnection();
  }

  /**
   * Stop connection monitoring
   */
  public stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
    this.clearRetryTimeout();
  }

  /**
   * Start retry timeout for aggressive retries during failures
   */
  private startRetryTimeout() {
    this.clearRetryTimeout();
    
    // Calculate retry delay with exponential backoff, capped at maxRetryInterval
    const baseDelay = this.options.retryInterval;
    const maxBackoffExponent = this.options.maxBackoffExponent ?? 6;
    const maxJitter = this.options.maxJitter ?? 1000;
    
    const backoffDelay = Math.min(
      baseDelay * Math.pow(2, Math.min(Math.max(this.status.retryCount - 1, 0), maxBackoffExponent)), // Ensure first retry uses full base delay and cap exponent
      this.options.maxRetryInterval
    );
    
    // Add some jitter to avoid thundering herd
    const jitter = Math.random() * maxJitter;
    const delay = backoffDelay + jitter;
    
    this.retryTimeout = setTimeout(() => {
      if (!this.status.isAPIConnected && this.status.isOnline) {
        this.checkAPIConnection();
      }
    }, delay);
  }

  /**
   * Clear retry timeout
   */
  private clearRetryTimeout() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = undefined;
    }
  }

  /**
   * Check API connection status with latency measurement
   */
  public async checkAPIConnection(): Promise<ConnectionStatus> {
    if (this.isChecking) {
      return this.status;
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

      const response = await fetch(`${this.getAPIBaseURL()}${this.options.healthEndpoint}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (response.ok) {
        this.status.isAPIConnected = true;
        this.status.retryCount = 0;
        this.status.latency = latency;
        this.status.quality = this.getConnectionQuality(latency);
        this.clearRetryTimeout(); // Clear any pending retries
      } else {
        this.handleConnectionFailure();
      }
    } catch (_error) {
      console.warn('Connection check failed:', _error.message || _error);
      this.handleConnectionFailure();
    } finally {
      this.status.lastCheck = new Date();
      this.isChecking = false;
      this.notifyListeners();
    }

    return this.status;
  }

  /**
   * Handle connection failure
   */
  private handleConnectionFailure() {
    this.status.isAPIConnected = false;
    this.status.retryCount++;
    this.status.quality = 'offline';
    this.status.latency = undefined;
    
    // Start retry timeout for more aggressive retries
    if (this.status.isOnline) {
      this.startRetryTimeout();
    }
  }

  /**
   * Determine connection quality based on latency
   */
  private getConnectionQuality(latency: number): 'excellent' | 'good' | 'poor' | 'offline' {
    if (latency < 100) return 'excellent';
    if (latency < 500) return 'good';
    if (latency < 2000) return 'poor';
    return 'offline';
  }

  /**
   * Get API base URL
   */
  private getAPIBaseURL(): string {
    // Always check for explicit API URL configuration first
    const configuredApiUrl = import.meta.env.VITE_API_URL;
    
    if (configuredApiUrl) {
      console.log('🔍 Connection Service: Using configured VITE_API_URL:', configuredApiUrl);
      return configuredApiUrl;
    }
    
    // In browser environment, use relative URLs to take advantage of Vite proxy
    // This is only used when VITE_API_URL is not explicitly configured
    if (typeof window !== 'undefined') {
      console.log('🔍 Connection Service: Using proxy via current origin (no VITE_API_URL configured)');
      return window.location.origin;
    }
    
    // Fallback for server-side rendering or non-browser environments
    const fallbackUrl = 'http://localhost:3000';
    console.log('🔍 Connection Service: Using fallback URL:', fallbackUrl);
    return fallbackUrl;
  }

  /**
   * Subscribe to connection status changes
   */
  public subscribe(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(callback);

    // Immediately call with current status (create a copy)
    callback({ ...this.status });

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners() {
    // Create a new object to ensure React detects the change
    const statusCopy = { ...this.status };
    this.listeners.forEach((callback) => callback(statusCopy));
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  /**
   * Force a connection check
   */
  public async forceCheck(): Promise<ConnectionStatus> {
    return this.checkAPIConnection();
  }

  /**
   * Update connection options
   */
  public updateOptions(options: Partial<ConnectionOptions>) {
    this.options = { ...this.options, ...options };

    // Restart monitoring with new options
    this.stopMonitoring();
    this.startMonitoring();
  }

  /**
   * Get retry delay with exponential backoff and jitter
   */
  public getRetryDelay(): number {
    const baseDelay = this.options.retryInterval;
    const maxBackoffExponent = this.options.maxBackoffExponent ?? 6;
    const maxJitter = this.options.maxJitter ?? 1000;
    
    const backoffDelay = Math.min(
      baseDelay * Math.pow(2, Math.min(Math.max(this.status.retryCount - 1, 0), maxBackoffExponent)),
      this.options.maxRetryInterval
    );
    
    return backoffDelay + Math.random() * maxJitter;
  }

  /**
   * Cleanup resources
   */
  public destroy() {
    this.stopMonitoring();
    this.clearRetryTimeout();
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.listeners.clear();
  }
}

// Export singleton instance
export const connectionService = new ConnectionService();
export default connectionService;
