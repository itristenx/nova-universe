// Integration test for SCIM Monitor endpoints
import request from 'supertest';
import express from 'express';
import { PrismaClient } from '../../prisma/generated/core/index.js';
import scimMonitorRouter from './routes/scimMonitor.js';

// Create a test app
const app = express();
app.use(express.json());

// Mock JWT authentication for testing
app.use((req, res, next) => {
  req.user = { id: 'test-user', email: 'test@example.com' };
  next();
});

app.use('/api/scim/monitor', scimMonitorRouter);

const prisma = new PrismaClient();

async function runIntegrationTests() {
  try {
    console.log('🧪 Running SCIM Monitor Integration Tests...');

    // Clean up any existing test data
    await prisma.scimLog.deleteMany({
      where: {
        entityId: { startsWith: 'test-' }
      }
    });

    // Create test data
    console.log('\n1. Creating test SCIM log data...');
    await prisma.scimLog.createMany({
      data: [
        {
          operation: 'create',
          entityType: 'user',
          entityId: 'test-user-1',
          statusCode: 201,
          message: 'User created',
          userAgent: 'Test-Agent/1.0',
          ipAddress: '127.0.0.1',
          duration: 100
        },
        {
          operation: 'update',
          entityType: 'user',
          entityId: 'test-user-1',
          statusCode: 200,
          message: 'User updated',
          userAgent: 'Test-Agent/1.0',
          ipAddress: '127.0.0.1',
          duration: 150
        },
        {
          operation: 'delete',
          entityType: 'user',
          entityId: 'test-user-1',
          statusCode: 400,
          message: 'User deletion failed',
          userAgent: 'Test-Agent/1.0',
          ipAddress: '127.0.0.1',
          duration: 50
        }
      ]
    });

    console.log('✅ Test data created');

    // Test 2: Test /api/scim/monitor/logs endpoint
    console.log('\n2. Testing GET /api/scim/monitor/logs...');
    
    const logsResponse = await request(app)
      .get('/api/scim/monitor/logs')
      .expect(200);

    console.log(`✅ Logs endpoint returned ${logsResponse.body.logs.length} logs`);
    console.log(`✅ Pagination: page ${logsResponse.body.pagination.page}, total ${logsResponse.body.pagination.total}`);

    // Test filtering
    const filteredResponse = await request(app)
      .get('/api/scim/monitor/logs?operation=create&entityType=user')
      .expect(200);

    console.log(`✅ Filtered logs: ${filteredResponse.body.logs.length} create operations`);

    // Test 3: Test /api/scim/monitor/status endpoint
    console.log('\n3. Testing GET /api/scim/monitor/status...');
    
    const statusResponse = await request(app)
      .get('/api/scim/monitor/status')
      .expect(200);

    console.log(`✅ Status endpoint returned status: ${statusResponse.body.status}`);
    console.log(`✅ Total operations: ${statusResponse.body.statistics.totalOperations}`);
    console.log(`✅ Operations by type:`, statusResponse.body.statistics.operationsByType);
    console.log(`✅ Error rate: ${statusResponse.body.statistics.errorRate}%`);

    // Test with different timeframes
    const statusHourResponse = await request(app)
      .get('/api/scim/monitor/status?timeframe=1h')
      .expect(200);

    console.log(`✅ 1-hour timeframe: ${statusHourResponse.body.statistics.totalOperations} operations`);

    // Test 4: Test error handling
    console.log('\n4. Testing error handling...');
    
    // Test with invalid timeframe
    const invalidTimeframeResponse = await request(app)
      .get('/api/scim/monitor/status?timeframe=invalid')
      .expect(200); // Should still work, defaults to 24h

    console.log('✅ Invalid timeframe handled gracefully');

    // Test with invalid pagination
    const invalidPaginationResponse = await request(app)
      .get('/api/scim/monitor/logs?page=-1&limit=200')
      .expect(200); // Should still work with corrected values

    console.log('✅ Invalid pagination handled gracefully');

    console.log('\n🎉 All integration tests passed! SCIM Monitor API is working correctly.');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  } finally {
    // Clean up test data
    await prisma.scimLog.deleteMany({
      where: {
        entityId: { startsWith: 'test-' }
      }
    });
    await prisma.$disconnect();
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests().catch(console.error);
}

export { runIntegrationTests };
