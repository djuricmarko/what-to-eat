import Fastify, { type FastifyServerOptions } from 'fastify';
import sensible from '@fastify/sensible';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import type { Env } from './config/env.js';
import dbPlugin from './plugins/db.js';
import errorHandler from './plugins/error-handler.js';
import security from './plugins/security.js';
import swagger from './plugins/swagger.js';
import healthRoutes from './modules/health/routes.js';

export async function buildApp(env: Env, opts: FastifyServerOptions = {}) {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'test'
        ? false
        : {
            level: env.LOG_LEVEL,
            ...(env.NODE_ENV === 'development' && {
              transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } },
            }),
          },
    ...opts,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(sensible);
  await app.register(errorHandler);
  await app.register(security, { webOrigin: env.WEB_ORIGIN });
  if (env.NODE_ENV !== 'production') await app.register(swagger);
  await app.register(dbPlugin, { url: env.DATABASE_URL });

  await app.register(
    async (api) => {
      await api.register(healthRoutes);
      // Feature modules (registered per phase): auth, families, meals, recipes, polls
    },
    { prefix: '/api' },
  );

  return app;
}
