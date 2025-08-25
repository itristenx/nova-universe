import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'test/**/*.test.js',
      'test/**/*.test.mjs',
      'test/**/*.test.ts',
      'apps/api/test/**/*.test.js',
      'apps/api/test/**/*.test.ts',
      'packages/*/test/**/*.test.js',
      'packages/*/test/**/*.test.ts',
    ],
    globals: true,
    threads: false, // for DB tests, run serially
    testTimeout: 30000,
  },
});
