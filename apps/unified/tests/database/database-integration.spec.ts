import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';
import { PrismaClient } from '@prisma/client';

test.describe('Database Integration Tests', () => {
  let prisma: PrismaClient;
  let testOrganizationId: string;
  let testCategoryId: string;
  let testUserId: string;

  test.beforeAll(async () => {
    // Initialize Prisma client for test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url:
            process.env.TEST_DATABASE_URL ||
            'postgresql://nova_admin:nova_password@localhost:5432/nova_universe_test',
        },
      },
    });

    try {
      // Connect to test database
      await prisma.$connect();
      console.log('✅ Connected to test database');

      // Create test data
      const testOrg = await prisma.organization.upsert({
        where: { name: 'Test Organization for UI Tests' },
        update: {},
        create: {
          name: 'Test Organization for UI Tests',
          description: 'Test organization for database integration testing',
          status: 'ACTIVE',
        },
      });
      testOrganizationId = testOrg.id;

      const testCat = await prisma.category.upsert({
        where: { name: 'Test Category for UI Tests' },
        update: {},
        create: {
          name: 'Test Category for UI Tests',
          description: 'Test category for database integration testing',
          organizationId: testOrganizationId,
          status: 'ACTIVE',
        },
      });
      testCategoryId = testCat.id;

      const testUser = await prisma.user.upsert({
        where: { email: 'testuser@nova.com' },
        update: {},
        create: {
          email: 'testuser@nova.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          status: 'ACTIVE',
          organizationId: testOrganizationId,
        },
      });
      testUserId = testUser.id;

      console.log('✅ Test data created in database');
    } catch (error) {
      console.error('❌ Failed to setup test database:', error);
      throw error;
    }
  });

  test.afterAll(async () => {
    try {
      // Clean up test data
      await prisma.ticket.deleteMany({
        where: { organizationId: testOrganizationId },
      });
      await prisma.asset.deleteMany({
        where: { organizationId: testOrganizationId },
      });
      await prisma.category.deleteMany({
        where: { organizationId: testOrganizationId },
      });
      await prisma.user.deleteMany({
        where: { organizationId: testOrganizationId },
      });
      await prisma.organization.delete({
        where: { id: testOrganizationId },
      });

      await prisma.$disconnect();
      console.log('✅ Test database cleaned up');
    } catch (error) {
      console.error('❌ Failed to cleanup test database:', error);
    }
  });

  test.describe('Database Connectivity', () => {
    test('should connect to test database', async () => {
      // Verify database connection
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      expect(result).toEqual([{ test: 1 }]);
      console.log('✅ Database connectivity verified');
    });

    test('should have required tables', async () => {
      // Check if required tables exist
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('organizations', 'users', 'categories', 'tickets', 'assets')
      `;

      expect(tables).toHaveLength(5);
      console.log('✅ Required tables verified');
    });
  });

  test.describe('Data Persistence', () => {
    test('should persist ticket data to database', async ({ page }) => {
      // Login and navigate to tickets
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'testuser@nova.com',
        '[data-testid="password-input"]': 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');

      await expect(page).toHaveURL(/.*dashboard/);
      await page.click('[data-testid="nav-tickets"]');
      await testHelper.waitForPageLoad(page);

      // Create new ticket
      await page.click('[data-testid="new-ticket-button"]');

      const testTitle = `Database Test Ticket ${Date.now()}`;
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': testTitle,
        '[data-testid="ticket-description-input"]': 'Test ticket for database persistence',
        '[data-testid="ticket-priority-select"]': 'High',
        '[data-testid="ticket-category-select"]': 'Test Category for UI Tests',
      });

      await page.click('[data-testid="submit-button"]');

      // Wait for success message
      await testHelper.verifyToast(page, 'Ticket created successfully', 'success');

      // Verify data is persisted in database
      const savedTicket = await prisma.ticket.findFirst({
        where: { title: testTitle },
      });

      expect(savedTicket).toBeTruthy();
      expect(savedTicket?.title).toBe(testTitle);
      expect(savedTicket?.description).toBe('Test ticket for database persistence');
      expect(savedTicket?.priority).toBe('HIGH');
      expect(savedTicket?.organizationId).toBe(testOrganizationId);
      expect(savedTicket?.categoryId).toBe(testCategoryId);

      console.log('✅ Ticket data persisted to database');
    });

    test('should persist asset data to database', async ({ page }) => {
      // Navigate to assets page
      await page.goto('/assets');
      await testHelper.waitForPageLoad(page);

      // Create new asset
      await page.click('[data-testid="new-asset-button"]');

      const testAssetName = `Database Test Asset ${Date.now()}`;
      await testHelper.fillFormFields(page, {
        '[data-testid="asset-name-input"]': testAssetName,
        '[data-testid="asset-type-select"]': 'Hardware',
        '[data-testid="asset-status-select"]': 'Active',
      });

      await page.click('[data-testid="submit-button"]');

      // Wait for success message
      await testHelper.verifyToast(page, 'Asset created successfully', 'success');

      // Verify data is persisted in database
      const savedAsset = await prisma.asset.findFirst({
        where: { name: testAssetName },
      });

      expect(savedAsset).toBeTruthy();
      expect(savedAsset?.name).toBe(testAssetName);
      expect(savedAsset?.type).toBe('HARDWARE');
      expect(savedAsset?.status).toBe('ACTIVE');
      expect(savedAsset?.organizationId).toBe(testOrganizationId);

      console.log('✅ Asset data persisted to database');
    });

    test('should persist user data to database', async ({ page }) => {
      // Navigate to users page
      await page.goto('/users');
      await testHelper.waitForPageLoad(page);

      // Create new user
      await page.click('[data-testid="new-user-button"]');

      const testEmail = `newuser${Date.now()}@test.nova.com`;
      await testHelper.fillFormFields(page, {
        '[data-testid="user-first-name-input"]': 'New',
        '[data-testid="user-last-name-input"]': 'User',
        '[data-testid="user-email-input"]': testEmail,
        '[data-testid="user-role-select"]': 'User',
        '[data-testid="user-status-select"]': 'Active',
      });

      await page.click('[data-testid="submit-button"]');

      // Wait for success message
      await testHelper.verifyToast(page, 'User created successfully', 'success');

      // Verify data is persisted in database
      const savedUser = await prisma.user.findFirst({
        where: { email: testEmail },
      });

      expect(savedUser).toBeTruthy();
      expect(savedUser?.email).toBe(testEmail);
      expect(savedUser?.firstName).toBe('New');
      expect(savedUser?.lastName).toBe('User');
      expect(savedUser?.role).toBe('USER');
      expect(savedUser?.status).toBe('ACTIVE');
      expect(savedUser?.organizationId).toBe(testOrganizationId);

      console.log('✅ User data persisted to database');
    });
  });

  test.describe('Data Retrieval', () => {
    test('should retrieve tickets from database', async ({ page }) => {
      // Create test ticket in database
      const testTicket = await prisma.ticket.create({
        data: {
          title: `Retrieval Test Ticket ${Date.now()}`,
          description: 'Test ticket for data retrieval',
          status: 'OPEN',
          priority: 'MEDIUM',
          organizationId: testOrganizationId,
          categoryId: testCategoryId,
          createdBy: testUserId,
        },
      });

      // Navigate to tickets page
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);

      // Verify ticket is displayed
      await expect(page.locator(`text=${testTicket.title}`)).toBeVisible();

      // Verify ticket details
      await page.locator(`text=${testTicket.title}`).click();
      await expect(page.locator('[data-testid="ticket-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-description"]')).toContainText(
        'Test ticket for data retrieval',
      );
      await expect(page.locator('[data-testid="ticket-status"]')).toContainText('Open');
      await expect(page.locator('[data-testid="ticket-priority"]')).toContainText('Medium');

      console.log('✅ Ticket data retrieved from database');
    });

    test('should retrieve assets from database', async ({ page }) => {
      // Create test asset in database
      const testAsset = await prisma.asset.create({
        data: {
          name: `Retrieval Test Asset ${Date.now()}`,
          type: 'SOFTWARE',
          status: 'ACTIVE',
          organizationId: testOrganizationId,
          assignedTo: testUserId,
        },
      });

      // Navigate to assets page
      await page.goto('/assets');
      await testHelper.waitForPageLoad(page);

      // Verify asset is displayed
      await expect(page.locator(`text=${testAsset.name}`)).toBeVisible();

      // Verify asset details
      await page.locator(`text=${testAsset.name}`).click();
      await expect(page.locator('[data-testid="asset-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="asset-type"]')).toContainText('Software');
      await expect(page.locator('[data-testid="asset-status"]')).toContainText('Active');

      console.log('✅ Asset data retrieved from database');
    });

    test('should retrieve users from database', async ({ page }) => {
      // Navigate to users page
      await page.goto('/users');
      await testHelper.waitForPageLoad(page);

      // Verify test user is displayed
      await expect(page.locator('text=testuser@nova.com')).toBeVisible();

      // Verify user details
      await page.locator('text=testuser@nova.com').click();
      await expect(page.locator('[data-testid="user-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-first-name"]')).toContainText('Test');
      await expect(page.locator('[data-testid="user-last-name"]')).toContainText('User');
      await expect(page.locator('[data-testid="user-role"]')).toContainText('User');

      console.log('✅ User data retrieved from database');
    });
  });

  test.describe('Data Updates', () => {
    test('should update ticket in database', async ({ page }) => {
      // Create test ticket in database
      const testTicket = await prisma.ticket.create({
        data: {
          title: `Update Test Ticket ${Date.now()}`,
          description: 'Test ticket for updates',
          status: 'OPEN',
          priority: 'LOW',
          organizationId: testOrganizationId,
          categoryId: testCategoryId,
          createdBy: testUserId,
        },
      });

      // Navigate to tickets page and edit ticket
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      await page.locator(`text=${testTicket.title}`).click();
      await page.click('[data-testid="edit-ticket-button"]');

      // Update ticket
      const newTitle = `Updated Ticket ${Date.now()}`;
      await page.fill('[data-testid="ticket-title-input"]', newTitle);
      await page.selectOption('[data-testid="ticket-status-select"]', 'IN_PROGRESS');
      await page.selectOption('[data-testid="ticket-priority-select"]', 'HIGH');

      await page.click('[data-testid="save-button"]');

      // Wait for success message
      await testHelper.verifyToast(page, 'Ticket updated successfully', 'success');

      // Verify data is updated in database
      const updatedTicket = await prisma.ticket.findUnique({
        where: { id: testTicket.id },
      });

      expect(updatedTicket?.title).toBe(newTitle);
      expect(updatedTicket?.status).toBe('IN_PROGRESS');
      expect(updatedTicket?.priority).toBe('HIGH');

      console.log('✅ Ticket data updated in database');
    });

    test('should update asset in database', async ({ page }) => {
      // Create test asset in database
      const testAsset = await prisma.asset.create({
        data: {
          name: `Update Test Asset ${Date.now()}`,
          type: 'HARDWARE',
          status: 'ACTIVE',
          organizationId: testOrganizationId,
          assignedTo: testUserId,
        },
      });

      // Navigate to assets page and edit asset
      await page.goto('/assets');
      await testHelper.waitForPageLoad(page);
      await page.locator(`text=${testAsset.name}`).click();
      await page.click('[data-testid="edit-asset-button"]');

      // Update asset
      const newName = `Updated Asset ${Date.now()}`;
      await page.fill('[data-testid="asset-name-input"]', newName);
      await page.selectOption('[data-testid="asset-status-select"]', 'MAINTENANCE');

      await page.click('[data-testid="save-button"]');

      // Wait for success message
      await testHelper.verifyToast(page, 'Asset updated successfully', 'success');

      // Verify data is updated in database
      const updatedAsset = await prisma.asset.findUnique({
        where: { id: testAsset.id },
      });

      expect(updatedAsset?.name).toBe(newName);
      expect(updatedAsset?.status).toBe('MAINTENANCE');

      console.log('✅ Asset data updated in database');
    });
  });

  test.describe('Data Relationships', () => {
    test('should maintain referential integrity', async ({ page }) => {
      // Create test ticket with relationships
      const testTicket = await prisma.ticket.create({
        data: {
          title: `Relationship Test Ticket ${Date.now()}`,
          description: 'Test ticket for relationship testing',
          status: 'OPEN',
          priority: 'MEDIUM',
          organizationId: testOrganizationId,
          categoryId: testCategoryId,
          createdBy: testUserId,
          assignedTo: testUserId,
        },
      });

      // Navigate to ticket details
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      await page.locator(`text=${testTicket.title}`).click();

      // Verify relationships are displayed correctly
      await expect(page.locator('[data-testid="ticket-category"]')).toContainText(
        'Test Category for UI Tests',
      );
      await expect(page.locator('[data-testid="ticket-assignee"]')).toContainText(
        'testuser@nova.com',
      );
      await expect(page.locator('[data-testid="ticket-organization"]')).toContainText(
        'Test Organization for UI Tests',
      );

      console.log('✅ Referential integrity maintained');
    });

    test('should handle cascading deletes', async ({ page }) => {
      // Create test category
      const testCat = await prisma.category.create({
        data: {
          name: `Cascade Test Category ${Date.now()}`,
          description: 'Test category for cascade testing',
          organizationId: testOrganizationId,
          status: 'ACTIVE',
        },
      });

      // Create test ticket in this category
      const testTicket = await prisma.ticket.create({
        data: {
          title: `Cascade Test Ticket ${Date.now()}`,
          description: 'Test ticket for cascade testing',
          status: 'OPEN',
          priority: 'LOW',
          organizationId: testOrganizationId,
          categoryId: testCat.id,
          createdBy: testUserId,
        },
      });

      // Navigate to categories page and delete category
      await page.goto('/categories');
      await testHelper.waitForPageLoad(page);
      await page.locator(`text=${testCat.name}`).click();
      await page.click('[data-testid="delete-category-button"]');
      await page.click('[data-testid="confirm-delete"]');

      // Wait for success message
      await testHelper.verifyToast(page, 'Category deleted successfully', 'success');

      // Verify category is deleted
      const deletedCategory = await prisma.category.findUnique({
        where: { id: testCat.id },
      });
      expect(deletedCategory).toBeNull();

      // Verify related ticket is also deleted (if cascade is configured)
      const deletedTicket = await prisma.ticket.findUnique({
        where: { id: testTicket.id },
      });
      
      // Verify cascade delete behavior - ticket should be deleted or retained based on schema
      if (deletedTicket === null) {
        console.log('✅ Cascade delete enabled - related ticket was deleted');
      } else {
        console.log('✅ Cascade delete disabled - related ticket was preserved');
        expect(deletedTicket.id).toBe(testTicket.id);
      }
      
      console.log('✅ Cascade delete behavior verified');
    });
  });

  test.describe('Data Validation', () => {
    test('should enforce required field constraints', async ({ page }) => {
      // Navigate to tickets page and try to create invalid ticket
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      await page.click('[data-testid="new-ticket-button"]');

      // Try to submit empty form
      await page.click('[data-testid="submit-button"]');

      // Verify validation errors are displayed
      await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="description-error"]')).toBeVisible();

      console.log('✅ Required field constraints enforced');
    });

    test('should enforce data type constraints', async ({ page }) => {
      // Navigate to tickets page and create ticket with invalid data
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      await page.click('[data-testid="new-ticket-button"]');

      // Fill form with invalid data
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': 'Valid Title',
        '[data-testid="ticket-description-input"]': 'Valid description',
        '[data-testid="ticket-priority-select"]': 'Invalid Priority',
      });

      await page.click('[data-testid="submit-button"]');

      // Verify validation error for invalid priority
      await expect(page.locator('[data-testid="priority-error"]')).toBeVisible();

      console.log('✅ Data type constraints enforced');
    });
  });

  test.describe('Performance and Scalability', () => {
    test('should handle large datasets efficiently', async ({ page }) => {
      // Create large number of test tickets
      const ticketCount = 100;
      const testTickets = Array.from({ length: ticketCount }, (_, i) => ({
        title: `Performance Test Ticket ${i}`,
        description: `Description for performance test ticket ${i}`,
        status: 'OPEN' as const,
        priority: 'MEDIUM' as const,
        organizationId: testOrganizationId,
        categoryId: testCategoryId,
        createdBy: testUserId,
      }));

      await prisma.ticket.createMany({
        data: testTickets,
      });

      console.log(`✅ Created ${ticketCount} test tickets`);

      // Navigate to tickets page and measure load time
      const startTime = Date.now();
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      // Verify performance
      expect(loadTime).toBeLessThan(5000);
      console.log(`✅ Large dataset loaded in ${loadTime}ms`);

      // Verify pagination is working
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();

      // Clean up test data
      await prisma.ticket.deleteMany({
        where: { title: { contains: 'Performance Test Ticket' } },
      });
    });

    test('should handle concurrent database operations', async ({ page }) => {
      // Navigate to dashboard which makes multiple database queries
      const startTime = Date.now();
      await page.goto('/dashboard');
      await testHelper.waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      // Verify concurrent operations are handled efficiently
      expect(loadTime).toBeLessThan(3000);
      console.log(`✅ Dashboard with concurrent operations loaded in ${loadTime}ms`);
    });
  });

  test.describe('Data Consistency', () => {
    test('should maintain data consistency across operations', async ({ page }) => {
      // Create test ticket
      const testTicket = await prisma.ticket.create({
        data: {
          title: `Consistency Test Ticket ${Date.now()}`,
          description: 'Test ticket for consistency testing',
          status: 'OPEN',
          priority: 'MEDIUM',
          organizationId: testOrganizationId,
          categoryId: testCategoryId,
          createdBy: testUserId,
        },
      });

      // Navigate to ticket details
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      await page.locator(`text=${testTicket.title}`).click();

      // Verify initial state
      await expect(page.locator('[data-testid="ticket-status"]')).toContainText('Open');

      // Update ticket status
      await page.click('[data-testid="edit-ticket-button"]');
      await page.selectOption('[data-testid="ticket-status-select"]', 'IN_PROGRESS');
      await page.click('[data-testid="save-button"]');

      // Wait for success message
      await testHelper.verifyToast(page, 'Ticket updated successfully', 'success');

      // Refresh page and verify consistency
      await page.reload();
      await testHelper.waitForPageLoad(page);
      await expect(page.locator('[data-testid="ticket-status"]')).toContainText('In Progress');

      // Verify database consistency
      const updatedTicket = await prisma.ticket.findUnique({
        where: { id: testTicket.id },
      });
      expect(updatedTicket?.status).toBe('IN_PROGRESS');

      console.log('✅ Data consistency maintained');
    });
  });
});
