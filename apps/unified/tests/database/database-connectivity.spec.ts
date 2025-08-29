import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';
import { DatabaseTestHelper } from '../utils/database-test-helper';

test.describe('Database Connectivity and Integration Tests', () => {
  let dbHelper: DatabaseTestHelper;
  let authToken: string;

  test.beforeAll(async () => {
    dbHelper = new DatabaseTestHelper();
    
    // Test database connection
    await dbHelper.testConnection();
    
    // Get authentication token for API tests
    try {
      authToken = await testHelper.authenticateUser(
        process.env.TEST_USER_EMAIL || 'admin@nova.com',
        process.env.TEST_USER_PASSWORD || 'admin123'
      );
    } catch (error) {
      console.log('Could not authenticate user for API tests:', error);
    }
  });

  test.afterAll(async () => {
    await dbHelper.disconnect();
  });

  test.describe('Database Connection Validation', () => {
    test('should connect to database successfully', async () => {
      const isConnected = await dbHelper.testConnection();
      expect(isConnected).toBe(true);
    });

    test('should validate database schema exists', async () => {
      const tables = await dbHelper.getTableList();
      
      // Verify core tables exist
      const expectedTables = [
        'users', 'tickets', 'assets', 'organizations', 
        'categories', 'comments', 'attachments', 'audit_logs'
      ];
      
      for (const table of expectedTables) {
        expect(tables).toContain(table);
      }
    });

    test('should have proper database indexes', async () => {
      const indexes = await dbHelper.getIndexes();
      
      // Verify critical indexes exist for performance
      expect(indexes.some(idx => idx.table === 'tickets' && idx.column === 'status')).toBe(true);
      expect(indexes.some(idx => idx.table === 'tickets' && idx.column === 'priority')).toBe(true);
      expect(indexes.some(idx => idx.table === 'users' && idx.column === 'email')).toBe(true);
      expect(indexes.some(idx => idx.table === 'assets' && idx.column === 'status')).toBe(true);
    });

    test('should validate foreign key constraints', async () => {
      const constraints = await dbHelper.getForeignKeyConstraints();
      
      // Verify critical relationships
      expect(constraints.some(fk => 
        fk.table === 'tickets' && fk.referencedTable === 'users'
      )).toBe(true);
      expect(constraints.some(fk => 
        fk.table === 'tickets' && fk.referencedTable === 'categories'
      )).toBe(true);
      expect(constraints.some(fk => 
        fk.table === 'assets' && fk.referencedTable === 'organizations'
      )).toBe(true);
    });
  });

  test.describe('Data Integrity and CRUD Operations', () => {
    test('should create and retrieve user data', async () => {
      const testUser = {
        email: `test-${Date.now()}@nova.com`,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER',
        status: 'ACTIVE'
      };

      // Create user via database
      const userId = await dbHelper.createUser(testUser);
      expect(userId).toBeTruthy();

      // Retrieve user
      const retrievedUser = await dbHelper.getUserById(userId);
      expect(retrievedUser.email).toBe(testUser.email);
      expect(retrievedUser.firstName).toBe(testUser.firstName);

      // Cleanup
      await dbHelper.deleteUser(userId);
    });

    test('should create and manage ticket lifecycle', async () => {
      // Create test organization and category first
      const orgId = await dbHelper.createOrganization({
        name: `Test Org ${Date.now()}`,
        description: 'Test organization'
      });

      const categoryId = await dbHelper.createCategory({
        name: `Test Category ${Date.now()}`,
        description: 'Test category',
        organizationId: orgId
      });

      const testTicket = {
        title: `Test Ticket ${Date.now()}`,
        description: 'Test ticket description',
        priority: 'MEDIUM',
        status: 'OPEN',
        categoryId,
        organizationId: orgId
      };

      // Create ticket
      const ticketId = await dbHelper.createTicket(testTicket);
      expect(ticketId).toBeTruthy();

      // Update ticket status
      await dbHelper.updateTicketStatus(ticketId, 'IN_PROGRESS');
      const updatedTicket = await dbHelper.getTicketById(ticketId);
      expect(updatedTicket.status).toBe('IN_PROGRESS');

      // Add comment
      const commentId = await dbHelper.addTicketComment(ticketId, {
        content: 'Test comment',
        userId: updatedTicket.assigneeId || updatedTicket.reporterId
      });
      expect(commentId).toBeTruthy();

      // Cleanup
      await dbHelper.deleteTicket(ticketId);
      await dbHelper.deleteCategory(categoryId);
      await dbHelper.deleteOrganization(orgId);
    });

    test('should handle asset management', async () => {
      const orgId = await dbHelper.createOrganization({
        name: `Asset Test Org ${Date.now()}`,
        description: 'Test organization for assets'
      });

      const testAsset = {
        name: `Test Asset ${Date.now()}`,
        type: 'HARDWARE',
        status: 'ACTIVE',
        serialNumber: `SN-${Date.now()}`,
        organizationId: orgId
      };

      // Create asset
      const assetId = await dbHelper.createAsset(testAsset);
      expect(assetId).toBeTruthy();

      // Update asset status
      await dbHelper.updateAssetStatus(assetId, 'MAINTENANCE');
      const updatedAsset = await dbHelper.getAssetById(assetId);
      expect(updatedAsset.status).toBe('MAINTENANCE');

      // Cleanup
      await dbHelper.deleteAsset(assetId);
      await dbHelper.deleteOrganization(orgId);
    });
  });

  test.describe('Database Performance Tests', () => {
    test('should handle large dataset queries efficiently', async () => {
      const startTime = Date.now();
      
      // Query large dataset (assuming test data exists)
      const tickets = await dbHelper.getTicketsPaginated(1, 100);
      
      const queryTime = Date.now() - startTime;
      
      // Query should complete within reasonable time
      expect(queryTime).toBeLessThan(2000); // 2 seconds
      expect(tickets).toBeDefined();
      
      console.log(`Large dataset query completed in ${queryTime}ms`);
    });

    test('should handle concurrent operations', async () => {
      const orgId = await dbHelper.createOrganization({
        name: `Concurrent Test Org ${Date.now()}`,
        description: 'Test organization for concurrent operations'
      });

      // Create multiple tickets concurrently
      const ticketPromises = Array.from({ length: 10 }, (_, i) =>
        dbHelper.createTicket({
          title: `Concurrent Ticket ${i}`,
          description: `Test ticket ${i}`,
          priority: 'MEDIUM',
          status: 'OPEN',
          organizationId: orgId
        })
      );

      const startTime = Date.now();
      const ticketIds = await Promise.all(ticketPromises);
      const concurrentTime = Date.now() - startTime;

      expect(ticketIds.length).toBe(10);
      expect(ticketIds.every(id => id)).toBe(true);
      expect(concurrentTime).toBeLessThan(5000); // 5 seconds

      console.log(`Concurrent operations completed in ${concurrentTime}ms`);

      // Cleanup
      await Promise.all(ticketIds.map(id => dbHelper.deleteTicket(id)));
      await dbHelper.deleteOrganization(orgId);
    });
  });

  test.describe('Database Backup and Recovery', () => {
    test('should validate backup procedures', async () => {
      // Test backup creation (if backup utilities are available)
      const backupResult = await dbHelper.testBackupProcedure();
      expect(backupResult.success).toBe(true);
    });

    test('should validate data consistency after operations', async () => {
      // Create test data
      const orgId = await dbHelper.createOrganization({
        name: `Consistency Test Org ${Date.now()}`,
        description: 'Test organization for consistency checks'
      });

      const ticketId = await dbHelper.createTicket({
        title: 'Consistency Test Ticket',
        description: 'Test ticket for consistency',
        priority: 'HIGH',
        status: 'OPEN',
        organizationId: orgId
      });

      // Verify data consistency
      const organization = await dbHelper.getOrganizationById(orgId);
      const ticket = await dbHelper.getTicketById(ticketId);

      expect(ticket.organizationId).toBe(organization.id);
      expect(organization.id).toBe(orgId);

      // Check referential integrity
      const ticketCount = await dbHelper.getTicketCountByOrganization(orgId);
      expect(ticketCount).toBeGreaterThan(0);

      // Cleanup
      await dbHelper.deleteTicket(ticketId);
      await dbHelper.deleteOrganization(orgId);
    });
  });

  test.describe('UI-Database Integration', () => {
    test('should verify UI creates data in database', async ({ page }) => {
      // Skip if no auth token available
      test.skip(!authToken, 'No authentication token available');

      // Navigate to tickets page
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);

      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL(/.*dashboard/);

      // Navigate to tickets and create new ticket
      await page.click('[data-testid="nav-tickets"]');
      await page.click('[data-testid="new-ticket-button"]');

      const ticketTitle = `UI Test Ticket ${Date.now()}`;
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': ticketTitle,
        '[data-testid="ticket-description-input"]': 'Created via UI test',
      });

      await page.click('[data-testid="submit-button"]');
      await testHelper.verifyToast(page, 'Ticket created successfully', 'success');

      // Verify ticket was created in database
      const tickets = await dbHelper.getTicketsByTitle(ticketTitle);
      expect(tickets.length).toBeGreaterThan(0);
      expect(tickets[0].title).toBe(ticketTitle);

      // Cleanup
      await dbHelper.deleteTicket(tickets[0].id);
    });

    test('should verify database changes reflect in UI', async ({ page }) => {
      // Skip if no auth token available
      test.skip(!authToken, 'No authentication token available');

      // Create ticket directly in database
      const orgId = await dbHelper.createOrganization({
        name: `UI Sync Test Org ${Date.now()}`,
        description: 'Test organization for UI sync'
      });

      const ticketTitle = `DB Created Ticket ${Date.now()}`;
      const ticketId = await dbHelper.createTicket({
        title: ticketTitle,
        description: 'Created directly in database',
        priority: 'HIGH',
        status: 'OPEN',
        organizationId: orgId
      });

      // Navigate to UI and verify ticket appears
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      await page.click('[data-testid="nav-tickets"]');
      await testHelper.waitForPageLoad(page);

      // Search for the ticket
      await page.fill('[data-testid="search-input"]', ticketTitle);
      await page.press('[data-testid="search-input"]', 'Enter');

      // Verify ticket appears in UI
      await expect(page.locator(`text=${ticketTitle}`)).toBeVisible();

      // Cleanup
      await dbHelper.deleteTicket(ticketId);
      await dbHelper.deleteOrganization(orgId);
    });
  });

  test.describe('Database Security and Access Control', () => {
    test('should validate user access permissions', async () => {
      // Test user creation with different roles
      const adminUser = await dbHelper.createUser({
        email: `admin-${Date.now()}@nova.com`,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE'
      });

      const regularUser = await dbHelper.createUser({
        email: `user-${Date.now()}@nova.com`,
        firstName: 'Regular',
        lastName: 'User',
        role: 'USER',
        status: 'ACTIVE'
      });

      // Verify role-based access
      const adminUserData = await dbHelper.getUserById(adminUser);
      const regularUserData = await dbHelper.getUserById(regularUser);

      expect(adminUserData.role).toBe('ADMIN');
      expect(regularUserData.role).toBe('USER');

      // Cleanup
      await dbHelper.deleteUser(adminUser);
      await dbHelper.deleteUser(regularUser);
    });

    test('should validate data encryption and security', async () => {
      // Test sensitive data handling
      const user = await dbHelper.createUser({
        email: `security-test-${Date.now()}@nova.com`,
        firstName: 'Security',
        lastName: 'Test',
        role: 'USER',
        status: 'ACTIVE'
      });

      const userData = await dbHelper.getUserById(user);
      
      // Verify email is stored correctly (not encrypted in this case)
      expect(userData.email).toContain('@nova.com');
      
      // If passwords are stored, they should be hashed
      if (userData.password) {
        expect(userData.password).not.toContain('password');
        expect(userData.password.length).toBeGreaterThan(20); // Hashed passwords are longer
      }

      // Cleanup
      await dbHelper.deleteUser(user);
    });
  });
});