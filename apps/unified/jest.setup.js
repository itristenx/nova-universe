import '@testing-library/jest-dom';

// Set up test environment variables
process.env.VITE_USE_MOCK_DATA = 'false';
process.env.NODE_ENV = 'test';

// Mock import.meta for Vite compatibility
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: false,
        PROD: true,
        MODE: 'test',
        VITE_USE_MOCK_DATA: 'false',
      },
    },
  },
});

// Mock network requests early to prevent HTTP calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock XMLHttpRequest to prevent network calls
const mockXHR = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: '',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
global.XMLHttpRequest = jest.fn(() => mockXHR);

// Mock http module early
jest.mock('http', () => ({
  createServer: jest.fn(),
  request: jest.fn(),
  get: jest.fn(),
}));

jest.mock('https', () => ({
  createServer: jest.fn(),
  request: jest.fn(),
  get: jest.fn(),
}));

// Mock canvas for tests
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
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
}));

global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => '');

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost',
  origin: 'http://localhost',
  pathname: '/',
  search: '',
  hash: '',
  hostname: 'localhost',
  port: '',
  protocol: 'http:',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock crypto
Object.defineProperty(global.self, 'crypto', {
  value: {
    randomUUID: () => '00000000-0000-0000-0000-000000000000',
    subtle: {
      digest: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
    },
  },
});

// Suppress console warnings in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
beforeEach(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Mock i18next and related modules
jest.mock('i18next', () => ({
  __esModule: true,
  default: {
    use: jest.fn().mockReturnThis(),
    init: jest.fn().mockReturnThis(),
    isInitialized: true,
    language: 'en',
    changeLanguage: jest.fn(),
    getResourceBundle: jest.fn(() => ({})),
    hasResourceBundle: jest.fn(() => true),
    t: jest.fn((key) => key),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

jest.mock('i18next-browser-languagedetector', () => ({
  __esModule: true,
  default: {
    type: 'languageDetector',
    init: jest.fn(),
    detect: jest.fn(() => 'en'),
    cacheUserLanguage: jest.fn(),
  },
}));

jest.mock('i18next-http-backend', () => ({
  __esModule: true,
  default: {
    type: 'backend',
    init: jest.fn(),
    read: jest.fn((language, namespace, callback) => {
      callback(null, {});
    }),
  },
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});