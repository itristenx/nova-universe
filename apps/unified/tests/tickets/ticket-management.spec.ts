import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';

test.describe('Ticket Management System', () => {
  let testTicketData: any;

  test.beforeEach(async ({ page }) => {
    // Initialize test ticket data
    testTicketData = {
      title: `Test Ticket ${Date.now()}`,
      description: 'This is a test ticket for UI testing',
      priority: 'Medium',
      category: 'Test Category',
      status: 'Open',
      assignee: 'testuser@nova.com'
    };

    // Login before each test
    await page.goto('/');
    await page.click('[data-testid="login-button"]');
    await testHelper.fillFormFields(page, {
      '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
      '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
    });
    await page.click('[data-testid="login-submit"]');

    // Wait for login to complete
    await expect(page).toHaveURL(/.*dashboard/);
    await testHelper.waitForPageLoad(page);

    // Navigate to tickets page
    await page.click('[data-testid="nav-tickets"]');
    await expect(page).toHaveURL(/.*tickets/);
    await testHelper.waitForPageLoad(page);
  });

  test.describe('Ticket List View', () => {
    test('should display tickets table', async ({ page }) => {
      // Verify tickets table is visible
      await expect(page.locator('[data-testid="tickets-table"]')).toBeVisible();
      await expect(page.locator('[data-testid="tickets-header"]')).toBeVisible();
    });

    test('should display ticket columns', async ({ page }) => {
      const table = page.locator('[data-testid="tickets-table"]');

      // Verify table headers
      await expect(table.locator('th:has-text("ID")')).toBeVisible();
      await expect(table.locator('th:has-text("Title")')).toBeVisible();
      await expect(table.locator('th:has-text("Status")')).toBeVisible();
      await expect(table.locator('th:has-text("Priority")')).toBeVisible();
      await expect(table.locator('th:has-text("Assignee")')).toBeVisible();
      await expect(table.locator('th:has-text("Created")')).toBeVisible();
      await expect(table.locator('th:has-text("Actions")')).toBeVisible();
    });

    test('should display ticket data', async ({ page }) => {
      // Verify at least one ticket row is visible
      const ticketRows = page.locator('[data-testid="ticket-row"]');
      await expect(ticketRows.first()).toBeVisible();
    });

    test('should support pagination', async ({ page }) => {
      const pagination = page.locator('[data-testid="pagination"]');

      if (await pagination.isVisible()) {
        // Verify pagination controls
        await expect(pagination.locator('[data-testid="page-info"]')).toBeVisible();
        await expect(pagination.locator('[data-testid="prev-page"]')).toBeVisible();
        await expect(pagination.locator('[data-testid="next-page"]')).toBeVisible();

        // Test pagination navigation
        if (await pagination.locator('[data-testid="next-page"]').isEnabled()) {
          await pagination.locator('[data-testid="next-page"]').click();
          await page.waitForLoadState('networkidle');

          // Verify page changed
          const pageInfo = await pagination.locator('[data-testid="page-info"]').textContent();
          expect(pageInfo).toContain('2');
        }
      }
    });

    test('should support sorting', async ({ page }) => {
      const table = page.locator('[data-testid="tickets-table"]');

      // Click on title header to sort
      await table.locator('th:has-text("Title")').click();
      await page.waitForLoadState('networkidle');

      // Verify sort indicator
      await expect(table.locator('th:has-text("Title")')).toHaveClass(/sorted/);
    });

    test('should support filtering', async ({ page }) => {
      const filterPanel = page.locator('[data-testid="filter-panel"]');
      await expect(filterPanel).toBeVisible();

      // Test status filter
      const statusFilter = filterPanel.locator('[data-testid="status-filter"]');
      await statusFilter.click();
      await page.click('[data-testid="filter-option-open"]');

      // Verify filtered results
      await page.waitForLoadState('networkidle');
      const filteredRows = page.locator('[data-testid="ticket-row"]');
      await expect(filteredRows.first()).toBeVisible();
    });
  });

  test.describe('Creating Tickets', () => {
    test('should open new ticket form', async ({ page }) => {
      await page.click('[data-testid="new-ticket-button"]');

      // Verify ticket form is visible
      await expect(page.locator('[data-testid="ticket-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="form-title"]')).toContainText('New Ticket');
    });

    test('should display all required form fields', async ({ page }) => {
      await page.click('[data-testid="new-ticket-button"]');

      // Verify form fields
      await expect(page.locator('[data-testid="ticket-title-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-description-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-priority-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-category-select"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-assignee-select"]')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('[data-testid="new-ticket-button"]');

      // Try to submit empty form
      await page.click('[data-testid="submit-button"]');

      // Verify validation errors
      await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="description-error"]')).toBeVisible();
    });

    test('should successfully create a ticket', async ({ page }) => {
      await page.click('[data-testid="new-ticket-button"]');

      // Fill form with test data
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': testTicketData.title,
        '[data-testid="ticket-description-input"]': testTicketData.description,
        '[data-testid="ticket-priority-select"]': testTicketData.priority,
        '[data-testid="ticket-category-select"]': testTicketData.category,
      });

      // Submit form
      await page.click('[data-testid="submit-button"]');

      // Wait for API response
      await testHelper.waitForApiResponse(page, '/tickets', 201);

      // Verify success message
      await testHelper.verifyToast(page, 'Ticket created successfully', 'success');

      // Verify redirect to tickets list
      await expect(page).toHaveURL(/.*tickets/);

      // Verify ticket appears in list using test data
      await expect(page.locator(`text=${testTicketData.title}`)).toBeVisible();
    });

    test('should handle file attachments', async ({ page }) => {
      await page.click('[data-testid="new-ticket-button"]');

      // Fill basic form
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': `Test Ticket with Attachment ${Date.now()}`,
        '[data-testid="ticket-description-input"]': 'Test ticket with file attachment',
      });

      // Upload test file
      const fileInput = page.locator('[data-testid="file-upload"]');
      await fileInput.setInputFiles({
        name: 'test-file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('This is a test file for attachment testing'),
      });

      // Verify file is attached
      await expect(page.locator('[data-testid="attached-file"]')).toBeVisible();
      await expect(page.locator('[data-testid="attached-file"]')).toContainText('test-file.txt');
    });
  });

  test.describe('Viewing Tickets', () => {
    test('should open ticket details', async ({ page }) => {
      // Click on first ticket row
      const firstTicket = page.locator('[data-testid="ticket-row"]').first();
      await firstTicket.click();

      // Verify ticket details page
      await expect(page.locator('[data-testid="ticket-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-description"]')).toBeVisible();
    });

    test('should display ticket information', async ({ page }) => {
      // Open ticket details
      await page.locator('[data-testid="ticket-row"]').first().click();

      // Verify all ticket fields are displayed
      await expect(page.locator('[data-testid="ticket-id"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-status"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-priority"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-category"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-assignee"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-created"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-updated"]')).toBeVisible();
    });

    test('should display ticket history', async ({ page }) => {
      // Open ticket details
      await page.locator('[data-testid="ticket-row"]').first().click();

      // Verify ticket history
      await expect(page.locator('[data-testid="ticket-history"]')).toBeVisible();
      await expect(page.locator('[data-testid="history-timeline"]')).toBeVisible();
    });

    test('should display related assets', async ({ page }) => {
      // Open ticket details
      await page.locator('[data-testid="ticket-row"]').first().click();

      // Verify related assets section
      await expect(page.locator('[data-testid="related-assets"]')).toBeVisible();
    });
  });

  test.describe('Editing Tickets', () => {
    test('should open edit mode', async ({ page }) => {
      // Open ticket details
      await page.locator('[data-testid="ticket-row"]').first().click();

      // Click edit button
      await page.click('[data-testid="edit-ticket-button"]');

      // Verify edit form is visible
      await expect(page.locator('[data-testid="edit-ticket-form"]')).toBeVisible();
    });

    test('should update ticket information', async ({ page }) => {
      // Open ticket details and edit mode
      await page.locator('[data-testid="ticket-row"]').first().click();
      await page.click('[data-testid="edit-ticket-button"]');

      // Update ticket title
      const newTitle = `Updated Ticket ${Date.now()}`;
      await page.fill('[data-testid="ticket-title-input"]', newTitle);

      // Save changes
      await page.click('[data-testid="save-button"]');

      // Wait for API response
      await testHelper.waitForApiResponse(page, '/tickets', 200);

      // Verify success message
      await testHelper.verifyToast(page, 'Ticket updated successfully', 'success');

      // Verify title is updated
      await expect(page.locator('[data-testid="ticket-title"]')).toContainText(newTitle);
    });

    test('should change ticket status', async ({ page }) => {
      // Open ticket details and edit mode
      await page.locator('[data-testid="ticket-row"]').first().click();
      await page.click('[data-testid="edit-ticket-button"]');

      // Change status to In Progress
      await page.selectOption('[data-testid="ticket-status-select"]', 'IN_PROGRESS');

      // Save changes
      await page.click('[data-testid="save-button"]');

      // Wait for API response
      await testHelper.waitForApiResponse(page, '/tickets', 200);

      // Verify status is updated
      await expect(page.locator('[data-testid="ticket-status"]')).toContainText('In Progress');
    });
  });

  test.describe('Ticket Workflow', () => {
    test('should assign ticket to user', async ({ page }) => {
      // Open ticket details and edit mode
      await page.locator('[data-testid="ticket-row"]').first().click();
      await page.click('[data-testid="edit-ticket-button"]');

      // Assign ticket to current user
      const currentUser = process.env.TEST_USER_EMAIL || 'testuser@nova.com';
      await page.selectOption('[data-testid="ticket-assignee-select"]', currentUser);

      // Save changes
      await page.click('[data-testid="save-button"]');

      // Wait for API response
      await testHelper.waitForApiResponse(page, '/tickets', 200);

      // Verify assignee is updated
      await expect(page.locator('[data-testid="ticket-assignee"]')).toContainText(currentUser);
    });

    test('should add comments to ticket', async ({ page }) => {
      // Open ticket details
      await page.locator('[data-testid="ticket-row"]').first().click();

      // Add comment
      const commentText = `Test comment ${Date.now()}`;
      await page.fill('[data-testid="comment-input"]', commentText);
      await page.click('[data-testid="add-comment-button"]');

      // Wait for API response
      await testHelper.waitForApiResponse(page, '/comments', 201);

      // Verify comment is added
      await expect(page.locator(`text=${commentText}`)).toBeVisible();
    });

    test('should escalate ticket priority', async ({ page }) => {
      // Open ticket details and edit mode
      await page.locator('[data-testid="ticket-row"]').first().click();
      await page.click('[data-testid="edit-ticket-button"]');

      // Change priority to High
      await page.selectOption('[data-testid="ticket-priority-select"]', 'HIGH');

      // Save changes
      await page.click('[data-testid="save-button"]');

      // Wait for API response
      await testHelper.waitForApiResponse(page, '/tickets', 200);

      // Verify priority is updated
      await expect(page.locator('[data-testid="ticket-priority"]')).toContainText('High');
    });
  });

  test.describe('Ticket Search and Filtering', () => {
    test('should search tickets by title', async ({ page }) => {
      const searchInput = page.locator('[data-testid="ticket-search"]');
      await searchInput.fill('test');
      await searchInput.press('Enter');

      // Wait for search results
      await page.waitForLoadState('networkidle');

      // Verify search results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });

    test('should filter by multiple criteria', async ({ page }) => {
      const filterPanel = page.locator('[data-testid="filter-panel"]');

      // Apply multiple filters
      await filterPanel.locator('[data-testid="priority-filter"]').click();
      await page.click('[data-testid="filter-option-high"]');

      await filterPanel.locator('[data-testid="status-filter"]').click();
      await page.click('[data-testid="filter-option-open"]');

      // Apply filters
      await page.click('[data-testid="apply-filters"]');

      // Wait for filtered results
      await page.waitForLoadState('networkidle');

      // Verify filters are applied
      await expect(page.locator('[data-testid="active-filters"]')).toBeVisible();
    });
  });

  test.describe('Bulk Operations', () => {
    test('should select multiple tickets', async ({ page }) => {
      // Select first ticket
      await page.locator('[data-testid="ticket-checkbox"]').first().check();

      // Select second ticket
      await page.locator('[data-testid="ticket-checkbox"]').nth(1).check();

      // Verify bulk actions are visible
      await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
    });

    test('should bulk update ticket status', async ({ page }) => {
      // Select multiple tickets
      await page.locator('[data-testid="ticket-checkbox"]').first().check();
      await page.locator('[data-testid="ticket-checkbox"]').nth(1).check();

      // Click bulk update
      await page.click('[data-testid="bulk-update"]');

      // Select new status
      await page.selectOption('[data-testid="bulk-status-select"]', 'IN_PROGRESS');

      // Apply bulk update
      await page.click('[data-testid="apply-bulk-update"]');

      // Wait for API response
      await testHelper.waitForApiResponse(page, '/tickets/bulk-update', 200);

      // Verify success message
      await testHelper.verifyToast(page, 'Tickets updated successfully', 'success');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();

      // Test mobile navigation
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should meet accessibility standards', async ({ page }) => {
      await testHelper.verifyAccessibility(page);
    });
  });

  test.describe('Performance', () => {
    test('should load tickets list efficiently', async ({ page }) => {
      const startTime = Date.now();

      // Navigate to tickets page
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);

      const loadTime = Date.now() - startTime;

      // Tickets list should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
      console.log(`Tickets list loaded in ${loadTime}ms`);
    });
  });
});
