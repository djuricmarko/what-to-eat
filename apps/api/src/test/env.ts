import type { Env } from '../config/env.js';

export const testEnv: Env = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 0,
  LOG_LEVEL: 'silent',
  DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgres://wte:wte@localhost:5432/what_to_eat_test',
  BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret-1234',
  BETTER_AUTH_URL: 'http://localhost:5173',
  WEB_ORIGIN: 'http://localhost:5173',
};
