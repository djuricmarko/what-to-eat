import { sql } from 'drizzle-orm';
import { z } from 'zod';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        response: {
          200: z.object({ status: z.literal('ok'), db: z.literal('up') }),
          503: z.object({ status: z.literal('degraded'), db: z.literal('down') }),
        },
      },
    },
    async (request, reply) => {
      try {
        await app.db.execute(sql`select 1`);
        return { status: 'ok' as const, db: 'up' as const };
      } catch (err) {
        request.log.warn({ err }, 'health check: database unreachable');
        return reply.status(503).send({ status: 'degraded', db: 'down' });
      }
    },
  );
};

export default healthRoutes;
