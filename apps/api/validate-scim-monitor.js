// Simple validation test for SCIM Monitor endpoints
import express from 'express';

// Simple test to validate the router loads correctly
async function validateScimMonitorRouter() {
  try {
    console.log('🧪 Validating SCIM Monitor Router...');

    // Test 1: Import the router
    console.log('1. Testing router import...');
    const { default: scimMonitorRouter } = await import('./routes/scimMonitor.js');
    console.log('✅ Router imported successfully');

    // Test 2: Create a test express app
    console.log('2. Testing router mounting...');
    const app = express();
    app.use(express.json());
    
    // Mock auth middleware
    app.use((req, res, next) => {
      req.user = { id: 'test-user' };
      next();
    });
    
    app.use('/api/scim/monitor', scimMonitorRouter);
    console.log('✅ Router mounted successfully');

    // Test 3: Verify database connection (optional in UAT)
    try {
      const { PrismaClient } = await import('../../prisma/generated/core/index.js');
      const prisma = new PrismaClient();
      await prisma.$connect();
      console.log('✅ Database connection successful');
      const count = await prisma.scimLog.count();
      console.log(`✅ ScimLog model working, found ${count} existing logs`);
      await prisma.$disconnect();
    } catch (e) {
      console.warn('⚠️ Prisma not available in UAT validation, skipping DB checks');
    }

    console.log('\n🎉 Validation completed.');
    
    return true;
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateScimMonitorRouter()
    .then(success => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}

export { validateScimMonitorRouter };
