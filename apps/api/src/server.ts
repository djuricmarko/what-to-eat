import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';

const env = loadEnv();
const app = await buildApp(env);

async function shutDown(signal: NodeJS.Signals) {
  app.log.info(`${signal} received, shutting down`);
  await app.close();
  process.exit(0);
}

process.once('SIGINT', shutDown);
process.once('SIGTERM', shutDown);

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
