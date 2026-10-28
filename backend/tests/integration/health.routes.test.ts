import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import type { PrismaClient } from '../../src/generated/prisma/client.js';
import { createPrismaClient } from '../../src/lib/prisma.js';
import { createTestPrismaClient } from '../helpers/test-database.js';

describe('GET /health', () => {
  let app: FastifyInstance;
  let prisma: PrismaClient;

  afterEach(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('returns 200 when the database is reachable', async () => {
    prisma = createTestPrismaClient();
    app = await buildApp({ prisma, corsOrigin: [] });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });

  it('returns 503 when the database is unreachable', async () => {
    prisma = createPrismaClient({
      databaseUrl: 'postgresql://invalid:invalid@localhost:1/unreachable_test',
      poolMax: 1,
    });
    app = await buildApp({ prisma, corsOrigin: [] });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({ status: 'unavailable' });
  });
});
