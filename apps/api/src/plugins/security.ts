import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

interface SecurityPluginOptions {
  webOrigin: string;
}

async function securityPlugin(app: FastifyInstance, options: SecurityPluginOptions) {
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: options.webOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });
}

export default fp(securityPlugin, { name: 'security' });
