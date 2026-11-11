import fp from 'fastify-plugin';
import { createDb, type Db } from '../db/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
  }
}

export default fp(
  async (app, opts: { url: string }) => {
    const { db, sql } = createDb(opts.url);
    app.decorate('db', db);
    app.addHook('onClose', async () => {
      await sql.end({ timeout: 5 });
    });
  },
  { name: 'db' },
);
