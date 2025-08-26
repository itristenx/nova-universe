import { Page, expect } from '@playwright/test';
import axios from 'axios';

export interface TestUser {
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'TECHNICIAN';
  token?: string;
}

export interface TestData {
  organization: {
    name: string;
    description: string;
  };
  category: {
    name: string;
    description: string;
  };
  ticket: {
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  };
  asset: {
    name: string;
    type: 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'FACILITY';
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'RETIRED';
  };
}

export class TestHelper {
  private apiBaseUrl: string;
  private databaseUrl: string;

  constructor() {
    this.apiBaseUrl = process.env.TEST_API_URL || 'http://localhost:3000';
    this.databaseUrl = process.env.TEST_DATABASE_URL || 'postgresql://nova_admin:nova_password@localhost:5432/nova_universe_test';
  }

  /**
   * Authenticate a user and return the token
   */
  async authenticateUser(email: string, password: string): Promise<string> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/auth/login`, {
        email,
        password
      });
      return response.data.token;
    } catch (error) {
      throw new Error(`Authentication failed for ${email}: ${error}`);
    }
  }

  /**
   * Create test data via API
   */
  async createTestData(token: string, data: Partial<TestData>): Promise<any> {
    const headers = { Authorization: `Bearer ${token}` };
    const result: any = {};

    if (data.organization) {
      const orgResponse = await axios.post(
        `${this.apiBaseUrl}/organizations`,
        data.organization,
        { headers }
      );
      result.organization = orgResponse.data;
    }

    if (data.category && result.organization) {
      const catResponse = await axios.post(
        `${this.apiBaseUrl}/categories`,
        {
          ...data.category,
          organizationId: result.organization.id
        },
        { headers }
      );
      result.category = catResponse.data;
    }

    if (data.ticket && result.category) {
      const ticketResponse = await axios.post(
        `${this.apiBaseUrl}/tickets`,
        {
          ...data.ticket,
          categoryId: result.category.id,
          organizationId: result.organization.id
        },
        { headers }
      );
      result.ticket = ticketResponse.data;
    }

    if (data.asset && result.organization) {
      const assetResponse = await axios.post(
        `${this.apiBaseUrl}/assets`,
        {
          ...data.asset,
          organizationId: result.organization.id
        },
        { headers }
      );
      result.asset = assetResponse.data;
    }

    return result;
  }

  /**
   * Clean up test data via API
   */
  async cleanupTestData(token: string, data: any): Promise<void> {
    const headers = { Authorization: `Bearer ${token}` };

    if (data.ticket) {
      try {
        await axios.delete(`${this.apiBaseUrl}/tickets/${data.ticket.id}`, { headers });
      } catch (error) {
        console.log(`Could not delete ticket: ${error}`);
      }
    }

    if (data.asset) {
      try {
        await axios.delete(`${this.apiBaseUrl}/assets/${data.asset.id}`, { headers });
      } catch (error) {
        console.log(`Could not delete asset: ${error}`);
      }
    }

    if (data.category) {
      try {
        await axios.delete(`${this.apiBaseUrl}/categories/${data.category.id}`, { headers });
      } catch (error) {
        console.log(`Could not delete category: ${error}`);
      }
    }

    if (data.organization) {
      try {
        await axios.delete(`${this.apiBaseUrl}/organizations/${data.organization.id}`, { headers });
      } catch (error) {
        console.log(`Could not delete organization: ${error}`);
      }
    }
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for API response and verify status
   */
  async waitForApiResponse(page: Page, urlPattern: string, expectedStatus: number = 200): Promise<void> {
    const response = await page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === expectedStatus
    );
    expect(response.status()).toBe(expectedStatus);
  }

  /**
   * Fill form fields with validation
   */
  async fillFormFields(page: Page, fields: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(fields)) {
      await page.fill(selector, value);
      // Verify the field was filled correctly
      const fieldValue = await page.inputValue(selector);
      expect(fieldValue).toBe(value);
    }
  }

  /**
   * Verify toast notification
   */
  async verifyToast(page: Page, expectedMessage: string, type: 'success' | 'error' | 'info' = 'success'): Promise<void> {
    const toastSelector = `[data-testid="toast-${type}"]`;
    await page.waitForSelector(toastSelector, { timeout: 10000 });
    
    const toastText = await page.textContent(toastSelector);
    expect(toastText).toContain(expectedMessage);
  }

  /**
   * Verify table data
   */
  async verifyTableData(page: Page, tableSelector: string, expectedData: Record<string, string>[]): Promise<void> {
    const table = page.locator(tableSelector);
    await expect(table).toBeVisible();

    for (const rowData of expectedData) {
      for (const [column, expectedValue] of Object.entries(rowData)) {
        const cell = table.locator(`td:has-text("${expectedValue}")`);
        await expect(cell).toBeVisible();
      }
    }
  }

  /**
   * Navigate to a route and verify it loads
   */
  async navigateToRoute(page: Page, route: string, expectedTitle?: string): Promise<void> {
    await page.goto(route);
    await this.waitForPageLoad(page);
    
    if (expectedTitle) {
      await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
    }
  }

  /**
   * Perform search and verify results
   */
  async performSearch(page: Page, searchTerm: string, expectedResults: string[]): Promise<void> {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
    
    await page.waitForLoadState('networkidle');
    
    for (const expectedResult of expectedResults) {
      const resultElement = page.locator(`text=${expectedResult}`);
      await expect(resultElement).toBeVisible();
    }
  }

  /**
   * Verify responsive design breakpoints
   */
  async verifyResponsiveDesign(page: Page): Promise<void> {
    const breakpoints = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1024, height: 768, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize(breakpoint);
      await page.waitForTimeout(500); // Wait for layout adjustments
      
      // Verify key elements are visible at this breakpoint
      const mainContent = page.locator('[data-testid="main-content"]');
      await expect(mainContent).toBeVisible();
      
      console.log(`✅ Responsive design verified for ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
    }
  }

  /**
   * Verify accessibility compliance
   */
  async verifyAccessibility(page: Page): Promise<void> {
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper form labels
    const inputs = await page.locator('input, select, textarea').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
    
    console.log('✅ Accessibility compliance verified');
  }
}

export const testHelper = new TestHelper();
