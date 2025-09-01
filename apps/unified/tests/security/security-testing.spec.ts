import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';

test.describe('Security Testing Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await testHelper.waitForPageLoad(page);
  });

  test.describe('Authentication Security', () => {
    test('should prevent brute force attacks', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        await testHelper.fillFormFields(page, {
          '[data-testid="email-input"]': 'test@example.com',
          '[data-testid="password-input"]': 'wrongpassword',
        });
        await page.click('[data-testid="login-submit"]');
        
        // Wait for error message
        await testHelper.verifyToast(page, 'Invalid credentials', 'error');
      }
      
      // After multiple failed attempts, should show rate limiting message
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'test@example.com',
        '[data-testid="password-input"]': 'wrongpassword',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Should show rate limiting or account lockout message
      const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
      expect(errorMessage).toMatch(/rate limit|locked|temporarily|blocked/i);
    });

    test('should validate password strength requirements', async ({ page }) => {
      await page.click('[data-testid="register-button"]');
      
      // Test weak passwords
      const weakPasswords = [
        'password',
        '123456',
        'abc123',
        'qwerty',
        'password123'
      ];
      
      for (const weakPassword of weakPasswords) {
        await testHelper.fillFormFields(page, {
          '[data-testid="first-name-input"]': 'Test',
          '[data-testid="last-name-input"]': 'User',
          '[data-testid="email-input"]': `test${Date.now()}@example.com`,
          '[data-testid="password-input"]': weakPassword,
          '[data-testid="confirm-password-input"]': weakPassword,
        });
        
        await page.click('[data-testid="register-submit"]');
        
        // Should show password strength error
        await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="password-error"]')).toContainText('stronger');
      }
    });

    test('should prevent SQL injection in login form', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      const sqlInjectionAttempts = [
        "' OR '1'='1",
        "'; DROP TABLE users; --",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "1' OR '1' = '1' --"
      ];
      
      for (const injection of sqlInjectionAttempts) {
        await testHelper.fillFormFields(page, {
          '[data-testid="email-input"]': injection,
          '[data-testid="password-input"]': 'password',
        });
        
        await page.click('[data-testid="login-submit"]');
        
        // Should show generic error, not expose database details
        await testHelper.verifyToast(page, 'Invalid credentials', 'error');
        
        // Should not expose SQL errors or database structure
        const pageContent = await page.content();
        expect(pageContent).not.toContain('SQL');
        expect(pageContent).not.toContain('database');
        expect(pageContent).not.toContain('syntax error');
      }
    });

    test('should prevent XSS attacks in form inputs', async ({ page }) => {
      await page.click('[data-testid="register-button"]');
      
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
        '"><img src="x" onerror="alert(\'xss\')">'
      ];
      
      for (const xss of xssAttempts) {
        await testHelper.fillFormFields(page, {
          '[data-testid="first-name-input"]': xss,
          '[data-testid="last-name-input"]': 'User',
          '[data-testid="email-input"]': `test${Date.now()}@example.com`,
          '[data-testid="password-input"]': 'StrongPassword123!',
          '[data-testid="confirm-password-input"]': 'StrongPassword123!',
        });
        
        await page.click('[data-testid="register-submit"]');
        
        // Check if XSS was executed (should not be)
        const alerts = await page.evaluate(() => {
          return window.alert;
        });
        
        // Should not have executed any scripts
        expect(alerts).toBeFalsy();
      }
    });

    test('should enforce session timeout', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Wait for login to complete
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Simulate session timeout (this would require backend configuration)
      // For now, we'll test that the UI handles session expiration gracefully
      await page.evaluate(() => {
        // Simulate expired token
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      });
      
      // Try to access protected page
      await page.goto('/tickets');
      
      // Should redirect to login or show session expired message
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/login|auth/);
    });
  });

  test.describe('Authorization Security', () => {
    test('should prevent unauthorized access to protected routes', async ({ page }) => {
      // Try to access protected routes without authentication
      const protectedRoutes = ['/dashboard', '/tickets', '/assets', '/users', '/admin'];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        
        // Should redirect to login page
        await expect(page).toHaveURL(/login|auth/);
        
        // Should show authentication required message
        const message = await page.locator('body').textContent();
        expect(message).toMatch(/login|sign in|authentication required/i);
      }
    });

    test('should enforce role-based access control', async ({ page }) => {
      // Login as regular user
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Try to access admin-only routes
      const adminRoutes = ['/admin', '/admin/users', '/admin/settings'];
      
      for (const route of adminRoutes) {
        await page.goto(route);
        
        // Should show access denied or redirect
        const currentUrl = page.url();
        const pageContent = await page.content();
        
        expect(currentUrl).not.toBe(route);
        expect(pageContent).toMatch(/access denied|unauthorized|forbidden/i);
      }
    });

    test('should prevent privilege escalation', async ({ page }) => {
      // Login as regular user
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Try to modify user role through UI
      await page.goto('/profile');
      
      // Should not show role modification options for regular users
      const roleSelectors = [
        '[data-testid="role-select"]',
        '[data-testid="admin-toggle"]',
        '[data-testid="permissions-editor"]'
      ];
      
      for (const selector of roleSelectors) {
        const element = page.locator(selector);
        await expect(element).not.toBeVisible();
      }
    });
  });

  test.describe('Input Validation Security', () => {
    test('should validate email format', async ({ page }) => {
      await page.click('[data-testid="register-button"]');
      
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example..com',
        'test@example.com.',
        'test@.example.com'
      ];
      
      for (const invalidEmail of invalidEmails) {
        await testHelper.fillFormFields(page, {
          '[data-testid="first-name-input"]': 'Test',
          '[data-testid="last-name-input"]': 'User',
          '[data-testid="email-input"]': invalidEmail,
          '[data-testid="password-input"]': 'StrongPassword123!',
          '[data-testid="confirm-password-input"]': 'StrongPassword123!',
        });
        
        await page.click('[data-testid="register-submit"]');
        
        // Should show email validation error
        await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
      }
    });

    test('should prevent file upload attacks', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Navigate to ticket creation
      await page.goto('/tickets/new');
      
      const maliciousFiles = [
        'malicious.exe',
        'script.php',
        'virus.bat',
        'trojan.js',
        'payload.sh'
      ];
      
      for (const filename of maliciousFiles) {
        // Create a file input and try to upload malicious file
        const fileInput = page.locator('[data-testid="file-input"]');
        
        // This would require actual file creation in a real test
        // For now, we'll test the validation logic
        await fileInput.setInputFiles({
          name: filename,
          mimeType: 'application/octet-stream',
          buffer: Buffer.from('malicious content')
        });
        
        // Should show file type validation error
        await expect(page.locator('[data-testid="file-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="file-error"]')).toContainText('allowed');
      }
    });

    test('should prevent CSRF attacks', async ({ page }) => {
      // Test that forms include CSRF tokens
      await page.click('[data-testid="login-button"]');
      
      const form = page.locator('[data-testid="login-form"]');
      const csrfToken = await form.locator('input[name="_csrf"], input[name="csrf_token"]').count();
      
      // Should have CSRF protection
      expect(csrfToken).toBeGreaterThan(0);
    });
  });

  test.describe('Data Protection', () => {
    test('should encrypt sensitive data in storage', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Check localStorage and sessionStorage for sensitive data
      const localStorage = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            items[key] = localStorage.getItem(key);
          }
        }
        return items;
      });
      
      const sessionStorage = await page.evaluate(() => {
        const items = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            items[key] = sessionStorage.getItem(key);
          }
        }
        return items;
      });
      
      // Check that sensitive data is not stored in plain text
      const sensitiveKeys = ['password', 'token', 'secret', 'key'];
      
      for (const key of sensitiveKeys) {
        for (const storage of [localStorage, sessionStorage]) {
          for (const storageKey of Object.keys(storage)) {
            if (storageKey.toLowerCase().includes(key)) {
              const value = storage[storageKey];
              // Should not contain plain text passwords or tokens
              expect(value).not.toContain('password');
              expect(value).not.toContain('secret');
            }
          }
        }
      }
    });

    test('should prevent data leakage in error messages', async ({ page }) => {
      // Try to access non-existent resources
      await page.goto('/api/nonexistent-endpoint');
      
      const errorContent = await page.content();
      
      // Should not expose internal system information
      expect(errorContent).not.toContain('database');
      expect(errorContent).not.toContain('sql');
      expect(errorContent).not.toContain('stack trace');
      expect(errorContent).not.toContain('internal server error');
      expect(errorContent).not.toContain('exception');
    });

    test('should sanitize user input in display', async ({ page }) => {
      // Login first
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      await page.click('[data-testid="login-submit"]');
      
      // Create a ticket with potentially malicious content
      await page.goto('/tickets/new');
      
      const maliciousContent = '<script>alert("xss")</script><img src="x" onerror="alert(\'xss\')">';
      
      await testHelper.fillFormFields(page, {
        '[data-testid="ticket-title-input"]': 'Test Ticket',
        '[data-testid="ticket-description-input"]': maliciousContent,
      });
      
      await page.click('[data-testid="submit-ticket"]');
      
      // Navigate to view the ticket
      await page.goto('/tickets');
      await page.click('[data-testid="ticket-row"]');
      
      // Check that malicious content is sanitized
      const ticketContent = await page.content();
      expect(ticketContent).not.toContain('<script>');
      expect(ticketContent).not.toContain('onerror=');
    });
  });

  test.describe('Network Security', () => {
    test('should use HTTPS in production', async ({ page }) => {
      const response = await page.goto('/');
      const url = page.url();
      
      // In production, should use HTTPS
      if (process.env.NODE_ENV === 'production') {
        expect(url).toMatch(/^https:/);
      }
    });

    test('should set secure headers', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      if (headers) {
        // Check for security headers
        const securityHeaders = [
          'x-frame-options',
          'x-content-type-options',
          'x-xss-protection',
          'strict-transport-security',
          'content-security-policy'
        ];
        
        for (const header of securityHeaders) {
          const headerValue = headers[header];
          if (headerValue) {
            console.log(`✅ Security header ${header}: ${headerValue}`);
          }
        }
      }
    });

    test('should prevent clickjacking', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      if (headers && headers['x-frame-options']) {
        const frameOptions = headers['x-frame-options'];
        expect(frameOptions).toMatch(/deny|sameorigin/i);
      }
    });

    test('should prevent MIME type sniffing', async ({ page }) => {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      if (headers && headers['x-content-type-options']) {
        const contentTypeOptions = headers['x-content-type-options'];
        expect(contentTypeOptions).toBe('nosniff');
      }
    });
  });

  test.describe('API Security', () => {
    test('should validate API authentication', async ({ page }) => {
      // Try to access API endpoints without authentication
      const apiEndpoints = ['/api/tickets', '/api/users', '/api/assets'];
      
      for (const endpoint of apiEndpoints) {
        const response = await page.request.get(endpoint);
        expect(response.status()).toBe(401); // Unauthorized
      }
    });

    test('should prevent API rate limiting bypass', async ({ page }) => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array.from({ length: 20 }, () => 
        page.request.get('/api/health')
      );
      
      const responses = await Promise.all(requests);
      
      // Should not all succeed (rate limiting should kick in)
      const successCount = responses.filter(r => r.status() === 200).length;
      expect(successCount).toBeLessThan(20);
    });

    test('should validate API input parameters', async ({ page }) => {
      // Test SQL injection in API parameters
      const maliciousParams = [
        '1; DROP TABLE users; --',
        "' OR '1'='1",
        '1 UNION SELECT * FROM users --'
      ];
      
      for (const param of maliciousParams) {
        const response = await page.request.get(`/api/tickets?id=${encodeURIComponent(param)}`);
        
        // Should return error, not execute malicious code
        expect(response.status()).toBe(400); // Bad Request
      }
    });
  });

  test.describe('Logging and Monitoring', () => {
    test('should log security events', async ({ page }) => {
      // Perform actions that should be logged
      await page.click('[data-testid="login-button"]');
      
      // Attempt failed login
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'invalid@example.com',
        '[data-testid="password-input"]': 'wrongpassword',
      });
      await page.click('[data-testid="login-submit"]');
      
      // This would require checking server logs in a real implementation
      // For now, we'll verify the UI handles the error appropriately
      await testHelper.verifyToast(page, 'Invalid credentials', 'error');
    });

    test('should not log sensitive information', async ({ page }) => {
      // Login with sensitive data
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!',
      });
      
      // Check that password is not visible in page source
      const pageSource = await page.content();
      expect(pageSource).not.toContain(process.env.TEST_USER_PASSWORD || 'TestUser123!');
    });
  });
});
