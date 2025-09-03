const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function captureComprehensiveUIFunctionality() {
    console.log('🚀 Capturing comprehensive Nova Universe UI functionality...');
    
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
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
        
        console.log('📸 Testing complete Nova Universe user workflows...');
        
        // 1. Start at the main page
        await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(3000);
        
        // Capture the initial login screen
        await page.screenshot({ 
            path: path.join(screenshotsDir, '01-nova-login-page.png'),
            fullPage: false 
        });
        console.log('✅ 01 - Captured Nova login page');

        // 2. Try to interact with the login form
        try {
            // Look for email input and fill it
            const emailInput = await page.$('input[type="email"], input[name="email"]');
            if (emailInput) {
                await emailInput.fill('test@nova.com');
                await page.waitForTimeout(1000);
                
                await page.screenshot({ 
                    path: path.join(screenshotsDir, '02-nova-login-with-email.png'),
                    fullPage: false 
                });
                console.log('✅ 02 - Captured login form with email filled');
                
                // Try to submit or continue
                const continueButton = await page.$('button:has-text("Continue"), button[type="submit"], .continue-button');
                if (continueButton) {
                    await continueButton.click();
                    await page.waitForTimeout(2000);
                    
                    await page.screenshot({ 
                        path: path.join(screenshotsDir, '03-nova-after-login-attempt.png'),
                        fullPage: false 
                    });
                    console.log('✅ 03 - Captured after login attempt');
                }
            }
        } catch (e) {
            console.log('⚠️ Login form interaction issue:', e.message);
        }

        // 3. Navigate to different routes to see if we can access dashboard
        const routes = [
            { path: '/dashboard', name: 'dashboard' },
            { path: '/tickets', name: 'tickets' },
            { path: '/tickets/create', name: 'create-ticket' },
            { path: '/admin', name: 'admin' },
            { path: '/profile', name: 'profile' },
            { path: '/settings', name: 'settings' }
        ];

        for (const route of routes) {
            try {
                await page.goto(`http://localhost:3002${route.path}`, { 
                    waitUntil: 'domcontentloaded', 
                    timeout: 5000 
                });
                await page.waitForTimeout(2000);
                
                // Check if we're redirected back to login
                const currentUrl = page.url();
                const isLoginPage = currentUrl.includes('/login') || currentUrl === 'http://localhost:3002/';
                
                if (!isLoginPage) {
                    await page.screenshot({ 
                        path: path.join(screenshotsDir, `04-nova-${route.name}-page.png`),
                        fullPage: false 
                    });
                    console.log(`✅ 04 - Captured ${route.name} page`);
                    
                    // If this is the dashboard, capture more details
                    if (route.name === 'dashboard') {
                        // Wait for any dynamic content to load
                        await page.waitForTimeout(3000);
                        
                        // Take a full page screenshot of dashboard
                        await page.screenshot({ 
                            path: path.join(screenshotsDir, '05-nova-dashboard-full.png'),
                            fullPage: true 
                        });
                        console.log('✅ 05 - Captured full dashboard page');
                        
                        // Look for navigation elements and quick actions
                        const quickActions = await page.$$('.quick-action, .card, .dashboard-card, [class*="action"], [class*="card"]');
                        if (quickActions.length > 0) {
                            console.log(`Found ${quickActions.length} dashboard elements`);
                            
                            await page.screenshot({ 
                                path: path.join(screenshotsDir, '06-nova-dashboard-with-content.png'),
                                fullPage: false 
                            });
                            console.log('✅ 06 - Captured dashboard with content');
                        }
                    }
                    
                    // If this is tickets page, look for ticket functionality
                    if (route.name === 'tickets' || route.name === 'create-ticket') {
                        await page.waitForTimeout(2000);
                        
                        // Look for ticket creation form
                        const ticketForm = await page.$('form, .ticket-form, .create-form, [class*="form"]');
                        if (ticketForm) {
                            await page.screenshot({ 
                                path: path.join(screenshotsDir, `07-nova-${route.name}-form.png`),
                                fullPage: false 
                            });
                            console.log(`✅ 07 - Captured ${route.name} with form`);
                            
                            // Try to fill out some form fields
                            try {
                                const titleInput = await page.$('input[name*="title"], input[placeholder*="title"], #title');
                                if (titleInput) {
                                    await titleInput.fill('Test Support Ticket');
                                    await page.waitForTimeout(500);
                                }
                                
                                const descInput = await page.$('textarea, .description, [name*="description"]');
                                if (descInput) {
                                    await descInput.fill('This is a test ticket to demonstrate Nova Universe functionality');
                                    await page.waitForTimeout(500);
                                }
                                
                                await page.screenshot({ 
                                    path: path.join(screenshotsDir, `08-nova-${route.name}-filled.png`),
                                    fullPage: false 
                                });
                                console.log(`✅ 08 - Captured ${route.name} with filled form`);
                            } catch (e) {
                                console.log('⚠️ Form filling issue:', e.message);
                            }
                        }
                    }
                } else {
                    console.log(`⚠️ ${route.name} route redirected to login`);
                }
            } catch (e) {
                console.log(`⚠️ Route ${route.path} not accessible: ${e.message}`);
            }
        }

        // 4. Try to access some UI components directly by going back to main page
        await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        // Look for any navigation elements, menus, or UI components
        const navElements = await page.$$('nav, .nav, .navigation, .menu, .sidebar, header, .header');
        if (navElements.length > 0) {
            console.log(`Found ${navElements.length} navigation elements`);
            
            await page.screenshot({ 
                path: path.join(screenshotsDir, '09-nova-ui-with-navigation.png'),
                fullPage: false 
            });
            console.log('✅ 09 - Captured UI with navigation elements');
        }

        // 5. Test responsive design - mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, '10-nova-mobile-view.png'),
            fullPage: false 
        });
        console.log('✅ 10 - Captured mobile responsive view');

        // 6. Test tablet view
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, '11-nova-tablet-view.png'),
            fullPage: false 
        });
        console.log('✅ 11 - Captured tablet responsive view');

        // 7. Back to desktop and capture final state
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, '12-nova-final-desktop-view.png'),
            fullPage: true 
        });
        console.log('✅ 12 - Captured final desktop view');

        console.log('🎉 Comprehensive UI functionality capture completed!');
        
        // List all files
        const files = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
        console.log(`📁 Total ${files.length} screenshots captured:`);
        files.sort().forEach(file => console.log(`  📸 ${file}`));
        
    } catch (error) {
        console.error('❌ Error during screenshot capture:', error);
    } finally {
        await browser.close();
    }
}

captureComprehensiveUIFunctionality().catch(console.error);