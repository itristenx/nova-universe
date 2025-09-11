import { test, expect } from '@playwright/test';

test.describe('Dashboard and ITSM Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should simulate successful login and show dashboard', async ({ page }) => {
    // Fill out login form
    const emailField = page.locator('[data-testid="email-input"]');
    const passwordField = page.locator('[data-testid="password-input"]');
    const submitButton = page.locator('[data-testid="login-submit"]');

    await emailField.fill('admin@nova.com');
    await passwordField.fill('password123');
    await submitButton.click();

    // Wait for navigation after login
    await page.waitForTimeout(1000);

    // Should now show dashboard content
    const dashboardHeading = page.locator('h1:has-text("Dashboard")');
    await expect(dashboardHeading).toBeVisible();
  });

  test('should have proper dashboard navigation', async ({ page }) => {
    // Login first
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForTimeout(1000);

    // Check for main navigation cards (now buttons)
    const ticketsCard = page.locator('button:has-text("Tickets")');
    const assetsCard = page.locator('button:has-text("Assets")');
    const knowledgeCard = page.locator('button:has-text("Knowledge")');
    const adminCard = page.locator('button:has-text("Administration")');

    await expect(ticketsCard).toBeVisible();
    await expect(assetsCard).toBeVisible();
    await expect(knowledgeCard).toBeVisible();
    await expect(adminCard).toBeVisible();
  });

  test('should have functional quick action buttons', async ({ page }) => {
    // Login first
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForTimeout(1000);

    // Check for quick action buttons
    const createTicketBtn = page.locator('button:has-text("Create Ticket")');
    const addAssetBtn = page.locator('button:has-text("Add Asset")');
    const viewReportsBtn = page.locator('button:has-text("View Reports")');

    await expect(createTicketBtn).toBeVisible();
    await expect(addAssetBtn).toBeVisible();
    await expect(viewReportsBtn).toBeVisible();

    // Test button interactions
    await createTicketBtn.hover();
    await addAssetBtn.hover();
    await viewReportsBtn.hover();

    // Buttons should be clickable
    await expect(createTicketBtn).toBeEnabled();
    await expect(addAssetBtn).toBeEnabled();
    await expect(viewReportsBtn).toBeEnabled();
  });

  test('should navigate to tickets page', async ({ page }) => {
    // Login first
    await page.locator('[data-testid="login-submit"]').click();
    await page.waitForTimeout(1000);

    // Click on tickets navigation
    const ticketsButton = page.locator('button:has-text("Tickets")');
    await ticketsButton.click();

    // Wait for navigation
    await page.waitForTimeout(1000);

    // Should show tickets page
    const ticketsHeading = page.locator('h1:has-text("Tickets")');
    await expect(ticketsHeading).toBeVisible();

    // Should have ticket management features
    const newTicketBtn = page.locator('button:has-text("New Ticket")');
    await expect(newTicketBtn).toBeVisible();

    // Should show sample tickets
    const ticketItems = page.locator('text=Sample Ticket');
    expect(await ticketItems.count()).toBeGreaterThan(0);
  });

  test('should have proper responsive design across all pages', async ({ page }) => {
    const pages = [
      { path: '/', name: 'Login' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/tickets', name: 'Tickets' }
    ];

    const viewports = [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 }
    ];

    for (const testPage of pages) {
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        
        await page.evaluate((path) => {
          if (path === '/') {
            // For login page, just reload
            window.location.reload();
          } else {
            // For other pages, login first then navigate
            if (window.testNavigate) {
              window.testNavigate(path);
            } else {
              // Fallback: simulate login then navigate
              const loginBtn = document.querySelector('[data-testid="login-submit"]');
              if (loginBtn) loginBtn.click();
              setTimeout(() => {
                window.history.pushState({}, '', path);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }, 100);
            }
          }
        }, testPage.path);
        
        await page.waitForTimeout(1000);

        // Check that main content is visible and not cut off
        const mainHeading = page.locator('h1').first();
        await expect(mainHeading).toBeVisible();

        const headingBox = await mainHeading.boundingBox();
        if (headingBox) {
          expect(headingBox.x).toBeGreaterThanOrEqual(0);
          expect(headingBox.y).toBeGreaterThanOrEqual(0);
          expect(headingBox.width).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should have proper color scheme and visual hierarchy', async ({ page }) => {
    // Test different pages for consistent styling
    const pages = ['/dashboard', '/tickets'];

    for (const pagePath of pages) {
      await page.evaluate((path) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, pagePath);
      
      await page.waitForTimeout(1000);

      // Check for proper heading hierarchy
      const h1 = page.locator('h1').first();
      const h2 = page.locator('h2').first();

      if (await h1.isVisible()) {
        const h1Styles = await h1.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            color: styles.color
          };
        });
        
        // Also check h2 styles if present
        if (await h2.isVisible()) {
          const h2Styles = await h2.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              color: styles.color
            };
          });
          
          console.log('H2 Styles detected:', h2Styles);
        }
        
        // H1 should have larger font size than body text
        expect(parseFloat(h1Styles.fontSize)).toBeGreaterThan(16);
      }

      // Check button styling consistency
      const buttons = page.locator('button[class*="bg-"]:not([class*="bg-transparent"])');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        const buttonStyles = await firstButton.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            borderRadius: styles.borderRadius,
            padding: styles.padding
          };
        });
        
        // Buttons with bg- classes should have proper styling (not default browser styles)
        expect(buttonStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
      }
    }
  });

  test('should handle keyboard navigation across all interactive elements', async ({ page }) => {
    // Test dashboard keyboard navigation
    await page.evaluate(() => {
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    await page.waitForTimeout(1000);

    let focusableElements = 0;
    
    // Tab through all elements and count focusable ones
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      if (await focusedElement.isVisible()) {
        focusableElements++;
        
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        const role = await focusedElement.getAttribute('role');
        
        // Should be interactive elements
        const isInteractive = 
          ['button', 'a', 'input', 'select', 'textarea'].includes(tagName) ||
          ['button', 'link', 'textbox'].includes(role || '');
        
        expect(isInteractive).toBeTruthy();
      }
    }

    // Should have multiple focusable elements
    expect(focusableElements).toBeGreaterThan(3);
  });

  test('should provide proper ARIA labels and accessibility features', async ({ page }) => {
    // Test various pages for accessibility
    const pages = ['/dashboard', '/tickets'];

    for (const pagePath of pages) {
      await page.evaluate((path) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, pagePath);
      
      await page.waitForTimeout(1000);

      // Check for landmark roles
      const nav = page.locator('nav, [role="navigation"]');
      if (await nav.count() > 0) {
        await expect(nav.first()).toBeVisible();
      }

      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);

      // Check for alt text on images if any
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const image = images.nth(i);
          const alt = await image.getAttribute('alt');
          expect(alt).toBeTruthy();
        }
      }

      // Check for form labels if any
      const inputs = page.locator('input');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          const id = await input.getAttribute('id');
          
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            await expect(label).toBeVisible();
          }
        }
      }
    }
  });
});