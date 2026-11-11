import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

export default fp(
  async (app, opts: { webOrigin: string }) => {
    await app.register(helmet, { contentSecurityPolicy: false });
    await app.register(cors, {
      origin: opts.webOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    });
    await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });
  },
  { name: 'security' },
);
