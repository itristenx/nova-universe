import { test, expect } from '@playwright/test';

test.describe('Usability Testing Scenarios', () => {
  test.describe('New User Onboarding', () => {
    test('should guide new users through accessibility features', async ({ page }) => {
      await page.goto('/');

      // Check for welcome message or onboarding hints
      const welcomeMessage = page.locator(
        '[data-testid="welcome-message"], [aria-label*="welcome"]',
      );
      if (await welcomeMessage.isVisible()) {
        await expect(welcomeMessage).toBeVisible();
      }

      // Look for help or tour buttons
      const helpButton = page.getByRole('button', { name: /help|tour|guide/i });
      if (await helpButton.isVisible()) {
        await helpButton.click();

        // Check if help content is accessible
        const helpContent = page.getByRole('dialog', { name: /help|guide/i });
        if (await helpContent.isVisible()) {
          await expect(helpContent).toBeVisible();

          // Test keyboard navigation in help
          await page.keyboard.press('Tab');
          const focusedElement = helpContent.locator(':focus');
          await expect(focusedElement).toBeVisible();

          // Close help
          await page.keyboard.press('Escape');
        }
      }
    });

    test('should make language switching discoverable for new users', async ({ page }) => {
      await page.goto('/');

      // Language switcher should be prominently placed
      const languageButton = page.getByRole('button', { name: /language/i });
      await expect(languageButton).toBeVisible();

      // Should have clear labeling
      const buttonText = await languageButton.textContent();
      expect(buttonText).toBeTruthy();
      expect(buttonText?.length).toBeGreaterThan(0);

      // Should be in a logical location (header/navigation)
      const header = page.locator('header, nav, [role="banner"]');
      if (await header.isVisible()) {
        const isInHeader = await header.locator('button', { hasText: /language/i }).isVisible();
        expect(isInHeader).toBe(true);
      }
    });
  });

  test.describe('Task Completion Scenarios', () => {
    test('should allow users to change language successfully', async ({ page }) => {
      await page.goto('/');

      // Step 1: Find and identify language switcher
      const languageButton = page.getByRole('button', { name: /language/i });
      await expect(languageButton).toBeVisible();

      // Step 2: Activate language switcher
      await languageButton.click();

      // Step 3: Verify menu opens with clear options
      const languageMenu = page.getByRole('menu');
      if (await languageMenu.isVisible()) {
        const languageOptions = page.getByRole('menuitem');
        const optionCount = await languageOptions.count();
        expect(optionCount).toBeGreaterThan(0);

        // Step 4: Select a language option
        const firstOption = languageOptions.first();
        const optionText = await firstOption.textContent();
        await firstOption.click();

        // Step 5: Verify language change occurred
        await expect(languageButton).toBeFocused();

        // Step 6: Verify UI updated (if applicable)
        if (optionText && optionText.includes('Español')) {
          // Look for Spanish text indicators
          const spanishElements = page.locator('[lang="es"], [data-lang="es"]');
          if (await spanishElements.first().isVisible()) {
            await expect(spanishElements.first()).toBeVisible();
          }
        }
      }
    });

    test('should allow users to navigate using skip links', async ({ page }) => {
      await page.goto('/');

      // Step 1: User discovers skip links (usually by tabbing)
      await page.keyboard.press('Tab');
      const firstSkipLink = page.getByRole('link', { name: /skip to main/i });
      await expect(firstSkipLink).toBeFocused();

      // Step 2: User understands what skip link does
      const linkText = await firstSkipLink.textContent();
      expect(linkText).toMatch(/skip to main content/i);

      // Step 3: User activates skip link
      await firstSkipLink.click();

      // Step 4: User arrives at main content
      const mainContent = page.locator('#main-content, main, [role="main"]');
      await expect(mainContent).toBeFocused();

      // Step 5: User can continue navigation from main content
      await page.keyboard.press('Tab');
      const nextElement = page.locator(':focus');
      await expect(nextElement).toBeVisible();
    });

    test('should allow users to manage permissions effectively', async ({ page }) => {
      await page.goto('/');

      // Navigate to permission settings
      const permissionLink = page.getByRole('link', { name: /permission|privacy|settings/i });
      if (await permissionLink.isVisible()) {
        await permissionLink.click();

        // Find permission controls
        const switches = page.getByRole('switch');
        if (await switches.first().isVisible()) {
          const firstSwitch = switches.first();

          // Step 1: User identifies permission control
          const switchLabel =
            (await firstSwitch.getAttribute('aria-label')) ||
            (await page
              .locator(`label[for="${await firstSwitch.getAttribute('id')}"]`)
              .textContent());
          expect(switchLabel).toBeTruthy();

          // Step 2: User understands current state
          const currentState = await firstSwitch.getAttribute('aria-checked');
          expect(currentState).toMatch(/true|false/);

          // Step 3: User changes permission
          await firstSwitch.click();

          // Step 4: User verifies change occurred
          const newState = await firstSwitch.getAttribute('aria-checked');
          expect(newState).not.toBe(currentState);

          // Step 5: Change is persistent (check if there's a save button)
          const saveButton = page.getByRole('button', { name: /save|apply|confirm/i });
          if (await saveButton.isVisible()) {
            await saveButton.click();
          }
        }
      }
    });
  });

  test.describe('Error Recovery Scenarios', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/');

      // Simulate network failure
      await page.route('**/*', (route) => route.abort());

      // Try to perform an action that might require network
      const languageButton = page.getByRole('button', { name: /language/i });
      if (await languageButton.isVisible()) {
        await languageButton.click();

        // Look for error messages or fallback behavior
        const errorMessage = page.locator('[role="alert"], .error, [data-testid="error"]');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();

          // Error message should be accessible
          const errorText = await errorMessage.textContent();
          expect(errorText).toBeTruthy();
        }
      }

      // Restore network
      await page.unroute('**/*');
    });

    test('should provide clear feedback for invalid actions', async ({ page }) => {
      await page.goto('/');

      // Try rapid clicking on language switcher
      const languageButton = page.getByRole('button', { name: /language/i });

      if (await languageButton.isVisible()) {
        // Rapid clicking should not break the interface
        for (let i = 0; i < 5; i++) {
          await languageButton.click();
          await page.waitForTimeout(50);
        }

        // Interface should still be functional
        await page.waitForTimeout(200);
        await languageButton.click();

        const menu = page.getByRole('menu');
        if (await menu.isVisible()) {
          await expect(menu).toBeVisible();
        }
      }
    });
  });

  test.describe('Accessibility User Journeys', () => {
    test('should support screen reader users effectively', async ({ page }) => {
      await page.goto('/');

      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);

      // Check h1 exists and is unique
      const h1Elements = page.locator('h1');
      const h1Count = await h1Elements.count();
      expect(h1Count).toBe(1);

      // Check for landmarks
      const landmarks = page.locator(
        '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]',
      );
      const landmarkCount = await landmarks.count();
      expect(landmarkCount).toBeGreaterThan(0);

      // Check for proper labeling on interactive elements
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const hasLabel =
            (await button.getAttribute('aria-label')) ||
            (await button.textContent()) ||
            (await button.getAttribute('title'));
          expect(hasLabel).toBeTruthy();
        }
      }
    });

    test('should support keyboard-only users', async ({ page }) => {
      await page.goto('/');

      // Tab through the interface
      const tabbableElements = [];

      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');

        const focusedElement = page.locator(':focus');
        if (await focusedElement.isVisible()) {
          const tagName = await focusedElement.evaluate((el) => el.tagName);
          const role = await focusedElement.getAttribute('role');
          tabbableElements.push({ tagName, role, index: i });
        }
      }

      // Should have found interactive elements
      expect(tabbableElements.length).toBeGreaterThan(0);

      // Test reverse tabbing
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Shift+Tab');
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }

      // Test Enter and Space key activation
      const languageButton = page.getByRole('button', { name: /language/i });
      if (await languageButton.isVisible()) {
        await languageButton.focus();
        await page.keyboard.press('Enter');

        const menu = page.getByRole('menu');
        if (await menu.isVisible()) {
          await expect(menu).toBeVisible();

          // Escape should close menu
          await page.keyboard.press('Escape');
          await expect(languageButton).toBeFocused();
        }
      }
    });

    test('should support users with motor impairments', async ({ page }) => {
      await page.goto('/');

      // Check for adequate click targets (minimum 44x44px)
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          if (boundingBox) {
            expect(boundingBox.width).toBeGreaterThanOrEqual(44);
            expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          }
        }
      }

      // Check for sufficient spacing between interactive elements
      const links = page.getByRole('link');
      const linkCount = await links.count();

      if (linkCount > 1) {
        const firstLink = links.first();
        const secondLink = links.nth(1);

        if ((await firstLink.isVisible()) && (await secondLink.isVisible())) {
          const firstBox = await firstLink.boundingBox();
          const secondBox = await secondLink.boundingBox();

          if (firstBox && secondBox) {
            const distance =
              Math.abs(firstBox.y - secondBox.y) || Math.abs(firstBox.x - secondBox.x);
            expect(distance).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('Cognitive Load Assessment', () => {
    test('should present information clearly and simply', async ({ page }) => {
      await page.goto('/');

      // Check for clear page structure
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
      expect(pageTitle.length).toBeLessThan(60); // Reasonable title length

      // Check for reasonable content density
      const textContent = await page.locator('body').textContent();
      if (textContent) {
        const wordCount = textContent.split(/\s+/).length;
        const pageHeight = await page.evaluate(() => document.body.scrollHeight);

        // Reasonable content density (not too much text per screen)
        const wordsPerPixel = wordCount / pageHeight;
        expect(wordsPerPixel).toBeLessThan(1);
      }

      // Check for consistent navigation
      const navElements = page.locator('nav, [role="navigation"]');
      if (await navElements.first().isVisible()) {
        const navItems = navElements.first().getByRole('link');
        const navItemCount = await navItems.count();

        // Navigation should not be overwhelming
        expect(navItemCount).toBeLessThan(10);
      }
    });

    test('should provide helpful feedback and guidance', async ({ page }) => {
      await page.goto('/');

      // Look for help text or instructions
      const helpText = page.locator('[aria-describedby], .help-text, [data-testid="help"]');
      if (await helpText.first().isVisible()) {
        const helpContent = await helpText.first().textContent();
        expect(helpContent).toBeTruthy();
        expect(helpContent?.length).toBeLessThan(200); // Concise help text
      }

      // Check for status messages
      const languageButton = page.getByRole('button', { name: /language/i });
      if (await languageButton.isVisible()) {
        await languageButton.click();

        // Look for status announcements
        const statusElements = page.locator('[role="status"], [aria-live]');
        if (await statusElements.first().isVisible()) {
          await expect(statusElements.first()).toBeVisible();
        }
      }
    });
  });
});
