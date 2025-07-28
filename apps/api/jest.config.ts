import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { useESM: true }
    ],
    '^.+\\.js$': [
      'babel-jest',
      { useESM: true }
    ]
  },
  extensionsToTreatAsEsm: ['.ts', '.js', '.mjs'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
};

export default config;
