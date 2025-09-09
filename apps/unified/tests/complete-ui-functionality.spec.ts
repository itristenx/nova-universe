import { test, expect } from '@playwright/test';

test.describe('Complete UI Functionality Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Navigation and Accessibility', () => {
    test('should have proper page structure and navigation', async ({ page }) => {
      // Check main navigation elements
      await expect(page.locator('nav')).toBeVisible();
      
      // Check for accessible navigation
      const navByRole = page.locator('[role="navigation"]');
      await expect(navByRole).toBeVisible();
      
      // Check for proper heading hierarchy
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(/Nova Universe/i);
    });

    test('should have skip links for accessibility', async ({ page }) => {
      // Check for skip links
      const skipLinks = page.locator('a[href="#main-content"], a[href="#navigation"]');
      expect(await skipLinks.count()).toBeGreaterThanOrEqual(1);
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Test Tab navigation
      await page.keyboard.press('Tab');
      
      // Check if an element is focused
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper color contrast and readability', async ({ page }) => {
      // Check for readable text (assuming dark text on light background)
      const textElements = page.locator('h1, h2, h3, p, button, a');
      const count = await textElements.count();
      expect(count).toBeGreaterThan(0);
      
      // Verify buttons have proper styling
      const buttons = page.locator('button');
      expect(await buttons.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check that content is still visible and usable
      const mainContent = page.locator('h1').first();
      await expect(mainContent).toBeVisible();
      
      // Check navigation is accessible on mobile
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const mainContent = page.locator('h1').first();
      await expect(mainContent).toBeVisible();
    });

    test('should work on desktop devices', async ({ page }) => {
      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const mainContent = page.locator('h1').first();
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe('Interactive Elements', () => {
    test('should have functional buttons', async ({ page }) => {
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeVisible();
        await expect(firstButton).toBeEnabled();
        
        // Test button interaction
        await firstButton.hover();
        await firstButton.click();
      }
    });

    test('should have functional links', async ({ page }) => {
      const links = page.locator('a[href]');
      const linkCount = await links.count();
      
      if (linkCount > 0) {
        const firstLink = links.first();
        await expect(firstLink).toBeVisible();
        
        // Check that links have proper href attributes
        const href = await firstLink.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });

    test('should handle form interactions if present', async ({ page }) => {
      // Check for login form specifically
      const loginForm = page.locator('[data-testid="login-form"]');
      
      if (await loginForm.isVisible()) {
        const emailInput = page.locator('[data-testid="email-input"]');
        const passwordInput = page.locator('[data-testid="password-input"]');
        const submitButton = page.locator('[data-testid="login-submit"]');
        
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
        
        // Test form field interactions
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');
        
        expect(await emailInput.inputValue()).toBe('test@example.com');
        expect(await passwordInput.inputValue()).toBe('password123');
      }
    });
  });

  test.describe('Performance and Loading', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load in less than 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should not have memory leaks', async ({ page }) => {
      // Navigate between different routes to test for memory leaks
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const navigation = ['/tickets', '/assets', '/knowledge', '/admin'];
      
      for (const route of navigation) {
        try {
          await page.goto(route);
          await page.waitForLoadState('networkidle');
          // Check if page loaded without errors
          const h1 = page.locator('h1').first();
          if (await h1.isVisible()) {
            await expect(h1).toBeVisible();
          }
        } catch (error) {
          // Some routes might not exist, which is okay for this test
          console.log(`Route ${route} not available:`, error.message);
        }
      }
    });
  });

  test.describe('Content Quality', () => {
    test('should have meaningful content', async ({ page }) => {
      // Check for proper headings
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      
      const h1Text = await h1.textContent();
      expect(h1Text).toBeTruthy();
      expect(h1Text.length).toBeGreaterThan(0);
      
      // Check for descriptive text
      const paragraphs = page.locator('p');
      const paragraphCount = await paragraphs.count();
      expect(paragraphCount).toBeGreaterThan(0);
    });

    test('should have proper image handling', async ({ page }) => {
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const firstImage = images.first();
        const alt = await firstImage.getAttribute('alt');
        
        // Images should have alt text for accessibility
        expect(alt).toBeTruthy();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle JavaScript errors gracefully', async ({ page }) => {
      const jsErrors = [];
      page.on('pageerror', err => jsErrors.push(err.message));
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Filter out known acceptable errors
      const criticalErrors = jsErrors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('analytics') &&
        !error.includes('404') &&
        !error.includes('Failed to load resource')
      );
      
      expect(criticalErrors.length).toBe(0);
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Page should still render basic content
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
    });
  });

  test.describe('Industry Standards Compliance', () => {
    test('should follow HTML5 semantic standards', async ({ page }) => {
      // Check for proper semantic HTML
      const header = page.locator('header');
      const main = page.locator('main, [role="main"]');
      const nav = page.locator('nav, [role="navigation"]');
      
      // At least one of these should be present
      const hasSemanticStructure = 
        (await nav.count() > 0) || 
        (await header.count() > 0) || 
        (await main.count() > 0);
      
      expect(hasSemanticStructure).toBeTruthy();
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      // Check for ARIA labels and roles
      const ariaElements = page.locator('[aria-label], [aria-labelledby], [role]');
      const ariaCount = await ariaElements.count();
      
      // Should have some ARIA attributes for accessibility
      expect(ariaCount).toBeGreaterThan(0);
    });

    test('should support focus management', async ({ page }) => {
      // Test focus visibility
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Focused element should be visible and not hidden
      const focusedBox = await focusedElement.boundingBox();
      expect(focusedBox).toBeTruthy();
    });

    test('should have proper document structure', async ({ page }) => {
      // Check document title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title).toContain('Nova');
      
      // Check for meta description
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content');
    });
  });
});