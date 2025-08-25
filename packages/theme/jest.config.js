// Use root Jest configuration for packages
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.{js,ts}', '<rootDir>/src/**/*.(test|spec).{js,ts}'],
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
};
