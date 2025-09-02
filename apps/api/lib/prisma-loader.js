import { logger } from '../logger.js';

const cache = new Map();

function candidates(pkg) {
  return [
    `/app/prisma/generated/${pkg}/index.js`,
    `/prisma/generated/${pkg}/index.js`,
    `../../prisma/generated/${pkg}/index.js`,
  ];
}

export async function getPrismaClient(pkg = 'core') {
  const key = `client:${pkg}`;
  if (cache.has(key)) return cache.get(key);
  let PrismaClient;
  for (const p of candidates(pkg)) {
    try {
      ({ PrismaClient } = await import(p));
      break;
    } catch {
      // try next
    }
  }
  if (!PrismaClient) {
    logger.warn(`Prisma client for package '${pkg}' not found`);
    cache.set(key, null);
    return null;
  }
  const client = new PrismaClient();
  cache.set(key, client);
  return client;
}

