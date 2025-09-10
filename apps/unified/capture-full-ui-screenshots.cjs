const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function captureFullUIScreenshots() {
    console.log('🚀 Capturing full Nova Universe UI screenshots with complete interface...');
    
    const browser = await chromium.launch({ 
        headless: false, // Show browser for better debugging
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        slowMo: 1000 // Add delay to see what's happening
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    try {
        const screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        
        console.log('📸 Capturing comprehensive Nova Universe full UI...');
        
        // Start development servers first
        console.log('⚠️  Make sure to run: npm run dev (in unified) and npm start (in api) before running this script');
        
        // 1. Navigate to the main application
        await page.goto('http://localhost:3002', { 
            waitUntil: 'networkidle', 
            timeout: 30000 
        });
        await page.waitForTimeout(3000);
        
        // Check current state
        const title = await page.title();
        console.log(`Current page title: ${title}`);
        
        // 2. Check if we're on login page
        const loginHeading = await page.$('h1');
        if (loginHeading) {
            const headingText = await loginHeading.textContent();
            console.log(`Heading text: ${headingText}`);
            
            if (headingText?.includes('Login')) {
                console.log('📝 On login page - attempting to authenticate...');
                
                // Try to fill login form with test credentials
                try {
                    await page.fill('input[type="email"]', 'admin@nova.com');
                    await page.fill('input[type="password"]', 'admin123');
                    
                    await page.screenshot({ 
                        path: path.join(screenshotsDir, 'full-ui-01-login-form-filled.png'),
                        fullPage: true
                    });
                    console.log('✅ Captured login form with credentials');
                    
                    // Submit the form
                    await page.click('button[type="submit"]');
                    await page.waitForTimeout(5000);
                    
                    // Check if we were redirected
                    const newUrl = page.url();
                    console.log(`After login attempt, URL: ${newUrl}`);
                    
                } catch (loginError) {
                    console.log('⚠️ Login attempt failed:', loginError.message);
                }
            }
        }
        
        // 3. Try to bypass authentication by directly navigating to dashboard
        console.log('🔄 Attempting to access dashboard directly...');
        
        // Check for authentication bypass methods
        // Method 1: Try localStorage bypass
        await page.evaluate(() => {
            // Set mock authentication in localStorage
            const mockAuth = {
                user: {
                    id: '1',
                    email: 'admin@nova.com', 
                    name: 'Admin User',
                    role: 'admin'
                },
                token: 'mock-token',
                isAuthenticated: true
            };
            localStorage.setItem('nova-auth', JSON.stringify(mockAuth));
        });
        
        // Method 2: Navigate directly to dashboard
        await page.goto('http://localhost:3002/dashboard', { 
            waitUntil: 'networkidle',
            timeout: 15000 
        });
        await page.waitForTimeout(3000);
        
        // 4. Capture the dashboard with full UI
        console.log('📸 Capturing dashboard with full interface...');
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'full-ui-02-dashboard-complete.png'),
            fullPage: true
        });
        console.log('✅ Captured complete dashboard interface');
        
        // 5. Try to show sidebar if it's collapsed
        try {
            const sidebarToggle = await page.$('[data-testid="sidebar-toggle"], .sidebar-toggle, button[aria-label*="menu"]');
            if (sidebarToggle) {
                await sidebarToggle.click();
                await page.waitForTimeout(1000);
            }
        } catch (e) {
            console.log('⚠️ Could not toggle sidebar:', e.message);
        }
        
        // 6. Navigate through different sections to show full UI
        const sections = [
            { path: '/tickets', name: 'tickets', title: 'Tickets Management' },
            { path: '/assets', name: 'assets', title: 'Asset Management' }, 
            { path: '/admin', name: 'admin', title: 'Administration Panel' },
            { path: '/ai', name: 'ai', title: 'AI Assistant' },
            { path: '/profile', name: 'profile', title: 'User Profile' }
        ];
        
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            try {
                console.log(`📱 Navigating to ${section.title}...`);
                
                await page.goto(`http://localhost:3002${section.path}`, { 
                    waitUntil: 'networkidle',
                    timeout: 10000 
                });
                await page.waitForTimeout(2000);
                
                // Capture the full page
                await page.screenshot({ 
                    path: path.join(screenshotsDir, `full-ui-${String(i + 3).padStart(2, '0')}-${section.name}-page.png`),
                    fullPage: true
                });
                console.log(`✅ Captured ${section.title} with full interface`);
                
                // Also capture just the viewport (what user sees without scrolling)
                await page.screenshot({ 
                    path: path.join(screenshotsDir, `full-ui-${String(i + 8).padStart(2, '0')}-${section.name}-viewport.png`),
                    fullPage: false
                });
                console.log(`✅ Captured ${section.title} viewport`);
                
            } catch (navError) {
                console.log(`⚠️ Could not navigate to ${section.path}:`, navError.message);
            }
        }
        
        // 7. Test responsive layouts
        console.log('📱 Testing responsive layouts...');
        
        // Mobile layout
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'full-ui-13-mobile-dashboard.png'),
            fullPage: true
        });
        console.log('✅ Captured mobile responsive dashboard');
        
        // Tablet layout
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'full-ui-14-tablet-dashboard.png'),
            fullPage: true
        });
        console.log('✅ Captured tablet responsive dashboard');
        
        // 8. Back to desktop for final comprehensive screenshot
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('http://localhost:3002/dashboard', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // Final screenshot showing the complete interface
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'full-ui-15-final-comprehensive.png'),
            fullPage: true
        });
        console.log('✅ Captured final comprehensive interface');
        
        // 9. Try to capture specific UI components
        try {
            // Look for navigation/sidebar
            const sidebar = await page.$('.sidebar, [data-testid="sidebar"], nav');
            if (sidebar) {
                await sidebar.screenshot({
                    path: path.join(screenshotsDir, 'full-ui-16-sidebar-component.png')
                });
                console.log('✅ Captured sidebar component');
            }
            
            // Look for header
            const header = await page.$('header, .header, [data-testid="header"]');
            if (header) {
                await header.screenshot({
                    path: path.join(screenshotsDir, 'full-ui-17-header-component.png')
                });
                console.log('✅ Captured header component');
            }
        } catch (componentError) {
            console.log('⚠️ Could not capture individual components:', componentError.message);
        }
        
        console.log('🎉 Full UI screenshot capture completed!');
        
        // List all captured files
        const files = fs.readdirSync(screenshotsDir).filter(f => f.startsWith('full-ui-') && f.endsWith('.png'));
        console.log(`📁 Captured ${files.length} full UI screenshots:`);
        files.sort().forEach(file => console.log(`  📸 ${file}`));
        
    } catch (error) {
        console.error('❌ Error during full UI screenshot capture:', error);
        console.error(error.stack);
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    captureFullUIScreenshots().catch(console.error);
}

module.exports = { captureFullUIScreenshots };