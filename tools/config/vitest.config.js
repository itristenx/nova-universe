import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'nova-api/test/**/*.test.js',
      'nova-api/test/**/*.test.mjs',
      'test/**/*.test.js',
      'test/**/*.test.mjs',
      'scripts/test/**/*.test.js',
      'scripts/test/**/*.test.mjs',
    ],
    globals: true,
    threads: false, // for DB tests, run serially
  },
});
