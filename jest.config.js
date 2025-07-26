export default {
  testMatch: [
    '<rootDir>/scripts/test/**/*.test.js',
    '<rootDir>/scripts/test/**/*.test.mjs',
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/test/**/*.test.mjs',
    '<rootDir>/nova-api/test/**/*.test.js',
    '<rootDir>/nova-api/test/**/*.test.mjs'
  ],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest'
  },
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
