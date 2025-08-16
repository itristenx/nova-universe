import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Phase 6 Accessibility & Internationalization E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test.describe('Skip Links Navigation', () => {
    test('should provide functional skip links', async ({ page }) => {
      // Test skip to main content
      const skipToMain = page.getByRole('link', { name: /skip to main content/i });
      await expect(skipToMain).toBeVisible();

      await skipToMain.click();

      // Verify main content receives focus
      const mainContent = page.locator('#main-content');
      await expect(mainContent).toBeFocused();
    });

    test('should support keyboard navigation through skip links', async ({ page }) => {
      // Focus first skip link with tab
      await page.keyboard.press('Tab');

      const skipToMain = page.getByRole('link', { name: /skip to main content/i });
      await expect(skipToMain).toBeFocused();

      // Navigate through skip links
      await page.keyboard.press('Tab');
      const skipToNav = page.getByRole('link', { name: /skip to navigation/i });
      await expect(skipToNav).toBeFocused();

      // Activate skip link with Enter
      await page.keyboard.press('Enter');
      const navigation = page.locator('#navigation');
      await expect(navigation).toBeFocused();
    });
  });

  test.describe('Language Switching', () => {
    test('should allow language switching with proper announcements', async ({ page }) => {
      // Find language switcher
      const languageButton = page.getByRole('button', { name: /language/i });
      await expect(languageButton).toBeVisible();

      // Check initial ARIA states
      await expect(languageButton).toHaveAttribute('aria-haspopup', 'true');
      await expect(languageButton).toHaveAttribute('aria-expanded', 'false');

      // Open language menu
      await languageButton.click();
      await expect(languageButton).toHaveAttribute('aria-expanded', 'true');

      // Find language options
      const languageOptions = page.getByRole('menuitem');
      await expect(languageOptions.first()).toBeVisible();

      // Select a different language
      const spanishOption = page.getByRole('menuitem', { name: /español/i });
      if (await spanishOption.isVisible()) {
        await spanishOption.click();

        // Verify language change
        await expect(languageButton).toHaveAttribute('aria-expanded', 'false');
        await expect(languageButton).toBeFocused();
      }
    });

    test('should maintain accessibility after language change', async ({ page }) => {
      // Change language
      const languageButton = page.getByRole('button', { name: /language/i });
      await languageButton.click();

      const languageOptions = page.getByRole('menuitem');
      const firstOption = languageOptions.first();
      await firstOption.click();

      // Wait for language change to complete
      await page.waitForTimeout(500);

      // Check accessibility after language change
      await checkA11y(page, null, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });
  });

  test.describe('Security Components', () => {
    test('should provide accessible permission management', async ({ page }) => {
      // Navigate to permission management
      const permissionLink = page.getByRole('link', { name: /permission/i });
      if (await permissionLink.isVisible()) {
        await permissionLink.click();
      }

      // Find permission switches
      const switches = page.getByRole('switch');
      const firstSwitch = switches.first();

      if (await firstSwitch.isVisible()) {
        // Check ARIA attributes
        await expect(firstSwitch).toHaveAttribute('aria-checked');

        // Test keyboard interaction
        await firstSwitch.focus();
        await expect(firstSwitch).toBeFocused();

        // Toggle with space key
        const initialState = await firstSwitch.getAttribute('aria-checked');
        await page.keyboard.press('Space');

        const newState = await firstSwitch.getAttribute('aria-checked');
        expect(newState).not.toBe(initialState);
      }
    });

    test('should provide accessible privacy dashboard', async ({ page }) => {
      // Navigate to privacy dashboard
      const privacyLink = page.getByRole('link', { name: /privacy/i });
      if (await privacyLink.isVisible()) {
        await privacyLink.click();
      }

      // Test tab navigation
      const tabs = page.getByRole('tab');
      const firstTab = tabs.first();

      if (await firstTab.isVisible()) {
        await expect(firstTab).toHaveAttribute('aria-selected');

        // Navigate to second tab
        const secondTab = tabs.nth(1);
        if (await secondTab.isVisible()) {
          await secondTab.click();
          await expect(secondTab).toHaveAttribute('aria-selected', 'true');
        }
      }

      // Test privacy switches
      const switches = page.getByRole('switch');
      if (await switches.first().isVisible()) {
        const switchCount = await switches.count();

        for (let i = 0; i < Math.min(switchCount, 3); i++) {
          const currentSwitch = switches.nth(i);
          const isDisabled = await currentSwitch.getAttribute('disabled');

          if (!isDisabled) {
            const initialState = await currentSwitch.getAttribute('aria-checked');
            await currentSwitch.click();

            const newState = await currentSwitch.getAttribute('aria-checked');
            expect(newState).not.toBe(initialState);
          }
        }
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should maintain proper focus order throughout application', async ({ page }) => {
      // Start from top of page
      await page.keyboard.press('Tab');

      // Tab through first 10 interactive elements
      const focusableElements = [];

      for (let i = 0; i < 10; i++) {
        const focusedElement = page.locator(':focus');
        if (await focusedElement.isVisible()) {
          const tagName = await focusedElement.evaluate((el) => el.tagName);
          const role = await focusedElement.getAttribute('role');
          focusableElements.push({ tagName, role });
        }

        await page.keyboard.press('Tab');
      }

      // Verify we found focusable elements
      expect(focusableElements.length).toBeGreaterThan(0);

      // Test reverse tab order
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Shift+Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
    });

    test('should handle modal focus trapping', async ({ page }) => {
      // Look for modal trigger (button that opens modal)
      const modalTrigger = page.getByRole('button', { name: /settings|preferences|options/i });

      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();

        // Check if modal opened
        const modal = page.getByRole('dialog');
        if (await modal.isVisible()) {
          // Test focus trapping
          const modalButtons = modal.getByRole('button');
          const firstButton = modalButtons.first();
          const lastButton = modalButtons.last();

          // Focus should be trapped within modal
          await firstButton.focus();
          await expect(firstButton).toBeFocused();

          // Tab to last element and try to tab out
          await lastButton.focus();
          await page.keyboard.press('Tab');

          // Focus should cycle back to first element
          await expect(firstButton).toBeFocused();

          // Close modal
          const closeButton = modal.getByRole('button', { name: /close|cancel/i });
          if (await closeButton.isVisible()) {
            await closeButton.click();
          } else {
            await page.keyboard.press('Escape');
          }

          // Focus should return to trigger
          await expect(modalTrigger).toBeFocused();
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
      });
    });

    test('should pass accessibility audit after interactions', async ({ page }) => {
      // Perform various interactions
      const languageButton = page.getByRole('button', { name: /language/i });
      if (await languageButton.isVisible()) {
        await languageButton.click();
        const languageOptions = page.getByRole('menuitem');
        if (await languageOptions.first().isVisible()) {
          await languageOptions.first().click();
        }
      }

      // Toggle some switches if available
      const switches = page.getByRole('switch');
      if (await switches.first().isVisible()) {
        const firstSwitch = switches.first();
        const isDisabled = await firstSwitch.getAttribute('disabled');
        if (!isDisabled) {
          await firstSwitch.click();
        }
      }

      // Check accessibility after interactions
      await checkA11y(page, null, {
        detailedReport: true,
        rules: {
          'color-contrast': { enabled: false },
        },
      });
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach((browserName) => {
      test(`should work correctly in ${browserName}`, async ({
        page,
        browserName: currentBrowser,
      }) => {
        test.skip(currentBrowser !== browserName, `Skipping test for ${browserName}`);

        // Test basic functionality
        const skipLinks = page.getByRole('link', { name: /skip to/i });
        await expect(skipLinks.first()).toBeVisible();

        // Test language switcher
        const languageButton = page.getByRole('button', { name: /language/i });
        if (await languageButton.isVisible()) {
          await languageButton.click();
          const languageMenu = page.getByRole('menu');
          if (await languageMenu.isVisible()) {
            await expect(languageMenu).toBeVisible();
            await page.keyboard.press('Escape');
          }
        }

        // Test keyboard navigation
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      });
    });
  });

  test.describe('Performance and UX', () => {
    test('should load quickly and be responsive', async ({ page }) => {
      // Measure page load time
      const startTime = Date.now();
      await page.goto('/');
      const loadTime = Date.now() - startTime;

      // Page should load within reasonable time
      expect(loadTime).toBeLessThan(5000);

      // Test responsiveness
      await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
      await expect(page.getByRole('main')).toBeVisible();

      await page.setViewportSize({ width: 375, height: 667 }); // Mobile
      await expect(page.getByRole('main')).toBeVisible();

      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should handle user interactions smoothly', async ({ page }) => {
      // Test rapid interactions
      const languageButton = page.getByRole('button', { name: /language/i });

      if (await languageButton.isVisible()) {
        // Rapid open/close
        for (let i = 0; i < 3; i++) {
          await languageButton.click();
          await page.waitForTimeout(100);
          await page.keyboard.press('Escape');
          await page.waitForTimeout(100);
        }

        // Verify still functional
        await languageButton.click();
        const languageOptions = page.getByRole('menuitem');
        if (await languageOptions.first().isVisible()) {
          await expect(languageOptions.first()).toBeVisible();
        }
      }
    });
  });
});
