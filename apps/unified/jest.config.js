export default {
  displayName: 'unified-ui',
  preset: undefined,
  testEnvironment: '@happy-dom/jest-environment',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@packages/(.*)$': '<rootDir>/../../packages/$1',
    '^@test/(.*)$': '<rootDir>/../../test/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@utils/index$': '<rootDir>/src/utils/index.ts',
    '^canvas$': '<rootDir>/../../test/setup/canvas-mock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      'jest-transform-stub',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
    '^.+\\.(js|mjs)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'ecmascript',
          },
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'ts', 'tsx', 'json'],
  testMatch: [
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)',
    '!<rootDir>/tests/**/*',
    '!<rootDir>/**/*.e2e.*',
    '!<rootDir>/**/*.spec.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  maxWorkers: 1,
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@heroui|framer-motion|react-spring))',
  ],
};