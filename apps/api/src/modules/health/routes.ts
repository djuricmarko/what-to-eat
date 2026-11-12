import { sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

const healthyResponseSchema = z.object({ status: z.literal('ok'), db: z.literal('up') });
const degradedResponseSchema = z.object({ status: z.literal('degraded'), db: z.literal('down') });

export default async function healthRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/health',
    {
      schema: {
        tags: ['health'],
        response: { 200: healthyResponseSchema, 503: degradedResponseSchema },
      },
    },
    async (request, reply) => {
      try {
        await app.db.execute(sql`select 1`);
        return { status: 'ok' as const, db: 'up' as const };
      } catch (error) {
        request.log.warn({ err: error }, 'health check: database unreachable');
        return reply.status(503).send({ status: 'degraded', db: 'down' });
      }
    },
  );
}
