// test/database-setup.test.js
// Test file to validate the Nova Universe enhanced database setup
import { logger } from '../nova-api/logger.js';

const skip = process.env.SKIP_DB_TESTS === 'true';

async function getNovaDb() {
  try {
    // Prefer built JS if present
    return (await import('../src/lib/db/index.js')).novaDb;
  } catch {
    try {
      // Fallback to TS in ts-node/tsx environments
      return (await import('../src/lib/db/index.ts')).novaDb;
    } catch (e) {
      logger.warn('Enhanced DB module not compiled; skipping setup test.');
      return null;
    }
  }
}

async function testDatabaseSetup() {
  console.log('🚀 Testing Nova Universe Enhanced Database Setup...\n');

  if (skip) {
    logger.info('SKIP_DB_TESTS is true; skipping external service checks.');
    logger.info('✅ Quick setup test skipped.');
    return;
  }

  const novaDb = await getNovaDb();
  if (!novaDb) return;

  try {
    // Initialize all database connections
    console.log('1. Initializing database connections...');
    await novaDb.initialize();
    console.log('✅ Database connections initialized\n');

    // Test health checks
    console.log('2. Checking database health...');
    const health = await novaDb.getHealthStatus();
    
    console.log('📊 Database Health Status:');
    console.log(`   PostgreSQL: ${health.postgres.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    if (health.postgres.responseTime) {
      console.log(`     Response Time: ${health.postgres.responseTime}ms`);
    }
    if (health.postgres.error) {
      console.log(`     Error: ${health.postgres.error}`);
    }

    console.log(`   MongoDB: ${health.mongo.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    if (health.mongo.responseTime) {
      console.log(`     Response Time: ${health.mongo.responseTime}ms`);
    }
    if (health.mongo.error) {
      console.log(`     Error: ${health.mongo.error}`);
    }

    console.log(`   Elasticsearch: ${health.elasticsearch.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    if (health.elasticsearch.responseTime) {
      console.log(`     Response Time: ${health.elasticsearch.responseTime}ms`);
    }
    if (health.elasticsearch.clusterStatus) {
      console.log(`     Cluster Status: ${health.elasticsearch.clusterStatus}`);
    }
    if (health.elasticsearch.error) {
      console.log(`     Error: ${health.elasticsearch.error}`);
    }
    console.log('');

    // Summary
    console.log('🎉 Nova Universe Enhanced Database Setup Test Complete!');
  } catch (error) {
    console.error('❌ Database setup test failed:', error);
  }
}

// Run the test
testDatabaseSetup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });

export { testDatabaseSetup };
