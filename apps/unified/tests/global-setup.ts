import { chromium, FullConfig } from '@playwright/test';
import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config();

interface TestEnvironment {
  apiBaseUrl: string;
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
  browser?: {
    viewport: { width: number; height: number };
    screenshot: boolean;
    headless: boolean;
  };
}

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('🚀 Starting global test setup...');

  // Validate test configuration and browser settings
  const browserConfig = await setupBrowserEnvironment(config);

  const testEnv: TestEnvironment = {
    apiBaseUrl: process.env.TEST_API_URL || 'http://localhost:3000',
    testUser: {
      email: process.env.TEST_USER_EMAIL || 'testuser@nova.com',
      password: process.env.TEST_USER_PASSWORD || 'TestUser123!',
    },
    testAdmin: {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@nova.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin123!',
    },
    browser: browserConfig,
  };

  try {
    // 1. Verify API + DB connectivity via API health
    console.log('🔌 Verifying API connectivity (and DB via health)...');
    await verifyApiConnection(testEnv.apiBaseUrl);

    // 2. Create test users and get authentication tokens via API
    console.log('👤 Setting up test users...');
    const { userToken, adminToken } = await setupTestUsers(testEnv);

    // 3. Store test environment tokens
    process.env.TEST_USER_TOKEN = userToken;
    process.env.TEST_ADMIN_TOKEN = adminToken;
    process.env.TEST_ENV_READY = 'true';

    console.log('✅ Global test setup completed successfully!');
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    throw error;
  }
}

async function setupBrowserEnvironment(
  config: FullConfig,
): Promise<{ viewport: { width: number; height: number }; screenshot: boolean; headless: boolean }> {
  console.log('🌐 Setting up browser environment...');

  // Setup browser for screenshot capability on test failures
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Test browser functionality
  const page = await context.newPage();
  await page.goto('data:text/html,<h1>Browser Test</h1>');
  
  // Validate browser can take screenshots
  const screenshotBuffer = await page.screenshot();
  if (screenshotBuffer.length === 0) {
    throw new Error('Browser screenshot capability test failed');
  }

  await browser.close();

  const browserConfig = {
    viewport: { 
      width: config.projects?.[0]?.use?.viewport?.width || 1280, 
      height: config.projects?.[0]?.use?.viewport?.height || 720 
    },
    screenshot: config.projects?.[0]?.use?.screenshot !== 'off',
    headless: config.projects?.[0]?.use?.headless !== false,
  };

  console.log('✅ Browser environment setup completed:', browserConfig);
  return browserConfig;
}

async function verifyApiConnection(apiBaseUrl: string): Promise<void> {
  try {
    const response = await axios.get(`${apiBaseUrl}/health`, { timeout: 10000 });
    if (response.status !== 200) {
      throw new Error(`API health check failed with status: ${response.status}`);
    }
    // Optional: basic DB check if health includes checks
    if (response.data?.status !== 'healthy') {
      throw new Error(`API health reported non-healthy status: ${response.data?.status}`);
    }
    console.log('✅ API connection verified');
  } catch (error) {
    throw new Error(`API connection failed: ${error}`);
  }
}

async function setupTestUsers(
  testEnv: TestEnvironment,
): Promise<{ userToken: string; adminToken: string }> {
  try {
    // Create test user account
    const userResponse = await axios.post(`${testEnv.apiBaseUrl}/api/auth/register`, {
      email: testEnv.testUser.email,
      password: testEnv.testUser.password,
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    });

    // Validate user creation
    if (userResponse.status !== 201 && userResponse.status !== 200) {
      throw new Error(`User registration failed with status: ${userResponse.status}`);
    }
    console.log('✅ Test user created successfully');

    // Create test admin account
    const adminResponse = await axios.post(`${testEnv.apiBaseUrl}/api/auth/register`, {
      email: testEnv.testAdmin.email,
      password: testEnv.testAdmin.password,
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN',
    });

    // Validate admin creation
    if (adminResponse.status !== 201 && adminResponse.status !== 200) {
      throw new Error(`Admin registration failed with status: ${adminResponse.status}`);
    }
    console.log('✅ Test admin created successfully');

    // Login to get tokens
    const userLogin = await axios.post(`${testEnv.apiBaseUrl}/api/auth/login`, {
      email: testEnv.testUser.email,
      password: testEnv.testUser.password,
    });

    const adminLogin = await axios.post(`${testEnv.apiBaseUrl}/api/auth/login`, {
      email: testEnv.testAdmin.email,
      password: testEnv.testAdmin.password,
    });

    return {
      userToken: userLogin.data.token,
      adminToken: adminLogin.data.token,
    };
  } catch (error) {
    // If registration fails, try to login with existing accounts
    try {
      const userLogin = await axios.post(`${testEnv.apiBaseUrl}/api/auth/login`, {
        email: testEnv.testUser.email,
        password: testEnv.testUser.password,
      });

      const adminLogin = await axios.post(`${testEnv.apiBaseUrl}/api/auth/login`, {
        email: testEnv.testAdmin.email,
        password: testEnv.testAdmin.password,
      });

      return {
        userToken: userLogin.data.token,
        adminToken: adminLogin.data.token,
      };
    } catch (loginError) {
      console.error('❌ Authentication failed for existing test users:', {
        originalError: error instanceof Error ? error.message : error,
        loginError: loginError instanceof Error ? loginError.message : loginError,
      });
      throw new Error(`Failed to setup test users: Registration failed (${error}), Login also failed (${loginError})`);
    }
  }
}

export default globalSetup;
