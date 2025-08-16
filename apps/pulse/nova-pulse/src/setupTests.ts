import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';
 

// Polyfill for TextEncoder/TextDecoder in Node.js environment
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Ensure React is available globally for testing
(global as any).React = React;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (global as any).jest?.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (global as any).jest?.fn(), // deprecated
    removeListener: (global as any).jest?.fn(), // deprecated
    addEventListener: (global as any).jest?.fn(),
    removeEventListener: (global as any).jest?.fn(),
    dispatchEvent: (global as any).jest?.fn(),
  })),
});

// Mock HTMLCanvasElement.getContext to prevent test errors
HTMLCanvasElement.prototype.getContext = (global as any).jest?.fn() as any;

// Mock fetch for API calls
(global as any).fetch = ((global as any).jest?.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
)) as any;

// Mock localStorage
const localStorageMock = {
  getItem: (global as any).jest?.fn(),
  setItem: (global as any).jest?.fn(),
  removeItem: (global as any).jest?.fn(),
  clear: (global as any).jest?.fn(),
};
(global as any).localStorage = localStorageMock;
