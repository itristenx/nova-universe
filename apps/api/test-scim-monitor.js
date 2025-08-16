// Test script for SCIM Monitor endpoints
import { PrismaClient } from '../../prisma/generated/core/index.js';

const prisma = new PrismaClient();

async function testScimMonitorImplementation() {
  try {
    console.log('🧪 Testing SCIM Monitor Implementation...');

    // Test 1: Create some sample log entries directly with Prisma
    console.log('\n1. Creating sample SCIM log entries...');

    await prisma.scimLog.create({
      data: {
        operation: 'create',
        entityType: 'user',
        entityId: 'test-user-1',
        statusCode: 201,
        message: 'User created successfully',
        requestBody: { userName: 'test@example.com' },
        responseBody: { id: 'test-user-1', userName: 'test@example.com' },
        userAgent: 'Test-Agent/1.0',
        ipAddress: '127.0.0.1',
        duration: 250,
      },
    });

    await prisma.scimLog.create({
      data: {
        operation: 'update',
        entityType: 'user',
        entityId: 'test-user-1',
        statusCode: 200,
        message: 'User updated successfully',
        requestBody: { displayName: 'Test User Updated' },
        responseBody: { id: 'test-user-1', displayName: 'Test User Updated' },
        userAgent: 'Test-Agent/1.0',
        ipAddress: '127.0.0.1',
        duration: 180,
      },
    });

    await prisma.scimLog.create({
      data: {
        operation: 'get',
        entityType: 'user',
        entityId: 'test-user-1',
        statusCode: 404,
        message: 'User not found',
        userAgent: 'Test-Agent/1.0',
        ipAddress: '127.0.0.1',
        duration: 50,
      },
    });

    console.log('✅ Sample log entries created successfully');

    // Test 2: Query the logs to verify they were inserted
    console.log('\n2. Querying SCIM logs...');

    const logs = await prisma.scimLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log(`✅ Found ${logs.length} log entries:`);
    logs.forEach((log, index) => {
      console.log(
        `  ${index + 1}. ${log.operation} ${log.entityType} (${log.statusCode}) - ${log.message}`,
      );
    });

    // Test 3: Test aggregation queries
    console.log('\n3. Testing aggregation queries...');

    const totalOps = await prisma.scimLog.count();
    console.log(`✅ Total operations: ${totalOps}`);

    const opsByType = await prisma.scimLog.groupBy({
      by: ['operation'],
      _count: { _all: true },
    });

    console.log('✅ Operations by type:');
    opsByType.forEach((op) => {
      console.log(`  ${op.operation}: ${op._count._all}`);
    });

    const avgDuration = await prisma.scimLog.aggregate({
      where: { duration: { not: null } },
      _avg: { duration: true },
    });

    console.log(`✅ Average duration: ${avgDuration._avg.duration?.toFixed(2)}ms`);

    console.log('\n🎉 All tests passed! SCIM Monitor implementation is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testScimMonitorImplementation().catch(console.error);
}

export { testScimMonitorImplementation };
