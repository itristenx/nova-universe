// Simple runtime check to verify Prisma can connect and run a query against the core database
import { PrismaClient } from '../../prisma/generated/core/index.js';

async function main() {
  const databaseUrl = process.env.CORE_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Missing CORE_DATABASE_URL or DATABASE_URL');
    process.exit(1);
  }

  const client = new PrismaClient({
    datasources: { core_db: { url: databaseUrl } },
  });

  try {
    const result = await client.$queryRaw`SELECT 1 as ok`;
    console.log('Prisma connectivity OK. Test result:', result);
  } catch (err) {
    console.error('Prisma connectivity failed:', err);
    process.exitCode = 1;
  } finally {
    await client.$disconnect();
  }
}

main();


