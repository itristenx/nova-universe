const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
    console.log('🚀 Starting Nova Universe UI screenshot capture...');
    
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
        // Create screenshots directory
        const screenshotsDir = path.join(__dirname, '..', '..', 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        
        console.log('📸 Capturing main Nova Universe interface...');
        
        // Navigate to the unified UI
        await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
        
        // Wait for the page to load
        await page.waitForTimeout(3000);
        
        // Capture main interface
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'nova-universe-working-interface.png'),
            fullPage: true 
        });
        console.log('✅ Captured main interface');
        
        // Check if there's a login form
        const loginForm = await page.$('form');
        if (loginForm) {
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'nova-universe-working-login.png'),
                fullPage: true 
            });
            console.log('✅ Captured login screen');
            
            // Try to fill login form if inputs exist
            const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email"]');
            const passwordInput = await page.$('input[type="password"], input[name="password"]');
            
            if (emailInput) {
                await emailInput.fill('admin@nova.local');
                console.log('✅ Filled email field');
            }
            
            if (passwordInput) {
                await passwordInput.fill('admin123!');
                console.log('✅ Filled password field');
            }
            
            if (emailInput && passwordInput) {
                await page.screenshot({ 
                    path: path.join(screenshotsDir, 'nova-universe-login-with-credentials.png'),
                    fullPage: true 
                });
                console.log('✅ Captured login with credentials');
                
                // Try to submit
                const submitButton = await page.$('button[type="submit"], button:has-text("Continue"), button:has-text("Login"), button:has-text("Sign in")');
                if (submitButton) {
                    await submitButton.click();
                    await page.waitForTimeout(3000);
                    
                    await page.screenshot({ 
                        path: path.join(screenshotsDir, 'nova-universe-dashboard.png'),
                        fullPage: true 
                    });
                    console.log('✅ Captured dashboard after login');
                }
            }
        }
        
        // Also capture the API response
        console.log('📡 Testing API connectivity...');
        
        await page.goto('http://localhost:3000/api/v1/server-info');
        await page.waitForTimeout(1000);
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'nova-api-working-response.png'),
            fullPage: true 
        });
        console.log('✅ Captured API server info');
        
        // Test a few more API endpoints
        await page.goto('http://localhost:3000/api-docs');
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'nova-api-documentation.png'),
            fullPage: true 
        });
        console.log('✅ Captured API documentation');
        
        console.log('🎉 Screenshot capture completed!');
        console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
        
        // List all captured files
        const files = fs.readdirSync(screenshotsDir);
        console.log('📸 Captured files:');
        files.forEach(file => console.log(`  - ${file}`));
        
    } catch (error) {
        console.error('❌ Error during screenshot capture:', error);
    } finally {
        await browser.close();
    }
}

// Run the screenshot capture
captureScreenshots().catch(console.error);