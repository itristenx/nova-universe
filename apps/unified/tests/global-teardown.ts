import { FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('🧹 Starting global test teardown...');

  try {
    const apiBaseUrl = process.env.TEST_API_URL || 'http://localhost:3000';
    const databaseUrl =
      process.env.TEST_DATABASE_URL ||
      'postgresql://nova_admin:nova_password@localhost:5432/nova_universe_test';

    // 1. Clean up test data from database
    console.log('🗄️ Cleaning up test database...');
    await cleanupTestDatabase(databaseUrl);

    // 2. Clean up test users from API
    console.log('👤 Cleaning up test users...');
    await cleanupTestUsers(apiBaseUrl);

    // 3. Reset environment variables
    delete process.env.TEST_USER_TOKEN;
    delete process.env.TEST_ADMIN_TOKEN;
    delete process.env.TEST_ENV_READY;

    console.log('✅ Global test teardown completed successfully!');
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't throw error during teardown to avoid masking test failures
  }
}

async function cleanupTestDatabase(databaseUrl: string): Promise<void> {
  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    // Clean up all test data
    const tables = [
      'ticket_activities',
      'tickets',
      'assets',
      'users',
      'organizations',
      'categories',
    ];

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(
          `DELETE FROM "${table}" WHERE email LIKE '%@test.nova.com' OR name LIKE '%TEST%'`,
        );
        console.log(`✅ Cleaned up ${table}`);
      } catch (error) {
        // Ignore errors for tables that might not exist
        console.log(`⚠️ Could not clean up ${table}: ${error}`);
      }
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  }
}

async function cleanupTestUsers(apiBaseUrl: string): Promise<void> {
  try {
    const testUsers = [
      process.env.TEST_USER_EMAIL || 'testuser@nova.com',
      process.env.TEST_ADMIN_EMAIL || 'admin@nova.com',
    ];

    for (const email of testUsers) {
      try {
        // Note: This assumes your API has a delete user endpoint
        // You might need to adjust this based on your actual API structure
        await axios.delete(`${apiBaseUrl}/users/${email}`, {
          headers: {
            Authorization: `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
          },
        });
        console.log(`✅ Cleaned up user: ${email}`);
      } catch (error) {
        console.log(`⚠️ Could not clean up user ${email}: ${error}`);
      }
    }
  } catch (error) {
    console.error('❌ User cleanup failed:', error);
  }
}

export default globalTeardown;
