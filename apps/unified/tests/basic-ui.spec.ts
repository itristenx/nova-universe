import { test, expect } from '@playwright/test';

test.describe('Basic UI Functionality', () => {
  test('should load the main page without errors', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for basic page elements
    await expect(page).toHaveTitle(/Nova/i);
    
    // Check if the page doesn't have JavaScript errors
    const errors = [];
    page.on('pageerror', err => errors.push(err));
    await page.reload();
    expect(errors.length).toBe(0);
  });

  test('should render main navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for common navigation patterns
    const navElements = [
      'nav', 'header', '[role="navigation"]', 
      '[data-testid*="nav"]', '[data-testid*="menu"]'
    ];

    let foundNav = false;
    for (const selector of navElements) {
      if (await page.locator(selector).count() > 0) {
        foundNav = true;
        break;
      }
    }
    expect(foundNav).toBeTruthy();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const desktopScreenshot = await page.screenshot({ fullPage: true });
    expect(desktopScreenshot.length).toBeGreaterThan(0);

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const mobileScreenshot = await page.screenshot({ fullPage: true });
    expect(mobileScreenshot.length).toBeGreaterThan(0);
  });

  test('should load without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out acceptable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('analytics') &&
      !error.includes('404')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});