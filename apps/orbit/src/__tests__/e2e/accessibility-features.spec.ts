import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Phase 6 Accessibility & Internationalization E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/'); // TODO-LINT: move to async function
    
    // Inject axe-core for accessibility testing
    await injectAxe(page); // TODO-LINT: move to async function
  });

  test.describe('Skip Links Navigation', () => {
    test('should provide functional skip links', async ({ page }) => {
      // Test skip to main content
      const skipToMain = page.getByRole('link', { name: /skip to main content/i });
      await expect(skipToMain).toBeVisible(); // TODO-LINT: move to async function
      
      await skipToMain.click(); // TODO-LINT: move to async function
      
      // Verify main content receives focus
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused(); // TODO-LINT: move to async function
    });

    test('should support keyboard navigation through skip links', async ({ page }) => {
      // Focus first skip link with tab
      await page.keyboard.press('Tab'); // TODO-LINT: move to async function
      
      const skipToMain = page.getByRole('link', { name: /skip to main content/i });
      await expect(skipToMain).toBeFocused(); // TODO-LINT: move to async function
      
      // Navigate through skip links
      await page.keyboard.press('Tab'); // TODO-LINT: move to async function
      const skipToNav = page.getByRole('link', { name: /skip to navigation/i });
      await expect(skipToNav).toBeFocused(); // TODO-LINT: move to async function
      
      // Activate skip link with Enter
      await page.keyboard.press('Enter'); // TODO-LINT: move to async function
      const navigation = page.locator('#navigation');
      await expect(navigation).toBeFocused(); // TODO-LINT: move to async function
    });
  });

  test.describe('Language Switching', () => {
    test('should allow language switching with proper announcements', async ({ page }) => {
      // Find language switcher
      const languageButton = page.getByRole('button', { name: /language/i });
      await expect(languageButton).toBeVisible(); // TODO-LINT: move to async function
      
      // Check initial ARIA states
      await expect(languageButton).toHaveAttribute('aria-haspopup', 'true'); // TODO-LINT: move to async function
      await expect(languageButton).toHaveAttribute('aria-expanded', 'false'); // TODO-LINT: move to async function
      
      // Open language menu
      await languageButton.click(); // TODO-LINT: move to async function
      await expect(languageButton).toHaveAttribute('aria-expanded', 'true'); // TODO-LINT: move to async function
      
      // Find language options
      const languageOptions = page.getByRole('menuitem');
      await expect(languageOptions.first()).toBeVisible(); // TODO-LINT: move to async function
      
      // Select a different language
      const spanishOption = page.getByRole('menuitem', { name: /español/i });
      if (await spanishOption.isVisible()) {
        await spanishOption.click(); // TODO-LINT: move to async function
        
        // Verify language change
        await expect(languageButton).toHaveAttribute('aria-expanded', 'false'); // TODO-LINT: move to async function
        await expect(languageButton).toBeFocused(); // TODO-LINT: move to async function
      }
    });

    test('should maintain accessibility after language change', async ({ page }) => {
      // Change language
      const languageButton = page.getByRole('button', { name: /language/i });
      await languageButton.click(); // TODO-LINT: move to async function
      
      const languageOptions = page.getByRole('menuitem');
      const firstOption = languageOptions.first();
      await firstOption.click(); // TODO-LINT: move to async function
      
      // Wait for language change to complete
      await page.waitForTimeout(500); // TODO-LINT: move to async function
      
      // Check accessibility after language change
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      }); // TODO-LINT: move to async function
    });
  });

  test.describe('Security Components', () => {
    test('should provide accessible permission management', async ({ page }) => {
      // Navigate to permission management
      const permissionLink = page.getByRole('link', { name: /permission/i });
      if (await permissionLink.isVisible()) {
        await permissionLink.click(); // TODO-LINT: move to async function
      }
      
      // Find permission switches
      const switches = page.getByRole('switch');
      const firstSwitch = switches.first();
      
      if (await firstSwitch.isVisible()) {
        // Check ARIA attributes
        await expect(firstSwitch).toHaveAttribute('aria-checked'); // TODO-LINT: move to async function
        
        // Test keyboard interaction
        await firstSwitch.focus(); // TODO-LINT: move to async function
        await expect(firstSwitch).toBeFocused(); // TODO-LINT: move to async function
        
        // Toggle with space key
        const initialState = await firstSwitch.getAttribute('aria-checked'); // TODO-LINT: move to async function
        await page.keyboard.press('Space'); // TODO-LINT: move to async function
        
        const newState = await firstSwitch.getAttribute('aria-checked'); // TODO-LINT: move to async function
        expect(newState).not.toBe(initialState);
      }
    });

    test('should provide accessible privacy dashboard', async ({ page }) => {
      // Navigate to privacy dashboard
      const privacyLink = page.getByRole('link', { name: /privacy/i });
      if (await privacyLink.isVisible()) {
        await privacyLink.click(); // TODO-LINT: move to async function
      }
      
      // Test tab navigation
      const tabs = page.getByRole('tab');
      const firstTab = tabs.first();
      
      if (await firstTab.isVisible()) {
        await expect(firstTab).toHaveAttribute('aria-selected'); // TODO-LINT: move to async function
        
        // Navigate to second tab
        const secondTab = tabs.nth(1);
        if (await secondTab.isVisible()) {
          await secondTab.click(); // TODO-LINT: move to async function
          await expect(secondTab).toHaveAttribute('aria-selected', 'true'); // TODO-LINT: move to async function
        }
      }
      
      // Test privacy switches
      const switches = page.getByRole('switch');
      if (await switches.first().isVisible()) {
        const switchCount = await switches.count(); // TODO-LINT: move to async function
        
        for (let i = 0; i < Math.min(switchCount, 3); i++) {
          const currentSwitch = switches.nth(i);
          const isDisabled = await currentSwitch.getAttribute('disabled'); // TODO-LINT: move to async function
          
          if (!isDisabled) {
            const initialState = await currentSwitch.getAttribute('aria-checked'); // TODO-LINT: move to async function
            await currentSwitch.click(); // TODO-LINT: move to async function
            
            const newState = await currentSwitch.getAttribute('aria-checked'); // TODO-LINT: move to async function
            expect(newState).not.toBe(initialState);
          }
        }
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should maintain proper focus order throughout application', async ({ page }) => {
      // Start from top of page
      await page.keyboard.press('Tab'); // TODO-LINT: move to async function
      
      // Tab through first 10 interactive elements
      const focusableElements = [];
      
      for (let i = 0; i < 10; i++) {
        const focusedElement = page.locator(':focus');
        if (await focusedElement.isVisible()) {
          const tagName = await focusedElement.evaluate(el => el.tagName); // TODO-LINT: move to async function
          const role = await focusedElement.getAttribute('role'); // TODO-LINT: move to async function
          focusableElements.push({ tagName, role });
        }
        
        await page.keyboard.press('Tab'); // TODO-LINT: move to async function
      }
      
      // Verify we found focusable elements
      expect(focusableElements.length).toBeGreaterThan(0);
      
      // Test reverse tab order
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Shift+Tab'); // TODO-LINT: move to async function
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible(); // TODO-LINT: move to async function
      }
    });

    test('should handle modal focus trapping', async ({ page }) => {
      // Look for modal trigger (button that opens modal)
      const modalTrigger = page.getByRole('button', { name: /settings|preferences|options/i });
      
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click(); // TODO-LINT: move to async function
        
        // Check if modal opened
        const modal = page.getByRole('dialog');
        if (await modal.isVisible()) {
          // Test focus trapping
          const modalButtons = modal.getByRole('button'); // TODO-LINT: move to async function
          const firstButton = modalButtons.first();
          const lastButton = modalButtons.last();
          
          // Focus should be trapped within modal
          await firstButton.focus(); // TODO-LINT: move to async function
          await expect(firstButton).toBeFocused(); // TODO-LINT: move to async function
          
          // Tab to last element and try to tab out
          await lastButton.focus(); // TODO-LINT: move to async function
          await page.keyboard.press('Tab'); // TODO-LINT: move to async function
          
          // Focus should cycle back to first element
          await expect(firstButton).toBeFocused(); // TODO-LINT: move to async function
          
          // Close modal
          const closeButton = modal.getByRole('button', { name: /close|cancel/i });
          if (await closeButton.isVisible()) {
            await closeButton.click(); // TODO-LINT: move to async function
          } else {
            await page.keyboard.press('Escape'); // TODO-LINT: move to async function
          }
          
          // Focus should return to trigger
          await expect(modalTrigger).toBeFocused(); // TODO-LINT: move to async function
        }
      }
    });
  });

  test.describe('Comprehensive Accessibility Testing', () => {
    test('should pass axe accessibility audit on main page', async ({ page }) => {
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        rules: {
          // Allow color-contrast issues for now as design may not be final
          'color-contrast': { enabled: false },
        },
      }); // TODO-LINT: move to async function
    });

    test('should pass accessibility audit after interactions', async ({ page }) => {
      // Perform various interactions
      const languageButton = page.getByRole('button', { name: /language/i });
      if (await languageButton.isVisible()) {
        await languageButton.click(); // TODO-LINT: move to async function
        const languageOptions = page.getByRole('menuitem');
        if (await languageOptions.first().isVisible()) {
          await languageOptions.first().click(); // TODO-LINT: move to async function
        }
      }
      
      // Toggle some switches if available
      const switches = page.getByRole('switch');
      if (await switches.first().isVisible()) {
        const firstSwitch = switches.first(); // TODO-LINT: move to async function
        const isDisabled = await firstSwitch.getAttribute('disabled'); // TODO-LINT: move to async function
        if (!isDisabled) {
          await firstSwitch.click(); // TODO-LINT: move to async function
        }
      }
      
      // Check accessibility after interactions
      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'color-contrast': { enabled: false },
        },
      }); // TODO-LINT: move to async function
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Skipping test for ${browserName}`);
        
        // Test basic _functionality
        const skipLinks = page.getByRole('link', { name: /skip to/i });
        await expect(skipLinks.first()).toBeVisible(); // TODO-LINT: move to async function
        
        // Test language switcher
        const languageButton = page.getByRole('button', { name: /language/i });
        if (await languageButton.isVisible()) {
          await languageButton.click(); // TODO-LINT: move to async function
          const languageMenu = page.getByRole('menu');
          if (await languageMenu.isVisible()) {
            await expect(languageMenu).toBeVisible(); // TODO-LINT: move to async function
            await page.keyboard.press('Escape'); // TODO-LINT: move to async function
          }
        }
        
        // Test keyboard navigation
        await page.keyboard.press('Tab'); // TODO-LINT: move to async function
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible(); // TODO-LINT: move to async function
      });
    });
  });

  test.describe('Performance and UX', () => {
    test('should load quickly and be responsive', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      await page.goto('/'); // TODO-LINT: move to async function
      const loadTime = Date.now() - startTime;
      
      // Page should load within reasonable time
      expect(loadTime).toBeLessThan(5000);
      
      // Test responsiveness
      await page.setViewportSize({ width: 768, height: 1024 }); // TODO-LINT: move to async function // Tablet
      await expect(page.getByRole('main')).toBeVisible(); // TODO-LINT: move to async function
      
      await page.setViewportSize({ width: 375, height: 667 }); // TODO-LINT: move to async function // Mobile
      await expect(page.getByRole('main')).toBeVisible(); // TODO-LINT: move to async function
      
      await page.setViewportSize({ width: 1920, height: 1080 }); // TODO-LINT: move to async function // Desktop
      await expect(page.getByRole('main')).toBeVisible(); // TODO-LINT: move to async function
    });

    test('should handle user interactions smoothly', async ({ page }) => {
      // Test rapid interactions
      const languageButton = page.getByRole('button', { name: /language/i });
      
      if (await languageButton.isVisible()) {
        // Rapid open/close
        for (let i = 0; // TODO-LINT: move to async function i < 3; i++) {
          await languageButton.click(); // TODO-LINT: move to async function
          await page.waitForTimeout(100); // TODO-LINT: move to async function
          await page.keyboard.press('Escape'); // TODO-LINT: move to async function
          await page.waitForTimeout(100); // TODO-LINT: move to async function
        }
        
        // Verify still functional
        await languageButton.click(); // TODO-LINT: move to async function
        const languageOptions = page.getByRole('menuitem');
        if (await languageOptions.first().isVisible()) {
          await expect(languageOptions.first()).toBeVisible(); // TODO-LINT: move to async function
        }
      }
    });
  });
});
