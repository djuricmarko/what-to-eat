import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import sensible from '@fastify/sensible';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import type { Env } from './config/env.js';
import dbPlugin from './plugins/db.js';
import errorHandler from './plugins/error-handler.js';
import security from './plugins/security.js';
import swagger from './plugins/swagger.js';
import healthRoutes from './modules/health/routes.js';

function buildLoggerOptions(env: Env): FastifyServerOptions['logger'] {
  if (env.NODE_ENV === 'test') return false;

  if (env.NODE_ENV === 'development') {
    return {
      level: env.LOG_LEVEL,
      transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } },
    };
  }

  return { level: env.LOG_LEVEL };
}

async function registerApiRoutes(api: FastifyInstance) {
  await api.register(healthRoutes);
  // Feature modules (registered per phase): auth, families, meals, recipes, polls
}

export async function buildApp(env: Env, options: FastifyServerOptions = {}) {
  const app = Fastify({ logger: buildLoggerOptions(env), ...options }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(sensible);
  await app.register(errorHandler);
  await app.register(security, { webOrigin: env.WEB_ORIGIN });
  if (env.NODE_ENV !== 'production') await app.register(swagger);
  await app.register(dbPlugin, { url: env.DATABASE_URL });
  await app.register(registerApiRoutes, { prefix: '/api' });

  return app;
}
