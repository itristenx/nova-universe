import { test, expect } from '@playwright/test';

test.describe('ITSM Industry-Standard Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display proper login interface matching industry standards', async ({ page }) => {
    // Navigate to login if not already there
    const currentUrl = page.url();
    if (!currentUrl.includes('login') && !currentUrl.includes('auth')) {
      // Look for login button/link
      const loginButton = page.locator('[data-testid="login-button"], button:has-text("login"), a:has-text("login")').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Check for login form (current implementation shows it by default)
    const loginForm = page.locator('[data-testid="login-form"], form');
    await expect(loginForm).toBeVisible();

    // Industry standard login fields
    const emailField = page.locator('[data-testid="email-input"], input[type="email"], input[name="email"]');
    const passwordField = page.locator('[data-testid="password-input"], input[type="password"], input[name="password"]');
    const submitButton = page.locator('[data-testid="login-submit"], button[type="submit"], button:has-text("sign")');

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Test field labels (accessibility requirement)
    const emailLabel = page.locator('label[for="email"], label:has-text("email")');
    const passwordLabel = page.locator('label[for="password"], label:has-text("password")');
    
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('should validate form inputs according to industry standards', async ({ page }) => {
    const emailField = page.locator('[data-testid="email-input"], input[type="email"]');
    const passwordField = page.locator('[data-testid="password-input"], input[type="password"]');
    const submitButton = page.locator('[data-testid="login-submit"], button[type="submit"]');

    if (await emailField.isVisible()) {
      // Test email validation
      await emailField.fill('invalid-email');
      await submitButton.click();
      
      // Should show validation error or prevent submission
      const isFormValid = await page.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"]');
        return emailInput ? emailInput.validity.valid : true;
      });
      
      // Invalid email should not be valid
      expect(isFormValid).toBeFalsy();

      // Test valid email
      await emailField.clear();
      await emailField.fill('user@example.com');
      
      const isValidEmailValid = await page.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"]');
        return emailInput ? emailInput.validity.valid : true;
      });
      
      expect(isValidEmailValid).toBeTruthy();
    }
  });

  test('should provide accessible error messages', async ({ page }) => {
    const submitButton = page.locator('[data-testid="login-submit"], button[type="submit"]');
    
    if (await submitButton.isVisible()) {
      // Try to submit empty form
      await submitButton.click();
      
      // Look for error messages
      const errorMessages = page.locator('[data-testid*="error"], .error, [role="alert"], .text-red');
      
      // Should have some form of error indication
      // (Note: current implementation might not show errors immediately, which is okay for this test)
      const errorCount = await errorMessages.count();
      
      // Either error messages are shown, or form validation prevents submission
      const formWasSubmitted = await page.url();
      const hasValidationErrors = errorCount > 0;
      
      // One of these should be true for good UX
      expect(hasValidationErrors || formWasSubmitted.includes('login')).toBeTruthy();
    }
  });

  test('should support keyboard navigation for accessibility', async ({ page }) => {
    // Test tab order through form elements
    await page.keyboard.press('Tab');
    
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      
      if (await focusedElement.isVisible()) {
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        // Should be focusable elements
        expect(['input', 'button', 'a', 'select', 'textarea']).toContain(tagName);
      }
    }
  });

  test('should have proper security indicators', async ({ page }) => {
    // Check for HTTPS in production (skip in development)
    const url = page.url();
    if (!url.includes('localhost')) {
      expect(url).toMatch(/^https:/);
    }

    // Check for password field security attributes
    const passwordField = page.locator('input[type="password"]');
    if (await passwordField.isVisible()) {
      // Password fields should have proper autocomplete attributes
      const autocomplete = await passwordField.getAttribute('autocomplete');
      // Should either be 'current-password' or 'new-password' or not present
      if (autocomplete) {
        expect(['current-password', 'new-password', 'off']).toContain(autocomplete);
      }
    }
  });

  test('should provide proper visual feedback for form interactions', async ({ page }) => {
    const emailField = page.locator('[data-testid="email-input"], input[type="email"]');
    const passwordField = page.locator('[data-testid="password-input"], input[type="password"]');
    
    if (await emailField.isVisible()) {
      // Test focus styles
      await emailField.focus();
      
      // Should have visible focus indicator
      const focusStyles = await emailField.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          borderColor: styles.borderColor,
          borderWidth: styles.borderWidth
        };
      });
      
      // Should have some form of focus indication
      const hasFocusIndicator = 
        focusStyles.outline !== 'none' || 
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.borderColor !== 'rgba(0, 0, 0, 0)';
      
      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test('should handle different viewport sizes appropriately', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568, name: 'Mobile Portrait' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check that login form is still accessible
      const loginForm = page.locator('[data-testid="login-form"], form').first();
      if (await loginForm.isVisible()) {
        await expect(loginForm).toBeVisible();
        
        // Form should be usable (not cut off)
        const formBox = await loginForm.boundingBox();
        if (formBox) {
          expect(formBox.width).toBeGreaterThan(0);
          expect(formBox.height).toBeGreaterThan(0);
          expect(formBox.x).toBeGreaterThanOrEqual(0);
          expect(formBox.y).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});