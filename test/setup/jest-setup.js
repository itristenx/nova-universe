require('@testing-library/jest-dom');

// Mock canvas to avoid binary dependency issues
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: [] })),
      putImageData: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      fillText: jest.fn(),
      strokeText: jest.fn(),
    })),
    toBuffer: jest.fn(),
    toDataURL: jest.fn(),
    width: 0,
    height: 0,
  })),
  loadImage: jest.fn(),
  registerFont: jest.fn(),
}));

// Global test configuration for React component testing
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }], this);
  }
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock HTMLElement.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock window.getComputedStyle
global.getComputedStyle = jest.fn((element) => ({
  getPropertyValue: jest.fn((prop) => {
    // Return sensible defaults for CSS properties
    const defaults = {
      'visibility': 'visible',
      'display': 'block',
      'opacity': '1',
      'position': 'static',
      'overflow': 'visible',
      'clip': 'auto',
      'clip-path': 'none',
      'width': '100px',
      'height': '100px',
      'pointer-events': 'auto',
      'transform': 'none',
      'transition': 'none',
    };
    return defaults[prop] || '';
  }),
  // Add other computed style properties as needed
  visibility: 'visible',
  display: 'block',
  opacity: '1',
  position: 'static',
  overflow: 'visible',
  clip: 'auto',
  clipPath: 'none',
  width: '100px',
  height: '100px',
  pointerEvents: 'auto',
  transform: 'none',
  transition: 'none',
}));
