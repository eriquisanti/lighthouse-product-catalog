import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';
import { createPrismaClient } from './lib/prisma.js';

const env = loadEnv();

const prisma = createPrismaClient({
  databaseUrl: env.DATABASE_URL,
  poolMax: env.DATABASE_POOL_MAX,
});

const app = await buildApp({
  prisma,
  corsOrigin: env.CORS_ORIGIN,
  logger: env.NODE_ENV !== 'test',
});

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  app.log.info(`${signal} received, shutting down`);
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.error(error);
  await prisma.$disconnect();
  process.exit(1);
}
