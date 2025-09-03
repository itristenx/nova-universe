const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function captureAuthenticatedUIFunctionality() {
    console.log('🚀 Capturing authenticated Nova Universe UI functionality...');
    
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
        
        console.log('📸 Setting up authenticated session...');
        
        // Navigate to the app
        await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);
        
        // Mock authentication by setting localStorage
        const mockUser = {
            id: 'demo-user-001',
            email: 'demo@nova.com',
            firstName: 'Nova',
            lastName: 'Demo',
            displayName: 'Nova Demo User',
            roles: [{ id: 'admin', name: 'Admin', description: 'Administrator', permissions: [] }],
            permissions: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            preferences: {
                theme: 'system',
                language: 'en',
                timezone: 'UTC',
                notifications: {
                    email: true,
                    push: true,
                    slack: false,
                    sms: false,
                    inApp: true,
                    frequency: 'immediate'
                },
                dashboard: {
                    layout: 'grid',
                    widgets: [],
                    refreshInterval: 30000
                }
            }
        };

        const authState = {
            state: {
                user: mockUser,
                isAuthenticated: true,
                isLoading: false,
                error: null
            },
            version: 1
        };

        // Set authentication state in localStorage
        await page.evaluate((authData) => {
            localStorage.setItem('auth-storage', JSON.stringify(authData));
            localStorage.setItem('nova-auth-token', 'demo-token-12345');
        }, authState);

        // 1. Capture the main login page first
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'functional-01-login-screen.png'),
            fullPage: false 
        });
        console.log('✅ 01 - Captured login screen');

        // 2. Reload to trigger auth check
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        await page.screenshot({ 
            path: path.join(screenshotsDir, 'functional-02-after-auth-reload.png'),
            fullPage: false 
        });
        console.log('✅ 02 - Captured after authentication');

        // 3. Navigate to dashboard
        try {
            await page.goto('http://localhost:3002/dashboard', { 
                waitUntil: 'domcontentloaded', 
                timeout: 10000 
            });
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'functional-03-dashboard-main.png'),
                fullPage: false 
            });
            console.log('✅ 03 - Captured dashboard main view');

            // Take a full page dashboard screenshot
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'functional-04-dashboard-full.png'),
                fullPage: true 
            });
            console.log('✅ 04 - Captured full dashboard page');

            // Look for interactive elements
            const interactiveElements = await page.$$('.card, .quick-action, button:not([disabled]), .dashboard-widget, [class*="action"], [role="button"]');
            console.log(`Found ${interactiveElements.length} interactive dashboard elements`);

            if (interactiveElements.length > 0) {
                await page.screenshot({ 
                    path: path.join(screenshotsDir, 'functional-05-dashboard-interactive.png'),
                    fullPage: false 
                });
                console.log('✅ 05 - Captured dashboard with interactive elements');
            }

        } catch (e) {
            console.log('⚠️ Dashboard access issue:', e.message);
        }

        // 4. Navigate to tickets page
        try {
            await page.goto('http://localhost:3002/tickets', { 
                waitUntil: 'domcontentloaded', 
                timeout: 10000 
            });
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'functional-06-tickets-list.png'),
                fullPage: false 
            });
            console.log('✅ 06 - Captured tickets list page');

            // Look for tickets table or list
            const ticketsList = await page.$('.tickets-table, .ticket-list, table, .data-table, [class*="table"], [class*="list"]');
            if (ticketsList) {
                await page.screenshot({ 
                    path: path.join(screenshotsDir, 'functional-07-tickets-with-data.png'),
                    fullPage: false 
                });
                console.log('✅ 07 - Captured tickets with data view');
            }

        } catch (e) {
            console.log('⚠️ Tickets page access issue:', e.message);
        }

        // 5. Navigate to ticket creation
        try {
            await page.goto('http://localhost:3002/tickets/create', { 
                waitUntil: 'domcontentloaded', 
                timeout: 10000 
            });
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'functional-08-create-ticket-form.png'),
                fullPage: false 
            });
            console.log('✅ 08 - Captured create ticket form');

            // Try to fill out the form
            try {
                const titleInput = await page.$('input[name*="title"], input[placeholder*="title"], #title, [data-testid*="title"]');
                if (titleInput) {
                    await titleInput.fill('Demo Support Request - UI Testing');
                    await page.waitForTimeout(500);
                }

                const typeSelect = await page.$('select[name*="type"], [name*="category"], [data-testid*="type"]');
                if (typeSelect) {
                    await typeSelect.selectOption({ index: 1 });
                    await page.waitForTimeout(500);
                }

                const prioritySelect = await page.$('select[name*="priority"], [data-testid*="priority"]');
                if (prioritySelect) {
                    await prioritySelect.selectOption({ index: 2 });
                    await page.waitForTimeout(500);
                }

                const descriptionArea = await page.$('textarea[name*="description"], textarea[placeholder*="description"], #description, [data-testid*="description"]');
                if (descriptionArea) {
                    await descriptionArea.fill('This is a comprehensive demo ticket showing Nova Universe\'s full ITSM capabilities including:\n\n- Ticket creation workflow\n- Priority and category selection\n- Rich text description\n- File attachment support\n- Assignment management\n\nThe system is working correctly with live API integration.');
                    await page.waitForTimeout(500);
                }

                await page.screenshot({ 
                    path: path.join(screenshotsDir, 'functional-09-create-ticket-filled.png'),
                    fullPage: false 
                });
                console.log('✅ 09 - Captured filled ticket creation form');

                // Take full page screenshot of the form
                await page.screenshot({ 
                    path: path.join(screenshotsDir, 'functional-10-create-ticket-full.png'),
                    fullPage: true 
                });
                console.log('✅ 10 - Captured full ticket creation form');

            } catch (e) {
                console.log('⚠️ Form filling issue:', e.message);
            }

        } catch (e) {
            console.log('⚠️ Create ticket page access issue:', e.message);
        }

        // 6. Navigate to admin page
        try {
            await page.goto('http://localhost:3002/admin', { 
                waitUntil: 'domcontentloaded', 
                timeout: 10000 
            });
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'functional-11-admin-panel.png'),
                fullPage: false 
            });
            console.log('✅ 11 - Captured admin panel');

        } catch (e) {
            console.log('⚠️ Admin page access issue:', e.message);
        }

        // 7. Test navigation and sidebar
        await page.goto('http://localhost:3002/dashboard', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // Look for navigation elements
        const sidebar = await page.$('.sidebar, nav, .navigation, .nav-menu, [class*="sidebar"], [class*="nav"]');
        if (sidebar) {
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'functional-12-navigation-sidebar.png'),
                fullPage: false 
            });
            console.log('✅ 12 - Captured navigation sidebar');
        }

        // 8. Test responsive views
        console.log('📱 Testing responsive design...');

        // Mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'functional-13-mobile-dashboard.png'),
            fullPage: false 
        });
        console.log('✅ 13 - Captured mobile dashboard view');

        // Tablet view
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'functional-14-tablet-dashboard.png'),
            fullPage: false 
        });
        console.log('✅ 14 - Captured tablet dashboard view');

        // Back to desktop
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.waitForTimeout(1000);

        // 9. Test user profile/settings if accessible
        try {
            await page.goto('http://localhost:3002/profile', { 
                waitUntil: 'domcontentloaded', 
                timeout: 5000 
            });
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'functional-15-user-profile.png'),
                fullPage: false 
            });
            console.log('✅ 15 - Captured user profile page');

        } catch (e) {
            console.log('⚠️ Profile page not accessible');
        }

        // 10. Final comprehensive view
        await page.goto('http://localhost:3002/dashboard', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'functional-16-final-comprehensive.png'),
            fullPage: true 
        });
        console.log('✅ 16 - Captured final comprehensive view');

        console.log('🎉 Authenticated UI functionality capture completed!');
        
        // List all functional screenshots
        const files = fs.readdirSync(screenshotsDir)
            .filter(f => f.startsWith('functional-') && f.endsWith('.png'));
        console.log(`📁 Total ${files.length} functional screenshots captured:`);
        files.sort().forEach(file => console.log(`  📸 ${file}`));
        
    } catch (error) {
        console.error('❌ Error during authenticated screenshot capture:', error);
    } finally {
        await browser.close();
    }
}

captureAuthenticatedUIFunctionality().catch(console.error);