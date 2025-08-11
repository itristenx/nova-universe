'use client';

import { useEffect } from 'react';
import { PerformanceMonitor } from '../lib/performance';

export function ClientInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      PerformanceMonitor.getInstance();
    }
  }, []);
  return null;
}