const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function captureWorkingSystemScreenshots() {
    console.log('🚀 Capturing comprehensive Nova Universe screenshots...');
    
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
        
        console.log('📸 Testing complete Nova Universe system...');
        
        // 1. Test the UI directly
        await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);
        
        // Capture the actual interface
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'nova-unified-ui-main.png'),
            fullPage: false 
        });
        console.log('✅ Captured Nova Unified UI main interface');
        
        // 2. Check for login/authentication page
        const pageContent = await page.content();
        console.log('Page title:', await page.title());
        
        // Look for authentication elements
        const authElements = await page.$$eval('input', inputs => 
            inputs.map(input => ({ type: input.type, name: input.name, placeholder: input.placeholder }))
        );
        console.log('Found input elements:', authElements);
        
        // 3. Test API endpoints
        console.log('📡 Testing Nova API endpoints...');
        
        // Health check
        await page.goto('http://localhost:3000/api/v1/server-info', { waitUntil: 'networkidle' });
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'nova-api-health-check.png'),
            fullPage: true 
        });
        console.log('✅ Captured API health check');
        
        // API documentation
        try {
            await page.goto('http://localhost:3000/api-docs', { waitUntil: 'networkidle', timeout: 5000 });
            await page.waitForTimeout(1000);
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'nova-api-swagger-docs.png'),
                fullPage: true 
            });
            console.log('✅ Captured API documentation');
        } catch (e) {
            console.log('⚠️  API docs not accessible:', e.message || e);
        }
        
        // 4. Try monitoring endpoints
        try {
            await page.goto('http://localhost:3000/api/v1/monitoring/health', { waitUntil: 'networkidle', timeout: 3000 });
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'nova-monitoring-health.png'),
                fullPage: true 
            });
            console.log('✅ Captured monitoring health');
        } catch (e) {
            console.log('⚠️  Monitoring endpoint not available:', e.message || e);
        }
        
        // 5. Check database status through API
        try {
            await page.goto('http://localhost:3000/api/health', { waitUntil: 'networkidle', timeout: 3000 });
            await page.screenshot({ 
                path: path.join(screenshotsDir, 'nova-system-health.png'),
                fullPage: true 
            });
            console.log('✅ Captured system health');
        } catch (e) {
            console.log('⚠️  Health endpoint not available:', e.message || e);
        }
        
        // 6. Go back to UI and try different routes
        const uiRoutes = ['/', '/login', '/dashboard', '/tickets', '/admin'];
        
        for (const route of uiRoutes) {
            try {
                await page.goto(`http://localhost:3002${route}`, { waitUntil: 'domcontentloaded', timeout: 3000 });
                await page.waitForTimeout(1000);
                
                const routeName = route === '/' ? 'home' : route.slice(1);
                await page.screenshot({ 
                    path: path.join(screenshotsDir, `nova-ui-${routeName}.png`),
                    fullPage: false 
                });
                console.log(`✅ Captured UI route: ${route}`);
            } catch (e) {
                console.log(`⚠️  Route ${route} not accessible: ${e.message}`);
            }
        }
        
        // 7. Capture one full page screenshot of the main UI
        await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        await page.screenshot({ 
            path: path.join(screenshotsDir, 'nova-ui-full-page.png'),
            fullPage: true 
        });
        console.log('✅ Captured full page UI');
        
        console.log('🎉 Comprehensive screenshot capture completed!');
        
        // List all files
        const files = fs.readdirSync(screenshotsDir);
        console.log(`📁 Total ${files.length} screenshots captured:`);
        files.forEach(file => console.log(`  📸 ${file}`));
        
    } catch (error) {
        console.error('❌ Error during screenshot capture:', error);
    } finally {
        await browser.close();
    }
}

captureWorkingSystemScreenshots().catch(console.error);