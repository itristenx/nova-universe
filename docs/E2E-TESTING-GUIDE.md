# E2E Testing Implementation Guide

**Date**: October 9, 2025  
**Status**: Framework Ready - Tests TODO  
**Estimated Time**: 2-3 hours

---

## Overview

The Playwright E2E testing framework is already configured. This guide provides test implementation patterns for all major features.

---

## Test Structure

```
apps/unified/tests/e2e/
├── auth/
│   ├── login.spec.ts
│   ├── logout.spec.ts
│   ├── token-refresh.spec.ts
│   └── rbac.spec.ts
├── knowledge/
│   ├── knowledge-base.spec.ts
│   └── article-crud.spec.ts
├── services/
│   └── service-catalog.spec.ts
├── admin/
│   ├── alerts.spec.ts
│   ├── webhooks.spec.ts
│   ├── changes.spec.ts
│   ├── workflows.spec.ts
│   └── approvals.spec.ts
└── common/
    ├── navigation.spec.ts
    └── error-handling.spec.ts
```

---

## 1. Authentication Tests

### File: `tests/e2e/auth/login.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill login form
    await page.fill('input[name="email"]', 'admin@nova-universe.com');
    await page.fill('input[name="password"]', 'Admin123!');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Should show user name
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/Login failed|Invalid/i')).toBeVisible();
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=/required|cannot be empty/i')).toBeVisible();
  });

  test('should remember user when "Remember me" is checked', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@nova-universe.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.check('input[name="rememberMe"]');
    
    await page.click('button[type="submit"]');
    
    // Check localStorage has tokens
    const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
    expect(localStorage).toContain('nova_access_token');
  });
});
```

---

### File: `tests/e2e/auth/rbac.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('RBAC - Role-Based Access Control', () => {
  test('Admin user should see all features', async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@nova-universe.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Navigate to Change Management
    await page.goto('/admin/changes');
    
    // Should see "New Change Request" button (enabled)
    const createButton = page.locator('button:has-text("New Change Request")');
    await expect(createButton).toBeEnabled();
    
    // Should NOT see read-only badge
    await expect(page.locator('text=read-only access')).not.toBeVisible();
  });

  test('Approver user should see limited features', async ({ page }) => {
    // Login as approver
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'approver@example.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Navigate to Change Management
    await page.goto('/admin/changes');
    
    // Should see read-only badge
    await expect(page.locator('text=read-only access')).toBeVisible();
    
    // Create button should be disabled
    const createButton = page.locator('button:has-text("New Change Request")');
    await expect(createButton).toBeDisabled();
    
    // Hovering should show tooltip
    await createButton.hover();
    await expect(page.locator('text=/Only admins/i')).toBeVisible();
  });

  test('Regular user should have read-only access', async ({ page }) => {
    // Login as regular user
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Navigate to workflows
    await page.goto('/admin/workflows');
    
    // Should see read-only badge
    await expect(page.locator('text=read-only access')).toBeVisible();
    
    // All action buttons should be disabled
    const newWorkflowButton = page.locator('button:has-text("New Workflow")');
    await expect(newWorkflowButton).toBeDisabled();
  });

  test('Workflow Admin should manage workflows only', async ({ page }) => {
    // Login as workflow admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'workflow-admin@example.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Can create workflows
    await page.goto('/admin/workflows');
    const createButton = page.locator('button:has-text("New Workflow")');
    await expect(createButton).toBeEnabled();
    
    // Cannot create changes
    await page.goto('/admin/changes');
    const createChangeButton = page.locator('button:has-text("New Change Request")');
    await expect(createChangeButton).toBeDisabled();
  });
});
```

---

## 2. CRUD Operation Tests

### File: `tests/e2e/admin/alerts.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Alert Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@nova-universe.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Navigate to alerts
    await page.goto('/admin/alerts');
  });

  test('should create new alert rule', async ({ page }) => {
    // Click "Create Rule" button
    await page.click('button:has-text("Create Rule")');
    
    // Fill form
    await page.fill('input[name="name"]', 'Test Alert Rule');
    await page.fill('textarea[name="description"]', 'Test description');
    await page.selectOption('select[name="severity"]', 'HIGH');
    await page.fill('input[name="condition"]', 'cpu > 80');
    
    // Submit
    await page.click('button:has-text("Create")');
    
    // Should show success toast
    await expect(page.locator('text=/successfully created/i')).toBeVisible();
    
    // Should appear in list
    await expect(page.locator('text=Test Alert Rule')).toBeVisible();
  });

  test('should edit existing alert rule', async ({ page }) => {
    // Click edit button on first rule
    await page.click('[data-testid="alert-rule-item"]:first-child button:has-text("Edit")');
    
    // Update name
    await page.fill('input[name="name"]', 'Updated Rule Name');
    
    // Save
    await page.click('button:has-text("Save")');
    
    // Should show success
    await expect(page.locator('text=/successfully updated/i')).toBeVisible();
  });

  test('should delete alert rule', async ({ page }) => {
    const initialCount = await page.locator('[data-testid="alert-rule-item"]').count();
    
    // Click delete on first rule
    await page.click('[data-testid="alert-rule-item"]:first-child button:has-text("Delete")');
    
    // Confirm deletion
    await page.click('button:has-text("Confirm")');
    
    // Should show success
    await expect(page.locator('text=/successfully deleted/i')).toBeVisible();
    
    // Count should decrease
    const newCount = await page.locator('[data-testid="alert-rule-item"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should acknowledge active alert', async ({ page }) => {
    // Click acknowledge on first active alert
    await page.click('[data-testid="active-alert"]:first-child button:has-text("Acknowledge")');
    
    // Should show success
    await expect(page.locator('text=/acknowledged/i')).toBeVisible();
  });

  test('should resolve alert', async ({ page }) => {
    // Click resolve on first alert
    await page.click('[data-testid="active-alert"]:first-child button:has-text("Resolve")');
    
    // Should show success
    await expect(page.locator('text=/resolved/i')).toBeVisible();
  });

  test('should display alert stats', async ({ page }) => {
    // Check stats cards are visible
    await expect(page.locator('text=Total Alerts')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();
    await expect(page.locator('text=Critical')).toBeVisible();
  });
});
```

---

### File: `tests/e2e/admin/changes.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Change Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@nova-universe.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.goto('/admin/changes');
  });

  test('should create new change request', async ({ page }) => {
    await page.click('button:has-text("New Change Request")');
    
    // Fill form
    await page.fill('input[name="shortDescription"]', 'Test Change');
    await page.fill('textarea[name="description"]', 'Detailed description');
    await page.selectOption('select[name="priority"]', 'HIGH');
    await page.selectOption('select[name="changeType"]', 'NORMAL');
    await page.fill('input[name="startDate"]', '2025-10-15');
    await page.fill('input[name="endDate"]', '2025-10-16');
    
    await page.click('button:has-text("Create Change")');
    
    await expect(page.locator('text=/successfully created/i')).toBeVisible();
  });

  test('should switch between list and calendar views', async ({ page }) => {
    // Default is list view
    await expect(page.locator('[data-view="list"]')).toBeVisible();
    
    // Click calendar view
    await page.click('button:has-text("Calendar")');
    
    // Calendar should be visible
    await expect(page.locator('[data-view="calendar"]')).toBeVisible();
  });

  test('should filter changes by state', async ({ page }) => {
    // Open filters
    await page.click('button:has-text("Filters")');
    
    // Select state
    await page.selectOption('select[name="state"]', 'NEW');
    
    // Apply filters
    await page.click('button:has-text("Apply")');
    
    // All visible changes should have NEW state
    const changes = page.locator('[data-testid="change-item"]');
    const count = await changes.count();
    
    for (let i = 0; i < count; i++) {
      const badge = changes.nth(i).locator('.badge');
      await expect(badge).toHaveText('NEW');
    }
  });

  test('should approve change request', async ({ page }) => {
    // Find change in ASSESSMENT state
    const changeInAssessment = page.locator('[data-state="ASSESSMENT"]:first-child');
    
    // Click approve
    await changeInAssessment.locator('button:has-text("Approve")').click();
    
    // Should show success
    await expect(page.locator('text=/approved/i')).toBeVisible();
  });

  test('should reject change request with reason', async ({ page }) => {
    const changeInAssessment = page.locator('[data-state="ASSESSMENT"]:first-child');
    
    await changeInAssessment.locator('button:has-text("Reject")').click();
    
    // Fill rejection reason
    await page.fill('textarea[name="reason"]', 'Not enough justification');
    
    await page.click('button:has-text("Confirm Reject")');
    
    await expect(page.locator('text=/rejected/i')).toBeVisible();
  });
});
```

---

## 3. Error Handling Tests

### File: `tests/e2e/common/error-handling.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('should show error when API is down', async ({ page, context }) => {
    // Block all API requests
    await context.route('**/api/**', route => route.abort());
    
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@nova-universe.com');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Should show network error
    await expect(page.locator('text=/network error|failed to connect/i')).toBeVisible();
  });

  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    
    await expect(page.locator('text=/404|not found/i')).toBeVisible();
  });

  test('should retry failed requests', async ({ page, context }) => {
    let attemptCount = 0;
    
    await context.route('**/api/knowledge/popular', route => {
      attemptCount++;
      if (attemptCount < 3) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    await page.goto('/knowledge');
    
    // Should eventually succeed after retries
    await expect(page.locator('[data-testid="article-item"]')).toBeVisible({ timeout: 10000 });
  });

  test('should show validation errors on form submission', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '123'); // Too short
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/invalid email/i')).toBeVisible();
    await expect(page.locator('text=/password.*too short/i')).toBeVisible();
  });
});
```

---

## 4. Performance Tests

### File: `tests/e2e/common/performance.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('pages should load within 3 seconds', async ({ page }) => {
    const pages = [
      '/dashboard',
      '/knowledge',
      '/services',
      '/admin/changes',
      '/admin/workflows',
      '/admin/alerts',
    ];
    
    for (const url of pages) {
      const start = Date.now();
      await page.goto(url);
      const loadTime = Date.now() - start;
      
      expect(loadTime).toBeLessThan(3000);
    }
  });

  test('search should be debounced', async ({ page }) => {
    await page.goto('/knowledge');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    // Type quickly
    await searchInput.type('test query', { delay: 50 });
    
    // Should not make API calls for every keystroke
    // (This would require monitoring network requests)
  });

  test('should handle large datasets', async ({ page }) => {
    await page.goto('/admin/changes');
    
    // Load page with 100+ items
    await expect(page.locator('[data-testid="change-item"]')).toHaveCount(100, { timeout: 5000 });
    
    // Scrolling should be smooth
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100);
    
    // Page should still be responsive
    await expect(page.locator('button')).toBeEnabled();
  });
});
```

---

## 5. Running Tests

### Run all tests:
```bash
pnpm --filter @nova-universe/unified test:e2e
```

### Run specific test file:
```bash
pnpm --filter @nova-universe/unified test:e2e tests/e2e/auth/login.spec.ts
```

### Run in headed mode (see browser):
```bash
pnpm --filter @nova-universe/unified test:e2e --headed
```

### Run in debug mode:
```bash
pnpm --filter @nova-universe/unified test:e2e --debug
```

### Generate report:
```bash
pnpm --filter @nova-universe/unified test:e2e --reporter=html
```

---

## Test Data Setup

### Before Running Tests

1. **Seed database with test data**:
```bash
cd /Users/tneibarger/nova-universe
node scripts/seed-database.js
```

2. **Ensure test users exist**:
- admin@nova-universe.com / Admin123!
- approver@example.com / Admin123!
- user@example.com / Admin123!
- workflow-admin@example.com / Admin123!

3. **Start backend and frontend**:
```bash
# Terminal 1: Backend
API_PORT=3001 pnpm --filter @nova-universe/api dev

# Terminal 2: Frontend
pnpm --filter @nova-universe/unified dev
```

---

## Test Coverage Goals

| Feature | Target Coverage |
|---------|----------------|
| Authentication | 100% |
| RBAC | 100% |
| CRUD Operations | 90% |
| Error Handling | 80% |
| Navigation | 100% |
| Forms | 90% |
| Search | 80% |
| Filters | 80% |

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Start services
        run: |
          pnpm --filter @nova-universe/api dev &
          pnpm --filter @nova-universe/unified dev &
          sleep 30
      
      - name: Run E2E tests
        run: pnpm --filter @nova-universe/unified test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/unified/playwright-report/
```

---

**Status**: Framework ready, tests TODO  
**Estimated Implementation Time**: 2-3 hours  
**Priority**: Medium (after RBAC completion)
