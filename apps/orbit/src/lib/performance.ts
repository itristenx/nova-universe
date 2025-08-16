'use client';

import React from 'react';

// Type definitions for performance APIs
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Core Web Vitals monitoring
    this.observeCoreWebVitals();
    
    // Resource loading monitoring
    this.observeResourceTiming();
    
    // Navigation timing
    this.observeNavigationTiming();
  }

  private observeCoreWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.set('LCP', lastEntry.startTime);
        this.reportMetric('LCP', lastEntry.startTime);
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch {
        console.warn('LCP observer not supported');
      }

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            const firstInputEntry = entry as PerformanceEventTiming;
            const fid = firstInputEntry.processingStart - firstInputEntry.startTime;
            this.metrics.set('FID', fid);
            this.reportMetric('FID', fid);
          }
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch {
        console.warn('FID observer not supported');
      }

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as LayoutShift;
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
            this.metrics.set('CLS', clsValue);
          }
        }
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch {
        console.warn('CLS observer not supported');
      }
    }
  }

  private observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            this.analyzeResourceTiming(resource);
          }
        }
      });

      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch {
        console.warn('Resource timing observer not supported');
      }
    }
  }

  private observeNavigationTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            const ttfb = navigation.responseStart - navigation.fetchStart;
            const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
            const loadComplete = navigation.loadEventEnd - navigation.fetchStart;

            this.metrics.set('TTFB', ttfb);
            this.metrics.set('DOMContentLoaded', domContentLoaded);
            this.metrics.set('LoadComplete', loadComplete);

            this.reportMetric('TTFB', ttfb);
            this.reportMetric('DOMContentLoaded', domContentLoaded);
            this.reportMetric('LoadComplete', loadComplete);
          }
        }, 0);
      });
    }
  }

  private analyzeResourceTiming(resource: PerformanceResourceTiming) {
    const loadTime = resource.responseEnd - resource.startTime;
    const resourceType = this.getResourceType(resource.name);
    
    // Track slow resources
    if (loadTime > 1000) { // Slower than 1 second
      this.reportSlowResource(resource.name, loadTime, resourceType);
    }

    // Track large resources
    if (resource.transferSize > 500 * 1024) { // Larger than 500KB
      this.reportLargeResource(resource.name, resource.transferSize, resourceType);
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.webp') || url.includes('.svg')) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  private reportMetric(name: string, value: number) {
    // In a real application, you would send this to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric - ${name}: ${value.toFixed(2)}ms`);
    }

    // Store in localStorage for debugging
    try {
      const stored = localStorage.getItem('performance-metrics') || '{}';
      const metrics = JSON.parse(stored);
      metrics[name] = value;
      localStorage.setItem('performance-metrics', JSON.stringify(metrics));
    } catch {
      // Ignore localStorage errors
    }
  }

  private reportSlowResource(url: string, loadTime: number, type: string) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Slow ${type} resource: ${url} (${loadTime.toFixed(2)}ms)`);
    }
  }

  private reportLargeResource(url: string, size: number, type: string) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Large ${type} resource: ${url} (${(size / 1024).toFixed(2)}KB)`);
    }
  }

  // Public methods
  public startTiming(label: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${label}-start`);
    }
  }

  public endTiming(label: string): number | null {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${label}-end`);
      
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label, 'measure')[0];
        this.reportMetric(label, measure.duration);
        return measure.duration;
      } catch (e) {
        console.warn(`Failed to measure ${label}:`, e);
        return null;
      }
    }
    return null;
  }

  public getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  public clearMetrics(): void {
    this.metrics.clear();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('performance-metrics');
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  public dispose(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Hook for React components
export function _usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  return {
    startTiming: (label: string) => monitor.startTiming(label),
    endTiming: (label: string) => monitor.endTiming(label),
    getMetrics: () => monitor.getMetrics(),
    clearMetrics: () => monitor.clearMetrics(),
  };
}

// Image optimization utilities
export function _getOptimizedImageProps(src: string, alt: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
} = {}) {
  const {
    width = 800,
    height = 600,
    quality = 85,
    priority = false
  } = options;

  return {
    src,
    alt,
    width,
    height,
    quality,
    priority,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
    sizes: `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`,
  };
}

// Lazy loading utilities
export function _createLazyComponent<T>(importFn: () => Promise<{ default: React.ComponentType<T> }>) {
  return React.lazy(importFn);
}

// Bundle size tracking
export function _trackBundleSize() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const navigation = navigationEntries[0] as PerformanceNavigationTiming;
      const transferSize = navigation.transferSize;
      const encodedSize = navigation.encodedBodySize;
      const decodedSize = navigation.decodedBodySize;

      console.log('Bundle Size Metrics:', {
        transferSize: `${(transferSize / 1024).toFixed(2)}KB`,
        encodedSize: `${(encodedSize / 1024).toFixed(2)}KB`,
        decodedSize: `${(decodedSize / 1024).toFixed(2)}KB`,
        compressionRatio: `${((1 - encodedSize / decodedSize) * 100).toFixed(1)}%`
      });
    }
  }
}
