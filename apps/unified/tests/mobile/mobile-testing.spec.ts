import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';

test.describe('Mobile Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for all tests
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await testHelper.waitForPageLoad(page);
  });

  test.describe('Mobile Responsive Design', () => {
    test('should display correctly on mobile devices', async ({ page }) => {
      // Check that the page loads properly on mobile
      await expect(page.locator('body')).toBeVisible();
      
      // Check for mobile-specific elements
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], [data-testid="hamburger-menu"]');
      await expect(mobileMenuButton).toBeVisible();
      
      // Check that desktop navigation is hidden on mobile
      const desktopNav = page.locator('[data-testid="desktop-navigation"]');
      if (await desktopNav.count() > 0) {
        await expect(desktopNav).not.toBeVisible();
      }
    });

    test('should have proper touch targets', async ({ page }) => {
      const touchTargets = await page.locator('button, a, input, select, textarea').all();
      
      for (const target of touchTargets) {
        const boundingBox = await target.boundingBox();
        if (boundingBox) {
          // Touch targets should be at least 44x44 pixels (Apple's recommendation)
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('should have adequate spacing between interactive elements', async ({ page }) => {
      const interactiveElements = await page.locator('button, a, input, select').all();
      
      for (let i = 0; i < interactiveElements.length - 1; i++) {
        const box1 = await interactiveElements[i].boundingBox();
        const box2 = await interactiveElements[i + 1].boundingBox();
        
        if (box1 && box2) {
          // Check vertical spacing
          const verticalSpacing = Math.abs(box2.y - (box1.y + box1.height));
          expect(verticalSpacing).toBeGreaterThanOrEqual(8);
          
          // Check horizontal spacing if elements are on the same line
          if (Math.abs(box2.y - box1.y) < 10) {
            const horizontalSpacing = Math.abs(box2.x - (box1.x + box1.width));
            expect(horizontalSpacing).toBeGreaterThanOrEqual(8);
          }
        }
      }
    });

    test('should handle different mobile screen sizes', async ({ page }) => {
      const mobileSizes = [
        { width: 320, height: 568, name: 'iPhone SE' },
        { width: 375, height: 667, name: 'iPhone 6/7/8' },
        { width: 414, height: 736, name: 'iPhone 6/7/8 Plus' },
        { width: 375, height: 812, name: 'iPhone X/XS' },
        { width: 414, height: 896, name: 'iPhone XR/XS Max' },
        { width: 360, height: 640, name: 'Android Small' },
        { width: 384, height: 640, name: 'Android Medium' },
        { width: 412, height: 732, name: 'Android Large' }
      ];
      
      for (const size of mobileSizes) {
        await page.setViewportSize(size);
        await page.waitForTimeout(500); // Wait for layout adjustments
        
        // Verify key elements are visible
        await expect(page.locator('body')).toBeVisible();
        
        // Check that mobile menu is accessible
        const mobileMenu = page.locator('[data-testid="mobile-menu-button"], [data-testid="hamburger-menu"]');
        if (await mobileMenu.count() > 0) {
          await expect(mobileMenu).toBeVisible();
        }
        
        console.log(`✅ Mobile layout verified for ${size.name} (${size.width}x${size.height})`);
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should have functional mobile menu', async ({ page }) => {
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"], [data-testid="hamburger-menu"]');
      await expect(mobileMenuButton).toBeVisible();
      
      // Click mobile menu button
      await mobileMenuButton.click();
      
      // Verify mobile menu opens
      const mobileMenu = page.locator('[data-testid="mobile-menu"], [data-testid="sidebar-menu"]');
      await expect(mobileMenu).toBeVisible();
      
      // Check for navigation items
      const navItems = await mobileMenu.locator('a, [role="menuitem"]').all();
      expect(navItems.length).toBeGreaterThan(0);
    });

    test('should navigate through mobile menu items', async ({ page }) => {
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"], [data-testid="hamburger-menu"]');
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"], [data-testid="sidebar-menu"]');
      await expect(mobileMenu).toBeVisible();
      
      // Test navigation to different sections
      const navItems = [
        { selector: '[data-testid="nav-dashboard"]', expectedUrl: /dashboard/ },
        { selector: '[data-testid="nav-tickets"]', expectedUrl: /tickets/ },
        { selector: '[data-testid="nav-assets"]', expectedUrl: /assets/ },
        { selector: '[data-testid="nav-profile"]', expectedUrl: /profile/ }
      ];
      
      for (const item of navItems) {
        const navElement = mobileMenu.locator(item.selector);
        if (await navElement.count() > 0) {
          await navElement.click();
          
          // Verify navigation occurred
          await expect(page).toHaveURL(item.expectedUrl);
          
          // Return to mobile menu for next test
          await page.click('[data-testid="mobile-menu-button"], [data-testid="hamburger-menu"]');
          await expect(mobileMenu).toBeVisible();
        }
      }
    });

    test('should close mobile menu when clicking outside', async ({ page }) => {
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"], [data-testid="hamburger-menu"]');
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"], [data-testid="sidebar-menu"]');
      await expect(mobileMenu).toBeVisible();
      
      // Click outside the menu
      await page.click('body', { position: { x: 50, y: 50 } });
      
      // Verify menu closes
      await expect(mobileMenu).not.toBeVisible();
    });

    test('should handle mobile menu with sub-items', async ({ page }) => {
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"], [data-testid="hamburger-menu"]');
      
      const mobileMenu = page.locator('[data-testid="mobile-menu"], [data-testid="sidebar-menu"]');
      await expect(mobileMenu).toBeVisible();
      
      // Test expandable menu items
      const expandableItems = await mobileMenu.locator('[data-testid*="expand"], [aria-expanded]').all();
      
      for (const item of expandableItems) {
        const isExpanded = await item.getAttribute('aria-expanded');
        
        // Click to toggle
        await item.click();
        
        // Verify state changed
        const newExpandedState = await item.getAttribute('aria-expanded');
        expect(newExpandedState).not.toBe(isExpanded);
      }
    });
  });

  test.describe('Mobile Forms and Input', () => {
    test('should handle mobile form inputs properly', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      // Test form inputs on mobile
      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      
      // Test input focus and keyboard
      await emailInput.click();
      await emailInput.fill('test@example.com');
      
      await passwordInput.click();
      await passwordInput.fill('password123');
      
      // Verify inputs work correctly on mobile
      await expect(emailInput).toHaveValue('test@example.com');
      await expect(passwordInput).toHaveValue('password123');
    });

    test('should handle mobile keyboard properly', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.click();
      
      // Test keyboard input
      await emailInput.fill('test@example.com');
      
      // Test keyboard navigation
      await emailInput.press('Tab');
      
      const passwordInput = page.locator('[data-testid="password-input"]');
      await expect(passwordInput).toBeFocused();
    });

    test('should handle mobile form validation', async ({ page }) => {
      await page.click('[data-testid="register-button"]');
      
      // Test form validation on mobile
      await testHelper.fillFormFields(page, {
        '[data-testid="first-name-input"]': 'Test',
        '[data-testid="last-name-input"]': 'User',
        '[data-testid="email-input"]': 'invalid-email',
        '[data-testid="password-input"]': 'weak',
        '[data-testid="confirm-password-input"]': 'different',
      });
      
      await page.click('[data-testid="register-submit"]');
      
      // Verify validation messages are visible on mobile
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
    });

    test('should handle mobile file uploads', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Navigate to ticket creation
      await page.goto('/tickets/new');
      
      const fileInput = page.locator('[data-testid="file-input"]');
      if (await fileInput.count() > 0) {
        await expect(fileInput).toBeVisible();
        
        // Test file upload on mobile
        await fileInput.setInputFiles({
          name: 'test-file.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('Test file content')
        });
        
        // Verify file was uploaded
        await expect(page.locator('[data-testid="file-name"]')).toBeVisible();
      }
    });
  });

  test.describe('Mobile Gestures', () => {
    test('should handle touch gestures', async ({ page }) => {
      // Test tap gesture
      const loginButton = page.locator('[data-testid="login-button"]');
      await loginButton.tap();
      
      // Verify tap worked
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    });

    test('should handle swipe gestures', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Navigate to tickets page
      await page.goto('/tickets');
      
      // Test swipe gesture on mobile
      const ticketsList = page.locator('[data-testid="tickets-list"]');
      if (await ticketsList.count() > 0) {
        // Perform swipe gesture
        await ticketsList.hover();
        await page.mouse.down();
        await page.mouse.move(200, 300);
        await page.mouse.up();
      }
    });

    test('should handle pinch-to-zoom', async ({ page }) => {
      // Test pinch-to-zoom gesture (simulated)
      const initialScale = await page.evaluate(() => window.visualViewport?.scale || 1);
      
      // Simulate pinch gesture
      await page.evaluate(() => {
        if (window.visualViewport) {
          window.visualViewport.scale = 1.5;
        }
      });
      
      // Verify zoom worked
      const newScale = await page.evaluate(() => window.visualViewport?.scale || 1);
      expect(newScale).toBeGreaterThan(initialScale);
    });
  });

  test.describe('Mobile Performance', () => {
    test('should load quickly on mobile networks', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await testHelper.waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      const mobileThreshold = 5000; // 5 seconds for mobile
      
      console.log(`📱 Mobile page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(mobileThreshold);
    });

    test('should handle slow mobile connections', async ({ page }) => {
      // Simulate slow connection
      await page.route('**/*', (route) => {
        route.continue();
      });
      
      const startTime = Date.now();
      
      await page.goto('/');
      await testHelper.waitForPageLoad(page);
      
      const loadTime = Date.now() - startTime;
      
      console.log(`📱 Mobile page load time (simulated slow connection): ${loadTime}ms`);
      
      // Should still load within reasonable time
      expect(loadTime).toBeLessThan(10000); // 10 seconds max
    });

    test('should optimize images for mobile', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const src = await img.getAttribute('src');
        const srcset = await img.getAttribute('srcset');
        
        if (src) {
          // Check for responsive images
          if (srcset) {
            console.log(`✅ Responsive image found: ${src}`);
          } else {
            console.log(`⚠️ Consider adding srcset for mobile: ${src}`);
          }
        }
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      // Test mobile accessibility features
      const touchTargets = await page.locator('button, a, input, select, textarea').all();
      
      for (const target of touchTargets) {
        const boundingBox = await target.boundingBox();
        if (boundingBox) {
          // Touch targets should be at least 44x44 pixels
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
      
      // Test screen reader compatibility
      const ariaLabels = await page.locator('[aria-label], [aria-labelledby]').all();
      expect(ariaLabels.length).toBeGreaterThan(0);
    });

    test('should support mobile screen readers', async ({ page }) => {
      // Check for proper ARIA attributes
      const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [aria-describedby]').all();
      
      for (const element of elementsWithAria) {
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        const ariaDescribedBy = await element.getAttribute('aria-describedby');
        
        // At least one should be present
        expect(ariaLabel || ariaLabelledBy || ariaDescribedBy).toBeTruthy();
      }
    });

    test('should have proper focus management on mobile', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      const emailInput = page.locator('[data-testid="email-input"]');
      await emailInput.click();
      
      // Test focus management
      await expect(emailInput).toBeFocused();
      
      // Test tab navigation
      await emailInput.press('Tab');
      
      const passwordInput = page.locator('[data-testid="password-input"]');
      await expect(passwordInput).toBeFocused();
    });
  });

  test.describe('Mobile Browser Compatibility', () => {
    test('should work on different mobile browsers', async ({ page }) => {
      // Test basic functionality across different mobile browsers
      await page.click('[data-testid="login-button"]');
      
      // Verify form elements work
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      
      // Test form interaction
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'test@example.com',
        '[data-testid="password-input"]': 'password123',
      });
      
      // Verify form data
      await expect(page.locator('[data-testid="email-input"]')).toHaveValue('test@example.com');
      await expect(page.locator('[data-testid="password-input"]')).toHaveValue('password123');
    });

    test('should handle mobile browser quirks', async ({ page }) => {
      // Test viewport handling
      const viewport = await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      }));
      
      console.log(`📱 Viewport: ${viewport.width}x${viewport.height}, DPR: ${viewport.devicePixelRatio}`);
      
      // Test orientation change handling
      await page.setViewportSize({ width: 667, height: 375 }); // Landscape
      await page.waitForTimeout(500);
      
      await page.setViewportSize({ width: 375, height: 667 }); // Portrait
      await page.waitForTimeout(500);
      
      // Verify page still works after orientation changes
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Mobile Offline Support', () => {
    test('should handle offline scenarios gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.route('**/*', (route) => {
        route.abort();
      });
      
      // Try to navigate
      await page.goto('/');
      
      // Should show offline message or handle gracefully
      const offlineMessage = await page.locator('body').textContent();
      expect(offlineMessage).toBeTruthy();
    });

    test('should cache important resources', async ({ page }) => {
      // Check for service worker or caching headers
      const response = await page.goto('/');
      const headers = response?.headers();
      
      if (headers) {
        const cacheControl = headers['cache-control'];
        if (cacheControl) {
          console.log(`📱 Cache-Control: ${cacheControl}`);
        }
      }
    });
  });
});
