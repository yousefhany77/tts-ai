/// <reference types="vitest" />
import { resolve } from 'node:path';
import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
      exclude: [...defaultExclude, 'src/core/types/**'],
    },
    isolate: true,
    unstubEnvs: true,
  },
});
