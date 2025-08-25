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
    checkInterval: 5000, // 5 seconds
    maxRetries: 3,
    timeout: 5000,
    healthEndpoint: '/health',
  };

  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private checkInterval?: NodeJS.Timeout;
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
      } else {
        this.handleConnectionFailure();
      }
    } catch (_error) {
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
    return process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Subscribe to connection status changes
   */
  public subscribe(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(callback);

    // Immediately call with current status
    callback(this.status);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.status));
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
   * Get retry with exponential backoff
   */
  public getRetryDelay(): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, this.status.retryCount), maxDelay);
    return delay + Math.random() * 1000; // Add jitter
  }

  /**
   * Cleanup resources
   */
  public destroy() {
    this.stopMonitoring();
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.listeners.clear();
  }
}

// Export singleton instance
export const connectionService = new ConnectionService();
export default connectionService;
