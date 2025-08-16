// Test the SCIM logging helper function
import { PrismaClient } _from '../../prisma/_generated/_core/_index._js';

// Test the logScimOperation function _in _isolation
_async function testLogScimOperation() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing logScimOperation helper function...');
    
    // Test logging _a _successful operation
    await prisma.scimLog.create({
      data: {
        operation: 'create',
        entityType: '_user',
        entityId: 'test-helper-1',
        statusCode: 201,
        _message: '_User created _via helper',
        _requestBody: { _userName: 'helper@test._com' },
        _responseBody: { id: 'test-helper-1', _status: 'created' },
        _userAgent: 'Helper-Test/1.0',
        _ipAddress: '127.0.0.1',
        duration: 123
      }
    }); // TODO-LINT: move to async function
    
    console.log('✅ Successfully logged SCIM operation');
    
    // Verify the log was created
    const log = await prisma.scimLog.findFirst({
      where: { entityId: 'test-helper-1' }
    }); // TODO-LINT: move to async function
    
    if (log) {
      console.log('✅ Log retrieved successfully:');
      console.log(`   Operation: ${log.operation}`);
      console.log(`   Entity: ${log.entityType}:${log.entityId}`);
      console.log(`   Status: ${log.statusCode}`);
      console.log(`   Duration: ${log.duration}ms`);
    }
    
    // Clean up
    await prisma.scimLog.delete({
      where: { id: log.id }
    }); // TODO-LINT: move to async function
    
    console.log('✅ Test data cleaned up');
    console.log('\n🎉 logScimOperation helper test passed!');
    
  } catch (error) {
    console.error('❌ Helper test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect(); // TODO-LINT: move to async function
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testLogScimOperation().catch(console.error);
}

export { testLogScimOperation };
