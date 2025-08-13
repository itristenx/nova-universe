export default {
  testMatch: [
    '<rootDir>/scripts/test/**/*.test.js',
    '<rootDir>/scripts/test/**/*.test.mjs',
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/test/**/*.test.mjs',
    '<rootDir>/nova-api/test/**/*.test.js',
    '<rootDir>/nova-api/test/**/*.test.mjs',
    '<rootDir>/apps/api/test/**/*.test.js',
    '<rootDir>/apps/api/test/**/*.test.mjs',
    '<rootDir>/test/**/*.test.ts',
    '<rootDir>/test/**/*.test.tsx',
    '<rootDir>/apps/api/test/**/*.test.ts',
    '<rootDir>/apps/api/test/**/*.test.tsx'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/test/encryption.test.js',
    '<rootDir>/test/inventory-helix-integration.test.js',
    '<rootDir>/test/inventory-implementation.test.js',
    '<rootDir>/test/nova-synth-integration.test.js',
    '<rootDir>/test/universal-login-integration.test.js',
    '<rootDir>/test/websocket-pwa-integration.test.js',
    '<rootDir>/apps/pulse/nova-pulse/src/test/**/*'
  ],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-typescript'] }]
  },
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  injectGlobals: true
};
