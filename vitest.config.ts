import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['packages/**/*.test.ts', 'apps/mobile/src/**/*.test.{ts,tsx}', 'firebase/functions/src/**/*.test.ts'],
    setupFiles: ['apps/mobile/src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['packages/*/src/**/*.ts'],
    },
  },
});
