import { chromium, FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

interface TestEnvironment {
  apiBaseUrl: string;
  databaseUrl: string;
  testUser: {
    email: string;
    password: string;
    token?: string;
  };
  testAdmin: {
    email: string;
    password: string;
    token?: string;
  };
}

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('🚀 Starting global test setup...');
  
  const testEnv: TestEnvironment = {
    apiBaseUrl: process.env.TEST_API_URL || 'http://localhost:3000',
    databaseUrl: process.env.TEST_DATABASE_URL || 'postgresql://nova_admin:nova_password@localhost:5432/nova_universe_test',
    testUser: {
      email: process.env.TEST_USER_EMAIL || 'testuser@nova.com',
      password: process.env.TEST_USER_PASSWORD || 'TestUser123!'
    },
    testAdmin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@nova.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!'
    }
  };

  try {
    // 1. Verify database connectivity
    console.log('📊 Verifying database connectivity...');
    await verifyDatabaseConnection(testEnv.databaseUrl);
    
    // 2. Verify API connectivity
    console.log('🔌 Verifying API connectivity...');
    await verifyApiConnection(testEnv.apiBaseUrl);
    
    // 3. Setup test database
    console.log('🗄️ Setting up test database...');
    await setupTestDatabase(testEnv.databaseUrl);
    
    // 4. Create test users and get authentication tokens
    console.log('👤 Setting up test users...');
    const { userToken, adminToken } = await setupTestUsers(testEnv);
    
    // 5. Store test environment in global config
    process.env.TEST_USER_TOKEN = userToken;
    process.env.TEST_ADMIN_TOKEN = adminToken;
    process.env.TEST_ENV_READY = 'true';
    
    console.log('✅ Global test setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  }
}

async function verifyDatabaseConnection(databaseUrl: string): Promise<void> {
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });
    
    await prisma.$connect();
    console.log('✅ Database connection verified');
    await prisma.$disconnect();
  } catch (error) {
    throw new Error(`Database connection failed: ${error}`);
  }
}

async function verifyApiConnection(apiBaseUrl: string): Promise<void> {
  try {
    const response = await axios.get(`${apiBaseUrl}/health`, { timeout: 10000 });
    if (response.status !== 200) {
      throw new Error(`API health check failed with status: ${response.status}`);
    }
    console.log('✅ API connection verified');
  } catch (error) {
    throw new Error(`API connection failed: ${error}`);
  }
}

async function setupTestDatabase(databaseUrl: string): Promise<void> {
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });
    
    // Clean up any existing test data
    await cleanupTestData(prisma);
    
    // Create test data
    await createTestData(prisma);
    
    await prisma.$disconnect();
    console.log('✅ Test database setup completed');
  } catch (error) {
    throw new Error(`Test database setup failed: ${error}`);
  }
}

async function cleanupTestData(prisma: PrismaClient): Promise<void> {
  // Clean up test data in reverse dependency order
  const tables = [
    'ticket_activities',
    'tickets',
    'assets',
    'users',
    'organizations',
    'categories'
  ];
  
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE email LIKE '%@test.nova.com' OR name LIKE '%TEST%'`);
    } catch (error) {
      // Ignore errors for tables that might not exist
    }
  }
}

async function createTestData(prisma: PrismaClient): Promise<void> {
  // Create test organization
  const testOrg = await prisma.organization.upsert({
    where: { name: 'Nova Test Organization' },
    update: {},
    create: {
      name: 'Nova Test Organization',
      description: 'Test organization for UI testing',
      status: 'ACTIVE'
    }
  });
  
  // Create test categories
  const testCategory = await prisma.category.upsert({
    where: { name: 'Test Category' },
    update: {},
    create: {
      name: 'Test Category',
      description: 'Test category for UI testing',
      organizationId: testOrg.id,
      status: 'ACTIVE'
    }
  });
  
  console.log('✅ Test data created');
}

async function setupTestUsers(testEnv: TestEnvironment): Promise<{ userToken: string; adminToken: string }> {
  try {
    // Create test user account
    const userResponse = await axios.post(`${testEnv.apiBaseUrl}/auth/register`, {
      email: testEnv.testUser.email,
      password: testEnv.testUser.password,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER'
    });
    
    // Create test admin account
    const adminResponse = await axios.post(`${testEnv.apiBaseUrl}/auth/register`, {
      email: testEnv.testAdmin.email,
      password: testEnv.testAdmin.password,
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN'
    });
    
    // Login to get tokens
    const userLogin = await axios.post(`${testEnv.apiBaseUrl}/auth/login`, {
      email: testEnv.testUser.email,
      password: testEnv.testUser.password
    });
    
    const adminLogin = await axios.post(`${testEnv.apiBaseUrl}/auth/login`, {
      email: testEnv.testAdmin.email,
      password: testEnv.testAdmin.password
    });
    
    return {
      userToken: userLogin.data.token,
      adminToken: adminLogin.data.token
    };
  } catch (error) {
    // If registration fails, try to login with existing accounts
    try {
      const userLogin = await axios.post(`${testEnv.apiBaseUrl}/auth/login`, {
        email: testEnv.testUser.email,
        password: testEnv.testUser.password
      });
      
      const adminLogin = await axios.post(`${testEnv.apiBaseUrl}/auth/login`, {
        email: testEnv.testAdmin.email,
        password: testEnv.testAdmin.password
      });
      
      return {
        userToken: userLogin.data.token,
        adminToken: adminLogin.data.token
      };
    } catch (loginError) {
      throw new Error(`Failed to setup test users: ${error}`);
    }
  }
}

export default globalSetup;
