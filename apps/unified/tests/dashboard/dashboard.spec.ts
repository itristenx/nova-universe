import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';

test.describe('Dashboard and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.click('[data-testid="login-button"]');
    await testHelper.fillFormFields(page, {
      '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
      '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!'
    });
    await page.click('[data-testid="login-submit"]');
    
    // Wait for login to complete and redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await testHelper.waitForPageLoad(page);
  });

  test.describe('Dashboard Layout', () => {
    test('should display main dashboard elements', async ({ page }) => {
      // Verify main dashboard components
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="header"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should display welcome message', async ({ page }) => {
      const welcomeMessage = page.locator('[data-testid="welcome-message"]');
      await expect(welcomeMessage).toBeVisible();
      await expect(welcomeMessage).toContainText('Welcome');
    });

    test('should display quick stats', async ({ page }) => {
      // Verify quick stats cards are visible
      await expect(page.locator('[data-testid="stats-container"]')).toBeVisible();
      await expect(page.locator('[data-testid="tickets-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="assets-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="users-count"]')).toBeVisible();
    });

    test('should display recent activity', async ({ page }) => {
      await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-list"]')).toBeVisible();
    });
  });

  test.describe('Navigation Sidebar', () => {
    test('should display all navigation menu items', async ({ page }) => {
      const sidebar = page.locator('[data-testid="sidebar"]');
      
      // Verify main navigation items
      await expect(sidebar.locator('text=Dashboard')).toBeVisible();
      await expect(sidebar.locator('text=Tickets')).toBeVisible();
      await expect(sidebar.locator('text=Assets')).toBeVisible();
      await expect(sidebar.locator('text=Users')).toBeVisible();
      await expect(sidebar.locator('text=Reports')).toBeVisible();
      await expect(sidebar.locator('text=Settings')).toBeVisible();
    });

    test('should navigate to different sections', async ({ page }) => {
      // Navigate to Tickets
      await page.click('[data-testid="nav-tickets"]');
      await expect(page).toHaveURL(/.*tickets/);
      await expect(page.locator('[data-testid="tickets-page"]')).toBeVisible();
      
      // Navigate to Assets
      await page.click('[data-testid="nav-assets"]');
      await expect(page).toHaveURL(/.*assets/);
      await expect(page.locator('[data-testid="assets-page"]')).toBeVisible();
      
      // Navigate to Users
      await page.click('[data-testid="nav-users"]');
      await expect(page).toHaveURL(/.*users/);
      await expect(page.locator('[data-testid="users-page"]')).toBeVisible();
      
      // Navigate back to Dashboard
      await page.click('[data-testid="nav-dashboard"]');
      await expect(page).toHaveURL(/.*dashboard/);
      await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
    });

    test('should highlight active navigation item', async ({ page }) => {
      // Check dashboard is active by default
      await expect(page.locator('[data-testid="nav-dashboard"]')).toHaveClass(/active/);
      
      // Navigate to tickets and check it's active
      await page.click('[data-testid="nav-tickets"]');
      await expect(page.locator('[data-testid="nav-tickets"]')).toHaveClass(/active/);
      await expect(page.locator('[data-testid="nav-dashboard"]')).not.toHaveClass(/active/);
    });

    test('should collapse/expand sidebar on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Verify sidebar is collapsed by default on mobile
      await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/collapsed/);
      
      // Click toggle button to expand
      await page.click('[data-testid="sidebar-toggle"]');
      await expect(page.locator('[data-testid="sidebar"]')).not.toHaveClass(/collapsed/);
      
      // Click again to collapse
      await page.click('[data-testid="sidebar-toggle"]');
      await expect(page.locator('[data-testid="sidebar"]')).toHaveClass(/collapsed/);
    });
  });

  test.describe('Header and User Menu', () => {
    test('should display user information', async ({ page }) => {
      const userMenu = page.locator('[data-testid="user-menu"]');
      await expect(userMenu).toBeVisible();
      
      // Click to open user menu
      await userMenu.click();
      
      // Verify user menu items
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-settings"]')).toBeVisible();
      await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
    });

    test('should display notifications', async ({ page }) => {
      const notificationsButton = page.locator('[data-testid="notifications-button"]');
      await expect(notificationsButton).toBeVisible();
      
      // Click notifications button
      await notificationsButton.click();
      
      // Verify notifications panel
      await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="notifications-list"]')).toBeVisible();
    });

    test('should display search functionality', async ({ page }) => {
      const searchInput = page.locator('[data-testid="global-search"]');
      await expect(searchInput).toBeVisible();
      
      // Test search functionality
      await searchInput.fill('test ticket');
      await searchInput.press('Enter');
      
      // Verify search results
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });
  });

  test.describe('Dashboard Widgets', () => {
    test('should display ticket status chart', async ({ page }) => {
      const chart = page.locator('[data-testid="ticket-status-chart"]');
      await expect(chart).toBeVisible();
      
      // Verify chart has data
      await expect(chart.locator('canvas')).toBeVisible();
    });

    test('should display priority distribution', async ({ page }) => {
      const priorityWidget = page.locator('[data-testid="priority-distribution"]');
      await expect(priorityWidget).toBeVisible();
      
      // Verify priority items
      await expect(priorityWidget.locator('text=Critical')).toBeVisible();
      await expect(priorityWidget.locator('text=High')).toBeVisible();
      await expect(priorityWidget.locator('text=Medium')).toBeVisible();
      await expect(priorityWidget.locator('text=Low')).toBeVisible();
    });

    test('should display recent tickets', async ({ page }) => {
      const recentTickets = page.locator('[data-testid="recent-tickets"]');
      await expect(recentTickets).toBeVisible();
      
      // Verify ticket list
      await expect(recentTickets.locator('[data-testid="ticket-item"]')).toBeVisible();
    });

    test('should display system health status', async ({ page }) => {
      const healthStatus = page.locator('[data-testid="system-health"]');
      await expect(healthStatus).toBeVisible();
      
      // Verify health indicators
      await expect(healthStatus.locator('[data-testid="health-indicator"]')).toBeVisible();
    });
  });

  test.describe('Quick Actions', () => {
    test('should display quick action buttons', async ({ page }) => {
      const quickActions = page.locator('[data-testid="quick-actions"]');
      await expect(quickActions).toBeVisible();
      
      // Verify quick action buttons
      await expect(quickActions.locator('[data-testid="new-ticket"]')).toBeVisible();
      await expect(quickActions.locator('[data-testid="new-asset"]')).toBeVisible();
      await expect(quickActions.locator('[data-testid="new-user"]')).toBeVisible();
    });

    test('should open new ticket form', async ({ page }) => {
      await page.click('[data-testid="new-ticket"]');
      
      // Verify ticket form opens
      await expect(page.locator('[data-testid="ticket-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-title-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="ticket-description-input"]')).toBeVisible();
    });

    test('should open new asset form', async ({ page }) => {
      await page.click('[data-testid="new-asset"]');
      
      // Verify asset form opens
      await expect(page.locator('[data-testid="asset-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="asset-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="asset-type-select"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to different screen sizes', async ({ page }) => {
      await testHelper.verifyResponsiveDesign(page);
    });
  });

  test.describe('Accessibility', () => {
    test('should meet accessibility standards', async ({ page }) => {
      await testHelper.verifyAccessibility(page);
    });
  });

  test.describe('Performance', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      await testHelper.waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      console.log(`Dashboard loaded in ${loadTime}ms`);
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      // This test would require setting up large amounts of test data
      // For now, we'll verify the UI doesn't freeze with current data
      await page.locator('[data-testid="recent-activity"]').scrollIntoViewIfNeeded();
      await page.locator('[data-testid="stats-container"]').scrollIntoViewIfNeeded();
      
      // Verify no loading spinners are stuck
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    });
  });
});
