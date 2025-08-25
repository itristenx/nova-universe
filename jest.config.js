export default {
  // Use projects to support both Node.js and React component testing
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/test/**/*.(test|spec).(js|ts)',
        '!<rootDir>/test/components/**/*',
        '!<rootDir>/test/**/*.tsx',
      ],
      setupFilesAfterEnv: ['<rootDir>/test/test-cleanup.js'],
      transform: {},
      extensionsToTreatAsEsm: ['.ts'],
      globals: {
        'ts-jest': {
          useESM: true,
        },
      },
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      moduleFileExtensions: ['js', 'mjs', 'cjs', 'ts', 'json'],
      clearMocks: true,
      resetMocks: true,
      restoreMocks: true,
      detectOpenHandles: true,
      testTimeout: 60000,
      maxWorkers: 1,
    },
    {
      displayName: 'react',
      testEnvironment: '@happy-dom/jest-environment',
      testMatch: [
        '<rootDir>/test/components/**/*.(test|spec).(ts|tsx)',
        '<rootDir>/test/**/*.(test|spec).tsx',
      ],
      setupFilesAfterEnv: ['<rootDir>/test/setup/jest-setup.js', '<rootDir>/test/test-cleanup.js'],
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
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@packages/(.*)$': '<rootDir>/packages/$1',
        '^@test/(.*)$': '<rootDir>/test/$1',
        '^canvas$': '<rootDir>/test/setup/canvas-mock.js',
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      moduleFileExtensions: ['js', 'mjs', 'cjs', 'ts', 'tsx', 'json'],
      clearMocks: true,
      resetMocks: true,
      restoreMocks: true,
      testTimeout: 30000,
      maxWorkers: 1,
    },
  ],
  // Global configuration
  verbose: false,
  bail: false,
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
