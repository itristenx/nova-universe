'use client';

import { useEffect } from 'react';
import { PerformanceMonitor } from '../lib/performance';

export function _ClientInit() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      PerformanceMonitor.getInstance();
    }
  }, []);
  return null;
}