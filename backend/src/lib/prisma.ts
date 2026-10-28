import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

type PrismaClientOptions = {
  databaseUrl: string;
  poolMax: number;
};

export function createPrismaClient({ databaseUrl, poolMax }: PrismaClientOptions): PrismaClient {
  const adapter = new PrismaPg({ connectionString: databaseUrl, max: poolMax });
  return new PrismaClient({ adapter });
}
