import { test, expect } from '@playwright/test';
import { testHelper } from '../utils/test-helpers';

test.describe('Authentication System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await testHelper.waitForPageLoad(page);
  });

  test.describe('Login Flow', () => {
    test('should display login form', async ({ page }) => {
      // Navigate to login page
      await page.click('[data-testid="login-button"]');
      
      // Verify login form elements
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-submit"]')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      // Try to submit empty form
      await page.click('[data-testid="login-submit"]');
      
      // Verify validation messages
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      // Enter invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-submit"]');
      
      // Verify email validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      // Fill login form
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!'
      });
      
      // Submit form
      await page.click('[data-testid="login-submit"]');
      
      // Wait for successful login
      await testHelper.waitForApiResponse(page, '/auth/login', 200);
      
      // Verify redirect to dashboard
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      // Fill login form with invalid credentials
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'invalid@example.com',
        '[data-testid="password-input"]': 'wrongpassword'
      });
      
      // Submit form
      await page.click('[data-testid="login-submit"]');
      
      // Verify error message
      await testHelper.verifyToast(page, 'Invalid credentials', 'error');
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/auth/login', route => route.abort());
      
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'test@example.com',
        '[data-testid="password-input"]': 'password123'
      });
      
      await page.click('[data-testid="login-submit"]');
      
      // Verify error handling
      await testHelper.verifyToast(page, 'Network error', 'error');
    });
  });

  test.describe('Registration Flow', () => {
    test('should display registration form', async ({ page }) => {
      await page.click('[data-testid="register-button"]');
      
      // Verify registration form elements
      await expect(page.locator('[data-testid="register-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="first-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="last-name-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.click('[data-testid="register-button"]');
      
      // Fill form with weak password
      await testHelper.fillFormFields(page, {
        '[data-testid="first-name-input"]': 'Test',
        '[data-testid="last-name-input"]': 'User',
        '[data-testid="email-input"]': 'newuser@test.nova.com',
        '[data-testid="password-input"]': 'weak',
        '[data-testid="confirm-password-input"]': 'weak'
      });
      
      await page.click('[data-testid="register-submit"]');
      
      // Verify password strength validation
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toContainText('stronger');
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.click('[data-testid="register-button"]');
      
      // Fill form with mismatched passwords
      await testHelper.fillFormFields(page, {
        '[data-testid="first-name-input"]': 'Test',
        '[data-testid="last-name-input"]': 'User',
        '[data-testid="email-input"]': 'newuser@test.nova.com',
        '[data-testid="password-input"]': 'StrongPassword123!',
        '[data-testid="confirm-password-input"]': 'DifferentPassword123!'
      });
      
      await page.click('[data-testid="register-submit"]');
      
      // Verify password confirmation error
      await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('match');
    });

    test('should successfully register new user', async ({ page }) => {
      await page.click('[data-testid="register-button"]');
      
      const testEmail = `newuser${Date.now()}@test.nova.com`;
      
      // Fill registration form
      await testHelper.fillFormFields(page, {
        '[data-testid="first-name-input"]': 'New',
        '[data-testid="last-name-input"]': 'User',
        '[data-testid="email-input"]': testEmail,
        '[data-testid="password-input"]': 'StrongPassword123!',
        '[data-testid="confirm-password-input"]': 'StrongPassword123!'
      });
      
      // Submit form
      await page.click('[data-testid="register-submit"]');
      
      // Wait for successful registration
      await testHelper.waitForApiResponse(page, '/auth/register', 201);
      
      // Verify success message
      await testHelper.verifyToast(page, 'Registration successful', 'success');
      
      // Verify redirect to login
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    });
  });

  test.describe('Password Reset', () => {
    test('should display password reset form', async ({ page }) => {
      await page.click('[data-testid="forgot-password-button"]');
      
      // Verify password reset form
      await expect(page.locator('[data-testid="password-reset-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="reset-submit"]')).toBeVisible();
    });

    test('should send password reset email', async ({ page }) => {
      await page.click('[data-testid="forgot-password-button"]');
      
      // Fill email
      await page.fill('[data-testid="email-input"]', 'testuser@nova.com');
      await page.click('[data-testid="reset-submit"]');
      
      // Verify success message
      await testHelper.verifyToast(page, 'Reset email sent', 'success');
    });
  });

  test.describe('Logout Flow', () => {
    test('should successfully logout user', async ({ page }) => {
      // First login
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!'
      });
      await page.click('[data-testid="login-submit"]');
      
      // Wait for login to complete
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // Verify redirect to home page
      await expect(page).toHaveURL('/');
      
      // Verify login button is visible
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session on page refresh', async ({ page }) => {
      // Login
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': process.env.TEST_USER_EMAIL || 'testuser@nova.com',
        '[data-testid="password-input"]': process.env.TEST_USER_PASSWORD || 'TestUser123!'
      });
      await page.click('[data-testid="login-submit"]');
      
      // Wait for login to complete
      await expect(page).toHaveURL(/.*dashboard/);
      
      // Refresh page
      await page.reload();
      
      // Verify still logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should handle expired token gracefully', async ({ page }) => {
      // This test would require mocking an expired token
      // For now, we'll verify the UI handles token errors
      await page.click('[data-testid="login-button"]');
      await testHelper.fillFormFields(page, {
        '[data-testid="email-input"]': 'expired@example.com',
        '[data-testid="password-input"]': 'password123'
      });
      await page.click('[data-testid="login-submit"]');
      
      // Mock expired token response
      await page.route('**/auth/login', route => 
        route.fulfill({ 
          status: 401, 
          body: JSON.stringify({ error: 'Token expired' }) 
        })
      );
      
      // Verify error handling
      await testHelper.verifyToast(page, 'Token expired', 'error');
    });
  });

  test.describe('Accessibility', () => {
    test('should meet accessibility standards', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      await testHelper.verifyAccessibility(page);
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on all screen sizes', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      await testHelper.verifyResponsiveDesign(page);
    });
  });
});
