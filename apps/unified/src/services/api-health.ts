/**
 * API Health Check and Connectivity Monitoring Service
 * 
 * Industry-standard health monitoring for API connections
 * with automatic reconnection and circuit breaker patterns.
 */

import { ApiError, apiClient } from './api';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  responseTime: number;
  services: {
    [key: string]: {
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      error?: string;
    };
  };
}

interface ConnectivityState {
  isOnline: boolean;
  isConnected: boolean;
  lastConnected: string | null;
  consecutiveFailures: number;
  circuitState: 'closed' | 'open' | 'half-open';
}

class APIHealthMonitor {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private connectivityState: ConnectivityState = {
    isOnline: navigator.onLine,
    isConnected: false,
    lastConnected: null,
    consecutiveFailures: 0,
    circuitState: 'closed',
  };
  
  private listeners: Set<(state: ConnectivityState) => void> = new Set();
  private healthEndpoint = '/api/health';
  private checkInterval = 30000; // 30 seconds
  private circuitBreakerThreshold = 5; // failures before opening circuit
  private circuitBreakerTimeout = 60000; // 1 minute before trying half-open

  constructor() {
    this.initializeNetworkListeners();
    this.startHealthMonitoring();
  }

  private initializeNetworkListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.updateConnectivityState({ isOnline: true });
      this.checkAPIHealth();
    });

    window.addEventListener('offline', () => {
      this.updateConnectivityState({ 
        isOnline: false, 
        isConnected: false,
        consecutiveFailures: this.connectivityState.consecutiveFailures + 1
      });
    });

    // Initial health check
    this.checkAPIHealth();
  }

  private startHealthMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      if (this.connectivityState.isOnline) {
        this.checkAPIHealth();
      }
    }, this.checkInterval);
  }

  private async checkAPIHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // If circuit is open, check if we should try half-open
      if (this.connectivityState.circuitState === 'open') {
        if (Date.now() - new Date(this.connectivityState.lastConnected || 0).getTime() < this.circuitBreakerTimeout) {
          throw new Error('Circuit breaker is open');
        }
        this.updateConnectivityState({ circuitState: 'half-open' });
      }

      const response = await apiClient.get<HealthCheckResult>(this.healthEndpoint);
      const responseTime = Date.now() - startTime;

      const healthResult: HealthCheckResult = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime,
        services: response.data?.services || {},
      };

      // API is healthy
      this.updateConnectivityState({
        isConnected: true,
        lastConnected: new Date().toISOString(),
        consecutiveFailures: 0,
        circuitState: 'closed',
      });

      this.notifyListeners();
      return healthResult;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const newFailureCount = this.connectivityState.consecutiveFailures + 1;
      
      // Determine circuit breaker state
      let circuitState = this.connectivityState.circuitState;
      if (newFailureCount >= this.circuitBreakerThreshold) {
        circuitState = 'open';
      }

      this.updateConnectivityState({
        isConnected: false,
        consecutiveFailures: newFailureCount,
        circuitState,
      });

      this.notifyListeners();

      const healthResult: HealthCheckResult = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        services: {},
      };

      if (process.env.NODE_ENV === 'development') {
        console.warn('API health check failed:', error);
      }

      return healthResult;
    }
  }

  private updateConnectivityState(updates: Partial<ConnectivityState>) {
    this.connectivityState = { ...this.connectivityState, ...updates };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.connectivityState);
      } catch (error) {
        console.error('Error in connectivity listener:', error);
      }
    });
  }

  // Public API
  public getConnectivityState(): ConnectivityState {
    return { ...this.connectivityState };
  }

  public addConnectivityListener(listener: (state: ConnectivityState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async forceHealthCheck(): Promise<HealthCheckResult> {
    return this.checkAPIHealth();
  }

  public isAPIAvailable(): boolean {
    return this.connectivityState.isOnline && 
           this.connectivityState.isConnected && 
           this.connectivityState.circuitState !== 'open';
  }

  public shouldRetryRequest(): boolean {
    return this.connectivityState.circuitState !== 'open';
  }

  public destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const apiHealthMonitor = new APIHealthMonitor();

// React hook for component usage
import { useState, useEffect } from 'react';

export function useAPIConnectivity() {
  const [connectivityState, setConnectivityState] = useState<ConnectivityState>(
    apiHealthMonitor.getConnectivityState()
  );

  useEffect(() => {
    const unsubscribe = apiHealthMonitor.addConnectivityListener(setConnectivityState);
    return unsubscribe;
  }, []);

  return {
    ...connectivityState,
    forceCheck: () => apiHealthMonitor.forceHealthCheck(),
    isAPIAvailable: apiHealthMonitor.isAPIAvailable(),
  };
}

// Network status component
export function NetworkStatusIndicator() {
  const connectivity = useAPIConnectivity();

  if (connectivity.isConnected) {
    return null; // Don't show anything when connected
  }

  const getStatusInfo = () => {
    if (!connectivity.isOnline) {
      return {
        className: 'network-status--offline',
        message: 'No internet connection',
        icon: '🔴'
      };
    }
    
    if (connectivity.circuitState === 'open') {
      return {
        className: 'network-status--offline',
        message: 'API temporarily unavailable',
        icon: '⚠️'
      };
    }
    
    return {
      className: 'network-status--reconnecting',
      message: 'Reconnecting...',
      icon: '🔄'
    };
  };

  const status = getStatusInfo();

  return {
    className: status.className,
    icon: status.icon,
    message: status.message
  };
}

// Offline-aware API wrapper
export function createOfflineAwareAPICall<T>(
  apiCall: () => Promise<T>,
  fallbackData?: T
) {
  return async (): Promise<T> => {
    if (!apiHealthMonitor.isAPIAvailable()) {
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw new ApiError(
        'API is currently unavailable',
        undefined,
        'API_UNAVAILABLE',
        {
          userMessage: 'The service is temporarily unavailable. Please try again later.',
          isRetryable: true,
        }
      );
    }

    return apiCall();
  };
}