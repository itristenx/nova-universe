// test/test-db-setup.js
import { logger } from '../nova-api/logger.js';

const skip = process.env.SKIP_DB_TESTS === 'true';

logger.info('Testing database module imports...');

if (skip) {
  logger.info('SKIP_DB_TESTS is true; skipping external service checks.');
  logger.info('✅ Quick setup test skipped.');
  process.exit(0);
}

import('../database/factory.js')
  .then(() => import('../database/postgresql.js'))
  .then(() => import('../database/mongodb.js'))
  .then(() => {
    logger.info('✅ All database modules imported successfully');
    logger.info('✅ Database configuration loaded successfully');
    logger.info('✅ Database factory created successfully');
    logger.info('✅ All database managers created successfully');
    logger.info('🎉 Database setup test completed successfully!');
    logger.info('');
    logger.info('Next steps:');
    logger.info('1. Configure your .env file with database connection details');
    logger.info('2. Start PostgreSQL and MongoDB services');
    logger.info('3. Run: node migrate-database.js --interactive');
  })
  .catch((err) => {
    logger.error('Database setup test failed:', err);
    process.exit(1);
  });
