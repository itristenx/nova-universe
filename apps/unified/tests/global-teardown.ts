import { FullConfig } from '@playwright/test';
import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('🧹 Starting global test teardown...');
  console.log(`Test configuration: ${JSON.stringify({
    projects: config.projects?.length || 0,
    workers: config.workers || 1,
    timeout: config.timeout || 'default'
  })}`);

  try {
    const apiBaseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

    // 1. Attempt to clean up test users from API (best-effort)
    console.log('👤 Cleaning up test users...');
    await cleanupTestUsers(apiBaseUrl);

    // 2. Reset environment variables
    delete process.env.TEST_USER_TOKEN;
    delete process.env.TEST_ADMIN_TOKEN;
    delete process.env.TEST_ENV_READY;

    console.log('✅ Global test teardown completed successfully!');
  } catch (error) {
    console.error('❌ Global test teardown failed:', error);
    // Don't throw error during teardown to avoid masking test failures
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
        // Best-effort cleanup: if your API exposes an admin delete endpoint, call it here.
        // Otherwise, skip silently (tests should remain idempotent).
        await axios.delete(`${apiBaseUrl}/users/${encodeURIComponent(email)}`, {
          headers: {
            Authorization: `Bearer ${process.env.TEST_ADMIN_TOKEN}`,
          },
          timeout: 3000,
        }).then(() => console.log(`✅ Cleaned up user: ${email}`)).catch(() => {
          console.log(`ℹ️ Skipping delete for ${email} (endpoint may not exist)`);
        });
      } catch (error) {
        console.log(`⚠️ Could not clean up user ${email}: ${error}`);
      }
    }
  } catch (error) {
    console.error('❌ User cleanup failed:', error);
  }
}

export default globalTeardown;
