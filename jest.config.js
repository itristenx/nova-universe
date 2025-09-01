export default {
  // Use projects to support both Node.js and React component testing
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/test/**/*.(test|spec).(js|ts)',
        '<rootDir>/apps/api/test/**/*.(test|spec).(js|ts)',
        '!<rootDir>/test/components/**/*',
        '!<rootDir>/test/**/*.tsx',
      ],
      setupFilesAfterEnv: [],
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
      preset: undefined,
      transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
      collectCoverageFrom: [
        'apps/api/**/*.{js,ts}',
        '!apps/api/**/*.d.ts',
        '!apps/api/**/node_modules/**',
        '!apps/api/test/**',
        '!apps/api/**/*.test.*',
        '!apps/api/**/*.spec.*',
      ],
      coverageThreshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    {
      displayName: 'react',
      testEnvironment: '@happy-dom/jest-environment',
      testMatch: [
        '<rootDir>/test/components/**/*.(test|spec).(ts|tsx)',
        '<rootDir>/test/**/*.(test|spec).tsx',
        '<rootDir>/apps/unified/src/**/*.(test|spec).(ts|tsx)',
      ],
      setupFilesAfterEnv: ['<rootDir>/test/setup/jest-setup.js'],
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
        '^@utils/(.*)$': '<rootDir>/apps/unified/src/utils/$1',
        '^@utils/index$': '<rootDir>/apps/unified/src/utils/index.ts',
        '^canvas$': '<rootDir>/test/setup/canvas-mock.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
          'jest-transform-stub',
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      moduleFileExtensions: ['js', 'mjs', 'cjs', 'ts', 'tsx', 'json'],
      clearMocks: true,
      resetMocks: true,
      restoreMocks: true,
      testTimeout: 30000,
      maxWorkers: 1,
      collectCoverageFrom: [
        'apps/unified/src/**/*.{ts,tsx}',
        '!apps/unified/src/**/*.d.ts',
        '!apps/unified/src/**/*.stories.{ts,tsx}',
        '!apps/unified/src/**/index.{ts,tsx}',
        '!apps/unified/src/main.tsx',
        '!apps/unified/src/vite-env.d.ts',
        '!apps/unified/src/**/*.test.*',
        '!apps/unified/src/**/*.spec.*',
      ],
      coverageThreshold: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
      transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@heroui|framer-motion|react-spring|i18next|react-i18next))',
      ],
    },
  ],
  // Global configuration
  verbose: false,
  bail: false,
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    'apps/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.test.*',
    '!**/*.spec.*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
