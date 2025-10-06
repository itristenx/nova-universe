/**
 * Database Configuration Validation Script
 * 
 * Run this to verify that your database is properly configured with
 * all required extensions and capabilities.
 * 
 * Usage:
 *   pnpm db:validate
 * 
 * Or:
 *   tsx scripts/validate-database-config.ts
 */

import { PrismaClient } from '../prisma/generated/client/index.js';

const prisma = new PrismaClient();

interface ValidationResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({
      name: 'Database Connection',
      status: 'PASS',
      message: 'Successfully connected to database',
    });
    return true;
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'FAIL',
      message: 'Failed to connect to database',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function checkPgvectorExtension() {
  try {
    const result = await prisma.$queryRaw<Array<{ extname: string; extversion: string }>>`
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname = 'vector'
    `;

    if (result.length > 0) {
      results.push({
        name: 'pgvector Extension',
        status: 'PASS',
        message: `pgvector ${result[0].extversion} is installed`,
        details: result[0],
      });
      return true;
    } else {
      results.push({
        name: 'pgvector Extension',
        status: 'FAIL',
        message: 'pgvector extension not installed',
        details: 'Run: CREATE EXTENSION IF NOT EXISTS vector;',
      });
      return false;
    }
  } catch (error) {
    results.push({
      name: 'pgvector Extension',
      status: 'FAIL',
      message: 'Error checking pgvector extension',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function checkVectorOperations() {
  try {
    const result = await prisma.$queryRaw<Array<{ distance: number }>>`
      SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector AS distance
    `;

    results.push({
      name: 'Vector Operations',
      status: 'PASS',
      message: 'Vector distance calculation works',
      details: { sampleDistance: result[0].distance },
    });
    return true;
  } catch (error) {
    results.push({
      name: 'Vector Operations',
      status: 'FAIL',
      message: 'Vector operations not working',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function checkFullTextSearch() {
  try {
    const result = await prisma.$queryRaw<Array<{ tsvector: any }>>`
      SELECT to_tsvector('english', 'The quick brown fox jumps over the lazy dog') AS tsvector
    `;

    results.push({
      name: 'Full-Text Search',
      status: 'PASS',
      message: 'Full-text search (tsvector) works',
    });
    return true;
  } catch (error) {
    results.push({
      name: 'Full-Text Search',
      status: 'FAIL',
      message: 'Full-text search not working',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function checkConnectionPool() {
  try {
    const result = await prisma.$queryRaw<Array<{
      total: number;
      active: number;
      idle: number;
      waiting: number;
    }>>`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) FILTER (WHERE wait_event_type IS NOT NULL) as waiting
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    const poolSize = parseInt(process.env.DATABASE_POOL_SIZE || '20');
    const metrics = result[0];

    if (metrics.total <= poolSize) {
      results.push({
        name: 'Connection Pool',
        status: 'PASS',
        message: `Connection pool within limits (${metrics.total}/${poolSize})`,
        details: metrics,
      });
    } else {
      results.push({
        name: 'Connection Pool',
        status: 'WARN',
        message: `Connection pool at capacity (${metrics.total}/${poolSize})`,
        details: metrics,
      });
    }
    return true;
  } catch (error) {
    results.push({
      name: 'Connection Pool',
      status: 'WARN',
      message: 'Could not check connection pool metrics',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function checkIndexes() {
  try {
    const result = await prisma.$queryRaw<Array<{
      tablename: string;
      indexname: string;
      indexdef: string;
    }>>`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('kb_articles', 'support_tickets')
        AND (indexdef LIKE '%USING gin%' OR indexdef LIKE '%USING hnsw%')
    `;

    const expectedIndexes = [
      'kb_articles_search_vector_idx',
      'kb_articles_embedding_idx',
      'support_tickets_search_vector_idx',
      'support_tickets_embedding_idx',
    ];

    const foundIndexes = result.map(r => r.indexname);
    const missingIndexes = expectedIndexes.filter(idx => !foundIndexes.includes(idx));

    if (missingIndexes.length === 0) {
      results.push({
        name: 'Search Indexes',
        status: 'PASS',
        message: 'All required search indexes exist',
        details: { foundIndexes },
      });
    } else if (result.length > 0) {
      results.push({
        name: 'Search Indexes',
        status: 'WARN',
        message: 'Some search indexes missing (run migrations)',
        details: { missingIndexes },
      });
    } else {
      results.push({
        name: 'Search Indexes',
        status: 'FAIL',
        message: 'No search indexes found (run migrations)',
        details: { expectedIndexes },
      });
    }
    return true;
  } catch (error) {
    results.push({
      name: 'Search Indexes',
      status: 'WARN',
      message: 'Could not check indexes',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function checkPostgresVersion() {
  try {
    const result = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version() AS version
    `;

    const versionMatch = result[0].version.match(/PostgreSQL (\d+\.\d+)/);
    if (versionMatch) {
      const majorVersion = parseFloat(versionMatch[1]);
      if (majorVersion >= 13) {
        results.push({
          name: 'PostgreSQL Version',
          status: 'PASS',
          message: `PostgreSQL ${versionMatch[1]} (>= 13 required)`,
          details: { version: result[0].version },
        });
      } else {
        results.push({
          name: 'PostgreSQL Version',
          status: 'WARN',
          message: `PostgreSQL ${versionMatch[1]} (13+ recommended)`,
          details: { version: result[0].version },
        });
      }
    }
    return true;
  } catch (error) {
    results.push({
      name: 'PostgreSQL Version',
      status: 'WARN',
      message: 'Could not check PostgreSQL version',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

async function checkConfiguration() {
  try {
    const result = await prisma.$queryRaw<Array<{
      name: string;
      setting: string;
      unit: string | null;
    }>>`
      SELECT name, setting, unit
      FROM pg_settings
      WHERE name IN (
        'max_connections',
        'shared_buffers',
        'effective_cache_size',
        'maintenance_work_mem',
        'work_mem',
        'random_page_cost'
      )
    `;

    results.push({
      name: 'PostgreSQL Configuration',
      status: 'PASS',
      message: 'Current PostgreSQL configuration',
      details: result.reduce((acc, row) => {
        const value = row.unit ? `${row.setting}${row.unit}` : row.setting;
        acc[row.name] = value;
        return acc;
      }, {} as Record<string, string>),
    });
    return true;
  } catch (error) {
    results.push({
      name: 'PostgreSQL Configuration',
      status: 'WARN',
      message: 'Could not check PostgreSQL configuration',
      details: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

function printResults() {
  console.log('\n========================================');
  console.log('DATABASE CONFIGURATION VALIDATION');
  console.log('========================================\n');

  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;

  results.forEach(result => {
    const icon = {
      PASS: '✅',
      FAIL: '❌',
      WARN: '⚠️',
    }[result.status];

    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2).split('\n').join('\n   '));
    }
    console.log('');
  });

  console.log('========================================');
  console.log(`Results: ${passCount} passed, ${warnCount} warnings, ${failCount} failed`);
  console.log('========================================\n');

  if (failCount > 0) {
    console.log('❌ VALIDATION FAILED');
    console.log('Please fix the failed checks before proceeding.\n');
    console.log('See docs/DATABASE-EXTENSIONS-SETUP.md for setup instructions.\n');
    process.exit(1);
  } else if (warnCount > 0) {
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
    console.log('Consider addressing warnings for optimal performance.\n');
    process.exit(0);
  } else {
    console.log('✅ ALL CHECKS PASSED');
    console.log('Database is properly configured!\n');
    process.exit(0);
  }
}

async function main() {
  console.log('Starting database validation...\n');

  // Run checks in sequence
  const connected = await checkDatabaseConnection();
  if (!connected) {
    printResults();
    return;
  }

  await checkPostgresVersion();
  await checkPgvectorExtension();
  await checkVectorOperations();
  await checkFullTextSearch();
  await checkConnectionPool();
  await checkIndexes();
  await checkConfiguration();

  printResults();
}

main()
  .catch((error) => {
    console.error('Unexpected error during validation:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
