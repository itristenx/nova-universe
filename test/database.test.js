// test/database.test.js
// Comprehensive test suite for the new database system
import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from the created modules
import { DatabaseFactory } from '../database/factory.js';
import { PostgreSQLManager } from '../database/postgresql.js';
import { MongoDBManager } from '../database/mongodb.js';
import { MigrationManager } from '../database/migrations.js';
import { logger } from '../nova-api/logger.js';

// Test configuration
const testConfig = {
  postgresql: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'nova_universe_test',
    user: process.env.POSTGRES_USER || 'nova_user',
    password: process.env.POSTGRES_PASSWORD || 'secure_password_here',
    ssl: false
  },
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/nova_universe_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};

describe('Database System Tests', () => {
  let dbFactory;
  let postgresManager;
  let mongoManager;
  let migrationManager;

  before(async () => {
    logger.info('Setting up database test environment...');
    
    // Override environment for testing
    process.env.NODE_ENV = 'test';
    process.env.POSTGRES_DB = testConfig.postgresql.database;
    process.env.MONGO_URI = testConfig.mongodb.uri;
    
    // Initialize managers
    dbFactory = new DatabaseFactory();
    postgresManager = new PostgreSQLManager(testConfig.postgresql);
    mongoManager = new MongoDBManager(testConfig.mongodb);
    migrationManager = new MigrationManager();
  });

  after(async () => {
    logger.info('Cleaning up test environment...');
    
    try {
      // Clean up test databases
      if (postgresManager) {
        await postgresManager.close();
      }
      if (mongoManager) {
        await mongoManager.close();
      }
      if (dbFactory) {
        await dbFactory.close();
      }
    } catch (error) {
      logger.warn('Cleanup warning:', error.message);
    }
  });

  describe('PostgreSQL Manager', () => {
    beforeEach(async () => {
      // Clean test database
      try {
        await postgresManager.initialize();
        await postgresManager.query('DROP SCHEMA IF EXISTS public CASCADE');
        await postgresManager.query('CREATE SCHEMA public');
      } catch (error) {
        logger.warn('Test setup warning:', error.message);
      }
    });

    it('should initialize PostgreSQL connection', async () => {
      assert.ok(postgresManager);
      await postgresManager.initialize();
      
      const result = await postgresManager.query('SELECT 1 as test');
      assert.strictEqual(result.rows[0].test, 1);
    });

    it('should handle transactions', async () => {
      await postgresManager.initialize();
      
      // Create test table
      await postgresManager.query(`
        CREATE TABLE test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255)
        )
      `);

      // Test successful transaction
      const result = await postgresManager.transaction(async (client) => {
        await client.query('INSERT INTO test_table (name) VALUES ($1)', ['test1']);
        await client.query('INSERT INTO test_table (name) VALUES ($1)', ['test2']);
        return await client.query('SELECT COUNT(*) as count FROM test_table');
      });

      assert.strictEqual(parseInt(result.rows[0].count), 2);

      // Test failed transaction (should rollback)
      try {
        await postgresManager.transaction(async (client) => {
          await client.query('INSERT INTO test_table (name) VALUES ($1)', ['test3']);
          throw new Error('Test error');
        });
      } catch (error) {
        // Expected error
      }

      // Verify rollback
      const count = await postgresManager.query('SELECT COUNT(*) as count FROM test_table');
      assert.strictEqual(parseInt(count.rows[0].count), 2);
    });

    it('should perform health checks', async () => {
      await postgresManager.initialize();
      const health = await postgresManager.healthCheck();
      
      assert.ok(health.healthy);
      assert.ok(health.responseTime);
      assert.ok(health.connections);
    });

    it('should handle connection pooling', async () => {
      await postgresManager.initialize();
      
      // Test multiple concurrent connections
      const promises = Array.from({ length: 5 }, (_, i) => 
        postgresManager.query('SELECT $1 as id', [i])
      );
      
      const results = await Promise.all(promises);
      results.forEach((result, index) => {
        assert.strictEqual(result.rows[0].id, index);
      });
    });
  });

  describe('MongoDB Manager', () => {
    beforeEach(async () => {
      try {
        await mongoManager.initialize();
        // Clean test collections
        const collections = await mongoManager.db.listCollections().toArray();
        for (const collection of collections) {
          await mongoManager.db.collection(collection.name).deleteMany({});
        }
      } catch (error) {
        logger.warn('MongoDB test setup warning:', error.message);
      }
    });

    it('should initialize MongoDB connection', async () => {
      await mongoManager.initialize();
      assert.ok(mongoManager.db);
      
      // Test connection
      const result = await mongoManager.db.admin().ping();
      assert.ok(result);
    });

    it('should store and retrieve documents', async () => {
      await mongoManager.initialize();
      
      const testDoc = {
        name: 'Test Document',
        value: 42,
        created: new Date()
      };

      // Store document
      const stored = await mongoManager.storeDocument('test_collection', testDoc);
      assert.ok(stored.insertedId);

      // Retrieve document
      const retrieved = await mongoManager.findDocuments('test_collection', { name: 'Test Document' });
      assert.strictEqual(retrieved.length, 1);
      assert.strictEqual(retrieved[0].name, 'Test Document');
      assert.strictEqual(retrieved[0].value, 42);
    });

    it('should handle transactions', async () => {
      await mongoManager.initialize();
      
      const result = await mongoManager.withTransaction(async (session) => {
        await mongoManager.db.collection('test_collection').insertOne(
          { name: 'Transaction Test 1' },
          { session }
        );
        await mongoManager.db.collection('test_collection').insertOne(
          { name: 'Transaction Test 2' },
          { session }
        );
        return 'success';
      });

      assert.strictEqual(result, 'success');
      
      const docs = await mongoManager.findDocuments('test_collection', {});
      assert.strictEqual(docs.length, 2);
    });

    it('should handle audit logging', async () => {
      await mongoManager.initialize();
      
      await mongoManager.logAudit('TEST_ACTION', 'user123', {
        details: 'Test audit log',
        ip: '127.0.0.1'
      });

      const logs = await mongoManager.findDocuments('audit_logs', {
        action: 'TEST_ACTION'
      });

      assert.strictEqual(logs.length, 1);
      assert.strictEqual(logs[0].user_id, 'user123');
      assert.strictEqual(logs[0].details.details, 'Test audit log');
    });

    it('should perform health checks', async () => {
      await mongoManager.initialize();
      const health = await mongoManager.healthCheck();
      
      assert.ok(health.healthy);
      assert.ok(health.responseTime);
      assert.ok(health.serverStatus);
    });
  });

  describe('Database Factory', () => {
    beforeEach(async () => {
      // Reset factory for each test
      dbFactory = new DatabaseFactory();
    });

    it('should initialize with PostgreSQL and MongoDB', async () => {
      await dbFactory.initialize();
      
      assert.ok(dbFactory.postgresql);
      assert.ok(dbFactory.mongodb);
    });

    it('should handle unified queries', async () => {
      await dbFactory.initialize();
      
      // Test PostgreSQL query
      const pgResult = await dbFactory.query('SELECT 1 as test');
      assert.strictEqual(pgResult.rows[0].test, 1);
    });

    it('should handle document operations', async () => {
      await dbFactory.initialize();
      
      const testDoc = { name: 'Factory Test', value: 123 };
      
      // Store document
      const stored = await dbFactory.storeDocument('test_collection', testDoc);
      assert.ok(stored.insertedId);
      
      // Find documents
      const found = await dbFactory.findDocuments('test_collection', { name: 'Factory Test' });
      assert.strictEqual(found.length, 1);
      assert.strictEqual(found[0].value, 123);
    });

    it('should handle transactions across databases', async () => {
      await dbFactory.initialize();
      
      // Create test table in PostgreSQL
      await dbFactory.query(`
        CREATE TABLE IF NOT EXISTS test_factory (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255)
        )
      `);

      const result = await dbFactory.transaction(async (client) => {
        // PostgreSQL operation
        await client.query('INSERT INTO test_factory (name) VALUES ($1)', ['Factory Transaction']);
        
        // MongoDB operation (using factory's method)
        await dbFactory.storeDocument('transaction_test', { 
          name: 'MongoDB Transaction',
          linked_id: 1
        });
        
        return 'success';
      });

      assert.strictEqual(result, 'success');
      
      // Verify both operations succeeded
      const pgResult = await dbFactory.query('SELECT * FROM test_factory WHERE name = $1', ['Factory Transaction']);
      assert.strictEqual(pgResult.rows.length, 1);
      
      const mongoResult = await dbFactory.findDocuments('transaction_test', { name: 'MongoDB Transaction' });
      assert.strictEqual(mongoResult.length, 1);
    });

    it('should create audit logs', async () => {
      await dbFactory.initialize();
      
      await dbFactory.createAuditLog('FACTORY_TEST', 'test_user', {
        action: 'test_operation',
        details: 'Factory audit test'
      });

      const logs = await dbFactory.findDocuments('audit_logs', {
        action: 'FACTORY_TEST'
      });

      assert.strictEqual(logs.length, 1);
      assert.strictEqual(logs[0].user_id, 'test_user');
    });

    it('should handle health checks', async () => {
      await dbFactory.initialize();
      const health = await dbFactory.healthCheck();
      
      assert.ok(health.postgresql);
      assert.ok(health.mongodb);
      assert.ok(health.postgresql.healthy);
      assert.ok(health.mongodb.healthy);
    });
  });

  describe('Migration Manager', () => {
    it('should run schema migrations', async () => {
      await migrationManager.runMigrations();
      
      // Verify migrations were applied
      const result = await postgresManager.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      assert.ok(parseInt(result.rows[0].count) > 0);
    });

    it('should handle migration status tracking', async () => {
      await migrationManager.runMigrations();
      
      const appliedMigrations = await migrationManager.getAppliedMigrations();
      assert.ok(Array.isArray(appliedMigrations));
      assert.ok(appliedMigrations.length > 0);
    });

    it('should create new migrations', async () => {
      const migrationPath = await migrationManager.createMigration('test_migration');
      assert.ok(migrationPath);
      assert.ok(migrationPath.includes('test_migration'));
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle PostgreSQL connection failures gracefully', async () => {
      const badConfig = {
        ...testConfig.postgresql,
        host: 'invalid-host',
        connectionTimeout: 1000
      };
      
      const badManager = new PostgreSQLManager(badConfig);
      
      try {
        await badManager.initialize();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message.includes('ENOTFOUND') || error.message.includes('timeout'));
      }
    });

    it('should handle MongoDB connection failures gracefully', async () => {
      const badConfig = {
        uri: 'mongodb://invalid-host:27017/test',
        options: {
          serverSelectionTimeoutMS: 1000
        }
      };
      
      const badManager = new MongoDBManager(badConfig);
      
      try {
        await badManager.initialize();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message.includes('ENOTFOUND') || error.message.includes('timeout'));
      }
    });

    it('should handle query failures with proper error messages', async () => {
      await postgresManager.initialize();
      
      try {
        await postgresManager.query('SELECT * FROM non_existent_table');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.ok(error.message.includes('does not exist'));
      }
    });

    it('should handle transaction rollbacks properly', async () => {
      await postgresManager.initialize();
      
      // Create test table
      await postgresManager.query(`
        CREATE TABLE IF NOT EXISTS rollback_test (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255)
        )
      `);

      try {
        await postgresManager.transaction(async (client) => {
          await client.query('INSERT INTO rollback_test (name) VALUES ($1)', ['test']);
          throw new Error('Forced error');
        });
      } catch (error) {
        // Expected
      }

      // Verify no data was inserted
      const result = await postgresManager.query('SELECT COUNT(*) as count FROM rollback_test');
      assert.strictEqual(parseInt(result.rows[0].count), 0);
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle concurrent database operations', async () => {
      await dbFactory.initialize();
      
      // Create test table
      await dbFactory.query(`
        CREATE TABLE IF NOT EXISTS concurrency_test (
          id SERIAL PRIMARY KEY,
          value INTEGER
        )
      `);

      // Run concurrent operations
      const promises = Array.from({ length: 10 }, (_, i) => 
        dbFactory.query('INSERT INTO concurrency_test (value) VALUES ($1)', [i])
      );

      await Promise.all(promises);

      // Verify all inserts succeeded
      const result = await dbFactory.query('SELECT COUNT(*) as count FROM concurrency_test');
      assert.strictEqual(parseInt(result.rows[0].count), 10);
    });

    it('should handle large document operations in MongoDB', async () => {
      await mongoManager.initialize();
      
      const largeDoc = {
        name: 'Large Document',
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          value: `Item ${i}`,
          timestamp: new Date()
        }))
      };

      const result = await mongoManager.storeDocument('large_test', largeDoc);
      assert.ok(result.insertedId);

      const retrieved = await mongoManager.findDocuments('large_test', { name: 'Large Document' });
      assert.strictEqual(retrieved.length, 1);
      assert.strictEqual(retrieved[0].data.length, 1000);
    });
  });
});

// Additional integration tests
describe('Integration Tests', () => {
  let dbFactory;

  before(async () => {
    dbFactory = new DatabaseFactory();
    await dbFactory.initialize();
  });

  after(async () => {
    if (dbFactory) {
      await dbFactory.close();
    }
  });

  it('should handle a complete user workflow', async () => {
    // Create user
    const userResult = await dbFactory.query(`
      INSERT INTO users (name, email, password_hash, is_default) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id
    `, ['Test User', 'test@example.com', 'hashed_password', false]);

    const userId = userResult.rows[0].id;
    assert.ok(userId);

    // Store user preferences in MongoDB
    await dbFactory.storeDocument('user_preferences', {
      user_id: userId,
      theme: 'dark',
      notifications: true,
      last_updated: new Date()
    });

    // Create audit log
    await dbFactory.createAuditLog('USER_CREATED', userId, {
      action: 'user_registration',
      ip: '127.0.0.1'
    });

    // Verify all data
    const user = await dbFactory.query('SELECT * FROM users WHERE id = $1', [userId]);
    assert.strictEqual(user.rows[0].email, 'test@example.com');

    const preferences = await dbFactory.findDocuments('user_preferences', { user_id: userId });
    assert.strictEqual(preferences.length, 1);
    assert.strictEqual(preferences[0].theme, 'dark');

    const auditLogs = await dbFactory.findDocuments('audit_logs', { user_id: userId });
    assert.strictEqual(auditLogs.length, 1);
    assert.strictEqual(auditLogs[0].action, 'USER_CREATED');
  });
});
