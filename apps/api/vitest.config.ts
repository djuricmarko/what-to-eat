import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { conditions: ['@wte/source'] },
  ssr: { resolve: { conditions: ['@wte/source'] } },
  test: { environment: 'node', env: { NODE_ENV: 'test' } },
});
