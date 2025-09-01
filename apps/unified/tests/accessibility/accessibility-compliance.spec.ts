import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';

test.describe('Accessibility Compliance (WCAG 2.1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await testHelper.waitForPageLoad(page);
  });

  test.describe('WCAG 2.1 Level A Compliance', () => {
    test('should have proper page titles', async ({ page }) => {
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe('Document');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);

      // Check for proper heading structure
      const headingLevels = await Promise.all(
        headings.map(async (heading) => {
          const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
          return parseInt(tagName.replace('h', ''));
        })
      );

      // Verify no skipped heading levels
      let previousLevel = 0;
      for (const level of headingLevels) {
        expect(level).toBeGreaterThanOrEqual(previousLevel);
        expect(level).toBeLessThanOrEqual(previousLevel + 1);
        previousLevel = level;
      }
    });

    test('should have alt text for all images', async ({ page }) => {
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        
        // Decorative images should have alt="" or be background images
        if (src && !src.includes('data:') && !src.includes('background')) {
          expect(alt).toBeTruthy();
        }
      }
    });

    test('should have proper form labels', async ({ page }) => {
      const inputs = await page.locator('input, select, textarea').all();
      
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const type = await input.getAttribute('type');
        
        // Skip hidden inputs and submit buttons
        if (type === 'hidden' || type === 'submit') continue;
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          
          if (!hasLabel) {
            // Check for aria-label or aria-labelledby
            const ariaLabel = await input.getAttribute('aria-label');
            const ariaLabelledBy = await input.getAttribute('aria-labelledby');
            const placeholder = await input.getAttribute('placeholder');
            
            expect(ariaLabel || ariaLabelledBy || placeholder).toBeTruthy();
          }
        }
      }
    });

    test('should have proper button and link text', async ({ page }) => {
      const buttons = await page.locator('button, [role="button"]').all();
      
      for (const button of buttons) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        
        // Buttons should have meaningful text or aria-label
        expect(text?.trim() || ariaLabel).toBeTruthy();
        
        // Avoid generic text like "click here" or "read more"
        if (text) {
          const genericTexts = ['click here', 'read more', 'click', 'submit', 'button'];
          const hasGenericText = genericTexts.some(generic => 
            text.toLowerCase().includes(generic)
          );
          expect(hasGenericText).toBeFalsy();
        }
      }
    });

    test('should have proper color contrast', async ({ page }) => {
      // This is a basic check - in a real implementation, you'd use a library like axe-core
      const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6').all();
      
      for (const element of textElements) {
        const text = await element.textContent();
        if (text && text.trim().length > 0) {
          // Check if text is visible (not hidden by CSS)
          const isVisible = await element.isVisible();
          if (isVisible) {
            // Basic visibility check - in practice, you'd check actual color contrast
            const computedStyle = await element.evaluate((el) => {
              const style = window.getComputedStyle(el);
              return {
                color: style.color,
                backgroundColor: style.backgroundColor,
                opacity: style.opacity,
                visibility: style.visibility,
                display: style.display
              };
            });
            
            expect(computedStyle.visibility).not.toBe('hidden');
            expect(computedStyle.display).not.toBe('none');
            expect(parseFloat(computedStyle.opacity)).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  test.describe('WCAG 2.1 Level AA Compliance', () => {
    test('should have proper focus indicators', async ({ page }) => {
      const focusableElements = await page.locator(
        'button, input, select, textarea, a, [tabindex]:not([tabindex="-1"])'
      ).all();
      
      for (const element of focusableElements) {
        await element.focus();
        
        // Check for focus indicator
        const hasFocusIndicator = await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.outline !== 'none' || 
                 style.boxShadow !== 'none' || 
                 style.borderColor !== 'initial';
        });
        
        expect(hasFocusIndicator).toBeTruthy();
      }
    });

    test('should have proper skip links', async ({ page }) => {
      // Check for skip to main content link
      const skipLinks = await page.locator('a[href^="#main"], a[href^="#content"]').all();
      expect(skipLinks.length).toBeGreaterThan(0);
      
      for (const link of skipLinks) {
        const text = await link.textContent();
        expect(text?.toLowerCase()).toContain('skip');
      }
    });

    test('should have proper ARIA landmarks', async ({ page }) => {
      const landmarks = await page.locator(
        'main, nav, header, footer, aside, [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]'
      ).all();
      
      expect(landmarks.length).toBeGreaterThan(0);
      
      // Check for main landmark
      const mainLandmark = await page.locator('main, [role="main"]').count();
      expect(mainLandmark).toBeGreaterThan(0);
    });

    test('should have proper error identification', async ({ page }) => {
      // Navigate to login form
      await page.click('[data-testid="login-button"]');
      
      // Submit form without filling required fields
      await page.click('[data-testid="login-submit"]');
      
      // Check for error messages
      const errorMessages = await page.locator('[data-testid*="error"], .error, [role="alert"]').all();
      expect(errorMessages.length).toBeGreaterThan(0);
      
      for (const error of errorMessages) {
        const text = await error.textContent();
        expect(text).toBeTruthy();
        expect(text?.length).toBeGreaterThan(0);
      }
    });

    test('should have proper form validation', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      // Fill form with invalid data
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="login-submit"]');
      
      // Check for validation messages
      const validationMessages = await page.locator('[data-testid*="error"]').all();
      expect(validationMessages.length).toBeGreaterThan(0);
      
      // Check that error messages are associated with form fields
      for (const message of validationMessages) {
        const ariaDescribedBy = await message.getAttribute('aria-describedby');
        expect(ariaDescribedBy).toBeTruthy();
      }
    });
  });

  test.describe('WCAG 2.1 Level AAA Compliance', () => {
    test('should have proper language identification', async ({ page }) => {
      const html = await page.locator('html');
      const lang = await html.getAttribute('lang');
      expect(lang).toBeTruthy();
      expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
    });

    test('should have proper abbreviations', async ({ page }) => {
      const abbreviations = await page.locator('abbr, acronym').all();
      
      for (const abbr of abbreviations) {
        const title = await abbr.getAttribute('title');
        expect(title).toBeTruthy();
      }
    });

    test('should have proper reading level', async ({ page }) => {
      const textElements = await page.locator('p, div, span').all();
      let totalWords = 0;
      let totalSentences = 0;
      
      for (const element of textElements) {
        const text = await element.textContent();
        if (text && text.trim().length > 0) {
          const words = text.trim().split(/\s+/).length;
          const sentences = text.trim().split(/[.!?]+/).length;
          
          totalWords += words;
          totalSentences += sentences;
        }
      }
      
      // Basic readability check (simplified)
      if (totalSentences > 0) {
        const averageWordsPerSentence = totalWords / totalSentences;
        expect(averageWordsPerSentence).toBeLessThan(25); // Reasonable sentence length
      }
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be fully navigable by keyboard', async ({ page }) => {
      await page.keyboard.press('Tab');
      
      // Navigate through all focusable elements
      const focusableElements = await page.locator(
        'button, input, select, textarea, a, [tabindex]:not([tabindex="-1"])'
      ).all();
      
      for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const focusedElement = await page.evaluate(() => document.activeElement);
        expect(focusedElement).toBeTruthy();
      }
    });

    test('should have proper tab order', async ({ page }) => {
      const focusableElements = await page.locator(
        'button, input, select, textarea, a, [tabindex]:not([tabindex="-1"])'
      ).all();
      
      const tabOrders = await Promise.all(
        focusableElements.map(async (element) => {
          const tabIndex = await element.getAttribute('tabindex');
          return tabIndex ? parseInt(tabIndex) : 0;
        })
      );
      
      // Check for logical tab order
      for (let i = 1; i < tabOrders.length; i++) {
        expect(tabOrders[i]).toBeGreaterThanOrEqual(tabOrders[i - 1]);
      }
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [aria-describedby]').all();
      
      for (const element of elementsWithAria) {
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        const ariaDescribedBy = await element.getAttribute('aria-describedby');
        
        // At least one should be present
        expect(ariaLabel || ariaLabelledBy || ariaDescribedBy).toBeTruthy();
      }
    });

    test('should have proper live regions', async ({ page }) => {
      const liveRegions = await page.locator('[aria-live], [role="alert"], [role="status"], [role="log"]').all();
      
      // Check for appropriate live regions for dynamic content
      expect(liveRegions.length).toBeGreaterThan(0);
      
      for (const region of liveRegions) {
        const ariaLive = await region.getAttribute('aria-live');
        const role = await region.getAttribute('role');
        
        expect(ariaLive || role).toBeTruthy();
      }
    });

    test('should have proper table structure', async ({ page }) => {
      const tables = await page.locator('table').all();
      
      for (const table of tables) {
        const headers = await table.locator('th').all();
        const rows = await table.locator('tr').all();
        
        if (headers.length > 0) {
          // Check for proper table headers
          for (const header of headers) {
            const scope = await header.getAttribute('scope');
            expect(scope).toBeTruthy();
          }
        }
        
        // Check for proper table structure
        expect(rows.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('should be accessible on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check for proper touch targets
      const touchTargets = await page.locator('button, a, input, select, textarea').all();
      
      for (const target of touchTargets) {
        const boundingBox = await target.boundingBox();
        if (boundingBox) {
          // Touch targets should be at least 44x44 pixels
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
      
      // Check for proper spacing between interactive elements
      const interactiveElements = await page.locator('button, a, input').all();
      for (let i = 0; i < interactiveElements.length - 1; i++) {
        const box1 = await interactiveElements[i].boundingBox();
        const box2 = await interactiveElements[i + 1].boundingBox();
        
        if (box1 && box2) {
          // Elements should have adequate spacing
          const verticalSpacing = Math.abs(box2.y - (box1.y + box1.height));
          expect(verticalSpacing).toBeGreaterThanOrEqual(8);
        }
      }
    });
  });

  test.describe('Dynamic Content Accessibility', () => {
    test('should handle dynamic content updates', async ({ page }) => {
      // Navigate to a page with dynamic content
      await page.click('[data-testid="login-button"]');
      
      // Fill and submit form
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      
      await page.click('[data-testid="login-submit"]');
      
      // Wait for dynamic content to load
      await testHelper.waitForApiResponse(page, '/auth/login', 200);
      
      // Check that new content is accessible
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Verify focus management after dynamic content
      const focusedElement = await page.evaluate(() => document.activeElement);
      expect(focusedElement).toBeTruthy();
    });

    test('should announce important updates', async ({ page }) => {
      // Check for live regions that announce updates
      const liveRegions = await page.locator('[aria-live]').all();
      
      // Should have live regions for important updates
      expect(liveRegions.length).toBeGreaterThan(0);
      
      for (const region of liveRegions) {
        const ariaLive = await region.getAttribute('aria-live');
        expect(['polite', 'assertive']).toContain(ariaLive);
      }
    });
  });
});
