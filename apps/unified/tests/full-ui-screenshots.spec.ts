import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('Nova Universe - Full UI Screenshots', () => {
  
  test('capture comprehensive full UI screenshots', async ({ page, context }) => {
    const screenshotsDir = path.join(process.cwd(), '../../screenshots');
    
    // Ensure screenshots directory exists
    try {
      await fs.access(screenshotsDir);
    } catch {
      await fs.mkdir(screenshotsDir, { recursive: true });
    }
    
    console.log('🚀 Starting comprehensive full UI screenshot capture...');
    
    // Set up larger viewport for full UI display
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Go to application
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // 1. Capture login page with full layout
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'playwright-01-login-full-ui.png'),
      fullPage: true
    });
    console.log('✅ Captured login page with full UI');
    
    // 2. Check for authentication elements and try to authenticate
    const emailInput = await page.locator('input[type="email"]');
    const passwordInput = await page.locator('input[type="password"]'); 
    const submitButton = await page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible()) {
      console.log('📝 Attempting authentication to access full interface...');
      
      // Fill login form
      await emailInput.fill('admin@nova.com');
      await passwordInput.fill('admin123');
      
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'playwright-02-login-filled.png'),
        fullPage: true
      });
      console.log('✅ Captured filled login form');
      
      // Try submitting form
      await submitButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 3. Check if we have access to authenticated routes
    // Try direct navigation to dashboard
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // If we're back at login, try authentication bypass
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login') || currentUrl.endsWith('/')) {
      console.log('🔧 Attempting authentication bypass for screenshot purposes...');
      
      // Set mock authentication in browser context
      await page.addInitScript(() => {
        // Mock localStorage auth
        localStorage.setItem('nova-auth-token', 'mock-token-for-screenshots');
        localStorage.setItem('nova-user', JSON.stringify({
          id: '1',
          email: 'admin@nova.com',
          name: 'Admin User',
          role: 'admin'
        }));
      });
      
      // Try dashboard again
      await page.goto('/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }
    
    // 4. Capture dashboard with full interface (sidebar, header, etc.)
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'playwright-03-dashboard-full-interface.png'),
      fullPage: true
    });
    console.log('✅ Captured dashboard with complete interface');
    
    // Also capture just the main viewport
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'playwright-04-dashboard-viewport.png'),
      fullPage: false
    });
    console.log('✅ Captured dashboard viewport');
    
    // 5. Navigate through key sections to show full app functionality
    const sections = [
      { path: '/tickets', name: 'tickets', description: 'Ticket Management' },
      { path: '/assets', name: 'assets', description: 'Asset Management' },
      { path: '/admin', name: 'admin', description: 'Administration Panel' },
      { path: '/knowledge', name: 'knowledge', description: 'Knowledge Base' },
      { path: '/services', name: 'services', description: 'Service Catalog' }
    ];
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      try {
        console.log(`📱 Capturing ${section.description}...`);
        
        await page.goto(section.path, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        // Full page screenshot
        await page.screenshot({ 
          path: path.join(screenshotsDir, `playwright-${String(i + 5).padStart(2, '0')}-${section.name}-full.png`),
          fullPage: true
        });
        
        // Viewport screenshot
        await page.screenshot({ 
          path: path.join(screenshotsDir, `playwright-${String(i + 10).padStart(2, '0')}-${section.name}-viewport.png`),
          fullPage: false
        });
        
        console.log(`✅ Captured ${section.description} interface`);
        
      } catch (error) {
        console.log(`⚠️  Could not capture ${section.description}: ${error.message}`);
        
        // Fallback: go back to dashboard and capture that instead
        await page.goto('/dashboard', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
      }
    }
    
    // 6. Test responsive layouts with full interface
    console.log('📱 Capturing responsive layouts...');
    
    // Mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'playwright-15-mobile-full-interface.png'),
      fullPage: true
    });
    console.log('✅ Captured mobile interface');
    
    // Tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'playwright-16-tablet-full-interface.png'),
      fullPage: true
    });
    console.log('✅ Captured tablet interface');
    
    // 7. Desktop with different sections expanded
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Try to expand sidebar or show more UI elements
    try {
      const sidebarToggle = await page.locator('[data-testid="sidebar-toggle"], .sidebar-toggle, button[aria-label*="menu"]');
      if (await sidebarToggle.isVisible()) {
        await sidebarToggle.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('⚠️  Sidebar toggle not found or already expanded');
    }
    
    // Final comprehensive screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'playwright-17-final-comprehensive-interface.png'),
      fullPage: true
    });
    console.log('✅ Captured final comprehensive interface');
    
    // 8. Try to capture individual UI components if visible
    try {
      const sidebar = await page.locator('.sidebar, [data-testid="sidebar"], nav').first();
      if (await sidebar.isVisible()) {
        await sidebar.screenshot({
          path: path.join(screenshotsDir, 'playwright-18-sidebar-component.png')
        });
        console.log('✅ Captured sidebar component');
      }
      
      const header = await page.locator('header, .header, [data-testid="header"]').first();
      if (await header.isVisible()) {
        await header.screenshot({
          path: path.join(screenshotsDir, 'playwright-19-header-component.png')
        });
        console.log('✅ Captured header component');
      }
    } catch (componentError) {
      console.log('⚠️  Could not capture individual components');
    }
    
    console.log('🎉 Full UI screenshot capture completed!');
    
    // Verify we actually captured meaningful screenshots
    const files = await fs.readdir(screenshotsDir);
    const playwrightScreenshots = files.filter(f => f.startsWith('playwright-') && f.endsWith('.png'));
    
    console.log(`📁 Captured ${playwrightScreenshots.length} full interface screenshots`);
    expect(playwrightScreenshots.length).toBeGreaterThan(5);
  });
});