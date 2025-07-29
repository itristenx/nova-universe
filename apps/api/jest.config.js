export default {
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
    '^.+\\.js$': 'babel-jest'
  },
  extensionsToTreatAsEsm: ['.ts', '.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
