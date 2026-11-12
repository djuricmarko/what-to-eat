import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import { testEnv } from './test/env.js';

describe('app', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp(testEnv);
  });

  afterAll(() => app.close());

  it('returns the standard error shape for unknown routes', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/nope' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });

  it('exposes a health endpoint', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    expect([200, 503]).toContain(response.statusCode);
  });
});
