import { test, expect } from '@playwright/test';

test.describe('UI Investigation', () => {
  test('investigate current UI state', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('Page error:', err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see what's rendered
    await page.screenshot({ path: 'current-ui-state.png', fullPage: true });
    
    // Log the page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Log the page HTML structure
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body content preview:', bodyHTML.substring(0, 1000));
    
    // Check what elements are present
    const elementCounts = {
      divs: await page.locator('div').count(),
      buttons: await page.locator('button').count(),
      inputs: await page.locator('input').count(),
      navs: await page.locator('nav').count(),
      headers: await page.locator('header').count(),
      links: await page.locator('a').count(),
    };
    
    console.log('Element counts:', elementCounts);
    
    // Check for React app root
    const reactRoot = await page.locator('#root').count();
    console.log('React root elements:', reactRoot);
    
    // Check for any error messages
    const errorElements = await page.locator('[data-testid*="error"], .error, [class*="error"]').count();
    console.log('Error elements found:', errorElements);
    
    if (errorElements > 0) {
      const errorTexts = await page.locator('[data-testid*="error"], .error, [class*="error"]').allTextContents();
      console.log('Error texts:', errorTexts);
    }
  });
});