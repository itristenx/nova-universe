// Test the SCIM logging helper function
import { PrismaClient } from '../../prisma/generated/core/index.js';

// Test the logScimOperation function in isolation
async function testLogScimOperation() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Testing logScimOperation helper function...');

    // Test logging a successful operation
    await prisma.scimLog.create({
      data: {
        operation: 'create',
        entityType: 'user',
        entityId: 'test-helper-1',
        statusCode: 201,
        message: 'User created via helper',
        requestBody: { userName: 'helper@test.com' },
        responseBody: { id: 'test-helper-1', status: 'created' },
        userAgent: 'Helper-Test/1.0',
        ipAddress: '127.0.0.1',
        duration: 123,
      },
    });

    console.log('✅ Successfully logged SCIM operation');

    // Verify the log was created
    const log = await prisma.scimLog.findFirst({
      where: { entityId: 'test-helper-1' },
    });

    if (log) {
      console.log('✅ Log retrieved successfully:');
      console.log(`   Operation: ${log.operation}`);
      console.log(`   Entity: ${log.entityType}:${log.entityId}`);
      console.log(`   Status: ${log.statusCode}`);
      console.log(`   Duration: ${log.duration}ms`);
    }

    // Clean up
    await prisma.scimLog.delete({
      where: { id: log.id },
    });

    console.log('✅ Test data cleaned up');
    console.log('\n🎉 logScimOperation helper test passed!');
  } catch (error) {
    console.error('❌ Helper test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testLogScimOperation().catch(console.error);
}

export { testLogScimOperation };
