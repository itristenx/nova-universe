import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';

test.describe('End-to-End User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the home page
    await page.goto('/');
    await testHelper.waitForPageLoad(page);
  });

  test.describe('Complete Ticket Management Workflow', () => {
    test('should complete full ticket lifecycle from creation to resolution', async ({ page }) => {
      // Step 1: Login
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');
      await expect(page).toHaveURL(/.*dashboard/);

      // Step 2: Navigate to tickets section
      await page.click('[data-testid="nav-tickets"]');
      await testHelper.waitForPageLoad(page);
      await expect(page.locator('[data-testid="tickets-page"]')).toBeVisible();

      // Step 3: Create new ticket
      await page.click('[data-testid="new-ticket-button"]');
      await expect(page.locator('[data-testid="ticket-form"]')).toBeVisible();

      const ticketTitle = `E2E Test Ticket ${Date.now()}`;
      const ticketDescription = 'This is an end-to-end test ticket created via UI automation';

      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': ticketTitle,
        '[data-testid="ticket-description-input"]': ticketDescription,
      });

      // Set priority and category
      await page.selectOption('[data-testid="ticket-priority-select"]', 'HIGH');
      await page.selectOption('[data-testid="ticket-category-select"]', { index: 1 });

      // Submit ticket
      await page.click('[data-testid="submit-button"]');
      await testHelper.verifyToast(page, 'Ticket created successfully', 'success');

      // Step 4: Verify ticket appears in list
      await page.click('[data-testid="back-to-list"]');
      await testHelper.waitForPageLoad(page);
      await expect(page.locator(`text=${ticketTitle}`)).toBeVisible();

      // Step 5: Open ticket details
      await page.click(`text=${ticketTitle}`);
      await testHelper.waitForPageLoad(page);
      await expect(page.locator('[data-testid="ticket-details"]')).toBeVisible();
      await expect(page.locator(`text=${ticketTitle}`)).toBeVisible();
      await expect(page.locator(`text=${ticketDescription}`)).toBeVisible();

      // Step 6: Add comment to ticket
      const commentText = 'This is a test comment from E2E test';
      await page.fill('[data-testid="comment-input"]', commentText);
      await page.click('[data-testid="add-comment-button"]');
      await testHelper.verifyToast(page, 'Comment added successfully', 'success');
      await expect(page.locator(`text=${commentText}`)).toBeVisible();

      // Step 7: Update ticket status
      await page.selectOption('[data-testid="ticket-status-select"]', 'IN_PROGRESS');
      await page.click('[data-testid="update-status-button"]');
      await testHelper.verifyToast(page, 'Ticket updated successfully', 'success');

      // Step 8: Add attachment (if file upload is available)
      const fileInput = page.locator('[data-testid="file-upload-input"]');
      if (await fileInput.isVisible()) {
        // Create a test file
        const testFile = Buffer.from('This is a test file content for E2E testing');
        await fileInput.setInputFiles({
          name: 'test-file.txt',
          mimeType: 'text/plain',
          buffer: testFile,
        });
        await page.click('[data-testid="upload-file-button"]');
        await testHelper.verifyToast(page, 'File uploaded successfully', 'success');
      }

      // Step 9: Assign ticket to user
      const assigneeSelect = page.locator('[data-testid="assignee-select"]');
      if (await assigneeSelect.isVisible()) {
        await assigneeSelect.selectOption({ index: 1 });
        await page.click('[data-testid="assign-ticket-button"]');
        await testHelper.verifyToast(page, 'Ticket assigned successfully', 'success');
      }

      // Step 10: Resolve ticket
      await page.selectOption('[data-testid="ticket-status-select"]', 'RESOLVED');
      await page.fill('[data-testid="resolution-notes"]', 'Issue resolved via E2E test automation');
      await page.click('[data-testid="resolve-ticket-button"]');
      await testHelper.verifyToast(page, 'Ticket resolved successfully', 'success');

      // Step 11: Verify ticket status in list
      await page.click('[data-testid="back-to-list"]');
      await testHelper.waitForPageLoad(page);

      // Apply filter to show resolved tickets
      await page.selectOption('[data-testid="status-filter"]', 'RESOLVED');
      await page.click('[data-testid="apply-filter-button"]');
      await expect(page.locator(`text=${ticketTitle}`)).toBeVisible();

      console.log('✅ Complete ticket lifecycle workflow completed successfully');
    });

    test('should handle ticket escalation workflow', async ({ page }) => {
      // Login as regular user
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'user@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'user123',
      });
      await page.click('[data-testid="login-submit"]');

      // Create high priority ticket
      await page.click('[data-testid="nav-tickets"]');
      await page.click('[data-testid="new-ticket-button"]');

      const escalationTicketTitle = `Escalation Test ${Date.now()}`;
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': escalationTicketTitle,
        '[data-testid="ticket-description-input"]': 'Critical issue requiring escalation',
      });

      await page.selectOption('[data-testid="ticket-priority-select"]', 'CRITICAL');
      await page.click('[data-testid="submit-button"]');
      await testHelper.verifyToast(page, 'Ticket created successfully', 'success');

      // Open ticket and escalate
      await page.click(`text=${escalationTicketTitle}`);
      await page.click('[data-testid="escalate-button"]');

      // Fill escalation form
      await page.fill(
        '[data-testid="escalation-reason"]',
        'SLA breach - requires immediate attention',
      );
      await page.click('[data-testid="confirm-escalation"]');
      await testHelper.verifyToast(page, 'Ticket escalated successfully', 'success');

      // Verify escalation notification
      await expect(page.locator('[data-testid="escalation-badge"]')).toBeVisible();

      console.log('✅ Ticket escalation workflow completed successfully');
    });
  });

  test.describe('Asset Management Workflow', () => {
    test('should complete asset lifecycle from registration to retirement', async ({ page }) => {
      // Login as admin
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_ADMIN_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_ADMIN_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      // Navigate to assets
      await page.click('[data-testid="nav-assets"]');
      await testHelper.waitForPageLoad(page);

      // Create new asset
      await page.click('[data-testid="new-asset-button"]');
      await expect(page.locator('[data-testid="asset-form"]')).toBeVisible();

      const assetName = `E2E Test Asset ${Date.now()}`;
      await testHelper.fillFormFields(page, {
        '[data-testid="asset-name-input"]': assetName,
        '[data-testid="asset-model-input"]': 'Test Model',
        '[data-testid="asset-serial-input"]': `SN${Date.now()}`,
        '[data-testid="asset-location-input"]': 'Test Location',
      });

      await page.selectOption('[data-testid="asset-type-select"]', 'HARDWARE');
      await page.selectOption('[data-testid="asset-status-select"]', 'ACTIVE');

      await page.click('[data-testid="submit-button"]');
      await testHelper.verifyToast(page, 'Asset created successfully', 'success');

      // Verify asset in list
      await expect(page.locator(`text=${assetName}`)).toBeVisible();

      // Open asset details
      await page.click(`text=${assetName}`);
      await expect(page.locator('[data-testid="asset-details"]')).toBeVisible();

      // Update asset status to maintenance
      await page.selectOption('[data-testid="asset-status-select"]', 'MAINTENANCE');
      await page.click('[data-testid="update-asset-button"]');
      await testHelper.verifyToast(page, 'Asset updated successfully', 'success');

      // Add maintenance note
      await page.fill('[data-testid="maintenance-notes"]', 'Scheduled maintenance performed');
      await page.click('[data-testid="add-maintenance-note"]');
      await testHelper.verifyToast(page, 'Maintenance note added', 'success');

      // Return to active status
      await page.selectOption('[data-testid="asset-status-select"]', 'ACTIVE');
      await page.click('[data-testid="update-asset-button"]');

      // Assign asset to user
      const assigneeSelect = page.locator('[data-testid="asset-assignee-select"]');
      if (await assigneeSelect.isVisible()) {
        await assigneeSelect.selectOption({ index: 1 });
        await page.click('[data-testid="assign-asset-button"]');
        await testHelper.verifyToast(page, 'Asset assigned successfully', 'success');
      }

      // Retire asset
      await page.selectOption('[data-testid="asset-status-select"]', 'RETIRED');
      await page.fill('[data-testid="retirement-reason"]', 'End of life cycle');
      await page.click('[data-testid="retire-asset-button"]');
      await testHelper.verifyToast(page, 'Asset retired successfully', 'success');

      console.log('✅ Complete asset lifecycle workflow completed successfully');
    });
  });

  test.describe('User Management Workflow', () => {
    test('should manage user accounts and permissions', async ({ page }) => {
      // Login as admin
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_ADMIN_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_ADMIN_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      // Navigate to user management
      await page.click('[data-testid="nav-users"]');
      await testHelper.waitForPageLoad(page);

      // Create new user
      await page.click('[data-testid="new-user-button"]');
      await expect(page.locator('[data-testid="user-form"]')).toBeVisible();

      const userEmail = `testuser${Date.now()}@nova.com`;
      await testHelper.fillFormFields(page, {
        '[data-testid="user-email-input"]': userEmail,
        '[data-testid="user-first-name-input"]': 'Test',
        '[data-testid="user-last-name-input"]': 'User',
      });

      await page.selectOption('[data-testid="user-role-select"]', 'USER');
      await page.click('[data-testid="submit-button"]');
      await testHelper.verifyToast(page, 'User created successfully', 'success');

      // Verify user in list
      await expect(page.locator(`text=${userEmail}`)).toBeVisible();

      // Edit user permissions
      await page.click(`[data-testid="edit-user-${userEmail}"]`);
      await page.selectOption('[data-testid="user-role-select"]', 'TECHNICIAN');
      await page.click('[data-testid="update-user-button"]');
      await testHelper.verifyToast(page, 'User updated successfully', 'success');

      // Deactivate user
      await page.click('[data-testid="deactivate-user-button"]');
      await page.click('[data-testid="confirm-deactivation"]');
      await testHelper.verifyToast(page, 'User deactivated successfully', 'success');

      console.log('✅ User management workflow completed successfully');
    });
  });

  test.describe('Search and Filtering Workflow', () => {
    test('should perform comprehensive search across all modules', async ({ page }) => {
      // Login
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      // Test global search from dashboard
      await page.fill('[data-testid="global-search"]', 'test');
      await page.press('[data-testid="global-search"]', 'Enter');
      await testHelper.waitForPageLoad(page);

      // Verify search results page
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="search-results-count"]')).toBeVisible();

      // Test advanced filtering in tickets
      await page.click('[data-testid="nav-tickets"]');
      await page.click('[data-testid="advanced-filter-button"]');

      // Apply multiple filters
      await page.selectOption('[data-testid="status-filter"]', 'OPEN');
      await page.selectOption('[data-testid="priority-filter"]', 'HIGH');
      await page.fill('[data-testid="date-from-filter"]', '2024-01-01');
      await page.click('[data-testid="apply-filters-button"]');

      await testHelper.waitForPageLoad(page);
      await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();

      // Test sorting
      await page.click('[data-testid="sort-by-priority"]');
      await testHelper.waitForPageLoad(page);

      // Test search within filtered results
      await page.fill('[data-testid="search-input"]', 'urgent');
      await page.press('[data-testid="search-input"]', 'Enter');
      await testHelper.waitForPageLoad(page);

      console.log('✅ Search and filtering workflow completed successfully');
    });
  });

  test.describe('Mobile and Responsive Workflow', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Login on mobile
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      // Verify mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      // Navigate to tickets on mobile
      await page.click('[data-testid="mobile-nav-tickets"]');
      await testHelper.waitForPageLoad(page);

      // Create ticket on mobile
      await page.click('[data-testid="mobile-new-ticket-button"]');
      await expect(page.locator('[data-testid="mobile-ticket-form"]')).toBeVisible();

      const mobileTicketTitle = `Mobile Test Ticket ${Date.now()}`;
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': mobileTicketTitle,
        '[data-testid="ticket-description-input"]': 'Created on mobile device',
      });

      await page.click('[data-testid="submit-button"]');
      await testHelper.verifyToast(page, 'Ticket created successfully', 'success');

      // Verify responsive design
      await testHelper.verifyResponsiveDesign(page);

      console.log('✅ Mobile and responsive workflow completed successfully');
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should handle concurrent user actions', async ({ page, context }) => {
      // Create multiple pages to simulate concurrent users
      const pages = await Promise.all([context.newPage(), context.newPage(), context.newPage()]);

      // Login all users concurrently
      const loginPromises = pages.map(async (userPage) => {
        await userPage.goto('/');
        await userPage.click('[data-testid="login-button"]');
        await testHelper.fillFormFields(userPage, {
          '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
          '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
        });
        await userPage.click('[data-testid="login-submit"]');
        return userPage;
      });

      await Promise.all(loginPromises);

      // Perform concurrent actions
      const actionPromises = pages.map(async (userPage, index) => {
        await userPage.click('[data-testid="nav-tickets"]');
        await userPage.click('[data-testid="new-ticket-button"]');

        await testHelper.fillFormFields(userPage, {
          '[data-testid="ticket-title-input"]': `Concurrent Ticket ${index} ${Date.now()}`,
          '[data-testid="ticket-description-input"]': `Created by concurrent user ${index}`,
        });

        await userPage.click('[data-testid="submit-button"]');
        return userPage;
      });

      const startTime = Date.now();
      await Promise.all(actionPromises);
      const concurrentTime = Date.now() - startTime;

      expect(concurrentTime).toBeLessThan(10000); // Should complete within 10 seconds
      console.log(`✅ Concurrent operations completed in ${concurrentTime}ms`);

      // Close additional pages
      await Promise.all(pages.map((p) => p.close()));
    });

    test('should load large datasets efficiently', async ({ page }) => {
      // Login
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'admin@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'admin123',
      });
      await page.click('[data-testid="login-submit"]');

      // Navigate to tickets with large dataset
      const startTime = Date.now();
      await page.click('[data-testid="nav-tickets"]');
      await testHelper.waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      console.log(`✅ Large dataset loaded in ${loadTime}ms`);

      // Test pagination performance
      const paginationStartTime = Date.now();
      await page.click('[data-testid="next-page"]');
      await testHelper.waitForPageLoad(page);
      const paginationTime = Date.now() - paginationStartTime;

      expect(paginationTime).toBeLessThan(3000); // Pagination should be fast
      console.log(`✅ Pagination completed in ${paginationTime}ms`);
    });
  });
});
