import { execSync } from 'node:child_process';
import { assertTestDatabase } from '../helpers/test-database.js';

export default function setup(): void {
  const databaseUrl = process.env.DATABASE_URL;
  assertTestDatabase(databaseUrl);

  execSync('npx prisma migrate deploy', {
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
