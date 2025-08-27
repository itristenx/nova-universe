import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';
import axios from 'axios';

test.describe('API Integration Tests', () => {
  let apiBaseUrl: string;
  let authToken: string;

  test.beforeAll(async () => {
    apiBaseUrl = process.env.TEST_API_URL || 'http://localhost:3000';

    // Get authentication token
    try {
      const response = await axios.post(`${apiBaseUrl}/auth/login`, {
        email: process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        password: process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      authToken = response.data.token;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      throw error;
    }
  });

  test.describe('Authentication API', () => {
    test('should successfully authenticate user', async ({ page }) => {
      // Mock successful authentication
      await page.route('**/auth/login', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'test-jwt-token',
            user: {
              id: 'test-user-id',
              email: 'testuser@nova.com',
              role: 'USER',
            },
          }),
        }),
      );

      // Perform login
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'testuser@nova.com',
        '[data-testid="password-input"]': 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');

      // Verify successful login
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should handle authentication errors', async ({ page }) => {
      // Mock authentication failure
      await page.route('**/auth/login', (route) =>
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Invalid credentials',
          }),
        }),
      );

      // Perform login
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'invalid@example.com',
        '[data-testid="password-input"]': 'wrongpassword',
      });
      await page.click('[data-testid="login-submit"]');

      // Verify error handling
      await testHelper.verifyToast(page, 'Invalid credentials', 'error');
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/auth/login', (route) => route.abort());

      // Perform login
      await page.goto('/');
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'test@example.com',
        '[data-testid="password-input"]': 'password123',
      });
      await page.click('[data-testid="login-submit"]');

      // Verify error handling
      await testHelper.verifyToast(page, 'Network error', 'error');
    });
  });

  test.describe('Tickets API', () => {
    test('should fetch tickets list', async ({ page }) => {
      // Mock tickets API response
      const mockTickets = [
        {
          id: 'ticket-1',
          title: 'Test Ticket 1',
          description: 'Test description 1',
          status: 'OPEN',
          priority: 'MEDIUM',
          assignee: 'testuser@nova.com',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'ticket-2',
          title: 'Test Ticket 2',
          description: 'Test description 2',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignee: 'admin@nova.com',
          createdAt: new Date().toISOString(),
        },
      ];

      await page.route('**/tickets', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            tickets: mockTickets,
            total: 2,
            page: 1,
            limit: 10,
          }),
        }),
      );

      // Navigate to tickets page
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);

      // Verify tickets are displayed
      await expect(page.locator('text=Test Ticket 1')).toBeVisible();
      await expect(page.locator('text=Test Ticket 2')).toBeVisible();
    });

    test('should create new ticket via API', async ({ page }) => {
      // Mock ticket creation API
      await page.route('**/tickets', (route) =>
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-ticket-id',
            title: 'New Test Ticket',
            description: 'New test description',
            status: 'OPEN',
            priority: 'MEDIUM',
            message: 'Ticket created successfully',
          }),
        }),
      );

      // Navigate to tickets page and create ticket
      await page.goto('/tickets');
      await page.click('[data-testid="new-ticket-button"]');

      // Fill ticket form
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': 'New Test Ticket',
        '[data-testid="ticket-description-input"]': 'New test description',
        '[data-testid="ticket-priority-select"]': 'Medium',
      });

      // Submit form
      await page.click('[data-testid="submit-button"]');

      // Verify success message
      await testHelper.verifyToast(page, 'Ticket created successfully', 'success');
    });

    test('should update ticket via API', async ({ page }) => {
      // Mock ticket update API
      await page.route('**/tickets/*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'ticket-1',
            title: 'Updated Test Ticket',
            description: 'Updated description',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            message: 'Ticket updated successfully',
          }),
        }),
      );

      // Navigate to tickets page and edit ticket
      await page.goto('/tickets');
      await page.locator('[data-testid="ticket-row"]').first().click();
      await page.click('[data-testid="edit-ticket-button"]');

      // Update ticket
      await page.fill('[data-testid="ticket-title-input"]', 'Updated Test Ticket');
      await page.selectOption('[data-testid="ticket-status-select"]', 'IN_PROGRESS');

      // Save changes
      await page.click('[data-testid="save-button"]');

      // Verify success message
      await testHelper.verifyToast(page, 'Ticket updated successfully', 'success');
    });

    test('should handle API validation errors', async ({ page }) => {
      // Mock validation error response
      await page.route('**/tickets', (route) =>
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Validation failed',
            details: {
              title: 'Title is required',
              description: 'Description is required',
            },
          }),
        }),
      );

      // Navigate to tickets page and try to create invalid ticket
      await page.goto('/tickets');
      await page.click('[data-testid="new-ticket-button"]');

      // Submit empty form
      await page.click('[data-testid="submit-button"]');

      // Verify validation errors are displayed
      await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="description-error"]')).toBeVisible();
    });
  });

  test.describe('Assets API', () => {
    test('should fetch assets list', async ({ page }) => {
      // Mock assets API response
      const mockAssets = [
        {
          id: 'asset-1',
          name: 'Test Asset 1',
          type: 'HARDWARE',
          status: 'ACTIVE',
          location: 'Office A',
          assignedTo: 'testuser@nova.com',
        },
        {
          id: 'asset-2',
          name: 'Test Asset 2',
          type: 'SOFTWARE',
          status: 'ACTIVE',
          location: 'Office B',
          assignedTo: 'admin@nova.com',
        },
      ];

      await page.route('**/assets', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            assets: mockAssets,
            total: 2,
            page: 1,
            limit: 10,
          }),
        }),
      );

      // Navigate to assets page
      await page.goto('/assets');
      await testHelper.waitForPageLoad(page);

      // Verify assets are displayed
      await expect(page.locator('text=Test Asset 1')).toBeVisible();
      await expect(page.locator('text=Test Asset 2')).toBeVisible();
    });

    test('should create new asset via API', async ({ page }) => {
      // Mock asset creation API
      await page.route('**/assets', (route) =>
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-asset-id',
            name: 'New Test Asset',
            type: 'HARDWARE',
            status: 'ACTIVE',
            message: 'Asset created successfully',
          }),
        }),
      );

      // Navigate to assets page and create asset
      await page.goto('/assets');
      await page.click('[data-testid="new-asset-button"]');

      // Fill asset form
      await testHelper.fillFormFields(page, {
        '[data-testid="asset-name-input"]': 'New Test Asset',
        '[data-testid="asset-type-select"]': 'Hardware',
      });

      // Submit form
      await page.click('[data-testid="submit-button"]');

      // Verify success message
      await testHelper.verifyToast(page, 'Asset created successfully', 'success');
    });
  });

  test.describe('Users API', () => {
    test('should fetch users list', async ({ page }) => {
      // Mock users API response
      const mockUsers = [
        {
          id: 'user-1',
          email: 'testuser@nova.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
          status: 'ACTIVE',
        },
        {
          id: 'user-2',
          email: 'admin@nova.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      ];

      await page.route('**/users', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            users: mockUsers,
            total: 2,
            page: 1,
            limit: 10,
          }),
        }),
      );

      // Navigate to users page
      await page.goto('/users');
      await testHelper.waitForPageLoad(page);

      // Verify users are displayed
      await expect(page.locator('text=testuser@nova.com')).toBeVisible();
      await expect(page.locator('text=admin@nova.com')).toBeVisible();
    });
  });

  test.describe('Search API', () => {
    test('should perform global search', async ({ page }) => {
      // Mock search API response
      const mockSearchResults = {
        tickets: [{ id: 'ticket-1', title: 'Search Test Ticket', type: 'ticket' }],
        assets: [{ id: 'asset-1', name: 'Search Test Asset', type: 'asset' }],
        users: [{ id: 'user-1', email: 'search@nova.com', type: 'user' }],
      };

      await page.route('**/search?q=test', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockSearchResults),
        }),
      );

      // Navigate to dashboard and perform search
      await page.goto('/dashboard');
      const searchInput = page.locator('[data-testid="global-search"]');
      await searchInput.fill('test');
      await searchInput.press('Enter');

      // Verify search results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
      await expect(page.locator('text=Search Test Ticket')).toBeVisible();
      await expect(page.locator('text=Search Test Asset')).toBeVisible();
    });
  });

  test.describe('Notifications API', () => {
    test('should fetch user notifications', async ({ page }) => {
      // Mock notifications API response
      const mockNotifications = [
        {
          id: 'notif-1',
          title: 'Ticket Assigned',
          message: 'You have been assigned a new ticket',
          type: 'INFO',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'notif-2',
          title: 'System Update',
          message: 'System maintenance scheduled',
          type: 'WARNING',
          read: true,
          createdAt: new Date().toISOString(),
        },
      ];

      await page.route('**/notifications', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            notifications: mockNotifications,
            unreadCount: 1,
          }),
        }),
      );

      // Navigate to dashboard and open notifications
      await page.goto('/dashboard');
      await page.click('[data-testid="notifications-button"]');

      // Verify notifications are displayed
      await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible();
      await expect(page.locator('text=Ticket Assigned')).toBeVisible();
      await expect(page.locator('text=System Update')).toBeVisible();
    });

    test('should mark notification as read', async ({ page }) => {
      // Mock mark as read API
      await page.route('**/notifications/*/read', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Notification marked as read',
          }),
        }),
      );

      // Navigate to dashboard and open notifications
      await page.goto('/dashboard');
      await page.click('[data-testid="notifications-button"]');

      // Click on first notification to mark as read
      await page.locator('[data-testid="notification-item"]').first().click();

      // Verify notification is marked as read
      await expect(page.locator('[data-testid="notification-item"]').first()).toHaveClass(/read/);
    });
  });

  test.describe('Real-time Updates', () => {
    test('should receive real-time notifications', async ({ page }) => {
      // Mock WebSocket connection
      await page.route('**/ws', (route) =>
        route.fulfill({
          status: 101,
          body: 'WebSocket connection established',
        }),
      );

      // Navigate to dashboard
      await page.goto('/dashboard');
      await testHelper.waitForPageLoad(page);

      // Verify WebSocket connection is established
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('Connected');
    });

    test('should handle WebSocket disconnection', async ({ page }) => {
      // Mock WebSocket disconnection
      await page.route('**/ws', (route) => route.abort());

      // Navigate to dashboard
      await page.goto('/dashboard');
      await testHelper.waitForPageLoad(page);

      // Verify disconnection handling
      await expect(page.locator('[data-testid="connection-status"]')).toContainText('Disconnected');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      // Mock 404 response
      await page.route('**/nonexistent-endpoint', (route) =>
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Endpoint not found',
          }),
        }),
      );

      // Navigate to non-existent route
      await page.goto('/nonexistent-route');

      // Verify 404 page is displayed
      await expect(page.locator('[data-testid="error-404"]')).toBeVisible();
    });

    test('should handle 500 errors gracefully', async ({ page }) => {
      // Mock 500 response
      await page.route('**/tickets', (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal server error',
          }),
        }),
      );

      // Navigate to tickets page
      await page.goto('/tickets');

      // Verify error handling
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-message"]')).toContainText(
        'Internal server error',
      );
    });

    test('should handle rate limiting', async ({ page }) => {
      // Mock rate limit response
      await page.route('**/tickets', (route) =>
        route.fulfill({
          status: 429,
          contentType: 'application/json',
          headers: {
            'Retry-After': '60',
          },
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60,
          }),
        }),
      );

      // Navigate to tickets page
      await page.goto('/tickets');

      // Verify rate limit handling
      await expect(page.locator('[data-testid="rate-limit-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="rate-limit-message"]')).toContainText(
        'Rate limit exceeded',
      );
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should handle large datasets efficiently', async ({ page }) => {
      // Mock large dataset response
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `ticket-${i}`,
        title: `Test Ticket ${i}`,
        description: `Description for ticket ${i}`,
        status: 'OPEN',
        priority: 'MEDIUM',
      }));

      await page.route('**/tickets', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            tickets: largeDataset,
            total: 1000,
            page: 1,
            limit: 10,
          }),
        }),
      );

      // Navigate to tickets page
      const startTime = Date.now();
      await page.goto('/tickets');
      await testHelper.waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      // Verify performance
      expect(loadTime).toBeLessThan(3000);
      console.log(`Large dataset loaded in ${loadTime}ms`);

      // Verify pagination is working
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    });

    test('should handle concurrent API requests', async ({ page }) => {
      // Navigate to dashboard which makes multiple API calls
      const startTime = Date.now();
      await page.goto('/dashboard');
      await testHelper.waitForPageLoad(page);
      const loadTime = Date.now() - startTime;

      // Verify concurrent requests are handled efficiently
      expect(loadTime).toBeLessThan(5000);
      console.log(`Dashboard with concurrent requests loaded in ${loadTime}ms`);
    });
  });
});
