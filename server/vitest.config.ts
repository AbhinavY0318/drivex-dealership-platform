import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 180000, // 3 minutes for first-time binary download caching
    fileParallelism: false, // Run test suites sequentially to share single db instance cleanly
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
