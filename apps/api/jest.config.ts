import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  },
  // Jest 30+ does not allow '.js' in extensionsToTreatAsEsm when using type
  // module packages. Remove it to avoid validation errors.
  // Treat only TypeScript files as ES modules for Jest
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
};

export default config;
