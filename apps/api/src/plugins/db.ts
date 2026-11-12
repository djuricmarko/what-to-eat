import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { createDb, type Db } from '../db/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
  }
}

interface DbPluginOptions {
  url: string;
}

async function dbPlugin(app: FastifyInstance, options: DbPluginOptions) {
  const { db, sql } = createDb(options.url);

  app.decorate('db', db);
  app.addHook('onClose', async () => {
    await sql.end({ timeout: 5 });
  });
}

export default fp(dbPlugin, { name: 'db' });
