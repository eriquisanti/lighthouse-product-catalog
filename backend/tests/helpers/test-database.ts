import type { PrismaClient } from '../../src/generated/prisma/client.js';
import { createPrismaClient } from '../../src/lib/prisma.js';

export function assertTestDatabase(databaseUrl: string | undefined): asserts databaseUrl is string {
  if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith('_test')) {
    throw new Error(`Tests must run against a "_test" database. Received: ${databaseUrl}`);
  }
}

export function createTestPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  assertTestDatabase(databaseUrl);
  return createPrismaClient({ databaseUrl, poolMax: Number(process.env.DATABASE_POOL_MAX ?? 5) });
}

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRaw`TRUNCATE TABLE products`;
}
