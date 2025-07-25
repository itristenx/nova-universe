// test-db-setup.js
// Simple test to verify database modules can be imported and basic functionality works
import { logger } from '../nova-api/logger.js';

async function testDatabaseModules() {
  logger.info('Testing database module imports...');
  
  try {
    // Test imports
    const { DatabaseFactory } = await import('../database/factory.js');
    const { PostgreSQLManager } = await import('../database/postgresql.js');
    const { MongoDBManager } = await import('../database/mongodb.js');
    const { MigrationManager } = await import('../database/migrations.js');
    
    logger.info('✅ All database modules imported successfully');
    
    // Test configuration loading
    const { databaseConfig } = await import('../nova-api/config/database.js');
    logger.info('✅ Database configuration loaded successfully');
    
    // Test factory creation (without connecting to actual databases)
    const factory = new DatabaseFactory();
    logger.info('✅ Database factory created successfully');
    
    // Test manager creation
    const pgManager = new PostgreSQLManager();
    const mongoManager = new MongoDBManager();
    const migrationManager = new MigrationManager();
    
    logger.info('✅ All database managers created successfully');
    
    logger.info('🎉 Database setup test completed successfully!');
    logger.info('');
    logger.info('Next steps:');
    logger.info('1. Configure your .env file with database connection details');
    logger.info('2. Start PostgreSQL and MongoDB services');
    logger.info('3. Run: node migrate-database.js --interactive');
    
    return true;
  } catch (error) {
    logger.error('❌ Database setup test failed:', error);
    logger.error('');
    logger.error('This likely means:');
    logger.error('1. Missing dependencies - run: npm install');
    logger.error('2. Configuration issues - check your .env file');
    logger.error('3. Module import errors - check file paths');
    
    return false;
  }
}

// Run the test
testDatabaseModules()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
